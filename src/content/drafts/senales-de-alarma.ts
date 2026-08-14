/**
 * APROBADO POR EL DOCTOR EL 2026-08-14, sin cambios sobre el texto redactado.
 * El bloque está pasando a las rutas de `targetRoutes` y este archivo se borra
 * en cuanto las dos lo publiquen. Hasta la aprobación decía lo que sigue.
 *
 * BORRADOR SIN APROBACIÓN MÉDICA. Este archivo no se conecta a ninguna ruta
 * hasta que el doctor apruebe el texto.
 *
 * Qué es: el bloque de señales de alarma que el contenido clínico del sitio no
 * tiene. Las guías avisan que son informativas y que no reemplazan una
 * consulta, pero ninguna dice qué hacer si aparece un síntoma que no admite
 * esperar a una cita programada. Es un estándar esperado en contenido médico
 * de este tipo, y el hueco es más grave que el resto de los hallazgos de la
 * auditoría: un paciente con estos signos que interpreta "agenda una cita"
 * como la respuesta correcta pierde horas que importan.
 *
 * Por qué vive acá y no detrás de una bandera de configuración: una bandera
 * deja el texto dentro del paquete que se sirve al navegador aunque esté
 * apagada, y basta que alguien la invierta para publicar contenido clínico sin
 * revisión médica. Un módulo sin importadores no se puede activar por
 * accidente, sale del árbol en el build, y sigue siendo TypeScript tipado y
 * revisable en el diff, que es lo que un `.md` suelto en `docs/` no da.
 * `scripts/check-content.mjs` falla si algún archivo de `src/app/` o
 * `src/components/` lo importa, y también si su texto aparece copiado en el
 * HTML prerenderizado.
 *
 * QUÉ HACER EL DÍA QUE EL DOCTOR LO APRUEBE:
 *
 *   1. Leer el texto con él y corregir lo que haga falta. La redacción de acá
 *      sigue criterio clínico estándar, no su criterio: no está revisada.
 *   2. Mover el cuerpo al módulo de contenido de cada ruta de `targetRoutes`,
 *      como una sección propia dentro de `sections`, con su `id` y su ancla.
 *      La sección natural es junto a `cuando-consultar`, no al cierre.
 *   3. Sumar la ruta al `MANIFEST` de las puertas si todavía no está y correr
 *      `npm run content:check`, que va a medir el cuerpo nuevo.
 *   4. Borrar este archivo y el directorio `src/content/drafts/` si queda
 *      vacío. La aserción de la puerta se queda: protege al próximo borrador.
 *
 * Reglas de contenido que este texto ya respeta y que hay que conservar al
 * moverlo: sin cifras, sin plazos garantizados, sin voz en primera persona
 * sobre casos, y ninguna credencial escrita fuera de `src/content/cv.ts`.
 */

export type ClinicalDraft = {
  /**
   * Aprobación del doctor. Mientras sea `false`, ninguna ruta puede importar
   * este módulo y la puerta de contenido lo verifica por máquina.
   */
  approvedByPhysician: boolean;
  /** Fecha en que se redactó el borrador, no la de aprobación. */
  draftedAt: string;
  /** Rutas donde el bloque tiene que terminar publicado. */
  targetRoutes: string[];
  heading: string;
  /** Párrafo de apertura: qué distingue a estos signos del dolor habitual. */
  intro: string;
  /** Los signos, uno por entrada. Cuerpo plano, sin marcado. */
  signs: { title: string; body: string }[];
  /** Qué hacer. Cierra el bloque y es la parte que no se puede suavizar. */
  whatToDo: string;
};

export const senalesDeAlarmaDraft: ClinicalDraft = {
  approvedByPhysician: true,
  draftedAt: "2026-08-14",
  targetRoutes: ["/servicios/hernia-discal", "/blog/lumbalgia"],

  heading: "Señales que no esperan una cita",

  intro:
    "El dolor de espalda casi siempre da tiempo para organizarse: pedir la cita, hacerse los estudios, ver opciones. Hay un grupo pequeño de signos que rompe esa regla. No son dolor más fuerte, son síntomas distintos, y aparecen cuando las raíces nerviosas que salen de la parte baja de la columna quedan comprimidas. Ahí lo que está en juego no es cuánto duele sino cuánto se recupera después, y eso depende de qué tan rápido se libere la compresión.",

  signs: [
    {
      title: "Perdiste el control para orinar o para retener las heces",
      body: "Puede presentarse como no llegar al baño a tiempo, como no darte cuenta de que tenías la vejiga llena, o al revés, como no poder orinar aunque sientas la necesidad. Cualquiera de las tres formas cuenta. Es el signo más específico del cuadro y el que más se pasa por alto, porque cuesta contarlo.",
    },
    {
      title: "Se te durmió la zona que toca la silla al sentarte",
      body: "La cara interna de los muslos, la zona genital y la que rodea el ano. Se describe como acolchado, como estar sentado sobre una tela gruesa, o como no sentir el papel al limpiarte. No hace falta que la pierna entera esté dormida: alcanza con que esa zona lo esté.",
    },
    {
      title: "La debilidad en la pierna o el pie va empeorando",
      body: "No es la pierna que se cansa o que flaquea cuando el dolor aprieta. Es fuerza que se pierde y no vuelve: el pie que se arrastra al caminar, el tropiezo con el borde de la vereda, no poder levantarte en puntas de pie. Si lo que ayer costaba hoy cuesta más, el tiempo corre en contra.",
    },
    {
      title: "El adormecimiento o la debilidad tomaron las dos piernas",
      body: "El dolor de una hernia suele bajar por una sola pierna. Cuando el compromiso es de los dos lados, o cambia de lado, la compresión está más arriba de donde estaría una raíz sola, y eso cambia la urgencia.",
    },
  ],

  whatToDo:
    "Si tienes cualquiera de estos signos, anda a emergencias de un hospital o de una clínica. No esperes a una cita, no esperes a la mañana siguiente y no lo consultes por mensaje: un chat no atiende una urgencia y la respuesta puede tardar lo que no hay. En emergencias te van a examinar y, si hace falta, te van a pedir una resonancia el mismo día. Lleva contigo los estudios de columna que tengas a mano, pero no demores la salida por buscarlos.",
};
