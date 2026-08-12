import assert from "node:assert/strict";
import { test } from "node:test";

import { leerSerp } from "../phase13/serp.js";
import { MINIMO_DE_MOTIVO } from "./model.js";
import { jerarquiaDe } from "./serp-onpage.js";

/** Las cinco secundarias de `/servicios/hernia-discal` en `url-map.jsonl`, que es de solo lectura. */
const SECUNDARIAS_DE_HERNIA = [
  "hernia discal lumbar y cervical",
  "hernia discal lumbosacra tratamiento",
  "ciatica o hernia discal",
  "hernia discal tomografía",
  "lumbalgia o hernia discal",
] as const;

/** Lee la captura ya pagada. Offline: si faltara, falla la prueba en vez de gastar cuota. */
async function jerarquiaDeHernia() {
  const serp = await leerSerp("hernia discal", { offline: true });
  return {
    serp,
    resultado: jerarquiaDe({
      keywordPrimaria: "hernia discal",
      formato: "guia-clinica",
      secundarias: SECUNDARIAS_DE_HERNIA,
      preguntas: serp.preguntas,
      relacionadas: serp.relacionadas,
    }),
  };
}

test("serp-onpage: las cuatro preguntas de la SERP entran como encabezado o quedan nombradas con motivo", async () => {
  // La conducta que importa no es que las cuatro entren: es que ninguna desaparezca en
  // silencio. Una pregunta descartada sin motivo escrito deja la jerarquia sin forma de
  // auditar si respeta el lenguaje del paciente o lo invento quien escribio.
  const { serp, resultado } = await jerarquiaDeHernia();

  assert.equal(serp.preguntas.length, 4, "la captura de hernia discal trae cuatro preguntas");

  const usadas = resultado.jerarquia.filter((h) => h.origen === "pregunta-serp");
  assert.equal(
    usadas.length + resultado.preguntasSinUsar.length,
    serp.preguntas.length,
    "cada pregunta esta usada o nombrada, nunca perdida",
  );

  for (const h of usadas) {
    assert.ok(
      serp.preguntas.includes(h.literal ?? ""),
      `el literal "${h.literal}" tiene que ser la pregunta cruda de la SERP`,
    );
  }
  for (const p of resultado.preguntasSinUsar) {
    assert.ok(
      p.motivo.length >= MINIMO_DE_MOTIVO,
      `el motivo de "${p.pregunta}" es una etiqueta y no una explicacion: "${p.motivo}"`,
    );
  }
});

test("serp-onpage: ninguna secundaria del mapa queda sin encabezado que la cubra", async () => {
  // Los anchors de la matriz de enlazado del plan 14-04 salen de estas secundarias (D-15).
  // Una secundaria sin encabezado deja sin respaldo al anchor que apunta aca.
  const { resultado } = await jerarquiaDeHernia();

  assert.equal(resultado.coberturaDeSecundarias.length, SECUNDARIAS_DE_HERNIA.length);
  for (const c of resultado.coberturaDeSecundarias) {
    assert.ok(c.cubiertaPor, `la secundaria "${c.keyword}" quedo sin encabezado`);
  }
});

test("serp-onpage: la jerarquia arranca por el esqueleto del formato y no por la lista de keywords", async () => {
  // El indice de una guia clinica sigue el recorrido del paciente. Si el primer encabezado
  // fuera una busqueda relacionada, el documento seria una lista de keywords pegadas.
  const { resultado } = await jerarquiaDeHernia();
  const primero = resultado.jerarquia[0];

  assert.ok(primero);
  assert.equal(primero.nivel, 2);
  assert.equal(primero.origen, "esqueleto");
  assert.ok(
    resultado.jerarquia.filter((h) => h.nivel === 2).length >= 5,
    "una guia clinica no baja de cinco secciones de nivel 2",
  );
});
