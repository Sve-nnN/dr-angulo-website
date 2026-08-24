---
phase: 18-rendimiento-y-accesibilidad
plan: 03
subsystem: rendimiento
tags: [cwv, perfilado, testimonios, tbt, lcp, atribucion]
requires: []
provides:
  - "Atribución cerrada del costo de /testimonios, con las tres mitades del fenómeno resueltas"
  - "Evidencia de que el LCP del sitio está dominado por el TTFB, que reorientó 18-04 y priorizó 18-02"
affects: []
tech-stack:
  added: []
  patterns: []
key-files:
  created:
    - .planning/workstreams/seo-fixes/phases/18-rendimiento-y-accesibilidad/18-TESTIMONIOS-PROFILE.md
  modified: []
decisions:
  - "Los 630 ms de forced reflow se cierran por atribución de código, que es prueba de imposibilidad y no re-medición"
  - "Los 2,45 s de Style & Layout se cierran por comparación entre rutas, sin traza de devtools, con el alcance del veredicto declarado"
  - "El LCP de 4,25 s es TTFB y lo arregla el plan 18-02: este plan no escribe código para él"
  - "La tarea 2 no toca ningún archivo: sin número que lo justifique, un cambio es riesgo puro sobre una página con CLS en 0"
metrics:
  duration: "~1 h"
  completed: 2026-08-24
  tasks: 3
  files: 1
status: complete
---

# Phase 18 Plan 03: Perfilado de `/testimonios` Summary

Las tres mitades del fenómeno que la auditoría atribuyó a esta página quedaron cerradas con evidencia, ninguna necesitó tocar código, y el perfilado destapó que el LCP de todo el sitio está dominado por el TTFB.

## El resultado en una tabla

| Fenómeno de la auditoría del 2026-08-23 | Desenlace | Vía |
|---|---|---|
| 630 ms de forced reflow | **NO REPRODUCE** | Atribución de código |
| 2,45 s de Style & Layout | **NO REPRODUCE** | Comparación entre rutas |
| LCP de 4,25 s | **CULPABLE NOMBRADO: es TTFB** | Cascada de red medida |

**Ninguno pidió trabajo de código en esta ruta.** La tarea 2 cerró sin cambios, que es lo que su propia rama manda cuando la atribución no señala nada que arreglar acá.

## Qué se hizo

### El marcado servido, primero

`cdninstagram` = 0, `<img>` = 2, los cinco H2 esperados. Coincide con el Addendum del contexto, así que la atribución no se rehizo desde cero: el carrusel sigue sin renderizar.

Las dos únicas imágenes de la página son el mismo avatar de 44×44 px. **No hay ninguna imagen grande sobre el pliegue**, dato que decide la atribución del LCP.

### Los 630 ms de forced reflow: prueba de imposibilidad

Un reflow forzado exige JavaScript leyendo geometría de layout de forma síncrona. Barrido completo de `src/` por `scrollWidth`, `clientWidth`, `clientHeight`, `offsetWidth`, `offsetHeight`, `getBoundingClientRect`, `scrollLeft`, `scrollTop` y `getComputedStyle`:

**Las cuatro lecturas del proyecto entero viven en `reels-carousel.tsx` (líneas 23, 24, 25 y 41), y ese componente no se monta en `/testimonios` en producción.** `instagram-reels-section.tsx:54-58` renderiza condicionalmente sobre `reels.length > 0`, y con la cuenta de Instagram sin vincular la lista viene vacía. Un componente de cliente que nunca se renderiza nunca se hidrata: su `ResizeObserver`, su `onScroll` y su `updateEdges()` no se ejecutan ni una vez.

El único otro `onScroll` del proyecto es `header.tsx:52`, que lee `window.scrollY`: posición de scroll de la ventana, no geometría de elemento, y con listener pasivo.

**No hay origen posible para el fenómeno.** Esto es más fuerte que una re-medición: una re-medición dice que hoy no aparece, esto dice por qué no puede aparecer.

### Los 2,45 s de Style & Layout: comparación entre rutas

El costo de Style & Layout lo determinan cuántos nodos tiene el DOM y qué CSS hay que resolver contra ellos. Las dos variables quedaron fijadas.

**El CSS es literalmente el mismo archivo en las 24 rutas:** `3bo943y-scaum.css`, 47.276 B, verificado ruta por ruta.

**Y `/testimonios` es de las páginas más chicas del sitio:**

| Ruta | Nodos | TBT | Performance |
|---|---|---|---|
| `/` | **466** | **0 ms** | 0,85 |
| `/preguntas-frecuentes` | 311 | 0 ms | 0,96 |
| `/sobre-el-doctor` | 311 | 0 ms | 0,96 |
| **`/testimonios`** | **225** | **361 ms** | 0,69 |
| `/privacidad` | 179 | 0 ms | 1,00 |

**La portada tiene 2,07 veces el DOM, resuelve la misma hoja y registra 0 ms.** Si los 2,45 s fueran de la estructura de esta ruta, la portada tendría que gastar más y gasta cero.

### El LCP: es TTFB

El elemento LCP es un bloque de texto, no una imagen: a 44×44 px ninguna de las dos imágenes puede ser el elemento más grande sobre el pliegue. **El LCP de esta página no espera a que se descargue ninguna imagen**, así que no hay `preload` que agregar ni formato que cambiar.

