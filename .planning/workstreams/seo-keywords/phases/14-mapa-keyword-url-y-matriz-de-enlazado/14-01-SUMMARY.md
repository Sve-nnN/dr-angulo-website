---
phase: 14-mapa-keyword-url-y-matriz-de-enlazado
workstream: seo-keywords
plan: 01
subsystem: seo-tools
tags: [mapa-keyword-url, inventario, serp, tipo-de-pagina, solape, content-model]
requires:
  - "seo-tools/.cache/serpapi (96 capturas de la fase 12 y 13)"
  - "seo-tools/data/clusters.json, serp-candidates.json, golden-10.json (fase 13)"
  - "seo-tools/src/sheets/upsert.ts (fase 12)"
  - "seo-tools/src/phase13/{args,cluster,serp,pagetype}.ts"
provides:
  - "seo-tools/data/url-inventory.json — las 22 URLs medidas del codigo, con procedencia"
  - "seo-tools/data/page-type-map.json — tipo de pagina exigido por la SERP para 91 cabezas"
  - "seo-tools/src/phase14/model.ts — el tipo AsignacionDeUrl que usan los cuatro planes"
  - "seo-tools/src/phase14/overlap.ts — veredicto de fusion par a par (guardarrail de D-05)"
  - "seo-tools/src/phase14/cm-push.ts — cargador idempotente del tab Content Model"
  - "seo-tools/data/url-map.jsonl — la primera asignacion, la sede Ricardo Palma"
affects:
  - "14-02: recibe el inventario, el tipo de pagina y el checkpoint de decisiones"
  - "14-03: llama a overlap.ts antes de fusionar cualquier par de URLs"
tech-stack:
  added: []
  patterns:
    - "Punto de entrada propio bajo src/phase14/, invocado con tsx. src/cli.ts sigue cerrado."
    - "Generadores en modo offline: una captura ausente es error duro, jamas una busqueda nueva."
    - "Salida sin marcas de tiempo, para que el SHA-256 de dos corridas signifique algo."
key-files:
  created:
    - seo-tools/src/phase14/model.ts
    - seo-tools/src/phase14/inventory.ts
    - seo-tools/src/phase14/inventory.test.ts
    - seo-tools/src/phase14/overlap.ts
    - seo-tools/src/phase14/overlap.test.ts
    - seo-tools/src/phase14/pagetype-map.ts
    - seo-tools/src/phase14/pagetype-map.test.ts
    - seo-tools/src/phase14/cm-push.ts
    - seo-tools/src/phase14/cm-push.test.ts
    - seo-tools/data/url-inventory.json
    - seo-tools/data/page-type-map.json
    - seo-tools/data/url-map.jsonl
  modified: []
decisions:
  - "El inventario reporta 22 URLs y 21 mapeables, no las 19 y 18 del roadmap. La diferencia se registra nominalmente en vez de ajustarse."
  - "El tracer no escribe en el Sheet del cliente: las dos corridas van en ensayo y la idempotencia queda probada contra un documento falso."
  - "La pertenencia a un cluster no es parametro de veredictoDeFusion. No hay por donde colarla."
metrics:
  duration: ~50 min
  completed: 2026-08-11
  tests_before: 418
  tests_after: 450
  serpapi_calls: 96
status: complete
---

# Phase 14 Plan 01: Inventario, tipo de pagina y tuberia al Content Model — Summary

Se midio la realidad antes de opinar sobre ella: el sitio tiene 22 URLs leidas del codigo (no
las 19 que el roadmap suponia), las 91 cabezas con SERP medida ya declaran que formato exige
Google, y el veredicto de fusion par a par existe con su evidencia adjunta. Coste de SerpApi:
cero busquedas.

## Que se completo

### Task 1 — Tuberia de una URL real al Content Model (commit `04eab21`)

`model.ts` define `AsignacionDeUrl`, el unico tipo que los cuatro planes de la fase comparten.
`inventory.ts` quedo operativo para la sede. `cm-push.ts` carga `url-map.jsonl` en el tab
`Content Model` con `omitirCamposAusentes` activo y `addMissingColumns` en falso.

La asignacion emitida no es relleno, es la entrega de la fase:

| Campo | Valor |
|---|---|
| URL | `/sedes/clinica-ricardo-palma` |
| Keyword primaria | `cirujano de columna clínica ricardo palma` |
| Secundarias | `traumatólogo clínica ricardo palma`, `ortopedia infantil clínica ricardo palma`, `traumatólogo especialista en columna clínica ricardo palma` |
| Tipo declarado | `pagina-de-sede` |
| Tipo exigido por la SERP | `pagina-de-servicio` (confianza alta) |
| Accion | `reescribir` |

### Task 2 — Inventario medido y reconciliacion (commits `fce5106` RED, `c01a19a` GREEN)

22 URLs, 21 mapeables. Reparto: 1 home, 3 hub, 4 servicio, 4 sede, 4 blog, 3 institucional,
2 conversion, 1 legal. `/privacidad` entra con `mapeable: false` y motivo escrito. Montefiori no
aparece. Cada URL lleva `origen` con archivo y linea.

