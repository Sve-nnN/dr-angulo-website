import Link from "next/link";
import type { Metadata } from "next";
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
      <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Artículos sobre columna y traumatología
      </h1>
      <p className="mt-5 text-lg text-foreground/70">
        Para entender qué te pasa antes de llegar a la consulta.
      </p>

      <div className="mt-12 divide-y divide-border border-y border-border">
        {blogPosts.map((post) => (
          <article key={post.slug} className="py-8">
            <p className="text-sm text-foreground/70">
              <time dateTime={post.date}>
                {dateFormatter.format(new Date(post.date))}
              </time>
            </p>
            <h2 className="mt-2 font-heading text-xl font-bold text-primary">
              <Link
                href={`/blog/${post.slug}`}
                className="transition-colors duration-150 hover:text-primary-dark hover:underline"
              >
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 text-foreground/80">{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
