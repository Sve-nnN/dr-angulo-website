# Validación de SerpApi como fuente principal de expansión — 2026-08-10

Con Ahrefs diferido fuera del milestone, SerpApi pasa a ser la fuente principal de expansión
de KWR-01 y la única vía para medir dificultad orgánica en la fase 13. Se validó con una
llamada real antes de ejecutar la fase 12.

**Consulta:** `cirujano de columna`, engine `google`, `location: Lima, Peru`, `gl=pe`, `hl=es`.

## Restricción dura de cuota, verificada el 2026-08-10

`SERPAPI_API_KEY` está en `.secrets/.env` y el REST directo responde 200. Pero la cuenta está
en plan gratuito:

```
account_email:        juancarlosanguloabud@gmail.com
account_status:       Active
plan_name:            Free Plan
searches_per_month:   250
this_month_usage:     123
total_searches_left:  127
plan_renewal_date:    2026-08-21
account_rate_limit_per_hour: 250
```

**Quedan 127 búsquedas hasta el 21 de agosto.** Con Ahrefs diferido, SerpApi es la fuente
principal de expansión, así que esto deja de ser holgura y pasa a ser el recurso escaso del
milestone.

Reparto propuesto:

| Uso | Búsquedas |
|---|---|
| Expansión de la fase 12 | 60, tope duro en el CLI |
| Margen de reintentos y validación | 20 |
| Sobrante para arrancar la fase 13 | 47 |

**Consecuencia sobre la fase 13:** COMP-03 pide capturar la SERP de cada cluster. Con 20 o 30
clusters, 47 búsquedas no alcanzan. O se espera al reset del 21 de agosto, o se sube de plan.
Se decide al cerrar la fase 12, cuando se sepa el número real de clusters.

**Consecuencia sobre INFRA-03:** el caché deja de ser una optimización de costo y pasa a ser
lo que hace viable el milestone. Cada consulta repetida es 1 de 127. La decisión de caché sin
TTL con invalidación explícita queda confirmada por esto, no solo por preferencia.

**Consecuencia sobre el CLI:** hace falta un tope de cuota que se haga cumplir solo, con
contador persistido entre ejecuciones y aborto al llegar al límite. Un comentario en el código
no sirve.

## Qué devuelve, y para qué sirve cada bloque

| Bloque | Cantidad | Consume |
|---|---|---|
| `related_searches` | 8 | KWR-01, expansión |
| `related_questions` (PAA) | 4 | KWR-01 y ONPAGE-02, jerarquía H2/H3 |
| `organic_results` | 8 | KWR-04, COMP-03 y el proxy de dificultad de KWR-05 |
| `local_results.places` | 3 | COMP-01, competidores del local pack |
| `ai_overview` | presente | Señal de SERP feature para la fase 13 |

## Consecuencias para la fase 12

**KWR-01 tiene margen real.** Doce candidatos por consulta entre related searches y PAA. Con
unas 50 semillas de la capa 1, el bruto ronda los 600 antes de sumar la permutación
determinista. El umbral de 400 post deduplicación deja de ser el riesgo ajustado que marcó el
plan checker en W6.

**El geo funciona.** Los resultados son de Lima, con `regions: ["PE"]` en los orgánicos y
coordenadas del local pack sobre Lima. Se confirma que `location` más `gl` más `hl` es la
combinación correcta y que hay que fijarla en el cliente, no dejarla al azar.

## Consecuencias para la fase 13

**El proxy de dificultad orgánica es viable.** El top 10 de `cirujano de columna` en Lima:

| Pos | Dominio | Qué es |
|---|---|---|
| 1 | cirujanocolumna-elaos.com | Médico individual, exact match |
| 2 | newyorkspinespecialist.com | Contenido internacional, no compite localmente |
| 3 | clinicainternacional.com.pe | Clínica grande, marca fuerte |
| 4 | drciezatraumatologia.com | Médico individual |
| 5 | clinicarthromeds.pe | Clínica mediana |
| 6 | drcarranzacolumna.com | Médico individual, exact match |
| 7 | doctoralia.pe | Directorio |
| 8 | orthoinfo.org | Contenido educativo internacional |

Seis de ocho son alcanzables para un médico individual con contenido propio. Las posiciones 3
y 7 son las que un dominio nuevo no disputa. Eso es dificultad medible sin KD de Ahrefs.

## Hallazgos que no se buscaban

**Los dos competidores que faltaban para COMP-01 aparecieron solos.** El milestone tenía tres
identificados (drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com) y
dos por definir. Candidatos que salieron de esta única consulta:

- **`doctormunguia.com`** — Dr. Gunter Munguía, neurocirujano endoscopista de columna, Surco.
  Local pack posición 2 con 4.8 y 24 reseñas. No estaba en ninguna lista previa.
- **`clinicarthromeds.pe`** — orgánico posición 5, con una URL construida exactamente sobre la
  keyword geo: `/traumatologo-especialista-en-columna-lima-peru/`. Es el patrón que este
  proyecto quiere replicar.
- **Clinica De La Columna** — local pack posición 1 con 34 reseñas, la mayor cantidad del pack.
  Ya figuraba como candidato en la auditoría del 2026-08-10.

Decisión de cuáles dos entran: fase 13, COMP-01.

**La related search sin cubrir sigue viva.** `"Traumatologo especialista en columna clínica
ricardo palma"` aparece literal en `related_searches`. Confirma la prioridad de datos de la
sede Ricardo Palma que ya declara la fase 14.

**Referencia de reseñas del local pack**, útil para GBP-03 del workstream `milestone`:
Clinica De La Columna 3.5 con 34, Dr. Gunter Munguía 4.8 con 24, Centro de Columna Vertebral
5.0 con 13. El doctor está hoy en 5.0 con 6.

---
*Llamada de validación hecha desde la sesión, no desde el CLI. El cliente repetible es parte
del plan `12-03`.*
