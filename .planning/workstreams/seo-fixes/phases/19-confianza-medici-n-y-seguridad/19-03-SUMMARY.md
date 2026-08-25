---
phase: 19-confianza-medicion-y-seguridad
plan: 03
subsystem: medicion
tags: [utm, google-business-profile, search-console, seo-tools, meas-01]
requires: []
provides: ["decisión escrita de quitar los utm del perfil de Google Business", "línea base de impresiones partidas", "dataset de seo-tools alineado con los slugs publicados"]
affects: [docs/google-business-profile.md, docs/preguntas-yuly-y-nap.md, audit/baselines, seo-tools/data]
tech-stack:
  added: []
  patterns: []
key-files:
  created:
    - audit/baselines/2026-08-25-baseline-utm-gbp.md
  modified:
    - docs/google-business-profile.md
    - docs/preguntas-yuly-y-nap.md
    - seo-tools/data/url-map.jsonl
    - seo-tools/data/internal-links.json
    - seo-tools/data/copy-blog.json
    - seo-tools/data/onpage.json
    - seo-tools/data/canonicals.json
decisions:
  - "El enlace del perfil de Google Business y el de citas van sin utm. Los de Instagram y Doctoralia se quedan con su marca: esos perfiles no alimentan Search Console y sus parámetros no parten ningún reporte. La distinción queda escrita para que nadie los quite después por consistencia."
  - "Las filas de los dos posts absorbidos no se renombran hacia la guía: /servicios/hernia-discal y /servicios/estenosis-espinal ya tienen fila propia en los cinco datasets, y renombrar habría duplicado la URL. Se quitan, y los recuentos de resumen se recalculan en el mismo cambio."
  - "onpage-serp.json y url-inventory.json no se tocan: el primero es una captura de posiciones de SERP y el segundo un inventario del árbol en la fase 14. Reescribir una captura la convierte en dato falso."
metrics:
  duration: ~25 min
  completed: 2026-08-25
status: complete
---

# Phase 19 Plan 03: Decisión sobre los UTM del perfil de Google Business Summary

La decisión de quitar los `utm` del enlace del perfil está escrita donde Juan la va a leer, con su motivo y con la línea base medida para poder comprobar la consolidación a 30 días. De paso quedó saldada la limpieza de los cinco archivos de `seo-tools/data/` que arrastraban los slugs viejos del blog desde el code review de la fase 16.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Decisión escrita y línea base | `1dfdaad` | `audit/baselines/2026-08-25-baseline-utm-gbp.md`, más los enlaces limpios y la subsección "Por qué el enlace va sin utm" en `docs/google-business-profile.md`, y el bloque de la ficha de Google en `docs/preguntas-yuly-y-nap.md` |
| 2. Limpieza de `seo-tools/data/` | `f0ed23d` | los cinco archivos alineados con los slugs publicados, todos parseando, y los dos archivos fuera de la lista inspeccionados sin tocarse |

## La línea base

892 impresiones totales del sitio entre el 2026-07-23 y el 2026-08-19, de las cuales 778 —el 87 %— en URLs con `?utm_source=google&utm_medium=organic&utm_campaign=gbp`: 673 en la portada, 75 en `/servicios` y 30 en `/agendar`.

El canonical de esas URLs ya apuntaba a la versión limpia, así que nunca hubo riesgo de contenido duplicado. Lo que se arregla es el reporte partido, no la indexación. Y el canal no se queda sin medición: pasa a medirse por el informe propio de Google Business, que ya cuenta clics al sitio.

## Qué se hizo con las entradas de `copy-blog.json`

Los dos posts absorbidos —`hernia-discal-o-dolor-de-espalda-como-diferenciarlos` y `estenosis-espinal-que-es`— **no tenían entrada propia** en `copy-blog.json`. Ese dataset solo cubre cuatro páginas: `/blog/artrosis`, `/blog/lumbalgia` y los dos posts renombrados. Las 19 apariciones de slugs viejos en ese archivo eran todas de los dos renombrados, y se resolvieron con el renombre directo: `5-sintomas-de-columna-que-no-debes-ignorar` a `ciatica` y `miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` a `cirugia-de-columna`. No hubo nada que borrar acá.

La decisión de borrar sí apareció, pero en los otros cuatro archivos. Va explicada abajo como desviación, porque cambia lo que el plan prescribía.

## Los dos archivos fuera de la lista de cinco

El plan pedía inspeccionarlos y no reescribirlos si resultaban ser capturas fechadas. Lo son los dos. **Recomendación: no tocarlos en ninguna fase futura por sustitución de texto. Si el dato hace falta actualizado, se regenera con la herramienta que lo produjo.**

**`seo-tools/data/onpage-serp.json`** (2 apariciones). Es una captura de posiciones de SERP: cada URL trae `posicionesMedidas`, y las dos filas afectadas registran 7 posiciones medidas cuando el post todavía vivía en la URL vieja. Reescribir el slug diría que esas posiciones se midieron en una URL que en ese momento no existía. El archivo es correcto tal como está: describe lo que se vio el día que se vio.

**`seo-tools/data/url-inventory.json`** (8 apariciones). Su propio encabezado lo dice: `"generadoPor": "src/phase14/inventory.ts"`, `"requisito": "MAP-01"`. Es el inventario del árbol tal como estaba en la fase 14, y las filas afectadas apuntan a `src/content/blog.ts:32`, `:105`, `:169` y `:242`, líneas de un archivo que el repo ya no tiene con esa forma. Editarle los slugs produciría un híbrido: URLs de hoy con orígenes de código de hace dos fases.

