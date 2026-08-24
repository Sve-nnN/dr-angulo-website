# Phase 18: Rendimiento y accesibilidad - Context

**Gathered:** 2026-08-24
**Status:** Ready for planning

<domain>
## Phase Boundary

El sitio responde rápido en móvil y no deja fuera a nadie por contraste ni por estructura de la página.

Entra: caché de borde y TTFB (CWV-01), el rendimiento de `/testimonios` (CWV-02), la imagen LCP de `/sobre-el-doctor` (CWV-03), el JavaScript sin usar y los polyfills legacy (CWV-04), y los tres fallos de accesibilidad (A11Y-01).

**Sale de la fase: CWV-05, la imagen OpenGraph.** Juan la toma a su cargo (decisión del 2026-08-24). Ver la nota en `<deferred>`.

No entra: contenido, schema ni enlazado, que fueron la fase 16. Tampoco rediseño: los únicos cambios visuales permitidos son los de accesibilidad.

</domain>

<decisions>
## Implementation Decisions

### Accesibilidad
- El contraste se arregla subiendo la opacidad del texto: `text-white/85` pasa a `text-white`. **No se toca la paleta de marca.** El caso reportado está en `src/app/page.tsx:330`, y hay otro igual en la línea 44.
- El alcance es auditar las 23 rutas por contraste, no solo el párrafo que reportó Lighthouse. Una sola corrida encuentra el resto.
- Los `<dl>` se arreglan dejando un solo `<div>` por par, con `<dt>` y `<dd>` como hijos directos. Viven en `src/components/locations/location-card.tsx:47`, que es lo que renderiza las cuatro fichas de `/agendar`.
- El `<h3>` sin `<h2>` de `/sedes` sube a `<h2>`, que es lo que realmente es: cada sede es una sección hermana, no una subsección de nada.

### `/testimonios`
- **Perfilar antes de tocar.** La auditoría sospecha del carrusel de reels o del bloque de reseñas, pero no lo probó. Correr devtools con CPU throttling 4x y confirmar el culpable de los 2,45 s de Style & Layout y los 630 ms de forced reflow antes de escribir una línea.
- Si el culpable es el carrusel: diferir su montaje hasta que entre en viewport, con miniatura estática mientras tanto. No se saca de la página.
- Si es el bloque de reseñas: mismo trato, diferir e hidratar al entrar en viewport.
- Verbo de impeccable: `optimize`.

### Caché de borde y TTFB
- Primer sospechoso: el header `vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch`. Un `Vary` con esas claves impide cachear HTML en el borde. Segundo y tercero: reglas de Cloudflare que excluyen `text/html`, y cookies en la respuesta.
- El arreglo va por **Cache Rule de Cloudflare** que ignore esas claves de `Vary` para HTML, o por normalización en middleware. **No se toca el header `Vary` directamente**: puede romper el router de Next.
- **Juan tiene acceso al panel de Cloudflare** (confirmado el 2026-08-24). El agente deja el diagnóstico cerrado y las reglas escritas listas para aplicar; Juan las aplica. Si prefiere que se apliquen por API, lo dirá.
- Criterio de cierre: `cf-cache-status: HIT` en la segunda petición y TTFB por debajo de 300 ms, **medido contra producción**, no en local.

### Assets y bundle
- La imagen LCP de `/sobre-el-doctor` lleva `priority` en el componente `Image` de Next, que es lo que emite el preload con `fetchpriority="high"`. Revisar además que las dimensiones servidas coincidan con las renderizadas (220x330 en móvil) y que salga en formato moderno.
- Los 28 KB de JavaScript sin usar: **analizar el bundle primero** con `@next/bundle-analyzer` y recién ahí diferir con `dynamic()` lo que solo vive en una o dos rutas. No diferir a ciegas.
- Polyfills legacy: ajustar `browserslist` a los navegadores que el sitio realmente soporta.

### Regla de diseño, obligatoria
Esta fase es de diseño por definición. Todo cambio de interfaz pasa por la skill `impeccable`, con el verbo que corresponda:

| Trabajo | Verbo |
|---|---|
| Los tres fallos de accesibilidad y su verificación técnica | `audit` |
| El arreglo de contraste | `polish` |
| `/testimonios`, imagen LCP y bundle | `optimize` |

La skill es global: `~/.claude/skills/impeccable/`. **No hay copia local en el proyecto.** Arranque una sola vez por sesión con `node ~/.claude/skills/impeccable/scripts/context.mjs --target <ruta>`, con cwd en la raíz. El hook detector ya está aceptado (`.impeccable/config.local.json`) y sus hallazgos se atienden.

v1.3 es refinamiento, no rediseño: se preserva identidad visual y comportamiento.

