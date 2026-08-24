---
phase: 16-alineaci-n-de-contenido-enlazado-y-schema
plan: 06
subsystem: contenido
tags: [canibalizacion, intencion-de-busqueda]
requires: ["16-04", "16-05"]
provides: ["deslinde de intención entre ciática, lumbalgia y hernia discal"]
affects: [src/content/blog, scripts/check-sedes.mjs]
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified:
    - src/content/blog/ciatica.ts
    - src/content/blog/lumbalgia.ts
    - scripts/check-sedes.mjs
decisions:
  - "Las señales de alarma que vivían dentro de la sección cirugia del post de ciática se conservan verbatim dentro de cuando-consultar: ese post no tiene bloque propio de señales de alarma y borrarlas sería un retroceso de seguridad en una página YMYL."
metrics:
  duration: ~20 min
  completed: 2026-08-24
status: complete
---

# Phase 16 Plan 06: Deslinde de intención Summary

La decisión quirúrgica se desarrolla solo en `/servicios/hernia-discal`. Los dos posts informativos la retiran y remiten a la guía.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Ciática | `873dab2` | sección `cirugia` retirada, párrafo puente al final de `sin-operar`, señales de alarma preservadas en `cuando-consultar` |
| 2. Lumbalgia | `450682a` | secciones `cirugia` y `cirugia--lumbalgia-se-opera` retiradas, una frase puente al final de `sin-operar` |
| 3. Cierre de fase | `ebaaa49` | suite completa de puertas, más la corrección de `SITEMAP_TOTAL` en la puerta de sedes |

## Mapa de intención resultante

| URL | Intención | Desarrolla la decisión quirúrgica | Palabras (puerta de contenido) |
|---|---|---|---|
| `/servicios/hernia-discal` | comercial: la condición, el diagnóstico, la decisión de operar y dónde se atiende | **sí, la única** | 3233 |
| `/blog/lumbalgia` | informativa: dolor lumbar inespecífico, tipos, autocuidado, señales de alarma, cuándo consultar | no | 2067 |
| `/blog/ciatica` | informativa: dolor irradiado, diagnóstico diferencial, qué alivia sin cirugía | no | 2041 |

Los dos posts enlazan a la guía por dos caminos, los dos intactos: la entrada de `outboundLinks` hacia `/servicios/hernia-discal` y el campo `relatedService`, que renderiza el enlace al pie del artículo.

## Verificación de cierre de la fase 16

- `grep -c 'id: "cirugia"' src/content/service-pages/hernia-discal.ts`: 1. `describesSurgery: true`: 1. `href: "/sedes/`: 4.
- `id: "cirugia"` en el blog: 0 en `ciatica.ts` y en `lumbalgia.ts`; 1 en `cirugia-de-columna.ts`, que es el post cuyo tema es ese.
- Ningún `id="cirugia"` en los HTML de los dos posts.
- `npm run content:check`: **0**. `npm run seo:check`: **0**. `npm run sedes:check`: **0**. `npm run lint`: **0**. `npm run build`: **0**.
- Conteo de encabezados de nivel 2 repetidos: **0 violaciones sobre 17 archivos**.
- `grep -rniE 'anchor: "[^"]*neurocirujano' src/content/`: 0 líneas.
- `FAQPage` en HTML: exactamente **2** archivos.
- Sitemap: **23** `<loc>`, ninguno con slug viejo del blog.

## Deviations from Plan

**1. [Rule 2 - Contenido crítico que el recorte se habría llevado] Señales de alarma del post de ciática**

- **Found during:** Tarea 1
- **Issue:** la sección `cirugia` de `src/content/blog/ciatica.ts` contenía el párrafo con las tres situaciones que se evalúan el mismo día (pérdida de fuerza que avanza, adormecimiento en la zona de la entrepierna y los genitales, pérdida de control de esfínteres). A diferencia de lumbalgia y de la guía de hernia discal, ese post **no tiene bloque `senales-de-alarma` propio**, así que borrar la sección entera dejaba la página sin la advertencia de cola de caballo. En un sitio YMYL de un médico real eso es un retroceso de seguridad, no un recorte de SEO.
- **Fix:** el párrafo se conserva **verbatim** como segundo párrafo de `cuando-consultar`, que es la sección que el propio plan deja en pie para "cuándo consultar". No se escribió ninguna afirmación clínica nueva, no se tocó ningún `id`, `heading`, orden ni enlace, y no se reintrodujo la decisión quirúrgica.
- **Commit:** `873dab2`

