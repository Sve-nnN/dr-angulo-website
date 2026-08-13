---
phase: 08-silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
plan: 17
subsystem: contenido
tags: [sedes, silo-clinico, on-page, refactor, modelo-de-datos, puertas]
requires:
  - src/components/content/content-body.tsx
  - src/content/locations.ts
  - seo-tools/data/copy-sedes.json
provides:
  - "src/content/location-pages/ como directorio: types.ts, index.ts y un modulo por sede"
  - "LocationPage.sections, outboundLinks, ctaBanner, publishedAt, updatedAt y bannerAfterSectionId"
  - "La plantilla de sede renderiza cuerpo largo con ContentBody, indice, banner, firma y aviso"
  - "El esqueleto ficha-de-sede declarado en scripts/check-content.mjs"
  - /sedes/clinica-ricardo-palma
  - /sedes/clinica-tezza
affects: [08-18, 08-19, fase 10 title y meta]
tech-stack:
  added: []
  patterns:
    - "Un modulo de datos por pagina, con la ruta de importacion publica intacta"
    - "Transcripcion mecanica desde el dataset sellado, no desde el Markdown del paquete"
    - "El bloque heredado se calla cuando la seccion del paquete cubre el mismo tema"
key-files:
  created:
    - src/content/location-pages/types.ts
    - src/content/location-pages/index.ts
    - src/content/location-pages/consultorio-privado.ts
    - src/content/location-pages/clinica-ricardo-palma.ts
    - src/content/location-pages/sanna-la-molina.ts
    - src/content/location-pages/clinica-tezza.ts
  modified:
    - src/content/location-pages.ts
    - src/app/sedes/[slug]/page.tsx
    - src/components/ui/mid-content-cta.tsx
    - scripts/check-content.mjs
    - scripts/check-sedes.mjs
decisions:
  - "El archivo suelto queda como barril delgado, como pide el plan, en vez de borrarse como hizo el 08-05"
  - "Con cuerpo publicado, gettingThere y conditionsLead dejan de renderizarse: el paquete cubre los dos temas"
  - "El banner de sede no ofrece el chat del doctor: MidContentCta gana withWhatsApp"
  - "El h1 esperado de las dos sedes se movio en la puerta dentro del mismo commit que lo cambia"
metrics:
  duration: 55min
  completed: 2026-08-13
requirements-completed: [SVC-05]
status: complete
---

# Phase 8 Plan 17: las fichas de sede se abren al cuerpo largo

**`location-pages.ts` se convirtió en un directorio con un módulo por sede, la plantilla de sede aprendió a renderizar cuerpo largo con el mismo componente que ya usan las guías, los posts y el hub, y la Clínica Ricardo Palma y la Clínica Padre Luis Tezza publican sus 1656 y 1553 palabras de copy aprobado sin afirmar ninguno de los cuatro datos operativos que nadie confirmó.**

## Performance

| Métrica | Valor |
|---|---|
| Duración | 55 min |
| Tareas | 3 de 3 |
| Commits | 3 |
| Archivos creados | 6 |
| Archivos modificados | 5 |

## Qué se hizo

**Task 1 — el modelo y la plantilla.** El archivo único de la fase 9 se partió con un script que corta cada entrada verbatim del arreglo, así que ninguna palabra del texto publicado pasó por un teclado. Quedaron `types.ts` con el tipo, `index.ts` con el registro y `getLocationPage`, y cuatro módulos de sede. `src/content/location-pages.ts` sobrevive como barril delgado y ninguno de sus diez consumidores cambió su import.

`LocationPage` sumó `sections: ContentSection[]` y `outboundLinks`, más tres campos que el cuerpo largo necesita y que el plan no había previsto: `ctaBanner`, `publishedAt`/`updatedAt` para la firma, y `bannerAfterSectionId`. No hay campo `format`: las cuatro sedes son `ficha-de-sede` y el esqueleto se declara en la puerta.

La plantilla renderiza `page.sections` con `ContentBody`, envuelve la banda de cabecera y el artículo con `ContentBodyBoundary`, y suma índice, banner, firma y aviso educativo de cierre. Todo lo nuevo está condicionado a que la sede tenga cuerpo: con `sections` vacío las cuatro sedes renderizaron 361, 398, 412 y 394 palabras, exactamente el mismo conteo que antes del plan.

