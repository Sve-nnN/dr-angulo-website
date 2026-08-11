# Las 10 de Oro — fase 13 (KWR-06)

Diez keywords por las que vale la pena pelear primero, elegidas **por valor de negocio y
despues por alcanzabilidad**, que es el orden que fija D-10 y no al reves. Salen de las 91
cabezas con SERP de Lima medida, sobre un universo objetivo de 4.766.

> **La pregunta que este documento tiene que contestar es por que estas diez y no las diez de
> mayor volumen.** La respuesta corta: las dos de mayor volumen del universo son marca de
> competidores, las dos siguientes son codigos CIE-10 que busca personal administrativo, y el
> potencial de trafico supera al volumen propio en varias de las que si entraron. Un orden por
> volumen se pierde las tres cosas. La respuesta larga esta en la seccion de las que no entraron.

## Las diez

| # | Keyword | Cluster | Tipo de pagina | Intencion | Vol. Ahrefs | Vol. DinoRank | KD | Potencial | Alcance | Disputables |
|---:|---|---|---|---|---:|---:|---:|---:|---|---:|
| 1 | **escoliosis** | escoliosis | contenido-internacional | informacional | 18000 | sin datos | 12 | 3400 | bajo | 1/7 |
| 2 | **ortopedia infantil lima** | especialista-en-columna-y-trauma-en-lima | pagina-de-servicio | transaccional | 10 | 0 | sin datos | sin datos | alto | 6/9 |
| 3 | **hernia discal lumbar y cervical en lima** | hernia-discal-lumbar-y-cervical-en-lima | pagina-de-servicio | transaccional | sin datos | sin datos | sin datos | sin datos | alto | 7/8 |
| 4 | **estenosis de canal en lima** | estenosis-de-canal-en-lima | contenido-internacional | transaccional | sin datos | sin datos | sin datos | sin datos | medio | 4/8 |
| 5 | **traumatología lima** | especialista-en-columna-y-trauma-en-lima | pagina-de-servicio | transaccional | 50 | 880 | sin datos | sin datos | alto | 7/9 |
| 6 | **artrosis** | artrosis | guia | informacional | 11000 | sin datos | 26 | 1800 | medio | 4/7 |
| 7 | **ciática** | ciatica | contenido-internacional | informacional | 900 | 8100 | 19 | 1800 | bajo | 3/7 |
| 8 | **lumbalgia** | lumbalgia | contenido-internacional | informacional | 12000 | sin datos | 16 | 1800 | bajo | 1/7 |
| 9 | **cirujano de columna lima** | especialista-en-columna-y-trauma-en-lima | pagina-de-servicio | transaccional | sin datos | sin datos | sin datos | sin datos | alto | 7/9 |
| 10 | **cirugía mínimamente invasiva en lima** | cirugia-minimamente-invasiva-en-lima | pagina-de-servicio | transaccional | sin datos | sin datos | sin datos | sin datos | medio | 5/9 |

Donde dice `sin datos` es que la fuente no lo devolvio. **No es cero**, y la distincion
importa: DinoRank trunca las relacionadas en 900 y nunca devuelve la keyword consultada, asi
que varias condiciones centrales del negocio no tienen volumen propio por un limite de la
herramienta y no del mercado.

### En cuantas paginas caen

Las diez se reparten en **8 clusters**, que es lo que evita que sean una
sola pagina disfrazada de diez.

| Cluster | Keywords de oro | Tipo de pagina que premia la SERP |
|---|---|---|
| especialista-en-columna-y-trauma-en-lima | ortopedia infantil lima, traumatología lima, cirujano de columna lima | pagina-de-servicio |
| artrosis | artrosis | guia |
| ciatica | ciática | contenido-internacional |
| cirugia-minimamente-invasiva-en-lima | cirugía mínimamente invasiva en lima | pagina-de-servicio |
| escoliosis | escoliosis | contenido-internacional |
| estenosis-de-canal-en-lima | estenosis de canal en lima | contenido-internacional |
| hernia-discal-lumbar-y-cervical-en-lima | hernia discal lumbar y cervical en lima | pagina-de-servicio |
| lumbalgia | lumbalgia | contenido-internacional |

