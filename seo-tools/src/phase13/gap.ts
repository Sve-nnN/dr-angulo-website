/**
 * El gap de keywords (COMP-02) y el recuento de bloques destacados (COMP-04, segunda mitad).
 *
 * ================================================================================
 * COSTE ADICIONAL CERO, Y ESA ES LA CONDICION LITERAL DE D-13
 * ================================================================================
 *
 * Todo lo que sale de aca se deriva de las 96 capturas de SerpApi que ya estan pagadas y en
 * `.cache/serpapi/`. La alternativa —pedir a Ahrefs las keywords organicas de cada competidor—
 * es cara y no aporta al tamano de este proyecto. Este modulo no toca la red: recibe capturas
 * ya leidas y devuelve un objeto.
 *
 * ================================================================================
 * LAS TRES REGLAS QUE DEFINEN EL GAP
 * ================================================================================
 *
 *   1. Una keyword entra en el gap de un competidor si ese competidor esta en su TOP 10 y el
 *      dominio del doctor NO aparece en ninguna posicion de esa SERP.
 *   2. Una keyword donde aparecen los dos NO es gap: es competencia directa, y se registra
 *      aparte porque es informacion distinta. Confundirlas haria que "ganarle a Carranza en
 *      esta keyword" y "ni siquiera estar en la conversacion" se leyeran igual.
 *   3. Una keyword sin captura NO esta ni en el gap ni fuera de el. Esta SIN MEDIR, y el
 *      bloque de cobertura la cuenta como tal.
 *
 * La tercera regla es la que sostiene el informe entero. Sin el bloque de cobertura, "el doctor
 * no aparece en 98 keywords" se lee como un diagnostico del sitio cuando en realidad es la suma
 * de un diagnostico y de un limite de presupuesto: se midieron 96 SERP de un universo de 4.766.
 *
 * ================================================================================
 * MEDIDO EN CERO Y NO MEDIDO SIGUEN SIENDO COSAS DISTINTAS
 * ================================================================================
 *
 * El recuento de destacados se informa SIEMPRE, con el total de capturas sobre el que se midio,
 * aunque el resultado sea cero. Omitir la linea cuando da cero convertiria una medicion en una
 * ausencia de medicion, que es el mismo error que la fase 12 combatio con el volumen.
 */

import { normalizeKeyword } from "../keywords/normalize.js";
import type { SerpCompleta } from "./serp.js";

/** El top 10 es la ventana del gap: lo que Google muestra en la primera pantalla de resultados. */
export const TOP = 10;

export interface Competidor {
  readonly domain: string;
  readonly name: string;
}

export interface CapturaDeSerp {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly volumen: number | null;
  readonly volumenFuente: string;
  readonly serp: SerpCompleta;
}

export interface KeywordDeGap {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly posicion: number;
  readonly url: string;
  readonly cluster: string | null;
  readonly volumen: number | null;
  readonly volumenFuente: string;
}

export interface BloqueDeCompetidor {
  readonly domain: string;
  readonly name: string;
  /** Keywords donde posiciona en el top 10 y el doctor NO aparece. */
  readonly keywords: KeywordDeGap[];
  /** Apariciones en el top 10 sobre todas las capturas, con o sin el doctor presente. */
  readonly aparicionesEnTop: number;
  /** Apariciones en el pack local. Es otro canal y se cuenta aparte. */
  readonly aparicionesEnPackLocal: number;
  readonly featuredSnippets: number;
  readonly mejorPosicion: number | null;
}

export interface CompetenciaDirecta {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly posicionDelDoctor: number;
  readonly competidores: { readonly domain: string; readonly posicion: number }[];
}

export interface Cobertura {
  /** SERP efectivamente capturadas y leidas. */
  readonly serpMedidas: number;
  /** Keywords del universo declarado que quedaron sin captura. */
  readonly serpSinMedir: number;
  /** Sobre que universo se cuenta lo anterior. */
  readonly universo: number;
  /** Cabezas de cluster, que es donde se concentro el presupuesto de busquedas. */
  readonly cabezas: number;
  readonly nota: string;
}

export interface MarcaAjena {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly volumen: number | null;
  readonly objetivo: false;
  readonly motivo: string;
}

