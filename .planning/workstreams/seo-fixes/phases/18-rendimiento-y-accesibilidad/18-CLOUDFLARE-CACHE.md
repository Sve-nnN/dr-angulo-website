# CWV-01 — Caché de borde: diagnóstico y regla para aplicar

**Fase:** 18 — Rendimiento y accesibilidad
**Plan:** 18-02, tarea 1
**Medido:** 2026-08-24 contra producción (`https://drangulocolumna.com`)
**Estado:** diagnóstico cerrado. La regla está escrita y **no está aplicada**: la aplica Juan en el panel.

---

## 1. El resultado corto

El origen hace todo bien. Cloudflare no cachea el HTML.

Las tres rutas medidas devuelven `cf-cache-status: DYNAMIC` en la primera y en la
segunda petición, con `cache-control` correcto y `x-nextjs-cache: HIT`. Es decir:
Next ya tiene la página prerenderizada y lista, le dice al borde por cuánto tiempo
puede guardarla, y el borde no la guarda. Cada paciente que entra paga el viaje
completo hasta el servidor de Hetzner antes de ver un píxel.

La corrección no toca una línea de código del sitio. Es una regla en el panel.

---

## 2. Mediciones tomadas

### 2.1 Cabeceras, dos peticiones seguidas por ruta

| Ruta | `cf-cache-status` 1ª | `cf-cache-status` 2ª | `cache-control` | `age` | `set-cookie` | `vary` | `x-nextjs-cache` |
|---|---|---|---|---|---|---|---|
| `/` | DYNAMIC | DYNAMIC | `s-maxage=3600, stale-while-revalidate=31532400` | ausente | **ninguna** | `rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding` | HIT |
| `/sedes` | DYNAMIC | DYNAMIC | `s-maxage=31536000` | ausente | **ninguna** | igual | HIT |
| `/testimonios` | DYNAMIC | DYNAMIC | `s-maxage=3600, stale-while-revalidate=31532400` | ausente | **ninguna** | igual | HIT |

Los `cf-ray` de las dos corridas caen en centros distintos (SCL, MIA, EZE), lo que
descarta que el `DYNAMIC` sea un artefacto de un solo nodo.

### 2.2 TTFB, mediana de tres corridas

Medido como `time_starttransfer` menos `time_connect`, que aísla el primer byte
del costo de abrir la conexión.

| Ruta | Corrida 1 | Corrida 2 | Corrida 3 | **Mediana** |
|---|---|---|---|---|
| `/` | 757 ms | 775 ms | 1.510 ms | **775 ms** |
| `/sedes` | 788 ms | 772 ms | 821 ms | **788 ms** |
| `/testimonios` | 818 ms | 801 ms | 814 ms | **814 ms** |
| `/sobre-el-doctor` | 813 ms | 801 ms | 834 ms | **813 ms** |

**Advertencia de método, que hay que leer antes de comparar contra los 630 ms de
la auditoría.** Estos números salen de una máquina en Sudamérica y el TTFB
absoluto depende de dónde esté el que mide. La auditoría del 2026-08-23 registró
630 ms para la portada desde el entorno de Unlighthouse. Los dos números no son
comparables entre sí de forma directa. **Lo que sí es comparable es la medición de
antes contra la de después tomadas con el mismo protocolo y desde el mismo lugar**,
que es exactamente lo que hace la tarea 3 de este plan. La tabla de arriba es esa
línea base.

### 2.3 El número que sí prueba la tesis: el piso del borde

Esta es la medición que cierra el diagnóstico, porque separa lo que cuesta la red
de lo que cuesta ir hasta el origen.

| Recurso | Estado en el borde | TTFB mediano | Qué mide |
|---|---|---|---|
| `/_next/static/chunks/2yk75xw433_3t.js` | `cf-cache-status: HIT` | **322 ms** | Ida y vuelta hasta el borde de Cloudflare, sin tocar el origen |
| `/robots.txt` | `cf-cache-status: EXPIRED` | **576 ms** | Borde más origen, con generación mínima |
| `/` (HTML) | `cf-cache-status: DYNAMIC` | **775 ms** | Borde más origen, con la portada entera |

