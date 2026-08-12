# Canibalización del mapa keyword → URL (MAP-02)

**Fase:** 14 · **Plan:** 14-03 · **Workstream:** `seo-keywords` · **Fecha:** 2026-08-11
**Dato medido:** `seo-tools/data/cannibalization.json` · **Coste de SerpApi:** cero

---

## 1. Qué se midió, y por qué así

Se cruzó el mapa propuesto contra sí mismo: las 24 filas de `url-map.jsonl`, comparadas de a
pares, **120 pares**, con el veredicto de solape de `overlap.ts` sobre las 96 capturas de SERP
que la fase 13 ya pagó.

**Por qué no se midió la canibalización heredada.** El endpoint `/canibalizaciones` de DinoRank
responde 200 y devuelve `has_data: false` con **cero keywords**. Search Console ya está vinculado
—`last_searchconsole_date` pasó de `null` a `2026-08-09`— pero el sitio es de agosto de 2026 y no
acumuló impresiones. No hay canibalización sobre lo indexado porque no hay historial que mirar.
Construir un veredicto sobre esa respuesta vacía sería inventar un dato.

La canibalización que importa en un sitio recién publicado no es la heredada: **es la que estamos
por crear**. Un mapa que asigna 18 keywords primarias a 24 URLs decide, hoy, qué páginas van a
competir entre sí durante los próximos dos años. Eso sí es medible, y es lo que se midió.

**La regla que gobernó todo el cruce: dos URLs no chocan por compartir cluster.** Chocan cuando
comparten URLs del top 10 real, contadas de a pares, contra un umbral de **3**. El cluster mayor
de la fase 13 juntó 41 cabezas encadenándolas a través de terceras keywords, y adentro conviven
ortopedia infantil, cirugía de columna y traumatología general. Un detector que agrupara por
cluster habría reportado ese grupo como canibalización y lo habría "resuelto" fusionando páginas
legítimas.

### Los cuatro choques que el detector busca

| Tipo | Severidad | Qué encuentra |
|---|---|---|
| `misma-primaria` | alta | Dos URLs con la misma clave normalizada. Canibalización por definición. |
| `solape-de-serp` | alta | Primarias escritas distinto que Google responde igual. Solo el dato lo ve. |
| `distrito-duplicado` | alta | La misma geo de distrito encabezando dos URLs (D-04). |
| `secundaria-es-primaria-ajena` | media | Una URL persigue de secundaria lo que otra pelea de primaria. |

---

## 2. Los conflictos y su resolución

**Resultado del cruce final: cero conflictos.** No es un archivo vacío por omisión —el reporte
existe, con la lista en cero y los 120 pares contados.

| Métrica | Valor |
|---|---|
| URLs cruzadas | 24 |
| Pares comparados | 120 |
| Conflictos totales | 0 |
| Altos | 0 |
| Medios | 0 |
| Altos sin resolución | **0** |
| Primarias repetidas en el mapa completo | **0** |
| Pares del mismo cluster con solape cero (NO son conflicto) | 5 |

### Por qué el cruce sale limpio, y dónde se pagó ese resultado

El mapa sale sin conflictos porque **la canibalización se resolvió al asignar, no después**. Cada
primaria del lote del plan 14-03 se midió contra las nueve del 14-02 antes de escribirla, y las
que chocaban se descartaron con el número a la vista. Los descartes son la parte interesante:

| Keyword descartada | URL que la quería | Contra quién chocaba | Compartidas |
|---|---|---|---|
| `traumatólogo lima` | `/agendar` | `traumatología lima` (home) | **8** |
| `traumatología cerca de mí` | `/contacto` | `traumatología lima` (home) | **6** |
| `traumatólogo cerca de mí` | `/contacto` | `traumatólogo lima` | **5** |
| `traumatólogo` | `/sobre-el-doctor` | `traumatología lima` (home) | **6** |
| `neurocirujano lima` | candidata suelta | `cirujano de columna lima` (`/servicios`) | **6** |
| `cirujano de columna` | `/sobre-el-doctor` | `cirujano de columna lima` (`/servicios`) | **3** |
| `traumatología` | `/blog` | `traumatología lima` (home) | **3** |
| `traumatología y ortopedia lima` | candidata suelta | `traumatología lima` (home) | **4** |
| `mejor clínica de traumatología en lima` | candidata suelta | `traumatología lima` (home) | **5** |

Nueve candidatas descartadas por evidencia de SERP. Ese es el hallazgo real de MAP-02 en este
sitio: **toda la familia de consultas genéricas de traumatología en Lima es una sola página**, y
esa página es la home. Repartirla entre la home, `/agendar`, `/contacto` y `/sobre-el-doctor`
—que es lo que un mapa hecho por carpetas habría hecho— habría puesto cuatro URLs a pelear el
mismo top 10 desde el día uno.

Por eso esas cuatro URLs entran al mapa **declarando que no compiten**, con el número de URLs
compartidas escrito en su `motivoSinPrimaria`, y no con una keyword de relleno.

### Los cinco pares que NO son conflicto, y por qué el reporte los nombra

Cinco pares comparten el cluster `especialista-en-columna-y-trauma-en-lima` —el de 41 cabezas— y
comparten **cero** URLs del top 10 medido:

