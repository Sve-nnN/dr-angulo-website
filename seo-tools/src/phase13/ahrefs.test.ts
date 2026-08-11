/**
 * Pruebas del camino instrumentado hacia Ahrefs.
 *
 * Corren SIN NINGUNA CREDENCIAL y sin red, contra un directorio de cache temporal y contra la
 * fixture sintetica del contrato. No pueden correr de otra forma: Ahrefs no tiene clave en el
 * entorno de este proyecto y su unico camino de acceso es el servidor MCP, que vive en la
 * sesion del agente y no en el proceso de Node. Esa es exactamente la razon por la que existe
 * el par plan/ingesta que estas pruebas ejercitan.
 *
 * Hay una prueba nombrada por cada punto del bloque <behavior> de la tarea 1 del plan 13-03.
 */

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { cacheKey, readEnvelope } from "../cache.js";
import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { QuotaBook } from "../quota.js";
import {
  buscarCredenciales,
  claveDeConsulta,
  contarPorEndpoint,
  descriptor,
  ENDPOINTS,
  esVacia,
  FUENTE,
  ingerirCuerpo,
  leerConsulta,
  leerLibroDeUso,
  normalizarDominio,
  paramsDeDominio,
  parsearBacklinksStats,
  parsearDomainRating,
  parsearMetrics,
  parsearTopPages,
  planDeDominios,
  registrarCorrida,
  unidadesEstimadas,
} from "./ahrefs.js";

// Se resuelve contra SEO_TOOLS_ROOT y no contra `import.meta.url` a pelo: la ruta de este
// repositorio lleva un espacio, y `new URL(...).pathname` lo devuelve percent-encoded como
// %20, que despues no existe en disco.
const FIXTURE = path.join(SEO_TOOLS_ROOT, "data", "fixtures", "ahrefs-contrato-sintetico.json");

const contrato = JSON.parse(await readFile(FIXTURE, "utf8")) as Record<string, unknown>;
const DOMINIO = "ejemplo-sintetico.test";

function cuerpo(clave: string): unknown {
  const valor = contrato[clave];
  assert.notEqual(valor, undefined, `la fixture sintetica no trae "${clave}"`);
  return valor;
}

async function conCache<T>(fn: (dirs: { cacheDir: string; rutaUso: string }) => Promise<T>): Promise<T> {
  const base = await mkdtemp(path.join(tmpdir(), "ahrefs-test-"));
  try {
    return await fn({ cacheDir: path.join(base, ".cache"), rutaUso: path.join(base, "ahrefs-usage.json") });
  } finally {
    await rm(base, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// La fixture sintetica no puede confundirse con una medicion
// ---------------------------------------------------------------------------

test("la fixture del contrato se declara sintetica y apunta a un dominio reservado", () => {
  assert.match(String(contrato["_ADVERTENCIA"]), /FIXTURE SINTETICA/);
  const pages = (cuerpo(ENDPOINTS.topPages) as { pages: { url: string }[] }).pages;
  for (const p of pages) assert.match(p.url, /ejemplo-sintetico\.test/);
});

test("la fixture del contrato no trae nada con forma de credencial", async () => {
  const crudo = await readFile(FIXTURE, "utf8");
  assert.deepEqual(buscarCredenciales(crudo), []);
});

// ---------------------------------------------------------------------------
// comportamiento 1: el plan emite etiqueta, parametros y clave, y nunca la inventa
// ---------------------------------------------------------------------------

test("comportamiento 1: el plan emite una clave de 64 caracteres hexadecimales por consulta", async () => {
  await conCache(async ({ cacheDir }) => {
    const consultas = await planDeDominios([DOMINIO], { cacheDir });
    assert.equal(consultas.length, 4, "cuatro endpoints por dominio: DR, refdomains, metricas y paginas");
    for (const c of consultas) {
      assert.match(c.clave, /^[0-9a-f]{64}$/);
      assert.ok(c.etiqueta.length > 0);
      assert.ok(Object.keys(c.params).length > 0);
      assert.equal(c.yaEnCache, false);
    }
  });
});

test("comportamiento 1: la clave del plan NO se inventa, sale de la misma funcion que el resto del proyecto", async () => {
  await conCache(async ({ cacheDir }) => {
    const [primera] = await planDeDominios([DOMINIO], {
      cacheDir,
      endpoints: [ENDPOINTS.domainRating],
    });
    assert.ok(primera !== undefined);
    // La igualdad con `cacheKey` de src/cache.ts es el contrato: si el proyecto cambiara su
    // funcion de clave, esta prueba lo detiene antes de que la cache se parta en dos.
    assert.equal(primera.clave, cacheKey(FUENTE, ENDPOINTS.domainRating, primera.params));
    assert.equal(primera.clave, claveDeConsulta(ENDPOINTS.domainRating, primera.params));
  });
});

test("comportamiento 1: el plan marca como en cache lo que ya se ingirio, para no volver a pedirlo", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.domainRating, DOMINIO);
    await ingerirCuerpo({
      etiqueta: ENDPOINTS.domainRating,
      params,
      cuerpoCrudo: JSON.stringify(cuerpo(ENDPOINTS.domainRating)),
      cacheDir,
      plan: "13-03",
      rutaUso,
      ahora: "2026-08-11T10:00:00.000Z",
    });

    const [consulta] = await planDeDominios([DOMINIO], {
      cacheDir,
      endpoints: [ENDPOINTS.domainRating],
    });
    assert.equal(consulta?.yaEnCache, true);
  });
});

