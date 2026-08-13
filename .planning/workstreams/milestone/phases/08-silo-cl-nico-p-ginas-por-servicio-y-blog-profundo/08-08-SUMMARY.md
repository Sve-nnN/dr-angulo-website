---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 08
subsystem: contenido-clinico
tags: [contenido, ymyl, pagina-de-servicio, paquete-on-page, ortopedia-infantil, pos-01, banner-de-nivel-3]

requires:
  - phase: 08-05
    provides: ServicePage con secciones planas de nivel 2 y 3, format y outboundLinks
  - phase: 08-06
    provides: ServicePage.bannerAfterSectionId y su resolución en la plantilla
  - phase: 15 (workstream seo-keywords, v1.2)
    provides: copy aprobado de /servicios/ortopedia-infantil en copy-servicios.json
provides:
  - "/servicios/ortopedia-infantil con las 20 secciones del paquete de v1.2, 1814 palabras de cuerpo"
  - "La primera página del sitio con format: pagina-de-servicio y su esqueleto de cinco h2"
  - "bannerAfterSectionId resuelve también ids de nivel 3, insertando el banner dentro del section de su padre"
affects: [08-09, 08-14, 08-18, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "La transcripción del copy la hace un script que lee copy-servicios.json y serializa el módulo, igual que en 08-05, 08-06 y 08-07"
    - "La posición del banner puede caer entre subsecciones de nivel 3 cuando ninguna frontera de nivel 2 entra en la ventana de POS-01"

key-files:
  created: []
  modified:
    - src/content/service-pages/ortopedia-infantil.ts
    - src/content/service-pages/index.ts
    - src/app/servicios/[slug]/page.tsx

key-decisions:
  - "El banner se ancló en que-se-atiende--como-se-le-llama-al-ortopedista-de-ninos y no en ninguno de los dos candidatos que 08-06 proyectó: medidos sobre el build real dan 19.7 y 31.2 por ciento, y este da 23.5, que es el que más margen deja contra los dos bordes de la ventana"
  - "La resolución de bannerAfterSectionId se extendió a nivel 3 en vez de reordenar el contenido: el problema es de la plantilla y no del texto aprobado"
  - "La transcripción salió de copy-servicios.json y no del Markdown del paquete: el Markdown intercala la línea de estado de la ronda de revisión y el JSON no la tiene"
  - "outboundLinks queda sin poblar aunque el dataset ya trae enlacesPropuestos para esta URL: el plan asigna los enlaces internos de las 16 URLs a 08-18, de una sola vez"

requirements-completed: [SVC-04]

coverage:
  - id: D1
    description: "Un padre que busca ortopedia infantil en Lima encuentra la página de servicio aprobada del paquete de v1.2, no la guía clínica de v1.0"
    requirement: SVC-04
    verification:
      - kind: integration
        ref: "20 secciones (5 de nivel 2, 15 de nivel 3) con id, título y párrafos idénticos a copy-servicios.json; 1814 palabras de cuerpo contra el mínimo de 1400 del criterio"
        status: pass
    human_judgment: false
  - id: D2
    description: "La página declara el formato de página de servicio y su esqueleto de cinco secciones en el orden canónico"
    requirement: SVC-04
    verification:
      - kind: integration
        ref: "format: pagina-de-servicio; los h2 que-se-atiende, como-es-la-consulta, condiciones, donde-se-atiende y como-agendar aparecen en ese orden como destino de ancla, y la tabla de contenidos lista esas cinco entradas y ninguna más"
        status: pass
    human_judgment: false
  - id: D3
    description: "El texto publicado es literal el del paquete que el doctor aprobó"
    requirement: SVC-04
    verification:
      - kind: integration
        ref: "Las 67 cadenas del dataset (20 títulos y 47 párrafos) aparecen literales en el HTML prerenderizado, 0 faltantes; autorización en 15-APROBACION-DOCTOR.md del 2026-08-13"
        status: pass
    human_judgment: true
    rationale: "Que la página se lea bien de corrido con trece subsecciones colgando del primer h2 es juicio visual. El texto es verbatim y el esqueleto es el que el paquete redactó"
  - id: D4
    description: "Ningún andamiaje del generador de v1.2 llega al HTML publicado"
    requirement: SVC-04
    verification:
      - kind: integration
        ref: "grep de 'Pendiente de aprobación' y de 'pendiente-doctor' devuelve 0 sobre el módulo y 0 sobre el HTML"
        status: pass
    human_judgment: false
  - id: D5
    description: "El banner de conversión cae dentro de la ventana de POS-01 con margen por los dos lados"
    verification:
      - kind: integration
        ref: "23.5 por ciento del cuerpo medido sobre el build; las otras tres guías sin cambio en 15.8, 18.4 y 25.1"
        status: pass
    human_judgment: false
  - id: D6
    description: "Ningún dato operativo de sede sin confirmar entra en la página"
    verification:
      - kind: integration
        ref: "Los diez pendientes del handoff son piso, consultorio, seguros aceptados, estacionamiento y precio. El copy no nombra ninguno: menciona las cuatro sedes vigentes y dice que la evaluación es posible como consulta particular, sin afirmar qué seguro atiende ninguna sede"
        status: pass
    human_judgment: true
    rationale: "Es una lectura del texto contra la tabla del handoff, no una comprobación mecánica"
  - id: D7
    description: "Las ocho rutas del manifiesto siguen pasando la puerta"
    verification:
      - kind: integration
        ref: "npx tsc --noEmit, npm run lint y npm run build en 0; check-content.mjs sin fallas en 8 rutas; check-sedes.mjs sin fallas en 4 sedes"
        status: pass
    human_judgment: false

duration: 27min
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 08: Página de servicio de ortopedia infantil Summary

**`/servicios/ortopedia-infantil` deja de ser una guía clínica y pasa a ser la primera página de servicio del sitio, con las 20 secciones del paquete on-page de v1.2 y 1814 palabras de cuerpo, a costa de abrir la posición del banner de conversión a las subsecciones de nivel 3: en este formato ninguna frontera de nivel 2 cae dentro de la ventana que POS-01 exige.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 27 min |
| Tareas | 1 de 1 |
| Commits | 1 de código, 1 de documentación |
| Archivos modificados | 3 |
| Palabras de cuerpo | 1814 |

## Qué se construyó

De las cuatro páginas del silo, esta es la única que no se convierte en guía clínica. La SERP medida de Lima para `ortopedia infantil lima` no está llena de guías: el padre que busca quiere saber a quién llevar a su hijo, no leer sobre una condición. El paquete la redactó con el esqueleto de página de servicio y así se publicó.

El módulo se reescribió entero con el copy que el doctor aprobó por escrito el 2026-08-13 (`15-APROBACION-DOCTOR.md`, los 225 bloques clínicos de las 16 páginas, sin correcciones pendientes). Pasa de las 13 secciones del esqueleto de v1.0 a las 20 del paquete: cinco `h2` en el orden canónico del formato (`que-se-atiende`, `como-es-la-consulta`, `condiciones`, `donde-se-atiende`, `como-agendar`) y quince `h3`. Trece de esos quince cuelgan de `que-se-atiende` y son los que cubren las cuatro preguntas, las cinco secundarias y las ocho búsquedas relacionadas que la SERP devolvió.

La transcripción no se hizo a mano. Un script leyó `seo-tools/data/copy-servicios.json`, tomó `clave`, `nivel`, `titulo` y `parrafos` de cada sección y serializó el módulo. Es la misma decisión de 08-05, 08-06 y 08-07 y por la misma razón. La fuente es el JSON y no el Markdown del paquete, porque el generador de v1.2 intercala en el Markdown la línea de estado de la ronda de revisión, que es andamiaje del proceso y no copy: partiendo del JSON, ese sello no puede filtrarse ni por descuido. Después se comprobó al revés, contra el HTML: las 67 cadenas del dataset (20 títulos y 47 párrafos) aparecen literales, sin una sola diferencia.

Lo que no es cuerpo se conservó: `heroLead`, `cardSummary`, `conditionName`, `alternateNames`, `describesSurgery`, `relatedPosts` y `ctaBanner`. `h1` sí se actualizó al valor del paquete, "Ortopedia infantil: la consulta del niño", porque los planes de la fase 10 declaran ese campo territorio de la fase 8 y un cuerpo reescrito bajo el encabezado viejo deja la página incoherente. `title` y `description` quedaron intactos: los reescribe la fase 10. `updatedAt` pasó a `2026-08-13`.

`outboundLinks` sigue vacío. El dataset ya trae `enlacesPropuestos` con las siete entradas de la matriz para esta URL, pero el plan asigna a 08-18 escribir los enlaces internos de las 16 páginas de una sola vez, y esa es la razón por la que acá no se tocan.

## El dato operativo que el copy roza y no publica

El plan obliga a detenerse si algún párrafo trae uno de los diez datos de sede que el handoff dejó sin confirmar: piso, número de consultorio, seguros aceptados, estacionamiento y precio. Ninguno aparece. El texto nombra las cuatro sedes vigentes, que salen de `src/content/locations.ts` y están permitidas, y la sección más cercana al límite, "Si tu seguro te atiende en otra clínica", está redactada justamente al revés de lo que estaría prohibido: no afirma qué seguro atiende cada sede, dice que si el plan obliga a otra clínica la evaluación sigue siendo posible como consulta particular. No hubo que detener nada.

## Desviaciones del plan

**1. [Regla 2 - Funcionalidad crítica faltante] `bannerAfterSectionId` tuvo que aprender a resolver ids de nivel 3**

- **Encontrado en:** previsto por 08-06 y confirmado en la primera medición de esta página.
- **Problema:** la resolución que 08-06 dejó busca el id entre los grupos de nivel 2, así que solo admite fronteras de nivel 2. En este formato eso no alcanza. `que-se-atiende` cuelga trece subsecciones y cierra recién en el 69.9 por ciento del cuerpo; el default (`index === 1`, después del segundo `h2` y todas sus hijas) cae en el 76.1. Las únicas dos posiciones de nivel 2 disponibles son 13.3 y 76.1, y las dos quedan fuera de la ventana de 15 a 35 que exige POS-01. No hay arreglo posible dentro del archivo de datos: reordenar secciones para fabricar una frontera de nivel 2 en el primer tercio reescribe el esqueleto aprobado.
- **Arreglo:** cuando el id declarado no corresponde a ninguna sección de nivel 2, la plantilla lo busca entre las hijas y renderiza el banner dentro del `<section>` del padre, detrás de esa subsección. El default y el camino de nivel 2 quedan idénticos, así que las otras tres páginas no cambiaron: 15.8, 18.4 y 25.1, los mismos números de antes.
- **Por qué es Regla 2 y no una violación de `files_modified`:** es la misma capacidad que 08-06 entregó en su propia desviación y que `08-09-PLAN.md` planifica absorber en la ola 3. El orden real de dependencia la pone acá: sin ella, esta página no puede pasar su propia puerta. La extensión estaba pre-aprobada por el orquestador antes de empezar.
- **Archivos:** `src/content/service-pages/index.ts`, `src/app/servicios/[slug]/page.tsx`
- **Commit:** `7f199ec`

## Dónde quedó el banner y por qué ahí

08-06 proyectó dos candidatos con su modelo calibrado, 18.9 y 28.0 por ciento. Medidos sobre el build real dan 19.7 y 31.2. Se probó un tercero que el modelo no había señalado, `que-se-atiende--como-se-le-llama-al-ortopedista-de-ninos`, y da **23.5 por ciento**: 8.5 puntos de margen contra el piso de 15 y 11.5 contra el techo de 35, el mejor de los tres por los dos lados. Es el que quedó declarado.

Importa porque esta página va a crecer. 08-18 le agrega el bloque de enlaces internos al pie y la fase 10 toca metadatos; texto sumado al final del cuerpo empuja el ratio hacia abajo y texto sumado arriba lo empuja hacia arriba. Con 8.5 puntos de colchón por el lado más ajustado, ninguno de los dos movimientos previstos la saca de la ventana.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run lint` | sin avisos |
| `npm run build` | verde, 21 rutas |
| `node scripts/check-content.mjs` | sin fallas en 8 rutas |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| Palabras de cuerpo de la ruta | 1814, contra el mínimo de 1400 del criterio |
| Secciones del módulo | 20: 5 con `level: 2` y 15 con `level: 3`, en el orden del paquete |
| `grep -c 'format: "pagina-de-servicio"'` | 1 |
| Ids con ancla en el HTML | los 20, con `id` y `tabindex="-1"` |
| Tabla de contenidos | cinco entradas, una por `h2` canónico, en el orden de la tupla |
| Transcripción verbatim | 67 de 67 cadenas del dataset presentes en el HTML |
| `grep -c "Pendiente de aprobación"` sobre módulo y HTML | 0 y 0 |
| `h1`, `title` y `description` | `h1` es el del paquete; `title` y `description` sin tocar |
| Ratio del banner | 23.5 por ciento |
| Ratio de las otras tres guías | 15.8, 18.4 y 25.1, sin cambio |
| `git diff --cached --name-only` | los 3 archivos: el módulo y los dos de la desviación documentada |

La puerta no reportó porcentaje, cifra en soles ni construcción en primera persona, ni sobre el HTML ni sobre el archivo de datos.

## Known Stubs

Ninguno. La página no tiene ningún hueco pendiente de dato.

`outboundLinks` sigue vacío, pero no es un stub: el plan lo declara explícitamente fuera de alcance y asigna los enlaces internos de las 16 URLs a 08-18.

## Self-Check: PASSED

`src/content/service-pages/ortopedia-infantil.ts`, `src/content/service-pages/index.ts` y `src/app/servicios/[slug]/page.tsx` existen en disco con los cambios, y el commit `7f199ec` está en `git log`.
