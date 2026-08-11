/**
 * Ahrefs como fuente instrumentada del proyecto: contrato, claves de cache, parsers y libro
 * de unidades.
 *
 * POR QUE ESTE MODULO NO LLAMA A LA RED NI UNA SOLA VEZ.
 *
 * Ahrefs no tiene credencial en `.secrets/.env`: el entorno solo trae DINORANK_API_KEY,
 * GOOGLE_SERVICE_ACCOUNT_FILE, SEO_SHEET_ID y SERPAPI_API_KEY. El unico camino de acceso es
 * el servidor MCP de Ahrefs, que vive en la sesion del agente y no en el proceso de Node.
 * Asi que el proyecto usa el seam que la fase 12 dejo armado para exactamente este caso
 * (Pattern 3, `src/commands/cache-put.ts`): el cuerpo crudo se obtiene por fuera y se deja en
 * la cache, y toda la cadena aguas abajo queda verificable sin ninguna credencial.
 *
 * La propiedad critica del diseno es que LA CLAVE LA CALCULA EL PROYECTO Y NO LA PERSONA.
 * `ahrefs-plan.ts` la emite, `ahrefs-ingest.ts` la vuelve a calcular a partir de los mismos
 * parametros y persiste ahi. Si el que rellena inventara la ruta, el dato quedaria guardado
 * bajo una clave que despues nadie encuentra, y el problema no se veria hasta el
 * reprocesamiento.
 *
 * REGLA QUE ATRAVIESA TODOS LOS PARSERS: una metrica que la fuente no devuelve queda en
 * `null`, nunca en cero. Es la misma regla que la fase 12 aplico al volumen y existe porque
 * un cero AFIRMA algo que nadie midio. Las cuatro condiciones nucleo del negocio se irian al
 * final de cualquier orden por volumen si se confundieran los dos.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  cacheKey,
  cachePath,
  readEnvelope,
  writeEnvelope,
  type CacheEnvelope,
  type Outcome,
} from "../cache.js";
import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { QuotaBook } from "../quota.js";

/** Nombre de la fuente en la cache y en el libro de cuota. Tercera fuente del proyecto. */
export const FUENTE = "ahrefs";

export const DATA_DIR = path.join(SEO_TOOLS_ROOT, "data");
export const RUTA_USO = path.join(DATA_DIR, "ahrefs-usage.json");

/**
 * Fecha de medicion, FIJA a proposito.
 *
 * Varios endpoints de Ahrefs v3 exigen `date`. Tomarla del reloj haria que la clave de cache
 * cambiara cada dia, y entonces la misma consulta se pagaria otra vez cada 24 horas. Fijarla
 * la vuelve parte del contrato: esta fase mide el 2026-08-11 y lo declara.
 */
export const FECHA_DE_MEDICION = "2026-08-11";

/** Peru. Solo lo usan los endpoints que aceptan desglose por pais. */
export const PAIS = "pe";

// ---------------------------------------------------------------------------
// Contrato de la fuente
// ---------------------------------------------------------------------------

/**
 * Etiquetas de endpoint ESTABLES de este proyecto.
 *
 * No son la ruta de la API ni el nombre de la herramienta del MCP: son la parte de la clave
 * de cache que el proyecto controla. Si manana el proveedor renombra una ruta —ya lo hizo:
 * `best-by-external-links` es hoy `pages-by-backlinks`— la cache sigue siendo valida porque
 * la etiqueta no se movio.
 */
export const ENDPOINTS = {
  domainRating: "site-explorer/domain-rating",
  backlinksStats: "site-explorer/backlinks-stats",
  metrics: "site-explorer/metrics",
  topPages: "site-explorer/top-pages",
  /** La usa el plan 13-04 para KD y traffic potential. Se declara aca para que la clave no cambie. */
  keywordsOverview: "keywords-explorer/overview",
} as const;

export type EtiquetaEndpoint = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];

export interface DescriptorEndpoint {
  readonly etiqueta: EtiquetaEndpoint;
  /** Ruta real de la API v3, para que quien capture sepa que esta pidiendo. */
  readonly rutaApi: string;
  /** Campos que el proyecto necesita, por NOMBRE. Ningun parser lee por posicion. */
  readonly select: readonly string[];
  /**
   * Coste base en unidades. La formula del proveedor es max(costeBase, costePorFila * filas)
   * y el minimo de cualquier peticion facturable son 50 unidades.
   * Fuente: https://docs.ahrefs.com/en/api/docs/limits-consumption
   */
  readonly costeBase: number;
  /** Suma del coste de los campos unicos pedidos. El campo por defecto cuesta 1; algunas metricas 5 o 10. */
  readonly costePorFila: number;
  /** Filas que se esperan de vuelta. Los endpoints de resumen devuelven una. */
  readonly filasEsperadas: number;
  /** Clave del objeto que envuelve la respuesta, tal como llega. */
  readonly envoltorio: string;
  readonly proposito: string;
}

