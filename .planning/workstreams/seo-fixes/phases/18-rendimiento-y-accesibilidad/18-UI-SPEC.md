---
phase: 18
slug: rendimiento-y-accesibilidad
status: draft
shadcn_initialized: false
preset: none
created: 2026-08-24
---

# Phase 18 — UI Design Contract

> Contrato visual y de interacción de la fase. Generado por gsd-ui-researcher, verificado por gsd-ui-checker.

**Esta fase no inventa dirección visual.** v1.3 es refinamiento sobre un sitio ya publicado: se preserva la identidad visual. Este documento es una lista de **restricciones**, no una propuesta de diseño. Los únicos cambios de interfaz sancionados son los que se enumeran en `## Cambios visuales sancionados`. Cualquier otro cambio de estilo, layout, tipografía, color o espaciado que aparezca en un plan de esta fase está fuera de contrato.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (sin shadcn; el proyecto no tiene `components.json` y no se inicializa en esta fase) |
| Preset | not applicable |
| Component library | ninguna. Componentes propios en `src/components/`, Tailwind CSS 4 con `@theme inline` en `src/app/globals.css` |
| Icon library | `lucide-react` (más `src/components/icons/instagram-icon.tsx` propio) |
| Font | Poppins (`--font-heading`) para títulos, Inter (`--font-sans`) para cuerpo, vía `next/font/google` |

**Compuerta shadcn: deliberadamente no ejecutada.** Inicializar shadcn en una fase de remediación introduciría tokens y componentes nuevos en un sitio publicado, que es exactamente el rediseño que el milestone prohíbe (`ROADMAP.md`, "Restricción de diseño"). El sistema de diseño de este proyecto es `design-system/dr-angulo/MASTER.md` más las variables de `globals.css`, y esa es la fuente de verdad.

---

## Cambios visuales sancionados

Tres, y ninguno más:

| # | Cambio | Archivo | Requisito |
|---|--------|---------|-----------|
| 1 | Subir la opacidad del texto blanco sobre fondo primario a `text-white` | `src/app/page.tsx` (4 ocurrencias) | A11Y-01 |
| 2 | Reestructurar los `<dl>` de la ficha de sede sin cambio visual | `src/components/locations/location-card.tsx` | A11Y-01 |
| 3 | Promover el `<h3>` de la tarjeta de sede a `<h2>` sin cambio visual | `src/components/locations/sede-card.tsx` | A11Y-01 |

**La paleta de marca no se toca.** Ni `--primary`, ni `--accent`, ni ningún valor de `globals.css`. El arreglo de contraste es de opacidad de texto, no de color.

**El trabajo de rendimiento (CWV-01 a CWV-05) no tiene presupuesto visual.** Diferir, precargar o partir un bundle no puede cambiar un solo píxel de lo que el paciente ve. Si un plan de rendimiento necesita cambiar el aspecto de algo, ese plan está mal planteado y vuelve a revisión.

---

## Contrato de contraste

### Valores leídos, no supuestos

Tokens de `src/app/globals.css:3-28`. Ratios calculados con la fórmula de luminancia relativa de WCAG 2.1 sobre el color compuesto (`rgba(255,255,255,α)` sobre el fondo opaco).

**Corrección del 2026-08-24:** la columna "Color compuesto" tenía el alfa invertido (daba el compuesto de `1-α` en vez de `α`). Los seis valores quedaron recalculados con `α*255 + (1-α)*fondo`: `text-white/85` sobre `#0E7C7E` es `#DBEBEC`, no `#B2D8D9`. **Los ratios de la tercera columna siempre estuvieron bien** y ningún veredicto de la tabla cambia: el error era solo de etiqueta.

Fondo `--primary` = `#0E7C7E`:

| Clase | Color compuesto | Ratio vs `--primary` | 4.5:1 (texto normal) | 3:1 (texto grande) |
|-------|-----------------|----------------------|----------------------|---------------------|
| `text-white/60` | `#9FCBCB` | 2.83:1 | ✗ | ✗ |
| `text-white/70` | `#B7D8D8` | 3.29:1 | ✗ | ✓ |
| `text-white/75` | `#C3DEDF` | **3.53:1** | ✗ | ✓ |
| `text-white/80` | `#CFE5E5` | 3.80:1 | ✗ | ✓ |
| `text-white/85` | `#DBEBEC` | **4.07:1** | ✗ | ✓ |
| `text-white/90` | `#E7F2F2` | 4.37:1 | ✗ | ✓ |
| `text-white` | `#FFFFFF` | **5.00:1** | ✓ | ✓ |

