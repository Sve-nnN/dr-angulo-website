/**
 * Auditoria de lo que v1.1 ya publico, y asignacion del resto de las URLs vivas.
 *
 * QUE PROBLEMA RESUELVE. El plan 14-02 asigno las nueve URLs del handoff. Quedan doce URLs vivas
 * que nadie miro: la home, los dos hubs, los cuatro posts del blog, las tres institucionales y
 * las dos de conversion. D-02 dice que entran al mapa igual que las demas, y el motivo es
 * concreto: hasta que no esten todas escritas no se puede saber cuales estan peleando entre si.
 *
 * NADA DE RED Y NADA DE ESCRITURA, igual que `assign.ts`. Este modulo decide; `assign-run.ts`
 * lee y escribe.
 *
 * DE DONDE SALE `temaPublicado`, Y POR QUE VIAJA CON LA CITA LITERAL.
 * Para separar `dejar` de `reescribir` hay que saber que responde la pagina HOY, y eso no se
 * deduce de la ruta: se lee del contenido publicado. Cada tema trae la frase textual de la que se
 * dedujo y el archivo con su linea. Sin la cita, "el contenido apunta a otro tema" es una opinion
 * del ejecutor; con la cita, la fase 15 puede abrir el archivo y discutirla.
 *
 * LO QUE ESTE MODULO LEYO DE `src/` DE LA APLICACION: `content/blog.ts`, `content/service-pages.ts`,
 * `content/location-pages.ts` y las metas de las ocho paginas de `app/`. SOLO LECTURA. Las citas
 * son texto ya publicado; no se genera ni se altera ninguna afirmacion clinica (T-14-11, T-14-12).
 *
 * TRES REGLAS QUE ESTE MODULO AGREGA AL ASIGNADOR:
 *
 *   1. UNA URL PUEDE NO PELEAR NINGUNA KEYWORD, y tiene que decir por que. `/sedes` es la
 *      decision de Juan del 2026-08-11: hub de navegacion sin primaria, justamente para dejar de
 *      canibalizar a las cuatro sedes. Meterle una keyword de relleno para que el conteo cierre
 *      seria el mismo respaldo silencioso que el plan 14-02 elimino de las secundarias, cometido
 *      sobre la primaria. Estas filas van con `esPaginaSeo: false` y `motivoSinPrimaria` escrito.
 *
 *   2. UNA URL QUE VA A REDIRIGIR NO LLEVA PRIMARIA. Un post que se funde con la guia y despues
 *      301 no compite por nada: escribirle una keyword en el `Content Model` del cliente lo
 *      muestra peleando una consulta que en dos semanas no va a existir.
 *
 *   3. EL VEREDICTO EDITORIAL DE UN POST SE DECIDE CONTRA EL CONTENIDO, NO CONTRA LA CARPETA.
 *      Fusionar, cambiar de angulo o redirigir sale de comparar lo que el post dice con lo que la
 *      guia va a decir, con la cita de los dos lados.
 */

import { AsignacionInvalida, MINIMO_DE_MOTIVO, validarAsignacion, type AccionDeUrl, type AsignacionDeUrl } from "./model.js";
import { esExclusivaDeCaptacion, type EspecificacionDeUrl } from "./assign.js";

const SITIO = "https://drangulocolumna.com";

/** Falla de auditoria. Nombra la URL y que falta, para arreglarlo sin adivinar. */
export class ErrorDeAuditoria extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorDeAuditoria";
  }
}

// ---------------------------------------------------------------------------------------------
// Lo que el contenido publicado dice hoy.
// ---------------------------------------------------------------------------------------------

export interface EvidenciaPublicada {
  /** Archivo y linea del contenido publicado. Procedencia auditable. */
  readonly archivo: string;
  /** Texto LITERAL del que se dedujo el tema. No parafraseado. */
  readonly cita: string;
}

export interface TemaPublicado {
  readonly url: string;
  /** De que trata la pagina hoy, en una linea. */
  readonly tema: string;
  readonly evidencia: readonly EvidenciaPublicada[];
}

/**
 * Veredicto editorial de un post frente a la guia clinica que cubre su misma condicion.
 *
 * Los tres valores son los que la nota de Juan del 2026-08-11 exige poder emitir: "o el post se
 * fusiona con la guia, o pasa a un angulo distinto, o redirige".
 */
export type VeredictoEditorial = "angulo-distinto" | "fusionar" | "redirigir";

/**
 * Lo que las doce URLs vivas responden hoy, leido del contenido publicado el 2026-08-10.
 *
 * El orden es alfabetico por URL para que dos lecturas de este archivo se comparen sin ruido.
 */
