# La Content-Security-Policy del sitio, y por qué todavía no bloquea nada

El sitio sirve una `Content-Security-Policy-Report-Only`. Report-only significa
exactamente lo que dice: el navegador evalúa la política, avisa de lo que la
habría violado, y carga la página igual. Nada se bloquea. Ese es el estado
buscado en esta etapa, no un paso a medias.

El comentario largo sobre `headers()` en `next.config.ts` describe el plan desde
antes: (1) levantarla en report-only con un endpoint que recoja los reportes,
(2) dejarla correr con tráfico real el tiempo suficiente para ver los orígenes
que aparecen de verdad, y (3) recién ahí pasarla a enforce. Este documento cubre
el paso 1, sostiene el paso 2 mientras dura, y deja escrito el paso 3 con fecha.

---

## Qué eran los issues de CSP de la auditoría

La auditoría del 2026-08-23 (`audit/findings/2026-08-23-auditoria-seo.md`, línea
191) anota que Lighthouse registra issues de CSP en devtools en `/agendar`,
`/servicios/escoliosis-y-deformidades` y `/servicios/estenosis-espinal`. Antes de
escribir una sola directiva había que saber si eso significaba que ya existía una
política parcial en algún lado bloqueando chunks legítimos. No existe. La
comprobación, con su salida literal.

**1. Búsqueda en el repo.**

```
$ grep -rn 'Content-Security-Policy' src/ scripts/ public/ next.config.ts
next.config.ts:18:   * Falta a propósito `Content-Security-Policy` en modo enforce. El sitio carga
next.config.ts:22:   * falta: (1) levantarla primero como `Content-Security-Policy-Report-Only`
```

Las dos apariciones están dentro del comentario que precede a `headers()`. No hay
ningún `<meta http-equiv="Content-Security-Policy">` en ninguna plantilla, ni
ninguna cabecera de política emitida desde `src/proxy.ts`.

**2. Cabeceras de producción.** `curl -sI` contra la portada y las tres rutas de
la auditoría, el 2026-08-25. Las cuatro respuestas devuelven el mismo juego de
cabeceras de seguridad, sin ninguna de política. La de `/agendar`, literal y sin
recortar:

```
$ curl -sI https://drangulocolumna.com/agendar
HTTP/2 200
date: Tue, 25 Aug 2026 15:21:20 GMT
content-type: text/html; charset=utf-8
alt-svc: h3=":443"; ma=86400
cache-control: s-maxage=31536000
nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
permissions-policy: camera=(), microphone=(), geolocation=(), payment=()
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=31536000; includeSubDomains
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-nextjs-cache: HIT
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
x-powered-by: Next.js
cf-cache-status: DYNAMIC
speculation-rules: "/cdn-cgi/speculation"
report-to: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=..."}]}
server: cloudflare
cf-ray: a30b95fb6a90423a-EWR
```

`/`, `/servicios/escoliosis-y-deformidades` y `/servicios/estenosis-espinal`
devuelven lo mismo salvo `cache-control`, `cf-ray` y la fecha. En ninguna aparece
`content-security-policy` ni `content-security-policy-report-only`.

El único `report-to` que sale hoy es el de Cloudflare, del sistema NEL (Network
Error Logging) que Cloudflare inyecta por su cuenta. No tiene relación con CSP y
no se toca. Vale anotarlo porque el nombre se parece lo suficiente como para
confundir a quien lea estas cabeceras dentro de un mes.

**3. Conclusión sobre los tres issues.** No existe ninguna CSP: ni en el repo, ni
en el origen, ni inyectada por Cloudflare. Con eso, el issue que Lighthouse
reportaba en las tres rutas solo puede ser **el aviso genérico de que no se
encontró ninguna CSP en modo enforce**. Es la auditoría de buenas prácticas
"Ensure CSP is effective against XSS", que aparece en toda página sin política.
No hay ninguna política parcial bloqueando chunks legítimos.

Que aparezca en esas tres rutas y no en las otras veinte es una cuestión de qué
rutas se auditaron, no de una diferencia entre ellas: la cabecera se sirve bajo
`/:path*` y es idéntica en todo el sitio.

