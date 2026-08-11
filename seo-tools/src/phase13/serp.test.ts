/**
 * Pruebas de la capa fina de SERP de la fase 13 y del parseo de banderas propio.
 *
 * Corren sin clave y sin red. Los cuerpos de respuesta salen de las capturas reales que dejo
 * la fase 12 en `.cache/serpapi/`, medidas el 2026-08-11: `hernia discal` trae 7 organicos,
 * 8 relacionadas y 4 preguntas, ninguna de las 12 capturas trae bloque destacado y solo 3
 * traen pack local.
 */

import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

import { cacheKey, writeEnvelope, type CacheEnvelope } from "../cache.js";
import {
  SERPAPI_ENDPOINT,
  SERPAPI_FUENTE,
  parametrosBusqueda,
} from "../sources/serpapi.js";
import { booleana, numero, parseBanderas, texto } from "./args.js";
import { leerSerp, serpDesdeCuerpo } from "./serp.js";

const temporales: string[] = [];

async function cacheTemporal(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "seo-tools-p13-"));
  temporales.push(dir);
  return dir;
}

after(async () => {
  for (const dir of temporales) await rm(dir, { recursive: true, force: true });
});

/** Recorte fiel de la captura real de `hernia discal`, con los nombres de campo del proveedor. */
const CUERPO_HERNIA = {
  search_metadata: { status: "Success" },
  organic_results: [
    {
      position: 1,
      title: "Hernia de disco - Síntomas y causas",
      link: "https://www.mayoclinic.org/es/diseases-conditions/herniated-disk/symptoms-causes/syc-20354095",
      displayed_link: "https://www.mayoclinic.org › syc-20354095",
      snippet: "Una hernia de disco ocurre cuando parte del centro blando del disco se desplaza.",
    },
    {
      position: 2,
      title: "Hernia de disco: MedlinePlus enciclopedia médica",
      link: "https://medlineplus.gov/spanish/ency/article/000442.htm",
      displayed_link: "https://medlineplus.gov › article",
      snippet: "Los discos intervertebrales separan las vértebras.",
    },
    {
      position: 3,
      title: "Conoce los síntomas característicos de la hernia discal",
      link: "https://www.quironsalud.com/blogs/es/lesiones-cuidamos/conoce-sintomas-caracteristicos-hernia-discal",
      snippet: "La hernia discal es una de las lesiones mas frecuentes.",
    },
  ],
  related_questions: [
    { question: "¿Qué pasa cuando una persona tiene una hernia discal?", type: "ai_overview" },
    { question: "¿Cómo se cura una hernia discal?" },
    { question: "¿Qué no se puede hacer con una hernia discal?" },
    { question: "¿Cuánto tiempo dura una hernia discal?" },
  ],
  related_searches: [
    { query: "Como desinflamar hernia discal" },
    { query: "hernia discal tratamiento" },
  ],
  ai_overview: { text_blocks: [{ type: "paragraph" }], references: [] },
  inline_videos: [{ position: 1, title: "Herniated Disc: What You Need to Know | Q&A" }],
};

// ---------------------------------------------------------------------------
// El registro tipado
// ---------------------------------------------------------------------------

test("una SERP cacheada se lee como registro tipado con posiciones, URLs y dominios", () => {
  const serp = serpDesdeCuerpo("hernia discal", CUERPO_HERNIA);

  assert.equal(serp.keyword, "hernia discal");
  assert.equal(serp.organicos.length, 3);
  assert.equal(serp.organicos[0]?.posicion, 1);
  assert.equal(
    serp.organicos[0]?.url,
    "https://www.mayoclinic.org/es/diseases-conditions/herniated-disk/symptoms-causes/syc-20354095",
  );
  assert.equal(serp.organicos[0]?.dominio, "mayoclinic.org");
  assert.equal(serp.organicos[0]?.titulo, "Hernia de disco - Síntomas y causas");
  assert.match(String(serp.organicos[0]?.fragmento), /centro blando del disco/);
  assert.deepEqual(serp.preguntas, [
    "¿Qué pasa cuando una persona tiene una hernia discal?",
    "¿Cómo se cura una hernia discal?",
    "¿Qué no se puede hacer con una hernia discal?",
    "¿Cuánto tiempo dura una hernia discal?",
  ]);
  assert.deepEqual(serp.relacionadas, ["Como desinflamar hernia discal", "hernia discal tratamiento"]);
});

