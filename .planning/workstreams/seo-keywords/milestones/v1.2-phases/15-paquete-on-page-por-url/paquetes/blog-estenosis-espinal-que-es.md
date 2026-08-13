# Paquete on-page: /blog/estenosis-espinal-que-es

<!-- Generado por seo-tools/src/phase15/paquete.ts desde data/onpage.json y data/url-map.jsonl.
     No se edita a mano: se regenera. -->

## Qué hay que hacer con esta URL

| Campo | Valor |
| --- | --- |
| URL | `/blog/estenosis-espinal-que-es` |
| Acción | redirigir |
| Formato | documento corto |
| Keyword primaria | sin primaria, y es una decisión medida de la fase 14 |
| Redirige a | `/servicios/estenosis-espinal` |

<!-- copy:inicio -->

Esta URL se apaga con una redirección 301 permanente hacia `/servicios/estenosis-espinal`.

No recibe title, meta ni H1 propios. El paquete que hay que implementar es el de `/servicios/estenosis-espinal`.

<!-- copy:fin -->

## La redirección

| Campo | Valor |
| --- | --- |
| Origen | `/blog/estenosis-espinal-que-es` |
| Destino | `/servicios/estenosis-espinal` |
| Tipo | 301 permanente |

La URL se apaga con un 301 hacia /servicios/estenosis-espinal y no recibe title, meta ni H1 propios (D-07). El paquete que hay que implementar es el del destino.

El orden no es indistinto: primero se publica la guía de destino con el contenido ya
fundido y después se pone la redirección. Al revés, el 301 entierra material que todavía
no vive en ningún otro lado.

### Qué se absorbió y dónde quedó

Bloque por bloque, para poder comprobar que no se perdió nada sin volver a abrir el post.

| Bloque del post que se apaga | Dónde quedó en la guía |
| --- | --- |
| src/content/blog.ts, estenosis-espinal-que-es, intro | que-es |
| src/content/blog.ts, estenosis-espinal-que-es, sección por-que-aparece-con-la-edad | causas |
| src/content/blog.ts, estenosis-espinal-que-es, sección la-senal-que-mas-orienta | sintomas |
| src/content/blog.ts, estenosis-espinal-que-es, sección como-se-siente-en-el-dia-a-dia | sintomas |
| src/content/blog.ts, estenosis-espinal-que-es, sección que-se-pregunta-en-la-consulta | diagnostico |
| src/content/blog.ts, estenosis-espinal-que-es, sección que-registrar-antes-de-la-cita | sin-operar--estenosis-espinal-cuidado-personal y cuando-consultar |
| src/content/blog.ts, estenosis-espinal-que-es, sección como-se-trata | sin-operar y sin-operar--tratamientos-de-la-estenosis-espinal |
| src/content/blog.ts, estenosis-espinal-que-es, ctaBanner sobre caminar menos que antes | cuando-consultar |
| src/content/blog.ts, estenosis-espinal-que-es, remisiones a la guía completa que el post hace dos veces | no se transcriben: la guía completa pasa a ser esta página, así que la remisión pierde destino |

## Por qué esta URL no compite

Escrito en la fase 14 y transcrito acá sin tocarlo. No es una omisión: es una decisión
medida, y quien implemente esta URL merece leer el motivo sin abrir otro archivo (D-14).

Se funde con la guia de estenosis espinal y redirige, asi que no pelea ninguna consulta. El post no compite con la guia: la anticipa, y lo dice el propio texto publicado dos veces (`src/content/blog.ts:291` y `:309` remiten a la guia completa).
