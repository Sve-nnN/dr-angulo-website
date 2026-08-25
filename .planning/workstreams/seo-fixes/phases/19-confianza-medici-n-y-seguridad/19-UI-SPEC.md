---
phase: 19
slug: confianza-medicion-y-seguridad
status: draft
shadcn_initialized: false
preset: none
created: 2026-08-25
---

# Phase 19 — UI Design Contract

> Contrato visual y de interacción de la fase 19. Solo cubre las dos superficies con consecuencia visual: la sección de citas ("De dónde sale esto") y los dos módulos de contenido de los hubs. MEAS-01 y MEAS-02 no son diseño y no aparecen acá.
>
> **v1.3 es refinamiento, no rediseño.** Este documento no propone dirección visual nueva: reusa el vocabulario que el sitio ya tiene y lo fija por escrito para que el ejecutor no improvise.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — no hay `components.json`, no hay shadcn, y no se inicializa en esta fase |
| Preset | not applicable |
| Component library | ninguna. Componentes propios en `src/components/`, Tailwind CSS 4 con tokens en `src/app/globals.css` |
| Icon library | `lucide-react` (ya en uso en 24 archivos; ningún emoji como ícono, por `design-system/dr-angulo/MASTER.md`) |
| Font | Poppins (`--font-heading`, pesos 600/700/800) e Inter (`--font-sans`, 400/500/600), self-hosted por `next/font/google` |

**Gate de shadcn: no aplica.** El proyecto es Next.js 16 App Router, pero tiene un design system propio, documentado y vinculante (`design-system/dr-angulo/MASTER.md` + los tokens de `globals.css`). Introducir shadcn en una fase de refinamiento sería el rediseño que el ROADMAP prohíbe explícitamente (`## Restricción de diseño`). Registry safety: no aplica, no hay registries.

**Ruteo de verbo de `impeccable`** (ROADMAP, `## Restricción de diseño`):

| Trabajo de esta fase | Verbo |
|---|---|
| Sección de citas: componente nuevo + campo nuevo en el modelo de sección | `layout` |
| Prosa nueva en `/blog` y `/sedes` sin mover nada de lo existente | `clarify` |
| Mover los dos hubs a módulo de contenido (refactor sin cambio visual) | `clarify` — no cambia estructura visible; si el ejecutor descubre que sí la cambia, el cambio está fuera de contrato y se detiene |

La skill es **global**: `node ~/.claude/skills/impeccable/scripts/context.mjs --target <archivo>`. **No existe copia local en `.claude/skills/`** — el ROADMAP la cita con ruta relativa y esa ruta está mal. Correr una vez por sesión antes de tocar interfaz.

---

## Spacing Scale

Escala de 4, heredada de `MASTER.md` (`--space-xs`…`--space-3xl`) y expresada con utilidades de Tailwind. Valores que esta fase tiene permitido usar:

| Token | Value | Utilidad | Usage en esta fase |
|-------|-------|----------|--------------------|
| xs | 4px | `gap-1` | Separación entre el texto del enlace y el ícono `ArrowUpRight` |
| — | 12px | `mt-3` | Línea de respaldo debajo del nombre de la fuente |
| md | 16px | `pl-4` | Sangría de la regla izquierda de cada cita |
| lg | 24px | `mt-6`, `space-y-6` | Aire entre el párrafo introductorio y la lista; separación entre citas |
| xl | 32px | `mt-8` | Reservado; no se espera usarlo |
| 2xl | 48px | `mt-12` | Ritmo entre secciones que `ContentBody` ya aplica (`sectionClassName = "mt-12"`) |
| — | 56px | `mt-14` | Bloque "Sigue leyendo" en los hubs (valor existente, no se toca) |
| 3xl | 64px | `mt-16` | Envoltorio de la prosa nueva en `/blog` y `/sedes`, igual que `/servicios` |

**Excepción declarada:** `min-h-11` = 44px en todo enlace de cita. No es múltiplo de 8 y es deliberado: es el objetivo táctil mínimo de A11Y.md, ya usado en todos los enlaces de lista del sitio (`table-of-contents.tsx:39`, `servicios/page.tsx:76`, `sedes/[slug]/page.tsx:168`). No se reduce.