> Lo que no se hizo: abrir devtools a mano en las tres rutas. La verificación se
> hizo por `grep` y por `curl` contra producción, que es lo que decide el asunto:
> si ninguna respuesta lleva una cabecera de política y ninguna plantilla emite
> un `meta`, no hay política que el navegador pueda estar aplicando.

---

## Inventario de orígenes, con su evidencia

Ninguna directiva de la política de abajo entra "por si acaso". Cada una sale de
una entrada de esta tabla, y cada entrada dice dónde se comprobó.

| Qué carga el sitio | Origen | Evidencia |
|---|---|---|
| GA4 | `https://www.googletagmanager.com` | `src/components/analytics/analytics-scripts.tsx`, `<GoogleAnalytics gaId>` de `@next/third-parties/google`. Solo se monta con consentimiento concedido. |
| Recolección de GA4 | `https://*.google-analytics.com`, `https://*.analytics.google.com` | El script de GTM envía los hits a `www.google-analytics.com` y, según región, a un subdominio regional del tipo `region1.analytics.google.com`. |
| Pixel de Meta | `https://connect.facebook.net` | Mismo archivo: `<Script id="meta-pixel">` inline que inyecta `https://connect.facebook.net/en_US/fbevents.js`. |
| Recolección de Meta | `https://www.facebook.com` | `fbevents.js` reporta contra `https://www.facebook.com/tr`, por imagen o por `fetch` según el navegador. |
| Portadas de los reels | `https://*.cdninstagram.com`, `https://*.fbcdn.net` | Declarados en `images.remotePatterns` de `next.config.ts`. Instagram las sirve con URLs firmadas que caducan. |
| Mapa de `/contacto` | `https://www.google.com` | `src/app/contacto/page.tsx:124`, un `<iframe>` con `src="https://www.google.com/maps?q=...&output=embed"`. |
| Scripts inline propios | mismo documento | Los `<script type="application/ld+json">` que emite `JsonLdScript` en `src/components/structured-data.tsx:73`, el bootstrap del pixel, y el payload de datos que Next inserta en cada página. Ninguno lleva nonce. |
| Estilos inline | mismo documento | Next inserta el CSS crítico inline en la respuesta, y el `<iframe>` del mapa lleva `style={{ border: 0 }}`. |
| Formularios | mismo origen | `src/components/contact-form.tsx:78` usa una Server Action, que hace POST a la propia URL. No hay ningún formulario apuntando a un tercero. |
| Fuentes | mismo origen | Poppins e Inter se cargan por `next/font/google` en `src/app/layout.tsx:2`, que las descarga en build y las sirve self-hosted. El HTML de producción no contiene ninguna referencia a `fonts.googleapis.com` ni a `fonts.gstatic.com`, comprobado sobre la respuesta servida. |

Dos correcciones a lo que se daba por supuesto antes de mirar:

- **Los mapas sí van embebidos.** El comentario de `Permissions-Policy` en
  `next.config.ts` dice que van como enlace externo. Es cierto en `/sedes` y en
  las fichas de sede, donde `locations.ts:78` arma un enlace de búsqueda, pero
  `/contacto` tiene un `<iframe>` de verdad. Por eso la política lleva
  `frame-src`; sin esa directiva, la report-only reportaría el mapa de `/contacto`
  en cada visita y el ruido enterraría cualquier señal real.
- **No hay origen externo de fuentes**, así que `font-src` se queda en `'self'`.

Tampoco hay `<video>` en ningún lado, así que no va `media-src`. No hay Web
Workers propios, así que no va `worker-src`.

---

## La política no usa nonce, y esto es lo que cuesta

La guía de CSP de esta versión de Next
(`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`) es
explícita en dos lugares: "you **must use dynamic rendering** to add nonces" y
"To use a nonce, your page must be **dynamically rendered**". El nonce se genera
por petición desde `proxy.ts`, y una página estática se genera en build, cuando
no existe ninguna petición donde inyectarlo.

Las 23 rutas del sitio se prerenderizan estáticas. La Cache Rule de Cloudflare de
la fase 18 se apoya en ese hecho. Pasar el sitio a dinámico para ganar un nonce
gastaría el rendimiento que la fase anterior acaba de comprar, y lo gastaría en
todas las rutas, no solo en las que cargan terceros.

Decisión: **sin nonce**. Consecuencia directa, y conviene que se lea entera:

> Sin nonce, `script-src` necesita `'unsafe-inline'`. Una política con
> `'unsafe-inline'` **no protege contra XSS inline**: si alguien consigue meter un
> `<script>` en el HTML del sitio, esta política lo deja correr. Lo que sí hace es
> impedir que se cargue código desde un origen que no esté en la lista, y acotar
> a dónde puede salir la información. Es una mejora real y parcial. Decir "el
> sitio tiene CSP" y dejarlo ahí sería engañoso.

Lo mismo aplica a `style-src`: Next sirve CSS crítico inline y el sitio usa
estilos en atributo, así que `'unsafe-inline'` también es necesario ahí. En
estilos el riesgo es bastante menor que en scripts, pero se anota igual.

Si en algún momento se quiere la protección contra XSS inline, el camino no es
apretar esta política: es hacer que las páginas que cargan terceros se rendericen
dinámicas y usar nonce solo en ellas. Eso es un rediseño de la estrategia de
renderizado, no un ajuste de cabeceras, y no es de esta fase.

---

## La política, directiva por directiva

Servida como `Content-Security-Policy-Report-Only` bajo `source: "/:path*"` en
`next.config.ts`, junto a las cinco cabeceras de seguridad que ya estaban.

| Directiva | Valor | De dónde sale |
|---|---|---|
| `default-src` | `'self'` | Base restrictiva. Todo lo que no tenga directiva propia cae acá. |
| `script-src` | `'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net` | GA4 y el pixel de Meta del inventario. `'unsafe-inline'` por la decisión de no usar nonce. |
| `style-src` | `'self' 'unsafe-inline'` | CSS crítico inline de Next y estilos en atributo. Sin origen externo de estilos. |
| `img-src` | `'self' data: blob: https://*.cdninstagram.com https://*.fbcdn.net https://www.googletagmanager.com https://www.facebook.com` | Portadas de los reels; `data:` y `blob:` por los placeholders del optimizador de imágenes de Next; los dos últimos por los beacons por imagen de GA4 y del pixel. |
| `font-src` | `'self'` | Poppins e Inter self-hosted. No hay origen externo. |
| `connect-src` | `'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://www.facebook.com` | Recolección de GA4, incluido el subdominio regional, y de Meta. `'self'` cubre las Server Actions y `/api/csp-report`. |
| `frame-src` | `https://www.google.com` | El `<iframe>` del mapa de `/contacto`. |
| `frame-ancestors` | `'self'` | Coherente con el `X-Frame-Options: SAMEORIGIN` que ya se sirve. Dos cabeceras que dijeran cosas distintas sobre lo mismo es una contradicción que alguien resolvería mal más adelante. |
| `base-uri` | `'self'` | Impide que una inyección de `<base>` redirija las URLs relativas de la página a otro origen. |
| `form-action` | `'self'` | El único formulario del sitio es una Server Action contra la propia URL. |
| `object-src` | `'none'` | El sitio no usa `<object>`, `<embed>` ni plugins. |
| `report-uri` | `/api/csp-report` | Mecanismo antiguo, el que todavía entienden los navegadores sin Reporting API. |
| `report-to` | `csp-endpoint` | Mecanismo moderno. El nombre tiene que coincidir con el de la cabecera `Reporting-Endpoints`. |

Las dos formas de reporte se declaran a propósito. Una sola deja huecos de
cobertura justo en la etapa donde la cobertura es todo el objetivo.

No lleva `upgrade-insecure-requests`: el sitio ya se sirve entero por HTTPS con
HSTS y `includeSubDomains`, y no hay ninguna referencia a `http://` en el árbol
que la directiva tuviera que reescribir.

---

## El endpoint de reportes

`src/app/api/csp-report/route.ts`. Recibe los dos formatos que mandan los
navegadores: el cuerpo `application/csp-report` del mecanismo antiguo y el
`application/reports+json` del `Reporting-Endpoints`.

Es público y sin autenticación, porque el navegador que reporta no puede
autenticarse. Eso obliga a tres cuidados, que están en el código:

- **Tope de tamaño del cuerpo.** Lo que pase de ahí se descarta sin leerlo entero.
  Sin tope, cualquiera puede llenar los logs.
