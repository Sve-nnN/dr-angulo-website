# Requisitos — Milestone v1.2

**Milestone:** v1.2 — SEO semántico: keyword research y optimización on-page
**Workstream:** `seo-keywords` (paralelo a `milestone`, que ejecuta v1.1)
**Definidos:** 2026-08-10

## Contexto del milestone

El sitio del Dr. Angulo se lanzó sin una keyword asignada por página. Cada URL compite
por lo que Google decida, no por lo que se eligió. Este milestone hace el keyword research
de todo el negocio (traumatología, cirugía de columna, ortopedia infantil, nichos por
condición y por sede), asigna una keyword primaria a cada URL y reescribe cada página
para ganarla en la SERP de Lima.

**Reparto con v1.1** (decidido 2026-08-10): v1.2 manda en keywords y textos; v1.1 manda
en código. v1.2 entrega el mapa de keywords y el copy optimizado (title, meta, H1,
jerarquía, entidades); las fases 8, 9 y 10 de v1.1 los implementan. Ningún requisito de
v1.2 escribe en `src/`.

**Fuentes de datos** (decidido 2026-08-10):
- **DinoRank** — primaria para volumen, CPC y competencia (`/keyword-research`), más
  TF-IDF semántico, canibalizaciones y auditoría on-page
- **Ahrefs** — KD, traffic potential y referring domains needed, que DinoRank no devuelve.
  **Diferido, fuera de la fase 12** (decisión de Juan, 2026-08-10). Cuando se reincorpore:
  nunca para expandir el universo, solo para enriquecer una shortlist y perfilar
  competidores. Cuenta Lite de 100.000 unidades al mes, y la API v3 directa está incluida en
  ese plan consumiendo del mismo pool que el MCP
- **SerpApi** — validación de la SERP real geolocalizada en Lima, y expansión por related
  searches, People Also Ask y autocomplete

**Complementariedad verificada el 2026-08-10:** Ahrefs devuelve datos para keywords genéricas
en Perú (`hernia discal`: 6.000 de volumen, KD 5, traffic potential 1.500) pero **vacío** para
el geo long tail de Lima (`hernia discal lima`, `traumatologo columna lima`). Ese terreno solo
lo cubre DinoRank vía DataForSEO. Las dos fuentes no se solapan.

**Entregable externo:** el Sheet de SEO del cliente
(`1aowectbAJhyyZWhwQ6N_re-ENeSENvNN-5DebqCIls0`), tabs `Keyword Research`,
`Content Model`, `Competitor Analysis`, `Canonical Audit`, `Internal Linking Audit`.

> **Corrección del 2026-08-10, tras leer el documento en vivo** (ver
> `.planning/workstreams/seo-keywords/data/sheet-recon-2026-08-10.md`): el tab se llama
> `Canonical Audit`, no `Canonicalization Audit`. El texto largo existe, pero como banner
> dentro de la fila 1 del tab. Pedirlo por el nombre largo devuelve error 400. Además el
> documento tiene **11 tabs**, no 5, y la fila de encabezados no es la fila 1 en ninguno.

## Inventario de URLs a cubrir (19)

**Existentes (10):** `/`, `/servicios`, `/sobre-el-doctor`, `/testimonios`,
`/preguntas-frecuentes`, `/contacto`, `/agendar`, `/blog`, `/blog/[slug]`, `/privacidad`

**Planificadas por v1.1 (9):** cuatro de servicio (hernia discal, estenosis espinal,
escoliosis y deformidades, ortopedia infantil) y cuatro de sede (consultorio Surco,
Ricardo Palma, Sanna La Molina, Padre Luis Tezza), más el hub `/servicios` reformulado.

`/privacidad` queda fuera del mapa de keywords: es legal, ya está fuera del sitemap.

---

## Requisitos de v1.2

### Infraestructura de datos (INFRA)

- [x] **INFRA-01**: Un script del repo escribe celdas en el Sheet del cliente con la
  service account de Google, sin intervención manual
- [ ] **INFRA-02**: Un cliente de la API de DinoRank consulta `/keyword-research`,
  `/tfidf`, `/auditoria` y `/canibalizaciones` con la clave fuera del control de versiones
- [ ] **INFRA-03**: Toda respuesta cruda de DinoRank, Ahrefs y SerpApi queda cacheada en
  disco, de modo que reprocesar el análisis no vuelva a consumir cuota de API

### Investigación de keywords (KWR)

- [ ] **KWR-01**: Existe un universo de 400 o más keywords del negocio del doctor,
  expandido desde semillas por condición, procedimiento, síntoma, especialidad y sede
