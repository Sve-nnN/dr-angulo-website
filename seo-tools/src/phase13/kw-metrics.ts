#!/usr/bin/env tsx
/**
 * Punto de entrada de las metricas de keyword de Ahrefs (plan 13-04, tarea 1).
 *
 * Reconstruye `data/ahrefs-keywords.jsonl` desde la cache y reporta el balance: cuantas cabezas
 * quedaron con KD, cuantas sin el, y la comparacion de volumen entre las dos fuentes para las
 * que tienen las dos. Esa comparacion va al SUMMARY tal como salga: es la unica senal de que
 * hay un problema de medicion entre proveedores y ocultarla seria perderla (D-08).
 *
 * NO CONSULTA NADA. Lee de la cache y del disco. Si faltan consultas por ingerir, lo dice y
 * nombra el comando del traspaso en vez de salir a buscarlas.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/kw-metrics.ts --rebuild
 *   ./node_modules/.bin/tsx src/phase13/kw-metrics.ts --pendientes
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { FECHA_DE_MEDICION } from "./ahrefs.js";
import {
  RUTA_METRICAS,
  compararVolumenes,
  construirMetricas,
  escribirMetricas,
  registrarCorridaDeKeywords,
  unidadesDelAlcance,
  type Cabeza,
  type MetricasDeCabeza,
} from "./ahrefs-keywords.js";
import { booleana, ejecutar, parseBanderas, texto } from "./args.js";

const RUTA_CANDIDATAS = path.join(SEO_TOOLS_ROOT, "data", "serp-candidates.json");
const RUTA_KEYWORDS = path.join(SEO_TOOLS_ROOT, "data", "keywords.jsonl");

/** Las cuatro condiciones que el doctor efectivamente opera y que v1.1 ya publico. */
const NUCLEO = ["hernia discal", "estenosis espinal", "escoliosis", "ortopedia infantil"];

interface RegistroDeKeyword {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly metricas?: {
    readonly searchVolume?: number | null;
    readonly searchVolumeFuente?: string;
  };
}

