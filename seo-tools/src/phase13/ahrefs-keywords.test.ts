/**
 * Pruebas de las metricas de keyword de Ahrefs (plan 13-04, tarea 1).
 *
 * Hay una prueba nombrada por cada comportamiento del bloque `<behavior>` del plan, y todas
 * corren SIN CREDENCIAL y SIN RED: la cache se rellena a mano en un directorio temporal, que
 * es exactamente el seam que la fase 12 dejo armado para una fuente sin credencial en el
 * proceso de Node.
 *
 * La regla que atraviesa todo el archivo: una metrica ausente vale `null` con su procedencia
 * declarada, JAMAS cero. Un cero afirma algo que nadie midio, y las cuatro condiciones nucleo
 * del negocio se irian al final de cualquier orden por volumen si se confundieran los dos.
 */

import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { writeEnvelope, type CacheEnvelope } from "../cache.js";
import { QuotaBook } from "../quota.js";
import {
  ENDPOINTS,
  claveDeConsulta,
  paramsDeKeyword,
  registrarCorrida,
  parsearPorEndpoint,
} from "./ahrefs.js";
import {
  compararVolumenes,
  construirMetricas,
  parsearKeywordsOverview,
  registrarCorridaDeKeywords,
  serializar,
  type Cabeza,
} from "./ahrefs-keywords.js";

async function directorio(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "ahrefs-kw-"));
}

/** Deja en cache una respuesta de `keywords-explorer/overview` para una keyword. */
async function sembrar(cacheDir: string, keyword: string, cuerpo: unknown): Promise<void> {
  const params = paramsDeKeyword(keyword);
  const envelope: CacheEnvelope = {
    schema: 1,
    source: "ahrefs",
    endpoint: ENDPOINTS.keywordsOverview,
    request: params,
    fetchedAt: "2026-08-11T18:00:00.000Z",
    outcome:
      cuerpo !== null &&
      typeof cuerpo === "object" &&
      Array.isArray((cuerpo as Record<string, unknown>)["keywords"]) &&
      ((cuerpo as Record<string, unknown>)["keywords"] as unknown[]).length > 0
        ? "ok"
        : "empty",
    httpStatus: 200,
    response: cuerpo,
    error: null,
  };
  await writeEnvelope(cacheDir, claveDeConsulta(ENDPOINTS.keywordsOverview, params), envelope);
}

const cabeza = (keyword: string, keywordKey = keyword): Cabeza => ({ keyword, keywordKey });

// ---------------------------------------------------------------------------
// Comportamiento 1
// ---------------------------------------------------------------------------

test("comportamiento 1: una keyword que Ahrefs no conoce queda declarada como desconocida por esa fuente, nunca como cero", async () => {
  const dir = await directorio();
  // Respuesta VACIA: es lo que Ahrefs devuelve para el geo long tail de Lima, que es
  // justamente donde DinoRank si tiene datos.
  await sembrar(dir, "traumatologo surco", { keywords: [] });

  const filas = await construirMetricas([cabeza("traumatologo surco")], { cacheDir: dir });

  assert.equal(filas.length, 1);
  const fila = filas[0];
  for (const campo of ["keywordDifficulty", "trafficPotential", "volume"] as const) {
    assert.equal(fila?.[campo], null, `${campo} tiene que ser null y no cero`);
    assert.notEqual(fila?.[campo], 0);
    assert.equal(
      fila?.[`${campo}Fuente`],
      "ahrefs_sin_dato",
      `${campo} tiene que declarar que la fuente NO conoce la keyword`,
    );
  }
});

