---
phase: 16-alineaci-n-de-contenido-enlazado-y-schema
verified: 2026-08-24T00:00:00Z
status: human_needed
score: 4/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification: null
human_verification:
  - test: "Decidir si /blog/reumatologo-o-traumatologo puede conservar su sección `cirugia` (`Cuándo se plantea operar`, líneas 113-119 de src/content/blog/reumatologo-o-traumatologo.ts), o si esa sección debe recortarse y remitir a /servicios/hernia-discal igual que se hizo con lumbalgia y ciática en la ola 6."
    expected: "Una de dos: (a) se acepta que el criterio 4 está acotado a la terna ciática / lumbalgia / hernia discal —que es como lo escribe LINK-02 en REQUIREMENTS.md y como lo escribe el must_have del 16-06-PLAN— y el post nuevo queda como está; o (b) se abre trabajo de cierre para recortar esa sección."
    why_human: "Es una decisión de alcance, no un hecho verificable. El texto es material preexistente del sitio (venía de /preguntas-frecuentes en `main`), la fase lo movió, no lo inventó, y el balance neto de la fase es una reducción de tres URLs que desarrollaban la decisión quirúrgica. Pero la redacción literal del criterio 4 del ROADMAP dice `solo` en /servicios/hernia-discal, y esa lectura hoy no se cumple."
---

# Fase 16: Alineación de contenido, enlazado y schema — Informe de verificación

**Goal:** Cada URL del sitio anuncia el tema que realmente trata, cubre una intención de búsqueda distinta a las demás y lo declara igual en su title, su H1, sus anchors y su schema.
**Verificado:** 2026-08-24
**Estado:** human_needed
**Re-verificación:** No — verificación inicial
**Rama:** `seo/fase-16-alineacion-contenido`, 27 commits sobre `main`

## Logro del objetivo

### Criterios de éxito del ROADMAP

| # | Criterio | Estado | Evidencia |
|---|---|---|---|
| 1 | Slugs viejos apagados en un salto, sin cadena, sin rastro en sitemap ni enlaces internos | ✓ VERIFICADO | `curl` contra `npm run start` en el puerto 4321: `/blog/5-sintomas-de-columna-que-no-debes-ignorar` → 308 → `/blog/ciatica` → 200. `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` → 308 → `/blog/cirugia-de-columna` → 200. `curl -sIL` muestra exactamente dos respuestas: 308 y 200. Cero apariciones de los dos slugs viejos bajo `src/`, `public/` y `.next/server/app/**/*.html`. Sitemap con 23 `<loc>`, ninguno con slug viejo. |
| 2 | `/preguntas-frecuentes` es FAQ de punta a punta; "reumatólogo o traumatólogo" en su propia URL | ✓ VERIFICADO | HTML servido: `<title>Preguntas frecuentes antes de la consulta</title>`, `<h1>Dudas frecuentes antes de la consulta</h1>`. `/blog/reumatologo-o-traumatologo` responde 200, `<title>Reumatólogo o traumatólogo: a cuál te toca ir</title>`, `<h1>Reumatólogo o traumatólogo: cómo saber cuál te corresponde</h1>`, y está en el sitemap. |
| 3 | Ningún anchor interno es keyword cruda, superlativo ni especialidad ajena | ✓ VERIFICADO | 110 anchors en `src/content/`. Cero con inicial minúscula. Cero que contengan "neurocirujano", "mejor" o "cerca de m". Los 22 rótulos distintos son descriptivos ("Guía sobre la hernia discal", "Cuándo el dolor de pierna viene de la columna"). El post nuevo se enlaza como "Qué condiciones se tratan en cada especialidad", que no atribuye la reumatología al doctor. |
| 4 | Lumbalgia y ciática cubren dolor, autocuidado y cuándo consultar, con enlace a hernia discal; la decisión quirúrgica se desarrolla solo en `/servicios/hernia-discal` | ⚠️ PARCIAL | Primera cláusula verificada. Segunda cláusula verificada dentro de la terna, no verificada a nivel de sitio. Detalle abajo. |
| 5 | Ninguna secuencia de H2 en más de dos páginas; `about` propio por post con su tipo; ningún `FAQPage` de una sola pregunta | ✓ VERIFICADO | Análisis propio sobre las 25 páginas HTML del build: **0 secuencias de H2 repetidas en más de dos páginas**. `about` en el HTML construido: `MedicalCondition` en lumbalgia, ciática y artrosis; `MedicalProcedure` (dos nodos, ambos definidos en el grafo de la propia página) en cirugía de columna; `MedicalSpecialty` en reumatólogo. Cero archivos bajo `.next/server/app/blog/` referencian `hernia-discal#page`. `FAQPage` en exactamente 2 HTML: `/preguntas-frecuentes` con 7 `Question` y `/servicios/escoliosis-y-deformidades` con 3. |

