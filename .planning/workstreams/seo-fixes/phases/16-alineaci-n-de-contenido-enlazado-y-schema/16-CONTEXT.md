# Phase 16: Alineación de contenido, enlazado y schema - Context

**Gathered:** 2026-08-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Cada URL del sitio anuncia el tema que realmente trata, cubre una intención de búsqueda distinta a las demás, y lo declara igual en su title, su H1, sus anchors y su schema.

Entra: renombre de dos slugs del blog con su 301, separación de `/preguntas-frecuentes` en dos páginas, reescritura de los 106 anchors internos, deslinde de intención entre ciática, lumbalgia y hernia discal, variación de los H2 de plantilla en las ocho páginas que la comparten, y corrección de `about` y del `FAQPage` sobrante.

No entra: pedir indexación (fase 17), rendimiento y accesibilidad (fase 18), citas médicas y CSP (fase 19). Tampoco entra reescribir el contenido clínico: el texto es sólido, lo que falla es la estructura repetida y la asignación de intención.

</domain>

<decisions>
## Implementation Decisions

### Renombre de slugs del blog
- Slugs nuevos: `/blog/ciatica` y `/blog/cirugia-de-columna`. Nombran el tema real, cortos, sin relleno.
- El 301 va en `next.config.ts` dentro de `redirects()`, donde ya hay tres precedentes de la fase 14 de v1.2.
- El renombre es completo y en un solo commit por post: archivo de contenido, campo `slug`, nombre del export, import en `src/content/blog/index.ts` y toda referencia interna.
- `updatedAt` se actualiza a la fecha del cambio, porque el contenido se toca de verdad en esta fase.

### FAQ y página de reumatólogo
- Se separa en dos páginas. Son dos intenciones de búsqueda distintas y hay volumen para las dos.
- El contenido de "reumatólogo o traumatólogo" se muda a `/blog/reumatologo-o-traumatologo`, con la plantilla informativa del blog.
- `/preguntas-frecuentes` recupera un title que la nombra por lo que es, del tipo "Preguntas frecuentes antes de la consulta", alineado con su H1 actual "Dudas frecuentes antes de la consulta".
- El `FAQPage` de 7 preguntas se queda en `/preguntas-frecuentes`. No rinde en SERP desde el 7 de mayo de 2026, pero no penaliza y describe la página con precisión.

### Anchors internos y canibalización
- Se reescriben los **106 anchors** de `outboundLinks` en los 20 archivos de `src/content/`, a frases descriptivas que digan a dónde llevan. Es lo que exige LINK-01: el problema es el patrón de coincidencia exacta repetido en todo el sitio, no solo los casos factualmente falsos.
- **Esto revierte una decisión de v1.2**, que colocó esos anchors deliberadamente como asignación de keywords en su paquete on-page. Decisión tomada con esa consecuencia sobre la mesa.
- La reescritura pasa por `impeccable clarify`: los anchors son copy de interfaz.
- Deslinde profundo: se quita la sección "Cuándo hace falta operar" de los dos posts informativos (lumbalgia y ciática) y se reemplaza por un párrafo corto que remite a `/servicios/hernia-discal`. La decisión quirúrgica se desarrolla solo en la página comercial.
- La variación de H2 alcanza a las ocho páginas que comparten la plantilla, no solo a las tres que canibalizan. Criterio: ninguna secuencia de H2 se repite palabra por palabra en más de dos páginas.

### Datos estructurados
- Causa raíz de SCH-01 identificada en el scout: en `BlogPostingJsonLd`, `about` se deriva de `post.relatedService`, que es la guía del silo a la que el post empuja. Se está emitiendo una relación de navegación como si fuera la relación de tema. Por eso lumbalgia, ciática y cirugía apuntan los tres a hernia discal.
- Arreglo: campo nuevo por post que declara su entidad de tema. `relatedService` queda solo para navegación. El patrón a copiar ya existe en `ServicePageJsonLd`, que construye su `about` como `MedicalCondition` con `name` y `alternateName`.
- El post de cirugía de columna declara `MedicalProcedure`, referenciando los nodos `#procedimiento` que ya viven en el grafo global. Cirugía es un procedimiento, no una condición, así que el campo nuevo acepta los dos tipos.
- `alternateName` en las tres condiciones nuevas, con el mismo criterio que hernia discal: lumbalgia con "dolor lumbar" y "dolor de espalda baja", ciática con "ciatalgia" y "radiculopatía lumbar", artrosis con "osteoartritis".
- El `FAQPage` de una sola pregunta de `/servicios/hernia-discal` se quita. La pregunta queda como contenido normal. No se agrega `FAQPage` nuevo en ninguna página.

