---
phase: 13-clusters-competencia-y-las-10-de-oro
workstream: seo-keywords
plan: 03
subsystem: seo-tools
tags: [ahrefs, competencia, cache, cuota, sheets, tab-transpuesto]
status: incomplete
requires:
  - "seo-tools/src/cache.ts (cacheKey, writeEnvelope, readEnvelope; fase 12)"
  - "seo-tools/src/quota.ts (QuotaBook; fase 12)"
  - "seo-tools/src/sheets/upsert.ts (sanitizeCell, WriteGateway, createGoogleWriteGateway; fase 12)"
  - "seo-tools/data/sheet-columns.json, entrada Competitor Analysis (plan 13-01)"
  - "seo-tools/src/phase13/args.ts (plan 13-01)"
provides:
  - "src/phase13/ahrefs.ts: contrato, claves, parsers, plan de consultas, ingesta y libro de unidades"
  - "src/phase13/ahrefs-plan.ts: emite que consultar y bajo que clave, sin consultar nada"
  - "src/phase13/ahrefs-ingest.ts: mete el cuerpo capturado en la cache y cuenta la consulta"
  - "src/phase13/competitors.ts + comp-profile.ts: perfil de los seis dominios, leyendo solo de cache"
  - "src/sheets/column-upsert.ts: el segundo modo de escritura, por columna, para tabs transpuestos"
  - "data/ahrefs-usage.json con corridas como ARREGLO (contrato con 13-04)"
affects:
  - 13-04
  - 13-05
tech-stack:
  added: []
  patterns:
    - "Traspaso en dos mitades para una fuente sin credencial: el proyecto emite la clave, el agente captura el cuerpo, el proyecto lo ingiere y lo cuenta"
    - "Procedencia por metrica al lado del valor: ausente es null con motivo, nunca cero"
    - "Escritura por columna con filas declaradas una a una, para no pisar filas que el modelo no conoce"
key-files:
  created:
    - seo-tools/src/phase13/ahrefs.ts
    - seo-tools/src/phase13/ahrefs.test.ts
    - seo-tools/src/phase13/ahrefs-plan.ts
    - seo-tools/src/phase13/ahrefs-ingest.ts
    - seo-tools/src/phase13/competitors.ts
    - seo-tools/src/phase13/competitors.test.ts
    - seo-tools/src/phase13/comp-profile.ts
    - seo-tools/src/phase13/comp-push.ts
    - seo-tools/src/sheets/column-upsert.ts
    - seo-tools/src/sheets/column-upsert.test.ts
    - seo-tools/data/competitors-fijos.json
    - seo-tools/data/competitors.json
    - seo-tools/data/ahrefs-usage.json
    - seo-tools/data/fixtures/ahrefs-contrato-sintetico.json
    - .planning/workstreams/seo-keywords/phases/13-clusters-competencia-y-las-10-de-oro/13-COMPETIDORES.md
  modified:
    - seo-tools/README.md
    - .planning/workstreams/seo-keywords/phases/13-clusters-competencia-y-las-10-de-oro/deferred-items.md
decisions:
  - "El perfil de dominio de Ahrefs son CUATRO endpoints y no uno: DR, referring domains, metricas organicas y paginas. D-12 hablaba de diez consultas y son veinticuatro"
  - "La lista de competidores vive en data/competitors-fijos.json, no en el codigo: la decision cerrada queda con su fecha en el historial"
  - "Sin evidencia de blog la respuesta es null y no false: el top por enlaces es una muestra, no un mapa del sitio"
  - "El modulo lee live_refdomains y no all_time_refdomains: el historico sobreestimaria la distancia real"
metrics:
  duration: "~2h"
  completed: "2026-08-11"
  tasks: 3
  commits: 3
  tests_before: 293
  tests_after: 324
  serpapi_searches_spent: 0
  ahrefs_units_spent: 0
---

# Phase 13 Plan 03: Ahrefs instrumentado y el tab transpuesto listo para escribirse

El camino completo hacia Ahrefs quedó construido, probado y documentado sin gastar una sola
unidad, y el tab transpuesto del cliente tiene por primera vez un escritor que no lo corrompe.
**Falta el dato**: las veinticuatro consultas de Ahrefs siguen sin ingerir, y sin ellas COMP-01
y COMP-04 no se cierran.

