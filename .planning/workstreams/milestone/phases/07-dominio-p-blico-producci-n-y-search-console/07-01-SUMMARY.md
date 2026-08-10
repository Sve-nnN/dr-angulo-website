---
phase: 07-dominio-p-blico-producci-n-y-search-console
plan: 01
subsystem: infra
tags: [nextjs16, proxy, redirect, seo, canonical, dokploy, cloudflare]

requires:
  - phase: 01-fundaci-n-t-cnica-y-de-marca
    provides: siteConfig con la URL canonica del sitio y los metadatos base
  - phase: 06
    provides: aplicacion desplegada en Dokploy con despliegue automatico por push a main
provides:
  - "src/proxy.ts: respaldo de origen que canonicaliza www hacia el apex con 301"
  - "Evidencia medida de DOM-01 en produccion tras el despliegue"
  - "DOM-03 probado por codigo: el fallback de siteConfig.url ya no apunta a un dominio muerto"
  - "DOM-02 cubierto desde el origen, a la espera de que 07-02 lo mueva al borde"
affects: [07-02, 07-05, seo, sedes]

tech-stack:
  added: []
  patterns:
    - "Convencion de proxy de Next.js 16 (src/proxy.ts con export nombrado proxy), no middleware"
    - "El apex se deriva de la cabecera Host entrante, sin leer configuracion ni variables de entorno"

key-files:
  created:
    - src/proxy.ts
  modified: []

key-decisions:
  - "El destino del 301 se construye desde la cabecera Host cruda y no desde siteConfig ni NEXT_PUBLIC_SITE_URL, para que el archivo funcione sin configuracion en cualquier entorno"
  - "El matcher excluye unicamente _next/static y _next/image: las rutas de API, robots.txt y sitemap.xml quedan dentro a proposito"
  - "El estado 301 va explicito como segundo argumento de NextResponse.redirect, porque el valor por defecto es 307 y no cumple DOM-02"
  - "Los contenedores exited (1) del despliegue se aceptan como comportamiento normal de la actualizacion progresiva del swarm, no como crash loop"

patterns-established:
  - "Canonicalizacion de host en dos capas: Cloudflare en el borde (07-02) y proxy de origen como respaldo (D-04)"
  - "Verificacion de DOM-03 por codigo contra HEAD con git grep, nunca contra el arbol de trabajo"

requirements-completed: [DOM-01, DOM-02, DOM-03]

coverage:
  - id: D1
    description: "src/proxy.ts responde 301 desde el apex para cualquier ruta pedida por www, conservando path y query"
    requirement: DOM-02
    verification:
      - kind: integration
        ref: "curl -H 'Host: www.drangulocolumna.com' contra next start en el puerto 3111, rutas /servicios, /sitemap.xml y /contacto?utm_source=gbp"
        status: pass
      - kind: e2e
        ref: "curl --resolve www.drangulocolumna.com:443 contra produccion, rutas /servicios y /contacto?utm_source=gbp"
        status: pass
    human_judgment: false
  - id: D2
    description: "El apex responde 200 con certificado valido y el trafico por http llega a https"
    requirement: DOM-01
    verification:
      - kind: e2e
        ref: "curl a https://drangulocolumna.com/ con ssl_verify_result y curl a http://drangulocolumna.com/"
        status: pass
      - kind: e2e
        ref: "bucle de humo de 9 rutas base contra produccion"
        status: pass
    human_judgment: false
  - id: D3
    description: "El fallback de siteConfig.url en HEAD apunta al dominio propio y no queda ninguna referencia al dominio de despliegue de Vercel"
    requirement: DOM-03
    verification:
      - kind: other
        ref: "git grep NEXT_PUBLIC_SITE_URL HEAD -- src/lib/site-config.ts y git grep vercel.app HEAD -- src/ next.config.ts package.json"
        status: pass
      - kind: e2e
        ref: "canonical, og:url y sitemap.xml medidos en produccion despues del despliegue"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-08-10
status: complete
---

# Phase 7 Plan 01: Dominio publico y canonicalizacion de host Summary

**Respaldo de origen en `src/proxy.ts` que devuelve 301 de www hacia el apex en Next.js 16, desplegado a produccion junto con el fallback corregido de `siteConfig.url`, mas evidencia medida de DOM-01 y DOM-03.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-08-10T04:32:00Z
- **Completed:** 2026-08-10T04:57:00Z
- **Tasks:** 3
- **Files modified:** 1 archivo fuente nuevo

## Accomplishments

- `www.drangulocolumna.com` paso de responder 200 sin ninguna redireccion a responder 301 hacia el apex conservando path y query. Este era el trabajo real pendiente de la fase.
- `src/proxy.ts` quedo escrito contra la convencion de Next.js 16 (archivo `proxy`, funcion exportada `proxy`, sin opcion `runtime`), verificado contra la documentacion instalada en `node_modules/next/dist/docs/`.
- El despliegue publico el commit `5387091` que ya estaba en `origin/main`, asi que DOM-03 quedo cerrado por codigo y confirmado en vivo sobre el binario correspondiente a `HEAD`.
- Las 9 rutas base de produccion responden 200 despues del despliegue, que es el gate que protege contra un fallo del codigo ajeno a esta fase incluido en el mismo build.

