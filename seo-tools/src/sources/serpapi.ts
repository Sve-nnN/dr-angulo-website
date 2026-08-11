/**
 * Fuente SerpApi: resultados de busqueda geolocalizados y sugerencias de autocompletado.
 *
 * Que aporta y por que sigue haciendo falta pese a que DinoRank expande mas barato: las
 * busquedas relacionadas y las preguntas del bloque "la gente tambien pregunta" son lenguaje
 * REAL de paciente, escrito por pacientes, y no aparecen en el proveedor de metricas. Ademas
 * la captura completa de la SERP es lo que la fase 13 necesita para agrupar por solape y para
 * perfilar competencia (COMP-03), asi que se guarda entera y no se repite la pasada.
 *
 * PRESUPUESTO. La cuenta esta en plan gratuito: 250 busquedas al mes, 127 disponibles hasta el
 * 2026-08-21, verificado el 2026-08-10. El tope de esta fase es de 60 y lo hace cumplir el
 * libro de cuota abortando, no una nota en la documentacion. Cada busqueda que se ahorra acá
 * es una que le queda a la fase 13.
 *
 * Nada de este archivo llama a la red por su cuenta: todo pasa por el envoltorio de peticiones
 * del plan 01 y por el seam de cache. La credencial viaja como parametro de la peticion tal
 * como documenta el proveedor, pero NUNCA entra al envelope ni a la clave de cache.
 */

import {
  fetchThroughCache,
  type CacheEnvelope,
  type NetworkCall,
  type NetworkResult,
  type RunCounters,
} from "../cache.js";
import { CliError, describeSecret } from "../config.js";
import { requestJson } from "../http.js";
import type { QuotaBook } from "../quota.js";

export const SERPAPI_FUENTE = "serpapi";
export const SERPAPI_ENDPOINT = "https://serpapi.com/search";

/**
 * Ubicacion, pais e idioma FIJOS en el cliente y no al azar. La validacion del 2026-08-10
 * confirmo que esta combinacion devuelve resultados de Lima: organicos con regions ["PE"] y
 * coordenadas del pack local sobre Lima.
 */
const UBICACION = "Lima, Peru";
const DOMINIO = "google.com.pe";
const PAIS = "pe";
const IDIOMA = "es";

export interface ResultadoBusqueda {
  /** Busquedas relacionadas del pie de la SERP. */
  relacionadas: string[];
  /** Preguntas del bloque "la gente tambien pregunta". */
  preguntas: string[];
}

export interface OpcionesConsulta {
  cacheDir: string;
  offline?: boolean | undefined;
  refresh?: boolean | undefined;
  quota?: QuotaBook | undefined;
  maxPerRun?: number | undefined;
  pending?: number | undefined;
  stats?: RunCounters | undefined;
  /** Sustituto de la llamada de red. Solo lo usan las pruebas y el camino de relleno. */
  llamada?: NetworkCall | undefined;
}

export function parametrosBusqueda(q: string): Record<string, unknown> {
  return { engine: "google", q, location: UBICACION, google_domain: DOMINIO, gl: PAIS, hl: IDIOMA };
}

export function parametrosSugerencias(q: string): Record<string, unknown> {
  return { engine: "google_autocomplete", q, gl: PAIS, hl: IDIOMA };
}

function arreglo(cuerpo: unknown, clave: string): unknown[] {
  if (cuerpo === null || typeof cuerpo !== "object") return [];
  const valor = (cuerpo as Record<string, unknown>)[clave];
  return Array.isArray(valor) ? valor : [];
}

function texto(item: unknown, campo: string): string | null {
  if (item === null || typeof item !== "object") return null;
  const valor = (item as Record<string, unknown>)[campo];
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
}

/** Tolerante por diseno: una respuesta sin los bloques esperados devuelve vacio en vez de
 *  romper la expansion (amenaza T-12-23). */
