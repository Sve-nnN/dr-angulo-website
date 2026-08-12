/**
 * Asignador de keywords a URLs. Funcion pura: entra el dato medido, sale el mapa.
 *
 * NADA DE RED Y NADA DE ESCRITURA. Este modulo decide; `assign-run.ts` es el que lee archivos
 * y el que escribe `data/url-map.jsonl`. La separacion no es estetica: la decision es lo unico
 * que hay que poder correr mil veces en una prueba sin tocar el disco ni la cuota.
 *
 * LAS CUATRO REGLAS QUE GOBIERNAN EL ORDEN, y el orden importa:
 *
 *   1. PRIORIDAD DE LAS 10 DE ORO. Si una keyword de oro tiene una URL que la puede ganar, esa
 *      URL la recibe de primaria. Si ninguna la puede ganar, NO se fuerza dentro de una URL
 *      existente: queda anotada como URL a crear y la resuelve el plan 14-03. Meter una de oro
 *      a la fuerza en una pagina que sirve otra cosa produce una fila que se ve bien en el
 *      Sheet y una pagina que no rankea ninguna de las dos.
 *
 *   2. DESEMPATE POR ORO (D-06). Cuando dos URLs pelean la misma primaria gana la que sirve a
 *      la keyword de oro, y el registro guarda las dos candidatas, la ganadora y el motivo. Un
 *      desempate que no queda escrito es un desempate que nadie puede auditar despues.
 *
 *   3. FUSION SOLO POR SOLAPE PAR A PAR (D-05). Antes de considerar que dos URLs sirven al
 *      mismo tema se le pide el veredicto a `overlap.ts`, que cuenta URLs compartidas del top
 *      10 real. LA PERTENENCIA A UN CLUSTER NO ES ENTRADA DE ESA DECISION Y TAMPOCO LO ES ACA:
 *      el cluster mayor de la fase 13 junto 41 cabezas por transitividad y las tres que se
 *      eligieron de ahi comparten CERO URLs de a pares.
 *
 *   4. LAS SECUNDARIAS SALEN DEL CLUSTER DE LA PRIMARIA, entre tres y cinco. Con menos de tres
 *      candidatas legitimas el asignador FALLA. Rellenar con lo que sea para llegar al minimo
 *      es exactamente la clase de fila que pasa la validacion y no significa nada.
 *
 * DOS EXCLUSIONES DURAS QUE NO SE NEGOCIAN:
 *   - D-10: marca de competidor perfilado o codigo CIE-10, ni de primaria ni de secundaria.
 *     La marca ajena atrae a quien ya decidio ir a otro lado, y el codigo clinico atrae a
 *     estudiantes de medicina. Las dos traen volumen y ninguna trae paciente.
 *   - D-09: `las mejores pastillas para la ciatica` es intencion de automedicacion. Solo puede
 *     vivir en una URL de captacion; en una de servicio o de conversion seria el consultorio
 *     recomendando pastillas, que es justo lo que la restriccion YMYL del proyecto prohibe.
 *
 * D-04 parte en dos las keywords con lugar: la que trae MODIFICADOR DE DISTRITO no genera URL
 * propia y entra de secundaria en la URL de Lima que le corresponde (o de primaria en la sede
 * que YA existe en ese distrito, que tampoco es generar una URL). La que trae NOMBRE DE CLINICA
 * si puede ser primaria de la URL de esa sede.
 */

import { MIN_SECUNDARIAS, MAX_SECUNDARIAS, type AccionDeUrl, type AsignacionDeUrl, type DisposicionDeUrl, type EstadoDeUrl, type FuenteDeCluster } from "./model.js";
import { veredictoDeFusion, type IndiceDeSerp, type VeredictoDeFusion } from "./overlap.js";

/** Dominio canonico del sitio. Sale de la misma constante que usa el resto de la fase. */
const SITIO = "https://drangulocolumna.com";

/** Prosa minima para que una justificacion sea auditable y no una etiqueta. */
const MINIMO_DE_PROSA = 40;

// ---------------------------------------------------------------------------------------------
// Formas de los datos que entran. Los nombres son los REALES de cada archivo de la fase 13:
// leer una linea antes de tocar cualquiera de estos campos es obligatorio, porque un nombre
// inventado no rompe nada, devuelve `undefined` y produce un mapa vacio que parece lleno.
// ---------------------------------------------------------------------------------------------

export interface RegistroDeKeyword {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly clusterFuente?: string | null;
  readonly intent: string;
  readonly metricas?: { readonly searchVolume: number | null } | undefined;
}

export interface KeywordDeOro {
  readonly puesto: number;
  readonly keyword: string;
  readonly keywordKey: string;
  readonly cluster: string;
  readonly tipoDePagina?: string;
  readonly intent?: string;
  readonly valorDeNegocio: number;
  readonly volumenAhrefs: number | null;
  readonly keywordDifficulty: number | null;
  readonly trafficPotential: number | null;
  readonly urlCandidata?: { readonly url: string } | undefined;
}

export interface SedeDeOro {
  readonly sede: string;
  readonly keyword: string | null;
  readonly keywordKey: string | null;
  readonly nivelDeAlcance: string | null;
}

export interface RegistroDePuntoDulce {
  readonly keywordKey: string;
  readonly nivel: string;
  readonly alcanzable: boolean;
}

export interface TipoDeCabeza {
  readonly keywordKey: string;
  readonly tipoDePagina: string;
  readonly confianza: string;
  readonly repartoDeTipos: Readonly<Record<string, number>>;
  readonly posicionesMedidas: number;
}

export interface UrlDelInventario {
  readonly url: string;
  readonly titulo: string;
  readonly estado: string;
  readonly mapeable: boolean;
  readonly origen: string;
}

