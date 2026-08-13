import assert from "node:assert/strict";
import { test } from "node:test";

import type { FilaDeOnPage } from "./metadatos.js";
import type { FormatoDePagina, PaqueteDeUrl } from "./model.js";
import type { PaqueteCorto } from "./paquete.js";
import {
  COPY_FIN,
  COPY_INICIO,
  SELLO_PENDIENTE,
  queHacerCon,
  renderHandoff,
  renderPaquete,
  renderPaqueteCorto,
} from "./paquete.js";

/**
 * Paquete minimo con las dos clases de seccion que existen: una clinica y una operativa.
 *
 * Es fixture a proposito y no la captura real: lo que se prueba aca es el renderizador, y
 * atarlo al copy real haria fallar esta prueba cada vez que alguien corrija una coma.
 */
const PAQUETE: PaqueteDeUrl = {
  fila: {
    url: "/servicios/hernia-discal",
    accion: "reescribir",
    keywordPrimaria: "hernia discal",
    title: "Hernia discal: sintomas, diagnostico y tratamiento",
    metaDescription: "Que es una hernia discal y cuando se plantea la cirugia.",
    h1: "Hernia discal",
    h1Origen: "Repite la primaria literal porque la SERP la premia asi.",
    redirigeA: null,
  },
  formato: "guia-clinica",
  minimoDePalabras: 1400,
  secundarias: ["ciatica o hernia discal"],
  jerarquia: [
    { nivel: 2, texto: "Que es la hernia discal", origen: "esqueleto", literal: null, seccion: "que-es" },
    { nivel: 2, texto: "Como agendar", origen: "esqueleto", literal: null, seccion: "agendar" },
  ],
  entidades: [
    { termino: "disco intervertebral", documentos: 5, de: 7, posiciones: [1, 2, 4, 5, 6], clase: "anatomica" },
  ],
  entidadesInsuficientes: false,
  umbralAplicado: 0.4,
  coberturaDeSecundarias: [{ keyword: "ciatica o hernia discal", cubiertaPor: "Que es la hernia discal" }],
  coberturaDeRelacionadas: [{ busqueda: "hernia discal lumbar", cubiertaPor: "Que es la hernia discal" }],
  preguntasSinUsar: [],
  secciones: [
    {
      clave: "que-es",
      nivel: 2,
      titulo: "Que es la hernia discal",
      tipo: "clinico",
      aprobacion: "pendiente-doctor",
      parrafos: ["Entre una vertebra y otra hay un disco que amortigua la carga."],
      afirmaciones: [],
      keywordsCubiertas: ["ciatica o hernia discal"],
      entidadesCubiertas: ["disco intervertebral"],
    },
    {
      clave: "agendar",
      nivel: 2,
      titulo: "Como agendar",
      tipo: "operativo",
      aprobacion: "no-requiere",
      parrafos: ["La cita se agenda por WhatsApp desde cualquier pagina del sitio."],
      afirmaciones: [],
      keywordsCubiertas: [],
      entidadesCubiertas: [],
    },
  ],
  guiaParaElDoctor: "Leer primero la seccion de que es, que sostiene el resto del texto.",
  fuente: {
    keyword: "hernia discal",
    organicos: 7,
    preguntas: 4,
    relacionadas: 8,
    capturadaEn: "2026-08-10T22:15:03.914Z",
  },
};

/** Una URL que se queda publicada y de la que solo cambian el title y la meta (D-06). */
const FILA_QUE_SE_QUEDA: FilaDeOnPage = {
  url: "/agendar",
  accion: "dejar",
  keywordPrimaria: null,
  title: "Agendar una cita con el Dr. Angulo",
  titleLargo: 34,
  metaDescription: "Como pedir cita en cada sede, por WhatsApp o por la central de citas.",
  metaLargo: 69,
  h1: "Agendar cita",
  h1Origen: "publicado",
  origenDelH1: "Transcrito del sitio publicado, sin cambiarlo. src/app/agendar/page.tsx:33",
  keywordAlFrente: null,
  redirigeA: null,
  formato: null,
};

