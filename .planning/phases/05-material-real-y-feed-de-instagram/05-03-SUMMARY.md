---
phase: 05-material-real-y-feed-de-instagram
plan: 05-03
subsystem: media-quirofano
tags: [fotos, avif, quirofano, servicios, home]
provides:
  - Cuatro fotos reales de quirófano en AVIF, repartidas entre Home, Servicios y Sobre el doctor
  - Cada abordaje quirúrgico con su propia foto en la sección de procedimientos
affects: []
tech-stack:
  added: []
  patterns: ["la foto de cada abordaje vive junto a su contenido en services.ts, no hardcodeada en la página"]
key-files:
  created: [public/dr-angulo-quirofano-arco-c.avif, public/dr-angulo-cirugia-instrumental.avif, public/dr-angulo-fluoroscopia.avif, public/dr-angulo-equipo-quirofano.avif]
  modified: [src/content/services.ts, src/app/servicios/page.tsx, src/app/page.tsx, src/app/sobre-el-doctor/page.tsx]
key-decisions: ["Se descartaron 3 de las 7 fotos porque muestran campo quirúrgico abierto con sangre", "Cada ProcedureApproach lleva su propia imagen como dato, no como markup"]
duration: ~35min
completed: 2026-08-09
status: complete
---

# Phase 5 · Plan 05-03: Fotos de quirófano Summary

**El sitio deja de ilustrar la cirugía con modelos anatómicos: ahora muestra al doctor operando de verdad, con el arco en C, la fluoroscopia y el instrumental de fijación.**

## Performance
- **Duration:** ~35min
- **Files modified:** 8 (4 creados)

## Selección de material

Llegaron 7 fotos de quirófano (zip del 2026-08-09 más cinco sueltas, con duplicados recomprimidos entre ambos lotes). Se usaron 4. Las otras 3 quedaron fuera porque muestran campo quirúrgico abierto con sangre visible: en una web dirigida a pacientes que ya llegan con miedo a operarse, esas imágenes trabajan en contra del mensaje.

## Accomplishments
- Cuatro AVIF nuevos, 1600 px de lado mayor en horizontales y 1400 en verticales, calidad 62: `dr-angulo-quirofano-arco-c` (92 KB), `dr-angulo-cirugia-instrumental` (67 KB), `dr-angulo-equipo-quirofano` (67 KB) y `dr-angulo-fluoroscopia` (58 KB).
- Home: banda 16/9 con la foto del arco en C y las resonancias en el negatoscopio, con pie de foto sobre la verificación por imágenes y enlace a la sección de procedimientos.
- Servicios: la sección `#procedimientos` gana una foto de apertura con su `figcaption`, y cada abordaje pasa de fila de lista a tarjeta con imagen propia — mínimamente invasiva con la foto del instrumental de mínima invasión, convencional con la del instrumental de fijación.
- `ProcedureApproach` en `services.ts` ahora incluye `image` (src, alt, width, height), así la foto viaja con el contenido en vez de quedar hardcodeada en la página.
- Sobre el doctor: el bloque de formación continua cambia el modelo anatómico por la foto de fluoroscopia, con el encuadre ajustado para que el gorro y la cara entren completos en el recorte 4/3 de móvil.

## Verificación hecha
- `npm run build`, `npx tsc --noEmit` y `npm run lint` limpios.
- Revisión en navegador sobre el build de producción: banda del Home, sección de procedimientos de Servicios y bloque de Sobre el doctor, con corrección de encuadre tras la primera pasada.

## Pendiente
- Nada bloqueante. Si el consultorio quiere usar alguna de las tres fotos descartadas, conviene recortarlas para que no se vea el campo abierto.
