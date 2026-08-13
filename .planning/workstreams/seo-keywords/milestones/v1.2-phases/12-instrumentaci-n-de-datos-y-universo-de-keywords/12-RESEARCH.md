# Phase 12: Instrumentación de datos y universo de keywords — Research

**Researched:** 2026-08-10
**Workstream:** `seo-keywords` (v1.2)
**Domain:** Tooling de datos en Node/TypeScript, tres APIs de SEO, escritura idempotente en Google Sheets, expansión y clasificación de keywords en español
**Confidence:** HIGH en stack, Sheets y riesgos de build. MEDIUM en expansión y clasificación. LOW en el contrato de respuesta de DinoRank (indocumentado y clave rechazada).

---

> ## ⚠ ENMIENDA POSTERIOR A LA INVESTIGACIÓN — 2026-08-10
>
> **Decisión de Juan, tomada después de que este documento se escribiera. Supersede todo lo
> que este archivo dice sobre Ahrefs.**
>
> > *"Mejor, evitemos usar Ahrefs para obtener únicamente el KD, potential y referring
> > domains. Dejémoslo diferir."*
>
> ### Qué cambia
>
> **Ahrefs queda fuera de la fase 12, completo.** No es "solo sobre una shortlist": es cero
> llamadas, cero cliente, cero `AHREFS_API_KEY`. La fase 12 corre sobre **DinoRank y SerpApi
> únicamente**.
>
> Lo que queda **derogado** de este documento:
>
> - Todo el módulo `src/sources/ahrefs.ts` y el snippet C7.
> - El tier de presupuesto de KD y traffic potential, y el cálculo de ~1.200 unidades.
> - La regla de conflicto de intención que le daba prioridad a `intents` de Ahrefs sobre las
>   reglas. **La clasificación de intención pasa a ser 100% por reglas deterministas más el
>   residuo por LLM.** Un eje menos de ambigüedad, y `Intent Source` solo toma los valores
>   `reglas` o `llm`.
> - `KD Source = ahrefs_sin_datos` como valor posible. En la fase 12 las columnas de KD y
>   traffic potential quedan con `no_consultado` para todo el universo.
> - La necesidad de que Juan genere `AHREFS_API_KEY`. **`SERPAPI_API_KEY` sí sigue haciendo
>   falta.**
>
> Lo que **sigue vigente y no cambia**: el análisis de Sheets, el riesgo de build del
> `tsconfig` raíz, el seam de caché, el diseño del CLI, la expansión sin Ahrefs (*Pattern 5*,
> que ya era cero Ahrefs por diseño), el probe de DinoRank y el manejo de errores.
>
> ### Consecuencia aguas abajo, para la fase 13
>
> **KWR-05, el punto dulce, está definido como "las keywords cuyo KD es alcanzable con el
> perfil de enlaces real del dominio". KD es una métrica propietaria de Ahrefs.** Sin ella la
> fase 13 necesita un proxy de dificultad orgánica. Dos candidatos, a decidir cuando se
> discuta esa fase:
>
> 1. **Dificultad leída de la SERP con SerpApi.** Para cada cluster, mirar quién ocupa el top
>    10 en Lima: si son clínicas grandes con marca o dominios exact-match, la keyword es
>    difícil; si son directorios genéricos y agregadores, hay hueco. Es más trabajo, pero mide
>    exactamente lo que importa para un dominio de agosto de 2026 sin historial, y usa datos
>    que la fase 13 ya tiene que capturar de todos modos para COMP-03.
> 2. **`competition` de DinoRank.** Cuidado: es competencia de **pago**, viene de DataForSEO y
>    mide subasta publicitaria, no dificultad orgánica. Sirve como señal secundaria, nunca
>    como sustituto directo de KD.
>
> No hace falta resolverlo en la fase 12. Queda registrado para que la fase 13 no lo descubra
> tarde.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Arquitectura del tooling**

- El código vive en `seo-tools/` en la raíz del repositorio, como workspace de Node con su propio `package.json`. No se toca el `package.json` raíz: el proyecto no tiene Dockerfile y Dokploy construye con Nixpacks desde ese archivo, así que agregar `googleapis` ahí lo metería en la imagen de producción y además tocaría un archivo que el workstream `milestone` también edita.
- TypeScript sobre Node 24, ejecutado con `tsx`. Mismo lenguaje que el repositorio y tipos para los contratos de las tres APIs.
- Las credenciales se cargan desde `.secrets/.env` con `node --env-file`, que es nativo en Node 24. Sin dependencia de `dotenv`. El directorio `.secrets/` ya está gitignoreado desde el commit `6b18ab8`.
- Un solo CLI con subcomandos: `kw:expand`, `kw:enrich`, `sheet:push`, `cache:stats`. Un punto de entrada, reanudable, en vez de un script suelto por tarea.

**Caché en disco (INFRA-03)**

- Un archivo JSON por respuesta en `seo-tools/.cache/{fuente}/{hash}.json`, con el request y el timestamp guardados adentro. Inspeccionable y diffeable, sin base de datos.
- La clave es el SHA-256 de endpoint más parámetros normalizados, así la misma consulta pega siempre en el mismo archivo.
- Sin TTL. La invalidación es explícita con `--refresh`.
- El caché crudo se gitignorea. Lo que sí se commitea es el dataset consolidado.

**Universo de keywords (KWR-01, KWR-02, KWR-03)**

- Las semillas salen de tres fuentes cruzadas: el contenido de v1.0 (`src/content/`), la competencia ya investigada en `.planning/research/COMPETITORS.md`, y el CV y las especialidades del doctor.
- **Economía de Ahrefs.** Expansión a 400 o más: DinoRank más SerpApi más permutación de semillas, **cero llamadas a Ahrefs**. Volumen, CPC y competencia de las 400 o más: DinoRank. KD y traffic potential: solo sobre una shortlist de 40 a 60 keywords. El resto del universo queda con `KD = sin_datos` y la columna de fuente lo declara.
- **Consecuencia sobre KWR-02:** hay que enmendar KWR-02 en `REQUIREMENTS.md` para que aplique a la shortlist, no al universo entero. *(Nota del research: la enmienda YA está aplicada en `REQUIREMENTS.md` líneas 67-74. El plan no necesita reescribirla, solo verificarla.)*
- Las keywords sin datos en ninguna fuente se conservan marcadas `sin_datos`, no se descartan.
- La intención sale de `intents` de Ahrefs donde exista; el resto se clasifica por reglas deterministas sobre el patrón de la keyword. Un LLM interviene solo sobre el residuo ambiguo.

**Escritura en el Sheet (INFRA-01, SHEET-06)**

- La clave de idempotencia es la keyword normalizada (minúsculas, sin tildes, espacios colapsados) en el tab `Keyword Research`, y la URL en los tabs que van por URL.
- **El Sheet es una plantilla.** No contiene datos de otro cliente que haya que preservar. Las filas residuales y lo escrito a mano se pueden eliminar. Lo que sí se respeta siempre es el formato de columnas de cada tab: el escritor lee la fila de encabezados y se ajusta a ella, no impone la suya.
- La fuente de cada dato se marca por métrica, con columna sufijo (`Volume`, `Volume Source`), no con una sola columna por fila.
- Si un tab no existe o su estructura no calza, el escritor falla ruidoso mostrando el diff de columnas esperadas contra las reales. No crea tabs a ciegas.
- El borrado de filas residuales va detrás de un flag explícito que reporta qué elimina antes de hacerlo.

### Claude's Discretion

- Nombres concretos de archivos y módulos dentro de `seo-tools/`.
- Forma exacta del dataset consolidado que se commitea (JSONL o CSV).
- Umbral numérico exacto de la shortlist de Ahrefs dentro del rango de 40 a 60.
- Reglas concretas de clasificación por etapa del paciente.

### Deferred Ideas (OUT OF SCOPE)

- Endpoint `/seolocal` de DinoRank para SEO local por sede: depende de que existan las páginas de sede de la fase 9 de v1.1.
- Tracking de posiciones de DinoRank: necesita el sitio ya optimizado y semanas de historial.
- Linkbuilding: el endpoint existe, pero adquirir enlaces es un proyecto aparte con presupuesto propio.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Descripción | Research Support |
|----|-------------|------------------|
| INFRA-01 | Un script del repo escribe celdas en el Sheet con la service account, sin intervención manual | `@googleapis/sheets` v14 + `auth.GoogleAuth` con `keyFile`, scope `.../auth/spreadsheets`. Métodos verificados: `spreadsheets.get`, `values.get`, `values.batchUpdate`, `spreadsheets.batchUpdate`. Ver *Code Examples* §C1–C5 |
| INFRA-02 | Cliente de DinoRank para `/keyword-research`, `/tfidf`, `/auditoria`, `/canibalizaciones` con clave fuera del VCS | Contrato de parámetros de los 4 endpoints extraído literal de la doc oficial (*Standard Stack → DinoRank*). Envelope de error verificado en vivo. Respuesta de éxito **indocumentada** → tarea de probe obligatoria |
| INFRA-03 | Toda respuesta cruda cacheada en disco, reprocesar no consume cuota | Diseño de caché content-addressed con envelope `outcome` para distinguir miss / vacío / error. Ver *Pattern 2* y *Pitfall 6* |
| KWR-01 | Universo de 400+ keywords expandido desde semillas | Plan de 4 capas con rendimiento estimado por capa (*Pattern 5*). Permutación sola ya supera 400 candidatos; SerpApi aporta el long tail que la permutación no inventa |
| KWR-02 | Volumen/CPC/competencia de DinoRank + KD/TP de Ahrefs sobre shortlist, fuente por columna | Contrato REST de Ahrefs v3 verificado (`/v3/keywords-explorer/overview`). **API v3 directa incluida en el plan Lite** → elimina la frontera MCP. Ver *Pattern 3* |
| KWR-03 | Clasificación por intención y etapa del paciente | Motor de reglas determinista en español con patrones concretos y orden de precedencia (*Pattern 6*). Residuo estimado 8-15% → override commiteado, no LLM en runtime |
| SHEET-06 | Reejecutar la carga actualiza filas en vez de duplicarlas | No existe upsert nativo en Sheets. Algoritmo read-then-diff-then-write de 7 pasos en *Pattern 4* |
</phase_requirements>

---

## Summary

Esta fase es de infraestructura, no de contenido: construye una herramienta CLI reutilizable que las fases 13, 14 y 15 van a seguir usando. Tres hallazgos cambian el plan respecto de lo que asumía el discuss.

**Primero, la frontera MCP se puede eliminar por completo.** Ahrefs documenta que el acceso directo a la API v3 está incluido desde el plan Lite y que consume del mismo pool de 100.000 unidades que el MCP `[VERIFIED: help.ahrefs.com/en/articles/6559232-about-api-v3]`. SerpApi también expone REST plana con `api_key`. Es decir: no hace falta ninguna arquitectura de "un agente vuelca JSON en el caché". El CLI llama a las tres APIs por HTTP con claves en `.secrets/.env` y queda headless, reanudable y verificable. Solo hace falta que Juan genere dos claves más (Ahrefs y SerpApi). Se documenta igual el seam `cache:put` como fallback, porque es también la vía para desbloquear cualquier fuente cuya clave falle.

**Segundo, hay un riesgo de regresión sobre el workstream `milestone` que hoy nadie ve.** El `tsconfig.json` de la raíz declara `include: ["**/*.ts", ...]` y `exclude: ["node_modules"]`. Verificado empíricamente con el `tsc` del propio repo: un archivo en `seo-tools/x.ts` **sí** entra en la compilación de la raíz. Y la doc de Next 16 dice literal que `next build` falla cuando hay errores de TypeScript en el proyecto. Crear `seo-tools/` con `import from "@googleapis/sheets"` rompe el build de producción de v1.1 desde el primer commit. La corrección es una sola línea en `tsconfig.json` (y otra en `eslint.config.mjs`), ambas verificadas. Esto tiene que ser una tarea temprana y explícita, con aviso al otro workstream.

**Tercero, el contrato de respuesta de DinoRank sigue siendo desconocido y hay que diseñar alrededor de eso.** La doc lista parámetros pero no campos de respuesta, y no publica OpenAPI (probado: 404 en las tres rutas habituales). Además `/keyword-research` acepta **una keyword por llamada**: 400 keywords son 400 POST, y para `country=pe` la doc dice que la resuelve DataForSEO, no el servidor propio de DinoRank, así que la forma para Perú puede diferir de la de España. El plan necesita un subcomando `dino:probe` que guarde la primera respuesta real como fixture, un parser tolerante escrito contra esa fixture, y tests unitarios que corran sin clave.

