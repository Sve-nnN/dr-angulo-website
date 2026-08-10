import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { FaqJsonLd } from "@/components/structured-data";
import { faqItems } from "@/content/faq";
import { BreadcrumbJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Resolvemos las dudas más comunes sobre dolor de espalda, cirugía de columna y consultas con el Dr. Juan Carlos Angulo.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

export default function PreguntasFrecuentesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Preguntas frecuentes", path: "/preguntas-frecuentes" }]} />
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <FaqJsonLd items={faqItems} />
      <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Lo que más preguntan antes de operarse
      </h1>

      <div className="mt-12 divide-y divide-border border-y border-border">
        {faqItems.map((item) => (
          <details key={item.question} className="accordion group py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-heading text-lg font-bold text-foreground transition-colors duration-150 marker:content-none hover:text-primary">
              {item.question}
              <Plus className="size-5 shrink-0 text-primary" aria-hidden="true" />
            </summary>
            <p className="pb-5 pr-9 text-foreground/80">{item.answer}</p>
          </details>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="font-heading text-xl font-bold text-primary sm:text-2xl">
          ¿Tu pregunta no está aquí?
        </h2>
        <p className="mt-3 text-lg text-foreground/70">
          Escríbeme directamente y te respondo por WhatsApp.
        </p>
        <div className="mt-6">
          <WhatsAppCta location="services" variant="accent">
            Preguntar por WhatsApp
          </WhatsAppCta>
        </div>
      </section>
    </div>
    </>
  );
}
