/**
 * Dificultad, potencial de trafico y volumen de Ahrefs, POR CABEZA DE CLUSTER (KWR-05, D-07).
 *
 * ================================================================================
 * ESTE MODULO LEE SOLO DE LA CACHE. NUNCA CONSULTA.
 * ================================================================================
 *
 * Ahrefs no tiene credencial en `.secrets/.env` y su unico camino de acceso es el servidor MCP,
 * que vive en la sesion del agente y no en el proceso de Node. El traspaso es el mismo que
 * monto el plan 13-03 y esta descrito en la seccion 8 del README: `ahrefs-plan.ts` emite que
 * pedir y bajo que clave, el agente captura el cuerpo por el MCP, `ahrefs-ingest.ts` lo mete
 * en la cache y cuenta la consulta. Este archivo es el paso siguiente: leer lo que haya en la
 * cache y volcarlo a `data/ahrefs-keywords.jsonl`.
 *
 * La consecuencia practica, y hay una prueba que la fija: reconstruir el archivo no incrementa
 * el contador de Ahrefs ni un punto, corra las veces que corra.
 *
 * ================================================================================
 * LOS TRES ESTADOS DE PROCEDENCIA, QUE NO SON INTERCAMBIABLES
 * ================================================================================
 *
 *   ahrefs           la fuente devolvio el valor. Un cero con esta procedencia es un cero REAL
 *   ahrefs_sin_dato  la consulta esta en cache y la fuente no trajo ese campo, o no conoce la
 *                    keyword. Ya esta medido que Ahrefs devuelve vacio para el geo long tail de
 *                    Lima, que es exactamente donde DinoRank si tiene datos
 *   no_consultado    la consulta todavia no se ingirio. NO es lo mismo que no tener el dato
 *
 * Confundir los dos ultimos con un cero manda las cuatro condiciones nucleo del negocio
 * —hernia discal, estenosis espinal, escoliosis, ortopedia infantil— al final de cualquier
 * orden por volumen. Son las cuatro paginas que v1.1 ya publico.
 *
 * ================================================================================
 * LAS DOS FUENTES CONVIVEN Y NINGUNA GANA (D-08)
 * ================================================================================
 *
 * `hernia discal` en Peru devuelve 6.000 de volumen en Ahrefs y 0 en DataForSEO via DinoRank,
 * medido, mismo pais. `compararVolumenes` publica LOS DOS valores con su fuente al lado y no
 * expone ningun campo que resuelva el conflicto: no hay promedio, no hay elegido, no hay
 * descartado. Ocultar una de las dos seria perder la unica senal de que hay un problema de
 * medicion.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { CACHE_DIR, SEO_TOOLS_ROOT } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import {
  ENDPOINTS,
  RUTA_USO,
  claveDeConsulta,
  leerConsulta,
  paramsDeKeyword,
  parsearKeywordsOverview,
  registrarCorrida,
  unidadesEstimadas,
  type FilaDeOverview,
} from "./ahrefs.js";

// El parser vive en `ahrefs.ts`, junto a los otros cuatro y al contrato de la fuente, para que
// `parsearPorEndpoint` pueda cablearlo sin importar este archivo. Se reexporta aca porque este
// es el modulo por el que pasa todo lo de keywords.
export { parsearKeywordsOverview, type FilaDeOverview };

export const RUTA_METRICAS = path.join(SEO_TOOLS_ROOT, "data", "ahrefs-keywords.jsonl");

/** Los tres estados posibles de una metrica. Ver la cabecera: no son intercambiables. */
export type ProcedenciaMetrica = "ahrefs" | "ahrefs_sin_dato" | "no_consultado";

/** Una cabeza de cluster: el texto original para consultar, la clave normalizada para indexar. */
export interface Cabeza {
  readonly keyword: string;
  readonly keywordKey: string;
}

