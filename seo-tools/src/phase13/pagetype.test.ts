/**
 * Pruebas del clasificador de tipo de pagina (COMP-03).
 *
 * TODOS los dominios y todas las URLs de este archivo salen de capturas reales: las 12 SERP
 * de Lima que dejo la fase 12 en `.cache/serpapi/`, medidas el 2026-08-11, y el top 10 de
 * `cirujano de columna` que quedo escrito en la validacion del 2026-08-10. Ninguno es
 * inventado. Un dominio inventado probaria que el motor de reglas funciona sobre datos que no
 * existen, que es exactamente lo que la fase 12 aprendio a no hacer.
 *
 * Sin red, sin credenciales, sin modelo.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { clasificarSerp, clasificarResultado, cargarReglasDeTipo } from "./pagetype.js";
import { serpDesdeCuerpo } from "./serp.js";

/** Construye una SERP mínima a partir de una lista de enlaces reales. */
function serpCon(enlaces: readonly string[]): ReturnType<typeof serpDesdeCuerpo> {
  return serpDesdeCuerpo("prueba", {
    organic_results: enlaces.map((link, i) => ({ position: i + 1, link })),
  });
}

function tipoDe(link: string): string {
  const serp = serpCon([link]);
  const resultado = serp.organicos[0];
  assert.ok(resultado !== undefined, `el enlace no parseo: ${link}`);
  return clasificarResultado(resultado).tipo;
}

// ---------------------------------------------------------------------------
// Comportamiento 1: exactamente un tipo por resultado, y nadie se queda sin
// ---------------------------------------------------------------------------

test("cada resultado organico recibe exactamente un tipo y el defecto no deja a nadie fuera", () => {
  const serp = serpCon([
    "https://www.mayoclinic.org/es/diseases-conditions/herniated-disk/symptoms-causes/syc-20354095",
    "https://www.crp.com.pe/",
    "https://lpderecho.pe/casos-procede-revision-sentencia-condenatoria-firme/",
  ]);

  const clasificada = clasificarSerp(serp);

  assert.equal(clasificada.resultados.length, 3);
  for (const resultado of clasificada.resultados) {
    assert.equal(typeof resultado.tipo, "string");
    assert.notEqual(resultado.tipo, "");
  }
  // Y el reparto suma exactamente la cantidad de resultados: ni uno contado dos veces.
  const suma = Object.values(clasificada.reparto).reduce((a, b) => a + b, 0);
  assert.equal(suma, 3);
});

test("el tipo por defecto existe y esta declarado en el archivo de reglas", () => {
  const reglas = cargarReglasDeTipo();
  assert.equal(typeof reglas.porDefecto, "string");
  assert.ok(reglas.precedencia.includes(reglas.porDefecto));
  // El defecto va al final de la precedencia: si ganara antes, ningun otro tipo se alcanzaria.
  assert.equal(reglas.precedencia[reglas.precedencia.length - 1], reglas.porDefecto);
});

// ---------------------------------------------------------------------------
// Comportamiento 2: directorios y agregadores de fichas
// ---------------------------------------------------------------------------

test("doctoralia y los agregadores de fichas resuelven a directorio", () => {
  assert.equal(tipoDe("https://www.doctoralia.pe/clinicas/clinica-ricardo-palma-3"), "directorio");
  assert.equal(tipoDe("https://queplan.pe/Clinicas-y-Hospitales/Centro-Clinico-La-Molina"), "directorio");
  assert.equal(
    tipoDe("https://directorio.hospitalcima.com/es/doctor/rolando-angulo-cruz"),
    "directorio",
  );
  assert.equal(
    tipoDe("https://www.bumeran.com.pe/perfiles/empresa_clinica-padre-luis-tezza_10090584.html"),
    "directorio",
  );
});

// ---------------------------------------------------------------------------
// Comportamiento 3: contenido internacional, que es un tipo aparte de guia
// ---------------------------------------------------------------------------

