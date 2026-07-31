# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** dr-angulo
**Generated:** 2026-07-31 01:51:18
**Category:** Medical Clinic

---

## Global Rules

> **OVERRIDE (2026-07-31):** los valores generados automáticamente (Enterprise Gateway / verde salud genérico) fueron reemplazados por la identidad real extraída del Instagram del Dr. Angulo (@dr.juancarlosangulo) — ver `.planning/research/BRAND.md`. Se conservan de la corrida automática: spacing, shadows, patrones de componente y el checklist de accesibilidad.

### Color Palette (marca real del doctor)

| Role | Hex | CSS Variable | Uso |
|------|-----|--------------|-----|
| Primary | `#0E7C7E` | `--color-primary` | Header, footer, títulos, botón secundario |
| Primary Light | `#3FBFC2` | `--color-primary-light` | Íconos, acentos, hover de links |
| On Primary | `#FFFFFF` | `--color-on-primary` | Texto sobre primary |
| Accent/CTA | `#E8971F` | `--color-accent` | Botones "Agendar cita", igual al banner de su Instagram |
| Accent Dark | `#C97D0F` | `--color-accent-dark` | Hover del accent |
| WhatsApp | `#25D366` | `--color-whatsapp` | SOLO el burbuja flotante (convención reconocible, no el resto del sitio) |
| Background | `#FAFAF9` | `--color-background` | Fondo general (blanco cálido, no puro) |
| Foreground | `#1F2937` | `--color-foreground` | Texto de cuerpo |
| Muted | `#ECFAFA` | `--color-muted` | Fondos de sección alternos, cards |
| Border | `#D7EFEF` | `--color-border` | Bordes sutiles |
| Destructive | `#DC2626` | `--color-destructive` | Errores de formulario |
| Ring | `#0E7C7E` | `--color-ring` | Focus ring |

**Color Notes:** Teal + dorado-mostaza extraídos visualmente de posts/highlights de Instagram (afinar con capturas reales durante QA visual). El verde de WhatsApp se reserva exclusivamente para el botón flotante — no se usa como color de marca general.

### Typography

- **Heading Font:** Poppins (600/700/800) — fiel al peso bold/condensado del logo y titulares reales
- **Body Font:** Inter (400/500/600) — máxima legibilidad, excelente soporte de español
- **Mood:** médico, cercano, confiable, moderno
- **Implementación:** `next/font/google` (self-hosted, sin `<link>` externo) — ver Phase 1 plan

```ts
import { Poppins, Inter } from 'next/font/google'
const poppins = Poppins({ subsets: ['latin'], weight: ['600','700','800'], variable: '--font-heading' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary CTA (Agendar cita) */
.btn-accent {
  background: #E8971F;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-accent:hover {
  background: #C97D0F;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0E7C7E;
  border: 2px solid #0E7C7E;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

/* WhatsApp floating button — único uso del verde WhatsApp */
.btn-whatsapp-float {
  background: #25D366;
  color: white;
  border-radius: 9999px;
  width: 56px;
  height: 56px;
  box-shadow: var(--shadow-lg);
}
```

### Cards

```css
.card {
  background: #FFFFFF;
  border: 1px solid #D7EFEF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #D7EFEF;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0E7C7E;
  outline: none;
  box-shadow: 0 0 0 3px #0E7C7E20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Accessible & Ethical

**Keywords:** High contrast, large text (16px+), keyboard navigation, screen reader friendly, WCAG compliant, focus state, semantic

**Best For:** Government, healthcare, education, inclusive products, large audience, legal compliance, public

**Key Effects:** Clear focus rings (3-4px), ARIA labels, skip links, responsive design, reduced motion, 44x44px touch targets

### Page Pattern (Home) — override: Hero + Testimonials + CTA (healthcare)

- **Conversion Strategy:** Dolor/preocupación del paciente → confianza (credenciales/trayectoria) → prueba social (testimonios reales) → CTA WhatsApp de baja fricción
- **CTA Placement:** WhatsApp flotante (sticky, todas las páginas) + CTA "Agendar cita" en hero + CTA post-testimonios + footer
- **Section Order:** 1. Hero (propuesta de valor + CTA), 2. Especialidades (traumatología/ortopedia infantil/columna), 3. Por qué elegirme (trayectoria breve), 4. Testimonios (3-5 reales, foto+nombre si disponible), 5. FAQ preview, 6. CTA final

---

## Anti-Patterns (Do NOT Use)

- ❌ Outdated interface
- ❌ Confusing booking
- ❌ AI purple/pink gradients

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
