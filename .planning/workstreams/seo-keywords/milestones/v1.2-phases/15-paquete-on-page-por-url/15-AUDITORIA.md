# Auditoría de duplicados del paquete on-page

**Primera corrida:** 2026-08-12, plan 15-02, sobre la metadata sola
**Corrida final:** 2026-08-13, plan 15-07, sobre el paquete terminado
**Sobre:** `seo-tools/data/onpage.json`, el paquete propuesto
**Resultado legible de:** `seo-tools/data/onpage-audit.json`
**Herramienta:** `seo-tools/src/phase15/auditoria.ts`, función pura, cero llamadas de red

## La corrida final, con la fase ya escrita

La primera corrida fue sobre metadata sin copy: en ese momento no existía ni una página redactada.
Esta segunda corre sobre el paquete terminado, con los 24 documentos generados y las 16 páginas
escritas, y **vuelve a dar cero en las cinco comprobaciones**. Los números de la tabla de más
abajo son los de esta corrida y no cambiaron respecto de la primera, que es exactamente lo que se
quería: los cuatro planes de copy escribieron sobre el mapa sin moverle un title ni un H1.

Se corrió el 2026-08-13, **antes de que v1.1 publique**, que es el momento en que ONPAGE-05 pide
que esté limpia y el único en que la auditoría sirve de algo. Corregir un title duplicado ahora
cuesta editar una línea de un JSON; corregirlo después de publicar cuesta una reimplementación del
otro lado y el tiempo que Google tarde en volver a rastrear.

En la misma corrida pasó la compuerta de YMYL y humanización sobre los cuatro datasets de copy a
la vez, las 16 páginas juntas: **cero hallazgos**. Es la comprobación que faltaba, porque hasta
ahora cada plan de la wave 3 la había corrido solo sobre su propia familia.

```bash
cd seo-tools
./node_modules/.bin/tsx src/phase15/ymyl.ts --todos
./node_modules/.bin/tsx src/phase15/auditoria.ts --data data/onpage.json --out data/onpage-audit.json
```

## Por qué esta auditoría es local y no sale de DinoRank

Hay dos motivos y el segundo pesa más que el primero.

El primero es de momento. `/auditoria` de DinoRank audita un sitio **publicado**. Acá se está
auditando un paquete que todavía no se publicó, que es justo cuando la auditoría sirve para algo:
corregir un title duplicado antes de publicarlo cuesta editar una línea de un JSON, y corregirlo
después cuesta una reimplementación del otro lado. El ROADMAP ya lo pedía con esas palabras, "se
corre contra el mapa propuesto, no contra el sitio vivo", así que esto no es una degradación del
alcance sino el alcance.

El segundo es de confianza en el proveedor, y va con el dato crudo. Pidiéndole
`domain: drangulocolumna.com`, ese endpoint responde HTTP 200 con `site.domain: soumahotel.com`,
el proyecto de otro cliente que hay dado de alta en esa misma cuenta. No devuelve 500, no marca
error y no avisa nada: entrega los datos de otro sitio con cara de datos propios. Un fallo
silencioso que sirve el hotel de otro cliente es peor que uno ruidoso, porque el ruidoso se ve.
Usarlo acá habría significado auditar el hotel y creer que se auditó este sitio.

Queda escrito para que nadie lo reintente pensando que fue un 500 transitorio (D-04). Se reabre
solo si `drangulocolumna.com` se da de alta como proyecto propio, y aun entonces sirve para
auditar el sitio ya publicado, o sea después de que v1.1 implemente.

## Alcance

Se auditaron **22 URLs** de las 24 del mapa.

Quedaron fuera 2, nombradas y con motivo, no borradas del reporte:

| URL | Motivo |
| --- | --- |
| `/blog/estenosis-espinal-que-es` | Se apaga con un 301 hacia `/servicios/estenosis-espinal`, así que no lleva title, meta ni H1 propios y no puede duplicar los de nadie. |
| `/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos` | Se apaga con un 301 hacia `/servicios/hernia-discal`, con el mismo criterio. |

Las dos aparecen en el reporte a propósito. Una URL que desaparece de una auditoría se lee como
olvido, y a esa altura ya no hay forma de distinguir "no aplicaba" de "se nos pasó".

