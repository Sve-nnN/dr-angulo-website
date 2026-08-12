/**
 * Los tipos del paquete on-page. Uno solo para los siete planes de la fase 15.
 *
 * POR QUE UN SOLO JUEGO DE TIPOS.
 *
 * El plan 15-01 recorre una URL de punta a punta, el 15-02 convierte las reglas de
 * humanizacion en compuerta, y del 15-03 al 15-06 se escriben las quince paginas que faltan.
 * Los seis leen y escriben el MISMO par de datasets: `data/onpage-serp.json` y
 * `data/copy-guias.json`. Si cada plan definiera su forma, el auditor de duplicados del final
 * compararia campos que en la mitad de las filas no existen y no encontraria nada. Un falso
 * verde es el peor resultado posible de una auditoria.
 *
 * TRES DISTINCIONES QUE PARECEN UNA Y NO LO SON:
 *
 *   1. `tipo` de una seccion de copy es que clase de afirmacion contiene: `clinico` significa
 *      que alguien con formacion medica tiene que leerla antes de publicarla, `operativo` que
 *      son horarios, direcciones y llamadas a la accion. `aprobacion` es el estado de ese
 *      permiso. Toda seccion clinica nace con `pendiente-doctor` (D-08), y ese sello no lo
 *      levanta este workstream: lo levanta el doctor por escrito.
 *
 *   2. `origen` de un encabezado distingue de donde salio: `pregunta-serp` es lenguaje real de
 *      paciente copiado literal de la SERP de Lima, `esqueleto` es la estructura de la guia,
 *      `busqueda-relacionada` sale del pie de la SERP y `secundaria-del-mapa` de la fase 14.
 *      Colapsarlos borraria justo lo que ONPAGE-02 viene a producir: la evidencia de que la
 *      jerarquia sale de la SERP y no de la intuicion de quien escribe.
 *
 *   3. `documentos` y `de` de una entidad son numerador y denominador de la misma fraccion:
 *      en cuantos de los organicos medidos aparecio el termino, sobre cuantos habia. Guardar
 *      solo el numerador convertiria "5 de 7" y "5 de 10" en el mismo dato, que no lo son.
 */

/** Que hacer con la URL. Es el mismo vocabulario de `url-map.jsonl` de la fase 14. */
export type AccionDeUrl = "dejar" | "reescribir" | "crear" | "redirigir";

/**
 * Formato de pagina que la SERP exige.
 *
 * No es el tipo de pagina de la fase 13, que describe lo que rankea. Este es el molde con el
 * que se escribe: cuantas secciones lleva, en que orden y con que minimo de palabras.
 */
export type FormatoDePagina = "guia-clinica" | "pagina-de-servicio" | "ficha-de-sede";

/** De donde salio un encabezado. La procedencia viaja con el dato, como en las fases 13 y 14. */
export type OrigenDeEncabezado =
  | "esqueleto"
  | "pregunta-serp"
  | "busqueda-relacionada"
  | "secundaria-del-mapa";

/** Que clase de termino es. Separa el vocabulario clinico del ruido de navegacion. */
export type ClaseDeEntidad = "clinica" | "anatomica" | "procedimiento" | "generica";

/** Que clase de afirmacion contiene una seccion de copy. */
export type TipoDeSeccion = "clinico" | "operativo";

/**
 * Estado del permiso para publicar una seccion.
 *
 * `no-requiere` es para lo operativo: una direccion o un horario no necesita ojo clinico.
 * `pendiente-doctor` es el unico valor admitido para una seccion clinica mientras esta fase
 * este viva. `aprobado-doctor` existe para que v1.1 sepa como se veria una seccion liberada,
 * y NINGUNA fila de v1.2 lo escribe.
 */
export type EstadoDeAprobacion = "no-requiere" | "pendiente-doctor" | "aprobado-doctor";

/** Title, meta, H1 y la orden de que hacer con la URL. Lo que v1.1 pega tal cual. */
export interface FilaOnPage {
  /** Ruta del sitio empezando por barra. Nunca la URL completa. */
  readonly url: string;
  readonly accion: AccionDeUrl;
  /** Texto tal como se busca. `null` solo en las URLs que declararon no competir. */
  readonly keywordPrimaria: string | null;
  readonly title: string;
  readonly metaDescription: string;
  readonly h1: string;
  /** Por que ese H1 y no otro, en prosa. Se lee sin abrir ningun otro archivo (D-14). */
  readonly h1Origen: string;
  /** Ruta destino del 301. Obligatorio cuando la accion es `redirigir`. */
  readonly redirigeA: string | null;
}

/** Un encabezado de la jerarquia, con su procedencia al lado. */
export interface JerarquiaDeUrl {
  /** 2 o 3. La fase no emite niveles mas profundos: un H4 en una guia no lo lee nadie. */
  readonly nivel: 2 | 3;
  /** El texto tal como va a ir en la pagina. */
  readonly texto: string;
  readonly origen: OrigenDeEncabezado;
  /**
   * El texto crudo del que salio, cuando difiere de `texto`.
   *
   * Una pregunta de la SERP va literal y aca se repite; una busqueda relacionada se reescribe
   * para que se lea como encabezado y aca queda la cadena original. Sin este campo no habria
   * forma de auditar si un encabezado respeta el lenguaje del paciente o lo invento.
   */
  readonly literal: string | null;
  /** Clave del hueco del esqueleto donde vive. Sirve para agrupar los H3 bajo su H2. */
  readonly seccion: string;
}

