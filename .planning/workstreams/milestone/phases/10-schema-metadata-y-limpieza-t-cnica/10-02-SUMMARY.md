---
phase: 10-schema-metadata-y-limpieza-t-cnica
plan: 02
subsystem: seo-metadata
tags: [seo, metadata, open-graph, contenido-dinamico]
requires:
  - paquete on-page v1.2 (15-HANDOFF-V11-ONPAGE.md, seccion 2)
  - fase 8 completa, que es la que creo y renombro las entradas de contenido
provides:
  - title y meta description finales de las 13 rutas dinamicas vivas
  - tarjetas de Open Graph de esas rutas regeneradas con el title del paquete
affects:
  - src/content/location-pages/, src/content/service-pages/, src/content/blog/
  - generateMetadata de los tres segmentos [slug]
  - scripts/check-sedes.mjs, que verifica el title servido de las 4 sedes
tech-stack:
  added: []
  patterns:
    - "title: { absolute } tambien en generateMetadata de las rutas dinamicas, igual que en las rutas base del plan 10-01"
key-files:
  created: []
  modified:
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
decisions:
  - "El plan nombraba tres modulos planos (service-pages.ts, location-pages.ts, blog.ts) que la fase 8 ya habia partido en carpetas por entrada. Se edito la carpeta equivalente, una entrada por archivo, sin volver a juntarlas."
  - "artrosis y lumbalgia no se tocaron: la fase 8 las creo copiando el mismo paquete y su title y su meta ya coincidian caracter por caracter con el handoff."
  - "cardSummary de las guias y heroLead de las sedes quedaron intactos. Se parecen a una meta pero alimentan la tarjeta del hub y el encabezado, y tienen otro contrato."
metrics:
  duration: ~35 min
  completed: 2026-08-13
status: complete
---

# Phase 10 Plan 02: Title y meta del paquete v1.2 en las rutas dinamicas

Las 13 rutas que sacan su metadata de `src/content/` sirven ahora el title y la meta description
exactos del paquete on-page aprobado, dentro de 60 y 155 caracteres, y sus tarjetas de Open Graph
se regeneraron solas con el title nuevo.

## Tarea 1: el cruce entre el paquete y las rutas vivas

La precondicion se cumplio. `src/content/service-pages/` trae `escoliosis-y-deformidades` y
`cirugia-minimamente-invasiva`, `src/content/blog/` trae `artrosis` y `lumbalgia`, y ni
`estenosis-espinal-que-es` ni `hernia-discal-o-dolor-de-espalda-como-diferenciarlos` existen ya
como entrada: viven solo como redireccion 301 en `next.config.ts`, sin title ni meta propios.

El cruce dio limpio en las dos direcciones:

| Resultado | Cuantas | Detalle |
| --- | --- | --- |
| Fila del paquete con entrada viva | 13 | 4 sedes, 5 guias de servicio, 4 posts del blog |
| Fila del paquete sin entrada viva | 0 | nada que reportarle a la fase 8 |
| Entrada viva sin fila del paquete | 0 | nada que decidir |

La tarea es una verificacion, no una edicion, asi que no dejo commit propio.

## Tarea 2: el par title/meta de cada entrada

Se reemplazaron dos cadenas por entrada, copiadas literales de la seccion 2 del handoff. Diez
entradas cambiaron; `artrosis` y `lumbalgia` ya traian el texto correcto de la fase 8, y el title y
la meta de `cirugia-minimamente-invasiva` tambien, asi que se dejaron como estaban.

## Longitudes servidas, medidas sobre el HTML del build

| Ruta | Title | Car. | Meta |
| --- | --- | --- | --- |
| `/servicios/hernia-discal` | Hernia discal: síntomas, diagnóstico y tratamiento | 50 | 142 |
| `/servicios/estenosis-espinal` | Estenosis espinal: síntomas y tratamiento | 41 | 132 |
| `/servicios/escoliosis-y-deformidades` | Escoliosis: cómo se evalúa y cómo se trata | 42 | 131 |
| `/servicios/ortopedia-infantil` | Ortopedia infantil en Lima: cuándo consultar | 44 | 120 |
| `/servicios/cirugia-minimamente-invasiva` | Cirugía mínimamente invasiva de columna en Lima | 47 | 118 |
| `/sedes/consultorio-privado` | Cirugía de columna en Surco: consultorio privado | 48 | 126 |
| `/sedes/clinica-ricardo-palma` | Cirujano de columna en Clínica Ricardo Palma | 44 | 118 |
| `/sedes/sanna-la-molina` | Cirujano de columna en Clínica Sanna La Molina | 46 | 117 |
| `/sedes/clinica-tezza` | Ortopedia infantil en la Clínica Tezza, Lima | 44 | 124 |
| `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | Ciática: por qué duele la pierna y qué hacer | 44 | 125 |
| `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | Cirugía de columna: cuándo se plantea y cómo es | 47 | 123 |
| `/blog/artrosis` | Artrosis: qué es, cómo se trata y cuándo consultar | 50 | 127 |
| `/blog/lumbalgia` | Lumbalgia: por qué duele la zona lumbar | 39 | 129 |

