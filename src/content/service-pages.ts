/**
 * Páginas del silo clínico: una entrada de datos por condición, una sola
 * plantilla en `src/app/servicios/[slug]/page.tsx`.
 *
 * El orden de las secciones no depende de la disciplina de quien escribe: la
 * tupla `SERVICE_SECTION_ORDER` lo fija y el `Record` sobre ella obliga a que
 * cada página declare las siete. Si falta una, TypeScript rompe el build.
 *
 * Reglas de contenido, heredadas de 08-CONTEXT.md y del contrato de la fase:
 * consenso clínico general en voz explicativa, nunca testimonial. Las
 * credenciales salen solo de `src/content/cv.ts`. Prohibido escribir cifras de
 * cirugías, tasas de éxito, plazos de recuperación garantizados o precios.
 */

export const SERVICE_SECTION_ORDER = [
  "que-es",
  "sintomas",
  "cuando-consultar",
  "diagnostico",
  "tratamiento",
  "recuperacion",
  "preguntas-frecuentes",
] as const;

export type ServiceSectionId = (typeof SERVICE_SECTION_ORDER)[number];

/** Subtema dentro de una sección. Se renderiza como `h3` más párrafos. */
export type ServiceSubsection = {
  heading: string;
  paragraphs: string[];
};

/**
 * Sección de contenido. `paragraphs` son cadenas planas sin marcado: así
 * ninguna cifra puede quedar resaltada tipográficamente dentro del cuerpo.
 */
export type ServiceSection = {
  heading: string;
  paragraphs: string[];
  subsections?: ServiceSubsection[];
};

export type ServicePage = {
  slug: string;
  navLabel: string;
  h1: string;
  title: string;
  description: string;
  /** Resumen de la tarjeta del hub. Máximo 120 caracteres. */
  cardSummary: string;
  conditionName: string;
  alternateNames?: string[];
  publishedAt: string;
  updatedAt: string;
  ctaBanner: { heading: string; body: string };
  sections: Record<ServiceSectionId, ServiceSection>;
  /** Slugs de `src/content/blog.ts` que apuntan a esta condición. */
  relatedPosts: string[];
  /** Solo si la página describe efectivamente la cirugía. */
  describesSurgery: boolean;
};

