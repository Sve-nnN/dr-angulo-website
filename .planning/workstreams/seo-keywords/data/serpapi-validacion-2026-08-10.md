# Validación de SerpApi como fuente principal de expansión — 2026-08-10

Con Ahrefs diferido fuera del milestone, SerpApi pasa a ser la fuente principal de expansión
de KWR-01 y la única vía para medir dificultad orgánica en la fase 13. Se validó con una
llamada real antes de ejecutar la fase 12.

**Consulta:** `cirujano de columna`, engine `google`, `location: Lima, Peru`, `gl=pe`, `hl=es`.

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
