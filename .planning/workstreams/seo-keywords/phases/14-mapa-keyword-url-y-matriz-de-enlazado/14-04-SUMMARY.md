---
phase: 14-mapa-keyword-url-y-matriz-de-enlazado
workstream: seo-keywords
plan: 04
subsystem: seo-tools
tags: [enlazado-interno, canonical, sheet, mapeo-posicional, clusters]
requires:
  - "seo-tools/data/url-map.jsonl — las 24 filas del mapa (plan 14-03)"
  - "seo-tools/data/cannibalization.json, clusters.json, golden-10.json"
  - "seo-tools/src/phase14/{overlap,cm-push}.ts y src/sheets/{schema,upsert}.ts"
provides:
  - "seo-tools/src/phase14/canonical.ts — canonical y topic propuestos por URL"
  - "seo-tools/src/phase14/links.ts — la matriz de enlazado entre clusters"
  - "seo-tools/src/phase14/ca-push.ts — cargador del tab Canonical Audit"
  - "seo-tools/src/phase14/il-push.ts — cargador posicional del tab Internal Linking Audit"
  - "seo-tools/src/phase14/il-verify.ts — verificacion de solo lectura del mapeo posicional"
  - "seo-tools/src/phase14/seguimiento.ts — siembra unica de las columnas del cliente"
  - "seo-tools/data/canonicals.json — 24 filas"
  - "seo-tools/data/internal-links.json — 22 filas, 135 enlaces"
  - ".../14-ENLAZADO.md — la matriz legible por cluster"
  - "TabSchema.columns — la lista de columnas sin deduplicar por encabezado"
affects:
  - "fase 15: los anchors salen de las keywords secundarias, asi que el paquete on-page tiene que respetarlas"
  - "workstream milestone: los 135 enlaces son especificacion, los implementa v1.1 en el codigo"
  - "seis nodos quedan sin anchor optimizado, heredado de 14-03"
tech-stack:
  added: []
  patterns:
    - "Un tab con encabezados repetidos se resuelve por posicion, y el cargador se niega a escribirlo si el modelo no lo declara."
    - "Las columnas de seguimiento del cliente se siembran una sola vez y despues no se pisan."
    - "Las ranuras de enlace sin usar se escriben vacias a proposito: omitirlas dejaria colgando los enlaces de una carga anterior."
key-files:
  created:
    - seo-tools/src/phase14/canonical.ts
    - seo-tools/src/phase14/canonical.test.ts
    - seo-tools/src/phase14/ca-push.ts
    - seo-tools/src/phase14/links.ts
    - seo-tools/src/phase14/links.test.ts
    - seo-tools/src/phase14/il-push.ts
    - seo-tools/src/phase14/il-push.test.ts
    - seo-tools/src/phase14/il-verify.ts
    - seo-tools/src/phase14/seguimiento.ts
    - seo-tools/data/canonicals.json
    - seo-tools/data/internal-links.json
    - .planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-ENLAZADO.md
  modified:
    - seo-tools/src/sheets/schema.ts
    - seo-tools/src/sheets/upsert.ts
decisions:
  - "El canonical de una URL que va a redirigir es el suyo propio, no el destino del 301: son dos implementaciones distintas y la pagina sigue viva hasta que v1.1 la apague."
  - "El criterio que exigia keyword en las 24 filas se estrecha a las 16 que compiten: las otras 8 declaran por escrito por que no lo hacen, y rellenarlas destruiria la decision de 14-03."
  - "Las dos URLs que redirigen quedan fuera de la matriz por las dos puntas: enlazar hacia ellas suma un salto y enlazar desde ellas es escribir en una pagina que se apaga."
  - "upsertRows recorre schema.columns y no byHeader.values(): el indice por nombre colapsaba los ocho `Title with Link` y dejaba siete columnas sin escribir, sin lanzar nada."
metrics:
  duration: ~2 h
  completed: 2026-08-12
  tests_before: 497
  tests_after: 536
  serpapi_calls: 96
  urls_en_la_matriz: 22
  enlaces_propuestos: 135
  escrituras_reales_en_el_sheet: 3
