/**
 * kw:enrich — Rellena volumen, CPC y competencia de las keywords que la expansion no cubrio.
 *
 * REDIMENSIONADO respecto de lo que dibujo el plan. La expansion del plan 03 usa la misma
 * fuente y sus respuestas ya traen las tres metricas, asi que el universo llega mayormente
 * enriquecido y este subcomando rellena huecos en vez de recorrerlo entero. Lo que escribe son
 * campos que el esquema del plan 04 ya declaro: NO migra nada.
 *
 * Las tres metricas diferidas por la decision de Juan del 2026-08-10 -- potencial de trafico,
 * dificultad y dominios de referencia -- salen de aca exactamente como entraron, y hay una
 * guarda que se niega a escribir el archivo si alguna perdio su valor literal.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { flagBool, flagNumber, flagString, type Flags } from "../cli.js";
import { CACHE_DIR, CliError, SEO_TOOLS_ROOT } from "../config.js";
import { enriquecer, pendientesDeMetricas, type RegistroKeyword } from "../keywords/enrich.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { QuotaBook } from "../quota.js";
import { cacheKey, type RunCounters } from "../cache.js";
import { DINORANK_ENDPOINT, DINORANK_FUENTE, parametrosKeywordResearch } from "../sources/dinorank.js";

/** Dataset consolidado del plan 04. Entrada y salida de este subcomando. */
const RUTA_DATASET = path.join(SEO_TOOLS_ROOT, "data", "keywords.jsonl");

const RUTA_CONSULTAS_PENDIENTES = path.join(CACHE_DIR, "pending-enrich.json");

const CONCURRENCIA_POR_DEFECTO = 3;

function resolverRuta(candidata: string): string {
  if (path.isAbsolute(candidata)) return candidata;
  const desdeCwd = path.resolve(process.cwd(), candidata);
  if (existsSync(desdeCwd)) return desdeCwd;
  return path.resolve(SEO_TOOLS_ROOT, candidata);
}

