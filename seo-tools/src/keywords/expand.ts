/**
 * Consolidacion del universo candidato: deduplicacion y filtros.
 *
 * Dos responsabilidades y nada mas: colapsar contra la forma normalizada, y decidir que entra
 * al universo. La orquestacion de capas y todo lo que toca la red vive en el subcomando; aca
 * no hay efectos, para que el filtro se pueda probar sin clave y sin cache.
 *
 * Regla que atraviesa todo el modulo: **una keyword sin datos NO se descarta.** Solo el 16%
 * de las relacionadas que devuelve la fuente real trae volumen medible (143 de 899 en la
 * medicion del 2026-08-10). Filtrar por "tiene volumen" derrumbaria el universo y tiraria
 * justo el long tail geolocalizado, que es el terreno donde un dominio de agosto de 2026 sin
 * historial puede ganar.
 */

import { cacheKey, type NetworkCall, type RunCounters } from "../cache.js";
import { QuotaExceededError, type QuotaBook } from "../quota.js";
import {
  DINORANK_ENDPOINT,
  DINORANK_FUENTE,
  keywordResearch,
  parametrosKeywordResearch,
} from "../sources/dinorank.js";
import {
  SERPAPI_ENDPOINT,
  SERPAPI_FUENTE,
  busquedaGeolocalizada,
  parametrosBusqueda,
  parametrosSugerencias,
  sugerencias,
} from "../sources/serpapi.js";
import { normalizeKeyword } from "./normalize.js";
import { permutar, type Modificadores } from "./permute.js";
import { contieneTerminoDominio, type Semilla } from "./seeds.js";

export type Capa = "permutacion" | "dinorank" | "serpapi-busqueda" | "serpapi-autocomplete";

export type EstadoCandidato = "sin_datos" | "con_datos";

export interface MetricasCandidato {
  searchVolume: number;
  cpc: number;
  competition: number;
  fuente: "dinorank";
}

export interface Candidato {
  /** Texto visible, con tildes. Es lo que se busca y lo que se escribe en el Sheet. */
  keyword: string;
  /** Forma normalizada. Clave de deduplicacion y de idempotencia del upsert. */
  keywordKey: string;
  /** Texto visible de la semilla de la que nacio. */
  semilla: string;
  capa: Capa;
  estado: EstadoCandidato;
  metricas?: MetricasCandidato;
}

export interface ResultadoConsolidacion {
  candidatos: Candidato[];
  /** Cuantos sobrevivieron, por capa. Es el conteo que prueba que el umbral no depende de la red. */
  porCapa: Record<string, number>;
  brutos: number;
  trasDeduplicar: number;
  trasFiltrar: number;
}

// --- Filtro de geografia ---

/**
 * Ciudades del Peru que no son Lima. Una keyword de otra ciudad no es un hueco de mercado:
 * es una consulta que este negocio no puede atender, porque la atencion es presencial y no
 * hay sede que la respalde.
 */
const CIUDADES_PERU_FUERA_DE_LIMA: readonly string[] = [
  "arequipa", "trujillo", "chiclayo", "piura", "cusco", "cuzco", "iquitos", "huancayo",
  "tacna", "puno", "juliaca", "ica", "chincha", "pisco", "nazca", "nasca", "chimbote",
  "pucallpa", "cajamarca", "ayacucho", "huaraz", "huanuco", "tarapoto", "moyobamba",
  "chachapoyas", "sullana", "talara", "tumbes", "moquegua", "ilo", "abancay",
  "huancavelica", "cerro de pasco", "tingo maria", "yurimaguas", "jaen", "tarma",
  "huacho", "barranca", "canete", "pisco", "ilave", "sicuani", "espinar",
];

/**
 * Geografia de fuera del pais. La fuente de expansion resuelve el long tail en espanol con un
 * backend global, asi que devuelve keywords de Espana y de Mexico mezcladas con las de Peru.
 * Traen volumen real, pero de un mercado que este consultorio no atiende.
 */
const GEO_EXTRANJERO: readonly string[] = [
  "espana", "madrid", "barcelona", "valencia", "sevilla", "zaragoza", "malaga", "bilbao",
  "murcia", "alicante", "granada", "mexico", "cdmx", "guadalajara", "monterrey", "puebla",
  "colombia", "bogota", "medellin", "cali", "barranquilla", "chile", "santiago de chile",
  "valparaiso", "argentina", "buenos aires", "rosario", "mendoza", "ecuador", "quito",
  "guayaquil", "cuenca", "bolivia", "la paz", "santa cruz", "venezuela", "caracas",
  "maracaibo", "uruguay", "montevideo", "paraguay", "asuncion", "panama", "costa rica",
  "guatemala", "el salvador", "honduras", "nicaragua", "cuba", "la habana",
  "republica dominicana", "santo domingo", "puerto rico", "estados unidos", "miami",
  "new york", "houston", "los angeles", "california", "florida", "texas", "brasil",
  "sao paulo", "portugal", "lisboa",
];

