---
phase: 16-alineacion-de-contenido-enlazado-y-schema
reviewed: 2026-08-24T00:00:00Z
depth: deep
files_reviewed: 26
files_reviewed_list:
  - next.config.ts
  - scripts/check-content.mjs
  - scripts/check-sedes.mjs
  - scripts/check-seo.mjs
  - src/app/preguntas-frecuentes/page.tsx
  - src/app/servicios/[slug]/page.tsx
  - src/app/sitemap.xml/route.ts
  - src/app/blog/[slug]/page.tsx
  - src/components/structured-data.tsx
  - src/content/blog/index.ts
  - src/content/blog/artrosis.ts
  - src/content/blog/ciatica.ts
  - src/content/blog/cirugia-de-columna.ts
  - src/content/blog/lumbalgia.ts
  - src/content/blog/reumatologo-o-traumatologo.ts
  - src/content/location-pages/clinica-ricardo-palma.ts
  - src/content/location-pages/clinica-tezza.ts
  - src/content/location-pages/consultorio-privado.ts
  - src/content/location-pages/sanna-la-molina.ts
  - src/content/service-pages/cirugia-minimamente-invasiva.ts
  - src/content/service-pages/escoliosis-y-deformidades.ts
  - src/content/service-pages/estenosis-espinal.ts
  - src/content/service-pages/hernia-discal.ts
  - src/content/service-pages/ortopedia-infantil.ts
  - src/content/static-pages/home.ts
  - src/content/static-pages/hub-servicios.ts
  - src/content/static-pages/preguntas-frecuentes.ts
findings:
  critical: 0
  warning: 7
  info: 5
  total: 12
status: findings
---

# Fase 16: informe de revisión de código

**Revisado:** 2026-08-24
**Profundidad:** deep (análisis entre archivos)
**Archivos revisados:** 26 de código y contenido
**Estado:** findings — ningún bloqueante, siete advertencias

## Resumen

El diff hace lo que dice hacer y la parte más delicada, el deslinde entre
`relatedService` y `topicEntities`, quedó correcta a nivel de comportamiento:
`BlogPostingJsonLd` ya no lee `relatedService` en ninguna rama y `about` sale
solo del campo nuevo. Las redirecciones están limpias, no hay referencias
colgadas a los `id` retirados ni a los slugs viejos dentro de `src/`, y el
criterio de "una etiqueta canónica por destino" se cumple literalmente: 110
anchors repartidos en 22 destinos, cero destinos con más de una etiqueta
distinta, cero `href` repetido dentro de un mismo archivo.

Lo que queda son defectos de modelado y de alcance no documentado, no de
comportamiento actual. Los tres que más pesan: el traductor de entidades no
tiene guarda de exhaustividad y puede emitir `null` dentro de `about` en cuanto
alguien agregue un `kind`; el `procedureSlug` duplica a mano los slugs de
`procedureApproaches` sin ningún vínculo de compilación; y el campo
`relatedService` sobrevive en el tipo del JSON-LD ya sin lector, que es
exactamente el vestigio del acoplamiento que esta fase vino a romper.

## Advertencias

### WR-01: `topicEntityNode` no tiene guarda de exhaustividad y puede emitir `null` en `about`

**Archivo:** `src/components/structured-data.tsx:551-566`
**Problema:** el `switch` cubre los tres `kind` actuales, no tiene `default` ni
anotación de tipo de retorno ni aserción `never`. El día que alguien agregue un
cuarto miembro a `BlogTopicEntity`, TypeScript infiere el retorno como
`... | undefined` y no falla en ningún lado: en el callsite
(`post.topicEntities.map(topicEntityNode)`, línea 592) ese `undefined` entra al
arreglo y `JSON.stringify` lo serializa como `null`. El resultado es
`"about": [ {...}, null ]`, JSON-LD inválido publicado en producción sin que
ninguna de las cuatro compuertas lo note. En el caso de una sola entidad la
clave desaparece en silencio, que es menos grave pero igual de invisible.
**Corrección:**
```tsx
function topicEntityNode(entity: BlogTopicEntity): Record<string, unknown> {
  switch (entity.kind) {
    // ...los tres casos actuales...
    default: {
      const unhandled: never = entity;
      throw new Error(`entidad de tema sin nodo declarado: ${JSON.stringify(unhandled)}`);
    }
  }
}
```

### WR-02: `procedureSlug` duplica los slugs de `procedureApproaches` sin vínculo de compilación