test("comportamiento 1: la clave no cambia porque el dominio venga con protocolo, www o barra final", () => {
  const canonica = claveDeConsulta(ENDPOINTS.metrics, paramsDeDominio(ENDPOINTS.metrics, DOMINIO));
  for (const variante of [`https://${DOMINIO}`, `www.${DOMINIO}`, `https://www.${DOMINIO}/`, `  ${DOMINIO.toUpperCase()} `]) {
    assert.equal(
      claveDeConsulta(ENDPOINTS.metrics, paramsDeDominio(ENDPOINTS.metrics, variante)),
      canonica,
      `la variante ${JSON.stringify(variante)} tendria que caer en la misma clave`,
    );
  }
});

// ---------------------------------------------------------------------------
// comportamiento 2: la ingesta escribe el envelope y cuenta la cuota antes de devolver
// ---------------------------------------------------------------------------

test("comportamiento 2: la ingesta escribe el envelope bajo la fuente ahrefs y registra la cuota", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.domainRating, DOMINIO);
    const resultado = await ingerirCuerpo({
      etiqueta: ENDPOINTS.domainRating,
      params,
      cuerpoCrudo: JSON.stringify(cuerpo(ENDPOINTS.domainRating)),
      cacheDir,
      plan: "13-03",
      rutaUso,
      ahora: "2026-08-11T10:00:00.000Z",
    });

    assert.equal(resultado.cuotaRegistrada, true);
    assert.equal(resultado.outcome, "ok");

    const envelope = await readEnvelope(cacheDir, FUENTE, resultado.clave);
    assert.ok(envelope !== null);
    assert.equal(envelope.source, "ahrefs");
    assert.equal(envelope.endpoint, ENDPOINTS.domainRating);
    assert.equal(envelope.fetchedAt, "2026-08-11T10:00:00.000Z");
    assert.deepEqual(envelope.request, params);

    // El libro de cuota queda persistido ANTES de devolver: una interrupcion no puede dejar
    // consumo sin contar, que es lo que subestimaria el presupuesto.
    const libro = await QuotaBook.open(cacheDir);
    assert.equal(libro.total("ahrefs"), 1);
  });
});

