---
phase: 15-paquete-on-page-por-url
workstream: seo-keywords
milestone: v1.2
verified: 2026-08-13T00:00:00Z
status: passed
score: 5/5 must-haves verified
human_verification_resolved: "2026-08-13, Juan confirmó el Sheet vivo (16 filas correctas, columnas vecinas intactas) y que el doctor aprobó los 225 bloques clínicos, incluidos los 6 señalados D1-D6. Registro escrito en 15-APROBACION-DOCTOR.md."
behavior_unverified: 0
overrides_applied: 0
warnings:
  - id: W1
    concern: "WR-05 quedó a medio cerrar: la tabla `Entidades obligatorias` sigue emitiendo ruido medido y la bandera `entidadesInsuficientes` no se publica en ningún entregable"
    detail: "El fix de WR-05 corrigió la BANDERA (contar solo clase distinta de `generica`) pero no la LISTA EMITIDA. `data/onpage-serp.json` marca `entidadesInsuficientes: true` en 9 de las 16 URLs, y ese dato no aparece ni en los 24 paquetes ni en `15-PAQUETE.md` ni en `15-HANDOFF-V11-ONPAGE.md`. Además, en 6 de las 16 URLs hay términos declarados obligatorios que el propio copy de la fase no usa: `/sedes/sanna-la-molina` 12 de 20 sin usar (`rodriguez`, `castro`, `jorge`, `constantes en tus huesos o articulaciones`), `/sedes/clinica-tezza` 5 de 20, `/blog/5-sintomas...` 3 de 16, `/preguntas-frecuentes` 3 de 20, `/` 1 de 16, `/servicios/escoliosis-y-deformidades` 1 de 10."
    mitigating: "El documento declara el método y el límite del corpus en la propia sección, y la columna `Clase` etiqueta cada término. Los términos de clase clínica, anatómica y de procedimiento SÍ están todos usados. Por eso es advertencia y no bloqueo."
    severity: warning
  - id: W2
    concern: "REQUIREMENTS.md ONPAGE-03 declara 196 términos; el dataset tiene 204"
    detail: "`data/onpage-serp.json` suma 204 entidades sobre las 16 URLs (143 términos únicos). El número 196 quedó de antes de que el fix de WR-05 regenerara el dataset."
    severity: warning
  - id: W3
    concern: "REQUIREMENTS.md ONPAGE-06 declara una ronda del doctor de 450 bloques; son 225 bloques"
    detail: "`15-REVISION-DOCTOR.md` declara 225 bloques clínicos y `revision.ts` lo confirma al regenerar. 450 es el número de casillas, dos por bloque."
    severity: warning
  - id: W4
    concern: "15-01-SUMMARY.md afirma que ninguna fila quedó con entidades insuficientes; hoy son 9 de 16"
    detail: "La afirmación era cierta al cerrar el plan 15-01 y dejó de serlo cuando el fix de WR-05 cambió el criterio de conteo. El SUMMARY no se actualizó."
    severity: warning
  - id: W5
    concern: "15-REVIEW.md sigue con `status: issues_found` y sin registro de resolución"
    detail: "Los 11 hallazgos accionables (CR-01 y WR-01..WR-10) tienen commit de fix y quedaron verificados en esta corrida, pero el frontmatter del reporte no lo refleja. Los 7 hallazgos `info` (IN-01..IN-07) siguen abiertos por diseño."
    severity: warning
  - id: W6
    concern: "IN-03 sin cerrar: la auditoría de duplicados no cruza `metaDescription` contra sí misma"
    detail: "`auditoria.ts` cruza `title` y `h1` pero no la meta. Hoy no hay ninguna meta repetida en `data/onpage.json`, así que es hueco de cobertura y no fallo presente."
    severity: warning
