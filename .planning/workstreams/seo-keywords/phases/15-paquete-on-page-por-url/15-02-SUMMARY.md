---
phase: 15-paquete-on-page-por-url
workstream: seo-keywords
plan: 02
subsystem: seo-tools
tags: [on-page, metadata, auditoria-local, ymyl, humanizacion, compuerta, tipos-de-documento]
requires:
  - "seo-tools/data/url-map.jsonl: las 24 filas del mapa de la fase 14, de solo lectura"
  - "seo-tools/data/onpage-serp.json: formato y minimoDePalabras por URL, del plan 15-01"
  - "seo-tools/src/phase15/model.ts: el juego de tipos comun a los siete planes"
  - "seo-tools/src/phase15/paquete.ts: el generador que dejo el tracer del plan 15-01"
  - "src/app/ y src/content/ del sitio publicado, en solo lectura, para transcribir seis H1"
  - "~/.claude/skills/humanizer/SKILL.md: de ahi salen las reglas de escritura, no de la intuicion"
provides:
  - "seo-tools/data/onpage.json: title, meta y H1 de las 24 filas, con procedencia por H1"
  - "seo-tools/data/onpage-audit.json: el resultado de la auditoria local sobre el paquete propuesto"
  - "seo-tools/data/tells-ia.json: 32 muletillas de texto generado, en datos y no en codigo"
  - "seo-tools/src/phase15/auditoria.ts: duplicados, metas faltantes y rangos sobre el mapa propuesto"
  - "seo-tools/src/phase15/ymyl.ts: la compuerta unica de la wave 3, devuelve evidencia por hallazgo"
  - "seo-tools/src/phase15/paquete.ts: los cuatro tipos de documento con cabecera compartida"
  - ".../15-AUDITORIA.md: la auditoria legible, con el motivo por el que no salio de DinoRank"
affects:
  - "planes 15-03 a 15-06: todo su copy pasa por ymyl.ts antes de darse por escrito"
  - "plan 15-07: genera los seis documentos cortos con el tipo que este plan construyo"
  - "workstream milestone: la fase 10 de v1.1 recibe title y meta ya dentro de su contrato de 60 y 155"
tech-stack:
  added: []
  patterns:
    - "La compuerta devuelve hallazgos con URL, seccion, regla y texto exacto. Una que dijera solo si o no obliga a releer dos mil palabras buscando el problema, y a la tercera vez alguien la desactiva."
    - "Las reglas de escritura se aplican solo entre las dos marcas de copy. Fuera de esa region vive prosa de la fase 14 con doce rayas largas que este workstream no escribio."
    - "El diccionario de muletillas vive en data/tells-ia.json. Agregar una es editar una lista, no tocar un programa."
    - "Los cuatro tipos de documento comparten cabecera. Quien implementa abre el archivo de su URL sin saber que tipo le toco, y lo primero que lee se lo dice."
    - "La comprobacion de keyword al frente es por tokens y sin tildes. Comparar la cadena entera falla con titulos en espanol natural, donde la keyword se parte con preposiciones."
