/**
 * Modelo del documento del cliente: forma real de cada tab, resolucion de columnas y
 * escaneo de referencias.
 *
 * Tres cosas que el reconocimiento del 2026-08-10 dejo probadas y que este modulo asume
 * como punto de partida, porque un escritor que asuma lo comodo no encuentra ni una columna:
 *
 *   1. La fila 1 de cada tab es un banner decorativo. Los encabezados estan en la 2 o en la 3
 *      segun el tab, asi que la fila de encabezados es un DATO POR TAB y nunca una constante.
 *   2. Varios encabezados reales llevan espacio final, asi que la comparacion recorta los dos
 *      lados. Recorta espacios y nada mas: no ignora mayusculas ni tildes, porque la plantilla
 *      manda sobre el nombre exacto.
 *   3. Hay dos formas de tab. Una orientada a filas, un registro por fila, y una orientada a
 *      columnas, un registro por columna. Escribir filas en un tab transpuesto lo corrompe sin
 *      lanzar ninguna excepcion, asi que el rechazo es explicito.
 *
 * Todo lo que este modulo hace contra el documento es de SOLO LECTURA.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { columnLetter, describeSheetsError, quoteTab } from "./client.js";
import type { SheetsSession } from "./client.js";

// ---------------------------------------------------------------------------
// Modelo declarativo
// ---------------------------------------------------------------------------

export const COLUMN_STATUSES = [
  "fase-12",
  "no-consultado",
  "fase-13",
  "fase-14",
  "fase-15",
  "nueva",
  "eliminar",
  "sin-uso",
] as const;

export type ColumnStatus = (typeof COLUMN_STATUSES)[number];

/**
 * Estados que obligan a que la columna exista o se cree.
 *
 * Los demas son declarativos: si el documento no los trae, no es un error. En particular
 * `eliminar` nunca se agrega, porque despues del borrado de J-4 esas columnas dejan de estar
 * y volver a crearlas seria deshacer justo lo que Juan autorizo.
 */
const REQUIRED_STATUSES: ReadonlySet<ColumnStatus> = new Set<ColumnStatus>([
  "fase-12",
  "no-consultado",
  "nueva",
]);

export type Orientation = "filas" | "columnas";
export type MapBy = "nombre" | "posicion";

export interface ColumnModel {
  /** Encabezado real TAL CUAL esta en el documento, con espacio final si lo lleva. */
  readonly header: string;
  /** Campo interno del dataset que llena la columna. null si nadie la llena. */
  readonly field: string | null;
  readonly status: ColumnStatus;
  /** Valor literal a escribir cuando el estado es `no-consultado`. */
  readonly literal?: string;
  readonly note?: string;
}

export interface TabModel {
  /** Nombre real del tab. Nunca el texto del banner de la fila 1. */
  readonly sheetTitle: string;
  readonly sheetId?: number;
  /** Fila de encabezados en numeracion de Sheet, base 1. null si el tab no tiene. */
  readonly headerRow: number | null;
  readonly orientation: Orientation;
  readonly mapBy: MapBy;
  readonly keyField: string | null;
  readonly keyHeader: string | null;
  readonly writtenBy?: number;
  readonly note?: string;
  readonly columns: readonly ColumnModel[];
}

export interface SheetModel {
  readonly meta: Record<string, unknown>;
  readonly tabs: Readonly<Record<string, TabModel>>;
}

const DEFAULT_MODEL_PATH = path.join(SEO_TOOLS_ROOT, "data", "sheet-columns.json");

function badModel(detail: string): never {
  throw new CliError(
    `El modelo de columnas es invalido.\n  ${detail}\n` +
      `  Archivo: ${DEFAULT_MODEL_PATH}`,
  );
}

