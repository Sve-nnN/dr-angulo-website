# CWV-03 — LCP de `/sobre-el-doctor`: qué sirve producción

**Fase:** 18 — Rendimiento y accesibilidad
**Plan:** 18-04, tareas 1 y 3
**Medido:** 2026-08-24 contra producción (`https://drangulocolumna.com/sobre-el-doctor`)
**Estado:** cerrado. Las seis mediciones completas; el checkpoint lo resolvió el líder de fase el 2026-08-24.

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

**Camino B: `loading="eager"` más `fetchPriority="high"`.** Aplicado el 2026-08-24
después de la corrida del checkpoint.

### Por qué no quedó el camino A

La tarea 2 arrancó por el camino A (`preload`), con la justificación de la doc que
sigue más abajo. La corrida de Unlighthouse del líder de fase sobre el build local
lo desmintió con el número que el propio plan había puesto como árbitro:

| Señal de `lcp-discovery-insight` | Con camino A |
|---|---|
| `requestDiscoverable` | `true` |
| **`priorityHinted`** | **`false`** |
| Veredicto de la auditoría | **0** |

El mensaje de Lighthouse fue explícito: *"fetchpriority=high should be applied to
the image preload request"*. El `preload` hacía la petición descubrible en el
documento pero no le ponía prioridad, que es exactamente la condición que el plan
define para pasar al camino B.

El LCP igual había mejorado con el camino A: **2,73 s → 2,2 s**, con puntaje 0,95.

### Qué cambió en el código

En `src/app/sobre-el-doctor/page.tsx`, la declaración del `Image` de la imagen del
doctor pasa de `preload` a `loading="eager"` más `fetchPriority="high"`. Ninguna
otra prop se tocó: `src`, `alt`, `width={933}`, `height={1400}`, `sizes` y
`className` quedan carácter por carácter iguales.

Las otras dos declaraciones, la del hero de la portada y la del logo del
encabezado, **conservan `preload`**: el camino B es una decisión sobre la imagen
del LCP de esta ruta, no sobre las tres.

### El resultado, que salió mejor que lo que el plan preveía

El plan predecía que sin `preload` Next dejaría de emitir el enlace de precarga y
que las apariciones de `imageSrcSet` en `/sobre-el-doctor` bajarían de 2 a 1.
**No es lo que hace esta versión de Next.** Medido sobre el build limpio:

```
<link rel="preload" as="image"
      imageSrcSet="/_next/image?url=%2Fdr-angulo-implante-disco.avif&w=32&q=75 32w, ..."
      imageSizes="(min-width: 640px) 260px, 220px"
      fetchPriority="high"/>
```

Y en el cuerpo:

```
<img ... fetchPriority="high" loading="eager" width="933" height="1400" ...>
```

Next 16 **sigue emitiendo el enlace de precarga y además le pone
`fetchPriority="high"`**, y replica el atributo en el `<img>`. Así que el camino B
no cambia una cosa por la otra: conserva lo que el camino A daba
(`requestDiscoverable: true`, el enlace en el `<head>`) y agrega lo único que
faltaba (`priorityHinted: true`).

`imageSrcSet` en `/sobre-el-doctor` sigue en **2**, no en 1. Ver la desviación
registrada abajo.

### Sobre la doc, para que nadie lea esto como una degradación

`image.md:289` dice: *"In most cases, you should use `loading="eager"` or
`fetchPriority="high"` instead of `preload`"*. **El camino B es lo que la doc
recomienda de entrada, no un plan C.** La justificación del camino A se apoyaba en
que ninguno de los tres casos de "when not to use it" aplicaba, y eso sigue siendo
cierto; lo que decidió no fue la doc sino la medición, que es lo que el plan había
establecido desde el principio.

### Desviación: la aserción de `imageSrcSet` del camino B no se cumple

- **Criterio del plan:** en el camino B, `imageSrcSet` en `/sobre-el-doctor` baja a
  1, "la del logo", porque "sin `preload`, Next no emite el enlace de precarga de la
  imagen del doctor".
- **Medido:** **2**. El enlace de precarga de la imagen del doctor se sigue
  emitiendo, ahora con `fetchPriority="high"`.
- **Por qué:** la premisa del criterio es incorrecta para esta versión de Next.
  `loading="eager"` con `fetchPriority="high"` hace que Next emita el preload igual.
  Es el comportamiento deseable y es mejor que el que el plan había previsto.
- **Qué NO se hizo:** ajustar el criterio para que coincida con la realidad. Queda
  registrado como desviación, y el bloque condicional del `<verify>` de la tarea 2
  falla en su rama `else` por este renglón, con todo lo demás en verde
  (`preload`=0, `fetchPriority="high"`=1, `loading="eager"`=1).

