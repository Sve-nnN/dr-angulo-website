import type { BlogPost } from "./index";

export const postCiatica: BlogPost = {
  slug: "ciatica",
  topicEntities: [
    {
      kind: "condition",
      name: "Ciática",
      alternateNames: ["Ciatalgia", "Radiculopatía lumbar"],
    },
  ],
  title: "Ciática: por qué duele la pierna y qué hacer",
  h1: "Ciática: el dolor que baja por la pierna",
  description:
    "Qué es la ciática, cómo se distingue de una lumbalgia, qué la produce y cuándo el dolor de pierna necesita evaluación médica.",
  publishedAt: "2026-06-10",
  updatedAt: "2026-08-24",
  relatedService: "hernia-discal",
  outboundLinks: [
    { href: "/servicios/hernia-discal", anchor: "hernia discal lumbar y cervical" },
    { href: "/blog/artrosis", anchor: "artrosis lumbosacro" },
    { href: "/blog/lumbalgia", anchor: "tipos de lumbalgia" },
    {
      href: "/blog/cirugia-de-columna",
      anchor: "videos de cirugía de columna",
    },
    { href: "/blog", anchor: "Blog" },
    { href: "/servicios", anchor: "cirugía de columna cerca de mí" },
  ],
  bannerAfterSectionId: "sintomas--espina-ciatica",
  ctaBanner: {
    heading: "¿Reconoces alguna de estas señales?",
    body: "Una evaluación con estudios propios define si lo tuyo necesita tratamiento o solo control.",
  },
  intro: [
    "La ciática es un dolor que sigue el recorrido del nervio ciático. Se extiende desde la región lumbar, cruza el glúteo y baja por la parte de atrás del muslo y de la pierna, a veces hasta el pie.",
    "El nombre describe el síntoma y no la causa. Detrás de una ciática hay algo que comprime o irrita alguna de las raíces nerviosas que forman ese nervio, y la compresión y la irritación producen el mismo dolor aunque el origen sea distinto. Averiguar cuál de los dos es el trabajo de la consulta.",
  ],
  sections: [
    {
      id: "que-es",
      level: 2,
      heading: "Qué es la ciática",
      paragraphs: [
        "Lo que la distingue de un dolor de espalda común es el recorrido: viaja, sigue siempre el mismo camino y se repite igual cada vez. Un dolor que hoy está en un lugar y mañana en otro rara vez viene de una raíz nerviosa.",
      ],
    },
    {
      id: "que-es--ciatica-lumbar",
      level: 3,
      heading: "Ciática lumbar",
      paragraphs: [
        "Casi toda ciática es lumbar, porque las raíces que forman el nervio ciático salen de los últimos niveles de la columna lumbar y del sacro. Por eso el dolor arranca abajo, en la espalda, y de ahí baja.",
        "Cuando el mismo mecanismo ocurre en el cuello, el dolor viaja al hombro y al brazo. Es otro nervio y tiene otro nombre, y la lógica de fondo es idéntica.",
      ],
    },
    {
      id: "sintomas",
      level: 2,
      heading: "Cómo se reconoce el dolor de la ciática",
      paragraphs: [
        "El síntoma principal es el dolor irradiado, y viene acompañado de otras señales que conviene mirar juntas, porque son las que cambian la conducta en la consulta.",
        "Hormigueo y adormecimiento en una zona bien delimitada, no en toda la pierna. Sensación de menos fuerza, que se nota en gestos concretos: el pie que se arrastra al caminar, la dificultad para pararse en puntas, la sandalia que se sale sin que te des cuenta. Rigidez y dificultad para agacharte o girar el torso. Y un dolor que se dispara al toser, al estornudar o al hacer fuerza, porque esos gestos aumentan la presión dentro del canal.",
        "Ninguna de esas señales por separado significa gran cosa. Juntas y con el recorrido, orientan bastante, y son lo que conviene contar en la consulta.",
      ],
    },
    {
      id: "sintomas--espina-ciatica",
      level: 3,
      heading: "Espina ciática",
      paragraphs: [
        "Es una prominencia del hueso de la pelvis y no tiene relación directa con el dolor que la gente llama ciática. Comparten el nombre y poco más.",
        "Vale aclararlo porque es una búsqueda frecuente de quien leyó un informe y se asustó. Si lo que tienes es dolor que baja por la pierna, lo que te interesa es el nervio y no la espina.",
      ],
    },
    {
      id: "sintomas--diferencia-entre-ciatica-y-lumbalgia",
      level: 3,
      heading: "Diferencia entre ciática y lumbalgia",
      paragraphs: [
        "La lumbalgia se queda en la parte baja de la espalda. La ciática viaja por la pierna.",
        "Esa diferencia no es de intensidad sino de mecanismo. Un dolor que se queda suele ser muscular o articular; uno que baja siguiendo un trayecto fijo apunta a una raíz nerviosa comprometida. Se pueden tener las dos cosas a la vez, y es frecuente.",
      ],
    },
    {
      id: "sintomas--donde-duele-la-ciatica",
      level: 3,
      heading: "Donde duele la ciática",
      paragraphs: [
        "Duele en el glúteo, en la parte de atrás del muslo, en la pantorrilla y a veces en el pie. Puede empezar en la región lumbar o directamente en el glúteo, sin que la espalda moleste demasiado.",
        "Es raro que ocupe las dos piernas al mismo tiempo. Si el dolor baja por las dos y además aparece adormecimiento en la zona de la entrepierna, eso se evalúa el mismo día.",
      ],
    },
    {
      id: "sintomas--falsa-ciatica",
      level: 3,
      heading: "Falsa ciática",
      paragraphs: [
        "Se llama así al dolor que imita el recorrido de la ciática sin que haya una raíz comprimida en la columna. La causa más nombrada es el músculo piriforme, que al contracturarse puede irritar el nervio a la altura del glúteo.",
        "Se sospecha por el examen y por dónde se reproduce el dolor. Importa distinguirla porque el tratamiento es distinto y porque una resonancia de columna puede salir limpia y aun así haber un dolor muy real.",
      ],
    },
    {
      id: "sintomas--como-quitar-el-dolor-de-ciatica-rapido",
      level: 3,
      heading: "Cómo quitar el dolor de ciática rápido",
      paragraphs: [
        "En los primeros días lo que suele bajar la intensidad es el calor local, seguir moviéndote dentro de lo que toleres y la medicación que te indiquen. Las posiciones que descargan la zona, como acostarte de lado con una almohada entre las rodillas, ayudan sobre todo a dormir.",
        "Rápido, en esto, quiere decir días y no minutos. Un dolor irradiado que cede un rato y vuelve igual no se resolvió, se calmó, y esa diferencia importa cuando hay que decidir si seguir esperando.",
      ],
    },
    {
      id: "sintomas--como-aliviar-el-dolor-de-la-ciatica-en-2-minutos",
      level: 3,
      heading: "Como aliviar el dolor de la ciática en 2 minutos",
      paragraphs: [
        "Ningún ejercicio apaga una ciática en ese tiempo. Lo que sí existe son posiciones que descomprimen y alivian mientras las sostienes, y eso es distinto de tratar la causa.",
        "El problema de los videos que prometen ese resultado es que se aplican igual a todo el mundo. Un estiramiento que le sirve a alguien con el piriforme contracturado puede empeorar a alguien con una raíz comprimida.",
      ],
    },
    {
      id: "sintomas--como-quitar-el-dolor-de-ciatica-en-3-minutos",
      level: 3,
      heading: "Como quitar el dolor de ciática en 3 minutos",
      paragraphs: [
        "Vale lo mismo que arriba. Si una maniobra te alivia mientras la haces y el dolor vuelve apenas te levantas, sirve como calmante y no como tratamiento.",
        "Lo que cambia el curso es sostener el movimiento, trabajar la fuerza y corregir lo que carga la zona. Eso lleva semanas, y es la parte que ningún video de tres minutos puede hacer por ti.",
      ],
    },
    {
      id: "causas",
      level: 2,
      heading: "Qué comprime el nervio ciático",
      paragraphs: [
        "La causa más frecuente es una hernia discal que comprime una raíz nerviosa a la salida de la columna. Le siguen el estrechamiento del canal por desgaste, el deslizamiento de una vértebra sobre otra y la irritación del nervio a la altura del glúteo.",
        "En gente joven predomina la hernia. Con los años pesa más el desgaste. La causa cambia el tratamiento, así que ponerle nombre importa, y ponerle nombre es trabajo de la consulta y no del buscador.",
      ],
    },
    {
      id: "causas--que-es-lo-que-provoca-la-ciatica",
      level: 3,
      heading: "¿Qué es lo que provoca la ciática?",
      paragraphs: [
        "Lo provoca la compresión o la irritación de alguna de las raíces nerviosas lumbares o sacras que forman el nervio ciático.",
        "Lo que comprime puede ser material del disco desplazado, un canal estrechado por el desgaste de los años o una vértebra que se corrió de su lugar. Cuál de esas cosas es se define con el examen y, cuando corresponde, con una imagen.",
      ],
    },
    {
      id: "causas--causas-de-la-ciatica-en-mujeres",
      level: 3,
      heading: "Causas de la ciática en mujeres",
      paragraphs: [
        "En el embarazo, el aumento de peso, el cambio del centro de gravedad y la posición del útero pueden irritar la zona y producir un dolor muy parecido a una ciática.",
        "Fuera del embarazo las causas son las mismas que en cualquier persona. La búsqueda es frecuente y la respuesta honesta es que el sexo no cambia el mecanismo.",
      ],
    },
    {
      id: "diagnostico",
      level: 2,
      heading: "Cómo se confirma que el dolor viene de una raíz",
      paragraphs: [
        "Se define en la consulta. El relato del recorrido, el examen de fuerza, reflejos y sensibilidad, y algunas maniobras que ponen en tensión la raíz para reproducir el síntoma alcanzan para ubicar el nivel comprometido en la mayoría de los casos.",
        "La resonancia se pide cuando hay señales de alarma, cuando el dolor no mejora con el tratamiento o cuando se está evaluando una intervención. Confirma lo que la consulta ya sospecha, y no es por donde se empieza.",
        "Conviene repetirlo porque es la confusión más cara: una parte considerable de las resonancias de personas sin ningún dolor muestra discos alterados. La imagen sola no define nada.",
      ],
    },
    {
      id: "sin-operar",
      level: 2,
      heading: "Qué alivia sin cirugía",
      paragraphs: [
        "La mayoría de las ciáticas mejora sin operar. El plan combina movimiento temprano dentro de lo tolerado, terapia física dirigida, control del dolor con lo que indique tu médico y corrección de la postura de trabajo y de la forma de levantar peso.",
        "El reposo absoluto prolongado juega en contra. Sostener actividad, aunque sea poca y adaptada, es parte del tratamiento y no una concesión que uno se permite cuando se siente mejor.",
      ],
    },
    {
      id: "sin-operar--medicamento-para-la-ciatica",
      level: 3,
      heading: "Medicamento para la ciática",
      paragraphs: [
        "Acá no va ningún nombre ni ninguna dosis, y es a propósito. Lo que se usa para un dolor de origen nervioso no es lo mismo que para una contractura, y la elección depende de tu edad, de tu presión, de tu estómago y de lo que ya tomas.",
        "Lo que sí conviene saber es que la medicación acompaña al tratamiento y no lo reemplaza. Sirve para que puedas moverte y hacer la rehabilitación, que es lo que de verdad cambia el cuadro.",
      ],
    },
    {
      id: "sin-operar--las-mejores-pastillas-para-la-ciatica",
      level: 3,
      heading: "Las mejores pastillas para la ciática",
      paragraphs: [
        "No hay una lista, y la búsqueda es tan común que vale contestarla igual. Quien te evalúa elige el fármaco según el tipo de dolor y según tu historia, y lo ajusta en los controles.",
        "Comprar por recomendación de un conocido tiene dos riesgos concretos: tomar algo que no corresponde a un dolor de origen nervioso, y enmascarar una señal que había que mirar.",
      ],
    },
    {
      id: "cirugia",
      level: 2,
      heading: "Cuándo entra la cirugía en la conversación",
      paragraphs: [
        "Operar se plantea cuando el dolor irradiado sigue siendo incapacitante después de un manejo conservador bien hecho y sostenido, o cuando hay compromiso neurológico que avanza.",
        "Hay tres situaciones que no admiten esperar turno y se evalúan el mismo día: la pérdida de fuerza que avanza rápido, el adormecimiento en la zona de la entrepierna y los genitales, y la dificultad para controlar la orina o la deposición.",
        "Fuera de eso, la conversación sobre operar se abre y no se cierra. Que se plantee no significa que esté decidido.",
      ],
    },
    {
      id: "preguntas-frecuentes",
      level: 2,
      heading: "Dudas frecuentes sobre la ciática",
      paragraphs: [
        "Las tres que más se repiten van abajo. Hay una cuarta que se pregunta poco y conviene hacer: qué pasa si no hago nada. En una ciática sin señales de alarma la respuesta suele ser que mejora igual, más lento y con más probabilidad de recaída.",
      ],
    },
    {
      id: "preguntas-frecuentes--como-se-quita-la-ciatica",
      level: 3,
      heading: "¿Cómo se quita la ciática?",
      paragraphs: [
        "Con tiempo y con trabajo. La mayoría de los cuadros cede en semanas con tratamiento conservador bien llevado, y la parte que más pesa es la que hace la persona todos los días: moverse, hacer los ejercicios indicados y corregir lo que carga la zona.",
        "Cuando no cede, lo que corresponde no es insistir con lo mismo sino volver a evaluar.",
      ],
    },
    {
      id: "preguntas-frecuentes--que-no-debes-hacer-si-tienes-ciatica",
      level: 3,
      heading: "¿Qué no debes hacer si tienes ciática?",
      paragraphs: [
        "Quedarte en cama varios días, cargar peso con la espalda flexionada, estirar a la fuerza buscando que algo suene, y automedicarte durante semanas.",
        "Tampoco conviene pedir una resonancia por cuenta propia y leerla sin contexto. Es la vía más rápida a asustarse con un informe que no explica lo que sientes.",
      ],
    },
    {
      id: "preguntas-frecuentes--cuanto-tiempo-te-dura-la-ciatica",
      level: 3,
      heading: "¿Cuánto tiempo te dura la ciática?",
      paragraphs: [
        "Un episodio típico mejora de forma clara en el transcurso de unas semanas, y lo esperable es que cada semana se parezca menos a la anterior.",
        "Si la tendencia de las últimas semanas apunta hacia arriba en vez de hacia abajo, o si el dolor te despierta y no mejora al cambiar de posición, eso se evalúa aparte porque ya no se está comportando como un dolor mecánico.",
      ],
    },
    {
      id: "cuando-consultar",
      level: 2,
      heading: "Cuándo conviene una evaluación",
      paragraphs: [
        "Consulta si el dolor baja por la pierna y no cede en pocos días, si aparece hormigueo o falta de fuerza, o si el cuadro te obliga a modificar de forma sostenida lo que haces.",
        "Mientras consigues la cita, anota cómo se comporta el dolor día a día. Ese registro simple vale mucho en la consulta, porque la historia es lo que más orienta antes de cualquier imagen.",
        "Y si detrás de la ciática hay un disco que comprime una raíz, lo que sigue está explicado en la guía de hernia discal lumbar y cervical, que entra en el diagnóstico y en el tratamiento con el detalle que acá no corresponde.",
      ],
    },
  ],
};