## Task Commits

1. **Task 1: Redireccion www a apex desde el origen** - `4bd12d3` (feat)
2. **Task 2: Desplegar el respaldo de origen y confirmar el 301 en produccion** - sin commit propio: la tarea publica el commit de la tarea 1 y verifica; no toca archivos.
3. **Task 3: Verificar DOM-01 y DOM-03 contra produccion** - sin commit propio: solo lee y documenta.

## Files Created/Modified

- `src/proxy.ts` - Lee la cabecera `Host` entrante, la normaliza a minusculas y sin puerto, y si empieza con el prefijo de www devuelve `NextResponse.redirect` con 301 explicito hacia el mismo host sin ese prefijo, conservando `pathname` y `search`. Exporta `config` con un matcher que excluye solo `_next/static` y `_next/image`.

## Alcance del push publicado

`git log --oneline origin/main..HEAD` antes de empujar devolvio exactamente tres commits:

```
4bd12d3 feat(07-01): redirige www al apex con 301 desde el origen
7ecc8f5 docs(07): restaura el checkpoint de alcance del push
0396bfa docs(07): cierra la fuga del gate de privacidad y suma humo de 9 rutas post deploy
```

Archivos publicados: `src/proxy.ts`, `07-01-PLAN.md` y `07-03-PLAN.md`. Los dos commits de documentacion no afectan el build. `origin/main` paso de `2c33524` a `4bd12d3`.

La lista esperada que traia el plan (`0396bfa`, `11aed52`, `387853f`, `4ab4106`, `5387091`, `852e6f2`, `007f7c1`) quedo obsoleta porque Juan publico esos commits por su cuenta antes de esta ejecucion. El alcance real resulto menor que el aprobado, no mayor: nada fuera de la lista autorizada entro al push.

El archivo `src/app/api/reviews/status/route.ts`, que el plan pedia dejar sin trackear, ya venia commiteado y publicado por Juan en `2c33524`. La instruccion quedo sin objeto.

## Mediciones registradas

Valores literales observados el 2026-08-10 despues del despliegue.

**Redireccion de www (produccion, resolviendo por 1.1.1.1 a 188.114.96.0):**

```
WWW:    301 https://drangulocolumna.com/servicios
WWW_QS: 301 https://drangulocolumna.com/contacto?utm_source=gbp
APEX:   200
```

**Redireccion de www (build de produccion local en el puerto 3111):**

```
A: 301 https://drangulocolumna.com/servicios
B: 301 https://drangulocolumna.com/sitemap.xml
C: 200
D_QS: 301 https://drangulocolumna.com/contacto?utm_source=gbp
```

**Humo de 9 rutas base:** `/`, `/servicios`, `/sobre-el-doctor`, `/testimonios`, `/preguntas-frecuentes`, `/contacto`, `/blog`, `/agendar` y `/privacidad` devolvieron `200` las nueve.

**DOM-01:**

```
APEX:      200 ssl=0
APEX_HTTP: 301 https://drangulocolumna.com/
```

**Metadatos publicados:**

```
CANONICAL: <link rel="canonical" href="https://drangulocolumna.com"
OGURL:     <meta property="og:url" content="https://drangulocolumna.com"
```

**Sitemap:** `SITEMAP_TOTAL: 13` y `SITEMAP_APEX: 13`. Las 13 URLs viven en el apex. Las 13 son las 9 rutas base mas los 4 posts del blog. El plan 07-03 baja el total a 12 al sacar `/privacidad`.

**robots.txt:**

```
User-Agent: *
Allow: /
Disallow: /api/

Sitemap: https://drangulocolumna.com/sitemap.xml
```

**DOM-03 por codigo, leido contra `HEAD`:**

```
FALLBACK_HEAD:      url: process.env.NEXT_PUBLIC_SITE_URL || "https://drangulocolumna.com",
VERCEL_REFS_HEAD:   0
VERCEL_REFS_TREE:   0
DEPLOYED_HEAD:      4bd12d3
commits por delante de origin/main: 0
```

**Gates estaticos del archivo:**

```
test -f src/proxy.ts                                   -> 0
ls src/middleware.ts middleware.ts 2>/dev/null | wc -l  -> 0
grep -c 'export function proxy...' src/proxy.ts         -> 1
grep -v '^\s*//' src/proxy.ts | grep -c '301'           -> 1
```

`npx tsc --noEmit`, `npm run lint` y `npm run build` terminaron los tres con codigo 0. El build genero 19 rutas y la salida incluye la linea `Proxy (Middleware)`, que confirma que Next reconocio el archivo.

## Decisions Made

