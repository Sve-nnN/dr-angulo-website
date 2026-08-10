# Phase 12: Instrumentación de datos y universo de keywords - Context

**Gathered:** 2026-08-10
**Status:** Ready for planning
**Workstream:** `seo-keywords` (v1.2)

<domain>
## Phase Boundary

Esta fase levanta la instrumentación de datos del milestone y produce el universo plano de
keywords del negocio del doctor. Entrega tres cosas: un cliente por cada fuente de datos con
caché en disco, un escritor idempotente hacia el Sheet del cliente, y 400 o más keywords con
volumen, CPC, competencia e intención.

Lo que **no** entra acá: clustering por solape de SERP (fase 13), asignación keyword a URL
(fase 14) y copy on page (fase 15). Tampoco entra nada dentro de `src/`, que es restricción
dura del milestone.

</domain>

<decisions>
## Implementation Decisions

### Arquitectura del tooling

- El código vive en `seo-tools/` en la raíz del repositorio, como workspace de Node con su
  propio `package.json`. No se toca el `package.json` raíz: el proyecto no tiene Dockerfile
  y Dokploy construye con Nixpacks desde ese archivo, así que agregar `googleapis` ahí lo
  metería en la imagen de producción y además tocaría un archivo que el workstream
  `milestone` también edita.
- TypeScript sobre Node 24, ejecutado con `tsx`. Mismo lenguaje que el repositorio y tipos
  para los contratos de las tres APIs.
- Las credenciales se cargan desde `.secrets/.env` con `node --env-file`, que es nativo en
  Node 24. Sin dependencia de `dotenv`. El directorio `.secrets/` ya está gitignoreado desde
  el commit `6b18ab8`.
- Un solo CLI con subcomandos: `kw:expand`, `kw:enrich`, `sheet:push`, `cache:stats`. Un
  punto de entrada, reanudable, en vez de un script suelto por tarea.

### Caché en disco (INFRA-03)

- Un archivo JSON por respuesta en `seo-tools/.cache/{fuente}/{hash}.json`, con el request y
  el timestamp guardados adentro. Inspeccionable y diffeable, sin base de datos.
- La clave es el SHA-256 de endpoint más parámetros normalizados, así la misma consulta pega
  siempre en el mismo archivo.
- Sin TTL. La invalidación es explícita con `--refresh`. El criterio de éxito de la fase pide
  reprocesar el análisis completo sin volver a gastar cuota, y un TTL silencioso rompe eso
  justo cuando menos conviene.
- El caché crudo se gitignorea: son más de mil archivos en un repositorio que se comparte con
  el workstream `milestone`. Lo que sí se commitea es el dataset consolidado, que es la
  evidencia reproducible de dónde salió cada número.

### Universo de keywords (KWR-01, KWR-02, KWR-03)

- Las semillas salen de tres fuentes cruzadas: el contenido de v1.0 (`src/content/`, los
  cuatro posts del blog, servicios y sedes), la competencia ya investigada en
  `.planning/research/COMPETITORS.md`, y el CV y las especialidades del doctor. El roadmap
  pide cubrir el negocio completo, no solo las cuatro condiciones que v1.1 va a publicar.
- **Ahrefs queda fuera de la fase 12 (decisión final de Juan, 2026-08-10).** La instrumentación
  corre sobre **DinoRank y SerpApi únicamente**. Cero llamadas a Ahrefs, cero cliente, cero
  `AHREFS_API_KEY`. El enriquecimiento con KD, traffic potential y referring domains queda
  diferido sin fase asignada.
  - Expansión a 400 o más: DinoRank más SerpApi (related searches, People Also Ask,
    autocomplete) más permutación de semillas.
  - Volumen, CPC y competencia de las 400 o más: DinoRank.
  - Las columnas de KD y traffic potential existen en el dataset y en el Sheet, con valor
    `no_consultado` para todo el universo. No se borran: se dejan listas para cuando el
    enriquecimiento se retome.
  - *Trayectoria de la decisión: se pidió primero economía de Ahrefs (shortlist de 40 a 60,
    unas 1.200 unidades con el select recortado a `keyword,difficulty,traffic_potential`), y
    después sacarlo del todo. Registrado porque el dato de costo sigue siendo útil cuando se
    retome.*