/**
 * Lo que se declara de cada URL antes de asignar.
 *
 * `candidatas` va en orden de preferencia y NO es la asignacion: es la lista de keywords que
 * esta URL puede pelear. Quien gana lo decide el asignador, con el desempate escrito.
 *
 * `sirveHoy` es la keyword que la pagina PUBLICADA responde de verdad hoy, y es lo unico que
 * permite distinguir `dejar` de `reescribir` sin adivinar. `null` significa que no sirve ninguna.
 */
export interface EspecificacionDeUrl {
  readonly url: string;
  readonly titulo: string;
  readonly origen: string;
  readonly estado: EstadoDeUrl;
  readonly esPaginaSeo: boolean;
  readonly familia: "home" | "hub" | "servicio" | "sede" | "contenido" | "conversion";
  readonly tipoDePagina: string;
  readonly topic: string;
  readonly candidatas: readonly string[];
  readonly sirveHoy: string | null;
  /** Por que esta URL pelea estas keywords, en prosa. Sin esto la fila no se emite. */
  readonly porQue: string;
  /** Sede: distrito que la URL sirve. Habilita la entrada de secundarias por D-04. */
  readonly distrito?: string | undefined;
  /** Sede: clinica que la URL sirve. Habilita la primaria con nombre de clinica por D-04. */
  readonly clinica?: string | undefined;
  /** Clusters extra de los que esta URL puede tomar secundarias, con su motivo. */
  readonly clustersExtra?: readonly string[] | undefined;
  /**
   * Texto que toda secundaria de esta URL tiene que contener.
   *
   * Existe por el mismo motivo que `overlap.ts`: el cluster mayor de la fase 13 junto 41 cabezas
   * por transitividad y adentro conviven ortopedia infantil, cirugia de columna y traumatologia
   * general. Sin este filtro, la pagina de ortopedia infantil se llevaria de secundarias los
   * terminos de columna de adultos, que es exactamente la mezcla que el cluster no distingue.
   */
  readonly filtroDeTema?: string | undefined;
  /** Slug anterior, cuando la URL se renombro. Viaja hasta el handoff. */
  readonly renombradaDesde?: string | undefined;
}

export interface EntradaDeAsignacion {
  readonly especificaciones: readonly EspecificacionDeUrl[];
  readonly universo: readonly RegistroDeKeyword[];
  readonly oro: readonly KeywordDeOro[];
  readonly sedesDeOro: readonly SedeDeOro[];
  readonly puntoDulce: readonly RegistroDePuntoDulce[];
  readonly tiposDePagina: readonly TipoDeCabeza[];
  readonly inventario: readonly UrlDelInventario[];
  readonly indice: IndiceDeSerp;
  readonly umbralDeFusion?: number | undefined;
}

export interface ConflictoResuelto {
  readonly keyword: string;
  readonly candidatas: readonly string[];
  readonly ganadora: string;
  readonly perdedora: string;
  readonly motivo: string;
  /** Que pasa con la URL que perdio: toma otra primaria, o queda para el plan 14-03. */
  readonly destinoDeLaPerdedora: "otra-primaria" | "sin-primaria";
}

export interface ResultadoDeAsignacion {
  readonly asignaciones: readonly AsignacionDeUrl[];
  readonly conflictos: readonly ConflictoResuelto[];
  /** Todos los veredictos de solape que se consultaron, con su evidencia. Auditables. */
  readonly veredictos: readonly VeredictoDeFusion[];
  /** Keywords de oro que ninguna URL pudo ganar. Quedan para el plan 14-03. */
  readonly oroSinUrl: readonly string[];
}

/** Falla de asignacion. Nombra la URL y el motivo para poder arreglarlo sin adivinar. */
export class ErrorDeAsignacion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorDeAsignacion";
  }
}

// ---------------------------------------------------------------------------------------------
// D-10: exclusiones duras.
// ---------------------------------------------------------------------------------------------

/**
 * Marcas ajenas que nunca pueden quedar en el mapa.
 *
 * Los cinco primeros son los competidores perfilados de D-11 (`data/competitors.json`), escritos
 * como los escribe la gente y no como dominio. Las clinicas que siguen aparecen dentro de los
 * clusters de sede del doctor porque comparten SERP con ellas, y no son sedes suyas: una
 * secundaria que nombre a Montefiori manda a la pagina a pelear por el paciente de otra clinica.
 */
const MARCAS_AJENAS: readonly string[] = [
  "carranza",
  "cieza",
  "laos",
  "munguia",
  "arthromeds",
  "san bernardo",
  "arthrosalud",
  "montefiori",
  "san jose",
  "san josé",
  "anglo americana",
  "angloamericana",
  "stella maris",
  "glinsa",
  "viza",
  "hyrax",
  "tecnisalud",
  "delgado",
  "javier prado",
  "internacional",
];

/** Codigo clinico: trae estudiantes de medicina, no pacientes. */
const CIE10 = /\bcie[\s-]?10\b|\b[a-z]\d{2}(\.\d)?\s*cie/i;

/**
 * Devuelve el motivo de exclusion de una keyword, o `null` si es limpia.
 *
 * Devuelve el MOTIVO y no un booleano a proposito: cuando una keyword con volumen alto no
 * aparece en el mapa, la pregunta que sigue siempre es por que, y la respuesta tiene que estar
 * en el codigo y no en la memoria de quien lo escribio.
 */
export function motivoDeExclusion(keyword: string): string | null {
  const texto = keyword.toLowerCase();
  if (CIE10.test(texto)) {
    return "codigo CIE-10: atrae busqueda de estudio clinico, no de paciente (D-10)";
  }
  for (const marca of MARCAS_AJENAS) {
    if (texto.includes(marca)) {
      return `nombra la marca ajena "${marca}": atrae a quien ya eligio otro consultorio (D-10)`;
    }
  }
  if (MODIFICADORES_DE_ESTUDIO.test(texto)) {
    return "modificador de estudio o traduccion: quien lo busca baja material, no agenda consulta";
  }
  return null;
}

