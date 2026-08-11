/**
 * Clusters de la fase 13: por solape de SERP arriba, por parecido de texto en la cola.
 *
 * ================================================================================
 * POR QUE HAY DOS PROCEDENCIAS Y POR QUE LA MARCA NO ES DECORATIVA
 * ================================================================================
 *
 * KWR-04 pide clusters por SOLAPE DE SERP, no por parecido de texto. Con 114 busquedas hasta
 * el 2026-08-21 y 4.766 keywords de alcance objetivo, capturar la SERP de cada una seria el
 * 2,4 % de lo necesario. Asi que la fase compra precision donde decide —las 91 cabezas— y
 * propaga por texto en el resto.
 *
 * Eso deja un dataset con dos calidades de dato conviviendo, y la unica forma honesta de
 * publicarlo es que cada fila diga cual de las dos es:
 *
 *   clusterFuente: "serp"   lo valido Google: tres o mas URLs compartidas en el top 10
 *   clusterFuente: "texto"  lo infirio el parecido de texto contra una cabeza ya validada
 *   clusterFuente: null     no alcanzo ningun umbral y quedo sin cluster
 *
 * Sin esa marca el dataset MIENTE SOBRE SU PROPIA PROCEDENCIA: alguien leeria 4.766 clusters
 * como si los 4.766 estuvieran validados contra Google, cuando 91 lo estan. Es la misma
 * disciplina que la fase 12 aplico al dejar la celda de volumen vacia en vez de escribir cero.
 *
 * Por la misma razon una fila de la cola NUNCA hereda el `topResult` de su cabeza: escribir
 * ahi el resultado de otra keyword seria afirmar algo que nadie midio.
 *
 * ================================================================================
 * EL UMBRAL, Y POR QUE SE COMPARAN URLS Y NO DOMINIOS
 * ================================================================================
 *
 * Tres URLs compartidas en el top 10 unen dos cabezas; dos las dejan separadas (D-05).
 *
 * La comparacion es por URL COMPLETA normalizada y no por dominio. Dos articulos distintos de
 * la misma clinica no son la misma respuesta de Google: si se comparara por dominio,
 * `mayoclinic.org` apareciendo en 46 de los 95 organicos medidos por el plan 13-01 pegaria
 * entre si a casi todas las condiciones del universo y el clustering no diria nada.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { SEO_TOOLS_ROOT } from "../config.js";
import { clasificarSerp, cargarReglasDeTipo, type ReglasDeTipo } from "./pagetype.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import type { SerpCompleta } from "./serp.js";

const RUTA_NOMBRES = path.join(SEO_TOOLS_ROOT, "data", "cluster-nombres.json");

/**
 * Lee los renombres declarados de cluster. Archivo ausente o ilegible devuelve vacio: un
 * renombre es una mejora de presentacion y su falta no puede tumbar el clustering entero.
 */
export function cargarNombresDeCluster(ruta: string = RUTA_NOMBRES): Record<string, string> {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    return {};
  }

  let parseado: unknown;
  try {
    parseado = JSON.parse(crudo);
  } catch {
    return {};
  }
  if (parseado === null || typeof parseado !== "object") return {};

  const nombres = (parseado as Record<string, unknown>)["nombres"];
  if (nombres === null || typeof nombres !== "object" || Array.isArray(nombres)) return {};

  const salida: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(nombres as Record<string, unknown>)) {
    if (valor === null || typeof valor !== "object") continue;
    const nombre = (valor as Record<string, unknown>)["nombre"];
    if (typeof nombre === "string" && nombre.trim() !== "") salida[normalizeKeyword(clave)] = nombre;
  }
  return salida;
}

/** URLs compartidas en el top 10 que hacen falta para unir dos cabezas (D-05). */
export const UMBRAL_SOLAPE = 3;

/** Hasta que posicion se mira. El top 10 es el que define la SERP para KWR-04. */
export const TOPE_DEL_TOP = 10;

/**
 * Indice de Jaccard minimo para que una keyword de la cola herede el cluster de una cabeza.
 *
 * Calibrado, no elegido al azar: con 0,5 el par `hernia discal lima` / `hernia inguinal lima`
 * puntua 1/3 y queda SEPARADO, que es lo correcto porque una hernia inguinal no es de columna.
 * Bajarlo a 0,3 los pegaria. El umbral y la condicion de termino clinico compartido trabajan
 * juntos: ninguno de los dos solo alcanza.
 */
