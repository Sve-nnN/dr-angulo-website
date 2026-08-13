---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: "SEO semantico: keyword research y optimizacion on-page"
current_phase: 15
current_phase_name: Paquete on-page por URL
status: executing
stopped_at: Completed 15-06-PLAN.md — los cuatro posts del blog
last_updated: "2026-08-13T03:05:00.000Z"
last_activity: 2026-08-13
last_activity_desc: "2026-08-13, cerrado el plan 15-06 y con el la wave 3 entera, sin gastar cuota: los cuatro posts del blog quedaron redactados de punta a punta, 6595 palabras nuevas, dos creados desde keywords de oro que ninguna URL viva podia ganar y dos reescritos sobre contenido publicado que se conserva y se declara. Lo que define este plan no es el texto sino el limite: un post de captacion que explica el tratamiento se convierte en la segunda guia de su tema y devuelve la canibalizacion por la puerta del contenido aunque el mapa siga limpio, asi que los cuatro nombran la relacion con su guia y derivan hacia ella con el anchor de la matriz de la fase 14. El post de cirugia contesta precio, costo, riesgo y plazo de recuperacion sin una sola cifra. Con esto ONPAGE-04 queda cerrado: las dieciseis paginas con keyword primaria estan escritas y las dieciseis pasan la compuerta. Van dieciocho documentos de veinticuatro"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 21
  completed_plans: 20
  percent: 95
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-10)

**Core value:** Que un paciente que busca traumatólogo/cirujano de columna en Lima encuentre el sitio y agende cita por WhatsApp en menos de 2 clics, con todo evento rastreado.
**Current focus:** Fase 15, la última de v1.2, en ejecución. El plan 15-01 fundó la tubería y el molde y el 15-02 cerró la metadata y armó las compuertas, así que lo único que le queda a la fase es escribir texto. Lo que gobierna ese texto sigue viniendo de la 13 y la 14: **los cinco competidores rankean sin enlaces en sus páginas interiores**, así que el contenido es la palanca; y **tres de las cuatro páginas de servicio que v1.1 ya publicó enfrentan una SERP de contenido informativo, no de página de servicio** —`estenosis espinal` es 8 de 8—, así que se reescriben como guía clínica en vez de retocarles las metas. La novedad del 15-02 es que ahora hay un juez: `ymyl.ts` corre sobre el copy y devuelve dónde falla, así que las cuatro familias de la wave 3 no pueden inventar cada una su propio criterio de qué cuenta como texto humanizado.

## Current Position

Phase: 15 (Paquete on-page por URL) — EJECUTANDO, la última de las 4 fases de v1.2
Plan: 7 de 7. Cerraron el 15-01, el 15-02 y la wave 3 entera (15-03, 15-04, 15-05 y 15-06). Queda solo el 15-07, que cierra la fase y el milestone
Status: **Planes 15-01 a 15-06 completos.** ONPAGE-01, ONPAGE-02, ONPAGE-03, ONPAGE-04 y ONPAGE-05 cerrados. Queda abierto solo ONPAGE-06, que pide el paquete por URL y hay dieciocho de veinticuatro: faltan los seis documentos cortos de las URLs que declararon no competir, que emite el 15-07. Siguen quedando **96 de 102 búsquedas de SerpApi** hasta el reset del 2026-08-21, porque la fase no ha gastado ninguna
Last activity: 2026-08-13 — cerrado el plan 15-06 con cero cuota gastada. Los cuatro posts del blog pasan la compuerta sin hallazgos y ninguno se lleva por título la primaria de otra URL. El de ciática quedó en 13 de 16 entidades, 81,3 %, y las tres que faltan son trigramas que solo se cubrirían escribiendo mal el castellano

Progress: [█████████▌] 95% de v1.2 · 3 de 4 fases cerradas

## Roadmap v1.2

