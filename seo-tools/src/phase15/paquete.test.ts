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
