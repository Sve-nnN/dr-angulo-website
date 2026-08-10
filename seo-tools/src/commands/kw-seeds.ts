/**
 * kw:seeds — Extrae las semillas del contenido del sitio y las congela en un snapshot commiteado.
 *
 * Es el unico subcomando que mira la aplicacion, y lo hace a traves de src/keywords/seeds.ts.
 * Los demas leen data/seeds.json. Regenerar el snapshot es una decision explicita: por eso
 * este subcomando existe como paso aparte y no como efecto colateral de kw:expand.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { flagBool, flagString, type Flags } from "../cli.js";
import { CliError, resolveFromRepoRoot } from "../config.js";
import {
  RUTA_SNAPSHOT,
  construirSemillas,
  leerContenido,
  serializarSnapshot,
  type Semilla,
} from "../keywords/seeds.js";

/** Piso de cordura. Si la extraccion cae debajo, algun archivo dejo de parsearse y el
 *  universo entero saldria mutilado sin que nada falle a gritos. */
export const MINIMO_SEMILLAS = 55;

function resumirPorTipo(seeds: readonly Semilla[]): string[] {
  const conteo = new Map<string, number>();
  for (const s of seeds) conteo.set(s.tipo, (conteo.get(s.tipo) ?? 0) + 1);
  return [...conteo.entries()].sort().map(([tipo, n]) => `  ${tipo}: ${n}`);
}

function resumirPorRango(seeds: readonly Semilla[]): string[] {
  const conteo = new Map<number, number>();
  for (const s of seeds) conteo.set(s.rango, (conteo.get(s.rango) ?? 0) + 1);
  return [...conteo.entries()].sort((a, b) => a[0] - b[0]).map(([r, n]) => `  rango ${r}: ${n}`);
}

export async function run(flags: Flags): Promise<number> {
  const destinoDeclarado = flagString(flags, "out");
  const destino = destinoDeclarado === undefined ? RUTA_SNAPSHOT : resolveFromRepoRoot(destinoDeclarado);

  const contenido = await leerContenido();
  const snapshot = construirSemillas(contenido);
  const serializado = serializarSnapshot(snapshot);

  if (snapshot.seeds.length < MINIMO_SEMILLAS) {
    throw new CliError(
      `La extraccion produjo ${snapshot.seeds.length} semillas y el piso es ${MINIMO_SEMILLAS}.\n` +
        `  No se escribio nada: un snapshot corto mutila el universo entero aguas abajo y el ` +
        `fallo seria silencioso.\n` +
        `  Accion: revisar que archivo de contenido dejo de parsearse (un cambio de sangria o ` +
        `de nombre de campo basta) en src/keywords/seeds.ts.`,
    );
  }

  if (flagBool(flags, "dry-run")) {
    console.log(`kw:seeds --dry-run: ${snapshot.seeds.length} semillas, no se escribio ${destino}.`);
    return 0;
  }

  let previo: string | null = null;
  try {
    previo = await readFile(destino, "utf8");
  } catch {
    previo = null;
  }

  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, serializado, "utf8");

  console.log(`Semillas extraidas: ${snapshot.seeds.length}`);
  console.log("Por tipo:");
  for (const linea of resumirPorTipo(snapshot.seeds)) console.log(linea);
  console.log("Por rango de valor de negocio (es tambien el orden de gasto):");
  for (const linea of resumirPorRango(snapshot.seeds)) console.log(linea);
  console.log("");
  console.log(`Snapshot: ${destino}`);
  console.log(
    previo === null
      ? "  Archivo nuevo."
      : previo === serializado
        ? "  Sin cambios respecto de la corrida anterior: la extraccion es determinista."
        : "  El contenido de la aplicacion cambio y el snapshot se actualizo.",
  );

  return 0;
}