/**
 * Instituciones de seguridad social de otros paises. Aparecen pegadas a las condiciones
 * ("hernia discal incapacidad permanente") y no son geograficas, pero delatan el mismo
 * problema: la consulta es de otro sistema de salud.
 */
const INSTITUCIONES_AJENAS: readonly string[] = [
  "inss", "imss", "issste", "baja laboral", "incapacidad permanente", "obra social",
  "mutua", "invalidez permanente", "tribunal medico",
];

const escapar = (texto: string): string => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Compara por PALABRA COMPLETA, no por subcadena: "ciatica" contiene "ica" y no es la
 *  ciudad de Ica. Un filtro por subcadena tiraria condiciones legitimas en silencio. */
function construirPatron(terminos: readonly string[]): RegExp {
  const alternativas = [...new Set(terminos)].map(escapar).join("|");
  return new RegExp(`(^|\\s)(${alternativas})(\\s|$)`, "u");
}

const PATRON_GEO_AJENO = construirPatron([
  ...CIUDADES_PERU_FUERA_DE_LIMA,
  ...GEO_EXTRANJERO,
  ...INSTITUCIONES_AJENAS,
]);

/** Verdadero cuando la keyword nombra una geografia que este negocio no atiende. */
export const esGeoAjeno = (clave: string): boolean => PATRON_GEO_AJENO.test(clave);

/** Verdadero cuando la keyword contiene al menos un termino del dominio medico o de
 *  especialidad. Sin esto el universo se llena de frases de logistica que nadie busca. */
export const esRelevante = (clave: string): boolean => contieneTerminoDominio(clave);

// --- Consolidacion ---

/**
 * Deduplica contra la forma normalizada y aplica los dos filtros. Gana la primera aparicion,
 * y como las capas se recorren de la mas barata a la mas cara, la procedencia que queda
 * registrada es la de la capa que primero encontro la keyword.
 */
export function consolidar(brutos: readonly Candidato[]): ResultadoConsolidacion {
  const porClave = new Map<string, Candidato>();

  for (const bruto of brutos) {
    const clave = bruto.keywordKey !== "" ? bruto.keywordKey : normalizeKeyword(bruto.keyword);
    if (clave === "") continue;
    if (porClave.has(clave)) continue;
    porClave.set(clave, { ...bruto, keywordKey: clave });
  }

  const trasDeduplicar = porClave.size;
  const candidatos: Candidato[] = [];
  const porCapa: Record<string, number> = {};

  for (const candidato of porClave.values()) {
    if (!esRelevante(candidato.keywordKey)) continue;
    if (esGeoAjeno(candidato.keywordKey)) continue;

    candidatos.push(candidato);
    porCapa[candidato.capa] = (porCapa[candidato.capa] ?? 0) + 1;
  }

  return {
    candidatos,
    porCapa,
    brutos: brutos.length,
    trasDeduplicar,
    trasFiltrar: candidatos.length,
  };
}

/**
 * Una linea por candidato. Se eligio este formato por sobre el separado por comas porque las
 * keywords en espanol llevan comas y porque el diff de git queda legible sin entrecomillado.
 * El orden de las claves es fijo para que dos corridas produzcan el mismo archivo.
 */
export function serializarCandidatos(candidatos: readonly Candidato[]): string {
  const lineas = candidatos.map((c) => {
    const objeto: Record<string, unknown> = {
      keyword: c.keyword,
      keywordKey: c.keywordKey,
      semilla: c.semilla,
      capa: c.capa,
      estado: c.estado,
    };
    if (c.metricas !== undefined) objeto["metricas"] = c.metricas;
    return JSON.stringify(objeto);
  });

  return lineas.length === 0 ? "" : `${lineas.join("\n")}\n`;
}

// ---------------------------------------------------------------------------------------
// Orquestacion de las capas de expansion
// ---------------------------------------------------------------------------------------

/**
 * Tope de busquedas de SerpApi por corrida, como CONSTANTE NOMBRADA y no como numero suelto
 * en el parseo de banderas.
 *
 * Un default ausente o generoso hace que un `kw:expand` sin banderas se coma las 127
 * busquedas disponibles e invada lo que la fase 13 tiene reservado para COMP-03, y eso solo
 * se detectaria despues, leyendo el libro de cuota. El limite lo aplica el codigo abortando.
 */
export const MAX_BUSQUEDAS_POR_DEFECTO = 60;

