import type { ServicePage } from "./index";

export const escoliosisYDeformidades: ServicePage = {
  slug: "escoliosis-y-deformidades",
  navLabel: "Escoliosis",
  h1: "Escoliosis y deformidades de la columna",
  heroLead: "Una curva de columna casi nunca duele durante el crecimiento, y por eso suele detectarse tarde. Acá encuentras qué mirar en casa, qué logra realmente un corsé y en qué momento se plantea una corrección.",
  title: "Escoliosis y deformidades de columna: diagnóstico y tratamiento",
  description: "Qué es la escoliosis, cómo se detecta durante el crecimiento, qué hace el corsé y cuándo se plantea una corrección quirúrgica. Guía del Dr. Juan Carlos Angulo, cirujano de columna en Lima.",
  cardSummary: "Cómo se detecta una curva a tiempo, qué logra el corsé y cuándo se plantea corregirla.",
  conditionName: "Escoliosis",
  alternateNames: [
    "Deformidad de columna",
    "Cifosis",
  ],
  publishedAt: "2026-08-10",
  updatedAt: "2026-08-13",
  format: "guia-clinica",
  describesSurgery: true,
  relatedPosts: [],
  ctaBanner: {
    heading: "¿Notas un hombro más alto o la cintura despareja?",
    body: "Una evaluación con radiografía de pie define si la curva necesita seguimiento, corsé o corrección.",
  },
  // "que-es" cuelga cinco subsecciones, así que la primera frontera de nivel 2
  // cae en el 38 por ciento del cuerpo, fuera de la ventana de POS-01.
  bannerAfterSectionId: "que-es--escoliosis-dorsal",
  outboundLinks: [
    { href: "/servicios/estenosis-espinal", anchor: "estenosis espinal: tratamientos" },
    { href: "/servicios/hernia-discal", anchor: "hernia discal tomografía" },
    { href: "/sedes/clinica-ricardo-palma", anchor: "clínica ricardo palma traumatología" },
    { href: "/sedes/clinica-tezza", anchor: "neurocirujano clínica tezza" },
    { href: "/sedes/consultorio-privado", anchor: "neurocirujano surco" },
    { href: "/sedes/sanna-la-molina", anchor: "cirugía de columna clínica sanna" },
    { href: "/agendar", anchor: "Agendar cita" },
    { href: "/servicios", anchor: "mejor neurocirujano de columna lima" },
  ],
  sections: [
    {
      id: "que-es",
      level: 2,
      heading: "Qué es la escoliosis",
      paragraphs: [
        "Vista de frente, la columna vertebral debería verse recta. La escoliosis es una desviación lateral de esa línea que además viene con una rotación de las vértebras sobre su propio eje, así que no es solo una curva: es un cambio en tres dimensiones. Se habla de escoliosis cuando la desviación supera los diez grados medidos sobre una radiografía tomada de pie.",
        "Vista de perfil la columna sí tiene curvas normales, una hacia adelante en el cuello y en la zona lumbar, y una hacia atrás en la zona dorsal. Cuando esa curva dorsal se acentúa más de lo esperable se habla de cifosis, y la espalda queda encorvada de una manera que no se corrige del todo al pedirle a la persona que se enderece.",
        "Lo que más conviene entender es que no todas las curvas se comportan igual. Lo que define la conducta no es que exista una curva. Es cuánto mide, dónde está, cuánto crecimiento le queda a la persona y si está progresando.",
      ],
    },
    {
      id: "que-es--escoliosis-y-deformidades-de-columna",
      level: 3,
      heading: "Escoliosis y deformidades de columna",
      paragraphs: [
        "La escoliosis es la deformidad más conocida, pero no es la única ni siempre la que más molesta. Bajo el mismo paraguas entran la cifosis, que es la curva dorsal acentuada; las deformidades mixtas, donde la columna se desvía de frente y de perfil a la vez; y las del adulto por desgaste, cuando el disco y las articulaciones se gastan de forma despareja y el tronco se va inclinando.",
        "Agruparlas tiene sentido porque comparten la forma de evaluarse: radiografía de columna completa de pie, medición del ángulo, revisión del equilibrio del tronco sobre la pelvis y seguimiento comparativo con la misma técnica.",
        "Lo que cambia de una a otra es el pronóstico y el momento en que conviene intervenir. Una cifosis rígida del adolescente no se maneja como una curva degenerativa a los setenta, aunque las dos se vean como una espalda torcida en la foto.",
      ],
    },
    {
      id: "que-es--escoliosis-dorsal",
      level: 3,
      heading: "Escoliosis dorsal",
      paragraphs: [
        "La curva dorsal es la que se ve en la parte alta de la espalda, a la altura de las costillas. Como las vértebras rotan y arrastran a la caja torácica, es la que más se nota de afuera: una escápula que sobresale, un lado del tronco más prominente, la ropa que cae torcida.",
        "También es la que suele progresar más rápido durante el estirón del crecimiento, así que en el adolescente es la que se vigila con controles más seguidos. Cuando la curva es grande se evalúa además cómo afecta la mecánica respiratoria, que es una pregunta que el resto de las curvas casi no plantea.",
      ],
    },
    {
      id: "que-es--escoliosis-lumbar",
      level: 3,
      heading: "Escoliosis lumbar",
      paragraphs: [
        "La curva lumbar se ve menos de afuera y se siente más adentro. En el adulto es la que suele traer dolor de espalda, fatiga al estar de pie un rato y la cintura despareja.",
        "Cuando la desviación estrecha el espacio por donde salen las raíces, aparecen dolor irradiado a la pierna, hormigueo y limitación para caminar. Ese cuadro es uno de los motivos de consulta más frecuentes de la escoliosis del adulto, y es el que más pesa a la hora de decidir un tratamiento, más que el ángulo de la curva.",
      ],
    },
    {
      id: "que-es--escoliosis-leve",
      level: 3,
      heading: "Escoliosis leve",
      paragraphs: [
        "Una curva pequeña y estable no necesita tratamiento. Necesita seguimiento, que es otra cosa y no es lo mismo que dejar pasar.",
        "En la práctica significa medir con el mismo método cada cierto tiempo mientras dura el crecimiento, para detectar a tiempo si la curva está avanzando. Buena parte de las curvas leves nunca requiere nada más, y termina el crecimiento sin haberle cambiado la vida a nadie.",
        "En el adulto una curva leve que no progresa y no duele tampoco se trata. Lo que se trata es el síntoma, si aparece.",
      ],
    },
    {
      id: "que-es--se-puede-corregir-la-escoliosis-en-adultos",
      level: 3,
      heading: "Se puede corregir la escoliosis en adultos",
      paragraphs: [
        "En el adulto el corsé ya no frena nada, porque el esqueleto terminó de madurar. Corregir la curva de forma real pasa por la cirugía, y la cirugía se plantea por lo que la deformidad produce y no por cuánto mide.",
        "Eso deja un espacio grande de manejo sin operar: terapia física, acondicionamiento, control del dolor con lo que indique tu médico y, en casos puntuales, infiltraciones guiadas por imagen. Mucha gente vive bien con su curva de siempre y nunca necesita otra cosa.",
        "La conversación cambia cuando el tronco deja de estar centrado sobre la pelvis y mantenerte erguido pasa a costar un esfuerzo permanente, o cuando la deformidad comprime nervios. Ahí corregir y equilibrar sí tiene un objetivo funcional concreto.",
      ],
    },
    {
      id: "sintomas",
      level: 2,
      heading: "Qué síntomas produce",
      paragraphs: [
        "En el adolescente la escoliosis casi nunca duele. Por eso lo que sigue se observa más de lo que se siente: un hombro más alto que el otro, una escápula que sobresale, la cintura despareja, un lado del tronco más prominente.",
        "Hay una prueba casera que orienta bastante. Pídele que se incline hacia adelante con las rodillas rectas y los brazos colgando, y mira la espalda desde atrás a la altura de los ojos. Si un lado queda más alto que el otro, corresponde una evaluación aunque no haya ninguna molestia.",
        "En el adulto el cuadro cambia y ahí sí hay síntomas: dolor lumbar, fatiga de la espalda al estar de pie, pérdida de estatura, la impresión de estar inclinándote hacia un lado sin poder evitarlo. Si la deformidad afecta el paso de los nervios se suman el dolor que baja por la pierna y la limitación para caminar.",
        "En la cifosis lo que se nota es la espalda encorvada, con molestia dorsal después de estar sentado o de pie por periodos largos. Cuando esa curvatura aparece de golpe en una persona mayor conviene descartar una fractura vertebral por fragilidad del hueso.",
      ],
    },
    {
      id: "causas",
      level: 2,
      heading: "Por qué aparece",
      paragraphs: [
        "La forma más frecuente es la escoliosis idiopática del adolescente, que aparece durante el estirón del crecimiento y no tiene una causa única identificable. Idiopática quiere decir exactamente eso: no sabemos por qué.",
        "Las otras formas sí tienen una explicación. Las congénitas, cuando una vértebra se formó de manera incompleta. Las asociadas a una enfermedad neuromuscular, donde la musculatura no sostiene la columna como debería. Y las del adulto, que pueden ser una curva de la adolescencia que siguió su curso o una deformidad nueva por desgaste.",
        "Conviene sacar del medio dos culpables populares que no lo son: la mochila del colegio y la mala postura frente a la pantalla. Ninguna de las dos produce escoliosis. Pueden producir dolor de espalda, que es otro problema y se maneja distinto.",
      ],
    },
    {
      id: "causas--que-es-la-escoliosis-y-que-lo-causa",
      level: 3,
      heading: "¿Qué es la escoliosis y qué lo causa?",
      paragraphs: [
        "Resumido: es una desviación lateral de la columna con rotación de las vértebras, y en la mayoría de los casos no hay una causa que se pueda señalar.",
        "Que exista un componente familiar está descrito, así que tener un antecedente cercano es razón suficiente para revisar a un hijo durante el estirón sin esperar a que se note algo. Lo que no está descrito es que la produzcan el deporte, la mochila o dormir de un lado.",
      ],
    },
    {
      id: "diagnostico",
      level: 2,
      heading: "Cómo se confirma el diagnóstico",
      paragraphs: [
        "La evaluación empieza en la consulta, con la persona de pie y el tronco visto de frente, de perfil y de espaldas. Se revisa la altura de los hombros y de las caderas, la simetría de la cintura, la alineación de la cabeza sobre la pelvis y el desnivel del tronco al inclinarse hacia adelante. En niños y adolescentes se suma la valoración del desarrollo, porque el crecimiento que queda pesa tanto como la curva actual.",
        "La radiografía de columna completa de pie es el estudio de base y muestra la curva tal como se comporta con el peso del cuerpo encima. Sobre esa imagen se mide el ángulo, se identifican las vértebras que limitan la curva y se estima la madurez ósea, que es lo que permite anticipar cuánto puede progresar.",
        "Las radiografías en inclinación lateral dicen qué tan flexible es la curva, un dato que cambia el plan cuando se evalúa una corrección. La resonancia magnética no es de rutina: se pide ante una curva atípica, ante signos neurológicos o antes de una cirugía, para ver el estado de los discos y del canal.",
        "El seguimiento se hace comparando estudios equivalentes, siempre con la misma técnica. Así la comparación vale y no se repiten radiografías de más.",
      ],
    },
    {
      id: "sin-operar",
      level: 2,
      heading: "Qué se puede hacer sin operar",
      paragraphs: [
        "El tratamiento no se decide por la foto de la radiografía sino por tres cosas juntas: cuánto mide la curva, cuánto crecimiento le queda a la persona y qué le está produciendo hoy.",
        "En curvas pequeñas y estables la conducta es observar con controles programados. El corsé se plantea en curvas moderadas cuando todavía queda crecimiento por delante. Su objetivo no es enderezar la columna sino frenar la progresión mientras el esqueleto termina de madurar, y el resultado depende en buena medida de que se cumplan las horas de uso indicadas. Se retira cuando la maduración ósea está completa.",
        "La terapia física acompaña en todos los escenarios. Trabaja fuerza del tronco, movilidad, conciencia postural y tolerancia a la actividad. En el adulto con deformidad por desgaste es una parte central del manejo del dolor, junto con la medicación que indique tu médico. En el adolescente la terapia no reemplaza al corsé cuando el corsé está indicado.",
      ],
    },
    {
      id: "sin-operar--ejercicios-para-la-escoliosis",
      level: 3,
      heading: "Ejercicios para la escoliosis",
      paragraphs: [
        "Los ejercicios cumplen un papel real en fuerza, movilidad, postura y control del dolor. Lo que no hacen es enderezar por sí solos una curva estructural, y prometer eso es donde muchos programas se pasan de la raya.",
        "Un plan útil se arma sobre la curva concreta de esa persona y lo dirige un terapeuta que la vio. Las rutinas genéricas de internet no distinguen una curva dorsal de una lumbar ni saben si hay crecimiento por delante, que es justo lo que cambia el plan.",
        "Sobre el deporte: por lo general conviene hacerlo y sostiene la musculatura del tronco. Lo que se define caso por caso es si hay alguna disciplina que convenga moderar según la magnitud de la curva, o cómo se organiza el deporte mientras se usa corsé.",
      ],
    },
    {
      id: "cirugia",
      level: 2,
      heading: "Cuándo hace falta operar",
      paragraphs: [
        "La cirugía entra en la conversación cuando la curva es grande, cuando sigue progresando pese a un tratamiento conservador bien cumplido, o cuando la deformidad ya produce consecuencias concretas: dolor que no cede, compromiso de los nervios, o una inclinación que impide mantener el tronco equilibrado sobre la pelvis.",
        "El objetivo no es dejar la columna recta en la radiografía. Es corregir hasta donde es seguro hacerlo, liberar los nervios si están comprimidos y devolver el equilibrio para que sostenerse de pie deje de costar tanto esfuerzo.",
        "Es una cirugía de planificación larga, que se define sobre los estudios de cada persona. La conversación previa incluye qué se corrige, qué no se corrige y qué implica la fijación de aquí en adelante.",
      ],
    },
    {
      id: "cirugia--cirugia-de-la-escoliosis",
      level: 3,
      heading: "Cirugía de la escoliosis",
      paragraphs: [
        "El procedimiento corrige la curva y estabiliza el tramo corregido con una artrodesis que abarca varios niveles. Cuando la deformidad además estrechó el paso de los nervios, esa compresión se libera en el mismo tiempo quirúrgico.",
        "El tramo que se fija pierde movilidad, y eso se explica antes de operar. Lo que suele sorprender es cuánta función se conserva, porque el resto de la columna y las caderas compensan buena parte de ese movimiento. Cuanto más corto es el tramo fijado, menos se nota, y ese es uno de los factores que se cuida al planificar.",
        "La recuperación es individual y depende de la magnitud de la curva, de cuántos niveles se fijaron y de la edad. En general se busca movilizarte temprano, con progresión gradual y con indicaciones claras sobre qué cargas se evitan mientras la artrodesis consolida. Los plazos se conversan en los controles y no se fijan de antemano.",
      ],
    },
    {
      id: "preguntas-frecuentes",
      level: 2,
      heading: "Preguntas frecuentes",
      paragraphs: [
        "Las que más se repiten en consulta, con la respuesta corta. Ninguna reemplaza una evaluación: sirven para que llegues con las preguntas mejor hechas.",
      ],
    },
    {
      id: "preguntas-frecuentes--como-se-corrige-la-escoliosis",
      level: 3,
      heading: "¿Cómo se corrige la escoliosis?",
      paragraphs: [
        "Depende de la edad. Mientras hay crecimiento por delante, la herramienta que frena una curva moderada es el corsé bien indicado y bien usado. Después del crecimiento, corregir de verdad es cirugía.",
        "Todo lo demás, terapia incluida, mejora fuerza, postura y dolor. Es valioso y forma parte del plan, pero no cambia el ángulo de una curva estructural.",
      ],
    },
    {
      id: "preguntas-frecuentes--que-se-debe-hacer-si-tienes-escoliosis",
      level: 3,
      heading: "¿Qué se debe hacer si tienes escoliosis?",
      paragraphs: [
        "Primero, saber qué curva tienes: cuántos grados, dónde y si estás creciendo. Sin esos tres datos cualquier consejo es a ciegas.",
        "Después, cumplir el plan que corresponda a esa curva y no abandonarlo apenas deja de molestar. Si hay corsé indicado, las horas de uso son el tratamiento. Si hay terapia, la constancia es lo que la hace servir. Y sostener los controles, que son los que detectan una progresión mientras todavía se puede hacer algo simple.",
      ],
    },
    {
      id: "preguntas-frecuentes--que-no-se-debe-hacer-cuando-tienes-escoliosis",
      level: 3,
      heading: "¿Qué no se debe hacer cuando tienes escoliosis?",
      paragraphs: [
        "No dejes los controles porque no duele. La escoliosis del adolescente casi nunca duele y es la etapa en la que más rápido puede avanzar.",
        "No compres un corsé por internet ni copies la rutina de ejercicios de otra persona: la indicación depende de tu curva y de tu edad ósea.",
        "No aceptes tratamientos que prometan enderezar la columna en unas sesiones, sean aparatos, manipulaciones o programas milagrosos. Y no dejes el deporte por prevención mal entendida, porque la actividad física sostiene el tronco y casi nunca está prohibida.",
      ],
    },
    {
      id: "cuando-consultar",
      level: 2,
      heading: "Cuándo consultar",
      paragraphs: [
        "Durante el crecimiento vale la pena evaluar cualquier asimetría del tronco que llame la atención, sobre todo si coincide con el estirón. Que haya antecedentes en la familia es otra razón para revisar sin esperar a que se note algo evidente.",
        "En quien ya tiene el diagnóstico, la señal para adelantar el control es que la asimetría se vea distinta a la del chequeo anterior o que la ropa deje de caer como caía. La progresión se documenta comparando estudios, no de memoria.",
        "Hay situaciones que se evalúan sin postergar a cualquier edad: dolor que despierta en la noche, pérdida de fuerza en una pierna o en un brazo, adormecimiento en la zona de la entrepierna, cambios en el control de la orina o la deposición, y una deformidad que aparece o se acentúa rápido. En el adulto, también la imposibilidad de mantenerte erguido al caminar.",
        "La consulta se atiende en el consultorio de Surco, en la Clínica Ricardo Palma, en la Clínica Sanna La Molina y en la Clínica Padre Luis Tezza. Si ya tienes radiografías previas, llévalas todas, incluso las viejas: la comparación en el tiempo es la mitad de la información.",
      ],
    },
  ],
};
