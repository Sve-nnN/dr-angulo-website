import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { InstagramReel } from "@/lib/instagram-shared";

export type { InstagramReel } from "@/lib/instagram-shared";
export { reelTitle } from "@/lib/instagram-shared";

/**
 * Feed de reels de Instagram (Instagram API with Instagram Login).
 *
 * El token de larga duración vive 60 días y se renueva solo: el endpoint
 * /api/instagram/refresh lo extiende y guarda el token nuevo en disco
 * (INSTAGRAM_TOKEN_FILE, un volumen persistente en Dokploy). Si ese archivo
 * todavía no existe, se usa el token semilla de INSTAGRAM_ACCESS_TOKEN.
 */

const IG_API = "https://graph.instagram.com/v25.0";
const IG_GRAPH = "https://graph.instagram.com";

export const REELS_CACHE_TAG = "instagram-reels";
const REVALIDATE_SECONDS = 3600;

type IgMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
};

type StoredToken = {
  accessToken: string;
  refreshedAt: string;
  expiresAt: string;
};

function tokenFilePath() {
  return process.env.INSTAGRAM_TOKEN_FILE || path.join(process.cwd(), ".data", "instagram-token.json");
}

async function readStoredToken(): Promise<StoredToken | null> {
  try {
    const raw = await readFile(tokenFilePath(), "utf8");
    const parsed = JSON.parse(raw) as StoredToken;
    return parsed.accessToken ? parsed : null;
  } catch {
    return null;
  }
}

async function writeStoredToken(token: StoredToken) {
  const file = tokenFilePath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(token, null, 2), "utf8");
}

/** Token vigente: primero el renovado en disco, si no el de las variables de entorno. */
export async function getAccessToken(): Promise<string | null> {
  const stored = await readStoredToken();
  return stored?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || null;
}

/**
 * Extiende el token 60 días más y lo persiste. Instagram exige que el token
 * tenga al menos 24 horas de vida y que no esté vencido.
 */
export async function refreshAccessToken(): Promise<StoredToken> {
  const current = await getAccessToken();
  if (!current) {
    throw new Error("No hay token de Instagram configurado");
  }

  const url = `${IG_GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${current}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message || `Instagram respondió ${res.status}`);
  }

  const now = Date.now();
  const token: StoredToken = {
    accessToken: data.access_token,
    refreshedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + (data.expires_in ?? 60 * 24 * 3600) * 1000).toISOString(),
  };
  await writeStoredToken(token);
  return token;
}

function isReel(media: IgMedia) {
  return media.media_product_type === "REELS" || media.media_type === "VIDEO";
}

/**
 * Últimos reels publicados. Devuelve [] ante cualquier fallo o falta de token
 * para que la página siga renderizando sin el carrusel.
 */
export async function getInstagramReels(limit = 12): Promise<InstagramReel[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_product_type",
    "permalink",
    "thumbnail_url",
    "media_url",
    "timestamp",
  ].join(",");

  try {
    const res = await fetch(
      `${IG_API}/me/media?fields=${fields}&limit=50&access_token=${token}`,
      { next: { revalidate: REVALIDATE_SECONDS, tags: [REELS_CACHE_TAG] } },
    );

    if (!res.ok) {
      console.warn(`[instagram] /me/media respondió ${res.status}`);
      return [];
    }

    const data = (await res.json()) as { data?: IgMedia[] };
    return (data.data ?? [])
      .filter(isReel)
      .map((m) => ({
        id: m.id,
        permalink: m.permalink ?? "",
        thumbnailUrl: m.thumbnail_url ?? m.media_url ?? "",
        caption: (m.caption ?? "").trim(),
        timestamp: m.timestamp ?? "",
      }))
      .filter((r) => r.permalink && r.thumbnailUrl)
      .slice(0, limit);
  } catch (error) {
    console.warn("[instagram] no se pudo leer el feed:", error);
    return [];
  }
}