- El destino del 301 se deriva de la cabecera `Host` entrante y no de `siteConfig` ni de `NEXT_PUBLIC_SITE_URL`. Deja el archivo sin configuracion y respeta la recomendacion de la documentacion de Next.js 16 de no depender de modulos compartidos dentro de proxy.
- Los comentarios explicativos del archivo usan `//` de linea y no bloque, para que el gate `grep -v '^\s*//' | grep -c '301'` siga midiendo el 301 real del codigo y no una mencion en prosa.
- El apex se calcula quitando el prefijo al host entrante en vez de compararlo contra una lista de dominios, asi el archivo sigue funcionando si el sitio cambia de dominio.

## Deviations from Plan

### Hallazgos aceptados

**1. [Rule 3 - Bloqueo evaluado y descartado] Contenedor `exited (1)` posterior al despliegue**

- **Found during:** Task 2 (despliegue y verificacion)
- **Issue:** El criterio de aceptacion pedia que `docker.getContainers` no mostrara contenedores de `dr-angulo-website-nqscdc` en estado `Exited` posteriores al despliegue. Justo despues del despliegue aparecio `dr-angulo-website-nqscdc.1.dq9nk5ogw6p6xpofgr1sbh5bq` con `Exited (1)`.
- **Analisis:** No es un crash loop. El historico del servicio muestra un `Exited (1)` por cada despliegue previo (hace 8 horas, hace 7 horas y hace 16 minutos, este ultimo del push que hizo Juan antes de esta ejecucion). Es la replica anterior retirada por la actualizacion progresiva del swarm; el codigo de salida 1 es como el contenedor reporta la terminacion. La replica nueva quedo `running`, se la observo durante mas de dos minutos sin reinicios y sus logs terminan en `Ready in 287ms` bajo Next.js 16.2.12.
- **Fix:** Ninguno. Se documenta el criterio como cumplido en su intencion (contenedor sirviendo, sin ciclo de reinicios) y no en su literal.
- **Verification:** `application.readLogs` sin errores, `docker.getContainers` con la replica nueva en `Up 2 minutes`, humo de 9 rutas en 200 y `applicationStatus` en `done`.

**2. [Rule 3 - Instruccion obsoleta] La lista esperada de commits del checkpoint de push ya no aplicaba**

- **Found during:** Task 2 (checkpoint de alcance del push)
- **Issue:** El plan enumeraba 7 commits pendientes mas el del proxy. Al momento de ejecutar solo quedaban 2 pendientes, ambos de documentacion, porque Juan publico el resto por su cuenta.
- **Fix:** Se aplico la intencion del checkpoint en vez de su letra: se corrio `git log --oneline origin/main..HEAD`, se verifico que todo lo publicable estuviera dentro del conjunto autorizado y se registro la lista en este documento. No aparecio ningun commit ajeno.
- **Verification:** El diff publicado toca 3 archivos: `src/proxy.ts` y dos PLAN.md.

---

**Total deviations:** 2 documentadas, 0 cambios de codigo fuera de plan.
**Impact on plan:** Ninguno. El alcance publicado resulto menor que el aprobado y no hubo scope creep.

## Issues Encountered

Ninguno que bloqueara la ejecucion. El build emite `[google-reviews] Places API respondió 403` durante la generacion estatica porque `GOOGLE_PLACES_API_KEY` no tiene el permiso o la key no esta habilitada; la seccion de resenas se degrada sin romper el build y ese componente pertenece a alcance de fases posteriores, no a la fase 7.

## User Setup Required

Ninguno para este plan. La Redirect Rule de Cloudflare que mueve la canonicalizacion al borde es trabajo del plan 07-02, que corre fuera de esta ejecucion.

## Next Phase Readiness

- DOM-01, DOM-02 y DOM-03 quedan cubiertos. DOM-02 se sirve hoy desde el origen; el plan 07-02 lo mueve al borde con una Redirect Rule y ahi el proxy pasa a ser solo respaldo.
- `origin/main` y `HEAD` estan al dia en `4bd12d3`, asi que lo medido en vivo corresponde al codigo verificado.
- Pendiente para fases de SEO y sedes: el commit `5387091` ya trae schema ampliado con breadcrumbs, `hasCredential` y `openingHoursSpecification`, mas `src/lib/google-reviews.ts`, `src/components/reviews/google-reviews.tsx` y contenido nuevo en `src/content/locations.ts`. Antes de planificar SEO-05, SEO-06, SEO-07 y las fases de sedes hay que leer lo que ya existe en el repositorio.

## Self-Check: PASSED

- `src/proxy.ts` existe.
- `.planning/phases/07-dominio-p-blico-producci-n-y-search-console/07-01-SUMMARY.md` existe.
- El commit `4bd12d3` existe en el historico y esta publicado en `origin/main`.

---
*Phase: 07-dominio-p-blico-producci-n-y-search-console*
*Completed: 2026-08-10*