- [ ] **KWR-02**: Cada keyword del universo trae volumen, CPC y competencia de DinoRank
  para Perú en español, con la fuente marcada por columna. Las columnas de KD y traffic
  potential existen en el dataset y en el Sheet, pero quedan con valor `no_consultado`
  <br>*Enmendado dos veces el 2026-08-10, decisión de Juan. Redacción original: KD, traffic
  potential y referring domains de Ahrefs para **cada** keyword. Primera enmienda: solo para
  una shortlist de 40 a 60. Segunda y vigente: **Ahrefs queda fuera de la fase 12 por
  completo**, la instrumentación corre con DinoRank y SerpApi únicamente. El enriquecimiento
  con métricas de Ahrefs queda diferido, sin fase asignada todavía.*
  <br>*Consecuencia registrada: KWR-05 (punto dulce) depende de KD. La fase 13 tiene que
  resolverlo con un proxy de dificultad orgánica leído de la SERP con SerpApi, o reincorporar
  Ahrefs entonces. Se decide al discutir la fase 13, no antes.*
- [ ] **KWR-03**: Cada keyword está clasificada por intención (informacional, comercial,
  transaccional, navegacional) y por etapa del paciente (síntoma, diagnóstico, decisión)
- [ ] **KWR-04**: Las keywords están agrupadas en clusters por solape de SERP, no por
  parecido de texto
- [ ] **KWR-05**: Está identificado el "punto dulce": las keywords cuyo KD es alcanzable
  con el perfil de enlaces real del dominio, no las de mayor volumen
- [ ] **KWR-06**: Están seleccionadas las "10 de Oro" — las keywords que mueven la aguja
  del negocio primero, con su justificación

### Análisis de competencia (COMP)

- [ ] **COMP-01**: Cinco competidores de Lima están perfilados con DR, referring domains,
  tráfico orgánico estimado, cantidad de keywords en top 100 y presencia de blog
- [ ] **COMP-02**: Está el gap de keywords: los términos por los que los competidores
  posicionan y el doctor no
- [ ] **COMP-03**: Para cada cluster está registrada la SERP real de Lima capturada con
  SerpApi, con el tipo de página que Google premia en cada una
- [ ] **COMP-04**: Están registrados los featured snippets y las páginas más enlazadas
  de cada competidor

### Mapa keyword → URL (MAP)

- [ ] **MAP-01**: Cada una de las 18 URLs mapeables tiene exactamente una keyword primaria
  asignada y de tres a cinco secundarias
- [ ] **MAP-02**: Ninguna keyword primaria está asignada a dos URLs — la canibalización
  está detectada y resuelta antes de asignar
- [ ] **MAP-03**: Las nueve URLs que aún no existen (servicios y sedes de v1.1) tienen su
  keyword asignada antes de que la fase 8 las escriba
- [ ] **MAP-04**: Cada asignación declara el tipo de página que la SERP exige y si la URL
  actual lo cumple, la hay que reescribir o hay que crearla
- [ ] **MAP-05**: Está definida la matriz de enlazado interno entre clusters: qué URL
  enlaza a cuál y con qué anchor

### Optimización on-page (ONPAGE)

- [ ] **ONPAGE-01**: Cada URL mapeable tiene title y meta description reescritos, dentro
  de límite de caracteres y con la keyword primaria al frente
- [ ] **ONPAGE-02**: Cada URL tiene H1 propuesto y jerarquía H2/H3 derivada de las
  preguntas reales de la SERP
- [ ] **ONPAGE-03**: Cada URL trae su lista de entidades y términos semánticos obligatorios
  del TF-IDF de DinoRank contra los que ya posicionan
- [ ] **ONPAGE-04**: El copy clínico nuevo o reescrito está redactado, humanizado y marcado
  como pendiente de aprobación del doctor antes de que v1.1 lo publique
- [ ] **ONPAGE-05**: La auditoría de DinoRank confirma cero titles duplicados, cero H1
  duplicados y cero metas faltantes en el mapa propuesto
- [ ] **ONPAGE-06**: Existe un paquete de entrega por URL que la fase 8 y la fase 10 de
  v1.1 pueden implementar sin volver a decidir nada

### Entrega en el Sheet (SHEET)

- [ ] **SHEET-01**: El tab `Keyword Research` está lleno con el universo de keywords y
  todas sus columnas de métricas, cluster, intención, H1 sugerido y top result
- [ ] **SHEET-02**: El tab `Content Model` tiene una fila por URL con keyword, intención,
  tipo, cluster, métricas y la acción recomendada (dejar, actualizar o eliminar)