/**
 * El contrato, escrito contra la referencia publica de la API v3 y no contra suposiciones.
 *
 * Los costes por fila salen de sumar el coste declarado de los campos pedidos: 1 unidad por
 * campo salvo las metricas caras, que cuestan 10. Es una ESTIMACION y esta declarada como tal:
 * el proveedor no expone saldo por API, asi que `data/ahrefs-usage.json` es todo el control
 * que este proyecto tiene sobre su propio consumo (T-13-22).
 */
export const DESCRIPTORES: Readonly<Record<EtiquetaEndpoint, DescriptorEndpoint>> = {
  [ENDPOINTS.domainRating]: {
    etiqueta: ENDPOINTS.domainRating,
    rutaApi: "/v3/site-explorer/domain-rating",
    select: ["domain_rating", "ahrefs_rank"],
    costeBase: 50,
    costePorFila: 2,
    filasEsperadas: 1,
    envoltorio: "domain_rating",
    proposito: "COMP-01: Domain Rating y Ahrefs Rank. Es la unica fuente que los tiene.",
  },
  [ENDPOINTS.backlinksStats]: {
    etiqueta: ENDPOINTS.backlinksStats,
    rutaApi: "/v3/site-explorer/backlinks-stats",
    select: ["live_refdomains", "all_time_refdomains", "live", "all_time"],
    costeBase: 50,
    costePorFila: 4,
    filasEsperadas: 1,
    envoltorio: "metrics",
    proposito: "COMP-01: referring domains. Se toma el conteo VIVO, no el historico.",
  },
  [ENDPOINTS.metrics]: {
    etiqueta: ENDPOINTS.metrics,
    rutaApi: "/v3/site-explorer/metrics",
    select: ["org_traffic", "org_keywords", "org_keywords_1_3"],
    costeBase: 50,
    costePorFila: 21,
    filasEsperadas: 1,
    envoltorio: "metrics",
    proposito: "COMP-01: trafico organico estimado y keywords en top 100.",
  },
  [ENDPOINTS.topPages]: {
    etiqueta: ENDPOINTS.topPages,
    rutaApi: "/v3/site-explorer/top-pages",
    select: ["url", "referring_domains", "top_keyword", "sum_traffic", "keywords"],
    costeBase: 50,
    costePorFila: 23,
    filasEsperadas: 10,
    envoltorio: "pages",
    proposito:
      "COMP-04 primera mitad: paginas mas enlazadas con su cantidad de dominios de referencia. " +
      "De aca sale ademas la evidencia de blog, sin visitar ningun sitio.",
  },
  [ENDPOINTS.keywordsOverview]: {
    etiqueta: ENDPOINTS.keywordsOverview,
    rutaApi: "/v3/keywords-explorer/overview",
    select: ["keyword", "difficulty", "volume", "traffic_potential", "cpc"],
    costeBase: 50,
    costePorFila: 23,
    filasEsperadas: 1,
    envoltorio: "keywords",
    proposito: "KWR-05 y KWR-06, plan 13-04: KD y traffic potential de las ~90 candidatas.",
  },
};

export function descriptor(etiqueta: string): DescriptorEndpoint {
  const hit = (DESCRIPTORES as Record<string, DescriptorEndpoint>)[etiqueta];
  if (hit === undefined) {
    throw new CliError(
      `Etiqueta de endpoint desconocida: ${JSON.stringify(etiqueta)}.\n` +
        `  Etiquetas declaradas: ${Object.values(ENDPOINTS).join(", ")}\n` +
        `  Las etiquetas son parte de la clave de cache. Inventar una deja el dato guardado\n` +
        `  bajo una ruta que ningun parser vuelve a mirar.`,
    );
  }
  return hit;
}

// ---------------------------------------------------------------------------
// Parametros: los mismos de los que sale la clave
// ---------------------------------------------------------------------------