export interface InformeDeGap {
  readonly schema: 1;
  readonly generadoPor: string;
  readonly dominioPropio: string;
  readonly cobertura: Cobertura;
  readonly destacadosMedidos: number;
  readonly destacadosSobre: number;
  readonly destacadosPorOcupante: Record<string, number>;
  readonly porCompetidor: BloqueDeCompetidor[];
  readonly competenciaDirecta: CompetenciaDirecta[];
  readonly marcaAjenaComoInteligencia: MarcaAjena[];
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Dominio sin protocolo, sin `www.` y sin barra final. */
export function dominioDe(raw: string): string {
  const limpio = raw.trim().toLowerCase();
  try {
    return new URL(limpio).hostname.replace(/^www\./, "");
  } catch {
    return limpio.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  }
}

/**
 * Un subdominio del competidor ES el competidor; un dominio que solo lo contiene, no.
 *
 * `blog.drcarranzacolumna.com` cuenta. `nodrcarranzacolumna.com.pe` no, y por eso la
 * comparacion es por igualdad o por sufijo de punto y jamas por subcadena suelta.
 */
export function esDelDominio(dominio: string, objetivo: string): boolean {
  const d = dominio.replace(/^www\./, "");
  const o = objetivo.replace(/^www\./, "");
  return d === o || d.endsWith(`.${o}`);
}

/** Posicion de un dominio en la SERP, o null. Mira TODAS las posiciones, no solo el top 10. */
function posicionDe(serp: SerpCompleta, objetivo: string): number | null {
  for (const o of serp.organicos) {
    if (esDelDominio(o.dominio.toLowerCase(), objetivo)) return o.posicion;
  }
  return null;
}

function enPackLocal(serp: SerpCompleta, objetivo: string): boolean {
  return serp.packLocal.some((l) => l.sitio !== null && esDelDominio(dominioDe(l.sitio), objetivo));
}

/** URL del bloque destacado, buscada por los nombres con que la fuente la devuelve. */
export function urlDelDestacado(destacado: Record<string, unknown> | null): string | null {
  if (destacado === null) return null;
  for (const campo of ["link", "url", "source_link", "displayed_link"]) {
    const valor = destacado[campo];
    if (typeof valor === "string" && valor.trim() !== "") return valor;
  }
  return null;
}

// ---------------------------------------------------------------------------
// El calculo
// ---------------------------------------------------------------------------

export interface OpcionesGap {
  readonly dominioPropio: string;
  /** Keywords del universo sobre el que se declara la cobertura. */
  readonly universo: number;
  readonly cabezas: number;
  readonly marcaAjena?: readonly MarcaAjena[] | undefined;
}

/**
 * El informe completo, deterministico.
 *
 * El orden de las capturas de entrada NO puede cambiar la salida: todo lo que se emite se
 * ordena por criterios que son funcion de los datos. De otro modo el criterio de SHA-256
 * estaria midiendo el orden del recorrido del disco y no el determinismo del calculo.
 */
export function calcularGap(
  capturas: readonly CapturaDeSerp[],
  competidores: readonly Competidor[],
  opciones: OpcionesGap,
): InformeDeGap {
  const propio = dominioDe(opciones.dominioPropio);

  const gapPorDominio = new Map<string, KeywordDeGap[]>();
  const enTop = new Map<string, number>();
  const enPack = new Map<string, number>();
  const destacadosDe = new Map<string, number>();
  const mejor = new Map<string, number>();
  for (const c of competidores) {
    gapPorDominio.set(c.domain, []);
    enTop.set(c.domain, 0);
    enPack.set(c.domain, 0);
    destacadosDe.set(c.domain, 0);
  }

  const directa: CompetenciaDirecta[] = [];
  const destacadosPorOcupante: Record<string, number> = {};
  let destacadosMedidos = 0;

  for (const captura of capturas) {
    const { serp } = captura;

    // Destacados: se cuentan sobre TODAS las capturas y se le atribuyen a quien lo ocupa.
    const urlDestacada = urlDelDestacado(serp.destacado);
    if (urlDestacada !== null) {
      destacadosMedidos += 1;
      const ocupante = dominioDe(urlDestacada);
      destacadosPorOcupante[ocupante] = (destacadosPorOcupante[ocupante] ?? 0) + 1;
      for (const c of competidores) {
        if (esDelDominio(ocupante, c.domain)) destacadosDe.set(c.domain, (destacadosDe.get(c.domain) ?? 0) + 1);
      }
    }

    // El doctor cuenta como presente en CUALQUIER posicion, no solo en el top 10: el criterio
    // del plan es literal, "no aparece en ninguna posicion de esa SERP".
    const posicionPropia = posicionDe(serp, propio);
    const acompanantes: { domain: string; posicion: number }[] = [];

    for (const c of competidores) {
      const posicion = posicionDe(serp, dominioDe(c.domain));
      if (posicion === null) {
        if (enPackLocal(serp, dominioDe(c.domain))) enPack.set(c.domain, (enPack.get(c.domain) ?? 0) + 1);
        continue;
      }
      if (enPackLocal(serp, dominioDe(c.domain))) enPack.set(c.domain, (enPack.get(c.domain) ?? 0) + 1);
      if (posicion > TOP) continue;

      enTop.set(c.domain, (enTop.get(c.domain) ?? 0) + 1);
      const previa = mejor.get(c.domain);
      if (previa === undefined || posicion < previa) mejor.set(c.domain, posicion);

      if (posicionPropia !== null) {
        acompanantes.push({ domain: c.domain, posicion });
        continue;
      }

      const url = serp.organicos.find((o) => o.posicion === posicion)?.url ?? "";
      (gapPorDominio.get(c.domain) as KeywordDeGap[]).push({
        keyword: captura.keyword,
        keywordKey: captura.keywordKey,
        posicion,
        url,
        cluster: captura.cluster,
        volumen: captura.volumen,
        volumenFuente: captura.volumenFuente,
      });
    }

    if (posicionPropia !== null && acompanantes.length > 0) {
      directa.push({
        keyword: captura.keyword,
        keywordKey: captura.keywordKey,
        cluster: captura.cluster,
        posicionDelDoctor: posicionPropia,
        competidores: acompanantes.sort((a, b) => a.posicion - b.posicion || (a.domain < b.domain ? -1 : 1)),
      });
    }
  }

  // Volumen de mayor a menor, y clave normalizada para desempatar: dos corridas dan lo mismo.
  const porVolumen = (a: KeywordDeGap, b: KeywordDeGap): number =>
    (b.volumen ?? -1) - (a.volumen ?? -1) || (a.keywordKey < b.keywordKey ? -1 : a.keywordKey > b.keywordKey ? 1 : 0);

  const porCompetidor: BloqueDeCompetidor[] = competidores.map((c) => ({
    domain: c.domain,
    name: c.name,
    keywords: (gapPorDominio.get(c.domain) as KeywordDeGap[]).sort(porVolumen),
    aparicionesEnTop: enTop.get(c.domain) ?? 0,
    aparicionesEnPackLocal: enPack.get(c.domain) ?? 0,
    featuredSnippets: destacadosDe.get(c.domain) ?? 0,
    mejorPosicion: mejor.get(c.domain) ?? null,
  }));

  const ordenadosPorOcupante: Record<string, number> = {};
  for (const clave of Object.keys(destacadosPorOcupante).sort()) {
    ordenadosPorOcupante[clave] = destacadosPorOcupante[clave] as number;
  }

  return {
    schema: 1,
    generadoPor: "src/phase13/gap.ts",
    dominioPropio: propio,
    cobertura: {
      serpMedidas: capturas.length,
      serpSinMedir: Math.max(opciones.universo - capturas.length, 0),
      universo: opciones.universo,
      cabezas: opciones.cabezas,
      nota:
        "El gap solo se calcula sobre SERP efectivamente capturadas. Las que faltan no estan " +
        "ni dentro ni fuera del gap: estan sin medir, y eso es un limite de presupuesto de " +
        "SerpApi, no un diagnostico del sitio.",
    },
    destacadosMedidos,
    destacadosSobre: capturas.length,
    destacadosPorOcupante: ordenadosPorOcupante,
    porCompetidor,
    competenciaDirecta: directa.sort((a, b) =>
      a.keywordKey < b.keywordKey ? -1 : a.keywordKey > b.keywordKey ? 1 : 0,
    ),
    marcaAjenaComoInteligencia: [...(opciones.marcaAjena ?? [])],
  };
}

// ---------------------------------------------------------------------------
// Marca ajena: inteligencia, nunca objetivo (D-14)
// ---------------------------------------------------------------------------

interface RegistroDeUniverso {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly alcance: string;
  readonly motivoAlcance: string | null;
  readonly metricas?: { readonly searchVolume?: number | null; readonly searchVolumeFuente?: string };
}

/**
 * Las keywords de marca de competidor, ordenadas por volumen y marcadas como NO objetivo.
 *
 * Las dos de mayor volumen de TODO el universo son de marca ajena:
 * `clinica san bernardo especialistas en traumatologia` con 2.400 y
 * `clinica de traumatologia arthrosalud` con 1.600. Cualquiera que abra el Sheet y ordene por
 * volumen las va a ver primero, asi que el informe tiene que explicar por que no estan en
 * ninguna lista de objetivos en vez de dejar que alguien las persiga.
 *
 * La procedencia no se inventa aca: sale del campo `motivoAlcance` que la fase 12 ya escribio
 * en `keywords.jsonl`.
 */
export function marcaAjenaComoInteligencia(
  universo: readonly RegistroDeUniverso[],
  cuantas: number,
): MarcaAjena[] {
  return universo
    .filter((o) => o.motivoAlcance === "marca_ajena")
    .map((o) => ({
      keyword: o.keyword,
      keywordKey: normalizeKeyword(o.keywordKey),
      volumen: o.metricas?.searchVolume ?? null,
      objetivo: false as const,
      motivo:
        "Marca de un competidor. Se lee como inteligencia —dice a quien busca el paciente por " +
        "nombre— y NUNCA se persigue: posicionar por la marca de otro no trae al paciente que " +
        "este proyecto quiere y ademas no se sostiene (D-14).",
    }))
    .sort((a, b) => (b.volumen ?? -1) - (a.volumen ?? -1) || (a.keywordKey < b.keywordKey ? -1 : 1))
    .slice(0, cuantas);
}

/** JSON estable. Sin marcas de tiempo: cambiarian en cada corrida y romperian el SHA-256. */
export function serializarGap(informe: InformeDeGap): string {
  return `${JSON.stringify(informe, null, 2)}\n`;
}