async function leerDataset(ruta: string): Promise<RegistroKeyword[]> {
  let crudo: string;
  try {
    crudo = await readFile(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer el dataset consolidado.\n  Ruta: ${ruta}\n` +
        `  Accion: correr antes "npm run cli -- kw:classify", que es quien lo produce.`,
    );
  }

  const salida: RegistroKeyword[] = [];
  crudo.split("\n").forEach((linea, i) => {
    const texto = linea.trim();
    if (texto === "") return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(texto);
    } catch {
      throw new CliError(`La linea ${i + 1} de ${ruta} no es JSON valido.`);
    }
    salida.push(parsed as RegistroKeyword);
  });
  return salida;
}

function usage(): string {
  return [
    "Uso: npm run cli -- kw:enrich [banderas]",
    "",
    "  --input <ruta>       Dataset a enriquecer. Por defecto, data/keywords.jsonl.",
    "  --out <ruta>         Destino. Por defecto, el mismo archivo de entrada.",
    "  --limit <n>          Tope de consultas de ESTA corrida. Una consulta resuelve varias",
    "                       keywords, asi que no es un tope de keywords.",
    "  --concurrency <n>    Llamadas en vuelo. Por defecto, 3.",
    "  --all-scopes         Enriquece tambien lo que el eje de alcance marco fuera del negocio.",
    "                       Por defecto solo se gasta en las de alcance objetivo.",
    "  --max-words <n>      Solo consulta keywords de hasta n palabras. La fuente resuelve",
    "                       terminos cabecera: medido, de 1 a 3 palabras rinde un 14% y de 4 o",
    "                       mas rinde cero.",
    "  --dry-run            Reporta cuanto habria que consultar y no escribe ni consulta nada.",
    "  --plan-only          Emite las claves de cache a rellenar sin gastar una sola consulta.",
    "  --offline            Prohibe salir a la red: resuelve solo lo que ya este en cache.",
    "  --refresh            Vuelve a consultar aunque la respuesta este en cache.",
    "",
    "Las tres metricas diferidas conservan su valor literal. Hay una guarda que se niega a",
    "escribir el archivo si alguna lo pierde.",
    "",
  ].join("\n");
}

export async function run(flags: Flags): Promise<number> {
  if (flagBool(flags, "help")) {
    process.stdout.write(usage());
    return 0;
  }

  const rutaEntrada = resolverRuta(flagString(flags, "input") ?? RUTA_DATASET);
  const registros = await leerDataset(rutaEntrada);
  const soloObjetivo = !flagBool(flags, "all-scopes");
  const maxPalabras = flagNumber(flags, "max-words");

  const pendientes = pendientesDeMetricas(registros, { soloObjetivo, maxPalabras });
  const pendientesTodas = pendientesDeMetricas(registros);

  console.log(`Dataset: ${path.relative(SEO_TOOLS_ROOT, rutaEntrada)} (${registros.length} keywords)`);
  console.log(`Ya con metricas: ${registros.length - pendientesTodas.length}`);
  console.log(`Sin metricas: ${pendientesTodas.length}`);
  console.log(
    `Se consultaran: ${pendientes.length}` +
      (soloObjetivo ? " (solo alcance objetivo: la deriva del universo no paga cuota)" : "") +
      (maxPalabras !== undefined ? ` (solo de hasta ${maxPalabras} palabras)` : ""),
  );
  console.log("");

  // --- Camino de relleno: no se llama a nadie, se emiten las claves de cache ---

  if (flagBool(flags, "plan-only")) {
    const consultas = pendientes.map((r) => ({
      fuente: DINORANK_FUENTE,
      endpoint: DINORANK_ENDPOINT,
      keyword: r.keyword,
      parametros: parametrosKeywordResearch(r.keyword),
      clave: cacheKey(DINORANK_FUENTE, DINORANK_ENDPOINT, parametrosKeywordResearch(r.keyword)),
    }));

    await mkdir(path.dirname(RUTA_CONSULTAS_PENDIENTES), { recursive: true });
    await writeFile(
      RUTA_CONSULTAS_PENDIENTES,
      `${JSON.stringify({ schema: 1, consultas }, null, 2)}\n`,
      "utf8",
    );

    console.log(`consultas planificadas: ${consultas.length}`);
    console.log(`Consultas pendientes: ${path.relative(SEO_TOOLS_ROOT, RUTA_CONSULTAS_PENDIENTES)}`);
    console.log("  npm run cli -- cache:put --source dinorank --key <clave> --file <archivo.json>");
    return 0;
  }

  if (flagBool(flags, "dry-run")) {
    console.log("Modo ensayo: no se consulta ni se escribe nada.");
    const limite = flagNumber(flags, "limit");
    console.log(`consultas que se emitirian: ${limite === undefined ? pendientes.length : Math.min(limite, pendientes.length)}`);
    return 0;
  }

  const quota = await QuotaBook.open(CACHE_DIR);
  const stats: RunCounters = { hits: 0, misses: 0 };
  const antes = quota.total(DINORANK_FUENTE);

  const resultado = await enriquecer(registros, {
    cacheDir: CACHE_DIR,
    offline: flagBool(flags, "offline"),
    refresh: flagBool(flags, "refresh"),
    limit: flagNumber(flags, "limit"),
    concurrency: flagNumber(flags, "concurrency") ?? CONCURRENCIA_POR_DEFECTO,
    soloObjetivo,
    maxPalabras,
    quota,
    stats,
    onProgreso: (hechas, total) => {
      if (hechas % 25 === 0 || hechas === total) console.log(`  consultadas ${hechas}/${total}`);
    },
  });

  const destino = resolverRuta(flagString(flags, "out") ?? rutaEntrada);
  const lineas = resultado.registros.map((r) => JSON.stringify(r));
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, `${lineas.join("\n")}\n`, "utf8");

  const conMetricas = resultado.registros.filter(
    (r) => r.metricas.searchVolumeFuente !== "sin_datos",
  ).length;

  console.log("");
  console.log(`pendientes al empezar: ${resultado.pendientes}`);
  console.log(`cosechadas de la cache, sin gastar nada: ${resultado.cosechadasDeCache}`);
  console.log(`consultas emitidas: ${resultado.consultas}`);
  console.log(`resueltas con metricas: ${resultado.resueltas}`);
  console.log(`consultadas y sin datos en la fuente: ${resultado.sinDatos}`);
  console.log(`sin consultar por el tope: ${resultado.sinConsultar}`);
  if (resultado.faltantesEnCache > 0) {
    console.log(`ausentes de la cache en modo offline: ${resultado.faltantesEnCache}`);
  }
  console.log("");
  console.log(`llamadas de red a DinoRank en esta corrida: ${quota.total(DINORANK_FUENTE) - antes}`);
  console.log(`consumo acumulado de DinoRank: ${quota.total(DINORANK_FUENTE)}`);
  console.log(`aciertos de cache: ${stats.hits}`);
  console.log("");
  console.log(
    `dataset: ${path.relative(SEO_TOOLS_ROOT, destino)} ` +
      `(${lineas.length} lineas, ${conMetricas} con metricas, ${lineas.length - conMetricas} sin datos)`,
  );

  // El campo de procedencia esta resuelto para el cien por ciento de las lineas por
  // construccion: o nombra la fuente, o dice sin_datos. Se comprueba igual, porque es el
  // criterio de KWR-02 y una regresion silenciosa aca es invisible en el Sheet.
  const sinResolver = resultado.registros.filter(
    (r) => r.metricas.searchVolumeFuente !== "dinorank" && r.metricas.searchVolumeFuente !== "sin_datos",
  );
  if (sinResolver.length > 0) {
    throw new CliError(
      `${sinResolver.length} lineas quedaron con la procedencia del volumen sin resolver.\n` +
        `  Primera: ${normalizeKeyword(sinResolver[0]?.keyword ?? "")}`,
    );
  }

  return 0;
}
