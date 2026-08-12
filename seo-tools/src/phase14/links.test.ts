/**
 * Pruebas de la matriz de enlazado interno.
 *
 * Las ocho conductas que el plan declara tienen una prueba cada una. Las que se pueden medir
 * sobre el mapa real se miden ahi, porque una matriz que cumple sobre un fixture inventado y no
 * sobre el sitio no sirve de nada. Las que necesitan una situacion que el sitio de hoy no tiene
 * —dos URLs en el mismo cluster, un par fusionable— se prueban sobre un mapa sintetico, que es
 * la unica forma de comprobar una guarda que todavia no se activo.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { CliError } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import {
  construirMatriz,
  contarEntrantes,
  documentoLegible,
  leerClusters,
  leerMapaSincrono,
  leerOro,
  MAX_ENLACES,
  repartirAnchors,
  seccionDe,
  sinGeo,
  tituloCorto,
  type ArchivoDeEnlaces,
  type ClusterLegible,
  type EntradaDeMatriz,
} from "./links.js";
import { validarAsignacion, type AsignacionDeUrl } from "./model.js";
import type { EntradaMedida, IndiceDeSerp } from "./overlap.js";

// ---------------------------------------------------------------------------
// Material
// ---------------------------------------------------------------------------

/** Indice de SERP en memoria: la prueba no toca la cache ni la red. */
function indiceDe(entradas: Readonly<Record<string, readonly string[]>>): IndiceDeSerp {
  const porClave = new Map<string, EntradaMedida>();
  for (const [keyword, urls] of Object.entries(entradas)) {
    const clave = normalizeKeyword(keyword);
    porClave.set(clave, { keyword, clave, urls: [...urls].sort() });
  }
  return { porClave, sinCaptura: [], tope: 10 };
}

function asignacion(sobrescritos: Record<string, unknown>): AsignacionDeUrl {
  const url = String(sobrescritos["url"] ?? "/x");
  return validarAsignacion(
    {
      titulo: `Titulo de ${url}`,
      estado: "viva",
      origen: "prueba",
      esPaginaSeo: true,
      keywordPrimaria: "keyword de prueba",
      keywordPrimariaKey: "keyword de prueba",
      secundarias: ["secundaria uno", "secundaria dos", "secundaria tres"],
      intent: "informacional",
      tipoDePagina: "pagina-de-servicio",
      tipoExigidoPorSerp: null,
      cluster: null,
      clusterFuente: null,
      accion: "dejar",
      motivoDeAccion: "Existe y se deja como esta, sin cambios de contenido en esta fase.",
      motivoSinPrimaria: null,
      redirigeA: null,
      dejarActualizarEliminar: "dejar",
      canonical: `https://drangulocolumna.com${url}`,
      topic: "prueba",
      justificacion: "Fixture de prueba, sin valor editorial.",
      ...sobrescritos,
    },
    "prueba",
  );
}

const CLUSTERS_SINTETICOS: ReadonlyMap<string, ClusterLegible> = new Map([
  ["cluster-a", { nombre: "cluster A", familia: "familia-uno" }],
  ["cluster-b", { nombre: "cluster B", familia: "familia-uno" }],
]);

const MAPA_REAL = leerMapaSincrono("data/url-map.jsonl");
const CLUSTERS_REALES = leerClusters();
const ORO_REAL = leerOro();

/**
 * La matriz real se construye una sola vez y con un indice de SERP VACIO.
 *
 * El indice solo alimenta la guarda de fusion, y un indice vacio hace que ningun veredicto sea
 * fusionable: la matriz sale igual. Se prueba asi para que la suite no dependa de `.cache/`,
 * que esta gitignoreada y podria no existir en otra maquina. La guarda de fusion se prueba
 * aparte, con un indice sintetico donde SI hay un par fusionable.
 */
const MATRIZ_REAL: ArchivoDeEnlaces = construirMatriz({
  mapa: MAPA_REAL,
  clusters: CLUSTERS_REALES,
  oroPorClave: ORO_REAL,
  indice: indiceDe({}),
});

// ---------------------------------------------------------------------------
// Las ocho conductas declaradas
// ---------------------------------------------------------------------------

test("links: ninguna URL se enlaza a si misma", () => {
  for (const fila of MATRIZ_REAL.filas) {
    assert.ok(!fila.enlaces.some((e) => e.link === fila.url), `${fila.url} se enlaza a si misma`);
  }
});

