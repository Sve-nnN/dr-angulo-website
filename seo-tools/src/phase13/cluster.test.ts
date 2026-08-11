/**
 * Pruebas del clustering de la fase 13.
 *
 * Las tres que el plan exige por nombre son las tres primeras: el umbral exacto de tres URLs,
 * la transitividad de la union, y la que expresa el criterio literal de KWR-04 —dos keywords
 * casi identicas en texto con SERP disjunta quedan en clusters DISTINTOS—.
 *
 * Corren sin red y sin credencial: las SERP se construyen a mano, porque lo que se esta
 * probando es la regla de agrupacion y no el parser.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  UMBRAL_SOLAPE,
  agruparCabezas,
  asignarCola,
  contarPorCluster,
  idDeCluster,
  normalizarUrl,
  terminosClinicos,
  tokens,
  topResultDe,
  urlsDelTop,
  type CabezaConSerp,
} from "./cluster.js";
import type { SerpCompleta } from "./serp.js";

/** SERP sintetica con las URLs que la prueba quiere, en orden de posicion. */
function serp(keyword: string, urls: readonly string[]): SerpCompleta {
  return {
    keyword,
    organicos: urls.map((url, i) => ({
      posicion: i + 1,
      url,
      dominio: new URL(url).hostname.replace(/^www\./, ""),
      titulo: `Resultado ${i + 1}`,
      fragmento: null,
      enlaceMostrado: null,
    })),
    packLocal: [],
    relacionadas: [],
    preguntas: [],
    destacado: null,
    resumenIa: false,
    videos: false,
    capturadaEn: "2026-08-11T17:00:00.000Z",
  };
}

function cabeza(keyword: string, urls: readonly string[], rango = 2): CabezaConSerp {
  return {
    keyword,
    keywordKey: keyword,
    rango,
    familia: "prueba",
    serp: serp(keyword, urls),
  };
}

const A = "https://a.pe/uno";
const B = "https://b.pe/dos";
const C = "https://c.pe/tres";
const D = "https://d.pe/cuatro";
const E = "https://e.pe/cinco";
const F = "https://f.pe/seis";
const G = "https://g.pe/siete";

test("dos cabezas con exactamente tres URLs compartidas caen juntas; con exactamente dos quedan separadas", () => {
  assert.equal(UMBRAL_SOLAPE, 3, "el umbral de D-05 es tres, no otro");

  const conTres = agruparCabezas([
    cabeza("hernia discal", [A, B, C, D]),
    cabeza("hernia de disco", [A, B, C, E]),
  ]);
  assert.equal(conTres.length, 1, "tres compartidas unen");
  assert.equal(conTres[0]?.cabezas.length, 2);
  assert.deepEqual(conTres[0]?.uniones[0]?.urls, ["a.pe/uno", "b.pe/dos", "c.pe/tres"]);

  const conDos = agruparCabezas([
    cabeza("hernia discal", [A, B, D, F]),
    cabeza("hernia de disco", [A, B, E, G]),
  ]);
  assert.equal(conDos.length, 2, "dos compartidas NO unen: el umbral es tres");
  assert.equal(conDos[0]?.uniones.length, 0);
});

test("la union es transitiva: A con B y B con C hace un solo cluster aunque A y C compartan menos de tres", () => {
  const a = cabeza("alfa", [A, B, C, D]);
  const b = cabeza("beta", [A, B, C, E]); // comparte 3 con alfa
  const c = cabeza("gama", [C, E, F, G]); // comparte 3 con beta (C, E) ... se ajusta abajo

  // Se arma a mano para que el solape sea exactamente el que la prueba afirma.
  const beta = cabeza("beta", [A, B, C, E]);
  const gama = cabeza("gama", [B, C, E, G]); // con beta comparte B, C, E = 3; con alfa comparte B, C = 2

  const soloAlfaGama = agruparCabezas([a, gama]);
  assert.equal(soloAlfaGama.length, 2, "alfa y gama por si solas NO se unen: comparten dos");

  const lasTres = agruparCabezas([a, beta, gama]);
  assert.equal(lasTres.length, 1, "con beta en medio, las tres son un solo cluster");
  assert.equal(lasTres[0]?.cabezas.length, 3);
  assert.deepEqual([...(lasTres[0]?.cabezas ?? [])].sort(), ["alfa", "beta", "gama"]);
  void b;
  void c;
});

