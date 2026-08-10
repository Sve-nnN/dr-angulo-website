---
phase: 12-instrumentaci-n-de-datos-y-universo-de-keywords
workstream: seo-keywords
plan: 04
subsystem: clasificacion y consolidacion del universo de keywords
tags: [keywords, clasificacion, intencion, etapa-del-paciente, determinismo, google-sheets, idempotencia]

requires:
  - phase: 12-02
    provides: "escritor idempotente parametrizado por tab, modelo declarativo de columnas, borrado guardado detras del escaneo de referencias"
  - phase: 12-03
    provides: "candidates.jsonl con las 5716 candidatas y las metricas de DinoRank adjuntas"
provides:
  - "Motor determinista de intencion y etapa, sin ninguna llamada de red"
  - "Tercer eje de alcance que separa la deriva del universo real de las keywords objetivo"
  - "Residuo ambiguo resuelto y congelado en un archivo commiteado"
  - "keywords.jsonl: dataset consolidado del milestone con esquema completo"
  - "Tab Keyword Research del Sheet del cliente cargado con las 5716 filas"
  - "SHEET-06 cerrado contra el documento real"
affects: [12-05-enriquecimiento, 13-clusters-competencia, 14-mapa-keyword-url, 15-contenido]

tech-stack:
  added: []
  patterns:
    - "Patrones en archivo de datos y no en el codigo: la fase 13 los afina sin tocar la logica ni las pruebas"
    - "Anulacion consultada ANTES de las reglas: es lo que congela la decision y mantiene estable la reejecucion"
    - "Coincidencia por palabra completa con el texto rodeado de espacios, nunca por subcadena"
    - "Eje de alcance ortogonal a intencion y etapa: marca la deriva sin descartarla ni cambiar su clasificacion"

key-files:
  created:
    - seo-tools/src/keywords/classify.ts
    - seo-tools/src/keywords/classify.test.ts
    - seo-tools/data/intent-rules.json
    - seo-tools/data/intent-overrides.json
    - seo-tools/data/keywords.jsonl
  modified:
    - seo-tools/src/commands/kw-classify.ts
    - .planning/workstreams/seo-keywords/data/sheet-headers.json

key-decisions:
  - "Tercer eje de alcance, no previsto por el plan: el universo real trae deriva veterinaria, academica, de retail, de codificacion clinica, de geografia ajena, de sector publico y de marca ajena que ninguna de las cuatro intenciones separa"
  - "La etapa por defecto es diagnostico y no sintoma: una keyword pelada como hernia discal es alguien que ya tiene el nombre de lo que le pasa"
  - "La combinacion marca mas termino clinico resuelve a transaccional para CUALQUIER marca, propia o ajena: la intencion de la persona es la misma y de quien es la marca se registra en el eje de alcance"
  - "El archivo de anulaciones registra solo lo que la revision resolvio DISTINTO de las reglas: una anulacion redundante congela un no-cambio y le prohibe a la fase 13 mejorar la regla que la produjo"

patterns-established:
  - "Los refuerzos del nivel por defecto no reclasifican nada: solo distinguen resolucion explicita de resolucion por descarte, y esa distincion es la que define el residuo"
  - "Calibrar las reglas contra el residuo medido, no contra el residuo imaginado"

requirements-completed: [KWR-01, KWR-03, SHEET-06]

coverage:
  - id: D1
    description: "Cada keyword del universo tiene una de las cuatro intenciones y una de las tres etapas, asignadas por un motor determinista"
    requirement: "KWR-03"
    verification:
      - kind: unit
        ref: "src/keywords/classify.test.ts, 28 pruebas sobre 36 keywords reales del universo"
        status: pass
      - kind: integration
        ref: "kw:classify sobre las 5716 candidatas: 5716 clasificadas, cero sin intencion o sin etapa"
        status: pass
    human_judgment: false
  - id: D2
    description: "La clasificacion es determinista: dos corridas producen salida identica y ninguna invoca un modelo"
    requirement: "KWR-03"
    verification:
      - kind: unit
        ref: "src/keywords/classify.test.ts#comportamiento 10"
        status: pass
      - kind: integration
        ref: "dos corridas de kw:classify --dry-run con diff -q limpio; keywords.jsonl con el mismo SHA-256 en dos generaciones"
        status: pass
    human_judgment: false
  - id: D3
    description: "El residuo ambiguo se resolvio una sola vez y quedo congelado en un archivo commiteado que las reglas consultan primero"
    requirement: "KWR-03"
    verification:
      - kind: unit
        ref: "src/keywords/classify.test.ts#comportamiento 9 (prioridad, origen manual y no evalua reglas)"
        status: pass
      - kind: integration
        ref: "38 anulaciones cargadas; los 30 empates de especificidad quedaron en cero"
        status: pass
    human_judgment: false
  - id: D4
    description: "Las tres metricas diferidas llevan el valor literal no_consultado en el cien por ciento del universo"
    verification:
      - kind: integration
        ref: "bloque de verificacion del plan sobre las 5716 lineas de keywords.jsonl: cero excepciones"
        status: pass
    human_judgment: false
  - id: D5
    description: "Dos cargas seguidas sobre el tab Keyword Research dejan la misma cantidad de filas"
    requirement: "SHEET-06"
    verification:
      - kind: integration
        ref: "contra el documento real: primera carga 0 actualizadas y 5716 insertadas; segunda 5716 actualizadas y 0 insertadas; 5716 filas con clave antes y despues"
        status: pass
    human_judgment: false
  - id: D6
    description: "Juan abre el Sheet y ve el universo cargado sin haber tocado el archivo"
    verification:
      - kind: integration
        ref: "lectura de vuelta de filas 3 a 12, 118, 605, 697 y 3850 con los tres modos de renderizado"
        status: pass
    human_judgment: true
    rationale: "El criterio final es que Juan lo mire. Lo verificable de forma automatica ya esta: encabezados intactos, tildes conservadas, numeros como numeros, cero formulas y columnas de otras fases vacias"

