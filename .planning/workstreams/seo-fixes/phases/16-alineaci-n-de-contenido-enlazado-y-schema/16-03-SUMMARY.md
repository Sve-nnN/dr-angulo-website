---
phase: 16-alineaci-n-de-contenido-enlazado-y-schema
plan: 03
subsystem: datos-estructurados
tags: [schema, json-ld, faqpage]
requires: ["16-01", "16-02"]
provides: ["BlogTopicEntity", "BlogPost.topicEntities", "topicEntityNode"]
affects: [src/content/blog, src/components/structured-data.tsx, "src/app/servicios/[slug]/page.tsx"]
tech-stack:
  added: []
  patterns: ["unión discriminada por kind para la entidad de tema del post"]
key-files:
  created: []
  modified:
    - src/content/blog/index.ts
    - src/content/blog/ciatica.ts
    - src/content/blog/lumbalgia.ts
    - src/content/blog/artrosis.ts
    - src/content/blog/cirugia-de-columna.ts
    - src/content/blog/reumatologo-o-traumatologo.ts
    - src/components/structured-data.tsx
    - "src/app/servicios/[slug]/page.tsx"
decisions:
  - "El post de reumatólogo declara MedicalSpecialty: no es una condición ni un procedimiento, y 16-CONTEXT.md no le asignó entidad porque el post no existía cuando se decidió."
  - "El umbral del FAQPage es estructural (dos preguntas o más), no una lista de slugs, para que siga valiendo cuando una guía gane o pierda preguntas."
metrics:
  duration: ~20 min
  completed: 2026-08-24
status: complete
---

# Phase 16 Plan 03: Entidad de tema en el schema Summary

`about` deja de derivarse del destino de navegación del post y sale de un campo propio que declara de qué trata el texto. Ninguna guía emite ya un bloque de preguntas con una sola pregunta.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Modelo de la entidad de tema | `e50f0aa` | tipo `BlogTopicEntity` (`condition`, `procedure-ref`, `specialty`), campo `topicEntities`, valor para los cinco posts |
| 2. `about` desde la entidad | `53f4100` | `topicEntityNode()` traduce cada entidad a su nodo; `post.relatedService` sale del componente |
| 3. Umbral del FAQPage | `8ba51f7` | el guardián pasa de `> 0` a `> 1` |

## Verificación

- `"about":{"@type":"MedicalCondition","name":"Ciática"` / `"Lumbalgia"` / `"Artrosis"`: 1 cada uno en su HTML.
- Cirugía de columna: `"about":[{"@id":"…#procedimiento-minimamente-invasiva"},{"@id":"…#procedimiento-convencional"}]`.
- Reumatólogo: `"@type":"MedicalSpecialty","name":"Traumatología"`.
- `grep -rl "servicios/hernia-discal#page" .next/server/app/blog/`: ningún archivo.
- `grep -c 'post.relatedService' src/components/structured-data.tsx`: 0.
- `FAQPage` en HTML: exactamente 2 archivos, `/preguntas-frecuentes` y `/servicios/escoliosis-y-deformidades`. Hernia discal y estenosis en 0.
- La pregunta "Qué no se debe hacer cuando tienes hernia discal" sigue visible como contenido.
- `npm run content:check`, `npm run seo:check` y `npm run lint`: 0.

## Ampliaciones de alcance (declaradas en el plan, ejecutadas)

1. **SCH-02 alcanzó a dos guías, no a una.** El audit y `16-CONTEXT.md` nombran solo `/servicios/hernia-discal`, pero `estenosis-espinal` tenía también una sola subsección de pregunta y emitía el mismo bloque defectuoso. El requisito escrito es "ningún bloque de una sola pregunta en el sitio", así que entraron las dos.
2. **El post de reumatólogo recibió `MedicalSpecialty`**, un tipo que `16-CONTEXT.md` no contemplaba porque el post no existía cuando se tomaron las decisiones.

## Deviations from Plan

**1. [Criterio inalcanzable como está escrito, sin impacto funcional]**

- **Found during:** Tarea 2
- **Issue:** el criterio `grep -c "Leer la guía completa sobre hernia discal" .next/server/app/blog/ciatica.html` debía dar 1 y da 0. La plantilla parte esa frase en dos nodos ("Leer la guía completa sobre " + `<em>hernia discal</em>`), así que la cadena nunca aparece contigua en el HTML. No es un fallo de la navegación.
- **Comprobación equivalente usada:** `grep -c 'href="/servicios/hernia-discal">Leer la guía completa sobre' .next/server/app/blog/ciatica.html` devuelve 1. El enlace que sale de `relatedService` sigue vivo, que es lo que el criterio quería probar.
- **Fix:** ninguno en código. El criterio está mal calibrado contra el marcado real.

## Known Stubs

Ninguno.

## Self-Check: PASSED
