# A11Y-01 — Evidencia de cierre

**Fase:** 18 — Rendimiento y accesibilidad
**Plan:** 18-01
**Armado:** 2026-08-24 (tarea 3)
**Completado por el checkpoint:** pendiente (tarea 4)

Este archivo tiene dos mitades. La primera la escribe el ejecutor y contiene solo
lo que se puede establecer sin navegador: el diff, los conteos del HTML
prerenderizado y la corrida de la skill. La segunda queda rotulada y vacía, y la
llena quien corra Lighthouse.

---

## 1. Los tres cambios, resumidos

| # | Archivo | Cambio | Commit |
|---|---|---|---|
| 1 | `src/app/page.tsx` | Las cuatro ocurrencias de blanco translúcido sobre `bg-primary` (líneas 44, 50, 59 y 330) pasan a `text-white`. Se elimina el `hover:text-white` muerto del enlace del CMP y su `transition-colors duration-150` huérfana. | `d3fae3f` |
| 2 | `src/components/locations/location-card.tsx` | Los dos envoltorios de par pasan de `flex gap-3` a `grid grid-cols-[auto_1fr] items-start gap-x-3`; el `<svg>` se muda dentro del `<dt>`, la etiqueta `sr-only` pasa a un `<span>` interno, y cada `<dd>` recibe `col-start-2`. | `188d9aa` |
| 3 | `src/components/locations/sede-card.tsx` | El encabezado de la tarjeta pasa de `<h3>` a `<h2>`. La lista de clases y el `<Link>` con `after:absolute after:inset-0` quedan intactos. | `847d1d5` |

Ratio de contraste que produce el cambio 1: `#FFFFFF` sobre `#0E7C7E` = **5.00:1**,
por encima del umbral AA de 4.5:1 para texto normal. Los valores previos eran
4.07:1 (`/85`, líneas 44 y 330) y 3.53:1 (`/75`, líneas 50 y 59).

---

## 2. Conteos del HTML prerenderizado

Medidos sobre `.next/server/app/*.html` del build local, antes y después.

### Portada — `.next/server/app/index.html`

| Aserción | Antes | Después | Esperado |
|---|---|---|---|
| `text-white/` | 8 | **0** | 0 |
| `text-white/[0-9]+` en `src/app/page.tsx` | 4 | **0** | 0 |
| `text-white/[0-9]+` en todo `src/` | 4 | **0** | 0 |
| `hover:text-white` en `src/app/page.tsx` | 1 | **0** | 0 |
| `text-white` en `src/app/page.tsx` | — | **7** | > 0 |

### `/agendar` — `.next/server/app/agendar.html`

| Aserción | Antes | Después | Esperado |
|---|---|---|---|
| `grid-cols-[auto_1fr]` | 0 | **16** | 16 |
| `flex gap-3` | 16 | **0** | 0 |
| `<dl` | 4 | **4** | 4 |
| `<dt` | 8 | **8** | 8 |
| `<dd` | 9 | **9** | 9 |

Los nueve `<dd>` intactos son la prueba de que ningún horario múltiple se colapsó
(T-18-02 del registro de amenazas).

En el fuente: `grid-cols-[auto_1fr]` = 2, `col-start-2` = 2, `flex gap-3` = 0,
`sr-only` = 4, y los literales `Días y horario de atención` y `Dirección` siguen
presentes sin reescritura.

### `/sedes` — `.next/server/app/sedes.html`

| Aserción | Antes | Después | Esperado |
|---|---|---|---|
| `<h1` | 1 | **1** | 1 |
| `<h2` | 3 | **7** | 7 |
| `<h3` | 4 | **0** | 0 |

**Esta es la prueba del requisito para `/sedes`.** Lighthouse no penaliza un `<h3>`
sin `<h2>` previo cuando el resto del árbol es coherente: la ruta ya puntuaba 1,00
con los cuatro huérfanos puestos. El puntaje ahí es no regresión, no evidencia.

Invariantes que sobrevivieron:
`grep -c '<h3' src/components/locations/sede-card.tsx` = 0;
`font-heading text-lg font-bold text-primary` = 1;
`after:absolute after:inset-0` = 1;
`headingLevel = "h3"` en `location-card.tsx` = 1 (el default de `LocationCard` no
se movió, porque `/agendar` es su único consumidor y ahí el orden ya era correcto).

---

## 3. Las cinco compuertas

Corridas en cada uno de los tres commits, no solo al final.

| Compuerta | Commit 1 | Commit 2 | Commit 3 |
|---|---|---|---|
| `npm run build` | 0 | 0 | 0 |
| `npm run content:check` | 0 | 0 | 0 |
| `npm run seo:check` | 0 | 0 | 0 |
| `npm run sedes:check` | 0 | 0 | 0 |
| `npx tsc --noEmit` | 0 | 0 | 0 |

