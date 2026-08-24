# CWV-04 — Mapa del bundle, antes y después

**Fase:** 18 — Rendimiento y accesibilidad
**Plan:** 18-05, tarea 2
**Medido:** 2026-08-24, sobre builds limpios (`rm -rf .next && npm run build`)
**Estado:** parcial. La sonda de código muerto cierra en 0; el hallazgo principal quedó identificado pero fuera del alcance de archivos de este plan. Ver la sección 7.

---

## 1. La herramienta: `@next/bundle-analyzer` no sirve en este proyecto

`@next/bundle-analyzer` quedó instalado y `next.config.ts` quedó envuelto con él,
activado por `ANALYZE=true`. **Pero no produce reporte**, y hay que decirlo antes
de cualquier número para que nadie busque un `client.html` que no existe:

```
The Next Bundle Analyzer is not compatible with Turbopack builds, no report will
be generated. Consider trying the new Turbopack analyzer via `next experimental-analyze`.
To run this analysis pass the `--webpack` flag to `next build`
```

Este proyecto compila con Turbopack, que es el build por defecto de Next 16. Es
otra vez el caso que advierte `AGENTS.md`: la herramienta que la doc de memoria
recomienda no aplica a esta versión.

**La medición se hizo entonces por dos vías, las dos sin instalar nada más:**

1. `npx next experimental-analyze -o`, que viene en el Next instalado y escribe en
   `.next/diagnostics/analyze`.
2. Medición directa sobre los archivos de `.next/static/chunks/`, cruzando cada
   chunk contra los documentos de `.next/server/app/**` que lo referencian, con
   `find` recursivo.

El analizador queda instalado igual: cuesta cero en producción, es dependencia de
desarrollo, y sirve el día que el proyecto vuelva a webpack. Aprobación de la
instalación: **Juan, el 2026-08-24**, verificada contra `npmjs.com` (alcance
`@next`, repositorio `git+https://github.com/vercel/next.js.git` confirmado con
`npm view`, versión 16.3.2, instalada en `devDependencies` y no en `dependencies`).

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

## 3. Los 70.799 bytes de la auditoría: identificados

El plan advertía que esos bytes "no corresponden a ningún archivo de este build" y
mandaba no salir a buscarlos.

**Aparecieron.** Son el **peso de transferencia comprimido de `31iarpvmym1z2.js`**:
70.709 B medidos contra producción, a 90 bytes de los 70.799 de la auditoría. Sin
comprimir ese archivo pesa 226.356 B, que es por lo que una búsqueda por tamaño de
archivo no lo encontraba. Los 90 bytes de diferencia son el rebuild que hubo entre
las dos fechas.

### Y ese chunk es React DOM, así que el 41% sin usar no se puede mover

| Señal buscada en `31iarpvmym1z2.js` | Apariciones |
|---|---|
| `hydrateRoot` | 1 |
| `createRoot` | 1 |
| `Minified React error` | 1 |
| `react.dev/errors` | 1 |
| `onRecoverableError` | 10 |
| `unstable_*` | 46 |

Ningún otro chunk del build contiene `hydrateRoot`. Es el runtime de React DOM,
referenciado por los **26 de 26** documentos.

**No es código de aplicación.** No se parte con `dynamic()`, no se mueve cambiando
puntos de importación y no se le quita nada con `browserslist`. El 41% "sin usar"
son las rutas del reconciliador que una carga de página no ejercita, y es el
hallazgo de "unused JavaScript" más común que existe en cualquier sitio construido
con React.

Queda registrado con todas las letras: **la cifra de la auditoría es real, y el
archivo al que corresponde no es accionable desde este plan.**

---

## 4. El hallazgo que sí es accionable: 158.571 B de prosa clínica

`0zotnc0_yn7v5.js`, **158.571 B, en 25 de los 26 documentos.**

Identificadores más frecuentes del chunk:

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

Es `src/content/service-pages/` y `src/content/location-pages/`: **153.956 B de
fuente**, las cinco guías clínicas y las cuatro sedes.

### Por qué llega al navegador

| Archivo | Línea | Import |
|---|---|---|
| `src/components/layout/header.tsx` | 11 | `import { servicePages } from "@/content/service-pages"` |
| `src/components/layout/header.tsx` | 12 | `import { locationPages } from "@/content/location-pages"` |
| `src/components/layout/services-menu.tsx` | 7 | `import { servicePages } from "@/content/service-pages"` |

