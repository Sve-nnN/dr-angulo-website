---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: "SEO semantico: keyword research y optimizacion on-page"
current_phase: 15
current_phase_name: Paquete on-page por URL
status: in_progress
stopped_at: Completed 14-04-PLAN.md — fase 14 cerrada
last_updated: "2026-08-12T03:30:00.000Z"
last_activity: "2026-08-12, cerrado el plan 14-04 y con el la fase 14 entera, sin gastar cuota: los 135 enlaces de la matriz y los 24 canonicals estan publicados, y el mapeo posicional del tab Internal Linking Audit quedo verificado contra el documento vivo comparando el primer bloque de enlace contra el octavo"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 14
  completed_plans: 14
  percent: 75
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-10)

**Core value:** Que un paciente que busca traumatólogo/cirujano de columna en Lima encuentre el sitio y agende cita por WhatsApp en menos de 2 clics, con todo evento rastreado.
**Current focus:** Fase 14 cerrada; arranca la fase 15, la última de v1.2. El mapa entero está publicado y sostenido: 24 URLs con keyword o con su motivo escrito de por qué no compiten, 24 canonicals y 135 enlaces internos. Lo que gobierna la fase 15 sigue viniendo de la 13 y la 14: **los cinco competidores rankean sin enlaces en sus páginas interiores**, así que el contenido es la palanca; y **tres de las cuatro páginas de servicio que v1.1 ya publicó enfrentan una SERP de contenido internacional, no de página de servicio** —`estenosis espinal` es 8 de 8—, así que la fase 15 las reescribe como guía clínica en vez de retocarles las metas.

## Current Position

Phase: 15 de 15 por arrancar (Paquete on-page por URL), la última de las 4 fases de v1.2
Plan: ninguno todavía. La fase 14 cerró con sus 4 planes
Status: **Fase 14 completa.** MAP-01 a MAP-05, SHEET-02, SHEET-04 y SHEET-05 cerrados. Los tres tabs de la fase están llenos en el documento del cliente y una segunda carga de los tres no inserta ni agrega nada. Quedan **96 de 102 búsquedas de SerpApi** hasta el reset del 2026-08-21
Last activity: 2026-08-12, cerrado el plan 14-04 con cero cuota gastada: 135 enlaces entre 22 URLs sin ninguna huérfana y sin anchors ambiguos, 24 canonicals sin repetir, y el mapeo posicional verificado leyendo el documento vivo — un mapeo por nombre habría escrito el mismo valor en los ocho bloques de enlace sin lanzar ninguna excepción

Progress: [███████░░░] 75% de v1.2 · 3 de 4 fases cerradas

## Roadmap v1.2

| Fase | Entrega | Requisitos |
|------|---------|------------|
| 12 | Tooling de datos con caché, escritura automática en el Sheet y universo de 400+ keywords con métricas e intención | INFRA-01 a INFRA-03, KWR-01 a KWR-03, SHEET-06 |
| 13 | Clusters por solape de SERP, cinco competidores perfilados, punto dulce y 10 de Oro | KWR-04 a KWR-06, COMP-01 a COMP-04, SHEET-01, SHEET-03 |
| 14 | Mapa keyword → URL de las 18 URLs, canibalización resuelta y matriz de enlazado | MAP-01 a MAP-05, SHEET-02, SHEET-04, SHEET-05 |
| 15 | Title, meta, H1, jerarquía, entidades TF-IDF y copy clínico por URL, listos para v1.1 | ONPAGE-01 a ONPAGE-06 |

## Coordinación con el workstream `milestone` (v1.1)

Los dos milestones corren a la vez sobre el mismo repositorio.

- **v1.2 manda en keywords y textos; v1.1 manda en código.** Ninguna fase de v1.2 escribe en `src/`.
- **Handoff bloqueante — MAP-03 (fase 14): RESUELTO el 2026-08-11.** Las nueve URLs (cuatro de servicio, cuatro de sede y el hub `/servicios`) tienen keyword asignada y publicada. El aviso autocontenido para la fase 8 de v1.1 es `.planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-HANDOFF-V11.md`, e incluye el renombre de `/servicios/escoliosis` a `/servicios/escoliosis-y-deformidades`, que arrastra 301, sitemap y enlaces internos.
- **Handoff de enlazado — MAP-05 (fase 14): ENTREGADO el 2026-08-12.** Los 135 enlaces internos entre 22 URLs son **especificación, no implementación**: v1.1 los escribe en el código. La matriz legible está en `phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-ENLAZADO.md` y el dataset en `seo-tools/data/internal-links.json`. Dos posts del blog se funden con su guía y redirigen, así que arrastran dos 301 nuevas además de la de escoliosis.
- **Handoff de contenido — ONPAGE-06 (fase 15):** el paquete por URL es lo que implementan las fases 8 y 10 de v1.1. Es lo único que le queda pendiente a v1.2.
- Nunca escribir en `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md` ni bajo `.planning/workstreams/milestone/`.