| Fase | Entrega | Requisitos |
|------|---------|------------|
| 12 | Tooling de datos con caché, escritura automática en el Sheet y universo de 400+ keywords con métricas e intención | INFRA-01 a INFRA-03, KWR-01 a KWR-03, SHEET-06 |
| 13 | Clusters por solape de SERP, cinco competidores perfilados, punto dulce y 10 de Oro | KWR-04 a KWR-06, COMP-01 a COMP-04, SHEET-01, SHEET-03 |
| 14 | Mapa keyword → URL de las 18 URLs, canibalización resuelta y matriz de enlazado | MAP-01 a MAP-05, SHEET-02, SHEET-04, SHEET-05 |
| 15 | Title, meta, H1, jerarquía, entidades TF-IDF y copy clínico por URL, listos para v1.1 | ONPAGE-01 a ONPAGE-06 |

## Coordinación con el workstream `milestone` (v1.1)

Los dos milestones corren a la vez sobre el mismo repositorio.

- **v1.2 manda en keywords y textos; v1.1 manda en código.** Ninguna fase de v1.2 escribe en `src/`.
- **Handoff bloqueante — MAP-03 (fase 14): RESUELTO el 2026-08-11.** Las nueve URLs (cuatro de servicio, cuatro de sede y el hub `/servicios`) tienen keyword asignada y publicada. El aviso autocontenido para la fase 8 de v1.1 es `.planning/workstreams/seo-keywords/phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-HANDOFF-V11.md`, e incluye el renombre de `/servicios/escoliosis` a `/servicios/escoliosis-y-deformidades`, que arrastra 301, sitemap y enlaces internos.
- **Handoff de enlazado — MAP-05 (fase 14): ENTREGADO el 2026-08-12.** Los 135 enlaces internos entre 22 URLs son **especificación, no implementación**: v1.1 los escribe en el código. La matriz legible está en `phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-ENLAZADO.md` y el dataset en `seo-tools/data/internal-links.json`. Dos posts del blog se funden con su guía y redirigen, así que arrastran dos 301 nuevas además de la de escoliosis.
- **Handoff de contenido — ONPAGE-06 (fase 15):** el paquete por URL es lo que implementan las fases 8 y 10 de v1.1. Es lo único que le queda pendiente a v1.2.
- Nunca escribir en `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md` ni bajo `.planning/workstreams/milestone/`.

## Accumulated Context

### Decisions

- **La intención de una URL se mide en la SERP, no se deduce de la carpeta (2026-08-11, plan 14-02):** el reparto entero del top 10 decide informacional, comercial o transaccional. `estenosis espinal` vive en `/servicios/`, suena a operación y tiene 8 de 8 resultados informativos. Cuando la SERP no resuelve, la fila declara que la intención es inferida y no medida.
- **Las tres decisiones de Juan del 2026-08-11** quedan en `data/decisiones-checkpoint-14-2026-08-11.md`: las páginas de servicio se reescriben como guía clínica en la fase 15, `/servicios/escoliosis` se renombra a `/servicios/escoliosis-y-deformidades`, y `/sedes` queda como hub sin keyword primaria a propósito.

