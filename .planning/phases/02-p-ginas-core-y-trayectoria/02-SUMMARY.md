---
phase: 02-p-ginas-core-y-trayectoria
plan: "02-01 a 02-03"
subsystem: content-pages
tags: [nextjs, content, cv, seo-content]
provides:
  - Home con hero, 3 especialidades y CTA WhatsApp visible sin scroll
  - Página de Servicios con 3 categorías ancladas y sus condiciones tratadas
  - Página de Testimonios con reseñas verificables
  - Página de Preguntas Frecuentes con objeciones propias de cirugía de columna
  - Página "Sobre el doctor" con CV estructurado (formación, experiencia, CMP/RNE)
affects: ["03-conversi-n-tracking-y-seo-t-cnico", "04-contenido-seo-legal-y-publicaci-n"]
tech-stack:
  added: []
  patterns: ["Contenido como datos tipados en src/content/*.ts, separado de la UI", "Slugs ancladables por categoría de servicio (/servicios#slug)"]
key-files:
  created: [src/app/page.tsx, src/app/servicios/page.tsx, src/app/testimonios/page.tsx, src/app/preguntas-frecuentes/page.tsx, src/app/sobre-el-doctor/page.tsx, src/content/services.ts, src/content/testimonials.ts, src/content/faq.ts, src/content/cv.ts]
  modified: []
key-decisions: ["Solo contenido verificable (testimonios y CV) — nada inventado, con comentarios explícitos en el código señalando dónde ampliar", "FAQ con 9 preguntas que incluyen objeciones específicas de cirugía de columna (miedo, recuperación), no solo dudas logísticas"]
duration: ~1h
completed: 2026-07-31
status: complete
---

# Phase 2: Páginas core y trayectoria Summary

**Las 5 páginas de contenido principal del sitio están completas con copy real: Home, Servicios, Testimonios, Preguntas Frecuentes y Sobre el doctor con CV estructurado.**

## Performance
- **Duration:** ~1h
- **Tasks:** 3 plans (Home / Servicios+Testimonios+FAQ / Sobre el doctor), 8 tasks en total
- **Files modified:** 9

## Accomplishments
- Home con hero (CTA WhatsApp + 3 especialidades visibles sin scroll), sección de especialidades, sección de credibilidad, previews de testimonios y FAQ enlazando a sus páginas completas
- Página de Servicios con 3 categorías ancladas (`#columna`, `#traumatologia`, `#ortopedia-infantil`) y sus condiciones tratadas
- Página de Testimonios con reseñas verificables (sin citas inventadas) y link al perfil de Doctoralia
- Página de Preguntas Frecuentes con 9 preguntas, incluidas objeciones de cirugía de columna (miedo a operarse, tiempo de recuperación)
- Página "Sobre el doctor" con biografía, colegiatura CMP 83189 / RNE 35310, timeline de formación y experiencia, y nota explícita de que la sección se ampliará con el CV completo

## Task Commits
1. **Home, Servicios, Testimonios, FAQ, Sobre el doctor + contenido** - `88b397d`

## Files Created/Modified
- `src/app/page.tsx` - Home (hero, especialidades, credibilidad, previews de testimonios/FAQ)
- `src/app/servicios/page.tsx` - Servicios/condiciones por categoría, con anclas
- `src/app/testimonios/page.tsx` - Testimonios
- `src/app/preguntas-frecuentes/page.tsx` - FAQ (acordeón `details`/`summary`)
- `src/app/sobre-el-doctor/page.tsx` - Trayectoria/CV
- `src/content/services.ts` - 3 categorías de servicio (columna, traumatología, ortopedia infantil)
- `src/content/testimonials.ts` - Testimonios verificables + link a Doctoralia
- `src/content/faq.ts` - 9 preguntas frecuentes
- `src/content/cv.ts` - Formación, experiencia y colegiatura (CMP/RNE)

## Next Phase Readiness
Listo para Phase 3 — las páginas de contenido ya existen y son el destino de los CTAs de WhatsApp que Phase 3 instrumenta con tracking (`whatsapp_click`), y el contenido de FAQ es la base de datos para el JSON-LD `FAQPage` de Phase 3.