### Claude's Discretion
- Qué componentes concretos se difieren, una vez que el perfilado diga quién es el culpable.
- Redacción de las reglas de Cloudflare que se le entregan a Juan.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/testimonios/page.tsx` monta `InstagramReelsSection` (`src/components/instagram/instagram-reels-section.tsx`, con `reels-carousel.tsx`) y `GoogleReviewsSection` (`src/components/reviews/google-reviews.tsx`). Son los dos sospechosos.
- `src/components/locations/location-card.tsx:47` tiene el `<dl className="space-y-4">` que rompe la estructura. `sede-card.tsx:42` tiene otro `<dl>` que conviene revisar de paso.
- `src/app/page.tsx:44` y `:330` tienen los dos `text-white/85` sobre fondo primario.

### Established Patterns
- `next.config.ts` ya declara cinco cabeceras de seguridad en `headers()`, y documenta a propósito por qué falta CSP. Ese comentario es de la fase 19, no de esta.
- El proyecto tiene cinco compuertas: `content:check`, `seo:check`, `sedes:check`, `tsc --noEmit` y `build`. **Las cinco tienen que salir 0 en cada commit**, no solo al final de la fase.

### Integration Points
- Cloudflare está delante del origen y puede filtrar o reescribir cabeceras. El propio `next.config.ts` lo advierte: que una cabecera salga del origen no garantiza que llegue al navegador. Todo se comprueba con `curl -sI` contra producción después del deploy.

</code_context>

<specifics>
## Specific Ideas

- Lección de la fase 16, que se aplica acá como criterio de planificación: **ninguna constante o declaración de compuerta puede actualizarse en una tarea posterior a la que rompe su invariante.** En la fase 16 ese defecto apareció tres veces, dos en revisión y una en ejecución. Cada plan de esta fase tiene que ubicar el arreglo de la compuerta en la misma tarea que la rompe.
- Segunda lección de la fase 16: **una compuerta que ningún plan corre es la que se rompe en silencio.** `sedes:check` no estaba en el `<verify>` de ninguna ola y quedó en rojo cuatro commits seguidos. Todos los planes de esta fase corren las cinco.
- Números de partida de la auditoría del 2026-08-23, para los criterios: TTFB de la portada 630 ms; `/testimonios` en 0,60 con TBT de 850 ms, 2,45 s de Style & Layout y 630 ms de forced reflow; `/sobre-el-doctor` con LCP de 2,64 s y 21 KB de ahorro disponible; 28 KB de JavaScript sin usar en el chunk compartido, 41% de sus 70.799 bytes.

</specifics>

<deferred>
## Deferred Ideas

- **CWV-05, la imagen OpenGraph de 551 KB: fuera de la fase, a cargo de Juan** (decisión del 2026-08-24). Dato que se le entregó: no existe un archivo que comprimir, la imagen la genera Next en build desde `src/lib/og-card.tsx`, que alimenta 15 archivos `src/app/**/opengraph-image.tsx`, uno por ruta, para que cada página tenga su propia tarjeta con su título. Bajar el peso implica simplificar el diseño en el generador, o reemplazarlo por un JPEG estático perdiendo el título por página. `public/og-dr-angulo.jpg` (71 KB) es otra cosa: es la imagen del schema.
- Que el umbral de `FAQPage` vive en una sola de las dos superficies que emiten el bloque: viene de la fase 16, no es de rendimiento.
- `seo-tools/data/*.json` indexado por los slugs viejos: va a la fase 19.
- Diferenciar el cromo de aside y pie que se repite en las cuatro fichas de sede: el verificador de la fase 16 lo anotó como informativo. Si la fase 19 lo toma, bien; no es de rendimiento.

</deferred>

---

## Addendum 2026-08-24: el carrusel de reels queda descartado como culpable

El `18-UI-SPEC.md` marcó como `unresolved` si el carrusel de Instagram realmente renderiza en producción. **Verificado contra producción y resuelto: no renderiza.**

Evidencia, sobre el HTML servido por `https://drangulocolumna.com/testimonios`:

| Señal | Valor |
|---|---|
| `cdninstagram` (el CDN que sirve las portadas de los reels) | **0 apariciones** |
| `<img>` en toda la página | **2** |
| H2 presentes | "Reseñas en Google", "Otras reseñas", "Videos del consultorio", "Consultorio privado", "Contacto rápido" |

El H2 "Videos del consultorio" existe, pero debajo no hay portadas de reels: el carrusel está en el estado de fallback que `PRODUCT.md` documenta, a la espera de que se vincule la cuenta.

**Consecuencia para CWV-02:** la auditoría del 2026-08-23 midió producción, así que el carrusel **no estaba en el marcado** cuando se registraron los 2,45 s de Style & Layout, los 630 ms de forced reflow y los 850 ms de TBT. No puede ser el culpable. La sospecha de la auditoría, que este contexto había repetido, queda descartada por evidencia.

El perfilado arranca entonces por el otro candidato, el bloque de reseñas de Google, que sí renderiza (`GOOGLE_PLACES_API_KEY` está configurada y la página trae 12 apariciones de "Reseñas"). Y si tampoco es él, hay que buscar en el layout compartido, no en los componentes de esta ruta.

**Nota de método:** esto es exactamente por qué la decisión de "perfilar antes de tocar" era la correcta. Optimizar el carrusel habría consumido la fase entera sin mover el número.