- **Reparto v1.1 / v1.2 (2026-08-10):** v1.2 entrega el mapa de keywords y el copy optimizado; las fases 8, 9 y 10 de v1.1 los implementan. Evita conflictos de merge entre dos milestones paralelos.
- **Fuentes de datos (2026-08-10):** DinoRank como primaria (volumen, CPC, competencia, TF-IDF, canibalizaciones, auditoría on-page), Ahrefs para KD, traffic potential y referring domains needed, SerpApi para validar la SERP real geolocalizada en Lima.
- **Numeración de fases desde 12:** v1.1 ocupa de la 7 a la 11 y ambos roadmaps se leen en paralelo. Ningún número se repite entre workstreams.
- **Reparto de los requisitos SHEET:** cada tab se llena en cuanto sus datos existen, no todos al final. SHEET-06 (idempotencia) va con el escritor en la fase 12 porque es propiedad del cargador, no de un tab.
- **Punto dulce sobre volumen:** las keywords se eligen por KD alcanzable con el perfil de enlaces real del dominio, que es de agosto de 2026 y casi sin historial.
- **[Fase 12] J-5 (2026-08-10):** la etapa del paciente va como columna `Patient Stage` al Sheet. Juan vetó dejarla solo en el dataset. No reabre J-3: la procedencia por métrica sigue fuera del documento.
- **[Fase 12] J-6 (2026-08-10):** los residuos de plantilla se borran completos, las 51 filas de `Keyword Research` con casillas incluidas y las 6 de `Content Model`. **Ejecutado en el plan 12-04**: 51 y 6 filas eliminadas y las cuatro columnas muertas de J-4 también.
- **[Fase 12, plan 04] Tercer eje de alcance:** la clasificación agrega un eje ortogonal a intención y etapa que separa la deriva del universo real (veterinaria, académica, retail, CIE-10, geografía ajena, sector público, marca ajena, otra especialidad). 950 de 5716 keywords, el 16,6 %, no son demanda de este consultorio. Vive en el dataset y NO agrega columna al Sheet: no roza J-3.
- **[Fase 12, plan 04] La etapa por defecto es `diagnostico`:** una keyword pelada como `hernia discal` es alguien que ya tiene el nombre de lo que le pasa.
- **[Fase 12, plan 04] Las anulaciones registran solo lo que difiere de las reglas:** 38 sobre un residuo de 747. Una anulación redundante congela un no-cambio y le prohíbe a la fase 13 mejorar la regla que la produjo.
- **[Fase 12, plan 05] `/keyword-research` descubre, no consulta:** medido sobre 70 respuestas, la keyword consultada **nunca** aparece en su propio `keywords[]`, y su bloque `datos` trae el valor real sólo en 10 de 70 y a veces con la clave de **otra** keyword. La única forma barata de que una keyword tenga métricas es aparecer como relacionada de otra, así que el enriquecimiento barre la caché antes de gastar.
- **[Fase 12, plan 05] No se gasta cuota en keywords de cuatro o más palabras:** dos muestras acotadas midieron rendimiento cero y el plan 12-03 ya lo había visto en 15 de sus 40 semillas. La regla vive en el código como bandera `--max-words`, no como criterio de una corrida. Se ahorraron 499 llamadas.
- **[Fase 12, plan 05] Las fixtures de `/auditoria` y `/canibalizaciones` se commitean seudonimizadas:** esos dos endpoints sólo resuelven contra un proyecto dado de alta y el único de la cuenta de DinoRank es de otro cliente. Se conserva la forma y nada del contenido, con reemplazo estable para que la relación de duplicidad sobreviva.