export const TEMAS_PUBLICADOS: readonly TemaPublicado[] = [
  {
    url: "/",
    tema: "Presentacion del traumatologo y cirujano de columna en Lima, con las cuatro sedes y las cuatro guias de servicio colgando de ella",
    evidencia: [
      {
        archivo: "src/app/page.tsx:17",
        cita: "Dr. Juan Carlos Angulo Totesaut — Traumatólogo y Cirujano de Columna en Lima",
      },
    ],
  },
  {
    url: "/agendar",
    tema: "Como agendar en cada sede: WhatsApp para el consultorio de Surco y la central de citas de cada clinica",
    evidencia: [
      {
        archivo: "src/app/agendar/page.tsx:12",
        cita:
          "Dónde atiende el Dr. Juan Carlos Angulo y cómo agendar en cada sede: consultorio privado en Surco por WhatsApp, y Clínica Ricardo Palma, Sanna La Molina y Clínica Tezza con sus propias centrales de citas.",
      },
    ],
  },
  {
    url: "/blog",
    tema: "Indice de los articulos del silo informativo, sin contenido propio mas alla del listado",
    evidencia: [
      {
        archivo: "src/app/blog/page.tsx:8",
        cita:
          "Artículos sobre dolor de espalda, hernia discal, cirugía de columna y salud músculo-esquelética, escritos por el Dr. Juan Carlos Angulo.",
      },
    ],
  },
  {
    url: "/blog/5-sintomas-de-columna-que-no-debes-ignorar",
    tema: "Senales de alarma de columna, con el dolor irradiado por la pierna —la ciatica— como eje del texto",
    evidencia: [
      {
        archivo: "src/content/blog.ts:59",
        cita: "Dolor que se irradia a brazos o piernas",
      },
      {
        archivo: "src/content/blog.ts:62",
        cita:
          "Un dolor lumbar que baja por la parte posterior del glúteo, del muslo y de la pierna es lo que se conoce popularmente como ciática.",
      },
    ],
  },
  {
    url: "/blog/estenosis-espinal-que-es",
    tema: "Que es la estenosis espinal y por que aparece con la edad: el mismo temario que la guia de servicio, y el post lo admite dos veces",
    evidencia: [
      {
        archivo: "src/content/blog.ts:291",
        cita:
          "El detalle de qué aporta cada estudio y cuándo se pide está desarrollado en la guía completa.",
      },
      {
        archivo: "src/content/blog.ts:309",
        cita:
          "El detalle de cada opción, con sus indicaciones y cómo es la recuperación, está desarrollado en la guía completa de estenosis espinal.",
      },
    ],
  },
  {
    url: "/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
    tema: "Diagnostico diferencial entre contractura y hernia discal, que es el mismo angulo que la guia de hernia ya lleva de secundarias",
    evidencia: [
      {
        archivo: "src/content/blog.ts:106",
        cita: "¿Dolor de espalda o hernia discal? Cómo diferenciarlos",
      },
      {
        archivo: "src/content/blog.ts:134",
        cita:
          "Una hernia discal, en cambio, con frecuencia se manifiesta como un dolor que baja por la pierna (lo que se conoce como ciática)",
      },
    ],
  },
  {
    url: "/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber",
    tema: "Como se decide una cirugia de columna: cuando se plantea, que tecnicas hay y como es la recuperacion",
    evidencia: [
      {
        archivo: "src/content/blog.ts:196",
        cita: "La cirugía se plantea cuando hay una razón concreta",
      },
      {
        archivo: "src/content/blog.ts:208",
        cita:
          "un abordaje mínimamente invasivo trabaja por incisiones pequeñas, con menos daño al músculo y menos sangrado, y se indica cuando el caso lo permite",
      },
    ],
  },
  {
    url: "/contacto",
    tema: "Vias de contacto y ubicacion del consultorio, con el mismo temario de sedes que /agendar",
    evidencia: [
      {
        archivo: "src/app/contacto/page.tsx:11",
        cita:
          "Escribe tu caso al Dr. Juan Carlos Angulo o agenda en su consultorio privado de Surco por WhatsApp.",
      },
    ],
  },
  {
    url: "/preguntas-frecuentes",
    tema: "Dudas frecuentes de consulta: a quien corresponde cada dolor, que se hace en la primera cita y cuando se opera",
    evidencia: [
      {
        archivo: "src/app/preguntas-frecuentes/page.tsx:10",
        cita:
          "Resolvemos las dudas más comunes sobre dolor de espalda, cirugía de columna y consultas con el Dr. Juan Carlos Angulo.",
      },
    ],
  },
  {
    url: "/sedes",
    tema: "Listado de las cuatro sedes con direccion y horarios, y un enlace a la pagina de cada una",
    evidencia: [
      {
        archivo: "src/app/sedes/page.tsx:9",
        cita:
          "Dónde atiende el Dr. Juan Carlos Angulo, traumatólogo y cirujano de columna en Lima: dirección, días y horarios de cada sede, con la página de cada una.",
      },
    ],
  },
  {
    url: "/sobre-el-doctor",
    tema: "Trayectoria y formacion del doctor: es la pagina de autoridad del sitio y su consulta es el nombre propio",
    evidencia: [
      {
        archivo: "src/app/sobre-el-doctor/page.tsx:12",
        cita:
          "Traumatólogo por la Universidad de Oriente, especializado en columna en el Instituto de Columna de Caracas, con cursos AO y entrenamientos en Estados Unidos, Francia y Argentina.",
      },
    ],
  },
  {
    url: "/testimonios",
    tema: "Resenas de pacientes y videos del consultorio, sin contenido clinico propio",
    evidencia: [
      {
        archivo: "src/app/testimonios/page.tsx:11",
        cita: "Reseñas y testimonios reales de pacientes del Dr. Juan Carlos Angulo Totesaut.",
      },
    ],
  },
];

