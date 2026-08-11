# El modelo del Sheet del cliente

Este documento existe para que la fase 13 no vuelva a descubrir desde cero lo que el
reconocimiento del 2026-08-10 ya dejó medido. Todo lo que sigue está verificado contra el
documento real, no supuesto.

**Documento:** `Dr Juan Carlos Angulo - SEO Master`
**Modelo declarativo:** [`seo-tools/data/sheet-columns.json`](../data/sheet-columns.json)
**Reconocimiento original:** `.planning/workstreams/seo-keywords/data/sheet-recon-2026-08-10.md`
**Volcado en vivo:** `.planning/workstreams/seo-keywords/data/sheet-headers.json`

El código nunca hardcodea la forma de un tab. La lee del JSON. Si el documento cambia, cambia
el JSON y no el código.

---

## Las dos formas de tab

El escritor conoce dos formas y se niega a confundirlas. No es una sutileza de diseño: escribir
con la forma equivocada corrompe el tab **sin lanzar ninguna excepción**.

### Forma A — orientada a filas

Un registro por fila. Hay una fila de encabezados, y de ahí para abajo cada fila es un
registro. La clave de idempotencia es el valor de una columna, la columna clave.

```
fila 1     [ banner decorativo ]
fila 2/3   Suggested Keyword | Cluster | URL | Search Volume | ...     <- encabezados
fila 4     hernia discal lima | ... | ...                              <- primer registro
fila 5     ...
```

Cuatro de los cinco tabs del alcance son así. El upsert lee la columna clave, arma un índice de
clave hacia número de fila, y decide fila por fila si actualiza o inserta.

### Forma B — orientada a columnas (transpuesta)

Un registro por **columna**. No hay fila de encabezados: las etiquetas de las métricas corren a
lo alto por la columna A y cada registro ocupa una columna entera.

```
        A                    B          F               J
fila 2  (vacío)              pera       Competitor 1    Competitor 2
fila 3  Website              pera.com
fila 5  Domain Rating (DR)   20
fila 6  Ahrefs Rank (AR)     13
```

`Competitor Analysis` es así. El modelo de "una fila por registro, idempotencia por clave de
fila" **no aplica**: la clave es el dominio del competidor y lo que se actualiza es una columna
entera.

**El escritor orientado a filas rechaza este tab de forma explícita**, con un mensaje que
explica la forma real y dice que el modo orientado a columnas lo implementa la fase 13. Un
error claro es preferible a un tab corrompido.

#### La forma exacta del tab transpuesto, medida el 2026-08-11

El plan 13-01 bajó el rectángulo completo `A1:U36` en solo lectura y volcó el resultado en
`.planning/workstreams/seo-keywords/data/competitor-tab-recon-2026-08-11.md`. Tres cosas
salieron distintas de lo que el reconocimiento del 2026-08-10 había dejado suponer:

**1. Hay exactamente cinco slots de competidor, y no son columnas contiguas.** Corren con paso
4 desde la columna B: `B`, `F`, `J`, `N`, `R`. La fila 2 lleva el nombre y la fila 3 el dominio.
Cinco slots es justo lo que pide COMP-01. El de más a la izquierda lo ocupa hoy el residuo de
plantilla, así que al limpiarlo quedan los cinco libres.

**2. La columna B hace doble tarea, y ahí está el peligro.** No es una columna de etiquetas:
es el **primer slot de competidor** y, encima de sus valores, carga también los títulos de
sección en las filas 1, 4, 11, 17, 23, 25 y 31. Un escritor que vuelque una columna entera
sobre el slot B borraría esos títulos **sin lanzar ninguna excepción**. Por eso el modelo
declara `row` métrica por métrica y el escritor de 13-03 toca esas filas y ninguna otra.

**3. La etiqueta de la fila 25 tiene 108 espacios finales.** Mide 139 caracteres y 31 después
de recortar. Comparar sin `trim()` no la encuentra jamás.

Los seis bloques de métricas, derivados de los títulos de la columna B:

