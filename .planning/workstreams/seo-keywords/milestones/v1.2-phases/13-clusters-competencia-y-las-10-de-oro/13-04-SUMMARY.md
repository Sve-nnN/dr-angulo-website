---
phase: 13-clusters-competencia-y-las-10-de-oro
workstream: seo-keywords
plan: 04
subsystem: seo-tools
tags: [ahrefs, gap, punto-dulce, sheets, kwr-05, comp-02, comp-04, sheet-01, sheet-03]
status: complete
requires:
  - "src/phase13/ahrefs.ts, ahrefs-plan.ts, ahrefs-ingest.ts (plan 13-03)"
  - "src/phase13/serp.ts y pagetype.ts (plan 13-01)"
  - "src/phase13/cluster.ts y las 96 capturas de SerpApi (plan 13-02)"
  - "src/sheets/upsert.ts (fase 12) y column-upsert.ts (plan 13-03)"
  - "data/competitors.json con las 24 consultas de Ahrefs ya ingeridas (plan 13-03)"
provides:
  - "data/keyword-gap.json: el gap por competidor con su cobertura declarada (COMP-02)"
  - "data/sweet-spot.jsonl: alcanzabilidad de las 91 cabezas con sus razones en texto (KWR-05)"
  - "data/keywords-13.jsonl: la vista consolidada de la fase, 5.716 lineas (SHEET-01)"
  - "data/ahrefs-keywords.jsonl: el esqueleto de KD y traffic potential por cabeza"
  - "upsertRows con omitirCamposAusentes: la red de seguridad contra el borrado silencioso"
  - "13-PUNTO-DULCE.md: el entregable legible de KWR-05"
  - "el cluster de 41 cabezas renombrado a lo que de verdad es"
affects:
  - 13-05
  - fase-14
  - fase-15
tech-stack:
  added: []
  patterns:
    - "El criterio discutible vive en un archivo de datos con su motivo y su fecha, nunca en un umbral escrito en el codigo"
    - "Omitir una celda PARTIENDO EL RANGO, no mandando un valor especial que la API tenga que interpretar"
    - "Guarda de consolidacion que cuenta lineas sin valor y exige cero antes de escribir"
    - "Punto de entrada con guarda de argv, para que la prueba pueda importar la logica"
key-files:
  created:
    - seo-tools/src/phase13/ahrefs-keywords.ts
    - seo-tools/src/phase13/ahrefs-keywords.test.ts
    - seo-tools/src/phase13/kw-metrics.ts
    - seo-tools/src/phase13/gap.ts
    - seo-tools/src/phase13/gap.test.ts
    - seo-tools/src/phase13/comp-gap.ts
    - seo-tools/src/phase13/sweet-spot.ts
    - seo-tools/src/phase13/sweet-spot.test.ts
    - seo-tools/src/phase13/build-dataset.ts
    - seo-tools/src/phase13/build-dataset.test.ts
    - seo-tools/src/phase13/kw-push.ts
    - seo-tools/data/cluster-nombres.json
    - seo-tools/data/serp-alcanzabilidad.json
    - seo-tools/data/ahrefs-keywords.jsonl
    - seo-tools/data/keyword-gap.json
    - seo-tools/data/sweet-spot.jsonl
    - seo-tools/data/keywords-13.jsonl
    - .planning/workstreams/seo-keywords/phases/13-clusters-competencia-y-las-10-de-oro/13-PUNTO-DULCE.md
  modified:
    - seo-tools/src/sheets/upsert.ts
    - seo-tools/src/sheets/upsert.test.ts
    - seo-tools/src/sheets/column-upsert.test.ts
    - seo-tools/src/phase13/ahrefs.ts
    - seo-tools/src/phase13/ahrefs-plan.ts
    - seo-tools/src/phase13/cluster.ts
    - seo-tools/src/phase13/cluster.test.ts
    - seo-tools/src/phase13/serp-cluster.ts
    - seo-tools/data/sheet-columns.json
    - seo-tools/data/clusters.json
    - seo-tools/data/keyword-clusters.jsonl
    - seo-tools/data/competitors.json
    - seo-tools/data/ahrefs-usage.json
    - .planning/workstreams/seo-keywords/phases/13-clusters-competencia-y-las-10-de-oro/13-CLUSTERS.md
