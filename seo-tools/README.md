# seo-tools

Tooling de datos del milestone v1.2 (workstream `seo-keywords`, fases 12 a 15).

## 1. Que es y que no es

Es una herramienta de datos: consulta fuentes de SEO, construye el universo de keywords y
escribe en el Sheet del cliente. Vive fuera de la aplicacion.

**No forma parte del sitio que se despliega.** No es una ruta, no es un componente y no se
importa desde `src/`. Es un paquete Node independiente con su propio `package.json`,
`package-lock.json`, `node_modules/` y `tsconfig.json`. No esta registrado en el
`package.json` de la raiz y el constructor de la imagen de produccion no lo instala: en la
imagen entra solo el fuente TypeScript, que son unos cien kilobytes muertos.

El reparto del milestone es que v1.2 manda en keywords y textos, y v1.1 manda en codigo.
Por eso ninguna fase de este workstream escribe bajo `src/`.

## 2. Como se corre

El script `cli` carga las variables desde `.secrets/.env` de la raiz del repositorio, con el
soporte nativo de Node, sin dependencia de terceros. Todo se ejecuta desde `seo-tools/`.

```bash
cd seo-tools
npm install

npm run cli -- sheet:inspect
npm run cli -- cache:stats
npm run cli -- cache:put --source dinorank --key <hash de 64 caracteres> --file payload.json

npm run cli -- kw:seeds
npm run cli -- kw:expand --limit 200
npm run cli -- kw:classify
npm run cli -- kw:enrich --plan-only
npm run cli -- dino:probe --country pe
npm run cli -- sheet:push --tab "Keyword Research" --dry-run

npm run typecheck
npm test
```

Banderas globales: `--refresh` (ignora el acierto de cache y vuelve a consultar), `--offline`
(prohibe salir a la red y convierte un fallo de cache en error duro), `--plan-only`,
`--dry-run`, `--yes`, `--max-searches` y `--limit`. Las dos ultimas son distintas entre si:
`--max-searches` topea el gasto de cuota, `--limit` acota cuantos items se procesan.

No hay expiracion automatica de la cache. La invalidacion es explicita con `--refresh`, porque
un criterio de exito de la fase es reprocesar el analisis completo sin volver a gastar cuota y
una expiracion silenciosa rompe eso justo cuando menos conviene.

## 3. Que credencial necesita cada subcomando

| Subcomando | Credencial | Notas |
|---|---|---|
| `sheet:inspect` | `SEO_SHEET_ID` + `GOOGLE_SERVICE_ACCOUNT_FILE` | La service account necesita rol **Editor**, no Lector |
| `sheet:push` | `SEO_SHEET_ID` + `GOOGLE_SERVICE_ACCOUNT_FILE` | Idem |
| `cache:stats` | **ninguna** | Corre siempre, incluso con la cache vacia |
| `cache:put` | **ninguna** | Rellena la cache desde afuera |
| `kw:seeds` | **ninguna** | Lee el contenido del sitio, no la red |
| `kw:classify` | **ninguna** | Motor de reglas determinista, sin red |
| `kw:expand` | `DINORANK_API_KEY` + `SERPAPI_API_KEY` | Con `--offline` corre sin ninguna clave si las consultas ya estan en cache. Ver la seccion 6 |
| `kw:enrich` | `DINORANK_API_KEY` | Idem |
| `dino:probe` | `DINORANK_API_KEY` | Se sondea con `country=pe`, nunca con `es` |

Las pruebas (`npm test`) no necesitan ninguna credencial y no tocan la red.

**La fase corre sobre DinoRank y SerpApi unicamente.** El enriquecimiento con metricas de
Ahrefs quedo diferido por decision de Juan del 2026-08-10: cero cliente, cero clave, cero
llamadas.

Son **tres** columnas las que quedan diferidas, no dos:

1. `Traffic Potential`
2. `Keyword Difficulty`
3. `Referring Domains Needed `

Las tres existen en el dataset y en el Sheet con el valor literal `no_consultado`, y **no se
borran**. Dejarlas permite retomar el enriquecimiento mas adelante sin migrar el esquema.
Ojo con `Referring Domains Needed `: el encabezado real del Sheet lleva un espacio final.

