---
phase: 18-rendimiento-y-accesibilidad
plan: 05
subsystem: rendimiento
tags: [bundle, code-splitting, cwv, javascript, browserslist]
requires: ["18-01"]
provides:
  - "La capa editorial del sitio ya no viaja al navegador en ninguna ruta"
  - "Índice de navegación con compuerta de sincronía en tiempo de build"
  - "Rango de navegadores declarado explícitamente"
affects:
  - src/content/nav-index.ts
  - src/components/layout/header.tsx
  - src/components/layout/services-menu.tsx
  - src/components/analytics/analytics-scripts.tsx
  - src/components/instagram/reels-carousel-lazy.tsx
tech-stack:
  added: []
  patterns:
    - "Índice de navegación liviano escrito a mano, con assertNavIndexMatches() llamado desde barriles solo-servidor para que la desincronización rompa el build"
    - "Límite de cliente propio para dividir código cuando el consumidor es un Server Component, que es el caso donde dynamic() no está soportado"
key-files:
  created:
    - src/content/nav-index.ts
    - src/components/instagram/reels-carousel-lazy.tsx
    - .planning/workstreams/seo-fixes/phases/18-rendimiento-y-accesibilidad/18-BUNDLE-ANALYSIS.md
  modified:
    - package.json
    - src/components/layout/header.tsx
    - src/components/layout/services-menu.tsx
    - src/components/analytics/analytics-scripts.tsx
    - src/components/instagram/instagram-reels-section.tsx
    - src/content/service-pages/index.ts
    - src/content/location-pages/index.ts
decisions:
  - "react-dom queda fuera de alcance con motivo escrito: los 70.799 B de la auditoría son ese chunk y no es accionable"
  - "El índice de navegación se escribe a mano, no se deriva ni se pasa como props, para no reintroducir el import ni mudar el peso al árbol RSC"
  - "@next/bundle-analyzer se desinstala: no es compatible con Turbopack y dejaba una afordancia falsa"
  - "Los polyfills se cierran por medición, no por arreglo: viajan con noModule"
metrics:
  duration: "~2 h"
  completed: 2026-08-24
  tasks: 3
  files: 11
status: complete
---

# Phase 18 Plan 05: Bundle — La capa editorial fuera del cliente Summary

Casi 138 KB menos de JavaScript por ruta en las 24: la prosa clínica del sitio dejó de viajar al navegador para que el encabezado pudiera escribir tres campos en un menú.

## El resultado

| Ruta | Antes | Después | Delta |
|---|---|---|---|
| `/privacidad` | 787.749 B | **649.778 B** | **−137.971 B** |
| `/sedes` | 787.749 B | **649.778 B** | **−137.971 B** |
| `/` | 790.371 B | **650.245 B** | −140.126 B |

Totales sin contar el chunk de polyfills, que se sirve con `noModule` y ningún navegador del rango soportado descarga.

| Origen del ahorro | Bytes por ruta |
|---|---|
| Contenido clínico fuera del grafo de cliente | ~130.200 |
| `@next/third-parties` bajo demanda | 6.913 |
| Carrusel bajo demanda | 846 |
| **Total** | **137.971** |

Dos sondas, las dos en cero:

| Sonda | Antes | Después |
|---|---|---|
| Documentos con un chunk que contiene `paragraphs` | **25** de 26 | **0** |
| Documentos con el código del carrusel, excluyendo `/` y `/testimonios` | **23** | **0** |

## Qué se hizo

### El hallazgo principal: 158.571 B de prosa clínica en 25 rutas

`header.tsx:11-12` y `services-menu.tsx:7` llevan `"use client"` y el encabezado se monta en las 24 rutas. Importaban los barriles completos de `@/content/service-pages` y `@/content/location-pages` —153.956 B de fuente, las cinco guías clínicas y las cuatro fichas de sede— **para usar tres campos**: `page.slug`, `page.navLabel` y `page.cardSummary`.

Un paciente que abría `/privacidad` descargaba, analizaba y compilaba las cinco guías clínicas enteras.