metrics:
  duration: "~3 h"
  completed: 2026-08-10
  tasks: 3
  commits: 4
  tests: 149
  universo: 5716
  anulaciones: 38
  llamadas_de_red_sheets: 48

status: complete
---

# Phase 12 Plan 04: Clasificacion, dataset consolidado y primera carga real — Summary

Las 5716 keywords del universo quedaron clasificadas por intencion y etapa con un motor de
reglas que no llama a nadie, consolidadas en un dataset commiteado con el esquema completo, y
cargadas en el tab `Keyword Research` del Sheet del cliente. La idempotencia de SHEET-06 quedo
probada contra el documento real, no contra una doble.

## Distribucion del universo

### Por intencion

| Intencion | Universo | % | Solo las de alcance objetivo |
| --- | ---: | ---: | ---: |
| `informacional` | 3509 | 61,4 % | 2867 |
| `comercial` | 1606 | 28,1 % | 1493 |
| `transaccional` | 529 | 9,3 % | 400 |
| `navegacional` | 72 | 1,3 % | 6 |
| **Total** | **5716** | | **4766** |

La columna de la derecha es la que importa para la fase 13: `navegacional` cae de 72 a 6 porque
casi toda la busqueda de marca del universo es de marca AJENA, y el eje de alcance la separa.

### Por etapa del paciente

| Etapa | Universo | % | Solo objetivo |
| --- | ---: | ---: | ---: |
| `sintoma` | 418 | 7,3 % | 405 |
| `diagnostico` | 3998 | 69,9 % | 3229 |
| `decision` | 1300 | 22,7 % | 1132 |

El defecto de la etapa es `diagnostico` y eso explica su peso. Es una decision explicita, no un
artefacto: una keyword pelada como `hernia discal` es alguien que ya tiene el nombre de lo que
le pasa, que es la definicion literal de esa etapa en el research.

### Por origen de la intencion

| Origen | Cantidad | % |
| --- | ---: | ---: |
| `reglas` | 5678 | 99,3 % |
| `llm` | 38 | 0,7 % |

La columna toma exactamente esos dos valores en todo el archivo. El tercero, el que aportaba la
fuente de dificultad, se fue con la decision de Juan del 2026-08-10.

## El tercer eje: alcance

**Esto no estaba en el plan y es lo mas util que produjo la ejecucion.** El plan 12-03 ya habia
avisado de la deriva de marca y de retail. Al clasificar el universo completo aparecio que la
deriva es mucho mayor y de siete clases distintas: 950 keywords, el 16,6 % del universo, llegan
por contener un termino del dominio pero no son demanda que este consultorio pueda atender.

| Motivo | Cantidad | Que es |
| --- | ---: | --- |
| `objetivo` | 4766 | Demanda real del negocio |
| `profesional_academico` | 234 | Congresos, cursos, libros, residentado, instrumental. Colegas y estudiantes |
| `veterinario` | 179 | La hernia discal canina, que en la SERP hispana es un tema enorme |
| `marca_ajena` | 130 | Competidores, clinicas donde el doctor no atiende, comercios |
| `codificacion_clinica` | 106 | Variantes de CIE-10. Personal administrativo facturando |
| `geo_ajena` | 92 | Plazas que el filtro del plan 03 no atrapo porque venian dentro del nombre de una tienda o un hospital extranjero |
| `sector_publico` | 71 | Hospital publico, posta, seguro estatal, atencion gratuita |
| `otra_especialidad` | 62 | Ortopedia dental y maxilar, ortodoncia, podologia |
| `retail_ortopedico` | 53 | Venta de producto ortopedico |
| `administrativo` | 23 | Incapacidad, invalidez, indemnizacion, descanso medico |

