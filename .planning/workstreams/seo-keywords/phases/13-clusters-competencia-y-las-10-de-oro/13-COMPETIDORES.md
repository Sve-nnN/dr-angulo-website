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

> **Estado: incompleto.** Faltan 24 consultas de Ahrefs
> por ingerir. Ahrefs no tiene credencial en `.secrets/.env` y su unico camino de acceso
> es el servidor MCP. Hasta que entren, las metricas de COMP-01 quedan declaradas como
> `no_consultado`, que es distinto de cero y distinto de "no tiene".

## Tabla comparativa

| Dominio | Quien | DR | Ahrefs Rank | Referring domains | Trafico organico | Keywords top 100 | Blog |
|---|---|---|---|---|---|---|---|
| `drcarranzacolumna.com` | Dr. Paul Carranza | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ |
| `drciezatraumatologia.com` | Dr. Ramiro Cieza | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ |
| `cirujanocolumna-elaos.com` | Dr. Eduardo Laos | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ |
| `doctormunguia.com` | Dr. Gunter Munguia | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ |
| `clinicarthromeds.pe` | Clinica Arthromeds | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ |
| **drangulocolumna.com** (linea de base) | Dr. Angulo | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ | _no_consultado_ |

## Paginas mas enlazadas, por competidor

De mayor a menor por cantidad de dominios de referencia. Es la primera mitad de COMP-04; la
otra mitad, los featured snippets, se mide sobre las SERP ya capturadas y la cierra el plan
13-04 sin pedirle nada a Ahrefs.

### Dr. Paul Carranza — `drcarranzacolumna.com`

Neurocirujano, cirugia endoscopica y minimamente invasiva de columna. Av. Republica de Panama 3609, Lima.

Origen del dominio en el analisis: investigacion v1.0 (2026-07-31).

_Sin datos todavia: la consulta `site-explorer/top-pages` no se ha ingerido._

### Dr. Ramiro Cieza — `drciezatraumatologia.com`

Traumatologia de columna. Av. Jorge Basadre 255 Of 303, San Isidro. Reservas via Doctoralia.

Origen del dominio en el analisis: investigacion v1.0 (2026-07-31).

_Sin datos todavia: la consulta `site-explorer/top-pages` no se ha ingerido._

### Dr. Eduardo Laos — `cirujanocolumna-elaos.com`

Neurocirujano. +2000 cirugias declaradas. Unico de los tres de v1.0 con blog propio.

Origen del dominio en el analisis: investigacion v1.0 (2026-07-31).

_Sin datos todavia: la consulta `site-explorer/top-pages` no se ha ingerido._

### Dr. Gunter Munguia — `doctormunguia.com`

Neurocirujano endoscopista de columna, Surco. Pack local posicion 2, 4.8 con 24 resenas.

Origen del dominio en el analisis: validacion de SerpApi (2026-08-10).

_Sin datos todavia: la consulta `site-explorer/top-pages` no se ha ingerido._

### Clinica Arthromeds — `clinicarthromeds.pe`

Organico posicion 5, con la URL construida exactamente sobre la keyword geo: /traumatologo-especialista-en-columna-lima-peru/. Es el patron que este proyecto quiere replicar.

Origen del dominio en el analisis: validacion de SerpApi (2026-08-10).

_Sin datos todavia: la consulta `site-explorer/top-pages` no se ha ingerido._

### Dr. Angulo — `drangulocolumna.com`

Dr. Juan Carlos Angulo, el dominio propio. Comprado el 2026-08-09, historial casi nulo.

Origen del dominio en el analisis: linea de base del proyecto.

_Sin datos todavia: la consulta `site-explorer/top-pages` no se ha ingerido._

## Resenas del pack local

Medido en la captura de SerpApi del 2026-08-10. **Insumo para GBP-03 del workstream
`milestone`, no de esta fase.**

| Ficha | Calificacion | Resenas |
|---|---|---|
| Clinica De La Columna | 3.5 | 34 |
| Dr. Gunter Munguia | 4.8 | 24 |
| Centro de Columna Vertebral | 5 | 13 |
| Dr. Angulo | 5 | 6 |

## Consultas pendientes de ingerir

