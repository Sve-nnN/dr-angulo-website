import assert from "node:assert/strict";
import { test } from "node:test";

import type { PaqueteDeUrl } from "./model.js";
import { COPY_FIN, COPY_INICIO, SELLO_PENDIENTE, renderPaquete } from "./paquete.js";

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
});
