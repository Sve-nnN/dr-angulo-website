export type ServiceCategory = {
  slug: string;
  name: string;
  description: string;
  conditions: string[];
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "columna",
    name: "Cirugía de columna",
    description:
      "Diagnóstico y tratamiento de patologías de la columna vertebral, desde manejo conservador hasta cirugía cuando es realmente necesaria.",
    conditions: [
      "Hernia discal",
      "Estenosis espinal (canal estrecho)",
      "Escoliosis",
      "Lumbalgia y ciática",
      "Cervicalgia",
      "Fracturas vertebrales",
      "Artrodesis de columna",
    ],
  },
  {
    slug: "traumatologia",
    name: "Traumatología y ortopedia",
    description:
      "Atención de lesiones y enfermedades de huesos, articulaciones y tejidos blandos.",
    conditions: [
      "Fracturas",
      "Artrosis",
      "Lesiones de rodilla",
      "Lesiones de cadera",
      "Lesiones de hombro",
      "Lesiones de codo",
      "Desgarro muscular",
      "Tendinitis",
    ],
  },
  {
    slug: "ortopedia-infantil",
    name: "Ortopedia infantil",
    description:
      "Evaluación y seguimiento del desarrollo músculo-esquelético en niños y adolescentes.",
    conditions: [
      "Displasia congénita de cadera",
      "Alteraciones de la marcha",
      "Escoliosis en niños y adolescentes",
      "Deformidades de postura",
    ],
  },
];
