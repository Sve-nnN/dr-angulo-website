import assert from "node:assert/strict";
import { test } from "node:test";

import { cruzarMapa, type EntradaDeCruce } from "./cannibal.js";
import type { IndiceDeSerp } from "./overlap.js";
import type { AsignacionDeUrl } from "./model.js";

/**
 * Indice de SERP de juguete. Se construye a mano y no se lee de la cache a proposito: estas
 * pruebas comprueban la REGLA de decision, y una regla que solo se puede probar con los datos
 * reales no se puede probar contra el caso limite.
 */
function indice(pares: Record<string, readonly string[]>): IndiceDeSerp {
  const porClave = new Map(
    Object.entries(pares).map(([keyword, urls]) => [
      keyword,
      { keyword, clave: keyword, urls: [...urls].sort() },
    ]),
  );
  return { porClave, sinCaptura: [], tope: 10 };
}

function fila(p: Partial<AsignacionDeUrl> & { url: string }): AsignacionDeUrl {
  return {
    titulo: "t",
    estado: "viva",
    origen: "src/x.ts:1",
    esPaginaSeo: true,
    keywordPrimaria: "k",
    keywordPrimariaKey: "k",
    secundarias: ["s1", "s2", "s3"],
    intent: "informacional",
    tipoDePagina: "guia",
    tipoExigidoPorSerp: "guia",
    cluster: null,
    clusterFuente: null,
    accion: "reescribir",
    motivoDeAccion: "Motivo suficientemente largo para pasar la validacion del modelo.",
    motivoSinPrimaria: null,
    redirigeA: null,
    dejarActualizarEliminar: "actualizar",
    canonical: `https://drangulocolumna.com${p.url}`,
    topic: "t",
    justificacion: "j",
    ...p,
  } as AsignacionDeUrl;
}

function cruce(parcial: Partial<EntradaDeCruce> & { mapa: readonly AsignacionDeUrl[] }): EntradaDeCruce {
  return {
    indice: indice({}),
    oroPorClave: new Map(),
    intocables: new Set(),
    ...parcial,
  };
}

// --- Conducta 1 -------------------------------------------------------------------------------

test("cannibal: dos URLs con la misma clave primaria producen un conflicto alto", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/a", keywordPrimaria: "hernia discal", keywordPrimariaKey: "hernia discal" }),
        fila({ url: "/b", keywordPrimaria: "hernia discal", keywordPrimariaKey: "hernia discal" }),
      ],
    }),
  );
  assert.equal(r.conflictos.length, 1);
  assert.equal(r.conflictos[0]?.tipo, "misma-primaria");
  assert.equal(r.conflictos[0]?.severidad, "alta");
});

// --- Conducta 2 -------------------------------------------------------------------------------

test("cannibal: dos primarias escritas distinto que comparten SERP sobre el umbral chocan igual", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/a", keywordPrimaria: "cirujano de columna lima", keywordPrimariaKey: "a" }),
        fila({ url: "/b", keywordPrimaria: "neurocirujano lima", keywordPrimariaKey: "b" }),
      ],
      indice: indice({
        "cirujano de columna lima": ["u1", "u2", "u3", "u9"],
        "neurocirujano lima": ["u1", "u2", "u3", "u8"],
      }),
    }),
  );
  assert.equal(r.conflictos.length, 1);
  assert.equal(r.conflictos[0]?.tipo, "solape-de-serp");
  assert.equal(r.conflictos[0]?.severidad, "alta");
  assert.deepEqual(r.conflictos[0]?.urlsCompartidas, ["u1", "u2", "u3"]);
});

// --- Conducta 3: la del cluster por transitividad ----------------------------------------------

test("cannibal: dos URLs del mismo cluster con solape cero NO son conflicto, y el reporte lo explica", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({
          url: "/a",
          keywordPrimaria: "ortopedia infantil lima",
          keywordPrimariaKey: "a",
          cluster: "especialista-en-columna-y-trauma-en-lima",
        }),
        fila({
          url: "/b",
          keywordPrimaria: "traumatologia lima",
          keywordPrimariaKey: "b",
          cluster: "especialista-en-columna-y-trauma-en-lima",
        }),
      ],
      indice: indice({
        "ortopedia infantil lima": ["u1", "u2"],
        "traumatologia lima": ["u7", "u8"],
      }),
    }),
  );
  assert.equal(r.conflictos.length, 0);
  assert.equal(r.paresDelMismoClusterSinSolape.length, 1);
  assert.match(r.paresDelMismoClusterSinSolape[0]?.explicacion as string, /transitividad/);
  assert.match(r.paresDelMismoClusterSinSolape[0]?.explicacion as string, /D-05/);
});

// --- Conducta 4 -------------------------------------------------------------------------------

test("cannibal: una secundaria que es primaria de otra URL produce un conflicto medio", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({
          url: "/a",
          keywordPrimaria: "escoliosis",
          keywordPrimariaKey: "escoliosis",
          secundarias: ["hernia discal", "otra", "tercera"],
        }),
        fila({ url: "/b", keywordPrimaria: "hernia discal", keywordPrimariaKey: "hernia discal" }),
      ],
    }),
  );
  const medios = r.conflictos.filter((c) => c.severidad === "media");
  assert.equal(medios.length, 1);
  assert.equal(medios[0]?.tipo, "secundaria-es-primaria-ajena");
  assert.deepEqual(medios[0]?.urls, ["/a", "/b"]);
});

// --- Conducta 5 -------------------------------------------------------------------------------

