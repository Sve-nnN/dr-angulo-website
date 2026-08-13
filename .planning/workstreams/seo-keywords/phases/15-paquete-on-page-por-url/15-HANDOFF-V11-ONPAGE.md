# Handoff a v1.1: el paquete on-page de las 24 URLs

<!-- Generado por seo-tools/src/phase15/paquete.ts --todos --handoff, desde data/onpage.json,
     data/url-map.jsonl y los cuatro datasets de copy. No se edita a mano: se regenera. -->

**De:** workstream `seo-keywords` (v1.2), fase 15, plan 15-07
**Para:** workstream `milestone` (v1.1), fases 8 y 10
**Continúa:** `phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-HANDOFF-V11.md`. La fase 14
dijo por qué keyword pelea cada URL; esta dice con qué texto la gana.

Este documento se lee solo. No hace falta abrir ningún otro archivo del workstream
`seo-keywords` para actuar sobre lo que dice acá.

---

## 1. Qué se entrega y dónde

**24 documentos, uno por URL**, en
`.planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/`.
El índice que los ordena es `15-PAQUETE.md`, en esa misma carpeta.

Para implementar una URL se abre su archivo y se sigue de corrido. Adentro está el title, la
meta, el H1, la jerarquía de encabezados con la procedencia de cada uno, las entidades que la
página tiene que nombrar, el copy redactado para pegar y los enlaces internos que le tocan. No
hay que leer los otros veintitrés.

Los documentos se **regeneran** desde los datasets del repositorio. Una corrección hecha a mano
sobre el Markdown se pierde en la siguiente corrida:

```bash
cd seo-tools
./node_modules/.bin/tsx src/phase15/paquete.ts --todos --indice --handoff
```

---

## 2. Para la fase 10: title y meta de las 22 URLs con metadata

Los límites son 60 y 155 caracteres, que es lo que esa fase ya verifica del otro lado. Las
22 entran dentro del contrato y ninguna queda pegada al borde: el title más largo mide 50 y la meta más larga mide 142.

