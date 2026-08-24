# CWV-03 — LCP de `/sobre-el-doctor`: qué sirve producción

**Fase:** 18 — Rendimiento y accesibilidad
**Plan:** 18-04, tareas 1 y 3
**Medido:** 2026-08-24 contra producción (`https://drangulocolumna.com/sobre-el-doctor`)
**Estado:** parcial. Las mediciones 2, 4, 5 y 6 están cerradas; la 1 y la 3 necesitan navegador. Ver la sección 9.

---

## 1. Línea base viva

> **Pendiente.** Tres corridas de Lighthouse móvil en la misma sesión. Esta sesión
> no tiene Lighthouse ni navegador manejable, y instalarlo sería una instalación
> de paquete fuera de la única compuerta de instalación de la fase, la del plan
> 18-05. Ver la sección 9.

| Corrida | Hora | Performance | LCP | Elemento LCP | CLS |
|---|---|---|---|---|---|
| 1 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| 2 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| 3 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| **Mediana** | | | | | |

### Datos históricos, rotulados y NO usados como umbral

| Fecha | Performance | LCP | TBT |
|---|---|---|---|
| 2026-08-23 | 0,91 | 2,64 s | 0 ms |
| 2026-08-24 | **0,96** | **2,73 s** | 0 ms |

La ruta se movió 0,09 s de LCP y subió cinco centésimas de puntaje **sin que nadie
la tocara** entre las dos fechas. Un criterio de "menor a 2,64 s" arranca fallando
contra la realidad de hoy. Por eso los dos números quedan como contexto de
varianza y el umbral es la línea base viva.

---

## 2. Medición 1 — Qué elemento es el LCP

> **Pendiente.** Es Lighthouse quien lo identifica y hace falta un navegador.

Lo que sí se puede acotar por lectura del marcado: sobre el pliegue de `/sobre-el-doctor`
hay dos candidatos, la imagen del doctor (220 px de ancho bajo 640 px de viewport,
260 px desde ahí, con relación de aspecto 933×1400) y el `<h1>` "Sobre el doctor".
A 375 px de viewport el layout es `flex-col`, así que la imagen va primero y
centrada, y a 220×330 CSS px cubre 72.600 px², más que cualquier bloque de texto
sobre el pliegue. **La imagen es el candidato con diferencia, pero se confirma con
Lighthouse, no se hereda de la auditoría.**

---

## 3. Medición 2 — El enlace de precarga sobrevive a Cloudflare

**Sí. Confirmado sobre el HTML servido por producción.**

El `<head>` trae dos `<link rel="preload" as="image">`, exactamente los dos
esperados:

| # | Imagen | `imageSizes` |
|---|---|---|
| 1 | `logo-icon-square.avif` (logo del encabezado) | — (dos densidades, 1x y 2x) |
| 2 | **`dr-angulo-implante-disco.avif`** | `(min-width: 640px) 260px, 220px` |

El segundo trae el `imageSrcSet` completo, con las quince variantes de 32w a
3840w. `imageSrcSet` aparece 2 veces en el documento, que es el valor que el plan
declara como línea base.

Cloudflare no lo filtra ni lo reescribe. La advertencia de `next.config.ts` sobre
que lo que sale del origen no es lo que llega al navegador queda comprobada acá en
el sentido bueno: llega.

**El documento no emite ningún `fetchpriority`.** Cero apariciones. La prioridad de
la petición la fija el navegador a partir del preload, que es justamente lo que
mide la sección 4.

---

## 4. Medición 3 — Prioridad de red

> **Pendiente.** Es el panel de red del navegador el que la muestra, y es el número
> que decide entre el camino A y el camino B de la tarea 2.

Contexto medido que ayuda a leerla cuando se tome: el documento no emite
`fetchpriority`, así que lo único que eleva la prioridad hoy es el
`<link rel="preload" as="image">` de la sección 3.

---

