# Sitio web — Dr. Juan Carlos Angulo Totesaut

## What This Is

Sitio web de marketing y captación de pacientes para el Dr. Juan Carlos Angulo Totesaut, traumatólogo, especialista en ortopedia infantil y cirujano de columna en Lima, Perú. Consulta privada en su consultorio de Surco (Lima Central Tower) y consulta en tres clínicas: Ricardo Palma, Sanna La Molina y Padre Luis Tezza. El sitio debe hacerlo más visible en Google y en redes, y convertir visitantes en citas/consultas reales por WhatsApp y formulario de contacto.

## Core Value

Que un paciente que busca "traumatólogo" / "cirujano de columna" en Lima encuentre el sitio, confíe en el doctor (credenciales, trayectoria, testimonios) y agende una cita por WhatsApp en menos de 2 clics — todo evento de contacto debe quedar rastreado.

## Current Milestone: v1.1 Lanzamiento público y competitividad SEO

**Goal:** Poner el sitio vivo en drangulocolumna.com y llevarlo de "existe" a "compite" en las SERP de Lima para cirugía de columna.

**Target features:**
- Dominio público en Dokploy con HTTPS, apex primario y www redirigido
- Variables de entorno de producción y canonicals apuntando al dominio real
- Páginas por servicio con contenido clínico profundo y `MedicalProcedure`
- Páginas por sede para las cuatro ubicaciones
- Blog expandido de ~200 a 900+ palabras por post
- Schema completo: breadcrumbs, credenciales, horarios, reseñas
- Local SEO: GBP corregido, campaña de reseñas, citaciones
- Search Console verificado con sitemap enviado

**Origen:** auditoría SEO del 2026-08-10 sobre drangulocolumna.com. Detectó que el dominio, comprado el 2026-08-09, servía la página parqueada de Porkbun mientras la ficha de Google Business Profile ya enviaba pacientes ahí.

## Requirements

### Validated

Entregados y verificados en el milestone v1.0 (fases 1-6):

- [x] Home con propuesta de valor, especialidades y CTA de WhatsApp — Fase 1
- [x] Página "Sobre el doctor" con biografía y CV completo (formación con fechas, ocho cargos, once cursos y congresos, cuatro entrenamientos internacionales, CMP 83189 / RNE 35310) — Fases 2 y 5
- [x] Página de Servicios / condiciones tratadas — Fase 2
- [x] Testimonios de pacientes — Fase 3
- [x] Preguntas frecuentes, incluidos miedos comunes sobre cirugía de columna — Fase 3
- [x] Blog/recursos educativos (4 posts) — Fase 4
- [x] Contacto: formulario + dirección + WhatsApp — Fase 3
- [x] Botón flotante de WhatsApp con mensaje prellenado por ubicación de CTA — Fase 1
- [x] Formulario de contacto vía Resend con WhatsApp como fallback — Fase 3
- [x] JSON-LD `Physician` + `FAQPage` — Fase 4
- [x] sitemap.xml + robots.txt dinámicos + metadata por página — Fase 4
- [x] Tracking de eventos GA4 y Meta Pixel con consentimiento previo — Fase 4
- [x] Página de Política de Privacidad — Fase 4
- [x] Identidad visual real del doctor (logo oficial, teal + dorado/mostaza) — Fase 1
- [x] Responsive mobile-first — Fase 1
- [x] Deploy en producción — Fase 4 (Dokploy, no Vercel; ver Key Decisions)
- [x] Cuatro sedes con horarios y página `/agendar` — Fase 6
- [x] Carrusel de reels de Instagram (código completo; el feed vivo espera vinculación de la cuenta) — Fase 5

### Active

Milestone v1.1 — derivados de la auditoría SEO del 2026-08-10:

- [ ] Sitio servido en https://drangulocolumna.com con certificado válido
- [ ] www redirigido al apex en un solo salto, directo a HTTPS
- [ ] `NEXT_PUBLIC_SITE_URL` en producción y fallback de `siteConfig.url` sin referencias a vercel.app
- [ ] Resend operativo con dominio verificado
- [ ] Páginas por servicio: hernia discal, estenosis espinal, escoliosis, ortopedia infantil
- [ ] Páginas por sede para las cuatro ubicaciones, con la de Ricardo Palma como prioritaria
- [ ] Los 4 posts del blog expandidos a 900+ palabras con revisión del doctor
- [ ] `BreadcrumbList`, `MedicalWebPage`, `MedicalProcedure`, `openingHoursSpecification`, `hasCredential`, `AggregateRating`/`Review`
- [ ] Titles ≤60 caracteres e imagen OG propia por página
- [ ] `llms.txt` y limpieza de `dr-angulo-portrait.png`
- [ ] GBP con horario correcto, categorías secundarias y campaña de reseñas hacia 15-20
- [ ] Citaciones NAP consistentes en Doctoralia, CMP y directorios de las cuatro clínicas
- [ ] Search Console verificado con sitemap enviado e indexación confirmada

