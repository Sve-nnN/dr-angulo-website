/**
 * Enriquecimiento del universo con las metricas de la fuente primaria.
 *
 * ESTE MODULO SE REDIMENSIONO. El plan lo dibujo como unas 400 peticiones, una por keyword,
 * porque se escribio cuando se creia que la expansion no traia metricas. La realidad medida es
 * otra: una sola respuesta de keyword research devuelve cientos de relacionadas CON sus tres
 * metricas, asi que el universo llega ya enriquecido en su mayor parte y lo que queda es
 * rellenar huecos. De 5716 keywords, 4992 llegaron con volumen, CPC y competencia.
 *
 * Eso cambia la forma del algoritmo, no solo su tamano. La unidad de trabajo NO es la keyword:
 * es la respuesta. Cada consulta se indexa entera y resuelve de una vez a todas las pendientes
 * que aparezcan en ella, no solo a la que la origino. Consultar una por una gastaria cuota
 * preguntando por keywords que la respuesta anterior ya habia contestado.
 *
 * Las tres propiedades que hacen que gastar cuota aca sea seguro:
 *
 *   - Tope de concurrencia, porque cientos de peticiones en paralelo terminan en 429.
 *   - Cache por consulta, porque una interrupcion a mitad no obliga a repetir nada.
 *   - Bandera de limite, porque el techo del plan contratado es desconocido y la primera
 *     corrida tiene que medir antes de comprometer el presupuesto entero.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { createLimiter } from "../http.js";
import { CliError } from "../config.js";
import {
  DINORANK_ENDPOINT,
  DINORANK_FUENTE,
  keywordResearchConPropia,
  metricasSinDatos,
  parseKeywordResearch,
  parseKeywordResearchConPropia,
  type DinoKeyword,
  type MetricasKeyword,
  type OpcionesConsulta,
} from "../sources/dinorank.js";
import { normalizeKeyword } from "./normalize.js";

/**
 * Valor literal de las tres metricas cuya fuente quedo diferida por decision de Juan del
 * 2026-08-10. El enriquecimiento RELLENA campos y no migra esquema, asi que estas tres tienen
 * que salir de aca exactamente como entraron.
 */
export const NO_CONSULTADO = "no_consultado";

export const METRICAS_DIFERIDAS = [
  "trafficPotential",
  "keywordDifficulty",
  "referringDomainsNeeded",
] as const;

export interface RegistroKeyword {
  keyword: string;
  keywordKey: string;
  semilla: string | null;
  capa: string | null;
  estado: string;
  metricas: MetricasKeyword;
  trafficPotential: unknown;
  keywordDifficulty: unknown;
  referringDomainsNeeded: unknown;
  intent: string;
  intentSource: string;
  intentRegla: string | null;
  stage: string;
  stageRegla: string | null;
  alcance: string;
  motivoAlcance: string | null;
  ambiguo: boolean;
  motivoAmbiguo: string | null;
}

export type ConsultaKeyword = (keyword: string) => Promise<DinoKeyword[]>;

export interface OpcionesEnriquecimiento {
  cacheDir: string;
  offline?: boolean | undefined;
  refresh?: boolean | undefined;
  /** Tope de CONSULTAS emitidas, no de keywords resueltas: una consulta resuelve varias. */
  limit?: number | undefined;
  concurrency?: number | undefined;
  /** Restringe el gasto a las keywords que el negocio puede atender. */
  soloObjetivo?: boolean | undefined;
  /**
   * Restringe el gasto por largo de la keyword. La fuente resuelve terminos cabecera y no
   * frases: medido sobre la cache real, de una a tres palabras rinde un 14% y de cuatro o mas
   * rinde cero. Sin este tope, la mayor parte del presupuesto se va en consultas que ya se sabe
   * que vuelven vacias.
   */
  maxPalabras?: number | undefined;
  quota?: OpcionesConsulta["quota"];
  maxPerRun?: number | undefined;
  /** Aciertos y fallos de cache de esta corrida. Es lo que distingue gasto real de reproceso. */
  stats?: OpcionesConsulta["stats"];
  /** Doble de la consulta entera. Solo lo usan las pruebas. */
  consultar?: ConsultaKeyword | undefined;
  /** Doble de la llamada de red, un nivel mas abajo: deja el seam de cache en juego. */
  llamada?: OpcionesConsulta["llamada"];
  onProgreso?: ((hechas: number, total: number) => void) | undefined;
}

