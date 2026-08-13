---
phase: 14-mapa-keyword-url-y-matriz-de-enlazado
workstream: seo-keywords
plan: 03
subsystem: seo-tools
tags: [mapa-keyword-url, auditoria, canibalizacion, content-model, serp, blog]
requires:
  - "seo-tools/src/phase14/{model,overlap,assign,assign-run,cm-push}.ts (planes 14-01 y 14-02)"
  - "seo-tools/data/{url-inventory.json,golden-10.json,keywords-13.jsonl,page-type-map.json}"
  - ".planning/workstreams/seo-keywords/data/decisiones-checkpoint-14-2026-08-11.md"
provides:
  - "seo-tools/src/phase14/audit.ts — auditoria de lo publicado, con la cita literal del contenido"
  - "seo-tools/src/phase14/cannibal.ts — cruce del mapa contra si mismo, par a par"
  - "seo-tools/src/phase14/cannibal-run.ts — detector, aplicador de resoluciones y reporte"
  - "seo-tools/data/url-map.jsonl — las 24 filas del mapa completo"
  - "seo-tools/data/cannibalization.json — 120 pares comparados, cero conflictos"
  - ".../14-MAPA.md — secciones 2 y 3, mapa legible completo"
  - ".../14-CANIBALIZACION.md — el cruce, los descartes y la deuda fechada"
  - ".planning/workstreams/seo-keywords/deferred-items.md — cinco deudas con fecha"
  - "24 filas vivas en el tab Content Model del Sheet del cliente"
affects:
  - "14-04: la matriz de enlazado parte de estas 24, con seis nodos sin anchor optimizado"
  - "fase 15: dos fusiones de post dentro de guia, once reescrituras y tres URLs nuevas"
  - "workstream milestone: dos redirecciones 301 nuevas ademas de la de escoliosis"
tech-stack:
  added: []
  patterns:
    - "Una URL puede declarar que NO compite, con esPaginaSeo false y el motivo en prosa."
    - "El veredicto editorial de un post sale de la cita literal del contenido, no de la carpeta."
    - "La geo de distrito solo viaja si el distrito esta en la red de sedes del consultorio."
key-files:
  created:
    - seo-tools/src/phase14/audit.ts
    - seo-tools/src/phase14/audit.test.ts
    - seo-tools/src/phase14/cannibal.ts
    - seo-tools/src/phase14/cannibal.test.ts
    - seo-tools/src/phase14/cannibal-run.ts
    - seo-tools/data/cannibalization.json
    - .planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-CANIBALIZACION.md
    - .planning/workstreams/seo-keywords/deferred-items.md
  modified:
    - seo-tools/src/phase14/model.ts
    - seo-tools/src/phase14/assign.ts
    - seo-tools/src/phase14/assign-run.ts
    - seo-tools/src/phase14/cm-push.ts
    - seo-tools/src/phase14/inventory.ts
    - seo-tools/data/url-map.jsonl
    - seo-tools/data/url-inventory.json
    - .planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-MAPA.md
    - .planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-HANDOFF-V11.md
decisions:
  - "Una URL sin keyword primaria entra al mapa declarando por que no compite, en vez de recibir relleno."
  - "El slug viejo de escoliosis sale del inventario mapeable: es la misma pagina renombrada, no una URL que no compite."
  - "Toda la familia de traumatologia generica en Lima es una sola pagina, y esa pagina es la home."
  - "La de oro ciatica aterriza en el post que ya la trata, en vez de crear /blog/ciatica al lado."
  - "La geo de distrito solo entra si el distrito tiene sede: Los Olivos sale del mapa."
metrics:
  duration: ~2 h
  completed: 2026-08-11
  tests_before: 464
  tests_after: 497
  serpapi_calls: 96
  filas_en_el_mapa: 24
  escrituras_reales_en_el_sheet: 2
status: complete
---

# Phase 14 Plan 03: El mapa completo y la canibalización cerrada — Summary

Las 20 URLs mapeables del sitio saben por qué keyword pelean, o declaran por escrito por qué no
pelean ninguna. El cruce del mapa contra sí mismo, 120 pares comparados con SERP real, da cero
conflictos. Coste de SerpApi: cero.

Lo que más cambia el trabajo que sigue no es el mapa: es el hallazgo de que **toda la familia de
consultas genéricas de traumatología en Lima es una sola página**. Nueve candidatas se
descartaron por solape medido, todas chocando contra la home. Un mapa armado por carpetas habría
puesto cuatro URLs a pelear el mismo top 10 desde el día uno.

