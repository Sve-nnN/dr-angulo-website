# Roadmap — Milestone v1.2: SEO semántico

**Workstream:** `seo-keywords`
**Milestone:** v1.2 — SEO semántico: keyword research y optimización on-page
**Fases:** 12 a 15
**Corre en paralelo a:** workstream `milestone` (v1.1, fases 7 a 11)

## Milestones

- [x] **v1.0 MVP** (fases 1-6, entregado 2026-08-09) — workstream `milestone`
- [ ] **v1.1 Lanzamiento público y competitividad SEO** (fases 7-11, en curso) — workstream `milestone`
- [ ] **v1.2 SEO semántico: keyword research y optimización on-page** (fases 12-15, este roadmap)

La numeración arranca en 12 a propósito: v1.1 ocupa de la 7 a la 11 y las dos ejecuciones
avanzan al mismo tiempo. Ningún número se repite entre roadmaps, así que "fase 8" y
"fase 14" siempre significan una sola cosa aunque se lean los dos documentos seguidos.

## Overview

El sitio se lanzó sin una keyword asignada por página: cada URL compite por lo que Google
decida. v1.2 arregla eso de atrás para adelante. Primero conecta las tres fuentes de datos
(DinoRank para volumen y semántica, Ahrefs para dificultad y potencial, SerpApi para la SERP
real de Lima) y construye el universo de keywords del negocio. Después convierte ese universo
plano en clusters validados por solape de SERP, con el mapa de competencia al lado, y elige las
diez keywords que mueven la aguja primero. Con eso ya se puede asignar una keyword primaria por
URL, resolver la canibalización antes de que exista y trazar el enlazado interno. Al final,
cada URL sale de este workstream con su title, meta, H1, jerarquía, entidades obligatorias y
copy clínico listo para que v1.1 lo publique.

**Reparto con v1.1:** v1.2 manda en keywords y textos; v1.1 manda en código.

> **Restricción dura del milestone: ninguna fase de v1.2 escribe en `src/`.**
> Los entregables de v1.2 son datos de keywords, filas del Sheet del cliente y paquetes de
> copy. Las fases 8, 9 y 10 de v1.1 son las que implementan. Esto no es una preferencia de
> estilo: los dos workstreams corren a la vez sobre el mismo repositorio y esta separación es
> lo que evita conflictos de merge.

**Entregable externo:** el Sheet de SEO del cliente `1aowectbAJhyyZWhwQ6N_re-ENeSENvNN-5DebqCIls0`,
tabs `Keyword Research`, `Content Model`, `Competitor Analysis`, `Canonical Audit`,
`Internal Linking Audit`.

### Handoffs hacia v1.1

| Handoff | Sale de | Entra a | Naturaleza |
|---------|---------|---------|------------|
| **MAP-03** — keyword asignada a las 9 URLs nuevas | Fase 14 | Fase 8 de v1.1 | **BLOQUEANTE.** La fase 8 no debe escribir páginas de servicio antes de que la fase 14 cierre |
| **ONPAGE-06** — paquete de implementación por URL | Fase 15 | Fases 8 y 10 de v1.1 | De contenido. La fase 8 implementa el copy; la fase 10, titles, metas y jerarquía |

## Phases

- [x] **Phase 12: Instrumentación de datos y universo de keywords** - Las tres fuentes conectadas y cacheadas, escritura automática en el Sheet y 400+ keywords con métricas e intención
- [ ] **Phase 13: Clusters, competencia y las 10 de Oro** - El universo plano se vuelve clusters por solape de SERP, con los cinco competidores perfilados y la lista corta de keywords alcanzables
- [ ] **Phase 14: Mapa keyword → URL y matriz de enlazado** - Una keyword primaria por URL sin canibalización, tipo de página exigido por la SERP y enlazado interno entre clusters (handoff bloqueante para la fase 8 de v1.1)
- [ ] **Phase 15: Paquete on-page por URL** - Title, meta, H1, jerarquía, entidades TF-IDF y copy clínico humanizado, listos para que v1.1 los implemente sin decidir nada

## Phase Details

