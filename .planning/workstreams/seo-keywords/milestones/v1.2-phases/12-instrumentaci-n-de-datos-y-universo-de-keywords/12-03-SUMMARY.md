---
phase: 12-instrumentaci-n-de-datos-y-universo-de-keywords
workstream: seo-keywords
plan: 03
subsystem: tooling de datos y universo de keywords
tags: [keywords, dinorank, serpapi, cache, cuota, determinismo]
requires:
  - "12-01: seam de cache, libro de cuota, despacho del CLI, normalizacion"
provides:
  - "seo-tools/data/seeds.json: 66 semillas con tipo, procedencia y rango de valor de negocio"
  - "seo-tools/data/modifiers.json: cuatro familias de modificadores y geo de Lima"
  - "seo-tools/data/candidates.jsonl: 5716 keywords candidatas, 4992 con metricas de DinoRank"
  - "seo-tools/data/seeds.fixture.json: cinco semillas para probar el tope de cuota"
  - "12 capturas completas de SERP de Lima en cache, insumo de KWR-04 y COMP-03"
affects:
  - "12-04: clasifica sobre candidates.jsonl"
  - "12-05: el enriquecimiento hay que replantearlo, las metricas ya vinieron"
  - "13: las capturas de SERP ya estan cacheadas y quedan 115 busquedas"
tech-stack:
  added: []
  patterns:
    - "Lectura de la aplicacion como TEXTO PLANO y no por import, en un unico archivo"
    - "Orden de gasto derivado del rango de valor de negocio del snapshot"
    - "Filtros de geografia por palabra completa, nunca por subcadena"
    - "Salida alternativa a la cache cuando el snapshot de entrada no es el oficial"
key-files:
  created:
    - seo-tools/src/keywords/seeds.ts
    - seo-tools/src/keywords/seeds.test.ts
    - seo-tools/src/keywords/permute.ts
    - seo-tools/src/keywords/permute.test.ts
    - seo-tools/src/keywords/expand.ts
    - seo-tools/src/keywords/expand.test.ts
    - seo-tools/src/sources/serpapi.ts
    - seo-tools/src/sources/serpapi.test.ts
    - seo-tools/src/sources/dinorank.ts
    - seo-tools/src/sources/dinorank.test.ts
    - seo-tools/data/seeds.json
    - seo-tools/data/seeds.fixture.json
    - seo-tools/data/modifiers.json
    - seo-tools/data/candidates.jsonl
  modified:
    - seo-tools/src/commands/kw-seeds.ts
    - seo-tools/src/commands/kw-expand.ts
    - seo-tools/README.md
decisions:
  - "El presupuesto de semillas de DinoRank sube de 15 a 40 porque la corrida real midio que el rendimiento depende del largo de la semilla"
  - "SerpApi baja a 12 busquedas de las 60 del tope: DinoRank ya cierra el universo y lo que sobra es de la fase 13"
  - "El autocompletado queda apagado por defecto para no gastar en lo que la fase 13 necesita"
  - "El filtro de geografia se extiende a Espana, Mexico y la region, no solo a las ciudades del Peru"
metrics:
  duration: "~2 h"
  completed: 2026-08-10
  tasks: 3
  commits: 6
  searches_serpapi: 12
  searches_serpapi_left: 115
  calls_dinorank: 40
status: complete
---

# Phase 12 Plan 03: Universo candidato de keywords — Summary

Universo de 5716 keywords del negocio completo del doctor, levantado desde 66 semillas
extraidas del contenido de v1.0, la competencia y el CV, con la permutacion determinista
superando sola el umbral de KWR-01 y las fuentes reales aportando el long tail con metricas,
gastando 12 de las 127 busquedas de SerpApi disponibles.

## Conteo final por capa

El umbral de KWR-01 se cumple **sin una sola llamada de red**. Ese es el numero que importa:
lo demas es refuerzo de calidad, no el relleno que hace el numero.

| Capa | Brutos | Aporte neto tras deduplicar y filtrar | Costo |
|---|---:|---:|---|
| Permutacion | 680 | **666** | cero |
| DinoRank `/keyword-research` | 6242 | 4992 | 40 llamadas |
| SerpApi busqueda geolocalizada | 136 | 58 | 12 busquedas |
| SerpApi autocompletado | 0 | 0 | apagado a proposito |
| **Total bruto** | **7058** | | |
| Tras deduplicar por clave normalizada | | 6473 | |
| Tras filtrar por relevancia y geografia | | **5716** | |

- **2032 keywords (36%) traen volumen medible.** Las otras 3684 quedan marcadas `sin_datos` y
  **no se descartan**: es el long tail geolocalizado donde un dominio de agosto de 2026 sin
  historial puede ganar, tal como decidio el CONTEXT.
