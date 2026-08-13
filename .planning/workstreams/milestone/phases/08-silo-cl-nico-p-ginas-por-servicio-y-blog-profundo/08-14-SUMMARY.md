---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 14
subsystem: content
tags: [nextjs, redirects, sitemap, checkpoint]

requires:
  - phase: 08-06, 08-07
    provides: /servicios/hernia-discal y /servicios/estenosis-espinal publicando el material absorbido
  - phase: 08-15
    provides: el patrón de redirects() en next.config.ts
provides:
  - "Los dos posts absorbidos (hernia-discal-o-dolor-de-espalda-como-diferenciarlos, estenosis-espinal-que-es) 301 permanentes hacia sus guías destino, verificado con curl contra el build real"
  - "SITEMAP_TOTAL en 22 en las tres puertas (check-content.mjs, check-sedes.mjs, check-seo.mjs), el número final del silo"
  - "Cierra todo el cuerpo de contenido del silo clínico: 5 páginas de servicio, el hub, home y 6 posts de blog"
affects: [08-17, 08-18, 08-19]

tech-stack:
  added: []
  patterns:
    - "Verificación con curl -I contra npm run start antes de considerar un redirect cerrado, no solo lectura de next.config.ts"

key-files:
  modified:
    - next.config.ts
    - scripts/check-content.mjs
    - scripts/check-sedes.mjs
    - scripts/check-seo.mjs
    - src/content/blog/index.ts
    - src/content/service-pages/estenosis-espinal.ts
  deleted:
    - src/content/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos.ts
    - src/content/blog/estenosis-espinal-que-es.ts

key-decisions:
  - "El checkpoint bloqueante se resolvió con aprobación explícita de Juan tras revisar la evidencia de las 16 filas de material absorbido verificadas sobre el HTML construido, no solo sobre el código fuente."
  - "relatedPosts huérfano en estenosis-espinal.ts (todavía apuntaba al post que este mismo plan apaga) se corrigió como desviación Regla 3, documentada pero sin checkpoint adicional: es limpieza directa del criterio de aceptación (grep sin coincidencias sobre src/)."

requirements-completed: [BLOG-03]

coverage:
  - id: D1
    description: "Los dos posts absorbidos 301 permanentes hacia sus guías destino"
    requirement: "BLOG-03"
    verification:
      - kind: other
        ref: "curl -sI contra npm run start: /blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos → 308 location /servicios/hernia-discal; /blog/estenosis-espinal-que-es → 308 location /servicios/estenosis-espinal"
        status: pass
    human_judgment: true
    rationale: "El checkpoint bloqueante del plan exigía aprobación humana antes de escribir los 301 — decisión de negocio (transferir posicionamiento de dos URLs indexadas), no solo verificación técnica. Juan aprobó explícitamente tras revisar la evidencia de absorción completa."
  - id: D2
    description: "SITEMAP_TOTAL cierra en 22 en las tres puertas, sin URLs viejas en sitemap/blog/llms.txt"
    requirement: "BLOG-03"
    verification:
      - kind: other
        ref: "node scripts/check-content.mjs (9/9 PASA), check-sedes.mjs (4/4 PASA), check-seo.mjs (23 rutas, sin fallas)"
        status: pass
    human_judgment: false

duration: ~25min (Task 1 solo lectura + checkpoint + Task 2)
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 14: Cierre del silo — los dos 301 y el conteo final Summary

**Los dos posts que sus guías absorbieron entero (hernia discal, estenosis espinal) quedan 301 permanentes tras aprobación explícita de Juan, y el sitio cierra en 22 URLs — el número final de todo el trabajo de silo clínico de la fase.**

## Performance

- **Duration:** ~25 min (Task 1 de solo lectura, checkpoint bloqueante con aprobación de Juan, Task 2)
- **Completed:** 2026-08-13
- **Tasks:** 2 (verificación de absorción, redirects + conteo final)
- **Files modified:** 6 modificados, 2 eliminados

## Accomplishments

