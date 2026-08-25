/**
 * Posts del blog: un módulo de datos por artículo, una sola plantilla en
 * `src/app/blog/[slug]/page.tsx`.
 *
 * Mismas reglas de contenido que las guías de servicio: consenso clínico
 * general en voz explicativa, nunca testimonial. Prohibido escribir cifras de
 * cirugías, tasas de éxito, plazos garantizados o precios.
 */

import type {
  ServicePage,
  ServiceSectionItem,
  ServiceCitation,
} from "@/content/service-pages";
import type { ProcedureApproachSlug } from "@/content/services";
import { postCiatica } from "./ciatica";
import { postCirugiaDeColumna } from "./cirugia-de-columna";
import { postArtrosis } from "./artrosis";
import { postLumbalgia } from "./lumbalgia";
import { postReumatologoOTraumatologo } from "./reumatologo-o-traumatologo";

/**
 * Sección de un post, plana y con el mismo modelo que las guías: el nivel 3 es
 * otro elemento del arreglo con `level: 3`, no una propiedad anidada.
 *
 * El `id` se escribe a mano y no se genera a partir del título en tiempo de
 * render: pasa a ser un ancla compartible, y un cambio de redacción no puede
 * romper un enlace que alguien ya mandó por WhatsApp.
 */
export type BlogSection = {
  /** kebab-case sin tildes. Es el `id` del encabezado y el destino del ancla. */
  id: string;
  level: 2 | 3;
  heading: string;
  paragraphs: string[];
  /**
   * Misma lista de rótulo y cuerpo que las guías de servicio, para las
   * secciones que enumeran puntos en vez de encadenar prosa. El tipo se
   * reutiliza en lugar de declarar uno gemelo: `ContentBody` renderiza los dos
   * modelos con el mismo componente y un tipo propio acá solo abriría la puerta
   * a que los dos se separen sin que nadie se entere.
   */
  items?: ServiceSectionItem[];
  /**
   * Fuentes externas de la sección "De dónde sale esto" (TRUST-02). Se reutiliza
   * `ServiceCitation` por el mismo motivo que `ServiceSectionItem`: `ContentBody`
   * renderiza los dos modelos con el mismo componente, y un tipo gemelo acá solo
   * abriría la puerta a que los dos se separen sin que nadie se entere.
   */
  citations?: ServiceCitation[];
};

/**
 * Miembro de la enumeración `MedicalSpecialty` de schema.org, en forma canónica
 * de URL.
 *
 * `MedicalSpecialty` es una enumeración cerrada, no un tipo de nombre libre: un
 * `{ "@type": "MedicalSpecialty", name: "Traumatología" }` no afirma nada que un
 * validador pueda resolver. Por eso el tipo admite URLs y no cadenas sueltas, el
 * mismo criterio que ya aplica `MEDICAL_SPECIALTIES` en
 * `src/components/structured-data.tsx`.
 *
 * Van solo los miembros que el sitio usa hoy. Para agregar otro hay que
 * comprobarlo antes contra la enumeración: `Orthopedic`, por ejemplo, **no**
 * existe en schema.org, y el dominio de la traumatología lo cubre
 * `Musculoskeletal`.
 */
export type MedicalSpecialtyUrl =
  | "https://schema.org/Musculoskeletal"
  | "https://schema.org/Rheumatologic";

/**
 * Entidad sobre la que trata un post. Es lo que alimenta el `about` del
 * marcado, y por eso está separada de `relatedService`: una cosa es de qué
 * trata el texto y otra a dónde manda al lector.
 *
 * `procedure-ref` no lleva `name` a propósito. El nombre del procedimiento vive
 * en el nodo que declara el grafo raíz; repetirlo acá abriría la puerta a que
 * los dos terminen diciendo cosas distintas. Su `procedureSlug` se deriva de
 * `procedureApproaches`, así que un abordaje renombrado rompe la compilación en
 * vez de publicar un `@id` colgado.
 */
export type BlogTopicEntity =
  | { kind: "condition"; name: string; alternateNames?: string[] }
  | { kind: "procedure-ref"; procedureSlug: ProcedureApproachSlug }
  | { kind: "specialty"; specialty: MedicalSpecialtyUrl };

/** Enlace interno de salida hacia el silo clínico. */
export type BlogOutboundLink = {
  href: string;
  anchor: string;
};

export type BlogPost = {
  slug: string;
  /** Título de buscador. Alimenta `generateMetadata`, no el encabezado. */
  title: string;
  /**
   * Encabezado visible de la página. Separado de `title` a propósito: el
   * paquete on-page le da a cada post un H1 distinto de su title, y sin campo
   * propio la fase que reescribe `title` borraría el H1 sin enterarse.
   */
  h1: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  /**
   * Guía del silo a la que empuja este post. Gobierna solo la navegación: es el
   * destino del enlace "Leer la guía completa", y no alimenta ninguna
   * afirmación de tema del marcado. Para eso está `topicEntities`.
   *
   * Opcional: hay temas cuyo destino natural es el hub `/servicios` y no una
   * guía concreta, y forzar el campo obligaría a inventarles una guía que la
   * matriz de enlazado no les dio.
   */
  relatedService?: ServicePage["slug"];
  /**
   * De qué trata el post, en forma de `BlogTopicEntity`. Arreglo porque un
   * texto puede tratar sobre más de una entidad, como el de cirugía con sus dos
   * abordajes.
   */
  topicEntities?: BlogTopicEntity[];
  outboundLinks?: BlogOutboundLink[];
  ctaBanner: { heading: string; body: string };
  /**
   * `id` de la sección detrás de la que va el banner, igual que en las guías
   * de servicio. Admite un `id` de nivel 3: hay posts cuya primera sección es
   * corta y ninguna frontera de nivel 2 cae dentro de la ventana de POS-01.
   * Sin valor, el banner sigue yendo detrás de la primera sección.
   */
  bannerAfterSectionId?: string;
  intro: string[];
  sections: BlogSection[];
};

export const blogPosts: BlogPost[] = [
  postCiatica,
  postCirugiaDeColumna,
  postArtrosis,
  postLumbalgia,
  postReumatologoOTraumatologo,
];