const TEMA_POR_URL = new Map(TEMAS_PUBLICADOS.map((t) => [t.url, t]));

export function temaPublicadoDe(url: string): TemaPublicado | null {
  return TEMA_POR_URL.get(url) ?? null;
}

// ---------------------------------------------------------------------------------------------
// URLs que NO entran al mapa, y por que.
// ---------------------------------------------------------------------------------------------

/**
 * Las dos unicas URLs vivas que el mapa no cubre, cada una por su motivo.
 *
 * `/servicios/escoliosis` no es "una URL que no compite": es la MISMA pagina que
 * `/servicios/escoliosis-y-deformidades` bajo el slug viejo. Juan decidio el renombre el
 * 2026-08-11 y el slug nuevo ya esta en el mapa desde el plan 14-02. Darle fila propia la
 * mostraria compitiendo contra si misma, que es la canibalizacion que este plan viene a cerrar.
 */
export const FUERA_DEL_MAPA: Readonly<Record<string, string>> = {
  "/privacidad":
    "D-11: es una pagina legal que declara noindex desde v1.0 y esta fuera del sitemap. " +
    "Asignarle una keyword seria pedirle a Google que posicione una URL que el propio sitio le " +
    "pide no indexar.",
  "/servicios/escoliosis":
    "Es el slug anterior de /servicios/escoliosis-y-deformidades, renombrado por decision de " +
    "Juan del 2026-08-11. La fila del slug nuevo ya esta en el mapa desde el plan 14-02 y esta " +
    "URL redirige 301 hacia ella, trabajo de v1.1. Dos filas para la misma pagina la pondrian a " +
    "competir contra si misma.",
};

export function entraAlMapa(url: string): boolean {
  return FUERA_DEL_MAPA[url] === undefined;
}

// ---------------------------------------------------------------------------------------------
// La accion, deducida del contenido publicado.
// ---------------------------------------------------------------------------------------------

export interface EntradaDeAccion {
  readonly url: string;
  /** Si la URL ya existe en el sitio publicado. */
  readonly existe: boolean;
  readonly familia: string;
  readonly tema: TemaPublicado | null;
  /** Clave de la keyword que la pagina responde HOY, o `null` si no responde ninguna del mapa. */
  readonly sirveHoy: string | null;
  /** Clave de la keyword que el mapa le asigna, o `null` cuando la URL no compite. */
  readonly keywordAsignadaKey: string | null;
  readonly tipoDePagina: string;
  readonly tipoExigidoPorSerp: string | null;
  /** Veredicto editorial frente a la guia que cubre su condicion. `null` si no aplica. */
  readonly veredicto: VeredictoEditorial | null;
  readonly destinoDeRedireccion: string | null;
}

export interface ResultadoDeAccion {
  readonly accion: AccionDeUrl;
  readonly motivoDeAccion: string;
  readonly redirigeA: string | null;
}

function citar(tema: TemaPublicado | null): string {
  if (tema === null || tema.evidencia.length === 0) return "sin contenido publicado que citar";
  const e = tema.evidencia[0] as EvidenciaPublicada;
  return `${e.archivo} dice "${e.cita}"`;
}

/**
 * Decide que hacer con el contenido de una URL comparando lo publicado contra lo asignado.
 *
 * El orden de las ramas no es intercambiable. El veredicto editorial va PRIMERO porque una URL
 * que se funde con otra ya no se reescribe ni se deja: se apaga. Despues va la inexistencia,
 * porque una URL que no existe no tiene contenido que auditar. Recien entonces se compara tema
 * contra keyword, que es la unica comparacion que necesita haber leido el sitio.
 */