export function parseBusqueda(cuerpo: unknown): ResultadoBusqueda {
  const relacionadas: string[] = [];
  for (const item of arreglo(cuerpo, "related_searches")) {
    const q = texto(item, "query");
    if (q !== null) relacionadas.push(q);
  }

  const preguntas: string[] = [];
  for (const item of arreglo(cuerpo, "related_questions")) {
    const q = texto(item, "question");
    if (q !== null) preguntas.push(q);
  }

  return { relacionadas, preguntas };
}

export function parseSugerencias(cuerpo: unknown): string[] {
  const salida: string[] = [];
  for (const item of arreglo(cuerpo, "suggestions")) {
    const valor = texto(item, "value");
    if (valor !== null) salida.push(valor);
  }
  return salida;
}

function leerClave(): string {
  const clave = process.env["SERPAPI_API_KEY"];
  if (clave === undefined || clave.trim() === "") {
    throw new CliError(
      `Falta SERPAPI_API_KEY y la consulta no esta en cache.\n` +
        `  Hay dos caminos y los dos producen el mismo resultado:\n` +
        `  1. Camino directo: agregar SERPAPI_API_KEY en .secrets/.env y volver a correr.\n` +
        `  2. Camino de relleno: correr con --plan-only, obtener el cuerpo crudo por fuera y ` +
        `dejarlo con: npm run cli -- cache:put --source ${SERPAPI_FUENTE} --key <clave> --file <archivo.json>\n` +
        `  Estado de la credencial: ${describeSecret(clave)}`,
    );
  }
  return clave.trim();
}

/** Construye la URL con la credencial. Es la unica linea del proyecto donde la clave toca la
 *  peticion, y esa cadena no se persiste, no se registra y no se imprime jamas. */
function url(parametros: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(parametros)) query.set(k, String(v));
  query.set("api_key", leerClave());
  return `${SERPAPI_ENDPOINT}?${query.toString()}`;
}

async function consultarEnvelope(
  parametros: Record<string, unknown>,
  etiqueta: string,
  opciones: OpcionesConsulta,
  vacio: (cuerpo: unknown) => boolean,
): Promise<CacheEnvelope> {
  const llamada: NetworkCall =
    opciones.llamada ?? (async (): Promise<NetworkResult> => requestJson(url(parametros)));

  return fetchThroughCache(
    {
      cacheDir: opciones.cacheDir,
      source: SERPAPI_FUENTE,
      endpoint: SERPAPI_ENDPOINT,
      params: parametros,
      offline: opciones.offline,
      refresh: opciones.refresh,
      quota: opciones.quota,
      maxPerRun: opciones.maxPerRun,
      pending: opciones.pending,
      stats: opciones.stats,
      label: etiqueta,
      isEmpty: vacio,
    },
    llamada,
  );
}

async function consultar(
  parametros: Record<string, unknown>,
  etiqueta: string,
  opciones: OpcionesConsulta,
  vacio: (cuerpo: unknown) => boolean,
): Promise<unknown> {
  const envelope = await consultarEnvelope(parametros, etiqueta, opciones, vacio);
  return envelope.response;
}

/**
 * Resultados de busqueda geolocalizados en Lima. Persiste la respuesta COMPLETA, no solo lo
 * que se cosecha aca: los organicos y el pack local son insumo directo de KWR-04 y COMP-03 en
 * la fase 13, y volver a pedirlos costaria busquedas que ya no van a estar.
 */
export async function busquedaGeolocalizada(
  q: string,
  opciones: OpcionesConsulta,
): Promise<ResultadoBusqueda> {
  const cuerpo = await consultar(
    parametrosBusqueda(q),
    `${SERPAPI_FUENTE}:busqueda:${q}`,
    opciones,
    (respuesta) => {
      const r = parseBusqueda(respuesta);
      return r.relacionadas.length === 0 && r.preguntas.length === 0;
    },
  );

  return parseBusqueda(cuerpo);
}