## 5. Medición 4 — Qué variante se descarga en móvil

`sizes` declara `(min-width: 640px) 260px, 220px`, que coincide con lo que dibuja
el `className` (`w-[220px]` y `sm:w-[260px]`). A 375 px de viewport con DPR 2, el
espacio pedido es 220 × 2 = **440 px de dispositivo**, y el navegador toma el
primer candidato del `srcset` que iguale o supere ese ancho.

El `srcset` no tiene ningún candidato entre 384w y 640w, así que la elección es
**640w**.

Pesos medidos, en los dos formatos que producción devuelve:

| Ancho | WebP (navegador real) | JPEG (cliente sin `Accept`) |
|---|---|---|
| 256w | 10.454 B | 12.771 B |
| 384w | 17.560 B | 23.195 B |
| **640w** | **32.980 B** | 48.250 B |
| 750w | 40.148 B | 60.210 B |
| 3840w | 52.834 B | 80.524 B |

Archivo original en disco: `dr-angulo-implante-disco.avif`, 55.975 B a 933×1400.

**Sobre-dimensionado medido:** el navegador baja 640 px de ancho para pintar 440.
Son 1,45× el ancho y 2,1× los píxeles. Un candidato de ~448w pesaría alrededor de
22 KB en WebP, interpolando entre los 17.560 B de 384w y los 32.980 B de 640w: el
sobrecosto está en el orden de los 11 KB. **Cerrarlo exigiría agregar un ancho a
`deviceSizes` o `imageSizes` en `next.config.ts`, que es un archivo del plan 18-05
y una configuración global de imágenes del sitio entero.** Queda anotado como
hallazgo, fuera del alcance de este plan.

Matiz importante antes de perseguirlo: Lighthouse móvil emula un dispositivo con
DPR 2,625, no 2. A ese DPR el ancho pedido es 220 × 2,625 = 578 px, y 640w es el
candidato correcto y bien ajustado. **Es decir: en la medición de la propia
auditoría la variante servida no está sobre-dimensionada.** El sobrecosto de 11 KB
aplica a los dispositivos reales con DPR 2, no al número que Lighthouse reporta.

---

## 6. Medición 5 — Formato servido, y un hallazgo que corrigió la regla del plan 18-02

**El formato es moderno para navegadores reales. Y el optimizador varía por
`Accept`, lo que resultó importante fuera de este plan.**

Misma URL, `/_next/image?url=%2Fdr-angulo-implante-disco.avif&w=640&q=75`:

| Cabecera `Accept` de la petición | `Content-Type` de la respuesta | Peso |
|---|---|---|
| La de un navegador (`image/avif,image/webp,…`) | **`image/webp`** | 32.980 B |
| `image/webp,image/*,*/*;q=0.8` | `image/webp` | 32.980 B |
| Ninguna, o `*/*` (curl, rastreadores, algunos bots) | `image/jpeg` | 48.250 B |

La respuesta trae `vary: Accept` y `cache-control: public, max-age=14400, must-revalidate`.

Cloudflare **no** está reescribiendo ni recomprimiendo nada: el `Content-Type` que
sale del optimizador es el que llega.

**Consecuencia fuera de este plan, ya aplicada.** La Cache Rule que el plan 18-02
dejó redactada cacheaba `/_next/image` sin distinguir por `Accept`, y Cloudflare
ignora `Vary` sobre cabeceras arbitrarias. Con esa regla puesta, la primera
respuesta que el borde guardara sería la que se sirve a todos: si le tocaba la de
un rastreador sin `Accept`, **todos los pacientes recibirían el JPEG de 48.250
bytes en vez del WebP de 32.980**, perdiendo el 32% del peso de cada imagen del
sitio sin que nada lo reportara. `18-CLOUDFLARE-CACHE.md` incorporó esto como su
sexta invariante el 2026-08-24, con dos salidas: agregar `Accept` a la clave de
caché, o excluir `/_next/image` del cacheado.

