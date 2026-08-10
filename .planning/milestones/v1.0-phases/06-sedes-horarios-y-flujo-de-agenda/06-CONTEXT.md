# Phase 6: Sedes, horarios y flujo de agenda - Context

**Gathered:** 2026-08-09
**Status:** Executed (backfill de documentación tras ejecución directa)
**Mode:** Auto-generated (ejecución directa en sesión con Juan, sin discuss interactivo)

<domain>
## Phase Boundary

Publicar las cuatro sedes reales donde atiende el doctor con sus horarios, y reemplazar el CTA único de WhatsApp por un flujo de agenda que dirige a cada paciente al canal correcto de la sede que elija.

Fuera de la fase: sistema de reservas propio, integración con las agendas de las clínicas, precios de consulta.

</domain>

<decisions>
## Implementation Decisions

- **El problema a resolver no era de contenido sino de expectativas.** Yuly reportó que los pacientes escriben al WhatsApp pensando que desde ahí se agenda en las clínicas. El sitio empujaba a eso: todos los CTA iban directo al chat. La fase cambia el CTA principal a una página de sedes y deja el WhatsApp explícitamente acotado al consultorio privado.
- **Página `/agendar` como destino del botón general**, con las sedes separadas en dos bloques ("Agenda el doctor" contra "Agenda la clínica") y un aviso destacado arriba. La distinción se repite en cada tarjeta para que funcione aunque el paciente entre por un ancla o escanee la página.
- **Clínica Montefiori sale del sitio.** El listado que pasó el consultorio el 2026-08-09 no la incluye. Como el sitio no puede publicar sedes que no estén confirmadas, se reemplazó por las cuatro actuales. Queda pendiente que Juan confirme si Montefiori se cerró o solo quedó fuera del listado.
- **El NAP principal pasa a ser el consultorio privado** (Av. El Derby 254, piso 24, oficina 2403, Surco). Es la única dirección cuya agenda maneja el doctor, así que es la que corresponde en el JSON-LD, el footer y la página de contacto. Las tres clínicas entran como `hospitalAffiliation`, cada una con su dirección.
- **Datos de contacto de las clínicas verificados, no inventados.** Teléfonos, direcciones y coordenadas salen de la ficha oficial de cada clínica en Google (SerpAPI): Ricardo Palma (01) 224 2224, Sanna (01) 635 5000, Tezza (01) 610 5050. Los enlaces de agenda apuntan al dominio oficial de cada institución.
- **`/contacto` deja de ser la página de citas** y queda como el formulario para casos escritos, más el consultorio privado. La página de citas es `/agendar`.
- **El botón flotante de WhatsApp se mantiene** para consultas generales: no todo el que escribe quiere agendar en una clínica.

</decisions>

<code_context>
## Existing Code Insights

`siteConfig.clinic` (Montefiori) era el NAP único y estaba cableado en Home, Contacto, Sobre el doctor, footer y JSON-LD. Se renombró a `siteConfig.office` con los datos del consultorio privado, y las cuatro sedes viven en `src/content/locations.ts`, que es la fuente de verdad para la página de agenda, el resumen del Home, la tabla semanal y el `hospitalAffiliation` del schema.

El CTA de header y hero usaba `WhatsAppCta` (client component con tracking). Ahora esos dos puntos son `Link` a `/agendar` con el mismo estilo de botón acento; `WhatsAppCta` sigue en el footer, el botón flotante, la página de contacto y la tarjeta del consultorio privado.

</code_context>

<specifics>
## Specific Ideas

Mensajes de Yuly Ramirez (2026-08-09) con el listado de consultorios y horarios, y el pedido explícito de "un botón general de Agendar cita que lleve a una sección donde el paciente elija dónde desea atenderse".

</specifics>

<deferred>
## Deferred

- **Confirmar el estado de Clínica Montefiori**: si sigue atendiendo ahí, hay que sumarla a `locations.ts`; si no, conviene actualizar también su perfil de Doctoralia, que todavía la menciona.
- **Horario del consultorio privado**: hoy dice "viernes y sábados, horario coordinado al agendar" porque no se pasaron horas exactas.
- **Enlaces profundos a la ficha del doctor** en las webs de cada clínica, si es que existen: hoy los enlaces llevan al agendador general y el paciente tiene que buscarlo por nombre.

</deferred>
