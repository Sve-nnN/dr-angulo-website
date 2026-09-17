# Phase 1: Home y Servicios - Context

**Gathered:** 2026-09-17
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous, batch-accepted defaults — Auto Mode)

<domain>
## Phase Boundary

Rediseño visual moderado (DESIGN_VARIANCE 6-7) de la home (`/`), el hub de servicios
(`/servicios`) y las páginas de servicio (`/servicios/[slug]`). Define el lenguaje visual
compartido que las fases 2-4 van a reutilizar: jerarquía, densidad, tratamiento de CTA,
tratamiento de tarjetas/listas. No toca copy, metadatos, JSON-LD, rutas, ni datos de
`src/content`. Preserva la identidad de marca (teal `--primary`, dorado `--accent`,
Poppins/Inter) y la accesibilidad de A11Y.md como restricción dura, no negociable por
variance visual.

</domain>

<decisions>
## Implementation Decisions

### Sistema de diseño y skill

- Se usa `design-taste-frontend` en vez de `impeccable` para todo este milestone (decisión
  de Juan, ver REQUIREMENTS.md). `DESIGN_VARIANCE: 6-7`, `MOTION_INTENSITY: 5-6` (el sitio
  ya usa una curva de animación única, moderada — no cinemática), `VISUAL_DENSITY: 3-4`
  (contenido médico, prioriza escaneabilidad sobre densidad).
- No se reemplaza el sistema de tokens existente (`globals.css`: `--primary`, `--accent`,
  `--whatsapp`, fuentes `--font-heading`/`--font-sans`). El taste pass trabaja **dentro**
  de esos tokens: composición, jerarquía, espaciado, tratamiento de tarjetas — no una
  paleta o tipografía nueva.
- Un solo lenguaje visual para servicios: la página de servicio individual y el hub deben
  compartir componentes (ya existe `ServiceCard`, reutilizar y extender en vez de duplicar).

### Home — jerarquía del primer scroll

- El hero mantiene la estructura de dos columnas (texto + imagen) pero se refuerza la
  separación visual entre credencial (años/CMP/RNE), propuesta de valor (H1+párrafo) y
  CTA de agendar: el CTA de agendar pasa a un tratamiento más grande/prominente que el
  botón secundario "Ver especialidades" (hoy son visualmente equivalentes en peso).
- El bloque de credenciales (línea de texto pequeña con años/CMP/RNE) se separa
  tipográficamente del párrafo de propuesta de valor en vez de seguir el mismo tratamiento
  de texto blanco de igual peso — ej. badge/línea con ícono, no solo texto corrido.
- El resto de secciones de home (especialidades, quirófano, trayectoria, reels, reseñas,
  FAQ, sedes) mantiene su orden actual (ya sigue una lógica de conversión: quién es →
  qué ofrece → confianza → dónde → cierre); el rediseño es de tratamiento visual y
  jerarquía interna de cada sección, no de reordenamiento.

### Hub de servicios — escaneabilidad

- El listado de `serviceCategories` en home (formato `<dl>` con divisores horizontales)
  y el grid de `ServiceCard` en `/servicios` se tratan como paneles/tarjetas con más
  separación visual (sombra o borde + fondo diferenciado) en vez de listas de definición
  con solo un divisor de borde — reduce la sensación de "muro de texto".
- Mantener la agrupación existente por categoría (`serviceCategories`) como estructura de
  información; el cambio es de tratamiento de tarjeta, no de taxonomía.

### Página de servicio individual — composición replicable

- Definir (o formalizar si ya existe implícitamente) un orden de secciones canónico:
  encabezado con breadcrumb + H1 → resumen/TOC → contenido clínico (con banner CTA a
  mitad) → autor/disclaimer → CTA de cierre → posts relacionados. Toda página de servicio
  sigue este mismo orden y usa los mismos componentes (`TableOfContents`, `MidContentCta`,
  `AuthorByline`, `MedicalDisclaimer`) con el mismo tratamiento visual.
- El CTA de agendar en la página de servicio usa el mismo componente/tratamiento visual
  que en home (`BookingCta`), reforzado como elemento de mayor peso visual de la página
  (no solo un botón más entre los enlaces de contenido).

### Claude's Discretion

- Tratamiento exacto de sombras/bordes en tarjetas, tamaños de tipografía dentro de la
  escala existente, y micro-espaciados quedan a discreción de la skill `design-taste-frontend`
  siempre que respeten los tokens de `globals.css` y el resultado de `gsd-ui-researcher`
  (UI-SPEC.md).
- Uso de motion (`motion/react` o las animaciones CSS ya definidas en `globals.css`,
  `rise-in`/`settle-in`/`slide-up-in`) para reforzar jerarquía: a discreción, siempre
  respetando `prefers-reduced-motion` (ya vigente en el proyecto).

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/booking-cta.tsx`, `whatsapp-cta.tsx` — CTAs ya centralizados, reutilizar
  en vez de crear botones ad-hoc.
- `src/components/services/service-card.tsx` — tarjeta de servicio ya existe, candidata a
  extender para el hub y para el listado de categorías en home.
- `src/components/content/content-body.tsx` (`ContentBody`, `ContentBodyBoundary`) — límite
  de contenido clínico ya resuelto, no tocar su contrato, solo el envoltorio visual alrededor.
- `src/components/ui/table-of-contents.tsx`, `mid-content-cta.tsx`, `author-byline.tsx`,
  `medical-disclaimer.tsx` — componentes de página de servicio ya existentes.

### Established Patterns
- Tokens de color/tipografía centralizados en `src/app/globals.css` vía `@theme inline`
  (Tailwind v4). Curva de animación única definida ahí (`rise-in`, `settle-in`,
  `slide-up-in`), con `animation-fill-mode: both` y sin ocultar contenido por JS.
- Foco visible global vía `:focus-visible` en `globals.css` — no repetir por componente.
- Contraste ya resuelto y documentado con comentarios explícitos en `globals.css` (dorado
  con texto oscuro, WhatsApp oscurecido) — no reabrir esas decisiones de color.
- Next.js 16.2, React 19, Tailwind v4 (`@import "tailwindcss"`, sin `tailwind.config.js`).

### Integration Points
- Home (`src/app/page.tsx`), hub de servicios (`src/app/servicios/page.tsx`) y detalle de
  servicio (`src/app/servicios/[slug]/page.tsx`) son los tres archivos objetivo directos.
- `src/content/services.ts` y `src/content/service-pages.ts` alimentan la data — no se
  modifican en esta fase (fuera de alcance: copy y estructura de datos).

</code_context>

<specifics>
## Specific Ideas

No hay referencias visuales externas (URLs/capturas) aportadas por Juan para este
milestone — la skill `design-taste-frontend` infiere la dirección desde el brief:
sitio médico de confianza (traumatólogo/cirujano de columna), audiencia paciente que
busca agendar rápido. Design read esperado: landing/sitio institucional de salud,
lenguaje "trust-first" pero no tan conservador como sector público — moderado, cálido,
con foco en credibilidad y conversión (agendar).

</specifics>

<deferred>
## Deferred Ideas

- Cambios de copy, metadatos SEO o estructura de datos — pertenecen a los workstreams
  `milestone` y `seo-keywords`, no a este.
- Rediseño de `/sedes`, `/blog`, `/agendar`, `/contacto`, `/sobre-el-doctor`,
  `/testimonios`, `/preguntas-frecuentes`, `/privacidad` — cubierto por las fases 2-4.

</deferred>
