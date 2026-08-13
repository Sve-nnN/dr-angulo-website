---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Lanzamiento público y competitividad SEO
status: planning
last_updated: "2026-08-13T00:00:00.000Z"
last_activity: 2026-08-13
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-10)

**Core value:** Que un paciente que busca traumatólogo/cirujano de columna en Lima encuentre el sitio y agende cita por WhatsApp en menos de 2 clics, con todo evento rastreado.
**Current focus:** Fase 10, schema y metadata. Las fases 7, 8 y 9 están cerradas y desplegadas: el sitio vive en su dominio, tiene silo clínico con 4 páginas de servicio y 4 posts largos, y 4 páginas de sede. Sitemap en 21 URLs.

## Current Position

Phase: 8, reabierta para consumir el paquete on-page de v1.2 (planes 08-05 a 08-19, en cuatro olas)
Plan: 08-05 a 08-17 cerrados. El silo clínico entero está cerrado y las sedes ya empezaron: dos de las cuatro publican el cuerpo del paquete. Sitio en 22 URLs. Quedan 08-18 (las otras dos sedes) y 08-19 (preguntas frecuentes)
Status: En ejecución
Last activity: 2026-08-13, plan 08-17 ejecutado (split de location-pages, Ricardo Palma y Tezza publicadas, tres puertas en verde)

Progress: [████████░░] 4 de 5 fases de v1.1, con la 8 reabierta

### Fase 8 reabierta: el paquete on-page de v1.2

El workstream `seo-keywords` (v1.2) cerró con un paquete on-page que la fase 8 tiene que
publicar: dos esqueletos de sección distintos, cinco páginas de servicio y varios posts nuevos.
Ninguno de los dos esqueletos coincidía con la tupla de ocho claves que la fase 8 dejó en v1.0,
así que la fase se reabrió con 15 planes nuevos, 08-05 a 08-19, organizados en olas.

**Ola 1, plan 08-05, cerrado el 2026-08-13.** Es la única dependencia dura de toda la fase y no
publica una palabra de contenido: cambia el modelo de datos. `ServicePage.sections` pasó de
`Record` sobre una tupla global a un arreglo plano de secciones con `id` y `level` propios, así
una página puede declarar el esqueleto de guía clínica de ocho huecos o el de página de servicio
de cinco sin inventar secciones que su formato no tiene, y una subsección de nivel 3 puede ser
destino de un ancla. `src/content/service-pages.ts` y `src/content/blog.ts` se abrieron en
directorios con un módulo por página, con la ruta de importación pública intacta. `BlogPost` ganó
`h1` propio, separado de `title`, para que la fase 10 no borre el H1 al reescribir el title, y
`relatedService` pasó a opcional, porque hay temas cuyo destino natural es el hub y no una guía.

La migración la hizo un script mecánico sobre los archivos viejos, no una persona: se verificó
que las 382 cadenas de texto de las ocho páginas siguen apareciendo verbatim en el HTML
prerenderizado. Las 21 rutas compilan, `check-content.mjs` y `check-sedes.mjs` en verde. Un
cambio de aspecto intencional: la sección de tratamiento perdió su presentación en dos tarjetas
(`TreatmentCompare` se alimentaba de `subsections`, que ya no existe) y sus dos bloques ahora son
h3 con ancla propia. Detalle completo en `08-05-SUMMARY.md`.

**Ola 2, plan 08-06, cerrado el 2026-08-13.** `/servicios/hernia-discal` es la primera página que
publica el copy aprobado del paquete de v1.2: 20 secciones, 2808 palabras de cuerpo contra las
1936 que tenía, y adentro todo el material del post que la fase apaga después, con los tres ids
de destino de su tabla de absorción escritos y verificados en el HTML. Estrena `outboundLinks`,
que 08-05 dejó declarado y sin usar: ocho enlaces con los anchors literales de
`internal-links.json`. La transcripción la hizo un script desde `copy-guias.json`, no desde el
Markdown del paquete, porque el Markdown intercala la línea de estado de la ronda de revisión y
el JSON no la tiene.

