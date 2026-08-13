---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 06
subsystem: contenido-clinico
tags: [contenido, ymyl, guia-clinica, paquete-on-page, absorcion-de-post, enlazado-interno, pos-01]

requires:
  - phase: 08-05
    provides: ServicePage con secciones planas de nivel 2 y 3, format y outboundLinks
  - phase: 15 (workstream seo-keywords, v1.2)
    provides: copy aprobado de /servicios/hernia-discal e internal-links.json
provides:
  - "/servicios/hernia-discal con las 20 secciones del paquete de v1.2, 2808 palabras de cuerpo"
  - "Los tres ids de destino de la tabla de absorción del post que la fase apaga"
  - "outboundLinks poblado por primera vez en el sitio: ocho enlaces con anchors de keyword"
  - "ServicePage.bannerAfterSectionId: la posición del banner de conversión pasa a ser dato de la página"
affects: [08-07, 08-08, 08-09, 08-14, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "La transcripción del copy la hace un script que lee copy-guias.json y serializa el módulo, no una persona: 2591 palabras de prosa clínica no se copian a mano sin drift"
    - "La posición del banner de conversión se declara por id de sección en los datos, con default intacto para quien no lo declara"

key-files:
  created: []
  modified:
    - src/content/service-pages/hernia-discal.ts
    - src/content/service-pages/index.ts
    - src/app/servicios/[slug]/page.tsx

key-decisions:
  - "La transcripción se hizo desde copy-guias.json con un script, no desde el Markdown del paquete: el Markdown intercala la línea de estado de la ronda de revisión y el JSON no la tiene, así que el sello no puede filtrarse ni por descuido"
  - "La posición del banner deja de ser la constante index === 1 de la plantilla y pasa a ser bannerAfterSectionId en los datos. El esqueleto de v1.2 cuelga cuatro subsecciones de sintomas y el punto por defecto se corría al 39.2 por ciento del cuerpo, fuera de la ventana de POS-01"
  - "No se inventaron items a partir del texto aprobado. La página queda más plana que la versión de v1.0 porque el paquete es prosa, y partir en tarjetas un párrafo que el doctor aprobó como párrafo lo reescribe"

requirements-completed: [SVC-01]

coverage:
  - id: D1
    description: "Un paciente que abre /servicios/hernia-discal lee la guía aprobada del paquete de v1.2, no el texto de v1.0"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "20 secciones (8 de nivel 2, 12 de nivel 3) con id y texto idénticos a copy-guias.json; 2808 palabras de cuerpo contra el mínimo de 2400 del criterio"
        status: pass
    human_judgment: false
  - id: D2
    description: "La guía contiene, adentro, todo el material del post que la fase apaga después"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "Los tres destinos del arreglo absorbe existen en el HTML prerenderizado: sintomas--diferencia-entre-lumbalgia-y-hernia-discal, sintomas y cuando-consultar"
        status: pass
    human_judgment: false
  - id: D3
    description: "Ningún sello de revisión interna del generador de v1.2 llega al HTML publicado"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "grep de 'Pendiente de aprobación' y de 'pendiente-doctor' sobre el módulo devuelve 0; la transcripción parte del JSON, donde esas líneas no existen"
        status: pass
    human_judgment: false
  - id: D4
    description: "Los enlaces internos de la matriz de la fase 14 quedan escritos con sus anchors literales"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "outboundLinks con las ocho entradas de internal-links.json: dos guías hermanas, cuatro sedes, /agendar y el hub"
        status: pass
    human_judgment: false
  - id: D5
    description: "Las ocho rutas del manifiesto siguen pasando la puerta y las otras tres guías no cambiaron"
    verification:
      - kind: integration
        ref: "npx tsc --noEmit, npm run lint y npm run build en 0; check-content.mjs sin fallas en 8 rutas; check-sedes.mjs sin fallas en 4 sedes; el ratio del banner de las otras tres guías queda en 25.4, 25.1 y 23.1, idéntico a antes"
        status: pass
    human_judgment: false
  - id: D6
    description: "El texto publicado es el que el doctor aprobó"
    verification:
      - kind: integration
        ref: "Serialización mecánica desde copy-guias.json, sin intervención manual sobre ninguna cadena; autorización en 15-APROBACION-DOCTOR.md del 2026-08-13"
        status: pass
    human_judgment: true
    rationale: "Que la lectura corrida de la página se sienta bien sin las tarjetas de síntomas que dibujaba v1.0 es juicio visual. El texto es verbatim; el envoltorio cambió de tarjetas a prosa porque el paquete es prosa"

duration: 41min
completed: 2026-08-13
status: complete
---

# Phase 8 Plan 06: Guía aprobada de hernia discal Summary

**`/servicios/hernia-discal` publica las 20 secciones del paquete on-page de v1.2 con 2808 palabras de cuerpo, absorbe adentro el material del post que la fase apaga y estrena `outboundLinks` con los ocho enlaces de la matriz, a costa de un hallazgo que no estaba previsto: el banner de conversión ya no cabía donde la plantilla lo tenía cableado.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 41 min |
| Tareas | 1 de 1 |
| Commits | 1 de código, 1 de documentación |
| Archivos modificados | 3 |
| Palabras de cuerpo | 2808 (antes 1936) |

## Qué se construyó

El módulo de datos de hernia discal se reescribió entero con el copy que el doctor aprobó por escrito el 2026-08-13 (`15-APROBACION-DOCTOR.md`, los 225 bloques clínicos de las 16 páginas, sin correcciones pendientes). Pasa de las 12 secciones del esqueleto de v1.0 a las 20 del paquete: 8 de nivel 2 (`que-es`, `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes`, `cuando-consultar`) y 12 de nivel 3 colgando de ellas.

La transcripción no se hizo a mano. Un script leyó `seo-tools/data/copy-guias.json`, tomó `clave`, `nivel`, `titulo` y `parrafos` de cada sección y serializó el módulo. Es la misma decisión que tomó 08-05 y por la misma razón: 2591 palabras de prosa clínica copiadas a mano son la vía más directa de introducir un cambio de texto que nadie nota. La fuente es el JSON y no el Markdown del paquete, porque el generador de v1.2 intercala en el Markdown una línea de estado de la ronda de revisión que es andamiaje del proceso y no copy. Partiendo del JSON, ese sello no puede filtrarse ni por descuido.

Lo que no es cuerpo se conservó: `heroLead`, `cardSummary`, `conditionName`, `alternateNames` y `ctaBanner`. `h1` ya coincidía con el valor del paquete. `title` y `description` quedaron intactos, que es lo que reescribe la fase 10. `updatedAt` pasó a `2026-08-13` y `relatedPosts` dejó de listar `hernia-discal-o-dolor-de-espalda-como-diferenciarlos`, el post que esta fase apaga.

`outboundLinks` se estrena acá: nació en 08-05 declarado y renderizado, sin ninguna página que lo usara. Las ocho entradas salen de `seo-tools/data/internal-links.json` con su `href` y su `anchor` literales, porque son anchors de keyword y no de navegación (D-15). Dos apuntan a guías hermanas, cuatro a fichas de sede, una a `/agendar` y una al hub. Tres de esos destinos todavía no existen: `/servicios/escoliosis-y-deformidades` llega en 08-15 y las fichas de sede resuelven ya. Quien verifica que las ocho resuelvan es 08-14.

La absorción quedó comprobada contra el arreglo `absorbe` del JSON: los tres destinos que declaran sus siete filas (`sintomas--diferencia-entre-lumbalgia-y-hernia-discal`, `sintomas` y `cuando-consultar`) existen en el HTML prerenderizado como destino de ancla. La sección de la diferencia entre lumbalgia y hernia discal es la que se lleva el grueso, incluidas las cuatro preguntas que ordenan un dolor de espalda, que era lo mejor del post.

## Decisiones

**El banner de conversión dejó de vivir en la plantilla.** Es el hallazgo del plan y se detalla abajo.

**No se inventaron `items`.** Las secciones del paquete son prosa: ninguna trae la estructura de rótulo y cuerpo que alimentaba a `ServiceItemGrid`. La página perdió las tarjetas de síntomas y de complicaciones que dibujaba v1.0 y quedó más larga y más plana. Partir en tarjetas un párrafo que el doctor aprobó como párrafo es reescribirlo, y el único tratamiento visual que sobrevive es el de `cuando-consultar`, que la plantilla sigue dibujando como alerta.

**La sección `complicaciones` desapareció y no se rescató.** El esqueleto del paquete no la tiene. Su material vive repartido en `cuando-consultar` y en la pregunta frecuente sobre qué pasa si se deja sin tratar, ambas dentro del texto aprobado.

## Desviaciones del plan

**1. [Regla 2 - Funcionalidad crítica faltante] La posición del banner tuvo que volverse dato de la página**

- **Encontrado en:** Task 1, al correr la puerta por primera vez.
- **Problema:** `src/app/servicios/[slug]/page.tsx` tenía la posición del banner cableada en `index === 1`, es decir después del segundo `h2` y de todas sus hijas. Con el esqueleto de v1.0 eso daba 25.4 por ciento del cuerpo. En el paquete de v1.2, `sintomas` cuelga cuatro subsecciones de nivel 3 y el punto de inserción se corre al **39.2 por ciento**, fuera de la ventana de 15 a 35 que exige POS-01. La puerta falló. No había arreglo posible dentro de `hernia-discal.ts`: reordenar secciones habría violado el protocolo de transcripción del propio plan.
- **Arreglo:** `ServicePage` suma `bannerAfterSectionId?: string`, la plantilla resuelve ese id contra los grupos de nivel 2 y usa `index === 1` cuando la página no lo declara. `hernia-discal.ts` declara `"que-es"` y el banner cae en **15.8 por ciento**. Las otras tres guías no declaran nada y su ratio quedó idéntico: 25.4, 25.1 y 23.1.
- **Por qué es Regla 2 y no una violación de `files_modified`:** es exactamente la capacidad que `08-09-PLAN.md:79` planifica entregar en la ola 3 ("una prop opcional para insertar el banner del primer tercio después de la sección número N, porque la posición que POS-01 pide cambia entre los dos formatos"). El orden real de dependencia la pone antes: los planes de contenido de la ola 2 la necesitan para poder pasar su propia puerta. 08-09 la absorbe después dentro de la prop de `ContentBody`.
- **Archivos:** `src/content/service-pages/index.ts`, `src/app/servicios/[slug]/page.tsx`
- **Aprobación:** consultado al orquestador como checkpoint de decisión antes de tocar nada; opción A aprobada.
- **Commit:** `be07cdb`

## Margen del banner, y lo que hereda la ola 2

`/servicios/hernia-discal` pasa la puerta en **15.8 por ciento**, dentro de la ventana pero con 0.8 puntos de margen contra el piso de 15. Es la posición disponible, no una elegida con holgura: las únicas dos posiciones de nivel 2 posibles en esta página son 15.8 y 39.2. Si un plan posterior agrega texto a `que-es` o a sus dos hijas, el ratio sube y el margen mejora; si agrega texto al final de la página, baja y puede romper la puerta. Vale tenerlo presente en 08-14, que vuelve a tocar el silo de hernia discal.

Proyección para los dos planes de contenido de servicio que faltan en la ola 2, calculada sobre sus datasets con el modelo calibrado contra esta página (predijo 16.0 contra 15.8 medido):

| Plan | Página | Con el default (`index === 1`) | Qué necesita |
|---|---|---|---|
| 08-07 | `/servicios/estenosis-espinal` | 32.8 por ciento | Pasa con el default, pero a 2.2 puntos del techo. Declarar `que-es` lo lleva a 18.4 y le da margen por los dos lados |
| 08-08 | `/servicios/ortopedia-infantil` | 72.0 por ciento | **Ninguna posición de nivel 2 sirve.** Su primer `h2` cuelga 13 subsecciones y ya cierra en 65.9 por ciento |

El caso de ortopedia infantil es un problema abierto que este plan no resuelve. En el esqueleto de página de servicio, el único punto de inserción dentro de la ventana cae **entre subsecciones de nivel 3** de `que-se-atiende`, en algún lugar entre 18.9 y 32.0 por ciento. `bannerAfterSectionId` tal como quedó solo resuelve ids de nivel 2, porque busca dentro de los grupos. 08-08 va a necesitar que la resolución acepte también un id de nivel 3, o que POS-01 se replantee para ese formato. Está reportado al orquestador.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run lint` | sin avisos |
| `npm run build` | verde, 21 rutas |
| `node scripts/check-content.mjs` | sin fallas en 8 rutas |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| Palabras de cuerpo de la ruta | 2808, contra el mínimo de 2400 del criterio |
| Secciones del módulo | 20: 8 con `level: 2` y 12 con `level: 3` |
| `grep -c "Pendiente de aprobación"` sobre el módulo | 0 |
| Ids de la tabla de absorción en el HTML | los 3 presentes con `id` y `tabindex="-1"` |
| `outboundLinks` | 8 entradas, anchors literales de `internal-links.json` |
| `h1`, `title` y `description` | `h1` es el del dataset; `title` y `description` sin tocar |
| Ratio del banner | 15.8 por ciento (antes del arreglo: 39.2) |
| Ratio de las otras tres guías | 25.4, 25.1 y 23.1, sin cambio |

## Known Stubs

Ninguno. La página no tiene ningún hueco pendiente de dato.

Tres de los ocho `outboundLinks` apuntan a rutas que todavía no existen (`/servicios/escoliosis-y-deformidades`, que llega en 08-15). No son stubs: el protocolo de transcripción del plan los declara explícitamente y asigna a 08-14 la verificación de que las ocho resuelvan cuando estén vivas todas las URLs de la fase.

## Self-Check: PASSED

`src/content/service-pages/hernia-discal.ts`, `src/content/service-pages/index.ts` y `src/app/servicios/[slug]/page.tsx` existen en disco con los cambios, y el commit `be07cdb` está en `git log`.
