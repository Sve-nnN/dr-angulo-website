import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LARGO_DE_META,
  LARGO_DE_TITLE,
  construirOnPage,
  copyRedactado,
  extraerH1,
  filaDeOnPage,
  primariasDelMapa,
  tituloYMeta,
} from "./metadatos.js";
import { PaqueteInvalido } from "./model.js";

const VALIDA = {
  url: "/servicios/hernia-discal",
  keywordPrimaria: "hernia discal",
  title: "Hernia discal: sintomas, diagnostico y tratamiento",
  metaDescription:
    "Que es una hernia discal, que sintomas produce, como se confirma y cuando se plantea la cirugia. Guia del consultorio de columna en Lima.",
  h1: "Hernia discal",
  h1Origen: "Repite la keyword primaria sin adornos porque la SERP la premia literal.",
};

test("metadatos: el title y la meta respetan el contrato de la fase 10 de v1.1", () => {
  // 60 y 155 no son gusto: son los limites que v1.1 ya verifica del otro lado (D-13).
  // Entregar fuera de rango obliga a reescribirlo alla, que es el trabajo duplicado que
  // esta fase existe para evitar.
  const r = tituloYMeta(VALIDA);

  assert.ok(r.title.length <= LARGO_DE_TITLE, `title de ${r.title.length} caracteres`);
  assert.ok(
    r.metaDescription.length <= LARGO_DE_META,
    `meta de ${r.metaDescription.length} caracteres`,
  );
  assert.equal(r.largoDeTitle, r.title.length);
  assert.equal(r.largoDeMeta, r.metaDescription.length);
});

test("metadatos: todos los tokens de la primaria estan en el title y el primero va al frente", () => {
  // La comprobacion es por tokens y sin tildes porque en espanol la keyword se parte con
  // preposiciones al escribirla natural: "cirugia de columna" cabe como "cirugia minimamente
  // invasiva de columna" y sigue sirviendo la misma keyword.
  const r = tituloYMeta(VALIDA);

  assert.equal(r.tokensDeLaPrimaria.length, 2);
  assert.ok(r.primeraTokenEn >= 0 && r.primeraTokenEn <= 12, `arranca en ${r.primeraTokenEn}`);
});

test("metadatos: un title fuera de contrato falla nombrando el campo y el excedente", () => {
  // Fallar ruidoso importa mas que fallar: un title de 74 caracteres se publica igual y
  // Google lo corta, asi que nadie se entera hasta que el snippet ya salio mal.
  assert.throws(
    () =>
      tituloYMeta({
        ...VALIDA,
        title:
          "Hernia discal en Lima: sintomas, causas, diagnostico, tratamiento y cuando operar",
      }),
    PaqueteInvalido,
  );

  assert.throws(
    () => tituloYMeta({ ...VALIDA, title: "Guia de columna: cuando operar y cuando no" }),
    PaqueteInvalido,
  );

  assert.throws(
    () =>
      tituloYMeta({
        ...VALIDA,
        title: "Guia clinica de columna para pacientes: hernia discal",
      }),
    PaqueteInvalido,
  );
});

const n = (s: string): string => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const DATASET = construirOnPage();
const FILAS = DATASET.filas;

test("metadatos: las 22 URLs vivas traen title y meta, y las 2 que redirigen salen sin ellos", () => {
  // Las que redirigen existen igual como fila. Quien abra `/blog/estenosis-espinal-que-es`
  // tiene que encontrar la instruccion del 301 y no un hueco (D-07). Borrarlas del dataset
  // haria que la ausencia se leyera como olvido, que es justo lo que la fase 14 prohibio.
  assert.equal(FILAS.length, 24);

  const vivas = FILAS.filter((f) => f.accion !== "redirigir");
  assert.equal(vivas.length, 22);
  for (const fila of vivas) {
    assert.ok(fila.title !== null && fila.title.trim() !== "", `${fila.url} sin title`);
    assert.ok(
      fila.metaDescription !== null && fila.metaDescription.trim() !== "",
      `${fila.url} sin meta`,
    );
  }

  const redirigen = FILAS.filter((f) => f.accion === "redirigir");
  assert.equal(redirigen.length, 2);
  for (const fila of redirigen) {
    assert.equal(fila.title, null, `${fila.url} recibio title y no le toca`);
    assert.equal(fila.metaDescription, null);
    assert.ok(fila.redirigeA !== null && fila.redirigeA.startsWith("/"), `${fila.url} sin destino`);
  }
});

test("metadatos: ningun title pasa de 60 caracteres y ninguna meta de 155", () => {
  // El contrato con la fase 10 de v1.1 (D-13). Entregar fuera de rango obliga a reescribirlo
  // del otro lado, que es el trabajo duplicado que esta fase existe para evitar.
  for (const fila of FILAS) {
    if (fila.title !== null) {
      assert.ok(fila.title.length <= LARGO_DE_TITLE, `${fila.url}: title de ${fila.title.length}`);
      assert.equal(fila.titleLargo, fila.title.length);
    }
    if (fila.metaDescription !== null) {
      assert.ok(
        fila.metaDescription.length <= LARGO_DE_META,
        `${fila.url}: meta de ${fila.metaDescription.length}`,
      );
      assert.equal(fila.metaLargo, fila.metaDescription.length);
    }
  }
});

test("metadatos: las 16 que compiten llevan la primaria entera y su primera palabra al frente", () => {
  const compiten = FILAS.filter((f) => f.keywordPrimaria !== null);
  assert.equal(compiten.length, 16);

  for (const fila of compiten) {
    const title = n(fila.title as string);
    const tokens = n(fila.keywordPrimaria as string)
      .split(/\s+/)
      .filter((t) => t.length >= 3);
    for (const token of tokens) {
      assert.ok(title.includes(token), `${fila.url}: el title no nombra "${token}"`);
    }
    assert.ok(
      fila.keywordAlFrente !== null && fila.keywordAlFrente <= 12,
      `${fila.url}: la primaria arranca en el caracter ${String(fila.keywordAlFrente)}`,
    );
  }
});

