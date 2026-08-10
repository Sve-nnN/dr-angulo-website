---
phase: 04-contenido-seo-legal-y-publicaci-n
verified: 2026-07-31T09:00:00Z
status: human_needed
score: 3/4 must-haves verified
behavior_unverified: 0
---

# Phase 4: Contenido SEO, legal y publicación Verification Report

**Phase Goal:** El sitio tiene contenido de blog propio, cumple con el aviso de privacidad/cookies, pasa una revisión visual/performance, y queda desplegado y accesible públicamente (ROADMAP original decía "en Vercel"; la infra real terminó siendo Dokploy autoalojado en el VPS propio de Juan — ver addendum abajo).
**Verified:** 2026-07-31
**Status:** human_needed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Existen 4-6 artículos de blog basados en el contenido educativo real de Instagram del doctor, cada uno con su propia metadata | ✓ VERIFIED | `src/content/blog.ts` con 4 posts (slug/title/description/date/paragraphs); `blog/[slug]/page.tsx` genera metadata (title/description/OG/canonical) por post vía `generateMetadata`; `npm run build` genera las 4 rutas como SSG |
| 2 | Aparece un aviso de cookies antes de cargar GA4/Meta Pixel y existe una página de Política de Privacidad enlazada desde el footer | ✓ VERIFIED | `cookie-consent-banner.tsx` + `consent.ts` (localStorage vía `useSyncExternalStore`); `analytics-scripts.tsx` exige `consent === "granted"` antes de renderizar `<GoogleAnalytics>`/Meta Pixel; `footer.tsx` enlaza `/privacidad` en todas las páginas |
| 3 | El sitio responde bien en mobile y desktop, y las imágenes/fuentes no generan layout shift visible | ✓ VERIFIED | Verificado visualmente en navegador (desktop + mobile) durante la sesión de construcción; `next/image` en logos/fotos, `next/font` self-hosted con `display: swap` desde Phase 1; `npm run build` limpio reconfirmado en esta sesión (18 rutas, sin errores) |
| 4 | El sitio está desplegado y accesible en una URL pública | ◐ PARCIAL | **Decisión de infra cambió respecto al ROADMAP original: no Vercel, sino Dokploy autoalojado en el VPS propio de Juan** (`sapling-vps-01`, mismo stack que usa para sus otros clientes — ver `/Users/juan/Documents/Codigo/Personal/hosting`). Deploy ejecutado 2026-08-01: repo `github.com/Sve-nnN/dr-angulo-website` creado y pusheado, proyecto Dokploy `client-dr-angulo` creado, build exitoso (Nixpacks), contenedor corriendo y estable (`dr-angulo-website-nqscdc`, "Ready in 287ms" en los logs de runtime, sin crash-loop). **Falta únicamente el dominio público** — Juan decidió deployar sin dominio por ahora; sin un dominio con DNS apuntando a la IP del VPS + el paso Domain/SSL en Dokploy, el sitio no tiene una URL pública todavía. |

**Score:** 3/4 truths verified (criterio 4 parcialmente cerrado — deploy sí, dominio no)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/content/blog.ts` | 4-6 posts con metadata | ✓ EXISTS + SUBSTANTIVE | 4 posts, cada uno con slug/title/description/date/paragraphs[] |
| `src/app/blog/page.tsx` | Listado de blog | ✓ EXISTS + SUBSTANTIVE | Metadata propia, canonical, mapea blogPosts |
| `src/app/blog/[slug]/page.tsx` | Artículo individual | ✓ EXISTS + SUBSTANTIVE | generateStaticParams + generateMetadata por post |
| `src/app/privacidad/page.tsx` | Política de privacidad | ✓ EXISTS + SUBSTANTIVE | 5 secciones, robots noindex, canonical |
| `src/components/cookie-consent-banner.tsx` | Banner de cookies | ✓ EXISTS + SUBSTANTIVE | Aceptar/Rechazar, link a /privacidad |
| Deploy (URL pública) | Sitio accesible públicamente | ◐ PARTIAL | Contenedor deployado y corriendo en Dokploy (self-hosted), falta dominio para URL pública |

**Artifacts:** 5/6 verified

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `cookie-consent-banner.tsx` | `consent.ts` | `useSyncExternalStore` | ✓ WIRED | Banner se oculta cuando `consent !== null` |
| `analytics-scripts.tsx` | `consent.ts` | mismo store de consentimiento | ✓ WIRED | `if (consent !== "granted") return null;` antes de montar GA4/Meta Pixel |
| `layout.tsx` | `cookie-consent-banner.tsx` / `analytics-scripts.tsx` | render en `<body>` | ✓ WIRED | Ambos renderizados al final del body, después de `WhatsAppFloatButton` |
| `footer.tsx` | `/privacidad` | `<Link href="/privacidad">` | ✓ WIRED | Visible en el footer de todas las páginas |
| `src/content/blog.ts` | `src/app/sitemap.ts` | `blogPosts.map(...)` | ✓ WIRED | Cada post genera una entrada de sitemap |

**Wiring:** 5/5 connections verified

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|-----------------|
| BLOG-01 | ✓ SATISFIED | - |
| LEGAL-01 | ✓ SATISFIED | - |
| LEGAL-02 | ✓ SATISFIED | - |
| SEO-04 | ✓ SATISFIED | - |
| INFRA-03 | ◐ PARTIAL | Deploy ejecutado en Dokploy (self-hosted), falta asignar dominio para la URL pública |

**Coverage:** 4/5 requirements satisfied

## Human Verification Required

### 1. Asignar dominio público
**Test:** Cuando Juan tenga un dominio (propio o subdominio) listo: apuntar el registro DNS `A` a la IP de `sapling-vps-01`, luego `domain.create` vía la API de Dokploy (`applicationId: 29ZFzVVwEczNI733DodMp`, puerto `3000`, HTTPS/Let's Encrypt) — ver `infra/API-DEPLOY-GUIDE.md` paso 8 en el repo `hosting`. Si el DNS está proxeado por Cloudflare, dejarlo en DNS-only para la primera emisión del certificado.
**Expected:** El sitio queda accesible en `https://<dominio>`.
**Why human:** Requiere que Juan decida/compre el dominio — un agente no puede elegir esto por él.