## El bloqueo, que es lo primero que hay que leer

**Ahrefs no tiene credencial en `.secrets/.env`.** El archivo trae `DINORANK_API_KEY`,
`GOOGLE_SERVICE_ACCOUNT_FILE`, `SEO_SHEET_ID` y `SERPAPI_API_KEY`, y nada más. El único camino
de acceso es el servidor MCP de Ahrefs, que vive en la sesión del agente y no en el proceso de
Node. El agente que ejecutó este plan **no tiene esa herramienta disponible**.

La precondición de la tarea 1 previó exactamente esto y pidió detenerse en vez de degradar en
silencio. Eso es lo que pasó, y es el resultado correcto: **no se inventó ni un número**. Cada
métrica de competencia está declarada como `no_consultado`, que es distinto de cero y distinto
de "no tiene".

Lo que sí se construyó es todo lo demás, de modo que la sesión que sí tenga el MCP cierre la
fase con dos comandos. El traspaso está en la sección "Cómo se completa" al final.

## Qué se construyó

### El camino hacia Ahrefs, en dos mitades

`ahrefs-plan.ts` dice **qué** hay que pedir, con qué parámetros y bajo qué clave va a quedar
guardada la respuesta. `ahrefs-ingest.ts` recibe el cuerpo ya capturado, **recalcula la clave a
partir de los mismos parámetros** y persiste. Ninguno de los dos llama a Ahrefs.

La clave no se pasa por bandera a propósito. Si quien captura tuviera que copiar un hash de 64
caracteres, un dato podría quedar guardado bajo una clave que después nadie encuentra, y el
problema no se vería hasta el reprocesamiento. Hay una prueba nombrada que ata `claveDeConsulta`
al `cacheKey` de `src/cache.ts`: si el proyecto cambiara su función de hash, la prueba se
detiene antes de que la caché se parta en dos.

La ingesta garantiza cuatro cosas, cada una con su prueba:

| Regla | Prueba |
|---|---|
| Un cuerpo que no es JSON válido aborta **sin escribir nada** | `comportamiento 4` |
| Un cuerpo con algo con forma de credencial aborta **sin escribir nada** (T-13-20) | `comportamiento 4` |
| Reingerir el mismo cuerpo **no reescribe el archivo ni vuelve a contar cuota** | `comportamiento 3` |
| Una respuesta vacía **se persiste igual**, con `outcome: "empty"` | `comportamiento 5` |

La tercera es la que más cuesta hacer bien: el envelope lleva `fetchedAt`, así que reescribirlo
cambiaría el archivo. La ingesta compara el cuerpo por contenido y, si es el mismo, **no toca el
disco**. La prueba avanza el reloj entre las dos ingestas justamente para que un reescribir
silencioso se note.

### El contrato, escrito contra la referencia pública de la API v3

El plan pedía sondear el MCP antes de escribir parseo. Sin MCP no se pudo, así que los parsers
se escribieron contra la referencia publicada de la API v3 y el contrato quedó en la sección 8
del README del paquete, con los nombres de campo tal como llegan. Cuatro detalles que no son
obvios y están escritos ahí:

- **`live_refdomains`, no `all_time_refdomains`.** El conteo vivo describe el perfil de enlaces
  de hoy; el histórico incluye dominios que ya no enlazan y sobreestimaría la distancia real
  entre el dominio del doctor y sus competidores, que es justo lo que el punto dulce mide.
- **Los importes vienen en centavos de dólar.** Aplica a `org_cost`, `paid_cost` y `value`.
- **`top-pages` no trae título de página.** Lo más parecido es `top_keyword`; cuando falta, el
  parser deja `null` en vez de repetir la URL.
- **`date` va fija en `2026-08-11`** y no sale del reloj: tomarla del reloj haría que la clave
  cambiara cada día y la misma consulta se pagara otra vez cada 24 horas.