- **Consecuencias registradas:**
  - **KWR-02** se enmendó dos veces en `REQUIREMENTS.md`. Sin la enmienda, el audit del
    milestone marcaría el requisito como incumplido cuando en realidad se cambió a propósito.
    Lo mismo con el criterio de éxito 4 de esta fase en `ROADMAP.md`.
  - **KWR-05, el punto dulce de la fase 13, depende de KD, que es métrica propietaria de
    Ahrefs.** Sin ella hace falta un proxy de dificultad orgánica: leer de la SERP de Lima con
    SerpApi quién ocupa el top 10 de cada cluster. La captura de SERP ya es requisito de
    COMP-03, así que el proxy reutiliza datos que la fase 13 igual tiene que traer. Ojo con
    usar `competition` de DinoRank como sustituto: es competencia de **pago**, mide subasta
    publicitaria, no dificultad orgánica. Se decide al discutir la fase 13.
  - **La clasificación de intención pasa a ser 100% por reglas más residuo por LLM**, porque
    `intents` de Ahrefs ya no está disponible. `Intent Source` solo toma los valores `reglas`
    o `llm`.
- Las keywords sin datos en ninguna fuente se conservan marcadas `sin_datos`, no se
  descartan. El geo long tail sin volumen medible es justo el terreno donde un dominio nuevo
  de agosto de 2026 puede ganar.
- La intención se clasifica por reglas deterministas sobre el patrón de la keyword ("qué es"
  y "síntomas" caen en informacional y etapa síntoma; "precio", "cerca de mí" y las que
  llevan sede caen en transaccional y etapa decisión). Un LLM interviene solo sobre el
  residuo ambiguo. Las reglas son deterministas, que es lo que mantiene estable la
  reejecución de SHEET-06.

### Escritura en el Sheet (INFRA-01, SHEET-06)

- La clave de idempotencia es la keyword normalizada (minúsculas, sin tildes, espacios
  colapsados) en el tab `Keyword Research`, y la URL en los tabs que van por URL.
- **El Sheet es una plantilla (aclaración de Juan, 2026-08-10).** No contiene datos de otro
  cliente que haya que preservar. Las filas residuales y lo escrito a mano se pueden
  eliminar. Lo que sí se respeta siempre es el formato de columnas de cada tab: el escritor
  lee la fila de encabezados y se ajusta a ella, no impone la suya.
- La fuente de cada dato se marca por métrica, con columna sufijo (`Volume`,
  `Volume Source`), no con una sola columna por fila. Una columna global miente cuando la
  fila mezcla datos de DinoRank y de Ahrefs, y KWR-02 pide la fuente marcada por columna.
- Si un tab no existe o su estructura no calza, el escritor falla ruidoso mostrando el diff
  de columnas esperadas contra las reales. No crea tabs a ciegas.
- El borrado de filas residuales va detrás de un flag explícito que reporta qué elimina antes
  de hacerlo. Está autorizado por Juan, pero es una escritura destructiva sobre un documento
  del cliente y conviene que deje rastro.

### Claude's Discretion

- Nombres concretos de archivos y módulos dentro de `seo-tools/`.
- Forma exacta del dataset consolidado que se commitea (JSONL o CSV).
- Umbral numérico exacto de la shortlist de Ahrefs dentro del rango de 40 a 60.
- Reglas concretas de clasificación por etapa del paciente.

</decisions>

<code_context>
## Existing Code Insights

### Estado del repositorio

- Next.js 16 con App Router, TypeScript y Tailwind 4. Node 24 y Python 3.14 disponibles en el
  entorno.
