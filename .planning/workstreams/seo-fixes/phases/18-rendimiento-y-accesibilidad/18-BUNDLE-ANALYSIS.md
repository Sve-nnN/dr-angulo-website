# CWV-04 — Mapa del bundle, antes y después

**Fase:** 18 — Rendimiento y accesibilidad
**Plan:** 18-05, tarea 2
**Medido:** 2026-08-24, sobre builds limpios (`rm -rf .next && npm run build`)
**Estado:** parcial. La sonda de código muerto cierra en 0; el hallazgo principal quedó identificado pero fuera del alcance de archivos de este plan. Ver la sección 7.

---

## 1. La herramienta: `@next/bundle-analyzer` no sirve en este proyecto, y se desinstaló

Tres hechos, en orden.

**Juan aprobó la instalación el 2026-08-24.** Verificada contra el registro:
alcance `@next`, el mismo del que el proyecto ya depende por `@next/third-parties`;
repositorio `git+https://github.com/vercel/next.js.git` confirmado con `npm view`;
versión 16.3.2; instalada en `devDependencies` y no en `dependencies`.

**La herramienta resultó incompatible con el build de este proyecto.** Con
`ANALYZE=true` el build sale 0 pero no genera ningún reporte:

```
The Next Bundle Analyzer is not compatible with Turbopack builds, no report will
be generated. Consider trying the new Turbopack analyzer via `next experimental-analyze`.
To run this analysis pass the `--webpack` flag to `next build`
```

Este proyecto compila con Turbopack, que es el build por defecto de Next 16. Es
otra vez el caso que advierte `AGENTS.md`: la herramienta que la doc de memoria
recomienda no aplica a esta versión.

**Lo que efectivamente midió fue `npx next experimental-analyze -o`**, que ya viene
en el Next instalado, no necesita ninguna dependencia nueva y escribe en
`.next/diagnostics/analyze`. Complementado con medición directa sobre los archivos
de `.next/static/chunks/`, cruzando cada chunk contra los documentos de
`.next/server/app/**` que lo referencian. **Esa es la herramienta que hay que usar
la próxima vez en este proyecto.**

Por eso `@next/bundle-analyzer` **quedó desinstalado** y el envoltorio de
`next.config.ts` revertido: dejarlo instalado dejaba una afordancia falsa, alguien
iba a correr `ANALYZE=true`, no iba a obtener nada y perdía una tarde.
`next.config.ts` quedó byte a byte igual a su estado previo a este plan, con sus
**5** cabeceras de seguridad y sus **5** redirecciones permanentes verificadas.

**Nota de método sobre los conteos de documentos.** Todo el recorrido usa
`find .next/server/app -name '*.html'`, no un glob de un nivel. El build produce
**26 documentos**, de los cuales **13 están anidados** bajo `blog/`, `sedes/` y
`servicios/`. Un glob `.next/server/app/*.html` solo ve 12 y perdería más de la
mitad. Y todos los builds de este archivo son limpios: un `.next` sucio produce
rutas fantasma y aserciones que no valen nada.

---

## 2. Mapa de chunks, antes

Build limpio del 2026-08-24, antes de tocar nada. Peso sin comprimir, y cantidad
de documentos que referencian cada chunk sobre un total de 26.