### Out of Scope

- Sistema de calendario/reservas con selección de horario en vivo — el cliente pidió mantenerlo simple; WhatsApp + formulario son el mecanismo v1 — reconsiderar en v2 si el volumen de citas lo justifica
- Pagos en línea / cobro de consulta — no pedido, consulta se paga presencial
- Portal de paciente / historia clínica — fuera de alcance de un sitio de marketing
- Multi-idioma (inglés) — mercado objetivo es Lima, Perú; reconsiderar en v2
- CMS con panel de administración — contenido se actualiza vía código por ahora (stack simple pedido explícitamente por el cliente)

## Context

- Cliente: Dr. Juan Carlos Angulo Totesaut. CMP 83189 / RNE 35310. Formación: Universidad de Oriente, Núcleo Bolívar. Experiencia: cirujano de columna en Hospital Ruiz y Páez (2007-2009), Clínica San Juan de Dios San Luis (2018-2019), Clínica Montefiori La Molina (dic. 2018 hasta 2026; Juan confirmó el 2026-08-11 que ya NO atiende ahí). Consulta privada, no trabaja con seguros. Consulta particular ~S/130, consulta online ~S/100 (dato de Doctoralia, verificar antes de publicar precio).
- Instagram @dr.juancarlosangulo: 3,429 seguidores, bio "TRAUMATOLOGÍA / ORTOPEDIA INFANTIL / CIRUJANO DE COLUMNA", WhatsApp de contacto 964305682. Contenido: educación al paciente (hernia discal, estenosis, contracturas, miedo a cirugía, postura), historias destacadas: Cirugías, Testimonios, Cervical, Preguntas, Post operado.
- Identidad visual real (extraída de Instagram, ver Key Decisions): logo "JA" monograma con columna vertebral estilizada, paleta teal/turquesa + dorado-mostaza, tipografía sans-serif bold para titulares.
- Competencia directa investigada (médicos individuales de columna en Lima): drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com. Patrón común: WhatsApp flotante, sección de trayectoria/formación, testimonios/reseñas de Google, FAQ, sin sistema de reserva complejo. Ver `.planning/research/COMPETITORS.md`.
- Investigación técnica SEO/schema/tracking en `.planning/research/SEO-TRACKING.md`.
- **Auditoría SEO del 2026-08-10** (origen del milestone v1.1). Datos verificados ese día: drangulocolumna.com servía la página parqueada de Porkbun (openresty/PHP), `site:` con cero resultados indexados, y el GBP del doctor —vivo, 5.0 con 6 reseñas, Av. El Derby 254— ya apuntaba su botón de sitio web y su enlace de reservas a ese dominio parqueado. SERP de "cirujano de columna en Lima": posiciones 1 y 3 son dominios exact-match (cirujanocolumna-elaos.com, drcarranzacolumna.com), el resto son clínicas grandes (Internacional, San Felipe, Anglo Americana, San Juan de Dios) y Doctoralia. Local pack liderado por Centro de Columna Vertebral (5.0, 13 reseñas) y Clínica De La Columna (3.5, 34 reseñas). Related search relevante sin capturar: "traumatologo especialista en columna clínica ricardo palma".
- Horario publicado en el GBP (cerrado lunes a jueves, abierto viernes y sábado 9-17) contradice las cuatro sedes del sitio. Pendiente de corregir con el doctor.
- Juan (cliente que gestiona el proyecto) pidió explícitamente incluir la mayor parte del currículum del doctor (certificaciones, cursos, títulos) — pendiente que el doctor comparta el CV completo; mientras tanto se usa lo verificado públicamente (Doctoralia, LinkedIn).
- Pendiente de Juan/doctor: archivo de logo real (PNG/SVG), CV completo, confirmación de precios de consulta a mostrar (o no mostrar precio).
- **Milestone v1.2 (workstream `seo-keywords`) shipeado el 2026-08-13**, en paralelo a este v1.1: keyword research completo (universo de 5.716 keywords), clusters y 10 de Oro, mapa keyword→URL con matriz de enlazado, y el paquete on-page completo (title, meta, H1, jerarquía, entidades, copy clínico humanizado) para las 24 URLs del sitio. El doctor aprobó los 225 bloques clínicos por escrito (`15-APROBACION-DOCTOR.md`). El handoff autocontenido para implementarlo vive en `.planning/workstreams/seo-keywords/milestones/v1.2-phases/15-paquete-on-page-por-url/15-HANDOFF-V11-ONPAGE.md` — consumido por las fases 8 y 10 de este milestone v1.1. Detalle completo en `.planning/workstreams/seo-keywords/MILESTONES.md`.