- **4992 keywords llegan con volumen, CPC y competencia adjuntos**, porque la fuente los
  devuelve en la misma llamada que la expansion.
- 195 keywords nombran geografia de Lima (Lima, Surco, San Isidro, La Molina, Peru).

## Gasto de cuota, que es el insumo directo del presupuesto de la fase 13

| Fuente | Gastado en este plan | Saldo |
|---|---:|---|
| SerpApi | **12 busquedas** | **115 hasta el 2026-08-21** (verificado contra el endpoint de cuenta al cerrar) |
| DinoRank | 40 llamadas | sin tope medido; la clave responde 200 |

El tope de 60 nunca se alcanzo en la corrida real, y no por disciplina: DinoRank cerro el
universo antes. **Quedan 115 busquedas enteras para COMP-03**, que es 68 mas de las 47 que
proyectaba el reparto del 2026-08-10. Con 20 a 30 clusters, la fase 13 ya no necesita esperar
al reset del 21 de agosto ni subir de plan.

Ninguna semilla quedo pendiente por corte de tope en la corrida final: salio con codigo 0.

## Rendimiento real por consulta, contra lo que se habia medido

**SerpApi cumplio la proyeccion.** 12 capturas devolvieron 88 busquedas relacionadas y 48
preguntas: **11,3 candidatos por busqueda**, contra los 12 que midio la validacion del
2026-08-10. La diferencia es ruido.

**DinoRank no se comporta como se estimo, y esto es lo mas importante que aprendio este plan.**
El promedio fue de 156 relacionadas por llamada, muy por debajo de las 899 del sondeo, y el
promedio esconde lo que pasa de verdad: **el rendimiento depende del largo de la semilla.**

| Semilla | Palabras | Relacionadas |
|---|---:|---:|
| `hernia discal` | 2 | 899 |
| `clínica ricardo palma` | 3 | 287 |
| `ortopedia infantil` | 2 | 58 |
| `estenosis espinal` | 2 | 29 |
| `cirugía endoscópica de columna` | 4 | **0** |
| `artrodesis en varios niveles` | 4 | **0** |
| `casos de revisión` | 3 | **0** |

**15 de las 40 semillas devolvieron cero.** La fuente resuelve terminos cabecera, no frases.
Por eso el presupuesto de semillas subio de las 15 que proyectaba la enmienda a 40: hay que
bajar bastante en el orden de gasto para alcanzar las condiciones de una y dos palabras del
rango 4, que son las que rinden.

## Camino de datos usado

**El directo, que era el esperado.** Las dos claves estan en `.secrets/.env` y las dos
responden: SerpApi 200 y DinoRank 200 con `ok: true`. No hizo falta ningun agente ni ningun
relleno externo.

El camino de relleno queda implementado y probado igual, y hay una prueba nombrada que afirma
que **una expansion alimentada por llamada directa y una alimentada por relleno de cache
producen candidatos identicos**: aguas abajo el codigo no puede distinguir el origen. La clave
de cache la calcula siempre el CLI y `--plan-only` la emite; quien rellena la consume y nunca
la inventa.

## Verificacion del tope, hecha en vivo

Con la cache vacia para esas consultas:

```
npm run cli -- kw:expand --seeds-file data/seeds.fixture.json --max-searches 2 --yes
  -> codigo de salida 4
  -> "Quedaron 3 semillas sin procesar, de menor valor de negocio:
        - Hernia discal
        - Ortopedia infantil
        - Clínica Padre Luis Tezza"
  -> cache:stats: serpapi 2 llamadas a la red   (no 5)
```

Y despues, subiendo el tope:

```
npm run cli -- kw:expand --seeds-file data/seeds.fixture.json --max-searches 60 --yes
  -> codigo de salida 0
  -> cache:stats: serpapi 5 llamadas   (gasto solo por las 3 que faltaban)
```

El archivo de candidatos del universo bueno **no se toco** en ninguna de las dos corridas: una
corrida con `--seeds-file` distinto del snapshot desvia su salida a la cache gitignoreada.

## Criterios de aceptacion

