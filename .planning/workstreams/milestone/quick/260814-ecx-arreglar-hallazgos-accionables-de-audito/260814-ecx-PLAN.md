---
phase: 260814-ecx
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: false
files_modified:
  - src/components/structured-data.tsx
  - src/lib/site-config.ts
  - src/content/locations.ts
  - src/content/cv.ts
  - src/components/ui/author-byline.tsx
  - src/components/layout/footer.tsx
  - src/app/sobre-el-doctor/page.tsx
  - src/app/page.tsx
  - src/app/robots.ts
  - src/app/sitemap.xml/route.ts
  - src/content/drafts/senales-de-alarma.ts
  - next.config.ts
  - public/sitemap.xsl
  - scripts/check-seo.mjs
  - scripts/check-content.mjs
  - docs/structured-data.md
  - docs/cloudflare-robots.md
requirements:
  - AUD-01
  - AUD-02
  - AUD-03
  - AUD-04
  - AUD-05
  - AUD-06
  - AUD-07
  - AUD-08
  - AUD-09
  - AUD-10
  - AUD-11
user_setup:
  - service: cloudflare
    why: "El bloqueo de ClaudeBot NO vive en este repo. Lo inyecta el robots.txt gestionado de Cloudflare delante de la salida de la app. Sin tocar el panel, ningún cambio de código lo levanta con certeza."
    dashboard_config:
      - task: "Quitar ClaudeBot de la lista de rastreadores de IA bloqueados, o desactivar el robots.txt gestionado y dejar que la app sirva el suyo"
        location: "Cloudflare Dashboard -> el dominio drangulocolumna.com -> AI Crawl Control / Managed robots.txt"

must_haves:
  truths:
    - "El JSON-LD del sitio no declara ninguna reseña ni calificación agregada en ninguna de las 22 rutas, y la sección visible de reseñas sigue mostrándose igual que antes."
    - "El logo del nodo Physician es un ImageObject con las dimensiones reales del archivo, así los 4 posts del blog recuperan elegibilidad de rich result vía su publisher."
    - "El nodo Physician enlaza sus 4 perfiles verificados: Instagram, Doctoralia, la ficha de Google Business Profile y el Facebook oficial."
    - "Las 4 sedes emiten el mismo @type y especialidades en forma canónica de URL de schema.org, y la sede propia apunta a su ficha real de Google."
    - "Toda respuesta del sitio incluye HSTS, nosniff, SAMEORIGIN, Referrer-Policy y Permissions-Policy."
    - "El sitemap declara lastmod en las 22 URLs y no declara priority ni changefreq en ninguna."
    - "Un paciente puede llegar desde los números CMP y RNE a la plataforma de verificación del Colegio Médico del Perú."
    - "El borrador de señales de alarma existe en el repo, está marcado como pendiente de aprobación médica y no lo importa ninguna ruta ni componente, verificado por máquina."
  artifacts:
    - src/content/drafts/senales-de-alarma.ts
    - docs/cloudflare-robots.md
    - "scripts/check-seo.mjs con las aserciones nuevas de schema, sitemap y borrador"
  key_links:
    - "physicianNode -> ratingNodes: quitar el spread sin dejar el import ni la variable de entorno huérfanos."
    - "locationNode: la usan el grafo raíz y las 4 páginas de sede. Un solo cambio mueve las dos superficies, que es justo lo que se quiere."
    - "AuthorByline: check-content.mjs exige que la firma muestre CMP y RNE como texto. Envolverlos en un enlace debe conservar ese texto."
    - "buildSitemapXml -> public/sitemap.xsl: la hoja tiene columnas de Frecuencia y Prioridad. Si se quitan los campos y no las columnas, la tabla queda con dos columnas vacías."
---

<objective>
Aplicar las 11 correcciones de código de la auditoría SEO de drangulocolumna.com: sacar las reseñas de terceros del marcado structured data, reparar los nodos del grafo (logo, sameAs, hasMap, tipo de sede, especialidades), agregar cabeceras de seguridad, limpiar el sitemap, dar fuente verificable a la colegiatura y dejar redactado, sin publicar, el bloque de señales de alarma médica.

