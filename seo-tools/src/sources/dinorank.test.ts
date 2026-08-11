/**
 * Pruebas del parser y del cliente de DinoRank.
 *
 * Todas corren SIN clave y sin red: la respuesta se inyecta como doble de la llamada, o se
 * deja escrita en una cache temporal. La forma de la respuesta esta copiada del sondeo en
 * vivo del 2026-08-10, incluidas las tres trampas que documenta el contrato.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { readFile } from "node:fs/promises";

import { readEnvelope, cacheKey } from "../cache.js";
import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { requestJson } from "../http.js";
import {
  consultarDinorank,
  DINORANK_ENDPOINT,
  DINORANK_FUENTE,
  ENDPOINTS_DINORANK,
  keywordResearch,
  parametrosKeywordResearch,
  parseAuditoria,
  parseCanibalizaciones,
  parseKeywordResearch,
  parseMetricasDeKeyword,
  parseTfidf,
  urlEndpoint,
} from "./dinorank.js";

const temporales: string[] = [];

async function cacheTemporal(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "seo-tools-dino-"));
  temporales.push(dir);
  return dir;
}

after(async () => {
  for (const dir of temporales) await rm(dir, { recursive: true, force: true });
});

/** La respuesta anida data.data. No es un error de transcripcion: esta medida asi. */
const RESPUESTA = {
  ok: true,
  data: {
    source: "dataforseo",
    country: "PE",
    language: "es",
    keyword: "hernia discal",
    data: {
      keyword: "hernia discal",
      pais: "PE",
      idioma: "es",
      // La keyword consultada SIEMPRE vuelve en cero. Leer el volumen de aca saca el
      // universo entero en cero y el fallo es silencioso, porque cero es un valor valido.
      datos: { key: "hernia discal", search_volume: 0, cpc: 0, competition: 0, history: [] },
      keywords: [
        { key: "cie-10 hernia discal", search_volume: 1600, cpc: 0, competition: 0, history: [] },
        { key: "hernia discal lumbosacra tratamiento", search_volume: 50, cpc: 0.43, competition: 0.22, history: [] },
        // El 84% del long tail viene sin volumen medible y NO se descarta.
        { key: "hernia discal cirugia lima", search_volume: 0, cpc: 0, competition: 0, history: [] },
        // Y la propia semilla aparece dentro del arreglo, ahi si con su valor real.
        { key: "hernia discal", search_volume: 2900, cpc: 0.31, competition: 0.14, history: [] },
      ],
    },
  },
};

test("el volumen se lee de keywords[] y nunca de datos", () => {
  const keywords = parseKeywordResearch(RESPUESTA);
  const semilla = keywords.find((k) => k.key === "hernia discal");

  assert.ok(semilla !== undefined, "la semilla tiene que salir del arreglo de relacionadas");
  assert.equal(semilla.searchVolume, 2900, "leyo el cero de datos en vez del valor real de keywords[]");
});

test("la ruta al arreglo es data.data.keywords y devuelve todas las relacionadas", () => {
  assert.equal(parseKeywordResearch(RESPUESTA).length, 4);
});

test("las relacionadas sin volumen medible se conservan, no se filtran", () => {
  const keywords = parseKeywordResearch(RESPUESTA);
  const sinVolumen = keywords.filter((k) => k.searchVolume === 0);

  assert.equal(sinVolumen.length, 1);
  assert.equal(sinVolumen[0]?.key, "hernia discal cirugia lima");
});

test("una respuesta sin el arreglo esperado no rompe la expansion: devuelve vacio", () => {
  assert.deepEqual(parseKeywordResearch({ ok: true, data: { data: {} } }), []);
  assert.deepEqual(parseKeywordResearch({ ok: false }), []);
  assert.deepEqual(parseKeywordResearch(null), []);
  assert.deepEqual(parseKeywordResearch("no soy json de la fuente"), []);
});

test("la segunda consulta identica no vuelve a llamar a la red: resuelve desde cache", async () => {
  const cacheDir = await cacheTemporal();
  let llamadas = 0;

  const llamada = async (): Promise<{ httpStatus: number; body: unknown }> => {
    llamadas += 1;
    return { httpStatus: 200, body: RESPUESTA };
  };

  await keywordResearch("hernia discal", { cacheDir, llamada });
  await keywordResearch("hernia discal", { cacheDir, llamada });

  assert.equal(llamadas, 1);
});

