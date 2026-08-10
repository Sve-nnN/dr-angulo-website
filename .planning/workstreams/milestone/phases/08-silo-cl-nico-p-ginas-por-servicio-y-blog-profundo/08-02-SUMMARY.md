---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 02
subsystem: content
tags: [contenido-clinico, next-app-router, generate-static-params, json-ld, schema-org, sitemap, silo-seo]

requires:
  - phase: 08-01
    provides: la plantilla /servicios/[slug], SERVICE_SECTION_ORDER, AuthorByline, MedicalDisclaimer, TableOfContents, MidContentCta, ServiceCard, MedicalWebPageJsonLd y scripts/check-content.mjs
provides:
  - /servicios/estenosis-espinal, 1837 palabras de guia clinica
  - /servicios/escoliosis, 1871 palabras, sin bloque de lecturas relacionadas
  - /servicios/ortopedia-infantil, 1964 palabras, describesSurgery en false
  - El silo cerrado en cuatro rutas, el hub con cuatro tarjetas y el sitemap en 16 URLs
affects: [08-03, 08-04, fase 09 paginas por sede, fase 10 breadcrumbs y titles]

tech-stack:
  added: []
  patterns:
    - "Expansion pura por datos: tres rutas nuevas sin tocar plantilla, hub, sitemap, schema ni componentes"
    - "describesSurgery se fija por lo que dice la prosa, no por inercia de la categoria"

key-files:
  created: []
  modified:
    - src/content/service-pages.ts

key-decisions:
  - "ortopedia-infantil va con describesSurgery en false: su seccion de tratamiento se queda en observacion, ortesis, terapia y controles, y los dos procedimientos declarados en el grafo son de cirugia de columna del adulto"
  - "Las cifras clinicas del consenso van escritas en palabras y no en digitos, para que ninguna quede leible como dato destacado"
  - "La formacion en correccion de deformidades del CV se menciona una sola vez, como formacion y en tercera persona, sin volumen de casos ni resultado"
  - "El cruce hacia la guia de escoliosis desde ortopedia infantil se hace en prosa, porque el modelo de datos no tiene campo de enlace entre paginas hermanas"

patterns-established:
  - "El presupuesto de palabras del plan se toma como piso y no como techo: las tres paginas quedaron entre 1837 y 1964 palabras contra un minimo de 900"
  - "Cada pagina abre con la seccion que el paciente reconoce y ubica el banner despues de sintomas, asi el ratio del primer tercio sale por construccion"

requirements-completed: [SVC-02, SVC-03, SVC-04, SVC-05]

coverage:
  - id: D1
    description: "/servicios/estenosis-espinal se prerenderiza estatica con las siete secciones en el orden fijo y mas de 900 palabras de cuerpo"
    requirement: SVC-02
    verification:
      - kind: integration
        ref: "node scripts/check-content.mjs /servicios/estenosis-espinal (1837 palabras)"
        status: pass
    human_judgment: false
  - id: D2
    description: "/servicios/escoliosis igual, y sin bloque de lecturas relacionadas porque ningun post la alimenta"
    requirement: SVC-03
    verification:
      - kind: integration
        ref: "check-content.mjs (1871 palabras); cero coincidencias de /blog/ en el HTML de la ruta"
        status: pass
    human_judgment: false
  - id: D3
    description: "/servicios/ortopedia-infantil igual, con registro dirigido a los padres"
    requirement: SVC-04
    verification:
      - kind: integration
        ref: "check-content.mjs (1964 palabras)"
        status: pass
    human_judgment: true
    rationale: "Que el texto le hable efectivamente a un padre o una madre y no a un paciente adulto es un juicio de lectura, no algo que la puerta mida"
  - id: D4
    description: "El hub muestra las cuatro tarjetas, cada guia vuelve al hub y ofrece agendar sin pasar por el inicio, y los cuatro anclajes vivos siguen resolviendo"
    requirement: SVC-05
    verification:
      - kind: integration
        ref: "un href por ruta hija en servicios.html; los cuatro id de seccion presentes; href=/servicios y dos href=/agendar en cada guia"
        status: pass
    human_judgment: false
  - id: D5
    description: "El sitemap declara 16 URLs"
    verification:
      - kind: integration
        ref: "grep -o '<loc>' .next/server/app/sitemap.xml.body | wc -l"
        status: pass
    human_judgment: false
  - id: D6
    description: "Las cuatro emiten MedicalWebPage con about de tipo MedicalCondition, y solo las que describen cirugia referencian procedimientos"
    verification:
      - kind: integration
        ref: "servicio-jsonld de ortopedia-infantil sin possibleTreatment ni mentions; las otras tres con ambos; reviewedBy y lastReviewed ausentes en las cuatro"
        status: pass
    human_judgment: false
  - id: D7
    description: "Ninguna de las tres paginas nuevas afirma credenciales fuera del CV, cifras de cirugias, tasas de exito, precios ni experiencia clinica en primera persona"
    verification:
      - kind: other
        ref: "check-content.mjs SAFE-05, SAFE-08, SAFE-09 y SAFE-10 sobre el cuerpo y sobre src/content/service-pages.ts"
        status: pass
    human_judgment: true
    rationale: "La puerta bloquea las formas prohibidas de afirmacion, no juzga la exactitud clinica de la prosa. Se publica sin revision previa del doctor por la decision del 2026-08-10, y esa revision sigue pendiente"