## Accumulated Context

### Decisions

- **La intención de una URL se mide en la SERP, no se deduce de la carpeta (2026-08-11, plan 14-02):** el reparto entero del top 10 decide informacional, comercial o transaccional. `estenosis espinal` vive en `/servicios/`, suena a operación y tiene 8 de 8 resultados informativos. Cuando la SERP no resuelve, la fila declara que la intención es inferida y no medida.
- **Las tres decisiones de Juan del 2026-08-11** quedan en `data/decisiones-checkpoint-14-2026-08-11.md`: las páginas de servicio se reescriben como guía clínica en la fase 15, `/servicios/escoliosis` se renombra a `/servicios/escoliosis-y-deformidades`, y `/sedes` queda como hub sin keyword primaria a propósito.

- **Reparto v1.1 / v1.2 (2026-08-10):** v1.2 entrega el mapa de keywords y el copy optimizado; las fases 8, 9 y 10 de v1.1 los implementan. Evita conflictos de merge entre dos milestones paralelos.
- **Fuentes de datos (2026-08-10):** DinoRank como primaria (volumen, CPC, competencia, TF-IDF, canibalizaciones, auditoría on-page), Ahrefs para KD, traffic potential y referring domains needed, SerpApi para validar la SERP real geolocalizada en Lima.
- **Numeración de fases desde 12:** v1.1 ocupa de la 7 a la 11 y ambos roadmaps se leen en paralelo. Ningún número se repite entre workstreams.
- **Reparto de los requisitos SHEET:** cada tab se llena en cuanto sus datos existen, no todos al final. SHEET-06 (idempotencia) va con el escritor en la fase 12 porque es propiedad del cargador, no de un tab.
- **Punto dulce sobre volumen:** las keywords se eligen por KD alcanzable con el perfil de enlaces real del dominio, que es de agosto de 2026 y casi sin historial.
- **[Fase 12] J-5 (2026-08-10):** la etapa del paciente va como columna `Patient Stage` al Sheet. Juan vetó dejarla solo en el dataset. No reabre J-3: la procedencia por métrica sigue fuera del documento.
- **[Fase 12] J-6 (2026-08-10):** los residuos de plantilla se borran completos, las 51 filas de `Keyword Research` con casillas incluidas y las 6 de `Content Model`. **Ejecutado en el plan 12-04**: 51 y 6 filas eliminadas y las cuatro columnas muertas de J-4 también.
- **[Fase 12, plan 04] Tercer eje de alcance:** la clasificación agrega un eje ortogonal a intención y etapa que separa la deriva del universo real (veterinaria, académica, retail, CIE-10, geografía ajena, sector público, marca ajena, otra especialidad). 950 de 5716 keywords, el 16,6 %, no son demanda de este consultorio. Vive en el dataset y NO agrega columna al Sheet: no roza J-3.
- **[Fase 12, plan 04] La etapa por defecto es `diagnostico`:** una keyword pelada como `hernia discal` es alguien que ya tiene el nombre de lo que le pasa.
- **[Fase 12, plan 04] Las anulaciones registran solo lo que difiere de las reglas:** 38 sobre un residuo de 747. Una anulación redundante congela un no-cambio y le prohíbe a la fase 13 mejorar la regla que la produjo.
- **[Fase 12, plan 05] `/keyword-research` descubre, no consulta:** medido sobre 70 respuestas, la keyword consultada **nunca** aparece en su propio `keywords[]`, y su bloque `datos` trae el valor real sólo en 10 de 70 y a veces con la clave de **otra** keyword. La única forma barata de que una keyword tenga métricas es aparecer como relacionada de otra, así que el enriquecimiento barre la caché antes de gastar.
- **[Fase 12, plan 05] No se gasta cuota en keywords de cuatro o más palabras:** dos muestras acotadas midieron rendimiento cero y el plan 12-03 ya lo había visto en 15 de sus 40 semillas. La regla vive en el código como bandera `--max-words`, no como criterio de una corrida. Se ahorraron 499 llamadas.
- **[Fase 12, plan 05] Las fixtures de `/auditoria` y `/canibalizaciones` se commitean seudonimizadas:** esos dos endpoints sólo resuelven contra un proyecto dado de alta y el único de la cuenta de DinoRank es de otro cliente. Se conserva la forma y nada del contenido, con reemplazo estable para que la relación de duplicidad sobreviva.

