# Auditoría SEO: drangulocolumna.com

Fecha: 2026-08-23
Fuentes: crawl propio de las 22 URLs del sitemap, Unlighthouse (Lighthouse en 23 rutas, throttling móvil), Google Search Console (sc-domain:drangulocolumna.com).

## Puntaje de salud SEO: 81/100

| Categoría | Peso | Puntaje |
|---|---|---|
| SEO técnico | 22% | 88 |
| Calidad de contenido | 23% | 72 |
| On-page | 20% | 80 |
| Datos estructurados | 10% | 88 |
| Rendimiento (CWV lab) | 10% | 78 |
| Preparación para búsqueda con IA | 10% | 85 |
| Imágenes | 5% | 82 |

El sitio está bien construido. Lo que lo frena no es la implementación, es que Google todavía no indexó casi nada.

## Estado actual en Search Console

Período 23 jul al 19 ago 2026: 13 clics y 892 impresiones, repartidas en apenas 6 URLs.

- 673 impresiones vienen de `/?utm_source=google&utm_medium=organic&utm_campaign=gbp`, es decir del perfil de Google Business, no de resultados orgánicos clásicos.
- Solo la home aparece como "Submitted and indexed" (último rastreo: 21 ago).
- `/servicios`, `/servicios/hernia-discal` y `/blog/lumbalgia` figuran como "Discovered - currently not indexed", sin fecha de último rastreo. Por extrapolación, la mayoría de las 22 URLs está en ese mismo estado.
- El sitemap está enviado, con 22 URLs, 0 errores y 0 advertencias. Última descarga: 22 ago.

Lectura: el descubrimiento funciona, lo que falta son señales que justifiquen el gasto de rastreo. Sitio nuevo, sin enlaces externos apuntando a las páginas internas.

---

## Crítico

### 1. Veinte de veintidós URLs no están indexadas

Evidencia: inspección de URL en GSC devuelve "Discovered - currently not indexed" con `last_crawled: null` en las tres páginas internas muestreadas. Ninguna página de servicio, sede o blog registra impresiones salvo escoliosis (3 impresiones, posición 47).

Qué hacer, en este orden:

1. Solicitar indexación manual en GSC de las ocho páginas núcleo: `/servicios`, los cuatro `/servicios/*` de mayor volumen y `/sedes/consultorio-privado`, `/sobre-el-doctor`, `/preguntas-frecuentes`.
2. Enlazar desde afuera. El perfil de Google Business ya manda tráfico a la home. Agregar entradas de GBP que enlacen a páginas internas concretas (una por sede, una por condición). El perfil de Doctoralia y el de Instagram también sirven de punto de entrada.
3. Conseguir al menos tres enlaces desde dominios de terceros: fichas de las clínicas donde atiende (Ricardo Palma, Sanna, Tezza), directorios médicos peruanos y colegios profesionales.

Cómo saber si falló: si a los 21 días las páginas núcleo siguen con `last_crawled: null`, el cuello de botella no es de rastreo sino de autoridad, y toca priorizar enlaces externos por sobre contenido nuevo.

Indicador para vigilar sin repetir la auditoría: cantidad de URLs con impresiones en el informe de Rendimiento de GSC. Hoy son 6. Objetivo a 60 días: 15 o más.

---

## Alto

### 2. Dos slugs del blog no corresponden al contenido

| URL | Contenido real |
|---|---|
| `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | Ciática |
| `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | Cirugía de columna |

El title, el H1 y el cuerpo hablan de otro tema que el que anuncia la URL. Google usa la URL como señal de relevancia y el usuario la ve en la SERP.

La ventaja es que ninguna de las dos está indexada, así que renombrar hoy no cuesta nada. En seis meses sí.

Propuesta: `/blog/ciatica` y `/blog/cirugia-de-columna`, con redirección 301 desde los slugs viejos.

Depende de: nada. Desbloquea: la resolución de la canibalización del punto 5.

