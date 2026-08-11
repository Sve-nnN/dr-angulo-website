/**
 * Fuente DinoRank: los cuatro endpoints que exige INFRA-02.
 *
 * Es el motor de expansion del universo desde la enmienda del 2026-08-10. Una sola llamada
 * devuelve cientos de keywords relacionadas para Peru, cada una con volumen, CPC y
 * competencia. Medido en vivo: `hernia discal` devolvio 899 relacionadas, `dolor de espalda`
 * 900, `traumatologo lima` 47.
 *
 * TRES TRAMPAS MEDIDAS QUE ESTE PARSER RESPETA. Estan verificadas contra el sondeo real y
 * documentadas en .planning/workstreams/seo-keywords/data/dinorank-contrato-2026-08-10.md:
 *
 *   1. La keyword consultada SIEMPRE vuelve con `datos.search_volume: 0`, junto con `cpc`,
 *      `competition` y los doce meses de historia. Un parser que lea el volumen de ahi saca el
 *      universo entero en cero, y el fallo es SILENCIOSO porque cero es un valor valido. El
 *      volumen se lee de `keywords[]`; la propia semilla se busca dentro de ese arreglo.
 *   2. Solo el 16% de las relacionadas trae volumen (143 de 899). El filtro de calidad no
 *      puede ser "tiene volumen" o el universo se derrumba y se pierde justo el long tail.
 *   3. La respuesta anida `data.data`. No es un error de transcripcion.
 *
 * Ninguna funcion de este archivo llama a la red por su cuenta: todo pasa por el envoltorio
 * de peticiones del plan 01 y por el seam de cache.
 */

import {
  fetchThroughCache,
  type CacheEnvelope,
  type NetworkCall,
  type NetworkResult,
  type RunCounters,
} from "../cache.js";
import { CliError, describeSecret } from "../config.js";
import { requestJson } from "../http.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import type { QuotaBook } from "../quota.js";

export const DINORANK_FUENTE = "dinorank";
export const DINORANK_BASE = "https://api.dinorank.com/api/v1";

/** Los cuatro endpoints que INFRA-02 exige. Dos los consume esta fase; los otros dos los
 *  necesitan MAP-02 en la fase 14 y ONPAGE-03 y ONPAGE-05 en la fase 15. */
export const ENDPOINTS_DINORANK = [
  "keyword-research",
  "tfidf",
  "auditoria",
  "canibalizaciones",
] as const;

export type EndpointDinorank = (typeof ENDPOINTS_DINORANK)[number];

export function urlEndpoint(endpoint: EndpointDinorank): string {
  return `${DINORANK_BASE}/${endpoint}`;
}

/** Se conserva con este nombre porque es parte de la clave de cache ya grabada por el plan 03:
 *  cambiarlo invalidaria las 40 respuestas que ya estan en disco y costaria cuota de verdad. */
export const DINORANK_ENDPOINT = urlEndpoint("keyword-research");

/** Peru y espanol, fijos: la fuente resuelve este pais por un backend distinto del de Espana
 *  y dejar el mercado al azar produciria un universo de otro pais. */
const PAIS = "pe";
const IDIOMA = "es";

export interface DinoKeyword {
  key: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  /**
   * Que campos llegaron de verdad en la respuesta.
   *
   * Existe porque cero y ausente NO son lo mismo y confundirlos es el modo de fallo caro de
   * esta fuente: un volumen cero es "sin volumen medible", que para el long tail geolocalizado
   * es informacion util, y un volumen ausente es "la fuente no lo devolvio". Los tres campos
   * numericos se coercionan a cero para que aguas abajo nadie tenga que ramificar, y la
   * procedencia por metrica se decide mirando esta bandera.
   */
  presentes: { searchVolume: boolean; cpc: boolean; competition: boolean };
}

/** Procedencia por metrica, tal como vive en el dataset por la decision J-3 de Juan. */
export type FuenteMetrica = "dinorank" | "sin_datos";

export interface MetricasKeyword {
  searchVolume: number | null;
  searchVolumeFuente: FuenteMetrica;
  cpc: number | null;
  cpcFuente: FuenteMetrica;
  competition: number | null;
  competitionFuente: FuenteMetrica;
}

