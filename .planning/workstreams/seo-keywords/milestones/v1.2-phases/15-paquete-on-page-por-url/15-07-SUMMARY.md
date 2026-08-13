---
phase: 15-paquete-on-page-por-url
workstream: seo-keywords
plan: 07
subsystem: seo-tools
tags: [on-page, paquete, handoff, revision-doctor, auditoria, sheet, idempotencia, ymyl]
requires:
  - "seo-tools/data/onpage.json: title, meta y H1 de las 24 filas, del plan 15-02"
  - "seo-tools/data/url-map.jsonl en SOLO LECTURA: el mapa de la fase 14, fuente de la columna URL"
  - "los cuatro datasets de copy: copy-guias, copy-servicios, copy-sedes y copy-blog, de la wave 3"
  - "seo-tools/src/phase15/ymyl.ts y auditoria.ts: las dos compuertas del plan 15-02"
  - "seo-tools/src/sheets/upsert.ts: upsertRows con estadosPropios, de las fases 13 y 14"
  - "14-HANDOFF-V11.md: el modelo de handoff autocontenido que este documento continua"
provides:
  - "los 24 documentos del paquete completos, uno por URL del mapa"
  - "15-PAQUETE.md: el indice generado que ordena las 24 URLs por accion, formato y archivo"
  - "15-REVISION-DOCTOR.md: la ronda unica de 450 bloques, ordenada por riesgo clinico y no por URL"
  - "15-AUDITORIA.md: ONPAGE-05 sobre el paquete terminado, cero hallazgos"
  - "15-HANDOFF-V11-ONPAGE.md: el handoff autocontenido hacia las fases 8 y 10 de v1.1"
  - "seo-tools/src/phase15/kr-h1-push.ts: el cargador de Suggested H1 y URL con permiso de dos estados"
  - "renderHandoff y la bandera --handoff en paquete.ts"
  - "las columnas Suggested H1 y URL del tab Keyword Research llenas para las 16 primarias"
affects:
  - "workstream milestone: la fase 8 de v1.1 implementa el copy y la fase 10 la metadata"
  - "milestone v1.2: este plan cierra la fase 15 y con ella el milestone"
tech-stack:
  added: []
  patterns:
    - "un cargador acota estadosPropios a las columnas que escribe y comprueba en el modelo que sean esas y no una mas"
    - "el handoff y el indice se generan desde los datasets, nunca se transcriben"
key-files:
  created:
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/15-PAQUETE.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/15-REVISION-DOCTOR.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/15-HANDOFF-V11-ONPAGE.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/agendar.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/blog.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/contacto.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/sedes.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/sobre-el-doctor.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/testimonios.md
    - seo-tools/src/phase15/revision.ts
    - seo-tools/src/phase15/kr-h1-push.ts
    - seo-tools/src/phase15/kr-h1-push.test.ts
  modified:
    - seo-tools/src/phase15/paquete.ts
    - seo-tools/src/phase15/paquete.test.ts
    - seo-tools/src/phase13/args.ts
    - seo-tools/data/sheet-columns.json
    - seo-tools/data/onpage-audit.json
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/15-AUDITORIA.md
decisions:
  - "La columna URL, huerfana desde la fase 14, se cierra aca por oportunidad y conserva su status de origen"
  - "El permiso de la carga se acota a dos estados y el codigo comprueba que habiliten exactamente dos columnas"
  - "La ronda del doctor se ordena por lo que puede hacer dano y no por orden de URL"
  - "El handoff declara la aprobacion del doctor como bloqueante para la fase 8, no como recordatorio"
metrics:
  duration: "~2h 30min (dos sesiones)"
  completed: 2026-08-13
  tasks: 3
  files: 18
status: complete
---

# Phase 15 Plan 07: El paquete completo, la ronda del doctor y el handoff a v1.1 Summary

Las 24 URLs del mapa tienen su documento, la revisión del doctor quedó en una sola ronda de 450
bloques ordenada por riesgo clínico, las columnas `Suggested H1` y `URL` del Sheet del cliente
quedaron llenas para las 16 keywords primarias sin tocar una sola celda ajena, y existe un handoff
que las fases 8 y 10 de v1.1 pueden leer sin abrir ningún otro archivo de este workstream.

## Qué se hizo

