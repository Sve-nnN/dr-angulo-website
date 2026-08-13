---
phase: 13-clusters-competencia-y-las-10-de-oro
workstream: seo-keywords
plan: 02
subsystem: seo-tools
tags: [serp, cuota, clusters, kwr-04, comp-03]
status: complete
requires:
  - "seo-tools/src/quota.ts (libro de cuota persistido, fase 12)"
  - "seo-tools/src/cache.ts (seam de cache, fase 12)"
  - "serpCompleta() y src/phase13/serp.ts (plan 13-01)"
  - "src/phase13/pagetype.ts (clasificador, plan 13-01)"
  - "data/serp-candidates.json aprobado por Juan (tareas 1 y 2)"
provides:
  - "techo ACUMULADO de cuota que sobrevive entre corridas, con salida 4"
  - "las 84 capturas nuevas de la SERP de Lima en .cache/serpapi/"
  - "seo-tools/data/clusters.json: 31 clusters con tipo de pagina y topResult"
  - "seo-tools/data/keyword-clusters.jsonl: cluster y procedencia por keyword objetivo"
  - "13-CLUSTERS.md: el entregable legible de KWR-04"
affects:
  - 13-03
  - 13-04
  - 13-05
  - fase-14
tech-stack:
  added: []
  patterns:
    - "Techo acumulado leido de quota.total(), porque --max-searches topea por corrida"
    - "Confirmacion explicita con --yes en toda operacion que gasta un recurso agotable"
    - "Marca de procedencia por fila cuando conviven dos calidades de dato"
key-files:
  created:
    - seo-tools/src/phase13/capture.ts
    - seo-tools/src/phase13/capture.test.ts
    - seo-tools/src/phase13/serp-capture.ts
    - seo-tools/src/phase13/cluster.ts
    - seo-tools/src/phase13/cluster.test.ts
    - seo-tools/src/phase13/serp-cluster.ts
    - seo-tools/data/clusters.json
    - seo-tools/data/keyword-clusters.jsonl
    - .planning/workstreams/seo-keywords/phases/13-clusters-competencia-y-las-10-de-oro/13-CLUSTERS.md
  modified: []
decisions:
  - "El techo acumulado vive en capture.ts y no en quota.ts: quota.ts esta cerrado desde la fase 12 y el techo es una regla de ESTA fase"
  - "Umbral de similitud de la cola en 0,5, con el termino clinico compartido como segunda condicion obligatoria"
  - "El geo se quita antes de medir el parecido: es terreno, no tema"
  - "Se conserva la regla de nombre del plan aunque produzca un nombre pobre para el cluster mas grande; renombrar es gratis, recapturar no"
metrics:
  duration: "~1h 15min"
  completed: "2026-08-11"
  tasks: 2
  commits: 2
  tests_before: 325
  tests_after: 349
  serpapi_searches_spent: 84
---

# Phase 13 Plan 02: 84 búsquedas gastadas una sola vez, y el universo agrupado por lo que Google devuelve

Las 84 búsquedas que faltaban salieron en un solo disparo bajo un techo que se hace cumplir
solo, el libro cerró en 96 contra un techo de 102, y las 4.766 keywords de alcance objetivo
quedaron repartidas en 31 clusters donde cada fila declara si su cluster lo validó Google o lo
infirió el parecido de texto.

## El balance de cuota, con las cifras reales

| Concepto | Valor |
|---|---|
| Libro al abrir la tarea 3 | 12 |
| Consultas emitidas | **84** |
| Aciertos de caché (coste cero) | 7 |
| **Libro al cerrar** | **96** |
| Techo acumulado de la fase | 102 |
| Holgura que quedó bajo el techo | 6 |
| SERP vacías | 0 |
| Cabezas sin cupo | 0 |
| Gasto imputable a la fase | 84 |
| **Reserva del proveedor hasta el 2026-08-21** | **30** |

Las 30 que quedan son las 24 de reserva de D-01 más las 6 de holgura que la lista aprobada no
llegó a usar. Los archivos bajo `.cache/serpapi/` pasaron de 12 a 96 y ninguna de las 12
originales se tocó.

## Por qué hacía falta un techo nuevo, si ya había un libro de cuota

`QuotaBook.ensureCapacity` topea `maxPerRun` contra `runCalls`, que es un contador **de la
corrida**. `total()` es el acumulado entre corridas y `ensureCapacity` no lo mira nunca. La
consecuencia es directa y no se ve leyendo `quota.ts`: `--max-searches 84` invocado dos veces
gasta 168. El presupuesto de la fase no es "84 por corrida", es "90 en total hasta el
2026-08-21", así que la reserva de 24 solo es real si algo la hace cumplir **entre** corridas.