Leído en orden: un recurso que el borde ya tiene responde en 322 ms. El mismo
viaje, pero yendo hasta Hetzner, cuesta entre 254 ms y 453 ms más. **Esos 453 ms
son lo que este plan elimina de la portada.** No hay que optimizar nada del sitio
para recuperarlos: hay que dejar que el borde guarde el HTML que Next ya declaró
cacheable.

El `EXPIRED` de `/robots.txt` es dato aparte y vale la pena: **Cloudflare sí
cachea ese archivo.** No es que el borde no cachee nada del sitio. Cachea
`text/plain` y cachea los assets estáticos. Lo único que no cachea es `text/html`.

### 2.4 Canonicalización de host, antes de aplicar la regla

| Petición | Código | `location` |
|---|---|---|
| `curl -sI https://www.drangulocolumna.com/` | **301** | `https://drangulocolumna.com/` |
| `curl -sI https://www.drangulocolumna.com/sedes` | **301** | `https://drangulocolumna.com/sedes` |

Este es el estado que la regla no puede romper. Queda registrado acá para poder
compararlo después.

### 2.5 Rutas de API

| Ruta | Código | `cf-cache-status` | `set-cookie` |
|---|---|---|---|
| `/api/reviews/status` | 401 | DYNAMIC | ninguna |
| `/api/instagram/refresh` | 401 | DYNAMIC | ninguna |

Las dos están protegidas y ninguna emite cookie. Igual quedan excluidas de la
regla de forma explícita: que hoy no haya nada que filtrar no es motivo para
dejarlas dentro del alcance de una regla de caché.

---

## 3. Veredicto de los cuatro sospechosos

### Sospechoso 1 — El header `Vary` de Next

**Contribuye, pero no es la causa raíz. Y no se toca.**

El origen emite `vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding`.
Cloudflare no soporta caché por `Vary` sobre cabeceras arbitrarias: fuera de
`Accept-Encoding`, simplemente las ignora. Así que el `Vary` no es lo que produce
el `DYNAMIC`. Lo que sí hace es volver peligroso cachear a ciegas, porque el borde
ignoraría una señal real de que la respuesta varía.

La solución no es editar la cabecera. Es el mecanismo que la propia documentación
de Next 16 describe para este caso: el parámetro de búsqueda `_rsc`, que es un
hash de las cabeceras que hacen variar la respuesta y existe precisamente para que
un CDN que ignora `Vary` devuelva igual la variante correcta
(`node_modules/next/dist/docs/01-app/02-guides/cdn-caching.md`). La regla conserva
`_rsc` en la clave de caché, y además esquiva por completo las peticiones RSC.

### Sospechoso 2 — Una regla que excluye `text/html`

**Es la causa raíz, con un matiz importante: no hay una regla que lo excluya. Es
el comportamiento por defecto de Cloudflare.**

Cloudflare cachea por defecto según la extensión del archivo, y el HTML no está en
esa lista. Por eso `/robots.txt` sale `EXPIRED` (cacheado y revalidado) mientras
las tres rutas de HTML salen `DYNAMIC`. No hay nada que quitar del panel: hay que
agregar una regla que declare el HTML como cacheable.

Evidencia que lo confirma de manera limpia: el origen manda `s-maxage=3600` en la
portada y `s-maxage=31536000` en `/sedes`, y el borde responde `DYNAMIC` en las
dos. Un borde que estuviera respetando el `Cache-Control` habría devuelto `MISS` y
después `HIT`. **El problema está en el borde y no en el origen. Diagnóstico
cerrado.**

### Sospechoso 3 — Cookies en la respuesta

**Descartado.** Ninguna de las tres rutas de HTML emite `set-cookie`, ni tampoco
las dos rutas de API. El aviso de cookies del sitio se resuelve en el cliente con
almacenamiento del navegador, no con una cookie puesta por el servidor.

Esto es lo que vuelve seguro cachear el HTML: no hay estado por visitante en la
respuesta que se pueda servir al visitante siguiente.

### Sospechoso 4 — `src/proxy.ts`, el middleware

**Corre en cada petición, pero no es el que cuesta el TTFB. Sí impone una
restricción sobre la regla.**

Su `matcher` es `/((?!_next/static|_next/image).*)`, así que se ejecuta en todo el
HTML, en `robots.txt`, en `sitemap.xml` y en las dos rutas de API. Lo que hace es
leer la cabecera `Host`, pasarla a minúsculas y, si empieza con `www.`, emitir un
301 hacia el apex. Es trabajo de cadenas, sin red y sin lectura de disco.

