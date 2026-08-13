---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 19
subsystem: contenido
tags: [faq, silo-clinico, on-page, puertas, ymyl, schema]
requires:
  - src/components/content/content-body.tsx
  - src/content/static-pages/types.ts
  - seo-tools/data/copy-guias.json
provides:
  - /preguntas-frecuentes
  - "El esqueleto guia-clinica declarado en scripts/check-content.mjs"
  - "src/content/faq.ts podado a tres preguntas"
affects: [fase 10 title y meta, ronda de verificacion de la fase 8]
tech-stack:
  added: []
  patterns:
    - "Transcripcion mecanica desde copy-guias.json, el modulo se genera y no se teclea"
    - "El acordeon de v1.0 se poda por comparacion contra el cuerpo nuevo, no se reescribe"
    - "FAQPage se arma con las subsecciones del paquete mas lo que sobrevive del acordeon"
key-files:
  created:
    - src/content/static-pages/preguntas-frecuentes.ts
  modified:
    - src/app/preguntas-frecuentes/page.tsx
    - src/content/faq.ts
    - src/content/static-pages/types.ts
    - scripts/check-content.mjs
decisions:
  - "Siete de las diez preguntas de faq.ts se retiran porque su respuesta ya vive en el cuerpo aprobado"
  - "El acordeon sobrevive con tres preguntas y se queda debajo del cuerpo, no dentro de el"
  - "El esqueleto guia-clinica se declara ahora en la puerta: existia como formato pero no tenia claves"
metrics:
  duration: 40min
  completed: 2026-08-13
requirements-completed: [SVC-05]
status: complete
---

# Phase 8 Plan 19: la guía clínica de /preguntas-frecuentes

**La URL deja de ser un acordeón de preguntas cortas y publica las 1828 palabras aprobadas del paquete sobre la duda de reumatólogo o traumatólogo, con 2183 palabras de cuerpo medido, un solo h1, el marcado FAQPage reconstruido con siete preguntas, y el acordeón viejo podado de diez a tres para que la página no responda dos veces lo mismo.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 40 min |
| Tareas | 2 de 2 |
| Palabras de cuerpo medido | 2183 |
| Secciones publicadas | 19 (8 de nivel 2, 11 de nivel 3) |
| Preguntas en el FAQPage | 7 |

## Qué se hizo

`src/content/static-pages/preguntas-frecuentes.ts` transcribe las 19 secciones del objeto
`/preguntas-frecuentes` de `seo-tools/data/copy-guias.json`. El módulo se generó con un script
desde el dataset y no se tecleó a mano, que es el mismo protocolo del plan 08-06: los `id` salen
del campo `clave` literal y los párrafos del arreglo `parrafos`, sin las líneas de sello de
revisión ni los campos `afirmaciones`, `aprobacion`, `keywordsCubiertas` o `entidadesCubiertas`.
El `grep` de "Pendiente de aprobación" devuelve 0.

Las ocho secciones de nivel 2 salen en el orden canónico de `guia-clinica`: `que-es`, `sintomas`,
`causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes` y `cuando-consultar`.

La página se reescribió sobre `ContentBody` y `ContentBodyBoundary` del plan 08-09. Es la quinta
superficie que los usa, así que no se volvió a escribir la lógica de anclas, foco ni jerarquía.
El h1 pasó de "Lo que más preguntan antes de operarse" al valor del paquete, "Dudas frecuentes
antes de la consulta". `title` y `description` quedaron intactos: son de la fase 10.
`BreadcrumbJsonLd` se conserva y el CTA de cierre suma `BookingCta` junto al chat, porque la
puerta pide dos salidas a `/agendar` dentro del límite medido.

`StaticPage` ganó cinco campos opcionales (`h1`, `ctaBanner`, `bannerAfterSectionId`,
`publishedAt`, `updatedAt`). `home.ts` no los declara y no cambió: su h1 es de marca y vive en la
plantilla.