| Bytes | Chunk | Docs | Qué contiene |
|---|---|---|---|
| 226.356 | `31iarpvmym1z2.js` | **26/26** | **React DOM** |
| 158.571 | `0zotnc0_yn7v5.js` | 25/26 | **Contenido clínico del sitio** |
| 150.470 | `2-5nk792mwq2y.js` | 26/26 | Runtime de cliente de Next |
| 112.594 | `0cz1d0mv5g_q7.js` | 26/26 | **Polyfills legacy**, con `noModule` |
| 54.646 | `14mrh2-p_w84d.js` | 26/26 | Router |
| 50.702 | `15orcrkp-_9ct.js` | 26/26 | — |
| 30.920 | `2jfhky1xr680i.js` | 25/26 | — |
| 30.920 | `1d8ijbew3esu0.js` | 25/26 | — |
| 29.656 | `0krsqwhv3zry_.js` | 25/26 | Chunk compartido que **incluía** el carrusel |
| 26.272 | `1mdk1t71c9r3k.js` | 25/26 | — |
| 18.656 | `2yk75xw433_3t.js` | 26/26 | — |
| 10.580 | `turbopack-*.js` | 26/26 | Runtime de Turbopack |
| 5.343 | `3l0ecpkm63mnm.js` | 1/26 | Específico de ruta |
| 3.498 | `420mtziom5wrd.js` | 2/26 | Propio de `/` y `/testimonios` |
| 3.377 | `05-c3ty_6dwfk.js` | 1/26 | Específico de ruta |

Total por ruta, antes: **900.343 B** en `/privacidad`, la página más simple del
sitio. Descontando el chunk de polyfills que ningún navegador moderno baja (ver la
sección 5): **787.749 B**.

---

## 3. El hallazgo principal: 158.571 B de prosa clínica, resuelto

`0zotnc0_yn7v5.js`, **158.571 B, en 25 de los 26 documentos.**

Identificadores más frecuentes del chunk, antes del arreglo:

| Identificador | Apariciones |
|---|---|
| `paragraphs` | 170 |
| `consultorio` | 51 |
| `escoliosis` | 50 |
| `traumatolog` | 34 |
| `tratamiento` | 26 |
| `resonancia` | 20 |
| `deformidades` | 16 |
| `ortopedista` | 14 |

Era `src/content/service-pages/` y `src/content/location-pages/`: **153.956 B de
fuente**, las cinco guías clínicas y las cuatro fichas de sede.

### Por qué llegaba al navegador

| Archivo | Línea | Import |
|---|---|---|
| `src/components/layout/header.tsx` | 11 | `import { servicePages } from "@/content/service-pages"` |
| `src/components/layout/header.tsx` | 12 | `import { locationPages } from "@/content/location-pages"` |
| `src/components/layout/services-menu.tsx` | 7 | `import { servicePages } from "@/content/service-pages"` |

Los dos llevan `"use client"`, y el encabezado se monta en las 24 rutas, así que el
barril entero de contenido entraba en el grafo de cliente de todas.

**Del barril completo usaban tres campos.** `header.tsx` usa `page.slug` y
`page.navLabel` de las dos listas; `services-menu.tsx` usa esos dos más
`page.cardSummary`. Se traían 158.571 B de prosa para dibujar un menú.

Un paciente que abría `/privacidad` descargaba, analizaba y compilaba las cinco
guías clínicas enteras y las cuatro fichas de sede.

### El arreglo

`src/content/nav-index.ts`, un índice de navegación con lo mínimo: `slug`,
`navLabel` y `cardSummary` para los cinco servicios; `slug` y `navLabel` para las
cuatro sedes. `header.tsx` y `services-menu.tsx` importan de ahí.

**Por qué escrito a mano y no derivado de los barriles.** Derivarlos reintroduce el
problema: la importación arrastra el módulo entero aunque solo se lea una
propiedad. Y pasarlos como props desde el servidor los mudaría al árbol RSC
serializado, o sea al HTML de las 24 rutas, cambiando peso de JavaScript por peso
de HTML en vez de eliminarlo. El archivo sigue además el patrón que `header.tsx` ya
usaba para su constante `NAV_LINKS`: los rótulos de navegación se escriben donde se
usan.

**Qué impide que se desincronice, que es el riesgo obvio de escribirlo a mano.**
`service-pages/index.ts` y `location-pages/index.ts` llaman a
`assertNavIndexMatches()` en tiempo de módulo: comprueban que cada `slug` y cada
`navLabel` coincidan y que no falte ni sobre ninguna entrada. Esos dos barriles solo
se importan desde el servidor, así que la comprobación corre durante
`npm run build`, que es una de las cinco compuertas.