**Task 1, los seis documentos cortos y el índice.** Las seis URLs que declararon no competir por
ninguna keyword (`/agendar`, `/blog`, `/contacto`, `/sedes`, `/sobre-el-doctor` y `/testimonios`)
recibieron title y meta nuevos, su H1 publicado transcrito sin cambios y el motivo escrito de por
qué no pelean nada. Ninguna recibe cuerpo de texto: proponérselo les inventaría una intención que
el mapa decidió que no tienen. Después se regeneraron los 24 de una sola pasada, que es lo que
prueba que el paquete entero sale de los datasets. `15-PAQUETE.md` lista las 24 con su acción, su
formato y su archivo, y se genera, no se escribe. Commit `28e3108`.

**Task 2, la ronda del doctor y la auditoría final.** `revision.ts` emite `15-REVISION-DOCTOR.md`
desde los cuatro datasets de copy: 450 bloques con casilla, agrupados en cuatro niveles que no
siguen el orden de las URLs sino el del daño que pueden hacer. La auditoría de duplicados y la
compuerta de YMYL volvieron a correr, ahora sobre el paquete terminado y no sobre metadata pelada,
y siguen dando cero. Commit `d6f4ad9`.

**Task 3, el Sheet y el handoff.** El cargador `kr-h1-push.ts` con sus pruebas (`ba4c5f5`,
`e56ce81`), el handoff con las suyas (`18c1f90`, `8caead1`) y las dos cargas reales contra el
documento del cliente.

## El orden de la ronda del doctor

Es la parte discrecional del plan, así que queda escrita. Los 450 bloques van en cuatro niveles:

| Nivel | Qué agrupa | Por qué va ahí |
|---|---|---|
| 1 | Cuándo consultar de urgencia, qué no hacer, qué significa un síntoma | Es lo que un paciente puede accionar solo con lo que lee |
| 2 | Criterios de cuándo se opera, qué se evalúa, qué alternativas hay | Decide una conducta médica |
| 3 | Qué es cada condición, anatomía, terminología | Descriptivo: importa que esté bien, no urge |
| 4 | Sedes, horarios y datos que confirma la clínica | No es ojo clínico, es confirmación operativa |

Un doctor que tiene que abrir dieciséis archivos para revisar deja la revisión para después, y la
fase se queda entregada a medias por un problema de formato. Los diez datos operativos pendientes
van al final, separados de lo clínico, porque los confirma la clínica y no él.

## Las dos columnas del Sheet, y por qué una no era de esta fase

`Suggested H1` es de esta fase desde el plan 13-01, que la reservó con `field: null` y
`status: "fase-15"`. Se le puso campo y se llenó.

`URL` no la nombra ningún requisito ONPAGE. Quedó declarada `fase-14` con `field: null`: la fase 14
la reservó, produjo el dato que la llena y cerró sin escribirla. Se cierra acá **por oportunidad y
no por alcance**, porque este es el único cargador que vuelve a tocar ese tab y el dato ya vive en
`url-map.jsonl`. Dejar vacía una columna del entregable del cliente teniendo el dato a mano es el
mismo hueco que la verificación de la fase 14 encontró en las columnas de Ahrefs. Conserva su
`status: "fase-14"`, que es de donde viene el dato, y por eso el cargador declara
`estadosPropios: ["fase-14", "fase-15"]`.

**La defensa que este cargador necesita más que los otros.** El tab tiene 5716 filas escritas por
tres fases. El valor por defecto de `upsertRows` habilita fase 12, fase 13, `nueva` y
`no-consultado`, y el escritor junta columnas contiguas en un solo rango: bastaría con que una
columna ajena quedara en medio de dos propias para sobreescribirla sin lanzar nada. Con el permiso
acotado a esos dos estados eso no puede pasar. Y como ampliar un permiso es la clase de cambio que
después nadie revisa, `verificarModelo` exige que esos dos estados habiliten **exactamente dos**
columnas: si alguien agrega una tercera con uno de esos estados, la carga se detiene antes de
escribirla.

La URL que se escribe se lee del mapa y no se deriva de la keyword. Derivarla produciría una ruta
plausible y equivocada, y desharía una asignación medida sin que nadie lo note.

## Las dos cargas reales

Los tres números que pide el criterio, idénticos en las dos corridas:

| Corrida | actualizadas | insertadas | columnasAgregadas | llamadas de red |
|---|---|---|---|---|
| Ensayo (`--dry-run`) | 16 | 0 | 0 | 3 |
| Carga 1 (`--yes`) | **16** | **0** | **0** | 4 |
| Carga 2 (`--yes`) | **16** | **0** | **0** | 4 |

Cero inserciones sobre un tab de 5716 filas y cero columnas agregadas, dos veces seguidas. Es la
prueba de que recargar esto no rompe nada.

