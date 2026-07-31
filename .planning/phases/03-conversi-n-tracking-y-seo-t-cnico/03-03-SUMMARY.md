---
phase: 03-conversi-n-tracking-y-seo-t-cnico
plan: 03-03
subsystem: seo-technical
tags: [json-ld, sitemap, robots, metadata]
provides:
  - JSON-LD Physician (sitewide) + FAQPage
  - sitemap.ts + robots.ts dinámicos + metadata por página
affects: ["04-01"]
tech-stack:
  added: []
  patterns: ["Metadata API nativa de Next.js (sitemap.ts/robots.ts)"]
key-files:
  created: [src/components/structured-data.tsx, src/app/sitemap.ts, src/app/robots.ts]
  modified: []
key-decisions: ["JSON-LD Physician sitewide, FAQPage solo con contenido real"]
duration: ~15min
completed: 2026-07-31
status: complete
---

# Phase 3 Plan 03-03: JSON-LD + sitemap + robots Summary

**JSON-LD `Physician` sitewide con dirección/geo/especialidades reales, `FAQPage` con las 9 preguntas reales; `sitemap.ts`/`robots.ts` nativos generando rutas de blog dinámicamente; metadata propia en las 8 páginas principales.**

## Performance
- **Duration:** ~15min
- **Tasks:** 1 (JSON-LD + sitemap/robots + metadata)
- **Files modified:** 3

## Accomplishments
- JSON-LD `Physician` sitewide (layout raíz) con dirección, geo y especialidades reales
- JSON-LD `FAQPage` en `/preguntas-frecuentes` con las preguntas reales del sitio (`src/content/faq.ts`)
- `sitemap.ts`/`robots.ts` nativos de la Metadata API — el sitemap genera las rutas de blog dinámicamente
- Metadata (`title`/`description`/`canonical`) propia en las 8 páginas principales, heredando Open Graph/Twitter del layout raíz
- Confirmado en build: `npm run build` genera `/sitemap.xml` y `/robots.txt`

## Task Commits
1. **JSON-LD + sitemap + robots + metadata** - `88b397d`

## Files Created/Modified
- `src/components/structured-data.tsx` - `PhysicianJsonLd` + `FaqJsonLd`
- `src/app/sitemap.ts` - Sitemap dinámico (estáticas + blog)
- `src/app/robots.ts` - Robots.txt con referencia al sitemap

## Decisions & Deviations
Ninguna — sigue el plan según ROADMAP.md Phase 3.

## Next Phase Readiness
`sitemap.ts` ya lee `src/content/blog` dinámicamente, así que los artículos que agrega Phase 4 aparecen solos sin tocar código.

---
**Nota:** SUMMARY retroactivo (backfill de tracking GSD), scoped a este plan desde `03-SUMMARY.md` para satisfacer el matching plan→summary de gsd-tools. El trabajo real se construyó y verificó en la sesión original del 2026-07-31.