test("los organicos salen ordenados por posicion ascendente aunque la fuente los desordene", () => {
  const serp = serpDesdeCuerpo("desordenada", {
    organic_results: [
      { position: 3, link: "https://tres.pe/" },
      { position: 1, link: "https://uno.pe/" },
      { position: 2, link: "https://dos.pe/" },
    ],
  });

  assert.deepEqual(
    serp.organicos.map((o) => o.posicion),
    [1, 2, 3],
  );
  assert.deepEqual(
    serp.organicos.map((o) => o.dominio),
    ["uno.pe", "dos.pe", "tres.pe"],
  );
});

test("el dominio viaja en minusculas y sin el prefijo generico de web", () => {
  const serp = serpDesdeCuerpo("normalizacion", {
    organic_results: [
      { position: 1, link: "https://WWW.Facebook.com/clinicatezza/?locale=es_LA" },
      { position: 2, link: "https://pe.linkedin.com/company/clinica-tezza" },
      { position: 3, link: "https://medlineplus.gov/spanish/ency/article/000442.htm" },
    ],
  });

  // El prefijo de web se quita; un subdominio con significado, como el de pais, se conserva.
  assert.deepEqual(
    serp.organicos.map((o) => o.dominio),
    ["facebook.com", "pe.linkedin.com", "medlineplus.gov"],
  );
  assert.ok(serp.organicos.every((o) => o.dominio === o.dominio.toLowerCase()));
});

// ---------------------------------------------------------------------------
// Las ramas tolerantes: la ausencia es el caso normal, no un error
// ---------------------------------------------------------------------------

test("rama tolerante: sin pack local la lista queda vacia y no se lanza nada", () => {
  const serp = serpDesdeCuerpo("hernia discal", CUERPO_HERNIA);
  assert.deepEqual(serp.packLocal, []);
});

test("rama tolerante: sin bloque destacado el campo queda en null", () => {
  // Medido el 2026-08-11: 0 de las 12 capturas traen answer_box.
  const serp = serpDesdeCuerpo("hernia discal", CUERPO_HERNIA);
  assert.equal(serp.destacado, null);
});

test("rama tolerante: sin resumen de IA la bandera queda en falso", () => {
  const serp = serpDesdeCuerpo("clínica ricardo palma", {
    organic_results: [{ position: 1, link: "https://www.crp.com.pe/" }],
  });
  assert.equal(serp.resumenIa, false);
  assert.equal(serp.videos, false);
});

test("rama tolerante: un enlace que no parsea como URL se descarta y no tumba la captura", () => {
  const serp = serpDesdeCuerpo("enlace roto", {
    organic_results: [
      { position: 1, link: "no-es-una-url" },
      { position: 2, link: "https://doctoralia.pe/clinicas/clinica-ricardo-palma-3" },
      { position: 3 },
    ],
  });

  assert.equal(serp.organicos.length, 1);
  assert.equal(serp.organicos[0]?.dominio, "doctoralia.pe");
});

test("una respuesta completamente vacia produce un registro vacio y no una excepcion", () => {
  const serp = serpDesdeCuerpo("vacia", {});
  assert.deepEqual(serp.organicos, []);
  assert.deepEqual(serp.packLocal, []);
  assert.deepEqual(serp.relacionadas, []);
  assert.deepEqual(serp.preguntas, []);
  assert.equal(serp.destacado, null);
  assert.equal(serpDesdeCuerpo("nula", null).organicos.length, 0);
});

test("el pack local se cosecha con nombre, calificacion y cantidad de resenas", () => {
  const serp = serpDesdeCuerpo("clínica ricardo palma", {
    local_results: {
      places: [
        {
          position: 1,
          title: "Clínica Ricardo Palma",
          rating: 3.5,
          reviews: 777,
          type: "Clínica especializada",
          links: { website: "https://www.crp.com.pe/" },
        },
        { position: 2, title: "Sin calificacion" },
      ],
    },
  });

  assert.equal(serp.packLocal.length, 2);
  assert.equal(serp.packLocal[0]?.nombre, "Clínica Ricardo Palma");
  assert.equal(serp.packLocal[0]?.calificacion, 3.5);
  assert.equal(serp.packLocal[0]?.resenas, 777);
  assert.equal(serp.packLocal[0]?.sitio, "https://www.crp.com.pe/");
  assert.equal(serp.packLocal[1]?.calificacion, null);
  assert.equal(serp.packLocal[1]?.resenas, null);
});

// ---------------------------------------------------------------------------
// La clave de caché: lo que decide si las 12 capturas de la fase 12 siguen valiendo
// ---------------------------------------------------------------------------

