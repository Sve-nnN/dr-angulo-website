---
phase: 15-paquete-on-page-por-url
reviewed: 2026-08-13T00:00:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - seo-tools/data/copy-blog.json
  - seo-tools/data/copy-guias.json
  - seo-tools/data/copy-sedes.json
  - seo-tools/data/copy-servicios.json
  - seo-tools/data/onpage-audit.json
  - seo-tools/data/onpage-serp.json
  - seo-tools/data/onpage.json
  - seo-tools/data/sheet-columns.json
  - seo-tools/data/tells-ia.json
  - seo-tools/src/phase13/args.ts
  - seo-tools/src/phase15/auditoria.test.ts
  - seo-tools/src/phase15/auditoria.ts
  - seo-tools/src/phase15/entidades.test.ts
  - seo-tools/src/phase15/entidades.ts
  - seo-tools/src/phase15/kr-h1-push.test.ts
  - seo-tools/src/phase15/kr-h1-push.ts
  - seo-tools/src/phase15/metadatos.test.ts
  - seo-tools/src/phase15/metadatos.ts
  - seo-tools/src/phase15/model.ts
  - seo-tools/src/phase15/paquete.test.ts
  - seo-tools/src/phase15/paquete.ts
  - seo-tools/src/phase15/revision.ts
  - seo-tools/src/phase15/serp-onpage.test.ts
  - seo-tools/src/phase15/serp-onpage.ts
  - seo-tools/src/phase15/ymyl.test.ts
  - seo-tools/src/phase15/ymyl.ts
findings:
  critical: 1
  warning: 10
  info: 7
  total: 18
status: fixed
fixed: 2026-08-13
fix_commits: [48a82b5, ff1ba76, 0b89d2e, b4ec747, 8a1d6a8, 37b1f44, 9bd3a18, 0a94ff3, e77aeb5, 527f741, 6875815]
fix_note: "Los 11 findings de Critical y Warning (CR-01, WR-01..WR-10) quedaron arreglados y reverificados por gsd-verifier el 2026-08-13 (15-VERIFICATION.md). Los 7 Info (IN-01..IN-07) quedaron fuera de alcance, sin arreglar."
---

# Fase 15: reporte de code review

**Revisado:** 2026-08-13
**Profundidad:** standard
**Archivos revisados:** 26
**Estado:** issues_found

## Resumen

Se revisaron los nueve datasets generados, el parser de banderas de la fase 13 y los ocho módulos
de `src/phase15/` con sus pruebas. Estado de partida verificado en el entorno: las 90 pruebas de
`src/phase15/*.test.ts` pasan, `ymyl.ts --todos` da 0 hallazgos sobre las 16 páginas, la auditoría
de duplicados da limpia sobre las 22 URLs vivas, los 24 paquetes generados existen, ninguno trae
`SIN CUBRIR` ni encabezados sin copy, y ninguna región de copy contiene raya larga ni comilla
tipográfica. Los cuatro datasets de copy son estructuralmente correctos: 16 URLs sin solapamiento
entre archivos, claves de sección únicas por página, ninguna sección clínica sin el sello
`pendiente-doctor`, ninguna afirmación con dígito sin fuente y ningún dato operativo `respaldado`
sin procedencia.

Dos comprobaciones específicas del contexto de riesgo dieron bien y conviene dejarlas registradas.
El alcance de escritura de `kr-h1-push.ts` es real: `URL` está en el índice 2 y `Suggested H1` en
el 13 del tab `Keyword Research`, `columnRuns` (`src/sheets/upsert.ts:137`) solo agrupa índices
contiguos, así que salen dos rangos separados y ninguna columna ajena entra en el rectángulo de
escritura. Y ningún módulo de la fase escribe en `src/` de la aplicación: `metadatos.ts` lo lee y
lo declara de solo lectura, y los destinos de escritura son `seo-tools/data/` y la carpeta de la
fase 15 (con la salvedad de WR-07).

Lo que sí encontró la revisión es que la compuerta YMYL tiene un hueco estructural en la regla que
más importa (CR-01), que la verificación de contrato contra el Sheet del cliente comprueba el
modelo local y no el documento vivo (WR-01), y que la tabla de entidades obligatorias puede
declararse suficiente con términos que no exigen nada (WR-05).