Eso es todo lo que agrega `capture.ts`, y la razón quedó escrita en su cabecera:

```
disponibles = 102 - quota.total("serpapi")
si disponibles <= 0  ->  aborta con código 4 SIN emitir nada
maxPerRun = min(--max-searches, disponibles)
```

El aborto ocurre en la planificación y no dentro del bucle. Esa distinción es la que garantiza
que en el caso de techo alcanzado no salga ni una consulta: si abortara dentro del bucle, la
primera ya habría salido.

`QuotaExceededError` ya salía con código 4 desde la fase 12, así que no hizo falta inventarlo.

Las dos pruebas que el plan exige por nombre:

- `con el libro de cuota en el techo de 102 la corrida aborta con codigo 4 y NO emite ninguna consulta`
- `maxPerRun se recorta al remanente acumulado y no al valor de la bandera` — con el libro en
  100 y la bandera en 84, `maxPerRun` sale 2.

## El corte por techo no tumba la corrida, y eso importa

Cuando el tope corta, la cabeza se registra como `sin-cupo` y la corrida **sigue**, porque las
que quedan pueden estar en caché y esas son gratis. Abortar temprano perdería aciertos de caché
que no cuestan nada: sería pagar dos veces la misma prudencia. Hay una prueba que lo fija, con
la cacheada puesta a propósito después del corte.

## El ensayo antes del disparo

La corrida en seco salió con código 0 y dejó el libro exactamente donde estaba: **12 antes, 12
después**. Proyectó 84 consultas, 7 aciertos y una reserva final de 30, que es literalmente lo
que después ocurrió. Sin `--yes` no sale ninguna consulta, que es el mismo contrato de
confirmación que la fase 12 usó para toda operación que gasta o destruye.

El punto de entrada además **vuelve a medir contra el disco** cuáles están en caché, con la
misma función de clave que usa el seam, en vez de creerle al campo `enCache` del archivo. Si
entre la generación de la lista y la captura alguien hubiera capturado o borrado algo, la
medición de ahora es la que dice la verdad sobre el gasto. No hubo discrepancias.

## Los clusters

31 clusters sobre 91 cabezas con SERP propia. Las 4.766 filas de alcance objetivo están todas
asignadas o explícitamente sin cluster:

| Procedencia | Filas |
|---|---|
| Validadas contra Google (`clusterFuente: "serp"`) | **91** |
| Inferidas por parecido de texto (`clusterFuente: "texto"`) | **2.348** |
| Sin cluster (`clusterFuente: null`) | **2.327** |
| **Total** | **4.766** |

**Cero filas de la cola llevan `topResult`.** Es el mismo criterio por el que la fase 12 deja la
celda de volumen vacía en vez de escribir cero: escribir ahí el resultado de otra keyword sería
afirmar algo que nadie midió.

Clusters por tipo de página dominante, que es el dato que COMP-03 pide y el que la fase 14 usa
para decidir si una URL hay que dejarla, reescribirla o crearla:

| Tipo de página | Clusters |
|---|---|
| contenido internacional | 14 |
| página de servicio | 6 |
| directorio | 5 |
| guía | 3 |
| otro | 2 |
| red social | 1 |

## El hallazgo que cambia la fase 14

**Cuarenta y una de las 91 cabezas cayeron en un solo cluster, y no es un defecto del
algoritmo: es lo que Google devuelve.** Lo sostienen 129 uniones por pares, cada una con tres o
más URLs compartidas en el top 10, y las URLs que se repiten son las de los competidores reales:
`drcarranzacolumna.com`, `clinicarthromeds.pe/traumatologo-especialista-en-columna-lima-peru`,
`cirujanocolumna-elaos.com`, `clinicasanfelipe.com/unidad-de-columna-y-medula-espinal`.

Es decir: en Lima, `traumatólogo lima`, `cirujano de columna surco`, `neurocirujano san isidro`,
`ortopedia infantil lima` y `traumatología especialista en columna` **son la misma SERP**. Google
las trata como una sola intención, que en lenguaje llano es "encontrar un especialista de columna
o trauma en Lima".

Para la fase 14 eso significa que esas 41 consultas **no son 41 páginas, son una**. Escribir una
landing por cada modificador geográfico sería canibalizarse a sí mismo. El patrón a replicar ya
está a la vista y es el de `clinicarthromeds.pe`, con la URL construida sobre la keyword geo.

Los demás clusters con más de una cabeza son los que uno esperaría, y sirven como control de que
el umbral no está pegando cualquier cosa: `escoliosis` con `escoliosis y deformidades de
columna`; `estenosis espinal` con `estenosis de canal`; `hernia discal` con `hernia discal
lumbar y cervical`; y los seis de `desgarro muscular`, que absorbieron las cuatro formas de
preguntar cómo se cura.

