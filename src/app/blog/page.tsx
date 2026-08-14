import Link from "next/link";
import type { Metadata } from "next";
import { blogPosts } from "@/content/blog";
import { BlogJsonLd, BreadcrumbJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: { absolute: "Blog del Dr. Juan Carlos Angulo" },
  description:
    "Artículos sobre dolor de espalda, salud de la columna y qué esperar de una consulta, escritos por el Dr. Juan Carlos Angulo.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog del Dr. Juan Carlos Angulo",
    description:
      "Artículos sobre dolor de espalda, salud de la columna y qué esperar de una consulta, escritos por el Dr. Juan Carlos Angulo.",
    url: "/blog",
  },
};

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function BlogPage() {
  return (
    <>
      <BlogJsonLd posts={blogPosts} />
      <BreadcrumbJsonLd items={[{ name: "Blog", path: "/blog" }]} />
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
              <time dateTime={post.publishedAt}>
                {dateFormatter.format(new Date(post.publishedAt))}
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

      <section className="mt-14 border-t border-border pt-10">
        <p className="font-heading text-lg font-bold text-foreground">
          Sigue leyendo
        </p>
        <ul className="mt-3">
          <li>
            <Link
              href="/servicios"
              className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
            >
              traumatólogo de columna
            </Link>
          </li>
        </ul>
      </section>
    </div>
    </>
  );
}