export const UMBRAL_SIMILITUD = 0.5;

/** Largo minimo de un token para contar como termino clinico. */
export const LARGO_TERMINO_CLINICO = 4;

/**
 * Parametros de rastreo que no cambian la pagina. Si entraran a la clave, la misma URL con y
 * sin campana contaria como dos respuestas distintas y el solape se subestimaria.
 */
const PARAMETROS_DE_RASTREO = /^(utm_|gclid$|fbclid$|msclkid$|mc_[ce]id$|_ga$|ref$|source$|igshid$|si$)/i;

/**
 * URL normalizada para comparar: esquema fuera, `www.` fuera, barra final fuera, fragmento
 * fuera y parametros de rastreo fuera, con los que quedan ordenados.
 *
 * Devuelve null si no parsea. Una URL malformada dentro de una captura no puede tumbar el
 * clustering entero: se ignora ese resultado y se sigue.
 */
export function normalizarUrl(cruda: string): string | null {
  let u: URL;
  try {
    u = new URL(cruda);
  } catch {
    return null;
  }

  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  const ruta = u.pathname.replace(/\/+$/, "");

  const parametros = [...u.searchParams.entries()]
    .filter(([k]) => !PARAMETROS_DE_RASTREO.test(k))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const query =
    parametros.length === 0 ? "" : `?${parametros.map(([k, v]) => `${k}=${v}`).join("&")}`;

  return `${host}${ruta}${query}`;
}

/** Conjunto de URLs normalizadas del top 10 de una SERP. */
export function urlsDelTop(serp: SerpCompleta, tope: number = TOPE_DEL_TOP): Set<string> {
  const urls = new Set<string>();
  for (const organico of serp.organicos) {
    if (organico.posicion > tope) continue;
    const normalizada = normalizarUrl(organico.url);
    if (normalizada !== null) urls.add(normalizada);
  }
  return urls;
}

/** El primer organico, que es lo que la fase 14 lee como `Top Result`. */
export function topResultDe(serp: SerpCompleta): string | null {
  const primero = [...serp.organicos].sort((a, b) => a.posicion - b.posicion)[0];
  return primero?.url ?? null;
}

// --- Tokenizacion para la cola ---

/**
 * Palabras que no distinguen nada entre dos keywords del mismo dominio clinico. Sin quitarlas,
 * `que es la ciatica` y `que es la escoliosis` puntuarian alto por `que`, `es` y `la`.
 */
const VACIAS = new Set([
  "a", "al", "algo", "como", "con", "cual", "cuales", "cuando", "de", "del", "donde", "e",
  "el", "en", "es", "esta", "este", "hay", "la", "las", "le", "les", "lo", "los", "mas",
  "me", "mi", "muy", "no", "o", "para", "por", "que", "se", "si", "son", "su", "sus", "te",
  "un", "una", "unas", "unos", "y", "ya", "mejor", "mejores", "buen", "buena", "buenas",
  "buenos", "cerca", "cuanto", "cuesta", "precio", "sirve", "tipos", "tipo",
]);

/**
 * Modificadores geograficos. Se quitan a proposito ANTES de medir el parecido: si se dejaran,
 * `traumatologo lima` y `escoliosis lima` compartirian `lima` y puntuarian como si hablaran de
 * lo mismo. El geo es terreno, no tema.
 */
const GEOGRAFICOS = new Set([
  "lima", "peru", "surco", "santiago", "isidro", "san", "molina", "miraflores", "borja",
  "chorrillos", "barranco", "callao", "jesus", "maria", "magdalena", "pueblo", "libre",
  "distrito", "cercado", "provincia", "departamento", "metropolitana",
]);

/** Tokens significativos de una keyword: normalizados, sin vacias y sin geo. */
export function tokens(keyword: string): Set<string> {
  const salida = new Set<string>();
  for (const token of normalizeKeyword(keyword).split(" ")) {
    if (token === "") continue;
    if (VACIAS.has(token)) continue;
    if (GEOGRAFICOS.has(token)) continue;
    salida.add(token);
  }
  return salida;
}

