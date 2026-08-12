---
phase: 15-paquete-on-page-por-url
workstream: seo-keywords
plan: 01
subsystem: seo-tools
tags: [on-page, serp-cacheada, entidades, jerarquia, copy-clinico, ymyl, humanizacion]
requires:
  - "seo-tools/.cache/serpapi/ — las 96 capturas ya pagadas de la fase 13, leidas offline"
  - "seo-tools/data/url-map.jsonl — las 24 filas del mapa keyword-URL (plan 14-03), de solo lectura"
  - "seo-tools/src/phase13/serp.ts — leerSerp con offline: true"
  - "seo-tools/src/phase13/args.ts — parseo de banderas de los puntos de entrada de fase"
  - "src/content/service-pages.ts y src/content/blog.ts — material clinico publicado, en solo lectura"
provides:
  - "seo-tools/src/phase15/model.ts — los tipos que usan los siete planes de la fase"
  - "seo-tools/src/phase15/entidades.ts — entidades obligatorias con procedencia por termino"
  - "seo-tools/src/phase15/serp-onpage.ts — esqueletos por formato, jerarquia H2/H3 y generador de las 16"
  - "seo-tools/src/phase15/metadatos.ts — contrato de title 60 y meta 155 con la fase 10 de v1.1"
  - "seo-tools/src/phase15/paquete.ts — generador del Markdown por URL, con region de copy delimitada"
  - "seo-tools/data/onpage-serp.json — jerarquia y entidades de las 16 URLs con keyword primaria"
  - "seo-tools/data/copy-guias.json — el copy clinico de /servicios/hernia-discal, sellado"
  - ".../paquetes/servicios-hernia-discal.md — el paquete de muestra aprobado por Juan"
affects:
  - "planes 15-03 a 15-06: escriben las quince paginas restantes con este molde, este tono y esta extension"
  - "plan 15-02: convierte en compuerta ejecutable la humanizacion que aca se cumplio a mano"
  - "plan 15-07: la auditoria de duplicados corre sobre el dataset que este plan funda"
  - "workstream milestone: las fases 8 y 10 de v1.1 implementan estos paquetes"
tech-stack:
  added: []
  patterns:
    - "El indice de una pagina lo manda el esqueleto del formato y no la lista de keywords: las preguntas de la SERP entran como H3 debajo de la seccion que las responde."
    - "Una busqueda relacionada que repite una seccion que el esqueleto ya trae no genera encabezado: queda registrada en coberturaDeRelacionadas diciendo quien la cubre."
    - "La region de copy va delimitada por dos comentarios HTML, para que la humanizacion se aplique a lo que escribimos y no a la prosa heredada de la fase 14."
    - "El umbral de entidades baja por pasos y el umbral aplicado se registra siempre en la fila, no solo cuando se bajo."
key-files:
  created:
    - seo-tools/src/phase15/model.ts
    - seo-tools/src/phase15/entidades.ts
    - seo-tools/src/phase15/entidades.test.ts
    - seo-tools/src/phase15/serp-onpage.ts
    - seo-tools/src/phase15/serp-onpage.test.ts
    - seo-tools/src/phase15/metadatos.ts
    - seo-tools/src/phase15/metadatos.test.ts
    - seo-tools/src/phase15/paquete.ts
    - seo-tools/src/phase15/paquete.test.ts
    - seo-tools/data/onpage-serp.json
    - seo-tools/data/copy-guias.json
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/servicios-hernia-discal.md
  modified: []
