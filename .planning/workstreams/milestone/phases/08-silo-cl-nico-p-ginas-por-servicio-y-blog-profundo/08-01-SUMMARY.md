---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 01
subsystem: ui
tags: [next-app-router, dynamic-routes, generate-static-params, json-ld, schema-org, tailwind, accessibility, content-gate]

requires:
  - phase: 01-fundaci-n-t-cnica-y-de-marca
    provides: tokens de marca en globals.css, BookingCta, WhatsAppCta, CtaLocation y la regla global de foco
  - phase: 02-p-ginas-core-y-trayectoria
    provides: el hub /servicios con sus cuatro id de seccion, src/content/services.ts y src/content/cv.ts
  - phase: 07
    provides: structured-data.tsx ampliado con ID, abs, JsonLdScript, BreadcrumbJsonLd y FaqJsonLd
provides:
  - Ruta dinamica /servicios/[slug] alimentada por datos, con generateStaticParams
  - Guia clinica completa de hernia discal, 1569 palabras de cuerpo prerenderizadas
  - AuthorByline, MedicalDisclaimer, TableOfContents, MidContentCta y ServiceCard
  - MedicalWebPageJsonLd con about de tipo MedicalCondition, sin afirmar revision medica
  - scripts/check-content.mjs como contrato ejecutable del contenido de toda la fase
affects: [08-02, 08-03, 08-04, fase 09 paginas por sede, fase 10 breadcrumbs y titles]

tech-stack:
  added: []
  patterns:
    - "Orden de secciones garantizado por construccion: tupla as const mas Record sobre ella"
    - "Puerta de contenido ejecutable sobre el HTML prerenderizado, sin dependencias"
    - "Componentes de firma sin superficie de props libre, para cerrar el hueco por diseno"

key-files:
  created:
    - src/content/service-pages.ts
    - src/app/servicios/[slug]/page.tsx
    - src/components/ui/author-byline.tsx
    - src/components/ui/medical-disclaimer.tsx
    - src/components/ui/table-of-contents.tsx
    - src/components/ui/mid-content-cta.tsx
    - src/components/services/service-card.tsx
    - scripts/check-content.mjs
  modified:
    - src/lib/site-config.ts
    - src/components/ui/booking-cta.tsx
    - src/components/ui/whatsapp-cta.tsx
    - src/app/servicios/page.tsx
    - src/components/structured-data.tsx
    - src/app/sitemap.ts
    - package.json

key-decisions:
  - "El CTA de cierre de la tarea 1 uso la clave existente `services` hasta que la tarea 2 creo `service_page`: la clave no existia todavia y TypeScript rompia el build"
  - "Las salvaguardas SAFE-08 y SAFE-10 se miden sobre el texto del cuerpo y no sobre el HTML crudo, porque el CSS critico que inyecta Tailwind contiene patrones de digito y porcentaje"
  - "La cuenta de atributos de anclaje se hace dentro del elemento con data-content-body y no sobre el documento, porque el payload RSC repite el marcado"
  - "El encabezado de lecturas relacionadas es un parrafo y no un h2, para que el esquema tenga exactamente siete h2 con ancla mas el del CTA de cierre"

patterns-established:
  - "SERVICE_SECTION_ORDER: la plantilla recorre la tupla y nunca Object.keys, asi el indice y lo renderizado salen de la misma lista"
  - "AuthorByline no acepta children ni credenciales por props: importa credentialsInfo de cv.ts y no habilita ningun hueco para texto libre"
  - "MedicalWebPageJsonLd extiende structured-data.tsx reusando ID, abs y JsonLdScript: el repositorio sigue teniendo un solo punto de inyeccion de HTML crudo"
  - "check-content.mjs falla si falta el HTML prerenderizado, nunca aprueba por ausencia de evidencia"

requirements-completed: [SVC-01, SVC-05]

