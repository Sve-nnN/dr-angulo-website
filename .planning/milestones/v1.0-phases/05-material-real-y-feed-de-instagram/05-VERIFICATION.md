---
phase: 05-material-real-y-feed-de-instagram
verified: 2026-08-08T23:10:00Z
status: human_needed
score: 6/7 must-haves verified
behavior_unverified: 0
---

# Phase 5: Material real del doctor y feed de Instagram Verification Report

**Phase Goal:** El sitio muestra el material real del doctor (fotos, logo, trayectoria, procedimientos) y un carrusel de sus reels de Instagram que se actualiza solo.
**Verified:** 2026-08-08
**Status:** human_needed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Las fotos profesionales reales se muestran en Home, Sobre el doctor y Servicios, en AVIF optimizado | ✓ VERIFIED | `public/dr-angulo-{consulta,implante-disco,modelo-columna}.avif` (58/54/51 KB); referenciadas en `page.tsx`, `sobre-el-doctor/page.tsx` y `servicios/page.tsx`; verificado en navegador sobre el build de producción |
| 2 | El logo oficial reemplaza al recorte de captura en header, footer, favicon y apple icon | ✓ VERIFIED | `logo-icon-square.avif` (4 KB) en `header.tsx` y `footer.tsx`; `src/app/icon.png` (512) y `apple-icon.png` (180) regenerados desde el símbolo; logo nuevo visible en el header en la verificación de navegador |
| 3 | La biografía y la formación reflejan lo que el doctor confirmó | ✓ VERIFIED | `src/content/cv.ts` con Universidad de Oriente, Instituto de Columna de Caracas (Hospital de Clínicas Caracas) y `yearsOfExperience: 15`; biografía en `sobre-el-doctor/page.tsx`; ningún dato sin confirmación escrita |
| 4 | Servicios explica los dos abordajes quirúrgicos y las patologías tratadas | ✓ VERIFIED | `procedureApproaches[]` en `services.ts`; sección `#procedimientos` renderizada y verificada en navegador; condiciones de columna ampliadas con deformidades, degenerativas e inflamatorias |
| 5 | El sitio expone imagen social en openGraph, twitter y JSON-LD | ✓ VERIFIED | `og-dr-angulo.jpg` 1200x630; `layout.tsx` con `openGraph.images` + `twitter.images`; `structured-data.tsx` con `image` y `alumniOf` |
| 6 | El carrusel de reels es accesible y degrada limpio sin credenciales | ✓ VERIFIED | Probado en navegador con datos de muestra: scroll, botones prev/next, `disabled` en extremos y actualización al desplazar; contenedor enfocable con `aria-labelledby`; sin token, Home renderiza la tarjeta de fallback al perfil (verificado sobre el build de producción) |
| 7 | El carrusel muestra los reels reales del Instagram del doctor y se actualiza solo | ◐ PARCIAL | Todo el código está en su lugar y verificado (`getInstagramReels`, ISR de 1 hora, endpoint de refresh, dominios del CDN habilitados), pero **la cuenta todavía no está vinculada**: falta la app de Meta, el token y la configuración en Dokploy. Hasta entonces la sección muestra el fallback |

**Score:** 6/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `public/*.avif` | Fotos y logo optimizados | ✓ EXISTS + SUBSTANTIVE | 3 fotos + 2 versiones de logo, todas bajo 60 KB |
| `public/og-dr-angulo.jpg` | Imagen social 1200x630 | ✓ EXISTS + SUBSTANTIVE | 87 KB, rostro completo en el encuadre |
| `src/content/cv.ts` | Formación real + años | ✓ EXISTS + SUBSTANTIVE | 3 entradas de formación, 3 de experiencia, `yearsOfExperience` |
| `src/content/services.ts` | Abordajes quirúrgicos | ✓ EXISTS + SUBSTANTIVE | `procedureApproaches` con 2 abordajes y 4 ejemplos cada uno |
| `src/lib/instagram.ts` | Feed + token | ✓ EXISTS + SUBSTANTIVE | Fetch cacheado con tag, resolución y renovación de token |
| `src/components/instagram/reels-carousel.tsx` | Carrusel accesible | ✓ EXISTS + SUBSTANTIVE | Scroll-snap, botones etiquetados, `motion-reduce` |
| `src/app/api/instagram/refresh/route.ts` | Endpoint de renovación | ✓ EXISTS + SUBSTANTIVE | `timingSafeEqual` sobre `CRON_SECRET`, invalida el tag |
| `docs/instagram-reels.md` | Paso a paso de vinculación | ✓ EXISTS + SUBSTANTIVE | App de Meta, token, variables, volumen y cron |
| Cuenta de Instagram vinculada | Feed real corriendo | ◐ PARTIAL | Bloqueado en acción humana |

