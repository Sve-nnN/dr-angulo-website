---
phase: 14-mapa-keyword-url-y-matriz-de-enlazado
workstream: seo-keywords
verified: 2026-08-12T13:56:46Z
status: passed
score: 5/5 criterios de éxito verificados (los dos gaps se cerraron en el plan 14-05)
behavior_unverified: 0
overrides_applied: 0
requirements:
  MAP-01: satisfecho
  MAP-02: satisfecho
  MAP-03: satisfecho
  MAP-04: satisfecho
  MAP-05: satisfecho
  SHEET-02: satisfecho
  SHEET-04: satisfecho
  SHEET-05: satisfecho
gaps_cerrados:  # los dos se cerraron en el plan 14-05; se conservan con su evidencia original
  - truth: "SC-5 / SHEET-02: el tab Content Model tiene una fila por URL con keyword, intención, tipo, cluster, métricas y la acción recomendada"
    resolucion: cerrado_en_14-05
    reason: >-
      Todas las cláusulas se cumplen salvo `métricas`. Las seis columnas de métrica del tab
      (`Organic Clicks (GSC)`, `Organic Impressions (GSC)`, `Volume (Ahrefs)`,
      `Traffic Potential (Ahrefs)`, `KD Difficulty (Ahrefs)`, `Position`) están vacías en las
      24 filas del documento vivo. Las de GSC lo están con razón, porque el sitio no acumuló
      impresiones. Las tres de Ahrefs quedaron vacías por D-13, decisión heredada de J-1 de la
      fase 12, cuando el único volumen disponible era de DinoRank y escribirlo bajo un
      encabezado que dice Ahrefs habría sido etiquetar mal el dato. Ese motivo dejó de aplicar
      en la fase 13: `data/ahrefs-keywords.jsonl` trae valores con `volumeFuente: "ahrefs"` para
      10 de las 16 primarias y `keywordDifficultyFuente: "ahrefs"` para 7. D-13 se arrastró sin
      revisarse contra el dato nuevo.
    artifacts:
      - path: "seo-tools/src/phase14/cm-push.ts"
        issue: "Los registros no llevan campo para las tres columnas (Ahrefs) por D-13, así que nunca se escriben."
      - path: "Google Sheet, tab `Content Model`"
        issue: "0 de 24 celdas con valor en las seis columnas de métrica."
    missing:
      - "Decidir con Juan: llenar `Volume (Ahrefs)`, `Traffic Potential (Ahrefs)` y `KD Difficulty (Ahrefs)` desde `data/ahrefs-keywords.jsonl` sólo donde la fuente diga literalmente `ahrefs`, o registrar un override que estreche SHEET-02 y SC-5 dejando por escrito que la fase entrega el mapa sin métricas."
      - "Si se llenan: dejar las celdas sin dato vacías en vez de escribir `no_consultado`, para no ensuciar el documento del cliente."
  - truth: "Los documentos entregables declaran las cifras que el dataset sostiene"
    resolucion: cerrado_en_14-05
    reason: >-
      `14-CANIBALIZACION.md` dice dos veces que el mapa asigna 18 keywords primarias. El dataset
      asigna 16. Es un error de prosa en un entregable, no del cruce: `cannibalization.json`
      reporta 120 pares comparados, que es exactamente C(16,2), así que la medición se hizo sobre
      16 y sólo el texto quedó desalineado.
    artifacts:
      - path: ".planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-CANIBALIZACION.md"
        issue: "Líneas 21 y 126: «18 keywords primarias» y «las 18 asignaciones de este mapa». Son 16."
      - path: ".planning/workstreams/seo-keywords/REQUIREMENTS.md"
        issue: "Línea 130, MAP-01 sigue diciendo «las 18 URLs mapeables» aunque el inventario medido en 14-01 encontró 20 y lo dejó reconciliado en `url-inventory.json`. El texto del requisito nunca se enmendó."
    missing:
      - "Corregir 18 → 16 en las dos líneas de `14-CANIBALIZACION.md`."
      - "Enmendar el texto de MAP-01 en `REQUIREMENTS.md` para que diga 20 mapeables medidas, con la nota de reconciliación, igual que ya hace la tabla de trazabilidad."