El plan destapó un problema que afecta a toda la ola 2. La plantilla tenía la posición del banner
de conversión cableada en la segunda sección de nivel 2, que con el esqueleto de v1.0 daba 25 por
ciento del cuerpo. El paquete de v1.2 cuelga cuatro subsecciones de `sintomas` y ese punto se
corre al 39.2 por ciento, fuera de la ventana de 15 a 35 que exige POS-01, así que la puerta
falla y ningún cambio dentro del archivo de datos lo arregla. Se resolvió con
`ServicePage.bannerAfterSectionId`, que hace de la posición un dato de la página y deja el default
intacto para las otras tres guías: hernia discal declara `que-es` y cae en 15.8 por ciento. Es la
capacidad que `08-09-PLAN.md` iba a entregar en la ola 3; el orden real de dependencia la puso
antes.

**Ola 2, plan 08-07, cerrado el 2026-08-13.** `/servicios/estenosis-espinal` publica el copy
aprobado del paquete: 18 secciones, 2723 palabras. Declaró `bannerAfterSectionId: "que-es"` por
margen (el default daba 32.8 por ciento, a 2.2 puntos del techo de la ventana), no porque la
puerta lo exigiera. `tsc`, `lint`, `build`, `check-content.mjs` y `check-sedes.mjs` en verde sobre
las 8 rutas.

**Ola 2, plan 08-08, cerrado el 2026-08-13.** `/servicios/ortopedia-infantil` publica el copy
aprobado y es la única de las cuatro que no pasa a guía clínica: la SERP de Lima para
`ortopedia infantil lima` pide página de servicio, así que estrena `format: "pagina-de-servicio"`
con su esqueleto de cinco `h2` y quince `h3`, 1814 palabras de cuerpo. Las 67 cadenas del dataset
aparecen literales en el HTML.

El problema de posición del banner que 08-06 había dejado abierto se cerró acá. Ninguna frontera
de nivel 2 de esta página cae dentro de la ventana de POS-01: las dos disponibles miden 13.3 y
76.1 por ciento, porque `que-se-atiende` cuelga trece subsecciones y cierra recién en 69.9. La
resolución de `bannerAfterSectionId` se extendió para aceptar también un id de nivel 3, y entonces
el banner va dentro del `<section>` del padre, detrás de esa subsección. El default y el camino de
nivel 2 quedaron intactos, así que las otras tres páginas no se movieron: 15.8, 18.4 y 25.1.
Ortopedia infantil quedó en 23.5 por ciento, anclada en
`que-se-atiende--como-se-le-llama-al-ortopedista-de-ninos`, que de los tres candidatos medidos es
el que más margen deja contra los dos bordes.

**Lo que esto deja abierto.** `outboundLinks` de esta página sigue vacío por diseño: los enlaces
internos de las 16 URLs los escribe 08-18 de una sola vez. Y el colchón del banner importa para
los planes que vienen: 08-18 agrega bloque al pie y la fase 10 toca metadatos, y los 8.5 puntos
de margen por el lado del piso son lo que absorbe ese crecimiento.

**Ola 2, plan 08-09, cerrado el 2026-08-13.** Dos tareas separadas en dos commits. La primera
extrae `ContentBody` y `ContentBodyBoundary` a `src/components/content/content-body.tsx`: el
renderizador de secciones que las plantillas de servicios y de blog tenían duplicado pasa a
vivir en un solo archivo, sin cambiar un byte del HTML que esas páginas ya publicaban
(`check-content.mjs` da los mismos ocho PASA con los mismos conteos de palabras de antes). La
segunda publica el cuerpo de texto del inicio: 21 secciones, 1697 palabras, transcritas literal
del paquete de v1.2, insertadas antes del CTA de cierre sin tocar ninguno de los siete módulos de
marketing existentes (diff de `page.tsx`: +37/-0).

