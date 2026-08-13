---
phase: 14-mapa-keyword-url-y-matriz-de-enlazado
workstream: seo-keywords
plan: 02
subsystem: seo-tools
tags: [mapa-keyword-url, asignador, intent, content-model, handoff, serp]
requires:
  - "seo-tools/src/phase14/{model,overlap,pagetype-map,cm-push}.ts (plan 14-01)"
  - "seo-tools/data/{url-inventory.json,page-type-map.json,golden-10.json,keywords-13.jsonl,sweet-spot.jsonl}"
  - ".planning/workstreams/seo-keywords/data/decisiones-checkpoint-14-2026-08-11.md"
provides:
  - "seo-tools/src/phase14/assign.ts — el asignador puro, con intencion medida en la SERP"
  - "seo-tools/src/phase14/assign-run.ts — punto de entrada acotado por --scope"
  - "seo-tools/data/url-map.jsonl — las nueve URLs del handoff asignadas"
  - ".../14-MAPA.md — mapa legible, seccion 1 de 4"
  - ".../14-HANDOFF-V11.md — interfaz autocontenida hacia el workstream milestone"
  - "Nueve filas vivas en el tab Content Model del Sheet del cliente"
affects:
  - "14-03: recibe el asignador, las siete de oro sin URL y el choque blog contra guias"
  - "14-04: la matriz de enlazado parte de estas nueve mas /sedes como nodo puro"
  - "fase 15: tres guias clinicas largas en vez de tres ajustes de titulo"
  - "workstream milestone, fase 8: desbloqueada por 14-HANDOFF-V11.md"
tech-stack:
  added: []
  patterns:
    - "La intencion de una URL sale del reparto del top 10 medido, nunca de la familia de la URL."
    - "Deduplicacion de secundarias por conjunto de palabras significativas, no solo por subcadena."
    - "Sin angulos distintos suficientes el asignador rompe la corrida en vez de rellenar."
key-files:
  created:
    - seo-tools/src/phase14/assign.ts
    - seo-tools/src/phase14/assign-run.ts
    - .planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-MAPA.md
    - .planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-HANDOFF-V11.md
  modified:
    - seo-tools/src/phase14/assign.test.ts
    - seo-tools/data/url-map.jsonl
decisions:
  - "La intencion se mide sobre el reparto entero del top 10 y no sobre la etiqueta dominante: un 5-4 y un 9-0 no significan lo mismo."
  - "Contra la primaria se compara por conjunto de palabras y nunca por contencion: una cabeza esta contenida en las 43 keywords de su cluster."
  - "El respaldo que rellenaba secundarias cuando faltaban angulos se elimino. Ahora rompe la corrida."
  - "Se excluyen los modificadores de estudio y traduccion (pdf, ingles, libros, autores de texto) por la misma logica de D-10."
metrics:
  duration: ~45 min
  completed: 2026-08-11
  tests_before: 450
  tests_after: 464
  serpapi_calls: 96
  escrituras_reales_en_el_sheet: 2
status: complete
---

# Phase 14 Plan 02: Las nueve del handoff, asignadas y publicadas — Summary

Las nueve URLs que v1.1 necesita tienen keyword primaria, de tres a cinco secundarias con ángulos
distintos de verdad, tipo de página exigido por la SERP y acción. Están vivas en el documento del
cliente, y la segunda carga no duplicó nada. Coste de SerpApi: cero.

Lo que más cambia el trabajo de las fases que siguen no es el mapa en sí: es que la intención de
cada URL ahora sale del top 10 medido y no de la carpeta donde vive la página. Tres de las cuatro
páginas de servicio pasaron de transaccional a informacional por medición.

## Qué se completó

### Task 1 — El asignador (commit `07c2066` RED del ejecutor anterior, `fe5e2c2` verde)

Se retomó trabajo sin commitear de una corrida anterior: `assign.ts`, `assign-run.ts` y un
`url-map.jsonl` a medio generar. Estaba a mitad de dos arreglos de calidad reales, y los dos se
terminaron. El detalle está abajo, en desviaciones.

