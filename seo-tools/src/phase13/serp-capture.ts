/**
 * Punto de entrada: gastar el presupuesto de SERP de la fase 13, con techo acumulado.
 *
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/serp-capture.ts \
 *     --candidates data/serp-candidates.json --dry-run
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/serp-capture.ts \
 *     --candidates data/serp-candidates.json --yes
 *
 * SIN `--yes` NO SALE NI UNA CONSULTA. Es el mismo contrato de confirmacion que la fase 12 uso
 * para toda operacion que gasta o destruye, y aca pesa mas que en ningun otro comando del
 * proyecto: lo que se gasta no se repone hasta el 2026-08-21.
 *
 * La aritmetica del techo, y por que no basta con `--max-searches`, esta escrita entera en la
 * cabecera de `capture.ts`. Resumen de una linea: `--max-searches` topea POR CORRIDA, asi que
 * volver a correr el comando volveria a gastar; el techo de `capture.ts` es ACUMULADO y lee el
 * libro de disco.
 *
 * Banderas:
 *   --candidates RUTA  Lista aprobada. Por defecto data/serp-candidates.json.
 *   --max-searches N   Tope adicional de ESTA corrida. Nunca amplia el techo acumulado.
 *   --ceiling N        Techo acumulado. Por defecto 102: las 12 del libro mas las 90 de D-01.
 *   --dry-run          Ensayo explicito. Equivale a no pasar --yes.
 *   --yes              Confirma el gasto. Es lo unico que autoriza salir a la red.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { booleana, ejecutar, numero, parseBanderas, texto } from "./args.js";
import { cacheKey, cachePath } from "../cache.js";
import { CACHE_DIR, CliError, SEO_TOOLS_ROOT } from "../config.js";
import { QuotaBook } from "../quota.js";
import {
  SERPAPI_ENDPOINT,
  SERPAPI_FUENTE,
  parametrosBusqueda,
} from "../sources/serpapi.js";
import {
  ACUMULADO_AL_ABRIR_LA_FASE,
  DISPONIBLES_DEL_PROVEEDOR,
  ejecutarCaptura,
  planificarCaptura,
  type BalanceDeCaptura,
  type CabezaACapturar,
  type CabezaResuelta,
  type PlanDeCaptura,
} from "./capture.js";

const RUTA_CANDIDATAS = path.join(SEO_TOOLS_ROOT, "data", "serp-candidates.json");

interface ArchivoDeCandidatas {
  readonly candidatas?: readonly {
    readonly keyword?: unknown;
    readonly keywordKey?: unknown;
    readonly enCache?: unknown;
  }[];
}

/**
 * Lee la lista APROBADA. No la recalcula ni la re-filtra: la lista es una decision humana y
 * este comando la consume tal cual. Si Juan pidio cambios, el que los aplica es
 * `serp-candidates.ts` con --exclude / --include, y este comando lee el archivo resultante.
 */
