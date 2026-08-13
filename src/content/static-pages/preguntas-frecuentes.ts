/**
 * Cuerpo de texto de /preguntas-frecuentes. Las diecinueve secciones del
 * esqueleto de guía clínica que el paquete on-page de v1.2 redactó para esta
 * URL, con la duda de reumatólogo o traumatólogo como eje.
 *
 * El texto se transcribe literal del paquete (`paquetes/preguntas-frecuentes.md`),
 * aprobado por el doctor el 2026-08-13. Los `id` salen del campo `clave` del
 * dataset y son anclas compartibles: una reescritura de la redacción no puede
 * romperlas. Las cuatro subsecciones de `preguntas-frecuentes` son las que
 * alimentan el marcado FAQPage de la ruta.
 */

import type { StaticPage } from "./types";

export const preguntasFrecuentesPage: StaticPage = {
  slug: "/preguntas-frecuentes",
  format: "guia-clinica",
  h1: "Dudas frecuentes antes de la consulta",
  publishedAt: "2026-08-13",
  updatedAt: "2026-08-13",
  ctaBanner: {
    heading: "¿Todavía no sabes a quién te toca consultar?",
    body: "Cuenta tu caso y en la primera cita se te dice si corresponde a esta consulta o a otra especialidad.",
  },
  bannerAfterSectionId: "sintomas",
  sections: [
    {
      id: "que-es",
      level: 2,
      heading: "Qué es el reumatólogo o traumatólogo",
      paragraphs: [
        "Los dos se ocupan del aparato locomotor, que es el conjunto de huesos, articulaciones, músculos, tendones y ligamentos. La diferencia entre reumatólogo y traumatólogo está en el tipo de problema y en las herramientas de cada uno.",
        "El reumatólogo es el médico que trata desde el lado clínico las enfermedades que inflaman o degeneran las articulaciones y el tejido conectivo, muchas de ellas de origen autoinmune. No opera: su trabajo es diagnosticar, tratar y ajustar el tratamiento en el tiempo.",
        "El traumatólogo es el cirujano del aparato locomotor. Se ocupa de la lesión, la fractura, el desgaste mecánico y la deformidad, y puede resolverlas sin operar o en quirófano según el caso. Dentro de la traumatología hay subespecialidades, y la columna es una de ellas.",
        "La consulta del Dr. Angulo es de traumatología con subespecialidad en cirugía de columna, más ortopedia infantil. Si lo tuyo resulta ser una enfermedad inflamatoria sistémica, lo que corresponde es derivarte y no estirar la consulta.",
      ],
    },
    {
      id: "que-es--diferencia-entre-artrosis-traumatologo-y-reumatologo",
      level: 3,
      heading: "Diferencia entre artrosis traumatologo y reumatologo",
      paragraphs: [
        "La artrosis es el caso donde más se cruzan los dos, y por eso es la duda que más llega. Es un desgaste del cartílago, así que la ven los dos, y cuál te conviene depende de en qué etapa estás.",
        "El reumatólogo es el especialista al que corresponde acudir cuando hay que ordenar el diagnóstico entre varias causas posibles de dolor articular, cuando se sospecha una artritis inflamatoria detrás, o cuando el manejo médico necesita seguimiento fino.",
        "El traumatólogo entra cuando el problema es mecánico y se resuelve con eso: infiltraciones, rehabilitación dirigida o, si el desgaste avanzó y la articulación ya no responde, cirugía. En una artrosis de columna con dolor irradiado a la pierna, el detalle de qué se hace está en las guías de hernia discal y de estenosis espinal.",
      ],
    },
    {
      id: "que-es--traumatologo-y-reumatologo-es-lo-mismo",
      level: 3,
      heading: "Traumatólogo y reumatólogo es lo mismo",
      paragraphs: [
        "No, aunque se solapen. Una regla práctica que funciona casi siempre: si el problema empezó con un golpe, un esfuerzo o un movimiento concreto, y duele al usar esa parte del cuerpo, empieza por el traumatólogo.",
        "Si en cambio hay varias articulaciones tomadas a la vez, rigidez al despertar que dura un buen rato, hinchazón que va y viene sola, o fiebre y cansancio junto con el dolor, empieza por el reumatólogo. Ahí lo que se busca es una enfermedad de fondo y no una lesión.",
        "Equivocarte de puerta no es grave. Se pierde una cita, y quien te atiende te va a decir a dónde corresponde ir.",
      ],
    },
    {
      id: "sintomas",
      level: 2,
      heading: "Qué síntomas produce",
      paragraphs: [
        "Las consultas de columna llegan casi siempre por una de estas cuatro puertas: dolor de espalda que no cede, dolor que baja por una pierna o por un brazo, pérdida de fuerza o adormecimiento, y una deformidad que se nota de afuera.",
        "Lo que más orienta no es la intensidad sino el recorrido. Un dolor que se queda en la espalda y mejora en días suele ser muscular. Uno que viaja siempre por el mismo camino hacia la pierna apunta a una raíz nerviosa. Uno que aparece al caminar y se va al sentarte apunta a un canal estrecho.",
        "El desarrollo de cada uno de esos cuadros vive en su guía. Acá la pregunta es otra: qué hacer con eso, a dónde ir y qué esperar de la cita.",
      ],
    },
    {
      id: "causas",
      level: 2,
      heading: "Por qué aparece",
      paragraphs: [
        "Una parte de lo que llega a consulta es desgaste, o sea el paso de los años sobre discos y articulaciones. Otra parte es carga mal repartida, que es postura sostenida, peso levantado a lo bruto y musculatura que dejó de sostener. Y otra parte es genética y forma de la columna, que no se elige.",
        "Vale la pena separar lo que se puede cambiar de lo que no. Sobre la genética no hay nada que hacer. Sobre cómo cargas la espalda todos los días y cuánta musculatura tienes alrededor, bastante.",
        "También hay causas que no son mecánicas y por eso se estudian aparte: enfermedades inflamatorias, infecciones y problemas del metabolismo del hueso. Cuando el cuadro no encaja con el desgaste, se busca ahí.",
      ],
    },
    {
      id: "diagnostico",
      level: 2,
      heading: "Cómo se confirma el diagnóstico",
      paragraphs: [
        "La primera cita es sobre todo conversación y examen. Se revisa desde cuándo te pasa, hasta dónde llega, qué lo empeora, qué lo alivia y cómo viene evolucionando, y después vienen fuerza, reflejos, sensibilidad y algunas maniobras.",
        "Los estudios se piden para responder preguntas concretas, no por rutina. Una radiografía muestra hueso y alineación. Una resonancia muestra disco, raíz y contenido del canal. Pedir la imagen antes de examinar suele generar más ansiedad que respuestas, porque un informe siempre encuentra algo.",
        "Si ya tienes estudios, llévalos completos y no solo el informe: las imágenes se miran, el papel se lee. Y llévalos aunque tengan años, porque comparar es lo que muestra si algo cambió.",
        "Qué llevar, en concreto: los estudios que tengas, la lista de medicamentos que tomas, qué tratamientos ya hiciste y por cuánto tiempo, y una nota de cómo viene el dolor semana a semana. Con eso la consulta rinde bastante más.",
      ],
    },
    {
      id: "sin-operar",
      level: 2,
      heading: "Qué se puede hacer sin operar",
      paragraphs: [
        "La mayoría de los problemas de columna se maneja sin quirófano. El esquema se repite: controlar el dolor con lo que te indique tu médico, mantener el movimiento que toleres, terapia física dirigida y corregir la mecánica que llevó al problema.",
        "Ese manejo necesita tiempo para mostrar si sirve. Semanas, no días. Abandonarlo en la primera semana y concluir que no funcionó es el error más común, y el que más gente lleva a pedir una cirugía que quizá no necesita.",
        "Cuando el dolor por compromiso de una raíz no cede, hay un escalón intermedio antes del quirófano: las infiltraciones guiadas por imagen. No arreglan la causa. Bajan el dolor lo suficiente para que la terapia pueda avanzar.",
      ],
    },
    {
      id: "cirugia",
      level: 2,
      heading: "Cuándo hace falta operar",
      paragraphs: [
        "Operar se plantea en tres situaciones, y ninguna de las tres es que la resonancia se vea fea. Cuando hay pérdida de fuerza que progresa. Cuando aparecen signos de compresión seria del canal. Y cuando el dolor incapacitante sigue igual pese a un manejo conservador bien hecho y sostenido.",
        "La decisión se toma con dos cosas sobre la mesa: qué te está limitando hoy y qué muestran tus estudios. Si las dos no coinciden, la cirugía no es el camino todavía.",
        "Sobre el miedo a operarse, que es la duda que más se repite y la más razonable: lo que corresponde es que en la consulta se explique el procedimiento concreto de tu caso, los riesgos reales y qué esperar de la recuperación. Una decisión informada se puede tomar con miedo. Sin información, no.",
        "Y si te dijeron que hay que operar y no estás seguro, una segunda opinión con los estudios en la mano es una decisión razonable. Nadie debería tomárselo a mal.",
      ],
    },
    {
      id: "preguntas-frecuentes",
      level: 2,
      heading: "Preguntas frecuentes",
      paragraphs: [
        "Las que más se repiten antes de agendar, con la respuesta corta.",
      ],
    },
    {
      id: "preguntas-frecuentes--que-diferencia-hay-entre-un-traumatologo-y-un-reumatologo",
      level: 3,
      heading: "¿Qué diferencia hay entre un traumatólogo y un reumatólogo?",
      paragraphs: [
        "Uno opera y el otro no, y esa es la diferencia más útil de todas. El traumatólogo resuelve lesión, fractura, desgaste mecánico y deformidad, con cirugía cuando hace falta. El reumatólogo maneja las enfermedades que inflaman las articulaciones y el tejido conectivo, con tratamiento médico y seguimiento.",
        "Se derivan casos entre ellos todo el tiempo, y en varias condiciones trabajan sobre la misma persona.",
      ],
    },
    {
      id: "preguntas-frecuentes--cuando-ir-al-traumatologo-o-al-reumatologo",
      level: 3,
      heading: "¿Cuándo ir al traumatólogo o al reumatólogo?",
      paragraphs: [
        "Al traumatólogo, cuando el dolor tiene un origen mecánico reconocible: apareció con un golpe o un esfuerzo, se concentra en una zona, empeora al usarla y mejora al descansarla. También cuando hay una deformidad visible o una limitación de movimiento que se instaló.",
        "Al reumatólogo, cuando el patrón es inflamatorio: varias articulaciones a la vez, rigidez matinal prolongada, hinchazón, o síntomas generales como fiebre y cansancio acompañando al dolor.",
        "En el cruce, que existe, empieza por el que te quede más accesible. La derivación es parte del trabajo.",
      ],
    },
    {
      id: "preguntas-frecuentes--que-enfermedades-trata-un-reumatologo",
      level: 3,
      heading: "¿Qué enfermedades trata un reumatólogo?",
      paragraphs: [
        "Artritis reumatoide, lupus, espondilitis, gota, artrosis desde el manejo médico, osteoporosis y otras condiciones del tejido conectivo. En general, lo que inflama o degenera articulaciones sin que haya un traumatismo detrás.",
        "Es también quien ordena el diagnóstico cuando el dolor articular no tiene una explicación mecánica clara y hay que descartar varias causas.",
      ],
    },
    {
      id: "preguntas-frecuentes--que-enfermedades-ve-el-traumatologo",
      level: 3,
      heading: "¿Qué enfermedades ve el traumatólogo?",
      paragraphs: [
        "Fracturas, lesiones de ligamentos y tendones, desgaste articular avanzado, deformidades y todo lo que compromete la columna: hernia discal, canal estrecho, escoliosis y las secuelas de una lesión.",
        "En esta consulta, además, ortopedia infantil: displasia de cadera, alteraciones de la marcha y curvas de columna en niños y adolescentes.",
      ],
    },
    {
      id: "cuando-consultar",
      level: 2,
      heading: "Cuándo consultar",
      paragraphs: [
        "Un dolor de espalda que mejora en pocos días con medidas básicas no necesita una consulta urgente. La señal es otra: dolor que se irradia y no cede después de un par de semanas, dolor que va a más en vez de a menos, o cualquier pérdida de fuerza.",
        "Hay tres situaciones que se evalúan el mismo día: debilidad que avanza rápido en una pierna o en un brazo, adormecimiento en la zona de la entrepierna y los genitales, y dificultad para controlar la orina o la deposición.",
        "La consulta se atiende en el consultorio de Surco, en la Clínica Ricardo Palma, en la Clínica Sanna La Molina y en la Clínica Padre Luis Tezza. En el consultorio la agenda la maneja el propio doctor; en las clínicas la cita se saca con cada institución, porque esas agendas no las controla el médico.",
      ],
    },
    {
      id: "cuando-consultar--como-se-llama-el-medico-especialista-en-huesos-articulacione",
      level: 3,
      heading:
        "Como se llama el médico especialista en huesos articulaciones y músculos",
      paragraphs: [
        "Traumatólogo, también llamado ortopedista o cirujano ortopédico según el país. Es el médico especialista del aparato locomotor: huesos, articulaciones, músculos, tendones y ligamentos.",
        "Cuando el problema es una enfermedad inflamatoria de las articulaciones y no una lesión, el que corresponde es el reumatólogo.",
      ],
    },
    {
      id: "cuando-consultar--reumatologo-especialista-en-artrosis",
      level: 3,
      heading: "Reumatólogo especialista en artrosis",
      paragraphs: [
        "Para una artrosis en etapa de manejo médico, con dolor que se controla y sin indicación quirúrgica, el reumatólogo es una buena puerta de entrada y lleva bien el seguimiento en el tiempo.",
        "Si lo que tienes es artrosis de columna con dolor que baja por la pierna, o si el desgaste ya limita lo que puedes hacer, la evaluación de columna aporta lo que falta. Las dos consultas conviven sin problema.",
      ],
    },
    {
      id: "cuando-consultar--medico-especialista-en-dolores-musculares",
      level: 3,
      heading: "Médico especialista en dolores musculares",
      paragraphs: [
        "Un dolor muscular puro, de esos que aparecen tras un esfuerzo y ceden en días, se maneja en atención general o con medicina física y rehabilitación.",
        "Si el dolor es difuso, se acompaña de cansancio y lleva meses, el que ordena el estudio es el reumatólogo. Y si el músculo duele por una raíz nerviosa comprimida, lo que hay que estudiar es la columna, no el músculo.",
      ],
    },
    {
      id: "cuando-consultar--especialista-en-tendones-y-nervios",
      level: 3,
      heading: "Especialista en tendones y nervios",
      paragraphs: [
        "Los tendones son territorio del traumatólogo. Los nervios se reparten: cuando el problema nace en la columna, por una raíz comprimida, lo ve el traumatólogo de columna; cuando el problema es del nervio periférico o del sistema nervioso, entra el neurólogo.",
        "La pista práctica está en el recorrido. Un dolor que arranca en la espalda o en el cuello y baja siempre por el mismo camino apunta a la columna.",
      ],
    },
    {
      id: "cuando-consultar--cuando-acudir-al-traumatologo",
      level: 3,
      heading: "Cuando acudir al traumatólogo",
      paragraphs: [
        "Después de un golpe o una caída con dolor que no cede, ante una deformidad visible, cuando una articulación deja de moverse como antes, o cuando el dolor de espalda baja por una extremidad y lleva semanas.",
        "También cuando ya te evaluaron, hiciste el tratamiento indicado y sigues igual. Ese dato, el de que el manejo bien hecho no alcanzó, es el que abre la conversación quirúrgica y el que conviene llevar anotado con fechas.",
      ],
    },
  ],
};
