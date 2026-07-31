import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { testimonials, reviewLinks } from "@/content/testimonials";

export const metadata: Metadata = {
  title: "Testimonios de pacientes",
  description:
    "Reseñas y testimonios reales de pacientes del Dr. Juan Carlos Angulo Totesaut.",
  alternates: { canonical: "/testimonios" },
};

export default function TestimoniosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Testimonios
      </p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Lo que dicen sus pacientes
      </h1>

      <div className="mt-10 space-y-6">
        {testimonials.map((t, i) => (
          <figure key={i} className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <Quote className="size-6 text-accent" aria-hidden="true" />
            <blockquote className="mt-3 text-lg text-foreground/80">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-foreground/60">
              {t.author} — vía {t.source}
              {t.date ? ` · ${t.date}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 rounded-xl border-2 border-dashed border-border p-6 text-center">
        <p className="text-foreground/70">
          Esta página se actualiza con reseñas reales a medida que llegan. Puedes
          ver el historial completo de opiniones verificadas en Doctoralia.
        </p>
        <a
          href={reviewLinks.doctoralia}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-semibold text-primary hover:underline"
        >
          Ver reseñas en Doctoralia →
        </a>
      </div>

      <div className="mt-12 text-center">
        <WhatsAppCta location="services" variant="accent">
          Agendar una cita
        </WhatsAppCta>
      </div>
    </div>
  );
}
