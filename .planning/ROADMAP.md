# Roadmap: Sitio web Dr. Juan Carlos Angulo Totesaut

## Overview

De cero a un sitio de marketing médico publicado: primero la base técnica y la identidad visual real del doctor, luego las páginas de contenido (incluida una trayectoria/CV extensa), después el motor de conversión (WhatsApp + formulario + tracking) y el SEO técnico, y por último el contenido de blog, lo legal y el pulido final antes de publicar en Vercel.

## Phases

- [ ] **Phase 1: Fundación técnica y de marca** - Scaffold Next.js, design tokens de marca real, layout global con WhatsApp flotante
- [ ] **Phase 2: Páginas core y trayectoria** - Home, Servicios, Testimonios, FAQ, Sobre el doctor con CV extenso
- [ ] **Phase 3: Conversión, tracking y SEO técnico** - Formulario+Resend, JSON-LD, sitemap/robots, eventos GA4/Meta Pixel
- [ ] **Phase 4: Contenido SEO, legal y publicación** - Blog inicial, privacidad/cookies, QA visual/performance, deploy

## Phase Details

### Phase 1: Fundación técnica y de marca
**Goal**: Proyecto Next.js corriendo con la identidad visual real del doctor (colores, tipografía, logo) y el esqueleto de layout (header, footer, botón flotante de WhatsApp) en todas las páginas.
**Depends on**: Nada (primera fase)
**Requirements**: INFRA-01, INFRA-02, INFRA-04, BRAND-01, BRAND-02, BRAND-03, BRAND-04
**Success Criteria** (qué debe ser TRUE):
  1. `npm run dev` levanta el sitio sin errores y se ve un layout con header/footer/botón WhatsApp flotante
  2. Los colores y tipografía visibles coinciden con la paleta e identidad extraída del Instagram del doctor
  3. Existe un `.env.example` documentando las variables necesarias (WhatsApp, GA4, Meta Pixel, Resend)
**Plans**: 2 plans

Plans:
- [ ] 01-01: Scaffold Next.js + Tailwind + estructura de carpetas + fuentes/colores de marca
- [ ] 01-02: Layout global (header, nav, footer, WhatsAppCta flotante) + logo/favicon placeholder

### Phase 2: Páginas core y trayectoria
**Goal**: Todas las páginas de contenido principales existen con copy real (no lorem ipsum), incluida una página de trayectoria con CV extenso del doctor.
**Depends on**: Phase 1
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CV-01, CV-02
**Success Criteria** (qué debe ser TRUE):
  1. Un visitante puede navegar Home → Servicios → Sobre el doctor → Testimonios → FAQ sin páginas rotas o placeholder
  2. La página "Sobre el doctor" muestra formación, colegiatura CMP/RNE y experiencia verificada, con estructura lista para más certificaciones/cursos
  3. La Home comunica las 3 especialidades (traumatología, ortopedia infantil, cirugía de columna) y tiene CTA de WhatsApp visible sin hacer scroll
**Plans**: 3 plans

Plans:
- [ ] 02-01: Home (hero, especialidades, previews de testimonios/FAQ)
- [ ] 02-02: Servicios/condiciones + Testimonios + FAQ
- [ ] 02-03: Sobre el doctor / Trayectoria con sección de CV

### Phase 3: Conversión, tracking y SEO técnico
**Goal**: Toda interacción de contacto (WhatsApp o formulario) funciona y queda medida; el sitio es técnicamente indexable con datos estructurados correctos.
**Depends on**: Phase 2
**Requirements**: CONTENT-05, CONTACT-01, CONTACT-02, CONTACT-03, CONTACT-04, TRACK-01, TRACK-02, TRACK-03, TRACK-04, SEO-01, SEO-02, SEO-03
**Success Criteria** (qué debe ser TRUE):
  1. Página de Contacto muestra dirección/mapa de Clínica Montefiori y un formulario funcional
  2. Enviar el formulario dispara el evento de conversión y, si Resend está configurado, llega un correo; si no, deriva a WhatsApp con los datos prellenados
  3. Cada botón de WhatsApp del sitio (header, hero, flotante, footer) dispara `whatsapp_click` con su `cta_location` cuando GA4/Meta Pixel están configurados
  4. `sitemap.xml`, `robots.txt` y el JSON-LD de tipo Physician/FAQPage son válidos (verificado con un validador de structured data)
**Plans**: 3 plans

Plans:
- [ ] 03-01: Página de Contacto + formulario (Server Action, Resend, fallback WhatsApp)
- [ ] 03-02: Tracking GA4 + Meta Pixel + evento whatsapp_click en todos los CTAs
- [ ] 03-03: JSON-LD Physician/FAQPage + sitemap.ts + robots.ts + metadata por página

### Phase 4: Contenido SEO, legal y publicación
**Goal**: El sitio tiene contenido de blog propio, cumple con el aviso de privacidad/cookies, pasa una revisión visual/performance, y queda publicado en Vercel.
**Depends on**: Phase 3
**Requirements**: BLOG-01, LEGAL-01, LEGAL-02, SEO-04, INFRA-03
**Success Criteria** (qué debe ser TRUE):
  1. Existen 4-6 artículos de blog basados en el contenido educativo real de Instagram del doctor, cada uno con su propia metadata
  2. Aparece un aviso de cookies antes de cargar GA4/Meta Pixel y existe una página de Política de Privacidad enlazada desde el footer
  3. El sitio responde bien en mobile y desktop (verificado visualmente en navegador) y las imágenes/fuentes no generan layout shift visible
  4. El sitio está desplegado y accesible en una URL pública de Vercel
**Plans**: 2 plans

Plans:
- [ ] 04-01: Blog (listado + artículos) + Política de Privacidad + banner de cookies
- [ ] 04-02: QA visual/responsive/performance + deploy a Vercel

## Progress

**Execution Order:**
Fases ejecutan en orden numérico: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundación técnica y de marca | 0/2 | Not started | - |
| 2. Páginas core y trayectoria | 0/3 | Not started | - |
| 3. Conversión, tracking y SEO técnico | 0/3 | Not started | - |
| 4. Contenido SEO, legal y publicación | 0/2 | Not started | - |