**Objetivo numérico: 4.5:1 para texto normal, 3:1 para texto grande.** Texto grande según WCAG = 24px o más en peso normal, o 18.66px o más en negrita. En este sitio `text-lg` es 18px en peso normal (`node_modules/tailwindcss/theme.css:353`), así que **no califica como texto grande y necesita 4.5:1**. Esa es la razón por la que el párrafo del hero falla: 18px no es "large text".

`text-white` sobre `--primary` llega a 5.00:1. Pasa AA con 0.50 de margen, y falla AAA (7:1). AAA no es criterio de esta fase: el requisito A11Y-01 pide 1,00 en Lighthouse, que audita AA.

### Barrido de las 23 rutas

Barrido completo de `src/` por `text-white/NN`. **Cuatro ocurrencias, todas en la portada, todas sobre `bg-primary`, las cuatro fallan:**

| Archivo:línea | Clase actual | Tamaño | Ratio actual | Veredicto | Fija a |
|---|---|---|---|---|---|
| `src/app/page.tsx:44` | `text-lg text-white/85` | 18px / 400 | 4.07:1 | ✗ falla 4.5:1 | `text-white` |
| `src/app/page.tsx:50` | `text-sm text-white/75` | 14px / 400 | 3.53:1 | ✗ falla 4.5:1 | `text-white` |
| `src/app/page.tsx:59` | `text-sm text-white/75` | 14px / 400 | 3.53:1 | ✗ falla 4.5:1 | `text-white` |
| `src/app/page.tsx:330` | `text-lg text-white/85` | 18px / 400 | 4.07:1 | ✗ falla 4.5:1 | `text-white` |

Lighthouse reportó solo la línea 330. **Las otras tres son hallazgo de este barrido y entran al alcance de A11Y-01.** Las líneas 50 y 59 son peores que la reportada y ninguna auditoría las había marcado.

Detalle de la línea 59: el enlace de verificación del CMP ya tiene `hover:text-white`. Al pasar el estado base a `text-white` ese `hover:text-white` queda sin efecto y **debe eliminarse en el mismo commit**, junto con `transition-colors duration-150` si no queda ninguna otra transición de color en ese elemento. Un `hover:` que no cambia nada es deuda, y `MASTER.md` exige que todo hover tenga transición visible.

### Superficies que el barrido descartó, con su evidencia

No hay más patrón en riesgo. Verificado:

- **`bg-accent` (`#E8971F`) con texto blanco: no existe en el código.** `globals.css:12-13` documenta que blanco sobre ese dorado da 2.4:1 y que la superficie de CTA lleva `--foreground`. Confirmado: el cálculo da 2.37:1. La decisión ya estaba tomada y respetada.
- **`bg-whatsapp` (`#1A9C4D`) con `text-white`: 3.56:1.** Es el botón flotante (`whatsapp-float-button.tsx:33`), cuyo contenido es un ícono, no texto. Como componente de interfaz no textual el umbral es 3:1 y lo pasa. `globals.css:20-21` ya documenta que el verde se oscureció justo para eso. No se toca.
- **`text-foreground/70` y `/80` sobre `--background` y sobre `--muted`:** 5.40:1 y 7.45:1 sobre `#FAFAF9`; 5.32:1 y 7.34:1 sobre `#ECFAFA`. Todos pasan. No se tocan.
- **`text-accent-strong` (`#9A5C00`) sobre fondos claros:** 5.1:1 según `globals.css:17`. Pasa.
- **`src/components/locations/sede-card.tsx:42` (`<dl>` de horarios):** ver `## Contrato de estructura del <dl>`. Válido, no se toca.

### El patrón de puntos del hero

`src/app/page.tsx:33` superpone `opacity-10` con `radial-gradient(circle, white 1.5px, transparent 1.5px)` sobre `bg-primary`. En los píxeles del punto el fondo efectivo es `#26898B`, y ahí **`text-white` llega a 4.17:1, no a 5.00:1**.

Esto no bloquea nada y **no se arregla en esta fase**:
- Lighthouse y axe evalúan el `background-color` computado del ancestro (`#0E7C7E`), no el patrón: van a reportar 5.00:1 y pasar. A11Y-01 se cumple.
- Los puntos cubren ~1,2% del área (π·1,5² sobre una retícula de 24×24px), y son sub-glífico: ningún trazo de letra queda enteramente sobre un punto.
- Corregirlo obligaría a tocar el overlay de marca, que está fuera de los tres cambios sancionados.