**Archivo:** `src/content/blog/index.ts:52-55`
**Problema:** la unión `"minimamente-invasiva" | "convencional"` está escrita a
mano y los slugs reales viven en `src/content/services.ts:71` y `:89`, donde el
campo está tipado como `string`. Renombrar un abordaje ahí compila sin error:
`ID.procedure()` construiría `#procedimiento-<slug-viejo>`, un `@id` que ya no
apunta a ningún nodo del grafo raíz, y `/blog/cirugia-de-columna` publicaría un
`about` colgado. El comentario del tipo dice que el nombre "vive en el nodo que
declara el grafo raíz" justamente para evitar la divergencia, pero el slug, que
es lo que ata los dos, sí está duplicado.
**Corrección:** derivar la unión del dato en vez de repetirla. En
`services.ts`, tipar los slugs como literales
(`export const procedureApproaches = [...] as const satisfies readonly ProcedureApproach[]`)
y en `blog/index.ts` usar
`procedureSlug: (typeof procedureApproaches)[number]["slug"]`.

### WR-03: `BlogPostJsonLdItem.relatedService` quedó muerto y su comentario sigue afirmando lo contrario

**Archivo:** `src/components/structured-data.tsx:515-516`
**Problema:** después del cambio ninguna función de `structured-data.tsx` lee
`relatedService` (grep confirma un único hit: la propia declaración). El campo
sigue en el tipo del ítem de JSON-LD con el comentario
`/** Slug de la guía de servicio que este post alimenta, si tiene una. */`, que
es la redacción del acoplamiento que esta fase eliminó. Un campo muerto en el
tipo de entrada del JSON-LD es una invitación a volver a cablearlo: el defecto
original de SCH-01 se reintroduce con una línea. El deslinde está bien hecho en
`BlogPost` (`src/content/blog/index.ts:77-92`, donde el comentario sí dice que
gobierna solo navegación), pero no se propagó a este tipo.
**Corrección:** borrar `relatedService` de `BlogPostJsonLdItem`. `BlogPost` lo
sigue declarando y `src/app/blog/[slug]/page.tsx:34` lo sigue usando para el
enlace "Leer la guía completa", que es su único consumidor legítimo.

### WR-04: `kind: "specialty"` emite un `MedicalSpecialty` con nombre libre en español, que no afirma nada

**Archivo:** `src/components/structured-data.tsx:563-564`, consumido en
`src/content/blog/reumatologo-o-traumatologo.ts:16-19`
**Problema:** `MedicalSpecialty` en schema.org es una enumeración
(`MedicalEnumeration`), no una clase para instanciar con texto libre. El propio
archivo ya modela especialidades como miembros de la enumeración
(`MEDICAL_SPECIALTIES` en la línea 51-54: `https://schema.org/Musculoskeletal`,
`https://schema.org/Surgical`). Emitir
`{"@type":"MedicalSpecialty","name":"Traumatología"}` no es JSON-LD inválido
pero no resuelve a ninguna entidad conocida, así que el único post que usa este
`kind` termina con un `about` que declara tanto como no declararlo. Es
incoherente con el patrón que ya existe a doce líneas de distancia y va en
contra del objetivo de la fase, que era que `about` dijera algo cierto.
**Corrección:** apuntar a los miembros reales de la enumeración y dejar el
nombre en español como etiqueta, no como identidad:
```tsx
case "specialty":
  return { "@id": entity.enumerationUrl, "@type": "MedicalSpecialty", name: entity.name };
```
con `enumerationUrl: "https://schema.org/Rheumatologic" | "https://schema.org/Musculoskeletal"`
en el tipo, que son los dos miembros que corresponden a reumatología y a
traumatología.

### WR-05: el umbral de FAQPage apaga también a `/servicios/estenosis-espinal`, y eso no está documentado en ningún lado

**Archivo:** `src/app/servicios/[slug]/page.tsx:93-103`
**Problema:** el cambio de `> 0` a `> 1` es correcto y falla seguro (cero y una
pregunta no emiten nada), pero su efecto alcanza a dos páginas, no a una.
`src/content/service-pages/estenosis-espinal.ts` tiene exactamente una sección
`preguntas-frecuentes--` (igual que hernia discal, verificado también contra
`main`), así que también dejó de emitir `FAQPage`. Las decisiones de la fase y
el comentario nuevo hablan solo de hernia discal. Quien audite el schema del
sitio dentro de tres meses va a encontrar una guía sin `FAQPage` que nadie
documentó y no va a saber si es intención o regresión.
**Corrección:** nombrar las dos páginas en el comentario, o mejor, dejar el
hecho medible: agregar al `MANIFEST` de `scripts/check-content.mjs` la
expectativa de qué rutas emiten `FAQPage`, que es la única forma de que un
cambio futuro en el conteo de preguntas no mueva el schema en silencio.

