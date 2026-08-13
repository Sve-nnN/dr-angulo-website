# Phase 15: Paquete on-page por URL - Context

**Gathered:** 2026-08-12
**Status:** Ready for planning
**Mode:** Smart discuss (autónomo, con las tres áreas resueltas por Juan)

<domain>
## Phase Boundary

Cada URL del mapa sale de este workstream con su title, meta, H1, jerarquía, entidades
obligatorias y copy clínico ya redactado, de modo que implementarla en v1.1 no obligue a volver a
decidir nada.

Es la última fase de v1.2 y es una **interfaz**: lo que produce lo consumen las fases 8 y 10 del
workstream `milestone`. El criterio de terminado no es "está escrito", es "quien lo implementa no
tiene que volver a preguntar".

**Lo que esta fase NO hace:** escribir en `src/`. Ni una línea. El paquete se entrega como
documento y lo implementa v1.1.

</domain>

<decisions>
## Implementation Decisions

### Fuentes de datos: todo sale del caché, DinoRank queda fuera de la fase

Las tres decisiones de abajo salen de medir el estado real de las fuentes el 2026-08-12, no de
suponerlo. El bloqueo que STATE.md registraba cambió de forma al medirlo.

- **ONPAGE-02, la jerarquía H2/H3, sale de las 96 capturas de SERP ya cacheadas.** Las 16
  keywords primarias tienen las tres cosas que hacen falta: 4 preguntas de People Also Ask, 8
  búsquedas relacionadas y entre 7 y 10 resultados orgánicos cada una. Coste: cero búsquedas. Las
  6 que quedan hasta el reset del 2026-08-21 no se tocan.

- **ONPAGE-03, las entidades obligatorias, se derivan del top 10 ya capturado y no del TF-IDF de
  DinoRank.** El motivo es medido: `/tfidf` sí lee nuestra URL —devolvió el title correcto de la
  home y contó sus 468 palabras— pero su **corpus de comparación viene vacío**: `totalUrls: 0`,
  `wdfdf.media: []` y `df: null`. Analiza nuestra página aislada, que es exactamente lo que
  ONPAGE-03 **no** pide: el requisito es contra las páginas que ya posicionan. Esas páginas sí
  están, en los `organic_results` de las capturas.

- **ONPAGE-05, la auditoría de duplicados, es una comprobación local sobre el paquete propuesto.**
  No es una degradación: es lo que el ROADMAP ya pedía con todas las letras —"se corre contra el
  mapa propuesto, no contra el sitio vivo"—. `/auditoria` de DinoRank audita un sitio publicado,
  así que para auditar un paquete que todavía no se publicó es la herramienta equivocada. Cero
  titles duplicados, cero H1 duplicados y cero metas faltantes se comprueban sobre el dataset,
  antes de que v1.1 publique, que es cuando sirve.

- **`/auditoria` de DinoRank no se usa en esta fase, y el motivo es más grave que un endpoint
  caído.** No devuelve HTTP 500: devuelve **200 con los datos de `soumahotel.com`**, el proyecto
  de otro cliente que hay dado de alta en esa cuenta. Se le pide `domain: drangulocolumna.com` y
  responde `site.domain: soumahotel.com` sin marcar error. Un fallo silencioso que entrega datos
  de otro cliente es peor que uno ruidoso, y usarlo sin proyecto propio significaría auditar el
  hotel de otro y creer que se auditó este sitio. Queda registrado para que nadie lo reintente
  pensando que es un 500 transitorio.

### Alcance del copy clínico: página completa para 16 URLs

**Decisión de Juan del 2026-08-12, sobre la recomendación contraria.** Se recomendó esquema más
secciones clave para acotar la ronda de revisión del doctor; Juan eligió página completa. Se
ejecuta así.

- **Las 16 URLs que se reescriben o se crean reciben la página redactada de punta a punta**, lista
  para pegar. Son exactamente las 16 que tienen keyword primaria: 13 reescrituras y 3 creaciones.