### 2. Variables de entorno en producción (opcional, antes o después del dominio)
**Test:** Vía la API de Dokploy (`application.saveEnvironment` + `application.deploy`, o el script `infra/apps/set-env-and-redeploy.sh` del repo `hosting`) configurar `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `RESEND_API_KEY`/`EMAIL_FROM` y `NEXT_PUBLIC_SITE_URL` (al dominio real) cuando Juan tenga esas cuentas.
**Expected:** GA4/Meta Pixel y el envío de email por Resend quedan activos en producción; sin estas variables el sitio sigue funcionando normalmente (WhatsApp como fallback de contacto, los componentes de analytics simplemente no renderizan).
**Why human:** Requiere credenciales y cuentas propias de Juan (Google Analytics, Meta Business, Resend) que un agente no posee ni puede crear en su nombre.

## Gaps Summary

**1 gap — dominio público pendiente de decisión de Juan. Resto de la fase completo, incluido el deploy.**

No es un gap de código ni de infraestructura: el sitio ya está deployado y corriendo de forma estable en el VPS propio de Juan (Dokploy, proyecto `client-dr-angulo` → app `dr-angulo-website`). El único pendiente es que Juan decida/consiga un dominio y lo apunte, detallado en "Human Verification Required" arriba.

### Non-Critical Gaps (Can Defer)

1. **Dominio público no asignado**
   - Issue: el sitio corre pero no tiene una URL pública alcanzable desde internet (por diseño de seguridad de esta infra, no se publican puertos de host sin dominio)
   - Impact: no bloquea la calidad ni la integridad del sitio — el contenedor está sano y corriendo, listo para recibir dominio en cualquier momento
   - Recommendation: en cuanto Juan tenga un dominio, seguir el paso 1 de "Human Verification Required" arriba

## Verification Metadata

**Verification approach:** Goal-backward (derived from phase goal)
**Must-haves source:** PLAN.md frontmatter (04-01-PLAN.md, 04-02-PLAN.md)
**Automated checks:** 3 passed, 0 failed (1 no aplica por vía automatizada — requiere acción humana)
**Human checks required:** 2
**Total verification time:** ~15 min

---
*Verified: 2026-07-31*
*Verifier: Claude (sesión autónoma)*

**Addendum (2026-08-01):** Deploy ejecutado — no en Vercel (nunca se usó, el .env.example original documentaba variables genéricas pero el hosting real no estaba decidido), sino en la infraestructura propia de Juan (Hetzner + Dokploy, `/Users/juan/Documents/Codigo/Personal/hosting`), el mismo stack que ya usa para sus otros clientes (juantech, Juan Portfolio). Repo: `github.com/Sve-nnN/dr-angulo-website`. Dokploy: proyecto `client-dr-angulo`, `applicationId: 29ZFzVVwEczNI733DodMp`, appName `dr-angulo-website-nqscdc`. Build Nixpacks exitoso tras regenerar `package-lock.json` para el target Linux (fix commiteado: `22f5a52`). Contenedor corriendo y estable, sin dominio público todavía (decisión explícita de Juan — dominio se agrega después). Detalle completo en `04-02-SUMMARY.md`.
