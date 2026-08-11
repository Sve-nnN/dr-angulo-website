/**
 * Veredicto de fusion de dos URLs, decidido por solape par a par de sus SERP.
 *
 * ESTE MODULO ES EL GUARDARRAIL DE D-05 Y POR ESO VIVE SEPARADO.
 *
 * La fase 13 agrupo el universo en 31 grupos, y el mayor junto 41 cabezas. Ese grupo se formo
 * por TRANSITIVIDAD: A quedo con B porque compartian SERP, B con C por lo mismo, y A termino
 * junto a C sin que nadie midiera si A y C se parecen en algo. Las tres cabezas que la fase 13
 * eligio de ahi comparten CERO URLs medidas de a pares y son tres categorias de servicio
 * distintas del consultorio. Fusionarlas seria colapsar tres paginas en una por un artefacto
 * del algoritmo de agrupamiento.
 *
 * De ahi la regla, y es dura: la pertenencia a un grupo NO es entrada de esta funcion. Lo
 * unico que decide es cuantas URLs comparten las dos cabezas en el top 10 real, contra un
 * umbral. El veredicto viaja siempre con el motivo en prosa y con la lista de URLs
 * compartidas, para que quien lea el mapa pueda auditar la decision sin abrir la cache.
 *
 * COSTE DE CUOTA: CERO. Todo se lee de las 96 capturas ya pagadas, en modo offline, que
 * convierte un fallo de cache en error duro en vez de en un gasto silencioso.
 *
 * Lo llaman los planes 14-02 y 14-03 antes de fusionar cualquier par de URLs.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { TOPE_DEL_TOP, UMBRAL_SOLAPE, urlsDelTop } from "../phase13/cluster.js";
import { leerSerp } from "../phase13/serp.js";

/** URLs compartidas que hacen falta para fusionar. Es el mismo valor que la fase 13 valido. */
export const UMBRAL_POR_DEFECTO = UMBRAL_SOLAPE;

/** Las cabezas cuya SERP se midio. Sale del mismo archivo que uso la fase 13. */
const RUTA_CANDIDATAS = path.join(SEO_TOOLS_ROOT, "data", "serp-candidates.json");

export interface EntradaMedida {
  /** Texto tal como se busco. */
  readonly keyword: string;
  /** Forma normalizada, que es con la que se indexa. */
  readonly clave: string;
  /** URLs normalizadas del top 10, ordenadas para que el veredicto serialice igual siempre. */
  readonly urls: readonly string[];
}

export interface IndiceDeSerp {
  readonly porClave: ReadonlyMap<string, EntradaMedida>;
  /** Keywords pedidas que no tienen captura utilizable. Se nombran, no se ocultan. */
  readonly sinCaptura: readonly string[];
  readonly tope: number;
}

export interface VeredictoDeFusion {
  readonly a: string;
  readonly b: string;
  /** URLs del top 10 que las dos cabezas comparten, ordenadas. Es la evidencia. */
  readonly compartidas: readonly string[];
  readonly cardinalidad: number;
  readonly umbral: number;
  readonly fusionable: boolean;
  /** true cuando falta la medicion de alguna de las dos. Nunca produce un veredicto positivo. */
  readonly datoAusente: boolean;
  readonly motivo: string;
}

export interface OpcionesDeFusion {
  readonly umbral?: number;
}

interface Candidata {
  readonly keyword: string;
}

