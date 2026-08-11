/**
 * Escritor idempotente sobre el documento del cliente.
 *
 * La API de hojas de calculo NO tiene una operacion de insertar o actualizar segun clave.
 * Agregar al final siempre agrega al final, que es exactamente la duplicacion que SHEET-06
 * prohibe. Asi que el upsert se construye: leer la columna clave, diferenciar contra el
 * conjunto deseado y escribir en una sola llamada por lotes.
 *
 * Todo esta parametrizado por tab. La fila de encabezados, la orientacion y la columna clave
 * salen del modelo declarativo, nunca del codigo, que es lo que permite que las fases 13, 14 y
 * 15 lo reutilicen para los otros tabs sin tocar este archivo.
 *
 * Dos detalles que fallan en silencio si se hacen mal:
 *
 *   - El modo de entrada de valores es LITERAL y nunca el que simula tecleo humano. Ese ultimo
 *     reinterpreta segun la configuracion regional: convierte un decimal en fecha, parte
 *     numeros con separador de miles y evalua cualquier texto que empiece con signo igual.
 *   - Los indices de borrado son base cero con final exclusivo, y cada eliminacion corre lo que
 *     esta despues. Por eso los bloques van ordenados de mayor a menor. Al reves elimina cosas
 *     arbitrarias sin lanzar ninguna excepcion.
 */

import { CliError } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { describeSheetsError, quoteTab } from "./client.js";
import type { SheetsSession } from "./client.js";
import {
  columnIndexFromLetter,
  columnLetterFromIndex,
  createGoogleGateway,
  loadTabSchema,
  scanColumnReferences,
  trimHeader,
  type ColumnScanResult,
  type ScanTarget,
  type SpreadsheetGateway,
  type TabModel,
} from "./schema.js";

// ---------------------------------------------------------------------------
// Tipos del puerto de escritura
// ---------------------------------------------------------------------------

export type CellValue = string | number | null;

/**
 * Unico modo de entrada admitido, y esta en el tipo a proposito.
 *
 * El modo que simula tecleo humano no es representable en este tipo, asi que no hay forma de
 * pedirlo por accidente. Su nombre tampoco aparece escrito en ningun archivo de src/, que es
 * lo que verifica el criterio de aceptacion del plan.
 */
export type ValueInputOption = "RAW";

export interface ValueUpdate {
  readonly range: string;
  readonly values: CellValue[][];
}

/** Indices base cero con final exclusivo, que es lo que pide la API. */
export interface DeleteBlock {
  readonly startIndex: number;
  readonly endIndex: number;
}

export interface WriteGateway extends SpreadsheetGateway {
  /** Una sola columna, desde `fromRow` hasta el fondo de la grilla. */
  readColumn(tabTitle: string, letter: string, fromRow: number): Promise<string[]>;
  /** El bloque de datos completo, desde `fromRow` hasta el fondo y hasta `lastColumn`. */
  readRegion(tabTitle: string, fromRow: number, lastColumn: string): Promise<string[][]>;
  growGrid(sheetId: number, extraRows: number): Promise<void>;
  writeValues(
    updates: readonly ValueUpdate[],
    valueInputOption: ValueInputOption,
  ): Promise<void>;
  deleteRows(sheetId: number, blocks: readonly DeleteBlock[]): Promise<void>;
  deleteColumns(sheetId: number, blocks: readonly DeleteBlock[]): Promise<void>;
}

/**
 * Tope de celdas por peticion.
 *
 * El universo real son 5716 filas por ~21 columnas, unas 120.000 celdas. La API recomienda
 * mantener el cuerpo por debajo de 2 MB; a ~20 bytes por celda, 50.000 celdas son cerca de
 * 1 MB, con margen de sobra. Lo que importa no es el numero exacto sino que la cantidad de
 * llamadas no crezca con la cantidad de filas.
 */
const MAX_CELLS_PER_REQUEST = 50_000;

/** Caracteres que el documento evaluaria como formula al abrirlo. */
const FORMULA_STARTERS = ["=", "+", "-", "@"];

// ---------------------------------------------------------------------------
// Utilidades puras
// ---------------------------------------------------------------------------

