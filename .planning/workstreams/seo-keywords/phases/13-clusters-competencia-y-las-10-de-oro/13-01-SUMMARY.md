---
phase: 13-clusters-competencia-y-las-10-de-oro
workstream: seo-keywords
plan: 01
subsystem: seo-tools
tags: [serp, cache, clasificacion, sheets, cuota]
status: complete
requires:
  - "seo-tools/src/cache.ts (seam de caché, fase 12)"
  - "seo-tools/src/sources/serpapi.ts (parametrosBusqueda, fase 12)"
  - "las 12 capturas de SERP de Lima en .cache/serpapi/ (fase 12)"
provides:
  - "serpCompleta(): la SERP entera desde caché, con la clave intacta"
  - "seo-tools/src/phase13/args.ts: parseo de banderas de la fase"
  - "seo-tools/src/phase13/serp.ts: registro tipado de SERP"
  - "seo-tools/src/phase13/pagetype.ts + data/serp-page-types.json: tipo de página por resultado y por cluster"
  - "Cluster y Top Result escribibles en el Sheet"
  - "la forma real del tab transpuesto, medida contra el documento en vivo"
affects:
  - 13-02
  - 13-03
  - 13-04
  - 13-05
tech-stack:
  added: []
  patterns:
    - "Puntos de entrada propios bajo src/phase13/, sin tocar el despachador cerrado"
    - "Patrones en archivo de datos con precedencia explícita, igual que intent-rules.json"
    - "Medir el documento del cliente en solo lectura antes de declarar su modelo"
key-files:
  created:
    - seo-tools/src/phase13/args.ts
    - seo-tools/src/phase13/serp.ts
    - seo-tools/src/phase13/serp.test.ts
    - seo-tools/src/phase13/serp-show.ts
    - seo-tools/src/phase13/pagetype.ts
    - seo-tools/src/phase13/pagetype.test.ts
    - seo-tools/src/phase13/tab-recon.ts
    - seo-tools/data/serp-page-types.json
    - .planning/workstreams/seo-keywords/data/competitor-tab-recon-2026-08-11.md
  modified:
    - seo-tools/src/sources/serpapi.ts
    - seo-tools/src/sources/serpapi.test.ts
    - seo-tools/src/sheets/schema.ts
    - seo-tools/src/sheets/upsert.ts
    - seo-tools/src/sheets/upsert.test.ts
    - seo-tools/data/sheet-columns.json
    - seo-tools/docs/sheet-model.md
decisions:
  - "Top Result se reasigna de la fase 15 a la 13: es dato de SERP y la SERP la captura esta fase"
  - "Siete tipos de página, no cuatro: la medición obligó a agregar contenido internacional, red social y otro"
  - "El tab transpuesto se declara fila por fila, porque la columna B carga además los títulos de sección"
metrics:
  duration: "~1h 50min"
  completed: "2026-08-11"
  tasks: 3
  commits: 5
  tests_before: 179
  tests_after: 220
  serpapi_searches_spent: 0
---

# Phase 13 Plan 01: El camino de la SERP, probado con coste cero

Una SERP ya cacheada recorre el camino completo —caché, parser, registro tipado, clasificación
por tipo de página— sin gastar ni una de las 114 búsquedas de SerpApi que quedan, y el Sheet
queda listo para recibir `Cluster` y `Top Result` sin rozar las columnas de las fases 14 y 15.

## Qué se construyó

**`serpCompleta()` en `src/sources/serpapi.ts`.** Lee la respuesta entera de la fuente —orgánicos
con posición, URL, dominio normalizado, título y fragmento; pack local con calificación y
reseñas; relacionadas; preguntas; bloque destacado; banderas de resumen de IA y de vídeos— y la
devuelve como registro tipado. Reusa `parametrosBusqueda(q)` sin agregar, quitar ni renombrar un
solo parámetro, que es lo que mantiene válidas las 12 capturas de Lima de la fase 12. Hay una
prueba nombrada que lo demuestra de forma operativa: llena la caché por el camino de
`busquedaGeolocalizada` y después lee por el de `serpCompleta` en modo offline; si la clave
hubiera cambiado, la segunda lectura moriría.

La marca de tiempo sale del envelope y no del reloj, así que dos lecturas del mismo archivo dan
el mismo registro byte a byte.

**`src/phase13/args.ts`.** Copia funcional del parser de banderas de la fase 12, con la razón
escrita en la cabecera: `src/cli.ts` llama a `main()` en el cuerpo del archivo, así que
importarlo desde otro punto de entrada ejecutaría el despachador con los argumentos
equivocados. Cero archivos de `src/phase13/` importan el despachador.

