---
phase: 10-schema-metadata-y-limpieza-t-cnica
reviewed: 2026-08-14T00:51:42Z
depth: standard
files_reviewed: 33
files_reviewed_list:
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/app/agendar/page.tsx
  - src/app/blog/page.tsx
  - src/app/contacto/page.tsx
  - src/app/preguntas-frecuentes/page.tsx
  - src/app/sedes/page.tsx
  - src/app/servicios/page.tsx
  - src/app/sobre-el-doctor/page.tsx
  - src/app/testimonios/page.tsx
  - src/content/location-pages/clinica-ricardo-palma.ts
  - src/content/location-pages/clinica-tezza.ts
  - src/content/location-pages/consultorio-privado.ts
  - src/content/location-pages/sanna-la-molina.ts
  - src/content/service-pages/escoliosis-y-deformidades.ts
  - src/content/service-pages/estenosis-espinal.ts
  - src/content/service-pages/hernia-discal.ts
  - src/content/service-pages/ortopedia-infantil.ts
  - src/content/blog/5-sintomas-de-columna-que-no-debes-ignorar.ts
  - src/content/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber.ts
  - src/app/servicios/[slug]/page.tsx
  - src/app/sedes/[slug]/page.tsx
  - src/app/blog/[slug]/page.tsx
  - scripts/check-sedes.mjs
  - scripts/check-seo.mjs
  - src/lib/og-card.tsx
  - src/app/opengraph-image.tsx
  - src/app/sobre-el-doctor/opengraph-image.tsx
  - src/app/servicios/opengraph-image.tsx
  - src/app/servicios/[slug]/opengraph-image.tsx
  - src/app/sedes/opengraph-image.tsx
  - src/app/sedes/[slug]/opengraph-image.tsx
  - src/app/blog/opengraph-image.tsx
  - src/app/blog/[slug]/opengraph-image.tsx
  - src/app/testimonios/opengraph-image.tsx
  - src/app/preguntas-frecuentes/opengraph-image.tsx
  - src/app/agendar/opengraph-image.tsx
  - src/app/contacto/opengraph-image.tsx
  - src/app/privacidad/opengraph-image.tsx
  - src/lib/llms-txt.ts
  - src/app/llms.txt/route.ts
  - src/app/sitemap.xml/route.ts
  - public/sitemap.xsl
  - src/components/structured-data.tsx
  - package.json
  - PRODUCT.md
findings:
  critical: 2
  warning: 3
  info: 0
  total: 5
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-08-14T00:51:42Z
**Depth:** standard
**Files Reviewed:** 33 (source files; several files in the requested list are content data files with no logic to review beyond the title/description length audit performed below)
**Status:** issues_found

## Summary

Reviewed the dynamic Open Graph image pipeline (`og-card.tsx` + 13 `opengraph-image.tsx` segments), the custom `sitemap.xml` route handler and its XSL stylesheet, the `llms.txt` generator, the `title: { absolute }` rewrites across 9 static pages and 3 dynamic segments, `src/components/structured-data.tsx`, and the two quality-gate scripts (`check-sedes.mjs`, `check-seo.mjs`).

