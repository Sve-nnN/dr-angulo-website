# Paquete on-page: /agendar

<!-- Generado por seo-tools/src/phase15/paquete.ts desde data/onpage.json y data/url-map.jsonl.
     No se edita a mano: se regenera. -->

## Qué hay que hacer con esta URL

| Campo | Valor |
| --- | --- |
| URL | `/agendar` |
| Acción | dejar |
| Formato | documento corto |
| Keyword primaria | sin primaria, y es una decisión medida de la fase 14 |
| Redirige a | no aplica |

<!-- copy:inicio -->

Esta URL se queda publicada y de ella solo cambian el title y la meta description, que están en la tabla de abajo.

El H1 no se toca. El que ya está en el sitio se transcribió acá para que se vea cuál es y no haya que ir a buscarlo.

<!-- copy:fin -->

## Title, meta y H1

| Campo | Texto | Caracteres |
| --- | --- | --- |
| Title | Agendar una cita con el Dr. Angulo | 34 / 60 |
| Meta description | Cómo pedir cita en cada sede: WhatsApp para el consultorio de Surco y la central de citas de Ricardo Palma, Sanna y Tezza. | 122 / 155 |
| H1 | Agendar cita | publicado |

Por qué ese H1: Transcrito del sitio publicado, sin cambiarlo: la URL declaro no competir en la fase 14 y proponerle un H1 nuevo reabriria esa decision sin dato nuevo. src/app/agendar/page.tsx:33

## Con qué anchor se enlaza a esta URL

Con anchor de **navegación**, nunca de keyword. La fase 14 midió que estas URLs no pelean
ningún término, y en varios casos porque si lo pelearan le quitarían la SERP a la home.
Enlazarlas desde el código con un anchor de keyword desharía esa decisión sin que ninguna
revisión lo note.

| Anchor | Regla | Desde |
| --- | --- | --- |
| Agendar cita | raiz-de-navegacion | `/` |
| Agendar cita | hacia-conversion | `/contacto`, `/preguntas-frecuentes`, `/sedes`, `/sedes/clinica-ricardo-palma`, `/sedes/clinica-tezza`, `/sedes/consultorio-privado`, `/sedes/sanna-la-molina`, `/servicios`, `/servicios/cirugia-minimamente-invasiva`, `/servicios/escoliosis-y-deformidades`, `/servicios/estenosis-espinal`, `/servicios/hernia-discal`, `/servicios/ortopedia-infantil`, `/sobre-el-doctor`, `/testimonios` |

## Por qué esta URL no compite

Escrito en la fase 14 y transcrito acá sin tocarlo. No es una omisión: es una decisión
medida, y quien implemente esta URL merece leer el motivo sin abrir otro archivo (D-14).

Es el final del embudo y no tiene cabeza medida propia. Las tres transaccionales que podria tomar se funden por SERP con la primaria de la home: `traumatologo lima` comparte 8 URLs del top 10 con `traumatologia lima`, `traumatologia cerca de mi` comparte 6 y `traumatologo cerca de mi` comparte 5, todas muy por encima del umbral de 3. Asignarle cualquiera de ellas montaria la canibalizacion que MAP-02 existe para atrapar, y con la home como victima. Recibe el trafico por enlace interno desde la home, las guias y las sedes, que es como trabaja una pagina de conversion.
