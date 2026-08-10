---
phase: 12-instrumentaci-n-de-datos-y-universo-de-keywords
workstream: seo-keywords
plan: 02
subsystem: infra
tags: [google-sheets, upsert, idempotencia, cli, typescript]

requires:
  - phase: 12-01
    provides: "cliente autenticado de Sheets, tabla de subcomandos cerrada, normalizeKeyword, volcado de encabezados reales"
  - phase: 12-03
    provides: "candidates.jsonl con el universo de 5716 keywords, que es lo que este escritor carga"
provides:
  - "Modelo declarativo de los cinco tabs del alcance, medido en vivo contra el documento del cliente"
  - "Resolucion de columnas por nombre con recorte, con la fila de encabezados como dato por tab"
  - "Escaneo de referencias de solo lectura sobre formulas y formatos condicionales"
  - "Escritor idempotente parametrizado por tab, reutilizable por las fases 13, 14 y 15"
  - "Borrado guardado de filas residuales y de columnas muertas"
  - "Subcomando sheet:push funcional"
affects: [13-clusters-competencia, 14-mapa-keyword-url, 12-04-clasificacion, 12-05-enriquecimiento]

tech-stack:
  added: []
  patterns:
    - "Puerto de lectura y escritura sobre el documento, con doble en memoria para las pruebas"
    - "Modelo declarativo en JSON: la forma del documento no vive en el codigo"
    - "Escritura por tramos de columnas contiguas, para no pisar las columnas de otras fases"

key-files:
  created:
    - seo-tools/src/sheets/schema.ts
    - seo-tools/src/sheets/schema.test.ts
    - seo-tools/src/sheets/upsert.ts
    - seo-tools/src/sheets/upsert.test.ts
    - seo-tools/data/sheet-columns.json
    - seo-tools/docs/sheet-model.md
  modified:
    - seo-tools/src/commands/sheet-push.ts

key-decisions:
  - "J-5 (nueva, de Juan): la etapa del paciente SI va como columna al Sheet, en contra de lo que proponia el plan. Encabezado Patient Stage"
  - "J-6 (nueva, de Juan): los residuos de plantilla se borran completos, casillas de verificacion incluidas"
  - "Los encabezados nuevos quedan secos y en el registro de la plantilla: CPC y Competition, sin unidades"
  - "El escritor solo toca las columnas que declara como propias: las de otras fases quedan intactas incluso al actualizar la fila"
  - "El borrado de filas y el de columnas no dependen de la validacion completa del mapeo: una operacion destructiva no puede exigir que todo lo demas este entero"

patterns-established:
  - "Fila de encabezados por configuracion: no hay un solo rango fijo a la fila 1 en todo el codigo"
  - "Clave contra valor visible: la normalizacion produce la clave de idempotencia y nunca se escribe en el documento"
  - "Ensayo por defecto en toda operacion destructiva, y el escaneo de referencias como puerta sin bandera de fuerza"

requirements-completed: [INFRA-01, SHEET-06]

coverage:
  - id: D1
    description: "Modelo declarativo de los cinco tabs con su fila de encabezados, orientacion y columna clave, verificado contra el documento en vivo"
    requirement: "INFRA-01"
    verification:
      - kind: unit
        ref: "src/sheets/schema.test.ts#el modelo declarativo cubre los cinco tabs del alcance con su forma real"
        status: pass
      - kind: integration
        ref: "npm run cli -- sheet:push --dry-run contra el documento real: los 18 encabezados resuelven sin deriva"
        status: pass
    human_judgment: false
  - id: D2
    description: "Escritor idempotente: la segunda carga del mismo conjunto no inserta ni una fila"
    requirement: "SHEET-06"
    verification:
      - kind: unit
        ref: "src/sheets/upsert.test.ts#comportamiento 2: la segunda carga del mismo conjunto no inserta ni una fila"
        status: pass
      - kind: integration
        ref: "doble en memoria con el modelo y el dataset reales de 5716 filas: segunda pasada insertadas 0, actualizadas 5716"
        status: pass
    human_judgment: false
  - id: D3
    description: "Escaneo de referencias como precondicion del borrado de columnas, corrido en vivo sobre las cuatro columnas de J-4"
    verification:
      - kind: unit
        ref: "src/sheets/upsert.test.ts#comportamiento 10: una sola referencia aborta el borrado y no se emite ninguna peticion"
        status: pass
      - kind: integration
        ref: "escaneo en vivo del 2026-08-10: las cuatro columnas limpias, 15 formulas y 0 formatos condicionales en todo el documento"
        status: pass
    human_judgment: false
  - id: D4
    description: "Carga real de las 5716 filas al documento del cliente y borrado efectivo de los residuos"
    verification: []
    human_judgment: true
    rationale: "Es una escritura destructiva sobre el documento del cliente. El plan la difiere de forma explicita al plan 04, cuando el universo este clasificado y enriquecido. El subcomando esta listo y probado en ensayo contra el documento real"

