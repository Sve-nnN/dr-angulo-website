# Deuda diferida del workstream `seo-keywords`

Cada entrada lleva la condición que la habilita y una fecha de revisión. Una deuda sin fecha es un
olvido con mejor nombre.

---

## D-1 · Revisión de canibalización con datos reales de Search Console

- **Origen:** fase 14, plan 14-03 (MAP-02). Decisión de Juan del 2026-08-11.
- **Estado hoy:** `/canibalizaciones` de DinoRank devuelve `has_data: false` y cero keywords. El
  sitio es de agosto de 2026 y no acumuló impresiones, aunque Search Console esté vinculado desde
  el 2026-08-09.
- **Condición que la habilita:** que `/canibalizaciones` reporte al menos una keyword.
- **Fecha de revisión:** **2026-11-11**. Si el endpoint sigue vacío, se reprograma con fecha
  nueva escrita; no se cierra.
- **Detalle completo:** `phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-CANIBALIZACION.md`,
  sección 3.

## D-2 · SERP de marca para `/sobre-el-doctor`

- **Origen:** fase 14, plan 14-03.
- **Por qué:** el universo de la fase 13 se construyó desde semillas de condición y de
  especialidad, así que no hay ni una cabeza de marca medida. `/sobre-el-doctor` entra al mapa sin
  primaria por eso, no por decisión editorial.
- **Condición que la habilita:** cuota de SerpApi repuesta el **2026-08-21** (hoy 96 de 102).
- **Fecha de revisión:** 2026-08-21.

## D-3 · Medir la SERP de `tendinitis` (14.800) y `fracturas` (6.600)

- **Origen:** fase 13, arrastrada por 14-CONTEXT.md.
- **Por qué:** son la primera y la segunda keyword de mayor volumen del universo y nunca se
  midieron, por presupuesto de SerpApi.
- **Fecha de revisión:** 2026-08-21, con la cuota repuesta.

## D-4 · `cifosis` como candidata de la próxima ronda de oro

- **Origen:** fase 13. El doctor la opera (confirmado por Juan el 2026-08-11), KD 3 y 3.600 de
  volumen. Quedó fuera de las 10 de Oro por un punto y Juan decidió respetar el criterio.
- **Dónde vive mientras tanto:** bajo el paraguas de
  `/servicios/escoliosis-y-deformidades`.
- **Fecha de revisión:** próxima revisión de las 10 de Oro.

## D-5 · Auditoría on-page con `/auditoria` de DinoRank

- **Origen:** fase 15, ONPAGE-05.
- **Condición que la habilita:** que `drangulocolumna.com` esté dado de alta como proyecto en
  DinoRank y que el rastreo haya terminado. Hoy `/auditoria` responde HTTP 500 con un dominio que
  no es proyecto de la cuenta.
- **Fecha de revisión:** **vencida — se activa ahora.** La fase 14 cerró el 2026-08-12 y la 15 es
  la siguiente. Es lo primero que hay que resolver al planificarla, porque ONPAGE-05 no se puede
  cerrar sin este endpoint y no lo destraba el tooling: hay que darlo de alta a mano.

## D-6 · Seis nodos de la matriz sin anchor optimizado

- **Origen:** fase 14, plan 14-04 (MAP-05), heredado de 14-03.
- **Por qué:** seis URLs no tienen keywords secundarias medidas, así que su anchor sale de lo que
  hay en vez de la keyword que convendría. No invalida la matriz: los 135 enlaces cumplen que
  ningún anchor apunte a dos destinos y que ninguna URL quede huérfana.
- **Condición que la habilita:** que la fase 15 derive las secundarias por URL para ONPAGE-03.
- **Fecha de revisión:** con el cierre de ONPAGE-03 en la fase 15.
