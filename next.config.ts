import type { NextConfig } from "next";

/**
 * Política en modo report-only (MEAS-02). Una sola línea, como la sirve el
 * navegador. La justificación directiva por directiva está en
 * `docs/content-security-policy.md`.
 *
 * Se declaran las dos formas de reporte a propósito: `report-to` es la moderna
 * y `report-uri` la que todavía entienden los navegadores sin Reporting API.
 * Una sola de las dos deja huecos justo en la etapa donde la cobertura es todo
 * el objetivo.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.cdninstagram.com https://*.fbcdn.net https://www.googletagmanager.com https://www.facebook.com",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
  "frame-src https://www.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
].join("; ");

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
   * Falta a propósito `Content-Security-Policy` en modo enforce, y sigue
   * faltando. El sitio carga los mapas de Google, el pixel de Meta, GA4 y las
   * portadas de los reels desde el CDN de Instagram, y una política mal
   * calibrada rompe producción en silencio, que es peor que no tenerla. El plan
   * para calibrarla era de tres pasos y va por el primero:
   *
   *   (1) Hecho (MEAS-02). Abajo se sirve `Content-Security-Policy-Report-Only`
   *       con `Reporting-Endpoints`, y `src/app/api/csp-report/route.ts` recoge
   *       los reportes. Report-only no bloquea nada: solo avisa.
   *   (2) En curso. Necesita días de tráfico real y no se puede acelerar.
   *   (3) Pendiente, con fecha de revisión el 2026-09-15.
   *
   * Todo lo demás vive en `docs/content-security-policy.md`: el inventario de
   * orígenes que justifica cada directiva, por qué la política no usa nonce
   * —el nonce exige renderizado dinámico en esta versión de Next y eso apagaría
   * el prerenderizado de las 23 rutas—, qué protección deja fuera esa decisión,
   * y el procedimiento de enforce paso a paso. No dupliques nada de eso acá.
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
          {
            // Report-only: el navegador evalúa y avisa, no bloquea. Cada
            // directiva sale de una entrada del inventario de
            // `docs/content-security-policy.md`; ninguna entra por si acaso.
            //
            // `frame-ancestors` va en 'self' para no contradecir el
            // `X-Frame-Options: SAMEORIGIN` de arriba. `frame-src` existe por
            // el iframe del mapa de /contacto. `'unsafe-inline'` es la
            // consecuencia de no usar nonce, y su costo está escrito en el doc.
            key: "Content-Security-Policy-Report-Only",
            value: CSP_REPORT_ONLY,
          },
          {
            // El nombre `csp-endpoint` tiene que ser idéntico al que nombra la
            // directiva `report-to` de la política. Si no coinciden, todo
            // parece correcto y no llega ni un reporte.
            key: "Reporting-Endpoints",
            value: 'csp-endpoint="https://drangulocolumna.com/api/csp-report"',
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
      // Renombre de la fase 16 de v1.3: los dos posts trataban de ciática y de
      // cirugía de columna, pero la URL anunciaba otra cosa. Ninguna de las dos
      // estaba indexada cuando se renombraron, así que el cambio no arrastra
      // posicionamiento. Se marca la redirección como permanente (308 en esta
      // versión de Next, que Google consolida igual que un 301) y no con un
      // `statusCode` explícito de 301, para no partir el formato de las tres
      // redirecciones de arriba.
      {
        source: "/blog/5-sintomas-de-columna-que-no-debes-ignorar",
        destination: "/blog/ciatica",
        permanent: true,
      },
      {
        source: "/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber",
        destination: "/blog/cirugia-de-columna",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
