# Phase 2: Páginas core y trayectoria - Context

**Gathered:** 2026-07-31
**Status:** Ready for planning
**Mode:** Auto-generated (ejecución directa en modo autónomo, sin discuss interactivo)

<domain>
## Phase Boundary

Todas las páginas de contenido principal del sitio (Home, Servicios, Testimonios, Preguntas Frecuentes, Sobre el doctor) con copy real basado en investigación pública verificable del doctor — sin lorem ipsum ni placeholders. Incluye la página de trayectoria con estructura de CV ampliable.

</domain>

<decisions>
## Implementation Decisions

- Contenido como datos tipados en `src/content/*.ts` (`services.ts`, `testimonials.ts`, `faq.ts`, `cv.ts`), separado de la UI — permite editar el copy sin tocar JSX y reutilizar los mismos datos en la Home (preview) y en la página completa correspondiente.
- 3 categorías de servicio con slugs ancladables (`columna`, `traumatologia`, `ortopedia-infantil`) para poder linkear directo a una sección desde la Home o desde SEO (`/servicios#columna`).
- Testimonios: solo reseñas verificables en fuentes reales (Doctoralia) — decisión deliberada de integridad, documentada con un comentario explícito en `testimonials.ts` para no inventar citas de pacientes. Al momento de construir el sitio solo había 1 reseña pública verificable; queda `reviewLinks.doctoralia` como vía de ampliación cuando lleguen más.
- FAQ con 9 preguntas que cubren tanto dudas prácticas (cómo agendar, qué llevar a la consulta) como objeciones específicas del segmento columna (miedo a la cirugía, tiempo de recuperación) — pedido explícito de CONTENT-04.
- CV/trayectoria: solo credenciales y experiencia verificadas públicamente (Doctoralia/LinkedIn) al momento de construir el sitio, con nota explícita en `cv.ts` y en la página señalando que se ampliará cuando el doctor comparta su CV completo — decisión de no inventar credenciales no verificadas (ver Pending Todos en `.planning/STATE.md`).
- Home prioriza el hero: CTA de WhatsApp + las 3 especialidades visibles sin scroll, antes de cualquier otra sección — pedido explícito del success criteria de la fase.

</decisions>

<code_context>
## Existing Code Insights

Construye sobre la Fase 1: usa el layout global (Header con nav a las 5 páginas de esta fase — Inicio, Sobre el doctor, Servicios, Testimonios, Preguntas frecuentes — más Blog y Contacto de fases posteriores; Footer; WhatsAppFloatButton), los tokens de `globals.css`, y el componente `WhatsAppCta` (`src/components/ui/whatsapp-cta.tsx`) — ya existente porque el Header de Fase 1 lo usa para su propio CTA — junto con `whatsappMessages`/`CtaLocation` de `src/lib/site-config.ts`.

La página de FAQ (`preguntas-frecuentes/page.tsx`) ya importa `FaqJsonLd` de `src/components/structured-data` — ese componente es formalmente parte del alcance SEO-03 de la Fase 3, pero aparece en el archivo porque todo el sitio se construyó en una sola sesión continua (commit único `88b397d`), no fase por fase de forma estrictamente secuencial. No se reclama SEO-03 como entregado en esta fase.

</code_context>

<specifics>
## Specific Ideas

Ver `.planning/research/COMPETITORS.md` (líneas 41 y 53): ninguno de los 3 competidores analizados tiene una página de trayectoria tan completa como la pedida — "CV extenso, certificaciones, cursos" es un diferenciador explícito identificado en la investigación inicial.

</specifics>

<deferred>
## Deferred Ideas

- CV completo del doctor (más cursos, certificaciones, congresos) — pendiente de que el doctor lo comparta; la estructura de `cv.ts` ya está lista para recibirlo sin rediseño (ver Pending Todos en `.planning/STATE.md`).
- Precio de consulta — dato de Doctoralia sin confirmar (~S/130 presencial, ~S/100 online), no se muestra hasta confirmarlo con el doctor.

</deferred>