Queda registrado como `⚠ unresolved` con la evidencia que lo cerraría: un muestreo de contraste por píxel sobre una captura renderizada del hero a 375px y a 1440px. Si ese muestreo dijera que un trazo cae bajo 4.5:1, se abre como hallazgo nuevo, no como parte de A11Y-01.

---

## Contrato del montaje diferido

### Lo que hay que proteger

**CLS = 0 en las 23 rutas.** Es el mejor número de Core Web Vitals que tiene el sitio y ninguna optimización de esta fase puede gastarlo. Un cambio que baje TBT de 850 ms a 150 ms pero suba CLS de 0 a 0,05 es un retroceso, no una mejora, y el verificador debe rechazarlo.

### Lectura del código, previa al perfilado

El perfilado con throttling 4x sigue siendo obligatorio (`18-CONTEXT.md`, "Perfilar antes de tocar"). Estos son los hechos que el perfilado tiene que confirmar o desmentir, no un reemplazo del perfilado:

**`GoogleReviewsSection` no puede ser el culpable del forced reflow.** `src/components/reviews/google-reviews.tsx` no tiene `"use client"`, no tiene hooks y no tiene handlers. Es un Server Component puro: no emite un solo byte de JavaScript de cliente. Los 630 ms de forced reflow requieren que JS lea geometría de layout de forma síncrona, y este componente no ejecuta JS en el navegador. Puede contribuir a los 2,45 s de Style & Layout por volumen de DOM y CSS, pero no al reflow forzado.

**`ReelsCarousel` reúne todos los ingredientes del forced reflow.** `src/components/instagram/reels-carousel.tsx`:
- `updateEdges()` (línea 20) lee `el.scrollWidth`, `el.clientWidth` y `el.scrollLeft` — tres propiedades que fuerzan layout síncrono.
- Está enganchado a `onScroll` sin `requestAnimationFrame` (línea 72): un reflow forzado por evento de scroll.
- Está enganchado a un `ResizeObserver` sobre el propio scroller (líneas 32-34). Ese observer llama a `setState`, el render puede cambiar la geometría y el observer vuelve a disparar: es un bucle observer → estado → layout → observer.
- `scrollByCards()` (línea 37) lee `card.clientWidth` en cada clic.

**Sospechoso primario: `ReelsCarousel`.** El perfilado confirma o descarta; el contrato de abajo aplica igual sea quien sea.

### La forma del arreglo: preservar el HTML del servidor

**Regla dura: el HTML servido de `/testimonios` sale idéntico antes y después.** Ni un nodo más, ni un nodo menos, ni una clase distinta.

Con esa regla el problema del placeholder desaparece: si el marcado servido no cambia, el navegador pinta el carrusel completo en el primer frame y **no hay ningún momento en el que algo ocupe el espacio de otra cosa**. CLS = 0 deja de ser algo que hay que cuidar y pasa a ser estructuralmente imposible de romper. Esta es la forma que el contrato exige.

Lo que sí se difiere es el **trabajo de cliente**, no el marcado:
- El `ResizeObserver` y la primera corrida de `updateEdges()` se montan cuando la sección entra en viewport (`IntersectionObserver`), no en la hidratación.
- El handler de `onScroll` agrupa sus lecturas en `requestAnimationFrame` y descarta las corridas pendientes, para que un gesto de scroll produzca una lectura de layout por frame y no una por evento.
- Estado inicial de los botones: `atStart = true`, `atEnd = false`, que es exactamente el estado que ya tienen hoy antes del primer efecto (líneas 17-18). Sin cambio visual en el primer frame.

Consecuencia para el planificador: **`dynamic(..., { ssr: false })` está prohibido en esta fase.** Dos motivos independientes:
1. Borra el HTML del servidor y obliga a un placeholder, que es el único camino por el que CLS puede dejar de ser 0.
2. `InstagramReelsSection` es un Server Component `async`, y la doc de Next 16 es explícita: `ssr: false` no está permitido con `next/dynamic` en Server Components (`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`). Habría que introducir un envoltorio de cliente solo para poder degradar el resultado.

La misma doc advierte que cuando un Server Component importa dinámicamente un Client Component **el code splitting automático no está soportado**, así que `dynamic()` sin `ssr: false` tampoco compraría bundle acá. El camino es el de arriba.

**`content-visibility: auto` sin `contain-intrinsic-size` está prohibido.** Es la vía rápida para bajar Style & Layout y también la vía rápida para introducir CLS. Si un plan lo propone, tiene que declarar el `contain-intrinsic-size` exacto por breakpoint, y ese tamaño tiene que coincidir con las alturas de la tabla de abajo.