Nota operativa: la sesión que ejecutó este plan murió por límite de uso de la cuenta después de
que los dos commits ya estaban en el árbol. Esta continuación no rehizo nada — verificó el estado
real (`tsc`, `lint`, `build`, las dos puertas de contenido, el conteo de palabras de home medido
directo del HTML) contra lo ya commiteado, y escribió el SUMMARY que había quedado pendiente.

**Ola 2, plan 08-10, cerrado el 2026-08-13.** Primer post del blog que consume el paquete.
`/blog/5-sintomas-de-columna-que-no-debes-ignorar` conserva su URL y cambia entero por dentro: la
fase 14 le asignó `ciática` como primaria y ahora publica las 24 secciones canónicas del paquete,
2008 palabras contra las 1093 que tenía. `h1` pasa a `Ciática: el dolor que baja por la pierna`,
mientras `title` y `description` quedan intactos a la espera de la fase 10, que es exactamente
para lo que 08-05 separó los dos campos. Los seis enlaces de la matriz entraron en
`outboundLinks`, incluidos los dos que apuntan a `/blog/artrosis` y `/blog/lumbalgia`, rutas que
crean 08-12 y 08-13 y que verifica 08-14.

El problema del banner volvió a aparecer, ahora del lado del piso y no del techo. La intro se
lleva los dos primeros párrafos de `que-es`, así que la primera sección de nivel 2 queda en 223
palabras sobre 2008 y el banner caía en 11.1 por ciento; la frontera siguiente, después de todo
el bloque de síntomas, se iba al 57. `BlogPost` ganó `bannerAfterSectionId`, el mismo campo que
`ServicePage` ya tenía desde 08-06 y que 08-08 extendió a ids de nivel 3, y la plantilla de blog
lo reenvía. Este post declara `sintomas--espina-ciatica` y queda en 21.7 por ciento. Los otros
tres posts no declaran nada y siguen con el default: los ocho PASA de la puerta y sus conteos no
se movieron. Es probable que 08-11 y los posts nuevos repitan el patrón, porque todos toman la
intro de `que-es`.

**Olas 5 y 6, planes 08-12 y 08-13, cerrados el 2026-08-13.** Las dos URLs de blog que el paquete
manda crear en vez de reescribir. `/blog/artrosis` publica 20 secciones y 1989 palabras y sale al
silo por el hub `/servicios`, sin `relatedService`, porque la matriz no le asigna mención inversa
hacia ninguna guía. `/blog/lumbalgia` publica 19 secciones y 1737 palabras y sí la tiene: declara
`relatedService: "hernia-discal"` y enlaza a esa guía con el anchor literal de la matriz,
`hernia discal lumbosacra tratamiento`, en vez de la frase que la plantilla arma sola desde
`conditionName`. Los dos módulos se serializaron desde `copy-blog.json` con un script de una
pasada, y los dos planes contaron de menos las secciones del dataset: manda el dataset.

Con eso el blog llega a seis posts y el sitemap a 24 URLs, que es el máximo de la fase. Los tres
`SITEMAP_TOTAL` van sincronizados en el mismo commit cada vez que el conteo se mueve. El plan
08-14 lo devuelve a 22 al apagar los dos posts absorbidos con sus 301.

**Ola 7, plan 08-14, cerrado el 2026-08-13. Cierra todo el contenido de la fase.**
`/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos` y `/blog/estenosis-espinal-que-es`
dejan de existir con redirección permanente hacia la guía que absorbió su material. Antes de
escribir la regla se comprobaron las 16 filas de las dos tablas de absorción sobre el HTML
prerenderizado, once ids de destino distintos y todos vivos, y un checkpoint bloqueante lo puso a
lectura humana sobre el sitio servido en local. Ese orden, publicar y después redirigir, es la
única razón por la que el plan estaba en la ola 7 y no antes.