export interface MetricasDeCabeza {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly keywordDifficulty: number | null;
  readonly keywordDifficultyFuente: ProcedenciaMetrica;
  readonly trafficPotential: number | null;
  readonly trafficPotentialFuente: ProcedenciaMetrica;
  readonly volume: number | null;
  readonly volumeFuente: ProcedenciaMetrica;
  /** true si la consulta esta en la cache. Es lo que separa `no_consultado` de los demas. */
  readonly enCache: boolean;
  /** Clave de cache, para poder auditar de donde salio cada numero sin recalcular nada. */
  readonly clave: string;
  readonly capturadaEn: string | null;
}

// ---------------------------------------------------------------------------
// Reconstruccion desde la cache
// ---------------------------------------------------------------------------

export interface OpcionesMetricas {
  readonly cacheDir?: string | undefined;
}

function procedencia(enCache: boolean, valor: number | null): ProcedenciaMetrica {
  if (!enCache) return "no_consultado";
  return valor === null ? "ahrefs_sin_dato" : "ahrefs";
}

/**
 * Una fila por CABEZA, en orden de clave normalizada.
 *
 * El orden se impone aca y no se hereda de la lista de entrada: es lo que hace que dos
 * reconstrucciones produzcan el mismo archivo byte a byte, que es como se comprueba que no
 * hubo consulta nueva sin mirar el contador.
 *
 * Ninguna keyword que no sea cabeza entra en la salida, aunque este en la cache. El alcance de
 * Ahrefs en esta fase son las cabezas y nada mas (D-07).
 */
export async function construirMetricas(
  cabezas: readonly Cabeza[],
  opciones: OpcionesMetricas = {},
): Promise<MetricasDeCabeza[]> {
  const cacheDir = opciones.cacheDir ?? CACHE_DIR;
  const filas: MetricasDeCabeza[] = [];
  const vistas = new Set<string>();

  for (const cabeza of cabezas) {
    const keywordKey = normalizeKeyword(cabeza.keywordKey || cabeza.keyword);
    if (keywordKey === "" || vistas.has(keywordKey)) continue;
    vistas.add(keywordKey);

    // Se consulta por el TEXTO ORIGINAL, con tildes: es lo que el proveedor recibe. La clave
    // normalizada es del proyecto y solo sirve para unir con el resto del dataset.
    const params = paramsDeKeyword(cabeza.keyword);
    const envelope = await leerConsulta(ENDPOINTS.keywordsOverview, params, { cacheDir });
    const enCache = envelope !== null;

    const overview = enCache ? parsearKeywordsOverview(envelope.response) : [];
    const primera = overview[0];

    const kd = primera?.keywordDifficulty ?? null;
    const tp = primera?.trafficPotential ?? null;
    const vol = primera?.volume ?? null;

    filas.push({
      keyword: cabeza.keyword,
      keywordKey,
      keywordDifficulty: kd,
      keywordDifficultyFuente: procedencia(enCache, kd),
      trafficPotential: tp,
      trafficPotentialFuente: procedencia(enCache, tp),
      volume: vol,
      volumeFuente: procedencia(enCache, vol),
      enCache,
      clave: claveDeConsulta(ENDPOINTS.keywordsOverview, params),
      capturadaEn: envelope?.fetchedAt ?? null,
    });
  }

  return filas.sort((a, b) => (a.keywordKey < b.keywordKey ? -1 : a.keywordKey > b.keywordKey ? 1 : 0));
}

/** JSONL con salto final. Es lo unico que se escribe a disco, y es determinista. */
export function serializar(filas: readonly MetricasDeCabeza[]): string {
  return `${filas.map((f) => JSON.stringify(f)).join("\n")}\n`;
}

export async function escribirMetricas(
  filas: readonly MetricasDeCabeza[],
  ruta: string = RUTA_METRICAS,
): Promise<void> {
  await mkdir(path.dirname(ruta), { recursive: true });
  await writeFile(ruta, serializar(filas), "utf8");
}

// ---------------------------------------------------------------------------
// La comparacion de volumen entre las dos fuentes (D-08)
// ---------------------------------------------------------------------------

export interface VolumenAhrefs {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly volume: number | null;
  readonly volumeFuente: string;
}