**Primary recommendation:** construir `seo-tools/` como paquete standalone (NO npm workspace: la raíz no tiene campo `workspaces` y agregarlo obligaría a editar el `package.json` prohibido), con `@googleapis/sheets@14` en vez de `googleapis` (756 KB contra 211 MB), acceso REST directo a las tres APIs, caché content-addressed con envelope tipado, y el orden de ejecución: arreglar tsconfig → verificar permisos y encabezados reales del Sheet → caché → expansión sin costo → enriquecimiento → clasificación → push idempotente.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Extracción de semillas desde `src/content/` | CLI local (build-time script) | — | Lectura pura de archivos del repo, cero red. Se congela en un snapshot commiteado para desacoplarse de v1.1 |
| Permutación semilla × modificador × geo | CLI local (pure function) | — | Determinista, sin API. Es la única capa de expansión con costo cero y reproducibilidad total |
| Autocomplete / related searches / PAA | API externa (SerpApi REST) | Caché en disco | Datos de Google que ninguna fuente local puede sintetizar |
| Volumen, CPC, competencia | API externa (DinoRank REST → DataForSEO) | Caché en disco | Única fuente con cobertura del geo long tail de Lima |
| ~~KD y traffic potential~~ | ~~API externa (Ahrefs REST v3)~~ | ~~Caché en disco~~ | **DEROGADO por la enmienda del encabezado (2026-08-10).** Ahrefs queda fuera de la fase 12 por completo. En la fase 12 estas dos columnas existen en el dataset y en el Sheet con el valor literal `no_consultado` para todo el universo. **La fase 13 no debe leer esta fila como vigente**: si necesita dificultad orgánica, ver los dos candidatos de proxy en la enmienda del encabezado |
| Clasificación de intención y etapa | CLI local (rule engine) | Override commiteado | Debe ser determinista para que SHEET-06 se cumpla. Un LLM en runtime rompería la estabilidad de reejecución |
| Persistencia cruda | Filesystem (`.cache/`) | — | Gitignoreado, content-addressed, sin TTL |
| Persistencia consolidada | Git (`seo-tools/data/keywords.jsonl`) | — | Es la evidencia reproducible que sí se commitea |
| Entrega al cliente | Google Sheets API v4 | — | El Sheet es el entregable externo, no la base de datos del proyecto |
| Autenticación | `.secrets/.env` vía `node --env-file` | `.secrets/service-account.json` | Nunca en VCS. `.gitignore` línea 44 ya cubre `.secrets/` |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@googleapis/sheets` | `14.0.0` | Cliente tipado de Sheets API v4 + `auth.GoogleAuth` | Submódulo oficial de Google publicado desde el mismo repo que `googleapis`. **756 KB desempaquetado contra 211 MB de `googleapis`** `[VERIFIED: npm view dist.unpackedSize]`. Trae `GoogleAuth` y `JWT` incluidos, no hace falta `google-auth-library` por separado `[VERIFIED: instalado e inspeccionado en /tmp]` |
| `tsx` | `4.23.12` | Ejecutar TypeScript | Decisión bloqueada. Acepta todos los flags de Node, incluido `--env-file` `[VERIFIED: Context7 /privatenumber/tsx]` |
| `typescript` | `^5.9` | Tipos y `tsc --noEmit` en CI local del tooling | El repo ya usa TS 5 en la raíz; mantener la misma major evita sorpresas |
| `@types/node` | `^24` | Tipos de Node 24 (`node:crypto`, `fetch`, `AbortSignal.timeout`) | La raíz usa `@types/node@^20`, que no describe bien Node 24. `seo-tools/` tiene su propio manifiesto, así que puede usar `^24` sin tocar la raíz |
| `fetch` (nativo) | Node 24.13.0 | Cliente HTTP para DinoRank, Ahrefs y SerpApi | Nativo y estable. No agregar `axios`, `undici` ni `node-fetch` |
| `node:crypto` `createHash` | Node 24.13.0 | SHA-256 de la clave de caché | Nativo |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `p-limit` | `7.3.1` | Limitar concurrencia de los ~400 POST a DinoRank | Necesario. 400 llamadas en paralelo tumban la cuota y probablemente el endpoint. 14 KB, cero dependencias transitivas relevantes |
| `p-retry` | `8.0.0` | Reintento con backoff exponencial ante 429 y 5xx | Recomendado, pero un helper propio de ~25 líneas también sirve. Si se usa, configurar `shouldRetry` para NO reintentar 401/403 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@googleapis/sheets` | `googleapis@174.0.1` | 211 MB desempaquetados con 1.881 archivos para usar un solo API. Solo tiene sentido si más adelante hiciera falta Drive o Docs |
| `@googleapis/sheets` | `google-auth-library@11` + `fetch` contra `sheets.googleapis.com` | Viable y aún más liviano (601 KB), pero hay que escribir a mano la construcción de rangos A1, el manejo de errores de la API y los tipos. No compensa |
| `tsx` | Node 24 nativo (type stripping) | **Node 24.13.0 ya corre `.ts` sin `tsx`** `[VERIFIED: ejecutado localmente]`, incluido `import "./lib.ts"` con extensión explícita y `--env-file`. Pero falla con `enum` (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`), `namespace` y parameter properties. `tsx` está bloqueado por decisión y elimina esa clase de sorpresa. Nativo queda como plan B si `tsx` diera problema |
| `p-limit` | Semáforo propio con `Promise.all` por lotes | Un pool casero de 15 líneas funciona, pero `p-limit` es 14 KB, está en 82 M de descargas semanales y evita el bug clásico de "el lote entero espera al elemento más lento" |
| JSONL para el dataset | CSV | CSV pelea con las comas de las keywords en español y Excel/Sheets reinterpretan valores al abrirlo. **Recomendación: JSONL** — una keyword por línea, diff de git legible, sin quoting |

**Installation** (dentro de `seo-tools/`, nunca en la raíz):

```bash
cd seo-tools
npm install @googleapis/sheets@14 p-limit@7
npm install -D tsx@4 typescript@5 @types/node@24
```

**Version verification** (ejecutado el 2026-08-10):

```
@googleapis/sheets  14.0.0    755.905 bytes,     14 archivos
googleapis         174.0.1  211.656.184 bytes,  1.881 archivos
google-auth-library 11.0.0    601.779 bytes,     95 archivos
tsx                 4.23.12
p-limit              7.3.1     14.888 bytes
p-retry              8.0.0     25.513 bytes
```

### Contratos de las tres APIs externas

#### DinoRank — `https://api.dinorank.com/api/v1/`

Auth: `X-API-Key: <key>` o `Authorization: Bearer <key>` `[CITED: api.dinorank.com/docs/docs.html]`.

| Endpoint | Método | Parámetros | Requerido | Notas |
|----------|--------|------------|-----------|-------|
| `/keyword-research` | POST | `keyword`, `country`, `language` | `keyword`, `country` | `language` default `es`. **Una keyword por llamada.** ES y MX se resuelven con el servidor de visibilidad propio; **el resto de países usa DataForSEO** — Perú cae acá |
| `/tfidf` | POST | `keyword`, `country`, `language`, `url` | los tres primeros | `url` opcional para contextualizar |
| `/auditoria` | GET/POST | `project_id`, `domain`, `country`, `language`, `url`, `tipo`, `subtipo` | ninguno | `tipo` ∈ `summary,titles,h1,meta,metarobots,noindex,urlsLentas,httpVsHttps,urlsEspejo,ilinks`. **No consume cuota**, solo lee datos ya almacenados en DinoRank |
| `/canibalizaciones` | GET/POST | `project_id`, `domain`, `country`, `language`, `consejos` | ninguno | Lee canibalizaciones derivadas de Search Console. **No consume cuota** |

Respuesta de `/keyword-research`, según la doc: *"la keyword consultada, el país, el idioma, la fuente y el bloque `data` con el análisis"*. Es decir el envelope tiene al menos `keyword`, `country`, `language`, `source`, `data`. **El contenido de `data` no está documentado en ninguna parte** `[VERIFIED: HTML de la doc descargado y parseado — cero ejemplos de respuesta, cero apariciones de `"ok": true`]`.

Envelope de error, verificado en vivo hoy con POST sin cabecera:

```json
{ "ok": false, "error": { "code": "unauthorized", "message": "Missing API key" } }
```

Con la clave actual de Juan devuelve el mismo envelope con `"message": "Invalid API key"`. **Sin OpenAPI publicado**: probados y 404 en `/openapi.json`, `/api/v1/openapi.json` y `/docs/openapi.json`.

Dato colateral útil: la doc lista también `POST /api/v1/mcp`, o sea DinoRank expone su propio servidor MCP. Usa la misma clave, así que no sirve como rodeo al 401, pero conviene tenerlo anotado para fases posteriores.

#### Ahrefs — `https://api.ahrefs.com/v3/`

```
GET https://api.ahrefs.com/v3/keywords-explorer/overview
Authorization: Bearer $AHREFS_API_KEY
```

`[CITED: docs.ahrefs.com/en/api/reference/keywords-explorer/get-overview]`

| Parámetro | Tipo | Obligatorio | Nota |
|-----------|------|-------------|------|
| `country` | string | **sí** | ISO 3166-1 alpha-2. Para este proyecto: `pe` |
| `select` | string | **sí** | Lista de columnas separadas por coma |
| `keywords` | string | no | Lista separada por coma |
| `limit` | integer | no | Default 1000 |
| `where`, `order_by`, `target`, `mode`, `output`, `timeout` | — | no | — |

Respuesta: `{ "keywords": [ { ...columnas seleccionadas... } ] }`.

Columnas facturables ~10 unidades cada una por fila: `difficulty`, `volume`, `traffic_potential`, `global_volume`, `parent_volume`. `keyword` no factura.

**Consecuencia de presupuesto que corrige a la baja lo estimado en el CONTEXT.** Como volumen y CPC salen de DinoRank, el `select` de Ahrefs se puede recortar a `keyword,difficulty,traffic_potential`: dos columnas facturables ≈ **20 unidades por fila**, no 44. Una shortlist de 60 cuesta **~1.200 unidades**, no 2.600. Con 66.582 unidades libres y reset el 2026-08-20, el margen es amplio. Si más adelante hace falta `intents` para KWR-03, agregarla y remedir (no aparece marcada como facturable en la doc, pero conviene confirmarlo con una llamada de una fila).

**Smoke test gratis:** la doc de Ahrefs documenta free test queries usando `keywords=ahrefs`. Sirve para verificar la clave y el parseo sin gastar una sola unidad:

```
https://api.ahrefs.com/v3/keywords-explorer/overview?country=us&keywords=ahrefs&select=keyword,volume,traffic_potential,difficulty
```

#### SerpApi — `https://serpapi.com/search.json`

| Uso | Parámetros | Campos de interés |
|-----|-----------|-------------------|
| SERP de Lima | `engine=google`, `q`, `location=Lima, Peru`, `hl=es`, `gl=pe`, `google_domain=google.com.pe`, `api_key` | `related_searches[].query`, `related_questions[].question`, `organic_results[]` |
| Autocomplete | `engine=google_autocomplete`, `q`, `hl=es`, `gl=pe`, `client`, `cp`, `api_key` | `suggestions[].value`, `suggestions[].relevance` |

`[CITED: serpapi.com/google-autocomplete-api, serpapi.com/related-searches]`

`related_searches` también absorbe el bloque "People also search for" de móvil, diferenciado por `block_position` (1 vs 2).

Presupuesto de búsquedas por plan: Free 250/mes, Starter 1.000, Developer 5.000, Production 15.000 `[CITED: serpapi.com/pricing]`. El plan de expansión propuesto consume ~100 búsquedas, así que entra incluso en Free — pero hay que confirmar el plan de Juan antes de correrlo.

---

## Package Legitimacy Audit

Ejecutado con `gsd-tools query package-legitimacy check --ecosystem npm` el 2026-08-10, complementado con `npm view` de repositorio, licencia, mantenedor y fecha de creación, más descargas semanales de la API de npm.

| Package | Registry | Creado | Descargas/sem | Source Repo | Verdict seam | Disposition |
|---------|----------|--------|---------------|-------------|--------------|-------------|
| `@googleapis/sheets` | npm | 2021-03-18 | 1.190.432 | github.com/googleapis/google-api-nodejs-client | SUS (`too-new`) | **Aprobado — override** |
| `googleapis` | npm | 2012-09-18 | 10.013.010 | github.com/googleapis/google-api-nodejs-client | SUS (`too-new`) | **Aprobado — override**, pero no recomendado por tamaño |
| `google-auth-library` | npm | 2015-02-24 | 77.798.443 | github.com/googleapis/google-cloud-node | SUS (`too-new`) | **Aprobado — override**, innecesario (viene dentro de `@googleapis/sheets`) |
| `tsx` | npm | 2015-08-20 | 82.007.387 | github.com/privatenumber/tsx | SUS (`too-new`) | **Aprobado — override** |
| `p-limit` | npm | — | — | github.com/sindresorhus/p-limit | no evaluado por el seam | Aprobado (paquete de sindresorhus, 14 KB) |

**Razón del override.** El seam marcó los cuatro como `SUS/too-new` porque mide la fecha de la **última publicación**, no la antigüedad del paquete. Los cuatro se publicaron entre el 2026-07-30 y el 2026-08-10, que es exactamente lo que se espera de paquetes con release cadence semanal. Los cuatro tienen: repositorio público del owner correcto (`googleapis` para los tres de Google, `privatenumber` para tsx), licencia Apache-2.0/MIT, `deprecated: false`, `postinstall: null` `[VERIFIED: npm view scripts.postinstall → null]`, y entre 1,1 M y 82 M de descargas semanales. No hay señal de slopsquatting.

**Packages removed due to [SLOP] verdict:** ninguno.
**Packages flagged as suspicious [SUS] que requieran checkpoint:** ninguno. Los cuatro flags son falsos positivos documentados arriba; el planner NO necesita insertar `checkpoint:human-verify` antes de instalarlos.

---

## Architecture Patterns

### System Architecture Diagram

```
                        .secrets/.env            .secrets/service-account.json
                    (node --env-file, nunca VCS)        (keyFile, nunca VCS)
                              │                                 │
                              ▼                                 ▼
  ┌───────────────────────────────────────────────────────────────────────────┐
  │                       seo-tools CLI  (tsx src/cli.ts)                     │
  └───────────────────────────────────────────────────────────────────────────┘
        │              │                  │                    │           │
   kw:seeds        kw:expand          kw:enrich           sheet:push   cache:stats
        │              │                  │                    │
        ▼              ▼                  ▼                    ▼
 ┌────────────┐  ┌────────────┐   ┌──────────────┐   ┌──────────────────┐
 │ src/content│  │ permutación│   │  enrichment  │   │  upsert de Sheet │
 │  (lectura) │  │  semilla × │   │              │   │                  │
 │ COMPETITORS│  │  modificador│  │              │   │                  │
 │    CV      │  │  × geo     │   │              │   │                  │
 └─────┬──────┘  └─────┬──────┘   └──────┬───────┘   └────────┬─────────┘
       │               │                 │                    │
       ▼               │                 │                    │
 data/seeds.json ──────┘                 │                    │
   (commiteado)                          │                    │
                                         │                    │
                    ┌────────────────────┴──────────┐         │
                    │        cache seam             │         │
                    │  sha256(source+endpoint+args) │         │
                    │   ¿existe .cache/{src}/{h}?   │         │
                    └───────┬───────────────┬───────┘         │
                       HIT  │               │ MISS            │
                            │               ▼                 │
                            │      ┌────────────────┐         │
                            │      │  fetch (HTTP)  │         │
                            │      └───┬──┬──┬──────┘         │
                            │          │  │  │                │
                            │  DinoRank│  │  │SerpApi         │
                            │  /kw-res │  │  │/search.json    │
                            │       Ahrefs │                  │
                            │       /v3/ke/overview           │
                            │          │  │  │                │
                            │          ▼  ▼  ▼                │
                            │   escribe envelope tipado       │
                            │   {outcome: ok|empty|error}     │
                            │          │                      │
                            └──────────┤                      │
                                       ▼                      │
                        ┌──────────────────────────┐          │
                        │  clasificador de reglas  │          │
                        │  intención + etapa       │          │
                        │  (+ intent-overrides)    │          │
                        └────────────┬─────────────┘          │
                                     ▼                        │
                       data/keywords.jsonl (COMMITEADO)       │
                                     └────────────────────────┤
                                                              ▼
                                              ┌───────────────────────────┐
                                              │ Google Sheets API v4      │
                                              │ 1. spreadsheets.get       │
                                              │ 2. values.get  1:1        │  ← encabezados reales
                                              │ 3. values.get  A2:A       │  ← claves existentes
                                              │ 4. values.batchUpdate     │  ← una sola llamada
                                              │ 5. batchUpdate/deleteDim  │  ← solo con --prune
                                              └───────────────────────────┘
                                                              │
                                                              ▼
                                                  Sheet del cliente (5 tabs)
```

Ruta del caso principal, de punta a punta: `kw:expand` lee `data/seeds.json` → permuta → pide autocomplete y related searches a SerpApi (pasando por el seam de caché) → normaliza y deduplica → escribe candidatos. `kw:enrich` toma esos candidatos → un POST por keyword a DinoRank (pasando por el seam) → selecciona la shortlist → una sola GET a Ahrefs → clasifica por reglas → escribe `data/keywords.jsonl`. `sheet:push` lee ese JSONL → lee encabezados y claves reales del tab → diffea → escribe en un solo `values.batchUpdate`.

### Recommended Project Structure

```
seo-tools/
├── package.json              # standalone, NO npm workspace de la raíz
├── package-lock.json         # propio
├── tsconfig.json             # propio, no extiende el de la raíz
├── .gitignore                # node_modules/ y .cache/   ← evita tocar el .gitignore raíz
├── README.md                 # cómo correr cada subcomando y qué claves hacen falta
├── .cache/                   # gitignoreado
│   ├── dinorank/{sha256}.json
│   ├── ahrefs/{sha256}.json
│   ├── serpapi/{sha256}.json
│   └── _pending/             # solo si se usa el fallback cache:put
├── data/                     # COMMITEADO — la evidencia reproducible
│   ├── seeds.json            # snapshot de semillas extraídas de src/content
│   ├── modifiers.json        # familias de modificadores y geo
│   ├── sheet-columns.json    # mapeo campo interno → encabezado real de cada tab
│   ├── intent-overrides.json # clasificación manual/LLM del residuo ambiguo
│   ├── fixtures/             # respuestas reales grabadas (dinorank-pe.json, etc.)
│   └── keywords.jsonl        # dataset consolidado
└── src/
    ├── cli.ts                # despacho de subcomandos, parseo de flags
    ├── config.ts             # lee y valida env vars, falla con mensaje accionable
    ├── cache.ts              # cacheKey(), read(), write(), stats()
    ├── http.ts               # fetch con timeout, retry, concurrencia
    ├── sources/
    │   ├── dinorank.ts       # keywordResearch, tfidf, auditoria, canibalizaciones
    │   ├── ahrefs.ts         # keywordsExplorerOverview
    │   └── serpapi.ts        # googleSearch, autocomplete
    ├── keywords/
    │   ├── normalize.ts      # clave de idempotencia
    │   ├── seeds.ts          # extracción desde src/content → data/seeds.json
    │   ├── permute.ts        # semilla × modificador × geo
    │   ├── expand.ts         # orquesta las 4 capas y deduplica
    │   ├── enrich.ts         # DinoRank sobre todo, Ahrefs sobre shortlist
    │   └── classify.ts       # motor de reglas de intención y etapa
    ├── sheets/
    │   ├── client.ts         # auth + cliente
    │   ├── schema.ts         # lectura y validación de encabezados, diff
    │   └── upsert.ts         # read-then-diff-then-write + prune
    └── commands/
        ├── kw-seeds.ts
        ├── kw-expand.ts
        ├── kw-enrich.ts
        ├── sheet-push.ts
        ├── sheet-inspect.ts  # dump de tabs y encabezados reales
        ├── dino-probe.ts     # graba la primera respuesta real como fixture
        └── cache-stats.ts
```

---

### Pattern 1: Paquete standalone, no npm workspace

**What:** `seo-tools/` es un paquete Node independiente con su propio `package.json`, `package-lock.json`, `node_modules/` y `tsconfig.json`. No se registra en un campo `workspaces` de la raíz.

**Why:** el `package.json` de la raíz **no tiene campo `workspaces`** `[VERIFIED: leído]`. Convertirlo en workspace real exigiría agregarlo — justo el archivo que la decisión bloqueada prohíbe tocar, tanto por Nixpacks como por el conflicto de merge con el workstream `milestone`. "Workspace" en el CONTEXT hay que leerlo como "carpeta de trabajo aparte", no como `npm workspaces`. El planner no debe correr `npm init -w seo-tools`.

**Effect on Nixpacks:** Nixpacks autodetecta el `package.json` de la raíz y corre `npm ci` ahí. `seo-tools/package.json` a profundidad 1 no lo toca. Como `seo-tools/node_modules` queda gitignoreado, en la imagen de producción solo entra el fuente TypeScript, unos ~100 KB muertos. Aceptable. **Verificación obligatoria en el plan:** correr `npm run build` en la raíz después de crear `seo-tools/` y confirmar que sigue verde.

---

### Pattern 2: Seam de caché content-addressed con envelope tipado

**What:** un módulo único calcula la clave y es el único que escribe y lee archivos de caché. Todas las fuentes pasan por él.

**When to use:** siempre. Ninguna función de `sources/` debe llamar a `fetch` sin pasar por el seam.

**Envelope grabado en disco:**

```jsonc
{
  "schema": 1,
  "source": "dinorank",
  "endpoint": "/api/v1/keyword-research",
  "request": { "keyword": "hernia discal", "country": "pe", "language": "es" },
  "fetchedAt": "2026-08-11T14:03:22.418Z",
  "outcome": "ok",          // "ok" | "empty" | "error"
  "httpStatus": 200,
  "response": { /* cuerpo crudo tal cual llegó */ },
  "error": null
}
```

**La regla que decide qué se persiste** (esto es lo que separa un caché útil de uno envenenado):

| Situación | `outcome` | ¿Se escribe a disco? | ¿Cuenta como hit? |
|-----------|-----------|----------------------|-------------------|
| 200 con datos | `ok` | sí | sí |
| 200 sin filas (Ahrefs con geo long tail de Lima) | `empty` | **sí** | **sí** |
| 400 / 404 / 422 — request mal formado, no cambia con reintentar | `error` | sí | sí, y relanza el error desde el caché |
| 401 / 403 — clave inválida o sin permiso | — | **NO** | — |
| 429 / 5xx / timeout / error de red | — | **NO** | — |

La distinción `empty` contra "no hay archivo" es la que evita repreguntar por siempre las keywords que Ahrefs no cubre. La prohibición de persistir 401 es la que evita que el 401 vigente de DinoRank quede congelado en el caché y siga fallando después de que Juan regenere la clave.

**Cálculo de la clave:** SHA-256 de `source \n endpoint \n JSON estable de los parámetros`. "Estable" significa claves del objeto ordenadas alfabéticamente y valores normalizados (keyword ya pasada por `normalizeKeyword`, `country` y `language` en minúsculas). Sin eso, `{keyword, country}` y `{country, keyword}` producen archivos distintos para la misma consulta.

---

### Pattern 3: Frontera MCP — recomendación

**El problema:** las herramientas MCP solo son invocables desde un contexto de agente; un proceso `node` suelto no puede llamarlas. El CLI tiene que ser reejecutable sin agente.

**Recomendación: (b) REST directo para Ahrefs y SerpApi.** Es la única opción que deja el CLI headless y hace que el criterio de éxito 2 de la fase ("reprocesar el análisis completo sin volver a gastar cuota") sea verificable de verdad.

Justificación:
- Ahrefs: *"Using API v3 from any of the above methods is possible for Lite and higher subscription plans"* y MCP y API directa *"consume from the same API & Integrations limit"* `[CITED: help.ahrefs.com/en/articles/6559232-about-api-v3]`. No hay costo incremental por usar REST: es el mismo pool de 100.000 unidades.
- SerpApi: el MCP configurado es un servidor HTTP remoto en `mcp.serpapi.com` con OAuth y **sin variables de entorno locales** `[VERIFIED: inspección de la config MCP — `type: http`, `env: (none)`]`, así que no hay clave reutilizable en la máquina. Pero la API REST de SerpApi es la misma que alimenta el MCP y la clave se saca del panel.

**Lo que hace falta de Juan** (dos tareas de checkpoint humano en el plan):
1. `AHREFS_API_KEY` desde el panel de Ahrefs (Account settings → API keys) → agregar a `.secrets/.env`.
2. `SERPAPI_API_KEY` desde serpapi.com → agregar a `.secrets/.env`, y confirmar el plan contratado (Free 250/mes alcanza para el presupuesto de ~100 búsquedas, pero conviene saberlo antes).

**Fallback documentado — el seam `cache:put`.** Si alguna clave no llega, no se cambia la arquitectura: se llena el caché desde afuera.

```
1. seo-tools ejecuta:   tsx src/cli.ts kw:enrich --plan-only
   → escribe .cache/_pending/ahrefs.json:
     [{ "key": "9f3a…", "source": "ahrefs", "endpoint": "/v3/keywords-explorer/overview",
        "request": { "country": "pe", "keywords": "…", "select": "…" } }]

2. Un agente lee ese archivo, llama a la herramienta MCP con esos parámetros
   y devuelve el JSON crudo por:
     tsx src/cli.ts cache:put --source ahrefs --key 9f3a… --file payload.json

3. seo-tools ejecuta de nuevo:  tsx src/cli.ts kw:enrich
   → todas las claves pegan en caché, cero red, resultado idéntico.
```

La propiedad crítica de este diseño es que **la función de hash vive en un solo lugar**: el agente nunca calcula el nombre de archivo, se lo pregunta al CLI. Si el agente inventara la ruta, el caché se desincroniza y nadie se entera hasta el reprocesamiento.

Este mismo seam es lo que permite avanzar con DinoRank en 401: `cache:put --source dinorank` puede sembrar fixtures a mano y dejar toda la cadena aguas abajo verificable sin clave.

**Descartado: (c) export manual.** No es reproducible, no deja rastro de request, y rompe el criterio de éxito 2.

---

### Pattern 4: Upsert idempotente en Sheets (read-then-diff-then-write)

**No existe upsert nativo en la Sheets API v4.** Ni `values.update` ni `values.append` conocen una clave de negocio: `append` siempre agrega al final, que es exactamente la duplicación que SHEET-06 prohíbe. El upsert hay que construirlo.

**Algoritmo, 7 pasos:**

```
1. spreadsheets.get(fields="sheets.properties(sheetId,title,gridProperties)")
   → ¿existe el tab? si no: FALLA RUIDOSO con la lista de tabs que sí existen.
   → guarda sheetId (numérico, necesario para deleteDimension) y rowCount.

2. values.get(range="'Keyword Research'!1:1")
   → encabezados REALES. Compara contra el mapeo de data/sheet-columns.json.
   → si falta alguna columna requerida: FALLA RUIDOSO con el diff
     (esperadas vs. reales vs. faltantes vs. sobrantes).

3. values.get(range="'Keyword Research'!A2:A")   ← solo la columna clave
   → Map<claveNormalizada, índiceDeFila0Based>. Detecta duplicados preexistentes
     en el propio Sheet y los reporta.

4. Particiona las filas deseadas:
   UPDATE → la clave ya existe, va a su fila actual
   INSERT → clave nueva, va después de la última fila ocupada

5. Si INSERT excede gridProperties.rowCount:
   spreadsheets.batchUpdate({ appendDimension: { sheetId, dimension: "ROWS", length: n } })
   (hacerlo explícito mantiene los índices deterministas; values.append no)

6. values.batchUpdate({ valueInputOption: "RAW", data: [ValueRange, …] })
   → coalescer filas contiguas en un solo rango reduce el número de ValueRange.
   → UNA sola llamada HTTP para las ~500 filas.

7. Solo con --prune:
   filas cuya clave no está en el conjunto deseado → imprime qué va a borrar →
   spreadsheets.batchUpdate({ requests: [ { deleteDimension: {…} }, … ] })
   con los rangos ORDENADOS POR startIndex DESCENDENTE.
```

**Por qué `RAW` y no `USER_ENTERED`:** con `USER_ENTERED` Sheets reinterpreta los valores como si los hubiera tecleado una persona. Un CPC `0.35` puede volverse fecha según el locale del documento, un volumen `1,200` se parte, y una keyword que empiece con `=` o `+` se convierte en fórmula. `RAW` escribe literal. La única contra es que los números quedan como texto si la celda está formateada como texto; se resuelve enviando números JSON, no strings.

**Por qué borrar de abajo hacia arriba:** `deleteDimension` usa `startIndex`/`endIndex` base cero con `endIndex` exclusivo `[CITED: developers.google.com/.../spreadsheets/request]`, y borrar corre los índices de todo lo que está debajo. Borrar de arriba hacia abajo invalida todos los índices siguientes en el mismo batch.

**Cuota:** 300 requests/min por proyecto y 60 requests/min por usuario y proyecto, tanto de lectura como de escritura; sin límite diario `[CITED: developers.google.com/workspace/sheets/api/limits]`. Timeout de 180 s por request y payload recomendado ≤ 2 MB. El `sheet:push` completo son **4 o 5 llamadas HTTP**, no 500. Con 500 filas × ~20 columnas × ~20 bytes ≈ 200 KB, muy por debajo de los 2 MB.

**El escritor de tabs por URL** (fases 14-15) usa el mismo algoritmo con la URL como clave; conviene que `upsert.ts` reciba la columna clave como parámetro y no la hardcodee.

---

### Pattern 5: Expansión a 400+ sin gastar Ahrefs

Cuatro capas, de la más barata a la más cara. Rendimientos estimados sobre las semillas reales del proyecto.

**Capa 1 — Extracción de semillas (costo 0, determinista).** Inventario real contado hoy sobre `src/content/`:

| Fuente | Semillas | Ejemplos |
|--------|----------|----------|
| `services.ts` → `serviceCategories[].conditions` | 23 | escoliosis y otras deformidades, hernia discal, estenosis espinal (canal estrecho), enfermedad degenerativa discal, lumbalgia y ciática, cervicalgia, fracturas vertebrales, artrodesis de columna, artrosis, lesiones de rodilla/cadera/hombro/codo, desgarro muscular, tendinitis, displasia congénita de cadera, alteraciones de la marcha, escoliosis en niños, deformidades de postura |
| `services.ts` → `procedureApproaches[].examples` | 8 + 2 abordajes | cirugía mínimamente invasiva, cirugía convencional, fijación percutánea de fracturas, artrodesis en varios niveles, corrección de escoliosis |
| `locations.ts` | 4 sedes + 4 distritos + 3 clínicas | Surco, San Isidro, La Molina, Lima Central Tower, Av. El Derby, Javier Prado, Clínica Ricardo Palma, Sanna La Molina, Clínica Padre Luis Tezza |
| `blog.ts` | 4 títulos | "5 síntomas de columna que no debes ignorar", "¿Dolor de espalda o hernia discal?", "miedo a operarte de la columna", "estenosis espinal: qué es" |
| `faq.ts` | 11 preguntas | dolor de espalda, contractura vs hernia, miedo a operarse, recuperación, atención a niños, volver a trabajar |
| `cv.ts` | ~5 especialidades | traumatólogo, cirujano de columna, ortopedia infantil, cirugía degenerativa y traumática de columna, corrección de deformidades |
| `COMPETITORS.md` | ~12 términos que la competencia cubre | discopatía degenerativa, ciática, fractura vertebral, tumores de columna, cifosis, endoscopía espinal, procedimientos percutáneos, cirugía endoscópica, monitorización neurofisiológica |

**Total ≈ 55-70 semillas únicas después de normalizar.**

**Capa 2 — Permutación semilla × modificador × geo (costo 0, determinista).**

| Combinación | Cálculo | Candidatos |
|-------------|---------|------------|
| condición × modificador informacional (`qué es`, `síntomas de`, `causas de`, `tipos de`, `ejercicios para`, `cómo se cura`, `cuánto dura la recuperación de`, `se opera`) | 23 × 8 | 184 |
| condición × modificador comercial (`tratamiento de`, `cirugía de`, `operación de`, `precio de`, `especialista en`, `mejor médico para`) | 23 × 6 | 138 |
| especialidad × geo (`lima`, `surco`, `san isidro`, `la molina`, `cerca de mí`, `ricardo palma`, `sanna`, `tezza`, `montefiori`, `perú`) | 5 × 10 | 50 |
| procedimiento × modificador (`qué es`, `precio`, `recuperación`, `riesgos`, `en lima`, `cuánto cuesta`) | 10 × 6 | 60 |
| **Subtotal permutación** | | **~432** |

Ya solo con la capa 2 se supera el umbral de KWR-01. Pero la permutación inventa frases que nadie busca; por eso hacen falta las capas 3 y 4, que aportan el long tail real y sirven además de validación.

**Capa 3 — SerpApi autocomplete (~60 búsquedas).** Una llamada `engine=google_autocomplete` por semilla principal (~40-60 semillas), `hl=es`, `gl=pe`. Rendimiento observado típico 8-10 sugerencias por consulta → **400-600 crudas, ~150-250 nuevas únicas** tras deduplicar contra la permutación. **No usar expansión alfabética a-z**: multiplicaría por 27 el consumo (más de 1.500 búsquedas) y no cabe en el plan Free. En su lugar, sufijos dirigidos: `<semilla> en lima`, `<semilla> precio`, `<semilla> síntomas`.

**Capa 4 — SerpApi google search sobre ~40 head terms (~40 búsquedas).** Por SERP se obtienen ~8 `related_searches` y ~4 `related_questions` → **~480 crudas, ~120-200 nuevas únicas**. Bonus: estas mismas capturas son las que la fase 13 necesita para KWR-04 y COMP-03, así que hay que **guardarlas en caché con el mismo esquema** y no repetir la pasada de SERP el mes que viene.

**Capa 5 — DinoRank `/keyword-research` (incógnita).** La doc dice que devuelve un bloque `data` con "el análisis", sin especificar si incluye keywords relacionadas. En la interfaz de DinoRank el keyword research sí devuelve listas de relacionadas, así que es plausible que `data` las traiga. **Marcar como probe:** si `data` incluye relacionadas, la capa 5 aporta cientos de candidatos gratis y con volumen incluido; si no, el plan de 4 capas ya alcanza el umbral. El plan no debe depender de esto.

**Total realista:** 900-1.100 candidatos crudos → tras normalizar y deduplicar ~600-750 → tras filtro de relevancia (la keyword debe contener al menos un término del dominio médico o de especialidad, y no debe ser de otra ciudad del Perú) **~450-600 keywords en el universo final.** Margen cómodo sobre las 400.

**Presupuesto de llamadas:** ~100 búsquedas de SerpApi + ~500 POST a DinoRank (1 por keyword, concurrencia 3-4) + 1 GET a Ahrefs.

---

### Pattern 6: Clasificación determinista de intención y etapa

Dos ejes independientes. **Intención** con precedencia y primera coincidencia gana, evaluada de arriba hacia abajo. **Etapa** con su propio mapeo. Todo se evalúa sobre la keyword ya normalizada (minúsculas, sin tildes), así que los patrones se escriben sin acentos.

**Eje 1 — Intención (orden de precedencia estricto):**

| # | Intención | Disparadores en español (sobre texto normalizado) |
|---|-----------|---------------------------------------------------|
| 1 | `navegacional` | Marca sin término de condición: `dr angulo`, `juan carlos angulo`, `drangulocolumna`, `doctoralia`, `cmp 83189`. Marcas de competencia: `carranza`, `cieza`, `laos`, `centro de columna vertebral`, `clinica de la columna`. Marcas de clínica solas: `clinica ricardo palma`, `sanna`, `clinica tezza`, `montefiori` |
| 2 | `transaccional` | Precio: `precio`, `costo`, `cuanto cuesta`, `cuanto sale`, `tarifa`, `honorarios`, `presupuesto`. Agenda: `cita`, `citas`, `agendar`, `reservar`, `consulta con`, `telefono`, `numero`, `whatsapp`, `horario`. Proximidad: `cerca de mi`, `a domicilio`. Geo: `lima`, `surco`, `santiago de surco`, `san isidro`, `la molina`, `miraflores`, `peru`. Clínica + especialidad en la misma frase |
| 3 | `comercial` | Tratamiento: `tratamiento`, `tratamientos`, `como se cura`, `como tratar`, `alternativas a la cirugia`. Cirugía: `cirugia de`, `operacion de`, `se opera`, `hay que operar`. Comparativa: `mejor`, `mejores`, `top`, `opiniones`, `resenas`, `vs`, `diferencia entre`, `o` entre dos términos clínicos. Especialista sin geo: `especialista en`, `medico para`, `quien trata` |
| 4 | `informacional` | Todo lo demás. Refuerzos explícitos: `que es`, `cuales son`, `como saber si`, `sintomas`, `causas`, `tipos de`, `grados de`, `ejercicios`, `estiramientos`, `remedios`, `es grave`, `tiene cura`, `cuanto dura` |

**Eje 2 — Etapa del paciente** *(esta es una de las áreas de discreción de Claude; las reglas de abajo son la propuesta concreta)*:

| Etapa | Disparadores | Racional |
|-------|--------------|----------|
| `sintoma` | `dolor de`, `me duele`, `molestia`, `sintomas`, `signos`, `hormigueo`, `adormecimiento`, `no puedo`, `al caminar`, `al dormir`, `ejercicios`, `estiramientos`, `postura`, `remedios caseros`, `contractura` | El paciente todavía no le pone nombre a lo que tiene. Busca el síntoma, no el diagnóstico |
| `diagnostico` | `que es`, `tipos de`, `grados de`, `clasificacion`, `resonancia`, `radiografia`, `tomografia`, `diagnostico`, `examen`, `prueba`, `l4 l5`, `l5 s1`, `c5 c6`, `es grave`, `tiene cura`, `que pasa si no me opero` | Ya tiene o sospecha un nombre. Está entendiendo qué significa |
| `decision` | Cualquier disparador de `transaccional`, o `comercial` combinado con geo, o `cirujano`, `cirugia`, `operacion`, `postoperatorio`, `recuperacion despues de`, `cuanto tiempo de reposo`, `riesgos de la cirugia`, `mejor` + especialidad | Está eligiendo a quién y cuándo. Es la etapa que convierte |

**Regla de conflicto:** si Ahrefs devolvió `intents` para esa keyword (solo la shortlist), Ahrefs manda para el eje de intención y las reglas mandan siempre para el eje de etapa. La columna `Intent Source` registra `ahrefs` o `reglas`, coherente con la política de fuente por columna.

**El residuo que sí necesita un LLM.** Estimado en 8-15% del universo (~40-70 keywords): frases de más de 3 palabras que no disparan ningún patrón, y frases que disparan `transaccional` e `informacional` con la misma especificidad (ejemplo típico: `cirugia de hernia discal lima precio recuperacion`).

**Restricción dura de diseño:** el LLM **no puede correr en cada ejecución**. Si corriera, dos `sheet:push` seguidos podrían producir clasificaciones distintas y SHEET-06 dejaría de cumplirse por una razón que nada tiene que ver con el escritor. La forma correcta: clasificar el residuo una vez, revisar el resultado, y **commitear `data/intent-overrides.json`** con `{ claveNormalizada: { intent, stage, source: "llm" | "manual" } }`. El clasificador consulta ese archivo antes de aplicar reglas; si la keyword está ahí, gana el override. Reejecutar nunca vuelve a llamar al modelo.

---

### Anti-Patterns to Avoid

- **`npm init -w seo-tools` / agregar `workspaces` a la raíz.** Toca el archivo prohibido y mete el tooling en el `npm ci` de Nixpacks. `seo-tools/` es standalone.
- **Instalar `googleapis` completo.** 211 MB desempaquetados y 1.881 archivos para usar un solo API.
- **Escribir fila por fila con `values.update`.** 500 requests contra un límite de 60/min por usuario → 429 garantizado. Un solo `values.batchUpdate`.
- **`values.append` como mecanismo de carga.** Es exactamente la duplicación que SHEET-06 prohíbe.
- **`valueInputOption: "USER_ENTERED"`.** Sheets reinterpreta números, fechas y cualquier keyword que empiece con `=`.
- **Hardcodear el orden de columnas del Sheet.** El escritor lee el encabezado real y mapea por nombre.
- **Persistir en caché respuestas 401/403/429/5xx.** Congela el fallo. Ver *Pattern 2*.
- **Clasificar con LLM en cada corrida.** Rompe la idempotencia de SHEET-06 por la puerta de atrás.
- **Llamar a Ahrefs `keywords-explorer/matching-terms` para expandir.** Devuelve miles de filas facturables. Prohibido por decisión bloqueada.
- **Importar `src/content/*.ts` directamente en runtime del CLI.** Acopla el tooling a lo que v1.1 haga con esos archivos. Extraer una vez a `data/seeds.json` y commitear el snapshot.
- **Escribir cualquier cosa dentro de `src/`.** Restricción dura del milestone.

---

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar | Por qué |
|----------|--------------|------------------|---------|
| Firmar JWT y renovar el access token de Google | Firma RS256 manual del assertion + refresh | `auth.GoogleAuth` de `@googleapis/sheets` | Renovación automática, reintento de token vencido, soporte de ADC. Un error acá se manifiesta como un 401 esporádico a los 60 min |
| Construir rangos A1 y parsear respuestas de Sheets | Concatenación de strings y `res.body` crudo | Los métodos tipados de `spreadsheets.values` | Los índices de columna más allá de la Z (AA, AB…) son la fuente clásica de bugs silenciosos que escriben en la columna equivocada |
| Cargar `.env` | Parser propio o `dotenv` | `node --env-file` nativo de Node 24 | Ya soporta comillas, comentarios, multilínea y el prefijo `export` ignorado. Dejó de ser experimental en v24.10.0 `[CITED: nodejs.org/docs/latest-v24.x/api/cli.html]` |
| Ejecutar TypeScript | Paso de build con `tsc` + `node dist/` | `tsx` (o el type stripping nativo de Node 24) | Un paso de build en una herramienta interna solo agrega latencia y un directorio más que gitignorear |
| Quitar tildes | Tabla de reemplazo carácter por carácter | `str.normalize("NFD").replace(/\p{Diacritic}/gu, "")` | Nativo, cubre todo Unicode, una línea. Ver la advertencia sobre `ñ` en *Pitfall 8* |
| Limitar concurrencia | `Promise.all` sobre lotes de N | `p-limit` | El lote entero espera al elemento más lento; con 400 llamadas eso es varios minutos regalados |
| Hash estable de objetos | `JSON.stringify(obj)` directo | Serializador con claves ordenadas | El orden de claves de `JSON.stringify` sigue el orden de inserción → la misma consulta genera dos archivos de caché distintos |

**Key insight:** todo lo que se hand-rollea en este dominio falla en silencio, no con una excepción. Una columna mal calculada escribe datos correctos en el lugar equivocado; una clave de caché inestable duplica el gasto de cuota sin que nadie lo note hasta el mes siguiente; un `USER_ENTERED` convierte un CPC en fecha y el número sigue "estando ahí". Las verificaciones del plan tienen que mirar el resultado en el Sheet, no solo el exit code.

---

## Common Pitfalls

### Pitfall 1: `next build` se rompe en cuanto exista `seo-tools/*.ts` — CRÍTICO, afecta al workstream `milestone`

**Qué sale mal:** el build de producción de v1.1 empieza a fallar con errores de TypeScript en archivos que nada tienen que ver con la aplicación, y el deploy de Dokploy se cae.

**Por qué pasa:** `tsconfig.json` de la raíz declara `include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"]` y `exclude: ["node_modules"]`. El glob `**/*.ts` alcanza `seo-tools/src/*.ts`. Y la doc de Next 16 bundleada en el repo dice literal: *"Next.js fails your production build (`next build`) when TypeScript errors are present in your project"*, con `tsconfigPath` por defecto en `tsconfig.json`. Como `@googleapis/sheets` no está en el `node_modules` de la raíz, `tsc` reporta módulo no encontrado.

**Verificado empíricamente:** reproducido en `/tmp` con el `tsc` del propio repo y una copia del `include`/`exclude` de la raíz. Un archivo `seo-tools/broken.ts` produjo `error TS2322` y exit 2. Agregando `"seo-tools"` a `exclude`, exit 0.

**Cómo evitarlo (primario):** dos ediciones de una línea, ambas verificadas:

```jsonc
// tsconfig.json (raíz)
"exclude": ["node_modules", "seo-tools"]
```

```js
// eslint.config.mjs (raíz) — dentro de globalIgnores([...])
"seo-tools/**",
```

**Fallback si se quiere cero edición de archivos compartidos:** nombrar todos los fuentes de `seo-tools` con extensión `.cts`. Verificado: `**/*.ts` **no** matchea `.cts` y el `include` de la raíz no lo lista, exit 0. Es feo (semántica CommonJS, choca con `"type": "module"`) y solo se justifica si el otro workstream tiene un merge en vuelo sobre `tsconfig.json`.

**Señal temprana:** correr `npm run build` en la raíz inmediatamente después del primer commit de `seo-tools/`. Debe ser una verificación explícita del plan, no un supuesto. Y hay que avisar al workstream `milestone` de la edición.

---

### Pitfall 2: la service account puede no tener permiso de edición, y nadie lo ha comprobado

**Qué sale mal:** todo el tooling se construye contra un Sheet al que la cuenta solo puede leer, o al que ni siquiera puede acceder, y el fallo aparece al final, en la tarea que debía cerrar INFRA-01.

**Por qué pasa:** compartir un Sheet con una service account es un paso manual en la UI de Drive que se olvida con facilidad. Y aunque esté compartido, hay un segundo modo de fallo independiente: la Sheets API tiene que estar **habilitada en el proyecto de GCP** (`sheets.googleapis.com`), si no devuelve 403 `SERVICE_DISABLED` con un mensaje que se parece bastante a un problema de permisos y manda a depurar el lado equivocado.

**Cómo evitarlo:** hacer del sondeo la **primera tarea ejecutable de la fase**, antes de escribir cualquier otro código:

```
1. spreadsheets.get(spreadsheetId, fields="properties.title,sheets.properties")
   403 PERMISSION_DENIED  → la cuenta no está compartida
   403 SERVICE_DISABLED   → falta habilitar la API en GCP
   200                    → lectura OK, sigue

2. values.update en una celda de descarte (por ejemplo 'Keyword Research'!ZZ1)
   con un timestamp, y acto seguido values.clear del mismo rango.
   403 → la cuenta es Viewer, no Editor
   200 → escritura OK, INFRA-01 desbloqueado
```

Compartir a mano `juan-tech@juan-tech.iam.gserviceaccount.com` con rol **Editor** sobre el Sheet `1aowectbAJhyyZWhwQ6N_re-ENeSENvNN-5DebqCIls0`. Scope necesario: `https://www.googleapis.com/auth/spreadsheets` (el `.readonly` no sirve).

---

### Pitfall 3: los encabezados reales de los 5 tabs son desconocidos y la fase entera depende de ellos

**Qué sale mal:** se escribe el mapeo de columnas a partir de lo que "debería" tener una plantilla de SEO, y al llegar al push la mitad de los nombres no coincide. Peor: las fases 13, 14 y 15 se planifican sobre un supuesto y hay que replanificarlas.

**Cómo evitarlo:** subcomando `sheet:inspect` que vuelque todos los tabs y sus encabezados a `.planning/workstreams/seo-keywords/data/sheet-headers.json`, ejecutado inmediatamente después del Pitfall 2. Ese archivo pasa a ser el insumo de `data/sheet-columns.json` y la referencia de planificación de las tres fases siguientes.

**Tensión no resuelta que el planner tiene que gestionar.** Las columnas `Volume Source`, `KD Source`, `Traffic Potential Source`, `Intent Source` casi con seguridad **no existen** en la plantilla. La decisión bloqueada dice a la vez "fuente por columna sufijo" y "se respeta siempre el formato de columnas de la plantilla". Las dos no pueden ser verdad si las columnas faltan. Resolución propuesta: el escritor **agrega las columnas faltantes a la derecha de las existentes**, sin renombrar, reordenar ni borrar ninguna, detrás de un flag `--add-missing-columns` que reporte exactamente qué agrega. Es la lectura más fiel de "respetar el formato": la plantilla manda sobre lo que ya tiene, el tooling extiende. **Esto necesita confirmación de Juan** — el plan debería incluirlo como `checkpoint:human-verify` justo después de `sheet:inspect`, cuando ya se sepa qué columnas faltan de verdad.

---

### Pitfall 4: DinoRank es una keyword por llamada, y para Perú responde otro backend

**Qué sale mal:** el plan asume un endpoint bulk, y al implementarlo aparecen 400-500 POST secuenciales; o se lanzan los 500 en paralelo y el endpoint responde 429 o corta la conexión.

**Por qué pasa:** `/keyword-research` recibe `keyword` singular. Y la doc dice: *"ES y MX se resuelven con el servidor de visibilidad para cualquier usuario; el resto de países usa DataForSEO"*. Perú va por DataForSEO, así que la latencia y probablemente la forma de `data` difieren de los ejemplos españoles de la documentación.

**Cómo evitarlo:** `p-limit` con concurrencia 3-4, backoff exponencial en 429/5xx, timeout de 30 s con `AbortSignal.timeout`, y caché por keyword para que una interrupción no obligue a repetir nada. Y **hacer el probe con `country=pe`**, nunca con `es`: una fixture española daría un parser que falla en producción.

**Señal temprana:** si el probe con `pe` devuelve `source` distinto del que devuelve con `es`, hay que escribir dos ramas de parseo.

---

### Pitfall 5: el 401 vigente de DinoRank puede envenenar el caché y bloquear la fase

**Qué sale mal:** se ejecuta `kw:enrich` con la clave rota, el caché guarda 500 respuestas de error, Juan regenera la clave, se vuelve a ejecutar y todo sigue fallando "desde el caché".

**Cómo evitarlo:** la tabla de persistencia de *Pattern 2* — 401 y 403 nunca se escriben. Además, `config.ts` debe fallar con un mensaje accionable y no con un stack trace:

```
✗ DinoRank rechazó la clave (HTTP 401, code=unauthorized).
  La clave está presente en .secrets/.env (64 caracteres) pero DinoRank la rechaza.
  Verificado el 2026-08-10: no es un error de formato ni de nombre de cabecera.
  Acción: regenerar la clave desde el panel de DinoRank y reemplazar DINORANK_API_KEY.
  Mientras tanto: kw:expand, sheet:inspect, sheet:push y cache:stats funcionan sin ella.
```

**Estrategia de fase:** todo lo que no depende de DinoRank tiene que poder completarse y verificarse igual. Solo KWR-01 con métricas y KWR-02 quedan bloqueados. El cliente de DinoRank se construye contra el contrato documentado, con tests unitarios sobre fixtures grabadas, y `dino:probe` es la tarea que se corre en cuanto la clave funcione.

---

### Pitfall 6: confundir "no está en caché" con "la fuente no tiene datos"

**Qué sale mal:** Ahrefs devuelve `{"keywords": []}` para el geo long tail de Lima — hecho ya verificado con `hernia discal lima` y `traumatologo columna lima`. Si el vacío no se persiste, cada reejecución vuelve a preguntar por las mismas keywords sin datos y gasta unidades para siempre.

**Cómo evitarlo:** el campo `outcome: "empty"` de *Pattern 2*, tratado como hit. En el dataset esas keywords salen con `KD = sin_datos` y `KD Source = ahrefs_sin_datos`, que no es lo mismo que `KD Source = no_consultado`. La distinción importa para la fase 13: `ahrefs_sin_datos` sobre una keyword geo es señal positiva de oportunidad, no de dato faltante.

---

### Pitfall 7: `deleteDimension` con índices ascendentes borra las filas equivocadas

**Qué sale mal:** `--prune` borra filas correctas en la primera request del batch y filas arbitrarias en las siguientes, porque cada borrado corre hacia arriba todo lo que está debajo.

**Cómo evitarlo:** ordenar los rangos por `startIndex` **descendente** antes de armar el array `requests`, agrupar filas contiguas en un solo `deleteDimension`, y recordar que los índices son base cero con `endIndex` exclusivo — la fila 2 del Sheet (primera de datos, debajo del encabezado) es `startIndex: 1`. Antes de ejecutar, imprimir la lista de claves a borrar.

---

### Pitfall 8: la normalización que quita tildes también borra la eñe

**Qué sale mal:** `normalize("NFD").replace(/\p{Diacritic}/gu, "")` convierte `niños` en `ninos` y `años` en `anos`. Para la clave de idempotencia eso es exactamente lo que se quiere (los pacientes escriben de las dos formas y ambas deben caer en la misma fila). Lo que **no** se quiere es escribir `ninos` en el Sheet.

**Cómo evitarlo:** separar los dos valores. `keyword` conserva el texto original tal como se buscará y se mostrará; `keywordKey` es el valor normalizado y es lo único que se usa para deduplicar y para el upsert. En el Sheet se escribe `keyword`; la columna clave que se lee para el diff tiene que ser una columna que contenga `keywordKey`. Si la plantilla no tiene esa columna, es otra columna a agregar (ver Pitfall 3), o bien la clave se deriva aplicando la misma normalización a la columna `Keyword` leída del Sheet — esta segunda opción es preferible porque no obliga a exponer una columna técnica al cliente.

---

### Pitfall 9: `seo-tools/node_modules` se cuela en git

**Qué sale mal:** el `.gitignore` de la raíz tiene `/node_modules` con barra inicial, que en la sintaxis de gitignore ancla el patrón a la raíz del repositorio. `seo-tools/node_modules/` **no** queda cubierto.

**Cómo evitarlo:** crear `seo-tools/.gitignore` con `node_modules/` y `.cache/`. Un archivo nuevo, propio de la carpeta, sin tocar el `.gitignore` compartido. Verificar con `git status --short seo-tools/` después de `npm install`.

---

### Pitfall 10: importar `src/content/*.ts` en runtime acopla los dos workstreams

**Qué sale mal:** v1.1 agrega un `import` de Next o un `next/image` a `services.ts` y el CLI de v1.2 deja de arrancar, en medio de la fase 14.

**Cómo evitarlo:** `kw:seeds` importa esos módulos **una sola vez**, extrae los strings y escribe `seo-tools/data/seeds.json`, que se commitea. Todos los demás subcomandos leen el snapshot. Regenerarlo es una decisión explícita (`kw:seeds --refresh`), no un efecto colateral de cada corrida. Hoy `services.ts` y `locations.ts` son TypeScript plano sin ningún import `[VERIFIED: leídos]`, así que la extracción funciona; la protección es contra el futuro.

---

## Code Examples

### C1 — Autenticación y cliente de Sheets

```ts
// seo-tools/src/sheets/client.ts
// Verificado: exports y métodos inspeccionados sobre @googleapis/sheets@14.0.0
import { auth as googleAuth, sheets as sheetsApi, type sheets_v4 } from "@googleapis/sheets";

export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE;
  if (!keyFile) {
    throw new Error(
      "Falta GOOGLE_SERVICE_ACCOUNT_FILE en .secrets/.env.\n" +
        "Ejecutá el CLI con: node --env-file=.secrets/.env ..."
    );
  }

  const gAuth = new googleAuth.GoogleAuth({
    keyFile,
    // .readonly NO sirve: INFRA-01 necesita escribir.
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await gAuth.getClient();
  return sheetsApi({ version: "v4", auth: authClient as never });
}
```

Superficie de API verificada en vivo sobre el paquete instalado:

```
exports:                 AuthPlus, VERSIONS, auth, default, sheets, sheets_v4
auth.*:                  GoogleAuth, JWT, OAuth2, Compute, ExternalAccountClient, …
spreadsheets.*:          batchUpdate, create, get, getByDataFilter
spreadsheets.values.*:   append, batchClear, batchClearByDataFilter, batchGet,
                         batchGetByDataFilter, batchUpdate, batchUpdateByDataFilter,
                         clear, get, update
```

### C2 — Sondeo de permisos y de tabs (primera tarea ejecutable de la fase)

```ts
// seo-tools/src/commands/sheet-inspect.ts
const spreadsheetId = process.env.SEO_SHEET_ID!;

const meta = await sheets.spreadsheets.get({
  spreadsheetId,
  fields:
    "spreadsheetId,properties.title," +
    "sheets.properties(sheetId,title,index,gridProperties(rowCount,columnCount))",
});

const tabs = (meta.data.sheets ?? []).map((s) => s.properties!);
// → guardar tabs + encabezados en .planning/workstreams/seo-keywords/data/sheet-headers.json

for (const tab of tabs) {
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tab.title!.replace(/'/g, "''")}'!1:1`,
    majorDimension: "ROWS",
  });
  const headers = headerRes.data.values?.[0] ?? [];
  console.log(`${tab.title} (sheetId=${tab.sheetId}) → ${headers.length} columnas`);
  console.log(headers.map((h, i) => `  [${i}] ${h}`).join("\n"));
}
```

Nota sobre A1: las comillas simples son obligatorias cuando el nombre del tab lleva espacios — `'Keyword Research'!1:1` `[CITED: developers.google.com/workspace/sheets/api/guides/concepts]`. Duplicar la comilla simple para escaparla es la convención estándar; ninguno de los cinco tabs en alcance lleva apóstrofo, así que la regla no se ejercita acá `[ASSUMED]`.

### C3 — Escritura en lote

```ts
// seo-tools/src/sheets/upsert.ts (fragmento)
const quote = (t: string) => `'${t.replace(/'/g, "''")}'`;

