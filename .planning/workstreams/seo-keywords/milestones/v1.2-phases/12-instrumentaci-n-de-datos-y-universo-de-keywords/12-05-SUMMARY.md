---
phase: 12-instrumentaci-n-de-datos-y-universo-de-keywords
workstream: seo-keywords
plan: 05
subsystem: cliente de la fuente primaria y enriquecimiento del universo
tags: [dinorank, fixtures, contrato, enriquecimiento, cuota, cache, idempotencia]

requires:
  - phase: 12-01
    provides: "seam de cache con la tabla de que se persiste, envoltorio de red con reintento y limitador, libro de cuota"
  - phase: 12-03
    provides: "sources/dinorank.ts con el parser de keyword-research y 40 respuestas cacheadas"
  - phase: 12-04
    provides: "keywords.jsonl con el esquema completo y las tres metricas diferidas ya declaradas"
provides:
  - "Cliente de los cuatro endpoints que exige INFRA-02, todos por el seam de cache"
  - "Cuatro fixtures reales de Peru commiteadas: el unico contrato de respuesta que existe"
  - "Contrato de /tfidf, /auditoria y /canibalizaciones, que las fases 14 y 15 no tenian"
  - "keywords/enrich.ts con cosecha de cache, tope de concurrencia y acotado por largo"
  - "keywords.jsonl con 5087 de 5716 keywords con metricas"
  - "Tab Keyword Research del Sheet recargado con volumen, CPC y competencia"
affects: [13-clusters-competencia, 14-mapa-keyword-url, 15-contenido]

tech-stack:
  added: []
  patterns:
    - "Sondear y grabar la respuesta real ANTES de escribir una linea de parseo"
    - "Seudonimizacion por lista de EXCLUSION y no de inclusion, para que un campo nuevo del proveedor entre seudonimizado por defecto"
    - "La unidad de trabajo del enriquecimiento es la respuesta y no la keyword"
    - "Cosechar lo ya pagado antes de emitir una consulta nueva"
    - "Acotar el gasto por una propiedad medida de la fuente, no por intuicion"

key-files:
  created:
    - seo-tools/src/keywords/enrich.ts
    - seo-tools/src/keywords/enrich.test.ts
    - seo-tools/data/fixtures/dinorank-keyword-research-pe.json
    - seo-tools/data/fixtures/dinorank-tfidf-pe.json
    - seo-tools/data/fixtures/dinorank-auditoria-pe.json
    - seo-tools/data/fixtures/dinorank-canibalizaciones-pe.json
  modified:
    - seo-tools/src/sources/dinorank.ts
    - seo-tools/src/sources/dinorank.test.ts
    - seo-tools/src/commands/dino-probe.ts
    - seo-tools/src/commands/kw-enrich.ts
    - seo-tools/data/keywords.jsonl
    - seo-tools/README.md

key-decisions:
  - "El contrato grabado el 2026-08-10 estaba mal en su punto central: el bloque `datos` NO vuelve siempre en cero. Auditadas las 70 respuestas cacheadas, trae el valor real en 10"
  - "No se gasta cuota en keywords de cuatro o mas palabras: dos muestras acotadas midieron rendimiento cero y la regla quedo en el codigo como bandera, no como criterio de una corrida"
  - "Las fixtures de auditoria y canibalizaciones se commitean seudonimizadas: el unico proyecto de la cuenta de DinoRank es de otro cliente y de su respuesta solo se conserva la forma"
  - "El enriquecimiento barre la cache entera antes de emitir una consulta: una respuesta pagada por una keyword suele traer contestadas a muchas otras"

requirements-completed: [INFRA-02, INFRA-03, KWR-02]

metrics:
  duration: "~3 h"
  completed: 2026-08-11
  tasks: 3
  commits: 5
  tests: 179
  universo: 5716
  con_metricas: 5087
  llamadas_dinorank_este_plan: 147
  llamadas_dinorank_acumuladas: 187

status: complete
---

# Phase 12 Plan 05: Cliente de DinoRank, fixtures reales y enriquecimiento — Summary

Los cuatro endpoints que exige INFRA-02 quedaron sondeados contra la API real de Perú, con sus
fixtures commiteadas y sus parsers escritos contra ellas. El universo pasó de 4992 a 5087
keywords con métricas. Y el sondeo dejó a la vista que **el contrato de `/keyword-research`
que este mismo repositorio tenía documentado estaba mal en su punto central**, cosa que se
corrigió con evidencia sobre las 70 respuestas que ya había en caché.

