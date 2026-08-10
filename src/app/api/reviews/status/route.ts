import { timingSafeEqual } from "node:crypto";
import { getGoogleReviews, getReviewsBudgetStatus } from "@/lib/google-reviews";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Diagnóstico del feed de reseñas: si la clave está configurada, cuántas
 * llamadas lleva el día y qué devuelve Google ahora mismo. Sirve para verificar
 * el despliegue sin tener que mirar los logs.
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://<dominio>/api/reviews/status
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const data = await getGoogleReviews();

  return Response.json({
    ok: true,
    budget: getReviewsBudgetStatus(),
    result: data
      ? {
          rating: data.rating,
          reviewCount: data.reviewCount,
          reviewsWithText: data.reviews.length,
        }
      : null,
  });
}
