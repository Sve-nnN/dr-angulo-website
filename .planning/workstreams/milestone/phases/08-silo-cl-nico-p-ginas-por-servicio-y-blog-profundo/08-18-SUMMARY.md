---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 18
subsystem: contenido
tags: [sedes, silo-clinico, on-page, puertas, ymyl]
requires:
  - src/content/location-pages/types.ts
  - src/content/location-pages/index.ts
  - seo-tools/data/copy-sedes.json
provides:
  - /sedes/consultorio-privado
  - /sedes/sanna-la-molina
  - "Las cuatro fichas de sede dentro del MANIFEST de scripts/check-content.mjs"
affects: [08-19, fase 10 title y meta]
tech-stack:
  added: []
  patterns:
    - "Transcripcion mecanica desde el dataset sellado, no desde el Markdown del paquete"
    - "El h1 esperado de la puerta de sedes viaja en el mismo commit que lo cambia"
    - "La posicion del banner se elige por ratio acumulado de palabras, no a ojo"
key-files:
  created: []
  modified:
    - src/content/location-pages/consultorio-privado.ts
    - src/content/location-pages/sanna-la-molina.ts
    - scripts/check-content.mjs
    - scripts/check-sedes.mjs
decisions:
  - "El banner de cada sede se ancla a la seccion cuyo ratio acumulado queda mas cerca del 25 por ciento"
  - "El comentario de SITEMAP_TOTAL se corrigio: ya no dice que las sedes quedan fuera del manifiesto"
metrics:
  duration: 35min
  completed: 2026-08-13
requirements-completed: [SVC-05]
status: complete
---

# Phase 8 Plan 18: las dos sedes que faltaban

**El consultorio privado de Surco y Sanna La Molina publican sus 1673 y 1747 palabras de copy aprobado, el consultorio sigue siendo la única sede que ofrece el chat del doctor, ninguna de las dos afirma uno solo de los seis datos operativos que nadie confirmó, y con estas dos las cuatro fichas de sede quedan bajo la puerta de contenido.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 35 min |
| Tareas | 3 de 3 |
| Commits | 3 |
| Archivos creados | 0 |
| Archivos modificados | 4 |

## Qué se hizo

**Task 1 — el consultorio privado de Surco.** Las 20 secciones salieron de `seo-tools/data/copy-sedes.json`, con el `id` tomado del campo `clave` y los párrafos literales del arreglo `parrafos`: 5 de nivel 2 con las claves del esqueleto en orden y 15 de nivel 3, más los 6 `enlacesPropuestos` convertidos en `outboundLinks`. Ninguna palabra del texto publicado pasó por un teclado. El `h1` pasó a `Consultorio de Surco: la consulta sin intermediarios`, el valor del dataset; `title` y `description` quedaron intactos para la fase 10.

Es la única sede de tipo `consultorio` y su copy lo repite a propósito: la agenda la maneja el doctor y el chat es el canal correcto. La plantilla resuelve esa rama sola con `isOwnOffice`, así que el banner sí lleva WhatsApp acá, y la puerta de sedes confirma sobre el HTML real que el canal aparece exactamente en esta sede y en ninguna de las otras tres.

El bloque de hernia discal sin cirugía se transcribió literal, con los dos lados de la frase intactos: dice que la mayoría mejora sin operar y en el mismo bloque advierte contra los sitios que prometen resolver toda hernia sin cirugía. No se suavizó ninguno de los dos.

**Task 2 — Sanna La Molina.** Mismo trabajo sobre la cuarta sede: 20 secciones, 5 de nivel 2 y 15 de nivel 3, sus 6 salidas de enlazado y el `h1` a `Atención de columna en Sanna La Molina`. Es una sede de tipo clínica, así que su cuerpo no nombra el número del doctor ni ofrece su chat: la agenda va por la central de citas, la app SANNA y la agenda en línea de la red, los tres derivados de `locations.ts` en tiempo de render.

**Task 3 — las cuatro sedes bajo puerta.** Las dos rutas nuevas entraron al `MANIFEST` de `scripts/check-content.mjs` con tipo `sede` y formato `ficha-de-sede`. El esqueleto ya estaba declarado desde el plan 08-17, así que no hubo que tocarlo. `SITEMAP_TOTAL` sigue en 22.

## Datos operativos que siguen pendientes de confirmación

Se transcriben acá porque son material de planificación y no copy: las dos tablas no se publicaron en el sitio. El copy aprobado no afirma ninguno de los seis, y en varios de los casos dice de frente que el dato todavía no está publicado y de quién depende.

### Consultorio privado de Surco

| Dato | Estado en el paquete |
|---|---|
| Estacionamiento del edificio y sus tarifas | pendiente, sin dato publicado. Lo maneja la administración de la torre y no el consultorio |
| Seguros y convenios que el consultorio acepta | pendiente, sin dato publicado. Lo define el consultorio |
| Precio de la consulta | pendiente, sin dato publicado. D-10 prohíbe publicar cifras; el copy explica de qué depende el costo |

