---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 11
subsystem: content
tags: [nextjs, contenido, blog, cirugia-de-columna, seo-onpage, ymyl]

requires:
  - phase: 08-05
    provides: modelo de secciones planas con id/level y campo h1 separado de title en BlogPost
  - phase: 08-10
    provides: BlogPost.bannerAfterSectionId, el campo que resuelve el anclaje del banner en posts con primera seccion corta
provides:
  - "/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber publica 1747 palabras sobre cirugia de columna, con las 20 secciones canonicas del paquete on-page de v1.2 y la misma URL de siempre"
  - "Seis enlaces de salida de la matriz de enlazado, tres de ellos hacia rutas que aun no existen (/servicios/cirugia-minimamente-invasiva, /blog/artrosis, /blog/lumbalgia)"
affects: [08-12 artrosis, 08-13 lumbalgia, 08-14 verificacion de enlazado, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "bannerAfterSectionId vuelve a ser la pieza que salva la ventana de POS-01 en un post cuya primera seccion de nivel 2 arrastra siete subsecciones: el patron que 08-10 introdujo ya se reusa sin tocar codigo"

key-files:
  created: []
  modified:
    - src/content/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber.ts

key-decisions:
  - "relatedService se dejo en hernia-discal, no en cirugia-minimamente-invasiva. La tabla del paquete de v1.2 pide el cambio, pero el plan 08-11 y el CONTEXT de la fase son explicitos en conservarlo, y la guia de cirugia minimamente invasiva todavia no existe como ruta: apuntar relatedService a un slug que no esta en ServicePage no compila. El destino que el paquete queria no se pierde, entra como el primer enlace de outboundLinks."
  - "title y description quedaron intactos, igual que en 08-10: los reescribe la fase 10. Lo que cambio es h1, que ahora dice `Operarse de la columna: lo que conviene saber antes`, el valor exacto de la tabla del paquete."
  - "El banner se anclo a `que-es--caminar-despues-de-cirugia-de-columna`. Con el banner por defecto detras de la primera seccion de nivel 2 caia en el 35.8 por ciento, apenas fuera del rango de 15 a 35 que exige la puerta, porque `que-es` arrastra siete subsecciones."

requirements-completed: [BLOG-02, BLOG-03]

coverage:
  - id: D1
    description: "El post pelea cirugia de columna con mas de 1400 palabras y conserva su URL"
    requirement: "BLOG-02"
    verification:
      - kind: other
        ref: "node scripts/check-content.mjs — PASA en /blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber con 1747 palabras de cuerpo"
        status: pass
      - kind: other
        ref: "el slug no se toco: git diff no muestra ningun cambio en la linea slug"
        status: pass
    human_judgment: false
  - id: D2
    description: "El post sigue empujando a la guia de hernia discal y cerrando con CTA de agenda"
    requirement: "BLOG-03"
    verification:
      - kind: other
        ref: "el HTML prerenderizado contiene href=\"/servicios/hernia-discal\" y el bloque de agenda; la puerta verifica ademas los enlaces a /agendar"
        status: pass
    human_judgment: false
  - id: D3
    description: "Ninguna promesa de resultado, ninguna cifra sin fuente, ningun andamiaje del generador"
    requirement: "BLOG-02"
    verification:
      - kind: other
        ref: "el HTML no contiene ninguna linea `Pendiente de aprobacion` ni los marcadores copy:inicio / copy:fin; la puerta no reporta porcentaje, cifra en soles, plazo garantizado ni primera persona"
        status: pass
    human_judgment: true
    rationale: "Que la transcripcion sea fiel parrafo por parrafo al bloque sellado se comprueba leyendo. En este post pesa mas que en los otros tres, porque es el que habla de operarse: el texto publicado no trae una sola cifra, y las dos secciones que la SERP pedia con numero (precio y costo) contestan explicando de que depende, tal como las escribio el paquete."

duration: ~20min
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 11: la URL del miedo a operarse pasa a ser la guia de cirugia de columna Summary

**El post mas emocional del blog conserva su direccion y cambia de tema por dentro: 1747 palabras sobre cirugia de columna, transcritas literal del paquete on-page de v1.2, sin una sola promesa de resultado.**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-08-13
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` deja de ser un texto de cinco puntos tranquilizadores y pasa a responder la consulta `cirugia de columna`, que es una de las de mayor intencion del silo. La ruta no cambio.
- Las 20 secciones del paquete entraron con sus `id` del dataset: `que-es`, `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes` y `cuando-consultar` en nivel 2, mas 12 de nivel 3 que cubren las secundarias del mapa, las cuatro preguntas de la SERP de Lima y las busquedas relacionadas.
- La intro tomo los dos primeros parrafos de `que-es` y esos parrafos no se repiten dentro de la seccion.
- Los seis enlaces de `enlacesPropuestos` quedaron en `outboundLinks` con su `href` y su `anchor` literales.
- El post cierra derivando a la guia de cirugia endoscopica y de abordajes minimamente invasivos, que es donde el paquete puso el detalle tecnico del procedimiento.

## Task Commits

1. **Tarea 1: el cuerpo completo del post de cirugia de columna** — `c86df87` (feat)

## Files Created/Modified

- `src/content/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber.ts` - Reescrito entero: intro, `h1`, 20 secciones, `outboundLinks` y el ancla del banner. `slug`, `title`, `description`, `publishedAt`, `relatedService` y `ctaBanner` se conservan.

## Decisions Made

- Conservar `relatedService: "hernia-discal"` pese a que la tabla del paquete pide `cirugia-minimamente-invasiva`. Ver la seccion de desviaciones.
- Anclar el banner a `que-es--caminar-despues-de-cirugia-de-columna`, por la ventana de POS-01. Ver desviaciones.
- No tocar `title` ni `description`. La fase 10 los escribe.
- Escribir los seis enlaces completos, incluidos los tres que apuntan a rutas que todavia no existen.

## Deviations from Plan

### Auto-fixed Issues

**1. [Regla 3 - Bloqueo] El banner de conversion caia fuera de la ventana de POS-01**

- **Found during:** Tarea 1, primera corrida de `scripts/check-content.mjs`
- **Issue:** La puerta fallo con `el banner cae en el 35.8 por ciento del cuerpo, fuera del rango de 15 a 35`. La causa es la forma del esqueleto: `que-es` es la unica seccion de nivel 2 con subsecciones en la primera mitad del post, y arrastra siete, asi que la frontera de nivel 2 siguiente se va mas alla del tercio.
- **Fix:** Se declaro `bannerAfterSectionId: "que-es--caminar-despues-de-cirugia-de-columna"`, el campo que 08-10 agrego a `BlogPost` para exactamente este caso. No hizo falta tocar ni el tipo ni la plantilla: el patron ya estaba disponible. El banner queda dentro del rango y las ocho rutas del manifiesto siguen pasando.
- **Files modified:** `src/content/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber.ts`
- **Commit:** `c86df87`

### Divergencia deliberada respecto del paquete

La tabla "Como entra este copy en la estructura de post" mapea `relatedService` a `cirugia-minimamente-invasiva` y anota que cambia respecto de lo publicado. No se aplico, por dos razones que apuntan al mismo lado. La primera es que el plan 08-11 lo instruye al reves, en el texto de la accion y en `key_links`, y el CONTEXT de la fase fijo `hernia-discal` a proposito. La segunda es dura: `relatedService` esta tipado como `ServicePage["slug"]` y hoy solo existen cuatro guias, entre las que no esta la de cirugia minimamente invasiva. Apuntar ahi no compila. El destino que el paquete queria no se perdio: entra como el primer enlace de `outboundLinks`, con el anchor `cirugia endoscopica de columna`, y el copy de cierre lo menciona por su nombre.

## Issues Encountered

Ninguno mas. `npx tsc --noEmit`, `npm run lint` y `npm run build` cerraron en 0, y la puerta de contenido pasa las ocho rutas del manifiesto.

## Known Stubs

Ninguno en codigo. Si hay tres enlaces de salida hacia rutas que todavia no existen: `/servicios/cirugia-minimamente-invasiva`, `/blog/artrosis` y `/blog/lumbalgia`. Es deliberado y sigue el criterio que fijo 08-10: la matriz de enlazado se escribe completa y 08-14 verifica que las seis resuelvan cuando ya esten vivas todas las URLs de la fase. Next no falla el build por eso.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Cierra la ola 2. Los cuatro posts del blog ya publican el copy aprobado de v1.2 con su esqueleto de guia clinica, y `bannerAfterSectionId` quedo probado en dos formas distintas de post. La ola 3 arranca con 08-15 (escoliosis) sobre las guias de servicio, y hereda tres cosas: el patron de transcripcion desde `seo-tools/data/copy-*.json` en vez del Markdown del paquete, el criterio de escribir la matriz de enlazado completa aunque falten rutas, y la separacion `h1` / `title` que le deja el terreno limpio a la fase 10.

## Self-Check: PASSED

- `src/content/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber.ts` - FOUND
- commit `c86df87` - FOUND

---
*Phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo*
*Completed: 2026-08-13*