human_verification:
  - test: "Abrir el Sheet del cliente, tab `Keyword Research`, y confirmar que las columnas `Suggested H1` y `URL` están llenas en las 16 filas de keyword primaria y que ninguna celda vecina de las fases 12, 13 o 14 cambió."
    expected: "16 filas con H1 y URL; las 19 columnas de una fila de control idénticas a antes de la carga; 5716 filas de total, sin filas nuevas al final."
    why_human: "Es un documento externo y vivo. Verificarlo desde acá exigiría volver a leer o escribir el Sheet del cliente, que está fuera del alcance de una verificación. El resultado declarado (16 actualizadas, 0 insertadas, 0 columnas agregadas, idéntico en dos corridas) es internamente coherente con `sheet-columns.json` y con las defensas del cargador, pero eso es coherencia documental y no observación del documento vivo."
  - test: "Leer una guía clínica completa, por ejemplo `paquetes/servicios-hernia-discal.md`, y juzgar si el tono y la exactitud clínica se sostienen de punta a punta."
    expected: "Texto que suena a persona, sin promesas de resultado, sin cifras sin respaldo y con el recorrido del paciente ordenado."
    why_human: "Las compuertas automáticas miden muletillas, sellos y afirmaciones sin fuente. El tono y la corrección clínica no los decide ningún criterio automático, y es exactamente lo que la ronda del doctor existe para resolver."
  - test: "Decidir qué hacer con W1: o se limpia la lista de entidades emitida (apellidos y fragmentos de n-grama), o se publica la bandera `entidadesInsuficientes` en el paquete y el handoff, o se acepta como está."
    expected: "Una decisión escrita. Si se acepta como está, conviene dejarlo anotado para que la fase 8 de v1.1 no lo lea como defecto."
    why_human: "Es un juicio de alcance: cerrar la otra mitad de WR-05 es trabajo real y el paquete ya es implementable sin eso."
---

# Fase 15: Paquete on-page por URL — Reporte de verificación

**Objetivo de la fase:** Cada URL del mapa sale de este workstream con su title, meta, H1,
jerarquía, entidades obligatorias y copy clínico ya redactado, de modo que implementarla en v1.1
no obligue a volver a decidir nada.

**Verificado:** 2026-08-13
**Estado:** human_needed
**Re-verificación:** No, verificación inicial

## Aislamiento de workstream (amenaza T-15-04)

**Sin violación.** `git log --name-only` sobre el rango completo de la fase no devuelve ni un
archivo bajo `src/`. Los módulos de la fase leen `src/content/locations.ts`,
`src/content/location-pages.ts`, `src/content/blog.ts` y `src/content/service-pages.ts` como
fuente, y `metadatos.ts` lo declara de solo lectura en su cabecera. Los destinos de escritura
quedaron acotados a `seo-tools/data/` y a la carpeta de la fase por el fix de WR-07.

`data/url-map.jsonl` tampoco se tocó: su SHA-256 sigue siendo
`ada0a4a1fe6c0d149de428352ed07260c1e48a88d4b897d2d15e6c1f6ea951b5`, el mismo que declara el
SUMMARY, y su último commit es de la fase 14 (`e4ba060`). Los anchors de la matriz de enlazado
del plan 14-04 no perdieron respaldo.

## Verdades observables