key-files:
  created:
    - seo-tools/src/phase15/auditoria.ts
    - seo-tools/src/phase15/auditoria.test.ts
    - seo-tools/src/phase15/ymyl.ts
    - seo-tools/src/phase15/ymyl.test.ts
    - seo-tools/data/onpage.json
    - seo-tools/data/onpage-audit.json
    - seo-tools/data/tells-ia.json
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/15-AUDITORIA.md
  modified:
    - seo-tools/src/phase15/metadatos.ts
    - seo-tools/src/phase15/metadatos.test.ts
    - seo-tools/src/phase15/paquete.ts
    - seo-tools/src/phase15/paquete.test.ts
    - seo-tools/src/phase15/model.ts
    - seo-tools/src/phase15/serp-onpage.ts
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/servicios-hernia-discal.md
decisions:
  - "La auditoria de ONPAGE-05 corre local sobre el paquete propuesto y no contra /auditoria de DinoRank, que responde HTTP 200 con site.domain soumahotel.com, el proyecto de otro cliente de esa cuenta. Un fallo silencioso que entrega datos ajenos es peor que uno ruidoso."
  - "Las reglas de humanizacion se acotan a la region entre las dos marcas de copy. url-map.jsonl trae doce rayas largas en campos de prosa de la fase 14, y una regla global fallaria por texto heredado. La presion entonces seria aflojar la regla, que es como se pierden las reglas."
  - "La prohibicion de cifras sobre el propio doctor no la levanta una fuente. La levanta el doctor confirmando por escrito. Cada patron exige la cantidad Y el sustantivo, para que un paciente con hernia discal siga siendo una frase normal de copy clinico."
  - "El title y la meta de una URL viven en su tabla, fuera de la region de copy, en los cuatro tipos de documento. Cada cadena tiene una compuerta y solo una: auditoria.ts mide largo y duplicados, ymyl.ts mide la prosa que el generador escribe."
  - "El documento corto lleva las dos marcas de copy aunque casi no tenga copy, para que la wave 3 corra la compuerta sobre cualquiera de los cuatro tipos sin un caso especial. Un caso especial es donde una regla se pierde."
  - "Los seis documentos cortos NO se generan en este plan. Este plan entrega el tipo de documento; el plan 15-07 tarea 1 entrega los archivos, que es donde el roadmap los asigno."
patterns-established:
  - "Compuerta con evidencia: ninguna regla de la fase devuelve un booleano. Devuelve la lista de hallazgos con el texto exacto que fallo."
  - "Region acotada: una regla de escritura declara sobre que region opera. La que no lo hace termina midiendo texto que su autor no escribio."
  - "Un H1 que se transcribe declara archivo y linea. Uno que se propone declara en prosa por que ese y no otro."
requirements-completed: [ONPAGE-01, ONPAGE-02, ONPAGE-05]
coverage:
  - id: D1
    description: "Las 22 URLs vivas tienen title y meta dentro del contrato de 60 y 155, y las 16 que compiten llevan la keyword primaria al frente"
    requirement: ONPAGE-01
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/metadatos.test.ts#metadatos: ningun title pasa de 60 caracteres y ninguna meta de 155"
        status: pass
      - kind: integration
        ref: "criterio del plan: filas fuera de contrato en data/onpage.json = 0 sobre 22 vivas"
        status: pass
      - kind: integration
        ref: "criterio del plan: filas con primaria cuyo title no la lleva al frente = 0 sobre 16"
        status: pass
    human_judgment: false
  - id: D2
    description: "El H1 de las 16 que compiten es propuesto; el de las 6 que no compiten se transcribe del sitio con archivo y linea"
    requirement: ONPAGE-02
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/metadatos.test.ts#metadatos: el H1 de una URL sin primaria se lee del sitio y no se propone"
        status: pass
      - kind: integration
        ref: "criterio del plan: URLs de accion dejar con h1Origen propuesto = 0"
        status: pass
      - kind: integration
        ref: "criterio del plan: H1 transcritos sin archivo:linea en origenDelH1 = 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "La auditoria sobre el mapa propuesto da cero titles duplicados, cero H1 duplicados y cero metas faltantes, antes de que v1.1 publique"
    requirement: ONPAGE-05
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/auditoria.test.ts#auditoria: dos URLs con el mismo title salen listadas con las dos nombradas"
        status: pass
      - kind: integration
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/auditoria.ts --data data/onpage.json --out data/onpage-audit.json"
        status: pass
      - kind: integration
        ref: "criterio del plan: titlesDuplicados + h1Duplicados + metasFaltantes = 0, con 22 auditadas y 2 fuera de alcance nombradas"
        status: pass
    human_judgment: false
  - id: D4
    description: "Existe una compuerta ejecutable de YMYL y humanizacion que devuelve evidencia por hallazgo, y los cuatro planes de copy de la wave 3 la tienen que pasar"
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/ymyl.test.ts: once conductas, cada una con un caso que falla y uno que pasa"
        status: pass
      - kind: unit
        ref: "seo-tools/src/phase15/ymyl.test.ts#ymyl: la prosa heredada fuera de la region de copy no hace fallar nada"
        status: pass
      - kind: integration
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-guias.json (0 hallazgos, estado 0)"
        status: pass
    human_judgment: false
  - id: D5
    description: "El generador cubre los cuatro tipos de documento que la fase entrega, y ninguno ensucia su region de copy"
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/paquete.test.ts#paquete: los cuatro tipos de documento comparten cabecera y cada uno se nombra"
        status: pass
      - kind: unit
        ref: "seo-tools/src/phase15/paquete.test.ts#paquete: ningun tipo de documento ensucia su region de copy, y lo heredado queda afuera"
        status: pass
      - kind: integration
        ref: "cd seo-tools && tsx src/phase15/paquete.ts --url /agendar y --url /blog/estenosis-espinal-que-es (estado 0, dos corridas mismo SHA-256)"
        status: pass
    human_judgment: false
