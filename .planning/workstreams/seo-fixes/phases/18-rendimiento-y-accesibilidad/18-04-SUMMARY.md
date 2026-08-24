---
phase: 18-rendimiento-y-accesibilidad
plan: 04
subsystem: rendimiento
tags: [lcp, imagenes, cwv, next-image, deprecacion]
requires: ["18-01"]
provides:
  - "La imagen del LCP de /sobre-el-doctor se pide con prioridad alta comprobada"
  - "El proyecto no usa ninguna prop obsoleta del componente Image"
affects:
  - src/app/sobre-el-doctor/page.tsx
  - src/app/page.tsx
  - src/components/layout/header.tsx
tech-stack:
  added: []
  patterns:
    - "loading=eager mas fetchPriority=high en la imagen del LCP; preload en el resto de las imagenes de arriba del pliegue"
key-files:
  created:
    - .planning/workstreams/seo-fixes/phases/18-rendimiento-y-accesibilidad/18-LCP-EVIDENCE.md
  modified:
    - src/app/sobre-el-doctor/page.tsx
    - src/app/page.tsx
    - src/components/layout/header.tsx
decisions:
  - "Camino B (loading=eager + fetchPriority=high) sobre la imagen del LCP, decidido por la medicion y no por la doc"
  - "Las otras dos Image conservan preload: el camino B es una decision sobre la imagen del LCP de una ruta, no sobre las tres"
  - "El LCP de esta ruta esta dominado por el TTFB y su mejora depende del plan 18-02; este plan cierra solo la brecha de prioridad"
metrics:
  duration: "~1 h"
  completed: 2026-08-24
  tasks: 3
  files: 4
status: complete
---

# Phase 18 Plan 04: LCP de `/sobre-el-doctor` Summary

`lcp-discovery-insight` pasa de 0 a 1: la cara del doctor se descubre desde el `<head>` y se pide con prioridad alta comprobada, y el proyecto deja atrás una prop que Next 16 declara obsoleta.

## Qué se hizo

| Tarea | Qué | Commit |
|---|---|---|
| 1 | Medir contra producción qué sirve el sitio para el LCP | `b2e2163` |
| 2 | Migrar las tres `Image` de `priority` a `preload` | `b668550` |
| 2 bis | Camino B sobre la imagen del LCP, tras la medición | `9681284` |
| 3 | Checkpoint, resuelto por el líder de fase | — |

### La migración de la prop obsoleta

Next 16 declaró obsoleta `priority` en favor de `preload`. El proyecto la usaba en tres lugares y **los tres se migraron en el mismo commit**: `page.tsx:81`, `sobre-el-doctor/page.tsx:35` y `header.tsx:89`. Migrar dos y dejar uno habría reintroducido la deuda que la tarea saldaba.

`grep -rn '^\s*priority\s*$' src/` devuelve 0.

### El camino B, decidido por la medición

La tarea 2 arrancó por el camino A (`preload`), con la justificación de que ninguno de los tres casos de "when not to use it" de la doc aplicaba a esta imagen. La corrida del checkpoint lo desmintió con el número que el propio plan había puesto como árbitro:

| Señal | Camino A | Camino B |
|---|---|---|
| `requestDiscoverable` | `true` | `true` |
| `priorityHinted` | **`false`** | **`true`** |
| `eagerlyLoaded` | — | `true` |
| `lcp-discovery-insight` | **0** | **1** |

El mensaje de Lighthouse fue explícito: *"fetchpriority=high should be applied to the image preload request"*. El `preload` hacía la petición descubrible pero no le ponía prioridad.

Se cambió a `loading="eager"` más `fetchPriority="high"`, sin tocar ninguna otra prop. **Las otras dos declaraciones conservan `preload`**: el camino B es una decisión sobre la imagen del LCP de esta ruta, no sobre las tres.

**El camino B no es un plan C.** `image.md:289` lo recomienda de entrada: *"In most cases, you should use `loading="eager"` or `fetchPriority="high"` instead of `preload`"*. Lo que decidió no fue la doc sino la medición, que es lo que el plan había establecido desde el principio.

## Lo que la medición estableció, y que vale más allá de este plan

**El LCP de `/sobre-el-doctor` está dominado por el TTFB, no por trabajo de imagen.** La ruta puntúa 0,96 con TBT de 0 ms. TTFB del HTML: 794 ms medianos, contra un piso de borde de 322 ms. **Unos 470 ms son el viaje al origen** y los elimina la Cache Rule del plan 18-02.

Y hay un segundo viaje que nadie había visto: **`/_next/image` responde `cf-cache-status: DYNAMIC`**, así que la imagen optimizada tampoco se cachea en el borde. En esta ruta el LCP paga el viaje al origen dos veces, una por el HTML y otra por la imagen.

