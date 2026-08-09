import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { InstagramReelsSection } from "@/components/instagram/instagram-reels-section";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { testimonials, reviewLinks } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Testimonios de pacientes",
  description:
    "Reseñas y testimonios reales de pacientes del Dr. Juan Carlos Angulo Totesaut.",
  alternates: { canonical: "/testimonios" },
};

/** ISR: la página se regenera cada hora para tomar los reels nuevos. */
export const revalidate = 3600;

export default function TestimoniosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Lo que dicen sus pacientes
      </h1>

      <p className="mt-5 max-w-2xl text-lg text-foreground/70">
        Los pacientes operados cuentan su recuperación en video. Abajo están sus
        testimonios y las reseñas publicadas en Doctoralia.
      </p>

      <div className="mt-12 divide-y divide-border border-y border-border">
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
        <WhatsAppCta location="services" variant="accent">
          Agendar una cita
        </WhatsAppCta>
      </div>
    </div>
  );
}