| Fila del título | Título | Filas | Qué contiene |
|---|---|---|---|
| 4 | `Key Stats ` | 5–10 | DR, AR, referring domains, tráfico, rankings, blog |
| 11 | `Traffic Breakdown by Country ` | 12–16 | `Country 1` a `Country 5` |
| 17 | `Keywords` | 18–22 | `Keyword 1` a `Keyword 5` |
| 23 | `Featured Snippets ` | 24 | `Number of featured snippets` |
| 25 | `Páginas principales (#10)` | 26–30 | `Top page 1` a `Top page 5` |
| 31 | `Most Linked Content (#11)` | 32–36 | `Most linked content 1` a `5` |

Dentro del bloque de 4 columnas de cada slot, el desplazamiento `+2` lleva un porcentaje, y
solo en el bloque de países: medido `B12 = "United States"` con `D12 = "20%"`.

El residuo de plantilla vive en `B2` (`pera`), `B3` (`pera.com`), `B5` (DR 20), `B6` (AR 13),
`B12` (`United States`), `D12` (`20%`) y `B24` (`6`).

---

## Inventario real de los cinco tabs del alcance

El documento tiene **11 tabs**, no 5. Los otros seis existen y no se tocan. Cualquier criterio
que exija "exactamente cinco tabs" falla contra el documento real.

| Tab | `sheetId` | Fila de encabezados | Columnas | Forma | Columna clave | Lo escribe |
|---|---|---|---|---|---|---|
| `Keyword Research` | `407303476` | **3** | 18 | filas | `Suggested Keyword` | fase 12 |
| `Content Model` | `814545527` | **3** | 19 | filas | `URL` | fase 14 |
| `Canonical Audit` | `1259097992` | **2** | 6 | filas | `URL` | fase 14 |
| `Internal Linking Audit` | `1398984258` | **2** | 31 | filas | `URL` | fase 14 |
| `Competitor Analysis` | `333897514` | **ninguna** | — | columnas | dominio | fase 13 |

El `sheetId` numérico no se deriva del nombre del tab y es **obligatorio** para borrar filas o
columnas: `deleteDimension` lo pide. Se obtiene de `spreadsheets.get`.

---

## Cuatro trampas del documento, y cómo las evita el modelo

### 1. La fila 1 es un banner, no los encabezados

La fila 1 de **cada** tab es una banda decorativa con el nombre del tab en la columna B. Los
encabezados reales están en la fila 2 o en la 3 según el tab.

Un lector que asuma "encabezados en la fila 1" no encuentra ni una sola columna en ningún tab.
Por eso la fila de encabezados es un dato por tab que sale del JSON, nunca una constante, y por
eso no hay ni un rango `!1:1` en el código.

Consecuencia aritmética que se paga en el borrado de filas: en `Keyword Research` la primera
fila de datos es la **4** del documento, que en índice base cero es **3**.

### 2. Cinco encabezados llevan espacio final

En `Keyword Research`:

```
"Search Intent "          "Referring Domains Needed "   "Internal Approval "
"Client Approval "        "Lead or Conversion Potential "
```

Y en `Internal Linking Audit`, `"Anchor 8 "` lo lleva y los otros siete anchors no.

La comparación **recorta los dos extremos** antes de comparar. Recorta y nada más: no baja a
minúsculas ni quita tildes, porque un encabezado parecido que pase por el que no es escribe
datos en la columna equivocada. La plantilla manda sobre el nombre exacto.

Los valores del JSON son **literales, con sus espacios**. El recorte es de la comparación, no
del modelo: el documento del cliente no se reescribe para que el código quede cómodo.

### 3. `Internal Linking Audit` repite un encabezado ocho veces

Son ocho bloques de tres columnas, `Link N` / `Anchor N` / `Title with Link`, y el tercero de
cada bloque se llama igual en los ocho. Mapear por nombre haría que los ocho bloques resuelvan
a la misma columna, otra vez sin excepción.

Ese tab se declara con `"mapBy": "posicion"`. El modelo detecta encabezados repetidos y, si el
tab pretende mapear por nombre, **falla** diciendo cuál se repite y que hay que mapear por
posición.

### 4. El tab de canonicals se llama `Canonical Audit`

`REQUIREMENTS.md` y `ROADMAP.md` dicen `Canonicalization Audit`. Ese texto sí existe, pero como
banner **dentro** de la fila 1. Pedirlo a la API devuelve **HTTP 400**.