| URL | Title | Car. | Meta description | Car. |
| --- | --- | --- | --- | --- |
| `/` | Traumatología en Lima: Dr. Juan Carlos Angulo | 45/60 | Traumatólogo y cirujano de columna en Lima. Atiende en su consultorio de Surco, Ricardo Palma, Sanna La Molina y Clínica Tezza. | 127/155 |
| `/agendar` | Agendar una cita con el Dr. Angulo | 34/60 | Cómo pedir cita en cada sede: WhatsApp para el consultorio de Surco y la central de citas de Ricardo Palma, Sanna y Tezza. | 122/155 |
| `/blog` | Blog del Dr. Juan Carlos Angulo | 31/60 | Artículos sobre dolor de espalda, salud de la columna y qué esperar de una consulta, escritos por el Dr. Juan Carlos Angulo. | 124/155 |
| `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | Ciática: por qué duele la pierna y qué hacer | 44/60 | Qué es la ciática, cómo se distingue de una lumbalgia, qué la produce y cuándo el dolor de pierna necesita evaluación médica. | 125/155 |
| `/blog/artrosis` | Artrosis: qué es, cómo se trata y cuándo consultar | 50/60 | Qué es la artrosis, en qué articulaciones aparece, qué frena su avance y cuándo conviene consultar con un traumatólogo en Lima. | 127/155 |
| `/blog/lumbalgia` | Lumbalgia: por qué duele la zona lumbar | 39/60 | Qué causa la lumbalgia, qué tipos hay, qué ejercicios ayudan y cuándo el dolor de la zona baja de la espalda necesita evaluación. | 129/155 |
| `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | Cirugía de columna: cuándo se plantea y cómo es | 47/60 | Cuándo se plantea operar la columna, qué técnicas existen, cómo es la recuperación y qué conviene preguntar en la consulta. | 123/155 |
| `/contacto` | Contacto con el consultorio del Dr. Angulo | 42/60 | Cuéntale tu caso al doctor por el formulario o escribe por WhatsApp. Datos de contacto del consultorio en Lima. | 111/155 |
| `/preguntas-frecuentes` | Reumatólogo o traumatólogo: a cuál te toca ir | 45/60 | Cuándo corresponde un reumatólogo y cuándo un traumatólogo, qué pasa en la primera cita y en qué casos se plantea operar. | 121/155 |
| `/sedes` | Dónde atiende el Dr. Juan Carlos Angulo en Lima | 47/60 | Las cuatro sedes donde atiende el Dr. Juan Carlos Angulo: consultorio de Surco, Ricardo Palma, Sanna La Molina y Padre Luis Tezza. | 130/155 |
| `/sedes/clinica-ricardo-palma` | Cirujano de columna en Clínica Ricardo Palma | 44/60 | El Dr. Juan Carlos Angulo atiende columna en la Clínica Ricardo Palma, San Isidro. Días de consulta y cómo pedir cita. | 118/155 |
| `/sedes/clinica-tezza` | Ortopedia infantil en la Clínica Tezza, Lima | 44/60 | Consulta de ortopedia infantil con el Dr. Juan Carlos Angulo en la Clínica Padre Luis Tezza, Surco. Horarios y cómo agendar. | 124/155 |
| `/sedes/consultorio-privado` | Cirugía de columna en Surco: consultorio privado | 48/60 | Consultorio privado del Dr. Juan Carlos Angulo en Surco para consultas de columna. Dónde queda y cómo pedir cita por WhatsApp. | 126/155 |
| `/sedes/sanna-la-molina` | Cirujano de columna en Clínica Sanna La Molina | 46/60 | El Dr. Juan Carlos Angulo atiende columna en la Clínica Sanna de La Molina. Días de consulta y cómo llegar a la sede. | 117/155 |
| `/servicios` | Cirujano de columna en Lima: qué trata el doctor | 48/60 | Hernia discal, estenosis, escoliosis y ortopedia infantil. Qué atiende el Dr. Juan Carlos Angulo y en qué sede de Lima. | 119/155 |
| `/servicios/cirugia-minimamente-invasiva` | Cirugía mínimamente invasiva de columna en Lima | 47/60 | Qué es la cirugía mínimamente invasiva de columna, en qué casos se indica y cómo es la recuperación. Consulta en Lima. | 118/155 |
| `/servicios/escoliosis-y-deformidades` | Escoliosis: cómo se evalúa y cómo se trata | 42/60 | Qué es la escoliosis, cómo se mide la curva, qué opciones hay según la edad y en qué casos se plantea la cirugía. Consulta en Lima. | 131/155 |
| `/servicios/estenosis-espinal` | Estenosis espinal: síntomas y tratamiento | 41/60 | Qué es la estenosis espinal, por qué aparece con los años, qué alivia el dolor al caminar y en qué casos se opera. Consulta en Lima. | 132/155 |
| `/servicios/hernia-discal` | Hernia discal: síntomas, diagnóstico y tratamiento | 50/60 | Qué es una hernia discal, qué síntomas produce, cómo se confirma con resonancia y en qué casos se plantea la cirugía. Guía de columna en Lima. | 142/155 |
| `/servicios/ortopedia-infantil` | Ortopedia infantil en Lima: cuándo consultar | 44/60 | Pie plano, displasia de cadera, desviaciones de la columna del niño y fracturas. Consulta de ortopedia infantil en Lima. | 120/155 |
| `/sobre-el-doctor` | Sobre el Dr. Juan Carlos Angulo Totesaut | 40/60 | Formación, forma de trabajo y sedes donde atiende el Dr. Juan Carlos Angulo Totesaut, médico de columna en Lima. | 112/155 |
| `/testimonios` | Testimonios de pacientes del Dr. Angulo | 39/60 | Lo que cuentan, en sus propias palabras, los pacientes que se atendieron con el Dr. Juan Carlos Angulo en Lima. | 111/155 |

