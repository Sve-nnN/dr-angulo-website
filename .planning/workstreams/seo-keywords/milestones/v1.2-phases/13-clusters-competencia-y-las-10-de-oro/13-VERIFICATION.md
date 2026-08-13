---
phase: 13-clusters-competencia-y-las-10-de-oro
workstream: seo-keywords
verified: 2026-08-11T00:00:00Z
status: passed
score: 4/5 criterios de éxito verificados
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "SC5 (enmienda 2026-08-11): el tab `Keyword Research` publica `Cluster`, `Top Result`, `Keyword Difficulty` y `Traffic Potential`"
    status: partial
    reason: >-
      `Cluster` (2.439 filas) y `Top Result` (91) están publicados en el Sheet vivo.
      `Keyword Difficulty` y `Traffic Potential` están escritas con el literal
      `no_consultado` en las 5.716 filas, cero valores reales, pese a que el repositorio
      tiene 22 cabezas con KD y traffic potential medidos por Ahrefs y las 22 existen en
      el universo. El commit `2df6650` que trajo esos 22 valores tocó
      `ahrefs-keywords.jsonl`, `sweet-spot.jsonl` y `13-PUNTO-DULCE.md`, pero no
      `keywords-13.jsonl` ni el Sheet, y ningún documento registra esa postergación.
    artifacts:
      - path: "seo-tools/data/keywords-13.jsonl"
        issue: "0 filas con `keywordDifficulty`/`trafficPotential` reales; el dataset que alimenta el push quedó en la versión previa a 2df6650"
      - path: "Sheet `Keyword Research` col. J y E (vivo)"
        issue: "5.716/5.716 en `no_consultado` para ambas columnas"
    missing:
      - "Reconstruir `keywords-13.jsonl` con `build-dataset.ts` para que herede los 22 KD/TP de `ahrefs-keywords.jsonl`"
      - "Volver a correr `kw-push.ts` (es idempotente: 5716 actualizadas / 0 insertadas) para que las 22 cabezas dejen de decir `no_consultado` sobre un dato que sí se consultó"
      - "Es exactamente el error de procedencia que el plan 13-04 corrigió en el tab de competencia (‘ocho filas dejaron de mentir’), sin corregir en el de keywords"
warnings:
  - "El commit de cierre `7e30e8f` dice ‘cierra la fase con los nueve requisitos verificados’, pero `REQUIREMENTS.md` deja 6 de los 9 en `[ ]` y la tabla de seguimiento los marca ‘Pendiente’. Solo KWR-04, KWR-06 y COMP-03 quedaron tildados."
---

# Phase 13: Clusters, competencia y las 10 de Oro — Verification Report

**Goal:** El universo plano se convierte en clusters accionables validados contra la SERP real de Lima, con el mapa de competencia al lado, y queda elegida la lista corta de keywords por las que vale la pena pelear primero.
**Verified:** 2026-08-11 · **Status:** `gaps_found` · **Re-verification:** No

---

## Invariantes duras del milestone

| Invariante | Comando | Salida real | Estado |
|---|---|---|---|
| Suite verde | `cd seo-tools && npm test` | `tests 418 · pass 418 · fail 0` | OK |
| Typecheck del paquete | `cd seo-tools && npm run typecheck` | sin salida, exit 0 | OK |
| **Guardarraíl v1.1** | `npx tsc --noEmit --listFiles \| grep -c '/seo-tools/'` | `0` | OK |
| App compila | `npx tsc --noEmit` (raíz) | exit 0, sin errores | OK |
| Techo SerpApi | `cat seo-tools/.cache/_quota.json` | `serpapi: 96` (de 102) · `ahrefs: 82` · `dinorank: 187` | OK |
| Universo intacto | `shasum -a 256 seo-tools/data/keywords.jsonl` | `c59dad2d…cd7eac` — coincide | OK |
| Nada en `src/` de la app | `git log --name-only -20 \| grep -c '^src/'` | `0` | OK |
| Nada en `workstreams/milestone/` | `git log --name-only -20 \| grep -c 'workstreams/milestone'` | `0` | OK |
| Sin credenciales versionadas | `git check-ignore -v .secrets/service-account.json` | `.gitignore:44:.secrets/` | OK |
| Sin marcadores de deuda | `grep -rnE "TBD\|FIXME\|XXX" src/phase13 src/sheets` | sin coincidencias (los `TODO` son la palabra española) | OK |