### Backstop: el placeholder, si el perfilado obliga a `ssr: false`

Si el perfilado demuestra que la hidratación misma es el costo y que no hay forma de conservar el SSR, hace falta un placeholder. Estas son sus dimensiones. **Antes de tomar este camino hay que subir la decisión a Juan**, porque arrastra un cuarto cambio visual que hoy no está sancionado (ver la nota del final).

Geometría actual, derivada del código (`reels-carousel.tsx:47-119`) y de los defaults de Tailwind 4 (`text-sm` = 14px / 20px de interlínea, `p-4` = 16px, `gap-6` = 24px, `size-11` = 44px, `mb-4`/`pb-4` = 16px):

| Pieza | < 640px | ≥ 640px |
|---|---|---|
| Ancho del `<li>` | 240px (`w-[240px]`) | 260px (`sm:w-[260px]`) |
| Borde de la tarjeta | 1px por lado | 1px por lado |
| Ancho interior | 238px | 258px |
| Alto de la miniatura (`aspect-[9/16]`) | 423px | 459px |
| Bloque de texto (`p-4` + 2 párrafos `text-sm` + `mt-2`) | 80px con título de 1 línea | 80px con título de 1 línea |
| **Alto de tarjeta, título de 1 línea** | **505px** | **541px** |
| **Alto de tarjeta, título de 2 líneas** | **525px** | **561px** |
| Fila de controles (`mb-4` + `size-11`) | 60px | 60px |
| `pb-4` del scroller | 16px | 16px |
| **Alto reservado total** | **601px** (peor caso 2 líneas) | **637px** (peor caso 2 líneas) |

Aspecto del placeholder: la misma tarjeta, con `bg-muted` (`#ECFAFA`) en el bloque de la miniatura —que ya es el fondo del contenedor de la imagen hoy, `reels-carousel.tsx:93`— y `border-border` (`#D7EFEF`), `rounded-xl`, sin sombra, sin animación de pulso. Nada de skeletons animados: `MASTER.md` no tiene ese patrón y el sitio no lo usa en ninguna parte. Marcado `aria-hidden="true"`, sin texto: no anuncia nada al lector de pantalla, porque no hay nada que anunciar todavía.

Transición al montar: `opacity` de 0 a 1 en 200 ms con `cubic-bezier(0.16, 1, 0.3, 1)`, la curva única del sitio (`globals.css:118`), y respetando `prefers-reduced-motion` por la regla global de `globals.css:208-220`. **Nunca `transform` ni `height`**: cualquiera de los dos mueve el layout.

**El problema abierto de este camino, dicho de frente.** El alto de la tarjeta depende de si el título del reel ocupa una o dos líneas, y el título viene de la API de Instagram en tiempo de build. El `<ul>` es `flex` y su alto lo fija la tarjeta más alta, que no se conoce estáticamente. Si el placeholder reserva 601px y el contenido real mide 581px, el swap encoge el layout y **eso es CLS**. Volverlo determinista exige fijar el título a dos líneas exactas (`line-clamp-2` más un alto mínimo de 40px), y eso **cambia el aspecto de los títulos de una línea**: es un cuarto cambio visual, fuera de los tres sancionados. Por eso este camino no se toma sin aprobación explícita.

### Sobre el bloque de reseñas

Si el perfilado señala a `GoogleReviewsSection`, el arreglo **no es diferir el montaje**: es un Server Component, no hay montaje de cliente que diferir. Sería reducir el DOM o el costo de estilo. El contrato es el mismo: `CLS = 0` y HTML servido idéntico.

Dato de estado: `GOOGLE_PLACES_API_KEY` está configurada, así que el bloque de reseñas sí renderiza. Del token de Instagram no hay evidencia en el repo (ver `## UI Considerations`, fila `unresolved`).

---

## Contrato de estructura del `<dl>`

### El defecto exacto

`src/components/locations/location-card.tsx:47-95`. El modelo de contenido de `<dl>` admite dos formas: hijos `<dt>`/`<dd>` directos, o hijos `<div>` donde **cada `<div>` contiene únicamente uno o más `<dt>` seguidos de uno o más `<dd>`**. La ficha usa la segunda forma y la viola: el `<div class="flex gap-3">` contiene un `<svg>` y otro `<div>`, y el `<dt>` queda a dos niveles de profundidad. El lector de pantalla no puede emparejar término y valor.

`src/components/locations/sede-card.tsx:42-51` usa la misma forma de `<div>` y **es válida**: sus `<div>` contienen exactamente un `<dt>` y un `<dd>`, nada más. **Ese archivo no se toca en el arreglo estructural** (sí en el de encabezados). Se deja dicho para que nadie lo "arregle" y le rompa el layout en línea.

