import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  reviewsSnapshotSchema,
  writeReviewsSnapshot,
} from "@/lib/google-reviews-snapshot";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" } as const;

/** 100 reseñas de 4.000 caracteres caben de sobra; más que esto no es legítimo. */
const MAX_BODY_BYTES = 600_000;

function isAuthorized(request: Request) {
  const secret = process.env.REVIEWS_SYNC_SECRET;
  // Sin secreto configurado el endpoint queda cerrado, no abierto.
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Recibe la copia de reseñas que arma el trabajo diario del servidor de Juan.
 *
 *   curl -X POST -H "Authorization: Bearer $REVIEWS_SYNC_SECRET" \
 *     -H "Content-Type: application/json" -d @reviews.json \
 *     https://<dominio>/api/reviews/sync
 *
 * El secreto es propio de este endpoint y no da ningún permiso en Google: lo
 * único que permite es reemplazar el archivo de reseñas que el sitio muestra.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json(
      { ok: false, error: "No autorizado" },
      { status: 401, headers: NO_STORE }
    );
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return Response.json(
      { ok: false, error: "Cuerpo demasiado grande" },
      { status: 413, headers: NO_STORE }
    );
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return Response.json(
      { ok: false, error: "Cuerpo demasiado grande" },
      { status: 413, headers: NO_STORE }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json(
      { ok: false, error: "JSON inválido" },
      { status: 400, headers: NO_STORE }
    );
  }

  const parsed = reviewsSnapshotSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Formato inválido", issues: parsed.error.issues.length },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const snapshot = await writeReviewsSnapshot(parsed.data);

    // Las dos páginas que muestran la sección se regeneran en la próxima visita.
    revalidatePath("/");
    revalidatePath("/testimonios");

    return Response.json(
      {
        ok: true,
        syncedAt: snapshot.syncedAt,
        rating: snapshot.rating,
        reviewCount: snapshot.reviewCount,
        reviews: snapshot.reviews.length,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error("[reviews-sync] no se pudo guardar la copia:", error);
    return Response.json(
      { ok: false, error: "No se pudo guardar" },
      { status: 500, headers: NO_STORE }
    );
  }
}