await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId,
  requestBody: {
    // RAW y nunca USER_ENTERED: ver Pitfall / Anti-Patterns.
    valueInputOption: "RAW",
    data: ranges.map(({ startRow, rows }) => ({
      range: `${quote(tabTitle)}!A${startRow + 1}:${lastColumnLetter}${startRow + rows.length}`,
      majorDimension: "ROWS",
      values: rows,
    })),
  },
});
// Respuesta: { spreadsheetId, totalUpdatedRows, totalUpdatedColumns,
//              totalUpdatedCells, totalUpdatedSheets, responses[] }
```

### C4 — Crecer la grilla antes de insertar, y borrado con `--prune`

```ts
// Crecer filas si hacen falta (mantiene los índices deterministas).
if (neededRows > gridProperties.rowCount) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        { appendDimension: { sheetId, dimension: "ROWS", length: neededRows - gridProperties.rowCount } },
      ],
    },
  });
}

// Borrar residuales: SIEMPRE de abajo hacia arriba.
// startIndex/endIndex son base 0 y endIndex es EXCLUSIVO.
const blocks = contiguousBlocks(rowsToDelete).sort((a, b) => b.start - a.start);
await sheets.spreadsheets.batchUpdate({
  spreadsheetId,
  requestBody: {
    requests: blocks.map((b) => ({
      deleteDimension: {
        range: { sheetId, dimension: "ROWS", startIndex: b.start, endIndex: b.end },
      },
    })),
  },
});
```

### C5 — Normalización y clave de caché

```ts
// seo-tools/src/keywords/normalize.ts
/** Clave de idempotencia. OJO: también convierte "niños" → "ninos" (intencional). */
export const normalizeKeyword = (raw: string): string =>
  raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
