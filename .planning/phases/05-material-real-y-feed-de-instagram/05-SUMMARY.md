---
phase: 05-material-real-y-feed-de-instagram
plan: 05-01, 05-02
subsystem: media-trayectoria-y-social
tags: [fotos, avif, logo, og, cv, servicios, instagram, reels, accesibilidad]
provides:
  - Material real del doctor (fotos AVIF, logo oficial, imagen social) reemplazando el placeholder
  - Trayectoria y procedimientos confirmados por el doctor en Home, Sobre el doctor y Servicios
  - Carrusel de reels de Instagram autoactualizable con renovación automática de token
affects: []
tech-stack:
  added: []
  patterns: ["AVIF para fotos, JPG solo para la imagen social", "split servidor/cliente para módulos que tocan node:fs", "ISR + fetch tags para contenido externo"]
key-files:
  created: [public/dr-angulo-consulta.avif, public/dr-angulo-implante-disco.avif, public/dr-angulo-modelo-columna.avif, public/logo-icon-square.avif, public/logo-dr-angulo.avif, public/og-dr-angulo.jpg, src/lib/instagram.ts, src/lib/instagram-shared.ts, src/components/instagram/instagram-reels-section.tsx, src/components/instagram/reels-carousel.tsx, src/app/api/instagram/refresh/route.ts, docs/instagram-reels.md]
  modified: [src/content/cv.ts, src/content/services.ts, src/content/testimonials.ts, src/app/page.tsx, src/app/sobre-el-doctor/page.tsx, src/app/servicios/page.tsx, src/app/testimonios/page.tsx, src/app/layout.tsx, src/components/structured-data.tsx, src/components/layout/header.tsx, src/components/layout/footer.tsx, src/lib/tracking.ts, next.config.ts, src/app/icon.png, src/app/apple-icon.png]
key-decisions: ["Fotos en AVIF por pedido de Juan; OG e iconos quedan en JPG/PNG por compatibilidad", "API oficial de Instagram en vez de widget de terceros", "Tarjetas que abren en Instagram, sin embed ni cookies de terceros", "Solo credenciales confirmadas por el doctor, sin inventar"]
duration: ~110min
completed: 2026-08-08
status: partial
---

# Phase 5: Material real del doctor y feed de Instagram Summary

**El sitio pasa de material placeholder a material real: fotos profesionales del consultorio en AVIF, logo oficial, la trayectoria que el doctor confirmó y sus dos abordajes quirúrgicos. Además suma un carrusel con sus reels de Instagram que se actualiza solo — falta únicamente vincular la cuenta.**

## Performance
- **Duration:** ~110min
- **Plans:** 2 (05-01 material real, 05-02 feed de Instagram)
- **Files modified:** ~30

## Accomplishments

### 05-01 · Material real
- Tres fotos profesionales en AVIF (51-58 KB contra ~200 KB en JPG), repartidas entre el hero de Home, el retrato de Sobre el doctor y las secciones de procedimientos.
- Logo oficial recortado por detección de bounding box: símbolo para header, footer y favicon, versión con wordmark disponible. Reemplaza el recorte de captura de Instagram y el retrato que era un frame de video con marca de agua.
- Primera imagen social del sitio (`og-dr-angulo.jpg` 1200x630), cableada en openGraph, twitter y `Physician.image`.
- Biografía y formación reales: 15 años de ejercicio, Universidad de Oriente, Instituto de Columna de Caracas dentro del Hospital de Clínicas Caracas, cursos nacionales e internacionales. `alumniOf` sumado al JSON-LD.
- Sección nueva en Servicios explicando cirugía convencional y mínimamente invasiva, más las patologías que trata el doctor: deformidades como la escoliosis, enfermedad degenerativa y procesos inflamatorios.

### 05-02 · Feed de Instagram
- Carrusel de reels en Home y Testimonios alimentado por la API oficial, revalidado cada hora, con tarjetas de portada + caption que abren el video en Instagram.
- Accesible: operable con teclado, botones etiquetados con estado en los extremos, respeta `prefers-reduced-motion`, portadas decorativas para no duplicar el texto del enlace.
- Token de larga duración persistido en volumen y renovable sin redeploy vía `/api/instagram/refresh`, protegido con `CRON_SECRET`.
- Degradación limpia: sin token o con la API caída, aparece una tarjeta que lleva al perfil.

## Task Commits
Pendiente de commit al cierre de la sesión.

## Pendiente

- **Vincular la cuenta de Instagram** — es el único bloqueo real de la fase. Requiere que la cuenta del doctor sea Profesional, una app en Meta for Developers, la autorización del doctor y la configuración de variables + volumen + cron en Dokploy. Paso a paso en `docs/instagram-reels.md` y en `05-VERIFICATION.md`.
- El cron por HTTPS depende del dominio público, que sigue pendiente desde Phase 4. Mientras tanto la renovación se puede disparar a mano contra la IP del VPS.
- Nombres y fechas de los cursos internacionales del doctor, para ampliar Formación.
- Testimonios citables: hoy solo se enlaza la publicación de Instagram porque bloquea el scraping.

## Next Phase Readiness
No hay Phase 6 planificada. El sitio queda completo a nivel de código; lo que resta son dos acciones humanas encadenadas (dominio y vinculación de Instagram), ninguna de las cuales un agente puede ejecutar por Juan.