---

## 7. Medición 6 — El `src` de respaldo

El `<img>` emite `src="/_next/image?url=%2Fdr-angulo-implante-disco.avif&w=3840&q=75"`,
la variante de 3840w, que pesa 52.834 B en WebP y 80.524 B en JPEG.

**No lo descarga ningún navegador que soporte `srcset` con `sizes`**, que son todos
los del rango que el sitio soporta (`chrome 111`, `edge 111`, `firefox 111`,
`safari 16.4` por el browserslist por defecto de Next 16). El atributo existe como
respaldo para agentes sin soporte de `srcset`, y es el comportamiento estándar del
componente `Image`: no es un defecto y no se toca.

---

## 8. Veredicto: qué explica el LCP

### El TTFB de la página

| Recurso | Estado en el borde | TTFB mediano de tres corridas |
|---|---|---|
| `/sobre-el-doctor` (HTML) | **DYNAMIC** | **794 ms** |
| Piso del borde (chunk estático con `HIT`) | HIT | 322 ms |

Segunda toma del mismo día, aparte: 813 / 801 / 834 ms, mediana **813 ms**. Los dos
lotes coinciden dentro de 19 ms.

**Unos 470 ms de ese primer byte son el viaje hasta el origen, y desaparecen cuando
la Cache Rule del plan 18-02 esté aplicada.**

### El TTFB de la imagen, que en esta ruta también cuenta

`/_next/image` responde hoy con **`cf-cache-status: DYNAMIC`**: las imágenes
optimizadas tampoco se cachean en el borde. Como el elemento LCP de esta ruta es
casi con seguridad la imagen, ese segundo viaje al origen entra directo en el
camino crítico del LCP, además del de la página.

Es decir: **el LCP de `/sobre-el-doctor` paga el viaje al origen dos veces**, una
por el HTML y otra por la imagen. Las dos las corrige la Cache Rule, la segunda
solo si se resuelve la sexta invariante.

### Los 21 KB de ahorro de la auditoría

No se pueden atribuir con lo medido hasta acá, y no se inventa una atribución. Lo
que sí queda establecido, y acota el espacio:

- **No es el formato.** Producción ya sirve WebP a cualquier navegador real.
- **No es el sobre-dimensionado, en la medición de Lighthouse.** Con el DPR 2,625
  que Lighthouse emula, 640w es el candidato correcto. El sobrecosto de 11 KB que
  la sección 5 mide aplica a dispositivos con DPR 2, no al informe.
- Queda por descartar que sea la segunda imagen de la página, la de fluoroscopia,
  o que la cifra corresponda a la auditoría "Efficiently encode images" y no a la
  del tamaño. Eso se lee en el informe de Lighthouse de la sección 9.

### Y por lo tanto

**La mayor parte del LCP de esta ruta es TTFB, no trabajo de imagen**, igual que en
el resto del sitio: la ruta puntúa 0,96 con TBT de 0 ms. El trabajo de la tarea 2
sigue siendo correcto y necesario —la prop obsoleta hay que migrarla igual, y la
precarga es lo que sostiene la prioridad de la petición—, pero **la mejora de LCP
va a venir en su mayor parte del plan 18-02**, y el veredicto de cierre tiene que
separar los dos efectos con todas las letras. Si no lo hace, la próxima persona va
a atribuirle a `preload` una mejora que era de caché.

---

## 9. Lo que falta y quién puede hacerlo

| Falta | Por qué no se hizo | Quién lo resuelve |
|---|---|---|
| Línea base viva: tres corridas en la misma sesión (sección 1) | Sin Lighthouse ni navegador en esta sesión, y sin autorización para instalar paquetes fuera de la compuerta del plan 18-05 | La corrida de Unlighthouse del líder |
| Medición 1: qué elemento identifica Lighthouse como LCP (sección 2) | Lo identifica Lighthouse | La misma corrida |
| Medición 3: prioridad de red de la petición de la imagen (sección 4) | La muestra el panel de red | La misma corrida |
| Atribución de los 21 KB (sección 8) | Sale del informe de Lighthouse | La misma corrida |