Como no hay respuesta real que congelar, la fixture de pruebas es **sintética y lo declara en
su primera clave**. Apunta a `ejemplo-sintetico.test`, un TLD reservado por la RFC 2606 que no
existe, así que ninguno de sus números puede confundirse con una medición de un competidor real.
Las dos fixtures reales que pedía el plan —`ahrefs-domain-overview.json` y
`ahrefs-top-pages.json`— **no se crearon**: `ahrefs-ingest.ts --fixture <ruta>` las escribe con
el cuerpo capturado, y el comando imprime qué campos llegaron y avisa si el parser no encontró
ninguno. Esa es la verificación del contrato contra la fuente real, y ocurre en el momento del
traspaso.

### El perfil de los seis dominios

`competitors.ts` **lee solo de la caché**. Dos corridas producen el mismo archivo byte a byte y
cero consultas nuevas, medido:

```
ANTES=0 DESPUES=0    (contador de ahrefs en .cache/_quota.json)
16c41ff4f1919314dc97e02f9f557c425c5c5dc8048fffba4fd507612b09847a    (SHA-256, idéntico en las dos)
```

Cada métrica lleva su campo de procedencia al lado, con cuatro valores posibles:

| Procedencia | Qué significa |
|---|---|
| `ahrefs` | la fuente devolvió el valor. **Un cero con esta procedencia es un cero real** |
| `ahrefs_sin_dato` | la consulta está en caché pero la fuente no trajo ese campo |
| `no_consultado` | la consulta todavía no se ingirió. No es lo mismo que no tener el dato |
| `sin_evidencia` | hubo datos y no alcanzaron para afirmar. Solo lo usa la presencia de blog |

La distinción entre las últimas tres es la que impide el error que el CONTEXT marca como el más
caro de esta fase. Hay una prueba nombrada por cada una.

**La presencia de blog se deduce de las páginas más enlazadas, y la ausencia de evidencia no
niega.** Encontrar una ruta de blog afirma que lo tiene; no encontrarla devuelve `null` con
`sin_evidencia`, nunca `false`. El top por enlaces son diez páginas, no un mapa del sitio, y
devolver `false` ahí sería exactamente el mismo error que devolver cero para una métrica
ausente.

### El escritor por columna

`column-upsert.ts` es archivo nuevo. `upsert.ts` no se tocó: `git diff --cached --name-only --
seo-tools/src/sheets/upsert.ts` devolvió 0 en los tres commits.

El algoritmo es el espejo del de filas, con una diferencia que es todo el punto del plan. **La
columna B hace doble tarea**: es la primera ranura de competidor y encima de sus valores carga
los títulos de sección de las filas 1, 4, 11, 17, 23, 25 y 31. Un escritor que volcara una
columna entera sobre esa ranura borraría los títulos sin lanzar ninguna excepción. Este escritor
agrupa las 29 filas declaradas en **siete tramos que saltan esas filas**:

```
2-3 | 5-10 | 12-16 | 18-22 | 24 | 26-30 | 32-36
```

Las filas de título quedan fuera de todo rango por construcción, no por una comprobación que
alguien pueda quitar. Hay tres pruebas que lo miden desde ángulos distintos: los siete títulos
siguen ahí después de dos cargas, ningún rango emitido alcanza una fila de título, y la columna
A nunca aparece en un rango escrito.

**La etiqueta de la fila 25 lleva 108 espacios finales** y la comparación recorta los dos
extremos. Hay una prueba que afirma que mide 139 caracteres y 31 al recortar.

La validación de forma corre **antes de calcular una sola celda** y aborta con el diff de cuatro
listas más el detalle fila por fila: en un tab transpuesto la fila es la dirección del dato, así
que una etiqueta corrida una fila escribiría el Domain Rating encima del Ahrefs Rank sin que
nada fallara. Dos pruebas lo cubren: etiqueta movida de fila y título de sección borrado.

## El ensayo del tab transpuesto, contra el documento real

Corrido el 2026-08-11 con `--dry-run`. **Cero peticiones de escritura**: el ensayo solo emite
`spreadsheets.get` y `values.get`.