**Los clusters con mas de una, y por que entraron las dos:**

- **traumatología lima** — Comparte cluster (especialista-en-columna-y-trauma-en-lima) con una cabeza ya elegida, pero entra igual por dos hechos medidos: es de otra categoria de servicio (traumatologia-y-ortopedia), asi que la fase 14 le va a dar otra URL, y su top 10 comparte solape medido 0 con ella. El cluster se formo por transitividad, no porque estas dos sean la misma SERP.
- **cirujano de columna lima** — Comparte cluster (especialista-en-columna-y-trauma-en-lima) con una cabeza ya elegida, pero entra igual por dos hechos medidos: es de otra categoria de servicio (cirugia-de-columna), asi que la fase 14 le va a dar otra URL, y su top 10 comparte solape medido 0 con ella. El cluster se formo por transitividad, no porque estas dos sean la misma SERP.

## Por que cada una

### 1. escoliosis

Es materia del consultorio: "correccion de escoliosis y deformidades" sale de services.ts:procedureApproaches[].examples, dentro de Cirugia de columna. Volumen 18000 (ahrefs) con potencial de trafico 3400: la demanda esta en el termino, y Ahrefs estima que la pagina ganadora se lleva una parte y no el total. Su cluster es escoliosis y la SERP premia ahi contenido-internacional. Hoy su top 10 lo encabezan medlineplus.gov, mayoclinic.org, facebook.com (6 barreras): 1 de 7 posiciones medidas son disputables y la primera libre es la 3. KD 12 declarado por Ahrefs. Ningun competidor perfilado aparece en este top 10. Candidata a ganarla: /servicios/escoliosis-y-deformidades (planificada, crear).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| escoliosis | contenido-internacional | informacional / diagnostico | 18000 | sin datos | 12 | 3400 | 1/7 | 3 |

**Quien ocupa hoy su top 10:** medlineplus.gov, mayoclinic.org, facebook.com, cun.es, niams.nih.gov, clinicasanfelipe.com, cigna.com.

**URL candidata:** `/servicios/escoliosis-y-deformidades` — planificada, hay que **crear**.

### 2. ortopedia infantil lima

Es un servicio declarado del consultorio: "ortopedia infantil" sale de services.ts:serviceCategories[].name, dentro de Ortopedia infantil. Volumen 10 segun ahrefs. Su cluster es especialista-en-columna-y-trauma-en-lima y la SERP premia ahi pagina-de-servicio. Hoy su top 10 lo encabezan clinicarthromeds.pe, stellamaris.com.pe, doctoralia.pe (3 barreras): 6 de 9 posiciones medidas son disputables y la primera libre es la 1. Sin KD: Ahrefs no devolvio dificultad para esta cabeza (ahrefs_sin_dato), y no se inventa. Competidores perfilados presentes: clinicarthromeds.pe (DR 1.1). La linea de base propia es DR 0 y en este nicho eso no es la barrera: sus paginas interiores rankean con cero dominios de referencia. Candidata a ganarla: /servicios/ortopedia-infantil (planificada, crear).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| especialista-en-columna-y-trauma-en-lima | pagina-de-servicio | transaccional / decision | 10 | 0 | sin datos | sin datos | 6/9 | 1 |

**Quien ocupa hoy su top 10:** clinicarthromeds.pe, stellamaris.com.pe, doctoralia.pe, clinicaangloamericana.pe, instagram.com, ipot-crp.pe, drabeltrantraumatologia.com, clinicalima.sanjuandedios.pe, facebook.com.

**URL candidata:** `/servicios/ortopedia-infantil` — planificada, hay que **crear**.

### 3. hernia discal lumbar y cervical en lima

