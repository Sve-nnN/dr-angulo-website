/**
 * Pruebas del perfil de competencia.
 *
 * Sin credenciales, sin red y sin tocar la cache real: cada prueba arma un directorio de cache
 * temporal, mete ahi los cuerpos que quiere probar con la misma ingesta que usa el traspaso, y
 * despues perfila. Es la unica forma de demostrar de verdad que el perfilado no consulta a
 * nadie: si lo hiciera, en este entorno no habria a quien consultar.
 *
 * Hay una prueba nombrada por cada punto del bloque <behavior> de la tarea 2 del plan 13-03.
 */

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { QuotaBook } from "../quota.js";
import { ENDPOINTS, ingerirCuerpo, paramsDeDominio } from "./ahrefs.js";
import { cargarListaFija, comoMarkdown, deducirBlog, perfilar } from "./competitors.js";

const FIXTURE = path.join(SEO_TOOLS_ROOT, "data", "fixtures", "ahrefs-contrato-sintetico.json");
const RUTA_FIJOS = path.join(SEO_TOOLS_ROOT, "data", "competitors-fijos.json");

const contrato = JSON.parse(await readFile(FIXTURE, "utf8")) as Record<string, unknown>;
const lista = await cargarListaFija(RUTA_FIJOS);

const ESPERADOS = [
  "drcarranzacolumna.com",
  "drciezatraumatologia.com",
  "cirujanocolumna-elaos.com",
  "doctormunguia.com",
  "clinicarthromeds.pe",
];

interface Temporal {
  cacheDir: string;
  rutaUso: string;
  /** Mete un cuerpo en la cache temporal, por el mismo camino que usa el traspaso real. */
  ingerir(etiqueta: string, dominio: string, cuerpo: unknown): Promise<void>;
}

async function conCache<T>(fn: (t: Temporal) => Promise<T>): Promise<T> {
  const base = await mkdtemp(path.join(tmpdir(), "competitors-test-"));
  const cacheDir = path.join(base, ".cache");
  const rutaUso = path.join(base, "ahrefs-usage.json");
  try {
    return await fn({
      cacheDir,
      rutaUso,
      async ingerir(etiqueta, dominio, cuerpo) {
        await ingerirCuerpo({
          etiqueta,
          params: paramsDeDominio(etiqueta as never, dominio),
          cuerpoCrudo: JSON.stringify(cuerpo),
          cacheDir,
          plan: "prueba",
          rutaUso,
          ahora: "2026-08-11T10:00:00.000Z",
        });
      },
    });
  } finally {
    await rm(base, { recursive: true, force: true });
  }
}

/** Deja los cuatro endpoints de un dominio en la cache temporal. */
async function perfilCompleto(t: Temporal, dominio: string, topPages: unknown): Promise<void> {
  await t.ingerir(ENDPOINTS.domainRating, dominio, contrato[ENDPOINTS.domainRating]);
  await t.ingerir(ENDPOINTS.backlinksStats, dominio, contrato[ENDPOINTS.backlinksStats]);
  await t.ingerir(ENDPOINTS.metrics, dominio, contrato[ENDPOINTS.metrics]);
  await t.ingerir(ENDPOINTS.topPages, dominio, topPages);
}

// ---------------------------------------------------------------------------
// comportamiento 1: la lista es una decision cerrada, no un parametro
// ---------------------------------------------------------------------------

test("comportamiento 1: los cinco dominios de D-11 mas la linea de base estan fijos en el archivo de datos", () => {
  assert.equal(lista.decision, "D-11");
  assert.deepEqual(
    lista.competidores.map((c) => c.domain),
    ESPERADOS,
  );
  assert.equal(lista.lineaDeBase.domain, "drangulocolumna.com");
});

test("comportamiento 1: el modulo no acepta otros dominios, porque no recibe ninguno", async () => {
  await conCache(async ({ cacheDir }) => {
    const perfilado = await perfilar({ cacheDir });
    assert.deepEqual(
      perfilado.competidores.map((c) => c.domain),
      [...ESPERADOS, "drangulocolumna.com"],
    );
    // Colar un dominio por las opciones no cambia nada: la lista sale del archivo de datos y
    // no del argumento. Se pasa por `as never` porque el tipo ya lo prohibe; la prueba mide el
    // comportamiento en ejecucion, que es lo que sobrevive a un refactor.
    const forzado = await perfilar({ cacheDir, domains: ["dominio-colado.test"] } as never);
    assert.equal(forzado.competidores.length, 6);
    assert.ok(
      !forzado.competidores.some((c) => c.domain === "dominio-colado.test"),
      "la lista de dominios es una decision cerrada, no un parametro de la corrida",
    );
  });
});

