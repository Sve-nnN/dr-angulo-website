# Reconocimiento del Sheet del cliente — 2026-08-10

Levantado en vivo antes de ejecutar la fase 12, con la service account
`juan-tech@juan-tech.iam.gserviceaccount.com` y scope de solo lectura. No se escribió nada.

**Documento:** `Dr Juan Carlos Angulo - SEO Master`
**ID:** `1aowectbAJhyyZWhwQ6N_re-ENeSENvNN-5DebqCIls0`

## 1. El acceso funciona

La service account autentica y lee el documento. **INFRA-01 deja de ser un riesgo abierto** en
su mitad de lectura. Falta confirmar permiso de escritura, que se prueba con el round trip de
la tarea 1 del plan `12-01`.

## 2. Hay 11 tabs, no 5

```
Index                  (970 x 26)     SEO Plan               (17 x 20)
Keyword Research       (981 x 30)     Content Strategy       (1000 x 28)
Content Production     (950 x 17)     Content Model          (870 x 28)
Competitor Analysis    (36 x 21)      Tech Audit             (956 x 26)
Tech Audit Tasks       (1000 x 26)    Canonical Audit        (947 x 24)
Internal Linking Audit (759 x 37)
```

Cualquier criterio de aceptación que exija "exactamente cinco tabs" falla contra el documento
real. La verificación correcta es que los cinco tabs en alcance existan y tengan encabezados,
sin decir nada del total.

## 3. Un nombre de tab está mal en REQUIREMENTS.md

| Documentado | Real |
|---|---|
| `Canonicalization Audit` | **`Canonical Audit`** |

El texto `Canonicalization Audit` sí aparece, pero como banner **dentro** de la fila 1 del tab,
no como nombre del tab. Una llamada a la API con el nombre documentado devuelve 400.

Los otros cuatro coinciden: `Keyword Research`, `Content Model`, `Competitor Analysis`,
`Internal Linking Audit`.

## 4. La fila de encabezados no es la fila 1, y no es la misma en todos los tabs

La fila 1 de cada tab es un banner decorativo con el nombre del tab en la columna B. Los
encabezados reales están más abajo, y a distinta altura según el tab.

| Tab | Fila de encabezados | Columnas con nombre |
|---|---|---|
| `Keyword Research` | **3** | 18 |
| `Content Model` | **3** | 19 |
| `Competitor Analysis` | **ninguna, ver §6** | — |
| `Canonical Audit` | **2** | 6 |
| `Internal Linking Audit` | **2** | 31 |

Un escritor que asuma "encabezados en la fila 1" no encuentra ninguna columna en ningún tab.
La fila de encabezados tiene que ser un dato por tab, detectado o configurado, nunca constante.

## 5. Encabezados reales

### `Keyword Research` — fila 3

```
Suggested Keyword | Cluster | URL | Search Volume | Traffic Potential | Search Intent  |
CVR | Highest Achievable Position | CTR | Real Traffic Potential |
Lead or Conversion Potential  | Keyword Difficulty | Referring Domains Needed  |
Suggested H1 | Top Result | Internal Approval  | Client Approval  | Notes
```

Ojo con los espacios finales: `"Search Intent "`, `"Referring Domains Needed "`,
`"Internal Approval "`, `"Client Approval "`, `"Lead or Conversion Potential "` y el propio
banner `" Keyword Research "` los llevan. El mapeo de columnas tiene que normalizar con
`trim()` o no encuentra nada.

**Qué puede llenar la fase 12:** `Suggested Keyword`, `Search Volume` (de DinoRank),
`Search Intent`.
**Qué queda en `no_consultado`:** `Traffic Potential`, `Keyword Difficulty`,
`Referring Domains Needed`. Las tres son métricas de Ahrefs, diferido.
**Qué es de fases posteriores:** `Cluster` (13), `URL` (14), `Suggested H1` y `Top Result` (15).
**Qué no tiene columna:** **CPC y competencia**, que son justamente dos de los tres datos que
DinoRank sí devuelve. Y no hay ninguna columna de fuente.

### `Content Model` — fila 3

```
URL | SEO Page? | Keyword | Intent | Type | New/Existing | Cluster |
Organic Clicks (GSC) | Organic Impressions (GSC) | Volume (Ahrefs) |
Traffic Potential (Ahrefs) | KD Difficulty (Ahrefs) | Position | Free Trial CVR |
Free Trial Potential | Action | Notes/Ideas | Leave, Update, or Bin? |
Client's Feedback/Notes
```