status: complete
---

# Phase 14 Plan 04: Canonicals y la matriz de enlazado — Summary

La fase cierra con las dos entregas que faltaban. Cada una de las 24 URLs del mapa tiene su
canonical propuesto, y 22 de ellas se sostienen entre sí con 135 enlaces internos que salen del
cluster y no del capricho. Los tres tabs de la fase quedan llenos en el documento del cliente y
una segunda carga de los tres no inserta ni agrega nada. Coste de SerpApi: cero.

Lo que más costó no fue armar la matriz: fue impedir que se destruyera al escribirla.

## El modo de falla que no se queja

El tab `Internal Linking Audit` trae ocho bloques de tres columnas y el encabezado del tercero,
`Title with Link`, **se repite literal las ocho veces**. Resolver columnas por nombre encuentra la
primera y le asigna los ocho destinos. Eso no lanza ninguna excepción, no desbalancea ningún
contador y el resumen igual reporta `actualizadas: 22`. La matriz quedaría destruida y el registro
diría que salió bien.

El plan ya lo tenía previsto y por eso el modelo declara `mapBy: "posicion"`. Pero el mismo modo de
falla entraba por una segunda puerta que el plan no había visto: `upsertRows` recorría
`schema.byHeader.values()` para decidir qué columnas escribir, y ese índice está armado por
encabezado recortado, así que **colapsaba los ocho `Title with Link` en una sola entrada** y dejaba
siete columnas fuera de toda escritura. El mapeo posicional habría estado bien declarado y roto en
la práctica. `TabSchema` ahora expone `columns`, la lista completa sin deduplicar, y el upsert lee
de ahí; `byHeader` se queda para buscar una columna concreta por nombre, que es su uso legítimo y
donde la ambigüedad no aplica porque la columna clave nunca está repetida.

Como ningún contador distingue un mapeo bueno de uno roto, la evidencia tenía que venir del
documento vivo. `il-verify.ts` es de solo lectura, lee la fila de una URL que usa las ocho ranuras
y compara el primer bloque contra el octavo:

```
URL verificada: /servicios/cirugia-minimamente-invasiva
  OK   link1            "/servicios/escoliosis-y-deformidades"
  OK   anchor1          "ejercicios para escoliosis"
  OK   titleWithLink1   "Escoliosis y deformidades de columna: diagnóstico y tratamiento"
  OK   link8            "/servicios"
  OK   anchor8          "cirujano de columna lima"
  OK   titleWithLink8   "Traumatólogo Especialista en Columna en Lima — Servicios"
  OK   bloque 1 != bloque 8
```

Si el mapeo hubiera sido nominal, los dos bloques serían idénticos. Vienen distintos y ambos
coinciden con el dataset.

## Las dos desviaciones del plan

**1. El criterio de la tarea 1 no podía pasar como estaba escrito.** Pedía
`f.every(x => /^https?:\/\//.test(x.canonical) && x.topic && x.keyword)` sobre las 24 filas. Ocho de
esas filas tienen `esPaginaSeo: false` y no tienen keyword **a propósito**: es la decisión del plan
14-03 de que una URL sin primaria entra al mapa declarando por escrito por qué no compite en vez de
recibir relleno. Inventarle una keyword a `/agendar`, `/contacto`, `/sedes`, `/blog`,
`/sobre-el-doctor`, `/testimonios` o a los dos posts que se funden habría hecho pasar el criterio
destruyendo lo que el criterio protege.

El criterio se estrecha a las 16 filas que compiten. `canonical` y `topic` siguen siendo
obligatorios en las 24, y `motivoSinPrimaria` viaja en el dataset para que la exclusión quede
declarada y no parezca un olvido.

**2. `canonical` y `topic` ya existían en el mapa** desde 14-03. En vez de recalcularlos y arriesgar
dos respuestas divergentes para el mismo dato, `canonical.ts` los toma del mapa como fuente de
verdad y valida que cumplan lo que el plan exige: absolutos, mismo origen que el sitemap, sin barra
final salvo en la raíz, y ninguno repetido. Los 24 pasan.