El arreglo es `src/content/nav-index.ts`, con esos tres campos y nada más.

**Por qué escrito a mano y no derivado.** Derivarlo de los barriles reintroduce el problema: la importación arrastra el módulo entero aunque solo se lea una propiedad. Y pasarlo como props desde el servidor lo mudaría al árbol RSC serializado, o sea al HTML de las 24 rutas: sería cambiar peso de JavaScript por peso de HTML en vez de eliminarlo. El archivo sigue además el patrón que `header.tsx` ya usaba para su constante `NAV_LINKS`.

**Qué impide que se desincronice**, que es el riesgo obvio de escribirlo a mano: `service-pages/index.ts` y `location-pages/index.ts` llaman a `assertNavIndexMatches()` en tiempo de módulo. Esos barriles solo se importan desde el servidor, así que la comprobación corre en `npm run build`, una de las cinco compuertas.

Verificado rompiéndolo a propósito:

```
Error: src/content/nav-index.ts quedó desincronizado:
  - el navLabel de "hernia-discal" dice "Hernia discal ROTA" en el índice
    y "Hernia discal" en la página
```

Sale con código 1. Si alguien renombra una guía y se olvida del índice, se entera en la compuerta y no el paciente en un 404.

### El carrusel

`instagram-reels-section.tsx` es un Server Component `async`. La guía de lazy loading de la versión instalada dice que cuando un Server Component importa dinámicamente un Client Component **la división automática de código no está soportada**, así que un `dynamic()` puesto ahí no habría comprado nada.

El camino fue aislar el componente de cliente detrás de un límite propio, `reels-carousel-lazy.tsx`: un Client Component que hace el `dynamic()`, caso que sí está soportado. Sin desactivar el render en servidor, que está prohibido en toda la fase.

### `@next/third-parties`

`analytics-scripts.tsx:5` importaba `@next/third-parties/google` de forma estática dentro de un Client Component que devuelve `null` mientras el consentimiento no esté en `granted`. Arreglado con `dynamic()`, seguro sin placeholder porque `getConsentServerSnapshot()` devuelve `null`: ese componente ya renderizaba `null` en el servidor.

### Polyfills: cerrados por medición

Los 112.594 B de `next-polyfill-nomodule` se sirven con `noModule=""`, así que solo los descargan navegadores sin soporte de módulos ES. Coincide con la doc de la versión instalada. **La auditoría marcó polyfills que en la práctica nadie descarga.**

`browserslist` se declaró igual, con el default exacto de Next 16 y no más estrecho: T-18-18, y los pacientes de este sitio no son un público de navegadores recientes.

## Deviaciones del plan

### 1. El blanco de CWV-04 se recalibró dos veces, y la primera recalibración se rechazó

- **Qué pasó:** el líder de fase pidió reorientar CWV-04 a `31iarpvmym1z2.js`, atando los 70.799 B de la auditoría a ese chunk por coincidencia de peso comprimido. La atadura era correcta —70.709 B medidos, a 90 bytes— pero el chunk **es React DOM**: `hydrateRoot`, `createRoot`, `onRecoverableError`, 46 `unstable_*`, y ningún otro chunk contiene `hydrateRoot`.
- **Qué se hizo:** no se aplicó esa recalibración. Reescribir los `must_haves` contra react-dom habría codificado un criterio imposible de cumplir. Se paró, se reportó con la evidencia y se propuso el blanco real.
- **Resolución:** el líder aprobó reorientar al chunk de contenido. **El plan quedó recalibrado con react-dom explícitamente fuera de alcance y el motivo escrito**, para que nadie lo persiga después leyendo la auditoría vieja.

### 2. El ahorro del carrusel es 846 B por ruta, no 29.656 B

