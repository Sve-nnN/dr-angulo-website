# Fase 13: los clusters del universo objetivo

**Generado:** por `src/phase13/serp-cluster.ts`, sin gastar cuota.
**Requisito:** KWR-04 y COMP-03.

> **El universo de 5.716 keywords es una muestra truncada, no un censo.** Sale de
> DinoRank, que corta las relacionadas en 900 por consulta y nunca devuelve la
> keyword consultada dentro de su propio arreglo. Leerlo como "todo lo que se busca
> en Lima" seria equivocarse: es todo lo que esta fuente alcanzo a ver.

## Lo primero que hay que saber para leer la tabla

Las 91 cabezas tienen SERP propia capturada en Lima y su cluster lo valido
Google: dos cabezas quedaron juntas cuando compartian 3 URLs o mas en el top 10.
Las otras 2348 filas heredaron el cluster por parecido de texto contra una de esas
cabezas, y quedan marcadas `cluster_por_texto`. No es lo mismo y por eso el dato lo dice:
una es evidencia, la otra es inferencia.

| Reparto del universo objetivo | Filas |
|---|---|
| Validadas contra Google (SERP propia) | 91 |
| Inferidas por parecido de texto | 2348 |
| Sin cluster | 2327 |
| **Total** | **4766** |

Que 2327 filas queden sin cluster es informacion, no un fallo. Forzar una
asignacion dudosa ensuciaria el dataset justo donde la fase 14 va a apoyarse para decidir
que URL responde a que.

## Que tipo de pagina premia Google en cada cluster

| Tipo de pagina dominante | Clusters |
|---|---|
| contenido internacional | 14 |
| pagina de servicio | 6 |
| directorio | 5 |
| guia | 3 |
| otro | 2 |
| red social | 1 |

## Los clusters

| Cluster | Tipo de pagina | Cabeza | Cabezas | Keywords | Validadas |
|---|---|---|---|---|---|
| especialista en columna y trauma en Lima | pagina de servicio | traumatologo ortopedia infantil | 41 | 939 | 41 |
| escoliosis | contenido internacional | escoliosis | 2 | 44 | 2 |
| estenosis espinal | contenido internacional | estenosis espinal | 2 | 45 | 2 |
| hernia discal | contenido internacional | hernia discal | 2 | 638 | 2 |
| artrodesis en varios niveles | contenido internacional | artrodesis en varios niveles | 2 | 7 | 2 |
| artrosis | guia | artrosis | 1 | 224 | 1 |
| ciática | contenido internacional | ciatica | 1 | 101 | 1 |
| cifosis | otro | cifosis | 1 | 72 | 1 |
| cirugía convencional | contenido internacional | cirugia convencional | 1 | 15 | 1 |
| cirugía de columna | contenido internacional | cirugia de columna | 1 | 29 | 1 |
| cirugía endoscópica de columna | contenido internacional | cirugia endoscopica de columna | 1 | 6 | 1 |
| cirugía mínimamente invasiva | contenido internacional | cirugia minimamente invasiva | 1 | 23 | 1 |
| desgarro muscular | contenido internacional | desgarro muscular | 6 | 181 | 6 |
| endoscopía espinal | pagina de servicio | endoscopia espinal | 1 | 6 | 1 |
| lumbalgia | contenido internacional | lumbalgia | 1 | 15 | 1 |
| cirugía convencional en lima | otro | cirugia convencional en lima | 1 | 1 | 1 |
| cirugía de columna la molina | directorio | cirugia de columna la molina | 6 | 6 | 6 |
| cirugía mínimamente invasiva en lima | pagina de servicio | cirugia minimamente invasiva en lima | 1 | 1 | 1 |
| estenosis de canal en lima | contenido internacional | estenosis de canal en lima | 1 | 1 | 1 |
| hernia discal lumbar y cervical en lima | pagina de servicio | hernia discal lumbar y cervical en lima | 1 | 1 | 1 |
| neurocirujano la molina | directorio | neurocirujano la molina | 1 | 1 | 1 |
| neurocirujano san isidro | directorio | neurocirujano san isidro | 1 | 1 | 1 |
| neurocirujano surco | directorio | neurocirujano surco | 1 | 1 | 1 |
| cirujano de columna clínica ricardo palma | pagina de servicio | cirujano de columna clinica ricardo palma | 3 | 15 | 3 |
| cirujano de columna clínica sanna | red social | cirujano de columna clinica sanna | 3 | 13 | 3 |
| cirujano de columna clínica tezza | directorio | cirujano de columna clinica tezza | 3 | 7 | 3 |
| ciática: tratamientos | guia | ciatica tratamientos | 1 | 5 | 1 |
| cual es la diferencia entre artritis y artrosis | contenido internacional | cual es la diferencia entre artritis y artrosis | 1 | 10 | 1 |
| fisioterapia traumatología | pagina de servicio | fisioterapia traumatologia | 1 | 20 | 1 |
| las mejores pastillas para la ciática | guia | las mejores pastillas para la ciatica | 1 | 4 | 1 |
| reumatólogo o traumatólogo | contenido internacional | reumatologo o traumatologo | 1 | 7 | 1 |

## Como se asigno la cola

Indice de Jaccard sobre los tokens normalizados, sin palabras vacias y sin modificadores
geograficos, con umbral 0.5, mas la condicion de compartir al menos un termino
clinico de cuatro letras o mas. Hacen falta las dos condiciones.

El geo se quita antes de medir a proposito: si se dejara, `traumatologo lima` y
`escoliosis lima` compartirian `lima` y puntuarian como si hablaran de lo mismo. El geo es
terreno, no tema.

El termino clinico compartido es lo que impide que `hernia discal lima` y
`hernia inguinal lima` se peguen por los tokens equivocados: puntuan 1/3, debajo del umbral,
y una hernia inguinal no es de columna.

Similitud media de las 2348 filas asignadas por texto: 0.582.

