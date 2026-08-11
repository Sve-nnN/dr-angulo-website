/**
 * Pruebas del punto dulce (KWR-05, D-09).
 *
 * Las dos que el plan exige por nombre son las dos primeras: KD bajo con el top 10 copado, y
 * KD medio con el top 10 de medicos individuales. Las dos existen porque el veredicto NO puede
 * salir de un solo dato: el KD es un promedio de mercado que no sabe quien ocupa la posicion 3,
 * y la SERP sola no dice cuanto esfuerzo hace falta.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  cargarReglasDeAlcance,
  evaluarCabeza,
  evaluarPosicion,
  ordenar,
  type EntradaDeCabeza,
} from "./sweet-spot.js";
import type { SerpCompleta } from "./serp.js";

const REGLAS = cargarReglasDeAlcance();

function serp(keyword: string, urls: readonly string[]): SerpCompleta {
  return {
    keyword,
    organicos: urls.map((url, i) => ({
      posicion: i + 1,
      url,
      dominio: new URL(url).hostname.replace(/^www\./, ""),
      titulo: null,
      fragmento: null,
      enlaceMostrado: null,
    })),
    packLocal: [],
    relacionadas: [],
    preguntas: [],
    destacado: null,
    resumenIa: false,
    videos: false,
    capturadaEn: null,
  } as SerpCompleta;
}

function entrada(urls: readonly string[], kd: number | null): EntradaDeCabeza {
  return {
    keyword: "cirujano de columna",
    keywordKey: "cirujano de columna",
    rango: 1,
    familia: "nucleo",
    intent: "comercial",
    volumen: 300,
    volumenFuente: "dinorank",
    cluster: "un-cluster",
    keywordDifficulty: kd,
    keywordDifficultyFuente: kd === null ? "no_consultado" : "ahrefs",
    trafficPotential: null,
    trafficPotentialFuente: kd === null ? "no_consultado" : "ahrefs",
    serp: serp("cirujano de columna", urls),
  };
}

/** Diez posiciones de grupos clinicos con marca y contenido internacional. */
const COPADO = [
  "https://clinicainternacional.com.pe/columna",
  "https://crp.com.pe/columna",
  "https://sanna.pe/columna",
  "https://clinicasanfelipe.com/unidad-de-columna",
  "https://clinicaangloamericana.pe/columna",
  "https://mayoclinic.org/es/columna",
  "https://medlineplus.gov/spanish/columna.html",
  "https://quironsalud.com/columna",
  "https://auna.org/columna",
  "https://clinicatezza.com.pe/columna",
];

/** Diez posiciones de medicos individuales, directorios y redes sociales. */
const FLOJO = [
  "https://drcarranzacolumna.com/",
  "https://doctoralia.pe/traumatologo/lima",
  "https://cirujanocolumna-elaos.com/",
  "https://facebook.com/algo/posts/1",
  "https://drperalestraumatologo.com/columna",
  "https://discalcentro.com/columna",
  "https://traumamedical.com.pe/columna",
  "https://instagram.com/p/abc",
  "https://drabeltrantraumatologia.com/columna",
  "https://sportsmedicinelima.com/columna",
];

// ---------------------------------------------------------------------------
// Las dos que el plan nombra
// ---------------------------------------------------------------------------

test("una cabeza con KD BAJO cuyo top 10 esta copado por clinicas con marca y contenido internacional NO es punto dulce", () => {
  const c = evaluarCabeza(entrada(COPADO, 3), REGLAS);

  assert.equal(c.disputables, 0);
  assert.equal(c.barreras, 10);
  assert.equal(c.nivel, "bajo");
  assert.equal(c.alcanzable, false, "un KD de 3 no alcanza si no hay una sola posicion disputable");
  assert.equal(c.resueltaCon, "serp+kd");
  assert.ok(
    c.razones.some((r) => r.includes("clinica con marca") || r.includes("grupo clinico con marca")),
    "la razon de la barrera tiene que estar escrita",
  );
  assert.ok(c.razones.some((r) => r.includes("KD 3")), "el KD declarado tambien queda escrito");
  assert.ok(
    c.razones.some((r) => r.includes("no hay sitio donde entrar")),
    "sin una sola posicion disputable, ningun KD bajo rescata la cabeza",
  );
});

test("una cabeza con KD MEDIO cuyo top 10 son medicos individuales SI puede ser punto dulce", () => {
  const c = evaluarCabeza(entrada(FLOJO, 25), REGLAS);

  assert.equal(c.disputables, 10);
  assert.equal(c.nivel, "alto");
  assert.equal(c.alcanzable, true);
  assert.equal(c.resueltaCon, "serp+kd");
  assert.ok(c.razones.some((r) => r.startsWith("SUBE:")), "las razones que suben quedan escritas");
});

// ---------------------------------------------------------------------------
// Las dos mitades
// ---------------------------------------------------------------------------