decisions:
  - "El punto dulce se mide contra la CALIDAD DEL CONTENIDO del top 10 y no contra el perfil de enlaces: la medicion de competencia invalido el encuadre del ROADMAP"
  - "Sin una sola posicion disputable, ningun KD bajo rescata una cabeza. El KD es un promedio de mercado y no sabe quien ocupa la SERP"
  - "Ocho filas del tab de competencia dejan de decir no_consultado porque el dato SI se consulto en el plan 13-03 y estaba en cache"
  - "La celda se omite partiendo el rango y no mandando un valor nulo: no se le confia al proveedor la integridad de los datos del cliente"
metrics:
  duration: "~3h"
  completed: "2026-08-11"
  tasks: 3
  commits: 4
  tests_before: 349
  tests_after: 395
  serpapi_searches_spent: 0
  ahrefs_units_spent: 0
---

# Phase 13 Plan 04: el punto dulce cambia de eje, y el tab del cliente deja de mentir sobre lo que sabe

Las 91 cabezas quedaron ordenadas por lo que de verdad decide si se ganan —**quién ocupa hoy su
top 10**, no cuántos enlaces hacen falta—, el gap por competidor salió de las 96 capturas ya
pagadas sin gastar una búsqueda más, y los dos tabs del cliente se cargaron sin duplicar ni
borrar nada. **Falta el KD**: el servidor MCP de Ahrefs no responde en esta sesión y las 91
consultas de keyword siguen sin emitirse.

## Lo primero que hay que leer: la precondición de la tarea 1 no se cumplió

**El servidor MCP de Ahrefs no está disponible en la sesión que ejecutó este plan.** No hay
herramienta `mcp__*ahrefs*` expuesta, y `.secrets/.env` sigue con las cuatro variables de
siempre —`DINORANK_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_FILE`, `SEO_SHEET_ID`, `SERPAPI_API_KEY`—
y ninguna de Ahrefs. Es exactamente el mismo bloqueo que detuvo al plan 13-03 en su tarea 1.

Lo que se hizo con eso, y por qué:

- **No se inventó ni un número.** Las 91 cabezas de `data/ahrefs-keywords.jsonl` declaran sus
  tres métricas como `no_consultado`, que es distinto de cero y distinto de "la fuente no la
  conoce". Los tres estados existen y hay una prueba por cada uno.
- **Se construyó y se probó todo el camino**, igual que hizo 13-03 con los dominios, de modo
  que la sesión que sí tenga el MCP cierre esto con dos comandos. El traspaso exacto está más
  abajo.
- **El resto del plan NO depende del KD.** El gap es coste cero sobre capturas ya pagadas, y el
  punto dulce, bajo el encuadre nuevo, se resuelve por la SERP —la mitad que sí existe—, que es
  literalmente lo que el bloque `<behavior>` de la tarea 3 manda hacer con una cabeza sin KD.
  Detener el plan entero habría dejado sin entregar tres requisitos que no tocan a Ahrefs.

Cuando el KD llegue, volver a correr `sweet-spot.ts` y `build-dataset.ts` no cuesta ninguna
búsqueda ni ninguna unidad: los dos leen de disco.

## El cambio de fondo: el punto dulce ya no se mide con enlaces

El ROADMAP define KWR-05 como *"las keywords cuyo KD es alcanzable con el perfil de enlaces real
del dominio"*. **La medición de competencia del 2026-08-11 invalida ese encuadre**, y es el
hallazgo más consecuente del milestone hasta acá:

| Hecho medido | Consecuencia |
|---|---|
| En los **cinco** competidores la home concentra todos los referring domains y las interiores tienen **0** | Las páginas que rankean lo hacen por contenido |
| `clinicarthromeds.pe`: 371 en la home, **0** en cada una de las nueve que traen el tráfico (98, 71, 65, 16…) | El tráfico y los enlaces están en páginas distintas |
| Tres de los cinco tienen **cero** tráfico orgánico, incluido `doctormunguia.com`, que lidera el pack local con 4,8 y 24 reseñas | Su visibilidad es Maps, no Search: son dos canales |
| Línea de base propia: DR 0, rank `null`, 0 backlinks, 0 keywords, 0 tráfico | El punto de partida no es la barrera que parecía |

**Los enlaces no son el factor limitante en este nicho. El contenido sí.** Así que la
alcanzabilidad se calcula contra la calidad del contenido que ocupa el top 10.

### Cómo quedó operacionalizado

Cada una de las **768 posiciones** del top 10 de las 91 capturas recibe un veredicto, con las
reglas en `data/serp-alcanzabilidad.json` y no en el código:

| Veredicto | Quién la ocupa | Posiciones | % |
|---|---|---:|---:|
| **disputable** | médico o clínica pequeña, sin marca | 288 | 37,5 % |
| **disputable** | directorio o red social | 178 | 23,2 % |
| **barrera** | grupo clínico con marca | 161 | 21,0 % |
| **barrera** | contenido internacional | 141 | 18,4 % |
| | **disputables en total** | **466** | **60,7 %** |

Los 13 dominios de la lista de marca fuerte salieron de **medir** quién ocupa esas 768
posiciones, no de suponer: Clínica Internacional 33, Ricardo Palma 18 más 13 de su instituto,
San Juan de Dios 18, Anglo Americana 17, SANNA 17, San Felipe 15, Tezza 14, Auna 10 más 6 de su
blog.

## El punto dulce, con las cifras

**91 cabezas evaluadas · 66 alcanzables** (45 de alcance alto, 21 medio, 25 bajo).

El reparto por intención es la respuesta a la pregunta que 13-05 tiene que contestar:

| Intención | alto | medio | bajo |
|---|---:|---:|---:|
| **transaccional** | **37** | 11 | 6 |
| comercial | 6 | 7 | 10 |
| informacional | 2 | 3 | 9 |

**Las transaccionales son alcanzables y las informacionales no**, y las dos cosas tienen la
misma causa. Una SERP de `neurocirujano surco` la ocupan médicos individuales, fichas de
Doctoralia y posts de Facebook: nueve de nueve disputables. Una de `ciática` —8.100 de volumen,
el mayor del universo objetivo— la ocupan Mayo Clinic, MedlinePlus y Quirónsalud: 3 de 7
disputables, y por eso queda en alcance bajo pese al volumen.

Los cinco de mayor volumen que **quedaron fuera**, con la razón medida:

| Cabeza | Volumen | Disputables | Por qué |
|---|---:|---:|---|
| ciática | 8.100 | 3/7 | contenido internacional en la cabecera |
| desgarro muscular | 5.400 | 3/8 | ídem |
| desgarro muscular tratamiento | 590 | 2/7 | ídem |
| reumatólogo o traumatólogo | 260 | 2/7 | comparativa genérica, no local |
| cómo curar desgarro muscular | 110 | 3/8 | contenido internacional |

Y el alcance alto se concentra donde el negocio está: **29 de las 45 cabezas de alcance alto
pertenecen al cluster de 41**, el de la demanda geo de especialista de columna y trauma en Lima.

**La consecuencia para 13-05, dicha explícitamente: las 10 de Oro pueden ser más ambiciosas de
lo que el roadmap suponía.** El campo está flojo y el 61 % de las posiciones son disputables sin
una campaña de enlaces.

## El gap, con coste adicional cero

El contador de SerpApi **no se movió**: 96 antes y 96 después, medido en el mismo comando.

**Cobertura declarada: 91 SERP medidas, 4.675 sin medir, sobre un universo objetivo de 4.766.**
Ese bloque no es relleno. Sin él, "el doctor no aparece en 60 keywords" se lee como un
diagnóstico del sitio, cuando es la suma de un diagnóstico y de un límite de presupuesto.

| Competidor | Gap | En top 10 | En pack local | Mejor posición |
|---|---:|---:|---:|---:|
| clinicarthromeds.pe | **27** | 27 | 14 | 1 |
| drcarranzacolumna.com | 17 | 17 | 0 | 3 |
| cirujanocolumna-elaos.com | 10 | 10 | 0 | 1 |
| drciezatraumatologia.com | 5 | 5 | 5 | 1 |
| doctormunguia.com | 1 | 1 | 5 | 7 |

**Competencia directa: cero.** El doctor no aparece en ninguna posición de ninguna de las 91
SERP capturadas. No hay ni una keyword donde él y un competidor compartan página. Es un punto de
partida limpio, y confirma la línea de base de 0 keywords orgánicas que dio Ahrefs.

`doctormunguia.com` vuelve a mostrar el patrón: **1 aparición orgánica y 5 en el pack local**.
Los dos canales son independientes, y este es el segundo dato que lo demuestra.

**Destacados: 0 medidos sobre 91 capturas.** La línea aparece igual, con el total sobre el que
se midió. Medido en cero y no medido son cosas distintas.