- Task 1 (solo lectura) verificó, sobre el HTML ya construido y no sobre el código TypeScript, que las 16 filas de material absorbido de los dos posts existen íntegras dentro de sus guías destino — 7 filas para hernia discal, 9 para estenosis espinal.
- Checkpoint bloqueante presentado a Juan con la evidencia completa y un servidor local corriendo para revisión directa; aprobado explícitamente.
- `next.config.ts` suma las dos redirecciones 301 al mismo array que ya tenía el renombre de escoliosis (08-15) — tres entradas en total, un solo mecanismo.
- `SITEMAP_TOTAL` baja de 24 a 22 en las tres puertas ejecutables (`check-content.mjs`, `check-sedes.mjs`, `check-seo.mjs`), el número con el que cierra todo el trabajo de contenido de la fase.
- Los dos módulos de post viejos se eliminaron y su import salió de `src/content/blog/index.ts`.

## Task Commits

1. **Task 1 + Task 2 (checkpoint intermedio sin commit propio, código en un solo commit tras la aprobación)** — `d1e22f5` (feat)

## Files Created/Modified

- `next.config.ts` - Suma las dos redirecciones 301 al array `redirects()`
- `scripts/check-content.mjs`, `scripts/check-sedes.mjs`, `scripts/check-seo.mjs` - `SITEMAP_TOTAL` 24→22, MANIFEST sin las dos rutas viejas
- `src/content/blog/index.ts` - Sin los imports de los dos posts eliminados
- `src/content/service-pages/estenosis-espinal.ts` - `relatedPosts` sin la referencia huérfana al post que este plan apaga
- `src/content/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos.ts`, `estenosis-espinal-que-es.ts` - Eliminados

## Decisions Made

- El checkpoint se resolvió con evidencia verificada sobre HTML construido, no sobre el código: la diferencia importa porque un import correcto no garantiza que el texto realmente aparezca en la página servida.
- Verificación final con `curl -I` contra `npm run start` real, no solo lectura de `next.config.ts` — confirma que Next.js interpreta la configuración como se espera, no solo que el archivo la declara.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Consistencia] `relatedPosts` huérfano en `estenosis-espinal.ts`**
- **Found during:** Task 1 (verificación previa al checkpoint)
- **Issue:** `src/content/service-pages/estenosis-espinal.ts` todavía listaba `estenosis-espinal-que-es` en `relatedPosts`, un post que este mismo plan elimina. El criterio de aceptación (grep sin coincidencias del slug viejo sobre todo `src/`) no se cumplía sin corregirlo.
- **Fix:** Se quitó la referencia de `relatedPosts`.
- **Files modified:** `src/content/service-pages/estenosis-espinal.ts`
- **Verification:** `grep -rn "estenosis-espinal-que-es" src/` sin coincidencias tras el fix.
- **Committed in:** `d1e22f5`

---

**Total deviations:** 1 auto-fixed (consistencia)
**Impact on plan:** Necesario para cumplir el propio criterio de aceptación del plan. Sin scope creep.

## Issues Encountered

Ninguno de código. El único punto de atención fue operativo: el servidor de verificación (`npm run start` en el puerto 3001) que el executor levantó para el checkpoint quedó corriendo después de que el checkpoint se resolvió, y un proceso de build previo quedó huérfano bloqueando `next build` momentáneamente — se limpiaron ambos sin tocar ningún archivo de código antes de cerrar el plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Todo el cuerpo de contenido del silo clínico queda cerrado: 5 páginas de servicio, el hub `/servicios`, home, y 6 posts de blog (2 reescritos en el lugar, 2 nuevos, 2 redirigidos). Quedan tres planes de la fase 8, todos fuera del silo: 08-17, 08-18 y 08-19, que cubren las 4 fichas de sede y `/preguntas-frecuentes` — las 5 URLs del paquete de v1.2 que ninguna fase de v1.1 tenía asignadas hasta que Juan decidió sumarlas a esta fase.

---
*Phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo*
*Completed: 2026-08-13*
