# Carrusel de reels de Instagram

El Home y la página de Testimonios muestran los últimos reels del Instagram del
doctor. El feed sale de la API oficial de Instagram, se revalida cada hora y no
usa scripts de terceros: cada tarjeta muestra la portada y el inicio del caption,
y el video se abre en Instagram.

Mientras no haya token configurado, la sección cae en una tarjeta que lleva al
perfil. El sitio nunca se rompe por esto.

## Qué hace falta

- La cuenta `@dr.juancarlosangulo` tiene que ser **Profesional** (Business o
  Creator). Se cambia desde la app: Configuración → Tipo de cuenta.
- Una app en Meta for Developers con acceso a esa cuenta.

## 1. Crear la app en Meta

1. Entrar a https://developers.facebook.com/apps y crear una app nueva.
2. Caso de uso: **Other** → tipo **Business**.
3. En el panel de la app, agregar el producto **Instagram** y elegir
   **API con inicio de sesión de Instagram** (Instagram API with Instagram Login).
4. En esa sección, apartado **Generar token de acceso**, conectar la cuenta del
   doctor y generar el token. Sale un token de larga duración, válido 60 días.
5. Copiar el token. Es un secreto: no va al repo ni por chat abierto.

## 2. Configurar el sitio en Dokploy

Variables de entorno de la aplicación `dr-angulo-website`:

```
INSTAGRAM_ACCESS_TOKEN=<el token del paso 1>
INSTAGRAM_TOKEN_FILE=/data/instagram-token.json
CRON_SECRET=<una cadena larga y aleatoria, por ejemplo `openssl rand -hex 32`>
```

`INSTAGRAM_TOKEN_FILE` tiene que apuntar a un **volumen persistente**, porque ahí
se guarda el token renovado. En Dokploy: Advanced → Volumes → montar un volumen
en `/data`. Sin volumen el sitio sigue andando, pero cada deploy vuelve al token
de la variable de entorno.

Después de guardar las variables, redeployar.

## 3. Renovación automática del token

El token vive 60 días y se extiende otros 60 cada vez que se llama a:

```
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://<dominio>/api/instagram/refresh
```

Programar eso **una vez por semana** (cron de Dokploy o del servidor). Con margen
de sobra: mientras el cron corra al menos una vez cada 60 días, el token no
caduca nunca. La respuesta incluye `expiresAt` para verificar.

Instagram exige que el token tenga al menos 24 horas de vida para renovarlo, así
que la primera corrida conviene dejarla para el día siguiente de generarlo.

## Cómo se comporta

- El feed se cachea 1 hora (`revalidate: 3600`) y las páginas Home y Testimonios
  se regeneran con esa misma frecuencia. Un reel nuevo aparece dentro de la hora.
- Las portadas vienen del CDN de Instagram con URLs firmadas que caducan; por eso
  el feed se refresca seguido. Los dominios permitidos están en `next.config.ts`.
- Se listan los medios con `media_product_type === "REELS"` (o `media_type ===
  "VIDEO"` en publicaciones viejas).
- El clic en un reel dispara el evento `instagram_reel_click` en GA4.

## Archivos

- `src/lib/instagram.ts`: llamadas a la API, token y renovación.
- `src/lib/instagram-shared.ts`: tipos y helpers que también usa el cliente.
- `src/components/instagram/instagram-reels-section.tsx`: sección con título y fallback.
- `src/components/instagram/reels-carousel.tsx`: carrusel accesible (scroll con
  teclado, botones con `aria-label`, respeta `prefers-reduced-motion`).
- `src/app/api/instagram/refresh/route.ts`: endpoint de renovación.
