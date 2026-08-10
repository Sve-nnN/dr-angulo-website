#!/usr/bin/env tsx
/**
 * Punto de entrada unico del tooling de datos del milestone v1.2.
 *
 * Contrato con los planes 02 a 05: la tabla de subcomandos de abajo esta COMPLETA desde el
 * wave 1 y el despacho resuelve el modulo por convencion de nombre. Un plan posterior
 * implementa su subcomando creando o rellenando su archivo en src/commands/ y NO vuelve a
 * tocar este archivo. Eso es lo que permite que los planes 02 y 03 corran en paralelo sin
 * pelearse el mismo archivo.
 */

import { CliError } from "./config.js";

/** Banderas ya parseadas que recibe todo subcomando. */
export interface Flags {
  /** Pares --bandera / --bandera=valor. Las booleanas llegan como true. */
  readonly values: Readonly<Record<string, string | boolean>>;
  /** Argumentos sueltos, sin bandera. */
  readonly positionals: readonly string[];
}

/** Firma definitiva de todo subcomando: recibe las banderas y devuelve el codigo de salida. */
export type CommandRunner = (flags: Flags) => Promise<number>;

export interface CommandModule {
  run: CommandRunner;
}

interface CommandSpec {
  /** Nombre invocable, por ejemplo sheet:inspect */
  readonly name: string;
  /** Archivo dentro de src/commands/, sin extension. */
  readonly module: string;
  /** Plan que lo implementa, para el mensaje de los que todavia son stubs. */
  readonly plan: string;
  readonly summary: string;
}

/**
 * Tabla completa de subcomandos de la fase 12. Los que todavia no tienen modulo salen con
 * codigo distinto de cero nombrando el plan que los implementa.
 */
const COMMANDS: readonly CommandSpec[] = [
  {
    name: "sheet:inspect",
    module: "sheet-inspect",
    plan: "12-01",
    summary: "Vuelca tabs, fila de encabezados y orientacion del Sheet del cliente.",
  },
  {
    name: "sheet:push",
    module: "sheet-push",
    plan: "12-02",
    summary: "Upsert idempotente del dataset en un tab del Sheet.",
  },
  {
    name: "kw:seeds",
    module: "kw-seeds",
    plan: "12-03",
    summary: "Extrae las semillas desde el contenido del sitio y las congela en un snapshot.",
  },
  {
    name: "kw:expand",
    module: "kw-expand",
    plan: "12-03",
    summary: "Expande el universo de keywords cruzando semillas, modificadores y geo.",
  },
  {
    name: "kw:classify",
    module: "kw-classify",
    plan: "12-04",
    summary: "Clasifica intencion y etapa con motor de reglas determinista.",
  },
  {
    name: "kw:enrich",
    module: "kw-enrich",
    plan: "12-05",
    summary: "Enriquece el universo con metricas de las fuentes externas.",
  },
  {
    name: "dino:probe",
    module: "dino-probe",
    plan: "12-05",
    summary: "Sondea DinoRank y graba la primera respuesta real como fixture.",
  },
  {
    name: "cache:stats",
    module: "cache-stats",
    plan: "12-01",
    summary: "Reporta el estado de la cache y la cuota consumida por fuente.",
  },
  {
    name: "cache:put",
    module: "cache-put",
    plan: "12-01",
    summary: "Rellena la cache desde afuera con un cuerpo de respuesta ya obtenido.",
  },
] as const;

/**
 * Banderas booleanas conocidas: nunca consumen el token siguiente como valor.
 *
 * Esto NO es una lista de banderas permitidas. El parser acepta cualquier bandera y la pasa
 * al subcomando; esta lista solo evita que `--dry-run archivo.json` se coma el positional.
 */
const BOOLEAN_FLAGS = new Set([
  "refresh",
  "offline",
  "plan-only",
  "dry-run",
  "yes",
  "residue-only",
  "prune",
  "add-missing-columns",
  "help",
]);

/**
 * Parseo de banderas sin dependencias y SIN lista cerrada de permitidas.
 *
 * Los planes 02 a 05 tienen prohibido editar este archivo e invocan banderas que hoy no
 * existen. Con una lista cerrada, cualquiera de esas invocaciones moriria como bandera
 * desconocida y ningun plan posterior estaria autorizado a arreglarlo. Por eso se recolecta
 * todo y se pasa a traves.
 */