Prohibido en esta fase: cualquier valor de espaciado que no esté en esta tabla, y cualquier `mt-*` nuevo aplicado a un elemento preexistente de `/blog` o `/sedes`.

---

## Typography

El sitio ya tiene su escala; esta fase no la amplía. Estos son los únicos roles que puede usar:

| Role | Size | Weight | Line Height | Dónde |
|------|------|--------|-------------|-------|
| Encabezado de sección (guías, hubs) | 24px → 30px en `sm` | 700 (`font-bold`, Poppins) | 1.25 | El `<h2>` de "De dónde sale esto" en guías y hubs. Lo emite `ContentBody` con `headingSize="lg"` — no se declara a mano |
| Encabezado de sección (posts) | 20px → 24px en `sm` | 700 (Poppins) | 1.25 | El mismo `<h2>` en los 4 posts. `headingSize="md"` — ya lo pone la plantilla |
| Cuerpo de sección | 18px (`text-lg`) | 400 (Inter) | 1.556 | El párrafo introductorio de la sección de citas y toda la prosa nueva de los hubs |
| Cuerpo subordinado | 16px (`text-base`) | 400 (Inter) | 1.5 | La línea "qué respalda" de cada cita |
| Rótulo enlazado | 16px (`text-base`) | 700 (Poppins, `font-heading`) | 1.5 | El nombre de la fuente, que es el enlace |

**Cómo se logra la subordinación visual sin que parezca añadido al final:**

- El `<h2>` conserva **la escala completa de cualquier otra sección** de la página. La sección de citas es una sección de contenido, no un pie. Bajarle el encabezado es exactamente lo que la haría parecer un añadido.
- La subordinación vive **en el cuerpo, no en el encabezado**: la línea de respaldo cae a 16px mientras la prosa clínica queda a 18px. Es el mismo mecanismo que ya usan `ConsultAlert` (16px) y `MedicalDisclaimer` (16px) para leerse como material de apoyo sin perder contraste.
- Ningún texto de esta fase baja de 16px. `text-sm` (14px) está **prohibido** en la sección de citas: el sitio atiende adultos mayores con posible baja visión (`PRODUCT.md`, `## Accessibility & Inclusion`) y una bibliografía en 14px es la forma clásica de decir "esto no importa".

---

## Color

Reparto del sitio, sin cambios (`globals.css`, `MASTER.md`):

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FAFAF9` `--background` | Fondo de la página; la sección de citas se apoya en él **sin superficie propia** |
| Secondary (30%) | `#ECFAFA` `--muted` + `#D7EFEF` `--border` | Tarjetas y bordes. Acá solo aporta el `--border` de la regla izquierda |
| Accent (10%) | `#E8971F` `--accent` | Reservado a: botón "Agendar cita" (`BookingCta`), banner de conversión (`MidContentCta`), CTA de WhatsApp variante `accent`. **Nada de esta fase usa accent** |
| Destructive | `#DC2626` `--destructive` | Solo `ConsultAlert` y errores de formulario. **Prohibido acá** |

**Accent reserved for:** botón de agendar, banner de conversión de mitad de cuerpo, CTA de WhatsApp. No para enlaces, no para citas, no para prosa de hub.

**Reglas de color de la sección de citas:**

1. **Sin fondo propio.** Nada de `bg-muted`, nada de `bg-white`, nada de `rounded-2xl`. `MedicalDisclaimer` ya ocupa la tarjeta `bg-muted` al cierre de esas mismas 10 páginas; dos tarjetas apiladas se leen como un solo bloque de letra chica y el paciente salta las dos.
2. La única marca visual es una **regla izquierda de 2px en `--border`** (`border-l-2 border-border pl-4`), idioma que el sitio ya usa en `/servicios` para las listas de condiciones (`servicios/page.tsx:97`).
3. Enlaces en `--primary-dark` `#0A6265` (11.0:1 sobre `--background`), que es el color de enlace del sitio. No `--primary`: la decisión COLOR-01 del repo ya lo resolvió así.
4. Texto de respaldo en `text-foreground/80` sobre `--background`, igual que todo el cuerpo del sitio.