**Score:** 4/5 criterios verificados.

## Criterio 4 en detalle

### Lo que sí está verificado

Leí la prosa completa de los dos posts después de la ola 6, no el SUMMARY.

**`/blog/ciatica`** (242 líneas, 2041 palabras según la puerta). Recorrido resultante: `que-es` → `sintomas` (con el diferencial contra lumbalgia y la falsa ciática) → `causas` → `diagnostico` → `sin-operar` → `preguntas-frecuentes` → `cuando-consultar`. La sección `cirugia` salió entera y **no dejó hueco**: `sin-operar` desemboca en el párrafo puente y de ahí el lector pasa a las preguntas frecuentes, que es una transición natural. El puente hace lo que debe hacer: dice que cuando el dolor irradiado no cede la conversación pasa a la cirugía, que esa decisión depende de los estudios y no del tiempo, y que el detalle está en la guía de hernia discal. No desarrolla criterios de indicación.

**`/blog/lumbalgia`** (234 líneas, 2067 palabras). Recorrido: `que-es` → `sintomas` → `causas` → `diagnostico` → `sin-operar` → `preguntas-frecuentes` → `senales-de-alarma` (intacto, con sus cuatro ítems y el bloque `qué hacer`) → `cuando-consultar`. Se retiraron `cirugia` y su subsección `cirugia--lumbalgia-se-opera`. El puente es una sola frase, deliberadamente corta porque `cuando-consultar--especialista-en-lumbalgia` ya remitía a la misma guía; comprobé los dos textos y no se repiten.

**Nada de decisión quirúrgica sobrevivió bajo otro encabezado en esos dos posts.** Barrido de `operar|cirug|quirófano|quirurg|interven` sobre los dos módulos: las únicas apariciones son los `id`/`heading` de `sin-operar`, los dos párrafos puente, un anchor de salida al post de cirugía y una mención a "evaluando una intervención" dentro del criterio para pedir resonancia. Ningún `id="cirugia"` en los dos HTML construidos.

**El enlace a hernia discal llega por dos caminos, los dos vivos en el HTML.** Cada post emite dos `href="/servicios/hernia-discal"`: el del bloque "Sigue leyendo" con el rótulo "Guía sobre la hernia discal", y el de `relatedService` al pie ("Leer la guía completa sobre hernia discal"). Nota para quien re-verifique: un `grep` literal de esa segunda frase da 0 porque React parte el nodo de texto antes de la interpolación; el enlace está, se ve en el payload RSC del mismo HTML.

### Lo que no puedo dar por verificado

`/blog/reumatologo-o-traumatologo` —la URL que **esta misma fase creó** en la ola 2— tiene una sección `cirugia` de nivel 2 titulada "Cuándo se plantea operar" (líneas 113-119) que desarrolla exactamente el material que la ola 6 retiró de los otros dos posts:

> "Operar se plantea en tres situaciones... Cuando hay pérdida de fuerza que progresa. Cuando aparecen signos de compresión seria del canal. Y cuando el dolor incapacitante sigue igual pese a un manejo conservador bien hecho y sostenido."