## Lo que el plan asumía y ya no era cierto

El plan se dimensionó para ~400 POST contra una credencial rechazada. Las dos premisas cayeron
antes de ejecutarlo: la clave funciona y la expansión del plan 03 ya había traído las métricas.
Lo que quedaba, y es lo que se hizo, era otra cosa y más chica:

| Lo que el plan pedía | Lo que se ejecutó |
|---|---|
| Checkpoint bloqueante por credencial | Derogado. La clave responde `ok: true` desde `.secrets/.env` |
| Sondear `/keyword-research` | Ya sondeado. Se regrabó la fixture desde caché, **cero llamadas** |
| Escribir `sources/dinorank.ts` | Ya existía. Se extendió con los otros tres endpoints |
| ~400 POST con concurrencia | 147 llamadas en total, de las cuales 112 productivas |

## El contrato real de los cuatro endpoints

### `/keyword-research` — y las tres correcciones al contrato que ya estaba escrito

El documento `dinorank-contrato-2026-08-10.md` afirmaba, en su hallazgo número 2, que **la
keyword consultada vuelve siempre con volumen cero**. Se verificó contra las 70 respuestas que
ya había en caché y **es falso en 10 de ellas**:

| Keyword consultada | `datos.search_volume` | CPC | Competencia |
|---|---:|---:|---:|
| `clínica ricardo palma` | 74000 | 0,22 | 0,10 |
| `ciática` | 8100 | 0,30 | 0,01 |
| `clínica padre luis tezza` | 6600 | 0,18 | 0,06 |
| `desgarro muscular` | 5400 | 0,23 | 0,02 |
| `cifosis` | 3600 | 0 | 0 |
| `clínica sanna la molina` | 320 | 0,03 | 0,03 |
| `alteraciones de la marcha` | 110 | 0 | 0 |
| `discopatía degenerativa` | 40 | 0 | 0,04 |
| `cirugía mínimamente invasiva` | 30 | 0 | 0 |
| `casos de revisión` | 10 | 0 | 0 |

El "siempre" era una generalización de tres consultas. **Descartar `datos` de plano tira dato
bueno; leerlo de plano escribe ceros que nadie midió.** Aparecieron además dos trampas nuevas
que ninguna de las dos lecturas ingenuas resuelve:

**Trampa 4 — `datos.key` no siempre es la keyword consultada.** Consultar `casos de revisión`
devuelve `datos.key` igual a `tiempo actual de revisión de casos nvc`, con volumen 10. La
fuente sustituye por una sugerencia y no avisa. Un parser que lea `datos` sin comparar la clave
le cuelga a una keyword la métrica de otra. Es la última fila de la tabla de arriba, y es la
única de las diez que el parser **rechaza**.

**Trampa 5 — la keyword consultada nunca aparece dentro de su propio `keywords[]`.** Medido:
**cero de 70 respuestas se incluyen a sí mismas.** O sea que `keywords[]` es descubrimiento y
`datos` es consulta, y son dos cosas distintas. Esto es lo que redimensionó el enriquecimiento
entero: **este endpoint descubre, no consulta.**

La lectura que quedó implementada, `parseMetricasDeConsulta`, acepta `datos` sólo si la clave
normaliza igual **y** el registro no es degenerado —volumen, CPC, competencia y los doce meses
de historia en cero, todo junto—, y si no cae a `keywords[]`. Hay una prueba por cada rama.

**Mapeo de las tres métricas de KWR-02, con los nombres tal como llegan:**

| Métrica | Campo | Tipo |
|---|---|---|
| Volumen | `data.data.keywords[].search_volume` o `data.data.datos.search_volume` | `number` |
| CPC | `…cpc` | `number` |
| Competencia | `…competition` | `number` |

Cada entrada trae además `key`, `position`, `etv`, `url`, `relative_url` e `history`, que son
doce objetos `{month: "YYYYMM", search_volume}`.

### `/tfidf` — el hallazgo que condiciona a ONPAGE-03 en la fase 15

```
{ ok, data: { keyword, country, language, url, site_id,
              analysis: { prominencia, absolutos, wdfdf, df, veces, numPalabras, global, id } } }
```

