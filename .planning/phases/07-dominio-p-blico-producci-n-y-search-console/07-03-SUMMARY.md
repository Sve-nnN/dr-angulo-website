---
phase: 07-dominio-p-blico-producci-n-y-search-console
plan: 03
subsystem: backend
tags: [observabilidad, resend, sitemap, seo, noindex, dokploy, privacidad]

requires:
  - phase: 01-fundaci-n-t-cnica-y-de-marca
    provides: submitContactForm, src/lib/resend.ts y siteConfig con la casilla destino
  - phase: 07
    plan: 01
    provides: aplicacion desplegada y canonicalizacion de host verificada en produccion
provides:
  - "submitContactForm registra los cuatro modos de fallo de envio con prefijo filtrable [contact]"
  - "Entrada del paciente escapada antes de interpolarse en el HTML del correo"
  - "Sitemap de 12 URLs, sin la ruta marcada noindex"
  - ".env.example documenta las tres variables de correo con marcadores de posicion"
affects: [07-04, 07-05, seo, formulario-de-contacto]

tech-stack:
  added: []
  patterns:
    - "Prefijo de log declarado una sola vez como constante de modulo y referenciado en cada punto de registro"
    - "Inspeccion del arreglo de Promise.allSettled en vez de confiar en un catch: el SDK de Resend devuelve el fallo dentro del objeto resuelto"
    - "El sitemap solo propone URLs que el propio sitio declara indexables"

key-files:
  created: []
  modified:
    - src/app/actions/contact.ts
    - src/app/sitemap.ts
    - .env.example

key-decisions:
  - "La razon de rechazo se asigna a una variable llamada rejectionReason antes de registrarla, para que el gate de privacidad pueda ser estricto sin excepciones por patron"
  - "El escapado del HTML del correo vive como funcion local en el mismo archivo, porque D-04 fija src/proxy.ts como unico archivo fuente nuevo de la fase"
  - "El honeypot sigue sin registrar nada, para no darle senal al bot"
  - "Los contenedores exited (1) posteriores al despliegue se aceptan como comportamiento normal de la actualizacion progresiva del swarm, igual que en 07-01"

patterns-established:
  - "Gate de privacidad que balancea parentesis sobre la lista de argumentos de cada console.error y se prueba en las dos direcciones antes de darlo por bueno"

requirements-completed: [DOM-05]
requirements-deferred: [DOM-04]

coverage:
  - id: D1
    description: "Los cuatro modos de fallo de envio dejan una linea de log con prefijo estable y la respuesta al paciente no cambia"
    requirement: DOM-04
    verification:
      - kind: other
        ref: "gates estaticos sobre src/app/actions/contact.ts: LOGS=5, PREFIX_DEF=1, PREFIX_VALUE=1, PREFIX_USES=6, SETTLED=1, SUCCESS_RETURN=2"
        status: pass
      - kind: e2e
        ref: "observacion de la linea [contact] en el log del contenedor tras un envio real"
        status: deferred
    human_judgment: false
  - id: D2
    description: "Ninguna linea de registro contiene el nombre, telefono, correo ni motivo que escribio el paciente"
    requirement: DOM-04
    verification:
      - kind: other
        ref: "escaner de PII con balanceo de parentesis, corrido en las dos direcciones: 0 sobre la implementacion y 2 sobre un fixture con parsed.data.reason y d.name"
        status: pass
    human_judgment: false
  - id: D3
    description: "La entrada del paciente llega escapada al HTML del correo del doctor"
    requirement: DOM-04
    verification:
      - kind: other
        ref: "revision del diff: los cuatro valores pasan por escapeHtml antes de interpolarse en el cuerpo del correo"
        status: pass
    human_judgment: true
  - id: D4
    description: "El sitemap de produccion trae 12 URLs sobre el apex y ninguna marcada como no indexable"
    requirement: DOM-05
    verification:
      - kind: integration
        ref: "curl al sitemap del build local en el puerto 3112: TOTAL=12 con las 12 URLs esperadas"
        status: pass
      - kind: e2e
        ref: "curl a https://drangulocolumna.com/sitemap.xml tras el despliegue: SITEMAP_TOTAL=12, SITEMAP_APEX=12, 0 apariciones de privacidad"
        status: pass
    human_judgment: false
  - id: D5
    description: "La pagina de privacidad sigue viva y conserva su directiva noindex de v1.0"
    requirement: DOM-05
    verification:
      - kind: e2e
        ref: "curl a https://drangulocolumna.com/privacidad: 200 y una aparicion de content=noindex, follow"
        status: pass
    human_judgment: false