- [ ] **SHEET-03**: El tab `Competitor Analysis` tiene los cinco competidores con sus
  stats, keywords, snippets, páginas principales y contenido más enlazado
- [ ] **SHEET-04**: El tab `Canonical Audit` tiene una fila por URL con su keyword,
  topic y canonical propuesto
- [ ] **SHEET-05**: El tab `Internal Linking Audit` tiene una fila por URL con hasta ocho
  enlaces salientes propuestos y su anchor
- [x] **SHEET-06**: Reejecutar la carga actualiza las filas existentes en vez de duplicarlas

---

## Requisitos futuros (fuera de v1.2)

- Calendario editorial de blog y producción de contenido nuevo (tabs
  `Content Strategy Proposal` y `Content Production`) — depende de que los clusters
  estén validados por el doctor
- Seguimiento de posiciones con el tracking de DinoRank — necesita el sitio ya optimizado
  y semanas de historial
- Auditoría técnica completa (tab `Tech SEO Audit`, 59 checks) — se solapa con v1.1
- SEO local por sede con el endpoint `/seolocal` de DinoRank — depende de que existan
  las páginas de sede de la fase 9

## Fuera de alcance (con razón)

- **Escribir en `src/`** — reparto acordado: v1.1 implementa el código, v1.2 entrega
  keywords y textos. Evita conflictos de merge entre dos milestones paralelos.
- **Publicar contenido clínico** — todo texto médico pasa por el doctor antes de salir
  (restricción YMYL del proyecto).
- **Linkbuilding** — el endpoint existe en DinoRank, pero adquirir enlaces es un proyecto
  aparte con presupuesto propio.
- **Keywords fuera de Lima** — el negocio es presencial en Lima; expandir a otras
  ciudades del Perú no tiene sede que lo respalde.
- **`/privacidad`** — página legal, ya excluida del sitemap.

## Trazabilidad

Mapeada por `ROADMAP.md` del workstream `seo-keywords` el 2026-08-10.
30 requisitos, cada uno en exactamente una fase. Cobertura 30/30.

| Requisito | Fase | Estado |
|-----------|------|--------|
| INFRA-01 | Fase 12 | Completo (12-02) |
| INFRA-02 | Fase 12 | Pendiente |
| INFRA-03 | Fase 12 | Pendiente |
| KWR-01 | Fase 12 | Pendiente |
| KWR-02 | Fase 12 | Pendiente |
| KWR-03 | Fase 12 | Pendiente |
| KWR-04 | Fase 13 | Pendiente |
| KWR-05 | Fase 13 | Pendiente |
| KWR-06 | Fase 13 | Pendiente |
| COMP-01 | Fase 13 | Pendiente |
| COMP-02 | Fase 13 | Pendiente |
| COMP-03 | Fase 13 | Pendiente |
| COMP-04 | Fase 13 | Pendiente |
| MAP-01 | Fase 14 | Pendiente |
| MAP-02 | Fase 14 | Pendiente |
| MAP-03 | Fase 14 | Pendiente — **handoff bloqueante** para la fase 8 de v1.1 |
| MAP-04 | Fase 14 | Pendiente |
| MAP-05 | Fase 14 | Pendiente |
| ONPAGE-01 | Fase 15 | Pendiente |
| ONPAGE-02 | Fase 15 | Pendiente |
| ONPAGE-03 | Fase 15 | Pendiente |
| ONPAGE-04 | Fase 15 | Pendiente |
| ONPAGE-05 | Fase 15 | Pendiente |
| ONPAGE-06 | Fase 15 | Pendiente — handoff de contenido para las fases 8 y 10 de v1.1 |
| SHEET-01 | Fase 13 | Pendiente |
| SHEET-02 | Fase 14 | Pendiente |
| SHEET-03 | Fase 13 | Pendiente |
| SHEET-04 | Fase 14 | Pendiente |
| SHEET-05 | Fase 14 | Pendiente |
| SHEET-06 | Fase 12 | Completo (12-02) |

### Resumen por fase

| Fase | Entrega | Requisitos | Total |
|------|---------|------------|-------|
| 12 | Instrumentación de datos y universo de keywords | INFRA-01 a INFRA-03, KWR-01 a KWR-03, SHEET-06 | 7 |
| 13 | Clusters, competencia y las 10 de Oro | KWR-04 a KWR-06, COMP-01 a COMP-04, SHEET-01, SHEET-03 | 9 |
| 14 | Mapa keyword → URL y matriz de enlazado | MAP-01 a MAP-05, SHEET-02, SHEET-04, SHEET-05 | 8 |
| 15 | Paquete on-page por URL | ONPAGE-01 a ONPAGE-06 | 6 |