```
Tab: Competitor Analysis (transpuesto: un competidor por COLUMNA)
Modo: ENSAYO. No se emitio ninguna peticion de escritura.
columnas actualizadas: 0
columnas nuevas: 5
celdas: 145
rangos: 35
filas que se escriben (29): 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 24, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36
filas que NO se tocan (7): 1, 4, 11, 17, 23, 25, 31

  B  ocupa la ranura  ->  drcarranzacolumna.com   (desplaza el contenido previo de pera.com)
       sobrescribe B2 = "pera"
       sobrescribe B3 = "pera.com"
       sobrescribe B5 = "20"
       sobrescribe B6 = "13"
       sobrescribe B12 = "United States"
       sobrescribe B24 = "6"
  F  ocupa la ranura  ->  drciezatraumatologia.com
       sobrescribe F2 = "Competitor 1"
  J  ocupa la ranura  ->  cirujanocolumna-elaos.com
       sobrescribe J2 = "Competitor 2"
  N  ocupa la ranura  ->  doctormunguia.com
       sobrescribe N2 = "Competitor 3"
  R  ocupa la ranura  ->  clinicarthromeds.pe
       sobrescribe R2 = "Competitor 4"
```

Tres cosas que este ensayo demuestra y que ninguna prueba en memoria puede demostrar sola:

1. **El modelo declarado calza con el documento vivo.** La validación de forma pasó sobre las
   29 etiquetas y los 7 títulos de sección reales. El reconocimiento del plan 13-01 era correcto.
2. **El residuo de plantilla está donde 13-01 dijo**, celda por celda, incluido el `20%` de D12.
3. **Las siete filas de título quedan fuera del alcance de la escritura**, listadas por número.

**La carga real no se ejecutó.** Está en la sección siguiente por qué.

## Lo que NO se hizo, y por qué

### 1. Las veinticuatro consultas de Ahrefs

Sin MCP y sin credencial, no hay forma de obtenerlas. `.cache/_quota.json` sigue con dos fuentes
y no tres:

```json
{ "dinorank": { "calls": 187 }, "serpapi": { "calls": 12 } }
```

El contador de SerpApi **no se movió**: sigue en 12, con `lastCallAt` en `2026-08-10T22:16:22.447Z`.
Este plan no gastó ninguna de las 114 búsquedas que quedan, y el presupuesto de 13-02 está intacto.

### 2. La carga real del tab

`data/competitors.json` existe y es honesto, pero hoy no tiene ni una métrica de Ahrefs.
Ejecutar `--yes` ahora escribiría los cinco nombres y dominios y 145 celdas mayormente vacías,
y habría que volver a escribir todo después de la ingesta. Se prefirió una sola carga completa.
El escritor está probado contra el documento real por el ensayo de arriba.

### 3. Las dos fixtures reales

`data/fixtures/ahrefs-domain-overview.json` y `data/fixtures/ahrefs-top-pages.json` no existen.
Se crean solas al ingerir, con `--fixture`.

## Cómo se completa: el traspaso exacto

Todo lo de abajo se corre desde `seo-tools/`. Requiere una sesión con el servidor MCP de Ahrefs.

### Paso 1 — obtener el plan de consultas

```bash
cd seo-tools
./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts \
  --domains drcarranzacolumna.com,drciezatraumatologia.com,cirujanocolumna-elaos.com,doctormunguia.com,clinicarthromeds.pe,drangulocolumna.com \
  --pendientes
```

Imprime las 24 consultas pendientes. Por cada una: etiqueta de endpoint, ruta de la API v3, el
JSON de parámetros y la clave de caché. **Las claves no hay que copiarlas**: la ingesta las
recalcula.

### Paso 2 — capturar cada respuesta por el MCP

Por cada consulta del paso 1, invocar la herramienta del MCP que corresponde a su `ruta API` con
los valores de su bloque `params`, y **guardar el cuerpo crudo tal como llega**, en JSON, en un
archivo. Sin envolverlo en texto, sin recortarlo y sin reformatearlo.

Las cuatro rutas por dominio, con lo que cada una aporta:

| Ruta de la API | Qué aporta | Envoltorio de la respuesta |
|---|---|---|
| `/v3/site-explorer/domain-rating` | DR y Ahrefs Rank | `{ "domain_rating": { "domain_rating": …, "ahrefs_rank": … } }` |
| `/v3/site-explorer/backlinks-stats` | referring domains | `{ "metrics": { "live_refdomains": …, "all_time_refdomains": …, "live": … } }` |
| `/v3/site-explorer/metrics` | tráfico orgánico y keywords top 100 | `{ "metrics": { "org_traffic": …, "org_keywords": …, "org_keywords_1_3": … } }` |
| `/v3/site-explorer/top-pages` | páginas más enlazadas y evidencia de blog | `{ "pages": [ { "url": …, "referring_domains": …, "top_keyword": …, "sum_traffic": …, "keywords": … } ] }` |