test("cannibal: la misma geo de distrito en dos primarias produce conflicto alto (D-04)", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/a", keywordPrimaria: "cirugía de columna surco", keywordPrimariaKey: "a" }),
        fila({ url: "/b", keywordPrimaria: "traumatólogo surco", keywordPrimariaKey: "b" }),
      ],
    }),
  );
  assert.equal(r.conflictos.length, 1);
  assert.equal(r.conflictos[0]?.tipo, "distrito-duplicado");
  assert.equal(r.conflictos[0]?.severidad, "alta");
  assert.match(r.conflictos[0]?.evidencia as string, /surco/);
});

// --- Conducta 6 -------------------------------------------------------------------------------

test("cannibal: cuando hay conflicto gana la URL de oro y el reporte nombra cual (D-06)", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/a", keywordPrimaria: "escoliosis", keywordPrimariaKey: "escoliosis" }),
        fila({ url: "/b", keywordPrimaria: "escoliosis", keywordPrimariaKey: "escoliosis" }),
      ],
      oroPorClave: new Map([["escoliosis", "escoliosis (oro numero 1)"]]),
    }),
  );
  // Las dos declaran la misma clave, asi que las dos son de oro: sin diferencia no hay desempate.
  assert.equal(r.conflictos[0]?.resolucion, undefined);

  const conDiferencia = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/a", keywordPrimaria: "cirujano de columna lima", keywordPrimariaKey: "oro" }),
        fila({ url: "/b", keywordPrimaria: "neurocirujano lima", keywordPrimariaKey: "sinoro" }),
      ],
      indice: indice({
        "cirujano de columna lima": ["u1", "u2", "u3"],
        "neurocirujano lima": ["u1", "u2", "u3"],
      }),
      oroPorClave: new Map([["oro", "cirujano de columna lima (oro numero 9)"]]),
    }),
  );
  const resolucion = conDiferencia.conflictos[0]?.resolucion;
  assert.ok(resolucion !== undefined);
  assert.equal(resolucion.ganadora, "/a");
  assert.equal(resolucion.perdedora, "/b");
  assert.match(resolucion.keywordDeOroQueGano as string, /oro numero 9/);
  assert.match(resolucion.motivo, /D-06/);
});

test("cannibal: una URL aprobada en el plan 14-02 no cede su primaria aunque pierda (T-14-10)", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/nueva", keywordPrimaria: "cirujano de columna lima", keywordPrimariaKey: "oro" }),
        fila({ url: "/servicios", keywordPrimaria: "neurocirujano lima", keywordPrimariaKey: "sinoro" }),
      ],
      indice: indice({
        "cirujano de columna lima": ["u1", "u2", "u3"],
        "neurocirujano lima": ["u1", "u2", "u3"],
      }),
      oroPorClave: new Map([["oro", "cirujano de columna lima (oro numero 9)"]]),
      intocables: new Set(["/servicios"]),
    }),
  );
  const resolucion = r.conflictos[0]?.resolucion;
  assert.ok(resolucion !== undefined);
  assert.equal(resolucion.perdedora, "/servicios");
  assert.equal(resolucion.cedio, null, "una fila aprobada por Juan no se reasigna sola");
});

// --- Conducta 7 -------------------------------------------------------------------------------

test("cannibal: un mapa sin conflictos produce reporte con lista vacia y conteo en cero", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/a", keywordPrimaria: "escoliosis", keywordPrimariaKey: "escoliosis", secundarias: ["x1", "x2", "x3"] }),
        fila({ url: "/b", keywordPrimaria: "artrosis", keywordPrimariaKey: "artrosis", secundarias: ["y1", "y2", "y3"] }),
      ],
    }),
  );
  assert.deepEqual(r.conflictos, []);
  assert.equal(r.resumen.conflictos, 0);
  assert.equal(r.resumen.altosSinResolucion, 0);
  assert.equal(r.resumen.paresComparados, 1);
  assert.equal(r.umbralDeSolape, 3);
});

// --- Forma del reporte -------------------------------------------------------------------------

test("cannibal: todo conflicto viaja con su evidencia de solape y el umbral aplicado", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/a", keywordPrimaria: "hernia discal", keywordPrimariaKey: "hernia discal", secundarias: ["artrosis", "s2", "s3"] }),
        fila({ url: "/b", keywordPrimaria: "hernia discal", keywordPrimariaKey: "hernia discal" }),
        fila({ url: "/c", keywordPrimaria: "artrosis", keywordPrimariaKey: "artrosis" }),
      ],
    }),
  );
  assert.ok(r.conflictos.length >= 2);
  for (const c of r.conflictos) {
    assert.ok(Array.isArray(c.urlsCompartidas));
    assert.equal(typeof c.umbralAplicado, "number");
    assert.ok(c.evidencia.length > 40, "la evidencia tiene que ser prosa auditable");
  }
});

test("cannibal: una fila sin primaria no cruza contra nadie porque no compite", () => {
  const r = cruzarMapa(
    cruce({
      mapa: [
        fila({ url: "/a", keywordPrimaria: "escoliosis", keywordPrimariaKey: "escoliosis", secundarias: ["x1", "x2", "x3"] }),
        fila({
          url: "/sedes",
          esPaginaSeo: false,
          keywordPrimaria: null,
          keywordPrimariaKey: null,
          secundarias: [],
          accion: "dejar",
        }),
      ],
    }),
  );
  assert.equal(r.conflictos.length, 0);
  assert.equal(r.resumen.paresComparados, 0);
  assert.equal(r.resumen.urlsCruzadas, 2, "la fila sin primaria se cuenta aunque no cruce");
});