- **[Fase 13, plan 01] `Top Result` se reasigna de la fase 15 a la 13:** es el resultado que Google pone primero, o sea dato de SERP, y la SERP la captura esta fase. Volver a leer la misma captura dos fases después costaría búsquedas de una cuota que no se repone. `URL` sigue en la 14 y `Suggested H1` en la 15.
- **[Fase 13, plan 01] Siete tipos de página y no cuatro:** a los cuatro del ROADMAP (guía, página de servicio, ficha de clínica, directorio) la medición sobre los 95 orgánicos obligó a sumar contenido internacional, red social y otro. Forzar un resultado dentro de una caja que no le corresponde mentiría sobre la SERP.
- **[Fase 13, plan 01] El tab `Competitor Analysis` se declara fila por fila, nunca por columna entera:** la columna B es el primer slot de competidor **y además** carga los títulos de sección en las filas 1, 4, 11, 17, 23, 25 y 31. Volcar una columna entera los borraría sin lanzar ninguna excepción.
- **[Fase 13, plan 01] Los ejecutables de la fase son puntos de entrada propios bajo `src/phase13/`:** `src/cli.ts` llama a `main()` al cargarse, así que importarlo desde otro punto de entrada ejecuta el despachador con los argumentos equivocados. Por eso existe `src/phase13/args.ts`, que es copia funcional y no importación.
- [Phase ?]: El techo acumulado de cuota vive en capture.ts y no en quota.ts: quota.ts esta cerrado desde la fase 12 y el techo es una regla de esta fase
- [Phase ?]: Umbral de similitud de la cola en 0,5 mas termino clinico compartido obligatorio; el geo se quita antes de medir porque es terreno y no tema
- [Phase ?]: Las 10 de Oro se eligen con tres puertas de evidencia (alcance, servicio propio, piso de disputables) y despues valor de negocio; la alcanzabilidad solo desempata
- [Phase ?]: Una keyword de oro tiene que nombrar un servicio que el sitio declara: lo sembrado desde COMPETITORS.md describe lo que hace un competidor
- [Phase ?]: Cifosis entra al universo de candidatas por confirmacion explicita de Juan del 2026-08-11, y aun asi el criterio la dejo en el puesto 11 con 37 puntos contra 38
- [Fase 14, plan 01]: El inventario mide 22 URLs y 21 mapeables, no las 19 y 18 del roadmap. La diferencia se registra nominalmente en vez de ajustarse a la expectativa.
- [Fase 14, plan 01]: El slug publicado es /servicios/escoliosis. El mapa se emite contra la URL que existe; renombrarla a /servicios/escoliosis-y-deformidades arrastra redirecciones y es decision de Juan en el checkpoint de 14-02.
- [Fase 14, plan 01]: La pertenencia a un cluster no es parametro de veredictoDeFusion: solo decide el solape par a par del top 10 contra un umbral de 3.
- **[Fase 14, plan 04] Un tab con encabezados repetidos se resuelve por posicion, y el cargador se niega a escribirlo si el modelo no lo declara.** `Title with Link` aparece ocho veces en `Internal Linking Audit`. El peligro no es que falle: es que **no** falla. Por nombre, los ocho bloques caen en la misma columna, el resumen igual reporta 22 filas actualizadas y la matriz queda destruida en silencio. La evidencia tiene que salir de leer el documento vivo y comparar el bloque 1 contra el 8 (`il-verify.ts`), porque ningun contador distingue un mapeo bueno de uno roto.
- **[Fase 14, plan 04] El mismo riesgo entraba por `upsertRows`:** recorria `schema.byHeader.values()`, un indice por encabezado recortado que colapsaba los ocho `Title with Link` en una entrada y dejaba siete columnas sin escribir. `TabSchema.columns` es ahora la fuente de verdad de "que columnas hay"; `byHeader` queda solo para buscar una columna concreta por nombre.
- **[Fase 14, plan 04] El canonical de una URL que va a redirigir es el suyo propio, no el destino del 301.** Son dos implementaciones distintas: apuntar al destino le pediria a v1.1 una etiqueta en el `<head>` de una pagina que en la misma fase se apaga. El destino de la fusion viaja en `redirigeA` y en la columna `Action`, que es donde se lee como orden.
- **[Fase 14, plan 04] Las columnas que responde el cliente se siembran una sola vez.** `Approved?`, `Implemented?` y `Done` reciben su valor inicial en la primera carga y despues no se pisan. Un cargador que las reescribiera borraria la respuesta de Juan en cada corrida.
- **[Fase 14, plan 04] Un criterio de aceptacion no justifica romper una decision anterior:** el criterio pedia keyword en las 24 filas y ocho no la tienen a proposito. Se estrecho el criterio a las 16 que compiten en vez de inventarles keyword a `/agendar`, `/contacto` o `/sedes`.

