---
phase: 09-p-ginas-por-sede-y-cobertura-local
plan: 03
subsystem: ui
tags: [navigation, header, local-seo, human-verification, accessibility]

requires:
  - phase: 09-p-ginas-por-sede-y-cobertura-local
    plan: 01
    provides: la plantilla /sedes/[slug], el hub /sedes, SedeJsonLd, el resaltado por ancla y scripts/check-sedes.mjs
  - phase: 09-p-ginas-por-sede-y-cobertura-local
    plan: 02
    provides: las cuatro entradas editoriales, locationNode con la pagina de sede como url canonica y el manifiesto de cuatro sedes
provides:
  - La entrada Sedes del header apuntando al hub, en escritorio y en movil
  - Submenu movil con las cuatro paginas de sede, derivado de locationPages
  - La fase verificada de punta a punta por un humano en el navegador
affects: [fase 10 breadcrumbs titles y OG, fase 11 Google Business Profile]

tech-stack:
  added: []
  patterns:
    - "Los destinos del submenu se derivan del mismo array que genera las rutas; no se escriben href a mano"
    - "El submenu movil se renderiza por recortes de NAV_LINKS, no con condicionales dentro del map"

key-files:
  created: []
  modified:
    - src/components/layout/header.tsx

key-decisions:
  - "Escritorio sin megamenu de sedes: el hub cumple ese papel con cuatro tarjetas y un segundo megamenu duplicaria su trabajo con un componente de cliente de mas"
  - "El label Sedes y el longLabel Sedes y horarios se conservan: ya describian el destino correcto, solo que el destino no existia"
  - "/agendar no queda huerfano en el header: sigue a un clic por el BookingCta de la barra de escritorio y del pie del menu movil"

patterns-established:
  - "El header no introduce estado nuevo: el submenu es estatico dentro del menu que ya se abre y se cierra"

requirements-completed: [SEDE-01, SEDE-02, SEDE-03]

coverage:
  - id: D1
    description: "El enlace Sedes del header lleva al hub /sedes y no a /agendar, en escritorio y en movil"
    requirement: SEDE-03
    verification:
      - kind: integration
        ref: "NAV_LINKS no contiene href /agendar; contacto.html trae href=\"/sedes\""
        status: pass
    human_judgment: false
  - id: D2
    description: "En el menu movil, debajo de Sedes cuelgan las cuatro paginas de sede"
    requirement: SEDE-03
    verification:
      - kind: integration
        ref: "las cuatro rutas /sedes/{slug} aparecen en el HTML del header de cualquier pagina"
        status: pass
    human_judgment: false
  - id: D3
    description: "Agendar cita sigue alcanzable desde el header en un clic"
    verification:
      - kind: integration
        ref: "contacto.html trae href=\"/agendar\", aportado por BookingCta; el megamenu de servicios no se toco"
        status: pass
    human_judgment: false
  - id: D4
    description: "Un humano confirma en el navegador la regla del canal de agenda en las cuatro sedes, el recorrido de ancla con y sin JavaScript, el foco de teclado, los cinco anchos y la coherencia visual con la fase 8"
    requirement: SEDE-01
    verification:
      - kind: other
        ref: "checkpoint humano del plan 03, ocho puntos, aprobado por Juan el 2026-08-10"
        status: pass
    human_judgment: true
    rationale: "Como se ve, como se siente el recorrido y si el texto deja clara la responsabilidad de la agenda son juicios que ninguna puerta automatica puede firmar"
  - id: D5
    description: "El JSON-LD de al menos dos paginas de sede se parseo sin errores en el Rich Results Test"
    requirement: SEDE-03
    verification:
      - kind: other
        ref: "punto 7 del checkpoint humano, contra el HTML local de /sedes/clinica-ricardo-palma y /sedes/consultorio-privado"
        status: pass
    human_judgment: true
    rationale: "La validacion contra la URL desplegada se repite despues del despliegue; ver Verificaciones diferidas"
  - id: D6
    description: "Las cinco comprobaciones automaticas del repositorio terminan en 0 y el sitemap declara 21 URLs"
    verification:
      - kind: integration
        ref: "npx tsc --noEmit, npm run lint, npm run build, npm run content:check, npm run sedes:check, todas en 0; 21 ocurrencias de <loc>"
        status: pass
    human_judgment: false
  - id: D7
    description: "La verificacion de la SERP queda registrada como pendiente al despliegue, no como cumplida"
    verification:
      - kind: other
        ref: "seccion Verificaciones diferidas al despliegue de este documento"
        status: deferred
    human_judgment: true
    rationale: "Requiere que Google haya rastreado e indexado la URL, lo que ocurre dias despues del despliegue"