/** Una URL que se apaga con un 301 hacia su guia (D-07). */
const FILA_QUE_REDIRIGE: FilaDeOnPage = {
  url: "/blog/estenosis-espinal-que-es",
  accion: "redirigir",
  keywordPrimaria: null,
  title: null,
  titleLargo: null,
  metaDescription: null,
  metaLargo: null,
  h1: null,
  h1Origen: null,
  origenDelH1:
    "La URL se apaga con un 301 hacia /servicios/estenosis-espinal y no recibe title, meta ni " +
    "H1 propios (D-07). El paquete que hay que implementar es el del destino.",
  keywordAlFrente: null,
  redirigeA: "/servicios/estenosis-espinal",
  formato: null,
};

const CORTO_QUE_SE_QUEDA: PaqueteCorto = {
  fila: FILA_QUE_SE_QUEDA,
  // Con su raya larga: es prosa de la fase 14 y entra al paquete como procedencia.
  motivoSinPrimaria:
    "Es el final del embudo y no tiene cabeza medida propia — asignarle una montaría la " +
    "canibalización que el mapa de la fase 14 cerró, y con la home como víctima.",
  queHacer: queHacerCon(FILA_QUE_SE_QUEDA),
};

const CORTO_QUE_REDIRIGE: PaqueteCorto = {
  fila: FILA_QUE_REDIRIGE,
  motivoSinPrimaria: "Se funde con la guía de estenosis espinal y redirige, así que no pelea nada.",
  queHacer: queHacerCon(FILA_QUE_REDIRIGE),
};

/** El texto entre las dos marcas. Es la unica region sobre la que mandan las reglas de escritura. */
function regionDe(documento: string): string {
  const region = documento.split(COPY_INICIO)[1]?.split(COPY_FIN)[0];
  assert.ok(region !== undefined, "el documento no trae las dos marcas de copy");
  return region;
}

/** Devuelve el bloque de una seccion del documento, desde su encabezado hasta el siguiente. */
function bloqueDe(documento: string, titulo: string): string {
  const desde = documento.indexOf(`## ${titulo}`);
  assert.ok(desde !== -1, `el documento no trae la seccion "${titulo}"`);
  const resto = documento.slice(desde + 3);
  const siguiente = resto.indexOf("\n## ");
  return siguiente === -1 ? resto : resto.slice(0, siguiente);
}

test("paquete: una seccion clinica sale sellada y una operativa no", () => {
  // El sello es lo que separa un paquete bien armado de uno mal armado (D-08). Si v1.1
  // encuentra texto clinico sin sello, el error no es de formato: publico contenido medico
  // que nadie con formacion reviso.
  const documento = renderPaquete(PAQUETE);

  assert.ok(
    bloqueDe(documento, "Que es la hernia discal").includes(SELLO_PENDIENTE),
    "la seccion clinica tiene que llevar el sello de pendiente de aprobacion del doctor",
  );
  assert.ok(
    !bloqueDe(documento, "Como agendar").includes(SELLO_PENDIENTE),
    "una direccion o un horario no necesita ojo clinico y sellarlo diluye el sello",
  );
});

test("paquete: la region de copy queda delimitada y solo contiene el texto que escribimos", () => {
  // Las reglas de humanizacion se aplican a lo que escribimos, no a la prosa heredada de los
  // datasets de la fase 14, que trae rayas largas que este plan no puso ni va a tocar.
  const documento = renderPaquete(PAQUETE);
  const region = documento.split(COPY_INICIO)[1]?.split(COPY_FIN)[0] ?? "";

  assert.ok(region.includes("disco que amortigua la carga"), "el copy vive dentro de la region");
  assert.equal(
    (region.match(/[—–“”‘’]/g) ?? []).length,
    0,
    "dentro de la region de copy no hay rayas largas ni comillas tipograficas",
  );
});