function candidatasDelArchivo(): string[] {
  let crudo: string;
  try {
    crudo = readFileSync(RUTA_CANDIDATAS, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${RUTA_CANDIDATAS}.\n` +
        `  Accion: es la lista de cabezas que la fase 13 midio. Sin ella no hay que comparar.`,
    );
  }
  const archivo = JSON.parse(crudo) as { readonly candidatas?: readonly Candidata[] };
  const candidatas = archivo.candidatas ?? [];
  return candidatas.map((c) => c.keyword);
}

/**
 * Arma el indice de URLs del top 10 por cabeza, leyendo solo de la cache.
 *
 * Una cabeza sin captura, o con una captura sin resultados organicos, NO entra al indice: se
 * nombra en `sinCaptura`. La diferencia importa porque un conjunto vacio y un dato ausente dan
 * los dos cero URLs compartidas, y solo uno de los dos significa que las paginas son distintas.
 */
export async function cargarIndiceDeSerp(
  keywords: readonly string[] = candidatasDelArchivo(),
  opciones: { readonly tope?: number } = {},
): Promise<IndiceDeSerp> {
  const tope = opciones.tope ?? TOPE_DEL_TOP;
  const porClave = new Map<string, EntradaMedida>();
  const sinCaptura: string[] = [];

  for (const keyword of keywords) {
    const clave = normalizeKeyword(keyword);
    if (clave === "" || porClave.has(clave)) continue;

    let serp;
    try {
      serp = await leerSerp(keyword, { offline: true });
    } catch {
      sinCaptura.push(keyword);
      continue;
    }
    const urls = [...urlsDelTop(serp, tope)].sort();
    if (urls.length === 0) {
      sinCaptura.push(keyword);
      continue;
    }
    porClave.set(clave, { keyword, clave, urls });
  }

  return { porClave, sinCaptura, tope };
}

function describir(entrada: EntradaMedida | undefined, pedido: string): string {
  return entrada === undefined ? pedido : entrada.keyword;
}

/**
 * Decide si dos cabezas pueden servirse desde la misma URL.
 *
 * Los tres parametros obligatorios son las dos claves y el indice de URLs medidas. No hay un
 * cuarto por donde entre la pertenencia a un grupo, y eso es deliberado.
 */
export function veredictoDeFusion(
  a: string,
  b: string,
  indice: IndiceDeSerp,
  opciones: OpcionesDeFusion = {},
): VeredictoDeFusion {
  const umbral = opciones.umbral ?? UMBRAL_POR_DEFECTO;
  const claveA = normalizeKeyword(a);
  const claveB = normalizeKeyword(b);

  const entradaA = indice.porClave.get(claveA);
  const entradaB = indice.porClave.get(claveB);

  const base = { a: describir(entradaA, a), b: describir(entradaB, b), umbral };

  if (entradaA === undefined || entradaB === undefined) {
    const faltantes = [
      entradaA === undefined ? describir(entradaA, a) : null,
      entradaB === undefined ? describir(entradaB, b) : null,
    ].filter((x): x is string => x !== null);

    return {
      ...base,
      compartidas: [],
      cardinalidad: 0,
      fusionable: false,
      datoAusente: true,
      motivo:
        `${faltantes.join(" y ")} quedan sin SERP medida en la cache, asi que no hay evidencia ` +
        `que comparar. Sin evidencia el veredicto es NO fusionar: dar por buena una fusion que ` +
        `nadie midio colapsaria dos paginas por falta de dato, y ese error no se ve hasta que ` +
        `el sitio ya perdio una de las dos.`,
    };
  }

  const otras = new Set(entradaB.urls);
  const compartidas = entradaA.urls.filter((u) => otras.has(u)).sort();
  const cardinalidad = compartidas.length;
  const fusionable = cardinalidad >= umbral;

  if (fusionable) {
    return {
      ...base,
      compartidas,
      cardinalidad,
      fusionable: true,
      datoAusente: false,
      motivo:
        `Comparten ${cardinalidad} URLs en el top ${indice.tope}, con el umbral en ${umbral}. ` +
        `Google le esta respondiendo lo mismo a las dos busquedas, asi que dos paginas distintas ` +
        `competirian entre si. Evidencia: ${compartidas.join(", ")}.`,
    };
  }

  if (cardinalidad === 0) {
    return {
      ...base,
      compartidas,
      cardinalidad,
      fusionable: false,
      datoAusente: false,
      motivo:
        `No comparten ni una URL en el top ${indice.tope} medido. Cuando dos cabezas asi ` +
        `aparecen igual dentro del mismo cluster, ese cluster se formo por TRANSITIVIDAD: ` +
        `quedaron encadenadas a traves de terceras keywords y nunca hubo evidencia directa ` +
        `entre estas dos. Google les responde cosas distintas, asi que son paginas distintas.`,
    };
  }

  return {
    ...base,
    compartidas,
    cardinalidad,
    fusionable: false,
    datoAusente: false,
    motivo:
      `Comparten ${cardinalidad} URLs en el top ${indice.tope} y el umbral es ${umbral}. Debajo ` +
      `del umbral la coincidencia se explica sola por los directorios y las redes sociales que ` +
      `aparecen en casi toda SERP medica de Lima, y no por una intencion comun. ` +
      `Evidencia: ${compartidas.join(", ")}.`,
  };
}
