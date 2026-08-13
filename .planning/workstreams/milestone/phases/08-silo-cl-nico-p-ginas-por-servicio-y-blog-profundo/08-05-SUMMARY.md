---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 05
subsystem: content-model
tags: [refactor, modelo-de-datos, next-app-router, contenido-clinico, json-ld, jerarquia-de-encabezados, silo-seo]

requires:
  - phase: 08-02
    provides: las cuatro guias de servicio con secciones, items y subsecciones
  - phase: 08-03
    provides: los cuatro posts con intro, secciones con ancla estable y relatedService
provides:
  - "src/content/service-pages/ como directorio: index.ts con los tipos y el registro, un modulo por slug"
  - "src/content/blog/ como directorio: index.ts con los tipos y el registro, un modulo por post"
  - "ServiceSection plana con id y level 2|3, sin subsections"
  - "ServicePage.format (guia-clinica | pagina-de-servicio) y ServicePage.outboundLinks"
  - "BlogPost.h1 separado de title, relatedService opcional y BlogPost.outboundLinks"
  - "Las dos plantillas renderizan dos niveles desde un arreglo plano con anclas en h2 y h3"
  - "La puerta acepta un post sin linksTo si sale al silo por otra ruta"
affects: [08-06, 08-07, 08-08, 08-09, 08-10, 08-11, 08-12, 08-13, 08-14, 08-15, 08-16, 08-17, 08-18, 08-19, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "Migracion de datos por script mecanico sobre el modulo viejo transpilado, no a mano: el texto publicado no puede driftear porque nadie lo reescribe"
    - "El id de ancla se escribe en el archivo de datos, tambien en el nivel 3, con la convencion {idDelPadre}--{titulo-en-kebab-case}"
    - "El nivel 3 es un elemento mas del arreglo, y la plantilla lo agrupa dentro del section de su h2 antes de renderizar"

key-files:
  created:
    - src/content/service-pages/index.ts
    - src/content/service-pages/hernia-discal.ts
    - src/content/service-pages/estenosis-espinal.ts
    - src/content/service-pages/escoliosis.ts
    - src/content/service-pages/ortopedia-infantil.ts
    - src/content/blog/index.ts
    - src/content/blog/5-sintomas-de-columna-que-no-debes-ignorar.ts
    - src/content/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos.ts
    - src/content/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber.ts
    - src/content/blog/estenosis-espinal-que-es.ts
  modified:
    - src/app/servicios/[slug]/page.tsx
    - src/app/blog/[slug]/page.tsx
    - src/components/structured-data.tsx
    - scripts/check-content.mjs
  deleted:
    - src/content/service-pages.ts
    - src/content/blog.ts
    - src/components/ui/treatment-compare.tsx

key-decisions:
  - "La migracion se hizo con un script que transpila el modulo viejo, lo evalua y serializa los modulos nuevos, en vez de copiar bloques a mano: con 799 y 314 lineas de prosa clinica, copiar a mano es la via segura de introducir un cambio de texto que nadie nota"
  - "Una seccion de nivel 2 sin cuerpo propio se conserva si tiene hijas. Preguntas frecuentes no tiene parrafos y es solo el techo de sus preguntas; el filtro por cuerpo propio la borro del HTML en el primer intento"
  - "checkSources del script de puerta pasa a enumerar los directorios de contenido: con la lista fija de dos archivos, el split habria desactivado en silencio las salvaguardas de primera persona y de campos prohibidos"
  - "Los tres commits del plan se agruparon en dos porque el cambio de tipo, la migracion de datos y las dos plantillas no compilan por separado"

patterns-established:
  - "Un modulo de datos por pagina, con la ruta de importacion publica intacta: ningun consumidor cambia su import cuando el contenido crece"
  - "outboundLinks nace declarado y renderizado pero sin ninguna pagina que lo use: los planes de contenido lo llenan sin volver a tocar plantilla"

requirements-completed: [SVC-01, BLOG-02]

coverage:
  - id: D1
    description: "El modelo admite los dos esqueletos del paquete on-page sin obligar a ninguna pagina a declarar secciones que su formato no tiene"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "ServicePage.sections es ServiceSection[] y format declara el esqueleto; npx tsc --noEmit codigo 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Una subseccion de nivel 3 puede tener id propio y compartible"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "24 secciones de nivel 3 migradas con id {padre}--{slug}; el HTML de las cuatro guias emite h3 con id y tabindex=-1"
        status: pass
    human_judgment: false
  - id: D3
    description: "Ningun h3 queda fuera del section abierto por su h2"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "check-content.mjs: cero fallas de jerarquia en las ocho rutas; groupSections agrupa antes de renderizar"
        status: pass
    human_judgment: false
  - id: D4
    description: "Un post del blog puede existir sin declarar guia de destino"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "relatedService opcional en BlogPost; BlogPostingJsonLd omite about; el bloque de salida se omite; la puerta exige salida al silo por otra via"
        status: pass
    human_judgment: false
  - id: D5
    description: "El H1 de un post no queda a merced de la fase que reescribe el title"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "BlogPost.h1 obligatorio; la plantilla renderiza post.h1 y generateMetadata usa post.title"
        status: pass
    human_judgment: false
  - id: D6
    description: "Las 21 rutas siguen compilando y las ocho del MANIFEST pasan la puerta"
    verification:
      - kind: integration
        ref: "npm run build verde; check-content.mjs sin fallas en 8 rutas; check-sedes.mjs sin fallas en 4 sedes; sitemap en 21 URLs"
        status: pass
    human_judgment: false
  - id: D7
    description: "El texto publicado no cambio"
    verification:
      - kind: integration
        ref: "382 cadenas de las ocho paginas verificadas verbatim contra los archivos de git HEAD dentro del HTML prerenderizado; cero ausentes"
        status: pass
    human_judgment: true
    rationale: "La verificacion cubre presencia verbatim de cada parrafo, encabezado, item y heroLead. Que el orden de lectura se sienta igual en pantalla es juicio visual, y el tratamiento de la seccion de tratamiento si cambio de aspecto a proposito"

duration: 38min
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 05: Modelo de datos para el paquete on-page Summary

**`ServicePage.sections` dejó de ser un `Record` sobre una tupla global de ocho claves y pasó a ser un arreglo plano de secciones con `id` y `level` propios, `service-pages.ts` y `blog.ts` se abrieron en directorios con un módulo por página, `BlogPost` ganó `h1` propio y `relatedService` opcional, y las 21 rutas del sitio siguen renderizando exactamente el mismo texto que antes.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 38 min |
| Tareas | 3 de 3 |
| Commits | 2 |
| Archivos creados | 10 |
| Archivos modificados | 4 |
| Archivos eliminados | 3 |

## Qué se construyó

El plan no publica una sola palabra de contenido nuevo. Cambia la forma en que el contenido se declara, para que los catorce planes que vienen detrás tengan dónde escribir.

El modelo viejo tenía tres límites duros contra el paquete on-page de v1.2. El primero es que `SERVICE_SECTION_ORDER` fijaba ocho claves globales y el `Record` sobre esa tupla obligaba a toda página a declarar las ocho: una página de servicio de cinco huecos tendría que inventar tres secciones que su formato no tiene. El segundo es que el nivel 3 vivía en una propiedad `subsections` con solo `heading` y `paragraphs`, sin `id`, así que una subsección no podía ser destino de un ancla. El tercero es que el blog no tenía `h1` separado de `title`, y la fase 10, que reescribe `title` con el de buscador, habría borrado el H1 sin enterarse.

Los tres se cierran así:

- `ServiceSection` es `{ id, level: 2 | 3, heading, paragraphs, items? }`. El nivel 3 es un elemento más del arreglo, colocado detrás de su padre. Desaparecen `SERVICE_SECTION_ORDER`, `ServiceSectionId`, `ServiceSubsection` y `subsections`.
- `ServicePage` suma `format: "guia-clinica" | "pagina-de-servicio"` y `outboundLinks?: { href, anchor }[]`.
- `BlogSection` se alinea con el mismo modelo: `level` en vez de `subsections`.
- `BlogPost` suma `h1` obligatorio y `outboundLinks?`, y `relatedService` pasa a opcional.
- `src/content/service-pages.ts` y `src/content/blog.ts` se convierten en directorios. La ruta de importación pública (`@/content/service-pages`, `@/content/blog`) no cambia, así que ninguno de los 17 consumidores tocó su import.

Las dos plantillas recorren el arreglo plano. `groupSections` agrupa cada h2 con las secciones de nivel 3 que le siguen antes de renderizar, y ese paso es lo que evita que un h3 abra su propio `<section>` y quede como hermano de su h2 en vez de colgar de él. El índice lista solo el nivel 2, que es lo que la puerta compara contra los h2. Los `faqItems` del JSON-LD salen ahora de las secciones cuyo `id` empieza por `preguntas-frecuentes--`.

## Decisiones

**La migración de datos la hizo un script, no una persona.** El script transpila el módulo viejo con la API de TypeScript, lo evalúa, transforma el `Record` en arreglo y serializa los módulos nuevos. Con 799 líneas de prosa clínica en un archivo y 314 en el otro, mover bloques a mano es la vía más directa de introducir un cambio de texto que nadie nota hasta que está en producción. El script se borró al terminar; lo que queda es su salida.

**Una sección de nivel 2 sin cuerpo propio se conserva si tiene hijas.** El primer intento filtró las secciones por cuerpo propio y borró "Preguntas frecuentes" del HTML de las cuatro guías, porque esa sección no tiene párrafos: es solo el techo de sus cuatro preguntas. Sus h3 quedaron colgando de la sección anterior y el índice perdió la entrada. La puerta pasó igual, porque el índice y lo renderizado salían de la misma lista y seguían coincidiendo entre sí. Lo que lo detectó fue la comparación verbatim contra el archivo viejo.

**`outboundLinks` nace sin salida visible.** Ninguna página lo declara todavía. El campo y su render existen para que los planes de contenido llenen datos sin volver a tocar plantilla.

**Los tres commits previstos salieron en dos.** El cambio de tipo, la migración de datos y las dos plantillas no compilan por separado: eliminar `ServiceSectionId` rompe la plantilla en la misma línea en que se elimina. Agruparlos evita dejar un commit rojo en el historial de un sitio que despliega desde `main`.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run build` | verde, 21 rutas |
| `node scripts/check-content.mjs` | sin fallas en 8 rutas |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| `npx eslint` | sin avisos |
| `grep -rn "SERVICE_SECTION_ORDER\|ServiceSectionId\|ServiceSubsection" src` | 0 |
| `grep -c "SITEMAP_TOTAL = 21" scripts/check-content.mjs` | 1 |
| Texto publicado verbatim | 382 de 382 cadenas presentes en el HTML |

Recuento de palabras de las ocho rutas después del refactor: 1936, 2077, 2164, 2297 en las guías; 1093, 980, 1091, 1110 en los posts.

## Desviaciones del plan

**1. [Regla 1 - Bug] La sección "Preguntas frecuentes" desapareció del HTML**

- **Encontrado en:** Task 2, en la verificación verbatim
- **Problema:** el filtro `hasContent` heredado de v1.0 contaba `subsections`, y al desaparecer ese campo la sección de FAQ quedó sin cuerpo propio y se filtró. Sus cuatro h3 pasaron a colgar de la sección anterior.
- **Arreglo:** `groupSections` agrupa primero y filtra después, conservando el nivel 2 que tenga hijas.
- **Archivos:** `src/app/servicios/[slug]/page.tsx`
- **Commit:** 2d5ca24

**2. [Regla 2 - Funcionalidad crítica faltante] `checkSources` se habría desactivado en silencio**

- **Encontrado en:** Task 3
- **Problema:** la función leía dos rutas fijas y hacía `continue` si el archivo no existía. Con el split en directorios, las dos rutas dejan de existir y las salvaguardas de primera persona y de campos prohibidos habrían dejado de correr sin que la puerta lo reportara.
- **Arreglo:** enumera los `.ts` de los dos directorios y falla si un directorio no está.
- **Archivos:** `scripts/check-content.mjs`
- **Commit:** 6896109

**3. [Regla 3 - Bloqueo] Los tres commits previstos salieron en dos**

- **Problema:** el plan pedía un commit por tarea, pero ningún estado intermedio compila. `npx tsc --noEmit`, que es el verify de la Task 1, no puede pasar hasta que la Task 2 adapta la plantilla.
- **Arreglo:** un commit para todo el cambio de `src/` y otro para la puerta, que sí es independiente.

**4. [Regla 2] `structured-data.tsx` entró al plan sin estar en `files_modified`**

- **Problema:** `BlogPostJsonLdItem.relatedService` era obligatorio y el tipo dejó de compilar al volverse opcional en `BlogPost`. El cuerpo del plan sí lo pide ("emitir `about` solo cuando el post declare `relatedService`"), pero el frontmatter no lo listaba.
- **Arreglo:** campo opcional y `about` emitido condicionalmente.
- **Archivos:** `src/components/structured-data.tsx`

## Cambios de aspecto conocidos

La sección "Tratamiento" de las cuatro guías cambió de presentación: `TreatmentCompare` la mostraba como dos tarjetas lado a lado con el rótulo en `<p>`, y ahora sus dos bloques son h3 con ancla dentro del flujo normal. El plan lo pide explícitamente ("borrar su uso de esta plantilla y borrar el componente si ningún otro archivo lo importa"), porque el componente se alimentaba de `subsections`, que ya no existe. El texto es el mismo palabra por palabra; lo que cambió es el envoltorio, y a cambio esos dos bloques ganaron ancla propia.

## Lo que hereda la ola 2

Los seis planes de la ola 2 (08-06 a 08-11) escriben contenido dentro de esta forma:

```ts
// src/content/service-pages/{slug}.ts
import type { ServicePage } from "./index";

export const nombreEnCamelCase: ServicePage = {
  slug, navLabel, h1, heroLead, title, description, cardSummary,
  conditionName, alternateNames?, publishedAt, updatedAt,
  format: "guia-clinica" | "pagina-de-servicio",
  describesSurgery, relatedPosts, ctaBanner,
  outboundLinks?: [{ href, anchor }],
  sections: [
    { id: "que-es", level: 2, heading, paragraphs, items? },
    { id: "sintomas--diferencia-entre-x-e-y", level: 3, heading, paragraphs },
  ],
};
```

Reglas que la plantilla da por sentadas:

- El `id` de nivel 2 es la `clave` del esqueleto de `seo-tools/src/phase15/serp-onpage.ts`, literal. El de nivel 3 es `{idDelPadre}--{titulo-en-kebab-case-sin-tildes}`.
- Una sección de nivel 3 va inmediatamente detrás de la de nivel 2 a la que pertenece. El orden del arreglo es el orden de lectura y el del índice.
- El banner de conversión cae después de la segunda sección de nivel 2 y de todas sus hijas. En la guía clínica eso es `sintomas`; en la página de servicio, `como-es-la-consulta`.
- La sección con `id: "cuando-consultar"` se renderiza como `ConsultAlert`. Las que traen `items` se renderizan como `ServiceItemGrid`, en variante de pasos si su `id` es `diagnostico` o `recuperacion`.
- Las preguntas del FAQ son secciones de nivel 3 con `id` que empieza por `preguntas-frecuentes--`. De ahí sale el JSON-LD de FAQ, sin que el plan de contenido haga nada más.
- Un `h2` sin párrafos propios es legítimo si tiene hijas, y es lo que se espera de `preguntas-frecuentes`.
- Alta de página nueva: crear el módulo e importarlo en `src/content/service-pages/index.ts`. Hay que sumar la ruta al `MANIFEST` de `scripts/check-content.mjs` y subir `SITEMAP_TOTAL`, que este plan dejó intacto en 21 a propósito.

Para el blog, el módulo es análogo con `BlogPost`: `h1` es obligatorio y distinto de `title`, `relatedService` es opcional, y un post sin `relatedService` debe declarar `outboundLinks` con al menos una salida hacia `/servicios`, porque la puerta la exige.

## Self-Check: PASSED

Los diez archivos creados existen en disco y los dos commits (`2d5ca24`, `6896109`) están en `git log`.
