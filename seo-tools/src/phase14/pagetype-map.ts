/**
 * Tipo de pagina que la SERP exige para cada cabeza medida (MAP-04).
 *
 * LA IDEA QUE ESTE MODULO DEFIENDE, y es una sola: el formato de una pagina no lo decide el
 * nombre de la keyword sino lo que Google ya esta rankeando para ella. `escoliosis` suena a
 * pagina de servicio y su top 10 esta lleno de contenido internacional; escribir una pagina
 * de servicio contra esa SERP es competir en el formato equivocado. El nombre acierta casi
 * siempre, y el valor de medir esta justo en las veces que no.
 *
 * De donde sale el dato: de las 96 capturas ya pagadas en `.cache/serpapi/`, leidas en modo
 * offline. COSTE DE CUOTA: CERO (D-07). El modo offline convierte un fallo de cache en error
 * duro en vez de en un gasto silencioso: si una captura faltara, la cabeza se nombra en
 * `sinCaptura` y nadie sale a la red a reponerla.
 *
 * La clasificacion y la tabla de precedencia son las de la fase 13 (`phase13/pagetype.ts`).
 * Aca no se reimplementa nada de eso: se recorre el universo de cabezas, se agrega y se le
 * pone al resultado la procedencia que la fase 15 va a necesitar para justificar cada formato.
 */

import { writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { cargarReglasDeTipo, clasificarSerp, type ReglasDeTipo } from "../phase13/pagetype.js";
import { leerSerp } from "../phase13/serp.js";

/** Las cabezas cuya SERP se midio. Es el mismo archivo que consume el modulo de solape. */
const RUTA_CANDIDATAS = path.join(SEO_TOOLS_ROOT, "data", "serp-candidates.json");

/**
 * Confianza por proporcion de posiciones que una regla explicita pudo tipificar.
 *
 * Un resultado que cae en `otro` no aporta senal de formato: solo dice que el dominio no
 * calzo con ninguna regla. Un top 10 con ocho `otro` y dos `guia` declararia `guia` como
 * dominante con dos apariciones, y eso es una conclusion fragil que hay que marcar como tal
 * en vez de presentarla igual que una con nueve directorios medidos.
 */
const CORTE_ALTA = 0.7;
const CORTE_MEDIA = 0.4;

export type NivelDeConfianza = "alta" | "media" | "baja";

export interface CabezaTipificada {
  readonly keyword: string;
  /** Forma normalizada. Es la clave con la que el mapa keyword-URL la va a cruzar. */
  readonly keywordKey: string;
  /** Tipo dominante del top 10, con el desempate de la fase 13. */
  readonly tipoDePagina: string;
  /** Conteo por tipo, emitido en el orden de precedencia para que serialice igual siempre. */
  readonly repartoDeTipos: Readonly<Record<string, number>>;
  /** Cuantos organicos trajo la captura. El reparto suma exactamente esto. */
  readonly posicionesMedidas: number;
  /** Cuantas de esas posiciones calzaron con una regla explicita y no cayeron en el defecto. */
  readonly posicionesTipificadas: number;
  readonly confianza: NivelDeConfianza;
  /** URL de la primera posicion organica. La referencia concreta de a quien hay que ganarle. */
  readonly topResult: string | null;
  /** Dominio de esa primera posicion, para leer el mapa sin parsear URLs. */
  readonly topDominio: string | null;
  /** Tipo de esa primera posicion, que a veces difiere del dominante y ahi esta el matiz. */
  readonly topTipo: string | null;
}

export interface MapaDeTipos {
  readonly schema: number;
  readonly umbralDeConfianza: { readonly alta: number; readonly media: number };
  readonly cabezas: readonly CabezaTipificada[];
  /** Cabezas pedidas sin captura utilizable. Se nombran, no desaparecen en silencio. */
  readonly sinCaptura: readonly string[];
  readonly resumen: {
    readonly candidatas: number;
    readonly tipificadas: number;
    readonly sinCaptura: number;
    readonly porTipoDominante: Readonly<Record<string, number>>;
    readonly porConfianza: Readonly<Record<NivelDeConfianza, number>>;
  };
}

interface Candidata {
  readonly keyword: string;
}

/** Lee la lista de cabezas medidas. Es dato de la fase 13 y aca solo se consume. */
export function candidatasMedidas(rutaArchivo: string = RUTA_CANDIDATAS): string[] {
  let crudo: string;
  try {
    crudo = readFileSync(rutaArchivo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${rutaArchivo}.\n` +
        `  Accion: es la lista de cabezas que la fase 13 midio. Sin ella no hay que tipificar.`,
    );
  }
  const archivo = JSON.parse(crudo) as { readonly candidatas?: readonly Candidata[] };
  return (archivo.candidatas ?? []).map((c) => c.keyword);
}

function nivelDeConfianza(tipificadas: number, medidas: number): NivelDeConfianza {
  if (medidas === 0) return "baja";
  const proporcion = tipificadas / medidas;
  if (proporcion >= CORTE_ALTA) return "alta";
  if (proporcion >= CORTE_MEDIA) return "media";
  return "baja";
}

/**
 * Recorre las cabezas medidas y devuelve el tipo de pagina exigido por cada SERP.
 *
 * Determinista por construccion: el orden es el del archivo de candidatas, el reparto se emite
 * en el orden de precedencia y no se escribe ninguna marca de tiempo. Dos corridas seguidas
 * tienen que dar el mismo SHA-256, y hay una prueba que lo comprueba.
 */
export async function construirMapaDeTipos(
  keywords: readonly string[] = candidatasMedidas(),
  opciones: { readonly reglas?: ReglasDeTipo } = {},
): Promise<MapaDeTipos> {
  const reglas = opciones.reglas ?? cargarReglasDeTipo();

  const cabezas: CabezaTipificada[] = [];
  const sinCaptura: string[] = [];
  const vistas = new Set<string>();

  for (const keyword of keywords) {
    const keywordKey = normalizeKeyword(keyword);
    if (keywordKey === "" || vistas.has(keywordKey)) continue;
    vistas.add(keywordKey);

    let serp;
    try {
      // Offline: una captura ausente es un error de lectura, jamas una busqueda nueva.
      serp = await leerSerp(keyword, { offline: true });
    } catch {
      sinCaptura.push(keyword);
      continue;
    }

    const clasificada = clasificarSerp(serp, reglas);
    if (clasificada.tipoDominante === null || clasificada.resultados.length === 0) {
      sinCaptura.push(keyword);
      continue;
    }

    const posicionesMedidas = clasificada.resultados.length;
    const posicionesTipificadas = clasificada.resultados.filter((r) => r.regla !== "defecto").length;

    // El primero por posicion, no el primero del arreglo: la captura puede venir con huecos.
    const primero = clasificada.resultados.reduce((mejor, r) =>
      r.posicion < mejor.posicion ? r : mejor,
    );

    cabezas.push({
      keyword,
      keywordKey,
      tipoDePagina: clasificada.tipoDominante,
      repartoDeTipos: clasificada.reparto,
      posicionesMedidas,
      posicionesTipificadas,
      confianza: nivelDeConfianza(posicionesTipificadas, posicionesMedidas),
      topResult: primero.url,
      topDominio: primero.dominio,
      topTipo: primero.tipo,
    });
  }

  const porTipoDominante: Record<string, number> = {};
  for (const tipo of reglas.precedencia) {
    const n = cabezas.filter((c) => c.tipoDePagina === tipo).length;
    if (n > 0) porTipoDominante[tipo] = n;
  }

  const porConfianza: Record<NivelDeConfianza, number> = { alta: 0, media: 0, baja: 0 };
  for (const cabeza of cabezas) porConfianza[cabeza.confianza] += 1;

  return {
    schema: 1,
    umbralDeConfianza: { alta: CORTE_ALTA, media: CORTE_MEDIA },
    cabezas,
    sinCaptura,
    resumen: {
      candidatas: cabezas.length + sinCaptura.length,
      tipificadas: cabezas.length,
      sinCaptura: sinCaptura.length,
      porTipoDominante,
      porConfianza,
    },
  };
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase14/pagetype-map.ts --out data/page-type-map.json
//
// COSTE DE CUOTA: CERO. Todo sale de `.cache/serpapi/` en modo offline.

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const destino = texto(banderas, "out") ?? "data/page-type-map.json";
  const absoluto = path.isAbsolute(destino) ? destino : path.resolve(SEO_TOOLS_ROOT, destino);

  const mapa = await construirMapaDeTipos();

  // Sin marcas de tiempo adentro: dos corridas tienen que dar el mismo SHA-256.
  writeFileSync(absoluto, `${JSON.stringify(mapa, null, 2)}\n`, "utf8");

  const out = process.stdout;
  out.write(`Cabezas tipificadas desde cache: ${mapa.resumen.tipificadas}\n`);
  out.write(`  sin captura utilizable:        ${mapa.resumen.sinCaptura}\n`);
  out.write(`\nTipo de pagina que exige la SERP:\n`);
  for (const [tipo, n] of Object.entries(mapa.resumen.porTipoDominante)) {
    out.write(`  ${tipo.padEnd(24)} ${String(n).padStart(3)}\n`);
  }
  out.write(`\nConfianza de la tipificacion:\n`);
  for (const [nivel, n] of Object.entries(mapa.resumen.porConfianza)) {
    out.write(`  ${nivel.padEnd(24)} ${String(n).padStart(3)}\n`);
  }
  if (mapa.sinCaptura.length > 0) {
    out.write(`\nCabezas sin captura (${mapa.sinCaptura.length}):\n`);
    for (const k of mapa.sinCaptura) out.write(`  - ${k}\n`);
  }

  out.write(`\nEscrito: ${absoluto}\n`);
  return 0;
}

// Solo corre como ejecutable. Importarlo desde una prueba no escribe nada.
if (process.argv[1] !== undefined && process.argv[1].endsWith("pagetype-map.ts")) {
  ejecutar(main);
}
