import type { ServicePage } from "./index";

/**
 * Quinta página del silo. La URL es nueva: la creó el mapa de v1.2 porque
 * ninguna ruta del sitio podía competir por la búsqueda de cirugía
 * mínimamente invasiva, y el paquete on-page le escribió el cuerpo entero.
 *
 * El texto se transcribe literal del dataset sellado
 * (`seo-tools/data/copy-servicios.json`), aprobado por el doctor el
 * 2026-08-13. Sobre precio no hay ninguna cifra y esa contención es
 * deliberada: la SERP de esta keyword está llena de preguntas de tarifa y el
 * paquete las responde con el compromiso de presupuesto por escrito.
 */
export const cirugiaMinimamenteInvasiva: ServicePage = {
  slug: "cirugia-minimamente-invasiva",
  navLabel: "Cirugía mínimamente invasiva",
  h1: "Cirugía de columna mínimamente invasiva",
  heroLead:
    "Es una forma de operar la columna con incisiones pequeñas, separando el músculo en lugar de despegarlo del hueso. El objetivo dentro del cuerpo es el mismo que en la cirugía abierta: lo que cambia es el camino para llegar hasta ahí.",
  title: "Cirugía mínimamente invasiva de columna en Lima",
  description: "Qué es la cirugía mínimamente invasiva de columna, en qué casos se indica y cómo es la recuperación. Consulta en Lima.",
  cardSummary: "Incisiones pequeñas y el mismo objetivo dentro del cuerpo: lo que cambia es el camino.",
  conditionName: "Cirugía de columna mínimamente invasiva",
  alternateNames: [
    "Cirugía endoscópica de columna",
    "Endoscopía espinal",
    "Cirugía de columna por vía percutánea",
  ],
  publishedAt: "2026-08-13",
  updatedAt: "2026-08-13",
  format: "pagina-de-servicio",
  describesSurgery: true,
  relatedPosts: ["cirugia-de-columna"],
  ctaBanner: {
    heading: "¿Te propusieron operarte y quieres saber si hay una vía menos invasiva?",
    body: "Esa pregunta se responde mirando tus imágenes, no en abstracto. Trae la resonancia y el informe.",
  },
  // El esqueleto cuelga siete subsecciones de `que-se-atiende` y ninguna
  // frontera de nivel 2 cae dentro de la ventana de POS-01: la primera está
  // en el 7 por ciento del cuerpo y la siguiente ya pasa del 45.
  bannerAfterSectionId: "que-se-atiende--endoscopia-espinal",
  sections: [
    {
      id: "que-se-atiende",
      level: 2,
      heading: "Qué es la cirugía mínimamente invasiva de columna",
      paragraphs: [
        "Es una forma de operar la columna con incisiones pequeñas, separando el músculo en lugar de despegarlo del hueso, y trabajando con visión aumentada por microscopio o por endoscopio.",
        "El objetivo dentro del cuerpo es exactamente el mismo que en la cirugía abierta: liberar el nervio comprimido, sacar el fragmento de disco que está apretando o estabilizar un segmento que se movió de más. Lo que cambia es el camino para llegar hasta ahí.",
        "Esa diferencia de camino importa porque el músculo que sostiene la columna es el mismo que después tiene que sostenerte a ti. Cuanto menos se daña al entrar, menos hay que recuperar al salir.",
      ],
    },
    {
      id: "que-se-atiende--que-es-una-cirugia-minima-invasiva",
      level: 3,
      heading: "¿Qué es una cirugía mínima invasiva?",
      paragraphs: [
        "Se le llama así a cualquier técnica que consigue el mismo resultado dentro del cuerpo con menos agresión en el camino de entrada. No es una operación distinta: es la misma con otro abordaje.",
        "En columna eso significa incisiones de pocos centímetros, separadores que abren paso entre las fibras del músculo, y una cámara o un microscopio que da la visión que el ojo desnudo no alcanza por un orificio tan chico.",
        "Vale aclarar algo que confunde seguido: mínimamente invasiva no quiere decir sin riesgo. Quiere decir con menos daño en los tejidos que rodean al objetivo.",
      ],
    },
    {
      id: "que-se-atiende--cirugia-endoscopica-de-columna",
      level: 3,
      heading: "Cirugía endoscópica de columna",
      paragraphs: [
        "La endoscópica es la versión más acotada del abordaje: se entra con un tubo de trabajo del diámetro de un lápiz que lleva la cámara y los instrumentos por dentro.",
        "El cirujano no mira la herida, mira la pantalla, y la imagen llega ampliada. Eso permite trabajar pegado a la raíz nerviosa con un campo visual que en la cirugía abierta requeriría una exposición bastante mayor.",
        "No todas las hernias ni todas las estenosis se resuelven así. La ubicación del fragmento, la anatomía del canal y lo que muestren tus estudios definen si esta vía sirve para tu caso o si conviene otra.",
      ],
    },
    {
      id: "que-se-atiende--endoscopia-espinal",
      level: 3,
      heading: "Endoscopía espinal",
      paragraphs: [
        "Endoscopía espinal y cirugía endoscópica de columna nombran lo mismo, y la diferencia entre los dos términos es de costumbre y no de técnica.",
        "Se usa sobre todo para hernias discales que comprimen una raíz y para descompresiones acotadas del canal. Cuando hace falta estabilizar un segmento entero, el abordaje cambia y se conversa con las imágenes delante.",
      ],
    },
    {
      id: "que-se-atiende--cirugia-robotica-da-vinci",
      level: 3,
      heading: "La cirugía robótica y el sistema Da Vinci",
      paragraphs: [
        "La cirugía robótica aparece mucho cuando alguien busca técnicas poco invasivas, y conviene separarla de lo que se hace en columna.",
        "El sistema Da Vinci se usa sobre todo en cirugía urológica, ginecológica y general. En columna, la asistencia robótica que existe hoy sirve para guiar la colocación de tornillos con mayor precisión, y no reemplaza al cirujano en la descompresión del nervio.",
        "El robot es una herramienta de precisión, no un tipo distinto de operación.",
      ],
    },
    {
      id: "que-se-atiende--mejores-especialistas-columna-vertebral-lima-peru",
      level: 3,
      heading: "Cómo elegir a quién te opera la columna",
      paragraphs: [
        "Las listas de mejores especialistas no se construyen con resultados, así que sirven poco para esta decisión.",
        "Lo que sí ayuda es preguntar tres cosas concretas: qué abordaje propone para tu caso y por qué ese, qué pasa si durante la operación se encuentra algo distinto a lo previsto, y cómo es el plan si el dolor no cede después. Quien te opera debería poder responder las tres sin incomodarse.",
      ],
    },
    {
      id: "que-se-atiende--hospital-rebagliati",
      level: 3,
      heading: "Si te evaluaron en un hospital público",
      paragraphs: [
        "Bastante gente llega con la indicación quirúrgica ya dada en el sistema público y con la duda de si existe una opción menos invasiva para su caso.",
        "Esa pregunta se responde mirando tus imágenes, no en abstracto. Trae la resonancia y el informe, y la consulta puede dedicarse a comparar abordajes en vez de a repetir estudios.",
      ],
    },
    {
      id: "como-es-la-consulta",
      level: 2,
      heading: "Cómo se decide si eres candidato",
      paragraphs: [
        "La evaluación empieza igual que cualquier consulta de columna: tu relato, el examen físico y después las imágenes. La técnica se elige al final, nunca al principio.",
        "Lo que se mira para decidir es qué estructura está comprimiendo el nervio, dónde exactamente está ubicada, si hay inestabilidad del segmento, cuántos niveles están comprometidos y qué tanto ha respondido el manejo sin cirugía hasta ahora.",
        "También pesan cosas que no salen en la resonancia: cirugías previas en la misma zona, tu estado general y qué tan realista es el objetivo que tienes en la cabeza.",
        "Si de esa evaluación sale que el abordaje mínimamente invasivo no es el mejor para ti, se te dice. Forzar una técnica porque suena moderna es la peor razón para elegirla.",
      ],
    },
    {
      id: "como-es-la-consulta--cuales-son-las-desventajas-de-la-cirugia-minimamente-invasiv",
      level: 3,
      heading: "¿Cuáles son las desventajas de la cirugía mínimamente invasiva?",
      paragraphs: [
        "La primera es de indicación: no sirve para todo. Hay deformidades amplias, inestabilidades y casos con cirugía previa donde la vía abierta sigue siendo la que mejor resuelve.",
        "La segunda es de campo visual. Trabajar por un acceso chico da menos margen de maniobra, y si aparece algo inesperado el cirujano tiene que estar preparado para convertir a un abordaje abierto en el mismo acto.",
        "La tercera es de equipo y de curva de aprendizaje. Requiere instrumental específico y práctica sostenida en la técnica.",
        "Nada de esto la descalifica. Solo significa que la decisión se toma por el caso y no por la etiqueta de la técnica.",
      ],
    },
    {
      id: "como-es-la-consulta--cirugia-robotica-ventajas-y-desventajas",
      level: 3,
      heading: "Ventajas y desventajas de la cirugía robótica",
      paragraphs: [
        "A favor: precisión en la colocación de material y una planificación previa muy detallada sobre las imágenes del paciente.",
        "En contra: disponibilidad limitada, costo mayor y una preparación previa que en el quirófano se paga en minutos y que no siempre se justifica. Además, la parte delicada de una descompresión sigue dependiendo del criterio y de las manos del cirujano.",
        "Por eso la asistencia robótica se usa donde suma, que es en la instrumentación, y no como un sello de calidad de la operación entera.",
      ],
    },
    {
      id: "condiciones",
      level: 2,
      heading: "Para qué condiciones se usa",
      paragraphs: [
        "Hernia discal lumbar y cervical que comprime una raíz y no cedió con el manejo sin operar. Estenosis del canal acotada a uno o dos niveles. Quistes que comprimen la raíz.",
        "También algunas artrodesis, o sea las estabilizaciones de un segmento, que se pueden hacer por vía percutánea cuando la anatomía lo permite.",
        "Queda fuera lo que necesita corrección amplia de una deformidad, la inestabilidad extensa y los casos donde una cirugía anterior dejó el terreno demasiado alterado. Ahí la vía abierta no es un paso atrás: es la indicada.",
      ],
    },
    {
      id: "condiciones--cirugia-laser-hernia-discal-lumbar-precio-peru",
      level: 3,
      heading: "La cirugía láser de hernia discal y su precio",
      paragraphs: [
        "Cirugía láser es un nombre comercial que agrupa técnicas distintas entre sí, y por eso conviene preguntar siempre cuál exactamente te están proponiendo y qué se hace con el disco.",
        "El láser en columna se usa como fuente de energía dentro de algunos procedimientos percutáneos, no como una operación en sí misma. Si alguien te lo ofrece como solución universal para cualquier hernia, pide que te expliquen la indicación en tu caso concreto.",
        "Sobre el precio: depende de la técnica, de la clínica y del material, y por eso ninguna cifra publicada en internet va a coincidir con tu presupuesto real.",
      ],
    },
    {
      id: "donde-se-atiende",
      level: 2,
      heading: "Dónde se atiende",
      paragraphs: [
        "La consulta previa y los controles funcionan en el consultorio de Surco, en la Clínica Ricardo Palma, en la Clínica Sanna La Molina y en la Clínica Padre Luis Tezza.",
        "La programación quirúrgica se coordina en clínica, según el caso y según tu seguro. Ese detalle se define en la consulta, con el presupuesto por escrito antes de fijar fecha.",
      ],
    },
    {
      id: "donde-se-atiende--se-utiliza-el-robot-da-vinci-en-peru",
      level: 3,
      heading: "¿Se utiliza el robot Da Vinci en Perú?",
      paragraphs: [
        "El sistema existe en el país, en un grupo reducido de clínicas, y su uso habitual está en urología y en cirugía general.",
        "En columna lo que se emplea con más frecuencia acá es el abordaje endoscópico y el microquirúrgico. Si te ofrecen cirugía de columna con robot, pregunta en qué parte de la operación interviene: en general es en la colocación del material y no en la liberación del nervio.",
      ],
    },
    {
      id: "donde-se-atiende--operacion-de-columna-lumbar-precio-peru",
      level: 3,
      heading: "Operación de columna lumbar y su precio",
      paragraphs: [
        "El precio varía según el nivel que se opere, si hace falta material de fijación, la clínica y los días de hospitalización.",
        "Por eso acá no vas a encontrar una tarifa. Lo que sí hay es un presupuesto por escrito una vez definida la técnica, y la revisión de la cobertura con tu seguro antes de programar.",
      ],
    },
    {
      id: "donde-se-atiende--cirugia-robotica-en-peru",
      level: 3,
      heading: "La cirugía robótica en el país",
      paragraphs: [
        "La disponibilidad de cirugía robótica en el Perú es limitada y desigual, y eso influye en el costo más que en el resultado.",
        "Para la mayoría de los casos de columna que llegan a esta consulta, la decisión relevante no es robot sí o robot no: es abordaje endoscópico, microquirúrgico o abierto.",
      ],
    },
    {
      id: "como-agendar",
      level: 2,
      heading: "Cómo agendar una cita",
      paragraphs: [
        "Pide la cita desde el formulario del sitio o escribe contando tu caso. Si ya te propusieron operarte en otro lado, avísalo al agendar: esa consulta necesita más tiempo.",
        "Trae la resonancia completa, no solo el informe, y cualquier estudio previo de la misma zona. Sin las imágenes no se puede opinar sobre el abordaje, y opinar sin verlas sería justamente lo que esta página te recomienda no aceptar.",
      ],
    },
    {
      id: "como-agendar--cuanto-cuesta-una-cirugia-minima-invasiva",
      level: 3,
      heading: "¿Cuánto cuesta una cirugía mínima invasiva?",
      paragraphs: [
        "Depende del abordaje, del material, de la clínica y de la estancia. Una descompresión endoscópica de un nivel y una estabilización de varios no se parecen ni en el quirófano ni en la factura.",
        "El presupuesto se entrega por escrito cuando la indicación está definida, y se revisa con tu aseguradora antes de reservar fecha. Cualquier número que te den por teléfono sin haber visto tus imágenes es una estimación en el aire.",
      ],
    },
  ],
  outboundLinks: [
    { href: "/servicios/escoliosis-y-deformidades", anchor: "ejercicios para escoliosis" },
    { href: "/servicios/ortopedia-infantil", anchor: "ortopedia infantil cerca de mí" },
    { href: "/sedes/clinica-ricardo-palma", anchor: "traumatólogo clínica ricardo palma" },
    { href: "/sedes/clinica-tezza", anchor: "traumatólogo clínica tezza" },
    { href: "/sedes/consultorio-privado", anchor: "cirujano de columna surco" },
    { href: "/sedes/sanna-la-molina", anchor: "traumatólogo clínica sanna" },
    { href: "/agendar", anchor: "Agendar cita" },
    { href: "/servicios", anchor: "cirujano de columna lima" },
  ],
};