Las nueve conductas del plan tienen prueba propia, más tres nuevas por los arreglos. Suite
completa en verde y `typecheck` sin salida, que no era el caso al retomar.

### Task 2 — El checkpoint, ya respondido

Juan había respondido las tres decisiones el 2026-08-11 con los datos del plan 14-01 delante, y
quedaron escritas en `data/decisiones-checkpoint-14-2026-08-11.md`. No se volvieron a preguntar.
Transcritas:

1. **Las cuatro páginas de servicio se reescriben como guía clínica** (fase 15), porque sus SERP
   son de contenido informativo largo: `estenosis espinal` 8 de 8, `hernia discal` 6 de 7,
   `escoliosis` 5 de 7. Solo `ortopedia infantil` ya está en el formato correcto. El mapa registra
   el tipo de página exigido en consecuencia (MAP-04).
2. **`/servicios/escoliosis` se renombra a `/servicios/escoliosis-y-deformidades`.** El mapa se
   emite contra el slug nuevo. La redirección 301, el sitemap y los enlaces internos son trabajo
   de v1.1 y están declarados en el handoff.
3. **`/sedes` queda como hub sin keyword primaria**, a propósito, para dejar de canibalizar las
   cuatro páginas de sede. El mapa lo declara como decisión y no como hueco.

Sobre los cuatro puntos que el plan pedía llevar al checkpoint: la reconciliación del inventario
(22 medidas contra 19 del roadmap) ya está documentada nominalmente en el SUMMARY del 14-01 y fue
la base de las decisiones de Juan; el desempate registrado va abajo; las columnas muertas del tab
no se tocaron, que es la recomendación por defecto; y la lista de reescrituras es la tabla
completa, porque las nueve salieron `reescribir`.

No surgió nada nuevo que justificara detener la ejecución.

### Task 3 — Publicación e interfaz hacia v1.1 (commit `993d3b8`)

Primera escritura real de esta fase en el documento del cliente. La deuda que el plan 14-01 dejó
abierta por su desviación D-1 queda cerrada acá.

## Las nueve URLs

| URL | Keyword primaria | Intención medida | Tipo que exige la SERP | Acción |
|---|---|---|---|---|
| `/servicios/escoliosis-y-deformidades` | escoliosis | informacional | contenido-internacional | reescribir |
| `/servicios/hernia-discal` | hernia discal | informacional | contenido-internacional | reescribir |
| `/servicios/estenosis-espinal` | estenosis espinal | informacional | contenido-internacional | reescribir |
| `/servicios/ortopedia-infantil` | ortopedia infantil lima | transaccional | pagina-de-servicio | reescribir |
| `/servicios` | cirujano de columna lima | transaccional | pagina-de-servicio | reescribir |
| `/sedes/clinica-ricardo-palma` | cirujano de columna clínica ricardo palma | transaccional | pagina-de-servicio | reescribir |
| `/sedes/sanna-la-molina` | cirujano de columna clínica sanna | comercial | red-social | reescribir |
| `/sedes/clinica-tezza` | ortopedia infantil clínica tezza | transaccional | pagina-de-servicio | reescribir |
| `/sedes/consultorio-privado` | cirugía de columna surco | comercial | otro | reescribir |

**Desempate registrado, el único del lote:** dos keywords de oro apuntaban a `/servicios`,
`cirujano de columna lima` (38 puntos, puesto 9) y `cirugía mínimamente invasiva en lima` (38
puntos, puesto 10). Ganó la primera por puesto. La perdedora no se forzó dentro: queda anotada
como URL a crear para el 14-03.

**Veredictos de solape consultados:** 36. Fusionables: 0.

**Keywords de oro sin URL en este lote:** 7, para el 14-03.

## Criterios de aceptación, con la salida real

