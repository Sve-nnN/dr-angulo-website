# Phase 8: Silo clínico: páginas por servicio y blog profundo - Context

**Gathered:** 2026-08-10
**Status:** Ready for planning

<domain>
## Phase Boundary

La fase entrega cuatro URLs dedicadas para las condiciones que la gente busca en Lima, convierte `/servicios` en el índice de ese silo, y lleva los cuatro posts existentes del blog de resumen a contenido de fondo que empuja tráfico hacia esas URLs.

Queda fuera: breadcrumbs, titles, imágenes OG y `llms.txt`, que son de la fase 10. Páginas por sede, que son de la fase 9. Posts nuevos: se expanden los cuatro que existen, no se escriben más.

### Cambio de política registrado el 2026-08-10

El criterio de éxito 4 de esta fase decía "Nada de este contenido clínico está publicado sin la aprobación escrita del doctor". Juan decidió escribir y publicar directo, con revisión del doctor posterior a que las páginas estén en vivo. El criterio se reescribió en términos verificables y la restricción equivalente de PROJECT.md se actualizó en el commit `bf7e9eb`.

Lo que reemplaza a la aprobación previa, y es obligatorio:

- El contenido solo puede apoyarse en fuentes ya verificadas del proyecto: el CV confirmado en `src/content/cv.ts`, el resto de `src/content/` de v1.0, y consenso clínico general redactado en voz neutra sin atribuírselo al doctor.
- Prohibido afirmar credenciales que no estén en el CV, cifras de cirugías realizadas, tasas de éxito, tiempos de recuperación garantizados o cualquier promesa de resultado.
- Cada página lleva un aviso visible de que la información es educativa y no reemplaza una consulta médica.

</domain>

<decisions>
## Implementation Decisions

### Arquitectura del silo

- URLs anidadas bajo el hub: `/servicios/hernia-discal`, `/servicios/estenosis-espinal`, `/servicios/escoliosis`, `/servicios/ortopedia-infantil`. La anidación refuerza el silo y hace que los breadcrumbs de la fase 10 salgan del propio path.
- Se construyen con una ruta dinámica `[slug]` alimentada por datos en `src/content/`, no con cuatro archivos `page.tsx` sueltos. Una plantilla, cuatro entradas de datos.
- `/servicios` se reconvierte en hub: conserva el contenido que ya tiene desde v1.0 y suma tarjetas hacia las cuatro páginas nuevas. No se reescribe desde cero ni se adelgaza a puro índice.
- Estructura interna fija e idéntica en las cuatro páginas: qué es, síntomas, cuándo consultar, cómo se diagnostica, opciones de tratamiento (conservador y quirúrgico), recuperación, preguntas frecuentes y CTA. Predecible para el paciente y para Google.
- Cada página enlaza de vuelta al hub y ofrece CTA de agenda sin obligar al paciente a volver al inicio.

### Contenido clínico

- Fuente: consenso clínico general, en voz neutra, sin atribuirle afirmaciones al doctor. Lo que sí es suyo (CMP 83189, RNE 35310, formación) sale del CV ya verificado.
- No se publica precio de consulta. El dato de Doctoralia de alrededor de S/130 sigue sin confirmar, y publicar un precio médico equivocado es peor que no publicarlo.
- Aviso de contenido educativo visible al cierre de cada página, más las prohibiciones listadas arriba.
- Tono: el mismo del sitio actual. Segunda persona, español neutro peruano, explicando sin tecnicismos innecesarios. Es como comunica el doctor en Instagram.
- Extensión mínima 900 palabras por página.

### Blog

- Los cuatro posts se expanden, no se reescriben. El texto actual queda como núcleo y se suma profundidad hasta pasar las 900 palabras. Preserva lo que ya se dio por bueno en v1.0.
- Mapa de enlazado, tres páginas de destino para cuatro posts:
  - `5-sintomas-de-columna-que-no-debes-ignorar` hacia hernia discal
  - `hernia-discal-o-dolor-de-espalda-como-diferenciarlos` hacia hernia discal
  - `estenosis-espinal-que-es` hacia estenosis espinal
  - `miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` hacia hernia discal, que es la cirugía que más miedo genera
- Escoliosis y ortopedia infantil quedan sin post que las alimente. Es aceptado y no se escriben posts nuevos en esta fase.

### Requisitos que Juan sumó para los posts el 2026-08-10

Estos cuatro son explícitos y no son opcionales:

- **Jerarquía de encabezados correcta y rica.** Un solo `h1`, `h2` por sección, `h3` para subtemas, sin saltos de nivel.
- **Tabla de contenidos** en cada post, construida desde los encabezados y con enlaces ancla que funcionen.
- **Banner tipo CTA dentro del primer tercio del post**, que empuje a una acción, como mínimo agendar consulta. Esto reemplaza la propuesta original de poner el CTA solo al cierre: van los dos, el banner arriba y el CTA de cierre.
- **E-E-A-T y schema impecables.** Autoría atribuida al doctor con sus credenciales verificadas, fechas de publicación y de última actualización, y el marcado correspondiente.

