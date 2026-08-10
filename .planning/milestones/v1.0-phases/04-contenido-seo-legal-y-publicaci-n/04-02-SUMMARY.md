---
phase: 04-contenido-seo-legal-y-publicaci-n
plan: 04-02
subsystem: qa-deploy
tags: [qa, performance, vercel, deploy]
provides:
  - QA visual/responsive verificado en navegador (desktop + mobile)
  - Build de producción limpio y listo para deploy
affects: []
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified: []
key-decisions: ["Deploy NO fue a Vercel — Juan decidió usar su propia infra (Hetzner + Dokploy, /Users/juan/Documents/Codigo/Personal/hosting), el mismo stack que ya usa para otros clientes", "Deploy sin dominio público por ahora — Juan lo agrega cuando tenga uno"]
duration: QA transversal (~15min); deploy ~10min (2026-08-01)
completed: 2026-08-01
status: complete
---

# Phase 4 Plan 04-02: QA visual/responsive/performance + deploy Summary

**QA visual/responsive verificado en navegador sobre las 18 rutas del sitio, build de producción limpio. Deploy ejecutado en la infraestructura propia de Juan (Dokploy, no Vercel) — contenedor corriendo y estable, sin dominio público todavía.**

## Performance
- **Duration:** QA transversal ~15min (2026-07-31); deploy ~10min (2026-08-01)
- **Tasks:** 2 de 2 completadas (QA + deploy)
- **Files modified:** 2 (`.node-version`, `package-lock.json`)

## Accomplishments
- QA visual/responsive verificado en navegador (desktop + mobile) sobre las 18 rutas del sitio, incluidas las de blog/privacidad
- `npm run build` limpio, reconfirmado en la sesión de backfill (18 rutas generadas, 4 posts de blog vía SSG, sin errores ni warnings)
- Imágenes/fuentes sin layout shift visible observado
- Repo creado y pusheado: `github.com/Sve-nnN/dr-angulo-website` (público, sin secretos commiteados — `.env*` gitignored salvo `.env.example`)
- Deploy en Dokploy (self-hosted, `sapling-vps-01`): proyecto `client-dr-angulo`, app `dr-angulo-website` (`applicationId: 29ZFzVVwEczNI733DodMp`, appName real `dr-angulo-website-nqscdc`), source wireado vía `application.saveGitProvider` (git URL directa, sin GitHub App — mismo patrón que juantech/Portfolio)
- Primer build falló (`npm ci`: `Missing @emnapi/* from lock file` — lockfile de Mac sin binarios opcionales de Linux, Lección 9/11 del propio runbook de `hosting`); arreglado regenerando `package-lock.json` con `npx npm@10.9.2 install --os=linux --cpu=x64 --libc=glibc --package-lock-only`
- Segundo build exitoso; contenedor corriendo y estable (`docker.getContainers` confirma sin crash-loop; logs de runtime muestran `✓ Ready in 287ms`)
- Sin dominio público asignado — decisión explícita de Juan, se agrega después

## Task Commits
1. **QA visual/responsive** - `88b397d` (incluido en el commit del sitio completo)
2. **Pin Node 22 (.node-version)** - `8d5e6dc`
3. **Fix lockfile para build Linux** - `22f5a52`

## Files Created/Modified
- `.node-version` - Pin Node 22 (requerido por Nixpacks/Dokploy, Lección 10 de `infra/apps/LESSONS-LEARNED.md`)
- `package-lock.json` - Regenerado para incluir binarios opcionales de Linux (lightningcss/Tailwind v4)

## Decisions & Deviations
**Deploy NO fue a Vercel.** El ROADMAP original asumía Vercel, pero Juan indicó usar su propia infraestructura (Hetzner + Dokploy en `/Users/juan/Documents/Codigo/Personal/hosting`), el mismo stack que ya usa para juantech y Juan Portfolio. Creación del repo GitHub bloqueada por el clasificador de auto-mode de Claude Code (acción de "publicar/crear estado compartido") — Juan corrió el comando `gh repo create ... --push` él mismo vía prefijo `!`. El resto de la secuencia (Dokploy project/app/git-source/deploy) sí lo ejecutó el agente vía la API de Dokploy, ya autorizado explícitamente por Juan.

## Next Phase Readiness
No hay Phase 5 planificada — es el último milestone del roadmap v1. Único paso restante: que Juan asigne un dominio (ver `04-VERIFICATION.md` Human Verification Required) y, opcionalmente, configure `NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_META_PIXEL_ID`/`RESEND_API_KEY`/`EMAIL_FROM` vía la API de Dokploy cuando tenga esas cuentas.

---
**Nota:** SUMMARY actualizado el 2026-08-01 tras ejecutar el deploy real (originalmente backfilleado el 2026-07-31 con el deploy aún pendiente).