### Phase 12: Instrumentación de datos y universo de keywords
**Goal**: Quedan conectadas y cacheadas las tres fuentes de datos, la escritura en el Sheet del cliente deja de ser manual, y existe el universo completo de keywords del negocio del doctor con sus métricas e intención.
**Depends on**: Nada. Es la primera fase del milestone y no depende de ninguna fase de v1.1.
**Requirements**: INFRA-01, INFRA-02, INFRA-03, KWR-01, KWR-02, KWR-03, SHEET-06
**Success Criteria** (qué debe ser TRUE):
  1. Ejecutar un comando del repo escribe celdas en el Sheet del cliente y Juan las ve aparecer sin haber abierto el archivo; ninguna clave ni credencial de servicio queda en el control de versiones.
  2. Una consulta que ya se hizo antes se responde desde el caché en disco: se puede reprocesar el análisis completo sin volver a gastar cuota de DinoRank, Ahrefs ni SerpApi.
  3. El universo tiene 400 keywords o más del negocio del doctor, expandido desde semillas por condición, procedimiento, síntoma, especialidad y sede.
  4. Cada keyword trae volumen, CPC y competencia de DinoRank para Perú en español, con una columna que indica de qué fuente salió cada dato. Las columnas de KD y traffic potential existen pero quedan en `no_consultado`. *(Enmendado el 2026-08-10 por decisión de Juan: Ahrefs queda fuera de la fase 12 por completo y su enriquecimiento se difiere. Ver la nota bajo KWR-02 en `REQUIREMENTS.md`.)*
  5. Cada keyword está clasificada por intención (informacional, comercial, transaccional, navegacional) y por etapa del paciente (síntoma, diagnóstico, decisión), y ejecutar la carga dos veces seguidas deja el mismo número de filas en el Sheet.
**Plans**: 5/5 plans executed — **fase completa**

Plans:
- [x] 12-01-PLAN.md — Guardarraíl de build, paquete `seo-tools`, seam de caché y sondeo del Sheet (wave 1)
- [x] 12-02-PLAN.md — Aprobación de columnas y escritor idempotente del Sheet (wave 2)
- [x] 12-03-PLAN.md — Semillas, permutación y expansión con datos reales de Google (wave 2) — 5716 keywords, 12 búsquedas de SerpApi gastadas
- [x] 12-04-PLAN.md — Clasificación determinista, dataset consolidado y primera carga (wave 3) — 5716 keywords clasificadas y cargadas, SHEET-06 cerrado contra el documento real
- [x] 12-05-PLAN.md — Cliente de DinoRank, enriquecimiento del universo y recarga (wave 4) — los cuatro endpoints con fixtures reales, 5087 de 5716 keywords con métricas, 147 llamadas gastadas

**Notas de ejecución**
- Esta fase no escribe en `src/`. El código de tooling vive fuera de la aplicación (scripts y caché), no dentro del sitio que v1.1 está desplegando.
- Dependencia humana antes de arrancar: Juan tiene que proveer la clave de la API de DinoRank y el JSON de la service account de Google con permiso de edición sobre el Sheet. Sin eso, INFRA-01 e INFRA-02 quedan bloqueados aunque el resto de la fase avance. **Resuelto el 2026-08-10**: la tercera clave de DinoRank funciona y las dos credenciales están en `.secrets/.env`.
- **Pendiente que hereda la fase 14, y no depende de este workstream:** `/auditoria` y `/canibalizaciones` sólo resuelven contra un dominio dado de alta como proyecto en el panel de DinoRank, y el segundo necesita además Search Console conectado. Hay que dar de alta `drangulocolumna.com` antes de MAP-02 y ONPAGE-05. Ninguno de los dos endpoints consume cuota, así que resondear es gratis.
- Ahrefs y SerpApi ya están disponibles como MCP en el entorno de trabajo; DinoRank y Google Sheets son los que necesitan credencial propia.
- El caché de INFRA-03 es lo que hace barata cada iteración posterior. Conviene resolverlo antes de la primera consulta masiva, no después de haber quemado cuota.
- SHEET-06 (idempotencia) es propiedad del escritor, no de un tab: se verifica cargando el universo dos veces y comparando el conteo de filas.
- El universo cubre el negocio completo del doctor —traumatología, cirugía de columna, ortopedia infantil, nichos por condición y por sede—, no solo las cuatro condiciones que v1.1 va a publicar.
- Keywords fuera de Lima quedan fuera de alcance: el negocio es presencial y no hay sede que respalde otra ciudad.

