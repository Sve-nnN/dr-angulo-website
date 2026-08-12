import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { SEO_TOOLS_ROOT } from "../config.js";
import { auditar, claveDeComparacion } from "./auditoria.js";
import type { FilaDeOnPage } from "./metadatos.js";
import { construirOnPage } from "./metadatos.js";

function fila(parcial: Partial<FilaDeOnPage>): FilaDeOnPage {
  return {
    url: "/una",
    accion: "reescribir",
    keywordPrimaria: null,
    title: "Un title cualquiera",
    titleLargo: 19,
    metaDescription: "Una meta cualquiera.",
    metaLargo: 20,
    h1: "Un H1 cualquiera",
    h1Origen: "propuesto",
    origenDelH1: "Motivo largo para no ser una etiqueta.",
    keywordAlFrente: null,
    redirigeA: null,
    formato: null,
    ...parcial,
  };
}

test("auditoria: dos URLs con el mismo title salen listadas con las dos URLs nombradas", () => {
  // Nombrar las dos importa: un duplicado no dice cual esta mal, dice que hay que elegir. Un
  // reporte que diga solo "hay un title repetido" obliga a buscarlo a mano en 24 filas.
  const r = auditar({
    filas: [
      fila({ url: "/a", title: "Hernia discal", h1: "A" }),
      fila({ url: "/b", title: "Hernia discal", h1: "B" }),
      fila({ url: "/c", title: "Otra cosa", h1: "C" }),
    ],
  });

  assert.equal(r.titlesDuplicados.length, 1);
  assert.deepEqual(r.titlesDuplicados[0]?.urls, ["/a", "/b"]);
  assert.equal(r.titlesDuplicados[0]?.texto, "Hernia discal");
});

test("auditoria: dos URLs con el mismo H1 salen listadas como duplicado", () => {
  const r = auditar({
    filas: [
      fila({ url: "/a", title: "Uno", h1: "Hernia discal" }),
      fila({ url: "/b", title: "Dos", h1: "Hernia discal" }),
    ],
  });

  assert.equal(r.h1Duplicados.length, 1);
  assert.deepEqual(r.h1Duplicados[0]?.urls, ["/a", "/b"]);
});

test("auditoria: una URL viva sin meta description sale listada como meta faltante", () => {
  const r = auditar({
    filas: [
      fila({ url: "/a", metaDescription: null, metaLargo: null }),
      fila({ url: "/b", title: "Otro", h1: "Otro", metaDescription: "   " }),
    ],
  });

  assert.deepEqual(
    r.metasFaltantes.map((m) => m.url),
    ["/a", "/b"],
  );
});

test("auditoria: la comparacion ignora mayusculas, tildes y espacios repetidos", () => {
  // `Hernia discal` y `hernia  discal` son el mismo title para Google y para el lector. Una
  // comparacion literal los dejaria pasar y la auditoria daria limpia sobre un duplicado real.
  assert.equal(claveDeComparacion("Hernia  discal"), claveDeComparacion("hérnia discal"));

  const r = auditar({
    filas: [
      fila({ url: "/a", title: "Hernia discal", h1: "A" }),
      fila({ url: "/b", title: "hernia  DISCAL", h1: "B" }),
    ],
  });
  assert.equal(r.titlesDuplicados.length, 1);
});

test("auditoria: las URLs que redirigen quedan fuera del alcance, nombradas y con motivo", () => {
  // Fuera del alcance no es lo mismo que ausente. Una URL que desaparece del reporte se lee
  // como olvido; una que aparece diciendo por que no se audita deja el criterio auditable.
  const r = auditar({
    filas: [
      fila({ url: "/a" }),
      fila({
        url: "/viejo",
        accion: "redirigir",
        title: null,
        metaDescription: null,
        h1: null,
        h1Origen: null,
        redirigeA: "/nuevo",
      }),
    ],
  });

  assert.equal(r.alcance.auditadas, 1);
  assert.equal(r.alcance.fuera.length, 1);
  assert.equal(r.alcance.fuera[0]?.url, "/viejo");
  assert.ok((r.alcance.fuera[0]?.motivo.length ?? 0) > 20, "el motivo tiene que ser prosa");
  assert.equal(r.metasFaltantes.length, 0, "una URL que se apaga no tiene meta que faltar");
});

test("auditoria: un title de 61 caracteres sale fuera de rango aunque no este duplicado", () => {
  const largo = "A".repeat(61);
  const r = auditar({ filas: [fila({ url: "/a", title: largo, titleLargo: 61 })] });

  assert.equal(r.titlesDuplicados.length, 0);
  assert.equal(r.titlesFueraDeRango.length, 1);
  assert.equal(r.titlesFueraDeRango[0]?.largo, 61);
  assert.equal(r.titlesFueraDeRango[0]?.limite, 60);
});

test("auditoria: una meta de 156 caracteres y una primaria lejos del frente salen listadas", () => {
  const r = auditar({
    filas: [
      fila({ url: "/a", metaDescription: "B".repeat(156) }),
      fila({
        url: "/b",
        title: "Guia de columna para pacientes: hernia discal",
        h1: "Otro H1",
        keywordPrimaria: "hernia discal",
      }),
    ],
  });

  assert.equal(r.metasFueraDeRango.length, 1);
  assert.equal(r.keywordNoAlFrente.length, 1);
  assert.equal(r.keywordNoAlFrente[0]?.url, "/b");
});

test("auditoria: no hace ninguna llamada de red", () => {
  // La auditoria corre sobre el paquete PROPUESTO. Salir a la red seria auditar el sitio
  // publicado, que es lo contrario de lo que ONPAGE-05 pide, y en el caso de `/auditoria` de
  // DinoRank seria peor: ese endpoint devuelve los datos de otro cliente sin marcar error.
  const fuente = readFileSync(path.join(SEO_TOOLS_ROOT, "src/phase15/auditoria.ts"), "utf8");

  for (const prohibido of ["fetch(", "node:http", "undici", "serpapi", "dinorank"]) {
    assert.ok(!fuente.includes(prohibido), `auditoria.ts nombra "${prohibido}"`);
  }
});

test("auditoria: el paquete propuesto de esta fase pasa limpio", () => {
  const r = auditar(construirOnPage());

  assert.equal(r.titlesDuplicados.length, 0, JSON.stringify(r.titlesDuplicados));
  assert.equal(r.h1Duplicados.length, 0, JSON.stringify(r.h1Duplicados));
  assert.equal(r.metasFaltantes.length, 0, JSON.stringify(r.metasFaltantes));
  assert.equal(r.titlesFueraDeRango.length, 0);
  assert.equal(r.metasFueraDeRango.length, 0);
  assert.equal(r.keywordNoAlFrente.length, 0);
  assert.equal(r.alcance.auditadas, 22);
  assert.equal(r.alcance.fuera.length, 2);
});

test("auditoria: dos corridas sobre el mismo dataset producen el mismo resultado", () => {
  const dataset = construirOnPage();
  assert.equal(JSON.stringify(auditar(dataset)), JSON.stringify(auditar(dataset)));
});