/**
 * Prepara un valor para la celda.
 *
 * Los numeros viajan como numeros para que el documento no reinterprete un decimal ni parta
 * un numero con separador de miles. El texto que empieza con signo igual, mas, menos o arroba
 * se prefija con apostrofo: el modo literal ya lo evita, pero la defensa en profundidad contra
 * la ejecucion de contenido como formula cuesta tres lineas.
 */
export function sanitizeCell(value: unknown): string | number {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";

  const text = typeof value === "string" ? value : String(value);
  if (text === "") return "";
  return FORMULA_STARTERS.includes(text.charAt(0)) ? `'${text}` : text;
}

/** Resuelve una ruta con puntos dentro de un registro del dataset. */
export function readFieldPath(record: unknown, path: string): unknown {
  let current: unknown = record;
  for (const segment of path.split(".")) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

export interface ColumnRun {
  readonly start: number;
  readonly end: number;
}

/**
 * Agrupa indices de columna contiguos.
 *
 * Es lo que permite escribir SOLO las columnas propias sin pisar las de otras fases: cada
 * tramo se escribe con su propio rango y los huecos quedan intactos.
 */
export function columnRuns(indices: readonly number[]): ColumnRun[] {
  const sorted = [...new Set(indices)].sort((a, b) => a - b);
  const runs: ColumnRun[] = [];

  for (const index of sorted) {
    const last = runs[runs.length - 1];
    if (last !== undefined && index === last.end + 1) {
      runs[runs.length - 1] = { start: last.start, end: index };
      continue;
    }
    runs.push({ start: index, end: index });
  }
  return runs;
}

/**
 * Agrupa indices contiguos en bloques y los devuelve DE MAYOR A MENOR.
 *
 * El orden no es cosmetico: cada eliminacion corre lo que esta despues, asi que procesar de
 * arriba hacia abajo invalida todos los indices siguientes del mismo lote.
 */
export function contiguousBlocks(indices: readonly number[]): DeleteBlock[] {
  const sorted = [...new Set(indices)].sort((a, b) => a - b);
  const blocks: DeleteBlock[] = [];

  for (const index of sorted) {
    const last = blocks[blocks.length - 1];
    if (last !== undefined && index === last.endIndex) {
      blocks[blocks.length - 1] = { startIndex: last.startIndex, endIndex: index + 1 };
      continue;
    }
    blocks.push({ startIndex: index, endIndex: index + 1 });
  }

  return blocks.reverse();
}

function rangeFor(tabTitle: string, run: ColumnRun, firstRow: number, lastRow: number): string {
  const from = `${columnLetterFromIndex(run.start)}${firstRow}`;
  const to = `${columnLetterFromIndex(run.end)}${lastRow}`;
  return `${quoteTab(tabTitle)}!${from}:${to}`;
}

/** Parte la lista de rangos en lotes que no superen el tope de celdas por peticion. */
export function chunkUpdates(
  updates: readonly ValueUpdate[],
  maxCells: number,
): ValueUpdate[][] {
  const chunks: ValueUpdate[][] = [];
  let current: ValueUpdate[] = [];
  let cells = 0;

  for (const update of updates) {
    const size = update.values.length * (update.values[0]?.length ?? 0);
    if (current.length > 0 && cells + size > maxCells) {
      chunks.push(current);
      current = [];
      cells = 0;
    }
    current.push(update);
    cells += size;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

// ---------------------------------------------------------------------------
// Upsert
// ---------------------------------------------------------------------------

export interface UpsertOptions {
  readonly addMissingColumns?: boolean;
  readonly dryRun?: boolean;
  readonly maxCellsPerRequest?: number;
}

export interface DuplicadoPreexistente {
  readonly clave: string;
  readonly filas: number[];
}

export interface UpsertSummary {
  readonly actualizadas: number;
  readonly insertadas: number;
  readonly columnasAgregadas: number;
  readonly duplicadosPreexistentes: DuplicadoPreexistente[];
  /** Claves que venian repetidas en el propio dataset. Gana la ultima. */
  readonly duplicadosEnDataset: string[];
  readonly llamadasDeRed: number;
  readonly primeraFilaDeDatos: number;
  readonly primeraFilaDeDatosIndice: number;
  readonly filasEnGrilla: number;
}

interface FilaObjetivo {
  readonly row: number;
  readonly cells: Map<number, string | number>;
}

/**
 * Carga un conjunto de registros en un tab, actualizando lo que ya existe en lugar de
 * duplicarlo. Es el corazon de SHEET-06.
 */
export async function upsertRows(
  gateway: WriteGateway,
  tab: TabModel,
  records: readonly Record<string, unknown>[],
  options: UpsertOptions = {},
): Promise<UpsertSummary> {
  const maxCells = options.maxCellsPerRequest ?? MAX_CELLS_PER_REQUEST;
  let llamadas = 0;

  // Paso 1 y 2. Metadatos y validacion del tab. Son dos llamadas.
  const schema = await loadTabSchema(gateway, tab, {
    addMissingColumns: options.addMissingColumns === true,
  });
  llamadas += 2;

  const headerRow = schema.tab.headerRow as number;
  const sheetId = schema.metadata.sheetId;

  // Los encabezados nuevos se escriben ANTES que los datos, o las columnas quedarian sin
  // nombre. Van contiguos por construccion.
  if (schema.added.length > 0 && options.dryRun !== true) {
    const primero = schema.added[0] as { index: number };
    const ultimo = schema.added[schema.added.length - 1] as { index: number };
    await gateway.writeValues(
      [
        {
          range: rangeFor(tab.sheetTitle, { start: primero.index, end: ultimo.index }, headerRow, headerRow),
          values: [schema.added.map((a) => a.header)],
        },
      ],
      "RAW",
    );
    llamadas += 1;
  }

  if (tab.keyHeader === null) {
    throw new CliError(`El tab "${tab.sheetTitle}" no declara columna clave y no admite upsert.`);
  }
  const keyColumn = schema.byHeader.get(trimHeader(tab.keyHeader));
  if (keyColumn === undefined) {
    throw new CliError(
      `No se encontro la columna clave ${JSON.stringify(tab.keyHeader)} en "${tab.sheetTitle}".`,
    );
  }

  // Paso 3. Solo la columna clave, desde la fila siguiente a la de encabezados hacia abajo.
  // Una sola lectura, aunque sean miles de filas.
  const keyValues = await gateway.readColumn(tab.sheetTitle, keyColumn.letter, schema.firstDataRow);
  llamadas += 1;

  const indice = new Map<string, number>();
  const vistas = new Map<string, number[]>();
  let ultimaOcupada = headerRow;

  keyValues.forEach((raw, offset) => {
    if (raw.trim() === "") return;
    const row = schema.firstDataRow + offset;
    ultimaOcupada = Math.max(ultimaOcupada, row);
    const clave = normalizeKeyword(raw);
    if (clave === "") return;
    if (!indice.has(clave)) indice.set(clave, row);
    vistas.set(clave, [...(vistas.get(clave) ?? []), row]);
  });

  const duplicadosPreexistentes: DuplicadoPreexistente[] = [...vistas.entries()]
    .filter(([, filas]) => filas.length > 1)
    .map(([clave, filas]) => ({ clave, filas }));

  // Columnas que esta fase escribe. El resto del tab no se toca ni con un valor vacio.
  //
  // `fase-13` entra desde el plan 13-01: es lo que habilita `Cluster` y `Top Result`. Lo que
  // NO puede entrar nunca es `fase-14` (`URL`) ni `fase-15` (`Suggested H1`); ampliar esta
  // lista de mas haria que la carga pise columnas de fases que todavia no corrieron, y como
  // el escritor coalesce indices contiguos en rangos, bastaria con que una columna ajena
  // quedara en medio de dos propias para que se sobreescribiera sin lanzar nada (T-13-02).
  const propias = [...schema.byHeader.values()].filter(
    (c) =>
      c.status === "fase-12" ||
      c.status === "no-consultado" ||
      c.status === "nueva" ||
      c.status === "fase-13",
  );
  const runs = columnRuns(propias.map((c) => c.index));

  // Deduplicacion del propio dataset: dos escrituras de la misma keyword, una con tildes y
  // otra sin ellas, resuelven a la misma clave y por tanto a la misma fila. Gana la ultima.
  const deseados = new Map<string, Record<string, unknown>>();
  const duplicadosEnDataset: string[] = [];
  const keySource = tab.keyField ?? "keyword";

  for (const record of records) {
    const rawKey = readFieldPath(record, keyColumn.source ?? keySource);
    const clave = normalizeKeyword(typeof rawKey === "string" ? rawKey : String(rawKey ?? ""));
    if (clave === "") continue;
    if (deseados.has(clave)) duplicadosEnDataset.push(clave);
    deseados.set(clave, record);
  }

  const actualizaciones: FilaObjetivo[] = [];
  const inserciones: FilaObjetivo[] = [];
  let proximaLibre = ultimaOcupada + 1;

  for (const [clave, record] of deseados) {
    const cells = new Map<number, string | number>();
    for (const column of propias) {
      const value =
        column.literal !== undefined
          ? column.literal
          : column.source === null
            ? ""
            : readFieldPath(record, column.source);
      cells.set(column.index, sanitizeCell(value));
    }

    const existente = indice.get(clave);
    if (existente !== undefined) actualizaciones.push({ row: existente, cells });
    else inserciones.push({ row: proximaLibre++, cells });
  }

  const summaryBase = {
    actualizadas: actualizaciones.length,
    insertadas: inserciones.length,
    columnasAgregadas: schema.added.length,
    duplicadosPreexistentes,
    duplicadosEnDataset,
    primeraFilaDeDatos: schema.firstDataRow,
    primeraFilaDeDatosIndice: schema.firstDataRow - 1,
  };

  if (options.dryRun === true) {
    return { ...summaryBase, llamadasDeRed: llamadas, filasEnGrilla: schema.metadata.rowCount };
  }

  // Paso 5. Si las inserciones superan la grilla, crecerla de forma EXPLICITA antes de
  // escribir: asi los indices quedan deterministas, cosa que agregar al final no garantiza.
  const necesarias = proximaLibre - 1;
  let filasEnGrilla = schema.metadata.rowCount;
  if (necesarias > filasEnGrilla) {
    await gateway.growGrid(sheetId, necesarias - filasEnGrilla);
    llamadas += 1;
    filasEnGrilla = necesarias;
  }

  // Paso 6. Una sola llamada por lotes, con las filas contiguas coalescidas en un rango.
  const objetivos = [...actualizaciones, ...inserciones].sort((a, b) => a.row - b.row);
  const updates: ValueUpdate[] = [];

  let bloque: FilaObjetivo[] = [];
  const emitir = (): void => {
    if (bloque.length === 0) return;
    const primera = (bloque[0] as FilaObjetivo).row;
    const ultima = (bloque[bloque.length - 1] as FilaObjetivo).row;
    for (const run of runs) {
      updates.push({
        range: rangeFor(tab.sheetTitle, run, primera, ultima),
        values: bloque.map((fila) => {
          const row: CellValue[] = [];
          for (let i = run.start; i <= run.end; i += 1) row.push(fila.cells.get(i) ?? "");
          return row;
        }),
      });
    }
    bloque = [];
  };

  for (const objetivo of objetivos) {
    const previa = bloque[bloque.length - 1];
    if (previa !== undefined && objetivo.row !== previa.row + 1) emitir();
    bloque.push(objetivo);
  }
  emitir();

  for (const chunk of chunkUpdates(updates, maxCells)) {
    await gateway.writeValues(chunk, "RAW");
    llamadas += 1;
  }

  return { ...summaryBase, llamadasDeRed: llamadas, filasEnGrilla };
}

// ---------------------------------------------------------------------------
// Borrado de filas residuales
// ---------------------------------------------------------------------------

export interface ResidualRow {
  readonly fila: number;
  /** Clave normalizada leida de la columna clave. Vacia si la fila no tiene clave. */
  readonly clave: string;
  /** Muestra del contenido, para que el reporte diga que se va a borrar. */
  readonly muestra: string;
}

export interface ResidualReport {
  readonly filas: ResidualRow[];
  readonly eliminadas: number;
  readonly llamadasDeRed: number;
}

export interface ResidualOptions {
  readonly dryRun?: boolean;
}

/**
 * Encuentra y opcionalmente elimina las filas que sobran.
 *
 * Dos clases de residuo caen aca. Las de plantilla, que tienen contenido pero ninguna clave,
 * y las de datos, cuya clave ya no esta en el conjunto deseado.
 *
 * No usa la validacion completa del tab a proposito: una operacion destructiva no puede
 * depender de que el mapeo este entero. Le alcanza con la fila de encabezados y la columna
 * clave.
 */
export async function deleteResidualRows(
  gateway: WriteGateway,
  tab: TabModel,
  desiredKeywords: readonly string[],
  options: ResidualOptions = {},
): Promise<ResidualReport> {
  if (tab.headerRow === null || tab.keyHeader === null) {
    throw new CliError(
      `El tab "${tab.sheetTitle}" no declara fila de encabezados o columna clave: no admite borrado de filas.`,
    );
  }
  let llamadas = 0;

  const tabs = await gateway.fetchTabs();
  llamadas += 1;
  const metadata = tabs.find((t) => t.title === tab.sheetTitle);
  if (metadata === undefined) {
    throw new CliError(
      `El tab "${tab.sheetTitle}" no existe en el documento.\n` +
        `  Tabs que si existen: ${tabs.map((t) => JSON.stringify(t.title)).join(", ")}`,
    );
  }

  const headers = await gateway.readRow(tab.sheetTitle, tab.headerRow);
  llamadas += 1;

  const keyIndex = headers.findIndex((h) => trimHeader(h) === trimHeader(tab.keyHeader as string));
  if (keyIndex === -1) {
    throw new CliError(
      `No se encontro la columna clave ${JSON.stringify(tab.keyHeader)} en "${tab.sheetTitle}".`,
    );
  }

  const lastColumn = columnLetterFromIndex(Math.max(headers.length - 1, keyIndex));
  const firstDataRow = tab.headerRow + 1;
  const region = await gateway.readRegion(tab.sheetTitle, firstDataRow, lastColumn);
  llamadas += 1;

  const deseadas = new Set(desiredKeywords.map((k) => normalizeKeyword(k)).filter((k) => k !== ""));
  const residuales: ResidualRow[] = [];

  region.forEach((row, offset) => {
    const celdas = row.map((c) => c ?? "");
    if (celdas.every((c) => c.trim() === "")) return;

    const clave = normalizeKeyword(celdas[keyIndex] ?? "");
    if (clave !== "" && deseadas.has(clave)) return;

    const muestra = celdas
      .map((c, i) => (c.trim() === "" ? null : `${columnLetterFromIndex(i)}=${JSON.stringify(c)}`))
      .filter((x) => x !== null)
      .join(" ");

    residuales.push({ fila: firstDataRow + offset, clave, muestra });
  });

  if (options.dryRun !== false || residuales.length === 0) {
    return { filas: residuales, eliminadas: 0, llamadasDeRed: llamadas };
  }

  await gateway.deleteRows(
    metadata.sheetId,
    contiguousBlocks(residuales.map((r) => r.fila - 1)),
  );
  llamadas += 1;

  return { filas: residuales, eliminadas: residuales.length, llamadasDeRed: llamadas };
}

// ---------------------------------------------------------------------------
// Borrado guardado de columnas muertas
// ---------------------------------------------------------------------------

export interface DeadColumnReport {
  /** Encabezados que se eliminarian, de mayor a menor indice. */
  readonly planeadas: string[];
  readonly eliminadas: string[];
  readonly escaneo: ColumnScanResult[];
  readonly abortado: boolean;
  readonly exitCode: number;
  readonly llamadasDeRed: number;
}

export interface DeadColumnOptions {
  readonly dryRun?: boolean;
}

/**
 * Elimina las columnas muertas de la plantilla, y solo si el escaneo de referencias sale
 * limpio.
 *
 * La secuencia es obligatoria y es la condicion que Juan puso para autorizar el borrado:
 * primero el escaneo, y si devuelve CUALQUIER mencion se aborta sin eliminar nada e imprime
 * donde aparece. No hay bandera de fuerza que permita saltarlo, y ninguna combinacion de
 * banderas cambia eso.
 */
export async function deleteDeadColumns(
  gateway: WriteGateway,
  tab: TabModel,
  options: DeadColumnOptions = {},
): Promise<DeadColumnReport> {
  if (tab.headerRow === null) {
    throw new CliError(
      `El tab "${tab.sheetTitle}" no declara fila de encabezados: no admite borrado de columnas.`,
    );
  }
  let llamadas = 0;

  const tabs = await gateway.fetchTabs();
  llamadas += 1;
  const metadata = tabs.find((t) => t.title === tab.sheetTitle);
  if (metadata === undefined) {
    throw new CliError(`El tab "${tab.sheetTitle}" no existe en el documento.`);
  }

  const headers = await gateway.readRow(tab.sheetTitle, tab.headerRow);
  llamadas += 1;

  const targets: ScanTarget[] = [];
  for (const column of tab.columns) {
    if (column.status !== "eliminar") continue;
    const index = headers.findIndex((h) => trimHeader(h) === trimHeader(column.header));
    if (index === -1) continue; // Ya no esta: nada que borrar.
    targets.push({
      tabTitle: tab.sheetTitle,
      header: column.header,
      letter: columnLetterFromIndex(index),
    });
  }

  if (targets.length === 0) {
    return { planeadas: [], eliminadas: [], escaneo: [], abortado: false, exitCode: 0, llamadasDeRed: llamadas };
  }

  // La precondicion. Es de solo lectura y es lo unico que decide si el borrado puede correr.
  const escaneo = await scanColumnReferences(gateway, targets);
  llamadas += 3;

  const bloqueadas = escaneo.filter((r) => !r.safeToDelete);
  if (bloqueadas.length > 0) {
    return {
      planeadas: [],
      eliminadas: [],
      escaneo,
      abortado: true,
      exitCode: 1,
      llamadasDeRed: llamadas,
    };
  }

  const porIndice = targets
    .map((t) => ({ header: t.header, index: columnIndexFromLetter(t.letter) }))
    .sort((a, b) => b.index - a.index);

  if (options.dryRun !== false) {
    return {
      planeadas: porIndice.map((c) => c.header),
      eliminadas: [],
      escaneo,
      abortado: false,
      exitCode: 0,
      llamadasDeRed: llamadas,
    };
  }

  await gateway.deleteColumns(metadata.sheetId, contiguousBlocks(porIndice.map((c) => c.index)));
  llamadas += 1;

  return {
    planeadas: porIndice.map((c) => c.header),
    eliminadas: porIndice.map((c) => c.header),
    escaneo,
    abortado: false,
    exitCode: 0,
    llamadasDeRed: llamadas,
  };
}

// ---------------------------------------------------------------------------
// Puerto real sobre la sesion autenticada
// ---------------------------------------------------------------------------

export function createGoogleWriteGateway(session: SheetsSession): WriteGateway {
  const base = createGoogleGateway(session);
  const { spreadsheetId } = session.config;

  const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      throw new CliError(describeSheetsError(error, spreadsheetId));
    }
  };

  const asText = (cell: unknown): string =>
    cell === null || cell === undefined ? "" : typeof cell === "string" ? cell : String(cell);

  return {
    ...base,

    async readColumn(tabTitle, letter, fromRow) {
      const range = `${quoteTab(tabTitle)}!${letter}${fromRow}:${letter}`;
      const res = await wrap(() =>
        session.sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
          majorDimension: "COLUMNS",
        }),
      );
      return (((res.data.values ?? [])[0] ?? []) as unknown[]).map(asText);
    },

    async readRegion(tabTitle, fromRow, lastColumn) {
      const range = `${quoteTab(tabTitle)}!A${fromRow}:${lastColumn}`;
      const res = await wrap(() =>
        session.sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
          majorDimension: "ROWS",
        }),
      );
      return ((res.data.values ?? []) as unknown[][]).map((row) => (row ?? []).map(asText));
    },

    async growGrid(sheetId, extraRows) {
      await wrap(() =>
        session.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{ appendDimension: { sheetId, dimension: "ROWS", length: extraRows } }],
          },
        }),
      );
    },

    async writeValues(updates, valueInputOption) {
      await wrap(() =>
        session.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption,
            data: updates.map((u) => ({ range: u.range, values: u.values })),
          },
        }),
      );
    },

    async deleteRows(sheetId, blocks) {
      await wrap(() =>
        session.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: blocks.map((b) => ({
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: "ROWS",
                  startIndex: b.startIndex,
                  endIndex: b.endIndex,
                },
              },
            })),
          },
        }),
      );
    },

    async deleteColumns(sheetId, blocks) {
      await wrap(() =>
        session.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: blocks.map((b) => ({
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: "COLUMNS",
                  startIndex: b.startIndex,
                  endIndex: b.endIndex,
                },
              },
            })),
          },
        }),
      );
    },
  };
}
