import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeKeyword } from "./normalize.js";

test("dos escrituras distintas del mismo termino producen la misma cadena", () => {
  const a = normalizeKeyword("  Hernia   Discal, Lima!  ");
  const b = normalizeKeyword("hernia discal lima");
  assert.equal(a, b);
  assert.equal(a, "hernia discal lima");
});

test("colapsa espacios, pasa a minusculas, quita tildes y descarta puntuacion", () => {
  assert.equal(normalizeKeyword("CIRUGÍA   de   Columna"), "cirugia de columna");
  assert.equal(normalizeKeyword("¿Qué es la escoliosis?"), "que es la escoliosis");
  assert.equal(normalizeKeyword("traumatólogo/columna"), "traumatologo columna");
});

test("elimina la tilde de la enie, y eso es intencional para la clave", () => {
  // Los pacientes escriben de las dos formas y ambas deben caer en la misma fila.
  assert.equal(normalizeKeyword("escoliosis en niños"), "escoliosis en ninos");
  assert.equal(normalizeKeyword("escoliosis en ninos"), "escoliosis en ninos");
});

test("es una funcion pura: el texto original nunca se sobrescribe con el normalizado", () => {
  const original = "Hernia Discal en Niños";
  const clave = normalizeKeyword(original);
  assert.equal(original, "Hernia Discal en Niños");
  assert.notEqual(clave, original);
});