---

## Superficie 1 — Sección de citas "De dónde sale esto"

### Dónde vive en el modelo

Es **una sección más del arreglo `sections`**, no un bloque suelto de la plantilla. Esta decisión no es estética, la fuerza la puerta:

> `scripts/check-content.mjs:356-384` exige que el número de entradas de la tabla de contenidos sea **igual** al número de `<h2>` con `id` y `tabindex="-1"`, y que cada etiqueta coincida palabra por palabra con su `<h2>`. La tabla se construye desde `groups`, que sale de `sections` (`servicios/[slug]/page.tsx:236`, `blog/[slug]/page.tsx:91`). Un `<h2>` anclado emitido fuera de `sections` rompe la puerta; uno emitido dentro entra solo en la tabla.

**Contrato de datos.** Campo nuevo, opcional, en `ServiceSection` (`src/content/service-pages/index.ts`). `ContentSection` es un alias de `ServiceSection`, así que sirve igual para guías, posts y hubs sin abrir un segundo modelo:

```ts
/** Fuente externa que respalda una afirmación concreta del cuerpo. */
export type ServiceCitation = {
  /** Nombre publicable de la fuente: organización + documento. Es el texto del enlace. */
  source: string;
  /** Una frase que nombra la afirmación de ESTA página que la fuente respalda. */
  supports: string;
  /** URL absoluta https. Verificada como resoluble antes de publicarse. */
  href: string;
};
```

y en `ServiceSection`: `citations?: ServiceCitation[]`.

Se renderiza desde `SectionBody` en `content-body.tsx`, del mismo modo en que `items` invoca a `ServiceItemGrid`: `{section.citations && <CitationList citations={section.citations} />}`. Componente nuevo en `src/components/content/citation-list.tsx`.

### Ancla, y qué pasa con el esqueleto

- **`id: "fuentes"`. Permanente, se escribe a mano, nunca cambia.** El encabezado visible es "De dónde sale esto"; el `id` es corto y neutro a propósito, porque la convención del repo es que una reescritura de copy no puede romper un ancla que alguien ya mandó por WhatsApp (`service-pages/index.ts`, comentario de `ServiceSection`).
- **Corrección al brief: agregar esta sección a las 5 guías y los 4 posts NO cambia ningún esqueleto de `SKELETONS`.** Evidencia: en `check-content.mjs` el esqueleto solo se compara cuando la entrada del `MANIFEST` declara `format`, y las entradas de `/servicios/*` y `/blog/*` **no lo declaran**. Prueba independiente: `hernia-discal.ts` ya publica `senales-de-alarma`, un `<h2>` que no está en `SKELETONS["guia-clinica"]`, y las cinco compuertas están en verde.
- **Lo que sí es una trampa: `/preguntas-frecuentes` declara `format: "guia-clinica"`** (`check-content.mjs`, entrada final del `MANIFEST`). Por lo tanto:
  - `/preguntas-frecuentes` **queda fuera de alcance** de TRUST-02 en esta fase. No se le agrega la sección de citas.
  - **No se agrega `"fuentes"` a `SKELETONS["guia-clinica"]`.** Hacerlo obligaría a `/preguntas-frecuentes` a publicarla y dejaría la puerta en rojo.
  - Si una fase futura decide citar en `/preguntas-frecuentes`, la constante `SKELETONS` y la página se editan **en la misma tarea**, nunca en una posterior (lección 1 de `19-CONTEXT.md`, `## Specific Ideas`).

### Posición en la página

Orden de lectura al cierre de las 10 páginas, y es obligatorio:

```
… última sección clínica (en las guías, `cuando-consultar`)
→ De dónde sale esto            ← última entrada de `sections`, último <h2> anclado
→ "Agenda una evaluación de tu caso"  (<h2> sin ancla, ya existe)
→ Lecturas relacionadas / Sigue leyendo  (ya existen)
→ AuthorByline                  (data-author-byline)
→ MedicalDisclaimer             (data-medical-disclaimer)
```

