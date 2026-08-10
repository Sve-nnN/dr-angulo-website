# Phase 5: Material real del doctor y feed de Instagram - Context

**Gathered:** 2026-08-08
**Status:** Executed (backfill de documentación tras ejecución directa)
**Mode:** Auto-generated (ejecución directa en sesión con Juan, sin discuss interactivo)

<domain>
## Phase Boundary

Reemplazar el material placeholder por el material real que entregó el doctor (fotos profesionales de consultorio, logo oficial, datos de formación y procedimientos) y sumar un feed automático de sus reels de Instagram en Home y Testimonios.

Fuera de la fase: producir contenido nuevo de blog, tocar el deploy, o cambiar la arquitectura del sitio.

</domain>

<decisions>
## Implementation Decisions

- **Fotos en AVIF.** Las tres fotos profesionales (`WhatsApp Unknown Aug 8 2026.zip`) se convirtieron a AVIF a 1400 px de lado mayor, ~51-58 KB cada una contra los ~200 KB del JPG equivalente. Decisión explícita de Juan.
- **Excepción a AVIF: la imagen social y los iconos.** `og-dr-angulo.jpg` (1200x630) queda en JPG porque varios scrapers de redes todavía no leen AVIF, y `icon.png`/`apple-icon.png` siguen en PNG porque los navegadores no aceptan AVIF de favicon.
- **Logo oficial recortado por programa.** `images/logo.jpeg` venía cuadrado y con márgenes blancos grandes. Se detectó el bounding box del contenido y el corte entre símbolo y texto por análisis de píxeles (PIL), no a ojo: el símbolo JA sale centrado en un lienzo cuadrado (`logo-icon-square`) y la versión con wordmark queda como `logo-dr-angulo`. El retrato anterior (`dr-angulo-portrait.png`) era un frame de video con marca de agua y quedó sin uso.
- **Nada de credenciales inventadas.** Toda la biografía nueva sale de lo que el doctor confirmó por escrito el 2026-08-08. Los cursos internacionales se mencionan de forma genérica porque todavía no pasó nombres ni fechas.
- **Reels vía API oficial de Instagram, no widget de terceros.** Se evaluaron tres opciones con Juan (API directa, servicio tipo Behold.so, lista curada manual). Eligió la API directa: costo cero y sin dependencia de un tercero, a cambio de tener que renovar el token cada 60 días, que se automatiza con un endpoint + cron.
- **Tarjetas con portada y caption, sin embed.** También decisión de Juan: el video se abre en Instagram. Evita cargar el script de embed de Instagram, que sumaría cookies de terceros al banner de consentimiento y bastante peso.
- **Degradación explícita.** Sin token o con la API caída, `getInstagramReels` devuelve `[]` y la sección cae en una tarjeta que lleva al perfil. El sitio nunca se rompe por el feed.
- **Token persistido en volumen, no solo en env.** `INSTAGRAM_TOKEN_FILE` apunta a un volumen de Dokploy; el endpoint de refresh escribe ahí el token renovado. Sin volumen el sitio funciona igual, pero cada deploy vuelve al token de la variable de entorno.

</decisions>

<code_context>
## Existing Code Insights

La fase se apoya en todo lo anterior: `siteConfig` (Phase 1) para NAP/redes, `src/content/cv.ts` y `services.ts` (Phase 2) para el contenido estructurado, `src/lib/tracking.ts` (Phase 3) para el evento nuevo `instagram_reel_click`, y `structured-data.tsx` (Phase 3) donde se sumaron `alumniOf` e `image`.

El carrusel obligó a partir el módulo de Instagram en dos: `src/lib/instagram.ts` toca `node:fs` para el token y por eso es solo de servidor, mientras que los tipos y el helper `reelTitle` viven en `src/lib/instagram-shared.ts` para que el componente cliente pueda importarlos sin arrastrar `fs` al bundle.

</code_context>

<specifics>
## Specific Ideas

- Material recibido: `../images/logo.jpeg` y `../images/WhatsApp Unknown Aug 8 2026.zip` (3 fotos de consultorio).
- Datos confirmados por el doctor: 15 años de experiencia, traumatólogo por la Universidad de Oriente, especialización de columna en el Instituto de Columna de Caracas (Hospital de Clínicas Caracas), cursos y entrenamientos nacionales e internacionales, procedimientos convencionales y mínimamente invasivos para deformidades (escoliosis), enfermedad degenerativa y procesos inflamatorios.
- Publicación de testimonios en video: https://www.instagram.com/p/CoE2FSWOJgR/ (Instagram bloquea el scraping, por eso se enlaza en vez de citarse).

</specifics>

<deferred>
## Deferred

- **Vinculación de la cuenta de Instagram**: requiere que la cuenta sea Profesional, una app en Meta for Developers y la autorización del doctor. Paso a paso en `docs/instagram-reels.md` y en `05-VERIFICATION.md` § Human Verification Required.
- **Nombres y fechas de los cursos internacionales** para ampliar la sección de Formación.
- **Testimonios citables**: si el doctor comparte los videos o el texto de los testimonios, se pueden citar directamente en vez de solo enlazarlos.

</deferred>