## Critical Issues

### CR-01: la regla `cifra-sin-fuente` no puede ver la forma en que esta fase escribe las cifras

**Archivo:** `seo-tools/src/phase15/ymyl.ts:330`
**Issue:** La regla que implementa D-10 se dispara con `/\d/.test(afirmacion.texto)`, es decir solo
cuando la afirmación trae un dígito. El propio módulo declara en su comentario de `CANTIDAD`
(`ymyl.ts:221`) que "el copy de esta fase usa palabras (D-11)". O sea que la regla mira exactamente
la forma que el copy no usa. Comprobado ejecutando la compuerta sobre un caso construido:

```
"El noventa por ciento de las hernias mejora sin operarse."   fuente: ""   -> SIN HALLAZGO
"El 90 por ciento de las hernias mejora sin operarse."        fuente: ""   -> cifra-sin-fuente
```

No es hipotético: el copy entregado ejercita el hueco. Hay quince afirmaciones de prevalencia
escritas en palabras y sin fuente que la compuerta deja pasar, entre ellas `La mayoría de las
hernias discales no termina en quirófano` (`data/copy-guias.json`, `/servicios/hernia-discal`),
`La mayoría de las ciáticas mejora sin operar`
(`data/copy-blog.json`, `/blog/5-sintomas-de-columna-que-no-debes-ignorar`) y `El tratamiento de la
lumbalgia es conservador en la enorme mayoría de los casos` (`data/copy-blog.json`,
`/blog/lumbalgia`). Son afirmaciones de frecuencia clínica en una página médica, que es justo lo
que D-10 existe para obligar a respaldar. El sello `pendiente-doctor` es el control compensatorio,
pero la compuerta reporta cero hallazgos y por lo tanto no le señala al doctor ninguna de las
quince.

**Fix:** hacer que el disparador de la regla reconozca cantidad escrita en palabras, reusando la
constante `CANTIDAD` que el módulo ya tiene, más los cuantificadores de prevalencia:

```ts
const PREVALENCIA = new RegExp(
  `\\d|\\b(?:${CANTIDAD}|mayoria|minoria|mitad|tercio|cuarto|por ciento|porcentaje|de cada)\\b`,
  "u",
);

for (const afirmacion of seccion.afirmaciones) {
  if (PREVALENCIA.test(normalizar(afirmacion.texto)) && afirmacion.fuente.trim() === "") {
    hallazgos.push({ /* ...regla "cifra-sin-fuente"... */ });
  }
  // ...
}
```

Y comprobar el resultado sobre los cuatro datasets antes de cerrar: si las quince afirmaciones
salen listadas, hay que darles fuente o reescribirlas, no aflojar la regla.

## Warnings

### WR-01: `verificarModelo` comprueba el modelo local, no el documento del cliente

