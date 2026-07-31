---
phase: 04-contenido-seo-legal-y-publicaci-n
plan: 04-01, 04-02
subsystem: blog-legal-qa-deploy
tags: [blog, seo, legal, cookies, qa, deploy, vercel]
provides:
  - Blog con 4 artículos educativos (listado + artículo individual, SSG)
  - Política de privacidad (/privacidad)
  - Banner de consentimiento de cookies gateando GA4/Meta Pixel
  - QA visual/responsive verificado en navegador
affects: []
tech-stack:
  added: []
  patterns: ["useSyncExternalStore para estado de consentimiento cross-tab", "generateStaticParams + generateMetadata por artículo de blog"]
key-files:
  created: [src/content/blog.ts, src/app/blog/page.tsx, "src/app/blog/[slug]/page.tsx", src/app/privacidad/page.tsx, src/components/cookie-consent-banner.tsx, src/components/analytics/consent.ts]
  modified: [src/components/analytics/analytics-scripts.tsx, src/app/layout.tsx, src/components/layout/footer.tsx, src/app/sitemap.ts]
key-decisions: ["Cookie consent con localStorage + useSyncExternalStore, sin librería de terceros", "/privacidad con robots noindex", "Deploy a Vercel diferido — requiere login/autorización de Juan"]
duration: ~40min (04-01) + QA transversal (04-02)
completed: 2026-07-31
status: partial
---

# Phase 4: Contenido SEO, legal y publicación Summary

**Blog propio con 4 artículos, política de privacidad y banner de cookies que gatea GA4/Meta Pixel, todo verificado visualmente en navegador. El deploy a Vercel queda pendiente de acción de Juan.**

## Performance
- **Duration:** ~40min (04-01) + QA transversal (04-02)
- **Tasks:** 4 completadas (3 de 04-01 + la tarea de QA de 04-02); el deploy de 04-02 NO se ejecutó
- **Files modified:** ~10

## Accomplishments
- 4 artículos de blog (`src/content/blog.ts`) adaptados del contenido educativo real de Instagram del doctor (dolor de espalda, hernia discal vs. dolor muscular, miedo a la cirugía de columna, estenosis espinal), cada uno con su propia ruta SSG y metadata (title/description/OG/canonical) vía `generateStaticParams`/`generateMetadata`
- Listado `/blog` y detalle `/blog/[slug]` con CTA de WhatsApp al final de cada artículo
- Política de privacidad (`/privacidad`) con 5 secciones (datos recopilados, contacto por WhatsApp, cookies/analítica, derechos bajo la Ley N.º 29733, contacto), `robots: { index: false }`, enlazada desde el footer en todas las páginas
- Banner de consentimiento de cookies (`cookie-consent-banner.tsx`) sobre un store en `localStorage` (`consent.ts`, vía `useSyncExternalStore`) — `analytics-scripts.tsx` ahora exige `consent === "granted"` además de las env vars ya requeridas, así que GA4/Meta Pixel nunca cargan sin aceptación explícita del visitante
- `sitemap.ts` actualizado para incluir una entrada por artículo de blog
- QA visual/responsive verificado en navegador (desktop + mobile) sobre las 18 rutas del sitio (incluidas las nuevas de blog/privacidad); `npm run build` limpio, reconfirmado en esta sesión de backfill (18 rutas generadas, 4 posts SSG, sin errores ni warnings)
- **Deploy a Vercel: NO ejecutado.** Requiere que Juan haga login/autorización en Vercel — ver sección "Pendiente" abajo

## Task Commits
1. **Sitio completo (incluye blog, privacidad, banner de cookies)** - `88b397d`

## Files Created/Modified
- `src/content/blog.ts` - 4 posts (slug/title/description/date/paragraphs)
- `src/app/blog/page.tsx` / `src/app/blog/[slug]/page.tsx` - Listado + artículo individual (SSG)
- `src/app/privacidad/page.tsx` - Política de privacidad
- `src/components/cookie-consent-banner.tsx` / `src/components/analytics/consent.ts` - Banner + store de consentimiento
- `src/components/analytics/analytics-scripts.tsx` - Gate de consentimiento añadido sobre el gate de env vars existente (Phase 3)
- `src/app/sitemap.ts` - Entradas de blog agregadas
- `src/components/layout/footer.tsx` - Link a /privacidad
- `src/app/layout.tsx` - Renderiza CookieConsentBanner junto a AnalyticsScripts

## Pendiente

- **Deploy a Vercel — bloqueado en acción humana.** Juan debe correr `vercel login` + `vercel deploy` desde la raíz del proyecto (o conectar el repo desde vercel.com/new). El build de producción (`npm run build`) ya pasa limpio y está listo para desplegarse tal cual.
- Configurar `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `RESEND_API_KEY` + `EMAIL_FROM` en Vercel (Project → Settings → Environment Variables) cuando Juan tenga esas cuentas/dominio verificado — el sitio funciona sin ellas (WhatsApp cubre el fallback de contacto, los componentes de analytics simplemente no renderizan).

## Next Phase Readiness
No hay una Phase 5 planificada — este es el último milestone del roadmap v1. El sitio queda completo y verificado a nivel de código (blog, legal, cookies, QA). El único paso restante para considerarlo "en producción" es el deploy a Vercel, que está fuera del alcance de lo que un agente puede ejecutar y requiere que Juan lo autorice directamente.
