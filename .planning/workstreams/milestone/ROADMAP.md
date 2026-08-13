# Roadmap: Sitio web Dr. Juan Carlos Angulo Totesaut

## Milestones

- [x] **v1.0 MVP** (fases 1-6, entregado 2026-08-09): sitio completo con contenido, conversión, tracking, CV, sedes y deploy en Dokploy, todavía sin dominio público.
- [ ] **v1.1 Lanzamiento público y competitividad SEO** (fases 7-11, en curso): poner el sitio vivo en drangulocolumna.com y llevarlo de "existe" a "compite" en las SERP de Lima.

## Overview

La auditoría del 2026-08-10 encontró un sitio terminado que nadie puede visitar: drangulocolumna.com servía la página parqueada de Porkbun mientras la ficha de Google Business Profile del doctor ya mandaba pacientes ahí. v1.1 arranca resolviendo eso, porque ninguna otra mejora se puede medir hasta que el sitio responda en su dominio. Con el dominio vivo y el sitio en Search Console, el trabajo se abre en tres frentes de contenido y uno manual: primero el silo clínico (una URL por condición, con los posts del blog convertidos en contenido de fondo que empuja hacia esas URLs), luego las cuatro sedes con URL propia para pelear las búsquedas por clínica, después el schema y la metadata que cubren todas las rutas nuevas y viejas, y al final el trabajo de local SEO en la ficha del doctor, que es manual y queda documentado en el repo.

## Phases

<details>
<summary>v1.0 MVP (fases 1-6), entregado 2026-08-09</summary>

- [x] **Phase 1: Fundación técnica y de marca** - Scaffold Next.js, design tokens de marca real, layout global con WhatsApp flotante
- [x] **Phase 2: Páginas core y trayectoria** - Home, Servicios, Testimonios, FAQ, Sobre el doctor con CV extenso
- [x] **Phase 3: Conversión, tracking y SEO técnico** - Formulario+Resend, JSON-LD, sitemap/robots, eventos GA4/Meta Pixel
- [x] **Phase 4: Contenido SEO, legal y publicación** - Blog inicial, privacidad/cookies, QA visual/performance, deploy
- [x] **Phase 5: Material real del doctor y feed de Instagram** - Fotos AVIF, logo oficial, trayectoria confirmada, carrusel de reels autoactualizable
- [x] **Phase 6: Sedes, horarios y flujo de agenda** - Cuatro sedes con horarios, página /agendar, WhatsApp acotado al consultorio privado

</details>

**v1.1 Lanzamiento público y competitividad SEO (en curso)**

- [ ] **Phase 7: Dominio público, producción y Search Console** - drangulocolumna.com sirviendo el sitio con HTTPS, www redirigido, canonicals reales, Resend verificado y sitemap enviado a Google
- [ ] **Phase 8: Silo clínico: páginas por servicio y blog profundo** - Una URL por condición con 900+ palabras revisadas por el doctor, hub de servicios y los cuatro posts expandidos con enlace a su servicio
- [ ] **Phase 9: Páginas por sede y cobertura local** - Las cuatro sedes con URL propia, schema de ubicación y enlace en ambos sentidos con /agendar
- [ ] **Phase 10: Schema, metadata y limpieza técnica** - Breadcrumbs, credenciales, horarios, reseñas, titles y OG por página, llms.txt y limpieza de assets
- [ ] **Phase 11: Local SEO: GBP, reseñas y citaciones** - Ficha corregida, categorías, campaña de reseñas hacia 15-20, NAP consistente y UTM del GBP resolviendo a URLs vivas

## Phase Details

<details>
<summary>Detalle de las fases 1-6 (v1.0). Planes y verificaciones archivados en .planning/milestones/v1.0-phases/</summary>

### Phase 1: Fundación técnica y de marca
**Goal**: Proyecto Next.js corriendo con la identidad visual real del doctor y el esqueleto de layout en todas las páginas.
**Requirements**: INFRA-01, INFRA-02, INFRA-04, BRAND-01, BRAND-02, BRAND-03, BRAND-04
**Plans**: 2 plans