/**
 * Cuantas semillas reciben una llamada a la fuente de metricas.
 *
 * El sondeo del 2026-08-10 estimaba quince, contando con unas 900 relacionadas por llamada.
 * La corrida real midio otra cosa: **el rendimiento depende muchisimo del largo de la
 * semilla.** "hernia discal" devolvio 899 y "clinica ricardo palma" 287, pero seis semillas
 * compuestas de cuatro o cinco palabras ("cirugia endoscopica de columna", "artrodesis en
 * varios niveles", "casos de revision") devolvieron CERO. La fuente resuelve terminos
 * cabecera, no frases.
 *
 * Por eso el presupuesto sube a cuarenta: hay que bajar bastante en el orden de gasto para
 * alcanzar las condiciones de una y dos palabras del rango 4, que son las que rinden. Es
 * barato: una llamada por semilla, y esta fuente no es el recurso escaso de la fase, SerpApi
 * si. El orden de gasto no cambia, solo llega mas lejos.
 */
export const SEMILLAS_DINORANK_POR_DEFECTO = 40;

/**
 * Cuantas semillas reciben una busqueda geolocalizada. Deliberadamente bajo: desde que la
 * fuente de metricas expande el universo, SerpApi vuelve a lo unico que solo el hace, y cada
 * busqueda ahorrada aca le queda a la fase 13.
 */
export const SEMILLAS_SERPAPI_POR_DEFECTO = 12;

/** Una consulta planificada, con su clave YA calculada por el CLI. Quien rellena la cache
 *  desde afuera la consume; nunca la inventa. */
export interface PlanConsulta {
  fuente: string;
  endpoint: string;
  parametros: Record<string, unknown>;
  clave: string;
  semilla: string;
  capa: Capa;
}

export interface LimitesPlan {
  semillasDinorank: number;
  semillasSerpapi: number;
  /** Cuando es true se agrega la capa de autocompletado, que esta apagada por defecto. */
  autocompletado?: boolean | undefined;
}

/**
 * Construye la lista de consultas en ORDEN DE GASTO. El orden se resuelve aca, al construir
 * la lista, y no con una heuristica en tiempo de ejecucion: las semillas vienen del snapshot
 * ya ordenadas por rango de valor de negocio, asi que si el tope corta, corta por lo que
 * menos importa y las ocho que sostienen el handoff con v1.1 son las ultimas en perderse.
 */
export function planificarConsultas(
  seeds: readonly Semilla[],
  limites: LimitesPlan,
): PlanConsulta[] {
  const plan: PlanConsulta[] = [];

  for (const semilla of seeds.slice(0, Math.max(0, limites.semillasDinorank))) {
    const parametros = parametrosKeywordResearch(semilla.keyword.toLocaleLowerCase("es"));
    plan.push({
      fuente: DINORANK_FUENTE,
      endpoint: DINORANK_ENDPOINT,
      parametros,
      clave: cacheKey(DINORANK_FUENTE, DINORANK_ENDPOINT, parametros),
      semilla: semilla.keyword,
      capa: "dinorank",
    });
  }

  for (const semilla of seeds.slice(0, Math.max(0, limites.semillasSerpapi))) {
    const parametros = parametrosBusqueda(semilla.keyword.toLocaleLowerCase("es"));
    plan.push({
      fuente: SERPAPI_FUENTE,
      endpoint: SERPAPI_ENDPOINT,
      parametros,
      clave: cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametros),
      semilla: semilla.keyword,
      capa: "serpapi-busqueda",
    });
  }

  if (limites.autocompletado === true) {
    for (const semilla of seeds.slice(0, Math.max(0, limites.semillasSerpapi))) {
      const parametros = parametrosSugerencias(semilla.keyword.toLocaleLowerCase("es"));
      plan.push({
        fuente: SERPAPI_FUENTE,
        endpoint: SERPAPI_ENDPOINT,
        parametros,
        clave: cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametros),
        semilla: semilla.keyword,
        capa: "serpapi-autocomplete",
      });
    }
  }

  return plan;
}

export interface OpcionesExpansion extends LimitesPlan {
  seeds: readonly Semilla[];
  modificadores: Modificadores;
  cacheDir: string;
  offline?: boolean | undefined;
  refresh?: boolean | undefined;
  quota?: QuotaBook | undefined;
  maxBusquedas?: number | undefined;
  stats?: RunCounters | undefined;
  /** Sustitutos de la llamada de red. Solo los usan las pruebas. */
  llamadaDinorank?: NetworkCall | undefined;
  llamadaSerpapi?: NetworkCall | undefined;
}

export interface ResultadoExpansion extends ResultadoConsolidacion {
  /** Candidatos crudos por capa, antes de deduplicar y filtrar. */
  brutosPorCapa: Record<string, number>;
  /** Semillas que quedaron sin procesar porque el tope corto la corrida. */
  pendientes: string[];
  cortada: boolean;
}