function parseTabModel(key: string, raw: unknown): TabModel {
  if (typeof raw !== "object" || raw === null) badModel(`El tab "${key}" no es un objeto.`);
  const o = raw as Record<string, unknown>;

  const sheetTitle = o["sheetTitle"];
  if (sheetTitle !== key) {
    badModel(`El tab "${key}" declara sheetTitle "${String(sheetTitle)}", que no coincide con su clave.`);
  }

  const orientation = o["orientation"];
  if (orientation !== "filas" && orientation !== "columnas") {
    badModel(`El tab "${key}" declara una orientacion desconocida: ${String(orientation)}.`);
  }

  const mapBy = o["mapBy"];
  if (mapBy !== "nombre" && mapBy !== "posicion") {
    badModel(`El tab "${key}" declara un modo de mapeo desconocido: ${String(mapBy)}.`);
  }

  const headerRow = o["headerRow"];
  if (headerRow !== null && typeof headerRow !== "number") {
    badModel(`El tab "${key}" declara una fila de encabezados que no es numero ni null.`);
  }
  if (orientation === "filas" && headerRow === null) {
    badModel(`El tab "${key}" esta orientado a filas y tiene que declarar su fila de encabezados.`);
  }

  const rawColumns = o["columns"];
  if (!Array.isArray(rawColumns)) badModel(`El tab "${key}" no declara un arreglo de columnas.`);

  const columns: ColumnModel[] = rawColumns.map((entry, i) => {
    if (typeof entry !== "object" || entry === null) {
      badModel(`El tab "${key}" tiene una columna invalida en la posicion ${i}.`);
    }
    const c = entry as Record<string, unknown>;
    const header = c["header"];
    const field = c["field"];
    const status = c["status"];
    if (typeof header !== "string") badModel(`El tab "${key}", columna ${i}: falta el encabezado.`);
    if (field !== null && typeof field !== "string") {
      badModel(`El tab "${key}", columna ${i}: el campo tiene que ser texto o null.`);
    }
    if (typeof status !== "string" || !(COLUMN_STATUSES as readonly string[]).includes(status)) {
      badModel(`El tab "${key}", columna ${i}: estado desconocido ${String(status)}.`);
    }
    const model: ColumnModel = {
      header,
      field: field as string | null,
      status: status as ColumnStatus,
      ...(typeof c["literal"] === "string" ? { literal: c["literal"] } : {}),
      ...(typeof c["note"] === "string" ? { note: c["note"] } : {}),
    };
    return model;
  });

  return {
    sheetTitle: key,
    ...(typeof o["sheetId"] === "number" ? { sheetId: o["sheetId"] } : {}),
    headerRow: headerRow as number | null,
    orientation,
    mapBy,
    keyField: typeof o["keyField"] === "string" ? o["keyField"] : null,
    keyHeader: typeof o["keyHeader"] === "string" ? o["keyHeader"] : null,
    ...(typeof o["writtenBy"] === "number" ? { writtenBy: o["writtenBy"] } : {}),
    ...(typeof o["note"] === "string" ? { note: o["note"] } : {}),
    columns,
  };
}

/**
 * Carga el modelo declarativo. Las claves de primer nivel son nombres reales de tab; las que
 * empiezan con guion bajo son metadatos y no describen ningun tab.
 */
export async function loadSheetModel(filePath: string = DEFAULT_MODEL_PATH): Promise<SheetModel> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer el modelo de columnas.\n  Ruta: ${filePath}\n` +
        `  Accion: verificar que seo-tools/data/sheet-columns.json exista y este commiteado.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new CliError(`El modelo de columnas no es JSON valido.\n  Detalle: ${String(error)}`);
  }
  if (typeof parsed !== "object" || parsed === null) badModel("La raiz no es un objeto.");

  const meta: Record<string, unknown> = {};
  const tabs: Record<string, TabModel> = {};

  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (key.startsWith("_")) {
      meta[key] = value;
      continue;
    }
    tabs[key] = parseTabModel(key, value);
  }

  return { meta, tabs };
}

// ---------------------------------------------------------------------------
// Utilidades de columna
// ---------------------------------------------------------------------------

/**
 * Letra de notacion A1 a partir de un indice BASE CERO, que es el que devuelve la fila de
 * encabezados leida de la API.
 *
 * La concatenacion ingenua de letras escribe datos correctos en la columna equivocada sin
 * lanzar ninguna excepcion, que es la peor clase de bug posible sobre el documento del
 * cliente. El paso de una a dos letras es el que hay que tener bien: 25 es Z, 26 es AA
 * y 27 es AB.
 */
export function columnLetterFromIndex(index0: number): string {
  if (!Number.isInteger(index0) || index0 < 0) {
    throw new CliError(`Indice de columna invalido: ${index0}.`);
  }
  return columnLetter(index0 + 1);
}

