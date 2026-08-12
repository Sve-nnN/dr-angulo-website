# Handoff a v1.1: keyword asignada por URL

**De:** workstream `seo-keywords` (v1.2), fase 14, plan 14-02
**Para:** workstream `milestone` (v1.1), fase 8
**Fecha:** 2026-08-11
**Estado:** publicado y vivo en el Sheet del cliente

Este documento se lee solo. No hace falta abrir ningún otro archivo del workstream
`seo-keywords` para actuar sobre lo que dice acá.

---

## Lo primero, porque rompe enlaces si se descubre tarde

**`/servicios/escoliosis` se renombra a `/servicios/escoliosis-y-deformidades`.**

Decisión de Juan del 2026-08-11. La URL pasa a cubrir escoliosis y el resto de deformidades de
columna bajo un solo paraguas, en vez de escoliosis sola. El motivo concreto: `cifosis` tiene
3.600 de volumen con KD 3, el doctor la opera, y quedó fuera de las 10 de Oro por un punto. El
paraguas es donde entra sin necesidad de una URL propia.

Lo que arrastra, y es trabajo de v1.1:

1. Redirección 301 de `/servicios/escoliosis` a `/servicios/escoliosis-y-deformidades`.
2. Sitemap.
3. Los enlaces internos ya escritos que apunten al slug viejo.

El mapa entero, el Sheet del cliente y todo lo que sigue en este documento usan el slug nuevo.

---

## Las nueve URLs con su keyword

`Tipo que exige la SERP` no es una opinión de formato: es lo que Google ya premia en el top 10
real de esa keyword, clasificado sobre las 96 capturas de SERP de Lima que la fase 12 pagó.
Cuando difiere de lo que la página es hoy, esa diferencia es el motivo de la reescritura.

| URL | Keyword primaria | Intención medida | Tipo que exige la SERP | Acción |
|---|---|---|---|---|
| `/servicios/escoliosis-y-deformidades` | escoliosis | Informacional | Guía clínica larga | Reescribir |
| `/servicios/hernia-discal` | hernia discal | Informacional | Guía clínica larga | Reescribir |
| `/servicios/estenosis-espinal` | estenosis espinal | Informacional | Guía clínica larga | Reescribir |
| `/servicios/ortopedia-infantil` | ortopedia infantil lima | Transaccional | Página de servicio | Reescribir |
| `/servicios` | cirujano de columna lima | Transaccional | Página de servicio | Reescribir |
| `/sedes/clinica-ricardo-palma` | cirujano de columna clínica ricardo palma | Transaccional | Página de servicio | Reescribir |
| `/sedes/sanna-la-molina` | cirujano de columna clínica sanna | Comercial | Perfil o ficha | Reescribir |
| `/sedes/clinica-tezza` | ortopedia infantil clínica tezza | Transaccional | Página de servicio | Reescribir |
| `/sedes/consultorio-privado` | cirugía de columna surco | Comercial | Sin formato dominante | Reescribir |

Las secundarias, de tres a cinco por URL:

| URL | Secundarias |
|---|---|
| `/servicios/escoliosis-y-deformidades` | escoliosis y deformidades de columna, ejercicios para escoliosis, cirugía de escoliosis, escoliosis dorsal, escoliosis lumbar |
| `/servicios/hernia-discal` | hernia discal lumbar y cervical, hernia discal lumbosacra tratamiento, ciatica o hernia discal, hernia discal tomografía, lumbalgia o hernia discal |
| `/servicios/estenosis-espinal` | estenosis de canal, estenosis espinal: tratamientos, estenosis espinal cuidado personal, estenosis espinal medicamentos, estenosis espinal antiinflamatorio no esteroideo |
| `/servicios/ortopedia-infantil` | traumatólogo ortopedia infantil, ortopedia infantil cerca de mí, ortopedia infantil perú, ortopedia infantil en los olivos, pediatria ortopedia infantil |
| `/servicios` | traumatología especialista en columna, mejor neurocirujano de columna lima, cirujano de columna cerca de mí, traumatólogo de columna, cirugía de columna cerca de mí |
| `/sedes/clinica-ricardo-palma` | ortopedia infantil clínica ricardo palma, traumatólogo clínica ricardo palma, clínica ricardo palma traumatología, mejor traumatólogo de la clínica ricardo palma, cirugía de columna san isidro |
| `/sedes/sanna-la-molina` | ortopedia infantil clínica sanna, traumatólogo clínica sanna, cirugía de columna clínica sanna, neurocirujano clínica sanna, cirugía de columna la molina |
| `/sedes/clinica-tezza` | cirujano de columna clínica tezza, traumatólogo clínica tezza, neurocirujano clínica tezza, cirugía de columna clínica tezza, ortopedia clínica tezza |
| `/sedes/consultorio-privado` | ortopedia surco, cirujano de columna surco, neurocirujano surco, ortopedia infantil surco, traumatología surco |

