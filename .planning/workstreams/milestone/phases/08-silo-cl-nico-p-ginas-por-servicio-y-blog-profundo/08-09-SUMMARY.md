---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 09
subsystem: content
tags: [nextjs, react, contentbody, home, refactor]

requires:
  - phase: 08-05
    provides: modelo de secciones planas con id/level, ServicePage.bannerAfterSectionId
  - phase: 08-06, 08-07, 08-08
    provides: tres páginas de servicio ya migradas al nuevo modelo, patrón de referencia
provides:
  - "ContentBody y ContentBodyBoundary en src/components/content/content-body.tsx: el único renderizador de cuerpo largo para guías, posts y ahora home"
  - "src/content/static-pages/home.ts: 21 secciones del cuerpo de inicio, transcritas literal del paquete on-page de v1.2"
  - "El inicio (/) publica 1697 palabras de cuerpo verificado, sin tocar los 7 módulos de marketing existentes (hero, categorías, sedes, credenciales, reseñas, reels, CTA de cierre)"
affects: [08-16 hub de servicios, 08-15 escoliosis, fase 10 metadata]

tech-stack:
  added: []
  patterns:
    - "data-content-body vive en un solo archivo (content-body.tsx), así que la puerta de contenido inspecciona el mismo marcado en cualquier superficie que use ContentBody"
    - "ContentBodyBoundary envuelve ContentBody para dar el punto de inserción del banner (flushFirstSection) sin que cada página reimplemente el layout"

key-files:
  created:
    - src/components/content/content-body.tsx
    - src/content/static-pages/types.ts
    - src/content/static-pages/home.ts
  modified:
    - src/app/servicios/[slug]/page.tsx
    - src/app/blog/[slug]/page.tsx
    - src/app/page.tsx

key-decisions:
  - "El refactor de ContentBody y la publicación del copy de home se separaron en dos commits (21a4287, eb248bb): el primero no cambia ningún byte de HTML observable en las páginas ya publicadas, el segundo sí — separarlos deja un punto de rollback limpio si algo del copy de home necesitara revisarse sin tocar el renderizador."
  - "El gate de contenido (scripts/check-content.mjs) NO incluye `/` en su MANIFEST — el plan no lo pedía; en su lugar exige que el conteo de palabras de home supere 1500 medido con la misma lógica que usa la puerta. Verificado en 1697."

requirements-completed: [SVC-05]

coverage:
  - id: D1
    description: "ContentBody extraído como único renderizador de cuerpo largo, sin cambiar el HTML de las páginas de servicio y blog ya publicadas"
    requirement: "SVC-05"
    verification:
      - kind: other
        ref: "node scripts/check-content.mjs — mismos 8/8 PASA con los mismos conteos de palabras que antes del refactor (2808/2723/2164/1814 servicios; 1093/980/1091/1110 posts)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Home publica el cuerpo de texto aprobado del paquete de v1.2 (21 secciones, 1697 palabras) sin alterar los 7 módulos de marketing existentes"
    requirement: "SVC-05"
    verification:
      - kind: other
        ref: "git show eb248bb -- src/app/page.tsx: +37/-0 líneas, cero eliminaciones sobre el archivo existente"
        status: pass
      - kind: other
        ref: "conteo de palabras del bloque data-content-body en .next/server/app/index.html, medido con el mismo criterio que scripts/check-content.mjs"
        status: pass
    human_judgment: true
    rationale: "El copy es transcripción del paquete aprobado por el doctor, pero que el texto se lea bien integrado con los 7 módulos de marketing de home (que no pasan por ninguna puerta automática) es juicio visual, no algo que un test pueda certificar."

duration: ~50min (con una continuación tras corte por límite de sesión)
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 09: ContentBody compartido y el cuerpo de texto del inicio Summary

**Un solo renderizador de cuerpo largo (`ContentBody`) para guías, posts y home, más 1697 palabras de copy aprobado publicadas en `/` sin tocar ningún módulo de marketing existente.**

## Performance