### Phase 13: Clusters, competencia y las 10 de Oro
**Goal**: El universo plano se convierte en clusters accionables validados contra la SERP real de Lima, con el mapa de competencia al lado, y queda elegida la lista corta de keywords por las que vale la pena pelear primero.
**Depends on**: Phase 12
**Requirements**: KWR-04, KWR-05, KWR-06, COMP-01, COMP-02, COMP-03, COMP-04, SHEET-01, SHEET-03
**Success Criteria** (qué debe ser TRUE):
  1. Cada keyword pertenece a un cluster formado por solape de resultados en la SERP: dos keywords escritas distinto pero con los mismos resultados en Google caen juntas, y dos keywords parecidas con SERP distinta quedan separadas.
  2. Cada cluster tiene su SERP de Lima capturada con SerpApi y anotado qué tipo de página premia Google ahí (guía, página de servicio, ficha de clínica, directorio).
  3. Está marcado el punto dulce: las keywords cuya dificultad orgánica es alcanzable con el perfil de enlaces real del dominio, separadas de las de volumen alto que hoy están fuera de alcance. *(Decidido al discutir la fase, 2026-08-10: **las dos cosas a la vez**. Ahrefs se reincorpora acotado a las ~90 cabezas, con el `select` recortado a dificultad y potencial de tráfico, y ese KD se cruza con quién ocupa realmente el top 10 leído de la SERP de Lima. Ninguno de los dos alcanza solo: el KD es un promedio de mercado y no sabe que la posición 3 es una clínica con marca; la SERP sola no dice cuánto esfuerzo de enlaces hace falta.)*
  4. Existen las "10 de Oro" con su justificación de negocio, y Juan puede leer por qué esas diez y no simplemente las diez de mayor volumen.
  5. En el Sheet, el tab `Keyword Research` muestra el universo con métricas, cluster, intención, H1 sugerido y top result; el tab `Competitor Analysis` muestra los cinco competidores de Lima con DR, referring domains, tráfico orgánico estimado, keywords en top 100, presencia de blog, gap de keywords, featured snippets y páginas más enlazadas. *(Alcance real de la fase 13, 2026-08-11: `Cluster`, `Top Result`, `Keyword Difficulty` y `Traffic Potential`. `Suggested H1` es contenido de ONPAGE-02 y lo escribe la fase 15, tal como declara el propio modelo del documento.)*
**Plans**: 5 plans

Plans:
- [ ] 13-01-PLAN.md — Fundación de la fase: SERP completa desde caché, tipo de página y el modelo del Sheet (tracer, coste cero de cuota)
- [ ] 13-02-PLAN.md — Candidatas, captura presupuestada de 90 búsquedas y clusters por solape de SERP
- [ ] 13-03-PLAN.md — Los cinco competidores con Ahrefs y el tab transpuesto `Competitor Analysis`
- [ ] 13-04-PLAN.md — Dificultad, punto dulce, gap de keywords y la carga del universo al Sheet
- [ ] 13-05-PLAN.md — Las 10 de Oro con su justificación, y la aprobación de Juan

**Notas de ejecución**
- COMP-01, COMP-02 y COMP-04 solo necesitan el tooling de la fase 12: se pueden ejecutar en paralelo a la expansión de keywords si conviene por cuota o por tiempo de espera de las APIs. Lo que sí depende del universo es COMP-03, porque la captura de SERP se hace por cluster.
- KWR-04 y COMP-03 comparten la misma captura de SerpApi. Capturar una vez y reutilizar; no hacer dos pasadas de SERP sobre las mismas keywords.
- Los tres competidores ya investigados en v1.0 (drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com) son el punto de partida documentado en `.planning/research/COMPETITORS.md`. Faltan dos, y la auditoría del 2026-08-10 sugiere dónde buscarlos: Centro de Columna Vertebral y Clínica De La Columna lideran el local pack.
- El punto dulce se calcula contra el perfil de enlaces real de drangulocolumna.com, que es un dominio de agosto de 2026 con historial casi nulo. Elegir por volumen aquí sería elegir keywords que no se ganan en el horizonte del proyecto.
- Las 10 de Oro son la entrada del criterio de priorización de la fase 14: cuando dos URLs se peleen la misma keyword, gana la que sirve a la keyword de oro.

