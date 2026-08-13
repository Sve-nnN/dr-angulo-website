# Paquete on-page: /blog

<!-- Generado por seo-tools/src/phase15/paquete.ts desde data/onpage.json y data/url-map.jsonl.
     No se edita a mano: se regenera. -->

## Qué hay que hacer con esta URL

| Campo | Valor |
| --- | --- |
| URL | `/blog` |
| Acción | dejar |
| Formato | documento corto |
| Keyword primaria | sin primaria, y es una decisión medida de la fase 14 |
| Redirige a | no aplica |

<!-- copy:inicio -->

Esta URL se queda publicada y de ella solo cambian el title y la meta description, que están en la tabla de abajo.

El H1 no se toca. El que ya está en el sitio se transcribió acá para que se vea cuál es y no haya que ir a buscarlo.

<!-- copy:fin -->

## Title, meta y H1

| Campo | Texto | Caracteres |
| --- | --- | --- |
| Title | Blog del Dr. Juan Carlos Angulo | 31 / 60 |
| Meta description | Artículos sobre dolor de espalda, salud de la columna y qué esperar de una consulta, escritos por el Dr. Juan Carlos Angulo. | 124 / 155 |
| H1 | Artículos sobre columna y traumatología | publicado |

Por qué ese H1: Transcrito del sitio publicado, sin cambiarlo: la URL declaro no competir en la fase 14 y proponerle un H1 nuevo reabriria esa decision sin dato nuevo. src/app/blog/page.tsx:27

## Con qué anchor se enlaza a esta URL

Con anchor de **navegación**, nunca de keyword. La fase 14 midió que estas URLs no pelean
ningún término, y en varios casos porque si lo pelearan le quitarían la SERP a la home.
Enlazarlas desde el código con un anchor de keyword desharía esa decisión sin que ninguna
revisión lo note.

| Anchor | Regla | Desde |
| --- | --- | --- |
| Blog | raiz-de-navegacion | `/` |
| Blog | navegacion-de-seccion | `/blog/5-sintomas-de-columna-que-no-debes-ignorar`, `/blog/artrosis`, `/blog/lumbalgia`, `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber`, `/preguntas-frecuentes`, `/servicios` |

## Por qué esta URL no compite

Escrito en la fase 14 y transcrito acá sin tocarlo. No es una omisión: es una decisión
medida, y quien implemente esta URL merece leer el motivo sin abrir otro archivo (D-14).

Es el indice del silo informativo y no tiene contenido propio: darle una keyword lo pondria a competir contra los mismos articulos que lista, que es la forma mas facil de canibalizar un blog. La unica cabeza generica que le calzaria, `traumatologia`, comparte 3 URLs del top 10 con `traumatologia lima` de la home y esta en el umbral de fusion. Nodo de navegacion, con la misma logica con la que Juan resolvio `/sedes`.