### La forma exacta que se exige

Restricción de layout a preservar: columna de ícono de ancho automático, `gap` horizontal de 12px (`gap-3`), ícono alineado arriba con `mt-0.5`, y los renglones de horario apilados verticalmente en la segunda columna. Con `flex` no se puede: si se quitan los `<div>` internos, los múltiples `<dd>` del horario se acomodan en fila en vez de apilarse.

**El envoltorio pasa de `flex` a grid de dos columnas, y `<dt>` y `<dd>` quedan como hijos directos:**

```
<dl className="space-y-4">
  <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
    <dt>
      <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <span className="sr-only">Días y horario de atención</span>
    </dt>
    {location.schedule.map((block) => (
      <dd key={block.days} className="col-start-2 text-foreground/80">
        <span className="font-semibold text-foreground">{block.days}:</span> {block.hours}
      </dd>
    ))}
  </div>
  ...
</dl>
```

Por qué el resultado visual es idéntico:
- `grid-cols-[auto_1fr]` reproduce lo que hacía `flex` con `shrink-0` en el ícono: primera pista al tamaño del ícono, segunda ocupando el resto.
- `gap-x-3` es el mismo 12px que `gap-3`.
- `items-start` evita que el `<dt>` se estire a la altura de la fila, que es lo que hacía `shrink-0` dentro del flex.
- `col-start-2` fuerza cada `<dd>` a la segunda columna. El primero comparte fila con el `<dt>`, los siguientes bajan a filas nuevas. Es la misma pila vertical que producían los `<dd>` de bloque dentro del `<div>` interno.
- `mt-0.5 size-5` siguen sobre el `<svg>`, que ahora vive dentro del `<dt>` en vez de ser hermano suyo. La caja del ícono no cambia.
- El bloque de la dirección tiene un solo `<dd>` y la misma retícula lo resuelve sin variantes.

**No se conservan múltiples `<dd>` colapsándolos en uno solo.** Un término con varios valores es exactamente lo que `<dl>` modela, y colapsarlos convertiría un arreglo de accesibilidad en una pérdida de semántica.

Verificación de "idéntico": captura de `/agendar` a 375px, 768px y 1440px antes y después, comparadas píxel a píxel. Las cuatro fichas de sede, incluida la del consultorio privado, que es la única que renderiza `WhatsAppCta` en vez de la lista de canales.

### El patrón `sr-only` en el `<dt>`

**Sobrevive, con un cambio de ubicación.** Hoy el `sr-only` está en el propio `<dt>` (líneas 51 y 64). En la estructura nueva el `<dt>` carga el ícono, así que ya no puede ser invisible entero: la clase se mueve a un `<span class="sr-only">` dentro del `<dt>`. El lector de pantalla anuncia el mismo texto de término que hoy; visualmente sigue sin verse nada. El `aria-hidden="true"` del `<svg>` se mantiene, así que el `<dt>` tiene exactamente un contenido accesible: la etiqueta.

**Los dos textos siguen siendo los correctos y no se reescriben:**

| `<dt>` | Texto | Veredicto |
|---|---|---|
| Horario | "Días y horario de atención" | Correcto. Nombra las dos cosas que los `<dd>` contienen (`block.days` y `block.hours`) y desambigua del horario de otras sedes. |
| Dirección | "Dirección" | Correcto. El `<dd>` incluye calle, distrito, edificio, referencia y el enlace a Maps: todo eso es la dirección. |

Ninguno de los dos anuncia el ícono ("reloj", "pin"), que es la falla típica de este patrón. Ya estaban bien redactados.

---

## Contrato del orden de encabezados

### El defecto

`/sedes` renderiza `SedeCard` cuatro veces (`src/app/sedes/page.tsx:40-44`), y cada tarjeta abre con un `<h3>` (`src/components/locations/sede-card.tsx:30`). El único `<h1>` de la página está en la línea 31 y el primer `<h2>` recién aparece en la línea 49, **después** de la grilla de tarjetas. Los cuatro `<h3>` no tienen `<h2>` previo.

Es también el nivel semánticamente equivocado: cada sede es una sección hermana del hub, no una subsección de nada.

### Lo que debe quedar constante

Clase actual del `<h3>`: `font-heading text-lg font-bold text-primary`.

**Se cambia únicamente la etiqueta, de `h3` a `h2`. La lista de clases queda carácter por carácter igual.**

