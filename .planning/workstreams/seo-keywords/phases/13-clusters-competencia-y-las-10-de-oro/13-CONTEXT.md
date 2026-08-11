# Phase 13: Clusters, competencia y las 10 de Oro - Context

**Gathered:** 2026-08-10
**Status:** Ready for planning
**Workstream:** `seo-keywords` (v1.2)

<domain>
## Phase Boundary

El universo plano de la fase 12 se convierte en clusters validados contra la SERP real de Lima,
con los cinco competidores perfilados al lado, y queda elegida la lista corta de keywords por
las que vale la pena pelear primero.

Lo que **no** entra: asignar keyword a URL (fase 14) y escribir copy (fase 15). Tampoco nada
dentro de `src/`, que es restricción dura del milestone.

</domain>

<decisions>
## Implementation Decisions

### El recurso escaso que gobierna esta fase

**Quedan 114 búsquedas de SerpApi hasta el 21 de agosto de 2026**, verificado contra
`serpapi.com/account`. El universo objetivo son 4.766 keywords. Capturar la SERP de cada una
sería el 2,4% de lo necesario. Todo el diseño de abajo sale de esa restricción.

Se descartó una alternativa antes de aceptar el compromiso: DinoRank devuelve campos `position`
y `url` por keyword, que habrían dado señal de SERP gratis. **Están vacíos en el 100% de los
casos** — medido sobre 12.223 keywords cacheadas. Solo se llenan en contexto de proyecto con
tracking activo. La captura de SERP necesita SerpApi de verdad.

### Clustering (KWR-04)

- **La captura de SERP se concentra en las candidatas a keyword primaria**, unas 90, filtradas
  por volumen, intención comercial o transaccional y relevancia de negocio. El entregable real
  de la fase no son 4.766 clusters: son los clusters de las 18 URLs mapeables más las 10 de
  Oro. Solo las keywords que podrían llegar a ser primaria necesitan precisión de SERP.
- **El resto del universo se agrupa por similitud de texto contra el head ya validado por
  SERP**, y esas filas se marcan `cluster_por_texto`. La marca no es decorativa: KWR-04 exige
  solape de SERP y no parecido de texto, así que hay que poder distinguir qué cluster está
  validado contra Google y cuál es inferencia. Sin la marca, el dataset miente sobre su propia
  procedencia.
- **Umbral de solape: 3 URLs compartidas en el top 10.** Debajo de eso, clusters separados.
- **Presupuesto de la fase: 90 búsquedas**, con 24 de reserva. Se reevalúa después del reset
  del 21 de agosto.
- Las 12 capturas de SERP de Lima que dejó la fase 12 ya están cacheadas y cuentan como hechas.

### Dificultad, punto dulce y las 10 de Oro (KWR-05, KWR-06)

- **Ahrefs vuelve, acotado a las mismas ~90 candidatas** (decisión de Juan, 2026-08-10). Con el
  `select` recortado a `difficulty` y `traffic_potential` son unas 1.800 unidades sobre una
  cuenta Lite con unas 66.000 libres. **Es la tercera enmienda al alcance de Ahrefs en este
  milestone**: pedido completo, luego shortlist, luego fuera de la fase 12, ahora dentro de la
  13 acotado a cabeceras. La razón es el hueco que dejó el techo de 900 de DinoRank.
- **Cuando Ahrefs y DinoRank discrepan, se publican las dos con la fuente marcada.** No se
  promedia ni se elige una. Ya se sabe que discrepan fuerte: `hernia discal` en Perú devuelve
  6.000 de volumen en Ahrefs y 0 en DataForSEO vía DinoRank. Ocultar una de las dos sería
  perder la única señal de que hay un problema de medición.
- **El punto dulce se calcula cruzando el KD de Ahrefs con quién ocupa realmente el top 10.**
  El dato declarado más la evidencia. Ninguno de los dos solo alcanza: KD es un promedio de
  mercado y no sabe que el competidor de la posición 3 es una clínica con marca; y la SERP sola
  no dice cuánto esfuerzo de enlaces hace falta.
- **Las 10 de Oro se eligen por valor de negocio primero y alcanzabilidad después.** Una
  condición que el doctor efectivamente opera, con SERP ganable, vale más que una keyword de
  volumen alto y genérica. La justificación tiene que poder leerse: Juan debe entender por qué
  esas diez y no las diez de mayor volumen.

### Competencia (COMP-01 a COMP-04)

- **Los cinco competidores quedan definidos.** Tres venían de la investigación de v1.0:
  `drcarranzacolumna.com`, `drciezatraumatologia.com`, `cirujanocolumna-elaos.com`. Los dos que
  faltaban salieron solos de la validación de SerpApi del 2026-08-10:
  - **`doctormunguia.com`** — Dr. Gunter Munguía, neurocirujano endoscopista de columna, Surco.
    Local pack posición 2, 4.8 con 24 reseñas.
  - **`clinicarthromeds.pe`** — orgánico posición 5, con una URL construida exactamente sobre la
    keyword geo: `/traumatologo-especialista-en-columna-lima-peru/`. Es el patrón que este
    proyecto quiere replicar.
- **DR y referring domains salen de Ahrefs**, cinco dominios, unas cinco llamadas. Es la única
  fuente que los tiene.
- **El gap de keywords (COMP-02) se deriva de las SERPs ya capturadas**: quién aparece donde el
  doctor no. Costo adicional cero. La alternativa, pedir `organic-keywords` por competidor a
  Ahrefs, es cara y no aporta para el tamaño de este proyecto.