**La forma en que hay que devolver el payload:** el JSON **completo y sin tocar** que devuelve la
herramienta, incluido su envoltorio (`domain_rating`, `metrics` o `pages`). No hay que aplanarlo,
renombrar campos ni extraer el objeto interno: los parsers leen por nombre desde la raíz y la
comparación de reingesta es por contenido, así que cualquier reformateo produce una clave nueva
y una cuota contada de más.

Si el MCP devuelve el cuerpo dentro de otro envoltorio propio (por ejemplo `{ "result": … }`),
hay que guardar **el objeto de la API**, no el del MCP. El comando de ingesta lo dice en voz
alta: si el parser no saca ni un campo de una respuesta que no está vacía, imprime `AVISO`, lista
los campos que sí llegaron y nombra el archivo del parser que hay que corregir. Corregirlo no
cuesta unidades porque el cuerpo ya quedó en caché.

### Paso 3 — ingerir, una por una

```bash
./node_modules/.bin/tsx src/phase13/ahrefs-ingest.ts \
  --endpoint site-explorer/domain-rating \
  --params '{"target":"drcarranzacolumna.com","mode":"domain","protocol":"both","date":"2026-08-11"}' \
  --file /tmp/carranza-dr.json \
  --plan 13-03
```

- `--endpoint` y `--params`: **copiados literalmente** de la salida del paso 1. El orden de las
  claves del JSON no importa; los valores sí.
- `--file`: el archivo del paso 2.
- `--plan 13-03`: lo que hace que la consulta se sume a la entrada de este plan en
  `data/ahrefs-usage.json` sin tocar la de 13-04.

En las dos primeras ingestas de `drcarranzacolumna.com`, agregar además:

```bash
  --fixture data/fixtures/ahrefs-domain-overview.json   # en la de domain-rating
  --fixture data/fixtures/ahrefs-top-pages.json         # en la de top-pages
```

La ingesta se niega a escribir la fixture si el cuerpo trae algo con forma de credencial.

### Paso 4 — reconstruir el perfil y el entregable

```bash
./node_modules/.bin/tsx src/phase13/comp-profile.ts --md
```

Cuesta cero unidades: lee solo de la caché. Reescribe `data/competitors.json` y
`13-COMPETIDORES.md`. Si quedaran consultas sin ingerir, lo dice y las lista con su clave.

### Paso 5 — cargar el tab, con su ensayo previo

```bash
./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/comp-push.ts \
  --data data/competitors.json --dry-run     # copiar esta salida al SUMMARY
./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/comp-push.ts \
  --data data/competitors.json --yes
./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/comp-push.ts \
  --data data/competitors.json --yes | grep -E 'columnas nuevas: 0'
```

La tercera línea es SHEET-06 medido contra el documento y no contra un cálculo.

## Criterios de aceptación, con la salida real

