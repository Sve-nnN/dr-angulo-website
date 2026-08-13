# Phase 14: Mapa keyword → URL y matriz de enlazado - Context

**Gathered:** 2026-08-11
**Status:** Ready for planning
**Workstream:** `seo-keywords` (v1.2)

<domain>
## Phase Boundary

Cada URL del sitio, existente o planificada, sabe por qué keyword pelea y cómo se enlaza con
las demás. Entrega el mapa keyword → URL, la resolución de canibalización, el tipo de página
que la SERP exige y la matriz de enlazado interno.

Lo que **no** entra: escribir el copy (fase 15) y nada dentro de `src/`, que es restricción dura
del milestone. La matriz de enlazado **se propone, no se implementa**: los enlaces los escribe
v1.1 en el código.

</domain>

<decisions>
## Implementation Decisions

### El handoff bloqueante ya se violó, y eso redefine la fase

MAP-03 declaraba que la fase 8 de v1.1 no debía escribir páginas de servicio antes de que esta
fase asignara keywords. **La sesión paralela publicó las cuatro el 2026-08-10** (commits
`488b57c`, `832bb81`, `2271a33`, `42bf06b`), y también cerró la fase 10 con titles, metas y
Open Graph.

La fase pasa de *"asignar antes de escribir"* a **"asignar, auditar lo publicado y marcar qué
reescribir"**. No es recuperable sin reescribir, pero sí es corregible desde la fase 15.

### Alcance de la auditoría: las 14 URLs vivas (decisión de Juan, 2026-08-11)

No solo las 4 páginas de servicio nuevas: **también las 10 existentes**. Es la única forma de
saber si la home, el hub `/servicios` y los posts del blog están compitiendo entre sí sin que
nadie lo haya decidido. Cada URL viva recibe su keyword primaria y el mapa declara si el
contenido actual la sirve, si hay que reescribirlo o si hay que crear una URL nueva.

### MAP-02, canibalización: cruce ahora, revisión después (decisión de Juan, 2026-08-11)

**Search Console ya está vinculado a DinoRank** — `last_searchconsole_date` pasó de `null` a
`2026-08-09`. Pero `/canibalizaciones` devuelve `has_data: false` y **0 keywords**: el sitio es
de agosto de 2026 y todavía no acumuló impresiones. No hay canibalización que medir sobre lo
indexado porque no hay nada indexado con historial.

- **Ahora:** la canibalización se detecta **cruzando el mapa propuesto contra sí mismo** — dos
  URLs con la misma keyword primaria, o dos URLs sirviendo al mismo cluster. Es lo único
  medible hoy y es lo que de verdad importa, porque el sitio recién empieza y la canibalización
  que interesa es la que estamos por crear.
- **Después:** queda agendada una revisión con datos reales cuando Search Console acumule
  historial. Se registra como deuda con fecha, no se olvida.

### Lo que la fase 13 midió y esta fase no debe redescubrir

- **Los modificadores de distrito son UNA página, no trece.** `traumatólogo lima`,
  `cirujano de columna surco` y `neurocirujano san isidro` comparten SERP. Crear una landing por
  distrito sería canibalizarse solo. 13 cabezas cayeron en el mismo cluster por eso.
- **Los nombres de clínica SÍ son páginas separadas.** `ricardo palma`, `sanna` y `tezza`
  formaron cada uno su cluster propio de 3 cabezas. Las cuatro páginas de sede que planifica
  v1.1 están justificadas.
- **Ojo con la transitividad.** El cluster de 41 cabezas se formó encadenando a través de
  terceras keywords. Las tres cabezas que la fase 13 eligió de ahí
  (`ortopedia infantil lima`, `traumatología lima`, `cirujano de columna lima`) **comparten cero
  URLs entre sí** medidas de a pares. Son tres páginas distintas, no una. **Pertenecer al mismo
  cluster no implica misma URL**: hay que mirar el solape par a par antes de fusionar.
- **Las 10 de Oro son el criterio de desempate:** cuando dos URLs se peleen la misma keyword,
  gana la que sirve a una de oro.
- **Montefiori está fuera.** Juan confirmó el 2026-08-11 que el doctor ya no atiende ahí. Las
  cuatro sedes vigentes son consultorio Surco, Ricardo Palma, Sanna La Molina y Padre Luis
  Tezza. **`src/content/cv.ts` todavía dice "desde dic. 2018" en presente y hay que corregirlo**,
  pero eso es de v1.1.
- **`las mejores pastillas para la ciática` es contenido de captación, no transaccional.**
  Decisión de Juan. No mapearla como si quien busca estuviera por agendar cirugía.
