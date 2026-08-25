# Fiabilidad de la medición: qué probó esta fase y qué no

**Fase:** 18 — Rendimiento y accesibilidad
**Medido:** 2026-08-24, tres corridas de Unlighthouse sobre el build local de la rama
**Alcance:** aplica a los cinco planes. Los SUMMARY lo referencian en vez de repetirlo.

Este archivo existe porque una fase que declara cinco requisitos cerrados apoyada en
números que saltan de 0 a 2.054 ms no está cerrando nada: está tapando. Acá queda
escrito, con los números crudos, qué se puede afirmar desde el entorno de medición
que tuvimos y qué hay que diferir a producción.

---

## 1. La varianza medida

**Tres corridas consecutivas, sin un solo cambio de código entre ellas.**

| Ruta | TBT corrida 1 | TBT corrida 2 | TBT corrida 3 | Rango |
|---|---|---|---|---|
| `/privacidad` | 21 ms | **2.054 ms** | 225 ms | **97×** |
| `/` | 54 ms | 5 ms | 482 ms | **96×** |
| `/sobre-el-doctor` | 404 ms | 257 ms | **0 ms** | de 0 a 404 ms |
| `/contacto` | 24 ms | 0 ms | 142 ms | de 0 a 142 ms |

El mismo código, la misma ruta, el mismo día: el TBT salta de 0 a 482 ms en la
portada y de 21 a 2.054 ms en la página más liviana del sitio.

**La causa es carga de la máquina que mide**, no del sitio. Lighthouse en laboratorio
mide un navegador compitiendo por CPU con todo lo demás que corre en el equipo, y
esta fase midió sobre una máquina de trabajo, no sobre un runner aislado.

---

## 2. Lo que sí se puede afirmar

Todo lo que salió **idéntico en las tres corridas**, o que no es una medición de
tiempo.

| Afirmación | Evidencia | Por qué es firme |
|---|---|---|
| **CLS = 0 en las 24 rutas** | Idéntico en las tres corridas | Es el criterio duro de la fase, y no depende de cuánta CPU haya libre: un salto de layout ocurre o no ocurre. |
| **Accesibilidad 1,00 en el sitio entero** | Estable en las corridas 2 y 3, con `color-contrast`, `definition-list`, `dlitem` y `heading-order` en verde en las 24 rutas | Son aserciones sobre el árbol de accesibilidad renderizado, no mediciones de tiempo. |
| **`lcp-discovery-insight` = 1**, con `priorityHinted`, `requestDiscoverable` y `eagerlyLoaded` en `true` | Corrida del checkpoint de 18-04 | Es un checklist booleano sobre el marcado emitido. La carga de máquina no lo mueve. |
| **137.971 bytes menos de JavaScript por ruta en las 24** | Medición directa sobre `.next/static/chunks/` cruzada con los documentos que los referencian | **No es laboratorio: son bytes servidos.** Se cuentan con `wc -c`, no con un cronómetro. |
| Las dos sondas de código muerto en cero | Aserción sobre el build | Determinista, corre en la compuerta. |
| Las aserciones de HTML prerenderizado de A11Y-01 | `grep` sobre `.next/server/app/**` | Determinista. |

---

## 3. Lo que NO se puede afirmar desde acá

**Cualquier criterio que dependa de un umbral de TBT o de un puntaje de
performance.** Con un rango de 97× en la misma ruta, un número que caiga del lado
correcto del umbral no distingue el arreglo de la suerte, y uno que caiga del lado
incorrecto no prueba una regresión.

Criterios concretos que quedan **diferidos, no cumplidos**:

| Requisito | Criterio que no se puede verificar en local |
|---|---|
| CWV-02 | "`/testimonios` puntúa por encima de 0,90 en performance" y "TBT por debajo de 200 ms" |
| CWV-04 | "el ahorro reportado por *Reduce unused JavaScript* es menor a 15 KB" |
| CWV-03 | El LCP en segundos. El checklist de `lcp-discovery` sí es firme; el tiempo no. |

**La vía correcta para estos tres es medición contra producción después del deploy,
e idealmente datos de campo de CrUX**, que promedian usuarios reales en vez de una
corrida de laboratorio en una máquina ocupada.

Y hay una razón adicional, específica de esta fase, para no cerrarlos en local: **el
LCP y el TTFB del sitio dependen de la Cache Rule del plan 18-02**, que vive en el
panel de Cloudflare y no existe en un build local. Medir esos umbrales antes de que
la regla esté aplicada mide el problema de otro plan.

---

## 4. Cómo esto refuerza el NO REPRODUCE de `/testimonios`

Hay una lectura de la tabla de arriba que no es una limitación sino una prueba.

**`/testimonios` dio TBT de 0 ms en las tres corridas.** Los 850 ms que la auditoría
del 2026-08-23 reportó para esa ruta no aparecen ni una sola vez, ni siquiera en la
corrida en la que `/privacidad` marcó 2.054 ms por carga de máquina.

Con eso, el veredicto de CWV-02 queda sostenido por **tres evidencias
independientes**, cada una de una naturaleza distinta:

| # | Evidencia | Tipo | Qué establece |
|---|---|---|---|
| 1 | Las cuatro lecturas de geometría del proyecto viven en `reels-carousel.tsx`, que no se monta en producción | **Prueba de imposibilidad** | Por qué el forced reflow *no puede* ocurrir |
| 2 | La portada tiene 2,07× el DOM y la misma hoja de 47.276 B, y da 0 ms | **Contradicción** | Que el volumen de esta página no explica 2,45 s |
| 3 | **TBT de 0 ms en tres corridas** | **Medición directa** | Que la métrica reportada, medida tres veces, da cero |

La tercera es la más directa: mide exactamente la cifra que la auditoría reportó, y
la mide repetidamente. Que las tres vías, de tipos distintos, converjan en el mismo
veredicto es lo que lo vuelve sólido.

**Nota de coherencia, dicha de frente.** La sección 3 dice que los umbrales de TBT no
son verificables acá, y esta sección usa un TBT para sostener un veredicto. No es
contradicción, y la diferencia importa: la varianza medida siempre empuja el TBT
**hacia arriba** desde el piso, nunca por debajo de cero. Un TBT alto en una corrida
no prueba nada porque puede ser la máquina; **un TBT de cero en tres corridas
seguidas sí prueba que no hay trabajo bloqueante que medir**, porque ninguna carga
de máquina puede esconder 850 ms de trabajo real hacia abajo. Por eso este uso es
legítimo y el de la sección 3 no lo sería.

---

## 5. Lección de método para las fases siguientes

Esta fase ya llevaba escrita, desde la planificación, la regla de que toda cifra va
como mediana de tres corridas en la misma sesión. La regla salió de que el TBT de
`/testimonios` cayó de 850 ms a 361 ms entre dos días sin que nadie tocara la página.

**La regla se ganó su lugar tres veces más en la ejecución:**

1. `/privacidad` marcó 0,67 con 2.054 ms en una corrida y quedó en 0,90 de mediana.
   Una sola corrida lo habría reportado como regresión de 18-05.
2. Los 2,45 s de Style & Layout y los 630 ms de forced reflow no reprodujeron nunca.
3. El LCP de `/sobre-el-doctor` se movió 0,09 s entre dos días sin cambios.

**Para la fase 19:** no calibrar criterios de aceptación contra un número de TBT o de
puntaje tomado de una sola corrida de laboratorio. O se mide contra producción con
mediana de tres, o el criterio se escribe sobre algo determinista: bytes servidos,
conteos sobre el HTML prerenderizado, checklists booleanos como
`lcp-discovery-insight`, o CLS.