test("metadatos: ninguna de las 6 sin primaria toma en su title la primaria de otra URL", () => {
  // El mapa midio que si `/sedes` o `/contacto` pelearan un termino se lo quitarian a la home
  // o a las cuatro sedes. Reintroducir esa canibalizacion por el title seria deshacer la fase
  // 14 sin dato nuevo y sin que nadie se entere.
  const primarias = primariasDelMapa().map(n);
  const sinPrimaria = FILAS.filter((f) => f.accion === "dejar");
  assert.equal(sinPrimaria.length, 6);

  for (const fila of sinPrimaria) {
    const title = n(fila.title as string);
    for (const primaria of primarias) {
      assert.ok(!title.includes(primaria), `${fila.url} se lleva la primaria "${primaria}"`);
    }
  }
});

test("metadatos: el H1 de las 16 que compiten es propuesto y no repite el title", () => {
  for (const fila of FILAS.filter((f) => f.keywordPrimaria !== null)) {
    assert.equal(fila.h1Origen, "propuesto", `${fila.url}`);
    assert.ok(fila.h1 !== null && fila.h1.trim() !== "", `${fila.url} sin H1`);
    assert.notEqual(
      n(fila.h1 as string),
      n(fila.title as string),
      `${fila.url}: el H1 repite el title palabra por palabra y son dos piezas con trabajos distintos`,
    );
    assert.ok((fila.origenDelH1 as string).length > 40, `${fila.url}: el motivo del H1 es una etiqueta`);
  }
});

test("metadatos: el H1 de las 6 sin primaria se transcribe del sitio con archivo y linea", () => {
  // Proponerles un H1 nuevo reabriria una decision de la fase 14 sin dato nuevo. Se lee y se
  // copia, y queda escrito de donde salio para que v1.1 pueda comprobarlo en dos segundos.
  const sinPrimaria = FILAS.filter((f) => f.accion === "dejar");

  for (const fila of sinPrimaria) {
    assert.notEqual(fila.h1Origen, "propuesto", `${fila.url}: se le propuso H1 y no le toca`);
    assert.equal(fila.h1Origen, "publicado", `${fila.url}`);
    assert.match(fila.origenDelH1 as string, /:\d+$/, `${fila.url}: el origen no declara linea`);
    assert.ok(fila.h1 !== null && fila.h1.trim() !== "", `${fila.url} sin H1 transcrito`);
  }
});

test("metadatos: una URL sin H1 localizable sale como ausente y no con uno inventado", () => {
  // Inventarle un H1 a una pagina que no lo tiene la publicaria con un encabezado que nadie
  // decidio. Vale mas una fila que dice "no lo encontre y por esto" que un dato fabricado.
  assert.equal(extraerH1("<section><p>sin encabezado</p></section>"), null);
  assert.equal(extraerH1("<h1 className=\"x\">{titulo}</h1>"), null);

  const encontrado = extraerH1("uno\ndos\n<h1 className=\"x\">\n  Agendar cita\n</h1>\n");
  assert.deepEqual(encontrado, { texto: "Agendar cita", linea: 4 });

  const fila = filaDeOnPage({
    url: "/inexistente",
    accion: "dejar",
    keywordPrimaria: null,
    redirigeA: null,
    formato: null,
    escrito: { title: "Pagina de prueba", metaDescription: "Meta de prueba." },
    h1Publicado: null,
  });
  assert.equal(fila.h1Origen, "ausente-en-el-sitio");
  assert.equal(fila.h1, null);
  assert.ok((fila.origenDelH1 as string).length > 20, "el motivo tiene que ser prosa");
});

test("metadatos: el generador es determinista y dos corridas dan el mismo dataset", () => {
  assert.equal(JSON.stringify(construirOnPage()), JSON.stringify(construirOnPage()));
});

test("metadatos: title, meta y H1 no divergen de lo que ya esta redactado en copy-guias.json", () => {
  // Los dos datasets se escriben por separado y v1.1 lee los dos. Si divergen, la auditoria
  // del plan 15-07 daria limpia sobre uno de ellos y el sitio publicaria el otro.
  const copy = copyRedactado();
  assert.ok(copy.length > 0, "no hay ninguna URL redactada para cruzar");
  for (const pagina of copy) {
    const fila = FILAS.find((f) => f.url === pagina.url);
    assert.ok(fila !== undefined, `${pagina.url} esta en copy-guias.json y no en el mapa`);
    assert.equal(fila.title, pagina.title, `${pagina.url}: title distinto entre los dos datasets`);
    assert.equal(fila.metaDescription, pagina.metaDescription, `${pagina.url}: meta distinta`);
    assert.equal(fila.h1, pagina.h1, `${pagina.url}: H1 distinto`);
  }
});

test("metadatos: un title que no nombra la primaria falla nombrando lo que falta", () => {
  assert.throws(
    () =>
      filaDeOnPage({
        url: "/servicios/hernia-discal",
        accion: "reescribir",
        keywordPrimaria: "hernia discal",
        redirigeA: null,
        formato: "guia-clinica",
        escrito: {
          title: "Guia de columna para pacientes de Lima",
          metaDescription: "Meta cualquiera.",
          h1: "Hernia discal",
          porQueElH1: "Motivo suficientemente largo para no ser una etiqueta vacia de sentido.",
        },
        h1Publicado: null,
      }),
    PaqueteInvalido,
  );
});
