import assert from "node:assert/strict";
import { test } from "node:test";

import type { SeccionDeCopy } from "./model.js";
import { COPY_FIN, COPY_INICIO } from "./paquete.js";
import {
  MARCAS_COPY,
  RITMO_MINIMO,
  paginasParaRevisar,
  regionDeCopy,
  revisar,
  revisarDocumento,
  tellsDeIa,
} from "./ymyl.js";

function seccion(parcial: Partial<SeccionDeCopy>): SeccionDeCopy {
  return {
    clave: "que-es",
    nivel: 2,
    titulo: "Qué es la hernia discal",
    tipo: "clinico",
    aprobacion: "pendiente-doctor",
    parrafos: ["Un párrafo cualquiera de prueba."],
    afirmaciones: [],
    keywordsCubiertas: [],
    entidadesCubiertas: [],
    ...parcial,
  };
}

function pagina(secciones: readonly SeccionDeCopy[], minimoDePalabras = 0) {
  return { url: "/servicios/hernia-discal", minimoDePalabras, secciones };
}

/** Los hallazgos de una regla concreta. El resto de las reglas corre igual y no molesta. */
function de(hallazgos: readonly { regla: string }[], regla: string): readonly { regla: string }[] {
  return hallazgos.filter((h) => h.regla === regla);
}

test("ymyl: las marcas de la region de copy son las mismas que escribe el generador", () => {
  // Si divergen, la compuerta mira una region que el paquete no delimita y no revisa nada.
  // Estan escritas literales en los dos archivos a proposito, y esta prueba las ata.
  assert.deepEqual(MARCAS_COPY, { inicio: COPY_INICIO, fin: COPY_FIN });
});

test("ymyl: una seccion clinica sin el sello de pendiente-doctor hace fallar la compuerta", () => {
  const mal = revisar(pagina([seccion({ aprobacion: "aprobado-doctor" })]));
  assert.equal(de(mal, "sello-clinico").length, 1);

  const bien = revisar(pagina([seccion({ aprobacion: "pendiente-doctor" })]));
  assert.equal(de(bien, "sello-clinico").length, 0);

  const operativa = revisar(
    pagina([seccion({ tipo: "operativo", aprobacion: "no-requiere" })]),
  );
  assert.equal(de(operativa, "sello-clinico").length, 0, "lo operativo no lleva sello");
});

test("ymyl: una afirmacion con cifra y sin fuente hace fallar la compuerta", () => {
  const mal = revisar(
    pagina([
      seccion({
        afirmaciones: [{ texto: "Las 4 sedes vigentes son cuatro.", fuente: "   " }],
      }),
    ]),
  );
  assert.equal(de(mal, "cifra-sin-fuente").length, 1);

  const bien = revisar(
    pagina([
      seccion({
        afirmaciones: [
          { texto: "Las 4 sedes vigentes son cuatro.", fuente: "src/lib/site-config.ts, sedes." },
        ],
      }),
    ]),
  );
  assert.equal(de(bien, "cifra-sin-fuente").length, 0);
});

test("ymyl: una cifra sobre el propio doctor falla aunque traiga fuente", () => {
  // Ninguna de esas cifras esta verificada, y la restriccion del proyecto es explicita: ante la
  // duda entre una frase con mas fuerza comercial y una verificable, va la verificable. Por eso
  // esta regla no la levanta una fuente: la levanta el doctor confirmando por escrito.
  const casos = [
    "El doctor lleva más de 2000 cirugías de columna realizadas.",
    "Con veinte años de experiencia en cirugía de columna.",
    "La tasa de éxito del procedimiento es alta.",
    "Miles de pacientes operados a lo largo de su carrera.",
  ];
  for (const texto of casos) {
    const r = revisar(
      pagina([
        seccion({
          parrafos: [texto],
          afirmaciones: [{ texto, fuente: "Una fuente que igual no alcanza." }],
        }),
      ]),
    );
    assert.ok(de(r, "cifra-del-doctor").length >= 1, `no se detecto: ${texto}`);
  }

  const bien = revisar(
    pagina([
      seccion({ parrafos: ["Un paciente con hernia discal suele consultar por dolor de pierna."] }),
    ]),
  );
  assert.equal(de(bien, "cifra-del-doctor").length, 0);
});

