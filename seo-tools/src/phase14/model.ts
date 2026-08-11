/**
 * El tipo del mapa keyword -> URL. Uno solo para los cuatro planes de la fase 14.
 *
 * POR QUE UN SOLO TIPO Y NO UNO POR PLAN.
 *
 * El plan 14-01 escribe una fila, el 14-02 escribe las nueve del handoff, el 14-03 completa
 * el resto del sitio y el 14-04 cruza el mapa contra si mismo para cerrar MAP-02. Los cuatro
 * leen y escriben el MISMO archivo, `data/url-map.jsonl`. Si cada plan definiera su forma, el
 * cruce de canibalizacion del 14-04 compararia campos que en la mitad de las filas no existen
 * y no encontraria nada: un falso verde, que es el peor resultado posible de una auditoria.
 *
 * DOS PARES DE CAMPOS QUE PARECEN UNO Y NO LO SON, y confundirlos rompe la fase entera:
 *
 *   1. `tipoDePagina` es lo que la URL ES; `tipoExigidoPorSerp` es lo que Google PREMIA hoy en
 *      el top 10 de su keyword primaria (MAP-04). Cuando difieren, esa diferencia es el
 *      hallazgo: la pagina esta compitiendo con el formato equivocado. Colapsarlos en un campo
 *      borraria justamente el dato que la fase viene a producir.
 *   2. `keywordPrimaria` es el texto que se busca y que se escribe en el documento del cliente;
 *      `keywordPrimariaKey` es su forma normalizada y solo sirve para deduplicar y para el
 *      upsert. Escribir la clave en el Sheet le entregaria al cliente el texto sin tildes.
 *
 * `clusterFuente` distingue evidencia de inferencia y viaja hasta el final a proposito: `serp`
 * significa que Google valido la agrupacion compartiendo URLs en el top 10, `texto` que se
 * infirio por parecido. Leer las dos como si fueran lo mismo es leer mal el mapa.
 */

/** Si la URL existe hoy en el sitio o si todavia esta por crearse. */
export type EstadoDeUrl = "viva" | "planificada";

/**
 * Que hacer con el contenido de la URL.
 *
 * `reescribir` es la consecuencia directa de D-01: v1.1 publico las paginas antes de que esta
 * fase asignara keywords, asi que una pagina viva puede estar bien hecha y aun asi competir
 * por la keyword equivocada.
 */
export type AccionDeUrl = "dejar" | "reescribir" | "crear";

/** Veredicto de inventario que el documento del cliente pide en su propia columna. */
export type DisposicionDeUrl = "dejar" | "actualizar" | "eliminar";

/** Como se supo el cluster: medido contra Google o inferido por parecido de texto. */
export type FuenteDeCluster = "serp" | "texto";

/** Minimo y maximo de keywords secundarias por URL, exigidos por MAP-01. */
export const MIN_SECUNDARIAS = 3;
export const MAX_SECUNDARIAS = 5;

export interface AsignacionDeUrl {
  /** Ruta absoluta dentro del sitio, empezando por barra. Nunca la URL completa. */
  readonly url: string;
  readonly titulo: string;
  readonly estado: EstadoDeUrl;
  /** Archivo, y linea cuando se conoce, de donde se dedujo la URL. Procedencia auditable. */
  readonly origen: string;
  /** Si la URL pelea por una keyword o si existe por otra razon (legal, conversion, tecnica). */
  readonly esPaginaSeo: boolean;
  /** Texto tal como se busca. Va al documento del cliente. */
  readonly keywordPrimaria: string;
  /** Forma normalizada. Solo para deduplicar y para el upsert. NUNCA se escribe al cliente. */
  readonly keywordPrimariaKey: string;
  readonly secundarias: readonly string[];
  readonly intent: string;
  /** Lo que la URL es. */
  readonly tipoDePagina: string;
  /** Lo que la SERP premia. null cuando la keyword primaria no tiene SERP medida. */
  readonly tipoExigidoPorSerp: string | null;
  readonly cluster: string | null;
  readonly clusterFuente: FuenteDeCluster | null;
  readonly accion: AccionDeUrl;
  readonly dejarActualizarEliminar: DisposicionDeUrl;
  /** URL canonica absoluta. */
  readonly canonical: string;
  /** Tema al que la URL pertenece dentro del sitio. Alimenta la matriz de enlazado del 14-04. */
  readonly topic: string;
  /** Por que esta keyword y no otra, en prosa. Se lee sin abrir ningun otro archivo. */
  readonly justificacion: string;
}

const ESTADOS: ReadonlySet<string> = new Set<EstadoDeUrl>(["viva", "planificada"]);
const ACCIONES: ReadonlySet<string> = new Set<AccionDeUrl>(["dejar", "reescribir", "crear"]);
const DISPOSICIONES: ReadonlySet<string> = new Set<DisposicionDeUrl>([
  "dejar",
  "actualizar",
  "eliminar",
]);
const FUENTES: ReadonlySet<string> = new Set<FuenteDeCluster>(["serp", "texto"]);

