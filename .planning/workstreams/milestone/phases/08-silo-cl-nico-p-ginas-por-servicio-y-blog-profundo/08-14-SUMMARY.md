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

## La tabla de absorción, las 16 filas

Criterio de aceptación de la Task 1: la comprobación se transcribe entera. Verificada sobre
`.next/server/app/servicios/*.html` antes de escribir una sola línea de configuración.

**`hernia-discal-o-dolor-de-espalda-como-diferenciarlos` → `/servicios/hernia-discal`, 7 filas**

| Bloque del post | Destino declarado | En el HTML |
|---|---|---|
| intro | `sintomas--diferencia-entre-lumbalgia-y-hernia-discal` | presente |
| `como-se-comporta-un-dolor-muscular` | `sintomas--diferencia-entre-lumbalgia-y-hernia-discal` | presente |
| `como-se-comporta-una-hernia-discal` | `sintomas--diferencia-entre-lumbalgia-y-hernia-discal` y `sintomas` | los dos presentes |
| `las-preguntas-que-lo-definen` | `sintomas--diferencia-entre-lumbalgia-y-hernia-discal` | presente |
| `senales-que-no-esperan` | `cuando-consultar` | presente |
| `cuando-dejar-de-esperar` | `cuando-consultar` | presente |
| `ctaBanner` sobre el dolor que baja por la pierna | `sintomas` | presente |

**`estenosis-espinal-que-es` → `/servicios/estenosis-espinal`, 9 filas, 8 con destino**

| Bloque del post | Destino declarado | En el HTML |
|---|---|---|
| intro | `que-es` | presente |
| `por-que-aparece-con-la-edad` | `causas` | presente |
| `la-senal-que-mas-orienta` | `sintomas` | presente |
| `como-se-siente-en-el-dia-a-dia` | `sintomas` | presente |
| `que-se-pregunta-en-la-consulta` | `diagnostico` | presente |
| `que-registrar-antes-de-la-cita` | `sin-operar--estenosis-espinal-cuidado-personal` y `cuando-consultar` | los dos presentes |
| `como-se-trata` | `sin-operar` y `sin-operar--tratamientos-de-la-estenosis-espinal` | los dos presentes |
| `ctaBanner` sobre caminar menos que antes | `cuando-consultar` | presente |
| remisiones a "la guía completa", dos veces | no se transcriben a propósito | correcto: la guía completa pasa a ser esa página y la remisión pierde destino. `grep "guía completa"` sobre el HTML devuelve 0 |

Once ids de destino distintos, todos vivos como ancla. Ninguna fila sin cubrir.

## Las dos respuestas literales

Contra el build recién hecho, servido en local:

```
GET /blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos
HTTP/1.1 308 Permanent Redirect
location: /servicios/hernia-discal

GET /blog/estenosis-espinal-que-es
HTTP/1.1 308 Permanent Redirect
location: /servicios/estenosis-espinal
```

Siguiendo la redirección las dos terminan en 200 sobre su guía. El 308 es lo que Next emite para
`permanent: true`; para el buscador equivale al 301 permanente que el paquete pide y el criterio
de aceptación admite las dos. La tercera redirección, la de 08-15, sigue en pie:
`/servicios/escoliosis` devuelve 308 hacia `/servicios/escoliosis-y-deformidades`.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run lint` | sin avisos |
| `npm run build` | verde |
| `node scripts/check-content.mjs` | sin fallas en 9 rutas |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| `node scripts/check-seo.mjs` | sin fallas, 23 rutas revisadas, 23 con Open Graph propia, `/llms.txt` con 161 líneas |
| Redirecciones declaradas en `next.config.ts` | 3, las tres del handoff |
| `grep -c "SITEMAP_TOTAL = 22"` en las tres puertas | 1 en cada una |
| `<loc>` en el sitemap prerenderizado | 22, cero coincidencias con las dos URLs apagadas |
| Listado `/blog` | cuatro posts |
| `/llms.txt` | cero coincidencias con las dos URLs apagadas |
| `grep -rn` de los dos slugs sobre `src/` y `scripts/` | cero líneas |
| Borrados en el commit | los dos módulos de post, intencionales |

## Known Stubs

Ninguno.

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

Ninguno de código, pero sí un falso negativo de la verificación que vale registrar.

Con `next.config.ts` ya escrito y el build ya hecho, la primera corrida de curl devolvió **200 en las dos rutas**, como si la redirección no existiera. La causa no era la regla: el servidor que se había levantado para el checkpoint seguía escuchando el puerto y respondía con el manifiesto de rutas y la configuración de redirecciones que había cargado al arrancar, antes del cambio. Un `pkill` previo no lo había alcanzado. Se detuvo por PID, se levantó un servidor limpio sobre el build nuevo y las dos rutas devolvieron 308.

Es la justificación empírica de por qué T-08-33 pide petición real contra el build y no inspección de la configuración: leer `next.config.ts` habría dado el visto bueno con el sitio sin redirigir.

Aparte de eso, el puerto 3000 estaba ocupado por un proceso node ajeno a este plan, que no se tocó; toda la verificación corrió en el 3001.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Todo el cuerpo de contenido del silo clínico queda cerrado: 5 páginas de servicio, el hub `/servicios`, home, y 6 posts de blog (2 reescritos en el lugar, 2 nuevos, 2 redirigidos). Quedan tres planes de la fase 8, todos fuera del silo: 08-17, 08-18 y 08-19, que cubren las 4 fichas de sede y `/preguntas-frecuentes` — las 5 URLs del paquete de v1.2 que ninguna fase de v1.1 tenía asignadas hasta que Juan decidió sumarlas a esta fase.

## Self-Check: PASSED

`next.config.ts`, `src/content/blog/index.ts`, `src/content/service-pages/estenosis-espinal.ts` y los tres scripts de puerta existen en disco con los cambios. Los dos módulos de post ya no existen, que es lo que el plan pide. El commit `d1e22f5` está en `git log`.

---
*Phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo*
*Completed: 2026-08-13*
