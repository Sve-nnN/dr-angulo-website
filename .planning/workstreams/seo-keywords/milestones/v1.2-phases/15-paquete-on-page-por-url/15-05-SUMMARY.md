---
phase: 15-paquete-on-page-por-url
workstream: seo-keywords
plan: 05
subsystem: seo-tools
tags: [on-page, copy-de-sede, dato-operativo, ymyl, humanizacion, canibalizacion]
requires:
  - "seo-tools/data/onpage-serp.json: jerarquia, entidades y minimo de palabras por URL, del plan 15-01"
  - "seo-tools/data/onpage.json: title, meta y H1 de las 24 filas, del plan 15-02"
  - "seo-tools/data/page-type-map.json: el reparto del top 10 y la confianza de cada cabeza, de la fase 13"
  - "seo-tools/src/phase15/ymyl.ts: la compuerta unica de la wave 3, del plan 15-02"
  - "seo-tools/src/phase15/paquete.ts con --data: los cuatro tipos de documento, de los planes 15-02 y 15-04"
  - "src/content/locations.ts y src/content/location-pages.ts en SOLO LECTURA: el NAP publicado de las cuatro sedes"
  - "14-ENLAZADO.md: las cuatro filas de enlazado saliente de las sedes"
provides:
  - "seo-tools/data/copy-sedes.json: las cuatro fichas de sede vigentes redactadas de punta a punta"
  - "campo datosOperativos por pagina, con estado respaldado o pendiente y su fuente declarada"
  - "campo notaDeFormato por pagina: con que criterio se eligio el formato cuando la SERP no lo resolvio"
  - "bloque de datos operativos en el paquete, con los pendientes en tabla aparte"
  - "copyRedactado(ruta): el cruce de title y meta contra el mapa corre sobre los tres datasets de copy"
  - "cuatro documentos en paquetes/: Ricardo Palma, Tezza, Sanna La Molina y consultorio de Surco"
affects:
  - "plan 15-06: escribe en su propio dataset y hereda el bloque de datos operativos si lo necesita"
  - "plan 15-07: audita trazabilidad y arma la ronda unica del doctor sobre estas cuatro paginas"
  - "workstream milestone: la fase 8 de v1.1 implementa este copy y tiene que cerrar antes los nueve pendientes de confirmacion"
tech-stack:
  added: []
  patterns:
    - "Un dato operativo viaja con su estado, no solo con su fuente. Respaldado y pendiente se renderizan en dos tablas separadas para que publicar un dato sin confirmar exija saltearse un encabezado que dice que falta."
    - "Cuando la SERP medida no resuelve el formato, la decision se declara en el paquete con el reparto del top 10 al lado. Elegir en silencio deja a quien lo lea seis meses despues sin forma de saber que parte fue medicion."
    - "Una entidad obligatoria que solo se cubre nombrando a un tercero no se cubre. El umbral del 80 % existe para dejar margen a exactamente este caso."
key-files:
  created:
    - seo-tools/data/copy-sedes.json
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/sedes-clinica-ricardo-palma.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/sedes-clinica-tezza.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/sedes-sanna-la-molina.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/sedes-consultorio-privado.md
  modified:
    - seo-tools/src/phase15/model.ts
    - seo-tools/src/phase15/paquete.ts
    - seo-tools/src/phase15/paquete.test.ts
    - seo-tools/src/phase15/metadatos.ts
    - seo-tools/src/phase15/metadatos.test.ts
key-decisions:
  - "Ningun dato operativo se compone. Los diez que el sitio no publica quedaron marcados como pendientes con su valor literal `sin dato publicado`, y el paquete los imprime en una tabla propia con el encabezado `Pendientes de confirmacion antes de publicar`. En una ficha de sede una direccion inventada es peor que una afirmacion medica inflada, porque manda a alguien a un edificio equivocado."
  - "La entidad obligatoria `rodriguez` de la SERP de Sanna se dejo sin cubrir a proposito. Es el apellido de un pediatra del staff de otra sede de la red, y publicar el nombre de un colega dentro de la ficha comercial de otro medico no es una decision que este plan tenga mandato para tomar. La URL queda en 7 de 8 entidades, 87,5 %, sobre el umbral del 80 %."
  - "Las entidades en primera persona del plural se cubrieron sin romper la voz del sitio. `nuestro` en Sanna y `somos`, `contamos` y `estamos` en el consultorio salen del vocabulario que repiten los organicos medidos, y la unica forma honesta de nombrarlos era hablar de ese vocabulario: los directorios de clinica estan escritos desde adentro, y las paginas que compiten por la busqueda de Surco estan escritas en plural aunque detras a veces solo haya una marca. Eso ademas le dice algo util a quien lee."
  - "El consultorio de Surco declara en su paquete que su SERP no resolvio. Sobre 9 posiciones medidas y 6 tipificadas, red social y otro empatan en 3 cada uno y la confianza queda en media. El formato de ficha se eligio por coherencia con las otras tres sedes, y el documento dice que esa parte es decision y no medicion."
  - "Las dos fichas que ya estaban redactadas cuando este plan se retomo se evaluaron y se conservaron. Cumplian los criterios de la tarea 1 con holgura, 1214 y 1095 palabras contra un minimo de 500 y 100 % y 95 % de entidades. Solo se corrigieron los tres titulos de seccion que la compuerta marcaba por mayuscula de titulo."
