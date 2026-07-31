# Sitio web — Dr. Juan Carlos Angulo Totesaut

## What This Is

Sitio web de marketing y captación de pacientes para el Dr. Juan Carlos Angulo Totesaut, traumatólogo, especialista en ortopedia infantil y cirujano de columna en Lima, Perú (consulta privada, atiende en Clínica Montefiori, La Molina). El sitio debe hacerlo más visible en Google y en redes, y convertir visitantes en citas/consultas reales por WhatsApp y formulario de contacto.

## Core Value

Que un paciente que busca "traumatólogo" / "cirujano de columna" en Lima encuentre el sitio, confíe en el doctor (credenciales, trayectoria, testimonios) y agende una cita por WhatsApp en menos de 2 clics — todo evento de contacto debe quedar rastreado.

## Requirements

### Validated

(Ninguno aún — proyecto greenfield, se valida al publicar)

### Active

- [ ] Home con propuesta de valor, especialidades (traumatología, ortopedia infantil, cirugía de columna) y CTA de WhatsApp
- [ ] Página "Sobre el doctor" con biografía y trayectoria/CV extenso (formación, certificaciones, cursos, colegiatura CMP/RNE, experiencia hospitalaria)
- [ ] Página de Servicios / condiciones tratadas
- [ ] Testimonios de pacientes
- [ ] Preguntas frecuentes (incluye miedos comunes: cirugía de columna, recuperación)
- [ ] Blog/recursos educativos (SEO, contenido propio basado en su Instagram)
- [ ] Contacto: formulario + mapa/dirección de Clínica Montefiori + WhatsApp
- [ ] Botón flotante de WhatsApp en todo el sitio con mensaje prellenado
- [ ] Formulario de contacto que envía email (Resend) y/o deriva a WhatsApp
- [ ] JSON-LD (Physician + FAQPage) para SEO/Knowledge Graph
- [ ] sitemap.xml + robots.txt + metadata por página (Next.js Metadata API)
- [ ] Tracking de eventos: clic WhatsApp (por ubicación de CTA) y envío de formulario, en GA4 y Meta Pixel
- [ ] Página de Política de Privacidad (aviso de cookies/datos personales — Perú)
- [ ] Diseño con identidad visual real del doctor (logo JA, teal + dorado/mostaza, ver Key Decisions)
- [ ] Responsive mobile-first, Core Web Vitals cuidados
- [ ] Deploy en Vercel

### Out of Scope

- Sistema de calendario/reservas con selección de horario en vivo — el cliente pidió mantenerlo simple; WhatsApp + formulario son el mecanismo v1 — reconsiderar en v2 si el volumen de citas lo justifica
- Pagos en línea / cobro de consulta — no pedido, consulta se paga presencial
- Portal de paciente / historia clínica — fuera de alcance de un sitio de marketing
- Multi-idioma (inglés) — mercado objetivo es Lima, Perú; reconsiderar en v2
- CMS con panel de administración — contenido se actualiza vía código por ahora (stack simple pedido explícitamente por el cliente)

## Context

- Cliente: Dr. Juan Carlos Angulo Totesaut. CMP 83189 / RNE 35310. Formación: Universidad de Oriente, Núcleo Bolívar. Experiencia: cirujano de columna en Hospital Ruiz y Páez (2007-2009), Clínica San Juan de Dios San Luis (2018-2019), Clínica Montefiori La Molina (desde dic. 2018, sede actual). Consulta privada, no trabaja con seguros. Consulta particular ~S/130, consulta online ~S/100 (dato de Doctoralia, verificar antes de publicar precio).
- Instagram @dr.juancarlosangulo: 3,429 seguidores, bio "TRAUMATOLOGÍA / ORTOPEDIA INFANTIL / CIRUJANO DE COLUMNA", WhatsApp de contacto 964305682. Contenido: educación al paciente (hernia discal, estenosis, contracturas, miedo a cirugía, postura), historias destacadas: Cirugías, Testimonios, Cervical, Preguntas, Post operado.
- Identidad visual real (extraída de Instagram, ver Key Decisions): logo "JA" monograma con columna vertebral estilizada, paleta teal/turquesa + dorado-mostaza, tipografía sans-serif bold para titulares.
- Competencia directa investigada (médicos individuales de columna en Lima): drcarranzacolumna.com, drciezatraumatologia.com, cirujanocolumna-elaos.com. Patrón común: WhatsApp flotante, sección de trayectoria/formación, testimonios/reseñas de Google, FAQ, sin sistema de reserva complejo. Ver `.planning/research/COMPETITORS.md`.
- Investigación técnica SEO/schema/tracking en `.planning/research/SEO-TRACKING.md`.
- Juan (cliente que gestiona el proyecto) pidió explícitamente incluir la mayor parte del currículum del doctor (certificaciones, cursos, títulos) — pendiente que el doctor comparta el CV completo; mientras tanto se usa lo verificado públicamente (Doctoralia, LinkedIn).
- Pendiente de Juan/doctor: archivo de logo real (PNG/SVG), CV completo, confirmación de precios de consulta a mostrar (o no mostrar precio).

## Constraints

- **Stack**: Next.js (App Router) + TypeScript + Tailwind CSS, contenido como código (sin CMS) — pedido explícito del cliente de mantenerlo simple
- **Hosting**: Vercel, subdominio temporal *.vercel.app hasta definir dominio final
- **Datos reales**: no inventar credenciales médicas, cifras de cirugías realizadas ni testimonios — solo usar lo verificado o lo que el doctor confirme
- **Mercado**: Lima, Perú — copy en español neutro/peruano, moneda soles (S/)
- **Cumplimiento**: Ley de Protección de Datos Personales (Perú) — aviso de privacidad antes de cargar GA4/Meta Pixel

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stack: Next.js + Tailwind + Vercel, sin CMS | Cliente pidió "stack super simple"; sitio de marketing de un solo médico no necesita backend complejo | — Pendiente validar tras ver el sitio |
| WhatsApp (964305682) como canal principal de citas, formulario como secundario | Confirmado por Juan; mercado peruano prefiere WhatsApp; evita construir sistema de calendario | ✓ Confirmado por Juan |
| Sede mostrada: Clínica Montefiori, Av. Separadora Industrial 1820, La Molina | Confirmado por Juan como sede principal actual | ✓ Confirmado por Juan |
| Paleta: teal/turquesa (~#0E8A8C) + dorado-mostaza (~#E8971F) | Extraída directamente de posts e íconos de highlights de Instagram del doctor | — Pendiente afinar tras ver el sitio construido |
| Dominio: subdominio temporal de Vercel por ahora | Juan prefirió probar antes de comprar dominio | — Pendiente definir dominio final |
| JSON-LD tipo `Physician` (no LocalBusiness separado) | Recomendación de investigación técnica: Physician ya hereda de MedicalBusiness/LocalBusiness | ✓ |
| Email de formulario vía Resend, con WhatsApp como fallback siempre visible | Investigación: mayoría de pacientes en Perú prefiere WhatsApp; Resend necesita dominio verificado para producción (aún no hay dominio) | — Pendiente activar cuando haya dominio |

---
*Last updated: 2026-07-31 after initialización del proyecto*

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
