/**
 * Parseo de banderas de los puntos de entrada de la fase 13.
 *
 * POR QUE ESTO ES UNA COPIA FUNCIONAL Y NO UNA IMPORTACION.
 *
 * `src/cli.ts` exporta un parser equivalente, y reusarlo seria lo obvio. No se puede: ese
 * modulo llama a `main()` en el cuerpo del archivo, asi que el solo hecho de importarlo
 * ejecuta el despachador de subcomandos con los argumentos del proceso en curso. Desde un
 * punto de entrada de la fase 13 eso significa que `--keyword "hernia discal"` llegaria a
 * `dispatch()` como subcomando desconocido, imprimiria la ayuda y devolveria codigo 2 antes
 * de que este archivo hiciera nada.
 *
 * Ademas la tabla de subcomandos de `cli.ts` quedo CERRADA al terminar la fase 12 y ningun
 * plan posterior la edita. Los ejecutables de esta fase son puntos de entrada propios:
 *
 *     cd seo-tools && ./node_modules/.bin/tsx src/phase13/<modulo>.ts <banderas>
 *
 * Treinta lineas duplicadas cuestan menos que cualquiera de las dos alternativas.
 */

import { CliError } from "../config.js";

export interface Banderas {
  /** Pares --bandera / --bandera=valor. Las booleanas llegan como true. */
  readonly values: Readonly<Record<string, string | boolean>>;
  /** Argumentos sueltos, sin bandera. */
  readonly positionals: readonly string[];
}

/**
 * Banderas que nunca consumen el token siguiente como valor.
 *
 * No es una lista de banderas permitidas: el parser acepta cualquiera. Solo evita que
 * `--offline src/x.ts` se coma el positional.
 */
const BOOLEANAS = new Set([
  "offline",
  "refresh",
  "dry-run",
  "with-types",
  "yes",
  "help",
  "json",
  "pretty",
  "todos",
  "indice",
  "handoff",
]);

/** Recolecta `--bandera valor`, `--bandera=valor` y `--bandera` sola, mas los sueltos. */
export function parseBanderas(argv: readonly string[]): Banderas {
  const values: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i] as string;

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const body = token.slice(2);
    const eq = body.indexOf("=");

    if (eq !== -1) {
      values[body.slice(0, eq)] = body.slice(eq + 1);
      continue;
    }

    const next = argv[i + 1];
    const tomaValor = !BOOLEANAS.has(body) && next !== undefined && !next.startsWith("-");

    if (tomaValor) {
      values[body] = next as string;
      i += 1;
    } else {
      values[body] = true;
    }
  }

  return { values, positionals };
}

/** Lee una bandera como texto. undefined si no vino o si vino como booleana. */
export function texto(banderas: Banderas, nombre: string): string | undefined {
  const raw = banderas.values[nombre];
  return typeof raw === "string" ? raw : undefined;
}

/** Lee una bandera como booleana. Cualquier presencia distinta de "false" o "0" cuenta como true. */
export function booleana(banderas: Banderas, nombre: string): boolean {
  const raw = banderas.values[nombre];
  if (raw === undefined) return false;
  if (typeof raw === "boolean") return raw;
  return raw !== "false" && raw !== "0";
}

/** Lee una bandera como numero, fallando con mensaje accionable si no lo es. */
export function numero(banderas: Banderas, nombre: string): number | undefined {
  const raw = texto(banderas, nombre);
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new CliError(`La bandera --${nombre} espera un numero y recibio "${raw}".`);
  }
  return parsed;
}

/** Lee una bandera obligatoria de texto, nombrando la bandera que falta. */
export function textoObligatorio(banderas: Banderas, nombre: string): string {
  const valor = texto(banderas, nombre);
  if (valor === undefined || valor.trim() === "") {
    throw new CliError(`Falta la bandera --${nombre}, que es obligatoria.`);
  }
  return valor;
}

/**
 * Envoltorio comun de los puntos de entrada de la fase.
 *
 * Imprime el mensaje accionable de un CliError sin traza de pila y fija el codigo de salida.
 * Una traza cruda no le dice a nadie que hacer.
 */
export function ejecutar(main: () => Promise<number>): void {
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
}
