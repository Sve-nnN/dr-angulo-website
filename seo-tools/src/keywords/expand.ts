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

import { normalizeKeyword } from "./normalize.js";
import { contieneTerminoDominio } from "./seeds.js";

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
