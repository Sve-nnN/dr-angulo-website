# Investigación técnica — Schema/SEO/Tracking/Booking

**Fecha:** 2026-07-31 · Fuentes: Context7 (Next.js, Resend), Google Search Central, schema.org, docs de Meta/GA4 (ver agente de research para links completos)

## 1. JSON-LD

- Un solo nodo `@type: Physician` (ya hereda de MedicalBusiness/LocalBusiness) en vez de combinar varios tipos. Usar patrón `@graph` con `@id` para conectar Physician + FAQPage en la misma estructura.
- `medicalSpecialty` es un enum cerrado sin valor para "traumatología"/"columna" → usar `["Musculoskeletal", "Surgical"]` + complementar con `knowsAbout` (texto libre: "Cirugía de columna", "Hernia discal", "Escoliosis", "Ortopedia infantil", etc.) — esto además ayuda a AI Overviews/GEO.
- Incluir: `address` (PostalAddress), `geo`, `openingHoursSpecification`, `telephone`, `priceRange`, `availableService` (MedicalProcedure/MedicalTherapy), `sameAs` (Instagram, Doctoralia), `hospitalAffiliation` (Clínica Montefiori).
- **FAQPage**: el rich result visual de Google fue descontinuado en 2026. Igual usar el schema (no penaliza) pero el valor real ahora es el contenido visible en la página, no el markup en sí.
- `aggregateRating`/`review` solo si son reseñas reales y verificables (YMYL — Google es estricto en salud). No inventar.
- `BreadcrumbList` si hay páginas de servicios separadas (recomendado a futuro).

## 2. SEO local en Next.js (App Router)

- `metadataBase` una vez en `app/layout.tsx`; `title.template` global + `title` específico por página.
- `alternates.canonical` por página, `openGraph` completo (1200x630, `locale: 'es_PE'`).
- `app/sitemap.ts` y `app/robots.ts` (Metadata API, no XML a mano).
- `next/image` con `priority` solo en la imagen hero; `next/font` (Poppins) self-hosted para evitar CLS.
- Scripts de terceros con `next/script` (`afterInteractive` para analytics, `lazyOnload` para widgets no críticos).
- Mayoría de páginas estáticas (SSG) — sitio de marketing sin datos por-request.
- `@vercel/speed-insights` + `@vercel/analytics` (gratis, complementa GA4).
- NAP (Nombre/Dirección/Teléfono) idéntico entre sitio, Google Business Profile y Doctoralia.

## 3. Tracking de conversión (requisito explícito del cliente)

- **GA4**: componente `<GoogleAnalytics gaId="G-XXXX" />` de `@next/third-parties/google` en el layout raíz. Enhanced Measurement ya trackea clics salientes pero sin diferenciar ubicación del CTA → evento custom `whatsapp_click` con parámetro `cta_location` (header/hero/floating_button/footer) disparado en el `onClick`, antes de navegar.
- **Meta Pixel**: `fbq('track', 'Contact')` en clic de WhatsApp, `fbq('track', 'Lead')` en envío de formulario. No se trackea solo, hay que instrumentarlo a mano igual que GA4.
- Marcar `whatsapp_click` y `generate_lead`/`form_submit` como conversión en GA4 Admin.
- gtag directo + Meta Pixel es suficiente para este tamaño de proyecto — no hace falta GTM (reconsiderar solo si más adelante quiere agregar Google Ads/TikTok Pixel sin depender de deploys).
- Server-side (Measurement Protocol / Conversions API) queda para una fase futura si corre campañas pagas serias — no bloquea v1.
- Ambos IDs (GA_ID, META_PIXEL_ID) vía variables de entorno — si no están configuradas, los componentes simplemente no renderizan (nunca un tag roto).
- **Pendiente validar con Juan/doctor**: aviso de cookies/consentimiento antes de cargar GA4/Meta Pixel — Perú tiene Ley de Protección de Datos Personales. Se incluye banner simple + página de privacidad por buena práctica mientras se confirma si hace falta algo más formal.

## 4. Booking/contacto simple

- Botón flotante de WhatsApp: `<a>` real (no modal), `href="https://wa.me/51964305682?text=..."`, `target="_blank" rel="noopener noreferrer"`, mensaje prellenado corto y distinto según la sección de origen.
- Formulario de contacto: dos canales en paralelo, no excluyentes:
  1. Server Action → Resend (email al doctor + confirmación al paciente) — requiere dominio verificado para producción; con subdominio `.vercel.app` se puede usar el remitente de pruebas de Resend mientras tanto.
  2. Fallback siempre visible: botón de WhatsApp con los datos del formulario prellenados.
- Campos mínimos: nombre, teléfono, motivo de consulta. Validación server-side (zod), honeypot anti-spam.
- Feedback inmediato en la misma página (sin redirect), con botón de WhatsApp también en la pantalla de "gracias".

## Decisiones de implementación derivadas

- `@next/third-parties/google` para GA4, `next/script` para Meta Pixel, ambos gateados por env vars.
- Componente `<WhatsAppCta location="..." message="..." />` reutilizable que dispara `gtag` + `fbq` en `onClick`.
- `app/components/structured-data.tsx` con el JSON-LD `@graph` (Physician + FAQPage), importado en `app/layout.tsx`.
