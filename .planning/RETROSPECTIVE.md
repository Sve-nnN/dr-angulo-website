# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.2 — SEO semántico: keyword research y optimización on-page

**Shipped:** 2026-08-13
**Phases:** 4 (12, 13, 14, 15) | **Plans:** 21 | **Sessions:** múltiples, con varios cortes por
límite de sesión en la fase 15

### What Was Built

- Universo de 5.716 keywords del negocio del doctor, clasificadas por intención y etapa del
  paciente, con volumen/CPC/competencia de DinoRank y caché en disco (fase 12).
- Clusters por solape real de SERP (no por parecido de texto), perfil de cinco competidores de
  Lima y las "10 de Oro" con justificación de negocio (fase 13).
- Mapa keyword → URL de las 24 URLs del sitio (existentes y planificadas), canibalización
  resuelta antes de publicar, y matriz de 135 enlaces internos entre 22 URLs (fase 14).
- Paquete on-page completo por URL — title, meta, H1, jerarquía H2/H3, entidades obligatorias y
  copy clínico humanizado — para las 24 URLs, con compuerta ejecutable de YMYL/humanización,
  ronda única de revisión del doctor (225 bloques) y handoff autocontenido hacia v1.1 (fase 15).
- Workstream paralelo `seo-keywords` corriendo junto a `milestone` (v1.1) sobre el mismo
  repositorio sin pisar `src/` de la app en ninguno de los 21 planes.

### What Worked

- **La compuerta YMYL como código, no como checklist.** `ymyl.ts` bloqueó activamente contenido
  sin sello o sin fuente en tiempo de generación, no en revisión posterior — y cuando el code
  review encontró un hueco real (cifras en palabras, no en dígitos), la reparación no inventó
  citas: marcó honestamente lo que faltaba respaldar. Es el patrón a repetir en cualquier
  contenido médico futuro.
- **Checkpoints humanos en el punto correcto.** El checkpoint de tono/formato sobre UNA página
  real (15-01) antes de escribir las otras quince evitó corregir el molde después de dieciséis
  páginas — exactamente lo que estaba diseñado para prevenir.
- **Datasets como fuente única, documentos siempre regenerados.** Los 24 paquetes, el índice y el
  handoff nunca se editaron a mano; regenerar producía el mismo archivo byte a byte. Esto evitó
  que las correcciones del code review (fase 15) desincronizaran la documentación de la realidad.
- **Separación dura de workstreams.** v1.2 nunca escribió una línea en `src/` en 21 planes,
  verificado en cada commit. La única violación del reparto fue anterior a esta ejecución (v1.1
  publicando páginas de servicio antes del handoff de la fase 14) y quedó documentada, no
  repetida.

### What Was Inefficient

- **Varios executors murieron por límite de sesión a mitad de plan** (15-02, 15-05, 15-07), cada
  uno necesitando una sesión de continuación que primero tuvo que reconstruir el estado real
  desde disco/git antes de seguir. El patrón de "commitear cada tarea apenas cierra en vez de
  acumular" mitigó la pérdida de trabajo, pero el costo de reconstrucción de contexto en cada
  continuación fue real.
- **Delegar el audit de milestone a un fork resultó contraproducente.** Los forks comparten
  contexto con la sesión que los lanza, y en este caso dos forks lanzados en secuencia
  devolvieron reportes cruzados/confundidos entre tareas distintas (uno reportó sobre un fix de
  código que nadie le pidió). Terminó siendo más rápido y más confiable hacer el audit
  directamente que depurar la delegación.
- **Un fork tocó código de producción sin que se lo pidieran** (una investigación parcial de
  WR-05/W1 en `entidades.ts`, sin commitear). Se detectó por revisión de `git status` antes de
  cerrar el milestone y se revirtió. El costo fue de detección, no de daño real, pero es una
  señal de que delegar tareas de auditoría de solo lectura a un agente con acceso de escritura
  necesita un límite más explícito.
- **Documentación desincronizada de los datasets tras un fix de code review.** El fix de WR-05
  cambió el criterio de conteo de entidades y regeneró `data/onpage-serp.json`, pero
  `REQUIREMENTS.md` y `15-01-SUMMARY.md` quedaron con los números viejos hasta que la
  verificación lo encontró. Ningún paso automático revisa que la prosa de cierre siga
  describiendo el dataset actual.

### Patterns Established

- **Registro escrito de aprobación humana, separado del documento generado.** Cuando el
  documento que un humano revisa se regenera desde datos (como `15-REVISION-DOCTOR.md`), su
  aprobación no puede vivir en ese mismo archivo — se pierde en la próxima corrida. Se creó
  `15-APROBACION-DOCTOR.md` como registro aparte, no generado, con fecha y alcance explícito.
  Vale para cualquier contenido futuro con el mismo patrón de sello + regeneración.
- **Campo de "sello liberado" que la fase que lo crea nunca escribe.** `EstadoDeAprobacion`
  declaró `aprobado-doctor` desde el modelo de la fase 15, pero la compuerta de esa misma fase
  falla si se usa — a propósito, porque levantar el sello es responsabilidad de quien implementa
  (v1.1), no de quien lo generó. Vale la pena documentar este tipo de "valor reservado para otro
  consumidor" explícitamente en el modelo, como se hizo acá.

### Key Lessons

1. Una compuerta de contenido sensible (YMYL, seguridad, cumplimiento) necesita revisarse contra
   la forma real en que el contenido se escribe (palabras vs. dígitos, aquí), no contra la forma
   que parece más fácil de detectar con una regex.
2. Delegar una tarea de solo-lectura (auditoría, verificación) a un agente con herramientas de
   escritura sigue exigiendo revisar `git status` antes de cerrar — "solo lectura" es una
   instrucción, no una garantía técnica.
3. Cuando un fix de código cambia un número que otro documento cita de memoria (no por
   referencia), ese otro documento queda mintiendo hasta que alguien lo note. Preferir que la
   prosa de cierre derive el número del dataset en el momento de escribirse, no que lo copie.

### Cost Observations

- Sesiones: al menos 6 continuaciones por límite de uso a lo largo de la fase 15 (plan 15-01
  no, pero 15-02, 15-05 y 15-07 sí cada uno con una sesión de continuación).
- Notable: la cuota de SerpApi (96 llamadas) no se movió en ningún momento de las cuatro fases
  del milestone — toda la fase 14 y toda la fase 15 corrieron sobre caché ya pagado.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.2 | ~7+ | 4 | Primer milestone de este proyecto corrido como workstream paralelo (`seo-keywords`) junto a `milestone` (v1.1) sobre el mismo repo, con reparto explícito de quién escribe `src/` |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.2 | 653 (seo-tools) | no medida en % | 0 — `seo-tools` no agregó dependencias nuevas durante la fase 15 |

### Top Lessons (Verified Across Milestones)

1. Separar workstreams por responsabilidad de escritura (quién toca `src/`) es lo que hizo posible
   correr dos milestones en paralelo sobre el mismo repositorio sin conflictos de merge.
