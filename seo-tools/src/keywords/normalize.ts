/**
 * Normalizacion de keywords.
 *
 * ATENCION, distincion central del proyecto: la clave y el texto visible son DOS VALORES
 * DISTINTOS y este modulo solo produce el primero.
 *
 *   keyword     el texto original, tal como se busca y tal como se escribe en el Sheet
 *   keywordKey  el resultado de esta funcion, que solo se usa para deduplicar y para el upsert
 *
 * Nunca se sobrescribe el original con el normalizado. Esta funcion tambien convierte
 * "ninos" a partir de "ninos" con enie, y eso es intencional para la clave: los pacientes
 * escriben de las dos formas y ambas tienen que caer en la misma fila. Lo que no se quiere,
 * jamas, es escribir el valor sin enie en el documento del cliente.
 */

/** Clave de idempotencia. No usar su resultado como texto visible. */
export const normalizeKeyword = (raw: string): string =>
  raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
