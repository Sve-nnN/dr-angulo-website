export const siteConfig = {
  name: "Dr. Juan Carlos Angulo Totesaut",
  shortName: "Dr. Juan Angulo",
  title: "Traumatólogo y Cirujano de Columna en Lima",
  description:
    "Dr. Juan Carlos Angulo Totesaut — Traumatólogo, especialista en ortopedia infantil y cirujano de columna en Lima, Perú. Agenda tu consulta por WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://drangulocolumna.com",

  whatsapp: {
    number: "51964305682",
    displayNumber: "+51 964 305 682",
  },

  /**
   * NAP principal del sitio: el consultorio propio del doctor, el único cuya
   * agenda maneja él. Las otras tres sedes viven en `src/content/locations.ts`
   * porque cada una se agenda con su propia clínica.
   */
  office: {
    name: "Consultorio del Dr. Angulo",
    streetAddress: "Av. El Derby 254, piso 24, oficina 2403",
    building: "Edificio Lima Central Tower",
    addressLocality: "Santiago de Surco",
    addressRegion: "Lima",
    postalCode: "15023",
    addressCountry: "PE",
    geo: { latitude: -12.0977043, longitude: -76.9729404 },
    // URL CID de la ficha real del consultorio en Google, no una búsqueda por
    // texto: identifica el negocio en vez de dejar que Google adivine cuál de
    // los inquilinos de la torre es (AUD-04). Tiene que ser la misma que el
    // `mapsUrl` de `consultorio-privado` en `src/content/locations.ts`, porque
    // esa alimenta el `hasMap` del JSON-LD y esta el pie y `/contacto`.
    mapsUrl: "https://maps.google.com/?cid=10881730410836747834",
  },

  credentials: {
    cmp: "83189",
    rne: "35310",
  },

  specialties: [
    "Traumatología",
    "Ortopedia infantil",
    "Cirugía de columna",
  ],

  /**
   * Perfiles verificados del doctor. Los cuatro alimentan el `sameAs` del nodo
   * `Physician`, que es como el buscador reconcilia esta entidad con la que ya
   * conoce en otras plataformas (AUD-03).
   *
   * Solo entran perfiles comprobados. No existen LinkedIn ni YouTube oficiales:
   * inventar una URL acá le diría al buscador que un tercero es el doctor.
   */
  social: {
    instagram: "https://www.instagram.com/dr.juancarlosangulo/",
    doctoralia: "https://www.doctoralia.pe/perfil/juan-carlos-angulo-totesaut",
    googleBusiness: "https://maps.google.com/?cid=10881730410836747834",
    facebook:
      "https://www.facebook.com/p/Dr-Juan-Carlos-Angulo-Totesaut-100046921995925/",
  },

  email: process.env.CONTACT_EMAIL_TO || "",
} as const;

export function whatsappUrl(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encoded}`;
}

export const whatsappMessages = {
  header: "Hola Dr. Angulo, quisiera agendar una cita en su consultorio privado.",
  hero: "Hola Dr. Angulo, vi su página web y quisiera agendar una cita de evaluación.",
  floating_button: "Hola Dr. Angulo, quisiera hacerle una consulta.",
  services: "Hola Dr. Angulo, quisiera más información sobre sus servicios y agendar una cita.",
  footer: "Hola Dr. Angulo, quisiera más información sobre citas.",
  contact_page: "Hola Dr. Angulo, quisiera agendar una cita. Mis datos:",
  booking_page:
    "Hola Dr. Angulo, quisiera agendar una cita en su consultorio privado (Av. El Derby 254, Surco).",
  // Dos claves para todo el silo clínico, no una por condición: fragmentar la
  // etiqueta de `trackWhatsAppClick(location)` volvería inútil comparar
  // superficies en GA4. La contextualización fina vive en el copy del banner.
  service_page:
    "Hola Dr. Angulo, leí la información de su web sobre mi condición y quisiera agendar una evaluación.",
  blog_post:
    "Hola Dr. Angulo, leí un artículo de su blog y quisiera agendar una evaluación.",
} as const;

export type CtaLocation = keyof typeof whatsappMessages;