**`src/phase13/pagetype.ts` y `data/serp-page-types.json`.** Clasificador determinista. Siete
tipos con precedencia explícita en el archivo de datos. Afinar la clasificación es editar un
JSON.

**`src/phase13/tab-recon.ts`.** Punto de entrada de solo lectura que baja `A1:U36` de
`Competitor Analysis` en una sola petición y vuelca la forma real.

## Los tipos de página, medidos sobre las 12 capturas

95 resultados orgánicos, cero sin tipo, 12 de 12 SERP con tipo dominante.

| Tipo | Resultados | Dominios representativos |
|---|---|---|
| contenido-internacional | 46 | `mayoclinic.org` (5), `medlineplus.gov` (5), `elsevier.es` (3), `quironsalud.com` (2), `institutoclavel.com` (2), `scielo.*`, `cun.es`, `cigna.com`, `nih.gov`, `clinicbarcelona.org` |
| directorio | 15 | `doctoralia.pe` (5), `waze.com` (2), `queplan.pe`, `bumeran.com.pe`, `pe.indeed.com`, `play.google.com`, `directorio.hospitalcima.com`, `teescucho.pe`, `topdoctors.cl` |
| red-social | 14 | `facebook.com` (6), `instagram.com` (4), `youtube.com` (2), `pe.linkedin.com` (2) |
| pagina-de-servicio | 7 | `clinicarthromeds.pe`, `clinicaprovidencia.pe`, `stellamaris.com.pe`, `clinicaangloamericana.pe`, `drabeltrantraumatologia.com`, `auna.org` |
| ficha-de-clinica | 6 | `sanna.pe` (3), `clinicatezza.com.pe`, `crp.com.pe`, `cmlimasurcrp.com.pe` |
| otro | 5 | `lpderecho.pe` (2), `ucss.edu.pe`, `mkt.pacificovida.com.pe`, `vannesaangulo.com` |
| guia | 2 | `clinicainternacional.com.pe/blog-educativo/`, `clinicasanfelipe.com/blog/` |

**El hallazgo que importa para el resto de la fase: solo 2 de 95 resultados orgánicos son guías
peruanas disputables.** 46 son contenido internacional que un consultorio de Lima no pelea, y
otros 29 son directorios y redes sociales, donde no se gana escribiendo sino teniendo perfil.
El hueco real de contenido local es enorme, y eso es exactamente lo que las 10 de Oro tienen
que aprovechar.

Tipo dominante por captura:

| Keyword | Dominante | Reparto |
|---|---|---|
| hernia discal | contenido-internacional | 6 internacional, 1 servicio |
| estenosis espinal | contenido-internacional | 8 internacional |
| artrodesis en varios niveles | contenido-internacional | 8 internacional |
| cirugía de columna | contenido-internacional | 7 internacional |
| escoliosis y deformidades de columna | contenido-internacional | 7 internacional, 1 guía |
| cirugía convencional | contenido-internacional | 3 internacional, 2 servicio, 1 guía, 1 directorio |
| ortopedia infantil | **pagina-de-servicio** | 5 servicio, 1 internacional, 1 directorio, 1 red social |
| casos de revisión | contenido-internacional | 4 internacional, 2 red social, 2 otro |
| clínica padre luis tezza | red-social | 3 red social, 2 ficha, 1 directorio, 1 internacional |
| clínica ricardo palma | red-social | 3 red social, 2 directorio, 2 ficha |
| clínica sanna la molina | directorio | 4 directorio, 3 ficha, 2 red social, 1 otro |
| consultorio privado del dr. angulo | directorio | 6 directorio, 3 red social, 1 otro |

`ortopedia infantil` es la única de las cuatro condiciones núcleo cuya SERP está dominada por
páginas de servicio de clínicas de Lima. Es la más ganable de las cuatro y `clinicarthromeds.pe`
ya está en su posición 2 con el patrón de URL geo que el proyecto quiere replicar.

## El tab transpuesto, medido y no supuesto

El volcado vive en `.planning/workstreams/seo-keywords/data/competitor-tab-recon-2026-08-11.md`.
Tres cosas salieron distintas de lo que el reconocimiento del 2026-08-10 dejaba suponer:

**1. Hay exactamente cinco slots de competidor y no son columnas contiguas.** Corren con paso 4
desde la columna B: `B`, `F`, `J`, `N`, `R`. La fila 2 lleva el nombre del competidor y la fila 3
su dominio. Cinco slots es justo lo que pide COMP-01: el de más a la izquierda lo ocupa el
residuo de plantilla, y al limpiarlo quedan los cinco libres.

