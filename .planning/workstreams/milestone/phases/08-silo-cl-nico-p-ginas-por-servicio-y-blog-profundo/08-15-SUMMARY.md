---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 15
subsystem: content
tags: [nextjs, contenido, servicios, escoliosis, renombre-de-url, redirect, seo-onpage, ymyl]

requires:
  - phase: 08-05
    provides: modelo de secciones planas con id/level, campo h1 separado de title y bannerAfterSectionId en ServicePage
provides:
  - "/servicios/escoliosis-y-deformidades publica 2615 palabras de cuerpo con las 19 secciones del paquete de v1.2, 8 de nivel 2 y 11 de nivel 3"
  - "next.config.ts estrena el bloque redirects(), con el 308 permanente de /servicios/escoliosis hacia el slug nuevo"
  - "Ocho enlaces de salida de la matriz de enlazado, todos hacia rutas que ya existen"
affects: [08-14 verificacion de enlazado y segundos 301 del blog, 08-16 hub de servicios, fase 10 title y meta]

tech-stack:
  added: []
  patterns:
    - "El bloque redirects() de next.config.ts nace en este plan. El 08-14 le suma despues los dos 301 del blog dentro del mismo arreglo, no en una funcion nueva."
    - "bannerAfterSectionId vuelve a ser la pieza que salva POS-01, esta vez en una pagina de servicio cuya primera seccion de nivel 2 arrastra cinco subsecciones"

key-files:
  created:
    - src/content/service-pages/escoliosis-y-deformidades.ts
  modified:
    - src/content/service-pages/index.ts
    - next.config.ts
    - scripts/check-content.mjs
    - scripts/check-sedes.mjs

key-decisions:
  - "El export tambien se renombro, de `escoliosis` a `escoliosisYDeformidades`. El plan solo pedia mover el archivo y cambiar el valor de slug, pero los otros tres modulos del silo nombran su export igual que su archivo, y dejar un archivo escoliosis-y-deformidades.ts exportando `escoliosis` habria sido el unico caso raro del directorio."
  - "El banner se anclo a `que-es--escoliosis-dorsal`. Con la posicion por defecto, detras de la primera seccion de nivel 2, caia en el 38.4 por ciento del cuerpo, fuera del rango de 15 a 35 que exige la puerta, porque `que-es` arrastra cinco subsecciones. Con el ancla queda dentro."
  - "describesSurgery se dejo en true. La seccion `cirugia` del paquete describe el acto quirurgico: la artrodesis que abarca varios niveles, la liberacion de los nervios en el mismo tiempo quirurgico y la movilidad que el tramo fijado pierde."
  - "title y description quedaron intactos, igual que en toda la ola 2: los reescribe la fase 10. Lo que cambio es h1, que ahora dice `Escoliosis y deformidades de la columna`, el valor exacto del dataset, con el articulo que el h1 anterior no tenia."
  - "Las secciones con `items` del modulo anterior desaparecieron. El copy aprobado del paquete solo trae parrafos para esta URL, y el protocolo de transcripcion prohibe reordenar o reformatear el texto sellado, asi que las tarjetas de sintomas, complicaciones y diagnostico se fueron con el cuerpo viejo."

requirements-completed: [SVC-03]

metrics:
  duration: 55m
  tasks: 3
  files: 5
  completed: 2026-08-13

status: complete
---

# Fase 8 Plan 15: Escoliosis y deformidades, renombre y cuerpo aprobado

La guia de escoliosis quedo publicada en `/servicios/escoliosis-y-deformidades` con las 2615 palabras del paquete de v1.2, y la URL vieja responde 308 permanente hacia la nueva.

## Lo que se hizo

**Task 1, el renombre y su redireccion (commit `498ec1e`).** `src/content/service-pages/escoliosis.ts` paso a `escoliosis-y-deformidades.ts` con `git mv`, el `slug` cambio de `escoliosis` a `escoliosis-y-deformidades` y el import de `index.ts` se actualizo. La posicion de la pagina dentro de `servicePages` no se movio: ese arreglo ordena las tarjetas del hub y las entradas del sitemap, y un renombre no tiene por que reordenarlas.

`next.config.ts` no tenia bloque de redirecciones. Este plan lo crea con una sola entrada permanente. La forma se leyo de `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md` de la version instalada, Next 16.2.12, que documenta que `permanent: true` emite 308 y no 301, a proposito: el 301 hacia que muchos navegadores convirtieran un POST en GET, y Next usa 307 y 308 para conservar el metodo. Google trata el 308 igual que el 301 a efectos de consolidacion.

Esta tarea no toco el cuerpo. Separar el movimiento de la transcripcion era lo que permitia que, si algo salia mal, el diagnostico fuera inmediato.

**Task 2, el cuerpo aprobado (commit `6b1c2d2`).** Las 19 secciones se transcribieron desde `seo-tools/data/copy-guias.json`, entrada `/servicios/escoliosis-y-deformidades`, siguiendo el protocolo del 08-06: los ids salen del campo `clave` copiado caracter por caracter, el texto del arreglo `parrafos` sin reordenar ni resumir, y las lineas de sello de revision del Markdown no se transcriben porque no existen en el JSON. La autorizacion es `15-APROBACION-DOCTOR.md` del 2026-08-13.

`outboundLinks` recibio las ocho entradas de `internal-links.json` para esta URL: dos hacia guias hermanas, cuatro hacia fichas de sede, una hacia `/agendar` y una hacia el hub. A diferencia del 08-11, todos los destinos ya existen.

