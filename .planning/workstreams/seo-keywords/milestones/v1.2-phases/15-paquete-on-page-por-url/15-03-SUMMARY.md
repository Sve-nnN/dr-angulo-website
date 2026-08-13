---
phase: 15-paquete-on-page-por-url
workstream: seo-keywords
plan: 03
subsystem: seo-tools
tags: [on-page, copy-clinico, ymyl, humanizacion, absorcion-301, guia-clinica]
requires:
  - "seo-tools/data/onpage-serp.json: jerarquia, entidades y minimo de palabras por URL, del plan 15-01"
  - "seo-tools/data/onpage.json: title, meta y H1 de las 24 filas, del plan 15-02"
  - "seo-tools/src/phase15/ymyl.ts: la compuerta unica de la wave 3, del plan 15-02"
  - "seo-tools/src/phase15/paquete.ts: los cuatro tipos de documento, del plan 15-02"
  - "src/content/service-pages.ts, src/content/blog.ts y src/content/faq.ts en solo lectura: lo publicado que estas paginas reemplazan y absorben"
provides:
  - "seo-tools/data/copy-guias.json: las cuatro paginas informativas redactadas de punta a punta"
  - "campo absorbe por pagina: cada bloque del post que se apaga con su destino nombrado dentro de la guia"
  - "seis documentos en paquetes/: cuatro de pagina completa y dos de redireccion"
  - "documento de 301 con la tabla de absorcion y el orden de publicacion escrito"
affects:
  - "planes 15-04, 15-05 y 15-06: escriben en el mismo copy-guias.json y pasan por la misma compuerta"
  - "plan 15-07: audita la trazabilidad y arma la ronda unica del doctor sobre estas cuatro paginas"
  - "workstream milestone: la fase 8 de v1.1 implementa este copy, y las dos 301 van despues de publicar la guia"
tech-stack:
  added: []
  patterns:
    - "El documento de una URL que se apaga trae la tabla de que se absorbio y donde quedo. Sin ella, quien pone el 301 no tiene como comprobar que el contenido sobrevivio."
    - "El orden de la fusion va escrito en el propio documento: primero se publica la guia de destino, despues la redireccion."
    - "La cobertura de entidades se mide contra el texto redactado, no contra una lista al lado: el criterio compara la entidad normalizada dentro de titulos y parrafos."
key-files:
  created:
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/servicios-estenosis-espinal.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/servicios-escoliosis-y-deformidades.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/preguntas-frecuentes.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/blog-estenosis-espinal-que-es.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/blog-hernia-discal-o-dolor-de-espalda-como-diferenciarlos.md
  modified:
    - seo-tools/data/copy-guias.json
    - seo-tools/src/phase15/paquete.ts
    - seo-tools/src/phase15/paquete.test.ts
key-decisions:
  - "El documento de un 301 lleva la tabla de absorcion y el orden de publicacion. Redirigir sin fundir tira el contenido a la basura y el 301 lo entierra sin dejar rastro de lo que habia."
  - "El campo absorbe se agrego tambien a la guia de hernia discal, que recibe el segundo post que se apaga. El tracer no lo tenia porque el campo no existia todavia."
  - "Preguntas frecuentes responde lo transversal y remite a las guias en vez de desarrollar temario clinico. Si repitiera el temario competiria contra ellas, que es lo que la fase 14 se paso tres planes cerrando."
  - "La guia de escoliosis sostiene el paraguas entero del slug renombrado: escoliosis con sus tipos, cifosis y deformidades del adulto. Escribir solo sobre escoliosis dejaria el renombre sin respaldo de contenido."
  - "Este plan NO cierra ONPAGE-04 ni ONPAGE-06: los dos piden algo por cada URL y hay cuatro de dieciseis y seis de veinticuatro. Se aplica el criterio del plan 15-01, un plan cierra solo los requisitos que cumplio entero."
patterns-established:
  - "Absorcion antes que redireccion: el destino de cada bloque se declara en el dataset y se imprime en el documento de la URL que se apaga."
