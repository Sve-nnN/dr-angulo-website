/**
 * Llamada de red con tiempo limite, reintento con retroceso exponencial y limite de
 * concurrencia.
 *
 * Este modulo NO decide que se persiste: esa decision vive entera en cache.ts. Aca solo se
 * resuelve como hablar con una fuente sin tumbarla y sin quedarse colgado.
 *
 * Nunca se reintenta un 401 ni un 403: son errores de credencial y reintentarlos solo demora
 * el mensaje que le dice a Juan que regenere la clave.
 */

import pLimit from "p-limit";

import type { NetworkResult } from "./cache.js";

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 500;

/** Transitorios: vale la pena reintentar. */
const RETRIABLE = new Set([429, 500, 502, 503, 504]);

export interface RequestOptions {
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
  init?: RequestInit;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/**
 * Ejecuta una peticion y devuelve el codigo y el cuerpo ya parseado, en la forma que espera
 * el seam de cache. Un cuerpo que no sea JSON valido se devuelve como texto crudo: decidir
 * si eso es un error es del que llama, no de aca.
 */
export async function requestJson(url: string, options: RequestOptions = {}): Promise<NetworkResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const backoffMs = options.backoffMs ?? DEFAULT_BACKOFF_MS;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options.init,
        signal: AbortSignal.timeout(timeoutMs),
      });

      const text = await response.text();
      let body: unknown = text;
      try {
        body = text === "" ? null : JSON.parse(text);
      } catch {
        body = text;
      }

      if (RETRIABLE.has(response.status) && attempt < retries) {
        await sleep(backoffMs * 2 ** attempt);
        continue;
      }

      return { httpStatus: response.status, body };
    } catch (error) {
      // Timeout o fallo de transporte. Se reintenta con retroceso; si se agotan, se propaga
      // y cache.ts lo trata como no persistible.
      lastError = error;
      if (attempt < retries) {
        await sleep(backoffMs * 2 ** attempt);
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Limitador de concurrencia. DinoRank responde una keyword por llamada y para Peru resuelve
 * por otro backend, asi que lanzar cientos en paralelo termina en 429 o en conexion cortada.
 */
export function createLimiter(concurrency = 3): <T>(fn: () => Promise<T>) => Promise<T> {
  const limit = pLimit(concurrency);
  return <T>(fn: () => Promise<T>): Promise<T> => limit(fn);
}