patterns-established:
  - "Estado y fuente son dos campos distintos de un dato operativo: la fuente dice de donde salio y el estado dice si se puede publicar."
requirements-completed: []
coverage:
  - id: D1
    description: "Ricardo Palma y Tezza redactadas dentro de contrato, con Ricardo Palma respondiendo en el primer parrafo la busqueda que hoy no responde ninguna URL del sitio"
    requirement: "ONPAGE-04"
    verification:
      - kind: automated_ui
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-sedes.json"
        status: pass
      - kind: other
        ref: "criterios de la tarea 1: 1214 y 1095 palabras contra 500, 100 % y 95 % de entidades, las diez secundarias cubiertas por seccion, cero datos operativos sin fuente, cero menciones de Montefiori"
        status: pass
    human_judgment: true
    rationale: "Es copy clinico YMYL. La compuerta comprueba forma, sello y fuentes; que lo que dice sea correcto lo aprueba el doctor por escrito (D-08)."
  - id: D2
    description: "Sanna como perfil y el consultorio de Surco con su falta de formato dominante declarada, sin que las cuatro fichas se canibalicen"
    requirement: "ONPAGE-04"
    verification:
      - kind: automated_ui
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-sedes.json"
        status: pass
      - kind: other
        ref: "criterios de la tarea 2: 1263 y 1248 palabras contra 500, 87,5 % y 100 % de entidades, cero titulos de seccion repetidos entre las 72 secciones de las cuatro fichas, notaDeFormato del consultorio de 536 caracteres"
        status: pass
    human_judgment: true
    rationale: "La decision de que entidad no cubrir y de como nombrar el vocabulario en plural de la competencia es editorial y conviene que Juan la vea."
  - id: D3
    description: "Los cuatro documentos de sede, deterministas, con los datos respaldados separados de los pendientes de confirmacion"
    requirement: "ONPAGE-06"
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/paquete.test.ts#paquete: una ficha de sede separa los datos operativos respaldados de los pendientes"
        status: pass
      - kind: unit
        ref: "seo-tools/src/phase15/metadatos.test.ts#metadatos: los tres datasets de copy cruzan contra el mapa, no solo el de las guias"
        status: pass
      - kind: other
        ref: "regeneracion de los cuatro documentos con SHA-256 identico, cero rayas largas o comillas tipograficas en la region de copy, y los diez documentos de los planes 15-03 y 15-04 sin un byte de diferencia"
        status: pass
    human_judgment: false
duration: ~1h 15min
completed: 2026-08-13
status: complete
---

# Phase 15 Plan 05: Las cuatro fichas de sede

**Las cuatro sedes vigentes quedaron con su ficha redactada de punta a punta, cada una con la forma que su SERP medida pide, y ningún dato de dirección, horario o teléfono se compuso: los diez que el sitio no publica salen marcados como pendientes en una tabla propia del paquete.**

## Performance

- **Duration:** ~1h 15min
- **Tasks:** 3 de 3
- **Files modified:** 10 (5 creados, 5 modificados)
- **Cuota de SerpApi gastada:** 0. Sigue en 96 llamadas.

## Accomplishments