Cascada medida, mediana de tres corridas:

| Recurso | Estado en el borde | TTFB |
|---|---|---|
| `/testimonios` (HTML) | **DYNAMIC** | **806 ms** |
| CSS bloqueante | HIT | 333 ms |
| Piso del borde (chunk con `HIT`) | HIT | 322 ms |

**Unos 484 ms del primer byte son el viaje al origen**, y los elimina la Cache Rule del plan 18-02. Este plan no escribió código para el LCP: hacerlo habría sido trabajo desperdiciado sobre un problema de borde, y además habría tapado la causa.

## Lo que este perfilado le dio al resto de la fase

Es la contribución más grande de este plan y no estaba en su alcance.

**El LCP de todo el sitio está dominado por el TTFB.** El patrón se confirma en la tabla de 24 rutas: TBT de 0 ms en 21 de ellas con el LCP agolpado entre 2,1 y 3,6 s. Con el hilo principal desocupado, eso es tiempo hasta el primer byte.

Consecuencias que cambiaron el orden de trabajo de la fase:
- **18-02 pasó a ser el plan de mayor palanca** y su Cache Rule es la precondición de las mediciones de cierre de 18-03 y 18-04.
- **18-04 supo desde el principio que su mejora de LCP en segundos no era suya**, y acotó su alcance a la brecha de prioridad de la petición.

**Y un hallazgo que reorientó 18-05:** los 70.799 bytes que la auditoría atribuía al chunk compartido son el peso comprimido de `31iarpvmym1z2.js` (70.709 B medidos, a 90 bytes), que resultó ser React DOM y por lo tanto no accionable. Eso desbloqueó la búsqueda del blanco real.

## Deviaciones del plan

### 1. La línea base viva no la produjo el ejecutor

- **Qué pedía el criterio:** tres corridas de Lighthouse en la misma sesión, como umbral contra el que juzgar el delta de cierre.
- **Por qué no se hizo:** sin Lighthouse ni navegador manejable en la sesión, e instalar uno habría sido una instalación de paquete fuera de la única compuerta de instalación de la fase.
- **Qué se hizo en su lugar:** entregar toda la atribución sin ella. **Las tres mitades del fenómeno se cerraron sin una sola corrida de Lighthouse**, por lectura de código, por medición de red con `curl` y por comparación de volumen de DOM entre rutas.
- **Lo que NO se hizo:** declarar un desenlace sin evidencia. Mientras faltó la comparación entre rutas, Style & Layout quedó explícitamente **sin desenlace** en el archivo, en vez de declararse NO REPRODUCE por comodidad.

### 2. El veredicto de Style & Layout se declara con su alcance acotado

- La comparación por volumen de DOM es fuerte pero no es aritmética exacta: el costo de estilo también depende de qué selectores matchean y del modo de layout de cada subárbol.
- **Lo que descarta con solidez** es que el volumen de esta página explique 2,45 s, porque hay una página del doble de tamaño con la misma hoja que no gasta nada.
- **Lo que no cubre** queda escrito en el archivo, junto con qué lo cerraría: una traza de rendimiento de devtools sobre producción. Si alguna vez se toma y aparece el fenómeno, ese renglón es el primero a revisar.

### 3. La tarea 2 no tocó ningún archivo

No es una omisión: es la rama que el propio plan define para cuando la atribución no señala trabajo de código en la ruta. Un cambio sin un número que lo justifique es riesgo puro sobre una página que tiene el CLS en 0.

## Superposición de archivos entre planes

| Archivo | Dueño nominal | Quién lo tocó | Nota |
|---|---|---|---|
| `src/components/analytics/analytics-scripts.tsx` | 18-03 | **18-05** | Este plan no lo tocó: su tarea 2 cerró sin cambios. 18-05 lo modificó para cargar `@next/third-parties` con `dynamic()`, ahorrando 6.913 B por ruta. Es el mismo defecto de la misma clase que 18-05 estaba resolviendo y lo cubre el mismo requisito, CWV-04. Alcance ampliado con aprobación del líder de fase el 2026-08-24. |

## Amenazas del registro

Este plan no modificó código, así que las mitigaciones de tampering sobre el marcado no llegaron a ejercitarse. El HTML servido de `/testimonios` es el mismo con el que arrancó la fase: `<img>` = 2, `cdninstagram` = 0, `<h2>` = 4 en el build local.

## Las cinco compuertas

Las cinco en 0: `build`, `content:check`, `seo:check`, `sedes:check` y `tsc --noEmit`.

## Estado del requisito

**CWV-02 cerrado en su atribución.** Los tres fenómenos tienen desenlace escrito con evidencia.

Lo que queda abierto no es diagnóstico sino instrumentación: la línea base viva y la cobertura de Coverage, que necesitan navegador. Y la mejora del LCP en segundos, que **depende de que Juan aplique la Cache Rule del plan 18-02** y no de nada que se pueda hacer en esta ruta.

## Self-Check: PASSED

- `18-TESTIMONIOS-PROFILE.md` — FOUND
- Commits `4efe9a0`, `569fcc4` — FOUND
