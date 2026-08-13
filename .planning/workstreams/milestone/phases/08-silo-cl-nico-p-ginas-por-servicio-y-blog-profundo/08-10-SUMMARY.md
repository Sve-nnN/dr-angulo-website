---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 10
subsystem: content
tags: [nextjs, contenido, blog, ciatica, seo-onpage]

requires:
  - phase: 08-05
    provides: modelo de secciones planas con id/level y campo h1 separado de title en BlogPost
  - phase: 08-09
    provides: ContentBody como renderizador único, con soporte de banner por id de sección
provides:
  - "/blog/5-sintomas-de-columna-que-no-debes-ignorar publica 2008 palabras sobre ciática, con las 24 secciones canónicas del paquete on-page de v1.2 y la misma URL de siempre"
  - "BlogPost.bannerAfterSectionId: los posts pueden declarar detrás de qué sección va el banner de conversión, igual que las guías de servicio"
  - "Seis enlaces de salida de la matriz de enlazado en el post, dos de ellos hacia rutas que aún no existen (/blog/artrosis, /blog/lumbalgia)"
affects: [08-12 artrosis, 08-13 lumbalgia, 08-14 verificación de enlazado, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "El módulo de contenido de cada post es dueño de sus propios enlaces de salida (outboundLinks), no hay un plan de enlazado central que los inyecte después"
    - "bannerAfterSectionId admite un id de nivel 3, que es lo que resuelve los posts cuya primera sección de nivel 2 es demasiado corta para la ventana de POS-01"

key-files:
  created: []
  modified:
    - src/content/blog/5-sintomas-de-columna-que-no-debes-ignorar.ts
    - src/content/blog/index.ts
    - src/app/blog/[slug]/page.tsx

key-decisions:
  - "El banner de conversión se ancló a `sintomas--espina-ciatica` en vez de dejarlo detrás de la primera sección: con la intro tomando los dos primeros párrafos de `que-es`, esa primera sección queda en 223 palabras y el banner caía en el 11.1 por ciento del cuerpo, fuera de la ventana de 15 a 35 que exige la puerta. Anclado a esa subsección cae en el 21.7 por ciento."
  - "`title` y `description` se dejaron intactos a propósito, tal como manda el plan: los reescribe la fase 10. Lo que sí cambió es `h1`, que ahora dice `Ciática: el dolor que baja por la pierna`. Es justo la separación que 08-05 introdujo para que las dos fases no se pisen."
  - "Los enlaces hacia `/blog/artrosis` y `/blog/lumbalgia` se escribieron aunque esas rutas todavía no existen. Los crean 08-12 y 08-13, y quien verifica que las seis resuelvan es 08-14. Recortar la matriz por orden de llegada habría dejado un enlace perdido sin registro."

requirements-completed: [BLOG-02, BLOG-03]

coverage:
  - id: D1
    description: "El post pelea ciática con más de 1700 palabras y conserva su URL"
    requirement: "BLOG-02"
    verification:
      - kind: other
        ref: "node scripts/check-content.mjs — PASA en /blog/5-sintomas-de-columna-que-no-debes-ignorar con 2008 palabras de cuerpo"
        status: pass
      - kind: other
        ref: "grep -c 'slug: \"5-sintomas-de-columna-que-no-debes-ignorar\"' devuelve 1"
        status: pass
    human_judgment: false
  - id: D2
    description: "El post sigue empujando a la guía de hernia discal y cerrando con CTA de agenda"
    requirement: "BLOG-03"
    verification:
      - kind: other
        ref: "el HTML prerenderizado contiene href=\"/servicios/hernia-discal\" y el bloque `Agendar consulta`; la puerta verifica además los dos enlaces a /agendar"
        status: pass
    human_judgment: false
  - id: D3
    description: "El texto publicado es el del paquete aprobado, sin andamiaje del generador"
    requirement: "BLOG-02"
    verification:
      - kind: other
        ref: "el HTML no contiene ninguna línea `Pendiente de aprobación`, ni los marcadores copy:inicio / copy:fin"
        status: pass
    human_judgment: true
    rationale: "Que la transcripción sea fiel párrafo por párrafo al bloque sellado del paquete es algo que se comprueba leyendo, no con una puerta. La puerta solo certifica que no quedó scaffolding y que no hay cifras, porcentajes ni primera persona."

duration: ~25min
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 10: la URL de los 5 síntomas pasa a ser la guía de ciática Summary

**La URL publicada conserva su dirección y cambia de tema por dentro: 2008 palabras sobre ciática con las 24 secciones que la SERP de Lima pide, transcritas del paquete on-page de v1.2.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-08-13
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- `/blog/5-sintomas-de-columna-que-no-debes-ignorar` deja de ser un resumen de señales de columna en general y pasa a ser la guía de ciática que la fase 14 le asignó como keyword primaria. La ruta no cambió, así que ni un enlace entrante ni una señal acumulada se pierden.
- Las 24 secciones del paquete entraron con sus `id` del dataset (`que-es`, `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes`, `cuando-consultar` en nivel 2, más 16 de nivel 3 que cubren las secundarias del mapa, las preguntas de la SERP y las búsquedas relacionadas).
- `h1` pasó a `Ciática: el dolor que baja por la pierna`. `title` y `description` quedaron como estaban, que es lo que el plan pide: los reescribe la fase 10.
- La intro tomó los dos primeros párrafos de `que-es` y esos párrafos no se repiten dentro de la sección.
- Los seis enlaces de `enlacesPropuestos` quedaron en `outboundLinks` con su `href` y su `anchor` literales.

## Task Commits

1. **Task 1: el cuerpo completo del post de ciática** — `af95ef9` (feat)

## Files Created/Modified

- `src/content/blog/5-sintomas-de-columna-que-no-debes-ignorar.ts` - Reescrito entero: intro, `h1`, 24 secciones, `outboundLinks` y el ancla del banner. `slug`, `title`, `description`, `publishedAt`, `relatedService` y `ctaBanner` se conservan.
- `src/content/blog/index.ts` - `BlogPost` gana `bannerAfterSectionId` opcional, con el mismo contrato que ya tenía `ServicePage`.
- `src/app/blog/[slug]/page.tsx` - Pasa `bannerAfterSectionId={post.bannerAfterSectionId}` a `ContentBody`, dejando `bannerAfterIndex={0}` como respaldo para los posts que no lo declaran.

## Decisions Made

- Anclar el banner a `sintomas--espina-ciatica`. Ver la sección de desviaciones: fue la respuesta a una falla real de la puerta, no una preferencia editorial.
- Escribir los seis enlaces de la matriz completos, incluidos los dos que apuntan a rutas de olas posteriores.
- No tocar `title` ni `description`, aunque la tabla del paquete mapea `title` desde el H1. El plan es explícito en que el modelo separado de 08-05 existe justamente para que la fase 10 escriba el title de buscador sin borrar el H1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Regla 3 - Bloqueo] El banner de conversión caía fuera de la ventana de POS-01**