Propósito: el sitio hoy declara reseñas ajenas como propias (violación de directrices de Google, riesgo de acción manual), sirve un logo que invalida el rich result de los 4 posts del blog, y responde sin ninguna cabecera de seguridad.
Salida: 17 archivos tocados, aserciones nuevas y permanentes en `scripts/check-seo.mjs`, y un borrador clínico marcado que no llega a producción.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/workstreams/milestone/STATE.md
@AGENTS.md

Esta versión de Next (16.2.12) tiene cambios de ruptura respecto a lo que el
ejecutor cree saber. Antes de escribir la tarea 3, leer:
@node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md

Archivos que el plan da por leídos y verificados durante la planificación:
@src/components/structured-data.tsx
@src/app/sitemap.xml/route.ts
@src/app/robots.ts
@next.config.ts
</context>

<discovery_notes>
Hallazgos de la planificación que cambian el enunciado de la auditoría. Leer antes de ejecutar.

**1. El bloqueo de ClaudeBot no está en este repo.** `src/app/robots.ts` no contiene
ninguna regla de bots de IA: solo `User-agent: *`, `Allow: /`, `Disallow: /api/` y el
`Sitemap:`. El `robots.txt` de producción son 66 líneas y las primeras 50 vienen
delimitadas por `# BEGIN Cloudflare Managed content` / `# END Cloudflare Managed Content`,
con la salida de la app pegada al final. Es la función de robots.txt gestionado de
Cloudflare, que antepone su bloque. Consecuencia: **ninguna edición de este repo apaga
ese `Disallow: /` por sí sola.** La tarea 3 emite el grupo `Allow` que corresponde
(RFC 9309 manda fusionar los grupos que aplican al mismo agente, y ante reglas de igual
longitud gana la menos restrictiva), pero el arreglo autoritativo es el toggle de
Cloudflare, que va en `user_setup` y en un checkpoint humano.

**2. Dimensiones reales del logo: 900 x 594.** Medidas con `sips` sobre
`public/logo-dr-angulo.avif` y confirmadas contra el gemelo PNG, que reporta
`900 x 594` en su cabecera. No inventar otras.

**3. La sede propia tiene dos URLs de mapa, no una.** `src/content/locations.ts` línea 82
alimenta `hasMap` del schema y 3 enlaces de interfaz; `src/lib/site-config.ts` línea 28
(`office.mapsUrl`) alimenta el pie y `/contacto`. Las dos son URLs de búsqueda por texto.

**4. `medicalSpecialty` / `specialty` en forma plana aparece 4 veces**, no una:
`structured-data.tsx` líneas 105, 189, 337 y 390.

**5. Las 3 puertas ejecutables solo cuentan URLs del sitemap** (`SITEMAP_TOTAL = 22`).
Ninguna afirma nada sobre `priority` ni `changefreq`, así que quitarlos no las rompe.

**6. `public/sitemap.xsl` tiene columnas de Frecuencia y Prioridad** (líneas 192-193 y
las celdas de 211 y 217). Van con el mismo commit que quita los campos.

**7. Solo 3 de las 9 rutas estáticas tienen módulo de contenido** (`home.ts`,
`hub-servicios.ts`, `preguntas-frecuentes.ts`) y solo `preguntas-frecuentes.ts` declara
fechas. Las otras 6 rutas no tienen de dónde sacar un `lastmod` real.
</discovery_notes>

<tasks>