| Criterio | Salida | Estado |
|---|---|---|
| `url-map.jsonl` con 9 líneas | `9` | OK |
| Forma completa: primaria, 3-5 secundarias, tipo exigido, acción, justificación >40 | `1` | OK |
| Primarias repetidas entre las nueve | `0` | OK |
| Marcas ajenas y CIE-10 en primarias o secundarias | `0` | OK |
| Las nueve conductas con prueba propia, suite en verde | 464 pruebas, 464 verdes, 0 rojas | OK |
| `npm run typecheck` | sin salida | OK |
| Determinismo de `url-map.jsonl` | `7bc8bb8a…5235b77` en las dos corridas | OK |
| Cuota de SerpApi | `96` | OK |
| SHA-256 de `keywords.jsonl` | `c59dad2d…bcd7eac`, sin cambio | OK |
| `seo-tools` fuera del `tsconfig.json` raíz | `0` archivos | OK |
| La app raíz compila | estado `0` | OK |
| `14-HANDOFF-V11.md` existe | `1` | OK |
| Staging sin rutas de `workstreams/milestone` | `0` | OK |
| Staging sin rutas de `src/` de la app | `0` | OK |
| Las nueve filas leídas del documento vivo, columnas llenas | `9` de `9` completas | OK |
| Las tres columnas `(Ahrefs)` vacías en esas nueve filas | `9` de `9` limpias | OK |

### Las tres corridas de `cm-push`, con los números reales

| Corrida | actualizadas | insertadas | columnasAgregadas | llamadas de red |
|---|---|---|---|---|
| Ensayo (`--dry-run`) | 0 | 9 | 0 | 3 |
| Primera real (`--yes`) | 0 | 9 | 0 | 4 |
| Segunda real (`--yes`) | **9** | **0** | **0** | 4 |

SHEET-06 queda probado sobre el tab `Content Model` contra el documento vivo, que es lo que el
plan 14-01 no pudo hacer: la segunda carga actualizó las nueve filas y no insertó ninguna.

La lectura de verificación confirmó `URL`, `Keyword`, `Intent`, `Type`, `New/Existing`,
`Cluster`, `Action` y `Leave, Update, or Bin?` llenas en las nueve, y `Volume (Ahrefs)`,
`Traffic Potential (Ahrefs)` y `KD Difficulty (Ahrefs)` vacías en las nueve (D-13).

## Desviaciones del plan

### D-1 (Regla 1, bug) — La intención salía de la familia de la URL, no de la SERP

**Encontrado en:** al retomar el trabajo sin commitear de la corrida anterior.

`asignar` escribía `intent: primaria.intent`, que es la clasificación por texto de la fase 13. Es
el mismo error que fusionar dos URLs por compartir cluster, cometido sobre otro campo: deducir la
intención de cómo está archivado el sitio en vez de medirla. El caso testigo es `estenosis
espinal`, que vive en `/servicios/`, suena a operación, y tiene ocho de ocho resultados
informativos.

**Arreglo:** `intentSegunSerp` suma las diez posiciones del reparto medido en tres urnas y elige
la mayor. Se suma el reparto entero y no la etiqueta dominante porque un 5-4 y un 9-0 no
significan lo mismo. Cuando ningún formato mapea a una intención, o cuando hay empate, o cuando
no hay SERP, cae a la clasificación por texto **y lo deja escrito en la justificación**, para que
nadie lea inferencia como si fuera medición.

**Efecto:** tres URLs cambiaron de transaccional a informacional y dos sedes a comercial. Es lo
que hace que la decisión de guía clínica quede respaldada por el dato en cada fila.

**Archivos:** `seo-tools/src/phase14/assign.ts`. **Commit:** `fe5e2c2`.

### D-2 (Regla 1, bug) — Secundarias casi duplicadas, y un respaldo que las dejaba pasar

**Encontrado en:** verificación de la tarea 1.

Tres problemas encadenados:

1. La deduplicación comparaba solo subcadenas. `ciatica o hernia discal` y `hernia discal o
   ciatica` son la misma búsqueda con las palabras en otro orden y ninguna contiene a la otra, así
   que las dos entraban y gastaban dos de las cinco ranuras en un solo ángulo.
2. No se comparaba contra la primaria. `ortopedia infantil en lima` de secundaria, con `ortopedia
   infantil lima` de primaria, repetía lo que la fila ya decía arriba.
