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

/** Una sección sin párrafos ni subsecciones no se renderiza ni entra en el índice. */
function hasContent(section: ServiceSection) {
  return (
    section.paragraphs.length > 0 || (section.subsections?.length ?? 0) > 0
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
    <article
      data-content-body=""
      className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20"
    >
      <h1 className="text-pretty font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        {page.h1}
      </h1>

      <AuthorByline
        publishedAt={page.publishedAt}
        updatedAt={page.updatedAt}
      />

      <div className="mt-8">
        <MedicalDisclaimer />
      </div>

      <div className="mt-8">
        <TableOfContents
          title="En esta página"
          entries={visibleSections.map(({ id, section }) => ({
            id,
            label: section.heading,
          }))}
        />
      </div>

      {visibleSections.map(({ id, section }) => (
        <Fragment key={id}>
          <section className="mt-12">
            <h2
              id={id}
              tabIndex={-1}
              className="scroll-mt-28 font-heading text-2xl font-bold text-primary sm:text-3xl"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="mt-5 text-lg text-foreground/80">
                {paragraph}
              </p>
            ))}
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
          Una consulta con tus estudios en mano define qué necesitas realmente y
          qué puedes descartar. Puedes agendar en cualquiera de las sedes o
          escribir por WhatsApp si tienes dudas antes de reservar.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <BookingCta>Agendar consulta</BookingCta>
          <WhatsAppCta variant="accent" location="service_page">
            Escribir por WhatsApp
          </WhatsAppCta>
        </div>
      </section>

      <Link
        href="/servicios"
        className="mt-10 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-dark hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Ver todas las especialidades
      </Link>

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
        <MedicalDisclaimer />
      </div>
    </article>
    </>
  );
}