human_verification:
  - test: "Abrir el tab `Content Model` y decidir si las tres columnas `(Ahrefs)` se llenan con el dato real de la fase 13 o si SHEET-02 se estrecha por override."
    expected: "Una de las dos: las columnas con volumen, KD y traffic potential donde la fuente es `ahrefs`, o un override escrito en este archivo con motivo y fecha."
    why_human: "Es una decisión de alcance sobre el documento del cliente, y D-13 fue una decisión de Juan. Ningún chequeo automático puede tomarla."
  - test: "Revisar que el mapa propuesto refleja el criterio clínico del doctor antes de que la fase 15 escriba copy sobre él."
    expected: "Las 16 primarias y las acciones (reescribir, crear, redirigir) aprobadas, marcando `Approved?` en `Canonical Audit`."
    why_human: "Las 24 filas de `Canonical Audit` tienen `Approved?` en «No»: el cliente todavía no respondió. Es lo esperado al cerrar la fase, pero la fase 15 arranca sobre un mapa sin aprobar."
---

# Fase 14: Mapa keyword → URL y matriz de enlazado — Reporte de verificación

**Objetivo de la fase:** Cada URL del sitio, existente o planificada, sabe por qué keyword pelea
y cómo se enlaza con las demás, y las nueve URLs que v1.1 todavía no escribió reciben su keyword
antes de que alguien empiece a redactarlas.

**Verificado:** 2026-08-12T13:56:46Z
**Estado:** gaps_found
**Re-verificación:** No, es la verificación inicial.

## Veredicto en una línea

El objetivo de la fase se cumple. El mapa existe, es completo, sostiene sus propios invariantes
bajo medición independiente, y las nueve URLs del handoff tienen su keyword publicada en el
documento del cliente. Lo que falta es una cláusula de SC-5 que nadie reconcilió: el tab
`Content Model` no lleva ni una métrica, y para tres de esas columnas el dato existe desde la
fase 13.

## Cómo se verificó

Nada de lo que sigue sale de los SUMMARY. Todo se volvió a correr o a medir contra el dataset y
contra el documento vivo del cliente:

- Los cuatro datasets se cruzaron entre sí con lecturas propias, no con los contadores que
  reporta el código de la fase.
- Los tres tabs se leyeron del Sheet real en modo sólo lectura, con la fila de encabezados
  detectada por la columna `URL` y no asumida.
- La idempotencia se comprobó volviendo a correr los tres cargadores en ensayo, que es la única
  forma de ver si una recarga inserta filas sin escribir nada.
- El suite entero y el typecheck se corrieron una vez.

## Logro del objetivo

### Verdades observables (criterios de éxito del ROADMAP)

| # | Verdad | Estado | Evidencia |
|---|---|---|---|
| 1 | Las URLs mapeables tienen exactamente una keyword primaria y de tres a cinco secundarias | ✓ VERIFICADO | `url-map.jsonl`: 24 filas, 16 con primaria, cada una distinta, y las 16 con entre 3 y 5 secundarias (medido: ninguna fuera de rango). Las 8 sin primaria llevan `motivoSinPrimaria` escrito y `esPaginaSeo: false`, que es la decisión aceptada de 14-03. El inventario medido (`url-inventory.json`) reconcilió 20 mapeables contra las 18 que suponía el roadmap y dejó registrada la diferencia. |
| 2 | Ninguna keyword primaria está asignada a dos URLs | ✓ VERIFICADO | Cero primarias duplicadas sobre las 16. Además, cruce propio: cero secundarias que sean primaria de otra URL, y sólo 2 secundarias compartidas entre dos URLs, ambas entre `/` y una hija suya. `cannibalization.json`: 120 pares comparados —exactamente C(16,2)—, 0 conflictos. La deuda D-1 está fechada al 2026-11-11 y registrada en `deferred-items.md`. |
| 3 | Las nueve URLs que aún no existen tienen su keyword primaria y secundarias publicadas en el Sheet | ✓ VERIFICADO | Las nueve están en el tab `Content Model` del documento vivo, leídas hoy: las cuatro de servicio, las cuatro de sede y el hub `/servicios`, con `Keyword`, `Intent`, `Type`, `Cluster`, `Action` y `Leave, Update, or Bin?` llenas. `14-HANDOFF-V11.md` existe y es autocontenido. |
| 4 | Cada asignación declara qué tipo de página exige la SERP y qué hacer con la URL | ✓ VERIFICADO | `tipoExigidoPorSerp` presente en las 16 que compiten; `accion` presente en las 24, con los cuatro valores reales en uso: reescribir, dejar, crear, redirigir. Las 8 sin primaria no llevan tipo exigido porque no pelean ninguna SERP, que es coherente con su motivo escrito. |
| 5 | Los tres tabs tienen una fila por URL con keyword, intención, tipo, cluster, **métricas**, acción, canonical y hasta ocho enlaces con anchor; recargarlos no duplica filas | ✗ PARCIAL | Todo verificado salvo `métricas`. Ver la sección siguiente. |

