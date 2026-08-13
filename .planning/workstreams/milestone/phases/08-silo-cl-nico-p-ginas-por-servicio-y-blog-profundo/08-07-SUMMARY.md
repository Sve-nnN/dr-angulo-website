---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 07
subsystem: contenido-clinico
tags: [contenido, ymyl, guia-clinica, paquete-on-page, absorcion-de-post, enlazado-interno, pos-01]

requires:
  - phase: 08-05
    provides: ServicePage con secciones planas de nivel 2 y 3, format y outboundLinks
  - phase: 08-06
    provides: ServicePage.bannerAfterSectionId y su resolución en la plantilla
  - phase: 15 (workstream seo-keywords, v1.2)
    provides: copy aprobado de /servicios/estenosis-espinal e internal-links.json
provides:
  - "/servicios/estenosis-espinal con las 18 secciones del paquete de v1.2, 2723 palabras de cuerpo"
  - "Los ocho destinos de la tabla de absorción del post estenosis-espinal-que-es, vivos como ancla"
  - "outboundLinks con los ocho enlaces de la matriz para el cluster de estenosis espinal"
affects: [08-13 (301 del post absorbido), 08-14, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "La transcripción del copy la hace un script que lee copy-guias.json y serializa el módulo, igual que en 08-05 y 08-06"
    - "bannerAfterSectionId se declara aunque el default pase la puerta, para no dejar la página a dos puntos del techo de POS-01"

key-files:
  created: []
  modified:
    - src/content/service-pages/estenosis-espinal.ts

key-decisions:
  - "Se declaró bannerAfterSectionId: que-es aunque el default ya pasaba en 32.8 por ciento. Con el default la página queda a 2.2 puntos del techo de 35 y cualquier párrafo que un plan posterior agregue al final la rompe; declarando que-es cae en 18.4 y tiene margen por los dos lados"
  - "La transcripción salió de copy-guias.json y no del Markdown del paquete: el Markdown intercala la línea de estado de la ronda de revisión y el JSON no la tiene, así que el sello no puede filtrarse ni por descuido"
  - "relatedPosts sigue apuntando a estenosis-espinal-que-es. El plan lo declara intocable y quien apaga ese post es 08-13, que es el plan que tiene que resolver la referencia"
  - "No se inventaron items: el paquete es prosa y partir en tarjetas un párrafo aprobado como párrafo lo reescribe. La página pierde las tarjetas de síntomas, complicaciones, diagnóstico y recuperación que dibujaba v1.0"

requirements-completed: [SVC-02]

coverage:
  - id: D1
    description: "Quien busca estenosis espinal en Lima encuentra la guía clínica aprobada del paquete de v1.2, no el texto de v1.0"
    requirement: SVC-02
    verification:
      - kind: integration
        ref: "18 secciones (8 de nivel 2, 10 de nivel 3) con id, título y párrafos idénticos a copy-guias.json; 2723 palabras de cuerpo contra el mínimo de 2300 del criterio"
        status: pass
    human_judgment: false
  - id: D2
    description: "El contenido del post que 08-13 va a redirigir ya vive dentro de la guía"
    requirement: SVC-02
    verification:
      - kind: integration
        ref: "Los ocho destinos del arreglo absorbe existen en el HTML prerenderizado con id y tabindex=-1; la novena fila es la de las remisiones a la guía completa, que el propio dataset declara no transcribible"
        status: pass
    human_judgment: false
  - id: D3
    description: "Ningún sello de revisión interna del generador de v1.2 llega al HTML publicado"
    requirement: SVC-02
    verification:
      - kind: integration
        ref: "grep de 'Pendiente de aprobación' y de 'pendiente-doctor' sobre el módulo devuelve 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "El banner de conversión cae dentro de la ventana de POS-01 con margen"
    verification:
      - kind: integration
        ref: "18.4 por ciento del cuerpo con bannerAfterSectionId: que-es, contra 32.8 que daba el default; las otras tres guías sin cambio en 15.8, 25.1 y 23.1"
        status: pass
    human_judgment: false
  - id: D5
    description: "Las ocho rutas del manifiesto siguen pasando la puerta y las otras tres guías no cambiaron"
    verification:
      - kind: integration
        ref: "npx tsc --noEmit, npm run lint y npm run build en 0; check-content.mjs sin fallas en 8 rutas; check-sedes.mjs sin fallas en 4 sedes; un solo archivo en el diff"
        status: pass
    human_judgment: false
  - id: D6
    description: "El texto publicado es el que el doctor aprobó"
    verification:
      - kind: integration
        ref: "Serialización mecánica desde copy-guias.json más una comprobación posterior de que las 57 cadenas de párrafo y los 18 títulos aparecen literales en el módulo; autorización en 15-APROBACION-DOCTOR.md del 2026-08-13"
        status: pass
    human_judgment: true
    rationale: "Que la guía se lea bien de corrido sin las tarjetas que dibujaba v1.0 es juicio visual. El texto es verbatim; el envoltorio cambió de tarjetas a prosa porque el paquete es prosa"

duration: 24min
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 07: Guía aprobada de estenosis espinal Summary

**`/servicios/estenosis-espinal` publica las 18 secciones del paquete on-page de v1.2 con 2723 palabras de cuerpo, absorbe adentro los ocho bloques del post que la fase apaga y declara la posición del banner que 08-06 dejó disponible, para no quedarse a dos puntos del techo de POS-01.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 24 min |
| Tareas | 1 de 1 |
| Commits | 1 de código, 1 de documentación |
| Archivos modificados | 1 |
| Palabras de cuerpo | 2723 (antes 1993) |

## Qué se construyó

El módulo de datos de estenosis espinal se reescribió entero con el copy que el doctor aprobó por escrito el 2026-08-13 (`15-APROBACION-DOCTOR.md`, los 225 bloques clínicos de las 16 páginas, sin correcciones pendientes). Pasa de las 13 secciones del esqueleto de v1.0 a las 18 del paquete: los ocho `h2` canónicos en su orden (`que-es`, `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes`, `cuando-consultar`) y diez `h3` colgando de ellos, seis de los cuales cuelgan de `sin-operar` y son los que sostienen los anchors que la matriz de enlazado apunta hacia esta URL.

De las cuatro guías del silo, esta era la que la SERP obligaba con más claridad: los ocho orgánicos medidos en Lima son guía clínica y no página de servicio, y el paquete la redactó como guía.

La transcripción no se hizo a mano. Un script leyó `seo-tools/data/copy-guias.json`, tomó `clave`, `nivel`, `titulo` y `parrafos` de cada sección y serializó el módulo, que es la misma decisión de 08-05 y 08-06 y por la misma razón. La fuente es el JSON y no el Markdown del paquete: el generador de v1.2 intercala en el Markdown una línea de estado de la ronda de revisión, andamiaje del proceso y no copy, y partiendo del JSON ese sello no puede filtrarse ni por descuido. Después de generar se comprobó al revés: las 57 cadenas de párrafo y los 18 títulos del dataset aparecen literales en el archivo, sin una sola diferencia.

Lo que no es cuerpo se conservó: `heroLead`, `cardSummary`, `conditionName`, `alternateNames`, `describesSurgery`, `relatedPosts` y `ctaBanner`. `h1` sí se actualizó al valor del paquete, "Estenosis espinal: el canal que se estrecha", porque un cuerpo reescrito bajo el encabezado viejo deja la página incoherente y los planes de la fase 10 declaran que ese campo es territorio de la fase 8. `title` y `description` quedaron intactos: los reescribe la fase 10. `updatedAt` pasó a `2026-08-13`.

`outboundLinks` se pobló con las ocho entradas de `seo-tools/data/internal-links.json` para esta URL, con su `href` y su `anchor` literales, porque son anchors de keyword y no de navegación (D-15): dos guías hermanas, cuatro fichas de sede, `/agendar` y el hub. Uno de esos destinos todavía no existe, `/servicios/escoliosis-y-deformidades`, que llega en 08-15; quien verifica que las ocho resuelvan es 08-14.

## La tabla de absorción, fila por fila

El arreglo `absorbe` del dataset declara nueve filas. Ocho tienen destino vivo y una no se transcribe por decisión del propio documento. Verificadas contra el HTML prerenderizado, todas con `id` y `tabindex="-1"`:

| Bloque del post `estenosis-espinal-que-es` | Destino declarado | En el HTML |
|---|---|---|
| intro | `que-es` | presente |
| `por-que-aparece-con-la-edad` | `causas` | presente |
| `la-senal-que-mas-orienta` | `sintomas` | presente |
| `como-se-siente-en-el-dia-a-dia` | `sintomas` | presente |
| `que-se-pregunta-en-la-consulta` | `diagnostico` | presente |
| `que-registrar-antes-de-la-cita` | `sin-operar--estenosis-espinal-cuidado-personal` y `cuando-consultar` | los dos presentes |
| `como-se-trata` | `sin-operar` y `sin-operar--tratamientos-de-la-estenosis-espinal` | los dos presentes |
| `ctaBanner` sobre caminar menos que antes | `cuando-consultar` | presente |
| remisiones a la guía completa, dos veces | no se transcriben | correcto: la guía completa pasa a ser esta página y la remisión pierde destino. `grep "guía completa"` sobre el HTML devuelve 0 |

Ninguno falta, que es la condición que el 301 del plan 08-13 necesita antes de enterrar el post.

## Decisiones

**El banner se declaró aunque no hiciera falta.** 08-06 midió esta página contra su modelo y proyectó 32.8 por ciento con el default (`index === 1`, después del segundo `h2` y de todas sus hijas). Eso pasa la ventana de 15 a 35 de POS-01, pero por 2.2 puntos: cualquier párrafo que un plan posterior agregue al final del cuerpo la saca por arriba. Declarando `bannerAfterSectionId: "que-es"` el banner cae en **18.4 por ciento**, medido sobre el HTML real, exactamente lo que 08-06 predijo. Es robustez, no un arreglo: la puerta nunca llegó a fallar acá.

**No se inventaron `items`.** El paquete es prosa y ninguna sección trae la estructura de rótulo y cuerpo que alimenta a `ServiceItemGrid`. La página pierde las cuatro tarjetas de síntomas, las cuatro de complicaciones, los cuatro pasos de diagnóstico y las tres etapas de recuperación que dibujaba v1.0, y queda más larga y más plana. El único tratamiento visual que sobrevive es el de `cuando-consultar`, que la plantilla sigue dibujando como alerta.

**Las secciones `complicaciones` y `recuperacion` desaparecieron y no se rescataron.** El esqueleto del paquete no las tiene. El material de complicaciones vive repartido en `que-es--que-tan-peligrosa-es-la-estenosis` y en `cuando-consultar`, las dos dentro del texto aprobado. El de recuperación no tiene equivalente en el paquete y el paquete es lo aprobado.

**`relatedPosts` sigue apuntando a `estenosis-espinal-que-es`.** El plan lo declara intocable. Es el post que 08-13 va a redirigir hacia esta misma página, así que la referencia la resuelve ese plan y no este.

## Desviaciones del plan

Ninguna. El plan se ejecutó tal como está escrito, incluida la indicación del orquestador de declarar `bannerAfterSectionId`, que forma parte de lo que 08-06 dejó dicho para esta ola.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run lint` | sin avisos |
| `npm run build` | verde, 21 rutas |
| `node scripts/check-content.mjs` | sin fallas en 8 rutas |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| Palabras de cuerpo de la ruta | 2723, contra el mínimo de 2300 del criterio |
| Secciones del módulo | 18: 8 con `level: 2` y 10 con `level: 3`, en el orden del paquete |
| `grep -c "Pendiente de aprobación"` sobre el módulo | 0 |
| `grep -c 'id: "sin-operar--estenosis-espinal-cuidado-personal"'` | 1 |
| Destinos de la tabla de absorción en el HTML | los 8 presentes con `id` y `tabindex="-1"` |
| Transcripción verbatim | 57 párrafos y 18 títulos del dataset presentes literales, 0 faltantes |
| `outboundLinks` | 8 entradas, anchors literales de `internal-links.json` |
| `h1`, `title` y `description` | `h1` es el del dataset; `title` y `description` sin tocar |
| Ratio del banner | 18.4 por ciento (con el default habría sido 32.8) |
| Ratio de las otras tres guías | 15.8, 25.1 y 23.1, sin cambio |
| `git diff --name-only` | un solo archivo |

Sin cifras prohibidas: la puerta no reportó porcentaje, cifra en soles ni construcción en primera persona sobre el cuerpo prerenderizado ni sobre el archivo de datos.

## Known Stubs

Ninguno. La página no tiene ningún hueco pendiente de dato.

Uno de los ocho `outboundLinks` apunta a una ruta que todavía no existe, `/servicios/escoliosis-y-deformidades`, que llega en 08-15. No es un stub: el protocolo de transcripción del plan lo declara y asigna a 08-14 la verificación de que las ocho resuelvan cuando estén vivas todas las URLs de la fase.

## Self-Check: PASSED

`src/content/service-pages/estenosis-espinal.ts` existe en disco con los cambios y el commit `33b5a3b` está en `git log`.
