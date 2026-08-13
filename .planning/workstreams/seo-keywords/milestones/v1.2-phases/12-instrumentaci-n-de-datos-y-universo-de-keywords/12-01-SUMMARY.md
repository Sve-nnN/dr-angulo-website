# Plan 12-01 — Resumen

**Plan:** Guardarraíl de build, paquete `seo-tools`, seam de caché y sondeo del Sheet
**Wave:** 1
**Requisitos:** INFRA-01, INFRA-03
**Cerrado:** 2026-08-10

> **Nota de procedencia.** El agente ejecutor completó y commiteó las tres tareas, pero murió
> por límite de sesión durante la verificación de cierre, antes de escribir este archivo. El
> resumen lo redactó el orquestador después de correr las ocho comprobaciones a mano contra el
> árbol real. Cada resultado de abajo salió de una ejecución, no del plan.

## Commits

| Hash | Qué |
|---|---|
| `7827eb8` | Guardarraíl de build, paquete `seo-tools` y `sheet:inspect` |
| `40c27ca` | Pruebas del seam de caché, la cuota y la normalización |
| `d661c44` | Seam de caché direccionable por contenido con modo offline |
| `d2f4982` | Contrato de subcomandos, stubs tipados y README de handoff |
| `aff3418` | Volcado de encabezados actualizado tras la segunda corrida |

## Verificación de cierre, corrida a mano

| Comprobación | Resultado |
|---|---|
| El compilador de la app no ve `seo-tools` | **0 archivos** en `tsc --listFiles` |
| `npx tsc --noEmit` de la aplicación | Sin errores |
| `npm run typecheck` del paquete | Código 0 |
| `npm test` del paquete | **25 de 25** |
| eslint ignora `seo-tools` | Presente en `globalIgnores` |
| `package.json` raíz sin `workspaces` | Confirmado |
| Cero menciones a Ahrefs en `seo-tools/src` | Confirmado |
| `createHash` en un solo lugar de producción | Confirmado |
| Cero credenciales en el historial | `.secrets` no aparece en ningún commit |
| Cero rangos fijos a la fila 1 | Confirmado |

## Lo que quedó entregado

**El guardarraíl que protege el deploy de v1.1.** `exclude: ["node_modules","seo-tools"]` en el
`tsconfig.json` raíz, más la entrada en `globalIgnores` de eslint. Es la única vez que este
milestone toca un archivo compartido, y está justificado: sin eso, el primer `.ts` bajo
`seo-tools/` habría roto el build de producción del workstream `milestone`, que estaba
desplegando en paralelo ese mismo día. El gate es mecánico, no una nota:
`test "$(npx tsc --noEmit --listFiles | grep -c '/seo-tools/')" -eq 0`.

**El paquete `seo-tools/`** como manifiesto propio, aparte del `package.json` raíz que Nixpacks
lee para construir la imagen de producción. TypeScript sobre Node 24 con `tsx`, credenciales
por `node --env-file` desde `.secrets/.env`, sin `dotenv`.

**El seam de caché (INFRA-03).** Un JSON por respuesta bajo `.cache/{fuente}/{sha256}.json`,
sin TTL, invalidación explícita con `--refresh`, y modo `--offline` que aborta duro ante
cualquier fallo de caché. Ese modo es lo que hace mecánicamente verificable el criterio de
éxito 2 de la fase, en vez de una promesa.

**El libro de cuota.** Contador persistido en disco que sobrevive entre procesos y **aborta**
al llegar al tope, con `--max-searches`. Nació de medir que la cuenta de SerpApi estaba en plan
gratuito con 127 búsquedas hasta el 21 de agosto. No es un aviso: es un límite.

**El contrato de subcomandos completo, con stubs tipados.** Deliberado: permite que los planes
02 y 03 corran en paralelo en la wave 2 sin tocar `cli.ts` ninguno de los dos. El parser acepta
pares `--flag[=value]` arbitrarios y los pasa a través, porque los planes de abajo tienen
prohibido editar ese archivo y una lista cerrada los habría bloqueado sin salida.

**`sheet:inspect` (mitad de INFRA-01).** Prueba lectura, prueba escritura con un round trip a
celda de descarte, y vuelca los encabezados reales de los 11 tabs.

## Lo que la ejecución descubrió y el plan no sabía

**El acceso de escritura al Sheet estaba sin verificar y ahora está probado.** `writeProbe: ok`
sobre `'Index'!Z970`, con limpieza posterior. Era el mayor desconocido de la fase.

**La detección automática de la fila de encabezados coincide con el reconocimiento manual.**
Filas 3, 3, 2 y 2 para `Keyword Research`, `Content Model`, `Canonical Audit` e
`Internal Linking Audit`; 18 encabezados en `Keyword Research`, **5 de ellos con espacio
final**. La fila 1 de cada tab es un banner decorativo, no encabezados. Cualquier escritor que
asumiera la fila 1 no habría encontrado ni una columna en ningún tab.

## Handoff

- Los planes 02 y 03 construyen sobre `cache.ts`, `quota.ts`, `normalize.ts`, `http.ts` y
  `config.ts` sin reescribirlos.
- `cli.ts` queda cerrado. Ningún plan posterior lo edita.
- El volcado de encabezados en `.planning/workstreams/seo-keywords/data/sheet-headers.json` es
  la entrada del checkpoint del plan 02.
