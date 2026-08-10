/**
 * kw:classify — Clasifica intencion y etapa con un motor de reglas determinista y consolida
 * el dataset del milestone.
 *
 * Determinista a proposito: la misma entrada da la misma salida y el resultado es auditable.
 * NINGUNA corrida de este subcomando invoca un modelo de lenguaje. El residuo ambiguo se
 * resuelve una sola vez fuera de linea y queda congelado en data/intent-overrides.json, que
 * el clasificador consulta ANTES de evaluar reglas. Ese orden es lo que mantiene estable la
 * reejecucion de SHEET-06.
 *
 * Tres modos:
 *
 *   (sin banderas)   Consolida candidates.jsonl mas la clasificacion en keywords.jsonl.
 *   --dry-run        Calcula y reporta la distribucion, sin escribir ni un archivo.
 *   --residue-only   Emite el residuo ambiguo a un archivo, sin clasificarlo, para la tarea 2.
 *
 * La salida de --dry-run y la de --residue-only son CONTRATO de los criterios del plan 12-04:
 * se capturan dos veces y se comparan byte por byte. Ni una linea puede depender del reloj,
 * del sistema de archivos ni del orden de iteracion de un objeto.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { flagBool, flagString, type Flags } from "../cli.js";
import { CACHE_DIR, CliError, SEO_TOOLS_ROOT } from "../config.js";
import {
  cargarAnulaciones,
  cargarReglas,
  clasificar,
  ETAPAS,
  INTENCIONES,
  type Anulaciones,
  type Clasificacion,
  type Reglas,
} from "../keywords/classify.js";
import { normalizeKeyword } from "../keywords/normalize.js";

/** Universo candidato del plan 03. Entrada de este subcomando. */
const RUTA_CANDIDATOS = path.join(SEO_TOOLS_ROOT, "data", "candidates.jsonl");

/** Dataset consolidado del milestone: entrada del escritor del Sheet y del plan 05. */
const RUTA_DATASET = path.join(SEO_TOOLS_ROOT, "data", "keywords.jsonl");

/**
 * El residuo es un artefacto de trabajo, no del proyecto: lo que se commitea es la DECISION
 * sobre el residuo, que vive en intent-overrides.json. Por eso sale a la zona gitignoreada.
 */
const RUTA_RESIDUO = path.join(CACHE_DIR, "residue.jsonl");

/**
 * Valor literal de las tres metricas cuya fuente quedo diferida por decision de Juan del
 * 2026-08-10. Existen para TODO el universo, con este valor, para que el enriquecimiento
 * diferido rellene campos en lugar de migrar el esquema y el Sheet.
 */
const NO_CONSULTADO = "no_consultado";

const METRICAS_DIFERIDAS = ["trafficPotential", "keywordDifficulty", "referringDomainsNeeded"] as const;

interface Candidato {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly semilla?: string;
  readonly capa?: string;
  readonly estado?: string;
  readonly metricas?: {
    readonly searchVolume?: number | null;
    readonly cpc?: number | null;
    readonly competition?: number | null;
    readonly fuente?: string;
  };
}

function resolverRuta(candidata: string): string {
  if (path.isAbsolute(candidata)) return candidata;
  const desdeCwd = path.resolve(process.cwd(), candidata);
  if (existsSync(desdeCwd)) return desdeCwd;
  return path.resolve(SEO_TOOLS_ROOT, candidata);
}

