/**
 * cache:put — rellena la cache desde afuera.
 *
 * Es el seam del Pattern 3: cuando una clave de API no esta disponible pero si hay una
 * herramienta MCP en el contexto de un agente, el agente obtiene el cuerpo crudo y lo deja
 * aca. Toda la cadena aguas abajo queda verificable sin clave. Es tambien lo que permite
 * avanzar con DinoRank mientras su clave siga rechazada.
 *
 * Propiedad critica del diseno: la clave la calcula el CLI, no el que rellena. Quien rellena
 * la obtiene de la bandera --plan-only de los comandos de los planes siguientes. Si el agente
 * inventara la ruta, la cache se desincroniza y nadie se entera hasta el reprocesamiento.
 */

import { readFile } from "node:fs/promises";

import { flagString, type Flags } from "../cli.js";
import { writeEnvelope, type CacheEnvelope, type Outcome } from "../cache.js";
import { CACHE_DIR, CliError, resolveFromRepoRoot } from "../config.js";

function deduceOutcome(body: unknown): Outcome {
  if (body === null || body === undefined) return "empty";
  if (Array.isArray(body)) return body.length === 0 ? "empty" : "ok";
  if (typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record["error"] === "string" && record["error"] !== "") return "error";
    const arrays = Object.values(record).filter(Array.isArray) as unknown[][];
    if (arrays.length > 0) return arrays.every((a) => a.length === 0) ? "empty" : "ok";
    return Object.keys(record).length === 0 ? "empty" : "ok";
  }
  return "ok";
}

export async function run(flags: Flags): Promise<number> {
  const source = flagString(flags, "source");
  const key = flagString(flags, "key");
  const file = flagString(flags, "file");
  const endpoint = flagString(flags, "endpoint") ?? "(rellenado desde afuera)";

  if (source === undefined || key === undefined || file === undefined) {
    throw new CliError(
      "cache:put necesita --source, --key y --file.\n" +
        "  Ejemplo: npm run cli -- cache:put --source dinorank --key 9f3a... --file payload.json\n" +
        "  La clave NO se inventa: se obtiene de la salida de --plan-only del comando que la necesita.",
    );
  }

  if (!/^[0-9a-f]{64}$/.test(key)) {
    throw new CliError(
      `La clave "${key}" no tiene la forma de una clave de cache de este proyecto.\n` +
        "  Se espera el hash de 64 caracteres hexadecimales que emite --plan-only.\n" +
        "  Inventar la ruta desincroniza la cache y el problema no se ve hasta el reprocesamiento.",
    );
  }

  const fullPath = resolveFromRepoRoot(file);
  let raw: string;
  try {
    raw = await readFile(fullPath, "utf8");
  } catch {
    throw new CliError(`No se pudo leer el archivo ${fullPath}.`);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch (error) {
    throw new CliError(
      `El archivo ${fullPath} no es JSON valido.\n` +
        `  Detalle: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const outcome = deduceOutcome(body);

  const envelope: CacheEnvelope = {
    schema: 1,
    source,
    endpoint,
    request: { rellenadoDesdeAfuera: true },
    fetchedAt: new Date().toISOString(),
    outcome,
    httpStatus: outcome === "error" ? 400 : 200,
    response: body,
    error: outcome === "error" ? "Rellenado desde afuera con un cuerpo de error" : null,
  };

  await writeEnvelope(CACHE_DIR, key, envelope);

  console.log(`Escrito ${source}/${key}.json con resultado "${outcome}".`);
  console.log("La cache no gasta cuota: la proxima corrida resuelve esta consulta desde disco.");

  return 0;
}