decisions:
  - "Las preguntas de la SERP van como H3 debajo de la seccion que las responde y no como H2, contra la letra del plan: al nivel de las secciones el indice queda como una columna de interrogantes y se pierde el recorrido del paciente. Juan lo aprobo sobre el documento real el 2026-08-12."
  - "El vocabulario anatomico NO puntua para el hueco `que-es` aunque sea el que lo explica: si `disco` puntuara ahi, la pregunta por los sintomas de una hernia de disco caeria en la seccion que define en vez de en la que describe."
  - "El formato lo decide la SERP salvo el prefijo /sedes/, porque el top 10 de `cirujano de columna clinica ricardo palma` no distingue una ficha de sede de una pagina de servicio: los dos moldes rankean igual ahi."
  - "Una busqueda que pide un formato de archivo (`artrosis pdf`) no es un subtema: el residuo se limpia de esas palabras y la busqueda queda cubierta por la seccion, sin encabezado propio."
  - "El copy no lleva ni un numero escrito con digitos salvo en las dos afirmaciones que declaran fuente. Las cantidades van en palabras, que ademas es mejor espanol."
patterns-established:
  - "Procedencia por termino: cada entidad viaja con documentos, denominador y las posiciones concretas donde aparecio, y el largo de las posiciones ES el conteo de documentos."
  - "Sello por tipo de seccion: lo clinico nace pendiente-doctor, lo operativo no lleva sello, y sellar todo diluiria el sello hasta volverlo invisible."
  - "El indice del paquete muestra el encabezado ya redactado cuando existe copy, y el crudo del que salio vive en la columna de procedencia."
# Solo ONPAGE-03 se cierra aca. ONPAGE-02 pide "H1 propuesto Y jerarquia H2/H3" por URL y el
# H1 existe para una sola de las dieciseis; ONPAGE-06 pide el paquete de las dieciseis y hay
# uno. Los dos avanzaron mucho y ninguno esta cumplido: marcarlos ahora seria un falso verde
# en la matriz de trazabilidad, que es lo unico que el plan 15-07 tiene para auditar.
requirements-completed: [ONPAGE-03]
coverage:
  - id: D1
    description: "Las 16 URLs con keyword primaria tienen su jerarquia H2/H3 derivada de las preguntas reales de la SERP de Lima, desde cache y con cero busquedas gastadas"
    requirement: ONPAGE-02
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/serp-onpage.test.ts#serp-onpage: las cuatro preguntas de la SERP entran como encabezado o quedan nombradas con motivo"
        status: pass
      - kind: unit
        ref: "seo-tools/src/phase15/serp-onpage.test.ts#serp-onpage: entran las 16 URLs con primaria y no entran las 8 que declararon no competir"
        status: pass
      - kind: integration
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/serp-onpage.ts --out data/onpage-serp.json"
        status: pass
    human_judgment: false
  - id: D2
    description: "Las 16 URLs tienen su lista de entidades obligatorias derivada del top 10 que ya posiciona, con la procedencia de cada termino al lado"
    requirement: ONPAGE-03
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/entidades.test.ts#entidades: cada termino declara en cuantos documentos aparecio y en que posiciones"
        status: pass
      - kind: unit
        ref: "seo-tools/src/phase15/entidades.test.ts#entidades: dominios, marcas de competidores y ruido de navegacion no son entidad clinica"
        status: pass
    human_judgment: false
  - id: D3
    description: "Una URL real recorre la fase entera: de las capturas ya pagadas a un paquete Markdown que quien implementa abre y sigue de corrido"
    requirement: ONPAGE-06
    verification:
      - kind: integration
        ref: "cd seo-tools && ./node_modules/.bin/tsx src/phase15/paquete.ts --url /servicios/hernia-discal (dos corridas, mismo SHA-256)"
        status: pass
      - kind: unit
        ref: "seo-tools/src/phase15/paquete.test.ts#paquete: dos renderizados del mismo dataset producen el mismo texto"
        status: pass
    human_judgment: false
  - id: D4
    description: "Ninguna linea de texto clinico se entrega sin el sello de pendiente de aprobacion del doctor"
    verification:
      - kind: unit
        ref: "seo-tools/src/phase15/paquete.test.ts#paquete: una seccion clinica sale sellada y una operativa no"
        status: pass
      - kind: automated_ui
        ref: "criterio del plan: secciones clinicas sin sello en copy-guias.json = 0"
        status: pass
    human_judgment: false
  - id: D5
    description: "Juan aprueba tono, formato y extension sobre una pagina real antes de que se escriban las otras quince"
    verification: []
    human_judgment: true
    rationale: "El tono es lo unico que ningun criterio automatico decide bien, y es lo caro de arreglar despues de dieciseis paginas. El checkpoint existe para descubrirlo tras una pagina y no tras dieciseis."