Por qué eso basta para que el aspecto no cambie: el preflight de Tailwind 4 declara `font-size: inherit` y `font-weight: inherit` para `h1`–`h6` (`node_modules/tailwindcss/preflight.css:78-84`). Los encabezados no traen tamaño ni peso de agente de usuario, y las clases ya llevan el tamaño (`text-lg`) y el peso (`font-bold`) de forma explícita. El margen tampoco cambia: el preflight lo pone en cero para todos los niveles y el espaciado lo dan las utilidades del contenedor. **El resultado es idéntico píxel a píxel, no "parecido".**

Restricciones que el ejecutor tiene que sostener:
- El `<h3>` de `sede-card.tsx:30` contiene un `<Link>` con `after:absolute after:inset-0` (enlace extendido sobre la tarjeta). Ese `<Link>` y sus clases no se tocan: mover el enlace rompe el área clicable de la tarjeta entera.
- La clase `font-heading text-lg font-bold text-primary` no se "normaliza", ni se acorta, ni se reordena.
- Después del cambio, el orden de `/sedes` es `h1` → cuatro `h2` de sede → `h2` "¿Prefieres comparar los días antes de elegir?" (línea 49). Sin saltos.

### Lo que NO se toca

`LocationCard` (`location-card.tsx:9`, `20`) recibe `headingLevel` con default `"h3"`. En `/agendar` sus dos usos (líneas 67 y 82) van precedidos de `<h2>` en las líneas 63 y 73, así que el orden ahí es correcto. **El default de `LocationCard` se deja en `"h3"`.** Cambiarlo rompería `/agendar`, que es la única ruta que lo usa.

`SedeCard` no acepta `headingLevel` y solo lo usa `/sedes`. No hace falta parametrizarlo: se cambia la etiqueta en el componente y ya. Agregar una prop para un solo consumidor es complejidad sin comprador.

---

## Spacing Scale

Sin cambios. Escala existente de `design-system/dr-angulo/MASTER.md`, múltiplos de 4:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Separaciones estrechas |
| sm | 8px | Espaciado en línea, gaps de ícono |
| md | 16px | Padding estándar |
| lg | 24px | Padding de sección |
| xl | 32px | Gaps grandes |
| 2xl | 48px | Márgenes de sección |
| 3xl | 64px | Padding del hero |

Excepciones que esta fase debe respetar y no "corregir":
- Objetivos táctiles de 44px (`size-11`, `min-h-11`): los botones del carrusel, el enlace de verificación del CMP y el "Ver la sede" de la ficha. Es el mínimo de `MASTER.md`, no un valor suelto de la escala.
- `gap-x-3` (12px) en la retícula del `<dl>`: preserva el `gap-3` actual. Cambiarlo a 16px sería un cambio visual no sancionado.
- `mt-0.5` (2px) en los íconos del `<dl>`: alineación óptica del ícono con la primera línea de texto. Se conserva tal cual.

---

## Typography

Sin cambios. Se declara lo que ya está en uso en las superficies que toca la fase, para que el ejecutor no lo altere al editar:

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 18px (`text-lg`) | 400 | 1.556 (28px) |
| Label | 14px (`text-sm`) | 400 / 600 | 1.429 (20px) |
| Heading | 24px → 30px `sm:` (`text-2xl`/`text-3xl`), Poppins | 700 | 1.2 |
| Display | 30px → 36px `sm:` → 48px `lg:` (`text-3xl`/`4xl`/`5xl`), Poppins | 800 | `leading-tight` (1.25) |

Sub-encabezado de tarjeta: 18px (`text-lg`), Poppins, 700 — es el `<h2>` de `sede-card.tsx` después de la promoción de nivel.

**Nota de contraste, no de tipografía:** `text-lg` = 18px en peso 400 **no** es "texto grande" de WCAG (el umbral es 24px en normal o 18.66px en negrita). Es la razón de que el párrafo del hero necesite 4.5:1 y no 3:1. Si alguien pensara en subir el cuerpo a 24px para pasar con menos opacidad, eso sería rediseño y está prohibido: la corrección va por opacidad.

---

## Color

Sin cambios en ningún token. Valores leídos de `src/app/globals.css:3-28`:

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FAFAF9` (`--background`) | Fondo general de página |
| Secondary (30%) | `#0E7C7E` (`--primary`) + `#ECFAFA` (`--muted`) | Header, footer, bandas de sección, tarjetas, resaltado `:target` |
| Accent (10%) | `#E8971F` (`--accent`) | Ver lista reservada abajo |
| Destructive | `#DC2626` (`--destructive`) | Solo errores de formulario. Esta fase no tiene acciones destructivas. |