Los dos llevan `"use client"`. El encabezado se monta en las 24 rutas, así que el
barril entero de contenido entra en el grafo de cliente de todas.

**Del barril completo esos componentes usan exactamente tres campos:**
`page.slug`, `page.navLabel` y `page.cardSummary`. Se traen 158.571 B de prosa para
dibujar un menú de navegación.

Un paciente que abre `/privacidad` descarga las cinco guías clínicas completas y
las cuatro fichas de sede. Es el mismo defecto que el del carrusel, con la misma
forma, **cinco veces más grande** y con arreglo limpio: un índice de navegación con
esos tres campos, sin cambio de marcado y sin riesgo de CLS.

**No se arregló en este plan.** Ver la sección 7.

---

## 5. Polyfills legacy: cerrados por medición

`0cz1d0mv5g_q7.js`, **112.594 B, en los 26 documentos.** Contiene `core-js`,
`URLSearchParams`, `cannotBeABaseURL`, `_bodyArrayBuffer`, `Object.assign`,
`Array.from`, `String.prototype`, `Symbol.iterator`: es
`next-polyfill-nomodule`.

**Y se sirve así:**

```html
<script src="/_next/static/chunks/0cz1d0mv5g_q7.js" noModule=""></script>
```

El atributo `noModule` hace que **solo lo descarguen los navegadores que no
soportan módulos ES**. Ningún navegador del rango soportado lo pide. Coincide con
lo que declara la doc de la versión instalada
(`node_modules/next/dist/docs/03-architecture/supported-browsers.md`): *"to reduce
bundle size, Next.js will only load these polyfills for browsers that require them.
The majority of the web traffic globally will not download these polyfills."*

**Veredicto: la auditoría marcó polyfills que en la práctica nadie descarga.** El
hallazgo se cierra por medición y no por arreglo, que es la salida que el propio
plan sanciona: un hallazgo cerrado por medición vale más que un arreglo cosmético.

Consecuencia de método: **todos los totales por ruta de este archivo se dan también
sin ese chunk**, porque contarlo infla el peso real en 112.594 B por ruta.

### `browserslist` declarado

`package.json` ahora declara:

```json
"browserslist": ["chrome 111", "edge 111", "firefox 111", "safari 16.4"]
```

**Es exactamente el default de Next 16, no un rango más estrecho.** La justificación
es doble. Primero, declararlo hace explícito lo que hasta hoy se heredaba en
silencio: cualquiera que lea `package.json` ve contra qué se compila. Segundo, y es
lo que impide la tentación de apretarlo: el registro de amenazas marca T-18-18,
"`browserslist` demasiado estrecho", y los pacientes de este sitio no son un público
de navegadores recientes. Un rango más angosto dejaría fuera navegadores que hoy
funcionan, a cambio de un ahorro que la sección de arriba ya demostró que es cero,
porque los polyfills viajan por `noModule`.

---

## 6. El carrusel: fuera de las 22 rutas que no pueden renderizarlo

### El arreglo

`instagram-reels-section.tsx` es un Server Component `async` e importaba
`ReelsCarousel` de forma estática. La guía de lazy loading de la versión instalada
es explícita: *"When a Server Component dynamically imports a Client Component,
automatic code splitting is currently not supported"*. Así que un `dynamic()` puesto
ahí no habría comprado nada.

El camino fue **aislar el componente de cliente detrás de un límite propio**:
`src/components/instagram/reels-carousel-lazy.tsx`, un Client Component que hace el
`dynamic()`. Un Client Component importando dinámicamente otro Client Component sí
está soportado, y ahí la división funciona.

Sin desactivar el render en servidor, que está prohibido en toda la fase.

### El resultado

**Sonda de código muerto, recorriendo los 26 documentos con `find` y excluyendo
`index.html` y `testimonios.html`:**

| | Documentos con el código del carrusel |
|---|---|
| Antes | **23** |
| Después | **0** |

Los 23 eran `_not-found`, las ocho rutas de primer nivel, los cinco posts de
`blog/`, las cuatro sedes y los cinco servicios. El único documento sondeado que no
daba coincidencia era `_global-error.html`.