`next.config.ts` queda con las tres redirecciones que el handoff declara para v1.1 y ninguna
pendiente. El blog baja a cuatro posts y el sitemap a 22 URLs, el número con el que cierra la
fase, con la cuenta escrita en el comentario de las tres constantes. Dos cosas que dejó el plan y
conviene tener presentes: `relatedPosts` de la guía de estenosis quedó vacío, porque el único
post que apuntaba a esa condición ahora vive dentro de ella, y la primera comprobación con curl
dio 200 en las dos rutas por un servidor viejo que seguía escuchando el puerto con la
configuración anterior. Leer `next.config.ts` en vez de pedir la URL habría dado el visto bueno
con el sitio sin redirigir.

### Estado de la fase 10, verificado en producción el 2026-08-10

| Req | Estado | Evidencia |
|-----|--------|-----------|
| SEO-05 breadcrumbs | Ya estaba cumplido | `BreadcrumbList` en las 20 rutas anidadas. Se verificó, no se reconstruyó |
| SEO-06 credenciales y horarios | Ya estaba cumplido | CMP 83189, RNE 35310 y horarios completos de las cuatro sedes. El horario de viernes y sábado del consultorio ya estaba en `locations.ts` (09:00 a 17:00, verificado contra Google el 2026-08-09): el contexto lo daba por pendiente y era dato viejo |
| SEO-07 marcado de reseñas | Cumplido | Producción emite `"ratingValue":5,"reviewCount":6` leído en vivo de la ficha de Google. En local la clave está restringida por IP al servidor y el sitio degrada a no emitir marcado, que es el comportamiento correcto. Nada escrito a mano, nada persistido |
| SEO-08 titles y descriptions | **Fuera de alcance** | Juan los reescribe él. Se verificó en el diff que la fase no tocó ninguno |
| SEO-08 imágenes OG | Cumplido | 22 imágenes distintas, antes había una sola. Dinámicas: leen el title de cada ruta, así que se regeneran solas cuando Juan reescriba los titles |
| SEO-10 llms.txt | Cumplido | `/llms.txt` responde 200, generado desde las fuentes de contenido |
| SEO-11 limpieza | Cumplido | `dr-angulo-portrait.png` borrado del repo y del build, responde 404 |
| Stylesheet del sitemap | Cumplido, pedido nuevo de Juan | `/sitemap.xml` conserva `content-type` XML y sus 21 URLs, y ahora se lee como tabla con la identidad del sitio |

**Hallazgo que valía más que el problema declarado:** las guías de servicio y los posts del blog no declaraban ninguna imagen OG. Al fijar su propio bloque `openGraph` sin `images`, reemplazaban el del layout en vez de heredarlo, así que compartir una guía clínica por WhatsApp no mostraba nada.

**Cuarta puerta ejecutable:** `npm run seo:check`, que cubre solo lo que esta fase entrega y nace en verde. La puerta de longitud de metadata NO se construyó a propósito: nacería en rojo sobre 17 rutas que Juan todavía no reescribió.

### Estado de la fase 8, verificado en producción el 2026-08-10

Las cuatro páginas de servicio viven en `/servicios/{hernia-discal,estenosis-espinal,escoliosis,ortopedia-infantil}`, todas por encima de 1900 palabras. Los cuatro posts del blog superan las 900. Sitemap en 16 URLs. `scripts/check-content.mjs` es la puerta ejecutable que lo verifica y corre en verde sobre las ocho rutas.

Dos rondas de cambios pedidos por el cliente después de la primera entrega, ambas aplicadas y desplegadas:

1. **Las páginas parecían blog.** Se rediseñó la plantilla: banda de cabecera con hero y CTA arriba del pliegue, layout de dos columnas con aside sticky, y tratamiento visual propio por sección (tarjetas para síntomas y complicaciones, alerta para cuándo consultar, comparación de dos columnas para tratamiento, pasos numerados para diagnóstico y recuperación). Se agregó la sección `complicaciones` a las cuatro páginas.
2. **Megamenú de servicios** en el navbar, con hover más foco de teclado, Escape y `aria-expanded`. En móvil las cuatro páginas quedan anidadas bajo Servicios.

