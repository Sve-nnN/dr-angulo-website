# Roadmap: Dr. Angulo — Taste Pass (workstream `design-taste`)

## Milestones

- [ ] **v1.4 Taste pass: rediseño con design-taste-frontend** (fases 1-4)

## Overview

Este workstream corre en paralelo a `milestone`, `seo-fixes` y `seo-keywords`, y su numeración de fases es propia (arranca en 1, sin relación con la numeración de los otros). El milestone v1.4 aplica un "taste pass" visual sobre las 13 rutas del sitio con la skill `design-taste-frontend` (dial `DESIGN_VARIANCE` 6-7, rediseño moderado: puede cambiar layout y composición, preserva la identidad de marca). No toca copy clínico, metadatos SEO, estructura de datos ni rutas — eso es alcance de los otros workstreams. La accesibilidad de A11Y.md nunca se negocia por variance visual: es una restricción dura del proyecto, no un criterio más.

El orden de las cuatro fases sigue la lógica del "audit-first" de la skill: la fase 1 (home + hub y páginas de servicio) es donde se define el lenguaje visual compartido — jerarquía, densidad, tratamiento de CTA — porque son las rutas de mayor tráfico y las que fijan el patrón de composición que HOMESVC-03 exige replicar entre servicios. Las fases 2 a 4 reutilizan ese lenguaje visual sobre el resto del sitio (conversión, institucional, sedes y blog) y por eso dependen de la fase 1, pero no dependen entre sí: con `parallelization: true` en `config.json`, las fases 2, 3 y 4 se pueden planificar y ejecutar en paralelo una vez cerrada la fase 1.

## Phases

**Phase Numbering:** fases enteras (1, 2, 3, 4) — numeración propia de este workstream, independiente de `milestone`/`seo-fixes`/`seo-keywords`.

- [ ] **Phase 1: Home y Servicios** - Jerarquía visual clara en la home y composición consistente entre hub y páginas de servicio, con el CTA de agendar como elemento prioritario
- [ ] **Phase 2: Conversión** - `/agendar` y `/contacto` con fricción visual mínima hacia la acción de contacto
- [ ] **Phase 3: Institucional** - `/sobre-el-doctor`, `/testimonios`, `/preguntas-frecuentes` y `/privacidad` con jerarquía que refuerza autoridad y credibilidad
- [ ] **Phase 4: Sedes y Blog** - Hub y detalle de sedes y de blog con jerarquía clara y consistencia entre cada par

## Phase Details

### Phase 1: Home y Servicios
**Goal**: Quien llega a la home o a cualquier página de servicio entiende en el primer vistazo quién es el doctor, qué ofrece y qué hacer a continuación, con una composición que se repite de forma reconocible entre servicios.
**Depends on**: Nothing (first phase)
**Requirements**: HOMESVC-01, HOMESVC-02, HOMESVC-03, HOMESVC-04
**Success Criteria** (what must be TRUE):
  1. En la home, la credencial del doctor, la propuesta de valor y el llamado a agendar se distinguen entre sí en el primer scroll, sin competir por la misma atención.
  2. En `/servicios`, las especialidades se escanean de corrido, sin muro de texto ni necesidad de leer todo para entender qué se ofrece.
  3. Dos páginas de servicio distintas (`/servicios/[slug]`) comparten la misma jerarquía de secciones y los mismos componentes, de modo que pasar de una a otra se siente como el mismo sitio.
  4. En la home y en cualquier página de servicio, el CTA de agendar es el elemento visualmente más prioritario de la página, sin depender de leer el texto para ubicarlo.
**Plans**: TBD
**UI hint**: yes

### Phase 2: Conversión
**Goal**: Quien ya decidió agendar completa la acción sin fricción visual, y quien todavía duda encuentra los canales de contacto con jerarquía clara.
**Depends on**: Phase 1 (reutiliza el lenguaje visual y el tratamiento de CTA definidos ahí)
**Requirements**: CONV-01, CONV-02
**Success Criteria** (what must be TRUE):
  1. En `/agendar`, ningún elemento compite visualmente con la acción de agendar (WhatsApp o formulario); llegar a la página y completarla no exige pasos ni lecturas de más.
  2. En `/contacto`, los tres canales (WhatsApp, teléfono, formulario) se identifican en un vistazo, con jerarquía clara sobre cuál es el preferente.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Institucional
**Goal**: Quien evalúa si confiar en el doctor encuentra evidencia de autoridad, prueba social y respuestas a sus dudas con una jerarquía visual que refuerza la credibilidad, y la página legal se mantiene legible sin necesitar el mismo tratamiento que el resto del sitio.
**Depends on**: Phase 1
**Requirements**: INST-01, INST-02, INST-03, INST-04
**Success Criteria** (what must be TRUE):
  1. En `/sobre-el-doctor`, la foto, las credenciales (CMP/RNE, formación) y la trayectoria aparecen en un orden visual que transmite autoridad sin necesidad de leer todo el texto.
  2. En `/testimonios`, las reseñas se presentan con un tratamiento visual (no un bloque de texto plano) que refuerza la credibilidad de lo dicho por los pacientes.
  3. En `/preguntas-frecuentes`, las preguntas se escanean de corrido y cada una se expande sin que el visitante pierda su lugar en la página.
  4. En `/privacidad`, el texto legal se lee con contraste y espaciado correctos, sin necesitar el mismo nivel de rediseño que el resto del sitio.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Sedes y Blog
**Goal**: Quien busca la sede más cercana encuentra ubicación y acceso con jerarquía clara, y quien lee un artículo del blog lo hace con comodidad visual, con consistencia entre cada hub y su detalle.
**Depends on**: Phase 1
**Requirements**: SEDBLOG-01, SEDBLOG-02, SEDBLOG-03, SEDBLOG-04
**Success Criteria** (what must be TRUE):
  1. En `/sedes`, la ubicación y la facilidad de acceso de cada sede (dirección, mapa, horario) se distinguen con jerarquía clara, sin bloques largos de texto.
  2. Al entrar a una `/sedes/[slug]` desde el hub, la composición visual es reconociblemente la misma que la del hub `/sedes`.
  3. En `/blog`, los artículos se escanean con jerarquía editorial (imagen, título, resumen) que distingue a uno de otro sin ambigüedad.
  4. En un `/blog/[slug]`, el contenido clínico largo se lee con comodidad (ancho de línea, tipografía, espaciado) sin fatiga visual.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Fase 1 primero (define el lenguaje visual compartido). Las fases 2, 3 y 4 dependen solo de la fase 1 y se pueden planificar/ejecutar en paralelo entre sí.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Home y Servicios | 0/TBD | Not started | - |
| 2. Conversión | 0/TBD | Not started | - |
| 3. Institucional | 0/TBD | Not started | - |
| 4. Sedes y Blog | 0/TBD | Not started | - |

---
*Roadmap v1.4 creado: 2026-09-17, a partir de .planning/workstreams/design-taste/REQUIREMENTS.md (14 requisitos v1)*