| Par | Keywords |
|---|---|
| `/` ↔ `/servicios` | `traumatología lima` / `cirujano de columna lima` |
| `/` ↔ `/servicios/ortopedia-infantil` | `traumatología lima` / `ortopedia infantil lima` |
| `/` ↔ `/sedes/consultorio-privado` | `traumatología lima` / `cirugía de columna surco` |
| `/servicios` ↔ `/servicios/ortopedia-infantil` | `cirujano de columna lima` / `ortopedia infantil lima` |
| `/sedes/consultorio-privado` ↔ `/servicios/ortopedia-infantil` | `cirugía de columna surco` / `ortopedia infantil lima` |

Están en el reporte a propósito. Que un par no aparezca y que aparezca declarado como no-conflicto
no es lo mismo: lo primero se lee como que nadie lo miró. Cada uno lleva escrito que el cluster se
formó por transitividad y que Google les responde cosas distintas (D-05).

### La canibalización editorial: los cuatro posts del blog

Es el choque que la nota de Juan del 2026-08-11 mandó resolver acá, y no lo encuentra el solape de
SERP sino la lectura del contenido publicado. Con las páginas de servicio yéndose a formato guía
clínica larga, post y guía pasan a competir por la misma intención informativa.

| Post | Veredicto | Evidencia |
|---|---|---|
| `/blog/estenosis-espinal-que-es` | **fusionar y redirigir** → `/servicios/estenosis-espinal` | El propio post remite dos veces a la guía: `blog.ts:291` y `blog.ts:309` dicen "está desarrollado en la guía completa". No compite con la guía: la anticipa. |
| `/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos` | **fusionar y redirigir** → `/servicios/hernia-discal` | Su ángulo diferencial ya vive en la guía, que lleva `ciática o hernia discal` y `lumbalgia o hernia discal` de secundarias desde el 14-02. Y `dolor de espalda` no está entre las 91 cabezas con SERP medida, así que no hay primaria propia que darle sin inventarla. |
| `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | **ángulo distinto** → primaria `ciática` | Golden-10 mandaba `ciática` (8.100 de volumen) a un `/blog/ciatica` inexistente. Crear esa URL al lado de este post habría fabricado la canibalización: el post ya trata el dolor irradiado y lo nombra ciática (`blog.ts:62`). La de oro aterriza en la URL que puede ganarla. Medido: cero compartidas con `hernia discal`, `lumbalgia` y `cirugía de columna`. |
| `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | **ángulo distinto** → primaria `cirugía de columna` | Es el *qué* del procedimiento, distinto del *quién* que pelea `/servicios`. Y no es una distinción de escritorio: cero URLs compartidas con `cirujano de columna lima`, `hernia discal`, `escoliosis`, `estenosis espinal`, `traumatología lima` y `cirugía mínimamente invasiva en lima`. |

Las dos URLs que redirigen entran al mapa **sin keyword primaria**, con `accion: redirigir` y el
destino del 301 escrito. Una URL a punto de apagarse no puede aparecer en el `Content Model` del
cliente peleando una consulta que en dos semanas no va a existir.

---

## 3. Deuda fechada: la revisión con datos reales de Search Console

**Qué queda pendiente.** Volver a correr MAP-02 contra la canibalización **observada**: dos URLs
del sitio apareciendo para la misma consulta en Search Console, con impresiones y clics reales.
Eso es lo que `/canibalizaciones` de DinoRank devuelve cuando hay historial, y es la única forma
de comprobar si las 18 asignaciones de este mapa se sostuvieron en la práctica.

**Condición que la habilita:** que `/canibalizaciones` deje de devolver `has_data: false` y
reporte al menos una keyword. Depende de dos cosas que no están bajo control de este workstream:
que DinoRank termine de rastrear el sitio (proyecto `site.id 141563`, ya dado de alta) y que
Search Console acumule impresiones suficientes.

**Fecha de revisión propuesta: 2026-11-11**, tres meses después de la publicación de v1.1. Es el
plazo mínimo razonable para que una URL nueva junte impresiones con las que medir algo. Si en esa
fecha el endpoint sigue vacío, la revisión se reprograma con la fecha nueva escrita, no se cierra.

**Qué revisar ese día, en concreto:**

1. Correr `/canibalizaciones` y comparar sus pares contra `cannibalization.json`. Un par que
   DinoRank reporta y este cruce no encontró es un fallo del umbral de 3, no del mapa.
2. Revisar las cuatro URLs que hoy declaran no competir (`/agendar`, `/contacto`,
   `/sobre-el-doctor`, `/testimonios`). Si alguna acumuló impresiones por su cuenta, tiene keyword
   aunque nadie se la haya asignado, y el mapa tiene que registrarla.
3. Medir la SERP de marca del doctor, que hoy no existe en el universo de la fase 13 porque se
   construyó desde semillas de condición y de especialidad. Es lo que le falta a
   `/sobre-el-doctor` para tener primaria.
4. Comprobar que los dos 301 del blog se ejecutaron y que la guía absorbió las impresiones del
   post, en vez de perderlas.

Registrada además en `.planning/workstreams/seo-keywords/deferred-items.md`.