/** Normaliza un dominio a la forma que viaja en la clave: sin protocolo, sin www, sin barra final. */
export function normalizarDominio(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

/** Parametros de una consulta de dominio. Deterministas: sin reloj y sin credencial. */
export function paramsDeDominio(etiqueta: EtiquetaEndpoint, dominio: string): Record<string, unknown> {
  const target = normalizarDominio(dominio);
  const base: Record<string, unknown> = {
    target,
    mode: "domain",
    protocol: "both",
    date: FECHA_DE_MEDICION,
  };

  if (etiqueta === ENDPOINTS.topPages) {
    return {
      ...base,
      country: PAIS,
      limit: 10,
      order_by: "referring_domains:desc",
      select: descriptor(etiqueta).select.join(","),
    };
  }
  if (etiqueta === ENDPOINTS.metrics) {
    return { ...base, volume_mode: "monthly" };
  }
  return base;
}

/** Parametros de una consulta de keyword. La usa el plan 13-04. */
export function paramsDeKeyword(keyword: string): Record<string, unknown> {
  return {
    keyword: keyword.trim(),
    country: PAIS,
    select: descriptor(ENDPOINTS.keywordsOverview).select.join(","),
  };
}

// ---------------------------------------------------------------------------
// Claves y lectura de cache
// ---------------------------------------------------------------------------

/**
 * Clave de cache de una consulta de Ahrefs.
 *
 * Envuelve a `cacheKey` con la fuente fija. Es la UNICA forma admitida de obtener una clave:
 * `ahrefs-plan.ts` la imprime y `ahrefs-ingest.ts` la recalcula, de modo que las dos partes
 * del traspaso llegan al mismo hash sin que nadie lo escriba a mano.
 */
export function claveDeConsulta(etiqueta: string, params: Record<string, unknown>): string {
  descriptor(etiqueta);
  return cacheKey(FUENTE, etiqueta, params);
}

export interface OpcionesLectura {
  readonly cacheDir?: string | undefined;
}

/** Lee el envelope de disco. Devuelve null si la consulta todavia no se ingirio. */
export async function leerConsulta(
  etiqueta: string,
  params: Record<string, unknown>,
  opciones: OpcionesLectura = {},
): Promise<CacheEnvelope | null> {
  const cacheDir = opciones.cacheDir ?? path.join(SEO_TOOLS_ROOT, ".cache");
  return readEnvelope(cacheDir, FUENTE, claveDeConsulta(etiqueta, params));
}

// ---------------------------------------------------------------------------
// Higiene de la respuesta antes de que entre al repositorio
// ---------------------------------------------------------------------------

/**
 * Patrones con forma de credencial o de identificador de cuenta.
 *
 * T-13-20. Es el mismo control que detecto la fuga en el plan 12-05. Se corre sobre el TEXTO
 * CRUDO y no sobre el objeto parseado, porque una credencial puede venir dentro de una URL
 * de eco o de un mensaje de error y no como campo propio.
 */
const PATRONES_DE_CREDENCIAL: readonly { readonly nombre: string; readonly patron: RegExp }[] = [
  { nombre: "api key", patron: /api[_-]?key/i },
  { nombre: "token", patron: /"?token"?\s*[:=]/i },
  { nombre: "authorization", patron: /authorization/i },
  { nombre: "bearer", patron: /bearer\s+[A-Za-z0-9._-]{8,}/i },
  { nombre: "identificador de cuenta", patron: /account[_-]?id/i },
  { nombre: "identificador de usuario", patron: /\buser[_-]?id\b/i },
  { nombre: "correo", patron: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
];

/** Devuelve el nombre de cada patron que aparece en el texto. Vacio significa limpio. */
export function buscarCredenciales(crudo: string): string[] {
  return PATRONES_DE_CREDENCIAL.filter((p) => p.patron.test(crudo)).map((p) => p.nombre);
}

/** Claves de primer nivel de un cuerpo, para diagnosticar una deriva de contrato. */
export function describirCampos(cuerpo: unknown): string[] {
  if (cuerpo === null || typeof cuerpo !== "object") return [];
  if (Array.isArray(cuerpo)) {
    const primera = cuerpo[0];
    return primera !== null && typeof primera === "object" ? Object.keys(primera as object) : [];
  }
  const raiz = cuerpo as Record<string, unknown>;
  const salida: string[] = [];
  for (const [clave, valor] of Object.entries(raiz)) {
    salida.push(clave);
    if (Array.isArray(valor)) {
      const primera = valor[0];
      if (primera !== null && typeof primera === "object") {
        for (const sub of Object.keys(primera as object)) salida.push(`${clave}[].${sub}`);
      }
      continue;
    }
    if (valor !== null && typeof valor === "object") {
      for (const sub of Object.keys(valor as object)) salida.push(`${clave}.${sub}`);
    }
  }
  return salida;
}

/**
 * Una respuesta vacia se persiste igual, con el resultado declarado.
 *
 * Para Ahrefs, vacio significa "la fuente no conoce este dato", que es DISTINTO de cero. Ya
 * esta medido que devuelve vacio para el geo long tail de Lima, y ese hecho es informacion:
 * volver a preguntarlo costaria otras 50 unidades para llegar al mismo lugar.
 */
export function esVacia(etiqueta: string, cuerpo: unknown): boolean {
  if (cuerpo === null || cuerpo === undefined) return true;
  if (typeof cuerpo !== "object") return false;

  const envoltorio = descriptor(etiqueta).envoltorio;
  const raiz = cuerpo as Record<string, unknown>;
  if (!(envoltorio in raiz)) return true;

  const dentro = raiz[envoltorio];
  if (dentro === null || dentro === undefined) return true;
  if (Array.isArray(dentro)) return dentro.length === 0;
  if (typeof dentro === "object") return Object.keys(dentro as object).length === 0;
  return false;
}

// ---------------------------------------------------------------------------
// Parsers. Todos leen POR NOMBRE y devuelven null para lo que la fuente no trajo.
// ---------------------------------------------------------------------------

function objetoEn(cuerpo: unknown, clave: string): Record<string, unknown> | null {
  if (cuerpo === null || typeof cuerpo !== "object") return null;
  const valor = (cuerpo as Record<string, unknown>)[clave];
  if (valor === null || typeof valor !== "object" || Array.isArray(valor)) return null;
  return valor as Record<string, unknown>;
}

/**
 * Lee un numero por NOMBRE DE CAMPO.
 *
 * Devuelve null si el campo no vino, si vino null o si no es un numero finito. Nunca cero por
 * defecto: la diferencia entre "no lo se" y "es cero" es la que decide si una keyword se
 * persigue o se descarta.
 */
export function numeroPorNombre(registro: Record<string, unknown> | null, campo: string): number | null {
  if (registro === null) return null;
  const valor = registro[campo];
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  return null;
}

function textoPorNombre(registro: Record<string, unknown> | null, campo: string): string | null {
  if (registro === null) return null;
  const valor = registro[campo];
  if (typeof valor === "string" && valor.trim() !== "") return valor;
  return null;
}

export interface DomainRating {
  readonly domainRating: number | null;
  readonly ahrefsRank: number | null;
}

export function parsearDomainRating(cuerpo: unknown): DomainRating {
  const dr = objetoEn(cuerpo, "domain_rating");
  return {
    domainRating: numeroPorNombre(dr, "domain_rating"),
    ahrefsRank: numeroPorNombre(dr, "ahrefs_rank"),
  };
}

export interface BacklinksStats {
  readonly referringDomains: number | null;
  readonly referringDomainsHistoricos: number | null;
  readonly backlinks: number | null;
}

export function parsearBacklinksStats(cuerpo: unknown): BacklinksStats {
  const m = objetoEn(cuerpo, "metrics");
  return {
    // El conteo VIVO es el que describe el perfil de enlaces de hoy. El historico incluye
    // dominios que ya no enlazan y sobreestimaria la distancia real.
    referringDomains: numeroPorNombre(m, "live_refdomains"),
    referringDomainsHistoricos: numeroPorNombre(m, "all_time_refdomains"),
    backlinks: numeroPorNombre(m, "live"),
  };
}

export interface MetricasOrganicas {
  readonly organicTraffic: number | null;
  readonly organicKeywords: number | null;
  readonly organicKeywordsTop3: number | null;
}

export function parsearMetrics(cuerpo: unknown): MetricasOrganicas {
  const m = objetoEn(cuerpo, "metrics");
  return {
    organicTraffic: numeroPorNombre(m, "org_traffic"),
    organicKeywords: numeroPorNombre(m, "org_keywords"),
    organicKeywordsTop3: numeroPorNombre(m, "org_keywords_1_3"),
  };
}

export interface PaginaDeCompetidor {
  readonly url: string;
  readonly titulo: string | null;
  readonly referringDomains: number | null;
  readonly traficoEstimado: number | null;
  readonly keywords: number | null;
}

/**
 * Paginas de un dominio, ORDENADAS DE MAYOR A MENOR por dominios de referencia.
 *
 * El orden se impone aca y no se hereda del proveedor: `order_by` viaja en la peticion, pero
 * confiar en que la respuesta llegue ordenada haria que un cambio del proveedor reordenara el
 * entregable sin que nada fallara. Las filas sin URL se descartan: sin URL no hay pagina.
 * Un empate se desempata por URL para que dos corridas produzcan el mismo archivo.
 */
export function parsearTopPages(cuerpo: unknown): PaginaDeCompetidor[] {
  if (cuerpo === null || typeof cuerpo !== "object") return [];
  const crudo = (cuerpo as Record<string, unknown>)["pages"];
  if (!Array.isArray(crudo)) return [];

  const paginas: PaginaDeCompetidor[] = [];
  for (const fila of crudo) {
    if (fila === null || typeof fila !== "object" || Array.isArray(fila)) continue;
    const r = fila as Record<string, unknown>;
    const url = textoPorNombre(r, "url") ?? textoPorNombre(r, "raw_url");
    if (url === null) continue;
    paginas.push({
      url,
      // `top_keyword` es lo mas parecido a un titulo que trae este endpoint. Si no viene,
      // queda null en vez de repetir la URL: inventar un titulo seria afirmar algo que la
      // fuente no dijo.
      titulo: textoPorNombre(r, "top_keyword"),
      referringDomains: numeroPorNombre(r, "referring_domains"),
      traficoEstimado: numeroPorNombre(r, "sum_traffic"),
      keywords: numeroPorNombre(r, "keywords"),
    });
  }

  return paginas.sort((a, b) => {
    const ra = a.referringDomains ?? -1;
    const rb = b.referringDomains ?? -1;
    if (ra !== rb) return rb - ra;
    return a.url.localeCompare(b.url);
  });
}

// ---------------------------------------------------------------------------
// Unidades
// ---------------------------------------------------------------------------

/**
 * Estimacion de unidades de una consulta: max(costeBase, costePorFila * filas).
 *
 * Fuente de la formula: https://docs.ahrefs.com/en/api/docs/limits-consumption. El proveedor
 * NO expone saldo por API, asi que esta cuenta mas el libro de cuota son todo el control que
 * existe sobre el consumo. Se declara como estimacion, no como medicion.
 */
export function unidadesEstimadas(etiqueta: string, filas?: number): number {
  const d = descriptor(etiqueta);
  const n = filas ?? d.filasEsperadas;
  return Math.max(d.costeBase, d.costePorFila * n);
}

// ---------------------------------------------------------------------------
// Plan de consultas
// ---------------------------------------------------------------------------
//
// Vive en el MODULO y no en el punto de entrada a proposito: `ahrefs-plan.ts` llama a
// `ejecutar(main)` en el cuerpo del archivo, igual que `src/cli.ts`, asi que importarlo desde
// una prueba ejecutaria su main con los argumentos del corredor de pruebas. Los puntos de
// entrada de esta fase no llevan logica.

/** Los cuatro endpoints que COMP-01 y COMP-04 necesitan por dominio. */
export const ENDPOINTS_DE_DOMINIO: readonly EtiquetaEndpoint[] = [
  ENDPOINTS.domainRating,
  ENDPOINTS.backlinksStats,
  ENDPOINTS.metrics,
  ENDPOINTS.topPages,
];

export interface ConsultaPlanificada {
  readonly etiqueta: string;
  readonly rutaApi: string;
  readonly objetivo: string;
  readonly params: Record<string, unknown>;
  readonly clave: string;
  readonly unidadesEstimadas: number;
  /** true si la respuesta ya esta en cache: reingerirla no cuesta unidades ni cambia nada. */
  readonly yaEnCache: boolean;
}

export interface OpcionesPlan {
  readonly cacheDir?: string | undefined;
  readonly endpoints?: readonly EtiquetaEndpoint[] | undefined;
}

/** Plan de consultas para una lista de dominios. NO emite ninguna peticion. */
export async function planDeDominios(
  dominios: readonly string[],
  opciones: OpcionesPlan = {},
): Promise<ConsultaPlanificada[]> {
  const etiquetas = opciones.endpoints ?? ENDPOINTS_DE_DOMINIO;
  const salida: ConsultaPlanificada[] = [];

  for (const dominio of dominios) {
    const objetivo = normalizarDominio(dominio);
    if (objetivo === "") continue;
    for (const etiqueta of etiquetas) {
      const params = paramsDeDominio(etiqueta, objetivo);
      const envelope = await leerConsulta(etiqueta, params, {
        ...(opciones.cacheDir === undefined ? {} : { cacheDir: opciones.cacheDir }),
      });
      salida.push({
        etiqueta,
        rutaApi: descriptor(etiqueta).rutaApi,
        objetivo,
        params,
        clave: claveDeConsulta(etiqueta, params),
        unidadesEstimadas: unidadesEstimadas(etiqueta),
        yaEnCache: envelope !== null,
      });
    }
  }
  return salida;
}

/** Plan de consultas para una lista de keywords. La usa el plan 13-04. */
export async function planDeKeywords(
  keywords: readonly string[],
  opciones: OpcionesPlan = {},
): Promise<ConsultaPlanificada[]> {
  const etiqueta = ENDPOINTS.keywordsOverview;
  const salida: ConsultaPlanificada[] = [];

  for (const keyword of keywords) {
    const limpia = keyword.trim();
    if (limpia === "") continue;
    const params = paramsDeKeyword(limpia);
    const envelope = await leerConsulta(etiqueta, params, {
      ...(opciones.cacheDir === undefined ? {} : { cacheDir: opciones.cacheDir }),
    });
    salida.push({
      etiqueta,
      rutaApi: descriptor(etiqueta).rutaApi,
      objetivo: limpia,
      params,
      clave: claveDeConsulta(etiqueta, params),
      unidadesEstimadas: unidadesEstimadas(etiqueta),
      yaEnCache: envelope !== null,
    });
  }
  return salida;
}

/** Cuenta consultas por endpoint, que es la forma que consume el libro de unidades. */
export function contarPorEndpoint(consultas: readonly ConsultaPlanificada[]): Record<string, number> {
  const salida: Record<string, number> = {};
  for (const c of consultas) salida[c.etiqueta] = (salida[c.etiqueta] ?? 0) + 1;
  return salida;
}

// ---------------------------------------------------------------------------
// Libro de unidades: data/ahrefs-usage.json
// ---------------------------------------------------------------------------

export interface CorridaDeUso {
  /** Plan que la produjo, por ejemplo "13-03". Es la clave de la entrada. */
  plan: string;
  /** `planificado` mientras las consultas no se ingirieron; `ingerido` cuando ya estan en cache. */
  estado: "planificado" | "ingerido";
  fecha: string;
  consultasPorEndpoint: Record<string, number>;
  consultas: number;
  unidadesEstimadas: number;
  nota?: string;
}

export interface LibroDeUso {
  schema: 1;
  fuente: string;
  cuenta: string;
  unidadesLibresDeclaradas: number;
  formulaDeCoste: string;
  origenDeLaFormula: string;
  consultasPorEndpoint: Record<string, number>;
  consultas: number;
  unidadesEstimadas: number;
  /**
   * ARREGLO, y esto es contrato con el plan 13-04, cuyo verify exige dos entradas acumuladas.
   * Cada plan AGREGA la suya; ninguno pisa lo anterior. Escribir un objeto plano o sobrescribir
   * haria fallar ese verify en el plan equivocado.
   */
  corridas: CorridaDeUso[];
}

function libroVacio(): LibroDeUso {
  return {
    schema: 1,
    fuente: FUENTE,
    cuenta: "Lite",
    unidadesLibresDeclaradas: 66000,
    formulaDeCoste: "max(costeBase, costePorFila * filas); costeBase = 50 unidades",
    origenDeLaFormula: "https://docs.ahrefs.com/en/api/docs/limits-consumption",
    consultasPorEndpoint: {},
    consultas: 0,
    unidadesEstimadas: 0,
    corridas: [],
  };
}

export async function leerLibroDeUso(ruta: string = RUTA_USO): Promise<LibroDeUso> {
  let crudo: string;
  try {
    crudo = await readFile(ruta, "utf8");
  } catch {
    return libroVacio();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(crudo);
  } catch (error) {
    throw new CliError(
      `El libro de unidades de Ahrefs no es JSON valido y NO se sobrescribe.\n` +
        `  Ruta: ${ruta}\n  Detalle: ${String(error)}\n` +
        `  Pisarlo perderia el consumo acumulado de las corridas anteriores.`,
    );
  }

  const base = libroVacio();
  if (parsed === null || typeof parsed !== "object") return base;
  const o = parsed as Record<string, unknown>;

  if (!Array.isArray(o["corridas"])) {
    throw new CliError(
      `El libro de unidades de Ahrefs no trae el arreglo "corridas" y NO se sobrescribe.\n` +
        `  Ruta: ${ruta}\n` +
        `  Es contrato con el plan 13-04: cada plan AGREGA su entrada, ninguno pisa lo anterior.`,
    );
  }

  // Los totales de primer nivel se RECALCULAN siempre desde las corridas y nunca se leen del
  // archivo. Si alguien editara a mano el total sin tocar el detalle, el archivo mentiria
  // sobre su propio contenido y nadie lo notaria.
  return recalcular({
    ...base,
    ...(typeof o["cuenta"] === "string" ? { cuenta: o["cuenta"] } : {}),
    ...(typeof o["unidadesLibresDeclaradas"] === "number"
      ? { unidadesLibresDeclaradas: o["unidadesLibresDeclaradas"] }
      : {}),
    corridas: (o["corridas"] as unknown[]).filter(
      (c): c is CorridaDeUso => c !== null && typeof c === "object" && typeof (c as CorridaDeUso).plan === "string",
    ),
  });
}

/** Recalcula los totales de primer nivel a partir de las corridas. Nunca al reves. */
function recalcular(libro: LibroDeUso): LibroDeUso {
  const porEndpoint: Record<string, number> = {};
  let consultas = 0;
  let unidades = 0;

  for (const corrida of libro.corridas) {
    for (const [etiqueta, n] of Object.entries(corrida.consultasPorEndpoint)) {
      porEndpoint[etiqueta] = (porEndpoint[etiqueta] ?? 0) + n;
    }
    consultas += corrida.consultas;
    unidades += corrida.unidadesEstimadas;
  }

  const ordenado: Record<string, number> = {};
  for (const clave of Object.keys(porEndpoint).sort()) ordenado[clave] = porEndpoint[clave] as number;

  return { ...libro, consultasPorEndpoint: ordenado, consultas, unidadesEstimadas: unidades };
}

export interface ActualizacionDeCorrida {
  readonly plan: string;
  readonly estado: "planificado" | "ingerido";
  readonly fecha: string;
  readonly consultasPorEndpoint: Readonly<Record<string, number>>;
  readonly nota?: string | undefined;
}

/**
 * Agrega o actualiza LA ENTRADA DE UN PLAN dentro del arreglo `corridas`.
 *
 * Nunca toca las entradas de otros planes. Es lo que permite que 13-03 y 13-04 sumen sus
 * consumos en el mismo archivo sin coordinarse.
 */
export async function registrarCorrida(
  actualizacion: ActualizacionDeCorrida,
  ruta: string = RUTA_USO,
): Promise<LibroDeUso> {
  const libro = await leerLibroDeUso(ruta);

  const porEndpoint: Record<string, number> = {};
  let consultas = 0;
  let unidades = 0;
  for (const etiqueta of Object.keys(actualizacion.consultasPorEndpoint).sort()) {
    const n = actualizacion.consultasPorEndpoint[etiqueta] as number;
    if (n <= 0) continue;
    porEndpoint[etiqueta] = n;
    consultas += n;
    unidades += unidadesEstimadas(etiqueta) * n;
  }

  const entrada: CorridaDeUso = {
    plan: actualizacion.plan,
    estado: actualizacion.estado,
    fecha: actualizacion.fecha,
    consultasPorEndpoint: porEndpoint,
    consultas,
    unidadesEstimadas: unidades,
    ...(actualizacion.nota === undefined ? {} : { nota: actualizacion.nota }),
  };

  const corridas = [...libro.corridas];
  const i = corridas.findIndex((c) => c.plan === entrada.plan);

  if (i === -1) {
    corridas.push(entrada);
  } else if ((corridas[i] as CorridaDeUso).estado === "ingerido" && entrada.estado === "planificado") {
    // Lo ya ingerido gana sobre lo previsto: volver a correr el planificador no puede borrar
    // el consumo que de verdad ocurrio.
    return recalcular(libro);
  } else {
    corridas[i] = entrada;
  }

  const actualizado = recalcular({ ...libro, corridas });

  await mkdir(path.dirname(ruta), { recursive: true });
  await writeFile(ruta, `${JSON.stringify(actualizado, null, 2)}\n`, "utf8");
  return actualizado;
}

/**
 * Suma UNA consulta ingerida a la entrada de un plan, sin tocar las de los demas.
 *
 * Es la operacion que usa la ingesta: incremental, porque las respuestas llegan de a una y
 * cada una tiene que quedar contada apenas entra, no al final de un lote que puede
 * interrumpirse.
 */
export async function sumarConsultaIngerida(
  plan: string,
  etiqueta: string,
  fecha: string,
  ruta: string = RUTA_USO,
): Promise<LibroDeUso> {
  const libro = await leerLibroDeUso(ruta);
  const previa = libro.corridas.find((c) => c.plan === plan);
  const porEndpoint: Record<string, number> = { ...(previa?.consultasPorEndpoint ?? {}) };
  porEndpoint[etiqueta] = (porEndpoint[etiqueta] ?? 0) + 1;

  return registrarCorrida(
    {
      plan,
      estado: "ingerido",
      fecha,
      consultasPorEndpoint: porEndpoint,
      nota:
        "Consumo real: cada consulta se conto al entrar a la cache. Reingerir el mismo cuerpo " +
        "no vuelve a contar.",
    },
    ruta,
  );
}

// ---------------------------------------------------------------------------
// Ingesta: la mitad de abajo del traspaso
// ---------------------------------------------------------------------------

/** JSON con claves ordenadas: la unica forma honesta de comparar dos cuerpos por contenido. */
function estable(valor: unknown): string {
  if (valor === null || typeof valor !== "object") return JSON.stringify(valor) ?? "null";
  if (Array.isArray(valor)) return `[${valor.map(estable).join(",")}]`;
  const o = valor as Record<string, unknown>;
  return `{${Object.keys(o)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${estable(o[k])}`)
    .join(",")}}`;
}

export interface OpcionesIngesta {
  readonly etiqueta: string;
  readonly params: Record<string, unknown>;
  /** El cuerpo TAL CUAL llego, sin parsear: el control de credenciales corre sobre el texto. */
  readonly cuerpoCrudo: string;
  readonly cacheDir: string;
  /** Plan que la contabiliza, por ejemplo "13-03". */
  readonly plan: string;
  /** Reloj inyectable. Las pruebas lo fijan para poder comparar archivos byte a byte. */
  readonly ahora?: string | undefined;
  readonly rutaUso?: string | undefined;
  /** Libro de cuota ya abierto. Si falta, se abre sobre `cacheDir`. */
  readonly quota?: QuotaBook | undefined;
}

export interface ResultadoIngesta {
  readonly clave: string;
  readonly archivo: string;
  readonly outcome: Outcome;
  /** true si el mismo cuerpo ya estaba en cache: no se reescribio y no se conto cuota. */
  readonly yaEstaba: boolean;
  readonly cuotaRegistrada: boolean;
  /** true si habia un cuerpo DISTINTO bajo la misma clave y se reemplazo. */
  readonly reemplazo: boolean;
  /** Campos que trajo la respuesta, para ver una deriva de contrato sin abrir el archivo. */
  readonly campos: string[];
  /** Lo que el parser del endpoint saco del cuerpo. Vacio significa contrato roto. */
  readonly parseado: unknown;
}

/**
 * Persiste un cuerpo crudo ya obtenido bajo la clave que le corresponde y cuenta la consulta.
 *
 * Un solo paso: computa la clave, valida, persiste y cuenta. Que la clave la calcule el
 * proyecto y no la persona es lo que evita que un dato quede guardado donde nadie lo busca.
 *
 * Reglas duras:
 *   - Un cuerpo que no es JSON valido aborta SIN escribir nada.
 *   - Un cuerpo con algo con forma de credencial aborta SIN escribir nada (T-13-20).
 *   - Reingerir el MISMO cuerpo no reescribe el archivo y NO vuelve a contar cuota.
 *   - Una respuesta vacia se persiste igual, con `outcome: "empty"`, porque para Ahrefs vacio
 *     significa "la fuente no conoce este dato" y eso es informacion, no ausencia de ella.
 */
export async function ingerirCuerpo(opciones: OpcionesIngesta): Promise<ResultadoIngesta> {
  const d = descriptor(opciones.etiqueta);

  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(opciones.cuerpoCrudo);
  } catch (error) {
    throw new CliError(
      `El cuerpo capturado no es JSON valido y NO se escribio nada.\n` +
        `  Endpoint: ${d.etiqueta} (${d.rutaApi})\n` +
        `  Detalle: ${error instanceof Error ? error.message : String(error)}\n` +
        `  Accion: volver a capturar la respuesta del MCP y guardarla como JSON crudo, sin\n` +
        `  envolverla en texto ni recortarla.`,
    );
  }

  const sospechas = buscarCredenciales(opciones.cuerpoCrudo);
  if (sospechas.length > 0) {
    throw new CliError(
      `El cuerpo capturado trae algo con forma de credencial y NO se escribio nada (T-13-20).\n` +
        `  Endpoint: ${d.etiqueta}\n` +
        `  Patrones que dieron positivo: ${sospechas.join(", ")}\n` +
        `  Accion: revisar la respuesta a mano. Este control corre ANTES de tocar el disco\n` +
        `  justamente para que nada de eso llegue al repositorio.`,
    );
  }

  const clave = claveDeConsulta(d.etiqueta, opciones.params);
  const archivo = cachePath(opciones.cacheDir, FUENTE, clave);
  const previa = await readEnvelope(opciones.cacheDir, FUENTE, clave);
  const campos = describirCampos(cuerpo);
  const parseado = parsearPorEndpoint(d.etiqueta, cuerpo);

  if (previa !== null && estable(previa.response) === estable(cuerpo)) {
    // Ni se reescribe ni se cuenta: el archivo queda byte a byte como estaba, con su
    // `fetchedAt` original, que es la marca de cuando el dato se obtuvo de verdad.
    return {
      clave,
      archivo,
      outcome: previa.outcome,
      yaEstaba: true,
      cuotaRegistrada: false,
      reemplazo: false,
      campos,
      parseado,
    };
  }

  const envelope: CacheEnvelope = {
    schema: 1,
    source: FUENTE,
    endpoint: d.etiqueta,
    request: opciones.params,
    fetchedAt: opciones.ahora ?? new Date().toISOString(),
    outcome: esVacia(d.etiqueta, cuerpo) ? "empty" : "ok",
    httpStatus: 200,
    response: cuerpo,
    error: null,
  };

  await writeEnvelope(opciones.cacheDir, clave, envelope);

  const quota = opciones.quota ?? (await QuotaBook.open(opciones.cacheDir));
  await quota.record(FUENTE, `${d.etiqueta} ${JSON.stringify(opciones.params["target"] ?? opciones.params["keyword"] ?? "")}`);

  await sumarConsultaIngerida(
    opciones.plan,
    d.etiqueta,
    (opciones.ahora ?? new Date().toISOString()).slice(0, 10),
    opciones.rutaUso ?? RUTA_USO,
  );

  return {
    clave,
    archivo,
    outcome: envelope.outcome,
    yaEstaba: false,
    cuotaRegistrada: true,
    reemplazo: previa !== null,
    campos,
    parseado,
  };
}

/** Aplica el parser que le toca a cada endpoint. Es lo que hace visible una deriva de contrato. */
export function parsearPorEndpoint(etiqueta: string, cuerpo: unknown): unknown {
  switch (descriptor(etiqueta).etiqueta) {
    case ENDPOINTS.domainRating:
      return parsearDomainRating(cuerpo);
    case ENDPOINTS.backlinksStats:
      return parsearBacklinksStats(cuerpo);
    case ENDPOINTS.metrics:
      return parsearMetrics(cuerpo);
    case ENDPOINTS.topPages:
      return parsearTopPages(cuerpo);
    default:
      // `keywords-explorer/overview` la parsea el plan 13-04, que es el que la consume.
      return null;
  }
}