/** Inversa de la anterior: `AB` vuelve a 27. */
export function columnIndexFromLetter(letter: string): number {
  const upper = letter.trim().toUpperCase();
  if (upper === "" || !/^[A-Z]+$/.test(upper)) {
    throw new CliError(`Letra de columna invalida: ${JSON.stringify(letter)}.`);
  }
  let n = 0;
  for (const ch of upper) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/**
 * Unica normalizacion permitida al comparar encabezados: recorta los dos extremos.
 *
 * Recorta y nada mas. Bajar a minusculas o quitar tildes haria que un encabezado parecido
 * pase por el que no es, y en un documento del cliente eso escribe datos en la columna
 * equivocada. La plantilla manda sobre el nombre exacto.
 */
export function trimHeader(raw: string): string {
  return raw.trim();
}

/** Encabezados que aparecen mas de una vez en la misma fila, en orden de aparicion. */
export function findAmbiguousHeaders(headers: readonly string[]): string[] {
  const counts = new Map<string, number>();
  for (const header of headers) {
    const key = trimHeader(header);
    if (key === "") continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([header]) => header);
}

export interface HeaderDiff {
  readonly esperadas: string[];
  readonly reales: string[];
  readonly faltantes: string[];
  readonly sobrantes: string[];
}

/** Las cuatro listas que se imprimen cuando la forma real no calza con la esperada. */
export function diffHeaders(expected: readonly string[], actual: readonly string[]): HeaderDiff {
  const esperadasTrim = new Set(expected.map(trimHeader));
  const realesTrim = new Set(actual.map(trimHeader).filter((h) => h !== ""));

  return {
    esperadas: [...expected],
    reales: [...actual],
    faltantes: expected.filter((h) => !realesTrim.has(trimHeader(h))),
    sobrantes: actual.filter((h) => trimHeader(h) !== "" && !esperadasTrim.has(trimHeader(h))),
  };
}

function formatDiff(tabTitle: string, headerRow: number, diff: HeaderDiff): string {
  const list = (items: readonly string[]): string =>
    items.length === 0 ? "    (ninguna)" : items.map((h) => `    - ${JSON.stringify(h)}`).join("\n");

  return (
    `El tab "${tabTitle}" no tiene la forma que declara el modelo, y sin la bandera de extension la operacion se detiene.\n` +
    `  Fila de encabezados leida: ${headerRow}\n` +
    `  Esperadas (${diff.esperadas.length}):\n${list(diff.esperadas)}\n` +
    `  Reales (${diff.reales.length}):\n${list(diff.reales)}\n` +
    `  Faltantes (${diff.faltantes.length}):\n${list(diff.faltantes)}\n` +
    `  Sobrantes (${diff.sobrantes.length}):\n${list(diff.sobrantes)}\n` +
    `  Accion: corregir seo-tools/data/sheet-columns.json contra el documento real, o volver a\n` +
    `  correr con la bandera de extension para agregar lo que falta A LA DERECHA del ultimo\n` +
    `  encabezado ocupado. La extension nunca renombra, reordena ni borra nada existente.`
  );
}

export interface PlannedHeader {
  readonly header: string;
  /** Indice base cero donde caeria el encabezado nuevo. */
  readonly index: number;
  readonly letter: string;
}

/**
 * Calcula donde caen los encabezados nuevos: a la derecha del ULTIMO OCUPADO, en el orden en
 * que los declara el modelo.
 *
 * El ultimo ocupado no es el largo del arreglo: una fila de encabezados puede traer celdas
 * vacias al final y escribir ahi dejaria huecos.
 */
export function planHeaderExtension(
  actual: readonly string[],
  missing: readonly string[],
): PlannedHeader[] {
  let lastOccupied = -1;
  actual.forEach((header, i) => {
    if (trimHeader(header) !== "") lastOccupied = i;
  });

  return missing.map((header, offset) => {
    const index = lastOccupied + 1 + offset;
    return { header, index, letter: columnLetterFromIndex(index) };
  });
}

/**
 * Rechaza la escritura orientada a filas sobre un tab transpuesto.
 *
 * Es preferible un error claro a corromper `Competitor Analysis`, donde los competidores
 * corren a lo ancho y las metricas a lo alto.
 */
export function assertRowOriented(tab: TabModel): void {
  if (tab.orientation === "filas" && tab.headerRow !== null) return;

  throw new CliError(
    `El tab "${tab.sheetTitle}" esta declarado con orientacion ${tab.orientation} y no admite escritura orientada a filas.\n` +
      `  Forma real: un registro por COLUMNA, no por fila. Las etiquetas de las metricas corren\n` +
      `  a lo alto por la columna A y cada registro ocupa una columna entera. No tiene fila de\n` +
      `  encabezados, asi que la idempotencia por clave de fila no aplica.\n` +
      `  El modo orientado a columnas lo implementa la fase 13, que es la que escribe este tab.\n` +
      `  La operacion se detiene: escribir filas aca corromperia el tab.`,
  );
}

// ---------------------------------------------------------------------------
// Puerto de lectura del documento
// ---------------------------------------------------------------------------

export interface TabMetadata {
  readonly sheetId: number;
  readonly title: string;
  readonly index: number;
  readonly rowCount: number;
  readonly columnCount: number;
}

export interface ConditionalFormatEntry {
  readonly sheetTitle: string;
  /** Descripcion corta de la regla, para que el reporte diga cual es sin volcar el objeto. */
  readonly description: string;
  /** Formulas propias de la regla, si las tiene. */
  readonly formulas: readonly string[];
  /** Rangos declarados, en indices base cero con final exclusivo. */
  readonly ranges: readonly { readonly startColumnIndex: number; readonly endColumnIndex: number }[];
}

/**
 * Lo unico que este modulo necesita del documento, y todo de solo lectura.
 *
 * Es un puerto a proposito: las pruebas lo implementan en memoria y corren sin credenciales
 * y sin red.
 */
export interface SpreadsheetGateway {
  fetchTabs(): Promise<TabMetadata[]>;
  /** Devuelve una fila en numeracion de Sheet, base 1. */
  readRow(tabTitle: string, row: number): Promise<string[]>;
  /** Contenido de cada tab pidiendo FORMULAS en lugar de valores calculados. */
  readFormulas(tabTitles: readonly string[]): Promise<Map<string, string[][]>>;
  readConditionalFormats(): Promise<ConditionalFormatEntry[]>;
}

function asText(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  return typeof cell === "string" ? cell : String(cell);
}

/** Implementacion real del puerto sobre la sesion autenticada del plan 01. */
export function createGoogleGateway(session: SheetsSession): SpreadsheetGateway {
  const { spreadsheetId } = session.config;

  const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      throw new CliError(describeSheetsError(error, spreadsheetId));
    }
  };

  return {
    async fetchTabs(): Promise<TabMetadata[]> {
      const res = await wrap(() =>
        session.sheets.spreadsheets.get({
          spreadsheetId,
          fields: "sheets.properties(sheetId,title,index,gridProperties(rowCount,columnCount))",
        }),
      );

      return (res.data.sheets ?? []).map((sheet) => {
        const props = sheet.properties ?? {};
        return {
          sheetId: props.sheetId ?? -1,
          title: props.title ?? "",
          index: props.index ?? -1,
          rowCount: props.gridProperties?.rowCount ?? 0,
          columnCount: props.gridProperties?.columnCount ?? 0,
        };
      });
    },

    async readRow(tabTitle: string, row: number): Promise<string[]> {
      const range = `${quoteTab(tabTitle)}!${row}:${row}`;
      const res = await wrap(() =>
        session.sheets.spreadsheets.values.get({ spreadsheetId, range, majorDimension: "ROWS" }),
      );
      return ((res.data.values ?? [])[0] ?? []).map(asText);
    },

    async readFormulas(tabTitles: readonly string[]): Promise<Map<string, string[][]>> {
      const out = new Map<string, string[][]>();
      if (tabTitles.length === 0) return out;

      const res = await wrap(() =>
        session.sheets.spreadsheets.values.batchGet({
          spreadsheetId,
          ranges: tabTitles.map(quoteTab),
          majorDimension: "ROWS",
          // FORMULA devuelve la formula escrita en vez de su resultado. Es la unica forma de
          // ver que celda menciona a que columna.
          valueRenderOption: "FORMULA",
        }),
      );

      const valueRanges = res.data.valueRanges ?? [];
      tabTitles.forEach((title, i) => {
        const grid = (valueRanges[i]?.values ?? []) as unknown[][];
        out.set(
          title,
          grid.map((row) => (row ?? []).map(asText)),
        );
      });
      return out;
    },

    async readConditionalFormats(): Promise<ConditionalFormatEntry[]> {
      const res = await wrap(() =>
        session.sheets.spreadsheets.get({
          spreadsheetId,
          fields: "sheets(properties(sheetId,title),conditionalFormats)",
        }),
      );

      const entries: ConditionalFormatEntry[] = [];

      for (const sheet of res.data.sheets ?? []) {
        const sheetTitle = sheet.properties?.title ?? "";
        const rules = sheet.conditionalFormats ?? [];

        rules.forEach((rule, i) => {
          const formulas: string[] = [];

          for (const value of rule.booleanRule?.condition?.values ?? []) {
            const text = value.userEnteredValue;
            if (typeof text === "string" && text !== "") formulas.push(text);
          }
          for (const point of [
            rule.gradientRule?.minpoint,
            rule.gradientRule?.midpoint,
            rule.gradientRule?.maxpoint,
          ]) {
            const text = point?.value;
            if (typeof text === "string" && text !== "") formulas.push(text);
          }

          const kind =
            rule.booleanRule?.condition?.type ?? (rule.gradientRule ? "GRADIENT" : "DESCONOCIDA");

          entries.push({
            sheetTitle,
            description: `regla ${i + 1} (${kind})`,
            formulas,
            ranges: (rule.ranges ?? []).map((range) => ({
              startColumnIndex: range.startColumnIndex ?? 0,
              endColumnIndex: range.endColumnIndex ?? Number.MAX_SAFE_INTEGER,
            })),
          });
        });
      }

      return entries;
    },
  };
}