**Verificación sobre el documento vivo.** Lectura de solo lectura de las 16 filas: las dos celdas
traen el H1 de `data/onpage.json` y la URL de `url-map.jsonl` en las 16, cero desajustes. Sobre dos
keywords tomadas al azar, `hernia discal` (fila 34) y `ortopedia infantil clínica tezza` (fila 57),
se comparó la fila entera antes y después de las dos cargas: las diecinueve columnas quedaron
idénticas byte a byte, incluidas `Cluster` de la fase 12 y `Traffic Potential`, `Keyword Difficulty`
y `Top Result` de la fase 13, que son las vecinas inmediatas.

## El handoff hacia v1.1

`15-HANDOFF-V11-ONPAGE.md` se genera con `paquete.ts --todos --indice --handoff` y trae seis
secciones en el orden en que v1.1 las necesita: qué se entrega y dónde, la tabla de title y meta de
las 22 URLs con su conteo contra el contrato de 60 y 155, qué recibe cada página (16 con copy
completo, 6 solo metadata, 3 por crear, 3 redirecciones 301), el orden que no se puede invertir, la
restricción del doctor y lo que el handoff no resuelve.

Dos cosas viajan ahí porque si no se pierden en el traspaso:

**El orden de publicar antes de redirigir.** Las dos guías de destino absorben el contenido de los
posts que se apagan. Poner el 301 primero entierra material que todavía no vive en ningún otro
lado, y es el paso más barato, así que es el que se hace primero si nadie lo dice. El documento de
cada post trae la tabla de qué bloque suyo quedó en qué sección de la guía, para que se pueda
comprobar antes de redirigir.

**La aprobación del doctor como bloqueante.** El sello de D-08 lo pone esta fase y no lo levanta
este workstream. Si el handoff lo mencionara como recordatorio, la única protección que tiene el
contenido YMYL del sitio se disolvería en el traspaso. Queda escrito que la fase 8 no publica una
URL cuyo bloque siga sellado.

El handoff también repite el renombre de `/servicios/escoliosis` a
`/servicios/escoliosis-y-deformidades`, que la fase 14 ya había avisado y que arrastra 301, sitemap
y enlaces internos.

## Decisiones tomadas

**La columna huérfana se cierra donde hay oportunidad, y se registra como residuo de la fase
anterior.** No es alcance nuevo de la fase 15 y el SUMMARY lo dice para que la trazabilidad no
cuente como ONPAGE algo que ningún ONPAGE pidió.

**Un permiso ampliado se comprueba en el código, no en la intención.** Ampliar `estadosPropios` de
uno a dos estados es exactamente el cambio que seis meses después nadie recuerda haber revisado.
Por eso hay un criterio que cuenta las columnas de esos estados y exige que sean dos, y falla antes
de escribir si alguien agrega una tercera.

**La ronda se ordena por riesgo y no por URL.** Ordenarla por URL sería más fácil de generar y
haría que el doctor revisara primero lo descriptivo de la primera página alfabética. Lo que puede
hacer daño si está mal va primero.

**El handoff se genera desde los datasets.** Los conteos, las tablas y los diez pendientes de sede
salen de `onpage.json`, `url-map.jsonl` y `copy-sedes.json`. Transcribir 22 filas a mano es el tipo
de trabajo que se desincroniza en la primera corrección y deja al entregable diciendo algo que los
datasets ya no dicen.

## Desviaciones del plan

### Ajustes automáticos

**1. [Regla 2 - Falta crítica] El handoff no tenía cómo generarse**
- **Encontrado en:** Task 3
- **Problema:** el plan pide que el índice y el handoff se generen desde los datasets y que ninguno
  se transcriba a mano. `paquete.ts` sabía emitir el índice con `--indice` y no tenía nada
  equivalente para el handoff, así que el documento habría terminado escrito a mano.
- **Arreglo:** `renderHandoff()` en `paquete.ts` y la bandera `--handoff`, con el mismo patrón que
  `--indice`: los conteos y las tablas salen de `construirOnPage()` y los pendientes de sede de
  `copy-sedes.json`, filtrados por `estado === "pendiente"`.
- **Archivos:** `seo-tools/src/phase15/paquete.ts`, `seo-tools/src/phase15/paquete.test.ts`
- **Commits:** `18c1f90` (pruebas), `8caead1` (implementación)

