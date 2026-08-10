import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { blogPosts } from "@/content/blog";
import { servicePages } from "@/content/service-pages";
import { locationPages } from "@/content/location-pages";

/**
 * Sitemap XML del sitio.
 *
 * Por qué es un route handler y no el `app/sitemap.ts` de Next.js:
 *
 * Juan pidió el 2026-08-10 que `/sitemap.xml` se vea legible en el navegador y
 * no como XML crudo. La forma estándar de conseguirlo es la instrucción de
 * procesamiento `<?xml-stylesheet ?>`, que el navegador aplica y los rastreadores
 * ignoran. El serializador de `app/sitemap.ts` vive dentro de Next
 * (`build/webpack/loaders/metadata/resolve-route-data.js`), escribe la cabecera
 * del XML él mismo y no expone ningún punto donde inyectar esa instrucción:
 * se verificó en el código de la versión instalada, no se dio por supuesto.
 *
 * Así que el XML se serializa acá. Lo que se conserva del convenio anterior:
 *
 * - La ruta pública sigue siendo `/sitemap.xml` y el `content-type` sigue siendo
 *   `application/xml`, que es lo que `robots.ts` anuncia.
 * - El artefacto prerenderizado sigue cayendo en `.next/server/app/sitemap.xml.body`,
 *   que es el archivo que lee `scripts/check-content.mjs`.
 * - Las entradas se siguen tipando con `MetadataRoute.Sitemap`, así el modelo de
 *   datos no cambia y volver al convenio de Next.js sería copiar el arreglo.
 * - La salida es la misma que producía Next.js, campo por campo y en el mismo
 *   orden, más la línea de la hoja de estilo.
 */
export const dynamic = "force-static";

/** Hoja XSL servida como archivo estático desde `public/`. */
const STYLESHEET = "/sitemap.xsl";

function entries(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/sobre-el-doctor`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/servicios`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/testimonios`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/preguntas-frecuentes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/agendar`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/sedes`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/contacto`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    // `/privacidad` no va en el sitemap: la página declara `noindex, follow` desde
    // v1.0, y proponerle a Google una URL que uno mismo pide no indexar produce
    // el error "Submitted URL marked noindex" en Search Console (D-10).
    //
    // `/llms.txt` tampoco: el sitemap lista páginas para indexar y ese archivo
    // no es una página.
  ];

  const serviceRoutes: MetadataRoute.Sitemap = servicePages.map((page) => ({
    url: `${siteConfig.url}/servicios/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Se deriva de `locationPages`, que es lo que genera las rutas: una sede sin
  // entrada editorial no tiene página y no puede entrar acá.
  const locationRoutes: MetadataRoute.Sitemap = locationPages.map((page) => ({
    url: `${siteConfig.url}/sedes/${page.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...serviceRoutes, ...locationRoutes, ...blogRoutes];
}

/** Escape de los cinco caracteres que XML no admite en texto ni en atributos. */
function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Misma normalización de fecha que aplicaba Next.js: ISO 8601. */
function lastModified(value: string | Date | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

export function buildSitemapXml() {
  const urls = entries()
    .map((entry) => {
      const lines = [`<loc>${escapeXml(entry.url)}</loc>`];
      const modified = lastModified(entry.lastModified);
      if (modified) lines.push(`<lastmod>${escapeXml(modified)}</lastmod>`);
      if (entry.changeFrequency) lines.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
      if (entry.priority !== undefined) lines.push(`<priority>${entry.priority}</priority>`);
      return `<url>\n${lines.join("\n")}\n</url>`;
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<?xml-stylesheet type="text/xsl" href="${STYLESHEET}"?>`,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

export function GET() {
  return new Response(buildSitemapXml(), {
    headers: {
      "content-type": "application/xml",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