function leerCabezas(ruta: string): Cabeza[] {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer la lista de cabezas.\n  Ruta: ${ruta}\n` +
        `  Accion: generarla con src/phase13/serp-candidates.ts (plan 13-02).`,
    );
  }
  const archivo = JSON.parse(crudo) as { candidatas?: { keyword: string; keywordKey: string }[] };
  if (!Array.isArray(archivo.candidatas) || archivo.candidatas.length === 0) {
    throw new CliError(`${ruta} no trae el arreglo "candidatas".`);
  }
  return archivo.candidatas.map((c) => ({ keyword: c.keyword, keywordKey: c.keywordKey }));
}

function leerVolumenesDeDinorank(ruta: string): {
  keywordKey: string;
  volume: number | null;
  volumeFuente: string;
}[] {
  const crudo = readFileSync(ruta, "utf8");
  const salida: { keywordKey: string; volume: number | null; volumeFuente: string }[] = [];
  for (const linea of crudo.split("\n")) {
    const texto = linea.trim();
    if (texto === "") continue;
    const o = JSON.parse(texto) as RegistroDeKeyword;
    salida.push({
      keywordKey: o.keywordKey,
      volume: o.metricas?.searchVolume ?? null,
      volumeFuente: o.metricas?.searchVolumeFuente ?? "sin_datos",
    });
  }
  return salida;
}

function tabla(filas: readonly MetricasDeCabeza[]): { conKD: number; sinDato: number; sinConsultar: number } {
  let conKD = 0;
  let sinDato = 0;
  let sinConsultar = 0;
  for (const f of filas) {
    if (f.keywordDifficultyFuente === "ahrefs") conKD += 1;
    else if (f.keywordDifficultyFuente === "ahrefs_sin_dato") sinDato += 1;
    else sinConsultar += 1;
  }
  return { conKD, sinDato, sinConsultar };
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const out = process.stdout;

  const cabezas = leerCabezas(texto(banderas, "candidates") ?? RUTA_CANDIDATAS);
  const filas = await construirMetricas(cabezas);
  const balance = tabla(filas);

  out.write(`Cabezas: ${filas.length}\n`);
  out.write(`  con KD de Ahrefs:              ${balance.conKD}\n`);
  out.write(`  en cache y la fuente sin dato: ${balance.sinDato}\n`);
  out.write(`  todavia sin consultar:         ${balance.sinConsultar}\n`);

  // Las cuatro condiciones nucleo, siempre, con su procedencia. Son el motivo por el que
  // Ahrefs vuelve al milestone: el techo de 900 de DinoRank las dejo sin volumen.
  out.write(`\nLas cuatro condiciones nucleo del negocio:\n`);
  for (const n of NUCLEO) {
    const clave = normalizeKeyword(n);
    const f = filas.find((x) => x.keywordKey === clave);
    if (f === undefined) {
      out.write(`  ${n.padEnd(20)} NO ESTA EN LA LISTA DE CABEZAS\n`);
      continue;
    }
    out.write(
      `  ${n.padEnd(20)} KD=${String(f.keywordDifficulty)} [${f.keywordDifficultyFuente}]` +
        `  TP=${String(f.trafficPotential)} [${f.trafficPotentialFuente}]` +
        `  vol=${String(f.volume)} [${f.volumeFuente}]\n`,
    );
  }

  // La comparacion entre las dos fuentes. Se imprime siempre, aunque salga vacia: vacia
  // significa que todavia no hay con que comparar, que es distinto de "no discrepan".
  const discrepancias = compararVolumenes(
    filas.map((f) => ({
      keyword: f.keyword,
      keywordKey: f.keywordKey,
      volume: f.volume,
      volumeFuente: f.volumeFuente,
    })),
    leerVolumenesDeDinorank(RUTA_KEYWORDS),
  );

  out.write(`\nVolumen: cabezas con dato en LAS DOS fuentes: ${discrepancias.length}\n`);
  if (discrepancias.length === 0) {
    out.write(`  (ninguna todavia: hace falta el volumen de Ahrefs para poder comparar)\n`);
  }
  for (const d of discrepancias) {
    out.write(
      `  ${d.keywordKey.padEnd(40)} ahrefs=${d.volumenAhrefs}  dinorank=${d.volumenDinorank}` +
        `${d.discrepan ? `  DISCREPAN${d.factor === null ? "" : ` (x${d.factor})`}` : "  coinciden"}\n`,
    );
  }

  const pendientes = filas.filter((f) => !f.enCache);
  if (pendientes.length > 0) {
    out.write(
      `\nConsultas de keyword PENDIENTES de ingerir: ${pendientes.length} de ${filas.length}.\n` +
        `  Requieren una sesion con el servidor MCP de Ahrefs. El traspaso completo esta en\n` +
        `  la seccion 8 del README y en el SUMMARY del plan 13-03:\n` +
        `    1) ./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts --keywords data/serp-candidates.json --pendientes\n` +
        `    2) capturar cada cuerpo por el MCP\n` +
        `    3) ./node_modules/.bin/tsx src/phase13/ahrefs-ingest.ts --endpoint keywords-explorer/overview --params '...' --file ... --plan 13-04\n` +
        `    4) volver a correr este comando con --rebuild\n`,
    );
    if (booleana(banderas, "pendientes")) {
      for (const p of pendientes.slice(0, 10)) out.write(`    - ${p.keyword}  ->  ${p.clave}\n`);
      if (pendientes.length > 10) out.write(`    ... y ${pendientes.length - 10} mas\n`);
    }
  }

  if (!booleana(banderas, "rebuild")) {
    out.write(`\nSolo lectura: sin --rebuild no se escribio ningun archivo.\n`);
    return 0;
  }

  await escribirMetricas(filas);
  await registrarCorridaDeKeywords({
    plan: "13-04",
    consultas: filas.length,
    ingeridas: filas.filter((f) => f.enCache).length,
    fecha: FECHA_DE_MEDICION,
  });

  out.write(`\nEscrito: ${RUTA_METRICAS}\n`);
  out.write(
    `Libro de unidades actualizado. Alcance de este plan: ${filas.length} consultas, ` +
      `${unidadesDelAlcance(filas.length)} unidades estimadas.\n`,
  );
  return 0;
}

ejecutar(main);