Es un servicio declarado del consultorio: "hernia discal lumbar y cervical" sale de services.ts:procedureApproaches[].examples, dentro de Cirugia de columna. Sin volumen medido, que no es sin mercado: DinoRank trunca las relacionadas en 900 y no devuelve la keyword consultada. El hueco es de la fuente y esta documentado. Su cluster es hernia-discal-lumbar-y-cervical-en-lima y la SERP premia ahi pagina-de-servicio. Hoy su top 10 lo encabezan cirugiaendoscopicaperu.com, doctoralia.pe, centromedicoosi.com (1 barrera): 7 de 8 posiciones medidas son disputables y la primera libre es la 1. Sin KD: Ahrefs no devolvio dificultad para esta cabeza (no_consultado), y no se inventa. Competidores perfilados presentes: clinicarthromeds.pe (DR 1.1). La linea de base propia es DR 0 y en este nicho eso no es la barrera: sus paginas interiores rankean con cero dominios de referencia. Candidata a ganarla: /servicios/hernia-discal (planificada, crear).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| hernia-discal-lumbar-y-cervical-en-lima | pagina-de-servicio | transaccional / decision | sin datos | sin datos | sin datos | sin datos | 7/8 | 1 |

**Quien ocupa hoy su top 10:** cirugiaendoscopicaperu.com, doctoralia.pe, centromedicoosi.com, clinicamontesinai.pe, auna.org, clinicarthromeds.pe, facebook.com, drperalestraumatologo.com.

**URL candidata:** `/servicios/hernia-discal` — planificada, hay que **crear**.

### 4. estenosis de canal en lima

Es un servicio declarado del consultorio: "estenosis de canal" sale de services.ts:procedureApproaches[].examples, dentro de Cirugia de columna. Sin volumen medido, que no es sin mercado: DinoRank trunca las relacionadas en 900 y no devuelve la keyword consultada. El hueco es de la fuente y esta documentado. Su cluster es estenosis-de-canal-en-lima y la SERP premia ahi contenido-internacional. Hoy su top 10 lo encabezan discalcentro.com, cirugiaendoscopicaperu.com, cun.es (4 barreras): 4 de 8 posiciones medidas son disputables y la primera libre es la 1. Sin KD: Ahrefs no devolvio dificultad para esta cabeza (no_consultado), y no se inventa. Ningun competidor perfilado aparece en este top 10. Candidata a ganarla: /servicios/estenosis-espinal (planificada, crear).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| estenosis-de-canal-en-lima | contenido-internacional | transaccional / decision | sin datos | sin datos | sin datos | sin datos | 4/8 | 1 |

**Quien ocupa hoy su top 10:** discalcentro.com, cirugiaendoscopicaperu.com, cun.es, copac.com.pa, medilaserperu.com.pe, especialistadecolumna.com, quironsalud.com, institutoclavel.com.

**URL candidata:** `/servicios/estenosis-espinal` — planificada, hay que **crear**.

### 5. traumatología lima

Es un servicio declarado del consultorio: "traumatologia" sale de cv.ts:education/experience, dentro de Traumatologia y ortopedia. Volumen 880 segun dinorank. Su cluster es especialista-en-columna-y-trauma-en-lima y la SERP premia ahi pagina-de-servicio. Hoy su top 10 lo encabezan clinicainternacional.com.pe, clinicalima.sanjuandedios.pe, traumamedical.com.pe (2 barreras): 7 de 9 posiciones medidas son disputables y la primera libre es la 3. Sin KD: Ahrefs no devolvio dificultad para esta cabeza (ahrefs_sin_dato), y no se inventa. Competidores perfilados presentes: clinicarthromeds.pe (DR 1.1). La linea de base propia es DR 0 y en este nicho eso no es la barrera: sus paginas interiores rankean con cero dominios de referencia. Candidata a ganarla: / (existente, reescribir).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| especialista-en-columna-y-trauma-en-lima | pagina-de-servicio | transaccional / decision | 50 | 880 | sin datos | sin datos | 7/9 | 3 |