test("una cabeza SIN KD conocido no se descarta: se marca como no medida y se resuelve por la SERP", () => {
  const c = evaluarCabeza(entrada(FLOJO, null), REGLAS);

  assert.equal(c.resueltaCon, "serp");
  assert.equal(c.alcanzable, true, "la falta del KD no puede descartar una cabeza");
  assert.equal(c.keywordDifficulty, null);
  assert.equal(c.keywordDifficultyFuente, "no_consultado");
  assert.ok(
    c.razones.some((r) => r.includes("KD NO MEDIDO")),
    "la fila declara que se resolvio con una sola mitad",
  );
});

test("ninguna alcanzabilidad sale de un solo dato: cada cabeza trae razones y el reparto del top 10", () => {
  for (const c of [evaluarCabeza(entrada(COPADO, 3), REGLAS), evaluarCabeza(entrada(FLOJO, null), REGLAS)]) {
    assert.ok(Array.isArray(c.razones) && c.razones.length > 0);
    assert.ok(c.repartoTop10 !== undefined && Object.keys(c.repartoTop10).length > 0);
    assert.equal(c.posiciones.length, 10, "cada posicion medida queda explicada una por una");
    for (const p of c.posiciones) assert.ok(p.motivo.length > 0);
  }
});

test("un KD duro baja el veredicto de una SERP floja, y uno facil sube el de una intermedia", () => {
  const duro = evaluarCabeza(entrada(FLOJO, 55), REGLAS);
  assert.equal(duro.nivel, "medio", "KD 55 baja de alto a medio");
  assert.ok(duro.razones.some((r) => r.startsWith("BAJA: KD 55")));

  // Cinco disputables, pero con el top 3 entero en barrera: la SERP sola da bajo, y el KD
  // facil lo sube un nivel porque SI hay sitio donde entrar.
  const intermedio = [...COPADO.slice(0, 5), ...FLOJO.slice(0, 5)];
  const facil = evaluarCabeza(entrada(intermedio, 8), REGLAS);
  assert.equal(facil.disputables, 5);
  assert.equal(facil.nivel, "medio", "KD 8 sube un nivel cuando la SERP dejo sitio");
  assert.ok(facil.razones.some((r) => r.startsWith("SUBE: KD 8")));
});

// ---------------------------------------------------------------------------
// La regla del top 3
// ---------------------------------------------------------------------------

test("con las tres primeras posiciones en barrera el nivel baja, aunque haya disputables de sobra", () => {
  const conTechito = [...COPADO.slice(0, 3), ...FLOJO.slice(0, 7)];
  const c = evaluarCabeza(entrada(conTechito, null), REGLAS);

  assert.equal(c.disputables, 7);
  assert.equal(c.disputablesEnTop3, 0);
  assert.equal(c.primeraDisputable, 4);
  assert.equal(c.nivel, "medio", "siete disputables darian alto; el top 3 copado lo baja a medio");
  assert.ok(c.razones.some((r) => r.includes("el techo realista es la posicion 4")));
});

// ---------------------------------------------------------------------------
// La clasificacion de una posicion
// ---------------------------------------------------------------------------

test("los cuatro veredictos de posicion salen del archivo de datos y no del codigo", () => {
  const marca = evaluarPosicion(
    { posicion: 1, dominio: "crp.com.pe", url: "https://crp.com.pe/x", tipo: "pagina-de-servicio" },
    REGLAS,
  );
  assert.equal(marca.veredicto, "barrera");
  assert.ok(marca.motivo.includes("clinica con marca"));

  const internacional = evaluarPosicion(
    { posicion: 2, dominio: "mayoclinic.org", url: "https://mayoclinic.org/x", tipo: "contenido-internacional" },
    REGLAS,
  );
  assert.equal(internacional.veredicto, "barrera");
  assert.equal(internacional.motivo, "contenido internacional");

  const directorio = evaluarPosicion(
    { posicion: 3, dominio: "doctoralia.pe", url: "https://doctoralia.pe/x", tipo: "directorio" },
    REGLAS,
  );
  assert.equal(directorio.veredicto, "disputable");
  assert.ok(directorio.motivo.includes("contenido debil"));

  const par = evaluarPosicion(
    { posicion: 4, dominio: "drcarranzacolumna.com", url: "https://drcarranzacolumna.com/", tipo: "otro" },
    REGLAS,
  );
  assert.equal(par.veredicto, "disputable");
  assert.equal(par.motivo, "medico o clinica pequena, sin marca");
});

test("un subdominio de un grupo con marca sigue siendo ese grupo", () => {
  const p = evaluarPosicion(
    { posicion: 1, dominio: "blog.auna.pe", url: "https://blog.auna.pe/x", tipo: "guia" },
    REGLAS,
  );
  assert.equal(p.veredicto, "barrera");
});

// ---------------------------------------------------------------------------
// Orden del entregable
// ---------------------------------------------------------------------------

test("el entregable ordena por alcanzabilidad y despues por valor de negocio, no por volumen", () => {
  const alta = { ...evaluarCabeza(entrada(FLOJO, null), REGLAS), rango: 9, volumen: 10 };
  const baja = { ...evaluarCabeza(entrada(COPADO, null), REGLAS), rango: 0, volumen: 99999 };

  const orden = ordenar([baja, alta]);
  assert.equal(orden[0]?.nivel, "alto", "la alcanzable va primero aunque tenga menos volumen y peor rango");
});