export interface OpcionesConsulta {
  cacheDir: string;
  offline?: boolean | undefined;
  refresh?: boolean | undefined;
  quota?: QuotaBook | undefined;
  maxPerRun?: number | undefined;
  pending?: number | undefined;
  stats?: RunCounters | undefined;
  /** Sustituto de la llamada de red. Solo lo usan las pruebas y el camino de relleno. */
  llamada?: NetworkCall | undefined;
}

/** Parametros que definen la identidad de la consulta. Nunca llevan la credencial: viaja en
 *  un encabezado y no entra ni a la clave de cache ni al envelope. */
export function parametrosKeywordResearch(keyword: string): Record<string, unknown> {
  return { keyword, country: PAIS, language: IDIOMA };
}

const aNumero = (valor: unknown): number =>
  typeof valor === "number" && Number.isFinite(valor) ? valor : 0;

const esNumero = (valor: unknown): boolean => typeof valor === "number" && Number.isFinite(valor);

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
  valor !== null && typeof valor === "object" && !Array.isArray(valor);

/** Baja por una ruta de claves devolviendo undefined ante el primer tramo que no exista. */
function bajar(cuerpo: unknown, ...ruta: readonly string[]): unknown {
  let actual: unknown = cuerpo;
  for (const tramo of ruta) {
    if (!esObjeto(actual)) return undefined;
    actual = actual[tramo];
  }
  return actual;
}

const aTexto = (valor: unknown): string | null =>
  typeof valor === "string" && valor.trim() !== "" ? valor : null;

/**
 * Extrae las keywords relacionadas. Tolerante por diseno: una respuesta sin el arreglo
 * esperado devuelve vacio en vez de romper la expansion entera (amenaza T-12-23).
 */
export function parseKeywordResearch(cuerpo: unknown): DinoKeyword[] {
  if (cuerpo === null || typeof cuerpo !== "object") return [];

  const nivel1 = (cuerpo as Record<string, unknown>)["data"];
  if (nivel1 === null || typeof nivel1 !== "object") return [];

  const nivel2 = (nivel1 as Record<string, unknown>)["data"];
  if (nivel2 === null || typeof nivel2 !== "object") return [];

  const keywords = (nivel2 as Record<string, unknown>)["keywords"];
  if (!Array.isArray(keywords)) return [];

  const salida: DinoKeyword[] = [];

  for (const cruda of keywords) {
    if (cruda === null || typeof cruda !== "object") continue;
    const registro = cruda as Record<string, unknown>;
    const key = registro["key"];
    if (typeof key !== "string" || key.trim() === "") continue;

    salida.push({
      key: key.trim(),
      searchVolume: aNumero(registro["search_volume"]),
      cpc: aNumero(registro["cpc"]),
      competition: aNumero(registro["competition"]),
      presentes: {
        searchVolume: esNumero(registro["search_volume"]),
        cpc: esNumero(registro["cpc"]),
        competition: esNumero(registro["competition"]),
      },
    });
  }

  return salida;
}

/** Las tres metricas sin resolver, con su procedencia declarada. */
export function metricasSinDatos(): MetricasKeyword {
  return {
    searchVolume: null,
    searchVolumeFuente: "sin_datos",
    cpc: null,
    cpcFuente: "sin_datos",
    competition: null,
    competitionFuente: "sin_datos",
  };
}

/** Traduce una relacionada a las tres metricas del dataset, campo por campo. */
export function metricasDe(entrada: DinoKeyword | undefined): MetricasKeyword {
  if (entrada === undefined) return metricasSinDatos();

  return {
    searchVolume: entrada.presentes.searchVolume ? entrada.searchVolume : null,
    searchVolumeFuente: entrada.presentes.searchVolume ? "dinorank" : "sin_datos",
    cpc: entrada.presentes.cpc ? entrada.cpc : null,
    cpcFuente: entrada.presentes.cpc ? "dinorank" : "sin_datos",
    competition: entrada.presentes.competition ? entrada.competition : null,
    competitionFuente: entrada.presentes.competition ? "dinorank" : "sin_datos",
  };
}

/**
 * Las tres metricas de UNA keyword dentro de una respuesta de keyword research.
 *
 * Busca dentro de `keywords[]` y nunca lee `datos`, que es la trampa numero uno: la keyword
 * consultada vuelve siempre en cero ahi. Si no aparece, las tres metricas quedan marcadas sin
 * datos en vez de lanzar: una respuesta degradada no puede tumbar el enriquecimiento entero.
 */