```

```ts
// seo-tools/src/cache.ts
import { createHash } from "node:crypto";

/** JSON con claves ordenadas: sin esto la misma consulta genera dos archivos. */
const stable = (v: unknown): string => {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${stable(o[k])}`).join(",")}}`;
};

export const cacheKey = (source: string, endpoint: string, params: unknown): string =>
  createHash("sha256").update(`${source}\n${endpoint}\n${stable(params)}`).digest("hex");
```

### C6 — Cliente de DinoRank con fallo accionable

```ts
// seo-tools/src/sources/dinorank.ts
const BASE = "https://api.dinorank.com/api/v1";

// Envelope de error verificado en vivo el 2026-08-10.
type DinoError = { ok: false; error: { code: string; message: string } };

export async function keywordResearch(keyword: string) {
  const res = await fetch(`${BASE}/keyword-research`, {
    method: "POST",
    headers: {
      "X-API-Key": requireEnv("DINORANK_API_KEY"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ keyword, country: "pe", language: "es" }),
    signal: AbortSignal.timeout(30_000),
  });

  if (res.status === 401 || res.status === 403) {
    const body = (await res.json().catch(() => null)) as DinoError | null;
    // NO se persiste en caché — ver Pattern 2.
    throw new Error(
      `DinoRank rechazó la clave (HTTP ${res.status}, code=${body?.error?.code ?? "?"}).\n` +
        `Acción: regenerar DINORANK_API_KEY desde el panel de DinoRank.\n` +
        `Mientras tanto, kw:expand / sheet:inspect / sheet:push funcionan sin ella.`
    );
  }
  // La forma de la respuesta de éxito NO está documentada.
  // Grabar la primera respuesta real con `dino:probe` y tipar contra esa fixture.
  return res.json();
}
```

### C7 — Ahrefs REST, shortlist en una sola llamada

```ts
// seo-tools/src/sources/ahrefs.ts
// Solo 2 columnas facturables → ~20 unidades por fila (no 44).
// volume y cpc salen de DinoRank, no se piden acá.
const url = new URL("https://api.ahrefs.com/v3/keywords-explorer/overview");
url.searchParams.set("country", "pe");
url.searchParams.set("select", "keyword,difficulty,traffic_potential");
url.searchParams.set("keywords", shortlist.join(","));

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${requireEnv("AHREFS_API_KEY")}` },
  signal: AbortSignal.timeout(60_000),
});
const { keywords } = (await res.json()) as {
  keywords: Array<{ keyword: string; difficulty: number | null; traffic_potential: number | null }>;
};
// Ojo: un array vacío es un resultado LEGÍTIMO para el geo long tail de Lima → outcome "empty".
```

