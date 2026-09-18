---
phase: "1"
slug: "home-y-servicios"
status: approved
shadcn_initialized: false
preset: none
created: "2026-09-17"
---

# Phase 1 — UI Design Contract: Home y Servicios

> Contrato visual y de interacción para `/`, `/servicios` y `/servicios/[slug]`. Generado por
> gsd-ui-researcher aplicando la skill `design-taste-frontend` (reemplaza a `impeccable` en este
> milestone, decisión de Juan, ver REQUIREMENTS.md). Verificado por gsd-ui-checker.

---

## Design Direction (design-taste-frontend)

**Design Read:** Leyendo esto como un redesign-preserve de un sitio institucional de salud
(traumatólogo/cirujano de columna en Lima) para pacientes que buscan agendar rápido, con un
lenguaje trust-first pero cálido — no tan conservador como sector público —, apoyado en el sistema
de tokens Tailwind v4 ya existente (teal `--primary` + dorado `--accent`) y en componentes propios
ya construidos (`BookingCta`, `WhatsAppCta`, `ServiceCard`, etc.).

**Modo:** Redesign - Preserve (Sección 11 de `design-taste-frontend`). No hay overhaul visual: se
trabaja dentro de los tokens de marca existentes, se preserva la IA y el copy clínico, y se sube la
composición/jerarquía/tratamiento de tarjeta.

**Dials (ya decididos en `01-CONTEXT.md`, no se renegocian aquí):**

| Dial | Valor | Nota |
|------|-------|------|
| `DESIGN_VARIANCE` | 6-7 | Puede cambiar layout y composición; preserva marca. No llega a "Asymmetric" pleno (8-10). |
| `MOTION_INTENSITY` | 5-6 | El sitio ya tiene una única curva de animación (`rise-in`/`settle-in`/`slide-up-in`, `cubic-bezier(0.16,1,0.3,1)`, 400-700ms). No se sube a choreography cinemática; se reutiliza y extiende esa curva, nunca GSAP/parallax nuevo. |
| `VISUAL_DENSITY` | 3-4 | Contenido médico prioriza escaneabilidad. Rango "Daily App" bajo, cerca de "Art Gallery". |

**Auditoría del sitio actual (Sección 11.B):**

- **Brand tokens (preservados, no se tocan):** `--primary` `#0e7c7e` teal, `--accent` `#e8971f`
  dorado (texto oscuro obligatorio encima, ya documentado en `globals.css`), `--whatsapp` `#1a9c4d`
  (uso exclusivo del botón flotante global, fuera de los 3 archivos de esta fase), Poppins
  (`--font-heading`) + Inter (`--font-sans`) vía `next/font/google`. Radios: `rounded-lg` (8px) en
  botones, `rounded-2xl` (16px) en tarjetas/paneles/asides, `rounded-full` en píldoras — ya es un
  Shape Consistency Lock de facto, se formaliza abajo.
- **IA:** no cambia (fuera de alcance de este milestone).
- **Patrones a preservar:** curva de animación única con `animation-fill-mode: both` (nunca oculta
  contenido por JS), foco visible global vía `:focus-visible` en `globals.css` (no repetir por
  componente), un solo enlace interactivo por `ServiceCard` (`after:absolute`), contraste ya
  resuelto y comentado (`COLOR-01/03` en `globals.css`).
- **Patrones a corregir en esta fase** (discreción de la skill, dentro del contrato de abajo):
  `WhatsAppCta` con `variant="accent"` en `/servicios` (cierre) y en `/servicios/[slug]`
  ("Agenda una evaluación") compite en peso visual con `BookingCta` — ver **CTA Hierarchy** abajo;
  la línea de credenciales del hero hoy comparte tratamiento tipográfico con el párrafo de
  propuesta de valor; los listados `<dl>` de categorías (home) y sedes se leen como texto corrido,
  no como paneles.
- **Lectura de dial del sitio actual (punto de partida, no el target):** variance ~3
  (grids simétricos, `<dl>` con divisores horizontales), motion ~4 (una sola curva, sin
  choreography), density ~3 (ya airy). El target de esta fase sube variance y motion sin tocar
  density.

**CTA Hierarchy (resuelve HOMESVC-04, discreción de la skill):**

1. El dorado (`--accent`) queda reservado en exclusiva para `BookingCta` en todo el alcance de
   esta fase. `WhatsAppCta` **nunca** usa `variant="accent"` en `/`, `/servicios` ni
   `/servicios/[slug]` — pasa a `variant="outline"` (o `outline-inverse` sobre fondo teal). Hoy
   `WhatsAppCta variant="accent"` aparece en el cierre de `/servicios` y en "Agenda una evaluación"
   de `/servicios/[slug]`: ambos casos bajan a `outline`.