- **Las keywords de marca ajena se usan como inteligencia, nunca como objetivo.** Las dos de
  mayor volumen de todo el universo son marca de competidores:
  `clinica san bernardo especialistas en traumatologia` (2.400) y
  `clinica de traumatologia arthrosalud` (1.600). No se persiguen; se leen.

### Claude's Discretion

- Umbral numérico exacto de candidatas dentro del orden de 90.
- Algoritmo concreto de similitud de texto para la propagación a la cola.
- Forma del archivo de clusters y de su volcado al Sheet.
- Cómo se ordena y presenta la justificación de las 10 de Oro.

</decisions>

<code_context>
## Existing Code Insights

### Lo que entregó la fase 12 y se reutiliza sin reescribir

- `seo-tools/` es un paquete Node aislado con su propio `package.json`. El `tsconfig.json` raíz
  lo excluye: **ese guardarraíl protege el deploy de producción del workstream `milestone` y no
  se toca.**
- `src/cache.ts` — caché direccionable por contenido, sin TTL, con modo `--offline`.
- `src/quota.ts` — libro de cuota persistido que **aborta** al llegar al tope, con
  `--max-searches`. Es lo que hace cumplir el presupuesto de 90 búsquedas.
- `src/sources/serpapi.ts` y `src/sources/dinorank.ts` — clientes con parser tolerante y las
  trampas del proveedor cubiertas por pruebas.
- `src/sheets/` — escritor idempotente verificado contra el documento real. Escribe solo sus
  columnas en tramos contiguos, así que no pisa las de fases posteriores.
- `src/keywords/normalize.ts` — normalización para claves de idempotencia.
- `src/cli.ts` — despacho de subcomandos. **Cerrado desde la fase 12**, ningún plan posterior lo
  edita. El parser acepta pares `--flag[=value]` arbitrarios.
- 179 pruebas en verde, sin credenciales.

### El estado real de los datos

- `seo-tools/data/keywords.jsonl` — 5.716 keywords clasificadas. **4.766 de alcance objetivo**,
  de las cuales 1.577 con volumen medible.
- Por intención sobre el objetivo: informacional 2.867, comercial 1.493, transaccional 400,
  navegacional 6.
- Tab `Keyword Research` del Sheet cargado con 5.716 filas y las columnas `CPC`, `Competition`
  y `Patient Stage` agregadas. `Cluster`, `URL`, `Suggested H1` y `Top Result` **vacías a
  propósito**: son de esta fase y de las siguientes.
- 12 capturas completas de SERP de Lima ya en caché.
- Fixtures de `/tfidf`, `/auditoria` y `/canibalizaciones` grabadas.

### Lo que hay que saber y duele

- **Las cuatro condiciones núcleo del negocio no tienen volumen**: `hernia discal`,
  `estenosis espinal`, `escoliosis`, `ortopedia infantil`. Causa documentada en
  `data/dinorank-limite-900-2026-08-10.md`: DinoRank trunca las relacionadas en 900 y nunca
  devuelve la keyword consultada en su propio array. Son exactamente las cuatro páginas que
  v1.1 ya publicó y las cuatro del handoff MAP-03. **Esta fase las tapa con Ahrefs.**
- **El universo de 5.716 es una muestra truncada, no un censo.** No leerlo como "todo lo que se
  busca en Lima".
- **`no_consultado` y `0` son cosas distintas.** El escritor del Sheet ya deja la celda vacía en
  vez de escribir cero, y eso hay que preservarlo: confundirlos mandaría las cuatro condiciones
  centrales al final de cualquier orden por volumen.

</code_context>

<specifics>
## Specific Ideas

- KWR-04 y COMP-03 comparten la misma captura de SerpApi. **Capturar una vez y reutilizar**; no
  hacer dos pasadas sobre las mismas keywords. Con 114 búsquedas eso deja de ser una eficiencia
  y pasa a ser condición de viabilidad.
- La related search `"traumatologo especialista en columna clínica ricardo palma"` está
  verificada en la SERP de Lima y hoy no la responde ninguna URL del sitio. Confirma la
  prioridad de datos de la sede Ricardo Palma que declara la fase 14.
- Referencia de reseñas del local pack, útil para GBP-03 del otro workstream: Clinica De La
  Columna 3.5 con 34, Dr. Gunter Munguía 4.8 con 24, Centro de Columna Vertebral 5.0 con 13. El
  doctor está en 5.0 con 6.

</specifics>

<deferred>
## Deferred Ideas

- **Vincular Search Console al proyecto de DinoRank.** Juan dio de alta `drangulocolumna.com`
  (`site.id: 141563`) y los endpoints ya devuelven 200, pero `/canibalizaciones` sigue con
  `has_data: false` y `last_searchconsole_date: null`. Es dependencia de la fase 14 (MAP-02),
  no de esta.
- **Esperar el primer rastreo de DinoRank sobre el sitio.** `/auditoria` devuelve arrays vacíos
  porque todavía no pasó. Dependencia de la fase 15 (ONPAGE-05).
- **Subir de plan en SerpApi.** Si después del reset del 21 de agosto las 250 mensuales siguen
  quedando cortas, se replantea. No hace falta para cerrar esta fase.
- **Resolver la discrepancia de volumen entre Ahrefs y DataForSEO.** Esta fase la expone
  publicando las dos fuentes; entender por qué difieren tanto es investigación aparte.

</deferred>