## Constraints

- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4, contenido como código (sin CMS) — pedido explícito del cliente de mantenerlo simple
- **Hosting**: Dokploy self-hosted sobre Hetzner (`sapling-vps-01`), la misma infraestructura que juantech y Juan Portfolio. Dominio: drangulocolumna.com, registrado en Porkbun el 2026-08-09
- **Contenido médico**: el texto clínico nuevo se publica sin ronda previa de revisión del doctor, por decisión de Juan del 2026-08-10. La revisión pasa a ser posterior. A cambio, el contenido solo puede apoyarse en fuentes ya verificadas del proyecto (CV confirmado, `src/content/` de v1.0, consenso clínico general no atribuido al doctor), no puede afirmar credenciales, cifras de cirugías, tasas de éxito ni resultados, y cada página lleva aviso de que es información educativa que no reemplaza una consulta. La redacción anterior era "todo texto clínico nuevo pasa por revisión del doctor antes de publicar; contenido YMYL sin validar no se despliega"
- **Datos reales**: no inventar credenciales médicas, cifras de cirugías realizadas ni testimonios — solo usar lo verificado o lo que el doctor confirme
- **Mercado**: Lima, Perú — copy en español neutro/peruano, moneda soles (S/)
- **Cumplimiento**: Ley de Protección de Datos Personales (Perú) — aviso de privacidad antes de cargar GA4/Meta Pixel

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stack: Next.js + Tailwind + Vercel, sin CMS | Cliente pidió "stack super simple"; sitio de marketing de un solo médico no necesita backend complejo | — Pendiente validar tras ver el sitio |
| WhatsApp (964305682) como canal principal de citas, formulario como secundario | Confirmado por Juan; mercado peruano prefiere WhatsApp; evita construir sistema de calendario | ✓ Confirmado por Juan |
| Sede mostrada: Clínica Montefiori, Av. Separadora Industrial 1820, La Molina | Confirmado por Juan como sede principal actual | ✗ **Superado el 2026-08-11: Juan confirmó que el doctor YA NO atiende en Montefiori.** Las sedes vigentes son las cuatro que el sitio publica: consultorio Surco, Clínica Ricardo Palma, Sanna La Molina y Padre Luis Tezza. Cierra la pregunta abierta desde la fase 6 |
| Paleta: teal/turquesa (~#0E8A8C) + dorado-mostaza (~#E8971F) | Extraída directamente de posts e íconos de highlights de Instagram del doctor | — Pendiente afinar tras ver el sitio construido |
| Dominio: subdominio temporal de Vercel por ahora | Juan prefirió probar antes de comprar dominio | ✗ Superado — se compró drangulocolumna.com el 2026-08-09 |
| Deploy en Dokploy self-hosted, no Vercel | Juan usa su propia infraestructura (Hetzner + Dokploy) para el resto de sus proyectos; consistencia operativa | ✓ En producción desde la fase 4 |
| Dominio final: drangulocolumna.com | Coincide con la búsqueda de marca del doctor y con lo que ya apunta su ficha de Google Business Profile | ✓ Registrado, pendiente de apuntar |
| Arquitectura de contenido en silo: una URL por servicio y una por sede | La SERP de Lima está segmentada por condición ("hernia discal", "estenosis") y por clínica; una sola página `/servicios` no compite contra dominios exact-match como drcarranzacolumna.com | — Se valida en v1.1 |
| JSON-LD tipo `Physician` (no LocalBusiness separado) | Recomendación de investigación técnica: Physician ya hereda de MedicalBusiness/LocalBusiness | ✓ |
| Email de formulario vía Resend, con WhatsApp como fallback siempre visible | Investigación: mayoría de pacientes en Perú prefiere WhatsApp; Resend necesita dominio verificado para producción (aún no hay dominio) | — Pendiente activar cuando haya dominio |

---
*Last updated: 2026-08-10 al iniciar el milestone v1.1 (lanzamiento público y competitividad SEO)*

## Evolution

Este documento evoluciona en cada transición de fase y cierre de milestone.

**Después de cada fase:**
1. ¿Requisitos invalidados? → mover a Out of Scope con razón
2. ¿Requisitos validados? → mover a Validated con referencia de fase
3. ¿Nuevos requisitos? → agregar a Active
4. ¿Decisiones nuevas? → agregar a Key Decisions
5. ¿"What This Is" sigue vigente? → actualizar si cambió

**Después de cada milestone:**
1. Revisión completa de todas las secciones
2. Revisar Core Value
3. Auditar Out of Scope
4. Actualizar Context con el estado actual