**Puntaje:** 4/5 criterios verificados.

### El detalle de SC-5

| Cláusula | Estado | Evidencia medida en el documento vivo |
|---|---|---|
| Una fila por URL en `Content Model` | ✓ | 24 filas de datos, 0 URLs duplicadas |
| Una fila por URL en `Canonical Audit` | ✓ | 24 filas, 0 duplicadas |
| Una fila por URL en `Internal Linking Audit` | ✓ | 22 filas, 0 duplicadas; las 2 que faltan son los posts que redirigen, excluidos a propósito |
| keyword | ✓ | 24/24 con valor; las 8 que no compiten escriben «Sin keyword primaria (decisión)» en vez de dejar la celda en blanco |
| intención | ✓ | 24/24 |
| tipo | ✓ | 24/24 |
| cluster | ✓ | 16/24, que son exactamente las 16 que compiten |
| **métricas** | ✗ | **0/24 en las seis columnas de métrica** |
| acción recomendada | ✓ | 24/24 en `Action` y en `Leave, Update, or Bin?` |
| canonical propuesto | ✓ | 24/24, los 24 únicos, todos absolutos sobre `https://drangulocolumna.com` y sin barra final salvo la raíz |
| hasta ocho enlaces con anchor | ✓ | 31 columnas resueltas por posición; mapeo confirmado contra el documento vivo |
| recargar no duplica filas | ✓ | Ensayo de los tres cargadores hoy: 24/24/22 actualizadas, 0 insertadas, 0 columnas agregadas |

Sobre las métricas, con nombre y apellido. Las dos columnas de GSC y `Position` están vacías
porque no hay dato: el sitio es nuevo, DinoRank todavía no lo rastreó y Search Console no acumuló
impresiones. Eso está documentado y es correcto, inventarlo sería peor. Las tres columnas de
Ahrefs son otra historia. D-13 las dejó vacías heredando J-1 de la fase 12, cuyo motivo era no
escribir un volumen de DinoRank bajo un encabezado que dice Ahrefs. Ese motivo era bueno y ya no
aplica: la fase 13 trajo datos de Ahrefs de verdad. Medido hoy sobre las 16 primarias, en
`data/ahrefs-keywords.jsonl` hay `volume` con `volumeFuente: "ahrefs"` en 10, y
`keywordDifficulty` y `trafficPotential` con fuente `ahrefs` en 7. Por ejemplo `hernia discal`
trae volumen 6000, KD 5 y traffic potential 1500, los tres marcados como Ahrefs. Ese dato cabe
literalmente en las columnas que lo esperan y no se escribió.

No es un bloqueo del objetivo: el mapa se lee y se usa igual sin las métricas. Pero es una
cláusula explícita de SC-5 y de SHEET-02, la tabla de trazabilidad marca SHEET-02 como
**Completo**, y ningún documento de la fase reconcilia la diferencia. Por eso queda como gap y
no como nota al pie.

