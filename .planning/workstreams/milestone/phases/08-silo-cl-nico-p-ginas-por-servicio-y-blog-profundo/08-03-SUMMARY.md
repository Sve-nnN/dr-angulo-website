---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 03
subsystem: ui
tags: [next-app-router, contenido-clinico, json-ld, schema-org, accesibilidad, jerarquia-de-encabezados, sitemap, silo-seo]

requires:
  - phase: 08-01
    provides: AuthorByline, MedicalDisclaimer, TableOfContents, MidContentCta, la clave blog_post de CtaLocation y scripts/check-content.mjs
  - phase: 08-02
    provides: las cuatro guias del silo como destino del enlace de salida de cada post
provides:
  - BlogSection y BlogPost con intro, secciones con ancla estable, dos fechas, relatedService y ctaBanner
  - /blog/[slug] reconstruida con firma, aviso duplicado, indice, banner del primer tercio y CTA de cierre como h2 real
  - BlogPosting con dateModified real y about hacia el @id de la guia del tema
  - Los dos posts de hernia discal sobre 900 palabras
affects: [08-04, fase 10 breadcrumbs y titles, fase 11 medicion]

tech-stack:
  added: []
  patterns:
    - "Migracion de forma y redaccion separadas en tareas distintas: si el build se rompe se sabe si fue la forma o el texto"
    - "El id de ancla se escribe en el archivo de datos, nunca se deriva del titulo en tiempo de render"

key-files:
  created: []
  modified:
    - src/content/blog.ts
    - src/app/blog/[slug]/page.tsx
    - src/app/blog/page.tsx
    - src/components/structured-data.tsx
    - src/app/sitemap.ts

key-decisions:
  - "Los guiones largos heredados de v1.0 se sustituyeron por puntuacion equivalente en los dos posts expandidos, sin cambiar una sola palabra del texto"
  - "El enlace de salida usa conditionName con la inicial en minuscula, para que el copy del contrato lea natural dentro de la frase"
  - "El post de diferenciar dolor de espalda sumo dos secciones nuevas, porque con tres el desarrollo quedaba forzado"

patterns-established:
  - "La plantilla de post reusa el mismo orden vertical, los mismos componentes y los mismos atributos de anclaje que la de servicio, asi la puerta de contenido mide las ocho URLs con el mismo codigo"
  - "El indice sale del mismo array post.sections que se renderiza, asi que no puede desincronizarse del esquema"

requirements-completed: [BLOG-02, BLOG-03]

coverage:
  - id: D1
    description: "Cada post muestra un solo h1, secciones h2 con anclas que funcionan y ningun salto de nivel"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "un h1, cero h4 y cero h3 sin h2 previo en los cuatro HTML"
        status: pass
    human_judgment: false
  - id: D2
    description: "Cada post muestra una tabla de contenidos construida desde sus propias secciones, con anclas que llevan al encabezado y mueven el foco"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "li del nav igual a h2 con id y tabindex=-1 en los cuatro: 6/6, 3/3, 5/5, 3/3"
        status: pass
    human_judgment: true
    rationale: "Que el foco efectivamente aterrice en el h2 y quede visible bajo el header sticky solo se confirma navegando con teclado; la verificacion cubre el marcado"
  - id: D3
    description: "Cada post muestra la firma con credenciales verificadas, las dos fechas y el aviso educativo pegado a la firma"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "data-author-byline presente, dos data-medical-disclaimer dentro del articulo, y el primero antes del indice y del primer h2 en los cuatro"
        status: pass
    human_judgment: false
  - id: D4
    description: "Cada post muestra un banner de agenda dentro del primer tercio y un CTA de cierre que ahora es un h2 real"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "un data-mid-cta por post; ratio 25.4 y 27.1 por ciento en los dos expandidos; el bloque de cierre es h2 y no p"
        status: pass
    human_judgment: false
  - id: D5
    description: "Cada post enlaza a la pagina de servicio de su tema segun el mapa acordado"
    requirement: BLOG-03
    verification:
      - kind: integration
        ref: "tres posts con href=/servicios/hernia-discal y uno con href=/servicios/estenosis-espinal"
        status: pass
    human_judgment: false
  - id: D6
    description: "Los dos posts de hernia discal superan las 900 palabras conservando su texto de v1.0 como nucleo"
    requirement: BLOG-02
    verification:
      - kind: integration
        ref: "check-content.mjs: 1093 y 980 palabras; los 25 parrafos de v1.0 verificados uno a uno contra el archivo anterior"
        status: pass
    human_judgment: true
    rationale: "Que la prosa agregada sea util y no relleno es un juicio de lectura. La puerta mide extension y formas prohibidas, no calidad"
  - id: D7
    description: "El marcado de articulo declara fecha de publicacion y de modificacion reales, distintas entre si"
    verification:
      - kind: integration
        ref: "datePublished 2026-06-10 / 06-17 / 06-24 / 07-01 y dateModified 2026-08-10 en los cuatro; about hacia el @id de su guia"
        status: pass
    human_judgment: false
  - id: D8
    description: "El listado /blog y el sitemap siguen funcionando despues del cambio de forma de BlogPost"
    verification:
      - kind: integration
        ref: "npx tsc --noEmit codigo 0; sitemap en 16 URLs; blog.html generado"
        status: pass
    human_judgment: false