- `/sedes/clinica-ricardo-palma` con 1214 palabras contra un mínimo de 500 y el 100 % de sus nueve entidades obligatorias. Responde en el primer párrafo la búsqueda de traumatólogo especialista en columna dentro de esa clínica, que está verificada en la SERP de Lima y que hoy no contesta ninguna URL del sitio.
- `/sedes/clinica-tezza` con 1095 palabras y 19 de sus 20 entidades. Queda centrada en atenderse de ortopedia infantil **ahí**, que es el terreno que la separa de `/servicios/ortopedia-infantil`.
- `/sedes/sanna-la-molina` con 1263 palabras y 7 de sus 8 entidades. Escrita como perfil, con los datos concretos arriba y la prosa después, porque su top 10 lo domina una red social con confianza alta.
- `/sedes/consultorio-privado` con 1248 palabras y el 100 % de sus dieciséis entidades. Es la única sede cuya agenda maneja el doctor, y la ficha lo repite porque es la confusión más frecuente. Su paquete declara que la SERP no resolvió el formato y con qué criterio se eligió.
- Las cuatro fichas suman 72 secciones y ninguna repite el título de otra. Cuatro páginas del mismo tipo escritas con la misma plantilla rellenada se canibalizan, que es justo lo que la fase 14 resolvió sacándole la keyword a `/sedes`.
- Las diez keywords secundarias del mapa quedan cubiertas por una sección concreta de su URL, y las cuatro jerarquías se cubren enteras: cero encabezados sin copy en los cuatro documentos.
- Los 33 datos operativos de las cuatro sedes declaran de dónde salieron. Los 23 respaldados salen de `locations.ts` y `location-pages.ts`; los 10 pendientes van en tabla aparte para que v1.1 los cierre antes de publicar.
- Las cuatro páginas pasan la compuerta de `ymyl.ts` con cero hallazgos y los cuatro documentos se regeneran con el mismo SHA-256.

## Task Commits

| Task | Nombre | Commit |
|------|--------|--------|
| 1 | Ricardo Palma y Padre Luis Tezza, las dos fichas transaccionales | `6d5f829` |
| 2 | Sanna La Molina y el consultorio de Surco, con la SERP que les tocó | `a8117a7` |
| — | El cruce de title y meta cubre los tres datasets (RED) | `0d4fb4e` |
| — | `copyRedactado()` recibe la ruta del dataset (GREEN) | `78f3247` |
| — | El paquete de una sede separa lo respaldado de lo pendiente (RED) | `06091a3` |
| — | El paquete de sede renderiza sus datos operativos (GREEN) | `fd7a918` |
| 3 | Los cuatro documentos de la familia de sedes | `506fa38` |

## Deviations from Plan

### 1. [Continuación] Dos fichas ya estaban escritas y se conservaron

- Una sesión anterior de este mismo plan murió antes de cualquier commit, dejando `data/copy-sedes.json` sin versionar y con dos de las cuatro páginas redactadas.
- Se evaluaron contra los criterios de la tarea 1 en vez de descartarlas: 1214 y 1095 palabras contra un mínimo de 500, 100 % y 95 % de entidades, las diez secundarias cubiertas, cero datos operativos sin fuente. Cumplían todo salvo tres títulos que la compuerta marcaba.
- Se corrigieron esos tres y nada más. Redactarlas de nuevo habría costado una hora para producir algo equivalente.

### 2. [Rule 2 - Funcionalidad faltante] El paquete no sabía imprimir los datos operativos

- **Encontrado en:** tarea 3.
- **Problema:** la acción de la tarea pide que cada documento lleve la lista de datos operativos con su fuente y, aparte, la de los que quedaron pendientes de confirmación. El generador no tenía ni el campo ni el bloque, así que los 33 datos vivían en el dataset y no llegaban al documento que v1.1 va a abrir.
- **Arreglo:** `DatoOperativo` entró al modelo con su campo `estado`, `PaqueteDeUrl` recibió `datosOperativos` y `notaDeFormato` como opcionales, y el render imprime dos tablas separadas fuera de la región de copy. Una URL sin datos operativos no estrena una sección vacía, así que los diez documentos de los planes 15-03 y 15-04 se regeneran sin un byte de diferencia.
- **Archivos:** `seo-tools/src/phase15/model.ts`, `seo-tools/src/phase15/paquete.ts`, `seo-tools/src/phase15/paquete.test.ts`.
- **Commits:** `06091a3` (RED), `fd7a918` (GREEN).

### 3. [Rule 2 - Funcionalidad faltante] El cruce de title y meta cubría un solo dataset de tres

- **Encontrado en:** tarea 2.
- **Problema:** `metadatos.test.ts` cruza el title, la meta y el H1 de cada página redactada contra el mapa, para que v1.1 no publique uno y la auditoría del plan 15-07 valide el otro. `copyRedactado()` tenía cableado `copy-guias.json`, así que `copy-servicios.json` del plan 15-04 y `copy-sedes.json` de este quedaban sin guardia. Es el mismo agujero que el plan 15-04 abrió al separar las familias por archivo.
- **Arreglo:** `copyRedactado()` acepta la ruta con el valor de antes por defecto, y la prueba recorre los tres datasets. Ninguna llamada existente cambia.
- **Archivos:** `seo-tools/src/phase15/metadatos.ts`, `seo-tools/src/phase15/metadatos.test.ts`.
- **Commits:** `0d4fb4e` (RED), `78f3247` (GREEN).