- **[Fase 13, plan 01] `Top Result` se reasigna de la fase 15 a la 13:** es el resultado que Google pone primero, o sea dato de SERP, y la SERP la captura esta fase. Volver a leer la misma captura dos fases después costaría búsquedas de una cuota que no se repone. `URL` sigue en la 14 y `Suggested H1` en la 15.
- **[Fase 13, plan 01] Siete tipos de página y no cuatro:** a los cuatro del ROADMAP (guía, página de servicio, ficha de clínica, directorio) la medición sobre los 95 orgánicos obligó a sumar contenido internacional, red social y otro. Forzar un resultado dentro de una caja que no le corresponde mentiría sobre la SERP.
- **[Fase 13, plan 01] El tab `Competitor Analysis` se declara fila por fila, nunca por columna entera:** la columna B es el primer slot de competidor **y además** carga los títulos de sección en las filas 1, 4, 11, 17, 23, 25 y 31. Volcar una columna entera los borraría sin lanzar ninguna excepción.
- **[Fase 13, plan 01] Los ejecutables de la fase son puntos de entrada propios bajo `src/phase13/`:** `src/cli.ts` llama a `main()` al cargarse, así que importarlo desde otro punto de entrada ejecuta el despachador con los argumentos equivocados. Por eso existe `src/phase13/args.ts`, que es copia funcional y no importación.
- [Phase ?]: El techo acumulado de cuota vive en capture.ts y no en quota.ts: quota.ts esta cerrado desde la fase 12 y el techo es una regla de esta fase
- [Phase ?]: Umbral de similitud de la cola en 0,5 mas termino clinico compartido obligatorio; el geo se quita antes de medir porque es terreno y no tema
- [Phase ?]: Las 10 de Oro se eligen con tres puertas de evidencia (alcance, servicio propio, piso de disputables) y despues valor de negocio; la alcanzabilidad solo desempata
- [Phase ?]: Una keyword de oro tiene que nombrar un servicio que el sitio declara: lo sembrado desde COMPETITORS.md describe lo que hace un competidor
- [Phase ?]: Cifosis entra al universo de candidatas por confirmacion explicita de Juan del 2026-08-11, y aun asi el criterio la dejo en el puesto 11 con 37 puntos contra 38
- [Fase 14, plan 01]: El inventario mide 22 URLs y 21 mapeables, no las 19 y 18 del roadmap. La diferencia se registra nominalmente en vez de ajustarse a la expectativa.
- [Fase 14, plan 01]: El slug publicado es /servicios/escoliosis. El mapa se emite contra la URL que existe; renombrarla a /servicios/escoliosis-y-deformidades arrastra redirecciones y es decision de Juan en el checkpoint de 14-02.
- [Fase 14, plan 01]: La pertenencia a un cluster no es parametro de veredictoDeFusion: solo decide el solape par a par del top 10 contra un umbral de 3.
- **[Fase 14, plan 04] Un tab con encabezados repetidos se resuelve por posicion, y el cargador se niega a escribirlo si el modelo no lo declara.** `Title with Link` aparece ocho veces en `Internal Linking Audit`. El peligro no es que falle: es que **no** falla. Por nombre, los ocho bloques caen en la misma columna, el resumen igual reporta 22 filas actualizadas y la matriz queda destruida en silencio. La evidencia tiene que salir de leer el documento vivo y comparar el bloque 1 contra el 8 (`il-verify.ts`), porque ningun contador distingue un mapeo bueno de uno roto.
- **[Fase 14, plan 04] El mismo riesgo entraba por `upsertRows`:** recorria `schema.byHeader.values()`, un indice por encabezado recortado que colapsaba los ocho `Title with Link` en una entrada y dejaba siete columnas sin escribir. `TabSchema.columns` es ahora la fuente de verdad de "que columnas hay"; `byHeader` queda solo para buscar una columna concreta por nombre.
- **[Fase 14, plan 04] El canonical de una URL que va a redirigir es el suyo propio, no el destino del 301.** Son dos implementaciones distintas: apuntar al destino le pediria a v1.1 una etiqueta en el `<head>` de una pagina que en la misma fase se apaga. El destino de la fusion viaja en `redirigeA` y en la columna `Action`, que es donde se lee como orden.
- **[Fase 14, plan 04] Las columnas que responde el cliente se siembran una sola vez.** `Approved?`, `Implemented?` y `Done` reciben su valor inicial en la primera carga y despues no se pisan. Un cargador que las reescribiera borraria la respuesta de Juan en cada corrida.
- **[Fase 14, plan 04] Un criterio de aceptacion no justifica romper una decision anterior:** el criterio pedia keyword en las 24 filas y ocho no la tienen a proposito. Se estrecho el criterio a las 16 que compiten en vez de inventarles keyword a `/agendar`, `/contacto` o `/sedes`.
- **[Fase 15, plan 01] Las preguntas de la SERP van como H3 debajo de la seccion que las responde, no como H2.** Al nivel de las secciones el indice de una guia clinica queda como una columna de interrogantes y se pierde el recorrido del paciente, que es lo que el checkpoint venia a juzgar. El plan pedia nivel 2 y Juan aprobo el nivel 3 sobre el documento real el 2026-08-12.
- **[Fase 15, plan 01] Las entidades obligatorias salen de la frecuencia documental sobre titulos y fragmentos del top 10, no de un TF-IDF.** La captura NO trae el cuerpo de las paginas que rankean, asi que llamarlo TF-IDF venderia una medicion que no se hizo. Cada termino viaja con numerador, denominador y las posiciones concretas donde aparecio, y el umbral aplicado se registra en la fila aunque no se haya bajado.
- **[Fase 15, plan 01] El formato de pagina lo decide la SERP salvo el prefijo `/sedes/`.** El top 10 de "cirujano de columna clinica ricardo palma" no distingue una ficha de sede de una pagina de servicio porque los dos moldes rankean igual ahi. Donde la SERP si resuelve, manda ella.
- **[Fase 15, plan 01] El copy de referencia quedo en 2483 palabras contra un minimo de 1400**, y Juan lo confirmo como la extension objetivo de las guias restantes el 2026-08-12. El minimo por URL de `onpage-serp.json` no baja.
- **[Fase 15, plan 01] Un plan cierra solo los requisitos que cumplio entero.** El plan declaraba ONPAGE-02, ONPAGE-03 y ONPAGE-06 y se marco ONPAGE-03: los otros dos piden algo por cada una de las 16 URLs y hay una. Marcarlos dejaria en verde la matriz de trazabilidad que el plan 15-07 tiene que auditar.
- **[Fase 15, plan 02] La auditoria de ONPAGE-05 es local y el motivo va con el dato crudo.** `/auditoria` de DinoRank no responde HTTP 500: responde HTTP 200 con `site.domain: soumahotel.com`, el proyecto de otro cliente dado de alta en esa cuenta. Un fallo silencioso que entrega datos ajenos es peor que uno ruidoso. Y hay un motivo anterior a ese: `/auditoria` audita un sitio publicado, y esta fase audita un paquete que todavia no se publico, que es cuando la auditoria sirve. Queda escrito en `15-AUDITORIA.md` para que nadie lo reintente creyendo que fue una caida pasajera.
- **[Fase 15, plan 02] Las reglas de humanizacion se acotan a la region entre las dos marcas de copy.** `url-map.jsonl` trae doce rayas largas en campos de justificacion escritos en la fase 14, y esa prosa entra al paquete como procedencia. Una regla global fallaria por texto que este workstream no escribio, y la presion seria aflojar la regla en vez de acotarla. Hay una prueba con prosa heredada fuera de la region que TIENE que pasar.
- **[Fase 15, plan 02] Una compuerta devuelve evidencia, no un booleano.** `ymyl.ts` entrega cada hallazgo con URL, seccion, regla y el texto exacto que fallo. Una que dijera solo si o no obliga a releer dos mil palabras buscando el problema, y a la tercera vez que pasa eso alguien la desactiva.
- **[Fase 15, plan 02] La prohibicion de cifras sobre el propio doctor no la levanta una fuente.** Cuantas cirugias hizo, cuantos anos lleva ejerciendo y que tasa de exito tiene son cifras que nadie verifico, asi que declarar procedencia no alcanza: la levanta el doctor por escrito (D-10). Cada patron exige la cantidad Y el sustantivo, para que "un paciente con hernia discal" siga siendo copy clinico normal y no una credencial.
- **[Fase 15, plan 02] Cada cadena tiene una compuerta y solo una.** El title y la meta viven en su tabla, fuera de la region de copy, en los cuatro tipos de documento: los mide `auditoria.ts`, que sabe de largos y duplicados. La region de copy es lo que el generador escribe como prosa y lo mide `ymyl.ts`. Meter la misma cadena en dos compuertas suena mas seguro y es al reves: cuando una falla, nadie sabe cual manda.
- **[Fase 15, plan 03] Primero se funde y después se redirige, y el documento del 301 lo dice.** El paquete de una URL que se apaga trae la tabla de qué bloque del post quedó en qué sección de la guía, más la frase de que la guía se publica antes que la redirección. Sin esa tabla, quien pone el 301 no tiene cómo comprobar que el contenido sobrevivió, y un 301 sobre contenido no fundido entierra el material sin dejar rastro de lo que había.
- **[Fase 15, plan 03] Preguntas frecuentes responde lo transversal y remite, no desarrolla.** Cuánto dura una consulta, qué llevar, a quién consultar y cómo se decide operar. Si desarrollara temario clínico competiría contra las cuatro guías, que es exactamente la canibalización que la fase 14 se pasó tres planes cerrando.
- **[Fase 15, plan 04] Cuando dos URLs comparten una secundaria, ninguna la publica como título.** `traumatología especialista en columna` es secundaria de la home y del hub a la vez, así que la que la usara literal como encabezado se llevaba por título la keyword de la otra y devolvía la canibalización que la fase 14 había cerrado midiendo. Las dos la cubren con un título propio y la keyword sigue declarada en `keywordsCubiertas`.
- **[Fase 15, plan 04] Un encabezado crudo de la SERP no siempre se puede publicar.** Tres búsquedas relacionadas del hub son nombres de colegas y varias más son otras clínicas y otras ciudades. La sección responde la intención de esa búsqueda con un título publicable y el crudo queda en la tabla de procedencia del paquete. Poner el nombre de un colega como H3 de la página comercial de otro es una decisión de marketing que ningún plan tomó.
- **[Fase 15, plan 04] El dataset del copy se pasa por bandera.** `paquete.ts` tenía `copy-guias.json` cableado y las familias de la wave 3 escriben en archivos separados justamente para no pisarse. Ahora recibe `--data` y la cabecera del documento nombra el dataset real del que salió, para que quien quiera corregir una frase abra el archivo correcto.
- **[Fase 15, plan 05] Un dato operativo lleva estado además de fuente.** La fuente dice de dónde salió; el estado dice si se puede publicar. Los 33 de las cuatro sedes declaran los dos, y el paquete imprime los 23 respaldados y los 10 pendientes en tablas separadas, con el encabezado `Pendientes de confirmación antes de publicar`. Mezclados, v1.1 publicaría un horario que nadie confirmó sin notarlo. En una ficha de sede una dirección inventada hace más daño que una afirmación médica inflada, porque manda a alguien a un edificio equivocado.
- **[Fase 15, plan 05] Cuando la SERP no resuelve el formato, la decisión se declara con el reparto al lado.** El top 10 de `cirugía de columna surco` no tiene tipo dominante: 3 y 3 entre red social y otro, sobre 6 tipificadas de 9 medidas, confianza media. El paquete del consultorio dice que el formato de ficha se eligió por coherencia con las otras tres sedes y no porque la SERP lo pidiera. Elegir en silencio deja a quien lo lea seis meses después sin forma de saber qué parte fue medición.
- **[Fase 15, plan 05] Una entidad obligatoria que solo se cubre nombrando a un tercero no se cubre.** `rodriguez` salió del staff de otra sede de Sanna y es el apellido de un pediatra. La URL quedó en 7 de 8, sobre el umbral del 80 %. El margen del umbral existe para exactamente este caso, y es el mismo criterio que el plan 15-04 aplicó con los encabezados que nombran colegas.
- **[Fase 15, plan 06] El límite entre captación y guía se sostiene en el contenido, no en el mapa.** La fase 14 midió 120 pares cruzados con cero conflictos, y ese resultado se apoya en el reparto de temas. Un post que explica el tratamiento de su condición se convierte en la segunda guía del tema y devuelve la canibalización por la puerta del contenido aunque el mapa siga limpio. Los cuatro posts nombran la relación con su guía, derivan hacia ella con el anchor de la matriz y declaran ese límite por escrito en su `notaDeFormato`.
- **[Fase 15, plan 06] Una reescritura declara qué conservó, y lo conservado se transcribe casi literal.** Los dos posts publicados salieron en junio, antes de que existiera el mapa, y esa es la razón por la que se reescriben, no que estén mal hechos. Ocho pasajes entraron casi textuales al copy nuevo, cada uno con la línea de `src/content/blog.ts` de la que salió. El campo `cambios` dice qué se conservó, qué se reemplazó y por qué, para que quien implemente pueda comparar contra lo publicado sin adivinar.
- **[Fase 15, plan 06] Las cuatro preguntas de dinero y de plazo se contestan sin dar una sola cifra.** Precio, costo, riesgo y tiempo de recuperación son donde más tienta tranquilizar con números, y ninguno está verificado (D-10). Se contesta explicando de qué depende cada cosa y qué pedir por escrito en la consulta. Se tranquiliza explicando el proceso, no prometiendo el resultado.
- **[Fase 15, plan 06] Un trigrama del extractor de entidades no se cubre escribiendo mal el castellano.** El post de ciática quedó en 13 de 16, sobre el umbral del 80 %. Las tres que faltan son trigramas que el extractor sacó de fragmentos donde una oración termina y otra empieza, y cubrirlas exigiría una aposición sin coma. Mismo criterio que `rodriguez` en el 15-05 y los encabezados que nombran colegas en el 15-04.
- **[Fase 15, plan 02] El H1 de las 6 que no compiten se transcribe con archivo y linea, nunca se propone.** Proponerles uno reabriria una decision de la fase 14 sin dato nuevo, y encima por la puerta de atras. Las 16 que compiten reciben H1 propuesto con la prosa de por que ese y no otro.