### Pending Todos

- **Dar de alta `drangulocolumna.com` como proyecto en DinoRank y conectarle Search Console (bloqueante para la fase 14).** `/auditoria` responde HTTP 500 con un dominio que no es proyecto de la cuenta, y `/canibalizaciones` devuelve `has_data: false` sin Search Console conectado. MAP-02 y ONPAGE-05 dependen de esto y no lo puede resolver el tooling. Ninguno de los dos endpoints consume cuota, así que resondear después es gratis.
- **Dos competidores por definir:** de los cinco de COMP-01 hay tres ya investigados en `.planning/research/COMPETITORS.md` (drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com). Candidatos del local pack según la auditoría del 2026-08-10: Centro de Columna Vertebral y Clínica De La Columna.
- **Aprobación del doctor sobre el copy clínico (fase 15):** ONPAGE-04 entrega el texto marcado como pendiente. Conviene agrupar toda la revisión en una sola ronda.

### Blockers/Concerns

- El dominio es de agosto de 2026 y su perfil de enlaces es casi nulo. Cualquier selección de keywords que ignore eso entrega un plan que no se puede ganar en el horizonte del proyecto.
- **Resuelto (fase 14).** La canibalización de MAP-02 se midió cruzando el mapa contra sí mismo: 120 pares, cero conflictos. La revisión con datos reales de Search Console queda como deuda D-1 con fecha al 2026-11-11.
- **Resuelto (fase 14).** La fase 8 de v1.1 ya está desbloqueada: MAP-03 se entregó el 2026-08-11 y la matriz de enlazado el 2026-08-12.
- **Solo quedan 6 búsquedas de SerpApi hasta el 2026-08-21.** La fase 15 necesita la SERP para derivar la jerarquía H2/H3 de ONPAGE-02. O sale de las 96 capturas ya cacheadas, o hay que esperar al reset. Planificar la fase asumiendo caché, no cuota.
- **ONPAGE-05 depende de que DinoRank termine de rastrear el sitio** (deuda D-5) y de que `drangulocolumna.com` esté dado de alta como proyecto. Sin eso, `/auditoria` responde HTTP 500 y la auditoría de duplicados no se puede correr.
- Contenido YMYL: nada de credenciales, cifras de cirugías ni resultados inventados. Solo lo verificado o lo que el doctor confirme por escrito. En la fase 15 esto deja de ser abstracto: ONPAGE-04 entrega copy clínico y ninguna línea sale sin el sello de pendiente de aprobación del doctor.

## Session Continuity

Last session: 2026-08-12T03:30:00.000Z
Stopped at: Completed 14-04-PLAN.md — fase 14 cerrada, lista para planificar la fase 15
Resume file: None

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 12 P02 | 1h | 3 tasks | 7 files |
| Phase 12 P04 | 3h | 3 tasks | 6 files |
| Phase 12 P05 | 3h | 3 tasks | 12 files |
| Phase 13 P01 | 1h 50min | 3 tasks | 16 files |
| Phase 13 P02 | ~1h 15min | 2 tasks | 9 files |
| Phase 13 P05 | ~2h | 2 tasks | 6 files |
| Phase 14 P01 | 50m | 3 tasks | 12 files |
| Phase 14 P03 | ~2 h | 3 tasks | 19 files |
| Phase 14 P04 | ~2 h | 3 tasks | 14 files |

## Presupuesto de fuentes externas al cerrar la fase 14

Las fases 13 y 14 gastaron SerpApi; la 14 entera cerró con **cero** búsquedas.

| Fuente | Consumido | Disponible |
|--------|-----------|------------|
| SerpApi | 96 búsquedas | **6 hasta el reset del 2026-08-21.** Es el techo real de la fase 15: cualquier medición de SERP nueva hay que agendarla después del reset (deudas D-2 y D-3) |
| DinoRank | 187 llamadas (40 del plan 03, 147 del plan 05) | Sin techo documentado; el proveedor no expone endpoint de saldo. El control es el libro de cuota persistido en `seo-tools/.cache/_quota.json` |

186 respuestas de DinoRank y 96 capturas de SERP quedan en caché: reprocesar el universo
completo cuesta **cero llamadas**, verificado sobre las 5716 keywords. Es lo que permitió que la
fase 14 entera —cuatro planes— corriera sin gastar una búsqueda.