test("dos keywords casi identicas en texto con SERP disjunta quedan en clusters distintos", () => {
  // Es el criterio literal de KWR-04: manda el solape de SERP, no el parecido de texto.
  const clusters = agruparCabezas([
    cabeza("cirugia de columna", [A, B, C, D]),
    cabeza("cirugia de columnas", [E, F, G, "https://h.pe/ocho"]),
  ]);

  assert.equal(clusters.length, 2, "el texto casi identico no las pega: Google las trata distinto");
  const nombres = clusters.map((c) => c.nombre).sort();
  assert.deepEqual(nombres, ["cirugia de columna", "cirugia de columnas"]);
});

test("el nombre del cluster es la cabeza de mayor valor de negocio, con desempate por clave", () => {
  const clusters = agruparCabezas([
    cabeza("zeta generica", [A, B, C, D], 5),
    cabeza("hernia discal", [A, B, C, E], 1),
    cabeza("alfa generica", [A, B, C, F], 5),
  ]);

  assert.equal(clusters.length, 1);
  assert.equal(clusters[0]?.nombre, "hernia discal", "gana el rango 1");
  assert.equal(clusters[0]?.cabezas[1], "alfa generica", "entre dos rango 5 gana la clave menor");
  assert.equal(clusters[0]?.id, "hernia-discal");
});

test("cada cluster registra el tipo de pagina dominante de su cabeza con el reparto completo", () => {
  const clusters = agruparCabezas([
    cabeza("hernia discal", [
      "https://www.mayoclinic.org/es/diseases-conditions/herniated-disk/symptoms-causes/syc-1",
      "https://medlineplus.gov/spanish/ency/article/000442.htm",
      "https://www.doctoralia.pe/traumatologo/lima",
    ]),
  ]);

  assert.equal(clusters.length, 1);
  assert.ok(clusters[0]?.tipoDePagina, "todo cluster tiene tipo de pagina");
  assert.equal(clusters[0]?.tipoDePagina, "contenido-internacional");
  assert.ok(Object.keys(clusters[0]?.repartoDeTipos ?? {}).length >= 2, "el reparto va completo");
  assert.equal(
    clusters[0]?.topResult,
    "https://www.mayoclinic.org/es/diseases-conditions/herniated-disk/symptoms-causes/syc-1",
  );
});

test("una fila de la cola hereda el cluster pero NUNCA el topResult de su cabeza", () => {
  const cabezas = [cabeza("hernia discal", [A, B, C, D], 1)];
  const clusters = agruparCabezas(cabezas);

  const asignacion = asignarCola(
    [
      { keyword: "hernia discal", keywordKey: "hernia discal" },
      { keyword: "hernia discal lima", keywordKey: "hernia discal lima" },
    ],
    cabezas,
    clusters,
  );

  const laCabeza = asignacion.filas.find((f) => f.keywordKey === "hernia discal");
  assert.equal(laCabeza?.clusterFuente, "serp");
  assert.equal(laCabeza?.topResult, A, "la cabeza si lleva su propio topResult");

  const laCola = asignacion.filas.find((f) => f.keywordKey === "hernia discal lima");
  assert.equal(laCola?.clusterFuente, "texto");
  assert.equal(laCola?.cluster, "hernia-discal", "el geo no separa: lima es terreno, no tema");
  assert.equal(laCola?.topResult, null, "cero filas de la cola heredan un topResult ajeno");
});

