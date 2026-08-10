# Phase 7: Dominio público, producción y Search Console - Context

**Gathered:** 2026-08-09
**Status:** Ready for planning

<domain>
## Phase Boundary

La fase entrega el sitio del doctor sirviéndose en su dominio propio con una sola dirección canónica, el formulario de contacto entregando correo real, y la propiedad dada de alta en Search Console con el sitemap enviado.

Queda fuera: contenido nuevo, rutas nuevas, schema adicional y cualquier cosa de GA4 o Meta Pixel. El feed de Instagram tampoco entra, aunque su cron dependa de este dominio.

### Estado medido el 2026-08-09, antes de planificar

El ROADMAP describía un dominio parqueado en Porkbun. Ya no es así. Medición directa contra producción:

| Requisito | Estado real | Evidencia |
|-----------|-------------|-----------|
| DOM-01 | Cumplido | `https://drangulocolumna.com` responde 200 con la app Next.js y certificado válido. Nameservers en Cloudflare, DNS proxeado |
| DOM-02 | Incumplido | `https://www.drangulocolumna.com` responde 200 con la página completa, cero redirects. No hay 301 |
| DOM-03 | Cumplido | El HTML en vivo emite `canonical` y `og:url` sobre `https://drangulocolumna.com`, el sitemap lista las 9 rutas con ese origen, `robots.txt` apunta al sitemap correcto y el fallback de `siteConfig.url` ya es el dominio real, sin rastro de vercel.app |
| DOM-04 | Incumplido | El entorno de producción en Dokploy solo tiene `NEXT_PUBLIC_SITE_URL`. Faltan `RESEND_API_KEY`, `EMAIL_FROM` y `CONTACT_EMAIL_TO` |
| DOM-05 | Incumplido | Sin propiedad en Search Console y sin sitemap enviado |

La causa del DOM-02: Dokploy tiene los dos hostnames registrados sobre la misma aplicación (`drangulocolumna.com` y `www.drangulocolumna.com`, puerto 3000, HTTPS), así que Traefik sirve la app para cualquiera de los dos Host. El CNAME de `www` al apex es alias de DNS y no produce redirección HTTP.

El trabajo real de la fase se reduce a tres frentes: la redirección de `www`, el correo de Resend y Search Console.

</domain>

<decisions>
## Implementation Decisions

### Dominio y DNS

- El DNS ya está resuelto y no se toca. Nameservers en Cloudflare, registros correctos, sitio alcanzable desde internet.
- Dominio canónico: el apex `https://drangulocolumna.com`. Es a donde ya apuntan el GBP y el enlace de reservas del doctor.
- Cloudflare queda con el proxy activo. El certificado del origen es válido de todos modos, así que sacar el proxy no aporta nada.
- El `domain.create` en Dokploy ya está hecho para los dos hostnames. No hay que crear nada, en todo caso quitar.
- Si la máquina local de Juan no resuelve el dominio es caché de resolver, no un problema del sitio. Desde resolvers públicos y otros dispositivos responde bien.

### Redirección www

- El 301 vive en una Redirect Rule de Cloudflare, al borde. Es lo único que manda `http://www` y `https://www` a `https://drangulocolumna.com` en un solo salto sin pasar por HTTP, porque Always Use HTTPS de Cloudflare dispara antes que cualquier middleware del origen.
- La regla la crea Juan en el panel, con instrucciones exactas paso a paso. Si prefiere pasar un token de API de Cloudflare con permiso sobre Rules de la zona, la ejecuta el agente.
- Se quita `www.drangulocolumna.com` de los dominios de la aplicación en Dokploy. Con la regla al borde nunca llega tráfico a ese host y dejarlo solo mantiene un certificado que nadie usa.
- Se agrega un middleware mínimo en el repo que redirige `www` al apex con 301, como respaldo. Cubre el caso de que alguien desactive el proxy de Cloudflare o mueva el DNS.

### Correo transaccional

- Resend verifica el dominio apex `drangulocolumna.com`. Los registros SPF y DKIM que entregue Resend van cargados en Cloudflare.
- Remitente: `Dr. Juan Angulo <web@drangulocolumna.com>`.
- Juan crea la cuenta de Resend y la API key. El agente carga `RESEND_API_KEY`, `EMAIL_FROM` y `CONTACT_EMAIL_TO` en Dokploy vía `application.saveEnvironment` seguido de `application.deploy`.
- La casilla destino todavía no existe. Es dato pendiente de Juan y bloquea la verificación de DOM-04, no la planificación.
- Se corrige el fallo silencioso de `submitContactForm`: hoy, si falta `CONTACT_EMAIL_TO` o si Resend falla, la función devuelve éxito y no envía nada ni deja rastro. Debe quedar registrado en el log del servidor. Lo que ve el paciente no cambia: éxito con el fallback de WhatsApp ya armado.