test("comportamiento 1 bis: una keyword que nunca se consulto se distingue de una que la fuente no conoce", async () => {
  const dir = await directorio();
  await sembrar(dir, "hernia discal", { keywords: [{ keyword: "hernia discal", difficulty: 5 }] });

  const filas = await construirMetricas(
    [cabeza("hernia discal"), cabeza("escoliosis")],
    { cacheDir: dir },
  );

  const consultada = filas.find((f) => f.keywordKey === "hernia discal");
  const sinConsultar = filas.find((f) => f.keywordKey === "escoliosis");

  assert.equal(consultada?.keywordDifficultyFuente, "ahrefs");
  assert.equal(consultada?.keywordDifficulty, 5);

  // Los tres estados existen y NO son intercambiables. `no_consultado` no es `ahrefs_sin_dato`.
  assert.equal(sinConsultar?.keywordDifficultyFuente, "no_consultado");
  assert.equal(sinConsultar?.keywordDifficulty, null);
  assert.equal(sinConsultar?.enCache, false);

  // Una consulta en cache a la que le falta UN campo declara ese campo como sin dato, no como
  // no consultado: la consulta si se hizo.
  assert.equal(consultada?.volumeFuente, "ahrefs_sin_dato");
  assert.equal(consultada?.volume, null);
});

// ---------------------------------------------------------------------------
// Comportamiento 2
// ---------------------------------------------------------------------------

test("comportamiento 2: cuando las dos fuentes dan volumenes distintos se conservan LOS DOS, cada uno con su fuente", () => {
  // El caso medido: `hernia discal` en Peru devuelve 6.000 en Ahrefs y 0 en DataForSEO via
  // DinoRank. D-08 prohibe promediar, elegir uno u ocultar el conflicto.
  const comparacion = compararVolumenes(
    [
      {
        keyword: "hernia discal",
        keywordKey: "hernia discal",
        volume: 6000,
        volumeFuente: "ahrefs",
      },
    ],
    [{ keywordKey: "hernia discal", volume: 0, volumeFuente: "dinorank" }],
  );

  assert.equal(comparacion.length, 1);
  assert.equal(comparacion[0]?.volumenAhrefs, 6000);
  assert.equal(comparacion[0]?.volumenDinorank, 0);
  assert.equal(comparacion[0]?.discrepan, true);
  // Ni un promedio ni un ganador: el registro no declara ningun campo que resuelva el conflicto.
  assert.equal(Object.hasOwn(comparacion[0] ?? {}, "volumen"), false);
  assert.equal(Object.hasOwn(comparacion[0] ?? {}, "volumenElegido"), false);
});

test("comportamiento 2 bis: una keyword con volumen en una sola fuente no entra en la comparacion", () => {
  const comparacion = compararVolumenes(
    [{ keyword: "escoliosis", keywordKey: "escoliosis", volume: 900, volumeFuente: "ahrefs" }],
    [{ keywordKey: "escoliosis", volume: null, volumeFuente: "sin_datos" }],
  );
  assert.deepEqual(comparacion, [], "comparar contra un dato ausente no es una discrepancia");
});

// ---------------------------------------------------------------------------
// Comportamiento 3
// ---------------------------------------------------------------------------

test("comportamiento 3: reconstruir el archivo desde la cache NO emite ninguna consulta nueva", async () => {
  const dir = await directorio();
  await sembrar(dir, "ciatica", { keywords: [{ keyword: "ciatica", difficulty: 12, volume: 400 }] });

  const antes = (await QuotaBook.open(dir)).total("ahrefs");
  const uno = await construirMetricas([cabeza("ciatica"), cabeza("lumbalgia")], { cacheDir: dir });
  const dos = await construirMetricas([cabeza("ciatica"), cabeza("lumbalgia")], { cacheDir: dir });
  const despues = (await QuotaBook.open(dir)).total("ahrefs");

  assert.equal(antes, despues, "el libro de cuota no se movio");
  assert.equal(serializar(uno), serializar(dos), "dos reconstrucciones dan el mismo archivo");
});

// ---------------------------------------------------------------------------
// Comportamiento 4
// ---------------------------------------------------------------------------

test("comportamiento 4: el consumo de este plan se SUMA al del plan 13-03 en el mismo archivo de uso", async () => {
  const dir = await directorio();
  const ruta = path.join(dir, "ahrefs-usage.json");

  await registrarCorrida(
    {
      plan: "13-03",
      estado: "ingerido",
      fecha: "2026-08-11",
      consultasPorEndpoint: { [ENDPOINTS.domainRating]: 6 },
    },
    ruta,
  );

  await registrarCorridaDeKeywords({ plan: "13-04", consultas: 91, ingeridas: 0, fecha: "2026-08-11", ruta });

  const libro = JSON.parse(await readFile(ruta, "utf8")) as {
    corridas: { plan: string; estado: string; consultas: number }[];
    consultas: number;
  };

  assert.equal(libro.corridas.length, 2, "el archivo acumula las dos corridas");
  assert.deepEqual(
    libro.corridas.map((c) => c.plan).sort(),
    ["13-03", "13-04"],
    "ninguna corrida pisa a la otra",
  );
  assert.equal(libro.consultas, 6 + 91, "el total suma las dos");
  assert.equal(
    libro.corridas.find((c) => c.plan === "13-03")?.estado,
    "ingerido",
    "lo ya ingerido por otro plan no se degrada",
  );
});

