# Línea base con PageSpeed Insights, producción

**Capturado:** 2026-08-25, contra `https://drangulocolumna.com/`, estrategia móvil
**Herramienta:** PageSpeed Insights API. **Mide desde infraestructura de Google, no desde la máquina de desarrollo.**

## Por qué esta medición vale más que las locales

La fase 18 documentó que la máquina de desarrollo no puede producir veredictos de rendimiento: tres corridas sin cambios de código dieron TBT de 21, 2.054 y 225 ms en la misma ruta. PSI corre en infraestructura de Google con condiciones controladas, así que resuelve ese problema.

**Recomendación de método: para cualquier umbral de rendimiento, usar PSI y no Lighthouse local.** La clave de API está en `.env` como `PAGESPEED_API_KEY`.

## Laboratorio, portada, móvil

| Métrica | Valor |
|---|---|
| Performance | **0,91** |
| Total Blocking Time | **0 ms** |
| Cumulative Layout Shift | **0** |
| Largest Contentful Paint | 3,4 s |

## Datos de campo (CrUX): insuficientes

`overall_category` devuelve que no hay datos suficientes. El sitio es demasiado nuevo y tiene poco tráfico real para que Google acumule mediciones de usuarios.

**Consecuencia:** los umbrales que la fase 18 dejó diferidos a "medición de campo" no se pueden cerrar todavía por esa vía tampoco. Se cierran cuando el sitio acumule tráfico, que depende de que la indexación avance (fase 17).

## Lo que esto confirma

**El TBT de 0 ms medido por Google es la evidencia más fuerte que tenemos** de que el sitio no tiene trabajo bloqueante de JavaScript. Corrobora las tres conclusiones de la fase 18:

1. El veredicto NO REPRODUCE sobre los 850 ms de TBT que la auditoría atribuyó a `/testimonios`.
2. Que el LCP del sitio está dominado por el TTFB y no por trabajo de cliente.
3. Que la Cache Rule de Cloudflare (CWV-01, issue #7) es la palanca que queda: con TBT en 0 y CLS en 0, el único número que separa al sitio de un 0,95 o más es el LCP, y el LCP es tiempo hasta el primer byte.
