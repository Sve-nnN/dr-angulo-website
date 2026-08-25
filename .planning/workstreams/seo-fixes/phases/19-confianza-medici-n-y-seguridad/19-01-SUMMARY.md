---
phase: 19-confianza-medicion-y-seguridad
plan: 01
subsystem: contenido
tags: [hub, trust-01, contenido-propio, blog, sedes]
requires: []
provides: ["cuerpo propio en /blog y /sedes", "los dos hubs alineados con el patrón de hub-servicios.ts"]
affects: [src/content/static-pages, src/app/blog/page.tsx, src/app/sedes/page.tsx]
tech-stack:
  added: []
  patterns: []
key-files:
  created:
    - src/content/static-pages/hub-blog.ts
    - src/content/static-pages/hub-sedes.ts
  modified:
    - src/app/blog/page.tsx
    - src/app/sedes/page.tsx
decisions:
  - "Ninguna promesa de frecuencia de publicación en /blog. En su lugar el texto explica que los temas salen de lo que se repite en consulta, lo que sostiene la sección sin comprometer un calendario que el consultorio no controla."
  - "/sedes explica el criterio de elección —zona, días, forma de pago— y no repite horarios concretos ni canales de contacto. Ese dato vive en /agendar y en la ficha de cada sede, y duplicarlo obligaría a mantenerlo en tres lugares."
  - "sede-card.tsx sigue emitiendo <h3> y no se tocó. El arreglo de jerarquía vive en el PR #20, sin mergear; hacerlo también acá dejaría dos correcciones donde va una."
metrics:
  duration: ~25 min
  completed: 2026-08-25
status: complete
---

# Phase 19 Plan 01: Contenido propio en los hubs de /blog y /sedes Summary

Los dos hubs dejaron de ser listados. `/blog` explica qué clase de artículo se publica y con qué criterio se elige el tema; `/sedes` explica cómo elegir entre las cuatro sedes. Los dos quedan además alineados con el patrón de módulo de contenido que `/servicios` ya usaba, que era la deuda de forma que arrastraban.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Cuerpo de `/blog` | `0b0f426` | `hub-blog.ts` con cuatro secciones, montado entre el listado y "Sigue leyendo" |
| 2. Cuerpo de `/sedes` | `82058b0` | `hub-sedes.ts` con cinco secciones, montado entre la rejilla y el cierre de conversión |
| 3. Verificación visual y de métricas | checkpoint | resuelto por el lead; ver "Qué quedó sin medir" |

## Recuento de palabras

| Ruta | Antes | Después | Objetivo de la fase |
|---|---|---|---|
| `/blog` | 196 palabras de `<main>` | **757** | superar 400 |
| `/sedes` | 239 palabras de `<main>` | **780** | superar 500 |

Prosa nueva medida dentro de `data-content-body`: 421 palabras en `/blog` y 582 en `/sedes`, contra los pisos de 210 y 265 que exigían los criterios.

Las dos superaron el objetivo por bastante más de lo que el plan proyectaba, que apuntaba a entre 260 y 320 palabras en `/blog` y entre 300 y 360 en `/sedes`. El criterio era un piso y el resultado queda por encima; ninguna compuerta se vio afectada.

## Compuertas

Las cinco en 0 en los dos commits:

| Compuerta | Resultado |
|---|---|
| `content:check` | Sin fallas en 15 ruta(s) |
| `seo:check` | Sin fallas |
| `sedes:check` | Sin fallas en 4 sede(s) |
| `tsc --noEmit` | limpio |
| `build` | limpio |

Invariantes comprobadas y sostenidas:

- `SITEMAP_TOTAL = 23` sigue en `check-content.mjs`, `check-seo.mjs` y `check-sedes.mjs`. La fase no publica ninguna URL nueva.
- `git status --porcelain scripts/` vacío: ninguna constante de las compuertas se tocó, ni `MIN_WORDS`, ni `MANIFEST`, ni `SKELETONS`.
- `git status --porcelain src/components/locations/sede-card.tsx` vacío.
- `git diff package.json package-lock.json` vacío.
- El diff de las dos `page.tsx` es de 12 líneas cada uno: solo los imports nuevos y el bloque `ContentBodyBoundary`. Las cinco cadenas de clase preexistentes de cada ruta siguen presentes una vez, sin cambios.
- `hub-blog.ts` no contiene enlaces ni parámetros de campaña; `hub-sedes.ts` no contiene `wa.me`, ni URLs, ni ningún horario con formato de hora.

## Jerarquía de encabezados de /sedes

Al ejecutar, `src/components/locations/sede-card.tsx` línea 30 **todavía emitía `<h3>`**. No se tocó, según la restricción del plan: el arreglo vive en el PR #20, sin mergear. La prosa nueva va después de la rejilla a propósito y no corrige la jerarquía. Sigue habiendo un `<h3>` antes del primer `<h2>` en `/sedes`, tal como estaba antes de esta fase.

## Qué quedó sin medir

El checkpoint de la tarea 3 lo resolvió el lead con las cuatro compuertas que puede correr, todas en 0. **Dos comprobaciones del plan no se ejecutaron y no conviene darlas por hechas:**

1. **Capturas de página completa a 375, 768 y 1440 px** comparadas contra el commit anterior. La evidencia que sí existe es estructural y bastante fuerte: el diff de las dos plantillas es puramente aditivo, ninguna `className` preexistente cambió, y el bloque nuevo entra después del último elemento anterior al punto de inserción. Lo que eso no prueba por sí solo es el resultado renderizado.
2. **Lighthouse, mediana de tres corridas, para accesibilidad 1.00 y CLS 0.** Las dos superficies son server components estáticos, sin fetch, sin JS de cliente, sin imágenes y sin fuentes nuevas, que es la condición que protege el CLS. Aun así el número no está medido.

Ninguna de las dos bloquea el cierre del plan. Van anotadas acá para que nadie las lea como verificadas.

## Desviaciones del plan

Ninguna. El plan se ejecutó como estaba escrito. El único punto que el plan marcaba como supuesto —el nivel de encabezado de `sede-card.tsx`— se resolvió por la vía que el propio plan indicaba: se leyó, seguía en `<h3>`, y no se tocó.

## Known Stubs

Ninguno.

## Threat Flags

Ninguna superficie nueva. Este plan agrega prosa estática y no introduce entrada de usuario, red ni almacenamiento.

## Self-Check: PASSED

- `src/content/static-pages/hub-blog.ts` y `src/content/static-pages/hub-sedes.ts` existen.
- Commits `0b0f426` y `82058b0` presentes en el historial.