coverage:
  - id: D1
    description: "/servicios/hernia-discal se prerenderiza estatica con las siete secciones en el orden fijo y 1569 palabras de cuerpo"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "node scripts/check-content.mjs /servicios/hernia-discal"
        status: pass
      - kind: integration
        ref: "npm run build && test -f .next/server/app/servicios/hernia-discal.html"
        status: pass
    human_judgment: false
  - id: D2
    description: "La firma del doctor y el aviso educativo se leen juntos arriba de la tabla de contenidos, y el aviso se repite al cierre"
    requirement: SVC-01
    verification:
      - kind: integration
        ref: "node scripts/check-content.mjs /servicios/hernia-discal (orden byline, disclaimer, toc, primer h2)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Las siete anclas de la tabla de contenidos mueven el foco a su h2 y ninguna queda debajo del header sticky"
    verification:
      - kind: integration
        ref: "check-content.mjs verifica id, tabindex=-1 y coincidencia de texto entre entrada y h2"
        status: pass
    human_judgment: true
    rationale: "El recorrido de teclado y la posicion visual del h2 bajo el header sticky solo se confirman navegando la pagina a 375px; la puerta verifica el marcado, no lo que ve el usuario"
  - id: D4
    description: "Desde /servicios se llega a la guia con un clic y los cuatro anclajes vivos del hub siguen resolviendo"
    requirement: SVC-05
    verification:
      - kind: integration
        ref: "check-content.mjs comprobaciones globales sobre .next/server/app/servicios.html"
        status: pass
    human_judgment: false
  - id: D5
    description: "El banner de agenda cae dentro del primer tercio del cuerpo y hay un CTA de cierre"
    requirement: SVC-05
    verification:
      - kind: integration
        ref: "check-content.mjs POS-01: 23.1 por ciento del cuerpo, rango 15 a 35"
        status: pass
    human_judgment: false
  - id: D6
    description: "El sitemap declara la ruta nueva y el HTML emite MedicalWebPage con about de tipo MedicalCondition, sin afirmar revision medica"
    verification:
      - kind: integration
        ref: "grep -o '<loc>' .next/server/app/sitemap.xml.body | wc -l (13); reviewedBy y lastReviewed ausentes"
        status: pass
    human_judgment: false
  - id: D7
    description: "El contenido clinico publicado bajo la firma del doctor es correcto y util para un paciente en Lima"
    verification:
      - kind: other
        ref: "check-content.mjs SAFE-05, SAFE-08, SAFE-09, SAFE-10 sobre el cuerpo y sobre service-pages.ts"
        status: pass
    human_judgment: true
    rationale: "La puerta bloquea las formas prohibidas de afirmacion, no juzga la exactitud clinica de la prosa. Se publica sin revision previa del doctor por decision del 2026-08-10 y esa revision sigue pendiente"
  - id: D8
    description: "scripts/check-content.mjs falla en rojo cuando el build no existe y cuando el contenido viola las salvaguardas"
    verification:
      - kind: integration
        ref: "prueba en rojo con el HTML renombrado (exit 1, mensaje pide npm run build) y con violaciones inyectadas (6 fallas detectadas)"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-08-10
status: complete
---

# Phase 8 Plan 01: Trazador del silo clinico Summary

**`/servicios/hernia-discal` queda viva de punta a punta con 1569 palabras de guia clinica, firma con credenciales del CV, aviso educativo arriba del pliegue, schema `MedicalWebPage` sin afirmar revision medica, y una puerta ejecutable que gobierna el contenido del resto de la fase.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-10T15:31:43Z
- **Completed:** 2026-08-10T15:43:49Z
- **Tasks:** 3 de 3
- **Files modified:** 15 archivos, 1283 inserciones

## Accomplishments

- La arquitectura del silo quedo probada sobre un solo camino antes de expandir: ruta dinamica alimentada por datos, orden de secciones garantizado por el tipo, y la tabla de contenidos derivada de la misma lista que se renderiza. Si a alguna de las tres paginas hermanas le falta una seccion, el build se cae en vez de publicar una guia incompleta.
- El contenido clinico se apoya solo en consenso general y en el CV verificado. Incluye el punto que mas le sirve a un paciente que llega con una resonancia en la mano: que una parte considerable de las resonancias de personas sin dolor muestra discos alterados, y que por eso la imagen no se lee sola.
- Las salvaguardas dejaron de ser prosa y pasaron a ser codigo. `scripts/check-content.mjs` verifica ocho familias de criterios sobre el HTML prerenderizado, y se probo en rojo dos veces: sin build y con violaciones inyectadas.
- El contraste de los CTA dorados se corrigio en los componentes compartidos, asi que el arreglo aplica a todo el sitio y no solo a las paginas nuevas.

