---
phase: 05-material-real-y-feed-de-instagram
plan: 05-04
subsystem: cv-completo
tags: [cv, trayectoria, formacion, eeat]
provides:
  - Trayectoria completa del doctor publicada con fechas, cargos y entrenamientos
  - Sección de cursos, congresos y entrenamientos en "Sobre el doctor"
affects: []
tech-stack:
  added: []
  patterns: ["training[] como dato con año, lugar y marca de internacional"]
key-files:
  created: []
  modified: [src/content/cv.ts, src/app/sobre-el-doctor/page.tsx, .planning/STATE.md]
key-decisions: ["Se omiten los dos cargos iniciales de Guarataro por fechas contradictorias en el CV", "Los entrenamientos internacionales se marcan como tales porque son la señal de autoridad más fuerte del CV"]
duration: ~25min
completed: 2026-08-09
status: complete
---

# Phase 5 · Plan 05-04: CV completo del doctor Summary

**El CV que el doctor publica en Doctoralia llegó completo y reemplaza al esqueleto que el sitio tenía armado con lo poco que era visible públicamente.**

## Performance
- **Duration:** ~25min
- **Files modified:** 3

## Accomplishments
- `cv.ts` reescrito con la trayectoria real: formación con fechas (postgrado UDO 2007-2009, especialización de columna en el Instituto de Columna de Caracas, diplomado en Ecografía Integral 2005) y ocho cargos ordenados del más reciente al más antiguo, incluidos los años en el Hospital Ruiz y Páez (traumatólogo 2010-2018, cirujano de columna 2011-2018) y la jefatura de residentes en el Héctor Nouel Joubert.
- Corrección de un dato que estaba mal desde la Phase 2: el sitio decía "Cirujano de columna, Hospital Ruiz y Páez, 2007-2009", que en realidad era el período de la residencia de postgrado. La jefatura de columna fue 2011-2018.
- `training[]` nuevo con once cursos y congresos, cada uno con año, lugar y marca de internacional. Cuatro son fuera del país: dos en Miami con Medtronic, uno en Francia sobre prótesis de disco de movilidad controlada, y el de corrección de deformidades en Buenos Aires.
- "Sobre el doctor" suma la sección "Cursos, congresos y entrenamientos" como timeline por año, y la biografía ahora nombra los entrenamientos en Estados Unidos, Francia y Argentina más los cursos AO de Caracas, en vez del genérico "cursos dentro y fuera del país".
- Metadata de la página actualizada con esas mismas señales.

## Nota sobre las enfermedades tratadas
La lista de Doctoralia (fractura, rodilla, artrosis, cadera, hombro, desgarro, tendinitis, codo, lumbalgia, displasia congénita de cadera, artrodesis) ya estaba cubierta al 100% por `serviceCategories`, así que no hubo que tocar Servicios.

## Verificación hecha
- `npm run build`, `npx tsc --noEmit` y `npm run lint` limpios.
- Revisión en navegador de la sección nueva sobre el build de producción.

## Pendiente
- Los dos cargos iniciales de Guarataro (médico rural y coordinador de ambulatorio) quedaron fuera: en el CV figuran como "01-12-2012 al 31-12-2013" y "Julio a Noviembre 2003", fechas que se contradicen entre sí y con el resto de la trayectoria. Se publican cuando el doctor aclare cuál es la correcta.