Accent reservado exclusivamente para: superficie del botón "Agendar cita" (`BookingCta`) y las estrellas llenas de la calificación de Google (`google-reviews.tsx:20`). Nada más. Su variante de texto `--accent-strong` (`#9A5C00`, 5.1:1 sobre fondos claros) es la que se usa para etiquetas sobre fondo claro.

Fuera de paleta general por convención reconocible: `--whatsapp` (`#1A9C4D`), solo el botón flotante.

**Esta fase no agrega, quita ni redefine ningún token de color.** Ni siquiera para arreglar el contraste: la corrección es de opacidad.

---

## Copywriting Contract

Esta fase no introduce superficies nuevas ni copy nuevo. Se declara lo que ya existe y no se reescribe:

| Element | Copy |
|---------|------|
| Primary CTA (portada, hero) | "Agendar cita" |
| Primary CTA (portada, cierre) | "Ver sedes y agendar" |
| Primary CTA (`/sedes`) | "Ver agenda y horarios" |
| Empty state — carrusel de reels | "Los videos están publicados en @dr.juancarlosangulo." con enlace al perfil (`instagram-reels-section.tsx:58-71`) |
| Empty state — reseñas de Google | El bloque no renderiza (`return null`, `google-reviews.tsx:58`). Sin copy: sin reseñas, no hay sección. |
| Error state | No aplica. Ninguna superficie de esta fase tiene estado de error de cara al usuario: los fallos de API caen en el vacío o en el estado vacío. |
| Destructive confirmation | No aplica. Esta fase no tiene acciones destructivas. |
| Etiqueta `sr-only` — horario | "Días y horario de atención" (se conserva, ver contrato del `<dl>`) |
| Etiqueta `sr-only` — dirección | "Dirección" (se conserva) |

**Ningún texto visible cambia en esta fase.** Si un plan propone reescribir copy, no pertenece a la fase 18: el copy de interfaz va por `impeccable clarify` y vive en las fases 16 y 19.

Nota para el placeholder de backstop: no lleva texto. Un "Cargando videos…" sería copy nuevo, ocuparía alto variable y le hablaría al lector de pantalla de algo que no le importa. El placeholder va `aria-hidden`.

---

## UI Considerations