**Task 2 — el copy aprobado.** Los dos módulos se generaron desde `seo-tools/data/copy-sedes.json`, con el `id` tomado del campo `clave` y los párrafos literales del arreglo `parrafos`: 16 secciones por sede, 5 de nivel 2 con las claves del esqueleto en orden y 11 de nivel 3, más los 6 `enlacesPropuestos` de cada una convertidos en `outboundLinks`. El `h1` pasó al valor del dataset en las dos; `title` y `description` quedaron intactos para la fase 10.

El cuerpo no copia el NAP: dirección, horario y canales se siguen derivando de `locations.ts` en tiempo de render. Ninguno de los dos módulos menciona el número del doctor, y el banner de conversión de una sede de clínica solo empuja a `/agendar`.

**Task 3 — las puertas.** `check-content.mjs` declara el esqueleto `ficha-de-sede` con sus cinco claves copiadas de `serp-onpage.ts` y verifica que las secciones con ancla de una ruta con formato salgan en ese orden exacto y sin ninguna de más. Las dos rutas publicadas entraron al `MANIFEST` con tipo `sede`; las otras dos las suma el plan 08-18. `checkSources` enumera además `src/content/location-pages`, así que las salvaguardas de primera persona y de campos prohibidos cubren el contenido nuevo. `SITEMAP_TOTAL` sigue en 22.

## Datos operativos que siguen pendientes de confirmación

Se transcriben acá porque son material de planificación y no copy: la tabla no se publicó en el sitio. El copy aprobado no afirma ninguno de los cuatro y en dos de los casos dice de frente que el dato todavía no está publicado.

| Sede | Dato | Estado en el paquete |
|---|---|---|
| Clínica Ricardo Palma | Piso y número de consultorio dentro de la clínica | pendiente, sin dato publicado. Lo confirma la clínica |
| Clínica Ricardo Palma | Seguros y convenios que la sede acepta para esta consulta | pendiente, sin dato publicado. Lo define la clínica y cambia con el tiempo |
| Clínica Padre Luis Tezza | Planes de salud, seguros y convenios vigentes | pendiente, sin dato publicado. La SERP lo pregunta de frente y la prosa explica de quién depende, sin afirmarlo |
| Clínica Padre Luis Tezza | Piso y número de consultorio dentro de la clínica | pendiente, sin dato publicado |

Ninguno se completó, se dedujo de otra sede ni se redondeó. Sobre precio no se publicó ninguna cifra: la salvaguarda de soles y de porcentaje de la puerta corre sobre el cuerpo de las dos rutas y pasó.

Los seis pendientes restantes de las otras dos sedes siguen abiertos y son asunto del plan 08-18.

## Deviations from Plan

**1. [Regla 2 - Funcionalidad crítica faltante] El cuerpo largo necesita tres campos que el plan no listaba**
- **Encontrado en:** Task 1
- **Problema:** al entrar al `MANIFEST` de la puerta de contenido, una ruta queda obligada a tener firma con dos fechas, banner de conversión en el primer tercio e índice. `LocationPage` no tenía dónde declarar ni las fechas ni el texto del banner.
- **Arreglo:** `ctaBanner`, `publishedAt`, `updatedAt` y `bannerAfterSectionId`, los cuatro opcionales: una sede sin cuerpo no los declara y no cambia en nada.
- **Archivos:** `src/content/location-pages/types.ts`
- **Commit:** f67c44c

**2. [Regla 2] El banner de conversión ofrecía el chat del doctor en una sede de clínica**
- **Encontrado en:** Task 1
- **Problema:** `MidContentCta` renderiza siempre un botón de WhatsApp. En Ricardo Palma y en Tezza eso rompe la regla de negocio que documenta `locations.ts` y manda al paciente a reservar donde no se puede reservar (T-08-46).
- **Arreglo:** el componente gana `withWhatsApp`, que la plantilla de sede pasa según `isOwnOffice`. El banner de las dos clínicas se queda con `/agendar`.
- **Archivos:** `src/components/ui/mid-content-cta.tsx`
- **Commit:** f67c44c

**3. [Regla 3 - Bloqueo] `check-sedes.mjs` buscaba las sedes en un archivo que dejó de existir**
- **Encontrado en:** Task 1
- **Problema:** la puerta leía `src/content/location-pages.ts` y exigía encontrar ahí los cuatro slugs. Con el split, el barril no los nombra y la puerta falló en las cuatro sedes.
- **Arreglo:** ahora exige el módulo por slug dentro del directorio y la existencia del registro. Es más estricta que antes: una sede sin módulo propio ya no pasa por mención suelta.
- **Archivos:** `scripts/check-sedes.mjs`
- **Commit:** f67c44c

