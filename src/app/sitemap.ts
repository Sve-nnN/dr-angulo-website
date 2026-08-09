import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { blogPosts } from "@/content/blog";

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
    { url: `${siteConfig.url}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes];
}
