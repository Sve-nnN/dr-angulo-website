/**
 * Pruebas del gap de keywords (COMP-02) y del recuento de destacados (COMP-04, segunda mitad).
 *
 * Hay una prueba nombrada por cada comportamiento del plan, incluida la que el plan exige
 * explicitamente: una keyword SIN CAPTURA no cuenta como gap.
 *
 * Todo corre sin red y sin credencial. Las SERP se construyen a mano porque lo que se prueba es
 * la regla de "posiciona el y no el doctor", no el parser de la fuente.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  calcularGap,
  marcaAjenaComoInteligencia,
  serializarGap,
  type CapturaDeSerp,
  type Competidor,
} from "./gap.js";
import type { SerpCompleta } from "./serp.js";

const PROPIO = "drangulocolumna.com";

const COMPETIDORES: Competidor[] = [
  { domain: "drcarranzacolumna.com", name: "Dr. Paul Carranza" },
  { domain: "clinicarthromeds.pe", name: "Clinica Arthromeds" },
];

/** SERP sintetica: las URLs llegan en orden de posicion. */
function serp(keyword: string, urls: readonly string[], extra: Partial<SerpCompleta> = {}): SerpCompleta {
  return {
    keyword,
    organicos: urls.map((url, i) => ({
      posicion: i + 1,
      url,
      dominio: new URL(url).hostname.replace(/^www\./, ""),
      titulo: null,
      fragmento: null,
      enlaceMostrado: null,
    })),
    packLocal: [],
    relacionadas: [],
    preguntas: [],
    destacado: null,
    resumenIa: false,
    videos: false,
    capturadaEn: "2026-08-11T00:00:00.000Z",
    ...extra,
  } as SerpCompleta;
}

function captura(
  keyword: string,
  urls: readonly string[],
  extra: Partial<SerpCompleta> = {},
  cluster: string | null = "un-cluster",
): CapturaDeSerp {
  return { keyword, keywordKey: keyword, cluster, volumen: 100, volumenFuente: "dinorank", serp: serp(keyword, urls, extra) };
}

const COBERTURA = { universo: 4766, cabezas: 91 };

// ---------------------------------------------------------------------------
// Comportamiento 1
// ---------------------------------------------------------------------------

test("comportamiento 1: una keyword entra en el gap si el competidor esta en su top 10 y el doctor no aparece en ninguna posicion", () => {
  const informe = calcularGap(
    [captura("cirujano de columna lima", ["https://drcarranzacolumna.com/", "https://otro.pe/x"])],
    COMPETIDORES,
    { dominioPropio: PROPIO, ...COBERTURA },
  );

  const carranza = informe.porCompetidor.find((c) => c.domain === "drcarranzacolumna.com");
  assert.equal(carranza?.keywords.length, 1);
  assert.equal(carranza?.keywords[0]?.keywordKey, "cirujano de columna lima");
  assert.equal(carranza?.keywords[0]?.posicion, 1);

  // El otro competidor no aparece en esa SERP: su bloque existe igual, con cero keywords.
  const arthromeds = informe.porCompetidor.find((c) => c.domain === "clinicarthromeds.pe");
  assert.equal(arthromeds?.keywords.length, 0, "un competidor sin apariciones sigue teniendo bloque");
});

test("comportamiento 1 bis: un competidor que aparece MAS ALLA del top 10 no entra en el gap", () => {
  const relleno = Array.from({ length: 10 }, (_, i) => `https://relleno${i}.pe/p`);
  const informe = calcularGap(
    [captura("hernia discal", [...relleno, "https://drcarranzacolumna.com/"])],
    COMPETIDORES,
    { dominioPropio: PROPIO, ...COBERTURA },
  );

  const carranza = informe.porCompetidor.find((c) => c.domain === "drcarranzacolumna.com");
  assert.equal(carranza?.keywords.length, 0, "la posicion 11 no es el top 10");
});

// ---------------------------------------------------------------------------
// Comportamiento 2
// ---------------------------------------------------------------------------

