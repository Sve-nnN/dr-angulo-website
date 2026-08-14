import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Portadas de los reels: Instagram las sirve desde su CDN con URLs firmadas
    // que caducan, por eso el feed se revalida cada hora.
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
  /**
   * Cabeceras de seguridad en toda respuesta del sitio (AUD-08).
   *
   * `/:path*` cubre la portada y todo lo anidado, incluido `/public`: las
   * cabeceras se evalúan antes que el sistema de archivos.
   *
   * Falta a propósito `Content-Security-Policy` en modo enforce. El sitio carga
   * la fuente y los mapas de Google, el pixel de Meta, GA4 y las portadas de
   * los reels desde el CDN de Instagram, y una política mal calibrada rompe
   * producción en silencio, que es peor que no tenerla. Para calibrarla hace
   * falta: (1) levantarla primero como `Content-Security-Policy-Report-Only`
   * con un endpoint que recoja los reportes, (2) dejarla correr con tráfico
   * real el tiempo suficiente para ver los orígenes que aparecen de verdad, y
   * (3) recién ahí pasarla a enforce. Es trabajo de una tarea propia, no un
   * agregado de esta.
   *
   * Cloudflare está delante del origen y puede filtrar o reescribir cabeceras.
   * Que estas salgan del origen no garantiza que lleguen al navegador: eso se
   * comprueba con `curl -sI` contra producción después del deploy.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            // Solo directivas que los navegadores reconocen hoy. Una directiva
            // obsoleta ensucia la consola sin proteger nada. El sitio no usa
            // ninguna de estas cuatro APIs: los mapas van como enlace externo,
            // no embebidos pidiendo ubicación.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Renombre decidido en la fase 14 de v1.2: la guía pasó de /servicios/escoliosis
      // a /servicios/escoliosis-y-deformidades y la URL vieja ya estaba indexada.
      {
        source: "/servicios/escoliosis",
        destination: "/servicios/escoliosis-y-deformidades",
        permanent: true,
      },
      // Los dos posts que las guías absorbieron entero (D-07 de la fase 14 de
      // v1.2). El destino publica el material desde los planes 08-06 y 08-07:
      // ese orden es la condición para que la redirección no entierre nada.
      {
        source: "/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos",
        destination: "/servicios/hernia-discal",
        permanent: true,
      },
      {
        source: "/blog/estenosis-espinal-que-es",
        destination: "/servicios/estenosis-espinal",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
