# Roadmap: Remediación de la auditoría SEO 2026-08-23

**Workstream:** seo-fixes
**Milestone:** v1.3
**Granularidad:** coarse (4 fases)
**Numeración:** continúa desde el proyecto. v1.1 usó las fases 7-11 y v1.2 las fases 12-15, así que v1.3 arranca en la fase 16.

## Overview

La auditoría del 2026-08-23 encontró un sitio bien construido (81/100 de salud) que Google todavía no rastrea: 20 de las 22 URLs del sitemap están en "Discovered - currently not indexed" y 673 de las 892 impresiones vienen del perfil de Google Business, no de la SERP orgánica. La tentación es pedir indexación manual el primer día. Sería tirar el presupuesto de rastreo, porque dos slugs del blog, el title de `/preguntas-frecuentes`, los anchors internos y las referencias `about` del schema están por cambiar. Por eso v1.3 arranca por la alineación del contenido: URL, title, H1, anchors, intención de búsqueda y schema quedan en su forma definitiva antes de tocar nada de indexación. Recién con las URLs estables se pide el rastreo y se construyen los enlaces de entrada, que es lo único que puede mover el cuello de botella real. Las dos últimas fases corren en cualquier momento: rendimiento y accesibilidad por un lado, confianza y medición por el otro, ninguna depende del trabajo de contenido.

**Punto de contacto entre workstreams:** el único es MEAS-01 (tratamiento de los UTM del enlace del GBP) contra GBP-05 de la fase 11 del workstream `milestone`. Este workstream decide y mide el tratamiento de los UTM; la ficha de Google Business en sí (horarios, categorías, reseñas, citaciones) es propiedad del workstream `milestone` y está fuera de alcance acá. IDX-03 escribe entradas del GBP que enlazan a páginas internas: es publicación de contenido, no configuración de la ficha, pero conviene coordinarla con quien corre la fase 11.


## Restricción de diseño

**Todo trabajo de diseño de este milestone pasa por la skill `impeccable`, con el verbo que corresponda.** No se edita interfaz a mano ni se improvisa un criterio visual propio.

Qué cuenta como diseño acá: cualquier cambio que toque estilos, layout, tipografía, color, espaciado, motion, estructura de la página, assets visuales o copy de interfaz. No cuenta el contenido clínico redactado, ni la configuración de caché, headers o schema.

Ruteo de verbos para lo que hay en v1.3:

| Trabajo | Verbo | Dónde |
|---|---|---|
| Los tres fallos de accesibilidad y su verificación técnica | `audit` | Fase 18, A11Y-01 |
| El arreglo de contraste del párrafo sobre fondo primario | `polish` | Fase 18, A11Y-01 |
| Rendimiento de UI: `/testimonios`, imagen LCP, bundle, OG | `optimize` | Fase 18, CWV-02 a CWV-05 |
| Reescritura de los anchors del bloque "Sigue leyendo" (es copy de interfaz) | `clarify` | Fase 16, LINK-01 |
| Texto y estructura nuevos en los hubs `/blog` y `/sedes` | `layout` si cambia la estructura, `clarify` si es solo copy | Fase 19, TRUST-01 |

Reglas de uso:
- Correr `node ~/.claude/skills/impeccable/scripts/context.mjs --target <archivo o ruta>` una vez por sesión antes de tocar interfaz, con cwd en la raíz del proyecto. La skill es global y **no** vive dentro del repo: la ruta `.claude/skills/impeccable/` no existe acá. La skill carga `PRODUCT.md`, el design system de `design-system/dr-angulo/` y el brief de superficie.
- El hook detector de impeccable ya está aceptado en este proyecto (`.impeccable/config.local.json`), así que corre solo después de editar archivos de UI. Sus hallazgos se atienden, no se ignoran.
- Este milestone es refinamiento, no rediseño: se preserva la identidad visual, el comportamiento y todo lo que esté fuera del alcance del requisito. **No hay rediseño visual en v1.3.**
- Si un verbo y otro compiten para el mismo trabajo, se pregunta una vez antes de elegir.

## Phases

- [ ] **Phase 16: Alineación de contenido, enlazado y schema** - URL, title, H1, anchors, intención de búsqueda y `about` del schema en su forma definitiva; es el desbloqueante de todo lo demás
- [ ] **Phase 17: Indexación y enlaces de entrada** - Rastreo solicitado sobre URLs ya estables, más enlaces externos y entradas de GBP hacia páginas internas
- [ ] **Phase 18: Rendimiento y accesibilidad** - Caché de borde, `/testimonios`, imagen LCP, bundle, OG y los tres fallos de accesibilidad
- [ ] **Phase 19: Confianza, medición y seguridad** - Contenido propio en los hubs, fuentes médicas citadas, informe de GSC sin partir y CSP

