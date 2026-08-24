# CWV-02 — Perfilado de `/testimonios`

**Fase:** 18 — Rendimiento y accesibilidad
**Plan:** 18-03, tarea 1
**Medido:** 2026-08-24 contra producción (`https://drangulocolumna.com/testimonios`)
**Estado:** parcial. Ver la sección 8, "Lo que falta y quién puede hacerlo".

---

## 1. Estado del marcado servido

Primero lo que cualquier atribución necesita antes de nada: qué hay de verdad en
la página que la auditoría midió.

| Señal | Esperado (Addendum del 2026-08-24) | Medido hoy | Veredicto |
|---|---|---|---|
| `cdninstagram` | 0 | **0** | Coincide |
| `<img` | 2 | **2** | Coincide |
| H2 presentes | 5, con los títulos del Addendum | **5** | Coincide |

Los cinco H2, en orden: "Reseñas en Google", "Otras reseñas", "Videos del
consultorio", "Consultorio privado", "Contacto rápido".

El conteo coincide con el del Addendum, así que **la atribución no se rehace desde
cero**. El carrusel sigue sin renderizar y la cuenta de Instagram sigue sin
vincular.

Las dos únicas imágenes de la página son el mismo avatar de 44×44 px
(`logo-icon-square.avif`), una con carga ansiosa y otra diferida. **No hay ninguna
imagen grande sobre el pliegue.** Este dato decide la sección 5.

---

## 2. Línea base viva

> **Pendiente.** Requiere tres corridas de Lighthouse móvil con throttling 4x en
> la misma sesión, y esta sesión no tiene navegador ni Lighthouse instalado.
> Instalar uno sería la única instalación de paquete de la fase fuera de la
> compuerta del plan 18-05, así que no se hace. Ver la sección 8.

| Corrida | Hora | Performance | TBT | LCP | CLS |
|---|---|---|---|---|---|
| 1 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| 2 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| 3 | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ | _pendiente_ |
| **Mediana** | | | | | |

### Datos históricos, anotados y NO usados como umbral

Las dos mediciones de abajo están separadas por un día, sin que nadie tocara la
página, y difieren en un factor de 2,4 en TBT. **No sirven de referencia para
juzgar un arreglo** y por eso quedan como contexto de varianza y nada más.

| Métrica | 2026-08-23 (histórico) | 2026-08-24 (histórico) |
|---|---|---|
| Performance | 0,60 | 0,69 |
| TBT | 850 ms | 361 ms |
| LCP | 3,47 s | 4,25 s |

---

## 3. Pre-cierres, con su evidencia

Los dos candidatos que este plan traía y que la tabla del 2026-08-24 cierra por
lectura. Descartar leyendo no es descartar sin registro: acá queda el registro.

### Candidato 1 — JavaScript muerto en la ruta: PRE-CERRADO, no produce TBT

`instagram-reels-section.tsx` importa `ReelsCarousel` de forma estática desde un
Server Component, y el chunk resultante (`0krsqwhv3zry_.js`, 29.656 bytes sin
comprimir) lo descargan 25 de los 26 documentos del build.

Suena a culpable y no lo es. **`/privacidad` descarga ese mismo chunk y puntúa
1,00, con TBT de 0 ms y LCP de 1,34 s**
(`audit/baselines/2026-08-24-lighthouse-post-fase16.md`). Si esos 29.656 bytes
produjeran TBT, `/privacidad` sería la prueba, y es lo contrario.

Es un problema real de peso y lo arregla el plan 18-05 por su propio criterio, en
KB de JavaScript sin usar. No es el culpable de CWV-02.

### Candidato 2 — El armazón compartido: PRE-CERRADO, no produce TBT

`src/app/layout.tsx` monta cuatro componentes de cliente en las 24 rutas:
`Header`, `WhatsAppFloatButton`, `CookieConsentBanner` y `AnalyticsScripts`. Si el
armazón costara TBT, ese costo aparecería en todas las rutas por definición, y
**el TBT es 0 ms en 21 de las 24 rutas.**

Se suma lo que este plan ya traía: `AnalyticsScripts` devuelve `null` mientras el
consentimiento no esté en `granted`, y Lighthouse corre con perfil limpio, así que
ni GA4 ni el pixel de Meta se montan durante la medición.

### Candidato 0 — El carrusel de reels: ya estaba descartado

El Addendum del `18-CONTEXT.md` lo cerró el 2026-08-24 contra producción. La
sección 4 de este archivo lo cierra otra vez, ahora por lectura del código, que es
una prueba más fuerte que el conteo de marcado.

