# seo-tools

Tooling de datos del milestone v1.2 (workstream `seo-keywords`, fases 12 a 15).

## 1. Que es y que no es

Es una herramienta de datos: consulta fuentes de SEO, construye el universo de keywords y
escribe en el Sheet del cliente. Vive fuera de la aplicacion.

**No forma parte del sitio que se despliega.** No es una ruta, no es un componente y no se
importa desde `src/`. Es un paquete Node independiente con su propio `package.json`,
`package-lock.json`, `node_modules/` y `tsconfig.json`. No esta registrado en el
`package.json` de la raiz y el constructor de la imagen de produccion no lo instala: en la
imagen entra solo el fuente TypeScript, que son unos cien kilobytes muertos.

El reparto del milestone es que v1.2 manda en keywords y textos, y v1.1 manda en codigo.
Por eso ninguna fase de este workstream escribe bajo `src/`.

## 2. Como se corre

El script `cli` carga las variables desde `.secrets/.env` de la raiz del repositorio, con el
soporte nativo de Node, sin dependencia de terceros. Todo se ejecuta desde `seo-tools/`.

```bash
cd seo-tools
npm install

npm run cli -- sheet:inspect
npm run cli -- cache:stats
npm run cli -- cache:put --source dinorank --key <hash de 64 caracteres> --file payload.json

npm run cli -- kw:seeds
npm run cli -- kw:expand --limit 200
npm run cli -- kw:classify
npm run cli -- kw:enrich --plan-only
npm run cli -- dino:probe --country pe
npm run cli -- sheet:push --tab "Keyword Research" --dry-run

npm run typecheck
npm test
```

Banderas globales: `--refresh` (ignora el acierto de cache y vuelve a consultar), `--offline`
(prohibe salir a la red y convierte un fallo de cache en error duro), `--plan-only`,
`--dry-run`, `--yes`, `--max-searches` y `--limit`. Las dos ultimas son distintas entre si:
`--max-searches` topea el gasto de cuota, `--limit` acota cuantos items se procesan.

No hay expiracion automatica de la cache. La invalidacion es explicita con `--refresh`, porque
un criterio de exito de la fase es reprocesar el analisis completo sin volver a gastar cuota y
una expiracion silenciosa rompe eso justo cuando menos conviene.

## 3. Que credencial necesita cada subcomando

| Subcomando | Credencial | Notas |
|---|---|---|
| `sheet:inspect` | `SEO_SHEET_ID` + `GOOGLE_SERVICE_ACCOUNT_FILE` | La service account necesita rol **Editor**, no Lector |
| `sheet:push` | `SEO_SHEET_ID` + `GOOGLE_SERVICE_ACCOUNT_FILE` | Idem |
| `cache:stats` | **ninguna** | Corre siempre, incluso con la cache vacia |
| `cache:put` | **ninguna** | Rellena la cache desde afuera |
| `kw:seeds` | **ninguna** | Lee el contenido del sitio, no la red |
| `kw:classify` | **ninguna** | Motor de reglas determinista, sin red |
| `kw:expand` | `SERPAPI_API_KEY` | Con `--offline` corre sin clave si la consulta ya esta en cache |
| `kw:enrich` | `DINORANK_API_KEY` | Idem |
| `dino:probe` | `DINORANK_API_KEY` | Se sondea con `country=pe`, nunca con `es` |

Las pruebas (`npm test`) no necesitan ninguna credencial y no tocan la red.

**La fase corre sobre DinoRank y SerpApi unicamente.** El enriquecimiento con metricas de
Ahrefs quedo diferido por decision de Juan del 2026-08-10: cero cliente, cero clave, cero
llamadas.

Son **tres** columnas las que quedan diferidas, no dos:

1. `Traffic Potential`
2. `Keyword Difficulty`
3. `Referring Domains Needed `

Las tres existen en el dataset y en el Sheet con el valor literal `no_consultado`, y **no se
borran**. Dejarlas permite retomar el enriquecimiento mas adelante sin migrar el esquema.
Ojo con `Referring Domains Needed `: el encabezado real del Sheet lleva un espacio final.

**Presupuesto de cuota.** SerpApi esta en plan gratuito con 250 busquedas al mes: quedan 127
hasta el 21 de agosto de 2026. El gasto esta acotado por codigo, no por buena intencion. Hay
un libro persistido de llamadas que salieron a la red de verdad y un tope por corrida que
**aborta** en vez de seguir gastando. El consumo acumulado se consulta con `cache:stats`.

## 4. Impacto sobre el workstream `milestone`

**Este paquete edito dos archivos compartidos de la raiz. Son los dos unicos de todo el
milestone v1.2, y revertirlos rompe el build de produccion de v1.1.**

| Archivo | Cambio |
|---|---|
| `tsconfig.json` | `"seo-tools"` agregado al arreglo `exclude` |
| `eslint.config.mjs` | `"seo-tools/**"` agregado a los patrones de `globalIgnores` |

Por que era necesario: el `tsconfig.json` de la raiz declara `include` con el patron `**/*.ts`,
que alcanza `seo-tools/src/*.ts`. Next falla el build de produccion ante cualquier error de
TypeScript del proyecto, y como las dependencias de este paquete no estan en el
`node_modules` de la raiz, el compilador reportaba modulo no encontrado. Sin la exclusion,
`next build` empieza a fallar con errores en archivos que nada tienen que ver con la
aplicacion y el deploy de Dokploy se cae **sin que se vea el motivo**.

**Si alguien revierte esas dos lineas, el deploy de produccion vuelve a romperse.** El gate
que lo detecta es este, y debe imprimir `0`:

```bash
npx tsc --noEmit --listFiles | grep -c '/seo-tools/'
```

El `package.json` de la raiz **no se toco** y no debe tocarse: no tiene campo `workspaces`,
este paquete no es un espacio de trabajo de la raiz, y agregarlo meteria las dependencias del
tooling en la imagen de produccion.

## 5. Donde vive cada artefacto

| Artefacto | Ruta | Git |
|---|---|---|
| Cache cruda de respuestas | `seo-tools/.cache/{fuente}/{hash}.json` | ignorada |
| Libro de cuota consumida | `seo-tools/.cache/_quota.json` | ignorado |
| Dependencias | `seo-tools/node_modules/` | ignoradas |
| Dataset consolidado | `seo-tools/data/` | **commiteado** |
| Volcado de encabezados del Sheet | `.planning/workstreams/seo-keywords/data/sheet-headers.json` | **commiteado** |

La cache cruda se ignora porque son miles de archivos en un repositorio compartido con el
workstream `milestone`. Lo que si se commitea es el dataset consolidado, que es la evidencia
reproducible de donde salio cada numero.

`seo-tools/.gitignore` es propio y usa patrones sin barra final a proposito: el `.gitignore`
de la raiz tiene `/node_modules` con barra inicial, que ancla el patron a la raiz y **no**
cubre esta carpeta.

Ninguna credencial entra al control de versiones. `.secrets/` esta ignorado, los parametros
que parecen claves se recortan antes de escribir cualquier archivo de cache, y los mensajes de
error reportan como maximo la longitud y el prefijo de cuatro caracteres de una clave, nunca
su valor.
