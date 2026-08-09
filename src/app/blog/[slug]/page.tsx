import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingCta } from "@/components/ui/booking-cta";
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

      <p className="mt-8 text-sm text-foreground/70">
        <time dateTime={post.date}>
          {dateFormatter.format(new Date(post.date))}
        </time>
      </p>
      <h1 className="mt-2 font-heading text-2xl font-extrabold text-primary sm:text-3xl">
        {post.title}
      </h1>

      <div className="prose-content mt-8 space-y-5 text-lg text-foreground/80">
        {post.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-14 border-t border-border pt-10">
        <p className="font-heading text-lg font-bold text-foreground">
          ¿Reconoces alguno de estos síntomas?
        </p>
        <div className="mt-5">
          <BookingCta>Agendar una evaluación</BookingCta>
        </div>
      </div>
    </article>
  );
}