## Resultado

| Comprobación | Hallazgos |
| --- | --- |
| Titles duplicados | 0 |
| H1 duplicados | 0 |
| Metas faltantes | 0 |
| Titles de más de 60 caracteres | 0 |
| Metas de más de 155 caracteres | 0 |
| Primaria que no arranca en los primeros 12 caracteres del title | 0 |

La comparación de duplicados ignora mayúsculas, tildes y espacios repetidos: `Hernia discal` y
`hernia  discal` cuentan como el mismo title. Una comparación literal habría dado limpia sobre un
duplicado real, que es el único resultado que esta auditoría no puede permitirse.

La auditoría tampoco se apoya en los campos que el generador ya calculó. Recalcula el largo y la
posición de la primaria desde el texto. Una auditoría que confía en el número que escribió el
generador no audita el paquete: audita la coherencia del generador consigo mismo, que es siempre
perfecta y por eso no significa nada.

## Las 22 URLs auditadas

| URL | Title | Meta | Primaria arranca en | H1 |
| --- | ---: | ---: | --- | --- |
| `/` | 45 | 127 | 0 | propuesto |
| `/agendar` | 34 | 122 | sin primaria | publicado |
| `/blog` | 31 | 124 | sin primaria | publicado |
| `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | 44 | 125 | 0 | propuesto |
| `/blog/artrosis` | 50 | 127 | 0 | propuesto |
| `/blog/lumbalgia` | 39 | 129 | 0 | propuesto |
| `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | 47 | 123 | 0 | propuesto |
| `/contacto` | 42 | 111 | sin primaria | publicado |
| `/preguntas-frecuentes` | 45 | 121 | 0 | propuesto |
| `/sedes` | 47 | 130 | sin primaria | publicado |
| `/sedes/clinica-ricardo-palma` | 44 | 118 | 0 | propuesto |
| `/sedes/clinica-tezza` | 44 | 124 | 0 | propuesto |
| `/sedes/consultorio-privado` | 48 | 126 | 0 | propuesto |
| `/sedes/sanna-la-molina` | 46 | 117 | 0 | propuesto |
| `/servicios` | 48 | 119 | 0 | propuesto |
| `/servicios/cirugia-minimamente-invasiva` | 47 | 118 | 0 | propuesto |
| `/servicios/escoliosis-y-deformidades` | 42 | 131 | 0 | propuesto |
| `/servicios/estenosis-espinal` | 41 | 132 | 0 | propuesto |
| `/servicios/hernia-discal` | 50 | 142 | 0 | propuesto |
| `/servicios/ortopedia-infantil` | 44 | 120 | 0 | propuesto |
| `/sobre-el-doctor` | 40 | 112 | sin primaria | publicado |
| `/testimonios` | 39 | 111 | sin primaria | publicado |

Los límites son 60 y 155, que es lo que la fase 10 de v1.1 comprueba del otro lado (D-13). El
title más largo del paquete mide 50 y la meta más larga mide 142, así que las 22 entran con
holgura y ninguna queda pegada al borde donde un ajuste menor la sacaría de rango.

Las seis que dicen "sin primaria" son las que declararon no competir en la fase 14. Su H1 sale
marcado como publicado porque se transcribió del sitio tal cual, con el archivo y la línea de
donde salió anotados en `origenDelH1`. Proponerles uno nuevo desde acá habría reabierto una
decisión de la fase 14 sin dato nuevo y por la puerta de atrás.

## Qué queda habilitado

ONPAGE-05 está cerrado sobre el paquete terminado: cero titles duplicados, cero H1 duplicados y
cero metas faltantes, comprobado antes de que v1.1 publique, que es lo que el requisito pide.

Cualquiera que agregue o cambie un title, una meta o un H1 tiene que volver a correr:

```bash
cd seo-tools
./node_modules/.bin/tsx src/phase15/metadatos.ts --out data/onpage.json
./node_modules/.bin/tsx src/phase15/auditoria.ts --data data/onpage.json --out data/onpage-audit.json
```

El segundo comando sale con código distinto de cero si aparece un hallazgo.