<task type="auto">
  <name>Tarea 1: sacar las reseñas de terceros del marcado structured data (AUD-01)</name>
  <files>src/components/structured-data.tsx, docs/structured-data.md, scripts/check-seo.mjs</files>
  <read_first>src/components/structured-data.tsx (líneas 16-26, 134-175, 177-179, 249-251), src/components/reviews/google-reviews.tsx, scripts/check-seo.mjs</read_first>
  <action>
    Eliminar de `structured-data.tsx` la función `ratingNodes` completa y el spread que la
    inserta en la primera línea de `physicianNode`. Con eso el nodo Physician deja de
    declarar calificación agregada y deja de declarar el arreglo de reseñas.

    Limpiar todo lo que queda huérfano, que es la parte donde este cambio se hace mal:
    el import de `getGoogleReviews` y del tipo `GoogleReviewsData` desde `@/lib/google-reviews`;
    el parámetro de `physicianNode`; el `await getGoogleReviews()` de `SiteJsonLd` y la
    variable local que lo recibe. `SiteJsonLd` puede quedar sin `async` si ya no espera nada;
    el layout la renderiza igual. Verificar que `tsc` no reporte símbolos sin uso.

    La variable de entorno `REVIEWS_SCHEMA_ENABLED` queda sin ningún lector. Borrarla del
    código y de cualquier mención en `docs/`.

    Reescribir el docblock de cabecera del archivo (líneas 16-26): hoy explica de dónde
    salen las reseñas marcadas y por qué. Ese texto pasa a ser falso. Reemplazarlo por la
    razón real de la remoción, que es que Google no permite marcar como propias reseñas
    publicadas en plataformas de terceros, y dejar escrito que el marcado no vuelve.
    Actualizar `docs/structured-data.md` en la sección de reseñas por lo mismo.

    NO tocar `src/lib/google-reviews.ts`, `src/components/reviews/google-reviews.tsx`,
    `src/app/api/reviews/status/route.ts`, `src/app/page.tsx` ni `src/app/testimonios/page.tsx`.
    La sección visible de reseñas se queda exactamente como está: el cambio es de marcado,
    no de interfaz. `getGoogleReviews` sigue teniendo consumidores y no se borra.

    En `scripts/check-seo.mjs` agregar una aserción permanente que recorra el HTML
    prerenderizado de las rutas que la puerta ya lista y falle si algún bloque
    `application/ld+json` contiene un nodo de tipo reseña o una calificación agregada.
    La aserción corre sobre los artefactos de `.next/server/app`, no sobre `src/`.
  </action>
  <verify>
    <automated>npm run build && test "$(grep -rl 'aggregateRating\|"@type":"Review"' .next/server/app --include='*.html' | wc -l | tr -d ' ')" = "0" && npm run seo:check && npx tsc --noEmit && npm run lint</automated>
    <human-check>Levantar `npm start` y confirmar en `/` y en `/testimonios` que la sección de reseñas de Google se sigue viendo igual que antes del cambio.</human-check>
  </verify>
  <done>Ninguna ruta del build emite nodos de reseña ni calificación agregada; `seo:check` lo verifica de forma permanente; la sección visible de reseñas no cambió; no quedan imports, parámetros ni variables de entorno huérfanos.</done>
</task>

