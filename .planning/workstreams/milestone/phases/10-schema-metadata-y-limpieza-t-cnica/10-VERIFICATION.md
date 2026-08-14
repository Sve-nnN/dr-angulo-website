---
phase: 10-schema-metadata-y-limpieza-t-cnica
verified: 2026-08-14T01:30:00Z
status: human_needed
score: 5/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Compartir 2-3 URLs distintas del sitio (portada, una sede, una guía de servicio) por WhatsApp y confirmar que la tarjeta previa muestra imagen, título y resumen propios de esa página."
    expected: "Cada tarjeta muestra su propia foto/eyebrow/título/resumen, no los de la portada. WhatsApp puede tardar en refrescar su caché de og:image para URLs que ya compartió antes del fix `bdd7519`."
    why_human: "El código sirve og:title/og:description/og:url/og:image correctos por ruta (verificado contra el HTML del build), pero cómo WhatsApp cachea y renderiza la vista previa es un comportamiento de un servicio externo que no se puede verificar desde el repositorio."
  - test: "Buscar en Google 2-3 rutas anidadas ya indexadas (una guía de servicio, una sede) y revisar si el resultado de búsqueda muestra la miga de pan en vez de la URL cruda."
    expected: "El snippet de Google muestra Inicio > Servicios > Hernia discal (o equivalente) en vez de la URL."
    why_human: "El `BreadcrumbList` JSON-LD válido está confirmado en el HTML de las 20 rutas anidadas; que Google efectivamente lo use para pintar la miga de pan en la SERP depende de su rastreo e indexación, no del código. El propio 10-SUMMARY.md ya registra esto como seguimiento posterior, no bloqueante."
---

# Phase 10: Schema, metadata y limpieza técnica — Verification Report

**Phase Goal:** Google y los motores generativos leen el sitio completo sin ambigüedad: quién es el doctor, qué acredita, cuándo atiende, qué opera y dónde está parado el usuario dentro del sitio.
**Verified:** 2026-08-14T01:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Nota sobre la forma de la fase

Esta fase no tiene un `10-PLAN.md` numerado. SEO-05, SEO-06, SEO-07, SEO-09, SEO-10 y SEO-11 se cerraron en una corrida ad-hoc previa, documentada únicamente en `10-SUMMARY.md`, tal como lo anota el ROADMAP en sus "Notas de ejecución" para esta fase. Solo SEO-08 (longitud de title/description) quedó cubierto por los tres planes numerados `10-01`, `10-02` y `10-03`. Esto no es un gap: es la forma de ejecución documentada y aceptada.

