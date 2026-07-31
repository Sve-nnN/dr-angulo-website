export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  paragraphs: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "5-sintomas-de-columna-que-no-debes-ignorar",
    title: "5 síntomas de columna que no debes ignorar",
    description:
      "Estas señales indican que tu columna necesita una evaluación médica, no solo reposo.",
    date: "2026-06-10",
    paragraphs: [
      "El dolor de espalda es tan común que muchas personas aprenden a convivir con él, postergando la consulta hasta que la molestia se vuelve insoportable. El problema es que algunos síntomas no son 'solo cansancio' — son señales de que la columna necesita atención médica cuanto antes.",
      "1. Dolor persistente o que empeora con el tiempo. Un dolor que no cede después de unos días de reposo, o que va a más semana a semana, ya no entra en la categoría de 'molestia pasajera'.",
      "2. Dolor que se irradia a brazos o piernas. Cuando el dolor deja de quedarse en la espalda y baja por una pierna o sube por un brazo, suele indicar compromiso de un nervio, no un simple esguince muscular.",
      "3. Hormigueo o entumecimiento en las extremidades. Esa sensación de 'hormigas' u adormecimiento que acompaña al dolor es otra señal de alerta neurológica que conviene evaluar pronto.",
      "4. Rigidez o dificultad para moverte con normalidad. Si notas que te cuesta agacharte, girar el torso o simplemente levantarte de la cama como antes, vale la pena revisar qué está pasando.",
      "5. Pérdida de fuerza en brazos o piernas. Es la señal más seria de esta lista: si sientes que una pierna o un brazo 'no responde' igual que antes, no esperes más para consultar.",
      "Ninguno de estos síntomas significa automáticamente que necesitas cirugía — la mayoría de los casos se resuelven con tratamiento conservador. Pero sí significan que una evaluación con un especialista te va a dar claridad, en lugar de seguir adivinando qué es lo que tienes.",
    ],
  },
  {
    slug: "hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
    title: "¿Dolor de espalda o hernia discal? Cómo diferenciarlos",
    description:
      "No todo dolor de espalda es una hernia discal, pero hay señales que ayudan a distinguirlos.",
    date: "2026-06-17",
    paragraphs: [
      "Uno de los mayores focos de ansiedad al sentir dolor de espalda es no saber si se trata de algo pasajero o de algo serio como una hernia discal. Aunque solo un examen clínico (y a veces una resonancia) confirma el diagnóstico, hay diferencias que orientan bastante.",
      "Un dolor muscular común — una contractura — suele localizarse en una zona puntual de la espalda, mejora notablemente con reposo, calor local y unos días, y no suele acompañarse de síntomas en las piernas.",
      "Una hernia discal, en cambio, con frecuencia se manifiesta como un dolor que baja por la pierna (lo que se conoce como ciática), puede venir acompañado de hormigueo o adormecimiento, y no mejora — o incluso empeora — solo con reposo.",
      "Si tu dolor 'baja por la pierna' y no cede en pocos días, no lo trates como una simple contractura: agenda una evaluación para descartar compromiso del disco o del nervio.",
    ],
  },
  {
    slug: "miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber",
    title: "¿Tienes miedo a operarte de la columna? 5 cosas que debes saber",
    description:
      "Resolvemos las dudas más comunes de quienes enfrentan por primera vez la posibilidad de una cirugía de columna.",
    date: "2026-06-24",
    paragraphs: [
      "Es una de las preguntas más frecuentes en consulta: '¿es tan riesgoso como parece operarse de la columna?'. El miedo es comprensible — pero suele basarse en ideas desactualizadas sobre cómo era la cirugía de columna hace 20 años.",
      "1. No toda hernia o dolor de columna termina en cirugía. La mayoría de los casos se maneja primero con tratamiento conservador: fisioterapia, medicación, cambios de hábitos.",
      "2. La cirugía se plantea cuando hay una razón concreta para hacerlo — dolor que no responde a otros tratamientos, o compromiso neurológico progresivo. Nunca debería ser la primera opción sin haber intentado antes lo demás.",
      "3. Existen técnicas orientadas a reducir el trauma quirúrgico y acelerar la recuperación frente a los abordajes tradicionales de hace años.",
      "4. La recuperación se planea de forma individual: no es lo mismo el plan de un paciente joven y activo que el de un paciente mayor con otras condiciones.",
      "5. La decisión siempre es informada. Antes de recomendar cualquier procedimiento, la consulta debe dejarte claro qué se haría, por qué, y qué esperar después — para que decidas sin miedo a lo desconocido.",
    ],
  },
  {
    slug: "estenosis-espinal-que-es",
    title: "Estenosis espinal: qué es y por qué aparece con la edad",
    description:
      "La estenosis degenerativa es más frecuente después de los 60 años y más común en mujeres. Esto es lo que debes saber.",
    date: "2026-07-01",
    paragraphs: [
      "La estenosis espinal es el estrechamiento del canal por donde pasa la médula y las raíces nerviosas dentro de la columna. Cuando ese espacio se reduce, los nervios pueden quedar comprimidos, generando dolor, hormigueo o pesadez en las piernas, especialmente al caminar.",
      "La forma más común, la estenosis degenerativa, aparece generalmente después de los 60 años como parte del desgaste natural de la columna, y es más frecuente en mujeres.",
      "Una señal característica es que el malestar aumenta al caminar o estar de pie por periodos largos, y mejora al sentarse o inclinarse hacia adelante — algo que muchos pacientes describen sin saber que tiene un nombre médico concreto.",
      "El tratamiento depende de qué tan avanzado esté el estrechamiento y de cómo afecta tu día a día: en muchos casos se maneja de forma conservadora, y solo en casos más avanzados se conversa la opción quirúrgica.",
    ],
  },
];
