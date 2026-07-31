export type Testimonial = {
  quote: string;
  author: string;
  source: string;
  date?: string;
};

/**
 * Solo testimonios verificables en fuentes reales (Doctoralia, Google).
 * No se inventan citas de pacientes. Ampliar cuando el doctor comparta
 * más reseñas reales (Google, Doctoralia, o las de su highlight de Instagram).
 */
export const testimonials: Testimonial[] = [
  {
    quote: "Excelente profesional.",
    author: "Paciente verificado",
    source: "Doctoralia",
    date: "2023-06",
  },
];

export const reviewLinks = {
  doctoralia: "https://www.doctoralia.pe/perfil/juan-carlos-angulo-totesaut",
};
