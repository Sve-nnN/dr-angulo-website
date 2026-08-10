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

import { fetchThroughCache, type NetworkCall, type NetworkResult, type RunCounters } from "../cache.js";
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

async function consultar(
  parametros: Record<string, unknown>,
  etiqueta: string,
  opciones: OpcionesConsulta,
  vacio: (cuerpo: unknown) => boolean,
): Promise<unknown> {
  const llamada: NetworkCall =
    opciones.llamada ?? (async (): Promise<NetworkResult> => requestJson(url(parametros)));

  const envelope = await fetchThroughCache(
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
