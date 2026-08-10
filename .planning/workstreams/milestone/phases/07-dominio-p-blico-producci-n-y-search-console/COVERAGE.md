# API Coverage: fase 07

**Generado:** 2026-08-10
**Detector:** `gsd-core/bin/lib/api-coverage.cjs` (detected: true)

La fase integra cuatro servicios externos, pero toca a proposito una franja muy estrecha de cada uno. Casi todo queda en `OPT-OUT` con una razon de una linea. No se inventan filas para capacidades con las que la fase no tiene relacion.

## Cloudflare (zona drangulocolumna.com)

| Capacidad | Estado | Razon |
|-----------|--------|-------|
| Redirect Rules (Single Redirects) | COVERED | Es el mecanismo del 301 de www al apex (D-02), plan 07-02 tarea 1 |
| DNS Records (TXT, MX) | COVERED | Registros de Resend (plan 07-04) y TXT de verificacion de Google (plan 07-05) |
| Always Use HTTPS | OPT-OUT | Ya esta activo y funciona; el click path prohibe tocarlo |
| Proxy de zona (nube naranja) | OPT-OUT | D-01 fija dejar el proxy como esta; el certificado del origen es valido igual |
| API de Cloudflare | OPT-OUT | No hay token disponible; todo el trabajo de Cloudflare es manual con click path |
| Page Rules, Transform Rules, Workers, WAF, Cache Rules | OPT-OUT | La fase no tiene relacion con reescritura, cache, computo al borde ni reglas de seguridad |

## Resend

| Capacidad | Estado | Razon |
|-----------|--------|-------|
| Domains: add y verify | COVERED | Verificacion del apex, plan 07-04 tarea 1 |
| API Keys: create con permiso de envio | COVERED | Clave acotada al dominio, plan 07-04 tarea 1 |
| Emails: send | COVERED | Ya integrado desde v1.0 en `src/app/actions/contact.ts`; la fase lo pone a funcionar de verdad |
| Webhooks de eventos de entrega | OPT-OUT | Ninguna fuente lo pide. Sin sistema que consuma rebotes ni quejas. Candidato a seguimiento posterior |
| Audiences, Broadcasts, Contacts | OPT-OUT | El sitio no hace envio masivo ni newsletter |
| Idempotency keys, scheduling, attachments | OPT-OUT | El formulario envia un correo transaccional simple, sin adjuntos ni programacion |

## Dokploy

| Capacidad | Estado | Razon |
|-----------|--------|-------|
| `application.one` | COVERED | Lectura de estado, dominios y entorno en 07-01, 07-02 y 07-04 |
| `application.saveEnvironment` | COVERED | Carga de las tres variables de correo, plan 07-04 tarea 2 |
| `application.deploy` | COVERED | Redespliegue tras cambios de codigo y de entorno |
| `application.readLogs` | COVERED | Comprobacion de las trazas de fallo del formulario, plan 07-04 tarea 3 |
| `domain.delete` | COVERED | Retiro del hostname de www, plan 07-02 tarea 2 |
| `docker.getContainers` | COVERED | Control de crash loop despues de cada despliegue |
| `domain.create` | OPT-OUT | Los dominios ya existen; la fase quita, no agrega |
| `application.saveBuildType`, `saveGithubProvider` | OPT-OUT | La aplicacion ya esta cableada con Nixpacks y webhook de GitHub, funcionando |
| Routers de base de datos (postgres, mysql, redis, mongo, mariadb) | OPT-OUT | El proyecto no tiene base de datos |
| `backup`, `cluster`, `schedule`, `security`, `registry` | OPT-OUT | Fuera del alcance de la fase; nada en las fuentes los pide |

## Google Search Console

| Capacidad | Estado | Razon |
|-----------|--------|-------|
| Propiedad de tipo Dominio con verificacion por TXT | COVERED | Plan 07-05 tarea 1 (D-07) |
| Envio de sitemap | COVERED | Plan 07-05 tarea 3 |
| Informe de cobertura e indexacion | OPT-OUT | D-08 difiere explicitamente la confirmacion de indexacion como seguimiento posterior |
| Inspeccion de URL, solicitud de indexacion | OPT-OUT | No es criterio de cierre y no acelera nada de forma confiable |
| Search Console API | OPT-OUT | Exige credenciales de Google Cloud que no existen; todo el trabajo es manual con click path |
| Informes de rendimiento, enlaces, experiencia de pagina | OPT-OUT | Requieren datos historicos que aun no existen; corresponden a fases posteriores |
| Eliminaciones, Core Web Vitals, datos estructurados | OPT-OUT | Fuera del alcance; el schema es tema de la fase 10 |

## Nota

La fase no instala ningun paquete y no modifica `package.json` ni `package-lock.json`, asi que el gate de legitimidad de paquetes no aplica en ninguno de los cinco planes.
