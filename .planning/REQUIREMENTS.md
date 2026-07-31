# Requirements: Sitio web Dr. Juan Carlos Angulo Totesaut

**Defined:** 2026-07-31
**Core Value:** Que un paciente que busca un traumatólogo/cirujano de columna en Lima encuentre el sitio, confíe en el doctor y agende cita por WhatsApp en menos de 2 clics — todo evento de contacto queda rastreado.

## v1 Requirements

### INFRA — Base técnica

- [ ] **INFRA-01**: Proyecto Next.js (App Router) + TypeScript + Tailwind CSS scaffolded y corriendo
- [ ] **INFRA-02**: Layout global (header/nav, footer, botón flotante de WhatsApp) presente en todas las páginas
- [ ] **INFRA-03**: Sitio desplegado en Vercel accesible por URL pública (subdominio `.vercel.app`)
- [ ] **INFRA-04**: Variables de entorno para WhatsApp, GA4, Meta Pixel, Resend documentadas (`.env.example`)

### BRAND — Identidad visual

- [ ] **BRAND-01**: Paleta de color (teal + dorado-mostaza) aplicada vía tokens de Tailwind
- [ ] **BRAND-02**: Tipografía Poppins (o equivalente fiel) aplicada con `next/font`
- [ ] **BRAND-03**: Logo/wordmark del doctor visible en header y favicon
- [ ] **BRAND-04**: Componentes base (botones, cards, badges) consistentes con la identidad

### CONTENT — Páginas core

- [ ] **CONTENT-01**: Home con hero, propuesta de valor, especialidades, CTA WhatsApp, preview de testimonios y FAQ
- [ ] **CONTENT-02**: Página de Servicios/Condiciones tratadas (traumatología, ortopedia infantil, cirugía de columna)
- [ ] **CONTENT-03**: Página de Testimonios
- [ ] **CONTENT-04**: Página de Preguntas Frecuentes (incluye objeciones: miedo a cirugía, recuperación)
- [ ] **CONTENT-05**: Página de Contacto con mapa/dirección de Clínica Montefiori

### CV — Trayectoria y credenciales

- [ ] **CV-01**: Página "Sobre el doctor" con biografía
- [ ] **CV-02**: Sección de formación académica, colegiatura (CMP/RNE), cursos y certificaciones — estructurada para ampliarse con el CV completo que el doctor comparta

### CONTACT — Conversión

- [ ] **CONTACT-01**: Botón flotante de WhatsApp con mensaje prellenado, visible en todo el sitio
- [ ] **CONTACT-02**: CTAs de WhatsApp contextuales en header, hero, servicios y footer (mensaje distinto por ubicación)
- [ ] **CONTACT-03**: Formulario de contacto (nombre, teléfono, motivo) con validación server-side
- [ ] **CONTACT-04**: Envío de formulario por email (Resend) con fallback a WhatsApp si falla o no hay dominio verificado

### TRACK — Medición

- [ ] **TRACK-01**: GA4 integrado (gateado por env var)
- [ ] **TRACK-02**: Meta Pixel integrado (gateado por env var)
- [ ] **TRACK-03**: Evento `whatsapp_click` con dimensión `cta_location` en cada botón de WhatsApp
- [ ] **TRACK-04**: Evento `generate_lead`/`form_submit` al enviar el formulario de contacto

### SEO — Descubribilidad

- [ ] **SEO-01**: Metadata (title/description/OG) por página vía Metadata API
- [ ] **SEO-02**: `sitemap.ts` y `robots.ts`
- [ ] **SEO-03**: JSON-LD `Physician` + `FAQPage` en `@graph`
- [ ] **SEO-04**: Imágenes optimizadas (`next/image`) y fuentes self-hosted (Core Web Vitals)

### LEGAL — Cumplimiento

- [ ] **LEGAL-01**: Página de Política de Privacidad / aviso de datos personales
- [ ] **LEGAL-02**: Aviso/banner de cookies antes de cargar GA4/Meta Pixel

### BLOG — Contenido SEO

- [ ] **BLOG-01**: Sección de blog/recursos con 4-6 artículos iniciales adaptados del propio contenido educativo de Instagram del doctor

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
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 4 | Pending |
| INFRA-04 | Phase 1 | Pending |
| BRAND-01 | Phase 1 | Pending |
| BRAND-02 | Phase 1 | Pending |
| BRAND-03 | Phase 1 | Pending |
| BRAND-04 | Phase 1 | Pending |
| CONTENT-01 | Phase 2 | Pending |
| CONTENT-02 | Phase 2 | Pending |
| CONTENT-03 | Phase 2 | Pending |
| CONTENT-04 | Phase 2 | Pending |
| CONTENT-05 | Phase 3 | Pending |
| CV-01 | Phase 2 | Pending |
| CV-02 | Phase 2 | Pending |
| CONTACT-01 | Phase 3 | Pending |
| CONTACT-02 | Phase 3 | Pending |
| CONTACT-03 | Phase 3 | Pending |
| CONTACT-04 | Phase 3 | Pending |
| TRACK-01 | Phase 3 | Pending |
| TRACK-02 | Phase 3 | Pending |
| TRACK-03 | Phase 3 | Pending |
| TRACK-04 | Phase 3 | Pending |
| SEO-01 | Phase 3 | Pending |
| SEO-02 | Phase 3 | Pending |
| SEO-03 | Phase 3 | Pending |
| SEO-04 | Phase 4 | Pending |
| LEGAL-01 | Phase 4 | Pending |
| LEGAL-02 | Phase 4 | Pending |
| BLOG-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-31*
*Last updated: 2026-07-31 after initial definition*
