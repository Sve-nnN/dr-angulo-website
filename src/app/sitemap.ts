import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { blogPosts } from "@/content/blog";
import { servicePages } from "@/content/service-pages";
import { locationPages } from "@/content/location-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/sobre-el-doctor`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/servicios`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/testimonios`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/preguntas-frecuentes`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/agendar`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/contacto`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    // `/privacidad` no va en el sitemap: la página declara `noindex, follow` desde
    // v1.0, y proponerle a Google una URL que uno mismo pide no indexar produce
    // el error "Submitted URL marked noindex" en Search Console (D-10).
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
