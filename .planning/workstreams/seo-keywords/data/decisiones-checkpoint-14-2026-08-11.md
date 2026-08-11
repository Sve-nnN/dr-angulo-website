# Decisiones de Juan sobre el mapa de URLs — 2026-08-11

Tomadas con los datos del plan `14-01` delante, antes de que nada se escribiera en el Sheet del
cliente. Son entrada obligatoria de los planes `14-02`, `14-03`, `14-04` y de toda la fase 15.

## 1. Formato de las páginas de servicio: reescribirlas como guía clínica

**El hallazgo.** Clasificando el top 10 real de cada SERP, tres de las cuatro páginas de
servicio que v1.1 publicó están en el formato equivocado:

| Cabeza | Formato dominante | Reparto medido |
|---|---|---|
| `estenosis espinal` | contenido internacional | **8 de 8** |
| `hernia discal` | contenido internacional | 6 internacional, 1 página de servicio |
| `escoliosis` | contenido internacional | 5 internacional, 1 red social, 1 guía |
| `ortopedia infantil lima` | **página de servicio** | 5 servicio, 2 red social, 1 directorio |

Google responde `estenosis espinal` con ocho de ocho artículos informativos. Una página
comercial no compite ahí. `ortopedia infantil` es la única que ya está en el formato correcto, y
es justo la que la fase 13 había marcado como la más ganable de las cuatro.

**Decisión: la fase 15 las reescribe como guía clínica.** Cuerpo informativo largo, con el CTA
de consulta integrado en el contenido en vez de ser el eje de la página.

**Por qué esta y no mover el objetivo a la variante geo:** es lo que la SERP premia, y el doctor
tiene autoridad médica real para escribirlo. Mover el objetivo a `... en lima` habría sido más
barato pero deja el techo de tráfico mucho más bajo: `escoliosis` sola vale 18.000 de volumen y
3.400 de potencial.

**Consecuencia para la fase 15:** el alcance de redacción crece. No es ajustar títulos y metas:
son tres piezas de contenido clínico largo. Y el copy médico entra bajo la restricción YMYL del
proyecto — solo lo verificado, sin afirmar credenciales, cifras ni resultados.

## 2. `/servicios/escoliosis` se renombra a `/servicios/escoliosis-y-deformidades`

El slug publicado es `/servicios/escoliosis`; el entregable de las 10 de Oro asumía el largo.

**Decisión: renombrar.** La URL pasa a cubrir escoliosis **y otras deformidades de columna bajo
un paraguas**, no solo escoliosis.

**Lo que arrastra, y es trabajo de v1.1, no de este workstream:**
- Redirección 301 de `/servicios/escoliosis` a la nueva.
- Sitemap.
- Enlaces internos ya escritos que apunten al slug viejo.

**Por qué tiene sentido pese al costo:** `cifosis` quedó fuera de las 10 de Oro por un punto,
pero el doctor la opera (confirmado por Juan el 2026-08-11) y tiene KD 3 con 3.600 de volumen.
El paraguas de deformidades es donde entra, sin necesidad de una URL propia.

## 3. `/sedes` queda como hub sin keyword propia

Existe y ningún documento de planificación la contemplaba. Compite de frente con las cuatro
páginas de sede individuales.

**Decisión: navegación hacia las cuatro sedes, sin pelear ningún término.** Elimina la
canibalización de raíz y deja que toda la señal se concentre en las páginas de clínica, que son
las que sí formaron clusters propios y limpios en la fase 13.

**Consecuencia para MAP-01:** `/sedes` es la única URL viva que queda sin keyword primaria, y
eso es deliberado. El mapa tiene que declararlo como decisión y no como omisión, o la
verificación de la fase lo va a leer como un hueco.

**Consecuencia para MAP-05:** es un nodo de enlazado puro. Enlaza a las cuatro sedes y recibe
enlaces desde la home, sin anchor optimizado.

---

## Lo que estas tres decisiones dejan pendiente

- **Los cuatro posts del blog nombran las mismas condiciones que las páginas de servicio**
  (`estenosis-espinal-que-es`, `hernia-discal-o-dolor-de-espalda-como-diferenciarlos`). Con las
  páginas de servicio yéndose a formato guía, el solape se agrava: post y página van a competir
  por la misma intención informativa. **Hay que resolverlo en `14-03`**, cuando se cruce la
  canibalización: o el post se fusiona con la guía, o pasa a un ángulo distinto, o redirige.
- **La renumeración de la URL de escoliosis** hay que comunicársela al workstream `milestone`.
  Es la clase de cambio que si se descubre tarde deja enlaces rotos en producción.