/** Un termino que el top 10 repite y que la pagina tiene que nombrar (ONPAGE-03). */
export interface EntidadObligatoria {
  readonly termino: string;
  /** En cuantos organicos aparecio. Numerador. */
  readonly documentos: number;
  /** Cuantos organicos se midieron. Denominador. */
  readonly de: number;
  /** Las posiciones concretas donde aparecio, ordenadas. Su largo es igual a `documentos`. */
  readonly posiciones: readonly number[];
  readonly clase: ClaseDeEntidad;
}

/** Una afirmacion que alguien tiene que respaldar antes de publicarla. */
export interface AfirmacionDeCopy {
  readonly texto: string;
  /**
   * De donde salio. Obligatoria y no vacia cuando el texto trae una cifra (D-10).
   *
   * Una cifra sin fuente es exactamente el dato que nadie puede desmentir despues, y en
   * contenido YMYL eso no es un descuido de formato.
   */
  readonly fuente: string;
}

/** Una seccion redactada del cuerpo de la pagina. */
export interface SeccionDeCopy {
  /** Clave estable del hueco del esqueleto. Cruza contra `JerarquiaDeUrl.seccion`. */
  readonly clave: string;
  readonly nivel: 2 | 3;
  readonly titulo: string;
  readonly tipo: TipoDeSeccion;
  readonly aprobacion: EstadoDeAprobacion;
  readonly parrafos: readonly string[];
  readonly afirmaciones: readonly AfirmacionDeCopy[];
  /** Keywords del mapa que esta seccion cubre. Cruza contra las secundarias de la fase 14. */
  readonly keywordsCubiertas: readonly string[];
  /** Entidades obligatorias que esta seccion nombra. */
  readonly entidadesCubiertas: readonly string[];
}

/** Una secundaria del mapa y el encabezado que la cubre. Ninguna puede quedar sin cubrir (D-15). */
export interface CoberturaDeSecundaria {
  readonly keyword: string;
  /** Texto del encabezado que la cubre. `null` es un fallo de la fila, no un estado valido. */
  readonly cubiertaPor: string | null;
}

/**
 * Una busqueda relacionada de la SERP y el encabezado que ya la responde.
 *
 * La mayoria de las ocho relacionadas de una captura son la primaria mas una palabra, o sea
 * la seccion que el esqueleto ya tiene. Emitirlas igual como encabezado convertiria el indice
 * en una lista de keywords pegadas. Registrarlas aca deja la evidencia de que se miraron una
 * por una sin ensuciar la pagina.
 */
export interface CoberturaDeRelacionada {
  readonly busqueda: string;
  /** Texto del encabezado que la cubre. Nunca null: si nada la cubria, se emitio un H3. */
  readonly cubiertaPor: string;
}

/** Una pregunta de la SERP que no entro a la jerarquia, con el motivo escrito. */
export interface PreguntaSinUsar {
  readonly pregunta: string;
  /** Prosa minima. Una etiqueta como "no aplica" no deja auditar nada. */
  readonly motivo: string;
}

/** Prosa minima de un motivo para que sea auditable y no una etiqueta. */
export const MINIMO_DE_MOTIVO = 20;

/** El paquete completo de una URL: todo lo que v1.1 necesita sin abrir otro archivo. */
export interface PaqueteDeUrl {
  readonly fila: FilaOnPage;
  readonly formato: FormatoDePagina;
  readonly minimoDePalabras: number;
  readonly secundarias: readonly string[];
  readonly jerarquia: readonly JerarquiaDeUrl[];
  readonly entidades: readonly EntidadObligatoria[];
  readonly entidadesInsuficientes: boolean;
  /** Umbral de frecuencia documental que se termino aplicando. Se registra siempre. */
  readonly umbralAplicado: number;
  readonly coberturaDeSecundarias: readonly CoberturaDeSecundaria[];
  readonly coberturaDeRelacionadas: readonly CoberturaDeRelacionada[];
  readonly preguntasSinUsar: readonly PreguntaSinUsar[];
  readonly secciones: readonly SeccionDeCopy[];
  /** Que leer primero en la ronda de revision del doctor (D-09). */
  readonly guiaParaElDoctor: string;
  /** Keyword, cuantos organicos y cuando se capturo la SERP de la que salio todo esto. */
  readonly fuente: FuenteDeLaSerp;
}

/** Procedencia de la captura. Sin esto el paquete seria una opinion sin respaldo. */
export interface FuenteDeLaSerp {
  readonly keyword: string;
  readonly organicos: number;
  readonly preguntas: number;
  readonly relacionadas: number;
  /** Marca del envelope de cache, NUNCA la del reloj: dos corridas dan el mismo archivo. */
  readonly capturadaEn: string | null;
}

/** Error de forma del dataset, con la URL y el campo nombrados para poder arreglarlo. */
export class PaqueteInvalido extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "PaqueteInvalido";
  }
}