// ---------------------------------------------------------------------------
// Validacion de un tab contra el documento real
// ---------------------------------------------------------------------------

export interface ResolvedColumn {
  readonly field: string | null;
  /** Encabezado real, con espacio final si el documento lo trae. */
  readonly header: string;
  readonly status: ColumnStatus;
  readonly literal?: string;
  /** Indice base cero dentro de la fila de encabezados. */
  readonly index: number;
  readonly letter: string;
  /** true si la columna todavia no existe y se calculo para agregarse a la derecha. */
  readonly planned: boolean;
}

export interface TabSchema {
  readonly tab: TabModel;
  readonly metadata: TabMetadata;
  /** Fila de encabezados leida, TAL CUAL, sin recortar. */
  readonly headers: string[];
  readonly byField: Map<string, ResolvedColumn>;
  readonly byHeader: Map<string, ResolvedColumn>;
  /** Encabezados requeridos que no estaban. Vacio salvo que se haya pedido la extension. */
  readonly missing: string[];
  readonly added: PlannedHeader[];
  /** Encabezados repetidos dentro del tab. Obligan a mapear por posicion. */
  readonly ambiguous: string[];
  /** Primera fila de datos en numeracion de Sheet, base 1. */
  readonly firstDataRow: number;
  /** La misma, en indice base cero, que es lo que consume el borrado de filas. */
  readonly firstDataRowIndex: number;
}

