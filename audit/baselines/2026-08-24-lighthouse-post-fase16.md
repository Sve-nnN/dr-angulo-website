# Línea base de rendimiento tras mergear la fase 16

**Capturado:** 2026-08-24 contra producción, después de mergear el PR #19
**Herramienta:** Unlighthouse con throttling móvil, 24 rutas
**Comparación:** contra la corrida del 2026-08-23 que originó la auditoría

## Lo que la fase 16 no rompió

- **CLS sigue en 0 en las 24 rutas.** Es el mejor número que tiene el sitio en Core Web Vitals y sobrevivió intacto al renombre de slugs, la separación de la FAQ, la reescritura de 111 anchors y el recorte de secciones.
- Performance promedio: **0,90 → 0,92**.
- Las tres URLs nuevas rinden bien de entrada: `/blog/ciatica` 0,96, `/blog/reumatologo-o-traumatologo` 0,95, `/blog/cirugia-de-columna` 0,85.
- Accesibilidad mínima del sitio: 0,93 en `/agendar`, que es el fallo de `<dl>` que arregla el plan 18-01. El resto está en 1,00 salvo la portada, en 0,97 por el contraste.

## El hallazgo que afecta a la fase 18

**Los números de `/testimonios` no reproducen.** Sin que nadie tocara esa página entre una medición y la otra:

| Métrica | 2026-08-23 | 2026-08-24 |
|---|---|---|
| Performance | 0,60 | 0,69 |
| TBT | 850 ms | **361 ms** |
| LCP | 3,47 s | **4,25 s** |

El TBT cayó a menos de la mitad solo. Y el LCP subió a 4,25 s, que hoy es **el peor del sitio**.

Consecuencias para el plan 18-03:

1. Su criterio de cierre está calibrado contra 850 ms de TBT, un valor que no se reproduce. Un criterio de "bajar de 850 a menos de 200" se puede dar por cumplido por variación de la medición y no por el arreglo.
2. Los 2,45 s de Style & Layout y los 630 ms de forced reflow que la auditoría atribuyó a esta página **hay que volver a medirlos antes de buscarles culpable**. Puede que el fenómeno no esté presente hoy.
3. El problema real de `/testimonios` hoy parece ser el **LCP de 4,25 s**, que la auditoría no señaló porque entonces estaba en 3,47 s.

**Método:** una sola corrida de Lighthouse no distingue señal de ruido. Antes de atribuir culpables, correr la página tres veces y quedarse con la mediana.

## Tabla completa

| Ruta | Perf 23 ago | Perf 24 ago | TBT | LCP | CLS |
|---|---|---|---|---|---|
| /testimonios | 0,60 | 0,69 | 361 ms | 4,25 s | 0 |
| / | 0,81 | 0,85 | 0 ms | 3,57 s | 0 |
| /agendar | 0,81 | 0,85 | 6 ms | 3,40 s | 0 |
| /blog/cirugia-de-columna | nueva | 0,85 | 14 ms | 3,42 s | 0 |
| /blog | 0,81 | 0,88 | 0 ms | 3,25 s | 0 |
| /sedes/clinica-tezza | 0,96 | 0,88 | 33 ms | 3,35 s | 0 |
| /sedes/consultorio-privado | 0,93 | 0,91 | 36 ms | 2,92 s | 0 |
| /sedes/sanna-la-molina | 0,90 | 0,91 | 0 ms | 2,31 s | 0 |
| /servicios | 0,89 | 0,93 | 0 ms | 2,71 s | 0 |
| /servicios/hernia-discal | 0,95 | 0,93 | 0 ms | 1,99 s | 0 |
| /sedes/clinica-ricardo-palma | 0,97 | 0,94 | 0 ms | 2,34 s | 0 |
| /servicios/cirugia-minimamente-invasiva | 0,98 | 0,94 | 0 ms | 2,49 s | 0 |
| /servicios/ortopedia-infantil | 0,86 | 0,94 | 0 ms | 2,33 s | 0 |
| /blog/reumatologo-o-traumatologo | nueva | 0,95 | 0 ms | 2,48 s | 0 |
| /servicios/escoliosis-y-deformidades | 0,91 | 0,95 | 0 ms | 2,60 s | 0 |
| /blog/artrosis | 0,96 | 0,96 | 0 ms | 2,17 s | 0 |
| /blog/ciatica | nueva | 0,96 | 0 ms | 2,19 s | 0 |
| /blog/lumbalgia | 0,95 | 0,96 | 0 ms | 2,27 s | 0 |
| /preguntas-frecuentes | 0,97 | 0,96 | 0 ms | 2,23 s | 0 |
| /sobre-el-doctor | 0,91 | 0,96 | 0 ms | 2,73 s | 0 |
| /contacto | 0,97 | 0,97 | 0 ms | 2,12 s | 0 |
| /sedes | 0,97 | 0,97 | 0 ms | 2,11 s | 0 |
| /servicios/estenosis-espinal | 0,96 | 0,97 | 0 ms | 2,11 s | 0 |
| /privacidad | 0,95 | 1,00 | 0 ms | 1,34 s | 0 |
