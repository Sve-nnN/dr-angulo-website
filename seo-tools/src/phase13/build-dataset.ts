#!/usr/bin/env tsx
/**
 * La vista consolidada de la fase 13: `data/keywords-13.jsonl` (SHEET-01).
 *
 * ================================================================================
 * POR QUE ESTO ES UNA VISTA Y NO UNA MIGRACION DE `keywords.jsonl`
 * ================================================================================
 *
 * `data/keywords.jsonl` es el dataset CERRADO de la fase 12 y esta fase no lo escribe. Lleva su
 * propia guarda contra perder el literal de las tres metricas diferidas y su SHA-256 es criterio
 * de aceptacion de los cinco planes de esta fase. Asi que la union se hace en un archivo aparte,
 * y es ese el que se carga al Sheet.
 *
 * ================================================================================
 * LA GUARDA, QUE ES LO UNICO IMPORTANTE DE ESTE ARCHIVO (T-13-30)
 * ================================================================================
 *
 * El plan 13-04 cambia `Keyword Difficulty` y `Traffic Potential` de literal fijo a campo del
 * registro. Antes el literal `no_consultado` lo ponia el modelo del Sheet y llegaba siempre; a
 * partir de ahora viaja en el dato. Si una sola linea de la vista se quedara sin valor en esas
 * dos columnas, la celda saldria VACIA, y una celda vacia donde antes habia un literal convierte
 * un dato ausente en un cero implicito. Son 5.716 filas y no lanzaria ninguna excepcion.
 *
 * Por eso el constructor CUENTA las lineas sin valor y se niega a escribir el archivo si hay una
 * sola. Es la misma guarda que la fase 12 puso en su consolidador, por el mismo motivo.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/build-dataset.ts
 *   ./node_modules/.bin/tsx src/phase13/build-dataset.ts --dry-run
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { booleana, ejecutar, parseBanderas } from "./args.js";

const RUTA_BASE = path.join(SEO_TOOLS_ROOT, "data", "keywords.jsonl");
const RUTA_CLUSTERS = path.join(SEO_TOOLS_ROOT, "data", "keyword-clusters.jsonl");
const RUTA_METRICAS = path.join(SEO_TOOLS_ROOT, "data", "ahrefs-keywords.jsonl");
const RUTA_SALIDA = path.join(SEO_TOOLS_ROOT, "data", "keywords-13.jsonl");

/**
 * El literal de las metricas diferidas. Tiene que sobrevivir en las 5.6xx filas que no se
 * consultaron: perderlo convierte un dato ausente en un cero afirmado y manda las cuatro
 * condiciones centrales al final de cualquier orden por volumen.
 */
const NO_CONSULTADO = "no_consultado";

/** Las dos columnas que esta fase pasa de literal a campo. Son las que la guarda vigila. */
const COLUMNAS_DIFERIDAS = ["keywordDifficulty", "trafficPotential"] as const;

function leerJsonl<T>(ruta: string): T[] {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(`No se pudo leer ${ruta}.`);
  }
  const salida: T[] = [];
  crudo.split("\n").forEach((linea, i) => {
    const t = linea.trim();
    if (t === "") return;
    try {
      salida.push(JSON.parse(t) as T);
    } catch {
      throw new CliError(`${ruta} tiene una linea que no es JSON valido: linea ${i + 1}.`);
    }
  });
  return salida;
}

export interface FilaDeVista extends Record<string, unknown> {
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly clusterFuente: string | null;
  readonly topResult: string | null;
  readonly keywordDifficulty: number | string;
  readonly trafficPotential: number | string;
}

export interface EntradaDeCluster {
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly clusterFuente: string | null;
  readonly topResult: string | null;
}

export interface EntradaDeMetricas {
  readonly keywordKey: string;
  readonly keywordDifficulty: number | null;
  readonly keywordDifficultyFuente: string;
  readonly trafficPotential: number | null;
  readonly trafficPotentialFuente: string;
}

/**
 * Une las tres fuentes. Una linea por linea del dataset base, con todos sus campos conservados.
 *
 * El numero entra SOLO cuando Ahrefs lo devolvio de verdad, que es lo que dice la procedencia.
 * En todo lo demas queda el literal. Nunca cero.
 */