/**
 * Terminos clinicos: los tokens significativos de cuatro letras o mas.
 *
 * No hay diccionario cerrado a proposito. Un diccionario habria que mantenerlo y fallaria en
 * silencio con cada termino nuevo; el criterio de largo es una funcion de los datos y se
 * comporta igual con lo que todavia no esta escrito.
 */
export function terminosClinicos(keyword: string): Set<string> {
  const salida = new Set<string>();
  for (const token of tokens(keyword)) {
    if (token.length >= LARGO_TERMINO_CLINICO) salida.add(token);
  }
  return salida;
}

function jaccard(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let interseccion = 0;
  for (const x of a) if (b.has(x)) interseccion += 1;
  const union = a.size + b.size - interseccion;
  return union === 0 ? 0 : interseccion / union;
}

function comparten(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  for (const x of a) if (b.has(x)) return true;
  return false;
}

// --- Union-busqueda sobre las cabezas ---

export interface CabezaConSerp {
  readonly keyword: string;
  readonly keywordKey: string;
  /** Rango de valor de negocio de la lista de candidatas. Menor es mas valioso. */
  readonly rango: number;
  readonly familia: string;
  readonly serp: SerpCompleta;
}

/** Por que dos cabezas quedaron unidas: las URLs concretas que lo justifican. */
export interface UnionJustificada {
  readonly a: string;
  readonly b: string;
  readonly urls: readonly string[];
}

class UnionBusqueda {
  #padre = new Map<string, string>();

  raiz(x: string): string {
    const p = this.#padre.get(x);
    if (p === undefined) {
      this.#padre.set(x, x);
      return x;
    }
    if (p === x) return x;
    const r = this.raiz(p);
    this.#padre.set(x, r);
    return r;
  }

  unir(a: string, b: string): void {
    const ra = this.raiz(a);
    const rb = this.raiz(b);
    if (ra === rb) return;
    // Desempate estable por clave: sin esto el arbol depende del orden de las uniones.
    if (ra < rb) this.#padre.set(rb, ra);
    else this.#padre.set(ra, rb);
  }
}

export interface Cluster {
  readonly id: string;
  readonly nombre: string;
  readonly rango: number;
  readonly familia: string;
  readonly cabezas: readonly string[];
  readonly uniones: readonly UnionJustificada[];
  readonly tipoDePagina: string;
  readonly repartoDeTipos: Record<string, number>;
  readonly topResult: string | null;
  readonly keywords: number;
  readonly validadasPorSerp: number;
  readonly inferidasPorTexto: number;
}

/** Identificador estable derivado del nombre. No depende del orden ni de la corrida. */
export function idDeCluster(nombre: string): string {
  return normalizeKeyword(nombre).replace(/\s+/g, "-").replace(/-+/g, "-");
}

/**
 * Agrupa las cabezas por solape de SERP. NADA de comparar texto en este paso: es exactamente
 * lo que KWR-04 prohibe.
 *
 * La union es transitiva: si A comparte con B y B con C, los tres caen juntos aunque A y C
 * compartan menos de tres. Es una consecuencia de la union-busqueda y esta puesta a proposito,
 * porque el solape de SERP es evidencia de que Google trata al conjunto como un mismo tema.
 */