## Phase Details

### Phase 16: Alineación de contenido, enlazado y schema
**Goal**: Cada URL del sitio anuncia el tema que realmente trata, cubre una intención de búsqueda distinta a las demás y lo declara igual en su title, su H1, sus anchors y su schema.
**Depends on**: Nothing (primera fase del milestone)
**Requirements**: SLUG-01, SLUG-02, SLUG-03, SLUG-04, LINK-01, LINK-02, LINK-03, SCH-01, SCH-02
**Issues cerrados**: #2, #3, #4, #5, #6, #10, #11
**Success Criteria** (qué debe ser TRUE):
  1. `/blog/5-sintomas-de-columna-que-no-debes-ignorar` y `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` ya no existen como destino: sus temas viven en URLs que los nombran, los slugs viejos responden una única redirección permanente al nuevo sin cadena intermedia (308, que es lo que emite `permanent: true` en esta versión de Next y lo que ya devuelven las tres redirecciones de la fase 14; Google la consolida igual que un 301), y ni el sitemap ni un solo enlace interno apunta al slug viejo.
  2. `/preguntas-frecuentes` es una FAQ de punta a punta —URL, title y H1 sobre lo mismo— y el contenido de "reumatólogo o traumatólogo" se lee en su propia URL con su propio title y su propio H1.
  3. Ningún anchor interno del sitio es una keyword cruda, un superlativo ni una especialidad que el doctor no ejerce: no queda ni "mejor neurocirujano de columna lima", ni "cirugía de columna cerca de mí", ni "artrosis traumatologo o reumatologo".
  4. Un paciente que llega a lumbalgia o a ciática encuentra dolor, autocuidado y cuándo consultar, con un enlace hacia hernia discal; la decisión quirúrgica se desarrolla solo en `/servicios/hernia-discal`.
  5. Ninguna secuencia de H2 se repite palabra por palabra en más de dos páginas, y cada post del blog declara `about` apuntando a su propia entidad de tema y no a la de hernia discal, con el tipo que le corresponde: `MedicalCondition` para lumbalgia, ciática y artrosis, `MedicalProcedure` para el post de cirugía y `MedicalSpecialty` para el de reumatólogo o traumatólogo. No queda ningún `FAQPage` de una sola pregunta en el sitio.
**Plans**: 6 plans

Plans:
- [ ] 16-01-PLAN.md — Renombre de los dos slugs del blog y sus 301 (ola 1)
- [ ] 16-02-PLAN.md — Separación de `/preguntas-frecuentes` y post nuevo de reumatólogo o traumatólogo (ola 2)
- [ ] 16-03-PLAN.md — Entidad de tema del post en el schema y `FAQPage` de una sola pregunta retirado (ola 3)
- [ ] 16-04-PLAN.md — Variación de los H2 de plantilla en nueve módulos (ola 4)
- [ ] 16-05-PLAN.md — Reescritura de los 110 anchors por `impeccable clarify` (ola 5, con checkpoint)
- [ ] 16-06-PLAN.md — Deslinde de intención entre ciática, lumbalgia y hernia discal (ola 6)

**Notas de ejecución**
- Los renombres de slug (SLUG-01/02) van primero dentro de la fase: SCH-01 referencia los `@id` que esos slugs generan, y LINK-02 reescribe las mismas páginas.
- LINK-03 (variar los H2) antes que LINK-02, porque la diferenciación de intención reordena secciones sobre esos mismos encabezados.
- Los anchors del bloque "Sigue leyendo" son copy de interfaz: la reescritura de LINK-01 va por `impeccable clarify`, no a mano.
- Anotar las impresiones de partida de las keywords del bloque "Sigue leyendo" antes de reescribir los anchors. Con 892 impresiones totales el riesgo es bajo, pero el punto de partida no se puede recuperar después.
- La ventaja de hacerlo ahora es que ninguna de las dos URLs a renombrar está indexada. En seis meses el cambio sí costaría.
- SCH-02 se resuelve quitando el bloque o convirtiéndolo a `QAPage` si las preguntas son reales de pacientes. No se agrega `FAQPage` nuevo: Google retiró los rich results de FAQ el 7 de mayo de 2026.

