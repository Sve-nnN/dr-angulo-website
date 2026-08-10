# Requirements: Sitio web Dr. Juan Carlos Angulo Totesaut

**Defined:** 2026-07-31
**Current milestone:** v1.1 — Lanzamiento público y competitividad SEO (definido 2026-08-10)
**Core Value:** Que un paciente que busca un traumatólogo/cirujano de columna en Lima encuentre el sitio, confíe en el doctor y agende cita por WhatsApp en menos de 2 clics — todo evento de contacto queda rastreado.

## v1.1 Requirements

Derivados de la auditoría SEO del 2026-08-10. Cada requisito nombra la severidad del hallazgo que resuelve.

### DOM — Dominio y publicación

- [ ] **DOM-01**: Un paciente que escribe drangulocolumna.com llega al sitio del doctor con certificado HTTPS válido, no a la página parqueada de Porkbun *(crítico C1)*
- [ ] **DOM-02**: Quien entra por www.drangulocolumna.com llega al apex en un solo salto 301, directo a HTTPS sin pasar por HTTP *(crítico C3)*
- [ ] **DOM-03**: Los canonicals, las etiquetas OG y el sitemap del sitio publicado apuntan a drangulocolumna.com, y el código no puede caer a un dominio muerto si falta la variable de entorno *(crítico C2)*
- [ ] **DOM-04**: Un paciente que envía el formulario de contacto genera un email real que llega a la casilla del doctor, vía Resend con dominio verificado
- [ ] **DOM-05**: La propiedad está verificada en Search Console, el sitemap enviado, y las 9 rutas base aparecen indexadas

### SVC — Páginas por servicio

- [ ] **SVC-01**: Un paciente que busca "hernia discal" encuentra una página dedicada con 900+ palabras revisadas por el doctor y schema `MedicalProcedure` *(alto A3)*
- [ ] **SVC-02**: Existe la misma página dedicada para estenosis espinal *(alto A3)*
- [ ] **SVC-03**: Existe la misma página dedicada para escoliosis y deformidades de columna *(alto A3)*
- [ ] **SVC-04**: Existe la misma página dedicada para ortopedia infantil *(alto A3)*
- [ ] **SVC-05**: `/servicios` funciona como hub: enlaza a las cuatro páginas, cada una enlaza de vuelta y ofrece CTA de agenda sin volver al inicio

### SEDE — Páginas por sede

- [ ] **SEDE-01**: Cada una de las cuatro sedes tiene URL propia con dirección, días, horarios y su canal de agenda específico *(alto A4)*
- [ ] **SEDE-02**: Un paciente que busca "traumatólogo columna clínica ricardo palma" encuentra la página de esa sede, no una página genérica *(alto A4, related search verificada en la SERP)*
- [ ] **SEDE-03**: Cada página de sede declara su propio JSON-LD y se enlaza en ambos sentidos con `/agendar`

### BLOG — Profundidad de contenido

- [ ] **BLOG-02**: Los cuatro posts existentes pasan de ~200 a 900+ palabras, con revisión del doctor antes de publicar *(alto A1)*
- [ ] **BLOG-03**: Cada post enlaza a su página de servicio relacionada y ofrece CTA de agenda

### SEO — Schema y metadata

- [ ] **SEO-05**: Toda página anidada declara `BreadcrumbList` y Google muestra la miga de pan en el resultado *(alto A6)*
- [ ] **SEO-06**: El `Physician` declara `hasCredential` con CMP 83189 y RNE 35310, y `openingHoursSpecification` del consultorio privado *(alto A6)*
- [ ] **SEO-07**: Los testimonios publicados están marcados con `Review`/`AggregateRating`, únicamente los verificables *(alto A6)*
- [ ] **SEO-08**: Ningún title supera 60 caracteres ni ninguna description 155, en las 9 rutas base más las nuevas *(medio M1)*
- [ ] **SEO-09**: Cada página tiene su propia imagen OG en vez de compartir una sola *(medio M2)*
- [ ] **SEO-10**: El sitio expone `llms.txt` para motores generativos *(medio M4)*
- [ ] **SEO-11**: `dr-angulo-portrait.png` (489 KB, permisos `rw-------`, sin uso) queda fuera del repo *(medio M3)*