export function agruparCabezas(
  cabezas: readonly CabezaConSerp[],
  opciones: {
    readonly umbral?: number;
    readonly reglas?: ReglasDeTipo;
    /**
     * Renombres explicitos, por clave normalizada de la cabeza principal.
     *
     * La regla automatica de abajo NO cambia: sigue nombrando por la cabeza de mayor valor de
     * negocio, que es lo que hace el nombre reproducible entre corridas. Esto es la excepcion
     * declarada, y vive en `data/cluster-nombres.json` con su motivo y su fecha en vez de en
     * una bandera de linea de comandos que se pierde al terminar la corrida.
     */
    readonly nombres?: Readonly<Record<string, string>>;
  } = {},
): Cluster[] {
  const umbral = opciones.umbral ?? UMBRAL_SOLAPE;
  const reglas = opciones.reglas ?? cargarReglasDeTipo();
  const renombres = opciones.nombres ?? {};

  const urls = new Map<string, Set<string>>();
  for (const cabeza of cabezas) urls.set(cabeza.keywordKey, urlsDelTop(cabeza.serp));

  const uf = new UnionBusqueda();
  for (const cabeza of cabezas) uf.raiz(cabeza.keywordKey);

  const uniones: UnionJustificada[] = [];
  for (let i = 0; i < cabezas.length; i += 1) {
    for (let j = i + 1; j < cabezas.length; j += 1) {
      const a = cabezas[i] as CabezaConSerp;
      const b = cabezas[j] as CabezaConSerp;
      const ua = urls.get(a.keywordKey) as Set<string>;
      const ub = urls.get(b.keywordKey) as Set<string>;

      const compartidas: string[] = [];
      for (const u of ua) if (ub.has(u)) compartidas.push(u);

      if (compartidas.length >= umbral) {
        uf.unir(a.keywordKey, b.keywordKey);
        uniones.push({ a: a.keywordKey, b: b.keywordKey, urls: compartidas.sort() });
      }
    }
  }

  const porRaiz = new Map<string, CabezaConSerp[]>();
  for (const cabeza of cabezas) {
    const raiz = uf.raiz(cabeza.keywordKey);
    const grupo = porRaiz.get(raiz);
    if (grupo === undefined) porRaiz.set(raiz, [cabeza]);
    else grupo.push(cabeza);
  }

  const clusters: Cluster[] = [];
  for (const [raiz, grupo] of porRaiz) {
    // El nombre es la cabeza de MAYOR valor de negocio, con desempate por clave normalizada
    // para que dos corridas no lo cambien.
    const ordenadas = [...grupo].sort(
      (x, y) => x.rango - y.rango || (x.keywordKey < y.keywordKey ? -1 : 1),
    );
    const principal = ordenadas[0] as CabezaConSerp;
    const clasificada = clasificarSerp(principal.serp, reglas);
    const clavesDelGrupo = new Set(grupo.map((c) => c.keywordKey));

    // El renombre se aplica DESPUES de que la regla eligio la cabeza principal, asi que no
    // puede cambiar que cabezas se agrupan ni cual manda: solo como se llama el resultado.
    const nombre = renombres[principal.keywordKey] ?? principal.keyword;

    clusters.push({
      id: idDeCluster(nombre),
      nombre,
      rango: principal.rango,
      familia: principal.familia,
      cabezas: ordenadas.map((c) => c.keywordKey),
      uniones: uniones
        .filter((u) => clavesDelGrupo.has(u.a) && clavesDelGrupo.has(u.b))
        .sort((x, y) => (x.a + x.b < y.a + y.b ? -1 : 1)),
      tipoDePagina: clasificada.tipoDominante ?? reglas.porDefecto,
      repartoDeTipos: clasificada.reparto,
      topResult: topResultDe(principal.serp),
      keywords: 0,
      validadasPorSerp: 0,
      inferidasPorTexto: 0,
    });
    void raiz;
  }

  return clusters.sort((a, b) => a.rango - b.rango || (a.id < b.id ? -1 : 1));
}

// --- La cola ---

export interface FilaDeCluster {
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly clusterFuente: "serp" | "texto" | null;
  readonly topResult: string | null;
}

export interface AsignacionDeCola {
  readonly filas: FilaDeCluster[];
  readonly porTexto: number;
  readonly sinCluster: number;
  readonly similitudMedia: number;
}

interface CabezaIndexada {
  readonly keywordKey: string;
  readonly clusterId: string;
  readonly tokens: Set<string>;
  readonly clinicos: Set<string>;
}

/**
 * Asigna cada keyword de la cola a la cabeza mas parecida.
 *
 * DOS CONDICIONES, y hacen falta las dos:
 *   1. el indice de Jaccard sobre los tokens significativos supera el umbral;
 *   2. comparten al menos un termino clinico de cuatro letras o mas.
 *
 * Sin la segunda, `hernia discal lima` y `hernia inguinal lima` se pegarian por los tokens
 * equivocados. Con la segunda pero sin la primera, cualquier par que comparta `columna` caeria
 * junto. Lo que no alcanza ninguno de los dos umbrales queda `sin_cluster`, que es informacion
 * y no un fallo: forzar una asignacion dudosa contaminaria el dataset.
 */