### Sanna La Molina

| Dato | Estado en el paquete |
|---|---|
| Piso y número de consultorio dentro del centro clínico | pendiente, sin dato publicado. Lo confirma la clínica |
| Seguros y convenios que la sede acepta para esta consulta | pendiente, sin dato publicado. Lo define la red y cambia con el tiempo |
| Precio de la consulta | pendiente, sin dato publicado. La página remite a la central en vez de dar una cifra |

Ninguno se completó, se dedujo de otra sede ni se redondeó. Con estos seis quedan cerrados los diez pendientes del paquete de sedes: los otros cuatro son de Ricardo Palma y Tezza y están en el SUMMARY del plan 08-17. La salvaguarda de soles y de porcentaje de la puerta de contenido corre sobre el cuerpo de las dos rutas nuevas y pasó.

Las tres preguntas de precio de la SERP del consultorio se responden sin ninguna cifra: el copy explica que el costo depende de la clínica donde se opera, del tiempo de sala, del material, de los días de hospitalización y de lo que cubra el seguro.

## Deviations from Plan

**1. [Regla 3 - Bloqueo] El `h1` nuevo se movió en la puerta dentro del commit que lo cambia**
- **Encontrado en:** Tasks 1 y 2
- **Problema:** el plan pone la actualización del `h1` esperado de `check-sedes.mjs` en la Task 3, pero los commits de las Tasks 1 y 2 habrían quedado con la puerta de sedes en rojo, en un repositorio que despliega desde `main`.
- **Arreglo:** cada línea del `MANIFEST` viajó con el módulo que la rompe. El `title` no se tocó: lo reescribe la fase 10.
- **Archivos:** `scripts/check-sedes.mjs`
- **Commits:** a96e78c, 757b52b

**2. [Regla 1 - Bug] El comentario de `SITEMAP_TOTAL` afirmaba lo contrario de lo que hace el archivo**
- **Encontrado en:** Task 3
- **Problema:** el bloque decía que la puerta de 900 palabras no aplica a las sedes y que ninguna entra al `MANIFEST`. Desde el plan 08-17 eso ya era falso a medias, y con este plan quedó falso del todo: las cuatro entran y las cuatro pasan el mínimo.
- **Arreglo:** el comentario ahora dice lo que sí es cierto y explica por qué el número no se mueve: las cuatro rutas de sede ya existían en el sitemap.
- **Archivos:** `scripts/check-content.mjs`
- **Commit:** 7a9dba5

## Decisiones

**La posición del banner se calculó, no se eligió a ojo.** La puerta exige que el banner caiga entre el 15 y el 35 por ciento del cuerpo, y en el plan 08-17 una de las dos sedes rozó el piso del rango. Acá la sección de anclaje se eligió por ratio acumulado de palabras sobre el arreglo del dataset, tomando la que queda más cerca del 25 por ciento: en el consultorio cayó tras la respuesta sobre los mejores neurocirujanos de Lima, con 23,4 por ciento, y en Sanna tras `como-llegar`, con 24,9. La puerta confirmó las dos posiciones sobre el HTML prerenderizado.

**El `ctaBanner` es texto de esta fase y no del paquete.** El dataset de v1.2 no trae encabezado ni cuerpo de banner, así que los dos se escribieron acá, siguiendo el molde de las dos sedes del plan 08-17: el del consultorio dice que la agenda la maneja el doctor, el de Sanna manda a la central de la clínica. Ninguno de los dos afirma un dato operativo.

## Puertas

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run lint` | limpio |
| `npm run build` | verde |
| `node scripts/check-content.mjs` | sin fallas en 13 rutas, 4 de ellas sedes |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| `node scripts/check-seo.mjs` | sin fallas, 23 rutas revisadas |
| `grep -c "SITEMAP_TOTAL = 22" scripts/check-content.mjs` | 1 |
| `grep -c "Pendiente de aprobación"` en consultorio-privado.ts | 0 |
| `grep -c "964305682\|964 305 682"` en sanna-la-molina.ts | 0 |
| Palabras de cuerpo | 1673 y 1747 |

## Lo que queda de la fase

Con este plan cierran las cuatro fichas de sede y las cinco URLs del paquete que no tenían fase que las recogiera bajan a una. De la fase 8 solo queda abierto el plan 08-19, el de preguntas frecuentes.

## Verificación humana pendiente

Las dos páginas pasaron de unas 400 palabras a más de 1600 y ahora abren con índice y cierran con firma y aviso. Que el índice, el banner y los bloques de datos se lean bien a 375px y a 1440px sigue siendo juicio visual y queda para la ronda de verificación de la fase, junto con las dos sedes del plan 08-17.

## Self-Check: PASSED

Los dos módulos existen en disco con su cuerpo escrito y los tres commits (`a96e78c`, `757b52b`, `7a9dba5`) están en `git log`.