El código del carrusel vive ahora en dos chunks bajo demanda, `docs=0`, o sea no
referenciados por ningún documento: 4.187 B y 3.524 B, **7.711 B** que se piden solo
cuando el carrusel efectivamente se monta.

### Desviación: el ahorro por ruta es 846 B, no 29.656 B

Esto hay que decirlo derecho, porque la premisa del plan era otra.

El plan describe los 29.656 B de `0krsqwhv3zry_.js` como "código que las otras 22
rutas descargan y no pueden ejecutar". **Ese chunk no era el carrusel: era un chunk
compartido que contenía el carrusel entre otros módulos.**

| Medición | Antes | Después | Delta |
|---|---|---|---|
| Total por ruta en `/privacidad`, sin el chunk `noModule` | 787.749 B | **786.903 B** | **−846 B** |
| Chunk compartido que contenía el carrusel | 29.656 B | 28.810 B | −846 B |

**El aporte propio del carrusel al chunk compartido era de 846 B.** El resto de esos
29.656 B es código que las 22 rutas sí usan y que sigue donde estaba.

Lo que se cumple es el criterio que el plan puso como aserción dura, la sonda: de 23
documentos a 0. Lo que no se cumple es la lectura implícita de que eso liberaba
29.656 B por ruta. **El criterio no se ajustó para que coincidiera con la
medición.**

Y el arreglo sigue siendo correcto por lo que el plan mismo dice: se hace por lo que
cuesta descargar, analizar y compilar en un móvil de gama media, no por un puntaje.
**Este plan no promete mejora de puntaje de Lighthouse**, y la evidencia de por qué
está en la línea base: `/privacidad` descargaba el chunk del carrusel y puntuaba
1,00 con TBT de 0 ms y LCP de 1,34 s.

---

## 7. Lo que quedó sin hacer, y por qué

**El hallazgo de la sección 4, los 158.571 B de contenido en 25 rutas, no se
arregló.** No es un olvido ni una limitación técnica: es una decisión de alcance que
no me corresponde tomar.

Los archivos que habría que tocar son `src/components/layout/header.tsx` y
`src/components/layout/services-menu.tsx`. Ninguno de los dos está en los
`files_modified` de este plan, y `header.tsx` pertenece al plan 18-04. Es
exactamente el caso que el plan 18-03 ya modelaba por escrito: si la atribución cae
sobre el `Header`, la tarea se detiene, lo anota y sube la decisión de alcance, que
se resuelve ampliando un plan o abriendo uno nuevo.

Queda propuesto, con el número medido y el arreglo descrito, para que se decida.

**Segundo hallazgo relacionado, también fuera de alcance.**
`src/components/analytics/analytics-scripts.tsx:5` importa
`@next/third-parties/google` de forma estática dentro de un Client Component que
devuelve `null` mientras el consentimiento no esté en `granted`. Probado con
`dynamic()` sin desactivar el render en servidor: **ahorra 6.913 B por ruta**, y es
seguro porque `getConsentServerSnapshot()` devuelve `null`, así que ese componente
ya renderizaba `null` en el servidor y no hay marcado que preservar. El cambio se
revirtió para no dejar trabajo fuera de alcance en el árbol. Ese archivo pertenece
al plan 18-03.

---

## 8. Cobertura ejecutada según Coverage

> **Pendiente.** El panel de Coverage de devtools necesita navegador, y esta sesión
> no tiene uno manejable. Lo cubre la corrida de Lighthouse del checkpoint de la
> tarea 3.

---

## 9. Estado del HTML servido

Sin cambios, que era la restricción dura de este plan: esto es reorganización del
grafo de módulos, no del marcado.

| Ruta | Aserción | Valor | Esperado |
|---|---|---|---|
| `/testimonios` | `<img` | 2 | 2 |
| `/testimonios` | `<h2` | 4 | 4 |
| `/sedes` | `<h2` | 7 | 7 |

`grep -rn 'ssr: false' src/` devuelve **0**.

`next.config.ts` conserva sus **5** cabeceras de seguridad y sus **5** redirecciones
permanentes después de envolverse con el analizador. Esta aserción existe porque
ninguna de las cinco compuertas del proyecto mira ese archivo: `scripts/check-seo.mjs`
no lo referencia ni una vez.

Las cinco compuertas salen en **0**.