export const servicePages: ServicePage[] = [
  {
    slug: "hernia-discal",
    navLabel: "Hernia discal",
    h1: "Hernia discal",
    title: "Hernia discal: síntomas, diagnóstico y tratamiento",
    description:
      "Qué es una hernia discal, qué síntomas produce, cómo se diagnostica y en qué casos se plantea la cirugía. Guía del Dr. Juan Carlos Angulo, cirujano de columna en Lima.",
    cardSummary:
      "Qué es, cómo se diagnostica y en qué casos la cirugía es realmente necesaria.",
    conditionName: "Hernia discal",
    alternateNames: ["Hernia de disco", "Protrusión discal"],
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-10",
    describesSurgery: true,
    relatedPosts: [
      "5-sintomas-de-columna-que-no-debes-ignorar",
      "hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
      "miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber",
    ],
    ctaBanner: {
      heading: "¿Tu dolor baja por la pierna?",
      body: "Una evaluación con estudios propios define si tu caso necesita cirugía o se resuelve sin ella.",
    },
    sections: {
      "que-es": {
        heading: "Qué es una hernia discal",
        paragraphs: [
          "Entre una vértebra y otra hay un disco intervertebral, una estructura que funciona como amortiguador y como bisagra de la columna. Tiene una capa externa firme, formada por anillos de fibras, y un núcleo interno de consistencia gelatinosa. Cuando esa capa externa se debilita o se rompe, parte del núcleo se desplaza hacia afuera. Eso es una hernia discal.",
          "El desplazamiento en sí mismo no siempre da síntomas. El problema aparece cuando ese material presiona una raíz nerviosa o invade el espacio por donde pasan los nervios. Ahí es cuando surgen el dolor que se irradia hacia una extremidad, el hormigueo y, en algunos casos, la pérdida de fuerza.",
          "Las hernias se presentan con más frecuencia en la zona lumbar, que es la que soporta mayor carga, y en la zona cervical. Pueden desarrollarse de forma progresiva por el desgaste natural del disco con los años, o instalarse de golpe después de un esfuerzo mal hecho, una caída o un movimiento de torsión con peso.",
        ],
      },
      sintomas: {
        heading: "Síntomas de una hernia discal",
        paragraphs: [
          "El síntoma que más orienta hacia una hernia discal no es el dolor de espalda, sino el dolor que se irradia. Si la hernia es lumbar, el dolor suele bajar por la parte posterior del glúteo, del muslo y de la pierna, a veces hasta el pie. Es lo que se conoce popularmente como ciática. Si la hernia es cervical, el recorrido va del cuello al hombro y baja por el brazo, en ocasiones hasta los dedos.",
          "Junto a ese dolor aparecen otras señales que apuntan al nervio y no al músculo: hormigueo o sensación de adormecimiento en una zona bien delimitada de la pierna o del brazo, y la impresión de que la extremidad responde con menos fuerza que antes, como al pararte en puntas o al sostener un objeto.",
          "También es frecuente que el dolor se dispare al toser, estornudar o hacer fuerza, porque esos movimientos aumentan la presión dentro del canal. Y que estar mucho rato sentado o inclinado hacia adelante resulte más molesto que caminar. Ese patrón, más el recorrido del dolor, es lo que distingue una hernia de una contractura común.",
        ],
      },
      "cuando-consultar": {
        heading: "Cuándo consultar con un especialista",
        paragraphs: [
          "Un dolor de espalda aislado que mejora en pocos días con medidas básicas no necesita, en principio, una consulta de urgencia. La señal para buscar evaluación es otra: dolor que baja por la pierna o por el brazo y que no cede después de un par de semanas de manejo inicial, o que va a más semana a semana en vez de a menos.",
          "Hay tres situaciones que no admiten esperar y justifican atención inmediata: pérdida de fuerza que avanza rápido en una pierna o en un brazo, adormecimiento en la zona de la entrepierna y los genitales, y dificultad para controlar la orina o la deposición. Ese conjunto puede indicar una compresión seria del canal y se evalúa el mismo día, no en la próxima cita disponible.",
        ],
      },
      diagnostico: {
        heading: "Cómo se diagnostica",
        paragraphs: [
          "El diagnóstico empieza en la consulta, no en el equipo de imágenes. La historia clínica define desde cuándo duele, hasta dónde baja el dolor, qué lo empeora y qué lo alivia. El examen físico completa el mapa: se revisa la fuerza de grupos musculares específicos, los reflejos, la sensibilidad por territorios y algunas maniobras que ponen en tensión la raíz nerviosa para reproducir el síntoma.",
          "La resonancia magnética es el estudio que mejor muestra el disco, la raíz y el contenido del canal, y es el que confirma la sospecha. La radiografía sirve para otra cosa: muestra hueso, alineación y estabilidad, no el disco. La tomografía se reserva para casos puntuales, como cuando interesa ver detalle óseo o el paciente no puede entrar a una resonancia.",
          "Hay un matiz importante que conviene tener claro antes de leer un informe: una parte considerable de las resonancias de personas sin ningún dolor muestra discos alterados. Por eso el estudio no se interpreta solo. Lo que define la conducta es la coincidencia entre lo que muestra la imagen y lo que muestran tus síntomas y tu examen.",
        ],
      },
      tratamiento: {
        heading: "Opciones de tratamiento",
        paragraphs: [
          "La mayoría de las hernias discales no termina en quirófano. El tratamiento se define según qué tanto está comprometido el nervio, cuánto te limita en tu vida diaria y cómo responde el cuadro a las primeras medidas. La secuencia habitual va de lo menos invasivo a lo más invasivo, y solo avanza si el escalón anterior no alcanzó.",
        ],
        subsections: [
          {
            heading: "Manejo conservador",
            paragraphs: [
              "La primera etapa apunta a controlar el dolor y la inflamación con la medicación que indique tu médico, y a mantenerte en movimiento dentro de lo que toleres. El reposo absoluto prolongado quedó descartado hace tiempo: más allá de los primeros días de crisis, quedarse en cama debilita la musculatura que sostiene la columna y suele alargar el cuadro.",
              "En paralelo entra la terapia física, que es donde se juega buena parte del resultado. El trabajo dirigido busca descargar el segmento afectado, recuperar movilidad y fortalecer la musculatura profunda del tronco. Se suma la corrección de la postura de trabajo y de la forma de levantar peso, que es lo que evita la recaída.",
              "Cuando el dolor por compromiso de la raíz no cede con eso, existen procedimientos intermedios como las infiltraciones guiadas por imagen, que depositan medicación antiinflamatoria cerca de la raíz irritada. No reparan el disco, pero pueden bajar el dolor lo suficiente para que la terapia avance. Este manejo se sostiene varias semanas antes de plantear otra cosa.",
            ],
          },
          {
            heading: "Cuándo se plantea la cirugía",
            paragraphs: [
              "La cirugía entra en la conversación en tres escenarios: cuando hay pérdida de fuerza que progresa, cuando aparecen los signos de compresión seria del canal que se mencionaron arriba, y cuando el dolor irradiado sigue siendo incapacitante pese a un manejo conservador bien hecho y sostenido en el tiempo.",
              "El objetivo de la operación es liberar el nervio comprimido y devolverle espacio, no corregir el aspecto de una imagen. Por eso una resonancia con una hernia visible, en alguien que mejora y hace vida normal, no es por sí sola una indicación quirúrgica.",
              "Según el caso, el abordaje puede ser mínimamente invasivo, con incisiones pequeñas, menos daño muscular y menos sangrado, o convencional cuando el desgaste es amplio o hay inestabilidad que obliga a estabilizar el segmento. La técnica se elige por el diagnóstico y por tus estudios, y se conversa contigo antes de decidir.",
            ],
          },
        ],
      },
      recuperacion: {
        heading: "Cómo es la recuperación",
        paragraphs: [
          "Con manejo conservador la mejoría suele ser gradual y no lineal. Hay semanas buenas y días de retroceso, sobre todo si se vuelve demasiado rápido a la actividad que desencadenó el cuadro. Lo esperable es que la tendencia general apunte a menos dolor irradiado y más tolerancia al movimiento.",
          "Después de una cirugía de descompresión el criterio actual es movilizarte de forma temprana, y el retorno a las actividades cotidianas se plantea de manera progresiva en las semanas siguientes. El plazo concreto depende de la técnica usada, del estado previo de tu musculatura y de tu trabajo, y se define en los controles, no de antemano.",
          "En ambos caminos hay un punto en común: la recuperación no termina cuando se va el dolor. Sostener el ejercicio indicado, cuidar la mecánica al cargar peso y mantener un peso corporal razonable es lo que reduce la probabilidad de una recaída en el mismo nivel o en el vecino.",
        ],
      },
      "preguntas-frecuentes": {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        subsections: [
          {
            heading: "¿Una hernia discal siempre necesita cirugía?",
            paragraphs: [
              "No. Buena parte de los casos mejora con manejo conservador bien llevado. La cirugía se reserva para el compromiso neurológico y para el dolor que no cede pese al tratamiento sostenido. Que exista una hernia en la resonancia no significa, por sí solo, que haya que operar.",
            ],
          },
          {
            heading: "¿La hernia se puede reabsorber sola?",
            paragraphs: [
              "Parte del material herniado puede reducirse con el tiempo, porque el organismo lo reconoce como algo que no debería estar ahí y lo reabsorbe de forma gradual. Es una de las razones por las que tiene sentido darle tiempo al manejo conservador antes de plantear una operación.",
            ],
          },
          {
            heading: "¿Puedo hacer ejercicio si tengo una hernia discal?",
            paragraphs: [
              "En general sí, y conviene. Lo que cambia es el tipo de ejercicio y el momento. En la fase aguda se evitan las cargas axiales, los saltos y los giros con peso. Superada esa etapa, el trabajo dirigido de fuerza y movilidad es parte del tratamiento. Quien te evalúa define qué corresponde en tu caso.",
            ],
          },
          {
            heading: "¿Qué pasa si la dejo sin tratar?",
            paragraphs: [
              "Muchos episodios mejoran, pero una raíz nerviosa comprimida durante mucho tiempo puede quedar con secuelas de fuerza o de sensibilidad que ya no revierten del todo. Por eso el dolor se puede observar un tiempo, pero la pérdida de fuerza no: esa se evalúa sin postergar.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "estenosis-espinal",
    navLabel: "Estenosis espinal",
    h1: "Estenosis espinal (canal estrecho)",
    title: "Estenosis espinal: síntomas, diagnóstico y tratamiento",
    description:
      "Qué es la estenosis espinal o canal estrecho, por qué las piernas pesan al caminar, cómo se diagnostica y cuándo se plantea la cirugía. Guía del Dr. Juan Carlos Angulo, cirujano de columna en Lima.",
    cardSummary:
      "Por qué las piernas pesan al caminar, cómo se confirma el canal estrecho y qué opciones hay.",
    conditionName: "Estenosis espinal",
    alternateNames: ["Canal estrecho lumbar", "Estenosis de canal"],
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-10",
    describesSurgery: true,
    relatedPosts: ["estenosis-espinal-que-es"],
    ctaBanner: {
      heading: "¿Caminas menos que antes y tienes que sentarte?",
      body: "Una evaluación con tus estudios define cuánto se redujo el espacio del canal y qué opciones tienes hoy.",
    },
    sections: {
      "que-es": {
        heading: "Qué es la estenosis espinal",
        paragraphs: [
          "El canal espinal es el túnel que recorre la columna por dentro y que protege la médula y las raíces nerviosas que salen hacia los brazos y las piernas. La estenosis espinal es el estrechamiento de ese túnel. Cuando el espacio disponible se reduce, las estructuras nerviosas que viajan por ahí quedan comprimidas y empiezan a dar síntomas.",
          "Ese estrechamiento casi nunca tiene una sola causa. Con los años el disco intervertebral pierde altura, las articulaciones pequeñas de la parte posterior de la vértebra se engrosan para repartir la carga, y el ligamento que tapiza el canal por dentro se vuelve más grueso. Cada uno de esos cambios le quita unos milímetros al espacio, y es la suma la que termina apretando.",
          "La forma degenerativa es la más frecuente y aparece por lo general a partir de los sesenta años, como parte del desgaste natural de la columna. Se observa más en mujeres. Existen además formas menos comunes: personas que nacen con un canal más estrecho de lo habitual y dan síntomas antes, y casos en los que una vértebra se desliza sobre la de abajo y reduce el espacio de manera adicional.",
          "La zona lumbar es la que se afecta con más frecuencia, porque es donde se concentra la carga. También ocurre a nivel cervical, y ahí el cuadro es distinto, porque lo que queda comprimido es la médula y no solamente las raíces.",
        ],
      },
      sintomas: {
        heading: "Síntomas del canal estrecho",
        paragraphs: [
          "El síntoma que mejor define a la estenosis lumbar no es el dolor de espalda, sino lo que pasa al caminar. Después de un tramo variable aparecen pesadez, calambre, ardor u hormigueo en una pierna o en las dos, y la marcha se vuelve insegura. Si te detienes y te sientas, o si te inclinas hacia adelante, la molestia cede en pocos minutos y puedes retomar el camino.",
          "Esa respuesta a la postura tiene una explicación mecánica: al inclinarte hacia adelante el canal gana algo de espacio, y al enderezarte lo pierde. Por eso muchas personas notan que toleran mejor empujar un carrito de supermercado o pedalear en una bicicleta que caminar erguidas la misma distancia. Bajar una pendiente suele costar más que subirla, por la misma razón.",
          "Con el tiempo lo que cambia no es tanto la intensidad del dolor como la distancia. Empiezas a medir tus salidas por cuadras, evitas los trámites que implican cola y planificas de antemano dónde vas a poder sentarte. Ese recorte progresivo del radio de movimiento es el dato clínico más útil de todo el cuadro, y conviene llevarlo anotado a la consulta.",
          "En la estenosis cervical el patrón es otro: torpeza de las manos para abotonar o escribir, sensación de inestabilidad al caminar y cambios en el equilibrio. Ese conjunto de señales se evalúa sin postergar.",
        ],
      },
      "cuando-consultar": {
        heading: "Cuándo consultar con un especialista",
        paragraphs: [
          "La señal para pedir una evaluación no es el dolor lumbar aislado que va y viene, sino la limitación al caminar que se repite siempre del mismo modo y que se acorta mes a mes. Si el trayecto que antes hacías sin pensarlo ahora te obliga a parar, ya hay material suficiente para estudiar el caso.",
          "Hay tres situaciones que no admiten esperar turno: pérdida de fuerza que avanza en una pierna, adormecimiento en la zona de la entrepierna y los genitales, y dificultad para controlar la orina o la deposición. Ese conjunto puede indicar una compresión seria del canal y se evalúa el mismo día, no en la próxima cita disponible.",
          "También vale consultar si el cuadro te cambió la vida cotidiana aunque el dolor te resulte tolerable. Dejar de salir, abandonar el ejercicio o depender de que alguien te acompañe son consecuencias que pesan tanto como el dolor a la hora de decidir un tratamiento.",
        ],
      },
      diagnostico: {
        heading: "Cómo se diagnostica",
        paragraphs: [
          "El diagnóstico se arma primero con lo que cuentas. La historia clínica precisa a qué distancia aparece la molestia, qué la alivia, cuánto demoras en recuperarte al sentarte y desde cuándo se viene acortando ese trayecto. Ese relato es bastante característico y orienta mucho antes de mirar cualquier imagen.",
          "El examen físico revisa fuerza por grupos musculares, reflejos, sensibilidad por territorios y también los pulsos de las piernas. Este último punto importa porque hay un cuadro de origen circulatorio que se le parece, en el que la pierna igualmente duele al caminar. La diferencia está en que ahí la molestia cede con solo detenerse, sin necesidad de sentarse ni de inclinarse, y no cambia con la postura.",
          "La resonancia magnética es el estudio que mejor muestra el contenido del canal, el grosor del ligamento y el grado de compresión en cada nivel. La radiografía aporta otra cosa: alineación, altura de los discos y, en las tomas de pie o en movimiento, si existe un deslizamiento que se hace mayor al inclinarte. La tomografía se reserva para ver detalle óseo o para quien no puede entrar a una resonancia.",
          "Como en cualquier estudio de columna, la imagen no se lee sola. Hay canales estrechos en las resonancias de personas que caminan sin ningún problema. Lo que define la conducta es la coincidencia entre lo que muestra el estudio y lo que muestran tus síntomas y tu examen.",
        ],
      },
      tratamiento: {
        heading: "Opciones de tratamiento",
        paragraphs: [
          "La estenosis es un problema de espacio, y el espacio no se recupera con medicación. Eso no convierte a la cirugía en el primer paso: buena parte de los casos mejora lo suficiente con un manejo conservador bien llevado. Lo que define el camino es cuánto te limita hoy el cuadro y cómo responde a las primeras medidas.",
        ],
        subsections: [
          {
            heading: "Manejo conservador",
            paragraphs: [
              "El objetivo de esta etapa es ganar tolerancia a la marcha y controlar el dolor con la medicación que indique tu médico. La terapia física trabaja en una dirección concreta: movilidad de la cadera, fuerza de la musculatura profunda del tronco y control de la postura lumbar, con ejercicios que suelen tolerarse mejor en ligera flexión.",
              "El acondicionamiento aeróbico se cuida aparte, porque la trampa de este cuadro es previsible: caminas menos, pierdes estado físico y toleras todavía menos. La bicicleta estática, la caminata en agua o los tramos cortos con pausas programadas mantienen el fondo sin provocar la crisis. Reducir el peso corporal, cuando corresponde, descarga el segmento y suele notarse.",
              "Cuando el dolor por compromiso de la raíz no cede con eso, existen las infiltraciones guiadas por imagen, que depositan medicación antiinflamatoria cerca de la zona comprimida. No ensanchan el canal, pero pueden bajar el dolor lo suficiente para que la terapia avance. Este manejo se sostiene varias semanas antes de plantear otra cosa.",
            ],
          },
          {
            heading: "Cuándo se plantea la cirugía",
            paragraphs: [
              "La cirugía entra en la conversación cuando la distancia que puedes caminar quedó tan corta que te condiciona la vida diaria pese a un manejo conservador bien hecho y sostenido, cuando hay pérdida de fuerza que progresa, o cuando aparecen los signos de compresión seria que se mencionaron más arriba.",
              "El procedimiento apunta a devolverle espacio al nervio: se retira el hueso engrosado y el ligamento que están cerrando el canal, y se libera la raíz comprimida en los niveles que corresponda. Cuando además hay un deslizamiento de una vértebra sobre otra, o el segmento queda inestable, la descompresión se acompaña de una artrodesis, que fija ese tramo para que no se desplace.",
              "Según el caso el abordaje puede ser mínimamente invasivo, con incisiones pequeñas y menos daño muscular, o convencional cuando el compromiso abarca varios niveles o hay que corregir la alineación. La técnica se elige por el diagnóstico y por tus estudios, y se conversa contigo antes de decidir. Una imagen con el canal estrecho, en alguien que camina bien, no es por sí sola una indicación quirúrgica.",
            ],
          },
        ],
      },
      recuperacion: {
        heading: "Cómo es la recuperación",
        paragraphs: [
          "Con manejo conservador la mejoría se mide en distancia y no en ausencia total de dolor. La señal de que el plan funciona es que vuelves a caminar tramos que habías dejado de hacer y que necesitas menos pausas. El avance es gradual y con retrocesos, sobre todo si se retoma de golpe una actividad que estuvo suspendida meses.",
          "Después de una descompresión el criterio actual es levantarte y caminar de forma temprana, con progresión de la distancia según tolerancia y con indicaciones de cuidado de la espalda mientras la zona cicatriza. El retorno a las actividades cotidianas se plantea de manera progresiva, y el plazo depende de la técnica usada, de si hubo artrodesis, de tu estado previo y de tu trabajo. Se define en los controles, no de antemano.",
          "Conviene tener claro un punto desde el inicio: liberar el canal resuelve la compresión, pero no borra los años de la columna. Sostener el ejercicio indicado, cuidar la mecánica al cargar peso y mantener un peso corporal razonable es lo que ayuda a que el resultado se mantenga y reduce la probabilidad de que un nivel vecino dé problemas más adelante.",
        ],
      },
      "preguntas-frecuentes": {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        subsections: [
          {
            heading: "¿La estenosis espinal se puede revertir sin cirugía?",
            paragraphs: [
              "El estrechamiento en sí no se revierte con tratamiento conservador, porque es un cambio en la estructura. Lo que sí puede mejorar bastante es el síntoma: con terapia dirigida, acondicionamiento aeróbico y control del peso, muchas personas recuperan distancia de marcha y hacen su vida sin necesidad de operarse.",
            ],
          },
          {
            heading: "¿Por qué me molesta al caminar y no al pedalear?",
            paragraphs: [
              "Porque el canal cambia de tamaño con la postura. Al inclinarte hacia adelante, que es lo que haces sobre una bicicleta o empujando un carrito, el espacio disponible aumenta un poco y el nervio deja de estar comprimido. Al caminar erguido ocurre lo contrario. Esa diferencia es tan característica que forma parte del diagnóstico.",
            ],
          },
          {
            heading: "¿La edad me descarta para una operación?",
            paragraphs: [
              "La edad por sí sola no decide. Lo que se evalúa es tu estado general, las otras condiciones que tengas y cuánto te está limitando el cuadro, y esa evaluación se hace junto con las especialidades que correspondan antes de plantear cualquier procedimiento. La conversación sobre riesgos y beneficios es parte de la consulta, no un trámite posterior.",
            ],
          },
          {
            heading: "¿Voy a necesitar tornillos?",
            paragraphs: [
              "No siempre. Cuando el problema es solo de espacio, la descompresión puede ser suficiente. Los implantes se plantean cuando además hay inestabilidad o un deslizamiento entre vértebras, porque en ese escenario liberar sin estabilizar puede dejar el segmento peor de lo que estaba. Esa decisión sale de tus estudios y se te explica antes de la cirugía.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "escoliosis",
    navLabel: "Escoliosis",
    h1: "Escoliosis y deformidades de columna",
    title: "Escoliosis y deformidades de columna: diagnóstico y tratamiento",
    description:
      "Qué es la escoliosis, cómo se detecta durante el crecimiento, qué hace el corsé y cuándo se plantea una corrección quirúrgica. Guía del Dr. Juan Carlos Angulo, cirujano de columna en Lima.",
    cardSummary:
      "Cómo se detecta una curva a tiempo, qué logra el corsé y cuándo se plantea corregirla.",
    conditionName: "Escoliosis",
    alternateNames: ["Deformidad de columna", "Cifosis"],
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-10",
    describesSurgery: true,
    relatedPosts: [],
    ctaBanner: {
      heading: "¿Notas un hombro más alto o la cintura despareja?",
      body: "Una evaluación con radiografía de pie define si la curva necesita seguimiento, corsé o corrección.",
    },
    sections: {
      "que-es": {
        heading: "Qué es la escoliosis",
        paragraphs: [
          "Vista de frente, la columna debería verse recta. La escoliosis es una desviación lateral de esa línea que además se acompaña de una rotación de las vértebras sobre su propio eje, así que no es solo una curva: es un cambio en tres dimensiones. Se habla de escoliosis cuando la desviación supera los diez grados medidos sobre una radiografía tomada de pie.",
          "Vista de perfil, en cambio, la columna sí tiene curvas normales: una hacia adelante en el cuello y en la zona lumbar, y una hacia atrás en la zona dorsal. Cuando esa curva dorsal se acentúa más de lo esperable se habla de cifosis, y la espalda adopta una postura encorvada que no se corrige del todo al pedirle a la persona que se enderece.",
          "La forma más frecuente es la escoliosis idiopática del adolescente, que aparece durante el estirón del crecimiento y no tiene una causa única identificable. Hay otras: las congénitas, en las que una vértebra se formó de manera incompleta; las asociadas a enfermedades neuromusculares; y las del adulto, que pueden ser una curva de la adolescencia que siguió su curso o una deformidad nueva por desgaste, cuando el disco y las articulaciones se gastan de forma despareja y la columna se va inclinando.",
          "El punto que más conviene entender es este: no todas las curvas se comportan igual. Lo que define la conducta no es que exista una curva, sino cuánto mide, dónde está, cuánto crecimiento le queda a la persona y si está progresando.",
        ],
      },
      sintomas: {
        heading: "Cómo se manifiesta",
        paragraphs: [
          "En el adolescente la escoliosis casi nunca duele, y esa es justamente la razón por la que suele detectarse tarde. Lo que se nota es la asimetría: un hombro más alto que el otro, una escápula que sobresale, la cintura despareja, la ropa que cae torcida o un lado del tronco que se ve más prominente.",
          "Hay una manera sencilla de mirarlo en casa. Al pedirle que se incline hacia adelante con las rodillas rectas y los brazos colgando, la rotación de las vértebras hace que un lado de la espalda quede más alto que el otro. Si aparece ese desnivel, corresponde una evaluación aunque no haya ninguna molestia.",
          "En el adulto el cuadro cambia. Ahí sí suele haber dolor lumbar, sensación de fatiga de la espalda al estar de pie un rato, pérdida de estatura y la impresión de estar inclinándote hacia adelante o hacia un lado sin poder evitarlo. Cuando la deformidad reduce el espacio por donde salen los nervios, se suman dolor irradiado a la pierna, hormigueo y limitación para caminar.",
          "En la cifosis lo que se ve es la espalda encorvada, con molestia en la zona dorsal después de estar sentado o de pie por periodos largos. Si esa curvatura aparece de manera brusca en una persona mayor, conviene descartar una fractura vertebral por fragilidad del hueso.",
        ],
      },
      "cuando-consultar": {
        heading: "Cuándo consultar con un especialista",
        paragraphs: [
          "Durante el crecimiento vale la pena evaluar cualquier asimetría del tronco que llame la atención, sobre todo si coincide con el estirón, porque es el periodo en el que una curva puede aumentar más rápido. Que haya antecedentes de escoliosis en la familia es otra razón para revisar sin esperar a que aparezca algo evidente.",
          "En quien ya tiene el diagnóstico, la señal para adelantar el control es que la asimetría se vea distinta a la del chequeo anterior o que la ropa deje de caer como caía. La progresión se documenta comparando estudios, no de memoria.",
          "Hay situaciones que se evalúan sin postergar a cualquier edad: dolor que despierta en la noche, pérdida de fuerza en una pierna o en un brazo, adormecimiento en la zona de la entrepierna, cambios en el control de la orina o la deposición, y una deformidad que aparece o se acentúa de manera rápida. En el adulto, también la imposibilidad de mantenerte erguido al caminar.",
        ],
      },
      diagnostico: {
        heading: "Cómo se diagnostica",
        paragraphs: [
          "La evaluación empieza en la consulta, con la persona de pie y el tronco visto de frente, de perfil y de espaldas. Se revisa la altura de los hombros y de las caderas, la simetría de la cintura, la alineación de la cabeza sobre la pelvis y el desnivel del tronco al inclinarse hacia adelante. En niños y adolescentes se suma la valoración del desarrollo, porque el crecimiento que queda pesa tanto como la curva actual.",
          "El estudio de base es la radiografía de columna completa tomada de pie, que muestra la curva tal como se comporta con el peso del cuerpo encima. Sobre esa imagen se mide el ángulo de la desviación, se identifican las vértebras que la limitan y se estima la madurez ósea, que es lo que permite anticipar cuánto puede progresar.",
          "Las radiografías en inclinación lateral sirven para saber qué tan flexible es la curva, un dato que cambia el plan cuando se está evaluando una corrección. La resonancia magnética no es de rutina: se pide cuando la curva tiene características atípicas, cuando hay signos neurológicos, o cuando interesa ver el estado de los discos y del canal antes de una cirugía.",
          "El seguimiento se hace comparando estudios equivalentes a lo largo del tiempo, siempre con la misma técnica, para que la comparación sea válida y para no repetir radiografías más de lo necesario.",
        ],
      },
      tratamiento: {
        heading: "Opciones de tratamiento",
        paragraphs: [
          "El tratamiento de una deformidad no se decide por la foto de la radiografía sino por la combinación de tres cosas: cuánto mide la curva, cuánto crecimiento le queda a la persona y qué le está produciendo hoy. Con esos tres datos, las alternativas van de la observación programada a la corrección quirúrgica, y cada escalón tiene su indicación.",
        ],
        subsections: [
          {
            heading: "Manejo conservador",
            paragraphs: [
              "En curvas pequeñas y estables la conducta es observar con controles programados. Observar no es dejar pasar: es medir con el mismo método cada cierto tiempo mientras dura el crecimiento, para detectar a tiempo si la curva está progresando. Buena parte de las curvas leves nunca necesita otra cosa.",
              "El corsé se plantea en curvas moderadas cuando todavía queda crecimiento por delante. Su objetivo no es enderezar la columna sino frenar la progresión mientras el esqueleto termina de madurar, y el resultado depende en buena medida de que se cumplan las horas de uso indicadas. Se acompaña de un plan de controles y se retira cuando la maduración ósea está completa.",
              "La terapia física acompaña en todos los escenarios. Trabaja fuerza del tronco, movilidad, conciencia postural y tolerancia a la actividad. En el adulto con deformidad degenerativa es una parte central del manejo del dolor, junto con la medicación que indique tu médico y, en casos puntuales, las infiltraciones guiadas por imagen. En el adolescente la terapia no reemplaza al corsé cuando el corsé está indicado.",
            ],
          },
          {
            heading: "Cuándo se plantea la cirugía",
            paragraphs: [
              "La cirugía entra en la conversación cuando la curva es grande, cuando sigue progresando pese a un tratamiento conservador bien cumplido, o cuando la deformidad ya produce consecuencias concretas: dolor que no cede, compromiso de los nervios, o una inclinación que impide mantener el tronco equilibrado sobre la pelvis.",
              "El procedimiento busca corregir la curva hasta donde es seguro hacerlo y estabilizar el tramo corregido con una artrodesis que abarca varios niveles. Cuando la deformidad además estrechó el paso de los nervios, esa compresión se libera en el mismo tiempo quirúrgico. En el adulto el objetivo suele ser doble: corregir y recuperar el equilibrio, para poder sostenerte de pie sin tanto esfuerzo.",
              "Es una cirugía de planificación larga, que se define sobre los estudios de cada persona y no sobre un promedio. El Dr. Angulo tiene formación específica en corrección de deformidades de columna, además de su especialización en cirugía de columna, y la conversación previa incluye qué se corrige, qué no se corrige y qué implica la fijación de aquí en adelante.",
            ],
          },
        ],
      },
      recuperacion: {
        heading: "Cómo es la recuperación",
        paragraphs: [
          "En el manejo conservador no hay una recuperación en el sentido de un alta: hay un seguimiento. Mientras dura el crecimiento el plan se ajusta control a control, y lo que se busca es llegar al final de la maduración con una curva que no comprometa la función ni siga aumentando en la vida adulta.",
          "Después de una cirugía de corrección el plan es individual y depende de la magnitud de la curva, de cuántos niveles se fijaron y de la edad. En términos generales se busca movilizarte de forma temprana, con progresión gradual de la actividad y con indicaciones concretas sobre qué movimientos y qué cargas se evitan mientras la artrodesis consolida. Los plazos se conversan en los controles y se ajustan sobre la marcha, no se fijan de antemano.",
          "El adolescente operado suele retomar la vida escolar bastante antes que el deporte, y el retorno a la actividad deportiva se autoriza por etapas. En el adulto el ritmo es más lento y el trabajo de acondicionamiento pesa más, porque el punto de partida y las otras condiciones de salud cambian el escenario.",
          "En los dos casos el resultado se sostiene con lo mismo: el ejercicio indicado, el cuidado de la mecánica al cargar peso y controles que no se abandonan apenas desaparece la molestia.",
        ],
      },
      "preguntas-frecuentes": {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        subsections: [
          {
            heading: "¿La mochila del colegio produce escoliosis?",
            paragraphs: [
              "No. El peso mal repartido de una mochila puede producir dolor de espalda y molestia muscular, y por eso conviene cuidarlo, pero no genera una escoliosis. La forma más común aparece durante el crecimiento sin una causa externa identificable. Ajustar la mochila es buena idea por otros motivos, no como prevención de la curva.",
            ],
          },
          {
            heading: "¿La escoliosis se corrige con ejercicios?",
            paragraphs: [
              "Los ejercicios cumplen un papel importante en fuerza, movilidad, postura y control del dolor, pero no enderezan por sí solos una curva estructural. En el adolescente con una curva moderada y crecimiento por delante, la herramienta que busca frenar la progresión es el corsé bien indicado y bien usado. La terapia acompaña ese plan, no lo reemplaza.",
            ],
          },
          {
            heading: "¿Puede hacer deporte con escoliosis?",
            paragraphs: [
              "Por lo general sí, y conviene que lo haga. La actividad física sostiene la musculatura del tronco y el estado general. Lo que se define caso por caso es si hay alguna disciplina que convenga moderar según la magnitud de la curva, o cómo se organiza el deporte cuando se está usando corsé. Eso se conversa en el control.",
            ],
          },
          {
            heading: "¿Se pierde movimiento después de una artrodesis?",
            paragraphs: [
              "El tramo que se fija pierde movilidad, eso es cierto y se explica antes de operar. Lo que suele sorprender es cuánta función se conserva, porque el resto de la columna y las caderas compensan buena parte de ese movimiento. Cuanto más corto es el tramo fijado, menos se nota, y ese es uno de los factores que se busca cuidar al planificar la cirugía.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "ortopedia-infantil",
    navLabel: "Ortopedia infantil",
    h1: "Ortopedia infantil",
    title: "Ortopedia infantil: desarrollo, marcha y columna en crecimiento",
    description:
      "Qué se evalúa en una consulta de ortopedia infantil, qué hallazgos son parte del desarrollo normal y cuáles necesitan atención. Guía del Dr. Juan Carlos Angulo, traumatólogo en Lima.",
    cardSummary:
      "Qué es parte del desarrollo normal, qué necesita evaluación y cuándo no conviene esperar.",
    conditionName: "Condiciones ortopédicas en niños y adolescentes",
    alternateNames: [
      "Displasia congénita de cadera",
      "Alteraciones de la marcha",
      "Escoliosis en niños y adolescentes",
      "Deformidades de postura",
    ],
    publishedAt: "2026-08-10",
    updatedAt: "2026-08-10",
    // La sección de tratamiento de esta página se queda en observación,
    // ortesis, terapia y controles del crecimiento: no describe ningún
    // abordaje quirúrgico. Los procedimientos declarados en el grafo son de
    // cirugía de columna del adulto, así que referenciarlos acá afirmaría algo
    // que el texto no dice (CTX-18).
    describesSurgery: false,
    relatedPosts: [],
    ctaBanner: {
      heading: "¿Tienes dudas sobre cómo camina o cómo se para tu hijo?",
      body: "Una evaluación define si lo que ves es parte del desarrollo normal o necesita seguimiento.",
    },
    sections: {
      "que-es": {
        heading: "Qué es la ortopedia infantil",
        paragraphs: [
          "La ortopedia infantil se ocupa del desarrollo de los huesos, las articulaciones y los músculos desde el nacimiento hasta el final del crecimiento. No es la versión pequeña de la ortopedia del adulto: un niño está creciendo, y esa diferencia cambia por completo cómo se interpreta un hallazgo y qué conviene hacer con él.",
          "Buena parte de lo que preocupa a los padres en los primeros años corresponde a variantes normales del desarrollo, que siguen un curso previsible y se resuelven solas. Las piernas arqueadas del bebé que empieza a caminar, la etapa posterior en la que las rodillas se juntan, el pie plano flexible del preescolar o la marcha con las puntas hacia adentro entran con frecuencia en esa categoría.",
          "Otras situaciones sí necesitan una conducta activa y, sobre todo, un diagnóstico temprano. La displasia del desarrollo de la cadera es el ejemplo más claro: detectada en los primeros meses, el tratamiento suele ser sencillo; detectada tarde, el escenario se complica. Algo parecido pasa con las curvas de columna que aparecen durante el estirón del crecimiento.",
          "El objetivo de una consulta de ortopedia infantil es doble: reconocer lo que necesita tratamiento y, con la misma importancia, tranquilizar cuando lo que hay es una etapa normal del desarrollo que no requiere plantillas, ni zapatos especiales, ni tratamiento alguno.",
        ],
      },
      sintomas: {
        heading: "Qué se observa en casa",
        paragraphs: [
          "Casi todo lo que llega a la consulta empieza con algo que notaron en casa o en el colegio. La forma de caminar suele ser el primer motivo: puntas hacia adentro o hacia afuera, caminar en puntas de pie de manera sostenida, tropiezos frecuentes, o una manera de correr que llama la atención frente a los demás niños.",
          "En bebés y lactantes se observa otra cosa: pliegues del muslo asimétricos, la sensación de que una pierna se ve más corta que la otra, o que una cadera se abre menos que la otra al cambiar el pañal. Esos detalles son los que orientan hacia una cadera que no está bien ubicada, y vale mencionarlos en la consulta aunque parezcan mínimos.",
          "En niños más grandes y adolescentes aparecen los motivos de columna y de postura: un hombro más alto que el otro, la escápula que sobresale, la cintura despareja, la espalda encorvada al estar sentado. También el dolor asociado a la actividad deportiva, que en esta edad tiene causas propias ligadas al crecimiento.",
          "Conviene tener presente que la mayoría de estos hallazgos no duele. Un niño con una curva de columna o con una torsión de la pierna habitualmente no se queja, y por eso la observación de los padres y el control periódico valen tanto: son lo que permite detectar a tiempo aquello que el niño no va a reportar por su cuenta.",
        ],
      },
      "cuando-consultar": {
        heading: "Cuándo llevarlo a evaluar",
        paragraphs: [
          "Hay motivos que justifican una consulta sin urgencia, en la próxima cita disponible: la duda sobre la forma de caminar, la asimetría del tronco que notas al verlo de espaldas, el pie que sigue viéndose plano cuando ya pasó la edad en la que suele formarse el arco, o simplemente la necesidad de saber si lo que ves entra dentro de lo esperable para su edad.",
          "Hay otros que no conviene postergar. La cojera es el primero: un niño que cojea necesita ser evaluado, aunque no refiera dolor. El dolor que lo despierta de noche, el que se concentra en una sola articulación con hinchazón o calor, y el que viene acompañado de fiebre entran en el mismo grupo, porque obligan a descartar causas que no son mecánicas.",
          "También se revisan sin esperar la pérdida de una habilidad que ya tenía, la limitación para mover una extremidad, la deformidad que aparece o aumenta rápido y cualquier debilidad en una pierna o en un brazo. En el recién nacido y el lactante, la asimetría de pliegues o la limitación para abrir una cadera se evalúan pronto, porque el margen para un tratamiento sencillo es más amplio cuanto antes se detecta.",
          "Un punto para las madres y los padres que llegan con miedo: consultar temprano no significa que vaya a haber un tratamiento. En muchos casos la consulta termina con un control programado y con la explicación de qué esperar en los meses siguientes. Salir de la duda es, por sí solo, un buen motivo para pedir la cita.",
        ],
      },
      diagnostico: {
        heading: "Cómo se evalúa",
        paragraphs: [
          "La consulta empieza por la historia: cómo fue el embarazo y el parto, si hubo presentación podálica, si hay antecedentes familiares de problemas de cadera o de columna, a qué edad alcanzó los hitos del desarrollo y desde cuándo notas lo que te preocupa. Ese contexto pesa mucho a esta edad.",
          "El examen se hace con el niño en ropa cómoda y descalzo, y buena parte transcurre mirándolo caminar y correr. Se revisa la simetría del cuerpo, la movilidad de las caderas, la rotación de las piernas, la longitud de los miembros, la alineación de las rodillas, la forma del pie apoyado y sin apoyar, y la columna de frente, de perfil y al inclinarse hacia adelante.",
          "Los estudios de imagen se piden solo cuando cambian la conducta. En el lactante, la ecografía de cadera es el estudio de elección durante los primeros meses, porque a esa edad buena parte de la articulación todavía es cartílago y no se ve en una radiografía. Más adelante la radiografía sí aporta, y para la columna se usa la toma de pie que abarca todo el trazado.",
          "Los estudios más complejos quedan reservados para casos puntuales, y esa contención es deliberada: se busca la menor cantidad de radiación necesaria para tomar una decisión correcta.",
        ],
      },
      tratamiento: {
        heading: "Qué tratamiento corresponde",
        paragraphs: [
          "En ortopedia infantil el tratamiento se apoya en algo que el adulto no tiene a favor: el crecimiento. Un hueso que está creciendo se remodela, y eso hace que muchas alteraciones se corrijan solas o respondan a medidas simples. Por eso el plan empieza casi siempre por definir si corresponde intervenir o si corresponde acompañar.",
        ],
        subsections: [
          {
            heading: "Observación y controles programados",
            paragraphs: [
              "Para las variantes normales del desarrollo la indicación es el seguimiento. A un pie plano flexible sin dolor no se le ponen plantillas, ni zapatos ortopédicos, ni ejercicios correctivos, porque no modifican el curso natural del arco y sí instalan en la familia la idea de que el niño tiene un problema. Lo que se hace es explicar qué se espera, dejar controles y actuar si el curso se sale de lo previsto.",
              "El control programado es la herramienta principal de esta especialidad. Comparar el mismo examen a lo largo del tiempo es lo que distingue una etapa que se está resolviendo de una que está progresando, y esa distinción no se puede hacer en una sola visita. La frecuencia de los controles se define según la edad y según el hallazgo.",
              "La actividad física entra siempre en el plan. Jugar, correr, trepar y practicar deporte es parte del desarrollo músculo esquelético, y salvo una indicación puntual, un hallazgo en la consulta no es motivo para sacar al niño de la actividad.",
            ],
          },
          {
            heading: "Ortesis, terapia y derivación cuando el seguimiento no alcanza",
            paragraphs: [
              "Cuando hay un diagnóstico que sí requiere conducta, las herramientas iniciales suelen ser ortopédicas. En la displasia de cadera detectada temprano lo habitual es un arnés que mantiene la articulación en la posición correcta mientras termina de formarse, con controles ecográficos que verifican el avance. En las curvas de columna con crecimiento por delante la herramienta es el corsé, y ese tema está desarrollado en la guía de escoliosis y deformidades de columna.",
              "La terapia física acompaña varios de estos escenarios: trabaja fuerza, movilidad, equilibrio y patrón de marcha. En el adolescente con dolor ligado al deporte es una parte central del plan, junto con el ajuste de las cargas y del calendario de entrenamiento.",
              "Una minoría de casos necesita un procedimiento. Cuando eso aparece, la decisión no se toma en la primera consulta: se completa el estudio, se evalúa junto con las especialidades que correspondan y se conversa con la familia qué se haría, por qué y qué implica, antes de programar nada. Qué corresponde en cada caso depende del diagnóstico y de la edad, y es una conversación que se hace con los estudios sobre la mesa.",
            ],
          },
        ],
      },
      recuperacion: {
        heading: "Seguimiento y crecimiento",
        paragraphs: [
          "En ortopedia infantil el cierre de un caso rara vez es un alta definitiva a corto plazo: es un seguimiento que acompaña el crecimiento. Un hallazgo que se resolvió en los primeros años puede necesitar una mirada nueva en el estirón de la adolescencia, y por eso los controles se espacian pero no siempre se suspenden.",
          "Cuando hubo tratamiento con arnés u ortesis, la etapa siguiente es de verificación: se comprueba con el examen y con las imágenes que corresponda que la articulación se está formando como se espera, y recién entonces se ajusta o se retira el dispositivo. Los plazos dependen de la edad, del diagnóstico y de la respuesta, y se definen en los controles.",
          "Si hubo un procedimiento, la vuelta a la actividad se hace por etapas y con indicaciones concretas para la casa y para el colegio. Los niños suelen recuperar función con facilidad, y justamente por eso conviene no acortar el plan por cuenta propia: lo que se autoriza, y cuándo, sale del control y no de cómo se ve el niño en un buen día.",
          "Del lado de la familia lo más útil es sostener los controles aunque todo parezca estar bien. Los diagnósticos que se complican suelen ser los que se detectaron tarde, no los que se acompañaron desde el inicio.",
        ],
      },
      "preguntas-frecuentes": {
        heading: "Preguntas frecuentes",
        paragraphs: [],
        subsections: [
          {
            heading: "¿El pie plano de mi hijo necesita plantillas?",
            paragraphs: [
              "En la mayoría de los casos no. El pie plano flexible es frecuente en los primeros años y el arco suele aparecer con el crecimiento. Las plantillas no modifican ese curso natural, así que se reservan para situaciones puntuales, sobre todo cuando hay dolor. Lo que sí conviene descartar en la consulta es que el pie sea rígido, porque ese escenario se maneja distinto.",
            ],
          },
          {
            heading: "¿Es normal que camine con las puntas hacia adentro?",
            paragraphs: [
              "Es uno de los motivos de consulta más comunes y por lo general corresponde a una torsión de la tibia o del fémur que se corrige de manera espontánea a medida que el niño crece. Lo que se evalúa es de dónde viene la rotación, si es simétrica y si viene mejorando con el tiempo. Los zapatos correctores y las barras nocturnas quedaron descartados hace tiempo.",
            ],
          },
          {
            heading: "¿A qué edad conviene revisar la columna?",
            paragraphs: [
              "El momento clave es el estirón de la adolescencia, porque es cuando una curva puede aumentar más rápido. Si notas asimetría de hombros o de cintura, o si hay antecedentes familiares de escoliosis, no hace falta esperar a esa edad para revisar. El examen es simple, no duele y no requiere ninguna preparación previa.",
            ],
          },
          {
            heading: "¿Existen los dolores de crecimiento?",
            paragraphs: [
              "Existe un cuadro de dolores en las piernas, habitualmente en ambas, que aparece al final del día o en la noche, cede con masaje y no deja ninguna limitación al día siguiente. Ese patrón es benigno. Lo que no encaja ahí es el dolor de un solo lado, el que se acompaña de cojera, hinchazón o fiebre, y el que limita la actividad: ese se evalúa.",
            ],
          },
        ],
      },
    },
  },
];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((page) => page.slug === slug);
}
