---
phase: 16-alineaci-n-de-contenido-enlazado-y-schema
plan: 04
subsystem: contenido
tags: [h2, canibalizacion, plantilla]
requires: ["16-02", "16-03"]
provides: ["encabezados de nivel 2 únicos en todo el sitio"]
affects: [src/content/blog, src/content/service-pages, src/content/static-pages, src/app/sitemap.xml]
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified:
    - src/content/blog/ciatica.ts
    - src/content/blog/lumbalgia.ts
    - src/content/blog/artrosis.ts
    - src/content/blog/cirugia-de-columna.ts
    - src/content/blog/reumatologo-o-traumatologo.ts
    - src/content/service-pages/estenosis-espinal.ts
    - src/content/service-pages/escoliosis-y-deformidades.ts
    - src/content/service-pages/ortopedia-infantil.ts
    - src/content/static-pages/hub-servicios.ts
    - src/app/sitemap.xml/route.ts
decisions:
  - "La portada no se toca: variando los otros dos módulos del grupo de hub, cada uno de sus cinco encabezados queda en una o dos páginas."
  - "hernia-discal conserva el fraseo de v1.2: con las otras siete guías variadas, cada uno de sus encabezados queda en una sola página."
metrics:
  duration: ~20 min
  completed: 2026-08-24
status: complete
---

# Phase 16 Plan 04: Variación de los H2 de plantilla Summary

Ninguna secuencia de encabezados de nivel 2 se repite palabra por palabra en más de dos páginas del sitio. El conteo pasó de doce encabezados en falta a cero, sobre diecisiete módulos de contenido.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Los cinco posts del blog | `64b7b02` | fraseo propio en `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes` y `cuando-consultar` |
| 2. Estenosis y escoliosis | `6d85675` | fraseo propio de cada condición, incluidos los dos que el audit propone textualmente |
| 3. Plantilla de hub y fecha compartida | `59f95e8` | ortopedia infantil y el hub de servicios variados; `SHARED_LAST_MODIFIED` a `"2026-08-24"` |

## Verificación

- Conteo de encabezados repetidos: **0 violaciones sobre 17 archivos**, sale con código 0.
- `grep -c 'heading: "Qué se atiende"' src/content/static-pages/home.ts`: 1. La portada quedó intacta.
- Ningún `id` de sección cambió: `que-es`, `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes` y `cuando-consultar` siguen presentes uno a uno en cada módulo.
- Ningún encabezado de página de servicio lleva cifras.
- `git diff --stat` sobre `src/content/`: 30 líneas cambiadas, todas de `heading` o `updatedAt`. Cero líneas de `id`, `level` o párrafo.
- `npm run build`, `npm run content:check` y `npm run seo:check`: 0 los tres.

## Deviations from Plan

**1. [Rule 1 - Encabezado que no describía su contenido] Cuatro sustituciones en el post de reumatólogo**

La tarea 1 obliga a comprobar cada fraseo nuevo contra el primer párrafo de su sección y a sustituirlo si no encaja. Cuatro filas de la tabla no encajaban, porque ese post es texto sobre condiciones de columna con marco de "a qué especialista ir", y la tabla asumía que todas sus secciones hablaban de especialidades:

| `id` | Tabla del plan | Publicado | Motivo |
|---|---|---|---|
| `sintomas` | Qué señales apuntan a cada especialidad | Con qué molestias se llega a la consulta | los párrafos listan por qué llegan los pacientes y qué sugiere el recorrido del dolor, no a qué especialista mandan |
| `causas` | Por qué la duda es tan frecuente | Por qué aparecen estos problemas | los párrafos explican desgaste, carga y genética, no la duda del paciente |
| `sin-operar` | Qué trata cada especialista sin cirugía | Qué se maneja sin quirófano | el texto describe el manejo conservador de la columna, no el reparto entre especialistas |
| `cirugia` | Quién opera y quién no | Cuándo se plantea operar | los párrafos son sobre en qué situaciones se indica operar |

Los cuatro fraseos publicados son únicos en el sitio y el conteo sigue en cero violaciones.

## Known Stubs

Ninguno.

## Self-Check: PASSED
