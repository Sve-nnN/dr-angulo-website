---
phase: 01-home-y-servicios
plan: 01
subsystem: ui
tags: [nextjs, tailwind-v4, design-taste-frontend, accessibility, cta]

requires: []
provides:
  - "CTA Hierarchy unificada (dorado exclusivo BookingCta, copy unica 'Agendar cita') en home, hub de servicios y pagina de servicio individual"
  - "Tratamiento de tarjeta (rounded-2xl/border/shadow-sm) para categorias de especialidad en home y en el hub de servicios"
  - "Orden canonico de secciones en /servicios/[slug]: header -> contenido -> autor/disclaimer -> CTA de cierre -> posts relacionados -> sigue leyendo"
  - "Badge de credencial (icono + font-semibold) diferenciado tipograficamente de la propuesta de valor en el hero de home"
affects: [design-taste-fase-2, design-taste-fase-3, design-taste-fase-4]

actuals:
  tokens: 2243
  tasks: 3
  commits: 3
  plan_head_before: 4763d29b7d703d4e3bb186c16920bd0bcc44abb1

tech-stack:
  added: []
  patterns:
    - "Categorias de home/hub usan la misma receta visual inline (rounded-2xl border border-border bg-white p-6 shadow-sm) que ServiceCard, sin extender el componente para dos modelos de navegacion distintos"
    - "BookingCta reforzado con className='px-8 py-4 text-lg' via tailwind-merge (cn) en los puntos de mayor peso visual (hero de home, banda de cabecera de servicio), sin tocar el componente base"

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/app/servicios/page.tsx
    - "src/app/servicios/[slug]/page.tsx"

key-decisions:
  - "No se extendio ServiceCard para las categorias de home/hub (su enlace unico apunta a una pagina completa, mientras cada categoria enlaza a un ancla); se repitio su receta visual inline en su lugar, tal como especificaba el plan"
  - "AuthorByline y MedicalDisclaimer se movieron como par (sin reordenar internamente) a inmediatamente despues de ContentBody, preservando data-author-byline antes de data-medical-disclaimer para el gate de scripts/check-content.mjs"

patterns-established:
  - "Dorado (--accent) reservado en exclusiva para BookingCta en las 3 rutas de esta fase; WhatsAppCta usa siempre outline/outline-inverse"
  - "Copy unica de CTA de agendar: 'Agendar cita' en las 5 instancias en alcance (mid-content-cta.tsx queda fuera, sin tocar)"

requirements-completed: [HOMESVC-01, HOMESVC-02, HOMESVC-03, HOMESVC-04]

coverage:
  - id: D1
    description: "Jerarquia de CTA end-to-end: dorado exclusivo para BookingCta y copy unica 'Agendar cita' en home, hub y detalle de servicio"
    requirement: "HOMESVC-04"
    verification:
      - kind: other
        ref: "npm run build && npm run content:check && npm run seo:check && grep -c 'variant=\"accent\"' (0 matches) en servicios/page.tsx y servicios/[slug]/page.tsx"
        status: pass
    human_judgment: true
    rationale: "El done criteria exige confirmar visualmente que BookingCta se ve mas grande que el enlace/CTA secundario de al lado sin leer el texto; el grep y el build prueban ausencia de dorado en WhatsAppCta pero no el peso visual relativo."
  - id: D2
    description: "Jerarquia del primer scroll en home: badge de credencial diferenciado tipograficamente de la propuesta de valor"
    requirement: "HOMESVC-01"
    verification:
      - kind: other
        ref: "npm run build && npm run lint && grep -q 'BadgeCheck' src/app/page.tsx"
        status: pass
    human_judgment: true
    rationale: "La separacion visual entre credencial, propuesta de valor y CTA es un juicio de diseno (peso/contraste tipografico) que el checker automatizado no evalua, solo confirma presencia del icono e import."
  - id: D3
    description: "Tratamiento de tarjeta (rounded-2xl/border/shadow-sm) para serviceCategories en home y en el bloque inferior de /servicios, en vez de listas divide-y"
    requirement: "HOMESVC-02"
    verification:
      - kind: other
        ref: "npm run build && npm run content:check && node -e (verifica rounded-2xl en el bloque de home) && grep -q 'id={cat.slug}' src/app/servicios/page.tsx"
        status: pass
    human_judgment: true
    rationale: "El done criteria pide una lectura visual de 'panel diferenciado vs. lista con divisores'; los checks automatizados confirman las clases y la preservacion de anclas, no la escaneabilidad percibida."
  - id: D4
    description: "Orden canonico de secciones compartido entre paginas de servicio (header -> contenido -> autor/disclaimer -> CTA de cierre -> posts relacionados) y refuerzo del BookingCta de cabecera"
    requirement: "HOMESVC-03"
    verification:
      - kind: other
        ref: "npm run build && npm run content:check (gate de scripts/check-content.mjs: data-author-byline precede a data-medical-disclaimer en las 5 rutas de servicio)"
        status: pass
    human_judgment: true
    rationale: "El plan pide comparar manualmente /servicios/hernia-discal y /servicios/cirugia-minimamente-invasiva para confirmar mismo orden y mismo tratamiento visual entre paginas distintas; content:check prueba el gate estructural pero no la comparacion visual entre rutas."

duration: ~45min
completed: 2026-09-18
status: complete
---