Plans:
- [x] 01-01: Scaffold Next.js + Tailwind + estructura de carpetas + fuentes/colores de marca
- [x] 01-02: Layout global (header, nav, footer, WhatsAppCta flotante) + logo/favicon placeholder

### Phase 2: Páginas core y trayectoria
**Goal**: Todas las páginas de contenido principales con copy real, incluida la trayectoria del doctor.
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CV-01, CV-02
**Plans**: 3 plans

Plans:
- [x] 02-01: Home (hero, especialidades, previews de testimonios/FAQ)
- [x] 02-02: Servicios/condiciones + Testimonios + FAQ
- [x] 02-03: Sobre el doctor / Trayectoria con sección de CV

### Phase 3: Conversión, tracking y SEO técnico
**Goal**: Toda interacción de contacto funciona y queda medida; el sitio es técnicamente indexable.
**Requirements**: CONTENT-05, CONTACT-01, CONTACT-02, CONTACT-03, CONTACT-04, TRACK-01, TRACK-02, TRACK-03, TRACK-04, SEO-01, SEO-02, SEO-03
**Plans**: 3 plans

Plans:
- [x] 03-01: Página de Contacto + formulario (Server Action, Resend, fallback WhatsApp)
- [x] 03-02: Tracking GA4 + Meta Pixel + evento whatsapp_click en todos los CTAs
- [x] 03-03: JSON-LD Physician/FAQPage + sitemap.ts + robots.ts + metadata por página

### Phase 4: Contenido SEO, legal y publicación
**Goal**: Blog propio, cumplimiento de privacidad/cookies, QA visual y despliegue en producción.
**Requirements**: BLOG-01, LEGAL-01, LEGAL-02, SEO-04, INFRA-03
**Plans**: 2 plans

Plans:
- [x] 04-01: Blog (listado + artículos) + Política de Privacidad + banner de cookies
- [x] 04-02: QA visual/responsive/performance + deploy (Dokploy, no Vercel)

### Phase 5: Material real del doctor y feed de Instagram
**Goal**: El sitio muestra el material real del doctor y un carrusel de reels que se actualiza solo.
**Requirements**: MEDIA-01, MEDIA-02, MEDIA-03, CV-03, CONTENT-06, SOCIAL-01, SOCIAL-02
**Plans**: 4 plans

Plans:
- [x] 05-01: Fotos AVIF + logo oficial + imagen social + trayectoria y procedimientos reales
- [x] 05-02: Carrusel de reels de Instagram + endpoint de renovación de token + documentación
- [x] 05-03: Fotos reales de quirófano en Home, Servicios y Sobre el doctor
- [x] 05-04: CV completo del doctor (trayectoria, cursos y entrenamientos internacionales)

### Phase 6: Sedes, horarios y flujo de agenda
**Goal**: El paciente ve dónde atiende el doctor y agenda por el canal que corresponde a cada sede.
**Requirements**: LOC-01, LOC-02, LOC-03, LOC-04
**Plans**: 1 plan

Plans:
- [x] 06-01: Fuente de verdad de sedes + página /agendar + reruteo de CTA, contenido y schema

</details>

### Phase 7: Dominio público, producción y Search Console
**Goal**: Un paciente que escribe drangulocolumna.com llega al sitio del doctor, todo lo que el sitio publica de sí mismo apunta a ese dominio, el formulario entrega correo real y Google ya tiene el sitemap.
**Depends on**: Phase 6 (v1.0 en producción, sin dominio)
**Requirements**: DOM-01, DOM-02, DOM-03, DOM-04, DOM-05
**Success Criteria** (qué debe ser TRUE):
  1. Escribir `drangulocolumna.com` abre el sitio del doctor con candado válido de Let's Encrypt, no la página parqueada de Porkbun.
  2. `www.drangulocolumna.com` termina en `https://drangulocolumna.com` con un solo salto 301, sin pasar por HTTP en el camino.
  3. El código fuente de cualquier página muestra canonical, `og:url` y las URLs del sitemap sobre `https://drangulocolumna.com`, y sin `NEXT_PUBLIC_SITE_URL` el sitio no puede caer a un dominio muerto (el fallback de `siteConfig.url` ya no menciona vercel.app).
  4. Un envío de prueba del formulario llega como email a la casilla del doctor, enviado por Resend desde el dominio verificado.
  5. La propiedad aparece verificada en Search Console, el sitemap enviado, y las rutas base responden 200 e indexables: las 8 indexables (`/`, `/servicios`, `/sobre-el-doctor`, `/testimonios`, `/preguntas-frecuentes`, `/contacto`, `/blog`, `/agendar`) sin `noindex`, y `/privacidad` viva pero fuera del sitemap porque v1.0 la marcó `noindex, follow` a propósito (decisión D-10, cerrada por Juan el 2026-08-10: se saca del sitemap y se respeta el `noindex`; el sitemap queda en 12 URLs). Confirmar que Google las indexó queda como seguimiento posterior al cierre (decisión de 07-CONTEXT.md), no es criterio de aceptación.
