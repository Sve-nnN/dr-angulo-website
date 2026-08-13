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
import { escoliosis } from "./escoliosis";
import { ortopediaInfantil } from "./ortopedia-infantil";

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
export type ServiceSection = {
  id: string;
  level: 2 | 3;
  heading: string;
  paragraphs: string[];
  items?: ServiceSectionItem[];
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
   * `id` de la sección de nivel 2 después de la cual va el banner de
   * conversión. Sin declarar, el banner cae después de la segunda sección con
   * cuerpo, que es donde POS-01 lo pide para el esqueleto de v1.0.
   *
   * El paquete on-page de v1.2 cuelga hasta cuatro subsecciones de nivel 3 de
   * la segunda sección, y con ese volumen el punto por defecto se corre más
   * allá del 35 por ciento del cuerpo que la puerta admite. Por eso la posición
   * pasa a ser un dato de la página y no una constante de la plantilla.
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
  escoliosis,
  ortopediaInfantil,
];

export function getServicePage(slug: string | undefined): ServicePage | undefined {
  if (!slug) return undefined;
  return servicePages.find((page) => page.slug === slug);
}
