---
phase: 260814-ecx
plan: 01
subsystem: seo-y-datos-estructurados
tags: [schema, seguridad, sitemap, robots, contenido-medico]
status: complete
requires:
  - src/components/structured-data.tsx
  - src/content/locations.ts
  - src/lib/site-config.ts
  - scripts/check-seo.mjs
  - scripts/check-content.mjs
provides:
  - "JSON-LD sin reseñas ni calificación agregada en las 23 rutas"
  - "logo del Physician como ImageObject de 900x594"
  - "sameAs con los 4 perfiles verificados del doctor"
  - "5 cabeceras de seguridad en toda respuesta del origen"
  - "sitemap con lastmod en sus 22 URLs y sin changefreq ni priority"
  - "enlace a la plataforma de verificación del CMP en 4 superficies"
  - "src/content/drafts/senales-de-alarma.ts, redactado y sin publicar"
affects:
  - src/app/robots.ts
  - src/app/sitemap.xml/route.ts
  - public/sitemap.xsl
  - next.config.ts
  - scripts/check-sedes.mjs
tech-stack:
  added: []
  patterns:
    - "constante de módulo para valores de schema.org repetidos, en vez de literal por nodo"
    - "borrador clínico como módulo sin importadores, no como bandera de configuración"
    - "la puerta extrae las frases a buscar del propio borrador, no las copia"
key-files:
  created:
    - src/content/drafts/senales-de-alarma.ts
    - docs/cloudflare-robots.md
  modified:
    - src/components/structured-data.tsx
    - src/lib/site-config.ts
    - src/content/locations.ts
    - src/content/cv.ts
    - src/components/ui/author-byline.tsx
    - src/components/layout/footer.tsx
    - src/app/page.tsx
    - src/app/sobre-el-doctor/page.tsx
    - src/app/robots.ts
    - src/app/sitemap.xml/route.ts
    - next.config.ts
    - public/sitemap.xsl
    - scripts/check-seo.mjs
    - scripts/check-content.mjs
    - scripts/check-sedes.mjs
    - docs/structured-data.md
decisions:
  - "Las 4 sedes emiten MedicalClinic. El mapeo partido describía el tamaño del local, no la atención"
  - "Sin CSP en enforce: se documenta el motivo y los 3 pasos para calibrarla"
  - "Una sola fecha compartida para las 6 rutas fijas sin módulo de contenido, no 6 fechas inventadas"
  - "El borrador clínico va en un módulo sin importadores, no detrás de una bandera"
  - "No se expande FAQPage: Google retiró los rich results de FAQ el 2026-05-07"
metrics:
  duration: "~1 h"
  completed: 2026-08-14
  tasks: 5
  commits: 5
  files: 18
---

# 260814-ecx: arreglar los hallazgos accionables de la auditoría SEO

Las 11 correcciones de código de la auditoría de drangulocolumna.com, aplicadas
en 18 archivos y sostenidas por aserciones nuevas y permanentes en las puertas
de `seo:check` y `content:check`.

## Qué se aplicó

### Tarea 1 — reseñas fuera del marcado (AUD-01) · `003546a`

El nodo `Physician` declaraba como propias la calificación y hasta cinco
reseñas que los pacientes publicaron en la ficha de Google. Se retiró la función
`ratingNodes` completa y el spread que la insertaba. Con eso se fueron también el
import de `@/lib/google-reviews`, el parámetro de `physicianNode`, el `await` de
`SiteJsonLd` —que dejó de ser `async`— y la variable de entorno
`REVIEWS_SCHEMA_ENABLED`, que se quedaba sin ningún lector.

La sección visible de reseñas no se tocó: `src/lib/google-reviews.ts`,
`google-reviews.tsx`, `/api/reviews/status`, la portada y `/testimonios` quedaron
exactamente como estaban. Mostrar reseñas con atribución sí está permitido; lo
que se retiró es el marcado.

El docblock de cabecera del archivo describía de dónde salían las reseñas
marcadas: pasó a ser falso y se reescribió con la razón real de la remoción.
`docs/structured-data.md` también.

**Puerta nueva:** `checkNoReviewMarkup` recorre el JSON-LD de las 23 rutas del
build, lo parsea y falla si algún nodo declara un tipo de reseña o calificación
(`Review`, `Rating`, `AggregateRating` y variantes) o cualquiera de las siete
propiedades que las declaran. Corre sobre el HTML prerenderizado, así un camino
nuevo que reintroduzca el marcado falla igual. Refuerzo sobre la fuente: si
`structured-data.tsx` vuelve a importar el cliente de reseñas, también falla.

