/**
 * Capa fina de lectura de SERP para la fase 13.
 *
 * Existe para dos cosas y nada mas: fijar el directorio de cache por defecto, y dejar que el
 * resto de la fase lea una SERP sin conocer el cliente de la fuente ni el seam de cache.
 *
 * REGLA DE LA FASE, que gobierna todo lo demas: quedan 114 busquedas de SerpApi hasta el
 * 2026-08-21 y no se reponen. Todo lo que esta fase lee de las 12 capturas de la fase 12 va
 * en modo offline, que convierte un fallo de cache en error duro en vez de en un gasto
 * silencioso.
 */

import { CACHE_DIR } from "../config.js";
import {
  parseSerpCompleta,
  serpCompleta,
  type LugarDelPack,
  type OpcionesConsulta,
  type ResultadoOrganico,
  type SerpCompleta,
} from "../sources/serpapi.js";

export type { LugarDelPack, ResultadoOrganico, SerpCompleta };

/**
 * Registro tipado a partir de un cuerpo de respuesta que ya se tiene en la mano.
 *
 * Es la puerta que usan los recorridos sobre `.cache/serpapi/`: ahi el envelope ya esta
 * leido, asi que volver a pasar por el seam solo agregaria trabajo. El cuerpo va en
 * `envelope.response`, NO en la raiz del envelope.
 */
export function serpDesdeCuerpo(
  keyword: string,
  cuerpo: unknown,
  capturadaEn: string | null = null,
): SerpCompleta {
  return parseSerpCompleta(keyword, cuerpo, capturadaEn);
}

export interface OpcionesSerp {
  /** Por defecto, la cache del paquete. Las pruebas pasan un directorio temporal. */
  readonly cacheDir?: string | undefined;
  /** Prohibe salir a la red. Es lo que garantiza coste cero de cuota. */
  readonly offline?: boolean | undefined;
  readonly refresh?: boolean | undefined;
  readonly quota?: OpcionesConsulta["quota"];
  readonly maxPerRun?: number | undefined;
  readonly pending?: number | undefined;
  readonly stats?: OpcionesConsulta["stats"];
  /** Sustituto de la llamada de red. Solo lo usan las pruebas. */
  readonly llamada?: OpcionesConsulta["llamada"];
}

/**
 * Lee la SERP de una keyword. Con `offline` en true no necesita credencial ni red, y una
 * keyword ausente de la cache falla nombrando la clave que habria que rellenar.
 */
export async function leerSerp(
  keyword: string,
  opciones: OpcionesSerp = {},
): Promise<SerpCompleta> {
  return serpCompleta(keyword, {
    cacheDir: opciones.cacheDir ?? CACHE_DIR,
    offline: opciones.offline,
    refresh: opciones.refresh,
    quota: opciones.quota,
    maxPerRun: opciones.maxPerRun,
    pending: opciones.pending,
    stats: opciones.stats,
    llamada: opciones.llamada,
  });
}