metrics:
  tasks: 3
  commits: 5
  files-created: 6
  files-modified: 1
  tests: 49
  completed: 2026-08-10

status: complete
---

# Phase 12 Plan 02: Modelo del Sheet y escritor idempotente — Summary

Escritor de Google Sheets parametrizado por tab que se ajusta a la forma real del documento del cliente, con idempotencia por clave normalizada y borrado guardado detras de un escaneo de referencias.

## Lo que se construyo

El documento del cliente no se parece a una plantilla generica de SEO, y eso definio el diseno entero. La fila 1 de cada tab es un banner decorativo, los encabezados viven en la fila 2 o en la 3 segun el tab, cinco encabezados llevan espacio final, `Internal Linking Audit` repite un mismo nombre de columna ocho veces y `Competitor Analysis` esta transpuesto. Un escritor que asuma la forma comoda no encuentra ni una columna.

**`data/sheet-columns.json`** es el modelo declarativo de los cinco tabs del alcance: nombre real, fila de encabezados, orientacion, columna clave y mapeo de campo interno hacia encabezado real, con la ruta hacia el dataset incluida. La forma del documento no vive en el codigo.

**`schema.ts`** obtiene los metadatos, lee la fila de encabezados que declara la configuracion, resuelve posiciones por nombre recortando los dos extremos, imprime el diff de cuatro listas cuando algo no calza, calcula la extension a la derecha, rechaza la escritura orientada a filas sobre un tab transpuesto y escanea referencias.

**`upsert.ts`** implementa leer, diferenciar y escribir. Escribe solo las columnas propias, agrupadas en tramos contiguos, asi que actualizar una fila no pisa `Cluster`, `URL` ni `Notes`. El borrado de filas va por bloques contiguos de mayor a menor y el de columnas detras del escaneo.

**`sheet-push.ts`** ata todo con banderas de tab, archivo de datos, extension de columnas, ensayo, borrado de filas y borrado de columnas.

## Mapeo final de `Keyword Research`

Confirmado por Juan el 2026-08-10, con el reconocimiento y el escaneo delante.

| # | Col | Encabezado real | Campo | Estado |
| --- | --- | --- | --- | --- |
| 1 | A | `Suggested Keyword` | `keyword` | fase 12 |
| 2 | B | `Cluster` | — | fase 13 |
| 3 | C | `URL` | — | fase 14 |
| 4 | D | `Search Volume` | `volume` (`metricas.searchVolume`) | fase 12 |
| 5 | E | `Traffic Potential` | — | literal `no_consultado` |
| 6 | F | `"Search Intent "` | `intent` | fase 12 |
| 7 | G | `CVR` | — | **eliminar (J-4)** |
| 8 | H | `Highest Achievable Position` | — | sin uso |
| 9 | I | `CTR` | — | sin uso |
| 10 | J | `Real Traffic Potential` | — | sin uso |
| 11 | K | `"Lead or Conversion Potential "` | — | **eliminar (J-4)** |
| 12 | L | `Keyword Difficulty` | — | literal `no_consultado` |
| 13 | M | `"Referring Domains Needed "` | — | literal `no_consultado` |
| 14 | N | `Suggested H1` | — | fase 15 |
| 15 | O | `Top Result` | — | fase 15 |
| 16 | P | `"Internal Approval "` | — | sin uso |
| 17 | Q | `"Client Approval "` | — | sin uso |
| 18 | R | `Notes` | — | sin uso |
| 19 | S | `CPC` | `cpc` (`metricas.cpc`) | **nueva (J-2)** |
| 20 | T | `Competition` | `competition` (`metricas.competition`) | **nueva (J-2)** |
| 21 | U | `Patient Stage` | `stage` | **nueva (J-5)** |