## Qué se completó

### Task 1 — Auditoría de lo publicado y el resto de las URLs (commit `e4ba060`)

`audit.ts` lee el contenido que v1.1 publicó el 2026-08-10 y deduce de qué trata cada página, con
**la frase textual y el archivo con su línea**. Sin la cita, "el contenido apunta a otro tema" es
una opinión del ejecutor; con la cita, la fase 15 puede abrir el archivo y discutirla.

Las diez conductas declaradas tienen prueba propia. 23 pruebas nuevas.

### Task 2 — Canibalización y deuda fechada (commit `02679d4`)

`cannibal.ts` cruza las 24 filas de a pares con `overlap.ts`. Cuatro tipos de choque, cada uno
con su evidencia de solape y el umbral aplicado. Los pares del mismo cluster con solape cero se
reportan **como no-conflicto, con su explicación**: que no aparezcan y que aparezcan declarados no
es lo mismo. 10 pruebas nuevas.

### Task 3 — Publicación y mapa legible (commit `82c2ac5`)

Segunda escritura real de esta fase en el documento del cliente, y la primera con el dataset
entero. Acá apareció el bug de la home, abajo en desviaciones.

## El conflicto estructural que el ejecutor anterior detectó, resuelto

El ejecutor anterior se detuvo antes de escribir código porque los criterios 1 y 3 de la tarea 1
juntos afirmaban que toda URL mapeable pelea una keyword, y tres grupos legítimamente no lo hacen.
Se resolvió con la opción A y la B para el slug viejo:

- **Opción A.** `model.ts` admite una fila con `esPaginaSeo: false` sin primaria, y exige a cambio
  `motivoSinPrimaria` con al menos 30 caracteres de prosa y cero secundarias. El criterio 3 se
  ajustó para exigir primaria solo a las filas con `esPaginaSeo: true`. **Ocho URLs** entran así.
- **Opción B para `/servicios/escoliosis`.** Sale del inventario mapeable con el motivo escrito:
  no es una URL que no compite, es la **misma página** bajo el slug anterior, y el slug nuevo ya
  tiene fila desde el 14-02.

**El conteo de mapeables pasó de 21 a 20.** La cifra de 21 ya se había reportado en el 14-01 y en
el 14-02, así que el cambio queda dicho acá: el inventario sigue midiendo 22 URLs totales; lo que
cambió es que ahora dos son no-mapeables (`/privacidad` y el slug viejo) en vez de una.

`AccionDeUrl` suma `redirigir`, con `redirigeA` obligatorio: un 301 sin destino escrito es una URL
que se apaga y no llega a ningún lado. `cm-push.ts` siguió compilando y sus pruebas quedaron en
verde con el campo nuevo agregado a su fixture.

## El veredicto de canibalización de cada post del blog

| Post | Veredicto | Qué lo decidió |
|---|---|---|
| `/blog/estenosis-espinal-que-es` | **fusionar y redirigir** → `/servicios/estenosis-espinal` | El propio post remite dos veces a "la guía completa" (`blog.ts:291` y `:309`). No compite con la guía: la anticipa. |
| `/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos` | **fusionar y redirigir** → `/servicios/hernia-discal` | Su ángulo diferencial ya vive en la guía como secundarias desde el 14-02, y `dolor de espalda` no está entre las 91 cabezas con SERP medida: darle primaria sería inferencia disfrazada de medición. |
| `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | **ángulo distinto**, primaria `ciática` | `golden-10.json` mandaba la de oro número 7 a un `/blog/ciatica` inexistente. El post ya trata el dolor irradiado y lo nombra ciática (`blog.ts:62`): crear la URL al lado habría fabricado la canibalización. Cero compartidas con `hernia discal`, `lumbalgia` y `cirugía de columna`. |
| `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | **ángulo distinto**, primaria `cirugía de columna` | Es el *qué* del procedimiento, distinto del *quién* de `/servicios`. Cero URLs compartidas con las seis primarias contra las que se midió. |

Las dos que redirigen entran al mapa **sin primaria**: una URL a punto de apagarse no puede
aparecer en el `Content Model` peleando una consulta que en dos semanas no va a existir.

## Los tres hallazgos que venían pedidos

1. **`ortopedia infantil en los olivos` salió**, y con ella la regla que faltaba: la geo de
   distrito de D-04 asume que el distrito está en la red. Se agregó `distritoFueraDeRed` con 42
   distritos de Lima, y se aplicó a todas las geo. Surco, San Isidro y La Molina siguen entrando;
   el resto no. La ranura la ocupó `medico ortopedia infantil`.
