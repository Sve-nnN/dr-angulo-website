---
phase: 05-material-real-y-feed-de-instagram
plan: 05-02
subsystem: feed-instagram
tags: [instagram, reels, carrusel, isr, accesibilidad, tracking]
provides:
  - Carrusel de reels de Instagram autoactualizable en Home y Testimonios
  - Módulo de acceso a la API de Instagram con token persistido y renovable
  - Endpoint /api/instagram/refresh protegido por CRON_SECRET
  - Documentación de vinculación en docs/instagram-reels.md
affects: []
tech-stack:
  added: []
  patterns: ["split servidor/cliente del módulo para no arrastrar node:fs al bundle", "ISR por página (revalidate 3600) + fetch tag para invalidación on-demand", "scroll suave por CSS con motion-reduce en vez de behavior:smooth en JS"]
key-files:
  created: [src/lib/instagram.ts, src/lib/instagram-shared.ts, src/components/instagram/instagram-reels-section.tsx, src/components/instagram/reels-carousel.tsx, src/app/api/instagram/refresh/route.ts, docs/instagram-reels.md]
  modified: [src/app/page.tsx, src/app/testimonios/page.tsx, src/lib/tracking.ts, next.config.ts]
key-decisions: ["API oficial de Instagram en vez de widget de terceros o lista manual (elección de Juan)", "Tarjetas con portada + caption que abren en Instagram, sin embed ni cookies de terceros", "Token persistido en volumen de Dokploy para sobrevivir deploys", "Fallback a tarjeta de perfil cuando no hay token o la API falla"]
duration: ~60min
completed: 2026-08-08
status: complete (pendiente de vinculación humana)
---

# Phase 5 · Plan 05-02: Feed de reels de Instagram Summary

**Home y Testimonios muestran los últimos reels del doctor, alimentados por la API oficial de Instagram y actualizados solos cada hora. Falta únicamente vincular la cuenta.**

## Performance
- **Duration:** ~60min
- **Tasks:** 3 completadas
- **Files modified:** 10 (6 creados)

## Accomplishments
- `src/lib/instagram.ts`: consulta `graph.instagram.com/v25.0/me/media`, filtra reels por `media_product_type`, cachea una hora con tag para invalidación on-demand, y resuelve el token leyendo primero el archivo persistido y cayendo al de entorno. `refreshAccessToken()` extiende el token 60 días y lo guarda con su fecha de vencimiento.
- `src/lib/instagram-shared.ts`: el tipo `InstagramReel` y `reelTitle` viven aparte porque el componente cliente los necesita y el módulo principal toca `node:fs`. Sin esta separación el build falla con "the chunking context does not support external modules (request: node:fs/promises)".
- `reels-carousel.tsx`: scroll-snap horizontal, contenedor enfocable con `aria-labelledby`, botones prev/next con `aria-label` y `disabled` en los extremos calculado con scroll + `ResizeObserver`, suavizado por CSS con `motion-reduce:scroll-auto`, portadas decorativas (`alt=""`) porque el caption ya viaja en el texto del enlace, y aviso `sr-only` de apertura en pestaña nueva.
- `instagram-reels-section.tsx`: server component con encabezado, link al perfil y fallback a tarjeta cuando no hay reels. Montado en Home (8) y Testimonios (12), ambas con `revalidate = 3600`.
- `src/app/api/instagram/refresh/route.ts`: valida `CRON_SECRET` con `timingSafeEqual`, renueva el token, invalida `REELS_CACHE_TAG` y responde con `refreshedAt`/`expiresAt` sin exponer el token.
- Evento `instagram_reel_click` sumado a `tracking.ts`.
- `next.config.ts` habilita `**.cdninstagram.com` y `**.fbcdn.net` en `images.remotePatterns` — las portadas vienen con URLs firmadas que caducan, por eso el refresco horario.
- `docs/instagram-reels.md` con el paso a paso completo de vinculación.

## Verificación hecha
- Carrusel probado en navegador con datos de muestra: scroll, botones, estados `disabled` y actualización de bordes al desplazar, todo correcto.
- El scroll suave no se anima en el entorno de automatización porque ahí las animaciones están desactivadas a nivel navegador (se reprodujo también con `window.scrollBy({behavior:"smooth"})` sobre la página entera); no es un problema del componente.
- Fallback verificado sin token: Home renderiza la tarjeta al perfil y el resto de la página queda intacta.
- `npm run build`, `npx tsc --noEmit` y `npm run lint` limpios.

## Pendiente
- **Vinculación de la cuenta** — ver `05-VERIFICATION.md` § Human Verification Required y `docs/instagram-reels.md`. Hasta entonces la sección muestra el fallback.
- Las tres variables (`INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_TOKEN_FILE`, `CRON_SECRET`) no se pudieron agregar a `.env.example` porque el entorno de la sesión bloquea la lectura de archivos `.env`; quedan documentadas en `docs/instagram-reels.md`.