export function resolverAccion(e: EntradaDeAccion): ResultadoDeAccion {
  if (e.veredicto === "fusionar" || e.veredicto === "redirigir") {
    if (e.destinoDeRedireccion === null) {
      throw new ErrorDeAuditoria(
        `${e.url}: el veredicto editorial es "${e.veredicto}" y no se declaro a donde redirige. ` +
          `Un post que se apaga sin destino escrito es un enlace roto en produccion y una ` +
          `senal perdida: la autoridad del post tiene que llegar a la guia que lo absorbe.`,
      );
    }
    if (e.keywordAsignadaKey !== null) {
      throw new ErrorDeAuditoria(
        `${e.url}: va a redirigir a ${e.destinoDeRedireccion} y aun asi trae la primaria ` +
          `"${e.keywordAsignadaKey}". Una URL a punto de 301 no compite por nada, y escribirle ` +
          `una keyword en el Content Model del cliente la muestra peleando una consulta que en ` +
          `dos semanas no va a existir.`,
      );
    }
    return {
      accion: "redirigir",
      motivoDeAccion:
        `El contenido publicado cubre el mismo tema que ${e.destinoDeRedireccion}, que la fase 15 ` +
        `reescribe como guia clinica larga: ${citar(e.tema)}. Se funde dentro de la guia y la URL ` +
        `redirige 301, para que las dos dejen de pelear la misma intencion informativa.`,
      redirigeA: e.destinoDeRedireccion,
    };
  }

  if (!e.existe) {
    return {
      accion: "crear",
      motivoDeAccion:
        `La URL no existe todavia en el inventario medido del sitio: su keyword de oro no tiene ` +
        `hoy ninguna pagina que pueda ganarla, asi que se planifica una en vez de forzarla dentro ` +
        `de una URL que sirve otra cosa.`,
      redirigeA: null,
    };
  }

  if (e.keywordAsignadaKey === null) {
    return {
      accion: "dejar",
      motivoDeAccion:
        `La URL existe y por decision declarada no es objetivo de posicionamiento, asi que no hay ` +
        `keyword contra la cual medir su contenido: ${citar(e.tema)}. El contenido queda como esta ` +
        `y la URL trabaja como nodo de navegacion.`,
      redirigeA: null,
    };
  }

  const sirveLoAsignado = e.sirveHoy !== null && e.sirveHoy === e.keywordAsignadaKey;
  const formatoCorrecto = e.tipoExigidoPorSerp === null || e.tipoExigidoPorSerp === e.tipoDePagina;

  if (sirveLoAsignado && formatoCorrecto) {
    return {
      accion: "dejar",
      motivoDeAccion:
        `El contenido publicado ya responde "${e.keywordAsignadaKey}" y esta en el formato que su ` +
        `top 10 premia: ${citar(e.tema)}.`,
      redirigeA: null,
    };
  }

  const motivo = sirveLoAsignado
    ? `El contenido publicado ya responde "${e.keywordAsignadaKey}" pero la pagina es ` +
      `${e.tipoDePagina} y su top 10 medido premia ${e.tipoExigidoPorSerp ?? "otro formato"}, ` +
      `asi que lo que cambia es el formato y no la keyword (MAP-04). Evidencia: ${citar(e.tema)}.`
    : `El contenido publicado apunta a otro tema que el que el mapa le asigna. Hoy responde ` +
      `"${e.tema?.tema ?? "ningun tema del mapa"}" y tiene que responder ` +
      `"${e.keywordAsignadaKey}". Salio el 2026-08-10, antes de que esta fase asignara keywords ` +
      `(D-01). Evidencia: ${citar(e.tema)}.`;

  if (motivo.trim().length < MINIMO_DE_MOTIVO) {
    throw new ErrorDeAuditoria(
      `${e.url}: se resolvio "reescribir" sin motivo suficiente. Una orden de reescritura sin ` +
        `el texto publicado del que salio no se emite.`,
    );
  }

  return { accion: "reescribir", motivoDeAccion: motivo, redirigeA: null };
}

// ---------------------------------------------------------------------------------------------
// Los tres guardarrailes que el asignador no puede aplicar solo.
// ---------------------------------------------------------------------------------------------

/**
 * D-09 desde el otro lado: una URL de conversion no puede llevar keyword de captacion.
 *
 * `/agendar` y `/contacto` son el final del embudo. Una keyword de automedicacion ahi pone al
 * consultorio recomendando pastillas en la pagina donde se agenda una cirugia, que es lo que la
 * restriccion YMYL del proyecto prohibe de frente.
 */
export function verificarUrlDeConversion(url: string, familia: string, keyword: string | null): void {
  if (familia !== "conversion" || keyword === null) return;
  if (esExclusivaDeCaptacion(keyword)) {
    throw new ErrorDeAuditoria(
      `${url}: "${keyword}" es intencion de automedicacion y esta es una URL de conversion. Una ` +
        `pagina de captacion puede explicar por que esas pastillas no resuelven el problema; una ` +
        `pagina de agenda que la persiga esta recomendandolas justo donde se cierra la consulta ` +
        `(D-09).`,
    );
  }
}

/**
 * D-09 en su forma original: el post de captacion NUNCA se convierte en pagina de servicio.
 *
 * La tentacion es directa: la SERP de una keyword de captacion puede premiar formato comercial, y
 * el asignador escribiria "reescribir como pagina de servicio". Eso convierte un articulo que
 * explica en una pagina que vende, sobre una consulta de automedicacion.
 */
export function verificarPostDeCaptacion(
  url: string,
  familia: string,
  keyword: string | null,
  tipoExigidoPorSerp: string | null,
): void {
  if (familia !== "contenido" || keyword === null) return;
  if (!esExclusivaDeCaptacion(keyword)) return;
  if (tipoExigidoPorSerp === "pagina-de-servicio" || tipoExigidoPorSerp === "ficha-de-clinica") {
    throw new ErrorDeAuditoria(
      `${url}: "${keyword}" es de captacion y su top 10 premia ${tipoExigidoPorSerp}. Seguir esa ` +
        `senal convertiria el articulo en pagina de servicio sobre una consulta de ` +
        `automedicacion. El post se queda como captacion (D-09) y la conversion la hace el CTA.`,
    );
  }
}