<task type="auto">
  <name>Tarea 2: reparar los nodos Physician y de sede del grafo (AUD-02 a AUD-06)</name>
  <files>src/components/structured-data.tsx, src/lib/site-config.ts, src/content/locations.ts, scripts/check-seo.mjs</files>
  <read_first>src/components/structured-data.tsx (líneas 72-108, 177-243, 326-345, 369-404), src/lib/site-config.ts (líneas 20-50), src/content/locations.ts (líneas 60-90)</read_first>
  <action>
    Cinco cambios sobre el mismo grafo. Van juntos porque comparten archivo y una sola
    reconstrucción los verifica a todos.

    **AUD-02, logo como ImageObject.** En `physicianNode`, `logo` deja de ser cadena plana
    y pasa a ser un objeto de tipo `ImageObject` con `url` (la misma que ya usa, resuelta
    por `abs`), `width: 900` y `height: 594`. Esas son las dimensiones reales medidas del
    archivo, no una estimación: están confirmadas en `<discovery_notes>`. Si el ejecutor
    cambia el archivo de logo, vuelve a medirlas; no las copia. Esto es lo que devuelve
    elegibilidad de rich result a los 4 posts, porque `BlogPosting.publisher` referencia
    este mismo `@id`.

    **AUD-03, sameAs.** Agregar a `siteConfig.social` dos claves nuevas junto a `instagram`
    y `doctoralia`: la ficha de Google Business Profile,
    `https://maps.google.com/?cid=10881730410836747834`, y el Facebook oficial,
    `https://www.facebook.com/p/Dr-Juan-Carlos-Angulo-Totesaut-100046921995925/`.
    Las dos están verificadas y se usan tal cual. Sumarlas al arreglo `sameAs` de
    `physicianNode`, que hoy tiene dos entradas y queda con cuatro. No existen perfiles de
    LinkedIn ni de YouTube: no inventar ninguno.

    **AUD-04, hasMap de la sede propia.** La URL CID de arriba identifica la ficha real del
    consultorio, a diferencia de la URL de búsqueda por texto que hay hoy. Reemplazarla en
    los dos lugares que apuntan al consultorio: la entrada `consultorio-privado` de
    `src/content/locations.ts` y `office.mapsUrl` de `src/lib/site-config.ts`. Las 3 sedes
    en clínicas de terceros conservan su URL de búsqueda tal cual, porque no hay Place ID
    verificado para ellas y una URL CID inventada apuntaría a otro negocio. Dejar ese
    motivo escrito en un comentario junto al helper `mapsUrl` de `locations.ts`, para que
    la asimetría no se lea como olvido.

    **AUD-05, tipo único de sede.** En `locationNode`, las 4 sedes pasan a emitir
    `MedicalClinic`. La rama que emite `MedicalBusiness` para el consultorio desaparece.
    `branchOf` sigue condicionado a que sea el consultorio propio y no se toca. El docblock
    de las líneas 72-79 justifica hoy el mapeo partido citando una decisión previa y pide
    explícitamente no revertirlo: reescribirlo con la decisión nueva y su motivo, que es la
    consistencia de tipo entre las 4 sedes. Si el código cambia y el comentario no, el
    archivo queda contradiciéndose.

    **AUD-06, especialidades canónicas.** Las formas planas de `medicalSpecialty` y
    `specialty` aparecen en 4 puntos del archivo (`locationNode`, `physicianNode`,
    `ServicesJsonLd` y `MedicalWebPageJsonLd`). Declarar una constante a nivel de módulo con
    los valores canónicos `https://schema.org/Musculoskeletal` y `https://schema.org/Surgical`,
    y usarla en los 4. Una constante y no 4 literales, así el próximo nodo que necesite
    especialidad no puede volver a la forma plana por copiar del vecino.

    Extender `scripts/check-seo.mjs` con aserciones sobre el JSON-LD del HTML prerenderizado:
    que el logo del Physician sea un objeto con tipo, ancho y alto; que `sameAs` tenga las 4
    URLs; que las 4 sedes declaren el mismo tipo; que el `hasMap` del consultorio sea la URL
    CID; y que ninguna especialidad del grafo quede en forma plana.
  </action>
  <verify>
    <automated>npm run build && npm run seo:check && npm run content:check && npm run sedes:check && npx tsc --noEmit && npm run lint</automated>
  </verify>
  <done>El grafo emite logo como ImageObject de 900x594, 4 URLs en sameAs, las 4 sedes con el mismo tipo, la URL CID como hasMap del consultorio y las especialidades en forma canónica de URL; `seo:check` lo verifica de forma permanente; las 3 puertas preexistentes siguen en verde.</done>
</task>