Smoke test sin costo (query de prueba gratuita documentada por Ahrefs):

```bash
curl -H "Authorization: Bearer $AHREFS_API_KEY" \
  "https://api.ahrefs.com/v3/keywords-explorer/overview?country=us&keywords=ahrefs&select=keyword,volume,traffic_potential,difficulty"
```

### C8 — SerpApi REST

```ts
// seo-tools/src/sources/serpapi.ts
const search = (params: Record<string, string>) => {
  const u = new URL("https://serpapi.com/search.json");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set("api_key", requireEnv("SERPAPI_API_KEY"));
  return fetch(u, { signal: AbortSignal.timeout(60_000) }).then((r) => r.json());
};

export const autocomplete = (q: string) =>
  search({ engine: "google_autocomplete", q, hl: "es", gl: "pe" });
//  → { suggestions: [{ value, relevance, type }, …] }

export const serpLima = (q: string) =>
  search({
    engine: "google",
    q,
    location: "Lima, Peru",
    hl: "es",
    gl: "pe",
    google_domain: "google.com.pe",
    num: "10",
  });
//  → { organic_results: [...], related_searches: [{ query, link, block_position }],
//      related_questions: [{ question, snippet }] }
```

### C9 — Ejecución del CLI

```jsonc
// seo-tools/package.json (scripts)
{
  "type": "module",
  "scripts": {
    "cli": "tsx --env-file=../.secrets/.env src/cli.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

```bash
# Desde seo-tools/
npm run cli -- sheet:inspect
npm run cli -- kw:expand --out data/candidates.jsonl
npm run cli -- kw:enrich --shortlist 50
npm run cli -- sheet:push --tab "Keyword Research"
npm run cli -- sheet:push --tab "Keyword Research" --prune
npm run cli -- cache:stats
```

`tsx` acepta todos los flags de Node, incluido `--env-file` `[VERIFIED: Context7 /privatenumber/tsx — "tsx --env-file=.env ./file.js"]`. Los valores ya presentes en `process.env` **tienen precedencia** sobre los del archivo `[CITED: nodejs.org/docs/latest-v24.x/api/cli.html]`, lo cual es útil para sobrescribir una clave puntualmente sin editar `.secrets/.env`.

---

## State of the Art

| Enfoque viejo | Enfoque actual | Cuándo cambió | Impacto |
|---------------|----------------|---------------|---------|
| `dotenv` para cargar `.env` | `node --env-file` nativo | Estable desde Node v24.10.0 | Una dependencia menos. Ya soporta comillas, comentarios, multilínea y `export` |
| `ts-node` + `tsconfig` afinado | `tsx`, o directamente Node 24 con type stripping | tsx desde 2022; strip nativo estable en Node 23-24 | Node 24.13.0 corre `.ts` sin loader. Falla con `enum` y `namespace` |
| `googleapis` monolítico | `@googleapis/<api>` por servicio | Submódulos desde 2021 | 756 KB contra 211 MB para el mismo trabajo |
| `axios` / `node-fetch` | `fetch` global + `AbortSignal.timeout()` | Node 18+ / 17.3+ | Cero dependencias de HTTP |
| Sheets con OAuth de usuario | Service account + share explícito | — | Sin intervención humana, que es literalmente lo que pide INFRA-01 |
| Ahrefs solo vía MCP | API v3 directa, incluida desde Lite, mismo pool de unidades | — | Elimina la frontera MCP para el tooling headless |

**Obsoleto o a evitar:**
- `google-spreadsheet` (wrapper de terceros): agrega una capa de abstracción propia sobre una API que ya está tipada y que además cambia más lento que el wrapper.
- Ahrefs API v2: reemplazada por v3.
- `--experimental-strip-types` como flag explícito: en Node 24 el type stripping ya viene activo por defecto.

---

## Assumptions Log

| # | Claim | Sección | Riesgo si está mal |
|---|-------|---------|--------------------|
| A1 | El bloque `data` de `/keyword-research` contiene volumen, CPC y competencia con nombres de campo reconocibles | Standard Stack → DinoRank | Alto. KWR-02 depende de esos tres valores. Mitigado por la tarea `dino:probe`, que es obligatoria antes de escribir el parser |
| A2 | `/keyword-research` puede devolver keywords relacionadas y servir de capa 5 de expansión | Pattern 5 | Bajo. El plan de 4 capas ya llega a 400+ sin esta capa. Es upside, no dependencia |
| A3 | La respuesta de DinoRank para `country=pe` (DataForSEO) tiene la misma forma que para `es` | Pitfall 4 | Medio. El probe con `pe` lo resuelve. Si difiere, hacen falta dos ramas de parseo |
| A4 | Las columnas `Volume Source`, `KD Source`, `Intent Source` no existen hoy en la plantilla | Pitfall 3 | Medio. Si existieran, se ahorra la decisión de agregar columnas. `sheet:inspect` lo resuelve en la primera tarea |
| A5 | La columna clave del tab `Keyword Research` es la primera (A) | Pattern 4 | Bajo. El código lee la posición por nombre de encabezado, no la asume |
| A6 | Autocomplete devuelve ~8-10 sugerencias y una SERP ~8 related searches + ~4 PAA | Pattern 5 | Bajo. Si rinde menos, se compensa ampliando el conjunto de semillas de la capa 3 |
| A7 | El residuo ambiguo de clasificación es 8-15% del universo | Pattern 6 | Bajo. Solo afecta cuánto tiempo lleva la revisión del override |
| A8 | Los patrones de intención y las reglas de etapa en español propuestos son correctos para búsquedas médicas de Perú | Pattern 6 | Medio. Es área de discreción de Claude por decisión del CONTEXT. Se valida contra `intents` de Ahrefs en las 40-60 de la shortlist: si el motor coincide con Ahrefs en más del 80%, las reglas son buenas |
| A9 | Nixpacks ignora `seo-tools/package.json` porque solo detecta el manifiesto de la raíz | Pattern 1 | Alto si está mal — rompería el deploy de v1.1. Mitigado por la verificación explícita de `npm run build` y, si se quiere certeza total, un deploy de prueba |
| A10 | Escapar apóstrofos en A1 duplicándolos (`''`) es la convención correcta | C2 | Nulo en la práctica: ninguno de los cinco tabs en alcance lleva apóstrofo |
| A11 | La columna `intents` de Ahrefs no factura unidades | Standard Stack → Ahrefs | Bajo. Se confirma con una llamada de una fila y comparando el saldo antes y después |
| A12 | Juan puede generar claves de API de Ahrefs y de SerpApi desde sus paneles | Pattern 3 | Medio. Si no puede, se cae al fallback `cache:put`, que ya está diseñado |

---

## Open Questions

> **Estado: RESUELTAS en la planificación de la fase 12 (2026-08-10).** Las cinco quedaron
> asignadas a una tarea concreta de un plan, así que ninguna sigue abierta a la hora de ejecutar.
> Se conservan escritas porque documentan por qué cada tarea existe.
>
> | # | Pregunta | Dónde se cierra |
> |---|----------|-----------------|
> | 1 | Forma real de la respuesta de `/keyword-research` para Perú | `dino:probe` con `country=pe`, plan `12-05` tarea 2, que graba la fixture antes de escribir el parser |
> | 2 | Si existen las columnas de fuente por métrica en la plantilla | `sheet:inspect`, plan `12-01` tarea 1, más el `checkpoint:human-verify` del plan `12-02` tarea 1 |
> | 3 | Cuota de DinoRank y consumo de `/keyword-research` | Bandera `--limit` con corrida acotada de medición, plan `12-05` tarea 3, más la confirmación de plan en su tarea 1 |
> | 4 | Plan contratado de SerpApi | `user_setup` y confirmación explícita antes de gastar búsquedas, plan `12-03` |
> | 5 | Si hace falta enmendar KWR-02 y el criterio de éxito 4 del ROADMAP | **Ya aplicado.** La enmienda está en `REQUIREMENTS.md` líneas 67-78 y en `ROADMAP.md` línea 66. No hace falta tarea |

1. **¿Qué devuelve realmente `/keyword-research` de DinoRank para Perú?**
   - Lo que se sabe: parámetros exactos, envelope de error, y que el top level trae `keyword`, `country`, `language`, `source` y `data`.
   - Lo que falta: los campos dentro de `data`, y si la ruta DataForSEO cambia la forma.
   - Recomendación: subcomando `dino:probe <keyword>` que grabe la respuesta completa en `data/fixtures/dinorank-keyword-research-pe.json` y la imprima. Correrlo apenas la clave funcione, **antes** de escribir el parser. Los tests unitarios del parser corren contra esa fixture y no necesitan clave.

2. **¿Las columnas de fuente por métrica existen en la plantilla?**
   - Lo que se sabe: el Sheet es una plantilla, los cinco tabs están nombrados, y el formato de columnas se respeta.
   - Lo que falta: los encabezados reales, que nadie ha leído.
   - Recomendación: `sheet:inspect` como primera tarea; luego `checkpoint:human-verify` con Juan para aprobar el agregado de columnas a la derecha.

3. **¿Cuál es la cuota mensual de DinoRank y cuánto consume `/keyword-research`?**
   - Lo que se sabe: `/auditoria` y `/canibalizaciones` explícitamente **no** consumen cuota. Por contraste, `/keyword-research` sí consume, pero no está documentado cuánto ni sobre qué techo.
   - Lo que falta: el techo del plan de Juan.
   - Recomendación: hacer que `kw:enrich` acepte `--limit N` y arranque con 20 keywords para medir, en vez de lanzar las 500 de una. El caché convierte esa prudencia en gratis: lo consultado queda consultado.

4. **¿Qué plan de SerpApi tiene Juan?**
   - Lo que se sabe: Free 250/mes, Starter 1.000, Developer 5.000, Production 15.000.
   - Recomendación: el plan de expansión consume ~100 búsquedas, que entra hasta en Free. Confirmarlo igual antes de correr, y hacer que `kw:expand` imprima el conteo estimado de búsquedas y pida confirmación con `--yes`.

5. **¿Hay que enmendar KWR-02 en `REQUIREMENTS.md`?**
   - El CONTEXT lo pide como acción pendiente, pero la enmienda **ya está escrita** en `REQUIREMENTS.md` líneas 67-74, con la nota de por qué. El `ROADMAP.md` línea 66, en cambio, **todavía dice** "más KD, traffic potential y referring domains needed de Ahrefs" sin la restricción de shortlist. Recomendación: el plan incluye una tarea de una línea que alinee el criterio de éxito 4 del ROADMAP con la enmienda ya aplicada, para que el audit de cierre de milestone no marque falso incumplimiento.

---

## Environment Availability

| Dependencia | Requerida por | Disponible | Versión | Fallback |
|-------------|---------------|------------|---------|----------|
| Node.js | Todo el tooling | ✓ | v24.13.0 | — |
| npm | Instalación de `seo-tools` | ✓ | incluido | — |
| TypeScript (repo) | `tsc --noEmit` | ✓ | `node_modules/.bin/tsc` presente | `seo-tools` instala el suyo |
| `.secrets/service-account.json` | INFRA-01 | ✓ (existe) | `juan-tech@juan-tech.iam.gserviceaccount.com` | ninguno |
| Permiso de **edición** sobre el Sheet | INFRA-01, SHEET-06 | **✗ SIN VERIFICAR** | — | ninguno — bloquea INFRA-01 |
| Sheets API habilitada en GCP | INFRA-01 | **✗ SIN VERIFICAR** | — | ninguno — bloquea INFRA-01 |
| `DINORANK_API_KEY` | INFRA-02, KWR-02 | **✗ rechazada (401)** | — | `cache:put` con fixtures; el resto de la fase avanza |
| `AHREFS_API_KEY` (REST) | KWR-02 shortlist | **✗ no generada** | — | MCP de Ahrefs + seam `cache:put` |
| `SERPAPI_API_KEY` (REST) | KWR-01 capas 3 y 4 | **✗ no generada** | — | MCP de SerpApi + seam `cache:put`; o solo permutación, que ya llega a 400+ |
| MCP de Ahrefs | Fallback | ✓ (contexto de agente) | Lite, 66.582 unidades libres, reset 2026-08-20 | — |
| MCP de SerpApi | Fallback | ✓ (remoto, `mcp.serpapi.com`, OAuth) | — | — |
| `seo-tools/` | Todo | ✗ (se crea en esta fase) | — | — |

**Faltantes que bloquean sin alternativa:**
- Permiso de edición de la service account sobre el Sheet, y Sheets API habilitada en el proyecto de GCP. Es la primera tarea ejecutable de la fase.
- Clave funcional de DinoRank para cerrar KWR-01 con métricas y KWR-02. Todo lo demás de la fase puede completarse sin ella.

**Faltantes con alternativa:**
- Claves REST de Ahrefs y SerpApi: el seam `cache:put` permite llenar el caché desde un agente con MCP y dejar el CLI funcionando igual.

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1`.

