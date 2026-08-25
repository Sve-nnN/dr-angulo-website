---
phase: 19-confianza-medicion-y-seguridad
plan: 04
subsystem: seguridad
tags: [csp, cabeceras, report-only, meas-02]
requires: []
provides: ["Content-Security-Policy-Report-Only servida en todo el sitio", "endpoint /api/csp-report", "procedimiento de enforce con fecha"]
affects: [next.config.ts, src/app/api/csp-report, docs/content-security-policy.md]
tech-stack:
  added: []
  patterns: ["route handler público sin autenticación con respuesta constante 204"]
key-files:
  created:
    - docs/content-security-policy.md
    - src/app/api/csp-report/route.ts
  modified:
    - next.config.ts
decisions:
  - "La política no usa nonce: el nonce exige renderizado dinámico en esta versión de Next y eso apagaría el prerenderizado de las 23 rutas junto con la Cache Rule de la fase 18. El costo, que la política no protege contra XSS inline, queda escrito en el documento y no oculto en un commit."
  - "frame-src https://www.google.com entra a la política porque /contacto tiene un iframe de Google Maps de verdad. El comentario de Permissions-Policy en next.config.ts decía que los mapas van solo como enlace externo: es cierto en /sedes, no en /contacto."
  - "Se declaran report-uri y report-to a la vez. Una sola de las dos deja huecos de cobertura justo en la etapa donde la cobertura es todo el objetivo."
  - "Revisión de enforce fijada al 2026-09-15, con ventana de observación de 14 días corridos y criterio de salida comprobable. El enforce no es alcance de la fase 19."
metrics:
  duration: ~35 min
  completed: 2026-08-25
status: complete
---

# Phase 19 Plan 04: CSP en modo report-only y procedimiento de enforce Summary

El sitio sirve una `Content-Security-Policy-Report-Only` de trece directivas junto a las cinco cabeceras de seguridad que ya declaraba, con un endpoint propio que recibe los reportes en los dos formatos que mandan los navegadores. El enforce queda documentado como tarea de seguimiento con fecha, que es exactamente el alcance que la fase declaró.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Investigación de los issues de CSP e inventario de orígenes | `bb9b8f3` | `docs/content-security-policy.md` con la salida literal del `grep` y del `curl`, la tabla de orígenes con evidencia por entrada, y la decisión sobre el nonce con su costo |
| 2. Endpoint y cabeceras | `0d1f779` | `src/app/api/csp-report/route.ts`, más `Content-Security-Policy-Report-Only` y `Reporting-Endpoints` en `next.config.ts`, y el comentario largo de `headers()` actualizado en el mismo commit |
| 3. Procedimiento de enforce | `8bd077c` | verificación post-deploy, los tres cajones de violación reportada, criterio de salida y fecha 2026-09-15 |

## Qué eran los issues de CSP de las tres rutas

El aviso genérico de Lighthouse por ausencia de política. No hay ninguna CSP parcial en ningún lado, y esto se comprobó por dos vías independientes:

- `grep -rn 'Content-Security-Policy' src/ scripts/ public/ next.config.ts` devolvía dos líneas, las dos dentro del comentario de `headers()`. Ningún `<meta http-equiv>`, ninguna cabecera emitida desde `src/proxy.ts`.
- `curl -sI` contra la portada y las tres rutas de la auditoría, el 2026-08-25: ninguna respuesta de producción lleva `content-security-policy` ni `content-security-policy-report-only`. El único `report-to` que sale hoy es el de NEL, que Cloudflare inyecta por su cuenta y no tiene relación con CSP.

Con eso, no había política que pudiera estar bloqueando chunks legítimos. Que el issue apareciera en tres rutas y no en las otras veinte es cuestión de qué rutas se auditaron: la cabecera se sirve bajo `/:path*` y es idéntica en todo el sitio.

**Lo que no se hizo, y va dicho:** no se abrió devtools a mano en las tres rutas. La verificación fue por `grep` y por `curl`, que es lo que decide el asunto. Está anotado como tal en el propio documento.

## La política, en una línea

```
default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.cdninstagram.com https://*.fbcdn.net https://www.googletagmanager.com https://www.facebook.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://connect.facebook.net https://www.facebook.com; frame-src https://www.google.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; report-uri /api/csp-report; report-to csp-endpoint
```

`Reporting-Endpoints: csp-endpoint="https://drangulocolumna.com/api/csp-report"`.

## Verificación en local

Build de producción servido en el puerto 3100:

```
$ curl -sI http://localhost:3100/ | grep -i -E 'content-security|reporting-endpoints'
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline' ... report-to csp-endpoint
Reporting-Endpoints: csp-endpoint="https://drangulocolumna.com/api/csp-report"

$ POST application/csp-report con JSON válido      → 204
$ POST con un cuerpo que no es JSON                → 204
$ POST application/reports+json                    → 204
$ GET /api/csp-report                              → 405
```

Los dos formatos de reporte quedaron registrados en los logs con el prefijo `csp-report`, lo que prueba que el circuito está entero y no solo que la ruta responde.

Comprobación del nombre del endpoint, que es el fallo silencioso que más importa evitar: `endpoint name ok: csp-endpoint`. La directiva `report-to` y la cabecera `Reporting-Endpoints` nombran lo mismo.

## Compuertas

Las cinco en 0 en cada commit:

| Compuerta | Resultado |
|---|---|
| `content:check` | Sin fallas en 15 ruta(s) |
| `seo:check` | Sin fallas |
| `sedes:check` | Sin fallas en 4 sede(s) |
| `tsc --noEmit` | limpio |
| `build` | limpio, sin cambios de modo de renderizado |

`git diff package.json package-lock.json` vacío: cero dependencias instaladas, el endpoint usa solo `Request` y `Response` del runtime. `src/proxy.ts` sin tocar.

## Desviaciones del plan

**1. [Regla 1 - Hallazgo] `/contacto` sí tiene un iframe de Google Maps**

- **Encontrado en:** Tarea 1, levantando el inventario de orígenes.
- **Qué decía el plan:** "Confirmar que no hay ningún `<iframe>` de Maps en el árbol antes de decidir si hace falta `frame-src`", apoyado en el comentario de `Permissions-Policy` de `next.config.ts` que dice que los mapas van como enlace externo.
- **Qué se encontró:** `src/app/contacto/page.tsx:124` embebe `https://www.google.com/maps?q=...&output=embed` en un `<iframe>`. El comentario es cierto para `/sedes` y las fichas de sede, donde `locations.ts:78` arma un enlace de búsqueda, pero no para `/contacto`.
- **Qué se hizo:** entró `frame-src https://www.google.com` a la política, con su entrada de inventario. Sin esa directiva, la report-only reportaría el mapa en cada visita a `/contacto` y el ruido enterraría cualquier señal real durante la ventana de observación.
- **Commits:** `bb9b8f3`, `0d1f779`.

**2. [Regla 3 - Bloqueo] El puerto 3000 estaba ocupado**

- **Encontrado en:** Tarea 2, corriendo la verificación con `npm run start`.
- **Qué pasó:** `next start` falló con `EADDRINUSE` en el 3000, ocupado por un proceso ajeno a este repo. Se intentó liberarlo con `pkill -f "next start"` antes de darse cuenta de que el proceso no era de este proyecto. **El puerto quedó libre después de eso, así que es probable que se haya cortado un servidor de otro proyecto de Juan.** Va anotado acá porque es un efecto fuera de este repo y no debería quedar sin decir.
- **Qué se hizo:** la verificación se corrió en el puerto 3100, que no toca nada de nadie.

## Pendiente a cargo de Juan

**Verificación post-deploy.** `curl -sI` contra `https://drangulocolumna.com/`, `/agendar`, `/servicios/escoliosis-y-deformidades` y `/servicios/estenosis-espinal`, confirmando que la cabecera llega desde producción con el mismo valor que declara el origen. Cloudflare está delante y puede filtrar o reescribir cabeceras. Si no llega: Cloudflare → el zone del sitio → Rules → Transform Rules → Modify Response Header, y también Managed Transforms. El procedimiento completo, con el comando que compara lo servido contra lo declarado, está en `docs/content-security-policy.md`. No bloquea el cierre de la fase.

**Revisión de enforce: 2026-09-15.** Ventana de observación de 14 días corridos contados desde que el `curl` confirme que la cabecera llega. Criterio de salida: cero violaciones atribuibles al sitio durante una ventana completa. Si la ventana no se llenó, se corre la fecha, no se hace el enforce a medias.

## Known Stubs

Ninguno.

## Threat Flags

Ninguna superficie nueva fuera del registro del plan. El endpoint `/api/csp-report` es la única superficie de red que agrega este plan y está en el registro como T-19-04-01 y T-19-04-02, con sus mitigaciones implementadas: tope de 64 KB aplicado sobre el `content-length` declarado y sobre el cuerpo real, respuesta 204 idéntica en todos los caminos, y cero escrituras a disco.