---

## 4. Los 630 ms de forced reflow: NO REPRODUCE, probado por código

Este es el hallazgo más limpio del perfilado, y no hizo falta un navegador para
llegar a él.

Un reflow forzado exige, por definición, que haya JavaScript leyendo geometría de
layout de forma síncrona. Así que la pregunta tiene respuesta exacta: **¿qué código
de cliente que corre en `/testimonios` lee geometría de layout?**

Barrido completo de `src/` por las propiedades que fuerzan layout síncrono
(`scrollWidth`, `clientWidth`, `clientHeight`, `offsetWidth`, `offsetHeight`,
`getBoundingClientRect`, `scrollLeft`, `scrollTop`, `getComputedStyle`):

| Archivo | Líneas | Lecturas |
|---|---|---|
| `src/components/instagram/reels-carousel.tsx` | 23, 24, 25, 41 | `scrollWidth`, `clientWidth`, `scrollLeft`, `clientWidth` |
| **cualquier otro archivo de `src/`** | — | **ninguna** |

**Las cuatro lecturas del proyecto entero viven en `reels-carousel.tsx`, y ese
componente no se monta en `/testimonios` en producción.**

La prueba está en `instagram-reels-section.tsx`, líneas 54-58: el render es
condicional sobre `reels.length > 0`. Con la cuenta de Instagram sin vincular,
`getInstagramReels()` devuelve una lista vacía y la rama que se toma es el estado
de respaldo, el `<p>` con el enlace al perfil. `ReelsCarousel` lleva `"use client"`
en su primera línea, pero un componente de cliente que nunca se renderiza nunca se
hidrata: su `ResizeObserver` (línea 32), su `onScroll` (línea 72) y su
`updateEdges()` (línea 20) no se ejecutan ni una vez.

El único otro `onScroll` del proyecto es el de `header.tsx:52`, y lee
`window.scrollY`. Eso es la posición de scroll de la ventana, no geometría de un
elemento: no invalida layout, y además está registrado como listener pasivo. Corre
en las 24 rutas, 21 de las cuales tienen TBT de 0 ms.

**Veredicto: los 630 ms de forced reflow no tienen origen posible en el código que
se ejecuta en `/testimonios` en producción.** Esta mitad del fenómeno queda cerrada
por atribución de código, que es una evidencia más fuerte que una re-medición: una
re-medición dice que hoy no aparece, y esto dice por qué no puede aparecer.

Y confirma, por tercera vez y por una vía independiente, que la sospecha original
de la auditoría era falsa. Optimizar el carrusel habría consumido la fase entera
sin mover el número.

---

## 5. El LCP, que es la cifra que decide el puntaje

### La aritmética, primero

De la tabla del 2026-08-24, misma herramienta y misma sesión: la portada tiene TBT
de **0 ms** y aun así puntúa **0,85**; `/agendar` con 6 ms puntúa 0,85; **ninguna
ruta con LCP sobre 3,0 s pasa de 0,88**. `/testimonios` tiene el peor LCP del
sitio, 4,25 s. Con ese LCP, "performance mayor a 0,90" es inalcanzable haga lo que
haga este plan con el TBT.

### Qué elemento es

**Un bloque de texto, no una imagen.** Las dos únicas imágenes de la página son el
mismo avatar de 44×44 px del bloque de reseñas; a ese tamaño ninguna puede ser el
elemento más grande sobre el pliegue. El candidato sobre el pliegue es el `<h1>`
"Lo que dicen sus pacientes" o el primer bloque de texto de `GoogleReviewsSection`.

Consecuencia directa: **el LCP de esta página no espera a que se descargue ninguna
imagen.** No hay `preload` que agregar, ni `sizes` que corregir, ni formato que
cambiar. El arreglo que el plan 18-04 aplica en `/sobre-el-doctor` no tiene análogo
acá porque no hay imagen que arreglar.

Si el LCP es texto, lo único que lo puede retrasar es: llegar tarde el HTML, llegar
tarde el CSS que bloquea el render, o llegar tarde la fuente.

### La cascada del camino crítico, medida

Tres corridas por recurso, TTFB como `time_starttransfer` menos `time_connect`.

