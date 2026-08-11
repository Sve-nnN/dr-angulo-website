/**
 * Escritor idempotente sobre un tab TRANSPUESTO.
 *
 * Es el espejo de `upsert.ts` y un archivo aparte a proposito: `upsert.ts` no se toca aca. Ahi
 * cada registro es una FILA y la idempotencia va por columna clave; aca cada registro es una
 * COLUMNA y la idempotencia va por la fila del dominio. Mezclar los dos modos en un archivo
 * haria que un cambio pensado para uno rompiera el otro sin que nada fallara.
 *
 * TRES HECHOS MEDIDOS SOBRE `Competitor Analysis` QUE GOBIERNAN TODO EL ALGORITMO. Salen del
 * reconocimiento del plan 13-01, no de suposiciones:
 *
 *   1. NO HAY FILA DE ENCABEZADOS. Los competidores corren a lo ancho en cinco ranuras con
 *      paso 4 desde la columna B —B, F, J, N y R— y las metricas a lo alto, con su etiqueta en
 *      la columna A. La clave de idempotencia es el dominio, que vive en la fila 3.
 *
 *   2. LA COLUMNA B HACE DOBLE TAREA, Y AHI ESTABA EL RIESGO REAL. No es una columna de
 *      etiquetas: es la PRIMERA ranura de competidor y, encima de sus valores, carga los
 *      titulos de seccion en las filas 1, 4, 11, 17, 23, 25 y 31. Un escritor que volcara una
 *      columna entera sobre la ranura B borraria esos titulos SIN LANZAR NINGUNA EXCEPCION.
 *      Por eso este modulo escribe fila por fila declarada y jamas un rango continuo de
 *      columna: las filas de titulo no estan declaradas, asi que quedan fuera de todo rango.
 *
 *   3. LA ETIQUETA DE LA FILA 25 LLEVA 108 ESPACIOS FINALES. Comparar sin recortar los dos
 *      extremos no la encuentra jamas.
 *
 * Como `upsert.ts`: modo de entrada LITERAL, ensayo por defecto, y validacion de forma con el
 * diff de cuatro listas antes de escribir una sola celda.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { quoteTab } from "./client.js";
import {
  columnLetterFromIndex,
  diffHeaders,
  loadSheetModel,
  trimHeader,
  type ColumnModel,
  type TabModel,
} from "./schema.js";
import { sanitizeCell, type CellValue, type ValueUpdate, type WriteGateway } from "./upsert.js";

const DEFAULT_MODEL_PATH = path.join(SEO_TOOLS_ROOT, "data", "sheet-columns.json");

// ---------------------------------------------------------------------------
// Modelo del tab transpuesto
// ---------------------------------------------------------------------------

export interface RanurasDeclaradas {
  /** Indice base cero de la primera ranura. Medido: 1, es decir la columna B. */
  readonly primeraColumnaIndice: number;
  /** Paso entre ranuras. Medido: 4. Las ranuras NO son contiguas. */
  readonly paso: number;
  readonly cantidad: number;
  readonly letras: readonly string[];
}

export interface FilaDeTitulo {
  readonly row: number;
  readonly titulo: string;
}

export interface ModeloTranspuesto {
  readonly tab: TabModel;
  readonly ranuras: RanurasDeclaradas;
  /** Filas cuyo contenido en la primera ranura es un TITULO DE SECCION y no un dato. */
  readonly filasDeTitulo: readonly FilaDeTitulo[];
  /** Fila que lleva la clave de idempotencia. Medido: la 3, con la etiqueta `Website`. */
  readonly filaDeClave: number;
  /** Filas declaradas, ordenadas. Fuera de estas, el escritor no toca nada. */
  readonly filasDeclaradas: readonly number[];
}

function malModelo(detalle: string): never {
  throw new CliError(
    `El modelo del tab transpuesto es invalido.\n  ${detalle}\n  Archivo: ${DEFAULT_MODEL_PATH}`,
  );
}

/**
 * Carga el modelo del tab transpuesto.
 *
 * Usa `loadSheetModel` para la parte comun y lee del mismo JSON las dos claves propias de un
 * tab transpuesto —las ranuras y las filas de titulo— que el parser comun no conoce. Se hace
 * aca y no ampliando `schema.ts` porque este plan corre en paralelo al 13-02 y ese archivo es
 * territorio compartido.
 */