test("comportamiento 2: leerConsulta encuentra lo ingerido usando solo endpoint y parametros", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.topPages, DOMINIO);
    await ingerirCuerpo({
      etiqueta: ENDPOINTS.topPages,
      params,
      cuerpoCrudo: JSON.stringify(cuerpo(ENDPOINTS.topPages)),
      cacheDir,
      plan: "13-03",
      rutaUso,
      ahora: "2026-08-11T10:00:00.000Z",
    });

    const envelope = await leerConsulta(ENDPOINTS.topPages, params, { cacheDir });
    assert.ok(envelope !== null);
    assert.equal(parsearTopPages(envelope.response).length, 3);
  });
});

test("comportamiento 2: una consulta que no se ingirio devuelve null en vez de fallar", async () => {
  await conCache(async ({ cacheDir }) => {
    const params = paramsDeDominio(ENDPOINTS.metrics, "nunca-consultado.test");
    assert.equal(await leerConsulta(ENDPOINTS.metrics, params, { cacheDir }), null);
  });
});

// ---------------------------------------------------------------------------
// comportamiento 3: reingerir el mismo cuerpo no reescribe ni vuelve a contar
// ---------------------------------------------------------------------------

test("comportamiento 3: reingerir el mismo cuerpo produce el mismo archivo byte a byte", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.metrics, DOMINIO);
    const crudo = JSON.stringify(cuerpo(ENDPOINTS.metrics));

    const primera = await ingerirCuerpo({
      etiqueta: ENDPOINTS.metrics,
      params,
      cuerpoCrudo: crudo,
      cacheDir,
      plan: "13-03",
      rutaUso,
      ahora: "2026-08-11T10:00:00.000Z",
    });
    const antes = await readFile(primera.archivo, "utf8");

    // El reloj avanza a proposito: si la ingesta reescribiera, `fetchedAt` cambiaria y el
    // archivo dejaria de ser identico. La marca de tiempo tiene que ser la de la captura real.
    const segunda = await ingerirCuerpo({
      etiqueta: ENDPOINTS.metrics,
      params,
      cuerpoCrudo: crudo,
      cacheDir,
      plan: "13-03",
      rutaUso,
      ahora: "2026-09-30T23:59:59.000Z",
    });
    const despues = await readFile(segunda.archivo, "utf8");

    assert.equal(segunda.yaEstaba, true);
    assert.equal(antes, despues);
  });
});

test("comportamiento 3: reingerir el mismo cuerpo NO incrementa el contador de cuota", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.backlinksStats, DOMINIO);
    const crudo = JSON.stringify(cuerpo(ENDPOINTS.backlinksStats));
    const comun = { etiqueta: ENDPOINTS.backlinksStats, params, cuerpoCrudo: crudo, cacheDir, plan: "13-03", rutaUso };

    await ingerirCuerpo({ ...comun, ahora: "2026-08-11T10:00:00.000Z" });
    const antes = (await QuotaBook.open(cacheDir)).total("ahrefs");

    const segunda = await ingerirCuerpo({ ...comun, ahora: "2026-08-11T11:00:00.000Z" });
    const despues = (await QuotaBook.open(cacheDir)).total("ahrefs");

    assert.equal(segunda.cuotaRegistrada, false);
    assert.equal(antes, 1);
    assert.equal(despues, 1);
  });
});

test("comportamiento 3: reingerir el mismo cuerpo tampoco infla el libro de unidades", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.backlinksStats, DOMINIO);
    const comun = {
      etiqueta: ENDPOINTS.backlinksStats,
      params,
      cuerpoCrudo: JSON.stringify(cuerpo(ENDPOINTS.backlinksStats)),
      cacheDir,
      plan: "13-03",
      rutaUso,
    };

    await ingerirCuerpo({ ...comun, ahora: "2026-08-11T10:00:00.000Z" });
    await ingerirCuerpo({ ...comun, ahora: "2026-08-11T11:00:00.000Z" });

    const libro = await leerLibroDeUso(rutaUso);
    assert.equal(libro.consultas, 1);
    assert.equal(libro.unidadesEstimadas, unidadesEstimadas(ENDPOINTS.backlinksStats));
  });
});