| # | Verdad (criterio de éxito del ROADMAP) | Estado | Evidencia |
| --- | --- | --- | --- |
| 1 | Cada URL mapeable tiene title y meta reescritos dentro del límite y con la primaria al frente | VERIFICADO | Auditoría corrida por el verificador: 22 URLs, `titles fuera: 0`, `metas fuera: 0`, `primaria no al frente: 0`, salida 0. Title más largo 50 de 60, meta más larga 142 de 155. Las 2 que redirigen quedan fuera con motivo declarado (D-07), y el caveat está escrito en ONPAGE-01 |
| 2 | Cada URL tiene H1 propuesto, jerarquía H2/H3 de la SERP de Lima y entidades obligatorias | VERIFICADO (con W1) | 22 filas con H1 (16 propuesto, 6 transcrito del sitio con archivo y línea). 305 encabezados sobre 16 URLs con procedencia por encabezado: 63 `pregunta-serp`, 71 `busqueda-relacionada`, 67 `secundaria-del-mapa`, 104 `esqueleto`. 204 entidades, cada una con `documentos`, `de` y las `posiciones` concretas del top 10. Sustitución de DinoRank documentada y coherente en ONPAGE-03 |
| 3 | El copy clínico está redactado, humanizado y sellado como pendiente del doctor | VERIFICADO | `ymyl.ts --todos` corrido por el verificador: 16 páginas, 0 hallazgos, salida 0. `ymyl.ts --documentos` sobre los 24 emitidos: 0 hallazgos, salida 0. Los 16 documentos de página completa traen entre 11 y 47 sellos `pendiente-doctor`; los 8 cortos no llevan copy clínico por diseño |
| 4 | La auditoría devuelve cero titles duplicados, cero H1 duplicados y cero metas faltantes | VERIFICADO | Corrida por el verificador sobre `data/onpage.json`: 0/0/0 en las 22 URLs, salida 0. Sustitución de `/auditoria` documentada en ONPAGE-05 con la evidencia del cruce de cliente (`soumahotel.com`) |
| 5 | Existe un paquete por URL que quien ejecute las fases 8 y 10 de v1.1 abre e implementa de corrido | VERIFICADO | 24 documentos, índice en `15-PAQUETE.md` y handoff autocontenido en `15-HANDOFF-V11-ONPAGE.md`. Leídos de punta a punta el handoff, `paquetes/agendar.md` y `paquetes/blog-estenosis-espinal-que-es.md`: cada uno se sostiene solo, con el motivo de la decisión transcrito en vez de referenciado |

**Puntaje:** 5/5 verdades verificadas.

## El hallazgo crítico del code review, comprobado de nuevo

CR-01 era el hueco de la compuerta YMYL: la regla `cifra-sin-fuente` solo se disparaba con
dígitos, y esta fase escribe los números en palabras (D-11), así que las afirmaciones de
prevalencia clínica sin respaldo pasaban sin que nada avisara.

| Comprobación | Resultado |
| --- | --- |
| La regla nueva existe | `ymyl.ts:345`, `regla: "prevalencia-sin-respaldo"` |
| La regla se comporta | 2 pruebas nombradas corridas por el verificador, las dos en verde: una prevalencia sin fuente da 1 hallazgo, con fuente da 0, y una fuente en blanco no respalda. La segunda prueba comprueba que mide proporciones y no idioma, o sea que no marca de más |
| La compuerta corre limpia hoy | `--todos` 0 hallazgos sobre 16 páginas, `--documentos` 0 hallazgos sobre 24 documentos, las dos con salida 0 |
| La procedencia nueva es honesta | Las 20 afirmaciones de frecuencia clínica que la regla obligó a respaldar declaran textualmente: *"Afirmación de frecuencia clínica redactada en la fase 15. No tiene todavía una referencia que la respalde: queda registrada acá, y en la ronda de revisión, para que el doctor la confirme, la matice o la retire antes de publicar (D-10)."* Ninguna cita fabricada |

Se revisaron las 113 cadenas de `fuente` de los cuatro datasets de copy, una por una. No hay
ninguna referencia bibliográfica inventada. Lo que no tiene respaldo lo dice; lo que sale del
sitio publicado nombra archivo, slug, sección y fecha; lo que sale de la SERP nombra la keyword,
la posición y la fecha de captura; y los 10 datos operativos que faltan declaran que faltan.

## Artefactos