**Quien ocupa hoy su top 10:** clinicainternacional.com.pe, clinicalima.sanjuandedios.pe, traumamedical.com.pe, doctoralia.pe, clinicalaluz.pe, sportsmedicinelima.com, drperalestraumatologo.com, stellamaris.com.pe, clinicarthromeds.pe.

**URL candidata:** `/` — existente, hay que **reescribir**.

### 6. artrosis

Es un servicio declarado del consultorio: "artrosis" sale de services.ts:serviceCategories[].conditions, dentro de Traumatologia y ortopedia. Volumen 11000 (ahrefs) con potencial de trafico 1800: la demanda esta en el termino, y Ahrefs estima que la pagina ganadora se lleva una parte y no el total. Su cluster es artrosis y la SERP premia ahi guia. Hoy su top 10 lo encabezan inforeuma.com, cun.es, who.int (3 barreras): 4 de 7 posiciones medidas son disputables y la primera libre es la 1. KD 26 declarado por Ahrefs. Ningun competidor perfilado aparece en este top 10. Candidata a ganarla: /blog/artrosis (inexistente, crear).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| artrosis | guia | informacional / diagnostico | 11000 | sin datos | 26 | 1800 | 4/7 | 1 |

**Quien ocupa hoy su top 10:** inforeuma.com, cun.es, who.int, msdmanuals.com, elsevier.es, oafifoundation.com, es.wikipedia.org.

**URL candidata:** `/blog/artrosis` — inexistente, hay que **crear**.

### 7. ciática

Es materia del consultorio: "lumbalgia y ciatica" sale de services.ts:serviceCategories[].conditions, dentro de Cirugia de columna. Potencial de trafico 1800 contra un volumen propio de 900 (ahrefs): la pagina que la gane captura mas que el termino en si, y por eso ordenar por volumen la dejaria abajo. Su cluster es ciatica y la SERP premia ahi contenido-internacional. Hoy su top 10 lo encabezan mayoclinic.org, medlineplus.gov, fesemi.org (4 barreras): 3 de 7 posiciones medidas son disputables y la primera libre es la 3. KD 19 declarado por Ahrefs. Ningun competidor perfilado aparece en este top 10. Candidata a ganarla: /blog/ciatica (inexistente, crear).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| ciatica | contenido-internacional | informacional / diagnostico | 900 | 8100 | 19 | 1800 | 3/7 | 3 |

**Quien ocupa hoy su top 10:** mayoclinic.org, medlineplus.gov, fesemi.org, cinfasalud.cinfa.com, quironsalud.com, spine-health.com, cigna.com.

**URL candidata:** `/blog/ciatica` — inexistente, hay que **crear**.

### 8. lumbalgia

Es materia del consultorio: "lumbalgia y ciatica" sale de services.ts:serviceCategories[].conditions, dentro de Cirugia de columna. Volumen 12000 (ahrefs) con potencial de trafico 1800: la demanda esta en el termino, y Ahrefs estima que la pagina ganadora se lleva una parte y no el total. Su cluster es lumbalgia y la SERP premia ahi contenido-internacional. Hoy su top 10 lo encabezan who.int, inforeuma.com, cigna.com (6 barreras): 1 de 7 posiciones medidas son disputables y la primera libre es la 2. KD 16 declarado por Ahrefs. Ningun competidor perfilado aparece en este top 10. Candidata a ganarla: /blog/lumbalgia (inexistente, crear).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| lumbalgia | contenido-internacional | informacional / diagnostico | 12000 | sin datos | 16 | 1800 | 1/7 | 2 |

**Quien ocupa hoy su top 10:** who.int, inforeuma.com, cigna.com, elsevier.es, institutoclavel.com, quironsalud.com, blog.auna.pe.

**URL candidata:** `/blog/lumbalgia` — inexistente, hay que **crear**.

### 9. cirujano de columna lima

