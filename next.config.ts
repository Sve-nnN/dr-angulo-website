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
};

export default nextConfig;