duration: 21min
completed: 2026-08-10
status: complete
---

# Phase 8 Plan 02: Expansion del silo clinico Summary

**El silo queda cerrado en cuatro rutas: estenosis espinal, escoliosis y ortopedia infantil se suman con 5672 palabras nuevas de guia clinica, el hub muestra las cuatro tarjetas y el sitemap llega a 16 URLs, todo derivado de tres entradas de datos y sin tocar una sola linea de plantilla, hub, sitemap, schema ni componentes.**

## Performance

- **Duration:** 21 min
- **Tasks:** 3 de 3
- **Files modified:** 1 archivo, 370 inserciones

## Accomplishments

- La apuesta arquitectonica de 08-01 se confirmo en la practica: las tres rutas nuevas, sus tarjetas del hub, sus entradas de sitemap, su schema y su tabla de contenidos salieron de agregar tres objetos a un array. El `git diff --stat` de los tres commits reporta un unico archivo.
- Las tres paginas quedaron holgadamente sobre el minimo, y no por relleno. Estenosis explica por que el canal cambia de tamano con la postura y por que se tolera mejor pedalear que caminar. Escoliosis explica que la curva es un cambio en tres dimensiones y para que sirve realmente un corse. Ortopedia infantil dedica su seccion mas larga a distinguir lo que puede esperar a una cita normal de lo que no.
- La correspondencia entre schema y prosa se resolvio en el sentido correcto. Ortopedia infantil no describe cirugia, asi que no referencia procedimientos, y los que estaban disponibles para referenciar eran de cirugia de columna del adulto: atarlos a una pagina sobre displasia de cadera y marcha infantil habria sido afirmar algo que el texto no dice.
- Ninguna de las tres paginas introduce un solo dato que no salga del consenso clinico general, de `src/content/services.ts` o del CV verificado.

## Task Commits

1. **Tarea 1: guia de estenosis espinal** - `832bb81` (feat)
2. **Tarea 2: guia de escoliosis y deformidades de columna** - `2271a33` (feat)
3. **Tarea 3: guia de ortopedia infantil y cierre del silo** - `42bf06b` (feat)

## Files Created/Modified

**Modificados**

- `src/content/service-pages.ts` - Tres entradas nuevas en `servicePages`. Ningun tipo cambio, ningun campo nuevo, ninguna clave nueva de `CtaLocation`.

**Archivos nuevos:** ninguno. **Componentes nuevos:** ninguno. **Paquetes instalados:** ninguno.

## Decisions Made

- **`describesSurgery` de ortopedia infantil quedo en `false`.** La tarea 3 pedia expresamente que el valor correspondiera con lo que dice el texto. La seccion de tratamiento de esa pagina cubre observacion con controles programados, arnes en la displasia detectada temprano, corse para las curvas de columna, terapia fisica y derivacion. Reconoce en una sola frase que una minoria de casos necesita un procedimiento, sin describir ninguna tecnica. Con `true`, el schema habria colgado de una condicion pediatrica los dos abordajes de cirugia de columna del adulto que declara el grafo raiz, que es exactamente el spoofing que el registro de amenazas marca como T-08-07.
- **Las cifras del consenso van escritas en palabras.** "A partir de los sesenta anos", "supera los diez grados". Es correcto, se lee igual y elimina de raiz cualquier riesgo de que un numero quede leible como dato destacado (SAFE-08 y SAFE-09).
- **La formacion del CV se menciona una vez y en tercera persona.** En la subseccion de cirugia de escoliosis, como formacion especifica en correccion de deformidades, que es lo que el CV registra. Sin volumen de casos, sin resultado y sin primera persona.
- **El cruce de ortopedia infantil hacia la guia de escoliosis quedo en prosa.** El modelo de datos no tiene campo de enlace entre paginas hermanas y crear uno habria significado tocar la plantilla, que es justamente lo que el plan prohibe. La mencion textual cumple para el lector; el enlace navegable, si se quiere, es material de otra fase.
- **El presupuesto de palabras del plan se tomo como piso.** Las tres paginas cerraron entre 1837 y 1964 palabras, en linea con las 1569 del trazador, porque bajar al minimo habria significado cortar explicacion util.

## Deviations from Plan

Ninguna. Las tres tareas se ejecutaron tal como estaban escritas: mismo alcance, mismo unico archivo modificado, ninguna regla de contenido relajada y ningun componente tocado.

### Criterios cuya expresion literal no es satisfacible, verificados por su intencion

No son cambios de codigo ni incumplimientos. Son criterios cuya redaccion produce un falso negativo, del mismo tipo que los tres que documento 08-01, y quedan anotados para quien audite.

