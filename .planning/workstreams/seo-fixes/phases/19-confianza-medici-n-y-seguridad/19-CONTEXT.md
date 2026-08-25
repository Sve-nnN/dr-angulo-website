# Phase 19: Confianza, medición y seguridad - Context

**Gathered:** 2026-08-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Las páginas hub tienen algo propio que ofrecer, el contenido clínico se apoya en fuentes verificables, y el rendimiento del sitio se puede leer de un vistazo sin riesgos abiertos.

Entra: contenido propio en `/blog` y `/sedes` (TRUST-01), citas médicas externas en las guías y los posts (TRUST-02), la decisión sobre los UTM del perfil de Google Business (MEAS-01) y la Content-Security-Policy en modo Report-Only (MEAS-02). Entra además la limpieza de los cinco archivos de `seo-tools/data/` que quedaron con los slugs viejos del blog.

No entra: rediseño, contenido clínico nuevo más allá de las citas, ni la configuración de la ficha del GBP en sí.

</domain>

<decisions>
## Implementation Decisions

### Contenido propio en los hubs
- El texto nuevo vive en módulos propios, `hub-blog.ts` y `hub-sedes.ts` en `src/content/static-pages/`, siguiendo el patrón que ya usa `hub-servicios.ts`. **Hoy los dos hubs se arman inline en su `page.tsx`**, a diferencia del hub de servicios: esta fase los alinea con el patrón existente.
- `/blog` explica qué se publica ahí y con qué criterio, en la voz del doctor. **Sin promesas de frecuencia de publicación**: una promesa que el consultorio no pueda sostener envejece mal y queda visible.
- `/sedes` explica cómo elegir sede: por zona, por días de atención, por cobertura. No repite lo que ya dice `/agendar`.
- Objetivo: `/blog` por encima de 400 palabras, `/sedes` por encima de 500. Punto de partida medido el 2026-08-25 contra producción: **229 y 275 palabras**.

### Citas médicas
- Fuentes: sociedades de columna y guías clínicas. Candidatas: North American Spine Society, GEER (Sociedad Española de Columna Vertebral), revisiones Cochrane, y material publicado de la sociedad peruana de ortopedia si existe y es verificable.
- Se renderizan en una sección "De dónde sale esto" al pie de cada página de condición, no como notas al pie inline.
- Dos o tres por página, y **cada una respalda una afirmación concreta del texto**. Ninguna cita decorativa.
- Alcance: las 5 guías de `/servicios/*` y los 5 posts del blog.

**Regla no negociable, por ser contenido médico de un profesional real:**
- **Cada URL se verifica que resuelva antes de publicarla.** Una cita rota en un sitio médico es peor que ninguna cita.
- **Ninguna cita puede respaldar una afirmación que el texto no hace.** Si la fuente dice más que el texto, se cita igual pero no se amplía el texto para alcanzarla.
- No se citan competidores directos en Lima.
- Se mantiene la convención del repo: voz explicativa, nunca testimonial. Prohibido: cifras de cirugías, tasas de éxito, plazos garantizados, precios.

### UTM del perfil de Google Business
- **Se quitan del enlace del GBP.** Hoy parten el informe de Search Console en dos: 778 de las 892 impresiones del sitio están en URLs con UTM, que figuran como páginas separadas.
- El canal se mide por el informe propio de Google Business, que ya cuenta clics al sitio.
- **Lo aplica Juan en la ficha.** Esta fase entrega la decisión escrita y la línea base de impresiones partidas, para poder verificar la consolidación a 30 días.
- Recordatorio del reparto entre workstreams: este workstream decide y mide; la configuración de la ficha (horarios, categorías, reseñas) es de la fase 11 del workstream `milestone`.

### Content-Security-Policy
- **La fase 19 entrega `Content-Security-Policy-Report-Only` con endpoint de reportes, más el procedimiento escrito para pasar a enforce. No entrega el enforce.**
- Motivo, y está documentado en el propio `next.config.ts` desde antes de esta fase: el sitio carga la fuente y los mapas de Google, el pixel de Meta, GA4 y las portadas de los reels desde el CDN de Instagram. Una política mal calibrada rompe producción en silencio, que es peor que no tenerla. El plan de tres pasos que ese comentario describe —report-only, observar tráfico real, enforce— **tiene un paso que no se puede acelerar**: observar necesita días de tráfico.
- El issue #17 se cierra con la report-only desplegada y el procedimiento documentado. El enforce queda como tarea de seguimiento con fecha.
- Antes de escribir la política hay que **investigar los issues de CSP que Lighthouse reportó** en `/agendar`, `/servicios/escoliosis-y-deformidades` y `/servicios/estenosis-espinal`. Si ya existe una CSP parcial en algún lado (meta tag, configuración de Cloudflare), puede estar bloqueando chunks legítimos.