# Phase 1 Plan 1: Home y Servicios (CTA Hierarchy, tarjetas, orden canonico) Summary

**CTA dorado unificado en BookingCta con copy unica "Agendar cita", tarjetas rounded-2xl para categorias de especialidad en home y hub, y orden canonico de secciones en /servicios/[slug] con AuthorByline/MedicalDisclaimer movidos antes del CTA de cierre.**

## Performance

- **Duration:** ~45 min (ejecucion efectiva tras resolver un bloqueo de entorno documentado abajo)
- **Completed:** 2026-09-18T14:15:18Z
- **Tasks:** 3/3
- **Files modified:** 3

## Accomplishments
- CTA Hierarchy de `01-UI-SPEC.md` implementada end-to-end: dorado (`--accent`) reservado en exclusiva para `BookingCta` en las 3 rutas de la fase; los 5 `WhatsAppCta`/`BookingCta` en alcance leen "Agendar cita"; ningun `WhatsAppCta variant="accent"` queda en `servicios/page.tsx` ni en `servicios/[slug]/page.tsx`.
- Home: linea de credencial pasa a badge (`BadgeCheck` + `font-semibold`), separada por peso tipografico de la propuesta de valor; bloque `serviceCategories` pasa de `<dl>` con divisores a grid de paneles `rounded-2xl border border-border bg-white p-6 shadow-sm`.
- `/servicios/[slug]`: `AuthorByline` y `MedicalDisclaimer` ahora renderizan inmediatamente despues de `ContentBody` y antes de "Agenda una evaluacion de tu caso" (orden canonico de `01-CONTEXT.md`); `BookingCta` de la banda de cabecera reforzado a `px-8 py-4 text-lg`.
- `/servicios`: bloque inferior de categorias pasa al mismo tratamiento de tarjeta que home, conservando `id={cat.slug}` y `scroll-mt-28` para los anclajes existentes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Jerarquia de CTA end-to-end** - `0d4a1de` (feat)
2. **Task 2: Home (badge de credencial y tratamiento de tarjeta)** - `2aa8f51` (feat)
3. **Task 3: Servicio individual (orden canonico) y card treatment en el hub** - `d9bc7c9` (feat)

_Nota: ninguna tarea de esta fase usaba `tdd="true"`, un commit por tarea._

## Files Created/Modified
- `src/app/page.tsx` - Hero: BookingCta agrandado + "Ver especialidades" a enlace de texto simple; credencial a badge; serviceCategories a grid de tarjetas; BookingCta de cierre con copy unificada
- `src/app/servicios/page.tsx` - WhatsAppCta de cierre a `outline`; bloque de categorias inferior a tratamiento de tarjeta
- `src/app/servicios/[slug]/page.tsx` - BookingCta de banda de cabecera agrandado y con copy unificada; AuthorByline/MedicalDisclaimer reordenados antes del CTA de cierre; WhatsAppCta y BookingCta de "Agenda una evaluacion" y del aside sticky con copy/variant unificados

## Decisions Made
- No se extendio `ServiceCard` para las categorias de home/hub; se repitio su receta visual inline por decision explicita del plan (dos modelos de navegacion distintos: pagina completa vs. ancla).
- Se preservo el `<div>`/`<p>` sin introducir un `<h3>` nuevo en las tarjetas de categoria de home, tal como pedia el plan, para no sumar una entrada de encabezado nueva.
- El escalon de tamano `px-8 py-4 text-lg` en `BookingCta` se aplico solo en los dos puntos que el plan senalaba como "mayor peso visual de la pagina" (hero de home, banda de cabecera de servicio); el resto de instancias quedo en su tamano por defecto.

## Deviations from Plan

None - plan ejecutado tal como estaba escrito. La unica desviacion fue de entorno, no de codigo: ver "Issues Encountered".

## Issues Encountered

**Bloqueo de entorno (no de codigo):** el primer intento de ejecucion corrio dentro de un worktree (`agent-a909e18c989bf406c`) cuya rama se habia creado desde un commit anterior a que se agregara el workstream `design-taste` a `cwv-01-medicion-y-sync-planning`; el plan, `01-CONTEXT.md` y `01-UI-SPEC.md` no existian ahi. Se reporto el bloqueo (sin tocar codigo ni hacer merges de rama) y, en un turno posterior, el entorno de ejecucion cambio al checkout principal del repo (rama `cwv-01-medicion-y-sync-planning`, que si contenia los 3 archivos de planning), donde se ejecuto el plan completo sin incidentes.

## Next Phase Readiness
- El lenguaje visual compartido (CTA Hierarchy, Shape Consistency Lock para tarjetas, orden canonico de pagina de servicio) queda establecido para que las fases 2-4 del milestone v1.4 lo reutilicen.
- `npm run build`, `npm run lint`, `npm run content:check` y `npm run seo:check` pasan en limpio sobre el estado final de las 3 rutas.
- Sin bloqueos para la fase 2.

---
*Phase: 01-home-y-servicios*
*Completed: 2026-09-18*

## Self-Check: PASSED

- FOUND: src/app/page.tsx
- FOUND: src/app/servicios/page.tsx
- FOUND: src/app/servicios/[slug]/page.tsx
- FOUND: .planning/workstreams/design-taste/phases/01-home-y-servicios/01-01-SUMMARY.md
- FOUND commit: 0d4a1de
- FOUND commit: 2aa8f51
- FOUND commit: d9bc7c9