- **Las 6 URLs de acción `dejar`** —`/agendar`, `/blog`, `/contacto`, `/sedes`,
  `/sobre-el-doctor`, `/testimonios`— reciben **solo title y meta**. No compiten por una keyword
  y declararon por escrito por qué; redactarles cuerpo sería inventarles una intención que el
  mapa decidió que no tienen.
- **Las 2 URLs de acción `redirigir`** no reciben copy: se apagan con un 301 hacia su guía. Lo que
  necesitan de esta fase es que el paquete de su destino exista, y la instrucción de redirección.

### El sello YMYL no es una formalidad de esta fase

- **Ninguna línea de texto clínico se entrega como lista para publicar.** Cada bloque médico va
  marcado como pendiente de aprobación del doctor. Quien aprueba es el doctor y quien publica es
  v1.1: si v1.1 encuentra un bloque sin sello, el paquete está mal armado.
- **Toda la revisión se agrupa en una sola ronda.** El tiempo del doctor no se fragmenta en 16
  consultas. Con página completa por URL esa ronda es grande, y por eso el paquete tiene que
  hacerla navegable: qué leer primero y qué es lo que de verdad necesita su ojo clínico.
- **Nada de credenciales, cifras de cirugías, tasas de éxito ni resultados inventados.** Solo lo
  verificado o lo que el doctor confirme por escrito. Ante la duda entre una frase con más fuerza
  comercial y una verificable, va la verificable.
- **Montefiori no existe en este sitio.** El doctor ya no atiende ahí. Las cuatro sedes vigentes
  son consultorio Surco, Ricardo Palma, Sanna La Molina y Padre Luis Tezza.

### Forma del paquete: dataset como fuente de verdad, un archivo por URL

- **Un Markdown por URL**, bajo `phases/15-paquete-on-page-por-url/paquetes/`. Quien implementa
  abre el archivo de su URL y lo sigue de corrido.
- **El dataset JSON es la fuente de verdad y el Markdown se genera desde él**, igual que las fases
  13 y 14. Los documentos no se editan a mano: se regeneran, y dos corridas dan lo mismo.
- Los límites que v1.1 ya verifica en su fase 10 son parte del contrato: **title ≤60 caracteres,
  description ≤155**. Entregar fuera de rango obliga a reescribirlo del otro lado, que es
  precisamente el trabajo duplicado que esta fase existe para evitar.

### Lo que las fases anteriores ya decidió y esta no reabre

- **La intención de una URL se mide en la SERP, no se deduce de la carpeta.** Tres páginas de
  servicio son informacionales aunque vivan en `/servicios/`.
- **Tres de las cuatro páginas de servicio que v1.1 ya publicó enfrentan una SERP de contenido
  informativo, no de página de servicio** —`estenosis espinal` es 8 de 8—. Por eso se reescriben
  como guía clínica y no se les retocan las metas. Es la decisión de Juan del 2026-08-11.
- **`/servicios/escoliosis` se renombra a `/servicios/escoliosis-y-deformidades`**, con su 301.
- **`/sedes` queda como hub sin keyword primaria a propósito**, para no canibalizar a las cuatro
  sedes.
- **Los anchors de la matriz de enlazado salen de las keywords secundarias del destino.** Si esta
  fase cambia las secundarias de una URL, los anchors que apuntan a ella dejan de tener respaldo.
- **Seis nodos de la matriz quedaron sin anchor optimizado** (deuda D-6) porque no tenían
  secundarias medidas. Esta fase es la que puede cerrarlo.

### Claude's Discretion

- Cómo se derivan las entidades obligatorias del top 10: qué se cuenta, con qué umbral y cómo se
  separa el término clínico del ruido de navegación.
- El orden interno de las secciones dentro de cada paquete.
- Cómo se agrupa la ronda de revisión del doctor para que sea navegable.
- Si el copy se genera por plantilla, se escribe a mano o se combinan las dos cosas.

