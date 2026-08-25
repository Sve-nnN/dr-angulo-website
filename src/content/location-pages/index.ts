/**
 * Capa editorial de las páginas de sede: un módulo de datos por sede, una sola
 * plantilla en `src/app/sedes/[slug]/page.tsx`.
 *
 * El directorio reemplaza al archivo único de la fase 9 por la misma razón que
 * el plan 08-05 abrió `service-pages.ts` y `blog.ts`: dos planes hermanos no
 * pueden escribir el mismo archivo. La ruta de importación pública
 * (`@/content/location-pages`) no cambió, así que ningún consumidor tocó su
 * import.
 *
 * `generateStaticParams` recorre `locationPages`, no `locations`: una sede sin
 * entrada editorial no genera ruta y no entra al sitemap.
 *
 * Reglas de contenido, heredadas de 09-CONTEXT.md: segunda persona, español
 * neutro, extensión media. Prohibido afirmar credenciales que no estén en
 * `src/content/cv.ts`, cantidad de cirugías, tasas de éxito, precios y
 * construcciones en primera persona sobre casos concretos.
 *
 * Regla de negocio, la misma que documenta `locations.ts`: el WhatsApp del
 * doctor agenda solo el consultorio privado. Ningún texto de una sede de tipo
 * clínica ofrece ese canal ni menciona el número personal del doctor.
 */

import { locations, type Location } from "@/content/locations";
import { consultorioPrivado } from "./consultorio-privado";
import { clinicaRicardoPalma } from "./clinica-ricardo-palma";
import { sannaLaMolina } from "./sanna-la-molina";
import { clinicaTezza } from "./clinica-tezza";
import type { LocationPage } from "./types";
import { assertNavIndexMatches, locationNavItems } from "@/content/nav-index";

export type { LocationPage };

export const locationPages: LocationPage[] = [
  consultorioPrivado,
  clinicaRicardoPalma,
  sannaLaMolina,
  clinicaTezza,
];

// Compuerta de sincronía con `src/content/nav-index.ts` (CWV-04). Mismo motivo
// que en `service-pages/index.ts`: corre en el build, no en el navegador.
assertNavIndexMatches("sede", locationNavItems, locationPages);

/**
 * Une la entrada editorial con sus datos de NAP. Devuelve `undefined` si falta
 * cualquiera de las dos: ese join en un solo lugar es lo que impide que una
 * página quede publicada sin dirección o que un slug editorial quede huérfano.
 */
export function getLocationPage(
  slug: string
): { page: LocationPage; location: Location } | undefined {
  const page = locationPages.find((entry) => entry.slug === slug);
  if (!page) return undefined;

  const location = locations.find((entry) => entry.slug === slug);
  if (!location) return undefined;

  return { page, location };
}