Además, un code review posterior (`10-REVIEW.md`) encontró 2 hallazgos críticos (CR-01, CR-02) y 2 advertencias (WR-01, WR-02) sobre esta fase. Los críticos y una advertencia se arreglaron en commits separados (`bdd7519`, `68ed9b5`) ya en `main`. Esta verificación no confía en la sección "## Fix Applied" del review — cada fix se comprobó de nuevo contra el HTML del build actual (ver Anti-Patterns / Fix Verification más abajo).

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Toda página anidada (servicios, sedes, blog) declara `BreadcrumbList` válido | ✓ VERIFIED | `BreadcrumbList` presente en el HTML de `/servicios/hernia-discal`, `/sedes/clinica-tezza`, `/blog/artrosis` (grep sobre `.next/server/app/`); ausente en `/` (home es primer nivel, correcto). Confirmación de que Google *muestra* la miga en la SERP es externa — ver Human Verification. |
| 2 | `Physician` declara `hasCredential` (CMP 83189, RNE 35310) + `openingHoursSpecification` del consultorio privado, sin errores | ✓ VERIFIED | JSON-LD del home: `hasCredential` con ambos IDs y `recognizedBy: Colegio Médico del Perú`; 10 ocurrencias de `openingHoursSpecification` en el grafo (Physician + 4 sedes con día/hora). `npx tsc --noEmit` y `npm run build` limpios (no hay validador de schema.org en el repo, pero la forma del JSON-LD es sintácticamente válida y consistente con el vocabulario). |
| 3 | Testimonios verificables marcados con `Review`/`AggregateRating`; ninguno no verificable marcado | ✓ VERIFIED | Confirmado contra **producción real** (`https://drangulocolumna.com/`, HTTP 200): `aggregateRating` con `ratingValue: 5`, `reviewCount: 5` y un array `review` poblado desde la API de Google Places en vivo (`src/lib/google-reviews.ts` + `structured-data.tsx`). El único testimonio estático de `src/content/testimonials.ts` ("Excelente profesional.", Doctoralia, "Paciente verificado") **no** se emite como `Review` — no hay código que lo convierta a JSON-LD. El código degrada a no emitir marcado si la API falla (confirmado: 403 en local por restricción de IP, sin marcado, comportamiento correcto y documentado). |
| 4 | Ningún title pasa de 60 ni ninguna description de 155 (9 rutas base + servicio + sede); compartir cualquier URL en WhatsApp muestra la imagen (y, por extensión, el título/URL) OG propia de esa página | ✓ VERIFIED | `npm run seo:check`: 23 rutas medidas, sin fallas, title más largo 50/60, description más larga 142/155. `og:image` confirmado único por ruta (6 rutas de muestra, URLs de imagen distintas). **CR-01 del code review** (13/23 rutas heredaban `og:title`/`og:description`/`og:url` de la portada) está arreglado en el commit `bdd7519`, ya en `main`, y se reverificó de forma independiente contra el HTML reconstruido: `/agendar`, `/sedes/clinica-tezza`, `/sedes/consultorio-privado`, `/sobre-el-doctor`, `/testimonios` y `/privacidad` ya sirven su propio `og:title` y `og:url`, no los de `/`. Aunque el texto literal del criterio 4 solo nombra la imagen, el título y la URL son parte de lo que WhatsApp muestra al compartir un enlace — con el bug sin arreglar, la tarjeta habría mostrado la foto correcta junto a un titular y un link equivocados, lo que no cumple el espíritu de "la imagen OG propia de esa página" como representación fiel de "esa página". Con el fix, las tres piezas (imagen, título, URL) son propias de cada ruta. |
| 5 | `/llms.txt` responde 200 con el resumen del sitio; `dr-angulo-portrait.png` fuera del repo y del build | ✓ VERIFIED | `curl http://localhost:3000/llms.txt` → 200, `text/plain; charset=utf-8`, contenido real (nombre, credenciales, especialidad, formación, 154 líneas según `seo:check`). `public/dr-angulo-portrait.png` no existe en el filesystem, no hay referencias en `src/`, y `curl .../dr-angulo-portrait.png` → 404 contra el servidor local. |