Applicable state considerations resolved: 7 covered, 3 backstop, 3 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| contrast | `page.tsx:44,50,59,330` (texto blanco sobre `bg-primary`) | ✅ covered | Las cuatro ocurrencias pasan a `text-white` y alcanzan 5.00:1 sobre `#0E7C7E`, por encima del umbral de 4.5:1 para texto normal. Ninguna otra ruta del sitio usa `text-white/NN`. |
| contrast | `page.tsx:59` (enlace de verificación del CMP) | ✅ covered | Con el estado base en `text-white`, `hover:text-white` se elimina en el mismo commit; no queda ningún hover sin cambio visible. |
| semantics | `location-card.tsx:47-95` (`<dl>` de las cuatro fichas de `/agendar`) | ✅ covered | Envoltorio a `grid grid-cols-[auto_1fr] items-start gap-x-3` con `<dt>` y `<dd>` como hijos directos del `<div>` y `col-start-2` en cada `<dd>`. Los múltiples `<dd>` del horario se conservan. |
| semantics | `location-card.tsx` etiquetas `sr-only` de `<dt>` | ✅ covered | `sr-only` se mueve del `<dt>` a un `<span>` interno; el `<svg>` conserva `aria-hidden="true"`. El texto anunciado es idéntico al de hoy y ambas etiquetas siguen siendo las correctas. |
| heading-order | `sede-card.tsx:30` renderizado por `/sedes` | ✅ covered | `h3` → `h2` conservando la lista de clases carácter por carácter. El preflight de Tailwind 4 (`preflight.css:78-84`) pone `font-size: inherit` y `font-weight: inherit` en `h1`–`h6`, así que el render es idéntico. |
| heading-order | `location-card.tsx` prop `headingLevel` | ✅ covered | Su default `"h3"` no se toca: `/agendar` es el único consumidor y sus dos usos ya tienen `<h2>` previo (líneas 63 y 73). |
| semantics | `sede-card.tsx:42-51` (`<dl>` de horarios) | ✅ covered | Ya es válido: cada `<div>` contiene exactamente un `<dt>` y un `<dd>`. Queda explícitamente fuera del arreglo estructural para que nadie le rompa el layout en línea. |
| layout-shift | Carrusel de reels en `/testimonios` | 🧪 backstop | El contrato exige que el HTML servido salga idéntico y que solo se difiera el trabajo de cliente (`IntersectionObserver` para el `ResizeObserver`, `requestAnimationFrame` en `onScroll`). Verificación: CLS medido en `/testimonios` sigue en 0 después del cambio, con throttling 4x. Sin esa evidencia explícita el verificador no da pase. |
| layout-shift | Placeholder de montaje diferido (solo si se aprueba `ssr: false`) | 🧪 backstop | Alto reservado 601px bajo 640px y 637px desde 640px, con `bg-muted` sobre `border-border` y transición de opacidad de 200 ms. Verificación: captura comparada antes y después, más CLS = 0. Camino no aprobado: arrastra un cuarto cambio visual (título a 2 líneas fijas) fuera del alcance sancionado. |
| visual-regression | `/agendar` tras el arreglo del `<dl>` y `/sedes` tras el de encabezados | 🧪 backstop | Verificación: capturas a 375px, 768px y 1440px antes y después, comparadas píxel a píxel, incluida la ficha del consultorio privado que renderiza `WhatsAppCta` en lugar de la lista de canales. Se declara backstop y no covered porque solo una captura real lo demuestra. |
| contrast | Patrón de puntos del hero (`page.tsx:33`) | ⚠ unresolved | Sobre los píxeles del punto el fondo efectivo es `#26898B` y `text-white` llega a 4.17:1, no a 5.00:1. Cubre ~1,2% del área y las herramientas automáticas evalúan `#0E7C7E`, así que A11Y-01 pasa igual. Evidencia que lo cerraría: muestreo de contraste por píxel sobre captura renderizada del hero a 375px y a 1440px. Corregirlo tocaría el overlay de marca, fuera de los tres cambios sancionados. |
| contrast | `border-white/30` (`page.tsx:68`) y `border-white/40` (`whatsapp-cta.tsx:28`) sobre `bg-primary` | ⚠ unresolved | 1.71:1 y 2.03:1, bajo el 3:1 de componentes de interfaz no textuales (WCAG 1.4.11). Ambos botones tienen etiqueta visible en `text-white` a 5.00:1, así que el borde puede ser decorativo y el criterio no aplicaría. No lo reportó ninguna auditoría. Evidencia que lo cerraría: la corrida de Unlighthouse de esta fase sobre la portada; si no lo marca, se cierra como decorativo. Subir la opacidad del borde sería un cuarto cambio visual. |
| empty | `/testimonios` en producción: reels y reseñas | ⚠ unresolved | `GOOGLE_PLACES_API_KEY` está en `.env`, así que el bloque de reseñas renderiza. Del token de Instagram no hay evidencia en el repo: ni `INSTAGRAM_ACCESS_TOKEN` en `.env` ni `.data/instagram-token.json`, y `PRODUCT.md` dice que el carrusel está "en fallback hasta configurar el token". **Si en producción el carrusel cae en fallback, el marcado auditado no contenía el carrusel y el culpable de los 2,45 s de Style & Layout es otro.** Evidencia que lo cerraría: `curl` del HTML de `/testimonios` en producción, buscando si el `<ul>` de reels existe. Es lo primero que tiene que hacer el perfilado, antes de tocar nada. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| ninguno | ninguno | no aplica |

Sin shadcn y sin registries de terceros. Esta fase no incorpora componentes externos: `lucide-react` ya es una dependencia del proyecto y no se agregan íconos nuevos. La compuerta de vetting no tiene nada que vetar.

---

## Obligaciones de proceso para el planificador

Del `18-CONTEXT.md` y del `ROADMAP.md`, que el UI-SPEC no sustituye:

- Ruteo de verbos de `impeccable`: `audit` para los tres fallos de accesibilidad y su verificación, `polish` para el arreglo de contraste, `optimize` para `/testimonios`, la imagen LCP y el bundle.
- La skill es global: `~/.claude/skills/impeccable/`. No hay copia local. Arranque una vez por sesión con `node ~/.claude/skills/impeccable/scripts/context.mjs --target <ruta>`, con cwd en la raíz del repo. El `ROADMAP.md` cita una ruta local (`.claude/skills/impeccable/...`) que **no existe**: vale la del `18-CONTEXT.md`.
- Las cinco compuertas (`content:check`, `seo:check`, `sedes:check`, `tsc --noEmit`, `build`) salen en 0 en cada commit y las cinco aparecen en el `<verify>` de cada ola.
- Perfilar antes de tocar `/testimonios`. Empezando por confirmar qué renderiza esa ruta en producción (ver la fila `unresolved` de arriba).

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
