import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { refreshAccessToken, REELS_CACHE_TAG } from "@/lib/instagram";

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
 * Renueva el token de larga duración de Instagram (60 días más) y limpia la
 * caché del feed. Pensado para llamarse desde un cron semanal:
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://<dominio>/api/instagram/refresh
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  try {
    const token = await refreshAccessToken();
    revalidateTag(REELS_CACHE_TAG, "max");
    return Response.json({
      ok: true,
      refreshedAt: token.refreshedAt,
      expiresAt: token.expiresAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("[instagram] fallo al renovar el token:", message);
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}

export async function GET(request: Request) {
  return POST(request);
}
