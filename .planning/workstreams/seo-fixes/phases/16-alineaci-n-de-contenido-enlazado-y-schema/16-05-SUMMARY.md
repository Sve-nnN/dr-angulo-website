---
phase: 16-alineaci-n-de-contenido-enlazado-y-schema
plan: 05
subsystem: contenido
tags: [anchors, enlazado-interno, ux-copy, impeccable]
requires: ["16-02", "16-03", "16-04"]
provides: ["110 anchors descriptivos", "rótulo canónico por destino"]
affects: [src/content]
tech-stack:
  added: []
  patterns: ["un rótulo canónico por destino, reutilizado en todo el sitio"]
key-files:
  created: []
  modified:
    - src/content/blog/ciatica.ts
    - src/content/blog/lumbalgia.ts
    - src/content/blog/artrosis.ts
    - src/content/blog/cirugia-de-columna.ts
    - src/content/blog/reumatologo-o-traumatologo.ts
    - src/content/static-pages/home.ts
    - src/content/static-pages/hub-servicios.ts
    - src/content/static-pages/preguntas-frecuentes.ts
    - src/content/service-pages/cirugia-minimamente-invasiva.ts
    - src/content/service-pages/escoliosis-y-deformidades.ts
    - src/content/service-pages/estenosis-espinal.ts
    - src/content/service-pages/hernia-discal.ts
    - src/content/service-pages/ortopedia-infantil.ts
    - src/content/location-pages/clinica-ricardo-palma.ts
    - src/content/location-pages/clinica-tezza.ts
    - src/content/location-pages/consultorio-privado.ts
    - src/content/location-pages/sanna-la-molina.ts
decisions:
  - "Un rótulo canónico por destino, repetido igual en todas las páginas que enlazan ahí. Es lo que pide clarify (mismo sustantivo para el mismo concepto, sin variar por efecto literario) y lo contrario de lo que hacía el paquete de v1.2."
  - "Las cuatro sedes se distinguen por nombre de clínica y distrito, no por keyword: cuatro rótulos genéricos serían tan inútiles como cuatro keywords."
metrics:
  duration: ~30 min
  completed: 2026-08-24
status: complete
---

# Phase 16 Plan 05: Reescritura de los anchors internos Summary

Los 110 anchors del bloque "Sigue leyendo" pasan de consultas de buscador pegadas a rótulos que dicen a dónde llevan. Ningún `href` cambió.

## Línea base (tarea 1, commit `4e06d22` no la produce: ya venía de `d46a9be`)

Los dos archivos existen y traen datos: `audit/baselines/2026-08-24-consultas-gsc.csv` (15 líneas, cabecera más 14 consultas) y `audit/baselines/2026-08-24-baseline-anchors.md`.

**Dato que cambia el riesgo del plan: ninguna keyword usada como anchor en el bloque "Sigue leyendo" tiene impresiones atribuidas en el período de la línea base.** Cero impresiones para "mejor neurocirujano de columna lima", "cirugía de columna cerca de mí", "donde duele la ciática", "lumbalgia se opera" y todas las demás, sobre las 146 consultas con impresiones del sitio. T-16-16 queda mitigado de hecho.

## Cómo se ejecutó `impeccable clarify`

Arranque corrido una sola vez en la sesión, con cwd en la raíz del proyecto:
`node ~/.claude/skills/impeccable/scripts/context.mjs --target "src/app/blog/[slug]/page.tsx"`. Cargó `PRODUCT.md`; no hay `DESIGN.md` ni brief de superficie. Después se cargó `~/.claude/skills/impeccable/reference/clarify.md` y se trabajó según ese playbook.

El bloque "Sigue leyendo" se auditó como una sola superficie repetida en cuatro plantillas (post, guía de servicio, ficha de sede y `/preguntas-frecuentes`), no archivo por archivo. Directivas del playbook que fijaron el criterio:

- *"Link text must make sense out of context"* → cada rótulo nombra el tema de la página destino.
- *"Keep the same noun and verb for the same concept throughout the product"* y *"Do not vary words for literary effect in an interface"* → un rótulo canónico por destino, repetido igual en las cinco o seis páginas que enlazan ahí. Esto es exactamente lo que el paquete on-page de v1.2 evitaba a propósito, y es la reversión que D-10 autoriza.
- *"inconsistent terminology and capitalization"* → mayúscula inicial y tildes en los 110; se corrigió además "Contacto y Citas en Lima" a "Contacto y citas en Lima".
- *"as short as it can be without removing meaning"* → "Sedes donde atiende el Dr. Juan Carlos Angulo en Lima" se acortó a "Sedes donde atiende el Dr. Juan Angulo", que es la forma corta que fija `PRODUCT.md`.

Rótulos canónicos publicados (extracto): `/servicios` → "Qué condiciones se tratan en cada especialidad"; `/blog/ciatica` → "Cuándo el dolor de pierna viene de la columna" (propuesto textualmente por el audit); `/servicios/hernia-discal` → "Guía sobre la hernia discal"; `/preguntas-frecuentes` → "Dudas frecuentes antes de la consulta" (alineado con su H1); las cuatro sedes por nombre y distrito ("Clínica Ricardo Palma, en San Isidro", "Clínica Padre Luis Tezza, en Surco", "Consultorio privado, en Surco", "Clínica Sanna, en La Molina"). Se conservaron "Blog", "Agendar cita" y "Testimonios de pacientes", que ya eran rótulos correctos.

El detector de la skill (`scripts/detect.mjs`) se corrió sobre un archivo editado y no reportó hallazgos.

## Verificación

- `grep -rniE 'anchor: "[^"]*neurocirujano' src/content/`: 0 líneas.
- `grep -rniE 'anchor: "[^"]*(mejor|cerca de m)' src/content/`: 0 líneas.
- `grep -rn "artrosis traumatologo o reumatologo" src/content/`: 0 líneas.
- `grep -rhoE 'anchor: "[a-záéíóúñ][^"]*"' src/content/ | wc -l`: **0**.
- `grep -rhoE 'anchor: "[^"]*"' src/content/ | wc -l`: **110**. Ninguna entrada perdida.
- Las cuatro sedes enlazadas desde `hernia-discal.ts`: cuatro cadenas distintas.
- `git diff --unified=0 src/content/ | grep -c '^[-+] *href:'`: **0** en las dos tareas de edición.
- El bloque renderizado de `/blog/ciatica` muestra seis frases legibles: "Guía sobre la hernia discal", "Cómo se maneja la artrosis", "Qué hay detrás del dolor lumbar", "Qué conviene saber antes de operarse de la columna", "Blog", "Qué condiciones se tratan en cada especialidad".
- `npm run build`, `npm run content:check`, `npm run seo:check` y `npm run lint`: 0 los cuatro.

## Deviations from Plan

Ninguna. La tarea 1 encontró la línea base en el repo tal como el bloque pre-resuelto la describía, así que no hubo checkpoint.

## Known Stubs

Ninguno.

## Self-Check: PASSED