### 3. `/preguntas-frecuentes` tiene el title de otra página

- URL: `/preguntas-frecuentes`
- Title: "Reumatólogo o traumatólogo: a cuál te toca ir"
- H1: "Dudas frecuentes antes de la consulta"
- Estructura de H2: la misma plantilla de una página de condición ("Qué es el reumatólogo o traumatólogo", "Qué síntomas produce", "Por qué aparece")

Se aplicó la plantilla de condición a una página de FAQ. El resultado es una página que compite por "reumatólogo o traumatólogo" pero que vive en una URL de preguntas frecuentes y que declara `FAQPage` con 7 preguntas.

Dos caminos:

- Separar: dejar `/preguntas-frecuentes` como FAQ real, con su title propio, y mover el contenido de "reumatólogo o traumatólogo" a `/blog/reumatologo-o-traumatologo`.
- Consolidar: cambiar el slug a la keyword y asumir que la FAQ vive dentro.

Recomiendo separar. Son dos intenciones distintas y hay volumen para las dos.

### 4. Anchors internos sobreoptimizados en el bloque "Sigue leyendo"

El módulo de enlaces al pie de las páginas usa la keyword cruda como texto de enlace. Ejemplos reales del HTML en producción:

- "mejor neurocirujano de columna lima" apunta a `/servicios`
- "artrosis traumatologo o reumatologo" apunta a `/preguntas-frecuentes`
- "cirugía de columna cerca de mí" apunta a `/servicios`
- "donde duele la ciática" apunta a `/blog/5-sintomas-...`

Dos problemas distintos:

1. El patrón de anchor de coincidencia exacta, repetido en todo el sitio y sin acentos ni mayúsculas, se lee como manipulación.
2. El contenido del anchor es incorrecto. El Dr. Angulo es traumatólogo y cirujano de columna, no neurocirujano, y "mejor" es una afirmación superlativa en un sitio médico. En YMYL eso pesa.

Reescribir los anchors a frases descriptivas que digan a dónde llevan: "Qué condiciones de columna atiende", "Diferencia entre reumatólogo y traumatólogo", "Cuándo el dolor de pierna viene de la columna".

Cómo saber si falló: si tras el cambio bajan las impresiones de esas keywords, el bloque estaba aportando. Poco probable con 892 impresiones totales, pero conviene anotar el punto de partida antes de tocar.

### 5. Canibalización entre ciática, lumbalgia y hernia discal

Tres URLs cubren el mismo campo semántico con la misma estructura:

- `/servicios/hernia-discal` (3.341 palabras)
- `/blog/lumbalgia` (2.273 palabras)
- `/blog/5-sintomas-...`, que en realidad es ciática (2.135 palabras)

Las tres responden "qué es, qué síntomas produce, por qué aparece, cómo se diagnostica, qué se hace sin operar, cuándo se opera". Google va a elegir una y las otras dos van a quedar como duplicados temáticos.

Definir la intención de cada una:

- Hernia discal: la página comercial, con la decisión quirúrgica y las sedes.
- Lumbalgia: informativa, dolor inespecífico, autocuidado, cuándo consultar. Que enlace a hernia discal cuando corresponda.
- Ciática: informativa, dolor irradiado, diagnóstico diferencial. Que enlace a hernia discal como causa.

Y quitar de las dos informativas las secciones de "cuándo hace falta operar" que repiten a la comercial.

---

## Medio

### 6. La misma plantilla de H2 en ocho páginas

Ocho páginas comparten los siete mismos H2, palabra por palabra. El contenido debajo es distinto y está bien escrito, pero la repetición estructural exacta le facilita a Google el trabajo de agrupar las páginas como variaciones de un molde.

Variar el fraseo por página en función de la condición. Que "Por qué aparece" sea "Por qué se estrecha el canal" en estenosis y "Por qué se desvía la columna" en escoliosis.

### 7. TTFB de 630 ms en la home

