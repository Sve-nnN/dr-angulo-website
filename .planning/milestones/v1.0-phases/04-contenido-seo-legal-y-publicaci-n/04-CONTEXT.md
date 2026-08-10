# Phase 4: Contenido SEO, legal y publicación - Context

**Gathered:** 2026-07-31
**Status:** Ready for planning
**Mode:** Auto-generated (ejecución directa en modo autónomo, sin discuss interactivo)

<domain>
## Phase Boundary

Blog propio (listado + artículos individuales) con contenido educativo basado en el Instagram real del doctor, página de Política de Privacidad, banner de consentimiento de cookies que gatea la carga de GA4/Meta Pixel, revisión visual/responsive/performance de todo el sitio, y publicación en Vercel.

</domain>

<decisions>
## Implementation Decisions

- 4 artículos de blog (dentro del rango 4-6 pedido) adaptados del contenido educativo real que el doctor publica en Instagram (dolor de espalda, hernia discal vs. dolor muscular, miedo a la cirugía de columna, estenosis espinal) — hardcodeados en `src/content/blog.ts`, sin CMS (consistente con la decisión de Phase 1 de mantener el stack simple).
- Consentimiento de cookies implementado con `localStorage` + `useSyncExternalStore`, sin librería de terceros — un solo store (`src/components/analytics/consent.ts`) compartido entre el banner y `AnalyticsScripts`, para que ambos reaccionen al mismo estado sin prop drilling y sin mismatches de hidratación SSR.
- `AnalyticsScripts` (creado en Phase 3 con gate solo por variable de entorno) se extiende en Phase 4 para exigir además `consent === "granted"` — GA4/Meta Pixel no se montan hasta que el visitante acepta el banner.
- Página `/privacidad` con `robots: { index: false, follow: true }` — página legal, no se busca que compita por keywords ni aparezca en resultados de búsqueda.
- Marco legal referenciado: Ley de Protección de Datos Personales del Perú (Ley N.º 29733).
- Deploy a Vercel diferido — requiere que Juan haga login/autorización en el dashboard de Vercel, algo que un agente no puede ejecutar por él.

</decisions>

<code_context>
## Existing Code Insights

Blog y privacidad se construyen sobre el layout global de Phase 1 (`Header`/`Footer`/`WhatsAppFloatButton`) y sobre el sistema de tracking de Phase 3 (`src/components/analytics/analytics-scripts.tsx`, gateado hasta ahora solo por `NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_META_PIXEL_ID`). Phase 4 añade la capa de consentimiento sobre ese gate existente y conecta `blogPosts` (`src/content/blog.ts`) al `sitemap.ts` ya creado en Phase 3 (ahora mapea cada post a una URL). El footer ya tenía la estructura lista para un link legal adicional.

</code_context>

<specifics>
## Specific Ideas

Ver `.planning/ROADMAP.md` Phase 4, `.planning/research/SEO-TRACKING.md` (§3, nota sobre aviso de cookies pendiente de validar — se resolvió con banner simple + página de privacidad) y `.planning/PROJECT.md` § Constraints (cumplimiento Ley N.º 29733).

</specifics>

<deferred>
## Deferred Ideas

- Deploy real a Vercel — pendiente de acción humana de Juan (login/autorización), no de código.
- Confirmar si hace falta algo más formal que el banner simple (p. ej. gestor de consentimiento granular por categoría) una vez el doctor tenga tráfico real.

</deferred>