**Ninguna se descarta.** Se marcan, y el campo se queda en el dataset: no tiene columna en el
Sheet y no se agrego ninguna, coherente con J-3.

Las dos trampas que el plan 12-03 anticipo quedaron cubiertas:

- `artrosis cie 10` (2400 de volumen, el mas alto del universo) y `cie-10 hernia discal` (1600)
  resuelven a `informacional` / `diagnostico` y **quedan marcadas `codificacion_clinica`**. Hay
  una prueba nombrada que afirma que jamas pueden salir con etapa `decision`.
- `clinica san bernardo especialistas en traumatologia` (2400) y
  `clinica de traumatologia arthrosalud` (1600) resuelven a `transaccional` / `decision` y
  quedan marcadas `marca_ajena`. Antes de la ultima calibracion salian como `informacional`,
  que era la lectura mas equivocada posible de las dos keywords de mayor volumen del universo.

## El residuo ambiguo

| Momento | Residuo | % del universo |
| --- | ---: | ---: |
| Primera corrida, reglas del *Pattern 6* tal cual | 1353 | 23,7 % |
| Tras calibrar el vocabulario contra el residuo medido | 768 | 13,4 % |
| Tras la calibracion final (marcas, geo de Lima, tramites, academico) | 747 | 13,1 % |
| **Tras aplicar las 38 anulaciones** | **709** | **12,4 %** |

12,4 % cae dentro de la banda de 8 a 15 % que estimo el research. El criterio de aceptacion pone
el techo en 30 %: las anulaciones son el 0,7 % del universo y el residuo total el 12,4 %, los dos
holgadamente por debajo.

### Como se resolvio, y que quedo sin anular

Las 747 se revisaron una por una, en cuatro lotes ordenados por volumen. El resultado:

- **Los 30 empates de especificidad quedaron en cero.** Son los que el research nombra como el
  residuo que si necesita un modelo, y estan los 30 en el archivo de anulaciones. Dos se
  resolvieron **distinto** de las reglas: `donde estudiar traumatologia en peru`, que las reglas
  leian como transaccional por nombrar el pais y que es una consulta academica, y las dos
  variantes de `corrector de postura ortopedia wong`, cuya etapa las reglas ponian en `sintoma`
  por la palabra postura cuando la persona ya eligio tienda y producto.
- **8 anulaciones mas sobre casos sin senal** donde la revision difiere de las reglas: las dos
  variantes de `miedo a operarme de la columna` (etapa `decision`, no `diagnostico`: a quien
  escribe eso ya le propusieron una cirugia), `correccion de escoliosis y deformidades` y
  `reconstruccion tras fracturas complejas` (nombran el procedimiento, no la condicion),
  `solucion a hernia discal`, `terapias para hernia discal`, `artrosis de rodilla especialista` y
  `centro especializado de traumatologia y columna`.
- **709 quedaron deliberadamente sin anular.** Para todas ellas la revision **coincide** con lo
  que dan las reglas: son el long tail informacional de las condiciones (`artrosis primaria y
  secundaria`, `desgarro muscular en la espalda alta`, `cifosis dorsal en ancianos`) y nombres
  propios de tiendas, hospitales y material academico que ninguna lista razonable puede cerrar
  (`ortopedia estomba 500 bahia blanca`, `campbell traumatologia 13 edicion`).

**Por que no se anularon igual, si eso dejaria el residuo en cero.** Porque la anulacion gana
SIEMPRE sobre las reglas. Escribir 709 entradas que repiten lo que las reglas ya calculan no
congela una decision: congela un no-cambio, y le prohibe a la fase 13 mejorar cualquier regla
que afecte a esas claves. El costo de dejarlas es cosmetico, un contador que no llega a cero.
El costo de anularlas seria estructural.

Lo que la marca `ambiguo` significa en el dataset, entonces, es exactamente esto: *la resolvio
el nivel por defecto y no un patron*. Es una senal de confianza para la fase 13, no un pendiente.

## Carga en el Sheet del cliente

Documento `1aowectbAJhyyZWhwQ6N_re-ENeSENvNN-5DebqCIls0`, tab `Keyword Research`.

### Las dos cargas, medidas contra el documento real

| | actualizadas | insertadas | filas eliminadas | columnas agregadas | columnas eliminadas | llamadas |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Primera** | 0 | **5716** | 51 | 3 | 2 | 17 |
| **Segunda**, sin cambiar nada | **5716** | **0** | 0 | 0 | 0 | 10 |

**Conteo de filas del tab, medido leyendo el documento:**

| Momento | Filas con contenido | Filas con clave | Grilla | Encabezados |
| --- | ---: | ---: | --- | ---: |
| Antes de la carga | 51 | 0 | 981 x 30 | 18 |
| Despues de las dos cargas | 5716 | 5716 | 5719 x 28 | 19 |