duration: 6min
completed: 2026-08-10
status: complete
---

# Phase 9 Plan 03: Navegacion y verificacion de la fase Summary

**La entrada "Sedes" del header pasa a apuntar al hub y despliega las cuatro paginas de sede en el menu movil, y la fase queda verificada de punta a punta: las cinco puertas automaticas en 0, el sitemap en 21 URLs y el checkpoint humano de ocho puntos aprobado por Juan el 2026-08-10.**

## Performance

- **Duration:** 6 min de ejecucion, mas la verificacion humana
- **Started:** 2026-08-10T20:37:40Z
- **Completed:** 2026-08-10T20:40:29Z (tarea 1); checkpoint aprobado el 2026-08-10
- **Tasks:** 2 de 2 (una de codigo, una de verificacion humana)
- **Files modified:** 1 archivo, 35 inserciones

## Accomplishments

- La fase cerro por donde entra el trafico. Hasta ahora "Sedes" del header llevaba a `/agendar`, que es un flujo de conversion y no un mapa de sedes. Ahora lleva al hub, y las dos intenciones tienen cada una su superficie: donde atiende el doctor contra quiero una cita.
- El menu movil despliega las cuatro sedes debajo de "Sedes", derivadas de `locationPages`, que es el mismo array que genera las rutas. Ningun `href` se escribe a mano, asi que una sede nueva aparece en la navegacion sin tocar el header.
- El header no gano estado ni componentes de cliente nuevos. La cuenta de hooks del archivo es la misma que antes del cambio y el megamenu de escritorio no se toco.
- Un humano firmo lo que ninguna puerta puede firmar. Juan reviso los ocho puntos del checkpoint en el navegador y los aprobo: la regla del canal de agenda en las cuatro sedes, el recorrido de ancla con y sin JavaScript, la navegacion en escritorio y en movil, el foco de teclado, los cinco anchos, la coherencia visual con la fase 8, el Rich Results Test sobre dos paginas y la lectura completa del contenido.

## Task Commits

1. **Tarea 1: el header lleva al hub de sedes** - `cd2f357` (feat)
2. **Tarea 2: verificacion humana de la fase completa** - checkpoint aprobado por Juan el 2026-08-10, sin commit de codigo

## Files Created/Modified

**Modificados**

- `src/components/layout/header.tsx` - `NAV_LINKS[2].href` pasa de `/agendar` a `/sedes` y el comentario de cabecera lo explica. El bloque de navegacion movil renderiza `NAV_LINKS.slice(2, 3)`, la lista anidada de `locationPages` con `block min-h-11` como area tactil, y despues `NAV_LINKS.slice(3)`. Sin clases de color nuevas y sin estado nuevo.

## Verificacion humana

**Aprobado por Juan el 2026-08-10.** Los ocho puntos del checkpoint pasan:

1. Regla de negocio en las cuatro paginas de sede, incluida la claridad del texto sobre quien saca la cita.
2. Recorrido de ancla desde cada pagina de sede hacia `/agendar`, con la tarjeta correcta resaltada y no tapada por el header, tambien con JavaScript desactivado.
3. Navegacion: "Sedes" al hub en escritorio y en movil, con las cuatro sedes desplegadas, y "Agendar cita" a un clic desde los dos menus.
4. Teclado y foco: anillo visible sobre la tarjeta entera en el hub, y el foco queda en la tarjeta de destino al llegar por el ancla.
5. Anchos: 320px, 375px, 768px y 1440px sin scroll horizontal.
6. Lenguaje visual coherente con `/servicios/hernia-discal`, sin barras de acento al borde izquierdo y con el dorado solo como superficie de boton.
7. Rich Results Test sobre `/sedes/clinica-ricardo-palma` y `/sedes/consultorio-privado`, sin errores.
8. Lectura de las cuatro paginas, sin datos de "como llegar" insostenibles, sin cifras de cirugias o resultados, sin credenciales fuera del CV y sin primera persona sobre casos concretos.

Verificacion independiente previa, corrida antes de pasarle el checkpoint a Juan:

- Regla del WhatsApp por region: `consultorio-privado` con 1 `wa.me` dentro de `data-sede-body`; `clinica-ricardo-palma`, `sanna-la-molina` y `clinica-tezza` con 0. A nivel de documento completo, 3 contra 2, siendo 2 el piso del footer mas el boton flotante.
- Sitemap en 21 URLs.
- Title y `h1` de Ricardo Palma nombran la clinica, tal como pedia el criterio 2 del roadmap.
- Los tipos de schema aparecen en todas las rutas porque el grafo raiz del layout emite las cuatro sedes. El nodo propio de cada pagina reusa `locationNode` con el mismo `@id`, asi que la pagina y el grafo raiz no pueden divergir.

## Evidencia de las pruebas de mutacion de la regla de negocio

Tres mutaciones deliberadas, cada una corrida contra un build real y revertida en la misma tarea. Sin ellas la puerta estaria escrita pero no verificada.

| # | Mutacion | Plan y tarea | Resultado | Mensaje |
|---|----------|--------------|-----------|---------|
| 1 | Enlace al chat del doctor inyectado dentro del cuerpo de `/sedes/clinica-ricardo-palma` | 09-01 T3 | `npm run sedes:check` sale en 1 | nombra `clinica-ricardo-palma` y explica que ese canal manda al paciente a reservar donde no se puede reservar |
| 2 | Canal del chat retirado del cuerpo de `/sedes/consultorio-privado` | 09-02 T3 | `npm run sedes:check` sale en 1 | nombra `consultorio-privado` y explica que sin ese canal el paciente se queda sin la unica via por la que si puede reservar |
| 3 | Enlace al chat del doctor inyectado dentro del cuerpo de `/sedes/clinica-tezza` | 09-02 T3 | `npm run sedes:check` sale en 1 | nombra `clinica-tezza` |

Despues de revertir las tres, `npm run build && npm run sedes:check` vuelve a 0 sobre las cuatro sedes. Se corrio ademas una cuarta mutacion, fuera de la regla de negocio, bajando una entrada del sitemap: la puerta reporta "el sitemap tiene 20 URLs, deben ser 21" y sale en 1; tambien revertida.

## La puerta de contenido de la fase 8

`SITEMAP_TOTAL` de `scripts/check-content.mjs` subio de 16 a 21 a lo largo de la fase, en tres escalones (16 a 17, 17 a 18, 18 a 21), uno por cada tarea que agrego rutas, para que ningun commit intermedio quedara en rojo.

**Esa constante es la unica linea que la fase 9 cambio de ese archivo.** Ninguna ruta de `/sedes` entro a su `MANIFEST`: la puerta de 900 palabras es para guias clinicas y no aplica a paginas de intencion local, que se resuelven con extension media por decision de `09-CONTEXT.md` (D-05). Las paginas de sede tienen su propia puerta, `scripts/check-sedes.mjs`, que mide criterios distintos. Verificado sobre codigo y no sobre comentarios: `grep -vE '^\s*(//|/\*|\*)' scripts/check-content.mjs | grep -c '/sedes'` devuelve 0.

## Verificaciones diferidas al despliegue

Dos criterios del roadmap **no** se dan por cumplidos y quedan pendientes de forma explicita.

- **Criterio 2 (SEDE-02), la consulta `site:`.** Que `site:drangulocolumna.com ricardo palma` devuelva `/sedes/clinica-ricardo-palma` y no `/servicios` ni `/agendar` requiere que Google haya rastreado e indexado la URL, lo que ocurre dias despues del despliegue. **Pendiente.** Lo que si esta garantizado y verificado es la condicion necesaria: existe una URL propia cuyo `title`, `h1` y cuerpo nombran la clinica, y esta declarada en el sitemap. Si la consulta falla despues de indexar, es trabajo de la fase 10 o de la 11, no una regresion de esta.
- **Criterio 3 (SEDE-03), la parte de validez en el Rich Results Test contra produccion.** El punto 7 del checkpoint se corrio contra el HTML local y paso. **Pendiente** repetirlo contra la URL desplegada.

## Decisions Made

- **Escritorio sin megamenu de sedes.** El hub `/sedes` ya cumple ese papel con cuatro tarjetas. Un segundo megamenu duplicaria el trabajo del hub y agregaria un componente de cliente sin necesidad. En escritorio "Sedes" queda como enlace plano.
- **El submenu se renderiza por recortes y no con condicionales dentro del `map`.** Es el estilo que el archivo ya tenia para Servicios, y meter una rama dentro del `map` habria mezclado dos formas distintas de resolver lo mismo en el mismo bloque.
- **No se agregaron clases de color nuevas.** El submenu de sedes reusa exactamente las del submenu de Servicios, que ya cumplen COLOR-01.

## Deviations from Plan

Este plan no tuvo desviaciones propias. Las tres de la fase, todas detectadas y resueltas en los planes 01 y 02, se registran acá completas por ser el documento de cierre.