export interface LoadTabOptions {
  /** Agrega a la derecha los encabezados requeridos que falten, en el orden declarado. */
  readonly addMissingColumns?: boolean;
}

function resolveByPosition(tab: TabModel, headers: readonly string[]): ResolvedColumn[] {
  return tab.columns.map((column, i) => {
    const actual = headers[i];
    if (actual === undefined || trimHeader(actual) !== trimHeader(column.header)) {
      throw new CliError(
        `El tab "${tab.sheetTitle}" se mapea por posicion y la columna ${i} no coincide.\n` +
          `  Esperada: ${JSON.stringify(column.header)}\n` +
          `  Real:     ${JSON.stringify(actual ?? "(no existe)")}\n` +
          `  Accion: el mapeo por posicion no tolera columnas insertadas ni movidas. Volver a\n` +
          `  correr sheet:inspect y actualizar seo-tools/data/sheet-columns.json.`,
      );
    }
    return {
      field: column.field,
      header: actual,
      status: column.status,
      ...(column.literal === undefined ? {} : { literal: column.literal }),
      index: i,
      letter: columnLetterFromIndex(i),
      planned: false,
    };
  });
}

/**
 * Valida un tab contra el documento y devuelve la posicion resuelta de cada columna.
 *
 * La fila de encabezados sale SIEMPRE del modelo del tab. Es la unica defensa contra el
 * banner de la fila 1.
 */
