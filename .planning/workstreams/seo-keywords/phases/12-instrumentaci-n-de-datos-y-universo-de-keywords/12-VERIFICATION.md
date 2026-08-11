---
phase: 12-instrumentaci-n-de-datos-y-universo-de-keywords
workstream: seo-keywords
verified: 2026-08-11T00:49:34Z
status: passed
score: 6/6 must-haves verificados
behavior_unverified: 0
overrides_applied: 0
cuota_gastada_por_esta_verificacion:
  dinorank: 0
  serpapi: 0
  sheets_escrituras: 0
deferred:
  - truth: "`/auditoria` y `/canibalizaciones` devuelven datos reales para drangulocolumna.com"
    addressed_in: "Fase 14 (MAP-02) y Fase 15 (ONPAGE-05)"
    evidence: "ROADMAP.md fase 12, notas de ejecución: «Pendiente que hereda la fase 14, y no depende de este workstream: hay que dar de alta drangulocolumna.com antes de MAP-02 y ONPAGE-05». Los dos endpoints no consumen cuota."
  - truth: "La forma de las filas de `arrayKeywords` y `arrayCanibaliza` está documentada"
    addressed_in: "Fase 14 (MAP-02)"
    evidence: "12-05-SUMMARY.md: «MAP-02 tendrá que resondear cuando exista un proyecto con datos». El proyecto sondeado no tiene Search Console conectado."
  - truth: "Cada keyword trae KD, traffic potential y referring domains needed"
    addressed_in: "Sin fase asignada (enriquecimiento diferido); la fase 13 decide el proxy de dificultad"
    evidence: "REQUIREMENTS.md KWR-02, segunda enmienda del 2026-08-10: «Ahrefs queda fuera de la fase 12 por completo». ROADMAP.md fase 13, criterio 3, recoge la consecuencia sobre KWR-05."
  - truth: "El TF-IDF comparativo contra el corpus de competidores está disponible"
    addressed_in: "Fase 15 (ONPAGE-03), con alcance reducido"
    evidence: "`global.totalUrls: 0` verificado en la fixture: el proveedor no resuelve corpus comparativo para Perú. Sólo funciona la extracción on-page de la URL propia."
human_verification:
  - test: "Decidir si el `project_id` \"138969\" que quedó en `_probe.request` de las dos fixtures seudonimizadas se limpia o se acepta"
    expected: "El identificador es un entero interno de la cuenta de DinoRank de Juan, no contenido del tercero. Pero la fixture declara `seudonimizada: true` y su nota dice que «los identificadores están seudonimizados», y ese identificador concreto no lo está. Cruzado con 12-05-SUMMARY.md línea 216 («site_id 138969, un hotel de Miraflores»), el repositorio compartido guarda proyecto + rubro + distrito de un cliente ajeno."
    why_human: "Es una decisión de privacidad sobre un tercero, no una propiedad del código. Remediación de dos minutos si Juan la quiere: reemplazar el valor por `900000001` en los dos bloques `_probe.request` y quitar el descriptor del SUMMARY."
  - test: "Decidir qué hace la fase 13 con las 628 keywords de alcance `objetivo` que no tienen volumen, entre ellas `hernia discal` y `estenosis espinal`"
    expected: "Dos de las cuatro condiciones núcleo del handoff MAP-03 entran a la fase 13 sin volumen, CPC ni competencia. REQUIREMENTS.md registra que Ahrefs sí las conoce (`hernia discal`: 6.000 en Perú) y que ese enriquecimiento quedó diferido sin fase asignada."
    why_human: "La priorización de las 10 de Oro es un juicio de negocio. Hay que decidir si se reincorpora Ahrefs para la shortlist o si se prioriza con el proxy de SERP, y eso ya está marcado como decisión de la fase 13."
  - test: "Confirmar la lectura del criterio 4 del ROADMAP frente a la decisión J-3"
    expected: "El criterio pide «una columna que indica de qué fuente salió cada dato». Esa columna existe por métrica en `keywords.jsonl` (`searchVolumeFuente`, `cpcFuente`, `competitionFuente`, resueltas en el 100 % de las 5716 líneas) y NO existe en el Sheet, por decisión J-3 de Juan del 2026-08-10, registrada en 12-CONTEXT.md."
    why_human: "La decisión existe y es explícita, pero el texto del criterio 4 en ROADMAP.md no la referencia como sí referencia la enmienda de Ahrefs. Conviene añadir el puntero para que la auditoría del milestone no lo relea como incumplimiento."
