/**
 * Pruebas de la ronda unica de revision del doctor.
 *
 * LA PRUEBA QUE JUSTIFICA EL ARCHIVO es la del orden. El valor entero del documento esta en que
 * el doctor pueda cortar la revision donde quiera sabiendo que lo que dejo sin leer es lo menos
 * peligroso. Si un bloque de "que no se debe hacer" cae en el nivel descriptivo, esa garantia se
 * pierde sin que nada falle: el documento se ve igual de prolijo y el orden dejo de significar
 * algo.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import type { SeccionDeCopy } from "./model.js";
import {
  DESTACADOS,
  armarRonda,
  huecoDe,
  nivelDe,
  renderRevision,
  todasLasPaginas,
} from "./revision.js";

function seccion(sobrescritos: Partial<SeccionDeCopy> = {}): SeccionDeCopy {
  return {
    clave: "que-es",
    nivel: 2,
    titulo: "Qué es la hernia discal",
    tipo: "clinico",
    aprobacion: "pendiente-doctor",
    parrafos: ["Un párrafo cualquiera del cuerpo."],
    afirmaciones: [],
    keywordsCubiertas: [],
    entidadesCubiertas: [],
    ...sobrescritos,
  };
}

test("revision: el hueco del esqueleto sale de la clave, con y sin sufijo de H3", () => {
  assert.equal(huecoDe("sintomas"), "sintomas");
  assert.equal(huecoDe("sintomas--donde-duele-la-ciatica"), "sintomas");
});

test("revision: lo que el paciente ejecuta solo entra al nivel 1 aunque su hueco sea descriptivo", () => {
  // Vive en el hueco de preguntas frecuentes, que es descriptivo, y sin embargo es una
  // instruccion que alguien sigue sin consultar a nadie.
  const bloque = seccion({
    clave: "preguntas-frecuentes--que-no-se-debe-hacer-cuando-tienes-hernia-discal",
    titulo: "¿Qué no se debe hacer cuando tienes hernia discal?",
  });
  assert.equal(nivelDe(bloque), 1);

  const pastillas = seccion({
    clave: "sin-operar--las-mejores-pastillas-para-la-ciatica",
    titulo: "Las mejores pastillas para la ciática",
  });
  assert.equal(nivelDe(pastillas), 1);
});

test("revision: lo que discute si hace falta operar entra al nivel 2 aunque su hueco no lo diga", () => {
  const bloque = seccion({
    clave: "que-se-atiende--clinica-de-la-columna-hernias-discales-sin-cirugias",
    titulo: "Hernia discal sin cirugía: qué es cierto de eso",
  });
  assert.equal(nivelDe(bloque), 2);
  assert.equal(nivelDe(seccion({ clave: "cirugia", titulo: "Cuándo hace falta operar" })), 2);
  assert.equal(nivelDe(seccion({ clave: "diagnostico", titulo: "Cómo se confirma" })), 2);
});

test("revision: lo descriptivo se queda en el nivel 3 y no sube por estar en una guia clinica", () => {
  assert.equal(nivelDe(seccion()), 3);
  assert.equal(nivelDe(seccion({ clave: "causas", titulo: "Por qué aparece" })), 3);
});

test("revision: la ronda toma los 225 bloques clinicos de las 16 paginas y ninguno mas", () => {
  const paginas = todasLasPaginas();
  const ronda = armarRonda(paginas);

  assert.equal(ronda.paginas, 16);
  const clinicos = paginas.flatMap((p) => p.secciones.filter((s) => s.tipo === "clinico"));
  assert.equal(ronda.bloques.length, clinicos.length);
  // Ninguna seccion operativa se cuela: sellar lo que no necesita ojo clinico diluye el sello.
  assert.equal(
    ronda.bloques.filter((b) => b.seccion.tipo !== "clinico").length,
    0,
  );
});

test("revision: los datos operativos pendientes salen aparte de lo clinico", () => {
  const ronda = armarRonda(todasLasPaginas());
  assert.equal(ronda.pendientes.length, 10);
  for (const pendiente of ronda.pendientes) {
    assert.equal(pendiente.dato.estado, "pendiente");
  }
});

test("revision: los seis destacados siguen existiendo en los datasets", () => {
  const claves = new Set(
    todasLasPaginas().flatMap((p) => p.secciones.map((s) => `${p.url}|${s.clave}`)),
  );
  for (const destacado of DESTACADOS) {
    assert.ok(
      claves.has(`${destacado.url}|${destacado.clave}`),
      `el destacado ${destacado.url} ${destacado.clave} ya no existe`,
    );
  }
});

test("revision: el documento trae cada bloque con su URL, su texto exacto y su casilla", () => {
  const ronda = armarRonda(todasLasPaginas());
  const documento = renderRevision(ronda);

  for (const bloque of ronda.bloques) {
    assert.ok(documento.includes(bloque.seccion.titulo), bloque.seccion.clave);
    for (const parrafo of bloque.seccion.parrafos) {
      assert.ok(documento.includes(parrafo), `${bloque.url} ${bloque.seccion.clave}`);
    }
  }
  assert.equal(
    documento.split("- [ ] Aprobado tal como está.").length - 1,
    ronda.bloques.length,
  );
});

test("revision: dos corridas producen el mismo documento", () => {
  const primera = renderRevision(armarRonda(todasLasPaginas()));
  const segunda = renderRevision(armarRonda(todasLasPaginas()));
  assert.equal(primera, segunda);
});

test("revision: los niveles salen en orden y el nivel 1 va primero en el documento", () => {
  const documento = renderRevision(armarRonda(todasLasPaginas()));
  const uno = documento.indexOf("## Nivel 1.");
  const dos = documento.indexOf("## Nivel 2.");
  const tres = documento.indexOf("## Nivel 3.");
  const cuatro = documento.indexOf("## Nivel 4.");
  assert.ok(uno > 0 && uno < dos && dos < tres && tres < cuatro);
  // Y los destacados van antes que el nivel 1: son lo que se lee si no hay tiempo para el resto.
  assert.ok(documento.indexOf("## Lo que conviene mirar antes que todo") < uno);
});
