---
phase: 06-sedes-horarios-y-flujo-de-agenda
verified: 2026-08-09T18:40:00Z
status: human_needed
score: 5/5 must-haves verified
behavior_unverified: 0
---

# Phase 6: Sedes, horarios y flujo de agenda Verification Report

**Phase Goal:** El sitio publica las cuatro sedes con sus horarios y dirige a cada paciente al canal de agenda correcto según la sede que elija.
**Verified:** 2026-08-09
**Status:** human_needed (por un dato a confirmar con el consultorio, no por código pendiente)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | El sitio publica las cuatro sedes con sus días y horarios | ✓ VERIFIED | `src/content/locations.ts` con las 4 sedes; renderizadas en `/agendar`, en la sección "Dónde atiende" del Home y en la tabla semanal; verificado en navegador sobre el build de producción |
| 2 | Un botón general de "Agendar cita" lleva a la elección de sede | ✓ VERIFIED | CTA de header (escritorio y móvil), hero y cierre del Home apuntan a `/agendar`; la página lista las cuatro sedes con su canal |
| 3 | Queda explícito que el WhatsApp agenda solo el consultorio privado | ✓ VERIFIED | Aviso destacado antes de cualquier sede en `/agendar`; etiqueta "Agenda el doctor" / "Agenda la clínica" en cada tarjeta; respuesta reescrita en FAQ; nota en el footer |
| 4 | NAP principal y JSON-LD apuntan al consultorio privado, con las clínicas como afiliación | ✓ VERIFIED | `siteConfig.office` = Av. El Derby 254, of. 2403, Surco; `hospitalAffiliation` con las 3 clínicas y su dirección, inspeccionado en el HTML servido |
| 5 | Teléfonos y enlaces de agenda son los oficiales | ✓ VERIFIED | Ficha oficial de cada clínica vía SerpAPI: CRP (01) 224 2224 / crp.com.pe, Sanna (01) 635 5000 / agendamiento.sanna.pe, Tezza (01) 610 5050 / clinicatezza.com.pe |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/content/locations.ts` | 4 sedes + helpers | ✓ EXISTS + SUBSTANTIVE | `locations`, `primaryLocation`, `clinicLocations`, `weeklySchedule` |
| `src/app/agendar/page.tsx` | Página de elección de sede | ✓ EXISTS + SUBSTANTIVE | Aviso, 2 bloques, tabla semanal, salida a contacto |
| `src/components/locations/location-card.tsx` | Tarjeta por sede | ✓ EXISTS + SUBSTANTIVE | CTA distinto según quién agenda |
| Sitemap con `/agendar` | Ruta indexable | ✓ EXISTS | Prioridad 0.9 |

**Artifacts:** 4/4 verified

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `header.tsx` | `/agendar` | CTA escritorio y móvil | ✓ WIRED | Reemplaza el enlace directo a WhatsApp |
| `page.tsx` (Home) | `locations.ts` | sección "Dónde atiende" | ✓ WIRED | Las 4 sedes con horario y dirección |
| `page.tsx` (Home) | `/agendar` | CTA de hero y de cierre | ✓ WIRED | El cierre mantiene el WhatsApp como segunda opción |
| `agendar/page.tsx` | `locations.ts` | `primaryLocation`, `clinicLocations`, `weeklySchedule` | ✓ WIRED | Tabla ordenada de lunes a sábado, leída desde el DOM |
| `structured-data.tsx` | `locations.ts` | `hospitalAffiliation` | ✓ WIRED | 3 clínicas con `PostalAddress` |
| `footer.tsx` / `contacto` | `/agendar` | enlaces "Ver sedes y horarios" | ✓ WIRED | Contacto queda como página de formulario |

**Wiring:** 6/6 connections verified

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|-----------------|
| LOC-01 | ✓ SATISFIED | - |
| LOC-02 | ✓ SATISFIED | - |
| LOC-03 | ✓ SATISFIED | - |
| LOC-04 | ✓ SATISFIED | - |

**Coverage:** 4/4 requirements satisfied

## Build & Checks

- `npm run build`: limpio, 20 rutas
- `npx tsc --noEmit`: sin errores
- `npm run lint`: sin hallazgos
- Verificación visual en navegador sobre el build de producción: `/agendar`, Home y `/contacto`

## Human Verification Required

### 1. Confirmar el estado de Clínica Montefiori

**Qué pasó:** el listado de consultorios que pasó el consultorio el 2026-08-09 no incluye Montefiori, que hasta ahora era la única sede publicada en el sitio. Se reemplazó por las cuatro actuales y en el CV quedó como experiencia "desde dic. 2018", sin la marca de sede actual.
**Qué confirmar:** si el doctor dejó de atender ahí, o si solo quedó fuera del listado.
**Si dejó de atender:** conviene actualizar también su perfil de Doctoralia, que todavía la menciona.
**Si sigue atendiendo:** pasar días y horario para sumarla a `src/content/locations.ts`.
**Why human:** solo el consultorio sabe el estado real del convenio.

### 2. Horas exactas del consultorio privado

Hoy la ficha dice "viernes y sábados, horario coordinado al agendar" porque no se pasaron horas. Con el rango exacto se puede publicar como el resto de las sedes y sumar `openingHoursSpecification` al JSON-LD.
