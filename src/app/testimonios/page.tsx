import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { InstagramReelsSection } from "@/components/instagram/instagram-reels-section";
import { BookingCta } from "@/components/ui/booking-cta";
import { testimonials, reviewLinks } from "@/content/testimonials";
import { BreadcrumbJsonLd } from "@/components/structured-data";
import { GoogleReviewsSection } from "@/components/reviews/google-reviews";

export const metadata: Metadata = {
  title: "Testimonios de pacientes",
  description:
    "Reseñas y testimonios reales de pacientes del Dr. Juan Carlos Angulo Totesaut.",
  alternates: { canonical: "/testimonios" },
};

/** ISR: la página se regenera cada hora para tomar los reels nuevos. */
export const revalidate = 3600;

export default async function TestimoniosPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Testimonios", path: "/testimonios" }]} />
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Lo que dicen sus pacientes
      </h1>

      <p className="mt-5 max-w-2xl text-lg text-foreground/70">
        Los pacientes operados cuentan su recuperación en video. Abajo están sus
        reseñas de Google y las publicadas en Doctoralia.
      </p>

      <GoogleReviewsSection className="mt-14" />

      <h2 className="mt-16 font-heading text-2xl font-bold text-primary sm:text-3xl">
        Otras reseñas
      </h2>
      <div className="mt-6 divide-y divide-border border-y border-border">
        {testimonials.map((t, i) => (
          <figure key={i} className="py-6">
            <blockquote className="font-heading text-lg font-bold text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-2 text-sm text-foreground/70">
              {t.author} — vía {t.source}
              {t.date ? ` · ${t.date}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:gap-10">
        <a
          href={reviewLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
        >
          Testimonios en video, en Instagram
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
        <a
          href={reviewLinks.doctoralia}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
        >
          Reseñas en Doctoralia
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>

      <InstagramReelsSection
        className="mt-20 border-t border-border pt-14"
        title="Videos del consultorio"
        intro="Testimonios, casos y explicaciones que el doctor publica en su Instagram. Se actualiza solo con cada nuevo reel."
      />

      <div className="mt-16 border-t border-border pt-12">
        <BookingCta>Ver sedes y agendar</BookingCta>
      </div>
    </div>
    </>
  );
}
