/**
 * Cuerpo de texto del inicio. Cinco secciones del esqueleto de página de
 * servicio con las trece subsecciones que responden las preguntas y las
 * búsquedas relacionadas de la SERP de `traumatología lima`.
 *
 * El texto se transcribe literal del paquete on-page de v1.2
 * (`paquetes/home.md`), aprobado por el doctor el 2026-08-13. No se
 * parafrasea ni se acorta: los `id` salen del campo `clave` del dataset y son
 * anclas compartibles, así que un cambio de redacción no puede romperlas.
 */

import type { StaticPage } from "./types";

export const homePage: StaticPage = {
  slug: "/",
  format: "pagina-de-servicio",
  sections: [
    {
      id: "que-se-atiende",
      level: 2,
      heading: "Qué se atiende",
      paragraphs: [
        "La traumatología se ocupa del aparato locomotor: huesos, articulaciones, músculos, tendones y ligamentos. Todo lo que te sostiene y te permite moverte. Cuando algo de eso duele, se traba o se rompe, esta es la especialidad que lo evalúa.",
        "El Dr. Juan Carlos Angulo ejerce la traumatología en Lima con dedicación a la columna, y también ve ortopedia general del adulto y del niño. Las lesiones que más llegan a la consulta son las de espalda y cuello, las de rodilla y las fracturas que quedaron con secuela.",
        "Si todavía no sabes si tu caso corresponde a esta especialidad, la regla práctica es sencilla: si el problema está en un hueso, en una articulación o en la columna, empieza acá. Si resulta que no, se te dice en la primera cita.",
      ],
    },
    {
      id: "que-se-atiende--cual-es-el-mejor-traumatologo-de-lima",
      level: 3,
      heading: "¿Cuál es el mejor traumatólogo de Lima?",
      paragraphs: [
        "No hay respuesta honesta a esa pregunta. Quien te la conteste con nombre y apellido te está vendiendo algo.",
        "Lo que sí puedes evaluar antes de decidir: que el profesional tenga registro vigente, que dedique su práctica al tipo de problema que tienes, que te explique las alternativas sin apuro y que no te proponga cirugía en la primera cita sin haber agotado lo que se puede hacer antes.",
        "Los médicos que trabajan bien se parecen en eso. Te dicen qué todavía no saben, piden los estudios que hacen falta y no los que rellenan una carpeta.",
      ],
    },
    {
      id: "que-se-atiende--cuanto-cobra-un-traumatologo-en-peru",
      level: 3,
      heading: "¿Cuánto cobra un traumatólogo en Perú?",
      paragraphs: [
        "Depende de la sede, del seguro que tengas y de si la cita incluye la lectura de estudios previos. Acá no vas a encontrar una tarifa publicada, porque cambiaría cada pocos meses y te dejaría con un número viejo en la cabeza.",
        "Lo transparente es preguntarlo al momento de agendar. Cada clínica maneja su propio tarifario y la atención por seguro se coordina con la aseguradora antes de la cita.",
      ],
    },
    {
      id: "que-se-atiende--que-casos-trata-un-traumatologo",
      level: 3,
      heading: "¿Qué casos trata un traumatólogo?",
      paragraphs: [
        "Dolor de espalda y de cuello que no cede. Hernia discal, canal estrecho, escoliosis y otras deformidades de la columna.",
        "Del resto del cuerpo: dolor de rodilla, de hombro y de cadera, lesiones deportivas, esguinces, fracturas y las secuelas que dejan cuando consolidan mal. También la ortopedia del niño, que tiene reglas propias porque el hueso todavía está creciendo.",
        "El tratamiento casi nunca empieza en el quirófano. Empieza por un diagnóstico bien hecho, y de ahí sale todo lo demás.",
      ],
    },
    {
      id: "que-se-atiende--traumatologia-especialista-en-columna",
      level: 3,
      heading: "Cuándo el problema viene de la columna",
      paragraphs: [
        "Un dolor que baja por la pierna o por el brazo, que sigue siempre el mismo recorrido y que trae hormigueo o pérdida de fuerza, suele venir de la columna y no del músculo.",
        "Esa parte de la consulta tiene página propia, con las condiciones explicadas una por una y con el detalle de cómo se decide operar y cómo se decide esperar. Desde acá se llega en un clic.",
      ],
    },
    {
      id: "que-se-atiende--traumatologo-ortopedia-infantil",
      level: 3,
      heading: "El traumatólogo que ve ortopedia infantil",
      paragraphs: [
        "La ortopedia del niño no es la del adulto en versión chica. El hueso está creciendo, y eso cambia el diagnóstico, los plazos y hasta la decisión de tratar o de esperar y controlar.",
        "Pie plano, marcha con las puntas hacia adentro, displasia de cadera, desviaciones de la columna en crecimiento y fracturas: eso es lo que más llega. La consulta pediátrica tiene su propia página con el detalle.",
      ],
    },
    {
      id: "que-se-atiende--traumatologia-y-ortopedia-cerca-de-mi",
      level: 3,
      heading: "Traumatología y ortopedia cerca de mí",
      paragraphs: [
        "La búsqueda de cercanía es razonable. Un tratamiento de columna o de rodilla no es una cita y listo: son controles repartidos en varias semanas.",
        "La consulta funciona en cuatro puntos de Lima, en el consultorio de Surco, en la Clínica Ricardo Palma, en la Clínica Sanna La Molina y en la Clínica Padre Luis Tezza. Conviene elegir por la sede a la que puedas volver sin pelearte con el tráfico, no por la que tenga el primer cupo libre.",
      ],
    },
    {
      id: "que-se-atiende--traumatologo-cerca-de-mi",
      level: 3,
      heading: "Traumatólogo cerca de mí",
      paragraphs: [
        "Si escribiste eso en el buscador, lo que quieres es una cita pronto y sin cruzar la ciudad entera.",
        "Las sedes están en Surco, San Isidro y La Molina, así que hay opción hacia el centro y hacia el este de Lima. La página de cada sede trae dirección, horario y cómo llegar.",
      ],
    },
    {
      id: "que-se-atiende--hospital-de-traumatologia-en-lima",
      level: 3,
      heading: "Hospital de traumatología en Lima",
      paragraphs: [
        "En Lima la traumatología se atiende en hospitales públicos, en clínicas privadas y en consultorios. La diferencia práctica no es el edificio: es cuánto vas a esperar por una resonancia y quién te va a ver en el control.",
        "Esta consulta es privada y funciona en clínica y en consultorio. Si ya tienes historia en un hospital, trae tus estudios: sirven igual y evitan repetir lo que ya está hecho.",
      ],
    },
    {
      id: "que-se-atiende--traumatologo-especialista-en-rodilla-lima-peru",
      level: 3,
      heading: "El traumatólogo de rodilla",
      paragraphs: [
        "Después de la espalda, la rodilla es la que más consulta genera. Menisco, ligamento cruzado, artrosis y dolor por sobrecarga en gente que corre o que subió de peso rápido.",
        "La evaluación arranca con el examen físico y sigue con imágenes solo si aportan algo. Una resonancia pedida antes de que alguien te examine suele traer más dudas que respuestas.",
      ],
    },
    {
      id: "que-se-atiende--traumatologia-solidaridad",
      level: 3,
      heading: "Si te atendiste en un hospital público y quieres otra opinión",
      paragraphs: [
        "Pasa seguido. Alguien recibe un diagnóstico en una consulta de diez minutos, sale con una indicación de cirugía y quiere escuchar a otro médico antes de decidir.",
        "Pedir una segunda opinión no ofende a nadie que trabaje bien. Trae los estudios y el informe que te entregaron, y la conversación arranca donde quedó en vez de empezar de cero.",
      ],
    },
    {
      id: "que-se-atiende--traumatologo-en-los-olivos",
      level: 3,
      heading: "Si buscas traumatólogo en Los Olivos o en otro distrito",
      paragraphs: [
        "Lima es grande y no en todos los distritos hay consulta de columna. Si vives en el norte o en el este, la pregunta útil no es cuál queda más cerca hoy, sino en cuál vas a poder cumplir los controles de los próximos meses.",
        "La primera cita puede ser la que te quede lejos, si ahí se resuelve el diagnóstico. El seguimiento conviene coordinarlo en la sede que te sea más fácil de alcanzar.",
      ],
    },
    {
      id: "que-se-atiende--traumatologo-especialista-en-mano-lima",
      level: 3,
      heading: "Si el problema es de mano o de muñeca",
      paragraphs: [
        "Buscar un traumatólogo en Lima para un problema de mano tiene una vuelta que conviene saber: la mano tiene subespecialidad propia, y hay cuadros que se derivan a un cirujano de mano.",
        "En consulta se evalúa el caso y, si corresponde otra subespecialidad, se te dice en la primera cita en lugar de hacerte dar vueltas por consultorios.",
      ],
    },
    {
      id: "que-se-atiende--traumatologo-especialista-en-pie-y-tobillo-en-lima",
      level: 3,
      heading: "Pie y tobillo: a quién consultar",
      paragraphs: [
        "El esguince que no termina de curar, el dolor en el talón al primer paso de la mañana y las deformidades del pie son consultas frecuentes de traumatología en Lima.",
        "Se evalúan acá y, cuando el caso pide un especialista de pie y tobillo, se deriva con el estudio ya hecho y no con la carpeta vacía.",
      ],
    },
    {
      id: "como-es-la-consulta",
      level: 2,
      heading: "Cómo es la consulta",
      paragraphs: [
        "La primera cita arranca con lo que tú cuentas: desde cuándo duele, hasta dónde llega, qué lo empeora y qué lo alivia. Ese relato orienta más que cualquier informe.",
        "Después viene el examen físico, que en traumatología define bastante más de lo que la gente supone. Fuerza, reflejos, sensibilidad, rango de movimiento y algunas maniobras que reproducen el síntoma. Recién ahí se decide qué imagen hace falta, si es que hace falta alguna.",
        "Sales sabiendo qué te pasa, qué se hace primero y cuándo se vuelve a evaluar. Si algo no queda claro, se pregunta ahí mismo: repetir una explicación cuesta menos que un tratamiento mal entendido.",
      ],
    },
    {
      id: "condiciones",
      level: 2,
      heading: "Qué condiciones se tratan",
      paragraphs: [
        "De la columna: hernia discal, estenosis o canal estrecho, escoliosis y deformidades, lumbalgia y cervicalgia que ya llevan meses.",
        "Del resto del aparato locomotor: artrosis de rodilla y de cadera, lesiones de menisco y de ligamentos, tendinitis, fracturas recientes y las que consolidaron en mala posición.",
        "Cada condición de columna tiene su guía completa en este mismo sitio, con síntomas, diagnóstico y opciones de tratamiento. Acá se nombran; ahí se explican con calma.",
      ],
    },
    {
      id: "condiciones--que-es-la-traumatologia-de-la-rodilla",
      level: 3,
      heading: "¿Qué es la traumatología de la rodilla?",
      paragraphs: [
        "Es la parte de la especialidad que se ocupa de esa articulación: el cartílago, los meniscos, los ligamentos y el hueso que los sostiene.",
        "Un dolor de rodilla puede venir de un menisco roto, de artrosis, de un ligamento que quedó laxo tras una torcedura vieja o de sobrecarga por la forma de pisar. El tratamiento cambia bastante según cuál de esas cosas sea, y por eso el diagnóstico manda sobre la técnica.",
      ],
    },
    {
      id: "donde-se-atiende",
      level: 2,
      heading: "Dónde se atiende",
      paragraphs: [
        "La consulta funciona en el consultorio de Surco, en la Clínica Ricardo Palma, en la Clínica Sanna La Molina y en la Clínica Padre Luis Tezza.",
        "Cada sede tiene su página con dirección, horario y cómo llegar. Si tienes seguro, conviene revisar en cuál te cubre antes de reservar, porque eso cambia el trámite más que la distancia.",
      ],
    },
    {
      id: "donde-se-atiende--mejor-clinica-de-traumatologia-en-lima",
      level: 3,
      heading: "Mejor clínica de traumatología en Lima",
      paragraphs: [
        "Ninguna clínica es la mejor para todo. Lo que cambia el resultado es quién te evalúa, con qué experiencia en tu problema concreto, y qué tan bien se coordina lo que viene después de la cita.",
        "Dicho eso, la sede sí importa para lo práctico: qué equipos de imagen tiene, cómo trabaja con tu seguro y en cuánto consigues el control. Eso se pregunta al agendar y se responde en el momento.",
      ],
    },
    {
      id: "donde-se-atiende--traumatologia-clinica-internacional",
      level: 3,
      heading: "Y si buscabas otra clínica de Lima",
      paragraphs: [
        "Varias clínicas grandes de la ciudad tienen especialistas de traumatología y ortopedia, y esta consulta no atiende en todas.",
        "Las sedes donde sí puedes encontrarla son las cuatro de arriba. Si tu seguro te obliga a atenderte en otra, la segunda opinión sigue siendo posible: se coordina como consulta particular y con los estudios que ya te hicieron.",
      ],
    },
    {
      id: "como-agendar",
      level: 2,
      heading: "Cómo agendar una cita",
      paragraphs: [
        "Puedes pedir la cita desde el formulario del sitio o escribir contando tu caso, si prefieres explicar antes de reservar. Las citas en clínica las gestiona cada clínica y el consultorio de Surco se coordina de forma directa.",
        "Lleva los estudios que tengas, incluso los viejos. Comparar una resonancia de hace dos años con la de ahora dice bastante más que cualquiera de las dos por separado.",
      ],
    },
  ],
  outboundLinks: [
    { href: "/servicios", anchor: "mejor neurocirujano de columna lima" },
    { href: "/sedes", anchor: "Sedes donde atiende el Dr. Juan Carlos Angulo en Lima" },
    { href: "/blog", anchor: "Blog" },
    { href: "/preguntas-frecuentes", anchor: "artrosis traumatologo o reumatologo" },
    { href: "/sobre-el-doctor", anchor: "Dr. Juan Carlos Angulo" },
    { href: "/testimonios", anchor: "Testimonios de pacientes" },
    { href: "/contacto", anchor: "Contacto y Citas en Lima" },
    { href: "/agendar", anchor: "Agendar cita" },
  ],
};
