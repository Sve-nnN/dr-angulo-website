import { blogPosts } from "@/content/blog";
import { ogAlt, renderOgCard, size, contentType } from "@/lib/og-card";

const EYEBROW = "Artículo";

/** Mismo criterio que `/servicios/[slug]`: el título sale de `blogPosts`. */
export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export const alt = ogAlt(EYEBROW);
export { size, contentType };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((entry) => entry.slug === slug);

  return renderOgCard({ key: `blog-${slug}`, eyebrow: EYEBROW, title: post?.title ?? EYEBROW });
}