**Los dos numeros que cierran SHEET-06: 5716 filas con clave despues de la primera carga y 5716
despues de la segunda.** La segunda reporto `insertadas: 0` y `filas eliminadas: 0`.

Antes de ejecutar la segunda carga real se corrio su ensayo, que ya anticipaba
`actualizadas: 5716 / insertadas: 0`. Se ejecuto igual, porque el criterio pide medir contra el
documento y no contra un calculo.

### Columnas del tab despues de la carga

19 encabezados. Las 16 preexistentes que sobreviven **conservan su nombre exacto, su espacio
final donde lo tenian y su posicion relativa**, verificado con `sheet:inspect`:

```
Suggested Keyword | Cluster | URL | Search Volume | Traffic Potential | "Search Intent " |
Highest Achievable Position | CTR | Real Traffic Potential | Keyword Difficulty |
"Referring Domains Needed " | Suggested H1 | Top Result | "Internal Approval " |
"Client Approval " | Notes | CPC | Competition | Patient Stage
```

Las tres nuevas de la derecha, con los nombres que aprobo Juan: **`CPC`**, **`Competition`** y
**`Patient Stage`**, esta ultima con encabezado en ingles y valores en espanol
(`sintoma`, `diagnostico`, `decision`).

La fase 12 escribe 9 columnas: 6 con dato (`Suggested Keyword`, `Search Volume`,
`Search Intent `, `CPC`, `Competition`, `Patient Stage`) y 3 con el literal `no_consultado`
(`Traffic Potential`, `Keyword Difficulty`, `Referring Domains Needed `).

`Cluster`, `URL`, `Suggested H1`, `Top Result` y `Notes` **quedaron vacias**, verificado leyendo
las filas de vuelta. Pertenecen a las fases 13, 14 y 15.

### Verificacion de que ninguna celda quedo mal tipada

Lectura de vuelta con los tres modos de renderizado sobre filas 3-12, 118, 605, 697 y 3850:

| Comprobacion | Resultado |
| --- | --- |
| Celdas que el documento evaluaria como formula | **0** |
| Volumen, CPC y competencia | llegan como **numero**, no como texto ni como fecha (`50`, `0.43`, `0.22`, `2400`) |
| Tildes y enie del texto visible | intactos (`qué es`, `síntomas de`, `corrección de`) |
| Columnas de otras fases | vacias |
| Anulaciones aplicadas en el documento | si: fila 118 `corrección de escoliosis y deformidades` en `comercial` / `decision`, fila 605 `miedo a operarme de la columna` en `informacional` / `decision` |

## Borrado de filas residuales y de columnas muertas

Operacion destructiva sobre el documento del cliente, con consentimiento previo de Juan en el
checkpoint del plan 12-02 (decisiones **J-4** y **J-6**). **El escaneo de referencias se volvio a
correr en el momento del borrado y salio limpio**, que es la condicion que Juan puso: no hay
bandera que lo saltee y ante cualquier mencion el borrado aborta sin eliminar nada.

### Listado completo del modo ensayo, copiado ANTES de ejecutar

**`Keyword Research`: 51 filas, de la 5 a la 55.** Solo dos tienen texto.