Por qué exactamente ahí, con evidencia:

- `check-content.mjs:415-419` falla si el aviso educativo aparece antes del último `<h2>` anclado. Como "De dónde sale esto" es un `<h2>` anclado, **tiene que ir antes de `MedicalDisclaimer`**. No hay alternativa.
- La misma comprobación exige que la firma se lea antes del aviso. La sección de citas va antes de las dos.
- **Nunca dentro del `<aside>` del aviso, ni fusionada con él.** El aviso dice "esto no reemplaza una consulta"; las citas dicen "esto se apoya en X". Son dos mensajes distintos y mezclarlos anula los dos.
- El separador entre citas y aviso lo dan los bloques de CTA y enlaces que ya viven ahí. No se agrega ningún `<hr>`, borde ni separador nuevo.

### Anatomía visual

```
De dónde sale esto                         ← h2, escala de sección, Poppins 700, --primary
[mt-5] Lo que acabas de leer se apoya en estas fuentes.   ← text-lg, foreground/80, 1 párrafo

[mt-6, space-y-6]
 │ North American Spine Society — Guía de …   ← ENLACE. font-heading 16px 700, --primary-dark, ↗
 │ [mt-3] Respalda que la mayoría de las hernias …   ← text-base, foreground/80
 │
 │ Cochrane — Revisión sobre …                ← ENLACE
 │ [mt-3] Respalda que el reposo prolongado …
```

Marcado prescrito de cada ítem (`<ul data-citations="" className="mt-6 space-y-6">`, cada ítem `<li className="border-l-2 border-border pl-4">`):

```tsx
<a
  href={citation.href}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex min-h-11 items-center gap-1 font-heading text-base font-bold text-primary-dark transition-colors duration-150 hover:underline"
>
  {citation.source}
  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
  <span className="sr-only"> (se abre en una pestaña nueva)</span>
</a>
<p className="mt-3 text-base text-foreground/80">{citation.supports}</p>
```

**El enlace es el nombre de la fuente, no un "Ver la fuente" repetido.** Motivo de accesibilidad, no de gusto: con dos o tres citas por página, "Ver la fuente" produce enlaces con el mismo nombre accesible y distinto destino, que es un fallo clásico de A11Y.md. El nombre de la fuente es único por definición. Si dos citas salen de la misma organización, el `source` incluye el título del documento para diferenciarlas — es requisito del campo, no una opción.

### Enlaces externos: patrón exacto, ya existente en el repo

Se reusa **tal cual**, sin inventar variante:

- `target="_blank"` + `rel="noopener noreferrer"`
- `<ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />` como señal visible de salida — es el glifo que el sitio ya usa para salir a Google Maps (`sedes/[slug]/page.tsx:171`, `locations/location-card.tsx:88`)
- `<span className="sr-only"> (se abre en una pestaña nueva)</span>` — cadena literal, con el espacio inicial, exactamente como en `author-byline.tsx:48`, `footer.tsx:45` y otras 15 apariciones. **No se escribe una variante nueva.** La variante con destino nombrado (`(abre Google Maps en una pestaña nueva)`) es solo para Maps; para una fuente médica va la genérica.

### Presupuesto de palabras, y por qué importa más de lo que parece

**Tope duro: 160 palabras por sección de citas**, contando el párrafo introductorio, los nombres de fuente y las líneas de respaldo. Reparto sugerido: intro ≤ 25 palabras, cada `supports` de 15 a 30, `source` de 8 a 12. Con tres citas eso da ~135.

El motivo es una compuerta que el brief no menciona y que esta fase puede romper en las 10 páginas a la vez:

> `check-content.mjs:388-400` mide el banner de conversión como `palabras antes del banner / palabras totales` y exige que caiga entre **15% y 35%**. La sección de citas suma palabras **al final**, así que solo entra en el denominador: **el porcentaje del banner baja en todas las páginas tocadas.** Las guías ya están cerca del borde inferior — el comentario de `hernia-discal.ts` sobre `bannerAfterSectionId` documenta que detrás de `que-es` el banner cae en el 14%, fuera de rango. Una guía que hoy esté en 16% con 1.200 palabras de cuerpo cae a ~14,2% al sumar 150.