Nombres finales de las columnas nuevas: **`CPC`**, **`Competition`** y **`Patient Stage`**. Secos y en ingles, en el registro de la plantilla. `Patient Stage` lleva valores en espanol para que el doctor los lea.

## La respuesta de Juan en el checkpoint

Tres respuestas, la tercera en contra de lo que proponia el plan.

1. **Nombres secos.** `CPC` y `Competition`, sin unidades, consistente con el registro de la plantilla.
2. **Borrado de residuos completo.** Las 51 filas de `Keyword Research` y las 6 de `Content Model`. Juan vio el matiz de que 49 de esas filas solo contienen casillas de verificacion sin marcar y decidio igual: tabla limpia de entrada. Queda registrado como **J-6**.
3. **Cambio: la etapa del paciente SI va al Sheet.** Literal: *"Juan vetó tu propuesta de dejarla solo en el dataset. Agregala como columna nueva a la derecha de `Keyword Research`, junto con `CPC` y `Competition`. Quedan tres columnas nuevas, no dos."* Y la aclaracion de alcance: *"Esto no reabre la decisión J-3: sigue sin haber columnas de fuente en el Sheet. La procedencia por métrica se queda en el dataset. Lo que cambió es solo la etapa, que es un dato de negocio y no de trazabilidad."* Queda registrado como **J-5**.

## Escaneo de referencias sobre las cuatro columnas de J-4

Corrido en vivo el 2026-08-10, de solo lectura.

| Tab | Columna | Letra | Referencias bloqueantes | Veredicto |
| --- | --- | --- | --- | --- |
| `Keyword Research` | `CVR` | G | ninguna | limpia |
| `Keyword Research` | `"Lead or Conversion Potential "` | K | ninguna | limpia |
| `Content Model` | `Free Trial CVR` | N | ninguna | limpia |
| `Content Model` | `Free Trial Potential` | O | ninguna | limpia |

Contexto que explica el resultado: el documento entero tiene **15 formulas y cero formatos condicionales**. Las 15 estan en `Tech Audit` columna F y son la misma cuenta local del ICE Score (`=(C3+D3+E3)/3`). Ninguna cruza de tab.

**Cuantas se eliminaron de verdad: ninguna todavia.** El escaneo dio luz verde y el subcomando esta probado en ensayo contra el documento real, pero la ejecucion destructiva la difiere el propio plan al plan 04. Comando listo:

```bash
cd seo-tools && npm run cli -- sheet:push --tab "Keyword Research" \
  --data data/keywords.jsonl --add-missing-columns --prune --prune-columns --yes
```

El escaneo se vuelve a correr en ese momento y aborta si entre hoy y entonces aparecio una formula.

## Llamadas de red de una carga completa, medidas

Medido con el modelo y el dataset reales, 5716 registros, contra la doble en memoria:

| Carga | actualizadas | insertadas | Llamadas |
| --- | --- | --- | --- |
| Primera | 0 | 5716 | **7** |
| Segunda | 5716 | 0 | **5** |

Desglose de la primera: metadatos, fila de encabezados, escritura de los tres encabezados nuevos, lectura de la columna clave, crecimiento explicito de la grilla y dos lotes de escritura. Las 5716 filas por 9 columnas propias son 51.444 celdas, que superan por poco el tope de 50.000 por peticion y por eso son dos lotes y no uno.

Con los dos borrados activados la primera corrida suma 8 llamadas mas: 15 en total. Sigue sin crecer con la cantidad de filas, que es lo que importa.

Contra el documento real, en ensayo: 5716 registros leidos, 5716 inserciones planeadas, 3 columnas a agregar, 51 filas residuales detectadas, 2 columnas muertas con escaneo limpio.

## Filas residuales detectadas

`Keyword Research`, 51 filas. Solo dos tienen texto:

```
fila 5: F="Low"           (intencion suelta, sin keyword)
fila 6: C=" y la URL"     (fragmento en la columna URL)
```

Las otras 49, de la fila 7 a la 55, solo tienen las casillas `FALSE` de `Internal Approval` y `Client Approval`. `Content Model`, 6 filas de la 4 a la 9, todas con solo `FALSE` en `SEO Page?`.

## Deviations from Plan