`scripts/check-sedes.mjs` lee `sedes.html` y solo cuenta `h1` y enlaces por sede,
así que la promoción `h3` → `h2` no toca ninguna de sus invariantes. Verificado:
la compuerta sale 0 después del cambio.

---

## 4. Corrida de la skill `impeccable`

Arranque: `node ~/.claude/skills/impeccable/scripts/context.mjs --target src/app/page.tsx`,
una vez en la sesión, con cwd en la raíz. Verbos: `polish` para el contraste,
`audit` para el `<dl>` y los encabezados.

Detector determinista (`scripts/detect.mjs`):

| Objetivo | Salida | Hallazgos |
|---|---|---|
| `src/app/page.tsx` | 0 | ninguno |
| `src/components/locations` | 0 | ninguno |

El hook de edición (`.impeccable/config.local.json`, consentimiento aceptado)
tampoco reportó nada sobre `location-card.tsx` al guardarlo.

Hallazgos de la revisión manual, que el detector no cubre:

- **Cerrado en este plan.** El `hover:text-white` de `page.tsx:59` había quedado
  sin efecto al subir el estado base a blanco opaco. `MASTER.md` exige que todo
  hover tenga transición visible: un hover que no cambia nada es deuda. Se
  eliminó junto con su `transition-colors duration-150` en el mismo commit que
  rompía su premisa, no en uno posterior.
- **No es defecto.** `src/components/locations/sede-card.tsx:42` usa la forma de
  `<div>` con un `<dt className="inline">` y un `<dd className="inline">` por par.
  Es válida: cada `<div>` contiene exactamente un término y un valor. Queda
  anotado para que nadie la "arregle" y le rompa el layout en línea.
- **Fuera de alcance, con veredicto propio en la sección 7.** El patrón de puntos
  del hero (`page.tsx:33`) y los bordes translúcidos.

Detector limpio no es prueba de calidad: el juicio visual vive en la sección 6.

---

## 5. Puntajes de Lighthouse por ruta

> **Sección del checkpoint (tarea 4). Pendiente.**
> Correr Lighthouse móvil, o Unlighthouse contra producción, que es como se
> tomaron las líneas base del 2026-08-23 y del 2026-08-24.

| Ruta | Accesibilidad antes | Accesibilidad después | `color-contrast` | `definition-list` | `dlitem` | `heading-order` | CLS |
|---|---|---|---|---|---|---|---|
| `/` | 0,97 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | 0 antes |
| `/agendar` | 0,93 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | 0 antes |
| `/sedes` | 1,00 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | 0 antes |

Cómo leer la tabla: las mejoras demostradas son la portada, desde 0,97, y
`/agendar`, desde 0,93. `/sedes` es no regresión.

---

## 6. Backstop de regresión visual

> **Sección del checkpoint (tarea 4). Pendiente.**
> Ninguna aserción de código demuestra que la retícula produce el mismo dibujo
> que el flex. Sin esta comparación registrada, el verificador no da pase.

Capturas de `/agendar` y `/sedes` a 375px, 768px y 1440px, antes y después,
comparadas píxel a píxel. Las cuatro fichas de sede tienen que entrar en la
captura de `/agendar`, incluida la del consultorio privado, que es la única que
renderiza `WhatsAppCta` en vez de la lista de canales.

| Ruta | Viewport | Diferencia observada | Veredicto |
|---|---|---|---|
| `/agendar` | 375px | _pendiente_ | _pendiente_ |
| `/agendar` | 768px | _pendiente_ | _pendiente_ |
| `/agendar` | 1440px | _pendiente_ | _pendiente_ |
| `/sedes` | 375px | _pendiente_ | _pendiente_ |
| `/sedes` | 768px | _pendiente_ | _pendiente_ |
| `/sedes` | 1440px | _pendiente_ | _pendiente_ |

Criterio: ninguna diferencia fuera de la opacidad del texto blanco sobre fondo
primario.

---

## 7. Veredicto de las filas `unresolved` de contraste

> **Sección del checkpoint (tarea 4). Pendiente.**
> La corrida de Lighthouse de la sección 5 es la evidencia que las cierra. Si no
> las marca, se anotan como decorativas y quedan cerradas. Si las marca, se abren
> como hallazgo nuevo para la fase 19 y **no se arreglan acá**: subir la opacidad
> de un borde sería un cuarto cambio visual fuera de los tres sancionados.

| Fila | Ubicación | Ratio | Lighthouse la marca | Veredicto |
|---|---|---|---|---|
| Patrón de puntos del hero | `src/app/page.tsx:33` | 4.17:1 sobre el píxel del punto (`#26898B`), 5.00:1 sobre el fondo del ancestro | _pendiente_ | _pendiente_ |
| Borde translúcido | `src/app/page.tsx:68` | 1.71:1 sobre fondo primario | _pendiente_ | _pendiente_ |
| Borde translúcido | `src/components/ui/whatsapp-cta.tsx:28` | 2.03:1 sobre fondo primario | _pendiente_ | _pendiente_ |