**2. La columna B hace doble tarea, y ahí estaba el riesgo real.** No es una columna de
etiquetas: es el primer slot de competidor y, encima de sus valores, carga los títulos de
sección en las filas 1, 4, 11, 17, 23, 25 y 31. Un escritor que volcara una columna entera sobre
el slot B borraría esos títulos sin lanzar ninguna excepción. Por eso el modelo declara `row`
métrica por métrica.

**3. La etiqueta de la fila 25 mide 139 caracteres y 31 después de recortar: 108 espacios
finales.** Comparar sin `trim()` no la encuentra jamás.

Los seis bloques, derivados de los títulos de la columna B:

| Fila del título | Título literal | Filas del bloque | Etiquetas |
|---|---|---|---|
| 4 | `Key Stats ` | 5–10 | `Domain Rating (DR)`, `Ahrefs Rank (AR)`, `Referring Domains`, `Estimated Monthly Search Traffic`, `Estimated Top 100 Keyword Rankings`, `Do they have a blog?` |
| 11 | `Traffic Breakdown by Country ` | 12–16 | `Country 1` a `Country 5` |
| 17 | `Keywords` | 18–22 | `Keyword 1` a `Keyword 5` |
| 23 | `Featured Snippets ` | 24 | `Number of featured snippets` |
| 25 | `Páginas principales (#10)` | 26–30 | `Top page 1` a `Top page 5` |
| 31 | `Most Linked Content (#11)` | 32–36 | `Most linked content 1` a `Most linked content 5` |

Fuera de bloque: la fila 3, `Website`, que es la clave de idempotencia.

Dentro del bloque de 4 columnas de cada slot, el desplazamiento `+2` lleva un porcentaje, y solo
en el bloque de países: `B12 = "United States"` con `D12 = "20%"`.

Residuo de plantilla, con celda exacta: `B2` = `pera`, `B3` = `pera.com`, `B5` = `20`,
`B6` = `13`, `B12` = `United States`, `D12` = `20%`, `B24` = `6`.

29 filas de métrica quedaron declaradas en el modelo: 11 en `fase-13` y 18 en `no-consultado`,
que son las de Ahrefs que quedan fuera del `select` recortado de D-07.

## El Sheet

| Encabezado | Columna real | Campo | Estado |
|---|---|---|---|
| `Cluster` | B | `cluster` | `fase-13` |
| `Top Result` | M | `topResult` | `fase-13`, reasignada desde la 15 |
| `URL` | C | — | `fase-14`, sin tocar |
| `Suggested H1` | L | — | `fase-15`, sin tocar |

`URL` y `Suggested H1` están **exactamente** donde un filtro mal ampliado las pisaría: `URL` cae
entre `Cluster` (B) y `Search Volume` (D), y `Suggested H1` entre `Referring Domains Needed ` (K)
y `Top Result` (M). El escritor coalesce índices contiguos en rangos, así que una columna ajena
en medio de dos propias se sobreescribiría sin lanzar nada. Hay dos pruebas nombradas contra
el modelo real que afirman que ningún rango escrito alcanza las columnas `C` ni `L`.

`fase-13` entró también en `REQUIRED_STATUSES`: si alguien renombra `Cluster` o `Top Result` en
el documento del cliente, la carga falla ruidosa en vez de saltarse la columna en silencio.

## Criterios de aceptación, con la salida real