test("paquete: dos renderizados del mismo dataset producen el mismo texto", () => {
  // El documento se regenera, no se edita (D-12). Si dos corridas difirieran, cualquier
  // correccion hecha a mano sobreviviria hasta la siguiente y despues desapareceria.
  assert.equal(renderPaquete(PAQUETE), renderPaquete(PAQUETE));
  assert.equal(renderPaqueteCorto(CORTO_QUE_SE_QUEDA), renderPaqueteCorto(CORTO_QUE_SE_QUEDA));
});

test("paquete: los cuatro tipos de documento comparten cabecera y cada uno se nombra", () => {
  // Quien implementa abre el archivo de su URL y lo primero que necesita saber es que clase de
  // documento tiene delante. Si la cabecera cambiara de forma entre tipos habria que aprender
  // cuatro documentos en vez de uno.
  const formatos: readonly [FormatoDePagina, string][] = [
    ["guia-clinica", "guía clínica"],
    ["pagina-de-servicio", "página de servicio"],
    ["ficha-de-sede", "ficha de sede"],
  ];

  for (const [formato, nombre] of formatos) {
    const documento = renderPaquete({ ...PAQUETE, formato });
    assert.ok(documento.startsWith(`# Paquete on-page: ${PAQUETE.fila.url}\n`), formato);
    assert.ok(documento.includes("## Qué hay que hacer con esta URL"), formato);
    assert.ok(documento.includes(`| Formato | ${nombre} |`), `${formato}: falta el rótulo`);
  }

  const corto = renderPaqueteCorto(CORTO_QUE_SE_QUEDA);
  assert.ok(corto.startsWith("# Paquete on-page: /agendar\n"));
  assert.ok(corto.includes("## Qué hay que hacer con esta URL"));
  assert.ok(corto.includes("| Formato | documento corto |"));
});

test("paquete: una URL que solo lleva title y meta recibe el corto, sin cuerpo inventado", () => {
  // Las 6 que declararon no competir no reciben copy (D-06): redactarles cuerpo seria
  // inventarles una intencion que el mapa decidio que no tienen.
  const documento = renderPaqueteCorto(CORTO_QUE_SE_QUEDA);

  assert.ok(documento.includes("| Title | Agendar una cita con el Dr. Angulo | 34 / 60 |"));
  assert.ok(documento.includes("| H1 | Agendar cita | publicado |"));
  assert.ok(!documento.includes("## Copy propuesto"), "el corto no lleva copy");
  assert.ok(!documento.includes(SELLO_PENDIENTE), "sin copy clinico no hay nada que sellar");
  assert.equal(
    regionDe(documento).split("\n").filter((l) => l.trim() !== "").length,
    2,
    "el corto dice en dos líneas qué hacer con la URL (D-14)",
  );
});

test("paquete: una URL que se apaga con un 301 dice hacia dónde va", () => {
  // El paquete existe igual porque quien abra esa URL tiene que encontrar la instruccion y no
  // un hueco (D-07). Sin el destino escrito, la instruccion no sirve para nada.
  const documento = renderPaqueteCorto(CORTO_QUE_REDIRIGE);

  assert.ok(documento.includes("/servicios/estenosis-espinal"), "falta el destino del 301");
  assert.ok(documento.includes("301"), "falta decir que la redirección es un 301");
  assert.ok(!documento.includes("## Title, meta y H1"), "una URL que se apaga no recibe title");
  assert.equal(
    regionDe(documento).split("\n").filter((l) => l.trim() !== "").length,
    2,
    "también son dos líneas",
  );
});