---

# Fase 12: Instrumentación de datos y universo de keywords — Informe de verificación

**Objetivo de la fase:** quedan conectadas y cacheadas las fuentes de datos, la escritura en el
Sheet del cliente deja de ser manual, y existe el universo completo de keywords del negocio del
doctor con sus métricas e intención.

**Verificado:** 2026-08-11T00:49:34Z
**Estado:** `human_needed` — el objetivo se cumple; hay tres decisiones que le corresponden a Juan.
**Reverificación:** no, es la verificación inicial.

**El objetivo de la fase está cumplido.** Los cinco criterios del ROADMAP se sostienen contra el
código, contra los datos y contra el documento vivo del cliente. Ninguna verdad quedó en FAILED,
ningún artefacto es un stub, ningún enlace clave está desconectado y no hay un solo marcador de
deuda sin referencia. Lo que impide cerrar como `passed` no es una falla: son tres puntos que
requieren una decisión humana, y el más pesado de los tres es de privacidad sobre un tercero.

---

## Verdades observables

| # | Verdad | Estado | Evidencia |
|---|--------|--------|-----------|
| 1 | Ejecutar un comando del repo escribe celdas en el Sheet del cliente; ninguna credencial en el control de versiones | VERIFICADA | Lectura en vivo del documento `1aowectb…`: tab `Keyword Research`, 5716 filas de datos, encabezados en la fila 3. Cruce fila a fila contra `keywords.jsonl`: **45.728 comparaciones, 0 discrepancias**. `git log --all -- '.secrets*'` vacío; `git ls-files` sin credenciales; cero cadenas de 32+ caracteres en `seo-tools/data/` |
| 2 | Una consulta ya hecha se responde desde caché: el análisis completo se reprocesa sin gastar cuota | VERIFICADA | `kw:enrich --offline --yes` sobre el universo entero: **`llamadas de red a DinoRank en esta corrida: 0`**, 155 aciertos de caché, 473 ausencias tratadas sin romper. `_quota.json` sin cambio (187) y `keywords.jsonl` **byte-idéntico** tras el reproceso |
| 3 | El universo tiene 400+ keywords expandidas por condición, procedimiento, síntoma, especialidad y sede | VERIFICADA | `wc -l keywords.jsonl` = **5716**, 5716 `keywordKey` únicos, 0 duplicados. Las 5716 trazan a las 66 semillas de `seeds.json`: condición 3162, especialidad 2369, procedimiento 145, síntoma 27, sede 11, pregunta 2. 0 keywords sin campo `semilla`. 198 con marca geo. **0 keywords de otra ciudad del Perú** |
| 4 | Volumen, CPC y competencia de DinoRank con fuente por dato; KD y traffic potential en `no_consultado` | VERIFICADA (con J-3) | Sobre las 5716 líneas: `trafficPotential`, `keywordDifficulty` y `referringDomainsNeeded` = `no_consultado` en **5716/5716**, un solo valor distinto, confirmado también leyendo el Sheet vivo. Procedencia declarada en **5716/5716** (5087 `dinorank`, 629 `sin_datos`). La columna de fuente vive en el dataset y no en el Sheet, por decisión J-3 → punto 3 de verificación humana |
| 5 | Cada keyword clasificada por intención y etapa; cargar dos veces deja el mismo número de filas | VERIFICADA | Intención en 5716/5716 con exactamente los cuatro valores (informacional 3509, comercial 1606, transaccional 529, navegacional 72). Etapa en 5716/5716 con los tres (diagnóstico 3998, decisión 1300, síntoma 418). `sheet:push --dry-run` contra el documento real: **`actualizadas: 5716, insertadas: 0, filas eliminadas: 0`**. En el Sheet: 5716 keywords distintas, **0 duplicadas** |
| 6 | El guardarraíl de build de v1.1 sigue en pie (invariante transversal, 12-01) | VERIFICADA | `npx tsc --noEmit --listFiles \| grep -c '/seo-tools/'` = **0**. `npx tsc --noEmit` de la app = **exit 0, 0 líneas de salida**. `npm run lint` limpio. Los 29 commits de la fase tocan **66 rutas**, todas bajo `seo-tools/` o `.planning/workstreams/seo-keywords/`, salvo dos: `tsconfig.json` y `eslint.config.mjs`, cuyo diff completo son **4 líneas** y son el guardarraíl mismo |

