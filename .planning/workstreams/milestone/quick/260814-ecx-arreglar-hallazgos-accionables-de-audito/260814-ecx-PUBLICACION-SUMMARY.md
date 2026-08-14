---
phase: 260814-ecx
plan: 02
subsystem: contenido-clinico
tags: [contenido-medico, aud-11, señales-de-alarma, publicacion]
status: complete
requires:
  - src/content/drafts/senales-de-alarma.ts
  - src/content/service-pages/hernia-discal.ts
  - src/content/blog/lumbalgia.ts
  - scripts/check-content.mjs
provides:
  - "bloque de señales de alarma publicado en /servicios/hernia-discal y /blog/lumbalgia"
  - "ancla compartible #senales-de-alarma en las 2 rutas"
  - "BlogSection admite items, el mismo modelo de tarjetas que las guías"
  - "src/content/drafts/ vacío y borrado, con su aserción de la puerta intacta"
affects:
  - src/content/blog/index.ts
tech-stack:
  added: []
  patterns:
    - "el borrador clínico se publica moviendo su cuerpo campo a campo, sin reescritura"
    - "bannerAfterSectionId de nivel 3 cuando ninguna frontera de nivel 2 cae en la ventana de POS-01"
    - "la aserción de la puerta sobrevive al borrador que la motivó"
key-files:
  created: []
  modified:
    - src/content/service-pages/hernia-discal.ts
    - src/content/blog/lumbalgia.ts
    - src/content/blog/index.ts
  deleted:
    - src/content/drafts/senales-de-alarma.ts
decisions:
  - "Los 4 signos entran como items, no como 4 subsecciones de nivel 3: es un mapeo 1 a 1 con el borrador y no obliga a inventar 4 anclas"
  - "El cierre va en un nivel 3 titulado Qué hacer porque los párrafos de una sección se renderizan antes que sus tarjetas"
  - "El bloque va delante de cuando-consultar en las 2 rutas: es la única posición contigua que no es el cierre"
  - "El banner de hernia discal se mueve a un id de nivel 3 en vez de aflojar el rango de POS-01"
  - "BlogSection reutiliza ServiceSectionItem en vez de declarar un tipo gemelo"
metrics:
  duration: ~50 min
  completed: 2026-08-14
  tasks: 4
  files-changed: 4
  commits: 3
---

# Publicación del bloque de señales de alarma

El texto clínico que la auditoría marcó como el hueco más grave del silo
(AUD-11) dejó de ser un módulo sin importadores y pasó a las dos rutas para las
que estaba escrito. El doctor lo aprobó el 2026-08-14 sin cambios, y se publicó
sin cambios: los 11 fragmentos del borrador aparecen carácter por carácter en
los dos módulos de contenido.

## Qué se hizo

**El bloque, en las 2 rutas de `targetRoutes`.** Una sección de nivel 2 con
ancla `senales-de-alarma`, encabezado "Señales que no esperan una cita", el
párrafo de entrada, los cuatro signos como tarjetas y el cierre en una
subsección `senales-de-alarma--que-hacer`. Va delante de `cuando-consultar` en
las dos páginas.

**Los signos van en `items`.** `ServiceSection` ya tenía el campo para listas de
rótulo y cuerpo, y `ServiceItemGrid` ya las renderizaba: el `signs: { title,
body }[]` del borrador encaja sin conversión. Es un mapeo campo a campo, no una
estructura nueva. Ningún módulo de contenido lo usaba todavía, así que estas dos
páginas son las primeras que lo estrenan.

**`BlogSection` gana `items`, opcional.** `ContentBody` ya renderizaba tarjetas
para los dos modelos porque su `ContentSection` es `ServiceSection`; lo que
faltaba era que el tipo del post dejara declararlas. Se reutiliza
`ServiceSectionItem` en vez de declarar uno gemelo, para que los dos modelos no
se separen sin que nadie se entere. Las plantillas no se tocaron.

**El borrador se borró, la aserción se quedó.** `src/content/drafts/` quedó
vacío y salió del repo. Las líneas 553 a 654 de `scripts/check-content.mjs`
siguen enteras.