### Pending Todos

- **Dar de alta `drangulocolumna.com` como proyecto en DinoRank y conectarle Search Console (bloqueante para la fase 14).** `/auditoria` responde HTTP 500 con un dominio que no es proyecto de la cuenta, y `/canibalizaciones` devuelve `has_data: false` sin Search Console conectado. MAP-02 y ONPAGE-05 dependen de esto y no lo puede resolver el tooling. Ninguno de los dos endpoints consume cuota, así que resondear después es gratis.
- **Dos competidores por definir:** de los cinco de COMP-01 hay tres ya investigados en `.planning/research/COMPETITORS.md` (drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com). Candidatos del local pack según la auditoría del 2026-08-10: Centro de Columna Vertebral y Clínica De La Columna.
- **Aprobación del doctor sobre el copy clínico (fase 15):** ONPAGE-04 entrega el texto marcado como pendiente. Conviene agrupar toda la revisión en una sola ronda.

### Blockers/Concerns

- El dominio es de agosto de 2026 y su perfil de enlaces es casi nulo. Cualquier selección de keywords que ignore eso entrega un plan que no se puede ganar en el horizonte del proyecto.
- **Resuelto (fase 14).** La canibalización de MAP-02 se midió cruzando el mapa contra sí mismo: 120 pares, cero conflictos. La revisión con datos reales de Search Console queda como deuda D-1 con fecha al 2026-11-11.
- **Resuelto (fase 14).** La fase 8 de v1.1 ya está desbloqueada: MAP-03 se entregó el 2026-08-11 y la matriz de enlazado el 2026-08-12.
- **Solo quedan 6 búsquedas de SerpApi hasta el 2026-08-21.** La fase 15 necesita la SERP para derivar la jerarquía H2/H3 de ONPAGE-02. O sale de las 96 capturas ya cacheadas, o hay que esperar al reset. Planificar la fase asumiendo caché, no cuota.
- **Resuelto (fase 15, plan 02).** ONPAGE-05 ya no depende de DinoRank. Se midió el 2026-08-12 y el diagnóstico anterior estaba equivocado en la forma: `/auditoria` no responde HTTP 500, responde HTTP 200 con los datos de `soumahotel.com`. La auditoría corre local sobre el paquete propuesto, que además es lo que el ROADMAP pedía, y dio cero duplicados y cero metas faltantes en las 22 URLs vivas. Dar de alta el proyecto en DinoRank sigue siendo útil para auditar el sitio **publicado**, o sea después de que v1.1 implemente (deuda D-5).
- Contenido YMYL: nada de credenciales, cifras de cirugías ni resultados inventados. Solo lo verificado o lo que el doctor confirme por escrito. En la fase 15 esto deja de ser abstracto: ONPAGE-04 entrega copy clínico y ninguna línea sale sin el sello de pendiente de aprobación del doctor. **Desde el plan 15-02 esto ya no depende de que quien escriba se acuerde:** `ymyl.ts` lo comprueba y sale con estado distinto de cero si encuentra una sola sección clínica sin sello, una cifra sin fuente o una cifra sobre el propio doctor.

