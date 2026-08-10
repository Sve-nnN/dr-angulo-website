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
    slug: "consultorio-privado",
    navLabel: "Consultorio privado en Surco",
    // El consultorio es la excepción del patrón de title de las clínicas: su
    // nombre no es algo que un paciente escriba en el buscador. Su consulta es
    // de distrito, no de institución, y por eso el title nombra Surco y Lima.
    title: "Consultorio de traumatología y columna en Surco, Lima",
    h1: "Consultorio privado del Dr. Angulo en Surco",
    description:
      "El Dr. Juan Carlos Angulo atiende columna y traumatología en su consultorio de Surco, viernes y sábados. Acá él agenda tu cita directamente.",
    heroLead:
      "Este es el consultorio propio del doctor, en el Edificio Lima Central Tower de Surco. Es la única sede cuya agenda maneja él, así que la cita se coordina directamente con su consultorio.",
    cardSummary:
      "Santiago de Surco, viernes y sábados. Es la única sede donde el doctor agenda directamente.",
    gettingThere: [
      "El consultorio queda en Av. El Derby 254, en el piso 24 del Edificio Lima Central Tower, en Santiago de Surco. La referencia más clara es el cruce de Av. El Derby con Manuel Olguín.",
      "Av. El Derby es la vía que conecta esa zona de oficinas de Surco, y la numeración corresponde a la cuadra 2. El edificio tiene frente sobre la avenida, así que la torre es la referencia visual con la que vas a llegar.",
      "Una vez adentro, la oficina es la 2403, en el piso 24. Para la ruta exacta desde donde estés, abre la ubicación en el mapa con el enlace de arriba.",
    ],
    conditionsLead:
      "En esta sede el doctor evalúa dolor cervical y lumbar, hernia discal, estenosis espinal, escoliosis y las consultas de traumatología general y ortopedia infantil. Si quieres entender tu condición antes de la cita, cada guía explica qué es, cómo se diagnostica y qué opciones de tratamiento existen.",
  },
  {
    slug: "clinica-ricardo-palma",
    navLabel: "Clínica Ricardo Palma",
    title: "Traumatólogo y cirujano de columna en Clínica Ricardo Palma",
    h1: "Traumatólogo y cirujano de columna en Clínica Ricardo Palma",
    description:
      "El Dr. Juan Carlos Angulo atiende columna y traumatología en Clínica Ricardo Palma, San Isidro, lunes y miércoles. La cita la saca la clínica.",
    heroLead:
      "En esta sede el doctor evalúa dolor de columna, lesiones traumatológicas y consultas de ortopedia infantil, los lunes y miércoles. La agenda la maneja la clínica, así que la cita se saca con su central de citas y no con el consultorio del doctor.",
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
  {
    slug: "sanna-la-molina",
    navLabel: "Clínica Sanna, La Molina",
    title: "Traumatólogo y cirujano de columna en Clínica Sanna, sede La Molina",
    h1: "Traumatólogo y cirujano de columna en Clínica Sanna, sede La Molina",
    description:
      "El Dr. Juan Carlos Angulo atiende columna y traumatología en Sanna La Molina, martes y jueves. La cita se saca por la app o la central de Sanna.",
    heroLead:
      "En esta sede el doctor evalúa dolor de columna, lesiones traumatológicas y consultas de ortopedia infantil, los martes y jueves. La agenda la maneja Sanna, así que la cita se saca por su app o por su central y no con el consultorio del doctor.",
    cardSummary:
      "La Molina, martes y jueves. La cita se saca por la app de Sanna o llamando a la clínica.",
    gettingThere: [
      "El centro clínico de Sanna en La Molina queda en Av. Raúl Ferrero 1256. Raúl Ferrero es una de las avenidas principales del distrito, así que la sede es alcanzable sin salir de esa vía.",
      "La numeración corresponde a la cuadra 12 de Raúl Ferrero, dentro de La Molina. El centro tiene frente sobre la avenida, que es la referencia más confiable si vienes manejando o en transporte público.",
      "Para la ruta exacta desde donde estés, abre la ubicación en el mapa con el enlace de arriba. Ahí puedes revisar el tráfico del momento antes de salir de casa.",
    ],
    conditionsLead:
      "En esta sede el doctor evalúa dolor cervical y lumbar, hernia discal, estenosis espinal, escoliosis y las consultas de traumatología general y ortopedia infantil. Si quieres entender tu condición antes de la cita, cada guía explica qué es, cómo se diagnostica y qué opciones de tratamiento existen.",
  },
  {
    slug: "clinica-tezza",
    navLabel: "Clínica Padre Luis Tezza",
    title: "Traumatólogo y cirujano de columna en Clínica Padre Luis Tezza",
    h1: "Traumatólogo y cirujano de columna en Clínica Padre Luis Tezza",
    description:
      "El Dr. Juan Carlos Angulo atiende columna y traumatología en Clínica Padre Luis Tezza, Surco, jueves y viernes por la tarde. La cita la saca la clínica.",
    heroLead:
      "En esta sede el doctor evalúa dolor de columna, lesiones traumatológicas y consultas de ortopedia infantil, los jueves y viernes por la tarde. La agenda la maneja la clínica, así que la cita se saca con su central de citas y no con el consultorio del doctor.",
    cardSummary:
      "Santiago de Surco, jueves y viernes por la tarde. La cita se saca con la central de la clínica.",
    gettingThere: [
      "La Clínica Padre Luis Tezza queda en Av. El Polo 570, en Santiago de Surco. El Polo es una de las avenidas conocidas del distrito y la clínica tiene frente sobre ella.",
      "La numeración corresponde a la cuadra 5 de Av. El Polo. Si vienes desde otro distrito, la avenida es la referencia con la que vas a ubicar la entrada.",
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