export interface ResultadoEnriquecimiento {
  registros: RegistroKeyword[];
  /** Pendientes al empezar. */
  pendientes: number;
  /** Consultas que se llegaron a emitir, sean acierto de cache o llamada de red. */
  consultas: number;
  /** Pendientes que quedaron con al menos una metrica resuelta. */
  resueltas: number;
  /** Pendientes que se consultaron y la fuente no conoce. Para la fase 13 son oportunidad. */
  sinDatos: number;
  /** Pendientes que no se consultaron por el tope de la bandera de limite. */
  sinConsultar: number;
  /** Consultas que en modo offline no estaban en cache. */
  faltantesEnCache: number;
  /** Resueltas barriendo respuestas ya pagadas, antes de emitir una sola consulta nueva. */
  cosechadasDeCache: number;
}

/**
 * Barrido de la cache antes de gastar.
 *
 * Cada respuesta de esta fuente trae cientos de keywords relacionadas con sus metricas, asi que
 * una respuesta pagada por una keyword suele contener la respuesta de muchas otras. Sin este
 * paso se paga dos veces por el mismo dato: una consulta nueva por una keyword que ya estaba
 * contestada dentro de una respuesta vieja.
 *
 * Lee el directorio de la fuente en crudo a proposito. Consultar el seam keyword por keyword no
 * sirve: la clave de cache se calcula sobre la keyword CONSULTADA, y lo que se busca aca son
 * las que aparecen dentro de respuestas ajenas.
 */
async function cosecharDeCache(
  cacheDir: string,
  aplicar: (keywords: readonly DinoKeyword[]) => void,
): Promise<void> {
  const dir = path.join(cacheDir, DINORANK_FUENTE);

  let archivos: string[];
  try {
    archivos = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return;
  }

  for (const archivo of archivos) {
    try {
      const envelope = JSON.parse(await readFile(path.join(dir, archivo), "utf8")) as {
        endpoint?: unknown;
        outcome?: unknown;
        response?: unknown;
        request?: { keyword?: unknown };
      };
      if (envelope.endpoint !== DINORANK_ENDPOINT || envelope.outcome === "error") continue;

      const keyword = envelope.request?.keyword;
      aplicar(
        typeof keyword === "string"
          ? parseKeywordResearchConPropia(envelope.response, keyword)
          : parseKeywordResearch(envelope.response),
      );
    } catch {
      // Un archivo corrupto no puede tumbar el enriquecimiento: se ignora y se sigue.
    }
  }
}

function tieneMetricas(registro: RegistroKeyword): boolean {
  return registro.metricas.searchVolumeFuente !== "sin_datos";
}

/**
 * Las keywords que todavia no tienen metricas.
 *
 * `soloObjetivo` existe porque enriquecer `hernia discal en perros salchichas` o
 * `54 congreso peruano de ortopedia` es gasto puro: el eje de alcance del plan 04 ya separo la
 * deriva del universo real y esta es la primera decision que se apoya en el.
 */
export function pendientesDeMetricas(
  registros: readonly RegistroKeyword[],
  opciones: { soloObjetivo?: boolean | undefined; maxPalabras?: number | undefined } = {},
): RegistroKeyword[] {
  return registros.filter((r) => {
    if (tieneMetricas(r)) return false;
    if (opciones.soloObjetivo === true && r.alcance !== "objetivo") return false;
    if (opciones.maxPalabras !== undefined && palabras(r.keyword) > opciones.maxPalabras) return false;
    return true;
  });
}

const palabras = (keyword: string): number => keyword.trim().split(/\s+/).filter(Boolean).length;

/** Guarda del contrato con el Sheet y con el plan 04: las diferidas salen como entraron. */
function verificarDiferidas(registro: RegistroKeyword): void {
  for (const campo of METRICAS_DIFERIDAS) {
    if (registro[campo] !== NO_CONSULTADO) {
      throw new CliError(
        `La metrica diferida ${campo} perdio su valor literal en "${registro.keywordKey}".\n` +
          `  Valor encontrado: ${JSON.stringify(registro[campo])}\n` +
          `  Las tres metricas diferidas existen para TODO el universo con el valor ` +
          `"${NO_CONSULTADO}" y el enriquecimiento no las toca. Si esto salta, algo las piso.`,
      );
    }
  }
}

/**
 * Enriquece el universo. Devuelve registros NUEVOS y no muta los de entrada: el consolidado del
 * plan 04 es un artefacto commiteado y una mutacion en el lugar haria imposible comparar.
 */