### WR-06: la regla de "mínimo dos preguntas" vive en una sola de las dos superficies que emiten `FAQPage`

**Archivo:** `src/app/preguntas-frecuentes/page.tsx:54-58`
**Problema:** esta página llama a `FaqJsonLd` sin ninguna guarda, con
`[...packageFaqItems, ...faqItems]`. Hoy son siete y no hay problema, pero
`packageFaqItems` se deriva por filtro de las secciones del módulo de contenido
y `faqItems` es un arreglo editable en `src/content/faq.ts`: los dos se
recortaron ya una vez (plan 08-19) y esta misma fase le sacó ocho secciones a la
página. El invariante que la ola 3 declaró "estructural a propósito" no protege
la superficie donde la lista es más volátil.
**Corrección:** extraer el umbral a una constante compartida y usarlo en las dos
rutas:
```tsx
// src/components/structured-data.tsx
export const FAQ_MIN_ITEMS = 2;
// en ambas páginas
{items.length >= FAQ_MIN_ITEMS && <FaqJsonLd items={items} path={...} />}
```

### WR-07: el post nuevo se publica con `intro: []` y es el único del blog sin entradilla

**Archivo:** `src/content/blog/reumatologo-o-traumatologo.ts:38`
**Problema:** `intro` está tipado como `string[]` obligatorio, así que un arreglo
vacío pasa el tipo y las cuatro compuertas. En la plantilla
(`src/app/blog/[slug]/page.tsx:99-103`) el `map` no rinde nada y la página queda
como H1 → firma → tabla de contenidos → H2, sin una sola línea que le diga al
lector de qué va el artículo antes del índice. Los otros cuatro posts abren con
dos párrafos. Además es la entradilla lo que suele alimentar el fragmento que
el buscador arma cuando ignora la meta description.
**Corrección:** escribir dos párrafos de entradilla, tomándolos del arranque de
la sección `que-es` como hacen los demás posts. Si se quiere que el modelo
impida el caso, tipar `intro: [string, ...string[]]`.

## Info

### IN-01: el umbral se expresa como literal donde el comentario habla de "dos"

**Archivo:** `src/app/servicios/[slug]/page.tsx:101`
**Problema:** seis líneas de comentario explican que el mínimo son dos preguntas
y el código dice `faqItems.length > 1`. Es correcto, pero obliga a traducir
mentalmente entre el comentario y la condición cada vez que se lee.
**Corrección:** `faqItems.length >= FAQ_MIN_ITEMS`, con la constante de WR-06.
El comentario se vuelve casi redundante, que es lo que se busca.

### IN-02: queda solapamiento de intención en `/preguntas-frecuentes` con el post nuevo

**Archivos:** `src/content/static-pages/preguntas-frecuentes.ts:47-133`,
`src/content/blog/reumatologo-o-traumatologo.ts`
**Problema:** la mudanza de texto es limpia — de los 29 párrafos largos del post
nuevo, 28 vienen literales de la versión anterior de la página, y entre las dos
páginas publicadas hoy solo se repite una cadena, el cuerpo del banner de CTA.
Pero seis encabezados que se quedaron en `/preguntas-frecuentes` siguen
apuntando a la misma pregunta que ahora es el eje del post: las cuatro del
bloque `preguntas-frecuentes--` sobre traumatólogo y reumatólogo, más
`cuando-consultar--reumatologo-especialista-en-artrosis` y
`cuando-consultar--cuando-acudir-al-traumatologo`. Las cuatro primeras son parte
del `FAQPage` de siete preguntas que la fase decidió conservar, así que están
cubiertas por la decisión; las dos de `cuando-consultar` no aparecen en ninguna
decisión. Las dos URLs siguen compitiendo por la misma consulta.
**Corrección:** decidir explícitamente si esas dos H3 se quedan. Si se quedan,
anotarlo en el módulo con la razón, como ya se hizo con el `FAQPage`.

### IN-03: comentario desactualizado sobre el conteo de posts

**Archivo:** `src/app/blog/[slug]/page.tsx:33-34`
**Problema:** dice "Hoy los cuatro slugs resuelven". Ya son cinco posts y dos de
ellos (`artrosis` y `reumatologo-o-traumatologo`) no declaran `relatedService`,
así que ni el número ni la afirmación describen el estado actual. La rama que
protege (`service &&`) sigue siendo correcta.
**Corrección:** reformular sin cifra: "los posts que declaran `relatedService`
apuntan a guías que existen; los que no, omiten el bloque".