function leerCandidatas(ruta: string): CabezaACapturar[] {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer la lista de candidatas.\n  Ruta: ${ruta}\n` +
        `  Accion: generarla con: ./node_modules/.bin/tsx src/phase13/serp-candidates.ts --budget 90`,
    );
  }

  let archivo: ArchivoDeCandidatas;
  try {
    archivo = JSON.parse(crudo) as ArchivoDeCandidatas;
  } catch (error) {
    throw new CliError(`La lista de candidatas no es JSON valido.\n  Detalle: ${String(error)}`);
  }

  const filas = archivo.candidatas;
  if (!Array.isArray(filas) || filas.length === 0) {
    throw new CliError(
      `La lista de candidatas no trae el bloque "candidatas" o esta vacio.\n  Ruta: ${ruta}`,
    );
  }

  return filas.map((fila, i) => {
    if (typeof fila.keyword !== "string" || fila.keyword.trim() === "") {
      throw new CliError(`La candidata ${i + 1} no declara su keyword.`);
    }
    const keywordKey = typeof fila.keywordKey === "string" ? fila.keywordKey : fila.keyword;
    return { keyword: fila.keyword, keywordKey, enCache: fila.enCache === true };
  });
}

/**
 * Vuelve a medir contra el disco cuales estan en cache, con la MISMA funcion de clave que usa
 * el seam. El campo `enCache` del archivo se calculo cuando se genero la lista; si entre medio
 * alguien capturo o borro algo, la medicion de ahora es la que dice la verdad sobre el gasto.
 */
function remedirCache(cabezas: readonly CabezaACapturar[]): CabezaACapturar[] {
  return cabezas.map((c) => {
    const clave = cacheKey(SERPAPI_FUENTE, SERPAPI_ENDPOINT, parametrosBusqueda(c.keyword));
    return { ...c, enCache: existsSync(cachePath(CACHE_DIR, SERPAPI_FUENTE, clave)) };
  });
}

function imprimirPlan(
  plan: PlanDeCaptura,
  cabezas: readonly CabezaACapturar[],
  discrepancias: readonly string[],
): void {
  const out = process.stdout;

  out.write(`\nLista aprobada: ${cabezas.length} cabezas\n`);
  out.write(`  ya en cache (coste cero):   ${plan.yaEnCache.length}\n`);
  out.write(`  habria que emitir:          ${plan.aEmitir.length}\n`);

  out.write(`\nTecho acumulado de la fase\n`);
  out.write(`  techo:                      ${plan.techo}\n`);
  out.write(`  acumulado en el libro:      ${plan.acumulado}\n`);
  out.write(`  margen disponible:          ${plan.disponibles}\n`);
  out.write(`  tope de esta corrida:       ${plan.maxPerRun}\n`);
  if (plan.sinCupo > 0) {
    out.write(`  NO caben bajo el techo:     ${plan.sinCupo}\n`);
  }

  const gastoProyectado = Math.min(plan.aEmitir.length, plan.maxPerRun);
  const libroDespues = plan.acumulado + gastoProyectado;
  const gastoDeLaFase = libroDespues - ACUMULADO_AL_ABRIR_LA_FASE;
  out.write(`\nSi esta corrida sale de verdad\n`);
  out.write(`  consultas que saldrian:     ${gastoProyectado}\n`);
  out.write(`  el libro quedaria en:       ${libroDespues}\n`);
  out.write(`  gasto de la fase:           ${gastoDeLaFase}\n`);
  out.write(`  reserva del proveedor:      ${DISPONIBLES_DEL_PROVEEDOR - gastoDeLaFase}\n`);

  if (discrepancias.length > 0) {
    out.write(
      `\nAviso: ${discrepancias.length} cabezas traian un enCache distinto del que dice el disco.\n`,
    );
    for (const d of discrepancias.slice(0, 10)) out.write(`  - ${d}\n`);
  }

  out.write(`\nLas que se emitirian, en orden de valor de negocio:\n`);
  plan.aEmitir.forEach((c, i) => {
    const marca = i < plan.maxPerRun ? " " : "x";
    out.write(`  ${marca} ${String(i + 1).padStart(3)}. ${c.keyword}\n`);
  });

  if (plan.yaEnCache.length > 0) {
    out.write(`\nLas que resuelve la cache, gratis:\n`);
    for (const c of plan.yaEnCache) out.write(`      ${c.keyword}\n`);
  }
}

function imprimirBalance(balance: BalanceDeCaptura): void {
  const out = process.stdout;

  out.write(`\n=== Balance de la corrida ===\n`);
  out.write(`  consultas emitidas:         ${balance.emitidas}\n`);
  out.write(`  aciertos de cache:          ${balance.aciertos}\n`);
  out.write(`  libro antes:                ${balance.acumuladoAntes}\n`);
  out.write(`  libro despues:              ${balance.acumuladoDespues}\n`);
  out.write(`  techo acumulado:            ${balance.techo}\n`);
  out.write(`  gasto imputable a la fase:  ${balance.gastoDeLaFase}\n`);
  out.write(`  reserva del proveedor:      ${balance.reservaRestante}\n`);

  if (balance.vacias.length > 0) {
    out.write(`\n  SERP vacias, registradas y NO reintentadas: ${balance.vacias.length}\n`);
    for (const k of balance.vacias) out.write(`    - ${k}\n`);
  }
  if (balance.sinCupo.length > 0) {
    out.write(`\n  Sin cupo bajo el techo: ${balance.sinCupo.length}\n`);
    for (const k of balance.sinCupo) out.write(`    - ${k}\n`);
  }
  if (balance.topeAlcanzado) {
    out.write(`\n  El techo acumulado corto la corrida. Es el comportamiento esperado.\n`);
  }
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));

  const ruta = texto(banderas, "candidates") ?? RUTA_CANDIDATAS;
  const declaradas = leerCandidatas(ruta);
  const cabezas = remedirCache(declaradas);

  const discrepancias = declaradas
    .map((d, i) => ({ d, medida: cabezas[i]?.enCache === true }))
    .filter(({ d, medida }) => d.enCache !== medida)
    .map(
      ({ d, medida }) =>
        `${d.keyword} (archivo: ${String(d.enCache)}, disco: ${String(medida)})`,
    );

  const quota = await QuotaBook.open(CACHE_DIR);

  // Puede lanzar QuotaExceededError, que sale con codigo 4 SIN haber emitido nada.
  const plan = planificarCaptura(cabezas, {
    acumulado: quota.total(SERPAPI_FUENTE),
    techo: numero(banderas, "ceiling"),
    maxSearches: numero(banderas, "max-searches"),
  });

  imprimirPlan(plan, cabezas, discrepancias);

  const confirmado = booleana(banderas, "yes") && !booleana(banderas, "dry-run");
  if (!confirmado) {
    process.stdout.write(
      `\nEnsayo: no salio ninguna consulta y el libro de cuota sigue en ${plan.acumulado}.\n` +
        `Para gastar de verdad, repetir el comando con --yes.\n`,
    );
    return 0;
  }

  process.stdout.write(`\nEmitiendo. Cada punto es una consulta que ya no vuelve.\n`);

  const balance = await ejecutarCaptura(plan, cabezas, {
    quota,
    alResolver: (cabeza: CabezaResuelta, indice: number, total: number) => {
      const simbolo =
        cabeza.desenlace === "capturada"
          ? "+"
          : cabeza.desenlace === "acierto"
            ? "."
            : cabeza.desenlace === "vacia"
              ? "0"
              : "x";
      process.stdout.write(
        `  ${simbolo} ${String(indice + 1).padStart(3)}/${total}  ` +
          `${cabeza.keyword} (${cabeza.organicos} organicos)\n`,
      );
    },
  });

  imprimirBalance(balance);
  return 0;
}

ejecutar(main);
