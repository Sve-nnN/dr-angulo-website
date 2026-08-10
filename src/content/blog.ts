import type { ServicePage } from "@/content/service-pages";

/**
 * Sección de un post. El `id` se escribe a mano en este archivo y no se genera
 * a partir del título en tiempo de render: pasa a ser un ancla compartible, y
 * un cambio de redacción no puede romper un enlace que alguien ya mandó por
 * WhatsApp. Mismo criterio que las páginas de servicio.
 */
export type BlogSection = {
  /** kebab-case sin tildes. Es el `id` del h2 y el destino del ancla. */
  id: string;
  heading: string;
  paragraphs: string[];
  subsections?: { heading: string; paragraphs: string[] }[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  /** Guía del silo a la que empuja este post. */
  relatedService: ServicePage["slug"];
  ctaBanner: { heading: string; body: string };
  intro: string[];
  sections: BlogSection[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "5-sintomas-de-columna-que-no-debes-ignorar",
    title: "5 síntomas de columna que no debes ignorar",
    description:
      "Estas señales indican que tu columna necesita una evaluación médica, no solo reposo.",
    publishedAt: "2026-06-10",
    updatedAt: "2026-08-10",
    relatedService: "hernia-discal",
    ctaBanner: {
      heading: "¿Reconoces alguna de estas señales?",
      body: "Una evaluación con estudios propios define si lo tuyo necesita tratamiento o solo control.",
    },
    intro: [
      "El dolor de espalda es tan común que muchas personas aprenden a convivir con él, postergando la consulta hasta que la molestia se vuelve insoportable. El problema es que algunos síntomas no son 'solo cansancio' — son señales de que la columna necesita atención médica cuanto antes.",
    ],
    sections: [
      {
        id: "dolor-persistente",
        heading: "Dolor persistente o que empeora con el tiempo",
        paragraphs: [
          "Un dolor que no cede después de unos días de reposo, o que va a más semana a semana, ya no entra en la categoría de 'molestia pasajera'.",
        ],
      },
      {
        id: "dolor-irradiado",
        heading: "Dolor que se irradia a brazos o piernas",
        paragraphs: [
          "Cuando el dolor deja de quedarse en la espalda y baja por una pierna o sube por un brazo, suele indicar compromiso de un nervio, no un simple esguince muscular.",
        ],
      },
      {
        id: "hormigueo-o-entumecimiento",
        heading: "Hormigueo o entumecimiento en las extremidades",
        paragraphs: [
          "Esa sensación de 'hormigas' u adormecimiento que acompaña al dolor es otra señal de alerta neurológica que conviene evaluar pronto.",
        ],
      },
      {
        id: "rigidez-al-moverte",
        heading: "Rigidez o dificultad para moverte con normalidad",
        paragraphs: [
          "Si notas que te cuesta agacharte, girar el torso o simplemente levantarte de la cama como antes, vale la pena revisar qué está pasando.",
        ],
      },
      {
        id: "perdida-de-fuerza",
        heading: "Pérdida de fuerza en brazos o piernas",
        paragraphs: [
          "Es la señal más seria de esta lista: si sientes que una pierna o un brazo 'no responde' igual que antes, no esperes más para consultar.",
        ],
      },
      {
        id: "que-hacer-con-estas-senales",
        heading: "Qué hacer si reconoces alguna de estas señales",
        paragraphs: [
          "Ninguno de estos síntomas significa automáticamente que necesitas cirugía — la mayoría de los casos se resuelven con tratamiento conservador. Pero sí significan que una evaluación con un especialista te va a dar claridad, en lugar de seguir adivinando qué es lo que tienes.",
        ],
      },
    ],
  },
  {
    slug: "hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
    title: "¿Dolor de espalda o hernia discal? Cómo diferenciarlos",
    description:
      "No todo dolor de espalda es una hernia discal, pero hay señales que ayudan a distinguirlos.",
    publishedAt: "2026-06-17",
    updatedAt: "2026-08-10",
    relatedService: "hernia-discal",
    ctaBanner: {
      heading: "¿Tu dolor se queda en la espalda o baja por la pierna?",
      body: "Esa diferencia cambia el tratamiento. Una evaluación con tus estudios lo define.",
    },
    intro: [
      "Uno de los mayores focos de ansiedad al sentir dolor de espalda es no saber si se trata de algo pasajero o de algo serio como una hernia discal. Aunque solo un examen clínico (y a veces una resonancia) confirma el diagnóstico, hay diferencias que orientan bastante.",
    ],
    sections: [
      {
        id: "como-se-comporta-un-dolor-muscular",
        heading: "Cómo se comporta un dolor muscular común",
        paragraphs: [
          "Un dolor muscular común — una contractura — suele localizarse en una zona puntual de la espalda, mejora notablemente con reposo, calor local y unos días, y no suele acompañarse de síntomas en las piernas.",
        ],
      },
      {
        id: "como-se-comporta-una-hernia-discal",
        heading: "Cómo se comporta una hernia discal",
        paragraphs: [
          "Una hernia discal, en cambio, con frecuencia se manifiesta como un dolor que baja por la pierna (lo que se conoce como ciática), puede venir acompañado de hormigueo o adormecimiento, y no mejora — o incluso empeora — solo con reposo.",
        ],
      },
      {
        id: "cuando-dejar-de-esperar",
        heading: "Cuándo dejar de esperar y consultar",
        paragraphs: [
          "Si tu dolor 'baja por la pierna' y no cede en pocos días, no lo trates como una simple contractura: agenda una evaluación para descartar compromiso del disco o del nervio.",
        ],
      },
    ],
  },
  {
    slug: "miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber",
    title: "¿Tienes miedo a operarte de la columna? 5 cosas que debes saber",
    description:
      "Resolvemos las dudas más comunes de quienes enfrentan por primera vez la posibilidad de una cirugía de columna.",
    publishedAt: "2026-06-24",
    updatedAt: "2026-08-10",
    relatedService: "hernia-discal",
    ctaBanner: {
      heading: "¿Te dijeron que necesitas operarte y quieres otra opinión?",
      body: "Una consulta con tus estudios en mano aclara qué corresponde en tu caso antes de decidir.",
    },
    intro: [
      "Es una de las preguntas más frecuentes en consulta: '¿es tan riesgoso como parece operarse de la columna?'. El miedo es comprensible — pero suele basarse en ideas desactualizadas sobre cómo era la cirugía de columna hace 20 años.",
    ],
    sections: [
      {
        id: "no-toda-hernia-termina-en-cirugia",
        heading: "No toda hernia o dolor de columna termina en cirugía",
        paragraphs: [
          "La mayoría de los casos se maneja primero con tratamiento conservador: fisioterapia, medicación, cambios de hábitos.",
        ],
      },
      {
        id: "la-cirugia-necesita-una-razon-concreta",
        heading: "La cirugía se plantea cuando hay una razón concreta",
        paragraphs: [
          "La cirugía se plantea cuando hay una razón concreta para hacerlo — dolor que no responde a otros tratamientos, o compromiso neurológico progresivo. Nunca debería ser la primera opción sin haber intentado antes lo demás.",
        ],
      },
      {
        id: "las-tecnicas-cambiaron",
        heading: "Las técnicas cambiaron respecto de lo que se cuenta",
        paragraphs: [
          "Existen técnicas orientadas a reducir el trauma quirúrgico y acelerar la recuperación frente a los abordajes tradicionales de hace años.",
        ],
      },
      {
        id: "la-recuperacion-es-individual",
        heading: "La recuperación se planea de forma individual",
        paragraphs: [
          "La recuperación se planea de forma individual: no es lo mismo el plan de un paciente joven y activo que el de un paciente mayor con otras condiciones.",
        ],
      },
      {
        id: "la-decision-siempre-es-informada",
        heading: "La decisión siempre es informada",
        paragraphs: [
          "La decisión siempre es informada. Antes de recomendar cualquier procedimiento, la consulta debe dejarte claro qué se haría, por qué, y qué esperar después — para que decidas sin miedo a lo desconocido.",
        ],
      },
    ],
  },
  {
    slug: "estenosis-espinal-que-es",
    title: "Estenosis espinal: qué es y por qué aparece con la edad",
    description:
      "La estenosis degenerativa es más frecuente después de los 60 años y más común en mujeres. Esto es lo que debes saber.",
    publishedAt: "2026-07-01",
    updatedAt: "2026-08-10",
    relatedService: "estenosis-espinal",
    ctaBanner: {
      heading: "¿Caminas menos que antes por dolor o pesadez en las piernas?",
      body: "Una evaluación define cuánto se redujo el espacio del canal y qué opciones tienes.",
    },
    intro: [
      "La estenosis espinal es el estrechamiento del canal por donde pasa la médula y las raíces nerviosas dentro de la columna. Cuando ese espacio se reduce, los nervios pueden quedar comprimidos, generando dolor, hormigueo o pesadez en las piernas, especialmente al caminar.",
    ],
    sections: [
      {
        id: "por-que-aparece-con-la-edad",
        heading: "Por qué aparece con la edad",
        paragraphs: [
          "La forma más común, la estenosis degenerativa, aparece generalmente después de los 60 años como parte del desgaste natural de la columna, y es más frecuente en mujeres.",
        ],
      },
      {
        id: "la-senal-que-mas-orienta",
        heading: "La señal que más orienta",
        paragraphs: [
          "Una señal característica es que el malestar aumenta al caminar o estar de pie por periodos largos, y mejora al sentarse o inclinarse hacia adelante — algo que muchos pacientes describen sin saber que tiene un nombre médico concreto.",
        ],
      },
      {
        id: "como-se-trata",
        heading: "Cómo se trata",
        paragraphs: [
          "El tratamiento depende de qué tan avanzado esté el estrechamiento y de cómo afecta tu día a día: en muchos casos se maneja de forma conservadora, y solo en casos más avanzados se conversa la opción quirúrgica.",
        ],
      },
    ],
  },
];