### Phase 14: Mapa keyword → URL y matriz de enlazado
**Goal**: Cada URL del sitio, existente o planificada, sabe por qué keyword pelea y cómo se enlaza con las demás, y las nueve URLs que v1.1 todavía no escribió reciben su keyword antes de que alguien empiece a redactarlas.
**Depends on**: Phase 13
**Requirements**: MAP-01, MAP-02, MAP-03, MAP-04, MAP-05, SHEET-02, SHEET-04, SHEET-05
**Success Criteria** (qué debe ser TRUE):
  1. Las 18 URLs mapeables tienen exactamente una keyword primaria y de tres a cinco secundarias (`/privacidad` queda fuera del mapa por ser legal y estar fuera del sitemap).
  2. Ninguna keyword primaria está asignada a dos URLs: la canibalización quedó detectada y resuelta al asignar, no heredada para descubrirla en producción.
  3. Las nueve URLs que aún no existen —las cuatro de servicio, las cuatro de sede y el hub `/servicios` reformulado— tienen su keyword primaria y sus secundarias publicadas en el Sheet, de modo que la fase 8 de v1.1 pueda arrancar sin elegir keywords por su cuenta.
  4. Cada asignación declara qué tipo de página exige la SERP y qué hay que hacer con la URL: dejarla como está, reescribirla o crearla.
  5. Los tabs `Content Model`, `Canonical Audit` e `Internal Linking Audit` tienen una fila por URL con keyword, intención, tipo, cluster, métricas, acción recomendada, canonical propuesto y hasta ocho enlaces salientes con su anchor; recargarlos no duplica filas.
**Plans**: TBD

> **HANDOFF BLOQUEANTE — MAP-03.**
> La fase 8 de v1.1 (silo clínico: páginas por servicio) **no debe empezar a escribir páginas
> de servicio hasta que esta fase cierre**. Las nueve URLs que la fase 8 y la fase 9 van a crear
> necesitan su keyword primaria asignada antes de existir; si se escriben primero y se
> optimizan después, se paga dos veces el mismo trabajo y se arrastra canibalización desde el
> día uno. Al cerrar la fase 14 hay que avisar explícitamente al workstream `milestone` de que
> el mapa está disponible.

**Notas de ejecución**
- **Ruta rápida recomendada:** resolver primero MAP-03 para las nueve URLs nuevas y publicarlo en el Sheet, y recién después completar el resto del mapa para las URLs existentes. Así la fase 8 de v1.1 se desbloquea lo antes posible en vez de esperar a que la fase 14 entera termine. La fase sigue cerrando con todo MAP-01 a MAP-05, pero el orden interno importa para no serializar el otro workstream más de lo necesario.
- Las nueve URLs planificadas son: cuatro de servicio (hernia discal, estenosis espinal, escoliosis y deformidades, ortopedia infantil), cuatro de sede (consultorio Surco, Ricardo Palma, Sanna La Molina, Padre Luis Tezza) y el hub `/servicios` reformulado.
- La sede de Ricardo Palma tiene prioridad de datos: la related search "traumatologo especialista en columna clínica ricardo palma" está verificada en la SERP y hoy no la responde ninguna URL del sitio.
- La detección de canibalización usa el endpoint `/canibalizaciones` de DinoRank sobre lo que ya está indexado, más el cruce del propio mapa propuesto. Las diez URLs existentes ya compiten entre sí sin que nadie lo haya decidido.
- La matriz de enlazado (MAP-05) se propone, no se implementa: los enlaces los escribe v1.1 en el código.
- Si una keyword de oro no tiene URL que la pueda ganar, la salida correcta es MAP-04 marcando "hay que crearla", no forzarla dentro de una URL existente que la SERP no premia.

### Phase 15: Paquete on-page por URL
**Goal**: Cada URL del mapa sale de este workstream con su title, meta, H1, jerarquía, entidades obligatorias y copy clínico ya redactado, de modo que implementarla en v1.1 no obligue a volver a decidir nada.
**Depends on**: Phase 14
**Requirements**: ONPAGE-01, ONPAGE-02, ONPAGE-03, ONPAGE-04, ONPAGE-05, ONPAGE-06
**Success Criteria** (qué debe ser TRUE):
  1. Cada URL mapeable tiene title y meta description reescritos dentro del límite de caracteres y con la keyword primaria al frente.
  2. Cada URL tiene H1 propuesto y jerarquía H2/H3 derivada de las preguntas reales que la SERP de Lima muestra para su keyword, más la lista de entidades y términos semánticos obligatorios del TF-IDF de DinoRank contra las páginas que ya posicionan.
  3. El copy clínico nuevo o reescrito está redactado, humanizado y marcado como pendiente de aprobación del doctor: ninguna línea de texto médico se entrega como lista para publicar sin ese sello.
  4. La auditoría de DinoRank sobre el mapa propuesto devuelve cero titles duplicados, cero H1 duplicados y cero metas faltantes.
  5. Existe un paquete por URL que quien ejecute las fases 8 y 10 de v1.1 puede abrir e implementar de corrido, sin volver a este workstream a preguntar.