**Sin el parámetro `url` el endpoint no devuelve nada útil para Perú.** `analysis.absolutos` y
`analysis.numPalabras` vuelven como arreglos vacíos, `analysis.df` como `null` y
`analysis.global.totalUrls` en cero.

**Con `url` sí devuelve el análisis on-page de esa URL, pero el corpus de comparación sigue
vacío.** `totalUrls` es cero también en ese caso: **el TF-IDF comparativo no está disponible
para Perú.** Es coherente con lo que dice la doc del proveedor, que ES y MX los resuelve su
propio servidor de visibilidad y el resto de los países pasa por un tercero.

Lo que sí llega, y es aprovechable de verdad para ONPAGE-03:

- `analysis.absolutos.urlCompara.encabezados.title` y `.h`, que es el árbol completo de
  encabezados como `{tipo, texto, subencabezados}` anidados
- `analysis.numPalabras.urlCompara` — conteo de palabras (468 en la home del doctor)
- `analysis.veces.urlCompara.vecesKeyword` — repeticiones por término
- `analysis.prominencia.urlCompara` y `analysis.global.codigo.urlCompara` con el texto plano

**Dato colateral que la fase 15 va a querer:** para la home de `drangulocolumna.com`, con la
keyword `hernia discal`, el endpoint devuelve `vecesKeyword: {"hernia discal": 0}` y el único
término repetido es `todos los derechos reservados`, con 2. La home no menciona ni una vez su
keyword principal.

### `/auditoria` — el contrato que ONPAGE-05 necesitaba, y su trampa

**Requiere un proyecto dado de alta en la cuenta de DinoRank.** Con `domain` suelto y sin
`project_id` responde **HTTP 500**, no un error de validación. `drangulocolumna.com` todavía no
es un proyecto de la cuenta.

```
{ ok, data: { source, site: {id, domain, country, language}, tipo, subtipo, url, mode,
              data: { mode, titles, h1, meta, noindex, urls_lentas, http_vs_https,
                      urls_espejo, ilinks },
              summary: { urls_total, titles_duplicados, h1_duplicados, meta_duplicados,
                         noindex, urls_lentas, http, https, urls_espejo, payload_mode } } }
```

`titles.duplicados`, `h1.duplicados` y `meta.duplicados` son **objetos indexados por el texto
duplicado**, y su valor es el arreglo de URLs que lo repiten. El texto de la meta llega
además con las entidades HTML sin decodificar (`&lt;p&gt;`).

**Trampa del contrato:** cada fila viene **por duplicado dentro del mismo objeto**, una vez con
claves posicionales `"0"`, `"1"`, `"2"` y otra con claves nombradas `id`, `url`, `title`. Es el
artefacto típico de un `fetch_array` de PHP. Un parser que recorra la fila con `Object.entries`
procesa cada valor dos veces: **hay que leer por nombre y nunca iterar.** Hay prueba nombrada.

### `/canibalizaciones` — el contrato que MAP-02 necesitaba, a medias

```
{ ok, data: { source, site, include_advice, last_searchconsole_date,
              arrayKeywords, arrayCanibaliza, summary: {keywords, clusters, has_data} } }
```

Mismo requisito de proyecto, y uno más: **los datos salen de Search Console.** Sin la propiedad
conectada, la respuesta llega con `ok: true`, `last_searchconsole_date: null`, los dos arreglos
vacíos y `summary.has_data: false`.

**Ese booleano es la señal que MAP-02 tiene que mirar**, y no el largo de `arrayCanibaliza`:
dos arreglos vacíos no significan que el sitio no canibalice, significan que nadie midió.

**Lo que sigue sin conocerse, y hay que decirlo:** la forma de las filas de `arrayKeywords` y
`arrayCanibaliza`. El proyecto sondeado no tiene Search Console conectado, así que los dos
arreglos llegaron vacíos. MAP-02 tendrá que resondear cuando exista un proyecto con datos.

### Las fixtures de auditoría y canibalizaciones están seudonimizadas, y por qué

El único proyecto cargado en la cuenta de DinoRank de Juan **es de otro cliente**
(un proyecto ajeno; identificador y rubro omitidos a proposito). Como esos dos endpoints no aceptan un dominio
suelto, la única forma de conocer su contrato era sondear ese proyecto.