```
fila  5 | (sin clave) | F="Low" P="FALSE" Q="FALSE"
fila  6 | (sin clave) | C=" y la URL" P="FALSE" Q="FALSE"
fila  7 | (sin clave) | P="FALSE" Q="FALSE"
fila  8 | (sin clave) | P="FALSE" Q="FALSE"
fila  9 | (sin clave) | P="FALSE" Q="FALSE"
fila 10 | (sin clave) | P="FALSE" Q="FALSE"
fila 11 | (sin clave) | P="FALSE" Q="FALSE"
fila 12 | (sin clave) | P="FALSE" Q="FALSE"
fila 13 | (sin clave) | P="FALSE" Q="FALSE"
fila 14 | (sin clave) | P="FALSE" Q="FALSE"
fila 15 | (sin clave) | P="FALSE" Q="FALSE"
fila 16 | (sin clave) | P="FALSE" Q="FALSE"
fila 17 | (sin clave) | P="FALSE" Q="FALSE"
fila 18 | (sin clave) | P="FALSE" Q="FALSE"
fila 19 | (sin clave) | P="FALSE" Q="FALSE"
fila 20 | (sin clave) | P="FALSE" Q="FALSE"
fila 21 | (sin clave) | P="FALSE" Q="FALSE"
fila 22 | (sin clave) | P="FALSE" Q="FALSE"
fila 23 | (sin clave) | P="FALSE" Q="FALSE"
fila 24 | (sin clave) | P="FALSE" Q="FALSE"
fila 25 | (sin clave) | P="FALSE" Q="FALSE"
fila 26 | (sin clave) | P="FALSE" Q="FALSE"
fila 27 | (sin clave) | P="FALSE" Q="FALSE"
fila 28 | (sin clave) | P="FALSE" Q="FALSE"
fila 29 | (sin clave) | P="FALSE" Q="FALSE"
fila 30 | (sin clave) | P="FALSE" Q="FALSE"
fila 31 | (sin clave) | P="FALSE" Q="FALSE"
fila 32 | (sin clave) | P="FALSE" Q="FALSE"
fila 33 | (sin clave) | P="FALSE" Q="FALSE"
fila 34 | (sin clave) | P="FALSE" Q="FALSE"
fila 35 | (sin clave) | P="FALSE" Q="FALSE"
fila 36 | (sin clave) | P="FALSE" Q="FALSE"
fila 37 | (sin clave) | P="FALSE" Q="FALSE"
fila 38 | (sin clave) | P="FALSE" Q="FALSE"
fila 39 | (sin clave) | P="FALSE" Q="FALSE"
fila 40 | (sin clave) | P="FALSE" Q="FALSE"
fila 41 | (sin clave) | P="FALSE" Q="FALSE"
fila 42 | (sin clave) | P="FALSE" Q="FALSE"
fila 43 | (sin clave) | P="FALSE" Q="FALSE"
fila 44 | (sin clave) | P="FALSE" Q="FALSE"
fila 45 | (sin clave) | P="FALSE" Q="FALSE"
fila 46 | (sin clave) | P="FALSE" Q="FALSE"
fila 47 | (sin clave) | P="FALSE" Q="FALSE"
fila 48 | (sin clave) | P="FALSE" Q="FALSE"
fila 49 | (sin clave) | P="FALSE" Q="FALSE"
fila 50 | (sin clave) | P="FALSE" Q="FALSE"
fila 51 | (sin clave) | P="FALSE" Q="FALSE"
fila 52 | (sin clave) | P="FALSE" Q="FALSE"
fila 53 | (sin clave) | P="FALSE" Q="FALSE"
fila 54 | (sin clave) | P="FALSE" Q="FALSE"
fila 55 | (sin clave) | P="FALSE" Q="FALSE"
```

`P` y `Q` son `Internal Approval` y `Client Approval`, las dos casillas de verificacion sin
marcar. Juan vio ese matiz en el checkpoint del plan 12-02 y eligio borrarlas igual (**J-6**).

**`Content Model`: 6 filas, de la 4 a la 9.** Todas con solo la casilla de `SEO Page?`.

```
fila 4 | (sin clave) | B="FALSE"
fila 5 | (sin clave) | B="FALSE"
fila 6 | (sin clave) | B="FALSE"
fila 7 | (sin clave) | B="FALSE"
fila 8 | (sin clave) | B="FALSE"
fila 9 | (sin clave) | B="FALSE"
```

**Ninguna de las 57 filas contiene nada que no sea residuo de plantilla.** El listado coincide
exacto con el que registro el plan 12-02, asi que entre aquel reconocimiento y esta ejecucion
nadie toco el documento.

### Que se elimino de verdad

| Tab | Filas eliminadas | Columnas eliminadas |
| --- | ---: | --- |
| `Keyword Research` | 51 (filas 5 a 55) | `CVR`, `Lead or Conversion Potential ` |
| `Content Model` | 6 (filas 4 a 9) | `Free Trial CVR`, `Free Trial Potential` |

Las cuatro columnas muertas de la plantilla SaaS de **J-4**, eliminadas tras el escaneo de
referencias en vivo. La grilla de `Keyword Research` paso de 30 a 28 columnas y la de
`Content Model` de 28 a 26.

## Esquema del dataset consolidado

`seo-tools/data/keywords.jsonl`, 5716 lineas, sin claves repetidas, orden estable.

```json
{
  "keyword": "qué es hernia discal",
  "keywordKey": "que es hernia discal",
  "semilla": "Hernia discal",
  "capa": "permutacion",
  "estado": "sin_datos",
  "metricas": {
    "searchVolume": null, "searchVolumeFuente": "sin_datos",
    "cpc": null,          "cpcFuente": "sin_datos",
    "competition": null,  "competitionFuente": "sin_datos"
  },
  "trafficPotential": "no_consultado",
  "keywordDifficulty": "no_consultado",
  "referringDomainsNeeded": "no_consultado",
  "intent": "informacional", "intentSource": "reglas",
  "intentRegla": "informacional.pregunta:que es",
  "stage": "diagnostico", "stageRegla": "diagnostico:que es",
  "alcance": "objetivo", "motivoAlcance": null,
  "ambiguo": false, "motivoAmbiguo": null
}
```

