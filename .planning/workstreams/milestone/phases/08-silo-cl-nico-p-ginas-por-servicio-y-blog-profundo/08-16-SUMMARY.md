---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 16
subsystem: contenido
tags: [silo-clinico, servicios, hub, on-page, puertas]
requires:
  - src/components/content/content-body.tsx
  - src/content/static-pages/types.ts
  - seo-tools/data/copy-servicios.json
provides:
  - /servicios/cirugia-minimamente-invasiva
  - src/content/static-pages/hub-servicios.ts
affects:
  - /servicios
  - sitemap.xml
  - llms.txt
tech-stack:
  added: []
  patterns:
    - transcripción literal desde el dataset sellado, no desde el Markdown del paquete
    - cuerpo largo renderizado con ContentBody en su tercera superficie
key-files:
  created:
    - src/content/service-pages/cirugia-minimamente-invasiva.ts
    - src/content/static-pages/hub-servicios.ts
  modified:
    - src/content/service-pages/index.ts
    - src/app/servicios/page.tsx
    - scripts/check-content.mjs
    - scripts/check-sedes.mjs
    - scripts/check-seo.mjs
decisions:
  - el banner de la página nueva se ancla a una subsección de nivel 3 porque ninguna frontera de nivel 2 cae en la ventana de POS-01
  - el cuerpo del hub va entre la rejilla de tarjetas y el catálogo heredado
  - el h1 del hub pasa al valor del dataset; title y meta quedan para la fase 10
metrics:
  duration: 1h
  completed: 2026-08-13
status: complete
---

# Phase 8 Plan 16: la quinta página del silo y el cuerpo del hub

Cierra el silo clínico: entra `/servicios/cirugia-minimamente-invasiva` con las 18 secciones
del paquete aprobado y el hub `/servicios` publica sus 1191 palabras de copy sin perder
ninguna de las anclas que el inicio ya enlazaba.

## Qué se hizo

**Task 1 — la página nueva.** `src/content/service-pages/cirugia-minimamente-invasiva.ts`
transcribe el objeto `/servicios/cirugia-minimamente-invasiva` de
`seo-tools/data/copy-servicios.json`: 18 secciones, 5 de nivel 2 y 13 de nivel 3, con los
`id` tomados del campo `clave` y los párrafos literales. `title`, `description` y `h1` salen
del mismo objeto. `heroLead`, `cardSummary` y `ctaBanner` se recortaron de frases del cuerpo
aprobado, sin reescribirlas: `cardSummary` mide 86 caracteres. Los 8 `enlacesPropuestos`
pasaron a `outboundLinks` con href y anchor literales. El módulo se sumó al final de
`servicePages`, así que la ruta entró sola al sitemap, al hub, a `/llms.txt` y a su imagen de
Open Graph. Prerenderiza con 1794 palabras de cuerpo medido por la puerta.

**Task 2 — el cuerpo del hub.** `src/content/static-pages/hub-servicios.ts` sigue la forma de
`home.ts` con las 16 secciones y los 8 enlaces del paquete, más el `h1` del dataset exportado
aparte. `src/app/servicios/page.tsx` lo renderiza con `ContentBody` y `ContentBodyBoundary`,
sin volver a escribir el recorrido de secciones ni la regla de anclas y foco. El cuerpo se
sumó entre la rejilla de tarjetas y el catálogo heredado, y el HTML prerenderizado conserva
los cuatro `id` de v1.0 (`columna`, `traumatologia`, `ortopedia-infantil`, `procedimientos`)
con un solo `h1`.

**Task 3 — el conteo.** `SITEMAP_TOTAL` sube de 21 a 22 en `check-content.mjs`,
`check-sedes.mjs` y `check-seo.mjs`, en el mismo commit, y cada comentario deja escrita la
cuenta de la que sale el número. La ruta nueva entró al `MANIFEST` de `check-content.mjs` con
formato de servicio.

## Deviations from Plan

**1. [Rule 1 - Dato] El dataset trae más secciones que las que declaraba el plan**
- **Found during:** Tasks 1 y 2
- **Issue:** el plan hablaba de 17 secciones para la página nueva (5 + 12) y de 15 para el hub
  (5 + 10). El objeto del dataset sellado trae 18 (5 + 13) y 16 (5 + 11).
- **Fix:** se transcribió lo que dice la fuente. El protocolo manda sobre el conteo escrito en
  la prosa del plan, y recortar una subsección para cuadrar un número habría borrado copy
  aprobado.
- **Files modified:** `src/content/service-pages/cirugia-minimamente-invasiva.ts`,
  `src/content/static-pages/hub-servicios.ts`
- **Commits:** beb02b6, b219ec4

**2. [Rule 3 - Orden] El manifiesto de la ruta nueva se movió con el conteo**
- **Found during:** Task 1
- **Issue:** la verificación de la Task 1 corría `check-content.mjs` sobre una ruta que todavía
  no estaba en el `MANIFEST`, porque el plan pone esa línea en la Task 3.
- **Fix:** la verificación de la Task 1 se corrió con una copia del script en el scratchpad, con
  la entrada agregada, y la entrada real se sumó en el commit de la Task 3 junto con las tres
  constantes. Ningún commit quedó con una puerta a medio mover.
- **Commits:** beb02b6, 487549e

## Decisiones

- **Banner en una subsección de nivel 3.** `que-se-atiende` cuelga siete subsecciones: la
  primera frontera de nivel 2 cae en el 7 por ciento del cuerpo y la siguiente ya pasa del 45.
  `bannerAfterSectionId` apunta a `que-se-atiende--endoscopia-espinal`, y la puerta confirma la
  posición sobre el HTML real.
- **Dónde cae el cuerpo del hub.** Después de la rejilla y antes del catálogo heredado: la
  rejilla es la razón de ser de la página y no se entierra bajo mil palabras.
- **`describesSurgery: true`.** La página describe la cirugía de punta a punta.

## Puertas

| Puerta | Resultado |
|--------|-----------|
| `npx tsc --noEmit` | limpio |
| `npm run lint` | limpio |
| `npm run build` | 22 rutas prerenderizadas |
| `node scripts/check-content.mjs` | sin fallas en 9 rutas |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| `node scripts/check-seo.mjs` | sin fallas, 23 rutas con Open Graph propio |

Sobre precio no se publicó ninguna cifra: la salvaguarda de soles y porcentaje de la puerta
corre sobre el cuerpo de las dos superficies nuevas y pasó.

## Verificación humana pendiente

El hub es de las páginas de más tráfico del sitio y ahora suma mil palabras de prosa. Que el
cuerpo nuevo no entierre la rejilla de tarjetas ni descoloque el catálogo heredado se confirma
mirándolo a 375px y a 1440px. Queda para la ronda de verificación de la fase.

## Qué falta en la fase

- 08-12 y 08-13: los dos posts nuevos de blog, que suben el conteo a 23 y a 24.
- 08-14: redirecciones y cierre del sitemap, que lo devuelve a 22.
- 08-17, 08-18 y 08-19: sedes y preguntas frecuentes.

## Self-Check: PASSED