test("links: ninguna URL propone mas de ocho enlaces salientes", () => {
  assert.equal(MAX_ENLACES, 8);
  for (const fila of MATRIZ_REAL.filas) {
    assert.ok(fila.enlaces.length <= MAX_ENLACES, `${fila.url} propone ${fila.enlaces.length}`);
  }
});

test("links: una URL de oro recibe enlace entrante desde su vecindad, incluido el mismo cluster", () => {
  // Caso del mismo cluster, que el sitio de hoy no tiene: el mapa asigna UNA URL por cluster.
  const sintetico = construirMatriz({
    mapa: [
      asignacion({ url: "/a", cluster: "cluster-a", clusterFuente: "serp", keywordPrimaria: "escoliosis", keywordPrimariaKey: "escoliosis" }),
      asignacion({ url: "/b", cluster: "cluster-a", clusterFuente: "serp", keywordPrimaria: "cifosis", keywordPrimariaKey: "cifosis", secundarias: ["cifosis dorsal", "cifosis lumbar", "cifosis cirugia"] }),
    ],
    clusters: CLUSTERS_SINTETICOS,
    oroPorClave: new Map([["escoliosis", 1]]),
    indice: indiceDe({}),
  });
  const haciaA = sintetico.filas.find((f) => f.url === "/b")?.enlaces.map((e) => e.link) ?? [];
  assert.ok(haciaA.includes("/a"), "la URL de oro tiene que recibir enlace de su compañera de cluster");

  // Y sobre el mapa real: la comprobacion vive dentro de construirMatriz, asi que si alguna de
  // oro quedara sin vecindad la construccion de arriba ya habria lanzado. Se afirma explicito.
  const deOro = MAPA_REAL.filter((a) =>
    [a.keywordPrimaria, ...a.secundarias]
      .filter((k): k is string => k !== null)
      .some((k) => ORO_REAL.has(normalizeKeyword(k))),
  );
  assert.ok(deOro.length >= 8);
  const entrantes = contarEntrantes(MATRIZ_REAL.filas);
  for (const a of deOro) {
    if (a.accion === "redirigir") continue;
    assert.ok((entrantes.get(a.url) ?? 0) >= 1, `${a.url} sirve una de oro y no recibe enlaces`);
  }
});

test("links: un post de blog enlaza hacia la guia de servicio de su tema, y no al reves", () => {
  const post = MATRIZ_REAL.filas.find(
    (f) => f.url === "/blog/5-sintomas-de-columna-que-no-debes-ignorar",
  );
  assert.ok(post);
  const haciaServicio = post.enlaces.find((e) => e.link === "/servicios/hernia-discal");
  assert.ok(haciaServicio, "el post de ciatica tiene que mandar a la guia que lleva esa secundaria");
  assert.equal(haciaServicio.regla, "mencion-inversa");

  // Y la guia NO devuelve el enlace: la captacion alimenta, no vende (D-09).
  const guia = MATRIZ_REAL.filas.find((f) => f.url === "/servicios/hernia-discal");
  assert.ok(guia);
  assert.ok(!guia.enlaces.some((e) => e.link.startsWith("/blog/")));

  // Ninguna guia de servicio enlaza a un post, en todo el sitio.
  for (const fila of MATRIZ_REAL.filas.filter((f) => f.url.startsWith("/servicios/"))) {
    assert.ok(
      !fila.enlaces.some((e) => e.link.startsWith("/blog/")),
      `${fila.url} enlaza hacia un post y la direccion es la contraria`,
    );
  }
});