/**
 * Sugerencias de autocompletado. Se consulta con sufijos dirigidos y NUNCA con expansion
 * alfabetica: recorrer el abecedario multiplicaria por veintisiete el consumo y no cabe en el
 * plan gratuito.
 */
export async function sugerencias(q: string, opciones: OpcionesConsulta): Promise<string[]> {
  const cuerpo = await consultar(
    parametrosSugerencias(q),
    `${SERPAPI_FUENTE}:autocomplete:${q}`,
    opciones,
    (respuesta) => parseSugerencias(respuesta).length === 0,
  );

  return parseSugerencias(cuerpo);
}

// ---------------------------------------------------------------------------
// Lectura COMPLETA de la SERP: lo que KWR-04 y COMP-03 comparten (fase 13, D-15)
// ---------------------------------------------------------------------------

/**
 * Un resultado organico ya normalizado.
 *
 * `dominio` sale del enlace y no de `displayed_link`: ese ultimo es texto de presentacion,
 * viene con separadores tipograficos y truncado con puntos suspensivos, asi que agrupar por
 * el produciria dominios que no existen.
 */
export interface ResultadoOrganico {
  readonly posicion: number;
  readonly url: string;
  /** Host en minusculas, sin el prefijo generico de web. Un subdominio con significado se conserva. */
  readonly dominio: string;
  readonly titulo: string | null;
  readonly fragmento: string | null;
  readonly enlaceMostrado: string | null;
}

/** Una ficha del pack local. Presente en 3 de las 12 capturas del 2026-08-10. */
export interface LugarDelPack {
  readonly posicion: number;
  readonly nombre: string;
  readonly calificacion: number | null;
  readonly resenas: number | null;
  readonly tipo: string | null;
  readonly sitio: string | null;
}

/**
 * La SERP entera de una keyword, en la forma que consume la fase 13.
 *
 * `capturadaEn` es la marca del envelope y NUNCA la del reloj: dos lecturas del mismo archivo
 * de cache tienen que producir el mismo registro byte a byte, o el criterio de determinismo
 * del plan 13-01 falla por una razon que no tiene nada que ver con el parser.
 */
export interface SerpCompleta {
  readonly keyword: string;
  readonly organicos: ResultadoOrganico[];
  readonly packLocal: LugarDelPack[];
  readonly relacionadas: string[];
  readonly preguntas: string[];
  /** Bloque destacado tal cual. Ausente en las 12 capturas del 2026-08-10, asi que null es lo normal. */
  readonly destacado: Record<string, unknown> | null;
  readonly resumenIa: boolean;
  readonly videos: boolean;
  readonly capturadaEn: string | null;
}

/** Prefijo de subdominio que no distingue nada: `www.mayoclinic.org` y `mayoclinic.org` son el mismo sitio. */
const PREFIJO_WEB = "www.";

/**
 * Host normalizado de un enlace, o null si el enlace no parsea.
 *
 * Devolver null en vez de lanzar es deliberado: una sola URL malformada dentro de una captura
 * de diez resultados no puede costar la captura entera, porque volver a pedirla cuesta una
 * busqueda de una cuota que no se repone.
 */
export function normalizarDominio(link: string): string | null {
  if (typeof link !== "string" || link.trim() === "") return null;
  let host: string;
  try {
    host = new URL(link.trim()).hostname;
  } catch {
    return null;
  }
  if (host === "") return null;
  const bajo = host.toLowerCase();
  return bajo.startsWith(PREFIJO_WEB) ? bajo.slice(PREFIJO_WEB.length) : bajo;
}

