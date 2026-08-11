---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: "SEO semantico: keyword research y optimizacion on-page"
current_phase: 12
current_phase_name: Instrumentación de datos y universo de keywords
status: phase_complete
stopped_at: "Completado 12-05-PLAN.md y con él la fase 12 entera: los cuatro endpoints de DinoRank con fixtures reales, universo enriquecido y Sheet recargado. INFRA-02, INFRA-03 y KWR-02 cerrados"
last_updated: "2026-08-11T00:35:00.000Z"
last_activity: "2026-08-11, cerrada la fase 12: 5087 de 5716 keywords con métricas y el contrato de los cuatro endpoints documentado con respuestas reales"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 5
  completed_plans: 5
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-10)

**Core value:** Que un paciente que busca traumatólogo/cirujano de columna en Lima encuentre el sitio y agende cita por WhatsApp en menos de 2 clics, con todo evento rastreado.
**Current focus:** Fase 12 cerrada. Sigue la fase 13: clusters por solape de SERP, cinco competidores perfilados y las 10 de Oro.

## Current Position

Phase: 12 de 15 cerrada (Instrumentación de datos y universo de keywords), primera de las 4 fases de v1.2
Plan: los cinco planes de la fase 12 están cerrados. Sigue la fase 13, que todavía no tiene planes
Status: Fase 12 completa. Los siete requisitos de la fase cerrados: INFRA-01 a INFRA-03, KWR-01 a KWR-03 y SHEET-06
Last activity: 2026-08-11, cerrado el plan 12-05: los cuatro endpoints de DinoRank con fixtures reales de Perú, universo con 5087 de 5716 keywords con métricas y Sheet recargado sin mover una fila

Progress: [██████████] 100% de la fase 12 · 1 de 4 fases de v1.2

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
- **Handoff bloqueante — MAP-03 (fase 14):** la fase 8 de v1.1 no debe escribir páginas de servicio hasta que la fase 14 cierre. Las nueve URLs nuevas (cuatro de servicio, cuatro de sede y el hub `/servicios`) necesitan su keyword antes de existir. Al cerrar la fase 14 hay que avisar al otro workstream.
- **Handoff de contenido — ONPAGE-06 (fase 15):** el paquete por URL es lo que implementan las fases 8 y 10 de v1.1.
- Dentro de la fase 14, resolver MAP-03 primero para desbloquear la fase 8 lo antes posible.
- Nunca escribir en `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md` ni bajo `.planning/workstreams/milestone/`.

## Accumulated Context

### Decisions

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

### Pending Todos

- **Dar de alta `drangulocolumna.com` como proyecto en DinoRank y conectarle Search Console (bloqueante para la fase 14).** `/auditoria` responde HTTP 500 con un dominio que no es proyecto de la cuenta, y `/canibalizaciones` devuelve `has_data: false` sin Search Console conectado. MAP-02 y ONPAGE-05 dependen de esto y no lo puede resolver el tooling. Ninguno de los dos endpoints consume cuota, así que resondear después es gratis.
- **Dos competidores por definir:** de los cinco de COMP-01 hay tres ya investigados en `.planning/research/COMPETITORS.md` (drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com). Candidatos del local pack según la auditoría del 2026-08-10: Centro de Columna Vertebral y Clínica De La Columna.
- **Aprobación del doctor sobre el copy clínico (fase 15):** ONPAGE-04 entrega el texto marcado como pendiente. Conviene agrupar toda la revisión en una sola ronda.

### Blockers/Concerns

- El dominio es de agosto de 2026 y su perfil de enlaces es casi nulo. Cualquier selección de keywords que ignore eso entrega un plan que no se puede ganar en el horizonte del proyecto.
- Las diez URLs existentes ya compiten entre sí sin que nadie lo haya decidido. La canibalización de MAP-02 no es hipotética: hay que medirla antes de asignar.
- La fase 8 de v1.1 es la siguiente en su roadmap y depende de la fase 14 de este. Si v1.2 se demora, v1.1 se detiene o escribe páginas que después habrá que reoptimizar.
- Contenido YMYL: nada de credenciales, cifras de cirugías ni resultados inventados. Solo lo verificado o lo que el doctor confirme por escrito.

## Session Continuity

Last session: 2026-08-11T00:35:00.000Z
Stopped at: Completado 12-05-PLAN.md y con él la fase 12 entera. Sigue la fase 13, que necesita discuss y planning
Resume file: None

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 12 P02 | 1h | 3 tasks | 7 files |
| Phase 12 P04 | 3h | 3 tasks | 6 files |
| Phase 12 P05 | 3h | 3 tasks | 12 files |

## Presupuesto de fuentes externas al cerrar la fase 12

| Fuente | Consumido | Disponible |
|--------|-----------|------------|
| SerpApi | 12 búsquedas | **115 hasta el 2026-08-21**, intactas desde el plan 12-03 |
| DinoRank | 187 llamadas (40 del plan 03, 147 del plan 05) | Sin techo documentado; el proveedor no expone endpoint de saldo. El control es el libro de cuota persistido en `seo-tools/.cache/_quota.json` |

186 respuestas de DinoRank y 12 capturas de SERP quedan en caché: reprocesar el universo
completo cuesta **cero llamadas**, verificado sobre las 5716 keywords.
