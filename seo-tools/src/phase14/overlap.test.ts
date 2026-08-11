/**
 * Pruebas del veredicto de fusion par a par.
 *
 * Corren contra las 96 capturas ya pagadas, en modo offline. Coste de cuota: cero.
 *
 * La prueba que importa es la del trio: `ortopedia infantil lima`, `traumatología lima` y
 * `cirujano de columna lima` viven en el mismo cluster de 41 cabezas y comparten CERO URLs en
 * el top 10 medidas de a pares. Ese cluster se formo por transitividad, encadenado a traves de
 * terceras keywords. Si alguna vez el modulo empezara a fusionar por pertenencia a cluster,
 * esa prueba se pondria roja antes de que el error llegara al mapa (D-05).
 *
 * El prefijo `overlap:` de cada nombre es lo que hace que
 * `npm test -- --test-name-pattern="overlap|pagetype-map"` seleccione este archivo.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  UMBRAL_POR_DEFECTO,
  cargarIndiceDeSerp,
  veredictoDeFusion,
} from "./overlap.js";

/** El trio del cluster de 41 cabezas. Tres categorias de servicio distintas. */
const TRIO = ["ortopedia infantil lima", "traumatología lima", "cirujano de columna lima"];

/** Un par de la sede Ricardo Palma, que si comparte SERP de verdad. */
const PAR_QUE_SI = ["cirujano de columna clínica ricardo palma", "traumatólogo clínica ricardo palma"];

/** Nunca se le midio la SERP: quedo fuera por presupuesto, no por juicio de negocio. */
const SIN_MEDIR = "tendinitis";

test("overlap: dos cabezas que comparten tres o mas URLs del top 10 son fusionables", async () => {
  const indice = await cargarIndiceDeSerp(PAR_QUE_SI);
  const veredicto = veredictoDeFusion(PAR_QUE_SI[0] as string, PAR_QUE_SI[1] as string, indice);

  assert.equal(veredicto.fusionable, true);
  assert.ok(veredicto.cardinalidad >= UMBRAL_POR_DEFECTO);
  assert.equal(veredicto.compartidas.length, veredicto.cardinalidad);
  assert.ok(veredicto.motivo.trim() !== "");
  // La evidencia viaja con el veredicto: se audita sin abrir la cache.
  assert.ok(veredicto.compartidas.every((u) => typeof u === "string" && u !== ""));
});

test("overlap: el trio del cluster de 41 cabezas no es fusionable en ninguno de sus tres pares", async () => {
  const indice = await cargarIndiceDeSerp(TRIO);

  const pares: [string, string][] = [];
  for (let i = 0; i < TRIO.length; i += 1) {
    for (let j = i + 1; j < TRIO.length; j += 1) {
      pares.push([TRIO[i] as string, TRIO[j] as string]);
    }
  }
  assert.equal(pares.length, 3);

  for (const [a, b] of pares) {
    const veredicto = veredictoDeFusion(a, b, indice);
    assert.equal(veredicto.fusionable, false, `${a} y ${b} no pueden fusionarse`);
    assert.equal(veredicto.cardinalidad, 0, `${a} y ${b} comparten cero URLs medidas`);
    assert.deepEqual(veredicto.compartidas, []);
    assert.match(veredicto.motivo, /transitividad/i);
    assert.match(veredicto.motivo, /cluster/i);
  }
});

test("overlap: cero URLs compartidas explica que el cluster se formo por transitividad", async () => {
  const indice = await cargarIndiceDeSerp(TRIO);
  const veredicto = veredictoDeFusion(TRIO[0] as string, TRIO[1] as string, indice);

  assert.equal(veredicto.datoAusente, false, "las dos cabezas tienen SERP medida");
  assert.match(veredicto.motivo, /terceras keywords/i);
});

test("overlap: una cabeza sin SERP medida devuelve falso por dato ausente y nunca un true optimista", async () => {
  const indice = await cargarIndiceDeSerp([...PAR_QUE_SI, SIN_MEDIR]);
  const veredicto = veredictoDeFusion(PAR_QUE_SI[0] as string, SIN_MEDIR, indice);

  assert.equal(veredicto.fusionable, false);
  assert.equal(veredicto.datoAusente, true);
  assert.equal(veredicto.cardinalidad, 0);
  assert.match(veredicto.motivo, /sin SERP medida/i);
  assert.ok(veredicto.motivo.includes(SIN_MEDIR));
});

test("overlap: el umbral es configurable y por defecto vale el que la fase 13 valido", async () => {
  assert.equal(UMBRAL_POR_DEFECTO, 3);

  const indice = await cargarIndiceDeSerp(PAR_QUE_SI);
  const a = PAR_QUE_SI[0] as string;
  const b = PAR_QUE_SI[1] as string;

  const conUmbralImposible = veredictoDeFusion(a, b, indice, { umbral: 99 });
  assert.equal(conUmbralImposible.fusionable, false);
  assert.equal(conUmbralImposible.umbral, 99);

  const conUmbralUno = veredictoDeFusion(a, b, indice, { umbral: 1 });
  assert.equal(conUmbralUno.fusionable, true);
});

test("overlap: el veredicto es simetrico y la lista compartida sale ordenada", async () => {
  const indice = await cargarIndiceDeSerp(PAR_QUE_SI);
  const a = PAR_QUE_SI[0] as string;
  const b = PAR_QUE_SI[1] as string;

  const ida = veredictoDeFusion(a, b, indice);
  const vuelta = veredictoDeFusion(b, a, indice);

  assert.equal(ida.cardinalidad, vuelta.cardinalidad);
  assert.deepEqual([...ida.compartidas], [...vuelta.compartidas]);
  assert.deepEqual([...ida.compartidas], [...ida.compartidas].sort());
});

test("overlap: el modulo no puede recibir la pertenencia a un cluster como entrada", () => {
  // El criterio de aceptacion del plan borra literales de cadena y comentarios y despues busca
  // la palabra. Lo que se prueba aca es lo mismo pero desde la firma: la funcion toma dos
  // claves, un indice de URLs medidas y un umbral opcional. No hay por donde colarle un
  // cluster: los tres parametros obligatorios son las dos claves y el indice.
  assert.equal(veredictoDeFusion.length, 3);
});