Verificado rompiéndolo a propósito: al cambiar un `navLabel` del índice, el build
falla con

```
Error: src/content/nav-index.ts quedó desincronizado:
  - el navLabel de "hernia-discal" dice "Hernia discal ROTA" en el índice
    y "Hernia discal" en la página
```

y sale con código 1. Si alguien renombra una guía y se olvida del índice, se entera
en la compuerta y no el paciente en un 404.

### El resultado

**Sonda de contenido:** documentos que referencian un chunk con la cadena
`paragraphs`.

| | Documentos |
|---|---|
| Antes | **25** de 26 |
| Después | **0** |

Ningún chunk de cliente contiene ya `paragraphs`, `resonancia` ni `traumatolog`. Las
únicas apariciones de `escoliosis`, `deformidades` y `consultorio` que quedan son
**una cada una**: son los `slug` y los `cardSummary` del propio índice de
navegación, que es exactamente lo que tiene que estar ahí.

---

## 4. Lo que quedó fuera y por qué: react-dom

`31iarpvmym1z2.js`, 226.356 B sin comprimir y **70.709 B de transferencia
comprimida**, referenciado por los **26 de 26** documentos.

**Esos 70.709 B son los 70.799 bytes de la auditoría del 2026-08-23**, a 90 bytes de
diferencia, que es el rebuild que hubo entre las dos fechas. La auditoría los
atribuyó al "chunk compartido" y la cifra es correcta; lo que faltaba era saber qué
archivo era.

Es **React DOM**:

| Señal buscada | Apariciones |
|---|---|
| `hydrateRoot` | 1 |
| `createRoot` | 1 |
| `Minified React error` | 1 |
| `react.dev/errors` | 1 |
| `onRecoverableError` | 10 |
| `unstable_*` | 46 |

Ningún otro chunk del build contiene `hydrateRoot`.

**Queda fuera de CWV-04, y esto se escribe acá para que nadie lo persiga después
leyendo la auditoría vieja.** No es código de aplicación: no se parte con
`dynamic()`, no se mueve cambiando puntos de importación y no se le quita nada con
`browserslist`. El 41% "sin usar" que reporta la auditoría son las rutas del
reconciliador de React que una carga de página no ejercita, y es **el hallazgo de
"unused JavaScript" más estándar que existe en cualquier sitio construido con
React**. Perseguirlo consume tiempo y no mueve un byte.

La cifra de la auditoría es real. El archivo al que corresponde no es accionable.


---

## 5. Polyfills legacy: cerrados por medición

`0cz1d0mv5g_q7.js`, **112.594 B, en los 26 documentos.** Contiene `core-js`,
`URLSearchParams`, `cannotBeABaseURL`, `_bodyArrayBuffer`, `Object.assign`,
`Array.from`, `String.prototype`, `Symbol.iterator`: es `next-polyfill-nomodule`.

**Y se sirve así:**

```html
<script src="/_next/static/chunks/0cz1d0mv5g_q7.js" noModule=""></script>
```

El atributo `noModule` hace que **solo lo descarguen los navegadores que no
soportan módulos ES**. Ninguno del rango soportado lo pide. Coincide con lo que
declara la doc de la versión instalada
(`node_modules/next/dist/docs/03-architecture/supported-browsers.md`): *"to reduce
bundle size, Next.js will only load these polyfills for browsers that require them.
The majority of the web traffic globally will not download these polyfills."*

**Veredicto: la auditoría marcó polyfills que en la práctica nadie descarga.** Se
cierra por medición y no por arreglo, que es la salida que el plan sanciona.

Consecuencia de método, y no es menor: **todos los totales por ruta de este archivo
descuentan ese chunk.** Contarlo infla el peso real en 112.594 B por ruta y haría
que cualquier comparación futura arrancara torcida.

### `browserslist` declarado

```json
"browserslist": ["chrome 111", "edge 111", "firefox 111", "safari 16.4"]
```

