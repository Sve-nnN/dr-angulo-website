# Competencia de Lima: los cinco mas la linea de base propia

Entregable de COMP-01 y COMP-04, fase 13, plan 13-03. Generado por
`seo-tools/src/phase13/comp-profile.ts` a partir de `seo-tools/data/competitors.json`.
**No se edita a mano:** se regenera corriendo el comando, que lee solo de la cache y no
gasta unidades.

- Los cinco dominios son la decision **D-11**, cerrada el 2026-08-10.
- Procedencia de las metricas: Ahrefs API v3 via servidor MCP, ingerido con src/phase13/ahrefs-ingest.ts. Este modulo lee SOLO de la cache y no consulta nada.
- Una metrica que la fuente no devolvio aparece en cursiva con su motivo, **nunca como cero**.
  `no_consultado` significa que la consulta todavia no entro a la cache; `ahrefs_sin_dato`
  que la consulta esta pero la fuente no trajo ese campo; `sin_evidencia` que hubo datos y
  no alcanzaron para afirmar.

## Tabla comparativa

| Dominio | Quien | DR | Ahrefs Rank | Referring domains | Trafico organico | Keywords top 100 | Blog |
|---|---|---|---|---|---|---|---|
| `drcarranzacolumna.com` | Dr. Paul Carranza | 0 | 145062552 | 432 | 14 | 14 | _sin_evidencia_ |
| `drciezatraumatologia.com` | Dr. Ramiro Cieza | 2.9 | 38468366 | 431 | 0 | 0 | _sin_evidencia_ |
| `cirujanocolumna-elaos.com` | Dr. Eduardo Laos | 0 | 131521463 | 426 | 113 | 39 | si (`https://www.cirujanocolumna-elaos.com/post/artrosis-en-tu-columna`) |
| `doctormunguia.com` | Dr. Gunter Munguia | 0 | 182257372 | 405 | 0 | 0 | _sin_evidencia_ |
| `clinicarthromeds.pe` | Clinica Arthromeds | 1.1 | 55310275 | 420 | 2036 | 582 | _sin_evidencia_ |
| **drangulocolumna.com** (linea de base) | Dr. Angulo | 0 | _ahrefs_sin_dato_ | 0 | 0 | 0 | _sin_evidencia_ |

## Paginas mas enlazadas, por competidor

De mayor a menor por cantidad de dominios de referencia. Es la primera mitad de COMP-04; la
otra mitad, los featured snippets, se mide sobre las SERP ya capturadas y la cierra el plan
13-04 sin pedirle nada a Ahrefs.

### Dr. Paul Carranza — `drcarranzacolumna.com`

Neurocirujano, cirugia endoscopica y minimamente invasiva de columna. Av. Republica de Panama 3609, Lima.

Origen del dominio en el analisis: investigacion v1.0 (2026-07-31).

| # | URL | Dominios de referencia | Keyword principal | Trafico estimado |
|---|---|---|---|---|
| 1 | `https://www.drcarranzacolumna.com/` | 158 | especialista en columna vertebral | 14 |
| 2 | `https://www.drcarranzacolumna.com/preguntas-frecuentes/` | 0 | cuanto cuesta una operación de columna en perú | 1 |

### Dr. Ramiro Cieza — `drciezatraumatologia.com`

Traumatologia de columna. Av. Jorge Basadre 255 Of 303, San Isidro. Reservas via Doctoralia.

Origen del dominio en el analisis: investigacion v1.0 (2026-07-31).

La fuente respondio y no devolvio ninguna pagina. No es lo mismo que no tenerlas.

### Dr. Eduardo Laos — `cirujanocolumna-elaos.com`

Neurocirujano. +2000 cirugias declaradas. Unico de los tres de v1.0 con blog propio.

Origen del dominio en el analisis: investigacion v1.0 (2026-07-31).

| # | URL | Dominios de referencia | Keyword principal | Trafico estimado |
|---|---|---|---|---|
| 1 | `https://www.cirujanocolumna-elaos.com/` | 162 | especialista en columna vertebral | 92 |
| 2 | `https://www.cirujanocolumna-elaos.com/post/artrosis-en-tu-columna` | 0 | artrosis en la columna | 0 |
| 3 | `https://www.cirujanocolumna-elaos.com/post/c%C3%A1ncer-y-columna` | 0 | metastasis en vertebras | 0 |

### Dr. Gunter Munguia — `doctormunguia.com`

Neurocirujano endoscopista de columna, Surco. Pack local posicion 2, 4.8 con 24 resenas.

Origen del dominio en el analisis: validacion de SerpApi (2026-08-10).

La fuente respondio y no devolvio ninguna pagina. No es lo mismo que no tenerlas.

### Clinica Arthromeds — `clinicarthromeds.pe`

Organico posicion 5, con la URL construida exactamente sobre la keyword geo: /traumatologo-especialista-en-columna-lima-peru/. Es el patron que este proyecto quiere replicar.

Origen del dominio en el analisis: validacion de SerpApi (2026-08-10).

| # | URL | Dominios de referencia | Keyword principal | Trafico estimado |
|---|---|---|---|---|
| 1 | `https://clinicarthromeds.pe/` | 371 | clinica de traumatologia | 66 |
| 2 | `https://clinicarthromeds.pe/alargamiento-de-piernas-peru-aumenta-tu-estatura-con-seguridad/` | 0 | alargamiento de piernas | 65 |
| 3 | `https://clinicarthromeds.pe/clinicarthromeds-pe-agendar-cita-traumatologo-lima/` | 0 | clínica arthromeds | 0 |
| 4 | `https://clinicarthromeds.pe/dr-christian-huamani-medina/` | 0 | clínica arthromeds | 0 |
| 5 | `https://clinicarthromeds.pe/especialidades-quirurgicas/artroscopia-manguito-rotado-hombro-rotura-tendon-lima-peru/` | 0 | tendon del hombro | 1 |
| 6 | `https://clinicarthromeds.pe/especialidades-quirurgicas/cirugia-artroscopia-artroscopica-cadera-pincer-cam-lima-peru/` | 0 | artroscopia de cadera | 5 |
| 7 | `https://clinicarthromeds.pe/especialidades-quirurgicas/cirugia-protesis-cadera-artrosis-de-cadera-lima-peru/` | 0 | protesis de cadera | 98 |
| 8 | `https://clinicarthromeds.pe/especialidades-quirurgicas/cirugia-secuelas-esguince-tobillo-lima-peru/` | 0 | esguince tobillo cie 10 | 16 |
| 9 | `https://clinicarthromeds.pe/mejor-traumatologo-en-lima-peru/` | 0 | mejor traumatologo de lima | 71 |
| 10 | `https://clinicarthromeds.pe/traumatologia-reconstructiva/` | 0 | traumalogia | 3 |

### Dr. Angulo — `drangulocolumna.com`

Dr. Juan Carlos Angulo, el dominio propio. Comprado el 2026-08-09, historial casi nulo.

Origen del dominio en el analisis: linea de base del proyecto.

La fuente respondio y no devolvio ninguna pagina. No es lo mismo que no tenerlas.

## Resenas del pack local

Medido en la captura de SerpApi del 2026-08-10. **Insumo para GBP-03 del workstream
`milestone`, no de esta fase.**

| Ficha | Calificacion | Resenas |
|---|---|---|
| Clinica De La Columna | 3.5 | 34 |
| Dr. Gunter Munguia | 4.8 | 24 |
| Centro de Columna Vertebral | 5 | 13 |
| Dr. Angulo | 5 | 6 |