</decisions>

<code_context>
## Existing Code Insights

### Reutilizable

- `seo-tools/src/phase14/` — el patrón entero de la fase: función pura que emite un dataset,
  cargador que lo publica con ensayo por defecto, y verificador de solo lectura contra la fuente
  viva. `metricas.ts` es el ejemplo más chico y `links.ts` el más completo.
- `seo-tools/src/sheets/` — `schema.ts` y `upsert.ts`. `TabSchema.columns` es la lista de columnas
  sin deduplicar; `byHeader` colapsa encabezados repetidos y por eso no sirve para decidir qué
  escribir.
- `seo-tools/src/serpapi/` — la caché ya resuelve por clave de consulta, así que releer las 96
  capturas cuesta cero llamadas. La clave de `serpCompleta` es la misma que la de
  `busquedaGeolocalizada`.
- `seo-tools/src/phase13/args.ts` — el parseo de banderas. Es copia funcional y no importación,
  porque `src/cli.ts` ejecuta `main()` al cargarse.
- `seo-tools/data/url-map.jsonl` — las 24 filas con keyword, secundarias, intención, tipo exigido
  por la SERP, cluster, acción, canonical y topic.

### Patrones establecidos

- **Ensayo por defecto; escribir exige `--yes`.** Vale para todo lo que toque el documento del
  cliente.
- **`omitirCamposAusentes: true` y `addMissingColumns: false`.** Un campo ausente deja la celda
  intacta; una cadena vacía la borra. La diferencia importa en un documento donde el cliente
  escribe.
- **Las columnas de seguimiento del cliente se siembran una sola vez** y después no se pisan.
- **Una decisión se declara en la celda, no se deja en blanco.** Un blanco se lee como olvido.
- **La procedencia viaja con el dato.** Una métrica se escribe solo si su campo de fuente lo
  respalda, y `sin_dato` y `no_consultado` no son lo mismo.

### Puntos de integración

- El tab `Keyword Research` tiene la columna `Suggested H1`, que el plan 13-01 dejó
  explícitamente asignada a esta fase.
- El handoff hacia v1.1 vive en `phases/14-*/14-HANDOFF-V11.md`. El paquete de esta fase es su
  continuación: la 14 dijo por qué keyword pelea cada URL y la 15 dice qué texto la gana.
- La matriz de `14-ENLAZADO.md` depende de las keywords secundarias que esta fase puede cambiar.

</code_context>

<specifics>
## Specific Ideas

- Página completa por URL es pedido explícito de Juan, por encima de la recomendación de acotar.
- El paquete tiene que poder abrirse por URL suelta: quien implementa `/servicios/hernia-discal`
  no debería leer los otros quince.
- La auditoría de duplicados tiene que correr **antes** de que v1.1 publique, no después.

</specifics>

<deferred>
## Deferred Ideas

- **D-5, `/auditoria` de DinoRank:** queda fuera de esta fase por devolver datos de otro cliente.
  Se reabre solo si `drangulocolumna.com` se da de alta como proyecto propio, y aun entonces sirve
  para auditar el sitio **publicado**, o sea después de que v1.1 implemente.
- **D-2 y D-3, SERPs sin medir** (`tendinitis`, `fracturas`, SERP de marca de
  `/sobre-el-doctor`): siguen esperando el reset de cuota del 2026-08-21.
- **D-6, los seis nodos sin anchor optimizado:** esta fase puede cerrarlo al derivar secundarias,
  pero regenerar la matriz de enlazado es trabajo de la fase 14 y habría que decidir si se
  reabre.
- **D-1, canibalización con datos reales de Search Console:** fechada al 2026-11-11, fuera de
  v1.2.
- Reincorporar Ahrefs para KD y traffic potential de las 6 primarias que hoy no tienen dato:
  cuatro nunca se consultaron y dos Ahrefs no las conoce.

</deferred>