### Schema

- `MedicalWebPage` con `about` de tipo `MedicalCondition` en las cuatro páginas. Hernia discal y estenosis espinal son condiciones, no procedimientos, y el criterio del ROADMAP pide `MedicalProcedure` por inercia.
- `MedicalProcedure` se suma solo en las secciones donde la página describe efectivamente la cirugía.
- Ojo con lo que ya existe: el commit `5387091` metió 403 líneas nuevas en `src/components/structured-data.tsx` con breadcrumbs, `hasCredential`, `openingHoursSpecification` y marcado de reseñas. Hay que leer ese archivo antes de escribir schema nuevo, para extender lo que hay en vez de duplicarlo.

### Claude's Discretion

- Nombre y forma exacta del archivo de datos de las páginas de servicio, y si extiende `src/content/services.ts` o vive aparte.
- Implementación de la tabla de contenidos y de la generación de anclas.
- Diseño visual del banner de CTA, respetando la identidad de marca de v1.0.
- Reparto del trabajo en planes y olas.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/content/services.ts` exporta `serviceCategories` con `slug`, `name`, `description` y `conditions`. Ya lista "Hernia discal", "Estenosis espinal (canal estrecho)" y "Escoliosis y otras deformidades" dentro de la categoría `columna`.
- `src/content/blog.ts` exporta `blogPosts` con los cuatro slugs a expandir.
- `src/content/cv.ts` tiene la trayectoria verificada del doctor, que es la única fuente admitida para credenciales.
- `src/components/structured-data.tsx` fue muy ampliado en `5387091`. Leerlo antes de tocar schema.
- `src/components/ui/booking-cta.tsx` y `src/components/ui/whatsapp-cta.tsx` ya existen, con `whatsappMessages` tipado por `CtaLocation` en `src/lib/site-config.ts`. El banner del blog debería sumar su propia `CtaLocation` en vez de inventar un mensaje suelto.
- `src/app/blog/[slug]/page.tsx` ya es ruta dinámica con `generateStaticParams`. Es el análogo directo para la ruta de servicios.

### Established Patterns

- Next.js 16 con App Router. Contenido como código, sin CMS. Metadata API por página.
- Tailwind CSS 4 con tokens de marca de v1.0: teal alrededor de `#0E8A8C` y dorado mostaza alrededor de `#E8971F`. Tipografía Poppins vía `next/font`.
- `src/app/sitemap.ts` deriva las rutas de `siteConfig.url` y de `blogPosts`. Las cuatro rutas nuevas tienen que entrar ahí.
- `/privacidad` es la única ruta con `noindex` y está deliberadamente fuera del sitemap. Las páginas nuevas van indexables y dentro.

### Integration Points

- Sitemap: `src/app/sitemap.ts` pasa de 12 a 16 URLs.
- Hub: `src/app/servicios/page.tsx` suma las tarjetas hacia las hijas.
- Blog: `src/app/blog/[slug]/page.tsx` suma tabla de contenidos, banner y CTA de cierre.
- Deploy: push a `main` en `github.com/Sve-nnN/dr-angulo-website` dispara build Nixpacks en Dokploy. `applicationId` `29ZFzVVwEczNI733DodMp`.
- Producción hoy tiene dos variables: `NEXT_PUBLIC_SITE_URL` y `GOOGLE_PLACES_API_KEY`. Esta fase no necesita ninguna nueva.

</code_context>

<specifics>
## Specific Ideas

- La auditoría del 2026-08-10 encontró que las posiciones 1 y 3 de "cirujano de columna en Lima" son dominios exact-match, y que el resto son clínicas grandes y Doctoralia. Una sola página `/servicios` no compite contra eso. Ese es el motivo de existir de esta fase.
- Related search sin capturar todavía: "traumatologo especialista en columna clínica ricardo palma". Es de la fase 9, pero conviene tenerlo presente al enlazar.
- El doctor publica educación al paciente en Instagram sobre exactamente estos temas: hernia discal, estenosis, contracturas, miedo a cirugía y postura. El tono de esos posts es la referencia.

</specifics>

<deferred>
## Deferred Ideas

- Posts nuevos para escoliosis y ortopedia infantil, que hoy quedan sin blog que las alimente.
- Breadcrumbs, titles de 60 caracteres o menos e imágenes OG propias por página: fase 10.
- Páginas por sede y el enlazado hacia ellas: fase 9.
- Publicar precio de consulta: bloqueado hasta que el doctor confirme la cifra.
- Ronda de revisión del doctor sobre el contenido publicado: posterior a esta fase, por decisión de Juan.

</deferred>
