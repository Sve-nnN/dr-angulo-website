import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookingCta } from "@/components/ui/booking-cta";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { AuthorByline } from "@/components/ui/author-byline";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { MidContentCta } from "@/components/ui/mid-content-cta";
import { TableOfContents } from "@/components/ui/table-of-contents";
import { blogPosts } from "@/content/blog";
import { getServicePage } from "@/content/service-pages";
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/components/structured-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  // Si el servicio no existiera, el bloque de salida se omite y la página no
  // rompe el build. Hoy los cuatro slugs resuelven.
  const service = getServicePage(post.relatedService);
  const conditionLabel = service
    ? service.conditionName.charAt(0).toLowerCase() +
      service.conditionName.slice(1)
    : "";

  return (
    <>
      <BlogPostingJsonLd post={post} />
      <BreadcrumbJsonLd
        items={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
    <article
      data-content-body=""
      className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20"
    >
      <Link
        href="/blog"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-dark hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al blog
      </Link>

      <h1 className="mt-6 text-pretty font-heading text-2xl font-extrabold text-primary sm:text-3xl">
        {post.title}
      </h1>

      <AuthorByline publishedAt={post.publishedAt} updatedAt={post.updatedAt} />

      <div className="mt-8">
        <TableOfContents
          title="En este artículo"
          entries={post.sections.map((section) => ({
            id: section.id,
            label: section.heading,
          }))}
        />
      </div>

      {post.intro.map((paragraph, index) => (
        <p key={index} className="mt-8 text-lg text-foreground/80">
          {paragraph}
        </p>
      ))}

      {post.sections.map((section, index) => (
        <Fragment key={section.id}>
          <section className="mt-12">
            <h2
              id={section.id}
              tabIndex={-1}
              className="scroll-mt-28 font-heading text-xl font-bold text-primary sm:text-2xl"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="mt-5 text-lg text-foreground/80">
                {paragraph}
              </p>
            ))}
            {section.subsections?.map((subsection) => (
              <div key={subsection.heading} className="mt-8">
                <h3 className="font-heading text-lg font-bold text-primary">
                  {subsection.heading}
                </h3>
                {subsection.paragraphs.map((paragraph, i) => (
                  <p key={i} className="mt-3 text-lg text-foreground/80">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </section>
          {/* Un banner por post, después de la primera sección, más el CTA de
              cierre. Es el punto donde el lector acaba de reconocer su caso
              (POS-01). */}
          {index === 0 && (
            <MidContentCta
              heading={post.ctaBanner.heading}
              body={post.ctaBanner.body}
              location="blog_post"
            />
          )}
        </Fragment>
      ))}

      <section className="mt-16 border-t border-border pt-12">
        <h2 className="font-heading text-xl font-bold text-primary sm:text-2xl">
          Agenda una evaluación de tu caso
        </h2>
        <p className="mt-4 text-lg text-foreground/80">
          Una consulta con tus estudios en mano define qué necesitas realmente y
          qué puedes descartar. Puedes agendar en cualquiera de las sedes o
          escribir por WhatsApp si tienes dudas antes de reservar.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <BookingCta>Agendar consulta</BookingCta>
          <WhatsAppCta variant="accent" location="blog_post">
            Escribir por WhatsApp
          </WhatsAppCta>
        </div>
      </section>

      {service && (
        <Link
          href={`/servicios/${service.slug}`}
          className="mt-10 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-dark hover:underline"
        >
          Leer la guía completa sobre {conditionLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}

      <div className="mt-14">
        <MedicalDisclaimer />
      </div>
    </article>
    </>
  );
}
