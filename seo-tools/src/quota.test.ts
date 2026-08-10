/**
 * Pruebas del libro de cuota. Sin red y sin credenciales.
 *
 * El libro existe por un dato duro: la cuenta de SerpApi esta en plan gratuito, quedan 127
 * busquedas hasta el 21 de agosto de 2026 y es la fuente principal de expansion. El gasto
 * tiene que estar acotado por codigo, no por buena intencion.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { fetchThroughCache, type NetworkResult } from "./cache.js";
import { CliError } from "./config.js";
import { QuotaBook, QuotaExceededError } from "./quota.js";

const temps: string[] = [];

async function tempCache(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "seo-tools-quota-"));
  temps.push(dir);
  return dir;
}

after(async () => {
  await Promise.all(temps.map((d) => rm(d, { recursive: true, force: true })));
});

function stubNetwork(result: NetworkResult) {
  let calls = 0;
  const call = async (): Promise<NetworkResult> => {
    calls += 1;
    return result;
  };
  return { call, calls: () => calls };
}

test("una llamada que sale a la red incrementa el contador de la fuente", async () => {
  const dir = await tempCache();
  const quota = await QuotaBook.open(dir);
  const net = stubNetwork({ httpStatus: 200, body: { results: [1] } });

  await fetchThroughCache(
    { cacheDir: dir, source: "serpapi", endpoint: "/search", params: { keyword: "hernia" }, quota },
    net.call,
  );

  assert.equal(quota.total("serpapi"), 1);
  assert.equal(net.calls(), 1);
});

test("una llamada resuelta desde cache NO incrementa el contador de cuota", async () => {
  const dir = await tempCache();
  const quota = await QuotaBook.open(dir);
  const net = stubNetwork({ httpStatus: 200, body: { results: [1] } });
  const opts = {
    cacheDir: dir,
    source: "serpapi",
    endpoint: "/search",
    params: { keyword: "hernia" },
    quota,
  };

  await fetchThroughCache(opts, net.call);
  assert.equal(quota.total("serpapi"), 1);

  await fetchThroughCache(opts, net.call);
  await fetchThroughCache(opts, net.call);

  assert.equal(quota.total("serpapi"), 1, "solo cuenta lo que sale a la red de verdad");
  assert.equal(net.calls(), 1);
});

test("el incremento se persiste antes de devolver: una interrupcion no pierde la cuenta", async () => {
  const dir = await tempCache();
  const quota = await QuotaBook.open(dir);
  const net = stubNetwork({ httpStatus: 200, body: { results: [1] } });

  await fetchThroughCache(
    { cacheDir: dir, source: "serpapi", endpoint: "/search", params: { keyword: "hernia" }, quota },
    net.call,
  );

  // Sin cerrar nada, otro lector del disco ya ve el incremento.
  const testigo = await QuotaBook.open(dir);
  assert.equal(testigo.total("serpapi"), 1);
});

test("el libro sobrevive al fin del proceso: dos corridas seguidas acumulan", async () => {
  const dir = await tempCache();

  const corridaUno = await QuotaBook.open(dir);
  await corridaUno.record("serpapi", "hernia discal");
  await corridaUno.record("serpapi", "escoliosis");
  assert.equal(corridaUno.total("serpapi"), 2);

  // Segunda instancia, como si fuera otro proceso.
  const corridaDos = await QuotaBook.open(dir);
  assert.equal(corridaDos.total("serpapi"), 2, "lo lee de disco");
  assert.equal(corridaDos.runCalls("serpapi"), 0, "pero su contador de corrida arranca en cero");

  await corridaDos.record("serpapi", "estenosis");
  assert.equal(corridaDos.total("serpapi"), 3, "acumula sobre lo anterior");
});

test("alcanzado el tope, la siguiente llamada no se emite y aborta con codigo distinto de cero", async () => {
  const dir = await tempCache();
  const quota = await QuotaBook.open(dir);
  const net = stubNetwork({ httpStatus: 200, body: { results: [1] } });

  const consulta = (keyword: string) => ({
    cacheDir: dir,
    source: "serpapi",
    endpoint: "/search",
    params: { keyword },
    quota,
    maxPerRun: 2,
    pending: 5,
    label: keyword,
  });

  await fetchThroughCache(consulta("hernia discal"), net.call);
  await fetchThroughCache(consulta("escoliosis"), net.call);
  assert.equal(net.calls(), 2);

  await assert.rejects(
    () => fetchThroughCache(consulta("estenosis espinal"), net.call),
    (error: unknown) => {
      assert.ok(error instanceof QuotaExceededError);
      assert.ok(error instanceof CliError);
      assert.notEqual(error.exitCode, 0);
      assert.match(error.message, /5/, "informa cuantas consultas quedaron sin procesar");
      assert.match(error.message, /escoliosis/, "nombra la ultima consulta que si se hizo");
      return true;
    },
  );

  assert.equal(net.calls(), 2, "la llamada que excederia el tope NO se emite");
  assert.equal(quota.total("serpapi"), 2, "y no se contabiliza");
});

test("un tope que solo avisa no es un tope: el conteo de la corrida es independiente del acumulado", async () => {
  const dir = await tempCache();

  const previa = await QuotaBook.open(dir);
  await previa.record("serpapi", "vieja");
  assert.equal(previa.total("serpapi"), 1);

  const nueva = await QuotaBook.open(dir);
  nueva.ensureCapacity({ source: "serpapi", maxPerRun: 1, pending: 1, label: "x" });
  await nueva.record("serpapi", "nueva");

  assert.throws(
    () => nueva.ensureCapacity({ source: "serpapi", maxPerRun: 1, pending: 3, label: "y" }),
    QuotaExceededError,
  );
  assert.equal(nueva.total("serpapi"), 2);
});

test("el reporte de consumo distingue fuentes", async () => {
  const dir = await tempCache();
  const quota = await QuotaBook.open(dir);

  await quota.record("serpapi", "a");
  await quota.record("serpapi", "b");
  await quota.record("dinorank", "c");

  const snap = quota.snapshot();
  assert.equal(snap.sources["serpapi"]?.calls, 2);
  assert.equal(snap.sources["dinorank"]?.calls, 1);
  assert.ok(snap.sources["serpapi"]?.firstCallAt);
  assert.ok(snap.sources["serpapi"]?.lastCallAt);
});