### Claude's Discretion
- Redacción concreta de cada anchor y de cada H2 variado, dentro de los criterios de arriba.
- Orden interno de los commits, siempre que respete la secuencia obligatoria: slugs primero, después schema y H2, y el deslinde de intención al final.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/content/blog/*.ts`: un módulo de datos por artículo, con `slug`, `title`, `h1`, `description`, `publishedAt`, `updatedAt`, `sections`, `outboundLinks` y `relatedService`. `title` y `h1` ya son campos separados a propósito.
- `src/content/service-pages/*.ts`: mismo modelo para las guías, con `conditionName` y `alternateNames` que alimentan el `about` correcto. Es el patrón a replicar en el blog.
- `src/components/structured-data.tsx`: todo el JSON-LD del sitio. `BlogPostingJsonLd` en la línea 555, `ServicePageJsonLd` con el `about` bien construido cerca de la 392, `conditionNodes()` en la 162.
- `src/app/blog/[slug]/page.tsx`: plantilla única de post. El bloque "Sigue leyendo" se renderiza desde `post.outboundLinks` entre las líneas 149 y 167.
- `next.config.ts`: `redirects()` ya tiene tres 301 permanentes de la fase 14, con el comentario que explica por qué existen. Es el lugar y el formato para los dos nuevos.

### Established Patterns
- Los `id` de sección se escriben a mano y no se derivan del título en tiempo de render, justamente para que un cambio de redacción no rompa un ancla que alguien compartió por WhatsApp. **La variación de H2 no debe tocar los `id`.**
- El contenido clínico se escribe en voz explicativa, nunca testimonial. Prohibido por convención del repo: cifras de cirugías, tasas de éxito, plazos garantizados y precios.
- `scripts/check-seo.mjs` mide title y meta de las 23 rutas y falla si algo se pasa de 60 y 155 caracteres. El renombre y los titles nuevos tienen que pasar esa compuerta.

### Integration Points
- `src/content/blog/index.ts` importa cada post por nombre de export: renombrar el archivo obliga a tocar los imports.
- `src/app/sitemap.xml`: las URLs del blog salen de `blogPosts`, así que el renombre se propaga solo, pero hay que verificarlo.
- La página nueva de reumatólogo necesita entrada en `blogPosts` y aparecer en `/blog`.

</code_context>

<specifics>
## Specific Ideas

- Anotar las impresiones de partida en Search Console de las keywords del bloque "Sigue leyendo" antes de reescribir los anchors. Con 892 impresiones totales el riesgo es bajo, pero el punto de partida no se recupera después.
- Los anchors con el problema más grave, para revisarlos primero: "mejor neurocirujano de columna lima" aparece 4 veces, "cirugía de columna cerca de mí" 4, "cirujano de columna cerca de mí" 3, y hay otros 7 con "neurocirujano" incluidos "neurocirujano surco", "neurocirujano clínica sanna" y "neurocirujano clínica tezza". El doctor es traumatólogo y cirujano de columna, no neurocirujano. También "mejor traumatólogo de la clínica ricardo palma" y "mejor clínica de traumatología en lima".
- La ventaja de renombrar los slugs ahora es que ninguna de las dos URLs está indexada. En seis meses el cambio sí costaría.

</specifics>

<deferred>
## Deferred Ideas

- Ampliar el blog más allá de los posts actuales, con calendario de publicación: es FUT-CONT-01, no entra a v1.3.
- Programa sostenido de link building médico: es FUT-IDX-01.
- Solicitud de indexación de las URLs nuevas: es IDX-01, fase 17, y es justamente lo que esta fase desbloquea.

</deferred>