metrics:
  duration: ~1 h de ejecucion efectiva, repartida en dos sesiones
  completed: 2026-08-12
status: complete
---

# Phase 15 Plan 02: Metadata de las 24 URLs y las dos compuertas Summary

**Las 22 URLs vivas salen con title y meta dentro del contrato de v1.1, la auditoría de duplicados da limpia sobre el paquete propuesto antes de que se publique nada, y la humanización deja de ser una recomendación: es un ejecutable con once reglas que los cuatro planes de copy de la wave 3 tienen que pasar.**

## Performance

- **Duration:** ~1 h de ejecución efectiva. La primera sesión se cortó por límite de uso a mitad de la tarea 3 y la segunda la retomó desde el commit RED que había quedado
- **Tasks:** 3 de 3
- **Files created:** 8
- **Files modified:** 7, ninguno de la app. `src/` no se tocó ni una línea
- **Cuota gastada:** cero. `.cache/_quota.json` marca 96 llamadas a SerpApi antes y después

## Accomplishments

- **Las 24 filas del mapa tienen su metadata escrita y medida.** 22 con title y meta dentro de 60 y 155, las 16 que compiten con la keyword primaria al frente comprobada por tokens y sin tildes, y las 2 que se apagan con un 301 sin title pero con la instrucción de redirección. Ninguna de las 6 que declararon no competir se lleva por el title la primaria de otra, que es la puerta trasera por la que volvería la canibalización que cerró la fase 14.
- **El H1 de cada grupo sale por el camino que le toca.** 16 propuestos, cada uno con la prosa de por qué ese y no otro. 6 transcritos del sitio publicado con archivo y línea de dónde salieron. Proponerles uno nuevo a esos seis habría reabierto una decisión de la fase 14 sin dato nuevo.
- **ONPAGE-05 cerrado sobre el paquete propuesto y no sobre el sitio vivo.** Cero titles duplicados, cero H1 duplicados, cero metas faltantes, 22 URLs auditadas y las 2 que redirigen declaradas fuera de alcance con su motivo. Corrida antes de que v1.1 publique, que es cuando una auditoría sirve para algo.
- **La compuerta de YMYL y humanización existe como código.** Once reglas, cada una con su prueba de caso que falla y caso que pasa. Devuelve hallazgos con URL, sección, regla y el texto exacto, no un veredicto. Corrida sobre la guía que Juan aprobó da cero hallazgos y sale con estado 0.
- **El generador cubre los cuatro tipos de documento de la fase.** Guía clínica, página de servicio, ficha de sede y el documento corto de las URLs que solo llevan title y meta o que se apagan con un 301. Los cuatro comparten cabecera y los cuatro pasan la compuerta con cero hallazgos.

## Task Commits

1. **Gate RED tarea 1: pruebas del mapa de title, meta y H1 de las 24 URLs** - `c9b5a6f` (test)
2. **Tarea 1: title, meta y H1 de las 24 filas del mapa** - `2d66534` (feat)
3. **Gate RED tarea 2: pruebas de la auditoría de duplicados** - `2fa9b69` (test)
4. **Tarea 2: la auditoría de duplicados sobre el mapa propuesto** - `338221f` (feat)
5. **Gate RED tarea 3: pruebas de la compuerta de YMYL y humanización** - `4b22440` (test)
6. **Tarea 3: la compuerta y los cuatro tipos de documento** - `0384174` (feat)

## Files Created