Los 26 conteos coinciden uno a uno con los que declara el handoff. Esa coincidencia es la prueba de
que la transcripcion fue literal y no una reescritura al vuelo, que es la amenaza T-10-05. Las
rutas se derivaron del sitemap del build, no de una lista escrita a mano.

## Verificacion

- `npx tsc --noEmit`: sin errores.
- `npm run lint`: sin errores ni avisos.
- `npm run build`: limpio.
- `node scripts/check-content.mjs`: sin fallas en 14 rutas.
- `node scripts/check-sedes.mjs`: sin fallas en 4 sedes.
- `npm run seo:check`: 23 rutas con imagen de Open Graph propia, sin fallas.
- Revision visual con `npm run start`: se descargaron las tarjetas de `/servicios/hernia-discal` y
  `/sedes/clinica-tezza`. Las dos muestran el title nuevo completo, en tres y dos lineas, con el
  eyebrow correcto ("GUÍA CLÍNICA" y "SEDE"), la linea dorada y el bloque de credenciales en su
  sitio. Ningun archivo `opengraph-image.tsx` se toco: la tarjeta lee el mismo campo `title`.

## Que no se toco

Ningun `h1`, ningun `heroLead`, ningun `cardSummary`, ningun `conditionName`, ninguna seccion de
cuerpo, ninguna fecha, ningun `alternates.canonical`, ningun `robots`, ningun schema y ningun
archivo `opengraph-image.tsx`. Las dos URLs que la fase 8 apago con 301 siguen sin metadata propia.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Bloqueo] Las rutas dinamicas arrastraban el sufijo del template del layout**

- **Encontrado en:** Tarea 2, al medir el HTML del build.
- **Problema:** `generateMetadata` de los tres segmentos `[slug]` declaraba `title` como cadena
  suelta, asi que el `title.template` del layout raiz le pegaba ` | Dr. Juan Angulo` detras. Diez de
  los trece titles salian del build entre 62 y 68 caracteres, contra el limite de 60 del contrato.
  Es el mismo hallazgo del plan 10-01 sobre las rutas base, y los conteos del handoff son del title
  final que ve Google, no del fragmento antes del sufijo.
- **Arreglo:** `title: { absolute: ... }` en las tres funciones `generateMetadata`, igual que el plan
  hermano. No se toco `title.template`, que sigue vivo para `/privacidad` y `/not-found`.
- **Archivos:** `src/app/servicios/[slug]/page.tsx`, `src/app/sedes/[slug]/page.tsx`,
  `src/app/blog/[slug]/page.tsx`.
- **Commit:** `1d19497`

**2. [Rule 1 - Bug] `check-sedes.mjs` esperaba los titles viejos**

- **Encontrado en:** Tarea 2, al correr las puertas de contenido.
- **Problema:** La puerta de sedes de la fase 9 tenia los cuatro titles anteriores escritos a mano y
  les concatenaba el sufijo del template. Con la metadata nueva daba 4 fallas, y ademas su forma
  esperada habia dejado de ser cierta al pasar a `title.absolute`.
- **Arreglo:** Los cuatro titles esperados pasaron a ser los del paquete y se saco la constante
  `TITLE_SUFFIX`, que ya no describe nada.
- **Archivos:** `scripts/check-sedes.mjs`.
- **Commit:** `1d19497`

**3. [Rule 3 - Bloqueo] Los tres modulos del plan ya no existen como archivo plano**

- **Encontrado en:** Tarea 1.
- **Problema:** El plan apunta a `src/content/service-pages.ts`, `location-pages.ts` y `blog.ts`. La
  fase 8 los partio en `src/content/service-pages/`, `location-pages/` y `blog/`, un archivo por
  entrada mas un `index.ts`. El script de verificacion de la tarea 1 leia las rutas viejas.
- **Arreglo:** Se edito la carpeta equivalente y el cruce se corrio recorriendo los tres directorios.
  No se revirtio el split de la fase 8.
- **Commit:** `1d19497`

## Known Stubs

None.

## Self-Check: PASSED

- Los 14 archivos modificados existen y estan commiteados.
- `1d19497` presente en `git log`.

## Commits

| Tarea | Commit | Descripcion |
| --- | --- | --- |
| 1 | sin commit | verificacion del cruce, no edita archivos |
| 2 | `1d19497` | title y meta del paquete v1.2 en las 13 rutas dinamicas |
</content>