// ---------------------------------------------------------------------------
// comportamiento 4: un cuerpo invalido aborta sin escribir nada
// ---------------------------------------------------------------------------

test("comportamiento 4: un cuerpo que no es JSON valido aborta sin escribir nada", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.domainRating, DOMINIO);
    await assert.rejects(
      ingerirCuerpo({
        etiqueta: ENDPOINTS.domainRating,
        params,
        cuerpoCrudo: "esto no es json, es lo que copia y pega una persona apurada",
        cacheDir,
        plan: "13-03",
        rutaUso,
      }),
      (error: unknown) => error instanceof CliError && /no es JSON valido/.test((error as Error).message),
    );

    assert.equal(await leerConsulta(ENDPOINTS.domainRating, params, { cacheDir }), null);
    assert.equal((await QuotaBook.open(cacheDir)).total("ahrefs"), 0);
  });
});

test("comportamiento 4: un cuerpo con algo con forma de credencial aborta sin escribir nada", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.domainRating, DOMINIO);
    await assert.rejects(
      ingerirCuerpo({
        etiqueta: ENDPOINTS.domainRating,
        params,
        cuerpoCrudo: JSON.stringify({ domain_rating: { domain_rating: 12.5 }, api_key: "no-deberia-estar-aca" }),
        cacheDir,
        plan: "13-03",
        rutaUso,
      }),
      (error: unknown) => error instanceof CliError && /forma de credencial/.test((error as Error).message),
    );

    assert.equal(await leerConsulta(ENDPOINTS.domainRating, params, { cacheDir }), null);
    assert.equal((await QuotaBook.open(cacheDir)).total("ahrefs"), 0);
  });
});

test("comportamiento 4: una etiqueta de endpoint desconocida aborta nombrando las declaradas", () => {
  assert.throws(
    () => claveDeConsulta("site-explorer/lo-que-se-me-ocurrio", { target: DOMINIO }),
    (error: unknown) => error instanceof CliError && /Etiqueta de endpoint desconocida/.test((error as Error).message),
  );
});

// ---------------------------------------------------------------------------
// comportamiento 5: una respuesta vacia se persiste igual, con su resultado declarado
// ---------------------------------------------------------------------------

test("comportamiento 5: una respuesta vacia se persiste con outcome empty, que no es lo mismo que cero", async () => {
  await conCache(async ({ cacheDir, rutaUso }) => {
    const params = paramsDeDominio(ENDPOINTS.topPages, "sin-datos.test");
    const resultado = await ingerirCuerpo({
      etiqueta: ENDPOINTS.topPages,
      params,
      cuerpoCrudo: JSON.stringify(cuerpo("_vacia")),
      cacheDir,
      plan: "13-03",
      rutaUso,
      ahora: "2026-08-11T10:00:00.000Z",
    });

    assert.equal(resultado.outcome, "empty");
    const envelope = await leerConsulta(ENDPOINTS.topPages, params, { cacheDir });
    assert.ok(envelope !== null, "vacio SE persiste: volver a preguntarlo costaria otras 50 unidades para llegar al mismo lugar");
    assert.equal(envelope.outcome, "empty");
    // Y sigue contando cuota: la fuente atendio la peticion.
    assert.equal((await QuotaBook.open(cacheDir)).total("ahrefs"), 1);
  });
});

test("comportamiento 5: esVacia distingue el envoltorio ausente del envoltorio vacio", () => {
  assert.equal(esVacia(ENDPOINTS.topPages, { pages: [] }), true);
  assert.equal(esVacia(ENDPOINTS.topPages, {}), true);
  assert.equal(esVacia(ENDPOINTS.topPages, cuerpo(ENDPOINTS.topPages)), false);
  assert.equal(esVacia(ENDPOINTS.domainRating, { domain_rating: {} }), true);
  assert.equal(esVacia(ENDPOINTS.domainRating, cuerpo(ENDPOINTS.domainRating)), false);
});