**Marca ajena: 15 keywords, todas con `objetivo: false`** y su motivo escrito. Las dos primeras
son las que nombra D-14 y son las de mayor volumen de todo el universo: `clínica san bernardo
especialistas en traumatología` con 2.400 y `clínica de traumatología arthrosalud` con 1.600.
Cualquiera que ordene el Sheet por volumen las va a ver primero, y ahora hay dónde leer por qué
no están en ninguna lista de objetivos.

## La trampa que dejó abierta el plan 13-01, cerrada por los dos lados

`data/keywords.jsonl` no tiene el campo `cluster`. Con `Cluster` y `Top Result` habilitadas como
columnas de fase 13, un `sheet:push` de ese dataset escribiría **celda vacía en 5.716 filas** y
borraría lo recién escrito, sin lanzar ninguna excepción.

Se cerró por los dos lados, a propósito:

1. **El dataset correcto existe.** `build-dataset.ts` une las tres fuentes en
   `data/keywords-13.jsonl`, y es esa vista la que se carga.
2. **`upsertRows` aprendió `omitirCamposAusentes`.** Con la opción activa, una columna cuyo
   campo el registro no trae queda **intacta** en vez de borrarse. Y la celda se omite
   **partiendo el rango**, no mandando un valor nulo: depender de que la API interprete un nulo
   como "no tocar" sería confiarle al proveedor la integridad de los datos del cliente. Hay una
   prueba que afirma que ningún rango emitido cubre la columna omitida, y otra que impide el
   fallo sutil de que dos filas con omisiones distintas viajen en el mismo rectángulo.
3. **`kw-push.ts` además rechaza de plano** cualquier dataset cuyas filas no traigan los cuatro
   campos de esta fase, y el error nombra el comando que genera el correcto.

`src/sheets/upsert.ts` es el único archivo compartido que se tocó, y este plan corrió solo en su
wave.

## Las dos cargas al Sheet, con la salida real

### `Competitor Analysis` (transpuesto)

```
Primera carga:   columnas actualizadas: 0   columnas nuevas: 5   celdas: 145   rangos: 35
Segunda carga:   columnas actualizadas: 5   columnas nuevas: 0   celdas: 145   rangos: 35
filas que se escriben (29): 2,3,5..10,12..16,18..22,24,26..30,32..36
filas que NO se tocan (7): 1, 4, 11, 17, 23, 25, 31
```

Los siete títulos de sección quedaron fuera de todo rango, por construcción. El residuo de
plantilla (`pera`, `pera.com`, DR 20, AR 13, `United States`, 6) quedó reutilizado por la
primera ranura, que es lo que el escritor de 13-03 hace en vez de borrarlo aparte.

### `Keyword Research`

```
Ensayo:          actualizadas: 5716   insertadas: 0   columnas agregadas: 0   llamadas de red: 3
Primera carga:   actualizadas: 5716   insertadas: 0   columnas agregadas: 0   llamadas de red: 5
Segunda carga:   actualizadas: 5716   insertadas: 0   columnas agregadas: 0   llamadas de red: 5
```

Leído de vuelta del documento real, después de las dos cargas:

| Comprobación | Resultado |
|---|---|
| `Keyword Difficulty` vacía | **0 de 5.716** |
| `Keyword Difficulty` con el literal `no_consultado` | **5.716** |
| `Cluster` llena | 2.439 |
| `Top Result` llena | **91**, solo las cabezas |
| `URL` llena | **0** (es de la fase 14) |
| `Suggested H1` llena | **0** (es de la fase 15) |
| `Search Volume` vacía | 629 |
| `Search Volume` escrita como `0` | 3.020 |

Los 3.020 ceros son **ceros reales**: las tres mil filas los tienen con
`searchVolumeFuente: "dinorank"`. Los 629 vacíos son los `null` con `sin_datos`. La distinción
que la fase 12 defendió sobrevivió al cambio de dos columnas de literal a campo, que es
exactamente lo que T-13-30 pedía proteger.

## Ocho filas del tab de competencia dejaron de mentir

El plan 13-01 declaró `Estimated Monthly Search Traffic`, `Estimated Top 100 Keyword Rankings`,
`Do they have a blog?`, las cinco `Top page` y las cinco `Most linked content` como
`no_consultado`, suponiendo que quedaban fuera del `select` recortado de D-07. **No quedaron
fuera**: `site-explorer/metrics` trajo el tráfico y las keywords en la misma llamada, y
`site-explorer/top-pages` trajo las diez páginas. El dato lleva en caché desde el plan 13-03.