- **No existe `scripts/`** ni ningún directorio de tooling. `seo-tools/` se crea desde cero.
- **No hay Dockerfile ni `.dockerignore`.** El deploy en Dokploy corre por Nixpacks, que
  detecta el `package.json` de la raíz. Por eso el tooling necesita su propio manifiesto.
- `package.json` raíz tiene nueve dependencias de producción y ninguna de datos o de Google.
- `.gitignore` ya cubre `.secrets/` (línea 44) y `.env*`.

### Assets reutilizables

- `src/content/` de v1.0 tiene servicios, sedes y los cuatro posts del blog. Es la fuente de
  semillas más fiel al negocio real, y se lee sin escribir.
- `.planning/research/COMPETITORS.md` tiene tres competidores ya investigados
  (drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com).
- `.planning/research/SEO-TRACKING.md` tiene la investigación técnica de SEO y schema.
- La auditoría del 2026-08-10 en `PROJECT.md` trae la SERP real de "cirujano de columna en
  Lima" y el local pack, incluida la related search sin cubrir "traumatologo especialista en
  columna clínica ricardo palma".

### Estado de credenciales al cerrar el discuss

- `.secrets/service-account.json` existe. Cuenta `juan-tech@juan-tech.iam.gserviceaccount.com`.
- `.secrets/.env` creado con `DINORANK_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_FILE` y `SEO_SHEET_ID`.
- **La clave de DinoRank está rechazada.** Devuelve 401 `{"code":"unauthorized","message":
  "Invalid API key"}` en `/keyword-research`, `/visibility` y `/llms`. Descartado que sea
  error de forma: son 64 caracteres hexadecimales, el header `X-API-Key` es el documentado, y
  un header mal escrito devuelve `"Missing API key"` en vez de `"Invalid"`. También se probó
  `Authorization: Bearer` y query string. El problema está del lado de DinoRank: clave sin
  activar, plan sin acceso a la API, o clave de otra cuenta. Juan tiene que regenerarla desde
  el panel.
- Ahrefs y SerpApi funcionan como MCP. Verificado con una llamada real a Perú que devolvió
  volumen, difficulty, traffic potential, intents y serp features.
- Hallazgo relevante: Ahrefs devuelve **vacío** para el geo long tail de Lima
  ("hernia discal lima", "traumatologo columna lima"). Ese terreno solo lo cubre DinoRank vía
  DataForSEO. Las dos fuentes no se solapan, se tapan agujeros distintos.

### Integración

- El tooling no se integra con la aplicación. Su salida son archivos de datos dentro del
  workstream y filas en el Sheet del cliente. La interfaz con v1.1 es documental, no de
  código.

</code_context>

<specifics>
## Specific Ideas

- Ahrefs se reserva para lo que solo Ahrefs tiene: KD y traffic potential. Todo lo demás sale
  de DinoRank o de SerpApi, que no tienen costo por unidad.
- El escritor del Sheet tiene que leer el encabezado real de cada tab antes de escribir. La
  plantilla manda sobre el formato; los datos los manda el tooling.
- La fase puede avanzar sin la clave de DinoRank en todo lo que es caché, escritor del Sheet
  y semillas. El cliente de DinoRank se escribe contra su contrato documentado y queda listo
  para correr apenas la clave funcione, pero KWR-01 y KWR-02 no cierran hasta entonces.

</specifics>

<deferred>
## Deferred Ideas

- Endpoint `/seolocal` de DinoRank para SEO local por sede: depende de que existan las
  páginas de sede de la fase 9 de v1.1. Ya está fuera de alcance en `REQUIREMENTS.md`.
- Tracking de posiciones de DinoRank: necesita el sitio ya optimizado y semanas de historial.
- Linkbuilding: el endpoint existe, pero adquirir enlaces es un proyecto aparte con
  presupuesto propio.

</deferred>