**Plans**: 5 plans

Plans:
- [ ] 07-01-PLAN.md — Respaldo de origen: `src/proxy.ts` 301 de www al apex, desplegado, más verificación medida de DOM-01 y DOM-03
- [ ] 07-02-PLAN.md — Redirect Rule de Cloudflare al borde y retiro del hostname `www` de la aplicación en Dokploy
- [ ] 07-03-PLAN.md — Fallo de envío del formulario visible en el log y sitemap sin la ruta `noindex`
- [ ] 07-04-PLAN.md — Resend: dominio verificado, API key y las tres variables de correo en producción
- [ ] 07-05-PLAN.md — Search Console: propiedad de dominio verificada por TXT y sitemap enviado

**Notas de ejecución**
- **Corrección del 2026-08-09, medida contra producción.** El texto de abajo se escribió cuando el dominio servía la página parqueada de Porkbun. Ya no es así. `https://drangulocolumna.com` responde 200 con la app y certificado válido (DOM-01 cumplido), los canonicals, `og:url` y el sitemap ya salen sobre el apex (DOM-03 cumplido) y los nameservers están en Cloudflare. Lo que queda es la redirección de `www` (DOM-02), las variables de Resend (DOM-04) y Search Console (DOM-05). La tabla de estado medido vive en `07-CONTEXT.md` y manda sobre estas notas.
- Hosting es Dokploy self-hosted sobre Hetzner (`sapling-vps-01`), no Vercel. Los dos hostnames ya están creados con la API de Dokploy sobre `applicationId: 29ZFzVVwEczNI733DodMp`, puerto `3000`, HTTPS con Let's Encrypt; la fase quita el de `www`, no crea ninguno. Las variables de producción van por `application.saveEnvironment` seguido de `application.deploy` (o `infra/apps/set-env-and-redeploy.sh` del repo `hosting`). Pasos exactos en `.planning/milestones/v1.0-phases/04-contenido-seo-legal-y-publicaci-n/04-VERIFICATION.md`, sección Human Verification Required.
- DNS: registro `A` del apex hacia la IP de `sapling-vps-01` y el `www` hacia el apex. Si algo queda proxeado por Cloudflare, dejarlo en DNS-only hasta que emita el certificado.
- DOM-05 va después de DOM-01 dentro de la fase: no se puede verificar la propiedad ni enviar sitemap de un dominio que sirve otra cosa.
- Esta fase cierra INFRA-03 de v1.0 y desbloquea la verificación humana diferida de la fase 4.
- El feed de Instagram (SOCIAL-01/02) no entra aquí, pero el cron por HTTPS depende de este dominio.