Mantener el literal habría declarado como no consultado algo que sí se consultó, que es el mismo
error que el proyecto combate en la otra dirección. Se cambiaron a campo del registro. Las cinco
filas de `Country N` **siguen** con su literal, porque ese reparto de verdad no se pidió.

`Do they have a blog?` no dice ni sí ni no cuando no hay evidencia: dice **"sin evidencia en el
top por enlaces"**. El top por enlaces son diez páginas, no un mapa del sitio, y devolver "no"
ahí sería el mismo error que devolver cero para una métrica ausente.

Las dos secciones de páginas dan órdenes **opuestos** en este nicho, y por eso valen las dos:
`Top page N` va por tráfico y `Most linked content N` por dominios de referencia. La home se
lleva todos los enlaces y las interiores todo el tráfico.

## El cluster de 41 cabezas ya no se llama como no era

Pasó de `traumatólogo ortopedia infantil` —un artefacto del `rango: 0` que quedó al agregarla en
la revisión del checkpoint— a **`especialista en columna y trauma en Lima`**. Arrastró el id
nuevo a **939 filas** del universo, que es lo que Juan ve en la columna `Cluster`.

La regla automática de nombrado **no cambió**: sigue nombrando por la cabeza de mayor valor de
negocio, que es lo que hace el nombre reproducible. El renombre vive en
`data/cluster-nombres.json` con su motivo y su fecha, así que un cambio futuro queda en el
historial en vez de perderse. Recomputar los 31 clusters costó **cero** búsquedas.

La distinción que la fase 14 necesita sigue en pie y ahora se lee mejor: **13 modificadores de
distrito cayeron en ese único cluster → una página, no trece**; los nombres de clínica
(Ricardo Palma, SANNA, Tezza) formaron **cada uno su cluster de 3 cabezas → páginas separadas
justificadas**, que es lo que valida la fase 9 de v1.1.

## Ahrefs: el traspaso exacto que falta

Todo desde `seo-tools/`, en una sesión con el servidor MCP de Ahrefs.

```bash
# 1. Las 91 consultas pendientes, con su clave. Este comando NO consulta nada.
./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts --keywords-file data/serp-candidates.json --pendientes

# 2. Capturar cada cuerpo por el MCP y guardarlo TAL CUAL, en JSON, sin envolverlo ni recortarlo.
#    Ruta de la API: /v3/keywords-explorer/overview
#    Envoltorio de la respuesta: { "keywords": [ { keyword, difficulty, volume, traffic_potential, cpc } ] }

# 3. Ingerir cada una. --endpoint y --params se copian LITERALMENTE de la salida del paso 1.
./node_modules/.bin/tsx src/phase13/ahrefs-ingest.ts \
  --endpoint keywords-explorer/overview \
  --params '{"keyword":"hernia discal","country":"pe","select":"keyword,difficulty,volume,traffic_potential,cpc"}' \
  --file /tmp/hernia.json --plan 13-04

# 4. Reconstruir, recalcular el punto dulce y recargar. Cuesta CERO unidades y CERO busquedas.
./node_modules/.bin/tsx src/phase13/kw-metrics.ts --rebuild
./node_modules/.bin/tsx src/phase13/sweet-spot.ts
./node_modules/.bin/tsx src/phase13/build-dataset.ts
./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/kw-push.ts --data data/keywords-13.jsonl --yes
```

`--keywords-file` es nuevo de este plan: 91 cabezas no entran en una bandera separada por comas
que alguien vaya a escribir bien. Y el parser del endpoint quedó cableado en `parsearPorEndpoint`,
así que la ingesta va a **verificar el contrato contra la fuente real** en cada una de las 91 e
imprimir `AVISO` si el proveedor devuelve otros nombres de campo. Corregir el parser ahí no
cuesta unidades porque el cuerpo ya quedó en caché.

**Coste estimado del alcance pendiente: 91 consultas, 4.550 unidades** sobre las ~66.000 libres
de la cuenta Lite. `data/ahrefs-usage.json` ya lo registra como corrida **planificada**, no como
gasto ocurrido, y lo dice en su nota.

## La comparación de volumen entre las dos fuentes

**Cabezas con volumen en las dos fuentes: 0.** No hay ninguna todavía, porque falta el lado de
Ahrefs. La línea se imprime igual, con el motivo al lado, y no se omite: vacía significa que aún
no hay con qué comparar, que es distinto de "no discrepan".