**Score: 6/6 verdades verificadas.** 0 en comportamiento sin ejercitar.

---

## Artefactos requeridos

| Artefacto | Esperado | Nivel 1 existe | Nivel 2 sustantivo | Nivel 3 cableado | Nivel 4 dato fluye | Estado |
|-----------|----------|----------------|--------------------|------------------|--------------------|--------|
| `seo-tools/src/cache.ts` | Seam de caché en disco | sí | 361 líneas | toda fuente pasa por él | 186+12 entradas, 20 MB | VERIFICADO |
| `seo-tools/src/quota.ts` | Libro de cuota persistido | sí | 145 líneas | `_quota.json` en disco | 187 dinorank / 12 serpapi | VERIFICADO |
| `seo-tools/src/http.ts` | Envoltorio de red con reintento | sí | 86 líneas | **único `fetch(` del paquete** | reintento con retroceso, con prueba | VERIFICADO |
| `seo-tools/src/sources/dinorank.ts` | Los cuatro endpoints de INFRA-02 | sí | 728 líneas | `keyword-research`, `tfidf`, `auditoria`, `canibalizaciones` exportados y por el seam | 4 fixtures reales de Perú | VERIFICADO |
| `seo-tools/src/sources/serpapi.ts` | Expansión por SERP real | sí | 194 líneas | por el seam | 12 respuestas cacheadas | VERIFICADO |
| `seo-tools/src/sheets/schema.ts` | Modelo del documento, diff, escaneo de referencias | sí | 856 líneas | guarda de tab transpuesto en `:333` | 11 tabs volcados | VERIFICADO |
| `seo-tools/src/sheets/upsert.ts` | Escritor idempotente | sí | 728 líneas | `valueInputOption` fijado a `RAW`, con aserción | 5716 filas escritas | VERIFICADO |
| `seo-tools/src/keywords/classify.ts` | Motor determinista de intención y etapa | sí | 429 líneas | `ORIGENES_DE_INTENCION = ["reglas","llm"]` | 5716 clasificadas | VERIFICADO |
| `seo-tools/src/keywords/enrich.ts` | Enriquecimiento con cosecha de caché | sí | 347 líneas | `verificarDiferidas()` aborta la escritura | 5087 con métricas | VERIFICADO |
| `seo-tools/data/keywords.jsonl` | Universo consolidado | sí | 5716 líneas, 3,6 MB | entrada de `sheet:push` | ver criterio 4 | VERIFICADO |
| `seo-tools/data/candidates.jsonl` | Universo candidato | sí | 5716 líneas, 1,3 MB | entrada de `kw:classify` | 666 sólo por permutación (>400 sin red) | VERIFICADO |
| `seo-tools/data/fixtures/` (4) | Contrato real de cada endpoint | sí | 10k–41k cada una | los parsers se prueban contra ellas | ver sección de privacidad | VERIFICADO |
| `.planning/…/data/sheet-headers.json` | Los 11 tabs para las fases 13-15 | sí | 11 tabs con fila y orientación | espacios finales preservados (`"Search Intent "`) | las fases 13-15 leen sin consultar el Sheet | VERIFICADO |
| `tsconfig.json` / `eslint.config.mjs` de la raíz | Guardarraíl de build | sí | 4 líneas de diff | `exclude: [… "seo-tools"]` | 0 archivos en el programa del compilador | VERIFICADO |