**Es exactamente el default de Next 16, no un rango más estrecho.** Declararlo hace
explícito lo que hasta hoy se heredaba en silencio. No se apretó, y el motivo está
en T-18-18: los pacientes de este sitio no son un público de navegadores recientes,
y un rango más angosto dejaría fuera navegadores que hoy funcionan a cambio de un
ahorro que la sección de arriba ya demostró que es cero.

---

## 6. El carrusel: fuera de las 22 rutas que no pueden renderizarlo

### El arreglo

`instagram-reels-section.tsx` es un Server Component `async` e importaba
`ReelsCarousel` de forma estática. La guía de lazy loading de la versión instalada
es explícita: *"When a Server Component dynamically imports a Client Component,
automatic code splitting is currently not supported"*. Un `dynamic()` puesto ahí no
habría comprado nada.

El camino fue aislar el componente de cliente detrás de un límite propio,
`src/components/instagram/reels-carousel-lazy.tsx`: un Client Component que hace el
`dynamic()`. Un Client Component importando dinámicamente otro Client Component sí
está soportado. Sin desactivar el render en servidor, que está prohibido en toda la
fase.

### El resultado

**Sonda de código muerto**, recorriendo los 26 documentos con `find` y excluyendo
`index.html` y `testimonios.html`:

| | Documentos con el código del carrusel |
|---|---|
| Antes | **23** |
| Después | **0** |

Los 23 eran `_not-found`, las ocho rutas de primer nivel, los cinco posts de
`blog/`, las cuatro sedes y los cinco servicios. El único documento sondeado que no
daba coincidencia era `_global-error.html`.

El código del carrusel vive ahora en dos chunks bajo demanda con `docs=0`, 4.187 B y
3.524 B, que se piden solo cuando el carrusel se monta.

### Desviación: el ahorro del carrusel es 846 B por ruta, no 29.656 B

El plan describe los 29.656 B de `0krsqwhv3zry_.js` como "código que las otras 22
rutas descargan y no pueden ejecutar". **Ese chunk no era el carrusel: era un chunk
compartido que lo contenía entre otros módulos.**

| Medición | Antes | Después |
|---|---|---|
| El chunk compartido | 29.656 B | 28.810 B |

**El aporte propio del carrusel eran 846 B.** El resto lo usan las 22 rutas y sigue
donde estaba.

Lo que se cumple es la aserción dura del plan, la sonda: de 23 documentos a 0. Lo
que no se cumple es la lectura implícita de que eso liberaba 29.656 B por ruta.
**El criterio no se ajustó para que coincidiera con la medición.**

El arreglo sigue siendo correcto por lo que el plan mismo dice: se hace por lo que
cuesta descargar, analizar y compilar en un móvil de gama media, no por un puntaje.
**Este plan no promete mejora de puntaje de Lighthouse.** La evidencia de por qué
está en la línea base: `/privacidad` descargaba el chunk del carrusel y puntuaba
1,00 con TBT de 0 ms y LCP de 1,34 s.

---

## 7. `@next/third-parties`, el tercer caso de la misma clase

`src/components/analytics/analytics-scripts.tsx:5` importaba
`@next/third-parties/google` de forma estática dentro de un Client Component que
**devuelve `null` mientras el consentimiento no esté en `granted`**, y que además
solo monta GA4 si `NEXT_PUBLIC_GA_ID` está configurado. La librería entera,
Partytown incluido, viajaba a 25 de los 26 documentos.

Es el mismo defecto que los dos anteriores: un import estático de algo que casi
nunca se renderiza.

Arreglado con `dynamic()`, sin desactivar el render en servidor. Es seguro sin
placeholder porque `getConsentServerSnapshot()` devuelve `null`: ese componente ya
renderizaba `null` en el servidor, así que no hay marcado que preservar ni riesgo de
CLS. El chunk pasa a pedirse recién cuando el visitante acepta analítica.

**Ahorro medido: 6.913 B por ruta.**

---

## 8. Mapa de chunks, después

