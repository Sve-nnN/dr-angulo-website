# Fase 14 — Matriz de enlazado interno

> **Esto se propone y NO se implementa acá.** Los enlaces los escribe el workstream
> `milestone` (v1.1) dentro del código de la aplicación. Este documento y
> `seo-tools/data/internal-links.json` son la especificación: qué URL enlaza a cuál, con
> qué anchor y por qué. El workstream `seo-keywords` no escribe en `src/`.

Generado por `seo-tools/src/phase14/links.ts`. No editar a mano: se regenera.

## Cómo se construyó

1. **Dentro del tema primero.** El cluster ordena los candidatos y el solape par a par
   decide (D-05). Un par que comparte tantas URLs del top 10 como para fusionarse **no**
   se enlaza: no son dos páginas, son una con dos URLs.
2. **Hacia las de oro.** Las URLs que sirven una de las 10 de Oro reciben señal de su
   vecindad temática, nunca de cualquier página suelta (D-06).
3. **De captación a servicio.** El artículo del blog manda a la guía que resuelve el caso,
   y no al revés: la captación alimenta, no vende (D-09).
4. **Hacia las sedes.** Cada guía dice dónde se atiende ese servicio, en las cuatro sedes
   vigentes: consultorio de Surco, Ricardo Palma, Sanna La Molina y Padre Luis Tezza (D-08).
5. **Hacia conversión.** Cada página de servicio termina en `/agendar`.

**El anchor sale siempre de una keyword del destino, nunca del título del origen.** Un
enlace le dice a Google de qué trata la página a la que apunta. Y ningún anchor apunta a
dos destinos: eso sería canibalización escrita a mano.

## Resumen

| Métrica | Valor |
|---|---|
| URLs en la matriz | 22 |
| Enlaces propuestos | 135 |
| Anchors distintos | 78 |
| URLs sin enlaces entrantes | 0 |
| Pares descartados por solape | 0 |
| Umbral de solape aplicado | 3 URLs compartidas del top 10 |

## URLs que quedan fuera de la matriz

- **`/blog/estenosis-espinal-que-es`** — Redirige 301 hacia /servicios/estenosis-espinal en la fase 15. No entra a la matriz por las dos puntas: enlazar HACIA ella mandaria a cada visitante por un salto de mas, y enlazar DESDE ella seria escribir enlaces en una pagina que se apaga. Lo que hereda su senal es el destino del 301, que si esta en la matriz.
- **`/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos`** — Redirige 301 hacia /servicios/hernia-discal en la fase 15. No entra a la matriz por las dos puntas: enlazar HACIA ella mandaria a cada visitante por un salto de mas, y enlazar DESDE ella seria escribir enlaces en una pagina que se apaga. Lo que hereda su senal es el destino del 301, que si esta en la matriz.

## Enlaces entrantes por URL

Cuántas páginas sostienen a cada una. Ninguna en cero.

| URL | Entrantes | Salientes |
|---|---|---|
| `/servicios` | 21 | 8 |
| `/agendar` | 16 | 4 |
| `/sedes` | 10 | 6 |
| `/` | 9 | 8 |
| `/blog` | 7 | 5 |
| `/contacto` | 6 | 4 |
| `/sedes/clinica-ricardo-palma` | 6 | 6 |
| `/sedes/clinica-tezza` | 6 | 6 |
| `/sedes/consultorio-privado` | 6 | 6 |
| `/sedes/sanna-la-molina` | 6 | 6 |
| `/servicios/ortopedia-infantil` | 6 | 7 |
| `/blog/artrosis` | 5 | 5 |
| `/servicios/hernia-discal` | 5 | 8 |
| `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | 4 | 6 |
| `/blog/lumbalgia` | 4 | 6 |
| `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | 4 | 6 |
| `/servicios/escoliosis-y-deformidades` | 4 | 8 |
| `/servicios/estenosis-espinal` | 3 | 8 |
| `/servicios/cirugia-minimamente-invasiva` | 2 | 8 |
| `/sobre-el-doctor` | 2 | 5 |
| `/testimonios` | 2 | 5 |
| `/preguntas-frecuentes` | 1 | 4 |