### Tarea 2 — nodos Physician y de sede (AUD-02 a AUD-06) · `f04bc70`

Cinco cambios sobre el mismo grafo.

- **Logo como `ImageObject`.** Constante `LOGO` con `url`, `width: 900` y
  `height: 594`, medidas con `sips` sobre `public/logo-dr-angulo.avif` durante
  la ejecución, no copiadas. Es lo que devuelve elegibilidad de rich result a
  los 4 posts del blog, porque `BlogPosting.publisher` referencia este `@id`.
- **`sameAs` con 4 perfiles.** `siteConfig.social` ganó `googleBusiness` (la
  ficha por CID) y `facebook`. No se inventaron LinkedIn ni YouTube.
- **`hasMap` del consultorio por URL CID**, en los dos lugares que apuntaban al
  consultorio: `locations.ts` y `siteConfig.office.mapsUrl`. Las 3 clínicas
  conservan su búsqueda por texto, con el motivo escrito en el docblock del
  helper `mapsUrl` para que la asimetría no se lea como olvido.
- **Tipo único de sede.** Las 4 emiten `MedicalClinic`. El docblock que pedía no
  revertir el mapeo partido se reescribió con la decisión nueva y su motivo.
- **Especialidades canónicas.** Constante `MEDICAL_SPECIALTIES` con las URLs de
  schema.org, usada en los 4 puntos donde había forma plana.

**Puerta nueva:** `checkGraphNodes` verifica las cinco sobre el JSON-LD del
build. La de especialidades recorre las 23 rutas, no solo la portada: hoy mide
125 nodos con especialidad canónica.

### Tarea 3 — cabeceras, ClaudeBot y sitemap (AUD-07, AUD-08, AUD-10) · `e17e155`

- **Cabeceras.** Bloque `headers()` en `next.config.ts` sobre `/:path*`, que en
  esta versión de Next cubre la portada y todo lo anidado. Emite HSTS
  (`max-age=31536000; includeSubDomains`), `nosniff`, `SAMEORIGIN`,
  `strict-origin-when-cross-origin` y un `Permissions-Policy` que apaga cámara,
  micrófono, geolocalización y pago. Verificado con `curl -sI` contra
  `npm start`: las 5 salen en `/` y en `/servicios/hernia-discal`.
- **Sin CSP en enforce**, con el motivo y los tres pasos para calibrarla escritos
  en el propio `headers()`: report-only con endpoint de reportes, tráfico real el
  tiempo suficiente, y recién ahí enforce.
- **ClaudeBot.** `robots.ts` pasó de un objeto único a un arreglo con el grupo
  genérico intacto más un grupo permisivo para ClaudeBot. Ningún otro agente se
  tocó. `docs/cloudflare-robots.md` documenta que el `Disallow: /` real lo
  inyecta Cloudflare, por qué el grupo de acá sirve igual (RFC 9309 fusiona
  grupos y ante reglas de igual longitud gana la permisiva), el paso exacto del
  panel y cómo comprobarlo contra producción.
- **Sitemap.** Las 22 URLs declaran `lastmod` y ninguna declara `changefreq` ni
  `priority`. Las dos ramas del serializador que los emitían se borraron.
  `/preguntas-frecuentes` usa el `updatedAt` de su módulo; `/` y `/servicios` lo
  usarían si sus módulos lo declararan y por ahora caen en
  `SHARED_LAST_MODIFIED`, la constante compartida de las rutas fijas sin fecha
  propia, con el comentario de qué representa y cuándo moverla.
- **`sitemap.xsl`** perdió las columnas de Frecuencia y Prioridad, cabeceras y
  celdas. La puerta ahora compara el conteo de `scope="col"` contra el de `<td>`,
  así una columna huérfana falla.

### Tarea 4 — colegiatura verificable (AUD-09) · `9ae156f`

`credentialsInfo` declara `verificationUrl` con la plataforma del Colegio Médico
del Perú. Va en `cv.ts` porque el contrato del proyecto manda que todo dato de
acreditación salga de ahí.

