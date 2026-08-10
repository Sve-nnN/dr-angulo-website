---
phase: 10-schema-metadata-y-limpieza-t-cnica
plan: fase completa sin planes
subsystem: seo
tags: [schema, open-graph, sitemap, llms-txt, limpieza, puerta-ejecutable]

requires:
  - phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
    provides: las cuatro guias de servicio, los cuatro posts y scripts/check-content.mjs
  - phase: 09-p-ginas-por-sede-y-cobertura-local
    provides: las cuatro paginas de sede, locationNode compartido y scripts/check-sedes.mjs
provides:
  - Imagen de Open Graph propia, dinamica y prerenderizada en las 22 rutas
  - /llms.txt generado desde las fuentes de contenido
  - /sitemap.xml con hoja XSL de marca, sin cambio en el XML que leen los rastreadores
  - scripts/check-seo.mjs, cuarta puerta ejecutable
  - Evidencia medida de que SEO-05, SEO-06 y SEO-07 ya se cumplian
affects: [fase 11 Google Business Profile y campana de resenas, pasada de titles de Juan]

tech-stack:
  added:
    - "next/og (ImageResponse), ya incluido en Next.js 16"
    - "public/fonts: Poppins 700 e Inter 400 en woff, autoalojadas"
  patterns:
    - "El titulo de la imagen OG sale del mismo lugar que la metadata de la ruta, nunca de una copia"
    - "El XML del sitemap se serializa en un route handler propio para poder inyectar la instruccion de la hoja de estilo"
    - "Toda superficie generada se valida contra el artefacto del build y contra la respuesta HTTP real"

key-files:
  created:
    - src/lib/og-card.tsx
    - src/app/opengraph-image.tsx
    - src/app/sobre-el-doctor/opengraph-image.tsx
    - src/app/servicios/opengraph-image.tsx
    - src/app/servicios/[slug]/opengraph-image.tsx
    - src/app/sedes/opengraph-image.tsx
    - src/app/sedes/[slug]/opengraph-image.tsx
    - src/app/blog/opengraph-image.tsx
    - src/app/blog/[slug]/opengraph-image.tsx
    - src/app/testimonios/opengraph-image.tsx
    - src/app/preguntas-frecuentes/opengraph-image.tsx
    - src/app/agendar/opengraph-image.tsx
    - src/app/contacto/opengraph-image.tsx
    - src/app/privacidad/opengraph-image.tsx
    - src/lib/llms-txt.ts
    - src/app/llms.txt/route.ts
    - src/app/sitemap.xml/route.ts
    - public/sitemap.xsl
    - public/fonts/Poppins-Bold.woff
    - public/fonts/Inter-Regular.woff
    - public/fonts/README.md
    - scripts/check-seo.mjs
  modified:
    - src/app/layout.tsx
    - src/components/structured-data.tsx
    - package.json
    - PRODUCT.md
  deleted:
    - src/app/sitemap.ts
    - public/dr-angulo-portrait.png

key-decisions:
  - "SEO-05, SEO-06 y SEO-07 se verificaron en vez de reconstruirse: ya se cumplian y rehacerlos habria sido trabajo inventado"
  - "Las imagenes OG se prerenderizan con generateStaticParams; se probo generateImageMetadata, que permitia un alt por slug, y se descarto porque deja las 12 imagenes de rutas dinamicas fuera del prerenderizado"
  - "El sitemap pasa a route handler propio: el serializador de Next.js no expone donde inyectar la instruccion xml-stylesheet, comprobado en el codigo de la version instalada"
  - "La hoja XSL no carga fuentes de terceros: las dos familias de marca van autoalojadas en public/fonts/"
  - "El layout deja de declarar twitter.images: con una imagen fija ahi, el twitter:image de las 21 rutas seguiria apuntando a la foto generica"
  - "La cuarta puerta no mide el largo de titles ni de descriptions, por la decision de Juan del 2026-08-10"

requirements-completed: [SEO-05, SEO-06, SEO-07, SEO-10, SEO-11]

status: complete
---

# Fase 10: Schema, metadata y limpieza técnica - Resumen

La capa de lectura automatizada del sitio queda cerrada: cada ruta comparte con su propia imagen, `/llms.txt` responde con el resumen del sitio, el sitemap se lee como una tabla en el navegador sin cambiar un byte de lo que consumen los rastreadores, el retrato antiguo salió del repo y una cuarta puerta ejecutable evita que todo esto se caiga sin que nadie se entere.