test("hernia discal y hernia inguinal NO caen juntas pese a compartir dos de tres tokens", () => {
  const cabezas = [cabeza("hernia discal", [A, B, C, D], 1)];
  const clusters = agruparCabezas(cabezas);

  const asignacion = asignarCola(
    [{ keyword: "hernia inguinal lima", keywordKey: "hernia inguinal lima" }],
    cabezas,
    clusters,
  );

  assert.equal(asignacion.filas[0]?.cluster, null);
  assert.equal(asignacion.filas[0]?.clusterFuente, null);
  assert.equal(asignacion.sinCluster, 1, "sin cluster es informacion, no un fallo");
});

test("una keyword que no comparte ningun termino clinico con ninguna cabeza queda sin cluster", () => {
  const cabezas = [cabeza("escoliosis", [A, B, C, D], 1)];
  const clusters = agruparCabezas(cabezas);

  const asignacion = asignarCola(
    [{ keyword: "pintura de paredes lima", keywordKey: "pintura de paredes lima" }],
    cabezas,
    clusters,
  );

  assert.equal(asignacion.filas[0]?.clusterFuente, null);
});

test("la asignacion es determinista: dos corridas producen exactamente las mismas filas", () => {
  const cabezas = [
    cabeza("ciatica", [A, B, C, D], 2),
    cabeza("lumbalgia", [A, B, C, E], 2),
    cabeza("escoliosis", [E, F, G, "https://z.pe/z"], 1),
  ];
  const universo = [
    { keyword: "ciatica tratamiento", keywordKey: "ciatica tratamiento" },
    { keyword: "escoliosis en ninos", keywordKey: "escoliosis en ninos" },
    { keyword: "lumbalgia aguda lima", keywordKey: "lumbalgia aguda lima" },
  ];

  const uno = asignarCola(universo, cabezas, agruparCabezas(cabezas));
  const dos = asignarCola(universo, cabezas, agruparCabezas(cabezas));

  assert.deepEqual(uno.filas, dos.filas);
  assert.equal(JSON.stringify(agruparCabezas(cabezas)), JSON.stringify(agruparCabezas(cabezas)));
});

test("normalizarUrl saca esquema, www, barra final y parametros de rastreo", () => {
  assert.equal(normalizarUrl("https://www.sanna.pe/sedes/"), "sanna.pe/sedes");
  assert.equal(normalizarUrl("http://sanna.pe/sedes"), "sanna.pe/sedes");
  assert.equal(
    normalizarUrl("https://sanna.pe/sedes?utm_source=google&gclid=abc"),
    "sanna.pe/sedes",
  );
  assert.equal(normalizarUrl("https://sanna.pe/nota?id=7#seccion"), "sanna.pe/nota?id=7");
  assert.equal(normalizarUrl("no es una url"), null, "una URL rota se ignora, no tumba nada");
});

test("dos articulos distintos de la misma clinica NO cuentan como la misma respuesta", () => {
  // Si se comparara por dominio, estas dos cabezas se unirian. Se compara por URL completa.
  const clusters = agruparCabezas([
    cabeza("uno", [
      "https://clinica.pe/a",
      "https://clinica.pe/b",
      "https://clinica.pe/c",
      "https://otro.pe/x",
    ]),
    cabeza("dos", [
      "https://clinica.pe/d",
      "https://clinica.pe/e",
      "https://clinica.pe/f",
      "https://otro.pe/y",
    ]),
  ]);

  assert.equal(clusters.length, 2);
});

test("los tokens significativos descartan vacias y modificadores geograficos", () => {
  assert.deepEqual([...tokens("cirujano de columna en san isidro")].sort(), [
    "cirujano",
    "columna",
  ]);
  assert.deepEqual([...terminosClinicos("que es un neurocirujano")], ["neurocirujano"]);
  assert.equal(tokens("cerca de mi").size, 0);
});

