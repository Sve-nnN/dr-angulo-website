/**
 * kw:expand — Expande el universo cruzando semillas, modificadores y geo, y deduplica por
 * clave normalizada.
 *
 * Lee el snapshot commiteado de semillas: no importa ningun modulo de la aplicacion.
 * La deduplicacion usa la clave normalizada, nunca el texto visible.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { flagBool, flagString, type Flags } from "../cli.js";
import { SEO_TOOLS_ROOT, resolveFromRepoRoot } from "../config.js";
import { consolidar, serializarCandidatos, type Candidato } from "../keywords/expand.js";
import { cargarModificadores, permutar } from "../keywords/permute.js";
import { RUTA_SNAPSHOT, cargarSnapshot } from "../keywords/seeds.js";
import { normalizeKeyword } from "../keywords/normalize.js";

/** Destino por defecto del universo candidato. Es un artefacto commiteado: el plan 04 lo
 *  clasifica y el plan 05 lo enriquece. */
export const RUTA_CANDIDATOS = path.join(SEO_TOOLS_ROOT, "data", "candidates.jsonl");

/**
 * Cuando la corrida usa un archivo de semillas distinto del snapshot (el fixture con el que
 * se prueba el tope de cuota, por ejemplo), el resultado NO puede pisar el universo bueno.
 * Se desvia a la zona de trabajo gitignoreada.
 */
function destinoPara(rutaSemillas: string, declarado: string | undefined): string {
  if (declarado !== undefined) return resolveFromRepoRoot(declarado);
  if (path.resolve(rutaSemillas) === path.resolve(RUTA_SNAPSHOT)) return RUTA_CANDIDATOS;

  const base = path.basename(rutaSemillas).replace(/\.json$/, "");
  return path.join(SEO_TOOLS_ROOT, ".cache", "expand", `candidates.${base}.jsonl`);
}

export async function run(flags: Flags): Promise<number> {
  const rutaSemillasDeclarada = flagString(flags, "seeds-file");
  const rutaSemillas =
    rutaSemillasDeclarada === undefined ? RUTA_SNAPSHOT : resolveFromRepoRoot(rutaSemillasDeclarada);
  const destino = destinoPara(rutaSemillas, flagString(flags, "out"));

  const { seeds } = await cargarSnapshot(rutaSemillas);
  const modificadores = await cargarModificadores();

  const brutos: Candidato[] = [];
  const brutosPorCapa: Record<string, number> = {};

  // --- Capa 1: permutacion determinista, sin una sola llamada de red ---

  const permutados = permutar(seeds, modificadores);
  brutosPorCapa["permutacion"] = permutados.length;

  for (const p of permutados) {
    brutos.push({
      keyword: p.keyword,
      keywordKey: normalizeKeyword(p.keyword),
      semilla: p.semilla,
      capa: "permutacion",
      estado: "sin_datos",
    });
  }

  const resultado = consolidar(brutos);

  console.log(`Semillas: ${seeds.length} (${rutaSemillas})`);
  console.log("");
  console.log("Candidatos brutos por capa");
  for (const [capa, n] of Object.entries(brutosPorCapa)) console.log(`  ${capa}: ${n}`);
  console.log("");
  console.log(`Tras deduplicar por clave normalizada: ${resultado.trasDeduplicar}`);
  console.log(`Tras filtrar por relevancia y geografia: ${resultado.trasFiltrar}`);
  console.log("Total final por capa (gana la capa que primero encontro la keyword)");
  for (const [capa, n] of Object.entries(resultado.porCapa)) console.log(`  ${capa}: ${n}`);
  console.log(`TOTAL: ${resultado.candidatos.length}`);

  if (flagBool(flags, "dry-run")) {
    console.log("");
    console.log(`--dry-run: no se escribio ${destino}.`);
    return 0;
  }

  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, serializarCandidatos(resultado.candidatos), "utf8");

  console.log("");
  console.log(`Universo candidato: ${destino}`);

  return 0;
}
