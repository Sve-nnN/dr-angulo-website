# Requirements: Dr. Angulo — Taste Pass (v1.4)

**Defined:** 2026-09-17
**Core Value:** Que un paciente que busca "traumatólogo" / "cirujano de columna" en Lima encuentre el sitio, confíe en el doctor (credenciales, trayectoria, testimonios) y agende una cita por WhatsApp en menos de 2 clics — todo evento de contacto debe quedar rastreado.

**Skill de diseño:** `design-taste-frontend` reemplaza a `impeccable` para este milestone (decisión de Juan, 2026-09-17). Dial `DESIGN_VARIANCE` en rango 6-7 ("rediseño moderado" — puede cambiar layout y composición, preserva marca).

## v1 Requirements

### Home y Servicios (HOMESVC)

- [x] **HOMESVC-01**: La home (`/`) presenta jerarquía visual clara entre credencial, propuesta de valor y llamado a agendar
- [x] **HOMESVC-02**: El hub de servicios (`/servicios`) permite escanear las especialidades sin fricción visual
- [x] **HOMESVC-03**: Cada página de servicio (`/servicios/[slug]`) tiene composición consistente entre sí y con el resto del sitio
- [x] **HOMESVC-04**: El CTA de agendar es visualmente prioritario en home y en cada servicio

### Sedes y Blog (SEDBLOG)

- [ ] **SEDBLOG-01**: El hub de sedes (`/sedes`) comunica ubicación y facilidad de acceso con jerarquía clara
- [ ] **SEDBLOG-02**: Cada sede (`/sedes/[slug]`) mantiene composición consistente con el hub de sedes
- [ ] **SEDBLOG-03**: El hub de blog (`/blog`) presenta los artículos con jerarquía editorial legible
- [ ] **SEDBLOG-04**: Cada artículo (`/blog/[slug]`) prioriza legibilidad de contenido clínico largo

### Conversión (CONV)

- [ ] **CONV-01**: `/agendar` reduce fricción visual entre llegar a la página y completar la acción de agendar
- [ ] **CONV-02**: `/contacto` presenta los canales de contacto (WhatsApp, teléfono, formulario) con jerarquía clara

### Institucional (INST)

- [ ] **INST-01**: `/sobre-el-doctor` transmite autoridad y confianza mediante jerarquía visual (foto, credenciales, trayectoria)
- [ ] **INST-02**: `/testimonios` presenta reseñas con diseño que refuerza credibilidad
- [ ] **INST-03**: `/preguntas-frecuentes` es fácil de escanear y expandir
- [ ] **INST-04**: `/privacidad` mantiene legibilidad básica, sin necesidad de rediseño profundo (página legal)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Reescribir copy clínico o metadatos SEO | Pertenece a los workstreams `milestone` y `seo-keywords`; este milestone es solo diseño visual |
| Cambiar estructura de datos, rutas o schema | Fuera del alcance de un "taste pass"; requiere su propio milestone técnico |
| Tocar `src/` fuera de componentes visuales/estilos | El acuerdo entre workstreams reserva la lógica de negocio a los otros milestones |
| Bajar el bar de accesibilidad de A11Y.md para ganar variance visual | Regla dura del proyecto (CLAUDE.md); accesibilidad nunca se negocia por estética |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOMESVC-01 | Phase 1 | Complete |
| HOMESVC-02 | Phase 1 | Complete |
| HOMESVC-03 | Phase 1 | Complete |
| HOMESVC-04 | Phase 1 | Complete |
| SEDBLOG-01 | Phase 4 | Pending |
| SEDBLOG-02 | Phase 4 | Pending |
| SEDBLOG-03 | Phase 4 | Pending |
| SEDBLOG-04 | Phase 4 | Pending |
| CONV-01 | Phase 2 | Pending |
| CONV-02 | Phase 2 | Pending |
| INST-01 | Phase 3 | Pending |
| INST-02 | Phase 3 | Pending |
| INST-03 | Phase 3 | Pending |
| INST-04 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-17*
*Last updated: 2026-09-17 after roadmap creation (4 phases, 14/14 requirements mapped)*