El caso que ya está medido y que motiva D-08 sigue siendo el de referencia: `hernia discal`
devuelve **6.000** de volumen en Ahrefs y **0** en DataForSEO vía DinoRank, mismo país. Cuando
lleguen las 91, `compararVolumenes` publica los dos valores con su fuente y **no expone ningún
campo que resuelva el conflicto** —ni promedio, ni elegido, ni ganador—. Hay una prueba que lo
afirma por ausencia.

## Criterios de aceptación, con la salida real

| Criterio | Resultado |
|---|---|
| `npm run typecheck` | `tsc --noEmit` sin salida |
| Suite completa sin credenciales | **`tests 395 · pass 395 · fail 0`** (eran 349) |
| Reconstruir `ahrefs-keywords.jsonl` no mueve el contador | `ANTES=24`, `DESPUES=24` |
| Una línea por cabeza, ninguna que no sea cabeza | **91 de 91** |
| Las tres métricas con su campo de procedencia | 91 de 91, en `no_consultado` |
| Ninguna métrica ausente guardada como cero | verify en 0 |
| `ahrefs-usage.json` acumula 13-03 y 13-04 | `corridas: 2`, 9.110 unidades (4.560 ingeridas + 4.550 planificadas) |
| Las 4 condiciones núcleo impresas con su procedencia | sí, las cuatro en `no_consultado` |
| SerpApi no se mueve en toda la tarea 2 | `ANTES_SERP=96`, `DESPUES_SERP=96` |
| El gap cubre los cinco competidores | 5 bloques, incluido el de 1 keyword |
| Cobertura con medidas y sin medir | 91 y 4.675 sobre 4.766 |
| Destacados informados aunque valgan cero | `0 sobre 91 capturas` |
| Marca ajena marcada como no objetivo | 15, todas con `objetivo: false` |
| Dos ejecuciones, mismo SHA-256 | `7dddd3cc…a1dd`, idéntico |
| Segunda carga de `Competitor Analysis` | **`columnas nuevas: 0`** |
| `sweet-spot.jsonl`: una línea por cabeza, todas con razones y reparto | **91 de 91** |
| `keywords-13.jsonl` con 5.716 líneas | **5.716**, cero sin literal |
| `Referring Domains Needed` conserva su literal | sí |
| `URL` en fase-14 y `Suggested H1` en fase-15 | sí, y leídas del documento: **0 celdas llenas** |
| Segunda carga de `Keyword Research` | **`insertadas: 0`** |
| `keywords.jsonl` conserva su SHA-256 | `c59dad2d…eac`, intacto |
| `13-PUNTO-DULCE.md` con la sección de volumen alto fuera de alcance | sí, con las 20 primeras y sus razones |
| T-13-SC: cero paquetes instalados | `package.json` y `package-lock.json` sin cambios en los 4 commits |
| Nada bajo `src/` de la app ni en el workstream `milestone` | `git diff --cached` contra las rutas prohibidas → 0 en los 4 commits |

### Criterios que NO se pudieron cumplir

| Criterio | Por qué |
|---|---|
| Las 4 condiciones núcleo dejan de estar vacías | Requiere el MCP de Ahrefs. Están consultadas en el sentido de que la consulta está planificada y su clave emitida, pero el valor no llegó |
| `cabezas con KD: 91 de 91` | Ídem. Hoy es `0 de 91` |
| La comparación de volumen entre las dos fuentes | Ídem: hacen falta las dos mitades y solo está la de DinoRank |
| El punto dulce resuelto con las dos mitades | Las 91 se resolvieron con la SERP. Cada fila declara `resueltaCon: "serp"` y lo dice en sus razones |

## Desviaciones del plan

### Ajustes automáticos

**1. [Regla 3 - Bloqueante] `ahrefs-plan.ts` no tenía forma de recibir 91 keywords.**
- **Encontrado en:** tarea 1, al escribir el traspaso
- **Problema:** `--keywords` acepta una lista separada por comas. Con 91 cabezas, varias con
  tildes y espacios, esa línea de comandos no la escribe nadie bien, y un error ahí guarda el
  dato bajo una clave que después nadie encuentra
- **Arreglo:** `--keywords-file <ruta>`, que lee el arreglo `candidatas` de
  `data/serp-candidates.json` y toma el texto original de cada cabeza