async function leerJsonl(ruta: string): Promise<Candidato[]> {
  let crudo: string;
  try {
    crudo = await readFile(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer el universo candidato.\n  Ruta: ${ruta}\n` +
        `  Accion: correr antes "npm run cli -- kw:expand", que es quien lo produce.`,
    );
  }

  const salida: Candidato[] = [];
  crudo.split("\n").forEach((linea, i) => {
    const texto = linea.trim();
    if (texto === "") return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(texto);
    } catch {
      throw new CliError(`La linea ${i + 1} de ${ruta} no es JSON valido.`);
    }
    const o = parsed as Candidato;
    if (typeof o.keyword !== "string" || o.keyword === "") {
      throw new CliError(`La linea ${i + 1} de ${ruta} no trae el texto de la keyword.`);
    }
    salida.push(o);
  });
  return salida;
}

/**
 * Un registro del dataset consolidado.
 *
 * El orden de las claves es fijo y esta escrito a mano, no derivado de un objeto: el archivo
 * se commitea y un diff de git que reordene claves en 5716 lineas no lo revisa nadie.
 */
function consolidar(candidato: Candidato, c: Clasificacion): Record<string, unknown> {
  const m = candidato.metricas;
  const conDatos = m !== undefined;
  const fuente = conDatos ? (m.fuente ?? "dinorank") : "sin_datos";

  return {
    keyword: candidato.keyword,
    keywordKey: candidato.keywordKey ?? normalizeKeyword(candidato.keyword),
    semilla: candidato.semilla ?? null,
    capa: candidato.capa ?? null,
    estado: candidato.estado ?? (conDatos ? "con_datos" : "sin_datos"),

    // Metricas de DinoRank, con su procedencia POR METRICA. Se queda en el dataset: la
    // decision J-3 de Juan prohibe columnas de procedencia en el Sheet del cliente.
    metricas: {
      searchVolume: conDatos ? (m.searchVolume ?? null) : null,
      searchVolumeFuente: conDatos && m.searchVolume != null ? fuente : "sin_datos",
      cpc: conDatos ? (m.cpc ?? null) : null,
      cpcFuente: conDatos && m.cpc != null ? fuente : "sin_datos",
      competition: conDatos ? (m.competition ?? null) : null,
      competitionFuente: conDatos && m.competition != null ? fuente : "sin_datos",
    },

    // Las tres metricas diferidas. NO son lo mismo que una metrica ausente: el esquema
    // completo existe desde ahora y el enriquecimiento diferido no migra nada.
    trafficPotential: NO_CONSULTADO,
    keywordDifficulty: NO_CONSULTADO,
    referringDomainsNeeded: NO_CONSULTADO,

    intent: c.intent,
    intentSource: c.intentSource,
    intentRegla: c.intentRegla,
    stage: c.stage,
    stageRegla: c.stageRegla,
    alcance: c.alcance,
    motivoAlcance: c.motivoAlcance,
    ambiguo: c.ambiguo,
    motivoAmbiguo: c.motivoAmbiguo,
  };
}

interface Distribucion {
  readonly porIntencion: Record<string, number>;
  readonly porEtapa: Record<string, number>;
  readonly porOrigen: Record<string, number>;
  readonly porAlcance: Record<string, number>;
  readonly residuo: number;
}

function medir(clasificadas: readonly Clasificacion[]): Distribucion {
  const porIntencion: Record<string, number> = {};
  const porEtapa: Record<string, number> = {};
  const porOrigen: Record<string, number> = { reglas: 0, llm: 0 };
  const porAlcance: Record<string, number> = {};
  let residuo = 0;

  for (const nivel of INTENCIONES) porIntencion[nivel] = 0;
  for (const etapa of ETAPAS) porEtapa[etapa] = 0;

  for (const c of clasificadas) {
    porIntencion[c.intent] = (porIntencion[c.intent] ?? 0) + 1;
    porEtapa[c.stage] = (porEtapa[c.stage] ?? 0) + 1;
    porOrigen[c.intentSource] = (porOrigen[c.intentSource] ?? 0) + 1;
    const clave = c.motivoAlcance ?? "objetivo";
    porAlcance[clave] = (porAlcance[clave] ?? 0) + 1;
    if (c.ambiguo) residuo += 1;
  }
  return { porIntencion, porEtapa, porOrigen, porAlcance, residuo };
}

function reportar(total: number, d: Distribucion, anulaciones: number): void {
  const pct = (n: number): string => (total === 0 ? "0.0" : ((n / total) * 100).toFixed(1));

  console.log(`universo: ${total}`);
  console.log("");
  console.log("intencion:");
  for (const nivel of INTENCIONES) {
    console.log(`  ${nivel.padEnd(14)} ${String(d.porIntencion[nivel] ?? 0).padStart(5)}  ${pct(d.porIntencion[nivel] ?? 0)}%`);
  }
  console.log("");
  console.log("etapa del paciente:");
  for (const etapa of ETAPAS) {
    console.log(`  ${etapa.padEnd(14)} ${String(d.porEtapa[etapa] ?? 0).padStart(5)}  ${pct(d.porEtapa[etapa] ?? 0)}%`);
  }
  console.log("");
  console.log("origen de la intencion:");
  for (const origen of ["reglas", "llm"]) {
    console.log(`  ${origen.padEnd(14)} ${String(d.porOrigen[origen] ?? 0).padStart(5)}  ${pct(d.porOrigen[origen] ?? 0)}%`);
  }
  console.log("");
  console.log("alcance:");
  for (const motivo of Object.keys(d.porAlcance).sort()) {
    console.log(`  ${motivo.padEnd(22)} ${String(d.porAlcance[motivo]).padStart(5)}  ${pct(d.porAlcance[motivo] as number)}%`);
  }
  console.log("");
  console.log(`anulaciones cargadas: ${anulaciones}`);
  console.log(`residuo ambiguo: ${d.residuo}  ${pct(d.residuo)}%`);
}

function usage(): string {
  return [
    "Uso: npm run cli -- kw:classify [banderas]",
    "",
    "  --input <ruta>       Universo candidato. Por defecto, data/candidates.jsonl.",
    "  --out <ruta>         Dataset consolidado. Por defecto, data/keywords.jsonl.",
    "  --rules <ruta>       Archivo de reglas. Por defecto, data/intent-rules.json.",
    "  --overrides <ruta>   Archivo de anulaciones. Por defecto, data/intent-overrides.json.",
    "  --dry-run            Calcula y reporta la distribucion, sin escribir nada.",
    "  --residue-only       Emite solo el residuo ambiguo, sin clasificarlo ni consolidar.",
    "  --residue-out <ruta> Destino del residuo. Por defecto, .cache/residue.jsonl.",
    "",
    "Ninguno de los tres modos sale a la red ni invoca un modelo de lenguaje.",
    "",
  ].join("\n");
}

export async function run(flags: Flags): Promise<number> {
  if (flagBool(flags, "help")) {
    process.stdout.write(usage());
    return 0;
  }

  const rutaEntrada = resolverRuta(flagString(flags, "input") ?? RUTA_CANDIDATOS);
  const candidatos = await leerJsonl(rutaEntrada);

  const reglas: Reglas = cargarReglas(
    flagString(flags, "rules") !== undefined
      ? resolverRuta(flagString(flags, "rules") as string)
      : undefined,
  );
  const anulaciones: Anulaciones = cargarAnulaciones(
    flagString(flags, "overrides") !== undefined
      ? resolverRuta(flagString(flags, "overrides") as string)
      : undefined,
  );

  // Una sola pasada. El orden de salida es el de entrada, que es lo que hace que dos corridas
  // produzcan archivos identicos byte por byte.
  const clasificadas = candidatos.map((c) => clasificar(c.keywordKey ?? normalizeKeyword(c.keyword), reglas, anulaciones));
  const distribucion = medir(clasificadas);

  // --- Modo residuo: emite lo ambiguo y no consolida nada. ---
  if (flagBool(flags, "residue-only")) {
    const destino = resolverRuta(flagString(flags, "residue-out") ?? RUTA_RESIDUO);
    const lineas = candidatos
      .map((c, i) => ({ candidato: c, clasificacion: clasificadas[i] as Clasificacion }))
      .filter((par) => par.clasificacion.ambiguo)
      .map((par) =>
        JSON.stringify({
          keyword: par.candidato.keyword,
          keywordKey: par.candidato.keywordKey,
          motivoAmbiguo: par.clasificacion.motivoAmbiguo,
          intentPorReglas: par.clasificacion.intent,
          stagePorReglas: par.clasificacion.stage,
          alcance: par.clasificacion.alcance,
          motivoAlcance: par.clasificacion.motivoAlcance,
          volumen: par.candidato.metricas?.searchVolume ?? null,
        }),
      );

    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, lineas.length === 0 ? "" : `${lineas.join("\n")}\n`, "utf8");

    console.log(`universo: ${candidatos.length}`);
    console.log(`residuo ambiguo: ${lineas.length}`);
    console.log(`destino: ${path.relative(SEO_TOOLS_ROOT, destino)}`);
    const porMotivo: Record<string, number> = {};
    for (const c of clasificadas) {
      if (!c.ambiguo) continue;
      const motivo = c.motivoAmbiguo ?? "desconocido";
      porMotivo[motivo] = (porMotivo[motivo] ?? 0) + 1;
    }
    for (const motivo of Object.keys(porMotivo).sort()) {
      console.log(`  ${motivo}: ${porMotivo[motivo]}`);
    }
    return 0;
  }

  // --- Modo ensayo: reporta y no toca el disco. ---
  if (flagBool(flags, "dry-run")) {
    console.log("Modo ensayo: no se escribe nada.");
    console.log("");
    reportar(candidatos.length, distribucion, Object.keys(anulaciones).length);
    return 0;
  }

  // --- Modo consolidacion. ---
  const destino = resolverRuta(flagString(flags, "out") ?? RUTA_DATASET);
  const vistas = new Set<string>();
  const lineas: string[] = [];

  for (let i = 0; i < candidatos.length; i += 1) {
    const candidato = candidatos[i] as Candidato;
    const registro = consolidar(candidato, clasificadas[i] as Clasificacion);
    const clave = registro["keywordKey"] as string;
    if (vistas.has(clave)) {
      throw new CliError(
        `El universo candidato trae la clave repetida "${clave}".\n` +
          `  Accion: el plan 03 deduplica por clave normalizada; revisar kw:expand antes de consolidar.`,
      );
    }
    vistas.add(clave);

    // Guarda del contrato con el plan 05 y con el Sheet: las tres metricas diferidas llevan
    // su valor literal para el CIEN POR CIENTO del universo. Si una corrida futura las
    // pisara, el archivo no se escribe.
    for (const campo of METRICAS_DIFERIDAS) {
      if (registro[campo] !== NO_CONSULTADO) {
        throw new CliError(`La metrica diferida ${campo} perdio su valor literal en "${clave}".`);
      }
    }
    lineas.push(JSON.stringify(registro));
  }

  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, `${lineas.join("\n")}\n`, "utf8");

  reportar(candidatos.length, distribucion, Object.keys(anulaciones).length);
  console.log("");
  console.log(`dataset: ${path.relative(SEO_TOOLS_ROOT, destino)} (${lineas.length} lineas)`);
  return 0;
}
