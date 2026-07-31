import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { blogPosts } from "@/content/blog";

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

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
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al blog
      </Link>

      <p className="mt-6 flex items-center gap-2 text-xs font-medium text-foreground/50">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        {dateFormatter.format(new Date(post.date))}
      </p>
      <h1 className="mt-2 font-heading text-2xl font-extrabold text-primary sm:text-3xl">
        {post.title}
      </h1>

      <div className="prose-content mt-8 space-y-4 text-foreground/80">
        {post.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-muted p-6 text-center">
        <p className="font-semibold text-foreground">
          ¿Reconoces alguno de estos síntomas?
        </p>
        <div className="mt-4 flex justify-center">
          <WhatsAppCta location="services" variant="accent">
            Agendar una evaluación
          </WhatsAppCta>
        </div>
      </div>
    </article>
  );
}