- **Siempre 204, sin cuerpo.** También ante un JSON inválido. Una respuesta
  distinta según el cuerpo convertiría al endpoint en un oráculo de sondeo.
- **Nada se persiste en disco.** Los reportes salen por `console.warn` con el
  prefijo `csp-report`, que es estable y se puede filtrar o silenciar desde los
  logs sin desplegar.

`GET` devuelve 405: la ruta no es navegable y conviene que lo diga.

---

## Cómo comprobar que la cabecera llegó, después del deploy

Que la cabecera salga del origen no garantiza que llegue al navegador.
Cloudflare está delante y puede filtrar o reescribir cabeceras de respuesta. Esto
se comprueba, no se supone.

```
curl -sI https://drangulocolumna.com/ | grep -i content-security
curl -sI https://drangulocolumna.com/agendar | grep -i content-security
curl -sI https://drangulocolumna.com/servicios/escoliosis-y-deformidades | grep -i content-security
curl -sI https://drangulocolumna.com/servicios/estenosis-espinal | grep -i content-security
```

Las cuatro tienen que devolver una línea `content-security-policy-report-only`.
Se corre contra la portada y contra las tres rutas que la auditoría del
2026-08-23 señaló, que son las mismas donde Lighthouse reportaba la ausencia de
política.

Y hay una segunda comprobación que es fácil saltarse y no conviene: **el valor
que llega tiene que ser idéntico al que declara `next.config.ts`**, no una
versión recortada. Un proxy que trunca la cabecera deja una política más
permisiva de lo escrito, y desde afuera se ve igual de correcta.

```
# Compara lo servido contra lo declarado, sin leer las dos a ojo
diff <(curl -sI https://drangulocolumna.com/ | tr -d '\r' \
        | grep -i '^content-security-policy-report-only:' \
        | sed 's/^[^:]*: //') \
     <(node -e "process.stdout.write(require('fs').readFileSync('next.config.ts','utf8').match(/const CSP_REPORT_ONLY = \[([\s\S]*?)\]\.join/)[1].split('\n').map(l=>l.trim().replace(/^\"|\",?$/g,'')).filter(Boolean).join('; ')+'\n')")
```

Sin salida, coinciden. Si no llega o llega distinta, el lugar donde mirar es
**Cloudflare → el zone del sitio → Rules → Transform Rules → Modify Response
Header**, y también Managed Transforms, que actúa sin aparecer en la lista de
reglas. Eso lo revisa Juan en el panel.

También conviene mirar los logs del origen unos minutos después del deploy,
filtrando por el prefijo:

```
# En los logs de la aplicación
grep csp-report
```

Ver reportes entrando es la prueba de que el circuito está entero: política
servida, endpoint alcanzable, nombre del grupo coincidiendo. **No ver ninguno en
las primeras horas no significa que todo esté bien**: puede significar que la
cabecera nunca llegó. Por eso el `curl` va primero.

---

## Procedimiento para pasar a enforce

Recordar de qué se trata el cambio: hoy el navegador evalúa y avisa; después del
cambio, bloquea. Un bloqueo mal calibrado rompe producción en silencio, porque el
visitante no ve un error, ve una página a la que le falta algo.

### Paso 1. Observar, mínimo 14 días corridos

La ventana empieza el día en que el `curl` de arriba confirmó que la cabecera
llega desde producción, no el día del deploy. Catorce días corridos cubren dos
fines de semana completos, que es cuando el tráfico del sitio cambia de forma.
Este paso no se puede acortar: necesita tráfico real, y no hay manera de
fabricarlo.

Durante la ventana, revisar los reportes cada pocos días, no solo al final. Un
error de configuración detectado el día 2 cuesta un deploy; detectado el día 14,
cuesta la ventana entera.

### Paso 2. Clasificar cada violación reportada

Cada reporte cae en uno de tres cajones, y lo que se hace con él depende del
cajón. Clasificar mal acá es el modo de fallar de todo el procedimiento.

