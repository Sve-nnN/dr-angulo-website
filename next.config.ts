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
