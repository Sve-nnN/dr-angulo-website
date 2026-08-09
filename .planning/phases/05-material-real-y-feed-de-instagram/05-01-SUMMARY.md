---
phase: 05-material-real-y-feed-de-instagram
plan: 05-01
subsystem: media-y-trayectoria
tags: [fotos, avif, logo, og, cv, servicios, schema]
provides:
  - Fotos profesionales reales del doctor en AVIF en Home, Sobre el doctor y Servicios
  - Logo oficial en header, footer, favicon y apple icon
  - Biografía y formación confirmadas por el doctor (15 años, Universidad de Oriente, Instituto de Columna de Caracas)
  - Sección de abordajes quirúrgicos (convencional vs mínimamente invasivo) en Servicios
  - Imagen social 1200x630 en openGraph, twitter y JSON-LD
affects: [05-02]
tech-stack:
  added: []
  patterns: ["AVIF para fotos del sitio, JPG solo para la imagen social", "recorte del logo por detección de bounding box en vez de recorte manual"]
key-files:
  created: [public/dr-angulo-consulta.avif, public/dr-angulo-implante-disco.avif, public/dr-angulo-modelo-columna.avif, public/logo-icon-square.avif, public/logo-dr-angulo.avif, public/og-dr-angulo.jpg]
  modified: [src/content/cv.ts, src/content/services.ts, src/content/testimonials.ts, src/app/page.tsx, src/app/sobre-el-doctor/page.tsx, src/app/servicios/page.tsx, src/app/testimonios/page.tsx, src/app/layout.tsx, src/components/structured-data.tsx, src/components/layout/header.tsx, src/components/layout/footer.tsx, src/app/icon.png, src/app/apple-icon.png, public/logo-icon-square.png, public/logo-dr-angulo.png]
key-decisions: ["Fotos en AVIF (~51-58 KB contra ~200 KB en JPG)", "OG en JPG por compatibilidad con scrapers de redes", "Iconos en PNG porque los navegadores no aceptan AVIF de favicon", "Solo credenciales confirmadas por escrito por el doctor"]
duration: ~50min
completed: 2026-08-08
status: complete
---

# Phase 5 · Plan 05-01: Material real del doctor Summary

**El sitio deja de mostrar material placeholder: fotos profesionales de consultorio en AVIF, el logo oficial, la trayectoria real del doctor y la explicación de sus dos abordajes quirúrgicos.**

## Performance
- **Duration:** ~50min
- **Tasks:** 3 completadas
- **Files modified:** ~20

## Accomplishments
- Tres fotos profesionales convertidas a AVIF a 1400 px: `dr-angulo-consulta` (58 KB), `dr-angulo-implante-disco` (54 KB) y `dr-angulo-modelo-columna` (51 KB), contra los ~200 KB que pesaban los JPG equivalentes. Los JPG intermedios se borraron.
- Logo oficial procesado por detección de bounding box: `logo-icon-square` (símbolo JA centrado, 4 KB en AVIF) y `logo-dr-angulo` (símbolo + wordmark, 17 KB). Header y footer ya lo usan; `icon.png` y `apple-icon.png` regenerados desde el símbolo nuevo.
- `og-dr-angulo.jpg` 1200x630 nuevo, cableado en `openGraph.images`, `twitter.images` y `Physician.image` — el sitio no tenía imagen social hasta ahora.
- `cv.ts` con la formación confirmada: traumatólogo por la Universidad de Oriente, especialización de columna en el Instituto de Columna de Caracas (Hospital de Clínicas Caracas), cursos y entrenamientos nacionales e internacionales, y `credentialsInfo.yearsOfExperience = 15`.
- `services.ts` con `procedureApproaches[]` (mínimamente invasiva y convencional, con ejemplos de cada una) y las condiciones de columna ampliadas a deformidades, enfermedad degenerativa discal y procesos inflamatorios.
- Home: foto real en el hero con recorte responsivo, badge de años de experiencia, copy del hero y del bloque de confianza reescrito con la formación real, y la tarjeta genérica de "3 especialidades" cambiada por "Cirugía mínimamente invasiva".
- Sobre el doctor: retrato real, biografía en primera persona, chip de 15 años y bloque "Procedimientos de vanguardia" que enlaza a la sección nueva de Servicios. Reemplaza el recuadro punteado que anunciaba contenido pendiente.
- Servicios: sección `#procedimientos` con las dos tarjetas de abordaje, foto y metadata de página actualizada.
- Testimonios: tarjetas de enlace a la publicación de Instagram con testimonios en video y a Doctoralia. No se citaron frases porque Instagram bloquea el scraping y no se inventan testimonios.
- `structured-data.tsx`: `alumniOf` con las dos instituciones y `knowsAbout` ampliado con cirugía mínimamente invasiva, deformidades y enfermedad degenerativa.

## Files Created/Modified
- `public/*.avif` - Fotos y logo optimizados
- `public/og-dr-angulo.jpg` - Imagen social 1200x630
- `src/app/icon.png` / `src/app/apple-icon.png` - Favicon y touch icon desde el logo oficial
- `src/content/cv.ts` - Formación, experiencia y años de ejercicio
- `src/content/services.ts` - `procedureApproaches` + condiciones de columna
- `src/content/testimonials.ts` - `reviewLinks.instagram`
- `src/app/page.tsx` / `sobre-el-doctor` / `servicios` / `testimonios` - Fotos y copy real
- `src/app/layout.tsx` - Metadata social
- `src/components/structured-data.tsx` - `image` + `alumniOf` + `knowsAbout`
- `src/components/layout/header.tsx` / `footer.tsx` - Logo nuevo

## Pendiente
- Nombres y fechas de los cursos y entrenamientos internacionales, para ampliar la sección de Formación.
- `public/dr-angulo-portrait.png` (el frame de video con marca de agua) quedó en el repo sin uso; se puede borrar cuando Juan confirme.