test("ymyl: nombrar Montefiori falla y las cuatro sedes vigentes pasan", () => {
  // El doctor ya no atiende ahi. Una sede que no existe publicada en una pagina medica manda
  // pacientes a una puerta cerrada, que es un daño concreto y no un error de dato.
  const mal = revisar(
    pagina([seccion({ parrafos: ["También atiende en la Clínica Montefiori de Surco."] })]),
  );
  assert.equal(de(mal, "sede-que-no-existe").length, 1);

  const bien = revisar(
    pagina([
      seccion({
        parrafos: [
          "Atiende en su consultorio de Surco, en Ricardo Palma, en Sanna La Molina y en Padre Luis Tezza.",
        ],
      }),
    ]),
  );
  assert.equal(de(bien, "sede-que-no-existe").length, 0);
});

test("ymyl: una raya larga, una raya corta o una comilla tipografica dentro del copy falla", () => {
  for (const texto of [
    "La hernia duele — y a veces mucho.",
    "La hernia duele – y a veces mucho.",
    'El doctor dijo “esto se opera” y lo explicó.',
  ]) {
    const r = revisar(pagina([seccion({ parrafos: [texto] })]));
    assert.ok(de(r, "raya-o-comilla").length >= 1, `no se detecto: ${texto}`);
  }

  const bien = revisar(
    pagina([seccion({ parrafos: ['La hernia duele, y a veces mucho. El doctor dijo "se opera".'] })]),
  );
  assert.equal(de(bien, "raya-o-comilla").length, 0);
});

test("ymyl: la prosa heredada fuera de la region de copy no hace fallar nada", () => {
  // `url-map.jsonl` trae doce rayas largas en campos de justificacion escritos en la fase 14, y
  // esa prosa entra al paquete como procedencia. Una regla sin region fallaria por texto que
  // esta fase no escribio, y la presion seria aflojar la regla en vez de acotarla.
  const documento = [
    "# Paquete on-page: /servicios/hernia-discal",
    "",
    "Justificación heredada de la fase 14 — con su raya larga y sus “comillas” de entonces.",
    "",
    COPY_INICIO,
    "",
    "## Qué es la hernia discal",
    "",
    "El disco se desplaza y presiona una raíz nerviosa. Eso duele.",
    "",
    COPY_FIN,
    "",
    "Otra nota heredada — también con raya larga.",
  ].join("\n");

  assert.equal(de(revisarDocumento("/servicios/hernia-discal", documento), "raya-o-comilla").length, 0);

  const region = regionDeCopy(documento);
  assert.ok(region !== null && !region.includes("heredada"), "la region no debe traer lo de afuera");
});

test("ymyl: un emoji dentro de la region de copy hace fallar la compuerta", () => {
  const mal = revisar(pagina([seccion({ parrafos: ["La consulta dura media hora 🙂"] })]));
  assert.equal(de(mal, "emoji").length, 1);

  const bien = revisar(pagina([seccion({ parrafos: ["La consulta dura media hora."] })]));
  assert.equal(de(bien, "emoji").length, 0);
});

test("ymyl: una muletilla del diccionario falla nombrando la muletilla y la URL", () => {
  const tells = tellsDeIa();
  assert.ok(tells.length >= 20, `el diccionario tiene ${tells.length} muletillas`);

  const mal = revisar(
    pagina([seccion({ parrafos: ["Cabe destacar que el disco se desplaza hacia afuera."] })]),
  );
  const hallazgo = mal.find((h) => h.regla === "muletilla");
  assert.ok(hallazgo !== undefined);
  assert.equal(hallazgo.url, "/servicios/hernia-discal");
  assert.ok(hallazgo.texto.includes("cabe destacar"), hallazgo.texto);

  const bien = revisar(pagina([seccion({ parrafos: ["El disco se desplaza hacia afuera."] })]));
  assert.equal(de(bien, "muletilla").length, 0);
});