## Compuertas

Las cinco en 0 en cada commit:

| Compuerta | Resultado |
|---|---|
| `content:check` | Sin fallas en 15 ruta(s) |
| `seo:check` | Sin fallas |
| `sedes:check` | Sin fallas en 4 sede(s) |
| `tsc --noEmit` | limpio |
| `build` | limpio |

`seo-tools/data/` no entra en ninguna de las cinco, pero se corrieron igual. `git status --porcelain src/ scripts/` vacío en las dos tareas. `git diff package.json package-lock.json` vacío.

Validación propia del dataset: los cuatro `.json` parsean como documento entero y cada línea no vacía del `.jsonl` parsea como objeto (`json ok`).

## Desviaciones del plan

**1. [Regla 1 - Corrección] Las filas de los dos posts absorbidos se quitan, no se renombran**

- **Encontrado en:** Tarea 2, antes de sustituir nada.
- **Qué decía el plan:** que `hernia-discal-o-dolor-de-espalda-como-diferenciarlos` y `estenosis-espinal-que-es` "pasan a `/servicios/hernia-discal` y `/servicios/estenosis-espinal` respectivamente, que es un cambio de sección, no solo de slug".
- **Qué se encontró:** las dos URLs de destino **ya tienen fila propia** en los cinco datasets. `url-map.jsonl` tenía 24 filas incluyendo `/servicios/hernia-discal` y `/servicios/estenosis-espinal`; `canonicals.json` y `onpage.json`, 24 cada uno, con las dos presentes. Renombrar habría producido dos URLs duplicadas por archivo, que es peor que el slug viejo: un slug obsoleto se detecta con un `grep`, una fila duplicada se propaga a cualquier recuento que lea el dataset.
- **Y hay un segundo motivo, del contenido de las filas.** Esas filas no describen páginas: describen la decisión de redirigirlas. `onpage.json` las tenía con `"accion": "redirigir"` y `"redirigeA": "/servicios/hernia-discal"`; `internal-links.json` las tenía en `fueraDeLaMatriz` con el motivo de por qué no se enlazan. Renombradas, cada fila habría quedado diciendo que se redirige a sí misma. La redirección que prescribían está implementada en `redirects()` de `next.config.ts` desde la fase 14: la fila ya no aporta nada que el repo no diga en un lugar mejor.
- **Qué se hizo:** se quitaron las filas de las dos URLs en `url-map.jsonl` (24 → 22), `canonicals.json` (24 → 22 filas), `onpage.json` (24 → 22 filas) e `internal-links.json` (`fueraDeLaMatriz` 2 → 0). Los recuentos de `resumen` se recalcularon **en el mismo commit**, no en uno posterior: `canonicals.resumen` pasó a `urls: 22, sinKeyword: 6, canonicalesUnicos: 22`, y `onpage.resumen` a `filas: 22, redirigir: 0`. Un archivo con las filas quitadas y el resumen viejo habría dejado una invariante rota justo del tipo que las fases 16 y 18 pagaron caro.
- **Commit:** `f0ed23d`.

**2. [Nota de método] Los recuentos de partida del plan no coincidían**

- El plan daba: `canonicals.json` 8, `copy-blog.json` 19, `internal-links.json` 16, `onpage.json` 4, `url-map.jsonl` 8. Los recuentos son correctos como total de los cuatro slugs por archivo, pero mezclan dos casos que se tratan distinto: los dos posts renombrados, que se sustituyen, y los dos absorbidos, que se quitan. Desglosado: `canonicals.json` 4 renombrados + 4 absorbidos, `internal-links.json` 14 + 2, `onpage.json` 2 + 2, `url-map.jsonl` 4 + 4, `copy-blog.json` 19 + 0.
- No cambia el resultado ni el criterio de aceptación —el `grep` de los cuatro slugs devuelve 0 en los cinco archivos— pero vale anotarlo: el recuento agregado escondía que la mitad del trabajo era de otra naturaleza.

## Pendiente a cargo de Juan

**Aplicar el cambio en el panel de Google Business.** Editar → Contacto → Sitio web, poner `https://drangulocolumna.com/` sin parámetros. Y Enlace de citas, `https://drangulocolumna.com/agendar`, también sin parámetros. Lo mismo para el botón "Más información" de las publicaciones nuevas.

**Anotar la fecha del cambio** en el campo en blanco al pie de `audit/baselines/2026-08-25-baseline-utm-gbp.md`. Sin esa fecha la ventana de 30 días no arranca y la verificación deja de ser comprobable.

**Verificación de consolidación: 30 días después de esa fecha.** En Search Console, Rendimiento, pestaña Páginas: filtrar por URL que contenga `utm_campaign=gbp` sobre los últimos 28 días y confirmar cero impresiones, y comparar las filas limpias de `/`, `/servicios` y `/agendar` contra los 673, 75 y 30 de la línea base. Cero en el primer filtro con las filas limpias vacías no es consolidación, es tráfico perdido. No bloquea el cierre de la fase 19.

## Known Stubs

Ninguno.

## Threat Flags

Ninguna. Este plan no toca código ni agrega superficie de red.
