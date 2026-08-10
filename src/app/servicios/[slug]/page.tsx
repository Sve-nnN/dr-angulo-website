import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingCta } from "@/components/ui/booking-cta";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { AuthorByline } from "@/components/ui/author-byline";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { MidContentCta } from "@/components/ui/mid-content-cta";
import { TableOfContents } from "@/components/ui/table-of-contents";
import { ServiceItemGrid } from "@/components/ui/service-item-grid";
import { ConsultAlert } from "@/components/ui/consult-alert";
import { TreatmentCompare } from "@/components/ui/treatment-compare";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  MedicalWebPageJsonLd,
} from "@/components/structured-data";
import { blogPosts } from "@/content/blog";
import {
  SERVICE_SECTION_ORDER,
  getServicePage,
  servicePages,
  type ServiceSection,
  type ServiceSectionId,
} from "@/content/service-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/servicios/${page.slug}` },
    openGraph: {
      type: "article",
      title: page.title,
      description: page.description,
      publishedTime: page.publishedAt,
      modifiedTime: page.updatedAt,
    },
  };
}

/** Una sección sin párrafos, tarjetas ni subsecciones no se renderiza ni entra en el índice. */
function hasContent(section: ServiceSection) {
  return (
    section.paragraphs.length > 0 ||
    (section.items?.length ?? 0) > 0 ||
    (section.subsections?.length ?? 0) > 0
  );
}

/**
 * Cada sección tiene su propio tratamiento visual: alerta para "cuándo
 * consultar", tarjetas para síntomas y complicaciones, pasos numerados para
 * diagnóstico y recuperación, comparación de dos columnas para tratamiento.
 * Es lo que separa una página de servicio de un post de blog con el mismo
 * contenido.
 */