test("paquete: el documento de un 301 dice qué se absorbió y en qué orden se publica", () => {
  // Redirigir sin fundir tira el contenido a la basura, y el 301 lo entierra sin dejar rastro de
  // lo que habia. La lista por bloque es lo que permite comprobar que no se perdio nada sin
  // volver a abrir el post, y el orden escrito evita que alguien ponga la redireccion primero.
  const documento = renderPaqueteCorto({
    ...CORTO_QUE_REDIRIGE,
    absorcion: [
      { origen: "sección por-que-aparece-con-la-edad", destino: "causas" },
      { origen: "sección como-se-trata", destino: "sin-operar" },
    ],
  });

  assert.ok(documento.includes("primero se publica la guía de destino"), "falta el orden");
  assert.ok(documento.includes("| sección como-se-trata | sin-operar |"), "falta el destino");
  assert.ok(
    !renderPaqueteCorto(CORTO_QUE_SE_QUEDA).includes("Qué se absorbió"),
    "una URL que se queda no absorbe nada de nadie",
  );
});

test("paquete: el documento corto trae las dos marcas para que la compuerta pueda correrlo", () => {
  // La compuerta de ymyl.ts devuelve `region-ausente` si un documento no las trae. Los cuatro
  // tipos las llevan para que la wave 3 corra la compuerta sobre cualquiera sin caso especial.
  for (const corto of [CORTO_QUE_SE_QUEDA, CORTO_QUE_REDIRIGE]) {
    const documento = renderPaqueteCorto(corto);
    assert.ok(documento.includes(COPY_INICIO), corto.fila.url);
    assert.ok(documento.includes(COPY_FIN), corto.fila.url);
  }
});

test("paquete: ningún tipo de documento ensucia su región de copy, y lo heredado queda afuera", () => {
  // El generador no emite rayas largas ni comillas tipograficas dentro de la region, ni siquiera
  // en los rotulos que el mismo escribe. El motivo de la fase 14 trae una raya larga y por eso
  // va afuera: acotar la region es lo que deja sostener la regla sin aflojarla.
  const documentos = [
    renderPaquete(PAQUETE),
    renderPaqueteCorto(CORTO_QUE_SE_QUEDA),
    renderPaqueteCorto(CORTO_QUE_REDIRIGE),
  ];

  for (const documento of documentos) {
    assert.equal((regionDe(documento).match(/[—–“”‘’]/g) ?? []).length, 0);
  }

  const conMotivo = renderPaqueteCorto(CORTO_QUE_SE_QUEDA);
  assert.ok(conMotivo.includes("canibalización que el mapa de la fase 14 cerró"), "falta el motivo");
  assert.ok(!regionDe(conMotivo).includes("canibalización"), "el motivo heredado va fuera");
});

test("paquete: el enlazado de la fase 14 viaja adentro y dice que lo implementa v1.1", () => {
  // Quien abre el paquete de una URL tiene que encontrar ahi su enlazado y no ir a buscar
  // 14-ENLAZADO.md (D-14). Y tiene que quedar escrito que se propone: escribir los enlaces en
  // el codigo del sitio es trabajo de v1.1, no de este workstream.
  const documento = renderPaquete({
    ...PAQUETE,
    enlacesPropuestos: [
      { destino: "/servicios", anchor: "cirujano de columna lima", regla: "navegacion-de-seccion" },
      { destino: "/agendar", anchor: "Agendar cita", regla: "hacia-conversion" },
    ],
  });

  assert.ok(documento.includes("## Enlaces internos propuestos"), "falta el bloque");
  assert.ok(documento.includes("los implementa v1.1"), "falta decir quién los escribe");
  assert.ok(
    documento.includes("| 2 | `/agendar` | Agendar cita | hacia-conversion |"),
    "falta el destino con su anchor y su regla",
  );
  assert.ok(!regionDe(documento).includes("Enlaces internos"), "la tabla generada va fuera del copy");
  assert.ok(
    !renderPaquete(PAQUETE).includes("## Enlaces internos propuestos"),
    "una URL sin fila en la matriz no estrena una sección vacía",
  );
});

