#!/usr/bin/env node
/**
 * Sincroniza las reseñas de la ficha de Google con el sitio.
 *
 * Corre en un servidor propio (el homeserver), no en el sitio. Lee TODAS las
 * reseñas con la API de Business Profile y le envía al sitio solo el resultado
 * público: calificación, total y, de cada reseña, autor, estrellas, texto y
 * fecha. El token de Google nunca sale de donde corre este script.
 *
 * Uso:
 *   node scripts/sync-google-reviews.mjs --discover   lista cuentas y ubicaciones
 *   node scripts/sync-google-reviews.mjs --dry-run    arma el envío y lo muestra
 *   node scripts/sync-google-reviews.mjs              sincroniza
 *
 * Variables de entorno (ver docs/google-reviews-sync.md):
 *   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GBP_AGENCY_REFRESH_TOKEN
 *   GBP_ACCOUNT_ID, GBP_LOCATION_ID          (salen de --discover)
 *   REVIEWS_SYNC_SECRET                      (el mismo que tiene el sitio)
 *   REVIEWS_SYNC_URL                         (opcional)
 *
 * Sin dependencias: solo Node 18 o más nuevo.
 */

const SYNC_URL =
  process.env.REVIEWS_SYNC_URL || "https://drangulocolumna.com/api/reviews/sync";
const TIMEOUT_MS = 20_000;
const MAX_PAGES = 10;
const MAX_REVIEWS = 100;

const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

const args = new Set(process.argv.slice(2));

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function requireEnv(...names) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length > 0) fail(`faltan variables de entorno: ${missing.join(", ")}`);
}

/** Acepta "123", "accounts/123" o "locations/123" y devuelve solo el número. */
function bareId(value) {
  return String(value).trim().replace(/^(accounts|locations)\//, "");
}

async function request(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Respuesta que no es JSON: se informa solo el código.
  }
  if (!response.ok) {
    // Nunca se imprime el cuerpo completo: puede traer datos de la cuenta.
    const reason = body?.error?.message || body?.error_description || body?.error || "";
    fail(`${init.method ?? "GET"} ${new URL(url).host} respondió ${response.status} ${String(reason).slice(0, 200)}`);
  }
  return body;
}

async function getAccessToken() {
  requireEnv("GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GBP_AGENCY_REFRESH_TOKEN");

  const body = await request("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GBP_AGENCY_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!body?.access_token) fail("Google no devolvió un token de acceso");
  return body.access_token;
}

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

/** Lista cuentas y ubicaciones para saber qué valores poner en el entorno. */
async function discover(accessToken) {
  const accounts = await request(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: authHeaders(accessToken) }
  );

  for (const account of accounts?.accounts ?? []) {
    console.log(`\nCuenta: ${account.accountName ?? "(sin nombre)"}`);
    console.log(`  GBP_ACCOUNT_ID=${bareId(account.name)}  (${account.type ?? "tipo desconocido"})`);

    const locations = await request(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress&pageSize=100`,
      { headers: authHeaders(accessToken) }
    );

    for (const location of locations?.locations ?? []) {
      const street = location.storefrontAddress?.addressLines?.[0] ?? "";
      console.log(`  - ${location.title ?? "(sin título)"} ${street ? `| ${street}` : ""}`);
      console.log(`    GBP_LOCATION_ID=${bareId(location.name)}`);
    }
  }
}

/**
 * Google traduce algunas reseñas y devuelve "(Translated by Google) ...
 * (Original) ...". Se conserva el texto original que escribió el paciente.
 */
function originalText(comment) {
  const text = String(comment ?? "").trim();
  const marker = text.indexOf("(Original)");
  if (marker !== -1) return text.slice(marker + "(Original)".length).trim();
  return text.replace(/^\(Translated by Google\)\s*/, "").trim();
}

async function fetchReviews(accessToken) {
  requireEnv("GBP_ACCOUNT_ID", "GBP_LOCATION_ID");
  const parent = `accounts/${bareId(process.env.GBP_ACCOUNT_ID)}/locations/${bareId(process.env.GBP_LOCATION_ID)}`;

  const collected = [];
  let rating = null;
  let reviewCount = null;
  let pageToken = "";

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${parent}/reviews`);
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const body = await request(url, { headers: authHeaders(accessToken) });

    rating = body?.averageRating ?? rating;
    reviewCount = body?.totalReviewCount ?? reviewCount;
    collected.push(...(body?.reviews ?? []));

    pageToken = body?.nextPageToken ?? "";
    if (!pageToken) break;
  }

  return { rating, reviewCount, raw: collected };
}

/** Deja solo lo público y lo que el sitio sabe mostrar: reseñas con texto. */
function toSnapshot({ rating, reviewCount, raw }) {
  const reviews = raw
    .map((review) => ({
      id: String(review.reviewId ?? review.name ?? ""),
      author:
        review.reviewer?.isAnonymous || !review.reviewer?.displayName
          ? "Paciente de Google"
          : String(review.reviewer.displayName).trim(),
      rating: STARS[review.starRating] ?? 0,
      text: originalText(review.comment),
      publishedAt: review.createTime ? new Date(review.createTime).toISOString() : undefined,
    }))
    .filter((review) => review.id && review.rating >= 1 && review.text.length > 0)
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .slice(0, MAX_REVIEWS);

  if (!rating || !reviewCount) fail("la ficha no devolvió calificación ni total de reseñas");

  return {
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    reviews,
  };
}

async function main() {
  const accessToken = await getAccessToken();

  if (args.has("--discover")) {
    await discover(accessToken);
    return;
  }

  const snapshot = toSnapshot(await fetchReviews(accessToken));
  console.log(
    `Calificación ${snapshot.rating}, ${snapshot.reviewCount} reseñas en total, ${snapshot.reviews.length} con texto.`
  );

  if (args.has("--dry-run")) {
    console.log("Modo prueba: no se envía nada. Primera reseña:");
    const [first] = snapshot.reviews;
    if (first) console.log(`  ${first.rating} estrellas, ${first.author}, ${first.publishedAt ?? "sin fecha"}`);
    return;
  }

  requireEnv("REVIEWS_SYNC_SECRET");

  const result = await request(SYNC_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REVIEWS_SYNC_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snapshot),
  });

  console.log(`Sitio actualizado: ${result?.reviews ?? "?"} reseñas guardadas (${result?.syncedAt ?? "sin fecha"}).`);
}

main().catch((error) => fail(error?.message ?? String(error)));