export function parseMetricasDeKeyword(cuerpo: unknown, keyword: string): MetricasKeyword {
  const buscada = normalizeKeyword(keyword);
  const entrada = parseKeywordResearch(cuerpo).find((k) => normalizeKeyword(k.key) === buscada);
  return metricasDe(entrada);
}

/**
 * El bloque `datos`, que corresponde a la keyword consultada, y las dos trampas que esconde.
 *
 * El contrato grabado el 2026-08-10 afirmaba que este bloque vuelve SIEMPRE en cero. Auditadas
 * las 70 respuestas cacheadas: es cierto en 60 y FALSO en 10. `ciatica` vuelve con 8100 y
 * `cirugia minimamente invasiva` con 30. O sea que descartarlo de plano tira dato bueno, y
 * leerlo de plano escribe ceros que no son ceros medidos. Las dos condiciones de abajo son las
 * que separan un caso del otro:
 *
 *   1. `datos.key` TIENE que ser la keyword consultada. Medido: consultar `casos de revision`
 *      devuelve `datos.key` igual a "tiempo actual de revision de casos nvc" con volumen 10.
 *      La fuente sustituye por una sugerencia sin avisar, y atribuirle ese 10 a la keyword
 *      consultada es colgarle a una keyword la metrica de otra.
 *   2. El registro tiene que ser NO degenerado. Cuando la fuente no resolvio la keyword
 *      devuelve volumen, CPC, competencia y los doce meses de historia en cero, todo junto.
 *      Un cero real viene acompanado de historia con movimiento o de CPC distinto de cero.
 */
export function parseDatosPropios(cuerpo: unknown, keyword: string): DinoKeyword | undefined {
  const datos = bajar(cuerpo, "data", "data", "datos");
  if (!esObjeto(datos)) return undefined;

  const key = datos["key"];
  if (typeof key !== "string" || normalizeKeyword(key) !== normalizeKeyword(keyword)) return undefined;

  const searchVolume = aNumero(datos["search_volume"]);
  const cpc = aNumero(datos["cpc"]);
  const competition = aNumero(datos["competition"]);

  const historia = datos["history"];
  const historiaConMovimiento =
    Array.isArray(historia) &&
    historia.some((mes) => esObjeto(mes) && aNumero(mes["search_volume"]) > 0);

  const degenerado = searchVolume === 0 && cpc === 0 && competition === 0 && !historiaConMovimiento;
  if (degenerado) return undefined;

  return {
    key: key.trim(),
    searchVolume,
    cpc,
    competition,
    presentes: {
      searchVolume: esNumero(datos["search_volume"]),
      cpc: esNumero(datos["cpc"]),
      competition: esNumero(datos["competition"]),
    },
  };
}

/**
 * Las metricas de la keyword CONSULTADA. Prefiere el bloque `datos` cuando pasa las dos
 * condiciones de arriba y cae al arreglo de relacionadas cuando no.
 */
export function parseMetricasDeConsulta(cuerpo: unknown, keyword: string): MetricasKeyword {
  const propia = parseDatosPropios(cuerpo, keyword);
  return propia !== undefined ? metricasDe(propia) : parseMetricasDeKeyword(cuerpo, keyword);
}

/**
 * Todas las keywords que una respuesta permite resolver: las relacionadas mas, si la fuente la
 * resolvio, la propia keyword consultada. Es lo que consume el enriquecimiento.
 */
export function parseKeywordResearchConPropia(cuerpo: unknown, keyword: string): DinoKeyword[] {
  const propia = parseDatosPropios(cuerpo, keyword);
  const relacionadas = parseKeywordResearch(cuerpo);
  return propia === undefined ? relacionadas : [propia, ...relacionadas];
}

// --- /tfidf: entidades semanticas por URL (ONPAGE-03, fase 15) --------------------------

export interface EncabezadoTfidf {
  tipo: number;
  texto: string;
  subencabezados: EncabezadoTfidf[];
}

export interface AnalisisTfidf {
  keyword: string | null;
  url: string | null;
  /** Cuantas URLs de competencia entraron al corpus de comparacion. */
  totalUrls: number;
  /**
   * Si hay corpus con el que comparar. Para Peru midio cero incluso pasando una URL, asi que
   * el TF-IDF comparativo no esta disponible y lo aprovechable es la extraccion on-page.
   */
  corpusDisponible: boolean;
  title: string | null;
  encabezados: EncabezadoTfidf[];
  numPalabras: number | null;
  prominencia: number | null;
  vecesPorTermino: Record<string, number>;
  texto: string | null;
}

