---
phase: 15-paquete-on-page-por-url
workstream: seo-keywords
plan: 06
subsystem: seo-tools
tags: [on-page, copy-de-blog, captacion, ymyl, humanizacion, canibalizacion, reescritura]
requires:
  - "seo-tools/data/onpage-serp.json: jerarquia, entidades y minimo de palabras por URL, del plan 15-01"
  - "seo-tools/data/onpage.json: title, meta y H1 de las 24 filas, del plan 15-02"
  - "seo-tools/src/phase15/ymyl.ts: la compuerta unica de la wave 3, del plan 15-02"
  - "seo-tools/src/phase15/paquete.ts con --data: el generador de documentos, de los planes 15-02 y 15-04"
  - "src/content/blog.ts en SOLO LECTURA: los dos posts publicados que se reescriben"
  - "14-ENLAZADO.md: las cuatro filas de enlazado saliente de los posts del blog"
provides:
  - "seo-tools/data/copy-blog.json: los cuatro posts del blog redactados de punta a punta"
  - "campo derivaA por pagina: hacia que URL deriva el post y con que anchor de la matriz"
  - "campo cambios por pagina reescrita: que se conservo, que se reemplazo y por que"
  - "campo mapeoDePost por pagina: como entra el copy en el tipo BlogPost de la aplicacion"
  - "bloque 'Como entra este copy en la estructura de post' en el paquete generado"
  - "el guard de divergencia title/meta/H1 cubre ahora los cuatro datasets de copy"
  - "cuatro documentos en paquetes/: artrosis, lumbalgia, ciatica y cirugia de columna"
affects:
  - "plan 15-07: cierra ONPAGE-04 y ONPAGE-06 con las dieciseis paginas y los veinticuatro documentos completos"
  - "workstream milestone: la fase 8 de v1.1 implementa estos cuatro posts sobre src/content/blog.ts"
tech-stack:
  added: []
  patterns:
    - "campo opcional en la fila de copy que el generador imprime solo si viene: mismo patron que enlacesPropuestos y datosOperativos"
    - "el limite entre captacion y guia se sostiene en el contenido, no en el mapa"
key-files:
  created:
    - seo-tools/data/copy-blog.json
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/blog-artrosis.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/blog-lumbalgia.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/blog-5-sintomas-de-columna-que-no-debes-ignorar.md
    - .planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/blog-miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber.md
  modified:
    - seo-tools/src/phase15/model.ts
    - seo-tools/src/phase15/paquete.ts
    - seo-tools/src/phase15/paquete.test.ts
    - seo-tools/src/phase15/metadatos.test.ts
decisions:
  - "El post de captacion nombra la relacion con la guia y no la explica: el limite se sostiene en el contenido"
  - "Una reescritura declara que conservo, y lo conservado se transcribe casi literal en vez de reescribirse por reescribirse"
  - "Las cuatro preguntas de dinero y de plazo se contestan sin dar una sola cifra"
  - "Un trigrama del extractor de entidades no se cubre escribiendo mal el castellano"
metrics:
  duration: "~1h 30min"
  completed: 2026-08-13
  tasks: 3
  files: 9
status: complete
---

# Phase 15 Plan 06: Los cuatro posts del blog Summary

Los cuatro posts que quedan vivos en el silo de captacion quedaron redactados de punta a punta,
6595 palabras de prosa contra un minimo de 3600, cada uno derivando hacia la guia de su tema en
vez de competir contra ella.

## Que se hizo

**Task 1, los dos posts nuevos.** `/blog/artrosis` con 1791 palabras y `/blog/lumbalgia` con 1532,
las dos creadas desde keywords de oro que ninguna URL viva podia ganar. Las dos usan el 100 % de
sus entidades obligatorias, cubren cada secundaria del mapa con una seccion propia y ninguna se
lleva por titulo la primaria de otra URL. Commit `992cd5e`.

**Task 2, los dos posts publicados.** `5-sintomas-de-columna-que-no-debes-ignorar` reescrito sobre
`ciatica` con 1775 palabras, y `miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` reescrito
sobre `cirugia de columna` con 1497. Cada uno lleva un campo `cambios` con seis entradas que dicen
que se conservo, que se reemplazo y por que. Commit `4b1d339`.

**Task 3, los cuatro documentos.** Generados con `paquete.ts --data data/copy-blog.json`, no a mano
(D-12). Cada uno trae dos cosas que las otras familias no necesitan: el mapeo del copy a la
estructura de post que la aplicacion ya usa, y la tabla de enlazado con el destino de derivacion.
Dos corridas dan el mismo SHA-256 en los cuatro. Commit `839ec68`.

## El limite que define si el blog suma o resta

