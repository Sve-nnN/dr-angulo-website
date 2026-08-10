---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: "SEO semantico: keyword research y optimizacion on-page"
current_phase: 12
current_phase_name: Instrumentación de datos y universo de keywords
status: executing
stopped_at: "Completado 12-04-PLAN.md: universo clasificado, dataset consolidado y carga real en el Sheet del cliente. SHEET-06 cerrado"
last_updated: "2026-08-10T23:53:12.244Z"
last_activity: "2026-08-10, cerrado el plan 12-04: universo de 5716 keywords clasificado y cargado en el Sheet del cliente"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 5
  completed_plans: 4
  percent: 80
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-10)

**Core value:** Que un paciente que busca traumatólogo/cirujano de columna en Lima encuentre el sitio y agende cita por WhatsApp en menos de 2 clics, con todo evento rastreado.
**Current focus:** Fase 12. Conectar DinoRank, Ahrefs, SerpApi y el Sheet del cliente, y levantar el universo de 400+ keywords del negocio del doctor.

## Current Position

Phase: 12 de 15 (Instrumentación de datos y universo de keywords), primera de las 4 fases de v1.2
Plan: 12-01 a 12-04 cerrados. Sigue 12-05 (enriquecimiento de las 724 keywords sin métricas)
Status: Ejecutando la fase 12. El universo está clasificado y cargado en el Sheet del cliente, y SHEET-06 quedó probado contra el documento real
Last activity: 2026-08-10, cerrado el plan 12-04: clasificación determinista, dataset consolidado y primera carga real

Progress: [████████░░] 80% de v1.2

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

### Pending Todos

- **Credenciales para la fase 12 (bloqueante):** clave de la API de DinoRank y JSON de la service account de Google con permiso de edición sobre el Sheet `1aowectbAJhyyZWhwQ6N_re-ENeSENvNN-5DebqCIls0`. Ahrefs y SerpApi ya están disponibles como MCP en el entorno.
- **Dos competidores por definir:** de los cinco de COMP-01 hay tres ya investigados en `.planning/research/COMPETITORS.md` (drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com). Candidatos del local pack según la auditoría del 2026-08-10: Centro de Columna Vertebral y Clínica De La Columna.
- **Aprobación del doctor sobre el copy clínico (fase 15):** ONPAGE-04 entrega el texto marcado como pendiente. Conviene agrupar toda la revisión en una sola ronda.

### Blockers/Concerns

- El dominio es de agosto de 2026 y su perfil de enlaces es casi nulo. Cualquier selección de keywords que ignore eso entrega un plan que no se puede ganar en el horizonte del proyecto.
- Las diez URLs existentes ya compiten entre sí sin que nadie lo haya decidido. La canibalización de MAP-02 no es hipotética: hay que medirla antes de asignar.
- La fase 8 de v1.1 es la siguiente en su roadmap y depende de la fase 14 de este. Si v1.2 se demora, v1.1 se detiene o escribe páginas que después habrá que reoptimizar.
- Contenido YMYL: nada de credenciales, cifras de cirugías ni resultados inventados. Solo lo verificado o lo que el doctor confirme por escrito.

## Session Continuity

Last session: 2026-08-10T23:53:12.237Z
Stopped at: Completado 12-04-PLAN.md: universo clasificado, dataset consolidado y carga real en el Sheet del cliente. SHEET-06 cerrado
Resume file: None

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 12 P02 | 1h | 3 tasks | 7 files |
| Phase 12 P04 | 3h | 3 tasks | 6 files |