### Artefactos requeridos

| Artefacto | Esperado | Estado | Detalle |
|---|---|---|---|
| `seo-tools/data/url-map.jsonl` | El mapa completo | ✓ VERIFICADO | 24 filas, 21 vivas y 3 planificadas, campos completos y justificación en prosa por fila |
| `seo-tools/data/canonicals.json` | Canonical y topic por URL | ✓ VERIFICADO | 24 filas, 24 canonicals únicos, 0 con formato inválido, coherentes uno a uno con el mapa |
| `seo-tools/data/internal-links.json` | La matriz | ✓ VERIFICADO | 22 filas, 135 enlaces, 78 anchors, con `fueraDeLaMatriz` explicando las 2 exclusiones |
| `seo-tools/data/cannibalization.json` | El cruce | ✓ VERIFICADO | 120 pares, 0 conflictos, umbral 3, origen declarado |
| `seo-tools/data/url-inventory.json` | El inventario medido | ✓ VERIFICADO | 22 URLs vivas, 20 mapeables, con bloque de reconciliación contra la cifra del roadmap |
| `seo-tools/src/phase14/*.ts` | El código que lo produce | ✓ VERIFICADO | 20 archivos, 118 pruebas propias de la fase, ninguna omitida |
| `14-MAPA.md` | El mapa legible | ✓ VERIFICADO | 300 líneas, tabla por URL con tipo actual contra tipo exigido |
| `14-CANIBALIZACION.md` | El cruce legible y la deuda | ⚠️ CON DEFECTO | 150 líneas, deuda D-1 fechada al 2026-11-11. Dice 18 primarias donde son 16 |
| `14-ENLAZADO.md` | La matriz legible | ✓ VERIFICADO | 390 líneas, 14 secciones de cluster, con el aviso de «se propone y NO se implementa» en la línea 3 |
| `14-HANDOFF-V11.md` | El aviso a v1.1 | ✓ VERIFICADO | 186 líneas, autocontenido, con las nueve URLs y lo que el handoff NO resuelve |

### Verificación de enlaces clave (invariantes de la matriz)

Medidos con lectura propia de `internal-links.json`, no con los contadores del código:

| Invariante | Exigido | Medido | Estado |
|---|---|---|---|
| URLs que se enlazan a sí mismas | 0 | 0 | ✓ |
| Enlaces salientes por URL | ≤ 8 | máximo 8, mínimo 4 | ✓ |
| URLs sin enlaces entrantes | 0 | 0 | ✓ |
| Un anchor apuntando a dos destinos | 0 | 0 sobre 78 anchors distintos | ✓ |
| Pares origen→destino duplicados | 0 | 0 | ✓ |
| Destinos fuera de la matriz | 0 | 0 | ✓ |
| Anchor sale de una keyword del destino | siempre que el destino tenga keyword | 0 violaciones. Los 43 enlaces con anchor descriptivo apuntan a los 6 nodos sin keyword (`/sedes`, `/blog`, `/sobre-el-doctor`, `/testimonios`, `/contacto`, `/agendar`), que es la limitación ya documentada | ✓ |

### Cobertura entre datasets

| Cruce | Resultado |
|---|---|
| URLs del mapa ausentes de `canonicals.json` | 0 |
| URLs de `canonicals.json` ausentes del mapa | 0 |
| Canonical del mapa distinto del de `canonicals.json` | 0 de 24 |
| URLs del mapa ausentes de la matriz | 2, ambas con motivo escrito en `fueraDeLaMatriz` |
| URLs de la matriz ausentes del mapa | 0 |
| Mapeables del inventario ausentes del mapa | 0 |

### Comprobaciones de comportamiento

