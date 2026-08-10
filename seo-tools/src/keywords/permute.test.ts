/**
 * Pruebas de la permutacion.
 *
 * Corren sobre conjuntos pequenos de semillas y modificadores en memoria: lo que se prueba es
 * la regla de combinacion, no el conteo del snapshot real, que cambia cada vez que v1.1
 * publica una condicion nueva.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { combinar, permutar, type Modificadores } from "./permute.js";
import type { Semilla } from "./seeds.js";

const SEMILLAS: Semilla[] = [
  { keyword: "Hernia discal", keywordKey: "hernia discal", tipo: "condicion", procedencia: "prueba", rango: 1 },
  { keyword: "Traumatólogo", keywordKey: "traumatologo", tipo: "especialidad", procedencia: "prueba", rango: 3 },
  { keyword: "Artrodesis de columna", keywordKey: "artrodesis de columna", tipo: "procedimiento", procedencia: "prueba", rango: 3 },
];

const MODIFICADORES: Modificadores = {
  schema: 1,
  familias: {
    informacional: {
      descripcion: "prueba",
      aplicaA: ["condicion"],
      modificadores: [
        { texto: "qué es", posicion: "prefijo" },
        { texto: "se opera", posicion: "sufijo" },
      ],
    },
    geo: {
      descripcion: "prueba",
      aplicaA: ["especialidad"],
      modificadores: [{ texto: "lima", posicion: "sufijo" }],
    },
  },
};

test("combinar respeta el orden natural del espanol segun la posicion declarada", () => {
  assert.equal(combinar("Hernia discal", { texto: "qué es", posicion: "prefijo" }), "qué es hernia discal");
  assert.equal(combinar("Hernia discal", { texto: "se opera", posicion: "sufijo" }), "hernia discal se opera");
});

test("el candidato queda en minusculas pero conserva tildes y enie", () => {
  assert.equal(combinar("Traumatólogo", { texto: "cerca de mí", posicion: "sufijo" }), "traumatólogo cerca de mí");
  assert.equal(combinar("Ortopedia en niños", { texto: "qué es", posicion: "prefijo" }), "qué es ortopedia en niños");
});

test("una familia solo se aplica a los tipos de semilla que declara", () => {
  const brutos = permutar(SEMILLAS, MODIFICADORES);
  const geo = brutos.filter((c) => c.familia === "geo");

  assert.deepEqual(
    geo.map((c) => c.keyword),
    ["traumatólogo lima"],
  );
  // El procedimiento no tiene familia declarada en esta prueba: solo aparece como semilla suelta.
  assert.deepEqual(
    brutos.filter((c) => c.semilla === "Artrodesis de columna").map((c) => c.keyword),
    ["artrodesis de columna"],
  );
});

test("la semilla desnuda entra como candidata: tambien es una keyword", () => {
  const brutos = permutar(SEMILLAS, MODIFICADORES);
  const desnudas = brutos.filter((c) => c.familia === "semilla").map((c) => c.keyword);

  assert.deepEqual(desnudas, ["hernia discal", "traumatólogo", "artrodesis de columna"]);
});

test("cada candidato conserva la semilla de la que nacio", () => {
  for (const candidato of permutar(SEMILLAS, MODIFICADORES)) {
    assert.ok(SEMILLAS.some((s) => s.keyword === candidato.semilla));
  }
});

test("la permutacion es determinista: dos corridas devuelven exactamente lo mismo", () => {
  assert.deepEqual(permutar(SEMILLAS, MODIFICADORES), permutar(SEMILLAS, MODIFICADORES));
});

test("el recorrido va semilla por semilla en el orden del snapshot, que es el orden de gasto", () => {
  const brutos = permutar(SEMILLAS, MODIFICADORES);
  const orden = [...new Set(brutos.map((c) => c.semilla))];

  assert.deepEqual(orden, ["Hernia discal", "Traumatólogo", "Artrodesis de columna"]);
});