Las tres sedes quedaron cada una en su propio cluster —Ricardo Palma, Sanna y Tezza—, y las tres
con un tipo de página distinto: página de servicio, red social y directorio. Esa diferencia es
dato útil para la fase 14, porque dice que la sede de Ricardo Palma es la única de las tres donde
hoy se pelea con contenido propio.

## El algoritmo de la cola, con las cifras que produjo

Índice de Jaccard sobre los tokens normalizados, sin palabras vacías y sin modificadores
geográficos, con umbral **0,5**, más la condición de compartir **al menos un término clínico de
cuatro letras o más**. Hacen falta las dos condiciones.

Similitud media de las 2.348 filas asignadas: **0,582**.

**El geo se quita antes de medir, a propósito.** Si se dejara, `traumatólogo lima` y `escoliosis
lima` compartirían `lima` y puntuarían como si hablaran de lo mismo. El geo es terreno, no tema.

**El término clínico compartido es lo que impide el falso positivo que el plan nombra:** `hernia
discal lima` y `hernia inguinal lima` puntúan 1/3, quedan debajo del umbral y no se pegan. Una
hernia inguinal no es de columna.

El umbral resultó ser una perilla plana, y eso es buena señal sobre la robustez del criterio.
Medido sobre el universo real:

| Umbral | Por texto | Sin cluster |
|---|---|---|
| 0,34 | 2.560 | 2.115 |
| 0,40 | 2.556 | 2.119 |
| 0,45 | 2.348 | 2.327 |
| **0,50** | **2.348** | **2.327** |

Entre 0,34 y 0,5 la diferencia es de 212 filas, un 4 %. La cobertura no la limita el Jaccard sino
la condición de término clínico compartido, así que se eligió 0,5, que es el extremo conservador
y el que deja más margen sobre el caso de la hernia inguinal.

**Que 2.327 filas queden sin cluster es información, no un fallo.** Son keywords que no comparten
término clínico con ninguna cabeza: `cervicalgia y dorsalgia`, `qué es la escoliosis cifosis y
lordosis`, `operación de fractura vertebral`, nombres propios de otros profesionales, tiendas de
insumos. Forzarles una asignación dudosa ensuciaría el dataset justo donde la fase 14 va a
apoyarse.

## Por qué se comparan URLs completas y no dominios

Dos artículos distintos de la misma clínica no son la misma respuesta de Google. Si se comparara
por dominio, `mayoclinic.org` —que el plan 13-01 midió en 46 de 95 resultados orgánicos— pegaría
entre sí a casi todas las condiciones del universo y el clustering no diría nada. La comparación
normaliza esquema, `www.`, barra final, fragmento y parámetros de rastreo, y ordena los que
quedan.

## Criterios de aceptación, con la salida real

| Criterio | Resultado |
|---|---|
| `npm run typecheck` | `tsc --noEmit` sin salida |
| Suite completa sin credenciales | `tests 349 · pass 349 · fail 0` |
| Corrida en seco con código 0 y sin mover el libro | `ANTES=12`, `DESPUES DEL ENSAYO=12`, `EXIT=0` |
| Corrida real con código 0 | exit 0, 84 emitidas, 0 sin cupo |
| `sources.serpapi.calls` ≤ 102 | **96** |
| Prueba de aborto en 102 sin emitir | existe y pasa |
| Prueba de `maxPerRun` recortado al remanente | existe y pasa |
| Archivos bajo `.cache/serpapi/` ≥ 90 y las 12 originales | **96**, las 12 intactas |
| Prueba de tres URLs juntan y dos separan | existe y pasa |
| Prueba de transitividad de la unión | existe y pasa |
| Prueba de texto casi idéntico con SERP disjunta | existe y pasa |
| `keyword-clusters.jsonl` con una línea por objetivo | **4.766** de 4.766 |
| `clusterFuente` con tres valores como mucho | `["serp","texto",null]` |
| Cero filas por texto con `topResult` | **0** |
| Todo cluster con tipo de página y cabeza | 31 de 31 |
| Dos corridas, mismo SHA-256 | idéntico en los dos archivos |
| `data/keywords.jsonl` conserva su SHA-256 | `c59dad2d…eac`, intacto |
| `13-CLUSTERS.md` con fila por cluster y la advertencia arriba | 31 filas, muestra truncada declarada |
| T-13-12: `.cache` gitignoreado | `git check-ignore` sale 0 |
| T-13-SC: cero paquetes instalados | `package.json` sin cambios en los 2 commits |
| `exclude` del `tsconfig.json` de la raíz | intacto |

## Desviaciones del plan

