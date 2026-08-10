# Phase 10: Schema, metadata y limpieza técnica - Context

**Gathered:** 2026-08-10
**Status:** Ready for planning

<domain>
## Phase Boundary

La fase cierra la capa de lectura automatizada del sitio: que Google y los motores generativos entiendan sin ambigüedad quién es el doctor, qué acredita, cuándo atiende, qué opera y dónde está parado el usuario dentro del sitio.

Corre después de las fases 8 y 9 a propósito. Si corriera antes, los breadcrumbs, los titles y las imágenes OG dejarían fuera las 9 rutas nuevas de servicio y sede, y habría que rehacer el trabajo.

Queda fuera: Google Business Profile, campaña de reseñas y citaciones NAP, que son de la fase 11. Contenido clínico nuevo, cerrado en la fase 8. Páginas nuevas de cualquier tipo.

### Estado real medido contra el build el 2026-08-10, antes de planificar

El ROADMAP de esta fase se escribió antes de que existieran las fases 8 y 9 y antes del commit `5387091`, que adelantó bastante trabajo. La medición manda sobre el ROADMAP.

| Req | Estado medido | Evidencia |
|-----|---------------|-----------|
| SEO-05 breadcrumbs | **Ya cumplido** | `BreadcrumbList` presente en `/servicios/[slug]`, `/sedes/[slug]` y `/blog/[slug]`. Verificar, no reconstruir |
| SEO-06 credenciales y horarios | **Ya cumplido en estructura** | `hasCredential` y `openingHoursSpecification` presentes en el grafo raíz. Falta el dato humano del horario exacto |
| SEO-07 marcado de reseñas | **Pendiente y delicado** | Cero `Review` y cero `AggregateRating` en `/testimonios`. Ver abajo |
| SEO-08 titles, descriptions y OG | **Pendiente, es el grueso** | 17 rutas fuera de rango. Una sola imagen OG para las 14 rutas |
| SEO-09 | Ver requisitos | |
| SEO-10 llms.txt | **Pendiente** | No existe el archivo |
| SEO-11 limpieza | **Pendiente** | `public/dr-angulo-portrait.png` sigue en el repo y no lo referencia nada de `src/` |

</domain>

<decisions>
## Implementation Decisions

### SEO-08, el grueso de la fase

Medición exacta contra el build. Los titles incluyen el sufijo del layout, ` | Dr. Juan Angulo`, que son 19 caracteres, así que el título base tiene que ser corto de verdad.

Titles por encima de 60 caracteres, 15 rutas:

`/` 76, `/agendar` 64, `/servicios` 74, `/sedes` 71, `/sobre-el-doctor` 74, `/servicios/hernia-discal` 68, `/servicios/estenosis-espinal` 72, `/servicios/escoliosis` 81, `/servicios/ortopedia-infantil` 81, `/sedes/consultorio-privado` 71, `/sedes/clinica-ricardo-palma` 77, `/sedes/clinica-tezza` 80, `/sedes/sanna-la-molina` 85, y tres posts del blog en 72, 73 y 81.

Descriptions por encima de 155 caracteres, 7 rutas:

`/sobre-el-doctor` 265, `/agendar` 204, `/servicios/estenosis-espinal` 197, `/servicios` 190, `/servicios/escoliosis` 188, `/servicios/ortopedia-infantil` 182, `/contacto` 174, `/servicios/hernia-discal` 167.

Decisiones:

- Se acortan title y description de todas esas rutas sin perder la keyword principal de cada una. En Ricardo Palma en particular, el nombre de la clínica no se puede caer: es lo que la fase 9 puso ahí a propósito para atacar la related search verificada.
- La comprobación se automatiza en una puerta ejecutable que mide sobre el HTML prerenderizado, igual que `scripts/check-content.mjs` y `scripts/check-sedes.mjs`. No se verifica a mano ruta por ruta, porque el sitio va a seguir creciendo.
- El límite se mide sobre el title final renderizado, con sufijo incluido, que es lo que ve Google.

### Imágenes OG

- Hoy las 14 rutas comparten `og-dr-angulo.jpg`. El criterio pide imagen propia por página.
- Se generan con la API de imágenes OG de Next.js, no como archivos estáticos: son 21 rutas y mantener 21 JPG a mano es insostenible. Cada imagen lleva el título de la página sobre la identidad de marca.
- Antes de escribir código hay que leer la guía correspondiente en `node_modules/next/dist/docs/`. Esta versión de Next difiere del entrenamiento y ya causó dos errores reales en este proyecto.

### SEO-07, marcado de reseñas. Es lo más delicado de la fase

- Hoy `src/content/testimonials.ts` tiene **un solo** testimonio: "Excelente profesional", de Doctoralia, atribuido a "Paciente verificado". Marcar `AggregateRating` con eso sería marcar una nota agregada sobre una sola reseña anónima.
- Lo que sí existe y es real: la ficha de Google del consultorio, con 5.0 y 6 reseñas, y toda la infraestructura para leerla ya construida en `src/lib/google-reviews.ts`, con `GOOGLE_PLACES_API_KEY` ya cargada en producción.
- **Decisión:** el `AggregateRating` sale de la ficha de Google en vivo, no de datos escritos a mano. Si la API no responde o la clave falta, no se emite marcado. Nunca se inventa una nota ni un conteo.
- El criterio dice explícitamente que "ninguno no verificable aparece marcado". El testimonio en video de Instagram sigue solo enlazado, sin marcar.
- Los términos de Google, ya documentados en `google-reviews.ts`, prohíben almacenar reseñas más de 30 días. El marcado se genera en el render, nunca se persiste.