| Criterio | Resultado |
|---|---|
| `kw:seeds` sale 0 y produce 55 o mas semillas | **66 semillas** |
| Dos corridas de `kw:seeds` dejan el archivo identico (SHA-256) | `0fab3b93…` en las dos |
| Los seis tipos de semilla representados | condicion 31, procedimiento 15, sede 8, especialidad 8, sintoma 3, pregunta 1 |
| Rangos 1 y 2 son las cuatro condiciones publicadas y las cuatro sedes, y van primero | si, y el rango 1 se deriva de los H1 de las paginas de servicio, no de una lista escrita a mano |
| Un solo archivo del tooling nombra la aplicacion | 1 (`seeds.ts`) |
| Ningun import estatico de la aplicacion | 0 |
| `candidates.jsonl` con 400 o mas lineas sin claves repetidas | **5716**, sin repetidas |
| Dos corridas de `kw:expand --offline` dejan el archivo identico (SHA-256) | `5ff50b3f…` en las dos |
| `kw:expand --offline` sin ninguna clave | codigo 0 |
| Consulta ausente en modo offline | codigo 1, mensaje con fuente, endpoint, clave y ruta esperada |
| `--plan-only` no llama a nadie e imprime `tope vigente: 60` | si, 27 consultas planificadas con su clave |
| Prueba unitaria que fija el tope por defecto en 60 | si |
| Suite completa sin ninguna clave | **93 pruebas, 93 en verde** |
| `fetch(` directo en `src/sources` | 0 |
| Credencial dentro de la cache | 0 coincidencias |
| `seo-tools/.cache` ignorada por git | si |
| `git status --porcelain -- src/` | vacio |
| Referencias a Ahrefs en el codigo | 0 |
| Expansion con datos reales corrio y supera las 450 lineas | si, 5716 |

## Desviaciones del plan

### 1. [Regla 2 - funcionalidad critica ausente] DinoRank como capa propia, con su modulo

**Encontrado en:** tarea 3, al aplicar la enmienda del 2026-08-10.
**Situacion:** el plan lista `src/sources/serpapi.ts` como la unica fuente de la tarea, porque
se escribio cuando la clave de DinoRank estaba rechazada. La enmienda convierte a DinoRank en
el motor de expansion pero no agrega el archivo.
**Que se hizo:** se creo `src/sources/dinorank.ts` con su suite propia. El plan 12-05 lo
hereda: el cliente repetible que iba a construir ya existe.
**Commit:** `80207ec`.

### 2. [Regla 2 - funcionalidad critica ausente] El filtro de geografia cubre el extranjero

**Encontrado en:** tarea 2, revisando lo que devuelve la fuente de expansion.
**Situacion:** el plan solo exige descartar las ciudades del Peru distintas de Lima. Pero
DinoRank resuelve Peru con un backend global y devuelve `hernia discal madrid`,
`operacion de hernia discal españa` e `incapacidad permanente`, que pasan el filtro de
relevancia porque contienen el termino del dominio. Un universo con esas keywords no es un
hueco de mercado: es otro sistema de salud.
**Que se hizo:** el filtro cubre ademas Espana, Mexico y el resto de la region, y las
instituciones de seguridad social de otros paises. Todo con comparacion **por palabra
completa**, porque `ciatica` contiene `ica` y un filtro por subcadena tiraria la condicion en
silencio. Hay prueba de ese caso exacto.
**Commit:** `8343e7d`.

### 3. [Regla 1 - bug] Dos defectos de la extraccion de semillas

**Encontrado en:** tarea 1, revisando el snapshot generado.
**Que estaba mal:** `Neurocirujano` salia clasificado como condicion en vez de especialidad,
y `¿Atienden a niños?` producia la semilla `niños`, que es una palabra suelta sin valor de
busqueda.
**Que se hizo:** raices de especialidad propias en el clasificador de terminos de competencia,
y minimo de dos palabras en la reduccion de titulares y preguntas. Las semillas de una sola
palabra que si valen (escoliosis, cifosis, artrosis) salen de las fuentes estructuradas, que
no pasan por esa reduccion.
**Commit:** `4c75517`.

### 4. [Regla 3 - bloqueo] `--seeds-file` se resolvia contra la raiz del repositorio

**Encontrado en:** tarea 3, al correr el criterio del tope tal como lo escribe el plan.
**Que estaba mal:** el criterio invoca `--seeds-file data/seeds.fixture.json` desde
`seo-tools/`, y la ruta se resolvia contra la raiz del repositorio, asi que el archivo no
existia y el criterio fallaba con comportamiento correcto.
**Que se hizo:** las rutas de bandera se resuelven como lo haria la shell, contra el directorio
de trabajo, con reintento contra la raiz del paquete.
**Commit:** `80207ec`.

### 5. [Decision de dimensionamiento] El presupuesto de DinoRank sube de 15 a 40 semillas

No es un bug ni una correccion: es un numero que la enmienda estimo con un sondeo de tres
consultas y que la corrida real midio distinto. Con 15 semillas el universo cerraba en 1703
candidatas; con 40 cierra en 5716, porque hay que llegar a las condiciones cortas del rango 4.
Cuesta una llamada por semilla y esta fuente no es el recurso escaso de la fase. **El orden de
gasto no cambia, solo llega mas lejos.**

## Puertas de TDD

Las tres tareas siguieron el ciclo con commits separados de rojo y de verde:

| Tarea | Rojo | Verde |
|---|---|---|
| 1. Semillas | `6779039` | `4c75517` |
| 2. Permutacion y filtros | `0b2edf1` | `8343e7d` |
| 3. Fuentes reales y tope | (las pruebas de la tarea 3 se escribieron antes de cada modulo dentro del mismo ciclo) | `80207ec` |

## Lo que la fase 13 se lleva sin pagar de nuevo

- **12 capturas completas de SERP de Lima** en `seo-tools/.cache/serpapi/`, con organicos,
  pack local, busquedas relacionadas, preguntas y AI overview. Son insumo directo de KWR-04 y
  COMP-03 y no hay que volver a pedirlas.
- **115 busquedas de SerpApi disponibles** hasta el 2026-08-21.
- **40 respuestas de DinoRank** con 6242 relacionadas y sus metricas.

## Lo que el plan 12-04 tiene que saber

1. **El universo es de 5716 keywords, no de 400.** Catorce veces lo que asumia el
   dimensionamiento original. El motor de reglas es determinista y escala sin problema, pero
   el volcado al Sheet hay que dimensionarlo de nuevo.
2. **4992 keywords ya traen volumen, CPC y competencia** en el campo `metricas`, con
   `fuente: "dinorank"`. El clasificador no las toca, pero el consolidado si tiene que
   arrastrarlas.
3. **Hay deriva de marca y de retail que la clasificacion tiene que absorber.** Las semillas
   amplias como `ortopedia` traen `ortopedia zapatos`, `ortopedia wong miraflores`,
   `clínica san bernardo especialistas en traumatología` o `arthrosalud`. Pasan el filtro de
   relevancia porque contienen el termino del dominio y son legitimas como inteligencia de
   SERP, pero no son keywords objetivo. **El eje navegacional del *Pattern 6* tiene que
   cubrirlas**, y conviene una marca explicita de fuera de alcance para el retail ortopedico,
   que no es competencia sino otro negocio.
4. **Las variantes de codificacion clinica traen volumen alto y cero valor comercial**:
   `cie-10 hernia discal` con 1600 y `artrosis cie 10` con 2400 son busquedas de personal
   administrativo, no de pacientes. Son las de mayor volumen del universo y van a encabezar
   cualquier orden por volumen: conviene clasificarlas aparte antes de que alguien las lea
   como oportunidad.

## Lo que el plan 12-05 tiene que saber

**Hay que replantear la tarea de enriquecimiento antes de ejecutarla.** Estaba dimensionada
para unos 400 POST con concurrencia limitada, uno por keyword. La realidad es que las metricas
ya vinieron en la misma llamada que la expansion: 4992 de 5716 keywords las tienen. Lo que
queda por hacer es distinto y mas chico:

- Enriquecer las 724 keywords que la permutacion y SerpApi aportaron y que DinoRank nunca
  devolvio. Ahi si hace falta una consulta, pero conviene medir si vale la pena antes de
  gastar: son en su mayoria frases inventadas por la permutacion.
- Sondear los tres endpoints que faltan (`/tfidf`, `/auditoria`, `/canibalizaciones`) y grabar
  sus fixtures. Esa parte sigue vigente y ahora puede correr, porque la clave funciona.
- El cliente repetible de DinoRank **ya existe** en `src/sources/dinorank.ts`, con parser
  tolerante y las tres trampas cubiertas por pruebas. No hay que volver a escribirlo.

## Nota sobre el paralelismo con el workstream `milestone`

Nada se escribio bajo `src/`, ni en `.planning/STATE.md`, `ROADMAP.md`, `REQUIREMENTS.md` de
la raiz, ni bajo `.planning/workstreams/milestone/`. No se toco `seo-tools/src/cli.ts` ni
`seo-tools/src/sheets/`, que son del plan 12-02, que corrio en paralelo. Cada commit se hizo
por archivo nombrado, nunca con `git add -A`.

Durante la ejecucion, la suite del paquete estuvo en rojo por las pruebas del plan 12-02 en su
fase de rojo. Al cerrar este plan la suite completa esta en verde: 93 de 93.

## Self-Check: PASSED

Archivos verificados en disco: `seo-tools/src/keywords/seeds.ts`, `permute.ts`, `expand.ts`,
`seo-tools/src/sources/serpapi.ts`, `dinorank.ts`, `seo-tools/src/commands/kw-seeds.ts`,
`kw-expand.ts`, `seo-tools/data/seeds.json`, `seeds.fixture.json`, `modifiers.json`,
`candidates.jsonl`, y los cuatro archivos de pruebas.

Commits verificados en el historial: `6779039`, `4c75517`, `0b2edf1`, `8343e7d`, `80207ec`.
