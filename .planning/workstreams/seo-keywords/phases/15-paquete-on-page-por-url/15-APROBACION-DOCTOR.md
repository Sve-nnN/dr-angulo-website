# Aprobación del doctor: registro escrito

**Este archivo NO se regenera.** Es el registro de una decisión humana, no un artefacto
derivado de los datasets. `15-REVISION-DOCTOR.md` sí se regenera desde `data/copy-*.json` y por
eso no puede ser el lugar donde vive esta aprobación: cualquier corrida de
`revision.ts` pisaría las casillas marcadas a mano sin avisar.

**Aprobado por:** Dr. Juan Carlos Angulo (a través de Juan Angulo, 2026-08-13)
**Alcance:** los 225 bloques clínicos de las 16 páginas de `15-REVISION-DOCTOR.md`, incluidos
los seis bloques señalados en "Lo que conviene mirar antes que todo" (D1 a D6: la cita del lema
de la Clínica Tezza, el equilibrio del bloque de hernia discal sin cirugía del consultorio de
Surco, las tres secciones del post de ciática con promesas de alivio en 2-3 minutos, y el bloque
de riesgos de cirugía sin probabilidades).
**Resultado:** aprobado tal como está, sin correcciones pendientes.

## Qué desbloquea esto

Por D-08 (`15-CONTEXT.md`), ninguna sección clínica se publica sin este sello. Este documento
**es** el sello, para las 16 páginas con copy clínico. La fase 8 del workstream `milestone`
(v1.1) queda autorizada a implementar el copy on-page tal como está escrito en
`paquetes/*.md`, sin volver a este workstream a preguntar.

## Por qué el sello del dataset (`aprobacion: "pendiente-doctor"`) no se toca

`seo-tools/src/phase15/ymyl.ts:397` exige `aprobacion === "pendiente-doctor"` en toda sección
clínica — es la compuerta que impidió que este mismo texto se publicara sin sello mientras la
fase 15 lo escribía. Cambiar el valor a `"aprobado-doctor"` en los datasets de v1.2 haría fallar
esa compuerta en vez de reflejar la aprobación, y el propio modelo (`model.ts:69-70`) declara que
ese valor existe para que **v1.1** sepa cómo se vería una sección liberada, no para que v1.2 lo
escriba. Este archivo es la vía correcta: registra la aprobación sin tocar el dato que la
compuerta de v1.2 sigue vigilando.

## Trazabilidad

- Ronda revisada: `15-REVISION-DOCTOR.md`, generado el 2026-08-13 desde
  `data/copy-guias.json`, `data/copy-servicios.json`, `data/copy-sedes.json` y
  `data/copy-blog.json`.
- Paquetes que este sello libera: los 16 documentos con copy clínico completo en `paquetes/`
  (guías clínicas, páginas de servicio y fichas de sede con secciones de tipo `clinico`).
- Handoff que consume este registro: `15-HANDOFF-V11-ONPAGE.md`, sección 5 ("La restricción que
  sigue viva").