- **Qué decía el plan:** los 29.656 B de `0krsqwhv3zry_.js` son "código que las otras 22 rutas descargan y no pueden ejecutar".
- **Medido:** ese chunk no era el carrusel, era un chunk compartido que lo contenía entre otros módulos. Pasó de 29.656 B a 28.810 B. **El aporte propio del carrusel eran 846 B**; el resto lo usan las 22 rutas y sigue donde estaba.
- **Estado:** se cumple la aserción dura del plan, la sonda de 23 documentos a 0. No se cumple la lectura implícita de que eso liberaba 29.656 B por ruta. **El criterio no se ajustó para que coincidiera con la medición.**

### 3. Alcance ampliado, aprobado

- **Qué:** `header.tsx`, `services-menu.tsx` y `analytics-scripts.tsx` no estaban en los `files_modified` originales de este plan.
- **Por qué se pidió:** los 146 KB de prosa clínica en el chunk compartido **son** el JavaScript sin usar que CWV-04 nombra. Arreglarlo es el requisito, no una extensión.
- **Resolución:** aprobado por el líder de fase el 2026-08-24, con `files_modified` actualizado en el plan.

### 4. `@next/bundle-analyzer` se instaló y se desinstaló

- **Aprobación:** Juan, 2026-08-24. Verificada contra el registro: alcance `@next`, repositorio `git+https://github.com/vercel/next.js.git` confirmado con `npm view`, versión 16.3.2, en `devDependencies`.
- **Qué salió mal:** **no es compatible con builds de Turbopack**, que es como compila este proyecto. Con `ANALYZE=true` el build sale 0 pero no genera reporte.
- **Qué midió de verdad:** `npx next experimental-analyze -o`, que ya viene en el Next instalado y no necesita dependencia nueva, más medición directa sobre los chunks de `.next/static/chunks/` cruzados contra los documentos que los referencian. **Esa es la herramienta a usar la próxima vez en este proyecto.**
- **Resolución:** desinstalado por decisión del líder, porque dejaba una afordancia falsa. `next.config.ts` quedó **byte a byte igual a su estado previo a este plan**, con sus 5 cabeceras y sus 5 redirecciones verificadas.

## Superposición de archivos entre planes

Queda registrado para que sea trazable:

| Archivo | Dueño original | También lo tocó | Riesgo |
|---|---|---|---|
| `src/components/layout/header.tsx` | 18-04 | **18-05** | Ninguno. El cambio de 18-04 (migración de `priority`) ya estaba aplicado y cerrado antes de que 18-05 lo tocara. |
| `src/components/analytics/analytics-scripts.tsx` | 18-03 | **18-05** | Ninguno. 18-03 no tocó ese archivo: su tarea 2 cerró sin cambios de código. |

## Amenazas del registro

| ID | Estado |
|---|---|
| T-18-SC | Instalación aprobada por Juan y verificada contra el registro. El paquete terminó desinstalado. |
| T-18-16 | **Verificado.** Recorrido manual con navegador real: consola limpia y los cuatro elementos funcionando. |
| T-18-17 | HTML servido sin cambios: `/testimonios` `<img>`=2 y `<h2>`=4, `/sedes` `<h2>`=7, `/` `imageSrcSet`=2. |
| T-18-18 | `browserslist` con el default de Next, no más estrecho, con el motivo escrito. |
| T-18-19 | `next.config.ts` byte a byte igual al estado previo, con 5 cabeceras y 5 redirecciones. |

## Las cinco compuertas

Las cinco en 0 en cada commit: `build`, `content:check`, `seo:check`, `sedes:check` y `tsc --noEmit`.

## El checkpoint

Resuelto por el líder de fase el 2026-08-24, con navegador real sobre el build limpio de la rama.

**CLS: 0 en las 24 rutas.** Era el criterio duro. El cambio más riesgoso de la fase —reorganizar el grafo de módulos del encabezado, que se monta en las 24— no gastó nada.

**Hidratación: consola limpia.** Cero errores, cero advertencias, cero avisos de hidratación, ni en carga ni tras interactuar ni tras navegar.

| Elemento del recorrido | Resultado |
|---|---|
| Menú de especialidades | Abre y trae **las cinco guías con su `navLabel` y su `cardSummary` completos** |
| Botón atrás y navegación de cliente | Funciona, ida y vuelta |
| Botón flotante de WhatsApp | Presente e interactivo |
| Aviso de cookies | Presente, con Aceptar y Rechazar operativos |