Árbol de trabajo limpio (`git status --porcelain seo-tools` sin salida). No se gastó cuota: toda la lectura fue de `.cache/` y del Sheet en modo `spreadsheets.readonly`.

---

## Criterios de éxito

| # | Criterio | Estado | Evidencia |
|---|---|---|---|
| 1 | Clusters por solape de SERP, no por texto | VERIFICADO (cobertura muestral registrada) | `clusters.json`: 31 clusters, `umbralDeSolape: 3`, cada `union` lista las URLs compartidas. `keyword-clusters.jsonl`: 4.766 filas — `serp: 91`, `texto: 2.348`, sin marca (sin cluster): 2.327. Las dos direcciones tienen prueba en verde: *“dos cabezas con exactamente tres URLs compartidas caen juntas; con exactamente dos quedan separadas”* y *“dos keywords casi identicas en texto con SERP disjunta quedan en clusters distintos”*. |
| 2 | Cada cluster con su SERP de Lima y el tipo de página que Google premia | VERIFICADO | 31/31 clusters traen `tipoDePagina`, `repartoDeTipos` y `topResult`. Reparto: contenido-internacional 14, servicio 6, directorio 5, guía 3, otro 2, red social 1. Las 91 filas `serp` traen `topResult`, 91/91. |
| 3 | Punto dulce marcado (con la enmienda del 2026-08-10 y la sustitución del 2026-08-11) | VERIFICADO | `sweet-spot.jsonl`: 91 filas, cada una con `nivel`, `alcanzable`, `disputables`, `repartoTop10`, las posiciones con veredicto y `razones` en prosa. 22 traen KD real de Ahrefs; las 69 restantes dicen `ahrefs_sin_dato` y se resuelven por SERP sin descartarse. Nueve pruebas cubren el cruce KD×SERP. |
| 4 | Las 10 de Oro con justificación legible | VERIFICADO | `golden-10.json`: 10 keywords con `valorDeNegocio` y `componentesDeValor`, más `descartadasDeMayorVolumen`, `casiElegidas` y `advertencias`. `13-DIEZ-DE-ORO.md` publica el desglose. |
| 5 | Sheet: `Keyword Research` con cluster/top result/KD/TP y `Competitor Analysis` con los cinco competidores | **FALLADO (parcial)** | `Competitor Analysis` completo y correcto. `Keyword Research`: `Cluster` 2.439 y `Top Result` 91 publicados, pero `Keyword Difficulty` y `Traffic Potential` en `no_consultado` en las 5.716 filas. Ver Brecha 1. |

**Score: 4/5.**

---

## Lectura del Sheet en vivo

Leído con la service account de `.secrets/service-account.json`, scope `spreadsheets.readonly`, ID `1aowectb…qCIls0`.

### `Keyword Research` — SHEET-01

Encabezados en la fila 3, datos en 4–5719 (**5.716 filas**).

| Columna | Col. | No vacías | Con `no_consultado` | Con valor real |
|---|---|---:|---:|---:|
| `Cluster` | B | 2.439 | 0 | **2.439** |
| `Top Result` | M | 91 | 0 | **91** |
| `Keyword Difficulty` | J | 5.716 | 5.716 | **0** |
| `Traffic Potential` | E | 5.716 | 5.716 | **0** |
| `URL` | C | 0 | 0 | 0 — de la fase 14, correcto |
| `Suggested H1` | L | 0 | 0 | 0 — de la fase 15, correcto |
| `Search Volume` | D | 5.087 | 0 | 5.087 |

2.439 = 91 + 2.348, que es exactamente el reparto local. La distinción `no_consultado` vs cero sobrevive: `Search Volume` deja 629 celdas vacías en vez de escribir 0.

### `Competitor Analysis` — SHEET-03

Cinco competidores en las columnas **B, F, J, N, R**, nombre en la fila 2 y dominio en la 3:
`drcarranzacolumna.com`, `drciezatraumatologia.com`, `cirujanocolumna-elaos.com`, `doctormunguia.com`, `clinicarthromeds.pe`.

**Títulos de sección en la columna B, intactos los siete:**

| Fila | Contenido leído |
|---:|---|
| 1 | `Competitor Analysis ` |
| 4 | `Key Stats ` |
| 11 | `Traffic Breakdown by Country ` |
| 17 | `Keywords` |
| 23 | `Featured Snippets ` |
| 25 | `Páginas principales (#10)` |
| 31 | `Most Linked Content (#11)` |

