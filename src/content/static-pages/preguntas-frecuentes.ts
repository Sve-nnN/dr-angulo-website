/**
 * Cuerpo de texto de /preguntas-frecuentes: las once secciones que sí son
 * preguntas de paciente antes de una consulta.
 *
 * El paquete on-page de v1.2 escribió esta URL con el esqueleto de guía clínica
 * y la duda de reumatólogo o traumatólogo como eje, que es otra intención de
 * búsqueda. La fase 16 de v1.3 mudó esas ocho secciones a
 * /blog/reumatologo-o-traumatologo y esta página se quedó con lo suyo.
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
  format: "pagina-de-servicio",
  h1: "Dudas frecuentes antes de la consulta",
  publishedAt: "2026-08-13",
  updatedAt: "2026-08-24",
  ctaBanner: {
    heading: "¿Todavía no sabes a quién te toca consultar?",
    body: "Cuenta tu caso y en la primera cita se te dice si corresponde a esta consulta o a otra especialidad.",
  },
  bannerAfterSectionId:
    "preguntas-frecuentes--cuando-ir-al-traumatologo-o-al-reumatologo",
  outboundLinks: [
    { href: "/blog/artrosis", anchor: "Cómo se maneja la artrosis" },
    { href: "/servicios", anchor: "Qué condiciones se tratan en cada especialidad" },
    { href: "/blog", anchor: "Blog" },
    { href: "/agendar", anchor: "Agendar cita" },
  ],
  sections: [
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