## La comparación del acordeón, pregunta por pregunta

El plan hablaba de once preguntas. En disco `faq.ts` tenía **diez**. La comparación se hizo sobre
las diez reales.

| # | Pregunta de v1.0 | Dónde la responde el cuerpo nuevo | Decisión |
|---|---|---|---|
| 1 | ¿Cuándo debo preocuparme por un dolor de espalda? | `cuando-consultar`, párrafos 1 y 2: dolor que se irradia y no cede en dos semanas, dolor que va a más, pérdida de fuerza, y las tres banderas rojas del mismo día | Retirada |
| 2 | ¿Un dolor de espalda siempre significa que necesito cirugía? | `sin-operar` entero, más `cirugia` párrafo 1, que enumera las tres situaciones en que operar se plantea | Retirada |
| 3 | ¿Cómo diferencio una simple contractura de una hernia discal? | `sintomas` párrafo 2, que separa el dolor que se queda en la espalda del que viaja siempre por el mismo recorrido, y `cuando-consultar--medico-especialista-en-dolores-musculares` | Retirada |
| 4 | Tengo miedo a operarme de la columna, ¿es tan riesgoso como parece? | `cirugia` párrafo 3, que trata el miedo de frente y explica qué debe salir de la consulta para decidir informado | Retirada |
| 5 | ¿Cómo es la recuperación después de una cirugía de columna? | En ningún lado. `cirugia` dice que en la consulta se explica "qué esperar de la recuperación", pero no lo responde | **Sobrevive** |
| 6 | ¿Atienden a niños? | `preguntas-frecuentes--que-enfermedades-ve-el-traumatologo`, párrafo 2: ortopedia infantil, displasia de cadera, alteraciones de la marcha y curvas de columna en niños y adolescentes | Retirada |
| 7 | ¿Cuánto tiempo puedo tardar en volver a trabajar? | En ningún lado. Ninguna sección del paquete da plazo de reincorporación | **Sobrevive** |
| 8 | ¿Qué debo llevar a mi primera consulta? | `diagnostico` párrafos 3 y 4, que responden lo mismo con más detalle: estudios completos y no solo el informe, medicamentos, tratamientos ya hechos y la evolución semana a semana | Retirada |
| 9 | ¿En qué consultorios atiende el Dr. Angulo? | `cuando-consultar` párrafo 3, que nombra las cuatro sedes vigentes. El detalle de dirección y horario vive en cada `/sedes/*` y no es lo que pregunta el acordeón | Retirada |
| 10 | ¿Cómo agendo una cita? | Parcial. El cuerpo dice **quién** maneja cada agenda, pero no da ningún canal: ni el número del doctor ni el trámite con cada clínica. Eso no se puede insertar en el texto sellado | **Sobrevive** |

Ninguna respuesta de `faq.ts` se reescribió para parecerse al paquete y ningún texto del acordeón
se movió dentro del cuerpo aprobado. El cuerpo no admite inserciones.

### Quién más importaba faq.ts

Tres superficies, y las tres siguen consumiéndolo, así que el módulo no queda huérfano:

- `src/app/preguntas-frecuentes/page.tsx`, el acordeón de esta ruta.
- `src/app/page.tsx`, el bloque de preguntas del inicio, que renderiza `faqItems.slice(0, 3)`. Con
  el podado, las tres que muestra el inicio pasan a ser las tres supervivientes: recuperación,
  vuelta al trabajo y cómo agendar. Es un cambio visible en el inicio y conviene mirarlo en la
  ronda de verificación de la fase.
- `src/lib/llms-txt.ts`, que las publica en `/llms.txt`. El archivo pasó de 161 a 154 líneas y
  `check-seo.mjs` sigue en verde.

## El marcado FAQPage

`FaqJsonLd` ya no se arma con los ítems del acordeón. Ahora sale de las cuatro subsecciones de la
sección `preguntas-frecuentes` del paquete, filtradas por prefijo de `id`, más las tres preguntas
que sobrevivieron. Es la misma mecánica de `src/app/servicios/[slug]/page.tsx`. El HTML publicado
declara siete `"@type":"Question"` y un `FAQPage`, así que no hay regresión para la fase 10.