test("mayoclinic, medlineplus y quironsalud resuelven a contenido internacional, no a guia", () => {
  assert.equal(
    tipoDe("https://www.mayoclinic.org/es/diseases-conditions/herniated-disk/symptoms-causes/syc-20354095"),
    "contenido-internacional",
  );
  assert.equal(
    tipoDe("https://medlineplus.gov/spanish/ency/article/000442.htm"),
    "contenido-internacional",
  );
  assert.equal(
    tipoDe("https://www.quironsalud.com/blogs/es/lesiones-cuidamos/conoce-sintomas-hernia-discal"),
    "contenido-internacional",
  );
  // Un subdominio del mismo grupo tambien: la coincidencia es por sufijo de dominio.
  assert.equal(
    tipoDe("https://teknon.quironsalud.com/es/especialidades/dr-francisco-castro-dominguez/preguntas-frecuentes/x"),
    "contenido-internacional",
  );
});

test("contenido internacional gana sobre guia aunque la ruta parezca de blog", () => {
  // `quironsalud.com/blogs/...` tiene ruta de blog. Un consultorio de Lima igual no lo disputa,
  // asi que la precedencia declarada tiene que ponerlo por delante de guia.
  const reglas = cargarReglasDeTipo();
  assert.ok(
    reglas.precedencia.indexOf("contenido-internacional") < reglas.precedencia.indexOf("guia"),
    "contenido internacional tiene que preceder a guia en el archivo de reglas",
  );
  assert.equal(
    tipoDe("https://www.quironsalud.com/blogs/es/lesiones-cuidamos/conoce-sintomas-hernia-discal"),
    "contenido-internacional",
  );
});

// ---------------------------------------------------------------------------
// Comportamiento 4: redes sociales
// ---------------------------------------------------------------------------

test("facebook, instagram, youtube y linkedin de Peru resuelven a red social", () => {
  assert.equal(tipoDe("https://www.facebook.com/clinicatezza/?locale=es_LA"), "red-social");
  assert.equal(tipoDe("https://www.instagram.com/clinica_tezza/?hl=es"), "red-social");
  assert.equal(tipoDe("https://www.youtube.com/watch?v=9QKIUcvEhB4"), "red-social");
  assert.equal(tipoDe("https://pe.linkedin.com/company/clinica-tezza"), "red-social");
});

// ---------------------------------------------------------------------------
// Comportamiento 5: la URL construida sobre la keyword es pagina de servicio
// ---------------------------------------------------------------------------

test("una URL construida sobre la keyword resuelve a pagina de servicio y no a ficha de clinica", () => {
  // El caso de la captura de `ortopedia infantil`, posicion 2. El dominio empieza por
  // "clinic", asi que sin la precedencia correcta caeria en ficha de clinica.
  assert.equal(
    tipoDe("https://clinicarthromeds.pe/traumatologia-pedriatica-infantil-y-ortopedia-lima-peru/"),
    "pagina-de-servicio",
  );
  // El caso del top 10 de `cirujano de columna`, posicion 5, registrado en la validacion.
  assert.equal(
    tipoDe("https://clinicarthromeds.pe/traumatologo-especialista-en-columna-lima-peru/"),
    "pagina-de-servicio",
  );
  // Y el mismo patron en un dominio de medico individual.
  assert.equal(
    tipoDe("https://drabeltrantraumatologia.com/ortopedia-infantil-en-lima/"),
    "pagina-de-servicio",
  );
});

test("la raiz de un dominio de clinica sigue resolviendo a ficha de clinica", () => {
  assert.equal(tipoDe("https://clinicatezza.com.pe/"), "ficha-de-clinica");
  assert.equal(
    tipoDe("https://www.sanna.pe/red-sanna/centros-clinicos/la-molina-lima/"),
    "ficha-de-clinica",
  );
});

test("una ruta editorial resuelve a guia aunque el dominio sea de una clinica", () => {
  assert.equal(
    tipoDe("https://clinicainternacional.com.pe/blog-educativo/diferencias-cirugia-convencional-robotica/"),
    "guia",
  );
  assert.equal(
    tipoDe("https://www.clinicasanfelipe.com/blog/escoliosis-sintomas-y-tratamientos-"),
    "guia",
  );
});

