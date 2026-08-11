/**
 * Pruebas de la corrida de captura de la fase 13.
 *
 * Corren sin clave y sin red: la llamada de red va sustituida por una doble que ademas
 * CUENTA cuantas veces se la invoco. Esa cuenta es la asercion que de verdad importa en este
 * archivo, porque lo que se esta protegiendo no es una estructura de datos sino un recurso
 * que no se repone hasta el 2026-08-21.
 *
 * Las dos pruebas que el plan exige por nombre son la primera y la segunda:
 *   - con el libro en 102 la corrida aborta sin emitir nada;
 *   - `maxPerRun` se recorta al remanente acumulado y no al valor de la bandera.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { QuotaBook, QuotaExceededError } from "../quota.js";
import { CliError } from "../config.js";
import { cacheKey, writeEnvelope, type CacheEnvelope, type NetworkResult } from "../cache.js";
import {
  SERPAPI_ENDPOINT,
  SERPAPI_FUENTE,
  parametrosBusqueda,
} from "../sources/serpapi.js";
import {
  ACUMULADO_AL_ABRIR_LA_FASE,
  DISPONIBLES_DEL_PROVEEDOR,
  TECHO_ACUMULADO_POR_DEFECTO,
  ejecutarCaptura,
  planificarCaptura,
  type CabezaACapturar,
} from "./capture.js";

const temporales: string[] = [];

after(async () => {
  for (const dir of temporales) await rm(dir, { recursive: true, force: true });
});

/** Directorio de cache aislado con el libro de cuota ya en el valor que la prueba quiere. */
async function entorno(serpapiCalls: number): Promise<{ dir: string; quota: QuotaBook }> {
  const dir = await mkdtemp(path.join(tmpdir(), "seo-tools-captura-"));
  temporales.push(dir);

  await writeFile(
    path.join(dir, "_quota.json"),
    `${JSON.stringify(
      {
        schema: 1,
        sources: {
          [SERPAPI_FUENTE]: {
            calls: serpapiCalls,
            firstCallAt: "2026-08-10T22:14:13.185Z",
            lastCallAt: "2026-08-10T22:16:22.447Z",
          },
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  return { dir, quota: await QuotaBook.open(dir) };
}

function cabeza(keyword: string, enCache = false): CabezaACapturar {
  return { keyword, keywordKey: keyword, enCache };
}

/** Cuerpo minimo con un organico: alcanza para que la SERP no cuente como vacia. */
function cuerpoConOrganicos(n: number): Record<string, unknown> {
  return {
    search_metadata: { status: "Success" },
    organic_results: Array.from({ length: n }, (_, i) => ({
      position: i + 1,
      title: `Resultado ${i + 1}`,
      link: `https://ejemplo${i + 1}.pe/pagina`,
      snippet: "texto",
    })),
  };
}

/** Doble de red que lleva la cuenta de las consultas que salieron de verdad. */
function red(
  cuerpo: (n: number) => Record<string, unknown> = () => cuerpoConOrganicos(7),
): { llamada: () => Promise<NetworkResult>; emitidas: () => number } {
  let n = 0;
  return {
    llamada: async (): Promise<NetworkResult> => {
      n += 1;
      return { httpStatus: 200, body: cuerpo(n) };
    },
    emitidas: () => n,
  };
}

/** Deja una captura en disco por el mismo camino de clave que usa el seam. */
async function sembrarEnCache(dir: string, keyword: string, organicos: number): Promise<void> {
  const clave = cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametrosBusqueda(keyword));
  const envelope: CacheEnvelope = {
    schema: 1,
    source: SERPAPI_FUENTE,
    endpoint: SERPAPI_ENDPOINT,
    request: parametrosBusqueda(keyword),
    fetchedAt: "2026-08-10T22:14:13.185Z",
    outcome: "ok",
    httpStatus: 200,
    response: cuerpoConOrganicos(organicos),
    error: null,
  };
  await writeEnvelope(dir, clave, envelope);
}