### Categorías ASVS aplicables

| Categoría ASVS | Aplica | Control estándar en esta fase |
|----------------|--------|-------------------------------|
| V2 Authentication | sí | Service account de Google con `GoogleAuth` (firma y renovación de JWT delegadas a la librería). Claves de API por cabecera Bearer / `X-API-Key`, nunca en query string |
| V3 Session Management | no | El CLI no tiene sesiones |
| V4 Access Control | sí | Scope mínimo: `.../auth/spreadsheets`, no `drive`. La service account se comparte solo sobre ese Sheet, no sobre el Drive completo |
| V5 Input Validation | sí | Todas las respuestas de las tres APIs son entrada no confiable. Validar forma antes de indexar campos. Filtrar keywords que contengan coma antes de mandarlas a Ahrefs (el parámetro `keywords` es separado por comas) o que empiecen con `=`, `+`, `-`, `@` antes de escribirlas en el Sheet |
| V6 Cryptography | sí | Solo SHA-256 vía `node:crypto` para claves de caché — hashing no criptográfico de contenido, no protege secretos. Nada hand-rolled |
| V7 Error Handling & Logging | sí | Ningún log debe imprimir el valor de `DINORANK_API_KEY`, `AHREFS_API_KEY`, `SERPAPI_API_KEY` ni el contenido de `service-account.json`. Los mensajes de error muestran longitud y prefijo, nunca el valor |
| V14 Configuration | sí | `.secrets/` gitignoreado (línea 44 de `.gitignore`, ya verificado). `seo-tools/.gitignore` propio para `node_modules/` y `.cache/` |