**Task 3, las dos puertas (commit `2c330ce`).** La entrada del `MANIFEST` de `check-content.mjs` y el arreglo `SERVICE_SLUGS` de `check-sedes.mjs` apuntan al slug nuevo. `SITEMAP_TOTAL` sigue en 21 y no se toco: el renombre no suma ni resta URLs.

## Verificacion

La redireccion se comprobo con una peticion real contra el sitio construido, no leyendo la configuracion. Como el puerto 3000 estaba ocupado por otro proyecto, el servidor se levanto en el 3117 con `npx next start -p 3117`. La respuesta literal:

```
$ curl -sI http://localhost:3117/servicios/escoliosis
HTTP/1.1 308 Permanent Redirect
location: /servicios/escoliosis-y-deformidades
```

Y el destino responde 200. Siguiendo la redireccion, `curl -L` termina en `http://localhost:3117/servicios/escoliosis-y-deformidades` con codigo 200.

El resto:

- `npx tsc --noEmit`, `npm run lint` y `npm run build` en verde.
- `node scripts/check-content.mjs`: sin fallas en 8 rutas. La de escoliosis pasa con 2615 palabras de cuerpo, por encima de las 2100 que pedia el plan.
- `node scripts/check-sedes.mjs`: sin fallas en 4 sedes.
- `node scripts/check-seo.mjs`: sin fallas, 22 rutas revisadas.
- El sitemap prerenderizado sigue declarando 21 URLs y nombra la ruta nueva, nunca las dos a la vez.
- `.next/server/app/servicios.html` enlaza al slug nuevo. El sitemap, el hub, `llms.txt`, la imagen de Open Graph y el JSON-LD derivan la ruta de `servicePages`, asi que se propagaron sin tocarlos, y se verifico en el build.
- `.next/server/app/servicios/` genera `escoliosis-y-deformidades.html` y ya no genera el HTML del slug viejo.
- `grep -rn 'servicios/escoliosis"' src/ scripts/` no devuelve ninguna linea. `grep -rn '"escoliosis"' src/` tampoco.
- `grep -c "Pendiente de aprobacion"` sobre el modulo devuelve 0: ningun andamiaje del generador de v1.2 llego al HTML.
- Los ocho ids canonicos aparecen en el HTML como destino de ancla y en orden: `que-es`, `sintomas`, `causas`, `diagnostico`, `sin-operar`, `cirugia`, `preguntas-frecuentes`, `cuando-consultar`.
- El `<h1>` prerenderizado dice `Escoliosis y deformidades de la columna`.

## Desviaciones del plan

**1. [Rule 3 - Bloqueo] El puerto 3000 estaba ocupado.** `npm run start` fallo con `EADDRINUSE` porque otro proyecto, un Next con Payload, tenia el puerto tomado. La primera lectura de `curl` devolvio un 404 de ese otro servidor y parecia que la redireccion no funcionaba. Se levanto el servidor en el 3117 en vez de matar un proceso ajeno. Sin cambios en archivos.

**2. [Rule 3 - Bloqueo] La puerta de contenido no reconocia la ruta nueva.** Para verificar la Task 2 hacia falta el `MANIFEST` ya apuntando al slug nuevo, que es trabajo de la Task 3. Se aplicaron los dos cambios de la Task 3 antes de correr la puerta, y se commitearon aparte para no mezclar los commits. El orden de los commits respeta el del plan.

**3. [fuera de alcance] El build emite un warning de Turbopack sobre `next.config.ts`.** Dice `Encountered unexpected file in NFT list`. Se comprobo que es previo a este plan: reconstruyendo con el `next.config.ts` de antes del commit `498ec1e`, el warning aparece igual. No lo introduce el bloque `redirects()`. Queda fuera de alcance.

## Sobre la cifra de los grados

La seccion `que-es` menciona que se habla de escoliosis cuando la desviacion supera los diez grados. El paquete ya lo resolvio en prosa corrida, dentro de un parrafo, sin destacarlo. La puerta bloquea cifras destacadas en encabezado y enfasis fuerte sobre las rutas de servicio, y no reporto nada: el texto entro tal cual y la cifra no quedo resaltada tipograficamente. `paragraphs` es cadena plana sin marcado, asi que estructuralmente no podia quedarlo.

## Lo que hereda la ola 4

El plan 08-16, que crea la guia de cirugia minimamente invasiva y reescribe el hub, recibe:

- `next.config.ts` con el bloque `redirects()` ya existente. Los dos 301 del blog que le tocan al 08-14 entran como entradas del mismo arreglo.
- Un enlace entrante mas: la fila de `/servicios/cirugia-minimamente-invasiva` en `internal-links.json` apunta a `/servicios/escoliosis-y-deformidades` con el anchor `ejercicios para escoliosis`, y ese destino ya resuelve.
- Los tres enlaces salientes que el 08-11 dejo apuntando a rutas inexistentes siguen pendientes: `/servicios/cirugia-minimamente-invasiva` lo crea el 08-16, `/blog/artrosis` el 08-12 y `/blog/lumbalgia` el 08-13.
- `SITEMAP_TOTAL` sigue en 21 en los tres scripts. El 08-16 es el primero que lo mueve.
- El hub de servicios ya enlaza al slug nuevo, asi que su reescritura parte de una ruta correcta.

## Self-Check: PASSED

- `src/content/service-pages/escoliosis-y-deformidades.ts` existe.
- `498ec1e`, `6b1c2d2` y `2c330ce` existen en el historial.
