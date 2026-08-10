/**
 * Seam de cache direccionable por contenido.
 *
 * Este es el UNICO modulo del proyecto autorizado a leer y escribir archivos de cache, y el
 * unico lugar donde se calcula la clave. Ninguna funcion de fuentes puede llamar a la red sin
 * pasar por aca.
 *
 * Que se persiste y que no (tabla del Pattern 2). Es lo que separa una cache util de una
 * envenenada:
 *
 *   200 con datos      -> ok     escribe   cuenta como acierto
 *   200 sin filas      -> empty  escribe   cuenta como acierto  (no se repregunta nunca mas)
 *   400 / 404 / 422    -> error  escribe   cuenta como acierto  (y relanza el error desde disco)
 *   401 / 403          -> nada   NO        regenerar la clave arregla el problema sin borrar nada
 *   429 / 5xx / red    -> nada   NO        es transitorio, se reintenta en la corrida siguiente
 */

import * as nodeCrypto from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { CliError } from "./config.js";
import { normalizeKeyword } from "./keywords/normalize.js";
import type { QuotaBook } from "./quota.js";

export type Outcome = "ok" | "empty" | "error";

export interface CacheEnvelope {
  schema: 1;
  source: string;
  endpoint: string;
  request: Record<string, unknown>;
  fetchedAt: string;
  outcome: Outcome;
  httpStatus: number | null;
  response: unknown;
  error: string | null;
}

/** Lo que devuelve la capa de red. Un fallo de transporte se lanza, no se devuelve. */
export interface NetworkResult {
  httpStatus: number;
  body: unknown;
}

export type NetworkCall = () => Promise<NetworkResult>;

/** Aciertos y fallos de la ejecucion en curso. Mueren con el proceso, a diferencia de la cuota. */
export interface RunCounters {
  hits: number;
  misses: number;
}

/** Error de la fuente que quedo congelado en disco a proposito y se relanza desde ahi. */
export class CachedRequestError extends CliError {
  readonly envelope: CacheEnvelope;

  constructor(envelope: CacheEnvelope) {
    super(
      `La fuente ${envelope.source} rechazo la consulta (HTTP ${envelope.httpStatus ?? "?"}).\n` +
        `  Endpoint: ${envelope.endpoint}\n` +
        `  Parametros: ${JSON.stringify(envelope.request)}\n` +
        `  Detalle: ${envelope.error ?? "sin detalle"}\n` +
        `  Es un error que no cambia al reintentar, asi que quedo cacheado. ` +
        `Para volver a preguntar: --refresh`,
    );
    this.name = "CachedRequestError";
    this.envelope = envelope;
  }
}

/**
 * Claves de parametro que nunca entran ni a la clave ni al envelope: son credenciales.
 * Que no afecten la clave es ademas correcto, porque la misma consulta con otra clave de API
 * sigue siendo la misma consulta.
 */
const SECRET_PARAMS = new Set([
  "headers",
  "api_key",
  "apikey",
  "apiKey",
  "token",
  "authorization",
  "Authorization",
]);

function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (SECRET_PARAMS.has(k)) continue;
    out[k] = v;
  }
  return out;
}

/** Normaliza los parametros que definen identidad antes de hashear. */
function canonicalizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (k === "keyword" && typeof v === "string") {
      out[k] = normalizeKeyword(v);
    } else if ((k === "country" || k === "language") && typeof v === "string") {
      out[k] = v.toLowerCase();
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** JSON con claves ordenadas: sin esto la misma consulta genera dos archivos y el gasto se duplica. */
function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stable(obj[k])}`)
    .join(",")}}`;
}

/** Unico calculo de clave del proyecto. Quien rellena la cache desde afuera la pregunta, no la inventa. */
export function cacheKey(source: string, endpoint: string, params: Record<string, unknown>): string {
  const canonical = canonicalizeParams(sanitizeParams(params));
  return nodeCrypto.createHash("sha256").update(`${source}\n${endpoint}\n${stable(canonical)}`).digest("hex");
}

export function cachePath(cacheDir: string, source: string, key: string): string {
  return path.join(cacheDir, source, `${key}.json`);
}

export async function readEnvelope(
  cacheDir: string,
  source: string,
  key: string,
): Promise<CacheEnvelope | null> {
  try {
    const raw = await readFile(cachePath(cacheDir, source, key), "utf8");
    return JSON.parse(raw) as CacheEnvelope;
  } catch {
    return null;
  }
}