function SectionBody({
  id,
  section,
}: {
  id: ServiceSectionId;
  section: ServiceSection;
}) {
  if (id === "cuando-consultar") {
    return <ConsultAlert paragraphs={section.paragraphs} />;
  }

  if (id === "tratamiento" && section.subsections) {
    return (
      <>
        {section.paragraphs.map((paragraph, index) => (
          <p key={index} className="mt-5 text-lg text-foreground/80">
            {paragraph}
          </p>
        ))}
        <TreatmentCompare subsections={section.subsections} />
      </>
    );
  }

  const stepVariant = id === "diagnostico" || id === "recuperacion";

  return (
    <>
      {section.paragraphs.map((paragraph, index) => (
        <p key={index} className="mt-5 text-lg text-foreground/80">
          {paragraph}
        </p>
      ))}
      {section.items && (
        <ServiceItemGrid
          items={section.items}
          variant={stepVariant ? "steps" : "grid"}
        />
      )}
      {section.subsections?.map((subsection) => (
        <div key={subsection.heading} className="mt-8">
          <h3 className="font-heading text-lg font-bold text-primary">
            {subsection.heading}
          </h3>
          {subsection.paragraphs.map((paragraph, index) => (
            <p key={index} className="mt-3 text-lg text-foreground/80">
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

export default async function ServiceGuidePage({ params }: Props) {
  const { slug } = await params;
  const page = getServicePage(slug);
  if (!page) notFound();

  // Se recorre la tupla, nunca las llaves del objeto: el orden y el índice
  // salen de la misma lista que lo renderizado y no pueden desincronizarse.
  const visibleSections = SERVICE_SECTION_ORDER.map((id) => ({
    id,
    section: page.sections[id],
  })).filter(({ section }) => hasContent(section));

  const relatedPosts = blogPosts.filter((post) =>
    page.relatedPosts.includes(post.slug)
  );

  const faqItems = (page.sections["preguntas-frecuentes"].subsections ?? []).map(
    (subsection) => ({
      question: subsection.heading,
      answer: subsection.paragraphs.join(" "),
    })
  );

  return (
    <>
      <MedicalWebPageJsonLd page={page} />
      <BreadcrumbJsonLd
        items={[
          { name: "Servicios", path: "/servicios" },
          { name: page.navLabel, path: `/servicios/${page.slug}` },
        ]}
      />
      {faqItems.length > 0 && (
        <FaqJsonLd items={faqItems} path={`/servicios/${page.slug}`} />
      )}

      {/*
        `data-content-body` envuelve la banda de cabecera y el artículo como
        una sola unidad: el h1, el enlace de vuelta al hub y el resto del
        cuerpo viven bajo el mismo límite que mide la puerta de contenido
        (scripts/check-content.mjs). Antes vivía solo en el `<article>`, y al
        mover el h1 y el enlace a la banda de cabecera quedaban fuera de lo
        medido: la puerta reportaba "0 h1" y "falta el enlace al hub" aunque
        ambos estuvieran en la página. Se corrige moviendo el límite, no
        debilitando la puerta.
      */}
      <div data-content-body="">
        {/* Banda de cabecera: identifica la página como servicio desde el
            primer scroll, no como un artículo. El h1, la orientación y el
            CTA conviven arriba del pliegue. */}
        <div className="border-b border-border bg-muted">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <Link
              href="/servicios"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-dark hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Servicios
            </Link>
            <h1 className="mt-4 text-pretty font-heading text-3xl font-extrabold text-primary sm:text-4xl">
              {page.h1}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-foreground/80">
              {page.heroLead}
            </p>
            {page.alternateNames && page.alternateNames.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {page.alternateNames.map((name) => (
                  <li
                    key={name}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/70"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <BookingCta>Agendar consulta</BookingCta>
              <WhatsAppCta variant="outline" location="service_page">
                Escribir por WhatsApp
              </WhatsAppCta>
            </div>
          </div>
        </div>

        <article className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_18rem] lg:gap-12">
          <div className="order-2 min-w-0 max-w-2xl lg:order-1">
            {visibleSections.map(({ id, section }) => (
              <Fragment key={id}>
                <section className="mt-12 first:mt-0">
                  <h2
                    id={id}
                    tabIndex={-1}
                    className="scroll-mt-28 font-heading text-2xl font-bold text-primary sm:text-3xl"
                  >
                    {section.heading}
                  </h2>
                  <SectionBody id={id} section={section} />
                </section>
                {/* Un banner por página, más el CTA de cierre. Va después de
                    `sintomas` porque es el punto donde el paciente acaba de
                    reconocer lo que le pasa (POS-01). */}
                {id === "sintomas" && (
                  <MidContentCta
                    heading={page.ctaBanner.heading}
                    body={page.ctaBanner.body}
                    location="service_page"
                  />
                )}
              </Fragment>
            ))}

            <section className="mt-16 border-t border-border pt-12">
              <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                Agenda una evaluación de tu caso
              </h2>
              <p className="mt-4 text-lg text-foreground/80">
                Una consulta con tus estudios en mano define qué necesitas
                realmente y qué puedes descartar. Puedes agendar en cualquiera
                de las sedes o escribir por WhatsApp si tienes dudas antes de
                reservar.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <BookingCta>Agendar consulta</BookingCta>
                <WhatsAppCta variant="accent" location="service_page">
                  Escribir por WhatsApp
                </WhatsAppCta>
              </div>
            </section>

            {relatedPosts.length > 0 && (
              <section className="mt-14 border-t border-border pt-10">
                <p className="font-heading text-lg font-bold text-foreground">
                  Lecturas relacionadas
                </p>
                <ul className="mt-3">
                  {relatedPosts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-14">
              <AuthorByline
                publishedAt={page.publishedAt}
                updatedAt={page.updatedAt}
              />
            </div>

            <div className="mt-8">
              <MedicalDisclaimer />
            </div>
          </div>

          {/* Aside de escritorio: índice y tarjeta de agenda pegados en el
              scroll. En móvil el índice cae dentro del flujo, antes del
              contenido, y la tarjeta de agenda no se repite. */}
          <aside className="order-1 mb-10 lg:order-2 lg:mb-0 lg:mt-0">
            <div className="lg:sticky lg:top-24 lg:space-y-5">
              <TableOfContents
                title="En esta página"
                entries={visibleSections.map(({ id, section }) => ({
                  id,
                  label: section.heading,
                }))}
              />
              <div className="hidden rounded-2xl border border-border bg-muted p-6 lg:block">
                <p className="font-heading text-base font-bold text-foreground">
                  ¿Listo para agendar?
                </p>
                <p className="mt-2 text-sm text-foreground/80">
                  Elige la sede que te quede mejor y reserva tu evaluación.
                </p>
                <div className="mt-4">
                  <BookingCta className="w-full">Agendar consulta</BookingCta>
                </div>
              </div>
            </div>
          </aside>
        </div>
        </article>
      </div>
    </>
  );
}