test("paquete: un post del blog trae el mapeo del copy a la estructura de post", () => {
  // Es el bloque propio de los cuatro posts. Sin el, implementar una entrada de `blogPosts`
  // obliga a decidir de nuevo que parte del copy es `intro` y cual una `subsection`, que es la
  // decision que ya se tomo al redactar. Va fuera de la region de copy porque es tabla generada.
  const documento = renderPaquete({
    ...PAQUETE,
    mapeoDePost: [
      { campo: "slug", deDonde: "La ruta publicada sin el prefijo del blog." },
      { campo: "sections[].id", deDonde: "El `clave` de cada seccion H2 del copy." },
    ],
  });

  assert.ok(documento.includes("## Cómo entra este copy en la estructura de post"), "falta el bloque");
  assert.ok(
    documento.includes("| `sections[].id` | El `clave` de cada seccion H2 del copy. |"),
    "falta el campo con su procedencia",
  );
  assert.ok(!regionDe(documento).includes("estructura de post"), "la tabla generada va fuera del copy");
  assert.ok(
    !renderPaquete(PAQUETE).includes("## Cómo entra este copy"),
    "una URL que no es un post no estrena una sección vacía",
  );
});

test("paquete: la cabecera nombra el dataset del que salió el copy", () => {
  // Las familias de la wave 3 escriben en archivos distintos y el generador los recibe con
  // --data. Si la cabecera dijera siempre copy-guias.json, el documento mentiria sobre su
  // propia procedencia y quien quisiera corregir una frase abriria el archivo equivocado.
  const documento = renderPaquete(PAQUETE, "data/copy-servicios.json");

  assert.ok(documento.includes("desde data/copy-servicios.json y las capturas"), "falta la ruta");
  assert.ok(
    renderPaquete(PAQUETE).includes("desde data/copy-guias.json y las capturas"),
    "el dataset de las guías sigue siendo el valor por defecto",
  );
});

test("paquete: una ficha de sede separa los datos operativos respaldados de los pendientes", () => {
  // Es el bloque propio de las cuatro sedes y no lo necesita ninguna otra familia. Va separado
  // en dos tablas a proposito: si un horario sin confirmar se mezclara con los respaldados,
  // v1.1 lo publicaria sin notarlo y mandaria a alguien a una puerta que no abre a esa hora.
  const documento = renderPaquete({
    ...PAQUETE,
    formato: "ficha-de-sede",
    notaDeFormato: "La SERP de esta keyword no tiene formato dominante y el de ficha se eligió por coherencia.",
    datosOperativos: [
      {
        dato: "Dirección",
        valor: "Av. El Derby 254",
        estado: "respaldado",
        fuente: "src/content/locations.ts, entrada consultorio-privado.",
      },
      {
        dato: "Estacionamiento",
        valor: "sin dato publicado",
        estado: "pendiente",
        fuente: "No está en ninguna fuente publicada del sitio.",
      },
    ],
  });

  assert.ok(documento.includes("## Datos operativos de la sede"), "falta el bloque de la sede");
  assert.ok(documento.includes("Av. El Derby 254"), "falta el dato respaldado con su valor");
  assert.ok(
    documento.includes("### Pendientes de confirmación antes de publicar"),
    "los pendientes no tienen tabla propia",
  );
  assert.ok(documento.includes("Estacionamiento"), "falta el pendiente");
  assert.ok(
    documento.includes("no tiene formato dominante"),
    "la nota de formato no llegó al documento",
  );
  assert.ok(
    !regionDe(documento).includes("## Datos operativos de la sede"),
    "es tabla generada y va fuera de la región de copy",
  );
  assert.ok(
    !renderPaquete(PAQUETE).includes("## Datos operativos de la sede"),
    "una guía clínica sin datos operativos no estrena una sección vacía",
  );
});

/**
 * Las cuatro acciones que el mapa reparte, una fila de cada una. Es fixture y no el dataset real
 * por el mismo motivo que el resto del archivo: lo que se prueba es el renderizador del handoff.
 */