### Phase 8: Silo clínico: páginas por servicio y blog profundo
**Goal**: Cada condición que la gente busca en Lima tiene su propia URL con contenido clínico de fondo aprobado por el doctor, y el blog deja de ser resumen para empujar tráfico hacia esas URLs.
**Depends on**: Phase 7
**Requirements**: SVC-01, SVC-02, SVC-03, SVC-04, SVC-05, BLOG-02, BLOG-03
**Success Criteria** (qué debe ser TRUE):
  1. Existen cuatro URLs dedicadas (hernia discal, estenosis espinal, escoliosis y deformidades, ortopedia infantil), cada una con 900 palabras o más y con `MedicalProcedure` que pasa el Rich Results Test sin errores.
  2. `/servicios` funciona como hub: enlaza a las cuatro páginas, cada página enlaza de vuelta al hub y ofrece CTA de agenda sin obligar al paciente a volver al inicio.
  3. Los cuatro posts existentes superan las 900 palabras y cada uno enlaza a la página de servicio de su tema con un CTA de agenda al cierre.
  4. Todo el contenido clínico publicado se apoya únicamente en fuentes ya verificadas del proyecto: el CV confirmado del doctor, `src/content/` de v1.0, y consenso clínico general no atribuido a él. Cero credenciales, cifras de cirugías, tasas de éxito o resultados inventados. Cada página lleva un aviso de que la información es educativa y no reemplaza una consulta.

  > **Criterio modificado el 2026-08-10 por decisión de Juan.** La redacción original era "Nada de este contenido clínico está publicado sin la aprobación escrita del doctor". Juan optó por escribir y publicar directo, sin ronda previa de revisión médica. Queda registrado que el contenido YMYL sale a un sitio con el nombre del doctor sin su visto bueno previo, y que la revisión pasa a ser posterior a la publicación. La restricción equivalente de PROJECT.md se actualizó en el mismo commit. El criterio se reescribió para que siga siendo verificable en vez de quedar imposible de cumplir.
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 08-01-PLAN.md — Trazador del silo: `/servicios/hernia-discal` de punta a punta, componentes de firma, aviso, tabla de contenidos y banner, tarjeta del hub, schema `MedicalWebPage`, sitemap y la puerta automática `scripts/check-content.mjs`
- [ ] 08-02-PLAN.md — Las otras tres guías del silo: estenosis espinal, escoliosis y ortopedia infantil, solo datos, con el hub en cuatro tarjetas y el sitemap en 16 URLs
- [ ] 08-03-PLAN.md — Blog: nueva forma de `BlogPost` con secciones y anclas, plantilla de post reconstruida con firma, tabla de contenidos, banner y enlace al servicio, más los dos posts de hernia discal sobre 900 palabras
- [ ] 08-04-PLAN.md — Blog: los dos posts restantes sobre 900 palabras, puerta de contenido completa sobre las ocho URLs y verificación humana de teclado, responsive y contenido publicado

**Notas de ejecución**
- Gate de contenido médico: la redacción original de esta nota decía que el doctor revisa y aprueba antes de publicar. Quedó superada por la decisión de Juan del 2026-08-10, registrada en `08-CONTEXT.md` y en las Constraints de PROJECT.md: se publica directo y la revisión del doctor pasa a ser posterior. Lo que reemplaza a la aprobación previa son las diez salvaguardas SAFE del contrato de diseño, verificadas por `scripts/check-content.mjs` en cada plan.
- BLOG-03 se ejecuta después de que existan las páginas de servicio, porque cada post enlaza a la suya.
- Nada de credenciales, cifras de cirugías ni resultados inventados. Solo lo verificado o lo que el doctor confirme por escrito.
- El hub `/servicios` ya existe desde v1.0 con `src/content/services.ts`. La fase lo reconvierte en índice del silo, no lo reescribe desde cero.
- Breadcrumbs, titles y OG de estas rutas nuevas los cubre la fase 10.

### Phase 9: Páginas por sede y cobertura local
**Goal**: Cada sede pelea su propia búsqueda con página propia, en vez de competir todas desde una página genérica.
**Depends on**: Phase 8
**Requirements**: SEDE-01, SEDE-02, SEDE-03
**Success Criteria** (qué debe ser TRUE):
  1. Las cuatro sedes (consultorio privado en Surco, Ricardo Palma, Sanna La Molina, Padre Luis Tezza) tienen URL propia con dirección, días, horario y el canal de agenda que corresponde a esa sede.
  2. La página de Ricardo Palma nombra la clínica en title, H1 y contenido, y un `site:drangulocolumna.com ricardo palma` la devuelve a ella, no a `/servicios` ni a `/agendar`.
  3. Cada página de sede declara su propio JSON-LD de ubicación, válido en el Rich Results Test, con la dirección y el horario de esa sede.
  4. `/agendar` enlaza a cada página de sede y cada página de sede vuelve a `/agendar` con su sede ya seleccionada.
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 09-01-PLAN.md (ola 1, trazador): `/sedes/clinica-ricardo-palma` de punta a punta, hub `/sedes`, schema por sede, enlazado con `/agendar` y puerta `sedes:check`
- [ ] 09-02-PLAN.md (ola 2): las tres sedes restantes, `url` canónica del nodo de cada sede y la puerta cubriendo el contraste de canal
- [ ] 09-03-PLAN.md (ola 3): el header apunta al hub con submenú móvil, más la verificación humana de la fase