**Los cuatro campos que se quedan en el dataset y NO tienen columna en el Sheet**, por J-3: la
fuente por metrica, la semilla de origen, la capa de expansion y el eje de alcance con su motivo.
La etapa del paciente NO esta en esa lista: Juan la saco de ahi con **J-5** y tiene columna
propia.

**Las tres metricas diferidas llevan `no_consultado` en las 5716 lineas**, con una guarda en el
consolidador que se niega a escribir el archivo si alguna pierde su valor literal. El plan 05
rellena campos, no migra esquema.

## Criterios de aceptacion, con la salida real

| Criterio | Resultado |
| --- | --- |
| `npm run typecheck` sale 0 | si |
| `npm test` sale 0 | **149 de 149 en verde** |
| Pruebas del clasificador sobre 30 o mas keywords reales | 36 keywords reales, 28 pruebas |
| Una prueba por cada uno de los once comportamientos | si, incluidas las tres de precedencia y las tres de prioridad de la anulacion |
| Dos corridas de `kw:classify --dry-run` producen salida identica | `diff -q` limpio |
| Dos generaciones de `keywords.jsonl` producen el mismo archivo | mismo SHA-256 `576bbb2f…` |
| Clasificadas == lineas de `candidates.jsonl` | 5716 == 5716 |
| `grep -rniE "fetch\|http\|openai\|anthropic" src/keywords/classify.ts \| grep -v "//" \| wc -l` | **0** |
| `intent-rules.json` valido, cuatro niveles en orden y tres etapas | `navegacional > transaccional > comercial > informacional`; `decision, diagnostico, sintoma` |
| `intent-overrides.json` valido, claves normalizadas, dominios validos | **38 anulaciones**, todas normalizadas y todas presentes en `candidates.jsonl` |
| Anulaciones por debajo del 30 % del universo | 0,7 % |
| `keywords.jsonl` con 400 o mas lineas, sin claves repetidas, todas clasificadas | **5716** |
| Las tres metricas diferidas con `no_consultado` en el 100 % | si |
| Origen de la intencion con dos valores como maximo | `reglas` y `llm`, nada mas |
| La fase 12 no escribe `Cluster`, `URL`, `Suggested H1` ni `Top Result` | escribe 6 de 21 columnas mapeadas; ninguna de las cuatro |
| Primera carga: inserciones == lineas del dataset | 5716 == 5716 |
| Segunda carga: cero inserciones y misma cantidad de filas | `insertadas: 0`, 5716 filas con clave en las dos mediciones |
| `sheet:inspect` posterior: ningun encabezado preexistente renombrado ni movido | si |
| Ninguna celda evaluada como formula, ningun numero como fecha | 0 formulas; volumen, CPC y competencia como numero |
| Listado del ensayo registrado antes del borrado | si, las 57 filas completas mas arriba |
| `git diff --cached --name-only -- src/ .secrets seo-tools/.cache seo-tools/src/cli.ts seo-tools/src/sheets` antes de cada commit | **0** en los cuatro commits |

## Desviaciones del plan

### 1. [Regla 2 - funcionalidad critica ausente] El eje de alcance

**Encontrado en:** tarea 1, al medir la primera clasificacion del universo completo.
**Situacion:** el plan hereda del *Pattern 6* dos ejes, intencion y etapa. Ninguno de los dos
separa una keyword que el negocio puede atender de una que no. Al clasificar las 5716 aparecio
que **950, el 16,6 %, no son demanda de este consultorio**: hernia discal canina, congresos de
la especialidad, codigos CIE-10, tiendas de calzado ortopedico, ortopedia maxilar, hospitales
publicos y clinicas de otros paises. Todas pasan el filtro de relevancia del plan 03 porque
contienen un termino del dominio, y todas quedarian en el Sheet indistinguibles de una keyword
objetivo. `artrosis cie 10`, con 2400 de volumen, encabeza cualquier orden por volumen.
**Que se hizo:** un tercer eje declarado en el archivo de reglas, con diez motivos y su propio
orden de precedencia. No descarta ni cambia la clasificacion: marca. Se queda en el dataset y
no agrega ninguna columna al Sheet, asi que no roza J-3.
**Commits:** `f8bf0de`, `ab5b081`.

### 2. [Regla 1 - bug] Las dos keywords de mayor volumen salian como informacional

**Encontrado en:** tarea 2, revisando el residuo ordenado por volumen.
**Que estaba mal:** la combinacion que resuelve a transaccional exigia que la marca fuera una
**sede del doctor**. `clinica san bernardo especialistas en traumatologia` (2400) y
`clinica de traumatologia arthrosalud` (1600), que son las dos keywords de mayor volumen del
universo entero, no disparaban nada y caian al nivel por defecto: `informacional`. La lectura
mas equivocada posible, y sobre las dos filas que cualquiera mira primero.
**Que se hizo:** la combinacion cubre ahora **cualquier marca de establecimiento**, propia o
ajena. La intencion de quien busca es la misma; de quien es la marca se registra en el eje de
alcance. Hay prueba nombrada.
**Commit:** `ab5b081`.