/**
 * Una URL sin candidata alcanzable falla, no recibe una primaria debil.
 *
 * Es la regla 4 del asignador aplicada un escalon mas arriba: alli faltaban secundarias, aca falta
 * la primaria. Poner cualquier cabeza para que el conteo de MAP-01 cierre produce una fila que
 * pasa la validacion, una pagina que no rankea, y una canibalizacion que nadie busco.
 */
export function verificarCandidataAlcanzable(url: string, candidatas: readonly string[]): void {
  if (candidatas.length > 0) return;
  throw new ErrorDeAuditoria(
    `${url}: no quedo ninguna cabeza medida que esta URL pueda ganar sin quitarsela a otra. No se ` +
      `le asigna una primaria debil para completar el conteo: o se declara "esPaginaSeo": false ` +
      `con el motivo escrito, o se mide una cabeza nueva cuando se reponga la cuota de SerpApi.`,
  );
}

// ---------------------------------------------------------------------------------------------
// Las filas que declaran por que NO compiten.
// ---------------------------------------------------------------------------------------------

export interface FilaSinPrimaria {
  readonly url: string;
  readonly titulo: string;
  readonly origen: string;
  readonly estado: "viva" | "planificada";
  readonly tipoDePagina: string;
  readonly topic: string;
  readonly motivoSinPrimaria: string;
  readonly veredicto?: VeredictoEditorial | undefined;
  readonly redirigeA?: string | undefined;
}

/**
 * Intencion que se le escribe a una fila que no pelea ninguna consulta.
 *
 * No es "informacional" ni "transaccional": no hay SERP contra la cual medirla, porque no hay
 * keyword. Inventarle una intencion seria escribir una medicion que nadie hizo.
 */
export const SIN_INTENCION = "sin objetivo de posicionamiento";

/**
 * Las ocho URLs que entran al mapa DECLARANDO que no compiten.
 *
 * Tres motivos distintos, y la diferencia importa:
 *
 *   - NODO DE NAVEGACION (`/sedes`, `/blog`): existe para repartir, no para rankear. `/sedes` es
 *     decision explicita de Juan del 2026-08-11.
 *   - SIN CABEZA MEDIDA DISPONIBLE (`/agendar`, `/contacto`, `/sobre-el-doctor`, `/testimonios`):
 *     se midio, y todas las cabezas que podrian tomar se funden por SERP con la primaria de otra
 *     URL del mapa. Cada una lleva el numero de URLs compartidas, que es la evidencia.
 *   - A PUNTO DE REDIRIGIR (los dos posts): se fusionan con su guia.
 */