- **Archivos:** `seo-tools/src/phase13/ahrefs-plan.ts`
- **Commit:** `41b08c5`

**2. [Regla 2 - Funcionalidad crítica] `parsearPorEndpoint` devolvía `null` para el endpoint de
keywords.**
- **Problema:** `ahrefs-ingest.ts` compara los campos que llegaron contra los que el parser
  busca y grita si no coinciden. Con el parser sin cablear, las 91 ingestas de este plan habrían
  impreso `AVISO` de contrato roto **siempre**, y esa señal —que existe para detectar una deriva
  real de la fuente— se habría vuelto ruido que nadie mira
- **Arreglo:** `parsearKeywordsOverview` se escribió en `ahrefs.ts`, junto a los otros cuatro y
  al contrato, y quedó cableado. Se reexporta desde `ahrefs-keywords.ts`, que es el módulo por
  el que pasa todo lo de keywords
- **Archivos:** `seo-tools/src/phase13/ahrefs.ts`, `ahrefs-keywords.ts`
- **Commit:** `41b08c5`

**3. [Regla 2 - Funcionalidad crítica] Ocho filas del tab de competencia declaraban
`no_consultado` sobre datos que sí estaban en caché.**
- **Encontrado en:** tarea 2, al volcar el gap al tab
- **Problema:** el modelo del plan 13-01 supuso que el tráfico orgánico, las keywords en top 100,
  el blog y las diez páginas quedaban fuera del `select` de D-07. El plan 13-03 midió que
  `site-explorer/metrics` y `site-explorer/top-pages` los traían, y los ingirió. El tab estaba
  diciendo "no consultado" sobre un dato consultado, que es el mismo error de procedencia que
  este proyecto combate en la otra dirección
- **Arreglo:** las ocho filas pasaron a campo del registro. Las cinco de `Country N` **no** se
  tocaron, porque ese reparto de verdad no se pidió
- **Archivos:** `seo-tools/data/sheet-columns.json`, `seo-tools/src/phase13/comp-gap.ts`
- **Commit:** `ea89eaf`

**4. [Regla 1 - Bug] Una prueba del plan 13-03 quedó apuntando a una fila que cambió.**
- **Problema:** `comportamiento 5: las filas declaradas como no consultadas escriben su literal`
  miraba la fila 8, que dejó de ser literal por la desviación anterior
- **Arreglo:** apunta ahora a la fila 12, `Country 1`, que sigue con su literal, y el comentario
  explica por qué se movió. La prueba sigue midiendo exactamente lo mismo
- **Archivos:** `seo-tools/src/sheets/column-upsert.test.ts`
- **Commit:** `ea89eaf`

### Ampliaciones deliberadas sobre lo que pedía el plan

- **`data/serp-alcanzabilidad.json`** no está en la lista de archivos del plan. Se creó porque el
  encuadre nuevo del punto dulce necesita una lista de grupos clínicos con marca y unos umbrales,
  y este proyecto no escribe criterios discutibles dentro del código. Los 13 dominios salieron de
  medir las 768 posiciones reales, con su conteo al lado.
- **`data/cluster-nombres.json`** es el mecanismo del renombre. Una bandera de corrida habría
  hecho lo mismo y se habría perdido; el archivo deja el motivo y la fecha en el historial.
- **`proporcionDisputable` en cada fila del punto dulce.** El denominador varía —una SERP con
  pack local trae siete u ocho orgánicos en vez de diez, y esas son justo las de intención
  local—. El veredicto usa el recuento absoluto, que es lo que importa para saber cuántas
  posiciones se pueden tomar, pero 13-05 puede reordenar por proporción sin recalcular nada.
- **`aparicionesEnPackLocal` por competidor.** No lo pedía el plan y resultó ser la segunda
  confirmación de que Maps y Search son canales independientes: `doctormunguia.com` tiene 1
  aparición orgánica y 5 en el pack.
- **La guarda de `argv` en `sweet-spot.ts` y `build-dataset.ts`.** El verify del plan los invoca
  como ejecutables y las pruebas importan su lógica. Sin la guarda, importar el módulo correría
  su `main` con los argumentos del corredor de pruebas, que es la trampa que `args.ts` documenta
  desde 13-01.

## TDD Gate Compliance