### GBP — Local SEO fuera del código

Pasos manuales documentados en el repo. Requieren acceso del doctor a su ficha.

- [ ] **GBP-01**: El horario del GBP refleja los días reales de atención, no "cerrado lunes a jueves" *(alto A5)*
- [ ] **GBP-02**: La ficha declara categorías secundarias y servicios además de "Cirujano ortopédico" *(alto A7)*
- [ ] **GBP-03**: La ficha llega a 15-20 reseñas mediante un procedimiento de solicitud documentado *(alto A7, hoy 6 reseñas contra 13 del líder del pack)*
- [ ] **GBP-04**: El NAP es idéntico en el sitio, el GBP, Doctoralia, el CMP y los directorios de las cuatro clínicas
- [ ] **GBP-05**: Los enlaces con UTM del GBP (`?utm_source=google&utm_medium=organic&utm_campaign=gbp` y el de reservas) resuelven a URLs vivas y su tráfico aparece en GA4

## v1.0 Requirements — entregado

Milestone v1.0, fases 1-6. Conservado para trazabilidad.

### INFRA — Base técnica

- [x] **INFRA-01**: Proyecto Next.js (App Router) + TypeScript + Tailwind CSS scaffolded y corriendo
- [x] **INFRA-02**: Layout global (header/nav, footer, botón flotante de WhatsApp) presente en todas las páginas
- [ ] **INFRA-03**: Sitio desplegado y accesible por URL pública — deployado en Dokploy, contenedor corriendo; el dominio lo cierra DOM-01
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
- [x] **CONTENT-05**: Página de Contacto con mapa/dirección
- [x] **CONTENT-06**: Sección de abordajes quirúrgicos (convencional vs mínimamente invasivo) y patologías tratadas en Servicios

### CV — Trayectoria y credenciales

- [x] **CV-01**: Página "Sobre el doctor" con biografía
- [x] **CV-02**: Sección de formación académica, colegiatura (CMP/RNE), cursos y certificaciones
- [x] **CV-03**: Trayectoria confirmada por el doctor publicada (Universidad de Oriente, Instituto de Columna de Caracas, cursos nacionales e internacionales)

### CONTACT — Conversión

- [x] **CONTACT-01**: Botón flotante de WhatsApp con mensaje prellenado, visible en todo el sitio
- [x] **CONTACT-02**: CTAs de WhatsApp contextuales en header, hero, servicios y footer
- [x] **CONTACT-03**: Formulario de contacto (nombre, teléfono, motivo) con validación server-side
- [x] **CONTACT-04**: Envío de formulario por email (Resend) con fallback a WhatsApp

### TRACK — Medición

- [x] **TRACK-01**: GA4 integrado (gateado por env var)
- [x] **TRACK-02**: Meta Pixel integrado (gateado por env var)
- [x] **TRACK-03**: Evento `whatsapp_click` con dimensión `cta_location`
- [x] **TRACK-04**: Evento `generate_lead`/`form_submit` al enviar el formulario

### SEO — Descubribilidad

- [x] **SEO-01**: Metadata (title/description/OG) por página vía Metadata API
- [x] **SEO-02**: `sitemap.ts` y `robots.ts`
- [x] **SEO-03**: JSON-LD `Physician` + `FAQPage`
- [x] **SEO-04**: Imágenes optimizadas (`next/image`) y fuentes con `display: swap`

### LEGAL — Cumplimiento

- [x] **LEGAL-01**: Página de Política de Privacidad / aviso de datos personales
- [x] **LEGAL-02**: Aviso/banner de cookies antes de cargar GA4/Meta Pixel

### BLOG — Contenido SEO

- [x] **BLOG-01**: Sección de blog con 4 artículos iniciales

### MEDIA — Material real del doctor

- [x] **MEDIA-01**: Fotos profesionales del doctor en AVIF optimizado
- [x] **MEDIA-02**: Logo oficial en header, footer, favicon y apple icon
- [x] **MEDIA-03**: Imagen social 1200x630 en openGraph, twitter y `Physician.image`

### SOCIAL — Feed de Instagram

- [ ] **SOCIAL-01**: Carrusel de reels en Home y Testimonios — código completo y verificado; falta vincular la cuenta
- [ ] **SOCIAL-02**: Renovación automática del token — endpoint listo; falta `CRON_SECRET`, volumen y cron