/**
 * Modificadores que delatan a alguien que no es paciente del consultorio.
 *
 * Es la misma logica de D-10 —el CIE-10 lo busca quien factura, no quien tiene dolor— aplicada a
 * los modificadores que quedan: "pdf" y "ppt" los busca un estudiante bajando material,
 * "en ingles" y "in english" quien necesita el termino traducido, y "wikipedia" quien ya eligio
 * donde va a leer. Ninguno va a agendar una consulta en Lima, y una guia clinica que los persiga
 * gasta una ranura de las cinco en trafico que no convierte.
 */
const MODIFICADORES_DE_ESTUDIO =
  /\bpdf\b|\bppt\b|\bslideshare\b|\bwikipedia\b|\bingl[eé]s\b|\bin english\b|\blibros?\b|\bmonografia\b|\bmonografía\b|\brosselli\b|\btachdjian\b/i;

/** D-09: keywords de automedicacion, admisibles solo en contenido de captacion. */
const AUTOMEDICACION = /\bpastillas?\b|\bmedicamentos? para\b|\bremedios? casero/i;

export function esExclusivaDeCaptacion(keyword: string): boolean {
  return AUTOMEDICACION.test(keyword.toLowerCase());
}

// ---------------------------------------------------------------------------------------------
// D-04: lugar. Distrito y clinica no son la misma cosa y no se tratan igual.
// ---------------------------------------------------------------------------------------------

const DISTRITOS: readonly string[] = [
  "la molina",
  "san isidro",
  "santiago de surco",
  "surco",
  "miraflores",
  "san borja",
  "jesus maria",
  "jesús maría",
  "magdalena",
  "pueblo libre",
  "chacarilla",
  "monterrico",
];

const CLINICAS_PROPIAS: readonly string[] = [
  "clínica ricardo palma",
  "clinica ricardo palma",
  "clínica sanna",
  "clinica sanna",
  "clínica tezza",
  "clinica tezza",
  "clínica padre luis tezza",
  "clinica padre luis tezza",
  "sanna la molina",
];

/** Distrito que la keyword nombra, o `null`. El mas largo gana, para que surco no tape a santiago de surco. */
export function distritoDe(keyword: string): string | null {
  const texto = keyword.toLowerCase();
  let mejor: string | null = null;
  for (const d of DISTRITOS) {
    if (texto.includes(d) && (mejor === null || d.length > mejor.length)) mejor = d;
  }
  return mejor;
}

/** Clinica que la keyword nombra, o `null`. */
export function clinicaDe(keyword: string): string | null {
  const texto = keyword.toLowerCase();
  let mejor: string | null = null;
  for (const c of CLINICAS_PROPIAS) {
    if (texto.includes(c) && (mejor === null || c.length > mejor.length)) mejor = c;
  }
  return mejor;
}