Las 2 URLs que faltan en esta tabla son las que se apagan con un 301: no reciben
title, meta ni H1 propios porque dejan de existir.

---

## 3. Para la fase 8: qué recibe cada página

**16 reciben copy completo.** Página redactada de punta a punta, lista para
pegar, con su jerarquía de encabezados y sus entidades obligatorias.

| URL | Keyword primaria | Formato | Acción |
| --- | --- | --- | --- |
| `/` | `traumatología lima` | pagina-de-servicio | reescribir |
| `/blog/5-sintomas-de-columna-que-no-debes-ignorar` | `ciática` | guia-clinica | reescribir |
| `/blog/artrosis` | `artrosis` | guia-clinica | crear |
| `/blog/lumbalgia` | `lumbalgia` | guia-clinica | crear |
| `/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber` | `cirugía de columna` | guia-clinica | reescribir |
| `/preguntas-frecuentes` | `reumatólogo o traumatólogo` | guia-clinica | reescribir |
| `/sedes/clinica-ricardo-palma` | `cirujano de columna clínica ricardo palma` | ficha-de-sede | reescribir |
| `/sedes/clinica-tezza` | `ortopedia infantil clínica tezza` | ficha-de-sede | reescribir |
| `/sedes/consultorio-privado` | `cirugía de columna surco` | ficha-de-sede | reescribir |
| `/sedes/sanna-la-molina` | `cirujano de columna clínica sanna` | ficha-de-sede | reescribir |
| `/servicios` | `cirujano de columna lima` | pagina-de-servicio | reescribir |
| `/servicios/cirugia-minimamente-invasiva` | `cirugía mínimamente invasiva en lima` | pagina-de-servicio | crear |
| `/servicios/escoliosis-y-deformidades` | `escoliosis` | guia-clinica | reescribir |
| `/servicios/estenosis-espinal` | `estenosis espinal` | guia-clinica | reescribir |
| `/servicios/hernia-discal` | `hernia discal` | guia-clinica | reescribir |
| `/servicios/ortopedia-infantil` | `ortopedia infantil lima` | pagina-de-servicio | reescribir |

**6 reciben solo title y meta.** Declararon no competir por ninguna
keyword y eso fue una decisión medida en la fase 14, no un hueco. No se les propone cuerpo de
texto: inventarles uno les inventaría una intención que el mapa decidió que no tienen. Se
enlazan con anchor de navegación y nunca de keyword; el anchor exacto está en el documento de
cada una.

| URL | H1 publicado | Qué hacer |
| --- | --- | --- |
| `/agendar` | Agendar cita | Cambiar title y meta. El H1 no se toca. |
| `/blog` | Artículos sobre columna y traumatología | Cambiar title y meta. El H1 no se toca. |
| `/contacto` | Contacto | Cambiar title y meta. El H1 no se toca. |
| `/sedes` | Sedes donde atiende el Dr. Angulo en Lima | Cambiar title y meta. El H1 no se toca. |
| `/sobre-el-doctor` | Dr. Juan Carlos Angulo Totesaut | Cambiar title y meta. El H1 no se toca. |
| `/testimonios` | Lo que dicen sus pacientes | Cambiar title y meta. El H1 no se toca. |

**3 URLs por crear.** No existen todavía: la ruta, el layout y el sitemap son
trabajo de v1.1; el copy está entregado.

| URL por crear | Keyword primaria | Formato |
| --- | --- | --- |
| `/blog/artrosis` | `artrosis` | guia-clinica |
| `/blog/lumbalgia` | `lumbalgia` | guia-clinica |
| `/servicios/cirugia-minimamente-invasiva` | `cirugía mínimamente invasiva en lima` | pagina-de-servicio |

**3 redirecciones 301.** Dos salen de este paquete y la tercera venía avisada de la fase 14.

