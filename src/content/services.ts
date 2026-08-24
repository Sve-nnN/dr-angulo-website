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
      "Diagnóstico y tratamiento de patologías de la columna vertebral, desde manejo conservador hasta cirugía cuando es realmente necesaria. Incluye deformidades, enfermedad degenerativa y procesos inflamatorios.",
    conditions: [
      "Escoliosis y otras deformidades",
      "Hernia discal",
      "Estenosis espinal (canal estrecho)",
      "Enfermedad degenerativa discal",
      "Procesos inflamatorios de la columna",
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

export type ProcedureApproach = {
  slug: string;
  name: string;
  description: string;
  examples: string[];
  /** Foto real de quirófano que acompaña al abordaje. */
  image: { src: string; alt: string; width: number; height: number };
};

/**
 * Abordajes quirúrgicos que ofrece el doctor, confirmados por él mismo
 * (ago. 2026): de la cirugía convencional a la mínimamente invasiva.
 */
export const procedureApproaches = [
  {
    slug: "minimamente-invasiva",
    name: "Cirugía mínimamente invasiva",
    description:
      "Técnicas por incisiones pequeñas, con menos daño al músculo, menos sangrado y una recuperación más corta. Se indica cuando el caso lo permite.",
    examples: [
      "Hernia discal lumbar y cervical",
      "Estenosis de canal",
      "Fijación percutánea de fracturas",
      "Procedimientos para dolor de origen degenerativo",
    ],
    image: {
      src: "/dr-angulo-equipo-quirofano.avif",
      alt: "El Dr. Angulo y su instrumentista trabajando con instrumental de mínima invasión sobre el campo quirúrgico cubierto",
      width: 1280,
      height: 852,
    },
  },
  {
    slug: "convencional",
    name: "Cirugía convencional",
    description:
      "Cuando la deformidad o el desgaste es amplio, la cirugía abierta sigue siendo la opción más segura y duradera para corregir y estabilizar la columna.",
    examples: [
      "Corrección de escoliosis y deformidades",
      "Artrodesis en varios niveles",
      "Reconstrucción tras fracturas complejas",
      "Casos de revisión",
    ],
    image: {
      src: "/dr-angulo-cirugia-instrumental.avif",
      alt: "El Dr. Angulo coloca instrumental de fijación de columna junto a su equipo quirúrgico",
      width: 1280,
      height: 853,
    },
  },
] as const satisfies readonly ProcedureApproach[];

/**
 * Slug de un abordaje, derivado del arreglo de arriba y no repetido a mano.
 *
 * `ID.procedure()` construye con esto los `@id` que el grafo raíz declara, y el
 * blog referencia esos nodos por el mismo tipo. Escrito como unión literal
 * aparte, renombrar un abordaje seguiría compilando y dejaría un `@id` colgado
 * en el marcado, sin que ninguna puerta lo notara.
 */
export type ProcedureApproachSlug =
  (typeof procedureApproaches)[number]["slug"];