### Search Console e indexación

- Propiedad de dominio sobre `drangulocolumna.com`, no de prefijo de URL. Cubre apex, www, http y https en una sola y no se rompe cuando entre la redirección.
- Verificación por registro `TXT` en Cloudflare, que es el único método admitido para propiedad de dominio.
- La crea Juan con la cuenta de Google que corresponda. El agente entrega el TXT a pegar y confirma la propagación con `dig` antes de que Juan pulse Verificar.
- La fase cierra con propiedad verificada, sitemap enviado y las 9 rutas devolviendo 200 e indexables. La confirmación de que Google efectivamente las indexó queda como seguimiento posterior, porque tarda de días a semanas y no depende del equipo.

### Claude's Discretion

- Forma exacta del middleware de respaldo y su `matcher`.
- Cómo se registra el fallo de envío del formulario, mientras quede visible en el log del servidor y no altere la respuesta al paciente.
- Orden de ejecución dentro de la fase, respetando que Search Console va después de que la redirección esté activa.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/lib/site-config.ts` centraliza `url`, NAP, credenciales y mensajes de WhatsApp. `url` sale de `NEXT_PUBLIC_SITE_URL` con fallback ya correcto a `https://drangulocolumna.com`. `email` sale de `CONTACT_EMAIL_TO` con fallback a cadena vacía, que es la raíz del fallo silencioso.
- `src/lib/resend.ts` expone el cliente como `null` cuando falta `RESEND_API_KEY`, y `EMAIL_FROM` con fallback a `onboarding@resend.dev`.
- `src/app/sitemap.ts` y `src/app/robots.ts` derivan todo de `siteConfig.url`. No requieren cambios.
- `src/app/actions/contact.ts` valida con Zod, tiene honeypot y arma el mensaje de WhatsApp de respaldo.

### Established Patterns

- Next.js 16 con App Router. Metadata API por página, sin librería de SEO.
- Configuración por variable de entorno con fallback seguro, nunca fallo duro en runtime.
- El envío de correo se trata como extra sobre WhatsApp, que es el canal principal de citas.
- No hay `middleware.ts` en el repo todavía. Sería el primero.
- `next.config.ts` es mínimo, solo `remotePatterns` de imágenes para el CDN de Instagram.

### Integration Points

- Dokploy, proyecto `client-dr-angulo`, `applicationId` `29ZFzVVwEczNI733DodMp`, appName `dr-angulo-website-nqscdc`. API accesible con el token de `infra/dokploy/.env` del repo `hosting`. Rutas usadas: `application.one`, `application.saveEnvironment`, `application.deploy`, `domain.delete`.
- Cloudflare gestiona la zona. Ahí van la Redirect Rule, el TXT de Search Console y los registros SPF y DKIM de Resend. No hay token de API disponible hoy.
- El repo despliega desde `github.com/Sve-nnN/dr-angulo-website` con build Nixpacks.

</code_context>

<specifics>
## Specific Ideas

- El GBP del doctor y su enlace de reservas ya apuntan al apex. Cualquier decisión de canonicalización tiene que respetar esa dirección para no romper el tráfico que ya llega.
- Cerrar esta fase desbloquea la verificación humana diferida de la fase 4 de v1.0 (INFRA-03) y habilita el cron por HTTPS del feed de Instagram.
- La medición previa vale más que el ROADMAP: antes de planificar cualquier tarea de esta fase conviene verificar el estado en producción, porque el ROADMAP se escribió sobre una foto del 2026-08-10 que ya quedó vieja.

</specifics>

<deferred>
## Deferred Ideas

- `NEXT_PUBLIC_GA_ID` y `NEXT_PUBLIC_META_PIXEL_ID`: no entran acá. Van cuando Juan tenga las cuentas, y la medición es tema de la fase 11.
- Variables del feed de Instagram (`INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_TOKEN_FILE`, `CRON_SECRET`) y el cron semanal: pertenecen al cierre de la fase 5 de v1.0.
- Confirmación de indexación de las 9 rutas en Search Console: seguimiento posterior al cierre de la fase.
- Buzón real en `contacto@drangulocolumna.com`: se descartó por ahora, se usa una casilla existente como destino.

</deferred>