Ninguna que haya cambiado el comportamiento pedido. Dos ajustes de forma sobre el trabajo
parcial que había quedado sin commitear:

**1. [Regla 1 - Bug] El cálculo de reserva del ensayo estaba mal escrito.**
- **Encontrado en:** tarea 3, al revisar la salida del ensayo antes de disparar
- **Problema:** la expresión que imprimía la reserva restaba dos veces el acumulado y habría
  mostrado una reserva equivocada justo en la pantalla que se mira antes de gastar
- **Arreglo:** se extrajo `gastoDeLaFase` y la reserva pasó a ser `114 - gastoDeLaFase`. El
  ensayo proyectó 30 y la corrida real terminó en 30
- **Archivos:** `seo-tools/src/phase13/serp-capture.ts`
- **Commit:** `a5b224a`

**2. [Regla 2 - Precisión] El aviso de discrepancia de caché afirmaba el valor del disco por
negación.**
- **Problema:** derivaba el valor medido como `!enCache` del archivo en vez de leer la medición
  real, así que si alguna vez hubiera coincidido por casualidad habría informado mal
- **Arreglo:** el aviso ahora lleva los dos valores medidos de verdad
- **Archivos:** `seo-tools/src/phase13/serp-capture.ts`
- **Commit:** `a5b224a`

## Juicio sobre el trabajo parcial que había quedado sin commitear

`capture.ts` estaba sin commitear al empezar. Se revisó antes de tocarlo y **el razonamiento del
techo acumulado era correcto**, incluidas las tres constantes y la decisión de abortar en la
planificación. Se terminó, no se reemplazó. La única corrección de fondo que necesitaba estaba
fuera de él, en el punto de entrada que todavía no existía.

Un detalle que confirmó el diseño: en `cache.ts` la lectura de caché ocurre **antes** de
`ensureCapacity`, así que un acierto de caché nunca lanza por cuota. Eso es lo que hace correcto
seguir la corrida después del corte por techo.

## Lo que la fase 13-04 tiene que saber

**1. El cluster más grande tiene un nombre pobre y renombrarlo es gratis.** El de 41 cabezas se
llama `traumatólogo ortopedia infantil` porque la regla del plan nombra por la cabeza de mayor
valor de negocio y esa keyword quedó con `rango: 0` al ser la que Juan agregó en la revisión. Su
rango automático era 5. El nombre no describe bien un cluster que en realidad es "especialista de
columna y trauma en Lima". Se dejó la regla del plan intacta a propósito: cambiarla habría
requerido inventar un dato que no está en el archivo, y renombrar un cluster en 13-04 no cuesta
ninguna búsqueda. Las 41 cabezas están listadas en `clusters.json` para poder hacerlo.

**2. `keywords.jsonl` sigue sin el campo `cluster`, y eso es una trampa activa.** El riesgo que
dejó abierto el plan 13-01 sigue vigente: al ser `Cluster` y `Top Result` columnas de `fase-13`,
un `sheet:push` que cargue `keywords.jsonl` sin el campo `cluster` escribiría celda vacía y
borraría lo recién escrito, sin lanzar nada. El join entre `keywords.jsonl` y
`keyword-clusters.jsonl` hay que hacerlo **antes** de empujar, o hace falta la opción de "no
escribir la celda cuando el campo está ausente" en `upsertRows`, con su prueba.

**3. Quedan 30 búsquedas de SerpApi hasta el 2026-08-21**, y el techo de `capture.ts` está en
102. Cualquier captura adicional de esta fase hay que pedirla con `--ceiling` explícito, que es
una decisión de presupuesto de Juan y no del comando.

**4. El gap de COMP-02 ya se puede derivar sin gastar nada.** Las 96 capturas en caché tienen
dentro a los cinco competidores; quién aparece dónde el doctor no es una consulta sobre disco.

## Known Stubs

Ninguno. Los tres artefactos están escritos con datos reales y ninguna función devuelve un valor
fijo a la espera de implementación.

Sí hay una limitación medida y declarada: **30 de las 2.348 filas asignadas por texto tienen olor
a tienda o insumo** (`ortopedia glinsa`, `ortopedia deseret lima`, `material traumatología perú`).
Son el 1,3 % y la mayoría son en realidad `precio de <condición>`, que están bien clasificadas.
No se filtraron porque son filas de cola y no cuestan búsquedas; si molestan en el documento del
cliente, el filtro va en 13-04.

## Self-Check: PASSED

Archivos declarados como creados, verificados en disco: los 9 existen.
Commits declarados, verificados en `git log`: `a5b224a`, `4b085b2`.
Contador de SerpApi al cerrar: **96**, contra un techo de 102.
`data/keywords.jsonl` con el SHA-256 de apertura: `c59dad2d…eac`.
