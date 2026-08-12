/**
 * Canibalizacion por cruce del mapa contra si mismo. Funcion pura sobre `url-map.jsonl`.
 *
 * POR QUE ESTE CRUCE Y NO EL DE DINORANK (D-03). `/canibalizaciones` devuelve `has_data: false`
 * y cero keywords: el sitio es de agosto de 2026 y no acumulo impresiones, aunque Search Console
 * este vinculado desde el 2026-08-09. No hay canibalizacion heredada que medir porque no hay
 * historial. La que importa hoy es la que estamos por crear, y esa se ve cruzando el mapa
 * propuesto contra si mismo. La revision con datos reales queda como deuda con fecha.
 *
 * LA REGLA QUE NO SE NEGOCIA: DOS URLS NO CHOCAN POR COMPARTIR CLUSTER.
 * Chocan cuando comparten URLs del top 10 medido, contado de a pares por `overlap.ts`. El cluster
 * mayor de la fase 13 junto 41 cabezas por transitividad —A con B, B con C, y A junto a C sin que
 * nadie midiera nada entre las dos— y adentro conviven ortopedia infantil, cirugia de columna y
 * traumatologia general, que son tres paginas distintas. Un detector que agrupara por cluster
 * reportaria ese trio como canibalizacion y la "resolveria" fusionando tres paginas legitimas.
 * Por eso los pares del mismo cluster con solape CERO se reportan aparte, como no-conflicto con
 * su explicacion, y no se omiten: que no aparezcan y que aparezcan resueltos no es lo mismo.
 *
 * CUATRO CHOQUES, Y LA SEVERIDAD NO ES UNA OPINION:
 *
 *   - `misma-primaria` (ALTA): dos URLs con la misma clave normalizada. Es la definicion literal
 *     de canibalizacion y no necesita SERP para verse.
 *   - `solape-de-serp` (ALTA): primarias escritas distinto que Google responde igual. Es el caso
 *     que solo el dato encuentra: nadie lo ve leyendo el mapa.
 *   - `distrito-duplicado` (ALTA): la misma geo de distrito encabezando dos URLs. D-04 dice que
 *     una geo de distrito no genera URL propia; dos son dos de mas.
 *   - `secundaria-es-primaria-ajena` (MEDIA): una URL persigue de secundaria lo que otra pelea de
 *     primaria. No es empate por la consulta entera, pero le resta senal a la duena.
 *
 * COSTE DE CUOTA: CERO. Todo sale de las 96 capturas ya pagadas, en modo offline.
 */

import { normalizeKeyword } from "../keywords/normalize.js";
import { veredictoDeFusion, type IndiceDeSerp } from "./overlap.js";
import { UMBRAL_POR_DEFECTO } from "./overlap.js";
import type { AsignacionDeUrl } from "./model.js";

export type TipoDeChoque =
  | "misma-primaria"
  | "solape-de-serp"
  | "distrito-duplicado"
  | "secundaria-es-primaria-ajena";

export type Severidad = "alta" | "media";

export interface Resolucion {
  /** URL que conserva la keyword. */
  readonly ganadora: string;
  readonly perdedora: string;
  /** Keyword de oro que decidio el desempate, o `null` si ninguna de las dos lo es (D-06). */
  readonly keywordDeOroQueGano: string | null;
  readonly motivo: string;
  /** Lo que la perdedora cede, si se aplico. */
  readonly cedio: string | null;
}

export interface Conflicto {
  readonly tipo: TipoDeChoque;
  readonly severidad: Severidad;
  readonly urls: readonly [string, string];
  readonly keywords: readonly [string, string];
  /** URLs del top 10 que las dos keywords comparten. Es la evidencia, no el veredicto. */
  readonly urlsCompartidas: readonly string[];
  readonly umbralAplicado: number;
  /** true cuando alguna de las dos no tiene SERP en la cache. Nunca produce un choque positivo. */
  readonly datoAusente: boolean;
  readonly evidencia: string;
  readonly resolucion?: Resolucion;
}