test("los contadores por cluster reparten entre validadas por SERP e inferidas por texto", () => {
  const cabezas = [cabeza("ciatica", [A, B, C, D], 2)];
  const clusters = agruparCabezas(cabezas);
  const asignacion = asignarCola(
    [
      { keyword: "ciatica", keywordKey: "ciatica" },
      { keyword: "ciatica tratamiento", keywordKey: "ciatica tratamiento" },
      { keyword: "pintura lima", keywordKey: "pintura lima" },
    ],
    cabezas,
    clusters,
  );

  const contados = contarPorCluster(clusters, asignacion.filas);
  assert.equal(contados[0]?.keywords, 2);
  assert.equal(contados[0]?.validadasPorSerp, 1);
  assert.equal(contados[0]?.inferidasPorTexto, 1);
});

test("urlsDelTop se queda en el top 10 y topResultDe devuelve la posicion 1", () => {
  const once = Array.from({ length: 11 }, (_, i) => `https://sitio${i + 1}.pe/p`);
  const s = serp("k", once);
  assert.equal(urlsDelTop(s).size, 10, "el resultado 11 no entra");
  assert.equal(topResultDe(s), "https://sitio1.pe/p");
  assert.equal(idDeCluster("Cirugía de Columna"), "cirugia-de-columna");
});

// ---------------------------------------------------------------------------
// Renombre explicito de cluster (plan 13-04)
// ---------------------------------------------------------------------------

test("un renombre declarado cambia el nombre Y el id del cluster, y no toca los demas", () => {
  const cabezas = [
    cabeza("traumatologo ortopedia infantil", [A, B, C, D], 0),
    cabeza("traumatologo lima", [A, B, C, E], 1),
    cabeza("escoliosis", [E, F, G], 2),
  ];

  const sinRenombre = agruparCabezas(cabezas);
  assert.equal(sinRenombre[0]?.nombre, "traumatologo ortopedia infantil");

  const conRenombre = agruparCabezas(cabezas, {
    nombres: { "traumatologo ortopedia infantil": "especialista en columna y trauma en Lima" },
  });

  const renombrado = conRenombre.find((c) => c.cabezas.includes("traumatologo lima"));
  assert.equal(renombrado?.nombre, "especialista en columna y trauma en Lima");
  assert.equal(renombrado?.id, "especialista-en-columna-y-trauma-en-lima");
  assert.equal(renombrado?.cabezas.length, 2, "el renombre no cambia que cabezas agrupa");

  const intacto = conRenombre.find((c) => c.cabezas.includes("escoliosis"));
  assert.equal(intacto?.nombre, "escoliosis", "un cluster sin renombre declarado no se toca");
});

test("un renombre que no calza con ninguna cabeza principal no cambia nada", () => {
  const cabezas = [cabeza("escoliosis", [A, B, C, D], 2)];
  const conRenombre = agruparCabezas(cabezas, { nombres: { "keyword que no existe": "otro" } });
  assert.equal(conRenombre[0]?.nombre, "escoliosis");
  assert.equal(conRenombre[0]?.id, "escoliosis");
});

test("la cola renombrada arrastra el nombre nuevo a las filas del universo", () => {
  const cabezas = [cabeza("traumatologo ortopedia infantil", [A, B, C, D], 0)];
  const clusters = agruparCabezas(cabezas, {
    nombres: { "traumatologo ortopedia infantil": "especialista en columna y trauma en Lima" },
  });
  const asignacion = asignarCola(
    [
      { keyword: "traumatologo ortopedia infantil", keywordKey: "traumatologo ortopedia infantil" },
      { keyword: "traumatologo ortopedia infantil lima", keywordKey: "traumatologo ortopedia infantil lima" },
    ],
    cabezas,
    clusters,
  );

  // La fila del universo lleva el ID del cluster, que es lo que viaja a la columna `Cluster`
  // del Sheet. Renombrar el cluster tiene que arrastrarlo tambien ahi, o el dataset quedaria
  // con dos nombres para el mismo grupo.
  for (const fila of asignacion.filas) {
    assert.equal(fila.cluster, "especialista-en-columna-y-trauma-en-lima");
  }
});