| Artefacto | Nivel 1 existe | Nivel 2 sustantivo | Nivel 3 cableado | Nivel 4 dato real | Estado |
| --- | --- | --- | --- | --- | --- |
| `seo-tools/data/onpage.json` | Sí | 24 filas, 22 con metadata completa | Lo consumen `auditoria.ts`, `paquete.ts`, `kr-h1-push.ts` | Datos medidos, sin campos vacíos | VERIFICADO |
| `seo-tools/data/onpage-serp.json` | Sí | 16 URLs, 305 encabezados, 204 entidades | Lo consumen `paquete.ts` y `ymyl.ts` | Procedencia por término y por encabezado | VERIFICADO |
| `seo-tools/data/onpage-audit.json` | Sí | Resultado completo con alcance y resumen | Lo escribe `auditoria.ts` | Regenerado byte a byte idéntico | VERIFICADO |
| `seo-tools/data/copy-*.json` (4) | Sí | 16 URLs sin solapamiento entre archivos | Los consumen `paquete.ts`, `revision.ts`, `ymyl.ts` | Copy redactado, 113 fuentes trazadas | VERIFICADO |
| `seo-tools/src/phase15/*.ts` (8 módulos) | Sí | Sin marcadores de deuda | `npm test` 653 en verde, `typecheck` limpio | — | VERIFICADO |
| `paquetes/*.md` (24) | Sí | 16 de 276 a 382 líneas, 8 cortos de 51 a 59 | Regenerados idénticos | Copy real, sin marcadores de relleno | VERIFICADO |
| `15-PAQUETE.md` | Sí | Índice de las 24 con conteo de palabras | Generado desde los datasets | Regenerado idéntico | VERIFICADO |
| `15-REVISION-DOCTOR.md` | Sí | 225 bloques, 450 casillas, ordenado por riesgo | Generado por `revision.ts` | Regenerado idéntico | VERIFICADO |
| `15-HANDOFF-V11-ONPAGE.md` | Sí | 6 secciones, se lee solo | Generado por `paquete.ts --handoff` | Las 22 URLs con su metadata y las 3 redirecciones | VERIFICADO |
| `15-AUDITORIA.md` | Sí | Resultado de la auditoría sobre el paquete | Sale de `onpage-audit.json` | — | VERIFICADO |

## Enlaces clave

| Desde | Hacia | Vía | Estado |
| --- | --- | --- | --- |
| `serp-onpage.ts` | `.cache/serpapi/` | `leerSerp(..., { offline: true })` | CABLEADO — 96 capturas en caché, ni una búsqueda gastada en los siete planes |
| `auditoria.ts` | `data/onpage.json` | `--data`, nunca contra el sitio vivo ni contra DinoRank | CABLEADO |
| `ymyl.ts` | los 4 datasets de copy y los 24 documentos emitidos | `--todos` y `--documentos` | CABLEADO — el fix de WR-09 agregó el segundo recorrido, que es el único que alcanza la región de copy de los 8 cortos |
| `paquete.ts` | `data/onpage.json`, `onpage-serp.json`, `url-map.jsonl`, copy-*.json | generación, no edición a mano | CABLEADO — regeneración byte a byte idéntica comprobada |
| `kr-h1-push.ts` | tab `Keyword Research` | `estadosPropios: ["fase-14", "fase-15"]`, `addMissingColumns: false`, `omitirCamposAusentes: true` | CABLEADO — `sheet-columns.json` confirma que solo 2 columnas de ese tab llevan esos estados con campo |
| fase 15 | `src/` | ninguna | CORRECTAMENTE AUSENTE |

Sobre `estadosPropios`: el key_link del plan 15-07 decía `["fase-15"]` a secas y el código usa
`["fase-14", "fase-15"]`. No es una desviación: es la verdad #5 del mismo plan, que encarga
cerrar la columna `URL` que la fase 14 reservó y dejó huérfana. `sheet-columns.json` lo declara
en la nota de esa columna, conservando el estado de la fase que produjo el dato. Las dos partes
del plan son coherentes entre sí; lo que quedó viejo es la redacción del key_link.

## Comprobaciones de comportamiento corridas por el verificador