metrics:
  duration: ~2 h 15 min
  completed: 2026-08-12
status: complete
---

# Phase 15 Plan 01: De la captura al paquete, por una URL Summary

**La tubería completa corre sobre `/servicios/hernia-discal` y sale un paquete Markdown de 2483 palabras que v1.1 puede implementar sin abrir otro archivo, más la jerarquía y las entidades de las 16 URLs, todo desde las 96 capturas ya pagadas y con cero búsquedas gastadas.**

## Performance

- **Duration:** ~2 h 15 min
- **Tasks:** 3 de 3 (dos de ejecución y un checkpoint bloqueante, resuelto)
- **Files created:** 12
- **Files modified:** 0 archivos de la app. `src/` no se tocó ni una línea.

## Accomplishments

- **Una URL entera, de punta a punta.** `/servicios/hernia-discal` sale con title, meta, H1, veinte encabezados con su procedencia, catorce entidades obligatorias y una guía clínica de 2483 palabras contra un mínimo de 1400. El documento se abre solo: quien lo implementa no necesita leer ningún otro archivo del workstream.
- **Las 16 URLs con primaria tienen jerarquía y entidades medidas.** De las 64 preguntas de las 16 SERPs, 63 entraron a una jerarquía y la única que quedó fuera dice por escrito por qué. Cero secundarias del mapa sin encabezado que las cubra, que es lo que sostiene los 135 anchors de la matriz del plan 14-04.
- **196 entidades obligatorias con procedencia término a término.** Cada una declara en cuántos orgánicos apareció, sobre cuántos, y en qué posiciones. Ninguna fila quedó con entidades insuficientes.
- **El presupuesto de la fase se respetó entero.** `.cache/_quota.json` marca 96 llamadas a SerpApi antes y después. Las 6 búsquedas que quedan hasta el reset del 2026-08-21 siguen intactas.
- **Juan aprobó el molde sobre el documento real** el 2026-08-12: tono, formato y extensión quedan como referencia para las quince páginas restantes.

## Task Commits

1. **Gate RED (TDD): tipos de la fase y pruebas que fallan** - `7456602` (test)
2. **Task 1 (tracer): de la captura al paquete, por `/servicios/hernia-discal`** - `876d965` (feat)
3. **Task 2: jerarquía y entidades obligatorias de las 16 URLs** - `302017e` (feat)
4. **Task 3: checkpoint de aprobación de Juan** - sin commit propio; se resolvió con la respuesta "lo veo bien ya puedes continuar"

## Files Created

- `seo-tools/src/phase15/model.ts` — un solo juego de tipos para los siete planes, para que el auditor de duplicados del plan 15-07 compare campos que existen en todas las filas
- `seo-tools/src/phase15/entidades.ts` — frecuencia documental sobre títulos y fragmentos del top 10, con el criterio discrecional declarado en el encabezado del archivo
- `seo-tools/src/phase15/serp-onpage.ts` — tres esqueletos por formato, ruteo de preguntas y keywords a su sección, y el generador de las 16 filas
- `seo-tools/src/phase15/metadatos.ts` — valida title ≤60 y meta ≤155, y que la primaria esté al frente por tokens y sin tildes
- `seo-tools/src/phase15/paquete.ts` — el Markdown por URL, con la región de copy delimitada por dos comentarios HTML
- `seo-tools/data/onpage-serp.json` — 16 URLs con jerarquía, entidades, cobertura y procedencia
- `seo-tools/data/copy-guias.json` — la guía clínica de hernia discal, veinte secciones, todas selladas
- `.../paquetes/servicios-hernia-discal.md` — el entregable que aprobó Juan
- Cuatro archivos de prueba: `entidades.test.ts`, `serp-onpage.test.ts`, `metadatos.test.ts`, `paquete.test.ts`

