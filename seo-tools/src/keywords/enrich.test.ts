/**
 * Pruebas del enriquecimiento por lotes.
 *
 * Todas corren SIN clave y sin red: la respuesta se inyecta como doble de la llamada o como
 * doble de la consulta entera. Lo que se prueba aca no es el parseo, que ya tiene sus pruebas
 * en la fuente, sino las cuatro propiedades que hacen que gastar cuota sea seguro: el tope de
 * concurrencia, la reanudacion desde cache, el acotado por bandera y la intocabilidad de las
 * tres metricas diferidas.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import {
  enriquecer,
  METRICAS_DIFERIDAS,
  NO_CONSULTADO,
  pendientesDeMetricas,
  type RegistroKeyword,
} from "./enrich.js";

const temporales: string[] = [];

async function cacheTemporal(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "seo-tools-enrich-"));
  temporales.push(dir);
  return dir;
}

after(async () => {
  for (const dir of temporales) await rm(dir, { recursive: true, force: true });
});

function registro(keyword: string, extra: Partial<RegistroKeyword> = {}): RegistroKeyword {
  return {
    keyword,
    keywordKey: keyword,
    semilla: null,
    capa: "permutacion",
    estado: "sin_datos",
    metricas: {
      searchVolume: null,
      searchVolumeFuente: "sin_datos",
      cpc: null,
      cpcFuente: "sin_datos",
      competition: null,
      competitionFuente: "sin_datos",
    },
    trafficPotential: NO_CONSULTADO,
    keywordDifficulty: NO_CONSULTADO,
    referringDomainsNeeded: NO_CONSULTADO,
    intent: "informacional",
    intentSource: "reglas",
    intentRegla: null,
    stage: "diagnostico",
    stageRegla: null,
    alcance: "objetivo",
    motivoAlcance: null,
    ambiguo: false,
    motivoAmbiguo: null,
    ...extra,
  } as RegistroKeyword;
}

function conMetricas(keyword: string): RegistroKeyword {
  return registro(keyword, {
    estado: "con_datos",
    metricas: {
      searchVolume: 320,
      searchVolumeFuente: "dinorank",
      cpc: 0.5,
      cpcFuente: "dinorank",
      competition: 0.3,
      competitionFuente: "dinorank",
    },
  });
}

const RESPUESTA = (entradas: readonly { key: string; sv?: number; cpc?: number; comp?: number }[]): unknown => ({
  ok: true,
  data: {
    data: {
      datos: { key: "semilla", search_volume: 0, cpc: 0, competition: 0 },
      keywords: entradas.map((e) => ({
        key: e.key,
        search_volume: e.sv ?? 0,
        cpc: e.cpc ?? 0,
        competition: e.comp ?? 0,
      })),
    },
  },
});

test("pendientesDeMetricas separa lo que falta de lo que ya vino con la expansion", () => {
  const universo = [conMetricas("hernia discal"), registro("dolor lumbar sordo")];
  const pendientes = pendientesDeMetricas(universo);

  assert.equal(pendientes.length, 1);
  assert.equal(pendientes[0]?.keywordKey, "dolor lumbar sordo");
});

test("pendientesDeMetricas puede acotarse a las de alcance objetivo, que es donde vale gastar", () => {
  const universo = [
    registro("hernia discal en perros"),
    registro("hernia discal lumbar"),
  ];
  (universo[0] as { alcance: string }).alcance = "fuera_de_alcance";

  const todas = pendientesDeMetricas(universo);
  const soloObjetivo = pendientesDeMetricas(universo, { soloObjetivo: true });

  assert.equal(todas.length, 2);
  assert.equal(soloObjetivo.length, 1);
  assert.equal(soloObjetivo[0]?.keywordKey, "hernia discal lumbar");
});

test("comportamiento 6: el enriquecimiento respeta el tope de concurrencia", async () => {
  const universo = Array.from({ length: 12 }, (_, i) => registro(`keyword ${i}`));
  let enVuelo = 0;
  let pico = 0;

  const resultado = await enriquecer(universo, {
    cacheDir: await cacheTemporal(),
    concurrency: 3,
    consultar: async (keyword) => {
      enVuelo += 1;
      pico = Math.max(pico, enVuelo);
      await new Promise((r) => setTimeout(r, 5));
      enVuelo -= 1;
      return [{ key: keyword, searchVolume: 10, cpc: 0.1, competition: 0.2, presentes: { searchVolume: true, cpc: true, competition: true } }];
    },
  });

  assert.ok(pico <= 3, `nunca puede haber mas de 3 llamadas en vuelo, y el pico fue ${pico}`);
  assert.ok(pico > 1, "con tope 3 y 12 pendientes tiene que haber paralelismo real");
  assert.equal(resultado.consultas, 12);
});

test("comportamiento 7: una interrupcion no obliga a repetir lo ya consultado", async () => {
  const cacheDir = await cacheTemporal();
  let llamadasDeRed = 0;

  const llamada = async (): Promise<{ httpStatus: number; body: unknown }> => {
    llamadasDeRed += 1;
    return { httpStatus: 200, body: RESPUESTA([{ key: "dolor lumbar", sv: 90, cpc: 0.2, comp: 0.1 }]) };
  };

  const primera = await enriquecer([registro("dolor lumbar")], { cacheDir, llamada, concurrency: 1 });
  assert.equal(llamadasDeRed, 1);
  assert.equal(primera.registros[0]?.metricas.searchVolume, 90);

  // Segunda corrida sobre el universo original: lo consultado queda consultado.
  const segunda = await enriquecer([registro("dolor lumbar")], { cacheDir, llamada, concurrency: 1 });
  assert.equal(llamadasDeRed, 1, "la segunda corrida no puede volver a salir a la red");
  assert.equal(segunda.registros[0]?.metricas.searchVolume, 90);
});

test("comportamiento 8: con la bandera de limite se consultan solo las primeras y el resto queda intacto", async () => {
  const universo = [registro("uno"), registro("dos"), registro("tres"), registro("cuatro")];
  const consultadas: string[] = [];

  const resultado = await enriquecer(universo, {
    cacheDir: await cacheTemporal(),
    limit: 2,
    concurrency: 1,
    consultar: async (keyword) => {
      consultadas.push(keyword);
      return [{ key: keyword, searchVolume: 5, cpc: 0, competition: 0, presentes: { searchVolume: true, cpc: true, competition: true } }];
    },
  });

  assert.deepEqual(consultadas, ["uno", "dos"]);
  assert.equal(resultado.registros.length, 4);
  assert.equal(resultado.registros[2]?.metricas.searchVolumeFuente, "sin_datos");
  assert.equal(resultado.registros[3]?.metricas.searchVolumeFuente, "sin_datos");
  assert.equal(resultado.registros[3]?.keyword, "cuatro", "las no consultadas conservan su fila intacta");
});

test("comportamiento 9: una keyword sin datos en la fuente conserva su fila y queda marcada", async () => {
  const resultado = await enriquecer([registro("frase que la fuente no resuelve")], {
    cacheDir: await cacheTemporal(),
    concurrency: 1,
    consultar: async () => [],
  });

  assert.equal(resultado.registros.length, 1, "una keyword sin datos NO se descarta");
  assert.equal(resultado.registros[0]?.metricas.searchVolumeFuente, "sin_datos");
  assert.equal(resultado.registros[0]?.metricas.searchVolume, null);
  assert.equal(resultado.registros[0]?.estado, "sin_datos");
  assert.equal(resultado.sinDatos, 1);
  assert.equal(resultado.resueltas, 0);
});

test("comportamiento 10: las tres metricas diferidas conservan su valor literal", async () => {
  const resultado = await enriquecer([registro("dolor lumbar")], {
    cacheDir: await cacheTemporal(),
    concurrency: 1,
    consultar: async (keyword) => [
      { key: keyword, searchVolume: 70, cpc: 0.4, competition: 0.5, presentes: { searchVolume: true, cpc: true, competition: true } },
    ],
  });

  for (const campo of METRICAS_DIFERIDAS) {
    assert.equal(resultado.registros[0]?.[campo], NO_CONSULTADO, `${campo} perdio su valor literal`);
  }
});

test("comportamiento 10b: el enriquecimiento se niega a escribir si una diferida perdio su literal", async () => {
  const roto = registro("dolor lumbar");
  (roto as unknown as Record<string, unknown>)["keywordDifficulty"] = 42;

  await assert.rejects(
    enriquecer([roto], {
      cacheDir: await cacheTemporal(),
      concurrency: 1,
      consultar: async () => [],
    }),
    /keywordDifficulty/,
  );
});

test("una sola respuesta resuelve todas las pendientes que aparezcan en ella", async () => {
  const universo = [registro("dolor lumbar"), registro("dolor lumbar cronico"), registro("lumbalgia")];
  const consultadas: string[] = [];

  const resultado = await enriquecer(universo, {
    cacheDir: await cacheTemporal(),
    concurrency: 1,
    consultar: async (keyword) => {
      consultadas.push(keyword);
      return [
        { key: "dolor lumbar", searchVolume: 100, cpc: 0.1, competition: 0.2, presentes: { searchVolume: true, cpc: true, competition: true } },
        { key: "dolor lumbar cronico", searchVolume: 40, cpc: 0.2, competition: 0.3, presentes: { searchVolume: true, cpc: true, competition: true } },
        { key: "lumbalgia", searchVolume: 900, cpc: 0.3, competition: 0.4, presentes: { searchVolume: true, cpc: true, competition: true } },
      ];
    },
  });

  assert.deepEqual(consultadas, ["dolor lumbar"], "las otras dos ya se resolvieron con esa respuesta");
  assert.equal(resultado.consultas, 1);
  assert.equal(resultado.resueltas, 3);
  assert.equal(resultado.registros[2]?.metricas.searchVolume, 900);
});

test("el enriquecimiento no toca las filas que ya traian metricas de la expansion", async () => {
  const universo = [conMetricas("hernia discal"), registro("dolor lumbar")];

  const resultado = await enriquecer(universo, {
    cacheDir: await cacheTemporal(),
    concurrency: 1,
    consultar: async () => [
      { key: "hernia discal", searchVolume: 1, cpc: 1, competition: 1, presentes: { searchVolume: true, cpc: true, competition: true } },
    ],
  });

  assert.equal(resultado.registros[0]?.metricas.searchVolume, 320, "una fila ya resuelta no se pisa");
});

test("en modo offline una consulta ausente de la cache no tumba la corrida: queda sin datos", async () => {
  const resultado = await enriquecer([registro("dolor lumbar")], {
    cacheDir: await cacheTemporal(),
    concurrency: 1,
    offline: true,
  });

  assert.equal(resultado.registros.length, 1);
  assert.equal(resultado.registros[0]?.metricas.searchVolumeFuente, "sin_datos");
  assert.equal(resultado.faltantesEnCache, 1);
  assert.equal(resultado.consultas, 0);
});