**Presupuesto de cuota.** SerpApi esta en plan gratuito con 250 busquedas al mes: quedan 127
hasta el 21 de agosto de 2026. El gasto esta acotado por codigo, no por buena intencion. Hay
un libro persistido de llamadas que salieron a la red de verdad y un tope por corrida que
**aborta** en vez de seguir gastando. El consumo acumulado se consulta con `cache:stats`.

## 4. Impacto sobre el workstream `milestone`

**Este paquete edito dos archivos compartidos de la raiz. Son los dos unicos de todo el
milestone v1.2, y revertirlos rompe el build de produccion de v1.1.**

| Archivo | Cambio |
|---|---|
| `tsconfig.json` | `"seo-tools"` agregado al arreglo `exclude` |
| `eslint.config.mjs` | `"seo-tools/**"` agregado a los patrones de `globalIgnores` |

Por que era necesario: el `tsconfig.json` de la raiz declara `include` con el patron `**/*.ts`,
que alcanza `seo-tools/src/*.ts`. Next falla el build de produccion ante cualquier error de
TypeScript del proyecto, y como las dependencias de este paquete no estan en el
`node_modules` de la raiz, el compilador reportaba modulo no encontrado. Sin la exclusion,
`next build` empieza a fallar con errores en archivos que nada tienen que ver con la
aplicacion y el deploy de Dokploy se cae **sin que se vea el motivo**.

**Si alguien revierte esas dos lineas, el deploy de produccion vuelve a romperse.** El gate
que lo detecta es este, y debe imprimir `0`:

```bash
npx tsc --noEmit --listFiles | grep -c '/seo-tools/'
```

El `package.json` de la raiz **no se toco** y no debe tocarse: no tiene campo `workspaces`,
este paquete no es un espacio de trabajo de la raiz, y agregarlo meteria las dependencias del
tooling en la imagen de produccion.

## 5. Donde vive cada artefacto

| Artefacto | Ruta | Git |
|---|---|---|
| Cache cruda de respuestas | `seo-tools/.cache/{fuente}/{hash}.json` | ignorada |
| Libro de cuota consumida | `seo-tools/.cache/_quota.json` | ignorado |
| Dependencias | `seo-tools/node_modules/` | ignoradas |
| Dataset consolidado | `seo-tools/data/` | **commiteado** |
| Volcado de encabezados del Sheet | `.planning/workstreams/seo-keywords/data/sheet-headers.json` | **commiteado** |

La cache cruda se ignora porque son miles de archivos en un repositorio compartido con el
workstream `milestone`. Lo que si se commitea es el dataset consolidado, que es la evidencia
reproducible de donde salio cada numero.

`seo-tools/.gitignore` es propio y usa patrones sin barra final a proposito: el `.gitignore`
de la raiz tiene `/node_modules` con barra inicial, que ancla el patron a la raiz y **no**
cubre esta carpeta.

Ninguna credencial entra al control de versiones. `.secrets/` esta ignorado, los parametros
que parecen claves se recortan antes de escribir cualquier archivo de cache, y los mensajes de
error reportan como maximo la longitud y el prefijo de cuatro caracteres de una clave, nunca
su valor.

## 6. Como se expande el universo de keywords (`kw:expand`)

### Las tres capas, de la mas barata a la mas cara

| Capa | Costo | Que aporta |
|---|---|---|
| Permutacion | **cero**, sin red | Cruza las semillas del snapshot con las cuatro familias de `data/modifiers.json`. Es control de cobertura: detecta los huecos entre condicion, procedimiento y sede que ninguna fuente externa devolvio. **Por si sola ya supera el umbral de 400 de KWR-01** |
| DinoRank `/keyword-research` | 1 llamada por semilla | El motor de expansion. Una sola llamada devuelve cientos de relacionadas para Peru, cada una con volumen, CPC y competencia |
| SerpApi busqueda geolocalizada | 1 busqueda por semilla | Busquedas relacionadas y "la gente tambien pregunta": lenguaje real de paciente, que ninguna fuente de metricas devuelve. Ademas la captura completa de la SERP es insumo directo de la fase 13 |