**Regla de ejecución, no negociable:** en la misma tarea que agrega la sección de citas a una página se corre `content:check` para esa página, y si el banner sale del rango se ajusta `bannerAfterSectionId` **en esa misma tarea**. Nunca en una posterior (lección 1 de `19-CONTEXT.md`).

Efecto sobre `MIN_WORDS = 900`: solo sube. Sin riesgo.

### CLS

La sección **no puede gastar el CLS 0**. Qué lo protege, en concreto:

1. **Cero imágenes.** Nada de logos de sociedades médicas, nada de favicons de las fuentes, nada de capturas. Un favicon remoto de 16px sin dimensiones reservadas es la forma más barata de gastar el CLS en 10 páginas de una sola vez.
2. **Cero JavaScript de cliente.** Es un server component sin estado, sin `useEffect`, sin fetch. No hay hidratación que reordene nada.
3. **Cero fuentes nuevas.** Poppins e Inter ya están self-hosted por `next/font` y ya se cargan en esas páginas.
4. **Ícono en SVG inline con caja fija** (`size-4` = 16×16). `lucide-react` no hace request y no depende de tamaño intrínseco.
5. **Cero animación, cero transición de layout.** La única transición permitida es `transition-colors duration-150` del enlace, que no afecta al layout.
6. **La sección va al final del flujo**, después de todo el contenido: aunque algo cambiara de altura, no habría contenido debajo que empujar salvo el pie, que ya está fuera del viewport en la primera pantalla.

Verificación: Unlighthouse sobre las 10 rutas tocadas, **mediana de tres corridas** (lección 3 de `19-CONTEXT.md`), CLS = 0 y accesibilidad = 1.00.

### Voz y contenido

Aplican sin excepción las reglas del repo (`service-pages/index.ts`, `PRODUCT.md`, `19-CONTEXT.md`):

- Voz explicativa, nunca testimonial. La línea `supports` describe qué respalda la fuente; no dice "está demostrado que" ni "los estudios prueban".
- Prohibido en cualquier campo: cifras de cirugías, tasas de éxito, plazos de recuperación garantizados, precios.
- `supports` nombra una afirmación **que el texto de esa página ya hace**. Si la fuente dice más, la fuente se cita igual y el texto no se amplía.
- `paragraphs` y `supports` son cadenas planas sin marcado, igual que el resto del modelo: ninguna cifra puede quedar resaltada tipográficamente.
- El texto de todos los campos pasa por el humanizador antes de entregarse.

---

## Superficie 2 — Módulos de contenido de `/blog` y `/sedes`

### Qué se crea

`src/content/static-pages/hub-blog.ts` y `src/content/static-pages/hub-sedes.ts`, copiando el patrón de `hub-servicios.ts` sin desviarse:

| Elemento | `hub-blog.ts` | `hub-sedes.ts` |
|---|---|---|
| Export del cuerpo | `export const hubBlog: StaticPage` | `export const hubSedes: StaticPage` |
| Export del h1 | `export const hubBlogH1` | `export const hubSedesH1` |
| `slug` | `"/blog"` | `"/sedes"` |
| `format` | `"pagina-de-servicio"` | `"pagina-de-servicio"` |
| `outboundLinks` | **no se declara** | **no se declara** |
| Objetivo de palabras | > 400 (parte de 229) | > 500 (parte de 275) |

Dos aclaraciones que evitan una regresión:

- **`outboundLinks` no se mueve al módulo.** Los dos hubs ya renderizan su bloque "Sigue leyendo" con un `<Link>` escrito a mano en el `page.tsx` (`blog/page.tsx:59-77`, `sedes/page.tsx:70-88`). Moverlo al módulo cambiaría el marcado renderizado y esta fase promete que no cambia nada más que la prosa añadida. Se deja donde está.
- **`/blog` y `/sedes` no se agregan al `MANIFEST` de `check-content.mjs`.** Ese manifiesto impone `MIN_WORDS = 900`, y los objetivos de la fase son 400 y 500 palabras (`19-CONTEXT.md`). Agregarlas dejaría la compuerta en rojo el mismo día. `/servicios` tampoco está en el `MANIFEST` y publica cuerpo del paquete: el precedente ya existe.