/** Error de forma del dataset, con la URL y el campo nombrados para poder arreglarlo. */
export class AsignacionInvalida extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "AsignacionInvalida";
  }
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() !== "" ? valor : null;
}

/**
 * Valida un registro suelto contra el contrato del mapa.
 *
 * Se valida ANTES de tocar el documento del cliente y no despues: un registro con
 * `secundarias` vacio o con `keywordPrimaria` en blanco escribiria celdas vacias sobre lo que
 * ya esta escrito sin lanzar nada, que es exactamente el accidente que `omitirCamposAusentes`
 * existe para atajar. Las dos defensas trabajan juntas.
 */
export function validarAsignacion(registro: unknown, donde: string): AsignacionDeUrl {
  if (registro === null || typeof registro !== "object" || Array.isArray(registro)) {
    throw new AsignacionInvalida(`${donde}: no es un objeto.`);
  }
  const r = registro as Record<string, unknown>;

  const url = texto(r["url"]);
  if (url === null || !url.startsWith("/")) {
    throw new AsignacionInvalida(
      `${donde}: "url" tiene que ser una ruta del sitio que empiece con barra, y llego ` +
        `${JSON.stringify(r["url"])}.`,
    );
  }

  const exigirTexto = (campo: string): string => {
    const valor = texto(r[campo]);
    if (valor === null) {
      throw new AsignacionInvalida(`${donde} (${url}): falta "${campo}" o vino vacio.`);
    }
    return valor;
  };

  const exigirEnum = (campo: string, admitidos: ReadonlySet<string>): string => {
    const valor = exigirTexto(campo);
    if (!admitidos.has(valor)) {
      throw new AsignacionInvalida(
        `${donde} (${url}): "${campo}" vale ${JSON.stringify(valor)} y solo admite ` +
          `${[...admitidos].map((x) => JSON.stringify(x)).join(", ")}.`,
      );
    }
    return valor;
  };

  const secundariasCrudas = r["secundarias"];
  if (!Array.isArray(secundariasCrudas)) {
    throw new AsignacionInvalida(`${donde} (${url}): "secundarias" tiene que ser un arreglo.`);
  }
  const secundarias = secundariasCrudas.map((s, i) => {
    const valor = texto(s);
    if (valor === null) {
      throw new AsignacionInvalida(`${donde} (${url}): la secundaria ${i} vino vacia.`);
    }
    return valor;
  });
  if (secundarias.length < MIN_SECUNDARIAS || secundarias.length > MAX_SECUNDARIAS) {
    throw new AsignacionInvalida(
      `${donde} (${url}): trae ${secundarias.length} secundarias y MAP-01 exige de ` +
        `${MIN_SECUNDARIAS} a ${MAX_SECUNDARIAS}.`,
    );
  }

  const esPaginaSeo = r["esPaginaSeo"];
  if (typeof esPaginaSeo !== "boolean") {
    throw new AsignacionInvalida(`${donde} (${url}): "esPaginaSeo" tiene que ser booleano.`);
  }

  const tipoExigido = r["tipoExigidoPorSerp"];
  const cluster = r["cluster"];
  const clusterFuente = r["clusterFuente"];
  if (clusterFuente !== null && !FUENTES.has(String(clusterFuente))) {
    throw new AsignacionInvalida(
      `${donde} (${url}): "clusterFuente" vale ${JSON.stringify(clusterFuente)} y solo admite ` +
        `"serp", "texto" o null. La marca distingue evidencia de inferencia y no se puede perder.`,
    );
  }

  return {
    url,
    titulo: exigirTexto("titulo"),
    estado: exigirEnum("estado", ESTADOS) as EstadoDeUrl,
    origen: exigirTexto("origen"),
    esPaginaSeo,
    keywordPrimaria: exigirTexto("keywordPrimaria"),
    keywordPrimariaKey: exigirTexto("keywordPrimariaKey"),
    secundarias,
    intent: exigirTexto("intent"),
    tipoDePagina: exigirTexto("tipoDePagina"),
    tipoExigidoPorSerp: texto(tipoExigido),
    cluster: texto(cluster),
    clusterFuente: clusterFuente === null ? null : (String(clusterFuente) as FuenteDeCluster),
    accion: exigirEnum("accion", ACCIONES) as AccionDeUrl,
    dejarActualizarEliminar: exigirEnum(
      "dejarActualizarEliminar",
      DISPOSICIONES,
    ) as DisposicionDeUrl,
    canonical: exigirTexto("canonical"),
    topic: exigirTexto("topic"),
    justificacion: exigirTexto("justificacion"),
  };
}