2. **`/sedes/sanna-la-molina` conserva su primaria con el tipo registrado honestamente:**
   `red-social`. El top 10 son perfiles de Facebook e Instagram, y el mapa lo dice.
3. **Las siete de oro sin URL, resueltas:** `estenosis de canal` y `hernia discal lumbar y
   cervical` ya viven de secundarias en sus guías; `traumatología lima` fue a la home; `ciática`
   al post que ya la trataba; y `artrosis`, `lumbalgia` y `cirugía mínimamente invasiva en lima`
   son URLs planificadas con `accion: crear`.

## Criterios de aceptación, con la salida real

| Criterio | Salida | Estado |
|---|---|---|
| URLs mapeables sin fila | `0` | OK |
| `/privacidad` en el mapa | `0` | OK |
| Forma completa de las filas con `esPaginaSeo: true` | `1` | OK |
| Filas sin primaria que declaran motivo, cero secundarias y `esPaginaSeo: false` | `1` de `8` | OK |
| `reescribir` sin motivo de 30 caracteres | `0` | OK |
| Las nueve del 14-02 conservan su `keywordPrimariaKey` | `9/9` | OK |
| Conflictos altos sin resolución | `0` | OK |
| Primarias repetidas en el mapa completo | `0` | OK |
| Cada conflicto con `urlsCompartidas` y `umbralAplicado` | `1` | OK |
| Determinismo de `url-map.jsonl` | `ada0a4a1…6ea951b5` en las dos corridas | OK |
| `npm test` | 497 pruebas, 497 verdes, 0 rojas | OK |
| `npm run typecheck` | sin salida | OK |
| `seo-tools` fuera del `tsconfig.json` raíz | `0` archivos | OK |
| La app raíz compila | estado `0` | OK |
| SHA-256 de `keywords.jsonl` | `c59dad2d…bcd7eac`, sin cambio | OK |
| Cuota de SerpApi | `96` | OK |
| Staging sin rutas de `src/` de la app | `0` | OK |
| Staging sin rutas de `workstreams/milestone` | `0` | OK |

### Las tres corridas de `cm-push`, con los números reales

| Corrida | actualizadas | insertadas | columnasAgregadas | llamadas de red |
|---|---|---|---|---|
| Ensayo (`--dry-run`) | 9 | 15 | 0 | 3 |
| Primera real (`--yes`) | 9 | 15 | 0 | 4 |
| Segunda real (`--yes`) | **24** | **0** | **0** | 4 |

**SHEET-06 queda probado sobre el dataset entero:** la segunda carga actualizó las 24 filas y no
insertó ninguna.

### Lectura del documento vivo, solo lectura

| Comprobación | Resultado |
|---|---|
| Filas con `URL` en `Content Model` | `24`, igual al número de líneas del dataset |
| Filas con `Keyword` no vacía | `24` |
| Celdas no vacías en las tres columnas `(Ahrefs)` | `0` (D-13) |
| La home presente en el tab | sí |
| Filas que declaran no competir, con el texto escrito | `8` |

**Nota sobre el criterio de `Keyword` no vacía.** Las ocho filas sin primaria no dejan la celda en
blanco: escriben `"Sin keyword primaria (decisión)"`. En el documento del cliente una celda vacía
se lee como olvido, y ninguna de las ocho lo es —`/sedes` es literalmente una decisión de Juan.
Por eso el conteo cierra en 24 sin falsear nada.

### El cruce de canibalización

| Métrica | Valor |
|---|---|
| URLs cruzadas | 24 |
| Pares comparados | 120 |
| Conflictos | 0 |
| Altos sin resolución | 0 |
| Pares del mismo cluster con solape cero (NO son conflicto) | 5 |

Los cinco son exactamente el caso de D-05: el cluster de 41 cabezas formado por transitividad,
con `traumatología lima`, `cirujano de columna lima`, `ortopedia infantil lima` y `cirugía de
columna surco` compartiendo cero URLs del top 10 entre sí. El reporte los nombra con su
explicación en vez de omitirlos.

## Desviaciones del plan

### D-1 (Regla 1, bug) — La home no llegaba al documento del cliente

**Encontrado en:** el ensayo de la tarea 3, porque los números no cerraban: 9 actualizadas más 14
insertadas daban 23 sobre un dataset de 24.