| Bytes | Chunk | Docs | Qué contiene |
|---|---|---|---|
| 226.356 | `31iarpvmym1z2.js` | 26/26 | React DOM — fuera de alcance, sección 4 |
| 145.701 | `29194twgvgfhb.js` | 26/26 | Runtime de cliente de Next |
| 112.594 | `0cz1d0mv5g_q7.js` | 26/26 | Polyfills con `noModule` — nadie los baja |
| 54.646 | `14mrh2-p_w84d.js` | 26/26 | Router |
| 50.234 | `2kqrbujyxigm8.js` | 26/26 | — |
| 47.718 | `2-pygg3jru2of.js` | 25/26 | Encabezado, megamenú y el índice de navegación |
| 30.920 | `2jfhky1xr680i.js` | 25/26 | — |
| 30.920 | `1d8ijbew3esu0.js` | 25/26 | — |
| 28.810 | `0rk88640s54t2.js` | 25/26 | Chunk compartido, ya sin el carrusel |
| 23.893 | `1i8l4630-aawc.js` | 26/26 | — |
| 10.580 | `turbopack-*.js` | 26/26 | Runtime de Turbopack |
| **10.084** | `1qx1b96wir__i.js` | **0/26** | `@next/third-parties`, bajo demanda |
| 5.343 | `3h1eq4admar_b.js` | 1/26 | Específico de ruta |
| **4.187** | `44t7psm3hf5x4.js` | **0/26** | Carrusel, bajo demanda |
| **3.524** | `3i5ud961km4dj.js` | **0/26** | Carrusel, bajo demanda |
| 3.377 | `05-c3ty_6dwfk.js` | 1/26 | Específico de ruta |
| 467 | `2rgl10qwqczqb.js` | 2/26 | Específico de ruta |

El chunk de 158.571 B con la prosa clínica **desapareció**.

### Totales por ruta, sin el chunk `noModule`

| Ruta | Antes | Después | Delta |
|---|---|---|---|
| `/privacidad` | 787.749 B | **649.778 B** | **−137.971 B** |
| `/sedes` | 787.749 B | **649.778 B** | **−137.971 B** |
| `/sobre-el-doctor` | 787.749 B | **649.778 B** | **−137.971 B** |
| `/` | 790.371 B | **650.245 B** | −140.126 B |
| `/testimonios` | 790.371 B | **650.245 B** | −140.126 B |
| `/contacto` | 793.092 B | **655.121 B** | −137.971 B |

**Casi 138 KB menos de JavaScript por ruta, en las 24.** Desglose del ahorro:

| Origen | Bytes por ruta |
|---|---|
| Contenido clínico fuera del grafo de cliente | ~130.200 |
| `@next/third-parties` bajo demanda | 6.913 |
| Carrusel bajo demanda | 846 |
| **Total** | **137.971** |

---

## 9. Cobertura ejecutada según Coverage

> **Pendiente.** El panel de Coverage de devtools necesita navegador. Lo cubre la
> corrida de Lighthouse del checkpoint de la tarea 3.

---

## 10. Estado del HTML servido

Sin cambios, que era la restricción dura de este plan: esto es reorganización del
grafo de módulos, no del marcado.

| Ruta | Aserción | Valor | Esperado |
|---|---|---|---|
| `/testimonios` | `<img` | 2 | 2 |
| `/testimonios` | `<h2` | 4 | 4 |
| `/sedes` | `<h2` | 7 | 7 |
| `/` | `imageSrcSet` | 2 | 2 |

`grep -rn 'ssr: false' src/` devuelve **0**.

`next.config.ts` quedó **byte a byte igual a su estado previo a este plan**, tras
revertir el envoltorio del analizador. Conserva sus **5** cabeceras de seguridad y
sus **5** redirecciones permanentes. Esta aserción existe porque ninguna de las
cinco compuertas del proyecto mira ese archivo: `scripts/check-seo.mjs` no lo
referencia ni una vez.

Las cinco compuertas salen en **0**.
