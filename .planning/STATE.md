---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Lanzamiento público y competitividad SEO
status: planning
last_updated: "2026-08-10T02:33:49.578Z"
last_activity: 2026-08-09
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-31)

**Core value:** Que un paciente que busca traumatólogo/cirujano de columna en Lima encuentre el sitio y agende cita por WhatsApp en menos de 2 clics, con todo evento rastreado.
**Current focus:** Dos acciones humanas encadenadas — asignar dominio público y vincular la cuenta de Instagram (ver abajo)

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-08-09 — Milestone v1.1 started

## Accumulated Context

### Decisions

Ver tabla completa en PROJECT.md § Key Decisions.

- **Deploy: Dokploy self-hosted, no Vercel.** Juan decidió usar su propia infraestructura (Hetzner + Dokploy en `/Users/juan/Documents/Codigo/Personal/hosting`), el mismo stack que usa para juantech y Juan Portfolio, en vez del Vercel asumido originalmente en el ROADMAP. Repo: `github.com/Sve-nnN/dr-angulo-website`. Dokploy: proyecto `client-dr-angulo`, `applicationId: 29ZFzVVwEczNI733DodMp`, appName real `dr-angulo-website-nqscdc`. Detalle completo en `.planning/phases/04-contenido-seo-legal-y-publicaci-n/04-02-SUMMARY.md` y `04-VERIFICATION.md`.

### Pending Todos

- **Asignar dominio público**: el sitio corre en Dokploy pero sin dominio (decisión explícita de Juan — "deploy sin dominio por ahora"). Cuando Juan tenga uno: apuntar el registro DNS `A` a la IP de `sapling-vps-01`, luego `domain.create` vía la API de Dokploy para `applicationId: 29ZFzVVwEczNI733DodMp` (puerto `3000`, HTTPS/Let's Encrypt) — pasos exactos en `04-VERIFICATION.md` § Human Verification Required.
- **CV completo: recibido y publicado** (2026-08-09, desde el perfil de Doctoralia). "Sobre el doctor" ya muestra la formación con fechas, ocho cargos de trayectoria y once cursos y congresos con año y lugar, incluidos los cuatro entrenamientos internacionales (Miami x2, Francia, Buenos Aires). Único fleco: en el CV los dos cargos iniciales de Guarataro (médico rural y coordinador de ambulatorio) tienen fechas que se contradicen entre sí (2012-2013 contra 2003), así que quedaron fuera del sitio hasta que el doctor aclare.
- **Confirmar el estado de Clínica Montefiori**: el listado de consultorios del 2026-08-09 no la incluye, así que salió del sitio y las sedes publicadas son consultorio privado (Surco), Ricardo Palma, Sanna La Molina y Tezza. Si el doctor ya no atiende ahí, conviene actualizar su perfil de Doctoralia, que todavía la menciona; si sigue, pasar días y horario para sumarla a `src/content/locations.ts`.
- **Horas exactas del consultorio privado** los viernes y sábados: hoy la ficha dice "horario coordinado al agendar". Con el rango se puede sumar `openingHoursSpecification` al JSON-LD.
- **Activar el feed de reels de Instagram**: el carrusel ya está en el Home y en Testimonios, pero muestra el fallback hasta que se configuren `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_TOKEN_FILE` (volumen persistente) y `CRON_SECRET` en Dokploy, más el cron semanal a `/api/instagram/refresh`. Pasos completos en `docs/instagram-reels.md`. Requiere que la cuenta del doctor sea Profesional y una app en Meta for Developers.
- Testimonios: el doctor pasó la publicación de Instagram `https://www.instagram.com/p/CoE2FSWOJgR/` con testimonios en video. Se enlaza desde Home y Testimonios porque Instagram bloquea el scraping. Si consigue los videos o el texto, se pueden citar directamente en la página.
- Confirmar si se muestra precio de consulta (dato de Doctoralia sin confirmar: ~S/130 presencial, ~S/100 online).
- Cuando exista dominio propio: configurar `RESEND_API_KEY` + `EMAIL_FROM` con dominio verificado, y `NEXT_PUBLIC_SITE_URL` — vía la API de Dokploy (`application.saveEnvironment` + `application.deploy`, o `infra/apps/set-env-and-redeploy.sh` del repo `hosting`), no en un dashboard de Vercel.
- Configurar `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID` cuando Juan tenga esas cuentas (mismo mecanismo de la API de Dokploy).
- Recomendado (fuera del sitio web): reclamar/optimizar Google Business Profile del doctor.

### Blockers/Concerns

Ninguno bloqueante. Desde 2026-08-08 el logo es el archivo oficial que pasó el doctor (`images/logo.jpeg`), recortado por detección de bounding box; si aparece el SVG vectorial original conviene reemplazarlo igual. Las fotos profesionales ya reemplazaron el retrato antiguo, que era un frame de video con marca de agua; el archivo viejo `public/dr-angulo-portrait.png` quedó en el repo sin uso, pendiente de confirmación para borrarlo.

El feed de reels depende de dos cosas fuera del código: la vinculación de Instagram y, para el cron por HTTPS, el dominio público. Mientras tanto la sección muestra el fallback al perfil, así que no bloquea nada visible.

## Deferred Verification

| Phase | State | Resume |
|-------|-------|--------|
| 4 | verification_deferred_human — dominio público pendiente de decisión de Juan (deploy ya ejecutado y estable en Dokploy) | Cuando Juan tenga el dominio: asignarlo vía `domain.create` de la API de Dokploy (ver `04-VERIFICATION.md` § Human Verification Required), luego `/gsd-verify-work 4` |
| 5 | verification_deferred_human — cuenta de Instagram sin vincular (código completo y verificado, SOCIAL-01 y SOCIAL-02 en Pending) | Seguir el paso a paso de `05-VERIFICATION.md` § Human Verification Required (o `docs/instagram-reels.md`): cuenta profesional → app de Meta y token → variables + volumen en Dokploy → cron semanal. Después `/gsd-verify-work 5` |
| 6 | verification_deferred_human — falta confirmar con el consultorio si el doctor sigue atendiendo en Clínica Montefiori (código completo y verificado, LOC-01 a LOC-04 en Done) | Con la respuesta: sumar la sede a `src/content/locations.ts` o actualizar Doctoralia, luego `/gsd-verify-work 6` |

Milestone v1.0 lifecycle (audit → complete-milestone → cleanup) queda en espera de estos ítems antes de cerrarse formalmente.

## Session Continuity

Last session: 2026-08-09
Stopped at: Phase 6 ejecutada y documentada (cuatro sedes con horarios, página `/agendar`, WhatsApp acotado al consultorio privado, NAP y schema actualizados) más los planes 05-03 (fotos de quirófano) y 05-04 (CV completo). Build, tsc y lint limpios; verificación visual en navegador hecha. Pendientes: confirmar Montefiori, las horas del consultorio privado y las fechas de los dos cargos de Guarataro; vincular Instagram (`docs/instagram-reels.md`); dominio público.
Resume file: None