Ninguno pisado. Los datos viven en filas distintas de las de título (2–3, 5–10, 12–16, 18–22, 24, 26–30, 32–35), que es lo que hace viable escribir por columna sobre un tab transpuesto.

Llenado real: DR (0 / 2.9 / 0 / 0 / 1.1), Ahrefs rank, referring domains (432 / 431 / 426 / 405 / 420), tráfico orgánico (14 / 0 / 113 / 0 / 2.036), keywords orgánicas (14 / 0 / 39 / 0 / 582), blog, gap de keywords con posición, featured snippets (0 para los cinco, medidos), top pages y most linked content. Las cinco filas `Country N` siguen en `no_consultado`: ese reparto no se pidió y el literal es correcto ahí.

---

## Requisitos

| Req | Estado | Evidencia |
|---|---|---|
| KWR-04 | SATISFECHO en el mecanismo, **muestral** en cobertura | El solape de SERP es real y la marca `clusterFuente` distingue `serp` de `texto`; el dataset no puede confundirlos. 91 de 4.766 con SERP propia — decisión registrada bajo cuota dura. |
| KWR-05 | SATISFECHO en el entregable, **no publicado en el Sheet** | `13-PUNTO-DULCE.md` + `sweet-spot.jsonl` lo tienen; las columnas del Sheet no. |
| KWR-06 | SATISFECHO | 10 keywords, criterio ejecutado, aprobación registrada. |
| COMP-01 | SATISFECHO | Cinco perfiles completos, todos `mode=subdomains`. |
| COMP-02 | SATISFECHO | `keyword-gap.json`: 60 keywords de gap repartidas 17 / 5 / 10 / 1 / 27, derivadas de SERP ya pagadas, coste adicional cero. |
| COMP-03 | SATISFECHO | 31/31 clusters con SERP y tipo de página. |
| COMP-04 | SATISFECHO con ausencias medidas | Páginas más enlazadas: 2 / 0 / 3 / 0 / 10. Los dos ceros son de Ahrefs, no del pipeline: Cieza y Munguía tienen 0 tráfico y 0 keywords orgánicas. Featured snippets: 0 sobre 91 SERP medidas, medido y no ausente. |
| SHEET-01 | **PARCIAL** | Ver Brecha 1. |
| SHEET-03 | SATISFECHO | Tab lleno, títulos intactos, escritura por columna. |

---

## Los cinco juicios pedidos

**1. KWR-04 sobre muestra, no sobre el universo.** **Parcialmente cumplido, y la parte que falta está registrada, no escondida.** El mecanismo que el requisito exige —agrupar por solape de SERP y no por parecido de texto— está implementado, probado en las dos direcciones y aplicado. Lo que es muestral es la cobertura: 91 cabezas con SERP propia sobre 4.766 del universo objetivo, con 2.348 filas heredando cluster por texto y 2.327 sin cluster. Lo decisivo para el requisito es que **el dataset distingue las tres poblaciones**: `clusterFuente` vale `serp`, `texto` o `null`, y `13-CLUSTERS.md` publica el reparto con el argumento (*“Que 2327 filas queden sin cluster es informacion, no un fallo. Forzar una asignacion dudosa ensuciaria el dataset justo donde la fase 14 va a apoyarse”*). Un dataset que no pudiera separarlas sí incumpliría KWR-04; este lo hace en cada fila. La decisión de gastar 90 de 114 búsquedas en las cabezas es de Juan y está en `13-CONTEXT.md`.

**2. La sustitución en KWR-05.** **Justificada y documentada, en tres lugares.** La definición del roadmap era “KD alcanzable con el perfil de enlaces real del dominio”. La medición de Ahrefs del 2026-08-11 mostró que los enlaces no son la variable que decide: los cinco competidores tienen entre 405 y 432 referring domains contra 0 del doctor, y sin embargo `drciezatraumatologia.com` y `doctormunguia.com` tienen **0 tráfico y 0 keywords orgánicas** con 431 y 405 dominios, mientras las páginas interiores que sí traen tráfico rankean con **cero dominios de referencia**. Con enlaces como criterio el punto dulce habría dado vacío por un artefacto de medición. `13-PUNTO-DULCE.md` lo declara en la cabecera (líneas 4–9), cada fila lo repite en sus `razones` (*“La linea de base propia es DR 0, y en este nicho eso NO es la barrera”*), y las `advertencias` de `golden-10.json` lo enuncian una cuarta vez. La sustitución está sustentada en dato medido, no en conveniencia.

