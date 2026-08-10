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
];

export function getServicePage(slug: string): ServicePage | undefined {
  return servicePages.find((page) => page.slug === slug);
}