### Dónde entra la prosa

Se sigue el precedente exacto de `/servicios`: la rejilla que justifica la página va primero, la prosa va después, envuelta igual (`servicios/page.tsx:66-68`).

**`/blog`** — orden final:
```
h1  →  párrafo de entrada  →  lista de posts  →  [PROSA NUEVA]  →  "Sigue leyendo"
```

**`/sedes`** — orden final:
```
h1  →  párrafo de entrada  →  rejilla de SedeCard  →  [PROSA NUEVA]
    →  "¿Prefieres comparar los días antes de elegir?"  →  "Sigue leyendo"
```

En `/sedes` la prosa entra **antes** del bloque de CTA hacia `/agendar`: ese bloque es el cierre de conversión de la página y los cierres van al final.

Envoltorio en ambas, idéntico a `/servicios`:

```tsx
<ContentBodyBoundary as="section" className="mt-16">
  <ContentBody sections={hubBlog.sections} flushFirstSection />
</ContentBodyBoundary>
```

- `headingSize` se deja en su valor por defecto (`"lg"`), igual que `/servicios`.
- `flushFirstSection` va en `true`: la primera sección no repite margen porque el envoltorio ya trae `mt-16`.
- **Sin tabla de contenidos.** Con tres o más `<h2>` anclados la convención del repo pediría una, pero la puerta solo la exige en rutas del `MANIFEST`, y `/servicios` —que publica quince secciones ancladas— no la tiene. Se sigue ese precedente. Si un plan futuro mete estas rutas al `MANIFEST`, la tabla entra en esa misma tarea.

### Qué significa "el resultado visual no cambia", en concreto

El ejecutor tiene que poder demostrarlo. Tres pruebas, las tres obligatorias:

**Prueba 1 — el diff no toca ni una `className` preexistente.** `git diff` sobre `src/app/blog/page.tsx` y `src/app/sedes/page.tsx` solo puede mostrar: imports nuevos, el bloque `<ContentBodyBoundary>` nuevo, y nada más. Estas cadenas quedan byte a byte idénticas:

*`/blog`*
- contenedor `mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20`
- `<h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">` y su texto "Artículos sobre columna y traumatología"
- el párrafo `mt-5 text-lg text-foreground/70` y su texto
- el contenedor de la lista `mt-12 divide-y divide-border border-y border-border`
- cada `<article className="py-8">` con su orden fecha → `<h2>` → descripción y sus clases
- el bloque "Sigue leyendo" completo (`mt-14 border-t border-border pt-10`) y su enlace `traumatólogo de columna`

*`/sedes`*
- contenedor `mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20`
- `<h1>` y su texto "Sedes donde atiende el Dr. Angulo en Lima"
- el párrafo `mt-5 max-w-2xl text-lg text-foreground/70` y su texto
- la rejilla `mt-10 grid items-stretch gap-6 sm:grid-cols-2` y el `SedeCard` sin tocar
- la sección "¿Prefieres comparar los días antes de elegir?" con `mt-16 border-t border-border pt-12`, su `<h2>`, su párrafo y su `BookingCta`
- el bloque "Sigue leyendo" completo y su enlace `cirujano de columna lima`

**Prueba 2 — píxeles.** Captura de página completa a 375, 768 y 1440 px, antes y después, en las dos rutas. La franja que va desde el borde superior hasta el último elemento preexistente **anterior** al punto de inserción tiene que ser idéntica. Debajo del punto de inserción se admite solo el desplazamiento vertical que introduce la prosa: ningún cambio de ancho, de color, de tipografía ni de orden.

**Prueba 3 — compuertas y métricas.** Las cinco compuertas en 0 (`content:check`, `seo:check`, `sedes:check`, `tsc --noEmit`, `build`). Unlighthouse en `/blog` y `/sedes`, mediana de tres corridas: accesibilidad se mantiene en 1.00 y CLS en 0. Si baja alguna, el cambio no está terminado.