La canibalizacion se midio en la fase 14 sobre el mapa: 120 pares, cero conflictos. Ese resultado
se apoya en el reparto de temas, y un post que se convierte en la segunda guia de su condicion lo
rompe por la puerta del contenido aunque el mapa siga limpio. Los cuatro posts explican el sintoma
o la decision desde donde la vive el paciente y derivan:

| URL | Deriva a | Anchor | Regla |
|---|---|---|---|
| `/blog/artrosis` | `/servicios` | cirujano de columna lima | navegacion-de-seccion |
| `/blog/lumbalgia` | `/servicios/hernia-discal` | hernia discal lumbosacra tratamiento | mencion-inversa |
| `/blog/5-sintomas-...` | `/servicios/hernia-discal` | hernia discal lumbar y cervical | mencion-inversa |
| `/blog/miedo-a-operarte-...` | `/servicios/cirugia-minimamente-invasiva` | cirugia endoscopica de columna | mencion-inversa |

El caso de artrosis es el unico donde la matriz no dio una mencion inversa hacia una guia concreta,
porque la artrosis es una enfermedad articular general y ninguna de las cinco guias la cubre entera.
El destino que la matriz si le asigna es el hub, y el `derivaA` lo registra con el motivo escrito
para que nadie lo lea como un olvido. El post ademas dice en su ultima seccion que cuando el
desgaste es de columna y ya hay dolor irradiado el caso deja de manejarse como un problema
articular aislado, que es el puente al hub.

El post de lumbalgia era el mas delicado: `lumbalgia o hernia discal` es secundaria de la guia de
hernia desde el plan 14-02. La seccion `especialista en lumbalgia` nombra la relacion y remite a la
guia con todas las letras, y en ningun lado se explica que es una hernia discal.

## Decisiones tomadas

**El limite entre captacion y guia se sostiene en el contenido y no en el mapa.** Cada `notaDeFormato`
lo declara por escrito: la SERP pide guia clinica y el esqueleto es el mismo de las guias de
servicio, y aun asi el post no entra en tratamiento ni en decision quirurgica en profundidad. Quien
lea el paquete dentro de seis meses tiene que poder distinguir que parte fue medicion y que parte
fue decision.

**Una reescritura declara que conservo, y lo conservado se transcribe casi literal.** Los dos posts
salieron el 2026-06 antes de que existiera el mapa, y esa es la razon por la que se reescriben, no
que esten mal hechos. Ocho pasajes del contenido publicado entraron casi textuales al copy nuevo:
las resonancias alteradas en gente sin dolor, las tres situaciones que se evaluan el mismo dia, el
consejo de anotar como se comporta el dolor, que no toda hernia termina en cirugia, que la imagen
no manda sobre la decision, las razones concretas para operar, la forma del plan de recuperacion y
que significa una decision informada. Cada uno viaja en `afirmaciones` con la linea de
`src/content/blog.ts` de la que salio.

**Las cuatro preguntas de dinero y de plazo se contestan sin dar una sola cifra.** Precio, costo,
riesgo y tiempo de recuperacion son las cuatro secciones donde mas tienta tranquilizar con numeros,
y ninguno esta verificado (D-10). Se contesta explicando de que depende cada cosa y que pedir por
escrito en la consulta. El post entero de cirugia no tiene un solo porcentaje, un solo plazo ni un
solo precio, y eso es lo mas deliberado de la pagina.

**Un trigrama del extractor no se cubre escribiendo mal el castellano.** La cobertura de
`/blog/5-sintomas-de-columna-que-no-debes-ignorar` quedo en 13 de 16 entidades, 81,3 %, sobre el
umbral del 80 %. Las tres que faltan son `ciatico el nervio`, `ciatico el nervio ciatico` y
`nervio ciatico el nervio`: trigramas que el extractor de la fase 15-01 saco de fragmentos donde una
oracion termina y otra empieza. La comparacion se hace sin quitar puntuacion, asi que cubrirlas
exigiria una aposicion sin coma que en castellano esta mal escrita. Es el mismo criterio que el
plan 15-05 aplico con `rodriguez` y el 15-04 con los encabezados que nombran colegas: el margen del
umbral existe para esto.

## Desviaciones del plan

### Ajustes automaticos

**1. [Regla 3 - Bloqueo] El generador no sabia imprimir el mapeo a la estructura de post**
- **Encontrado en:** Task 3
- **Problema:** la accion de la task pide que cada documento del blog traiga el mapeo del copy a la
  estructura de post, y los documentos se generan y no se editan a mano (D-12). `paquete.ts` no
  tenia como renderizar ese bloque, asi que la task no se podia completar sin tocarlo.
