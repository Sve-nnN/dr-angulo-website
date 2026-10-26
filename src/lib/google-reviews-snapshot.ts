import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

/**
 * Copia local de las reseñas de la ficha de Google, enviada por un trabajo
 * externo (ver `scripts/sync-google-reviews.mjs` y `docs/google-reviews-sync.md`).
 *
 * Por qué existe: la API de Places solo devuelve cinco reseñas y pide una clave
 * con facturación. La API de Business Profile devuelve todas, pero su token
 * permite editar y responder en la ficha, así que no puede vivir en este sitio.
 * El token se queda en el servidor que corre el trabajo y acá solo llega el
 * resultado: calificación, total y texto público de cada reseña.
 *
 * El archivo vive en un volumen persistente. Sin volumen el sitio sigue
 * funcionando: el siguiente envío lo vuelve a crear.
 */

/** Ruta del archivo. En producción apunta al volumen montado en `/data`. */
export const REVIEWS_SNAPSHOT_FILE =
  process.env.REVIEWS_SNAPSHOT_FILE || "/data/google-reviews.json";

/** Pasado este tiempo sin envíos, la copia se descarta y se usa el respaldo. */
export const SNAPSHOT_MAX_AGE_MS = 45 * 24 * 60 * 60 * 1000;

/** Techo de reseñas por envío: protege al archivo de un cuerpo desmedido. */
const MAX_REVIEWS = 100;

export const snapshotReviewSchema = z.object({
  id: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(4000),
  publishedAt: z.iso.datetime().optional(),
});

export const reviewsSnapshotSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewCount: z.number().int().min(1).max(1_000_000),
  reviews: z.array(snapshotReviewSchema).max(MAX_REVIEWS),
});

export type ReviewsSnapshotInput = z.infer<typeof reviewsSnapshotSchema>;

export type ReviewsSnapshot = ReviewsSnapshotInput & {
  /** Momento en que el sitio recibió la copia, no el de la reseña más nueva. */
  syncedAt: string;
};

const storedSchema = reviewsSnapshotSchema.extend({
  syncedAt: z.iso.datetime(),
});

/** Lee la copia. Devuelve null si no existe, está corrupta o venció. */
export async function readReviewsSnapshot(): Promise<ReviewsSnapshot | null> {
  try {
    const raw = await readFile(REVIEWS_SNAPSHOT_FILE, "utf8");
    const parsed = storedSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    const age = Date.now() - Date.parse(parsed.data.syncedAt);
    if (!Number.isFinite(age) || age > SNAPSHOT_MAX_AGE_MS) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Guarda la copia. Escribe a un archivo temporal y lo renombra, así un corte a
 * mitad de escritura nunca deja un JSON truncado que rompa la lectura.
 */
export async function writeReviewsSnapshot(
  input: ReviewsSnapshotInput
): Promise<ReviewsSnapshot> {
  const snapshot: ReviewsSnapshot = {
    ...input,
    syncedAt: new Date().toISOString(),
  };

  await mkdir(path.dirname(REVIEWS_SNAPSHOT_FILE), { recursive: true });
  const tmp = `${REVIEWS_SNAPSHOT_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(snapshot), { encoding: "utf8", mode: 0o600 });
  await rename(tmp, REVIEWS_SNAPSHOT_FILE);

  return snapshot;
}