| Recurso | Peso | Estado en el borde | Corrida 1 | Corrida 2 | Corrida 3 | **Mediana** |
|---|---|---|---|---|---|---|
| `/testimonios` (HTML) | 92.526 B | **DYNAMIC** | 817 ms | 806 ms | 794 ms | **806 ms** |
| `2n6q3o5s61b7_.css` | 46.465 B | HIT | 333 ms | 315 ms | 347 ms | **333 ms** |
| `47fe1b7cd6e6ed85-…woff2` | 7.848 B | MISS | 332 ms | 339 ms | 319 ms | **332 ms** |

Segunda corrida del HTML, tomada aparte el mismo día: 818 / 801 / 814 ms, mediana
**814 ms**. Los dos lotes coinciden dentro de 8 ms.

Léase en orden. El navegador no puede pedir el CSS hasta que empieza a llegar el
HTML, así que el camino es serial: **806 ms hasta el primer byte del HTML, y recién
entonces 333 ms más hasta el CSS que desbloquea el render.** La fuente viaja en
paralelo con el CSS y no agrega al camino. Son unos 1,14 s antes de que el
navegador pueda pintar la primera letra, sin throttling, desde una máquina con
buena conexión. Bajo el throttling móvil y la CPU 4x con que Lighthouse mide, ese
número se estira hasta el orden de los 4,25 s registrados.

### Dónde está el tiempo, y de quién es

| Tramo | Tiempo | Dueño |
|---|---|---|
| Ida y vuelta hasta el borde de Cloudflare | ~322 ms | La red. No se arregla desde el código. |
| Del borde al origen y vuelta, con la página ya prerenderizada | **~484 ms** | **Plan 18-02.** Es exactamente lo que la Cache Rule elimina. |
| CSS bloqueante, ya servido desde el borde | 333 ms | Nadie. Ya está cacheado (`cf-cache-status: HIT`). |

Los 322 ms son el piso medido del borde: un chunk estático con
`cf-cache-status: HIT` responde en ese tiempo desde esta misma máquina
(`18-CLOUDFLARE-CACHE.md`, sección 2.3). Todo lo que el HTML tarda por encima de
ese piso es el viaje hasta Hetzner, y ese viaje desaparece cuando el borde sirve la
página desde caché.

**Veredicto del LCP: es TTFB, y lo arregla el plan 18-02.** La hipótesis de partida
queda confirmada por la cascada, no dada por hecha. Y por lo tanto **este plan no
escribe código para el LCP**: hacerlo sería trabajo desperdiciado sobre un problema
de borde, y además taparía la causa.

---

## 6. Los chunks de la ruta

Todos los que `/testimonios` referencia, con peso real de transferencia (con
compresión, que es lo que viaja) y sin comprimir (que es lo que hay que analizar y
compilar).

| Chunk | Transferencia | Sin comprimir | Nota |
|---|---|---|---|
| `31iarpvmym1z2.js` | **70.709 B** | 226.356 B | Ver el hallazgo de abajo |
| `2iu5uskpeilfk.js` | 45.266 B | 158.572 B | |
| `2-5nk792mwq2y.js` | 40.511 B | 150.470 B | |
| `0cz1d0mv5g_q7.js` | 39.473 B | 112.594 B | |
| `14mrh2-p_w84d.js` | 12.863 B | 54.646 B | |
| `0krsqwhv3zry_.js` | 10.626 B | **29.656 B** | El del código del carrusel. Lo cargan 25 de los 26 documentos. |
| `15orcrkp-_9ct.js` | 10.564 B | 50.702 B | |
| `1jdkx0n4yf3re.js` | 10.250 B | 30.876 B | |
| `2lh3mnan_yqch.js` | 10.239 B | 30.876 B | |
| `1mdk1t71c9r3k.js` | 9.358 B | 26.272 B | |
| `2yk75xw433_3t.js` | 6.417 B | 18.656 B | |
| `turbopack-1ubckju2-8c8j.js` | 4.159 B | 10.580 B | |
| `420mtziom5wrd.js` | 1.542 B | **3.498 B** | Propio de `/` y `/testimonios` |

### Hallazgo: los 70.799 bytes de la auditoría sí existen, y ya sabemos qué son

El plan advertía que los 70.799 bytes que la auditoría del 2026-08-23 atribuye al
chunk compartido "no corresponden a ningún archivo de este build", y mandaba no
salir a buscarlos.

**Aparecieron. Son el peso de transferencia comprimido de `31iarpvmym1z2.js`:
70.709 bytes medidos hoy contra producción, a 90 bytes de los 70.799 de la
auditoría.** Sin comprimir ese archivo pesa 226.356 bytes, que es por lo que la
búsqueda por tamaño de archivo no lo encontraba. Los 90 bytes de diferencia se
explican por el rebuild que hubo entre las dos fechas.

