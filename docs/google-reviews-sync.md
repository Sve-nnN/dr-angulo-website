# Reseñas de Google: sincronización con Business Profile

El sitio muestra la calificación y las reseñas de la ficha de Google del consultorio en la portada y en `/testimonios`. La fuente preferida es una copia que envía un trabajo diario con la API de **Business Profile**, que devuelve todas las reseñas. Si esa copia no existe o venció, el sitio usa la API de Places (cinco reseñas, necesita clave con facturación). Si tampoco hay Places, la sección muestra solo la invitación a dejar una reseña.

## Por qué no se usa el token de Google dentro del sitio

El token de Business Profile tiene el alcance `business.manage`: permite editar la ficha y responder reseñas, y no existe una versión de solo lectura. Si viviera en las variables del sitio, una filtración dejaría a un tercero administrar la ficha. Por eso el token se queda en un servidor propio, que corre `scripts/sync-google-reviews.mjs`, y al sitio solo llega el resultado público.

```
servidor propio ──(token de Google)──▶ API Business Profile
       │
       └─(solo reseñas públicas + secreto propio)──▶ POST /api/reviews/sync ──▶ /data/google-reviews.json
```

## Piezas

| Pieza | Dónde | Qué hace |
|---|---|---|
| `scripts/sync-google-reviews.mjs` | Servidor propio | Lee todas las reseñas y las envía al sitio |
| `src/app/api/reviews/sync/route.ts` | Sitio | Recibe el envío, lo valida con Zod y lo guarda |
| `src/lib/google-reviews-snapshot.ts` | Sitio | Lee y escribe el archivo, con vencimiento de 45 días |
| `src/lib/google-reviews.ts` | Sitio | Elige la fuente: copia, luego Places, luego nada |

## Variables

**En el sitio (Dokploy):**

| Variable | Para qué |
|---|---|
| `REVIEWS_SYNC_SECRET` | Secreto del endpoint. No da ningún permiso en Google: solo permite reemplazar el archivo de reseñas. Sin él, el endpoint rechaza todo |
| `REVIEWS_SNAPSHOT_FILE` | Opcional. Por defecto `/data/google-reviews.json` |

Hace falta un **volumen persistente montado en `/data`**, el mismo que usa el token de Instagram. Sin volumen el sitio funciona, pero cada deploy borra la copia hasta el siguiente envío.

**En el servidor propio (archivo `sync.conf` con permisos 600, nunca en el repo):**

| Variable | Para qué |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | Cliente OAuth |
| `GBP_AGENCY_REFRESH_TOKEN` | Token de la cuenta que administra la ficha |
| `GBP_ACCOUNT_ID`, `GBP_LOCATION_ID` | Salen de `--discover` |
| `REVIEWS_SYNC_SECRET` | El mismo valor que tiene el sitio |
| `REVIEWS_SYNC_URL` | Opcional. Por defecto `https://drangulocolumna.com/api/reviews/sync` |

## Puesta en marcha

1. Generar el secreto: `openssl rand -hex 32`. El mismo valor va en Dokploy y en el servidor propio.
2. Montar el volumen `/data` en la aplicación de Dokploy y redesplegar.
3. En el servidor propio, con Node 18 o más nuevo y el archivo de entorno cargado:
   - `node scripts/sync-google-reviews.mjs --discover` lista las cuentas y ubicaciones con sus IDs. Se copian `GBP_ACCOUNT_ID` y `GBP_LOCATION_ID` de la ficha del doctor.
   - `node scripts/sync-google-reviews.mjs --dry-run` arma el envío y muestra el resumen sin enviar nada.
   - `node scripts/sync-google-reviews.mjs` sincroniza.
4. Crear `run.sh` junto al script (carga `sync.conf` y ejecuta el script) y programarlo una vez al día:

```
#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
set -a; . ./sync.conf; set +a
echo "[$(date -u +%FT%TZ)] inicio"
node sync-google-reviews.mjs
echo "[$(date -u +%FT%TZ)] fin (código $?)"
```

```
20 7 * * * flock -n /tmp/reviews-sync.lock /ruta/reviews-sync/run.sh >> /ruta/reviews-sync/sync.log 2>&1
```

## Cómo se comporta

- El script nunca imprime tokens ni el cuerpo de las respuestas de Google.
- Se guardan solo las reseñas con texto, con el autor, las estrellas, el texto original (Google agrega "(Translated by Google)" con la traducción, y el script la descarta en sus dos formatos) y la fecha. Las reseñas sin texto cuentan en el total pero no se listan.
- Una reseña de un usuario anónimo aparece como "Paciente de Google".
- El endpoint rechaza cuerpos de más de 600 KB, JSON inválido y cualquier formato que no cumpla el esquema.
- Cada envío exitoso marca la portada y `/testimonios` para regenerarse en la próxima visita.
- Si el servidor propio se apaga, el sitio sigue mostrando la última copia durante 45 días. Pasado ese tiempo la descarta y baja al respaldo.

## Verificación

```
curl -H "Authorization: Bearer $CRON_SECRET" https://drangulocolumna.com/api/reviews/status
```

Ese diagnóstico informa si la clave de Places está configurada y qué devuelve Google. Para el flujo de Business Profile basta con abrir `/testimonios` y comprobar que aparezcan las reseñas. Si el script falla con `Token has been expired or revoked`, el token de renovación caducó: con la pantalla de consentimiento de OAuth en "Pruebas" dura 7 días, así que hay que publicarla y generar un token nuevo con el OAuth Playground.

## Términos de Google

Las reseñas se muestran con el nombre del autor y se enlazan a la ficha para ver todas. Son las de la ficha propia del consultorio. El sitio no marca `AggregateRating` ni `Review` en el schema: las reseñas son de un tercero y no son elegibles.
