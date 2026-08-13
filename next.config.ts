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
    ];
  },
};

export default nextConfig;