- `seo-tools/src/phase15/metadatos.ts` (extendido de la URL del tracer a las 24 filas) y `data/onpage.json`, con `url`, `accion`, `keywordPrimaria`, `title`, `titleLargo`, `metaDescription`, `metaLargo`, `h1`, `h1Origen`, `origenDelH1`, `keywordAlFrente`, `redirigeA` y `formato` por fila
- `seo-tools/src/phase15/auditoria.ts` y `data/onpage-audit.json`, con las seis listas de hallazgos, el bloque de alcance y el resumen. Función pura, cero red
- `seo-tools/src/phase15/ymyl.ts`, la compuerta. Dos familias de reglas, YMYL y humanización, sobre el dataset de copy y sobre el documento renderizado
- `seo-tools/data/tells-ia.json`, 32 muletillas de texto generado en español, escritas sin tildes porque la comparación normaliza
- `.../15-AUDITORIA.md`, la auditoría legible, con el dominio ajeno que devolvió DinoRank escrito con todas las letras
- `auditoria.test.ts` y `ymyl.test.ts`, más las conductas nuevas en `metadatos.test.ts` y `paquete.test.ts`. 55 pruebas de la fase 15 sobre 603 de la suite completa

## Decisions Made

**La auditoría es local y el motivo va con el dato crudo.** `/auditoria` de DinoRank no responde HTTP 500. Responde HTTP 200 con `site.domain: soumahotel.com`, el proyecto de otro cliente dado de alta en esa cuenta. Se le pide `drangulocolumna.com` y contesta el hotel de otro sin marcar error. Queda escrito en `15-AUDITORIA.md` para que nadie lo reintente creyendo que fue una caída pasajera. Y hay un segundo motivo, anterior a ese: `/auditoria` audita un sitio publicado, y acá se está auditando un paquete que todavía no se publicó, que es justo el momento en que la auditoría sirve.

**Las reglas de escritura se acotan a la región de copy.** `url-map.jsonl` trae doce rayas largas en campos de justificación que escribió la fase 14, y esa prosa entra al paquete como procedencia. Una regla sin región fallaría por texto que este workstream no puso ni va a tocar, y la presión sería aflojar la regla en vez de acotarla. Hay una prueba que renderiza un documento con raya larga fuera de la región y exige que pase.

**La prohibición de cifras sobre el doctor no la levanta una fuente.** Cuántas cirugías hizo, cuántos años lleva ejerciendo, qué tasa de éxito tiene: ninguna de esas cifras está verificada, así que declarar una fuente no alcanza. La levanta el doctor confirmando por escrito. Cada patrón exige la cantidad y el sustantivo juntos, para que "un paciente con hernia discal" siga siendo una frase normal de copy clínico y no una credencial.

**Cada cadena tiene una compuerta y solo una.** El title y la meta viven en su tabla, fuera de la región de copy, en los cuatro tipos de documento. Los mide `auditoria.ts`, que es quien sabe de largos y duplicados. La región de copy es lo que el generador escribe como prosa, y eso lo mide `ymyl.ts`. Meter la misma cadena en dos compuertas suena más seguro y es al revés: cuando una de las dos falla nadie sabe cuál manda.

**El documento corto lleva las dos marcas aunque casi no tenga copy.** Así la wave 3 corre la compuerta sobre cualquiera de los cuatro tipos sin escribir un caso especial. Un caso especial es donde una regla se pierde.

## Deviations from Plan

### Arreglos automáticos

**1. [Rule 1 - Bug] Dos errores de tipos en `ymyl.ts` que la sesión anterior dejó abiertos**
- **Found during:** Tarea 3, al retomar la sesión interrumpida
- **Issue:** `npm run typecheck` fallaba con `TS2339` y `TS7006` al leer `data/tells-ia.json`. `Array.isArray` no descarta un `readonly string[]` de una unión, así que la rama del objeto seguía viendo también el arreglo y el parámetro del `map` quedaba implícitamente `any`. La suite pasaba igual: el archivo real trae la forma con clave `tells` y esa rama nunca se ejercitaba en runtime.
- **Fix:** Se narrowea a mano sobre `unknown` en vez de castear la unión, y de paso queda validado el contenido. Una entrada que no fuera texto se descartaría sin avisar, y un diccionario más corto es una compuerta que deja pasar lo que tenía que frenar. Sin `any` y sin cast a ciegas.
- **Files modified:** `seo-tools/src/phase15/ymyl.ts`
- **Committed in:** `0384174`