<task type="auto">
  <name>Tarea 3: cabeceras de seguridad, ClaudeBot y limpieza del sitemap (AUD-07, AUD-08, AUD-10)</name>
  <files>next.config.ts, src/app/robots.ts, src/app/sitemap.xml/route.ts, public/sitemap.xsl, docs/cloudflare-robots.md, scripts/check-seo.mjs</files>
  <read_first>node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md, next.config.ts, src/app/robots.ts, src/app/sitemap.xml/route.ts, public/sitemap.xsl (líneas 185-225)</read_first>
  <action>
    **AUD-08, cabeceras de seguridad.** Leer primero la doc de `headers` que está en
    `read_first`: esta versión de Next tiene semántica propia de coincidencia de rutas y no
    se puede escribir de memoria. Agregar un bloque `headers()` a `next.config.ts`, junto a
    `redirects()`, que cubra todas las rutas y emita: `Strict-Transport-Security` con
    `max-age=31536000; includeSubDomains`, `X-Content-Type-Options` en `nosniff`,
    `X-Frame-Options` en `SAMEORIGIN`, `Referrer-Policy` en
    `strict-origin-when-cross-origin`, y `Permissions-Policy` restrictivo apagando cámara,
    micrófono, geolocalización y pago. Usar solo directivas que los navegadores reconozcan
    hoy; una directiva obsoleta ensucia la consola sin proteger nada.

    **No agregar Content-Security-Policy en modo enforce.** El sitio carga recursos de Google
    y de Instagram y una política mal calibrada rompe producción. Dejarla como pendiente
    documentada en un comentario del propio `headers()`, con el motivo y con qué haría falta
    para calibrarla. Cloudflare está delante del origen: estas cabeceras salen del origen y
    pasan, pero eso se comprueba con la verificación humana contra producción, no se asume.

    **AUD-07, ClaudeBot.** Leer el bloque 1 de `<discovery_notes>` antes de escribir nada:
    el `Disallow: /` de ClaudeBot lo inyecta Cloudflare, no este repo. Dos entregas:

    Primera, en `src/app/robots.ts`, `rules` deja de ser un objeto único y pasa a ser un
    arreglo con el grupo genérico que ya existe, intacto, más un grupo propio para ClaudeBot
    que le permite todo el sitio. Ese grupo se fusiona con el de Cloudflare del lado del
    rastreador y, con reglas de igual longitud, gana la permisiva. NO tocar ningún otro
    agente: los bloqueos de GPTBot, Google-Extended, CCBot, Amazonbot, Applebot-Extended,
    Bytespider y meta-externalagent son decisiones deliberadas de protección de contenido, y
    OAI-SearchBot, PerplexityBot y Googlebot ya pasan por el grupo genérico.

    Segunda, crear `docs/cloudflare-robots.md` con la anatomía del archivo servido (bloque
    gestionado de Cloudflare delante, salida de la app detrás), el motivo de desbloquear
    ClaudeBot y no el resto, el paso manual exacto del panel y cómo comprobar el resultado
    con una petición contra producción. Sin ese documento, el próximo que lea `robots.ts`
    va a concluir que el repo controla algo que no controla.

    **AUD-10, sitemap.** En `src/app/sitemap.xml/route.ts`, quitar `changeFrequency` y
    `priority` de las 4 listas de entradas y borrar de `buildSitemapXml` las dos ramas que
    los serializan: Google los ignora desde 2020 y dejar el serializador sin usar invita a
    reintroducirlos. Agregar `lastModified` a las 9 rutas estáticas, que hoy no lo declaran.
    Para `/preguntas-frecuentes` usar el `updatedAt` de su módulo de contenido. Para `/` y
    `/servicios`, si sus módulos declaran fecha, usarla; si no, entran en el caso siguiente.
    Para las rutas sin módulo de contenido, declarar en el archivo una sola constante de
    fecha con un comentario que diga qué representa y cuándo hay que moverla. Una fecha
    honesta y compartida es mejor que 6 fechas inventadas por ruta.

    `public/sitemap.xsl` muestra la tabla al humano y tiene columnas de Frecuencia y
    Prioridad. Quitar esas dos cabeceras y sus dos celdas; la columna de última modificación
    se queda y ahora se llena en las 22 filas. El `content-type` sigue siendo XML y la
    instrucción de hoja de estilo no se toca.

    Las 3 puertas afirman `SITEMAP_TOTAL = 22` y ninguna mira `priority` ni `changefreq`,
    así que el conteo no se mueve y no hay que sincronizar constantes. Agregar en
    `scripts/check-seo.mjs` la aserción de que las 22 URLs del sitemap declaran fecha de
    modificación y de que ninguna declara los dos campos retirados.
  </action>
  <verify>
    <automated>npm run build && npm run seo:check && npm run content:check && npm run sedes:check && npx tsc --noEmit && npm run lint</automated>
    <human-check>Con `npm start` corriendo: `curl -sI http://localhost:3000/` debe listar las 5 cabeceras de seguridad, y `curl -s http://localhost:3000/robots.txt` debe mostrar el grupo permisivo de ClaudeBot detrás del grupo genérico.</human-check>
  </verify>
  <done>Las 5 cabeceras salen en toda ruta; no hay CSP en enforce y su ausencia está justificada en el código; `robots.txt` de la app emite el grupo permisivo de ClaudeBot sin tocar los demás bloqueos; el sitemap declara fecha en sus 22 URLs y no declara priority ni changefreq; la hoja XSL no muestra columnas vacías.</done>
</task>