### SEO-06, el dato que falta

- La estructura ya está: `hasCredential` con CMP 83189 y RNE 35310, y `openingHoursSpecification`, ambos presentes en el grafo raíz.
- Falta el dato humano: las horas exactas del consultorio privado los viernes y sábados. Hoy la ficha dice "horario coordinado al agendar".
- **No se inventan horarios.** Si el doctor no confirma a tiempo, se publica solo el rango confirmado y el resto queda anotado como pendiente. Es un bloqueo de dato, no de código, y no debe frenar el resto de la fase.

### SEO-10 y SEO-11

- `/llms.txt` responde 200 con el resumen del sitio: quién es el doctor, qué acredita, qué condiciones cubre, dónde atiende y cómo se agenda, con enlaces a las rutas canónicas. Se genera desde las mismas fuentes de datos que ya existen, no se escribe a mano, para que no se desincronice.
- `public/dr-angulo-portrait.png` se borra. Ya se verificó que ningún archivo de `src/` lo referencia.

### Claude's Discretion

- Nombre y forma de la puerta de metadata, y si conviene una puerta nueva o extender una existente.
- Redacción concreta de cada title y description acortados, respetando la keyword de cada ruta.
- Diseño de la plantilla de imagen OG.
- Formato exacto de `/llms.txt` dentro de la convención del formato.
- Reparto en planes y olas.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/components/structured-data.tsx` es grande y ya exporta `BreadcrumbJsonLd`, `FaqJsonLd`, `ServicesJsonLd`, `MedicalWebPageJsonLd`, `ProfilePageJsonLd`, `BookingPageJsonLd`, `ContactPageJsonLd`, `BlogJsonLd`, `BlogPostingJsonLd` y `SedeJsonLd`, más la función `locationNode` que alimenta el grafo raíz. Leerlo antes de escribir cualquier schema y extender, nunca duplicar.
- `src/lib/google-reviews.ts` ya implementa el cliente de Places API con caché de 24 h, techo propio de llamadas diarias y degradación a null sin clave. Es la fuente para el `AggregateRating`.
- `src/content/` tiene las fuentes de verdad: `cv.ts` para credenciales, `locations.ts` para sedes y horarios, `service-pages.ts` y `location-pages.ts` para las rutas nuevas, `blog.ts`, `testimonials.ts`, `faq.ts`.
- `scripts/check-content.mjs` y `scripts/check-sedes.mjs` establecen el patrón de puerta ejecutable sobre el HTML prerenderizado en `.next/server/app/`, con el helper `elementRange` para recortar regiones.

### Established Patterns

- Next.js 16, App Router, Tailwind CSS 4. Metadata API por página con `alternates.canonical`.
- Las puertas fallan en rojo cuando falta el build: aprobar por ausencia de evidencia es peor que no tener puerta.
- Tokens en `src/app/globals.css`. COLOR-01 sigue vigente: texto de marca por debajo de 24px usa `--primary-dark`.
- Nada de barras laterales de color tipo `border-l-4`, quitadas en el commit `c60f0c8`.

### Integration Points

- 21 rutas en el sitemap. `scripts/check-content.mjs` tiene `SITEMAP_TOTAL` en 21 y falla el proceso si no coincide: cualquier ruta nueva de esta fase obliga a subirlo.
- Deploy automático al pushear a `main`, build Nixpacks en Dokploy, `applicationId` `29ZFzVVwEczNI733DodMp`.
- Producción tiene `NEXT_PUBLIC_SITE_URL` y `GOOGLE_PLACES_API_KEY`. Esta fase no necesita variables nuevas.

</code_context>

<specifics>
## Specific Ideas

- El criterio 1 pide que "el resultado de Google muestre la miga de pan". Eso depende de que Google rastree e indexe, no del código. La fase garantiza y verifica la condición necesaria: `BreadcrumbList` válido en toda ruta anidada. La confirmación en la SERP es seguimiento posterior.
- Lo mismo con "compartir cualquier URL en WhatsApp muestra la imagen OG propia": se verifica que cada ruta declare su `og:image` propia y que esa URL responda 200. Cómo la cachea WhatsApp no es controlable.
- El sitio ya tiene tres puertas ejecutables. Sumar una cuarta para metadata es coherente con cómo se viene trabajando, y es lo que evita que un title largo vuelva a colarse en la fase 11 o en el próximo milestone.

</specifics>

<deferred>
## Deferred Ideas

- Confirmación en la SERP de que Google muestra breadcrumbs y de que indexó las rutas nuevas: seguimiento posterior, no bloquea.
- Horario exacto del consultorio los viernes y sábados: bloqueado por dato del doctor. Se publica lo confirmado.
- Google Business Profile, campaña de reseñas hacia 15-20 y citaciones NAP: fase 11.
- Testimonios en video de Instagram: siguen enlazados sin marcar hasta que el doctor entregue el texto o el permiso de citarlos.
- Clínica Montefiori como quinta sede: sigue pendiente de confirmación del doctor, heredado de la fase 6.

</deferred>