Ningún artefacto quedó ORPHANED, STUB, HOLLOW ni MISSING.

---

## Enlaces clave

| Desde | Hacia | Vía | Estado | Detalle |
|-------|-------|-----|--------|---------|
| `tsconfig.json` raíz | `seo-tools/` | `exclude` | CABLEADO | 0 archivos de `seo-tools` en `--listFiles`; app compila con exit 0 |
| toda fuente | `cache.ts` | seam obligatorio | CABLEADO | un solo `fetch(` en todo el paquete, dentro de `http.ts` |
| `cache.ts` | `normalize.ts` | clave normalizada | CABLEADO | la corrida offline resolvió 155 aciertos sobre claves ya escritas |
| `keywords.jsonl` | `sheet:push` | archivo, no estructura en memoria | CABLEADO | `--data data/keywords.jsonl` obligatorio; el comando falla sin él |
| `classify.ts` | `intent-overrides.json` | consulta previa a las reglas | CABLEADO | 38 líneas con `intentSource: "llm"`, el resto `reglas` |
| `enrich.ts` | guarda de diferidas | `verificarDiferidas()` | CABLEADO | lanza `CliError` si alguna de las tres pierde su literal |
| Sheet vivo | `keywords.jsonl` | columna clave `Suggested Keyword` | CABLEADO | 0 filas del Sheet sin pareja en el dataset |

---

## Comprobaciones de comportamiento

| Comportamiento | Comando | Resultado | Estado |
|----------------|---------|-----------|--------|
| Suite completa | `npm test` | **179 de 179 en verde** | PASA |
| Suite completa sin ninguna credencial | `env -u DINORANK_API_KEY -u SERPAPI_API_KEY -u SEO_SHEET_ID npm test` | **179 de 179 en verde** | PASA |
| Typecheck del tooling | `npm run typecheck` (seo-tools) | exit 0 | PASA |
| Typecheck de la app | `npx tsc --noEmit` (raíz) | **exit 0, 0 errores** | PASA |
| Guardarraíl de build | `npx tsc --noEmit --listFiles \| grep -c '/seo-tools/'` | **0** | PASA |
| Lint de la app | `npm run lint` | limpio | PASA |
| Reproceso offline del universo | `kw:enrich --offline --yes` | **0 llamadas de red**, dataset byte-idéntico | PASA |
| Idempotencia contra el documento real | `sheet:push --data data/keywords.jsonl --dry-run` | `actualizadas: 5716, insertadas: 0` | PASA |
| Conexión viva al Sheet | `sheet:inspect` | 11 tabs, `Keyword Research 5719x28`, fila 3 | PASA |
| Estado de caché y cuota | `cache:stats` | dinorank 186 entradas / 187 llamadas; serpapi 12 / 12 | PASA |
| Determinismo de la clasificación | prueba nombrada `comportamiento 10` | 1 de 1 en verde | PASA |
| Rechazo de credencial no se cachea | prueba nombrada `comportamiento 4` | 1 de 1 en verde | PASA |

**Cuota gastada por esta verificación: 0 llamadas a DinoRank, 0 a SerpApi, 0 escrituras en el
Sheet.** El libro de cuota quedó en 187 y 12, idéntico a como estaba antes de empezar. El árbol
de git quedó limpio.

---

## Cobertura de requisitos

