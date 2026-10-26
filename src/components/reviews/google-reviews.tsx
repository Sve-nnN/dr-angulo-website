import { ArrowRight, Star } from "lucide-react";
import {
  getGoogleReviews,
  googleWriteReviewUrl,
  type GoogleReview,
  type GoogleReviewsData,
} from "@/lib/google-reviews";

const ratingFormatter = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function Stars({ rating, label }: { rating: number; label: string }) {
  const rounded = Math.round(rating);

  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={
            i < rounded
              ? "size-4 fill-accent text-accent"
              : "size-4 text-border"
          }
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <figure className="py-6">
      <Stars
        rating={review.rating}
        label={`${review.rating} de 5 estrellas`}
      />
      <blockquote className="mt-3 text-foreground/80">{review.text}</blockquote>
      <figcaption className="mt-3 text-sm text-foreground/70">
        {review.author}
        {review.relativeTime ? ` · ${review.relativeTime}` : ""}
      </figcaption>
    </figure>
  );
}

type Props = {
  className?: string;
  title?: string;
  /** Máximo de reseñas a mostrar. La API de Google devuelve hasta cinco. */
  limit?: number;
};

/**
 * Reseñas reales de la ficha de Google del consultorio. Si la API no responde,
 * no inventa nada: muestra solo la invitación a dejar una reseña.
 */
export async function GoogleReviewsSection(props: Props) {
  const data = await getGoogleReviews();
  if (!data) return <WriteReviewInvite className={props.className} />;

  return <GoogleReviewsView data={data} {...props} />;
}

/** La vista pura, separada del fetch para poder previsualizarla con datos fijos. */
export function GoogleReviewsView({
  data,
  className = "",
  title = "Reseñas en Google",
  limit = 5,
}: Props & { data: GoogleReviewsData }) {
  return (
    <section className={className} aria-labelledby="google-reviews-heading">
      <h2
        id="google-reviews-heading"
        className="font-heading text-2xl font-bold text-primary sm:text-3xl"
      >
        {title}
      </h2>

      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg text-foreground/80">
        <Stars
          rating={data.rating}
          label={`Calificación promedio: ${ratingFormatter.format(data.rating)} de 5`}
        />
        <span className="font-semibold text-foreground">
          {ratingFormatter.format(data.rating)} de 5
        </span>
        <span className="text-foreground/70">
          {data.reviewCount}{" "}
          {data.reviewCount === 1 ? "reseña en Google" : "reseñas en Google"}
        </span>
      </p>

      {data.reviews.length > 0 ? (
        <div className="mt-6 divide-y divide-border border-y border-border">
          {data.reviews.slice(0, limit).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2">
        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
        >
          Ver todas las reseñas en Google
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
        <a
          href={googleWriteReviewUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
        >
          Cuéntanos tu experiencia en Google
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      </div>
    </section>
  );
}

/**
 * Invitación mínima para cuando Google no devuelve datos. Sin cifras ni reseñas:
 * solo el camino para que un paciente deje la suya.
 */
function WriteReviewInvite({ className = "" }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="google-reviews-invite-heading">
      <h2
        id="google-reviews-invite-heading"
        className="font-heading text-2xl font-bold text-primary sm:text-3xl"
      >
        ¿Te atendiste con el doctor?
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-foreground/70">
        Tu reseña en Google ayuda a otros pacientes a decidir con más confianza.
      </p>
      <a
        href={googleWriteReviewUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
      >
        Cuéntanos tu experiencia en Google
        <ArrowRight className="size-4" aria-hidden="true" />
        <span className="sr-only">(se abre en una pestaña nueva)</span>
      </a>
    </section>
  );
}