**Notas de ejecución**
- La fuente de verdad sigue siendo `src/content/locations.ts` (v1.0, fase 6). Las páginas se generan desde ahí, no duplicando datos.
- Ricardo Palma es la prioritaria: la related search "traumatologo especialista en columna clínica ricardo palma" está verificada en la SERP y hoy nadie del sitio la responde.
- SEDE-03 depende de SEDE-01: primero existen las rutas, después el schema y el enlazado con `/agendar`.
- Sigue vigente que el WhatsApp del doctor agenda solo el consultorio privado (LOC-03). Las páginas de clínica muestran el canal oficial de cada clínica.
- Pendiente humano heredado: confirmar si el doctor sigue atendiendo en Clínica Montefiori. Si vuelve, es una quinta sede con el mismo patrón.

### Phase 10: Schema, metadata y limpieza técnica
**Goal**: Google y los motores generativos leen el sitio completo sin ambigüedad: quién es el doctor, qué acredita, cuándo atiende, qué opera y dónde está parado el usuario dentro del sitio.
**Depends on**: Phase 9 (las rutas de servicio y sede ya existen y hay que cubrirlas)
**Requirements**: SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, SEO-10, SEO-11
**Success Criteria** (qué debe ser TRUE):
  1. Toda página anidada (servicios, sedes y blog) declara `BreadcrumbList` válido y el resultado de Google muestra la miga de pan en lugar de la URL cruda.
  2. El `Physician` declara `hasCredential` con CMP 83189 y RNE 35310 más `openingHoursSpecification` del consultorio privado, y valida sin errores.
  3. Los testimonios publicados que son verificables están marcados con `Review` o `AggregateRating`, y ninguno no verificable aparece marcado.
  4. Ningún title del sitio pasa de 60 caracteres ni ninguna description de 155, contando las 9 rutas base más las de servicio y sede, y compartir cualquier URL en WhatsApp muestra la imagen OG propia de esa página.
  5. `/llms.txt` responde 200 con el resumen del sitio y `dr-angulo-portrait.png` ya no está ni en el repo ni en el build.
**Plans**: 3 plans

Plans:
- [ ] 10-01-PLAN.md (ola 1): title y meta del paquete on-page de v1.2 en las 9 rutas base con metadata estática, más los valores por defecto de Open Graph del layout
- [ ] 10-02-PLAN.md (ola 1): title y meta del paquete en las entradas de `src/content/` que alimentan sedes, guías de servicio y blog
- [ ] 10-03-PLAN.md (ola 2): la cuarta puerta pasa a medir 60/155, REQUIREMENTS.md al día y revisión de Juan sobre la tabla final

**Notas de ejecución**
- SEO-05, SEO-06, SEO-07, SEO-09, SEO-10 y SEO-11 se cerraron en la corrida ad-hoc de esta fase, sin PLAN.md, y están documentados en `10-SUMMARY.md`. Los tres planes de arriba cubren únicamente SEO-08, que quedó diferido en esa corrida.
- El texto de los titles y las metas sale del paquete on-page del workstream `seo-keywords` (v1.2), aprobado por el doctor. La decisión del 2026-08-10 de que Juan los escribiera él quedó sin efecto.
- El plan 10-02 no puede correr antes de que la fase 8 haya aterrizado sus rutas nuevas, sus renombres de slug y sus 301.
- Esta fase corre después de las fases 8 y 9 a propósito: si corriera antes, los breadcrumbs, los titles y las imágenes OG dejarían fuera las rutas nuevas y habría que rehacer el trabajo.
- SEO-06 necesita las horas exactas del consultorio privado los viernes y sábados. Hoy la ficha dice "horario coordinado al agendar". Si el doctor no las confirma a tiempo, se publica el rango que sí confirme y se anota el resto como pendiente, sin inventar horarios.
- SEO-07 solo marca lo verificable. El testimonio en video vive en un post de Instagram y no se puede citar como `Review` con autor identificable mientras no haya texto o autorización.
- SEO-11 es limpieza: `dr-angulo-portrait.png` son 489 KB con permisos `rw-------` y sin ninguna referencia en el código.

