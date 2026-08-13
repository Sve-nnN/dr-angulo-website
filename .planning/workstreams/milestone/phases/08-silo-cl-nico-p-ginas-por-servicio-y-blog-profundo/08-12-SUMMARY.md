---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 12
subsystem: contenido-blog
tags: [contenido-clinico, blog, url-nueva, transcripcion, enlazado-interno, sitemap]

requires:
  - phase: 08-05
    provides: BlogPost con h1 propio, relatedService opcional y outboundLinks
  - phase: 08-16
    provides: SITEMAP_TOTAL en 22 y la página de cirugía mínimamente invasiva
provides:
  - "/blog/artrosis publicado con el copy aprobado del paquete v1.2"
  - "El primer post del sitio que sale al silo por el hub /servicios en vez de por una guía"
  - "SITEMAP_TOTAL en 23 en las tres puertas y /blog/artrosis en el MANIFEST sin linksTo"
affects: [08-13, 08-14, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "El módulo se serializa desde seo-tools/data/copy-blog.json con un script de una pasada, no se copia a mano: 20 bloques de prosa clínica firmada no admiten drift de transcripción"
    - "bannerAfterSectionId apunta a un id de nivel 3 cuando ninguna frontera de nivel 2 cae dentro de la ventana de POS-01"

key-files:
  created:
    - src/content/blog/artrosis.ts
  modified:
    - src/content/blog/index.ts
    - scripts/check-content.mjs
    - scripts/check-sedes.mjs
    - scripts/check-seo.mjs

key-decisions:
  - "El post no declara relatedService y sale al silo por el hub /servicios, que es el destino que la matriz de la fase 14 sí le asigna"
  - "intro queda vacío: el paquete no redacta una entrada aparte y escribir una habría publicado prosa clínica sin aprobación"
  - "El banner cae detrás de una sección de nivel 3 porque ninguna frontera de nivel 2 cae entre el 15% y el 35% del cuerpo"

requirements-completed: [BLOG-02, BLOG-03]

coverage:
  - id: D1
    description: "/blog/artrosis existe, prerenderiza y publica el copy aprobado con el esqueleto canónico"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: ".next/server/app/blog/artrosis.html con 1989 palabras de cuerpo, 8 h2 de sección y 12 h3; check-content.mjs PASA sobre la ruta"
        status: pass
    human_judgment: false
  - id: D2
    description: "La ruta entra al sitemap, al listado del blog y a su imagen de Open Graph sin tocar ninguno de esos archivos"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "sitemap.xml.body declara la URL, blog.html la lista y existe blog/artrosis/opengraph-image; el único archivo tocado es src/content/blog/index.ts"
        status: pass
    human_judgment: false
  - id: D3
    description: "El post no declara guía de destino y el marcado de artículo no emite about"
    requirement: BLOG-03
    verification:
      - kind: integration
        ref: "sin relatedService en el módulo; /\"about\"/ ausente del HTML; href=\"/servicios\" presente en el artículo"
        status: pass
    human_judgment: false
  - id: D4
    description: "El conteo de URLs quedó sincronizado en las tres puertas"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "SITEMAP_TOTAL = 23 en check-content.mjs, check-sedes.mjs y check-seo.mjs; las tres corren en verde con el sitemap en 23 entradas"
        status: pass
    human_judgment: false
  - id: D5
    description: "El texto publicado es el del dataset aprobado, sin sellos de revisión ni paráfrasis"
    verification:
      - kind: integration
        ref: "el módulo se serializó desde copy-blog.json en una pasada; grep de \"Pendiente de aprobación\" devuelve 0"
        status: pass
    human_judgment: true
    rationale: "Que el texto sea idéntico al dataset es mecánico y está verificado. Que el dataset sea lo que el doctor aprobó descansa en 15-APROBACION-DOCTOR.md, y eso es juicio humano ya emitido fuera de este plan"

duration: 22min
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 12: El post de artrosis Summary

**`/blog/artrosis` se publica con las 20 secciones del paquete v1.2 transcritas literal, es el primer post del sitio que sale al silo por el hub `/servicios` en vez de por una guía concreta, y el conteo de URLs subió a 23 en las tres puertas que lo declaran por separado.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 22 min |
| Tareas | 2 de 2 |
| Commits | 2 |
| Archivos creados | 1 |
| Archivos modificados | 4 |

## Qué se construyó

El post no expande nada. Es una URL nueva que el mapa de keywords de v1.2 creó porque `artrosis` es una cabeza con SERP medida en Lima y ninguna página del sitio podía ganarla.

El módulo declara 20 secciones: las 8 de nivel 2 del esqueleto canónico (`que-es`, `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes`, `cuando-consultar`) y 12 de nivel 3 que cuelgan de ellas. El cuerpo renderizado mide 1989 palabras.

`relatedService` no se declara. La matriz de enlazado de la fase 14 no le da a esta URL ninguna mención inversa hacia una guía, porque la artrosis es una enfermedad articular general y ninguna de las cinco guías la cubre entera. Su salida al silo son las 5 entradas de `enlacesPropuestos`: tres de vecindad temática hacia otros posts y dos de navegación, hacia el blog y hacia el hub. La entrada del `MANIFEST` va sin `linksTo`, que es lo que habilita a la puerta a no exigirle el enlace hacia una guía.

`intro` queda vacío y el primer nivel 2 abre la página.

## Decisiones

**La transcripción la hizo un script de una pasada.** El módulo se serializa desde `seo-tools/data/copy-blog.json` leyendo `clave`, `titulo`, `nivel` y `parrafos` de cada sección. Con 20 bloques de prosa clínica que se publica firmada, copiar a mano es la vía más directa a un cambio de texto que nadie nota.

**El banner cae detrás de una sección de nivel 3.** La ventana de POS-01 pide que el banner quede entre el 15% y el 35% del cuerpo, y en este post ninguna frontera de nivel 2 cae ahí dentro: `que-es` cierra en el 7.5% y `sintomas` en el 41.9%, porque `que-es` arrastra seis subsecciones. `bannerAfterSectionId` apunta a `que-es--artrosis-de-rodilla`, en el 26.9%. El campo admite un id de nivel 3 justamente para esto, y el plan 08-05 lo dejó documentado así.

**El bloque de pastillas y el de vitaminas se transcriben sin tocar.** El paquete responde a esas búsquedas sin nombrar principio activo ni dosis. Esa contención es deliberada y no se recorta ni se amplía.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run lint` | sin avisos |
| `npm run build` | verde |
| `node scripts/check-content.mjs` | sin fallas en 10 rutas, `/blog/artrosis` con 1989 palabras |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| `node scripts/check-seo.mjs` | sin fallas, 24 rutas con imagen de Open Graph propia |
| Sitemap | `/blog/artrosis` declarado, 23 entradas |
| Listado del blog | el post aparece en `blog.html` |
| `about` en el JSON-LD del artículo | ausente |
| `href="/servicios"` en el artículo | presente |
| `grep -c "Pendiente de aprobación" src/content/blog/artrosis.ts` | 0 |

## Desviaciones del plan

**1. [Regla 1 - Bug] El plan pedía 19 secciones y el dataset tiene 20**

- **Encontrado en:** Task 1, al contar las secciones antes de serializar
- **Problema:** el plan dice "19 secciones, 8 de nivel 2 y 11 de nivel 3". El objeto de `/blog/artrosis` en `copy-blog.json` declara 20: las 8 de nivel 2 y 12 de nivel 3. La de más es `que-es--artrosis-mano`, que el conteo del plan se saltó.
- **Arreglo:** manda el protocolo de transcripción, que es literal sobre el dataset. Se transcriben las 20. Descartar una sección aprobada para cuadrar un número del plan habría borrado copy que el doctor revisó.
- **Archivos:** `src/content/blog/artrosis.ts`
- **Commit:** b5b2e9c

**2. [Regla 3 - Bloqueo] La entrada del MANIFEST se movió a la Task 2**

- **Problema:** el verify de la Task 1 corre `check-content.mjs /blog/artrosis`, y la puerta rechaza cualquier ruta que no esté en el `MANIFEST`. Esa línea pertenece a `scripts/check-content.mjs`, que es archivo de la Task 2.
- **Arreglo:** la Task 1 se verificó contra el HTML prerenderizado (palabras de cuerpo, conteo de h2 y h3, ausencia de `about`, presencia del enlace al hub, sitemap y listado) y la puerta corrió en verde sobre la ruta ya dentro de la Task 2, junto con la corrida completa. Ningún commit quedó rojo.
- **Archivos:** `scripts/check-content.mjs`

**3. [Regla 2] `ctaBanner` salió del dataset y no de una composición a mano**

- **Problema:** el plan pedía armar el banner con frases recortadas del cuerpo aprobado. El propio objeto del dataset ya trae las dos frases en `mapeoDePost`, bajo `ctaBanner.heading` y `ctaBanner.body`.
- **Arreglo:** se usan esas dos, literales. Componer una versión propia habría sido microcopy sin revisión existiendo una revisada.
- **Archivos:** `src/content/blog/artrosis.ts`

## Enlace de salida hacia una URL que todavía no existe

`outboundLinks` declara `/blog/lumbalgia`, que el plan 08-13 crea. Hasta que ese plan corra, ese enlace apunta a un 404. Es la transcripción literal de `enlacesPropuestos` y ninguna puerta lo marca, porque ninguna valida que el destino de un enlace de salida esté publicado. Se cierra solo cuando 08-13 termine.

## Self-Check: PASSED

`src/content/blog/artrosis.ts` existe en disco y los dos commits (`b5b2e9c`, `679ea51`) están en `git log`.