De esa respuesta se conserva **sólo la forma**: dominios, URLs, títulos, metas e
identificadores están reemplazados por seudónimos **estables**, de modo que la relación de
duplicidad —que es justo lo que ONPAGE-05 tiene que detectar— sobrevive intacta y la fixture
sirve para probar el parser.

El reemplazo se hace con una **lista de exclusión y no de inclusión**. La diferencia no es de
estilo: con una lista de campos a seudonimizar, cualquier campo que el proveedor no hubiera
devuelto durante el sondeo pasa intacto. Pasó, de hecho: la primera versión filtró la
`metadescription` entera del otro cliente porque ese nombre de campo no estaba en la lista. Con
exclusión, un campo nuevo entra seudonimizado por defecto.

**Verificado con un chequeo que no depende de acordarse de nada:** se toma cada cadena de
contenido de la respuesta cruda y se comprueba que ninguna sobreviva en la fixture. Resultado:
**0 de 54**.

## Consumo de cuota, medido

El plan pedía empezar acotado. Se hizo, dos veces, y las dos mediciones cambiaron la decisión.

| Momento | Llamadas | Acumulado | Qué se aprendió |
|---|---:|---:|---|
| Sondeo de los cuatro endpoints | 5 | 45 | `/keyword-research` salió de caché: **0 llamadas**. `/auditoria` con dominio suelto da 500 |
| **Corrida acotada 1** (20 frases de permutación) | 18 | 63 | **0 de 20 resueltas** |
| **Corrida acotada 2** (25 términos cabecera) | 12 | 75 | **0 de 25** con el parser de entonces; **5 de 36** al corregirlo |
| Corrida de términos cabecera (`--max-words 3`) | 112 | 187 | **60 de 148**, un 41 % |
| Cosecha de caché sobre el universo entero | **0** | 187 | **35 más, sin gastar nada** |

**Total gastado por este plan: 147 llamadas.** Acumulado de DinoRank: 187. No hay techo
documentado y el proveedor no expone endpoint de saldo, así que el control es el libro de cuota
del plan 01, que persiste entre corridas.

### La decisión de no gastar las 499 llamadas restantes

Quedaron 499 keywords pendientes de cuatro o más palabras. **No se consultaron, a propósito**,
y la evidencia es de tres tipos:

1. **Medición directa:** 20 consultas sobre frases de permutación, 0 resueltas.
2. **Medición de plan 12-03:** 15 de sus 40 semillas devolvieron cero, todas las de cuatro o
   más palabras.
3. **Razón estructural:** la trampa 5. Como la keyword consultada no vuelve en su propia
   respuesta, la única forma de que una frase larga tenga métricas es aparecer como relacionada
   de otra. Consultarla directamente **no puede** devolverla.

Gastar un 73 % del presupuesto restante en una operación que la evidencia dice que devuelve
cero no es prudencia, es lo contrario. **La regla quedó en el código como bandera `--max-words`
y no como criterio de esta corrida**, para que la próxima persona no tenga que redescubrirla.

## Cobertura final del universo

| | Antes de este plan | Después |
|---|---:|---:|
| Keywords con volumen, CPC y competencia | 4992 | **5087** |
| Con volumen medible mayor que cero | 2032 | **2067** |
| Marcadas `sin_datos` | 724 | **629** |
| Procedencia del volumen resuelta | 100 % | **100 %** |

Las 95 nuevas salieron de dos sitios: **60 de 148 consultas de término cabecera** y **35
cosechadas de respuestas ya pagadas**, éstas últimas sin gastar nada.

**Las 629 restantes quedan marcadas `sin_datos` con su procedencia declarada, no vacías.** 628
son de alcance `objetivo` y su composición importa para la fase 13: 129 son términos cabecera
que **sí se consultaron** y la fuente no conoce, y 499 son frases largas de permutación. Para
un dominio de agosto de 2026 sin historial, una keyword geolocalizada sin volumen medible es
**señal de oportunidad y no dato faltante**, que es exactamente lo que decidió el CONTEXT.

Ejemplos de las que sí se resolvieron y son negocio puro: `ciática` (8100), `desgarro muscular`
(5400), `cifosis` (3600), `discopatía degenerativa` (40, CPC 0,04), `cirugía mínimamente
invasiva` (30).

## Recarga del Sheet: SHEET-06 en su caso más exigente

