#!/usr/bin/env tsx
/**
 * Punto de entrada de las 10 de Oro (KWR-06).
 *
 * Une lo que midieron los cuatro planes anteriores y no consulta NINGUNA fuente: lee de disco,
 * asi que correrlo cuesta cero busquedas de SerpApi y cero unidades de Ahrefs. Se puede volver a
 * correr las veces que haga falta mientras Juan discute la lista.
 *
 *     ./node_modules/.bin/tsx src/phase13/golden-run.ts              # escribe el json y el .md
 *     ./node_modules/.bin/tsx src/phase13/golden-run.ts --out /tmp/g.json   # solo el json
 *
 * La salida es determinista: mismo disco, mismo SHA-256. No lleva fecha de generacion adentro
 * justamente para que dos corridas se puedan comparar byte a byte.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { ejecutar, parseBanderas, texto } from "./args.js";
import {
  cargarCriterio,
  construir,
  descartadasDeMayorVolumen,
  documento,
  elegir,
  evaluarCandidatas,
  serializar,
  type CabezaEntrada,
  type FilaDelUniverso,
  type Semilla,
} from "./golden.js";

const RUTA_SWEET = path.join(SEO_TOOLS_ROOT, "data", "sweet-spot.jsonl");
const RUTA_UNIVERSO = path.join(SEO_TOOLS_ROOT, "data", "keywords.jsonl");
const RUTA_AHREFS = path.join(SEO_TOOLS_ROOT, "data", "ahrefs-keywords.jsonl");
const RUTA_CLUSTERS = path.join(SEO_TOOLS_ROOT, "data", "clusters.json");
const RUTA_SEMILLAS = path.join(SEO_TOOLS_ROOT, "data", "seeds.json");
const RUTA_SALIDA = path.join(SEO_TOOLS_ROOT, "data", "golden-10.json");
const RUTA_DOC = path.join(
  SEO_TOOLS_ROOT,
  "..",
  ".planning",
  "workstreams",
  "seo-keywords",
  "phases",
  "13-clusters-competencia-y-las-10-de-oro",
  "13-DIEZ-DE-ORO.md",
);

function leerJsonl<T>(ruta: string): T[] {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(`No se pudo leer ${ruta}. Lo produce un plan anterior de la fase 13.`);
  }
  const salida: T[] = [];
  for (const linea of crudo.split("\n")) {
    const t = linea.trim();
    if (t !== "") salida.push(JSON.parse(t) as T);
  }
  return salida;
}

interface FilaSweet {
  keyword: string;
  keywordKey: string;
  cluster: string | null;
  rango: number;
  familia: string;
  intent: string;
  volumen: number | null;
  volumenFuente: string;
  keywordDifficulty: number | null;
  keywordDifficultyFuente: string;
  trafficPotential: number | null;
  trafficPotentialFuente: string;
  nivel: "alto" | "medio" | "bajo";
  disputables: number;
  barreras: number;
  posicionesMedidas: number;
  primeraDisputable: number | null;
  posiciones: { posicion: number; dominio: string; url: string; tipo: string; veredicto: string; motivo: string }[];
  competidoresEnTop: { domain: string; domainRating: number | null }[];
  razones: string[];
}

interface FilaUniverso {
  keyword: string;
  keywordKey: string;
  semilla: string | null;
  intent: string;
  stage: string;
  alcance: string;
  motivoAlcance: string | null;
  metricas: { searchVolume: number | null; searchVolumeFuente: string };
}

interface FilaAhrefs {
  keywordKey: string;
  keywordDifficulty: number | null;
  keywordDifficultyFuente: string;
  trafficPotential: number | null;
  trafficPotentialFuente: string;
  volume: number | null;
  volumeFuente: string;
}

async function main(): Promise<number> {
  const out = process.stdout;
  const banderas = parseBanderas(process.argv.slice(2));
  const destino = texto(banderas, "out") ?? RUTA_SALIDA;
  const escribeDoc = destino === RUTA_SALIDA;

  const criterio = cargarCriterio();
  const semillas = (JSON.parse(readFileSync(RUTA_SEMILLAS, "utf8")) as { seeds: Semilla[] }).seeds;
  const sweet = leerJsonl<FilaSweet>(RUTA_SWEET);
  const universo = leerJsonl<FilaUniverso>(RUTA_UNIVERSO);
  const ahrefs = new Map(leerJsonl<FilaAhrefs>(RUTA_AHREFS).map((a) => [a.keywordKey, a]));
  const clusters = JSON.parse(readFileSync(RUTA_CLUSTERS, "utf8")) as {
    clusters: { id: string; tipoDePagina: string | null }[];
  };
  const tipoPorCluster = new Map(clusters.clusters.map((c) => [c.id, c.tipoDePagina]));
  const porClave = new Map(universo.map((u) => [u.keywordKey, u]));

  const cabezas: CabezaEntrada[] = [];
  const sinUniverso: string[] = [];

  for (const s of sweet) {
    const u = porClave.get(s.keywordKey);
    if (u === undefined) {
      sinUniverso.push(s.keywordKey);
      continue;
    }
    const a = ahrefs.get(s.keywordKey);
    cabezas.push({
      keyword: s.keyword,
      keywordKey: s.keywordKey,
      cluster: s.cluster,
      tipoDePagina: s.cluster === null ? null : (tipoPorCluster.get(s.cluster) ?? null),
      rango: s.rango,
      familia: s.familia,
      intent: u.intent,
      stage: u.stage,
      alcance: u.alcance,
      motivoAlcance: u.motivoAlcance,
      semilla: u.semilla,
      volumenDinorank: u.metricas.searchVolumeFuente === "dinorank" ? u.metricas.searchVolume : null,
      volumenAhrefs: a?.volumeFuente === "ahrefs" ? (a.volume ?? null) : null,
      volumenFuente: u.metricas.searchVolumeFuente,
      keywordDifficulty: s.keywordDifficulty,
      keywordDifficultyFuente: s.keywordDifficultyFuente,
      trafficPotential: s.trafficPotential,
      trafficPotentialFuente: s.trafficPotentialFuente,
      nivel: s.nivel,
      disputables: s.disputables,
      barreras: s.barreras,
      posicionesMedidas: s.posicionesMedidas,
      primeraDisputable: s.primeraDisputable,
      posiciones: s.posiciones,
      competidoresEnTop: s.competidoresEnTop,
      razones: s.razones,
    });
  }

  if (sinUniverso.length > 0) {
    throw new CliError(
      `${sinUniverso.length} cabezas del punto dulce no estan en data/keywords.jsonl: ` +
        `${sinUniverso.slice(0, 5).join(", ")}. Los dos datasets tienen que venir de la misma corrida.`,
    );
  }

  const { candidatas, rechazadas } = evaluarCandidatas(cabezas, semillas, criterio);
  const seleccion = elegir(candidatas, criterio, 10);

  if (seleccion.elegidas.length !== 10) {
    throw new CliError(
      `Salieron ${seleccion.elegidas.length} keywords de oro y no diez. Con ${candidatas.length} ` +
        `candidatas y ${rechazadas.length} rechazadas, o la regla de cluster esta cerrando de mas o ` +
        `las puertas dejaron pasar de menos. Revisar data/golden-criterio.json antes de tocar el codigo.`,
    );
  }

  const elegidasKeys = new Set(seleccion.elegidas.map((e) => e.cabeza.keywordKey));
  const motivosDeRechazo = new Map(rechazadas.map((r) => [r.keywordKey, r.motivo]));
  for (const d of seleccion.desplazadas) {
    if (!motivosDeRechazo.has(d.keywordKey)) motivosDeRechazo.set(d.keywordKey, d.motivo);
  }

  const filasDelUniverso: FilaDelUniverso[] = universo.map((u) => ({
    keyword: u.keyword,
    keywordKey: u.keywordKey,
    volumen: u.metricas.searchVolume,
    volumenFuente: u.metricas.searchVolumeFuente,
    alcance: u.alcance,
    motivoAlcance: u.motivoAlcance,
    intent: u.intent,
  }));

  const descartadas = descartadasDeMayorVolumen(filasDelUniverso, elegidasKeys, motivosDeRechazo, criterio, 20);
  const golden = construir(seleccion, descartadas, criterio, candidatas);

  out.write(`Cabezas leidas del punto dulce: ${cabezas.length}\n`);
  out.write(`  candidatas que pasan las tres puertas: ${candidatas.length}\n`);
  out.write(`  rechazadas en la puerta:               ${rechazadas.length}\n`);
  for (const puerta of ["alcance", "veto", "servicio propio", "piso de evidencia"]) {
    out.write(`    ${puerta.padEnd(20)} ${rechazadas.filter((r) => r.puerta === puerta).length}\n`);
  }
  out.write(`\nLas diez:\n`);
  for (const e of seleccion.elegidas) {
    out.write(
      `  ${String(e.puesto).padStart(2)}. ${e.cabeza.keyword.padEnd(42)} ` +
        `[${e.cabeza.cluster ?? "sin cluster"}] valor ${e.valor.puntos} · ` +
        `${e.cabeza.nivel} ${e.cabeza.disputables}/${e.cabeza.posicionesMedidas}\n`,
    );
  }
  const clustersDistintos = new Set(seleccion.elegidas.map((e) => e.cabeza.cluster ?? "sin-cluster"));
  out.write(`\nClusters distintos entre las diez: ${clustersDistintos.size}\n`);
  out.write(`Descartadas de mayor volumen documentadas: ${descartadas.length}\n`);

  writeFileSync(destino, serializar(golden), "utf8");
  out.write(`\nEscrito: ${destino}\n`);
  if (escribeDoc) {
    writeFileSync(RUTA_DOC, documento(golden, criterio), "utf8");
    out.write(`Escrito: ${RUTA_DOC}\n`);
  }
  return 0;
}

// Sin esta guarda, importar el modulo desde una prueba correria `main` con los argumentos del
// corredor de pruebas. Es la trampa que `args.ts` documenta desde el plan 13-01.
if (process.argv[1] !== undefined && process.argv[1].endsWith("golden-run.ts")) {
  ejecutar(main);
}