## Task Commits

1. **Tarea 1: /servicios/hernia-discal vivo de punta a punta** - `488b57c` (feat)
2. **Tarea 2: banner del primer tercio, contraste de los CTA y tarjetas del hub** - `0196d60` (feat)
3. **Tarea 3: schema MedicalWebPage, sitemap y puerta automatica de contenido** - `18b20b0` (feat)

## Files Created/Modified

**Creados**

- `src/content/service-pages.ts` - Modelo de datos del silo y la entrada completa de hernia discal. `SERVICE_SECTION_ORDER` como tupla `as const` y `Record<ServiceSectionId, ServiceSection>` sobre ella.
- `src/app/servicios/[slug]/page.tsx` - Plantilla unica de las cuatro paginas, con `generateStaticParams`, `generateMetadata` y los tres bloques de JSON-LD.
- `src/components/ui/author-byline.tsx` - Firma del doctor. Props exactamente `{ publishedAt, updatedAt }`, credenciales importadas de `cv.ts`.
- `src/components/ui/medical-disclaimer.tsx` - Aviso de contenido educativo, sin props.
- `src/components/ui/table-of-contents.tsx` - `nav` etiquetado con `aria-labelledby`, devuelve `null` con menos de tres entradas.
- `src/components/ui/mid-content-cta.tsx` - Banner del primer tercio, con destino principal a `/agendar`.
- `src/components/services/service-card.tsx` - Tarjeta del hub con enlace extendido y un solo elemento interactivo.
- `scripts/check-content.mjs` - Puerta de contenido. Sin dependencias, corre sobre `.next/server/app/`.

**Modificados**

- `src/lib/site-config.ts` - Claves `service_page` y `blog_post` en `whatsappMessages`.
- `src/components/ui/booking-cta.tsx` - `ring-1 ring-accent-dark` en las clases base.
- `src/components/ui/whatsapp-cta.tsx` - Anillo en el variante `accent`; el variante `outline` pasa a `text-primary-dark`.
- `src/app/servicios/page.tsx` - Suma la seccion "Condiciones que explico en detalle" arriba de las categorias heredadas.
- `src/components/structured-data.tsx` - Suma `MedicalWebPageJsonLd` y parametriza `FaqJsonLd` con `path` opcional.
- `src/app/sitemap.ts` - Deriva una entrada por cada `servicePage`.
- `package.json` - Script `content:check`. Ni `dependencies` ni `devDependencies` cambiaron.

## Decisions Made

- **El presupuesto de palabras se cumplio con margen y sin relleno.** El cuerpo mide 1569 palabras contra el minimo de 900. La seccion de diagnostico incluye el matiz de las resonancias asintomaticas porque es lo que mas reduce ansiedad en un paciente que llega con un informe y una hernia visible.
- **Los plazos de recuperacion se escribieron en voz condicional y sin cifra.** La seccion dice que el retorno se plantea de manera progresiva y que el plazo se define en los controles, no de antemano. Ninguna promesa de resultado.
- **El encabezado del bloque de lecturas relacionadas es un parrafo.** Como `h2` habria dado nueve encabezados de segundo nivel y habria roto la correspondencia uno a uno entre el esquema y la tabla de contenidos.
- **La puerta mide el porcentaje del banner sobre el cuerpo y no sobre el documento.** Contar el mobiliario habria dado un numero que no significa nada: el objetivo de POS-01 es donde cae el banner dentro de la lectura.

## Deviations from Plan

### Auto-fixed Issues

**1. [Regla 3 - Bloqueo] El CTA de cierre de la tarea 1 pedia una clave de `CtaLocation` que la tarea 2 todavia no habia creado**