## Qué se hizo, punto por punto

### 1. SEO-05 y SEO-06: verificados, no reconstruidos

Se midió contra el HTML prerenderizado del build, no contra el código.

`BreadcrumbList` está presente en las 20 rutas anidadas y correctamente ausente en la portada, que es el primer nivel. Cada miga arranca en el eslabón "Inicio".

`hasCredential` declara CMP 83189 y RNE 35310, ambos con `recognizedBy` apuntando al Colegio Médico del Perú. `openingHoursSpecification` está en el nodo `Physician` y en los cuatro nodos de sede, con días y horas completas:

| Sede | Días | Horario |
|------|------|---------|
| Consultorio privado | viernes y sábados | 09:00 a 17:00 |
| Clínica Ricardo Palma | lunes y miércoles | 09:00 a 18:00 |
| Clínica Sanna La Molina | martes / jueves | 08:00 a 19:00 / 08:00 a 12:00 |
| Clínica Padre Luis Tezza | jueves y viernes | 14:00 a 18:00 |

**Corrección al contexto de la fase.** El `10-CONTEXT.md` anotaba como pendiente "el dato humano del horario exacto" del consultorio los viernes y sábados, y decía que la ficha mostraba "horario coordinado al agendar". Eso ya no era cierto: `src/content/locations.ts` trae el horario 09:00 a 17:00 verificado contra la ficha de Google el 2026-08-09, y el JSON-LD lo emite. No quedó ningún dato bloqueado por el doctor.

No se tocó nada de SEO-05 ni de SEO-06.

### 2. SEO-07: ya estaba resuelto en producción, se limpió el borde

El `AggregateRating` sale de la ficha de Google en vivo desde el commit `5387091`. Verificado contra el HTML que sirve producción ahora mismo:

```json
"aggregateRating":{"@type":"AggregateRating","ratingValue":5,"reviewCount":6,"bestRating":5,"worstRating":1}
```

Cinco estrellas sobre seis reseñas, que es exactamente lo que muestra la ficha. El único testimonio de `src/content/testimonials.ts`, la línea anónima de Doctoralia, sigue sin marcar, y los testimonios en video de Instagram siguen solo enlazados. Nada no verificable aparece marcado.

En local la API responde 403 porque la clave está restringida por IP al servidor de producción, y el sitio degrada a no emitir marcado. Ese es el comportamiento correcto y es la razón de que la medición previa a la fase viera cero `AggregateRating`.

Dos cosas sí estaban mal y se arreglaron:

- El comentario de cabecera de `structured-data.tsx` seguía afirmando que el sitio no emitía `Review` ni `AggregateRating`. Dejó de ser verdad en `5387091` y describía lo contrario de lo que hace el archivo.
- Producción emitía `"review": []`. La ficha tiene calificación y conteo pero ninguna reseña con texto, así que el arreglo emite la propiedad solo cuando hay algo dentro.

### 3. SEO-10: `/llms.txt`

Responde 200 con `text/plain; charset=utf-8`, 160 líneas: quién es el doctor, qué acredita, qué condiciones cubre agrupadas por especialidad, las guías clínicas con su enlace canónico, los dos abordajes quirúrgicos, las cuatro sedes con dirección, horario, teléfono y canal de cita, cómo se agenda en cada una, los artículos del blog y las preguntas frecuentes.

Todo sale de `cv.ts`, `locations.ts`, `services.ts`, `service-pages.ts`, `location-pages.ts`, `blog.ts` y `faq.ts`. No hay una sola frase de contenido escrita a mano en `src/lib/llms-txt.ts`: una sede o una guía nueva entra sola y el archivo no se puede desincronizar del sitio.

No entra al sitemap, porque el sitemap lista páginas para indexar y esto no es una página. `SITEMAP_TOTAL` sigue en 21 y no hizo falta tocarlo.

### 4. SEO-11: limpieza

`public/dr-angulo-portrait.png` borrado, 489 KB fuera del repo. Verificado: 404 en el servidor de producción local y ninguna referencia en `src/`. La mención en `PRODUCT.md` quedó actualizada para que no apunte a un archivo que ya no existe. La puerta nueva falla si el archivo vuelve.