<task type="auto">
  <name>Tarea 4: fuente verificable para la colegiatura (AUD-09)</name>
  <files>src/content/cv.ts, src/components/ui/author-byline.tsx, src/components/layout/footer.tsx, src/app/sobre-el-doctor/page.tsx, src/app/page.tsx, src/components/structured-data.tsx</files>
  <read_first>src/content/cv.ts (líneas 140-155), src/components/ui/author-byline.tsx, src/components/structured-data.tsx (líneas 206-219), scripts/check-content.mjs (líneas 420-430)</read_first>
  <action>
    Los números CMP 83189 y RNE 35310 se muestran hoy como texto plano en 4 superficies y
    sin ninguna fuente donde comprobarlos.

    En `src/content/cv.ts`, agregar a `credentialsInfo` la URL de la plataforma oficial de
    verificación, `https://aplicaciones.cmp.org.pe/conoce_a_tu_medico/`. Va ahí y no en
    `site-config.ts` porque el contrato del proyecto dice que todo dato de acreditación sale
    de `cv.ts` y de ningún otro lado, y `check-content.mjs` lo hace cumplir.

    Enlazar desde las 4 superficies que muestran los números: la firma de contenido clínico
    (`author-byline.tsx`), el pie (`footer.tsx`), `/sobre-el-doctor` y la portada. El destino
    es un buscador general del Colegio Médico del Perú: **no existe enlace directo a la ficha
    de un médico** y prometer uno sería mentir. El texto del enlace tiene que reflejar eso;
    una redacción fiel es del tipo "verifica la colegiatura en el registro del Colegio Médico
    del Perú". Español neutro, tuteo, que es el registro que ya usa el sitio. No usar voseo.
    El enlace es externo: `target="_blank"` con `rel="noopener noreferrer"`, y el área de
    toque no baja de 44 píxeles, igual que los otros enlaces de esas superficies.

    `check-content.mjs` afirma que la firma muestra la colegiatura y el registro de
    especialista como texto. Envolverlos o acompañarlos con un enlace conserva ese texto,
    pero hay que comprobarlo corriendo la puerta, no razonándolo.

    En `structured-data.tsx`, agregar `url` con la misma URL a los 2 nodos
    `EducationalOccupationalCredential` de `hasCredential`, para que la afirmación del
    marcado y la que ve el paciente apunten al mismo lugar.
  </action>
  <verify>
    <automated>npm run build && npm run content:check && npm run seo:check && npm run sedes:check && npx tsc --noEmit && npm run lint</automated>
    <human-check>Con `npm start`: en `/`, `/sobre-el-doctor`, el pie de cualquier página y una guía clínica, comprobar que el enlace se ve, que abre la plataforma del CMP en pestaña nueva y que el texto no promete una ficha personal.</human-check>
  </verify>
  <done>Las 4 superficies enlazan a la plataforma del CMP con texto honesto sobre lo que hay del otro lado; los 2 nodos de credencial declaran esa URL; la puerta de contenido sigue verificando que la firma muestra los dos números.</done>
</task>

