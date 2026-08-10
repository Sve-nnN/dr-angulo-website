/**
 * Pruebas del seam de cache. No tocan la red ni necesitan ninguna credencial: la llamada de
 * red se sustituye por una doble que devuelve el codigo y el cuerpo que cada caso necesita, y
 * los archivos se escriben en un directorio temporal, nunca en la cache real.
 *
 * Hay una prueba por cada fila de la tabla de persistencia del Pattern 2, porque esa tabla es
 * lo unico que separa una cache util de una envenenada.
 */

import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import {
  cacheKey,
  fetchThroughCache,
  readEnvelope,
  CachedRequestError,
  type NetworkResult,
} from "./cache.js";
import { CliError } from "./config.js";

const temps: string[] = [];

async function tempCache(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "seo-tools-cache-"));
  temps.push(dir);
  return dir;
}

after(async () => {
  await Promise.all(temps.map((d) => rm(d, { recursive: true, force: true })));
});

/** Doble de red: devuelve lo que le digan y cuenta cuantas veces la llamaron. */
function stubNetwork(result: NetworkResult | (() => never)) {
  let calls = 0;
  const call = async (): Promise<NetworkResult> => {
    calls += 1;
    if (typeof result === "function") result();
    return result as NetworkResult;
  };
  return { call, calls: () => calls };
}

const base = (cacheDir: string) => ({
  cacheDir,
  source: "serpapi",
  endpoint: "/search",
  params: { keyword: "hernia discal", country: "pe" },
});

async function countFiles(cacheDir: string, source: string): Promise<number> {
  try {
    return (await readdir(path.join(cacheDir, source))).length;
  } catch {
    return 0;
  }
}

test("la clave es estable frente al orden de las entradas del objeto de parametros", () => {
  const a = cacheKey("serpapi", "/search", { keyword: "hernia", country: "pe", language: "es" });
  const b = cacheKey("serpapi", "/search", { language: "es", country: "pe", keyword: "hernia" });
  assert.equal(a, b);
});

test("la clave normaliza la keyword y pasa pais e idioma a minusculas antes de hashear", () => {
  const a = cacheKey("serpapi", "/search", { keyword: "Hernia  Discál", country: "PE", language: "ES" });
  const b = cacheKey("serpapi", "/search", { keyword: "hernia discal", country: "pe", language: "es" });
  assert.equal(a, b);
});

test("claves distintas para consultas distintas", () => {
  const a = cacheKey("serpapi", "/search", { keyword: "hernia discal" });
  const b = cacheKey("serpapi", "/search", { keyword: "escoliosis" });
  assert.notEqual(a, b);
});

// --- Tabla de persistencia del Pattern 2, fila por fila ---

test("Pattern 2 fila 1: 200 con datos se persiste y en la siguiente lectura cuenta como acierto", async () => {
  const dir = await tempCache();
  const net = stubNetwork({ httpStatus: 200, body: { results: [{ pos: 1 }] } });

  const first = await fetchThroughCache(base(dir), net.call);
  assert.equal(first.outcome, "ok");
  assert.equal(await countFiles(dir, "serpapi"), 1);

  const stats = { hits: 0, misses: 0 };
  const second = await fetchThroughCache({ ...base(dir), stats }, net.call);
  assert.equal(second.outcome, "ok");
  assert.equal(net.calls(), 1, "la segunda no debe salir a la red");
  assert.equal(stats.hits, 1);
});

test("Pattern 2 fila 2: 200 sin filas tambien se persiste y cuenta como acierto", async () => {
  const dir = await tempCache();
  const net = stubNetwork({ httpStatus: 200, body: { results: [] } });

  const first = await fetchThroughCache(base(dir), net.call);
  assert.equal(first.outcome, "empty");
  assert.equal(await countFiles(dir, "serpapi"), 1, "el vacio SI se escribe: no se vuelve a preguntar nunca");

  const stats = { hits: 0, misses: 0 };
  await fetchThroughCache({ ...base(dir), stats }, net.call);
  assert.equal(net.calls(), 1);
  assert.equal(stats.hits, 1);
});

test("Pattern 2 fila 3: 400, 404 y 422 se persisten, cuentan como acierto y relanzan el error desde disco", async () => {
  for (const status of [400, 404, 422]) {
    const dir = await tempCache();
    const net = stubNetwork({ httpStatus: status, body: { message: "request mal formado" } });

    await assert.rejects(() => fetchThroughCache(base(dir), net.call), CachedRequestError);
    assert.equal(await countFiles(dir, "serpapi"), 1, `${status} debe persistirse`);

    const stats = { hits: 0, misses: 0 };
    await assert.rejects(
      () => fetchThroughCache({ ...base(dir), stats }, net.call),
      CachedRequestError,
      `${status} debe relanzarse desde el disco`,
    );
    assert.equal(net.calls(), 1, `${status} no debe volver a salir a la red`);
    assert.equal(stats.hits, 1);
  }
});

test("Pattern 2 fila 4: 401 y 403 no se escriben a disco y no dejan rastro", async () => {
  for (const status of [401, 403]) {
    const dir = await tempCache();
    const net = stubNetwork({ httpStatus: status, body: { error: "unauthorized" } });

    await assert.rejects(() => fetchThroughCache(base(dir), net.call), CliError);
    assert.equal(
      await countFiles(dir, "serpapi"),
      0,
      `${status} no debe dejar archivo: regenerar la clave tiene que arreglar el problema sin borrar nada`,
    );
  }
});

