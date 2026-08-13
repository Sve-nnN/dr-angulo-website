/**
 * Páginas fijas con cuerpo largo: el inicio hoy, el hub después. No tienen
 * slug dinámico ni plantilla compartida, pero su prosa es la misma clase de
 * contenido que la de las guías, y por eso reusa `ContentSection` en vez de
 * abrir un modelo paralelo que habría que mantener en dos sitios.
 */

import type { ContentSection } from "@/components/content/content-body";
import type {
  ServiceFormat,
  ServiceOutboundLink,
} from "@/content/service-pages";

export type StaticPage = {
  /** Ruta publicada, no un segmento: el inicio es `/`. */
  slug: string;
  /** Esqueleto que sigue el cuerpo, igual que en las guías del silo. */
  format: ServiceFormat;
  /** Secciones en orden de lectura, con el nivel 3 intercalado. */
  sections: ContentSection[];
  outboundLinks?: ServiceOutboundLink[];
  /**
   * Encabezado publicado. El inicio no lo declara acá porque su h1 es de
   * marca y vive en la plantilla; una página fija que publica cuerpo del
   * paquete sí lo trae, porque el h1 viene con el copy.
   */
  h1?: string;
  /** Banner de conversión del primer tercio, si la página lo monta. */
  ctaBanner?: { heading: string; body: string };
  /** Sección detrás de la cual cae el banner. */
  bannerAfterSectionId?: string;
  publishedAt?: string;
  updatedAt?: string;
};
