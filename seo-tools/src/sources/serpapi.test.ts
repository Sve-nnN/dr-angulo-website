/**
 * Pruebas del cliente de SerpApi y de la equivalencia entre los dos caminos de datos.
 *
 * Corren sin clave y sin red. La forma de la respuesta viene de la validacion en vivo del
 * 2026-08-10 con `cirujano de columna`, ubicacion Lima, gl=pe, hl=es.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { cacheKey, writeEnvelope, type CacheEnvelope, type NetworkResult } from "../cache.js";
import { expandir, type OpcionesExpansion } from "../keywords/expand.js";
import type { Modificadores } from "../keywords/permute.js";
import type { Semilla } from "../keywords/seeds.js";
import {
  SERPAPI_ENDPOINT,
  SERPAPI_FUENTE,
  busquedaGeolocalizada,
  normalizarDominio,
  parametrosBusqueda,
  parseBusqueda,
  parseSerpCompleta,
  parseSugerencias,
  serpCompleta,
} from "./serpapi.js";

const temporales: string[] = [];

async function cacheTemporal(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "seo-tools-serp-"));
  temporales.push(dir);
  return dir;
}

after(async () => {
  for (const dir of temporales) await rm(dir, { recursive: true, force: true });
});

const RESPUESTA_BUSQUEDA = {
  search_metadata: { status: "Success" },
  related_searches: [
    { query: "traumatologo especialista en columna clínica ricardo palma" },
    { query: "cirujano de columna en lima" },
  ],
  related_questions: [{ question: "¿Cuánto cuesta una cirugía de columna en Perú?" }],
  organic_results: [{ position: 1, link: "https://cirujanocolumna-elaos.com/" }],
  local_results: { places: [{ title: "Clinica De La Columna", rating: 3.5 }] },
};

const RESPUESTA_AUTOCOMPLETE = {
  suggestions: [{ value: "hernia discal sintomas" }, { value: "hernia discal tratamiento" }],
};

test("parseBusqueda cosecha busquedas relacionadas y preguntas relacionadas", () => {
  const resultado = parseBusqueda(RESPUESTA_BUSQUEDA);

  assert.deepEqual(resultado.relacionadas, [
    "traumatologo especialista en columna clínica ricardo palma",
    "cirujano de columna en lima",
  ]);
  assert.deepEqual(resultado.preguntas, ["¿Cuánto cuesta una cirugía de columna en Perú?"]);
});

test("una respuesta sin los bloques esperados no rompe la expansion", () => {
  assert.deepEqual(parseBusqueda({}), { relacionadas: [], preguntas: [] });
  assert.deepEqual(parseBusqueda(null), { relacionadas: [], preguntas: [] });
  assert.deepEqual(parseSugerencias({}), []);
});

test("parseSugerencias devuelve el arreglo de sugerencias de autocompletado", () => {
  assert.deepEqual(parseSugerencias(RESPUESTA_AUTOCOMPLETE), [
    "hernia discal sintomas",
    "hernia discal tratamiento",
  ]);
});

test("la combinacion de ubicacion, pais e idioma queda fijada en el cliente", () => {
  assert.deepEqual(parametrosBusqueda("cirujano de columna"), {
    engine: "google",
    q: "cirujano de columna",
    location: "Lima, Peru",
    google_domain: "google.com.pe",
    gl: "pe",
    hl: "es",
  });
});

test("los parametros que se persisten no llevan la credencial", () => {
  assert.ok(!JSON.stringify(parametrosBusqueda("hernia discal")).toLowerCase().includes("api_key"));
});

test("la segunda busqueda identica resuelve desde cache y no llama a la red", async () => {
  const cacheDir = await cacheTemporal();
  let llamadas = 0;

  const llamada = async (): Promise<NetworkResult> => {
    llamadas += 1;
    return { httpStatus: 200, body: RESPUESTA_BUSQUEDA };
  };

  await busquedaGeolocalizada("cirujano de columna", { cacheDir, llamada });
  await busquedaGeolocalizada("cirujano de columna", { cacheDir, llamada });

  assert.equal(llamadas, 1);
});

test("en modo offline una consulta ausente falla nombrando fuente, endpoint y clave", async () => {
  const cacheDir = await cacheTemporal();

  await assert.rejects(
    busquedaGeolocalizada("consulta deliberadamente ausente de la cache", { cacheDir, offline: true }),
    (error: Error) => {
      assert.match(error.message, /serpapi/);
      assert.match(error.message, /serpapi\.com\/search/);
      assert.match(error.message, /[0-9a-f]{64}/);
      return true;
    },
  );
});

// --- Lectura completa de la SERP (fase 13, KWR-04 y COMP-03 sobre la misma captura) ---

test("la clave de cache de serpCompleta es la MISMA que la de busquedaGeolocalizada", async () => {
  // Es la prueba que decide si las 12 capturas de Lima de la fase 12 siguen valiendo. Si un
  // parametro cambiara, la segunda lectura no encontraria nada y moriria por modo offline.
  const cacheDir = await cacheTemporal();
  let llamadas = 0;

  await busquedaGeolocalizada("hernia discal", {
    cacheDir,
    llamada: async (): Promise<NetworkResult> => {
      llamadas += 1;
      return { httpStatus: 200, body: RESPUESTA_BUSQUEDA };
    },
  });
  assert.equal(llamadas, 1);

  // Sin permiso de red y sin credencial: solo resuelve si la clave calculada es identica.
  const serp = await serpCompleta("hernia discal", { cacheDir, offline: true });

  assert.equal(llamadas, 1);
  assert.equal(serp.keyword, "hernia discal");
  assert.equal(serp.organicos.length, 1);
  assert.equal(serp.organicos[0]?.dominio, "cirujanocolumna-elaos.com");
});

test("serpCompleta reusa parametrosBusqueda sin agregar ni quitar un parametro", () => {
  // Redundante con la anterior a proposito: esta falla con un mensaje que dice QUE cambio.
  assert.deepEqual(parametrosBusqueda("hernia discal"), {
    engine: "google",
    q: "hernia discal",
    location: "Lima, Peru",
    google_domain: "google.com.pe",
    gl: "pe",
    hl: "es",
  });
});

test("normalizarDominio baja a minusculas, quita el prefijo de web y descarta lo que no parsea", () => {
  assert.equal(normalizarDominio("https://WWW.MayoClinic.org/es/x"), "mayoclinic.org");
  assert.equal(normalizarDominio("https://pe.linkedin.com/company/clinica-tezza"), "pe.linkedin.com");
  assert.equal(normalizarDominio("no-es-una-url"), null);
  assert.equal(normalizarDominio(""), null);
});

test("parseSerpCompleta tolera la ausencia de cada bloque opcional", () => {
  const vacia = parseSerpCompleta("sin nada", {});
  assert.deepEqual(vacia.organicos, []);
  assert.deepEqual(vacia.packLocal, []);
  assert.equal(vacia.destacado, null);
  assert.equal(vacia.resumenIa, false);
  assert.equal(vacia.videos, false);
  assert.equal(vacia.capturadaEn, null);
});

// --- La prueba que sostiene la frontera del Pattern 3 ---

const SEMILLAS: Semilla[] = [
  { keyword: "Hernia discal", keywordKey: "hernia discal", tipo: "condicion", procedencia: "prueba", rango: 1 },
];

const MODIFICADORES: Modificadores = {
  schema: 1,
  familias: {
    informacional: {
      descripcion: "prueba",
      aplicaA: ["condicion"],
      modificadores: [{ texto: "qué es", posicion: "prefijo" }],
    },
  },
};

const baseExpansion = (cacheDir: string): OpcionesExpansion => ({
  seeds: SEMILLAS,
  modificadores: MODIFICADORES,
  cacheDir,
  semillasDinorank: 0,
  semillasSerpapi: 1,
});

test("expansion por llamada directa y expansion por relleno de cache producen candidatos identicos", async () => {
  // Camino 1, el esperado: el CLI llama a la fuente por HTTP.
  const cacheDirecto = await cacheTemporal();
  const porLlamadaDirecta = await expandir({
    ...baseExpansion(cacheDirecto),
    llamadaSerpapi: async () => ({ httpStatus: 200, body: RESPUESTA_BUSQUEDA }),
  });

  // Camino 2, el fallback: un agente externo dejo el cuerpo crudo en la cache con la clave
  // que calculo el CLI, y la expansion corre sin poder llamar a nadie.
  const cacheRelleno = await cacheTemporal();
  const clave = cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametrosBusqueda("hernia discal"));
  const envelope: CacheEnvelope = {
    schema: 1,
    source: SERPAPI_FUENTE,
    endpoint: SERPAPI_ENDPOINT,
    request: { rellenadoDesdeAfuera: true },
    fetchedAt: "2026-08-10T00:00:00.000Z",
    outcome: "ok",
    httpStatus: 200,
    response: RESPUESTA_BUSQUEDA,
    error: null,
  };
  await writeEnvelope(cacheRelleno, clave, envelope);

  const porRelleno = await expandir({
    ...baseExpansion(cacheRelleno),
    llamadaSerpapi: async () => {
      throw new Error("el camino de relleno no puede salir a la red");
    },
  });

  assert.deepEqual(porRelleno.candidatos, porLlamadaDirecta.candidatos);
  assert.ok(porLlamadaDirecta.candidatos.some((c) => c.capa === "serpapi-busqueda"));
});