## La matriz, cluster por cluster

### artrosis

#### `/blog/artrosis`

Artrosis: qué es, cómo se trata y cuándo consultar · Sin publicar (planificada) · acción: Crear

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | ciática o lumbalgia | vecindad-tematica | El cluster "artrosis" y el cluster "ciática" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 2 | `/blog/lumbalgia` | lumbalgia se opera | vecindad-tematica | El cluster "artrosis" y el cluster "lumbalgia" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 3 | `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | cirugía de columna cervical | vecindad-tematica | El cluster "artrosis" y el cluster "cirugía de columna" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 4 | `/blog` | Blog | navegacion-de-seccion | Vuelve al indice del silo informativo, que es la pagina que agrupa a todos los articulos hermanos. |
| 5 | `/servicios` | cirujano de columna lima | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

### ciática

#### `/blog/5-sintomas-de-columna-que-no-debes-ignorar`

5 síntomas de columna que no debes ignorar · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios/hernia-discal` | hernia discal lumbar y cervical | mencion-inversa | /servicios/hernia-discal ya lleva "ciatica o hernia discal" entre sus keywords, que contiene la primaria "ciática" de esta pagina. La captacion alimenta al servicio y no al reves (D-09): el articulo manda al paciente a la guia que resuelve su caso. |
| 2 | `/blog/artrosis` | artrosis lumbosacro | vecindad-tematica | El cluster "ciática" y el cluster "artrosis" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 3 | `/blog/lumbalgia` | tipos de lumbalgia | vecindad-tematica | El cluster "ciática" y el cluster "lumbalgia" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 4 | `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | videos de cirugía de columna | vecindad-tematica | El cluster "ciática" y el cluster "cirugía de columna" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 5 | `/blog` | Blog | navegacion-de-seccion | Vuelve al indice del silo informativo, que es la pagina que agrupa a todos los articulos hermanos. |
| 6 | `/servicios` | cirugía de columna cerca de mí | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

### cirugía de columna

#### `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber`

¿Tienes miedo a operarte de la columna? 5 cosas que debes saber · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios/cirugia-minimamente-invasiva` | cirugía endoscópica de columna | mencion-inversa | La primaria de esta pagina, "cirugía de columna", y la de /servicios/cirugia-minimamente-invasiva, "cirugía mínimamente invasiva en lima", comparten el termino clinico "cirugia": el articulo explica la decision y la guia explica el procedimiento, asi que la captacion alimenta al servicio y no al reves (D-09). |
| 2 | `/blog/artrosis` | pastillas para la artrosis | vecindad-tematica | El cluster "cirugía de columna" y el cluster "artrosis" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 3 | `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | falsa ciática | vecindad-tematica | El cluster "cirugía de columna" y el cluster "ciática" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 4 | `/blog/lumbalgia` | causas de lumbalgia | vecindad-tematica | El cluster "cirugía de columna" y el cluster "lumbalgia" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 5 | `/blog` | Blog | navegacion-de-seccion | Vuelve al indice del silo informativo, que es la pagina que agrupa a todos los articulos hermanos. |
| 6 | `/servicios` | cirujano de columna cerca de mí | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

### cirugía mínimamente invasiva en lima

#### `/servicios/cirugia-minimamente-invasiva`

Cirugía mínimamente invasiva de columna en Lima · Sin publicar (planificada) · acción: Crear

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios/escoliosis-y-deformidades` | ejercicios para escoliosis | vecindad-tematica | Las dos viven en la seccion "/servicios" del sitio y sus clusters no se tocan, asi que el enlace las une por estructura y no por tema: es navegacion dentro del silo. |
| 2 | `/servicios/ortopedia-infantil` | ortopedia infantil cerca de mí | vecindad-tematica | Las dos viven en la seccion "/servicios" del sitio y sus clusters no se tocan, asi que el enlace las une por estructura y no por tema: es navegacion dentro del silo. |
| 3 | `/sedes/clinica-ricardo-palma` | traumatólogo clínica ricardo palma | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-ricardo-palma: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 4 | `/sedes/clinica-tezza` | traumatólogo clínica tezza | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-tezza: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 5 | `/sedes/consultorio-privado` | cirujano de columna surco | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/consultorio-privado: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 6 | `/sedes/sanna-la-molina` | traumatólogo clínica sanna | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/sanna-la-molina: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 7 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |
| 8 | `/servicios` | cirujano de columna lima | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