| Criterio | Resultado |
|---|---|
| `npm run typecheck` en 0 | `tsc --noEmit` sin salida |
| Suite completa sin ninguna credencial | `tests 220 · pass 220 · fail 0` con `env -u SERPAPI_API_KEY -u DINORANK_API_KEY -u SEO_SHEET_ID -u GOOGLE_SERVICE_ACCOUNT_FILE` |
| Tracer sobre `hernia discal` | `7 orgánicos, 8 relacionadas, 4 preguntas`, salida 0 |
| Cuota de SerpApi antes y después | `ANTES=12 DESPUES=12`, `lastCallAt` sigue en `2026-08-10T22:16:22.447Z` |
| Prueba de clave de caché compartida | `la clave de cache de serpCompleta es la MISMA que la de busquedaGeolocalizada` |
| Ramas tolerantes | 4 pruebas: sin pack local, sin destacado, sin resumen de IA, enlace roto |
| Nadie importa el despachador | `grep -rl 'cli\.js' src/phase13/` devuelve 0 archivos; ningún `import ... from ... cli` |
| Los 95 orgánicos clasificados | `resultados clasificados: 95 sin tipo: 0` |
| 12 tipos dominantes | ninguna captura sin él |
| Dos corridas, mismo SHA-256 | `5e0f68dc…fb36` en las dos |
| El clasificador no consulta a nadie | `grep -rniE 'fetch\(\|https?://\|openai\|anthropic' src/phase13/pagetype.ts` devuelve 0 |
| `sheet:push --dry-run` contra el documento real | salida 0, `insertadas: 0`, `columnas agregadas: 0`, `actualizadas: 5716` |
| El volcado nombra las filas y el residuo | `Domain Rating` presente, `pera` en `B2` y `B3` |
| ≥8 filas de métrica con clave por dominio | 29 filas, `keyField: "domain"` |
| Cero escrituras contra el Sheet | `tab-recon.ts` emite solo `values.get`; el dry-run no escribe |
| El guardarraíl del `tsconfig` sigue | `exclude` con `"seo-tools"` intacto |
| El dataset de la fase 12 sin tocar | SHA-256 `c59dad2d…eac`, idéntico |
| T-13-SC: cero paquetes instalados | `package.json` y `package-lock.json` sin cambios en los 5 commits |
| T-13-01: la credencial no toca la fase 13 | `grep -rn 'api_key' src/phase13/` devuelve 0 |

## Criterios de aceptación que resultaron frágiles

Uno, y no está mal en su intención sino en su forma:

**El bloque de verificación de la tarea 1 usa `node -e "console.log(n)"` para leer el contador
de cuota.** En este entorno `FORCE_COLOR` está fijado, así que `console.log` de un número
devuelve la cadena con códigos ANSI y `test "$DESPUES" -eq 12` muere con
`integer expression expected`. La comparación `ANTES` contra `DESPUES` sí pasaba, porque los dos
llevaban la misma contaminación. Se verificó con `process.stdout.write(String(n))`, que es la
misma comprobación sin el color. **Los planes 13-02 a 13-05 deberían usar esa forma** en
cualquier criterio que compare un número leído con `node -e`.

## Desviaciones del plan

### Ajustes automáticos

**1. [Regla 3 - Bloqueante] La doble de prueba del tab transpuesto no traía el tab.**
- **Encontrado en:** tarea 3, al escribir la prueba de que el escritor rechaza el tab
- **Problema:** `loadTabSchema` valida que el tab exista *antes* de llamar a la guarda de
  orientación, así que la prueba fallaba con "el tab no existe" y habría pasado por la razón
  equivocada si la aserción hubiera sido más laxa
- **Arreglo:** la doble trae ahora el tab real con su residuo, y la prueba afirma además que no
  se emite ni una escritura y que `B3` sigue siendo `pera.com`
- **Archivos:** `seo-tools/src/sheets/upsert.test.ts`
- **Commit:** `31e93ec`

**2. [Regla 1 - Bug] La fixture de `upsert.test.ts` usaba `Cluster` para probar que las columnas
ajenas quedan intactas.**
- **Encontrado en:** tarea 3, al agregar `fase-13` al filtro de columnas propias
- **Problema:** al volverse `Cluster` una columna que la fase sí escribe, la prueba
  "las columnas de otras fases quedan intactas" pasaba a afirmar lo contrario de lo que quería
- **Arreglo:** la columna B de la fixture pasa a ser `Suggested H1`, que sigue siendo de la fase
  15, con la razón escrita en el comentario de la fixture. Se ajustaron las tres pruebas que la
  referenciaban
- **Archivos:** `seo-tools/src/sheets/upsert.test.ts`
- **Commit:** `31e93ec`

**3. [Regla 2 - Precisión] Dos reglas de clasificación mentían sobre resultados reales.**
- **Encontrado en:** tarea 2, al pasar el clasificador sobre los 95 orgánicos
- **Problema:** `/nosotros` y `/nuestros-locales` en `ficha-de-clinica` hacían que
  `ucss.edu.pe/nosotros/nuestros-locales/en-lima/padre-luis-tezza`, que es la sede de una
  **universidad**, pasara por ficha de clínica. Y `revespcardiol.org`, una revista española,
  caía en `pagina-de-servicio` por llevar `cirugia` en la ruta
- **Arreglo:** se acortaron los patrones de ruta de `ficha-de-clinica` a los tres inequívocos y
  se sumaron `revespcardiol.org`, `aaot.org.ar` y `neurorgs.net` a contenido internacional. La
  razón quedó escrita en el propio JSON
