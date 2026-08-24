# Requirements: Sitio web — Dr. Juan Carlos Angulo Totesaut

**Milestone:** v1.3 Remediación de la auditoría SEO 2026-08-23
**Workstream:** seo-fixes
**Defined:** 2026-08-23
**Core Value:** Que un paciente que busca "traumatólogo" / "cirujano de columna" en Lima encuentre el sitio, confíe en el doctor y agende una cita por WhatsApp en menos de 2 clics, con todo evento rastreado.

**Origen:** auditoría SEO del 2026-08-23 sobre drangulocolumna.com (`audit/findings/2026-08-23-auditoria-seo.md`). Puntaje de salud 81/100. Evidencia: crawl propio de las 22 URLs del sitemap, Unlighthouse sobre 23 rutas con throttling móvil, y Search Console (`sc-domain:drangulocolumna.com`).

**Trazabilidad externa:** cada requisito apunta al issue de GitHub que lo originó en `Sve-nnN/dr-angulo-website`. El criterio de aceptación de un requisito es el criterio de aceptación escrito en su issue, y el issue se cierra cuando el requisito se valida.

## v1.3 Requirements

### Indexación

- [ ] **IDX-01**: Las ocho páginas núcleo del sitio registran fecha de rastreo en Search Console, en vez de quedar en "Discovered - currently not indexed" (#1)
- [ ] **IDX-02**: El sitio recibe al menos tres enlaces desde dominios de terceros apuntando a páginas internas, no solo a la portada (#1)
- [ ] **IDX-03**: El perfil de Google Business enlaza a páginas internas concretas: una por sede y una por condición (#1)

### Alineación de URL, title y contenido

- [ ] **SLUG-01**: Un paciente que ve la URL de un post del blog en la SERP encuentra el tema que esa URL anuncia (#2)
- [ ] **SLUG-02**: Los slugs viejos del blog redirigen con una sola redirección permanente al slug nuevo, sin cadenas ni 404 (308 vía `permanent: true`, consistente con las tres redirecciones ya existentes), y ningún enlace interno ni el sitemap apuntan a los viejos (#2)
- [ ] **SLUG-03**: `/preguntas-frecuentes` presenta URL, title y H1 sobre el mismo tema (#3)
- [ ] **SLUG-04**: El contenido de "reumatólogo o traumatólogo" vive en su propia URL, con su title y su H1 alineados (#3)

### Enlazado interno y canibalización

- [ ] **LINK-01**: Ningún anchor interno usa una keyword cruda, un superlativo sin respaldo ni una especialidad que el doctor no ejerce (#4)
- [ ] **LINK-02**: Ciática, lumbalgia y hernia discal cubren intenciones de búsqueda distintas, se enlazan entre sí y solo la comercial desarrolla la decisión quirúrgica (#5)
- [ ] **LINK-03**: Ninguna secuencia de H2 se repite palabra por palabra en más de dos páginas del sitio (#6)

### Datos estructurados

- [ ] **SCH-01**: Cada post del blog declara `about` apuntando a su propia entidad, no a la de hernia discal (#10)
- [ ] **SCH-02**: No queda ningún bloque `FAQPage` de una sola pregunta en el sitio (#11)

### Core Web Vitals y entrega

- [ ] **CWV-01**: El HTML de las páginas estáticas se sirve desde la caché de borde de Cloudflare, con TTFB de la portada por debajo de 300 ms (#7)
- [ ] **CWV-02**: `/testimonios` puntúa por encima de 0,90 en performance, con TBT por debajo de 200 ms (#8)
- [ ] **CWV-03**: La imagen LCP de `/sobre-el-doctor` se precarga con prioridad alta y en formato moderno (#9)
- [ ] **CWV-04**: El bundle compartido no arrastra JavaScript sin usar por encima de 15 KB ni polyfills legacy (#13)
- [ ] **CWV-05**: La imagen OpenGraph pesa menos de 200 KB sin degradar la vista previa en WhatsApp (#14)

### Accesibilidad

- [ ] **A11Y-01**: La portada, `/agendar` y `/sedes` puntúan 1,00 en accesibilidad, con contraste, listas de definición y orden de encabezados en verde (#12)

### Contenido y confianza

- [ ] **TRUST-01**: `/blog` y `/sedes` tienen contenido propio suficiente para justificar su indexación como páginas, no solo como índices (#15)
- [ ] **TRUST-02**: Cada página de condición y cada post del blog citan al menos dos fuentes médicas externas verificables que respaldan afirmaciones concretas del texto (#18)

### Medición y seguridad

- [ ] **MEAS-01**: El rendimiento de la portada se lee en una sola fila del informe de Search Console, sin partirse entre la versión limpia y la que lleva UTM (#16)
- [ ] **MEAS-02**: El sitio sirve una Content-Security-Policy sin romper ninguna ruta ni dejar issues de CSP en devtools (#17)

## Future Requirements

Diferidos, no entran a v1.3.

### Contenido

- **FUT-CONT-01**: Ampliar el blog más allá de los cuatro posts actuales, con calendario de publicación
- **FUT-CONT-02**: Página comparativa entre técnicas quirúrgicas, que hoy no existe

### Indexación

- **FUT-IDX-01**: Programa sostenido de link building médico, más allá de los tres enlaces de arranque de IDX-02

## Out of Scope

| Excluido | Razón |
|---|---|
| Corregir la ficha del Google Business Profile (horarios, categorías, campaña de reseñas) | Es GBP-01 a GBP-04 de la fase 11 de v1.1, en el workstream `milestone`. Ese workstream es dueño del GBP. Acá solo se decide y se mide el tratamiento de los UTM (MEAS-01) |
| Quitar el marcado `FAQPage` existente de `/preguntas-frecuentes` | Google retiró los rich results de FAQ el 7 de mayo de 2026. El marcado ya no rinde, pero tampoco penaliza, y quitarlo no aporta nada |
| Agregar `FAQPage` nuevo en cualquier página | Mismo motivo: no produce resultado enriquecido en Google desde mayo de 2026 |
| Reescritura completa del contenido clínico | El contenido es sólido, con 1.900 a 3.300 palabras por página de condición. Lo que falla es la estructura repetida y la asignación de intención, no la calidad del texto |
| Cambiar de hosting o de framework | El diagnóstico de CWV-01 es de configuración de caché, no de plataforma |
| Rediseño visual | Fuera del alcance de una remediación de auditoría. Los únicos cambios de estilo son los tres de accesibilidad de A11Y-01 |

## Traceability

Completada al crear el roadmap del 2026-08-23. 22 de 22 requisitos mapeados, cada uno a exactamente una fase.

| Requisito | Issue | Fase | Estado |
|---|---|---|---|
| IDX-01 | #1 | Fase 17 | Pending |
| IDX-02 | #1 | Fase 17 | Pending |
| IDX-03 | #1 | Fase 17 | Pending |
| SLUG-01 | #2 | Fase 16 | Pending |
| SLUG-02 | #2 | Fase 16 | Pending |
| SLUG-03 | #3 | Fase 16 | Pending |
| SLUG-04 | #3 | Fase 16 | Pending |
| LINK-01 | #4 | Fase 16 | Pending |
| LINK-02 | #5 | Fase 16 | Pending |
| LINK-03 | #6 | Fase 16 | Pending |
| SCH-01 | #10 | Fase 16 | Pending |
| SCH-02 | #11 | Fase 16 | Pending |
| CWV-01 | #7 | Fase 18 | Pending |
| CWV-02 | #8 | Fase 18 | Pending |
| CWV-03 | #9 | Fase 18 | Pending |
| CWV-04 | #13 | Fase 18 | Pending |
| CWV-05 | #14 | Fase 18 | Pending |
| A11Y-01 | #12 | Fase 18 | Pending |
| TRUST-01 | #15 | Fase 19 | Pending |
| TRUST-02 | #18 | Fase 19 | Pending |
| MEAS-01 | #16 | Fase 19 | Pending |
| MEAS-02 | #17 | Fase 19 | Pending |

## Restricciones del workstream

- `seo-fixes` **sí** escribe en `src/`. Es lo que lo diferencia de `seo-keywords`.
- `seo-fixes` **no** toca `.planning/workstreams/milestone/` ni `.planning/workstreams/seo-keywords/`.
- **Todo trabajo de diseño pasa por la skill `impeccable`, con el verbo que corresponda.** Cuenta como diseño cualquier cambio de estilos, layout, tipografía, color, espaciado, motion, estructura de página, assets visuales o copy de interfaz. El ruteo de verbos por requisito está en la sección "Restricción de diseño" de `ROADMAP.md`. v1.3 es refinamiento: no hay rediseño visual.
- La fase 11 pendiente de v1.1 (GBP local SEO) no toca `src/`, así que las dos ramas pueden correr en paralelo. El único punto de contacto es MEAS-01 contra GBP-05.