// ---------------------------------------------------------------------------
// Comportamiento 5
// ---------------------------------------------------------------------------

test("comportamiento 5: ninguna consulta se emite para una keyword que no este en la lista de cabezas", async () => {
  const dir = await directorio();
  // En la cache hay una keyword que NO es cabeza. El alcance de Ahrefs en esta fase son las
  // cabezas y nada mas, asi que no puede aparecer en la salida.
  await sembrar(dir, "clinica san bernardo especialistas en traumatologia", {
    keywords: [{ keyword: "clinica san bernardo", difficulty: 3, volume: 2400 }],
  });
  await sembrar(dir, "escoliosis", { keywords: [{ keyword: "escoliosis", difficulty: 9 }] });

  const filas = await construirMetricas([cabeza("escoliosis")], { cacheDir: dir });

  assert.deepEqual(filas.map((f) => f.keywordKey), ["escoliosis"]);
});

// ---------------------------------------------------------------------------
// El parser del endpoint
// ---------------------------------------------------------------------------

test("el parser de keywords-explorer/overview lee POR NOMBRE y deja null lo que no vino", () => {
  const filas = parsearKeywordsOverview({
    keywords: [
      { keyword: "hernia discal", difficulty: 5, volume: 6000, traffic_potential: 1500, cpc: 120 },
      { keyword: "sin metricas" },
    ],
  });

  assert.equal(filas.length, 2);
  assert.equal(filas[0]?.keywordDifficulty, 5);
  assert.equal(filas[0]?.volume, 6000);
  assert.equal(filas[0]?.trafficPotential, 1500);
  assert.equal(filas[1]?.keywordDifficulty, null);
  assert.equal(filas[1]?.volume, null);
  assert.equal(filas[1]?.trafficPotential, null);
});

test("la ingesta reconoce el endpoint de keywords: parsearPorEndpoint ya no devuelve null para el", () => {
  // Sin esto, `ahrefs-ingest.ts` imprimiria AVISO de contrato roto en las 91 ingestas de este
  // plan, que es justo la senal que existe para detectar una deriva real.
  const parseado = parsearPorEndpoint(ENDPOINTS.keywordsOverview, {
    keywords: [{ keyword: "hernia discal", difficulty: 5 }],
  });
  assert.ok(Array.isArray(parseado), "el parser del endpoint de keywords tiene que estar cableado");
  assert.equal((parseado as { keywordDifficulty: number | null }[])[0]?.keywordDifficulty, 5);
});

test("una cabeza con tilde consulta por el texto ORIGINAL y se indexa por la clave normalizada", async () => {
  const dir = await directorio();
  await sembrar(dir, "traumatólogo lima", {
    keywords: [{ keyword: "traumatólogo lima", difficulty: 4, volume: 70 }],
  });

  const filas = await construirMetricas([cabeza("traumatólogo lima", "traumatologo lima")], {
    cacheDir: dir,
  });

  assert.equal(filas[0]?.keywordKey, "traumatologo lima");
  assert.equal(filas[0]?.keyword, "traumatólogo lima");
  assert.equal(filas[0]?.keywordDifficulty, 4);
});

test("el archivo se serializa ordenado por clave, asi que dos corridas dan el mismo SHA", async () => {
  const dir = await directorio();
  await writeFile(path.join(dir, "vacio"), "", "utf8");
  const filas = await construirMetricas(
    [cabeza("zeta"), cabeza("alfa"), cabeza("media")],
    { cacheDir: dir },
  );
  assert.deepEqual(filas.map((f) => f.keywordKey), ["alfa", "media", "zeta"]);
});
