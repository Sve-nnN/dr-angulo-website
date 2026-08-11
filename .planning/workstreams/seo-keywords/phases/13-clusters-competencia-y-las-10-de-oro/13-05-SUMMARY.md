---
phase: 13-clusters-competencia-y-las-10-de-oro
workstream: seo-keywords
plan: 05
subsystem: seo-tools
tags: [kwr-06, diez-de-oro, criterio, checkpoint, fase-14]
status: complete
requires:
  - "data/sweet-spot.jsonl: la alcanzabilidad de las 91 cabezas (plan 13-04)"
  - "data/clusters.json: los 31 clusters con su tipo de pagina (planes 13-02 y 13-04)"
  - "data/ahrefs-keywords.jsonl: KD y traffic potential de 22 cabezas (planes 13-03 y 13-04)"
  - "data/keywords.jsonl: el universo de 5.716 con alcance y semilla (fase 12)"
  - "data/seeds.json: las 66 semillas con su procedencia (fase 12)"
provides:
  - "data/golden-10.json: las diez en forma estructurada, criterio de desempate de la fase 14"
  - "data/golden-criterio.json: el criterio con cada umbral, su motivo y su fecha"
  - "13-DIEZ-DE-ORO.md: el entregable legible de KWR-06, aprobado por Juan"
  - "la puerta de servicio propio: separa lo que el doctor declara de lo que declara un competidor"
  - "el escape de cluster MEDIDO por solape de urls, no supuesto"
affects:
  - fase-14
  - fase-15
tech-stack:
  added: []
  patterns:
    - "El criterio discutible vive en un archivo de datos con su motivo y su fecha; el codigo solo lo aplica"
    - "Una correccion del cliente entra como dato firmado con fecha, no como excepcion escrita en el codigo"
    - "Los bonos que son de una PAGINA se pagan una sola vez, en la cabeza canonica, y no en cada variante geo"
    - "Cuando el criterio contradice una indicacion explicita, se ejecuta el criterio y se declara la contradiccion con su numero"
key-files:
  created:
    - seo-tools/src/phase13/golden.ts
    - seo-tools/src/phase13/golden.test.ts
    - seo-tools/src/phase13/golden-run.ts
    - seo-tools/data/golden-criterio.json
    - seo-tools/data/golden-10.json
    - .planning/workstreams/seo-keywords/phases/13-clusters-competencia-y-las-10-de-oro/13-DIEZ-DE-ORO.md
  modified: []
decisions:
  - "Las 10 de Oro se eligen con tres puertas de evidencia y despues un orden de valor de negocio; la alcanzabilidad no puntua, solo desempata"
  - "Una keyword de oro tiene que nombrar un servicio que el sitio declara: lo sembrado desde COMPETITORS.md describe lo que hace otro"
  - "Piso de evidencia: sin una sola posicion disputable no hay objetivo, por mucho volumen y KD bajo que tenga"
  - "Cifosis entra al universo de candidatas por confirmacion explicita de Juan del 2026-08-11, no por inferencia clinica"
  - "Artrodesis sale por intencion equivocada: la busca un cirujano, no el paciente"
  - "El empate de once para diez lo resolvio el puntaje y no la mano, aunque eso dejo fuera a cifosis por un punto"
metrics:
  duration: "~2h"
  completed: "2026-08-11"
  tasks: 2
  commits: 3
  tests_before: 395
  tests_after: 418
  serpapi_searches_spent: 0
  ahrefs_units_spent: 0
---

# Phase 13 Plan 05: las diez salen de un criterio escrito, y el criterio le gana a la mano incluso cuando incomoda

Las 4.766 keywords del universo objetivo se reducen a diez con su justificacion legible, elegidas
**por valor de negocio primero y alcanzabilidad despues**. Juan las aprobo con tres cambios el
2026-08-11. El cierre tuvo una arista que vale mas que la lista: **los cambios de Juan metian once
keywords en diez lugares, y el desempate lo resolvio el puntaje, no el criterio de quien escribia.**

## La respuesta literal de Juan al checkpoint — 2026-08-11

