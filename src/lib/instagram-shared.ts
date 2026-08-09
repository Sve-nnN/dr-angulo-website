/** Tipos y helpers del feed de Instagram que también usa el cliente. */

export type InstagramReel = {
  id: string;
  permalink: string;
  thumbnailUrl: string;
  caption: string;
  timestamp: string;
};

/** Primera línea del caption, sin hashtags y recortada, para el título de la tarjeta. */
export function reelTitle(caption: string, maxLength = 90) {
  const firstLine = caption.split("\n").find((line) => line.trim().length > 0) ?? "";
  const clean = firstLine.replace(/#\w+/g, "").replace(/\s+/g, " ").trim();
  if (!clean) return "Reel del Dr. Angulo";
  return clean.length > maxLength ? `${clean.slice(0, maxLength).trimEnd()}…` : clean;
}