- **Archivos:** `seo-tools/data/serp-page-types.json`
- **Commit:** `77cd140`

**4. [Regla 3 - Bloqueante] `consultar()` devolvía solo el cuerpo y no el envelope.**
- **Encontrado en:** tarea 1
- **Problema:** `serpCompleta` necesita `fetchedAt` para que la marca de tiempo sea la de la
  captura y no la del reloj
- **Arreglo:** se extrajo `consultarEnvelope()` y `consultar()` pasó a ser una capa fina sobre
  ella. Ninguna firma pública de la fase 12 cambió
- **Archivos:** `seo-tools/src/sources/serpapi.ts`
- **Commit:** `6e4b1e1`

### Ampliaciones deliberadas sobre lo que pedía el plan

- **`ColumnModel` gana un campo opcional `row`**, validado como entero base 1. Sin él, el número
  de fila declarado en `sheet-columns.json` no sobreviviría al parseo del modelo y el escritor de
  13-03 no podría leerlo.
- **El volcado del tab deriva los seis bloques de métricas de los títulos de la columna B**, en
  vez de dejar la clasificación de filas escrita a mano. Así el documento se regenera con una
  sola corrida si el tab cambia.
- **`serp-page-types.json` declara `precedencia` además del orden de `tipos`**, y el cargador
  falla si los dos no coinciden. Es redundancia a propósito: hace imposible que una reordenación
  del arreglo cambie la clasificación en silencio.

## Riesgo que queda abierto y hay que mirar en 13-03

**Un `sheet:push` del dataset de la fase 12 ahora escribe cadena vacía en `Cluster` y en
`Top Result`.** Al pasar las dos columnas a `fase-13`, entran en el conjunto de columnas propias,
y el escritor resuelve el valor de una columna propia cuyo campo falta en el registro como celda
vacía. Hoy es inocuo, porque las dos columnas están vacías en el documento. Deja de serlo en
cuanto 13-02 escriba clusters y alguien vuelva a cargar `keywords.jsonl` sin el campo `cluster`:
borraría lo recién escrito, sin lanzar nada.

No se cambió aquí a propósito. La semántica de "campo ausente se escribe como celda vacía" es de
la fase 12 y es deliberada: el CONTEXT registra que `no_consultado` y `0` son cosas distintas y
que el escritor deja la celda vacía en vez de escribir cero. Cambiarla de forma global tocaría
el comportamiento de las métricas de la fase 12.

**Lo que 13-02 y 13-03 tienen que hacer: escribir el `cluster` y el `topResult` dentro del propio
`keywords.jsonl`,** no en un archivo aparte, para que el dataset que se carga sea siempre el
completo. Si por algún motivo se decide un archivo aparte, entonces hace falta antes una opción
de "no escribir la celda cuando el campo está ausente" en `upsertRows`, con su prueba.

## Deferred Issues

**Una prueba de la fase 12 es sensible al reloj y flaquea bajo carga.**
`comportamiento 5: un limite de tasa no se persiste y se reintenta con retroceso exponencial`
(`src/sources/dinorank.test.ts:325`) mide intervalos reales de retroceso con `backoffMs: 20`.
Falló una vez en cinco corridas de la suite completa y pasó 5 de 5 aislada y 4 de 4 en las
corridas siguientes. Es preexistente, no la tocó este plan y está fuera de su alcance: queda
anotada en `deferred-items.md` de la fase.

## Known Stubs

Ninguno en el código de este plan.

Sí hay dos cosas declaradas y sin llenar **a propósito**, con su razón escrita en el modelo:

- **18 de las 29 filas de métrica de `Competitor Analysis` quedan en `no-consultado`**: tráfico
  estimado, rankings top 100, blog, los cinco países, las cinco páginas principales y los cinco
  contenidos más enlazados. Todas salen de endpoints de Ahrefs que quedan fuera del `select`
  recortado de D-07. No es un stub: es la decisión de alcance del CONTEXT, y el literal
  `no_consultado` la hace visible en el documento del cliente en vez de dejar una celda que se
  confunda con un cero.
- **`Cluster` y `Top Result` quedan con campo declarado y sin dato** hasta que 13-02 y 13-04 los
  llenen. Es exactamente lo que este plan tenía que dejar listo.

## Self-Check: PASSED

Archivos declarados como creados, verificados en disco: los 9 existen.
Commits declarados, verificados en `git log`: `c4daeec`, `6e4b1e1`, `524b637`, `77cd140`,
`31e93ec`.
Contador de SerpApi al cerrar: **12**, idéntico al de apertura.