test("comportamiento 1: la linea de base propia esta marcada y no se cuenta como competidor", async () => {
  await conCache(async ({ cacheDir }) => {
    const perfilado = await perfilar({ cacheDir });
    const base = perfilado.competidores.filter((c) => c.esLineaDeBase);
    assert.equal(base.length, 1);
    assert.equal(base[0]?.domain, "drangulocolumna.com");
  });
});

test("comportamiento 1: un dominio declarado dos veces aborta la carga", async () => {
  await conCache(async ({ cacheDir }) => {
    const base = await mkdtemp(path.join(tmpdir(), "fijos-"));
    const ruta = path.join(base, "fijos.json");
    await writeFile(
      ruta,
      JSON.stringify({
        lineaDeBase: { domain: "a.test", name: "A", quien: "q", origen: "o" },
        competidores: [
          { domain: "b.test", name: "B", quien: "q", origen: "o" },
          { domain: "b.test", name: "B otra vez", quien: "q", origen: "o" },
        ],
      }),
      "utf8",
    );
    await assert.rejects(
      perfilar({ cacheDir, rutaFijos: ruta }),
      (error: unknown) => error instanceof CliError && /dos veces/.test((error as Error).message),
    );
    await rm(base, { recursive: true, force: true });
  });
});

// ---------------------------------------------------------------------------
// comportamiento 2: lo que la fuente no devolvio queda declarado, nunca en cero
// ---------------------------------------------------------------------------

test("comportamiento 2: una metrica que la fuente no devolvio NO se convierte en cero", async () => {
  await conCache(async ({ cacheDir }) => {
    // Cache vacia: ninguna consulta ingerida todavia.
    const perfilado = await perfilar({ cacheDir });
    for (const c of perfilado.competidores) {
      for (const campo of ["domainRating", "referringDomains", "organicTraffic", "organicKeywords"] as const) {
        assert.equal(c[campo], null, `${c.domain}.${campo} tendria que ser null y no cero`);
        assert.notEqual(c[campo], 0);
        assert.equal(c[`${campo}Fuente`], "no_consultado");
      }
      assert.equal(c.blog, null);
      assert.equal(c.blogFuente, "no_consultado");
    }
  });
});

test("comportamiento 2: una consulta en cache a la que le falta el campo se declara ahrefs_sin_dato", async () => {
  await conCache(async (t) => {
    await t.ingerir(ENDPOINTS.domainRating, ESPERADOS[0] as string, contrato["_camposParciales"]);
    const perfilado = await perfilar({ cacheDir: t.cacheDir });
    const c = perfilado.competidores.find((x) => x.domain === ESPERADOS[0]);
    assert.equal(c?.ahrefsRank, 4820371);
    assert.equal(c?.ahrefsRankFuente, "ahrefs");
    assert.equal(c?.domainRating, null);
    assert.equal(
      c?.domainRatingFuente,
      "ahrefs_sin_dato",
      "la consulta esta, el campo no: es distinto de no haber consultado",
    );
  });
});

test("comportamiento 2: un cero que la fuente SI devolvio queda como cero, con procedencia ahrefs", async () => {
  await conCache(async (t) => {
    await t.ingerir(ENDPOINTS.domainRating, ESPERADOS[0] as string, {
      domain_rating: { domain_rating: 0, ahrefs_rank: 0 },
    });
    const perfilado = await perfilar({ cacheDir: t.cacheDir });
    const c = perfilado.competidores.find((x) => x.domain === ESPERADOS[0]);
    assert.equal(c?.domainRating, 0);
    assert.equal(c?.domainRatingFuente, "ahrefs", "un cero solo vale si la fuente lo respalda");
  });
});

// ---------------------------------------------------------------------------
// comportamiento 3: la presencia de blog se deduce, y la ausencia de evidencia no niega
// ---------------------------------------------------------------------------