<task type="auto">
  <name>Tarea 5: borrador de señales de alarma médica, sin publicar (AUD-11)</name>
  <files>src/content/drafts/senales-de-alarma.ts, scripts/check-content.mjs</files>
  <read_first>src/components/ui/medical-disclaimer.tsx, src/content/service-pages/index.ts (docblock de cabecera y los tipos de sección), src/content/service-pages/hernia-discal.ts, scripts/check-content.mjs</read_first>
  <action>
    El contenido clínico del sitio tiene aviso de alcance informativo pero no dice qué hacer
    ante síntomas de urgencia. Es un estándar esperado en contenido médico de este tipo.

    **Decisión de arquitectura, con su justificación.** El borrador va en un módulo de datos
    nuevo, `src/content/drafts/senales-de-alarma.ts`, que ningún archivo importa. No va
    detrás de una bandera de configuración por dos razones concretas de este repo: una
    bandera deja el texto dentro del paquete que se sirve al navegador aunque esté apagada,
    y basta que alguien la invierta para publicar contenido clínico sin revisión médica.
    Un módulo sin importadores no se puede activar por accidente, sale del árbol en el build
    y sigue siendo TypeScript tipado y revisable en el diff, que es lo que un `.md` suelto
    en `docs/` no da. El proyecto ya resuelve así sus salvaguardas: por máquina, no por
    convención.

    El módulo exporta un objeto con un campo booleano de aprobación médica en `false`, la
    fecha del borrador, la lista de rutas destino (`/servicios/hernia-discal` y
    `/blog/lumbalgia` como mínimo) y el cuerpo del bloque. El docblock de cabecera dice, en
    la primera línea, que el archivo no se conecta a ninguna ruta hasta que el doctor lo
    apruebe, y describe qué hay que hacer el día que lo apruebe: mover el texto al módulo de
    contenido de cada ruta y borrar el borrador.

    **Contenido del bloque.** Redactar según criterio clínico estándar los signos que obligan
    a atención inmediata en lugar de esperar una consulta programada: pérdida del control de
    esfínteres, alteración de la sensibilidad en la zona que contacta con la silla al
    sentarse, debilidad motora que progresa, y la sospecha de compresión del haz de raíces
    lumbosacras que esos signos configuran. Español neutro con tuteo, sin voseo, misma voz
    explicativa del resto del contenido. Se mantienen las reglas de contenido del proyecto:
    sin cifras, sin plazos garantizados, sin voz en primera persona sobre casos, y ninguna
    credencial escrita fuera de `cv.ts`. El texto indica acudir a emergencias, no ofrece el
    WhatsApp del consultorio: un canal asincrónico no sirve para una urgencia y ofrecerlo
    ahí sería el error de diseño más grave que puede tener este bloque.

    **Puerta que lo hace cumplir.** Agregar a `scripts/check-content.mjs` una aserción que
    falle si algún archivo bajo `src/app/` o `src/components/` importa desde
    `src/content/drafts/`, mientras el campo de aprobación del borrador siga en `false`.
    Reforzarla comprobando que una frase distintiva del borrador, tomada del propio módulo en
    tiempo de ejecución y no escrita a mano en el script, no aparece en el HTML
    prerenderizado. Así la puerta protege contra las dos formas de filtrarlo, importarlo y
    copiarlo, y no hay que mantener la frase sincronizada en dos lugares.
  </action>
  <verify>
    <automated>npm run build && npm run content:check && npm run seo:check && npx tsc --noEmit && npm run lint && test "$(grep -rl "content/drafts" src/app src/components | wc -l | tr -d ' ')" = "0"</automated>
  </verify>
  <done>El borrador existe, está tipado, marcado como no aprobado y sin importadores; la puerta de contenido falla si alguien lo conecta o copia su texto a una ruta; el build no lo incluye.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Las 11 correcciones de la auditoría, aplicadas en 17 archivos, con aserciones nuevas en las puertas de `seo:check` y `content:check`.</what-built>
  <how-to-verify>
    Dos cosas que ninguna puerta puede hacer sola.

    1. **Cloudflare.** Entrar al panel del dominio, sección de control de rastreadores de IA
       o robots.txt gestionado, y quitar ClaudeBot de la lista bloqueada. Los pasos están en
       `docs/cloudflare-robots.md`. Después del deploy, comprobar con
       `curl -s https://drangulocolumna.com/robots.txt | grep -A2 ClaudeBot` que ya no
       aparece bajo el bloque gestionado con `Disallow: /`.
    2. **Cabeceras en producción, no en local.** Después del deploy,
       `curl -sI https://drangulocolumna.com/` tiene que listar las 5 cabeceras. Si alguna
       falta, la está filtrando la capa de Cloudflare y el arreglo es de configuración de
       red, no de este repo.
  </how-to-verify>
  <resume-signal>Escribí "aprobado" o describí qué falló</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| navegador -> origen Next | Toda respuesta HTML sale hoy sin cabeceras de seguridad |