Es un servicio declarado del consultorio: "cirujano de columna" sale de cv.ts:education/experience, dentro de Cirugia de columna. Sin volumen medido, que no es sin mercado: DinoRank trunca las relacionadas en 900 y no devuelve la keyword consultada. El hueco es de la fuente y esta documentado. Su cluster es especialista-en-columna-y-trauma-en-lima y la SERP premia ahi pagina-de-servicio. Hoy su top 10 lo encabezan cirujanocolumna-elaos.com, doctoralia.pe, drcarranzacolumna.com (2 barreras): 7 de 9 posiciones medidas son disputables y la primera libre es la 1. Sin KD: Ahrefs no devolvio dificultad para esta cabeza (no_consultado), y no se inventa. Competidores perfilados presentes: drcarranzacolumna.com (DR 0), cirujanocolumna-elaos.com (DR 0), clinicarthromeds.pe (DR 1.1). La linea de base propia es DR 0 y en este nicho eso no es la barrera: sus paginas interiores rankean con cero dominios de referencia. Candidata a ganarla: /servicios (existente, reescribir).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| especialista-en-columna-y-trauma-en-lima | pagina-de-servicio | transaccional / decision | sin datos | sin datos | sin datos | sin datos | 7/9 | 1 |

**Quien ocupa hoy su top 10:** cirujanocolumna-elaos.com, doctoralia.pe, drcarranzacolumna.com, ineurocienciaslima.com.pe, clinicainternacional.com.pe, clinicarthromeds.pe, cirugiacerebroalmenara.com, clinicasanfelipe.com, ineurocienciaslima.com.pe.

**URL candidata:** `/servicios` — existente, hay que **reescribir**.

### 10. cirugía mínimamente invasiva en lima

Es un servicio declarado del consultorio: "cirugia minimamente invasiva" sale de services.ts:procedureApproaches[].name, dentro de Cirugia de columna. Sin volumen medido, que no es sin mercado: DinoRank trunca las relacionadas en 900 y no devuelve la keyword consultada. El hueco es de la fuente y esta documentado. Su cluster es cirugia-minimamente-invasiva-en-lima y la SERP premia ahi pagina-de-servicio. Hoy su top 10 lo encabezan clinicaangloamericana.pe, cirugiaendoscopicaperu.com, facebook.com (4 barreras): 5 de 9 posiciones medidas son disputables y la primera libre es la 2. Sin KD: Ahrefs no devolvio dificultad para esta cabeza (no_consultado), y no se inventa. Ningun competidor perfilado aparece en este top 10. Candidata a ganarla: /servicios (existente, reescribir).

| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |
|---|---|---|---:|---:|---:|---:|---:|---:|
| cirugia-minimamente-invasiva-en-lima | pagina-de-servicio | transaccional / decision | sin datos | sin datos | sin datos | sin datos | 5/9 | 2 |

**Quien ocupa hoy su top 10:** clinicaangloamericana.pe, cirugiaendoscopicaperu.com, facebook.com, essalud.gob.pe, clinicainternacional.com.pe, facebook.com, clinicaangloamericana.pe, centromedicoabc.com, mayoclinic.org.

**URL candidata:** `/servicios` — existente, hay que **reescribir**.

## Las que no entraron, y por que

Ordenadas por volumen, que es el orden en el que alguien va a abrir el Sheet y preguntar por
ellas. Sin esta seccion la lista no se puede discutir.