**Plans**: TBD

**Notas de ejecución**
- Esta fase produce archivos de entrega dentro de `.planning/workstreams/seo-keywords/`, nunca dentro de `src/`. El paquete es la interfaz con v1.1: si obliga a interpretar, está incompleto.
- Gate de contenido médico: PROJECT.md prohíbe desplegar contenido YMYL sin validar. ONPAGE-04 entrega el texto marcado como pendiente de aprobación; quien aprueba es el doctor y quien publica es v1.1. Conviene agrupar todo el copy en una sola ronda de revisión para no fragmentar el tiempo del doctor.
- Nada de credenciales, cifras de cirugías ni resultados inventados. Solo lo verificado o lo que el doctor confirme por escrito.
- Los límites de caracteres se alinean con lo que v1.1 ya verifica en su fase 10: title ≤60, description ≤155. Entregar copy fuera de rango obliga a reescribirlo del otro lado.
- ONPAGE-05 se corre contra el mapa propuesto, no contra el sitio vivo: la auditoría de duplicados tiene que dar limpia antes de que v1.1 publique, no después.
- Si la fase 8 de v1.1 ya avanzó con las páginas de servicio usando solo MAP-03, este paquete es lo que las lleva de "existen con la keyword correcta" a "están optimizadas".

## Progress

**Execution Order:**
Las fases corren en orden numérico: 12 → 13 → 14 → 15.

Dentro de la fase 13, cuatro waves: 13-01 sola en la wave 1 (funda la fase sin gastar cuota),
13-02 y **13-03 en paralelo** en la wave 2 —el bloque de competencia de dominio, COMP-01 y COMP-04,
no necesita clusters ni capturas nuevas—, 13-04 en la wave 3 y 13-05 en la wave 4. COMP-02 sí
depende de la captura de SERP, así que cae en la wave 3 y no en el bloque paralelo.

Dentro de la fase 14, MAP-03 va primero para desbloquear la fase 8 de v1.1 cuanto antes.

**Cruce con v1.1:** la fase 8 de v1.1 espera a que cierre la fase 14 (MAP-03). Las fases 7, 9,
10 y 11 de v1.1 no dependen de este workstream para arrancar, aunque las 8 y 10 consumen el
paquete de la fase 15 para su contenido y su metadata.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 12. Instrumentación de datos y universo de keywords | v1.2 | 5/5 | Complete | 2026-08-11 |
| 13. Clusters, competencia y las 10 de Oro | v1.2 | 0/5 | Planned | - |
| 14. Mapa keyword → URL y matriz de enlazado | v1.2 | 0/TBD | Not started | - |
| 15. Paquete on-page por URL | v1.2 | 0/TBD | Not started | - |

## Cobertura de requisitos

30 requisitos de v1.2, cada uno en exactamente una fase. Sin huérfanos, sin duplicados.

| Fase | Requisitos | Total |
|------|------------|-------|
| 12 | INFRA-01, INFRA-02, INFRA-03, KWR-01, KWR-02, KWR-03, SHEET-06 | 7 |
| 13 | KWR-04, KWR-05, KWR-06, COMP-01, COMP-02, COMP-03, COMP-04, SHEET-01, SHEET-03 | 9 |
| 14 | MAP-01, MAP-02, MAP-03, MAP-04, MAP-05, SHEET-02, SHEET-04, SHEET-05 | 8 |
| 15 | ONPAGE-01, ONPAGE-02, ONPAGE-03, ONPAGE-04, ONPAGE-05, ONPAGE-06 | 6 |
| | **Total** | **30** |

Los requisitos de SHEET quedaron repartidos a propósito: cada tab se llena en cuanto sus datos
existen, no todos juntos al final. SHEET-06 va con el escritor en la fase 12 porque es una
propiedad del cargador, no de un tab.

---
*Roadmap v1.2 creado: 2026-08-10, a partir de REQUIREMENTS.md del workstream `seo-keywords`*
