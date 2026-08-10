# Phase 9: Páginas por sede y cobertura local - Context

**Gathered:** 2026-08-10
**Status:** Ready for planning

<domain>
## Phase Boundary

La fase entrega una URL propia por cada sede donde atiende el doctor, con su dirección, horario y el canal de agenda que corresponde a esa sede, más el schema de ubicación y el enlazado en ambos sentidos con `/agendar`.

El objetivo real es competitivo, no informativo: hoy las cuatro sedes compiten desde una sola página genérica y la related search verificada "traumatologo especialista en columna clínica ricardo palma" no tiene ninguna página del sitio que la responda.

Queda fuera: breadcrumbs, titles de 60 caracteres, imágenes OG y `llms.txt`, que son de la fase 10. El trabajo de Google Business Profile, reseñas y citaciones NAP, que es de la fase 11. Contenido clínico nuevo, que se cerró en la fase 8.

### Punto de partida, verificado el 2026-08-10

`src/content/locations.ts` ya es la fuente de verdad y viene de v1.0, fase 6. Trae las cuatro sedes con slug, nombre, tipo, dirección completa, edificio, referencia, geo, URL de mapa, teléfono en E.164, web oficial, horario legible, `openingHours` en vocabulario de schema.org, resumen de agenda y canales. No falta ningún dato para construir estas páginas: la fase es de presentación y enlazado, no de recolección.

Slugs existentes, que se reutilizan tal cual: `consultorio-privado`, `clinica-ricardo-palma`, `sanna-la-molina`, `clinica-tezza`.

El archivo también exporta `primaryLocation`, `clinicLocations` y `weeklySchedule`, ya consumidos por `/agendar` y por `LocationCard`.

</domain>

<decisions>
## Implementation Decisions

### Rutas y estructura

- URLs bajo `/sedes/`: `/sedes/consultorio-privado`, `/sedes/clinica-ricardo-palma`, `/sedes/sanna-la-molina`, `/sedes/clinica-tezza`. Los slugs salen de `locations.ts` sin renombrar nada.
- `/sedes` existe como hub índice de las cuatro. `/agendar` se conserva como flujo de conversión y enlaza al hub. Son dos intenciones distintas y merecen dos páginas: "dónde atiende" contra "quiero una cita".
- Se generan con una ruta dinámica `[slug]` alimentada por `locations.ts`, mismo patrón que las páginas de servicio de la fase 8. Cero duplicación de datos.
- Title de la página de Ricardo Palma: "Traumatólogo y cirujano de columna en Clínica Ricardo Palma". Ataca directo la related search verificada en la auditoría. El nombre de la clínica aparece en title, `h1` y cuerpo.

### Contenido por sede

- Extensión media, no del tamaño de una página de servicio. Es intención local, no informativa: nadie busca una sede para leer 900 palabras. No se fija mínimo de palabras y la puerta de contenido de la fase 8 no aplica a estas rutas.
- Cada página lleva: dirección completa, cómo llegar con referencias del barrio, días y horarios, canal de agenda de esa sede, y qué condiciones se atienden ahí con enlace a las cuatro páginas de servicio de la fase 8.
- El enlace hacia las páginas de servicio es parte del silo: las sedes alimentan al silo clínico, no compiten con él.

### Schema

- `MedicalClinic` para las tres clínicas y `MedicalBusiness` para el consultorio privado, uno por página, cada uno con su `address`, `geo` y `openingHoursSpecification` derivados de `locations.ts`.
- Hoy existe un solo `Physician` con varias ubicaciones. Esta fase agrega el schema por sede sin romper el existente.
- Ojo antes de escribir: `src/components/structured-data.tsx` creció mucho en el commit `5387091` y ya trae `openingHoursSpecification`, `hasCredential`, breadcrumbs y marcado de reseñas. Hay que leerlo y extenderlo, no duplicarlo. Los componentes ya exportados son `BreadcrumbJsonLd`, `FaqJsonLd`, `ServicesJsonLd`, `MedicalWebPageJsonLd`, `ProfilePageJsonLd`, `BookingPageJsonLd`, `ContactPageJsonLd`, `BlogJsonLd` y `BlogPostingJsonLd`.

### Conversión y la regla del WhatsApp