**Tarea 3, criterio 8.** El criterio dice que si `describesSurgery` es `false`, el HTML de `/servicios/ortopedia-infantil` no debe contener `"@type":"MedicalProcedure"` ni referencias a `#procedimiento-`. Sobre el documento completo si las contiene, y no por esta pagina: el grafo raiz que el layout inyecta en **todas** las rutas del sitio declara los dos procedimientos como nodos del grafo. `.next/server/app/contacto.html`, que no tiene nada que ver con el silo, tambien devuelve una coincidencia de cada una. La verificacion se hizo entonces sobre el bloque que si depende de esta pagina, el script `servicio-jsonld`: en ortopedia infantil no tiene `possibleTreatment`, no tiene `mentions` y no contiene ninguna cadena `#procedimiento-`; en las otras tres si tiene los tres elementos. Esa es la intencion del criterio y se cumple.

**Tareas 1, 2 y 3, criterio de conteo de `h2`.** Los criterios piden siete `h2` con `id` y `tabindex="-1"`. Las cuatro rutas tienen ocho `h2` dentro del articulo: los siete anclados mas el del CTA de cierre, que es el mismo comportamiento que 08-01 dejo documentado. Los siete anclados son exactamente siete en las cuatro.

---

**Total deviations:** 0. **Criterios verificados por intencion:** 2 familias.
**Impact on plan:** Ninguno. Alcance y salvaguardas intactos.

## Issues Encountered

- **La primera lectura de criterio 8 parecia un incumplimiento.** El `grep` sobre el HTML completo devolvia positivo en las cuatro rutas, incluida la que no describe cirugia. Antes de tocar nada se contrasto con una pagina ajena al silo, y ahi quedo claro que la coincidencia venia del grafo raiz del layout y no del schema de la pagina. Vale registrarlo porque la reaccion facil habria sido ajustar `describesSurgery` a `true` para "cuadrar" el criterio, que es exactamente el movimiento equivocado.
- **Sin regresiones en el blog.** `blog.html` y los cuatro HTML de posts siguen generandose. Este plan no toco el blog.

## Known Stubs

Ninguno. Las cuatro rutas del silo estan completas. La expansion de los cuatro posts es el alcance declarado de 08-03 y 08-04, no un stub de este plan.

## Threat Flags

Ninguna superficie nueva de red, autenticacion, acceso a archivos ni cambio de esquema en limite de confianza. Las mitigaciones del registro se cumplieron:

| Amenaza | Estado |
|---------|--------|
| T-08-06 divulgacion en la prosa clinica de las tres paginas | Puerta ejecutable en verde sobre las cuatro rutas y sobre el archivo de datos. Cero primera persona, cero porcentaje, cero soles, cero cifra en encabezado, cero enfasis fuerte. |
| T-08-07 spoofing de `MedicalProcedure` en una pagina que no describe cirugia | `describesSurgery` en `false` para ortopedia infantil. Su `servicio-jsonld` no referencia procedimientos. No se declaro ningun procedimiento nuevo. |
| T-08-08 slug arbitrario en la ruta dinamica | Sin cambios: las cuatro rutas se prerenderizan desde `generateStaticParams` y cualquier otro slug cae en `notFound()`. |
| T-08-SC instalaciones de npm | Cero paquetes. `package.json` no aparece en ninguno de los tres diffs. |

## User Setup Required

Ninguna.

## Next Phase Readiness

**Listo para 08-03 y 08-04.** Las cuatro paginas de servicio que el mapa de enlazado necesita como destino ya existen y estan en el manifiesto de la puerta: los posts pueden apuntar a `/servicios/hernia-discal` y `/servicios/estenosis-espinal` sabiendo que el destino resuelve.

**Pendiente de decision del desarrollador, no de codigo:**

1. **Nada se subio a `main`.** Los tres commits estan solo en local, sumados a los cuatro de 08-01. El deploy no se disparo.
2. **La revision del doctor sigue pendiente.** Con este plan son cerca de 7200 palabras de contenido clinico publicables bajo su firma, sin revision previa, por la decision registrada el 2026-08-10.
3. **Verificacion manual pendiente (D3 y D7):** lectura de la prosa de las tres paginas nuevas y recorrido de teclado por las anclas a 375px.

## Self-Check: PASSED

- Un archivo modificado declarado: existe en disco y es el unico que reportan los tres `git diff --stat`.
- Tres commits declarados (`832bb81`, `2271a33`, `42bf06b`): los tres estan en `git log`.
- `npm run build` codigo 0, `npm run lint` codigo 0, `node scripts/check-content.mjs` sobre las cuatro rutas codigo 0.
- Sitemap en 16 URLs. Los cuatro anclajes del hub presentes. Cuatro archivos HTML de servicio en disco.
- Cero guiones largos en este SUMMARY y cero en `src/content/service-pages.ts`.

---
*Phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo*
*Completed: 2026-08-10*