test("la clave de cache de serpCompleta coincide con la de busquedaGeolocalizada para la misma keyword", async () => {
  const cacheDir = await cacheTemporal();

  // Se escribe el envelope EN LA CLAVE del camino de la fase 12, calculada aca sin atajos.
  const clave = cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametrosBusqueda("hernia discal"));
  const envelope: CacheEnvelope = {
    schema: 1,
    source: SERPAPI_FUENTE,
    endpoint: SERPAPI_ENDPOINT,
    request: parametrosBusqueda("hernia discal"),
    fetchedAt: "2026-08-10T22:15:03.914Z",
    outcome: "ok",
    httpStatus: 200,
    response: CUERPO_HERNIA,
    error: null,
  };
  await writeEnvelope(cacheDir, clave, envelope);

  // Y la lectura de la fase 13 lo encuentra en modo offline, es decir sin permiso de red.
  const serp = await leerSerp("hernia discal", { cacheDir, offline: true });

  assert.equal(serp.organicos.length, 3);
  assert.equal(serp.capturadaEn, "2026-08-10T22:15:03.914Z");
});

test("leerSerp en modo offline no emite ni una llamada de red", async () => {
  const cacheDir = await cacheTemporal();
  const clave = cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametrosBusqueda("hernia discal"));
  await writeEnvelope(cacheDir, clave, {
    schema: 1,
    source: SERPAPI_FUENTE,
    endpoint: SERPAPI_ENDPOINT,
    request: parametrosBusqueda("hernia discal"),
    fetchedAt: "2026-08-10T22:15:03.914Z",
    outcome: "ok",
    httpStatus: 200,
    response: CUERPO_HERNIA,
    error: null,
  });

  let llamadas = 0;
  await leerSerp("hernia discal", {
    cacheDir,
    offline: true,
    llamada: async () => {
      llamadas += 1;
      throw new Error("la fase 13 no gasta cuota");
    },
  });

  assert.equal(llamadas, 0);
});

test("la marca de tiempo sale del envelope y no del reloj: dos lecturas dan lo mismo", async () => {
  const cacheDir = await cacheTemporal();
  const clave = cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametrosBusqueda("estenosis espinal"));
  await writeEnvelope(cacheDir, clave, {
    schema: 1,
    source: SERPAPI_FUENTE,
    endpoint: SERPAPI_ENDPOINT,
    request: parametrosBusqueda("estenosis espinal"),
    fetchedAt: "2026-08-10T22:16:22.447Z",
    outcome: "ok",
    httpStatus: 200,
    response: CUERPO_HERNIA,
    error: null,
  });

  const primera = await leerSerp("estenosis espinal", { cacheDir, offline: true });
  const segunda = await leerSerp("estenosis espinal", { cacheDir, offline: true });

  assert.equal(primera.capturadaEn, "2026-08-10T22:16:22.447Z");
  assert.deepEqual(JSON.stringify(primera), JSON.stringify(segunda));
});

test("en modo offline una keyword ausente de la cache falla nombrando la clave esperada", async () => {
  const cacheDir = await cacheTemporal();
  await assert.rejects(
    leerSerp("keyword deliberadamente ausente", { cacheDir, offline: true }),
    (error: Error) => {
      assert.match(error.message, /serpapi/);
      assert.match(error.message, /[0-9a-f]{64}/);
      return true;
    },
  );
});

// ---------------------------------------------------------------------------
// Parseo de banderas propio de la fase
// ---------------------------------------------------------------------------

test("args parsea pares con espacio y pares con signo igual", () => {
  const b = parseBanderas(["--keyword", "hernia discal", "--cache-dir=/tmp/x", "--offline"]);

  assert.equal(texto(b, "keyword"), "hernia discal");
  assert.equal(texto(b, "cache-dir"), "/tmp/x");
  assert.equal(booleana(b, "offline"), true);
  assert.equal(booleana(b, "with-types"), false);
});

test("args no deja que una bandera booleana se coma el argumento siguiente", () => {
  const b = parseBanderas(["--offline", "--keyword", "hernia discal"]);
  assert.equal(booleana(b, "offline"), true);
  assert.equal(texto(b, "keyword"), "hernia discal");
});

test("args lee numeros y rechaza lo que no lo es con mensaje accionable", () => {
  assert.equal(numero(parseBanderas(["--limite", "12"]), "limite"), 12);
  assert.equal(numero(parseBanderas([]), "limite"), undefined);
  assert.throws(() => numero(parseBanderas(["--limite", "doce"]), "limite"), /--limite/);
});

test("args recolecta los argumentos sueltos como positionals", () => {
  const b = parseBanderas(["uno", "--offline", "dos"]);
  assert.deepEqual(b.positionals, ["uno", "dos"]);
});