El orden importa: la deduplicacion conserva la primera aparicion, asi que el conteo por capa
dice cuanto aporto **de nuevo** cada fuente pagada sobre lo que la permutacion ya tenia.

### Cinco trampas medidas de la respuesta de DinoRank

Verificadas en vivo el 2026-08-10. Estan en el codigo y tienen prueba propia:

1. **El bloque `datos`, que corresponde a la keyword consultada, suele volver entero en cero**:
   volumen, CPC, competencia y los doce meses de historia. Un parser que lo lea de plano saca
   el universo en cero **y el fallo es silencioso, porque cero es un valor valido**.

   **Correccion del 2026-08-10, posterior:** ese "siempre" era una generalizacion de tres
   consultas. Auditadas las 70 respuestas que habia en cache, `datos` viene en cero en 60 y
   **trae el valor real en 10**: `ciatica` con 8100, `desgarro muscular` con 5400,
   `cifosis` con 3600. Descartarlo de plano tira dato bueno. La lectura correcta exige las dos
   condiciones de las trampas 4 y 5.
2. **Solo una fraccion de las relacionadas trae volumen medible.** El filtro de calidad no
   puede ser "tiene volumen" o el universo se derrumba y se pierde justo el long tail
   geolocalizado. Las keywords sin volumen se conservan marcadas `sin_datos`.
3. **La respuesta anida `data.data`.** No es un error de transcripcion.

4. **`datos.key` no siempre es la keyword consultada.** Consultar `casos de revision` devuelve
   `datos.key` igual a `tiempo actual de revision de casos nvc`, con volumen 10: la fuente
   sustituye por una sugerencia y no avisa. Leer `datos` sin comparar la clave le cuelga a una
   keyword la metrica de otra. **Se compara la clave normalizada, siempre.**

5. **La keyword consultada NO aparece dentro de su propio `keywords[]`.** Medido sobre las 70
   respuestas cacheadas: cero de 70 se incluyen a si mismas. O sea que `keywords[]` es
   descubrimiento y `datos` es consulta, y son dos cosas distintas. Buscar la propia keyword
   dentro del arreglo de relacionadas no la encuentra nunca.

Ademas, el rendimiento depende del largo de la keyword: los terminos cabecera de una a tres
palabras resuelven en un tercio de los casos y las frases de cuatro o mas palabras **devuelven
cero**. Por eso `kw:enrich` tiene la bandera `--max-words`: gastar cuota en frases largas es
gasto sin retorno medible, y esto se midio, no se supuso.

### Como leer las metricas de UNA keyword, entonces

`parseMetricasDeConsulta` es la unica lectura que no inventa ceros ni tira dato bueno:

1. Mira `data.data.datos` y lo acepta **solo si** `datos.key` normaliza igual que la keyword
   consultada **y** el registro no es degenerado. Degenerado significa volumen, CPC y
   competencia en cero **y** los doce meses de historia en cero, todo junto: cuando la fuente
   tiene el dato, la historia se mueve.
2. Si `datos` no pasa esas dos condiciones, busca la keyword dentro de `keywords[]`.
3. Si tampoco esta, la marca `sin_datos`. Que no es un dato faltante: para la fase 13 una
   keyword geolocalizada sin volumen medible es senal de oportunidad.

### Presupuesto y orden de gasto

**El tope de SerpApi es de 60 busquedas por corrida y lo hace cumplir el codigo abortando**,
no una nota en esta pagina. Es el valor de la constante `MAX_BUSQUEDAS_POR_DEFECTO`, con
prueba unitaria que lo fija. La cuenta esta en plan gratuito y lo que sobra pertenece a la
fase 13, que necesita capturar la SERP de cada cluster para COMP-03.

Si el tope corta, corta por lo que menos importa, porque el orden de gasto es determinista y
sale del rango de valor de negocio que declara `data/seeds.json`:

1. Las cuatro condiciones que v1.1 ya publica.
2. Las cuatro sedes.
3. Las especialidades nucleares del doctor y los procedimientos principales.
4. El resto de condiciones y la cola larga.

Las ocho primeras sostienen el handoff con v1.1 y la prioridad de datos de Ricardo Palma que
declara la fase 14: son las ultimas que se pueden perder. Alcanzado el tope, la corrida sale
con codigo distinto de cero, nombra las semillas que quedaron pendientes y deja el archivo de
candidatos consistente con lo ya obtenido. Lo consultado antes del corte queda en cache, asi
que subir el tope y volver a correr **solo gasta por las que faltaban**.

```bash
# Que se va a gastar, sin gastar nada
npm run cli -- kw:expand --plan-only

# La corrida normal: pregunta antes de gastar
npm run cli -- kw:expand

# Sin preguntar, con tope propio
npm run cli -- kw:expand --yes --max-searches 10

# Reproducir el universo sin una sola llamada de red
npm run cli -- kw:expand --offline
```

Banderas propias: `--seeds-file` (usar otro snapshot; el resultado se desvia a la cache para
no pisar `data/candidates.jsonl`), `--dino-seeds`, `--serp-seeds`, `--autocomplete` (apagada
por defecto, para no gastar en lo que la fase 13 necesita) y `--out`.

`data/seeds.fixture.json` tiene exactamente cinco semillas y esta commiteado a proposito: es
lo que hace reproducible la prueba del tope. Con el snapshot completo, un criterio escrito
sobre cinco semillas no se podria comprobar.

### Los dos caminos de datos, y por que dan el mismo resultado

El camino esperado es el directo: el CLI llama a la fuente por HTTP con la clave de
`.secrets/.env`. El camino de relleno existe para cuando una clave no esta disponible pero si
hay una herramienta externa que puede traer el cuerpo crudo.

```bash
# 1. El CLI calcula las claves de cache y las emite. No llama a nadie.
npm run cli -- kw:expand --plan-only
#    -> escribe .cache/pending-queries.json con clave, fuente, endpoint y parametros

# 2. Quien tenga acceso a la fuente obtiene el cuerpo crudo y lo guarda en un archivo.

# 3. Se deja en la cache con la clave que emitio el paso 1.
npm run cli -- cache:put --source serpapi --key <clave del paso 1> --file respuesta.json

# 4. La expansion resuelve esa consulta como acierto de cache.
npm run cli -- kw:expand --offline
```

**La propiedad critica es que la funcion de hash vive en un solo lugar: quien rellena nunca
calcula el nombre del archivo, se lo pregunta al CLI.** Si inventara la ruta, la cache se
desincroniza y nadie se entera hasta el reprocesamiento del mes siguiente. Hay una prueba que
afirma que una expansion alimentada por llamada directa y una alimentada por relleno producen
candidatos identicos: aguas abajo el codigo no puede distinguir el origen.

### Que hay en `data/candidates.jsonl`

Una linea por candidato, en JSON. Se eligio este formato por sobre el separado por comas
porque las keywords en espanol llevan comas y porque el diff de git queda legible sin
entrecomillado.

| Campo | Que es |
|---|---|
| `keyword` | Texto visible, con tildes. Es lo que se busca y lo que se escribe en el Sheet |
| `keywordKey` | Forma normalizada. Clave de deduplicacion y de idempotencia del upsert |
| `semilla` | Semilla de la que nacio |
| `capa` | Que capa lo encontro primero |
| `estado` | `con_datos` cuando tiene volumen medible, `sin_datos` cuando no |
| `metricas` | Volumen, CPC y competencia cuando la fuente los devolvio. Presente incluso con volumen cero: cero significa "sin volumen medible", no "sin dato" |

Dos filtros deciden que entra: el candidato tiene que contener al menos un termino del dominio
medico o de especialidad, y no puede nombrar una geografia que el negocio no atienda. El
segundo cubre las ciudades del Peru fuera de Lima y tambien Espana, Mexico y el resto de la
region, porque la fuente de expansion resuelve el long tail en espanol con un backend global.
La comparacion es **por palabra completa y no por subcadena**: `ciatica` contiene `ica` y no
es la ciudad de Ica.

