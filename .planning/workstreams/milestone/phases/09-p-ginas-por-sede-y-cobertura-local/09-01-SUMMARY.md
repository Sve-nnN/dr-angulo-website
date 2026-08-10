---
phase: 09-p-ginas-por-sede-y-cobertura-local
plan: 01
subsystem: ui
tags: [next-app-router, dynamic-routes, generate-static-params, json-ld, schema-org, local-seo, tailwind, accessibility, business-rule-gate]

requires:
  - phase: 06 de v1.0
    provides: src/content/locations.ts como fuente de verdad de NAP con las cuatro sedes, sus canales y la regla de negocio del WhatsApp
  - phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
    provides: el patron de ruta dinamica de /servicios/[slug], ServiceCard con enlace extendido, scripts/check-content.mjs y las reglas COLOR-01 y A11Y del 08-UI-SPEC.md
  - phase: 07
    provides: structured-data.tsx con ID, abs, JsonLdScript, postalAddress, openingHours y locationNode
provides:
  - Ruta dinamica /sedes/[slug] alimentada por la capa editorial, con generateStaticParams sobre locationPages
  - /sedes/clinica-ricardo-palma publicada, con direccion, como llegar, horarios y el canal oficial de la clinica
  - Hub /sedes con SedeCard, tarjeta navegacional de enlace extendido
  - SedeJsonLd, que reusa locationNode y conserva el @id del grafo raiz
  - Resaltado por ancla en CSS plano sobre data-location-card, sin JavaScript de cliente
  - scripts/check-sedes.mjs como contrato ejecutable de la regla del canal de agenda
affects: [09-02, 09-03, fase 10 breadcrumbs titles y OG, fase 11 Google Business Profile]

tech-stack:
  added: []
  patterns:
    - "Capa editorial separada de la fuente de NAP: location-pages.ts nunca copia direccion, geo, telefono ni canales"
    - "generateStaticParams sobre la capa editorial, no sobre los datos: una sede sin texto no genera ruta"
    - "Puerta de regla de negocio medida por region recortada, no a documento completo"
    - "Resaltado por ancla con :target en CSS plano, no con la variante target: de Tailwind"

key-files:
  created:
    - src/content/location-pages.ts
    - src/app/sedes/[slug]/page.tsx
    - src/app/sedes/page.tsx
    - src/components/locations/sede-card.tsx
    - scripts/check-sedes.mjs
  modified:
    - src/components/structured-data.tsx
    - src/app/sitemap.ts
    - src/app/agendar/page.tsx
    - src/components/locations/location-card.tsx
    - src/app/globals.css
    - scripts/check-content.mjs
    - package.json

key-decisions:
  - "El manifiesto de la puerta declara el title esperado ademas del h1, porque en el plan 02 el consultorio privado tiene un title distinto de su h1 y la comprobacion original habria fallado"
  - "La plantilla resuelve desde el plan 01 las dos ramas, consultorio y clinica, aunque este plan solo publique una clinica: el plan 02 no vuelve a tocar la plantilla"
  - "La latitud y la longitud esperadas entran al manifiesto desde el plan 01, no desde el 02: son expectativas hardcodeadas y agregarlas antes no cuesta nada"
  - "El aviso de quien gestiona la agenda va en un bloque propio con bg-muted, no como parrafo suelto: es la pieza que resuelve la confusion mas frecuente de los pacientes"

patterns-established:
  - "getLocationPage hace el join entre texto y NAP en un solo lugar y devuelve undefined si falta cualquiera de los dos"
  - "SedeJsonLd emite el nodo de la sede con la misma locationNode que el grafo raiz, asi la pagina y el grafo no pueden divergir"
  - "check-sedes.mjs recorta con data-sede-body antes de contar canales, porque el footer y el boton flotante emiten wa.me en las 23 rutas"
  - "La puerta se probo en rojo con una mutacion deliberada y se revirtio dentro de la misma tarea"

requirements-completed: [SEDE-01, SEDE-02, SEDE-03]