test("links: el anchor sale de una keyword del destino y nunca del titulo del origen", () => {
  const porUrl = new Map(MAPA_REAL.map((a) => [a.url, a]));

  for (const fila of MATRIZ_REAL.filas) {
    const origen = porUrl.get(fila.url) as AsignacionDeUrl;
    for (const e of fila.enlaces) {
      const destino = porUrl.get(e.link) as AsignacionDeUrl;
      const propias = [
        ...destino.secundarias,
        ...(destino.keywordPrimaria === null ? [] : [destino.keywordPrimaria]),
        tituloCorto(destino.titulo),
      ].map((k) => k.trim().toLowerCase());

      assert.ok(propias.includes(e.anchor.trim().toLowerCase()), `${fila.url} -> ${e.link}: ${e.anchor}`);
      assert.notEqual(e.anchor.trim().toLowerCase(), origen.titulo.trim().toLowerCase());
      assert.notEqual(e.anchor.trim().toLowerCase(), tituloCorto(origen.titulo).toLowerCase());
    }
  }

  // Cuando el destino pelea keywords, el anchor sale de ellas y no de su titulo.
  const conKeywords = MATRIZ_REAL.filas
    .flatMap((f) => f.enlaces)
    .filter((e) => (porUrl.get(e.link) as AsignacionDeUrl).secundarias.length > 0);
  assert.ok(conKeywords.length > 0);
  for (const e of conKeywords) {
    const destino = porUrl.get(e.link) as AsignacionDeUrl;
    const keywords = [...destino.secundarias, destino.keywordPrimaria]
      .filter((k): k is string => k !== null)
      .map((k) => k.trim().toLowerCase());
    assert.ok(keywords.includes(e.anchor.trim().toLowerCase()), `${e.link} deberia usar keyword`);
  }
});

test("links: dos URLs que comparten una secundaria no se enlazan con el mismo anchor", () => {
  // `traumatologia especialista en columna` es secundaria de la home Y del hub de servicios.
  const home = MAPA_REAL.find((a) => a.url === "/") as AsignacionDeUrl;
  const hub = MAPA_REAL.find((a) => a.url === "/servicios") as AsignacionDeUrl;
  const compartida = home.secundarias.find((s) => hub.secundarias.includes(s));
  assert.ok(compartida, "el fixture real tiene que traer una secundaria compartida");

  const usos = MATRIZ_REAL.filas
    .flatMap((f) => f.enlaces)
    .filter((e) => e.anchor.trim().toLowerCase() === compartida.trim().toLowerCase());
  assert.equal(new Set(usos.map((e) => e.link)).size <= 1, true);

  // El reparto es explicito: el pozo de cada destino no comparte ni un anchor con otro.
  const pozos = repartirAnchors(
    MAPA_REAL.filter((a) => a.accion !== "redirigir").map((a) => ({
      a,
      seccion: seccionDe(a.url),
      familia: null,
      oro: null,
      terminos: [],
    })),
  );
  const vistos = new Map<string, string>();
  for (const [url, pozo] of pozos) {
    for (const anchor of pozo) {
      const clave = anchor.trim().toLowerCase();
      assert.equal(vistos.get(clave) ?? url, url, `el anchor "${anchor}" esta en dos pozos`);
      vistos.set(clave, url);
    }
  }
});

test("links: ningun anchor apunta a dos destinos distintos en todo el sitio", () => {
  const destino = new Map<string, string>();
  for (const fila of MATRIZ_REAL.filas) {
    for (const e of fila.enlaces) {
      const clave = e.anchor.trim().toLowerCase();
      const previo = destino.get(clave);
      assert.equal(previo ?? e.link, e.link, `el anchor "${e.anchor}" apunta a dos lados`);
      destino.set(clave, e.link);
    }
  }
});

test("links: ninguna URL de la matriz queda huerfana de enlaces entrantes", () => {
  const entrantes = contarEntrantes(MATRIZ_REAL.filas);

  assert.equal([...entrantes.values()].filter((n) => n === 0).length, 0);
  assert.equal(MATRIZ_REAL.resumen.sinEnlacesEntrantes, 0);
  assert.equal(entrantes.size, MATRIZ_REAL.filas.length);
});

// ---------------------------------------------------------------------------
// Guardas y forma de la salida
// ---------------------------------------------------------------------------

test("links: un par fusionable por solape NO se enlaza, se manda a fusionar (D-05)", () => {
  const compartidas = ["a.com", "b.com", "c.com", "d.com"];
  const matriz = construirMatriz({
    mapa: [
      asignacion({ url: "/a", cluster: "cluster-a", clusterFuente: "serp", keywordPrimaria: "hernia discal", keywordPrimariaKey: "hernia discal" }),
      asignacion({ url: "/b", cluster: "cluster-a", clusterFuente: "serp", keywordPrimaria: "hernia de disco", keywordPrimariaKey: "hernia de disco", secundarias: ["hernia de disco lumbar", "hernia de disco cervical", "hernia de disco cirugia"] }),
      asignacion({ url: "/c", cluster: "cluster-b", clusterFuente: "serp", keywordPrimaria: "escoliosis", keywordPrimariaKey: "escoliosis", secundarias: ["escoliosis dorsal", "escoliosis lumbar", "escoliosis cirugia"] }),
    ],
    clusters: CLUSTERS_SINTETICOS,
    oroPorClave: new Map(),
    indice: indiceDe({
      "hernia discal": compartidas,
      "hernia de disco": compartidas,
      escoliosis: ["x.com", "y.com"],
    }),
  });

  const a = matriz.filas.find((f) => f.url === "/a") as (typeof matriz.filas)[number];
  assert.ok(!a.enlaces.some((e) => e.link === "/b"), "un par fusionable no se enlaza");
  assert.ok(matriz.descartadosPorSolape.some((d) => d.desde === "/a" && d.hacia === "/b"));
  assert.equal(matriz.descartadosPorSolape[0]?.compartidas, 4);
});