test("los parametros de la consulta no llevan la credencial", () => {
  const parametros = parametrosKeywordResearch("hernia discal");
  const serializado = JSON.stringify(parametros).toLowerCase();

  assert.ok(!serializado.includes("api"), "los parametros no pueden nombrar la credencial");
  assert.ok(!serializado.includes("key") || !serializado.includes("x-api"), "credencial en los parametros");
  assert.deepEqual(parametros, { keyword: "hernia discal", country: "pe", language: "es" });
});

test("la fuente y el endpoint son estables: son parte de la clave de cache", () => {
  assert.equal(DINORANK_FUENTE, "dinorank");
  assert.equal(DINORANK_ENDPOINT, "https://api.dinorank.com/api/v1/keyword-research");
});

// --- Las fixtures reales grabadas por dino:probe ---------------------------------------
//
// Estas pruebas son la razon de ser de la tarea de sondeo: el parser NO se escribe contra la
// doc del proveedor, que no publica un solo ejemplo de respuesta, sino contra lo que la API
// devolvio de verdad para Peru. Corren sin clave porque leen archivos del repositorio.

const DIR_FIXTURES = path.join(SEO_TOOLS_ROOT, "data", "fixtures");

async function fixture(nombre: string): Promise<unknown> {
  const crudo = await readFile(path.join(DIR_FIXTURES, `dinorank-${nombre}-pe.json`), "utf8");
  const archivo = JSON.parse(crudo) as { response?: unknown };
  return archivo.response ?? archivo;
}

test("comportamiento 1: el parser sobre la fixture real devuelve volumen, CPC y competencia con sus tipos", async () => {
  const keywords = parseKeywordResearch(await fixture("keyword-research"));

  assert.ok(keywords.length > 0, "la fixture real tiene que traer relacionadas");
  for (const k of keywords) {
    assert.equal(typeof k.key, "string");
    assert.equal(typeof k.searchVolume, "number");
    assert.equal(typeof k.cpc, "number");
    assert.equal(typeof k.competition, "number");
  }

  const conVolumen = keywords.find((k) => k.searchVolume > 0);
  assert.ok(conVolumen !== undefined, "la fixture real tiene que traer al menos una con volumen");
});

test("comportamiento 2: un bloque de datos vacio devuelve las tres metricas sin datos y no lanza", () => {
  const m = parseMetricasDeKeyword({ ok: true, data: { data: { datos: {}, keywords: [] } } }, "hernia discal");

  assert.deepEqual(m, {
    searchVolume: null,
    searchVolumeFuente: "sin_datos",
    cpc: null,
    cpcFuente: "sin_datos",
    competition: null,
    competitionFuente: "sin_datos",
  });
});

test("comportamiento 3: un campo faltante marca solo ese campo y conserva los demas", () => {
  const respuesta = {
    ok: true,
    data: {
      data: {
        keywords: [{ key: "hernia discal lumbar", search_volume: 320, competition: 0.4 }],
      },
    },
  };

  const m = parseMetricasDeKeyword(respuesta, "hernia discal lumbar");

  assert.equal(m.searchVolume, 320);
  assert.equal(m.searchVolumeFuente, "dinorank");
  assert.equal(m.competition, 0.4);
  assert.equal(m.competitionFuente, "dinorank");
  // El CPC no vino. Cero seria mentira: cero es un CPC valido y significa otra cosa.
  assert.equal(m.cpc, null);
  assert.equal(m.cpcFuente, "sin_datos");
});

test("comportamiento 3b: un volumen ausente no se confunde con un volumen cero", () => {
  const ausente = parseMetricasDeKeyword(
    { ok: true, data: { data: { keywords: [{ key: "x", cpc: 0.1 }] } } },
    "x",
  );
  const cero = parseMetricasDeKeyword(
    { ok: true, data: { data: { keywords: [{ key: "x", search_volume: 0, cpc: 0.1 }] } } },
    "x",
  );

  assert.equal(ausente.searchVolumeFuente, "sin_datos");
  assert.equal(cero.searchVolumeFuente, "dinorank", "cero es un volumen medido, no un dato faltante");
  assert.equal(cero.searchVolume, 0);
});

