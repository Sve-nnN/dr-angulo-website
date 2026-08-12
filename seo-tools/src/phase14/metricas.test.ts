import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { SEO_TOOLS_ROOT } from "../config.js";
import { indexarAhrefs, metricasDe, type RegistroDeAhrefs } from "./metricas.js";

const indice = (registros: RegistroDeAhrefs[]) => indexarAhrefs(registros);

test("metricas: solo escribe la celda cuya fuente dice exactamente ahrefs", () => {
  const i = indice([
    { keyword: "hernia discal", volume: 6000, volumeFuente: "ahrefs" },
  ]);
  assert.deepEqual(metricasDe("hernia discal", i), { volumenAhrefs: 6000 });
});

test("metricas: una fuente ahrefs_sin_dato NO escribe la celda", () => {
  // Ahrefs respondio y no tiene la metrica. La celda vacia es la respuesta honesta.
  const i = indice([
    { keyword: "traumatología lima", volume: 50, volumeFuente: "ahrefs", keywordDifficulty: null, keywordDifficultyFuente: "ahrefs_sin_dato" },
  ]);
  const m = metricasDe("traumatología lima", i);
  assert.equal(m.volumenAhrefs, 50);
  assert.equal("kdAhrefs" in m, false, "kd sin dato tiene que quedar FUERA del registro, no vacio");
});

test("metricas: una fuente no_consultado NO escribe la celda", () => {
  // Nunca se le pregunto, por presupuesto de cuota. Es una deuda, no un dato.
  const i = indice([
    { keyword: "cirujano de columna lima", volume: null, volumeFuente: "no_consultado" },
  ]);
  assert.deepEqual(metricasDe("cirujano de columna lima", i), {});
});

test("metricas: un valor de OTRA herramienta bajo el encabezado de Ahrefs nunca se escribe (J-1)", () => {
  // Es exactamente lo que J-1 prohibe: un volumen de DinoRank bajo "Volume (Ahrefs)".
  const i = indice([{ keyword: "lumbalgia", volume: 12000, volumeFuente: "dinorank" }]);
  assert.deepEqual(metricasDe("lumbalgia", i), {});
});

test("metricas: el KD cero es un dato y se escribe", () => {
  // KD 0 significa "sin competencia", no "sin dato". Un `if (valor)` lo perderia.
  const i = indice([
    { keyword: "cirugía de columna", keywordDifficulty: 0, keywordDifficultyFuente: "ahrefs" },
  ]);
  assert.deepEqual(metricasDe("cirugía de columna", i), { kdAhrefs: 0 });
});

test("metricas: fuente ahrefs con valor null no escribe nada", () => {
  const i = indice([{ keyword: "x", volume: null, volumeFuente: "ahrefs" }]);
  assert.deepEqual(metricasDe("x", i), {});
});

test("metricas: una URL sin keyword primaria no tiene metricas que buscar", () => {
  const i = indice([{ keyword: "hernia discal", volume: 6000, volumeFuente: "ahrefs" }]);
  assert.deepEqual(metricasDe(null, i), {});
  assert.deepEqual(metricasDe("", i), {});
  assert.deepEqual(metricasDe("   ", i), {});
});

test("metricas: una keyword que no esta en el dataset devuelve vacio y no rompe", () => {
  const i = indice([{ keyword: "hernia discal", volume: 6000, volumeFuente: "ahrefs" }]);
  assert.deepEqual(metricasDe("keyword inexistente", i), {});
});

test("metricas: el cruce ignora mayusculas y espacios de los bordes", () => {
  const i = indice([{ keyword: "Hernia Discal", volume: 6000, volumeFuente: "ahrefs" }]);
  assert.deepEqual(metricasDe("  hernia discal  ", i), { volumenAhrefs: 6000 });
});

test("metricas sobre el dataset real: cubre las primarias que Ahrefs sí midio", () => {
  const leer = (p: string): unknown[] =>
    readFileSync(path.join(SEO_TOOLS_ROOT, p), "utf8")
      .split("\n")
      .filter((l) => l.trim() !== "")
      .map((l) => JSON.parse(l) as unknown);

  const mapa = leer("data/url-map.jsonl") as { keywordPrimaria?: string | null }[];
  const i = indexarAhrefs(leer("data/ahrefs-keywords.jsonl") as RegistroDeAhrefs[]);

  const primarias = mapa.map((r) => r.keywordPrimaria).filter((k): k is string => Boolean(k));
  const resueltas = primarias.map((k) => metricasDe(k, i));

  const conVolumen = resueltas.filter((m) => m.volumenAhrefs !== undefined).length;
  const conKd = resueltas.filter((m) => m.kdAhrefs !== undefined).length;
  const conTp = resueltas.filter((m) => m.trafficPotentialAhrefs !== undefined).length;

  assert.equal(primarias.length, 16, "el mapa tiene 16 keywords primarias");
  assert.equal(conVolumen, 10);
  assert.equal(conKd, 7);
  assert.equal(conTp, 7);

  // Ninguna celda escrita puede venir de una fuente que no sea Ahrefs.
  for (const m of resueltas) {
    for (const v of Object.values(m)) {
      assert.equal(typeof v, "number");
      assert.equal(Number.isFinite(v as number), true);
    }
  }
});
