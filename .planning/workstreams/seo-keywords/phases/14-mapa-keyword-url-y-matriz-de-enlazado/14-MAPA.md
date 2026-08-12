# Mapa keyword → URL

**Workstream:** `seo-keywords` (v1.2) · **Fase:** 14 · **Abierto en:** plan 14-02, 2026-08-11

Este documento se escribe por partes. El plan 14-02 abre la sección de las nueve URLs del
handoff, que son las que desbloquean la fase 8 de v1.1. El plan 14-03 agrega el resto del sitio y
el 14-04 agrega la matriz de enlazado.

Fuente viva: tab `Content Model` del Sheet del cliente, fila de encabezados 3. Si este documento
y el Sheet difieren, gana el Sheet.

---

## Cómo leer una fila

Cuatro campos que parecen dos y no lo son:

- **Tipo actual** es lo que la página ES hoy. **Tipo que exige la SERP** es lo que Google premia
  en el top 10 real de su keyword primaria. Cuando difieren, esa diferencia es el hallazgo, y es
  lo que justifica la acción.
- **Intención** sale del reparto del top 10 medido, no de la carpeta donde vive la página. Una
  URL bajo `/servicios/` puede tener intención informacional si su SERP responde con artículos,
  y de hecho tres la tienen. Deducir la intención de la ruta habría sido deducirla de cómo está
  archivado el sitio, que es justo lo que esta fase viene a corregir.

La evidencia de SERP viene de las 96 capturas de Lima que las fases 12 y 13 pagaron. Este plan
gastó cero búsquedas nuevas.

---

## Sección 1: las nueve URLs del handoff

| URL | Keyword primaria | Intención | Tipo actual | Tipo que exige la SERP | Acción |
|---|---|---|---|---|---|
| `/servicios/escoliosis-y-deformidades` | escoliosis | informacional | pagina-de-servicio | contenido-internacional | reescribir |
| `/servicios/hernia-discal` | hernia discal | informacional | pagina-de-servicio | contenido-internacional | reescribir |
| `/servicios/estenosis-espinal` | estenosis espinal | informacional | pagina-de-servicio | contenido-internacional | reescribir |
| `/servicios/ortopedia-infantil` | ortopedia infantil lima | transaccional | pagina-de-servicio | pagina-de-servicio | reescribir |
| `/servicios` | cirujano de columna lima | transaccional | hub-de-servicios | pagina-de-servicio | reescribir |
| `/sedes/clinica-ricardo-palma` | cirujano de columna clínica ricardo palma | transaccional | pagina-de-sede | pagina-de-servicio | reescribir |
| `/sedes/sanna-la-molina` | cirujano de columna clínica sanna | comercial | pagina-de-sede | red-social | reescribir |
| `/sedes/clinica-tezza` | ortopedia infantil clínica tezza | transaccional | pagina-de-sede | pagina-de-servicio | reescribir |
| `/sedes/consultorio-privado` | cirugía de columna surco | comercial | pagina-de-sede | otro | reescribir |

Las nueve salen `reescribir` y ninguna sale `dejar`. No es un error del cálculo: v1.1 publicó las
cuatro páginas de servicio el 2026-08-10, antes de que esta fase asignara nada (D-01), y las de
sede vienen del mismo lote. Ninguna se escribió contra una keyword asignada, así que ninguna
puede quedarse como está. `crear` no aplica a ninguna porque las nueve ya existen en el
inventario medido.

### `/servicios/escoliosis-y-deformidades`

**Renombrada desde `/servicios/escoliosis`** por decisión de Juan del 2026-08-11. El paraguas de
deformidades es donde entra `cifosis`, que tiene 3.600 de volumen con KD 3 y quedó fuera de las
10 de Oro por un punto. La redirección 301, el sitemap y los enlaces internos son trabajo de
v1.1 y están avisados en `14-HANDOFF-V11.md`.

`escoliosis` es la keyword de oro número uno: 18.000 de volumen, KD 12, 3.400 de potencial de
tráfico. **Evidencia de SERP:** el top 10 reparte 5 de contenido internacional, 1 de red social
y 1 de guía, con confianza alta. La intención medida es informacional y contradice la
clasificación por texto, que la había puesto como comercial.

Secundarias: escoliosis y deformidades de columna, ejercicios para escoliosis, cirugía de
escoliosis, escoliosis dorsal, escoliosis lumbar. Cinco ángulos distintos: el paraguas, el
tratamiento conservador, el quirúrgico y las dos localizaciones.

### `/servicios/hernia-discal`

**Evidencia de SERP:** 6 de contenido internacional y 1 de página de servicio, confianza alta.
Informacional por medición.

Secundarias: hernia discal lumbar y cervical, hernia discal lumbosacra tratamiento, ciatica o
hernia discal, hernia discal tomografía, lumbalgia o hernia discal. Las dos últimas son
diagnóstico diferencial contra dos condiciones distintas, no la misma pregunta dos veces.

### `/servicios/estenosis-espinal`

**Evidencia de SERP:** 8 de 8 contenido internacional, confianza alta. Es el reparto más
extremo de las cuatro y el que hace la decisión obvia: no hay una sola página comercial en el
top 10 al que esta URL aspira.