### cirujano de columna clínica ricardo palma

#### `/sedes/clinica-ricardo-palma`

Traumatólogo y cirujano de columna en Clínica Ricardo Palma · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | Vuelve al hub de sedes, que es la pagina que compara las cuatro y deja elegir la mas cercana. |
| 2 | `/servicios` | mejor neurocirujano de columna lima | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/servicios/ortopedia-infantil` | ortopedia infantil cerca de mí | mencion-directa | Esta pagina persigue "ortopedia infantil clinica ricardo palma", que contiene la primaria "ortopedia infantil lima" de /servicios/ortopedia-infantil. El tema ya aparece en su propio texto: el enlace lo manda a donde se responde entero, en vez de dejar dos paginas peleando la misma consulta. |
| 4 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |
| 5 | `/contacto` | Contacto y Citas en Lima | hacia-conversion | La sede ofrece la segunda via de contacto para quien prefiere escribir su caso antes de agendar. |
| 6 | `/` | traumatólogo ortopedia infantil | navegacion-de-seccion | Vuelve a la raiz, que es la pagina que pelea la consulta de especialidad entera y de la que cuelga la red de sedes. |

### cirujano de columna clínica sanna

#### `/sedes/sanna-la-molina`

Traumatólogo y cirujano de columna en Clínica Sanna, sede La Molina · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | Vuelve al hub de sedes, que es la pagina que compara las cuatro y deja elegir la mas cercana. |
| 2 | `/servicios` | cirugía de columna cerca de mí | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/servicios/ortopedia-infantil` | medico ortopedia infantil | mencion-directa | Esta pagina persigue "ortopedia infantil clinica sanna", que contiene la primaria "ortopedia infantil lima" de /servicios/ortopedia-infantil. El tema ya aparece en su propio texto: el enlace lo manda a donde se responde entero, en vez de dejar dos paginas peleando la misma consulta. |
| 4 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |
| 5 | `/contacto` | Contacto y Citas en Lima | hacia-conversion | La sede ofrece la segunda via de contacto para quien prefiere escribir su caso antes de agendar. |
| 6 | `/` | traumatología lima | navegacion-de-seccion | Vuelve a la raiz, que es la pagina que pelea la consulta de especialidad entera y de la que cuelga la red de sedes. |

### cirujano de columna clínica tezza

#### `/sedes/clinica-tezza`

Traumatólogo y cirujano de columna en Clínica Padre Luis Tezza · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | Vuelve al hub de sedes, que es la pagina que compara las cuatro y deja elegir la mas cercana. |
| 2 | `/servicios` | cirujano de columna cerca de mí | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/servicios/ortopedia-infantil` | ortopedia infantil perú | mencion-directa | Esta pagina persigue "ortopedia infantil clinica tezza", que contiene la primaria "ortopedia infantil lima" de /servicios/ortopedia-infantil. El tema ya aparece en su propio texto: el enlace lo manda a donde se responde entero, en vez de dejar dos paginas peleando la misma consulta. |
| 4 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |
| 5 | `/contacto` | Contacto y Citas en Lima | hacia-conversion | La sede ofrece la segunda via de contacto para quien prefiere escribir su caso antes de agendar. |
| 6 | `/` | traumatología y ortopedia cerca de mí | navegacion-de-seccion | Vuelve a la raiz, que es la pagina que pelea la consulta de especialidad entera y de la que cuelga la red de sedes. |

### escoliosis

#### `/servicios/escoliosis-y-deformidades`

Escoliosis y deformidades de columna: diagnóstico y tratamiento · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios/estenosis-espinal` | estenosis espinal: tratamientos | vecindad-tematica | El cluster "escoliosis" y el cluster "estenosis espinal" son de la misma familia "condiciones-nucleo": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 2 | `/servicios/hernia-discal` | hernia discal tomografía | vecindad-tematica | El cluster "escoliosis" y el cluster "hernia discal" son de la misma familia "condiciones-nucleo": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 3 | `/sedes/clinica-ricardo-palma` | clínica ricardo palma traumatología | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-ricardo-palma: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 4 | `/sedes/clinica-tezza` | neurocirujano clínica tezza | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-tezza: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 5 | `/sedes/consultorio-privado` | neurocirujano surco | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/consultorio-privado: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 6 | `/sedes/sanna-la-molina` | cirugía de columna clínica sanna | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/sanna-la-molina: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 7 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |
| 8 | `/servicios` | mejor neurocirujano de columna lima | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