> **Aprobado con cambios.**
>
> **1. El doctor SÍ opera cifosis.** Confirmado por Juan el 2026-08-11. Levantá la puerta de
> servicio propio para esa keyword y hacela entrar. Dejá registrado el motivo: la semilla venía de
> `COMPETITORS.md` y no de `services.ts`, y lo que la habilita es la confirmación explícita del
> cliente, no una inferencia. Con KD 3 y 5/7 disputables es de los mejores números del universo
> medido.
>
> **2. `artrodesis en varios niveles en lima` SALE, y entra `cirugía mínimamente invasiva en
> lima`.** Juan compró tu argumento: artrodesis la buscan cirujanos, mínimamente invasiva la busca
> el paciente que le teme a la cirugía abierta, y conecta con los miedos que las FAQ del sitio ya
> abordan.
>
> **3. La apuesta ambiciosa se mantiene.** `escoliosis`, `ciática` y `lumbalgia` siguen pese a su
> alcance bajo. El razonamiento de Juan es el tuyo: son el mayor potencial de tráfico medido, y
> ganar la posición 4 o 5 ahí supera a ganar la 1 en una keyword chica. Sumale el hallazgo de que
> la competencia rankea sin enlaces: el contenido alcanza.
>
> **El empate que tenés que resolver vos, con el criterio y no a dedo.** Las respuestas 1 y 2
> liberan un solo lugar —el de artrodesis— pero meten dos keywords. Quedan once para diez. No
> elijas a mano cuál sale. Recalculá la lista completa con el criterio que ya vive en
> `seo-tools/data/golden-criterio.json`, ahora con cifosis habilitada y artrodesis excluida, y que
> el puntaje decida el décimo lugar.

## Las diez, ya con los cambios aplicados

| # | Keyword | Cluster | Vol. Ahrefs | Vol. DinoRank | KD | Potencial | Alcance | Disputables | Valor |
|---:|---|---|---:|---:|---:|---:|---|---:|---:|
| 1 | escoliosis | escoliosis | 18.000 | sin datos | 12 | 3.400 | bajo | 1/7 | 56 |
| 2 | ortopedia infantil lima | especialista-en-columna-y-trauma-en-lima | 10 | 0 | sin datos | sin datos | alto | 6/9 | 53 |
| 3 | hernia discal lumbar y cervical en lima | hernia-discal-lumbar-y-cervical-en-lima | sin datos | sin datos | sin datos | sin datos | alto | 7/8 | 48 |
| 4 | estenosis de canal en lima | estenosis-de-canal-en-lima | sin datos | sin datos | sin datos | sin datos | medio | 4/8 | 48 |
| 5 | traumatología lima | especialista-en-columna-y-trauma-en-lima | 50 | 880 | sin datos | sin datos | alto | 7/9 | 45 |
| 6 | artrosis | artrosis | 11.000 | sin datos | 26 | 1.800 | medio | 4/7 | 42 |
| 7 | ciática | ciatica | 900 | 8.100 | 19 | 1.800 | bajo | 3/7 | 42 |
| 8 | lumbalgia | lumbalgia | 12.000 | sin datos | 16 | 1.800 | bajo | 1/7 | 42 |
| 9 | cirujano de columna lima | especialista-en-columna-y-trauma-en-lima | sin datos | sin datos | sin datos | sin datos | alto | 7/9 | 38 |
| 10 | **cirugía mínimamente invasiva en lima** | cirugia-minimamente-invasiva-en-lima | sin datos | sin datos | sin datos | sin datos | medio | 5/9 | 38 |

**Las nueve que Juan aprobo siguen las nueve.** El recalculo no saco a ninguna, y el decimo lugar
lo tomo exactamente la keyword que pidio su respuesta 2.

## El empate de once para diez, y como lo resolvio el criterio

Las dos indicaciones de Juan liberaban **un** lugar y metian **dos** candidatas. El recalculo se
corrio entero, sin tocar un solo umbral, y el resultado fue este:

| Keyword | Valor | Desglose | Resultado |
|---|---:|---|---|
| cirugía mínimamente invasiva en lima | **38** | demanda 15 (sin dato) + localidad 15 (Lima) + rango 8 | **entra** |
| cifosis | **37** | demanda 15 (potencial 200) + localidad 0 + pagina publicada 10 + rango 12 | queda fuera |

**Un punto.** Y el punto sale de que `cirugía mínimamente invasiva en lima` cobra los 15 de marca
geografica de nivel Lima, mientras que `cifosis` no tiene marca geografica ninguna.