- **Found during:** Tarea 1
- **Issue:** La accion de la tarea 1 especifica `WhatsAppCta variant="accent" location="service_page"`, pero la misma tarea aclara que las claves nuevas de `CtaLocation` llegan en la tarea 2, y `src/lib/site-config.ts` no esta en la lista de archivos de la tarea 1. Con la clave inexistente, TypeScript rompia el build y la tarea no podia cerrar verde.
- **Fix:** La tarea 1 uso la clave existente `location="services"`. La tarea 2, al crear `service_page`, la cambio por la definitiva.
- **Files modified:** `src/app/servicios/[slug]/page.tsx`
- **Verification:** `npm run build` y `npm run lint` en verde al cierre de ambas tareas; el HTML final emite el mensaje de `service_page`.
- **Committed in:** `488b57c` y `0196d60`

**2. [Regla 3 - Bloqueo] Los criterios de salvaguarda SAFE-08 y SAFE-10 no son verificables sobre el HTML crudo**

- **Found during:** Tarea 1, criterio 14
- **Issue:** El criterio pide cero coincidencias de un digito seguido de `%` en el HTML renderizado. El CSS critico que Next.js inyecta en cada pagina contiene decenas de esas coincidencias (`translateY(100%)`, anchos porcentuales de la grilla). Las paginas de v1.0 ya las tienen: `blog/estenosis-espinal-que-es.html` trae treinta. El criterio, tomado al pie de la letra, es imposible de cumplir y no depende del contenido.
- **Fix:** La comprobacion se mide sobre el texto del cuerpo, que es lo que SAFE-08 y SAFE-10 realmente protegen y lo que la tarea 3 especifica ("sobre el texto del cuerpo normalizado"). El resultado sobre el cuerpo es cero coincidencias de porcentaje y cero de soles.
- **Files modified:** `scripts/check-content.mjs`
- **Verification:** Prueba en rojo con `90%` y `S/130` inyectados en el cuerpo del HTML: la puerta los detecto y salio con codigo 1.
- **Committed in:** `18b20b0`

**3. [Regla 3 - Bloqueo] El conteo de atributos de anclaje sobre el documento completo da el doble**

- **Found during:** Tarea 1, criterio 8
- **Issue:** El criterio espera exactamente dos apariciones de `data-medical-disclaimer` en el HTML. El documento trae cuatro: dos en el DOM renderizado y dos mas dentro del payload RSC que Next.js inlinea en `self.__next_f.push`. Lo mismo aplica a `data-author-byline` y `data-toc`.
- **Fix:** Tanto la verificacion como la puerta recortan primero el elemento con `data-content-body` y cuentan dentro de ese recorte. Dentro del articulo hay exactamente dos avisos, una firma y una tabla de contenidos.
- **Files modified:** `scripts/check-content.mjs`
- **Verification:** Conteo dentro del articulo: `data-medical-disclaimer` 2, `data-author-byline` 1, `data-toc` 1, `data-mid-cta` 1.
- **Committed in:** `18b20b0`

### Criterios cuya expresion literal no es satisfacible, verificados por su intencion

Estos tres no son cambios de codigo. Son criterios cuya redaccion literal produce un falso negativo, y quedan anotados para que quien audite no los lea como incumplimientos.

**Tarea 2, criterio 10.** `grep -Ec '<(Link|a|button)' src/components/services/service-card.tsx` devuelve 2, no 1. La alternativa `a` de la expresion tambien coincide con `<article`, que el propio contrato de diseno exige como nodo raiz de la tarjeta. Con limite de palabra, `grep -Eo '<(Link|a|button)\b'` devuelve 1, que es la intencion de A11Y-21: un solo elemento interactivo por tarjeta. Cero `<a>` y cero `<button>` propios.

**Tarea 3, criterio 11.** El comando devuelve 1, no 0. La linea `+    "lint": "eslint",` aparece en el diff solo porque se le agrego una coma final al sumar el script nuevo, y su valor `"eslint"` coincide con la expresion. Los bloques `dependencies` y `devDependencies` no tienen una sola linea modificada; el diff completo de `package.json` toca unicamente `scripts`.

**Tarea 1, criterio 7.** El HTML trae ocho `<h2` dentro del articulo: siete con `id` y `tabindex="-1"` mas el del CTA de cierre, tal como pide el criterio. Se anota porque el conteo sobre el documento completo, sin recortar el articulo, arrastra el payload RSC.

---

