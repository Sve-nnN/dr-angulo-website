---
phase: 03-conversi-n-tracking-y-seo-t-cnico
plan: 03-03
subsystem: conversion-tracking-seo
tags: [server-actions, resend, ga4, meta-pixel, json-ld, sitemap, whatsapp-tracking]
provides:
  - Página de Contacto con mapa/dirección de Clínica Montefiori y formulario funcional (Server Action + Zod + Resend + fallback WhatsApp)
  - Evento whatsapp_click (cta_location) en los 6 puntos de contacto de WhatsApp del sitio
  - Evento generate_lead/Lead al enviar el formulario de contacto
  - GA4 + Meta Pixel gateados por env var y por consentimiento de cookies
  - JSON-LD Physician (sitewide) + FAQPage (preguntas frecuentes)
  - sitemap.ts + robots.ts dinámicos + metadata por página
affects: ["04-contenido-seo-legal-y-publicaci-n"]
tech-stack:
  added: ["resend@^6.18.1", "zod@^4.4.3", "@next/third-parties@^16.2.12"]
  patterns: ["Server Actions ('use server' + useActionState)", "Validación Zod server-side", "Gate doble env var + consentimiento (useSyncExternalStore)", "Metadata API nativa de Next.js (sitemap.ts/robots.ts)"]
key-files:
  created: [src/app/contacto/page.tsx, src/components/contact-form.tsx, src/app/actions/contact.ts, src/lib/resend.ts, src/lib/tracking.ts, src/components/ui/whatsapp-cta.tsx, src/components/analytics/analytics-scripts.tsx, src/components/analytics/consent.ts, src/components/structured-data.tsx, src/app/sitemap.ts, src/app/robots.ts]
  modified: [src/components/layout/whatsapp-float-button.tsx]
key-decisions: ["Resend gateado por env var con fallback silencioso a WhatsApp — el paciente nunca se queda sin salida", "Doble gate de analytics: env var + consentimiento de cookies", "JSON-LD Physician sitewide, FAQPage solo con contenido real"]
duration: ~50min
completed: 2026-07-31
status: complete
---

# Phase 3: Conversión, tracking y SEO técnico Summary

**Todo punto de contacto del sitio (WhatsApp o formulario) funciona y queda medido; el sitio es técnicamente indexable con sitemap, robots.txt y JSON-LD Physician/FAQPage.**

## Performance
- **Duration:** ~50min
- **Tasks:** 3 plans (contacto+formulario, tracking GA4/Meta Pixel, JSON-LD+sitemap/robots)
- **Files modified:** ~12

## Accomplishments
- Página `/contacto` con mapa embebido y dirección real de Clínica Montefiori + formulario con Server Action, validación Zod server-side y honeypot anti-spam
- Envío de formulario intenta email por Resend cuando `RESEND_API_KEY` está configurada (notificación al doctor + auto-respuesta al paciente); si no lo está, no falla — siempre ofrece continuar por WhatsApp con el mensaje ya armado
- `trackWhatsAppClick`/`trackFormSubmit` en `lib/tracking.ts` — los 6 valores de `cta_location` (`header`, `hero`, `floating_button`, `services`, `footer`, `contact_page`) cubiertos por CTAs reales en el sitio
- GA4 (`@next/third-parties/google`) + Meta Pixel con doble gate: variable de entorno Y consentimiento de cookies (`useSyncExternalStore` sobre `localStorage`) — ningún script de analítica carga sin ambos
- JSON-LD `Physician` sitewide (layout raíz) con dirección, geo y especialidades reales; JSON-LD `FAQPage` en `/preguntas-frecuentes` con las preguntas reales del sitio
- `sitemap.ts`/`robots.ts` nativos de la Metadata API — el sitemap genera las rutas de blog dinámicamente; confirmado en build (`npm run build` genera `/sitemap.xml` y `/robots.txt`)
- Metadata (`title`/`description`/`canonical`) propia en las 8 páginas principales, heredando Open Graph/Twitter del layout raíz

## Task Commits
1. **Contacto + tracking + SEO técnico** - `88b397d`

## Files Created/Modified
- `src/app/contacto/page.tsx` - Página de contacto (mapa, dirección, teléfono, formulario)
- `src/components/contact-form.tsx` - Formulario client component (useActionState, honeypot, pantalla de éxito)
- `src/app/actions/contact.ts` - Server Action con validación Zod y envío condicionado a Resend
- `src/lib/resend.ts` - Cliente Resend gateado por `RESEND_API_KEY`
- `src/lib/tracking.ts` - `trackWhatsAppClick` / `trackFormSubmit`
- `src/components/ui/whatsapp-cta.tsx` - CTA de WhatsApp reutilizable con tracking
- `src/components/layout/whatsapp-float-button.tsx` - Botón flotante (ya existía desde Phase 1; aquí se confirma/extiende su tracking)
- `src/components/analytics/analytics-scripts.tsx` - Monta GA4/Meta Pixel con doble gate
- `src/components/analytics/consent.ts` - Store de consentimiento sobre `localStorage`
- `src/components/structured-data.tsx` - `PhysicianJsonLd` + `FaqJsonLd`
- `src/app/sitemap.ts` - Sitemap dinámico (estáticas + blog)
- `src/app/robots.ts` - Robots.txt con referencia al sitemap

## Next Phase Readiness
Listo para Phase 4 (contenido SEO, legal y publicación): el sitemap ya lee `src/content/blog` dinámicamente, así que los artículos que agregue Phase 4 aparecen solos sin tocar código; el store de consentimiento (`consent.ts`) ya existe, así que Phase 4 solo necesitó construir la UI del banner de cookies (`LEGAL-02`) llamando a `setStoredConsent`; el footer ya enlaza a `/privacidad` (`LEGAL-01`). Pendiente fuera de código: Juan debe crear las cuentas de GA4/Meta Pixel/Resend y cargar esas env vars en Vercel — el mecanismo ya está listo y gateado, solo falta el valor real.