export interface ParPorTransitividad {
  readonly urls: readonly [string, string];
  readonly keywords: readonly [string, string];
  readonly cluster: string;
  readonly urlsCompartidas: readonly string[];
  readonly umbralAplicado: number;
  readonly explicacion: string;
}

export interface ReporteDeCanibalizacion {
  readonly schema: 1;
  readonly generadoPor: "src/phase14/cannibal.ts";
  readonly requisito: "MAP-02";
  readonly umbralDeSolape: number;
  readonly conflictos: readonly Conflicto[];
  readonly resueltos: readonly Conflicto[];
  readonly sinResolver: readonly Conflicto[];
  readonly paresDelMismoClusterSinSolape: readonly ParPorTransitividad[];
  readonly resumen: {
    readonly urlsCruzadas: number;
    readonly paresComparados: number;
    readonly conflictos: number;
    readonly altos: number;
    readonly medios: number;
    readonly resueltos: number;
    readonly sinResolver: number;
    readonly altosSinResolucion: number;
  };
}

export interface EntradaDeCruce {
  readonly mapa: readonly AsignacionDeUrl[];
  readonly indice: IndiceDeSerp;
  /** Claves normalizadas de las 10 de Oro, para el desempate de D-06. */
  readonly oroPorClave: ReadonlyMap<string, string>;
  /** URLs que el plan 14-02 dejo aprobadas por Juan: no se les reasigna la primaria (T-14-10). */
  readonly intocables: ReadonlySet<string>;
  readonly umbral?: number | undefined;
}

/** Distritos que pueden aparecer en una primaria. Se comparan por nombre, no por cluster. */
const DISTRITOS: readonly string[] = [
  "la molina",
  "san isidro",
  "santiago de surco",
  "surco",
  "monterrico",
  "chacarilla",
];

function distritoDe(keyword: string): string | null {
  const t = keyword.toLowerCase();
  let mejor: string | null = null;
  for (const d of DISTRITOS) {
    if (t.includes(d) && (mejor === null || d.length > mejor.length)) mejor = d;
  }
  return mejor;
}

/**
 * Decide quien gana un choque, y lo unico que lo decide es una keyword de oro (D-06).
 *
 * Cuando ninguna de las dos es de oro el conflicto queda SIN resolver a proposito. Inventar un
 * criterio de desempate en ese caso —la que estaba primero, la de mas volumen— seria elegir por
 * comodidad y dejarlo escrito como si fuera una decision medida. Sin resolver y nombrado es
 * informacion; resuelto por un criterio inventado es ruido con forma de dato.
 */
function resolver(
  a: AsignacionDeUrl,
  b: AsignacionDeUrl,
  oroPorClave: ReadonlyMap<string, string>,
  intocables: ReadonlySet<string>,
  queCede: "primaria" | "secundaria",
): Resolucion | null {
  const oroA = a.keywordPrimariaKey === null ? undefined : oroPorClave.get(a.keywordPrimariaKey);
  const oroB = b.keywordPrimariaKey === null ? undefined : oroPorClave.get(b.keywordPrimariaKey);

  if (oroA !== undefined && oroB === undefined) {
    return {
      ganadora: a.url,
      perdedora: b.url,
      keywordDeOroQueGano: oroA,
      motivo:
        `Gana ${a.url} porque su primaria "${a.keywordPrimaria ?? ""}" es una de las 10 de Oro ` +
        `(${oroA}) y la de ${b.url} no lo es (D-06).`,
      cedio: intocables.has(b.url) ? null : queCede,
    };
  }
  if (oroB !== undefined && oroA === undefined) {
    return {
      ganadora: b.url,
      perdedora: a.url,
      keywordDeOroQueGano: oroB,
      motivo:
        `Gana ${b.url} porque su primaria "${b.keywordPrimaria ?? ""}" es una de las 10 de Oro ` +
        `(${oroB}) y la de ${a.url} no lo es (D-06).`,
      cedio: intocables.has(a.url) ? null : queCede,
    };
  }
  return null;
}

