# Forma real del tab transpuesto `Competitor Analysis` — 2026-08-11

Volcado de SOLO LECTURA producido por `seo-tools/src/phase13/tab-recon.ts` (plan 13-01).
Una sola peticion, `values.get` sobre `A1:U36`. **Ninguna escritura contra el documento.**

- Documento: `1aowectbAJhyyZWhwQ6N_re-ENeSENvNN-5DebqCIls0`
- Tab: `Competitor Analysis`
- Rectangulo pedido: `A1:U36`
- Filas con contenido devueltas: 36
- Ancho maximo con contenido: 18 columnas

## 1. Etiquetas de fila, literales

El texto va entre comillas a proposito: en este documento los espacios finales son reales
y el mapeo tiene que recortar los dos lados antes de comparar.

| Fila | Etiqueta literal de la columna A | Otras columnas con contenido |
|---|---|---|
| 1 | "" | B |
| 2 | "" | B, F, J, N, R |
| 3 | "Website" | B |
| 4 | "" | B |
| 5 | "Domain Rating (DR)" | B |
| 6 | "Ahrefs Rank (AR)" | B |
| 7 | "Referring Domains" | (ninguna) |
| 8 | "Estimated Monthly Search Traffic" | (ninguna) |
| 9 | "Estimated Top 100 Keyword Rankings" | (ninguna) |
| 10 | "Do they have a blog?" | (ninguna) |
| 11 | "" | B |
| 12 | "Country 1" | B, D |
| 13 | "Country 2" | (ninguna) |
| 14 | "Country 3" | (ninguna) |
| 15 | "Country 4" | (ninguna) |
| 16 | "Country 5" | (ninguna) |
| 17 | "" | B |
| 18 | "Keyword 1" | (ninguna) |
| 19 | "Keyword 2" | (ninguna) |
| 20 | "Keyword 3" | (ninguna) |
| 21 | "Keyword 4" | (ninguna) |
| 22 | "Keyword 5" | (ninguna) |
| 23 | "" | B |
| 24 | "Number of featured snippets" | B |
| 25 | "Páginas principales+ Primary KW                                                                                                            " | B |
| 26 | "Top page 1" | (ninguna) |
| 27 | "Top page 2" | (ninguna) |
| 28 | "Top page 3" | (ninguna) |
| 29 | "Top page 4" | (ninguna) |
| 30 | "Top page 5" | (ninguna) |
| 31 | "" | B |
| 32 | "Most linked content 1" | (ninguna) |
| 33 | "Most linked content 2" | (ninguna) |
| 34 | "Most linked content 3" | (ninguna) |
| 35 | "Most linked content 4" | (ninguna) |
| 36 | "Most linked content 5" | (ninguna) |

## 2. Columnas ocupadas: un competidor por slot

La fila 2 lleva el NOMBRE de cada competidor y la fila 3 su dominio. Los slots corren a lo
ancho con paso fijo, asi que la posicion de un competidor es su indice por el paso mas el
origen. El slot de mas a la izquierda es el que hoy ocupa el residuo de plantilla.

| Columna | Indice base cero | Celdas con contenido | Primer valor |
|---|---|---|---|
| A | 0 | 29 | "Website" |
| B | 1 | 13 | "Competitor Analysis" |
| D | 3 | 1 | "20%" |
| F | 5 | 1 | "Competitor 1" |
| J | 9 | 1 | "Competitor 2" |
| N | 13 | 1 | "Competitor 3" |
| R | 17 | 1 | "Competitor 4" |

### Nombres declarados en la fila 2

| Columna | Indice base cero | Nombre del slot |
|---|---|---|
| B | 1 | "pera" |
| F | 5 | "Competitor 1" |
| J | 9 | "Competitor 2" |
| N | 13 | "Competitor 3" |
| R | 17 | "Competitor 4" |

## 2 bis. Bloques de metricas

Cada bloque se anuncia con un titulo en la columna B. El detalle importa: la columna B NO
es una columna de etiquetas, es el PRIMER SLOT de competidor, y encima de sus valores
carga tambien los titulos de seccion. Un escritor que vuelque una columna entera sobre el
slot B borraria esos titulos sin lanzar nada. Por eso el modelo declara fila por fila.

| Fila del titulo | Titulo (columna B) | Filas del bloque | Etiquetas de la columna A |
|---|---|---|---|
| 4 | "Key Stats " | 5–10 | Domain Rating (DR), Ahrefs Rank (AR), Referring Domains, Estimated Monthly Search Traffic, Estimated Top 100 Keyword Rankings, Do they have a blog? |
| 11 | "Traffic Breakdown by Country " | 12–16 | Country 1, Country 2, Country 3, Country 4, Country 5 |
| 17 | "Keywords" | 18–22 | Keyword 1, Keyword 2, Keyword 3, Keyword 4, Keyword 5 |
| 23 | "Featured Snippets " | 24–24 | Number of featured snippets |
| 25 | "Páginas principales (#10)" | 26–30 | Top page 1, Top page 2, Top page 3, Top page 4, Top page 5 |
| 31 | "Most Linked Content (#11)" | 32–36 | Most linked content 1, Most linked content 2, Most linked content 3, Most linked content 4, Most linked content 5 |

## 3. Residuo de plantilla

Celdas que llevan la marca `pera`:

- `B2` = "pera"
- `B3` = "pera.com"

## 4. Rectangulo crudo

Tal como lo devolvio la API, sin recortar ni reordenar. Es la fuente contra la que se
declararon las filas de metrica en `seo-tools/data/sheet-columns.json`.

```json
[
 [
  "",
  "Competitor Analysis ",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "",
  "pera",
  "",
  "",
  "",
  "Competitor 1",
  "",
  "",
  "",
  "Competitor 2",
  "",
  "",
  "",
  "Competitor 3",
  "",
  "",
  "",
  "Competitor 4"
 ],
 [
  "Website",
  "pera.com",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "",
  "Key Stats ",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Domain Rating (DR)",
  "20",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Ahrefs Rank (AR)",
  "13",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Referring Domains",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Estimated Monthly Search Traffic",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Estimated Top 100 Keyword Rankings",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Do they have a blog?",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "",
  "Traffic Breakdown by Country ",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Country 1",
  "United States",
  "",
  "20%",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Country 2",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Country 3",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Country 4",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Country 5",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "",
  "Keywords",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Keyword 1",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Keyword 2",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Keyword 3",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Keyword 4",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Keyword 5",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "",
  "Featured Snippets ",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Number of featured snippets",
  "6",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Páginas principales+ Primary KW                                                                                                            ",
  "Páginas principales (#10)",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Top page 1",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Top page 2",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Top page 3",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Top page 4",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Top page 5",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "",
  "Most Linked Content (#11)",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Most linked content 1",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Most linked content 2",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Most linked content 3",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Most linked content 4",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ],
 [
  "Most linked content 5",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  ""
 ]
]
```