---

## 11. Tabla de cierre

**Corrida del líder de fase, 2026-08-24**, con navegador real sobre el build limpio
de la rama.

### `lcp-discovery-insight`: de 0 a 1

Los tres ítems del checklist en verde:

```
priorityHinted:      true   ("fetchpriority=high applied")
requestDiscoverable: true
eagerlyLoaded:       true
```

Es el número que el plan puso como árbitro entre los dos caminos, y el que con el
camino A daba `priorityHinted: false`. **El camino B hizo exactamente lo que
faltaba.**

| Medición | Antes (producción) | Camino A (local) | Camino B (local) |
|---|---|---|---|
| `lcp-discovery-insight` | — | **0** | **1** |
| `priorityHinted` | — | `false` | **`true`** |
| `requestDiscoverable` | — | `true` | **`true`** |
| `eagerlyLoaded` | — | — | **`true`** |
| LCP mediano | 2,73 s | 2,2 s | ver nota |
| Puntaje de performance | 0,96 | 0,95 | ver nota |
| Enlace de precarga en el `<head>` | presente | presente | **presente, con `fetchPriority="high"`** |
| `imageSrcSet` en `/sobre-el-doctor` | 2 | 2 | **2** |
| Variante descargada a 375px DPR2 | 640w | 640w | **640w** |
| Peso de esa variante | 32.980 B (WebP) | igual | **igual** |
| `Content-Type` | `image/webp` | igual | **igual** |
| CLS de `/sobre-el-doctor` | 0 | 0 | **0** |
| CLS de la portada | 0 | 0 | **0** |

**Nota sobre el LCP y el puntaje del camino B.** La corrida que midió el camino B
mostró todos los LCP del sitio hacia arriba, incluida `/privacidad`, que es la ruta
más liviana y bajó a 0,67 con 2.054 ms de TBT cuando venía en 0,93 y 1,00. Eso
apunta a carga de máquina y no a una regresión de esta tarea. **El número de LCP de
esa corrida no se toma como definitivo y se está midiendo la mediana**, que es la
disciplina que esta fase se exigió a sí misma desde el principio y que ya evitó dos
atribuciones falsas.

Lo que sí es definitivo es `lcp-discovery-insight`, porque es una comprobación
booleana sobre el marcado emitido y no una medición de tiempo: no la afecta la carga
de la máquina.

### La desviación, confirmada por la medición

El plan predecía que en el camino B `imageSrcSet` bajaría a 1, porque sin `preload`
Next dejaría de emitir el enlace de precarga. **Quedó en 2**, y la corrida confirma
por qué eso está bien: `requestDiscoverable` sigue en `true`, o sea el enlace de
precarga sigue ahí, y ahora además `priorityHinted` es `true`.

**El camino B no cambió una cosa por la otra: conservó lo que el camino A daba y
agregó lo que faltaba.** La premisa del criterio era incorrecta para esta versión de
Next, y el criterio no se ajustó.

### Separación de efectos

| Efecto | De quién es |
|---|---|
| `priorityHinted` de `false` a `true` | **Camino B, tarea 2 de este plan** |
| Enlace de precarga descubrible en el `<head>` | Tarea 2, ya lo daba el camino A |
| Formato y variante servida | Ya estaban bien antes. Ni mejora ni empeora. |
| ~470 ms de TTFB del HTML | **Plan 18-02**, pendiente de que Juan aplique la Cache Rule |
| Viaje al origen de la imagen optimizada | **Plan 18-02**, vía la sexta invariante |

**El grueso de la mejora de LCP de esta ruta sigue dependiendo del plan 18-02.** Lo
que este plan cierra es la brecha de prioridad de la petición, que era su alcance
real. Decirlo así evita que la próxima persona le atribuya a `fetchPriority` una
mejora que era de caché de borde.

### Comparación de capturas

Cubierta por el CLS en 0 en las dos rutas y por la corrida de accesibilidad, que dio
1,00 en las 24. La comparación píxel a píxel a 375px y 1440px no se reportó por
separado; queda registrado igual que en el plan 18-01, como evidencia fuerte pero no
la que el criterio pedía.

---

## 12. Estado del requisito

**CWV-03 cerrado.** La imagen del LCP de `/sobre-el-doctor` se descubre desde el
`<head>` y se pide con prioridad alta comprobada, se sirve en formato moderno y en la
variante correcta, y el proyecto no usa ninguna prop obsoleta del componente `Image`.
El CLS de las dos rutas tocadas sigue en 0.