// ---------------------------------------------------------------------------
// comportamiento 6: los parsers leen POR NOMBRE y nunca por posicion
// ---------------------------------------------------------------------------

test("comportamiento 6: el parser lee por nombre de campo, asi que reordenar las claves no cambia nada", () => {
  const original = cuerpo(ENDPOINTS.metrics) as { metrics: Record<string, unknown> };
  const alReves: Record<string, unknown> = {};
  for (const clave of Object.keys(original.metrics).reverse()) alReves[clave] = original.metrics[clave];

  assert.deepEqual(parsearMetrics(original), parsearMetrics({ metrics: alReves }));
  assert.deepEqual(parsearMetrics(original), { organicTraffic: 540, organicKeywords: 318, organicKeywordsTop3: 12 });
});

test("comportamiento 6: el DR y el rank salen del envoltorio domain_rating por nombre", () => {
  assert.deepEqual(parsearDomainRating(cuerpo(ENDPOINTS.domainRating)), {
    domainRating: 12.5,
    ahrefsRank: 4820371,
  });
});

test("comportamiento 6: referring domains toma el conteo VIVO y no el historico", () => {
  const leido = parsearBacklinksStats(cuerpo(ENDPOINTS.backlinksStats));
  assert.equal(leido.referringDomains, 43, "live_refdomains describe el perfil de hoy");
  assert.equal(leido.referringDomainsHistoricos, 77, "all_time_refdomains sobreestimaria la distancia real");
});

test("comportamiento 6: un campo que la fuente no devolvio queda en null y NUNCA en cero", () => {
  const parcial = parsearDomainRating(cuerpo("_camposParciales"));
  assert.equal(parcial.ahrefsRank, 4820371);
  assert.equal(parcial.domainRating, null);
  assert.notEqual(parcial.domainRating, 0);

  const roto = parsearDomainRating(cuerpo("_contratoRoto"));
  assert.deepEqual(roto, { domainRating: null, ahrefsRank: null });

  const sinMetricas = parsearMetrics({});
  assert.deepEqual(sinMetricas, { organicTraffic: null, organicKeywords: null, organicKeywordsTop3: null });
});

test("comportamiento 6: un cero que la fuente SI devolvio se conserva como cero", () => {
  const leido = parsearMetrics({ metrics: { org_traffic: 0, org_keywords: 0, org_keywords_1_3: 0 } });
  assert.deepEqual(leido, { organicTraffic: 0, organicKeywords: 0, organicKeywordsTop3: 0 });
});

test("comportamiento 6: las paginas salen de mayor a menor por dominios de referencia", () => {
  const paginas = parsearTopPages(cuerpo(ENDPOINTS.topPages));
  assert.deepEqual(
    paginas.map((p) => p.referringDomains),
    [31, 17, 4],
  );
  assert.equal(paginas[0]?.url, "https://ejemplo-sintetico.test/");
  assert.equal(paginas[0]?.titulo, "consultorio sintetico de prueba");
});

test("comportamiento 6: el orden lo impone el parser y no el proveedor", () => {
  const original = cuerpo(ENDPOINTS.topPages) as { pages: unknown[] };
  const barajado = { pages: [...original.pages].reverse() };
  assert.deepEqual(parsearTopPages(original), parsearTopPages(barajado));
});

test("comportamiento 6: una fila sin URL se descarta en vez de producir una pagina fantasma", () => {
  const paginas = parsearTopPages({ pages: [{ referring_domains: 99 }, { url: "https://x.test/", referring_domains: 1 }] });
  assert.equal(paginas.length, 1);
  assert.equal(paginas[0]?.url, "https://x.test/");
});