| Volumen | Keyword | Por que no |
|---:|---|---|
| 14800 | tendinitis | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |
| 6600 | fracturas | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |
| 5400 | desgarro muscular | Quedo fuera del corte de 10 con 34 puntos de valor de negocio. |
| 3600 | cifosis | Quedo fuera del corte de 10 con 37 puntos de valor de negocio. |
| 2400 | artrosis cie 10 | Es un CODIGO CIE-10. Lo busca personal administrativo facturando, no un paciente con dolor. Encabeza cualquier orden por volumen y por eso queda escrito aca. |
| 2400 | artrosis cie-10 | Es un CODIGO CIE-10. Lo busca personal administrativo facturando, no un paciente con dolor. Encabeza cualquier orden por volumen y por eso queda escrito aca. |
| 2400 | clínica san bernardo especialistas en traumatología | Es MARCA DE UN COMPETIDOR. Se lee como inteligencia y no se persigue nunca: quien la busca ya eligio otra clinica, y posicionar sobre la marca ajena no trae ese paciente. |
| 1600 | cie 10 hernia discal | Es un CODIGO CIE-10. Lo busca personal administrativo facturando, no un paciente con dolor. Encabeza cualquier orden por volumen y por eso queda escrito aca. |
| 1600 | cie-10 hernia discal | Es un CODIGO CIE-10. Lo busca personal administrativo facturando, no un paciente con dolor. Encabeza cualquier orden por volumen y por eso queda escrito aca. |
| 1600 | clínica de traumatología arthrosalud | Es MARCA DE UN COMPETIDOR. Se lee como inteligencia y no se persigue nunca: quien la busca ya eligio otra clinica, y posicionar sobre la marca ajena no trae ese paciente. |
| 1600 | ortopedia zapatos | Es RETAIL ortopedico: quien busca quiere comprar un producto, no consultar a un traumatologo. |
| 1600 | tipos de fracturas | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |
| 880 | desgarro muscular cie 10 | Es un CODIGO CIE-10. Lo busca personal administrativo facturando, no un paciente con dolor. Encabeza cualquier orden por volumen y por eso queda escrito aca. |
| 880 | desgarro muscular cie-10 | Es un CODIGO CIE-10. Lo busca personal administrativo facturando, no un paciente con dolor. Encabeza cualquier orden por volumen y por eso queda escrito aca. |
| 880 | ejercicios para escoliosis | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |
| 880 | hiper cifosis | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |
| 880 | ortopedia glinsa | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |
| 720 | cifosis y lordosis | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |
| 720 | ejercicios para lumbalgia | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |
| 720 | lesiones de rodilla | Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por limite de presupuesto de medicion, no por un juicio de negocio. |

### Las que se quedaron cerca

Pasaron las tres puertas y quedaron fuera del corte. Es donde Juan puede decir "esta si".

| Keyword | Cluster | Por que quedo fuera |
|---|---|---|
| traumatólogo ortopedia infantil | especialista-en-columna-y-trauma-en-lima | Mismo cluster (especialista-en-columna-y-trauma-en-lima) y misma categoria de servicio (ortopedia-infantil) que "ortopedia infantil lima", que ya entro con mas valor de negocio. Serian la misma pagina. |
| ortopedia infantil | especialista-en-columna-y-trauma-en-lima | Mismo cluster (especialista-en-columna-y-trauma-en-lima) y misma categoria de servicio (ortopedia-infantil) que "ortopedia infantil lima", que ya entro con mas valor de negocio. Serian la misma pagina. |
| traumatología y ortopedia | especialista-en-columna-y-trauma-en-lima | Mismo cluster (especialista-en-columna-y-trauma-en-lima) y misma categoria de servicio (traumatologia-y-ortopedia) que "traumatología lima", que ya entro con mas valor de negocio. Serian la misma pagina. |
| traumatología | especialista-en-columna-y-trauma-en-lima | Mismo cluster (especialista-en-columna-y-trauma-en-lima) y misma categoria de servicio (traumatologia-y-ortopedia) que "traumatología lima", que ya entro con mas valor de negocio. Serian la misma pagina. |
| cirugía de columna lima | especialista-en-columna-y-trauma-en-lima | Mismo cluster (especialista-en-columna-y-trauma-en-lima) y misma categoria de servicio (cirugia-de-columna) que "cirujano de columna lima", que ya entro con mas valor de negocio. Serian la misma pagina. |
| traumatología y ortopedia lima | especialista-en-columna-y-trauma-en-lima | Quedo fuera del corte de 10 con 38 puntos de valor de negocio. |
| cifosis | cifosis | Quedo fuera del corte de 10 con 37 puntos de valor de negocio. |
| hernia discal lumbar y cervical | hernia-discal | Quedo fuera del corte de 10 con 37 puntos de valor de negocio. |
| desgarro muscular | desgarro-muscular | Quedo fuera del corte de 10 con 34 puntos de valor de negocio. |
| traumatólogo lima | especialista-en-columna-y-trauma-en-lima | Quedo fuera del corte de 10 con 31 puntos de valor de negocio. |
| como se cura un desgarro muscular | desgarro-muscular | Quedo fuera del corte de 10 con 30 puntos de valor de negocio. |
| mejor clínica de traumatología en lima | especialista-en-columna-y-trauma-en-lima | Quedo fuera del corte de 10 con 30 puntos de valor de negocio. |