El caso difícil no es insertar filas nuevas: es que **5716 filas cambien de valor y la cantidad
de filas no se mueva ni una**.

| | actualizadas | insertadas | filas eliminadas | columnas agregadas | llamadas |
|---|---:|---:|---:|---:|---:|
| Ensayo previo | 5716 | 0 | 0 | 0 | 3 |
| **Primera carga real** | **5716** | **0** | 0 | 0 | 5 |
| **Segunda carga real** | **5716** | **0** | 0 | 0 | 5 |

**Grilla del tab antes y después: `5719 x 28`, sin cambio.** 19 encabezados, fila 3, ninguno
renombrado ni movido.

### Lectura de vuelta contra el documento real

| Fila | Keyword | Search Volume | CPC | Competition | Las tres diferidas |
|---|---|---:|---:|---:|---|
| 296 | `ciática` | `8100` (número) | `0.3` | `0.01` | `no_consultado` |
| 341 | `desgarro muscular` | `5400` (número) | `0.23` | `0.02` | `no_consultado` |
| 75 | `cirugía de columna` | **vacía** | vacía | vacía | `no_consultado` |

La fila 75 es la comprobación que importa del lado del cliente: una keyword sin datos deja la
celda **vacía y no en cero**. Un cero ahí sería una afirmación falsa sobre el mercado.

`Cluster`, `URL`, `Suggested H1`, `Top Result` y `Notes` siguen vacías: son de las fases 13, 14
y 15. No se agregó ninguna columna de procedencia, coherente con **J-3**.

## Criterios de aceptación, con la salida real

| Criterio | Resultado |
|---|---|
| `npm run typecheck` | código 0 |
| `env -u DINORANK_API_KEY npm test` | **179 de 179 en verde, sin clave** |
| Una prueba por cada uno de los diez comportamientos | sí, más 4 del bloque `datos` y 4 de los parsers nuevos |
| Los cuatro endpoints implementados, exportados y con prueba sobre su fixture | sí |
| Los cuatro pasan por el seam: la segunda consulta no llama a la red | prueba nombrada, 1 llamada por endpoint en dos invocaciones |
| `dino:probe --endpoint keyword-research --country pe` | código 0, fixture grabada |
| La fixture declara país Perú e idioma español | `"country":"pe","language":"es"` en `_probe.request` |
| El inventario identifica volumen, CPC y competencia | sí, con el porcentaje de relacionadas con volumen medible |
| Fixtures de los otros tres endpoints | las tres existen |
| Ninguna fixture contiene la credencial, leída desde `.secrets/.env` con aborto si sale vacía | **`fixtures limpias: 4`** |
| README con el contrato real y los nombres de campo tal como llegan | sección 7, los cuatro endpoints |
| `grep -rn "fetch(" src/sources` | **0** |
| `grep -rniE "ahrefs" seo-tools/src` | **0** |
| Procedencia del volumen resuelta en ≥ 95 % de las líneas | **100 % sobre 5716** |
| Las tres diferidas con su literal en el 100 % | sí, con guarda que impide escribir si se pierde |
| Corrida acotada registrada y corrida completa posterior | dos corridas acotadas, y la decisión que salió de ellas |
| Recarga: cero inserciones y misma cantidad de filas | `insertadas: 0` dos veces, grilla `5719x28` sin cambio |
| `git diff --cached` sobre rutas prohibidas antes de cada commit | **0** en los cinco commits |
| `git check-ignore .secrets/.env` | código 0 (`.gitignore:44`) |
| El valor de la clave no aparece en ningún log ni archivo | sólo `64 caracteres, empieza por "0ce5"` |

## Desviaciones del plan

### 1. [Regla 1 - bug] El parser descartaba el bloque `datos`, y ahí había dato real

**Encontrado en:** tarea 3, auditando por qué la corrida acotada resolvía 0 de 20.
**Qué estaba mal:** el parser heredado del plan 03 lee el volumen sólo de `keywords[]`, porque
el contrato del 2026-08-10 afirmaba que `datos` vuelve siempre en cero. Es falso en 10 de 70
respuestas. Y como la keyword consultada **tampoco** aparece en `keywords[]` —cero de 70—, el
enriquecimiento por consulta directa era estructuralmente incapaz de resolver nada.
**Qué se hizo:** `parseDatosPropios` y `parseMetricasDeConsulta`, con las dos guardas que evitan
los dos errores opuestos: comparación de clave normalizada contra la sustitución silenciosa, y
detección de registro degenerado contra el cero inventado. `parseKeywordResearch` **no se tocó**:
la expansión del plan 03 busca keywords nuevas y para eso `keywords[]` es lo correcto.
**Commit:** `5089a11`.