**Archivo:** `seo-tools/src/phase15/kr-h1-push.ts:124-157`, usado en `:173`
**Issue:** `verificarModelo(tab)` recorre `tab.columns`, que sale de
`seo-tools/data/sheet-columns.json`. La escritura, en cambio, se decide en
`src/sheets/upsert.ts:367` sobre `schema.columns`, que sale de los encabezados reales del tab. Los
estados `fase-14` y `fase-15` no están en `REQUIRED_STATUSES` (`src/sheets/schema.ts:51`), así que
si alguien renombra `Suggested H1` o `URL` en el Sheet, `loadTabSchema` no la registra, no la
cuenta como `missing` y no lanza nada: la carga escribe una columna en vez de dos, o ninguna, y el
bloque de contrato imprime igual `actualizadas: 16`. Es exactamente el fallo silencioso que el
docblock del módulo dice estar previniendo ("una columna sin campo se saltea en silencio y el
resumen reportaria filas actualizadas sin que el dato llegara a ninguna celda"): la defensa cubre
que el modelo pierda el `field`, no que el documento vivo pierda el encabezado.
**Fix:** después de `loadTabSchema`, comprobar contra el esquema resuelto y no solo contra el
modelo:

```ts
const schema = await loadTabSchema(gateway, tab, { addMissingColumns: false });
for (const esperada of COLUMNAS_PROPIAS) {
  if (schema.byHeader.get(esperada.header) === undefined) {
    throw new CliError(
      `El tab "${TAB}" ya no trae el encabezado ${JSON.stringify(esperada.header)}.\n` +
        `  La carga se detiene sin escribir nada: sin la columna, la escritura no llega a ninguna ` +
        `celda y el resumen reportaria filas actualizadas igual.`,
    );
  }
}
```

### WR-02: un mínimo de palabras ausente hace que la regla de extensión pase siempre

**Archivo:** `seo-tools/src/phase15/ymyl.ts:443`
**Issue:** `minimoDePalabras: minimos.get(p.url) ?? 0`. Una página de copy cuya URL no esté en
`data/onpage-serp.json` recibe mínimo 0, y entonces `escritas < 0` nunca se cumple: la regla de
extensión queda desactivada para esa URL sin que nada avise. Hoy las 16 cruzan, así que es un
default que espera al primer agregado. En una compuerta, el default que pasa es el que se paga
caro.
**Fix:** fallar en vez de asumir cero.

```ts
const minimo = minimos.get(p.url);
if (minimo === undefined) {
  throw new CliError(
    `${p.url} tiene copy pero no tiene minimo de palabras en data/onpage-serp.json.\n` +
      `  La compuerta se detiene: con minimo cero la regla de extension no revisa nada.`,
  );
}
```

### WR-03: `catch` desnudo que rotula cualquier fallo como "sin captura"

**Archivo:** `seo-tools/src/phase15/serp-onpage.ts:739-743`
**Issue:** El `try/catch` alrededor de `filaOnPageDe(fila)` atrapa todo y empuja la URL a
`sinCaptura`. Un error de `leerSerp` en modo offline es el caso previsto, pero un `TypeError` en
`jerarquiaDe`, un fallo de `entidadesDelTop10` o un JSON mal formado producen el mismo rótulo: la
URL desaparece del dataset de ONPAGE-02 y ONPAGE-03 con un motivo que no es el suyo, y el paquete
de esa URL fallaría después en otro lado. Hoy `sinCaptura` está vacío, así que no hay daño
presente, pero el rótulo es falso por construcción.
**Fix:** conservar el mensaje y distinguir el caso previsto:

```ts
} catch (error) {
  const motivo = error instanceof Error ? error.message : String(error);
  sinCaptura.push(`${fila.url} (${fila.keywordPrimaria ?? "sin keyword"}): ${motivo}`);
}
```

### WR-04: el handoff afirma "3 redirecciones" con un número escrito a mano

**Archivo:** `seo-tools/src/phase15/paquete.ts:1194-1212`
**Issue:** El texto dice `**3 redirecciones 301.**` mientras la tabla de abajo emite una fila
literal (`/servicios/escoliosis`) más `redirecciones.length` filas derivadas del dataset. Si el
mapa de la fase 14 gana o pierde una redirección, la tabla cambia y la frase no. El mismo documento
declara en su cabecera que se genera desde los datasets justamente para que no se desincronice.
Ninguna prueba compara el número escrito contra el largo de la tabla.
**Fix:** derivarlo: `` `**${redirecciones.length + 1} redirecciones 301.** Dos salen de este
paquete y la tercera venía avisada de la fase 14.` `` (o mejor, generar también esa segunda frase
desde los datos).

### WR-05: la bandera `entidadesInsuficientes` se satisface con términos que no exigen nada

**Archivo:** `seo-tools/src/phase15/entidades.ts:79-111` y `:330`
**Issue:** `RUIDO` y `RELLENO` no filtran la voz institucional en primera persona ni los nombres
propios de personas, y `marcasDeLaSerp` solo quita la etiqueta del dominio. El resultado se ve en
`data/onpage-serp.json`:

- `/sedes/sanna-la-molina`: `san, medicos, peru, red, borja, san borja, nuestro, rodriguez`. Ocho
  términos, ninguno clínico, uno de ellos un apellido. Como `MINIMO_DE_TERMINOS` es 8, la fila sale
  con `entidadesInsuficientes: false`: la bandera que existe para declarar "esta SERP no dio lo
  suficiente" queda satisfecha por ruido.
- `/sedes/consultorio-privado`: `somos, estamos, preguntan, contamos` entre las obligatorias.
- `/sedes/clinica-tezza`: `cuida, cuidamos, cuidamos al enfermo, cuidamos al enfermo como una
  madre, enfermo como una madre`, que es el lema de la clínica troceado en n-gramas. Ese lema
  terminó citado en el copy y es uno de los seis destacados de `revision.ts:164`, con la nota de
  que puede no ser textual. El origen del problema está acá.

"La página tiene que nombrar `somos`" no le pide nada a quien escribe, que es el criterio que el
propio módulo declara en el comentario de `RELLENO`.
**Fix:** agregar a `RELLENO` las formas de primera persona institucional (`somos`, `estamos`,
`contamos`, `nuestro`, `nuestra`, `nuestros`, `nuestras`, `cuidamos`, `ofrecemos`, `atendemos`,
`preguntan`) y contar solo términos de clase distinta de `generica` para decidir
`entidadesInsuficientes`:

```ts
const utiles = entidades.filter((e) => e.clase !== "generica");
return { entidades, umbralAplicado, entidadesInsuficientes: utiles.length < minimo, de };
```

### WR-06: `tituloYMeta` con primaria vacía interpola `undefined` dentro de una expresión regular

**Archivo:** `seo-tools/src/phase15/metadatos.ts:98-117`, llamado desde `paquete.ts:241-248`
**Issue:** `renderPaquete` llama a `tituloYMeta` con `keywordPrimaria: paquete.fila.keywordPrimaria
?? ""`. Con cadena vacía, `tokenizar("")` devuelve `[]`, `ausentes` queda vacío (o sea que la
comprobación de "el title nombra la primaria" pasa sin comprobar nada) y `tokensDeLaPrimaria[0] as
string` es `undefined`, que llega a `posicionDePalabra` y arma
`new RegExp("(?:^|[^a-z0-9])(undefined)(?![a-z0-9])")`. La regex es válida y busca la palabra
literal "undefined", así que devuelve -1 y la comprobación de "al frente" también pasa sin
comprobar nada. El `as string` es lo que oculta el hueco al compilador. Hoy no se alcanza porque
`construirPaquete` rechaza antes las URLs sin primaria, pero la función es exportada y su contrato
dice otra cosa.
**Fix:** guardar el caso al principio de `tituloYMeta`:

```ts
const tokensDeLaPrimaria = tokenizar(entrada.keywordPrimaria);
if (tokensDeLaPrimaria.length === 0) {
  throw new PaqueteInvalido(
    `${entrada.url}: se pidio medir title y meta sin keyword primaria.\n` +
      `  Accion: las URLs sin primaria reciben documento corto, no pagina completa (D-06).`,
  );
}
```

### WR-07: los destinos de `--out` no están acotados y pueden salir de `seo-tools/`

**Archivo:** `seo-tools/src/phase15/revision.ts:427`, `metadatos.ts:671`, `auditoria.ts:230-231`,
`serp-onpage.ts:786`
**Issue:** Los cuatro puntos de entrada resuelven el destino con `path.resolve`/`path.join` contra
`REPO_ROOT` o `SEO_TOOLS_ROOT` y escriben sin comprobar contención. `revision.ts --out
src/app/page.tsx` escribe dentro del árbol de la aplicación, que es la única cosa que este
workstream tiene prohibido tocar, y `--out ../algo` sale del repositorio. Es una CLI local, así que
no es una vulnerabilidad de superficie remota, pero la restricción de no escribir en `src/` es dura
y hoy la sostiene solamente la disciplina de quien tipea.
**Fix:** una comprobación compartida antes de cada `writeFileSync`:

```ts
function destinoPermitido(ruta: string, raiz: string): string {
  const absoluto = path.resolve(raiz, ruta);
  const dentro = path.relative(raiz, absoluto);
  if (dentro.startsWith("..") || path.isAbsolute(dentro)) {
    throw new CliError(
      `El destino ${absoluto} queda fuera de ${raiz}.\n` +
        `  Esta fase no escribe fuera de seo-tools/ ni de su carpeta de fase.`,
    );
  }
  return absoluto;
}
```

### WR-08: `--handoff` quedó fuera de la lista de banderas booleanas

**Archivo:** `seo-tools/src/phase13/args.ts:36-47`, consumida en `seo-tools/src/phase15/paquete.ts:1360`
**Issue:** El plan 15-07 agregó `todos` e `indice` a `BOOLEANAS` pero no `handoff`, y `paquete.ts`
la lee con `booleana(...)`. Como `parseBanderas` solo trata una bandera como booleana si está en la
lista o si el token siguiente empieza con `-`, `paquete.ts --todos --handoff data/x.json` se come
el positional y guarda `handoff: "data/x.json"`; ahí `booleana` devuelve `true` igual, pero el
positional desaparece sin aviso. La asimetría con sus dos hermanas es el defecto: las tres son
banderas del mismo comando.
**Fix:** agregar `"handoff"` al `Set` `BOOLEANAS`.

### WR-09: la compuerta no está cableada al generador ni corre sobre los documentos emitidos

**Archivo:** `seo-tools/src/phase15/paquete.ts` (no importa `ymyl.js`), `ymyl.ts:471-502`
**Issue:** `paquete.ts --todos` regenera los 24 documentos sin consultar la compuerta, y el
ejecutable de `ymyl.ts` solo corre `revisar()` sobre los cuatro datasets de copy: `revisarDocumento`
no lo llama ningún punto de entrada, solo una prueba y sobre una sola URL
(`ymyl.test.ts:167`). Consecuencia concreta: la región de copy de los ocho documentos cortos, que
`queHacerCon` (`paquete.ts:580-598`) redacta en código y no en un dataset, no la revisa nunca
nadie. El comentario de `renderPaqueteCorto` dice que llevan las marcas "para que la compuerta
corra sobre cualquiera de los cuatro sin un caso especial", y ese recorrido no existe.
**Fix:** agregar al ejecutable de la compuerta un modo que recorra
`.planning/.../paquetes/*.md` con `revisarDocumento`, y llamarlo desde `generarPaqueteCompleto`
para que un hallazgo devuelva código distinto de cero.

### WR-10: las afirmaciones solo pasan por dos de las seis reglas

**Archivo:** `seo-tools/src/phase15/ymyl.ts:329-342`
**Issue:** Dentro del bucle de secciones, `afirmacion.texto` se cruza contra `cifra-sin-fuente` y
`hallazgosDeCifrasDelDoctor`, pero no contra `hallazgosDeEscritura` (rayas, comillas
tipográficas, emojis, muletillas) ni contra `hallazgosDeSedes` (sedes cerradas). Comprobado:
una afirmación con raya larga, comillas tipográficas y emoji devuelve `SIN HALLAZGO`. Y las
afirmaciones con cifra sí se publican: `paquete.ts:454-468` las renderiza en la tabla "Afirmaciones
con cifra y su fuente" y `revision.ts:293-301` las repite en el documento del doctor. Las dos
tablas quedan FUERA de la región de copy, así que `revisarDocumento` tampoco las alcanza. Una
afirmación como "Atiende en Montefiori desde 2015" llega al entregable sin que ninguna regla la
vea.
**Fix:** correr las mismas reglas que se corren sobre los párrafos:

```ts
for (const afirmacion of seccion.afirmaciones) {
  // ...cifra-sin-fuente...
  hallazgos.push(...hallazgosDeCifrasDelDoctor(pagina.url, seccion.clave, afirmacion.texto));
  hallazgos.push(...hallazgosDeSedes(pagina.url, seccion.clave, afirmacion.texto));
  hallazgos.push(...hallazgosDeEscritura(pagina.url, seccion.clave, afirmacion.texto));
}
```

## Info

### IN-01: `posicionDePalabra` está duplicada palabra por palabra

**Archivos:** `seo-tools/src/phase15/metadatos.ts:60-63` y `seo-tools/src/phase15/auditoria.ts:109-112`
**Issue:** Las dos copias son idénticas. La auditoría existe para no confiar en lo que calculó el
generador, así que duplicar es defendible, pero conviene que esté escrito en un comentario: hoy
parece un descuido y la próxima corrección va a arreglar una sola de las dos.
**Fix:** dejar la duplicación y explicarla en `auditoria.ts`, o extraerla a `entidades.ts` junto a
`normalizar` y `tokenizar`, que ya comparten los dos módulos.

### IN-02: un title ausente se reporta dentro de `metasFaltantes`

**Archivo:** `seo-tools/src/phase15/auditoria.ts:152-154`
**Issue:** La falta de title se empuja al arreglo `metasFaltantes` con `campo: "title"`, y la
salida por consola lo imprime como "metas faltantes". Quien consuma `onpage-audit.json` por el
nombre del campo va a contar mal.
**Fix:** renombrar el campo del reporte a `camposFaltantes`, o separar `titlesFaltantes`.

### IN-03: la auditoría de duplicados no mira las meta descriptions

**Archivo:** `seo-tools/src/phase15/auditoria.ts:192-193`
**Issue:** Se cruzan `title` y `h1` contra sí mismos, pero no `metaDescription`, aunque el módulo
sí verifica su largo y su ausencia. Dos URLs con la misma meta pasarían como limpias. Hoy no hay
ninguna repetida en `data/onpage.json`, así que es un hueco de cobertura y no un fallo presente.
**Fix:** `const metasDuplicadas = duplicados(auditadas, (f) => f.metaDescription);` y sumarla a
`hallazgos`.

### IN-04: un umbral pedido por debajo del mínimo devuelve la lista sin filtrar

**Archivo:** `seo-tools/src/phase15/entidades.ts:307-317`
**Issue:** Si `opciones.umbral` es menor que `UMBRAL_MINIMO`, `primeraDecima < ultimaDecima` y el
bucle no corre ni una vez: `seleccion` queda en `candidatos` sin filtrar mientras `umbralAplicado`
informa el umbral pedido. La fila declararía un umbral que no aplicó. Solo se alcanza pasando
opciones a mano.
**Fix:** validar la opción al entrar, o inicializar `seleccion` con el filtro del umbral mínimo.

### IN-05: el handoff clasifica por acción en una tabla y por primaria en otra

**Archivo:** `seo-tools/src/phase15/paquete.ts:1089-1092`
**Issue:** `completas` filtra por `keywordPrimaria`, `soloMetadata` por `accion === "dejar"`. Son
criterios distintos para dos grupos que el documento presenta como excluyentes. Hoy coinciden (las
6 filas con acción `dejar` son exactamente las 6 sin primaria), pero una URL con primaria y acción
`dejar` saldría en las dos tablas.
**Fix:** `filas.filter((f) => f.accion !== "redirigir" && (f.keywordPrimaria ?? "") === "")`.

### IN-06: la regla de mayúsculas de título pide cuatro palabras

**Archivo:** `seo-tools/src/phase15/ymyl.ts:298-305`
**Issue:** `esMayusculaDeTitulo` devuelve `false` con menos de cuatro palabras, así que "Hernia
Discal Lumbar" no se marca aunque sea el mismo anglicismo de capitalización que la regla persigue.
**Fix:** bajar el umbral a tres palabras y comprobar contra los títulos actuales de los cuatro
datasets antes de fijarlo.

### IN-07: la caché de muletillas ignora la ruta que se le pase

**Archivo:** `seo-tools/src/phase15/ymyl.ts:205-209`
**Issue:** `tellsCache()` memoriza el resultado de `tellsDeIa()` con su ruta por defecto en una
variable de módulo, sin forma de invalidarla. `tellsDeIa(otraRuta)` existe y es exportada, pero
`hallazgosDeEscritura` nunca la usa: una prueba que quisiera cargar un diccionario propio no
tendría efecto, y el orden de las pruebas decidiría qué diccionario quedó cacheado.
**Fix:** pasar el diccionario como parámetro opcional de `revisar`/`revisarDocumento`, o exportar
un `reiniciarCacheDeTells()` para las pruebas.

---

_Revisado: 2026-08-13_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidad: standard_