test("con el libro de cuota en el techo de 102 la corrida aborta con codigo 4 y NO emite ninguna consulta", async () => {
  const { quota } = await entorno(TECHO_ACUMULADO_POR_DEFECTO);
  const fuente = red();

  const cabezas = [cabeza("hernia discal lima"), cabeza("cirujano de columna surco")];

  // El aborto ocurre en la PLANIFICACION, antes del bucle. Esa es justamente la garantia:
  // si abortara dentro del bucle, la primera consulta ya habria salido.
  assert.throws(
    () => planificarCaptura(cabezas, { acumulado: quota.total(SERPAPI_FUENTE) }),
    (error: unknown) => {
      assert.ok(error instanceof QuotaExceededError);
      assert.equal(error.exitCode, 4, "el plan exige codigo de salida 4 por techo alcanzado");
      assert.match(error.message, /NO se emitio ninguna consulta/);
      return true;
    },
  );

  assert.equal(fuente.emitidas(), 0, "no puede haber salido ni una consulta a la fuente");
  assert.equal(quota.total(SERPAPI_FUENTE), 102, "el libro no se movio");
  assert.equal(quota.runCalls(SERPAPI_FUENTE), 0);
});

test("maxPerRun se recorta al remanente acumulado y no al valor de la bandera", async () => {
  // El libro en 100 deja 2 de margen bajo el techo de 102. La bandera pide 84.
  const { quota } = await entorno(100);

  const plan = planificarCaptura(
    [cabeza("a"), cabeza("b"), cabeza("c"), cabeza("d")],
    { acumulado: quota.total(SERPAPI_FUENTE), maxSearches: 84 },
  );

  assert.equal(plan.disponibles, 2);
  assert.equal(plan.maxPerRun, 2, "gana el remanente acumulado, no la bandera");
  assert.notEqual(plan.maxPerRun, 84);
  assert.equal(plan.sinCupo, 2, "dos de las cuatro no caben bajo el techo");
});

test("la bandera si manda cuando pide menos que el remanente acumulado", async () => {
  const { quota } = await entorno(12);
  const plan = planificarCaptura([cabeza("a"), cabeza("b")], {
    acumulado: quota.total(SERPAPI_FUENTE),
    maxSearches: 1,
  });

  assert.equal(plan.disponibles, 90, "102 menos las 12 que ya estaban en el libro");
  assert.equal(plan.maxPerRun, 1, "el tope de la corrida nunca AMPLIA el techo, pero si lo baja");
});

test("sin bandera, maxPerRun es el remanente acumulado entero", async () => {
  const { quota } = await entorno(12);
  const plan = planificarCaptura([cabeza("a")], { acumulado: quota.total(SERPAPI_FUENTE) });

  assert.equal(plan.maxPerRun, 90);
  assert.equal(plan.techo, TECHO_ACUMULADO_POR_DEFECTO);
});

test("una cabeza ya en cache se resuelve gratis y no toca el libro de cuota", async () => {
  const { dir, quota } = await entorno(12);
  await sembrarEnCache(dir, "hernia discal", 7);
  const fuente = red();

  const cabezas = [cabeza("hernia discal", true)];
  const plan = planificarCaptura(cabezas, { acumulado: quota.total(SERPAPI_FUENTE) });
  assert.equal(plan.aEmitir.length, 0);
  assert.equal(plan.yaEnCache.length, 1);

  const balance = await ejecutarCaptura(plan, cabezas, {
    quota,
    cacheDir: dir,
    llamada: fuente.llamada,
  });

  assert.equal(fuente.emitidas(), 0);
  assert.equal(balance.emitidas, 0);
  assert.equal(balance.aciertos, 1);
  assert.equal(balance.acumuladoDespues, 12, "el libro no se movio por un acierto de cache");
  assert.equal(balance.detalle[0]?.desenlace, "acierto");
  assert.equal(balance.detalle[0]?.organicos, 7);
});

test("cuando el techo corta a mitad de corrida las restantes quedan sin-cupo y las cacheadas se siguen leyendo gratis", async () => {
  // Libro en 101: queda 1 sola busqueda bajo el techo de 102.
  const { dir, quota } = await entorno(101);
  await sembrarEnCache(dir, "escoliosis", 5);
  const fuente = red();

  // El orden importa: la cacheada va ULTIMA, despues de que el tope ya haya cortado.
  const cabezas = [
    cabeza("primera nueva"),
    cabeza("segunda nueva"),
    cabeza("tercera nueva"),
    cabeza("escoliosis", true),
  ];

  const plan = planificarCaptura(cabezas, { acumulado: quota.total(SERPAPI_FUENTE) });
  assert.equal(plan.maxPerRun, 1);

  const balance = await ejecutarCaptura(plan, cabezas, {
    quota,
    cacheDir: dir,
    llamada: fuente.llamada,
  });

  assert.equal(fuente.emitidas(), 1, "solo cabia una consulta y solo salio una");
  assert.equal(balance.emitidas, 1);
  assert.equal(balance.topeAlcanzado, true);
  assert.deepEqual(balance.sinCupo, ["segunda nueva", "tercera nueva"]);
  assert.equal(
    balance.aciertos,
    1,
    "abortar al llegar al tope habria perdido el acierto de cache, que es gratis",
  );
  assert.equal(balance.acumuladoDespues, 102, "el libro queda EXACTAMENTE en el techo, nunca encima");
});

