---
phase: 04-contenido-seo-legal-y-publicaci-n
plan: 04-01
subsystem: blog-legal
tags: [blog, seo, legal, cookies]
provides:
  - Blog con 4 artículos educativos (listado + artículo individual, SSG)
  - Política de privacidad (/privacidad)
  - Banner de consentimiento de cookies gateando GA4/Meta Pixel
affects: ["04-02"]
tech-stack:
  added: []
  patterns: ["useSyncExternalStore para estado de consentimiento cross-tab", "generateStaticParams + generateMetadata por artículo de blog"]
key-files:
  created: [src/content/blog.ts, src/app/blog/page.tsx, "src/app/blog/[slug]/page.tsx", src/app/privacidad/page.tsx, src/components/cookie-consent-banner.tsx]
  modified: [src/components/analytics/analytics-scripts.tsx, src/app/layout.tsx, src/components/layout/footer.tsx, src/app/sitemap.ts]
key-decisions: ["Cookie consent con localStorage + useSyncExternalStore, sin librería de terceros", "/privacidad con robots noindex"]
duration: ~40min
completed: 2026-07-31
status: complete
---

# Phase 4 Plan 04-01: Blog + Política de Privacidad + banner de cookies Summary

**4 artículos de blog adaptados del contenido educativo real de Instagram del doctor, política de privacidad con 5 secciones, y banner de cookies que exige consentimiento explícito antes de cargar GA4/Meta Pixel.**

## Performance
- **Duration:** ~40min
- **Tasks:** 3 (blog, privacidad, banner de cookies)
- **Files modified:** 9

## Accomplishments
- 4 artículos de blog (dolor de espalda, hernia discal vs. dolor muscular, miedo a la cirugía de columna, estenosis espinal), cada uno con ruta SSG y metadata propia vía `generateStaticParams`/`generateMetadata`
- Listado `/blog` y detalle `/blog/[slug]` con CTA de WhatsApp al final de cada artículo
- Política de privacidad (`/privacidad`) con 5 secciones (datos recopilados, contacto por WhatsApp, cookies/analítica, derechos bajo la Ley N.º 29733, contacto), `robots: { index: false }`, enlazada desde el footer
- Banner de consentimiento de cookies sobre store en `localStorage` (`useSyncExternalStore`) — `analytics-scripts.tsx` ahora exige `consent === "granted"` además de las env vars
- `sitemap.ts` actualizado con una entrada por artículo de blog

## Task Commits
1. **Blog + privacidad + banner de cookies** - `88b397d`

## Files Created/Modified
- `src/content/blog.ts` - 4 posts (slug/title/description/date/paragraphs)
- `src/app/blog/page.tsx` / `src/app/blog/[slug]/page.tsx` - Listado + artículo individual (SSG)
- `src/app/privacidad/page.tsx` - Política de privacidad
- `src/components/cookie-consent-banner.tsx` - Banner de consentimiento
- `src/components/analytics/analytics-scripts.tsx` - Gate de consentimiento añadido sobre el gate de env vars de Phase 3
- `src/components/layout/footer.tsx` - Link a /privacidad

## Decisions & Deviations
Ninguna — sigue el plan según ROADMAP.md Phase 4.

## Next Phase Readiness
Listo para 04-02 (QA + deploy) — contenido y legal completos, sin bloqueantes de código.

---
**Nota:** SUMMARY retroactivo (backfill de tracking GSD), scoped a este plan desde `04-SUMMARY.md` para satisfacer el matching plan→summary de gsd-tools. El trabajo real se construyó y verificó en la sesión original del 2026-07-31.
