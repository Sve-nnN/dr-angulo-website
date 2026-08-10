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

import {
  DINORANK_ENDPOINT,
  DINORANK_FUENTE,
  keywordResearch,
  parametrosKeywordResearch,
  parseKeywordResearch,
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