**2. [Rule 2 - Contrato del generador] La cabecera se extrajo a función compartida**
- **Found during:** Tarea 3, al agregar el cuarto tipo de documento
- **Issue:** El plan pide que los cuatro tipos compartan cabecera. Con la cabecera escrita dentro de `renderPaquete`, el documento corto habría tenido su propia copia y las dos podrían divergir sin que nada lo notara.
- **Fix:** `cabecera()` la escriben los dos renderizadores, con la línea de procedencia como parámetro porque el corto sale de `data/onpage.json` y no de `data/copy-guias.json`. Una prueba recorre los cuatro tipos y exige el mismo encabezado y el rótulo de formato de cada uno.
- **Files modified:** `seo-tools/src/phase15/paquete.ts`, `seo-tools/src/phase15/paquete.test.ts`
- **Committed in:** `0384174`

**3. [Rule 1 - Consistencia de artefactos] `servicios-hernia-discal.md` regenerado**
- **Found during:** Tarea 3, después de extraer la cabecera
- **Issue:** El paquete que Juan aprobó en el plan 15-01 quedó con el comentario de procedencia partido en otro punto. El contenido no cambió, pero el archivo dejó de coincidir con lo que produce su generador, y la regla de la fase es que el documento se regenera y no se edita (D-12).
- **Fix:** Se regeneró y se commiteó junto al cambio del generador. El diff son dos líneas del comentario de cabecera. Ni el copy ni las tablas se movieron.
- **Files modified:** `.../paquetes/servicios-hernia-discal.md`
- **Committed in:** `0384174`

---

**Total deviations:** 3, las tres automáticas (2 de Rule 1, 1 de Rule 2)
**Impact on plan:** Ninguna amplía el alcance. La primera es el arreglo de un error de tipos heredado de la sesión que se cortó, y las otras dos son consecuencia directa de lo que el plan pide en la tarea 3.

## Issues Encountered

**La sesión anterior murió por límite de uso a mitad de la tarea 3.** Dejó `ymyl.ts` en disco sin commitear, con la suite en verde y el typecheck en rojo, y `paquete.ts` sin empezar. El commit RED de la tarea 3 sí existía. Se retomó desde ahí sin rehacer nada: se verificó por inspección directa qué había commiteado y qué no, se arregló el typecheck y se siguió con la generalización del generador. Es el escenario para el que sirve commitear el RED por separado.

**Los seis documentos cortos no se generaron acá, a propósito.** La tarea 3 pide el tipo de documento y sus dos criterios de aceptación corren el generador sobre `/agendar` y sobre `/blog/estenosis-espinal-que-es` para probar que funciona. Los archivos son entregable del plan 15-07 tarea 1, que es donde el roadmap los asignó. Los tres que quedaron en disco al correr los criterios se borraron para no dejar el directorio de paquetes en un estado a medias, con tres de ocho.

## Requisitos: qué se cierra y qué no

El plan declara `requirements: [ONPAGE-01, ONPAGE-02, ONPAGE-05]`. Se marcan los tres, dos de ellos con la anotación de por qué se cumplen de una forma distinta a la que dice el enunciado.