To verify claims empirically rather than by inspection alone, I ran `npm run build` and then `node scripts/check-seo.mjs` against the real build output, and inspected the prerendered HTML directly. The build succeeds and `check-seo.mjs` reports "Sin fallas." However, the gate only asserts `<title>`/`<meta description>` length and `og:image`/`og:image:alt` presence — it never asserts that `og:title`, `og:description`, or `og:url` match the page they're on. Inspecting the rendered HTML directly surfaced a severe, provable defect that the gate does not catch: **13 of 23 routes serve the homepage's generic Open Graph title/description/url instead of their own**, and **all 23 routes serve an identical, generic Twitter Card title/description** regardless of page. This directly undercuts the stated goal of this phase (a unique, page-specific social card per route) on exactly the channel the product treats as primary (WhatsApp/Facebook link previews use `og:title`/`og:description`/`og:image` together — Product Principle #1 in `PRODUCT.md` is "WhatsApp gana siempre"). The `og:image` itself is correct and unique per route (verified in the build output), so the resulting share card shows the *right* photo/eyebrow/title art next to the *wrong* headline and blurb for most pages.

Two smaller issues also surfaced: the custom sitemap route silently drops `lastModified` for all 4 sede URLs even though the data is available and the sibling `serviceRoutes`/`blogRoutes` arrays use it, and `SITEMAP_TOTAL` is duplicated as an unsynced magic number across two separate gate scripts with a comment that's already hard to reconcile with the current file layout.

Title/description character-length compliance (60/155) was independently recomputed for every route in the requested file list and matches what `check-seo.mjs` reports; no findings there.

## Critical Issues

### CR-01: Most routes emit the homepage's `og:title`, `og:description` and `og:url` instead of their own

**File:** `src/app/layout.tsx:34-50` (root cause), affecting `src/app/agendar/page.tsx`, `src/app/blog/page.tsx`, `src/app/contacto/page.tsx`, `src/app/preguntas-frecuentes/page.tsx`, `src/app/sedes/page.tsx`, `src/app/servicios/page.tsx`, `src/app/sobre-el-doctor/page.tsx`, `src/app/testimonios/page.tsx`, and `src/app/sedes/[slug]/page.tsx` (4 sede pages), plus `/privacidad` (13 routes total out of 23)

**Issue:** None of these `generateMetadata`/`metadata` exports declare their own `openGraph` object. Per Next.js's documented metadata-merging rule (`node_modules/next/dist/docs/.../generate-metadata.md`, "Merging" → "Inheriting fields": *"All `openGraph` fields from `app/layout.js` are inherited in `app/about/page.js` because `app/about/page.js` doesn't set `openGraph` metadata."*), any segment that doesn't declare its own `openGraph` object inherits the **entire** object from the root layout verbatim — including `title`, `description`, and `url`, which in `layout.tsx` are hardcoded to the homepage's copy (`siteConfig` values / the home row of the v1.2 package).

Confirmed empirically after `npm run build`, reading the actual prerendered HTML:

```
$ grep -o '<meta property="og:title"[^>]*>' .next/server/app/agendar.html .next/server/app/sedes/clinica-tezza.html
.next/server/app/agendar.html:<meta property="og:title" content="Traumatología en Lima: Dr. Juan Carlos Angulo"/>
.next/server/app/sedes/clinica-tezza.html:<meta property="og:title" content="Traumatología en Lima: Dr. Juan Carlos Angulo"/>
```

`/agendar`'s own title is "Agendar una cita con el Dr. Angulo" and `/sedes/clinica-tezza`'s own title is "Ortopedia infantil en la Clínica Tezza, Lima" — neither ever reaches `og:title`. `og:url` is worse: for these 13 routes it's hardcoded to `https://drangulocolumna.com` (the homepage URL) regardless of which page is shared:

```
$ grep -o '<meta property="og:url"[^>]*>' .next/server/app/sedes/clinica-tezza.html .next/server/app/agendar.html
.next/server/app/sedes/clinica-tezza.html:<meta property="og:url" content="https://drangulocolumna.com"/>
.next/server/app/agendar.html:<meta property="og:url" content="https://drangulocolumna.com"/>
```

The `og:image` for these same routes *is* correct and unique (via the `opengraph-image.tsx` file convention, which resolves independently of the `openGraph` config object), so the net effect is a WhatsApp/Facebook preview with the right photo and eyebrow art but the wrong headline, wrong summary, and a link back to the homepage instead of the shared page. This defeats the explicit purpose of this phase for the majority of routes on the product's primary conversion channel (`PRODUCT.md`, Product Principle #1: "WhatsApp gana siempre").

Note that even the pages that *do* declare their own `openGraph` object (`src/app/servicios/[slug]/page.tsx`, `src/app/blog/[slug]/page.tsx`) never set `url`, so those routes emit no `og:url` tag at all rather than an incorrect one — still non-compliant with the Open Graph protocol, which requires `og:url`.

The plan's own record (`10-01-PLAN.md` Task 2) acknowledges the inheritance mechanism explicitly ("Ese par [openGraph.title/description] es el que hereda cualquier ruta que no declare el suyo") but only realigned the layout defaults to match the *homepage's* row, and only fixed `openGraph` on pages that already declared one. The 9 static pages that don't declare `openGraph` were left inheriting the homepage's copy, and this gap was never verified for anything other than `/`. `scripts/check-seo.mjs` does not check `og:title`, `og:description`, or `og:url` at all (only `og:image`/`og:image:alt` and the plain `<title>`/`<meta description>`), so this ships silently through the phase's own quality gate.

**Fix:** Give every route-level `generateMetadata`/`metadata` export its own `openGraph: { title, description, url }` derived from the same `title`/`description` already computed for `<title>`/`<meta description>`, e.g. for the static pages:

```ts
export const metadata: Metadata = {
  title: { absolute: "Agendar una cita con el Dr. Angulo" },
  description: "Cómo pedir cita en cada sede: ...",
  alternates: { canonical: "/agendar" },
  openGraph: {
    title: "Agendar una cita con el Dr. Angulo",
    description: "Cómo pedir cita en cada sede: ...",
    url: "/agendar",
  },
};
```

and for the dynamic segments (`sedes/[slug]/page.tsx`, and adding `url` to the two that already set `openGraph`):

```ts
return {
  title: { absolute: entry.page.title },
  description: entry.page.description,
  alternates: { canonical: `/sedes/${entry.page.slug}` },
  openGraph: {
    title: entry.page.title,
    description: entry.page.description,
    url: `/sedes/${entry.page.slug}`,
  },
};
```

Given how easy this is to reintroduce, also extend `scripts/check-seo.mjs`'s `checkMetadataLength` (or a new check) to assert `og:title === <title>` text and `og:description === meta description` text (after unescaping) per route, and that `og:url` ends with the route's own path — so a future regression fails the gate instead of shipping.

### CR-02: `twitter:title` and `twitter:description` are identical, generic text on every single route

**File:** `src/app/layout.tsx:51-61`, inherited unchanged by all 23 routes including the ones fixed for `og:title` (e.g. `src/app/servicios/[slug]/page.tsx`, `src/app/blog/[slug]/page.tsx`)

**Issue:** No route in the reviewed set — not even the ones that declare their own `openGraph` object — ever declares a `twitter` metadata object of its own. Since the root layout always emits `twitter.title`/`twitter.description` (never omits them), every route inherits that exact literal text verbatim. Confirmed on the build output:

```
$ grep -o '<meta name="twitter:title"[^>]*>' .next/server/app/servicios/hernia-discal.html .next/server/app/blog/artrosis.html .next/server/app/agendar.html
.next/server/app/servicios/hernia-discal.html:<meta name="twitter:title" content="Dr. Juan Carlos Angulo Totesaut — Traumatólogo y Cirujano de Columna en Lima"/>
.next/server/app/blog/artrosis.html:<meta name="twitter:title" content="Dr. Juan Carlos Angulo Totesaut — Traumatólogo y Cirujano de Columna en Lima"/>
.next/server/app/agendar.html:<meta name="twitter:title" content="Dr. Juan Carlos Angulo Totesaut — Traumatólogo y Cirujano de Columna en Lima"/>
```

`10-01-SUMMARY.md` justifies leaving `twitter.title`/`twitter.description` untouched with: *"twitter.title y twitter.description del layout no se tocaron. El plan acota el cambio a openGraph y a title.default, y X toma og: cuando falta la etiqueta propia."* That reasoning is incorrect in practice: X/Twitter only falls back to `og:title`/`og:description` when its own tag is **absent** from the page. Here the tag is never absent — it's always present, just wrong/generic — so the fallback this comment relies on never fires, on any of the 23 routes, including the ones where `og:title` is already correct (`/servicios/hernia-discal`, `/blog/artrosis`, etc.).

**Fix:** Either (a) stop declaring `twitter.title`/`twitter.description` in the layout at all, so X genuinely falls back to `og:title`/`og:description` (which will be correct once CR-01 is fixed) the same way `twitter.images` was deliberately omitted for this exact reason (see the comment right above it in `layout.tsx:55-60`), or (b) set `twitter.title`/`twitter.description` per route alongside the `openGraph` fix in CR-01. Option (a) is the smaller, lower-risk change and matches the precedent already established for `twitter.images` in the same file.

## Warnings

### WR-01: Sede sitemap entries never get `lastModified`, even though the data exists

**File:** `src/app/sitemap.xml/route.ts:62-68`
**Issue:** `serviceRoutes` and `blogRoutes` both set `lastModified: page.updatedAt`, but `locationRoutes` omits the field entirely:

```ts
const locationRoutes: MetadataRoute.Sitemap = locationPages.map((page) => ({
  url: `${siteConfig.url}/sedes/${page.slug}`,
  changeFrequency: "monthly",
  priority: 0.8,
}));
```

`LocationPage.updatedAt` is optional (`updatedAt?: string` in `src/content/location-pages/types.ts`), but all 4 current sede modules do populate it (`updatedAt: "2026-08-13"` in each of `clinica-ricardo-palma.ts`, `clinica-tezza.ts`, `consultorio-privado.ts`, `sanna-la-molina.ts`). Confirmed on the built sitemap — `<lastmod>` is present for service/blog URLs and absent for every `/sedes/*` URL:

```
$ grep -A4 "sedes/clinica-tezza<" .next/server/app/sitemap.xml.body
<loc>https://drangulocolumna.com/sedes/clinica-tezza</loc>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>
```

This silently drops a real freshness signal for the 4 sede pages, which is squarely inside the scope of this phase (the phase's own `check-sedes.mjs` even asserts the sitemap declares each sede URL).

**Fix:**

```ts
const locationRoutes: MetadataRoute.Sitemap = locationPages.map((page) => ({
  url: `${siteConfig.url}/sedes/${page.slug}`,
  ...(page.updatedAt ? { lastModified: page.updatedAt } : {}),
  changeFrequency: "monthly",
  priority: 0.8,
}));
```

### WR-02: `SITEMAP_TOTAL` is a duplicated, unsynced magic number in two independent gate scripts

**File:** `scripts/check-seo.mjs:41`, `scripts/check-sedes.mjs:63`
**Issue:** Both scripts hardcode `const SITEMAP_TOTAL = 22`, each justified by its own multi-line arithmetic comment (`"21 + 1 + 2 − 2 = 22"`) that references "la fase 8" and "la fase 9" rather than deriving the number from the actual content registries. There is no shared constant or derivation from `servicePages.length + locationPages.length + blogPosts.length + <static count>`. Adding or removing a service page, sede, or blog post (or a static route) now requires remembering to update both files by hand; if only one is updated, one gate silently checks a stale number until it either false-fails or, worse, false-passes because the two miscounts happen to cancel out.

**Fix:** Derive `SITEMAP_TOTAL` once, either by having both scripts import the same content registries (`servicePages`, `locationPages`, `blogPosts`) and compute the expected count, or by extracting a single shared constant/helper both scripts import. At minimum, replace the two independent hardcoded literals with one that both scripts read from (e.g. a small `scripts/seo-manifest.mjs`), so a future content addition can't silently desync the two gates.

---

## Fix Applied

- **CR-01 (fixed, `bdd7519`):** every route that lacked its own `openGraph` object now declares `{ title, description, url }` matching its own `<title>`/`<meta description>`; the two dynamic routes that already declared `openGraph` gained the missing `url`. Verified against the rebuilt HTML: `/agendar` now serves its own `og:title`/`og:url` instead of the homepage's.
- **CR-02 (fixed, `bdd7519`):** root layout no longer declares `twitter.title`/`twitter.description`, so X falls back to each route's own `og:title`/`og:description` (same precedent as `twitter.images`). Verified: `twitter:title` now differs per route in the rebuilt HTML.
- **WR-01 (fixed, `68ed9b5`):** `locationRoutes` in `src/app/sitemap.xml/route.ts` now emits `lastModified` from `page.updatedAt` when present, matching `serviceRoutes`/`blogRoutes`. Verified against the rebuilt sitemap.
- **WR-02 (skipped):** `scripts/check-sedes.mjs` documents inline, from an earlier phase, that it deliberately avoids sharing modules with the other gate scripts ("acoplar el gate de la fase 8 al de la fase 9 no compra nada"). Introducing a shared `SITEMAP_TOTAL` module now would contradict that documented decision for a warning-level, non-blocking finding. Left as three independently-commented magic numbers (also found in `scripts/check-content.mjs`, not flagged by the original review).

All four quality gates (`tsc`, `lint`, `build`, `check-content.mjs`, `check-sedes.mjs`, `check-seo.mjs`) green after the fix.

_Reviewed: 2026-08-14T00:51:42Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