### Patrones de amenaza para este stack

| Patrón | STRIDE | Mitigación estándar |
|--------|--------|---------------------|
| Credencial commiteada por accidente (`.env`, JSON de service account, clave en un archivo de caché) | Information Disclosure | `.secrets/` gitignoreado; `.cache/` gitignoreado; el envelope de caché guarda `request` pero **nunca cabeceras**; `git status --short` verificado tras el primer `npm install` |
| Formula injection en Google Sheets: una keyword que empieza con `=`, `+`, `-` o `@` se ejecuta como fórmula al abrir el documento | Tampering | `valueInputOption: "RAW"` (ya lo evita) + sanitizado defensivo: prefijar `'` a los valores que empiecen con esos caracteres |
| Borrado destructivo de filas del documento del cliente | Denial of Service / Tampering | `--prune` detrás de flag explícito, dry-run por defecto, reporte de lo que va a borrar antes de ejecutar |
| Caché envenenado con respuestas de error que se sirven como datos válidos | Tampering | Campo `outcome` tipado; 401/403/429/5xx nunca se persisten |
| Slopsquatting de dependencias | Tampering | Auditoría de legitimidad ejecutada (sección *Package Legitimacy Audit*); `package-lock.json` commiteado |
| Fuga de secretos por logs o por mensajes de excepción | Information Disclosure | Los errores de auth se construyen a mano con texto fijo, no interpolan la clave |
| Escalada de alcance de la service account | Elevation of Privilege | Scope único `spreadsheets`; sin `drive`, sin `drive.file`, sin `cloud-platform` |

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