export interface VolumenDinorank {
  readonly keywordKey: string;
  readonly volume: number | null;
  readonly volumeFuente: string;
}

export interface Discrepancia {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly volumenAhrefs: number;
  readonly volumenDinorank: number;
  readonly discrepan: boolean;
  /** Cociente del mayor sobre el menor, o null si alguno es cero. Solo para ordenar el informe. */
  readonly factor: number | null;
}

/**
 * Cruza los volumenes de las dos fuentes para las cabezas que tienen LAS DOS.
 *
 * El resultado NO trae ningun campo que resuelva el conflicto —ni promedio, ni elegido, ni
 * ganador— y hay una prueba que lo afirma por ausencia. Publicar las dos es lo que pide D-08 y
 * es la unica senal de que hay un problema de medicion entre proveedores.
 *
 * Una keyword con volumen en una sola de las dos no entra: comparar contra un dato ausente no
 * es una discrepancia, es una medicion que falta.
 */
export function compararVolumenes(
  ahrefs: readonly VolumenAhrefs[],
  dinorank: readonly VolumenDinorank[],
): Discrepancia[] {
  const porClave = new Map<string, VolumenDinorank>();
  for (const d of dinorank) porClave.set(normalizeKeyword(d.keywordKey), d);

  const salida: Discrepancia[] = [];
  for (const a of ahrefs) {
    if (a.volume === null || a.volumeFuente !== "ahrefs") continue;
    const d = porClave.get(normalizeKeyword(a.keywordKey));
    if (d === undefined || d.volume === null || d.volumeFuente === "sin_datos") continue;

    const mayor = Math.max(a.volume, d.volume);
    const menor = Math.min(a.volume, d.volume);
    salida.push({
      keyword: a.keyword,
      keywordKey: normalizeKeyword(a.keywordKey),
      volumenAhrefs: a.volume,
      volumenDinorank: d.volume,
      discrepan: a.volume !== d.volume,
      factor: menor === 0 ? null : Number((mayor / menor).toFixed(2)),
    });
  }

  return salida.sort((x, y) => (x.keywordKey < y.keywordKey ? -1 : 1));
}

// ---------------------------------------------------------------------------
// Libro de unidades
// ---------------------------------------------------------------------------

export interface OpcionesCorrida {
  readonly plan: string;
  /** Consultas que el alcance de este plan implica: una por cabeza. */
  readonly consultas: number;
  /** Cuantas de esas ya estan en cache. Si son todas, la corrida pasa a `ingerido`. */
  readonly ingeridas: number;
  readonly fecha: string;
  readonly ruta?: string | undefined;
}

/**
 * Suma la corrida de keywords de este plan al libro, SIN tocar la del plan 13-03.
 *
 * El estado es `planificado` mientras falte ingerir alguna consulta: declarar como consumido
 * algo que todavia no salio inflaria el gasto reportado, y el libro es todo el control que
 * este proyecto tiene sobre su propio consumo (T-13-33).
 */
export async function registrarCorridaDeKeywords(opciones: OpcionesCorrida): Promise<void> {
  const todas = opciones.consultas > 0 && opciones.ingeridas >= opciones.consultas;
  await registrarCorrida(
    {
      plan: opciones.plan,
      estado: todas ? "ingerido" : "planificado",
      fecha: opciones.fecha,
      consultasPorEndpoint: { [ENDPOINTS.keywordsOverview]: opciones.consultas },
      nota: todas
        ? "Consumo real: las consultas de keyword de este plan estan todas en cache."
        : `Alcance del plan: ${opciones.consultas} cabezas, ${opciones.ingeridas} ya en cache. ` +
          `Las ${opciones.consultas - opciones.ingeridas} restantes NO se han emitido: el estado ` +
          `es planificado y las unidades son una estimacion del alcance, no un gasto ocurrido.`,
    },
    opciones.ruta ?? RUTA_USO,
  );
}

/** Unidades que costaria el alcance completo de keywords de este plan. */
export function unidadesDelAlcance(consultas: number): number {
  return unidadesEstimadas(ENDPOINTS.keywordsOverview) * consultas;
}