`server-response-time` marca 630 ms en la home y falla en 22 de 23 rutas. El HTML sale con `cache-control: s-maxage=3600` pero Cloudflare responde `cf-cache-status: DYNAMIC`, es decir que no lo está cacheando en el borde.

Revisar por qué el HTML no entra en caché de Cloudflare. Con la home prerenderizada (`x-nextjs-prerender: 1`, `x-nextjs-cache: HIT`) el TTFB debería estar bastante por debajo.

Impacto: 630 ms del TTFB se comen buena parte del LCP de 3,7 s de la home.

### 8. `/testimonios` es la peor página en rendimiento

Puntaje 0,60. Total Blocking Time de 850 ms, trabajo de hilo principal de 4,2 s, de los cuales 2,45 s son Style & Layout y 630 ms de forced reflow sin atribuir. Speed Index 0,18.

Con 232 palabras de contenido, ese costo no se justifica. Sospecha: el embebido de reseñas o el carrusel de videos fuerza layout en bucle. Revisar el componente de reseñas de Google y el de videos.

### 9. Imagen LCP de `/sobre-el-doctor` sin prioridad

La foto del doctor es el elemento LCP, se carga sin `fetchpriority="high"` y sin preload. Además hay 21 KB de ahorro disponible por formato y dimensiones.

En Next.js, `priority` en el componente `Image` de la foto principal.

### 10. Referencias `about` incorrectas en el schema

- `/blog/lumbalgia`, `/blog/5-sintomas-...` y `/blog/miedo-a-operarte-...` declaran `about` apuntando a `https://drangulocolumna.com/servicios/hernia-discal#page`.
- `/blog/artrosis` no declara `about`.

Lumbalgia no trata sobre hernia discal, ciática tampoco y cirugía de columna menos. Apuntar cada uno a su entidad `MedicalCondition` correspondiente, igual que hace `/servicios/hernia-discal` con su `MedicalCondition` propia.

### 11. `FAQPage` con una sola pregunta en `/servicios/hernia-discal`

La página declara `FAQPage` con una pregunta. Nota de contexto: Google retiró los rich results de FAQ para todos los sitios el 7 de mayo de 2026, así que este marcado ya no produce ningún resultado enriquecido en la SERP. No hace falta quitarlo, pero tampoco conviene agregar `FAQPage` nuevo esperando beneficio en Google. Si el bloque tiene preguntas reales de pacientes, `QAPage` es el tipo correcto.

### 12. Accesibilidad: tres fallos concretos

- Home: contraste insuficiente en `main#contenido > section.bg-primary > div.mx-auto > p.mt-3`. Es un párrafo con `text-white/8x` sobre fondo primario.
- `/agendar`: cuatro listas `<dl>` mal formadas. Los `<dt>` y `<dd>` están envueltos en `<div>` intermedios que rompen la estructura esperada. Afecta a las cuatro fichas de sede.
- `/sedes`: un `<h3>` aparece sin `<h2>` previo en `div.mx-auto > div.mt-10 > article.relative > h3`.

### 13. JavaScript sin usar y JavaScript legacy

28 KB sin usar en `_next/static/chunks/31iarpvmym1z2.js` (41% del chunk), presente en las 23 rutas. Más polyfills legacy servidos a navegadores que no los necesitan.

---

## Bajo

### 14. La imagen OpenGraph pesa 551 KB

`/opengraph-image` devuelve un PNG de 551 KB. Solo afecta a la vista previa al compartir, no al Core Web Vitals, pero es innecesario. Bajarla a WebP o reducir la calidad del PNG.

### 15. Cuatro páginas hub muy delgadas

`/contacto` (187 palabras), `/blog` (194), `/testimonios` (232), `/sedes` (275). Son páginas de navegación, así que el conteo bajo es esperable, pero `/blog` con solo cuatro artículos y sin texto introductorio tiene poco para ofrecerle a Google como página indexable.

### 16. Los UTM del perfil de Google Business fragmentan el reporte