### Phase 11: Local SEO: GBP, reseñas y citaciones
**Goal**: La ficha del doctor en Google deja de contradecir al sitio, empieza a competir en el local pack y su tráfico se puede medir.
**Depends on**: Phase 7 (GBP-05 necesita que las URLs con UTM resuelvan a un sitio vivo)
**Requirements**: GBP-01, GBP-02, GBP-03, GBP-04, GBP-05
**Success Criteria** (qué debe ser TRUE):
  1. El horario publicado en el GBP coincide con los días reales de atención y desaparece el "cerrado lunes a jueves" que hoy contradice a las cuatro sedes del sitio.
  2. La ficha declara categorías secundarias y servicios además de "Cirujano ortopédico".
  3. La ficha pasa de 6 a entre 15 y 20 reseñas siguiendo un procedimiento de solicitud documentado en el repo.
  4. El nombre, la dirección y el teléfono del doctor son idénticos en el sitio, el GBP, Doctoralia, el registro del CMP y los directorios de las cuatro clínicas.
  5. El botón de sitio web y el de reservas del GBP abren una URL viva de drangulocolumna.com y esa visita aparece en GA4 con `utm_campaign=gbp`.
**Plans**: TBD

**Notas de ejecución**
- Esta fase no produce código de aplicación. Produce un checklist documentado en el repo (por ejemplo `docs/local-seo-gbp.md`) con los pasos exactos, el texto de solicitud de reseñas y la tabla de citaciones con su estado.
- La ejecución material es del doctor y de Juan: requiere acceso a la ficha de Google Business Profile, al perfil de Doctoralia y a los directorios de las clínicas. El agente prepara, verifica y deja constancia.
- GBP-03 es una campaña, no un despliegue: se cierra cuando el contador de reseñas llega al rango, y eso puede tardar semanas después de que el checklist esté listo. Conviene verificarla por separado del resto.
- GBP-01 depende de que el doctor confirme sus días y horas reales por sede, el mismo dato que necesita SEO-06.
- Se puede arrancar en paralelo a las fases 8, 9 y 10 una vez que la fase 7 esté cerrada, porque no toca el código de la aplicación.

## Progress

**Execution Order:**
Las fases se ejecutan en orden numérico: 7 → 8 → 9 → 10 → 11. La fase 11 no toca código y puede adelantarse en paralelo apenas cierre la 7.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Fundación técnica y de marca | v1.0 | 2/2 | Complete | 2026-07-31 |
| 2. Páginas core y trayectoria | v1.0 | 3/3 | Complete | 2026-07-31 |
| 3. Conversión, tracking y SEO técnico | v1.0 | 3/3 | Complete | 2026-07-31 |
| 4. Contenido SEO, legal y publicación | v1.0 | 2/2 | Complete (dominio lo cierra la fase 7) | 2026-07-31 |
| 5. Material real y feed de Instagram | v1.0 | 4/4 | Complete (vinculación de Instagram pendiente) | 2026-08-09 |
| 6. Sedes, horarios y flujo de agenda | v1.0 | 1/1 | Complete (falta confirmar Montefiori) | 2026-08-09 |
| 7. Dominio público, producción y Search Console | v1.1 | 0/5 | Planned | - |
| 8. Silo clínico: servicios y blog profundo | v1.1 | 0/TBD | Not started | - |
| 9. Páginas por sede y cobertura local | v1.1 | 0/TBD | Not started | - |
| 10. Schema, metadata y limpieza técnica | v1.1 | 0/TBD | Not started | - |
| 11. Local SEO: GBP, reseñas y citaciones | v1.1 | 0/TBD | Not started | - |

---
*Roadmap v1.1 creado: 2026-08-10, a partir de la auditoría SEO del mismo día*
