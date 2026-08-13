---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 13
subsystem: contenido-blog
tags: [contenido-clinico, blog, url-nueva, transcripcion, enlazado-interno, sitemap]

requires:
  - phase: 08-05
    provides: BlogPost con h1 propio, relatedService opcional y outboundLinks
  - phase: 08-12
    provides: SITEMAP_TOTAL en 23, el molde de post nuevo y /blog/artrosis publicado
provides:
  - "/blog/lumbalgia publicado con el copy aprobado del paquete v1.2"
  - "La segunda mención inversa hacia /servicios/hernia-discal, con el anchor de la matriz"
  - "SITEMAP_TOTAL en 24 en las tres puertas y /blog/lumbalgia en el MANIFEST con linksTo"
affects: [08-14, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "El módulo se serializa desde seo-tools/data/copy-blog.json con un script de una pasada, igual que artrosis: prosa clínica firmada no admite drift de transcripción"
    - "El enlace hacia la guía sale de outboundLinks con el anchor literal de la matriz, no de la frase que la plantilla arma desde conditionName"

key-files:
  created:
    - src/content/blog/lumbalgia.ts
  modified:
    - src/content/blog/index.ts
    - scripts/check-content.mjs
    - scripts/check-sedes.mjs
    - scripts/check-seo.mjs

key-decisions:
  - "relatedService va en hernia-discal, que es lo que declara derivaA: esta URL sí tiene mención inversa medida, a diferencia de artrosis"
  - "Se transcriben las 19 secciones del dataset y no las 15 que contaba el plan: el protocolo de transcripción manda sobre el conteo"
  - "intro queda vacío por la misma razón que en artrosis: el paquete no redacta una entrada aparte"
  - "El banner cae detrás de sintomas, la única frontera de nivel 2 que cae dentro de la ventana de POS-01"

requirements-completed: [BLOG-02, BLOG-03]

coverage:
  - id: D1
    description: "/blog/lumbalgia existe, prerenderiza y publica el copy aprobado con el esqueleto canónico"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "check-content.mjs PASA sobre la ruta con 1737 palabras de cuerpo; 8 secciones de nivel 2 y 11 de nivel 3"
        status: pass
    human_judgment: false
  - id: D2
    description: "El post empuja hacia /servicios/hernia-discal con el anchor exacto de la matriz"
    requirement: BLOG-03
    verification:
      - kind: integration
        ref: "el HTML enlaza a /servicios/hernia-discal con el texto `hernia discal lumbosacra tratamiento`; la puerta exige ese linksTo desde el MANIFEST"
        status: pass
    human_judgment: false
  - id: D3
    description: "La ruta entra al sitemap, al listado del blog y a su imagen de Open Graph sin tocar ninguno de esos archivos"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "sitemap.xml.body declara la URL con 24 entradas, blog.html la lista y existe blog/lumbalgia/opengraph-image; el único archivo tocado es src/content/blog/index.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: "El conteo de URLs quedó sincronizado en las tres puertas"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "SITEMAP_TOTAL = 24 en check-content.mjs, check-sedes.mjs y check-seo.mjs; las tres corren en verde"
        status: pass
    human_judgment: false
  - id: D5
    description: "El texto publicado es el del dataset aprobado, sin sellos de revisión ni paráfrasis"
    verification:
      - kind: integration
        ref: "el módulo se serializó desde copy-blog.json en una pasada; grep de \"Pendiente de aprobación\" devuelve 0"
        status: pass
    human_judgment: true
    rationale: "Que el texto sea idéntico al dataset es mecánico y está verificado. Que el dataset sea lo que el doctor aprobó descansa en 15-APROBACION-DOCTOR.md, fuera de este plan"

duration: 18min
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 13: El post de lumbalgia Summary

**`/blog/lumbalgia` se publica con las 19 secciones del paquete v1.2 transcritas literal, es el segundo post que empuja al silo con una mención inversa medida hacia la guía de hernia discal, y el conteo de URLs llegó a 24 en las tres puertas, que es el máximo de la fase.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 18 min |
| Tareas | 2 de 2 |
| Commits | 2 |
| Archivos creados | 1 |
| Archivos modificados | 4 |

## Qué se construyó

El post es una URL nueva. `lumbalgia` es una cabeza con SERP medida en Lima y lo único que la rozaba en el sitio era la guía de hernia discal, que la usaba como término de contraste.

El módulo declara 19 secciones: las 8 de nivel 2 del esqueleto canónico (`que-es`, `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes`, `cuando-consultar`) y 11 de nivel 3. El dataset trae 1532 palabras de copy y el cuerpo renderizado mide 1737 según la puerta.

`relatedService` va en `hernia-discal`. A diferencia de artrosis, esta URL sí tiene mención inversa asignada por la matriz, y el enlace de salida usa el anchor literal `hernia discal lumbosacra tratamiento` en vez de la frase que la plantilla arma desde `conditionName`. Las otras cinco entradas de `outboundLinks` son tres de vecindad temática y dos de navegación. Las seis rutas resuelven en el build, incluida `/blog/artrosis`, que el plan 08-12 dejó publicada.

`intro` queda vacío y el primer nivel 2 abre la página.

## Decisiones

**El banner cae detrás de `sintomas`.** La ventana de POS-01 pide el banner entre el 15% y el 35% del cuerpo. `que-es` cierra en el 7.3% y `sintomas` en el 28.3%, así que acá sí hay una frontera de nivel 2 dentro de la ventana y no hizo falta apoyarse en un id de nivel 3 como en artrosis.

**La sección de cirugía se transcribe sin suavizar.** El paquete dice sin ambigüedad que la lumbalgia común rara vez se opera. Retocar esa redacción para que la página pareciera más quirúrgica habría sido exactamente el sesgo que el registro de amenazas marca como T-08-30.

**El `title` sale del campo `title` del dataset y el `h1` del campo `h1`.** El mapeo del paquete describe `title` como el nombre del post dentro del sitio, pero el modelo de datos que dejó el plan 08-05 documenta ese campo como título de buscador y le dio a `h1` un campo propio. Se respeta el modelo, igual que hizo el plan 08-12.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run lint` | sin avisos |
| `npm run build` | verde |
| `node scripts/check-content.mjs` | sin fallas en 11 rutas, `/blog/lumbalgia` con 1737 palabras |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| `node scripts/check-seo.mjs` | sin fallas, 25 rutas con imagen de Open Graph propia |
| Sitemap | `/blog/lumbalgia` declarado, 24 entradas |
| Listado del blog | el post aparece en `blog.html` |
| Anchor de la matriz en el HTML | `hernia discal lumbosacra tratamiento` presente |
| `grep -c "Pendiente de aprobación" src/content/blog/lumbalgia.ts` | 0 |

## Desviaciones del plan

**1. [Regla 1 - Bug] El plan pedía 15 secciones y el dataset tiene 19**

- **Encontrado en:** Task 1, al contar las secciones antes de serializar
- **Problema:** el plan dice "15 secciones, 8 de nivel 2 y 7 de nivel 3". El objeto de `/blog/lumbalgia` en `copy-blog.json` declara 19: las 8 de nivel 2 y 11 de nivel 3.
- **Arreglo:** manda el protocolo de transcripción, que es literal sobre el dataset. Se transcriben las 19. Descartar cuatro secciones aprobadas para cuadrar un número del plan habría borrado copy revisado, y además el post no habría llegado a las 1532 palabras que el propio plan declara como objetivo.
- **Archivos:** `src/content/blog/lumbalgia.ts`
- **Commit:** d7b82b0

**2. [Regla 3 - Bloqueo] `scripts/check-seo.mjs` no estaba en los `<files>` de la Task 2**

- **Problema:** el bloque `<files>` de la Task 2 lista solo `check-content.mjs` y `check-sedes.mjs`, pero su acción, su criterio de aceptación y el frontmatter del plan piden mover la constante en las tres puertas.
- **Arreglo:** se movió también en `check-seo.mjs`, en el mismo commit. Dejarla en 23 habría puesto la tercera puerta en rojo.
- **Archivos:** `scripts/check-seo.mjs`
- **Commit:** eae40d5

**3. [Regla 2] `ctaBanner` salió del dataset y no de una composición a mano**

- **Problema:** el plan pedía armar el banner recortando frases del cuerpo aprobado. El objeto del dataset ya trae las dos frases en `mapeoDePost`, bajo `ctaBanner.heading` y `ctaBanner.body`.
- **Arreglo:** se usan esas dos, literales, igual que en el plan 08-12.
- **Archivos:** `src/content/blog/lumbalgia.ts`

## Enlace pendiente que este plan cierra

El plan 08-12 dejó `/blog/lumbalgia` declarado en los `outboundLinks` de artrosis apuntando a un 404. Con este plan esa ruta existe y el enlace resuelve.

## Self-Check: PASSED

`src/content/blog/lumbalgia.ts` existe en disco y los dos commits (`d7b82b0`, `eae40d5`) están en `git log`.
