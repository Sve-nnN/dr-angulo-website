---
phase: 16-alineaci-n-de-contenido-enlazado-y-schema
plan: 02
subsystem: contenido
tags: [intencion-de-busqueda, faq, blog]
requires: ["16-01"]
provides: ["/blog/reumatologo-o-traumatologo", "postReumatologoOTraumatologo", "SITEMAP_TOTAL=23"]
affects: [src/content/blog, src/content/static-pages, src/app/preguntas-frecuentes, scripts]
tech-stack:
  added: []
  patterns: []
key-files:
  created:
    - src/content/blog/reumatologo-o-traumatologo.ts
  modified:
    - src/content/blog/index.ts
    - src/content/static-pages/preguntas-frecuentes.ts
    - src/app/preguntas-frecuentes/page.tsx
    - scripts/check-content.mjs
    - scripts/check-seo.mjs
decisions:
  - "El módulo de la FAQ pasa de format guia-clinica a pagina-de-servicio, y el MANIFEST deja de declarar format para esa ruta, los dos en la misma tarea que recorta el esqueleto."
metrics:
  duration: ~25 min
  completed: 2026-08-24
status: complete
---

# Phase 16 Plan 02: Separación de /preguntas-frecuentes Summary

`/preguntas-frecuentes` se queda con las once secciones que sí son preguntas de paciente, y la guía de reumatólogo o traumatólogo se muda entera a `/blog/reumatologo-o-traumatologo` con su propio title y su propio H1.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Post nuevo con la guía mudada | `4bdf2bb` | ocho secciones transcritas verbatim, registrado en `blogPosts`, `SITEMAP_TOTAL` 22→23 en las dos puertas nombradas por el plan |
| 2. FAQ de punta a punta | `0225c51` | recorte a once secciones, `format` a `pagina-de-servicio`, banner reanclado, title y description alineados con el H1, `format` fuera del MANIFEST |
| 3. Alta en el MANIFEST | `4732d0d` | entrada `type: "post"` sin `linksTo`, mismo criterio que `/blog/artrosis` |

## Verificación

- `npm run build`: 0. Existe `.next/server/app/blog/reumatologo-o-traumatologo.html` y su `<h1>` dice "Reumatólogo o traumatólogo: cómo saber cuál te corresponde".
- `<title>` de `/preguntas-frecuentes`: "Preguntas frecuentes antes de la consulta". `<h1>`: "Dudas frecuentes antes de la consulta".
- El bloque `FAQPage` de esa ruta emite exactamente 7 entradas `"@type":"Question"`.
- `npm run content:check`: 0, 15 rutas, `/preguntas-frecuentes` con 1069 palabras y el post nuevo con 1258.
- `npm run seo:check`: 0, 24 rutas medidas. Sitemap con 23 `<loc>`.

## Deviations from Plan

**1. [Rule 3 - Blocking] El comentario del SITEMAP_TOTAL inflaba un conteo**

- **Found during:** Tarea 3
- **Issue:** el criterio `grep -c "/blog/reumatologo-o-traumatologo" scripts/check-content.mjs` debía dar 1. El comentario del `SITEMAP_TOTAL` escrito en la tarea 1 nombraba la ruta por su path y el conteo daba 2.
- **Fix:** el comentario nombra el post en prosa ("el post de reumatólogo o traumatólogo") en vez de por path. Sigue explicando de dónde sale el 23.
- **Commit:** `4732d0d`

## Known Stubs

Ninguno.

## Nota para planes posteriores

El `ctaBanner` "¿Todavía no sabes a quién te toca consultar?" quedó duplicado en `/preguntas-frecuentes` y en el post nuevo, porque `BlogPost` lo exige y este plan no autorizaba redactar copy de interfaz fuera de la skill. La pasada de `impeccable clarify` del plan 16-05 se limitó a los `anchor`, que era su alcance escrito, así que el duplicado sigue en pie. No rompe ninguna puerta.

## Self-Check: PASSED