El menú era lo que había que mirar: sacar 158.571 B de contenido del navegador podía dejarlo vacío o a medias. Trae las cinco especialidades con sus resúmenes, servidas desde `nav-index.ts`. **El índice escrito a mano está completo y correcto**, y `assertNavIndexMatches()` es lo que garantiza que siga estándolo.

**Accesibilidad: 1,00 en el sitio entero**, no solo en las tres rutas del plan 18-01. El `target-size` que se había anotado como sospechoso de artefacto local desapareció, lo que cerró el punto 4 de `deferred-items.md` sin esperar al deploy.

### El 0,67 de `/privacidad` era ruido: no hay regresión

En una corrida `/privacidad` midió 0,67 con 2.054 ms de TBT, cuando venía en 0,93 y 1,00. Se midió la mediana antes de llamarlo regresión, que es la disciplina que esta fase se exigió desde el principio:

| Corrida | Performance | TBT |
|---|---|---|
| 1 | 0,93 | 21 ms |
| 2 | **0,67** | **2.054 ms** |
| 3 | 0,90 | 225 ms |
| **Mediana** | **0,90** | **225 ms** |

**El 0,67 fue atípico y este plan no regresionó nada.** La lectura desde el código lo respaldaba desde el principio: después de este plan `/privacidad` es la ruta con **menos** chunks del sitio (11) y el total más bajo (649.778 B). No recibió ningún chunk nuevo ni creció en ninguno; solo perdió.

**Una sola corrida lo habría reportado como regresión de este plan.** Es la tercera vez en la fase que la regla de la mediana evita una atribución falsa.

## Qué quedó verificado y qué se difiere a producción

El entorno de medición de esta fase tiene una varianza de hasta **97×** en el TBT de
una misma ruta sin cambios de código: `/privacidad` dio 21 ms, 2.054 ms y 225 ms en
tres corridas consecutivas. Los números crudos y el análisis están en
`18-MEASUREMENT-RELIABILITY.md`.

Eso obliga a separar lo probado de lo diferido, y este SUMMARY lo hace en vez de
declarar todo cerrado:

| | Qué | Por qué es firme o no |
|---|---|---|
| **Verificado** | **137.971 B menos de JavaScript por ruta en las 24** | **No es laboratorio: son bytes servidos.** Se cuentan con `wc -c` sobre `.next/static/chunks/` cruzados con los documentos que los referencian, no con un cronómetro. Es el número central de este plan y es firme |
| **Verificado** | Las dos sondas de código muerto en cero | Aserciones deterministas sobre el build |
| **Verificado** | **CLS = 0 en las 24 rutas** | Idéntico en las tres corridas. Era el criterio duro |
| **Verificado** | Hidratación intacta | Recorrido manual con navegador real, consola limpia |
| **Verificado** | Accesibilidad 1,00 en el sitio entero | Aserciones sobre el árbol de accesibilidad, no mediciones de tiempo |
| **Diferido a producción** | "El ahorro de *Reduce unused JavaScript* es menor a 15 KB" | Es la cifra que Lighthouse estima en laboratorio. Con esta varianza no se puede verificar acá |

**La distinción importa poco en este plan y conviene decir por qué:** su criterio central se mide en bytes servidos, no en tiempo. El plan ya declaraba desde el objetivo que **no promete mejora de puntaje de Lighthouse**, así que la varianza del entorno no toca lo que este plan afirma.

## Estado del requisito

**CWV-04 cerrado.** 137.971 B menos de JavaScript por ruta en las 24, las dos sondas en cero, el CLS intacto, la hidratación verificada a mano y la sospecha de regresión descartada por mediana.

## Self-Check: PASSED

- `src/content/nav-index.ts` — FOUND
- `src/components/instagram/reels-carousel-lazy.tsx` — FOUND
- `18-BUNDLE-ANALYSIS.md` — FOUND
- Commits `34273d4`, `8e1e8bd` — FOUND