coverage:
  - id: D1
    description: "/sedes/clinica-ricardo-palma se prerenderiza estatica con direccion, como llegar, dias, horarios y el canal oficial de la clinica"
    requirement: SEDE-01
    verification:
      - kind: integration
        ref: "npm run sedes:check (comprobaciones 1, 4 y 9 sobre la region recortada)"
        status: pass
    human_judgment: false
  - id: D2
    description: "El nombre Clinica Ricardo Palma aparece en title, en el unico h1 y en el cuerpo"
    requirement: SEDE-02
    verification:
      - kind: integration
        ref: "npm run sedes:check (comprobaciones 5 y 7, texto exacto contra el manifiesto)"
        status: pass
    human_judgment: false
  - id: D3
    description: "El cuerpo de la pagina de clinica no ofrece ningun camino hacia el chat del doctor"
    requirement: SEDE-01
    verification:
      - kind: integration
        ref: "npm run sedes:check (comprobacion 3, cero ocurrencias de wa.me dentro de data-sede-body)"
        status: pass
      - kind: integration
        ref: "prueba de mutacion: con un enlace al chat inyectado en el cuerpo, la puerta sale en 1 y nombra clinica-ricardo-palma"
        status: pass
    human_judgment: true
    rationale: "La puerta prueba que el canal no esta enlazado. Que el texto le deje claro al paciente quien saca la cita es lectura humana, y queda para el checkpoint del plan 03"
  - id: D4
    description: "La ruta emite su propio JSON-LD de ubicacion con address, geo y openingHoursSpecification, y el @id coincide con el del grafo raiz"
    requirement: SEDE-03
    verification:
      - kind: integration
        ref: "npm run sedes:check (comprobacion 10) y el comando automated del plan, que imprime sede-jsonld ok"
        status: pass
    human_judgment: false
  - id: D5
    description: "/agendar enlaza al hub y a la pagina de sede, y la pagina de sede vuelve a /agendar con su ancla"
    requirement: SEDE-03
    verification:
      - kind: integration
        ref: "npm run sedes:check (comprobacion 11 y comprobaciones globales sobre agendar.html y sedes.html)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Al llegar por el ancla la tarjeta de esa sede queda resaltada y con el foco, sin JavaScript de cliente"
    requirement: SEDE-03
    verification:
      - kind: integration
        ref: "la regla [data-location-card]:target sobrevive al compilador de Tailwind y aparece literal en .next/static/chunks/*.css; agendar.html trae 4 tarjetas con el atributo y tabindex=-1"
        status: pass
    human_judgment: true
    rationale: "Que el resaltado se vea, se entienda y no quede tapado por el header sticky solo se confirma en el navegador; queda para el punto 2 del checkpoint del plan 03"
  - id: D7
    description: "El sitemap declara /sedes y /sedes/clinica-ricardo-palma, y la puerta de la fase 8 sigue en verde sin ganar rutas de sede"
    verification:
      - kind: integration
        ref: "grep -o '<loc>' .next/server/app/sitemap.xml.body | wc -l (18); npm run content:check sin fallas en 8 rutas; grep sobre codigo no comentado de check-content.mjs devuelve 0 ocurrencias de /sedes"
        status: pass
    human_judgment: false
  - id: D8
    description: "npm run sedes:check existe, pasa y falla de verdad cuando la regla de negocio se viola"
    verification:
      - kind: integration
        ref: "prueba de mutacion ejecutada y revertida dentro de la tarea 3; despues de revertir, la puerta vuelve a 0"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-08-10
status: complete
---

# Phase 9 Plan 01: Trazador de las paginas por sede Summary

**`/sedes/clinica-ricardo-palma` queda viva de punta a punta con direccion, referencias del barrio, horarios, el canal oficial de la clinica y su propio JSON-LD de ubicacion, mas el hub `/sedes`, el enlazado en ambos sentidos con `/agendar` y una puerta ejecutable que hace fallar el proceso si una pagina de clinica ofreciera el chat del doctor.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-08-10T20:01:00Z
- **Completed:** 2026-08-10T20:26:35Z
- **Tasks:** 3 de 3
- **Files modified:** 12 archivos, 1103 inserciones

## Accomplishments