### 3. [Calibracion] Las reglas del research se afinaron contra el residuo medido

**Encontrado en:** tarea 1, primera medicion.
**Situacion:** con los patrones del *Pattern 6* tal cual, el residuo dio **1353 keywords, el
23,7 %**, contra el 8-15 % que estimo el research. El criterio de aceptacion de la tarea 2 dice
literal que un residuo desmedido significa reglas mal calibradas.
**Que se hizo:** cuatro pasadas de calibracion leyendo el residuo real, no imaginandolo. La
palanca principal fueron los refuerzos del nivel informacional, que **no reclasifican nada**
porque ese nivel gana igual por defecto: lo unico que hacen es distinguir resolucion explicita
de resolucion por descarte. Ampliarlos saca del residuo lo que nunca fue ambiguo, sin riesgo.
Se agregaron ademas los distritos de Lima que faltaban, los tramites de incapacidad, la busqueda
de especialista con las formas `quien ve`, `quien cura` y `quien opera`, y la geografia ajena
escondida en nombres de tiendas. Residuo final: **709, el 12,4 %**, dentro de la banda.
**Commits:** `f8bf0de`, `ab5b081`.

### 4. [Redimensionamiento] El residuo no se anulo entero

Ya explicado arriba en detalle. El plan admite las dos salidas: residuo en cero, o el SUMMARY
explica que quedo sin anular y por que. Se eligio la segunda con fundamento tecnico: una
anulacion redundante congela un no-cambio y bloquea a la fase 13.

### 5. [Criterio del plan mal escrito] El `<verify>` de la tarea 3 lee un campo que no existe

El bloque automatizado de la tarea 3 incluye:

```js
const c = JSON.parse(...)['Keyword Research'];
const escritas = Object.values(c.fields);
```

**`sheet-columns.json` no tiene `fields`.** El modelo que produjo el plan 12-02 declara
`columns`, un arreglo de objetos con `header`, `field` y `status`. `Object.values(undefined)`
lanza `TypeError` y el criterio no puede pasar tal como esta escrito.

Se ejecuto la comprobacion equivalente contra la forma real, que verifica lo mismo:

```
alcance de columnas OK: la fase 12 escribe 6 de 21 columnas
(Suggested Keyword, Search Volume, Search Intent, CPC, Competition, Patient Stage)
```

Ninguna de las cuatro columnas prohibidas aparece. **El criterio se cumple; su redaccion no.**

### 6. [Criterio del plan incumplible] La verificacion 6 exige cero menciones de la fuente diferida

La verificacion de cierre pide:

```
cd seo-tools && grep -rniE "ahrefs" src data --include='*.ts' --include='*.json' | grep -v "//" | wc -l
```

que imprima `0`. Imprime **3**, y las tres son inevitables: son los nombres literales de tres
columnas del tab `Content Model` del documento del cliente, registrados en `sheet-columns.json`
por el plan 12-02. La decision **J-1** de Juan dice que esas columnas **no se renombran, no se
borran y quedan vacias**. Satisfacer el criterio exigiria falsear el modelo del documento.

En `src/` el conteo si es **0**: se reescribio la unica linea de `classify.ts` que nombraba la
herramienta en un comentario. Lo que el criterio quiere comprobar, que la fase 12 no consulta esa
fuente, se cumple: cero clientes, cero llamadas, cero credencial.

### 7. [Bug del SDK, ya conocido] Los verbos de estado ensucian los archivos de planificacion

`requirements.mark-complete` y `roadmap.update-plan-progress` marcan bien las casillas pero
**insertan una linea en blanco entre cada item de lista** de `REQUIREMENTS.md` y `ROADMAP.md`,
dejan la tabla de trazabilidad sin actualizar (`"applied": false`, `write_set_complete: false`)
y rompen una celda de la tabla de progreso (`In Progress|  |` en lugar de `In Progress | - |`).
El plan 12-02 ya se lo habia encontrado.

`state.advance-plan` ademas falla en este workstream con
`Cannot parse Current Plan or Total Plans in Phase from STATE.md`: el STATE.md de un workstream
no lleva esos campos. Y `state.update-progress` dejo `percent: 0` en el frontmatter mientras
escribia `80%` en la barra del cuerpo.

**Que se hizo:** se revisaron los tres diffs antes de commitear, se restauraron los archivos
desde la copia previa y se aplicaron a mano solo los cambios buscados. Los diffs finales son de
4, 5 y 14 lineas, todas intencionales. La tabla de trazabilidad se actualizo a mano:
`KWR-01 -> Completo (12-03, 12-04)`, `KWR-03 -> Completo (12-04)` y `SHEET-06` anotado como
verificado contra el documento real.