| Dominio | Endpoint | Clave de cache |
|---|---|---|
| `drcarranzacolumna.com` | `site-explorer/domain-rating` | `929dba63a19371d6cb7c284c1b0954c1698cb95843f13c507f56e5c21e21f407` |
| `drcarranzacolumna.com` | `site-explorer/backlinks-stats` | `d1385a4d6610fc179cca7fd59ae9f06feea0a12e3ae6b1de4a46524b039fdf72` |
| `drcarranzacolumna.com` | `site-explorer/metrics` | `fa058da5324c12fd2beeebc6f9d1a446b26fda6d827d2a703e160bc3db1596c0` |
| `drcarranzacolumna.com` | `site-explorer/top-pages` | `8cdf53595e4801f365509d76581d23dc734dd7f642ad770f768e61b9de88c47e` |
| `drciezatraumatologia.com` | `site-explorer/domain-rating` | `8a974e66e20a7bacf85a284d6756b9351bf0f22b150af577eb4ec6a033655c03` |
| `drciezatraumatologia.com` | `site-explorer/backlinks-stats` | `d5f8460c07d5dc413760f14331e736a25b909e96ebf899c9b2ef61d6b8389942` |
| `drciezatraumatologia.com` | `site-explorer/metrics` | `d5f0eb3559a000b5e900e9b46bb510ce84e6079058d6d53c58646a05dbfaf697` |
| `drciezatraumatologia.com` | `site-explorer/top-pages` | `ee838cfb4577facfe87fa26b2ede21afb0ee14b29e030d6012df4b0e5e43bcc2` |
| `cirujanocolumna-elaos.com` | `site-explorer/domain-rating` | `84c0c58980deac2638196b97bd7c9619e75ee67b3995ac72b78b7240dcd420b4` |
| `cirujanocolumna-elaos.com` | `site-explorer/backlinks-stats` | `4fcd23e34bf9b19c3a5fd29f8fa7cce9eb73eec4853afa1b8f91c653fb115765` |
| `cirujanocolumna-elaos.com` | `site-explorer/metrics` | `037dfdfc66d0968d039532c4d653b2d889d4889b330abbccb973348d435a493a` |
| `cirujanocolumna-elaos.com` | `site-explorer/top-pages` | `1faef11da928cf2a12e45313d68e99903e4605bf0d2c0c6944dc322de1a8286b` |
| `doctormunguia.com` | `site-explorer/domain-rating` | `16381ae72dde5702ae1cfb299dad28294dde93ebdce64ff801f350239884e43a` |
| `doctormunguia.com` | `site-explorer/backlinks-stats` | `991ba13afcba9979c703845220ba07698cc272aad21aa590f34cde3c9d145f51` |
| `doctormunguia.com` | `site-explorer/metrics` | `a235f83be4c2d5a9db4727da58ac47ce0d6d066ab2b4f7d7f6421dd91959c385` |
| `doctormunguia.com` | `site-explorer/top-pages` | `0e9e905aa28cc016ac37dbedaa285545dd1ab63d3c459240d92d73b98c0e81fe` |
| `clinicarthromeds.pe` | `site-explorer/domain-rating` | `0da30648d8ce30a9da94247328a4c7a944efe2d7c160dfde8e3080e26c4d19d7` |
| `clinicarthromeds.pe` | `site-explorer/backlinks-stats` | `db64812055d1d3c11fc39b53fd0a50c1995ca361e57a26fcebc7622d6625857a` |
| `clinicarthromeds.pe` | `site-explorer/metrics` | `9a6ef00abe559df9c3a3850f11e78b46a3eb504d1c6de4068bdb71a17852762a` |
| `clinicarthromeds.pe` | `site-explorer/top-pages` | `58e50237c7bf4d8e6e27163739a7ec048532e681ca105e7ca848c68c2c6a1285` |
| `drangulocolumna.com` | `site-explorer/domain-rating` | `b7899806125b86792985bfaf501173452fef4061ce7b4a0f6d2d222db2271dae` |
| `drangulocolumna.com` | `site-explorer/backlinks-stats` | `1b681b8d49a2d9ed5590a91ddf041854dbd34a1a56a42f7e7cabfd0ea9d0cd4e` |
| `drangulocolumna.com` | `site-explorer/metrics` | `5b1fa76c23e3bbee6984ca4da830b1431b8d23b34279b7e7941b83acd6b486c0` |
| `drangulocolumna.com` | `site-explorer/top-pages` | `013a2a0b92597c84417f8bfb9090ac5f955d31f89b740b67824a2c7aeae960ae` |