| Criterio | Resultado |
|---|---|
| `npm run typecheck` en 0 | `tsc --noEmit` sin salida |
| Suite completa sin ninguna credencial | `tests 324 · pass 324 · fail 0` con `env -u SERPAPI_API_KEY -u DINORANK_API_KEY -u SEO_SHEET_ID -u GOOGLE_SERVICE_ACCOUNT_FILE` |
| `ahrefs-plan` imprime claves de 64 hex | `grep -qE '[0-9a-f]{64}'` en 0 |
| Prueba de que la clave no se inventa | `la clave del plan NO se inventa, sale de la misma funcion que el resto del proyecto`, comparada con `cacheKey` |
| Prueba por comportamiento del bloque de la tarea 1 | 6 comportamientos, 31 pruebas |
| Prueba de que reingerir no incrementa el contador | `comportamiento 3: reingerir el mismo cuerpo NO incrementa el contador de cuota` |
| Prueba de que reingerir da el mismo archivo | `comportamiento 3: reingerir el mismo cuerpo produce el mismo archivo byte a byte`, con el reloj avanzado a propósito |
| `data/ahrefs-usage.json` declara consultas por endpoint y unidades | 24 consultas, 2.280 unidades estimadas sobre ~66.000 libres |
| `corridas` es un arreglo con ≥1 entrada | `1`, en estado `planificado` |
| Prueba de que `corridas` acumula entre planes | `el libro de unidades guarda corridas como ARREGLO y cada plan agrega la suya`, con dos entradas |
| Fixture sin nada con forma de credencial | `buscarCredenciales` devuelve `[]` sobre el texto crudo |
| README documenta los nombres de campo | sección 8, con los cuatro envoltorios y las cuatro trampas |
| Los cinco de D-11 más la línea de base en `competitors.json` | `perfiles: 6` |
| Ninguna métrica en cero sin fuente que la respalde | verify del plan en 0 |
| Prueba de que una métrica ausente no se vuelve cero | `comportamiento 2: una metrica que la fuente no devolvio NO se convierte en cero` |
| Reconstruir el perfil dos veces: mismo SHA y misma cuota | `ANTES=0 DESPUES=0`, SHA `16c41ff4…847a` en las dos |
| `13-COMPETIDORES.md` existe y compara los seis | sí, con su estado declarado como incompleto |
| Prueba por comportamiento del bloque de la tarea 3 | 7 comportamientos, 30 pruebas |
| Prueba de idempotencia por dominio | `cargar dos veces los mismos cinco competidores NO agrega ni una columna` |
| Prueba de aborto por deriva de forma | `una etiqueta movida de fila aborta con el diff y NO escribe nada` |
| Prueba de que una fila no declarada queda intacta | `una fila que el modelo NO declara queda intacta despues de una actualizacion` |
| Ensayo previo copiado al SUMMARY con `pera` visible | sí, arriba |
| El ensayo es el modo por defecto y no escribe | `comportamiento 6`, dos pruebas |
| `upsert.ts` no se tocó en ningún commit | `git diff --cached --name-only -- seo-tools/src/sheets/upsert.ts` → 0 en los 3 |
| T-13-SC: cero paquetes instalados | `package.json` y `package-lock.json` sin cambios |
| SerpApi no se movió | `calls: 12`, `lastCallAt: 2026-08-10T22:16:22.447Z` |
| `data/keywords.jsonl` conserva su SHA-256 | `c59dad2ddaeaeff47395a8844a813b2f04a43f1a3f3ad490b7b43b98bbcd7eac`, idéntico al de 13-01 |
| El modelo sigue declarando el tab transpuesto | `orientation: columnas`, 29 filas de métrica |
| Ningún archivo fuera de `seo-tools/` y la carpeta de la fase | `git diff --cached` contra las rutas prohibidas → 0 en los 3 commits |

### Criterios que NO se pudieron cumplir

| Criterio | Por qué |
|---|---|
| Las dos fixtures reales existen | Requieren una respuesta real de Ahrefs. Se crean con `--fixture` al ingerir |
| El libro de cuota tiene una tercera fuente con ≥2 consultas | Requiere ingerir. Hoy `sources` tiene `dinorank` y `serpapi` |
| Cada perfil declara sus métricas con procedencia `ahrefs` | Los campos están y declaran `no_consultado`. El valor llega con la ingesta |
| Segunda carga real del tab con cero columnas nuevas | Requiere `data/competitors.json` con datos. Probado en memoria, no contra el documento |

## Un criterio del plan que está mal, y cómo

**El plan dice diez consultas de Ahrefs; son veinticuatro.**

D-12 y la acción de la tarea 2 dicen "perfil de dominio y páginas principales por cada uno de
los cinco", es decir dos consultas por dominio. En la API v3 **no existe un endpoint de "perfil
de dominio"**: lo que COMP-01 pide está repartido en tres.

| Lo que COMP-01 pide | Endpoint que lo tiene |
|---|---|
| Domain Rating, Ahrefs Rank | `/v3/site-explorer/domain-rating` |
| Referring domains | `/v3/site-explorer/backlinks-stats` |
| Tráfico orgánico, keywords en top 100 | `/v3/site-explorer/metrics` |
| Páginas más enlazadas, evidencia de blog | `/v3/site-explorer/top-pages` |