- La regla de negocio de v1.0 se respeta de forma estricta: el WhatsApp del doctor agenda **solo** el consultorio privado. Las tres clínicas muestran su canal oficial, teléfono o web, nunca WhatsApp.
- El propio `locations.ts` documenta que esta es la confusión más frecuente de los pacientes. La interfaz tiene que dejarlo explícito, no dar a entender que el doctor gestiona agendas que no gestiona.
- "Volver a `/agendar` con la sede seleccionada" se resuelve con ancla por slug, `/agendar#clinica-ricardo-palma`, y la tarjeta de esa sede se resalta al llegar. Sin estado, sin query params, sin JavaScript de cliente.
- `/agendar` enlaza a cada página de sede y cada página de sede vuelve a `/agendar` con su ancla.

### Claude's Discretion

- Diseño visual de la página de sede y del hub, respetando el lenguaje ya establecido en la fase 8 y en v1.0.
- Cómo se resalta la tarjeta de destino al llegar por ancla, siempre que no requiera JavaScript de cliente y no rompa accesibilidad.
- Reparto del trabajo en planes y olas.
- Si conviene extraer un componente compartido con las tarjetas de sede que ya usa `/agendar`.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/content/locations.ts` es la fuente de verdad completa. Exporta `locations`, `primaryLocation`, `clinicLocations` y `weeklySchedule`, y los tipos `Location`, `BookingChannel`, `OpeningHours` y `SchemaDay`.
- `src/components/locations/location-card.tsx` ya renderiza una sede y lo usa `/agendar`.
- `src/app/agendar/page.tsx` consume `primaryLocation`, `clinicLocations` y `weeklySchedule`, y es el punto de enlazado en ambos sentidos.
- `src/app/servicios/[slug]/page.tsx` de la fase 8 es el análogo directo para la ruta dinámica: `generateStaticParams`, `generateMetadata` con canonical, y el patrón de banda de cabecera más cuerpo.
- Componentes de la fase 8 reutilizables donde apliquen: `ServiceItemGrid`, `TableOfContents`, `BookingCta`, `WhatsAppCta`.

### Established Patterns

- Next.js 16 con App Router, Tailwind CSS 4, contenido como código. Metadata API por página con `alternates.canonical`.
- Tokens de marca en `src/app/globals.css`. COLOR-01 de la fase 8 sigue vigente: texto de marca por debajo de 24px usa `--primary-dark`, nunca `--primary`, que da 4.37:1 y no pasa.
- `min-h-11` para objetivos táctiles, `outline-offset: 2px` en el anillo de foco.
- Nada de barras laterales de color tipo `border-l-4`: se quitó deliberadamente en el commit `c60f0c8`.

### Integration Points

- `src/app/sitemap.ts` pasa de 16 a 21 URLs: cuatro sedes más el hub `/sedes`.
- `src/components/layout/header.tsx` tiene el enlace "Sedes" apuntando hoy a `/agendar`. Hay que decidir si pasa a `/sedes` y, si el megamenú de servicios funcionó bien, si conviene el mismo patrón acá.
- Deploy automático al pushear a `main` en `github.com/Sve-nnN/dr-angulo-website`, build Nixpacks en Dokploy, `applicationId` `29ZFzVVwEczNI733DodMp`.
- Producción tiene dos variables: `NEXT_PUBLIC_SITE_URL` y `GOOGLE_PLACES_API_KEY`. Esta fase no necesita ninguna nueva.

</code_context>

<specifics>
## Specific Ideas

- Ricardo Palma es la sede prioritaria de la fase. La related search "traumatologo especialista en columna clínica ricardo palma" está verificada en la SERP del 2026-08-10 y hoy no hay ninguna página del sitio que la responda.
- El local pack de Lima lo lideran Centro de Columna Vertebral y Clínica De La Columna. Las páginas por sede son lo que permite competir por búsquedas del tipo "traumatólogo en {clínica}".
- Las cuatro sedes ya están publicadas en `/agendar` desde v1.0, así que esta fase no descubre información nueva: la reorganiza para que cada sede tenga su propia superficie indexable.

</specifics>

<deferred>
## Deferred Ideas

- Clínica Montefiori como quinta sede: pendiente de que el doctor confirme si sigue atendiendo ahí. Es verificación humana heredada de la fase 6 de v1.0. Si vuelve, entra con el mismo patrón y sin cambios de arquitectura.
- Breadcrumbs, titles de 60 caracteres o menos e imágenes OG propias por sede: fase 10.
- Google Business Profile, campaña de reseñas y citaciones NAP: fase 11.
- Páginas por distrito o por zona de Lima, del tipo "traumatólogo en Surco": no pedidas, y multiplicarían páginas sin sede real detrás.

</deferred>