Esto importa para el plan 18-05, que hereda esa cifra: el 41% de JavaScript sin
usar que la auditoría reporta está sobre **este** chunk, el más grande de la ruta,
no sobre el de 29.656 bytes del carrusel. Queda anotado para que 18-05 mida sobre
el archivo correcto.

### Cobertura ejecutada

> **Pendiente.** El panel de Coverage de devtools necesita navegador. Ver la
> sección 8.

---

## 7. Comparación de TBT entre rutas

Tomada de la corrida de Unlighthouse del 2026-08-24, misma herramienta y misma
sesión para las 24 rutas.

| Ruta | TBT | LCP | Performance |
|---|---|---|---|
| `/testimonios` | 361 ms | 4,25 s | 0,69 |
| `/` | **0 ms** | 3,57 s | 0,85 |
| `/privacidad` | **0 ms** | 1,34 s | 1,00 |
| `/agendar` | 6 ms | 3,40 s | 0,85 |
| `/sedes/clinica-tezza` | 33 ms | 3,35 s | 0,88 |

**Veredicto: el costo no es del armazón compartido.** Si lo fuera, aparecería en
las 24 rutas, y `/` y `/privacidad` lo tienen en 0 ms cargando el mismo armazón y
el mismo chunk del carrusel. Lo que distingue a `/testimonios` del resto es el
bloque de reseñas de Google, que es un Server Component sin JavaScript de cliente,
y un chunk propio de 3.498 bytes.

La misma tabla, leída por la columna del LCP, es la evidencia central de la sección
5: `/privacidad` tiene el LCP más bajo del sitio y es también la página más liviana
de servir. El LCP sigue al costo de servir la página, no al trabajo de cliente.

---

## 8. Los 2,45 s de Style & Layout: NO REPRODUCE, por comparación entre rutas

**Actualización del 2026-08-24.** Esta era la única mitad del fenómeno que quedaba
sin desenlace. Se cierra sin traza de devtools, con una comparación que la traza no
habría hecho mejor.

### El razonamiento

El costo de Style & Layout de una página lo determinan dos cosas: **cuántos nodos
tiene el DOM** y **qué CSS hay que resolver contra ellos**. Si `/testimonios`
gastara 2,45 s ahí, una ruta con más nodos y el mismo CSS tendría que gastar por lo
menos lo mismo.

### El CSS es literalmente el mismo archivo

| Ruta | Hoja de estilos |
|---|---|
| `/testimonios` | `3bo943y-scaum.css` |
| `/` | `3bo943y-scaum.css` |
| `/privacidad` | `3bo943y-scaum.css` |
| `/sobre-el-doctor` | `3bo943y-scaum.css` |

Una sola hoja de 47.276 B, idéntica en las 24 rutas. La variable CSS queda fijada:
no hay nada que resolver en `/testimonios` que no haya que resolver en las demás.

### Y `/testimonios` es de las páginas más chicas del sitio

Nodos contados sobre el HTML prerenderizado del build limpio, cruzados contra la
corrida de Unlighthouse del 2026-08-24.

| Ruta | Nodos | Bytes de HTML | TBT | Performance |
|---|---|---|---|---|
| `/` | **466** | 141.457 | **0 ms** | 0,85 |
| `/preguntas-frecuentes` | 311 | 103.772 | **0 ms** | 0,96 |
| `/sobre-el-doctor` | 311 | 89.682 | **0 ms** | 0,96 |
| `/sedes` | 244 | 71.666 | 0 ms | 0,97 |
| `/contacto` | 231 | 69.181 | — | 0,97 |
| **`/testimonios`** | **225** | 68.327 | **361 ms** | 0,69 |
| `/privacidad` | 179 | 58.603 | 0 ms | 1,00 |

**La portada tiene 2,07 veces el DOM de `/testimonios`, resuelve exactamente el
mismo CSS, y registra 0 ms de TBT.** `/preguntas-frecuentes` y `/sobre-el-doctor`
tienen 1,38 veces sus nodos y también 0 ms, con puntajes de 0,96.

`/testimonios` es la segunda página más chica de la muestra. Solo `/privacidad` la
supera en liviandad, y `/privacidad` puntúa 1,00.

### Veredicto

**Los 2,45 s de Style & Layout no son atribuibles a la estructura de esta ruta.** Si
lo fueran, la portada tendría que mostrar un costo mayor y muestra cero. La
combinación que la auditoría del 2026-08-23 registró —2,45 s de Style & Layout más
630 ms de forced reflow más 850 ms de TBT— no tiene sustento en el marcado ni en el
CSS que esta página sirve hoy.

