/**
 * Sedes donde atiende el doctor y cómo se agenda en cada una.
 *
 * Horarios y canales confirmados por el consultorio el 2026-08-09. Direcciones,
 * teléfonos y webs verificados contra la ficha oficial de cada clínica.
 *
 * Regla de negocio importante: el WhatsApp del doctor SOLO agenda el consultorio
 * privado. Las citas en Ricardo Palma, Sanna y Tezza las gestiona cada clínica,
 * porque el doctor no maneja sus agendas. Esa distinción tiene que quedar
 * explícita en la interfaz — es la confusión más frecuente de los pacientes.
 */

export type BookingChannel = {
  label: string;
  /** Enlace externo (web de la clínica) o `tel:`. Ausente si el canal es la app. */
  href?: string;
  detail?: string;
};

/** Día de la semana en el vocabulario de schema.org. */
export type SchemaDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

/**
 * Misma información que `schedule`, pero legible por máquina, para el
 * `openingHoursSpecification` del JSON-LD. `opens`/`closes` van en formato
 * 24 h; se omiten cuando el horario se coordina caso por caso.
 */
export type OpeningHours = {
  days: SchemaDay[];
  opens?: string;
  closes?: string;
};

export type Location = {
  slug: string;
  name: string;
  kind: "consultorio" | "clinica";
  streetAddress: string;
  building?: string;
  reference?: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  geo: { latitude: number; longitude: number };
  mapsUrl: string;
  /** Teléfono público de la sede, en formato E.164. */
  telephone: string;
  /** Web oficial de la sede, si la tiene. */
  website?: string;
  schedule: { days: string; hours: string }[];
  openingHours: OpeningHours[];
  /** Cómo se agenda, en una frase. */
  bookingSummary: string;
  channels: BookingChannel[];
};

/**
 * URL de búsqueda por texto en Google Maps.
 *
 * Es el recurso para las sedes que NO tienen ficha propia del doctor. El
 * consultorio privado sí la tiene y usa su URL CID directa, que identifica el
 * negocio exacto en vez de dejar que Google resuelva una consulta de texto.
 * Las tres clínicas se quedan con la búsqueda a propósito: sus fichas de Google
 * son de la institución, no del consultorio del doctor dentro de ella, y no hay
 * un Place ID verificado que apunte a su atención ahí. Una URL CID inventada
 * apuntaría a otro negocio, que es peor que una búsqueda que resuelve bien.
 * La asimetría no es un olvido.
 */
function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Ficha de Google del consultorio privado, por CID.
 *
 * Alimenta el `hasMap` de esa sede en el JSON-LD y sus enlaces de interfaz.
 * `siteConfig.office.mapsUrl` declara la misma URL para el pie y `/contacto`.
 */
const PRIVATE_OFFICE_MAPS_URL = "https://maps.google.com/?cid=10881730410836747834";