### Jerarquía de encabezados: el punto de contacto con la fase 18

`SedeCard` emite `<h3>` (`locations/sede-card.tsx:30`) y hoy esos `<h3>` aparecen en `/sedes` **antes de cualquier `<h2>`** — es precisamente el fallo que la fase 18 se comprometió a arreglar (criterio 5 de la fase 18: "`/sedes` no tiene ningún `<h3>` sin `<h2>` previo").

La prosa nueva de esta fase aporta `<h2>`, **pero va después de la rejilla y por lo tanto no arregla nada**. Esto es deliberado: la fase 19 no puede adelantarse a la 18 ni duplicar su arreglo. Ver la fila `⚠ unresolved` de abajo.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Encabezado de la sección de citas | `De dónde sale esto` — literal, en las 10 páginas, sin variantes por página |
| `id` del ancla | `fuentes` — permanente |
| Párrafo introductorio (guías y posts) | Una sola frase, ≤ 25 palabras, en voz del doctor. Base a humanizar: `Lo que acabas de leer se apoya en estas fuentes.` |
| Texto del enlace de cada cita | El nombre de la fuente: organización + documento. Único dentro de la página |
| Línea de respaldo | Una frase de 15 a 30 palabras que empieza nombrando la afirmación de la página que respalda. Base: `Respalda que {afirmación literal de esta página}.` |
| Sufijo de enlace externo (lector de pantalla) | ` (se abre en una pestaña nueva)` — literal, con espacio inicial, dentro del `<a>`, en `sr-only` |
| CTA principal de las 10 páginas | Sin cambios: `Agendar consulta` / `Escribir por WhatsApp`. Esta fase no agrega ni mueve ningún CTA |
| Estado vacío | **No aplica.** Una página sin citas simplemente no declara `citations` y la sección no existe. No se publica una sección de citas vacía ni un "Próximamente" |
| Estado de error | **No aplica.** No hay fetch, no hay estado de cliente, no hay fallo posible en runtime. Una URL rota es un fallo de datos que se atrapa antes de publicar, no un estado de UI |
| Acciones destructivas | **Ninguna en esta fase.** No hay confirmaciones que redactar |

Todo copy de esta fase pasa por el humanizador antes de entregarse: sin guiones largos, sin muletillas de IA, voz variada y natural.

---

## UI Considerations

