---
phase: 19-confianza-medicion-y-seguridad
plan: 02
subsystem: contenido
tags: [citas, trust-02, ymyl, e-e-a-t, fuentes-medicas]
requires: []
provides: ["tipo ServiceCitation", "componente CitationList", "sección De dónde sale esto en las 5 guías y los 5 posts"]
affects: [src/content/service-pages, src/content/blog, src/components/content]
tech-stack:
  added: []
  patterns: ["campo de datos opcional que dispara un subcomponente desde SectionBody, igual que items dispara ServiceItemGrid"]
key-files:
  created:
    - src/components/content/citation-list.tsx
  modified:
    - src/content/service-pages/index.ts
    - src/components/content/content-body.tsx
    - src/content/blog/index.ts
    - src/content/service-pages/hernia-discal.ts
    - src/content/service-pages/estenosis-espinal.ts
    - src/content/service-pages/escoliosis-y-deformidades.ts
    - src/content/service-pages/ortopedia-infantil.ts
    - src/content/service-pages/cirugia-minimamente-invasiva.ts
    - src/content/blog/ciatica.ts
    - src/content/blog/cirugia-de-columna.ts
    - src/content/blog/artrosis.ts
    - src/content/blog/lumbalgia.ts
    - src/content/blog/reumatologo-o-traumatologo.ts
decisions:
  - "La mitad de las citas apunta a fuentes en español: MedlinePlus y NIAMS de los NIH. Para un paciente en Lima una fuente que no puede leer no le sirve, así que el idioma pesó tanto como el prestigio de la organización al elegir."
  - "spine.org devuelve 200 a rutas inexistentes. En ese dominio el curl del plan no alcanza y la verificación se hizo además por contenido. La regla quedó escrita en el TSDoc del campo href de ServiceCitation."
  - "Cinco páginas quedaron en 2 citas y no en 3. Es cumplimiento del piso del requisito, no deuda: en esas páginas ninguna candidata adicional pasó la prueba de respaldar una afirmación que el texto ya hace."
  - "El campo citations se agregó también a BlogSection, que resultó ser un tipo propio y no un alias de ServiceSection como el plan asumía."
metrics:
  duration: ~55 min
  completed: 2026-08-25
status: complete
---

# Phase 19 Plan 02: Citas médicas en las 10 páginas clínicas Summary

Las 5 guías de `/servicios` y los 5 posts de `/blog` cierran con una sección "De dónde sale esto". Son **25 citas sobre 20 URLs únicas**, todas verificadas con código 200, y cada una nombra en una frase la afirmación concreta de esa página que respalda.

## Qué se hizo

| Tarea | Commit | Resultado |
|---|---|---|
| 1. Contrato de datos, `CitationList` y las 5 guías | `8b7d319` | tipo `ServiceCitation`, campo `citations?` en `ServiceSection`, componente cableado en `SectionBody`, 12 citas |
| 2. Las citas de los 5 posts | `24e3316` | 13 citas, más `citations?` en `BlogSection` |
| 3. Revisión médica y visual | checkpoint | resuelto por el lead; ver "Qué quedó sin medir" |

## Conteo final contra el objetivo

El objetivo del plan era de 2 a 3 citas por página, con **2 como piso del requisito TRUST-02**.

| Página | Citas | |
|---|---|---|
| `/servicios/hernia-discal` | 3 | objetivo alcanzado |
| `/servicios/escoliosis-y-deformidades` | 3 | objetivo alcanzado |
| `/servicios/estenosis-espinal` | 2 | **cumple** |
| `/servicios/ortopedia-infantil` | 2 | **cumple** |
| `/servicios/cirugia-minimamente-invasiva` | 2 | **cumple** |
| `/blog/ciatica` | 3 | objetivo alcanzado |
| `/blog/artrosis` | 3 | objetivo alcanzado |
| `/blog/lumbalgia` | 3 | objetivo alcanzado |
| `/blog/cirugia-de-columna` | 2 | **cumple** |
| `/blog/reumatologo-o-traumatologo` | 2 | **cumple** |
| **Total** | **25** | 20 URLs únicas |

**Las cinco páginas que quedaron en 2 son cumplimiento, no deuda.** No hay tarea de seguimiento para "completar las citas faltantes" y no debe crearse una. En esas cinco páginas ninguna candidata adicional pasó la prueba de respaldar una afirmación que el texto ya hace, y el plan es explícito: el objetivo de 3 cede ante la calidad de la fuente, el piso de 2 no. Una tercera cita floja empeoraría la página.