export async function cargarModeloTranspuesto(
  sheetTitle: string,
  rutaModelo: string = DEFAULT_MODEL_PATH,
): Promise<ModeloTranspuesto> {
  const modelo = await loadSheetModel(rutaModelo);
  const tab = modelo.tabs[sheetTitle];
  if (tab === undefined) malModelo(`El modelo no declara el tab ${JSON.stringify(sheetTitle)}.`);

  if (tab.orientation !== "columnas") {
    throw new CliError(
      `El tab ${JSON.stringify(sheetTitle)} esta declarado con orientacion ${tab.orientation}.\n` +
        `  Este escritor es SOLO para tabs transpuestos. Para los orientados a filas esta\n` +
        `  upsertRows en src/sheets/upsert.ts, que es el que hace la idempotencia por fila.`,
    );
  }

  const crudo = JSON.parse(await readFile(rutaModelo, "utf8")) as Record<string, unknown>;
  const bruto = crudo[sheetTitle] as Record<string, unknown> | undefined;
  const ranurasCrudas = bruto?.["slots"] as Record<string, unknown> | undefined;

  if (ranurasCrudas === undefined) malModelo(`El tab ${sheetTitle} no declara sus ranuras de competidor.`);
  const primeraColumnaIndice = ranurasCrudas["primeraColumnaIndice"];
  const paso = ranurasCrudas["paso"];
  const cantidad = ranurasCrudas["cantidad"];
  if (typeof primeraColumnaIndice !== "number" || typeof paso !== "number" || typeof cantidad !== "number") {
    malModelo(`Las ranuras de ${sheetTitle} tienen que declarar primeraColumnaIndice, paso y cantidad.`);
  }
  if (paso < 1 || cantidad < 1 || primeraColumnaIndice < 0) {
    malModelo(`Las ranuras de ${sheetTitle} declaran numeros fuera de rango.`);
  }

  const letras: string[] = [];
  for (let i = 0; i < cantidad; i += 1) letras.push(columnLetterFromIndex(primeraColumnaIndice + i * paso));

  const declaradas = ranurasCrudas["letras"];
  if (Array.isArray(declaradas) && declaradas.join(",") !== letras.join(",")) {
    malModelo(
      `Las letras de ranura declaradas (${declaradas.join(", ")}) no coinciden con las que salen\n` +
        `  de primeraColumnaIndice ${primeraColumnaIndice} con paso ${paso}: ${letras.join(", ")}.`,
    );
  }

  const filasDeTitulo: FilaDeTitulo[] = [];
  const titulosCrudos = bruto?.["filasDeTitulo"];
  if (Array.isArray(titulosCrudos)) {
    for (const entrada of titulosCrudos) {
      if (entrada === null || typeof entrada !== "object") continue;
      const o = entrada as Record<string, unknown>;
      if (typeof o["row"] === "number" && typeof o["titulo"] === "string") {
        filasDeTitulo.push({ row: o["row"], titulo: o["titulo"] });
      }
    }
  }

  if (tab.keyField === null) malModelo(`El tab ${sheetTitle} no declara su campo clave.`);
  const columnaClave = tab.columns.find((c) => c.field === tab.keyField);
  if (columnaClave === undefined || columnaClave.row === undefined) {
    malModelo(`El tab ${sheetTitle} no declara en que fila vive su clave ${JSON.stringify(tab.keyField)}.`);
  }

  const filasDeclaradas: number[] = [];
  for (const columna of tab.columns) {
    if (columna.row === undefined) {
      malModelo(`En un tab transpuesto cada metrica declara su fila; falta en ${JSON.stringify(columna.header)}.`);
    }
    filasDeclaradas.push(columna.row);
  }

  // Ninguna metrica puede caer sobre una fila de titulo: seria borrar el titulo con un dato.
  const titulos = new Set(filasDeTitulo.map((t) => t.row));
  const choque = filasDeclaradas.filter((r) => titulos.has(r));
  if (choque.length > 0) {
    malModelo(
      `Las filas ${choque.join(", ")} estan declaradas como metrica Y como titulo de seccion.\n` +
        `  Escribirlas borraria el titulo de la columna B sin lanzar ninguna excepcion.`,
    );
  }

  return {
    tab,
    ranuras: { primeraColumnaIndice, paso, cantidad, letras },
    filasDeTitulo,
    filaDeClave: columnaClave.row,
    filasDeclaradas: [...new Set(filasDeclaradas)].sort((a, b) => a - b),
  };
}