export const SIN_PRIMARIA: readonly FilaSinPrimaria[] = [
  {
    url: "/agendar",
    titulo: "Agendar cita — Consultorios y horarios en Lima",
    origen: "src/app/agendar/page.tsx:11",
    estado: "viva",
    tipoDePagina: "pagina-de-conversion",
    topic: "conversion",
    motivoSinPrimaria:
      "Es el final del embudo y no tiene cabeza medida propia. Las tres transaccionales que " +
      "podria tomar se funden por SERP con la primaria de la home: `traumatologo lima` comparte 8 " +
      "URLs del top 10 con `traumatologia lima`, `traumatologia cerca de mi` comparte 6 y " +
      "`traumatologo cerca de mi` comparte 5, todas muy por encima del umbral de 3. Asignarle " +
      "cualquiera de ellas montaria la canibalizacion que MAP-02 existe para atrapar, y con la " +
      "home como victima. Recibe el trafico por enlace interno desde la home, las guias y las " +
      "sedes, que es como trabaja una pagina de conversion.",
  },
  {
    url: "/blog",
    titulo: "Blog — Salud de columna y traumatología",
    origen: "src/app/blog/page.tsx:7",
    estado: "viva",
    tipoDePagina: "hub-de-contenido",
    topic: "blog",
    motivoSinPrimaria:
      "Es el indice del silo informativo y no tiene contenido propio: darle una keyword lo pondria " +
      "a competir contra los mismos articulos que lista, que es la forma mas facil de canibalizar " +
      "un blog. La unica cabeza generica que le calzaria, `traumatologia`, comparte 3 URLs del " +
      "top 10 con `traumatologia lima` de la home y esta en el umbral de fusion. Nodo de " +
      "navegacion, con la misma logica con la que Juan resolvio `/sedes`.",
  },
  {
    url: "/blog/estenosis-espinal-que-es",
    titulo: "Estenosis espinal: qué es y por qué aparece con la edad",
    origen: "src/content/blog.ts:242",
    estado: "viva",
    tipoDePagina: "articulo-de-blog",
    topic: "estenosis-espinal",
    veredicto: "fusionar",
    redirigeA: "/servicios/estenosis-espinal",
    motivoSinPrimaria:
      "Se funde con la guia de estenosis espinal y redirige, asi que no pelea ninguna consulta. El " +
      "post no compite con la guia: la anticipa, y lo dice el propio texto publicado dos veces " +
      "(`src/content/blog.ts:291` y `:309` remiten a la guia completa).",
  },
  {
    url: "/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
    titulo: "¿Dolor de espalda o hernia discal? Cómo diferenciarlos",
    origen: "src/content/blog.ts:105",
    estado: "viva",
    tipoDePagina: "articulo-de-blog",
    topic: "hernia-discal",
    veredicto: "fusionar",
    redirigeA: "/servicios/hernia-discal",
    motivoSinPrimaria:
      "Se funde con la guia de hernia discal y redirige. Su angulo —el diferencial entre " +
      "contractura y hernia— ya vive dentro de la guia, que lleva `ciatica o hernia discal` y " +
      "`lumbalgia o hernia discal` de secundarias desde el plan 14-02. Ademas no hay cabeza medida " +
      "que el post pudiera tomar: `dolor de espalda` esta en el universo de la fase 13 pero no " +
      "entre las 91 cabezas con SERP medida, asi que una primaria suya no tendria tipo exigido y " +
      "seria inferencia disfrazada de medicion.",
  },
  {
    url: "/contacto",
    titulo: "Contacto y Citas en Lima",
    origen: "src/app/contacto/page.tsx:10",
    estado: "viva",
    tipoDePagina: "pagina-de-conversion",
    topic: "conversion",
    motivoSinPrimaria:
      "Mismo caso que `/agendar` y agravado: comparte con ella el temario de sedes, asi que " +
      "cualquier keyword que tomara chocaria dos veces, contra la home y contra `/agendar`. Las " +
      "dos cabezas de cercania que le calzarian, `traumatologia cerca de mi` y `traumatologo cerca " +
      "de mi`, comparten 6 URLs del top 10 entre si y 6 y 5 con `traumatologia lima`. No compite: " +
      "convierte.",
  },
  {
    url: "/sedes",
    titulo: "Sedes donde atiende el Dr. Juan Carlos Angulo en Lima",
    origen: "src/app/sedes/page.tsx:8",
    estado: "viva",
    tipoDePagina: "hub-de-sedes",
    topic: "sedes",
    motivoSinPrimaria:
      "Decision de Juan del 2026-08-11: queda como hub de navegacion hacia las cuatro sedes, sin " +
      "pelear ningun termino, precisamente para dejar de canibalizarlas. Los nombres de clinica " +
      "formaron cluster propio y limpio en la fase 13 y la senal tiene que concentrarse ahi, no " +
      "repartirse entre el hub y cada sede. Es una decision registrada, no una omision.",
  },
  {
    url: "/sobre-el-doctor",
    titulo: "Dr. Juan Carlos Angulo — Trayectoria y formación en Lima",
    origen: "src/app/sobre-el-doctor/page.tsx:11",
    estado: "viva",
    tipoDePagina: "pagina-institucional",
    topic: "autoridad",
    motivoSinPrimaria:
      "Su consulta real es el nombre propio del doctor, y el universo de la fase 13 se construyo " +
      "desde semillas de condicion y de especialidad: no hay una sola cabeza de marca medida " +
      "contra la cual asignarla. Las dos genericas que podria tomar se funden con primarias " +
      "existentes: `traumatologo` comparte 6 URLs del top 10 con `traumatologia lima` de la home y " +
      "`cirujano de columna` comparte 3 con `cirujano de columna lima` de `/servicios`. Queda " +
      "anotada como deuda con fecha: medir la SERP de marca cuando se reponga la cuota de SerpApi " +
      "el 2026-08-21.",
  },
  {
    url: "/testimonios",
    titulo: "Testimonios de pacientes",
    origen: "src/app/testimonios/page.tsx:10",
    estado: "viva",
    tipoDePagina: "pagina-institucional",
    topic: "autoridad",
    motivoSinPrimaria:
      "Ninguna de las 91 cabezas medidas es una consulta de resenas de un medico concreto, asi que " +
      "no hay dato con el cual asignarle una primaria. Y bajo la restriccion YMYL del proyecto una " +
      "pagina de testimonios no es el lugar donde perseguir volumen clinico: sostiene la " +
      "conversion desde la prueba social y recibe enlaces, no consultas de busqueda.",
  },
];

/**
 * Construye y valida las filas sin primaria contra el contrato de `model.ts`.
 *
 * Se validan aca y no al escribir: una fila mal formada tiene que romper en la funcion pura, que
 * es donde las pruebas la ven, y no al final de la corrida contra el documento del cliente.
 */
