import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * `robots.txt` que emite la aplicación.
 *
 * OJO: esto NO es todo lo que ve un rastreador. Cloudflare antepone su propio
 * bloque de robots.txt gestionado delante de esta salida, y ese bloque es el
 * que hoy le pone `Disallow: /` a ClaudeBot y a los demás rastreadores de IA.
 * Ningún cambio de este archivo apaga ese bloque por sí solo. La anatomía del
 * archivo servido, el paso manual del panel y cómo comprobarlo están en
 * `docs/cloudflare-robots.md`.
 *
 * Lo que sí hace el grupo de ClaudeBot de acá: por RFC 9309, un rastreador
 * fusiona todos los grupos que aplican a su agente, y ante dos reglas de la
 * misma longitud gana la menos restrictiva. O sea que este `Allow: /` compite
 * de igual a igual con el `Disallow: /` gestionado en vez de quedar ignorado.
 * Es media entrega: la otra mitad es el toggle de Cloudflare.
 *
 * Los bloqueos del resto de rastreadores de IA (GPTBot, Google-Extended, CCBot,
 * Amazonbot, Applebot-Extended, Bytespider, meta-externalagent) viven en ese
 * bloque gestionado y son decisiones deliberadas de protección de contenido: no
 * se tocan. Se desbloquea ClaudeBot y nada más.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