2. En el hero de home, `BookingCta` y el enlace "Ver especialidades" hoy comparten el mismo
   footprint (`px-6 py-3 text-base`), lo que los iguala en peso aunque uno sea relleno y el otro
   borde. "Ver especialidades" baja a enlace de texto simple (sin caja ni borde, con `ArrowRight`),
   igual que el resto de enlaces secundarios del sitio (`text-primary`-style pero en blanco sobre
   fondo teal); `BookingCta` mantiene su tratamiento relleno y puede subir un escalón de tamaño
   (`px-8 py-4 text-lg` solo en este hero) para que el salto de peso sea inequívoco sin leer texto.
3. Mismo criterio en `/servicios/[slug]`: `BookingCta` es siempre el primer elemento visual del
   grupo de CTA y el único con relleno dorado; `WhatsAppCta` lo acompaña en `outline`.

**Otras reglas de la skill que aplican directo a este alcance:**

- **Shape Consistency Lock:** `rounded-lg` botones, `rounded-2xl` tarjetas/paneles/asides,
  `rounded-full` píldoras. No introducir un cuarto radio.
- **No duplicate CTA intent:** unificar la etiqueta de agendar (ver Copywriting Contract).
- **Zigzag alternation cap:** el bloque de home "Quirófano" (imagen+texto) → "Trayectoria"
  (texto+imagen) ya son 2 zig-zags seguidos; no agregar un tercero — la siguiente sección con
  imagen (reseñas/reels) debe usar un layout distinto (grid o full-width), no otro split.
- **Eyebrow restraint:** máximo 1 eyebrow cada 3 secciones. Home tiene ~9 secciones (hero,
  especialidades, quirófano, trayectoria, reels, reseñas, FAQ, sedes, cierre) → máximo 3 eyebrows
  en total si se introducen; hoy no hay ninguno, no es obligatorio agregarlos.
- **Reduced motion:** cualquier motion nuevo (`MOTION_INTENSITY` 5-6) debe degradar con
  `prefers-reduced-motion: reduce`, ya cubierto globalmente en `globals.css` — extender esa regla,
  no crear una paralela.
- **Em-dash ban:** cero `—`/`–` en cualquier copy nuevo o editado de este alcance.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — sin shadcn ni `components.json` en el proyecto. Decisión: **no inicializar shadcn en este milestone.** El proyecto ya tiene un sistema de tokens propio (`globals.css`, Tailwind v4 `@theme inline`) y una librería de componentes hand-rolled madura (`BookingCta`, `WhatsAppCta`, `ServiceCard`, etc.) que la restricción dura de esta fase exige preservar, no reemplazar. Introducir shadcn ahora sería un overhaul de infraestructura fuera del alcance de un "taste pass" y contradice el modo Redesign-Preserve. |
| Component library | ninguna (componentes propios bajo `src/components/`) |
| Icon library | `lucide-react` (`^1.28.0`, resuelto `1.28.0`) — ya adoptada en todo el sitio (15+ archivos). Se mantiene: no mezclar con otra familia. `strokeWidth` por defecto (2), sin overrides salvo `instagram-icon.tsx` (ícono de marca, no de UI). |
| Font | Poppins (`--font-heading`) para encabezados + Inter (`--font-sans`) para cuerpo, cargadas vía `next/font/google` en `src/app/layout.tsx`. Tokens ya resueltos en `globals.css` (`@theme inline`). Sin cambios. |

---

## Component Inventory

> Enumerado por comando, no por recall. El proyecto no tiene un paquete de design system
> instalado (no shadcn) — la enumeración cubre la librería propia relevante para esta fase y la
> librería de íconos instalada.

Enumerado por `find src/components/ui src/components/services src/components/content -maxdepth 1 -name "*.tsx" | sort` — 11 archivos — componentes propios en el repo, sin paquete/versión (no es un paquete publicado) — 2026-09-17.

Enumerado por `node -e "console.log(Object.keys(require('lucide-react')).filter(k=>/^[A-Z]/.test(k)).length)"` — 6011 exports — `lucide-react@1.28.0` — 2026-09-17.

Sin línea de proveniencia esta tabla sería no-exhaustiva de todas formas: el ejecutor puede usar
cualquier ícono de `lucide-react` o crear un componente nuevo bajo `src/components/` fuera de esta
lista — esto es solo el inventario conocido-bueno para el alcance de esta fase.