| Comprobación | Comando | Resultado | Estado |
| --- | --- | --- | --- |
| Compuerta YMYL sobre los datasets | `tsx src/phase15/ymyl.ts --todos` | 16 páginas, 0 hallazgos, salida 0 | PASA |
| Compuerta YMYL sobre los emitidos | `tsx src/phase15/ymyl.ts --documentos` | 0 hallazgos, salida 0 | PASA |
| Regla de prevalencia | `node --test --test-name-pattern="prevalencia"` | 2 de 2 en verde | PASA |
| Auditoría de duplicados | `tsx src/phase15/auditoria.ts --data data/onpage.json --out data/onpage-audit.json` | 0/0/0/0/0/0 sobre 22 URLs, salida 0 | PASA |
| Determinismo de la auditoría | `git diff` sobre el dataset regenerado | vacío | PASA |
| Determinismo de los 24 paquetes y el índice | `tsx src/phase15/paquete.ts --todos --indice` y `git status` | 24 escritos, árbol limpio | PASA |
| Determinismo de la ronda del doctor | `tsx src/phase15/revision.ts` y `git status` | 225 bloques, árbol limpio | PASA |
| Suite completa | `npm test` | 653 pruebas, 0 fallos | PASA |
| Tipos | `npm run typecheck` | sin salida | PASA |
| Cuota de SerpApi | `ls .cache/serpapi \| wc -l` | 96 | PASA |
| Integridad del mapa de la fase 14 | `shasum -a 256 data/url-map.jsonl` | `ada0a4a1...951b5`, sin cambio | PASA |
| Entidades usadas en el cuerpo del copy | script de cruce sobre la región `copy:inicio`/`copy:fin` | 10 de 16 URLs al 100%; 6 con términos declarados y no usados | PARCIAL, ver W1 |
| Montefiori fuera del copy | `grep -ril montefiori paquetes/` | 8 coincidencias, todas en la celda de procedencia que explica por qué NO se nombra; cero en el copy y cero en los 4 documentos de sede | PASA |
| Colisión de titles de las 6 que no compiten | cruce contra las 16 primarias | ninguna toma la primaria de otra URL | PASA |

## Cobertura de requisitos

| Requisito | Plan | Estado | Evidencia comprobada |
| --- | --- | --- | --- |
| ONPAGE-01 | 15-02 | SATISFECHO | Auditoría corrida: 22 URLs dentro de 60 y 155, primaria al frente en las 16. Caveat de las 2 que redirigen presente y coherente |
| ONPAGE-02 | 15-01, 15-02 | SATISFECHO | 305 encabezados con procedencia SERP verificada en el dataset. Las 6 sin primaria transcriben su H1 publicado con archivo y línea |
| ONPAGE-03 | 15-01 | SATISFECHO con caveat | El caveat de D-02 está escrito y es coherente. La metodología sustituta produjo dato real: frecuencia documental medida sobre el top 10, con `documentos`, `de` y `posiciones` por término. Discrepancia de conteo en W2 y calidad de la lista en W1 |
| ONPAGE-04 | 15-01, 15-03..06 | SATISFECHO | Las dos compuertas corridas por el verificador dan 0. Sellos presentes en los 16. Procedencia honesta en las 113 fuentes |
| ONPAGE-05 | 15-02 | SATISFECHO con caveat | El caveat de D-04 está escrito, con la evidencia del cruce de cliente. La auditoría local corrida da 0/0/0 |
| ONPAGE-06 | 15-07 | SATISFECHO | 24 documentos, índice y handoff autocontenido, los tres regenerados idénticos. Discrepancia de conteo en W3 |

Ningún requisito huérfano: `REQUIREMENTS.md` mapea ONPAGE-01 a ONPAGE-06 a la fase 15 y los seis
están reclamados por algún plan.

## Anti-patrones

Sin bloqueos. Cero `TBD`, `FIXME`, `XXX`, `HACK` o `PLACEHOLDER` en los ocho módulos de
`src/phase15/`. Cero marcadores de relleno, `SIN CUBRIR` o encabezados sin copy en los 24
documentos emitidos.

## Advertencias

Ninguna impide implementar el paquete. Van ordenadas por lo que costaría arreglarlas después.