export async function loadTabSchema(
  gateway: SpreadsheetGateway,
  tab: TabModel,
  options: LoadTabOptions = {},
): Promise<TabSchema> {
  const tabs = await gateway.fetchTabs();
  const metadata = tabs.find((t) => t.title === tab.sheetTitle);

  if (metadata === undefined) {
    throw new CliError(
      `El tab "${tab.sheetTitle}" no existe en el documento.\n` +
        `  Tabs que si existen (${tabs.length}): ${tabs.map((t) => JSON.stringify(t.title)).join(", ")}\n` +
        `  Ojo: el texto que se lee en la fila 1 de cada tab es un banner decorativo y NO es el\n` +
        `  nombre del tab. Pedir el banner a la API devuelve HTTP 400.`,
    );
  }

  assertRowOriented(tab);
  const headerRow = tab.headerRow as number;

  const headers = await gateway.readRow(tab.sheetTitle, headerRow);
  const ambiguous = findAmbiguousHeaders(headers);

  const byField = new Map<string, ResolvedColumn>();
  const byHeader = new Map<string, ResolvedColumn>();
  const register = (column: ResolvedColumn): void => {
    if (column.field !== null) byField.set(column.field, column);
    byHeader.set(trimHeader(column.header), column);
  };

  if (tab.mapBy === "posicion") {
    for (const column of resolveByPosition(tab, headers)) register(column);
    return {
      tab,
      metadata,
      headers,
      byField,
      byHeader,
      missing: [],
      added: [],
      ambiguous,
      firstDataRow: headerRow + 1,
      firstDataRowIndex: headerRow,
    };
  }

  const declarados = new Set(tab.columns.map((c) => trimHeader(c.header)));
  const conflictos = ambiguous.filter((h) => declarados.has(h));
  if (conflictos.length > 0) {
    throw new CliError(
      `El tab "${tab.sheetTitle}" repite encabezados, asi que el mapeo por nombre es ambiguo.\n` +
        `  Repetidos: ${conflictos.map((h) => JSON.stringify(h)).join(", ")}\n` +
        `  Accion: declarar el tab con mapeo por posicion en seo-tools/data/sheet-columns.json.\n` +
        `  Resolver un encabezado repetido por nombre escribiria todos los bloques en la misma\n` +
        `  columna sin lanzar ninguna excepcion.`,
    );
  }

  // Primera aparicion gana. Con el control de ambiguedad de arriba, no hay segunda.
  const porNombre = new Map<string, { index: number; header: string }>();
  headers.forEach((header, index) => {
    const key = trimHeader(header);
    if (key === "" || porNombre.has(key)) return;
    porNombre.set(key, { index, header });
  });

  const missing: ColumnModel[] = [];

  for (const column of tab.columns) {
    const hit = porNombre.get(trimHeader(column.header));
    if (hit === undefined) {
      if (REQUIRED_STATUSES.has(column.status)) missing.push(column);
      continue;
    }
    register({
      field: column.field,
      header: hit.header,
      status: column.status,
      ...(column.literal === undefined ? {} : { literal: column.literal }),
      index: hit.index,
      letter: columnLetterFromIndex(hit.index),
      planned: false,
    });
  }

  let added: PlannedHeader[] = [];

  if (missing.length > 0) {
    if (options.addMissingColumns !== true) {
      throw new CliError(
        formatDiff(
          tab.sheetTitle,
          headerRow,
          diffHeaders(
            tab.columns.map((c) => c.header),
            headers,
          ),
        ),
      );
    }

    added = planHeaderExtension(
      headers,
      missing.map((c) => c.header),
    );

    missing.forEach((column, i) => {
      const plan = added[i] as PlannedHeader;
      register({
        field: column.field,
        header: column.header,
        status: column.status,
        ...(column.literal === undefined ? {} : { literal: column.literal }),
        index: plan.index,
        letter: plan.letter,
        planned: true,
      });
    });
  }

  return {
    tab,
    metadata,
    headers,
    byField,
    byHeader,
    missing: missing.map((c) => c.header),
    added,
    ambiguous,
    firstDataRow: headerRow + 1,
    firstDataRowIndex: headerRow,
  };
}

// ---------------------------------------------------------------------------
// Escaneo de referencias: la precondicion que Juan puso para el borrado de columnas
// ---------------------------------------------------------------------------

export interface ScanTarget {
  readonly tabTitle: string;
  /** Encabezado real de la columna candidata, para el reporte. */
  readonly header: string;
  /** Letra A1 de la columna dentro de ese tab. */
  readonly letter: string;
}

export interface ColumnReference {
  readonly kind: "formula" | "formato-condicional";
  /** Donde aparece: celda concreta o regla concreta. */
  readonly where: string;
  readonly text: string;
}