**Nota al margen:** el verbo del roadmap marco tambien `12-01-PLAN.md` como completo. Su codigo
esta commiteado desde `aff3418`, pero **sigue sin existir `12-01-SUMMARY.md`**, cosa que el plan
12-02 ya habia senalado. Se dejo la marca porque el trabajo esta hecho; conviene resolver el
SUMMARY faltante al cerrar la fase.

## Que necesita saber el plan 12-05

1. **El dataset ya existe con el esquema completo.** `seo-tools/data/keywords.jsonl`, 5716
   lineas. El enriquecimiento **rellena campos y no migra nada**: `metricas.searchVolume`,
   `metricas.cpc` y `metricas.competition` con sus tres campos de procedencia, mas los tres
   diferidos si alguna vez se retoman.
2. **724 keywords sin metricas, no 5716.** 4992 ya traen volumen, CPC y competencia de DinoRank.
   Las que faltan son de la capa de permutacion y de SerpApi.
3. **Antes de gastar cuota, filtrar por alcance.** De las 724 sin metricas, conviene mirar
   cuantas son `objetivo`: enriquecer `hernia discal en perros salchichas` o
   `54 congreso peruano de ortopedia y traumatologia` es gasto puro. El campo `alcance` esta en
   cada linea para eso.
4. **Recargar despues del enriquecimiento es seguro y barato.** La segunda carga midio 10
   llamadas de red para 5716 filas y cero inserciones. `sheet:push` con el mismo comando de este
   plan actualiza en el lugar sin tocar `Cluster`, `URL`, `Suggested H1`, `Top Result` ni `Notes`.
5. **No tocar los tres campos diferidos.** El consolidador tiene una guarda que se niega a
   escribir el archivo si alguno pierde su literal `no_consultado`.

## Que necesita saber la fase 13

- **`alcance == "objetivo"` reduce el universo de 5716 a 4766**, y de esas **1542 tienen volumen
  medible**. Ese es el universo real para clusterizar, no las 5716.
- **`ambiguo == true` marca las 709 que resolvio el nivel por defecto.** Es una senal de
  confianza, no un pendiente: sirve para ordenar por cuanto fiarse de la clasificacion.
- **Los patrones viven en `data/intent-rules.json`** y afinarlos no obliga a tocar codigo ni
  pruebas. Las 38 claves anuladas son las unicas que ningun cambio de reglas puede mover.
- **`marca_ajena` con 130 keywords y `geo_ajena` con 92 son inteligencia de SERP de regalo** para
  COMP-03: ya estan identificados los competidores y las clinicas que aparecen en las busquedas
  del dominio.

## Known Stubs

Ninguno. Los tres campos con valor `no_consultado` no son stubs: son un valor declarado que
existe a proposito para todo el universo, con la decision de Juan del 2026-08-10 detras y una
guarda en el codigo que lo protege.

## Threat Flags

Ninguno. No se introdujo superficie de red, de autenticacion ni de acceso a archivos que no
estuviera ya en el `<threat_model>` del plan. El modulo de clasificacion no tiene ninguna
llamada de red, verificado por criterio de aceptacion.

## Nota sobre el paralelismo con el workstream `milestone`

Nada se escribio bajo `src/`, ni en `.planning/STATE.md`, `ROADMAP.md` o `REQUIREMENTS.md` de la
raiz, ni bajo `.planning/workstreams/milestone/`. No se toco `seo-tools/src/cli.ts`,
`seo-tools/src/sheets/`, `seo-tools/src/sources/`, `seo-tools/src/cache.ts`, `quota.ts` ni
ninguno de los modulos de `src/keywords/` de los planes 01, 02 y 03. Cada commit se hizo por
archivo nombrado, nunca con `git add -A`, y los cuatro pasaron la comprobacion de que el area de
preparacion no contenia ningun archivo prohibido.

Los dos scripts de solo lectura que se usaron para obtener el listado completo del ensayo y para
contar las filas del tab se escribieron dentro de `seo-tools/.cache/`, que esta gitignoreada, y
se borraron al terminar. `seo-tools/src/commands/sheet-push.ts` no se modifico.

## Self-Check: PASSED

Archivos verificados en disco: `seo-tools/src/keywords/classify.ts`,
`seo-tools/src/keywords/classify.test.ts`, `seo-tools/data/intent-rules.json`,
`seo-tools/data/intent-overrides.json`, `seo-tools/data/keywords.jsonl`,
`seo-tools/src/commands/kw-classify.ts`.

Commits verificados en el historial: `0047873` (rojo), `f8bf0de` (verde), `ab5b081`, `5b5125c`.

Puertas de TDD de la tarea 1: rojo en `0047873` con la suite fallando por modulo inexistente,
verde en `f8bf0de` con 149 de 149.