**Tensión real:** tres columnas dicen `(Ahrefs)` en el nombre. El volumen de la fase 12 sale
de DinoRank. Escribir volumen de DinoRank bajo `Volume (Ahrefs)` es entregarle al cliente un
dato mal etiquetado en su propio documento. Ver §8.

`Free Trial CVR` y `Free Trial Potential` son de la plantilla original SaaS y no aplican a un
consultorio médico.

### `Canonical Audit` — fila 2

```
URL | Keyword | Topic | Canonical | Approved? | Implemented?
```

Calza exacto con SHEET-04. Sin sorpresas.

### `Internal Linking Audit` — fila 2

```
URL | Title | Code | Action | Cluster |
Link 1 | Anchor 1 | Title with Link | ... hasta Link 8 | Anchor 8  | Title with Link |
Done | Notas
```

Ocho bloques de tres columnas. Calza con SHEET-05, que pide hasta ocho enlaces salientes con
su anchor. `Title with Link` se repite ocho veces como nombre, así que el mapeo por nombre es
ambiguo: hay que mapear por posición dentro de cada bloque, no por nombre.

## 6. `Competitor Analysis` está transpuesto

No tiene fila de encabezados. Los competidores van **a lo ancho** y las métricas **a lo alto**:

```
fila 2:  (vacío) | pera |  |  |  | Competitor 1 |  |  |  | Competitor 2 |  |  |  | Competitor 3 |  |  |  | Competitor 4
fila 3:  Website | pera.com
fila 4:  (vacío) | Key Stats
fila 5:  Domain Rating (DR) | 20
fila 6:  Ahrefs Rank (AR)   | 13
```

**Consecuencia de arquitectura:** el modelo "una fila por registro, idempotencia por clave de
fila" no aplica a este tab. El escritor necesita un segundo modo, orientado a columnas, donde
la clave de idempotencia es el dominio del competidor y lo que se actualiza es una columna
entera. Es un requisito de la fase 13 (SHEET-03), pero el escritor de la fase 12 tiene que
nacer sabiendo que existen dos formas, o se reescribe entero después.

**Segunda consecuencia:** `Domain Rating (DR)` y `Ahrefs Rank (AR)` son métricas propietarias
de Ahrefs. COMP-01 pide DR y referring domains de cinco competidores. Con Ahrefs diferido,
la fase 13 arrastra el mismo problema que KWR-05. Se decide al discutir esa fase.

## 7. Datos residuales de la plantilla

Confirmado que hay ruido, y Juan ya autorizó eliminarlo el 2026-08-10.

| Tab | Residuo |
|---|---|
| `Competitor Analysis` | `pera` / `pera.com` / DR 20 / AR 13 — competidor de ejemplo |
| `Keyword Research` | fila 5 con `Low` suelto en Search Intent; fila 6 con `" y la URL"` en la columna URL |
| `Content Model` | filas con `FALSE` en `SEO Page?` y nada más |
| `Internal Linking Audit` | filas con `Add links` en Action y `200` en Code |
| `Canonical Audit` | filas con `FALSE` en Approved? e Implemented? |

Ninguno es dato de otro cliente real: es relleno de plantilla, coherente con lo que dijo Juan.

## 8. Lo que necesita decisión de Juan

Va al checkpoint del plan `12-02`, ahora con los datos reales sobre la mesa en vez de a ciegas.

1. **`Volume (Ahrefs)` en `Content Model`.** El dato va a ser de DinoRank. ¿Se renombra la
   columna a `Volume (DinoRank)`, se deja el nombre y se aclara la fuente en otra columna, o
   se deja la columna vacía?
2. **Falta `CPC` y `Competition` en `Keyword Research`.** DinoRank las devuelve y KWR-02 las
   pide. ¿Se agregan dos columnas a la derecha, o se descartan esos dos datos?
3. **Columnas de fuente.** La decisión bloqueada del CONTEXT pide fuente por métrica con
   columna sufijo. Ninguna existe. Serían tres o cuatro columnas nuevas a la derecha de
   `Keyword Research`. ¿Se agregan, o alcanza con documentar la fuente fuera del Sheet?
4. **Columnas muertas de la plantilla SaaS** (`Free Trial CVR`, `Free Trial Potential`, `CVR`,
   `Lead or Conversion Potential`). ¿Se eliminan, o se dejan vacías?

---
*Levantado con un script descartable fuera del repositorio. La versión repetible de esto es el
subcomando `sheet:inspect` que entrega la tarea 1 del plan `12-01`.*