**a) Origen legítimo que falta en la política.** Un dominio que el sitio carga de
verdad y que el inventario no previó: un subdominio regional de recolección de
GA4 que no coincide con el comodín, un CDN que Instagram empieza a usar, un
script que se agregó al sitio después de escribir esta política. Se reconoce
porque el `document` del reporte es una ruta del sitio y el `blocked` es un
dominio que se puede rastrear hasta algo que el sitio hace a propósito.
→ **Se agrega el origen a la directiva que corresponde, en `next.config.ts`, y se
reinicia la ventana de observación.** Reiniciarla no es una formalidad: la
política cambió, y lo que se estaba midiendo ya no es lo que se va a desplegar.

**b) Extensión del navegador del visitante.** Los reportes de extensiones son los
más numerosos y los más inofensivos. Se reconocen por el esquema del recurso
bloqueado: `chrome-extension://`, `moz-extension://`, `safari-web-extension://`,
o por inyecciones de antivirus y de traductores que aparecen en un puñado de
visitantes y en ninguna otra parte.
→ **Se ignoran.** No se agregan a la política. Una política que acomoda las
extensiones de los visitantes deja de proteger cualquier cosa, y además nunca
termina: siempre hay una extensión más.

**c) Inyección real.** Un origen que nadie puede explicar, cargando en rutas del
sitio, con un patrón que no coincide con ninguna extensión conocida. Es el caso
que justifica todo este trabajo y el que hay que poder reconocer.
→ **No se sigue con el procedimiento.** Se investiga de dónde salió antes de
tocar la política. Poner el origen en la lista para que el reporte deje de
aparecer sería exactamente lo contrario de lo que hay que hacer.

### Paso 3. Criterio de salida

El enforce se hace cuando se cumple esto, y no antes:

> Cero violaciones del cajón (a) durante una ventana completa de 14 días corridos
> con tráfico real, contados desde el último cambio a la política. Los reportes
> del cajón (b) pueden seguir llegando y no bloquean el cambio. Un solo reporte
> del cajón (c) sin explicar detiene el procedimiento.

Es una condición comprobable, no una impresión. "Ya no vemos casi nada" no
cumple. Si la ventana tuvo poco tráfico —vacaciones, una caída, un mes flojo—, la
ventana no está completa y se corre la fecha. Es preferible una revisión postergada
a un enforce hecho sobre datos que no alcanzan.

### Paso 4. El cambio en sí

1. En `next.config.ts`, cambiar la clave `Content-Security-Policy-Report-Only`
   por `Content-Security-Policy`. El valor no cambia.
2. **Conservar `report-uri` y `report-to`.** Una política en enforce sin reportes
   deja ciego justo después del momento en que empezar a ver importa más: a
   partir de ahí, cada violación es algo que se rompió para un visitante real.
3. Actualizar el comentario de `headers()` y este documento en el mismo commit.
   Un comentario que describe un plan ya ejecutado es peor que ningún comentario.
4. Desplegar y repetir el `curl` de la sección anterior contra las cuatro URLs,
   confirmando que ahora llega `content-security-policy` sin el sufijo.
5. Recorrer a mano `/contacto` con el mapa cargando, `/agendar` con el formulario,
   y una página con reels, aceptando el banner de cookies para que GA4 y el pixel
   se monten de verdad. Con la consola abierta. Estas son las tres superficies
   donde la política toca algo que puede romperse.

Si algo se rompe, el revert es volver la clave a `Content-Security-Policy-Report-Only`.
Vale la pena tenerlo presente antes de empezar: es un cambio de una palabra en las
dos direcciones.

---

## Fecha y alcance

**Revisión de enforce: 2026-09-15.** Tres semanas después de esta fase, que da
margen de sobra para los 14 días de la ventana más los días que tarde el deploy en
salir y en confirmarse.

De qué depende que esa fecha se mueva: de si la ventana se llenó. Si en el
2026-09-15 no hubo tráfico suficiente, o la política cambió a mitad de camino por
un reporte del cajón (a), o la cabecera tardó en llegar a producción, **se corre
la revisión**. No se hace un enforce a medias sobre una ventana incompleta. La
fecha existe para que alguien vuelva a mirar, no para forzar el cambio ese día.

**El enforce no es alcance de la fase 19.** Es una tarea de seguimiento con esta
fecha y con el criterio de salida escrito arriba.

**Issue #17.** Se cierra con la report-only desplegada y este procedimiento
documentado, que es lo que el issue pedía. El enforce queda como tarea aparte, no
como parte pendiente de #17.