**Decisiones del cliente que debilitan salvaguardas acordadas, registradas para que no se pierdan:**

- El contenido clínico se publica sin revisión previa del doctor. La revisión es posterior. Ver PROJECT.md, sección Constraints, y la nota del criterio 4 en el ROADMAP.
- Las páginas van **firmadas por el doctor** pese a que él no las escribió ni las aprobó.
- El aviso de contenido educativo aparece **solo al cierre**, ya no pegado a la firma arriba del pliegue. Esto revierte SAFE-01 y quedó documentado en `08-UI-SPEC.md` y en el docblock de `MedicalDisclaimer`.

Lo que sigue protegiendo: cero credenciales fuera de `cv.ts`, cero cifras de cirugías, tasas de éxito, plazos garantizados o precios, cero voz en primera persona sobre casos, y el schema no emite `reviewedBy` ni `lastReviewed` porque a la fecha nadie revisó. Todo eso lo verifica la puerta por máquina.

**Pendiente de verificación humana del cliente:** lectura de la prosa clínica de las ocho rutas. Ninguna puerta puede juzgar exactitud clínica.

### Estado de los requisitos de la fase 7, medido en producción el 2026-08-10

| Req | Estado | Evidencia |
|-----|--------|-----------|
| DOM-01 | Cumplido | `https://drangulocolumna.com` responde 200 con certificado válido |
| DOM-02 | Cumplido | `https://www` devuelve `301` con `location: https://drangulocolumna.com/`, un solo salto, vía `src/proxy.ts`. `http://www` hace 2 saltos, pero el intermedio es `https://www` y nunca `http://` del apex |
| DOM-03 | Cumplido | Fallback de `siteConfig.url` corregido en `origin/main`, sin referencias a vercel.app en `src/`. Sitemap en producción con 12 URLs sobre el apex, `/privacidad` fuera |
| DOM-04 | Diferido | Decisión del cliente del 2026-08-10: la cuenta de Resend queda para después. El código de observabilidad del formulario sí quedó desplegado |
| DOM-05 | Cumplido | El cliente confirmó el 2026-08-10 que la propiedad de Search Console es suya y que ya envió el sitemap. El TXT `google-site-verification=FM89gW...` del apex pertenece a esa propiedad: no borrarlo nunca. Verificado aparte contra producción: las 8 rutas del sitemap emiten `index, follow`, `/privacidad` emite `noindex` y quedó fuera del sitemap, y `robots.txt` apunta al sitemap correcto. La confirmación de indexado efectivo es seguimiento posterior y no bloquea la fase |

## Roadmap v1.1

| Fase | Entrega | Requisitos |
|------|---------|------------|
| 7 | Dominio, HTTPS, canonicals, Resend y Search Console | DOM-01 a DOM-05 |
| 8 | Silo clínico: 4 páginas de servicio, hub y blog a 900+ palabras | SVC-01 a SVC-05, BLOG-02, BLOG-03 |
| 9 | Cuatro sedes con URL propia, schema y enlace con /agendar | SEDE-01 a SEDE-03 |
| 10 | Breadcrumbs, credenciales, horarios, reseñas, titles, OG, llms.txt | SEO-05 a SEO-11 |
| 11 | GBP corregido, reseñas hacia 15-20, NAP y UTM medidos | GBP-01 a GBP-05 |

La fase 11 no toca código de aplicación y puede correr en paralelo apenas cierre la 7.

## Accumulated Context

### Decisions

Ver tabla completa en PROJECT.md, sección Key Decisions.