function parseEncabezados(crudos: unknown): EncabezadoTfidf[] {
  if (!Array.isArray(crudos)) return [];
  const salida: EncabezadoTfidf[] = [];

  for (const crudo of crudos) {
    if (!esObjeto(crudo)) continue;
    const texto = aTexto(crudo["texto"]);
    if (texto === null) continue;
    salida.push({
      tipo: aNumero(crudo["tipo"]),
      texto,
      subencabezados: parseEncabezados(crudo["subencabezados"]),
    });
  }

  return salida;
}

export function parseTfidf(cuerpo: unknown): AnalisisTfidf {
  const datos = bajar(cuerpo, "data");
  const analysis = bajar(datos, "analysis");
  const global = bajar(analysis, "global");
  const encabezados = bajar(analysis, "absolutos", "urlCompara", "encabezados");

  const veces = bajar(analysis, "veces", "urlCompara", "vecesKeyword");
  const vecesPorTermino: Record<string, number> = {};
  if (esObjeto(veces)) {
    for (const [termino, valor] of Object.entries(veces)) {
      if (esNumero(valor)) vecesPorTermino[termino] = valor as number;
    }
  }

  const totalUrls = esNumero(bajar(global, "totalUrls")) ? (bajar(global, "totalUrls") as number) : 0;
  const numPalabras = bajar(analysis, "numPalabras", "urlCompara");
  const prominencia = bajar(analysis, "prominencia", "urlCompara");

  return {
    keyword: aTexto(bajar(datos, "keyword")),
    url: aTexto(bajar(datos, "url")),
    totalUrls,
    corpusDisponible: totalUrls > 0,
    title: aTexto(bajar(encabezados, "title")),
    encabezados: parseEncabezados(esObjeto(encabezados) ? encabezados["h"] : undefined),
    numPalabras: esNumero(numPalabras) ? (numPalabras as number) : null,
    prominencia: esNumero(prominencia) ? (prominencia as number) : null,
    vecesPorTermino,
    texto: aTexto(bajar(global, "codigo", "urlCompara")),
  };
}

// --- /auditoria: titles, H1 y metas duplicados (ONPAGE-05, fase 15) ---------------------

export interface FilaAuditoria {
  id: string;
  url: string;
  texto: string | null;
}

export interface GrupoDuplicado {
  texto: string;
  urls: FilaAuditoria[];
}

export interface ResumenAuditoria {
  urlsTotal: number;
  titlesDuplicados: number;
  h1Duplicados: number;
  metaDuplicados: number;
  noindex: number;
  urlsLentas: number;
  http: number;
  https: number;
  urlsEspejo: number;
}

export interface Auditoria {
  dominio: string | null;
  tipo: string | null;
  resumen: ResumenAuditoria;
  titles: GrupoDuplicado[];
  h1: GrupoDuplicado[];
  meta: GrupoDuplicado[];
  noindex: FilaAuditoria[];
  urlsLentas: FilaAuditoria[];
  http: FilaAuditoria[];
  https: FilaAuditoria[];
  urlsEspejo: FilaAuditoria[];
  ilinks: FilaAuditoria[];
}

/**
 * Una fila de auditoria llega DUPLICADA dentro del mismo objeto: una vez con claves
 * posicionales "0", "1", "2" y otra con claves nombradas. Es el artefacto tipico de un
 * fetch_array de PHP. Por eso se lee por NOMBRE y no se itera: recorrer la fila con
 * Object.entries procesa cada valor dos veces.
 */
function parseFila(crudo: unknown, campoTexto: string): FilaAuditoria | null {
  if (!esObjeto(crudo)) return null;
  const url = aTexto(crudo["url"]);
  if (url === null) return null;

  const id = crudo["id"];
  return {
    id: typeof id === "string" ? id : esNumero(id) ? String(id) : "",
    url,
    texto: aTexto(crudo[campoTexto]),
  };
}

function parseFilas(crudas: unknown, campoTexto: string): FilaAuditoria[] {
  if (!Array.isArray(crudas)) return [];
  return crudas.map((c) => parseFila(c, campoTexto)).filter((f): f is FilaAuditoria => f !== null);
}

/** Los duplicados llegan como objeto indexado por el propio texto repetido. */
function parseDuplicados(crudo: unknown, campoTexto: string): GrupoDuplicado[] {
  const mapa = bajar(crudo, "duplicados");
  if (!esObjeto(mapa)) return [];

  const salida: GrupoDuplicado[] = [];
  for (const [texto, filas] of Object.entries(mapa)) {
    salida.push({ texto, urls: parseFilas(filas, campoTexto) });
  }
  return salida;
}

