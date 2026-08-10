---
phase: 09-p-ginas-por-sede-y-cobertura-local
plan: 02
subsystem: ui
tags: [local-seo, content-as-code, json-ld, schema-org, business-rule-gate, mutation-testing]

requires:
  - phase: 09-p-ginas-por-sede-y-cobertura-local
    plan: 01
    provides: la plantilla /sedes/[slug], getLocationPage, SedeJsonLd, el hub, el resaltado por ancla y scripts/check-sedes.mjs
provides:
  - Las cuatro sedes con URL propia bajo /sedes/
  - locationNode con la pagina de sede como url canonica y la web de la clinica en sameAs
  - Puerta con manifiesto de cuatro sedes y la regla del canal verificada en las dos direcciones
  - Sitemap en 21 URLs
affects: [09-03, fase 10 breadcrumbs titles y OG, fase 11 Google Business Profile]

tech-stack:
  added: []
  patterns:
    - "El title de una sede se escribe literal en el archivo de datos, no se compone en tiempo de render"
    - "La puerta cuenta las sedes declaradas en locations.ts y falla si el manifiesto no las cubre todas"

key-files:
  created: []
  modified:
    - src/content/location-pages.ts
    - src/components/structured-data.tsx
    - scripts/check-sedes.mjs
    - scripts/check-content.mjs

key-decisions:
  - "El consultorio privado rompe el patron de title de las clinicas a proposito: su consulta es de distrito, no de institucion"
  - "El texto de cada sede dice explicitamente quien saca la cita, no solo el bloque de aviso de la plantilla"
  - "gettingThere se limita a la avenida, la cuadra derivable de la numeracion, el distrito, el edificio y la referencia que ya trae locations.ts: cero tiempos de viaje, paraderos o estacionamientos"

patterns-established:
  - "La url del nodo de ubicacion apunta a la superficie que este dominio controla; el dominio de terceros vive en sameAs"
  - "Una sede nueva en locations.ts hace fallar la puerta hasta que alguien le escriba su pagina"

requirements-completed: [SEDE-01, SEDE-02, SEDE-03]

coverage:
  - id: D1
    description: "Las cuatro sedes tienen URL propia con direccion, dias, horarios y su canal de agenda"
    requirement: SEDE-01
    verification:
      - kind: integration
        ref: "npm run sedes:check sobre las cuatro rutas; los cuatro HTML prerenderizados existen"
        status: pass
    human_judgment: false
  - id: D2
    description: "El consultorio privado es la unica sede que ofrece el chat del doctor; las tres clinicas muestran su canal oficial"
    requirement: SEDE-01
    verification:
      - kind: integration
        ref: "comprobacion 3 bidireccional por region; contraste crudo: 3 ocurrencias de wa.me en consultorio-privado contra 2 en cada clinica, que es el piso del footer mas el boton flotante"
        status: pass
      - kind: integration
        ref: "dos pruebas de mutacion ejecutadas y revertidas: consultorio sin canal (falla y nombra consultorio-privado) y chat inyectado en Tezza (falla y nombra clinica-tezza)"
        status: pass
    human_judgment: true
    rationale: "La puerta prueba que el enlace no esta. Que el texto de cada pagina le deje claro al paciente quien saca la cita es lectura humana y queda para el punto 1 del checkpoint del plan 03"
  - id: D3
    description: "Cada pagina emite su JSON-LD de ubicacion con el @type que fija D-07, su address, su geo y su openingHoursSpecification"
    requirement: SEDE-03
    verification:
      - kind: integration
        ref: "el comando automated del plan imprime `schema por sede ok` sobre las cuatro rutas; comprobacion 10 de la puerta"
        status: pass
    human_judgment: false
  - id: D4
    description: "El nodo de cada sede apunta a su pagina de sede como url canonica y conserva la web oficial en sameAs"
    requirement: SEDE-03
    verification:
      - kind: integration
        ref: "url igual a https://drangulocolumna.com/sedes/{slug} en las cuatro; sameAs con la web de crp en Ricardo Palma; el consultorio no emite sameAs"
        status: pass
    human_judgment: false
  - id: D5
    description: "El grafo del doctor no se rompio al cambiar locationNode"
    verification:
      - kind: integration
        ref: "4 referencias al @id del Physician en agendar.html, el mismo numero que antes del cambio; hospitalAffiliation intacto"
        status: pass
    human_judgment: false
  - id: D6
    description: "El sitemap declara 21 URLs y la puerta de la fase 8 sigue en verde"
    verification:
      - kind: integration
        ref: "grep -o '<loc>' | wc -l devuelve 21; npm run content:check sin fallas en 8 rutas; mutacion del sitemap ejecutada y revertida"
        status: pass
    human_judgment: false
  - id: D7
    description: "La puerta detecta una sede de locations.ts que se quedo sin pagina"
    verification:
      - kind: integration
        ref: "comprobacion global que compara la cuenta de slug de locations.ts con el largo del MANIFEST"
        status: pass
    human_judgment: false

duration: 11min
completed: 2026-08-10
status: complete
---

# Phase 9 Plan 02: Las cuatro sedes publicadas Summary

**Las tres sedes que faltaban se publicaron sin tocar la plantilla ni la arquitectura, el nodo de cada sede pasa a declarar su propia pagina como url canonica con la web de la clinica en `sameAs`, y la puerta cierra la regla de negocio en las dos direcciones: el chat del doctor es obligatorio en el consultorio privado y esta prohibido en las tres clinicas.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-08-10T20:26:40Z
- **Completed:** 2026-08-10T20:37:35Z
- **Tasks:** 3 de 3
- **Files modified:** 4 archivos, 138 inserciones