**Total deviations:** 3 auto-corregidas (3 de Regla 3) mas 3 criterios verificados por intencion.
**Impact on plan:** Ninguna de las tres toca el alcance ni afloja una salvaguarda. Las tres son consecuencia de que los criterios se escribieron contra un modelo mental del HTML que no coincide con lo que Next.js 16 emite (payload RSC inlineado y CSS critico). La proteccion real quedo intacta y con prueba en rojo.

## Issues Encountered

- **La primera prueba en rojo de la puerta fue invalida.** Las cadenas que inyecte para simular violaciones no existian en el HTML final, asi que los reemplazos fueron no-ops y la puerta parecio no detectar nada. Se repitio con anclas de texto reales y la puerta devolvio las seis fallas esperadas: porcentaje, precio, dos variantes de primera persona, cifra en encabezado y enfasis fuerte. Vale registrarlo: una prueba en rojo mal armada da la misma senal que una puerta sin dientes.
- **`servicios.html` sin cambios de regresion.** Los cuatro `id` heredados de v1.0 siguen presentes y la home no perdio ningun destino.

## Known Stubs

Ninguno. Las tres paginas hermanas del silo (`estenosis-espinal`, `escoliosis`, `ortopedia-infantil`) y la expansion de los cuatro posts no son stubs de este plan: son el alcance declarado de 08-02, 08-03 y 08-04. El manifiesto de `check-content.mjs` ya las declara, asi que correr la puerta sin argumentos falla hasta que existan, que es el comportamiento buscado.

## Threat Flags

Ninguna superficie nueva de red, autenticacion, acceso a archivos ni cambio de esquema en limite de confianza. Las mitigaciones del registro se cumplieron:

| Amenaza | Estado |
|---------|--------|
| T-08-01 tampering en `JsonLdScript` | `dangerouslySetInnerHTML` sigue apareciendo una sola vez en todo `src/`, dentro del helper existente. Cero en las rutas y componentes nuevos. |
| T-08-02 divulgacion en la prosa firmada | Puerta ejecutable sobre cuerpo y sobre el archivo de datos. `AuthorByline` sin `children` ni credenciales por props. |
| T-08-03 spoofing de revision medica | El schema no emite `reviewedBy` ni `lastReviewed`, y el aviso educativo viaja pegado a la firma. |
| T-08-SC instalaciones de npm | Cero paquetes nuevos. Solo se agrego una entrada en `scripts`. |

## User Setup Required

Ninguna. La fase no necesita variables de entorno nuevas.

## Next Phase Readiness

**Listo para 08-02, 08-03 y 08-04.** La arquitectura quedo probada sobre un camino completo. Las tres paginas hermanas solo tienen que sumar su entrada a `servicePages`: la plantilla, el schema, el sitemap, la tarjeta del hub y la puerta ya las recogen sin tocar codigo. Los posts de 08-04 necesitan los cinco atributos de anclaje (`data-content-body`, `data-author-byline`, `data-medical-disclaimer`, `data-toc`, `data-mid-cta`) para que la puerta los pueda medir; el manifiesto ya los espera con su ruta de servicio asignada.

**Pendiente de decision del desarrollador, no de codigo:**

1. **Nada se subio a `main`.** Los tres commits estan solo en local, por instruccion explicita. El deploy no se disparo y la guia no esta en produccion.
2. **La revision del doctor sigue pendiente.** El contenido se publica bajo su firma por la decision registrada el 2026-08-10. Las salvaguardas estan puestas y verificadas, pero ninguna puerta juzga exactitud clinica.
3. **Verificacion manual pendiente (D3 y D7 del bloque de coverage):** recorrido de teclado por las siete anclas a 375px y lectura de la prosa. La puerta cubre el marcado, no lo que se ve ni lo que se afirma.

## Self-Check: PASSED

- Ocho archivos creados: los ocho existen en disco.
- Siete archivos modificados: los siete existen en disco.
- Tres commits declarados (`488b57c`, `0196d60`, `18b20b0`): los tres estan en `git log`.
- Cero guiones largos en el SUMMARY y cero en `src/content/service-pages.ts`.
- `npm run build` codigo 0, `npm run lint` codigo 0, `node scripts/check-content.mjs /servicios/hernia-discal` codigo 0.

---
*Phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo*
*Completed: 2026-08-10*