export function construirVista(
  base: readonly Record<string, unknown>[],
  clusters: readonly EntradaDeCluster[],
  metricas: readonly EntradaDeMetricas[],
): FilaDeVista[] {
  const porClave = new Map(clusters.map((c) => [c.keywordKey, c]));
  const porMetrica = new Map(metricas.map((m) => [m.keywordKey, m]));

  return base.map((fila) => {
    const clave = String(fila["keywordKey"] ?? "");
    const c = porClave.get(clave);
    const m = porMetrica.get(clave);

    const kd =
      m !== undefined && m.keywordDifficulty !== null && m.keywordDifficultyFuente === "ahrefs"
        ? m.keywordDifficulty
        : NO_CONSULTADO;
    const tp =
      m !== undefined && m.trafficPotential !== null && m.trafficPotentialFuente === "ahrefs"
        ? m.trafficPotential
        : NO_CONSULTADO;

    return {
      ...fila,
      keywordKey: clave,
      // Sin cluster la celda queda vacia, que es lo correcto: 2.327 filas del universo objetivo
      // no comparten termino clinico con ninguna cabeza y forzarles una asignacion dudosa
      // ensuciaria el dataset justo donde la fase 14 se va a apoyar.
      cluster: c?.cluster ?? null,
      clusterFuente: c?.clusterFuente ?? null,
      // Una fila de la cola NUNCA hereda el topResult de su cabeza: seria afirmar el resultado
      // de otra keyword. Solo lo llevan las 91 validadas contra Google.
      topResult: c?.topResult ?? null,
      keywordDifficulty: kd,
      trafficPotential: tp,
    } as FilaDeVista;
  });
}

/** Lineas que perdieron el valor de alguna columna diferida. Vacio es la unica salida valida. */
export function lineasSinLiteral(vista: readonly FilaDeVista[]): { linea: number; campo: string }[] {
  const fallos: { linea: number; campo: string }[] = [];
  vista.forEach((fila, i) => {
    for (const campo of COLUMNAS_DIFERIDAS) {
      const v = (fila as Record<string, unknown>)[campo];
      if (v === undefined || v === null || v === "") fallos.push({ linea: i + 1, campo });
    }
  });
  return fallos;
}

export function serializar(vista: readonly FilaDeVista[]): string {
  return `${vista.map((f) => JSON.stringify(f)).join("\n")}\n`;
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const out = process.stdout;

  const base = leerJsonl<Record<string, unknown>>(RUTA_BASE);
  const clusters = leerJsonl<EntradaDeCluster>(RUTA_CLUSTERS);
  const metricas = leerJsonl<EntradaDeMetricas>(RUTA_METRICAS);

  const vista = construirVista(base, clusters, metricas);

  if (vista.length !== base.length) {
    throw new CliError(
      `La vista no tiene una linea por keyword: ${vista.length} contra ${base.length}.`,
    );
  }

  const fallos = lineasSinLiteral(vista);
  if (fallos.length > 0) {
    throw new CliError(
      `${fallos.length} lineas perdieron el valor de una columna diferida y NO se escribio nada.\n` +
        fallos
          .slice(0, 10)
          .map((f) => `    - linea ${f.linea}: ${f.campo}`)
          .join("\n") +
        `\n  Una celda vacia donde antes habia un literal convierte un dato ausente en un cero\n` +
        `  implicito, en 5.716 filas y sin lanzar ninguna excepcion (T-13-30).`,
    );
  }

  const conKD = vista.filter((f) => typeof f.keywordDifficulty === "number").length;
  const conTP = vista.filter((f) => typeof f.trafficPotential === "number").length;
  const conCluster = vista.filter((f) => f.cluster !== null).length;
  const porSerp = vista.filter((f) => f.clusterFuente === "serp").length;
  const porTexto = vista.filter((f) => f.clusterFuente === "texto").length;
  const conTop = vista.filter((f) => f.topResult !== null).length;

  out.write(`Vista de la fase 13: ${vista.length} lineas (base: ${base.length})\n`);
  out.write(`  con cluster:                ${conCluster}\n`);
  out.write(`    validado por SERP:        ${porSerp}\n`);
  out.write(`    inferido por texto:       ${porTexto}\n`);
  out.write(`  con topResult:              ${conTop}\n`);
  out.write(`  con KD numerico:            ${conKD}\n`);
  out.write(`  con traffic potential:      ${conTP}\n`);
  out.write(`  con el literal en las dos columnas diferidas: ${vista.length - Math.max(conKD, conTP)}+\n`);

  if (booleana(banderas, "dry-run")) {
    out.write(`\nEnsayo: no se escribio nada.\n`);
    return 0;
  }

  writeFileSync(RUTA_SALIDA, serializar(vista), "utf8");
  out.write(`\nEscrito: ${RUTA_SALIDA}\n`);
  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("build-dataset.ts")) {
  ejecutar(main);
}