| Component | Import path | Notes |
|-----------|-------------|-------|
| `BookingCta` | `@/components/ui/booking-cta` | CTA primario de agendar. Único destino `/agendar`. `size="sm"` (barras densas) / `"md"` (cuerpo). Único elemento con relleno dorado en el alcance de esta fase — ver CTA Hierarchy. |
| `WhatsAppCta` | `@/components/ui/whatsapp-cta` | CTA de WhatsApp. `variant`: `"accent"` (queda fuera de uso en esta fase), `"outline"` (default en este alcance), `"outline-inverse"` (fondo teal). Requiere `location: CtaLocation` para tracking. |
| `ServiceCard` | `@/components/services/service-card` | Tarjeta del hub hacia una guía de servicio. Un solo enlace por tarjeta (`after:absolute`); no meter un segundo control adentro. Candidata a extender para el tratamiento de categorías en home (ver Color/Spacing). |
| `ServiceItemGrid` | `@/components/ui/service-item-grid` | Tarjetas para listas de síntomas/complicaciones (`variant="grid"`) o pasos numerados (`variant="steps"`). Ya usa `rounded-2xl` + `bg-background`. |
| `ConsultAlert` | `@/components/ui/consult-alert` | Bloque "cuándo consultar". `--destructive` solo en ícono/borde, nunca en texto. |
| `TableOfContents` | `@/components/ui/table-of-contents` | Índice sticky de escritorio en `/servicios/[slug]`. No se renderiza con menos de 3 entradas. |
| `MidContentCta` | `@/components/ui/mid-content-cta` | Banner de conversión a un tercio del documento. El título es `<p>`, nunca `<h2>` (no contamina el esquema/TOC). |
| `AuthorByline` | `@/components/ui/author-byline` | Firma del doctor con credenciales verificadas desde `src/content/cv`. No acepta texto libre por props. |
| `MedicalDisclaimer` | `@/components/ui/medical-disclaimer` | Aviso educativo de cierre. Una sola vez por página, después de `AuthorByline`. |
| `ContentBody` / `ContentBodyBoundary` | `@/components/content/content-body` | Motor de renderizado de prosa clínica larga + límite medido por `scripts/check-content.mjs`. No tocar su contrato de datos, solo el envoltorio visual alrededor. |
| `CitationList` | `@/components/content/citation-list` | Lista de fuentes citadas dentro del contenido clínico. |
| Íconos usados en el alcance | `lucide-react` | `CalendarDays` (agendar), `MessageCircle` (WhatsApp), `ArrowRight`/`ArrowLeft` (navegación), `Info` (disclaimer), `AlertTriangle` (alerta de consulta), `Star` (reseñas). Mantener la misma familia para cualquier ícono nuevo de esta fase. |

Omitido: sección de registries de terceros (no aplica, `Tool: none`).

---

## Spacing Scale

Declarados (múltiplos de 4, ya en uso consistente en `page.tsx`, `servicios/page.tsx` y
`servicios/[slug]/page.tsx` — se preservan, no se reinventan):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gaps ícono-texto (`gap-1`, gaps internos de píldora) |
| sm | 8px | Espaciado compacto entre elementos inline (`gap-2`) |
| md | 16px | Espaciado por defecto entre elementos (`mt-4`, `gap-4`, `px-4`) |
| lg | 24px | Padding de tarjeta/panel (`p-6`), espaciado de grupo de CTA (`gap-6`, `mt-6`) |
| xl | 32px | Separación entre bloques de un mismo componente (`mt-8`, `gap-8`) |
| 2xl | 48px | Quiebres internos mayores de sección (`mt-12`, `py-12`) |
| 3xl | 64px | Padding vertical de sección en mobile (`py-16`) |
| 4xl | 96px | Padding vertical de sección en desktop (`sm:py-24`) |

Exceptions (ya establecidas en el código, se mantienen): `12px` (`mt-3`/`gap-3`, espaciado de
metadatos/etiqueta bajo un título), `20px` (`mt-5`, separación tras el párrafo de propuesta de
valor), `40px` (`mt-10`/`py-10`, ritmo intermedio de sub-sección), `56px` (`mt-14`/`py-14`, quiebre
entre bloques de contenido largo), `80px` (`mt-20`/`sm:py-20`, cierre de sección extensa). Todas
son múltiplos de 4; no se introduce ningún valor fuera de esta familia en esta fase.

---

## Typography