- **Duration:** ~50 min (una sesión murió por límite de uso a mitad de ejecución; esta continuación verificó el estado real en disco, corrió las puertas y cerró el plan)
- **Completed:** 2026-08-13
- **Tasks:** 2 (refactor de ContentBody, publicación del copy de home)
- **Files modified:** 6 (3 creados, 3 modificados)

## Accomplishments

- `ContentBody` y `ContentBodyBoundary` extraídos a `src/components/content/content-body.tsx`: la lógica de secciones, anclas y jerarquía que antes vivía duplicada en la plantilla de servicios y en la de blog ahora se escribe una sola vez.
- `/servicios/[slug]/page.tsx` y `/blog/[slug]/page.tsx` migradas a `ContentBody` sin cambiar un byte de su HTML observable: `scripts/check-content.mjs` sigue dando los mismos ocho PASA con los mismos conteos de palabras que tenían antes del refactor.
- El inicio (`/`) gana un cuerpo de texto de 21 secciones, 1697 palabras, transcrito literal desde `.planning/workstreams/seo-keywords/milestones/v1.2-phases/15-paquete-on-page-por-url/paquetes/home.md`, insertado antes del CTA de cierre. Los siete módulos de marketing (hero, categorías, sedes, credenciales, reseñas, reels, CTA de cierre) no se tocaron: el diff de `page.tsx` es +37/-0.

## Task Commits

Cada tarea quedó en su propio commit:

1. **Task 1: extraer ContentBody** — `21a4287` (refactor)
2. **Task 2: cuerpo de texto del inicio** — `eb248bb` (feat)

## Files Created/Modified

- `src/components/content/content-body.tsx` - `ContentBody` y `ContentBodyBoundary`, el renderizador único de secciones con nivel/id/párrafos y el punto de inserción del banner de conversión
- `src/content/static-pages/types.ts` - Tipo `StaticPage` para páginas sin slug dinámico (hoy solo home)
- `src/content/static-pages/home.ts` - Las 21 secciones del cuerpo de inicio
- `src/app/servicios/[slug]/page.tsx` - Deja de duplicar la lógica de secciones, usa `ContentBody`
- `src/app/blog/[slug]/page.tsx` - Ídem
- `src/app/page.tsx` - Suma `<ContentBodyBoundary><ContentBody sections={homePage.sections} flushFirstSection /></ContentBodyBoundary>` antes del CTA de cierre, sin tocar nada existente

## Decisions Made

- Separar el refactor (commit 1, cero cambio de HTML) de la publicación de contenido (commit 2, todo el cambio de HTML) para que un rollback de home no tuviera que revertir también el renderizador compartido que las otras páginas ya empezaron a usar.
- No agregar `/` al `MANIFEST` de `scripts/check-content.mjs`: el plan no lo pedía y el criterio de aceptación real era el conteo de palabras (≥1500), no que la puerta cubra la ruta. Queda como decisión abierta para un plan futuro si se quiere que home entre a esa puerta.

## Deviations from Plan

None - plan ejecutado según lo escrito. La única particularidad fue operativa, no de alcance: la sesión que ejecutó las dos tareas murió por límite de uso de la cuenta después de que ambos commits ya estaban en el árbol; esta continuación verificó el estado real (build, tsc, lint, ambas puertas de contenido) contra lo ya commiteado en vez de rehacer trabajo, y escribió el cierre (este SUMMARY + STATE + ROADMAP) que había quedado pendiente.

## Issues Encountered

Ninguno de código. El único punto de atención fue de proceso: verificar cuidadosamente que los dos commits (`21a4287`, `eb248bb`) representaban trabajo completo y correcto antes de cerrar el plan, dado el patrón de cortes por límite de sesión que viene repitiéndose en esta fase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`ContentBody` queda disponible para 08-16 (hub de servicios, que según el plan original también lo necesita) y para cualquier página estática futura vía el patrón `StaticPage`. El silo clínico sigue en la ola 2: quedan 08-10 y 08-11 (los dos posts que se reescriben) antes de pasar a la ola 3 (08-15, escoliosis).

---
*Phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo*
*Completed: 2026-08-13*
