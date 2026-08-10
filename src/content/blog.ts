import type { ServicePage } from "@/content/service-pages";

/**
 * Sección de un post. El `id` se escribe a mano en este archivo y no se genera
 * a partir del título en tiempo de render: pasa a ser un ancla compartible, y
 * un cambio de redacción no puede romper un enlace que alguien ya mandó por
 * WhatsApp. Mismo criterio que las páginas de servicio.
 */
export type BlogSection = {
  /** kebab-case sin tildes. Es el `id` del h2 y el destino del ancla. */
  id: string;
  heading: string;
  paragraphs: string[];
  subsections?: { heading: string; paragraphs: string[] }[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  /** Guía del silo a la que empuja este post. */
  relatedService: ServicePage["slug"];
  ctaBanner: { heading: string; body: string };
  intro: string[];
  sections: BlogSection[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "5-sintomas-de-columna-que-no-debes-ignorar",
    title: "5 síntomas de columna que no debes ignorar",
    description:
      "Estas señales indican que tu columna necesita una evaluación médica, no solo reposo.",
    publishedAt: "2026-06-10",
    updatedAt: "2026-08-10",
    relatedService: "hernia-discal",
    ctaBanner: {
      heading: "¿Reconoces alguna de estas señales?",
      body: "Una evaluación con estudios propios define si lo tuyo necesita tratamiento o solo control.",
    },
    intro: [
      "El dolor de espalda es tan común que muchas personas aprenden a convivir con él, postergando la consulta hasta que la molestia se vuelve insoportable. El problema es que algunos síntomas no son 'solo cansancio': son señales de que la columna necesita atención médica cuanto antes.",
      "La diferencia entre una molestia que se va a resolver sola y una que necesita evaluación no está tanto en cuánto duele como en cómo se comporta el dolor: hacia dónde viaja, qué lo empeora, si aparece algo más además del dolor, y si el cuadro mejora o empeora con las semanas. Las cinco señales que siguen son las que, vistas en consulta, cambian la conducta.",
    ],
    sections: [
      {
        id: "dolor-persistente",
        heading: "Dolor persistente o que empeora con el tiempo",
        paragraphs: [
          "Un dolor que no cede después de unos días de reposo, o que va a más semana a semana, ya no entra en la categoría de 'molestia pasajera'.",
          "Un episodio de dolor lumbar común suele mejorar de manera clara en el transcurso de dos o tres semanas, y lo esperable es que cada semana se parezca menos a la anterior. Cuando eso no ocurre, o cuando el dolor te obliga a modificar de forma sostenida lo que haces, deja de ser razonable seguir observando.",
          "Hay dos matices que conviene anotar antes de la consulta. El primero es la trayectoria: no cuánto duele hoy, sino si la tendencia de las últimas semanas apunta hacia arriba o hacia abajo. El segundo es el comportamiento nocturno, porque un dolor que te despierta y no mejora al cambiar de posición se evalúa aparte: no se está comportando como un dolor mecánico.",
        ],
      },
      {
        id: "dolor-irradiado",
        heading: "Dolor que se irradia a brazos o piernas",
        paragraphs: [
          "Cuando el dolor deja de quedarse en la espalda y baja por una pierna o sube por un brazo, suele indicar compromiso de un nervio, no un simple esguince muscular.",
          "Ese recorrido no es azaroso: sigue el territorio de la raíz nerviosa que está siendo irritada, y por eso el trayecto que describes le dice bastante a quien te evalúa. Un dolor lumbar que baja por la parte posterior del glúteo, del muslo y de la pierna es lo que se conoce popularmente como ciática. Uno cervical que va del cuello al hombro y baja por el brazo apunta al mismo mecanismo, en otro nivel de la columna.",
          "Una pista adicional que vale mencionar en la consulta: si el dolor se dispara al toser, al estornudar o al hacer fuerza, es porque esos movimientos aumentan la presión dentro del canal. Ese detalle, sumado al recorrido, es de lo que más orienta.",
        ],
      },
      {
        id: "hormigueo-o-entumecimiento",
        heading: "Hormigueo o entumecimiento en las extremidades",
        paragraphs: [
          "Esa sensación de 'hormigas' u adormecimiento que acompaña al dolor es otra señal de alerta neurológica que conviene evaluar pronto.",
          "Lo que la vuelve significativa es que ocupe una zona bien delimitada y siempre la misma, y no todo el brazo o toda la pierna de manera difusa. Esa delimitación corresponde al territorio de una raíz nerviosa concreta, y es lo que permite ubicar en el examen a qué nivel está el problema.",
          "Conviene anotar dónde exactamente lo sientes, desde cuándo y si aparece en momentos puntuales o si se quedó de manera permanente. Una zona que pasó de dormirse a ratos a estar dormida todo el tiempo es un cambio que vale reportar, aunque el dolor haya bajado en el mismo periodo.",
        ],
      },
      {
        id: "rigidez-al-moverte",
        heading: "Rigidez o dificultad para moverte con normalidad",
        paragraphs: [
          "Si notas que te cuesta agacharte, girar el torso o simplemente levantarte de la cama como antes, vale la pena revisar qué está pasando.",
          "La rigidez por sí sola casi nunca es el problema principal, pero es un buen indicador de cuánto te está limitando el cuadro, que es distinto de cuánto te duele. Hay personas con dolor moderado y una restricción importante del movimiento, y esa combinación pesa a la hora de decidir qué hacer.",
          "El patrón también importa. Una rigidez que es peor al levantarte y cede con el movimiento en pocos minutos se comporta distinto de una que dura buena parte de la mañana. Esa diferencia se pregunta en la consulta porque orienta hacia causas distintas.",
        ],
      },
      {
        id: "perdida-de-fuerza",
        heading: "Pérdida de fuerza en brazos o piernas",
        paragraphs: [
          "Es la señal más seria de esta lista: si sientes que una pierna o un brazo 'no responde' igual que antes, no esperes más para consultar.",
          "La debilidad se nota en gestos concretos antes que en la fuerza general: el pie que se arrastra o golpea el suelo al caminar, la dificultad para pararte en puntas o en talones, la sandalia que se sale sin que te des cuenta, el vaso que se resbala, el brazo que ya no sostiene lo que sostenía.",
          "Hay tres situaciones que no admiten esperar turno y se evalúan el mismo día: la pérdida de fuerza que avanza rápido, el adormecimiento en la zona de la entrepierna y los genitales, y la dificultad para controlar la orina o la deposición. Ese conjunto puede indicar una compresión seria dentro del canal.",
        ],
      },
      {
        id: "que-hacer-con-estas-senales",
        heading: "Qué hacer si reconoces alguna de estas señales",
        paragraphs: [
          "Ninguno de estos síntomas significa automáticamente que necesitas cirugía: la mayoría de los casos se resuelven con tratamiento conservador. Pero sí significan que una evaluación con un especialista te va a dar claridad, en lugar de seguir adivinando qué es lo que tienes.",
          "Mientras consigues la cita hay cosas razonables que puedes hacer: mantenerte en movimiento dentro de lo que toleres, evitar el reposo absoluto prolongado, cuidar la forma en que levantas peso y anotar cómo se comporta el dolor día a día. Ese registro simple vale mucho en la consulta, porque la historia es lo que más orienta antes de cualquier imagen.",
          "Lo que no conviene es pedir una resonancia por cuenta propia y leerla sin contexto. Una parte considerable de las resonancias de personas sin ningún dolor muestra discos alterados, así que la imagen sola no define nada: lo que define la conducta es la coincidencia entre lo que muestra el estudio y lo que muestran tus síntomas y tu examen.",
        ],
      },
    ],
  },
  {
    slug: "hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
    title: "¿Dolor de espalda o hernia discal? Cómo diferenciarlos",
    description:
      "No todo dolor de espalda es una hernia discal, pero hay señales que ayudan a distinguirlos.",
    publishedAt: "2026-06-17",
    updatedAt: "2026-08-10",
    relatedService: "hernia-discal",
    ctaBanner: {
      heading: "¿Tu dolor se queda en la espalda o baja por la pierna?",
      body: "Esa diferencia cambia el tratamiento. Una evaluación con tus estudios lo define.",
    },
    intro: [
      "Uno de los mayores focos de ansiedad al sentir dolor de espalda es no saber si se trata de algo pasajero o de algo serio como una hernia discal. Aunque solo un examen clínico (y a veces una resonancia) confirma el diagnóstico, hay diferencias que orientan bastante.",
      "La buena noticia es que la mayoría de los dolores de espalda no son una hernia. La otra cara es que algunos sí lo son, y ahí el tiempo importa. Lo que sigue no reemplaza una evaluación, pero te da un marco para entender qué estás mirando y qué contarle a quien te atienda.",
    ],
    sections: [
      {
        id: "como-se-comporta-un-dolor-muscular",
        heading: "Cómo se comporta un dolor muscular común",
        paragraphs: [
          "Un dolor muscular común, una contractura, suele localizarse en una zona puntual de la espalda, mejora notablemente con reposo, calor local y unos días, y no suele acompañarse de síntomas en las piernas.",
          "Se reconoce además por otras cosas. Suele aparecer después de un esfuerzo puntual, de una postura sostenida o de un día largo, y muchas veces puedes señalar con un dedo dónde te duele. Cambia con la posición y con el movimiento, cede con el calor y con el estiramiento suave, y no viene acompañado de hormigueo ni de pérdida de fuerza.",
          "La trayectoria también ayuda a reconocerlo: un cuadro muscular mejora de manera evidente en el transcurso de unos días, y cada día se parece un poco menos al anterior. Si ese patrón se cumple, lo razonable es sostener el movimiento dentro de lo que toleres y darle tiempo, sin correr a pedir estudios.",
        ],
      },
      {
        id: "como-se-comporta-una-hernia-discal",
        heading: "Cómo se comporta una hernia discal",
        paragraphs: [
          "Una hernia discal, en cambio, con frecuencia se manifiesta como un dolor que baja por la pierna (lo que se conoce como ciática), puede venir acompañado de hormigueo o adormecimiento, y no mejora, o incluso empeora, solo con reposo.",
          "La diferencia de fondo está en de qué se queja el cuerpo. En la contractura el problema es del músculo. En la hernia, parte del disco intervertebral se desplazó y está presionando una raíz nerviosa, y por eso el síntoma deja de quedarse en la espalda y viaja por el territorio de ese nervio, siempre por el mismo recorrido.",
          "Hay señales que acompañan y que no aparecen en un cuadro muscular: el dolor que se dispara al toser, estornudar o hacer fuerza, el adormecimiento en una zona bien delimitada, y la impresión de que la pierna o el brazo responde con menos fuerza. También es frecuente que estar sentado mucho rato moleste más que caminar, que es justo lo contrario de lo que uno esperaría.",
        ],
      },
      {
        id: "las-preguntas-que-lo-definen",
        heading: "Las preguntas que suelen definirlo",
        paragraphs: [
          "Antes de pensar en estudios, hay cuatro preguntas que ordenan casi cualquier dolor de espalda. Hasta dónde llega: si se queda en la espalda o baja por la pierna. Qué lo empeora: si es el movimiento en general o gestos concretos como toser o inclinarte. Si viene solo o acompañado: si hay hormigueo, adormecimiento o debilidad además del dolor. Y cómo viene evolucionando: si la tendencia de las últimas semanas apunta a menos o a más.",
          "Con esas cuatro respuestas, quien te evalúa ya tiene bastante encaminado el diagnóstico. El examen físico completa el mapa revisando fuerza por grupos musculares, reflejos, sensibilidad por territorios y algunas maniobras que ponen en tensión la raíz nerviosa para reproducir el síntoma. La resonancia, cuando corresponde, confirma lo que la consulta ya sospecha. No es por donde se empieza.",
          "Anotar esas respuestas antes de la cita ahorra tiempo y evita que el relato se arme sobre la marcha, que es cuando se pierden los detalles que más orientan.",
        ],
      },
      {
        id: "senales-que-no-esperan",
        heading: "Las señales que no admiten esperar",
        paragraphs: [
          "Hay un grupo de síntomas que no entra en esta comparación, porque se evalúan sin postergar sea cual sea la causa que uno sospeche: la pérdida de fuerza que avanza en una pierna o en un brazo, el adormecimiento en la zona de la entrepierna y los genitales, y la dificultad para controlar la orina o la deposición.",
          "A eso se suman el dolor que aparece después de una caída o un golpe importante, el dolor acompañado de fiebre, y el dolor que despierta en la noche y no mejora al cambiar de posición. Ninguno de esos cuadros se aclara esperando, y cada uno tiene un manejo distinto según lo que lo esté produciendo.",
          "Si reconoces alguno, la conducta no es comparar contracturas con hernias: es buscar atención.",
        ],
      },
      {
        id: "cuando-dejar-de-esperar",
        heading: "Cuándo dejar de esperar y consultar",
        paragraphs: [
          "Si tu dolor 'baja por la pierna' y no cede en pocos días, no lo trates como una simple contractura: agenda una evaluación para descartar compromiso del disco o del nervio.",
          "Descartar es la palabra correcta. Buena parte de estas consultas termina confirmando que no hay compromiso serio y que el cuadro se resuelve con manejo conservador bien llevado: control del dolor con lo que indique tu médico, terapia física dirigida, y corrección de la postura de trabajo y de la forma de levantar peso.",
          "Y si sí hay una hernia, saberlo temprano cambia poco el tratamiento inicial pero bastante el seguimiento, porque permite vigilar lo que no conviene dejar pasar. En cualquiera de los dos escenarios sales de la consulta sabiendo qué tienes, que es exactamente lo que no te va a dar el buscador a las dos de la mañana.",
        ],
      },
    ],
  },
  {
    slug: "miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber",
    title: "¿Tienes miedo a operarte de la columna? 5 cosas que debes saber",
    description:
      "Resolvemos las dudas más comunes de quienes enfrentan por primera vez la posibilidad de una cirugía de columna.",
    publishedAt: "2026-06-24",
    updatedAt: "2026-08-10",
    relatedService: "hernia-discal",
    ctaBanner: {
      heading: "¿Te dijeron que necesitas operarte y quieres otra opinión?",
      body: "Una consulta con tus estudios en mano aclara qué corresponde en tu caso antes de decidir.",
    },
    intro: [
      "Es una de las preguntas más frecuentes en consulta: '¿es tan riesgoso como parece operarse de la columna?'. El miedo es comprensible, pero suele basarse en ideas desactualizadas sobre cómo era la cirugía de columna hace 20 años.",
      "Ese miedo tiene consecuencias concretas: hay personas que postergan la evaluación durante años y llegan cuando el cuadro ya les limitó la vida diaria. La intención de este texto no es convencerte de operarte ni de no hacerlo. Es explicarte cómo se toma esa decisión, quién la toma y con qué información, para que llegues a la consulta con preguntas en vez de con miedo.",
    ],
    sections: [
      {
        id: "no-toda-hernia-termina-en-cirugia",
        heading: "No toda hernia o dolor de columna termina en cirugía",
        paragraphs: [
          "La mayoría de los casos se maneja primero con tratamiento conservador: fisioterapia, medicación, cambios de hábitos.",
          "Esa primera etapa no es un trámite previo para llegar al quirófano: es tratamiento, y en buena parte de los casos es el único que hace falta. El trabajo de terapia física busca descargar el segmento afectado, recuperar movilidad y fortalecer la musculatura que sostiene la columna, y a eso se suma corregir la postura de trabajo y la forma de levantar peso, que es lo que evita la recaída.",
          "Conviene tener claro además que una imagen no manda sobre la decisión. Una resonancia con una hernia visible, en alguien que mejora y hace vida normal, no es por sí sola una indicación quirúrgica: lo que se trata es a la persona, no a la imagen. Si te dijeron que necesitas operarte y todavía no atravesaste un manejo conservador bien hecho y sostenido, es razonable preguntar por qué.",
        ],
      },
      {
        id: "la-cirugia-necesita-una-razon-concreta",
        heading: "La cirugía se plantea cuando hay una razón concreta",
        paragraphs: [
          "La cirugía se plantea cuando hay una razón concreta para hacerlo: dolor que no responde a otros tratamientos, o compromiso neurológico progresivo. Nunca debería ser la primera opción sin haber intentado antes lo demás.",
          "Esas razones se pueden nombrar con precisión, y conviene que te las nombren. La pérdida de fuerza que avanza es una. Los signos de compresión seria del canal, como el adormecimiento en la zona de la entrepierna o los cambios en el control de la orina, son otra, y esa se evalúa el mismo día. Y está el dolor irradiado que sigue siendo incapacitante después de un manejo conservador bien hecho y sostenido en el tiempo.",
          "Fuera de esos escenarios, el paso siguiente casi siempre es seguir trabajando el manejo conservador y volver a evaluar más adelante. Que la conversación sobre cirugía se abra no significa que la decisión esté tomada, y preguntar cuál de esas razones aplica a tu caso es una pregunta razonable y esperable.",
        ],
      },
      {
        id: "las-tecnicas-cambiaron",
        heading: "Las técnicas cambiaron respecto de lo que se cuenta",
        paragraphs: [
          "Existen técnicas orientadas a reducir el trauma quirúrgico y acelerar la recuperación frente a los abordajes tradicionales de hace años.",
          "En términos generales, un abordaje mínimamente invasivo trabaja por incisiones pequeñas, con menos daño al músculo y menos sangrado, y se indica cuando el caso lo permite. La cirugía convencional, abierta, sigue siendo la opción cuando la deformidad o el desgaste es amplio, cuando hay que corregir y estabilizar varios niveles, o en casos de revisión.",
          "Ninguna de las dos es mejor en abstracto: la técnica se elige por el diagnóstico y por tus estudios. Lo que sí puedes esperar es que te expliquen cuál corresponde en tu caso y por qué. Este es, además, uno de los puntos donde más se desactualiza la conversación familiar: lo que le pasó a un pariente hace dos décadas dice poco sobre lo que corresponde hoy.",
        ],
      },
      {
        id: "la-recuperacion-es-individual",
        heading: "La recuperación se planea de forma individual",
        paragraphs: [
          "La recuperación se planea de forma individual: no es lo mismo el plan de un paciente joven y activo que el de un paciente mayor con otras condiciones.",
          "Lo que se puede anticipar es la forma del plan, no su duración exacta. El criterio actual después de una descompresión es movilizarte de forma temprana, con progresión gradual de la actividad y con indicaciones concretas de cuidado de la espalda mientras la zona cicatriza. El retorno a las actividades cotidianas se plantea por etapas y se revisa en cada control.",
          "El plazo concreto depende de la técnica usada, de si hubo que estabilizar el segmento, de tu estado previo y del trabajo al que vuelves, y se define en los controles y no de antemano. Si alguien te da una fecha exacta antes de operarte, esa fecha es una estimación, no un compromiso.",
        ],
      },
      {
        id: "la-decision-siempre-es-informada",
        heading: "La decisión siempre es informada",
        paragraphs: [
          "La decisión siempre es informada. Antes de recomendar cualquier procedimiento, la consulta debe dejarte claro qué se haría, por qué, y qué esperar después, para que decidas sin miedo a lo desconocido.",
          "Informada quiere decir que entiendes el objetivo del procedimiento, qué alternativas quedaron descartadas y por qué, qué riesgos tiene lo que se propone, y también qué riesgos tiene no hacer nada, que es la parte que suele quedar fuera de la conversación.",
          "También quiere decir que puedes tomarte tiempo. Salvo en las situaciones que se evalúan el mismo día, nada se rompe por pedir una segunda opinión, y pedirla no ofende a nadie. Llevar tus estudios completos y el informe de la consulta anterior es lo que hace que esa segunda opinión sea útil y no una repetición de lo mismo.",
        ],
      },
      {
        id: "que-llevar-a-la-consulta",
        heading: "Qué llevar y qué preguntar en la consulta",
        paragraphs: [
          "Preparar la cita cambia bastante lo que sales sabiendo. Conviene llevar los estudios de imagen completos y no solo el informe, la lista de medicamentos que tomas, el detalle de qué tratamientos ya hiciste y por cuánto tiempo, y una nota de cómo viene evolucionando el dolor semana a semana.",
          "Y conviene llevar las preguntas escritas, porque en el momento se olvidan. Cuatro que casi siempre valen: qué se busca lograr con lo que me propones, qué pasa si no lo hago ahora, qué alternativas hay y por qué quedaron de lado, y qué señales tengo que vigilar mientras decido.",
          "Si sales de la consulta con esas cuatro respuestas claras, tomaste una decisión informada, sea cual sea.",
        ],
      },
    ],
  },
  {
    slug: "estenosis-espinal-que-es",
    title: "Estenosis espinal: qué es y por qué aparece con la edad",
    description:
      "La estenosis degenerativa es más frecuente después de los 60 años y más común en mujeres. Esto es lo que debes saber.",
    publishedAt: "2026-07-01",
    updatedAt: "2026-08-10",
    relatedService: "estenosis-espinal",
    ctaBanner: {
      heading: "¿Caminas menos que antes por dolor o pesadez en las piernas?",
      body: "Una evaluación define cuánto se redujo el espacio del canal y qué opciones tienes.",
    },
    intro: [
      "La estenosis espinal es el estrechamiento del canal por donde pasa la médula y las raíces nerviosas dentro de la columna. Cuando ese espacio se reduce, los nervios pueden quedar comprimidos, generando dolor, hormigueo o pesadez en las piernas, especialmente al caminar.",
      "Es un cuadro que suele llegar tarde a la consulta, porque no empieza con un dolor agudo sino con algo más difuso: caminas un poco menos, te sientas un rato y sigues. Reconocerlo temprano ayuda, porque lo que se mide acá no es tanto cuánto duele como cuánto se te achicó el radio de movimiento.",
    ],
    sections: [
      {
        id: "por-que-aparece-con-la-edad",
        heading: "Por qué aparece con la edad",
        paragraphs: [
          "La forma más común, la estenosis degenerativa, aparece generalmente después de los 60 años como parte del desgaste natural de la columna, y es más frecuente en mujeres.",
          "El estrechamiento no viene de una sola causa. Con los años el disco intervertebral pierde altura, las articulaciones pequeñas de la parte posterior de la vértebra se engrosan para repartir la carga que el disco ya no reparte, y el ligamento que tapiza el canal por dentro se vuelve más grueso. Cada uno de esos cambios le resta unos milímetros al espacio disponible, y es la suma la que termina comprimiendo.",
          "Por eso es un cuadro que se instala despacio y no de un día para otro. Existen también formas menos frecuentes: personas que nacen con un canal más estrecho de lo habitual y dan síntomas antes, y casos en los que una vértebra se desliza sobre la de abajo y reduce el espacio de manera adicional.",
        ],
      },
      {
        id: "la-senal-que-mas-orienta",
        heading: "La señal que más orienta",
        paragraphs: [
          "Una señal característica es que el malestar aumenta al caminar o estar de pie por periodos largos, y mejora al sentarse o inclinarse hacia adelante, algo que muchos pacientes describen sin saber que tiene un nombre médico concreto.",
          "La explicación es mecánica y se puede comprobar en la propia rutina: al inclinarte hacia adelante el canal gana algo de espacio, y al enderezarte lo pierde. De ahí que empujar un carrito de supermercado se tolere mejor que caminar erguido la misma distancia, que pedalear resulte más llevadero que caminar, y que bajar una pendiente cueste más que subirla.",
          "Lo que se describe no suele ser dolor puro sino una mezcla: pesadez, calambre, ardor u hormigueo en una pierna o en las dos, con la sensación de que las piernas dejan de responder como antes. Al sentarte, el alivio llega en pocos minutos y puedes retomar el camino. Ese ciclo, repetido siempre igual, es el dato que más orienta.",
        ],
      },
      {
        id: "como-se-siente-en-el-dia-a-dia",
        heading: "Cómo se siente en el día a día",
        paragraphs: [
          "Con el tiempo lo que cambia no es tanto la intensidad como la distancia. Empiezas a medir las salidas por cuadras, evitas los trámites que implican cola, calculas de antemano dónde te vas a poder sentar y dejas de proponer planes que impliquen caminar.",
          "Ese recorte pasa desapercibido porque se acomoda solo: uno se adapta sin registrar que se adaptó. Es común atribuirlo a la edad o al peso, y entonces la consulta se posterga un año más, y otro después de ese.",
          "Vale la pena mirarlo con honestidad. Si hace un año caminabas hasta el mercado sin pensarlo y hoy planificas el trayecto, eso es información clínica y no una queja. Es además el dato que más pesa después, cuando hay que decidir qué tratamiento corresponde.",
        ],
      },
      {
        id: "que-se-pregunta-en-la-consulta",
        heading: "Qué se pregunta en la consulta",
        paragraphs: [
          "La evaluación empieza por el relato, y ahí este cuadro se perfila casi solo: a qué distancia aparece la molestia, qué la alivia, cuánto demoras en recuperarte al sentarte y desde cuándo se viene acortando ese trayecto.",
          "Después viene el examen físico, que revisa fuerza, reflejos, sensibilidad y también los pulsos de las piernas. Ese último punto sirve para separar este cuadro de otro que se le parece y que es de origen circulatorio: ahí la pierna también molesta al caminar, pero cede con solo detenerse, sin necesidad de sentarse ni de inclinarse hacia adelante.",
          "Recién entonces entran los estudios de imagen, y con ellos una advertencia que conviene tener antes de leer un informe: hay canales estrechos en las resonancias de personas que caminan sin ningún problema. La imagen sola no define nada. El detalle de qué aporta cada estudio y cuándo se pide está desarrollado en la guía completa.",
        ],
      },
      {
        id: "que-registrar-antes-de-la-cita",
        heading: "Qué registrar antes de la cita",
        paragraphs: [
          "Hay tres cosas simples que valen más que cualquier resumen hecho de memoria en el consultorio. La primera es la distancia: cuántas cuadras caminas hoy antes de tener que parar, y cuántas caminabas hace seis meses y hace un año.",
          "La segunda es qué te alivia y en cuánto tiempo: si necesitas sentarte, si te basta con inclinarte, si tienes que apoyarte en algo, cuántos minutos pasan hasta que puedes seguir. La tercera es si hay algo más además de la molestia, como adormecimiento en una zona bien delimitada de la pierna o la impresión de que un pie responde con menos fuerza.",
          "Con esas tres respuestas anotadas la consulta rinde bastante más, porque la historia es lo que más orienta antes de cualquier estudio.",
        ],
      },
      {
        id: "como-se-trata",
        heading: "Cómo se trata",
        paragraphs: [
          "El tratamiento depende de qué tan avanzado esté el estrechamiento y de cómo afecta tu día a día: en muchos casos se maneja de forma conservadora, y solo en casos más avanzados se conversa la opción quirúrgica.",
          "El manejo conservador apunta a recuperar tolerancia a la marcha: terapia física dirigida, acondicionamiento aeróbico que no dispare el síntoma, control del peso corporal cuando corresponde, y manejo del dolor con lo que indique tu médico. En algunos casos se suman procedimientos intermedios guiados por imagen.",
          "La cirugía busca devolverle espacio al nervio, y se plantea cuando la limitación al caminar te condiciona la vida diaria pese a un manejo bien hecho, o cuando aparece compromiso neurológico. El detalle de cada opción, con sus indicaciones y cómo es la recuperación, está desarrollado en la guía completa de estenosis espinal.",
        ],
      },
    ],
  },
];