| Requisito | Estado | Evidencia |
|-----------|--------|-----------|
| **INFRA-01** — un script escribe celdas en el Sheet con la service account | SATISFECHO | `sheet:inspect` y `sheet:push` resuelven contra el documento vivo; 5716 filas escritas y verificadas por lectura de vuelta |
| **INFRA-02** — cliente que consulta los cuatro endpoints con la clave fuera del control de versiones | SATISFECHO | Los cuatro declarados en `ENDPOINTS`, exportados como funciones, cada uno por el seam de caché y con parser probado contra fixture real de Perú. Ver el juicio detallado abajo |
| **INFRA-03** — toda respuesta cruda cacheada, reprocesar no consume cuota | SATISFECHO | Verificado en la fuente más cara: reproceso del universo entero con **0 llamadas de red** |
| **KWR-01** — 400+ keywords expandidas desde semillas | SATISFECHO | 5716, con 666 alcanzables sólo por permutación determinista sin red |
| **KWR-02** — volumen, CPC y competencia con fuente por columna; KD y TP en `no_consultado` | SATISFECHO con enmienda | Procedencia en 5716/5716; las tres diferidas en 5716/5716. Enmendado dos veces el 2026-08-10 por decisión de Juan |
| **KWR-03** — intención y etapa del paciente | SATISFECHO | 5716/5716 en ambas, con los cuatro y los tres valores presentes |
| **SHEET-06** — recargar actualiza en vez de duplicar | SATISFECHO | `insertadas: 0` contra el documento real, y 0 keywords duplicadas leyendo el Sheet |

Sin requisitos huérfanos: los 7 declarados en ROADMAP.md aparecen en los planes y todos quedan
cubiertos.

---

## Privacidad de las fixtures de terceros

El punto más delicado de la fase, y el que verifiqué con más cuidado porque la instrucción era
que cualquier dato real superviviente es bloqueante.

**Lo que comprobé:** extraje *todas* las cadenas distintas del cuerpo `response` de las dos
fixtures seudonimizadas, sin muestrear.

| Fixture | Cadenas distintas en `response` | Contenido de tercero |
|---------|-------------------------------|----------------------|
| `dinorank-auditoria-pe.json` | 106 | **0** |
| `dinorank-canibalizaciones-pe.json` | 20 | **0** |

Las 126 son, sin excepción: seudónimos estables (`ejemplo-de-proyecto.com`, `pagina-1` a
`pagina-18`, `Texto de ejemplo 1` a `17`), identificadores reemplazados (`900000001` a
`900000019`), tokens estructurales (`auditoria`, `summary`, `PE`, `es`) y siete tiempos de carga
en segundos. **La afirmación «0 de 54 sobreviven» se sostiene.** La relación de duplicidad, que
es lo que ONPAGE-05 tiene que detectar, sobrevivió intacta: la fixture sirve para probar el
parser sin exponer nada.

**Lo que sí quedó, y por eso esto va a decisión de Juan:** el bloque `_probe.request` de las dos
fixtures conserva `"project_id": "138969"` sin seudonimizar, mientras `site.id` dentro de
`response` sí se reemplazó por `900000001`. La nota de la propia fixture afirma que «los
identificadores están seudonimizados», y ese no lo está. Cruzado con 12-05-SUMMARY.md línea 216,
que describe el proyecto como «un hotel de Miraflores», el repositorio compartido guarda número
de proyecto + rubro + distrito de un cliente ajeno.

**Mi lectura:** no es contenido del tercero ni permite recuperarlo sin acceso a la cuenta, así
que no lo marco como bloqueante por sí solo. Pero la verificación automática que el plan montó
está acotada al cuerpo `response` y no cubre la metadata de la sonda, y esa brecha es real. La
remediación son dos minutos. La decisión es de Juan.

---

## Los cinco puntos abiertos, juzgados uno por uno

### 1. `/auditoria` y `/canibalizaciones` sin proyecto en DinoRank — **no bloquea**