**Score:** 5/5 truths verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/layout.tsx` | title.default/description/openGraph del paquete v1.2, sin twitter.title/description genéricos | ✓ VERIFIED | Confirmado por diff (`bef9ca1`, `cd5a0d5`, `bdd7519`) y por HTML servido |
| `src/app/{9 rutas base}/page.tsx` | `title: { absolute }` + description del paquete + `openGraph` propio | ✓ VERIFIED | Longitudes y ausencia de sufijo confirmadas para las 9 rutas vía `seo:check`; `openGraph` propio confirmado para 6 de 9 por muestreo directo de HTML |
| `src/content/{service-pages,location-pages,blog}/*.ts` | title/description del paquete en las 13 rutas dinámicas | ✓ VERIFIED | `seo:check` mide las 23 rutas totales (incluye las 13 dinámicas) sin fallas |
| `scripts/check-seo.mjs` | Séptima familia `checkMetadataLength`, deriva rutas del sitemap, falla si excede 60/155 | ✓ VERIFIED | Ejecutado directamente: "23 rutas revisadas... Sin fallas." Prueba de mutación descrita en el plan (inyectar title largo) ya documentada como pasada en `10-03-SUMMARY.md`; no se repitió la mutación en esta verificación por no modificar el build, pero la lógica del script (`checkMetadataLength`, límites 60/155 como constantes) está presente en el archivo y se ejecuta como parte de `seo:check` en cada corrida. |
| `src/lib/llms-txt.ts` + `src/app/llms.txt/route.ts` | Genera `/llms.txt` desde fuentes de contenido | ✓ VERIFIED | 200, contenido real, sin texto escrito a mano fuera de las fuentes de `src/content`/`src/lib` |
| `src/components/structured-data.tsx` | `hasCredential`, `openingHoursSpecification`, `BreadcrumbList`, `Review`/`AggregateRating` condicional | ✓ VERIFIED | Confirmado por grep de funciones y por HTML de producción |
| `.planning/workstreams/milestone/REQUIREMENTS.md` | SEO-08 y SEO-09 en `Complete` en checkbox y tabla de trazabilidad | ⚠️ PARCIAL (no bloqueante) | Checkbox: los 7 requisitos (SEO-05 a SEO-11) están marcados `[x]`. Tabla de trazabilidad: SEO-08 y SEO-09 dicen `Complete`, pero SEO-05, SEO-06, SEO-07, SEO-10 y SEO-11 siguen en `Pending` en esa tabla — desalineado con el checkbox y con la evidencia de código, que confirma los 7 como cumplidos. Es un gap de bookkeeping documental, no de código; no bloquea esta verificación porque la fuente de verdad (checkbox + evidencia real) ya está al día. Ver Gaps. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `metadataTitle()` en `src/lib/og-card.tsx` | metadata de cada ruta (`{ absolute }`) | lee `title.absolute` para renderizar la tarjeta OG | ✓ WIRED | Confirmado: og:image únicos por ruta, generados en build (`generateStaticParams`), sin segunda copia del texto |
| `generateMetadata` de `[slug]/page.tsx` (servicios/sedes/blog) | `src/content/*` | lee `page.title`/`page.description` | ✓ WIRED | Longitudes de las 13 rutas dinámicas coinciden con el handoff, medidas sobre HTML servido |
| Rutas sin `openGraph` propio | root layout | herencia de metadata de Next.js | ✓ WIRED (post-fix) | Antes del fix (`bdd7519`) esta herencia era el bug (CR-01): 13 rutas heredaban la portada. Ahora cada ruta declara su propio `openGraph`, así que la herencia ya no se activa incorrectamente |
| `twitter:title`/`twitter:description` | `og:title`/`og:description` | fallback de Next.js cuando la ruta no declara `twitter` propio | ✓ WIRED (post-fix) | Confirmado: `twitter:title` difiere por ruta en el HTML reconstruido tras `bdd7519` (antes era idéntico y genérico en las 23 rutas — CR-02) |
| `getGoogleReviews()` en `google-reviews.ts` | `AggregateRating`/`Review` en `structured-data.tsx` | API de Google Places, degrada a null sin marcado | ✓ WIRED | Confirmado contra producción real: datos de reseñas en vivo, no hardcodeados |
| `locationRoutes` en `src/app/sitemap.xml/route.ts` | `page.updatedAt` de cada sede | `lastModified` en el XML | ✓ WIRED (post-fix) | WR-01 arreglado en `68ed9b5`: `<lastmod>2026-08-13</lastmod>` presente para `/sedes/clinica-tezza` en el XML servido |

### Fix Verification (10-REVIEW.md → commits → estado actual)

| Hallazgo | Commit que dice arreglarlo | Verificado independientemente contra HTML/build actual |
|----------|------------------------------|----------------------------------------------------------|
| CR-01 (13/23 rutas con og:title/description/url de la portada) | `bdd7519` | ✓ Confirmado: 6 rutas de muestra (`agendar`, `sedes/clinica-tezza`, `sedes/consultorio-privado`, `sobre-el-doctor`, `testimonios`, `privacidad`) sirven su propio `og:title` y `og:url`, no el de `/` |
| CR-02 (twitter:title/description genéricos e idénticos en las 23 rutas) | `bdd7519` | ✓ Confirmado: `twitter:title`/`twitter:description` distintos entre `/`, `/agendar`, `/servicios/hernia-discal`, `/blog/artrosis` en el HTML reconstruido |
| WR-01 (sedes sin `lastModified` en el sitemap) | `68ed9b5` | ✓ Confirmado: `<lastmod>` presente para `/sedes/clinica-tezza` en `sitemap.xml.body` |
| WR-02 (`SITEMAP_TOTAL` duplicado sin sincronizar) | Explícitamente **no arreglado** — decisión documentada de dejarlo así (acoplar los gates contradice una decisión previa) | No aplica — advertencia no bloqueante, aceptada como está |

### Anti-Patterns Found

Ninguno. Búsqueda de `TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER` en los archivos tocados por los commits de la fase (`layout.tsx`, `agendar/page.tsx`, `sedes/[slug]/page.tsx`, `sitemap.xml/route.ts`, `llms-txt.ts`, `structured-data.tsx`, `check-seo.mjs`): sin resultados.

### Requirements Coverage

| Requirement | Source | Status | Evidence |
|--------------|--------|--------|----------|
| SEO-05 | 10-SUMMARY.md (ad-hoc) | ✓ SATISFIED | `BreadcrumbList` confirmado en HTML de rutas anidadas |
| SEO-06 | 10-SUMMARY.md (ad-hoc) | ✓ SATISFIED | `hasCredential` + `openingHoursSpecification` confirmados en JSON-LD |
| SEO-07 | 10-SUMMARY.md (ad-hoc) | ✓ SATISFIED | `AggregateRating`/`Review` confirmados en producción real, testimonio no verificable sin marcar |
| SEO-08 | 10-01, 10-02, 10-03 | ✓ SATISFIED | `seo:check` 23 rutas sin fallas; fix de CR-01 cierra el hueco de OG que el gate no cubría |
| SEO-09 | 10-SUMMARY.md (ad-hoc) | ✓ SATISFIED | 22-23 rutas con imagen OG propia y prerenderizada, confirmado por muestreo de `og:image` |
| SEO-10 | 10-SUMMARY.md (ad-hoc) | ✓ SATISFIED | `/llms.txt` → 200, contenido real |
| SEO-11 | 10-SUMMARY.md (ad-hoc) | ✓ SATISFIED | Portrait fuera del repo, 404 en servidor local |

Todos los 7 requisitos de la fase (SEO-05 a SEO-11) tienen evidencia de código y/o de producción. No hay requisitos huérfanos: los 7 IDs listados en "Phase requirement IDs" están cubiertos por algún plan o por `10-SUMMARY.md`.

## Human Verification Required

### 1. Vista previa de WhatsApp por ruta

**Test:** Compartir 2-3 URLs distintas del sitio (portada, una sede, una guía de servicio) por WhatsApp.
**Expected:** Cada tarjeta previa muestra imagen, título y resumen propios de esa página, no los de la portada.
**Why human:** El código ya sirve `og:title`/`og:description`/`og:url`/`og:image` correctos por ruta (verificado contra el HTML del build tras el fix de CR-01). Cómo WhatsApp cachea y renderiza la vista previa es comportamiento de un servicio externo, y URLs compartidas antes del fix podrían mostrar la versión cacheada vieja hasta que WhatsApp refresque.

### 2. Confirmación de la miga de pan en la SERP de Google

**Test:** Buscar en Google 2-3 rutas anidadas ya indexadas (una guía de servicio, una sede) y revisar el snippet.
**Expected:** El resultado de búsqueda muestra `Inicio > Servicios > Hernia discal` (o equivalente) en vez de la URL cruda.
**Why human:** El `BreadcrumbList` JSON-LD válido está confirmado en el código; que Google lo use para pintar la miga en la SERP depende de su rastreo e indexación. El propio `10-SUMMARY.md` ya registra esto como seguimiento posterior, no bloqueante — esta verificación lo mantiene visible en vez de darlo por hecho silenciosamente.

## Gaps Summary (no bloqueantes)

- **Documentación desactualizada, no código:** la tabla de trazabilidad al final de `REQUIREMENTS.md` sigue diciendo `Pending` para SEO-05, SEO-06, SEO-07, SEO-10 y SEO-11, mientras el checkbox de la sección de requisitos ya los marca `[x]` como completos y la evidencia de código confirma los 7 como cumplidos. Es una fila de trazabilidad que quedó sin actualizar cuando se cerró la corrida ad-hoc; el plan `10-03` solo corrigió las filas de SEO-08 y SEO-09 (su alcance explícito). No bloquea esta verificación porque la fuente de verdad más reciente (checkbox + evidencia de código) ya está correcta, pero conviene una edición de una línea por fila para que las dos vistas del mismo requisito no se contradigan.

---

_Verified: 2026-08-14T01:30:00Z_
_Verifier: Claude (gsd-verifier)_
