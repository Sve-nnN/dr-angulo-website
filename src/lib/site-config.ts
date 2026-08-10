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
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Lima%20Central%20Tower%2C%20Av.%20El%20Derby%20254%2C%20Santiago%20de%20Surco%2C%20Lima%2C%20Per%C3%BA",
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

  social: {
    instagram: "https://www.instagram.com/dr.juancarlosangulo/",
    doctoralia: "https://www.doctoralia.pe/perfil/juan-carlos-angulo-totesaut",
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
} as const;

export type CtaLocation = keyof typeof whatsappMessages;
