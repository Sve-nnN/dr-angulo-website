/**
 * Las tres metricas de Ahrefs que van al tab `Content Model`, resueltas POR PROCEDENCIA.
 *
 * POR QUE ESTE MODULO EXISTE Y POR QUE MIRA `*Fuente` Y NO EL VALOR.
 *
 * La decision J-1 de la fase 12 dejo estas tres columnas vacias, y tenia razon en su momento: el
 * unico volumen disponible entonces era de DinoRank, y escribirlo bajo un encabezado que dice
 * "(Ahrefs)" habria etiquetado el dato con una herramienta que no lo produjo. Eso no es un hueco
 * cosmetico, es informacion falsa en el documento del cliente.
 *
 * Lo que cambio no es el criterio: es el dato. `ahrefs-keywords.jsonl` ahora trae valores con su
 * procedencia registrada explicitamente. J-1 prohibia escribir el dato de OTRA herramienta bajo
 * este encabezado; nunca prohibio escribir el de Ahrefs cuando existe.
 *
 * De ahi la regla unica de este modulo: **una celda se escribe si y solo si su campo `*Fuente`
 * dice exactamente `ahrefs`.** Los otros dos valores posibles significan cosas distintas y
 * ninguno de los dos habilita la escritura:
 *
 *   - `ahrefs_sin_dato`  — se le pregunto a Ahrefs y no tiene esa metrica para esa keyword.
 *   - `no_consultado`    — nunca se le pregunto, por presupuesto de cuota.
 *
 * Distinguirlos importa: la primera es una respuesta y la segunda es una deuda. Colapsarlas en
 * "vacio" perderia la diferencia, pero para ESTA decision las dos concluyen igual, que es no
 * escribir. La celda vacia es el unico valor honesto cuando no hay dato de la fuente que el
 * encabezado nombra.
 *
 * Un campo ausente del registro NO es lo mismo que un campo vacio: `omitirCamposAusentes` deja la
 * celda literalmente fuera de la peticion y no la pisa. Por eso las metricas sin dato se OMITEN
 * del registro en vez de mandarse como cadena vacia — mandar vacio borraria lo que el cliente
 * hubiera escrito a mano en esa celda.
 */

/** Procedencia registrada de una metrica. Solo la primera habilita escribirla. */
export type FuenteDeMetrica = "ahrefs" | "ahrefs_sin_dato" | "no_consultado";

/** Una fila de `ahrefs-keywords.jsonl`, con lo que a este modulo le importa. */
export interface RegistroDeAhrefs {
  readonly keyword: string;
  readonly volume?: number | null;
  readonly volumeFuente?: string;
  readonly keywordDifficulty?: number | null;
  readonly keywordDifficultyFuente?: string;
  readonly trafficPotential?: number | null;
  readonly trafficPotentialFuente?: string;
}

/** Las tres celdas resueltas. Una clave ausente significa "no escribir esa celda". */
export interface MetricasDeAhrefs {
  readonly volumenAhrefs?: number;
  readonly kdAhrefs?: number;
  readonly trafficPotentialAhrefs?: number;
}

/**
 * Devuelve el valor solo si su fuente es `ahrefs` Y el valor es un numero real.
 *
 * Las dos condiciones hacen falta. Un registro puede declarar fuente `ahrefs` y traer `null` en
 * el valor: significa que Ahrefs respondio sin esa metrica, y `null` escrito en una celda se
 * renderiza como vacio o como la palabra "null" segun el cliente. Ninguna de las dos es un dato.
 *
 * El cero SI es un valor legitimo y se escribe: `cirugia de columna` tiene KD 0 medido, que
 * significa "sin competencia", no "sin dato". Por eso la comprobacion es de tipo y finitud, y no
 * un `if (valor)` que tratatia el 0 como ausente — ese es el bug clasico de este chequeo.
 */
function soloDeAhrefs(valor: number | null | undefined, fuente: string | undefined): number | undefined {
  if (fuente !== "ahrefs") return undefined;
  if (typeof valor !== "number" || !Number.isFinite(valor)) return undefined;
  return valor;
}

/** Indice por keyword normalizada a minusculas, que es como se cruzan mapa y dataset. */
export function indexarAhrefs(registros: readonly RegistroDeAhrefs[]): Map<string, RegistroDeAhrefs> {
  const indice = new Map<string, RegistroDeAhrefs>();
  for (const r of registros) {
    const clave = (r.keyword ?? "").trim().toLowerCase();
    if (clave !== "") indice.set(clave, r);
  }
  return indice;
}

/**
 * Resuelve las tres metricas de una keyword primaria.
 *
 * Una URL sin primaria no tiene metricas que buscar y devuelve el objeto vacio: no hay keyword
 * cuyo volumen medir. Eso deja las tres celdas fuera de la peticion, que es lo correcto.
 */
export function metricasDe(
  keywordPrimaria: string | null | undefined,
  indice: ReadonlyMap<string, RegistroDeAhrefs>,
): MetricasDeAhrefs {
  if (keywordPrimaria === null || keywordPrimaria === undefined || keywordPrimaria.trim() === "") {
    return {};
  }
  const r = indice.get(keywordPrimaria.trim().toLowerCase());
  if (r === undefined) return {};

  const salida: Record<string, number> = {};
  const volumen = soloDeAhrefs(r.volume, r.volumeFuente);
  const kd = soloDeAhrefs(r.keywordDifficulty, r.keywordDifficultyFuente);
  const tp = soloDeAhrefs(r.trafficPotential, r.trafficPotentialFuente);

  if (volumen !== undefined) salida["volumenAhrefs"] = volumen;
  if (kd !== undefined) salida["kdAhrefs"] = kd;
  if (tp !== undefined) salida["trafficPotentialAhrefs"] = tp;
  return salida as MetricasDeAhrefs;
}