---

## 10. Camino elegido en la tarea 2

**Camino A: `preload`.**

Las tres declaraciones de `Image` del proyecto migraron de la prop `priority`,
obsoleta desde Next 16, a `preload`
(`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`,
sección `#### priority`).

Por qué A y no B, dicho antes de que alguien lea la doc y dude. La línea 289 de esa
misma doc dice: «In most cases, you should use `loading="eager"` or
`fetchPriority="high"` instead of `preload`». Suena a que este plan eligió mal, y
no es así: esa frase cierra la lista de tres casos en los que `preload` **no**
corresponde, y son estos tres:

| Caso de "when not to use it" | ¿Aplica acá? |
|---|---|
| Varias candidatas a LCP según el viewport | **No.** Hay una sola imagen sobre el pliegue. La de fluoroscopia está muy por debajo y no lleva precarga. |
| Se usa la propiedad `loading` | **No.** Ninguna de las tres declaraciones la usa. |
| Se usa la propiedad `fetchPriority` | **No.** El documento no emite un solo `fetchpriority`, medido en la sección 3. |

Ninguno de los tres aplica. La lista de "when to use it" de la misma sección, en
cambio, describe este caso exacto: la imagen es el elemento LCP, está arriba del
pliegue, y se quiere empezar a cargarla desde el `<head>`.

**Valor de prioridad de red que lo confirmaría:** _pendiente, sección 4_. El camino
queda abierto: si la prioridad no sale en High, se pasa al camino B quitando
`preload` y poniendo `loading="eager"` más `fetchPriority="high"` en la declaración
de `/sobre-el-doctor`. Los dos caminos son alternativos y no se acumulan.

---

## 11. Tabla de cierre, después del cambio

> **Pendiente del checkpoint (tarea 3).** Mismo protocolo y mismas rutas que las
> secciones 1 a 7, para que la comparación sea renglón por renglón. Dos
> precondiciones: el cambio desplegado en producción, y la Cache Rule del plan
> 18-02 aplicada.

| Medición | Antes | Después |
|---|---|---|
| LCP mediano (tres corridas) | _pendiente_ | _pendiente_ |
| Elemento LCP | _pendiente_ | _pendiente_ |
| Enlace de precarga en el `<head>` | **presente** | _pendiente_ |
| Prioridad de red | _pendiente_ | _pendiente_ |
| Variante descargada a 375px DPR2 | **640w** | _pendiente_ |
| Peso de esa variante | **32.980 B** (WebP) | _pendiente_ |
| `Content-Type` | **`image/webp`** | _pendiente_ |
| TTFB del HTML | **794 ms** | _pendiente_ |
| `cf-cache-status` de `/_next/image` | **DYNAMIC** | _pendiente_ |
| CLS de `/sobre-el-doctor` | 0 (línea base 2026-08-24) | _pendiente_ |
| CLS de la portada | 0 (línea base 2026-08-24) | _pendiente_ |

### Separación de efectos, para el veredicto

| Efecto | De quién es |
|---|---|
| Prioridad de red de la petición de la imagen | Tarea 2 de este plan |
| Formato y variante servida | Ya estaban bien antes. Ni mejora ni empeora. |
| ~470 ms de TTFB del HTML | **Plan 18-02** |
| Viaje al origen de la imagen optimizada | **Plan 18-02**, vía la sexta invariante |

### Comparación de capturas

> **Pendiente del checkpoint.** `/sobre-el-doctor` y la portada a 375px y a 1440px,
> contra las de antes. Las dos imágenes tienen `object-position` afinado
> (`object-[45%_20%]` en fluoroscopia, `object-[60%_30%]` en el hero de la portada)
> y un cambio ahí se nota en la cara.