test("comportamiento 3: la presencia de blog se deduce de las paginas mas enlazadas", async () => {
  await conCache(async (t) => {
    await perfilCompleto(t, ESPERADOS[0] as string, contrato[ENDPOINTS.topPages]);
    const perfilado = await perfilar({ cacheDir: t.cacheDir });
    const c = perfilado.competidores.find((x) => x.domain === ESPERADOS[0]);
    assert.equal(c?.blog, true);
    assert.equal(c?.blogFuente, "ahrefs");
    assert.equal(c?.blogEvidencia, "https://ejemplo-sintetico.test/blog/hernia-sintetica");
  });
});

test("comportamiento 3: sin evidencia de blog la respuesta es que NO SE SABE, no que no tiene", async () => {
  await conCache(async (t) => {
    await perfilCompleto(t, ESPERADOS[1] as string, contrato["_sinBlog"]);
    const perfilado = await perfilar({ cacheDir: t.cacheDir });
    const c = perfilado.competidores.find((x) => x.domain === ESPERADOS[1]);
    assert.equal(c?.blog, null, "el top por enlaces es una muestra de diez paginas, no un mapa del sitio");
    assert.notEqual(c?.blog, false);
    assert.equal(c?.blogFuente, "sin_evidencia");
    assert.equal(c?.blogEvidencia, null);
  });
});

test("comportamiento 3: deducirBlog distingue las tres respuestas posibles", () => {
  const conBlog = [{ url: "https://x.test/blog/uno", titulo: null, referringDomains: 1, traficoEstimado: null, keywords: null }];
  const sinBlog = [{ url: "https://x.test/contacto", titulo: null, referringDomains: 1, traficoEstimado: null, keywords: null }];

  assert.equal(deducirBlog(conBlog, lista.rutasDeBlog, true).blog, true);
  assert.equal(deducirBlog(sinBlog, lista.rutasDeBlog, true).blog, null);
  assert.equal(deducirBlog(sinBlog, lista.rutasDeBlog, true).fuente, "sin_evidencia");
  assert.equal(deducirBlog([], lista.rutasDeBlog, false).fuente, "no_consultado");
});

test("comportamiento 3: una ruta de blog anidada tambien cuenta como evidencia", () => {
  const anidada = [
    { url: "https://x.test/es/blog/hernia", titulo: null, referringDomains: 1, traficoEstimado: null, keywords: null },
  ];
  assert.equal(deducirBlog(anidada, lista.rutasDeBlog, true).blog, true);
});

// ---------------------------------------------------------------------------
// comportamiento 4: las paginas salen ordenadas y con sus dominios de referencia
// ---------------------------------------------------------------------------

test("comportamiento 4: las paginas mas enlazadas salen de mayor a menor con su cantidad de dominios", async () => {
  await conCache(async (t) => {
    await perfilCompleto(t, ESPERADOS[0] as string, contrato[ENDPOINTS.topPages]);
    const perfilado = await perfilar({ cacheDir: t.cacheDir });
    const c = perfilado.competidores.find((x) => x.domain === ESPERADOS[0]);
    assert.deepEqual(
      c?.paginasMasEnlazadas.map((p) => p.referringDomains),
      [31, 17, 4],
    );
    for (const p of c?.paginasMasEnlazadas ?? []) {
      assert.equal(typeof p.url, "string");
      assert.ok("referringDomains" in p);
    }
  });
});

test("comportamiento 4: cada competidor trae siempre el arreglo de paginas, aunque este vacio", async () => {
  await conCache(async ({ cacheDir }) => {
    const perfilado = await perfilar({ cacheDir });
    for (const c of perfilado.competidores) {
      assert.ok(Array.isArray(c.paginasMasEnlazadas), `${c.domain} sin arreglo de paginas`);
    }
  });
});

// ---------------------------------------------------------------------------
// comportamiento 5: dos corridas dan el mismo archivo y cero consultas nuevas
// ---------------------------------------------------------------------------

test("comportamiento 5: dos perfilados sobre la misma cache producen el mismo objeto", async () => {
  await conCache(async (t) => {
    await perfilCompleto(t, ESPERADOS[0] as string, contrato[ENDPOINTS.topPages]);
    const primero = JSON.stringify(await perfilar({ cacheDir: t.cacheDir }), null, 2);
    const segundo = JSON.stringify(await perfilar({ cacheDir: t.cacheDir }), null, 2);
    assert.equal(primero, segundo);
  });
});