| Requisito | Estado | Por qué |
| --- | --- | --- |
| ONPAGE-01 | **Cumplido** | Las 22 URLs vivas tienen title y meta dentro de 60 y 155, y las 16 que compiten llevan la primaria al frente, medido por tokens. Las 2 que redirigen no reciben metadata por decisión de la fase (D-07). |
| ONPAGE-02 | **Cumplido, con matiz** | Las 16 que compiten tienen H1 propuesto y jerarquía H2/H3 de 305 encabezados derivada de las preguntas reales de la SERP, que llegó en el plan 15-01. Las 6 que no compiten transcriben el H1 publicado en vez de recibir uno propuesto, y no reciben jerarquía: no llevan cuerpo (D-06). |
| ONPAGE-05 | **Cumplido con otra fuente** | El enunciado nombra la auditoría de DinoRank. Se cumple con una auditoría local sobre el paquete propuesto, por los dos motivos de D-04 y del ROADMAP: `/auditoria` audita un sitio publicado y este paquete todavía no lo está, y además devuelve los datos de otro cliente. |
| ONPAGE-04 | Pendiente | Pide el copy clínico redactado de las 16. Hay uno. Lo cierran los planes 15-03 a 15-06, y ahora tienen la compuerta que dice cuándo está bien escrito. |
| ONPAGE-06 | Pendiente | Pide el paquete de entrega por URL. El generador ya cubre los cuatro tipos; los 23 archivos que faltan los emiten la wave 3 y el plan 15-07. |

## Qué hereda la wave 3

Los planes 15-03, 15-04, 15-05 y 15-06 corren en paralelo y los cuatro reciben lo mismo de acá.

**La compuerta, que no es opcional.** `cd seo-tools && ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-guias.json` sale con estado distinto de cero si hay un solo hallazgo. Las once reglas son: sección clínica sin sello de pendiente-doctor, afirmación con cifra sin fuente, cifras sobre el propio doctor, sedes que ya no existen, raya larga o comilla tipográfica, emoji, muletilla del diccionario, extensión por debajo del mínimo de la URL, ritmo de oraciones demasiado parejo, encabezado en mayúsculas de título, y la región de copy ausente. Cada hallazgo trae la URL, la sección y el texto exacto, así que corregir no es releer la página entera.

**Un criterio único de qué cuenta como texto humanizado.** Es el motivo por el que la compuerta existe antes que el copy. Cuatro planes escribiendo en paralelo sin ella habrían producido cuatro criterios distintos sobre dieciséis páginas de una web médica.

**El diccionario de muletillas es ampliable sin tocar código.** Si al escribir aparece una muletilla que la lista no tiene, se agrega a `data/tells-ia.json` y la compuerta la busca en la corrida siguiente. Se escriben sin tildes y en minúsculas.

**Dos números que ya no se discuten por URL.** El `minimoDePalabras` de `data/onpage-serp.json`, que sale de la mediana del top 10 que ya posiciona, y la desviación estándar mínima de 6 palabras en el largo de las oraciones. El segundo es el que ningún diccionario caza: todas las frases del mismo largo es la firma más visible de un texto generado.

**El title, la meta y el H1 ya están escritos.** Están en `data/onpage.json` y ya pasaron la auditoría de duplicados. La wave 3 escribe cuerpo, no metadata, y si cambia una keyword secundaria tiene que saber que los anchors de la matriz de la fase 14 apuntan a ella (D-15).

**El generador de los cuatro tipos.** `paquete.ts --url <ruta>` decide solo qué tipo le toca a la URL mirando el mapa. Una URL sin keyword primaria recibe el documento corto aunque quien corra el comando pida otra cosa, porque no tiene SERP medida de la cual sacar jerarquía ni entidades.

## User Setup Required

Ninguno. El plan no instaló paquetes ni tocó credenciales.

## Known Stubs

Ninguno.

`data/copy-guias.json` sigue con una sola URL de dieciséis, que es exactamente el trabajo de la wave 3, y `paquete.ts` lista bajo "Encabezados todavía sin copy" cualquier encabezado sin redactar en vez de emitir el documento como si estuviera completo.

Los seis documentos cortos y los quince paquetes completos que faltan no son stubs: son el alcance declarado de los planes 15-03 a 15-07, y el generador que los emite ya está probado sobre los cuatro tipos.

## Self-Check: PASSED

Todos los archivos declarados existen en disco y los seis commits existen en el historial. `npm test` en verde con 603 pruebas, `npm run typecheck` sin salida, `npx tsc --noEmit` en la raíz con estado 0 y sin compilar nada de `seo-tools/`. SHA-256 de `data/url-map.jsonl` sin cambios: `ada0a4a1fe6c0d149de428352ed07260c1e48a88d4b897d2d15e6c1f6ea951b5`. Cuota de SerpApi en 96.
