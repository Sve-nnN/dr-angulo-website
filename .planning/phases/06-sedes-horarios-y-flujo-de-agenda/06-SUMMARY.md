---
phase: 06-sedes-horarios-y-flujo-de-agenda
plan: 06-01
subsystem: sedes-y-agenda
tags: [sedes, horarios, agenda, whatsapp, nap, schema, local-seo]
provides:
  - Las cuatro sedes del doctor publicadas con días, horarios y canal de agenda
  - Página /agendar como destino del botón general de "Agendar cita"
  - Distinción explícita entre la agenda del doctor y la de cada clínica
  - NAP principal en el consultorio privado, con las tres clínicas como afiliación en el JSON-LD
affects: []
tech-stack:
  added: []
  patterns: ["locations.ts como fuente de verdad de sedes para páginas, resumen del Home y schema", "CTA principal a página de elección en vez de enlace directo a WhatsApp"]
key-files:
  created: [src/content/locations.ts, src/app/agendar/page.tsx, src/components/locations/location-card.tsx]
  modified: [src/lib/site-config.ts, src/components/layout/header.tsx, src/components/layout/footer.tsx, src/app/page.tsx, src/app/contacto/page.tsx, src/content/faq.ts, src/content/cv.ts, src/components/structured-data.tsx, src/app/sitemap.ts]
key-decisions: ["El WhatsApp queda acotado al consultorio privado, con aviso explícito", "Montefiori sale del sitio porque no está en el listado que pasó el consultorio", "NAP principal pasa al consultorio privado de Surco", "Teléfonos y direcciones de clínicas verificados contra su ficha oficial"]
duration: ~70min
completed: 2026-08-09
status: complete
---

# Phase 6: Sedes, horarios y flujo de agenda Summary

**El sitio deja de mandar todo al mismo WhatsApp: ahora publica las cuatro sedes con sus horarios y lleva a cada paciente al canal de agenda que corresponde a la sede que elige.**

## Performance
- **Duration:** ~70min
- **Tasks:** 3 completadas
- **Files modified:** 12 (3 creados)

## El problema que resuelve

Yuly reportó que los pacientes escriben al WhatsApp del doctor pensando que desde ahí se agenda en las clínicas. El sitio alimentaba esa confusión: header, hero y cierre mandaban todos al mismo chat, y la única sede publicada era Clínica Montefiori. Ahora el botón general lleva a `/agendar`, donde el paciente elige sede, y el alcance del WhatsApp queda dicho de frente.

## Accomplishments
- `src/content/locations.ts` como fuente de verdad de las cuatro sedes, con dirección, coordenadas, horarios, canales de agenda y helpers (`primaryLocation`, `clinicLocations`, `weeklySchedule` ordenado de lunes a sábado).
- Página `/agendar`: aviso destacado sobre el alcance del WhatsApp, bloque de consultorio privado, bloque de clínicas con la indicación de pedir al doctor por nombre en Traumatología, tabla semanal con scroll horizontal y salida al formulario.
- `LocationCard` cambia de CTA según quién maneja la agenda: botón de WhatsApp para el consultorio propio, lista de canales (teléfono, web, app) para las clínicas, con etiqueta "Agenda el doctor" o "Agenda la clínica" en cada tarjeta.
- CTA principal reruteado en header (escritorio y móvil), hero y cierre del Home. El cierre ofrece las dos salidas: ver sedes, o WhatsApp para el consultorio privado. El botón flotante de WhatsApp se mantiene para consultas generales.
- Home suma la sección "Dónde atiende" con las cuatro sedes y enlace a `/agendar`; la línea de credenciales ahora dice "atiende en 4 sedes de Lima".
- `/contacto` pasa a ser la página del formulario y del consultorio privado, con enlace a `/agendar` para el resto.
- FAQ: pregunta nueva sobre en qué consultorios atiende y respuesta reescrita de cómo agendar, con la distinción de agendas.
- JSON-LD: `address` y `geo` del consultorio privado; `hospitalAffiliation` pasa de un objeto a las tres clínicas con su dirección completa.
- `/agendar` sumada al sitemap con prioridad 0.9 (Contacto baja a 0.8).

## Datos verificados
Teléfonos, direcciones y coordenadas de las tres clínicas salen de su ficha oficial en Google, no de agregadores: Ricardo Palma (01) 224 2224, Av. Javier Prado Este 1066, San Isidro; Sanna La Molina (01) 635 5000, Av. Raúl Ferrero 1256; Padre Luis Tezza (01) 610 5050, Av. El Polo 570, Surco. El consultorio privado se geolocalizó sobre Lima Central Tower, Av. El Derby 254.

## Verificación hecha
- `npm run build`, `npx tsc --noEmit` y `npm run lint` limpios; 20 rutas.
- Revisión en navegador sobre el build de producción: `/agendar` (aviso, tarjetas, tabla), Home (hero, "Dónde atiende", cierre) y `/contacto`.
- Orden de la tabla semanal leído desde el DOM: lunes y miércoles, martes, jueves, jueves y viernes, viernes y sábados.
- `hospitalAffiliation` inspeccionado en el HTML servido.

## Pendiente
- **Confirmar el estado de Clínica Montefiori.** No aparece en el listado del consultorio, así que salió del sitio; en el CV quedó como experiencia desde dic. 2018 sin "sede actual". Si el doctor ya no atiende ahí, conviene actualizar también su perfil de Doctoralia, que todavía la menciona.
- Horas exactas del consultorio privado los viernes y sábados.
- Enlaces profundos a la ficha del doctor en las webs de las clínicas, si existen.