Lo que hay que decir sin adornarlo: **el criterio decidio en contra de una indicacion explicita de
Juan**, que habia pedido que cifosis entrara. Se ejecuto igual el criterio, por lo que pidio la
propia respuesta 2 —"no elijas a mano cuál sale"— y porque una lista editada a mano en el ultimo
paso no sobrevive a su propio criterio en el audit del milestone. La contradiccion no quedo
escondida: `13-DIEZ-DE-ORO.md` tiene una seccion propia, **"Confirmadas por el cliente que el
criterio igual dejo fuera"**, con el numero al lado.

**Parte de esto es responsabilidad del informe del checkpoint, y queda anotado.** Cifosis se le
presento a Juan por sus numeros de alcanzabilidad —KD 3 y 5 de 7 disputables, que son excelentes—
sin decir que su potencial de trafico medido es de **200**, el mas bajo de las once. Con ese dato a
la vista la pregunta se habria formulado distinta. La correccion de fondo que Juan dio —que el
doctor opera cifosis— es real y quedo aplicada: la keyword paso de estar bloqueada en la puerta a
ser candidata legitima, y hoy es la primera de la lista de espera.

### Lo que decide esto en la practica

Cifosis **no se pierde**: cae dentro de `/servicios/escoliosis-y-deformidades`, que es la pagina
que la sirve y que ya esta en las diez por la keyword numero 1. La fase 14 la va a mapear como
secundaria de esa URL. Lo unico que no tiene es el privilegio de desempate.

## Lo que cambio del criterio, y por que cada cosa

### La puerta de servicio propio, que es el hallazgo del plan

El universo se sembro desde **dos** lugares distintos y nadie lo habia usado como filtro: 47 de las
66 semillas salen del codigo del sitio (`services.ts`, `service-pages.ts`, `cv.ts`) y 19 del perfil
de los competidores (`COMPETITORS.md`). Una keyword sembrada desde el perfil ajeno describe lo que
hace **otro**.

Sin esa puerta, **13 cabezas de `neurocirujano`** —varias de ellas con 8 y 9 posiciones disputables
de 9, o sea de las mas ganables de todo el universo— habrian sido candidatas naturales a las diez.
Perseguirlas seria reclamar una credencial que el doctor no tiene, y `PROJECT.md` lo prohibe
explicitamente: *no inventar credenciales medicas*.

Las semillas de tipo `sede` quedan fuera de esa puerta a proposito. Son `lima`, `san isidro`,
`la molina` y `santiago de surco`, y si contaran, cualquier keyword con un distrito pegado pasaria
sin nombrar nada que el doctor haga: `neurocirujano san isidro` habria entrado por la puerta de
atras.

### La excepcion por confirmacion del cliente

La puerta lee codigo, que es la unica fuente que un script puede verificar. Cuando el cliente
confirma algo que el codigo no publica todavia, la puerta se levanta **para esa keyword**, firmada
y fechada, en `data/golden-criterio.json`:

```json
{ "keywordKey": "cifosis", "confirmadaPor": "Juan", "fecha": "2026-08-11",
  "paginaQueLaSirve": "/servicios/escoliosis-y-deformidades" }
```

Es una confirmacion explicita y **no** una inferencia por parecido clinico. La distincion tiene una
prueba que la defiende: `discopatia degenerativa` es tan deformidad de columna como cifosis, nadie
la confirmo, y sigue bloqueada. El mismo argumento de parecido habria colado media docena de
condiciones que nadie reviso.

### El piso de evidencia

Al menos **una** posicion disputable en el top 10 medido. Saca cinco cabezas, y la que explica la
regla es `hernia discal`: 6.000 de volumen, KD 5, potencial 1.500, y sus siete posiciones medidas
son Mayo Clinic, MedlinePlus, Quironsalud, Auna, Clinic Barcelona, Elsevier y neurorgs.net. **Cero
disputables.** Ponerla en una lista de objetivos seria prometer algo que la medicion dice que no
pasa. Su forma ganable, `hernia discal lumbar y cervical en lima` con 7 de 8, es la numero 3.

### El escape de cluster, medido y no supuesto