### Las sedes y los distritos, y con que numeros quedaron

Pregunta obligada, porque `PROJECT.md` declara la sede de Ricardo Palma como prioritaria y v1.1
planifica una pagina por cada una de las cuatro. **Ninguna keyword de sede o de distrito entro en
las diez, y el motivo NO es que sean dificiles:** varias son de las mas ganables de todo el
universo medido. El motivo es de demanda. Ninguna tiene volumen medido, y su marca geografica
pesa menos que la de nivel Lima porque una pagina de sede sirve a un distrito mientras que la
de servicio sirve a toda la ciudad. Se quedaron todas en el mismo puntaje.

| Sede o distrito | Mejor cabeza medida | Valor | Alcance | Disputables | Primera libre |
|---|---|---:|---|---:|---:|
| clinica ricardo palma | cirujano de columna clínica ricardo palma | 27 | bajo | 3/8 | 4 |
| clinica sanna | cirujano de columna clínica sanna | 27 | alto | 6/10 | 2 |
| clinica tezza | ortopedia infantil clínica tezza | 27 | alto | 6/9 | 3 |
| la molina | ortopedia infantil la molina | 27 | alto | 8/9 | 1 |
| san isidro | cirugía de columna san isidro | 27 | alto | 7/9 | 1 |
| surco | cirugía de columna surco | 27 | alto | 9/9 | 1 |

La excepcion que si es de dificultad es **Ricardo Palma**: es la unica de alcance bajo, con 3 de
8 disputables y la primera posicion libre en la 4, porque `crp.com.pe` e `ipot-crp.pe` ocupan
su propio top 3. En la SERP de marca de una clinica, la clinica gana. Su pagina de sede hay que
escribirla igual —la related search "traumatologo especialista en columna clinica ricardo palma"
esta verificada y hoy no la responde ninguna URL del sitio—, pero el techo realista es la
posicion 4 y no la 1.

### Confirmadas por el cliente que el criterio igual dejo fuera

Esto se escribe aparte porque es lo unico que el criterio decidio EN CONTRA de una indicacion
explicita. La puerta de servicio propio se levanto —el dato estaba mal y quedo corregido—, pero
el puntaje se calculo igual que para todas las demas y no alcanzo. Editarlo a mano en el ultimo
paso habria dado una lista que no sobrevive a su propio criterio.

- **cifosis** — confirmada por Juan el 2026-08-11. Quedo fuera del corte de 10 con 37 puntos de valor de negocio.

### Vetadas a mano, con su motivo

Estas no las saco un umbral: estan escritas en `data/golden-criterio.json` con su razon.

