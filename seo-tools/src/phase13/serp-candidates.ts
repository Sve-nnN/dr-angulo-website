/**
 * Punto de entrada: elegir en que se gastan las 90 busquedas de la fase 13.
 *
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/serp-candidates.ts --budget 90
 *
 * COSTE DE CUOTA: CERO, y no por convencion sino por construccion. Este ejecutable solo lee
 * data/keywords.jsonl y comprueba la EXISTENCIA de archivos bajo .cache/serpapi/. No importa
 * el cliente de la fuente, no arma una peticion y no necesita credencial. El contador del
 * libro de cuota vale lo mismo antes y despues de correrlo, y ese es un criterio de
 * aceptacion del plan, no una promesa.
 *
 * POR QUE COMPRUEBA LA CACHE CALCULANDO LA CLAVE Y NO LEYENDO EL `q` DE CADA ENVELOPE. Las dos
 * cosas dan hoy el mismo resultado, pero la clave es la que decide de verdad si `serp-capture`
 * va a acertar en cache o va a gastar una busqueda. Calcularla con la misma funcion que usa el
 * seam significa que si alguien tocara `parametrosBusqueda` este informe lo diria en vez de
 * mentir sobre lo que es gratis.
 *
 * Banderas:
 *   --budget N     Presupuesto de busquedas NUEVAS. Por defecto, el del archivo de reglas (90).
 *   --heads N      Techo de cabezas. Por defecto 95.
 *   --out RUTA     Donde escribir. Por defecto data/serp-candidates.json.
 *   --dry-run      No escribe: solo imprime el balance.
 *   --exclude A,B  Keywords que la revision saca de la lista.
 *   --include A,B  Keywords que la revision rescata de las cercanas al corte.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { booleana, ejecutar, numero, parseBanderas, texto } from "./args.js";
import { cachePath, cacheKey } from "../cache.js";
import { CACHE_DIR, CliError, SEO_TOOLS_ROOT } from "../config.js";
import {
  cargarReglasDeCandidatas,
  seleccionarCandidatas,
  type RegistroDeKeyword,
  type SeleccionDeCandidatas,
} from "./candidates.js";
import {
  SERPAPI_ENDPOINT,
  SERPAPI_FUENTE,
  parametrosBusqueda,
} from "../sources/serpapi.js";

const RUTA_KEYWORDS = path.join(SEO_TOOLS_ROOT, "data", "keywords.jsonl");
const RUTA_SALIDA = path.join(SEO_TOOLS_ROOT, "data", "serp-candidates.json");

/** Lee el dataset cerrado de la fase 12. SOLO LECTURA: este plan no lo escribe jamas. */
function leerKeywords(): RegistroDeKeyword[] {
  let crudo: string;
  try {
    crudo = readFileSync(RUTA_KEYWORDS, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer el universo de keywords.\n  Ruta: ${RUTA_KEYWORDS}\n` +
        `  Accion: es el dataset que cerro la fase 12; tiene que estar commiteado.`,
    );
  }

  const lineas = crudo.trim().split("\n");
  return lineas.map((linea, i) => {
    try {
      return JSON.parse(linea) as RegistroDeKeyword;
    } catch (error) {
      throw new CliError(
        `La linea ${i + 1} de keywords.jsonl no es JSON valido.\n  Detalle: ${String(error)}`,
      );
    }
  });
}

/**
 * Claves normalizadas cuya SERP de Lima ya esta capturada.
 *
 * Se comprueba la existencia del archivo, sin abrirlo y sin salir a la red.
 */
function clavesEnCache(keywords: readonly RegistroDeKeyword[]): Set<string> {
  const enCache = new Set<string>();
  for (const registro of keywords) {
    const clave = cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametrosBusqueda(registro.keyword));
    if (existsSync(cachePath(CACHE_DIR, SERPAPI_FUENTE, clave))) enCache.add(registro.keywordKey);
  }
  return enCache;
}

function lista(valor: string | undefined): string[] {
  if (valor === undefined) return [];
  return valor
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

function imprimirBalance(seleccion: SeleccionDeCandidatas): void {
  const r = seleccion.resumen;
  const out = process.stdout;

  out.write(`\nCabezas elegidas: ${r.cabezas} de un techo de ${seleccion.objetivoDeCabezas}\n`);
  out.write(`  ya en cache (gratis): ${r.enCache}\n`);
  out.write(`  busquedas nuevas:     ${r.busquedasNuevas} de un presupuesto de ${r.presupuesto}\n`);
  out.write(`  holgura:              ${r.holgura}\n`);

  out.write(`\nPor familia:\n`);
  for (const [familia, cuantas] of Object.entries(r.porRango)) {
    out.write(`  ${familia.padEnd(32)} ${String(cuantas).padStart(3)}\n`);
  }

  out.write(`\nCerca del corte, retenidas para la revision: ${r.cercaDelCorte}\n`);
  out.write(`Marcadas como posible ruido dentro de la lista: ${r.posiblesRuido}\n`);
  for (const c of seleccion.posiblesRuido) {
    out.write(`  - ${c.keyword} (${c.posibleRuido})\n`);
  }
  out.write(`Duplicados probables dentro de la lista: ${r.duplicadosProbables}\n`);
  for (const d of seleccion.duplicadosProbables) {
    out.write(`  - ${d.keywordKey}  ~  ${d.duplicaA}\n`);
  }
  out.write(`Excluidas antes de rankear: ${r.excluidas}\n`);
  const porRegla: Record<string, number> = {};
  for (const e of seleccion.excluidas) porRegla[e.regla] = (porRegla[e.regla] ?? 0) + 1;
  for (const [regla, cuantas] of Object.entries(porRegla).sort()) {
    out.write(`  ${regla.padEnd(32)} ${String(cuantas).padStart(3)}\n`);
  }
  out.write(`Absorbidas por colapso de la preposicion: ${r.absorbidas}\n`);
  out.write(`Keywords de alcance objetivo evaluadas: ${r.evaluadas}\n`);
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const reglas = cargarReglasDeCandidatas();

  const keywords = leerKeywords();
  const enCache = clavesEnCache(keywords);

  const seleccion = seleccionarCandidatas(keywords, {
    reglas,
    presupuesto: numero(banderas, "budget"),
    objetivoDeCabezas: numero(banderas, "heads"),
    enCache,
    excluir: lista(texto(banderas, "exclude")),
    incluir: lista(texto(banderas, "include")),
  });

  imprimirBalance(seleccion);

  if (booleana(banderas, "dry-run")) {
    process.stdout.write(`\nEnsayo: no se escribio nada.\n`);
    return 0;
  }

  const destino = texto(banderas, "out") ?? RUTA_SALIDA;
  // Dos corridas producen el mismo archivo byte a byte: nada de marcas de tiempo aca dentro.
  writeFileSync(destino, `${JSON.stringify(seleccion, null, 2)}\n`, "utf8");
  process.stdout.write(`\nEscrito: ${destino}\n`);

  return 0;
}

ejecutar(main);
