import type { BlogPost } from "./index";

export const postLumbalgia: BlogPost = {
  slug: "lumbalgia",
  topicEntities: [
    {
      kind: "condition",
      name: "Lumbalgia",
      alternateNames: ["Dolor lumbar", "Dolor de espalda baja"],
    },
  ],
  title: "Lumbalgia: por qué duele la zona lumbar",
  h1: "Lumbalgia: el dolor de la parte baja de la espalda",
  description:
    "Qué causa la lumbalgia, qué tipos hay, qué ejercicios ayudan y cuándo el dolor de la zona baja de la espalda necesita evaluación.",
  publishedAt: "2026-08-13",
  updatedAt: "2026-08-24",
  relatedService: "hernia-discal",
  outboundLinks: [
    {
      href: "/servicios/hernia-discal",
      anchor: "Guía sobre la hernia discal",
    },
    { href: "/blog/artrosis", anchor: "Cómo se maneja la artrosis" },
    {
      href: "/blog/ciatica",
      anchor: "Cuándo el dolor de pierna viene de la columna",
    },
    {
      href: "/blog/cirugia-de-columna",
      anchor: "Qué conviene saber antes de operarse de la columna",
    },
    { href: "/blog", anchor: "Blog" },
    { href: "/servicios", anchor: "Qué condiciones se tratan en cada especialidad" },
  ],
  bannerAfterSectionId: "sintomas",
  ctaBanner: {
    heading: "¿El dolor lumbar ya baja por la pierna?",
    body: "Esa diferencia cambia el tratamiento. Una evaluación con tus estudios lo define.",
  },
  intro: [],
  sections: [
    {
      id: "que-es",
      level: 2,
      heading: "Qué es la lumbalgia",
      paragraphs: [
        "La lumbalgia es el dolor de la zona baja de la espalda, la franja que va desde las últimas costillas hasta el pliegue de los glúteos. No es un diagnóstico cerrado: es el nombre del síntoma, igual que la fiebre.",
        "Mucha gente la conoce como lumbago, y las dos palabras nombran lo mismo. Lo que cambia entre un caso y otro es la causa: una sobrecarga muscular, una articulación irritada, un disco que se está quejando o, con bastante menos frecuencia, algo que necesita estudio pronto.",
        "La zona lumbar carga peso todo el día y se mueve en todas direcciones, así que es la parte de la columna que más consultas genera.",
      ],
    },
    {
      id: "que-es--tipos-de-lumbalgia",
      level: 3,
      heading: "Tipos de lumbalgia",
      paragraphs: [
        "Por tiempo se habla de lumbalgia aguda, subaguda y crónica, y ese reloj ordena bastante la conducta.",
        "Por mecanismo se separa la lumbalgia mecánica, que empeora con el movimiento y afloja con el reposo, de la inflamatoria, que despierta de noche y mejora al levantarse. Y se separa aparte el dolor lumbar que se irradia a la pierna, porque ahí hay un nervio comprometido y el manejo cambia.",
      ],
    },
    {
      id: "que-es--lumbalgia-aguda",
      level: 3,
      heading: "Lumbalgia aguda",
      paragraphs: [
        "Es la que aparece de golpe y lleva poco tiempo instalada. Suele venir después de un mal gesto, de un esfuerzo o de un día largo, y muchas veces no se encuentra una lesión concreta que la explique.",
        "La mayoría mejora sola en unas semanas si la persona se mantiene en movimiento dentro de lo que tolera. El reposo en cama, que era el consejo de antes, se desaconseja salvo los primeros días y solo si el dolor no deja de otra forma.",
      ],
    },
    {
      id: "que-es--lumbalgia-cronica",
      level: 3,
      heading: "Lumbalgia crónica",
      paragraphs: [
        "Cuando el dolor lleva meses instalado deja de comportarse como una lesión que cicatriza. Entran a pesar el descondicionamiento muscular, el miedo a moverse y el sueño interrumpido.",
        "Eso no significa que sea imaginario ni que no tenga solución. Significa que el plan cambia de forma: menos búsqueda de la lesión perfecta en una imagen, más trabajo sostenido de movimiento, fuerza y hábitos.",
      ],
    },
    {
      id: "sintomas",
      level: 2,
      heading: "Cómo se siente el dolor lumbar",
      paragraphs: [
        "El dolor se siente como una banda en la parte baja de la espalda, a veces cargado hacia un lado. Puede ser sordo y constante, o aparecer en punzadas al cambiar de posición.",
        "Se acompaña de rigidez, de contractura de los músculos de la zona y de dificultad para agacharse o girar. Muchas personas describen que el peor momento es levantarse de la cama o de una silla después de estar quietas un rato largo.",
        "Lo que conviene registrar antes de la consulta es hasta dónde llega el dolor, qué lo empeora, si hay algo más además del dolor y hacia dónde viene evolucionando en las últimas semanas.",
      ],
    },
    {
      id: "sintomas--como-se-quita-un-dolor-de-lumbalgia",
      level: 3,
      heading: "¿Cómo se quita un dolor de lumbalgia?",
      paragraphs: [
        "En la fase aguda lo que más ayuda es seguir moviéndote dentro de lo que toleres, aplicar calor local, cuidar cómo te levantas y cómo cargas peso, y usar la medicación que te indiquen por el tiempo que te la indiquen.",
        "Lo que no ayuda es quedarse en cama esperando que pase, ni pedir una resonancia en la primera semana. En un cuadro sin señales de alarma, la imagen temprana no cambia el tratamiento y sí suele agregar preocupación por hallazgos que no explican el dolor.",
      ],
    },
    {
      id: "causas",
      level: 2,
      heading: "De dónde sale el dolor lumbar",
      paragraphs: [
        "En la mayor parte de los casos el origen es mecánico: músculos sobrecargados, articulaciones pequeñas de la columna irritadas, discos que perdieron altura con los años. Es frecuente que convivan varias cosas y que no se pueda señalar una sola culpable.",
        "Un grupo más chico corresponde al compromiso de una raíz nerviosa, y ahí el dolor deja de quedarse en la espalda y baja por la pierna. Y un grupo bastante más pequeño responde a causas que necesitan estudio sin demora: fracturas, infecciones, tumores o enfermedades inflamatorias.",
      ],
    },
    {
      id: "causas--causas-de-la-lumbalgia",
      level: 3,
      heading: "Causas de la lumbalgia",
      paragraphs: [
        "Las que más se repiten en consulta son el esfuerzo mal hecho, las horas sentado en una silla que no acompaña, el sedentarismo con musculatura débil, el sobrepeso y los trabajos que combinan carga con giro del tronco.",
        "También cuentan los antecedentes: quien ya tuvo un episodio tiene más probabilidad de tener otro, sobre todo si después del primero no cambió nada de lo que lo produjo.",
      ],
    },
    {
      id: "diagnostico",
      level: 2,
      heading: "Qué estudios hacen falta y cuándo",
      paragraphs: [
        "La consulta empieza por la historia y el examen físico, que en la zona lumbar resuelven la mayoría de los casos sin ninguna imagen. Se revisan fuerza, reflejos, sensibilidad y algunas maniobras que ponen en tensión la raíz nerviosa.",
        "Las imágenes se piden cuando hay señales de alarma, cuando el dolor no mejora después de varias semanas de tratamiento bien llevado o cuando aparecen síntomas neurológicos. La radiografía muestra huesos y alineación; la resonancia muestra discos, nervios y partes blandas.",
        "Conviene saber que las resonancias de gente sin dolor muestran discos alterados con bastante frecuencia. Por eso el informe se lee junto al examen y no como una sentencia.",
      ],
    },
    {
      id: "sin-operar",
      level: 2,
      heading: "Qué se hace sin operar",
      paragraphs: [
        "El tratamiento de la lumbalgia es conservador en la enorme mayoría de los casos. Movimiento temprano, terapia física dirigida, trabajo de fuerza del tronco y corrección de la ergonomía del puesto de trabajo.",
        "La medicación acompaña el período de más dolor y se usa por el tiempo que indique quien te atiende. En casos seleccionados se plantean infiltraciones, que son un recurso para bajar el dolor y permitir la rehabilitación, no un tratamiento en sí mismo.",
        "La lumbalgia común, sin compromiso del nervio, casi nunca llega al quirófano; cuando sí aparece una causa estructural que explique el dolor, la decisión de operar se desarrolla en la guía de hernia discal y no acá.",
      ],
    },
    {
      id: "sin-operar--que-es-la-lumbalgia-y-como-se-cura",
      level: 3,
      heading: "¿Qué es la lumbalgia y cómo se cura?",
      paragraphs: [
        "Es el dolor de la parte baja de la espalda, y la mayoría de los episodios se resuelven sin nada invasivo.",
        "La palabra curar encaja mal acá. Un episodio agudo cede; lo que se trabaja después es que no vuelva, y eso depende más de la fuerza y de los hábitos que de cualquier cosa que se tome. Cuando el dolor ya es crónico el objetivo es recuperar función y bajar la intensidad, y eso se consigue con constancia.",
      ],
    },
    {
      id: "sin-operar--ejercicios-para-la-lumbalgia",
      level: 3,
      heading: "Ejercicios para la lumbalgia",
      paragraphs: [
        "Los que mejor resultado dan son los que fortalecen el tronco completo y los glúteos, sumados a caminar todos los días. La natación y la bicicleta fija sirven para sostener la actividad cuando el dolor limita el impacto.",
        "Conviene que la rutina te la arme un fisioterapeuta según lo que tengas, y no copiarla de un video. Un ejercicio que le sirve a alguien con dolor mecánico puede empeorar a alguien con dolor irradiado por una raíz comprimida.",
      ],
    },
    {
      id: "preguntas-frecuentes",
      level: 2,
      heading: "Dudas que llegan sobre el dolor lumbar",
      paragraphs: [
        "Dos preguntas se repiten en cada consulta. La primera es si el colchón tiene la culpa: influye en el descanso, rara vez es la causa del problema, y no hay un modelo que le sirva a todo el mundo. La segunda es si conviene usar faja: sirve puntualmente para una tarea de carga, y usada todo el día debilita justo la musculatura que uno quiere fortalecer.",
      ],
    },
    {
      id: "preguntas-frecuentes--que-es-la-lumbalgia-y-que-la-ocasiona",
      level: 3,
      heading: "¿Qué es la lumbalgia y qué la ocasiona?",
      paragraphs: [
        "Es el dolor localizado en la parte baja de la espalda, y lo ocasiona casi siempre una combinación de sobrecarga mecánica y falta de fuerza en la musculatura que sostiene la columna.",
        "Buscar una única causa suele ser un callejón sin salida. Lo útil es identificar qué gestos y qué hábitos vienen empujando el cuadro, porque son los que se pueden cambiar.",
      ],
    },
    {
      id: "preguntas-frecuentes--cuanto-dura-una-lumbalgia",
      level: 3,
      heading: "¿Cuánto dura una lumbalgia?",
      paragraphs: [
        "Un episodio agudo típico mejora de forma clara en el transcurso de dos o tres semanas, y lo esperable es que cada semana se parezca menos a la anterior.",
        "Si al mes y medio sigues igual, o si el dolor va a más en vez de a menos, corresponde una evaluación. No porque haya algo grave por definición, sino porque el plan que estás siguiendo no está funcionando.",
      ],
    },
    {
      id: "senales-de-alarma",
      level: 2,
      heading: "Señales que no esperan una cita",
      paragraphs: [
        "El dolor de espalda casi siempre da tiempo para organizarse: pedir la cita, hacerse los estudios, ver opciones. Hay un grupo pequeño de signos que rompe esa regla. No son dolor más fuerte, son síntomas distintos, y aparecen cuando las raíces nerviosas que salen de la parte baja de la columna quedan comprimidas. Ahí lo que está en juego no es cuánto duele sino cuánto se recupera después, y eso depende de qué tan rápido se libere la compresión.",
      ],
      items: [
        {
          title: "Perdiste el control para orinar o para retener las heces",
          body: "Puede presentarse como no llegar al baño a tiempo, como no darte cuenta de que tenías la vejiga llena, o al revés, como no poder orinar aunque sientas la necesidad. Cualquiera de las tres formas cuenta. Es el signo más específico del cuadro y el que más se pasa por alto, porque cuesta contarlo.",
        },
        {
          title: "Se te durmió la zona que toca la silla al sentarte",
          body: "La cara interna de los muslos, la zona genital y la que rodea el ano. Se describe como acolchado, como estar sentado sobre una tela gruesa, o como no sentir el papel al limpiarte. No hace falta que la pierna entera esté dormida: alcanza con que esa zona lo esté.",
        },
        {
          title: "La debilidad en la pierna o el pie va empeorando",
          body: "No es la pierna que se cansa o que flaquea cuando el dolor aprieta. Es fuerza que se pierde y no vuelve: el pie que se arrastra al caminar, el tropiezo con el borde de la vereda, no poder levantarte en puntas de pie. Si lo que ayer costaba hoy cuesta más, el tiempo corre en contra.",
        },
        {
          title: "El adormecimiento o la debilidad tomaron las dos piernas",
          body: "El dolor de una hernia suele bajar por una sola pierna. Cuando el compromiso es de los dos lados, o cambia de lado, la compresión está más arriba de donde estaría una raíz sola, y eso cambia la urgencia.",
        },
      ],
    },
    {
      id: "senales-de-alarma--que-hacer",
      level: 3,
      heading: "Qué hacer",
      paragraphs: [
        "Si tienes cualquiera de estos signos, anda a emergencias de un hospital o de una clínica. No esperes a una cita, no esperes a la mañana siguiente y no lo consultes por mensaje: un chat no atiende una urgencia y la respuesta puede tardar lo que no hay. En emergencias te van a examinar y, si hace falta, te van a pedir una resonancia el mismo día. Lleva contigo los estudios de columna que tengas a mano, pero no demores la salida por buscarlos.",
      ],
    },
    {
      id: "cuando-consultar",
      level: 2,
      heading: "Cuándo pedir una cita",
      paragraphs: [
        "Conviene consultar si el dolor no mejora después de dos o tres semanas, si vuelve una y otra vez, o si te obliga a modificar de forma sostenida lo que haces.",
        "Hay síntomas que se evalúan sin postergar: la pérdida de fuerza en una pierna, el adormecimiento en la zona de la entrepierna y los genitales, la dificultad para controlar la orina o la deposición, el dolor después de una caída importante, el dolor con fiebre y el que despierta de noche sin mejorar al cambiar de posición.",
      ],
    },
    {
      id: "cuando-consultar--especialista-en-lumbalgia",
      level: 3,
      heading: "Especialista en lumbalgia",
      paragraphs: [
        "La primera puerta suele ser el médico general o el traumatólogo, y buena parte de los casos se resuelve ahí con terapia física bien dirigida.",
        "Cuando el dolor baja por la pierna, cuando hay adormecimiento o falta de fuerza, o cuando el cuadro no cede con el tratamiento habitual, corresponde una evaluación con un especialista en columna. Si detrás del dolor hay un disco desplazado que comprime una raíz, lo que sigue está explicado en la guía de hernia discal, que entra en el diagnóstico y en el tratamiento con el detalle que acá no corresponde.",
      ],
    },
    {
      id: "fuentes",
      level: 2,
      heading: "De dónde sale esto",
      paragraphs: [
        "De acá sale lo que se explica arriba. Cada fuente respalda una afirmación puntual de este artículo.",
      ],
      citations: [
        {
          source:
            "Organización Mundial de la Salud, nota descriptiva sobre dolor lumbar",
          supports:
            "Respalda que el dolor lumbar es una de las causas más extendidas de limitación en el mundo y que la mayoría de los cuadros no tiene detrás una causa estructural grave.",
          href: "https://www.who.int/news-room/fact-sheets/detail/low-back-pain",
        },
        {
          source:
            "NICE, guía NG59 sobre dolor lumbar y ciática en mayores de 16 años",
          supports:
            "Respalda el movimiento temprano y la terapia física dirigida como tratamiento de base, y que los estudios de imagen no se piden de rutina en la lumbalgia común.",
          href: "https://www.nice.org.uk/guidance/ng59",
        },
        {
          source:
            "MedlinePlus en español, tema Dolor de espalda (Biblioteca Nacional de Medicina de EE. UU.)",
          supports:
            "Respalda la descripción de cómo se manifiesta el dolor lumbar y de las señales que sí ameritan una evaluación sin esperar.",
          href: "https://medlineplus.gov/spanish/backpain.html",
        },
      ],
    },
  ],
};