### Phase 17: Indexación y enlaces de entrada
**Goal**: Google gasta presupuesto de rastreo en las páginas internas del sitio, y llega a ellas por más de un camino.
**Depends on**: Phase 16 (pedir indexación de URLs cuyo slug, title o schema está por cambiar es trabajo tirado)
**Requirements**: IDX-01, IDX-02, IDX-03
**Issues cerrados**: #1
**Success Criteria** (qué debe ser TRUE):
  1. Las ocho páginas núcleo —`/servicios`, los cuatro `/servicios/*` de mayor volumen, `/sedes/consultorio-privado`, `/sobre-el-doctor` y `/preguntas-frecuentes`— registran fecha de rastreo en Search Console y ya no dicen "Discovered - currently not indexed" con `last_crawled: null`.
  2. Al menos tres dominios de terceros enlazan a páginas internas del sitio, no a la portada: fichas de las clínicas donde atiende, directorios médicos peruanos o colegios profesionales.
  3. El perfil de Google Business tiene entradas que abren páginas internas concretas: una por sede y una por condición.
  4. El informe de Rendimiento de GSC muestra impresiones en más URLs que las 6 del punto de partida.
**Plans**: TBD

**Notas de ejecución**
- IDX-02 e IDX-03 pueden correr en paralelo a IDX-01, pero ninguno antes de que la fase 16 haya estabilizado el contenido.
- Buena parte de esta fase es trabajo manual con acceso a cuentas de terceros (GSC, GBP, fichas de clínicas). El agente prepara el listado, el texto de las entradas y el registro de solicitudes; la ejecución material la hacen Juan y el doctor.
- Criterio de fallo, del propio informe de auditoría: si a los 21 días las páginas núcleo siguen sin fecha de rastreo, el cuello de botella no es de rastreo sino de autoridad, y hay que priorizar enlaces externos por sobre contenido nuevo. Eso reabre FUT-IDX-01, no esta fase.
- IDX-03 publica entradas en el GBP. La configuración de la ficha (horarios, categorías, reseñas) es de la fase 11 del workstream `milestone` y no se toca desde acá.

### Phase 18: Rendimiento y accesibilidad
**Goal**: El sitio responde rápido en móvil y no deja fuera a nadie por contraste ni por estructura de la página.
**Depends on**: Nothing (independiente del trabajo de contenido; se puede correr en cualquier punto del milestone)
**Requirements**: CWV-01, CWV-02, CWV-03, CWV-04, CWV-05, A11Y-01
**Issues cerrados**: #7, #8, #9, #12, #13, #14
**Success Criteria** (qué debe ser TRUE):
  1. El HTML de las páginas estáticas responde con `cf-cache-status: HIT` desde el borde de Cloudflare y el TTFB de la portada queda por debajo de 300 ms, contra los 630 ms medidos el 2026-08-23.
  2. `/testimonios` puntúa por encima de 0,90 en performance con un TBT por debajo de 200 ms, contra el 0,60 y los 850 ms de hoy.
  3. La imagen del doctor en `/sobre-el-doctor` se sirve en formato moderno, se precarga con prioridad alta y deja de ser un LCP diferido.
  4. El bundle compartido arrastra menos de 15 KB de JavaScript sin usar, no sirve polyfills legacy a navegadores que no los necesitan, y la imagen de `/opengraph-image` pesa menos de 200 KB sin que la vista previa al compartir por WhatsApp se vea distinta.
  5. La portada, `/agendar` y `/sedes` puntúan 1,00 en accesibilidad: el párrafo `text-white/8x` sobre fondo primario de la portada cumple contraste, las cuatro listas `<dl>` de `/agendar` ya no tienen `<div>` entre `<dt>` y `<dd>`, y `/sedes` no tiene ningún `<h3>` sin `<h2>` previo.
**Plans**: TBD
**UI hint**: yes

**Notas de ejecución**
- Fase de diseño por definición: A11Y-01 entra por `impeccable audit` y el arreglo de contraste por `impeccable polish`; CWV-02 a CWV-05 entran por `impeccable optimize`. Ver la sección "Restricción de diseño" del Overview.
- A11Y-01 vive en esta fase porque se verifica con la misma corrida de Unlighthouse que los CWV y sobre páginas que se tocan igual.
- CWV-01 es configuración de caché, no de plataforma. No se cambia de hosting ni de framework.
- La sospecha de CWV-02 es el embebido de reseñas de Google o el carrusel de videos forzando layout en bucle (2,45 s de Style & Layout, 630 ms de forced reflow sin atribuir). Confirmar antes de tocar.
- Los únicos cambios de estilo permitidos en este milestone son los tres de accesibilidad. No hay rediseño.