test("ymyl: un cuerpo que no llega a su minimo de palabras hace fallar la compuerta", () => {
  const corto = revisar(pagina([seccion({ parrafos: ["Muy corto."] })], 500));
  assert.equal(de(corto, "extension").length, 1);

  const largo = revisar(pagina([seccion({ parrafos: ["palabra ".repeat(600)] })], 500));
  assert.equal(de(largo, "extension").length, 0);
});

test("ymyl: un ritmo de oraciones demasiado parejo hace fallar la compuerta", () => {
  // Todas las oraciones del mismo largo es la firma mas visible de un texto generado, y la que
  // ningun diccionario de muletillas caza. Se mide con la desviacion estandar del largo.
  const parejo = "El disco se desplaza afuera. La raiz nerviosa recibe presion. El dolor baja pierna. La fuerza puede perderse. El estudio confirma todo.";
  assert.ok(de(revisar(pagina([seccion({ parrafos: [parejo] })])), "ritmo").length >= 1);

  const variado =
    "Duele. Entre una vértebra y otra hay un disco intervertebral que funciona como amortiguador y como bisagra, con una capa externa firme y un núcleo interno gelatinoso. Cuando esa capa se rompe, parte del núcleo se desplaza. No siempre duele. El problema aparece cuando ese material presiona una raíz nerviosa y el dolor empieza a bajar por la pierna, con hormigueo y a veces con pérdida de fuerza.";
  assert.equal(de(revisar(pagina([seccion({ parrafos: [variado] })])), "ritmo").length, 0);
  assert.equal(RITMO_MINIMO, 6);
});

test("ymyl: una afirmacion pasa por las mismas reglas que un parrafo", () => {
  // Las afirmaciones se publican: van a la tabla del paquete y al documento del doctor, y las
  // dos tablas quedan fuera de la region de copy, asi que revisarDocumento no las alcanza.
  const afirmaciones = [
    { texto: "Atiende en Montefiori — con “excelencia” 🙂 desde 2015.", fuente: "Un respaldo." },
  ];
  const hallazgos = revisar(pagina([seccion({ afirmaciones })]));

  assert.equal(de(hallazgos, "sede-que-no-existe").length, 1);
  assert.ok(de(hallazgos, "raya-o-comilla").length >= 1);
  assert.equal(de(hallazgos, "emoji").length, 1);
});

test("ymyl: un encabezado escrito en mayusculas de titulo hace fallar la compuerta", () => {
  const mal = revisar(pagina([seccion({ titulo: "Diagnóstico Precoz De La Hernia Discal" })]));
  assert.equal(de(mal, "titulo-en-mayusculas").length, 1);

  const bien = revisar(pagina([seccion({ titulo: "Diagnóstico precoz de la hernia discal" })]));
  assert.equal(de(bien, "titulo-en-mayusculas").length, 0);

  const corto = revisar(pagina([seccion({ titulo: "Hernia Discal" })]));
  assert.equal(de(corto, "titulo-en-mayusculas").length, 0, "menos de cuatro palabras no se juzga");
});

test("ymyl: la guia ya aprobada por Juan pasa la compuerta sin un solo hallazgo", () => {
  const paginas = paginasParaRevisar();
  assert.ok(paginas.length > 0, "no hay copy redactado que revisar");

  for (const p of paginas) {
    const hallazgos = revisar(p);
    assert.deepEqual(hallazgos, [], `${p.url}: ${JSON.stringify(hallazgos, null, 1)}`);
  }
});