**2. [Regla 1 - Bug] Conteos escritos a mano dentro del generador del handoff**
- **Encontrado en:** Task 3
- **Problema:** tres frases del handoff traían el número escrito literal ("las 22 URLs", "las dos
  URLs que faltan"). Un documento que se genera pero afirma cantidades a mano es peor que uno
  escrito entero a mano, porque parece sincronizado.
- **Arreglo:** los tres conteos se derivan del dataset.
- **Commit:** `8caead1`

### Sobre la carga del Sheet

La sesión anterior de este plan se cortó por límite de uso justo después de commitear el cargador.
Al leer el documento vivo antes de escribir, las dos columnas ya traían el valor correcto, así que
esa sesión alcanzó a correr la carga. No cambia nada del resultado ni del criterio: las dos
corridas con `--yes` de esta sesión se hicieron igual y reportaron los mismos tres números, que es
justamente lo que la idempotencia tenía que demostrar.

## Verificación

| Comprobación | Resultado |
|---|---|
| Documentos en `paquetes/` | **24**, uno por URL del mapa, ninguna falta |
| Los seis cortos sin cuerpo de texto | 0 traen `<!-- copy:inicio -->` |
| `15-PAQUETE.md` nombra las 24 URLs | 0 ausentes |
| Auditoría sobre el paquete terminado | **0 hallazgos** en las cinco categorías |
| `ymyl.ts --todos` | las 16 páginas pasan a la vez, salida 0 |
| Bloques clínicos en la ronda | 450 con casilla, ninguno se queda afuera |
| `sheet-columns.json`: `Suggested H1` | `field: "suggestedH1"`, `status: "fase-15"` |
| `sheet-columns.json`: `URL` | `field: "url"`, `status: "fase-14"` |
| Columnas con esos dos estados | **2**, ni una más |
| Defensas en el código del cargador | `estadosPropios`, `fase-14`, `fase-15`, `addMissingColumns: false`, `omitirCamposAusentes` |
| Las dos cargas con `--yes` | `actualizadas: 16`, `insertadas: 0`, `columnasAgregadas: 0` en las dos |
| Documento vivo, las 16 filas | 0 desajustes contra `onpage.json` y `url-map.jsonl` |
| Documento vivo, 2 keywords al azar | las 19 columnas idénticas antes y después; vecinas de las fases 12 y 13 intactas |
| URLs con keyword primaria en el mapa | 16 |
| Filas de `onpage.json` con primaria y H1 | 16 |
| El handoff nombra las 22 URLs con metadata | 0 ausentes |
| `escoliosis-y-deformidades` en el handoff | 3 menciones |
| Determinismo del handoff | mismo SHA-256 en dos corridas |
| `npm test` en seo-tools | **638 en verde**, 0 fallos |
| `npm run typecheck` en seo-tools | sin salida |
| SHA-256 de `data/url-map.jsonl` | `ada0a4a1...951b5`, sin cambios |
| Cuota de SerpApi | **96**, ni una búsqueda gastada en los siete planes de la fase |
| `git diff --cached --name-only -- src/` | vacío en los cuatro commits |

## Requisitos que cierra

- **ONPAGE-02**, del lado del Sheet: `Suggested H1` lleno para las 16 primarias, cero inserciones y
  cero columnas agregadas.
- **ONPAGE-05**: la auditoría sigue en cero, ahora sobre el paquete terminado y no solo sobre la
  metadata, y `15-AUDITORIA.md` deja escrito que dio limpia **antes de que v1.1 publique**, que es
  el momento en que sirve.
- **ONPAGE-06**: existe un paquete por URL, con índice y handoff autocontenido, que quien ejecute
  las fases 8 y 10 de v1.1 puede abrir e implementar de corrido.

Con esto la fase 15 queda cerrada y con ella el milestone v1.2 en lo que hace a ejecución de planes.

## Lo que queda del otro lado

- **La ronda del doctor está armada, no respondida.** 450 casillas esperando. Es bloqueante para la
  fase 8 de v1.1 y no lo levanta este workstream.
- **Diez datos operativos de sede sin confirmar.** Están en la ficha de cada sede, en tabla aparte,
  y al final de la ronda. v1.1 no publica esa sede hasta resolverlos.
- **Los 135 enlaces internos de la fase 14 son especificación.** Los escribe v1.1 en el código.

## Self-Check: PASSED

Comprobados en disco los 24 documentos de `paquetes/`, `15-PAQUETE.md`, `15-REVISION-DOCTOR.md`,
`15-AUDITORIA.md`, `15-HANDOFF-V11-ONPAGE.md`, `seo-tools/src/phase15/kr-h1-push.ts` y su prueba.
Comprobados en `git log` los commits `28e3108`, `d6f4ad9`, `ba4c5f5`, `e56ce81`, `18c1f90` y
`8caead1`.