### Limpieza pendiente
- Los cinco archivos de `seo-tools/data/` que conservan los slugs viejos del blog: `url-map.jsonl`, `internal-links.json`, `copy-blog.json`, `onpage.json`, `canonicals.json`. Vienen del code review de la fase 16 (IN-04) y quedaron sin dueño.

### Claude's Discretion
- Redacción concreta del texto de los hubs y de las líneas de contexto de cada cita.
- Qué directivas concretas lleva la CSP report-only, dentro de lo que la investigación de los orígenes reales determine.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/content/static-pages/hub-servicios.ts` es el patrón a replicar para los dos hubs nuevos. `types.ts` en esa carpeta define el modelo.
- `next.config.ts` ya declara cinco cabeceras de seguridad en `headers()` y documenta en un comentario largo por qué falta CSP y cuál es el plan de tres pasos. **Ese comentario es la especificación de MEAS-02**: no lo contradigas, cumplilo.
- Las páginas de condición ya tienen un modelo de secciones con `id` escrito a mano. La sección de citas es una sección más, con su `id` propio.

### Established Patterns
- Los `id` de sección se escriben a mano y **nunca se cambian**: son anclas compartibles.
- `scripts/check-content.mjs` impone `MIN_WORDS = 900` por ruta del `MANIFEST` y compara el esqueleto de anclas por `format`. **Agregar una sección a las páginas de condición cambia ese esqueleto**: hay que actualizar el `SKELETONS` correspondiente en la misma tarea que agrega la sección, no en una posterior.
- Cinco compuertas: `content:check`, `seo:check`, `sedes:check`, `tsc --noEmit`, `build`. Las cinco en 0 en cada commit.

### Integration Points
- `SITEMAP_TOTAL` vive en **tres** scripts: `check-content.mjs`, `check-seo.mjs` y `check-sedes.mjs`. Lección de la fase 16: se descubrió tarde porque ningún plan corría `sedes:check`.
- Cloudflare está delante del origen y puede filtrar o reescribir cabeceras. Que la CSP salga del origen no garantiza que llegue al navegador: se comprueba con `curl -sI` contra producción después del deploy.

</code_context>

<specifics>
## Specific Ideas

- Tres lecciones de método de las fases 16 y 18, que aplican como criterio de planificación:
  1. **Ninguna constante o declaración de compuerta se actualiza en una tarea posterior a la que rompe su invariante.** Apareció tres veces en la fase 16.
  2. **Una compuerta que ningún plan corre es la que se rompe en silencio.** `sedes:check` estuvo en rojo cuatro commits.
  3. **Una sola medición no distingue señal de ruido.** En la fase 18, tres corridas sin cambios de código dieron TBT de 21, 2.054 y 225 ms en la misma ruta. Cualquier criterio que dependa de un número medido exige mediana de tres corridas.
- Línea base de impresiones para MEAS-01, medida el 2026-08-23: 892 impresiones totales, de las cuales 778 en URLs con UTM (673 en la portada, 75 en `/servicios`, 30 en `/agendar`).
- El canonical de las URLs con UTM ya apunta a la versión limpia, así que **no hay riesgo de contenido duplicado**. Lo que se arregla es el reporte partido, no la indexación.

</specifics>

<deferred>
## Deferred Ideas

- **El enforce de la CSP**: queda como tarea de seguimiento. Necesita días de tráfico real con la report-only desplegada.
- **CWV-05, la imagen OpenGraph**: diferido a cargo de Juan desde el 2026-08-24.
- **CWV-01, la Cache Rule de Cloudflare**: es de la fase 18 y la aplica Juan. El issue #7 sigue abierto.
- Que el umbral de `FAQPage` viva en una sola de las dos superficies que emiten el bloque: viene del review de la fase 16, no es de esta fase.
- Diferenciar el cromo de aside y pie que se repite en las cuatro fichas de sede: lo anotó el verificador de la fase 16 como informativo. Si esta fase toca `/sedes` y sale barato, bien; no es requisito.

</deferred>
