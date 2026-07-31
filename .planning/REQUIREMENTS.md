# Requirements: Sitio web Dr. Juan Carlos Angulo Totesaut

**Defined:** 2026-07-31
**Core Value:** Que un paciente que busca un traumatólogo/cirujano de columna en Lima encuentre el sitio, confíe en el doctor y agende cita por WhatsApp en menos de 2 clics — todo evento de contacto queda rastreado.

## v1 Requirements

### INFRA — Base técnica

- [x] **INFRA-01**: Proyecto Next.js (App Router) + TypeScript + Tailwind CSS scaffolded y corriendo
- [x] **INFRA-02**: Layout global (header/nav, footer, botón flotante de WhatsApp) presente en todas las páginas
- [ ] **INFRA-03**: Sitio desplegado en Vercel accesible por URL pública (subdominio `.vercel.app`) — pendiente, requiere login/autorización de Juan
- [x] **INFRA-04**: Variables de entorno para WhatsApp, GA4, Meta Pixel, Resend documentadas (`.env.example`)

### BRAND — Identidad visual

- [x] **BRAND-01**: Paleta de color (teal + dorado-mostaza) aplicada vía tokens de Tailwind
- [x] **BRAND-02**: Tipografía Poppins (o equivalente fiel) aplicada con `next/font`
- [x] **BRAND-03**: Logo/wordmark del doctor visible en header y favicon
- [x] **BRAND-04**: Componentes base (botones, cards, badges) consistentes con la identidad

### CONTENT — Páginas core

- [x] **CONTENT-01**: Home con hero, propuesta de valor, especialidades, CTA WhatsApp, preview de testimonios y FAQ
- [x] **CONTENT-02**: Página de Servicios/Condiciones tratadas (traumatología, ortopedia infantil, cirugía de columna)
- [x] **CONTENT-03**: Página de Testimonios
- [x] **CONTENT-04**: Página de Preguntas Frecuentes (incluye objeciones: miedo a cirugía, recuperación)
- [x] **CONTENT-05**: Página de Contacto con mapa/dirección de Clínica Montefiori

### CV — Trayectoria y credenciales

- [x] **CV-01**: Página "Sobre el doctor" con biografía
- [x] **CV-02**: Sección de formación académica, colegiatura (CMP/RNE), cursos y certificaciones — estructurada para ampliarse con el CV completo que el doctor comparta

### CONTACT — Conversión

- [x] **CONTACT-01**: Botón flotante de WhatsApp con mensaje prellenado, visible en todo el sitio
- [x] **CONTACT-02**: CTAs de WhatsApp contextuales en header, hero, servicios y footer (mensaje distinto por ubicación)
- [x] **CONTACT-03**: Formulario de contacto (nombre, teléfono, motivo) con validación server-side
- [x] **CONTACT-04**: Envío de formulario por email (Resend) con fallback a WhatsApp si falla o no hay dominio verificado

### TRACK — Medición

- [x] **TRACK-01**: GA4 integrado (gateado por env var) — mecanismo listo, falta que Juan configure `NEXT_PUBLIC_GA_ID`
- [x] **TRACK-02**: Meta Pixel integrado (gateado por env var) — mecanismo listo, falta que Juan configure `NEXT_PUBLIC_META_PIXEL_ID`
- [x] **TRACK-03**: Evento `whatsapp_click` con dimensión `cta_location` en cada botón de WhatsApp
- [x] **TRACK-04**: Evento `generate_lead`/`form_submit` al enviar el formulario de contacto

### SEO — Descubribilidad

- [x] **SEO-01**: Metadata (title/description/OG) por página vía Metadata API
- [x] **SEO-02**: `sitemap.ts` y `robots.ts`
- [x] **SEO-03**: JSON-LD `Physician` + `FAQPage` en `@graph`
- [x] **SEO-04**: Imágenes optimizadas (`next/image`) y fuentes self-hosted (Core Web Vitals)

### LEGAL — Cumplimiento

- [x] **LEGAL-01**: Página de Política de Privacidad / aviso de datos personales
- [x] **LEGAL-02**: Aviso/banner de cookies antes de cargar GA4/Meta Pixel

### BLOG — Contenido SEO

- [x] **BLOG-01**: Sección de blog/recursos con 4-6 artículos iniciales adaptados del propio contenido educativo de Instagram del doctor

## v2 Requirements

Reconocidos pero fuera del roadmap actual.

### Futuro

- **FUT-01**: Sistema de calendario/reservas con selección de horario en vivo
- **FUT-02**: Multi-idioma (inglés)
- **FUT-03**: CMS con panel de administración de contenido
- **FUT-04**: Tracking server-side (GA4 Measurement Protocol / Meta Conversions API)
- **FUT-05**: Dominio propio + migración desde subdominio Vercel

## Out of Scope

| Feature | Reason |
|---------|--------|
| Pagos en línea | No solicitado; consulta se paga presencial |
| Portal de paciente / historia clínica | Fuera del alcance de un sitio de marketing |
| Sistema de reservas con calendario propio | Cliente pidió mantenerlo simple; WhatsApp + formulario cubre la necesidad real (validado también en competencia) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Done |
| INFRA-02 | Phase 1 | Done |
| INFRA-03 | Phase 4 | Pending (deploy) |
| INFRA-04 | Phase 1 | Done |
| BRAND-01 | Phase 1 | Done |
| BRAND-02 | Phase 1 | Done |
| BRAND-03 | Phase 1 | Done |
| BRAND-04 | Phase 1 | Done |
| CONTENT-01 | Phase 2 | Done |
| CONTENT-02 | Phase 2 | Done |
| CONTENT-03 | Phase 2 | Done |
| CONTENT-04 | Phase 2 | Done |
| CONTENT-05 | Phase 3 | Done |
| CV-01 | Phase 2 | Done |
| CV-02 | Phase 2 | Done |
| CONTACT-01 | Phase 3 | Done |
| CONTACT-02 | Phase 3 | Done |
| CONTACT-03 | Phase 3 | Done |
| CONTACT-04 | Phase 3 | Done |
| TRACK-01 | Phase 3 | Done |
| TRACK-02 | Phase 3 | Done |
| TRACK-03 | Phase 3 | Done |
| TRACK-04 | Phase 3 | Done |
| SEO-01 | Phase 3 | Done |
| SEO-02 | Phase 3 | Done |
| SEO-03 | Phase 3 | Done |
| SEO-04 | Phase 4 | Done |
| LEGAL-01 | Phase 4 | Done |
| LEGAL-02 | Phase 4 | Done |
| BLOG-01 | Phase 4 | Done |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-31*
*Last updated: 2026-07-31 after initial definition*