### 4. [Decisión editorial] La entidad `rodriguez` de Sanna quedó sin cubrir

- El extractor de entidades la sacó del snippet del buscador de médicos de Sanna, donde aparece como apellido de un pediatra del staff. Cubrirla exigía nombrar a un colega dentro de la ficha comercial de otro médico.
- Se dejó fuera. La URL queda en 7 de 8, o sea 87,5 %, sobre el umbral del 80 % que el criterio pide. El margen del umbral existe justamente para esto.
- Es el mismo criterio que el plan 15-04 aplicó con los encabezados de la SERP que son nombres propios de otros especialistas.

### 5. [Ajuste de comando] La bandera `--url` de `ymyl.ts`

- El bloque `<verify>` de las tareas 1 y 2 invoca `ymyl.ts --data <archivo> --url <ruta>`, y `--url` no existe: la compuerta revisa el dataset entero de una corrida. Se ejecutó `--data data/copy-sedes.json`, que es más estricto porque revisa las cuatro páginas cada vez. Es el mismo ajuste que documentaron los planes 15-03 y 15-04.

## Requisitos

Ninguno se marca completo.

- **ONPAGE-03** y **ONPAGE-04** piden las 16 URLs que compiten. Van doce.
- **ONPAGE-06** pide el paquete de cada URL. Hay catorce de veinticuatro.

Se mantiene el criterio del plan 15-01: un plan cierra solo los requisitos que cumplió entero, porque marcarlos dejaría en verde la matriz que el plan 15-07 tiene que auditar.

## Verification

- `cd seo-tools && npm test`: 608 pruebas en verde, ninguna saltada. Son las 606 del plan 15-04 más las dos nuevas.
- `cd seo-tools && npm run typecheck`: sin salida.
- `npx tsc --noEmit --listFiles | grep -c '/seo-tools/'`: 0. El tsc de la aplicación no toca las herramientas.
- `ymyl.ts --data data/copy-sedes.json`: 4 páginas revisadas, 0 hallazgos, estado 0.
- SHA-256 de `data/url-map.jsonl`: `ada0a4a1...951b5`, sin cambios. `data/keywords.jsonl` tampoco cambió.
- Cuota de SerpApi: 96 llamadas, la misma con la que empezó el plan.
- `git diff --cached --name-only -- src/`: vacío antes de cada uno de los siete commits.
- Determinismo: los cuatro documentos regenerados dan el mismo SHA-256, y los diez de los planes 15-03 y 15-04 no aparecen modificados en `git status` después del cambio en el generador.
- Cero menciones de Montefiori en el dataset y en los cuatro documentos.
- Cero rayas largas y cero comillas tipográficas dentro de la región de copy de los cuatro documentos.

## Known Stubs

Ninguno en el código ni en el copy. Las cuatro páginas están redactadas de punta a punta y los cuatro documentos se generan sin un solo encabezado sin copy.

Lo que queda pendiente por diseño son dos cosas distintas y conviene no confundirlas.

**Los diez datos operativos sin confirmar**, listados en la tabla propia de cada paquete. No son un stub: son la salida correcta de no inventar un dato. v1.1 los cierra antes de publicar, o deja la página sin afirmarlos.

| Sede | Dato pendiente |
|---|---|
| Ricardo Palma | Piso y número de consultorio |
| Ricardo Palma | Seguros y convenios de la sede |
| Tezza | Planes de salud, seguros y convenios |
| Tezza | Piso y número de consultorio |
| Sanna La Molina | Piso y número de consultorio |
| Sanna La Molina | Seguros y convenios de la sede |
| Sanna La Molina | Precio de la consulta |
| Consultorio de Surco | Estacionamiento del edificio y sus tarifas |
| Consultorio de Surco | Seguros y convenios del consultorio |
| Consultorio de Surco | Precio de la consulta |

Los dos de precio no se van a completar y están marcados igual para dejar constancia: el sitio no publica precios (D-10). Las cuatro preguntas de precio que traen esas dos SERP se responden explicando de qué depende el costo y quién lo pone.

**Las 24 secciones clínicas selladas como `pendiente-doctor`** (D-08). Dos merecen su ojo antes que las demás y están señaladas en la guía para el doctor de su propio paquete: el lema de la Clínica Tezza que el texto cita, que salió de los resultados medidos y no de una fuente institucional directa, y el bloque de hernia discal sin cirugía del consultorio de Surco, que dice a la vez que la mayoría mejora sin operar y que hay que desconfiar de quien lo promete siempre. La ronda única de revisión la arma el plan 15-07.

## Self-Check: PASSED

Los cinco archivos creados existen en disco y los siete commits existen en el historial.