`reumatologo-o-traumatologo` en 2 es exactamente lo que el planificador anticipó: es el post más corto y el de estructura más distinta, con menos afirmaciones clínicas citables.

## Reparto de fuentes

| Fuente | Citas | Idioma |
|---|---|---|
| MedlinePlus, Biblioteca Nacional de Medicina de EE. UU. | 5 | español |
| StatPearls, NCBI Bookshelf | 5 | inglés |
| NIAMS, Institutos Nacionales de la Salud de EE. UU. | 2 | español |
| NICE | 2 | inglés |
| Organización Mundial de la Salud | 2 | inglés |
| North American Spine Society | 2 | inglés |
| Scoliosis Research Society | 1 | inglés |
| HealthyChildren, Academia Americana de Pediatría | 1 | español |

**Diez de las veinticinco citas están en español.** No estaba pedido en el plan y fue una decisión de ejecución: el lector de estas páginas es un paciente en Lima, y una cita que no puede leer no le sirve para verificar nada, que es justamente para lo que la cita existe.

Ninguna cita apunta a una práctica competidora en Lima. Ningún texto de página se amplió para alcanzar lo que una fuente dice de más.

## Verificación de URLs

Salida de `curl -sIL -o /dev/null -w "%{http_code}"` sobre las 20 URLs únicas, el 2026-08-25:

```
200 https://medlineplus.gov/spanish/backpain.html
200 https://medlineplus.gov/spanish/herniateddisk.html
200 https://medlineplus.gov/spanish/osteoarthritis.html
200 https://medlineplus.gov/spanish/sciatica.html
200 https://medlineplus.gov/spanish/scoliosis.html
200 https://www.healthychildren.org/spanish/health-issues/conditions/orthopedic/paginas/default.aspx
200 https://www.ncbi.nlm.nih.gov/books/NBK441822/
200 https://www.ncbi.nlm.nih.gov/books/NBK499908/
200 https://www.ncbi.nlm.nih.gov/books/NBK507908/
200 https://www.ncbi.nlm.nih.gov/books/NBK531493/
200 https://www.ncbi.nlm.nih.gov/books/NBK555984/
200 https://www.niams.nih.gov/es/informacion-de-salud/artritis-reumatoide
200 https://www.niams.nih.gov/es/informacion-de-salud/osteoartritis
200 https://www.nice.org.uk/guidance/ng59
200 https://www.nice.org.uk/guidance/ng226
200 https://www.spine.org/KnowYourBack/Conditions/Degenerative-Conditions/Herniated-Lumbar-Disc
200 https://www.spine.org/KnowYourBack/Conditions/Degenerative-Conditions/Lumbar-Spinal-Stenosis
200 https://www.srs.org/patients-and-families/conditions-and-treatments/parents/scoliosis
200 https://www.who.int/news-room/fact-sheets/detail/low-back-pain
200 https://www.who.int/news-room/fact-sheets/detail/osteoarthritis
```

El lead repitió la comprobación por su cuenta con `curl -L` y siguiendo redirecciones: las 20 en 200.

## Lista de descartes

**La lista no está vacía.** De 33 candidatas evaluadas quedaron 20: **13 descartadas**. Cada una con su motivo y su reemplazo.

