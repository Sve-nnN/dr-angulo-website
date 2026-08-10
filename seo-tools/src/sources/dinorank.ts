/**
 * Fuente DinoRank: `/keyword-research`.
 *
 * Es el motor de expansion del universo desde la enmienda del 2026-08-10. Una sola llamada
 * devuelve cientos de keywords relacionadas para Peru, cada una con volumen, CPC y
 * competencia. Medido en vivo: `hernia discal` devolvio 899 relacionadas, `dolor de espalda`
 * 900, `traumatologo lima` 47.
 *
 * TRES TRAMPAS MEDIDAS QUE ESTE PARSER RESPETA. Estan verificadas contra el sondeo real y
 * documentadas en .planning/workstreams/seo-keywords/data/dinorank-contrato-2026-08-10.md:
 *
 *   1. La keyword consultada SIEMPRE vuelve con `datos.search_volume: 0`, junto con `cpc`,
 *      `competition` y los doce meses de historia. Un parser que lea el volumen de ahi saca el
 *      universo entero en cero, y el fallo es SILENCIOSO porque cero es un valor valido. El
 *      volumen se lee de `keywords[]`; la propia semilla se busca dentro de ese arreglo.
 *   2. Solo el 16% de las relacionadas trae volumen (143 de 899). El filtro de calidad no
 *      puede ser "tiene volumen" o el universo se derrumba y se pierde justo el long tail.
 *   3. La respuesta anida `data.data`. No es un error de transcripcion.
 *
 * Ninguna funcion de este archivo llama a la red por su cuenta: todo pasa por el envoltorio
 * de peticiones del plan 01 y por el seam de cache.
 */

import { fetchThroughCache, type NetworkCall, type NetworkResult, type RunCounters } from "../cache.js";
import { CliError, describeSecret } from "../config.js";
import { requestJson } from "../http.js";
import type { QuotaBook } from "../quota.js";

export const DINORANK_FUENTE = "dinorank";
export const DINORANK_ENDPOINT = "https://api.dinorank.com/api/v1/keyword-research";

/** Peru y espanol, fijos: la fuente resuelve este pais por un backend distinto del de Espana
 *  y dejar el mercado al azar produciria un universo de otro pais. */
const PAIS = "pe";
const IDIOMA = "es";

export interface DinoKeyword {
  key: string;
  searchVolume: number;
  cpc: number;
  competition: number;
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

/** Parametros que definen la identidad de la consulta. Nunca llevan la credencial: viaja en
 *  un encabezado y no entra ni a la clave de cache ni al envelope. */
export function parametrosKeywordResearch(keyword: string): Record<string, unknown> {
  return { keyword, country: PAIS, language: IDIOMA };
}

const aNumero = (valor: unknown): number =>
  typeof valor === "number" && Number.isFinite(valor) ? valor : 0;

/**
 * Extrae las keywords relacionadas. Tolerante por diseno: una respuesta sin el arreglo
 * esperado devuelve vacio en vez de romper la expansion entera (amenaza T-12-23).
 */
export function parseKeywordResearch(cuerpo: unknown): DinoKeyword[] {
  if (cuerpo === null || typeof cuerpo !== "object") return [];

  const nivel1 = (cuerpo as Record<string, unknown>)["data"];
  if (nivel1 === null || typeof nivel1 !== "object") return [];

  const nivel2 = (nivel1 as Record<string, unknown>)["data"];
  if (nivel2 === null || typeof nivel2 !== "object") return [];

  const keywords = (nivel2 as Record<string, unknown>)["keywords"];
  if (!Array.isArray(keywords)) return [];

  const salida: DinoKeyword[] = [];

  for (const cruda of keywords) {
    if (cruda === null || typeof cruda !== "object") continue;
    const registro = cruda as Record<string, unknown>;
    const key = registro["key"];
    if (typeof key !== "string" || key.trim() === "") continue;

    salida.push({
      key: key.trim(),
      searchVolume: aNumero(registro["search_volume"]),
      cpc: aNumero(registro["cpc"]),
      competition: aNumero(registro["competition"]),
    });
  }

  return salida;
}

function leerClave(): string {
  const clave = process.env["DINORANK_API_KEY"];
  if (clave === undefined || clave.trim() === "") {
    throw new CliError(
      `Falta DINORANK_API_KEY y la consulta no esta en cache.\n` +
        `  Hay dos caminos y los dos producen el mismo resultado:\n` +
        `  1. Camino directo: agregar DINORANK_API_KEY en .secrets/.env y volver a correr.\n` +
        `  2. Camino de relleno: correr con --plan-only, obtener el cuerpo crudo por fuera y ` +
        `dejarlo con: npm run cli -- cache:put --source ${DINORANK_FUENTE} --key <clave> --file <archivo.json>\n` +
        `  Estado de la credencial: ${describeSecret(clave)}`,
    );
  }
  return clave.trim();
}

/**
 * Una consulta de keyword research. Pasa siempre por el seam de cache: la segunda ejecucion
 * de la misma consulta no llama a la red.
 */
export async function keywordResearch(
  keyword: string,
  opciones: OpcionesConsulta,
): Promise<DinoKeyword[]> {
  const parametros = parametrosKeywordResearch(keyword);

  const llamada: NetworkCall =
    opciones.llamada ??
    (async (): Promise<NetworkResult> =>
      requestJson(DINORANK_ENDPOINT, {
        init: {
          method: "POST",
          headers: {
            "X-API-Key": leerClave(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parametros),
        },
      }));

  const envelope = await fetchThroughCache(
    {
      cacheDir: opciones.cacheDir,
      source: DINORANK_FUENTE,
      endpoint: DINORANK_ENDPOINT,
      params: parametros,
      offline: opciones.offline,
      refresh: opciones.refresh,
      quota: opciones.quota,
      maxPerRun: opciones.maxPerRun,
      pending: opciones.pending,
      stats: opciones.stats,
      label: `${DINORANK_FUENTE}:${keyword}`,
      isEmpty: (cuerpo) => parseKeywordResearch(cuerpo).length === 0,
    },
    llamada,
  );

  return parseKeywordResearch(envelope.response);
}
