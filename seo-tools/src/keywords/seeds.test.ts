/**
 * Pruebas de la extraccion de semillas.
 *
 * Todas corren sobre fragmentos de contenido EN MEMORIA, nunca sobre los archivos reales de
 * la aplicacion. El workstream milestone los esta editando en paralelo: una prueba que
 * afirmara "hay 21 condiciones" se pondria roja por un cambio de contenido ajeno a este
 * modulo, y esa es exactamente la clase de acoplamiento que la fase 12 vino a eliminar.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  construirSemillas,
  extraerArreglos,
  extraerCampo,
  reducirANucleo,
  type ContenidoCrudo,
} from "./seeds.js";

const SERVICES = `
export const serviceCategories: ServiceCategory[] = [
  {
    slug: "columna",
    name: "Cirugía de columna",
    description: "Texto largo que no es semilla.",
    conditions: [
      "Hernia discal",
      "Estenosis espinal (canal estrecho)",
      "Escoliosis y otras deformidades",
      "Lumbalgia y ciática",
    ],
  },
  {
    slug: "ortopedia-infantil",
    name: "Ortopedia infantil",
    description: "Otro texto.",
    conditions: [
      "Displasia congénita de cadera",
    ],
  },
];

export const procedureApproaches: ProcedureApproach[] = [
  {
    slug: "minimamente-invasiva",
    name: "Cirugía mínimamente invasiva",
    description: "No es semilla.",
    examples: [
      "Hernia discal lumbar y cervical",
      "Fijación percutánea de fracturas",
    ],
  },
];
`;

const SERVICE_PAGES = `
export const servicePages: ServicePage[] = [
  {
    slug: "hernia-discal",
    h1: "Hernia discal",
  },
  {
    slug: "estenosis-espinal",
    h1: "Estenosis espinal (canal estrecho)",
  },
  {
    slug: "escoliosis",
    h1: "Escoliosis y deformidades de columna",
  },
  {
    slug: "ortopedia-infantil",
    h1: "Ortopedia infantil",
  },
];
`;

const LOCATIONS = `
export const locations: Location[] = [
  {
    slug: "consultorio-privado",
    name: "Consultorio privado del Dr. Angulo",
    addressLocality: "Santiago de Surco",
    addressRegion: "Lima",
    channels: [
      { label: "WhatsApp +51 964 305 682" },
    ],
  },
  {
    slug: "clinica-ricardo-palma",
    name: "Clínica Ricardo Palma",
    addressLocality: "San Isidro",
    addressRegion: "Lima",
  },
  {
    slug: "sanna-la-molina",
    name: "Clínica Sanna, sede La Molina",
    addressLocality: "La Molina",
    addressRegion: "Lima",
  },
  {
    slug: "clinica-tezza",
    name: "Clínica Padre Luis Tezza",
    addressLocality: "Santiago de Surco",
    addressRegion: "Lima",
  },
];
`;

const BLOG = `
export const posts: Post[] = [
  {
    slug: "sintomas",
    title: "5 síntomas de columna que no debes ignorar",
  },
  {
    slug: "estenosis",
    title: "Estenosis espinal: qué es y por qué aparece con la edad",
  },
];
`;

const FAQ = `
export const faqItems: FaqItem[] = [
  {
    question: "¿Cuándo debo preocuparme por un dolor de espalda?",
    answer: "Texto de respuesta que no es semilla.",
  },
  {
    question: "Tengo miedo a operarme de la columna, ¿es tan riesgoso como parece?",
    answer: "Otro texto.",
  },
  {
    question: "¿Cómo agendo una cita?",
    answer: "Un tercer texto.",
  },
];
`;

const CV = `
export const education: CvEntry[] = [
  {
    title: "Residencia de postgrado en Traumatología y Ortopedia",
    place: "Universidad de Oriente",
  },
  {
    title: "Diplomado en Ecografía Integral",
    place: "Universidad Fermín Toro",
  },
];

export const experience: CvEntry[] = [
  {
    title: "Traumatólogo y cirujano de columna",
    place: "Clínica Ricardo Palma",
  },
  {
    title: "Médico interno",
    place: "Hospital",
  },
];

export const training: TrainingEntry[] = [
  {
    title: "AOSpine Advanced Course, Degenerative Spine",
    place: "Lima, Perú",
  },
];
`;

const COMPETENCIA = `
## drcarranzacolumna.com — Dr. Paul Carranza (Neurocirujano, cirugía endoscópica de columna)

- Secciones: Inicio, Trayectoria
- Servicios: escoliosis, discopatía degenerativa, ciática, fractura vertebral; técnicas: abordaje anterior/lateral mínimamente invasivo, monitorización neurofisiológica intraoperatoria

## cirujanocolumna-elaos.com — Dr. Eduardo Laos Plasier (Neurocirujano)

- Servicios: procedimientos percutáneos, endoscopía espinal, casos complejos, tumores de columna, escoliosis/cifosis
`;

const CONTENIDO: ContenidoCrudo = {
  services: SERVICES,
  servicePages: SERVICE_PAGES,
  locations: LOCATIONS,
  blog: BLOG,
  faq: FAQ,
  cv: CV,
  competencia: COMPETENCIA,
};

test("extraerArreglos recoge las cadenas del arreglo declarado y solo de ese", () => {
  const conditions = extraerArreglos(SERVICES, "conditions");
  assert.deepEqual(conditions, [
    "Hernia discal",
    "Estenosis espinal (canal estrecho)",
    "Escoliosis y otras deformidades",
    "Lumbalgia y ciática",
    "Displasia congénita de cadera",
  ]);

  assert.deepEqual(extraerArreglos(SERVICES, "examples"), [
    "Hernia discal lumbar y cervical",
    "Fijación percutánea de fracturas",
  ]);
});

test("extraerCampo respeta la sangria y no confunde campos anidados", () => {
  // `label` vive con sangria 6 dentro de channels: no debe aparecer entre los `name` de sede.
  assert.deepEqual(extraerCampo(LOCATIONS, "name", 4), [
    "Consultorio privado del Dr. Angulo",
    "Clínica Ricardo Palma",
    "Clínica Sanna, sede La Molina",
    "Clínica Padre Luis Tezza",
  ]);
});

test("reducirANucleo saca el termino nuclear de un titular y de una pregunta", () => {
  assert.equal(reducirANucleo("5 síntomas de columna que no debes ignorar"), "síntomas de columna");
  assert.equal(reducirANucleo("Estenosis espinal: qué es y por qué aparece con la edad"), "Estenosis espinal");
  assert.equal(reducirANucleo("¿Cuándo debo preocuparme por un dolor de espalda?"), "dolor de espalda");
  // Sin ningun termino del dominio no hay nucleo que valga la pena: se descarta.
  assert.equal(reducirANucleo("¿Cómo agendo una cita?"), null);
  // Una sola palabra tampoco es semilla: o ya existe en el catalogo estructurado, o es
  // demasiado generica para el negocio.
  assert.equal(reducirANucleo("¿Atienden a niños?"), null);
});

test("cada semilla declara texto visible, clave normalizada, tipo, procedencia y rango", () => {
  const { seeds } = construirSemillas(CONTENIDO);
  assert.ok(seeds.length > 0);

  for (const s of seeds) {
    assert.equal(typeof s.keyword, "string");
    assert.ok(s.keyword.trim() !== "");
    assert.equal(typeof s.keywordKey, "string");
    assert.ok(s.keywordKey.trim() !== "");
    assert.ok(s.procedencia.trim() !== "");
    assert.ok([1, 2, 3, 4].includes(s.rango));
  }
});

test("estan representados los seis tipos de semilla", () => {
  const { seeds } = construirSemillas(CONTENIDO);
  const tipos = new Set(seeds.map((s) => s.tipo));

  for (const tipo of ["condicion", "procedimiento", "especialidad", "sede", "sintoma", "pregunta"]) {
    assert.ok(tipos.has(tipo as never), `falta el tipo de semilla "${tipo}"`);
  }
});

test("los rangos 1 y 2 son las cuatro condiciones publicadas y las cuatro sedes, y van primero", () => {
  const { seeds } = construirSemillas(CONTENIDO);

  const rango1 = seeds.filter((s) => s.rango === 1).map((s) => s.keywordKey);
  const rango2 = seeds.filter((s) => s.rango === 2).map((s) => s.keywordKey);

  assert.deepEqual(rango1.slice().sort(), [
    "escoliosis y deformidades de columna",
    "estenosis espinal",
    "hernia discal",
    "ortopedia infantil",
  ]);
  assert.deepEqual(rango2.slice().sort(), [
    "clinica padre luis tezza",
    "clinica ricardo palma",
    "clinica sanna la molina",
    "consultorio privado del dr angulo",
  ]);

  const primerOtro = seeds.findIndex((s) => s.rango > 2);
  const ultimoPrioritario = seeds.map((s) => s.rango).lastIndexOf(2);
  assert.ok(ultimoPrioritario < primerOtro, "las ocho prioritarias tienen que ir antes que el resto");
});

test("el orden es rango ascendente y, dentro del rango, alfabetico por clave", () => {
  const { seeds } = construirSemillas(CONTENIDO);

  for (let i = 1; i < seeds.length; i += 1) {
    const previa = seeds[i - 1]!;
    const actual = seeds[i]!;
    assert.ok(
      previa.rango < actual.rango ||
        (previa.rango === actual.rango && previa.keywordKey < actual.keywordKey),
      `orden roto entre "${previa.keywordKey}" y "${actual.keywordKey}"`,
    );
  }
});

test("dos semillas que solo difieren en tildes, mayusculas o espacios colapsan en una", () => {
  const conRuido: ContenidoCrudo = {
    ...CONTENIDO,
    competencia: `${COMPETENCIA}\n- Servicios: HERNIA  DISCAL, hernia discal, Hérnia Discál\n`,
  };

  const { seeds } = construirSemillas(conRuido);
  const claves = seeds.map((s) => s.keywordKey);
  assert.equal(new Set(claves).size, claves.length, "hay claves normalizadas repetidas");
  assert.equal(claves.filter((k) => k === "hernia discal").length, 1);
});

test("el texto visible conserva las tildes y la clave normalizada no", () => {
  const { seeds } = construirSemillas(CONTENIDO);
  const ciatica = seeds.find((s) => s.keywordKey === "lumbalgia y ciatica");

  assert.ok(ciatica !== undefined, "no se extrajo la condicion con tilde");
  assert.equal(ciatica.keyword, "Lumbalgia y ciática");
});

test("construir dos veces sobre el mismo contenido produce un snapshot identico", () => {
  const a = JSON.stringify(construirSemillas(CONTENIDO));
  const b = JSON.stringify(construirSemillas(CONTENIDO));
  assert.equal(a, b);
});

test("el snapshot no lleva marca de tiempo: seria ruido en el diff y rompe la idempotencia", () => {
  const serializado = JSON.stringify(construirSemillas(CONTENIDO));
  assert.ok(!/\d{4}-\d{2}-\d{2}T/.test(serializado));
});