/**
 * Corre las capas de la mas barata a la mas cara y consolida.
 *
 * El orden importa por una razon concreta: la deduplicacion conserva la primera aparicion, asi
 * que una keyword que la permutacion ya invento queda atribuida a la permutacion, y el conteo
 * por capa dice cuanto aporto DE NUEVO cada fuente pagada.
 */
export async function expandir(opciones: OpcionesExpansion): Promise<ResultadoExpansion> {
  const brutos: Candidato[] = [];
  const brutosPorCapa: Record<string, number> = {};

  const sumar = (capa: Capa, n: number): void => {
    brutosPorCapa[capa] = (brutosPorCapa[capa] ?? 0) + n;
  };

  // --- Capa 1: permutacion determinista, costo cero ---

  const permutados = permutar(opciones.seeds, opciones.modificadores);
  sumar("permutacion", permutados.length);
  for (const p of permutados) {
    brutos.push({
      keyword: p.keyword,
      keywordKey: normalizeKeyword(p.keyword),
      semilla: p.semilla,
      capa: "permutacion",
      estado: "sin_datos",
    });
  }

  // --- Capas con datos reales, en orden de gasto ---

  const plan = planificarConsultas(opciones.seeds, opciones);
  const pendientes: string[] = [];
  let cortada = false;

  for (let i = 0; i < plan.length; i += 1) {
    const consulta = plan[i] as PlanConsulta;

    if (cortada) {
      if (!pendientes.includes(consulta.semilla)) pendientes.push(consulta.semilla);
      continue;
    }

    const restantes = plan.length - i - 1;

    try {
      if (consulta.capa === "dinorank") {
        const keywords = await keywordResearch(String(consulta.parametros["keyword"]), {
          cacheDir: opciones.cacheDir,
          offline: opciones.offline,
          refresh: opciones.refresh,
          // La fuente de metricas lleva su propio tope, separado del de SerpApi: son dos
          // presupuestos distintos y mezclarlos haria que gastar en una recorte a la otra.
          // Se pasa el libro igual, para que cache:stats muestre el consumo real.
          quota: opciones.quota,
          maxPerRun: opciones.semillasDinorank,
          stats: opciones.stats,
          pending: restantes,
          llamada: opciones.llamadaDinorank,
        });

        sumar("dinorank", keywords.length);
        for (const k of keywords) {
          brutos.push({
            keyword: k.key,
            keywordKey: normalizeKeyword(k.key),
            semilla: consulta.semilla,
            capa: "dinorank",
            // Volumen cero significa "sin volumen medible", no "sin dato": las metricas
            // vinieron y se conservan. El 84% del long tail cae aca y NO se descarta.
            estado: k.searchVolume > 0 ? "con_datos" : "sin_datos",
            metricas: {
              searchVolume: k.searchVolume,
              cpc: k.cpc,
              competition: k.competition,
              fuente: "dinorank",
            },
          });
        }
        continue;
      }

      const comunes = {
        cacheDir: opciones.cacheDir,
        offline: opciones.offline,
        refresh: opciones.refresh,
        quota: opciones.quota,
        maxPerRun: opciones.maxBusquedas,
        stats: opciones.stats,
        pending: restantes,
        llamada: opciones.llamadaSerpapi,
      };

      if (consulta.capa === "serpapi-busqueda") {
        const { relacionadas, preguntas } = await busquedaGeolocalizada(
          String(consulta.parametros["q"]),
          comunes,
        );
        const cosecha = [...relacionadas, ...preguntas];
        sumar("serpapi-busqueda", cosecha.length);
        for (const texto of cosecha) {
          brutos.push({
            keyword: texto.toLocaleLowerCase("es"),
            keywordKey: normalizeKeyword(texto),
            semilla: consulta.semilla,
            capa: "serpapi-busqueda",
            estado: "sin_datos",
          });
        }
        continue;
      }

      const sugeridas = await sugerencias(String(consulta.parametros["q"]), comunes);
      sumar("serpapi-autocomplete", sugeridas.length);
      for (const texto of sugeridas) {
        brutos.push({
          keyword: texto.toLocaleLowerCase("es"),
          keywordKey: normalizeKeyword(texto),
          semilla: consulta.semilla,
          capa: "serpapi-autocomplete",
          estado: "sin_datos",
        });
      }
    } catch (error) {
      if (!(error instanceof QuotaExceededError)) throw error;
      // El tope corto: se deja de gastar, se anota lo que falto y lo ya obtenido se conserva.
      cortada = true;
      if (!pendientes.includes(consulta.semilla)) pendientes.push(consulta.semilla);
    }
  }

  return { ...consolidar(brutos), brutosPorCapa, pendientes, cortada };
}