Enlazan las 4 superficies que muestran los números: la firma de contenido
clínico, el pie, la portada y `/sobre-el-doctor`. Texto idéntico en las cuatro,
"Verifica la colegiatura en el registro del Colegio Médico del Perú", que es
fiel a lo que hay del otro lado: **un buscador general, no la ficha del doctor**.
No existe enlace directo a una ficha y prometerlo sería mentir. Enlace externo
con `target="_blank"` y `rel="noopener noreferrer"`, área de toque de 44 píxeles
(`min-h-11`) y aviso de pestaña nueva en `sr-only`, igual que los otros enlaces
externos de esas superficies.

Los 2 nodos `EducationalOccupationalCredential` declaran la misma URL, así el
marcado y lo que ve el paciente apuntan al mismo lugar.

`check-content.mjs` sigue verificando que la firma muestra CMP y RNE como texto:
se comprobó corriendo la puerta, no razonándolo.

### Tarea 5 — señales de alarma, redactadas y sin publicar (AUD-11) · `99bc2b3`

`src/content/drafts/senales-de-alarma.ts` existe, está tipado, declara
`approvedByPhysician: false`, la fecha del borrador, las rutas destino y el
cuerpo del bloque: cuatro signos (pérdida del control de esfínteres, alteración
de la sensibilidad en silla de montar, debilidad motora progresiva y compromiso
bilateral) más el cierre, que manda a emergencias y **no ofrece el WhatsApp del
consultorio**: un canal asincrónico no atiende una urgencia.

Español neutro con tuteo, sin cifras, sin plazos garantizados, sin voz en
primera persona y sin credenciales fuera de `cv.ts`. El docblock dice en la
primera línea que no se conecta a ninguna ruta hasta la aprobación, y lista los
cuatro pasos del día que se apruebe.

**Puerta nueva, `checkDrafts`**, con las dos formas de filtrarlo cubiertas:

1. Ningún archivo de `src/app/` o `src/components/` puede referenciar
   `content/drafts`.
2. Ninguna frase larga del borrador puede aparecer en el HTML prerenderizado.
   Las frases se extraen del propio módulo en tiempo de ejecución (hoy salen 10)
   y no están escritas en el script, así no hay nada que mantener sincronizado.

Las dos se probaron en negativo antes de dar la tarea por cerrada: con un import
de prueba en `medical-disclaimer.tsx` la puerta falló, y con una frase pegada a
mano en un HTML del build también. Las dos pruebas se revirtieron.

## Verificación

Sobre el árbol final, después del último commit:

| Puerta | Resultado |
|---|---|
| `npm run build` | verde |
| `npx tsc --noEmit` | verde |
| `npm run lint` | verde |
| `npm run content:check` | 14 rutas PASA, sin fallas |
| `npm run sedes:check` | 4 sedes PASA, sin fallas |
| `npm run seo:check` | 23 rutas, sin fallas |

Comprobaciones puntuales:

- `grep -rl 'aggregateRating\|"@type":"Review"' .next/server/app --include='*.html'` → 0
- `grep -rl "content/drafts" src/app src/components` → 0
- `grep -c "<lastmod>" .next/server/app/sitemap.xml.body` → 22, y el sitemap
  sigue en 22 `<loc>`: las 3 constantes `SITEMAP_TOTAL` no se movieron
- `curl -sI http://localhost:3000/` sobre `npm start` → las 5 cabeceras
- `curl -s http://localhost:3000/robots.txt` → el grupo permisivo de ClaudeBot
  detrás del genérico

## Desviaciones del plan

**1. [Regla 3 — bloqueante] `check-sedes.mjs` esperaba `MedicalBusiness`.**

- **Encontrado en:** tarea 2, al correr las puertas después del cambio de tipo.
- **Problema:** el `MANIFEST` de `scripts/check-sedes.mjs` tenía escrito a mano
  `schemaType: "MedicalBusiness"` para el consultorio privado. AUD-05 unifica el
  tipo, así que la puerta pasó a rojo con un fallo legítimo contra una
  expectativa vieja. El plan listaba `check-seo.mjs` pero no esta.
- **Arreglo:** se actualizó la expectativa a `MedicalClinic`, con el comentario
  de por qué cambió y de que lo que distingue al consultorio es `branchOf`. No se
  desactivó ninguna comprobación: la puerta sigue exigiendo que el grafo de cada
  sede traiga su nodo del tipo declarado.
- **Archivo:** `scripts/check-sedes.mjs`. **Commit:** `f04bc70`.

