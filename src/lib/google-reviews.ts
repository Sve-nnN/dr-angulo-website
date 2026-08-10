/**
 * Reseñas de la ficha de Google del consultorio.
 *
 * Fuente: Places API (New), endpoint de detalles de lugar. Devuelve hasta cinco
 * reseñas, que es el máximo que expone la API — no existe forma oficial de
 * traerlas todas.
 *
 * Términos de Google: las reseñas se pueden mostrar con atribución al autor y a
 * Google, y no se pueden almacenar más de 30 días. Por eso el feed se revalida
 * cada 24 horas y nada se guarda en disco.
 *
 * Sin `GOOGLE_PLACES_API_KEY` configurada, todo devuelve null y la sección de
 * reseñas simplemente no se renderiza.
 */

const PLACES_API = "https://places.googleapis.com/v1/places";
const REVALIDATE_SECONDS = 60 * 60 * 24;

/**
 * Techo propio de llamadas por día, además del caché de 24 h.
 *
 * El campo `reviews` cae en el SKU Place Details Enterprise + Atmosphere, que
 * trae 1.000 llamadas gratis al mes y después cuesta 25 USD por cada 1.000. Con
 * el caché el sitio hace ~1 llamada diaria, así que 24 es un techo holgado que
 * igual deja el consumo mensual en menos del 75% del tramo gratuito aunque algo
 * salga mal (redeploys en cadena, caché que no se comparte entre instancias).
 */
const MAX_CALLS_PER_DAY = Number(process.env.GOOGLE_REVIEWS_MAX_CALLS_PER_DAY ?? 24);

/** Si Google falla, se deja de intentar por un rato en vez de reintentar en loop. */
const ERROR_COOLDOWN_MS = 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Presupuesto en memoria del proceso. Es una red de seguridad, no contabilidad
 * exacta: si hay varias instancias, cada una lleva la suya. El control real de
 * gasto es la cuota diaria configurada en Google Cloud.
 */
const budget = {
  day: "",
  calls: 0,
  pausedUntil: 0,
  /** Última respuesta buena, para seguir sirviendo si el presupuesto se acaba. */
  lastGood: null as GoogleReviewsData | null,
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function canCallApi() {
  if (Date.now() < budget.pausedUntil) return false;

  if (budget.day !== today()) {
    budget.day = today();
    budget.calls = 0;
  }

  return budget.calls < MAX_CALLS_PER_DAY;
}

/** Ficha del consultorio privado en Google Maps (verificada 2026-08-09). */
export const GOOGLE_PLACE_ID =
  process.env.GOOGLE_PLACE_ID || "ChIJQ4nDssLHBZEROmZ9nyesA5c";

export type GoogleReview = {
  id: string;
  author: string;
  authorUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishedAt?: string;
  reviewUrl?: string;
};

export type GoogleReviewsData = {
  rating: number;
  reviewCount: number;
  reviews: GoogleReview[];
  /** Enlace a la ficha para ver todas las reseñas. */
  profileUrl: string;
};

type PlacesReview = {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string };
};

type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
  error?: { message?: string };
};

export function googleProfileUrl(placeId = GOOGLE_PLACE_ID) {
  return `https://search.google.com/local/reviews?placeid=${placeId}`;
}

/**
 * Devuelve la calificación y las reseñas publicadas, o null si no hay API key,
 * si la ficha no tiene reseñas o si Google responde con error.
 */
export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  // Presupuesto agotado o pausa por error: se sirve lo último bueno, si lo hay.
  if (!canCallApi()) return budget.lastGood;

  try {
    budget.calls += 1;

    const res = await fetch(`${PLACES_API}/${GOOGLE_PLACE_ID}?languageCode=es`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS, tags: ["google-reviews"] },
    });

    if (!res.ok) {
      // 429 (cuota) y 5xx: pausa para no seguir quemando llamadas.
      if (res.status === 429 || res.status >= 500) {
        budget.pausedUntil = Date.now() + ERROR_COOLDOWN_MS;
      }
      console.warn(`[google-reviews] Places API respondió ${res.status}`);
      return budget.lastGood;
    }

    const data = (await res.json()) as PlacesResponse;
    if (!data.rating || !data.userRatingCount) return budget.lastGood;

    const reviews: GoogleReview[] = (data.reviews ?? [])
      .map((review, index) => ({
        id: review.name ?? `review-${index}`,
        author: review.authorAttribution?.displayName?.trim() || "Paciente de Google",
        authorUrl: review.authorAttribution?.uri,
        rating: review.rating ?? 0,
        text: (review.text?.text ?? review.originalText?.text ?? "").trim(),
        relativeTime: review.relativePublishTimeDescription ?? "",
        publishedAt: review.publishTime,
        reviewUrl: review.googleMapsUri,
      }))
      .filter((review) => review.text.length > 0);

    budget.lastGood = {
      rating: data.rating,
      reviewCount: data.userRatingCount,
      reviews,
      profileUrl: data.googleMapsUri ?? googleProfileUrl(),
    };

    return budget.lastGood;
  } catch (error) {
    // Timeout o error de red: misma pausa que con un 5xx.
    budget.pausedUntil = Date.now() + ERROR_COOLDOWN_MS;
    console.warn("[google-reviews] no se pudo leer la ficha:", error);
    return budget.lastGood;
  }
}

/** Estado del presupuesto, para diagnóstico desde el endpoint de salud. */
export function getReviewsBudgetStatus() {
  return {
    day: budget.day || today(),
    callsToday: budget.day === today() ? budget.calls : 0,
    maxCallsPerDay: MAX_CALLS_PER_DAY,
    pausedUntil: budget.pausedUntil ? new Date(budget.pausedUntil).toISOString() : null,
    hasCachedData: budget.lastGood !== null,
    apiKeyConfigured: Boolean(process.env.GOOGLE_PLACES_API_KEY),
  };
}