- **Excluidas como objetivo:** marcas de competidores
  (`clinica san bernardo…` 2.400, `clinica de traumatologia arthrosalud` 1.600) y códigos CIE-10
  (`artrosis cie 10` 2.400), que los busca personal administrativo facturando.

### Claude's Discretion

- Formato concreto del mapa y de la matriz de enlazado.
- Cómo se ordena la priorización dentro de las URLs que no sirven a una keyword de oro.
- Umbral de solape par a par para decidir fusión de URLs.

</decisions>

<code_context>
## Existing Code Insights

### Lo que hereda de las fases 12 y 13

- `seo-tools/` es un paquete Node aislado, 418 pruebas en verde. El `tsconfig.json` raíz lo
  excluye: **ese guardarraíl protege el deploy de producción del workstream `milestone` y no se
  toca.**
- `src/cache.ts`, `src/quota.ts` (aborta al llegar al tope), `src/sources/*`, `src/sheets/*` con
  escritor idempotente y variante orientada a columnas, `src/phase13/*`.
- `src/cli.ts` está **cerrado** desde la fase 12. Los ejecutables de fase van como puntos de
  entrada propios bajo `src/phaseNN/`, invocados con
  `./node_modules/.bin/tsx --env-file=../.secrets/.env`.
- `upsertRows` ya tiene la opción de **no escribir la celda cuando el campo está ausente**, que
  es la red contra el borrado silencioso.

### Los datos disponibles

- `data/keywords.jsonl` — 5.716 keywords clasificadas. **Solo lectura**, SHA verificado.
- `data/keyword-clusters.jsonl` — 31 clusters. 91 cabezas `serp`, 2.348 `texto`, 2.327 sin
  cluster. **La marca `clusterFuente` distingue evidencia de inferencia y hay que preservarla.**
- `data/golden-10.json` — las 10 de Oro con su justificación.
- `data/sweet-spot.jsonl` — alcanzabilidad de las 91 cabezas.
- `data/competitors.json` — los cinco competidores con datos reales de Ahrefs.
- **96 capturas de SERP de Lima en `.cache/serpapi/`**, con el top 10 real de cada cabeza. De
  ahí sale el tipo de página que MAP-04 exige, sin gastar una búsqueda más.

### Estado de recursos

- **SerpApi: 96 de un techo de 102. Quedan 30 hasta el 2026-08-21.** Subir el techo es decisión
  de Juan, no del ejecutor.
- **Ahrefs: 82 consultas.** Sin límite duro conocido; la cuenta Lite tiene unas 60.000 unidades
  libres.
- **DinoRank:** funciona. `/auditoria` y `/canibalizaciones` ya devuelven 200 con el proyecto
  `site.id 141563` dado de alta, pero **ambos vienen vacíos**: DinoRank todavía no rastreó el
  sitio y Search Console no tiene impresiones.

</code_context>

<specifics>
## Specific Ideas

- **Ruta rápida:** resolver MAP-03 primero, para las nueve URLs que v1.1 va a crear o ya creó, y
  publicarlo en el Sheet antes de completar el resto del mapa. Así v1.1 se desbloquea cuanto
  antes.
- **La sede Ricardo Palma tiene prioridad de datos.** La related search
  `"traumatologo especialista en columna clínica ricardo palma"` está verificada en la SERP de
  Lima y hoy no la responde ninguna URL del sitio.
- `/privacidad` queda fuera del mapa: es legal y está fuera del sitemap. Son 18 URLs mapeables
  de 19.
- La matriz de enlazado admite hasta ocho enlaces salientes por URL, que es lo que el tab
  `Internal Linking Audit` acepta. **Ese tab repite el encabezado `Title with Link` ocho veces**,
  así que el mapeo va por posición dentro de cada bloque de tres columnas, nunca por nombre.

</specifics>

<deferred>
## Deferred Ideas

- **Revisión de canibalización con datos reales de Search Console.** Cuando el sitio acumule
  impresiones. Decisión de Juan del 2026-08-11: se cierra MAP-02 con el cruce del mapa y esto
  queda agendado.
- **Medir la SERP de `tendinitis` (14.800) y `fracturas` (6.600).** Son la primera y la segunda
  keyword de mayor volumen del universo que **nunca se midieron**, por presupuesto de SerpApi.
  Candidatas obvias para el 21 de agosto, cuando se reponga la cuota.
- **`cifosis`.** El doctor la opera, confirmado por Juan, y tiene KD 3 con 3.600 de volumen. El
  criterio la dejó fuera de las 10 de Oro por un punto y Juan decidió respetar el criterio. Es
  candidata fuerte para la próxima ronda.
- **Auditoría on-page con `/auditoria` de DinoRank.** Requiere que DinoRank rastree el sitio.
  Es de la fase 15 (ONPAGE-05).

</deferred>
