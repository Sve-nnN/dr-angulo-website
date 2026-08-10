# Tipografías de marca en formato de archivo

Estos dos archivos existen porque hay dos superficies del sitio que no pueden
usar `next/font`:

- `public/sitemap.xsl`, la hoja de estilo del sitemap. El navegador la aplica
  fuera del árbol de React, así que declara las fuentes con `@font-face` contra
  estas rutas.
- `src/lib/og-card.tsx`, que genera las imágenes de Open Graph. `ImageResponse`
  necesita los bytes de la fuente y solo admite `ttf`, `otf` y `woff`.

El resto del sitio sigue cargando Poppins e Inter con `next/font/google`, que las
autoaloja con su propio hash por build. Esas rutas con hash cambian en cada
build y por eso no se pueden enlazar desde un archivo estático.

Origen: Google Fonts, Poppins v24 (peso 700) e Inter v20 (peso 400), en el
formato `woff` que sirve la propia API de Google. Ambas familias están bajo la
SIL Open Font License 1.1, que permite redistribuirlas dentro del proyecto.

Si se actualizan, hay que actualizar las dos superficies de arriba: la hoja XSL
por el nombre del archivo y el generador de OG por la ruta que lee del disco.