3. **El peor de los tres:** cuando el filtro dejaba menos de tres, un respaldo silencioso volcaba
   las candidatas sin filtrar. La fila pasaba igual la validación de MAP-01, porque contar cinco
   cadenas es trivial y contar cinco ángulos no. Ese relleno es exactamente el modo de falla que
   la regla 4 del asignador dice prohibir.

**Arreglo:** comparación por conjunto de palabras significativas además de por subcadena; contra
la primaria **solo** por conjunto, nunca por contención, porque una cabeza como `escoliosis` está
contenida en las 43 keywords de su cluster y la contención vaciaba la fila entera; y el respaldo
eliminado, así que ahora rompe la corrida con un mensaje que dice qué hacer.

**Archivos:** `seo-tools/src/phase14/assign.ts`. **Commit:** `fe5e2c2`.

### D-3 (Regla 2, funcionalidad faltante) — Modificadores de estudio y traducción

**Encontrado en:** revisión de las secundarias emitidas.

Sobrevivían `estenosis espinal pdf`, `hernia discal ingles`, `ortopedia infantil libros` y
`ortopedia infantil rosselli`, que es el apellido del autor de un texto de ortopedia infantil.
Es la misma lógica de D-10 aplicada a los modificadores que quedaban: el CIE-10 lo busca quien
factura, y esto lo busca un estudiante bajando material. Traen volumen y no traen paciente.

**Arreglo:** se agregaron a `motivoDeExclusion` con su motivo escrito.

**Archivos:** `seo-tools/src/phase14/assign.ts`. **Commit:** `fe5e2c2`.

### D-4 (arrastrada del 14-01) — El error de tipos que impedía correr

`elegirSecundarias` había pasado a recibir el tipo exigido por la SERP como séptimo parámetro,
pero la llamada seguía pasando seis. `npm test` no lo veía porque `tsx` borra los tipos, y
`typecheck` fallaba. Se corrigió moviendo el cálculo del tipo exigido **antes** de elegir
secundarias, que es donde corresponde: es entrada de esa elección, porque las secundarias de una
página que la SERP quiere como guía son las de una guía.

## Lo que queda anotado

- **`ortopedia infantil en los olivos`** quedó de secundaria de `/servicios/ortopedia-infantil`.
  Los Olivos es un distrito del norte de Lima y el consultorio no tiene sede ahí. D-04 manda que
  las geo de distrito entren como secundarias de la URL de Lima que corresponde, así que la regla
  se respetó, pero vale revisarlo en el 14-03 junto al resto de las geo.
- **`/sedes/sanna-la-molina` tiene una SERP dominada por red social.** Es el caso más incómodo de
  los nueve: Google responde esa búsqueda con perfiles, no con páginas de clínica. Qué hacer con
  eso no lo resuelve este plan.
- **Los cuatro posts del blog van a chocar con las tres guías.** Avisado en el handoff y agendado
  para el 14-03.
- **Siete de las 10 de Oro siguen sin URL.** Plan 14-03.

## Commits

| Commit | Mensaje |
|---|---|
| `07c2066` | test(14-02): pruebas en rojo del asignador de keywords a URLs (ejecutor anterior) |
| `fe5e2c2` | feat(14-02): asignador de las nueve del handoff, con intencion medida en la SERP |
| `993d3b8` | docs(14-02): mapa de las nueve del handoff y aviso de desbloqueo a v1.1 |

## Estado de recursos

- **SerpApi: 96 llamadas**, sin mover. El presupuesto del plan era cero y se respetó. Quedan 30
  hasta el 2026-08-21.
- **`data/keywords.jsonl`:** SHA-256 intacto.
- **Pruebas:** 450 antes, 464 después. 14 nuevas, todas en verde.
- **Escrituras bajo `src/` de la aplicación:** ninguna.
- **Escrituras bajo `.planning/workstreams/milestone/`:** ninguna.
- **Escrituras reales en el Sheet del cliente:** 2 corridas, 9 filas.

## Known Stubs

Ninguno. Las nueve filas salen del dato medido y ninguna lleva valor de relleno.

## Self-Check: PASSED

Los seis archivos declarados existen en disco y los tres commits existen en el historial.