Preservada del sistema existente (`globals.css` + clases ya en uso) — restricción dura del
milestone: no se propone tipografía nueva.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Label / Meta | 14px (`text-sm`) | Regular 400 (Semibold 600 cuando es enlace/CTA de texto) | ~1.4 |
| Body | 16px (`text-base`) | Regular 400 | ~1.5 (Tailwind default) |
| Lead / Body-large | 18px (`text-lg`) | Regular 400 | ~1.55 |
| Heading H3 | 18px → 20px (`text-lg sm:text-xl`) | Bold 700 | ~1.3 |
| Heading H2 | 24px → 30px (`text-2xl sm:text-3xl`) | Bold 700 | ~1.25 |
| Display H1 | 30px → 48px (`text-3xl sm:text-4xl lg:text-5xl`) | Extrabold 800 | 1.1-1.2 (`leading-tight`) |

**Nota sobre pesos (excepción documentada al default de 2 pesos):** el sistema ya establecido usa
3 pesos no-regulares (Semibold 600 para links/CTA, Bold 700 para H2/H3, Extrabold 800 reservado
solo para H1) más Regular 400 en cuerpo. Esto es el sistema tipográfico ya aprobado del proyecto
(`design-system/dr-angulo/MASTER.md` referenciado en comentarios de código), preservado por
restricción dura de este milestone — no es una introducción nueva de esta fase ni una violación a
corregir.

**Tratamiento nuevo de esta fase (discreción, resuelve la separación credencial/propuesta de
valor en el hero de home):** la línea de credenciales (años/CMP/RNE) pasa de párrafo corrido
(`text-sm text-white`, mismo tratamiento que el resto) a una línea tipo badge: `text-sm
font-semibold` con un ícono `lucide-react` inicial (p. ej. `BadgeCheck` o `ShieldCheck`) y
`gap-2`, separada del párrafo de propuesta de valor (`text-lg` Regular) por su propio peso
(Semibold vs Regular) y no solo por espaciado vertical.

---

## Color

Preservado del sistema existente (`globals.css`). No se propone paleta nueva.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--background` `#fafaf9` + superficies blancas de tarjeta | Fondo de página, `ServiceCard`, `ServiceItemGrid` (`bg-background`) |
| Secondary (30%) | `--primary` `#0e7c7e` (texto/enlaces/H2/H3, secciones full-bleed de hero y cierre) + `--muted` `#ecfafa` / `--border` `#d7efef` (paneles y hairlines: `MidContentCta`, `MedicalDisclaimer`, banda de cabecera de servicio, secciones alternas de home) | Identidad de marca, diferenciación de sección, paneles |
| Accent (10%) | `--accent` `#e8971f` (texto oscuro obligatorio encima, ya resuelto en `globals.css`) | **Reservado exclusivamente para:** relleno de `BookingCta` en toda la fase (único CTA con superficie dorada) y `fill-accent` en el rating de estrellas de reseñas (ya establecido, fuera de los 3 archivos pero visible en home). `WhatsAppCta` no usa este color en esta fase (ver CTA Hierarchy). |
| Destructive | `--destructive` `#dc2626` | Reservado a `ConsultAlert` (borde/ícono, nunca texto). Sin acciones destructivas en el alcance de esta fase (home/hub/detalle son solo lectura + navegación); `/agendar` y `/contacto` con formularios son Fase 2. |

Accent reserved for: relleno de `BookingCta` (botón de agendar, en cualquier página del alcance) y
`fill-accent` del ícono de estrella en reseñas. Ningún otro elemento interactivo de esta fase usa
superficie dorada.

**Nota — `--whatsapp` (`#1a9c4d`):** existe en el sistema pero su único uso es el botón flotante
global (`whatsapp-float-button.tsx`), fuera de los 3 archivos de esta fase. No se introduce en
`BookingCta`/`WhatsAppCta` de esta fase para no crear un tercer color de acción compitiendo con el
dorado del agendamiento.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | **"Agendar cita"** — etiqueta única para toda instancia de `BookingCta` en el alcance de esta fase (home hero, home cierre, banda de cabecera de servicio, "Agenda una evaluación", tarjeta sticky del aside). Reemplaza las variantes actuales "Agendar consulta" y "Ver sedes y agendar" para resolver el NO_DUPLICATE_CTA_INTENT de `design-taste-frontend` — es un ajuste de microcopy de botón (UI chrome), no una reescritura de copy clínico ni de metadatos SEO (ambos fuera de alcance según REQUIREMENTS.md). |
| Secondary CTA (WhatsApp) | "Escribir por WhatsApp" (ya consistente en las páginas de servicio, se mantiene) |
| Empty state heading | No aplica en esta fase: home/hub/detalle no introducen colecciones nuevas con estado vacío. Los fallbacks ya existentes de `InstagramReelsSection` (enlace al perfil si no hay reels) y `GoogleReviewsSection` (la sección se omite si no hay datos) viven fuera de los 3 archivos de esta fase y no se tocan. |
| Empty state body | (ídem — no aplica, ver nota arriba) |
| Error state | No aplica en esta fase: no hay formularios en `/`, `/servicios` ni `/servicios/[slug]`. `/agendar` y `/contacto` son Fase 2. |
| Destructive confirmation | No aplica: sin acciones destructivas en el alcance (solo lectura + navegación + CTA de contacto). |