## 7. Contrato real de los cuatro endpoints de DinoRank (`dino:probe`)

El proveedor lista los parametros de sus endpoints pero **no publica ni un solo ejemplo de
respuesta**, no expone OpenAPI en ninguna de las rutas habituales y describe el bloque de datos
solo como "el analisis". Por eso existe `dino:probe`: sondea, imprime un inventario de la
respuesta y graba la respuesta real en `data/fixtures/`. **Las fixtures son la unica
documentacion del contrato que existe**, y las pruebas del parser corren sobre ellas sin
necesitar la clave.

```bash
npm run cli -- dino:probe --endpoint keyword-research --country pe --max-items 25
npm run cli -- dino:probe --endpoint tfidf --country pe --url https://drangulocolumna.com/
npm run cli -- dino:probe --endpoint auditoria --country pe --project-id <id> --anonymize
npm run cli -- dino:probe --endpoint canibalizaciones --country pe --project-id <id> --anonymize
```

**Solo se sondea con `--country pe`, y el comando aborta si le piden otro.** Espana y Mexico los
resuelve el servidor de visibilidad propio del proveedor y el resto de los paises pasa por
DataForSEO: una fixture del pais equivocado produce un parser que falla en produccion.

Ninguna fixture puede contener la credencial. El comando borra las claves de aspecto credencial
y **aborta sin escribir** si el valor de la clave aparece en el cuerpo de la respuesta.

### `POST /keyword-research` — volumen, CPC y competencia

Fixture: `data/fixtures/dinorank-keyword-research-pe.json` (recortada a 25 de 899 relacionadas).

```
{ ok, data: { source, country, language, keyword,
              data: { keyword, pais, idioma, datos, keywords, id } } }
```

| Metrica de KWR-02 | Campo, tal como llega | Tipo |
|---|---|---|
| Volumen de busqueda | `data.data.keywords[].search_volume` | `number` |
| CPC | `data.data.keywords[].cpc` | `number` |
| Competencia | `data.data.keywords[].competition` | `number` |

Cada entrada de `keywords[]` trae ademas `key`, `position`, `etv`, `url`, `relative_url` e
`history`, que son doce objetos `{month: "YYYYMM", search_volume}`. `data.data.datos` tiene la
misma forma pero corresponde a la keyword consultada, y se lee con las dos condiciones de las
trampas 1, 4 y 5 de la seccion anterior.

**Este endpoint descubre, no consulta.** Es la conclusion practica de la trampa 5, y es lo que
redimensiono a `kw:enrich`: la unica forma barata de que una keyword tenga metricas es que
aparezca como relacionada de OTRA. Por eso el enriquecimiento barre la cache entera antes de
emitir una sola consulta nueva: una respuesta pagada por una keyword suele traer contestadas a
muchas otras, y sin ese barrido se paga dos veces por el mismo dato.

### `POST /tfidf` — entidades semanticas por URL (ONPAGE-03, fase 15)

Fixture: `data/fixtures/dinorank-tfidf-pe.json`.

```
{ ok, data: { keyword, country, language, url, site_id,
              analysis: { prominencia, absolutos, wdfdf, df, veces, numPalabras, global, id } } }
```

**Dos hallazgos que condicionan a ONPAGE-03:**

1. **Sin `url` el endpoint no devuelve nada util para Peru.** Con solo `keyword` y `country`,
   `analysis.absolutos` y `analysis.numPalabras` vuelven como arreglos vacios,
   `analysis.df` como `null` y `analysis.global.totalUrls` en cero.
2. **Con `url` si devuelve el analisis on-page de esa URL, pero el corpus de comparacion
   sigue vacio.** `analysis.global.totalUrls` es cero tambien en ese caso: no hay competidores
   con los que comparar, asi que **el TF-IDF comparativo no esta disponible para Peru**. Lo que
   si llega, y es aprovechable, es la extraccion de la URL propia dentro de `urlCompara`:
   `analysis.absolutos.urlCompara.encabezados` con `title` y el arbol de `h` como
   `{tipo, texto, subencabezados}`, `analysis.numPalabras.urlCompara` con el conteo de palabras,
   `analysis.veces.urlCompara.vecesKeyword` con las repeticiones por termino,
   `analysis.prominencia.urlCompara` y `analysis.global.codigo.urlCompara` con el texto plano.

