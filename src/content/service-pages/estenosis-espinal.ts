import type { ServicePage } from "./index";

export const estenosisEspinal: ServicePage = {
  slug: "estenosis-espinal",
  navLabel: "Estenosis espinal",
  h1: "Estenosis espinal: el canal que se estrecha",
  heroLead: "Cuando el túnel por donde viajan los nervios se estrecha, el cuerpo lo avisa al caminar. Acá encuentras por qué las piernas pesan después de unas cuadras, cómo se confirma el diagnóstico y qué opciones hay en cada etapa.",
  title: "Estenosis espinal: síntomas y tratamiento",
  description: "Qué es la estenosis espinal, por qué aparece con los años, qué alivia el dolor al caminar y en qué casos se opera. Consulta en Lima.",
  cardSummary: "Por qué las piernas pesan al caminar, cómo se confirma el canal estrecho y qué opciones hay.",
  conditionName: "Estenosis espinal",
  alternateNames: [
    "Canal estrecho lumbar",
    "Estenosis de canal",
  ],
  publishedAt: "2026-08-10",
  updatedAt: "2026-08-24",
  format: "guia-clinica",
  describesSurgery: true,
  // Vacío desde el plan 08-14: el único post que apuntaba a esta condición se
  // fundió dentro de esta misma guía y su URL redirige acá.
  relatedPosts: [],
  ctaBanner: {
    heading: "¿Caminas menos que antes y tienes que sentarte?",
    body: "Una evaluación con tus estudios define cuánto se redujo el espacio del canal y qué opciones tienes hoy.",
  },
  bannerAfterSectionId: "que-es",
  outboundLinks: [
    { href: "/servicios/escoliosis-y-deformidades", anchor: "Guía sobre la escoliosis y otras deformidades" },
    { href: "/servicios/hernia-discal", anchor: "Guía sobre la hernia discal" },
    { href: "/sedes/clinica-ricardo-palma", anchor: "Clínica Ricardo Palma, en San Isidro" },
    { href: "/sedes/clinica-tezza", anchor: "Clínica Padre Luis Tezza, en Surco" },
    { href: "/sedes/consultorio-privado", anchor: "Consultorio privado, en Surco" },
    { href: "/sedes/sanna-la-molina", anchor: "Clínica Sanna, en La Molina" },
    { href: "/agendar", anchor: "Agendar cita" },
    { href: "/servicios", anchor: "Qué condiciones se tratan en cada especialidad" },
  ],
  sections: [
    {
      id: "que-es",
      level: 2,
      heading: "Qué es la estenosis espinal",
      paragraphs: [
        "El canal espinal es el túnel que recorre la columna por dentro. Por ahí viajan la médula y las raíces nerviosas que salen hacia los brazos y las piernas. La estenosis espinal es el estrechamiento de ese túnel: el espacio disponible se reduce y las estructuras que pasan por ahí quedan bajo presión.",
        "Casi nunca hay una sola causa. Con los años el disco pierde altura, las articulaciones pequeñas de la parte de atrás de la vértebra se engrosan para repartir la carga que el disco ya no reparte, y el ligamento que tapiza el canal por dentro se vuelve más grueso. Cada cambio le resta unos milímetros al espacio. Es la suma la que termina apretando.",
        "La zona lumbar es la que más se afecta, porque es la que soporta el peso del cuerpo. También ocurre en el cuello, y ahí el cuadro es distinto: lo que queda comprimido es la médula espinal y no solo las raíces, así que las señales cambian por completo.",
        "Conviene separar dos cosas que se confunden todo el tiempo. Una es el hallazgo de la imagen, el canal que se ve estrecho. Otra es lo que te pasa cuando caminas. Hay canales estrechos que no dan un solo síntoma, y esa distinción manda sobre las decisiones que vienen después.",
      ],
    },
    {
      id: "que-es--que-tan-peligrosa-es-la-estenosis",
      level: 3,
      heading: "¿Qué tan peligrosa es la estenosis?",
      paragraphs: [
        "La estenosis lumbar no pone en riesgo la vida. Lo que pone en riesgo es la autonomía, y lo hace despacio, que es justamente lo que la vuelve fácil de postergar.",
        "Peligroso en el sentido estricto hay poco, pero existe: la pérdida de fuerza que avanza en una pierna, el adormecimiento en la zona de la entrepierna y los genitales, y la dificultad para controlar la orina o la deposición. Ese conjunto apunta a una compresión seria del canal y se evalúa el mismo día.",
        "Fuera de eso, el daño se mide en cuadras. Cada tramo que dejas de caminar cuesta más recuperarlo que el anterior, y una marcha insegura agrega riesgo de caídas.",
      ],
    },
    {
      id: "que-es--estenosis-de-canal",
      level: 3,
      heading: "Estenosis de canal",
      paragraphs: [
        "Estenosis de canal y canal estrecho son los nombres con los que la gente llega a la consulta. Describen lo mismo que estenosis espinal: el conducto por donde pasan los nervios tiene menos espacio del que debería.",
        "Puede ser central, cuando lo que se cierra es el conducto principal, o lateral, cuando lo que se estrecha es la salida de una raíz hacia la pierna. Esa ubicación explica por qué a una persona le pesan las dos piernas al caminar y a otra le duele solo una, siempre por el mismo recorrido.",
      ],
    },
    {
      id: "sintomas",
      level: 2,
      heading: "Qué síntomas produce el canal estrecho",
      paragraphs: [
        "El síntoma que mejor define este cuadro no es el dolor de espalda. Es lo que pasa al caminar y lo que pasa al detenerse.",
        "Después de un tramo que cada persona conoce de memoria aparecen pesadez, calambre, ardor u hormigueo en una pierna o en las dos, y la marcha se vuelve insegura. Si te sientas o te inclinas hacia adelante, la molestia cede en pocos minutos y puedes retomar el camino. Ese ciclo, repetido siempre igual, es el dato que más orienta.",
        "El alivio al inclinarse tiene explicación mecánica y se comprueba en la rutina de cualquiera: al inclinarte, el canal gana algo de espacio; al enderezarte, lo pierde. Por eso empujar un carrito de supermercado se tolera mejor que caminar erguido la misma distancia, pedalear resulta más llevadero que caminar, y bajar una pendiente cuesta más que subirla.",
        "Con el tiempo lo que cambia no es la intensidad sino la distancia. Empiezas a medir las salidas por cuadras, evitas los trámites que implican cola y calculas de antemano dónde te vas a poder sentar. Ese recorte pasa desapercibido porque se acomoda solo: uno se adapta sin registrar que se adaptó. Es común atribuirlo a la edad o al peso, y entonces la consulta se posterga un año más, y otro después de ese.",
        "Cuando el estrechamiento está en el cuello el patrón es otro: torpeza de las manos para abotonar o escribir, sensación de inestabilidad al caminar y cambios en el equilibrio. Eso se evalúa sin postergar, porque ahí hay médula de por medio.",
      ],
    },
    {
      id: "sintomas--que-tan-grave-es-una-estenosis-lumbar",
      level: 3,
      heading: "¿Qué tan grave es una estenosis lumbar?",
      paragraphs: [
        "La gravedad no se lee en el informe de la resonancia. Se mide en cuánto se te achicó el radio de movimiento y en si hay compromiso neurológico.",
        "Una estenosis lumbar que te deja caminar diez cuadras y molesta al final del día no se maneja igual que una que te obliga a parar a media cuadra y a planear la salida en función de dónde hay bancas. El grado de estrechamiento que describe el radiólogo ayuda, pero no decide solo.",
        "Lo que sí cambia el escenario es la debilidad que progresa, el adormecimiento en la zona de la entrepierna y los problemas para controlar esfínteres. Ahí la conversación deja de ser cuánto aguanto y pasa a ser cuándo se libera el nervio.",
      ],
    },
    {
      id: "causas",
      level: 2,
      heading: "Por qué se estrecha el canal",
      paragraphs: [
        "La forma más común es la degenerativa y aparece con el desgaste natural de la columna, por lo general a partir de los sesenta años. Se observa con más frecuencia en mujeres.",
        "Sobre ese terreno se suman los cambios que le restan espacio al canal: el disco que pierde altura y se abomba, la articulación posterior que se engrosa, el ligamento que tapiza el conducto y se vuelve más grueso, y a veces una vértebra que se desliza sobre la de abajo y corre el canal de lugar.",
        "Hay dos escenarios menos frecuentes que vale la pena nombrar. Personas que nacen con un canal más angosto de lo habitual y dan síntomas antes, con mucho menos desgaste encima. Y columnas ya operadas o con secuela de fractura, donde la anatomía cambió y el espacio disponible se calcula distinto.",
        "Por eso este cuadro se instala despacio y no de un día para otro. Nadie amanece con estenosis: amanece notando que el mismo trayecto de siempre cuesta más que hace un año.",
      ],
    },
    {
      id: "diagnostico",
      level: 2,
      heading: "Cómo se mide el estrechamiento",
      paragraphs: [
        "El diagnóstico se arma primero con lo que cuentas, y este cuadro se perfila casi solo en el relato: a qué distancia aparece la molestia, qué la alivia, cuánto demoras en recuperarte al sentarte y desde cuándo se viene acortando ese trayecto.",
        "Después va el examen físico, que revisa fuerza por grupos musculares, reflejos, sensibilidad por territorios y también los pulsos de las piernas. Ese último punto importa porque hay un cuadro de origen circulatorio que se le parece mucho: ahí la pierna también molesta al caminar, pero cede con solo detenerse, sin necesidad de sentarse ni de inclinarse hacia adelante.",
        "Recién entonces entran las imágenes. La resonancia magnética muestra el contenido del canal, el grosor del ligamento y en qué niveles hay presión sobre la médula espinal o sobre las raíces. La radiografía de pie aporta otra cosa: alineación, altura de los discos y, en tomas hechas en movimiento, si existe un deslizamiento que se hace mayor al inclinarte. La tomografía queda para el detalle óseo o para quien no puede entrar a una resonancia.",
        "Y queda la advertencia que conviene tener antes de leer cualquier informe. Hay canales estrechos en las resonancias de personas que caminan sin ningún problema. Lo que define la conducta es que la imagen coincida con lo que muestran tus síntomas y tu examen.",
      ],
    },
    {
      id: "sin-operar",
      level: 2,
      heading: "Qué opciones hay antes del quirófano",
      paragraphs: [
        "La estenosis es un problema de espacio, y el espacio no se recupera con medicación. Eso no convierte la cirugía en el primer paso: buena parte de los casos mejora lo suficiente con un manejo conservador bien llevado.",
        "El objetivo de esta etapa cabe en una frase: recuperar tolerancia a la marcha. La terapia física trabaja movilidad de la cadera, fuerza de la musculatura profunda del tronco y control de la postura lumbar, con ejercicios que suelen tolerarse mejor en ligera flexión.",
        "El acondicionamiento aeróbico se cuida aparte, porque la trampa de este cuadro es previsible: caminas menos, pierdes estado físico y toleras todavía menos. La bicicleta estática, la caminata en agua y los tramos cortos con pausas programadas mantienen el fondo sin disparar el síntoma. Bajar peso corporal, cuando corresponde, descarga el segmento y suele notarse.",
      ],
    },
    {
      id: "sin-operar--como-se-cura-la-estenosis-espinal",
      level: 3,
      heading: "¿Cómo se cura la estenosis espinal?",
      paragraphs: [
        "Curar, en el sentido de devolverle al canal el espacio que tenía antes, no ocurre con tratamiento conservador. El estrechamiento es un cambio de estructura y la terapia no cambia estructuras.",
        "Lo que sí mejora, y bastante, es el síntoma. Con terapia dirigida, acondicionamiento y control del peso, mucha gente recupera distancia de marcha y hace su vida sin pasar por el quirófano.",
        "Así que la pregunta útil no es si la estenosis se cura. Es cuánto puedes caminar hoy y cuánto podías hace un año. Esa respuesta es la que ordena el tratamiento.",
      ],
    },
    {
      id: "sin-operar--tratamientos-de-la-estenosis-espinal",
      level: 3,
      heading: "Tratamientos de la estenosis espinal",
      paragraphs: [
        "El menú es corto y tiene un orden. Primero la terapia física dirigida y el acondicionamiento, sostenidos durante semanas y no durante una tarde.",
        "Después, si el dolor por compromiso de la raíz no cede, entran las infiltraciones guiadas por imagen, que dejan medicación antiinflamatoria cerca de la zona comprimida. No ensanchan el canal. Bajan el dolor lo suficiente para que la terapia avance, y eso ya justifica el paso.",
        "Al final la descompresión quirúrgica, que es la única que devuelve espacio de verdad. Se plantea cuando lo anterior se hizo bien y la limitación sigue mandando en tu día.",
      ],
    },
    {
      id: "sin-operar--estenosis-espinal-cuidado-personal",
      level: 3,
      heading: "Estenosis espinal cuidado personal",
      paragraphs: [
        "Hay decisiones chicas que cambian el día con un canal estrecho. Caminar con pausas programadas antes de que aparezca la molestia rinde más que caminar hasta el límite y sentarte rendido.",
        "Apoyarte en un carrito o en un bastón, elegir rutas planas y con dónde sentarse, repartir los mandados en dos salidas en vez de una, y usar la bicicleta o el agua para mantener el fondo son medidas que no cuestan nada y que se notan en la distancia.",
        "Anota lo que caminas cada cierto tiempo. No de memoria: en el teléfono, con la fecha. Es el dato que más pesa en el control siguiente y el que peor se recuerda.",
      ],
    },
    {
      id: "sin-operar--medicamentos-para-la-estenosis-espinal",
      level: 3,
      heading: "Medicamentos para la estenosis espinal",
      paragraphs: [
        "Los analgésicos y los antiinflamatorios acompañan, no resuelven. Sirven para bajar el dolor lo suficiente para que puedas moverte y hacer la terapia, y funcionan mejor con un plazo definido y un objetivo claro.",
        "Acá no van nombres ni dosis, y no es por reserva. La elección depende de tus antecedentes, de tu estómago, de tus riñones y de lo que ya estés tomando. Eso lo indica tu médico después de mirar tu historia.",
        "Si llevas semanas automedicándote y la distancia que caminas sigue bajando, ese dato solo ya es motivo de consulta.",
      ],
    },
    {
      id: "sin-operar--estenosis-espinal-antiinflamatorio-no-esteroideo",
      level: 3,
      heading: "Estenosis espinal antiinflamatorio no esteroideo",
      paragraphs: [
        "El antiinflamatorio no esteroideo es el grupo con el que suele arrancar el manejo del dolor, y también el que más se usa por cuenta propia sin pensarlo dos veces.",
        "Tiene dos límites que conviene conocer. El primero es que no cambia el espacio del canal, así que su efecto dura lo que dura la dosis. El segundo es que no es inocuo: el estómago, el riñón y la presión arterial entran en la cuenta, sobre todo en quien ya toma otras cosas.",
        "Por eso el uso prolongado y sin control se conversa con tu médico. Un frasco que te resolvió una semana no es un plan de tratamiento.",
      ],
    },
    {
      id: "sin-operar--estenosis-espinal-tiene-cura",
      level: 3,
      heading: "Estenosis espinal tiene cura",
      paragraphs: [
        "No en el sentido literal. El canal no vuelve a su medida original ni con terapia ni con medicación, y la cirugía tampoco rejuvenece la columna: le devuelve espacio al nervio en los niveles donde estaba comprimido.",
        "Lo que sí puede volver, que es lo que la gente quiere de vuelta, es la distancia. Caminar hasta el mercado, hacer una cola, salir sin calcular el recorrido.",
        "Si alguien te ofrece curar una estenosis con un aparato, una maniobra o una sesión, lo que está ofreciendo no existe.",
      ],
    },
    {
      id: "cirugia",
      level: 2,
      heading: "Cuándo la cirugía es la opción",
      paragraphs: [
        "La cirugía entra en la conversación en tres escenarios: cuando la distancia que puedes caminar quedó tan corta que te condiciona la vida diaria pese a un manejo conservador bien hecho y sostenido, cuando hay pérdida de fuerza que progresa, y cuando aparecen los signos de compresión seria del canal.",
        "El procedimiento apunta a devolverle espacio al nervio. Se retira el hueso engrosado y el ligamento que están cerrando el conducto, y se libera la raíz en los niveles que corresponda. Cuando además una vértebra se desliza sobre otra o el segmento queda inestable, la descompresión se acompaña de una artrodesis, que fija ese tramo para que no se desplace.",
        "Según el caso el abordaje puede ser mínimamente invasivo, con incisiones pequeñas y menos daño muscular, o convencional cuando el compromiso abarca varios niveles o hay que corregir la alineación. La técnica sale del diagnóstico y de tus estudios, y se conversa contigo antes de decidir.",
        "Una imagen con el canal estrecho, en alguien que camina bien, no es por sí sola una indicación quirúrgica. Y si te dijeron que hay que operar y tienes dudas, pedir una segunda opinión con los estudios en la mano es razonable. Nadie debería tomárselo a mal.",
      ],
    },
    {
      id: "preguntas-frecuentes",
      level: 2,
      heading: "Dudas frecuentes sobre la estenosis",
      paragraphs: [
        "Las que más se repiten en consulta, con la respuesta corta. Ninguna reemplaza una evaluación: sirven para que llegues con las preguntas mejor hechas.",
      ],
    },
    {
      id: "preguntas-frecuentes--como-se-corrige-la-estenosis",
      level: 3,
      heading: "¿Cómo se corrige la estenosis?",
      paragraphs: [
        "Corregir acá significa liberar, no enderezar. Se retira lo que está cerrando el canal para que el nervio deje de estar apretado, y el resultado se mide en cuánto vuelves a caminar.",
        "Cuando la estenosis viene junto con una deformidad o con un deslizamiento, la corrección incluye alinear y estabilizar el tramo, y eso ya es otra cirugía en tamaño y en recuperación. La diferencia se explica antes, con tus imágenes sobre la mesa.",
      ],
    },
    {
      id: "cuando-consultar",
      level: 2,
      heading: "Cuándo consultar por un canal estrecho",
      paragraphs: [
        "La señal no es el dolor lumbar que va y viene. Es la limitación al caminar que se repite siempre del mismo modo y que se acorta mes a mes. Si el trayecto que antes hacías sin pensarlo ahora te obliga a parar, ya hay material suficiente para estudiar el caso.",
        "Hay tres situaciones que no admiten esperar turno: pérdida de fuerza que avanza en una pierna, adormecimiento en la zona de la entrepierna y los genitales, y dificultad para controlar la orina o la deposición. Eso se evalúa el mismo día, no en la próxima cita disponible.",
        "También vale consultar si el cuadro te cambió la vida cotidiana aunque el dolor te resulte tolerable. Dejar de salir o depender de que alguien te acompañe pesa tanto como el dolor a la hora de decidir un tratamiento.",
        "La consulta se atiende en el consultorio de Surco, en la Clínica Ricardo Palma, en la Clínica Sanna La Molina y en la Clínica Padre Luis Tezza. Si ya tienes estudios, llévalos, y anota antes cuántas cuadras caminas hoy y cuántas caminabas hace un año. Esas dos cifras valen más que cualquier resumen hecho de memoria en el consultorio.",
      ],
    },
    {
      id: "fuentes",
      level: 2,
      heading: "De dónde sale esto",
      paragraphs: [
        "Estas son las fuentes detrás de lo que se explica acá. Cada una respalda una afirmación puntual de esta página.",
      ],
      citations: [
        {
          source:
            "StatPearls, capítulo Lumbar Spinal Stenosis (NCBI Bookshelf)",
          supports:
            "Respalda que buena parte de los casos mejora con manejo conservador y que la cirugía descompresiva se acompaña de artrodesis cuando el segmento queda inestable o una vértebra se desliza sobre otra.",
          href: "https://www.ncbi.nlm.nih.gov/books/NBK531493/",
        },
        {
          source:
            "North American Spine Society, Know Your Back: Lumbar Spinal Stenosis",
          supports:
            "Respalda que el síntoma que define el cuadro es la pérdida de tolerancia a la marcha y que las molestias suelen ceder al inclinarse hacia adelante, que es lo que orienta la terapia en ligera flexión.",
          href: "https://www.spine.org/KnowYourBack/Conditions/Degenerative-Conditions/Lumbar-Spinal-Stenosis",
        },
      ],
    },
  ],
};