INFRA-02 pide *un cliente que consulte* los cuatro endpoints. El cliente los consulta: los cuatro
están declarados, exportados, resuelven su URL, pasan por el seam de caché (prueba nombrada: la
segunda invocación no llama a la red) y tienen parser escrito contra una respuesta real. Que dos
devuelvan error es un estado de la cuenta del proveedor, no una carencia del código, y la
distinción está registrada tanto en REQUIREMENTS.md (INFRA-02: «es requisito del proveedor, no del
cliente») como en las notas de ejecución del ROADMAP, que lo asignan explícitamente a las fases 14
y 15. Ninguno de los dos consume cuota, así que resondear es gratis. **Diferido con decisión
registrada, no faltante.**

Lo que sí es una incompletitud real y honesta: la forma de las filas de `arrayKeywords` y
`arrayCanibaliza` sigue sin conocerse, porque el proyecto sondeado no tiene Search Console. El
parser las trata como arreglos opacos y la prueba «los tres parsers nuevos son tolerantes»
garantiza que una respuesta degradada no rompe la corrida, pero MAP-02 va a tener que resondear.
El 12-05-SUMMARY lo dice sin adornarlo.

### 2. Seudonimización de las fixtures — **verificada; una salvedad de metadata**

Ver la sección anterior. El cuerpo de la respuesta está limpio, comprobado sobre el 100 % de las
cadenas y no sobre una muestra.

### 3. `/tfidf` con `global.totalUrls: 0` — **no bloquea; condiciona a la fase 15**

Comprobado por mí en la fixture: `global.totalUrls = 0`, `df = {"hernia discal": 0}` y
`absolutos` sólo trae `urlCompara`. El corpus comparativo no existe para Perú. Lo que sí llega es
la extracción on-page de la URL propia, completa: `numPalabras.urlCompara = 468` y el árbol de
encabezados. Es una limitación del proveedor para este mercado, está documentada en el README y
en el SUMMARY, y su consecuencia recae sobre ONPAGE-03 en la fase 15, no sobre el objetivo de la
fase 12. **Diferido con decisión registrada.**

### 4. Las keywords sin métricas — **la cifra y la razón que me pasaron están mal; la del SUMMARY está bien**

Conté sobre el archivo. **No son 724 sino 629**, y sobre todo **no son términos fuera de
alcance**:

| | keywords | con métricas | sin métricas |
|---|---:|---:|---:|
| alcance `objetivo` | 4766 | 4138 | **628** |
| alcance `fuera_de_alcance` | 950 | **949** | 1 |

Las 950 fuera de alcance —veterinaria 179, académico 234, marca ajena 130, codificación clínica
106, geo ajena 92 y cuatro categorías más— **sí tienen métricas casi todas**. Las que no las
tienen son de negocio. El 12-05-SUMMARY lo dice correctamente en sus líneas 278-282 (628 de
alcance objetivo, 129 términos cabecera consultados y desconocidos para la fuente, 499 frases
largas no consultadas); el 724 es la cifra *anterior* a ese mismo plan, que la bajó a 629.

La decisión de no gastar las 499 llamadas está bien fundada y la revisé: medición directa (20
consultas, 0 resueltas), medición del plan 12-03 (15 de 40 semillas en cero, todas de cuatro o más
palabras) y una razón estructural verificable en la fixture —la keyword consultada nunca vuelve
dentro de su propio `keywords[]`, así que consultarla directo no puede resolverla—. La regla quedó
como bandera `--max-words` con prueba, no como decisión de una corrida. Eso es prudencia bien
ejercida.

**Lo que sí hay que mirar:** entre las 628 sin volumen están `hernia discal` y `estenosis
espinal`, dos de las cuatro condiciones núcleo del handoff MAP-03. REQUIREMENTS.md registra que
Ahrefs sí conoce `hernia discal` en Perú con 6.000 de volumen y KD 5, y que ese enriquecimiento
quedó diferido. La celda del Sheet queda vacía y no en cero, que es la decisión correcta —un cero
ahí afirmaría algo que nadie midió—, pero la fase 13 entra a priorizar sin ese dato. Va a
verificación humana.