### especialista en columna y trauma en Lima

#### `/`

Dr. Juan Carlos Angulo Totesaut — Traumatólogo y Cirujano de Columna en Lima · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios` | mejor neurocirujano de columna lima | raiz-de-navegacion | La home reparte su autoridad hacia el hub de servicios, que es donde vive la oferta clinica entera. |
| 2 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | raiz-de-navegacion | Desde la raiz se llega al hub de sedes, que es la respuesta a la pregunta de donde atiende el doctor. |
| 3 | `/blog` | Blog | raiz-de-navegacion | El silo informativo cuelga de la home: es la puerta de la captacion y necesita senal desde la raiz. |
| 4 | `/preguntas-frecuentes` | artrosis traumatologo o reumatologo | raiz-de-navegacion | Las dudas previas a la consulta se resuelven antes de agendar, asi que la raiz las pone a un clic. |
| 5 | `/sobre-el-doctor` | Dr. Juan Carlos Angulo | raiz-de-navegacion | La pagina de autoridad del sitio sostiene la confianza de todo lo demas bajo la restriccion YMYL. |
| 6 | `/testimonios` | Testimonios de pacientes | raiz-de-navegacion | La prueba social acompana a la autoridad y la home es la que la pone delante del paciente. |
| 7 | `/contacto` | Contacto y Citas en Lima | raiz-de-navegacion | Segunda via de conversion del sitio, con el temario de sedes: la raiz la enlaza junto con agendar. |
| 8 | `/agendar` | Agendar cita | raiz-de-navegacion | La home termina en el paso que el proyecto entero persigue: pedir la cita en menos de dos clics. |

#### `/sedes/consultorio-privado`

Consultorio de traumatología y columna en Surco, Lima · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | Vuelve al hub de sedes, que es la pagina que compara las cuatro y deja elegir la mas cercana. |
| 2 | `/servicios` | traumatólogo de columna | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/servicios/ortopedia-infantil` | pediatria ortopedia infantil | mencion-directa | Esta pagina persigue "ortopedia infantil surco", que contiene la primaria "ortopedia infantil lima" de /servicios/ortopedia-infantil. El tema ya aparece en su propio texto: el enlace lo manda a donde se responde entero, en vez de dejar dos paginas peleando la misma consulta. |
| 4 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |
| 5 | `/contacto` | Contacto y Citas en Lima | hacia-conversion | La sede ofrece la segunda via de contacto para quien prefiere escribir su caso antes de agendar. |
| 6 | `/` | traumatólogo cerca de mí | navegacion-de-seccion | Vuelve a la raiz, que es la pagina que pelea la consulta de especialidad entera y de la que cuelga la red de sedes. |

#### `/servicios`

