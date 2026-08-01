---
gsd_state_version: '1.0'
status: built
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 10
  completed_plans: 10
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-31)

**Core value:** Que un paciente que busca traumatólogo/cirujano de columna en Lima encuentre el sitio y agende cita por WhatsApp en menos de 2 clics, con todo evento rastreado.
**Current focus:** Asignar dominio público + pendientes de contenido (ver abajo)

## Current Position

Phase: 4 of 4 — todas las fases construidas, verificadas en navegador, y deployadas
Status: Sitio corriendo en producción (Dokploy, infra propia de Juan) sin dominio público todavía
Last activity: 2026-08-01 — Backfill de tracking GSD completado (4 fases); deploy real ejecutado en Dokploy (`sapling-vps-01`, proyecto `client-dr-angulo`, app `dr-angulo-website`), no en Vercel

Progress: [██████████] 100% (build + deploy) — pendiente solo dominio público

## Accumulated Context

### Decisions

Ver tabla completa en PROJECT.md § Key Decisions.

- **Deploy: Dokploy self-hosted, no Vercel.** Juan decidió usar su propia infraestructura (Hetzner + Dokploy en `/Users/juan/Documents/Codigo/Personal/hosting`), el mismo stack que usa para juantech y Juan Portfolio, en vez del Vercel asumido originalmente en el ROADMAP. Repo: `github.com/Sve-nnN/dr-angulo-website`. Dokploy: proyecto `client-dr-angulo`, `applicationId: 29ZFzVVwEczNI733DodMp`, appName real `dr-angulo-website-nqscdc`. Detalle completo en `.planning/phases/04-contenido-seo-legal-y-publicaci-n/04-02-SUMMARY.md` y `04-VERIFICATION.md`.

### Pending Todos

- **Asignar dominio público**: el sitio corre en Dokploy pero sin dominio (decisión explícita de Juan — "deploy sin dominio por ahora"). Cuando Juan tenga uno: apuntar el registro DNS `A` a la IP de `sapling-vps-01`, luego `domain.create` vía la API de Dokploy para `applicationId: 29ZFzVVwEczNI733DodMp` (puerto `3000`, HTTPS/Let's Encrypt) — pasos exactos en `04-VERIFICATION.md` § Human Verification Required.
- Pedir CV completo del doctor (certificaciones, cursos, títulos) para ampliar "Sobre el doctor" — hoy solo tiene lo verificado públicamente.
- Confirmar si se muestra precio de consulta (dato de Doctoralia sin confirmar: ~S/130 presencial, ~S/100 online).
- Cuando exista dominio propio: configurar `RESEND_API_KEY` + `EMAIL_FROM` con dominio verificado, y `NEXT_PUBLIC_SITE_URL` — vía la API de Dokploy (`application.saveEnvironment` + `application.deploy`, o `infra/apps/set-env-and-redeploy.sh` del repo `hosting`), no en un dashboard de Vercel.
- Configurar `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID` cuando Juan tenga esas cuentas (mismo mecanismo de la API de Dokploy).
- Recomendado (fuera del sitio web): reclamar/optimizar Google Business Profile del doctor.

### Blockers/Concerns

Ninguno bloqueante. El logo usado es un recorte de una captura de Instagram (buena calidad pero no el archivo vectorial original) — si el doctor tiene el PNG/SVG fuente, conviene reemplazarlo.

## Session Continuity

Last session: 2026-08-01
Stopped at: Backfill de tracking GSD completo (4/4 fases), sitio deployado en Dokploy y corriendo estable. Pendiente: dominio público (decisión de Juan) y contenido adicional (CV completo).
Resume file: None