duration: 24min
completed: 2026-08-10
status: complete
---

# Phase 8 Plan 03: Blog con estructura y salida al silo Summary

**Los cuatro posts dejaron de ser resúmenes planos: `BlogPost` ahora tiene intro, secciones con anclas estables y dos fechas, la plantilla de post se reconstruyó con firma, aviso educativo, índice navegable, banner del primer tercio y CTA de cierre como encabezado real, cada post empuja a la guía de su tema, y los dos de hernia discal pasaron de 284 y 214 palabras a 1093 y 980.**

## Performance

- **Duration:** 24 min
- **Tasks:** 3 de 3
- **Files modified:** 5 archivos

## Accomplishments

- La migración se hizo en el orden que el plan pedía y valió la pena: primero la forma del dato sin una sola frase nueva, después la superficie, y al final la redacción. Cuando `tsc` se quejó, se sabía exactamente de qué se estaba quejando.
- Los 25 párrafos de v1.0 se conservan íntegros. Se verificó uno a uno contra el archivo anterior con un script: cero perdidos, y los seis que no aparecen literales son los numerados, cuya frase de título pasó al encabezado de su sección, que es lo que la tarea pedía.
- La plantilla de post quedó como gemela de la de servicio: mismo orden vertical, mismos componentes, mismos cinco atributos de anclaje. La consecuencia práctica es que la puerta de contenido mide las ocho URLs de la fase con el mismo código, sin ramas por tipo de página salvo las dos que ya tenía.
- El bloque de cierre dejó de ser un párrafo disfrazado de encabezado. Era exactamente el defecto que la jerarquía pedida por el desarrollador venía a corregir, y estaba en las cuatro páginas del blog.
- El schema dejó de mentir por omisión: `dateModified` repetía la fecha de publicación, y ahora sale del campo real. Además cada post declara `about` apuntando al `@id` de su guía, que es lo que le dice al buscador que post y guía son el mismo silo.

## Task Commits

1. **Tarea 1: nueva forma de BlogPost y migración de los cuatro posts** - `943eb71` (refactor)
2. **Tarea 2: plantilla de post reconstruida, listado, schema y sitemap** - `dff9c04` (feat)
3. **Tarea 3: expandir los dos posts de hernia discal** - `e249ecc` (feat)

## Files Created/Modified

**Modificados**

- `src/content/blog.ts` - Tipos `BlogSection` y `BlogPost` nuevos, cuatro posts migrados, dos expandidos. Diecisiete secciones con `id` escrito a mano.
- `src/app/blog/[slug]/page.tsx` - Plantilla reconstruida. `data-content-body` en el artículo, firma, aviso duplicado, índice, banner, CTA de cierre como `h2` y enlace de salida al silo.
- `src/app/blog/page.tsx` - El listado pasa a `publishedAt`.
- `src/components/structured-data.tsx` - `BlogPostJsonLdItem` con las dos fechas y `relatedService`. `BlogPostingJsonLd` con `dateModified` real y `about`.
- `src/app/sitemap.ts` - `lastModified` de cada post pasa a salir de `updatedAt`.

**Archivos nuevos:** ninguno. **Componentes nuevos:** ninguno. **Paquetes instalados:** ninguno.

## Decisions Made

- **Los guiones largos heredados se sustituyeron por puntuación equivalente en los dos posts expandidos.** El texto de v1.0 los usaba como inciso. La regla de redacción del proyecto los prohíbe, y estos dos posts se estaban reescribiendo alrededor de esas frases de todos modos. Se cambió la puntuación, no las palabras: cada frase conserva su contenido literal. Los dos posts que este plan no expande conservan los suyos y quedan para 08-04.
- **El post de diferenciar dolor de espalda sumó dos secciones.** Con las tres heredadas, llegar a 900 palabras habría significado inflar cada una hasta que dejara de leerse. Las dos nuevas, las preguntas que ordenan el cuadro y las señales que no admiten esperar, aportan contenido que el lector necesita y que la guía no repite.
- **El enlace de salida baja la inicial de `conditionName`.** El copy del contrato es "Leer la guía completa sobre {condición}", y "sobre Hernia discal" con mayúscula en medio de la frase se lee mal. Se transforma solo el primer carácter.
- **El banner queda después de la primera sección en los cuatro posts.** Es lo que el contrato pide y el ratio salió dentro de la ventana sin necesidad de moverlo: 25.4 y 27.1 por ciento en los dos medidos.

## Deviations from Plan

Ninguna desviación de alcance ni de salvaguardas. Ningún componente nuevo, ningún paquete, ninguna regla relajada.

### Criterios cuya expresión literal no es satisfacible, verificados por su intención

