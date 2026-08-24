/**
 * Guía de reumatólogo o traumatólogo, publicada en /blog/reumatologo-o-traumatologo.
 *
 * El texto viene entero de `src/content/static-pages/preguntas-frecuentes.ts`,
 * donde el paquete on-page de v1.2 lo dejó por error: la URL decía preguntas
 * frecuentes y el cuerpo explicaba a qué especialista acudir. La fase 16 separa
 * las dos intenciones de búsqueda y este módulo se queda con la guía. Los `id`
 * de sección se conservan tal cual venían: son anclas compartibles y el cambio
 * de URL ya es bastante.
 */

import type { BlogPost } from "./index";

export const postReumatologoOTraumatologo: BlogPost = {
  slug: "reumatologo-o-traumatologo",
  title: "Reumatólogo o traumatólogo: a cuál te toca ir",
  h1: "Reumatólogo o traumatólogo: cómo saber cuál te corresponde",
  description:
    "Cuándo corresponde un reumatólogo y cuándo un traumatólogo, qué pasa en la primera cita y en qué casos se plantea operar.",
  publishedAt: "2026-08-13",
  updatedAt: "2026-08-24",
  outboundLinks: [
    { href: "/blog/artrosis", anchor: "osteoporosis o artrosis" },
    { href: "/servicios", anchor: "cirugía de columna cerca de mí" },
    { href: "/blog", anchor: "Blog" },
    { href: "/agendar", anchor: "Agendar cita" },
  ],
  bannerAfterSectionId:
    "que-es--diferencia-entre-artrosis-traumatologo-y-reumatologo",
  ctaBanner: {
    heading: "¿Todavía no sabes a quién te toca consultar?",
    body: "Cuenta tu caso y en la primera cita se te dice si corresponde a esta consulta o a otra especialidad.",
  },
  intro: [],
  sections: [
    {
      id: "que-es",
      level: 2,
      heading: "Qué es el reumatólogo o traumatólogo",
      paragraphs: [
        "Los dos se ocupan del aparato locomotor, que es el conjunto de huesos, articulaciones, músculos, tendones y ligamentos. La diferencia entre reumatólogo y traumatólogo está en el tipo de problema y en las herramientas de cada uno.",
        "El reumatólogo es el médico que trata desde el lado clínico las enfermedades que inflaman o degeneran las articulaciones y el tejido conectivo, muchas de ellas de origen autoinmune. No opera: su trabajo es diagnosticar, tratar y ajustar el tratamiento en el tiempo.",
        "El traumatólogo es el cirujano del aparato locomotor. Se ocupa de la lesión, la fractura, el desgaste mecánico y la deformidad, y puede resolverlas sin operar o en quirófano según el caso. Dentro de la traumatología hay subespecialidades, y la columna es una de ellas.",
        "La consulta del Dr. Angulo es de traumatología con subespecialidad en cirugía de columna, más ortopedia infantil. Si lo tuyo resulta ser una enfermedad inflamatoria sistémica, lo que corresponde es derivarte y no estirar la consulta.",
      ],
    },
    {
      id: "que-es--diferencia-entre-artrosis-traumatologo-y-reumatologo",
      level: 3,
      heading: "Diferencia entre artrosis traumatologo y reumatologo",
      paragraphs: [
        "La artrosis es el caso donde más se cruzan los dos, y por eso es la duda que más llega. Es un desgaste del cartílago, así que la ven los dos, y cuál te conviene depende de en qué etapa estás.",
        "El reumatólogo es el especialista al que corresponde acudir cuando hay que ordenar el diagnóstico entre varias causas posibles de dolor articular, cuando se sospecha una artritis inflamatoria detrás, o cuando el manejo médico necesita seguimiento fino.",
        "El traumatólogo entra cuando el problema es mecánico y se resuelve con eso: infiltraciones, rehabilitación dirigida o, si el desgaste avanzó y la articulación ya no responde, cirugía. En una artrosis de columna con dolor irradiado a la pierna, el detalle de qué se hace está en las guías de hernia discal y de estenosis espinal.",
      ],
    },
    {
      id: "que-es--traumatologo-y-reumatologo-es-lo-mismo",
      level: 3,
      heading: "Traumatólogo y reumatólogo es lo mismo",
      paragraphs: [
        "No, aunque se solapen. Una regla práctica que funciona casi siempre: si el problema empezó con un golpe, un esfuerzo o un movimiento concreto, y duele al usar esa parte del cuerpo, empieza por el traumatólogo.",
        "Si en cambio hay varias articulaciones tomadas a la vez, rigidez al despertar que dura un buen rato, hinchazón que va y viene sola, o fiebre y cansancio junto con el dolor, empieza por el reumatólogo. Ahí lo que se busca es una enfermedad de fondo y no una lesión.",
        "Equivocarte de puerta no es grave. Se pierde una cita, y quien te atiende te va a decir a dónde corresponde ir.",
      ],
    },
    {
      id: "sintomas",
      level: 2,
      heading: "Qué síntomas produce",
      paragraphs: [
        "Las consultas de columna llegan casi siempre por una de estas cuatro puertas: dolor de espalda que no cede, dolor que baja por una pierna o por un brazo, pérdida de fuerza o adormecimiento, y una deformidad que se nota de afuera.",
        "Lo que más orienta no es la intensidad sino el recorrido. Un dolor que se queda en la espalda y mejora en días suele ser muscular. Uno que viaja siempre por el mismo camino hacia la pierna apunta a una raíz nerviosa. Uno que aparece al caminar y se va al sentarte apunta a un canal estrecho.",
        "El desarrollo de cada uno de esos cuadros vive en su guía. Acá la pregunta es otra: qué hacer con eso, a dónde ir y qué esperar de la cita.",
      ],
    },
    {
      id: "causas",
      level: 2,
      heading: "Por qué aparece",
      paragraphs: [
        "Una parte de lo que llega a consulta es desgaste, o sea el paso de los años sobre discos y articulaciones. Otra parte es carga mal repartida, que es postura sostenida, peso levantado a lo bruto y musculatura que dejó de sostener. Y otra parte es genética y forma de la columna, que no se elige.",
        "Vale la pena separar lo que se puede cambiar de lo que no. Sobre la genética no hay nada que hacer. Sobre cómo cargas la espalda todos los días y cuánta musculatura tienes alrededor, bastante.",
        "También hay causas que no son mecánicas y por eso se estudian aparte: enfermedades inflamatorias, infecciones y problemas del metabolismo del hueso. Cuando el cuadro no encaja con el desgaste, se busca ahí.",
      ],
    },
    {
      id: "diagnostico",
      level: 2,
      heading: "Cómo se confirma el diagnóstico",
      paragraphs: [
        "La primera cita es sobre todo conversación y examen. Se revisa desde cuándo te pasa, hasta dónde llega, qué lo empeora, qué lo alivia y cómo viene evolucionando, y después vienen fuerza, reflejos, sensibilidad y algunas maniobras.",
        "Los estudios se piden para responder preguntas concretas, no por rutina. Una radiografía muestra hueso y alineación. Una resonancia muestra disco, raíz y contenido del canal. Pedir la imagen antes de examinar suele generar más ansiedad que respuestas, porque un informe siempre encuentra algo.",
        "Si ya tienes estudios, llévalos completos y no solo el informe: las imágenes se miran, el papel se lee. Y llévalos aunque tengan años, porque comparar es lo que muestra si algo cambió.",
        "Qué llevar, en concreto: los estudios que tengas, la lista de medicamentos que tomas, qué tratamientos ya hiciste y por cuánto tiempo, y una nota de cómo viene el dolor semana a semana. Con eso la consulta rinde bastante más.",
      ],
    },
    {
      id: "sin-operar",
      level: 2,
      heading: "Qué se puede hacer sin operar",
      paragraphs: [
        "La mayoría de los problemas de columna se maneja sin quirófano. El esquema se repite: controlar el dolor con lo que te indique tu médico, mantener el movimiento que toleres, terapia física dirigida y corregir la mecánica que llevó al problema.",
        "Ese manejo necesita tiempo para mostrar si sirve. Semanas, no días. Abandonarlo en la primera semana y concluir que no funcionó es el error más común, y el que más gente lleva a pedir una cirugía que quizá no necesita.",
        "Cuando el dolor por compromiso de una raíz no cede, hay un escalón intermedio antes del quirófano: las infiltraciones guiadas por imagen. No arreglan la causa. Bajan el dolor lo suficiente para que la terapia pueda avanzar.",
      ],
    },
    {
      id: "cirugia",
      level: 2,
      heading: "Cuándo hace falta operar",
      paragraphs: [
        "Operar se plantea en tres situaciones, y ninguna de las tres es que la resonancia se vea fea. Cuando hay pérdida de fuerza que progresa. Cuando aparecen signos de compresión seria del canal. Y cuando el dolor incapacitante sigue igual pese a un manejo conservador bien hecho y sostenido.",
        "La decisión se toma con dos cosas sobre la mesa: qué te está limitando hoy y qué muestran tus estudios. Si las dos no coinciden, la cirugía no es el camino todavía.",
        "Sobre el miedo a operarse, que es la duda que más se repite y la más razonable: lo que corresponde es que en la consulta se explique el procedimiento concreto de tu caso, los riesgos reales y qué esperar de la recuperación. Una decisión informada se puede tomar con miedo. Sin información, no.",
        "Y si te dijeron que hay que operar y no estás seguro, una segunda opinión con los estudios en la mano es una decisión razonable. Nadie debería tomárselo a mal.",
      ],
    },
  ],
};
