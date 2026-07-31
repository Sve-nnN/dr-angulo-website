import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { FaqJsonLd } from "@/components/structured-data";
import { faqItems } from "@/content/faq";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Resolvemos las dudas más comunes sobre dolor de espalda, cirugía de columna y consultas con el Dr. Juan Carlos Angulo.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

export default function PreguntasFrecuentesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <FaqJsonLd items={faqItems} />
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Preguntas frecuentes
      </p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Resolvemos tus dudas
      </h1>

      <div className="mt-10 space-y-3">
        {faqItems.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-border bg-white p-5 shadow-sm open:shadow-md"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground marker:content-none">
              {item.question}
              <ChevronDown
                className="size-5 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-sm text-foreground/70">{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-muted p-8 text-center">
        <h2 className="font-heading text-lg font-bold text-primary">
          ¿Tu pregunta no está aquí?
        </h2>
        <p className="mt-2 text-foreground/70">
          Escríbeme directamente y te respondo por WhatsApp.
        </p>
        <div className="mt-5 flex justify-center">
          <WhatsAppCta location="services" variant="accent">
            Preguntar por WhatsApp
          </WhatsAppCta>
        </div>
      </div>
    </div>
  );
}