| Desde | Hacia | Por qué |
| --- | --- | --- |
| `/servicios/escoliosis` | `/servicios/escoliosis-y-deformidades` | Renombre de slug decidido en la fase 14. Arrastra el 301, el sitemap y los enlaces internos ya escritos que apunten al slug viejo. |
| `/blog/estenosis-espinal-que-es` | `/servicios/estenosis-espinal` | El post se funde con la guía de destino: su contenido ya vive adentro, bloque por bloque, y la lista está en el documento del post. |
| `/blog/hernia-discal-o-dolor-de-espalda-como-diferenciarlos` | `/servicios/hernia-discal` | El post se funde con la guía de destino: su contenido ya vive adentro, bloque por bloque, y la lista está en el documento del post. |

---

## 4. El orden que no se puede invertir

Las dos guías de destino **absorben** el contenido de los posts que se apagan. Por eso:

1. Primero se publica la guía de destino con el contenido ya fundido.
2. Recién entonces se pone el 301 y se saca el post del sitemap.

Al revés, el 301 entierra material que todavía no vive en ningún otro lado. El documento de
cada post que se apaga trae la tabla de qué bloque suyo quedó en qué sección de la guía, así
que se puede comprobar que no se perdió nada antes de redirigir.

---

## 5. La restricción que sigue viva, y es bloqueante

**Ninguna línea de texto clínico se publica sin la aprobación del doctor por escrito.** Cada
bloque médico sale de esta fase sellado como pendiente, y ese sello no lo levanta este
workstream.

La ronda completa está armada en `15-REVISION-DOCTOR.md`, ordenada por riesgo clínico y no por
URL, con una casilla por bloque. **Es bloqueante para la fase 8:** si v1.1 encuentra un bloque
sin sello levantado, el paquete no está listo para esa URL.

Vale también la regla de la que salen todos los textos: nada de credenciales, número de
cirugías, tasas de éxito ni resultados. Solo lo verificable. Si al implementar aparece la
tentación de una frase con más fuerza comercial, va la verificable.

---

## 6. Lo que este handoff NO resuelve

**10 datos operativos de sede siguen sin confirmar.** No se compusieron a
propósito: una dirección, un piso o un horario inventado manda a un paciente a un lugar
equivocado. Van listados en la página de su sede, en tabla aparte, y también al final de la
ronda del doctor. v1.1 no publica esa sede hasta resolverlos, sea confirmándolos o sacando la
afirmación.

| Sede | Dato pendiente |
| --- | --- |
| `/sedes/clinica-ricardo-palma` | Piso y número de consultorio dentro de la clínica |
| `/sedes/clinica-ricardo-palma` | Seguros y convenios que la sede acepta para esta consulta |
| `/sedes/clinica-tezza` | Planes de salud, seguros y convenios vigentes de la clínica |
| `/sedes/clinica-tezza` | Piso y número de consultorio dentro de la clínica |
| `/sedes/sanna-la-molina` | Piso y número de consultorio dentro del centro clínico |
| `/sedes/sanna-la-molina` | Seguros y convenios que la sede acepta para esta consulta |
| `/sedes/sanna-la-molina` | Precio de la consulta |
| `/sedes/consultorio-privado` | Estacionamiento del edificio y sus tarifas |
| `/sedes/consultorio-privado` | Seguros y convenios que el consultorio acepta |
| `/sedes/consultorio-privado` | Precio de la consulta |

**Los enlaces internos se proponen, no se implementan.** La matriz salió de la fase 14 y cada
documento trae los enlaces que le tocan, con su anchor y la regla que lo justifica. Escribirlos
en el código del sitio es trabajo de v1.1: este workstream no toca `src/`.

**El Sheet del cliente es la fuente viva.** El tab `Keyword Research` tiene las columnas
`Suggested H1` y `URL` llenas para las 16 keywords primarias. Si este documento y el Sheet
difieren, gana el Sheet.