### 2. [Regla 2 - funcionalidad crítica ausente] Se pagaba dos veces por el mismo dato

**Encontrado en:** tarea 3, al terminar la corrida de términos cabecera.
**Situación:** cada respuesta trae cientos de relacionadas con métricas, pero el enriquecimiento
sólo aplicaba las respuestas que él mismo pedía en esa corrida. Las 147 respuestas compradas
quedaban a medio aprovechar, y una keyword ya contestada dentro de una respuesta vieja se
volvía a consultar.
**Qué se hizo:** barrido de la caché **antes** de emitir cualquier consulta. Rindió **35
keywords con cero llamadas**. Tiene prueba nombrada: se paga una consulta y una keyword que
nunca se consultó queda resuelta.
**Commit:** `5089a11`.

### 3. [Regla 2 - funcionalidad crítica ausente] Fuga de datos de otro cliente en una fixture commiteada

**Encontrado en:** tarea 2, revisando la fixture de auditoría antes de commitearla.
**Situación:** los dos endpoints de proyecto sólo resuelven contra un proyecto dado de alta, y
el único de la cuenta es de otro cliente. La fixture salía con su dominio, sus URLs, sus
títulos y su meta description completos, hacia un repositorio que además comparte otro
workstream.
**Qué se hizo:** bandera `--anonymize` con seudónimos estables, por lista de exclusión. La
primera versión, por lista de inclusión, dejó pasar `metadescription`; se invirtió la política
y se agregó un chequeo que compara cada cadena de contenido de la respuesta cruda contra la
fixture. **0 de 54 sobreviven.**
**Commit:** `537f6bc`.

### 4. [Redimensionamiento] No se gastaron las 499 llamadas de frases largas

Ya explicado arriba con las tres evidencias. El plan admite las dos salidas —correr el universo
completo, o registrar el consumo medido y decidir— y la medición dijo que no. La regla quedó
como bandera `--max-words` con su prueba, no como decisión de una corrida.

### 5. [Criterio del plan mal escrito] El `<verify>` de la tarea 3 lee un campo que no existe

El bloque automatizado hace:

```js
if (o.volumeSource === 'dinorank' || o.volumeSource === 'sin_datos') con++;
```

**`volumeSource` no existe en el dataset.** El esquema del plan 04 lo llama
`metricas.searchVolumeFuente`. Tal como está escrito, `con` queda en 0 y el criterio falla
siempre con datos perfectos. Se ejecutó la comprobación equivalente contra el nombre real:

```
cobertura 100% sobre 5716 keywords
```

**El criterio se cumple; su redacción no.** Es el tercer criterio de esta fase con el mismo
patrón: escrito contra un esquema imaginado en lugar del que produjo el plan anterior.

### 6. [Criterio del plan incumplible, ya conocido] La verificación 8 sobre `ahrefs`

Pide que `grep -rniE "ahrefs" seo-tools/src --include='*.ts'` imprima `0`. **Imprime 0.** La
versión que el plan 12-04 encontró rota es la que barre también `data/`, donde hay 3
coincidencias inevitables: los nombres literales de tres columnas del Sheet del cliente, que
por decisión **J-1** no se renombran. Este plan usó el alcance correcto desde el principio.

### 7. [Bug del SDK, ya conocido] Los verbos de estado ensucian los archivos de planificación

`requirements.mark-complete` y `roadmap.update-plan-progress` insertan líneas en blanco entre
ítems de lista y dejan la tabla de trazabilidad sin actualizar. Los planes 12-02 y 12-04 ya se
lo habían encontrado. **Qué se hizo:** no se invocaron. Los tres archivos del workstream se
editaron a mano, con diffs mínimos y revisados uno por uno.

## Lo que la fase 13 se lleva sin pagar de nuevo

- **186 respuestas de DinoRank en caché**, 18,3 MB, con miles de keywords relacionadas y sus
  métricas. Reprocesar el universo entero cuesta **cero llamadas**, verificado.