Ninguna de las nueve comparte keyword primaria con otra. Eso se verificó, no se supone.

---

## Por qué las tres páginas de servicio dicen "guía clínica" y no "página de servicio"

Es el hallazgo que más cambia el trabajo de v1.1, así que va con el dato crudo. Clasificando el
top 10 real de cada búsqueda:

| Keyword | Reparto del top 10 |
|---|---|
| `estenosis espinal` | 8 de 8 contenido informativo internacional |
| `hernia discal` | 6 informativo, 1 página de servicio |
| `escoliosis` | 5 informativo, 1 red social, 1 guía |
| `ortopedia infantil lima` | 5 página de servicio, 2 red social, 1 directorio, 1 otro |

A `estenosis espinal` Google le responde con ocho de ocho artículos informativos. Una página
comercial no compite ahí, por bien hecha que esté. `ortopedia infantil` es la única de las cuatro
que ya está en el formato correcto, y es justo la que la fase 13 había marcado como la más
ganable.

**Decisión de Juan del 2026-08-11:** las tres se reescriben como guía clínica. Cuerpo informativo
largo, con el CTA de consulta integrado dentro del contenido en vez de ser el eje de la página.

La alternativa era mover el objetivo a la variante geográfica (`... en lima`), que salía más
barata y dejaba el techo de tráfico mucho más abajo. `escoliosis` sola vale 18.000 de volumen y
3.400 de potencial de tráfico.

---

## `/sedes` no recibe keyword, y es a propósito

`/sedes` existe, está viva y ningún documento de planificación la contemplaba. Compite de frente
con las cuatro páginas de sede individuales.

**Decisión de Juan del 2026-08-11: queda como navegación hacia las cuatro sedes, sin pelear
ningún término.** Elimina la canibalización de raíz y concentra toda la señal en las páginas de
clínica, que son las que formaron clusters propios y limpios cuando se midió.

Esto no es un hueco del mapa. Es la decisión, y por eso `/sedes` no aparece entre las nueve filas
de arriba: no tiene keyword que asignar. Enlaza a las cuatro sedes y recibe enlaces desde la
home, sin anchor optimizado.

---

## Dónde leer esto en el documento del cliente

Google Sheet del proyecto, tab **`Content Model`**, fila de encabezados 3. Las nueve URLs están
publicadas ahí con las columnas `URL`, `Keyword`, `Intent`, `Type`, `New/Existing`, `Cluster`,
`Action` y `Leave, Update, or Bin?` llenas.

Las tres columnas cuyo encabezado nombra a Ahrefs (`Volume (Ahrefs)`, `Traffic Potential
(Ahrefs)`, `KD Difficulty (Ahrefs)`) quedan **vacías a propósito** en esas nueve filas y no se
tocan desde este workstream.

El Sheet es la fuente viva. Si este documento y el Sheet difieren, gana el Sheet.

---

## Lo que este handoff NO resuelve

Para que la fase 8 no espere por algo que no va a llegar de acá:

- **El copy no está escrito.** La redacción de las páginas es de la fase 15 de este workstream.
  Acá está qué keyword pelea cada URL, no con qué palabras.
- **Los enlaces internos no están definidos.** La matriz de enlazado sale del plan 14-04. Este
  documento no dice qué página enlaza a cuál.
- **La matriz se propone, no se implementa.** Cuando salga, los enlaces los escribe v1.1 en el
  código. Este workstream no toca `src/`.
- **Las otras doce URLs vivas del sitio todavía no tienen keyword.** Home, blog, institucionales
  y de conversión se resuelven en el plan 14-03. Si la fase 8 necesita alguna antes, hay que
  pedirla.
- **Los cuatro posts del blog van a chocar con estas guías.** `estenosis-espinal-que-es` y
  `hernia-discal-o-dolor-de-espalda-como-diferenciarlos` nombran las mismas condiciones que dos
  de las páginas que ahora se van a formato informativo. Post y página van a competir por la
  misma intención. Se resuelve en el plan 14-03: o el post se funde con la guía, o toma otro
  ángulo, o redirige. **Conviene no escribir enlaces nuevos entre esos posts y esas páginas
  hasta que salga.**

## Una restricción que sigue vigente

El copy médico entra bajo la restricción YMYL del proyecto: solo lo verificado, sin afirmar
credenciales, cifras ni resultados. Vale también para las tres guías clínicas nuevas, que por
ser largas dan mucho más espacio para afirmar de más.