| Cloudflare -> origen | Cloudflare antepone contenido a `robots.txt` y puede filtrar o agregar cabeceras |
| Google Places API -> JSON-LD | Deja de ser frontera al quitarse el marcado de reseñas |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ecx-01 | Spoofing | JSON-LD del Physician | high | mitigate | Tarea 1: dejar de declarar como propias reseñas publicadas en Google. Es el hallazgo con riesgo de acción manual de Google |
| T-ecx-02 | Tampering | respuestas HTML sin nosniff ni SAMEORIGIN | high | mitigate | Tarea 3: nosniff, SAMEORIGIN, HSTS |
| T-ecx-03 | Information disclosure | Referrer hacia terceros | medium | mitigate | Tarea 3: `strict-origin-when-cross-origin` |
| T-ecx-04 | Elevation of privilege | APIs de dispositivo en el navegador | low | mitigate | Tarea 3: Permissions-Policy restrictivo |
| T-ecx-05 | Tampering | inyección de script sin CSP | medium | accept | CSP en enforce rompe los recursos de Google e Instagram. Se documenta como pendiente en el código con lo que haría falta para calibrarla |
| T-ecx-06 | Information disclosure | contenido clínico sin revisión médica publicado por accidente | high | mitigate | Tarea 5: módulo sin importadores más aserción en `check-content.mjs` |

Sin instalaciones de paquetes en este plan: no aplica la puerta de legitimidad de paquetes.
</threat_model>

<source_audit>
## Auditoría de cobertura

| ID | Origen | Ítem | Estado | Tarea |
|----|--------|------|--------|-------|
| AUD-01 | CONTEXT | Reseñas y calificación agregada fuera del JSON-LD, interfaz intacta | COVERED | 1 |
| AUD-02 | CONTEXT | Logo como ImageObject con dimensiones reales | COVERED | 2 |
| AUD-03 | CONTEXT | sameAs con GBP y Facebook | COVERED | 2 |
| AUD-04 | CONTEXT | hasMap de la sede propia con URL CID; las 3 clínicas documentadas | COVERED | 2 |
| AUD-05 | CONTEXT | Tipo de sede unificado | COVERED | 2 |
| AUD-06 | CONTEXT | Especialidades en forma canónica | COVERED | 2 |
| AUD-07 | CONTEXT | Desbloquear solo ClaudeBot | COVERED | 3 + checkpoint (el arreglo autoritativo es Cloudflare) |
| AUD-08 | CONTEXT | 5 cabeceras de seguridad, sin CSP en enforce | COVERED | 3 |
| AUD-09 | CONTEXT | Enlace verificable de colegiatura y `url` en las credenciales | COVERED | 4 |
| AUD-10 | CONTEXT | lastmod en las estáticas, sin priority ni changefreq | COVERED | 3 |
| AUD-11 | CONTEXT | Señales de alarma redactadas y sin publicar | COVERED | 5 |

Sin ítems sin planificar.

## Fuera de alcance, a documentar en el SUMMARY

Acciones manuales del usuario: Search Console, envío de sitemap y solicitud de indexación;
optimización del Google Business Profile y generación de reseñas; creación de imágenes y
diagramas clínicos; expandir `/sobre-el-doctor` y diferenciar las 4 páginas de sede.

**No acción deliberada, con su justificación:** no se expande `FAQPage` a más preguntas.
Google retiró los rich results de FAQ para todos los sitios el 7 de mayo de 2026 y el
beneficio en motores de IA no está confirmado. El `FAQPage` que ya existe se queda como
está; lo que no se hace es invertir en ampliarlo. Tampoco se implementa IndexNow.
</source_audit>

<verification>
- `npm run build`, `npx tsc --noEmit` y `npm run lint` en verde.
- Las 3 puertas preexistentes en verde: `content:check`, `sedes:check`, `seo:check`. Ninguna baja su cobertura.
- El sitemap sigue en 22 URLs: las 3 constantes `SITEMAP_TOTAL` no se mueven en este plan.
- Ninguna ruta del build emite nodos de reseña ni calificación agregada.
- Ningún archivo bajo `src/app/` o `src/components/` importa desde `src/content/drafts/`.
- Los 2 checks del checkpoint, contra producción y contra el panel de Cloudflare.
</verification>

<success_criteria>
Las 11 correcciones aplicadas y verificadas por máquina donde se puede verificar por máquina;
el hallazgo que no se arregla desde el repo (ClaudeBot) queda explícito, documentado y con su
paso manual; el contenido clínico nuevo existe redactado y no llega a producción.
</success_criteria>

<output>
Crear `.planning/workstreams/milestone/quick/260814-ecx-arreglar-hallazgos-accionables-de-audito/260814-ecx-SUMMARY.md` al terminar.
</output>