requirements-completed: []
coverage:
  - id: D1
    description: "La guia de /servicios/estenosis-espinal redactada de punta a punta, con las cuatro preguntas de la SERP como secciones y el post que se apaga absorbido bloque por bloque"
    requirement: "ONPAGE-04"
    verification:
      - kind: automated_ui
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-guias.json"
        status: pass
      - kind: other
        ref: "criterios de aceptacion de la tarea 1: 2423 palabras contra 1400, 100% de entidades usadas, 0 preguntas de SERP sin seccion, absorbe con origen y destino en cada bloque"
        status: pass
    human_judgment: true
    rationale: "Es copy clinico YMYL. La compuerta comprueba forma, sello y fuentes; que lo que dice sea correcto lo aprueba el doctor por escrito (D-08)."
  - id: D2
    description: "La guia de /servicios/escoliosis-y-deformidades sosteniendo el paraguas del slug renombrado, con cifosis dentro"
    requirement: "ONPAGE-04"
    verification:
      - kind: automated_ui
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-guias.json"
        status: pass
      - kind: other
        ref: "criterios de la tarea 2: 2338 palabras contra 1200, 90% de entidades, cifosis presente, 5 secundarias cubiertas"
        status: pass
    human_judgment: true
    rationale: "Copy clinico YMYL sobre deformidades de columna, pendiente de aprobacion del doctor."
  - id: D3
    description: "/preguntas-frecuentes reescrita como pagina transversal que no compite contra las guias"
    requirement: "ONPAGE-04"
    verification:
      - kind: automated_ui
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-guias.json"
        status: pass
      - kind: other
        ref: "criterios de la tarea 2: 1823 palabras contra 800, 85% de entidades, 3 secundarias cubiertas"
        status: pass
    human_judgment: true
    rationale: "El reparto de competencias entre reumatologo y traumatologo es una afirmacion clinica y se simplifica facil. Lo revisa el doctor."
  - id: D4
    description: "Los seis documentos de la familia informativa, deterministas, con region de copy limpia y con la instruccion de 301 completa"
    requirement: "ONPAGE-06"
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/paquete.test.ts#paquete: el documento de un 301 dice que se absorbio y en que orden se publica"
        status: pass
      - kind: other
        ref: "regeneracion de los seis documentos con SHA-256 identico y cero rayas largas o comillas tipograficas dentro de la region de copy"
        status: pass
    human_judgment: false
duration: ~1h 30min
completed: 2026-08-12
status: complete
---

# Phase 15 Plan 03: Las cuatro páginas informativas y la familia de seis documentos

**Las tres guías clínicas de columna y preguntas frecuentes quedaron redactadas dentro de contrato y con los dos posts que se apagan fundidos antes del 301, con destino declarado bloque por bloque.**

## Performance

- **Duration:** ~1h 30min
- **Tasks:** 3 de 3
- **Files modified:** 8 (3 modificados, 5 creados)
- **Cuota de SerpApi gastada:** 0. Sigue en 96 llamadas.

## Accomplishments

- `/servicios/estenosis-espinal` redactada con 2423 palabras contra un mínimo de 1400, las cuatro preguntas de su SERP como secciones propias y el 100 % de sus ocho entidades obligatorias usadas dentro del texto.
- `/servicios/escoliosis-y-deformidades` con 2338 palabras contra 1200, cubriendo el paraguas entero del slug renombrado: escoliosis con sus tipos, cifosis y las deformidades del adulto por desgaste. Es lo que le da respaldo de contenido a `cifosis`, que había quedado fuera de las 10 de Oro por un punto.
- `/preguntas-frecuentes` con 1823 palabras contra 800, respondiendo lo transversal (a quién consultar, cómo es la primera cita, qué llevar, cómo se decide operar) y remitiendo a las guías en vez de repetir su temario.
- El post `estenosis-espinal-que-es` quedó absorbido en nueve bloques con destino nombrado, y `hernia-discal-o-dolor-de-espalda-como-diferenciarlos` en siete. El campo `absorbe` viaja en el dataset y se imprime en el documento de la URL que se apaga.
- Los seis documentos de la familia se generan con `paquete.ts`, se regeneran idénticos y tienen la región de copy limpia de rayas largas y comillas tipográficas.
- Las cuatro páginas pasan la compuerta de `ymyl.ts` con cero hallazgos, incluida la guía de hernia discal que escribió el tracer antes de que las reglas fueran ejecutables.

## Task Commits

| Task | Nombre | Commit |
|------|--------|--------|
| 1 | La guía de estenosis espinal, que absorbe el post que se apaga | `e65a408` |
| 2 | La guía de escoliosis y deformidades, y preguntas frecuentes | `2a7b4ae` |
| 3 | Los seis documentos de la familia, generados y verificados | `d4e3311` |