Los tres bloques de tareas son `tdd="true"` y las pruebas se escribieron antes que la
implementación en los tres casos. **La fase RED quedó demostrada explícitamente en dos de los
cuatro commits** —el renombre de cluster y las métricas de Ahrefs, donde se corrió la suite y
falló antes de escribir el módulo—; en `gap.ts` y en la parte de `upsertRows` las pruebas se
escribieron primero pero la suite se corrió después de la implementación, así que **no hay
commit `test(...)` en rojo que lo pruebe**. El contenido de las pruebas es el mismo; lo que falta
es la evidencia del rojo en el historial. Queda anotado en vez de maquillado.

## Known Stubs

Ninguno en el código: todas las rutas están implementadas y probadas.

Sí hay **datos ausentes y declarados como tales**, que es distinto de un stub:

- **Las 91 filas de `data/ahrefs-keywords.jsonl` tienen sus tres métricas en `null` con
  procedencia `no_consultado`.** No es un placeholder: es la declaración de que la fuente no se
  consultó, y desaparece con la ingesta. Ningún número inventado llegó al archivo.
- **`13-PUNTO-DULCE.md` declara su propio estado** en un bloque de cita arriba: 91 de 91 cabezas
  resueltas con una sola mitad.
- **Las cinco filas de `Country N` del tab de competencia** siguen en `no_consultado` con su
  literal. Es alcance de D-07, no un stub.

## Lo que 13-05 tiene que saber para elegir las 10 de Oro

**1. El campo está flojo y el punto dulce lo confirma con números propios.** 466 de 768
posiciones del top 10 son disputables, el 61 %. Las 10 de Oro pueden ser más ambiciosas de lo
que el roadmap suponía, y ahora hay con qué defender esa afirmación ante Juan.

**2. El eje de la elección es la intención, no el volumen.** 37 de las 45 cabezas de alcance alto
son transaccionales. Las informacionales de mayor volumen —`ciática` con 8.100, `desgarro
muscular` con 5.400— están fuera de alcance porque su top 10 lo ocupa contenido internacional.
Elegir por volumen sería elegir justo las que no se ganan.

**3. Ojo con la concentración: 29 de las 45 de alcance alto son del mismo cluster.** El de 41
cabezas, ahora `especialista en columna y trauma en Lima`. Diez de Oro sacadas de ahí serían
**una sola página**. Hay que repartir entre clusters, y `sweet-spot.jsonl` trae el campo
`cluster` en cada fila justamente para poder hacerlo.

**4. El orden ya está pensado para eso.** `sweet-spot.jsonl` viene ordenado por alcanzabilidad,
después por `rango` (el valor de negocio de la lista de candidatas) y después por volumen. Cada
fila trae además `intent`, `familia` y `razones` en texto, que es lo que KWR-06 necesita para que
la justificación se pueda leer.

**5. Las dos de mayor volumen del universo no se tocan.** Son marca ajena y están en
`keyword-gap.json` con `objetivo: false`. Si aparecen en cualquier lista de candidatas de 13-05,
es un error.

**6. Cuando llegue el KD, nada de esto se rehace a mano.** `sweet-spot.ts` y `build-dataset.ts`
leen de disco y se vuelven a correr con coste cero. El veredicto de una cabeza puede subir o
bajar un nivel, y la sección de "volumen alto fuera de alcance" del entregable puede cambiar.

## Contadores al cerrar

| Recurso | Al abrir | Al cerrar | Nota |
|---|---:|---:|---|
| SerpApi (`sources.serpapi.calls`) | 96 | **96** | Este plan no compró ni una búsqueda |
| Reserva de SerpApi hasta el 2026-08-21 | 30 | **30** | Intacta |
| Ahrefs (`sources.ahrefs.calls`) | 24 | **24** | Las 24 de dominio del plan 13-03 |
| Ahrefs, unidades registradas | 4.560 | **9.110** | 4.560 ingeridas + 4.550 **planificadas** |
| DinoRank | 187 | 187 | Sin uso en esta fase |
| Pruebas | 349 | **395** | +46 |

## Self-Check: PASSED

Los 18 archivos declarados como creados existen en disco.
Los 4 commits declarados existen en `git log`: `2187438`, `41b08c5`, `ea89eaf`, `408d5cb`.
`sources.serpapi.calls` al cerrar: **96**, idéntico al de apertura.
`sources.ahrefs.calls` al cerrar: **24**, idéntico al de apertura.
`data/keywords.jsonl` con el SHA-256 de apertura:
`c59dad2ddaeaeff47395a8844a813b2f04a43f1a3f3ad490b7b43b98bbcd7eac`.