---

## Cómo se declara un tab

```jsonc
"Keyword Research": {
  "sheetTitle": "Keyword Research",   // nombre real, nunca el banner
  "sheetId": 407303476,               // necesario para borrar filas o columnas
  "headerRow": 3,                     // base 1; null si el tab no tiene encabezados
  "orientation": "filas",             // "filas" | "columnas"
  "mapBy": "nombre",                  // "posicion" si repite encabezados
  "keyField": "keyword",              // campo del dataset que da la clave
  "keyHeader": "Suggested Keyword",   // columna de donde se lee la clave
  "columns": [ … ]                    // en el orden real del documento
}
```

Cada columna lleva `header` literal, el `field` del dataset que la llena (o `null`) y un
`status`:

| `status` | Significa |
|---|---|
| `fase-12` | La fase 12 escribe esta columna |
| `no-consultado` | Se escribe el valor literal `no_consultado`: su fuente quedó diferida |
| `fase-13` / `fase-14` / `fase-15` | La escribe esa fase, la 12 no la toca |
| `nueva` | No existe en el documento y se agrega a la derecha |
| `eliminar` | Columna muerta de la plantilla, sujeta al escaneo de referencias |
| `sin-uso` | Existe y ninguna fase del milestone la escribe. Queda intacta |

Solo `fase-12`, `no-consultado` y `nueva` son **requeridas**: si faltan, la operación se
detiene. Las demás son declarativas y su ausencia no es error. `eliminar` **nunca** se agrega,
porque después del borrado volver a crearlas desharía justo lo autorizado.

---

## Qué pasa cuando la forma real no calza

Sin la bandera de extensión, la operación **se detiene** e imprime cuatro listas: esperadas,
reales, faltantes y sobrantes. Con la bandera activa, lo que falta se calcula **a la derecha
del último encabezado ocupado**, en el orden declarado, y se imprime antes de escribir.

"Último ocupado" no es el largo del arreglo: una fila de encabezados puede traer celdas vacías
al final y escribir ahí dejaría huecos.

La extensión **nunca** renombra, reordena ni borra un encabezado existente. Es la regla del
formato de columnas: se agrega a la derecha y nada más.

La letra de columna se calcula con una función propia porque el paso de una a dos letras
importa: índice base cero 25 es `Z`, 26 es `AA` y 27 es `AB`. La concatenación ingenua escribe
datos correctos en la columna equivocada.

---

## El escaneo de referencias

Es la precondición que Juan puso para autorizar el borrado de las columnas muertas de la
plantilla SaaS. **Es de solo lectura** y es lo único que decide si el borrado puede ejecutarse.

Qué hace:

1. Lee **todos** los tabs pidiendo `valueRenderOption: "FORMULA"`, o sea la fórmula escrita en
   vez de su resultado. Un `valueRenderOption` por defecto devuelve el número calculado y no
   dice nada de qué columna alimenta qué.
2. Lee las reglas de formato condicional del documento entero.
3. Busca menciones a la columna candidata de dos formas:
   - **cruzada**, con el nombre del tab por delante (`'Keyword Research'!G4`), que vale desde
     cualquier tab;
   - **local**, por letra sola (`$K4`, `K:K`), que solo vale dentro del propio tab.

La búsqueda local excluye lo precedido por letra o dígito, para no confundir `AB4` con `B4`, y
lo precedido por `!`, para no contar una referencia a otro tab como si fuera propia.

Qué devuelve, por columna candidata:

- `references` — menciones que **bloquean** el borrado. Lista vacía significa segura de
  eliminar.
- `notes` — menciones informativas que no bloquean. El caso típico es una regla de formato
  condicional cuyo rango abarca media tabla: al eliminar una columna, ese rango se reajusta
  solo. Lo que sí bloquea es una regla cuyo rango sea **exactamente** esa columna, porque el
  borrado la deja huérfana.

**Cualquier mención bloqueante aborta el borrado sin eliminar nada, y no hay bandera de fuerza
que permita saltarlo.**

### Resultado del escaneo, corrido en vivo el 2026-08-10