test("una SERP sin organicos se registra como vacia y no se vuelve a preguntar", async () => {
  const { dir, quota } = await entorno(12);
  const fuente = red(() => ({ search_metadata: { status: "Success" }, organic_results: [] }));

  const cabezas = [cabeza("keyword sin resultados")];
  const plan = planificarCaptura(cabezas, { acumulado: quota.total(SERPAPI_FUENTE) });
  const balance = await ejecutarCaptura(plan, cabezas, {
    quota,
    cacheDir: dir,
    llamada: fuente.llamada,
  });

  assert.equal(fuente.emitidas(), 1);
  assert.deepEqual(balance.vacias, ["keyword sin resultados"]);
  assert.equal(balance.detalle[0]?.desenlace, "vacia");

  // Segunda corrida sobre la misma cabeza: el seam cachea la vacia, asi que no se repregunta.
  const quota2 = await QuotaBook.open(dir);
  const fuente2 = red();
  const plan2 = planificarCaptura(cabezas, { acumulado: quota2.total(SERPAPI_FUENTE) });
  const balance2 = await ejecutarCaptura(plan2, cabezas, {
    quota: quota2,
    cacheDir: dir,
    llamada: fuente2.llamada,
  });

  assert.equal(fuente2.emitidas(), 0, "una vacia cacheada no cuesta una segunda busqueda");
  assert.equal(balance2.acumuladoDespues, 13, "el libro no crecio en la segunda corrida");
});

test("un rechazo de credencial detiene la corrida en vez de reintentar", async () => {
  const { dir, quota } = await entorno(12);
  let intentos = 0;
  const llamada = async (): Promise<NetworkResult> => {
    intentos += 1;
    return { httpStatus: 401, body: { error: "Invalid API key" } };
  };

  const cabezas = [cabeza("una"), cabeza("otra")];
  const plan = planificarCaptura(cabezas, { acumulado: quota.total(SERPAPI_FUENTE) });

  await assert.rejects(
    () => ejecutarCaptura(plan, cabezas, { quota, cacheDir: dir, llamada }),
    (error: unknown) => {
      assert.ok(error instanceof CliError);
      assert.match(error.message, /rechazo la credencial/);
      return true;
    },
  );

  assert.equal(intentos, 1, "no se reintenta: la precondicion de la tarea 3 lo prohibe");
});

test("el balance reporta el gasto de la fase y la reserva restante contra las 114 del proveedor", async () => {
  const { dir, quota } = await entorno(12);
  const fuente = red();

  const cabezas = [cabeza("una"), cabeza("otra"), cabeza("tercera")];
  const plan = planificarCaptura(cabezas, { acumulado: quota.total(SERPAPI_FUENTE) });
  const balance = await ejecutarCaptura(plan, cabezas, {
    quota,
    cacheDir: dir,
    llamada: fuente.llamada,
  });

  assert.equal(balance.acumuladoAntes, ACUMULADO_AL_ABRIR_LA_FASE);
  assert.equal(balance.acumuladoDespues, 15);
  assert.equal(balance.gastoDeLaFase, 3);
  assert.equal(balance.reservaRestante, DISPONIBLES_DEL_PROVEEDOR - 3);
  assert.equal(balance.topeAlcanzado, false);
});

test("el techo se puede bajar con --ceiling pero el calculo sigue siendo acumulado", async () => {
  const { quota } = await entorno(12);
  const plan = planificarCaptura([cabeza("a"), cabeza("b")], {
    acumulado: quota.total(SERPAPI_FUENTE),
    techo: 13,
  });

  assert.equal(plan.techo, 13);
  assert.equal(plan.disponibles, 1);
  assert.equal(plan.maxPerRun, 1);
  assert.equal(plan.sinCupo, 1);
});