const FILA_QUE_SE_REESCRIBE: FilaDeOnPage = {
  url: "/servicios/hernia-discal",
  accion: "reescribir",
  keywordPrimaria: "hernia discal",
  title: "Hernia discal: síntomas, diagnóstico y tratamiento",
  titleLargo: 50,
  metaDescription: "Qué es una hernia discal y cuándo se plantea la cirugía.",
  metaLargo: 56,
  h1: "Hernia discal",
  h1Origen: "propuesto",
  origenDelH1: "Repite la primaria literal porque la SERP la premia así.",
  keywordAlFrente: 0,
  redirigeA: null,
  formato: "guia-clinica",
};

const FILA_POR_CREAR: FilaDeOnPage = {
  url: "/sedes/consultorio-privado",
  accion: "crear",
  keywordPrimaria: "traumatólogo surco",
  title: "Traumatólogo en Surco: consultorio del Dr. Angulo",
  titleLargo: 49,
  metaDescription: "Consulta de traumatología y columna en Surco, viernes y sábados.",
  metaLargo: 64,
  h1: "Traumatólogo en Surco",
  h1Origen: "propuesto",
  origenDelH1: "La URL no existe todavía, así que el H1 se propone entero.",
  keywordAlFrente: 0,
  redirigeA: null,
  formato: "ficha-de-sede",
};

const FILAS_DEL_HANDOFF: readonly FilaDeOnPage[] = [
  FILA_QUE_SE_REESCRIBE,
  FILA_QUE_SE_QUEDA,
  FILA_POR_CREAR,
  FILA_QUE_REDIRIGE,
];

const PENDIENTES_DEL_HANDOFF = [
  { url: "/sedes/consultorio-privado", dato: "Estacionamiento del edificio y sus tarifas" },
];

test("handoff: las seis secciones salen en el orden en que v1.1 las tiene que leer", () => {
  // El orden no es cosmético. Quien recibe esto decide primero qué implementar y recién después
  // con qué texto: un handoff que arranca por la restricción hace que se lea la mitad.
  const documento = renderHandoff(FILAS_DEL_HANDOFF, PENDIENTES_DEL_HANDOFF);

  const secciones = [
    "## 1. Qué se entrega y dónde",
    "## 2. Para la fase 10",
    "## 3. Para la fase 8",
    "## 4. El orden que no se puede invertir",
    "## 5. La restricción que sigue viva",
    "## 6. Lo que este handoff NO resuelve",
  ];

  let anterior = -1;
  for (const seccion of secciones) {
    const donde = documento.indexOf(seccion);
    assert.ok(donde !== -1, `falta la sección "${seccion}"`);
    assert.ok(donde > anterior, `la sección "${seccion}" quedó fuera de orden`);
    anterior = donde;
  }
});

test("handoff: la tabla de la fase 10 lleva la metadata y deja afuera lo que se apaga", () => {
  const documento = renderHandoff(FILAS_DEL_HANDOFF, PENDIENTES_DEL_HANDOFF);
  const bloque = documento.split("## 2. Para la fase 10")[1]?.split("## 3.")[0] ?? "";

  for (const fila of FILAS_DEL_HANDOFF.filter((f) => f.accion !== "redirigir")) {
    assert.ok(bloque.includes(fila.url), `la URL ${fila.url} no llegó a la tabla de la fase 10`);
    assert.ok(bloque.includes(fila.title ?? ""), `falta el title de ${fila.url}`);
    assert.ok(bloque.includes(`${fila.titleLargo ?? 0}/60`), `falta el conteo del title de ${fila.url}`);
    assert.ok(bloque.includes(`${fila.metaLargo ?? 0}/155`), `falta el conteo de la meta de ${fila.url}`);
  }

  assert.ok(
    !bloque.includes(FILA_QUE_REDIRIGE.url),
    "una URL que se apaga con un 301 no recibe title ni meta y no va en esta tabla",
  );
});