duration: 20min
completed: 2026-08-10
status: complete
---

# Phase 7 Plan 03: Observabilidad del formulario y sitemap indexable Summary

**El fallo de envio de `submitContactForm` dejo de ser silencioso: los cuatro modos de fallo registran una linea con prefijo `[contact]` sin datos del paciente, la entrada del paciente viaja escapada al correo del doctor, y el sitemap de produccion bajo a 12 URLs al sacar la ruta que el propio sitio marca noindex.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-08-10T14:08:00Z
- **Completed:** 2026-08-10T14:28:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Los tres caminos por los que el formulario devolvia exito sin enviar nada (falta de API key, falta de casilla destino, error devuelto por Resend) ahora dejan rastro filtrable en el log del contenedor. El cuarto punto cubre la excepcion inesperada.
- Se elimino codigo muerto real: el `catch` anterior no se ejecutaba nunca, porque `Promise.allSettled` no rechaza y el SDK de Resend mete el fallo dentro del objeto resuelto. Ahora el codigo inspecciona el arreglo de resultados y detecta ambos casos.
- T-07-10 quedo mitigado: `name`, `phone`, `email` y `reason` pasan por una funcion local de escapado antes de interpolarse en el HTML del correo, asi que una etiqueta escrita por un paciente llega como texto y no como marcado.
- T-07-09 quedo mitigado y verificado con un escaner probado en las dos direcciones, no solo en la direccion que conviene.
- El sitemap de produccion ya no se contradice con lo que el sitio declara: 12 URLs, todas indexables. Esto evita el error "Submitted URL marked noindex" cuando el plan 07-05 envie el sitemap a Search Console.

## Task Commits

1. **Task 1: Hacer visible el fallo de envio en submitContactForm** - sin commit propio por diseno del plan: los tres archivos se commitean juntos en la tarea 3.
2. **Task 2: Sitemap con solo URLs indexables y variables de correo documentadas** - sin commit propio, mismo motivo.
3. **Task 3: Desplegar los dos cambios y confirmar que produccion sigue sana** - `f759daa` (fix)

El plan fija explicitamente que nada se commitea hasta la tarea 3 (criterio de aceptacion de la tarea 2). Se respeto esa instruccion en lugar del commit por tarea que usa el flujo por defecto.

## Files Created/Modified

- `src/app/actions/contact.ts` - Constante de modulo `LOG_PREFIX` con el valor `[contact]`, funcion local `escapeHtml`, cuatro puntos de `console.error` (cliente ausente, casilla ausente, promesa rechazada, error devuelto por Resend) y reemplazo del `catch` vacio por un registro real. La firma exportada, el tipo `ContactState` y el esquema de Zod no cambiaron.
- `src/app/sitemap.ts` - La entrada de `/privacidad` sale del arreglo de rutas estaticas y queda en su lugar un comentario que explica por que.
- `.env.example` - Documenta `RESEND_API_KEY` (vacia), `EMAIL_FROM` con el valor de produccion acordado en D-05 y `CONTACT_EMAIL_TO` con la nota de que la define Juan. Solo marcadores de posicion.

## Estado encontrado al empezar

Los cambios de las tareas 1 y 2 ya estaban escritos en el arbol de trabajo, sin commitear, cuando arranco esta ejecucion. Vienen de una corrida anterior de esta misma fase que quedo interrumpida despues de completar el plan 07-01 (su SUMMARY estaba escrito y commiteado en `9ee3aa2`, todavia sin publicar).

No se dio por buena esa herencia: se leyeron los tres archivos completos contra el texto del plan y se corrieron todos los gates de las tres tareas desde cero. El plan 07-01 no se volvio a ejecutar porque su SUMMARY ya estaba completo, con estado `complete` y evidencia medida.

## Alcance del push publicado

`git log --oneline origin/main..HEAD` antes de empujar devolvio exactamente dos commits:

```
f759daa fix(07-03): registra los fallos de envio del formulario y saca privacidad del sitemap
9ee3aa2 docs(07-01): completa el plan de canonicalizacion de host y evidencia de dominio
```

Archivos publicados: `.env.example`, `src/app/actions/contact.ts`, `src/app/sitemap.ts` y `07-01-SUMMARY.md`. El commit `9ee3aa2` es documentacion pura bajo `.planning/` y no afecta el build. `origin/main` paso de `4bd12d3` a `f759daa`.