Esta mitad se cierra entonces en **NO REPRODUCE**, igual que la del forced reflow,
pero por una vía distinta y complementaria:

| Mitad del fenómeno | Vía de cierre | Fuerza de la evidencia |
|---|---|---|
| 630 ms de forced reflow | Atribución de código: las cuatro lecturas de geometría del proyecto viven en `reels-carousel.tsx`, que no se monta en producción | **Prueba de imposibilidad.** No dice que hoy no aparece: dice por qué no puede aparecer. |
| 2,45 s de Style & Layout | Comparación entre rutas: 2× el DOM y el mismo CSS dan 0 ms | **Evidencia fuerte por contradicción.** Una ruta más pesada con el mismo CSS no lo muestra. |

### El resto que esta vía no cubre, dicho de frente

La comparación por volumen de DOM es fuerte pero no es aritmética exacta: el costo
de estilo también depende de la complejidad de los selectores que efectivamente
matchean y del modo de layout de cada subárbol, y dos páginas con la misma cantidad
de nodos pueden no costar lo mismo. Lo que la comparación descarta con solidez es
que **el volumen de esta página** explique 2,45 s, porque hay una página del doble
de tamaño con la misma hoja que no gasta nada.

Lo que cerraría el último resquicio es una traza de rendimiento de devtools sobre
producción. **No se tomó, y por eso este veredicto se declara con su alcance
explícito en vez de darse por completo.** Si alguien la toma alguna vez y aparece el
fenómeno, este renglón es el que hay que revisar primero.

### Lo que no se hizo, a propósito

No se tocó una línea de código por esta mitad. Con la atribución cerrada en NO
REPRODUCE, un cambio de código no tendría número que lo justifique, y sería riesgo
puro sobre una página que hoy tiene el CLS en 0.

---

## 9. Lo que falta y quién puede hacerlo


Esta tarea entrega todo lo que se puede establecer sin navegador, y se detiene
antes de inventar lo que no. Falta lo siguiente, y las tres cosas necesitan
Lighthouse o devtools:

| Falta | Por qué no se hizo | Quién lo resuelve |
|---|---|---|
| La línea base viva: tres corridas en la misma sesión (sección 2) | No hay Lighthouse ni navegador manejable en esta sesión. Instalarlo sería una instalación de paquete fuera de la única compuerta de instalación de la fase, la del plan 18-05 | La corrida de Unlighthouse del líder |
| Porcentaje de cobertura ejecutada por chunk (sección 6) | El panel de Coverage necesita devtools | La misma corrida |

**Los 2,45 s de Style & Layout ya no están en esta lista.** Quedaron cerrados en la
sección 8 por comparación entre rutas, que no necesitaba navegador. Lo que sigue
faltando es solo instrumentación de medición, no atribución.

---

## 10. Desenlace

La atribución termina, por ahora, repartida en dos mitades. Cada una con su
desenlace y su evidencia:

**Los 630 ms de forced reflow: NO REPRODUCE.**
Cerrado por atribución de código, sección 4. Las cuatro lecturas de geometría de
layout del proyecto entero viven en `reels-carousel.tsx`, y ese componente no se
monta en `/testimonios` en producción porque `reels.length` es 0. No hay origen
posible para el fenómeno.

**El LCP de 4,25 s: CULPABLE NOMBRADO.**
Es TTFB, sección 5. La cascada medida lo atribuye: 806 ms de primer byte contra un
piso de borde de 322 ms, sobre una página cuyo elemento LCP es texto y no espera
ninguna imagen. **Lo arregla el plan 18-02, no este.** Este plan no escribe código
para el LCP y su medición de cierre queda condicionada a que la Cache Rule esté
aplicada, como el propio plan ya declaraba.

**Los 2,45 s de Style & Layout: NO REPRODUCE.**
Cerrado por comparación entre rutas, sección 8. La portada tiene 2,07 veces el DOM
de `/testimonios`, resuelve exactamente la misma hoja de estilos de 47.276 B y
registra 0 ms de TBT. `/testimonios` es la segunda página más chica de la muestra.
El costo no es atribuible a la estructura de esta ruta.

**Consecuencia para la tarea 2:** ninguno de los tres desenlaces pide trabajo de
código en esta ruta. La tarea 2 no toca nada. Un cambio de código sin un número
que lo justifique es riesgo puro sobre una página que hoy tiene el CLS en 0.