- **Deploy: Dokploy self-hosted, no Vercel.** Infraestructura propia de Juan (Hetzner + Dokploy en `/Users/juan/Documents/Codigo/Personal/hosting`), el mismo stack de juantech y Juan Portfolio. Repo: `github.com/Sve-nnN/dr-angulo-website`. Dokploy: proyecto `client-dr-angulo`, `applicationId: 29ZFzVVwEczNI733DodMp`, appName real `dr-angulo-website-nqscdc`. Pasos de dominio y variables en `.planning/milestones/v1.0-phases/04-contenido-seo-legal-y-publicaci-n/04-VERIFICATION.md`, sección Human Verification Required.
- **Arquitectura en silo:** una URL por servicio y una por sede. La SERP de Lima está segmentada por condición y por clínica, y una sola página `/servicios` no compite contra dominios exact-match. Se valida en las fases 8 y 9.
- **Las redirecciones de renombre viven en `next.config.ts`, no en `src/proxy.ts`.** El 08-15 estrenó el bloque `redirects()` para mandar `/servicios/escoliosis` al slug nuevo. `proxy.ts` se queda con lo suyo, que es el host `www`. Los renombres de URL de contenido entran como entradas del mismo arreglo. En Next 16 `permanent: true` emite 308 y no 301, a propósito: Google lo trata igual para consolidar señales.
- **Contenido médico SIN gate previo, cambiado el 2026-08-10 por decisión de Juan.** El texto clínico se publica y el doctor revisa después. Además las páginas van firmadas por él. Lo que reemplaza a la aprobación previa son las salvaguardas verificadas por máquina en `scripts/check-content.mjs`: cero credenciales fuera de `cv.ts`, cero cifras de cirugías, tasas de éxito, plazos garantizados o precios, cero voz en primera persona sobre casos, y schema sin `reviewedBy` ni `lastReviewed`.

### Pending Todos