test("handoff: cada página queda clasificada en copy completo, solo metadata o se apaga", () => {
  const documento = renderHandoff(FILAS_DEL_HANDOFF, PENDIENTES_DEL_HANDOFF);
  const bloque = documento.split("## 3. Para la fase 8")[1]?.split("## 4.")[0] ?? "";

  assert.ok(bloque.includes("2 reciben copy completo"), "el conteo de copy completo no sale del dataset");
  assert.ok(bloque.includes(FILA_QUE_SE_REESCRIBE.keywordPrimaria ?? ""), "falta la primaria de la que se reescribe");
  assert.ok(bloque.includes("1 reciben solo title y meta"), "el conteo de solo metadata no sale del dataset");
  assert.ok(bloque.includes("El H1 no se toca"), "a la que solo lleva metadata no se le dice qué no tocar");
  assert.ok(bloque.includes("1 URLs por crear"), "el conteo de URLs por crear no sale del dataset");
  assert.ok(bloque.includes(FILA_QUE_REDIRIGE.redirigeA ?? ""), "la redirección no dice hacia dónde va");
  assert.ok(
    bloque.includes("escoliosis-y-deformidades"),
    "el renombre de slug que la fase 14 avisó se perdió en el traspaso",
  );
});

test("handoff: el orden de publicar la guía antes de poner el 301 queda escrito", () => {
  // Es la instrucción que evita perder contenido, y no se deduce de ninguna tabla: si no está
  // dicha con todas las letras, v1.1 pone el 301 primero porque es el paso más barato.
  const bloque =
    renderHandoff(FILAS_DEL_HANDOFF, PENDIENTES_DEL_HANDOFF)
      .split("## 4. El orden que no se puede invertir")[1]
      ?.split("## 5.")[0] ?? "";

  assert.ok(bloque.includes("absorben"), "no se dice que la guía absorbe el contenido del post");
  assert.ok(/Primero se publica la guía/.test(bloque), "no se dice qué va primero");
  assert.ok(/Recién entonces se pone el 301/.test(bloque), "no se dice qué va después");
});

test("handoff: la aprobación del doctor viaja como bloqueante para la fase 8", () => {
  // La compuerta YMYL de esta fase no sirve de nada si el sello se queda de este lado. Que el
  // handoff la nombre bloqueante es lo único que la sostiene una vez que el paquete cambia de mano.
  const bloque =
    renderHandoff(FILAS_DEL_HANDOFF, PENDIENTES_DEL_HANDOFF)
      .split("## 5. La restricción que sigue viva")[1]
      ?.split("## 6.")[0] ?? "";

  assert.ok(bloque.includes("15-REVISION-DOCTOR.md"), "no dice dónde está la ronda del doctor");
  assert.ok(bloque.includes("bloqueante para la fase 8"), "la ronda no queda declarada bloqueante");
});

test("handoff: lo que queda sin resolver se nombra dato por dato", () => {
  const bloque =
    renderHandoff(FILAS_DEL_HANDOFF, PENDIENTES_DEL_HANDOFF)
      .split("## 6. Lo que este handoff NO resuelve")[1] ?? "";

  for (const pendiente of PENDIENTES_DEL_HANDOFF) {
    assert.ok(bloque.includes(pendiente.dato), `el pendiente "${pendiente.dato}" no quedó listado`);
    assert.ok(bloque.includes(pendiente.url), `el pendiente de ${pendiente.url} no dice de qué sede es`);
  }

  assert.ok(bloque.includes("enlaces internos"), "no dice que los enlaces internos los implementa v1.1");
});

test("handoff: dos renderizados del mismo dataset producen el mismo texto", () => {
  assert.equal(
    renderHandoff(FILAS_DEL_HANDOFF, PENDIENTES_DEL_HANDOFF),
    renderHandoff(FILAS_DEL_HANDOFF, PENDIENTES_DEL_HANDOFF),
  );
});
