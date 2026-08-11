/**
 * Pruebas del tipo de pagina exigido por la SERP (MAP-04).
 *
 * Todo sale de las 96 capturas ya pagadas, en modo offline. Coste de cuota: cero (D-07).
 *
 * Lo que estas pruebas defienden es una sola idea: el tipo de pagina de una cabeza sale del
 * REPARTO REAL de su top 10 y no del nombre de la keyword. Es facil equivocarse al reves,
 * porque el nombre suele sugerir el formato y casi siempre acierta; cuando no acierta es
 * justo donde esta el hallazgo que la fase 15 necesita.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { cargarReglasDeTipo } from "../phase13/pagetype.js";
import { construirMapaDeTipos } from "./pagetype-map.js";

/** Se construye una sola vez: recorre las 96 capturas y no hace falta repetirlo por prueba. */
const mapa = await construirMapaDeTipos();

test("pagetype-map: cubre las cabezas con SERP medida y ninguna se queda sin tipo ni sin reparto", () => {
  assert.ok(mapa.cabezas.length >= 91, `solo se tipificaron ${mapa.cabezas.length} cabezas`);

  for (const cabeza of mapa.cabezas) {
    assert.notEqual(cabeza.keyword.trim(), "");
    assert.notEqual(cabeza.tipoDePagina.trim(), "");
    assert.ok(Object.keys(cabeza.repartoDeTipos).length > 0, `${cabeza.keyword} sin reparto`);
    assert.ok(cabeza.posicionesMedidas > 0);
  }
});

test("pagetype-map: el tipo dominante es el mas presente del top 10 y no el que sugiere el nombre", () => {
  const reglas = cargarReglasDeTipo();

  for (const cabeza of mapa.cabezas) {
    const maximo = Math.max(...Object.values(cabeza.repartoDeTipos));
    assert.equal(
      cabeza.repartoDeTipos[cabeza.tipoDePagina],
      maximo,
      `${cabeza.keyword}: el dominante declarado no es el mas presente de su reparto`,
    );
    for (const tipo of Object.keys(cabeza.repartoDeTipos)) {
      assert.ok(reglas.precedencia.includes(tipo), `tipo desconocido: ${tipo}`);
    }
  }

  // Dos cabezas que nombran una condicion clinica y reciben tipos distintos porque sus SERP
  // son distintas. Si el tipo saliera del nombre, las dos caerian en el mismo.
  const escoliosis = mapa.cabezas.find((c) => c.keywordKey === "escoliosis");
  const ortopedia = mapa.cabezas.find((c) => c.keywordKey === "ortopedia infantil lima");
  assert.ok(escoliosis && ortopedia);
  assert.equal(escoliosis.tipoDePagina, "contenido-internacional");
  assert.equal(ortopedia.tipoDePagina, "pagina-de-servicio");
});

test("pagetype-map: el reparto suma exactamente las posiciones medidas", () => {
  for (const cabeza of mapa.cabezas) {
    const suma = Object.values(cabeza.repartoDeTipos).reduce((a, b) => a + b, 0);
    assert.equal(suma, cabeza.posicionesMedidas, `${cabeza.keyword}: el reparto no cuadra`);
  }
});

test("pagetype-map: cada cabeza declara su topResult y su nivel de confianza", () => {
  const niveles = new Set(["alta", "media", "baja"]);

  for (const cabeza of mapa.cabezas) {
    assert.ok(niveles.has(cabeza.confianza), `${cabeza.keyword}: confianza ${cabeza.confianza}`);
    if (cabeza.topResult !== null) {
      assert.match(cabeza.topResult, /^https?:\/\//);
    }
    // La confianza sale de cuantas posiciones se pudieron tipificar de verdad, y esa cuenta
    // nunca puede superar a las medidas.
    assert.ok(cabeza.posicionesTipificadas <= cabeza.posicionesMedidas);
  }
});

test("pagetype-map: una cabeza sin captura se nombra en vez de desaparecer en silencio", () => {
  assert.ok(Array.isArray(mapa.sinCaptura));
  for (const k of mapa.sinCaptura) assert.notEqual(k.trim(), "");
  assert.equal(mapa.cabezas.length + mapa.sinCaptura.length, mapa.resumen.candidatas);
});

test("pagetype-map: dos construcciones seguidas serializan identico", async () => {
  const otra = await construirMapaDeTipos();
  assert.equal(JSON.stringify(mapa), JSON.stringify(otra));
});