Traumatólogo Especialista en Columna en Lima — Servicios · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios/escoliosis-y-deformidades` | escoliosis y deformidades de columna | hub-a-hijas | El hub reparte hacia /servicios/escoliosis-y-deformidades, que es la guia que responde ese tema entero. Un hub que no enlaza a sus hijas retiene una senal que no sabe usar. |
| 2 | `/servicios/ortopedia-infantil` | ortopedia infantil lima | hub-a-hijas | El hub reparte hacia /servicios/ortopedia-infantil, que es la guia que responde ese tema entero. Un hub que no enlaza a sus hijas retiene una senal que no sabe usar. |
| 3 | `/servicios/cirugia-minimamente-invasiva` | endoscopía espinal | hub-a-hijas | El hub reparte hacia /servicios/cirugia-minimamente-invasiva, que es la guia que responde ese tema entero. Un hub que no enlaza a sus hijas retiene una senal que no sabe usar. |
| 4 | `/servicios/estenosis-espinal` | estenosis de canal | hub-a-hijas | El hub reparte hacia /servicios/estenosis-espinal, que es la guia que responde ese tema entero. Un hub que no enlaza a sus hijas retiene una senal que no sabe usar. |
| 5 | `/servicios/hernia-discal` | ciatica o hernia discal | hub-a-hijas | El hub reparte hacia /servicios/hernia-discal, que es la guia que responde ese tema entero. Un hub que no enlaza a sus hijas retiene una senal que no sabe usar. |
| 6 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | El hub de servicios manda al de sedes: quien ya sabe que procedimiento necesita, pregunta donde se hace. |
| 7 | `/blog` | Blog | navegacion-de-seccion | Del hub al silo informativo, que es donde estan las respuestas largas que la pagina comercial no da. |
| 8 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |

#### `/servicios/ortopedia-infantil`

Ortopedia infantil: desarrollo, marcha y columna en crecimiento · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/` | mejor clínica de traumatología en lima | vecindad-tematica | Comparte con / el cluster "especialista en columna y trauma en Lima", que la fase 13 formo midiendo solape de SERP: son dos paginas del mismo tema y la senal tiene que circular entre ellas. |
| 2 | `/servicios` | cirugía de columna cerca de mí | vecindad-tematica | Comparte con /servicios el cluster "especialista en columna y trauma en Lima", que la fase 13 formo midiendo solape de SERP: son dos paginas del mismo tema y la senal tiene que circular entre ellas. |
| 3 | `/sedes/clinica-ricardo-palma` | cirujano de columna clínica ricardo palma | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-ricardo-palma: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 4 | `/sedes/clinica-tezza` | ortopedia infantil clínica tezza | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-tezza: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 5 | `/sedes/consultorio-privado` | cirugía de columna surco | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/consultorio-privado: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 6 | `/sedes/sanna-la-molina` | cirujano de columna clínica sanna | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/sanna-la-molina: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 7 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |

### estenosis espinal

#### `/servicios/estenosis-espinal`

Estenosis espinal: síntomas, diagnóstico y tratamiento · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios/escoliosis-y-deformidades` | cirugía de escoliosis | vecindad-tematica | El cluster "estenosis espinal" y el cluster "escoliosis" son de la misma familia "condiciones-nucleo": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 2 | `/servicios/hernia-discal` | lumbalgia o hernia discal | vecindad-tematica | El cluster "estenosis espinal" y el cluster "hernia discal" son de la misma familia "condiciones-nucleo": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 3 | `/sedes/clinica-ricardo-palma` | mejor traumatólogo de la clínica ricardo palma | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-ricardo-palma: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 4 | `/sedes/clinica-tezza` | cirugía de columna clínica tezza | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-tezza: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 5 | `/sedes/consultorio-privado` | ortopedia infantil surco | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/consultorio-privado: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 6 | `/sedes/sanna-la-molina` | neurocirujano clínica sanna | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/sanna-la-molina: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 7 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |
| 8 | `/servicios` | cirujano de columna cerca de mí | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

### hernia discal

#### `/servicios/hernia-discal`

Hernia discal: síntomas, diagnóstico y tratamiento · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios/escoliosis-y-deformidades` | escoliosis dorsal | vecindad-tematica | El cluster "hernia discal" y el cluster "escoliosis" son de la misma familia "condiciones-nucleo": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 2 | `/servicios/estenosis-espinal` | estenosis espinal cuidado personal | vecindad-tematica | El cluster "hernia discal" y el cluster "estenosis espinal" son de la misma familia "condiciones-nucleo": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 3 | `/sedes/clinica-ricardo-palma` | cirugía de columna san isidro | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-ricardo-palma: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 4 | `/sedes/clinica-tezza` | ortopedia clínica tezza | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/clinica-tezza: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 5 | `/sedes/consultorio-privado` | traumatología surco | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/consultorio-privado: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 6 | `/sedes/sanna-la-molina` | cirugía de columna la molina | hacia-las-sedes | La atencion de este servicio ocurre en /sedes/sanna-la-molina: la pagina que explica el procedimiento tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08). |
| 7 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |
| 8 | `/servicios` | traumatólogo de columna | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