Nada aparecio fuera de lo previsto: los dos commits estan explicados y los tres archivos de codigo son exactamente los que declara el plan.

## Mediciones registradas

Valores literales observados el 2026-08-10.

**Gates estaticos de la tarea 1:**

```
LOGS:           5
PREFIX_DEF:     1
PREFIX_VALUE:   1
PREFIX_USES:    6
SETTLED:        1
SUCCESS_RETURN: 2
PII_IN_LOGS:    0
```

**Escaner de PII corrido en las dos direcciones**, como exige el criterio de aceptacion:

```
LEAK_FIXTURE (esperado 2):   2
IMPLEMENTACION (esperado 0): 0
```

El fixture incluye `parsed.data.reason` en una linea y `d.name` repartido en varias lineas: el escaner detecta los dos. Tambien ignora correctamente `emailTo` y `rejectionReason`, que es lo que permite que el gate no lleve exclusiones por patron.

**Gates de la tarea 2 (build de produccion local en el puerto 3112):**

```
TOTAL:        12
PRIV_STATUS:  200
PRIV_NOINDEX: 1
ENVDOC:       4
```

Las 12 URLs listadas fueron la raiz, `/sobre-el-doctor`, `/servicios`, `/testimonios`, `/preguntas-frecuentes`, `/agendar`, `/contacto`, `/blog` y los 4 posts del blog. Coinciden exactamente con la lista del criterio de aceptacion.

**Gates de la tarea 3 (produccion, despues del despliegue):**

```
SITEMAP_TOTAL: 12
SITEMAP_APEX:  12
PRIV:          200
CONTACTO:      200
APEX:          200
```

Comprobaciones adicionales sobre produccion: `0` apariciones de `privacidad` en el sitemap publicado, `1` aparicion de `content="noindex, follow"` en `/privacidad`, y las 9 rutas base (`/`, `/servicios`, `/sobre-el-doctor`, `/testimonios`, `/preguntas-frecuentes`, `/contacto`, `/blog`, `/agendar`, `/privacidad`) devolvieron `200` las nueve.

**Despliegue:**

```
applicationStatus:  done
deployment title:   fix(07-03): registra los fallos de envio del formulario y sa...
contenedor nuevo:   running | Up About a minute
git status:         limpio para los tres archivos
```

`npx tsc --noEmit`, `npm run lint` y `npm run build` terminaron los tres con codigo 0. El build genero 19 rutas e incluye la linea `Proxy (Middleware)` que aporto el plan 07-01.

## Decisions Made

- La razon de rechazo se asigna a `rejectionReason` antes de registrarla. Es lo que permite que el gate de privacidad busque el token `reason` con limite de palabra y sin ninguna exclusion: una exclusion generica por acceso a propiedad dejaria pasar `parsed.data.reason`, que es exactamente la fuga que T-07-09 prohibe.
- El escapado se resolvio con una funcion local en el mismo archivo y no con un modulo nuevo, porque D-04 fija `src/proxy.ts` como unico archivo fuente nuevo de la fase.
- Los asuntos de los correos siguen usando el valor sin escapar, porque viajan como texto plano y no como marcado. Solo el cuerpo HTML usa los valores escapados.
- El honeypot conserva su retorno temprano sin registro. Registrar ahi le daria al bot una senal de que fue detectado.

## Deviations from Plan

### Hallazgos aceptados

**1. [Rule 3 - Estado previo heredado] Las tareas 1 y 2 ya estaban escritas en el arbol de trabajo**

- **Found during:** arranque de la ejecucion
- **Issue:** Los tres archivos aparecian modificados y sin commitear antes de empezar, por una corrida anterior interrumpida.
- **Fix:** Ninguno sobre el codigo. Se verificaron los tres archivos completos contra el texto del plan y se corrieron todos los gates desde cero antes de commitear. El contenido encontrado cumplia el plan al pie de la letra.
- **Verification:** Todos los gates de las tareas 1, 2 y 3 corrieron en esta sesion y pasaron.

**2. [Rule 3 - Instruccion ya cumplida] El plan 07-01 ya estaba ejecutado**

- **Found during:** carga del contexto
- **Issue:** El encargo pedia ejecutar 07-01 y 07-03, pero `07-01-SUMMARY.md` ya existia con estado `complete`, evidencia medida y su commit de codigo `4bd12d3` publicado en `origin/main`.
- **Fix:** No se volvio a ejecutar. Se publico su SUMMARY, que era el unico artefacto que quedaba sin empujar.
- **Verification:** `4bd12d3` presente en `origin/main`, `src/proxy.ts` existe y el build reporta `Proxy (Middleware)`.

