# Baseline de impresiones partidas por los UTM del perfil de Google Business (MEAS-01)

**Capturado:** 2026-08-23
**Registrado:** 2026-08-25
**Fuente:** Search Console, `sc-domain:drangulocolumna.com`
**Período:** 2026-07-23 a 2026-08-19
**Motivo:** el enlace del perfil de Google Business lleva parámetros `utm`, y Search Console trata cada URL con parámetros como una página distinta. El informe de rendimiento queda partido en dos y no se puede leer el desempeño de la portada de un vistazo. Este archivo registra el punto de partida para poder comprobar, 30 días después del cambio, que las filas se consolidaron.

## El reparto de partida

892 impresiones totales del sitio en el período, repartidas en apenas 6 URLs. De esas, **778 caen en URLs con `?utm_source=google&utm_medium=organic&utm_campaign=gbp`**, es decir el 87 %.

| URL | Impresiones |
|---|---|
| `/?utm_source=google&utm_medium=organic&utm_campaign=gbp` | 673 |
| `/servicios` con los mismos parámetros | 75 |
| `/agendar` con los mismos parámetros | 30 |
| **Subtotal con parámetros** | **778** |
| Resto, en URLs limpias | 114 |
| **Total** | **892** |

## Qué se arregla y qué no

No hay riesgo de contenido duplicado y nunca lo hubo: el canonical de las URLs con parámetros ya apunta a la versión limpia, y Google lo respeta. Lo que se arregla es el **reporte**, no la indexación.

Tampoco se pierde la medición del canal. Google Business tiene su propio informe, que ya cuenta clics al sitio desde la ficha. La decisión cambia la fuente de esa medición, no la elimina. El razonamiento completo está en `docs/google-business-profile.md`, sección "Por qué el enlace va sin utm".

## Qué se espera después del cambio

1. Las tres filas con parámetros dejan de recibir impresiones nuevas. Las históricas no desaparecen: siguen en el período que ya pasó, como corresponde.
2. Las filas limpias de `/`, `/servicios` y `/agendar` absorben el volumen que antes iba a las filas con parámetros.
3. El total del sitio no debería moverse por este cambio. Si se mueve, el motivo es otro y hay que buscarlo aparte.

## Cómo se comprueba

En Search Console, informe de Rendimiento, pestaña Páginas:

- Filtrar por URL que contenga `utm_campaign=gbp` sobre los últimos 28 días. Tiene que devolver **cero impresiones**.
- Comparar las filas limpias de `/`, `/servicios` y `/agendar` contra los 673, 75 y 30 de arriba. El orden de magnitud tiene que ser comparable, ajustando por la variación normal del tráfico entre períodos.

Un cero en el primer filtro con las filas limpias vacías no es consolidación: es tráfico perdido, y hay que averiguar por qué antes de dar el cambio por bueno.

## Cuándo se comprueba

La ventana arranca el día en que Juan edita la ficha en el panel, no el día en que se escribió esta decisión. Sin esa fecha, la ventana no arranca y la verificación no es comprobable.

```
Fecha en que Juan aplicó el cambio en la ficha: ____
```

**Verificación de consolidación: 30 días después de esa fecha.** Treinta y no menos, porque el informe de Search Console tarde unos días en asentarse y porque hace falta una ventana de 28 días completa después del cambio para que el filtro de arriba sea concluyente.

Esta comprobación no bloquea el cierre de la fase 19. Queda como pendiente con fecha.