Comparar con lo que se borró de lumbalgia en `450682a`: *"Las razones que sí apuran son otras: la pérdida de fuerza que avanza, los signos de compresión seria del canal y el dolor irradiado incapacitante que no cedió después de un manejo conservador bien hecho."* Es la misma afirmación con otras palabras. Su `description` además anuncia el tema: "...y en qué casos se plantea operar".

Contexto que atenúa el hallazgo, y por eso esto es una decisión y no una brecha:

- **No es texto nuevo.** `git show main:src/content/static-pages/preguntas-frecuentes.ts` lo contiene. La ola 2 lo mudó junto con el resto de la guía; la ola 6 corrió después y no lo alcanzó porque su alcance eran dos archivos.
- **El balance neto de la fase es de mejora.** Antes: hernia discal, el post de cirugía, `/preguntas-frecuentes`, lumbalgia y ciática. Después: hernia discal, el post de cirugía (cuyo tema es ese) y el post de reumatólogo. De cinco a tres.
- **LINK-02 en `REQUIREMENTS.md` está escrito acotado a la terna** ("Ciática, lumbalgia y hernia discal... y solo la comercial desarrolla la decisión quirúrgica"), y el `must_have` del `16-06-PLAN.md` también ("ninguno de los dos posts informativos"). Con esa lectura el requisito se cumple. Lo que no se cumple es la palabra "solo" del criterio 4 del ROADMAP leída sin acotar.

## Deviation 1 — el párrafo de cauda equina

Ratificada por el orquestador; verifiqué solo lo que se me pidió verificar.

- **Movido verbatim.** El diff de `873dab2` muestra la misma cadena carácter por carácter saliendo de `cirugia` y entrando en `cuando-consultar`: *"Hay tres situaciones que no admiten esperar turno y se evalúan el mismo día: la pérdida de fuerza que avanza rápido, el adormecimiento en la zona de la entrepierna y los genitales, y la dificultad para controlar la orina o la deposición."* Cero afirmaciones clínicas nuevas.
- **Lee coherente en su nuevo lugar.** Queda como segundo párrafo de `cuando-consultar`, entre "consulta si el dolor baja por la pierna y no cede en pocos días" y "mientras consigues la cita, anota cómo se comporta el dolor". Es una escalera de urgencia bien ordenada: consultar → no esperar turno → mientras tanto. El post no tiene bloque `senales-de-alarma` propio, así que este párrafo es su única red de seguridad.
- **No reintroduce la decisión quirúrgica por la puerta de atrás.** El párrafo es una lista de banderas rojas de cauda equina que manda a evaluación el mismo día. No dice qué se opera, ni cuándo, ni con qué criterio. No nombra la cirugía.

## Verificación de artefactos

| Artefacto | Nivel 1 existe | Nivel 2 sustantivo | Nivel 3 cableado | Nivel 4 datos | Estado |
|---|---|---|---|---|---|
| `src/content/blog/ciatica.ts` | ✓ | ✓ 2041 palabras | ✓ en `blogPosts`, prerenderiza | ✓ | ✓ |
| `src/content/blog/lumbalgia.ts` | ✓ | ✓ 2067 palabras | ✓ | ✓ | ✓ |
| `src/content/blog/cirugia-de-columna.ts` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `src/content/blog/reumatologo-o-traumatologo.ts` | ✓ | ✓ 1258 palabras | ✓ en sitemap y MANIFEST | ✓ | ⚠️ ver criterio 4 |
| `src/content/static-pages/preguntas-frecuentes.ts` | ✓ | ✓ 1069 palabras, 11 secciones | ✓ | ✓ | ✓ |
| `src/components/structured-data.tsx` | ✓ | ✓ `topicEntityNode()` | ✓ emite `about` en los 5 HTML | ✓ | ✓ |
| `next.config.ts` — `redirects()` | ✓ | ✓ 5 entradas `permanent: true` | ✓ responden en runtime | ✓ | ✓ |

## Verificación de enlaces clave

