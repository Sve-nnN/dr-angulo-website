---
phase: 10-schema-metadata-y-limpieza-t-cnica
plan: 01
subsystem: seo-metadata
tags: [seo, metadata, open-graph, next-app-router]
requires:
  - paquete on-page v1.2 (15-HANDOFF-V11-ONPAGE.md, seccion 2)
  - metadataTitle() de src/lib/og-card.tsx, que ya lee la forma { absolute }
provides:
  - title y meta description finales de las 9 rutas base con metadata estatica
  - og:title y og:description por defecto del layout raiz
affects:
  - src/app/layout.tsx
  - las tarjetas de Open Graph de las 9 rutas, que se regeneran con el title nuevo
tech-stack:
  added: []
  patterns:
    - "title: { absolute } en toda ruta que ya trae su title completo del paquete, para que el template del layout no le pegue el sufijo"
key-files:
  created: []
  modified:
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
decisions:
  - "El title.template del layout se queda como esta: /privacidad y /not-found no estan en el paquete y lo siguen necesitando."
  - "twitter.title y twitter.description del layout no se tocaron. El plan acota el cambio a openGraph y a title.default, y X toma og: cuando falta la etiqueta propia."
  - "src/lib/site-config.ts queda intacto: alimenta el JSON-LD y /llms.txt, que no cambian en esta fase."
metrics:
  duration: ~25 min
  completed: 2026-08-13
status: complete
---

# Phase 10 Plan 01: Title y meta del paquete v1.2 en las rutas base

Las 9 rutas con metadata estatica sirven ahora el title y la meta description exactos del paquete
on-page aprobado, dentro de 60 y 155 caracteres, sin el sufijo del template pegado atras.

## Que se hizo

**Tarea 1 — las 9 rutas base.** En cada `page.tsx` se reemplazo el par `title` / `description` del
export `metadata` por la cadena literal de la fila correspondiente del handoff. El `title` se
declaro como `title: { absolute: "..." }`, no como cadena suelta: el layout raiz declara
`title.template` con el sufijo ` | Dr. Juan Angulo`, y con la forma suelta Next se lo pegaba detras,
sacando varias rutas del limite de 60 y contradiciendo los conteos del paquete, que son del title
final que ve Google. En la portada tambien salieron del export `metadata` los usos de
`siteConfig.name`, `siteConfig.title` y `siteConfig.description`, sin editar `site-config.ts`.

Ninguna de las 9 paginas declaraba objeto `openGraph` propio, asi que no hubo nada que alinear ahi.

**Tarea 2 — valores por defecto del layout.** `title.default`, `description`, `openGraph.title` y
`openGraph.description` pasaron a ser el title y la meta de la fila `/` del handoff. La description
que heredaba cualquier ruta sin metadata propia media casi el doble del contrato; ahora mide 127.

## Longitudes servidas, medidas sobre el HTML prerenderizado

| Ruta | Title | Car. |
| --- | --- | --- |
| `/` | Traumatología en Lima: Dr. Juan Carlos Angulo | 45 |
| `/agendar` | Agendar una cita con el Dr. Angulo | 34 |
| `/blog` | Blog del Dr. Juan Carlos Angulo | 31 |
| `/contacto` | Contacto con el consultorio del Dr. Angulo | 42 |
| `/preguntas-frecuentes` | Reumatólogo o traumatólogo: a cuál te toca ir | 45 |
| `/sedes` | Dónde atiende el Dr. Juan Carlos Angulo en Lima | 47 |
| `/servicios` | Cirujano de columna en Lima: qué trata el doctor | 48 |
| `/sobre-el-doctor` | Sobre el Dr. Juan Carlos Angulo Totesaut | 40 |
| `/testimonios` | Testimonios de pacientes del Dr. Angulo | 39 |

Los 9 conteos coinciden uno a uno con los que declara el handoff, lo que confirma que la
transcripcion fue literal (amenaza T-10-01). Ninguna meta description pasa de 155. Ningun `<title>`
arrastra el sufijo del template (T-10-02).

## Verificacion

- `npx tsc --noEmit`: sin errores.
- `npm run lint`: sin errores ni avisos.
- `npm run build`: limpio.
- Medicion del `<title>` y de la `description` en los 9 HTML de `.next/server/app/`: dentro del
  contrato, sin sufijo pegado.
- Portada: `og:title` 45 caracteres, `og:description` 127, `twitter:image` presente (la tarjeta
  propia de cada ruta no se perdio).
- `node scripts/check-content.mjs`: sin fallas en 14 rutas.
- `node scripts/check-sedes.mjs`: sin fallas en 4 sedes.
- `npm run seo:check`: 23 rutas revisadas, 23 con imagen de Open Graph propia, sin fallas.
- Revision visual: se levanto `npm run start` y se descargaron las tarjetas de `/` y de `/blog`. Las
  dos muestran el title nuevo completo, en tres y dos lineas respectivamente, con el eyebrow, la
  linea dorada y el bloque de credenciales en su lugar. El escalon tipografico de `og-card.tsx`
  (64 px hasta 34 caracteres, 56 px hasta 52) cubre de sobra el rango 31-48 de los titles nuevos,
  que son mas cortos que los anteriores.

## Que no se toco

Ningun `<h1>`, ningun cuerpo de pagina, ningun `alternates.canonical`, ningun `robots`, ningun
`revalidate`, ningun archivo `opengraph-image.tsx`, ningun schema de credenciales o de reseñas y
`src/lib/site-config.ts`. `title.template` sigue vivo para `/privacidad` y `/not-found`.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- Los 10 archivos modificados existen y estan commiteados.
- `bef9ca1` y `cd5a0d5` presentes en `git log`.

## Commits

| Tarea | Commit | Descripcion |
| --- | --- | --- |
| 1 | `bef9ca1` | title y meta del paquete v1.2 en las 9 rutas base |
| 2 | `cd5a0d5` | og:title y og:description por defecto desde el paquete v1.2 |
