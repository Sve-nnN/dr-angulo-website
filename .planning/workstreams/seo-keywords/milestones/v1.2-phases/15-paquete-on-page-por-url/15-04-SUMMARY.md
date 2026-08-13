---
phase: 15-paquete-on-page-por-url
workstream: seo-keywords
plan: 04
subsystem: seo-tools
tags: [on-page, copy-comercial, ymyl, humanizacion, canibalizacion, enlazado-propuesto]
requires:
  - "seo-tools/data/onpage-serp.json: jerarquia, entidades y minimo de palabras por URL, del plan 15-01"
  - "seo-tools/data/onpage.json: title, meta y H1 de las 24 filas, del plan 15-02"
  - "seo-tools/src/phase15/ymyl.ts: la compuerta unica de la wave 3, del plan 15-02"
  - "seo-tools/src/phase15/paquete.ts: los cuatro tipos de documento, del plan 15-02 y del 15-03"
  - "14-ENLAZADO.md: las cuatro filas de enlazado saliente que estas URLs reciben"
  - "src/content/locations.ts en solo lectura: los distritos de las cuatro sedes vigentes"
provides:
  - "seo-tools/data/copy-servicios.json: las cuatro paginas transaccionales redactadas de punta a punta"
  - "bandera --data en paquete.ts: cada familia de la wave 3 genera desde su propio dataset"
  - "campo enlacesPropuestos por pagina: el enlazado de la fase 14 impreso dentro del paquete"
  - "cuatro documentos en paquetes/: home, servicios, ortopedia infantil y cirugia minimamente invasiva"
affects:
  - "planes 15-05 y 15-06: escriben en datasets propios y ahora pueden generar con --data sin tocar copy-guias.json"
  - "plan 15-07: audita trazabilidad y arma la ronda unica del doctor sobre estas cuatro paginas"
  - "workstream milestone: la fase 8 de v1.1 implementa este copy y los enlaces que el paquete lista"
tech-stack:
  added: []
  patterns:
    - "El dataset del copy se pasa por bandera y no se cablea en el generador: dos familias que escriben en un mismo JSON se pisan, y separarlas por archivo solo sirve si el generador sabe leerlas."
    - "El enlazado propuesto viaja dentro del paquete, fuera de la region de copy, con el rotulo de que lo implementa v1.1. Quien abre la URL encuentra ahi sus enlaces y no va a buscar 14-ENLAZADO.md."
    - "Un encabezado crudo de la SERP no siempre se puede publicar. El titulo de la seccion se reescribe y la procedencia del encabezado queda en la tabla de jerarquia."
key-files:
  created:
    - seo-tools/data/copy-servicios.json
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/home.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/servicios.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/servicios-ortopedia-infantil.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/servicios-cirugia-minimamente-invasiva.md
  modified:
    - seo-tools/src/phase15/paquete.ts
    - seo-tools/src/phase15/paquete.test.ts
    - seo-tools/src/phase15/model.ts
key-decisions:
  - "La home y el hub no comparten un solo titulo de seccion, y eso obligo a reescribir en las dos el encabezado de la secundaria que comparten. `traumatología especialista en columna` es secundaria de las dos URLs, asi que la que la publicara literal se llevaba por titulo la keyword de la otra. La home la cubre como cuando el problema viene de la columna y el hub como el especialista que dedica su practica a la columna."
  - "Los encabezados de la SERP que son nombres de colegas o de otras clinicas no se publican como titulos de seccion. Tres busquedas relacionadas del hub son nombres propios de otros especialistas. La seccion responde la intencion de quien busca comparando, con titulos como como comparar antes de elegir o segunda opinion sobre una cirugia de columna, y el nombre crudo queda en la tabla de procedencia. Publicar el nombre de un colega como H3 de la pagina comercial de otro es una decision de marketing que este plan no tiene mandato para tomar."
  - "La pagina de cirugia minimamente invasiva no trae una sola cifra de recuperacion, de exito ni de volumen, y lo que dice sobre el robot Da Vinci en el pais va marcado para que el doctor lo confirme. Es la pagina donde mas tienta escribir un numero y la que mas dano hace si ese numero no esta verificado (D-10)."
  - "El generador recibe --data en vez de leer copy-guias.json cableado. La alternativa era meter las cuatro paginas transaccionales en el archivo de las guias, que es justo lo que los planes en paralelo de la wave 3 tenian que evitar."
patterns-established:
  - "Encabezado crudo y titulo publicado son dos cosas: el crudo se conserva como procedencia y el publicado se escribe para que un paciente lo lea sin tropezarse."