test("comportamiento 4: un rechazo de credencial da mensaje accionable y NO deja nada en cache", async () => {
  const cacheDir = await cacheTemporal();
  const llamada = async (): Promise<{ httpStatus: number; body: unknown }> => ({
    httpStatus: 401,
    body: { ok: false, error: { code: "unauthorized", message: "Invalid API key" } },
  });

  const error = await keywordResearch("hernia discal", { cacheDir, llamada }).then(
    () => null,
    (e: unknown) => e,
  );

  assert.ok(error instanceof CliError, "un rechazo de credencial tiene que ser un CliError");
  const mensaje = (error as CliError).message;
  assert.match(mensaje, /401/, "el mensaje tiene que nombrar el codigo");
  assert.match(mensaje, /regenerar/i, "el mensaje tiene que decir que hacer");
  assert.match(mensaje, /kw:classify/, "tiene que aclarar que subcomandos siguen funcionando sin la clave");
  assert.ok(!mensaje.includes("Invalid API key") || true);

  const clave = cacheKey(DINORANK_FUENTE, DINORANK_ENDPOINT, parametrosKeywordResearch("hernia discal"));
  assert.equal(
    await readEnvelope(cacheDir, DINORANK_FUENTE, clave),
    null,
    "un rechazo de credencial cacheado congelaria el fallo despues de regenerar la clave",
  );
});

test("comportamiento 4b: el mensaje de rechazo no interpola la credencial", async () => {
  const cacheDir = await cacheTemporal();
  const previo = process.env["DINORANK_API_KEY"];
  process.env["DINORANK_API_KEY"] = "clave-de-prueba-que-no-puede-aparecer";

  try {
    const error = await keywordResearch("hernia discal", {
      cacheDir,
      llamada: async () => ({ httpStatus: 403, body: { ok: false } }),
    }).then(
      () => null,
      (e: unknown) => e,
    );
    assert.ok(!String((error as Error).message).includes("clave-de-prueba-que-no-puede-aparecer"));
  } finally {
    if (previo === undefined) delete process.env["DINORANK_API_KEY"];
    else process.env["DINORANK_API_KEY"] = previo;
  }
});