export function parseAuditoria(cuerpo: unknown): Auditoria {
  const datos = bajar(cuerpo, "data");
  const bloque = bajar(datos, "data");
  const resumenCrudo = bajar(datos, "summary");

  const entero = (clave: string): number => {
    const valor = esObjeto(resumenCrudo) ? resumenCrudo[clave] : undefined;
    return esNumero(valor) ? (valor as number) : 0;
  };

  return {
    dominio: aTexto(bajar(datos, "site", "domain")),
    tipo: aTexto(bajar(datos, "tipo")),
    resumen: {
      urlsTotal: entero("urls_total"),
      titlesDuplicados: entero("titles_duplicados"),
      h1Duplicados: entero("h1_duplicados"),
      metaDuplicados: entero("meta_duplicados"),
      noindex: entero("noindex"),
      urlsLentas: entero("urls_lentas"),
      http: entero("http"),
      https: entero("https"),
      urlsEspejo: entero("urls_espejo"),
    },
    titles: parseDuplicados(bajar(bloque, "titles"), "title"),
    h1: parseDuplicados(bajar(bloque, "h1"), "h1"),
    meta: parseDuplicados(bajar(bloque, "meta"), "metadescription"),
    noindex: parseFilas(bajar(bloque, "noindex"), "title"),
    urlsLentas: parseFilas(bajar(bloque, "urls_lentas"), "title"),
    http: parseFilas(bajar(bloque, "http_vs_https", "HTTP"), "title"),
    https: parseFilas(bajar(bloque, "http_vs_https", "HTTPS"), "title"),
    urlsEspejo: parseFilas(bajar(bloque, "urls_espejo"), "title"),
    ilinks: parseFilas(bajar(bloque, "ilinks"), "title"),
  };
}

// --- /canibalizaciones: canibalizacion sobre lo indexado (MAP-02, fase 14) ---------------

export interface Canibalizaciones {
  dominio: string | null;
  /**
   * Distingue "no hay canibalizacion" de "no hay datos", que es la ramificacion que MAP-02
   * necesita: sin Search Console conectado al proyecto la respuesta llega con ok true y los
   * dos arreglos vacios, lo cual no dice nada sobre el sitio.
   */
  hayDatos: boolean;
  ultimaFechaSearchConsole: string | null;
  keywords: unknown[];
  canibalizaciones: unknown[];
  totalKeywords: number;
  totalClusters: number;
}

export function parseCanibalizaciones(cuerpo: unknown): Canibalizaciones {
  const datos = bajar(cuerpo, "data");
  const resumen = bajar(datos, "summary");

  const keywords = bajar(datos, "arrayKeywords");
  const canibaliza = bajar(datos, "arrayCanibaliza");
  const hayDatos = esObjeto(resumen) ? resumen["has_data"] === true : false;

  const entero = (clave: string): number => {
    const valor = esObjeto(resumen) ? resumen[clave] : undefined;
    return esNumero(valor) ? (valor as number) : 0;
  };

  return {
    dominio: aTexto(bajar(datos, "site", "domain")),
    hayDatos,
    ultimaFechaSearchConsole: aTexto(bajar(datos, "last_searchconsole_date")),
    keywords: Array.isArray(keywords) ? keywords : [],
    canibalizaciones: Array.isArray(canibaliza) ? canibaliza : [],
    totalKeywords: entero("keywords"),
    totalClusters: entero("clusters"),
  };
}

function leerClave(): string {
  const clave = process.env["DINORANK_API_KEY"];
  if (clave === undefined || clave.trim() === "") {
    throw new CliError(
      `Falta DINORANK_API_KEY y la consulta no esta en cache.\n` +
        `  Hay dos caminos y los dos producen el mismo resultado:\n` +
        `  1. Camino directo: agregar DINORANK_API_KEY en .secrets/.env y volver a correr.\n` +
        `  2. Camino de relleno: correr con --plan-only, obtener el cuerpo crudo por fuera y ` +
        `dejarlo con: npm run cli -- cache:put --source ${DINORANK_FUENTE} --key <clave> --file <archivo.json>\n` +
        `  Estado de la credencial: ${describeSecret(clave)}`,
    );
  }
  return clave.trim();
}

