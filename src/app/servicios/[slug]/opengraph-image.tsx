import { getServicePage, servicePages } from "@/content/service-pages";
import { ogAlt, renderOgCard, size, contentType } from "@/lib/og-card";

const EYEBROW = "Guía clínica";

/**
 * Imagen de Open Graph de cada guía clínica.
 *
 * El título sale de `servicePages`, la misma fuente que lee `generateMetadata`
 * en `page.tsx`: no hay una segunda copia del texto que se pueda desincronizar.
 *
 * `generateStaticParams` es lo que hace que las cuatro imágenes se generen en
 * el build. Se probó la alternativa de `generateImageMetadata`, que permitiría
 * un `alt` distinto por slug, y se descartó: con ella la ruta pasa a
 * `[__metadata_id__]`, queda fuera del manifiesto de prerenderizado y cada
 * imagen se generaría en la primera petición. Para un sitio que se redespliega
 * seguido, eso significa que el primer rastreador que llegue tras cada deploy
 * paga la generación. El `alt` de sección es un precio menor que ese.
 */
export function generateStaticParams() {
  return servicePages.map((page) => ({ slug: page.slug }));
}

export const alt = ogAlt(EYEBROW);
export { size, contentType };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getServicePage(slug);

  return renderOgCard({ eyebrow: EYEBROW, title: page?.title ?? EYEBROW });
}
