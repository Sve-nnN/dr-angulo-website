import { buildLlmsTxt } from "@/lib/llms-txt";

/**
 * `/llms.txt` (SEO-10).
 *
 * Se prerenderiza en el build igual que `robots.txt` y `sitemap.xml`: el texto
 * sale de los archivos de contenido, que son estáticos, así que no hay motivo
 * para regenerarlo por petición.
 *
 * No entra al sitemap a propósito: el sitemap lista páginas para indexar y este
 * archivo no es una página. Por eso `SITEMAP_TOTAL` de la puerta de contenido
 * sigue en 21.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