/**
 * Consulta generica de cualquiera de los cuatro endpoints, siempre a traves del seam de cache
 * del plan 01. Es el UNICO camino a la red de este modulo: ninguna funcion de aca llama a
 * `fetch` por su cuenta.
 *
 * Devuelve el envelope entero y no el cuerpo parseado a proposito: `dino:probe` necesita la
 * respuesta cruda para grabar la fixture, y los parsers de arriba se aplican sobre eso mismo.
 */
export async function consultarDinorank(
  endpoint: EndpointDinorank,
  parametros: Record<string, unknown>,
  opciones: OpcionesConsulta & { etiqueta?: string | undefined; isEmpty?: ((cuerpo: unknown) => boolean) | undefined },
): Promise<CacheEnvelope> {
  try {
    return await consultarSinTraducir(endpoint, parametros, opciones);
  } catch (error) {
    throw traducirRechazoDeCredencial(error, endpoint);
  }
}

/**
 * Traduce el rechazo de credencial del seam en el mensaje accionable que pide el ejemplo C6
 * del research: nombra el codigo, dice que hacer, y aclara que subcomandos siguen sirviendo
 * sin la clave. El texto es fijo y NO interpola el valor de la credencial: como maximo reporta
 * su longitud y su prefijo (amenaza T-12-42).
 *
 * Se hace por traduccion y no reescribiendo el seam porque cache.ts es del plan 01 y la regla
 * que importa vive alli: un 401 no se persiste NUNCA. Esa es la que permite que regenerar la
 * clave arregle el problema sin borrar nada, y esta funcion no la toca.
 */
function traducirRechazoDeCredencial(error: unknown, endpoint: EndpointDinorank): unknown {
  if (!(error instanceof CliError)) return error;

  const codigo = /\(HTTP (401|403)\)/.exec(error.message)?.[1];
  if (codigo === undefined || !/credencial/i.test(error.message)) return error;

  return new CliError(
    `DinoRank rechazo la credencial (HTTP ${codigo}) en /${endpoint}.\n` +
      `  Estado de la credencial: ${describeSecret(process.env["DINORANK_API_KEY"])}\n` +
      `  Accion: regenerar la clave desde el panel de DinoRank y reemplazar DINORANK_API_KEY ` +
      `en .secrets/.env. No hay nada que borrar: un rechazo de credencial no se cachea nunca, ` +
      `asi que la clave nueva funciona en la corrida siguiente.\n` +
      `  Mientras tanto siguen funcionando sin esta clave: kw:classify, kw:seeds, sheet:push, ` +
      `sheet:inspect, cache:stats, cache:put, y kw:enrich --offline sobre lo ya cacheado.`,
  );
}

