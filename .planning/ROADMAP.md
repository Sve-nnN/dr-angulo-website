# Roadmap: Sitio web Dr. Juan Carlos Angulo Totesaut

## Overview

De cero a un sitio de marketing médico publicado: primero la base técnica y la identidad visual real del doctor, luego las páginas de contenido (incluida una trayectoria/CV extensa), después el motor de conversión (WhatsApp + formulario + tracking) y el SEO técnico, y por último el contenido de blog, lo legal y el pulido final antes de publicar en Vercel.

## Phases

- [x] **Phase 1: Fundación técnica y de marca** - Scaffold Next.js, design tokens de marca real, layout global con WhatsApp flotante
- [x] **Phase 2: Páginas core y trayectoria** - Home, Servicios, Testimonios, FAQ, Sobre el doctor con CV extenso
- [x] **Phase 3: Conversión, tracking y SEO técnico** - Formulario+Resend, JSON-LD, sitemap/robots, eventos GA4/Meta Pixel
- [x] **Phase 4: Contenido SEO, legal y publicación** - Blog inicial, privacidad/cookies, QA visual/performance, deploy
- [x] **Phase 5: Material real del doctor y feed de Instagram** - Fotos AVIF, logo oficial, trayectoria confirmada, carrusel de reels autoactualizable
- [x] **Phase 6: Sedes, horarios y flujo de agenda** - Cuatro sedes con horarios, página /agendar, WhatsApp acotado al consultorio privado

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
- [x] 01-01: Scaffold Next.js + Tailwind + estructura de carpetas + fuentes/colores de marca
- [x] 01-02: Layout global (header, nav, footer, WhatsAppCta flotante) + logo/favicon placeholder

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
- [x] 02-01: Home (hero, especialidades, previews de testimonios/FAQ)
- [x] 02-02: Servicios/condiciones + Testimonios + FAQ
- [x] 02-03: Sobre el doctor / Trayectoria con sección de CV

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
- [x] 03-01: Página de Contacto + formulario (Server Action, Resend, fallback WhatsApp)
- [x] 03-02: Tracking GA4 + Meta Pixel + evento whatsapp_click en todos los CTAs
- [x] 03-03: JSON-LD Physician/FAQPage + sitemap.ts + robots.ts + metadata por página

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
- [x] 04-01: Blog (listado + artículos) + Política de Privacidad + banner de cookies
- [x] 04-02: QA visual/responsive/performance + deploy a Vercel

### Phase 5: Material real del doctor y feed de Instagram
**Goal**: El sitio muestra el material real que entregó el doctor (fotos de consultorio, logo oficial, trayectoria y procedimientos confirmados) y un carrusel con sus reels de Instagram que se actualiza solo.
**Depends on**: Phase 4
**Requirements**: MEDIA-01, MEDIA-02, MEDIA-03, CV-03, CONTENT-06, SOCIAL-01, SOCIAL-02
**Success Criteria** (qué debe ser TRUE):
  1. Las fotos profesionales del doctor y su logo oficial reemplazan al material placeholder, servidos en AVIF optimizado
  2. La biografía, la formación y los procedimientos publicados corresponden a lo que el doctor confirmó por escrito
  3. El sitio expone una imagen social 1200x630 en openGraph, twitter y el JSON-LD de Physician
  4. Home y Testimonios muestran un carrusel accesible con los últimos reels del Instagram del doctor, que se actualiza sin intervención manual
  5. Sin credenciales de Instagram el carrusel degrada a una tarjeta al perfil, sin romper la página
**Plans**: 3 plans

Plans:
- [x] 05-01: Fotos AVIF + logo oficial + imagen social + trayectoria y procedimientos reales
- [x] 05-02: Carrusel de reels de Instagram + endpoint de renovación de token + documentación
- [x] 05-03: Fotos reales de quirófano en Home, Servicios y Sobre el doctor

### Phase 6: Sedes, horarios y flujo de agenda
**Goal**: El paciente ve dónde atiende el doctor y agenda por el canal que corresponde a cada sede, sin pedirle al doctor citas de clínicas cuya agenda no maneja.
**Depends on**: Phase 5
**Requirements**: LOC-01, LOC-02, LOC-03, LOC-04
**Success Criteria** (qué debe ser TRUE):
  1. El sitio publica las cuatro sedes con sus días, horarios y direcciones
  2. Un botón general de "Agendar cita" lleva a una página donde el paciente elige sede y ve el canal de esa sede
  3. Queda explícito que el WhatsApp del doctor agenda solo el consultorio privado
  4. El NAP principal y el JSON-LD apuntan al consultorio privado, con las tres clínicas como afiliación
  5. Los teléfonos y enlaces de agenda de las clínicas son los oficiales
**Plans**: 1 plan

Plans:
- [x] 06-01: Fuente de verdad de sedes + página /agendar + reruteo de CTA, contenido y schema

## Progress

**Execution Order:**
Fases ejecutan en orden numérico: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundación técnica y de marca | 2/2 | Complete | 2026-07-31 |
| 2. Páginas core y trayectoria | 3/3 | Complete | 2026-07-31 |
| 3. Conversión, tracking y SEO técnico | 3/3 | Complete | 2026-07-31 |
| 4. Contenido SEO, legal y publicación | 2/2 | Complete (deploy pendiente) | 2026-07-31 |
| 5. Material real del doctor y feed de Instagram | 3/3 | Complete (vinculación de Instagram pendiente) | 2026-08-09 |
| 6. Sedes, horarios y flujo de agenda | 1/1 | Complete (falta confirmar estado de Montefiori) | 2026-08-09 |