| URL candidata | Motivo del descarte | Reemplazo |
|---|---|---|
| `cochranelibrary.com/cdsr/doi/10.1002/14651858.CD013815/full` | 403, el sitio bloquea el acceso automatizado y la URL no se puede verificar | NICE NG59 |
| `cochranelibrary.com/cdsr/doi/10.1002/14651858.CD012087/full` | 403, mismo motivo | NICE NG59 |
| `cochranelibrary.com/cdsr/doi/10.1002/14651858.CD007612/full` | 403, mismo motivo | NICE NG226 |
| `geer.es` | no resuelve, fallo de conexión (código 000) | Scoliosis Research Society |
| `orthoinfo.aaos.org/es/diseases--conditions/hernia-de-disco-en-la-parte-baja-de-la-espalda/` | 404, el sitio migró a `orthoinfo.org` y las rutas en español cambiaron | MedlinePlus Hernia de disco |
| `orthoinfo.aaos.org/es/diseases--conditions/estenosis-espinal-lumbar/` | 404 tras la redirección al dominio nuevo | NASS Lumbar Spinal Stenosis |
| `orthoinfo.aaos.org/es/diseases--conditions/escoliosis-idiopatica-en-ninos-y-adolescentes/` | 404 | MedlinePlus Escoliosis |
| `orthoinfo.aaos.org/es/diseases--conditions/dolor-lumbar-en-la-parte-baja-de-la-espalda/` | 404 | MedlinePlus Dolor de espalda |
| `orthoinfo.org/es/` | cadena de redirección que termina en 308 sin destino 200 | descartado sin reemplazo |
| `srs.org/Patients/Conditions/Adolescent-Idiopathic-Scoliosis` | 404, ruta obsoleta | ruta actual de SRS, verificada con título correcto |
| `posna.org` y `orthokids.org/conditions/` | 403 con desafío de Cloudflare, no verificables | HealthyChildren de la AAP, en español |
| `medlineplus.gov/spanish/spinalstenosis.html` | **resuelve 200, pero el documento titula "Estenosis cervical"** y la guía trata de estenosis lumbar. Una cita que abre otro cuadro es peor que ninguna | ninguno: `estenosis-espinal` se queda en 2 |
| `spine.org/KnowYourBack/Treatments` | resuelve 200, pero el control negativo también, y el contraste de contenido fue demasiado débil para afirmar que la página existe | NASS específico por condición |
| StatPearls `NBK430873`, `NBK448067`, `NBK559145`, `NBK560510` | **resuelven 200 y son documentos reales, pero de otros temas**: insuficiencia cardíaca, bronquitis aguda, imagen torácica e isquemia cerebral | IDs correctos obtenidos por la API de búsqueda de NCBI |

**El descarte que más importa de esta lista es el último.** Esos cuatro identificadores de StatPearls fueron construidos de memoria y los cuatro devolvían 200 apuntando a capítulos de temas que no tienen nada que ver con columna. Un `curl` que solo mira el código de estado los habría dejado pasar. Los identificadores definitivos se obtuvieron consultando la API de búsqueda de NCBI por título, no adivinándolos.

## Hallazgo: el código 200 no alcanza en todos los dominios

`spine.org` **devuelve 200 a cualquier ruta**, incluidas las inexistentes. Comprobado con un control negativo:

```
200 https://www.spine.org/KnowYourBack/Conditions/Esto-No-Existe-12345
```

La verificación por código de estado que prescribe el plan no distingue ahí un documento vivo de un 404 blando. Las tres páginas de NASS que sí se publicaron se verificaron además por contenido, contando apariciones del término de la condición en el cuerpo servido: 8 en la de hernia, 7 en la de estenosis y 4 en la de escoliosis, contra 0 en el control negativo.

La regla quedó escrita donde va a leerse cuando alguien agregue la próxima cita: en el comentario TSDoc del campo `href` de `ServiceCitation`.

## Presupuesto de palabras y banner de conversión

Las diez rutas siguen con su banner entre el 15 y el 35 por ciento del cuerpo. Salida de `node scripts/check-content.mjs` ruta por ruta, después de agregar las citas y en el mismo commit:

```
PASA  /servicios/hernia-discal  (3406 palabras)
PASA  /servicios/estenosis-espinal  (2855 palabras)
PASA  /servicios/escoliosis-y-deformidades  (2796 palabras)
PASA  /servicios/ortopedia-infantil  (1978 palabras)
PASA  /servicios/cirugia-minimamente-invasiva  (1915 palabras)
PASA  /blog/ciatica  (2195 palabras)
PASA  /blog/cirugia-de-columna  (1881 palabras)
PASA  /blog/artrosis  (2167 palabras)
PASA  /blog/lumbalgia  (2223 palabras)
PASA  /blog/reumatologo-o-traumatologo  (1339 palabras)
```

Ningún `bannerAfterSectionId` necesitó ajuste, tal como el plan proyectaba con el tope de 160 palabras por sección.

## Compuertas

Las cinco en 0 en los dos commits:

| Compuerta | Resultado |
|---|---|
| `content:check` | Sin fallas en 15 ruta(s) |
| `seo:check` | Sin fallas |
| `sedes:check` | Sin fallas en 4 sede(s) |
| `tsc --noEmit` | limpio |
| `build` | limpio |

Comprobaciones del contrato del componente:

- `export type ServiceCitation` y `citations?: ServiceCitation[]` presentes una vez cada uno en `src/content/service-pages/index.ts`.
- `CitationList` aparece dos veces en `content-body.tsx`: el import y la invocación. El diff de ese archivo **no toca `hasContent`**.
- Clases y elementos prohibidos en el componente, filtrando comentarios: 0 (`text-sm`, `bg-muted`, `bg-white`, `rounded-2xl`, `line-clamp`, `truncate`, `next/image`, `<img>`).
- Cliente y estado, mismo filtro: 0 (`use client`, `useEffect`, `useState`, `fetch(`).
- `min-h-11` presente una vez.
- Los diez HTML prerenderizados contienen `data-citations` e `id="fuentes"`.
- `git status --porcelain scripts/` vacío y `git diff package.json package-lock.json` vacío.