## Session Continuity

Last session: 2026-08-13T03:05:00.000Z
Stopped at: Completed 15-06-PLAN.md — los cuatro posts del blog
Resume file: None
Siguiente: 15-07, el último plan de la fase y del milestone v1.2. Cierra ONPAGE-06 emitiendo los seis documentos
cortos que faltan (`/agendar`, `/blog`, `/contacto`, `/sedes`, `/sobre-el-doctor` y `/testimonios`), arma la ronda
única del doctor (D-09) sobre todo lo que las cuatro familias sellaron, escribe `Suggested H1` en el Sheet y deja el
handoff hacia v1.1.

Lo que el 15-07 tiene que recoger de la wave 3 entera:

- **Del 15-05:** diez datos operativos pendientes de confirmación, en la tabla propia de cada paquete de sede, y 24
  secciones clínicas selladas. Dos merecen prioridad: el lema de la Clínica Tezza que el texto cita, que salió de los
  resultados medidos y no de una fuente institucional, y el bloque de hernia discal sin cirugía del consultorio de Surco.
- **Del 15-06:** 82 secciones clínicas selladas en los cuatro posts del blog. Dos bloques piden prioridad: las tres
  secciones del post de ciática que contradicen la promesa de aliviar el dolor en dos o tres minutos, porque
  contradecir una creencia muy difundida en una página médica conviene hacerlo con respaldo; y el bloque de secuelas y
  riesgo del post de cirugía, que enumera complicaciones sin dar ninguna probabilidad.