**1. [Regla 3 - Bloqueo] El criterio del `<title>` de la puerta se separo del `h1`**

- **Detectada en:** 09-01, tarea 3
- **Que decia el plan:** la comprobacion 7 de `scripts/check-sedes.mjs` debia verificar que el `<title>` del documento empieza con el `h1` esperado.
- **Por que no servia:** en Ricardo Palma `title` y `h1` son el mismo texto, asi que la comprobacion pasaba. Pero el plan 02 fija para `consultorio-privado` el title "Consultorio de traumatologia y columna en Surco, Lima" y el `h1` "Consultorio privado del Dr. Angulo en Surco", que son distintos a proposito: el nombre del consultorio no es lo que un paciente escribe en el buscador, su consulta es de distrito. La comprobacion habria hecho fallar la puerta en la ola siguiente sin que hubiera nada roto.
- **Que se hizo:** el manifiesto declara `h1` y `title` como campos separados, los dos hardcodeados. La comprobacion 5 verifica el `h1` caracter por caracter y la 7 verifica que el `<title>` sea exactamente `title` mas el sufijo del layout. Es mas estricto que lo pedido y no deriva nada del archivo que verifica.
- **Files modified:** `scripts/check-sedes.mjs`
- **Committed in:** `ab521bc`

**2. [Regla 2 - Funcionalidad critica] La rama del consultorio privado se resolvio en la plantilla del plan 01**

- **Detectada en:** 09-01, tarea 1
- **Que decia el plan:** el plan 02 publica el consultorio privado, pero no lista `src/app/sedes/[slug]/page.tsx` entre sus archivos modificados.
- **Por que no servia:** sin la rama de `kind === "consultorio"` escrita desde el plan 01, el consultorio se habria renderizado con el bloque de canales de una clinica y sin el chat del doctor. Esa es justo la mitad de la regla de negocio que la puerta exige en el otro sentido: un consultorio privado que esconde el unico canal donde el doctor si agenda es tan defectuoso como una clinica que ofrece uno que no puede reservar.
- **Que se hizo:** la plantilla resuelve las dos ramas desde el plan 01, usando la clave existente `booking_page` de `whatsappMessages`. No se agrego ninguna clave nueva. La rama no se ejercita hasta el plan 02, pero existe y esta escrita.
- **Files modified:** `src/app/sedes/[slug]/page.tsx`
- **Committed in:** `371df87`

**3. [Regla 1 - Bug de verificacion] Los criterios escritos con `grep -c` sobre el HTML no miden lo que dicen**

- **Detectada en:** 09-01, tarea 1
- **Que decia el plan:** varios criterios de aceptacion cuentan ocurrencias con `grep -c` sobre el HTML prerenderizado; el mas critico es el contraste del plan 02, `test "$(grep -c 'wa\.me' consultorio-privado.html)" -gt "$(grep -c 'wa\.me' clinica-ricardo-palma.html)"`.
- **Por que no servia:** Next emite cada pagina como una sola linea y `grep -c` cuenta lineas, no ocurrencias. Sobre esos archivos siempre devuelve 1, asi que el contraste habria comparado 1 contra 1 y habria fallado aunque el codigo estuviera bien.
- **Que se hizo:** todas esas verificaciones se corrieron con `grep -o ... | wc -l`, que es lo que el criterio queria decir. Con la cuenta correcta el contraste es 3 contra 2, y la puerta no depende de ninguna de estas cuentas: mide por region recortada dentro de `scripts/check-sedes.mjs`, con `occurrences()` sobre el texto.
- **Files modified:** ninguno; es una correccion de como se ejecutan las verificaciones, no del codigo.

## Threat Flags

Ninguna superficie de seguridad nueva. `T-09-09` verificado: los destinos del submenu se derivan de `locationPages`, el mismo array que genera las rutas, y las cuatro aparecen en el HTML del header de cualquier pagina. `T-09-10` verificado: la cuenta de hooks de `header.tsx` es la misma que antes del cambio, el submenu no lee ni escribe almacenamiento del navegador y no toca la sesion. `T-09-SC` verificado: la cuenta de dependencias de `package.json` sigue en 17 y la fase no instalo ningun paquete.

## Estado del repositorio

Los nueve commits de la fase estan en `main`, en local. **Nada se pusheo:** publicar es decision de Juan.

## Self-Check: PASSED

Archivo modificado verificado en disco: `src/components/layout/header.tsx`.

Commit verificado en `git log`: `cd2f357`.
