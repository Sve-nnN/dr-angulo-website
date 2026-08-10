/**
 * Pruebas de la consolidacion del universo: deduplicacion, filtro de relevancia y filtro de
 * geografia. Todo en memoria y sin red.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { QuotaBook } from "../quota.js";
import {
  MAX_BUSQUEDAS_POR_DEFECTO,
  consolidar,
  esGeoAjeno,
  esRelevante,
  expandir,
  planificarConsultas,
  serializarCandidatos,
  type Candidato,
} from "./expand.js";
import type { Modificadores } from "./permute.js";
import type { Semilla } from "./seeds.js";

const candidato = (keyword: string, extra: Partial<Candidato> = {}): Candidato => ({
  keyword,
  keywordKey: keyword
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim(),
  semilla: "Hernia discal",
  capa: "permutacion",
  estado: "sin_datos",
  ...extra,
});

test("dos candidatos con la misma forma normalizada se cuentan una vez y gana el primero", () => {
  const resultado = consolidar([
    candidato("hernia discal", { capa: "permutacion" }),
    candidato("Hérnia  Discal", { capa: "dinorank" }),
  ]);

  assert.equal(resultado.candidatos.length, 1);
  assert.equal(resultado.candidatos[0]?.capa, "permutacion");
  assert.equal(resultado.trasDeduplicar, 1);
});

test("un candidato sin ningun termino del dominio queda descartado", () => {
  assert.equal(esRelevante("como agendar una cita por whatsapp"), false);
  assert.equal(esRelevante("cirujano de columna en lima"), true);

  const resultado = consolidar([candidato("horario de atención"), candidato("hernia discal")]);
  assert.deepEqual(
    resultado.candidatos.map((c) => c.keyword),
    ["hernia discal"],
  );
});

test("un candidato que nombra otra ciudad del Peru queda descartado", () => {
  assert.equal(esGeoAjeno("traumatologo arequipa"), true);
  assert.equal(esGeoAjeno("cirujano de columna trujillo"), true);
  assert.equal(esGeoAjeno("hernia discal cusco"), true);
  assert.equal(esGeoAjeno("traumatologo lima"), false);
  assert.equal(esGeoAjeno("traumatologo la molina"), false);

  const resultado = consolidar([candidato("traumatólogo en Arequipa"), candidato("traumatólogo en Lima")]);
  assert.deepEqual(
    resultado.candidatos.map((c) => c.keyword),
    ["traumatólogo en Lima"],
  );
});

test("el filtro de geo compara palabras completas: 'ciatica' no es la ciudad de Ica", () => {
  assert.equal(esGeoAjeno("ciatica tratamiento"), false);
  assert.equal(esGeoAjeno("dolor de espalda ica"), true);
});

test("las keywords de otro pais tambien quedan fuera: el negocio es presencial en Lima", () => {
  assert.equal(esGeoAjeno("hernia discal madrid"), true);
  assert.equal(esGeoAjeno("operacion de hernia discal espana"), true);
  assert.equal(esGeoAjeno("cirujano de columna bogota"), true);
});

test("las keywords sin datos no se descartan: quedan marcadas", () => {
  const resultado = consolidar([candidato("hernia discal cerca de mí")]);

  assert.equal(resultado.candidatos.length, 1);
  assert.equal(resultado.candidatos[0]?.estado, "sin_datos");
});

test("un candidato con metricas de la fuente real queda marcado con datos", () => {
  const resultado = consolidar([
    candidato("hernia discal lumbar tratamiento", {
      capa: "dinorank",
      estado: "con_datos",
      metricas: { searchVolume: 50, cpc: 0.43, competition: 0.22, fuente: "dinorank" },
    }),
  ]);

  assert.equal(resultado.candidatos[0]?.estado, "con_datos");
  assert.equal(resultado.candidatos[0]?.metricas?.searchVolume, 50);
});

test("la consolidacion reporta los cuatro conteos que verifica el umbral de KWR-01", () => {
  const resultado = consolidar([
    candidato("hernia discal", { capa: "permutacion" }),
    candidato("hernia discal", { capa: "permutacion" }),
    candidato("hernia discal arequipa", { capa: "dinorank" }),
    candidato("agendar cita", { capa: "dinorank" }),
    candidato("cirugía de hernia discal", { capa: "dinorank" }),
  ]);

  assert.equal(resultado.brutos, 5);
  assert.equal(resultado.trasDeduplicar, 4);
  assert.equal(resultado.trasFiltrar, 2);
  assert.deepEqual(resultado.porCapa, { permutacion: 1, dinorank: 1 });
});

test("cada linea serializada es JSON valido y declara los cinco campos del contrato", () => {
  const resultado = consolidar([candidato("hernia discal")]);
  const lineas = serializarCandidatos(resultado.candidatos).trim().split("\n");

  assert.equal(lineas.length, 1);
  const objeto = JSON.parse(lineas[0] as string) as Record<string, unknown>;
  for (const campo of ["keyword", "keywordKey", "semilla", "capa", "estado"]) {
    assert.ok(campo in objeto, `falta el campo ${campo}`);
  }
});

test("serializar dos veces el mismo universo produce exactamente el mismo texto", () => {
  const brutos = [candidato("hernia discal"), candidato("cirugía de columna en lima")];
  assert.equal(
    serializarCandidatos(consolidar(brutos).candidatos),
    serializarCandidatos(consolidar(brutos).candidatos),
  );
});

// --- Presupuesto: el tope lo gobierna el codigo, no la invocacion ---

const temporales: string[] = [];

async function cacheTemporal(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "seo-tools-expand-"));
  temporales.push(dir);
  return dir;
}

after(async () => {
  for (const dir of temporales) await rm(dir, { recursive: true, force: true });
});

const CINCO_SEMILLAS: Semilla[] = [
  { keyword: "Hernia discal", keywordKey: "hernia discal", tipo: "condicion", procedencia: "prueba", rango: 1 },
  { keyword: "Estenosis espinal", keywordKey: "estenosis espinal", tipo: "condicion", procedencia: "prueba", rango: 1 },
  { keyword: "Ortopedia infantil", keywordKey: "ortopedia infantil", tipo: "especialidad", procedencia: "prueba", rango: 1 },
  { keyword: "Clínica Ricardo Palma", keywordKey: "clinica ricardo palma", tipo: "sede", procedencia: "prueba", rango: 2 },
  { keyword: "Cirugía de columna", keywordKey: "cirugia de columna", tipo: "especialidad", procedencia: "prueba", rango: 3 },
];

const SIN_MODIFICADORES: Modificadores = { schema: 1, familias: {} };

test("el tope de busquedas por defecto vale exactamente 60, como constante del modulo", () => {
  assert.equal(MAX_BUSQUEDAS_POR_DEFECTO, 60);
});

test("el orden de gasto es el del snapshot y es identico entre dos corridas", () => {
  const a = planificarConsultas(CINCO_SEMILLAS, { semillasDinorank: 2, semillasSerpapi: 3 });
  const b = planificarConsultas(CINCO_SEMILLAS, { semillasDinorank: 2, semillasSerpapi: 3 });

  assert.deepEqual(a, b);
  assert.deepEqual(
    a.filter((c) => c.capa === "dinorank").map((c) => c.semilla),
    ["Hernia discal", "Estenosis espinal"],
  );
  assert.deepEqual(
    a.filter((c) => c.capa === "serpapi-busqueda").map((c) => c.semilla),
    ["Hernia discal", "Estenosis espinal", "Ortopedia infantil"],
  );
  // Cada consulta trae su clave ya calculada por el CLI: quien rellena nunca la inventa.
  for (const consulta of a) assert.match(consulta.clave, /^[0-9a-f]{64}$/);
});

test("alcanzado el tope, la expansion corta y nombra las semillas que quedaron sin procesar", async () => {
  const cacheDir = await cacheTemporal();
  const quota = await QuotaBook.open(cacheDir);

  const resultado = await expandir({
    seeds: CINCO_SEMILLAS,
    modificadores: SIN_MODIFICADORES,
    cacheDir,
    quota,
    maxBusquedas: 2,
    semillasDinorank: 0,
    semillasSerpapi: 5,
    llamadaSerpapi: async () => ({
      httpStatus: 200,
      body: { related_searches: [{ query: "cirugia de hernia discal en lima" }] },
    }),
  });

  assert.equal(resultado.cortada, true);
  assert.equal(resultado.pendientes.length, 3);
  assert.deepEqual(resultado.pendientes, [
    "Ortopedia infantil",
    "Clínica Ricardo Palma",
    "Cirugía de columna",
  ]);
  assert.equal(quota.runCalls("serpapi"), 2);
  // El archivo de candidatos queda con lo ya obtenido, no a medio escribir.
  assert.ok(resultado.candidatos.length > 0);
});

test("subir el tope y volver a correr solo gasta por las semillas que faltaban", async () => {
  const cacheDir = await cacheTemporal();
  const llamada = async (): Promise<{ httpStatus: number; body: unknown }> => ({
    httpStatus: 200,
    body: { related_searches: [{ query: "cirugia de hernia discal en lima" }] },
  });

  const primera = await QuotaBook.open(cacheDir);
  await expandir({
    seeds: CINCO_SEMILLAS,
    modificadores: SIN_MODIFICADORES,
    cacheDir,
    quota: primera,
    maxBusquedas: 2,
    semillasDinorank: 0,
    semillasSerpapi: 5,
    llamadaSerpapi: llamada,
  });
  assert.equal(primera.runCalls("serpapi"), 2);

  const segunda = await QuotaBook.open(cacheDir);
  const resultado = await expandir({
    seeds: CINCO_SEMILLAS,
    modificadores: SIN_MODIFICADORES,
    cacheDir,
    quota: segunda,
    maxBusquedas: 60,
    semillasDinorank: 0,
    semillasSerpapi: 5,
    llamadaSerpapi: llamada,
  });

  assert.equal(resultado.cortada, false);
  assert.equal(segunda.runCalls("serpapi"), 3, "las dos primeras tenian que resolver desde cache");
});