- **Found during:** Task 1, en la primera corrida de `scripts/check-content.mjs`
- **Issue:** La puerta falló con `el banner cae en el 11.1 por ciento del cuerpo, fuera del rango de 15 a 35`. La causa es estructural: la intro se lleva los dos primeros párrafos de `que-es`, así que la primera sección de nivel 2 queda en un párrafo propio más una subsección corta, unas 223 palabras contra 2008 de cuerpo. La plantilla de blog tenía el banner clavado detrás de la primera sección (`bannerAfterIndex={0}`) y ninguna frontera de nivel 2 caía dentro de la ventana: la siguiente, después de todo el bloque de síntomas, se iba al 57 por ciento.
- **Fix:** `ContentBody` ya resolvía exactamente este caso vía `bannerAfterSectionId`, que acepta un id de nivel 3 y deja el banner dentro del `<section>` del padre. Lo usaban las guías de servicio a través de `ServicePage.bannerAfterSectionId`, pero `BlogPost` no tenía el campo equivalente y la plantilla de blog no lo pasaba. Se agregó el campo opcional al tipo, la plantilla lo reenvía, y este post lo declara en `sintomas--espina-ciatica`. El banner queda en el 21.7 por ciento. Los otros tres posts no declaran el campo y siguen con el comportamiento anterior, verificado: los cuatro conteos de palabras y los ocho PASA de la puerta son los mismos de antes.
- **Files modified:** `src/content/blog/index.ts`, `src/app/blog/[slug]/page.tsx`
- **Commit:** `af95ef9`

Esto expandió el alcance de archivos del plan de uno a tres, así que el criterio de aceptación `git diff --name-only devuelve exactamente un archivo` no se cumple tal como está escrito. La alternativa era dejar el post fuera de la puerta de contenido, que no es alternativa en una fase cuyo objetivo es justamente que estas páginas pasen esa puerta.

## Issues Encountered

Ninguno más. `npx tsc --noEmit`, `npm run lint` y `npm run build` cerraron en 0 a la primera, y la puerta de contenido pasa las ocho rutas del manifiesto.

## Known Stubs

Ninguno en código. Sí hay dos enlaces de salida hacia rutas que todavía no existen, `/blog/artrosis` y `/blog/lumbalgia`, y es deliberado: las crean 08-12 y 08-13, y 08-14 verifica que las seis rutas de la matriz resuelvan. Next no falla el build por eso y la puerta de contenido no valida resolución de enlaces internos.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Queda 08-11, el otro post que se reescribe en la ola 2. `bannerAfterSectionId` está disponible para cualquier post que repita este patrón de primera sección corta, que es probable en todos los que toman la intro de `que-es`. La fase 10 tiene el terreno limpio para escribir `title` y `description` sin pisar el `h1`.

## Self-Check: PASSED

- `src/content/blog/5-sintomas-de-columna-que-no-debes-ignorar.ts` - FOUND
- `src/content/blog/index.ts` - FOUND
- `src/app/blog/[slug]/page.tsx` - FOUND
- commit `af95ef9` - FOUND

---
*Phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo*
*Completed: 2026-08-13*
