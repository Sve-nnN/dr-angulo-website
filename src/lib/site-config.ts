export const siteConfig = {
  name: "Dr. Juan Carlos Angulo Totesaut",
  shortName: "Dr. Juan Angulo",
  title: "Traumatólogo y Cirujano de Columna en Lima",
  description:
    "Dr. Juan Carlos Angulo Totesaut — Traumatólogo, especialista en ortopedia infantil y cirujano de columna en Lima, Perú. Agenda tu consulta por WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://dr-angulo.vercel.app",

  whatsapp: {
    number: "51964305682",
    displayNumber: "+51 964 305 682",
  },

  clinic: {
    name: "Clínica Montefiori",
    streetAddress: "Av. Separadora Industrial 1820",
    addressLocality: "La Molina",
    addressRegion: "Lima",
    postalCode: "15023",
    addressCountry: "PE",
    geo: { latitude: -12.062068, longitude: -76.955711 },
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica+Montefiori+Av.+Separadora+Industrial+1820+La+Molina+Lima",
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
  header: "Hola Dr. Angulo, quisiera agendar una cita.",
  hero: "Hola Dr. Angulo, vi su página web y quisiera agendar una cita de evaluación.",
  floating_button: "Hola Dr. Angulo, quisiera hacerle una consulta.",
  services: "Hola Dr. Angulo, quisiera más información sobre sus servicios y agendar una cita.",
  footer: "Hola Dr. Angulo, quisiera más información sobre citas.",
  contact_page: "Hola Dr. Angulo, quisiera agendar una cita. Mis datos:",
} as const;

export type CtaLocation = keyof typeof whatsappMessages;