- **115 búsquedas de SerpApi** disponibles hasta el 2026-08-21, intactas: este plan no gastó
  ninguna.
- **2067 keywords con volumen medible**, de las cuales las de alcance `objetivo` son el
  universo real para clusterizar.

## Lo que las fases 14 y 15 tienen que saber

1. **`/auditoria` y `/canibalizaciones` no funcionan todavía para este dominio.** Necesitan que
   `drangulocolumna.com` esté dado de alta como proyecto en el panel de DinoRank, y
   `/canibalizaciones` además que tenga Search Console conectado y semanas de historial. Los dos
   endpoints **no consumen cuota**, así que resondear es gratis.
2. **El TF-IDF comparativo no está disponible para Perú.** ONPAGE-03 no va a poder comparar
   contra el corpus de competidores por esta vía. Lo que sí sirve es la extracción on-page de la
   URL propia, que llega completa.
3. **La forma de las filas de canibalización sigue sin conocerse.** Hay que resondear cuando
   haya datos.
4. **La trampa del `fetch_array` en `/auditoria`**: leer por nombre, nunca iterar la fila.

## Tareas pendientes que quedan abiertas

- Dar de alta `drangulocolumna.com` como proyecto en DinoRank y conectarle Search Console.
  Es la condición para MAP-02 y ONPAGE-05, y no depende de este workstream.
- Las tres métricas de Ahrefs siguen diferidas sin fase asignada, tal como decidió Juan.
  KWR-05 depende de KD: la fase 13 decide si usa un proxy leído de la SERP o reincorpora Ahrefs.

## Known Stubs

Ninguno. Los tres campos con valor `no_consultado` no son stubs: existen a propósito para todo
el universo, con la decisión de Juan del 2026-08-10 detrás y dos guardas en el código —una en el
consolidador del plan 04 y otra en el enriquecimiento— que se niegan a escribir el archivo si
alguno pierde su literal.

Las 629 keywords marcadas `sin_datos` tampoco lo son: es un valor declarado con su campo de
procedencia, y la celda del Sheet queda **vacía y no en cero** justamente para no afirmar algo
que nadie midió.

## Threat Flags

Ninguno nuevo respecto del `<threat_model>` del plan. Vale registrar que **T-12-41 se
materializó** durante la ejecución, en su variante de datos de terceros y no de credencial: la
primera versión de la fixture de auditoría llevaba contenido identificable de otro cliente. La
mitigación prevista —revisión campo por campo antes de commitear— fue la que lo detectó, y se
reforzó invirtiendo la política de la lista y agregando un chequeo automático.

## Nota sobre el paralelismo con el workstream `milestone`

Nada se escribió bajo `src/`, ni en `.planning/STATE.md`, `ROADMAP.md` o `REQUIREMENTS.md` de la
raíz, ni bajo `.planning/workstreams/milestone/`. No se tocó `seo-tools/src/cli.ts`,
`seo-tools/src/sheets/`, `cache.ts`, `quota.ts`, `http.ts` ni ninguno de los módulos de
`src/keywords/` de los planes 03 y 04. Cada commit se hizo por archivo nombrado, nunca con
`git add -A`, y los cinco pasaron la comprobación de que el área de preparación no contenía
ninguna ruta prohibida.

El único archivo del árbol de planificación que `sheet:inspect` modifica es
`data/sheet-headers.json`, y su único cambio era la marca de tiempo: se restauró para no dejar
ruido.

## Self-Check: PASSED

Archivos verificados en disco: `seo-tools/src/keywords/enrich.ts`,
`seo-tools/src/keywords/enrich.test.ts`, `seo-tools/src/sources/dinorank.ts`,
`seo-tools/src/sources/dinorank.test.ts`, `seo-tools/src/commands/dino-probe.ts`,
`seo-tools/src/commands/kw-enrich.ts`, `seo-tools/data/keywords.jsonl`, y las cuatro fixtures
de `seo-tools/data/fixtures/`.

Commits verificados en el historial: `537f6bc`, `da525de`, `5089a11`, `0e34567`.

Puertas de TDD: rojo en `da525de` con los dos archivos de prueba fallando por módulo y
exportaciones inexistentes; verde en `5089a11` con 179 de 179. El bloque `datos` siguió el mismo
ciclo dentro de la tarea: cuatro pruebas en rojo primero, implementación después.