| Comprobación | Comando | Resultado | Estado |
|---|---|---|---|
| Suite completo | `npm test` | 536 pruebas, 536 en verde, 0 en rojo | ✓ |
| Tipos | `npm run typecheck` | sin salida | ✓ |
| Pruebas propias de la fase 14 | `node --import tsx --test src/phase14/<archivo>.test.ts`, uno por archivo | 118 en verde: links 15, canonical 16, cannibal 10, assign 14, audit 23, overlap 7, inventory 10, cm-push 9, il-push 8, pagetype-map 6 | ✓ |
| Mapeo posicional contra el documento vivo | `tsx src/phase14/il-verify.ts` | 22 filas leídas, bloque 1 ≠ bloque 8, ambos coinciden con el dataset, sin escrituras | ✓ |
| Recarga de `Content Model` | `tsx src/phase14/cm-push.ts --dry-run` | 24 actualizadas, 0 insertadas, 0 columnas | ✓ |
| Recarga de `Canonical Audit` | `tsx src/phase14/ca-push.ts --dry-run` | 24 actualizadas, 0 insertadas, 0 columnas, 0 de 48 celdas de seguimiento por sembrar | ✓ |
| Recarga de `Internal Linking Audit` | `tsx src/phase14/il-push.ts --dry-run` | 22 actualizadas, 0 insertadas, 0 columnas, mapeo por posición con 31 columnas resueltas | ✓ |
| Lectura directa de los tres tabs | lectura propia sólo lectura sobre el Sheet | 24, 24 y 22 filas de datos, 0 URLs duplicadas en los tres | ✓ |

No hay probes convencionales (`scripts/*/tests/probe-*.sh`) en el repositorio. Los siete
comandos de arriba son el equivalente y se corrieron en este proceso.

### Cobertura de requisitos

| Requisito | Estado | Evidencia |
|---|---|---|
| MAP-01 | ✓ SATISFECHO | 16 URLs con exactamente una primaria distinta y 3-5 secundarias. Las 8 restantes de las 20 mapeables declaran por escrito por qué no compiten, que es la decisión aceptada de 14-03. El texto del requisito conserva la cifra 18 del roadmap, superada por el inventario medido en 14-01 |
| MAP-02 | ✓ SATISFECHO | 0 primarias duplicadas, 0 secundarias que sean primaria ajena, 120 pares cruzados sin conflicto. La medición contra Search Console queda como D-1 con fecha 2026-11-11 y condición de habilitación escrita |
| MAP-03 | ✓ SATISFECHO | Las nueve URLs con keyword primaria y secundarias, publicadas en `Content Model` y documentadas en `14-HANDOFF-V11.md` |
| MAP-04 | ✓ SATISFECHO | `tipoExigidoPorSerp` en las 16 que compiten y `accion` en las 24, con evidencia de SERP tomada de las 96 capturas ya pagadas |
| MAP-05 | ✓ SATISFECHO | 135 enlaces entre 22 URLs con anchor, motivo y título de destino, entregados como especificación. Que sea especificación y no código es el reparto v1.1/v1.2, y el propio documento lo dice en su tercera línea |
| SHEET-02 | ⚠️ PARCIAL | 24 filas con keyword, intención, tipo, cluster y acción. Sin métricas |
| SHEET-04 | ✓ SATISFECHO | 24 filas con keyword, topic y canonical propuesto, verificadas en el documento vivo |
| SHEET-05 | ✓ SATISFECHO | 22 filas con hasta ocho enlaces salientes y su anchor, mapeadas por posición y confirmadas contra el documento vivo |

La tabla de trazabilidad de `REQUIREMENTS.md` marca SHEET-02 como **Completo**. Con las métricas
vacías, eso está sobredeclarado.

### Antipatrones

| Archivo | Línea | Patrón | Severidad | Impacto |
|---|---|---|---|---|
| — | — | Ninguno | — | `grep -rnE "TBD|FIXME|XXX"` sobre `seo-tools/src/phase14/`, `seo-tools/src/sheets/` y el directorio de la fase devuelve cero coincidencias. Las coincidencias de «TODO» son la palabra española «todo» en comentarios en prosa |

### Frontera del workstream