export const locations: Location[] = [
  {
    slug: "consultorio-privado",
    name: "Consultorio privado del Dr. Angulo",
    kind: "consultorio",
    streetAddress: "Av. El Derby 254, piso 24, oficina 2403",
    building: "Edificio Lima Central Tower",
    reference: "Cruce de Av. El Derby con Manuel Olguín",
    addressLocality: "Santiago de Surco",
    addressRegion: "Lima",
    postalCode: "15023",
    addressCountry: "PE",
    geo: { latitude: -12.0977043, longitude: -76.9729404 },
    mapsUrl: PRIVATE_OFFICE_MAPS_URL,
    telephone: "+51964305682",
    // Horario publicado en la ficha de Google del consultorio (verificado 2026-08-09).
    schedule: [{ days: "Viernes y sábados", hours: "9:00 a. m. a 5:00 p. m." }],
    openingHours: [{ days: ["Friday", "Saturday"], opens: "09:00", closes: "17:00" }],
    bookingSummary: "Se agenda directamente por WhatsApp con el consultorio del doctor.",
    channels: [
      {
        label: "WhatsApp +51 964 305 682",
        href: "https://wa.me/51964305682",
        detail: "Único canal donde el doctor agenda directamente",
      },
    ],
  },
  {
    slug: "clinica-ricardo-palma",
    name: "Clínica Ricardo Palma",
    kind: "clinica",
    streetAddress: "Av. Javier Prado Este 1066",
    addressLocality: "San Isidro",
    addressRegion: "Lima",
    postalCode: "15036",
    addressCountry: "PE",
    geo: { latitude: -12.090602, longitude: -77.018276 },
    mapsUrl: mapsUrl("Clínica Ricardo Palma, Av. Javier Prado Este 1066, San Isidro, Lima, Perú"),
    telephone: "+5112242224",
    website: "https://www.crp.com.pe/",
    schedule: [{ days: "Lunes y miércoles", hours: "9:00 a. m. a 6:00 p. m." }],
    openingHours: [{ days: ["Monday", "Wednesday"], opens: "09:00", closes: "18:00" }],
    bookingSummary: "La cita se saca con la clínica, por teléfono o desde su web.",
    channels: [
      { label: "Central de citas (01) 224 2224", href: "tel:+5112242224" },
      {
        label: "Agendar en crp.com.pe",
        href: "https://www.crp.com.pe/agenda-tu-cita/",
        detail: "Buscar al Dr. Juan Carlos Angulo Totesaut en Traumatología",
      },
    ],
  },
  {
    slug: "sanna-la-molina",
    name: "Clínica Sanna, sede La Molina",
    kind: "clinica",
    streetAddress: "Av. Raúl Ferrero 1256",
    addressLocality: "La Molina",
    addressRegion: "Lima",
    postalCode: "15024",
    addressCountry: "PE",
    geo: { latitude: -12.0902268, longitude: -76.9505892 },
    mapsUrl: mapsUrl("SANNA Centro Clínico La Molina, Av. Raúl Ferrero 1256, La Molina, Lima, Perú"),
    telephone: "+5116355000",
    website: "https://www.sanna.pe/centros-clinicos/la-molina-lima/informacion-general/",
    schedule: [
      { days: "Martes", hours: "8:00 a. m. a 7:00 p. m." },
      { days: "Jueves", hours: "8:00 a. m. a 12:00 p. m." },
    ],
    openingHours: [
      { days: ["Tuesday"], opens: "08:00", closes: "19:00" },
      { days: ["Thursday"], opens: "08:00", closes: "12:00" },
    ],
    bookingSummary: "La cita se saca por la app de Sanna o llamando a la clínica.",
    channels: [
      { label: "App SANNA", detail: "Disponible para iOS y Android" },
      { label: "Central (01) 635 5000", href: "tel:+5116355000" },
      {
        label: "Agendar en sanna.pe",
        href: "https://agendamiento.sanna.pe/",
        detail: "Buscar al Dr. Juan Carlos Angulo Totesaut en Traumatología",
      },
    ],
  },
  {
    slug: "clinica-tezza",
    name: "Clínica Padre Luis Tezza",
    kind: "clinica",
    streetAddress: "Av. El Polo 570",
    addressLocality: "Santiago de Surco",
    addressRegion: "Lima",
    postalCode: "15023",
    addressCountry: "PE",
    geo: { latitude: -12.1032942, longitude: -76.9718807 },
    mapsUrl: mapsUrl("Clínica Padre Luis Tezza, Av. El Polo 570, Santiago de Surco, Lima, Perú"),
    telephone: "+5116105050",
    website: "https://clinicatezza.com.pe/",
    schedule: [{ days: "Jueves y viernes", hours: "2:00 p. m. a 6:00 p. m." }],
    openingHours: [{ days: ["Thursday", "Friday"], opens: "14:00", closes: "18:00" }],
    bookingSummary: "La cita se saca desde la web de la clínica o por teléfono.",
    channels: [
      { label: "Central de citas (01) 610 5050", href: "tel:+5116105050" },
      {
        label: "Agendar en clinicatezza.com.pe",
        href: "https://clinicatezza.com.pe/",
        detail: "Buscar al Dr. Juan Carlos Angulo Totesaut en Traumatología",
      },
    ],
  },
];

const WEEK_ORDER = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábados"];

/**
 * Los bloques de atención ordenados de lunes a sábado, para la tabla resumen.
 * Se ordena por el primer día que nombra cada bloque.
 */
export const weeklySchedule = locations
  .flatMap((location) =>
    location.schedule.map((block) => ({
      days: block.days,
      hours: block.hours,
      locationName: location.name,
      locationSlug: location.slug,
      order: WEEK_ORDER.findIndex((day) => block.days.toLowerCase().includes(day)),
    }))
  )
  .sort((a, b) => a.order - b.order);

/** El consultorio propio del doctor: es el NAP principal del sitio. */
export const primaryLocation = locations[0];

/** Las tres clínicas donde atiende con la agenda de cada institución. */
export const clinicLocations = locations.filter((l) => l.kind === "clinica");