async function consultarSinTraducir(
  endpoint: EndpointDinorank,
  parametros: Record<string, unknown>,
  opciones: OpcionesConsulta & { etiqueta?: string | undefined; isEmpty?: ((cuerpo: unknown) => boolean) | undefined },
): Promise<CacheEnvelope> {
  const url = urlEndpoint(endpoint);

  const llamada: NetworkCall =
    opciones.llamada ??
    (async (): Promise<NetworkResult> =>
      requestJson(url, {
        init: {
          method: "POST",
          headers: {
            "X-API-Key": leerClave(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parametros),
        },
      }));

  return fetchThroughCache(
    {
      cacheDir: opciones.cacheDir,
      source: DINORANK_FUENTE,
      endpoint: url,
      params: parametros,
      offline: opciones.offline,
      refresh: opciones.refresh,
      quota: opciones.quota,
      maxPerRun: opciones.maxPerRun,
      pending: opciones.pending,
      stats: opciones.stats,
      label: opciones.etiqueta ?? `${DINORANK_FUENTE}:${endpoint}`,
      ...(opciones.isEmpty !== undefined ? { isEmpty: opciones.isEmpty } : {}),
    },
    llamada,
  );
}

/**
 * Una consulta de keyword research. Pasa siempre por el seam de cache: la segunda ejecucion
 * de la misma consulta no llama a la red.
 */
export async function keywordResearch(
  keyword: string,
  opciones: OpcionesConsulta,
): Promise<DinoKeyword[]> {
  const envelope = await consultarDinorank("keyword-research", parametrosKeywordResearch(keyword), {
    ...opciones,
    etiqueta: `${DINORANK_FUENTE}:${keyword}`,
    isEmpty: (cuerpo) => parseKeywordResearch(cuerpo).length === 0,
  });

  return parseKeywordResearch(envelope.response);
}

/**
 * Igual que la anterior, pero incluyendo la propia keyword consultada cuando la fuente la
 * resolvio. Es la que usa el enriquecimiento; la expansion sigue usando la de arriba, que solo
 * mira relacionadas porque su trabajo es descubrir keywords nuevas.
 */
export async function keywordResearchConPropia(
  keyword: string,
  opciones: OpcionesConsulta,
): Promise<DinoKeyword[]> {
  const envelope = await consultarDinorank("keyword-research", parametrosKeywordResearch(keyword), {
    ...opciones,
    etiqueta: `${DINORANK_FUENTE}:${keyword}`,
    isEmpty: (cuerpo) => parseKeywordResearchConPropia(cuerpo, keyword).length === 0,
  });

  return parseKeywordResearchConPropia(envelope.response, keyword);
}

/**
 * TF-IDF semantico de una URL. Lo consume ONPAGE-03 en la fase 15.
 *
 * `url` es opcional segun la doc, pero para Peru sin ella la respuesta vuelve vacia: el
 * analisis util es el de `urlCompara`, y sin URL no hay URL que comparar.
 */
export async function tfidf(
  keyword: string,
  opciones: OpcionesConsulta & { url?: string | undefined },
): Promise<AnalisisTfidf> {
  const parametros: Record<string, unknown> = { keyword, country: PAIS, language: IDIOMA };
  if (opciones.url !== undefined) parametros["url"] = opciones.url;

  const envelope = await consultarDinorank("tfidf", parametros, {
    ...opciones,
    etiqueta: `${DINORANK_FUENTE}:tfidf:${keyword}`,
    isEmpty: (cuerpo) => parseTfidf(cuerpo).encabezados.length === 0,
  });

  return parseTfidf(envelope.response);
}

/**
 * Auditoria on-page de un proyecto. La consume ONPAGE-05 en la fase 15.
 *
 * Segun la doc no consume cuota, porque solo lee lo que DinoRank ya tiene almacenado. Exige un
 * proyecto dado de alta: con `domain` suelto y sin `projectId` la API responde HTTP 500.
 */
export async function auditoria(
  opciones: OpcionesConsulta & {
    domain: string;
    projectId?: string | undefined;
    tipo?: string | undefined;
    subtipo?: string | undefined;
    url?: string | undefined;
  },
): Promise<Auditoria> {
  const parametros: Record<string, unknown> = {
    domain: opciones.domain,
    country: PAIS,
    language: IDIOMA,
    tipo: opciones.tipo ?? "summary",
  };
  if (opciones.subtipo !== undefined) parametros["subtipo"] = opciones.subtipo;
  if (opciones.projectId !== undefined) parametros["project_id"] = opciones.projectId;
  if (opciones.url !== undefined) parametros["url"] = opciones.url;

  const envelope = await consultarDinorank("auditoria", parametros, {
    ...opciones,
    etiqueta: `${DINORANK_FUENTE}:auditoria:${opciones.domain}`,
    isEmpty: (cuerpo) => parseAuditoria(cuerpo).resumen.urlsTotal === 0,
  });

  return parseAuditoria(envelope.response);
}

/**
 * Canibalizaciones derivadas de Search Console. Las consume MAP-02 en la fase 14.
 *
 * Tampoco consume cuota. Sin Search Console conectado al proyecto responde con exito y los dos
 * arreglos vacios, asi que hay que mirar `hayDatos` y no el largo de `canibalizaciones`.
 */
export async function canibalizaciones(
  opciones: OpcionesConsulta & {
    domain: string;
    projectId?: string | undefined;
    consejos?: boolean | undefined;
  },
): Promise<Canibalizaciones> {
  const parametros: Record<string, unknown> = {
    domain: opciones.domain,
    country: PAIS,
    language: IDIOMA,
    consejos: opciones.consejos ?? false,
  };
  if (opciones.projectId !== undefined) parametros["project_id"] = opciones.projectId;

  const envelope = await consultarDinorank("canibalizaciones", parametros, {
    ...opciones,
    etiqueta: `${DINORANK_FUENTE}:canibalizaciones:${opciones.domain}`,
    isEmpty: (cuerpo) => !parseCanibalizaciones(cuerpo).hayDatos,
  });

  return parseCanibalizaciones(envelope.response);
}