Relacionado, el plan pedía decidir qué canonical reciben las dos URLs que redirigen. **Reciben el
suyo propio, no el destino del 301.** Son dos implementaciones distintas: pedir "canonical al
destino" le encargaría a v1.1 una etiqueta en el `<head>` de una página que en la misma fase se
apaga con una redirección. Mientras la página siga viva su canonical correcto es ella misma, y el
destino de la fusión viaja en `redirigeA` dentro del mapa y en la columna `Action` del
`Content Model`, que es donde se lee como orden. Esto además mantiene el criterio de "ningún
canonical repetido": apuntar al destino habría creado dos pares duplicados.

## La matriz

135 enlaces entre 22 URLs, construidos en este orden: dentro del cluster primero con el solape par a
par decidiendo, hacia las de oro, de captación a servicio, hacia las sedes vigentes y hacia
conversión.

| Métrica | Valor |
|---|---|
| URLs en la matriz | 22 |
| Enlaces propuestos | 135 |
| Anchors distintos | 78 |
| URLs sin enlaces entrantes | 0 |
| Enlaces salientes máximos por URL | 8 |
| URLs que se enlazan a sí mismas | 0 |
| Anchors apuntando a dos destinos | 0 |

Las dos URLs que redirigen quedan fuera de la matriz **por las dos puntas**: enlazar hacia ellas
mandaría a cada visitante por un salto de más, y enlazar desde ellas sería escribir enlaces en una
página que se apaga. Lo que hereda su señal es el destino del 301, que sí está en la matriz.

El anchor sale siempre de una keyword del destino, nunca del título del origen — un enlace le dice a
Google de qué trata la página a la que apunta, no de qué trata la que lo escribe. Y ningún anchor
apunta a dos destinos, que sería canibalización escrita a mano.

## La carga en el documento del cliente

Segunda pasada de los tres cargadores, que es lo que prueba SHEET-06 sobre los tres tabs en la misma
corrida:

| Tab | actualizadas | insertadas | columnasAgregadas |
|---|---|---|---|
| `Content Model` | 24 | 0 | 0 |
| `Canonical Audit` | 24 | 0 | 0 |
| `Internal Linking Audit` | 22 | 0 | 0 |

Las columnas que responde el cliente —`Approved?`, `Implemented?`, `Done`— se siembran una sola vez
con su valor inicial y después no se vuelven a pisar: en la segunda corrida quedaron 0 celdas por
sembrar de 48 y de 22. Si el cargador las reescribiera, cada carga borraría lo que Juan hubiera
respondido.

## Verificación

- `npm test`: 536 en verde, 0 en rojo (eran 497 al cerrar 14-03).
- `npm run typecheck`: sin salida.
- Mapeo posicional confirmado contra el documento vivo con `il-verify.ts`.
- `git status` sobre `src/` de la aplicación y sobre `.planning/workstreams/milestone/`: cero rutas.
  La matriz se propone; los enlaces los escribe v1.1.
- SerpApi sigue en 96 de 102. La fase 14 entera cerró sin gastar una búsqueda.

## Nota de ejecución

El primer ejecutor murió al arrancar con un `403` de la API y el segundo se colgó a mitad de la
tarea 3, con las tareas 1 y 2 ya commiteadas. La tarea 3 se terminó en línea. El token de Google
expiró una vez durante la pasada de cierre y se reintentó. Nada de eso cambió el resultado, pero
explica por qué el trabajo llegó en tres commits de dos autores distintos.

## Requisitos cerrados

- **MAP-05** — existe la matriz de enlazado con qué URL enlaza a cuál y con qué anchor.
- **SHEET-04** — `Canonical Audit` con una fila por URL, con keyword, topic y canonical propuesto.
- **SHEET-05** — `Internal Linking Audit` con una fila por URL y hasta ocho enlaces salientes con su
  anchor, mapeados por posición y verificados contra el documento vivo.
- **SHEET-06** — sigue probado: segunda carga de los tres tabs con cero inserciones y cero columnas
  agregadas.

Con esto la fase 14 queda completa: MAP-01 a MAP-05, SHEET-02, SHEET-04 y SHEET-05.
