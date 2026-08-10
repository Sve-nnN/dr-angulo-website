/**
 * kw:expand — Expande el universo cruzando semillas, modificadores, metricas reales y SERP de
 * Lima, y deduplica por clave normalizada.
 *
 * Lee el snapshot commiteado de semillas: no importa ningun modulo de la aplicacion.
 * La deduplicacion usa la clave normalizada, nunca el texto visible.
 * Todo lo que sale a la red pasa por el seam de cache del plan 01, sin excepcion.
 *
 * Banderas: --offline, --refresh, --plan-only, --yes, --max-searches, --seeds-file,
 * --dino-seeds, --serp-seeds, --autocomplete, --dry-run, --out.
 */

import { existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { flagBool, flagNumber, flagString, type Flags } from "../cli.js";
import { CACHE_DIR, CliError, SEO_TOOLS_ROOT } from "../config.js";
import {
  MAX_BUSQUEDAS_POR_DEFECTO,
  SEMILLAS_DINORANK_POR_DEFECTO,
  SEMILLAS_SERPAPI_POR_DEFECTO,
  expandir,
  planificarConsultas,
  serializarCandidatos,
} from "../keywords/expand.js";
import { cargarModificadores } from "../keywords/permute.js";
import { RUTA_SNAPSHOT, cargarSnapshot } from "../keywords/seeds.js";
import { QuotaBook } from "../quota.js";
import { SERPAPI_FUENTE } from "../sources/serpapi.js";

/** Destino por defecto del universo candidato. Es un artefacto commiteado: el plan 04 lo
 *  clasifica y el plan 05 lo enriquece. */
export const RUTA_CANDIDATOS = path.join(SEO_TOOLS_ROOT, "data", "candidates.jsonl");

/** Donde queda la lista de consultas pendientes que consume quien rellena la cache. */
export const RUTA_CONSULTAS_PENDIENTES = path.join(CACHE_DIR, "pending-queries.json");

/**
 * Cuando la corrida usa un archivo de semillas distinto del snapshot (el fixture con el que
 * se prueba el tope de cuota, por ejemplo), el resultado NO puede pisar el universo bueno.
 * Se desvia a la zona de trabajo gitignoreada.
 */
function destinoPara(rutaSemillas: string, declarado: string | undefined): string {
  if (declarado !== undefined) return resolverRuta(declarado);
  if (path.resolve(rutaSemillas) === path.resolve(RUTA_SNAPSHOT)) return RUTA_CANDIDATOS;

  // Archivo suelto y no subdirectorio: cache:stats reporta cada directorio de la cache como
  // una fuente, y una carpeta de trabajo apareceria ahi como una fuente fantasma con cero
  // entradas. Los archivos del primer nivel no se cuentan.
  const base = path.basename(rutaSemillas).replace(/\.json$/, "");
  return path.join(CACHE_DIR, `candidates.${base}.jsonl`);
}

/**
 * Resuelve una ruta de bandera como la resolveria la shell: contra el directorio de trabajo.
 * El CLI se invoca con `cd seo-tools && npm run cli -- ... --seeds-file data/seeds.fixture.json`,
 * asi que "data/..." tiene que caer dentro del paquete y no en la raiz del repositorio.
 * Si desde el directorio de trabajo no existe, se reintenta contra la raiz del paquete: eso
 * cubre la invocacion desde la raiz del repositorio sin obligar a escribir la ruta larga.
 */
function resolverRuta(ruta: string): string {
  if (path.isAbsolute(ruta)) return ruta;

  const desdeCwd = path.resolve(process.cwd(), ruta);
  if (existsSync(desdeCwd)) return desdeCwd;

  const desdePaquete = path.resolve(SEO_TOOLS_ROOT, ruta);
  if (existsSync(desdePaquete)) return desdePaquete;

  return desdeCwd;
}

async function confirmar(pregunta: string): Promise<boolean> {
  if (!process.stdin.isTTY) {
    throw new CliError(
      "La expansion con datos reales gasta cuota y necesita confirmacion explicita.\n" +
        "  La entrada no es interactiva, asi que no se puede preguntar.\n" +
        "  Accion: volver a correr con --yes si el gasto de arriba es el esperado, " +
        "o con --offline / --plan-only si no.",
    );
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const respuesta = (await rl.question(`${pregunta} [si/no] `)).trim().toLowerCase();
    return respuesta === "si" || respuesta === "sí" || respuesta === "s";
  } finally {
    rl.close();
  }
}

export async function run(flags: Flags): Promise<number> {
  const rutaSemillasDeclarada = flagString(flags, "seeds-file");
  const rutaSemillas =
    rutaSemillasDeclarada === undefined ? RUTA_SNAPSHOT : resolverRuta(rutaSemillasDeclarada);
  const destino = destinoPara(rutaSemillas, flagString(flags, "out"));

  const offline = flagBool(flags, "offline");
  const soloPlanificar = flagBool(flags, "plan-only");
  const autocompletado = flagBool(flags, "autocomplete");

  const maxBusquedas = flagNumber(flags, "max-searches") ?? MAX_BUSQUEDAS_POR_DEFECTO;
  const semillasDinorank = flagNumber(flags, "dino-seeds") ?? SEMILLAS_DINORANK_POR_DEFECTO;
  const semillasSerpapi = flagNumber(flags, "serp-seeds") ?? SEMILLAS_SERPAPI_POR_DEFECTO;

  const { seeds } = await cargarSnapshot(rutaSemillas);
  const modificadores = await cargarModificadores();

  const limites = { semillasDinorank, semillasSerpapi, autocompletado };
  const plan = planificarConsultas(seeds, limites);

  // --- Camino de relleno: no se llama a nadie, se emite la lista de consultas con su clave ---

  if (soloPlanificar) {
    await mkdir(path.dirname(RUTA_CONSULTAS_PENDIENTES), { recursive: true });
    await writeFile(
      RUTA_CONSULTAS_PENDIENTES,
      `${JSON.stringify({ schema: 1, consultas: plan }, null, 2)}\n`,
      "utf8",
    );

    console.log(`Semillas: ${seeds.length} (${rutaSemillas})`);
    console.log(`tope vigente: ${maxBusquedas}`);
    console.log(`consultas planificadas: ${plan.length}`);
    for (const fuente of [...new Set(plan.map((c) => c.fuente))]) {
      console.log(`  ${fuente}: ${plan.filter((c) => c.fuente === fuente).length}`);
    }
    console.log("");
    console.log(`Consultas pendientes: ${RUTA_CONSULTAS_PENDIENTES}`);
    console.log(
      "Cada entrada trae clave, fuente, endpoint y parametros. La clave la calcula el CLI: " +
        "quien rellena la consume, nunca la inventa.",
    );
    console.log("  npm run cli -- cache:put --source <fuente> --key <clave> --file <archivo.json>");
    return 0;
  }

  // --- Presupuesto: se declara ANTES de gastar y se confirma ---

  const quota = await QuotaBook.open(CACHE_DIR);
  const busquedasPlanificadas = plan.filter((c) => c.fuente === SERPAPI_FUENTE).length;

  if (!offline && busquedasPlanificadas > 0) {
    console.log("Presupuesto de esta corrida");
    console.log(`  busquedas de ${SERPAPI_FUENTE} planificadas: ${busquedasPlanificadas} (las ya cacheadas no gastan)`);
    console.log(`  consumo acumulado de ${SERPAPI_FUENTE} entre corridas: ${quota.total(SERPAPI_FUENTE)}`);
    console.log(`  tope vigente: ${maxBusquedas}`);
    console.log("");

    if (!flagBool(flags, "yes") && !(await confirmar("¿Se gasta?"))) {
      console.log("Cancelado: no se emitio ninguna consulta.");
      return 0;
    }
  }

  const resultado = await expandir({
    seeds,
    modificadores,
    cacheDir: CACHE_DIR,
    offline,
    refresh: flagBool(flags, "refresh"),
    quota,
    maxBusquedas,
    ...limites,
  });

  console.log(`Semillas: ${seeds.length} (${rutaSemillas})`);
  console.log("");
  console.log("Candidatos brutos por capa");
  for (const [capa, n] of Object.entries(resultado.brutosPorCapa)) console.log(`  ${capa}: ${n}`);
  console.log(`  BRUTOS: ${resultado.brutos}`);
  console.log("");
  console.log(`Tras deduplicar por clave normalizada: ${resultado.trasDeduplicar}`);
  console.log(`Tras filtrar por relevancia y geografia: ${resultado.trasFiltrar}`);
  console.log("Aporte neto por capa (gana la capa que primero encontro la keyword)");
  for (const [capa, n] of Object.entries(resultado.porCapa)) console.log(`  ${capa}: ${n}`);
  console.log(`TOTAL: ${resultado.candidatos.length}`);

  if (flagBool(flags, "dry-run")) {
    console.log("");
    console.log(`--dry-run: no se escribio ${destino}.`);
    return 0;
  }

  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, serializarCandidatos(resultado.candidatos), "utf8");

  console.log("");
  console.log(`Universo candidato: ${destino}`);

  if (resultado.cortada) {
    process.stderr.write(
      `\nEl tope de ${maxBusquedas} busquedas corto la expansion.\n` +
        `  Quedaron ${resultado.pendientes.length} semillas sin procesar, de menor valor de negocio:\n` +
        resultado.pendientes.map((s) => `    - ${s}\n`).join("") +
        `  Lo consultado antes del corte quedo en cache: subir el tope y volver a correr ` +
        `gasta solo por las que faltaban.\n` +
        `  El archivo de candidatos quedo escrito y consistente con lo ya obtenido.\n`,
    );
    return 4;
  }

  return 0;
}