Secundarias: estenosis de canal, estenosis espinal: tratamientos, estenosis espinal cuidado
personal, estenosis espinal medicamentos, estenosis espinal antiinflamatorio no esteroideo. El
sinónimo clínico más cuatro ángulos de manejo.

### `/servicios/ortopedia-infantil`

La única de las cuatro que ya está en el formato correcto. **Evidencia de SERP:** 5 de página de
servicio, 2 de red social, 1 de directorio y 1 de otro, confianza alta. Transaccional por
medición. Sale `reescribir` y no `dejar` porque la página publicada no se escribió contra esta
keyword, no porque el formato esté mal.

Secundarias: traumatólogo ortopedia infantil, ortopedia infantil cerca de mí, ortopedia infantil
perú, ortopedia infantil en los olivos, pediatria ortopedia infantil.

### `/servicios`

El hub reformulado. **Desempate registrado:** dos keywords de oro apuntaban a esta misma URL,
`cirujano de columna lima` (38 puntos, puesto 9) y `cirugía mínimamente invasiva en lima` (38
puntos, puesto 10). Gana la primera por puesto en las 10 de Oro. La perdedora no se fuerza
dentro de una URL que ya sirve otra cosa: queda anotada como URL a crear y la resuelve el plan
14-03.

**Evidencia de SERP:** el top 10 de `cirujano de columna lima` premia página de servicio.

### Las cuatro sedes

Los nombres de clínica sí justifican página propia: `ricardo palma`, `sanna` y `tezza` formaron
cada uno su cluster propio de tres cabezas cuando se midió. Eso es lo contrario de los
modificadores de distrito, que comparten SERP entre sí y por eso son una página y no trece
(D-04).

Cada sede se queda solo con los términos que nombran su lugar. Sin ese filtro, el cluster de
Lima, que tiene 939 cabezas, le vuelca términos genéricos encima y la sede termina peleando
contra el hub por la misma consulta.

- **`/sedes/clinica-ricardo-palma`.** La related search `traumatólogo especialista en columna
  clínica ricardo palma` está verificada en la SERP de Lima y hoy no la responde ninguna URL del
  sitio. Su SERP exige página de servicio, no ficha de clínica.
- **`/sedes/sanna-la-molina`.** Su SERP la domina la red social, que es el caso más incómodo de
  los nueve: Google está respondiendo esa búsqueda con perfiles, no con páginas de clínica.
- **`/sedes/clinica-tezza`.** Recibe `ortopedia infantil clínica tezza` de primaria, que es el
  cruce entre la sede y la única de las cuatro condiciones que ya rankea en su formato.
- **`/sedes/consultorio-privado`.** Su SERP no tiene formato dominante claro. La primaria lleva
  modificador de distrito, `surco`, y es legítima acá porque la sede YA existe en ese distrito:
  no se está generando una URL nueva por distrito, que es lo que D-04 prohíbe.

### `/sedes`, la URL que no recibe keyword

No está entre las nueve porque no tiene keyword que asignar, y eso es la decisión, no una
omisión.

Juan decidió el 2026-08-11 que `/sedes` queda como navegación hacia las cuatro sedes, sin pelear
ningún término. Compite de frente con las cuatro páginas de sede individuales, que es exactamente
el caso de autocanibalización que MAP-02 existe para atrapar. Dejarla sin objetivo propio elimina
la canibalización de raíz y concentra la señal en las páginas de clínica.

Para MAP-05 es un nodo de enlazado puro: enlaza a las cuatro sedes y recibe enlaces desde la
home, sin anchor optimizado.

---

## Guardarraíles que este mapa respeta

- **Ninguna fusión de URLs por compartir cluster.** Se consultaron 36 veredictos de solape par a
  par contra las capturas de SERP reales y ninguno resultó fusionable. El cluster mayor de la
  fase 13 juntó 41 cabezas por transitividad y las tres que se eligieron de ahí comparten cero
  URLs entre sí medidas de a pares. Pertenecer al mismo cluster nunca autorizó nada.
- **Cero keywords excluidas.** Ninguna marca de competidor perfilado ni código CIE-10 quedó como
  primaria ni como secundaria (D-10).
- **Cero secundarias inventadas.** Cuando una URL no llega a tres ángulos distintos, el asignador
  falla en vez de rellenar. Contar cinco cadenas de texto es trivial y contar cinco ángulos no,
  así que la deduplicación compara conjuntos de palabras y no solo subcadenas.

## Keywords de oro todavía sin URL

Siete de las 10 de Oro no encontraron URL en este lote y quedan para el plan 14-03: `artrosis`,
`cirugía mínimamente invasiva en lima`, `ciática`, `estenosis de canal en lima`, `hernia discal
lumbar y cervical en lima`, `lumbalgia` y `traumatología lima`.

---

## Secciones pendientes

- **Sección 2: el resto de las URLs vivas.** Home, cuatro posts de blog, institucionales y de
  conversión. Plan 14-03.
- **Sección 3: canibalización.** Incluye el choque entre los posts del blog y las páginas de
  servicio que ahora se van a formato informativo. Plan 14-03.
- **Sección 4: matriz de enlazado.** Plan 14-04. Se propone, no se implementa.