### 5. Los tres criterios de aceptación mal escritos — **los tres equivalentes prueban lo mismo; los corrí**

| Criterio | Lo que pedía | Por qué no podía pasar | Equivalente que corrí | Resultado |
|---|---|---|---|---|
| 12-04 #5 | `sheet-columns.json → c.fields` | El archivo declara `columns`, no `fields`; `Object.values(undefined)` lanza `TypeError` | Conteo sobre la forma real | 21 columnas declaradas, **6 con `field` mapeado** — la fase escribe sólo lo suyo |
| 12-04 #6 | `grep -rniE "ahrefs" src data` = 0 | Las 3 coincidencias son los nombres literales de columnas del documento del cliente, que J-1 prohíbe renombrar | `grep -rniE "ahrefs" src` | **0** en `src/`, y las 3 de `data/` son `"header": "Volume (Ahrefs)"` y sus dos hermanas, con `"field": null` y nota J-1 |
| 12-05 #5 | `o.volumeSource` | Ese campo no existe; el esquema lo llama `metricas.searchVolumeFuente` | Conteo sobre el nombre real | `volumeSource`: **0 líneas lo tienen**. `metricas.searchVolumeFuente`: **5716/5716 = 100 %** |

Los tres equivalentes verifican exactamente la propiedad que el criterio original quería
verificar. El patrón que se repite —criterios escritos contra un esquema imaginado en vez del que
produjo el plan anterior— está bien identificado en los SUMMARYs y vale la pena corregirlo al
planificar la fase 13.

---

## Antipatrones

| Búsqueda | Resultado | Severidad |
|----------|-----------|-----------|
| `TBD`, `FIXME`, `XXX` en `src/`, `README.md`, `docs/` | **0** | — |
| `TODO`, `HACK`, `PLACEHOLDER` | 2 coincidencias, ambas la palabra española «TODO» en mayúsculas dentro de un comentario («existen para TODO el universo») | falso positivo |
| «no implementado», «próximamente», «coming soon» | 1, dentro de un comentario que explica por qué *no* se usa esa salida | falso positivo |
| `fetch(` fuera de `http.ts` | **0** | — |
| Retornos vacíos / handlers stub | ninguno; los diez módulos clave suman 4.329 líneas | — |
| Escrituras en `src/`, `.planning/workstreams/milestone/` o el `.planning/` de la raíz | **0** en los 29 commits de la fase | — |

**Puerta de marcadores de deuda: limpia.** No hay ningún marcador sin referencia formal.

---

## Aislamiento respecto del workstream `milestone`

Verificado sobre los 29 commits cuyo mensaje lleva el prefijo de la fase. Tocan 66 rutas:

- **64** bajo `seo-tools/` o `.planning/workstreams/seo-keywords/`
- **2** en la raíz: `tsconfig.json` y `eslint.config.mjs`, con un diff total de cuatro líneas
  (`"seo-tools/**"` en los ignorados de ESLint, `"seo-tools"` en el `exclude` del compilador).
  Es el guardarraíl mismo, y es lo que hace que el `next build` de v1.1 no vea el paquete.

Cero rutas bajo `src/`, cero bajo `.planning/workstreams/milestone/`, cero en
`.planning/STATE.md`, `ROADMAP.md` o `REQUIREMENTS.md` de la raíz. La restricción dura del
milestone se respetó.

---

## Resumen

Verifiqué corriendo, no leyendo. Los 179 tests pasan, y pasan también con todas las credenciales
desactivadas. El guardarraíl que protege el despliegue de la otra sesión está en pie y su huella
en la raíz son cuatro líneas. El reproceso completo del universo cuesta cero llamadas de red y
devuelve un archivo byte-idéntico. El documento del cliente contiene 5716 filas que coinciden con
el dataset del repositorio en 45.728 comparaciones sin una sola discrepancia, con las tres métricas
diferidas en `no_consultado` en el 100 % del universo y con `Cluster`, `URL`, `Suggested H1`,
`Top Result` y `Notes` correctamente vacías porque son de las fases 13 a 15.