### 5. SEO-08, parte de imagen: una tarjeta propia por ruta

Antes había un problema más grande que "todas comparten la misma imagen": las guías de servicio y los posts del blog **no declaraban ninguna**. Al fijar su propio objeto `openGraph` sin `images`, reemplazaban el del layout en vez de heredarlo, así que compartir una guía clínica por WhatsApp no mostraba nada.

`src/lib/og-card.tsx` es la plantilla única: foto real del doctor de fondo, velo teal que deja legible el texto de la izquierda y el rostro a la derecha, chip blanco con el monograma JA, rótulo de sección en dorado, título grande en Poppins y firma con nombre, CMP, RNE y dominio. Franja dorada de remate abajo, la misma de la hoja del sitemap.

Cada segmento tiene su `opengraph-image.tsx`. Las rutas estáticas importan el `metadata` de su propio `page.tsx` y leen el título de ahí; las dinámicas lo leen de la misma fuente de contenido que usa `generateMetadata`. Cuando Juan reescriba los titles, las 22 imágenes se regeneran solas en el build siguiente sin que haya que tocar nada acá. El tamaño de la tipografía se escalona por largo del título, así el de 85 caracteres entra igual que el de 24.

Las 22 se prerenderizan en el build, verificado contra `prerender-manifest.json`.

### 6. Hoja de estilo del sitemap

`/sitemap.xml` ahora incluye la instrucción `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>` y el navegador muestra una tabla legible con el logo, el conteo de páginas y las 21 URLs con su fecha, frecuencia y prioridad. Google y el resto de rastreadores leen el mismo XML de antes.

El detalle que advertía el contexto es real: el serializador de `app/sitemap.ts` vive dentro de Next.js, escribe la cabecera del XML él mismo y no expone ningún punto donde inyectar la instrucción. Se leyó el código de la versión instalada (`build/webpack/loaders/metadata/resolve-route-data.js`) antes de decidir. Por eso el XML pasó a un route handler propio en `src/app/sitemap.xml/route.ts`.

La salida es **idéntica byte a byte** a la que sirve producción hoy, salvo la línea de la hoja de estilo. Se comprobó descargando el sitemap de `drangulocolumna.com` y comparándolo con el del build local.

La hoja respeta la identidad del sitio: paleta teal y dorada, Poppins e Inter, COLOR-01 vigente, tabla accesible con `caption`, `th scope="col"` y foco visible de 3px. Las tipografías van autoalojadas en `public/fonts/` porque la hoja se aplica fuera del árbol de React y `next/font` emite rutas con hash por build. No hay ninguna petición a terceros, coherente con cómo carga fuentes el resto del sitio.

### 7. Cuarta puerta ejecutable

`scripts/check-seo.mjs`, con `npm run seo:check`. Cubre migas de pan, credenciales y horarios del grafo raíz, que ninguna calificación se pueda escribir a mano en el código, imagen de Open Graph propia y prerenderizada por ruta, `/llms.txt`, el retrato borrado y la hoja del sitemap. Deriva la lista de rutas del propio sitemap, así una página nueva entra sola.

No mide el largo de titles ni de descriptions, a propósito y por la decisión de Juan del 2026-08-10.

Se probó que la puerta falla de verdad: quitándole la instrucción de la hoja de estilo al sitemap del build y apuntando el `og:image` de `/testimonios` a la imagen compartida, reportó las tres fallas correspondientes.

## Verificación

Build limpio desde cero, `tsc`, `eslint` y las cuatro puertas:

| Comprobación | Resultado |
|---|---|
| `npm run build` | sin errores |
| `npx tsc --noEmit` | sin errores |
| `npm run lint` | sin errores ni avisos |
| `npm run content:check` | sin fallas en 8 rutas |
| `npm run sedes:check` | sin fallas en 4 sedes |
| `npm run seo:check` | sin fallas, 22 rutas |

Respuestas HTTP reales contra `next start`, no contra el build:

| Ruta | Estado | Tipo |
|---|---|---|
| `/sitemap.xml` | 200 | `application/xml`, 21 URLs, con la instrucción de la hoja |
| `/sitemap.xsl` | 200 | `application/xml` |
| `/llms.txt` | 200 | `text/plain; charset=utf-8` |
| `/opengraph-image` | 200 | `image/png` |
| `/servicios/hernia-discal/opengraph-image` | 200 | `image/png` |
| `/fonts/Poppins-Bold.woff` | 200 | `font/woff` |
| `/dr-angulo-portrait.png` | 404 | borrado |