**2. [Rule 3 - Puerta en rojo] `SITEMAP_TOTAL` existe en tres scripts, no en dos**

- **Found during:** Tarea 3
- **Issue:** `scripts/check-sedes.mjs` tiene su propia copia de `SITEMAP_TOTAL = 22`. El plan 16-02 solo nombró `check-content.mjs` y `check-seo.mjs`, así que la puerta de sedes quedó en rojo ("el sitemap tiene 23 URLs, deben ser 22") desde el commit `4bdf2bb` hasta este.
- **Plan que lo originó:** 16-02, tarea 1. La omisión es del plan, no de su ejecución: `check-sedes.mjs` no figura en su `files_modified` ni en su `key_links`.
- **Fix:** constante subida a 23 con el mismo comentario explicativo que las otras dos. Se corrigió acá y no se dejó anotado sin más porque el `<verify>` de esta tarea exige que `npm run sedes:check` salga 0, y esa exigencia y la de no parchear fallos ajenos no podían cumplirse las dos.
- **Commit:** `ebaaa49`
- **Nota:** ninguna de las tres corridas de `sedes:check` de las olas 1 a 5 se hizo, porque ningún plan anterior lo incluía en su `<verify>`. Vale la pena que un plan futuro añada esa puerta a los `<verify>` que tocan el sitemap.

## Cierre posterior a la verificación de fase (commit `503b6a7`)

El verificador cerró la fase con `human_needed`: `/blog/reumatologo-o-traumatologo`, la URL que la ola 2 creó, conservaba una sección `cirugia` de nivel 2 con el mismo material que esta ola retiró de ciática y lumbalgia. No es un defecto de origen: los párrafos venían verbatim de `/preguntas-frecuentes` y el encabezado lo varió la ola 4. La brecha es de secuencia — la ola 2 publicó, la ola 6 recortó otros dos archivos y ninguna reconcilió las dos.

Juan decidió recortarla con el mismo trato. Aplicado:

- sección `cirugia` retirada entera (era la última del arreglo; ningún `id` de los que quedan cambió)
- párrafo puente al final de `sin-operar`, con el criterio de `873dab2` y `450682a`
- `description` reescrita: anunciaba "en qué casos se plantea operar", una sección que ya no existe
- `bannerAfterSectionId` no requería cambio: apunta a `que-es--diferencia-entre-artrosis-traumatologo-y-reumatologo`. Ninguna ancla del repo apuntaba a `#cirugia` de esta URL.

**No hubo contenido de seguridad que preservar**, a diferencia del post de ciática: la sección retirada no traía lista de señales de alarma ni criterio de urgencia ("mismo día", esfínteres, entrepierna). Se comprobó por `grep` antes de borrar.

Estado tras el recorte: **1140 palabras** (piso 900), cuatro puertas en 0, **0 violaciones de H2 sobre 17 archivos**, sitemap en 23, `FAQPage` en 2 HTML.

### Desviación registrada

**[Rule 2 - Enlace que el puente necesitaba] `outboundLink` nuevo hacia `/servicios/hernia-discal`**

- **Issue:** este post no tiene `relatedService` ni tenía enlace a la guía de hernia discal, a diferencia de ciática y lumbalgia, que la alcanzaban por dos caminos. Un párrafo puente que remite a una guía inalcanzable desde la página es un puente roto.
- **Fix:** entrada nueva en `outboundLinks` con el rótulo canónico que fijó la ola 5, "Guía sobre la hernia discal". No se inventó copy ni se reescribió ningún anchor existente.
- **Consecuencia medida:** el total de anchors del sitio pasa de **110 a 111**. Los criterios de 16-05 que citan 110 quedan desactualizados por esta adición deliberada; el invariante que sí importa, `grep -rhoE 'anchor: "[a-záéíóúñ][^"]*"' src/content/ | wc -l` → **0**, se mantiene.

### Observación, no acción

`src/content/blog/artrosis.ts` también tiene una sección `id: "cirugia"`. Queda en pie a propósito: D-12 nombra los dos posts que canibalizan con la guía de columna, y la artrosis es otra condición cuyo tratamiento quirúrgico no compite con `/servicios/hernia-discal`. Si se quisiera unificar el criterio, es decisión de fase, no de este cierre.

## Known Stubs

Ninguno.

## Self-Check: PASSED