test("links: las URLs que redirigen quedan fuera de la matriz, con el motivo escrito", () => {
  const fuera = MATRIZ_REAL.fueraDeLaMatriz.map((f) => f.url);

  assert.deepEqual(fuera, [
    "/blog/estenosis-espinal-que-es",
    "/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
  ]);
  assert.equal(MATRIZ_REAL.filas.length, MAPA_REAL.length - fuera.length);
  for (const f of MATRIZ_REAL.fueraDeLaMatriz) assert.ok(f.motivo.length > 60);
  // Y nadie las enlaza: un enlace hacia un 301 es un salto de mas para cada visitante.
  for (const fila of MATRIZ_REAL.filas) {
    for (const e of fila.enlaces) assert.ok(!fuera.includes(e.link));
  }
});

test("links: cada enlace trae motivo en prosa y el titulo de la pagina destino", () => {
  const titulos = new Map(MAPA_REAL.map((a) => [a.url, a.titulo]));

  for (const fila of MATRIZ_REAL.filas) {
    for (const e of fila.enlaces) {
      assert.ok(e.motivo.trim().length > 20, `${fila.url} -> ${e.link} sin motivo`);
      assert.equal(e.titleWithLink, titulos.get(e.link));
    }
  }
});

test("links: la matriz es determinista, dos construcciones dan el mismo JSON", () => {
  const otra = construirMatriz({
    mapa: MAPA_REAL,
    clusters: CLUSTERS_REALES,
    oroPorClave: ORO_REAL,
    indice: indiceDe({}),
  });

  assert.equal(JSON.stringify(otra), JSON.stringify(MATRIZ_REAL));
  assert.equal(documentoLegible(otra), documentoLegible(MATRIZ_REAL));
});

test("links: una URL huerfana detiene la construccion en vez de publicarse", () => {
  const entrada: EntradaDeMatriz = {
    // `/sola` es institucional y enlaza a la raiz; nadie le enlaza a ella.
    mapa: [
      asignacion({ url: "/", tipoDePagina: "home" }),
      asignacion({
        url: "/sola",
        tipoDePagina: "pagina-institucional",
        keywordPrimaria: null,
        keywordPrimariaKey: null,
        esPaginaSeo: false,
        secundarias: [],
        motivoSinPrimaria: "No compite por ninguna keyword y existe como pagina de respaldo del sitio.",
      }),
    ],
    clusters: CLUSTERS_SINTETICOS,
    oroPorClave: new Map(),
    indice: indiceDe({}),
  };

  assert.throws(() => construirMatriz(entrada), (error: unknown) => {
    assert.ok(error instanceof CliError);
    assert.match(error.message, /huerfana/);
    return true;
  });
});

test("links: la seccion de un hub es la suya y no la raiz", () => {
  assert.equal(seccionDe("/"), "/");
  assert.equal(seccionDe("/servicios"), "/servicios");
  assert.equal(seccionDe("/servicios/hernia-discal"), "/servicios");
  assert.equal(sinGeo("ortopedia infantil lima"), "ortopedia infantil");
  assert.equal(tituloCorto("Blog — Salud de columna y traumatología"), "Blog");
});

test("links: el documento legible dice que la matriz se propone y no se implementa", () => {
  const doc = documentoLegible(MATRIZ_REAL);

  assert.match(doc, /Esto se propone y NO se implementa/);
  assert.match(doc, /no escribe en `src\/`/);
  assert.match(doc, /Enlaces entrantes por URL/);
  for (const fila of MATRIZ_REAL.filas) assert.ok(doc.includes(`\`${fila.url}\``));
});