`upsertRows` normaliza la celda clave con `normalizeKeyword`, que quita la puntuación:
`"/servicios"` queda `"servicios"`, pero `"/"` queda en **cadena vacía**, y el upsert saltea las
claves vacías —con razón, porque en la hoja son filas en blanco. La home entonces no se insertaba
ni se actualizaba: **desaparecía en silencio**, y el resumen decía que la carga había salido bien.

Es el mismo modo de falla que la defensa 4 de `cm-push.ts` atrapa para las columnas, cometido
sobre las filas. Y la víctima era la URL más importante del sitio.

**Arreglo, en dos partes.** La home viaja a la columna `URL` como su URL canónica absoluta, que
normaliza a algo estable y no vacío y que además es exactamente lo que un lector entiende por "la
home"; las demás siguen como ruta relativa, porque cambiarlas volvería a insertar las nueve filas
que ya existen. Y se agregó la **defensa 5**: una fila del dataset cuya clave normalice a vacío
detiene la carga nombrando cuál, en vez de desaparecer.

`upsert.ts` no se tocó: es el escritor compartido de la fase 12 y su comportamiento con celdas
vacías es correcto para el resto de los tabs.

**Archivos:** `seo-tools/src/phase14/cm-push.ts`. **Commit:** `82c2ac5`.

### D-2 (Regla 2, funcionalidad faltante) — La geo de distrito sin sede

Descrita arriba en los hallazgos. `motivoDeExclusion` suma dos motivos nuevos: distrito fuera de
la red del consultorio, y cirugía de otra especialidad —el cluster de `cirugía mínimamente
invasiva` agrupa por técnica y adentro conviven la ortognática de mandíbula, la de paratiroides y
la cardíaca, que el consultorio no realiza—. **Commit:** `e4ba060`.

### D-3 (Regla 3, bloqueante) — `assign.test.ts` y `cm-push.test.ts` con el modelo nuevo

Al volver `keywordPrimaria` anulable y agregar `motivoDeAccion` obligatorio, una aserción de
`assign.test.ts` y el fixture de `cm-push.test.ts` dejaron de compilar o de pasar. Se corrigieron
las dos sin aflojar ninguna comprobación: la aserción ahora afirma primero que una página de
servicio siempre trae primaria. **Commit:** `e4ba060`.

## Observaciones para la verificación de fase

- **Ninguna de las nueve filas del 14-02 cambió de primaria.** Una cambió de secundarias:
  `/servicios/ortopedia-infantil` perdió `ortopedia infantil en los olivos` por el filtro nuevo y
  ganó `medico ortopedia infantil`. Es la corrección que el propio SUMMARY del 14-02 dejó pedida.
- **El detector no señaló ninguna de las nueve**, así que T-14-10 no llegó a activarse. La
  protección está implementada y probada igual: una URL intocable que pierda un desempate no cede
  nada y el conflicto queda en `sinResolver`.
- **`/sobre-el-doctor` sin primaria es la fila más incómoda de las ocho.** Su consulta real es el
  nombre propio del doctor y el universo de la fase 13 no tiene ni una cabeza de marca. Queda como
  deuda fechada para el 2026-08-21, cuando se reponga la cuota de SerpApi.

## Commits

| Commit | Mensaje |
|---|---|
| `e4ba060` | feat(14-03): auditoria de lo publicado y asignacion del resto de las URLs vivas |
| `02679d4` | feat(14-03): canibalizacion por cruce del mapa contra si mismo, y la deuda fechada |
| `82c2ac5` | fix(14-03): la home no llegaba al documento del cliente, y el mapa legible completo |

## Estado de recursos

- **SerpApi: 96 llamadas**, sin mover. El presupuesto del plan era cero y se respetó.
- **`data/keywords.jsonl`:** SHA-256 intacto.
- **Pruebas:** 464 antes, 497 después. 33 nuevas, todas en verde.
- **Escrituras bajo `src/` de la aplicación:** ninguna. Se leyeron `content/blog.ts`,
  `content/service-pages.ts`, `content/location-pages.ts` y las metas de ocho páginas de `app/`.
- **Escrituras bajo `.planning/workstreams/milestone/`:** ninguna.
- **Escrituras reales en el Sheet del cliente:** 2 corridas, 24 filas.

## Known Stubs

Ninguno. Las 24 filas salen del dato medido o de una decisión declarada con su motivo en prosa, y
ninguna lleva valor de relleno.

## Self-Check: PASSED

Los ocho archivos declarados como creados existen en disco y los tres commits existen en el
historial.