### lumbalgia

#### `/blog/lumbalgia`

Lumbalgia: por qué duele la zona lumbar y qué hacer · Sin publicar (planificada) · acción: Crear

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/servicios/hernia-discal` | hernia discal lumbosacra tratamiento | mencion-inversa | /servicios/hernia-discal ya lleva "lumbalgia o hernia discal" entre sus keywords, que contiene la primaria "lumbalgia" de esta pagina. La captacion alimenta al servicio y no al reves (D-09): el articulo manda al paciente a la guia que resuelve su caso. |
| 2 | `/blog/artrosis` | como frenar la artrosis | vecindad-tematica | El cluster "lumbalgia" y el cluster "artrosis" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 3 | `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | donde duele la ciática | vecindad-tematica | El cluster "lumbalgia" y el cluster "ciática" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 4 | `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | cirugía de columna escoliosis | vecindad-tematica | El cluster "lumbalgia" y el cluster "cirugía de columna" son de la misma familia "especialidad-y-procedimientos": el paciente que llega por uno de los dos temas esta a un paso del otro. |
| 5 | `/blog` | Blog | navegacion-de-seccion | Vuelve al indice del silo informativo, que es la pagina que agrupa a todos los articulos hermanos. |
| 6 | `/servicios` | mejor neurocirujano de columna lima | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

### reumatólogo o traumatólogo

#### `/preguntas-frecuentes`

Preguntas frecuentes · 200 · acción: Reescribir

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/blog/artrosis` | osteoporosis o artrosis | mencion-directa | Esta pagina persigue "artrosis traumatologo o reumatologo", que contiene la primaria "artrosis" de /blog/artrosis. El tema ya aparece en su propio texto: el enlace lo manda a donde se responde entero, en vez de dejar dos paginas peleando la misma consulta. |
| 2 | `/servicios` | cirugía de columna cerca de mí | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/blog` | Blog | navegacion-de-seccion | Las dudas que no caben en una respuesta corta se desarrollan en el silo informativo. |
| 4 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |

### Sin cluster (declara que no compite)

#### `/agendar`

Agendar cita — Consultorios y horarios en Lima · 200 · acción: Dejar

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | Quien esta por agendar necesita ver las cuatro sedes con su direccion y su horario antes de elegir. |
| 2 | `/servicios` | cirujano de columna cerca de mí | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/` | mejor clínica de traumatología en lima | navegacion-de-seccion | Vuelve a la raiz: una pagina de conversion sin salida deja al paciente sin donde seguir si todavia esta decidiendo. |
| 4 | `/contacto` | Contacto y Citas en Lima | hacia-conversion | Las dos vias de conversion del sitio se enlazan entre si: quien no quiere escribir, agenda, y al reves. |

#### `/blog`