- **Arreglo:** campo opcional `mapeoDePost` en la fila de copy y bloque `bloqueDeMapeoDePost` en el
  generador, que se imprime FUERA de la region de copy y solo si la fila lo trae. Es el mismo patron
  aditivo de `enlacesPropuestos` (15-04) y `datosOperativos` (15-05): las filas de las otras tres
  familias no lo declaran y sus documentos no cambian ni un byte.
- **Archivos:** `seo-tools/src/phase15/model.ts`, `seo-tools/src/phase15/paquete.ts`,
  `seo-tools/src/phase15/paquete.test.ts`
- **Commit:** `839ec68`

**2. [Regla 2 - Falta critica] El guard de divergencia no cubria el dataset de esta familia**
- **Encontrado en:** Task 3
- **Problema:** el plan 15-05 dejo el cruce de title, meta y H1 contra el mapa corriendo sobre tres
  datasets. `copy-blog.json` es el cuarto y quedaba sin guardia, que es exactamente el falso verde
  que ese cruce existe para impedir: la auditoria del 15-07 daria limpia sobre un dataset y v1.1
  publicaria el otro.
- **Arreglo:** `copy-blog.json` agregado a la lista del cruce en `metadatos.test.ts`. Pasa en verde,
  lo que confirma que las cuatro filas nuevas no divergen de `data/onpage.json`.
- **Archivos:** `seo-tools/src/phase15/metadatos.test.ts`
- **Commit:** `839ec68`

**3. [Regla 1 - Bug] Un voseo en el copy del post de ciatica**
- **Encontrado en:** Task 2
- **Problema:** la frase de cierre de `como quitar el dolor de ciatica en 3 minutos` decia "puede
  hacer por vos". El sitio escribe en castellano neutro de Peru y tutea en las cuatro paginas.
- **Arreglo:** cambiado a "por ti" y barrido el dataset entero contra las formas de voseo. No hay
  otra.
- **Commit:** `4b1d339`

### Dos vueltas contra la compuerta

La regla `cifra-del-doctor` freno la primera frase de `Que es la cirugia de columna` dos veces
seguidas: "no nombra una operacion sino varios procedimientos" y despues "es un termino amplio y
abarca procedimientos". El patron pide un cuantificador y el sustantivo dentro de la misma oracion,
y "un" delante de "procedimientos" lo dispara aunque no haya ninguna cantidad declarada. Se reescribio
la oracion partiendola en dos, que es lo que corresponde: la regla se arregla escribiendo distinto,
no aflojando el patron.

## Verificacion

| Comprobacion | Resultado |
|---|---|
| `ymyl.ts --data data/copy-blog.json` | 4 paginas, **0 hallazgos**, salida 0 |
| `npm test` en seo-tools | **609 en verde**, 0 fallos |
| `npm run typecheck` en seo-tools | sin salida |
| `npx tsc --noEmit --listFiles \| grep -c '/seo-tools/'` en la app | 0 |
| Palabras de prosa | 1791, 1532, 1775 y 1497 contra un minimo de 900 cada una |
| Cobertura de entidades | 100 %, 100 %, 81,3 % y 100 % contra un piso de 80 % |
| Determinismo del generador | los cuatro documentos con el mismo SHA-256 en dos corridas |
| SHA-256 de `data/url-map.jsonl` | `ada0a4a1...951b5`, sin cambios |
| Cuota de SerpApi | **96**, ni una busqueda gastada |
| `git diff --cached --name-only -- src/` | vacio en los tres commits |

## Lo que hereda el plan 15-07

**De este plan.** Ochenta y dos secciones clinicas selladas como pendiente-doctor, repartidas en
cuatro paginas: 20 en artrosis, 19 en lumbalgia, 23 en ciatica y 20 en cirugia de columna. Las que
mas necesitan el ojo del doctor estan senaladas en la guia de cada paquete. Dos merecen prioridad
sobre las demas: las tres secciones del post de ciatica que contradicen la promesa de aliviar el
dolor en dos o tres minutos, porque contradecir una creencia muy difundida en una pagina medica
conviene hacerlo con respaldo; y el bloque de secuelas y riesgo del post de cirugia, que enumera
complicaciones sin dar ninguna probabilidad.

**De la wave 3 entera.** Con este plano cierran las dieciseis paginas con copy y los veinticuatro
documentos. El 15-07 tiene que auditar la trazabilidad completa y armar la ronda unica del doctor
(D-09) sobre todo lo que las cuatro familias sellaron, mas los diez datos operativos pendientes de
confirmacion que dejo el 15-05 en las fichas de sede. ONPAGE-04 y ONPAGE-06 quedan listos para
marcarse.

## Self-Check: PASSED

Los cinco artefactos existen en disco y los tres commits estan en el historial:
`992cd5e`, `4b1d339` y `839ec68`.