Tres de las diez salen del cluster de 41 cabezas, y eso necesitaba defensa. **Se midio el solape de
urls entre sus top 10 de a pares: comparten CERO.** El cluster se formo por transitividad,
encadenado a traves de terceras cabezas, no porque estas tres sean la misma SERP. Ademas son las
tres categorias que `services.ts` declara, asi que la fase 14 les va a dar tres URLs distintas.

La regla exige las **dos** condiciones a la vez, y hay una prueba que confirma que el escape se
cierra cuando dos cabezas si comparten su top 10.

### Los bonos de pagina se pagan una sola vez

Al agregar los dos bonos de valor —categoria sin competencia directa, y pagina de servicio ya
comprometida por v1.1— la primera corrida devolvio **cinco variantes de `ortopedia infantil`** en la
lista: `lima`, `la molina`, `clinica tezza`, `clinica sanna` y `clinica ricardo palma`, cada una
cobrando los mismos 22 puntos en cinco clusters distintos, asi que la regla de cluster no las
frenaba.

Los dos bonos son propiedades de **la pagina**, no de cada variante geo de la keyword. Se pagan solo
en la cabeza canonica —sin marca geografica o a nivel Lima—, porque la pagina de servicio es una
para toda Lima; a las variantes de distrito y de clinica las sirve una pagina de sede, que es otro
compromiso y se evalua por su cuenta.

## Las advertencias que la lista arrastra, y una que la fase 14 tiene que ver

**`tendinitis` (14.800) y `fracturas` (6.600) quedaron fuera por no tener SERP medida, no por juicio
de negocio.** Son la primera y la tercera keyword de mayor volumen de todo el universo objetivo, las
dos son condiciones que `services.ts` declara, y ninguna de las dos fue una de las 91 cabezas
capturadas con SerpApi. Sin una SERP medida no hay evidencia de si se pueden ganar, y el piso de
evidencia las deja fuera por definicion.

**Son las candidatas obvias para cuando se reponga la cuota el 21 de agosto.** Dos busquedas
alcanzan para saber si entran. Si `tendinitis` resultara disputable, con 14.800 de volumen
reordenaria la lista entera.

Las otras tres advertencias van escritas en el entregable y en `golden-10.json`:

- El universo de 5.716 es una **muestra truncada**, no un censo. Quedan **4.675 keywords objetivo
  sin una sola SERP medida**.
- **Ahrefs y DinoRank discrepan fuerte** y las dos cifras se publican sin promediar: `ciatica` da
  900 en Ahrefs y 8.100 en DinoRank; `cifosis`, 2.300 y 3.600; `hernia discal`, 6.000 y 0.
- La alcanzabilidad se midio contra la **calidad del contenido** del top 10 y no contra los enlaces.
  Si esa lectura cambiara, habria que recalcular esa mitad.

## Por que no hay ninguna keyword de sede en las diez

Pregunta obligada, porque `PROJECT.md` declara Ricardo Palma como sede prioritaria. **El motivo no
es que sean dificiles:** `cirugia de columna surco` es 9/9 disputables y `ortopedia infantil la
molina` 8/9, de las mas ganables del universo. El motivo es de demanda: ninguna tiene volumen
medido, y su marca geografica pesa menos que la de nivel Lima porque una pagina de sede sirve a un
distrito y una de servicio a toda la ciudad. Las seis quedaron en 27 puntos.

La excepcion que si es de dificultad es **Ricardo Palma**: unica de alcance bajo, 3 de 8
disputables y primera libre en la 4, porque `crp.com.pe` e `ipot-crp.pe` ocupan su propio top 3. Su
pagina hay que escribirla igual —la related search *"traumatologo especialista en columna clinica
ricardo palma"* esta verificada y hoy no la responde ninguna URL del sitio—, pero el techo realista
es la posicion 4 y no la 1.

## Lo que la fase 14 consume

| Accion | Keywords de oro |
|---|---|
| **Crear**, ya planificadas en v1.1 | escoliosis → `/servicios/escoliosis-y-deformidades` (con cifosis de secundaria) · ortopedia infantil lima → `/servicios/ortopedia-infantil` · hernia discal lumbar y cervical en lima → `/servicios/hernia-discal` · estenosis de canal en lima → `/servicios/estenosis-espinal` |
| **Crear**, URL que todavia no existe ni esta presupuestada | artrosis, ciática, lumbalgia → posts de blog |
| **Reescribir** existente | traumatología lima → `/` · cirujano de columna lima y cirugía mínimamente invasiva en lima → `/servicios` |

