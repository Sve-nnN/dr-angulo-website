---
phase: 01-fundaci-n-t-cnica-y-de-marca
plan: 01-02
subsystem: frontend-foundation
tags: [nextjs, layout, whatsapp, favicon]
provides:
  - Layout global (Header, Footer, WhatsAppFloatButton)
  - Logo real del doctor en header y favicon
affects: ["02-p-ginas-core-y-trayectoria"]
tech-stack:
  added: [lucide-react]
  patterns: ["Layout compartido vía src/app/layout.tsx", "site-config centralizado"]
key-files:
  created: [src/app/layout.tsx, src/components/layout/header.tsx, src/components/layout/footer.tsx, src/components/layout/whatsapp-float-button.tsx, src/lib/site-config.ts, src/app/icon.png, src/app/apple-icon.png]
  modified: []
key-decisions: ["Logo: recorte de captura de Instagram (mejor fuente disponible) — reemplazar si el doctor comparte el archivo vectorial original"]
duration: ~25min
completed: 2026-07-31
status: complete
---

# Phase 1 Plan 01-02: Layout global Summary

**Header responsive, Footer con NAP y botón flotante de WhatsApp con tracking, presentes en todas las páginas del sitio, con el logo real del doctor como favicon.**

## Performance
- **Duration:** ~25min
- **Tasks:** 3 (root layout + site-config, Header/Footer/WhatsApp flotante, logo/favicon)
- **Files modified:** 7

## Accomplishments
- Root layout (`layout.tsx`) con metadata base, fuentes, gate de analytics/JSON-LD, y `site-config.ts` centralizando datos del doctor (nombre, teléfono, dirección, redes)
- Header responsive (nav desktop + menú móvil) y Footer con NAP
- Botón flotante de WhatsApp con mensaje prellenado y tracking `whatsapp_click`
- Logo del doctor integrado en Header y como favicon/apple-icon

## Task Commits
1. **Layout global** - `88b397d`

## Files Created/Modified
- `src/app/layout.tsx` - Metadata base, fuentes, JSON-LD gate, analytics gate
- `src/components/layout/header.tsx` - Nav desktop + menú móvil
- `src/components/layout/footer.tsx` - NAP + redes
- `src/components/layout/whatsapp-float-button.tsx` - Botón flotante con tracking
- `src/lib/site-config.ts` - Config centralizada del sitio

## Decisions & Deviations
Logo es un recorte de una captura de Instagram (buena calidad pero no el archivo vectorial original) — si el doctor comparte el PNG/SVG fuente, conviene reemplazarlo. No bloqueante.

## Next Phase Readiness
Listo para Phase 2 — layout y tokens disponibles para todas las páginas de contenido.

---
**Nota:** SUMMARY retroactivo (backfill de tracking GSD) — split desde `01-SUMMARY.md` para satisfacer el matching plan→summary de gsd-tools. El trabajo real se construyó y verificó en la sesión original del 2026-07-31.
