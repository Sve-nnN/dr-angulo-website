export type CvEntry = { title: string; place: string; period?: string };

export type TrainingEntry = {
  title: string;
  place: string;
  year: string;
  /** Marca los entrenamientos hechos fuera del país. */
  international?: boolean;
};

/**
 * Trayectoria completa según el CV que el doctor publica en Doctoralia
 * (recibido 2026-08-09), más la especialización de columna que confirmó por
 * escrito el 2026-08-08. No se inventan credenciales: si un dato no está en
 * esas dos fuentes, no aparece acá.
 *
 * Quedaron fuera dos cargos de inicio de carrera (médico rural y coordinador de
 * ambulatorio en Guarataro) porque las fechas del CV se contradicen entre sí
 * y no aportan al criterio del paciente. Pendiente de aclarar con el doctor.
 */
export const education: CvEntry[] = [
  {
    title: "Residencia de postgrado en Traumatología y Ortopedia",
    place: "Universidad de Oriente, Núcleo Bolívar, Ciudad Bolívar, Venezuela",
    period: "2007 – 2009",
  },
  {
    title: "Especialización en Cirugía de Columna",
    place: "Instituto de Columna de Caracas, Hospital de Clínicas Caracas",
  },
  {
    title: "Diplomado en Ecografía Integral",
    place: "Universidad Fermín Toro, Barquisimeto, Venezuela",
    period: "2005",
  },
];

export const experience: CvEntry[] = [
  {
    title: "Traumatólogo y cirujano de columna",
    place:
      "Clínica Ricardo Palma, Clínica Sanna La Molina, Clínica Padre Luis Tezza y consultorio privado en Surco",
    period: "sedes actuales",
  },
  {
    title: "Traumatólogo",
    place: "Clínica Montefiori, La Molina, Lima",
    period: "desde dic. 2018",
  },
  {
    title: "Traumatólogo",
    place: "Clínica San Juan de Dios, San Luis, Lima",
    period: "nov. 2018 – dic. 2019",
  },
  {
    title: "Cirujano de columna",
    place: "Hospital Ruiz y Páez, Ciudad Bolívar, Venezuela",
    period: "may. 2011 – abr. 2018",
  },
  {
    title: "Traumatólogo",
    place: "Hospital Ruiz y Páez, Ciudad Bolívar, Venezuela",
    period: "may. 2010 – feb. 2018",
  },
  {
    title: "Jefe de médicos residentes de Traumatología y Ortopedia",
    place: "Hospital IVSS Héctor Nouel Joubert, Ciudad Bolívar, Venezuela",
    period: "2005 – 2006",
  },
  {
    title: "Médico residente asistencial de Traumatología y Ortopedia",
    place: "Hospital IVSS Héctor Nouel Joubert, Ciudad Bolívar, Venezuela",
    period: "2005 – 2006",
  },
  {
    title: "Médico interno",
    place: "Hospital IVSS Héctor Nouel Joubert, Ciudad Bolívar, Venezuela",
    period: "2004",
  },
];

/** Cursos, congresos y entrenamientos, del más reciente al más antiguo. */
export const training: TrainingEntry[] = [
  {
    title: "AOSpine Advanced Course, Degenerative Spine",
    place: "Lima, Perú",
    year: "2019",
  },
  {
    title: "ASPECIVE, Patología Degenerativa Lumbar",
    place: "Lima, Perú",
    year: "2018",
  },
  {
    title: "Curso de Corrección de Deformidades, Cirugía de Columna (Medtronic)",
    place: "Buenos Aires, Argentina",
    year: "2012",
    international: true,
  },
  {
    title: "Current Spine Latin America (Medtronic)",
    place: "Miami, Florida, Estados Unidos",
    year: "2012",
    international: true,
  },
  {
    title: "STS MAST Lab for Venezuela (Medtronic)",
    place: "Miami, Florida, Estados Unidos",
    year: "2012",
    international: true,
  },
  {
    title: "Prótesis de disco cervical y lumbar de movilidad controlada (MOBI-C, MOBIDISC)",
    place: "Francia",
    year: "2012",
    international: true,
  },
  {
    title: "Curso AO de Cirugía Degenerativa y Traumática de Columna",
    place: "Caracas, Venezuela",
    year: "2010",
  },
  {
    title: "Curso Básico AO de Cirugía de Columna",
    place: "Caracas, Venezuela",
    year: "2009",
  },
  {
    title: "Curso Teórico Práctico de Electrocardiografía Deductiva",
    place: "Venezuela",
    year: "2003",
  },
  {
    title: "Curso de Reanimación Cardiopulmonar y Cerebral, básico y avanzado",
    place: "Federación Médica Venezolana",
    year: "2002",
  },
  {
    title: "XI Congreso Panamericano de Anatomía",
    place: "Preservación y conservación de material cadavérico",
    year: "1995",
  },
];

export const credentialsInfo = {
  cmp: "83189",
  rne: "35310",
  /**
   * Plataforma oficial donde un paciente comprueba la colegiatura (AUD-09).
   *
   * Es un buscador general: se escribe el número o el nombre y devuelve la
   * ficha. **No existe enlace directo a la ficha de un médico**, así que
   * ninguna superficie del sitio puede prometer que el enlace abre la del
   * doctor. El texto de cada enlace tiene que decir que lleva al registro.
   *
   * Va acá y no en `site-config.ts` porque todo dato de acreditación sale de
   * este archivo y de ningún otro, que es lo que verifica `check-content.mjs`.
   */
  verificationUrl: "https://aplicaciones.cmp.org.pe/conoce_a_tu_medico/",
  /** Años de ejercicio profesional confirmados por el doctor (ago. 2026). */
  yearsOfExperience: 15,
  /** Entrenamientos hechos fuera del país, según el CV de Doctoralia. */
  internationalTrainings: 4,
};