export function parseArgs(argv: readonly string[]): {
  command: string | undefined;
  flags: Flags;
} {
  const values: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  let command: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i] as string;

    if (token.startsWith("--")) {
      const body = token.slice(2);
      const eq = body.indexOf("=");

      if (eq !== -1) {
        values[body.slice(0, eq)] = body.slice(eq + 1);
        continue;
      }

      const next = argv[i + 1];
      const takesValue =
        !BOOLEAN_FLAGS.has(body) && next !== undefined && !next.startsWith("-");

      if (takesValue) {
        values[body] = next as string;
        i += 1;
      } else {
        values[body] = true;
      }
      continue;
    }

    if (command === undefined) {
      command = token;
    } else {
      positionals.push(token);
    }
  }

  return { command, flags: { values, positionals } };
}

/** Lee una bandera como texto. Devuelve undefined si no vino o si vino como booleana. */
export function flagString(flags: Flags, name: string): string | undefined {
  const raw = flags.values[name];
  return typeof raw === "string" ? raw : undefined;
}

/** Lee una bandera como booleana. Cualquier presencia distinta de "false" cuenta como true. */
export function flagBool(flags: Flags, name: string): boolean {
  const raw = flags.values[name];
  if (raw === undefined) return false;
  if (typeof raw === "boolean") return raw;
  return raw !== "false" && raw !== "0";
}

/** Lee una bandera como numero, fallando con mensaje accionable si no lo es. */
export function flagNumber(flags: Flags, name: string): number | undefined {
  const raw = flagString(flags, name);
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new CliError(`La bandera --${name} espera un numero y recibio "${raw}".`);
  }
  return parsed;
}

function usage(): string {
  const width = Math.max(...COMMANDS.map((c) => c.name.length));
  const lines = COMMANDS.map((c) => `  ${c.name.padEnd(width)}  ${c.summary}`);

  return [
    "Tooling de datos del milestone v1.2 (seo-tools).",
    "",
    "Uso: npm run cli -- <subcomando> [banderas]",
    "",
    "Subcomandos:",
    ...lines,
    "",
    "Banderas globales:",
    "  --refresh        Ignora el acierto de cache y vuelve a consultar la fuente.",
    "  --offline        Prohibe salir a la red: un fallo de cache es error duro.",
    "  --plan-only      No ejecuta; emite las claves de cache que haria falta llenar.",
    "  --dry-run        Calcula y reporta los cambios sin escribir nada.",
    "  --yes            Confirma sin preguntar una operacion que modifica datos.",
    "  --max-searches   Tope de busquedas que pueden salir a la red en esta corrida.",
    "  --limit          Tope de items a procesar. Distinto de --max-searches: este acota",
    "                   el trabajo, aquel acota el gasto de cuota.",
    "",
  ].join("\n");
}

function isModuleNotFound(error: unknown, moduleName: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: unknown }).code;
  if (code !== "ERR_MODULE_NOT_FOUND" && code !== "MODULE_NOT_FOUND") return false;
  // Que el modulo faltante sea el subcomando y no una dependencia suya: si un stub importa
  // algo inexistente, eso es un bug y tiene que verse como bug, no como "no implementado".
  return String((error as { message?: unknown }).message ?? "").includes(moduleName);
}

async function dispatch(command: string, flags: Flags): Promise<number> {
  const spec = COMMANDS.find((c) => c.name === command);

  if (spec === undefined) {
    process.stderr.write(`Subcomando desconocido: ${command}\n\n`);
    process.stderr.write(usage());
    return 2;
  }

  let mod: CommandModule;
  try {
    mod = (await import(`./commands/${spec.module}.js`)) as CommandModule;
  } catch (error) {
    if (isModuleNotFound(error, spec.module)) {
      process.stderr.write(
        `El subcomando ${spec.name} todavia no esta implementado.\n` +
          `  Se implementa en el plan ${spec.plan} de la fase 12.\n`,
      );
      return 3;
    }
    throw error;
  }

  if (typeof mod.run !== "function") {
    throw new CliError(
      `El modulo src/commands/${spec.module}.ts no exporta una funcion run(flags).`,
    );
  }

  return mod.run(flags);
}

async function main(): Promise<number> {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (command === undefined || flagBool(flags, "help")) {
    const stream = command === undefined ? process.stderr : process.stdout;
    stream.write(usage());
    return command === undefined ? 2 : 0;
  }

  return dispatch(command, flags);
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    if (error instanceof CliError) {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = error.exitCode;
      return;
    }
    process.stderr.write(`Error inesperado: ${String(error)}\n`);
    process.exitCode = 1;
  });