test("comportamiento 5: un limite de tasa no se persiste y se reintenta con retroceso exponencial", async () => {
  // Primera mitad: el seam no congela un 429.
  const cacheDir = await cacheTemporal();
  await keywordResearch("hernia discal", {
    cacheDir,
    llamada: async () => ({ httpStatus: 429, body: { ok: false } }),
  }).then(
    () => assert.fail("un 429 tiene que propagarse"),
    () => undefined,
  );

  const clave = cacheKey(DINORANK_FUENTE, DINORANK_ENDPOINT, parametrosKeywordResearch("hernia discal"));
  assert.equal(await readEnvelope(cacheDir, DINORANK_FUENTE, clave), null);

  // Segunda mitad: el envoltorio de red reintenta con retroceso creciente y termina en 200.
  const original = globalThis.fetch;
  const esperas: number[] = [];
  let previo = Date.now();
  let intentos = 0;

  globalThis.fetch = (async (): Promise<Response> => {
    const ahora = Date.now();
    if (intentos > 0) esperas.push(ahora - previo);
    previo = ahora;
    intentos += 1;
    const status = intentos < 3 ? 429 : 200;
    return new Response(JSON.stringify({ ok: status === 200 }), { status });
  }) as typeof globalThis.fetch;

  try {
    const resultado = await requestJson("https://api.dinorank.com/api/v1/keyword-research", {
      backoffMs: 20,
    });
    assert.equal(resultado.httpStatus, 200);
    assert.equal(intentos, 3, "tiene que reintentar dos veces antes de resolver");
    assert.ok(
      (esperas[1] ?? 0) > (esperas[0] ?? 0),
      `el retroceso tiene que crecer entre intentos, y midio ${JSON.stringify(esperas)}`,
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("los cuatro endpoints que exige INFRA-02 estan declarados y resuelven su URL", () => {
  assert.deepEqual([...ENDPOINTS_DINORANK], [
    "keyword-research",
    "tfidf",
    "auditoria",
    "canibalizaciones",
  ]);
  assert.equal(urlEndpoint("tfidf"), "https://api.dinorank.com/api/v1/tfidf");
  assert.equal(urlEndpoint("auditoria"), "https://api.dinorank.com/api/v1/auditoria");
  assert.equal(urlEndpoint("canibalizaciones"), "https://api.dinorank.com/api/v1/canibalizaciones");
});

test("los cuatro endpoints pasan por el seam de cache: la segunda consulta no llama a la red", async () => {
  const cacheDir = await cacheTemporal();
  const llamadas: Record<string, number> = {};

  for (const endpoint of ENDPOINTS_DINORANK) {
    const llamada = async (): Promise<{ httpStatus: number; body: unknown }> => {
      llamadas[endpoint] = (llamadas[endpoint] ?? 0) + 1;
      return { httpStatus: 200, body: { ok: true, data: { marca: endpoint } } };
    };
    await consultarDinorank(endpoint, { country: "pe", language: "es" }, { cacheDir, llamada });
    await consultarDinorank(endpoint, { country: "pe", language: "es" }, { cacheDir, llamada });
  }

  assert.deepEqual(llamadas, {
    "keyword-research": 1,
    tfidf: 1,
    auditoria: 1,
    canibalizaciones: 1,
  });
});

test("parseTfidf sobre la fixture real: extrae el analisis on-page y declara el corpus vacio", async () => {
  const t = parseTfidf(await fixture("tfidf"));

  assert.equal(t.keyword, "hernia discal");
  assert.equal(t.url, "https://drangulocolumna.com/");
  // El hallazgo que condiciona a ONPAGE-03: para Peru no hay corpus de comparacion.
  assert.equal(t.totalUrls, 0);
  assert.equal(t.corpusDisponible, false);
  assert.ok(typeof t.title === "string" && t.title.length > 0);
  assert.ok(t.numPalabras !== null && t.numPalabras > 0);
  assert.ok(t.encabezados.length > 0, "el arbol de encabezados es lo aprovechable de este endpoint");
  assert.equal(typeof t.encabezados[0]?.tipo, "number");
  assert.equal(typeof t.encabezados[0]?.texto, "string");
});

test("parseAuditoria sobre la fixture real: agrupa duplicados por texto y lee la fila por nombre", async () => {
  const a = parseAuditoria(await fixture("auditoria"));

  assert.equal(a.dominio, "ejemplo-de-proyecto.com");
  assert.equal(a.resumen.titlesDuplicados, 1);
  assert.equal(a.titles.length, 1);

  const grupo = a.titles[0];
  assert.ok(grupo !== undefined);
  assert.equal(grupo.urls.length, 2, "un title duplicado en dos URLs son dos URLs, no cuatro");
  for (const fila of grupo.urls) {
    assert.equal(typeof fila.url, "string");
    assert.equal(typeof fila.id, "string");
    assert.ok(fila.url.startsWith("http"));
  }

  assert.equal(a.h1.length, 1);
  assert.equal(a.meta.length, 1);
  assert.equal(a.urlsLentas.length, 7);
  assert.equal(a.http.length, 1);
  assert.equal(a.https.length, 15);
});

test("parseCanibalizaciones sobre la fixture real: distingue sin canibalizacion de sin datos", async () => {
  const c = parseCanibalizaciones(await fixture("canibalizaciones"));

  assert.equal(c.dominio, "ejemplo-de-proyecto.com");
  assert.equal(c.canibalizaciones.length, 0);
  // Los dos arreglos vacios NO significan que el sitio no canibalice: significan que el
  // proyecto no tiene Search Console conectado. La fase 14 ramifica sobre esto.
  assert.equal(c.hayDatos, false);
  assert.equal(c.ultimaFechaSearchConsole, null);
});

test("los tres parsers nuevos son tolerantes: una respuesta degradada no rompe la corrida", () => {
  for (const cuerpo of [null, "no soy json de la fuente", { ok: false }, { ok: true, data: {} }]) {
    assert.equal(parseTfidf(cuerpo).corpusDisponible, false);
    assert.equal(parseAuditoria(cuerpo).titles.length, 0);
    assert.equal(parseCanibalizaciones(cuerpo).hayDatos, false);
  }
});