- La arquitectura completa quedo probada sobre un solo camino antes de expandir. El reparto entre `locations.ts` y la capa editorial, el tipo de schema, el resaltado por ancla y la puerta de la regla de negocio se validaron con una sola sede publicada, que es exactamente lo que el trazador tenia que responder.
- La regla de negocio dejo de ser prosa en un comentario y paso a ser codigo que falla el proceso. `scripts/check-sedes.mjs` recorta la region del cuerpo con `data-sede-body` y cuenta los enlaces al chat del doctor dentro de ese limite. La medicion por region no es un detalle: el footer y el boton flotante emiten `wa.me` en las 23 rutas del sitio, asi que una cuenta a documento completo daria un piso de dos y la puerta no significaria nada.
- La puerta se probo en rojo. Con un enlace al chat inyectado en el cuerpo de Ricardo Palma, `npm run sedes:check` sale en 1 y el mensaje nombra la sede y explica la consecuencia. La mutacion se revirtio en la misma tarea y la puerta volvio a verde.
- El schema de ubicacion se corrigio de paso. Las tres clinicas emitian `Hospital`, que schema.org reserva para instituciones con internamiento, y el consultorio propio emitia `MedicalClinic`. Ahora son `MedicalClinic` y `MedicalBusiness`, y como el cambio vive en la unica funcion que produce marcado de ubicacion, llega a la vez al grafo raiz y a la pagina de la sede.
- El resaltado por ancla funciona sin una linea de JavaScript de cliente y se verifico contra el CSS compilado, no contra el archivo fuente: la regla `[data-location-card]:target` aparece literal en el bundle, que era la duda razonable despues del precedente del acordeon.

## Task Commits

1. **Tarea 1: /sedes/clinica-ricardo-palma viva de punta a punta** - `371df87` (feat)
2. **Tarea 2: hub /sedes y enlazado en ambos sentidos con /agendar** - `c665cf2` (feat)
3. **Tarea 3: puerta automatica de las paginas de sede** - `ab521bc` (feat)

## Files Created/Modified

**Creados**

- `src/content/location-pages.ts` - Capa editorial. Tipo `LocationPage`, `locationPages` con la entrada de Ricardo Palma y `getLocationPage`, que hace el join con `locations.ts` en un solo lugar.
- `src/app/sedes/[slug]/page.tsx` - Plantilla unica. Resuelve las dos ramas, consultorio y clinica, desde el primer plan.
- `src/app/sedes/page.tsx` - Hub indice, servidor puro, con la grilla de tarjetas y el enlace de cierre hacia `/agendar`.
- `src/components/locations/sede-card.tsx` - Tarjeta navegacional con enlace extendido, un solo control, distrito y dias como texto plano.
- `scripts/check-sedes.mjs` - Puerta de las paginas de sede. Sin dependencias, corre sobre `.next/server/app/`.

**Modificados**

- `src/components/structured-data.tsx` - `locationNode` cambia el mapeo de tipos y suma un comentario que explica de donde sale; nuevo export `SedeJsonLd`. Sigue habiendo un solo `dangerouslySetInnerHTML` en el repositorio.
- `src/app/sitemap.ts` - `locationRoutes` derivado de `locationPages` mas la entrada del hub.
- `src/app/agendar/page.tsx` - Enlace al hub y `pageHref` por tarjeta, resuelto con `getLocationPage` para no apuntar a rutas inexistentes.
- `src/components/locations/location-card.tsx` - `id`, `tabIndex={-1}`, `scroll-mt-28`, `data-location-card` y la prop opcional `pageHref`.
- `src/app/globals.css` - Regla `[data-location-card]:target` en CSS plano, con el motivo documentado.
- `scripts/check-content.mjs` - `SITEMAP_TOTAL` de 16 a 18. Es la unica linea que cambia y ninguna ruta de sede entra al `MANIFEST`.
- `package.json` - Script `sedes:check`. Ni `dependencies` ni `devDependencies` cambiaron: siguen siendo 17.

## Decisions Made

- **La plantilla resuelve las dos ramas desde el plan 01.** El plan 02 no lista `src/app/sedes/[slug]/page.tsx` entre sus archivos, asi que la rama del consultorio privado tenia que existir antes de que llegara su entrada editorial. La rama de consultorio emite `WhatsAppCta` con la clave `booking_page` que ya existia; no se agrego ninguna clave a `whatsappMessages`.
- **El manifiesto de la puerta declara el `title` ademas del `h1`.** El plan 01 pedia verificar que el `<title>` empieza con el `h1` esperado, pero el plan 02 fija para el consultorio privado un title distinto de su h1, con lo cual esa comprobacion habria fallado en la ola siguiente. Declarar los dos por separado es mas estricto y no relitiga nada: los dos siguen hardcodeados en el manifiesto.
- **La direccion va en un `<address>` con `not-italic`.** Es el elemento semantico correcto para el NAP de la pagina y el estilo se neutraliza para no romper la tipografia del sitio.
- **Los iconos de la plantilla usan `text-primary-dark`.** No es solo COLOR-01: el criterio de aceptacion del plan mide que el token claro solo aparezca en lineas de encabezado, y un icono decorativo con el token claro habria hecho fallar esa medicion sin ningun beneficio visual.
- **El hub no repite los canales de agenda.** Es un mapa de sedes, no un flujo de conversion. Repetir los canales lo habria puesto a competir con `/agendar`, que es justo la separacion que la fase quiere evitar.