**2. [Regla 3 — bloqueante] `check-seo.mjs` exigía el tipo de las reseñas.**

- **Encontrado en:** tarea 1, antes de correr la puerta.
- **Problema:** `checkNoHandwrittenRatings` afirmaba que `structured-data.tsx`
  tiene que mencionar `GoogleReviewsData`. Esa aserción defendía el criterio
  anterior —que la calificación saliera de la API y no de una cifra a mano— y
  con el marcado retirado habría fallado por la razón opuesta a la deseada.
- **Arreglo:** la función se reemplazó por `checkNoReviewMarkup`, que verifica
  el criterio nuevo y es estrictamente más fuerte: mide el HTML servido en vez
  de la fuente. Se conservó la comprobación de que `testimonials.ts` no declara
  campos de calificación.
- **Archivo:** `scripts/check-seo.mjs`. **Commit:** `003546a`.

## Pendiente de acción manual del usuario

Nada de esto se puede hacer desde el repositorio.

**1. Cloudflare, robots.txt gestionado (bloqueante, era el checkpoint del plan).**
El `Disallow: /` de ClaudeBot lo inyecta Cloudflare delante de la salida de la
app. No tengo acceso al panel y ningún cambio de código lo levanta con certeza.
Los pasos exactos están en `docs/cloudflare-robots.md`. Después del deploy:
`curl -s https://drangulocolumna.com/robots.txt | grep -A2 ClaudeBot`.

**2. Cabeceras en producción, no en local.** Las 5 salen del origen, verificado
con `curl` contra `npm start`. Cloudflare está delante y puede filtrarlas o
reescribirlas. Después del deploy: `curl -sI https://drangulocolumna.com/`. Si
falta alguna, el arreglo es de configuración de red, no de este repo.

**3. Search Console.** Reenviar el sitemap (cambió: ahora declara `lastmod` en
las 22 URLs y ya no declara `changefreq` ni `priority`) y pedir reindexación de
las rutas que cambiaron de marcado.

**4. Google Business Profile y reseñas.** La ficha tiene 5.0 con 6 reseñas, que
es poco para la SERP local de Lima. Ahora que el sitio dejó de declararlas en el
marcado, las estrellas en resultados solo pueden venir de la ficha: subir el
volumen de reseñas pasó de deseable a ser el único camino.

**5. Imágenes y diagramas clínicos.** No hay ninguno en las guías. Es trabajo de
producción de material, no de código.

**6. Contenido de sedes y `/sobre-el-doctor`.** Las 4 páginas de sede se
diferencian poco entre sí y `/sobre-el-doctor` es corta. Fuera del alcance de
este plan.

**7. Aprobación médica del borrador de señales de alarma.** El texto está
redactado según criterio clínico estándar, no revisado por el doctor. Los cuatro
pasos para publicarlo están en el docblock del módulo.

## No acción deliberada

**No se expande `FAQPage` a más preguntas.** Google retiró los rich results de
FAQ para todos los sitios el 7 de mayo de 2026, y el beneficio en motores de IA
no está confirmado. El `FAQPage` que ya existe se queda como está y sigue
emitiéndose: no se retira, porque no hace daño y algún consumidor de datos
estructurados puede leerlo. Lo que no se hace es invertir en ampliarlo. Tampoco
se implementa IndexNow.

## Problemas diferidos

**Aviso de build preexistente, fuera de alcance.** `npm run build` emite
`Encountered unexpected file in NFT list` sobre `next.config.ts`. Ya salía antes
de este plan, con el `next.config.ts` sin tocar, y no es consecuencia del bloque
`headers()` que se agregó. No se investigó: está fuera del alcance de estas 11
correcciones.

## Verificación humana diferida

Dos checks del plan que ninguna puerta puede hacer sola quedan para Juan: el
toggle de Cloudflare y las cabeceras contra producción, los dos descritos arriba.
Los tres `human-check` de las tareas 1, 3 y 4 se cubrieron por otra vía: la
tarea 1 no tocó ningún archivo de la interfaz de reseñas (verificable en el diff
de `003546a`), y las de las tareas 3 y 4 se corrieron contra `npm start`.

## Self-Check: PASSED

Archivos verificados en disco: `src/content/drafts/senales-de-alarma.ts`,
`docs/cloudflare-robots.md`, y los 16 modificados.
Commits verificados en `git log`: `003546a`, `f04bc70`, `e17e155`, `9ae156f`,
`99bc2b3`.