| Desde | Hacia | Vía | Estado |
|---|---|---|---|
| `/blog/ciatica` | `/servicios/hernia-discal` | `outboundLinks` + `relatedService` | ✓ CABLEADO (2 `href` en el HTML) |
| `/blog/lumbalgia` | `/servicios/hernia-discal` | `outboundLinks` + `relatedService` | ✓ CABLEADO (2 `href` en el HTML) |
| slug viejo de ciática | `/blog/ciatica` | `redirects()` 308 | ✓ CABLEADO, un salto, destino 200 |
| slug viejo de cirugía | `/blog/cirugia-de-columna` | `redirects()` 308 | ✓ CABLEADO, un salto, destino 200 |
| `BlogPost.topicEntities` | `about` del JSON-LD | `topicEntityNode()` | ✓ CABLEADO, verificado en los 5 HTML |
| `@id` `#procedimiento-*` del post de cirugía | nodos `MedicalProcedure` | grafo de la propia página | ✓ CABLEADO, los dos nodos se definen en ese HTML |

## Comprobaciones de comportamiento

| Comprobación | Comando | Resultado | Estado |
|---|---|---|---|
| Build de producción | `npm run build` | exit 0 | ✓ |
| Puerta de contenido | `npm run content:check` | exit 0 | ✓ |
| Puerta de SEO | `npm run seo:check` | exit 0 | ✓ |
| Puerta de sedes | `npm run sedes:check` | exit 0 | ✓ |
| Tipos | `npx tsc --noEmit` | exit 0 | ✓ |
| Redirección de ciática | `curl -sIL` puerto 4321 | `308` → `200`, sin salto intermedio | ✓ |
| Redirección de cirugía | `curl -sI` + segundo salto | `308` → `location` → `200` | ✓ |
| Secuencias de H2 repetidas | script propio sobre 25 HTML | 0 violaciones | ✓ |
| `FAQPage` de una sola pregunta | conteo de `"@type":"Question"` por HTML | 7 y 3; ninguno con 1 | ✓ |
| `about` apuntando a hernia discal | `grep -rl "hernia-discal#page" .next/server/app/blog/` | ningún archivo | ✓ |
| Sitemap | `grep -c "<loc>"` | 23, ninguno con slug viejo | ✓ |

## Convenciones de contenido

Barrido sobre **todas las líneas agregadas** por la rama bajo `src/content/` (`git diff main..HEAD`), buscando porcentajes, plazos garantizados, cifras de cirugías, tasas de éxito y precios: **cero coincidencias**. Las puertas además lo cierran por código: `check-content.mjs` falla ante `\d\s?%` en el cuerpo (tasas de éxito), ante `S/\s?\d` (precio) y ante las construcciones en primera persona de `FIRST_PERSON_CLAIMS` (voz testimonial), y rechaza los campos prohibidos `garantia`, `tasaExito` y `precio`. Las tres puertas pasan.

**El post nuevo es material mudado, no inventado.** Comparé párrafo por párrafo lo que la ola 2 agregó en `4bdf2bb` contra lo que la ola 2 retiró de `/preguntas-frecuentes` en `0225c51`: de 29 cadenas largas agregadas, **27 son verbatim** del contenido retirado. Las dos que no coinciden son el `description` del post y un `id` de sección, no prosa clínica. No hay afirmaciones clínicas nuevas en esas 1258 palabras.

## Cobertura de requisitos