// ---------------------------------------------------------------------------
// Comportamiento 6: tipo dominante del top 10, con desempate declarado y estable
// ---------------------------------------------------------------------------

test("el tipo dominante del cluster es el mas presente en el top 10", () => {
  const serp = serpCon([
    "https://www.mayoclinic.org/es/diseases-conditions/herniated-disk/symptoms-causes/syc-20354095",
    "https://medlineplus.gov/spanish/ency/article/000442.htm",
    "https://www.quironsalud.com/blogs/es/lesiones-cuidamos/conoce-sintomas-hernia-discal",
    "https://www.doctoralia.pe/clinicas/clinica-ricardo-palma-3",
  ]);

  const clasificada = clasificarSerp(serp);
  assert.equal(clasificada.tipoDominante, "contenido-internacional");
  assert.equal(clasificada.reparto["contenido-internacional"], 3);
  assert.equal(clasificada.reparto["directorio"], 1);
});

test("con empate gana el tipo que ocupa la mejor posicion, y el desempate es reproducible", () => {
  const serp = serpCon([
    "https://www.doctoralia.pe/clinicas/clinica-ricardo-palma-3",
    "https://www.mayoclinic.org/es/diseases-conditions/herniated-disk/symptoms-causes/syc-20354095",
  ]);

  const primera = clasificarSerp(serp);
  const segunda = clasificarSerp(serp);

  assert.equal(primera.reparto["directorio"], 1);
  assert.equal(primera.reparto["contenido-internacional"], 1);
  // Empate a uno: gana quien esta en la posicion 1.
  assert.equal(primera.tipoDominante, "directorio");
  assert.equal(segunda.tipoDominante, "directorio");
});

test("una SERP sin organicos no tiene tipo dominante y no lanza", () => {
  const clasificada = clasificarSerp(serpCon([]));
  assert.equal(clasificada.tipoDominante, null);
  assert.deepEqual(clasificada.resultados, []);
});

// ---------------------------------------------------------------------------
// Comportamiento 7: determinista, y sin consultar a nadie
// ---------------------------------------------------------------------------

test("dos clasificaciones de la misma SERP producen exactamente el mismo JSON", () => {
  const serp = serpCon([
    "https://www.facebook.com/clinicatezza/?locale=es_LA",
    "https://clinicarthromeds.pe/traumatologia-pedriatica-infantil-y-ortopedia-lima-peru/",
    "https://medlineplus.gov/spanish/ency/article/000442.htm",
  ]);

  assert.equal(JSON.stringify(clasificarSerp(serp)), JSON.stringify(clasificarSerp(serp)));
});

test("el reparto se emite en el orden declarado de precedencia, no en el de aparicion", () => {
  const reglas = cargarReglasDeTipo();
  const serp = serpCon([
    "https://www.doctoralia.pe/clinicas/clinica-ricardo-palma-3",
    "https://www.facebook.com/clinicatezza/?locale=es_LA",
  ]);

  const claves = Object.keys(clasificarSerp(serp).reparto);
  const esperado = reglas.precedencia.filter((t) => claves.includes(t));
  assert.deepEqual(claves, esperado);
});

// ---------------------------------------------------------------------------
// Los patrones viven en el archivo de datos, no en el codigo
// ---------------------------------------------------------------------------

test("los patrones se leen de data/serp-page-types.json y declaran precedencia explicita", () => {
  const reglas = cargarReglasDeTipo();

  assert.equal(reglas.schema, 1);
  assert.ok(reglas.precedencia.length >= 7, "los siete tipos medidos tienen que estar declarados");
  for (const tipo of ["guia", "pagina-de-servicio", "ficha-de-clinica", "directorio"]) {
    assert.ok(reglas.precedencia.includes(tipo), `falta el tipo del ROADMAP: ${tipo}`);
  }
  for (const tipo of ["contenido-internacional", "red-social", "otro"]) {
    assert.ok(reglas.precedencia.includes(tipo), `falta el tipo medido: ${tipo}`);
  }
  // La precedencia es la del archivo y no el orden de iteracion de un objeto.
  assert.deepEqual(
    reglas.precedencia,
    reglas.tipos.map((t) => t.tipo),
  );
});