- **artrodesis en varios niveles en lima** — Sale por INTENCION EQUIVOCADA, decision de Juan del 2026-08-11 sobre el argumento del informe del checkpoint. Es un procedimiento que el doctor si realiza y sus numeros de SERP son buenos (6 de 9 disputables, alcance alto), pero 'artrodesis' es como le dice un cirujano a la operacion, no como la busca un paciente. El paciente que va a operarse busca por su condicion o por su miedo, y ese miedo lo cubre 'cirugia minimamente invasiva'. Sigue siendo contenido valido dentro de una pagina de servicio; lo que no es, es una keyword por la que se pelee primero.
- **artrodesis en varios niveles** — Misma razon que su forma geo: la busca quien ya sabe como se llama la operacion.
- **cirugia convencional en lima** — Su top 10 medido es de cirugia GENERAL, no de columna: cirugia24horas.com, cirugiasperu.com, cjp.pe, novoclinic.com.pe, cirugiaendoscopicaperu.com. La keyword nombra una tecnica que el doctor si realiza, pero su SERP responde a otra intencion. 8 de 9 posiciones disputables no sirven de nada si el que busca no es su paciente.
- **cirugia convencional** — Misma razon que su forma geo: la SERP es de cirugia general y de contenido internacional (revespcardiol.org, mayoclinic.org, icatme.com).
- **las mejores pastillas para la ciatica** — Juan la conservo el 2026-08-11 como contenido educativo de tope de embudo y EXPLICITAMENTE no transaccional. Informa la estrategia de contenido; mapearla como si el que busca estuviera por operarse seria leer mal su propia decision.
- **clinica montefiori** — Juan confirmo el 2026-08-11 que el doctor YA NO atiende en Montefiori. Las cuatro sedes vigentes son consultorio Surco, Clinica Ricardo Palma, Sanna La Molina y Padre Luis Tezza.

## Lo que esta lista arrastra

- El universo de 5.716 keywords es una **muestra truncada**, no un censo de lo que se busca en Lima. DinoRank corta las relacionadas en 900 por consulta y nunca devuelve la keyword consultada dentro de su propio arreglo. Leer esta lista como 'las diez mejores de Lima' seria leerla mal: son las diez mejores de lo que se pudo medir.

- De las 114 busquedas de SerpApi disponibles se gastaron 96 midiendo la SERP de 91 cabezas. **Quedan 4.675 keywords del universo objetivo sin una sola SERP medida**, y ninguna de ellas pudo ser candidata a esta lista. Dos de las cinco keywords de mayor volumen del universo —'tendinitis' con 14.800 y 'fracturas' con 6.600— quedaron fuera por eso y no por un juicio de negocio.

- **Ahrefs y DinoRank discrepan fuerte** en volumen para las condiciones nucleo y las dos cifras se publican sin promediar: 'cifosis' da 2.300 en Ahrefs y 3.600 en DinoRank; 'ciatica' da 900 en Ahrefs y 8.100 en DinoRank; 'hernia discal' da 6.000 en Ahrefs y 0 en DataForSEO via DinoRank. Cuando las dos aparecen, las dos se leen.

- El punto dulce se midio contra la **calidad del contenido** del top 10 y no contra el perfil de enlaces, porque la medicion del 2026-08-11 mostro que en los cinco competidores la home concentra todos los dominios de referencia y las paginas interiores que traen el trafico tienen cero. Si esa lectura cambiara, la mitad de alcanzabilidad de esta lista habria que recalcularla.

## Como se eligieron

Tres puertas y despues un orden, todo en `data/golden-criterio.json`:

1. **Alcance objetivo.** La marca ajena, los codigos CIE-10 y el retail ortopedico ya venian marcados desde la fase 12.
2. **Servicio propio.** La keyword tiene que nombrar algo que el sitio declara que el doctor hace. Lo que salio del perfil de un competidor describe lo que hace otro.
3. **Piso de evidencia.** Al menos 1 posicion disputable en el top 10 medido. Sin sitio donde entrar no hay objetivo, por mucho volumen que tenga.

Despues, el orden: **valor de negocio primero** —potencial de trafico, marca geografica y
rango de negocio— y **alcanzabilidad despues**, solo como desempate. Y una regla final para
que las diez no sean la misma pagina: una por cluster, salvo que la segunda sea de otra
categoria de servicio **y** su top 10 no comparta ni una url con la ya elegida.