// ---------------------------------------------------------------------------
// El libro de unidades: arreglo que acumula, nunca objeto que se pisa
// ---------------------------------------------------------------------------

test("el libro de unidades guarda `corridas` como ARREGLO y cada plan agrega la suya", async () => {
  await conCache(async ({ rutaUso }) => {
    await registrarCorrida(
      {
        plan: "13-03",
        estado: "ingerido",
        fecha: "2026-08-11",
        consultasPorEndpoint: { [ENDPOINTS.domainRating]: 6, [ENDPOINTS.topPages]: 6 },
      },
      rutaUso,
    );
    await registrarCorrida(
      {
        plan: "13-04",
        estado: "ingerido",
        fecha: "2026-08-12",
        consultasPorEndpoint: { [ENDPOINTS.keywordsOverview]: 90 },
      },
      rutaUso,
    );

    const libro = await leerLibroDeUso(rutaUso);
    assert.ok(Array.isArray(libro.corridas), "es contrato con el verify del plan 13-04");
    assert.equal(libro.corridas.length, 2);
    assert.deepEqual(
      libro.corridas.map((c) => c.plan),
      ["13-03", "13-04"],
    );
    assert.equal(libro.consultas, 102);
    assert.equal(typeof libro.unidadesEstimadas, "number");
  });
});

test("volver a correr el planificador no borra el consumo ya ingerido de ese plan", async () => {
  await conCache(async ({ rutaUso }) => {
    await registrarCorrida(
      { plan: "13-03", estado: "ingerido", fecha: "2026-08-11", consultasPorEndpoint: { [ENDPOINTS.metrics]: 6 } },
      rutaUso,
    );
    await registrarCorrida(
      { plan: "13-03", estado: "planificado", fecha: "2026-08-12", consultasPorEndpoint: {} },
      rutaUso,
    );

    const libro = await leerLibroDeUso(rutaUso);
    assert.equal(libro.corridas[0]?.estado, "ingerido");
    assert.equal(libro.consultas, 6);
  });
});

test("un libro sin el arreglo `corridas` aborta en vez de pisar el consumo acumulado", async () => {
  await conCache(async ({ rutaUso }) => {
    await writeFile(rutaUso, JSON.stringify({ schema: 1, unidadesEstimadas: 1800 }), "utf8");
    await assert.rejects(
      leerLibroDeUso(rutaUso),
      (error: unknown) => error instanceof CliError && /corridas/.test((error as Error).message),
    );
  });
});

test("la estimacion de unidades aplica max(costeBase, costePorFila * filas)", () => {
  // Un endpoint de resumen devuelve una fila, asi que siempre cae en el minimo facturable.
  assert.equal(unidadesEstimadas(ENDPOINTS.domainRating), 50);
  const d = descriptor(ENDPOINTS.topPages);
  assert.equal(unidadesEstimadas(ENDPOINTS.topPages), Math.max(d.costeBase, d.costePorFila * d.filasEsperadas));
  assert.equal(unidadesEstimadas(ENDPOINTS.topPages, 1), 50);
});

test("contarPorEndpoint agrupa el plan por etiqueta, que es la forma que consume el libro", async () => {
  await conCache(async ({ cacheDir }) => {
    const consultas = await planDeDominios([DOMINIO, "otro.test"], { cacheDir });
    assert.deepEqual(contarPorEndpoint(consultas), {
      [ENDPOINTS.domainRating]: 2,
      [ENDPOINTS.backlinksStats]: 2,
      [ENDPOINTS.metrics]: 2,
      [ENDPOINTS.topPages]: 2,
    });
  });
});

test("normalizarDominio deja el dominio en la forma que viaja en la clave", () => {
  assert.equal(normalizarDominio("HTTPS://WWW.Ejemplo.TEST/"), "ejemplo.test");
  assert.equal(normalizarDominio("  clinicarthromeds.pe  "), "clinicarthromeds.pe");
});