`CLAUDE.md` de la raíz consiste en `@AGENTS.md`. `AGENTS.md` dice: *"This is NOT the Next.js you know. This version has breaking changes — read the relevant guide in `node_modules/next/dist/docs/` before writing any code."*

Aplicación a esta fase:
- Esta fase **no escribe código de Next.js** ni toca `src/`, así que la advertencia no restringe el diseño del tooling.
- Sí importa en un punto: la doc bundleada `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/typescript.md` fue la que confirmó que `next build` falla ante errores de TypeScript en el proyecto y que usa `tsconfig.json` por defecto. Esa es la base del Pitfall 1 y se leyó del bundle local, no de la web, tal como manda AGENTS.md.

Restricciones adicionales de `.planning/PROJECT.md` y del CONTEXT del workstream que el planner debe respetar:
- Ninguna fase de v1.2 escribe en `src/`.
- Nunca escribir en `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md` ni bajo `.planning/workstreams/milestone/`.
- Copy en español neutro/peruano, moneda en soles. Aplica a los mensajes del CLI y a la documentación de `seo-tools/README.md`.
- Contenido YMYL: esta fase no produce texto clínico, así que el gate no aplica. Sí aplica desde la fase 15.

---

## Sources

### Primary (HIGH confidence)

- Verificación empírica local con `tsc` del repo: `include: ["**/*.ts"]` de la raíz **sí** captura `seo-tools/*.ts` (exit 2); agregar `"seo-tools"` a `exclude` lo resuelve (exit 0); la extensión `.cts` también escapa el glob (exit 0).
- Verificación empírica local con Node v24.13.0: type stripping nativo funciona con `import "./lib.ts"`, `--env-file` inyecta variables, `enum` falla con `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`.
- Instalación e inspección real de `@googleapis/sheets@14.0.0`: exports, `auth.GoogleAuth`, `auth.JWT`, y métodos de `spreadsheets` y `spreadsheets.values`.
- `npm view` de `@googleapis/sheets`, `googleapis`, `google-auth-library`, `tsx`, `p-limit`, `p-retry`: versión, `dist.unpackedSize`, `dist.fileCount`, repositorio, licencia, `scripts.postinstall`, fecha de creación. Descargas semanales vía `api.npmjs.org/downloads`.
- `gsd-tools query package-legitimacy check --ecosystem npm` sobre los cuatro paquetes principales.
- Llamada HTTP real a `POST https://api.dinorank.com/api/v1/keyword-research` sin cabecera: envelope de error confirmado. Probes 404 en las tres rutas habituales de OpenAPI.
- Descarga y parseo del HTML de `https://api.dinorank.com/docs/docs.html`: tablas de parámetros de los 11 endpoints, cero ejemplos de respuesta.
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/typescript.md` (doc bundleada de Next 16.2.12).
- Lectura directa de `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `src/content/services.ts`, `src/content/locations.ts`, y conteo de semillas en `blog.ts`, `faq.ts`, `cv.ts`.
- Context7 `/privatenumber/tsx`: `tsx --env-file=.env ./file.js` y `node --import tsx ./file.ts`.
- Context7 `/websites/googleapis_dev_nodejs_googleapis`: patrón `GoogleAuth` con `keyFile` y `scopes`, y `auth.getClient()`.

### Secondary (MEDIUM confidence)

- `developers.google.com/workspace/sheets/api/limits` — 300 req/min por proyecto, 60 req/min por usuario y proyecto, sin límite diario, 180 s de timeout, 2 MB recomendados.
- `developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdate` — método, ruta, cuerpo y respuesta.
- `developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/request` — `DeleteDimensionRequest`, `AppendDimensionRequest`, índices base cero con `endIndex` exclusivo.
- `developers.google.com/workspace/sheets/api/guides/concepts` — notación A1 y comillas para nombres con espacios.
- `nodejs.org/docs/latest-v24.x/api/cli.html#--env-fileconfig` — sintaxis, precedencia de `process.env`, no experimental desde v24.10.0.
- `help.ahrefs.com/en/articles/6559232-about-api-v3` — API v3 desde Lite, 100.000 unidades/mes, MCP y API directa comparten el mismo pool.
- `docs.ahrefs.com/en/api/reference/keywords-explorer/get-overview` — endpoint, cabecera, parámetros, columnas, forma de respuesta.
- `serpapi.com/google-autocomplete-api`, `serpapi.com/related-searches`, `serpapi.com/pricing`.
- Inspección de la configuración MCP local: `serpapi` es `type: http` contra `mcp.serpapi.com` sin variables de entorno locales.

### Tertiary (LOW confidence)

- Búsqueda web sobre taxonomía de intención de búsqueda en español (informacional / comercial / transaccional / navegacional): la taxonomía es estándar y consistente entre fuentes, pero **la noción de "etapa del paciente" no aparece estandarizada en ninguna fuente**. Las reglas de etapa de *Pattern 6* son propuesta propia, marcadas A8 en el Assumptions Log, y son explícitamente área de discreción de Claude según el CONTEXT.
- Rendimientos estimados de autocomplete y related searches (~8-10 y ~8+4): órdenes de magnitud conocidos, no medidos en este proyecto. El MCP de SerpApi no fue invocable desde este contexto de agente para medirlos en vivo.

---

## Metadata

**Desglose de confianza:**

| Área | Nivel | Razón |
|------|-------|-------|
| Standard stack y versiones | HIGH | Todo verificado contra el registro npm y contra el paquete instalado e inspeccionado |
| Riesgo de build sobre v1.1 (Pitfall 1) | HIGH | Reproducido empíricamente con el `tsc` del repo, más la doc bundleada de Next 16 |
| Google Sheets: métodos, cuotas, upsert | HIGH | Doc oficial más superficie de API verificada sobre el paquete real |
| Ahrefs REST y presupuesto de unidades | HIGH | Doc oficial de Ahrefs, incluido el artículo que confirma que Lite incluye API v3 con pool compartido |
| SerpApi REST | MEDIUM | Doc oficial leída; no se pudo ejecutar una llamada real desde este contexto |
| DinoRank: parámetros y auth | HIGH | Doc oficial parseada y error verificado en vivo |
| DinoRank: forma de la respuesta de éxito | **LOW** | Indocumentada, sin OpenAPI, clave rechazada. Mitigado con la tarea de probe obligatoria |
| Expansión a 400+ | MEDIUM | La aritmética de permutación es determinista y verificable; los rendimientos de SerpApi son estimados |
| Clasificación de intención y etapa | MEDIUM | La taxonomía de intención es estándar; el mapeo de etapa es propuesta propia, validable contra `intents` de Ahrefs sobre la shortlist |
| Comportamiento de Nixpacks con `seo-tools/` | MEDIUM | Razonado desde cómo detecta el manifiesto de la raíz; no se probó un deploy |

**Research date:** 2026-08-10
**Valid until:** 2026-09-09 para el stack y las APIs de Google y Ahrefs (estables). **2026-08-17 para todo lo de DinoRank**: en cuanto la clave funcione hay que grabar la fixture y actualizar esta sección con el contrato real.