| Comprobación | Resultado |
|---|---|
| Rutas bajo `src/` de la aplicación en los commits de la fase | 0, verificado con `git log --name-only 04eab21^..6985076` |
| Rutas bajo `.planning/workstreams/milestone/` en los commits de la fase | 0 |
| Árbol de trabajo | limpio |
| Commits de la fase | 19, del `04eab21` al `6985076`, con el patrón `14-0x` en el mensaje |

El contrato se respetó. La matriz se propone y no se implementa, e `inventory.ts` abre `src/` en
modo lectura y lo declara en su cabecera.

## Resumen de gaps

Dos, ninguno bloqueante del objetivo de la fase.

**1. Las métricas del `Content Model`.** Es el único gap con consecuencia. Seis columnas vacías
en 24 filas, de las cuales tres podrían llevar dato real de Ahrefs para 10 de las 16 URLs que
compiten. La decisión que las dejó vacías era correcta cuando se tomó y dejó de serlo cuando la
fase 13 trajo el dato. Necesita que Juan decida: se llenan, o se estrecha SHEET-02 con un
override escrito.

**2. Dos cifras mal escritas.** `14-CANIBALIZACION.md` dice 18 primarias donde son 16, y el
texto de MAP-01 en `REQUIREMENTS.md` sigue diciendo 18 mapeables donde el inventario midió 20.
Ninguna de las dos cambia una decisión ni un dato del mapa: el cruce se hizo sobre 16, y la
reconciliación del inventario está guardada en `url-inventory.json`. Son correcciones de texto.

## Si la desviación es intencional

Si dejar el `Content Model` sin métricas es la decisión y no un olvido, esto cierra el gap sin
tocar el Sheet. Agregar al frontmatter de este archivo y volver a verificar:

```yaml
overrides:
  - must_have: "El tab Content Model tiene una fila por URL con keyword, intención, tipo, cluster, métricas y la acción recomendada"
    reason: "Las métricas quedan fuera del Content Model. GSC no tiene historial y las columnas (Ahrefs) no se llenan por D-13/J-1: el documento del cliente no lleva métricas de mapeo, que viven en el tab Keyword Research."
    accepted_by: "Juan"
    accepted_at: "2026-08-12T00:00:00Z"
```

---

_Verificado: 2026-08-12T13:56:46Z_
_Verificador: Claude (gsd-verifier)_

## Cierre de los gaps (2026-08-12, plan 14-05)

Los dos gaps de esta verificación se cerraron y se volvió a comprobar contra el documento vivo.

**Gap 1 — métricas de Ahrefs en `Content Model`.** Decisión de Juan: llenar únicamente las celdas
cuya procedencia registrada es literalmente `ahrefs`. J-1 seguía vigente en lo que prohibía —un
dato de otra herramienta bajo un encabezado que dice Ahrefs— y nunca prohibió escribir el de
Ahrefs cuando existe. `metricas.ts` implementa exactamente esa regla y omite del registro, en vez
de mandar vacías, las celdas sin dato: con `omitirCamposAusentes` una clave ausente deja la celda
intacta y una cadena vacía borraría lo que el cliente hubiera escrito. `metricas-verify.ts` leyó el
documento vivo y midió **24 celdas con dato coincidentes** (10 volúmenes, 7 KD, 7 traffic
potential) y **48 correctamente vacías**, con cero discrepancias. Las seis primarias de sede o de
marca quedan sin métrica porque Ahrefs no tiene dato para ellas, distinción que el dataset conserva
entre `ahrefs_sin_dato` y `no_consultado`. Las columnas de GSC siguen vacías con razón: el sitio no
acumuló impresiones.

**Gap 2 — dos cifras mal escritas.** Corregidas. `14-CANIBALIZACION.md` decía 18 primarias y son
16; el cruce reportó 120 pares, que es exactamente C(16,2), así que la medición siempre estuvo bien
y solo el texto estaba desalineado. El texto de MAP-01 en `REQUIREMENTS.md` decía 18 URLs mapeables
y el inventario midió 20, con la reconciliación guardada en `url-inventory.json`.

Suite después del cierre: 548 pruebas en verde, typecheck limpio, cero búsquedas de SerpApi.