### Phase 19: Confianza, medición y seguridad
**Goal**: Las páginas hub tienen algo propio que ofrecer, el contenido clínico se apoya en fuentes verificables y el rendimiento del sitio se puede leer de un vistazo sin riesgos abiertos.
**Depends on**: Nothing (independiente del trabajo de contenido). TRUST-02 conviene después de la fase 16 para no citar fuentes en párrafos que la diferenciación de intención va a mover.
**Requirements**: TRUST-01, TRUST-02, MEAS-01, MEAS-02
**Issues cerrados**: #15, #16, #17, #18
**Success Criteria** (qué debe ser TRUE):
  1. `/blog` y `/sedes` tienen texto propio que explica qué encuentra ahí el paciente, suficiente para sostenerse como página indexable y no solo como índice de enlaces.
  2. Cada página de condición y cada post del blog enlazan al menos dos fuentes médicas externas verificables —sociedades de cirugía de columna, guías clínicas— y cada cita respalda una afirmación concreta del texto, no está de adorno.
  3. El rendimiento de la portada se lee en una sola fila del informe de Search Console: las variantes con `utm_source=google&utm_medium=organic&utm_campaign=gbp` dejan de aparecer como páginas separadas.
  4. El sitio sirve una Content-Security-Policy, las 22 URLs siguen respondiendo igual que antes y devtools no registra ningún issue de CSP en `/agendar`, `/servicios/escoliosis-y-deformidades` ni `/servicios/estenosis-espinal`.
**Plans**: TBD

**Notas de ejecución**
- TRUST-01 agrega texto y puede mover estructura en `/blog` y `/sedes`: si cambia el layout va por `impeccable layout`, si es solo copy por `impeccable clarify`. MEAS-01 y MEAS-02 no son diseño y no pasan por la skill.
- MEAS-01 es el único punto de contacto con el workstream `milestone`: la decisión sobre los UTM afecta al enlace del perfil de Google Business, que es GBP-05 de la fase 11. Acordar el tratamiento antes de cambiar el enlace, y medir ese canal por el informe propio del GBP si se sacan los UTM. Corregir la ficha en sí no es alcance de este workstream.
- El canonical de las URLs con UTM ya apunta a la versión limpia, así que no hay riesgo de duplicado. Lo que se arregla es el reporte partido, no la indexación.
- TRUST-02 se apoya solo en fuentes ya verificables. No puede introducir afirmaciones sobre credenciales, cifras de cirugías ni tasas de éxito del doctor, según la restricción de contenido médico de PROJECT.md.
- MEAS-02 toca headers de producción. Desplegar la CSP en modo report-only primero y recién después hacerla efectiva; la lista de rutas a verificar son las 22 del sitemap.

## Progress

**Execution Order:**
16 → 17 en estricto orden, porque la 17 depende del contenido estable de la 16. Las fases 18 y 19 son independientes y pueden correr en paralelo o adelantarse en cualquier punto, con la salvedad de TRUST-02.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 16. Alineación de contenido, enlazado y schema | v1.3 | 0/6 | Planned | - |
| 17. Indexación y enlaces de entrada | v1.3 | 0/TBD | Not started | - |
| 18. Rendimiento y accesibilidad | v1.3 | 0/TBD | Not started | - |
| 19. Confianza, medición y seguridad | v1.3 | 0/TBD | Not started | - |

## Cobertura de requisitos

22 de 22 requisitos de v1.3 mapeados, cada uno a exactamente una fase. Sin huérfanos ni duplicados.

| Fase | Requisitos | Cantidad | Issues |
|---|---|---|---|
| 16 | SLUG-01, SLUG-02, SLUG-03, SLUG-04, LINK-01, LINK-02, LINK-03, SCH-01, SCH-02 | 9 | #2, #3, #4, #5, #6, #10, #11 |
| 17 | IDX-01, IDX-02, IDX-03 | 3 | #1 |
| 18 | CWV-01, CWV-02, CWV-03, CWV-04, CWV-05, A11Y-01 | 6 | #7, #8, #9, #12, #13, #14 |
| 19 | TRUST-01, TRUST-02, MEAS-01, MEAS-02 | 4 | #15, #16, #17, #18 |

---
*Roadmap v1.3 creado: 2026-08-23, a partir de la auditoría SEO del mismo día (`audit/findings/2026-08-23-auditoria-seo.md`)*