### IN-04: los datos de `seo-tools/` siguen indexados por los dos slugs viejos

**Archivos:** `seo-tools/data/internal-links.json` (líneas 125, 139, 155, 183,
213, 227, 271, 278, 301, 322, 1172, 1175), `seo-tools/data/copy-blog.json:21`
**Problema:** están fuera del árbol de la aplicación y no afectan al sitio
publicado, pero son la entrada de las herramientas de análisis del propio
workstream. La próxima corrida va a razonar sobre dos URLs que hoy responden
308, y el conteo de enlaces internos por destino (líneas 1172-1175) quedó
repartido entre nombres que ya no existen.
**Corrección:** regenerar esos snapshots, o dejar una nota de fecha en el
archivo aclarando que son una foto anterior al renombre de la fase 16.

### IN-05: el reemplazo de la sección quirúrgica remite en prosa, no con un enlace

**Archivos:** `src/content/blog/ciatica.ts` (sección `sin-operar`),
`src/content/blog/lumbalgia.ts` (misma sección)
**Problema:** la decisión pedía "un párrafo corto que remite a
`/servicios/hernia-discal`". El párrafo dice "el detalle de cuándo se plantea
operar está desarrollado en la guía de hernia discal" en texto plano, porque
`BlogSection.paragraphs` es `string[]` y el modelo no admite enlaces en línea.
El único enlace real hacia esa guía queda en el bloque "Sigue leyendo", al final
de la página. Es una limitación del modelo de contenido, no un error del
ejecutor, pero conviene saber que la remisión no es navegable desde donde se
menciona.
**Corrección:** ninguna dentro de esta fase. Si se quiere resolver, es un cambio
de modelo (párrafos con enlaces en línea) que merece su propia decisión.

## Lo que se verificó y salió limpio

- **Anchors como interfaz.** 110 anchors en 22 destinos; ningún destino recibe
  dos etiquetas distintas en dos archivos. El criterio de la ola 5 se cumple
  literal, no aproximadamente.
- **Sin `href` repetido dentro de un mismo archivo**, lo que además evita claves
  de React duplicadas en el `map` de "Sigue leyendo"
  (`src/app/blog/[slug]/page.tsx:157`, `key={link.href}`).
- **Redirecciones.** Las cinco entradas de `next.config.ts:56-96` usan rutas
  literales sin comodín ni patrón, así que no pueden capturar más de lo previsto.
  Ningún `destination` es `source` de otra entrada: no hay cadenas ni ciclos. Los
  dos destinos nuevos resuelven a posts publicados. La afirmación del comentario
  sobre `permanent: true` emitiendo 308 es correcta para esta versión de Next.
- **Referencias colgadas.** Ningún `bannerAfterSectionId` del repo apunta a un
  `id` inexistente. Ningún enlace de fragmento apunta a los `id` retirados
  (`cirugia`, `cirugia--lumbalgia-se-opera`). Los slugs viejos no aparecen en
  `src/` ni en `scripts/`, solo en el `source` de las redirecciones, donde deben
  estar.
- **Comentarios reescritos.** En los tres scripts de compuerta el cambio es
  puramente aditivo: el razonamiento de la fase 8 (`21 + 1 + 2 − 2 = 22`) se
  conserva palabra por palabra y encima se agrega el de la fase 16
  (`22 + 1 = 23`). En `next.config.ts` el comentario de la fase 14 no se tocó. No
  se perdió información para satisfacer ningún grep.
- **`format` en el `MANIFEST`.** Retirar `format: "guia-clinica"` de
  `/preguntas-frecuentes` es coherente con el resto: `SKELETONS` solo declara
  esqueleto para `guia-clinica` y `ficha-de-sede`, y las demás rutas
  `pagina-de-servicio` tampoco declaran formato en el `MANIFEST`. Declararlo
  habría hecho fallar la compuerta con "no tiene esqueleto declarado".
- **`SHARED_LAST_MODIFIED` a `2026-08-24`.** Justificado: `/blog` es una de las
  seis rutas del grupo y su contenido publicado cambió (dos renombres y un post
  nuevo). `home.ts` y `hub-servicios.ts` también cambiaron y caen en la
  compartida por no declarar `updatedAt`, así que su fecha queda correcta.
- **Seguridad.** `JsonLdScript` (`src/components/structured-data.tsx:73-83`)
  serializa con `JSON.stringify` y escapa `<`. Todo lo que entra al `about` nuevo
  es texto del repo, no entrada de usuario. Sin superficie de inyección.

---

_Revisado: 2026-08-24_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidad: deep_
