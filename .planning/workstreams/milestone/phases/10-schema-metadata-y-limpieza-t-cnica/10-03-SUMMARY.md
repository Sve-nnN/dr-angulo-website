---
phase: 10-schema-metadata-y-limpieza-t-cnica
plan: 03
subsystem: seo
tags: [nextjs, gate, seo, metadata]

requires:
  - phase: 10-01, 10-02
    provides: title/description del paquete v1.2 en las 22 rutas vivas, dentro de 60/155
provides:
  - "scripts/check-seo.mjs mide de verdad el largo de title y description en las 23 rutas del sitemap, con fallo real si algo excede 60/155"
  - "REQUIREMENTS.md: SEO-08 y SEO-09 en Complete en la tabla de trazabilidad"
affects: []

tech-stack:
  added: []
  patterns:
    - "La cuarta puerta deriva su lista de rutas del sitemap, no de una lista a mano — una ruta nueva entra sola a la medición"

key-files:
  modified:
    - scripts/check-seo.mjs
    - .planning/workstreams/milestone/REQUIREMENTS.md

key-decisions:
  - "El chequeo de largo estaba deliberadamente apagado en la corrida anterior de la fase 10 (nacería en rojo sobre 17 rutas, y Juan iba a reescribir los titles él mismo). Las dos razones caducaron: el paquete de v1.2 ya entregó títulos correctos para las 23 rutas, verificado por 10-01 y 10-02 antes de este plan."

requirements-completed: [SEO-08, SEO-09]

coverage:
  - id: D1
    description: "La puerta de SEO mide title y description reales de las 23 rutas y falla si alguna excede 60/155"
    requirement: "SEO-08"
    verification:
      - kind: other
        ref: "node scripts/check-seo.mjs: 23 rutas revisadas, 23 con title y description medidos, sin fallas. Title más largo 50/60 en /servicios/hernia-discal, description más larga 142/155 en la misma ruta"
        status: pass
    human_judgment: false

duration: ~15min (código commiteado por el executor; este cierre reconstruido tras verificación directa)
completed: 2026-08-13
status: complete
---

# Phase 10 Plan 03: La puerta de SEO mide el largo de verdad Summary

**`scripts/check-seo.mjs` deja de omitir el chequeo de 60/155 caracteres y lo aplica sobre las 23 rutas del sitemap, con las dos razones que lo tenían apagado ya resueltas por 10-01 y 10-02.**

## Performance

- **Duration:** ~15 min de ejecución real (commit `937050d` ya en el árbol al retomar); este cierre verificó el estado real (tsc, build, las tres puertas) y escribió la documentación que había quedado pendiente
- **Completed:** 2026-08-13
- **Tasks:** 2 (activar el chequeo de largo, corregir REQUIREMENTS.md)
- **Files modified:** 2

## Accomplishments

- `scripts/check-seo.mjs` mide title y description reales (HTML prerenderizado, no código fuente) en las 23 rutas que deriva del sitemap, y falla si alguna pasa de 60 o 155 caracteres.
- REQUIREMENTS.md: SEO-08 y SEO-09 en `Complete` en la tabla de trazabilidad, corrigiendo la fila de SEO-09 que seguía en `Pending` pese al trabajo ya cerrado en la corrida anterior de la fase.

## Task Commits

1. **Task 1: activar el chequeo de largo** — `937050d` (feat)
2. **Task 2: corregir REQUIREMENTS.md** — incluido en el mismo commit o en un ajuste directo del árbol (verificado en disco: SEO-08/SEO-09 ya en `Complete` al cerrar este plan)

## Files Created/Modified

- `scripts/check-seo.mjs` - Chequeo de 60/155 activado, deriva rutas del sitemap
- `.planning/workstreams/milestone/REQUIREMENTS.md` - SEO-08 y SEO-09 marcados `Complete`

## Decisions Made

Ninguna nueva — la decisión de fondo (activar el chequeo) ya estaba tomada por el plan; este cierre solo verificó que el resultado fuera correcto antes de documentarlo.

## Deviations from Plan

None - plan ejecutado según lo escrito. La única particularidad fue operativa: el código quedó commiteado sin el cierre de documentación (SUMMARY, STATE, ROADMAP); este cierre verificó el estado real contra el criterio de aceptación del plan antes de escribirlo.

## Issues Encountered

Ninguno. Verificación directa: `npx tsc --noEmit` limpio, `npm run build` verde, `check-content.mjs` (14 rutas), `check-sedes.mjs` (4 sedes) y `check-seo.mjs` (23 rutas, sin fallas) todos en verde.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Cierra toda la fase 10: SEO-05 a SEO-11 completos (los cinco primeros de una corrida anterior, SEO-08/09 de esta). Con esto cierra también todo el trabajo de v1.1 que consumía el paquete on-page de v1.2 — fases 8 y 10 completas. Quedan, fuera de este alcance: fase 7 (dominio/producción, estado parcial preexistente), fase 9 (sedes, ejecutada pero sin VERIFICATION.md) y fase 11 (Local SEO, no iniciada) — ninguna de las tres es territorio de este plan ni de esta sesión.

---
*Phase: 10-schema-metadata-y-limpieza-t-cnica*
*Completed: 2026-08-13*
