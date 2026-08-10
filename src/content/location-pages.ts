/**
 * Capa editorial de las páginas de sede: una entrada de datos por sede, una
 * sola plantilla en `src/app/sedes/[slug]/page.tsx`.
 *
 * El reparto es el mismo que ya existe entre `services.ts` y `service-pages.ts`.
 * `src/content/locations.ts` sigue siendo la única fuente de verdad del NAP:
 * dirección, geo, teléfono, web, horario y canales de agenda se leen de ahí en
 * tiempo de render y no se copian acá. Este archivo solo aporta el texto que no
 * puede derivarse de datos.
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
  /** Cómo llegar, en dos o tres párrafos, con referencias reales del barrio. */
  gettingThere: string[];
  /** Párrafo que abre la lista de guías de servicio de esa sede. */
  conditionsLead: string;
};

export const locationPages: LocationPage[] = [
  {
    slug: "clinica-ricardo-palma",
    navLabel: "Clínica Ricardo Palma",
    title: "Traumatólogo y cirujano de columna en Clínica Ricardo Palma",
    h1: "Traumatólogo y cirujano de columna en Clínica Ricardo Palma",
    description:
      "El Dr. Juan Carlos Angulo atiende columna y traumatología en Clínica Ricardo Palma, San Isidro, lunes y miércoles. La cita la saca la clínica.",
    heroLead:
      "En esta sede el doctor evalúa dolor de columna, lesiones traumatológicas y consultas de ortopedia infantil. La atención es los lunes y miércoles, en el horario que publica la clínica.",
    cardSummary:
      "San Isidro, lunes y miércoles. La cita se saca con la central de citas de la clínica.",
    gettingThere: [
      "La Clínica Ricardo Palma queda en Av. Javier Prado Este 1066, en San Isidro. Javier Prado es una de las avenidas que cruzan Lima de este a oeste, así que puedes llegar desde varios distritos sin salir de esa vía.",
      "La numeración corresponde a la cuadra 10 de Javier Prado Este. La clínica tiene frente sobre la avenida, que es la referencia más confiable si vienes manejando o en transporte público.",
      "Para la ruta exacta desde donde estés, abre la ubicación en el mapa con el enlace de arriba. Ahí puedes revisar el tráfico del momento antes de salir de casa.",
    ],
    conditionsLead:
      "En esta sede el doctor evalúa dolor cervical y lumbar, hernia discal, estenosis espinal, escoliosis y las consultas de traumatología general y ortopedia infantil. Si quieres entender tu condición antes de la cita, cada guía explica qué es, cómo se diagnostica y qué opciones de tratamiento existen.",
  },
];

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