Tres URLs con `?utm_source=google&utm_medium=organic&utm_campaign=gbp` aparecen como páginas separadas en GSC y concentran 778 de las 892 impresiones. El canonical apunta correctamente a la versión limpia, así que no hay riesgo de duplicado, pero el reporte de rendimiento queda partido en dos.

Considerar sacar los UTM del enlace del perfil de GBP y medir ese canal por el informe propio de Google Business.

### 17. Falta Content Security Policy

Los headers de seguridad están bien (HSTS con includeSubDomains, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy). Falta CSP. Además, Lighthouse registra issues de CSP en devtools en `/agendar`, `/servicios/escoliosis-y-deformidades` y `/servicios/estenosis-espinal`.

### 18. Sin citas a fuentes médicas externas

Los únicos enlaces salientes son al Colegio Médico del Perú, Google Maps, WhatsApp, Instagram y las webs de las clínicas. Para contenido médico, citar fuentes verificables (sociedades de cirugía de columna, guías clínicas) refuerza E-E-A-T y es de lo que más pesa cuando un motor generativo decide a quién citar.

---

## Lo que ya está bien y conviene no romper

- Canonicalización impecable: http a https (301), www a raíz (301), barra final a sin barra (308), 404 real en URLs inexistentes y en variantes de mayúsculas.
- Datos estructurados de nivel alto: grafo `@graph` con `Physician`, cuatro `MedicalClinic` con NAP completo y coordenadas, `hasCredential` con CMP 83189 y RNE 35310 enlazados al verificador oficial, `sameAs` a Instagram, Doctoralia, Google Maps y Facebook, `BreadcrumbList` en todas las páginas internas.
- Titles y meta descriptions únicos y dentro de rango en las 22 URLs (titles de 31 a 50 caracteres, descriptions de 111 a 142).
- Un solo H1 por página, sin duplicados en todo el sitio.
- Cero imágenes sin atributo alt en las 22 URLs.
- CLS de 0 en las 23 rutas medidas.
- `llms.txt` presente y bien armado, con credenciales verificables y alcance del contenido. ClaudeBot con permiso explícito en robots.txt.
- `/privacidad` con `noindex, follow` y fuera del sitemap. Correcto.
- Promedio de accesibilidad de 1,00 y de buenas prácticas de 0,99 en Lighthouse.

---

## Plan de acción por dependencias

Semana 1, sin dependencias entre sí:

1. Renombrar los dos slugs del blog con 301 (punto 2).
2. Resolver el title de `/preguntas-frecuentes` (punto 3).
3. Reescribir los anchors del bloque "Sigue leyendo" (punto 4).
4. Corregir los `about` del schema (punto 10).
5. Solicitar indexación manual de las ocho páginas núcleo, una vez aplicados los puntos 1 a 4 (punto 1).

Semana 2, depende de la semana 1:

6. Diferenciar ciática, lumbalgia y hernia discal (punto 5).
7. Variar los H2 de plantilla (punto 6).
8. Enlaces externos: entradas de GBP hacia páginas internas, fichas en las clínicas (punto 1).

Semana 3 y 4, independiente de lo anterior:

9. Investigar el cacheo de HTML en Cloudflare (punto 7).
10. Arreglar el rendimiento de `/testimonios` (punto 8).
11. `priority` en la imagen de `/sobre-el-doctor` (punto 9).
12. Los tres fallos de accesibilidad (punto 12).

Backlog: puntos 13 a 18.

## Métricas a vigilar

| Métrica | Hoy | Objetivo 60 días | Dónde |
|---|---|---|---|
| URLs con impresiones | 6 | 15 o más | GSC, informe de Rendimiento |
| URLs indexadas | 1 confirmada | 18 o más | GSC, informe de Páginas |
| Clics orgánicos en 28 días | 13 | 60 o más | GSC |
| TTFB de la home | 630 ms | menos de 300 ms | Lighthouse o CrUX |
| LCP promedio del sitio | 2,7 s | menos de 2,5 s | Unlighthouse |
