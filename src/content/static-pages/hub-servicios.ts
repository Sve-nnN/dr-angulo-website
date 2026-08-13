/**
 * Cuerpo de texto del hub del silo. Cinco secciones del esqueleto de página de
 * servicio con las once subsecciones que responden las preguntas y las
 * búsquedas relacionadas de la SERP de `cirujano de columna lima`.
 *
 * El texto se transcribe literal del paquete on-page de v1.2
 * (`seo-tools/data/copy-servicios.json`), aprobado por el doctor el
 * 2026-08-13. Los `id` salen del campo `clave` del dataset y son anclas
 * compartibles: un cambio de redacción no puede romperlas.
 *
 * Este cuerpo se suma a la página, no la reemplaza. Las cuatro anclas de v1.0
 * del catálogo heredado (`columna`, `traumatologia`, `ortopedia-infantil`,
 * `procedimientos`) siguen vivas porque el inicio enlaza a ellas.
 */

import type { StaticPage } from "./types";

export const hubServicios: StaticPage = {
  slug: "/servicios",
  format: "pagina-de-servicio",
  sections: [
    {
      id: "que-se-atiende",
      level: 2,
      heading: "Qué se atiende",
      paragraphs: [
        "Esta es la parte de la consulta dedicada a la columna, del cuello al sacro: cervical, dorsal y lumbar.",
        "Las enfermedades que más llegan son la hernia discal, la estenosis o canal estrecho, la escoliosis y las deformidades del adulto, y el dolor lumbar que ya lleva meses sin ceder. Cada una tiene su guía completa en este mismo sitio, con síntomas, diagnóstico y alternativas.",
        "El tratamiento de la columna vertebral casi nunca empieza en el quirófano. Empieza por entender qué estructura está comprometida y qué está haciendo esa columna cuando tú te mueves.",
      ],
    },
    {
      id: "que-se-atiende--como-se-llama-el-cirujano-que-opera-la-columna",
      level: 3,
      heading: "¿Cómo se llama el cirujano que opera la columna?",
      paragraphs: [
        "Se le llama cirujano de columna, y llega ahí por dos caminos distintos: la traumatología con dedicación a columna o la neurocirugía. Las dos formaciones operan columna.",
        "La diferencia práctica no está en el título sino en la trayectoria. Lo que conviene preguntar es cuánta columna opera esa persona hoy y con qué criterio decide cuándo no operar, que es la decisión que más veces se toma.",
      ],
    },
    {
      id: "que-se-atiende--quien-es-el-mejor-neurocirujano-del-peru",
      level: 3,
      heading: "¿Quién es el mejor neurocirujano del Perú?",
      paragraphs: [
        "Esa lista no existe. Cualquier ranking que encuentres está ordenando publicidad, no resultados.",
        "Un neurocirujano se forma para operar el sistema nervioso, y eso incluye el cerebro y la columna. Si tu problema es un disco o un canal estrecho, lo que conviene mirar no es el puesto en una lista sino qué parte de la práctica de esa persona es columna.",
      ],
    },
    {
      id: "que-se-atiende--quien-es-el-mejor-traumatologo-en-lima-peru",
      level: 3,
      heading: "¿Quién es el mejor traumatólogo en Lima, Perú?",
      paragraphs: [
        "La respuesta es la misma que para la pregunta anterior, con otra especialidad de por medio.",
        "Lo verificable antes de la cita: registro vigente, dedicación al problema que tienes y una explicación que puedas repetirle a tu familia cuando llegues a casa. Si sales del consultorio sin poder contar qué te dijeron, algo faltó en esa consulta.",
      ],
    },
    {
      id: "que-se-atiende--traumatologia-especialista-en-columna",
      level: 3,
      heading: "El especialista que dedica su práctica a la columna",
      paragraphs: [
        "Un especialista en columna no lee solo la imagen. Mira qué hace tu columna cuando caminas, cuando te inclinas y cuando llevas peso.",
        "La evaluación incluye fuerza por grupos musculares, reflejos, sensibilidad por territorios y maniobras que ponen a prueba la raíz nerviosa. Con eso en la mano, la resonancia por fin significa algo concreto y deja de ser una lista de hallazgos sueltos.",
      ],
    },
    {
      id: "que-se-atiende--cirujano-de-columna-cerca-de-mi",
      level: 3,
      heading: "Cirujano de columna cerca de mí",
      paragraphs: [
        "Un problema de columna no se resuelve en una cita suelta: hay evaluación, estudios y controles después. Por eso la cercanía pesa de verdad.",
        "La atención está repartida en cuatro sedes de Lima y el consultorio de Surco concentra buena parte de la consulta ambulatoria. Elige por la que te quede sostenible en el tiempo.",
      ],
    },
    {
      id: "que-se-atiende--cirugia-de-la-columna-cerca-de-mi",
      level: 3,
      heading: "Cirugía de la columna cerca de mí",
      paragraphs: [
        "Buscar dónde operarse cerca es entendible, pero el orden conviene al revés: primero se define si hay que operar y qué exactamente, y después dónde se hace.",
        "La programación quirúrgica se coordina en las clínicas donde el doctor tiene actividad, y eso se conversa en consulta con tu seguro sobre la mesa. Nadie debería reservar quirófano antes de tener el diagnóstico cerrado.",
      ],
    },
    {
      id: "que-se-atiende--neurocirujanos-del-hospital-rebagliati",
      level: 3,
      heading: "Si te evaluaron en un hospital público",
      paragraphs: [
        "Muchas evaluaciones de columna en Lima empiezan en el sistema público y siguen con una lista de espera, a veces para la resonancia y a veces para el quirófano.",
        "Si estás en esa situación y quieres una opinión mientras tanto, trae el informe que ya tienes. No hace falta repetir estudios que sigan vigentes, y repetirlos solo te cuesta plata y tiempo.",
      ],
    },
    {
      id: "que-se-atiende--dr-marco-gonzales-portillo",
      level: 3,
      heading: "Cómo comparar antes de elegir",
      paragraphs: [
        "Si estás comparando nombres, hay preguntas que ordenan la decisión mucho mejor que cualquier reseña. Qué parte de la práctica de esa persona es exactamente tu problema. Qué alternativas te ofreció antes de plantear cirugía. Qué pasa si la operación no termina de resolver el dolor.",
        "Ninguna de esas respuestas está en un ranking. Se consiguen preguntando, y a un especialista que trabaja bien no le molesta que se las hagan.",
      ],
    },
    {
      id: "que-se-atiende--dr-paul-carranza",
      level: 3,
      heading: "Qué llevar a la primera cita",
      paragraphs: [
        "Los estudios que tengas, aunque sean viejos, y el informe escrito de cada uno. Las placas y los discos sirven más que la foto del informe en el celular.",
        "Anota antes de venir desde cuándo duele, hasta dónde baja y qué lo empeora. Con eso escrito, la consulta rinde el doble y no se te queda el detalle importante en la puerta.",
      ],
    },
    {
      id: "que-se-atiende--dr-eduardo-laos-plasier",
      level: 3,
      heading: "Segunda opinión sobre una cirugía de columna",
      paragraphs: [
        "Si te indicaron operarte y tienes dudas, pedir otra opinión es sensato y no ofende a nadie que trabaje en serio.",
        "La segunda opinión sirve cuando llega completa: los estudios, el informe y la indicación escrita que te dieron. Sin ese material solo se puede especular, y especular sobre una cirugía de columna no le sirve a nadie.",
      ],
    },
    {
      id: "como-es-la-consulta",
      level: 2,
      heading: "Cómo es la consulta",
      paragraphs: [
        "Empieza por tu relato, que en columna orienta muchísimo: desde cuándo, hasta dónde baja el dolor, qué gesto lo dispara y hacia dónde viene yendo en las últimas semanas.",
        "Sigue el examen físico y recién después la imagen. La resonancia se interpreta contra lo que muestran tus síntomas, nunca sola, porque buena parte de las resonancias de gente sin dolor también muestra discos alterados.",
        "De ahí sale el plan. Qué se hace primero, qué se espera de eso, en cuánto tiempo se vuelve a evaluar y en qué escenario se plantearía operar. Todo eso se conversa antes de que te vayas.",
      ],
    },
    {
      id: "condiciones",
      level: 2,
      heading: "Qué condiciones se tratan",
      paragraphs: [
        "Hernia discal, estenosis espinal o canal estrecho, escoliosis y deformidades de la columna del adulto, lumbalgia y cervicalgia persistentes, y las secuelas de fracturas vertebrales.",
        "Cada una de esas condiciones tiene su guía propia en el sitio, escrita para que llegues a la cita sabiendo de qué se está hablando. Este hub las nombra y reparte; el detalle vive en cada guía.",
        "La consulta también cubre ortopedia infantil, que tiene su página aparte, y la cirugía de columna por vía mínimamente invasiva, con la endoscopía espinal explicada en su propia sección del sitio.",
      ],
    },
    {
      id: "donde-se-atiende",
      level: 2,
      heading: "Dónde se atiende",
      paragraphs: [
        "La consulta de columna funciona en el consultorio de Surco, en la Clínica Ricardo Palma, en la Clínica Sanna La Molina y en la Clínica Padre Luis Tezza.",
        "Cada sede tiene su página con dirección, horario y cómo llegar. La actividad quirúrgica se coordina en clínica, y qué sede te conviene depende sobre todo de tu seguro.",
      ],
    },
    {
      id: "como-agendar",
      level: 2,
      heading: "Cómo agendar una cita",
      paragraphs: [
        "La cita se pide desde el formulario del sitio o escribiendo tu caso, si prefieres contar el cuadro antes de reservar. Las clínicas gestionan sus propias agendas y el consultorio de Surco se coordina directo.",
        "Si el motivo es una segunda opinión quirúrgica, avísalo al agendar: esa cita necesita más tiempo y conviene reservarla sabiéndolo.",
      ],
    },
    {
      id: "como-agendar--cuanto-cuesta-una-cirugia-de-columna-en-peru",
      level: 3,
      heading: "¿Cuánto cuesta una cirugía de columna en Perú?",
      paragraphs: [
        "No hay cifra única, y desconfía de quien te la dé por teléfono sin haberte visto. El costo depende del procedimiento, de la clínica, de cuántos días de hospitalización necesites y del material que se use.",
        "Lo que sí se puede hacer es entregarte el presupuesto por escrito una vez definido qué se va a hacer, y revisar con tu seguro qué parte cubre. Eso ocurre antes de programar nada, nunca después.",
      ],
    },
  ],
  outboundLinks: [
    { href: "/servicios/escoliosis-y-deformidades", anchor: "escoliosis y deformidades de columna" },
    { href: "/servicios/ortopedia-infantil", anchor: "ortopedia infantil lima" },
    { href: "/servicios/cirugia-minimamente-invasiva", anchor: "endoscopía espinal" },
    { href: "/servicios/estenosis-espinal", anchor: "estenosis de canal" },
    { href: "/servicios/hernia-discal", anchor: "ciatica o hernia discal" },
    { href: "/sedes", anchor: "Sedes donde atiende el Dr. Juan Carlos Angulo en Lima" },
    { href: "/blog", anchor: "Blog" },
    { href: "/agendar", anchor: "Agendar cita" },
  ],
};

/** `h1` del hub, del mismo dataset. El `title` y la meta son de la fase 10. */
export const hubServiciosH1 = "Cirujano de columna en Lima";