**3. cifosis.** **Confirmado: la lista es la que produce el criterio, y el episodio está escrito con nombre propio.** El décimo puesto lo ocupa `cirugía mínimamente invasiva en lima` con **38** puntos; `cifosis` quedó con **37**. Un punto, y el punto sale de los 15 de marca geográfica que la primera cobra y la segunda no. `13-DIEZ-DE-ORO.md` tiene una sección titulada *“Confirmadas por el cliente que el criterio igual dejo fuera”* que dice el número al lado, y `13-05-SUMMARY.md` lo declara sin adornarlo: *“el criterio decidio en contra de una indicacion explicita de Juan”*. La puerta de servicio propio sí se levantó (el dato estaba mal y quedó corregido); lo que no se editó a mano fue el puntaje, que es lo que la propia respuesta de Juan pidió (*“no elijas a mano cuál sale”*).

**4. COMP-01 con `mode=subdomains`.** **Confirmado, y sin mezcla.** De los 82 archivos de caché de Ahrefs, **24 contienen `"mode": "subdomains"` y 0 contienen `"mode": "domain"`**. Los 24 son exactamente las cuatro llamadas de `site-explorer` por los seis dominios (`domain-rating`, `backlinks-stats`, `metrics`, `top-pages`). Los otros 58 son `keywords-explorer/overview`, que no acepta el parámetro. El porqué quedó escrito en el código (`src/phase13/ahrefs.ts:197-207`, con la cita literal de la documentación y la medición comparativa 0/0/0 contra 14/14/5) para que nadie lo revierta, y `lectura-competencia-2026-08-11.md` lo cuenta como el error de medición que casi invalida el perfil entero.

**5. `tendinitis` y `fracturas`.** **Sí, y donde un lector las va a ver.** Aparecen dos veces en `13-DIEZ-DE-ORO.md`: en la tabla de descartadas por volumen, cada una con su motivo (*“Es de alcance objetivo pero NUNCA se le midio la SERP … Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio”*), y en las advertencias del cierre, con el número: *“Quedan 4.675 keywords del universo objetivo sin una sola SERP medida … Dos de las cinco keywords de mayor volumen del universo —‘tendinitis’ con 14.800 y ‘fracturas’ con 6.600— quedaron fuera por eso y no por un juicio de negocio”*. `keyword-gap.json` repite el límite en su campo `cobertura.nota`. La limitación no está enterrada en un JSON: está en la prosa del entregable que Juan lee.

---

## Brechas

### Brecha 1 — `Keyword Difficulty` y `Traffic Potential` nunca llegaron al Sheet

La enmienda del 2026-08-11 al criterio 5 nombra cuatro columnas como alcance real de la fase: `Cluster`, `Top Result`, `Keyword Difficulty` y `Traffic Potential`. Las dos primeras están. Las dos últimas dicen `no_consultado` en las 5.716 filas.

No es que el dato no exista:

```
$ node -e "…" data/ahrefs-keywords.jsonl
cabezas con KD real: 22
de esas, presentes en keywords-13.jsonl: 22
muestra: artrosis=KD 26/TP 1800 | ciatica=KD 19/TP 1800 | cifosis=KD 3/TP 200 | …

$ node -e "…" data/keywords-13.jsonl
KD real: 0    TP real: 0
```

El commit que trajo esos 22 valores llegó tarde:

```
$ git show --stat 2df6650
feat(13-04): KD y traffic potential reales de Ahrefs para el punto dulce
 13-PUNTO-DULCE.md | seo-tools/data/ahrefs-keywords.jsonl
 seo-tools/data/ahrefs-usage.json | seo-tools/data/sweet-spot.jsonl
```

No tocó `keywords-13.jsonl` ni volvió a empujar el Sheet, que se había cargado en el commit anterior (`408d5cb`). El punto dulce y las 10 de Oro sí consumen el KD real —`escoliosis` sale con KD 12 y `cifosis` con KD 3—, así que el análisis es correcto; lo que quedó desactualizado es la publicación.