export function asignarCola(
  universo: readonly { readonly keyword: string; readonly keywordKey: string }[],
  cabezas: readonly CabezaConSerp[],
  clusters: readonly Cluster[],
  opciones: { readonly umbral?: number } = {},
): AsignacionDeCola {
  const umbral = opciones.umbral ?? UMBRAL_SIMILITUD;

  const clusterPorCabeza = new Map<string, string>();
  for (const cluster of clusters) {
    for (const cabeza of cluster.cabezas) clusterPorCabeza.set(cabeza, cluster.id);
  }

  const serpPorCabeza = new Map<string, SerpCompleta>();
  for (const cabeza of cabezas) serpPorCabeza.set(cabeza.keywordKey, cabeza.serp);

  const indice: CabezaIndexada[] = cabezas
    .map((c) => ({
      keywordKey: c.keywordKey,
      clusterId: clusterPorCabeza.get(c.keywordKey) as string,
      tokens: tokens(c.keyword),
      clinicos: terminosClinicos(c.keyword),
    }))
    .filter((c) => c.clinicos.size > 0);

  const filas: FilaDeCluster[] = [];
  let porTexto = 0;
  let sinCluster = 0;
  let sumaSimilitud = 0;

  for (const fila of universo) {
    const serpPropia = serpPorCabeza.get(fila.keywordKey);
    if (serpPropia !== undefined) {
      // Es cabeza: su cluster lo valido Google y su topResult es SUYO.
      filas.push({
        keywordKey: fila.keywordKey,
        cluster: clusterPorCabeza.get(fila.keywordKey) ?? null,
        clusterFuente: "serp",
        topResult: topResultDe(serpPropia),
      });
      continue;
    }

    const misTokens = tokens(fila.keyword);
    const misClinicos = terminosClinicos(fila.keyword);

    let mejor: CabezaIndexada | null = null;
    let mejorPuntaje = 0;

    for (const cabeza of indice) {
      if (!comparten(misClinicos, cabeza.clinicos)) continue;
      const puntaje = jaccard(misTokens, cabeza.tokens);
      if (puntaje < umbral) continue;
      // Desempate por clave normalizada: dos corridas tienen que elegir la misma cabeza.
      if (
        mejor === null ||
        puntaje > mejorPuntaje ||
        (puntaje === mejorPuntaje && cabeza.keywordKey < mejor.keywordKey)
      ) {
        mejor = cabeza;
        mejorPuntaje = puntaje;
      }
    }

    if (mejor === null) {
      sinCluster += 1;
      filas.push({
        keywordKey: fila.keywordKey,
        cluster: null,
        clusterFuente: null,
        topResult: null,
      });
      continue;
    }

    porTexto += 1;
    sumaSimilitud += mejorPuntaje;
    // topResult VACIO a proposito: esta keyword no tiene SERP propia y heredar la de su cabeza
    // seria afirmar algo que nadie midio.
    filas.push({
      keywordKey: fila.keywordKey,
      cluster: mejor.clusterId,
      clusterFuente: "texto",
      topResult: null,
    });
  }

  return {
    filas,
    porTexto,
    sinCluster,
    similitudMedia: porTexto === 0 ? 0 : sumaSimilitud / porTexto,
  };
}

/** Rellena los contadores de cada cluster con lo que produjo la asignacion. */
export function contarPorCluster(
  clusters: readonly Cluster[],
  filas: readonly FilaDeCluster[],
): Cluster[] {
  const conteo = new Map<string, { total: number; serp: number; texto: number }>();
  for (const cluster of clusters) conteo.set(cluster.id, { total: 0, serp: 0, texto: 0 });

  for (const fila of filas) {
    if (fila.cluster === null) continue;
    const c = conteo.get(fila.cluster);
    if (c === undefined) continue;
    c.total += 1;
    if (fila.clusterFuente === "serp") c.serp += 1;
    else if (fila.clusterFuente === "texto") c.texto += 1;
  }

  return clusters.map((cluster) => {
    const c = conteo.get(cluster.id) ?? { total: 0, serp: 0, texto: 0 };
    return {
      ...cluster,
      keywords: c.total,
      validadasPorSerp: c.serp,
      inferidasPorTexto: c.texto,
    };
  });
}