## La puerta de contenido

`/preguntas-frecuentes` entra al `MANIFEST` con formato `guia-clinica` y sin `linksTo`: no es un
post y la matriz de enlazado de v1.2 no le asigna fila propia. No se le inventó ninguna salida;
conserva la navegación y el CTA que ya tenía.

`SITEMAP_TOTAL` sigue en 22. La URL ya existía en v1.0 y ya estaba en el sitemap.

Con esta ruta la puerta cubre **catorce** URLs y las tres corren en verde en corrida completa.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocker] El formato `guia-clinica` no tenía esqueleto declarado**

- **Encontrado en:** Task 2.
- **Problema:** `SKELETONS` en `scripts/check-content.mjs` solo declaraba `ficha-de-sede`. Sumar la
  ruta con `format: "guia-clinica"` hacía fallar la puerta con "el formato guia-clinica no tiene
  esqueleto declarado". El formato existía como tipo en `ServiceFormat` desde antes, pero nadie lo
  había llevado al manifiesto.
- **Arreglo:** se declararon las ocho claves canónicas del esqueleto, que son exactamente las ocho
  secciones de nivel 2 que el paquete entrega para este formato.
- **Archivos:** `scripts/check-content.mjs`.
- **Commit:** b5fe2fd.

**2. [Rule 3 - Blocker] El CTA de cierre no llegaba a dos enlaces a `/agendar`**

- **Encontrado en:** Task 1.
- **Problema:** la puerta pide dos o más `href="/agendar"` dentro del límite medido. El banner del
  primer tercio aporta uno y el cierre de la página solo ofrecía WhatsApp.
- **Arreglo:** el cierre suma `BookingCta` junto al chat. El chat se conserva porque la pregunta
  suelta antes de agendar es justo lo que esa sección resuelve.
- **Archivos:** `src/app/preguntas-frecuentes/page.tsx`.
- **Commit:** 60ddec8.

**3. [Rule 2 - Faltaba lo mínimo] La página no tenía índice, banner, firma ni aviso**

- **Encontrado en:** Task 1.
- **Problema:** al pasar de acordeón corto a guía clínica de 2183 palabras, la ruta queda sujeta a
  las mismas reglas que las demás superficies largas: tabla de contenidos con ocho entradas, un
  banner de conversión en el primer tercio, firma con colegiatura y aviso educativo al cierre.
- **Arreglo:** se montaron los cuatro con los componentes que ya existen. El banner se ancló a
  `sintomas`, que deja el ratio dentro del rango de 15 a 35 por ciento.
- **Archivos:** `src/app/preguntas-frecuentes/page.tsx`.
- **Commit:** 60ddec8.

### Discrepancia con el plan

El plan cuenta once preguntas en `faq.ts` y en disco hay diez. No se buscó la undécima ni se
inventó: la comparación se hizo sobre las diez que existen y queda transcrita arriba.

## Known Stubs

Ninguno.

## Verificación humana pendiente

Que la página se lea como una sola cosa y no como dos bloques pegados no lo dice ninguna puerta.
Queda para la ronda de verificación de la fase, junto con el bloque de preguntas del inicio, que
cambió de contenido sin que nadie lo tocara.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | limpio |
| `npm run lint` | limpio |
| `npm run build` | limpio |
| `node scripts/check-content.mjs` | sin fallas en 14 rutas |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| `node scripts/check-seo.mjs` | sin fallas, 23 rutas |
| `grep -c "Pendiente de aprobación"` en el módulo | 0 |
| `grep -c "SITEMAP_TOTAL = 22"` | 1 |
| `FAQPage` en el HTML publicado | 1, con 7 preguntas |
| `<h1` en el HTML publicado | 1 |

## Self-Check: PASSED