**4. [Regla 3] El `h1` nuevo se movió en la puerta dentro del commit de la Task 2**
- **Problema:** el plan pone la actualización del `h1` esperado en la Task 3, pero el commit de la Task 2 habría quedado con la puerta de sedes en rojo, en un repositorio que despliega desde `main`.
- **Arreglo:** las dos líneas del `MANIFEST` de `check-sedes.mjs` viajaron con el cambio que las rompe. El `title` no se tocó.
- **Commit:** 337f014

## Decisiones

**El bloque heredado se calla cuando el paquete cubre su tema.** Con cuerpo publicado, `gettingThere` y `conditionsLead` dejan de renderizarse: el paquete trae `como-llegar` y `que-se-atiende` escritos entero, y dejar los dos textos habría hecho que la página explicara dos veces cómo llegar con palabras distintas. Los campos no se borran del modelo, porque las otras dos sedes todavía los usan. Los bloques de datos que salen de `locations.ts` sí se conservan, con encabezados retitulados a "Dirección y mapa", "Horario vigente", "Canales de cita de la sede" y "Guías de las condiciones que atiende" para que no compitan con los del paquete.

**El archivo suelto quedó como barril.** El plan lo pide explícitamente, a diferencia del 08-05, que borró los suyos. Resuelve igual: TypeScript toma el archivo antes que el directorio y el barril reexporta el índice.

**El banner cae en distinto sitio en cada sede.** En Ricardo Palma va detrás de `como-llegar`; en Tezza esa frontera caía muy cerca del piso del 15 por ciento, así que se ancló a la primera subsección de `que-se-atiende`. La puerta confirma la posición sobre el HTML real.

## Puertas

| Comprobación | Resultado |
|---|---|
| `npx tsc --noEmit` | código 0 |
| `npm run lint` | limpio |
| `npm run build` | verde, 22 rutas |
| `node scripts/check-content.mjs` | sin fallas en 11 rutas |
| `node scripts/check-sedes.mjs` | sin fallas en 4 sedes |
| `node scripts/check-seo.mjs` | sin fallas |
| `grep -c "SITEMAP_TOTAL = 22"` | 1 |
| Conteo de palabras con `sections` vacío | 361, 398, 412, 394 antes y después |
| `grep -c "964305682"` en los dos módulos | 0 |

## Lo que hereda el plan 08-18

Las dos sedes que faltan, `consultorio-privado` y `sanna-la-molina`, ya tienen su módulo en `src/content/location-pages/` con `sections: []` y renderizan igual que siempre. Para publicarlas alcanza con:

- Llenar `sections` desde `seo-tools/data/copy-sedes.json`, con el `id` del campo `clave` y los párrafos literales, y `outboundLinks` desde `enlacesPropuestos`.
- Declarar `ctaBanner`, `publishedAt`, `updatedAt` y `bannerAfterSectionId`. Sin `ctaBanner` no hay banner y la puerta de contenido falla en cuanto la ruta entre al `MANIFEST`.
- Pasar el `h1` al del dataset y mover el `h1` esperado en `scripts/check-sedes.mjs` en el mismo commit. El `title` no se toca.
- Sumar las dos rutas al `MANIFEST` de `scripts/check-content.mjs` con `type: "sede"` y `format: "ficha-de-sede"`. El esqueleto ya está declarado.
- `SITEMAP_TOTAL` no se mueve: las cuatro rutas ya existían.
- El consultorio privado es la única sede donde el chat del doctor es el canal correcto, así que su banner sí puede llevar WhatsApp: la plantilla ya lo resuelve sola con `isOwnOffice`.

Ojo con una diferencia: el consultorio es la única sede de tipo `consultorio` y su bloque de agenda renderiza otra rama de la plantilla. Vale la pena mirar el HTML prerenderizado antes de dar la ruta por publicada.

## Verificación humana pendiente

Las dos páginas pasaron de 400 a más de 1500 palabras y cambiaron de forma: ahora abren con índice y cierran con firma y aviso. Que el índice, el banner y los bloques de datos se lean bien a 375px y a 1440px es juicio visual y queda para la ronda de verificación de la fase.

## Self-Check: PASSED

Los seis archivos del directorio existen en disco y los tres commits (`f67c44c`, `337f014`, `dee3576`) están en `git log`.