| Requisito | Descripción | Estado | Evidencia |
|---|---|---|---|
| SLUG-01 | La URL del post anuncia su tema | ✓ SATISFECHO | `/blog/ciatica` y `/blog/cirugia-de-columna` prerenderizan y están en el sitemap |
| SLUG-02 | Una sola redirección permanente, sin cadenas ni 404; nada apunta a los viejos | ✓ SATISFECHO | 308 → 200 en un salto para las dos; cero apariciones en `src/`, `public/`, HTML del build y sitemap |
| SLUG-03 | `/preguntas-frecuentes` con URL, title y H1 del mismo tema | ✓ SATISFECHO | title y H1 sobre dudas previas a la consulta; 11 secciones, todas preguntas de paciente |
| SLUG-04 | "Reumatólogo o traumatólogo" en su propia URL con title y H1 alineados | ✓ SATISFECHO | `/blog/reumatologo-o-traumatologo` responde 200 con title y H1 propios |
| LINK-01 | Ningún anchor con keyword cruda, superlativo ni especialidad ajena | ✓ SATISFECHO | 110 anchors, 22 rótulos distintos, todos descriptivos; cero términos vedados |
| LINK-02 | Las tres URLs con intenciones distintas, enlazadas, y solo la comercial desarrolla la cirugía | ✓ SATISFECHO | Acotado a la terna como lo escribe el requisito. Ver criterio 4 por la lectura sin acotar |
| LINK-03 | Ninguna secuencia de H2 repetida en más de dos páginas | ✓ SATISFECHO | 0 violaciones sobre las 25 páginas con H2 del build |
| SCH-01 | Cada post declara `about` de su propia entidad | ✓ SATISFECHO | Los cinco HTML con su entidad y su tipo; ninguno referencia `hernia-discal#page` |
| SCH-02 | Ningún `FAQPage` de una sola pregunta | ✓ SATISFECHO | Solo 2 HTML emiten `FAQPage`, con 7 y 3 preguntas |

Ningún requisito huérfano: `REQUIREMENTS.md` mapea a la fase 16 exactamente los nueve que los planes declaran.

## Antipatrones

Barrido de `TODO`, `FIXME`, `XXX`, `HACK`, `PLACEHOLDER`, retornos vacíos y props vacíos sobre los archivos que la rama tocó: sin hallazgos que bloqueen.

**Informativo, no es brecha.** Cinco H2 se repiten en las cuatro fichas de sede ("Dirección y mapa", "Horario vigente", "Canales de cita de la sede", "Guías de las condiciones que atiende", "Agenda en esta sede") y dos en las 25 páginas ("Consultorio privado", "Contacto rápido"). Los siete son cromo de plantilla —aside y pie—, no encabezados de artículo, y ninguna secuencia completa de H2 se repite: las cuatro fichas de sede llevan cinco encabezados propios cada una antes del bloque compartido. El criterio 5 habla de secuencias y se cumple. Queda anotado por si la fase 19 quiere diferenciar también el cromo.

## Verificación humana requerida

### 1. Alcance del "solo" del criterio 4

**Qué hacer:** decidir si `/blog/reumatologo-o-traumatologo` conserva su sección `cirugia` ("Cuándo se plantea operar", líneas 113-119) o si se recorta y remite a `/servicios/hernia-discal`, como se hizo con lumbalgia y ciática.
**Qué se espera:** o se acepta la lectura acotada a la terna —que es la que escriben LINK-02 y el `must_have` del plan 16-06, y con la cual la fase cierra— o se abre trabajo de cierre por ese archivo.
**Por qué lo decide una persona:** es alcance, no un hecho. El texto venía de `/preguntas-frecuentes` en `main`, la fase lo mudó sin inventar nada, y el saldo neto es una reducción de cinco URLs a tres. Pero la palabra "solo" del criterio, leída a nivel de sitio, hoy no se sostiene.

## Resumen

La fase entregó lo sustancial. Las dos URLs viejas se apagan en un salto limpio con destino 200, el sitemap y todos los enlaces internos ya viven en los slugs nuevos, `/preguntas-frecuentes` quedó como FAQ de punta a punta con su guía mudada a URL propia, los 110 anchors dicen a dónde llevan, el schema emite la entidad de tema correcta por post con el tipo que le toca y ningún bloque de preguntas queda con una sola. Las cinco puertas del proyecto pasan sobre el estado final.

Lo que separa esto de un `passed` limpio es una sola cosa, y es de alcance, no de calidad: la fase sacó la decisión quirúrgica de dos posts en la ola 6 y la publicó en una URL nueva en la ola 2, sin que ninguna ola reconciliara las dos cosas. El requisito escrito se cumple; la frase del criterio leída sin acotar, no.

---

_Verificado: 2026-08-24_
_Verificador: Claude (gsd-verifier)_