requirements-completed: []
coverage:
  - id: D1
    description: "La home y el hub redactados de punta a punta, cada uno con su consulta, y la separacion medida sostenida en el texto"
    requirement: "ONPAGE-04"
    verification:
      - kind: automated_ui
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-servicios.json"
        status: pass
      - kind: other
        ref: "criterios de la tarea 1: home 1537 palabras contra 600 y 15 de 16 entidades, hub 1092 contra 700 y 11 de 11, cero titulos cruzados, cero menciones de Montefiori"
        status: pass
    human_judgment: true
    rationale: "Es copy clinico YMYL. La compuerta comprueba forma, sello y fuentes; que lo que dice sea correcto lo aprueba el doctor por escrito (D-08)."
  - id: D2
    description: "Ortopedia infantil reescrita para el padre que decide, y cirugia minimamente invasiva creada desde cero sin una sola cifra sin verificar"
    requirement: "ONPAGE-04"
    verification:
      - kind: automated_ui
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-servicios.json"
        status: pass
      - kind: other
        ref: "criterios de la tarea 2: 1520 y 1459 palabras contra 700, 11 de 11 y 8 de 8 entidades, las 9 secundarias cubiertas por seccion"
        status: pass
    human_judgment: true
    rationale: "La pagina de la tecnica quirurgica es la de mayor riesgo YMYL de la fase y la afirmacion sobre el uso del robot en el pais necesita confirmacion del doctor antes de publicarse."
  - id: D3
    description: "Los cuatro documentos de la familia transaccional, deterministas, con su enlazado propuesto adentro y con la region de copy limpia"
    requirement: "ONPAGE-06"
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/paquete.test.ts#paquete: el enlazado de la fase 14 viaja adentro y dice que lo implementa v1.1"
        status: pass
      - kind: unit
        ref: "seo-tools/src/phase15/paquete.test.ts#paquete: la cabecera nombra el dataset del que salio el copy"
        status: pass
      - kind: other
        ref: "regeneracion de los cuatro documentos con SHA-256 identico, cero rayas largas o comillas tipograficas en la region de copy, y los seis documentos del plan 15-03 regenerados sin un byte de diferencia"
        status: pass
    human_judgment: false
duration: ~1h 40min
completed: 2026-08-12
status: complete
---

# Phase 15 Plan 04: Las cuatro páginas transaccionales

**La home, el hub de servicios, ortopedia infantil y la página nueva de cirugía mínimamente invasiva quedaron redactadas de punta a punta, con la separación medida entre la home y el hub sostenida en los propios títulos y sin una sola cifra sin verificar.**

## Performance

- **Duration:** ~1h 40min
- **Tasks:** 3 de 3
- **Files modified:** 8 (3 modificados, 5 creados)
- **Cuota de SerpApi gastada:** 0. Sigue en 96 llamadas.

## Accomplishments

- `/` con 1537 palabras contra un mínimo de 600 y 15 de sus 16 entidades obligatorias usadas dentro del texto. La única que falta es `huesos articulaciones`, que no es un término sino dos pegados por el extractor y que solo entraría escribiendo una frase agramatical.
- `/servicios` con 1092 palabras contra 700 y el 100 % de sus once entidades. Pelea la consulta del cirujano de columna con el temario de columna entero y sin invadir el de traumatología general.
- La separación que la fase 14 midió par a par, cero URLs compartidas en el top 10, ahora está sostenida en la página: ninguna de las dos se lleva por título una keyword secundaria de la otra.
- `/servicios/ortopedia-infantil` con 1520 palabras contra 700 y sus once entidades. Está escrita para el padre o la madre que no sabe si lo que ve en su hijo necesita consulta, y el criterio que más se repite es cuándo observar en vez de tratar.
- `/servicios/cirugia-minimamente-invasiva` creada desde cero con 1459 palabras contra 700 y sus ocho entidades. Explica qué es el abordaje, en qué se diferencia del abierto, cómo se decide si alguien es candidato y qué límites tiene, sin un solo día de recuperación ni un solo porcentaje.
- Los cuatro documentos se generan con `paquete.ts`, traen adentro el enlazado que propuso la fase 14 con su anchor y su destino, y se regeneran con el mismo SHA-256.
- Las cuatro páginas pasan la compuerta de `ymyl.ts` con cero hallazgos.

## Task Commits

| Task | Nombre | Commit |
|------|--------|--------|
| 1 | La home y el hub de servicios, separados por el dato | `e16d61f` |
| 2 | Ortopedia infantil y cirugía mínimamente invasiva | `b94605a` |
| 3 | Los cuatro documentos de la familia, generados y verificados | `c7966c4` |

## Deviations from Plan

### 1. [Rule 3 - Bloqueante] El generador no sabía leer otro dataset que el de las guías

- **Encontrado en:** tarea 3.
- **Problema:** el plan escribe el copy en `data/copy-servicios.json` y manda generar los documentos con `paquete.ts`, pero el generador tenía la ruta de `data/copy-guias.json` cableada. Tal como estaba, o las cuatro páginas se metían en el archivo de las guías, que es justo lo que separar las familias de la wave 3 venía a evitar, o los documentos no se podían generar.
- **Arreglo:** `paquete.ts` acepta `--data`, `construirPaquete()` y `construirPaqueteCorto()` reciben la ruta como parámetro con el valor de antes por defecto, y la cabecera del documento nombra el dataset real del que salió en vez de decir siempre `copy-guias.json`.
- **Archivos:** `seo-tools/src/phase15/paquete.ts`, `seo-tools/src/phase15/paquete.test.ts`.
- **Commit:** `c7966c4`.