**Artifacts:** 8/9 verified

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `layout.tsx` | `og-dr-angulo.jpg` | `openGraph.images` / `twitter.images` | ✓ WIRED | Ambas metadata apuntan al mismo archivo |
| `structured-data.tsx` | `og-dr-angulo.jpg` | `Physician.image` | ✓ WIRED | Más `alumniOf` con las dos instituciones |
| `servicios/page.tsx` | `services.ts` | `import { procedureApproaches }` | ✓ WIRED | Sección `#procedimientos` renderiza las 2 tarjetas |
| `sobre-el-doctor/page.tsx` | `/servicios#procedimientos` | `<Link>` desde el bloque de vanguardia | ✓ WIRED | Ancla verificada en navegador |
| `instagram-reels-section.tsx` | `instagram.ts` | `await getInstagramReels(limit)` | ✓ WIRED | Fallback cuando devuelve `[]` |
| `reels-carousel.tsx` | `tracking.ts` | `trackReelClick(reel.id)` | ✓ WIRED | Evento `instagram_reel_click` en GA4 |
| `api/instagram/refresh` | `instagram.ts` | `refreshAccessToken()` + `revalidateTag` | ✓ WIRED | Build lo genera como ruta dinámica |
| `next.config.ts` | CDN de Instagram | `images.remotePatterns` | ✓ WIRED | `**.cdninstagram.com` y `**.fbcdn.net` |

**Wiring:** 8/8 connections verified

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|-----------------|
| MEDIA-01 | ✓ SATISFIED | - |
| MEDIA-02 | ✓ SATISFIED | - |
| MEDIA-03 | ✓ SATISFIED | - |
| CV-03 | ✓ SATISFIED | - |
| CONTENT-06 | ✓ SATISFIED | - |
| SOCIAL-01 | ◐ PARTIAL | Código completo y verificado; falta vincular la cuenta para que el feed traiga reels reales |
| SOCIAL-02 | ◐ PARTIAL | Endpoint listo; falta `CRON_SECRET` + volumen + cron programado (y dominio público para llamarlo por HTTPS) |

**Coverage:** 5/7 requirements satisfied

## Build & Checks

- `npm run build`: limpio, 19 rutas (18 estáticas/SSG + `/api/instagram/refresh` dinámica)
- `npx tsc --noEmit`: sin errores
- `npm run lint`: sin hallazgos
- Verificación visual en navegador sobre el build de producción: Home, Sobre el doctor, Servicios y Testimonios

## Human Verification Required

### 1. Vincular la cuenta de Instagram

Referencia completa: `docs/instagram-reels.md`. Resumen de los pasos, en orden:

**Paso 1 — Cuenta profesional (lo hace el doctor, ~5 min).**
Instagram → Configuración → Tipo de cuenta y herramientas → Cambiar a cuenta profesional → Business. Si ya es Business o Creator, saltearlo. Sin esto la API no devuelve nada.

**Paso 2 — App en Meta for Developers (lo hace Juan, ~10 min).**
1. https://developers.facebook.com/apps → Crear app.
2. Caso de uso **Other** → tipo **Business**.
3. Agregar el producto **Instagram** → **API con inicio de sesión de Instagram**.
4. Sección **Generar token de acceso**: conectar la cuenta del doctor. Él tiene que autorizar desde su Instagram.
5. Copiar el token de larga duración (60 días). Es un secreto: no va al repo.

**Paso 3 — Dokploy (lo hace Juan, ~5 min).**
1. Advanced → Volumes → montar un volumen en `/data`. Sin volumen, cada deploy vuelve al token de la variable de entorno.
2. Variables de entorno de `dr-angulo-website`:
   - `INSTAGRAM_ACCESS_TOKEN` = el token del paso 2
   - `INSTAGRAM_TOKEN_FILE` = `/data/instagram-token.json`
   - `CRON_SECRET` = cadena aleatoria larga (`openssl rand -hex 32`)
3. Guardar y redeployar.

**Paso 4 — Cron semanal (lo hace Juan).**
```
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://<dominio>/api/instagram/refresh
```
Cada llamada extiende el token 60 días. Instagram exige que el token tenga al menos 24 horas de vida antes de la primera renovación, así que conviene arrancar el cron al día siguiente de generarlo. Este paso depende del dominio público pendiente de Phase 4; mientras tanto se puede disparar a mano contra la IP del VPS.

**Expected:** El carrusel de Home y Testimonios muestra los reels reales del doctor y suma los nuevos dentro de la hora de publicados.
**Why human:** Requiere login del doctor en Instagram, una cuenta de Meta for Developers y acceso al panel de Dokploy. Nada de eso lo puede ejecutar un agente.

### 2. Confirmar el borrado del retrato viejo

`public/dr-angulo-portrait.png` (frame de video con marca de agua) quedó en el repo sin referencias. Borrarlo cuando Juan confirme.
