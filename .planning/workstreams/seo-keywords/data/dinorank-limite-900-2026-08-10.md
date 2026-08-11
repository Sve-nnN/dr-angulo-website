# El techo de 900 de DinoRank y el hueco de las condiciones núcleo — 2026-08-10

Levantado durante la verificación de la fase 12, después de que el verificador detectara que
faltaban métricas en keywords de alcance objetivo.

## El hecho

**Las cuatro condiciones núcleo del negocio no tienen volumen, CPC ni competencia** en
`keywords.jsonl`:

| Keyword | Estado |
|---|---|
| `hernia discal` | sin métricas |
| `estenosis espinal` | sin métricas |
| `escoliosis` | sin métricas |
| `ortopedia infantil` | sin métricas |

Son exactamente las cuatro páginas de servicio que el workstream `milestone` ya publicó en
`src/app/servicios/[slug]`, y las cuatro que la fase 14 tiene que mapear en el handoff MAP-03.

## Por qué faltan: dos causas encadenadas

**Causa 1, ya documentada.** DinoRank nunca devuelve la keyword consultada dentro de su propio
array `keywords[]`. Verificado por el plan 12-05 sobre 70 respuestas: 0 de 70. El endpoint
descubre, no consulta. Por eso una semilla nunca se auto-enriquece.

**Causa 2, nueva.** El array de relacionadas está **truncado en 900**. Medido en cuatro
consultas independientes:

| Consulta | Relacionadas |
|---|---:|
| `hernia` | 900 |
| `estenosis` | 808 |
| `escoliosis columna` | 79 |
| `ortopedia` | 900 |

Tres de las cuatro tocan el techo. `hernia discal` **no aparece** entre las 900 relacionadas de
`hernia`, lo que es imposible si el listado fuera exhaustivo: es la colocación más obvia del
término. Está más allá del corte.

`estenosis espinal` sí apareció, pero con `search_volume: 0`.

## Las tres consecuencias que importan

**1. El universo de 5716 es una muestra truncada, no un censo.** Cada semilla aporta como
máximo 900 relacionadas. Con 40 semillas el techo teórico son 36.000 y se obtuvieron 6.242
brutas, así que el truncamiento no muerde en todas, pero **sí muerde en los términos cabecera
más importantes**, que son justamente los del negocio central. La fase 13 no debe leer el
universo como "todo lo que se busca en Lima".

**2. La cobertura del 36% con volumen medible probablemente subestima.** No todas las keywords
sin volumen carecen de demanda: algunas cayeron del lado equivocado del corte.

**3. Hay una discrepancia entre fuentes sin resolver.** Ahrefs, consultado el 2026-08-10 para
Perú antes de que se difiriera, devolvió para `hernia discal`: **volumen 6.000, KD 5, traffic
potential 1.500**. DataForSEO vía DinoRank devuelve 0 para la misma keyword y el mismo país.
Una de las dos está equivocada, y la diferencia no es de matiz.

Dato de contexto que inclina la balanza: Ahrefs devolvió **vacío** para el geo long tail
(`hernia discal lima`) donde DinoRank sí tiene datos. Las dos fuentes tienen agujeros
distintos, y ninguna es un censo.

## Qué hacer con esto, y qué no

**No es bloqueante para cerrar la fase 12.** El objetivo era instrumentar las fuentes y
levantar el universo con métricas e intención, y eso está entregado y verificado. Este es un
límite de la fuente, no un defecto del tooling: el cliente parsea correctamente lo que la API
devuelve.

**Sí condiciona la fase 13.** Las "10 de Oro" de KWR-06 se eligen por valor de negocio, y las
cuatro condiciones núcleo van a entrar en esa lista por relevancia clínica aunque su volumen
figure vacío. La fase 13 tiene que decidir explícitamente entre:

- Reincorporar Ahrefs solo para las cuatro condiciones núcleo y un puñado de cabeceras, que es
  un puñado de unidades sobre una cuenta con 66.000 libres.
- Medir demanda por la SERP con SerpApi, que ya es requisito de COMP-03, en vez de por volumen
  declarado.
- Aceptar el vacío y priorizar esas cuatro por criterio de negocio, dejando la celda de volumen
  vacía en el Sheet.

**Lo que no hay que hacer es rellenar el hueco con un cero.** `search_volume: 0` de DataForSEO
y "sin dato" son cosas distintas, y confundirlas haría que las cuatro condiciones centrales del
consultorio aparezcan al final de cualquier orden por volumen. El escritor del Sheet ya
distingue los dos casos: deja la celda vacía en vez de escribir cero.

---
*Medido con 4 llamadas a DinoRank durante la verificación. El caché de 186 respuestas se
revisó primero: ninguna de las cuatro aparecía en ella.*