## Decisions Made

**Las preguntas de la SERP van como H3 y no como H2.** El plan pedía nivel 2. Con las cuatro preguntas al nivel de las secciones, el índice de una guía clínica queda como una columna de interrogantes intercaladas y se pierde el recorrido del paciente, que es lo que el checkpoint venía a juzgar. Con las preguntas debajo de la sección que las responde se lee el recorrido y además queda visible el lenguaje literal con el que la gente pregunta. Se ejecutó así, se marcó como desvío en el reporte del checkpoint, y Juan lo aprobó tal cual.

**El vocabulario anatómico no puntúa para el hueco `que-es`.** Parece contraintuitivo porque es la sección que explica la anatomía. El motivo es concreto: la pregunta "¿Cuáles son los síntomas de una hernia de disco?" nombra el disco pero no pregunta por él, y con `disco` puntuando ahí caía en la sección equivocada. Lo anatómico llega igual, por el desvío por defecto, que apunta a ese mismo hueco.

**El prefijo `/sedes/` decide el molde y la SERP decide todo lo demás.** El top 10 de "cirujano de columna clínica ricardo palma" no distingue una ficha de sede de una página de servicio porque los dos moldes rankean igual ahí. Donde la SERP sí resuelve, manda ella: las tres páginas de `/servicios/` con top 10 informativo salen como guía clínica.

**El copy no lleva cifras escritas con dígitos.** Las cantidades van en palabras, que además es mejor español. Las dos únicas afirmaciones con dígito son las cuatro sedes vigentes y las tres banderas rojas, y las dos declaran su fuente en una tabla al final del paquete.

## Deviations from Plan

### Desvíos deliberados, aprobados en el checkpoint

**1. [Rule 4 - Decisión de formato, escalada al checkpoint] Preguntas de la SERP en H3 en vez de H2**
- **Found during:** Task 1, al armar el esqueleto de la guía clínica
- **Issue:** El plan pide "encabezados de nivel 2" para las cuatro preguntas de `related_questions`. Ejecutarlo literal produce hasta doce H2 en una guía, cuatro de ellos preguntas sueltas en medio del recorrido del paciente.
- **Fix:** Las preguntas entran como H3 bajo el hueco del esqueleto que las responde, con `origen: pregunta-serp` y el literal al lado. El criterio de aceptación (usadas o nombradas con motivo, sumando cuatro) se cumple igual.
- **Files modified:** `seo-tools/src/phase15/serp-onpage.ts`
- **Verification:** Se marcó como desvío explícito en el reporte del checkpoint y Juan lo aprobó sobre el documento real.
- **Committed in:** `876d965`

### Arreglos automáticos

**2. [Rule 1 - Bug] `PLANNING_DATA_DIR` apuntaba al directorio equivocado**
- **Found during:** Task 1, primera corrida de `paquete.ts`
- **Issue:** La constante de `config.ts` resuelve a `.planning/workstreams/seo-keywords/data`, y el paquete se escribió en `.../data/phases/15-.../paquetes/` en vez de `.../phases/15-.../paquetes/`.
- **Fix:** La ruta se arma desde `REPO_ROOT` en `paquete.ts`. `config.ts` no se tocó: está cerrada desde la fase 12 y los datasets sí van bajo `data/`. El directorio equivocado se borró.
- **Files modified:** `seo-tools/src/phase15/paquete.ts`
- **Committed in:** `876d965`