---

## UI Considerations

Applicable state considerations resolved: 4 covered, 2 backstop, 0 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| empty | Reseñas de Google (`GoogleReviewsSection`, fuera de los 3 archivos) | ✅ covered | Ya retorna `null` si no hay datos; la sección se omite sin dejar hueco visual en home. |
| empty | Reels de Instagram (`InstagramReelsSection`, fuera de los 3 archivos) | ✅ covered | Ya cae a una tarjeta con enlace al perfil si no hay reels o falla la API. |
| overflow | Condiciones por categoría en home (`cat.conditions`) | ✅ covered | Ya usa `slice(0, 5)` antes de unir con separador; el hub (`/servicios`) sí lista todas dentro de un grid de 2 columnas. |
| overflow | Nombres alternativos de servicio (`page.alternateNames`) | ✅ covered | Ya usa `flex-wrap` en píldoras; sin límite de cantidad declarado, pero el wrap no rompe el layout. |
| long-text | H1 y lead de la banda de cabecera de servicio (`page.h1`, `page.heroLead`) | 🧪 backstop | La banda de cabecera (breadcrumb + H1 + lead + píldoras + CTA) debe sostener el mismo orden y mantener el grupo de CTA visible sin desplazamiento aunque el H1 ocupe 2 líneas a `lg:text-4xl`. Sin dato real de longitud máxima entre las guías existentes, se trata como backstop verificable visualmente entre al menos 2 páginas de servicio distintas (HOMESVC-03). |
| zero-one-many | Tarjetas de servicio en el hub (`servicePages.map`, grid `sm:grid-cols-2`) | 🧪 backstop | Contenido estático curado en `src/content/service-pages.ts` (no hay fuente dinámica en esta fase); el grid de 2 columnas debe sostenerse visualmente igual de bien con 1 tarjeta que con el total actual. |

---

## Registry Safety

No aplica — `Tool: none`, no se usa shadcn en este proyecto. El sistema de componentes es propio
(ver Component Inventory) y no involucra registries externos.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — CTA unica "Agendar cita" (verbo+sustantivo), sin CTAs genericos; N/A justificado para empty/error/destructive (sin colecciones nuevas ni formularios en el alcance).
- [x] Dimension 2 Visuals: PASS — CTA Hierarchy define foco visual explicito (BookingCta como unico relleno dorado, escalon de tamano en hero); jerarquia declarada seccion por seccion.
- [x] Dimension 3 Color: PASS — Accent reservado a una lista enumerable (relleno de BookingCta + fill-accent de estrellas), 60/30/10 explicito, un solo color de accent, destructive declarado.
- [x] Dimension 4 Typography: FLAG (no bloqueante) — el sistema preservado declara 6 tamanos y 4 pesos no-regulares, por encima del maximo recomendado (4 tamanos / 2 pesos). Es debt pre-existente del sistema de tokens ya aprobado (`design-system/dr-angulo/MASTER.md`), preservado por restriccion dura del milestone (no se permite proponer tipografia nueva en este taste pass) — no es una introduccion de esta fase. Recomendacion no bloqueante: evaluar consolidacion del type scale en un milestone futuro que sí tenga alcance para tocar tipografia.
- [x] Dimension 5 Spacing: PASS — todos los valores (incluidas las excepciones 12/20/40/56/80px) son multiplos de 4 y estan justificados con su uso concreto en el codigo existente.
- [x] Dimension 6 Registry Safety: PASS — `Tool: none`, sin registries de terceros en el proyecto.
- [x] Dimension 7 Inventory Provenance: PASS — dos enumeraciones con comando, conteo, paquete@version (o nota explicita de "sin paquete publicado") y fecha, ambas precediendo su tabla correspondiente.

**Approval:** approved — 2026-09-17. Sin iteraciones necesarias (0/2); un FLAG no bloqueante en Typography, documentado arriba, no requiere correccion en este UI-SPEC.