// ---------------------------------------------------------------------------
// Utilidades puras
// ---------------------------------------------------------------------------

/** Clave de idempotencia de un tab transpuesto: el dominio, sin protocolo, sin www, en minusculas. */
export function claveDeDominio(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

export interface TramoDeFilas {
  readonly desde: number;
  readonly hasta: number;
}

/**
 * Agrupa filas contiguas en tramos.
 *
 * Es lo que permite escribir SOLO las filas declaradas: cada tramo se escribe con su propio
 * rango y los huecos —las filas de titulo, y cualquier fila que el modelo no declare— quedan
 * intactos. Es el mismo mecanismo que `columnRuns` en el escritor de filas, girado 90 grados.
 */
export function tramosDeFilas(filas: readonly number[]): TramoDeFilas[] {
  const ordenadas = [...new Set(filas)].sort((a, b) => a - b);
  const tramos: TramoDeFilas[] = [];
  for (const fila of ordenadas) {
    const ultimo = tramos[tramos.length - 1];
    if (ultimo !== undefined && fila === ultimo.hasta + 1) {
      tramos[tramos.length - 1] = { desde: ultimo.desde, hasta: fila };
      continue;
    }
    tramos.push({ desde: fila, hasta: fila });
  }
  return tramos;
}

function celdaDeGrilla(grilla: readonly (readonly string[])[], fila: number, columna: number): string {
  return (grilla[fila - 1] ?? [])[columna] ?? "";
}

// ---------------------------------------------------------------------------
// Validacion de forma
// ---------------------------------------------------------------------------

export interface DerivaDeForma {
  readonly esperadas: string[];
  readonly reales: string[];
  readonly faltantes: string[];
  readonly sobrantes: string[];
  readonly detalle: string[];
}

/**
 * Comprueba que cada etiqueta declarada este EN LA FILA QUE DICE EL MODELO.
 *
 * No alcanza con que la etiqueta exista en alguna parte: en un tab transpuesto la fila ES la
 * direccion del dato, asi que una etiqueta desplazada una fila escribe el Domain Rating sobre
 * el Ahrefs Rank sin que nada falle. La comparacion recorta los dos extremos, porque la
 * etiqueta de la fila 25 lleva 108 espacios finales.
 */
export function validarForma(
  modelo: ModeloTranspuesto,
  grilla: readonly (readonly string[])[],
): DerivaDeForma | null {
  const detalle: string[] = [];
  const esperadas: string[] = [];
  const reales: string[] = [];

  for (const columna of modelo.tab.columns) {
    const fila = columna.row as number;
    const esperada = trimHeader(columna.header);
    const real = trimHeader(celdaDeGrilla(grilla, fila, 0));
    esperadas.push(columna.header);
    reales.push(real);
    if (esperada !== real) {
      detalle.push(
        `fila ${fila}: se esperaba la etiqueta ${JSON.stringify(esperada)} en la columna A y hay ${JSON.stringify(real)}`,
      );
    }
  }

  // Los titulos de seccion viven en la PRIMERA RANURA, no en la columna A. Se validan aparte
  // porque son justo lo que un volcado de columna entera destruiria en silencio.
  for (const titulo of modelo.filasDeTitulo) {
    const real = trimHeader(celdaDeGrilla(grilla, titulo.row, modelo.ranuras.primeraColumnaIndice));
    if (trimHeader(titulo.titulo) !== real) {
      detalle.push(
        `fila ${titulo.row}: se esperaba el titulo de seccion ${JSON.stringify(trimHeader(titulo.titulo))} en la ` +
          `columna ${columnLetterFromIndex(modelo.ranuras.primeraColumnaIndice)} y hay ${JSON.stringify(real)}`,
      );
    }
  }

  if (detalle.length === 0) return null;

  const diff = diffHeaders(esperadas, reales);
  return { esperadas: diff.esperadas, reales: diff.reales, faltantes: diff.faltantes, sobrantes: diff.sobrantes, detalle };
}

function mensajeDeDeriva(sheetTitle: string, deriva: DerivaDeForma): string {
  const listar = (items: readonly string[]): string =>
    items.length === 0 ? "    (ninguna)" : items.map((h) => `    - ${JSON.stringify(h)}`).join("\n");

  return (
    `El tab "${sheetTitle}" no tiene la forma que declara el modelo y la operacion se detiene sin escribir nada.\n` +
    `  Es un tab TRANSPUESTO: la fila es la direccion del dato, asi que una etiqueta corrida una\n` +
    `  fila escribiria una metrica encima de otra sin lanzar ninguna excepcion.\n` +
    `  Diferencias concretas (${deriva.detalle.length}):\n` +
    deriva.detalle.map((d) => `    - ${d}`).join("\n") +
    `\n  Esperadas (${deriva.esperadas.length}):\n${listar(deriva.esperadas)}\n` +
    `  Reales (${deriva.reales.length}):\n${listar(deriva.reales)}\n` +
    `  Faltantes (${deriva.faltantes.length}):\n${listar(deriva.faltantes)}\n` +
    `  Sobrantes (${deriva.sobrantes.length}):\n${listar(deriva.sobrantes)}\n` +
    `  Accion: volver a correr src/phase13/tab-recon.ts y actualizar\n` +
    `  seo-tools/data/sheet-columns.json contra el documento real.`
  );
}

// ---------------------------------------------------------------------------
// Upsert por columna
// ---------------------------------------------------------------------------

export type Accion = "actualiza" | "ocupa";

export interface Asignacion {
  readonly domain: string;
  readonly letra: string;
  readonly indice: number;
  readonly accion: Accion;
  /** Dominio que ocupaba la ranura, si habia alguno. */
  readonly dominioAnterior: string | null;
  /** Celdas con contenido previo que este escritor va a sobrescribir. */
  readonly sobrescribe: readonly { readonly celda: string; readonly valor: string }[];
}

export interface ColumnUpsertSummary {
  readonly ensayo: boolean;
  /** Competidores que ya estaban en el documento y se actualizan en su misma ranura. */
  readonly actualizadas: number;
  /** Competidores que ocuparon una ranura libre. Es lo que SHEET-06 exige que sea 0 al recargar. */
  readonly columnasNuevas: number;
  readonly asignaciones: readonly Asignacion[];
  /** Competidores que no entraron porque no quedaban ranuras. */
  readonly sinRanura: readonly string[];
  readonly filasEscritas: readonly number[];
  readonly filasIntactas: readonly number[];
  readonly celdas: number;
  readonly updates: readonly ValueUpdate[];
  readonly llamadasDeRed: number;
}

export interface ColumnUpsertOptions {
  /** El ensayo es el modo por defecto: hay que pedir la escritura de forma explicita. */
  readonly dryRun?: boolean;
}

function valorDeCelda(columna: ColumnModel, registro: Record<string, unknown>): CellValue {
  if (columna.literal !== undefined) return columna.literal;
  const ruta = columna.source ?? columna.field;
  if (ruta === null) return "";

  let actual: unknown = registro;
  for (const segmento of ruta.split(".")) {
    if (typeof actual !== "object" || actual === null) return "";
    actual = (actual as Record<string, unknown>)[segmento];
  }
  // Un campo ausente o desconocido deja la celda VACIA y nunca un cero: es la misma semantica
  // que la fase 12 fijo para el volumen, y esta ahi porque `no_consultado` y `0` son cosas
  // distintas. Confundirlos afirmaria algo que nadie midio.
  if (actual === null || actual === undefined) return "";
  if (typeof actual === "boolean") return actual ? "si" : "no";
  if (typeof actual === "number" || typeof actual === "string") return actual;
  return String(actual);
}

/**
 * Carga registros en un tab transpuesto, una columna por registro, de forma idempotente.
 *
 * La clave es el dominio leido de la fila de sitio web. Un competidor que ya esta se actualiza
 * EN SU RANURA; uno nuevo ocupa la siguiente ranura libre. Cargar dos veces los mismos cinco
 * competidores no agrega ni una columna, que es SHEET-06 aplicado al segundo modo de escritura.
 */
export async function upsertColumns(
  gateway: WriteGateway,
  modelo: ModeloTranspuesto,
  registros: readonly Record<string, unknown>[],
  opciones: ColumnUpsertOptions = {},
): Promise<ColumnUpsertSummary> {
  const ensayo = opciones.dryRun !== false;
  const titulo = modelo.tab.sheetTitle;
  const { primeraColumnaIndice, paso, cantidad } = modelo.ranuras;
  let llamadas = 0;

  const tabs = await gateway.fetchTabs();
  llamadas += 1;
  const metadata = tabs.find((t) => t.title === titulo);
  if (metadata === undefined) {
    throw new CliError(
      `El tab "${titulo}" no existe en el documento.\n` +
        `  Tabs que si existen (${tabs.length}): ${tabs.map((t) => JSON.stringify(t.title)).join(", ")}\n` +
        `  Ojo: el texto de la fila 1 es un banner decorativo y NO es el nombre del tab.`,
    );
  }

  const ultimaColumna = columnLetterFromIndex(primeraColumnaIndice + (cantidad - 1) * paso + (paso - 1));
  const grilla = await gateway.readRegion(titulo, 1, ultimaColumna);
  llamadas += 1;

  // La validacion de forma va ANTES de calcular una sola celda. Si el documento se movio, el
  // escritor se detiene con el diff en vez de escribir un dato en la fila equivocada.
  const deriva = validarForma(modelo, grilla);
  if (deriva !== null) throw new CliError(mensajeDeDeriva(titulo, deriva));

  // Mapa de dominio a ranura, leido de la fila de la clave.
  const ranuras: { indice: number; letra: string; dominio: string }[] = [];
  for (let i = 0; i < cantidad; i += 1) {
    const indice = primeraColumnaIndice + i * paso;
    ranuras.push({
      indice,
      letra: columnLetterFromIndex(indice),
      dominio: claveDeDominio(celdaDeGrilla(grilla, modelo.filaDeClave, indice)),
    });
  }

  const deseados = new Map<string, Record<string, unknown>>();
  const campoClave = modelo.tab.keyField as string;
  for (const registro of registros) {
    const bruto = registro[campoClave];
    const clave = claveDeDominio(typeof bruto === "string" ? bruto : String(bruto ?? ""));
    if (clave === "") continue;
    deseados.set(clave, registro);
  }

  // Primero los que YA estan, cada uno en su ranura. Solo despues se reparten las libres, para
  // que un competidor existente nunca sea desplazado por uno nuevo.
  const asignadas = new Map<string, { indice: number; letra: string; dominioAnterior: string | null }>();
  const ocupadas = new Set<number>();

  for (const ranura of ranuras) {
    if (ranura.dominio !== "" && deseados.has(ranura.dominio)) {
      asignadas.set(ranura.dominio, { indice: ranura.indice, letra: ranura.letra, dominioAnterior: ranura.dominio });
      ocupadas.add(ranura.indice);
    }
  }

  const sinRanura: string[] = [];
  for (const clave of deseados.keys()) {
    if (asignadas.has(clave)) continue;
    // Libre es tanto una ranura vacia como una que trae un dominio que ya no esta en el
    // conjunto deseado: ahi vive el residuo de plantilla `pera.com`, que se REUTILIZA en vez
    // de borrarse aparte.
    const libre = ranuras.find((r) => !ocupadas.has(r.indice));
    if (libre === undefined) {
      sinRanura.push(clave);
      continue;
    }
    asignadas.set(clave, {
      indice: libre.indice,
      letra: libre.letra,
      dominioAnterior: libre.dominio === "" ? null : libre.dominio,
    });
    ocupadas.add(libre.indice);
  }

  const tramos = tramosDeFilas(modelo.filasDeclaradas);
  const porFila = new Map<number, ColumnModel>();
  for (const columna of modelo.tab.columns) porFila.set(columna.row as number, columna);

  const asignaciones: Asignacion[] = [];
  const updates: ValueUpdate[] = [];
  let celdas = 0;
  let actualizadas = 0;
  let columnasNuevas = 0;

  // Orden estable por indice de ranura: dos corridas producen el mismo lote de peticiones.
  const enOrden = [...asignadas.entries()].sort((a, b) => a[1].indice - b[1].indice);

  for (const [dominio, ranura] of enOrden) {
    const registro = deseados.get(dominio) as Record<string, unknown>;
    const yaEstaba = ranura.dominioAnterior === dominio;
    if (yaEstaba) actualizadas += 1;
    else columnasNuevas += 1;

    const sobrescribe: { celda: string; valor: string }[] = [];
    for (const fila of modelo.filasDeclaradas) {
      const previo = celdaDeGrilla(grilla, fila, ranura.indice);
      if (previo.trim() !== "") sobrescribe.push({ celda: `${ranura.letra}${fila}`, valor: previo });
    }

    asignaciones.push({
      domain: dominio,
      letra: ranura.letra,
      indice: ranura.indice,
      accion: yaEstaba ? "actualiza" : "ocupa",
      dominioAnterior: ranura.dominioAnterior,
      sobrescribe,
    });

    for (const tramo of tramos) {
      const valores: CellValue[][] = [];
      for (let fila = tramo.desde; fila <= tramo.hasta; fila += 1) {
        const columna = porFila.get(fila);
        valores.push([columna === undefined ? "" : sanitizeCell(valorDeCelda(columna, registro))]);
      }
      updates.push({
        range: `${quoteTab(titulo)}!${ranura.letra}${tramo.desde}:${ranura.letra}${tramo.hasta}`,
        values: valores,
      });
      celdas += valores.length;
    }
  }

  const declaradas = new Set(modelo.filasDeclaradas);
  const filasIntactas: number[] = [];
  for (let fila = 1; fila <= grilla.length; fila += 1) if (!declaradas.has(fila)) filasIntactas.push(fila);

  const resumen: ColumnUpsertSummary = {
    ensayo,
    actualizadas,
    columnasNuevas,
    asignaciones,
    sinRanura,
    filasEscritas: modelo.filasDeclaradas,
    filasIntactas,
    celdas,
    updates,
    llamadasDeRed: llamadas,
  };

  if (ensayo) return resumen;

  await gateway.writeValues(updates, "RAW");
  return { ...resumen, llamadasDeRed: llamadas + 1 };
}

// ---------------------------------------------------------------------------
// Reporte legible
// ---------------------------------------------------------------------------

/** Salida del ensayo y de la carga real. Es lo que se copia al SUMMARY antes de escribir. */
export function describirResumen(resumen: ColumnUpsertSummary, titulo: string): string {
  const lineas: string[] = [];

  lineas.push(
    `Tab: ${titulo} (transpuesto: un competidor por COLUMNA)`,
    resumen.ensayo
      ? "Modo: ENSAYO. No se emitio ninguna peticion de escritura."
      : "Modo: CARGA REAL.",
    `columnas actualizadas: ${resumen.actualizadas}`,
    `columnas nuevas: ${resumen.columnasNuevas}`,
    `celdas: ${resumen.celdas}`,
    `rangos: ${resumen.updates.length}`,
    `filas que se escriben (${resumen.filasEscritas.length}): ${resumen.filasEscritas.join(", ")}`,
    `filas que NO se tocan (${resumen.filasIntactas.length}): ${resumen.filasIntactas.join(", ")}`,
    "",
  );

  for (const a of resumen.asignaciones) {
    lineas.push(
      `  ${a.letra}  ${a.accion === "actualiza" ? "actualiza" : "ocupa la ranura"}  ->  ${a.domain}` +
        (a.dominioAnterior !== null && a.dominioAnterior !== a.domain
          ? `   (desplaza el contenido previo de ${a.dominioAnterior})`
          : ""),
    );
    for (const s of a.sobrescribe) {
      lineas.push(`       sobrescribe ${s.celda} = ${JSON.stringify(s.valor)}`);
    }
  }

  if (resumen.sinRanura.length > 0) {
    lineas.push("", `SIN RANURA (${resumen.sinRanura.length}): ${resumen.sinRanura.join(", ")}`);
    lineas.push(
      `  El tab declara ${resumen.asignaciones.length + resumen.sinRanura.length} competidores y solo hay ranuras para el resto.`,
    );
  }

  return `${lineas.join("\n")}\n`;
}
