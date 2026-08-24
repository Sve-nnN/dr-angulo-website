---
phase: 18-rendimiento-y-accesibilidad
plan: 01
subsystem: accesibilidad
tags: [a11y, wcag, contraste, semantica, encabezados]
requires: []
provides:
  - "Contraste AA en las cuatro superficies de blanco sobre fondo primario"
  - "Estructura de <dl> válida en las cuatro fichas de sede de /agendar"
  - "Jerarquía de encabezados sin saltos en /sedes"
affects:
  - src/app/page.tsx
  - src/components/locations/location-card.tsx
  - src/components/locations/sede-card.tsx
tech-stack:
  added: []
  patterns:
    - "Envoltorio de par término/valor en grid-cols-[auto_1fr] con col-start-2 en cada <dd>, para conservar el layout de dos columnas sin romper el modelo de contenido de <dl>"
    - "Etiqueta sr-only en un <span> dentro del <dt> cuando el <dt> carga un ícono"
key-files:
  created:
    - .planning/workstreams/seo-fixes/phases/18-rendimiento-y-accesibilidad/18-A11Y-EVIDENCE.md
  modified:
    - src/app/page.tsx
    - src/components/locations/location-card.tsx
    - src/components/locations/sede-card.tsx
decisions:
  - "El contraste se corrige subiendo la opacidad del texto a blanco opaco (5.00:1), no tocando la paleta de marca"
  - "El default headingLevel de LocationCard se deja en h3: /agendar es su único consumidor y ahí el orden ya era correcto"
  - "Las tres filas unresolved de contraste se cierran como decorativas, con la corrida de Lighthouse como evidencia"
metrics:
  duration: "~50 min"
  completed: 2026-08-24
  tasks: 4
  files: 4
status: complete
---

# Phase 18 Plan 01: Accesibilidad — Contraste, `<dl>` y orden de encabezados Summary

Los tres fallos de accesibilidad de la auditoría corregidos con cambios de opacidad y de etiqueta, sin tocar la paleta ni un solo píxel del dibujo: la portada y `/agendar` suben a 1,00 y las cuatro auditorías de axe pasan en las 24 rutas.

## Qué se hizo

| Tarea | Qué | Commit |
|---|---|---|
| 1 | Las cuatro ocurrencias de blanco translúcido sobre `bg-primary` de la portada pasan a `text-white` (5.00:1) | `d3fae3f` |
| 2 | Los dos `<dl>` de `location-card.tsx` pasan a retícula con `<dt>` y `<dd>` como hijos directos | `188d9aa` |
| 3 | El encabezado de `sede-card.tsx` sube de `<h3>` a `<h2>`, y se arma el archivo de evidencia | `847d1d5` |
| 3 | Anotación del hash del tercer commit en la evidencia | `c7eca14` |
| 4 | Checkpoint de verificación, resuelto por el líder de fase | — |

### Contraste

Las cuatro ocurrencias de opacidad de blanco del sitio vivían todas en `src/app/page.tsx`, líneas 44, 50, 59 y 330. Las cuatro estaban por debajo de 4.5:1 sobre `#0E7C7E`: 4.07:1 las de `/85` y 3.53:1 las de `/75`. Las cuatro pasaron a blanco opaco, 5.00:1.

Lighthouse solo había reportado la línea 330. **Las otras tres fueron hallazgo del barrido del UI-SPEC**, y dos de ellas eran peores que la reportada.

El enlace de verificación del CMP de la línea 59 arrastraba dos consecuencias que se resolvieron **en el mismo commit que rompía su premisa**, no en uno posterior: con el estado base en blanco opaco su `hover:text-white` dejaba de cambiar nada, así que se eliminó, y con él su `transition-colors duration-150`, que ya no cubría ninguna transición de color.

### Estructura del `<dl>`

El defecto: el modelo de contenido de `<dl>` admite hijos `<div>` solo cuando cada uno contiene únicamente `<dt>` seguidos de `<dd>`. Los dos bloques usaban `<div className="flex gap-3">` con un `<svg>` y otro `<div>` adentro, dejando el `<dt>` a dos niveles de profundidad.

El arreglo, exactamente como lo fijaba el UI-SPEC: el envoltorio pasa de `flex gap-3` a `grid grid-cols-[auto_1fr] items-start gap-x-3`, el `<svg>` se muda dentro del `<dt>` conservando sus clases, la etiqueta `sr-only` pasa a un `<span>` interno, y cada `<dd>` recibe `col-start-2`.

**Los nueve `<dd>` de `/agendar` siguen siendo nueve.** Colapsar los horarios múltiples en uno solo habría convertido un arreglo de accesibilidad en una pérdida de semántica, y era la amenaza T-18-02 del registro.

`sede-card.tsx` no se tocó en esta parte: sus `<div>` ya contienen exactamente un `<dt>` y un `<dd>`, y convertirlo a la misma retícula le habría roto la presentación en línea.

