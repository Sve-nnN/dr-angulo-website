/**
 * Pruebas de la consolidacion del universo: deduplicacion, filtro de relevancia y filtro de
 * geografia. Todo en memoria y sin red.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  consolidar,
  esGeoAjeno,
  esRelevante,
  serializarCandidatos,
  type Candidato,
} from "./expand.js";

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
