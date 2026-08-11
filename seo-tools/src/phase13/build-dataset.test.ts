/**
 * Pruebas de la vista consolidada de la fase 13 (SHEET-01).
 *
 * La que el plan exige por nombre es la de la guarda: el constructor se niega a escribir la
 * vista si una linea pierde el valor de una columna diferida. Existe porque este plan cambia
 * `Keyword Difficulty` y `Traffic Potential` de literal fijo a campo del registro, y una celda
 * vacia donde antes habia un literal convierte un dato ausente en un cero implicito, en 5.716
 * filas y sin lanzar ninguna excepcion (T-13-30).
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  construirVista,
  lineasSinLiteral,
  serializar,
  type EntradaDeCluster,
  type EntradaDeMetricas,
  type FilaDeVista,
} from "./build-dataset.js";

const BASE: Record<string, unknown>[] = [
  {
    keyword: "hernia discal",
    keywordKey: "hernia discal",
    alcance: "objetivo",
    intent: "informacional",
    stage: "diagnostico",
    metricas: { searchVolume: null, searchVolumeFuente: "sin_datos" },
    keywordDifficulty: "no_consultado",
    trafficPotential: "no_consultado",
    referringDomainsNeeded: "no_consultado",
  },
  {
    keyword: "ortopedia zapatos",
    keywordKey: "ortopedia zapatos",
    alcance: "fuera_de_alcance",
    intent: "transaccional",
    stage: "decision",
    metricas: { searchVolume: 1600, searchVolumeFuente: "dinorank" },
    keywordDifficulty: "no_consultado",
    trafficPotential: "no_consultado",
    referringDomainsNeeded: "no_consultado",
  },
];

const CLUSTERS: EntradaDeCluster[] = [
  {
    keywordKey: "hernia discal",
    cluster: "hernia-discal",
    clusterFuente: "serp",
    topResult: "https://medlineplus.gov/spanish/herniateddisk.html",
  },
];

const METRICAS: EntradaDeMetricas[] = [
  {
    keywordKey: "hernia discal",
    keywordDifficulty: 5,
    keywordDifficultyFuente: "ahrefs",
    trafficPotential: 1500,
    trafficPotentialFuente: "ahrefs",
  },
];

test("la vista tiene exactamente una linea por linea del dataset base y conserva todos sus campos", () => {
  const vista = construirVista(BASE, CLUSTERS, METRICAS);

  assert.equal(vista.length, BASE.length);
  for (let i = 0; i < BASE.length; i += 1) {
    for (const campo of Object.keys(BASE[i] as object)) {
      assert.ok(campo in (vista[i] as object), `la vista perdio el campo ${campo}`);
    }
  }
  assert.deepEqual(vista[1]?.["metricas"], { searchVolume: 1600, searchVolumeFuente: "dinorank" });
});

test("el numero entra solo cuando la procedencia dice que Ahrefs lo devolvio; el resto conserva el literal", () => {
  const vista = construirVista(BASE, CLUSTERS, METRICAS);

  assert.equal(vista[0]?.keywordDifficulty, 5);
  assert.equal(vista[0]?.trafficPotential, 1500);
  assert.equal(vista[1]?.keywordDifficulty, "no_consultado");
  assert.equal(vista[1]?.trafficPotential, "no_consultado");
});

test("una metrica en cache pero SIN dato de la fuente conserva el literal y no se vuelve cero", () => {
  const vista = construirVista(BASE, CLUSTERS, [
    {
      keywordKey: "hernia discal",
      keywordDifficulty: null,
      keywordDifficultyFuente: "ahrefs_sin_dato",
      trafficPotential: null,
      trafficPotentialFuente: "ahrefs_sin_dato",
    },
  ]);

  assert.equal(vista[0]?.keywordDifficulty, "no_consultado");
  assert.notEqual(vista[0]?.keywordDifficulty, 0);
});

test("LA GUARDA: el constructor se niega a escribir si una linea pierde el valor de una columna diferida", () => {
  const vista = construirVista(BASE, CLUSTERS, METRICAS);
  assert.deepEqual(lineasSinLiteral(vista), [], "la vista bien construida no tiene ni una");

  // Se rompe a mano una sola linea, que es exactamente el accidente contra el que existe.
  const rota = [...vista];
  rota[1] = { ...(vista[1] as FilaDeVista), keywordDifficulty: "" } as FilaDeVista;
  const fallos = lineasSinLiteral(rota);

  assert.equal(fallos.length, 1);
  assert.deepEqual(fallos[0], { linea: 2, campo: "keywordDifficulty" });

  // Y los tres modos de perder el valor cuentan igual: vacio, nulo y ausente.
  for (const malo of [{ keywordDifficulty: null }, { keywordDifficulty: undefined }, { keywordDifficulty: "" }]) {
    const r = [{ ...(vista[0] as FilaDeVista), ...malo } as FilaDeVista];
    assert.equal(lineasSinLiteral(r).length, 1, `${JSON.stringify(malo)} tiene que contar como perdida`);
  }
});

test("una fila sin cluster lo declara como nulo y NUNCA hereda el topResult de otra keyword", () => {
  const vista = construirVista(BASE, CLUSTERS, METRICAS);

  assert.equal(vista[1]?.cluster, null);
  assert.equal(vista[1]?.clusterFuente, null);
  assert.equal(vista[1]?.topResult, null, "escribir ahi el resultado de otra keyword seria inventarlo");
});

test("una keyword sin volumen medido conserva su procedencia de dato ausente y no aparece un cero", () => {
  const vista = construirVista(BASE, CLUSTERS, METRICAS);
  const metricas = vista[0]?.["metricas"] as { searchVolume: number | null; searchVolumeFuente: string };

  assert.equal(metricas.searchVolume, null);
  assert.equal(metricas.searchVolumeFuente, "sin_datos");
  assert.notEqual(metricas.searchVolume, 0);
});

test("dos construcciones producen el mismo archivo byte a byte", () => {
  assert.equal(
    serializar(construirVista(BASE, CLUSTERS, METRICAS)),
    serializar(construirVista(BASE, CLUSTERS, METRICAS)),
  );
});