### 1. [Decision de Juan] El criterio automatico de la tarea 1 quedo superado

El `<verify>` de la tarea 1 exigia que el mapeo de `Keyword Research` no contuviera las cadenas `Source`, `Stage` ni `Etapa`, como guarda de la decision J-3. **Juan agrego `Patient Stage` en el checkpoint de la tarea 2**, asi que esa guarda, tal como estaba escrita, contradice la decision del usuario.

- **Que se hizo:** la prueba se dividio en dos. Una afirma que J-3 sigue vigente y que ningun encabezado contiene `Source`, `Fuente` ni `Procedencia`. La otra afirma que `Patient Stage` existe con estado `nueva` y campo `stage`, y documenta por que no reabre J-3.
- **Por que:** la decision literal del usuario manda sobre el criterio del plan. Comprobar contra el encabezado en vez de contra el JSON serializado es ademas mas preciso: la cadena `source` en minuscula ahora aparece como ruta al dataset y no es una columna.
- **Archivos:** `seo-tools/src/sheets/schema.test.ts`, `seo-tools/data/sheet-columns.json`
- **Commit:** `2e75826`

### 2. [Redimensionamiento] El tope de llamadas de red se recalculo

El plan pedia como maximo seis llamadas para 500 filas. El universo real resulto de 5716.

- **Que se hizo:** el criterio original se conservo y se prueba (`acceptance: 500 filas se cargan en seis llamadas de red o menos`). Se agrego uno nuevo para el volumen real. El lote se parte por cantidad de celdas, no por filas.
- **Medido:** 500 filas en 6 llamadas; 5716 filas en 7.
- **Commit:** `2cd4d17`

### 3. [Rule 2 - Funcionalidad critica ausente] El escritor solo toca sus propias columnas

El plan describia escribir filas sin precisar que pasaba con las columnas de otras fases. Escribir la fila entera habria borrado `Cluster`, `URL`, `Suggested H1`, `Top Result` y `Notes` en cada actualizacion.

- **Que se hizo:** las columnas propias se agrupan en tramos contiguos y cada tramo se escribe con su propio rango. Los huecos quedan intactos. Con prueba dedicada.
- **Archivos:** `seo-tools/src/sheets/upsert.ts`
- **Commit:** `2cd4d17`

### 4. [Rule 3 - Desbloqueo] Los borrados no exigen el mapeo completo

`deleteResidualRows` y `deleteDeadColumns` no usan la validacion completa del tab. Con ella, pedir un borrado sin la bandera de extension fallaba con el diff de cuatro listas por columnas que todavia no existian, y una operacion destructiva no puede depender de que el resto del mapeo este entero. Les alcanza con la fila de encabezados y la columna clave.

## Known Stubs

Ninguno.

## Threat Flags

Ninguno. No se introdujo superficie de red, de autenticacion ni de acceso a archivos que no estuviera ya en el `<threat_model>` del plan.

## Fuera de alcance, detectado

- **`12-01-SUMMARY.md` no existe** en el directorio de la fase, aunque el codigo del plan 01 esta commiteado (`aff3418`). Conviene revisarlo al cerrar la fase.
- Durante la ejecucion, `npm test` y `npm run typecheck` a nivel de paquete fallaban por archivos de `src/keywords/` del plan 12-03, que corria en paralelo y estaba en su fase roja. Cero errores en `src/sheets/` y `src/commands/` en todo momento. **Al cerrar este plan 12-03 ya cerro y el paquete completo esta en verde: `npm run typecheck` sale con codigo 0 y `npm test` da 121 de 121.**

## Self-Check: PASSED

Archivos verificados en disco: `seo-tools/src/sheets/schema.ts`, `seo-tools/src/sheets/schema.test.ts`, `seo-tools/src/sheets/upsert.ts`, `seo-tools/src/sheets/upsert.test.ts`, `seo-tools/data/sheet-columns.json`, `seo-tools/docs/sheet-model.md`, `seo-tools/src/commands/sheet-push.ts`.

Commits verificados: `c5abc05`, `dff8d99`, `2e75826`, `1c18a6a`, `2cd4d17`.

Pruebas: 49 en `src/sheets/`, 49 pasan, sin credenciales y sin red. Guardas de `USER_ENTERED`, de agregar al final, del rango fijo a la fila 1 y de la herramienta diferida: las cuatro en cero.