Con la línea de base propia son **seis dominios por cuatro endpoints = 24 consultas**. No se
cambió el alcance a escondidas: la alternativa habría sido dejar `Referring Domains` y
`Estimated Monthly Search Traffic` sin fuente, y `Referring Domains` es una de las cinco métricas
que COMP-01 nombra explícitamente.

El coste no cambia la decisión. La fórmula del proveedor es `max(costeBase, costePorFila × filas)`
con un mínimo de 50 unidades por petición, así que las 24 consultas son **2.280 unidades
estimadas** sobre las ~66.000 libres de la cuenta Lite: **el 3,5%**. El grueso lo sigue gastando
13-04.

## Desviaciones del plan

### Ajustes automáticos

**1. [Regla 1 - Bug] `comp-profile.ts --md ../.planning/...` escribía FUERA del repositorio.**
- **Encontrado en:** tarea 2, al generar el entregable con la ruta que usa el verify del plan
- **Problema:** `resolveFromRepoRoot` resuelve contra la raíz del repositorio y no contra el
  directorio de trabajo. Como el comando se corre desde `seo-tools/`, el `../` de costumbre de
  shell resolvía un nivel **más arriba** de la raíz y dejaba el archivo en el directorio padre
  del repositorio, sin que nada fallara. Alcanzó a escribirse una vez y se borró.
- **Arreglo:** `--md` se resuelve contra la raíz y **aborta si el destino sale del repositorio**,
  nombrando las dos rutas y diciendo que sobra el `../`. Además `--md` sin valor usa la ruta del
  entregable de la fase, que es lo que casi siempre se quiere.
- **Archivos:** `seo-tools/src/phase13/comp-profile.ts`
- **Commit:** `69babc7`

**2. [Regla 3 - Bloqueante] `--data data/competitors.json` no encontraba el archivo.**
- **Encontrado en:** tarea 3, al correr el ensayo con la forma exacta del verify del plan
- **Problema:** mismo origen que el anterior. El verify del plan usa `--data data/competitors.json`
  corriendo desde `seo-tools/`, y eso resolvía a `<repo>/data/competitors.json`, que no existe.
- **Arreglo:** `comp-push.ts` prueba la raíz del repositorio y después la de `seo-tools/`, y si
  falla nombra **las dos** rutas. Un error que nombra una sola manda a depurar el lugar equivocado.
- **Archivos:** `seo-tools/src/phase13/comp-push.ts`
- **Commit:** `2f5fda2`

**3. [Regla 3 - Bloqueante] La lógica del plan de consultas vivía en el punto de entrada.**
- **Encontrado en:** tarea 1, al escribir la prueba de que la clave no se inventa
- **Problema:** `ahrefs-plan.ts` llama a `ejecutar(main)` en el cuerpo del archivo, igual que
  `src/cli.ts`. Importarlo desde una prueba ejecutaría su `main` con los argumentos del corredor
  de pruebas, que es exactamente la trampa que `args.ts` documenta desde 13-01.
- **Arreglo:** `planDeDominios`, `planDeKeywords` y `contarPorEndpoint` se movieron a `ahrefs.ts`.
  Los puntos de entrada de esta fase no llevan lógica.
- **Archivos:** `seo-tools/src/phase13/ahrefs.ts`, `ahrefs-plan.ts`
- **Commit:** `37f98ee`

**4. [Regla 1 - Bug] `leerLibroDeUso` devolvía los totales en cero.**
- **Encontrado en:** tarea 1, con la prueba de acumulación entre planes
- **Problema:** leía las corridas del archivo pero devolvía los totales de la plantilla vacía.
- **Arreglo:** los totales se **recalculan siempre desde las corridas** y nunca se leen del
  archivo. Si alguien editara a mano el total sin tocar el detalle, el archivo mentiría sobre su
  propio contenido.
- **Archivos:** `seo-tools/src/phase13/ahrefs.ts`
- **Commit:** `37f98ee`

**5. [Regla 3 - Bloqueante] La ruta de la fixture salía percent-encoded.**
- **Encontrado en:** tarea 1, primera corrida de las pruebas
- **Problema:** la ruta de este repositorio lleva un espacio y `new URL(import.meta.url).pathname`
  lo devuelve como `%20`, que no existe en disco.