### Task 3 — Solape par a par y tipo de pagina (commits `e662cfa` RED, `c35ef07` GREEN)

`overlap.ts` decide fusiones contando URLs compartidas del top 10 contra un umbral de 3. La
pertenencia a un cluster no es parametro de la funcion, y hay dos pruebas que lo defienden: una
por firma (`veredictoDeFusion.length === 3`) y otra contra el caso real del trio.

`pagetype-map.ts` tipifico las 91 cabezas leyendo `.cache/serpapi/` en modo offline. Cero
cabezas sin captura.

| Tipo dominante | Cabezas |
|---|---|
| pagina-de-servicio | 32 |
| contenido-internacional | 21 |
| directorio | 12 |
| otro | 11 |
| red-social | 6 |
| guia | 5 |
| ficha-de-clinica | 4 |

Confianza: 73 alta, 14 media, 4 baja.

## Criterios de aceptacion, con la salida real

| Criterio | Salida | Estado |
|---|---|---|
| `url-map.jsonl` con 1 linea, URL de Ricardo Palma, 3-5 secundarias | `1` | OK |
| `omitirCamposAusentes` presente en `cm-push.ts` | `3` ocurrencias | OK |
| Ninguna columna `sin-uso` como destino de escritura | `0` | OK |
| Inventario con procedencia, `/privacidad` no mapeable, bloque `reconciliacion` | `1` | OK |
| Ninguna URL de Montefiori | `0` | OK |
| Determinismo de `url-inventory.json` | mismo SHA-256 en dos corridas | OK |
| `page-type-map.json` con >=91 cabezas, todas con tipo y reparto | `1` (91 cabezas) | OK |
| Determinismo de `page-type-map.json` | `b1f0e12dd23db232e7f3f892b46df4d46e48fe9accf62dca343d2fbfa4dcc42d` en las dos corridas | OK |
| El cluster no es entrada del calculo de fusion (borrando literales y comentarios) | `0` | OK |
| Cuota de SerpApi | `96` | OK |
| SHA-256 de `keywords.jsonl` | `c59dad2d…bcd7eac`, sin cambio | OK |
| `npm test` | 450 pruebas, 450 en verde, 0 rojas | OK |
| `npm run typecheck` | sin salida | OK |
| `seo-tools` fuera del `tsconfig.json` raiz | `0` archivos | OK |
| La app raiz compila | estado `0` | OK |
| `git diff --cached` sin rutas de `src/` ni de `milestone` | `0` y `0` | OK |
| Ensayo del tracer, dos corridas identicas | ver desviacion D-1 | Parcial |

## Desviaciones del plan

### D-1 — El criterio numerico del tracer es inalcanzable por diseño, y no se forzo

**Encontrado en:** verificacion de la tarea 1.

El criterio corregido pide dos cosas que se excluyen entre si: que el tracer **no escriba** en el
documento del cliente, y que las dos corridas en ensayo reporten `actualizadas: 1`. Una fila que
nunca se escribio no esta en el Sheet, asi que el ensayo la reporta como insercion. Las dos
corridas dieron, identicas:

```
actualizadas: 0
insertadas: 1
columnasAgregadas: 0
llamadas de red: 3
```

**Que se hizo:** respetar la restriccion fuerte (no tocar el documento del cliente) y no la
aritmetica. Escribir con `--yes` para que el segundo ensayo dijera `actualizadas: 1` volveria
falso el `must_haves` del plan `14-02`, que promete que Juan aprueba el mapa antes de que nada
llegue a su documento.

**Que queda igual de probado:** `columnasAgregadas: 0` se cumple literal; las dos corridas son
identicas, que es la evidencia de determinismo; y la idempotencia real esta cubierta por dos
pruebas contra un documento falso, `cargar dos veces actualiza la fila en lugar de duplicarla` y
`una segunda carga con otro contenido pisa la misma fila y no agrega una nueva`.

**Consecuencia:** el `<done>` de la tarea 1 —"la fila existe en el tab del documento del
cliente"— y la ultima linea del bloque `<verification>` quedan **transferidos al plan 14-02**,
donde ocurre la primera escritura real, despues del checkpoint.

### D-2 — El inventario mide 22 URLs, no 19

No es un error a corregir, es la medicion. La lista nominal esta abajo, en las decisiones para
el checkpoint.

## Decisiones que el checkpoint del plan 14-02 tiene que poner delante de Juan

Van en orden de consecuencia.

### 1. El slug publicado es `/servicios/escoliosis`, no `/servicios/escoliosis-y-deformidades`

`escoliosis` es la keyword numero uno de las 10 de Oro: 18.000 de volumen, KD 12, potencial de
trafico 3.400. El entregable de la fase 13 escribio como destino
`/servicios/escoliosis-y-deformidades`; lo que v1.1 publico el 2026-08-10 es
`/servicios/escoliosis`.

**El mapa se emite contra el slug que existe.** La alternativa —renombrar en v1.1— arrastra
redirecciones 301, actualizacion del sitemap y de los enlaces internos ya escritos, y es
decision de Juan, no del ejecutor. Las dos opciones:

- **Dejar `/servicios/escoliosis`.** Costo cero, el slug es mas corto y mas limpio, y coincide
  exacto con la keyword. Recomendada.
- **Renombrar a `/servicios/escoliosis-y-deformidades`.** Solo si Juan quiere que la URL cubra
  tambien cifosis y otras deformidades como un unico paraguas. Exige redireccion y toca v1.1.

### 2. `/sedes` existe y ningun documento de planificacion lo contemplaba

Es un hub vivo. Necesita keyword primaria como cualquier otra URL viva (D-02), y compite de
frente con las cuatro paginas de sede individuales: es exactamente el caso de
autocanibalizacion que MAP-02 existe para atrapar. Hay que decidir si el hub pelea por un
termino generico de ubicacion y las cuatro sedes por el nombre de clinica, o si el hub queda
como pagina de navegacion sin objetivo propio.

### 3. Tres de las cuatro paginas de servicio publicadas enfrentan una SERP de otro formato

Este es el hallazgo del `page-type-map.json` y no estaba en ningun plan:

| Cabeza | Formato dominante del top 10 | Reparto | Confianza |
|---|---|---|---|
| `escoliosis` | contenido-internacional | 5 internacional, 1 red social, 1 guia | alta |
| `hernia discal` | contenido-internacional | 6 internacional, 1 pagina de servicio | alta |
| `estenosis espinal` | contenido-internacional | 8 de 8 internacional | alta |
| `ortopedia infantil lima` | pagina-de-servicio | 5 servicio, 2 red social, 1 directorio, 1 otro | alta |

Google le esta respondiendo a `estenosis espinal` con ocho de ocho resultados de contenido
internacional. Una pagina de servicio local compite ahi en el formato equivocado. La decision no
es borrar las paginas: es si la fase 15 las reescribe con cuerpo informativo largo, o si el
objetivo transaccional se mueve a la variante con modificador local y la pagina generica pasa a
captacion. Solo `ortopedia infantil` esta hoy en el formato que su SERP premia.

### 4. Las cuatro entradas del blog son URLs reales, no una plantilla

El roadmap contaba `/blog/[slug]` como una sola linea sin expandir. Son cuatro posts vivos que
entran al mapa y a la matriz de enlazado:

- `/blog/5-sintomas-de-columna-que-no-debes-ignorar`
- `/blog/estenosis-espinal-que-es`
- `/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos`
- `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber`

Dos de ellos nombran de frente la misma condicion que una pagina de servicio publicada
—estenosis espinal y hernia discal—. Con la SERP de esas dos exigiendo contenido informativo
(punto 3), el post y la pagina de servicio se estan peleando la misma intencion. Hay que decidir
cual gana la keyword y cual enlaza a cual.

### 5. La primera escritura en el documento del cliente

Consecuencia de la desviacion D-1: el tracer dejo la tuberia probada pero el Sheet intacto. La
carga real de `Content Model` ocurre en `14-02` en cuanto Juan apruebe, con `--yes`.

### Reconciliacion completa contra la cifra del roadmap

Medido: 22 URLs, 21 mapeables. Esperado: 19 y 18. Diferencia: +3 y +3.

**Medidas que el roadmap no nombra (6):** las cuatro entradas de blog, `/sedes` y
`/servicios/escoliosis`.

**Nombradas por el roadmap que no existen asi (2):** `/blog/[slug]` (plantilla sin expandir) y
`/servicios/escoliosis-y-deformidades` (el slug que se publico es otro).

## Commits

| Commit | Mensaje |
|---|---|
| `04eab21` | feat(14-01): tubería de una URL real del inventario al Content Model |
| `fce5106` | test(14-01): prueba en rojo del inventario completo del sitio |
| `c01a19a` | feat(14-01): inventario medido del sitio y reconciliacion con la cifra del roadmap |
| `e662cfa` | test(14-01): pruebas en rojo del solape par a par y del tipo de pagina |
| `c35ef07` | feat(14-01): solape par a par y tipo de pagina exigido por la SERP, desde cache |

Los tres ciclos TDD tienen su commit rojo antes del verde.

## Estado de recursos

- **SerpApi: 96 llamadas**, sin cambio. El presupuesto de la fase era cero y se respeto.
- **`data/keywords.jsonl`:** SHA-256 intacto.
- **Pruebas:** 418 antes, 450 despues. 32 nuevas, todas en verde.
- **Escrituras en el Sheet del cliente:** ninguna.
- **Escrituras bajo `src/` de la aplicacion:** ninguna.

## Self-Check: PASSED

Los doce archivos declarados existen en disco y los cinco commits existen en el historial.

## Deuda que esta fase deja anotada

- La verificacion visual de la fila de Ricardo Palma en el tab `Content Model` se traslada a
  `14-02`, por la desviacion D-1.
- El `<done>` de la tarea 1 queda parcialmente abierto por la misma razon: la tuberia esta
  probada de punta a punta salvo el ultimo tramo, que es escribir de verdad.