export async function enriquecer(
  registros: readonly RegistroKeyword[],
  opciones: OpcionesEnriquecimiento,
): Promise<ResultadoEnriquecimiento> {
  for (const registro of registros) verificarDiferidas(registro);

  const salida: RegistroKeyword[] = registros.map((r) => ({ ...r, metricas: { ...r.metricas } }));
  const pendientes = pendientesDeMetricas(salida, {
    soloObjetivo: opciones.soloObjetivo,
    maxPalabras: opciones.maxPalabras,
  });

  // Indice de pendientes por clave normalizada: es lo que permite que UNA respuesta resuelva a
  // todas las que aparezcan en ella y no solo a la que la origino.
  const porClave = new Map<string, RegistroKeyword[]>();
  for (const registro of pendientes) {
    const clave = normalizeKeyword(registro.keywordKey);
    const grupo = porClave.get(clave);
    if (grupo === undefined) porClave.set(clave, [registro]);
    else grupo.push(registro);
  }

  const consultar: ConsultaKeyword =
    opciones.consultar ??
    ((keyword) =>
      keywordResearchConPropia(keyword, {
        cacheDir: opciones.cacheDir,
        offline: opciones.offline,
        refresh: opciones.refresh,
        quota: opciones.quota,
        maxPerRun: opciones.maxPerRun,
        stats: opciones.stats,
        llamada: opciones.llamada,
      }));

  const limitar = createLimiter(opciones.concurrency ?? 3);
  const tope = opciones.limit ?? Number.POSITIVE_INFINITY;

  // `intentos` acota el trabajo y `faltantesEnCache` descuenta lo que no llego a ser consulta:
  // en modo offline un fallo de cache no emitio nada, asi que no puede contarse como consulta.
  let intentos = 0;
  let faltantesEnCache = 0;
  let sinDatos = 0;
  const consultadas = new Set<string>();

  /** Vuelca una respuesta entera sobre todas las pendientes que nombre. */
  const aplicar = (keywords: readonly DinoKeyword[]): void => {
    for (const entrada of keywords) {
      const grupo = porClave.get(normalizeKeyword(entrada.key));
      if (grupo === undefined) continue;
      for (const registro of grupo) {
        if (tieneMetricas(registro)) continue;
        registro.metricas = {
          searchVolume: entrada.presentes.searchVolume ? entrada.searchVolume : null,
          searchVolumeFuente: entrada.presentes.searchVolume ? "dinorank" : "sin_datos",
          cpc: entrada.presentes.cpc ? entrada.cpc : null,
          cpcFuente: entrada.presentes.cpc ? "dinorank" : "sin_datos",
          competition: entrada.presentes.competition ? entrada.competition : null,
          competitionFuente: entrada.presentes.competition ? "dinorank" : "sin_datos",
        };
        registro.estado =
          registro.metricas.searchVolume !== null && registro.metricas.searchVolume > 0
            ? "con_datos"
            : "sin_datos";
      }
    }
  };

  // Primero lo gratis: lo que ya se pago y esta en disco. Recien despues se gasta.
  await cosecharDeCache(opciones.cacheDir, aplicar);
  const cosechadasDeCache = pendientes.filter(tieneMetricas).length;

  // Se procesa por lotes del tamano del tope de concurrencia y no lanzando todo de una: entre
  // lote y lote se vuelve a mirar que sigue pendiente, asi que lo que ya resolvio una respuesta
  // anterior no se consulta.
  const concurrencia = Math.max(1, opciones.concurrency ?? 3);
  let indice = 0;
  let hechas = 0;

  while (indice < pendientes.length && intentos < tope) {
    const lote: RegistroKeyword[] = [];
    while (indice < pendientes.length && lote.length < concurrencia && intentos + lote.length < tope) {
      const candidato = pendientes[indice] as RegistroKeyword;
      indice += 1;
      const clave = normalizeKeyword(candidato.keywordKey);
      if (tieneMetricas(candidato) || consultadas.has(clave)) continue;
      consultadas.add(clave);
      lote.push(candidato);
    }
    if (lote.length === 0) continue;

    await Promise.all(
      lote.map((registro) =>
        limitar(async () => {
          intentos += 1;
          try {
            aplicar(await consultar(registro.keyword));
          } catch (error) {
            // El modo offline informa una consulta ausente lanzando. Aca eso NO es un fallo:
            // es la respuesta "no la tengo", y la fila se queda marcada sin datos. Cualquier
            // otro error si se propaga, incluido el rechazo de credencial.
            if (opciones.offline === true && error instanceof CliError && /offline/i.test(error.message)) {
              faltantesEnCache += 1;
            } else {
              throw error;
            }
          }
          hechas += 1;
          opciones.onProgreso?.(hechas, Math.min(pendientes.length, tope));
        }),
      ),
    );
  }

  for (const registro of pendientes) {
    if (tieneMetricas(registro)) continue;
    if (!consultadas.has(normalizeKeyword(registro.keywordKey))) continue;
    registro.metricas = metricasSinDatos();
    sinDatos += 1;
  }

  for (const registro of salida) verificarDiferidas(registro);

  const resueltas = pendientes.filter(tieneMetricas).length;

  return {
    registros: salida,
    pendientes: pendientes.length,
    consultas: intentos - faltantesEnCache,
    resueltas,
    sinDatos,
    sinConsultar: pendientes.length - resueltas - sinDatos,
    faltantesEnCache,
    cosechadasDeCache,
  };
}