La cota superior de su costo sale de la medición 2.3: `/robots.txt` recorre el
middleware entero y vuelve en 576 ms, de los cuales 322 ms son la ida y vuelta
hasta el borde. Los 254 ms restantes contienen el salto hasta Hetzner **más** el
middleware **más** la generación del archivo. El middleware es una fracción
pequeña de esos 254 ms, y en cualquier caso desaparece del camino cuando el borde
sirve desde caché: una respuesta cacheada nunca llega al origen y por lo tanto
nunca ejecuta el middleware.

La restricción que sí impone: **el host tiene que quedarse en la clave de caché.**
Ver la invariante 5.

---

## 4. Las seis invariantes, como advertencias

Léelas antes de guardar la regla. Cada una describe algo que se rompe en silencio,
sin que ninguna de las cinco compuertas del proyecto lo note.

**1. El header `Vary` no se edita ni se reescribe en el origen.**
Es la cabecera con la que el router de Next le dice al mundo que la respuesta
cambia según lo que pida el cliente. Tocarla puede romper la navegación del sitio.
La regla actúa sobre el comportamiento de caché de Cloudflare, nunca sobre la
cabecera que emite Next.

**2. El parámetro `_rsc` se conserva en la clave de caché.**
Next lo agrega como hash de las cabeceras que hacen variar la respuesta. Es lo que
mantiene separada la variante HTML de la variante RSC cuando el CDN ignora `Vary`.
Cloudflare, en algunas configuraciones, quita parámetros de la clave de caché. Si
lo quita, el borde termina sirviendo HTML donde el cliente pidió RSC. En el panel
esto es **Cache Key -> Query String -> All query string parameters**.

**3. La cabecera `rsc` se reenvía al origen sin tocar.**
Si el borde la elimina, el servidor devuelve HTML cuando el router espera carga
RSC, y la navegación del cliente degrada a recargas completas del navegador. La
regla de la sección 5.1 va más lejos que solo preservarla: manda esas peticiones
derecho al origen, sin pasar por caché.

**4. Las dos rutas dinámicas quedan fuera.**
`/api/instagram/refresh` y `/api/reviews/status` son las dos rutas dinámicas del
build. La expresión de filtro las excluye de forma explícita. Hoy devuelven 401 y
no emiten cookie, pero una regla de caché sobre una ruta de API es la vía más
corta a servirle a un visitante la respuesta de otro.

**5. El host se queda en la clave de caché.**
Es la más fácil de perder y la más silenciosa cuando se pierde. `src/proxy.ts`
deriva el apex de la cabecera `Host` cruda para emitir el 301, y la Redirect Rule
de Cloudflare hace lo mismo en el borde. Si la Cache Rule normaliza el host fuera
de la clave, el borde le sirve el HTML cacheado del apex a una petición que llegó
por `www`: esa petición devuelve 200 con contenido en vez de 301, la
canonicalización de host muere sin hacer ruido y el sitio vuelve a tener dos hosts
indexables sirviendo lo mismo. En el panel: **Cache Key -> Host -> Use original
host header**. No se activa "Resolved host".

**6. `/_next/image` necesita la cabecera `Accept` en la clave de caché, o queda
fuera.**
Esta invariante se agregó el 2026-08-24, después de que el perfilado del plan
18-04 midiera lo que el optimizador de imágenes de Next devuelve de verdad. Es
una corrección sobre la primera redacción de este archivo, no un detalle: la
regla de la sección 5.2, tal como estaba escrita, cachea también `/_next/image`,
y ahí produce un defecto real.

La evidencia, medida sobre
`/_next/image?url=%2Fdr-angulo-implante-disco.avif&w=640&q=75`:

| Cabecera `Accept` de la petición | Lo que devuelve | Peso |
|---|---|---|
| La de un navegador (`image/avif,image/webp,...`) | `image/webp` | 32.980 B |
| Ninguna, o `*/*` (curl, rastreadores, algunos bots) | `image/jpeg` | 48.250 B |

La respuesta trae `vary: Accept`, que es exactamente la señal de que varía. Y
Cloudflare ignora `Vary` sobre cabeceras arbitrarias, que es la misma razón por
la que el HTML se puede cachear con la invariante 2.