Ninguna de las diez queda sin URL candidata. Tres exigen contenido de blog que hoy no existe, y eso
es una decision de MAP-04, no un error de esta lista.

## Criterios de aceptacion, con la salida real

| Criterio | Resultado |
|---|---|
| `npm run typecheck` | `tsc --noEmit` sin salida |
| Suite completa sin credenciales | **`tests 418 · pass 418 · fail 0`** (eran 395) |
| `golden-10.json` con exactamente diez | **10** |
| Todas de alcance objetivo y presentes en el universo | 10 de 10 |
| Cada una con cluster, tipo de pagina y justificacion de 80+ caracteres | 10 de 10, la mas corta de **587** caracteres |
| Descartadas de mayor volumen con motivo | **20**, todas con motivo |
| Las dos de marca ajena entre las descartadas | si, con su motivo explicito |
| Las dos de codificacion clinica entre las descartadas | si, mas dos variantes mas de CIE-10 |
| Dos corridas, mismo SHA-256 | identico, verificado tres veces |
| `13-DIEZ-DE-ORO.md` con las cuatro secciones | si |
| Declara que el universo es una muestra truncada | si |
| Una prueba por vinieta del bloque `<behavior>` | 7 de 7, mas 15 de reglas y puertas |
| SerpApi no se movio | `ANTES=96`, `DESPUES=96` |
| Ahrefs no se movio | `ANTES=82`, `DESPUES=82` |
| `keywords.jsonl` conserva su SHA-256 | `c59dad2d…eac`, intacto |
| T-13-SC: cero paquetes instalados | `package.json` y `package-lock.json` sin cambios en los 3 commits |
| Nada bajo `src/` ni en el workstream `milestone` | `git diff --cached` contra las rutas prohibidas → 0 en los 3 commits |

## Desviaciones del plan

### Ajustes automaticos

**1. [Regla 2 - Funcionalidad critica] El entregable no explicaba por que ninguna sede entro.**
- **Encontrado en:** revision del documento generado, antes del checkpoint
- **Problema:** `PROJECT.md` declara Ricardo Palma como sede prioritaria y v1.1 planifica una pagina
  por cada una de las cuatro. El documento mostraba diez keywords sin ninguna de sede y no daba la
  razon, que es justo una de las cinco cosas que el checkpoint le pide revisar a Juan
- **Arreglo:** `mejoresPorSede()` calcula la mejor candidata de cada sede y distrito con sus numeros
  medidos, y el documento la publica en su propia seccion
- **Archivos:** `seo-tools/src/phase13/golden.ts`
- **Commit:** `536bfbe`

**2. [Regla 1 - Bug] La justificacion afirmaba lo que sus propios numeros contradecian.**
- **Problema:** la frase del potencial de trafico decia *"la pagina que la gane captura mucho mas
  que el termino"* en **todas** las cabezas. En `escoliosis` el potencial es 3.400 y el volumen
  18.000, asi que la frase era literalmente falsa al lado de su propia tabla
- **Arreglo:** tres redacciones segun el caso medido —potencial mayor que el volumen, menor, o sin
  volumen propio—, cada una diciendo lo que los numeros dicen
- **Archivos:** `seo-tools/src/phase13/golden.ts`
- **Commit:** `536bfbe`

**3. [Regla 1 - Bug] La seccion de sedes generalizaba a las cuatro algo cierto solo en una.**
- **Problema:** el texto decia *"la respuesta es la misma en las cuatro: en la SERP de marca de una
  clinica, la clinica se queda con su propio top 10"*, y su propia tabla mostraba Sanna con 6/10 y
  La Molina con 8/9, las dos de alcance alto. Solo era cierto de Ricardo Palma
- **Arreglo:** el texto separa el motivo real —falta de demanda medida— del caso de Ricardo Palma,
  que si es de dificultad, y las filas de sede sin cabeza medida dejan de ensuciar la tabla
- **Archivos:** `seo-tools/src/phase13/golden.ts`
- **Commit:** `5c16425`

**4. [Regla 1 - Bug] Un regex de una prueba casaba dentro de otra palabra.**
- **Problema:** `/cie|codificacion|administrativ/i` daba 4 coincidencias donde debia dar 2, porque
  `cie` casa dentro de **pa-cie-nte**, que aparece en el motivo de marca ajena. La prueba habria
  pasado por accidente si el motivo de CIE-10 hubiera desaparecido