**3. [Rule 1 - Bug] Artículo duplicado y mayúscula en medio del encabezado**
- **Found during:** Task 2, al revisar las jerarquías de `/blog/artrosis` y `/servicios/hernia-discal`
- **Issue:** "Pastillas para la la artrosis" (la cola ya traía artículo), "Medicamento para el desinflamar hernia discal" (artículo delante de un infinitivo) y "Síntomas de la Hernia discal lumbar" (la relacionada llega con inicial en mayúscula porque así la escribe Google).
- **Fix:** `articuloPara` no inserta artículo si la cola ya abre con uno o con un infinitivo, y `minuscula` baja la inicial de la frase que pasa a ir en medio de un encabezado.
- **Files modified:** `seo-tools/src/phase15/serp-onpage.ts`
- **Committed in:** `302017e`

**4. [Rule 2 - Calidad del entregable] Búsquedas de formato convertidas en encabezado**
- **Found during:** Task 2, al revisar `/blog/artrosis` y `/servicios/estenosis-espinal`
- **Issue:** "Artrosis PDF" y "Estenosis espinal PDF" salían como H3 de una guía clínica publicada. Pedir un archivo no es un subtema de la página.
- **Fix:** El residuo se limpia de palabras de formato (`pdf`, `descargar`, `video`, `gratis` y once más). Si queda vacío, la búsqueda se declara cubierta por la sección a la que mapea, sin encabezado propio, y eso queda registrado en `coberturaDeRelacionadas`.
- **Files modified:** `seo-tools/src/phase15/serp-onpage.ts`
- **Committed in:** `302017e`

**5. [Rule 2 - Calidad del entregable] Vocabulario de relleno entre las entidades obligatorias**
- **Found during:** Task 1, primera medición sobre las 16 capturas
- **Issue:** `ocurre`, `parte` y `caso` entraban al top de más de una keyword porque todo artículo de salud los usa. Como exigencia son inútiles y cada uno empuja fuera del corte de 20 a un término que sí pedía algo.
- **Fix:** Lista `RELLENO` en `entidades.ts`, más preposiciones que faltaban en las vacías (`hacia`, `traves`). Ninguna palabra con carga clínica entró a esas listas: `desplaza` y `grave` se quedan.
- **Files modified:** `seo-tools/src/phase15/entidades.ts`
- **Committed in:** `876d965`

**6. [Rule 2 - Calidad del entregable] 18 preguntas de la SERP descartadas por vocabulario incompleto**
- **Found during:** Task 2, primera corrida del generador
- **Issue:** Preguntas perfectamente respondibles ("¿Cuánto cuesta una cirugía de columna en Perú?", "¿Qué especialidades ofrece la Clínica Tezza?") caían en `preguntasSinUsar` porque las listas de conceptos tenían `costo` pero no `cuesta`, `neurocirujano` pero no `neurocirujanos`.
- **Fix:** Se ampliaron las listas de conceptos de página de servicio y ficha de sede, y una pregunta cuyo residuo queda vacío (o sea, la primaria vuelta a preguntar) va al desvío por defecto en vez de descartarse. De 18 descartadas se pasó a 1, y esa dice por escrito por qué.
- **Files modified:** `seo-tools/src/phase15/serp-onpage.ts`
- **Committed in:** `302017e`

---

**Total deviations:** 1 escalada al checkpoint y aprobada, 5 auto-corregidas (2 de Rule 1, 3 de Rule 2)
**Impact on plan:** Ninguna amplía el alcance. Las cinco automáticas son correcciones de calidad sobre un entregable que se publica en una página médica, y la escalada es exactamente la clase de decisión que el checkpoint existía para resolver.

## Issues Encountered

**Las pruebas heredadas de una sesión anterior condicionaron el diseño del criterio de entidades.** `model.ts` y `entidades.test.ts` estaban en disco sin commitear. Se conservaron porque codificaban fielmente las conductas del plan, y una de ellas fija el umbral por defecto en 0,4 sobre un corpus de siete documentos. Ese caso obligó a definir el n-grama como "n palabras de contenido consecutivas con sus vacías adentro" en vez de "n palabras adyacentes": con la segunda definición el fixture daba siete términos y el umbral bajaba solo, rompiendo la prueba. La definición que sobrevivió es además la correcta para el español, donde el nombre de una cosa lleva preposiciones adentro ("hernia de disco", "salida del núcleo pulposo").