Lo que queda abierto son cuatro diferidos con decisión registrada —Ahrefs, los dos endpoints que
necesitan proyecto en DinoRank, la forma de las filas de canibalización y el TF-IDF comparativo—
y tres decisiones para Juan: el `project_id` del tercero que sobrevivió en la metadata de dos
fixtures, qué hace la fase 13 con `hernia discal` y `estenosis espinal` sin volumen, y el puntero
de J-3 en el criterio 4 del ROADMAP.

Ninguno de ellos es trabajo sin hacer.

---

*Verificado: 2026-08-11T00:49:34Z*
*Verificador: Claude (gsd-verifier)*

---

## Resolución de los puntos abiertos — 2026-08-10

Los tres ítems que dejaron esta verificación en `human_needed` quedaron resueltos por decisión
de Juan. Estado final: **passed**.

**1. Fuga de metadata de tercero — CORREGIDA.** `project_id: 138969` sobrevivía sin
seudonimizar en el bloque `_probe.request`. Eran **tres** archivos, no dos: el de `tfidf`
también lo llevaba como `site_id`. Se redactaron los tres y se quitó del `12-05-SUMMARY.md` la
mención al rubro y al distrito. Barrido posterior sobre todo lo versionado: cero coincidencias
de `138969` y del rubro. Commit `f4be2c7`.

Juan confirmó además que la cuenta de DinoRank es suya y que sondear su otro proyecto era
aceptable. Se mantiene igual la práctica de seudonimizar antes de commitear.

**2. Hueco de métricas en las condiciones núcleo — CAUSA IDENTIFICADA, RESUELTO EN LA FASE 13.**
La cifra correcta es 629 sin métricas, no 724, y 628 son de alcance `objetivo`. Peor de lo
reportado: faltan las **cuatro** condiciones núcleo, no dos.

La causa es un límite de la fuente, no del tooling: **DinoRank trunca el array de relacionadas
en 900**, y la keyword consultada nunca aparece en su propio array. Medido y documentado en
`.planning/workstreams/seo-keywords/data/dinorank-limite-900-2026-08-10.md`, commit `a72349a`.

**Decisión de Juan: reincorporar Ahrefs solo para los términos cabecera.** Unas 20 a 30
keywords, incluidas las cuatro condiciones núcleo, sobre una cuenta Lite con unas 66.000
unidades libres. Resuelve el hueco y de paso zanja la discrepancia entre fuentes: Ahrefs
devolvía 6.000 de volumen para `hernia discal` en Perú donde DataForSEO devuelve 0.

Esto **enmienda por tercera vez** el alcance de Ahrefs en el milestone: fuera de la fase 12,
dentro de la fase 13 con alcance acotado a cabeceras.

**3. Dependencia de proyecto en DinoRank — RESUELTA A MEDIAS.** Juan dio de alta
`drangulocolumna.com`. Verificado en vivo: `site.id: 141563`, y `/auditoria` y
`/canibalizaciones` devuelven **HTTP 200** en vez del 500 anterior.

Pero el proyecto todavía no está operativo:
- `/auditoria` devuelve todos los arrays vacíos: DinoRank aún no rastreó el sitio.
- `/canibalizaciones` devuelve `has_data: false` y `last_searchconsole_date: null`:
  **Search Console sigue sin vincular al proyecto.**

Pendiente de Juan, no bloqueante para la fase 13: vincular la propiedad de Search Console (la
misma que confirmó suya en la fase 7 del workstream `milestone`) y esperar el primer rastreo.
Sin eso, MAP-02 de la fase 14 se queda sin fuente de canibalización.