test("un rechazo de credencial arreglado despues funciona sin borrar nada", async () => {
  const dir = await tempCache();
  const rechazo = stubNetwork({ httpStatus: 401, body: { error: "unauthorized" } });
  await assert.rejects(() => fetchThroughCache(base(dir), rechazo.call), CliError);

  // Juan regenera la clave. Sin tocar el disco, la misma consulta ahora resuelve.
  const arreglado = stubNetwork({ httpStatus: 200, body: { results: [{ pos: 1 }] } });
  const env = await fetchThroughCache(base(dir), arreglado.call);
  assert.equal(env.outcome, "ok");
});

test("Pattern 2 fila 5: 429, 5xx, timeout y fallo de red tampoco se escriben a disco", async () => {
  for (const status of [429, 500, 502, 503]) {
    const dir = await tempCache();
    const net = stubNetwork({ httpStatus: status, body: { error: "transitorio" } });
    await assert.rejects(() => fetchThroughCache(base(dir), net.call), CliError);
    assert.equal(await countFiles(dir, "serpapi"), 0, `${status} no debe persistirse`);
  }

  const dir = await tempCache();
  const caido = stubNetwork((): never => {
    throw new Error("ETIMEDOUT");
  });
  await assert.rejects(() => fetchThroughCache(base(dir), caido.call), CliError);
  assert.equal(await countFiles(dir, "serpapi"), 0, "un fallo de transporte no se persiste");
});

// --- Modo offline y refresco ---

test("con la bandera offline un acierto resuelve normalmente", async () => {
  const dir = await tempCache();
  const net = stubNetwork({ httpStatus: 200, body: { results: [1] } });
  await fetchThroughCache(base(dir), net.call);

  const prohibida = stubNetwork((): never => {
    throw new Error("no se puede salir a la red en modo offline");
  });
  const env = await fetchThroughCache({ ...base(dir), offline: true }, prohibida.call);
  assert.equal(env.outcome, "ok");
  assert.equal(prohibida.calls(), 0);
});

test("con la bandera offline un fallo aborta con codigo distinto de cero nombrando la consulta que falta", async () => {
  const dir = await tempCache();
  const net = stubNetwork({ httpStatus: 200, body: { results: [1] } });

  await assert.rejects(
    () => fetchThroughCache({ ...base(dir), offline: true }, net.call),
    (error: unknown) => {
      assert.ok(error instanceof CliError);
      assert.notEqual(error.exitCode, 0);
      const msg = error.message;
      assert.match(msg, /serpapi/);
      assert.match(msg, /\/search/);
      assert.match(msg, /hernia discal/);
      assert.match(msg, new RegExp(cacheKey("serpapi", "/search", base(dir).params)));
      return true;
    },
  );
  assert.equal(net.calls(), 0, "en offline no se emite la llamada");
});

test("la bandera de refresco ignora el acierto y vuelve a consultar", async () => {
  const dir = await tempCache();
  const primero = stubNetwork({ httpStatus: 200, body: { results: ["viejo"] } });
  await fetchThroughCache(base(dir), primero.call);

  const segundo = stubNetwork({ httpStatus: 200, body: { results: ["nuevo"] } });
  const env = await fetchThroughCache({ ...base(dir), refresh: true }, segundo.call);

  assert.equal(segundo.calls(), 1);
  assert.deepEqual(env.response, { results: ["nuevo"] });
  assert.equal(await countFiles(dir, "serpapi"), 1, "el refresco sobrescribe, no duplica");
});

test("el envelope guardado incluye los parametros de la peticion pero nunca sus cabeceras", async () => {
  const dir = await tempCache();
  const net = stubNetwork({ httpStatus: 200, body: { results: [1] } });

  const env = await fetchThroughCache(
    {
      cacheDir: dir,
      source: "serpapi",
      endpoint: "/search",
      params: { keyword: "hernia discal", country: "pe", headers: { Authorization: "Bearer secreto" } },
    },
    net.call,
  );

  assert.equal(env.request["headers"], undefined);
  assert.equal(env.request["keyword"], "hernia discal");

  const key = cacheKey("serpapi", "/search", { keyword: "hernia discal", country: "pe" });
  const enDisco = await readEnvelope(dir, "serpapi", key);
  assert.ok(enDisco);
  assert.equal(enDisco.request["headers"], undefined);
  assert.equal(JSON.stringify(enDisco).includes("secreto"), false);
});

test("el envelope persistido trae version de esquema, fuente, endpoint, marca de tiempo y codigo HTTP", async () => {
  const dir = await tempCache();
  const net = stubNetwork({ httpStatus: 200, body: { results: [1] } });
  const env = await fetchThroughCache(base(dir), net.call);

  assert.equal(env.schema, 1);
  assert.equal(env.source, "serpapi");
  assert.equal(env.endpoint, "/search");
  assert.equal(env.httpStatus, 200);
  assert.equal(env.error, null);
  assert.ok(!Number.isNaN(Date.parse(env.fetchedAt)));
});