**El corpus es más pobre de lo que el nombre TF-IDF sugiere, y está declarado como tal.** La captura no trae el cuerpo de las páginas que rankean: trae `title` y `snippet`. Por eso `hernia discal` bajó el umbral hasta 0,2 para llegar a ocho términos. El umbral aplicado se escribe en cada fila para que nadie lea "catorce entidades" como si todas vinieran de exigir el 40 % de los orgánicos.

## Requisitos: qué se cierra y qué no

El plan declara `requirements: [ONPAGE-02, ONPAGE-03, ONPAGE-06]`. Se marca uno solo.

| Requisito | Estado | Por qué |
| --- | --- | --- |
| ONPAGE-03 | **Cumplido** | Las 16 URLs traen su lista de entidades obligatorias derivada de los que ya posicionan, con procedencia por término. |
| ONPAGE-02 | Pendiente | Pide "H1 propuesto **y** jerarquía H2/H3" por URL. La jerarquía está para las 16; el H1 existe para una. Lo cierran los planes 15-03 a 15-06. |
| ONPAGE-06 | Pendiente | Pide el paquete de entrega por URL. Hay uno de dieciséis. Lo cierra el plan 15-07. |

Marcar los tres ahora dejaría la matriz de trazabilidad en verde sobre trabajo que no existe, y esa matriz es lo único que el plan 15-07 tiene para auditar.

## User Setup Required

Ninguno. El plan no instaló paquetes ni tocó credenciales.

## Known Stubs

Ninguno. `data/copy-guias.json` trae una sola URL de dieciséis a propósito: los planes 15-03 a 15-06 escriben las quince restantes, y `paquete.ts` lista bajo "Encabezados todavía sin copy" cualquier encabezado sin redactar en vez de emitir el documento como si estuviera completo.

## Threat Flags

Ninguno. El plan no abre endpoints, no toca autenticación y no cambia esquemas. Los cinco riesgos con disposición `mitigate` del registro de la fase quedaron cubiertos y verificados: cuota en 96 (T-15-01), cero secciones clínicas sin sello (T-15-02), cero afirmaciones con cifra sin fuente (T-15-03), cero archivos de `src/` en el staging de cada commit (T-15-04), SHA-256 de `url-map.jsonl` sin cambios (T-15-05) y procedencia coincidente en las 196 entidades (T-15-07).

## Verification

| Comprobación | Resultado |
| --- | --- |
| `cd seo-tools && npm test` | 565 pruebas, 0 fallos |
| `cd seo-tools && npm run typecheck` | sin salida |
| `npx tsc --noEmit` (app raíz) | código 0 |
| `npx tsc --noEmit --listFiles \| grep -c '/seo-tools/'` | 0 |
| SHA-256 de `url-map.jsonl` | `ada0a4a1...951b5`, sin cambios |
| SHA-256 de `keywords.jsonl` | `c59dad2d...cd7eac`, sin cambios |
| `.cache/_quota.json` → `sources.serpapi.calls` | 96, sin moverse |
| `git diff --cached --name-only -- src/` | vacío antes de cada commit |
| Determinismo de `onpage-serp.json` | mismo SHA-256 en dos corridas |
| Determinismo de `servicios-hernia-discal.md` | mismo SHA-256 en dos corridas |
| Palabras de la región de copy | 2951 en la región, 2483 de prosa, mínimo 1400 |
| Rayas largas y comillas tipográficas dentro de la región de copy | 0 |
| Secciones clínicas sin sello | 0 de 20 |
| Afirmaciones con cifra sin fuente | 0 |
| Menciones de Montefiori | 0 |

## Self-Check: PASSED

Los 9 archivos declarados existen en disco y los 3 commits existen en el historial. Verificado con `test -f` y `git log --oneline --all` el 2026-08-12.
