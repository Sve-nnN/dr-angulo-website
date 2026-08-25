/**
 * Cuerpo de texto del hub del blog (TRUST-01).
 *
 * Hasta la fase 19 `/blog` era solo un listado de enlaces, y un listado no le
 * da al paciente nada que no obtenga entrando a uno de ellos. Esta prosa
 * explica qué clase de artículo se publica acá y con qué criterio, para que la
 * página se sostenga sola.
 *
 * Reusa `ContentSection` por la misma razón que `hub-servicios.ts`: es la misma
 * clase de contenido que la de las guías, y abrir un modelo paralelo obligaría
 * a mantenerlo en dos sitios.
 *
 * Los `id` son anclas compartibles y no se cambian. Una reescritura del texto
 * no puede romperlas.
 *
 * No promete frecuencia de publicación, a propósito: una promesa que el
 * consultorio no sostenga envejece mal y queda a la vista de cualquiera
 * (decisión de `19-CONTEXT.md`).
 */

import type { StaticPage } from "./types";

/** H1 publicado de la ruta. La página todavía lo escribe a mano. */
export const hubBlogH1 = "Artículos sobre columna y traumatología";

export const hubBlog: StaticPage = {
  slug: "/blog",
  format: "pagina-de-servicio",
  h1: hubBlogH1,
  sections: [
    {
      id: "que-se-publica-aca",
      level: 2,
      heading: "Qué vas a encontrar en estos artículos",
      paragraphs: [
        "Cada artículo de esta sección responde una duda concreta que aparece en la consulta, casi siempre antes de la primera cita. Por qué duele la zona lumbar. Por qué el dolor baja por la pierna. Qué diferencia hay entre ir al reumatólogo y venir al traumatólogo. Qué significa realmente que a alguien le planteen operarse la columna.",
        "El texto está escrito para leerse sin formación médica. No hay tecnicismos sueltos: cuando aparece uno, va explicado ahí mismo, porque un paciente que entiende lo que le pasa toma mejores decisiones sobre su tratamiento.",
        "Lo que no vas a encontrar es un diagnóstico. Ningún artículo, escrito por mí ni por nadie, puede examinarte. Lo que sí puede hacer es que llegues a la consulta con las preguntas correctas.",
      ],
    },
    {
      id: "como-elijo-los-temas",
      level: 2,
      heading: "Cómo elijo de qué escribir",
      paragraphs: [
        "Los temas salen de lo que la gente pregunta, no de lo que sería interesante explicar. Si una duda se repite en el consultorio y en los mensajes que me llegan, es candidata a artículo.",
        "Eso explica que la lista se vea desigual. Hay condiciones frecuentes que todavía no tienen su texto y hay dudas aparentemente menores que sí lo tienen, porque generaban más confusión de la que uno esperaría. La utilidad manda por encima de la prolijidad del índice.",
      ],
    },
    {
      id: "articulo-o-guia-completa",
      level: 2,
      heading: "Cuándo un artículo se queda corto y conviene la guía",
      paragraphs: [
        "El blog y las guías clínicas del sitio hacen trabajos distintos. Un artículo entra a una duda puntual y la resuelve. Una guía recorre una condición entera: cómo se manifiesta, cómo se estudia, qué alternativas hay antes de la cirugía y qué pasa si al final hace falta operar.",
        "Si el artículo que estás leyendo te deja con ganas de más, es probable que la condición tenga su guía propia en la sección de servicios. Los artículos enlazan a ellas cuando corresponde. Ese es el orden natural: primero entender el síntoma, después entender el cuadro.",
      ],
    },
    {
      id: "si-no-esta-lo-que-buscas",
      level: 2,
      heading: "Si lo que buscas no está acá",
      paragraphs: [
        "Puede pasar, y no significa que la duda sea rara. Significa que todavía no le tocó turno.",
        "En ese caso hay dos caminos razonables. Uno es revisar las guías de la sección de servicios, que cubren las condiciones de columna con bastante más detalle que un artículo. El otro es escribir y preguntarlo directamente: si el dolor cambió de carácter, si apareció debilidad en una pierna o si algo te viene preocupando desde hace semanas, eso no se resuelve leyendo, se resuelve examinando.",
      ],
    },
  ],
};
