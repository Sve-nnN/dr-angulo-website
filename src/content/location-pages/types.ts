/**
 * Modelo de la ficha de sede.
 *
 * El reparto con `src/content/locations.ts` no cambió desde la fase 9: ese
 * archivo sigue siendo la única fuente de verdad del NAP. Dirección, geo,
 * teléfono, web, horario y canales de agenda se leen de ahí en tiempo de
 * render y no se copian acá. Este archivo solo aporta el texto que no puede
 * derivarse de datos.
 *
 * Las cuatro sedes usan el esqueleto `ficha-de-sede` del paquete on-page, así
 * que no hay campo `format`: no hay otra opción que declarar. El esqueleto se
 * declara en la puerta (`scripts/check-content.mjs`), que es donde vive la
 * expectativa.
 */

import type { ContentSection } from "@/components/content/content-body";

export type LocationPage = {
  slug: string;
  /** Texto de la tarjeta del hub y del submenú móvil del header. */
  navLabel: string;
  title: string;
  description: string;
  h1: string;
  /** Dos oraciones bajo el `h1`, dentro de la banda de cabecera. */
  heroLead: string;
  /** Resumen de la tarjeta del hub. Una línea. */
  cardSummary: string;
  /**
   * Cómo llegar, en dos o tres párrafos, con referencias reales del barrio.
   * Es el bloque heredado de la fase 9. Una sede que publica `sections` trae
   * su propia sección `como-llegar` del paquete y la plantilla deja de
   * renderizar este campo: la página no puede decir dos veces cómo llegar con
   * palabras distintas.
   */
  gettingThere: string[];
  /**
   * Párrafo que abre la lista de guías de servicio de esa sede. Igual que
   * `gettingThere`, lo reemplaza `que-se-atiende` cuando la sede tiene cuerpo.
   */
  conditionsLead: string;
  /**
   * Cuerpo largo del paquete on-page: cinco secciones de nivel 2 con las
   * claves del esqueleto `ficha-de-sede` y sus subsecciones de nivel 3.
   * Vacío mientras la sede no publique su copy aprobado.
   */
  sections: ContentSection[];
  /** Salidas del mapa de enlazado de v1.2, al pie del cuerpo. */
  outboundLinks?: { href: string; anchor: string }[];
  /**
   * Banner de conversión del primer tercio. Solo lo declara una sede con
   * cuerpo: sin cuerpo largo no hay primer tercio donde ponerlo.
   */
  ctaBanner?: { heading: string; body: string };
  /** Fechas de la firma del contenido clínico. Solo en sedes con cuerpo. */
  publishedAt?: string;
  updatedAt?: string;
  /** `id` de la sección detrás de la cual cae el banner. */
  bannerAfterSectionId?: string;
};
