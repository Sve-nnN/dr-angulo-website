import { getLocationPage, locationPages } from "@/content/location-pages";
import { ogAlt, renderOgCard, size, contentType } from "@/lib/og-card";

const EYEBROW = "Sede";

/** Mismo criterio que `/servicios/[slug]`: el título sale de `locationPages`. */
export function generateStaticParams() {
  return locationPages.map((page) => ({ slug: page.slug }));
}

export const alt = ogAlt(EYEBROW);
export { size, contentType };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getLocationPage(slug);

  return renderOgCard({ key: `sedes-${slug}`, eyebrow: EYEBROW, title: entry?.page.title ?? EYEBROW });
}