export async function writeEnvelope(
  cacheDir: string,
  key: string,
  envelope: CacheEnvelope,
): Promise<void> {
  const target = cachePath(cacheDir, envelope.source, key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
}

function defaultIsEmpty(body: unknown): boolean {
  if (body === null || body === undefined) return true;
  if (Array.isArray(body)) return body.length === 0;
  if (typeof body === "object") {
    const arrays = Object.values(body as Record<string, unknown>).filter(Array.isArray) as unknown[][];
    if (arrays.length > 0) return arrays.every((a) => a.length === 0);
    return Object.keys(body as object).length === 0;
  }
  return false;
}

/** Estos si se congelan: un request mal formado no cambia porque se reintente. */
const PERSISTED_ERROR_STATUSES = new Set([400, 404, 422]);

export interface SeamOptions {
  cacheDir: string;
  source: string;
  endpoint: string;
  params: Record<string, unknown>;
  /** Prohibe salir a la red: un fallo de cache pasa a ser error duro. */
  offline?: boolean | undefined;
  /** Ignora el acierto y vuelve a consultar. No hay expiracion automatica: la invalidacion es explicita. */
  refresh?: boolean | undefined;
  isEmpty?: ((body: unknown) => boolean) | undefined;
  quota?: QuotaBook | undefined;
  maxPerRun?: number | undefined;
  pending?: number | undefined;
  label?: string | undefined;
  stats?: RunCounters | undefined;
}

/**
 * Resuelve una consulta contra la cache y, solo si hace falta y esta permitido, contra la red.
 */
export async function fetchThroughCache(
  opts: SeamOptions,
  call: NetworkCall,
): Promise<CacheEnvelope> {
  const { cacheDir, source, endpoint, stats } = opts;
  const request = sanitizeParams(opts.params);
  const key = cacheKey(source, endpoint, opts.params);
  const isEmpty = opts.isEmpty ?? defaultIsEmpty;
  const label = opts.label ?? JSON.stringify(request);

  if (opts.refresh !== true) {
    const cached = await readEnvelope(cacheDir, source, key);
    if (cached !== null) {
      if (stats !== undefined) stats.hits += 1;
      if (cached.outcome === "error") throw new CachedRequestError(cached);
      return cached;
    }
  }

  if (stats !== undefined) stats.misses += 1;

  if (opts.offline === true) {
    throw new CliError(
      `Modo offline y la consulta no esta en cache.\n` +
        `  Fuente: ${source}\n` +
        `  Endpoint: ${endpoint}\n` +
        `  Clave: ${key}\n` +
        `  Parametros: ${JSON.stringify(request)}\n` +
        `  Archivo esperado: ${cachePath(cacheDir, source, key)}\n` +
        `  Accion: correr sin --offline para consultar la fuente, o rellenar la cache con: ` +
        `npm run cli -- cache:put --source ${source} --key ${key} --file <archivo.json>`,
    );
  }

  opts.quota?.ensureCapacity({
    source,
    maxPerRun: opts.maxPerRun,
    pending: opts.pending,
    label,
  });

  let result: NetworkResult;
  try {
    result = await call();
  } catch (error) {
    // Fallo de transporte: no hubo respuesta, no se persiste y no se cuenta cuota.
    throw new CliError(
      `Fallo de red consultando ${source} ${endpoint}.\n` +
        `  Parametros: ${JSON.stringify(request)}\n` +
        `  Detalle: ${error instanceof Error ? error.message : String(error)}\n` +
        `  No se escribio nada en cache: es transitorio y se reintenta en la corrida siguiente.`,
    );
  }

  // Hubo respuesta HTTP, asi que la fuente atendio la peticion: eso es lo que consume cuota.
  // Se persiste antes de devolver para que una interrupcion no subestime el presupuesto.
  await opts.quota?.record(source, label);

  const { httpStatus, body } = result;
  const now = new Date().toISOString();

  if (httpStatus >= 200 && httpStatus < 300) {
    const envelope: CacheEnvelope = {
      schema: 1,
      source,
      endpoint,
      request,
      fetchedAt: now,
      outcome: isEmpty(body) ? "empty" : "ok",
      httpStatus,
      response: body,
      error: null,
    };
    await writeEnvelope(cacheDir, key, envelope);
    return envelope;
  }

  if (httpStatus === 401 || httpStatus === 403) {
    throw new CliError(
      `${source} rechazo la credencial (HTTP ${httpStatus}).\n` +
        `  Endpoint: ${endpoint}\n` +
        `  NO se escribio nada en cache, a proposito: regenerar la clave arregla el problema ` +
        `sin tener que borrar nada.\n` +
        `  Accion: regenerar la clave desde el panel de ${source} y reemplazarla en .secrets/.env`,
    );
  }

  if (PERSISTED_ERROR_STATUSES.has(httpStatus)) {
    const envelope: CacheEnvelope = {
      schema: 1,
      source,
      endpoint,
      request,
      fetchedAt: now,
      outcome: "error",
      httpStatus,
      response: body,
      error: `La fuente respondio HTTP ${httpStatus}`,
    };
    await writeEnvelope(cacheDir, key, envelope);
    throw new CachedRequestError(envelope);
  }

  throw new CliError(
    `${source} respondio HTTP ${httpStatus} en ${endpoint}.\n` +
      `  Parametros: ${JSON.stringify(request)}\n` +
      `  No se escribio nada en cache: es transitorio y se reintenta en la corrida siguiente.`,
  );
}

// --- Estadisticas, para cache:stats ---

export interface SourceStats {
  entries: number;
  byOutcome: Record<Outcome, number>;
  bytes: number;
  oldest: string | null;
  newest: string | null;
}

export async function collectCacheStats(cacheDir: string): Promise<Record<string, SourceStats>> {
  const out: Record<string, SourceStats> = {};

  let sources: string[];
  try {
    const entries = await readdir(cacheDir, { withFileTypes: true });
    sources = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return out;
  }

  for (const source of sources) {
    const dir = path.join(cacheDir, source);
    const stats: SourceStats = {
      entries: 0,
      byOutcome: { ok: 0, empty: 0, error: 0 },
      bytes: 0,
      oldest: null,
      newest: null,
    };

    let files: string[] = [];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    } catch {
      files = [];
    }

    for (const file of files) {
      const full = path.join(dir, file);
      try {
        const info = await stat(full);
        const envelope = JSON.parse(await readFile(full, "utf8")) as CacheEnvelope;

        stats.entries += 1;
        stats.bytes += info.size;
        if (envelope.outcome in stats.byOutcome) stats.byOutcome[envelope.outcome] += 1;

        const when = envelope.fetchedAt;
        if (typeof when === "string") {
          if (stats.oldest === null || when < stats.oldest) stats.oldest = when;
          if (stats.newest === null || when > stats.newest) stats.newest = when;
        }
      } catch {
        // Archivo corrupto: se ignora en el reporte en vez de tumbar el comando.
      }
    }

    out[source] = stats;
  }

  return out;
}
