# Tarjetas de Open Graph

Cada una de las 24 rutas comparte por WhatsApp su propia tarjeta de 1200x630, con
el título de esa página, su rótulo de sección y la foto del doctor.

## Cómo funciona

El lienzo lo dibuja `src/lib/og-card.tsx` con Satori y el título lo lee de la
misma fuente que `generateMetadata`, así que no hay una segunda copia del texto
que se pueda desincronizar.

Lo que se sirve, en cambio, no es el PNG que sale de Satori sino un JPEG
pregenerado que vive en `public/og/`. El PNG de la portada pesaba 551 KB, que es
lo que reportó el issue #14: WhatsApp, que es el canal principal del consultorio,
tarda en armar la vista previa con imágenes así de pesadas. Las mismas tarjetas
en JPEG con mozjpeg y calidad 82 pesan entre 48 y 56 KB, sin diferencia visible.

```
npm run og:build
```

Ese comando levanta `next dev` con `OG_GENERATE=1`, le pide cada tarjeta, la
convierte con sharp y escribe:

- `public/og/<llave>.jpg`, una por ruta
- `public/og/manifest.json`, con la llave, la ruta, el rótulo, el título y el peso

Los archivos se versionan en el repositorio. Escribirlos después de `next build`
no serviría: Vercel recoge `public/` durante el build.

La lista de tarjetas no está escrita en ningún lado. El script la arma con el
sitemap del propio sitio más las rutas `noindex`, y cada tarjeta le dice su
llave y su texto por las cabeceras `x-og-*`. Agregar una página no obliga a
tocar el script.

## Cuándo hay que regenerar

Cada vez que cambie un title, un rótulo de sección o el diseño del lienzo.

Olvidarse no rompe en silencio: `og-card.tsx` compara el título de la ruta contra
el del manifiesto y, si no coinciden, `npm run build` falla con la llave, los dos
textos y el comando que hay que correr. Es a propósito. Servir el PNG en caliente
como plan B mostraría una tarjeta con el título viejo sin que nadie se entere.

## Qué vigila la puerta

`npm run seo:check` mide, sobre los artefactos del build y no sobre
`public/og/`, que cada ruta declare su propia imagen, que ninguna repita la de
otra, que declare `og:image:type: image/jpeg` y que ninguna pase de 200 KB, que
es el techo del issue #14. Si alguien vuelve a servir el PNG de Satori, el peso
lo delata.

El propio `og:build` aplica el mismo techo antes de escribir el manifiesto y
borra las tarjetas de rutas que ya no existen.

## Agregar una tarjeta a una ruta nueva

1. Crear `opengraph-image.tsx` en el segmento, copiando el de una ruta parecida.
2. Pasarle a `renderOgCard` una `key` que no use ninguna otra ruta. Para rutas
   con `[slug]`, la convención es `<segmento>-${slug}`.
3. Correr `npm run og:build` y versionar el JPEG y el manifiesto.

Una ruta sin `opengraph-image.tsx` propio hereda la tarjeta de su segmento
padre, que es lo correcto para páginas sin identidad propia.