export interface ColumnScanResult {
  readonly target: ScanTarget;
  /** Menciones que BLOQUEAN el borrado. Lista vacia significa segura de eliminar. */
  readonly references: ColumnReference[];
  /** Menciones informativas que no bloquean, por ejemplo un rango que abarca media tabla. */
  readonly notes: ColumnReference[];
  readonly safeToDelete: boolean;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Decide si un texto de formula menciona una columna concreta.
 *
 * Dos formas de mencion. Cruzada, con el nombre del tab por delante, que vale desde cualquier
 * tab. Y local, por letra sola, que solo vale dentro del propio tab. La local excluye lo que
 * viene precedido por letra o digito para no confundir `AB4` con `B4`, y lo precedido por
 * signo de admiracion para no contar la referencia a otro tab como si fuera propia.
 */
export function mentionsColumn(
  text: string,
  tabTitle: string,
  letter: string,
  sameTab: boolean,
): boolean {
  const L = escapeRegex(letter.toUpperCase());
  const tail = `(?:\\$?\\d+|:\\$?${L})`;
  const quoted = escapeRegex(`'${tabTitle.replace(/'/g, "''")}'`);
  const bare = escapeRegex(tabTitle);

  const cross = new RegExp(`(?:${quoted}|${bare})!\\$?${L}${tail}(?![A-Za-z0-9_])`);
  if (cross.test(text)) return true;

  if (!sameTab) return false;
  const local = new RegExp(`(?<![A-Za-z0-9_!])\\$?${L}${tail}(?![A-Za-z0-9_])`);
  return local.test(text);
}

/**
 * Escanea todo el documento buscando quien menciona cada columna candidata.
 *
 * Es de SOLO LECTURA y es la precondicion que Juan puso para autorizar el borrado de las
 * columnas muertas: cualquier mencion aborta la operacion, sin bandera de fuerza que permita
 * saltarla.
 *
 * Un rango de formato condicional que abarca media tabla se reporta aparte y no bloquea:
 * al eliminar una columna, ese tipo de rango se reajusta solo. Lo que si bloquea es una regla
 * cuyo rango sea exactamente esa columna, porque el borrado la deja huerfana.
 */
export async function scanColumnReferences(
  gateway: SpreadsheetGateway,
  targets: readonly ScanTarget[],
): Promise<ColumnScanResult[]> {
  const tabs = await gateway.fetchTabs();
  const titles = tabs.map((t) => t.title).filter((t) => t !== "");
  const formulas = await gateway.readFormulas(titles);
  const formats = await gateway.readConditionalFormats();

  return targets.map((target) => {
    const references: ColumnReference[] = [];
    const notes: ColumnReference[] = [];
    const targetIndex = columnIndexFromLetter(target.letter);

    for (const title of titles) {
      const sameTab = title === target.tabTitle;
      const grid = formulas.get(title) ?? [];

      grid.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (!cell.startsWith("=")) return;
          if (!mentionsColumn(cell, target.tabTitle, target.letter, sameTab)) return;
          references.push({
            kind: "formula",
            where: `${title}!${columnLetterFromIndex(c)}${r + 1}`,
            text: cell,
          });
        });
      });
    }

    for (const entry of formats) {
      const sameTab = entry.sheetTitle === target.tabTitle;

      const hit = entry.formulas.find((formula) =>
        mentionsColumn(formula, target.tabTitle, target.letter, sameTab),
      );
      if (hit !== undefined) {
        references.push({
          kind: "formato-condicional",
          where: `${entry.sheetTitle}: ${entry.description}`,
          text: hit,
        });
        continue;
      }

      if (!sameTab) continue;

      for (const range of entry.ranges) {
        if (targetIndex < range.startColumnIndex || targetIndex >= range.endColumnIndex) continue;
        const abarcaSoloEsta = range.endColumnIndex - range.startColumnIndex === 1;
        const ref: ColumnReference = {
          kind: "formato-condicional",
          where: `${entry.sheetTitle}: ${entry.description}`,
          text: abarcaSoloEsta
            ? `rango exclusivo de la columna ${target.letter}`
            : `rango ${columnLetterFromIndex(range.startColumnIndex)} a ${columnLetterFromIndex(
                Math.min(range.endColumnIndex - 1, 16383),
              )}`,
        };
        if (abarcaSoloEsta) references.push(ref);
        else notes.push(ref);
      }
    }

    return { target, references, notes, safeToDelete: references.length === 0 };
  });
}