| Tab | Columna | Letra | Referencias bloqueantes | Veredicto |
|---|---|---|---|---|
| `Keyword Research` | `CVR` | `G` | ninguna | segura de eliminar |
| `Keyword Research` | `"Lead or Conversion Potential "` | `K` | ninguna | segura de eliminar |
| `Content Model` | `Free Trial CVR` | `N` | ninguna | segura de eliminar |
| `Content Model` | `Free Trial Potential` | `O` | ninguna | segura de eliminar |

Contexto que explica por qué salió limpio: el documento entero tiene **15 fórmulas y cero
reglas de formato condicional**. Las 15 están en `Tech Audit`, columna `F`, y son todas la
misma cuenta local del ICE Score (`=(C3+D3+E3)/3`). Ninguna cruza hacia otro tab.

El escaneo se vuelve a correr en el momento del borrado y no se da por hecho este resultado:
entre hoy y entonces alguien puede agregar una fórmula.

---

## Las tres columnas nuevas de `Keyword Research`

Se agregan a la derecha de `Notes`, en este orden, sin renombrar ni reordenar nada:

| Encabezado | Campo del dataset | Ruta en el registro | Origen |
|---|---|---|---|
| `CPC` | `cpc` | `metricas.cpc` | J-2 |
| `Competition` | `competition` | `metricas.competition` | J-2 |
| `Patient Stage` | `stage` | `stage` | **J-5** |

`Competition` es el índice de competencia **comercial** entre 0 y 1, no dificultad orgánica.

`Patient Stage` lleva encabezado en inglés como el resto de la plantilla y **valores en
español** (`sintoma`, `diagnostico`, `decision`) para que el doctor los lea. El vocabulario lo
produce `kw:classify`; el escritor solo transcribe lo que trae el dataset.

La ruta al dataset sale del campo `source` del modelo, no del código. Si el dataset cambia de
forma, se corrige este JSON y nada más.

---

## Las dos columnas que habilitó la fase 13

| Encabezado | Columna real | Campo | Estado | Antes |
|---|---|---|---|---|
| `Cluster` | B | `cluster` | `fase-13` | declarada y vacía |
| `Top Result` | M | `topResult` | `fase-13` | **`fase-15`** |

`Top Result` se reasignó de la fase 15 a la 13, y el motivo es que es **dato de SERP**: es el
resultado que Google pone primero, y la SERP la captura esta fase. Dejarla en la 15 habría
obligado a volver a leer la misma captura dos fases después, con una cuota de SerpApi que no
se repone hasta el 21 de agosto.

**`URL` sigue en la fase 14 y `Suggested H1` en la 15. Ninguna de las dos se movió.** Eso no es
una nota de estilo: el escritor coalesce índices contiguos en rangos, así que una columna ajena
que quedara en medio de dos propias se sobreescribiría sin lanzar nada. En el documento real
`URL` es la columna C, entre `Cluster` (B) y `Search Volume` (D), y `Suggested H1` es la L,
entre `Referring Domains Needed ` (K) y `Top Result` (M). Las dos están **exactamente** en el
lugar donde un filtro mal ampliado las pisaría, y por eso hay pruebas nombradas que afirman que
ningún rango escrito las alcanza.

Con esto, `REQUIRED_STATUSES` incorpora `fase-13`: si alguien renombra `Cluster` o `Top Result`
en el documento del cliente, la carga falla ruidosa en vez de saltarse la columna en silencio y
reportar filas actualizadas que nunca llegaron a ninguna celda.

---

## Lo que deliberadamente no está en el Sheet

**No hay columnas de procedencia.** Es la decisión J-3, y sigue vigente. La procedencia por
métrica vive en el dataset del repositorio, `seo-tools/data/keywords.jsonl`. Deroga la decisión
del CONTEXT que pedía una columna sufijo por métrica.

> La clasificación del paciente llegó a estar en esta lista. Juan la sacó en el checkpoint del
> plan 12-02 (**J-5**): es un dato de negocio, no de trazabilidad, así que tiene columna propia
> y no contradice a J-3.

Y de J-1: las tres columnas de `Content Model` que nombran una herramienta que el milestone no
consulta **quedan vacías**. No se escriben, no se renombran y no se borran. Escribir ahí un dato
de otra procedencia sería entregarle al cliente información falsa sobre su origen, en su propio
documento.