function numero(item: unknown, campo: string): number | null {
  if (item === null || typeof item !== "object") return null;
  const valor = (item as Record<string, unknown>)[campo];
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

function objeto(cuerpo: unknown, clave: string): Record<string, unknown> | null {
  if (cuerpo === null || typeof cuerpo !== "object") return null;
  const valor = (cuerpo as Record<string, unknown>)[clave];
  if (valor === null || typeof valor !== "object" || Array.isArray(valor)) return null;
  return valor as Record<string, unknown>;
}

function parseOrganicos(cuerpo: unknown): ResultadoOrganico[] {
  const salida: ResultadoOrganico[] = [];

  arreglo(cuerpo, "organic_results").forEach((item, i) => {
    const link = texto(item, "link");
    if (link === null) return;
    const dominio = normalizarDominio(link);
    if (dominio === null) return;

    const declarada = numero(item, "position");
    salida.push({
      posicion: declarada !== null && declarada > 0 ? declarada : i + 1,
      url: link,
      dominio,
      titulo: texto(item, "title"),
      fragmento: texto(item, "snippet"),
      enlaceMostrado: texto(item, "displayed_link"),
    });
  });

  // Orden por posicion ascendente. `sort` de Node es estable, asi que dos resultados con la
  // misma posicion declarada conservan el orden en que los mando la fuente.
  return salida.sort((a, b) => a.posicion - b.posicion);
}

function parsePackLocal(cuerpo: unknown): LugarDelPack[] {
  const bloque = objeto(cuerpo, "local_results");
  if (bloque === null) return [];

  const salida: LugarDelPack[] = [];
  arreglo(bloque, "places").forEach((item, i) => {
    const nombre = texto(item, "title");
    if (nombre === null) return;
    const declarada = numero(item, "position");
    const enlaces = objeto(item, "links");
    salida.push({
      posicion: declarada !== null && declarada > 0 ? declarada : i + 1,
      nombre,
      calificacion: numero(item, "rating"),
      resenas: numero(item, "reviews"),
      tipo: texto(item, "type"),
      sitio: enlaces === null ? null : texto(enlaces, "website"),
    });
  });

  return salida.sort((a, b) => a.posicion - b.posicion);
}

/**
 * Convierte el cuerpo crudo de una respuesta en el registro tipado de la fase 13.
 *
 * Los nombres de campo estan medidos sobre las 12 capturas reales el 2026-08-11 y no son los
 * que uno esperaria: las preguntas viven en `related_questions` y no en `people_also_ask`, y
 * el pack local esta anidado bajo `local_results.places`.
 */
export function parseSerpCompleta(
  keyword: string,
  cuerpo: unknown,
  capturadaEn: string | null = null,
): SerpCompleta {
  const basico = parseBusqueda(cuerpo);

  return {
    keyword,
    organicos: parseOrganicos(cuerpo),
    packLocal: parsePackLocal(cuerpo),
    relacionadas: basico.relacionadas,
    preguntas: basico.preguntas,
    destacado: objeto(cuerpo, "answer_box"),
    resumenIa: objeto(cuerpo, "ai_overview") !== null,
    videos: arreglo(cuerpo, "inline_videos").length > 0,
    capturadaEn,
  };
}

/**
 * La SERP completa de una keyword, por el MISMO camino de cache que `busquedaGeolocalizada`.
 *
 * Llama a `parametrosBusqueda(q)` sin agregar, quitar ni renombrar un solo parametro. Ese
 * detalle es el que decide si las 12 capturas de Lima de la fase 12 siguen sirviendo: la clave
 * de cache se calcula sobre esos parametros, asi que tocar uno las invalida todas y la fase 13
 * arrancaria con doce busquedas menos de una cuota que no se repone hasta el 2026-08-21 (D-06).
 */
export async function serpCompleta(
  q: string,
  opciones: OpcionesConsulta,
): Promise<SerpCompleta> {
  const envelope = await consultarEnvelope(
    parametrosBusqueda(q),
    `${SERPAPI_FUENTE}:busqueda:${q}`,
    opciones,
    (respuesta) => parseSerpCompleta(q, respuesta).organicos.length === 0,
  );

  return parseSerpCompleta(q, envelope.response, envelope.fetchedAt ?? null);
}