La hoja XSL se validó con `xsltproc` sobre el XML del build, que además detectó un error real (un comentario XML no admite dos guiones seguidos y el encabezado citaba nombres de variables CSS), y se abrió en Chrome contra el servidor real para revisar cómo se ve.

Las tarjetas de Open Graph se revisaron una por una en imagen: título más largo, título más corto, guía clínica, sede y artículo.

## Desviaciones respecto del encargo

1. **`twitter.images` sale de `layout.tsx`.** No estaba en el encargo. Con una imagen fija declarada ahí, el `twitter:image` de las 21 rutas seguía apuntando a la foto genérica y pisaba la tarjeta propia de cada una. No es un title ni una description. Al quitarla, Next.js completa `twitter:image` con la imagen generada de cada ruta.
2. **Se agregó una cuarta puerta ejecutable.** El encargo no la pedía. Cubre solo lo que esta fase entrega y nace en verde. No es la puerta de longitud de metadata, que sigue fuera de alcance.
3. **Dos archivos de fuente entran al repo** (`public/fonts/`, 205 KB en total, ambas bajo SIL OFL). Los necesitan la hoja XSL y el generador de imágenes, dos superficies que no pueden usar `next/font`.
4. **`PRODUCT.md` tocado en una línea**, la que describía el retrato borrado como "ya sin uso".
5. **`src/app/sitemap.ts` desaparece** y su contenido vive en `src/app/sitemap.xml/route.ts`. Era la única forma de inyectar la instrucción de la hoja de estilo.

## Lo que no se hizo, y por qué

- **Titles y descriptions:** fuera de alcance por decisión de Juan del 2026-08-10. No se tocó ni uno. La medición de las 15 rutas con title largo y las 8 con description larga sigue registrada en `10-CONTEXT.md`.
- **Puerta de longitud de metadata:** fuera de alcance por la misma razón. Nacería roja en 17 rutas.
- **Reconstruir SEO-05, SEO-06 y SEO-07:** ya se cumplían. Se verificaron y se dejó constancia.

## Cosas que conviene tener presentes

- **Las imágenes OG pesan alrededor de 540 KB cada una.** `ImageResponse` solo emite PNG, que es sin pérdida, y el fondo es una fotografía. Está muy por debajo del límite de 8 MB de Facebook y del de 5 MB de X, y no afecta la velocidad de ninguna página porque no se cargan desde el sitio. Si alguna vez molesta, la única palanca real es cambiar el fondo fotográfico por uno plano.
- **Chrome viene anunciando desde 2025 que quiere retirar XSLT del navegador.** Hoy funciona, y se verificó en Chrome. Si algún día deja de aplicarse, `/sitemap.xml` vuelve a verse como XML crudo y no pasa nada más: el XML, el `content-type` y las 21 URLs no dependen de la hoja, y ningún rastreador la lee.
- **La clave de Places API está restringida por IP al servidor de producción.** En local siempre responde 403 y el marcado de reseñas no se emite. Es lo correcto, pero conviene saberlo antes de concluir que algo se rompió.
- **Nada se desplegó.** Los cinco commits quedan locales, en `main`, sin push, como se pidió.

## Commits

| Hash | Qué |
|---|---|
| `f655a81` | Borrar el retrato antiguo sin uso (SEO-11) |
| `441e9c0` | Publicar `/llms.txt` generado desde las fuentes de contenido (SEO-10) |
| `2d4be83` | Hoja XSL para que `/sitemap.xml` se lea como una tabla |
| `d173766` | Imagen de Open Graph propia y dinámica por ruta (SEO-08) |
| `f970653` | Cuarta puerta ejecutable y limpieza del marcado de reseñas |

## Seguimiento posterior, no bloquea

- Confirmar en la SERP que Google muestra la miga de pan. Depende de que rastree e indexe, no del código.
- Confirmar cómo cachea WhatsApp las imágenes nuevas al compartir una URL por primera vez.
- Pasada de titles y descriptions de Juan, y recién después la puerta de longitud.