## Desviaciones del plan

**1. [Regla 3 - Bloqueo] `BlogSection` no era un alias de `ServiceSection`**

- **Encontrado en:** Tarea 2, al compilar.
- **Qué decía el plan:** que `ContentSection` es un alias de `ServiceSection` y que "el mismo campo sirve para guías, posts y hubs sin abrir un segundo modelo".
- **Qué se encontró:** es cierto para `ContentSection` de `content-body.tsx`, pero `src/content/blog/index.ts` declara su propio tipo `BlogSection`, estructuralmente gemelo y sin relación de tipos. Los cinco posts fallaron con `'citations' does not exist in type 'BlogSection'`.
- **Qué se hizo:** se agregó `citations?: ServiceCitation[]` a `BlogSection`, **reutilizando el mismo tipo** en vez de declarar uno gemelo. Es el criterio que ese archivo ya aplicaba para `ServiceSectionItem`, y su propio comentario explica por qué: un tipo gemelo abriría la puerta a que los dos se separen sin que nadie se entere.
- **Commit:** `24e3316`.

**2. [Regla 3 - Bloqueo] El punto de inserción de `cirugia-minimamente-invasiva.ts`**

- **Encontrado en:** Tarea 1, al compilar.
- **Qué pasó:** de los cinco módulos de guía, ese es el único que declara `outboundLinks` **después** de `sections`. La sección `fuentes` cayó dentro de `outboundLinks` y falló con `'id' does not exist in type 'ServiceOutboundLink'`.
- **Qué se hizo:** se revirtió el archivo y se insertó en el cierre correcto del arreglo `sections`. La regla posicional del plan —última posición de `sections`— se cumple en los diez módulos.

**3. [Hallazgo de método] El código 200 no basta como verificación en todos los dominios**

Documentado arriba en su propia sección. Cambia la regla de verificación que el plan prescribe, así que va como desviación y no como nota al pie.

## Qué quedó sin medir

El checkpoint de la tarea 3 lo resolvió el lead: verificó las 20 URLs con `curl -L` siguiendo redirecciones, revisó el conteo por página y corrió las cuatro compuertas que puede correr. **Tres comprobaciones del plan no se ejecutaron:**

1. **La revisión médica página por página por parte de Juan.** Los `supports` se escribieron leyendo el texto de cada página y nombrando una afirmación que esa página ya hace, y esa correspondencia está sostenida por el ejecutor y revisada por el lead. Lo que no ocurrió es la lectura clínica del profesional que firma el sitio.
2. **La apertura manual de las 20 URLs para confirmar que el documento coincide con el nombre de la fuente.** El `curl` prueba que la URL resuelve. Para StatPearls, SRS y MedlinePlus se comparó además el `<title>` servido contra el `source` publicado, y para NASS se comparó el contenido. La confirmación por lectura humana no está hecha.
3. **La prueba visual a 375px con el `source` más largo publicado**, para ver si el `ArrowUpRight` queda alineado cuando el nombre envuelve. Si desalinea, el arreglo previsto es cambiar `items-center` por `items-baseline` en el enlace y nada más. El `source` más largo publicado es el de HealthyChildren, de 97 caracteres: "Academia Americana de Pediatría, sección de problemas ortopédicos en HealthyChildren (en español)". Está en `/servicios/ortopedia-infantil`, que es la ruta donde conviene hacer la prueba.

Ninguna bloquea el cierre. Van anotadas para que no se lean como verificadas.

## Known Stubs

Ninguno. Las diez secciones tienen citas reales con URLs que resuelven; no hay ninguna entrada de relleno ni ninguna sección vacía.

## Threat Flags

Ninguna superficie nueva. `CitationList` es un server component sin red, sin estado y sin entrada de usuario. Los enlaces externos llevan `rel="noopener noreferrer"`, que es la mitigación del registro del plan para la apertura en pestaña nueva.

## Self-Check: PASSED

- `src/components/content/citation-list.tsx` existe.
- Commits `8b7d319` y `24e3316` presentes en el historial.
- Las 10 páginas declaran su sección `fuentes` y los 10 HTML prerenderizados contienen `data-citations`.