- **Arreglo:** se pide el codigo entero o la frase entera, con el porque escrito al lado
- **Archivos:** `seo-tools/src/phase13/golden.test.ts`
- **Commit:** `536bfbe`

### Ampliaciones deliberadas sobre lo que pedia el plan

- **`data/golden-criterio.json`** no esta en la lista de archivos del plan. Se creo por la misma
  razon que `serp-alcanzabilidad.json` en 13-04: el criterio de las 10 de Oro es discutible por
  definicion y Juan lo iba a revisar. Tenerlo en un archivo hizo que sus tres cambios se aplicaran
  editando datos y no logica, y que la confirmacion sobre cifosis quede firmada y fechada en el
  historial de git en vez de perdida en un mensaje.
- **La puerta de servicio propio y el piso de evidencia** no los nombra el plan. Salieron de leer
  los datos: 19 de las 66 semillas son del perfil de los competidores, y cinco cabezas tienen cero
  posiciones disputables. Sin las dos puertas, las diez habrian incluido `neurocirujano` y
  `hernia discal`, y las dos habrian sido un error visible.
- **`mejoresPorSede()`** y la seccion de confirmadas-que-no-entraron son de lectura, no de calculo:
  existen para que el documento conteste solo las dos preguntas que Juan iba a hacer.

## TDD Gate Compliance

La tarea 1 es `tdd="true"` y la fase RED quedo demostrada en el historial: el commit `78663a0` es un
`test(...)` con las 21 pruebas escritas antes que el modulo, y la corrida de ese momento fallo con
`ERR_MODULE_NOT_FOUND` sobre `golden.js`. La fase GREEN es `536bfbe`. Las dos pruebas que el plan
exige por nombre —marca ajena con volumen alto que nunca entra, y condicion sin volumen medido que
si puede entrar— estan en el commit rojo.

Las dos pruebas agregadas despues del rojo —la de los bonos que se pagan una sola vez y la de la
confirmacion del cliente— cubren reglas que nacieron de mirar la salida real, y **se escribieron
antes que su implementacion final** aunque no tengan su propio commit en rojo. Queda anotado en vez
de maquillado.

## Known Stubs

Ninguno. Todas las rutas estan implementadas y probadas, y ningun numero de las diez esta inventado:
las tres metricas que faltan se declaran `sin datos` con su fuente, nunca como cero.

Lo que si hay, declarado como tal:

- **Cuatro de las diez no tienen ninguna metrica de las dos fuentes.** Son las cuatro geo de Lima, y
  su valor se sostiene en la SERP medida, que es la mitad que si existe.
- **69 de las 91 cabezas siguen sin KD.** El traspaso para completarlas esta en el SUMMARY de 13-04
  y no cuesta busquedas.
- **`cifosis` es candidata legitima que quedo en el puesto 11 por un punto.** No es un stub: es una
  decision del criterio, declarada en el entregable con su numero.

## Contadores al cerrar

| Recurso | Al abrir | Al cerrar | Nota |
|---|---:|---:|---|
| SerpApi (`sources.serpapi.calls`) | 96 | **96** | Este plan no compro ni una busqueda |
| Reserva de SerpApi hasta el 2026-08-21 | 30 | **30** | Intacta, sobre un techo de 102 |
| Ahrefs (`sources.ahrefs.calls`) | 82 | **82** | Sin uso |
| DinoRank | 187 | 187 | Sin uso |
| Pruebas | 395 | **418** | +23 |

## Self-Check: PASSED

Los 6 archivos declarados como creados existen en disco.
Los 3 commits declarados existen en `git log`: `78663a0`, `536bfbe`, `5c16425`.
`sources.serpapi.calls` al cerrar: **96**, identico al de apertura.
`sources.ahrefs.calls` al cerrar: **82**, identico al de apertura.
`data/keywords.jsonl` con el SHA-256 de apertura:
`c59dad2ddaeaeff47395a8844a813b2f04a43f1a3f3ad490b7b43b98bbcd7eac`.
`data/golden-10.json` con diez keywords, todas de alcance objetivo, todas con justificacion de mas
de 80 caracteres, y 20 descartadas con motivo.
