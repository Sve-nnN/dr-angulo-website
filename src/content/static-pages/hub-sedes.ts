/**
 * Cuerpo de texto del hub de sedes (TRUST-01).
 *
 * Hasta la fase 19 `/sedes` era una rejilla de tarjetas. La rejilla dice dónde
 * atiende el doctor; esta prosa dice cómo elegir entre las cuatro, que es la
 * decisión que el paciente trae sin resolver cuando llega acá.
 *
 * Deliberadamente **no** repite horarios concretos, canales de contacto ni la
 * mecánica de agendar: eso ya lo resuelven `/agendar` y la ficha de cada sede,
 * y duplicarlo obligaría a mantener el mismo dato en tres lugares. Acá se
 * explica el criterio, no el calendario.
 *
 * Los `id` son anclas compartibles y no se cambian.
 */

import type { StaticPage } from "./types";

/** H1 publicado de la ruta. La página todavía lo escribe a mano. */
export const hubSedesH1 = "Sedes donde atiende el Dr. Angulo en Lima";

export const hubSedes: StaticPage = {
  slug: "/sedes",
  format: "pagina-de-servicio",
  h1: hubSedesH1,
  sections: [
    {
      id: "por-que-hay-varias-sedes",
      level: 2,
      heading: "Por qué hay más de una sede",
      paragraphs: [
        "Atiendo en cuatro lugares de Lima porque los pacientes vienen de zonas muy distintas y porque no todos los estudios ni todos los procedimientos se resuelven en el mismo sitio. La consulta es la misma en las cuatro: el criterio clínico, la forma de examinar y las alternativas que se plantean no cambian según la dirección.",
        "Lo que sí cambia es lo práctico. Los días de atención, la manera de sacar la cita y lo que cada sede tiene disponible en su propio edificio. Por eso conviene elegir con algo más que la cercanía.",
      ],
    },
    {
      id: "elegir-por-zona",
      level: 2,
      heading: "Primero, por dónde te queda",
      paragraphs: [
        "Las sedes están repartidas entre Santiago de Surco, San Isidro y La Molina. Si vives o trabajas cerca de alguna de esas zonas, ese suele ser el criterio más fuerte, y no por comodidad: por lo que viene después.",
        "Un tratamiento de columna casi nunca se resuelve en una sola visita. Hay controles, y a veces terapia o estudios de imagen intercalados. Una sede que te queda razonablemente cerca es una sede a la que vas a volver sin postergarlo. Una que te obliga a cruzar Lima en hora punta termina siendo la excusa perfecta para saltarse el control.",
        "Si vienes acompañado de alguien que maneja, o si el dolor te complica el traslado largo, ese peso sube todavía más.",
      ],
    },
    {
      id: "elegir-por-dias",
      level: 2,
      heading: "Después, por los días en que atiendo ahí",
      paragraphs: [
        "Cada sede tiene sus propios días de atención, y no se superponen del todo. Eso significa que la sede más cercana no siempre es la que puede verte esta semana.",
        "Vale la pena mirarlo al revés de lo habitual: en vez de elegir el lugar y después buscar cuándo hay cupo, mira primero qué días te sirven de verdad, contando el permiso en el trabajo o quién te acompaña, y recién ahí elige la sede que atiende esos días. La ficha de cada sede tiene el detalle, y la página de agenda las reúne todas para compararlas de una sola mirada.",
      ],
    },
    {
      id: "elegir-por-cobertura",
      level: 2,
      heading: "Por último, cómo se paga en cada una",
      paragraphs: [
        "Acá hay una diferencia real entre el consultorio privado y las clínicas. En el consultorio la consulta es particular y se resuelve directo. En una clínica, la admisión, la facturación y lo que tu seguro reconoce los define la clínica, no el médico, y varían según el plan que tengas.",
        "La recomendación práctica es simple: si vas a usar un seguro, confírmalo con la clínica antes de la cita, no el día de la cita. Preguntar por la cobertura de la consulta y por la de los estudios que podrían pedirse después evita la sorpresa más común, que es descubrir en el mostrador que una cosa entraba y la otra no.",
      ],
    },
    {
      id: "que-mirar-antes-de-decidir",
      level: 2,
      heading: "Qué mirar antes de decidir",
      paragraphs: [
        "Entra a la ficha de la sede que estés considerando y fíjate en tres cosas: la dirección exacta con la referencia de cómo llegar, los días en que atiendo ahí, y con quién se agenda. Con eso alcanza para decidir.",
        "Y si dudas entre dos, elige la que te permita llegar sin apuro. Llegar tarde y agitado a una consulta de columna no arruina la evaluación, pero le quita al examen físico parte de la información que lo hace más útil.",
      ],
    },
  ],
};
