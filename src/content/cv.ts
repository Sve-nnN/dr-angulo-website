export type CvEntry = { title: string; place: string; period?: string };

/**
 * Formación y trayectoria verificada públicamente (Doctoralia, LinkedIn) al
 * momento de construir el sitio. PENDIENTE: el doctor debe compartir su CV
 * completo (más cursos, certificaciones y congresos) para ampliar esta
 * sección — no se inventan credenciales no verificadas.
 */
export const education: CvEntry[] = [
  {
    title: "Residencia en Traumatología y Ortopedia",
    place: "Universidad de Oriente, Núcleo Bolívar",
  },
  {
    title: "Cursos de especialización en cirugía de columna, ecografía y reanimación cardiopulmonar",
    place: "Formación continua",
  },
];

export const experience: CvEntry[] = [
  {
    title: "Cirujano de columna",
    place: "Hospital Ruiz y Páez",
    period: "2007 – 2009",
  },
  {
    title: "Traumatólogo",
    place: "Clínica San Juan de Dios, San Luis, Lima",
    period: "nov. 2018 – dic. 2019",
  },
  {
    title: "Traumatólogo y cirujano de columna",
    place: "Clínica Montefiori, La Molina, Lima",
    period: "desde dic. 2018 — sede actual",
  },
];

export const credentialsInfo = {
  cmp: "83189",
  rne: "35310",
};