Por qué cuenta como brecha y no como postergación: **ninguna la registra**. Ni `deferred-items.md`, ni los SUMMARY, ni `13-PUNTO-DULCE.md`. Y es literalmente el mismo error de procedencia que el plan 13-04 se ocupó de corregir en el otro tab —*“Ocho filas del tab de competencia dejaron de mentir … el tab estaba diciendo ‘no consultado’ sobre un dato consultado, que es el mismo error de procedencia que este proyecto combate en la otra dirección”*— sin aplicar la misma corrección en `Keyword Research`. Hoy el Sheet declara no consultadas 22 cabezas que sí se consultaron y se pagaron con cuota de Ahrefs.

Cierre: reconstruir `keywords-13.jsonl` con `build-dataset.ts` y volver a correr `kw-push.ts`, que es idempotente y ya está medido (5.716 actualizadas / 0 insertadas / 5 llamadas de red). Cero cuota de SerpApi y cero de Ahrefs: el dato está en caché.

### Advertencia — el commit de cierre adelanta el resultado

`7e30e8f docs(13): cierra la fase con los nueve requisitos verificados`. Pero `REQUIREMENTS.md` deja seis de los nueve en `[ ]` (KWR-05, COMP-01, COMP-02, COMP-04, SHEET-01, SHEET-03) y la tabla de seguimiento los marca “Pendiente”. Solo KWR-04, KWR-06 y COMP-03 quedaron tildados. Cinco de esos seis sí están satisfechos según esta verificación; el tildado es lo que falta. SHEET-01 no debe tildarse hasta cerrar la Brecha 1.

---

## Lo que no es una brecha

Registrado para que una relectura no lo confunda con trabajo faltante:

- **4.675 keywords sin SERP medida.** Decisión de Juan bajo cuota dura de 114 búsquedas, en `13-CONTEXT.md`, y declarada en tres entregables.
- **2.327 filas sin cluster.** Decisión explícita en `13-CLUSTERS.md`: forzar la asignación ensuciaría el insumo de la fase 14.
- **Featured snippets en 0 para los cinco competidores.** Medido sobre 91 SERP (`destacadosMedidos: 0, destacadosSobre: 91`), no ausente.
- **Cieza y Munguía sin páginas más enlazadas.** Ahrefs no devolvió top pages porque tienen 0 tráfico y 0 keywords orgánicas.
- **Las cinco filas `Country N` en `no_consultado`.** Ese reparto no se pidió; el literal es la respuesta correcta.
- **`URL` y `Suggested H1` vacías.** Son de las fases 14 y 15, y la enmienda del criterio 5 lo dice.
- **Prueba de DinoRank sensible al reloj.** Preexistente de la fase 12, diferida con medición en `deferred-items.md`. Los 418 pasaron en esta corrida.

---

_Verificado: 2026-08-11 — sin gastar cuota de SerpApi ni de Ahrefs_
_Verificador: Claude (gsd-verifier)_

---

## Brecha cerrada — 2026-08-11

La verificación encontró que `Keyword Difficulty` y `Traffic Potential` seguían en
`no_consultado` en las 5.716 filas del Sheet, pese a que 22 cabezas ya tenían el dato medido en
el repositorio. Causa: el commit `2df6650` trajo las métricas de Ahrefs pero no regeneró la
vista consolidada ni la cargó.

Se cerró sin gastar cuota, porque el dato ya estaba en caché:

1. `build-dataset.ts --rebuild` → `keywords-13.jsonl` con **22 filas con KD numérico y 22 con
   traffic potential**.
2. `kw-push.ts --dry-run` → `actualizadas: 5716, insertadas: 0, columnas agregadas: 0`.
3. `kw-push.ts --yes` → cargado en 5 llamadas de red.
4. Segunda corrida idéntica: `actualizadas: 5716, insertadas: 0`. **SHEET-06 sigue probado.**

Verificado leyendo el documento en vivo con scope de solo lectura: `hernia discal` KD 5 y TP
1.500, `estenosis espinal` KD 2 y TP 250, `ortopedia infantil` KD 0 y TP 20.

Las otras 5.694 filas conservan el literal `no_consultado`, que es correcto y distinto de cero:
Ahrefs no devolvió dato para el geo long tail de Lima, y eso está medido, no supuesto.

**Estado final: passed.** Los nueve requisitos de la fase quedaron tildados en
`REQUIREMENTS.md`.