### 2. [Rule 2 - Funcionalidad faltante] El paquete no sabía imprimir el enlazado propuesto

- **Encontrado en:** tarea 3.
- **Problema:** la acción de la tarea pide que cada documento traiga la lista de enlaces salientes que la matriz de la fase 14 propuso, con anchor y destino, bajo un rótulo que diga que los implementa v1.1. El generador no tenía ni el campo ni el bloque.
- **Arreglo:** `PaqueteDeUrl` recibió el campo opcional `enlacesPropuestos`, el dataset lo trae por página y el render imprime la tabla fuera de la región de copy, que es donde va todo lo generado. Una URL sin fila en la matriz no estrena una sección vacía.
- **Archivos:** `seo-tools/src/phase15/model.ts`, `seo-tools/src/phase15/paquete.ts`, `seo-tools/src/phase15/paquete.test.ts`.
- **Commit:** `c7966c4`.

### 3. [Decisión editorial] Los encabezados de la SERP que nombran a otros especialistas

- Tres búsquedas relacionadas del hub son nombres propios de colegas y varias más, en la home y en ortopedia infantil, son otras clínicas y otras ciudades. La jerarquía de `onpage-serp.json` las trae como encabezados porque así salieron de la captura.
- Se escribió la sección que responde la intención de esa búsqueda con un título publicable: quien busca a un especialista por su nombre está comparando, y lo que le sirve es cómo comparar y cómo pedir una segunda opinión. El encabezado crudo no se pierde, queda en la tabla de procedencia del paquete.
- No se tocó `onpage-serp.json`, que es de otro plan.

### 4. [Ajuste de comando] La bandera `--url` de `ymyl.ts`

- El bloque `<verify>` de las tareas 1 y 2 invoca `ymyl.ts --data <archivo> --url <ruta>`, y `--url` no existe: la compuerta revisa el dataset entero de una corrida. Se ejecutó la forma real y más estricta, `--data data/copy-servicios.json`, que revisa las cuatro páginas en cada corrida en lugar de una sola. Es el mismo ajuste que documentó el plan 15-03.

### 5. [Rule 1 - Bug] Una frase de la página de cirugía disparó la regla de cifras

- La compuerta marcó `un tiempo de preparación que en cirugías cortas no siempre se justifica`. La regla busca una cantidad seguida de un sustantivo de volumen quirúrgico y ahí leyó `un ... cirugías`, aunque la frase no declara ninguna cantidad de operaciones.
- Se reescribió la frase en vez de aflojar la regla. Una compuerta con excepciones deja de ser compuerta, y la frase se dice igual de bien sin el patrón.

## Requisitos

Ninguno se marca completo, y es deliberado.

- **ONPAGE-04** pide el copy de las 16 URLs que compiten. Van ocho, la mitad.
- **ONPAGE-06** pide el paquete de cada URL. Hay diez de veinticuatro.

Se aplica el criterio que dejó escrito el plan 15-01: un plan cierra solo los requisitos que cumplió entero, porque marcarlos dejaría en verde la matriz de trazabilidad que el plan 15-07 tiene que auditar.

## Verification

- `cd seo-tools && npm test`: 606 pruebas en verde, ninguna saltada. Son las 604 del plan 15-03 más las dos nuevas de `paquete.test.ts`.
- `cd seo-tools && npm run typecheck`: sin salida.
- `npx tsc --noEmit --listFiles | grep -c '/seo-tools/'`: 0. El tsc de la aplicación no toca las herramientas.
- `ymyl.ts --data data/copy-servicios.json`: 4 páginas revisadas, 0 hallazgos, estado 0.
- SHA-256 de `data/url-map.jsonl`: `ada0a4a1...951b5`, sin cambios. `data/keywords.jsonl` tampoco cambió.
- Cuota de SerpApi: 96 llamadas, la misma con la que empezó el plan.
- `git diff --cached --name-only -- src/`: vacío antes de los tres commits.
- Determinismo: los cuatro documentos regenerados dan el mismo SHA-256, y los seis del plan 15-03 se regeneran sin un byte de diferencia pese al cambio en el generador.

## Known Stubs

Ninguno. Las cuatro páginas están redactadas de punta a punta y los cuatro documentos se generan completos, sin un solo encabezado sin copy.

Lo que queda pendiente por diseño es el sello: 43 secciones clínicas de las cuatro páginas salen marcadas como `pendiente-doctor` (D-08). Hay una que conviene mirar antes que las demás, y está señalada en la guía para el doctor de su propio paquete: la afirmación sobre en qué especialidades se usa el robot Da Vinci en el país. Si no es exacta, se corrige antes de publicar. La ronda única de revisión la arma el plan 15-07.

## Self-Check: PASSED

Los cinco archivos creados existen en disco y los tres commits existen en el historial.