export function filasSinPrimaria(): AsignacionDeUrl[] {
  return SIN_PRIMARIA.map((f) => {
    if (!entraAlMapa(f.url)) {
      throw new ErrorDeAuditoria(
        `${f.url}: esta declarada fuera del mapa y aun asi aparece en la lista de filas sin ` +
          `primaria. ${FUERA_DEL_MAPA[f.url] as string}`,
      );
    }
    const { accion, motivoDeAccion, redirigeA } = resolverAccion({
      url: f.url,
      existe: f.estado === "viva",
      familia: f.topic === "conversion" ? "conversion" : "hub",
      tema: temaPublicadoDe(f.url),
      sirveHoy: null,
      keywordAsignadaKey: null,
      tipoDePagina: f.tipoDePagina,
      tipoExigidoPorSerp: null,
      veredicto: f.veredicto ?? null,
      destinoDeRedireccion: f.redirigeA ?? null,
    });

    const tema = temaPublicadoDe(f.url);
    const registro = {
      url: f.url,
      titulo: f.titulo,
      estado: f.estado,
      origen: f.origen,
      esPaginaSeo: false,
      keywordPrimaria: null,
      keywordPrimariaKey: null,
      secundarias: [],
      intent: SIN_INTENCION,
      tipoDePagina: f.tipoDePagina,
      tipoExigidoPorSerp: null,
      cluster: null,
      clusterFuente: null,
      accion,
      motivoDeAccion,
      motivoSinPrimaria: f.motivoSinPrimaria,
      redirigeA,
      dejarActualizarEliminar: accion === "redirigir" ? "eliminar" : "dejar",
      canonical: `${SITIO}${f.url}`,
      topic: f.topic,
      justificacion:
        `${f.motivoSinPrimaria} Lo que la pagina publica hoy: ${tema?.tema ?? "sin contenido auditado"}. ` +
        `Evidencia: ${citar(tema)}. Accion ${accion}: ${motivoDeAccion}`,
    };

    try {
      return validarAsignacion(registro, `filasSinPrimaria(${f.url})`);
    } catch (error) {
      if (error instanceof AsignacionInvalida) throw new ErrorDeAuditoria(error.message);
      throw error;
    }
  });
}

// ---------------------------------------------------------------------------------------------
// El resto de las URLs vivas que SI pelean una keyword.
// ---------------------------------------------------------------------------------------------

/**
 * Las siete URLs que completan el mapa, con su motivo en prosa.
 *
 * Cuatro son vivas y tres son planificadas por keywords de oro que ninguna URL existente podia
 * ganar. Cada una declara el veredicto de solape que la habilita, medido contra las 96 capturas
 * ya pagadas: cero URLs compartidas con toda otra primaria del mapa, salvo donde se dice.
 */
