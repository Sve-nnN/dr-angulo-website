/**
 * Lectura y validacion del entorno.
 *
 * Regla de seguridad que atraviesa todo el modulo: ningun mensaje de error, log o archivo
 * puede contener el valor de una credencial. Como maximo su longitud y su prefijo de cuatro
 * caracteres, que es lo minimo para distinguir "la clave no esta" de "la clave esta pero la
 * rechazan". El contenido de la service account no se imprime nunca, ni siquiera enmascarado.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Raiz del paquete de tooling: seo-tools/ */
export const SEO_TOOLS_ROOT = path.resolve(THIS_DIR, "..");

/**
 * Raiz del repositorio, es decir el directorio padre de seo-tools/.
 *
 * Se resuelve contra la ubicacion de este archivo y NO contra el directorio de trabajo:
 * el CLI corre desde dentro de seo-tools/ pero los valores guardados en .secrets/.env son
 * relativos a la raiz del repositorio. Resolver contra process.cwd() rompe en cuanto alguien
 * invoca el CLI desde otro directorio.
 */
export const REPO_ROOT = path.resolve(THIS_DIR, "..", "..");

/** Cache cruda de respuestas de API. Gitignoreada por seo-tools/.gitignore. */
export const CACHE_DIR = path.join(SEO_TOOLS_ROOT, ".cache");

/** Arbol de planificacion del workstream seo-keywords. Los artefactos de aca si se commitean. */
export const PLANNING_DATA_DIR = path.join(
  REPO_ROOT,
  ".planning",
  "workstreams",
  "seo-keywords",
  "data",
);

/**
 * Error con mensaje accionable en espanol neutro. El CLI lo imprime tal cual y sale con
 * codigo distinto de cero, sin traza de pila: una traza cruda no le dice a nadie que hacer.
 */
export class CliError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

/**
 * Describe una credencial sin revelarla: longitud y prefijo de cuatro caracteres.
 * Es lo unico que cualquier mensaje de este proyecto tiene permitido decir de una clave.
 */
export function describeSecret(value: string | undefined): string {
  if (value === undefined || value === "") return "ausente";
  const prefix = value.slice(0, 4);
  return `${value.length} caracteres, empieza por "${prefix}"`;
}

/** Resuelve una ruta relativa contra la raiz del repositorio; deja intactas las absolutas. */
export function resolveFromRepoRoot(candidate: string): string {
  return path.isAbsolute(candidate) ? candidate : path.resolve(REPO_ROOT, candidate);
}

function requireEnv(name: string, remedy: string): string {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") {
    throw new CliError(
      `Falta la variable de entorno ${name}.\n` +
        `  El CLI carga el entorno desde ${path.join(REPO_ROOT, ".secrets", ".env")}.\n` +
        `  Accion: ${remedy}`,
    );
  }
  return raw.trim();
}

export interface SheetsConfig {
  /** Identificador del documento del cliente. */
  spreadsheetId: string;
  /** Ruta absoluta al JSON de la service account, ya resuelta contra la raiz del repositorio. */
  serviceAccountFile: string;
}

/**
 * Configuracion necesaria para hablar con Google Sheets. Falla temprano y con instrucciones
 * concretas: es la unica forma de distinguir un problema de setup de un problema de permisos.
 */
export function loadSheetsConfig(): SheetsConfig {
  const spreadsheetId = requireEnv(
    "SEO_SHEET_ID",
    "agregar SEO_SHEET_ID con el identificador del documento del cliente.",
  );

  const declared = requireEnv(
    "GOOGLE_SERVICE_ACCOUNT_FILE",
    "agregar GOOGLE_SERVICE_ACCOUNT_FILE apuntando al JSON de la service account, " +
      "con ruta relativa a la raiz del repositorio.",
  );

  const serviceAccountFile = resolveFromRepoRoot(declared);

  if (!existsSync(serviceAccountFile)) {
    throw new CliError(
      `GOOGLE_SERVICE_ACCOUNT_FILE apunta a un archivo que no existe.\n` +
        `  Valor declarado: ${declared}\n` +
        `  Resuelto contra la raiz del repositorio: ${serviceAccountFile}\n` +
        `  Accion: verificar que el JSON de la service account este en esa ruta. ` +
        `El directorio .secrets/ esta gitignoreado, asi que no viaja con el repositorio ` +
        `y hay que colocarlo a mano en cada maquina.`,
    );
  }

  return { spreadsheetId, serviceAccountFile };
}