**W1 — WR-05 quedó a medio cerrar.** El fix corrigió la bandera pero no la lista emitida. Hoy
`data/onpage-serp.json` marca `entidadesInsuficientes: true` en 9 de las 16 URLs y ese dato no
llega a ningún entregable, y la sección `Entidades obligatorias` de los paquetes sigue listando
ruido medido: apellidos de otros médicos (`rodriguez`, `castro`, `jorge`) y fragmentos de
n-grama (`constantes en tus huesos o articulaciones`). El síntoma más visible es que el propio
copy de la fase no usa 12 de los 20 términos que le declara obligatorios a
`/sedes/sanna-la-molina`. Lo que baja la severidad: el documento declara en esa misma sección
que el corpus es texto de presentación y así hay que leerlo, la columna `Clase` etiqueta cada
término, y los términos clínicos, anatómicos y de procedimiento están todos usados.

**W2, W3 y W4 — números que envejecieron.** El fix de WR-05 regeneró el dataset y cambió los
conteos, pero la documentación no se refrescó. `REQUIREMENTS.md` dice 196 términos y son 204;
dice una ronda de 450 bloques y son 225 bloques con 450 casillas; y `15-01-SUMMARY.md` afirma
que ninguna fila quedó con entidades insuficientes, que era cierto al cerrar ese plan y hoy son
9 de 16. Nada de esto afecta lo que v1.1 implementa, porque quien implementa lee los paquetes y
no los conteos, pero `REQUIREMENTS.md` es el documento de trazabilidad y conviene que no
contradiga a sus propios datasets.

**W5 — el reporte de review no registra su cierre.** Los 11 hallazgos accionables tienen commit
de fix y esta verificación los encontró efectivamente aplicados, pero `15-REVIEW.md` sigue con
`status: issues_found` en el frontmatter. Los 7 `info` siguen abiertos, que es lo esperable.

**W6 — IN-03 sigue abierto.** La auditoría cruza `title` y `h1` contra sí mismos pero no
`metaDescription`. Hoy no hay ninguna meta repetida, así que es hueco de cobertura y no fallo.

## Lo que necesita ojo humano

Tres cosas, y ninguna es un defecto de la fase.

1. **El Sheet del cliente.** La carga ya ocurrió y su resultado declarado es internamente
   coherente, pero es un documento externo y vivo: confirmarlo exige abrirlo.
2. **El tono y la exactitud clínica del copy.** Es exactamente lo que la ronda del doctor
   existe para resolver, y esta fase la dejó armada y bloqueante. No es deuda: es el diseño.
3. **Qué hacer con W1.** Cerrar la otra mitad de WR-05 es trabajo real y el paquete ya es
   implementable sin eso. La decisión es de alcance, no técnica.

## Resumen

El objetivo de la fase se cumple. Los cinco criterios del ROADMAP se verificaron corriendo las
compuertas y la auditoría en este entorno, no leyendo lo que los SUMMARY declaran. Las 24 URLs
tienen su documento, los tres artefactos generados se regeneran byte a byte idénticos, la fase
no gastó ni una búsqueda de cuota, no escribió ni una línea en `src/` y no movió el mapa de la
fase 14.

El hallazgo crítico del review está cerrado de verdad: la regla nueva existe, sus pruebas
nombradas pasan, la compuerta corre limpia en sus dos modos y las afirmaciones que la regla
obligó a respaldar declaran honestamente que no tienen respaldo todavía, en vez de inventar una
cita. Eso último era el riesgo real y es lo que quedó bien resuelto.

Lo que queda son seis advertencias, todas de la misma familia: el fix de WR-05 movió los números
y la documentación se quedó con los viejos, y la mitad del propio WR-05 sigue abierta en la lista
de entidades emitida. Nada de eso bloquea a las fases 8 y 10 de v1.1.

---

_Verificado: 2026-08-13_
_Verificador: Claude (gsd-verifier)_