- **Arreglo:** se resuelve contra `SEO_TOOLS_ROOT`, que es lo que ya hace el resto del proyecto.
- **Archivos:** `seo-tools/src/phase13/ahrefs.test.ts`
- **Commit:** `37f98ee`

### Ampliaciones deliberadas sobre lo que pedía el plan

- **`data/competitors-fijos.json`** no está en la lista de archivos del plan, pero el bloque de
  comportamiento pide que los cinco dominios estén "fijos en un archivo de datos". Se creó, con
  la decisión, su fecha, quién es cada uno, de dónde salió, las reseñas del pack local y las
  rutas que cuentan como evidencia de blog. Un cambio futuro queda en el historial con su fecha
  en vez de perderse en la bandera de una corrida.
- **`ahrefs-plan.ts --registrar <plan>`** escribe la corrida **planificada** antes de gastarla.
  Es lo único que después permite comparar lo previsto con lo ingerido. Una entrada `ingerido`
  nunca se degrada a `planificado`: volver a correr el planificador no puede borrar consumo real.
- **`ahrefs-ingest.ts` imprime los campos que llegaron y avisa si el parser no sacó ninguno.**
  Es la detección de deriva de contrato, y ocurre en el momento del traspaso en vez de tres pasos
  más adelante con un perfil lleno de nulos.
- **`describirResumen` lista las filas que NO se tocan**, además de las que sí. En un tab donde
  el riesgo es borrar un título de sección, esa lista es la que se lee.

## Riesgo que queda abierto

**El contrato de los parsers está escrito contra la referencia publicada de la API v3 y no
contra una respuesta medida.** Es la única parte de este plan que no se pudo verificar contra la
fuente. La mitigación está construida y no es una promesa: `ahrefs-ingest.ts` compara, en cada
ingesta, los campos que llegaron contra los que el parser busca, y grita si no coinciden. Como
el cuerpo ya quedó en caché antes del aviso, corregir el parser cuesta cero unidades.

**Sigue vigente el riesgo que dejó abierto 13-01**: un `sheet:push` del dataset de la fase 12
escribe cadena vacía en `Cluster` y `Top Result`. Este plan no lo toca; es del tab
`Keyword Research`, que 13-02 es el que escribe.

## Known Stubs

Ninguno en el código: todas las rutas están implementadas y probadas.

Sí hay **datos ausentes y declarados como tales**, que es distinto de un stub:

- **`data/competitors.json` tiene las 30 métricas de Ahrefs en `null` con procedencia
  `no_consultado`** (cinco métricas por seis dominios), y los seis arreglos de páginas vacíos.
  No es un placeholder: es la declaración de que la fuente no se consultó, y desaparece con la
  ingesta del paso 3. Ningún número inventado llegó al archivo.
- **`13-COMPETIDORES.md` declara su propio estado como incompleto** en un bloque de cita, arriba
  de la tabla, y lista las 24 consultas pendientes con su clave de caché.
- **18 de las 29 filas de `Competitor Analysis` siguen en `no-consultado`** con su literal, tal
  como las dejó 13-01. Es la decisión de alcance de D-07, no un stub.

## Deferred Issues

**La prueba sensible al reloj de la fase 12 volvió a flaquear.**
`comportamiento 5: un limite de tasa no se persiste y se reintenta con retroceso exponencial`
(`src/sources/dinorank.test.ts:325`) falló 1 de 4 corridas de la suite completa y pasó las otras
3 sin ningún cambio de por medio. Es preexistente, este plan no toca el cliente de DinoRank ni
el envoltorio de red, y ya estaba anotada en `deferred-items.md` desde 13-01. Se registró la
reincidencia ahí.

## Self-Check: PASSED

Los 15 archivos declarados como creados existen en disco. Los 3 commits declarados existen en
`git log`: `37f98ee`, `69babc7`, `2f5fda2`. Contador de SerpApi al cerrar: **12**, idéntico al de
apertura. Contador de Ahrefs al cerrar: **ausente del libro**, que es el resultado esperado de
un plan que no pudo consultar la fuente.