## Accomplishments

- El trazador cumplio su promesa. Publicar tres sedes costo tres entradas en un archivo de datos y una linea de una constante. Ni la plantilla, ni el hub, ni el sitemap, ni el enlazado con `/agendar` necesitaron una sola edicion: las cuatro rutas, las cuatro tarjetas del hub y los cuatro enlaces de ida salieron de los recorridos que ya existian.
- La regla de negocio quedo verificada en las dos direcciones y no solo en una. Hasta este plan la puerta solo sabia prohibir; ahora tambien sabe exigir. Un consultorio privado que esconde el unico canal donde el doctor si agenda es tan defectuoso como una clinica que ofrece un canal que no puede reservar, y las dos mitades se probaron rompiendolas a proposito.
- El contraste crudo sobre el documento completo confirma la premisa de la que sale todo el diseño de la puerta: el consultorio privado trae 3 ocurrencias de `wa.me` y las tres clinicas traen exactamente 2 cada una, que es el piso del footer mas el boton flotante. La diferencia esta donde tiene que estar, en el cuerpo.
- El schema de ubicacion dejo de tener un campo `url` prestado. Antes apuntaba a la web de la clinica o, a falta de ella, a `/agendar` como sustituto. Ahora apunta a la superficie que este dominio controla, y la web del tercero pasa a `sameAs`, que es el campo que significa "la misma entidad en otro dominio".
- La puerta se blindo contra la quinta sede. Si manana vuelve Clinica Montefiori a `locations.ts`, `npm run sedes:check` falla hasta que alguien le escriba su pagina, en vez de aprobar en silencio una sede sin superficie propia.

## Task Commits

1. **Tarea 1: las tres entradas editoriales que faltaban** - `0d85b51` (feat)
2. **Tarea 2: el nodo de cada sede apunta a su pagina como url canonica** - `066a036` (feat)
3. **Tarea 3: la puerta cubre las cuatro sedes y el contraste de canal** - `9feba96` (feat)

## Files Created/Modified

**Modificados**

- `src/content/location-pages.ts` - Tres entradas nuevas: `consultorio-privado`, `sanna-la-molina` y `clinica-tezza`, en el mismo orden que `locations.ts`. Ni el tipo `LocationPage` ni `getLocationPage` cambiaron.
- `src/components/structured-data.tsx` - Solo `locationNode`: `url` pasa a `abs("/sedes/" + slug)` y la web oficial se mueve a `sameAs`. `physicianNode` no se toco.
- `scripts/check-sedes.mjs` - `MANIFEST` de una a cuatro entradas, mas dos comprobaciones globales: cobertura del manifiesto contra `locations.ts` y cuenta exacta del sitemap.
- `scripts/check-content.mjs` - `SITEMAP_TOTAL` de 18 a 21. Ultima vez que esa constante cambia en la fase.

## Decisions Made

- **El consultorio privado rompe el patron de title a proposito.** Las tres clinicas llevan "Traumatologo y cirujano de columna en" mas el nombre textual de la sede, porque el nombre de la clinica es lo que un paciente escribe en el buscador. "Consultorio privado del Dr. Angulo" no lo es: esa consulta es de distrito. Por eso su title nombra Surco y Lima, y su `h1` conserva el nombre del consultorio para que el paciente reconozca donde llego.
- **La distincion de canal se escribio en el texto, no solo en el bloque de aviso.** Los `heroLead` de las tres clinicas dicen con todas las letras que la agenda la maneja la institucion y que la cita no se saca con el consultorio del doctor. El bloque de la plantilla lo repite mas abajo, pero el paciente que solo lee el primer parrafo ya sale con la respuesta.
- **`gettingThere` se limito a lo sostenible.** Cada sede describe la avenida, la cuadra que se deriva de su propia numeracion, el distrito y, cuando existen, el edificio y la referencia que ya trae `locations.ts`. Cero tiempos de viaje, cero paraderos, cero indicaciones de estacionamiento. Un dato de "como llegar" que resulta falso hace mas daño que no tenerlo.
- **La latitud y la longitud del manifiesto valen mas que un `typeof number`.** El plan 01 solo pedia que la geo fuera numerica; el manifiesto declara los valores exactos por sede. Una coordenada que se corrompe en una edicion futura sigue siendo un numero, y sin la comparacion literal la puerta la dejaria pasar.

## Deviations from Plan

Ninguna. El plan se ejecuto tal como estaba escrito.

La unica friccion prevista, que la comprobacion del `<title>` de la puerta habria chocado con el title del consultorio privado, ya se habia resuelto en el plan 01 al declarar `h1` y `title` como campos separados del manifiesto. Esta documentada como desviacion en `09-01-SUMMARY.md`.

## Threat Flags

Ninguna superficie de seguridad nueva. `T-09-06` verificado: los tres dominios de `sameAs` y `hasMap` salen de `locations.ts` y pasan por el unico `JsonLdScript` del repositorio, que sigue siendo el unico `dangerouslySetInnerHTML`. `T-09-07` verificado: los `href` de `tel:` se toman literales de los datos y la puerta compara los literales exactos por sede. `T-09-SC` verificado: la cuenta de dependencias sigue en 17.

## Self-Check: PASSED

Los cuatro HTML de sede verificados en `.next/server/app/sedes/`: `consultorio-privado.html`, `clinica-ricardo-palma.html`, `sanna-la-molina.html`, `clinica-tezza.html`.

Commits verificados en `git log`: `0d85b51`, `066a036`, `9feba96`.
