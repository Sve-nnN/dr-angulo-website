# Phase 3: Conversión, tracking y SEO técnico - Context

**Gathered:** 2026-07-31
**Status:** Ready for planning
**Mode:** Auto-generated (ejecución directa en modo autónomo, sin discuss interactivo)

<domain>
## Phase Boundary

Toda interacción de contacto (WhatsApp o formulario) funciona y queda medida — GA4/Meta Pixel gateados por variable de entorno y por consentimiento de cookies — y el sitio es técnicamente indexable: sitemap, robots.txt, metadata por página y datos estructurados (JSON-LD Physician + FAQPage) correctos.

</domain>

<decisions>
## Implementation Decisions

- Formulario de contacto vía Server Action de Next.js (`"use server"`) en vez de una API route separada, con validación server-side vía Zod (`name`, `phone`, `reason` obligatorios; `email` opcional pero validado si se llena).
- Resend gateado por `RESEND_API_KEY`: si no está configurada, `src/lib/resend.ts` exporta `resend = null` y el Server Action simplemente omite el envío de email sin fallar — el usuario siempre ve la pantalla de éxito con la opción "Continuar por WhatsApp" y su mensaje ya armado. Esto cubre CONTACT-04 (fallback a WhatsApp) tanto si Resend no está configurado como si el envío falla en producción (el `try/catch` en `contact.ts` absorbe el error sin bloquear el éxito).
- Honeypot anti-spam (campo oculto `company`) en vez de CAPTCHA — si un bot lo rellena, se responde "éxito" sin enviar nada, para no revelarle al bot por qué fue rechazado. Prioriza cero fricción para el paciente real.
- Tracking 100% client-side: GA4 vía `@next/third-parties/google` (`<GoogleAnalytics gaId={...} />`) y Meta Pixel vía snippet manual con `next/script`. Sin tracking server-side (Measurement Protocol / Conversions API) — quedó fuera de alcance como v2 (`FUT-04` en REQUIREMENTS.md).
- Doble gate para analytics: (1) variable de entorno (`NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID`) y (2) consentimiento de cookies almacenado en `localStorage` y leído vía `useSyncExternalStore`. Si falta cualquiera de los dos, no se monta ningún script de analítica.
- Un solo evento de clic a WhatsApp (`whatsapp_click`) parametrizado por la dimensión `cta_location` (`header`, `hero`, `floating_button`, `services`, `footer`, `contact_page`) en vez de eventos distintos por ubicación — más simple de segmentar en un solo reporte de GA4.
- JSON-LD `Physician` se renderiza una sola vez, sitewide, en el layout raíz (no por página) porque describe al médico, no una página específica. `FAQPage` solo se renderiza en `/preguntas-frecuentes`, con el contenido real de `src/content/faq.ts` (no duplicado ni inventado). Se implementaron como dos bloques `<script type="application/ld+json">` independientes en vez de un único `@graph` combinado — ambos son igualmente válidos para Google/Schema.org, pero es una desviación menor del texto literal de SEO-03.
- `sitemap.ts` y `robots.ts` nativos de la Metadata API de Next.js (no archivos XML estáticos) — el sitemap genera las rutas del blog dinámicamente a partir de `src/content/blog`, así que no hace falta tocarlo cuando se agreguen artículos nuevos.

</decisions>

<code_context>
## Existing Code Insights

- Construye directamente sobre `src/lib/site-config.ts` (Phase 1): `whatsappUrl()`, `whatsappMessages`, el tipo `CtaLocation` y los datos de `clinic` (Clínica Montefiori, dirección, coordenadas) ya existían y se reutilizan tal cual, sin duplicar datos ni hardcodear strings nuevos.
- Las páginas de contenido de Phase 2 (`servicios`, `testimonios`, `sobre-el-doctor`, `preguntas-frecuentes`, home) ya renderizaban botones de WhatsApp; esta fase es la que les agrega tracking real — antes de `trackWhatsAppClick` en `lib/tracking.ts`, esos botones abrían WhatsApp sin medir nada.
- El banner de cookies que efectivamente llama a `setStoredConsent("granted" | "denied")` (`src/components/cookie-consent-banner.tsx`) no es parte de esta fase — corresponde a `LEGAL-02` en Phase 4. Esta fase deja listo el store de consentimiento (`consent.ts`, default `null` = sin otorgar) para que Phase 4 solo tuviera que construir la UI encima.

</code_context>

<specifics>
## Specific Ideas

Ver `.planning/research/SEO-TRACKING.md` para el research original de JSON-LD/GA4/Meta Pixel/sitemap que fundamentó estas decisiones.

</specifics>

<deferred>
## Deferred Ideas

- Tracking server-side (GA4 Measurement Protocol / Meta Conversions API) — v2, ver `FUT-04` en REQUIREMENTS.md.
- JSON-LD combinado en un único `@graph` — quedó como dos scripts independientes (ver Implementation Decisions); no se considera necesario reabrirlo porque ambos formatos son válidos para los validadores de structured data.

</deferred>
