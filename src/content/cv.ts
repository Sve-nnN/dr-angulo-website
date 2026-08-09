export type CvEntry = { title: string; place: string; period?: string };

/**
 * Formación y trayectoria confirmadas por el propio doctor (ago. 2026) y
 * verificadas públicamente en Doctoralia y LinkedIn. Se amplía a medida que el
 * consultorio comparte más cursos y certificaciones — no se inventan
 * credenciales no verificadas.
 */
export const education: CvEntry[] = [
  {
    title: "Especialista en Traumatología y Ortopedia",
    place: "Universidad de Oriente, Núcleo Bolívar",
  },
  {
    title: "Especialización en Cirugía de Columna",
    place: "Instituto de Columna de Caracas, Hospital de Clínicas Caracas",
  },
  {
    title: "Cursos y entrenamientos nacionales e internacionales en cirugía de columna",
    place: "Formación continua, incluida técnica mínimamente invasiva",
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
    period: "desde dic. 2018",
  },
  {
    title: "Traumatólogo y cirujano de columna",
    place:
      "Clínica Ricardo Palma, Clínica Sanna La Molina, Clínica Padre Luis Tezza y consultorio privado en Surco",
    period: "sedes actuales",
  },
];

export const credentialsInfo = {
  cmp: "83189",
  rne: "35310",
  /** Años de ejercicio profesional confirmados por el doctor (ago. 2026). */
  yearsOfExperience: 15,
};