Blog — Salud de columna y traumatología · 200 · acción: Dejar

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/blog/artrosis` | que es bueno para la artrosis | hub-a-hijas | El indice del blog enlaza a /blog/artrosis, que es uno de los articulos que lista. Es la unica senal que el hub tiene para darle a su propio contenido. |
| 2 | `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | espina ciática | hub-a-hijas | El indice del blog enlaza a /blog/5-sintomas-de-columna-que-no-debes-ignorar, que es uno de los articulos que lista. Es la unica senal que el hub tiene para darle a su propio contenido. |
| 3 | `/blog/lumbalgia` | ejercicios para lumbalgia | hub-a-hijas | El indice del blog enlaza a /blog/lumbalgia, que es uno de los articulos que lista. Es la unica senal que el hub tiene para darle a su propio contenido. |
| 4 | `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | como dormir después de una cirugía de columna | hub-a-hijas | El indice del blog enlaza a /blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber, que es uno de los articulos que lista. Es la unica senal que el hub tiene para darle a su propio contenido. |
| 5 | `/servicios` | traumatólogo de columna | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |

#### `/contacto`

Contacto y Citas en Lima · 200 · acción: Dejar

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | Quien esta por agendar necesita ver las cuatro sedes con su direccion y su horario antes de elegir. |
| 2 | `/servicios` | traumatólogo de columna | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/` | traumatología especialista en columna | navegacion-de-seccion | Vuelve a la raiz: una pagina de conversion sin salida deja al paciente sin donde seguir si todavia esta decidiendo. |
| 4 | `/agendar` | Agendar cita | hacia-conversion | Las dos vias de conversion del sitio se enlazan entre si: quien no quiere escribir, agenda, y al reves. |

#### `/sedes`

Sedes donde atiende el Dr. Juan Carlos Angulo en Lima · 200 · acción: Dejar

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/sedes/clinica-ricardo-palma` | ortopedia infantil clínica ricardo palma | hub-a-hijas | El hub reparte hacia /sedes/clinica-ricardo-palma. Juan decidio el 2026-08-11 que este hub no pelee ninguna keyword justamente para que la senal se concentre en las cuatro sedes: el enlace es la forma de que llegue. |
| 2 | `/sedes/clinica-tezza` | cirujano de columna clínica tezza | hub-a-hijas | El hub reparte hacia /sedes/clinica-tezza. Juan decidio el 2026-08-11 que este hub no pelee ninguna keyword justamente para que la senal se concentre en las cuatro sedes: el enlace es la forma de que llegue. |
| 3 | `/sedes/consultorio-privado` | ortopedia surco | hub-a-hijas | El hub reparte hacia /sedes/consultorio-privado. Juan decidio el 2026-08-11 que este hub no pelee ninguna keyword justamente para que la senal se concentre en las cuatro sedes: el enlace es la forma de que llegue. |
| 4 | `/sedes/sanna-la-molina` | ortopedia infantil clínica sanna | hub-a-hijas | El hub reparte hacia /sedes/sanna-la-molina. Juan decidio el 2026-08-11 que este hub no pelee ninguna keyword justamente para que la senal se concentre en las cuatro sedes: el enlace es la forma de que llegue. |
| 5 | `/servicios` | cirujano de columna lima | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 6 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |

#### `/sobre-el-doctor`

Dr. Juan Carlos Angulo — Trayectoria y formación en Lima · 200 · acción: Dejar

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/` | traumatología especialista en columna | navegacion-de-seccion | Vuelve a la raiz, que es la pagina que la trayectoria y la prueba social existen para sostener. |
| 2 | `/servicios` | cirujano de columna lima | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | Del respaldo a lo concreto: donde atiende el doctor, con direccion y horario de cada sede. |
| 4 | `/testimonios` | Testimonios de pacientes | navegacion-de-seccion | Autoridad y prueba social se sostienen mutuamente: quien lee una de las dos esta evaluando lo mismo. |
| 5 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |

#### `/testimonios`

Testimonios de pacientes · 200 · acción: Dejar

| # | Destino | Anchor | Regla | Motivo |
|---|---|---|---|---|
| 1 | `/` | traumatólogo ortopedia infantil | navegacion-de-seccion | Vuelve a la raiz, que es la pagina que la trayectoria y la prueba social existen para sostener. |
| 2 | `/servicios` | mejor neurocirujano de columna lima | navegacion-de-seccion | Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo. |
| 3 | `/sedes` | Sedes donde atiende el Dr. Juan Carlos Angulo en Lima | navegacion-de-seccion | Del respaldo a lo concreto: donde atiende el doctor, con direccion y horario de cada sede. |
| 4 | `/sobre-el-doctor` | Dr. Juan Carlos Angulo | navegacion-de-seccion | Autoridad y prueba social se sostienen mutuamente: quien lee una de las dos esta evaluando lo mismo. |
| 5 | `/agendar` | Agendar cita | hacia-conversion | Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte. |

