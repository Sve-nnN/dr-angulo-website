import type { LocationPage } from "./types";

export const consultorioPrivado: LocationPage = {
  slug: "consultorio-privado",
  navLabel: "Consultorio privado en Surco",
  // El consultorio es la excepción del patrón de title de las clínicas: su
  // nombre no es algo que un paciente escriba en el buscador. Su consulta es
  // de distrito, no de institución, y por eso el title nombra Surco.
  title: "Cirugía de columna en Surco: consultorio privado",
  h1: "Consultorio de Surco: la consulta sin intermediarios",
  description:
    "Consultorio privado del Dr. Juan Carlos Angulo en Surco para consultas de columna. Dónde queda y cómo pedir cita por WhatsApp.",
  heroLead:
    "Este es el consultorio propio del doctor, en el Edificio Lima Central Tower de Surco. Es la única sede cuya agenda maneja él, así que la cita se coordina directamente con su consultorio.",
  cardSummary:
    "Santiago de Surco, viernes y sábados. Es la única sede donde el doctor agenda directamente.",
  gettingThere: [
    "El consultorio queda en Av. El Derby 254, en el piso 24 del Edificio Lima Central Tower, en Santiago de Surco. La referencia más clara es el cruce de Av. El Derby con Manuel Olguín.",
    "Av. El Derby es la vía que conecta esa zona de oficinas de Surco, y la numeración corresponde a la cuadra 2. El edificio tiene frente sobre la avenida, así que la torre es la referencia visual con la que vas a llegar.",
    "Una vez adentro, la oficina es la 2403, en el piso 24. Para la ruta exacta desde donde estés, abre la ubicación en el mapa con el enlace de arriba.",
  ],
  conditionsLead:
    "En esta sede el doctor evalúa dolor cervical y lumbar, hernia discal, estenosis espinal, escoliosis y las consultas de traumatología general y ortopedia infantil. Si quieres entender tu condición antes de la cita, cada guía explica qué es, cómo se diagnostica y qué opciones de tratamiento existen.",
  publishedAt: "2026-08-10",
  updatedAt: "2026-08-24",
  ctaBanner: {
    heading: "¿Quieres que el doctor revise tu caso en su consultorio?",
    body: "Esta es la única sede cuya agenda maneja él, así que la cita se coordina directo con su consultorio. En la página de agenda están los días de atención de todas las sedes.",
  },
  bannerAfterSectionId: "que-se-atiende--quienes-son-los-mejores-neurocirujanos-en-lima",
  outboundLinks: [
    { href: "/sedes", anchor: "Sedes donde atiende el Dr. Juan Angulo" },
    { href: "/servicios", anchor: "Qué condiciones se tratan en cada especialidad" },
    { href: "/servicios/ortopedia-infantil", anchor: "Ortopedia infantil: qué se evalúa en un niño" },
    { href: "/agendar", anchor: "Agendar cita" },
    { href: "/contacto", anchor: "Contacto y citas en Lima" },
    { href: "/", anchor: "Qué atiende la consulta del Dr. Juan Angulo" },
  ],
  sections: [
    {
      id: "donde-queda",
      level: 2,
      heading: "Dónde queda el consultorio en Surco",
      paragraphs: [
        "Av. El Derby 254, piso 24, oficina 2403, en el Edificio Lima Central Tower, Santiago de Surco. Viernes y sábados.",
        "Es el consultorio propio del doctor y la única de las cuatro sedes cuya agenda maneja él. Por eso acá la cita se coordina directo con el consultorio, sin central de por medio.",
        "La referencia más clara es el cruce de Av. El Derby con Manuel Olguín, en la zona de oficinas del distrito. El 254 cae en la cuadra 2.",
      ],
    },
    {
      id: "como-llegar",
      level: 2,
      heading: "Cómo llegar al Lima Central Tower",
      paragraphs: [
        "El edificio tiene frente sobre El Derby y la torre se ve desde la avenida, así que esa es la referencia con la que vas a llegar aunque no conozcas la zona.",
        "Adentro, la oficina es la 2403, en el piso 24.",
        "El estacionamiento del edificio y sus tarifas los maneja la administración de la torre y no el consultorio. Ese dato todavía no está publicado, así que conviene preguntarlo al confirmar la cita.",
      ],
    },
    {
      id: "que-se-atiende",
      level: 2,
      heading: "Qué resuelve esta consulta",
      paragraphs: [
        "Columna del adulto: dolor lumbar, dolor cervical, hernia discal, canal estrecho, escoliosis y deformidades de la columna vertebral.",
        "Al lado de eso, traumatología general y ortopedia infantil. Es la misma consulta de las otras tres sedes, con una diferencia de fondo: acá el tiempo lo pone el consultorio y no la agenda de una institución.",
        "La mayoría de los tratamientos de columna no pasa por el quirófano. Eso no es una postura: es lo que corresponde según lo que muestra cada evaluación.",
      ],
    },
    {
      id: "que-se-atiende--quienes-son-los-mejores-neurocirujanos-en-lima",
      level: 3,
      heading: "¿Quiénes son los mejores neurocirujanos en Lima?",
      paragraphs: [
        "Los rankings de mejores neurocirujanos de Lima que devuelve el buscador suelen estar ordenados por quién pagó por aparecer ahí.",
        "Lo que sí orienta es otra cosa: a qué le dedica la semana esa persona, qué parte de su consulta es columna, y con qué criterio decide no operar. Un cirujano que te explica cuándo no operaría dice más de sí mismo que cualquier lista.",
      ],
    },
    {
      id: "que-se-atiende--ortopedia-surco",
      level: 3,
      heading: "Ortopedia en Surco: qué cubre y qué no",
      paragraphs: [
        "Ortopedia en Surco es una búsqueda que mezcla dos cosas distintas: la consulta médica y la tienda que vende plantillas, fajas y muletas.",
        "Acá es lo primero. Si lo que necesitas es comprar un producto ortopédico, esto no es una tienda y te conviene buscar por ese lado.",
      ],
    },
    {
      id: "que-se-atiende--cirujano-de-columna-surco",
      level: 3,
      heading: "Cirujano de columna en Surco",
      paragraphs: [
        "A la cirugía de columna se llega por dos caminos distintos: la traumatología con formación en columna, o la neurocirugía. El Dr. Angulo viene del primero.",
        "Acá la consulta es esa, en Surco, viernes y sábados. Si el caso no es quirúrgico, se dice en la misma consulta y no en la tercera.",
      ],
    },
    {
      id: "que-se-atiende--neurocirujano-surco",
      level: 3,
      heading: "Cuándo el caso de columna necesita neurocirugía",
      paragraphs: [
        "Cuando el problema está en el nervio o en la médula y no en la estructura que los rodea. Esa es la línea, dicha corto.",
        "En la práctica los dos campos se cruzan bastante y hay casos que resuelve cualquiera de los dos. Cuando el tuyo le corresponde a neurocirugía, el doctor lo dice y deriva.",
      ],
    },
    {
      id: "que-se-atiende--ortopedia-infantil-surco",
      level: 3,
      heading: "Ortopedia infantil en el consultorio de Surco",
      paragraphs: [
        "Pie plano, caminar con las puntas hacia adentro, piernas que se ven arqueadas, escoliosis del adolescente, dolor que aparece de noche mientras el chico crece.",
        "El sábado por la mañana es el horario que mejor le funciona a una familia con un chico en edad escolar, y de las cuatro sedes esta es la única que lo tiene.",
      ],
    },
    {
      id: "que-se-atiende--traumatologia-surco",
      level: 3,
      heading: "Traumatología general en la consulta de Surco",
      paragraphs: [
        "Lesiones de rodilla, hombro y tobillo del adulto, secuelas de un golpe viejo que no terminó de irse, y controles después de una fractura ya consolidada.",
        "Lo que no entra acá es la urgencia. Una fractura de hoy se ve en emergencia hoy, y esta es una consulta programada.",
      ],
    },
    {
      id: "que-se-atiende--clinica-de-la-columna-hernias-discales-sin-cirugias",
      level: 3,
      heading: "Hernia discal sin cirugía: qué es cierto de eso",
      paragraphs: [
        "La mayor parte de las hernias discales mejora sin operar. Eso es cierto y no es un eslogan: con tiempo, control del dolor y trabajo de rehabilitación, el cuadro suele ceder.",
        "Lo que hay que mirar con cuidado es el otro extremo, el de los sitios que prometen resolver toda hernia discal sin cirugía, siempre y con un solo método. Ahí lo que se pierde de vista es la indicación quirúrgica que sí existía, y esa demora se paga.",
      ],
    },
    {
      id: "que-se-atiende--mejores-especialistas-columna-vertebral-lima-peru",
      level: 3,
      heading: "Cómo se elige entre los especialistas de columna vertebral en Lima",
      paragraphs: [
        "No hay un ranking honesto de los mejores especialistas de columna vertebral en Lima. Lo que hay son listas pagadas y opiniones sueltas.",
        "Sirve más otra cosa: pedir una segunda opinión antes de operar, comparar qué explica cada uno sobre el mismo estudio, y desconfiar del que te promete un resultado.",
      ],
    },
    {
      id: "que-se-atiende--clinica-de-la-columna-chacarilla",
      level: 3,
      heading: "Chacarilla, El Derby y por qué no son lo mismo",
      paragraphs: [
        "Chacarilla queda en Surco y es una zona conocida por su concentración de consultorios. Este consultorio no está ahí: está en El Derby, que es la zona de oficinas del distrito, a unos minutos de distancia.",
        "Las dos son Surco. Si te pasaron una dirección de Chacarilla, no es esta.",
      ],
    },
    {
      id: "que-se-atiende--life-clinica-de-la-columna",
      level: 3,
      heading: "Los centros dedicados solo a columna",
      paragraphs: [
        "En Lima hay varios centros dedicados exclusivamente a columna y compiten por esta misma búsqueda. Algunos son buenos.",
        "La diferencia con este consultorio no está en el nombre sino en el formato: acá te ve un médico y ese mismo médico te sigue viendo después. En un centro con equipo rotativo eso no siempre pasa, y conviene preguntarlo antes de empezar.",
      ],
    },
    {
      id: "que-se-atiende--clinica-de-la-columna-lima",
      level: 3,
      heading: "Consultorio o clínica de la columna: qué cambia para ti",
      paragraphs: [
        "Las páginas que salen en esta búsqueda están escritas en plural: somos, contamos con, estamos. Detrás de ese plural a veces hay un equipo grande de verdad y a veces solo hay una marca.",
        "Lo que a ti te sirve saber es quién te va a ver la próxima vez. Acá es siempre el mismo médico, y la experiencia de la consulta cambia bastante por eso.",
      ],
    },
    {
      id: "que-se-atiende--opiniones-de-clinica-de-la-columna-hernias-discales-sin-ciru",
      level: 3,
      heading: "Qué mirar en las opiniones antes de elegir",
      paragraphs: [
        "Las reseñas sirven para lo operativo: si atienden a la hora, si explican con calma, si te devuelven la llamada. Para eso son bastante confiables.",
        "Para lo clínico sirven poco. Quien escribe una reseña no tiene cómo saber si la indicación quirúrgica que le dieron era la correcta, y ese es justo el dato que estás tratando de averiguar.",
      ],
    },
    {
      id: "horarios",
      level: 2,
      heading: "Viernes y sábados, de nueve a cinco",
      paragraphs: [
        "Viernes y sábados, de 9:00 a. m. a 5:00 p. m.",
        "El sábado es lo que esta sede tiene y las otras tres no. Para quien trabaja de lunes a viernes, esa es la diferencia entre atenderse y seguir postergándolo.",
        "La hora exacta se acuerda por WhatsApp con el consultorio, porque acá la agenda la lleva el doctor y no una central.",
      ],
    },
    {
      id: "como-agendar",
      level: 2,
      heading: "Cómo se pide la cita acá",
      paragraphs: [
        "Por WhatsApp, al +51 964 305 682. Es el único canal donde el doctor agenda directamente.",
        "Ese número no sirve para las citas de Ricardo Palma, Sanna o Tezza: esas agendas las manejan las clínicas y se sacan por sus centrales.",
        "Lo que más preguntan quienes escriben es cuánto demora conseguir turno. Ayuda mandar de una vez qué te pasa, desde cuándo, y si ya tienes estudios de imagen: con eso el consultorio ubica mejor el día.",
      ],
    },
    {
      id: "como-agendar--cuanto-cobran-por-una-operacion-de-columna",
      level: 3,
      heading: "¿Cuánto cobran por una operación de columna?",
      paragraphs: [
        "Este sitio no publica precios, y el motivo no es evasivo: el costo de una operación de columna no lo pone solo el cirujano.",
        "Entran la clínica donde se opera, el tiempo de sala, el material que necesite el caso, los días de hospitalización y lo que cubra tu seguro. Dos casos que se llaman igual pueden costar muy distinto.",
      ],
    },
    {
      id: "como-agendar--cuanto-cuesta-una-cirugia-de-columna-en-peru",
      level: 3,
      heading: "¿Cuánto cuesta una cirugía de columna en Perú?",
      paragraphs: [
        "El rango que circula en internet mezcla clínicas, técnicas y ciudades distintas, así que como referencia no sirve de mucho.",
        "La cifra que a ti te importa sale de un presupuesto de la clínica donde se haría la cirugía, con tu caso y tu cobertura adentro. Eso se pide después de la consulta y no antes.",
      ],
    },
    {
      id: "como-agendar--cuanto-puede-valer-una-operacion-de-columna",
      level: 3,
      heading: "Por qué el presupuesto llega después de la consulta",
      paragraphs: [
        "Porque antes de la consulta nadie sabe qué operación sería, ni siquiera si hace falta operar.",
        "Poner un número antes de examinar es venderte algo. Después de la evaluación, con el estudio de imagen visto, el presupuesto se pide a la clínica y ahí sí es un número que significa algo.",
      ],
    },
  ],
};
