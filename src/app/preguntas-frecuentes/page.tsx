import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { BookingCta } from "@/components/ui/booking-cta";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { AuthorByline } from "@/components/ui/author-byline";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { MidContentCta } from "@/components/ui/mid-content-cta";
import { TableOfContents } from "@/components/ui/table-of-contents";
import {
  ContentBody,
  ContentBodyBoundary,
  groupSections,
} from "@/components/content/content-body";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/structured-data";
import { faqItems } from "@/content/faq";
import { preguntasFrecuentesPage as page } from "@/content/static-pages/preguntas-frecuentes";

export const metadata: Metadata = {
  title: { absolute: "Reumatólogo o traumatólogo: a cuál te toca ir" },
  description:
    "Cuándo corresponde un reumatólogo y cuándo un traumatólogo, qué pasa en la primera cita y en qué casos se plantea operar.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

export default function PreguntasFrecuentesPage() {
  const tocEntries = groupSections(page.sections).map(({ section }) => ({
    id: section.id,
    label: section.heading,
  }));

  // El marcado de preguntas se arma con la misma mecánica que las guías de
  // servicio: las subsecciones de la sección `preguntas-frecuentes` del
  // paquete, más las preguntas del acordeón que sobrevivieron a la
  // comparación contra el cuerpo nuevo.
  const packageFaqItems = page.sections
    .filter((section) => section.id.startsWith("preguntas-frecuentes--"))
    .map((section) => ({
      question: section.heading,
      answer: section.paragraphs.join(" "),
    }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: "Preguntas frecuentes", path: "/preguntas-frecuentes" }]}
      />
      <FaqJsonLd
        items={[...packageFaqItems, ...faqItems]}
        path="/preguntas-frecuentes"
      />

      {/* El límite que mide la puerta de contenido envuelve el h1 y el
          artículo como una sola unidad: si abrazara solo al artículo, el h1
          quedaría fuera de lo medido. */}
      <ContentBodyBoundary>
        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="text-pretty font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            {page.h1}
          </h1>

          <div className="mt-12 mb-12">
            <TableOfContents title="En esta página" entries={tocEntries} />
          </div>

          <ContentBody
            sections={page.sections}
            flushFirstSection
            banner={
              page.ctaBanner ? (
                <MidContentCta
                  heading={page.ctaBanner.heading}
                  body={page.ctaBanner.body}
                  location="service_page"
                />
              ) : undefined
            }
            bannerAfterSectionId={page.bannerAfterSectionId}
          />

          {/* El acordeón conserva solo lo que el cuerpo aprobado no responde:
              recuperación, vuelta al trabajo y cómo se saca la cita en cada
              sede. El resto se retiró de `faq.ts` para no decir dos veces lo
              mismo con palabras distintas. */}
          <section className="mt-16">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              Otras dudas que llegan antes de la cita
            </h2>
            <div className="mt-8 divide-y divide-border border-y border-border">
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
          </section>

          <section className="mt-16">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              ¿Tu pregunta no está aquí?
            </h2>
            <p className="mt-3 text-lg text-foreground/70">
              Escríbeme directamente y te respondo por WhatsApp, o reserva la
              cita si ya tienes claro que quieres una evaluación.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <BookingCta>Agendar una cita</BookingCta>
              <WhatsAppCta location="services" variant="accent">
                Preguntar por WhatsApp
              </WhatsAppCta>
            </div>
          </section>

          {page.publishedAt && page.updatedAt ? (
            <>
              <div className="mt-14">
                <AuthorByline
                  publishedAt={page.publishedAt}
                  updatedAt={page.updatedAt}
                />
              </div>
              <div className="mt-8">
                <MedicalDisclaimer />
              </div>
            </>
          ) : null}
        </article>
      </ContentBodyBoundary>
    </>
  );
}