**Tarea 2, criterio 2 y su `<verify>` automatizado.** El criterio pide exactamente dos apariciones de `data-medical-disclaimer` en el HTML del post, y el comando de verificación del plan lanza una excepción si no son dos. Sobre el documento completo son cuatro en los cuatro posts: dos en el DOM renderizado y dos dentro del payload RSC que Next.js inlinea en `self.__next_f.push`. Es exactamente la desviación 3 que documentó 08-01 para las páginas de servicio, y `scripts/check-content.mjs` ya la resuelve recortando primero el elemento con `data-content-body`. El comando del plan se corrió en su forma literal (falla) y en su forma recortada al artículo (pasa), y dentro del artículo son dos en los cuatro posts. Se deja anotado para que quien audite no lo lea como incumplimiento.

**Tarea 2, criterio 8.** `grep -c 'text-primary-dark'` sobre el HTML devuelve 1 porque el archivo es una sola línea; el conteo real de ocurrencias va de 7 a 10 por post. El enlace "Volver al blog" ya no usa `text-primary` a secas: pasó a `text-primary-dark` y sumó `min-h-11`.

---

**Total deviations:** 0. **Criterios verificados por intención:** 2.

## Issues Encountered

- **`git diff --stat` reportó tres archivos que este plan no toca:** `12-01-PLAN.md`, `12-03-PLAN.md` y `12-05-PLAN.md`, bajo `.planning/workstreams/seo-keywords/`. No los modificó este ejecutor y no se incluyeron en ningún commit. Todos los `git add` de este plan fueron por ruta explícita. Quedan en el árbol de trabajo tal como estaban, para que quien los esté editando decida qué hacer con ellos.
- **Un artefacto de escritura dejó una línea inválida al final de `src/content/blog.ts`** en la primera pasada de la tarea 1. `tsc` lo detectó de inmediato (`TS1110: Type expected`), se eliminó la línea y se volvió a verificar. Vale registrarlo porque es la clase de error que un typecheck atrapa en segundos y una revisión visual se puede saltar.

## Known Stubs

Ninguno de este plan. Los dos posts que siguen bajo las 900 palabras, `miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` y `estenosis-espinal-que-es`, no son stubs: son el alcance declarado de 08-04. Ya tienen la forma nueva, el índice, la firma, el banner y el enlace de salida; les falta solo la prosa.

## Threat Flags

Ninguna superficie nueva de red, autenticación ni acceso a archivos. Las mitigaciones del registro se cumplieron:

| Amenaza | Estado |
|---------|--------|
| T-08-09 divulgación en la prosa ampliada de los posts | Puerta ejecutable en verde sobre las dos rutas expandidas. Cero primera persona, cero porcentaje, cero soles. |
| T-08-10 tampering en el `id` de sección usado como ancla | Los diecisiete `id` se escriben a mano en el archivo de datos y todos casan con `^[a-z0-9-]+$`. Sin generación en render y sin entrada de usuario. |
| T-08-11 spoofing de revisión médica en `BlogPosting` | Cero `reviewedBy` y cero `lastReviewed` en los cuatro HTML. Las fechas del schema salen de los mismos dos campos que muestra la firma visible. |
| T-08-12 tampering en `structured-data.tsx` | `dangerouslySetInnerHTML` sigue apareciendo exactamente una vez en el archivo, dentro del helper existente, y cero veces en la ruta de post. |
| T-08-SC instalaciones de npm | Cero paquetes. `package.json` no aparece en ninguno de los tres diffs. |

## User Setup Required

Ninguna.

## Next Phase Readiness

**Listo para 08-04.** Los dos posts que faltan expandir ya tienen la forma nueva y toda la superficie: solo hay que engordar `intro` y `sections`, con el banner después de la primera sección y el ratio dentro de la ventana. La puerta completa, sin argumentos, va a poder correr recién cuando esos dos superen las 900 palabras, que es la primera acción de la tarea 2 de 08-04.

**Pendiente de decisión del desarrollador, no de código:**

1. **Nada se subió a `main`.** Los siete commits de la fase, más los tres de este plan, siguen solo en local.
2. **La revisión del doctor sigue pendiente.** Con este plan son cerca de 9200 palabras de contenido clínico publicables bajo su firma sin revisión previa.
3. **Verificación manual pendiente (D2 y D6):** recorrido de teclado por las anclas de los posts a 375px y lectura de la prosa expandida.

## Self-Check: PASSED

- Cinco archivos modificados declarados: los cinco existen en disco.
- Tres commits declarados (`943eb71`, `dff9c04`, `e249ecc`): los tres están en `git log`.
- `npm run build` código 0, `npm run lint` código 0, `npx tsc --noEmit` código 0.
- `node scripts/check-content.mjs` sobre las dos rutas de post expandidas: código 0, 1093 y 980 palabras.
- `node scripts/check-content.mjs` sobre las cuatro rutas de servicio: código 0.
- Sitemap en 16 URLs. Cero guiones largos en este SUMMARY.

---
*Phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo*
*Completed: 2026-08-10*
</content>