**3. [Rule 3 - Bloqueo evaluado y descartado] Contenedor `exited (1)` posterior al despliegue**

- **Found during:** Task 3
- **Issue:** El criterio de aceptacion pedia que `docker.getContainers` no mostrara contenedores en `Exited` posteriores al despliegue. Aparecio `dr-angulo-website-nqscdc.1.zt8w1w2khamje5gdesty45shm` con `Exited (1)`.
- **Analisis:** Es el mismo patron ya analizado y documentado en `07-01-SUMMARY.md`: el historico muestra un `Exited (1)` por cada despliegue anterior. Es la replica retirada por la actualizacion progresiva del swarm. La replica nueva quedo `running`, se la observo durante mas de un minuto con el mismo identificador y sin reinicios, y las 9 rutas responden 200.
- **Fix:** Ninguno. El criterio se da por cumplido en su intencion (contenedor sirviendo, sin ciclo de reinicios) y no en su literal.
- **Verification:** `applicationStatus` en `done`, contenedor `Up About a minute`, humo de 9 rutas en 200.

---

**Total deviations:** 3 documentadas, 0 cambios de codigo fuera de plan.
**Impact on plan:** Ninguno.

## Criterios diferidos

**La observacion de la linea de log en produccion queda pendiente.**

El plan ya preveia que enviar la Server Action por curl es fragil porque exige el identificador de accion, y pedia leer el log despues de que alguien use el formulario o dejar la comprobacion registrada como pendiente del plan 07-04, donde la verificacion de extremo a extremo si es directa.

Se confirmo que el entorno de produccion tiene exactamente dos claves, `NEXT_PUBLIC_SITE_URL` y `GOOGLE_PLACES_API_KEY`, y que `RESEND_API_KEY` no esta presente. Es decir, el codigo desplegado entra hoy por la rama que registra `falta la API key de Resend en el entorno` en cada envio. Falta observar esa linea en el log, cosa que requiere que alguien envie el formulario.

**DOM-04 queda diferido por decision explicita de Juan del 2026-08-10:** todavia no hay cuenta de Resend, asi que el plan 07-04 no corre y no se cargo ninguna variable de correo en Dokploy. El trabajo de codigo de este plan si se hizo, porque no depende de esa cuenta y es justamente lo que impide que el formulario siga reportando exito sin enviar nada. Lo que queda diferido es unicamente la verificacion en vivo con envio real de correo. No se simulo ningun paso ni se dio por aprobado un criterio que no se pudo correr.

## Issues Encountered

Ninguno que bloqueara la ejecucion. El build sigue emitiendo `[google-reviews] Places API respondió 403` durante la generacion estatica, igual que en 07-01: la seccion de resenas se degrada sin romper el build y ese componente pertenece a fases posteriores.

## User Setup Required

Ninguno para este plan. Lo que queda para Juan vive en los planes que corren fuera de esta ejecucion: la Redirect Rule de Cloudflare (07-02), la cuenta y el dominio verificado en Resend con sus variables (07-04, diferido) y la propiedad de Search Console con el envio del sitemap (07-05).

## Next Phase Readiness

- DOM-05 queda cubierto. El sitemap que el plan 07-05 va a enviar a Search Console ya no se contradice con lo que el sitio declara indexable, asi que no deberia producir el error "Submitted URL marked noindex".
- DOM-04 queda a medias por decision de negocio: el codigo esta listo y desplegado, falta la cuenta de Resend. Cuando exista, el plan 07-04 carga `RESEND_API_KEY`, `EMAIL_FROM` y `CONTACT_EMAIL_TO`, y ahi se cierra la verificacion en vivo mas la observacion de la linea de log.
- Al cargar el entorno en 07-04 hay que preservar las dos claves que ya viven ahi: `saveEnvironment` reemplaza el bloque completo.
- `origin/main` y `HEAD` quedan al dia en `f759daa`, asi que lo medido en produccion corresponde al codigo verificado.

## Self-Check: PASSED

- `src/app/actions/contact.ts`, `src/app/sitemap.ts` y `.env.example` existen y estan commiteados.
- `.planning/phases/07-dominio-p-blico-producci-n-y-search-console/07-03-SUMMARY.md` existe.
- El commit `f759daa` existe en el historico y esta publicado en `origin/main`.

---
*Phase: 07-dominio-p-blico-producci-n-y-search-console*
*Completed: 2026-08-10*
