import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays } from "lucide-react";
import { blogPosts } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog — Salud de columna y traumatología",
  description:
    "Artículos sobre dolor de espalda, hernia discal, cirugía de columna y salud músculo-esquelética, escritos por el Dr. Juan Carlos Angulo.",
  alternates: { canonical: "/blog" },
};

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">Blog</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Artículos sobre columna y traumatología
      </h1>
      <p className="mt-4 text-foreground/70">
        Información clara para entender qué te pasa antes de tu consulta.
      </p>

      <div className="mt-10 space-y-6">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <p className="flex items-center gap-2 text-xs font-medium text-foreground/50">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {dateFormatter.format(new Date(post.date))}
            </p>
            <h2 className="mt-2 font-heading text-lg font-bold text-primary">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-foreground/70">{post.description}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Leer artículo <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
