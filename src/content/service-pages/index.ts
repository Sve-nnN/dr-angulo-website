/**
 * Páginas del silo clínico: un módulo de datos por condición, una sola
 * plantilla en `src/app/servicios/[slug]/page.tsx`.
 *
 * El orden de las secciones es el orden del arreglo `sections`, que se lee de
 * arriba abajo. No hay tupla global que obligue a las ocho claves de v1.0,
 * porque el paquete on-page trae dos esqueletos distintos: la guía clínica y
 * la página de servicio. `format` declara cuál usa cada página.
 *
 * Reglas de contenido, heredadas de 08-CONTEXT.md y del contrato de la fase:
 * consenso clínico general en voz explicativa, nunca testimonial. Las
 * credenciales salen solo de `src/content/cv.ts`. Prohibido escribir cifras de
 * cirugías, tasas de éxito, plazos de recuperación garantizados o precios.
 */

import { herniaDiscal } from "./hernia-discal";
import { estenosisEspinal } from "./estenosis-espinal";
import { escoliosisYDeformidades } from "./escoliosis-y-deformidades";
import { ortopediaInfantil } from "./ortopedia-infantil";
import { cirugiaMinimamenteInvasiva } from "./cirugia-minimamente-invasiva";
import { assertNavIndexMatches, serviceNavItems } from "@/content/nav-index";

/**
 * Esqueleto que sigue la página. `guia-clinica` recorre la condición desde qué
 * es hasta cuándo consultar; `pagina-de-servicio` describe qué se atiende y
 * cómo se accede a la consulta.
 */
export type ServiceFormat = "guia-clinica" | "pagina-de-servicio";

/**
 * Unidad breve dentro de una sección: un rótulo y un cuerpo de una a tres
 * frases. Existe para que síntomas, complicaciones, pasos del diagnóstico y
 * etapas de la recuperación se puedan presentar como tarjetas, pasos o línea
 * de tiempo en vez de párrafos apilados.
 *
 * `body` es una cadena plana, igual que `paragraphs`: el rótulo va en el
 * `title` y el cuerpo no admite marcado, así ninguna cifra puede quedar
 * resaltada tipográficamente dentro del texto.
 */
export type ServiceSectionItem = {
  title: string;
  body: string;
};

/**
 * Sección de contenido, plana. El nivel 3 no cuelga de una propiedad
 * `subsections`: es otro elemento del mismo arreglo con `level: 3`, colocado
 * justo después de la sección de nivel 2 a la que pertenece.
 *
 * El `id` se escribe a mano en los datos y no se deriva del título en tiempo
 * de render: es un ancla compartible, y un cambio de redacción no puede romper
 * un enlace que alguien ya mandó por WhatsApp. La convención para el nivel 3 es
 * `{idDelPadre}--{titulo-en-kebab-case-sin-tildes}`.
 *
 * `paragraphs` son cadenas planas sin marcado: así ninguna cifra puede quedar
 * resaltada tipográficamente dentro del cuerpo.
 */
/**
 * Fuente externa que respalda una afirmación concreta de la página (TRUST-02).
 *
 * Es contenido YMYL firmado por un médico real, así que las tres reglas de este
 * tipo no son estilo: una cita rota es peor que ninguna cita, y una cita que
 * respalda algo que el texto no dice es una afirmación puesta de contrabando.
 */
export type ServiceCitation = {
  /**
   * Nombre publicable, organización más documento. Es el texto del enlace, así
   * que se lee solo: nunca "hacer clic acá" ni el dominio pelado.
   */
  source: string;
  /**
   * Una frase que nombra la afirmación de ESTA página que la fuente respalda.
   * Ninguna cita es decorativa. Si la fuente dice más que el texto, se cita
   * igual y el texto no se amplía para alcanzarla.
   */
  supports: string;
  /**
   * URL absoluta https, verificada como resoluble antes de publicarse. En los
   * dominios que responden 200 a cualquier ruta hace falta además comprobar
   * que el documento sea el que `source` nombra.
   */
  href: string;
};

export type ServiceSection = {
  id: string;
  level: 2 | 3;
  heading: string;
  paragraphs: string[];
  items?: ServiceSectionItem[];
  /** Fuentes externas de la sección "De dónde sale esto". */
  citations?: ServiceCitation[];
};

/** Enlace interno de salida hacia otra página del silo. */
export type ServiceOutboundLink = {
  href: string;
  anchor: string;
};

export type ServicePage = {
  slug: string;
  navLabel: string;
  h1: string;
  /**
   * Frase de orientación que abre la página, debajo del `h1` y dentro de la
   * banda de cabecera. Una o dos oraciones: qué encuentra el paciente acá.
   */
  heroLead: string;
  title: string;
  description: string;
  /** Resumen de la tarjeta del hub. Máximo 120 caracteres. */
  cardSummary: string;
  conditionName: string;
  alternateNames?: string[];
  publishedAt: string;
  updatedAt: string;
  format: ServiceFormat;
  ctaBanner: { heading: string; body: string };
  /**
   * `id` de la sección después de la cual va el banner de conversión. Sin
   * declarar, el banner cae después de la segunda sección con cuerpo, que es
   * donde POS-01 lo pide para el esqueleto de v1.0.
   *
   * El paquete on-page de v1.2 cuelga hasta cuatro subsecciones de nivel 3 de
   * la segunda sección, y con ese volumen el punto por defecto se corre más
   * allá del 35 por ciento del cuerpo que la puerta admite. Por eso la posición
   * pasa a ser un dato de la página y no una constante de la plantilla.
   *
   * Admite también un `id` de nivel 3, y entonces el banner va dentro del
   * `<section>` de su padre, detrás de esa subsección. En el esqueleto de
   * página de servicio hace falta: `que-se-atiende` cuelga trece subsecciones y
   * ninguna frontera de nivel 2 cae dentro de la ventana de POS-01.
   */
  bannerAfterSectionId?: string;
  /** Secciones en orden de lectura, con el nivel 3 intercalado. */
  sections: ServiceSection[];
  outboundLinks?: ServiceOutboundLink[];
  /** Slugs de `src/content/blog` que apuntan a esta condición. */
  relatedPosts: string[];
  /** Solo si la página describe efectivamente la cirugía. */
  describesSurgery: boolean;
};

export const servicePages: ServicePage[] = [
  herniaDiscal,
  estenosisEspinal,
  escoliosisYDeformidades,
  ortopediaInfantil,
  cirugiaMinimamenteInvasiva,
];

// Compuerta de sincronía con `src/content/nav-index.ts` (CWV-04). Este barril
// solo se importa desde el servidor, así que la comprobación corre en el build
// y nunca en el navegador. Ver el comentario de cabecera de `nav-index.ts`.
assertNavIndexMatches("servicio", serviceNavItems, servicePages);

export function getServicePage(slug: string | undefined): ServicePage | undefined {
  if (!slug) return undefined;
  return servicePages.find((page) => page.slug === slug);
}