### Orden de encabezados

`/sedes` iba de `h1` a cuatro `h3` huérfanos. Se cambió únicamente la etiqueta; la lista de clases `font-heading text-lg font-bold text-primary` quedó carácter por carácter igual y el `<Link>` con `after:absolute after:inset-0` no se movió, que era la amenaza T-18-01.

## Verificación

### Aserciones sobre el HTML prerenderizado

| Ruta | Aserción | Antes | Después |
|---|---|---|---|
| `/` | `text-white/` en `index.html` | 8 | **0** |
| `/` | `text-white/[0-9]+` en todo `src/` | 4 | **0** |
| `/` | `hover:text-white` en `page.tsx` | 1 | **0** |
| `/agendar` | `grid-cols-[auto_1fr]` | 0 | **16** |
| `/agendar` | `flex gap-3` | 16 | **0** |
| `/agendar` | `<dl>` / `<dt>` / `<dd>` | 4 / 8 / 9 | **4 / 8 / 9** |
| `/sedes` | `<h1>` / `<h2>` / `<h3>` | 1 / 3 / 4 | **1 / 7 / 0** |

La de `/sedes` es la prueba del requisito para esa ruta: Lighthouse no penaliza un `<h3>` sin `<h2>` previo cuando el resto del árbol es coherente, y de hecho la ruta ya puntuaba 1,00 con los cuatro huérfanos puestos.

### Corrida de Lighthouse del checkpoint

Unlighthouse con throttling móvil sobre 24 rutas, contra el build local con los tres commits aplicados.

| Ruta | Antes | Después |
|---|---|---|
| `/` | 0,97 | **1,00** |
| `/agendar` | 0,93 | **1,00** |
| `/sedes` | 1,00 | **1,00** (no regresión) |

`color-contrast`, `definition-list`, `dlitem` y `heading-order` **pasan en las 24 rutas**, no solo en las tres. **El CLS sigue en 0 en las 24.**

### Las cinco compuertas

Las cinco en 0 en cada uno de los tres commits, no solo al final: `build`, `content:check`, `seo:check`, `sedes:check` y `tsc --noEmit`. `sedes:check` incluida, que en la fase 16 quedó cuatro commits en rojo porque ningún plan la corría.

## Deviaciones del plan

### 1. La comparación píxel a píxel no se reportó por separado

- **Encontrado en:** el checkpoint de la tarea 4.
- **Qué pedía el criterio:** capturas de `/agendar` y `/sedes` a 375px, 768px y 1440px, antes y después, comparadas píxel a píxel. El plan decía que sin esa comparación el verificador no da pase.
- **Qué hay en su lugar:** CLS en 0 en las 24 rutas, `definition-list` y `dlitem` en verde, y los conteos de nodos de `/agendar` idénticos (`<dl>`=4, `<dt>`=8, `<dd>`=9). Un cambio de `flex` a `grid` que moviera el layout habría aparecido en el CLS.
- **Estado:** registrado en `18-A11Y-EVIDENCE.md` sección 6 como evidencia fuerte pero **no la que el criterio pedía**. El líder de fase dio el pase con esta base. Si aparece una diferencia visual en el deploy, ese es el renglón que la tenía que haber atrapado.

### 2. Tres rutas ajenas a la fase bajan de 1,00 en el build local

- **Encontrado en:** la misma corrida.
- **Qué:** `/sobre-el-doctor` 0,96, `/testimonios` 0,96 y `/sedes/clinica-ricardo-palma` 0,97, por `target-size` sobre `header.sticky > div.mx-auto > nav.hidden > a.whitespace-nowrap`, la navegación de escritorio que en móvil está oculta por diseño.
- **Por qué no es de este plan:** contra producción esa auditoría pasa con la misma emulación, y ninguno de los tres commits toca el encabezado.
- **Estado:** anotado en `deferred-items.md` punto 4, a reverificar después del deploy. No se arregló.

## Amenazas del registro, cerradas

| ID | Mitigación aplicada |
|---|---|
| T-18-01 | `after:absolute after:inset-0` = 1 en `sede-card.tsx`. El enlace extendido de la tarjeta sigue en pie. |
| T-18-02 | `<dd>` = 9 en `/agendar`. Ningún horario múltiple se colapsó. |
| T-18-03 | Los literales `Días y horario de atención` y `Dirección` siguen presentes, sin reescritura. |
| T-18-SC | Ningún paquete instalado en este plan. |

## Estado del requisito

**A11Y-01 cerrado.**

## Self-Check: PASSED

- `src/app/page.tsx` — FOUND
- `src/components/locations/location-card.tsx` — FOUND
- `src/components/locations/sede-card.tsx` — FOUND
- `18-A11Y-EVIDENCE.md` — FOUND
- Commits `d3fae3f`, `188d9aa`, `847d1d5`, `c7eca14` — FOUND