function normalizar(valor: string): string {
  return valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/**
 * Palabras que no cambian la consulta. Se quitan antes de comparar dos keywords entre si.
 *
 * NO incluye ningun nombre de lugar, y es deliberado: D-04 manda que las geo de distrito entren
 * como secundarias de la URL que sirve ese distrito, asi que colapsar "ortopedia infantil" con
 * "ortopedia infantil surco" borraria el termino que D-04 quiere conservar.
 */
const VACIAS = new Set([
  "a",
  "al",
  "con",
  "de",
  "del",
  "el",
  "en",
  "la",
  "las",
  "lo",
  "los",
  "o",
  "para",
  "por",
  "que",
  "un",
  "una",
  "y",
]);

function palabrasSignificativas(keyword: string): Set<string> {
  return new Set(
    normalizar(keyword)
      .replace(/[^a-z0-9ñ\s]/g, " ")
      .split(/\s+/)
      .filter((p) => p !== "" && !VACIAS.has(p)),
  );
}

/**
 * Si dos keywords son la misma consulta escrita distinto.
 *
 * Dos criterios, porque hay dos formas de decir lo mismo y una sola no las agarra:
 *
 *   1. Contencion literal: "cirugia de escoliosis" dentro de "cirugia de escoliosis en lima".
 *   2. Mismo conjunto de palabras significativas: "ciatica o hernia discal" y "hernia discal o
 *      ciatica" son la MISMA busqueda con las palabras cambiadas de orden, y ninguna contiene a
 *      la otra. Sin este segundo criterio las dos entran al mapa y gastan dos de las cinco
 *      ranuras en un solo angulo, que es exactamente lo que MAP-01 pide evitar cuando exige de
 *      tres a cinco secundarias: pide tres a cinco ANGULOS, no tres a cinco cadenas distintas.
 */
function mismaConsulta(a: string, b: string): boolean {
  const pa = palabrasSignificativas(a);
  const pb = palabrasSignificativas(b);
  if (pa.size === 0 || pa.size !== pb.size) return false;
  for (const p of pa) if (!pb.has(p)) return false;
  return true;
}

function mismoAngulo(a: string, b: string): boolean {
  const ta = normalizar(a);
  const tb = normalizar(b);
  if (ta.includes(tb) || tb.includes(ta)) return true;
  return mismaConsulta(a, b);
}

function mismaCosa(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  return normalizar(a) === normalizar(b) || normalizar(a).includes(normalizar(b)) || normalizar(b).includes(normalizar(a));
}

// ---------------------------------------------------------------------------------------------
// El asignador.
// ---------------------------------------------------------------------------------------------

interface Pretension {
  readonly spec: EspecificacionDeUrl;
  readonly keyword: RegistroDeKeyword;
  readonly oro: KeywordDeOro | undefined;
  /** true cuando la keyword de oro apunta explicitamente a esta URL. */
  readonly oroApuntaAca: boolean;
}

function volumen(k: RegistroDeKeyword): number {
  const v = k.metricas?.searchVolume;
  return typeof v === "number" ? v : -1;
}

/**
 * Comprueba que una keyword con lugar tiene derecho a ser primaria de esta URL (D-04).
 *
 * El nombre de clinica si habilita una primaria de sede. El modificador de distrito NO genera
 * URL propia: solo puede encabezar una sede que YA existe en ese distrito, que es otra cosa.
 */
function admiteComoPrimaria(spec: EspecificacionDeUrl, keyword: string): string | null {
  const clinica = clinicaDe(keyword);
  if (clinica !== null) {
    if (spec.familia !== "sede") {
      return `"${keyword}" nombra una clinica y solo puede encabezar una URL de sede (D-04); ${spec.url} es de familia ${spec.familia}.`;
    }
    if (!mismaCosa(clinica, spec.clinica)) {
      return `"${keyword}" nombra ${clinica} y ${spec.url} sirve a ${spec.clinica ?? "ninguna clinica declarada"} (D-04).`;
    }
    return null;
  }

  const distrito = distritoDe(keyword);
  if (distrito !== null) {
    if (spec.familia !== "sede" || spec.estado !== "viva") {
      return (
        `"${keyword}" trae modificador de distrito y por D-04 no genera URL propia: entra de ` +
        `secundaria en la URL de Lima que corresponda. ${spec.url} no es una sede viva.`
      );
    }
    if (!mismaCosa(distrito, spec.distrito)) {
      return `"${keyword}" es de ${distrito} y ${spec.url} sirve a ${spec.distrito ?? "ningun distrito declarado"} (D-04).`;
    }
  }
  return null;
}

function elegirSecundarias(
  spec: EspecificacionDeUrl,
  primaria: RegistroDeKeyword,
  universo: readonly RegistroDeKeyword[],
  puntoDulce: ReadonlyMap<string, RegistroDePuntoDulce>,
  primariasAjenas: ReadonlySet<string>,
  reservadasPorOro: ReadonlySet<string>,
  tipoExigido: string | null,
): RegistroDeKeyword[] {
  const clusters = new Set<string>([primaria.cluster ?? "", ...(spec.clustersExtra ?? [])]);
  const esCaptacion = spec.familia === "contenido";

  const candidatas = universo.filter((k) => {
    if (k.keywordKey === primaria.keywordKey) return false;
    // D-04, la mitad que se olvida: una keyword con modificador de distrito NO genera URL propia,
    // asi que su unico destino posible es la URL que ya sirve ese distrito. Entra aunque su
    // cluster sea otro, porque el cluster de una geo se forma por la SERP de la geo y no por el
    // tema; exigirle el cluster de la primaria la dejaria sin destino y se perderia el termino.
    const admitidaPorDistrito = mismaCosa(distritoDe(k.keyword), spec.distrito);
    if (!clusters.has(k.cluster ?? "") && !admitidaPorDistrito) return false;
    if (primariasAjenas.has(k.keywordKey)) return false;
    // Una de oro que las 10 de Oro reservaron para OTRA URL no puede colarse aca de secundaria:
    // seria montar la canibalizacion que MAP-02 existe para atrapar, y de la peor forma posible,
    // porque la victima seria la pagina que esa keyword tenia asignada por valor de negocio.
    if (reservadasPorOro.has(k.keywordKey)) return false;
    if (spec.filtroDeTema !== undefined && !normalizar(k.keyword).includes(normalizar(spec.filtroDeTema))) {
      return false;
    }
    if (motivoDeExclusion(k.keyword) !== null) return false;
    if (esExclusivaDeCaptacion(k.keyword) && !esCaptacion) return false;
    // Una secundaria con lugar solo entra si el lugar es el de esta URL.
    const clinica = clinicaDe(k.keyword);
    if (clinica !== null && !mismaCosa(clinica, spec.clinica)) return false;
    const distrito = distritoDe(k.keyword);
    if (distrito !== null && !mismaCosa(distrito, spec.distrito) && !mismaCosa(distrito, spec.clinica)) {
      return false;
    }
    // Una URL de sede solo carga terminos que nombran SU lugar. Sin esta linea, el cluster de
    // Lima —939 cabezas— le vuelca terminos genericos encima y la sede termina peleando contra
    // el hub por la misma consulta.
    if (spec.familia === "sede" && clinica === null && distrito === null) return false;
    return true;
  });

  // Orden, y cada sumando responde a una regla, no a un gusto:
  //   +4 nombra la clinica de esta sede: es la consulta que solo esta URL puede responder.
  //   +2 / +1 la fase 13 midio su SERP y la declaro alcanzable o no.
  //   +1 la intencion coincide con lo que la pagina hace (una de servicio no vive de informacional).
  // Los empates los rompe el volumen medido y despues el alfabeto, para que dos corridas
  // produzcan el mismo archivo byte a byte y el SHA-256 signifique algo.
  // La intencion que se premia sale del FORMATO QUE LA SERP EXIGE, no de la familia de la URL.
  // Es la consecuencia directa de MAP-04: cuando Google responde una cabeza con contenido
  // informativo largo, la pagina que la pelea va a ser una guia aunque hoy sea de servicio, y
  // sus secundarias tienen que ser las de una guia. Puntuar por familia le habria dado a la
  // pagina de escoliosis secundarias transaccionales para un top 10 que no premia ninguna.
  const formatoInformativo =
    esCaptacion || tipoExigido === "contenido-internacional" || tipoExigido === "guia";
  const intentAlineado = (k: RegistroDeKeyword): boolean =>
    formatoInformativo
      ? k.intent === "informacional" || k.intent === "comercial"
      : k.intent === "transaccional" || k.intent === "comercial";

  const puntaje = (k: RegistroDeKeyword): number => {
    const dulce = puntoDulce.get(k.keywordKey);
    let total = dulce === undefined ? 0 : dulce.alcanzable ? 2 : 1;
    if (spec.clinica !== undefined && mismaCosa(clinicaDe(k.keyword), spec.clinica)) total += 4;
    if (intentAlineado(k)) total += 1;
    return total;
  };

  candidatas.sort((a, b) => {
    const pa = puntaje(a);
    const pb = puntaje(b);
    if (pa !== pb) return pb - pa;
    const va = volumen(a);
    const vb = volumen(b);
    if (va !== vb) return vb - va;
    return a.keywordKey.localeCompare(b.keywordKey, "es");
  });

  if (candidatas.length < MIN_SECUNDARIAS) {
    throw new ErrorDeAsignacion(
      `${spec.url}: la primaria "${primaria.keyword}" deja ${candidatas.length} candidatas ` +
        `legitimas a secundaria y MAP-01 exige ${MIN_SECUNDARIAS}. No se rellena: una secundaria ` +
        `inventada pasa la validacion y no significa nada. Revisar el cluster ` +
        `"${primaria.cluster ?? "sin cluster"}" o declarar un cluster extra con su motivo.`,
    );
  }

  // Dos secundarias donde una contiene a la otra son la misma consulta escrita dos veces
  // ("cirugia de escoliosis" y "cirugia de escoliosis y deformidades de columna"). Gastan dos de
  // las cinco ranuras en un solo termino y le hacen creer a quien lea el mapa que la pagina
  // cubre mas de lo que cubre.
  // Se compara tambien contra la PRIMARIA y no solo entre secundarias: "ortopedia infantil en
  // lima" de secundaria, con "ortopedia infantil lima" de primaria, es la misma consulta con un
  // "en" en el medio. Ocupa una ranura para repetir lo que la fila ya dice arriba.
  const distintas: RegistroDeKeyword[] = [];
  for (const k of candidatas) {
    // Contra la primaria se compara SOLO por conjunto de palabras, nunca por contencion: una
    // cabeza como "escoliosis" esta contenida en las 43 keywords de su cluster, que son
    // justamente las secundarias legitimas. Usar contencion aca vaciaba la fila entera.
    if (mismaConsulta(k.keyword, primaria.keyword)) continue;
    if (distintas.some((y) => mismoAngulo(k.keyword, y.keyword))) continue;
    distintas.push(k);
    if (distintas.length === MAX_SECUNDARIAS) break;
  }
  // Aca NO hay respaldo, y la ausencia es la decision. Caer a `candidatas` sin filtrar cuando
  // quedan menos de tres angulos distintos emite la misma consulta dos veces y la fila pasa
  // igual la validacion de MAP-01, porque contar cinco cadenas es trivial y contar cinco angulos
  // no. Ese relleno silencioso es el modo de falla que este plan vino a cerrar: mejor romper la
  // corrida y ampliar el cluster a mano que entregarle al cliente una fila que miente sobre lo
  // que la pagina cubre.
  if (distintas.length < MIN_SECUNDARIAS) {
    throw new ErrorDeAsignacion(
      `${spec.url}: la primaria "${primaria.keyword}" deja ${candidatas.length} candidatas pero ` +
        `solo ${distintas.length} angulos distintos, y MAP-01 exige ${MIN_SECUNDARIAS}. Las ` +
        `descartadas son reformulaciones de la primaria o entre si. No se rellena: declarar un ` +
        `cluster extra con su motivo en la especificacion de la URL.`,
    );
  }
  const elegidas = distintas;

  // D-04 le quita URL propia a las geo de distrito, asi que su unico destino en todo el mapa es
  // la sede que sirve ese distrito. Si esa sede tampoco carga ninguna, el termino se queda
  // huerfano y nadie lo nota hasta que la fase 16 pregunte por que no rankea. Por eso la sede
  // con distrito declarado reserva la ultima ranura para la mejor geo disponible.
  const reservaGeo =
    spec.familia === "sede" &&
    spec.distrito !== undefined &&
    spec.clinica !== undefined &&
    !elegidas.some((k) => mismaCosa(distritoDe(k.keyword), spec.distrito));
  if (reservaGeo) {
    const geo = candidatas.find((k) => mismaCosa(distritoDe(k.keyword), spec.distrito));
    if (geo !== undefined) elegidas[elegidas.length - 1] = geo;
  }
  return elegidas;
}

/**
 * A que intencion responde cada formato de resultado, medido en el top 10 real.
 *
 * No es una opinion sobre la palabra: es lo que Google ya decidio servir. Un top 10 de articulos
 * clinicos largos dice que quien busca esta leyendo, no agendando, por mas que la keyword suene
 * comercial. Un top 10 de fichas de clinica dice lo contrario.
 */
const INTENT_POR_FORMATO: Readonly<Record<string, string>> = {
  "contenido-internacional": "informacional",
  guia: "informacional",
  "pagina-de-servicio": "transaccional",
  "ficha-de-clinica": "transaccional",
  directorio: "comercial",
  "red-social": "comercial",
};

export interface IntentMedido {
  readonly intent: string;
  readonly deLaSerp: boolean;
  readonly evidencia: string;
}

/**
 * La intencion de una URL sale de la SERP que su primaria enfrenta, NUNCA de la carpeta donde
 * vive la pagina.
 *
 * Esto es el mismo error que fusionar dos URLs por compartir cluster, cometido sobre otro campo:
 * deducir la intencion de que la URL cuelgue de `/servicios/` es deducirla de como esta archivado
 * el sitio, que es justo lo que la fase viene a corregir. `estenosis espinal` es el caso testigo:
 * vive en `/servicios/`, suena a operacion, y Google le responde con ocho de ocho articulos
 * informativos. Escribirle `transaccional` al cliente seria escribirle la creencia previa, no la
 * medicion.
 *
 * Se suman las DIEZ posiciones y no solo la etiqueta dominante, porque un 5-4 y un 9-0 no
 * significan lo mismo y el reparto ya esta medido. Cuando ningun formato mapea a una intencion
 * —`otro` puro— o cuando no hay SERP, se cae a la clasificacion de la fase 13 y queda escrito
 * que se cayo, para que nadie lea inferencia como medicion.
 */
export function intentSegunSerp(
  tipo: TipoDeCabeza | undefined,
  intentDeLaKeyword: string,
): IntentMedido {
  if (tipo === undefined) {
    return {
      intent: intentDeLaKeyword,
      deLaSerp: false,
      evidencia:
        `sin SERP medida para esta cabeza, asi que la intencion es la que la fase 13 le ` +
        `clasifico por texto ("${intentDeLaKeyword}") y no una medicion`,
    };
  }

  const urnas = new Map<string, number>();
  for (const [formato, cuantas] of Object.entries(tipo.repartoDeTipos)) {
    const intent = INTENT_POR_FORMATO[formato];
    if (intent === undefined) continue;
    urnas.set(intent, (urnas.get(intent) ?? 0) + cuantas);
  }

  const ordenadas = [...urnas.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const ganadora = ordenadas[0];
  const segunda = ordenadas[1];

  if (ganadora === undefined || (segunda !== undefined && segunda[1] === ganadora[1])) {
    return {
      intent: intentDeLaKeyword,
      deLaSerp: false,
      evidencia:
        `su top 10 no resuelve una intencion dominante (${tipo.posicionesMedidas} posiciones ` +
        `medidas${ganadora === undefined ? " sin formato clasificable" : ", empate"}), asi que ` +
        `queda la clasificacion por texto de la fase 13 ("${intentDeLaKeyword}")`,
    };
  }

  const detalle = ordenadas.map(([nombre, n]) => `${n} ${nombre}`).join(", ");
  return {
    intent: ganadora[0],
    deLaSerp: true,
    evidencia:
      `su top 10 medido reparte ${detalle} sobre ${tipo.posicionesMedidas} posiciones, asi que la ` +
      `intencion es ${ganadora[0]} por medicion` +
      (ganadora[0] === intentDeLaKeyword
        ? " y coincide con la clasificacion por texto de la fase 13"
        : ` y NO la ${intentDeLaKeyword} que la clasificacion por texto le habia puesto`),
  };
}

function describirSerp(tipo: TipoDeCabeza | undefined): string {
  if (tipo === undefined) return "Su SERP no esta entre las cabezas medidas de la fase 13";
  const reparto = Object.entries(tipo.repartoDeTipos)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([nombre, n]) => `${n} de ${nombre}`)
    .join(", ");
  return (
    `Su top 10 medido premia ${tipo.tipoDePagina} con confianza ${tipo.confianza} ` +
    `(${tipo.posicionesMedidas} posiciones: ${reparto})`
  );
}

function describirMetricas(oro: KeywordDeOro | undefined, k: RegistroDeKeyword): string {
  if (oro !== undefined) {
    const partes: string[] = [`es la keyword de oro numero ${oro.puesto} con ${oro.valorDeNegocio} puntos de valor de negocio`];
    if (oro.volumenAhrefs !== null) partes.push(`volumen ${oro.volumenAhrefs}`);
    if (oro.keywordDifficulty !== null) partes.push(`KD ${oro.keywordDifficulty}`);
    if (oro.trafficPotential !== null) partes.push(`potencial de trafico ${oro.trafficPotential}`);
    return partes.join(", ");
  }
  const v = volumen(k);
  return v > 0 ? `tiene ${v} de volumen medido` : "no tiene volumen medido y se resuelve por la SERP";
}

/**
 * Asigna keyword primaria y secundarias a cada URL declarada.
 *
 * Nunca fusiona dos URLs por compartir cluster: cuando dos URLs se acercan al mismo tema pide el
 * veredicto de `overlap.ts` y lo deja escrito en el resultado, fusione o no.
 */
export function asignar(entrada: EntradaDeAsignacion): ResultadoDeAsignacion {
  const porClave = new Map<string, RegistroDeKeyword>();
  for (const k of entrada.universo) if (!porClave.has(k.keywordKey)) porClave.set(k.keywordKey, k);

  const oroPorClave = new Map<string, KeywordDeOro>();
  for (const o of entrada.oro) oroPorClave.set(o.keywordKey, o);

  const dulcePorClave = new Map<string, RegistroDePuntoDulce>();
  for (const d of entrada.puntoDulce) dulcePorClave.set(d.keywordKey, d);

  const tipoPorClave = new Map<string, TipoDeCabeza>();
  for (const t of entrada.tiposDePagina) tipoPorClave.set(t.keywordKey, t);

  const inventarioPorUrl = new Map<string, UrlDelInventario>();
  for (const u of entrada.inventario) inventarioPorUrl.set(u.url, u);

  const veredictos: VeredictoDeFusion[] = [];
  const conflictos: ConflictoResuelto[] = [];

  // --- Paso 1: pretensiones. Cada URL declara que keywords puede pelear. -----------------------
  const pretensiones: Pretension[] = [];
  for (const spec of entrada.especificaciones) {
    if (spec.porQue.trim().length < MINIMO_DE_PROSA) {
      throw new ErrorDeAsignacion(
        `${spec.url}: falta el motivo en prosa de la asignacion. Una fila sin justificacion no se ` +
          `emite (T-14-08): sin ella nadie puede auditar por que esa keyword y no otra.`,
      );
    }
    for (const candidata of spec.candidatas) {
      const keyword = porClave.get(candidata);
      if (keyword === undefined) {
        throw new ErrorDeAsignacion(
          `${spec.url}: la candidata "${candidata}" no existe en el universo de la fase 13. ` +
            `Se declara con la clave normalizada exacta, no con el texto aproximado.`,
        );
      }
      const excluida = motivoDeExclusion(keyword.keyword);
      if (excluida !== null) {
        throw new ErrorDeAsignacion(`${spec.url}: "${keyword.keyword}" esta excluida porque ${excluida}.`);
      }
      if (esExclusivaDeCaptacion(keyword.keyword) && spec.familia !== "contenido") {
        throw new ErrorDeAsignacion(
          `${spec.url}: "${keyword.keyword}" es intencion de automedicacion y solo puede vivir en ` +
            `una URL de captacion (D-09). Esta es de familia ${spec.familia}.`,
        );
      }
      const veto = admiteComoPrimaria(spec, keyword.keyword);
      if (veto !== null) throw new ErrorDeAsignacion(veto);

      const oro = oroPorClave.get(keyword.keywordKey);
      pretensiones.push({
        spec,
        keyword,
        oro,
        oroApuntaAca: oro?.urlCandidata?.url === spec.url,
      });
    }
  }

  // --- Paso 2: desempate. Una keyword, una URL. -----------------------------------------------
  const dueno = new Map<string, Pretension>();
  const porUrl = new Map<string, Pretension[]>();
  for (const p of pretensiones) {
    const lista = porUrl.get(p.spec.url) ?? [];
    lista.push(p);
    porUrl.set(p.spec.url, lista);
  }

  for (const p of pretensiones) {
    const previo = dueno.get(p.keyword.keywordKey);
    if (previo === undefined) {
      dueno.set(p.keyword.keywordKey, p);
      continue;
    }
    if (previo.spec.url === p.spec.url) continue;

    // Antes de resolver, se mide si las dos URLs se estan pisando de verdad. El veredicto
    // viaja al resultado fusione o no: es la evidencia de que la fusion no se decidio por cluster.
    const otraDelPerdedor = (candidato: Pretension): RegistroDeKeyword | undefined =>
      (porUrl.get(candidato.spec.url) ?? [])
        .map((x) => x.keyword)
        .find((k) => k.keywordKey !== candidato.keyword.keywordKey && dueno.get(k.keywordKey) === undefined);

    const gana = ((): { ganador: Pretension; perdedor: Pretension; motivo: string } => {
      if (previo.oroApuntaAca !== p.oroApuntaAca) {
        const ganador = previo.oroApuntaAca ? previo : p;
        const perdedor = previo.oroApuntaAca ? p : previo;
        return {
          ganador,
          perdedor,
          motivo:
            `Las 10 de Oro nombran a ${ganador.spec.url} como la URL candidata de ` +
            `"${p.keyword.keyword}" (D-06). La otra pretension no tiene respaldo de oro.`,
        };
      }
      const valorPrevio = previo.oro?.valorDeNegocio ?? -1;
      const valorNuevo = p.oro?.valorDeNegocio ?? -1;
      if (valorPrevio !== valorNuevo) {
        const ganador = valorPrevio > valorNuevo ? previo : p;
        const perdedor = valorPrevio > valorNuevo ? p : previo;
        return {
          ganador,
          perdedor,
          motivo:
            `Desempate por valor de negocio de las 10 de Oro (D-06): ` +
            `${Math.max(valorPrevio, valorNuevo)} contra ${Math.min(valorPrevio, valorNuevo)}.`,
        };
      }
      return {
        ganador: previo,
        perdedor: p,
        motivo:
          `Ninguna de las dos tiene respaldo de oro sobre la otra, asi que gana la que la declaro ` +
          `primero y la perdedora toma su siguiente candidata (D-06).`,
      };
    })();

    const alternativa = otraDelPerdedor(gana.perdedor);
    conflictos.push({
      keyword: p.keyword.keyword,
      candidatas: [previo.spec.url, p.spec.url],
      ganadora: gana.ganador.spec.url,
      perdedora: gana.perdedor.spec.url,
      motivo:
        gana.motivo +
        (alternativa === undefined
          ? ` ${gana.perdedor.spec.url} queda sin primaria por esta via y la resuelve el plan 14-03.`
          : ` ${gana.perdedor.spec.url} recibe "${alternativa.keyword}".`),
      destinoDeLaPerdedora: alternativa === undefined ? "sin-primaria" : "otra-primaria",
    });

    dueno.set(p.keyword.keywordKey, gana.ganador);
  }

  // --- Paso 3: veredicto de solape entre las primarias que quedan. -----------------------------
  const primariaDeUrl = new Map<string, Pretension>();
  for (const spec of entrada.especificaciones) {
    const suyas = (porUrl.get(spec.url) ?? []).filter((p) => dueno.get(p.keyword.keywordKey) === p);
    const elegida = suyas[0];
    if (elegida === undefined) {
      throw new ErrorDeAsignacion(
        `${spec.url}: se quedo sin primaria despues del desempate. Declarar otra candidata o ` +
          `sacar la URL de este lote; forzar una keyword que otra URL ya gano produce ` +
          `canibalizacion desde el dia uno.`,
      );
    }
    primariaDeUrl.set(spec.url, elegida);
  }

  const urls = [...primariaDeUrl.keys()].sort();
  for (let i = 0; i < urls.length; i += 1) {
    for (let j = i + 1; j < urls.length; j += 1) {
      const a = primariaDeUrl.get(urls[i] as string);
      const b = primariaDeUrl.get(urls[j] as string);
      if (a === undefined || b === undefined) continue;
      const veredicto = veredictoDeFusion(
        a.keyword.keyword,
        b.keyword.keyword,
        entrada.indice,
        entrada.umbralDeFusion === undefined ? {} : { umbral: entrada.umbralDeFusion },
      );
      veredictos.push(veredicto);
    }
  }

  // --- Paso 3 bis: dos de oro peleando la MISMA URL. -------------------------------------------
  // No es el mismo caso que dos URLs peleando una keyword, y por eso se registra aparte: aca la
  // URL existe una sola vez y la de oro que pierde no tiene donde caer. Queda anotada como URL a
  // crear del plan 14-03 en vez de meterse a la fuerza en una pagina que ya sirve otra cosa.
  for (const spec of entrada.especificaciones) {
    const elegida = primariaDeUrl.get(spec.url);
    if (elegida === undefined) continue;
    for (const p of porUrl.get(spec.url) ?? []) {
      if (p === elegida || p.oro === undefined) continue;
      if (dueno.get(p.keyword.keywordKey) !== p) continue;
      conflictos.push({
        keyword: p.keyword.keyword,
        candidatas: [elegida.keyword.keyword, p.keyword.keyword],
        ganadora: spec.url,
        perdedora: spec.url,
        motivo:
          `Dos keywords de oro apuntan a ${spec.url}: "${elegida.keyword.keyword}" y ` +
          `"${p.keyword.keyword}". Gana "${elegida.keyword.keyword}" por valor de negocio y ` +
          `puesto en las 10 de Oro (${elegida.oro?.valorDeNegocio ?? "sin valor"} puntos, puesto ` +
          `${elegida.oro?.puesto ?? "sin puesto"}) contra ${p.oro.valorDeNegocio} puntos y puesto ` +
          `${p.oro.puesto} (D-06). Una URL sirve una primaria: la perdedora no se fuerza dentro y ` +
          `queda anotada como URL a crear para el plan 14-03.`,
        destinoDeLaPerdedora: "sin-primaria",
      });
    }
  }

  // --- Paso 4: la fila. ------------------------------------------------------------------------
  const primariasAjenas = new Set<string>();
  for (const p of primariaDeUrl.values()) primariasAjenas.add(p.keyword.keywordKey);

  const asignaciones: AsignacionDeUrl[] = [];
  for (const spec of entrada.especificaciones) {
    const elegida = primariaDeUrl.get(spec.url);
    if (elegida === undefined) continue;
    const primaria = elegida.keyword;

    const ajenas = new Set(primariasAjenas);
    ajenas.delete(primaria.keywordKey);

    const reservadas = new Set<string>();
    for (const o of entrada.oro) {
      const destino = o.urlCandidata?.url;
      if (destino !== undefined && destino !== spec.url) reservadas.add(o.keywordKey);
    }

    // El tipo exigido se resuelve ANTES de elegir secundarias, y no despues, porque es entrada de
    // esa eleccion: las secundarias de una pagina que la SERP quiere como guia son las de una
    // guia. Calcularlo despues fue el bug que dejaba a escoliosis con secundarias transaccionales
    // para un top 10 que no premia ninguna.
    const tipo = tipoPorClave.get(primaria.keywordKey);
    const tipoExigido = tipo?.tipoDePagina ?? null;
    const intentMedido = intentSegunSerp(tipo, primaria.intent);

    const secundarias = elegirSecundarias(
      spec,
      primaria,
      entrada.universo,
      dulcePorClave,
      ajenas,
      reservadas,
      tipoExigido,
    );

    const existe = inventarioPorUrl.has(spec.url) || spec.estado === "viva";
    const sirveLoAsignado = spec.sirveHoy !== null && spec.sirveHoy === primaria.keywordKey;
    const formatoCorrecto = tipoExigido === null || tipoExigido === spec.tipoDePagina;
    const accion: AccionDeUrl = !existe
      ? "crear"
      : sirveLoAsignado && formatoCorrecto
        ? "dejar"
        : "reescribir";
    const disposicion: DisposicionDeUrl = accion === "dejar" ? "dejar" : "actualizar";

    const conflicto = conflictos.find((c) => c.ganadora === spec.url || c.perdedora === spec.url);
    const motivoDeAccion =
      accion === "crear"
        ? "La URL no existe todavia en el inventario medido, asi que hay que crearla"
        : sirveLoAsignado && !formatoCorrecto
          ? `La pagina ya sirve la keyword asignada pero es ${spec.tipoDePagina} y la SERP premia ${tipoExigido ?? "otro formato"}, asi que hay que reescribirla (MAP-04)`
          : sirveLoAsignado
            ? "La pagina publicada ya sirve exactamente esta keyword en el formato que la SERP premia"
            : `La pagina esta publicada desde v1.1 pero salio antes de que esta fase asignara keywords (D-01): hoy responde ${spec.sirveHoy === null ? "ninguna keyword del mapa" : `"${spec.sirveHoy}"`}`;

    const justificacion = [
      spec.porQue.trim(),
      `De la fase 13: "${primaria.keyword}" ${describirMetricas(elegida.oro, primaria)}.`,
      `${describirSerp(tipo)}.`,
      `Intencion ${intentMedido.intent}: ${intentMedido.evidencia}.`,
      conflicto === undefined
        ? `Ninguna otra URL del lote peleo esta primaria.`
        : `Desempate registrado: ${conflicto.motivo}`,
      `Secundarias tomadas del cluster "${primaria.cluster ?? "sin cluster"}"${spec.clustersExtra === undefined || spec.clustersExtra.length === 0 ? "" : ` y de ${spec.clustersExtra.join(", ")} por D-04`}.`,
      `Accion ${accion}: ${motivoDeAccion}.`,
    ].join(" ");

    asignaciones.push({
      url: spec.url,
      titulo: spec.titulo,
      estado: spec.estado,
      origen: spec.origen,
      esPaginaSeo: spec.esPaginaSeo,
      keywordPrimaria: primaria.keyword,
      keywordPrimariaKey: primaria.keywordKey,
      secundarias: secundarias.map((s) => s.keyword),
      intent: intentMedido.intent,
      tipoDePagina: spec.tipoDePagina,
      tipoExigidoPorSerp: tipoExigido,
      cluster: primaria.cluster,
      clusterFuente: (primaria.clusterFuente ?? null) as FuenteDeCluster | null,
      accion,
      dejarActualizarEliminar: disposicion,
      canonical: `${SITIO}${spec.url}`,
      topic: spec.topic,
      justificacion,
    });
  }

  const oroSinUrl = entrada.oro
    .filter((o) => !primariasAjenas.has(o.keywordKey))
    .map((o) => o.keyword)
    .sort();

  return { asignaciones, conflictos, veredictos, oroSinUrl };
}
