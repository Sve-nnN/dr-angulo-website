import assert from "node:assert/strict";
import { test } from "node:test";

import { LARGO_DE_META, LARGO_DE_TITLE, tituloYMeta } from "./metadatos.js";
import { PaqueteInvalido } from "./model.js";

const VALIDA = {
  url: "/servicios/hernia-discal",
  keywordPrimaria: "hernia discal",
  title: "Hernia discal: sintomas, diagnostico y tratamiento",
  metaDescription:
    "Que es una hernia discal, que sintomas produce, como se confirma y cuando se plantea la cirugia. Guia del consultorio de columna en Lima.",
  h1: "Hernia discal",
  h1Origen: "Repite la keyword primaria sin adornos porque la SERP la premia literal.",
};

test("metadatos: el title y la meta respetan el contrato de la fase 10 de v1.1", () => {
  // 60 y 155 no son gusto: son los limites que v1.1 ya verifica del otro lado (D-13).
  // Entregar fuera de rango obliga a reescribirlo alla, que es el trabajo duplicado que
  // esta fase existe para evitar.
  const r = tituloYMeta(VALIDA);

  assert.ok(r.title.length <= LARGO_DE_TITLE, `title de ${r.title.length} caracteres`);
  assert.ok(
    r.metaDescription.length <= LARGO_DE_META,
    `meta de ${r.metaDescription.length} caracteres`,
  );
  assert.equal(r.largoDeTitle, r.title.length);
  assert.equal(r.largoDeMeta, r.metaDescription.length);
});

test("metadatos: todos los tokens de la primaria estan en el title y el primero va al frente", () => {
  // La comprobacion es por tokens y sin tildes porque en espanol la keyword se parte con
  // preposiciones al escribirla natural: "cirugia de columna" cabe como "cirugia minimamente
  // invasiva de columna" y sigue sirviendo la misma keyword.
  const r = tituloYMeta(VALIDA);

  assert.equal(r.tokensDeLaPrimaria.length, 2);
  assert.ok(r.primeraTokenEn >= 0 && r.primeraTokenEn <= 12, `arranca en ${r.primeraTokenEn}`);
});

test("metadatos: un title fuera de contrato falla nombrando el campo y el excedente", () => {
  // Fallar ruidoso importa mas que fallar: un title de 74 caracteres se publica igual y
  // Google lo corta, asi que nadie se entera hasta que el snippet ya salio mal.
  assert.throws(
    () =>
      tituloYMeta({
        ...VALIDA,
        title:
          "Hernia discal en Lima: sintomas, causas, diagnostico, tratamiento y cuando operar",
      }),
    PaqueteInvalido,
  );

  assert.throws(
    () => tituloYMeta({ ...VALIDA, title: "Guia de columna: cuando operar y cuando no" }),
    PaqueteInvalido,
  );

  assert.throws(
    () =>
      tituloYMeta({
        ...VALIDA,
        title: "Guia clinica de columna para pacientes: hernia discal",
      }),
    PaqueteInvalido,
  );
});