## Deviations from Plan

### Auto-fixed Issues

**1. [Regla 3 - Bloqueo] La comprobacion 7 de la puerta, escrita como "el title empieza con el h1", habria fallado en el plan 02**

- **Found during:** Tarea 3
- **Issue:** El plan 01 especifica que la puerta verifique que el `<title>` empieza con el `h1` esperado. En Ricardo Palma title y h1 son el mismo texto, asi que la comprobacion pasa. Pero el plan 02 fija para `consultorio-privado` el title "Consultorio de traumatologia y columna en Surco, Lima" y el h1 "Consultorio privado del Dr. Angulo en Surco", que son textos distintos a proposito, y la comprobacion habria hecho fallar la puerta sin que hubiera nada roto.
- **Fix:** El manifiesto declara `h1` y `title` como campos separados, los dos hardcodeados. La comprobacion 5 verifica el h1 caracter por caracter y la 7 verifica que el `<title>` del documento sea exactamente `title` mas el sufijo del layout. Es mas estricto que lo pedido y no depende de que los dos textos coincidan.
- **Files modified:** `scripts/check-sedes.mjs`
- **Verification:** `npm run sedes:check` en verde en el plan 01 y, tras el plan 02, en verde tambien con el consultorio privado en el manifiesto.
- **Committed in:** `ab521bc`

**2. [Regla 2 - Funcionalidad critica] La plantilla resuelve la rama del consultorio privado antes de que exista su entrada editorial**

- **Found during:** Tarea 1
- **Issue:** El plan 02 no incluye la plantilla entre sus archivos modificados, pero es el plan que publica el consultorio privado. Sin la rama de `kind === "consultorio"` escrita en el plan 01, el consultorio se habria renderizado con el bloque de canales de una clinica y sin el chat del doctor, que es justo la mitad de la regla de negocio que la puerta verifica en el otro sentido.
- **Fix:** La plantilla resuelve las dos ramas desde el plan 01. La del consultorio no se ejercita hasta el plan 02, pero existe y esta escrita.
- **Files modified:** `src/app/sedes/[slug]/page.tsx`
- **Verification:** En el plan 02, `/sedes/consultorio-privado` prerenderiza con el chat del doctor en el cuerpo sin tocar la plantilla.
- **Committed in:** `371df87`

### Observacion sobre los criterios escritos con `grep -c`

Varios criterios de aceptacion de esta fase cuentan ocurrencias con `grep -c` sobre el HTML prerenderizado. Next emite cada pagina como una sola linea, y `grep -c` cuenta lineas, no ocurrencias: sobre esos archivos siempre devuelve 1. Las verificaciones de este plan se corrieron con `grep -o ... | wc -l`, que es lo que el criterio queria decir. Con la cuenta correcta, `/sedes/clinica-ricardo-palma` trae 2 ocurrencias de `wa.me` en el documento completo, que es exactamente el piso del footer mas el boton flotante, y 0 dentro de la region medida.

## Threat Flags

Ninguna superficie de seguridad nueva fuera del registro STRIDE del plan. `T-09-01` verificado: `dangerouslySetInnerHTML` sigue apareciendo una sola vez en `structured-data.tsx`. `T-09-02` verificado: los destinos externos de la plantilla llevan `target="_blank" rel="noopener noreferrer"` y aviso `sr-only`, y los `tel:` no abren pestaña. `T-09-SC` verificado: la cuenta de dependencias sigue en 17.

## Self-Check: PASSED

Archivos creados verificados en disco: `src/content/location-pages.ts`, `src/app/sedes/[slug]/page.tsx`, `src/app/sedes/page.tsx`, `src/components/locations/sede-card.tsx`, `scripts/check-sedes.mjs`.

Commits verificados en `git log`: `371df87`, `c665cf2`, `ab521bc`.