## Posición del bloque

El borrador pedía "junto a `cuando-consultar`, no al cierre". En hernia discal
`cuando-consultar` es la última sección y en lumbalgia es la última de nivel 2,
así que colocarlo después habría sido exactamente el cierre que el borrador
descarta. Va delante en las dos, que es la única posición contigua que cumple
las dos condiciones a la vez. De paso el orden queda ordenado de mayor a menor
urgencia: primero lo que no espera, después lo que sí.

## Desviaciones del plan

### 1. [Regla 3 - Bloqueante] El banner de hernia discal se salió de la ventana de POS-01

**Encontrado en:** tarea 1, midiendo la puerta antes de escribir.

**Problema:** la puerta exige que el banner de conversión caiga entre el 15 y el
35 por ciento del cuerpo. Hernia discal estaba en el 15,9 por ciento, a un pelo
del piso. Sumarle 411 palabras al cierre lo empujaba al 13,8 y la puerta
fallaba. Y no había frontera de nivel 2 que sirviera: detrás de `que-es` cae en
el 13,8 y detrás de `sintomas` en el 35,3, los dos bordes por fuera.

**Arreglo:** `bannerAfterSectionId` pasa de `que-es` al id de nivel 3
`sintomas--cuales-son-los-sintomas-de-una-hernia-de-disco`. El campo admite
nivel 3 justamente para este caso, documentado en su propio docblock. Queda en
el 22,1 por ciento, en el centro del rango. Editorialmente es mejor punto que el
anterior: el banner pregunta "¿Tu dolor baja por la pierna?" y ahora aparece
justo después de la lista que abre con "Dolor que baja por la pierna o por el
brazo".

**Archivos:** `src/content/service-pages/hernia-discal.ts`
**Commit:** 4d7e051

Lumbalgia no necesitó nada: su banner pasó del 31,9 al 25,8 por ciento y siguió
dentro del rango.

### 2. `BlogSection` tuvo que ganar un campo

**Problema:** el plan daba por hecho que las dos rutas admitían la misma
estructura. `ServiceSection` tiene `items`; `BlogSection` no lo declaraba, y sin
el campo TypeScript rechaza la propiedad por exceso.

**Arreglo:** `items?: ServiceSectionItem[]` en `BlogSection`. Es un
ensanchamiento opcional, no rompe ningún post existente y no toca ninguna
plantilla.

**Archivos:** `src/content/blog/index.ts`
**Commit:** 34db439

### 3. Un encabezado que no venía en el borrador