`data.site_id` es el identificador interno del proyecto por defecto de la cuenta, un entero
opaco que el proveedor devuelve aunque la consulta no nombre ningun proyecto.

### `POST /auditoria` — titles, H1 y metas duplicados (ONPAGE-05, fase 15)

Fixture: `data/fixtures/dinorank-auditoria-pe.json`, **seudonimizada**.

**Requiere un proyecto dado de alta en la cuenta de DinoRank.** Con `domain` suelto y sin
`project_id` responde HTTP 500, no un error de validacion. `drangulocolumna.com` todavia no es
un proyecto de la cuenta, asi que el contrato se descubrio sondeando el unico proyecto que la
cuenta tiene cargado, que es de otro cliente. De esa respuesta se conserva **solo la forma**:
dominios, URLs, titulos e identificadores estan reemplazados por seudonimos estables, de modo
que la relacion de duplicidad, que es lo que ONPAGE-05 tiene que detectar, se preserva.

```
{ ok, data: { source, site: {id, domain, country, language}, tipo, subtipo, url, mode,
              data: { mode, titles, h1, meta, noindex, urls_lentas, http_vs_https,
                      urls_espejo, ilinks },
              summary: { urls_total, titles_duplicados, h1_duplicados, meta_duplicados,
                         noindex, urls_lentas, http, https, urls_espejo, payload_mode } } }
```

`data.data.titles.duplicados`, `.h1.duplicados` y `.meta.duplicados` son **objetos indexados por
el texto duplicado**, y su valor es el arreglo de URLs que lo repiten. `http_vs_https` reparte
las URLs en dos arreglos, `HTTP` y `HTTPS`.

**Trampa del contrato:** cada fila viene por duplicado dentro del mismo objeto, una vez con
claves posicionales `"0"`, `"1"`, `"2"` y otra con claves nombradas `id`, `url`, `title`. Es el
artefacto tipico de un `fetch_array` de PHP. Un parser que recorra la fila con
`Object.entries` procesa cada valor dos veces: **hay que leer por nombre y nunca iterar**.

### `POST /canibalizaciones` — canibalizacion sobre lo indexado (MAP-02, fase 14)

Fixture: `data/fixtures/dinorank-canibalizaciones-pe.json`, **seudonimizada**.

```
{ ok, data: { source, site: {id, domain, country, language}, include_advice,
              last_searchconsole_date, arrayKeywords, arrayCanibaliza,
              summary: { keywords, clusters, has_data } } }
```

Mismo requisito de proyecto que `/auditoria`, y uno mas: **los datos salen de Search Console**,
asi que sin la propiedad conectada al proyecto la respuesta llega con `ok: true`,
`last_searchconsole_date: null`, los dos arreglos vacios y `summary.has_data: false`. Ese
booleano es la senal correcta para distinguir "no hay canibalizacion" de "no hay datos": la
fase 14 tiene que ramificar sobre el y no sobre el largo de `arrayCanibaliza`.

**Lo que sigue sin conocerse:** la forma de las filas de `arrayKeywords` y `arrayCanibaliza`,
porque el proyecto sondeado no tiene Search Console conectado y los dos arreglos llegaron
vacios. MAP-02 tendra que volver a sondear cuando exista un proyecto con datos.

### Que hace falta para que estos dos endpoints sirvan de verdad

1. Dar de alta `drangulocolumna.com` como proyecto en el panel de DinoRank.
2. Conectarle la propiedad de Search Console y esperar a que acumule historial.
3. Volver a correr `dino:probe` sobre los dos endpoints, esta vez sin `--anonymize` y sin
   `--project-id`, para grabar las fixtures definitivas del proyecto propio.

Ninguno de los dos consume cuota, segun la doc del proveedor, asi que resondear es gratis.