test("comportamiento 2: una keyword donde aparecen los dos NO es gap: es competencia directa y se registra aparte", () => {
  const informe = calcularGap(
    [
      captura("cirujano de columna surco", [
        "https://drcarranzacolumna.com/",
        "https://drangulocolumna.com/servicios",
      ]),
    ],
    COMPETIDORES,
    { dominioPropio: PROPIO, ...COBERTURA },
  );

  const carranza = informe.porCompetidor.find((c) => c.domain === "drcarranzacolumna.com");
  assert.equal(carranza?.keywords.length, 0, "con el doctor presente no hay gap");

  assert.equal(informe.competenciaDirecta.length, 1);
  assert.equal(informe.competenciaDirecta[0]?.keywordKey, "cirujano de columna surco");
  assert.equal(informe.competenciaDirecta[0]?.posicionDelDoctor, 2);
  assert.equal(informe.competenciaDirecta[0]?.competidores[0]?.domain, "drcarranzacolumna.com");
  assert.equal(informe.competenciaDirecta[0]?.competidores[0]?.posicion, 1);
});

test("comportamiento 2 bis: el doctor fuera del top 10 sigue contando como presente en la SERP", () => {
  const relleno = Array.from({ length: 10 }, (_, i) => `https://relleno${i}.pe/p`);
  const informe = calcularGap(
    [captura("ciatica", ["https://drcarranzacolumna.com/", ...relleno, "https://drangulocolumna.com/"])],
    COMPETIDORES,
    { dominioPropio: PROPIO, ...COBERTURA },
  );

  // El criterio del plan es literal: "el dominio del doctor no aparece en NINGUNA posicion".
  // La posicion 12 es aparecer.
  const carranza = informe.porCompetidor.find((c) => c.domain === "drcarranzacolumna.com");
  assert.equal(carranza?.keywords.length, 0);
  assert.equal(informe.competenciaDirecta.length, 1);
  assert.equal(informe.competenciaDirecta[0]?.posicionDelDoctor, 12);
});

// ---------------------------------------------------------------------------
// Comportamiento 3
// ---------------------------------------------------------------------------

test("comportamiento 3: una keyword sin captura no esta ni en el gap ni fuera de el: se cuenta como sin medir", () => {
  const informe = calcularGap(
    [captura("hernia discal", ["https://drcarranzacolumna.com/"])],
    COMPETIDORES,
    { dominioPropio: PROPIO, universo: 4766, cabezas: 91 },
  );

  assert.equal(informe.cobertura.serpMedidas, 1);
  assert.equal(informe.cobertura.serpSinMedir, 4765);
  assert.equal(informe.cobertura.universo, 4766);

  // La suma tiene que cerrar contra el universo declarado: sin eso, "el doctor no aparece en N
  // keywords" se leeria como diagnostico del sitio cuando es diagnostico mas limite de
  // presupuesto.
  assert.equal(
    informe.cobertura.serpMedidas + informe.cobertura.serpSinMedir,
    informe.cobertura.universo,
  );

  const todas = informe.porCompetidor.flatMap((c) => c.keywords.map((k) => k.keywordKey));
  assert.equal(todas.includes("escoliosis"), false, "una keyword sin captura no aparece en ningun bloque");
});

// ---------------------------------------------------------------------------
// Comportamiento 4
// ---------------------------------------------------------------------------

test("comportamiento 4: el recuento de destacados se informa sobre el total de capturas aunque el resultado sea cero", () => {
  const informe = calcularGap(
    [
      captura("hernia discal", ["https://drcarranzacolumna.com/"]),
      captura("escoliosis", ["https://otro.pe/a"]),
    ],
    COMPETIDORES,
    { dominioPropio: PROPIO, ...COBERTURA },
  );

  // Medido en cero y no medido son cosas distintas: el campo existe y vale 0, y al lado va el
  // total sobre el que se midio.
  assert.equal(informe.destacadosMedidos, 0);
  assert.equal(informe.destacadosSobre, 2);
  assert.deepEqual(informe.destacadosPorOcupante, {});
});

test("comportamiento 4 bis: un bloque destacado se cuenta y se le atribuye a quien lo ocupa", () => {
  const informe = calcularGap(
    [
      captura("que es la ciatica", ["https://otro.pe/a"], {
        destacado: { link: "https://clinicarthromeds.pe/ciatica" } as unknown as Record<string, unknown>,
      }),
    ],
    COMPETIDORES,
    { dominioPropio: PROPIO, ...COBERTURA },
  );

  assert.equal(informe.destacadosMedidos, 1);
  assert.equal(informe.destacadosSobre, 1);
  assert.equal(informe.destacadosPorOcupante["clinicarthromeds.pe"], 1);

  const arthromeds = informe.porCompetidor.find((c) => c.domain === "clinicarthromeds.pe");
  assert.equal(arthromeds?.featuredSnippets, 1, "el competidor lleva su propio conteo al Sheet");
});