`SectionBody` renderiza los párrafos de una sección antes que sus tarjetas. El
borrador cierra con `whatToDo` después de los signos, y ese orden es el que la
propia anotación del campo llama innegociable ("Cierra el bloque y es la parte
que no se puede suavizar"). Dejarlo en `paragraphs` lo habría puesto delante de
los cuatro signos.

Va entonces en una subsección de nivel 3, y una subsección necesita encabezado.
Se usó "Qué hacer", que es la etiqueta que el propio borrador le da al campo en
su comentario, no una redacción nueva. Es lo único escrito que no sale literal
del texto aprobado, y es rótulo de navegación, no contenido clínico.

## Manifiesto de las puertas

Sin cambios: `/servicios/hernia-discal` y `/blog/lumbalgia` ya estaban en el
`MANIFEST` de `check-content.mjs`. `SITEMAP_TOTAL` tampoco se movió, porque no
hay URL nueva. La puerta midió el cuerpo nuevo por sí sola.

## Verificación

**Las 6 puertas, en verde con el directorio de borradores ausente:**

| Puerta | Resultado |
| --- | --- |
| `npm run build` | sin errores |
| `npx tsc --noEmit` | sin errores |
| `npm run lint` | sin errores |
| `npm run content:check` | sin fallas en 14 rutas |
| `npm run sedes:check` | sin fallas en 4 sedes |
| `npm run seo:check` | sin fallas |

**Cuerpo medido por la puerta:**

| Ruta | Antes | Después | Banner |
| --- | --- | --- | --- |
| `/servicios/hernia-discal` | 2806 | 3217 | 15,9% → 22,1% |
| `/blog/lumbalgia` | 1737 | 2148 | 31,9% → 25,8% |

**HTML prerenderizado.** En las dos rutas está el `h2 id="senales-de-alarma"`
con `tabindex="-1"`, su entrada en la tabla de contenidos con el mismo texto, el
`h3 id="senales-de-alarma--que-hacer"`, y los 8 fragmentos de prueba del cuerpo.
El orden de encabezados confirma que el bloque va delante de `cuando-consultar`
y no al cierre.

**Fidelidad del texto.** Se extrajeron los literales del borrador desde el blob
de git de 1a39f54 y se compararon contra los dos módulos publicados: los 11
fragmentos son idénticos, en las dos rutas.

**La aserción de borradores, probada en los 3 caminos** (con un borrador de
prueba temporal, ya borrado):

1. Borrador sin aprobar cuyo texto aparece en el HTML → falla, y nombra las dos
   páginas y la frase.
2. Un archivo de `src/app/` que referencia `content/drafts` → falla.
3. Borrador sin aprobar, sin publicar y sin importadores → pasa, sin falso
   positivo.

Con el directorio ausente la puerta pasa: `filesUnder` devuelve una lista vacía
si la carpeta no existe y `checkDrafts` sale temprano. No se rompe por falta de
directorio, y vuelve a morder en cuanto aparezca el próximo borrador.

## Reglas de contenido

El texto ya las respetaba y se conservaron al moverlo: ni una cifra en dígitos
en todo el bloque, ningún plazo garantizado, ninguna construcción en primera
persona sobre casos, y ninguna credencial fuera de `src/content/cv.ts`. Las
tarjetas de `ServiceItemGrid` ponen el rótulo en un `<p>` con clase, no en
`<strong>` ni `<b>`, así que la comprobación de énfasis fuerte de las páginas de
servicio sigue pasando.

## Observaciones de redacción (no se cambió nada)

Dos cosas que se detectaron al ubicar el bloque. Se dejan escritas y no se
tocaron, porque el texto está aprobado y la corrección le corresponde al doctor:

1. **Solapamiento con `cuando-consultar`.** En las dos rutas, la sección que
   sigue al bloque nuevo vuelve a enumerar los mismos tres signos urgentes
   ("pérdida de fuerza que avanza", "adormecimiento en la zona de la entrepierna
   y los genitales", "dificultad para controlar la orina o la deposición"). El
   lector los lee dos veces seguidas con distinta redacción. Es redundancia, no
   contradicción: las dos versiones dicen lo mismo. Si se quiere resolver, lo
   natural sería recortar esa enumeración de `cuando-consultar` y dejar que el
   bloque nuevo la cubra, pero eso es editar texto ya publicado y necesita
   revisión médica.

2. **El cuarto signo menciona la hernia dentro del post de lumbalgia.** "El
   dolor de una hernia suele bajar por una sola pierna" se lee natural en la
   guía de hernia discal y algo fuera de contexto en un post sobre lumbalgia,
   donde la hernia no se ha presentado todavía en ese punto de la página. El
   post enlaza a la guía y la frase se entiende igual, así que no es un error;
   es un roce de contexto que solo se ve al leer las dos páginas seguidas.

## Commits

| Commit | Qué |
| --- | --- |
| 4d7e051 | `feat(ecx-05)`: publicar las señales de alarma en la guía de hernia discal |
| 34db439 | `feat(ecx-05)`: publicar las señales de alarma en el post de lumbalgia |
| 42afecd | `chore(ecx-05)`: borrar el borrador de señales de alarma, ya publicado |

El primero lleva también el `approvedByPhysician: true` sobre el borrador. Va
junto con la primera publicación a propósito: separarlo dejaba un commit
intermedio donde el texto ya estaba en el HTML con la aprobación todavía en
`false`, y la puerta habría fallado en ese punto de la historia.

## Self-Check: PASSED

Los 3 commits existen en `git log`. Los 3 archivos modificados existen en disco.
`src/content/drafts/` no existe y `scripts/check-content.mjs` conserva
`DRAFTS_DIR`, `checkDrafts` y su llamada desde `main`.
