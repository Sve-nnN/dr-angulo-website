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
};