// ---------------------------------------------------------------------------
// Comportamiento 5
// ---------------------------------------------------------------------------

test("comportamiento 5: las keywords de marca ajena son inteligencia y quedan marcadas como NO objetivo", () => {
  const marcas = marcaAjenaComoInteligencia(
    [
      {
        keyword: "clinica san bernardo especialistas en traumatologia",
        keywordKey: "clinica san bernardo especialistas en traumatologia",
        alcance: "fuera_de_alcance",
        motivoAlcance: "marca_ajena",
        metricas: { searchVolume: 2400, searchVolumeFuente: "dinorank" },
      },
      {
        keyword: "clinica de traumatologia arthrosalud",
        keywordKey: "clinica de traumatologia arthrosalud",
        alcance: "fuera_de_alcance",
        motivoAlcance: "marca_ajena",
        metricas: { searchVolume: 1600, searchVolumeFuente: "dinorank" },
      },
      {
        keyword: "hernia discal",
        keywordKey: "hernia discal",
        alcance: "objetivo",
        motivoAlcance: null,
        metricas: { searchVolume: 99999, searchVolumeFuente: "dinorank" },
      },
    ],
    5,
  );

  assert.equal(marcas.length, 2, "solo entra lo declarado como marca ajena");
  assert.equal(marcas[0]?.keyword, "clinica san bernardo especialistas en traumatologia");
  assert.equal(marcas[0]?.volumen, 2400, "van ordenadas por volumen de mayor a menor");
  for (const m of marcas) {
    assert.equal(m.objetivo, false, "una keyword de marca ajena NUNCA queda marcada como objetivo");
    assert.ok(m.motivo.length > 0, "cada una explica por que no se persigue");
  }
});

// ---------------------------------------------------------------------------
// Comportamiento 6
// ---------------------------------------------------------------------------

test("comportamiento 6: dos ejecuciones producen el mismo archivo byte a byte", () => {
  const capturas = [
    captura("cirugia de columna lima", ["https://clinicarthromeds.pe/a", "https://drcarranzacolumna.com/"]),
    captura("ciatica", ["https://drcarranzacolumna.com/", "https://drangulocolumna.com/"]),
  ];

  const uno = serializarGap(calcularGap(capturas, COMPETIDORES, { dominioPropio: PROPIO, ...COBERTURA }));
  const dos = serializarGap(calcularGap([...capturas].reverse(), COMPETIDORES, { dominioPropio: PROPIO, ...COBERTURA }));

  // El orden de entrada no puede cambiar el archivo: si lo cambiara, el criterio de SHA-256 no
  // estaria midiendo determinismo sino el orden del recorrido del disco.
  assert.equal(uno, dos);
  assert.equal(uno.includes("fetchedAt"), false, "sin marcas de tiempo dentro: cambiarian en cada corrida");
});

test("el informe cubre a los cinco competidores aunque alguno no aparezca en ninguna captura", () => {
  const cinco: Competidor[] = [
    { domain: "a.com", name: "A" },
    { domain: "b.com", name: "B" },
    { domain: "c.com", name: "C" },
    { domain: "d.com", name: "D" },
    { domain: "e.com", name: "E" },
  ];
  const informe = calcularGap([captura("k", ["https://a.com/"])], cinco, {
    dominioPropio: PROPIO,
    ...COBERTURA,
  });
  assert.equal(informe.porCompetidor.length, 5);
  assert.deepEqual(informe.porCompetidor.map((c) => c.domain), ["a.com", "b.com", "c.com", "d.com", "e.com"]);
});

test("un subdominio del competidor cuenta como el competidor, y un dominio que solo lo contiene no", () => {
  const informe = calcularGap(
    [
      captura("uno", ["https://www.drcarranzacolumna.com/p"]),
      captura("dos", ["https://blog.drcarranzacolumna.com/p"]),
      captura("tres", ["https://nodrcarranzacolumna.com.pe/p"]),
    ],
    COMPETIDORES,
    { dominioPropio: PROPIO, ...COBERTURA },
  );

  const carranza = informe.porCompetidor.find((c) => c.domain === "drcarranzacolumna.com");
  assert.deepEqual(carranza?.keywords.map((k) => k.keywordKey).sort(), ["dos", "uno"]);
});