Acá esa misma propiedad se vuelve en contra. Si el borde cachea la primera
respuesta que le toque y la sirve a todos: cuando la primera sea la de un
rastreador sin `Accept`, **todos los pacientes reciben el JPEG de 48.250 bytes en
lugar del WebP de 32.980**, y se pierde el 32% del peso de cada imagen del sitio
sin que nada lo reporte. En el otro sentido es peor: un AVIF cacheado servido a
un navegador que no lo soporta es una imagen rota.

Dos formas de resolverlo, en orden de preferencia:

- **Preferida: agregar `Accept` a la clave de caché.** En la regla 5.2, dentro de
  **Cache Key**, sección **Headers**, agregar `Accept` a **Include headers**. Con
  eso cada formato tiene su propia entrada y las imágenes se cachean en el borde
  sin riesgo. Este control no está en todos los planes de Cloudflare.
- **Si ese control no aparece en el panel: excluir `/_next/image` del cacheado**,
  agregándolo a la expresión de la regla 5.1. Las imágenes siguen yendo al origen
  como hoy, que es el comportamiento actual y no una regresión, y el HTML igual
  se cachea, que es de donde salen los 453 ms. Es la opción segura.

Lo que no se hace es cachear `/_next/image` sin una de las dos cosas.

---

## 5. La regla, paso a paso

Son **dos** reglas, no una, y el orden entre ellas importa. La primera saca del
camino todo lo que no se puede cachear; la segunda cachea el resto. Cloudflare
aplica la primera regla que coincide y se detiene ahí, así que si el orden se
invierte, la segunda se traga las peticiones que la primera tenía que proteger.

Ruta en el panel: **Cloudflare Dashboard -> drangulocolumna.com -> Caching ->
Cache Rules -> Create rule**.

### 5.1 Regla 1 de 2 — "Bypass: API y peticiones RSC"

Esta va **primera** en el orden.

1. En **Rule name**, escribir: `Bypass: API y peticiones RSC`
2. En **When incoming requests match**, elegir **Custom filter expression** y
   pegar en el editor de expresiones:

   ```
   (starts_with(http.request.uri.path, "/api/")) or (len(http.request.headers["rsc"]) > 0)
   ```

3. En **Then**, bajo **Cache eligibility**, marcar **Bypass cache**.
4. Guardar con **Deploy**.

Por qué cada parte:

| Parte | Por qué |
|---|---|
| `starts_with(..., "/api/")` | Invariante 4. Cubre las dos rutas dinámicas del build y cualquier ruta de API futura, sin tener que volver a tocar la regla. |
| `len(http.request.headers["rsc"]) > 0` | Invariante 3, resuelta de la forma más fuerte posible. Toda petición que traiga la cabecera `rsc` va derecho al origen y vuelve con carga RSC, nunca con HTML. Esas peticiones son navegación interna y prefetch: no son la primera pintura de la página, así que no cachearlas no cuesta nada del número que este plan persigue. |
| **Bypass cache** | Ni guarda ni sirve desde caché. Es lo que hace que las dos condiciones de arriba sean garantías y no esperanzas. |

### 5.2 Regla 2 de 2 — "Cachear HTML en el borde"

Esta va **segunda**, después de la anterior.

1. En **Rule name**, escribir: `Cachear HTML en el borde`
2. En **When incoming requests match**, elegir **Custom filter expression** y
   pegar:

   ```
   (http.host eq "drangulocolumna.com")
   ```

3. En **Then**, bajo **Cache eligibility**, marcar **Eligible for cache**.
4. Abrir **Edge TTL** y elegir **Use cache-control header if present, bypass cache if not**.
5. Abrir **Browser TTL** y elegir **Respect origin TTL**.
6. Abrir **Cache Key** y configurar cuatro cosas:
   - **Query String:** **All query string parameters** (invariante 2, el `_rsc`)
   - **Host:** **Use original host header** (invariante 5)
   - **Headers -> Include headers:** agregar `Accept` (invariante 6, el formato de
     imagen). Si el panel no ofrece este control en el plan contratado, **no
     guardes así**: volvé al punto 5.1 y agregá `/_next/image` a la expresión de
     bypass, como dice la invariante 6.
   - **Cache Deception Armor:** activado
7. Guardar con **Deploy**.
8. Confirmar que en la lista de Cache Rules la regla del punto 5.1 aparece
   **arriba** de esta. Si no, arrastrarla y volver a guardar.