- **Herramienta:** `paquete.ts` imprime ahora cuatro bloques opcionales según lo que declare la fila de copy:
  `enlacesPropuestos` (15-04), `datosOperativos` y `notaDeFormato` (15-05) y `mapeoDePost` (15-06). El cruce de title,
  meta y H1 contra el mapa corre sobre los cuatro datasets de copy, así que ninguna familia quedó sin guardia.

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 12 P02 | 1h | 3 tasks | 7 files |
| Phase 12 P04 | 3h | 3 tasks | 6 files |
| Phase 12 P05 | 3h | 3 tasks | 12 files |
| Phase 13 P01 | 1h 50min | 3 tasks | 16 files |
| Phase 13 P02 | ~1h 15min | 2 tasks | 9 files |
| Phase 13 P05 | ~2h | 2 tasks | 6 files |
| Phase 14 P01 | 50m | 3 tasks | 12 files |
| Phase 14 P03 | ~2 h | 3 tasks | 19 files |
| Phase 14 P04 | ~2 h | 3 tasks | 14 files |
| Phase 15 P01 | ~2h 15min | 3 tasks | 12 files |
| Phase 15 P02 | ~1h | 3 tasks | 15 files |
| Phase 15 P03 | ~1h 30min | 3 tasks | 8 files |
| Phase 15 P04 | ~1h 40min | 3 tasks | 8 files |
| Phase 15 P05 | ~1h 15min | 3 tasks | 10 files |
| Phase 15 P06 | ~1h 30min | 3 tasks | 9 files |

## Presupuesto de fuentes externas al cerrar la fase 14

Las fases 13 y 14 gastaron SerpApi; la 14 entera cerró con **cero** búsquedas.

| Fuente | Consumido | Disponible |
|--------|-----------|------------|
| SerpApi | 96 búsquedas | **6 hasta el reset del 2026-08-21.** Es el techo real de la fase 15: cualquier medición de SERP nueva hay que agendarla después del reset (deudas D-2 y D-3) |
| DinoRank | 187 llamadas (40 del plan 03, 147 del plan 05) | Sin techo documentado; el proveedor no expone endpoint de saldo. El control es el libro de cuota persistido en `seo-tools/.cache/_quota.json` |

186 respuestas de DinoRank y 96 capturas de SERP quedan en caché: reprocesar el universo
completo cuesta **cero llamadas**, verificado sobre las 5716 keywords. Es lo que permitió que la
fase 14 entera —cuatro planes— corriera sin gastar una búsqueda.