- **Dominio (fase 7): en producción ya resuelto.** `https://drangulocolumna.com` responde con el sitio real y `NEXT_PUBLIC_SITE_URL` está bien seteada (el canonical y el `@id` del JSON-LD salen con el dominio propio). Falta confirmarlo en el panel y seguir con Search Console. Si hiciera falta rehacerlo: apuntar el registro `A` a la IP de `sapling-vps-01`, luego `domain.create` vía API de Dokploy (`applicationId: 29ZFzVVwEczNI733DodMp`, puerto 3000, HTTPS/Let's Encrypt). Variables de producción por `application.saveEnvironment` + `application.deploy`: `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, y `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID` cuando Juan tenga esas cuentas.
- **Datos que faltan del doctor:** días reales por sede para corregir el GBP; si sigue atendiendo en Clínica Montefiori; si se publica precio de consulta (dato sin confirmar de Doctoralia: ~S/130 presencial, ~S/100 online); fechas contradictorias de los dos cargos de Guarataro en el CV (2012-2013 contra 2003), hoy fuera del sitio.
- **Feed de Instagram (FUT-07):** el carrusel muestra el fallback hasta configurar `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_TOKEN_FILE` (volumen persistente) y `CRON_SECRET` en Dokploy, más el cron semanal a `/api/instagram/refresh`. Pasos en `docs/instagram-reels.md`. El cron por HTTPS depende del dominio de la fase 7.
- **Testimonios:** el doctor pasó `https://www.instagram.com/p/CoE2FSWOJgR/` con testimonios en video, hoy solo enlazado. Si consigue los videos o el texto se pueden citar directamente.
- **Reseñas de Google:** falta `GOOGLE_PLACES_API_KEY` en Dokploy para que la sección se renderice (place ID ya cableado: `ChIJQ4nDssLHBZEROmZ9nyesA5c`). Pasos en `docs/structured-data.md`. Sin la clave el sitio queda como estaba, sin sección de reseñas.

### Blockers/Concerns

- La ficha de Google Business Profile está viva (5.0 con 6 reseñas, Av. El Derby 254) y su botón de sitio web y su enlace de reservas ya apuntan al dominio, que sirve el sitio real. El cuello de botella ahora es el volumen de reseñas: 6 es poco para competir en la SERP local de Lima.
- El horario del GBP (viernes y sábado 9-17) es el del consultorio privado y ya está publicado tal cual en `locations.ts` y en el `openingHoursSpecification` del JSON-LD. Lo que sigue abierto es si el GBP debe reflejar además los días de clínica, que es la discusión de GBP-01.
- El logo actual es `images/logo.jpeg` recortado por bounding box. Si aparece el SVG vectorial original conviene reemplazarlo. `public/dr-angulo-portrait.png` sigue en el repo sin uso y lo saca SEO-11.

## Deferred Verification

| Phase | State | Resume |
|-------|-------|--------|
| 4 | verification_deferred_human, dominio público pendiente | Lo cierra la fase 7 (DOM-01). Después `/gsd-verify-work 4` |
| 5 | verification_deferred_human, cuenta de Instagram sin vincular (código completo, SOCIAL-01 y SOCIAL-02 en Pending) | Seguir `05-VERIFICATION.md` o `docs/instagram-reels.md`, luego `/gsd-verify-work 5` |
| 6 | verification_deferred_human, falta confirmar si el doctor sigue en Clínica Montefiori (código completo, LOC-01 a LOC-04 en Done) | Con la respuesta: sumar la sede a `src/content/locations.ts` o actualizar Doctoralia, luego `/gsd-verify-work 6` |
| 7 | verification_deferred_human, solo DOM-04. Los otros cuatro requisitos están verificados en producción | Cuando el cliente tenga cuenta de Resend, casilla destino y API key: `/gsd-execute-plan 07-04`, después `/gsd-verify-work 7` |

**07-02 descartado, no diferido.** La Redirect Rule de Cloudflare dejó de hacer falta cuando `src/proxy.ts` cerró DOM-02 desde el origen. Solo habría bajado `http://www` de 2 saltos a 1 evitando un golpe al origen, ganancia marginal. **Consecuencia importante: no sacar `www.drangulocolumna.com` de los dominios de la aplicación en Dokploy.** La redirección funciona porque Traefik enruta ese host hacia la app y ahí `proxy.ts` responde el 301. Quitarlo rompe la redirección.

El cierre formal del milestone v1.0 (audit, complete-milestone, cleanup) espera estos tres ítems.

## Session Continuity

Last session: 2026-08-13
Stopped at: Ola 8 abierta con 08-17. `src/content/location-pages.ts` es ahora un directorio con `types.ts`, `index.ts` y un módulo por sede, y el archivo suelto quedó como barril delgado, así que los diez consumidores no tocaron su import. `LocationPage` admite `sections` y `outboundLinks`, más `ctaBanner`, `publishedAt`, `updatedAt` y `bannerAfterSectionId`, los cuatro opcionales y agregados porque entrar al `MANIFEST` de la puerta de contenido obliga a firma, banner e índice. La plantilla de sede es la cuarta superficie que usa el `ContentBody` del 08-09, y todo lo nuevo está condicionado a que la sede tenga cuerpo: con `sections` vacío las cuatro sedes renderizaron el mismo conteo de palabras que antes del plan. `/sedes/clinica-ricardo-palma` y `/sedes/clinica-tezza` publican sus 16 secciones y 1656 y 1553 palabras, con el `h1` del dataset (el `title` sigue esperando a la fase 10) y sin afirmar ninguno de sus cuatro datos operativos pendientes: los dos pisos y los dos bloques de seguros y convenios siguen sin confirmar y están transcritos en el SUMMARY. `MidContentCta` ganó `withWhatsApp`, porque el banner de una sede de clínica no puede ofrecer el chat del doctor. `check-content.mjs` declara el esqueleto `ficha-de-sede` y `SITEMAP_TOTAL` sigue en 22. Lo que sigue: el 08-18 publica el consultorio privado y Sanna La Molina sobre esta misma forma, y el 08-19 es preguntas frecuentes.

Anterior: Ola 6 cerrada con 08-13, y con ella todo el contenido nuevo o reescrito de la fase. `/blog/lumbalgia` existe y publica las 19 secciones del paquete con 1737 palabras de cuerpo: 8 de nivel 2 y 11 de nivel 3, contra las 15 que el plan había contado, porque el plan contó de menos y manda el dataset. A diferencia de artrosis, este post sí declara `relatedService: "hernia-discal"`, que es la mención inversa que la matriz le asigna, y su enlace de salida usa el anchor literal `hernia discal lumbosacra tratamiento` en vez de la frase que la plantilla arma sola. Su banner cuelga de `sintomas`, la única frontera de nivel 2 que cae dentro de la ventana de POS-01. `SITEMAP_TOTAL` está en 24 en las tres puertas y el sitemap real tiene 24 URLs: es el máximo de la fase. El enlace que el 08-12 dejó apuntando a un 404 ya resuelve. Lo que queda: el 08-14 devuelve el conteo a 22 con las redirecciones de los dos posts absorbidos, y 08-17 a 08-19 son sedes y preguntas frecuentes.

Antes: Ola 5 abierta con 08-12. `/blog/artrosis` existe y publica las 20 secciones del paquete con 1989 palabras: 8 de nivel 2 y 12 de nivel 3, contra las 19 que el plan había contado, porque el plan se saltó `que-es--artrosis-mano` y manda el dataset. Es el primer post del sitio sin `relatedService`. La matriz de la fase 14 no le asigna mención inversa hacia ninguna guía, así que sale al silo por el hub `/servicios` y su entrada del `MANIFEST` va sin `linksTo`, que es el caso para el que el 08-05 dejó el campo opcional. Su banner cuelga de `que-es--artrosis-de-rodilla`, porque `que-es` arrastra seis subsecciones y la única frontera de nivel 2 cercana cae en el 41.9 por ciento. `SITEMAP_TOTAL` está en 23 en las tres puertas y el sitemap real tiene 23 URLs. Queda un enlace de salida hacia `/blog/lumbalgia`, que todavía responde 404: lo cierra el 08-13, que además sube el conteo a 24. Después el 08-14 lo devuelve a 22 con las redirecciones, y 08-17 a 08-19 son sedes y preguntas frecuentes.

Y antes: Ola 4 abierta y cerrada en su parte de silo con 08-16. `/servicios/cirugia-minimamente-invasiva` existe: es la única URL nueva del set, publica las 18 secciones del paquete con 1794 palabras y su banner cuelga de `que-se-atiende--endoscopia-espinal`, porque las siete subsecciones del primer bloque dejan la única frontera de nivel 2 fuera de la ventana de POS-01. El hub `/servicios` publica sus 16 secciones y 1191 palabras con el `ContentBody` del 08-09, entre la rejilla de tarjetas y el catálogo heredado, y conserva las cuatro anclas de v1.0. Su `h1` pasó a "Cirujano de columna en Lima"; el title y la meta siguen siendo de la fase 10. `SITEMAP_TOTAL` está en 22 en las tres puertas y el sitemap real tiene 22 URLs. El enlace que el 08-15 dejó apuntando a la cirugía mínimamente invasiva ya resuelve. Lo que sigue: 08-12 y 08-13 suben el conteo a 23 y 24 con los posts nuevos, el 08-14 lo devuelve a 22 con las redirecciones, y 08-17 a 08-19 son sedes y preguntas frecuentes.

Y más atrás: Ola 3 de la fase 8 abierta con 08-15 cerrado. `/servicios/escoliosis` se renombró a `/servicios/escoliosis-y-deformidades` y publica las 19 secciones del copy aprobado, 2615 palabras. El slug viejo responde 308 permanente, comprobado con una petición real contra el sitio construido. Con eso SVC-03 deja de ser el requisito sin dueño del set. `next.config.ts` ya tiene el bloque `redirects()` donde el 08-14 sumará los dos 301 del blog. El sitemap sigue en 21 URLs; el primero que mueve ese conteo es el 08-16.
Resume file: None