### LOC — Sedes y agenda

- [x] **LOC-01**: Las cuatro sedes publicadas con días, horarios y direcciones
- [x] **LOC-02**: Botón "Agendar cita" con selección de sede
- [x] **LOC-03**: Alcance del WhatsApp explícito — solo agenda el consultorio privado
- [x] **LOC-04**: NAP principal y JSON-LD con las tres clínicas como `hospitalAffiliation`

## Future Requirements

Reconocidos pero fuera del roadmap actual.

- **FUT-01**: Sistema de calendario/reservas con selección de horario en vivo
- **FUT-02**: Multi-idioma (inglés)
- **FUT-03**: CMS con panel de administración de contenido
- **FUT-04**: Tracking server-side (GA4 Measurement Protocol / Meta Conversions API)
- **FUT-06**: Contenido para las PAA detectadas en la SERP de Lima ("cuánto cuesta una cirugía de columna en Perú", "quiénes son los mejores neurocirujanos en Lima") — depende de que el doctor confirme si publica precios
- **FUT-07**: Vinculación de la cuenta de Instagram para activar el feed vivo (SOCIAL-01, SOCIAL-02) — acción humana pendiente desde v1.0, no bloquea v1.1
- **FUT-08**: Confirmación del estado de Clínica Montefiori — acción humana pendiente desde v1.0

## Out of Scope

| Feature | Reason |
|---------|--------|
| Pagos en línea | No solicitado; consulta se paga presencial |
| Portal de paciente / historia clínica | Fuera del alcance de un sitio de marketing |
| Sistema de reservas con calendario propio | Cliente pidió mantenerlo simple; WhatsApp + formulario cubre la necesidad real |
| Migración a Vercel | Juan confirmó el 2026-08-10 mantener Dokploy self-hosted por consistencia con su otra infraestructura |
| Quitar el `FAQPage` existente | Google retiró los rich results de FAQ el 2026-05-07, pero el marcado sigue siendo contexto válido para motores generativos y no penaliza |
| Páginas de ubicación a escala (30+) | El doctor atiende en cuatro sedes reales; el quality gate de contenido duplicado no aplica a este volumen |

## Traceability

Mapeo v1.1 completado al crear el ROADMAP (2026-08-10). Fases 7 a 11.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOM-01 | Phase 7 | Pending |
| DOM-02 | Phase 7 | Pending |
| DOM-03 | Phase 7 | Pending |
| DOM-04 | Phase 7 | Pending |
| DOM-05 | Phase 7 | Pending |
| SVC-01 | Phase 8 | Pending |
| SVC-02 | Phase 8 | Pending |
| SVC-03 | Phase 8 | Pending |
| SVC-04 | Phase 8 | Pending |
| SVC-05 | Phase 8 | Pending |
| BLOG-02 | Phase 8 | Pending |
| BLOG-03 | Phase 8 | Pending |
| SEDE-01 | Phase 9 | Pending |
| SEDE-02 | Phase 9 | Pending |
| SEDE-03 | Phase 9 | Pending |
| SEO-05 | Phase 10 | Pending |
| SEO-06 | Phase 10 | Pending |
| SEO-07 | Phase 10 | Pending |
| SEO-08 | Phase 10 | Pending |
| SEO-09 | Phase 10 | Pending |
| SEO-10 | Phase 10 | Pending |
| SEO-11 | Phase 10 | Pending |
| GBP-01 | Phase 11 | Pending |
| GBP-02 | Phase 11 | Pending |
| GBP-03 | Phase 11 | Pending |
| GBP-04 | Phase 11 | Pending |
| GBP-05 | Phase 11 | Pending |

**Coverage v1.1:** 27 requisitos, 27 mapeados, 0 sin mapear, 0 duplicados. Cada requisito vive en una sola fase.

**Coverage v1.0:** 40 requisitos, 40 mapeados, 0 sin mapear. Pendientes por acción humana: INFRA-03 (lo cierra DOM-01), SOCIAL-01, SOCIAL-02.

---
*Requirements defined: 2026-07-31*
*Last updated: 2026-08-10 al mapear los 27 requisitos de v1.1 a las fases 7-11 del ROADMAP*
