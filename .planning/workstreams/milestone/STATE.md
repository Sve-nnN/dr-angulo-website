---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Lanzamiento público y competitividad SEO
status: planning
last_updated: "2026-08-10T03:20:00.000Z"
last_activity: 2026-08-10
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
**Current focus:** Fase 7. OJO: verificado el 2026-08-09, `https://drangulocolumna.com` ya sirve el sitio real (canonical y JSON-LD con el dominio propio, sitemap correcto), no la página parqueada. Lo que queda de la fase es confirmar el estado en Dokploy y cerrar Search Console.

## Current Position

Phase: 7 de 11 (Dominio público, producción y Search Console), primera de las 5 fases de v1.1
Plan: 5 planes escritos. Ejecutados 07-01 y 07-03. DOM-05 lo cerró el cliente por su cuenta. Quedan 07-02 (descartado) y 07-04 (diferido)
Status: Cerrada salvo DOM-04, que el cliente difirió
Last activity: 2026-08-10, DOM-01, DOM-02 y DOM-03 verificados en producción

Progress: [████░░░░░░] 40% de v1.1

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
- **Contenido médico con gate humano:** todo texto clínico nuevo o expandido (SVC-01 a SVC-04, BLOG-02) lo redacta el agente y lo aprueba el doctor antes de publicar. No es verificación automatizable.

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

Last session: 2026-08-10
Stopped at: ROADMAP de v1.1 escrito con 5 fases (7 a 11) y trazabilidad completa de los 27 requisitos en REQUIREMENTS.md. Nada de código tocado todavía.
Resume file: None