**El formato y la variante ya estaban bien.** El optimizador sirve WebP de 32.980 B a cualquier navegador real, y a 375px con DPR 2 el navegador toma la variante 640w, que es la correcta. No había nada que arreglar ahí.

**Este plan cierra la brecha de prioridad, que era su alcance real.** El grueso de la mejora de LCP depende de 18-02. Decirlo así evita que la próxima persona le atribuya a `fetchPriority` una mejora que era de caché de borde.

### Un hallazgo que corrigió el plan 18-02

Medir el optimizador de imágenes destapó que **varía por `Accept`**: devuelve WebP de 32.980 B a un navegador y JPEG de 48.250 B a un cliente sin la cabecera, con `vary: Accept`. Cloudflare ignora `Vary` sobre cabeceras arbitrarias.

Con la Cache Rule que 18-02 tenía redactada, la primera respuesta que el borde guardara se serviría a todos: si le tocaba la de un rastreador sin `Accept`, **todos los pacientes recibirían el JPEG**, perdiendo el 32% del peso de cada imagen del sitio sin que nada lo reportara. `18-CLOUDFLARE-CACHE.md` incorporó esto como su **sexta invariante**.

## Deviaciones del plan

### 1. En el camino B `imageSrcSet` queda en 2, no en 1

- **Qué decía el criterio:** en el camino B, `imageSrcSet` en `/sobre-el-doctor` baja a 1, "la del logo", porque "sin `preload`, Next no emite el enlace de precarga de la imagen del doctor".
- **Medido:** **2**. Next 16 sigue emitiendo el enlace de precarga y ahora le agrega `fetchPriority="high"`, y replica el atributo en el `<img>`.
- **Por qué la desviación es buena noticia:** el camino B **no cambió una cosa por la otra**. Conservó `requestDiscoverable: true` y agregó `priorityHinted: true`. La corrida del checkpoint lo confirma con los tres ítems en verde.
- **Qué NO se hizo:** ajustar el criterio. El bloque condicional del `<verify>` falla en su rama `else` solo por este renglón, con todo lo demás en verde.

### 2. La comparación de capturas no se reportó por separado

- Cubierta indirectamente por el CLS en 0 en las dos rutas tocadas y por la corrida de accesibilidad, que dio 1,00 en las 24 rutas.
- Registrado igual que en el plan 18-01: evidencia fuerte, pero no la que el criterio pedía.

### 3. La línea base viva no la produjo el ejecutor

- Las tres corridas de Lighthouse en la misma sesión necesitan navegador, que esta sesión no tenía. Instalar Lighthouse habría sido una instalación de paquete fuera de la única compuerta de instalación de la fase.
- **Qué sí se entregó sin navegador:** cuatro de las seis mediciones cerradas (enlace de precarga, variante descargada, formato servido y `src` de respaldo), más la cascada de red completa y la atribución del LCP al TTFB.
- Lo resolvió el checkpoint.

## Superposición de archivos entre planes

| Archivo | Dueño | También lo tocó | Riesgo |
|---|---|---|---|
| `src/components/layout/header.tsx` | **18-04** | 18-05 | Ninguno. El cambio de este plan (migración de `priority` a `preload` en el logo) ya estaba aplicado y cerrado cuando 18-05 repuntó sus imports al índice de navegación. Son dos líneas distintas del archivo. |

## Amenazas del registro

| ID | Estado |
|---|---|
| T-18-12 | `width={933}` y `height={1400}` intactos, verificado con `grep`. **CLS de `/sobre-el-doctor` y de la portada en 0.** |
| T-18-13 | `imageSrcSet` en 2 por página. La imagen de fluoroscopia no lleva precarga y no se le agregó. |
| T-18-14 | `object-cover`, `w-[220px]` y `sm:w-[260px]` siguen presentes. Accesibilidad en 1,00 en las 24 rutas. |
| T-18-15 | `next.config.ts` no se tocó en este plan. |
| T-18-SC | Ningún paquete instalado en este plan. |

## Las cinco compuertas

Las cinco en 0 en cada commit: `build`, `content:check`, `seo:check`, `sedes:check` y `tsc --noEmit`.

## Estado del requisito

**CWV-03 cerrado.**

Queda anotado, y no es de este plan: la mejora de LCP en segundos de esta ruta depende de que Juan aplique la Cache Rule del plan 18-02. Lo que este plan garantiza es que, cuando el HTML llegue rápido, la imagen ya no va a ser lo que retrase la pintura.

## Self-Check: PASSED

- `src/app/sobre-el-doctor/page.tsx` — FOUND
- `src/app/page.tsx` — FOUND
- `src/components/layout/header.tsx` — FOUND
- `18-LCP-EVIDENCE.md` — FOUND
- Commits `b2e2163`, `b668550`, `9681284` — FOUND