Si tomaste el camino de excluir `/_next/image`, la expresión del punto 5.1 queda:

```
(starts_with(http.request.uri.path, "/api/")) or (starts_with(http.request.uri.path, "/_next/image")) or (len(http.request.headers["rsc"]) > 0)
```

Las cuatro partes que el plan exige nombrar:

| Parte | Valor | Por qué |
|---|---|---|
| **Expresión de filtro** | `http.host eq "drangulocolumna.com"` | Solo el apex. Una petición por `www` no entra a esta regla, así que la Redirect Rule y el 301 de respaldo siguen siendo lo primero que la ve. Todo lo que no se puede cachear ya quedó atrapado por la regla 1. |
| **Acción** | Eligible for cache | Declara el HTML como cacheable. Es lo único que falta hoy: Cloudflare no lo hace por defecto porque `text/html` no está en su lista de extensiones cacheables. |
| **Ajuste de clave de caché** | Query String: todos los parámetros. Host: cabecera original. Headers: incluir `Accept`. Cache Deception Armor: activo. | Los tres primeros son las invariantes 2, 5 y 6. El armor evita que una URL disfrazada de asset estático (`/pagina.jpg`) haga que el borde guarde HTML bajo una clave que no le corresponde. |
| **TTL de borde** | Use cache-control header if present, bypass cache if not | Respeta lo que Next ya declara: 3.600 s en la portada y en `/testimonios` por su `revalidate = 3600`, y un año en las rutas estáticas. No inventa un TTL propio. Y si alguna respuesta llegara sin `Cache-Control`, no la cachea, que es el lado seguro del error. |

---

## 6. Qué comprobar apenas quede guardada

Cuatro comandos. Si alguno no da lo que dice la columna de la derecha, avisar
antes de seguir: la tarea 3 de este plan hace la medición completa, pero estos
cuatro detectan de inmediato una regla mal configurada.

| Comando | Tiene que devolver |
|---|---|
| `curl -sI https://drangulocolumna.com/ \| grep cf-cache-status` (dos veces seguidas) | La segunda vez, `HIT` |
| `curl -sI https://www.drangulocolumna.com/ \| grep -i location` | `https://drangulocolumna.com/` con código 301 |
| `curl -s -D - -o /dev/null -H 'rsc: 1' https://drangulocolumna.com/sedes \| grep -i content-type` | `text/x-component`, nunca `text/html` |
| `curl -sI https://drangulocolumna.com/api/reviews/status \| grep cf-cache-status` | `DYNAMIC` o `BYPASS`, nunca `HIT` |
| `curl -s -o /dev/null -w '%{content_type}\n' -H 'Accept: image/avif,image/webp,image/*,*/*;q=0.8' 'https://drangulocolumna.com/_next/image?url=%2Fdr-angulo-implante-disco.avif&w=640&q=75'` | `image/webp`. Si devuelve `image/jpeg`, el borde cacheó la variante de un cliente sin `Accept` y la invariante 6 quedó violada |

---

## 7. Nota para el futuro, para que nadie la descubra tarde

La documentación de Next 16 lo dice con todas las letras: **cachear en un CDN no
propaga la revalidación bajo demanda.** Si algún día el sitio llama a
`revalidateTag()` o a `revalidatePath()`, esa llamada invalida la caché del
servidor de Next, pero Cloudflare va a seguir sirviendo su copia hasta que se
cumpla el `s-maxage`. El patrón correcto en ese caso es purgar el borde en la
misma operación, para las dos variantes, HTML y RSC.

Hoy no aplica: el sitio revalida por tiempo, con `revalidate = 3600` en la portada
y en `/testimonios`. Queda escrito acá para el día en que deje de ser así.

---

## 8. Lo que este plan no hizo, a propósito

La regla **no está aplicada**. Ni por panel ni por API. El panel de Cloudflare está
fuera del repositorio, la aplica Juan, y este archivo existe para que pueda
hacerlo leyendo y sin interpretar nada.

Tampoco se tocó una línea de código de producto. `git diff` de esta tarea no
incluye ningún archivo bajo `src/` ni `next.config.ts`.

Si Juan prefiere que la regla se aplique por API en vez de a mano, lo dice y se
hace, pero eso es una decisión suya y no un atajo que el ejecutor pueda tomar por
su cuenta.