## Deviations from Plan

### 1. [Rule 3 - Bloqueante] El documento de un 301 no sabía decir qué se absorbió

- **Encontrado en:** tarea 3.
- **Problema:** la acción de la tarea pide que el documento de redirección diga tres cosas, hacia dónde va el 301, que el contenido ya fue absorbido y en qué sección quedó, y en qué orden se publica. `renderPaqueteCorto()` del plan 15-02 solo sabía decir la primera.
- **Arreglo:** `PaqueteCorto` recibió el campo opcional `absorcion`, `construirPaqueteCorto()` lo lee del `absorbe` de la página de destino, y el render agrega el orden de publicación y la tabla de bloques dentro de la sección de la redirección. Va fuera de la región de copy porque es tabla generada, igual que el resto de la procedencia.
- **Archivos:** `seo-tools/src/phase15/paquete.ts`, `seo-tools/src/phase15/paquete.test.ts`.
- **Commit:** `d4e3311`.

### 2. [Rule 2 - Funcionalidad faltante] El `absorbe` de la guía de hernia discal

- **Encontrado en:** tarea 3.
- **Problema:** la guía de hernia también recibe un post que se apaga, pero la escribió el tracer antes de que existiera el campo `absorbe`, así que su documento de 301 habría salido sin la tabla mientras el de estenosis sí la tenía.
- **Arreglo:** se agregaron los siete bloques del post con su destino. No se tocó una línea de su copy.
- **Commit:** `d4e3311`.

### 3. [Ajuste de comando] `--data` en `paquete.ts` y `--url` en `ymyl.ts`

- El bloque `<verify>` del plan invoca `paquete.ts --data data/copy-guias.json` y `ymyl.ts --url <ruta>`, y ninguna de las dos banderas existe. `paquete.ts` recibe una URL por corrida y `ymyl.ts` revisa el dataset entero.
- Se ejecutó la forma equivalente y más estricta: `paquete.ts --url` seis veces, y la compuerta sobre el dataset completo en cada tarea, o sea revisando también las páginas ya escritas. No se agregaron banderas: inventar superficie de CLI para que un comando de un plan corra literal es peor que correr el comando que existe.

### 4. [Criterio corregido] El campo del criterio de secundarias

- El tercer criterio de aceptación de la tarea 2 lee `coberturaDeSecundarias.map(c => c.secundaria)`, y el campo del dataset se llama `keyword`. Tal como está escrito devuelve una lista de `undefined` y falla siempre.
- Se evaluó con el nombre real del campo. Resultado: cero secundarias sin cubrir en las dos URLs, y también cero en la de estenosis.

## Requisitos

Ninguno se marca completo en este plan, y es deliberado.

- **ONPAGE-03** ya estaba cerrado por el plan 15-01.
- **ONPAGE-04** pide el copy de las 16 URLs que compiten. Hay cuatro. Van doce.
- **ONPAGE-06** pide el paquete de cada URL. Hay seis de veinticuatro.

Se aplica el criterio que el plan 15-01 dejó escrito: un plan cierra solo los requisitos que cumplió entero, porque marcarlos dejaría en verde la matriz de trazabilidad que el plan 15-07 tiene que auditar.

## Verification

- `cd seo-tools && npm test`: 604 pruebas en verde, ninguna saltada.
- `cd seo-tools && npm run typecheck`: sin salida.
- `ymyl.ts --data data/copy-guias.json`: 4 páginas revisadas, 0 hallazgos, estado 0.
- SHA-256 de `data/url-map.jsonl`: `ada0a4a1...951b5`, sin cambios. `data/keywords.jsonl` tampoco cambió.
- Cuota de SerpApi: 96 llamadas, la misma con la que empezó el plan.
- `git diff --cached --name-only -- src/`: vacío antes de los tres commits.
- Determinismo: los seis documentos regenerados dan los mismos SHA-256 que la corrida anterior.

## Known Stubs

Ninguno. Las cuatro páginas están redactadas de punta a punta y los seis documentos se generan completos.

Lo que sí queda pendiente por diseño es el sello: las 76 secciones clínicas de las cuatro páginas salen marcadas como `pendiente-doctor` (D-08) y ninguna se publica sin su visto bueno por escrito. La ronda única de revisión la arma el plan 15-07.

## Self-Check: PASSED

Los cinco documentos creados existen en disco y los tres commits existen en el historial.