export const RESTO: readonly EspecificacionDeUrl[] = [
  {
    url: "/",
    titulo: "Dr. Juan Carlos Angulo Totesaut — Traumatólogo y Cirujano de Columna en Lima",
    origen: "src/app/page.tsx:17",
    estado: "viva",
    esPaginaSeo: true,
    familia: "home",
    tipoDePagina: "home",
    topic: "home",
    candidatas: ["traumatologia lima"],
    sirveHoy: null,
    filtroDeTema: "traumatolog",
    porQue:
      "Es la keyword de oro numero 5 y la unica de las diez con volumen medido de tres cifras " +
      "(880). La home es la unica URL del sitio que puede pelear la consulta de especialidad " +
      "entera sin quitarsela a nadie: se midio contra las otras dos primarias de especialidad y " +
      "comparte CERO URLs del top 10 con `cirujano de columna lima` de `/servicios` y cero con " +
      "`ortopedia infantil lima`. Las tres son paginas distintas medidas de a pares, aunque el " +
      "cluster de 41 cabezas las junte por transitividad. El filtro de tema la deja quedarse con " +
      "las variantes de traumatologia y no con las de columna, que son del hub.",
  },
  {
    url: "/servicios/cirugia-minimamente-invasiva",
    titulo: "Cirugía mínimamente invasiva de columna en Lima",
    origen: "planificada por golden-10.json, puesto 10",
    estado: "planificada",
    esPaginaSeo: true,
    familia: "servicio",
    tipoDePagina: "pagina-de-servicio",
    topic: "cirugia-minimamente-invasiva",
    candidatas: ["cirugia minimamente invasiva en lima"],
    sirveHoy: null,
    clustersExtra: ["cirugia-minimamente-invasiva", "cirugia-endoscopica-de-columna", "endoscopia-espinal"],
    porQue:
      "Es la keyword de oro numero 10 y la perdedora del unico desempate del plan 14-02: dos de " +
      "oro apuntaban a `/servicios` y gano `cirujano de columna lima` por puesto. Aquel plan la " +
      "dejo anotada como URL a crear en vez de forzarla dentro, y esta es esa URL. Su cluster " +
      "propio tiene una sola keyword, asi que toma secundarias de los tres clusters de la tecnica: " +
      "la endoscopia de columna ES el abordaje minimamente invasivo, no un tema vecino. Comparte " +
      "cero URLs del top 10 con `cirujano de columna lima`, con `cirugia de columna` y con " +
      "`traumatologia lima`.",
  },
  {
    url: "/blog/5-sintomas-de-columna-que-no-debes-ignorar",
    titulo: "5 síntomas de columna que no debes ignorar",
    origen: "src/content/blog.ts:32",
    estado: "viva",
    esPaginaSeo: true,
    familia: "contenido",
    tipoDePagina: "articulo-de-blog",
    topic: "ciatica",
    candidatas: ["ciatica"],
    sirveHoy: null,
    filtroDeTema: "ciatica",
    porQue:
      "Es la keyword de oro numero 7, con 8.100 de volumen, y golden-10.json la mandaba a un " +
      "`/blog/ciatica` inexistente. Crear esa URL al lado de este post seria fabricar la " +
      "canibalizacion que este plan viene a cerrar: el post YA trata el dolor irradiado por la " +
      "pierna y lo nombra ciatica con todas las letras (`src/content/blog.ts:62`). La de oro " +
      "aterriza en la URL que puede ganarla en vez de en una URL nueva que competiria con ella. " +
      "Medido: comparte cero URLs del top 10 con `hernia discal`, cero con `lumbalgia`, cero con " +
      "`cirugia de columna` y cero con `las mejores pastillas para la ciatica`.",
  },
  {
    url: "/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber",
    titulo: "¿Tienes miedo a operarte de la columna? 5 cosas que debes saber",
    origen: "src/content/blog.ts:169",
    estado: "viva",
    esPaginaSeo: true,
    familia: "contenido",
    tipoDePagina: "articulo-de-blog",
    topic: "cirugia-de-columna",
    candidatas: ["cirugia de columna"],
    sirveHoy: null,
    porQue:
      "Es el unico de los cuatro posts que sobrevive con angulo propio, y el angulo sale del " +
      "contenido: no explica una condicion sino como se decide operarse, con que tecnicas y como " +
      "es la recuperacion (`src/content/blog.ts:196` y `:208`). Esa es la consulta `cirugia de " +
      "columna`, que es el QUE del procedimiento, distinta del QUIEN que pelea `/servicios` con " +
      "`cirujano de columna lima`. Y no es una distincion de escritorio: medidas de a pares " +
      "comparten CERO URLs del top 10, igual que contra `hernia discal`, `escoliosis`, `estenosis " +
      "espinal`, `traumatologia lima` y `cirugia minimamente invasiva en lima`.",
  },
  {
    url: "/blog/artrosis",
    titulo: "Artrosis: qué es, cómo se trata y cuándo consultar",
    origen: "planificada por golden-10.json, puesto 6",
    estado: "planificada",
    esPaginaSeo: true,
    familia: "contenido",
    tipoDePagina: "guia",
    topic: "artrosis",
    candidatas: ["artrosis"],
    sirveHoy: null,
    filtroDeTema: "artrosis",
    porQue:
      "Es la keyword de oro numero 6 y ninguna URL viva la puede ganar: ni una de las cuatro guias " +
      "de servicio ni ninguno de los cuatro posts nombra la artrosis. Su top 10 medido pide guia, " +
      "que es el formato del silo del blog, y comparte cero URLs con `lumbalgia`, con `hernia " +
      "discal` y con `traumatologia lima`. Se planifica en vez de forzarla dentro de una pagina " +
      "que sirve otra condicion.",
  },
  {
    url: "/blog/lumbalgia",
    titulo: "Lumbalgia: por qué duele la zona lumbar y qué hacer",
    origen: "planificada por golden-10.json, puesto 8",
    estado: "planificada",
    esPaginaSeo: true,
    familia: "contenido",
    tipoDePagina: "guia",
    topic: "lumbalgia",
    candidatas: ["lumbalgia"],
    sirveHoy: null,
    filtroDeTema: "lumbalgia",
    porQue:
      "Es la keyword de oro numero 8. La guia de hernia discal lleva `lumbalgia o hernia discal` " +
      "de secundaria desde el plan 14-02, que es el diferencial, no la condicion: quien busca " +
      "`lumbalgia` a secas no esta comparandola con una hernia. Medido de a pares, `lumbalgia` " +
      "comparte cero URLs del top 10 con `hernia discal`, cero con `ciatica` y cero con " +
      "`traumatologia lima`, asi que son paginas distintas y no una.",
  },
  {
    url: "/preguntas-frecuentes",
    titulo: "Preguntas frecuentes",
    origen: "src/app/preguntas-frecuentes/page.tsx:9",
    estado: "viva",
    esPaginaSeo: true,
    familia: "hub",
    tipoDePagina: "pagina-de-preguntas",
    topic: "preguntas",
    candidatas: ["reumatologo o traumatologo"],
    sirveHoy: null,
    porQue:
      "Es la unica cabeza medida del universo que ES literalmente una pregunta frecuente, y su " +
      "cluster entero son reformulaciones de la misma duda: a que especialista corresponde cada " +
      "dolor. Calza con lo que la pagina ya publica (`src/app/preguntas-frecuentes/page.tsx:10`: " +
      "las dudas mas comunes sobre dolor de espalda y cirugia de columna). Comparte cero URLs del " +
      "top 10 con `traumatologia lima` de la home y cero con `artrosis`, asi que no le quita " +
      "SERP a ninguna.",
  },
];

/** Las URLs del mapa completo que este plan agrega, para el resumen de la corrida. */
export function urlsDelResto(): string[] {
  return [...RESTO.map((s) => s.url), ...SIN_PRIMARIA.map((f) => f.url)].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}
