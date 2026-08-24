---
phase: 16-alineaci-n-de-contenido-enlazado-y-schema
plan: 01
subsystem: contenido
tags: [slugs, redirects, seo]
requires: []
provides: ["/blog/ciatica", "/blog/cirugia-de-columna", "postCiatica", "postCirugiaDeColumna"]
affects: [src/content/blog, next.config.ts, scripts/check-content.mjs]
tech-stack:
  added: []
  patterns: ["redirects() con permanent: true (308) en next.config.ts"]
key-files:
  created: []
  modified:
    - src/content/blog/ciatica.ts
    - src/content/blog/cirugia-de-columna.ts
    - src/content/blog/index.ts
    - src/content/blog/lumbalgia.ts
    - src/content/blog/artrosis.ts
    - src/content/service-pages/hernia-discal.ts
    - src/content/service-pages/cirugia-minimamente-invasiva.ts
    - next.config.ts
    - scripts/check-content.mjs
decisions:
  - "Se usa permanent: true (308) y no statusCode: 301, para no partir el formato de las tres redirecciones ya existentes. Google consolida 308 igual que 301."
metrics:
  duration: ~25 min
  completed: 2026-08-24
status: complete
---

# Phase 16 Plan 01: Renombre de slugs del blog Summary

Los dos posts cuya URL anunciaba un tema distinto al que tratan pasan a `/blog/ciatica` y `/blog/cirugia-de-columna`, con las URLs viejas apagadas en un solo salto 308.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Renombre del post de ciática | `a4d1ece` | `git mv` a `src/content/blog/ciatica.ts`, export `postCiatica`, `slug: "ciatica"`, `updatedAt: "2026-08-24"` |
| 2. Renombre del post de cirugía | `75b45c8` | `git mv` a `src/content/blog/cirugia-de-columna.ts`, export `postCirugiaDeColumna` |
| 3. Redirecciones y MANIFEST | `7fb45ea` | dos entradas nuevas en `redirects()`, MANIFEST de la puerta al día |

## Verificación

- `npx tsc --noEmit`: 0
- `npm run build`: 0, prerenderiza las dos rutas nuevas
- `npm run content:check` y `npm run seo:check`: 0 las dos
- sitemap: 22 `<loc>`, `/blog/ciatica` y `/blog/cirugia-de-columna` presentes, cero apariciones de los slugs viejos
- `curl -sI` contra `npm run start`: las dos URLs viejas responden `308` con `location` al slug nuevo, y esa `location` responde `200`. Un solo salto, sin cadena.
- `grep -c "permanent: true" next.config.ts`: 5

## Deviations from Plan

**1. [Rule 1 - Bug] Una referencia al slug viejo que el plan no listó**

- **Found during:** Tarea 1
- **Issue:** `src/content/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber.ts` tenía un `outboundLink` hacia `/blog/5-sintomas-de-columna-que-no-debes-ignorar`. El `read_first` de la tarea 1 no lo nombraba, y el criterio de aceptación exige cero apariciones bajo `src/`.
- **Fix:** actualizado el `href` en el mismo commit del renombre.
- **Files modified:** el módulo que después la tarea 2 renombró a `cirugia-de-columna.ts`
- **Commit:** `a4d1ece`

**2. [Rule 3 - Blocking] El comentario de las redirecciones inflaba un conteo**

- **Found during:** Tarea 3
- **Issue:** el criterio `grep -c "permanent: true" next.config.ts` debía dar 5. El comentario explicativo citaba `` `permanent: true` `` en prosa y el conteo daba 6.
- **Fix:** reescrito el comentario para decir "se marca la redirección como permanente" sin citar el literal. El contenido explicativo no se perdió.
- **Commit:** `7fb45ea`

## Self-Check: PASSED
