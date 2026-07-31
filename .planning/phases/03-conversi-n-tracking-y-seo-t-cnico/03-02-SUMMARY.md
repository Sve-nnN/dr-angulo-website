---
phase: 03-conversi-n-tracking-y-seo-t-cnico
plan: 03-02
subsystem: tracking
tags: [ga4, meta-pixel, whatsapp-tracking, consent]
provides:
  - Evento whatsapp_click (cta_location) en los 6 puntos de contacto de WhatsApp del sitio
  - Evento generate_lead/form_submit al enviar el formulario de contacto
  - GA4 + Meta Pixel gateados por env var y por consentimiento de cookies
affects: ["03-01", "04-01"]
tech-stack:
  added: ["@next/third-parties@^16.2.12"]
  patterns: ["Gate doble env var + consentimiento (useSyncExternalStore)"]
key-files:
  created: [src/lib/tracking.ts, src/components/ui/whatsapp-cta.tsx, src/components/analytics/analytics-scripts.tsx, src/components/analytics/consent.ts]
  modified: [src/components/layout/whatsapp-float-button.tsx]
key-decisions: ["Doble gate de analytics: env var + consentimiento de cookies — ningún script de analítica carga sin ambos"]
duration: ~15min
completed: 2026-07-31
status: complete
---

# Phase 3 Plan 03-02: Tracking GA4 + Meta Pixel + whatsapp_click Summary

**`trackWhatsAppClick`/`trackFormSubmit` cubriendo los 6 `cta_location` reales del sitio (header, hero, floating_button, services, footer, contact_page); GA4 y Meta Pixel con doble gate (env var + consentimiento de cookies).**

## Performance
- **Duration:** ~15min
- **Tasks:** 1 (tracking GA4/Meta Pixel + whatsapp_click)
- **Files modified:** 5

## Accomplishments
- `lib/tracking.ts` con `trackWhatsAppClick`/`trackFormSubmit`, los 6 valores de `cta_location` cubiertos por CTAs reales
- GA4 (`@next/third-parties/google`) + Meta Pixel montados vía `analytics-scripts.tsx`, con doble gate: variable de entorno Y consentimiento de cookies (`useSyncExternalStore` sobre `localStorage`)
- `whatsapp-float-button.tsx` (de Phase 1) extendido con el tracking real

## Task Commits
1. **Tracking GA4 + Meta Pixel + whatsapp_click** - `88b397d`

## Files Created/Modified
- `src/lib/tracking.ts` - `trackWhatsAppClick` / `trackFormSubmit`
- `src/components/ui/whatsapp-cta.tsx` - CTA de WhatsApp reutilizable con tracking
- `src/components/layout/whatsapp-float-button.tsx` - Tracking confirmado/extendido
- `src/components/analytics/analytics-scripts.tsx` - Monta GA4/Meta Pixel con doble gate
- `src/components/analytics/consent.ts` - Store de consentimiento sobre `localStorage`

## Decisions & Deviations
`NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_META_PIXEL_ID` aún no configuradas en producción — el mecanismo está implementado y gateado, verificado en su lógica; falta que Juan cree las cuentas y cargue las env vars en Vercel (ver STATE.md Pending Todos). No es un gap de código.

## Next Phase Readiness
`consent.ts` ya existe, así que Phase 4 solo necesitó construir la UI del banner de cookies.

---
**Nota:** SUMMARY retroactivo (backfill de tracking GSD), scoped a este plan desde `03-SUMMARY.md` para satisfacer el matching plan→summary de gsd-tools. El trabajo real se construyó y verificó en la sesión original del 2026-07-31.