function claveDe(a: AsignacionDeUrl): string | null {
  return a.keywordPrimariaKey;
}

/**
 * Cruza el mapa contra si mismo y devuelve el reporte completo.
 *
 * Las filas SIN primaria no participan del cruce de primarias, y es la consecuencia directa de
 * que declaren que no compiten: una URL que no pelea ninguna keyword no puede canibalizar a
 * nadie. Se cuentan igual en `urlsCruzadas` para que el reporte no parezca hablar de otro mapa.
 */
export function cruzarMapa(entrada: EntradaDeCruce): ReporteDeCanibalizacion {
  const umbral = entrada.umbral ?? UMBRAL_POR_DEFECTO;
  const conPrimaria = entrada.mapa
    .filter((a) => claveDe(a) !== null)
    .slice()
    .sort((a, b) => a.url.localeCompare(b.url, "es"));

  const conflictos: Conflicto[] = [];
  const transitivos: ParPorTransitividad[] = [];
  let paresComparados = 0;

  for (let i = 0; i < conPrimaria.length; i += 1) {
    for (let j = i + 1; j < conPrimaria.length; j += 1) {
      const a = conPrimaria[i] as AsignacionDeUrl;
      const b = conPrimaria[j] as AsignacionDeUrl;
      paresComparados += 1;

      const ka = a.keywordPrimaria as string;
      const kb = b.keywordPrimaria as string;
      const veredicto = veredictoDeFusion(ka, kb, entrada.indice, { umbral });

      // 1. La misma clave en dos URLs. No hace falta SERP para verlo.
      if (a.keywordPrimariaKey === b.keywordPrimariaKey) {
        const resolucion = resolver(a, b, entrada.oroPorClave, entrada.intocables, "primaria");
        conflictos.push({
          tipo: "misma-primaria",
          severidad: "alta",
          urls: [a.url, b.url],
          keywords: [ka, kb],
          urlsCompartidas: veredicto.compartidas,
          umbralAplicado: umbral,
          datoAusente: veredicto.datoAusente,
          evidencia:
            `Las dos URLs declaran la clave normalizada "${a.keywordPrimariaKey ?? ""}". Es ` +
            `canibalizacion por definicion: Google tiene que elegir una y las dos pierden fuerza.`,
          ...(resolucion === null ? {} : { resolucion }),
        });
        continue;
      }

      // 2. La misma geo de distrito encabezando dos URLs (D-04).
      const da = distritoDe(ka);
      const db = distritoDe(kb);
      if (da !== null && da === db) {
        const resolucion = resolver(a, b, entrada.oroPorClave, entrada.intocables, "primaria");
        conflictos.push({
          tipo: "distrito-duplicado",
          severidad: "alta",
          urls: [a.url, b.url],
          keywords: [ka, kb],
          urlsCompartidas: veredicto.compartidas,
          umbralAplicado: umbral,
          datoAusente: veredicto.datoAusente,
          evidencia:
            `Las dos primarias nombran el distrito "${da}". D-04 dice que un modificador de ` +
            `distrito no genera URL propia: solo puede encabezar la sede que YA existe en ese ` +
            `distrito, y hay una sola.`,
          ...(resolucion === null ? {} : { resolucion }),
        });
        continue;
      }

      // 3. Escritas distinto y respondidas igual. Este es el que solo el dato encuentra.
      if (veredicto.fusionable) {
        const resolucion = resolver(a, b, entrada.oroPorClave, entrada.intocables, "primaria");
        conflictos.push({
          tipo: "solape-de-serp",
          severidad: "alta",
          urls: [a.url, b.url],
          keywords: [ka, kb],
          urlsCompartidas: veredicto.compartidas,
          umbralAplicado: umbral,
          datoAusente: false,
          evidencia:
            `"${ka}" y "${kb}" comparten ${veredicto.cardinalidad} URLs del top 10 medido, con el ` +
            `umbral en ${umbral}. Se escriben distinto y Google les responde lo mismo, asi que ` +
            `las dos paginas competirian por el mismo resultado. Evidencia: ` +
            `${veredicto.compartidas.join(", ")}.`,
          ...(resolucion === null ? {} : { resolucion }),
        });
        continue;
      }

      // 4. Mismo cluster y cero solape: NO es conflicto, y queda escrito por que.
      if (a.cluster !== null && a.cluster === b.cluster && veredicto.cardinalidad === 0) {
        transitivos.push({
          urls: [a.url, b.url],
          keywords: [ka, kb],
          cluster: a.cluster,
          urlsCompartidas: [],
          umbralAplicado: umbral,
          explicacion:
            `Comparten el cluster "${a.cluster}" y CERO URLs del top 10 medido. El cluster se ` +
            `formo por transitividad: quedaron encadenadas a traves de terceras keywords y nunca ` +
            `hubo evidencia directa entre estas dos. Google les responde cosas distintas, asi que ` +
            `son paginas distintas y fusionarlas colapsaria dos paginas legitimas por un artefacto ` +
            `del agrupamiento (D-05).`,
        });
      }
    }
  }

  // 5. Una secundaria de una URL que es primaria de otra. Se recorre aparte porque no es
  //    simetrico: la duena de la primaria es siempre la misma, mire quien mire.
  const duenaDePrimaria = new Map<string, AsignacionDeUrl>();
  for (const a of conPrimaria) duenaDePrimaria.set(a.keywordPrimariaKey as string, a);

  for (const a of entrada.mapa.slice().sort((x, y) => x.url.localeCompare(y.url, "es"))) {
    for (const s of a.secundarias) {
      const duena = duenaDePrimaria.get(normalizeKeyword(s));
      if (duena === undefined || duena.url === a.url) continue;
      const veredicto = veredictoDeFusion(
        a.keywordPrimaria ?? s,
        duena.keywordPrimaria as string,
        entrada.indice,
        { umbral },
      );
      const resolucion = resolver(duena, a, entrada.oroPorClave, entrada.intocables, "secundaria");
      conflictos.push({
        tipo: "secundaria-es-primaria-ajena",
        severidad: "media",
        urls: [a.url, duena.url],
        keywords: [s, duena.keywordPrimaria as string],
        urlsCompartidas: veredicto.compartidas,
        umbralAplicado: umbral,
        datoAusente: veredicto.datoAusente,
        evidencia:
          `${a.url} persigue "${s}" de secundaria y ${duena.url} la pelea de primaria. No es ` +
          `empate por la consulta entera, pero le resta senal a la duena y confunde a Google ` +
          `sobre cual de las dos responde esa busqueda.`,
        ...(resolucion === null ? {} : { resolucion }),
      });
    }
  }

  const ordenados = conflictos.sort(
    (x, y) =>
      x.tipo.localeCompare(y.tipo) ||
      x.urls[0].localeCompare(y.urls[0], "es") ||
      x.urls[1].localeCompare(y.urls[1], "es"),
  );
  const resueltos = ordenados.filter((c) => c.resolucion !== undefined);
  const sinResolver = ordenados.filter((c) => c.resolucion === undefined);
  const altos = ordenados.filter((c) => c.severidad === "alta");

  return {
    schema: 1,
    generadoPor: "src/phase14/cannibal.ts",
    requisito: "MAP-02",
    umbralDeSolape: umbral,
    conflictos: ordenados,
    resueltos,
    sinResolver,
    paresDelMismoClusterSinSolape: transitivos,
    resumen: {
      urlsCruzadas: entrada.mapa.length,
      paresComparados,
      conflictos: ordenados.length,
      altos: altos.length,
      medios: ordenados.length - altos.length,
      resueltos: resueltos.length,
      sinResolver: sinResolver.length,
      altosSinResolucion: altos.filter((c) => c.resolucion === undefined).length,
    },
  };
}