test("comportamiento 5: perfilar NO incrementa el contador de cuota de Ahrefs", async () => {
  await conCache(async (t) => {
    await perfilCompleto(t, ESPERADOS[0] as string, contrato[ENDPOINTS.topPages]);
    const antes = (await QuotaBook.open(t.cacheDir)).total("ahrefs");

    await perfilar({ cacheDir: t.cacheDir });
    await perfilar({ cacheDir: t.cacheDir });

    const despues = (await QuotaBook.open(t.cacheDir)).total("ahrefs");
    assert.equal(antes, 4, "los cuatro endpoints del dominio se ingirieron una vez cada uno");
    assert.equal(despues, antes, "reconstruir el perfil lee SOLO de la cache: cuesta cero unidades");
  });
});

test("comportamiento 5: ningun valor del perfil sale del reloj", async () => {
  await conCache(async (t) => {
    await perfilCompleto(t, ESPERADOS[0] as string, contrato[ENDPOINTS.topPages]);
    const perfilado = await perfilar({ cacheDir: t.cacheDir });
    const c = perfilado.competidores.find((x) => x.domain === ESPERADOS[0]);
    // La marca de tiempo es la del envelope, es decir la de la captura real.
    assert.equal(c?.procedencia[ENDPOINTS.domainRating]?.capturadaEn, "2026-08-11T10:00:00.000Z");
    assert.ok(!JSON.stringify(perfilado).includes(new Date().getFullYear() === 2026 ? "generadoEl" : "generadoEl"));
  });
});

// ---------------------------------------------------------------------------
// Procedencia y entregable
// ---------------------------------------------------------------------------

test("cada perfil registra la clave de cache y el estado de sus cuatro consultas", async () => {
  await conCache(async (t) => {
    await t.ingerir(ENDPOINTS.metrics, ESPERADOS[0] as string, contrato[ENDPOINTS.metrics]);
    const perfilado = await perfilar({ cacheDir: t.cacheDir });
    const c = perfilado.competidores.find((x) => x.domain === ESPERADOS[0]);

    assert.equal(Object.keys(c?.procedencia ?? {}).length, 4);
    assert.match(c?.procedencia[ENDPOINTS.metrics]?.clave ?? "", /^[0-9a-f]{64}$/);
    assert.equal(c?.procedencia[ENDPOINTS.metrics]?.estado, "en-cache");
    assert.equal(c?.procedencia[ENDPOINTS.topPages]?.estado, "no-consultado");
  });
});

test("las consultas que faltan quedan listadas con su clave, para poder ingerirlas", async () => {
  await conCache(async ({ cacheDir }) => {
    const perfilado = await perfilar({ cacheDir });
    assert.equal(perfilado.consultasPendientes.length, 24, "seis dominios por cuatro endpoints");
    for (const p of perfilado.consultasPendientes) assert.match(p.clave, /^[0-9a-f]{64}$/);
  });
});

test("el entregable declara en cursiva lo que no se midio y nunca lo imprime como cero", async () => {
  await conCache(async ({ cacheDir }) => {
    const md = comoMarkdown(await perfilar({ cacheDir }));
    assert.match(md, /_no_consultado_/);
    assert.match(md, /Estado: incompleto/);
    for (const dominio of [...ESPERADOS, "drangulocolumna.com"]) {
      assert.ok(md.includes(dominio), `el entregable no nombra ${dominio}`);
    }
    assert.match(md, /Dr\. Gunter Munguia \| 4\.8 \| 24/, "las resenas del pack local son insumo de GBP-03");
  });
});

test("el entregable es determinista: dos generaciones dan el mismo texto", async () => {
  await conCache(async (t) => {
    await perfilCompleto(t, ESPERADOS[0] as string, contrato[ENDPOINTS.topPages]);
    const perfilado = await perfilar({ cacheDir: t.cacheDir });
    assert.equal(comoMarkdown(perfilado), comoMarkdown(perfilado));
    assert.equal(comoMarkdown(await perfilar({ cacheDir: t.cacheDir })), comoMarkdown(perfilado));
  });
});