Applicable state considerations resolved: **7 covered, 2 backstop, 2 unresolved**

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | citation-list | ✅ covered | Una página sin `citations` no renderiza la sección: `SectionBody` la condiciona a la presencia del campo, igual que hace con `items`. Nunca existe una sección de citas vacía ni un placeholder — ver la fila "Estado vacío" del contrato de copy |
| zero-one-many | citation-list | ✅ covered | El diseño no cambia entre 2 y 3 citas: `space-y-6` sobre una lista sin numeración visible ni columnas. Con una sola cita se ve igual y sigue siendo válido, aunque `19-CONTEXT.md` pide 2 o 3 |
| loading | citation-list, hub-blog, hub-sedes | ✅ covered | No hay estado de carga: las tres superficies son server components estáticos, sin fetch y sin JS de cliente. Es también lo que protege el CLS 0 |
| error | citation-list | ✅ covered | No hay estado de error en runtime. Una URL que no resuelve es un fallo de datos, atrapado antes de publicar por la regla no negociable de `19-CONTEXT.md` |
| populated | citation-list en 10 rutas | ✅ covered | Anatomía fija por página: `<h2>` + 1 párrafo + 2 o 3 ítems con regla izquierda. Sin variantes por ruta |
| overflow | citation-list | ✅ covered | El nombre de la fuente puede pasar de una línea a 375px. `inline-flex` con `gap-1` y `shrink-0` en el ícono deja envolver el texto sin que el ícono se aplaste ni se separe. Sin `truncate`, sin `line-clamp`: un nombre de fuente recortado deja de ser verificable |
| a11y — nombre accesible del enlace externo | citation-list | ✅ covered | Patrón existente reusado literal (`author-byline.tsx:48` y 17 apariciones más): `target="_blank"` + `rel="noopener noreferrer"` + `ArrowUpRight aria-hidden` + `sr-only " (se abre en una pestaña nueva)"`. El texto del enlace es el nombre de la fuente, así que ningún par de enlaces de la página comparte nombre accesible con distinto destino |
| long-text | citation-list a 375px | 🧪 backstop | El campo `source` no tiene tope de longitud en el tipo. Con un nombre de organización muy largo, el `inline-flex min-h-11 items-center` puede dejar el ícono desalineado respecto de la última línea. Prueba visual de estado de UI a 375px con el `source` más largo de los que se publiquen; si desalinea, se cambia a `items-baseline` sin tocar el resto |
| partial | banner de conversión en las 10 rutas tras sumar citas | 🧪 backstop | Sumar palabras al final baja el porcentaje del banner (`check-content.mjs:388-400`, rango 15-35%). Evidencia exigida: salida de `content:check` por ruta **después** de agregar las citas, en el mismo commit. Si alguna ruta sale del rango, `bannerAfterSectionId` se corrige en esa misma tarea. Sin esa salida en el commit, se trata como `insufficient_spec` |
| jerarquía de encabezados | `/sedes` | ⚠ unresolved | Los `<h3>` de `SedeCard` preceden a todo `<h2>` en `/sedes` hoy. Es el fallo que arregla la fase 18, que está en curso en paralelo. La prosa de la 19 va después de la rejilla y **no** lo arregla, a propósito. Qué lo resuelve: leer `src/app/sedes/page.tsx` y `src/components/locations/sede-card.tsx` en el momento de ejecutar. Si la 18 ya aterrizó, se respeta su forma y no se toca. Si no aterrizó, la 19 **igual no lo arregla** y deja la nota, para no producir dos encabezados donde va uno |
| cobertura de TRUST-02 | conteo de páginas | ⚠ unresolved | El brief pide "5 guías + 5 posts". Hoy hay **4 posts** en `src/content/blog/` y el `MANIFEST` lista 4. Además, 2 de esos 4 slugs los renombra la fase 16, que está en curso. Y `audit/findings/2026-08-23-auditoria-seo.md`, citado en el brief, **no existe en el repo**, así que no se pudo confirmar el conteo contra la fuente. Qué lo resuelve: el listado de `src/content/blog/` después de que la fase 16 cierre, o que aparezca el archivo de auditoría. El contrato visual de este documento vale igual para 4 o para 5 |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| ninguno | ninguno | not applicable — no hay `components.json`, no hay shadcn y no se instala ningún componente de terceros en esta fase |

Dependencias nuevas de esta fase: **cero**. `lucide-react` y `ArrowUpRight` ya están en el bundle.

---

## Archivos que toca esta fase

| Archivo | Cambio |
|---|---|
| `src/content/service-pages/index.ts` | Tipo `ServiceCitation` + campo `citations?` en `ServiceSection` |
| `src/components/content/citation-list.tsx` | Nuevo |
| `src/components/content/content-body.tsx` | Una línea en `SectionBody` que invoca `CitationList` |
| `src/content/service-pages/{5 guías}.ts` | Sección `fuentes` al final de `sections`; posible ajuste de `bannerAfterSectionId` |
| `src/content/blog/{posts}.ts` | Idem |
| `src/content/static-pages/hub-blog.ts` | Nuevo |
| `src/content/static-pages/hub-sedes.ts` | Nuevo |
| `src/app/blog/page.tsx` | Solo imports + el envoltorio de prosa |
| `src/app/sedes/page.tsx` | Solo imports + el envoltorio de prosa |

**No se toca:** `scripts/check-content.mjs` (ni `SKELETONS`, ni `MANIFEST`, ni `MIN_WORDS`), `src/app/preguntas-frecuentes/page.tsx`, `src/components/ui/medical-disclaimer.tsx`, `src/components/ui/author-byline.tsx`, `src/components/locations/sede-card.tsx`, `globals.css`, `design-system/`.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
