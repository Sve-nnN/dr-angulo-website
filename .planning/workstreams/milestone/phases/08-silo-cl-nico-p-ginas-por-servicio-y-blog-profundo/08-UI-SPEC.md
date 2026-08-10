---
phase: 8
slug: silo-cl-nico-p-ginas-por-servicio-y-blog-profundo
status: draft
shadcn_initialized: false
preset: none
created: 2026-08-10
---

# Fase 8 — Contrato de diseño de interfaz

> Contrato visual y de interacción del silo clínico. Lo genera gsd-ui-researcher y lo verifica gsd-ui-checker.
> Todo lo que dice este documento se apoya en tokens y componentes que ya existen en v1.0. La fase no inventa lenguaje visual nuevo.

---

## Sistema de diseño

| Propiedad | Valor |
|-----------|-------|
| Tool | propio (`design-system/dr-angulo/MASTER.md` + tokens en `src/app/globals.css`) |
| Preset | no aplica |
| shadcn | no inicializado y no se inicializa. `components.json` no existe y meterlo ahora rompería la consistencia de v1.0 |
| Component library | ninguna. Componentes propios en `src/components/ui/` |
| Icon library | `lucide-react` ^1.28.0 |
| Fuentes | Poppins (`--font-heading`) e Inter (`--font-sans`), ambas vía `next/font/google` |
| CSS | Tailwind CSS 4 con `@theme inline` en `src/app/globals.css` |

**Regla base de la fase:** ningún valor de color, tipografía, radio, sombra o espaciado nuevo. Todo sale de los tokens ya declarados. Si algo parece necesitar un valor nuevo, es señal de que el patrón elegido está mal.

---

## Escala de espaciado

Valores declarados, todos múltiplos de 4:

| Token | Valor | Uso en esta fase |
|-------|-------|------------------|
| xs | 4px | Separación entre ícono y texto en enlaces pequeños (`gap-1`) |
| sm | 8px | `gap-2` de los CTA, separación interna de la firma |
| md | 16px | `gap-4`, padding lateral móvil (`px-4`) |
| lg | 24px | Padding interno de tarjeta y banner (`p-6`), `gap-6` de la grilla del hub |
| xl | 32px | Padding del banner en escritorio (`sm:p-8`), `mt-8` |
| 2xl | 48px | Separación entre secciones `h2` dentro del cuerpo (`mt-12`) |
| 3xl | 64px | Separación entre bloques mayores de página (`mt-14` a `mt-16` en escritorio) |

Contenedores heredados de v1.0, sin cambios:

| Superficie | Contenedor |
|------------|------------|
| `/servicios` (hub) | `mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20` |
| `/servicios/[slug]` | `mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20` |
| `/blog/[slug]` | `mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20` |

**Excepciones:** dos, ambas justificadas.
1. `min-h-11` (44px) en las entradas de la tabla de contenidos y en el enlace de la tarjeta del hub, para cumplir el objetivo táctil de 44x44 del checklist de `MASTER.md`. 44 no es múltiplo de 4 en la escala, es un mínimo de accesibilidad.
2. `scroll-mt-28` (112px) en cada destino de ancla, que ya es el patrón vigente en `src/app/servicios/page.tsx`. Acompaña a `scroll-padding-top: 5.5rem` de `globals.css` y al header sticky de 72px (`h-18`).

---

## Tipografía

La fase no introduce ningún tamaño ni peso nuevo. Reusa la escala de v1.0.

| Rol | Tamaño | Peso | Interlineado | Clases |
|-----|--------|------|--------------|--------|
| Cuerpo largo | 18px | 400 | 1.556 (por defecto de `text-lg`) | `text-lg text-foreground/80` |
| Cuerpo secundario | 16px | 400 | 1.5 | `text-base text-foreground/80` |
| Etiqueta / metadatos | 14px | 400 y 600 | 1.43 | `text-sm text-foreground/70` |
| Encabezado de sección (`h2`) | 24px móvil / 30px escritorio | 700 | 1.2 | `font-heading text-2xl font-bold text-primary sm:text-3xl` |
| Subtema (`h3`) | 18px | 700 | 1.33 | `font-heading text-lg font-bold text-primary` |
| Display (`h1`) | 30px móvil / 36px escritorio | 800 | 1.2 | `font-heading text-3xl font-extrabold text-primary sm:text-4xl` |

Pesos declarados: **dos por familia**. Poppins en 700 y 800 para encabezados, Inter en 400 y 600 para cuerpo y etiquetas. Nada de 500, nada de 600 en Poppins dentro de esta fase.

**Decisión medida sobre el interlineado del cuerpo largo.** El instinto en artículos de 900+ palabras es subir a `leading-relaxed` (1.625). No se hace. `text-lg` de Tailwind ya rinde 1.556, que está dentro del rango cómodo de lectura, y cambiarlo desplazaría verticalmente los cuatro posts que ya existen. Se conserva el valor actual.

**Ancho de medida.** El cuerpo largo vive dentro de `max-w-2xl` (672px), que a 18px da entre 65 y 75 caracteres por línea. No ampliar el contenedor de las páginas de servicio a `max-w-4xl` aunque el hub lo use: son documentos de lectura, no índices.

---

## Color

| Rol | Token | Valor | Uso |
|-----|-------|-------|-----|
| Dominante (60%) | `--background` | `#FAFAF9` | Fondo de página y del cuerpo del artículo |
| Secundario (30%) | `--muted` / `--border` | `#ECFAFA` / `#D7EFEF` | Superficie del banner de CTA, superficie del aviso educativo, bordes de tarjeta y separadores |
| Acento (10%) | `--accent` | `#E8971F` | Ver lista cerrada abajo |
| Texto | `--foreground` | `#1F2937` | Cuerpo, con `/80` y `/70` para jerarquía secundaria |
| Marca | `--primary` / `--primary-dark` | `#0E7C7E` / `#0A6265` | Encabezados y enlaces |
| Acento legible | `--accent-strong` | `#9A5C00` | Etiquetas pequeñas de énfasis, nunca fondo |
| Destructivo | `--destructive` | `#DC2626` | No se usa. Esta fase no tiene acciones destructivas |

### El acento queda reservado exclusivamente para

1. La superficie del botón "Agendar consulta" (`BookingCta`) del banner del primer tercio.
2. La superficie del botón "Agendar consulta" del CTA de cierre.
3. La superficie del botón de WhatsApp en variante `accent` del CTA de cierre.
4. ~~Una barra decorativa de 4px al borde izquierdo del banner de CTA (`border-l-4 border-l-accent`).~~ **Revertido el 2026-08-10.** El banner se distingue con `bg-muted` más `border-border`, que es el tratamiento que ya usa v1.0. Motivo: la barra lateral de color no aparece en ninguna parte del código de v1.0, así que contradecía el principio de este mismo spec de replicar el lenguaje visual existente en vez de inventar uno nuevo. Es además un patrón muy reconocible de interfaz generada por IA. El dorado sigue presente en el banner a través del botón `BookingCta`, así que la lista cerrada de usos del acento baja de 4 a 3 sin perder presencia de marca.

Fuera de esa lista, el dorado no aparece. En particular: **no** en las tarjetas del hub, **no** en la tabla de contenidos, **no** en la firma del autor, **no** en el aviso educativo, **no** como color de texto en ningún tamaño.

### Contrastes verificados

Calculados sobre los hex reales de `globals.css`, no estimados.

| Combinación | Ratio | Veredicto |
|-------------|-------|-----------|
| `--foreground` `#1F2937` sobre `--background` `#FAFAF9` | 14.09:1 | pasa AAA |
| `text-foreground/80` (`#4B535E` compuesto) sobre `--background` | 7.45:1 | pasa AAA |
| `text-foreground/70` (`#616871` compuesto) sobre `--background` | 5.39:1 | pasa AA en texto pequeño |
| `--foreground` sobre `--muted` `#ECFAFA` | 13.70:1 | pasa AAA |
| `--primary-dark` `#0A6265` sobre `--background` | 6.31:1 | pasa AA en cualquier tamaño |
| `--primary-dark` sobre `--muted` | 6.16:1 | pasa AA en cualquier tamaño |
| `--accent-strong` `#9A5C00` sobre `--background` | 5.15:1 | pasa AA en cualquier tamaño |
| `--foreground` sobre superficie `--accent` `#E8971F` | 6.21:1 | pasa AA. Por eso el botón dorado lleva texto oscuro, nunca blanco |
| Anillo de foco `--ring` `#0E7C7E` sobre `--background` | 4.37:1 | pasa el 3:1 de indicador de foco |
| **`--primary` `#0E7C7E` sobre `--background`** | **4.37:1** | **no llega al 4.5:1 de texto normal** |
| Superficie `--accent` contra `--background` | 2.27:1 | no llega al 3:1 de límite de control |
| Superficie `--accent` contra `--muted` | 2.21:1 | no llega al 3:1 de límite de control |
| `--accent-dark` `#C97D0F` contra `--background` | 3.13:1 | pasa el 3:1 |
| `--accent-dark` contra `--muted` | 3.05:1 | pasa el 3:1 |

### Reglas de color que salen de esos números

**COLOR-01.** Todo texto de menos de 24px, o de menos de 18.66px en negrita, que vaya en color de marca usa `text-primary-dark`, nunca `text-primary`. Aplica a las entradas de la tabla de contenidos, al enlace de vuelta al hub, a los enlaces internos dentro del cuerpo del artículo, al enlace de la firma hacia `/sobre-el-doctor` y a los enlaces hacia los posts relacionados.

**COLOR-02.** `text-primary` sigue siendo válido en `h1`, `h2` y `h3`, porque a 18px en peso 700 o más ya cuentan como texto grande y les basta 3:1.

**COLOR-03.** Los CTA de acento llevan `ring-1 ring-accent-dark` para que el botón se distinga de su fondo con 3.05:1 o más. Se implementa dentro de los componentes compartidos `BookingCta` y del variante `accent` de `WhatsAppCta`, no como clase suelta en cada uso. El cambio visual es un borde de 1px, y aplica a todo el sitio de forma deliberada.

**COLOR-04.** La barra dorada de 4px del banner es decorativa. No comunica estado, jerarquía ni disponibilidad, y por eso su 2.21:1 contra `--muted` es admisible. Si en algún momento pasa a significar algo, deja de ser admisible.

**COLOR-05.** El borde `--border` `#D7EFEF` contra el fondo da 1.15:1. Sirve como límite visual suave y nada más. Nunca es el único indicador de que algo es interactivo.

### Deuda de accesibilidad registrada, fuera de alcance

Varias superficies de v1.0 usan `text-primary` en texto pequeño y quedan en 4.37:1, por debajo del 4.5:1 exigido: "Volver al blog" en `src/app/blog/[slug]/page.tsx`, "Qué incluye" y "Cómo se opera" en `src/app/page.tsx`, "Cómo llegar" y los canales de sede en `src/components/locations/location-card.tsx`, y los títulos enlazados del listado de `/blog`. **Esta fase no los corrige.** Queda anotado acá para que no se pierda y para que se resuelva en una pasada propia de accesibilidad.

---

## Inventario de componentes

### Nuevos

| Componente | Ruta | Tipo | Responsabilidad |
|------------|------|------|-----------------|
| `TableOfContents` | `src/components/ui/table-of-contents.tsx` | Server | `nav` etiquetado con la lista de secciones `h2` y sus anclas |
| `MidContentCta` | `src/components/ui/mid-content-cta.tsx` | Server | Banner del primer tercio: título, texto, `BookingCta` y enlace de WhatsApp |
| `AuthorByline` | `src/components/ui/author-byline.tsx` | Server | Firma del doctor, credenciales de `cv.ts`, fecha de publicación y de actualización |
| `MedicalDisclaimer` | `src/components/ui/medical-disclaimer.tsx` | Server | Aviso de contenido educativo |
| `ServiceCard` | `src/components/services/service-card.tsx` | Server | Tarjeta del hub hacia una página hija |

### Modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/ui/booking-cta.tsx` | Suma `ring-1 ring-accent-dark` |
| `src/components/ui/whatsapp-cta.tsx` | Suma `ring-1 ring-accent-dark` al variante `accent` |
| `src/lib/site-config.ts` | Dos claves nuevas en `whatsappMessages`, que amplían `CtaLocation` |
| `src/app/servicios/page.tsx` | Suma la sección de tarjetas hacia las cuatro hijas |
| `src/app/blog/[slug]/page.tsx` | Suma tabla de contenidos, firma, banner, aviso y CTA de cierre |
| `src/components/structured-data.tsx` | Suma `MedicalWebPageJsonLd`, extiende `BlogPostingJsonLd` con `dateModified` real |
| `src/content/blog.ts` | El tipo `BlogPost` pasa de `paragraphs` a secciones con encabezado |

### Nuevos, de ruta y datos

| Archivo | Contenido |
|---------|-----------|
| `src/app/servicios/[slug]/page.tsx` | Plantilla única de las cuatro páginas, con `generateStaticParams` |
| `src/content/service-pages.ts` | Las cuatro entradas de datos |

### Nada de esto se crea

No se crea un componente de tarjeta genérico, ni un sistema de tipografía tipo `prose`, ni un `Callout` reutilizable, ni un contenedor de layout nuevo. Cinco componentes, cada uno con un uso concreto.

---

## Modelo de datos que sostiene el contrato visual

El orden fijo e idéntico de las ocho secciones no se garantiza revisando cuatro archivos a mano. Se garantiza por construcción.

```ts
// src/content/service-pages.ts
export const SERVICE_SECTION_ORDER = [
  "que-es",
  "sintomas",
  "cuando-consultar",
  "diagnostico",
  "tratamiento",
  "recuperacion",
  "preguntas-frecuentes",
] as const;

export type ServiceSectionId = (typeof SERVICE_SECTION_ORDER)[number];
```

Cada página aporta un `Record<ServiceSectionId, ServiceSection>`. La plantilla recorre `SERVICE_SECTION_ORDER`, no las llaves del objeto. Consecuencias del diseño:

- Si falta una sección, TypeScript rompe el build. No hay página incompleta posible.
- El orden es idéntico en las cuatro por definición, no por disciplina.
- La tabla de contenidos se deriva del mismo array, así que jamás puede desincronizarse de lo que se renderiza.
- La sección de CTA de cierre **no** entra en `SERVICE_SECTION_ORDER`. Es un cierre de página, no una sección de contenido, y no aparece en la tabla de contenidos.

La sección `tratamiento` es la única que admite `subsections`, con exactamente dos: manejo conservador y opción quirúrgica. Son los únicos `h3` de la página junto a las preguntas frecuentes.

Los posts del blog adoptan la misma forma: un `intro: string[]` antes del primer `h2` y luego `sections: { id, heading, paragraphs, subsections? }[]`, con `id` en kebab-case derivado del encabezado y estable en el tiempo, porque son anclas compartibles.

---

## Contrato de accesibilidad

Requisitos verificables, numerados para que el auditor los pueda marcar uno por uno. No hay ninguno que diga "seguir buenas prácticas".

### Jerarquía de encabezados

**A11Y-01.** Exactamente un `h1` por página. En `/servicios/[slug]` es el nombre de la condición. En `/blog/[slug]` es el título del post.

**A11Y-02.** Cada una de las siete secciones de contenido de una página de servicio es un `h2`. Ningún `h2` adicional fuera de esas siete más el del CTA de cierre.

**A11Y-03.** Los `h3` solo aparecen dentro de `tratamiento` (dos: conservador y quirúrgico) y dentro de `preguntas-frecuentes` (uno por pregunta). Ningún `h3` sin un `h2` que lo anteceda.

**A11Y-04.** Cero saltos de nivel. Nunca un `h4` sin `h3`, nunca un `h3` como primer encabezado bajo el `h1`.

**A11Y-05.** El título de la tabla de contenidos **no** es un encabezado. Es un `<p id="toc-title">` con estilo de encabezado pequeño, referenciado por `aria-labelledby` desde el `nav`. Razón: la tabla de contenidos es navegación, no una sección de contenido. Dejarla fuera del esquema de encabezados hace que ese esquema coincida uno a uno con las entradas de la tabla, que es exactamente lo que Juan pidió.

**A11Y-06.** Verificación: recorrer el DOM renderizado de las ocho URLs afectadas y comprobar que la secuencia de `h1`/`h2`/`h3` no salta niveles y que hay un solo `h1`.

### Tabla de contenidos

**A11Y-07.** Marcado obligatorio:

```tsx
<nav aria-labelledby="toc-title" className="...">
  <p id="toc-title" className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70">
    En esta página
  </p>
  <ol className="mt-3 space-y-1">
    <li>
      <a href="#que-es" className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline">
        Qué es una hernia discal
      </a>
    </li>
  </ol>
</nav>
```

Es un `nav` con nombre accesible, y una lista real `ol` con un `li` por entrada. No una tira de `div`, no una `ul` sin semántica.

**A11Y-08.** La tabla de contenidos lista únicamente los `h2` de contenido. Los `h3` no entran: en un documento de dos niveles de profundidad, anidar la tabla agrega ruido sin agregar orientación.

**A11Y-09.** Si una página tiene menos de tres secciones, la tabla no se renderiza. Una lista de dos entradas es peor que ninguna.

**A11Y-10.** Cada entrada tiene un área de toque de 44px como mínimo: `block min-h-11 py-2.5`. Verificable midiendo el rectángulo del enlace a 375px de ancho.

**A11Y-11.** El texto de la entrada es idéntico, carácter por carácter, al del `h2` destino. Nada de versiones abreviadas.

**A11Y-12.** Los textos largos hacen wrap. Cero `truncate`, cero `line-clamp`, cero puntos suspensivos en la tabla de contenidos.

### Destinos de ancla y foco

**A11Y-13.** Cada `h2` destino lleva `id`, `tabIndex={-1}` y `scroll-mt-28`. El `tabIndex={-1}` hace que el navegador mueva el foco al encabezado al activar el enlace, en vez de solo desplazar la vista y dejar el foco atrás en la tabla.

**A11Y-14.** El foco recibido por el encabezado es visible. Lo cubre la regla global de `globals.css`, que ya incluye `[tabindex]` en su selector: `outline: 3px solid var(--ring); outline-offset: 2px`. No hace falta CSS nuevo, y está prohibido anular esa regla con `outline-none` en cualquier componente de esta fase.

**A11Y-15.** Los `id` son estables y en kebab-case sin tildes: `que-es`, `sintomas`, `cuando-consultar`, `diagnostico`, `tratamiento`, `recuperacion`, `preguntas-frecuentes`. Se escriben en el archivo de datos, no se generan por slug del título en tiempo de render, porque un cambio de redacción rompería enlaces ya compartidos.

**A11Y-16.** Ningún destino de ancla queda debajo del header sticky. `scroll-padding-top: 5.5rem` (88px) ya cubre el header de 72px. Verificable navegando a cada ancla a 375px y comprobando que el `h2` es visible completo.

**A11Y-17.** El `outline-offset: 2px` del anillo de foco es obligatorio y no se reduce a cero en ningún control sobre superficie de acento. Sobre el dorado, el anillo teal daría 1.93:1; con el desplazamiento de 2px el anillo se mide contra el fondo de página, donde da 4.37:1 y pasa.

### Objetivos táctiles

**A11Y-18.** `BookingCta` y `WhatsAppCta` en tamaño `md` miden 48px de alto (`py-3` sobre `text-base` con interlineado 24px). Se conservan tal cual.

**A11Y-19.** El enlace de cada tarjeta del hub cubre toda la tarjeta mediante enlace extendido, así que el objetivo táctil es el área completa de la tarjeta.

**A11Y-20.** El enlace de WhatsApp secundario dentro del banner es `inline-flex min-h-11 items-center`, no un enlace de texto suelto de 20px de alto.

### Tarjetas del hub

**A11Y-21.** La tarjeta es un `<article>` con `position: relative`. Dentro hay un solo elemento interactivo: el `<a>` que envuelve el `h3` y que se extiende con `after:absolute after:inset-0`. Prohibido meter un segundo enlace o botón dentro de la tarjeta: el enlace extendido lo taparía y quedaría inalcanzable con el mouse.

**A11Y-22.** El nombre accesible del enlace es el nombre de la condición, no "Leer más". La flecha `ArrowRight` de Lucide lleva `aria-hidden="true"`.

**A11Y-23.** El foco visible se dibuja sobre la tarjeta completa, no sobre el texto del `h3`. Se logra con `focus-within:outline` en el `article` y `focus-visible:outline-none` limitado al `<a>` extendido. Esta es la única excepción autorizada a A11Y-14, y solo porque el indicador se traslada a un elemento mayor, nunca porque desaparezca.

**A11Y-24.** El hover de la tarjeta usa `hover:shadow-md` y `motion-reduce:hover:translate-y-0` si incluye desplazamiento, igual que los CTA existentes. La transición dura entre 150ms y 300ms.

### Movimiento y responsive

**A11Y-25.** Nada de contenido que dependa de JavaScript para ser visible. La tabla de contenidos, el banner, la firma y el aviso se renderizan en el servidor y existen en el HTML inicial.

**A11Y-26.** Sin scroll horizontal a 320px, 375px, 768px, 1024px y 1440px. La grilla de tarjetas es de una columna hasta `sm`.

**A11Y-27.** El bloque de `prefers-reduced-motion` de `globals.css` ya cubre las transiciones nuevas. Ningún componente de esta fase declara animación propia.

### Idioma y lectura

**A11Y-28.** Todo el contenido nuevo es `es-PE`, heredado del `lang` del layout raíz. Ninguna sección declara idioma propio.

**A11Y-29.** Los enlaces que abren pestaña nueva conservan el patrón de v1.0: `target="_blank" rel="noopener noreferrer"` más un `<span className="sr-only">` que lo anuncia. Aplica al enlace de WhatsApp del banner.

---

## Superficies de la fase

### 1. `/servicios`, el hub

Se conserva íntegro el contenido de v1.0. Se suma **una** sección nueva, ubicada inmediatamente después del párrafo introductorio y **antes** de la lista de `serviceCategories`. Va arriba porque las cuatro URLs hijas son el motivo de existir de la fase y enterrarlas al pie las volvería invisibles.

Estructura:

```
h1  Especialidades y condiciones que trato          (existente, sin cambios)
p   Cada consulta empieza con...                    (existente, sin cambios)
h2  Condiciones que explico en detalle              (NUEVO)
    grid de 4 ServiceCard
    (lista existente de serviceCategories)          (sin cambios)
h2  Cómo se opera...                                (existente, sin cambios)
h2  ¿No estás seguro de qué necesitas?              (existente, sin cambios)
```

Grilla: `grid gap-6 sm:grid-cols-2`. Cuatro tarjetas hoy, pero la grilla debe verse bien con tres o cinco.

Tarjeta:

```tsx
<article className="relative rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-ring">
  <h3 className="font-heading text-lg font-bold text-primary">
    <Link href={`/servicios/${page.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
      {page.navLabel}
    </Link>
  </h3>
  <p className="mt-2 text-foreground/80">{page.cardSummary}</p>
  <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark">
    Leer la guía
    <ArrowRight className="size-3.5" aria-hidden="true" />
  </p>
</article>
```

`rounded-2xl` y no los 12px de `MASTER.md`: las superficies que ya están en producción usan 16px, y la coherencia con lo que se ve pesa más que la tabla del documento maestro. Queda anotado como desviación consciente.

**Guardia de regresión:** los `id` de sección del hub (`#columna`, `#traumatologia`, `#ortopedia-infantil`, `#procedimientos`) no se tocan. La home enlaza a `/servicios#{slug}` desde tres lugares y desde `#procedimientos` desde un cuarto. Borrar o renombrar cualquiera de esos `id` rompe enlaces internos vivos.

### 2. `/servicios/[slug]`, las cuatro páginas

Orden vertical exacto, idéntico en las cuatro:

```
h1        Nombre de la condición
          AuthorByline
          MedicalDisclaimer                     <- pegado a la firma
          TableOfContents
h2        Qué es                        #que-es
h2        Síntomas                      #sintomas
          MidContentCta                         <- ver POS-01
h2        Cuándo consultar              #cuando-consultar
h2        Cómo se diagnostica           #diagnostico
h2        Opciones de tratamiento       #tratamiento
  h3        Manejo conservador
  h3        Cuándo se plantea la cirugía
h2        Recuperación                  #recuperacion
h2        Preguntas frecuentes          #preguntas-frecuentes
  h3        (una por pregunta)
h2        CTA de cierre
          Enlace de vuelta al hub
          Enlaces a posts relacionados
```

Las preguntas frecuentes se renderizan como `h3` más párrafo, **sin acordeón**. El acordeón `details.accordion` queda reservado a `/preguntas-frecuentes`, donde la lista es larga. Acá son tres o cuatro preguntas, el contenido conviene visible sin interacción, y evita el patrón ambiguo de meter un encabezado dentro de un `summary`.

El enlace de vuelta al hub va al pie, con el mismo patrón de `ArrowLeft` que usa `/blog/[slug]`, pero en `text-primary-dark` por COLOR-01.

### 3. `/blog/[slug]`, los cuatro posts

```
          Volver al blog                        (existente, pasa a text-primary-dark)
h1        Título del post                       (existente)
          AuthorByline                          <- reemplaza la fecha suelta actual
          MedicalDisclaimer
          TableOfContents
          intro                                 (párrafos antes del primer h2)
h2        Primera sección
          MidContentCta                         <- ver POS-01
h2 ...    resto de secciones
h2        CTA de cierre                         (el bloque actual, con h2 real)
          Enlace a la página de servicio del tema
```

El bloque de cierre actual usa un `<p className="font-heading text-lg font-bold">` con aspecto de encabezado. Pasa a ser un `h2` real. Es texto que se ve como encabezado y no lo es, justo lo que A11Y-01 a A11Y-04 vienen a corregir.

El enlace hacia la página de servicio del tema sigue el mapa del CONTEXT: los dos posts de hernia y el de miedo a operarse van a `/servicios/hernia-discal`, y el de estenosis va a `/servicios/estenosis-espinal`.

---

## Salvaguardas de contenido firmado

Juan decidió que las páginas de servicio van **firmadas por el doctor**, con el riesgo delante: se le atribuye texto que todavía no escribió ni aprobó. La decisión se ejecuta y las salvaguardas se endurecen.

**SAFE-01. Revertido el 2026-08-10 por decisión de Juan.** Redacción original: "El aviso viaja pegado a la firma. `MedicalDisclaimer` se renderiza inmediatamente después de `AuthorByline`, arriba del pliegue, antes de la tabla de contenidos. No al pie. La atribución y la advertencia se leen juntas o el aviso no cumple su función." Juan pidió explícitamente que el aviso aparezca solo al cierre, no al inicio. Es su decisión y se ejecuta. Queda registrado que esto debilita la mitigación original: la atribución al doctor ya no se lee junto con la advertencia. El resto de las salvaguardas de contenido (SAFE-04 a SAFE-10) sigue vigente sin cambios y es lo que ahora carga más peso.

**SAFE-02. El aviso aparece una sola vez, al cierre**, después del CTA y de la firma. La aparición previa a la tabla de contenidos se quitó tanto en las páginas de servicio como en los posts del blog, para que el tratamiento sea consistente en todo el sitio.

**SAFE-03. El aviso es visible, no decorativo.** Superficie `bg-muted`, borde `border border-border`, `rounded-2xl p-6`, ícono `Info` de Lucide en `text-primary` con `aria-hidden="true"`, título en `font-heading text-base font-bold text-foreground` y cuerpo en `text-foreground/80` a 16px. Prohibido: `text-xs`, opacidad por debajo de `/70`, gris claro sobre gris, o colapsarlo dentro de un `details`.

**SAFE-04. Voz explicativa, nunca testimonial.** El tipo `ServiceSection` no expone, y no debe exponer, ningún campo tipo `experiencia`, `miExperiencia`, `casos`, `testimonio` ni equivalente. `AuthorByline` no acepta `children` ni ningún slot libre: renderiza nombre, especialidades, credenciales, fechas y enlace, y nada más. Si el componente no habilita el hueco, el hueco no se llena por descuido.

**SAFE-05. Cero primera persona sobre casos concretos.** El cuerpo de las páginas de servicio no dice "en mi experiencia", "he operado", "mis pacientes", "en los casos que atiendo" ni variantes. Verificable con búsqueda de esas cadenas sobre `src/content/service-pages.ts`.

**SAFE-06. Las credenciales de la firma salen exclusivamente de `src/content/cv.ts`.** `AuthorByline` importa `credentialsInfo` y no acepta credenciales por props. Hoy eso son CMP 83189, RNE 35310 y los años de ejercicio. Ninguna cadena de credencial se escribe a mano en JSX.

**SAFE-07. Fecha de actualización visible junto a la firma.** Dos fechas separadas, `publishedAt` y `updatedAt`, en elementos `<time dateTime>` con el `Intl.DateTimeFormat("es-PE")` que ya usan `/blog` y `/blog/[slug]`. Es lo que da trazabilidad cuando el doctor pida cambios tras revisar.

**SAFE-08. Cero UI que insinúe resultados.** No se especifica, y no se debe agregar: banda de estadísticas, contador de cirugías, porcentaje de éxito, plazo de recuperación en formato destacado, barra de progreso de recuperación, testimonio con cifra, sello de garantía, indicador de calificación. Si un plan futuro propone alguno de estos slots, se rechaza contra este renglón.

**SAFE-09. La recuperación se redacta en rangos cualitativos**, no en un dato numérico destacado tipográficamente. Nada de un "6 semanas" en 30px. El plazo, si aparece, va en el cuerpo del párrafo y en voz condicional.

**SAFE-10. Cero precio.** Ninguna superficie de esta fase muestra cifra de consulta. El dato de Doctoralia sigue sin confirmar.

Copia del aviso, que se usa literalmente:

> **Información educativa**
> Este contenido explica de forma general cómo se aborda esta condición y no reemplaza una consulta médica. Cada caso necesita una evaluación con estudios propios antes de indicar cualquier tratamiento. Si tienes síntomas, agenda una cita.

---

## Contrato de copy

| Elemento | Copy |
|----------|------|
| CTA principal, banner y cierre | Agendar consulta |
| CTA secundario de WhatsApp | Escribir por WhatsApp |
| Título de la tabla de contenidos, servicios | En esta página |
| Título de la tabla de contenidos, blog | En este artículo |
| Enlace de tarjeta del hub | Leer la guía |
| Encabezado de la sección de tarjetas | Condiciones que explico en detalle |
| Vuelta al hub desde una hija | Ver todas las especialidades |
| Enlace de post hacia su servicio | Leer la guía completa sobre {condición} |
| Enlace de la firma | Ver trayectoria completa |
| Fechas de la firma | Publicado el {fecha} · Actualizado el {fecha} |
| Título del aviso educativo | Información educativa |
| Cuerpo del aviso educativo | Ver el bloque literal al cierre de la sección de salvaguardas |
| Estado vacío: tabla de contenidos con menos de 3 secciones | No se renderiza nada. Ver A11Y-09 |
| Estado vacío: sección de preguntas frecuentes sin preguntas | La sección no se renderiza y desaparece de la tabla de contenidos |
| Estado de error: slug inexistente | `notFound()`, que sirve el `src/app/not-found.tsx` de v1.0. No se escribe copy nuevo |
| Confirmación destructiva | No aplica. La fase no tiene acciones destructivas |

Reglas de redacción del copy de interfaz:

- Segunda persona, español neutro peruano, el tono que ya tiene el sitio.
- Verbo más sustantivo en los CTA. "Agendar consulta", no "Más información" ni "Haz clic aquí".
- Cero promesa de resultado en el microcopy. "Agendar consulta" sí, "Recupera tu movilidad" no.
- Cero signos de admiración.
- Cero emojis, en copy y como íconos. Los íconos son Lucide.

### Banner del primer tercio

Destino resuelto: **botón principal hacia `/agendar`**, no a WhatsApp directo. Tres de las cuatro sedes las agenda la clínica, no el doctor, y mandar todo a su chat le genera pedidos que no puede resolver. Es la misma razón documentada dentro de `BookingCta`.

```
[barra dorada 4px a la izquierda]
Título contextual        (h2 no; es un <p> con estilo de encabezado, para no romper la jerarquía)
Texto breve, 1 o 2 líneas
[Agendar consulta]  Escribir por WhatsApp
```

El título y el texto vienen del archivo de datos (`ctaBanner: { heading, body }`), contextualizados por condición y por post. Ejemplo para hernia discal:

> **¿Tu dolor baja por la pierna?**
> Una evaluación con estudios propios define si tu caso necesita cirugía o se resuelve sin ella.
> [Agendar consulta] Escribir por WhatsApp

El título del banner es un `<p className="font-heading text-lg font-bold text-foreground">`, no un encabezado, para que no aparezca en la tabla de contenidos ni contamine el esquema.

### POS-01, posición del banner

En páginas de servicio el banner va **después de la sección `sintomas`**, que es la segunda de las siete. Es el punto donde el paciente acaba de reconocer lo que le pasa, y por eso convierte mejor que ponerlo antes.

En posts va **después de la primera sección `h2`**, porque su estructura no es fija.

En ambos casos manda la misma restricción verificable: **las palabras que quedan antes del banner deben ser entre el 15% y el 35% del total del cuerpo.** Se cuenta, no se estima a ojo. Si un dato de contenido queda fuera de ese rango, se mueve el banner una sección, no se ajusta el rango.

Cero excepciones a que el banner sea único. Un banner por página, más el CTA de cierre. No tres.

### Claves nuevas de `CtaLocation`

```ts
service_page: "Hola Dr. Angulo, leí la información de su web sobre mi condición y quisiera agendar una evaluación.",
blog_post: "Hola Dr. Angulo, leí un artículo de su blog y quisiera agendar una evaluación.",
```

Dos claves, no ocho. Una por condición fragmentaría las etiquetas de `trackWhatsAppClick(location)` en GA4 y volvería inútil la comparación entre superficies. La contextualización fina vive en el copy del banner, que sí es por página.

---

## Consideraciones de estado de interfaz

Consideraciones aplicables resueltas: 9 cubiertas, 2 con backstop, 0 sin resolver.

| Categoría | Elemento | Estado | Resolución |
|-----------|----------|--------|------------|
| empty | table-of-contents | ✅ cubierto | Con menos de 3 secciones el `nav` no se renderiza. Ver A11Y-09 |
| empty | faq-section | ✅ cubierto | Sin preguntas, la sección no se renderiza y se cae de la tabla de contenidos, que se deriva de las secciones renderizadas |
| empty | related-posts | ✅ cubierto | Escoliosis y ortopedia infantil no tienen post que las alimente. El bloque de posts relacionados no se renderiza en esas dos, no muestra un vacío |
| error | dynamic-route | ✅ cubierto | Un slug fuera de `generateStaticParams` llama `notFound()` y cae en el `not-found.tsx` de v1.0. No se escribe copy nuevo |
| loading | all-surfaces | ✅ cubierto | No aplica. Las ocho URLs se prerenderizan estáticas, sin fetch en cliente y sin estado de carga |
| long-text | toc-entry | ✅ cubierto | Los encabezados largos hacen wrap a varias líneas. Cero truncado. Ver A11Y-12 |
| long-text | service-card | ✅ cubierto | `cardSummary` se limita a 120 caracteres en el tipo de datos. Las tarjetas de la grilla igualan alto con `items-stretch` y el texto no se recorta |
| long-text | h1-condicion | ✅ cubierto | "Estenosis espinal (canal estrecho)" es el título más largo. `text-pretty` en el `h1` para evitar una palabra huérfana, sin truncado |
| zero-one-many | hub-grid | ✅ cubierto | `grid gap-6 sm:grid-cols-2` se comporta bien con 3, 4 o 5 tarjetas. Hoy son 4 |
| overflow | mobile-320 | 🧪 backstop | Sin scroll horizontal en 320, 375, 768, 1024 y 1440. Se verifica visualmente sobre las ocho URLs |
| populated | focus-y-contraste | 🧪 backstop | Recorrido de teclado completo por las ocho URLs: cada control muestra anillo visible con desplazamiento de 2px, y cada ancla mueve el foco a su `h2`. Se verifica a mano |

---

## Datos estructurados

No es superficie visual, pero condiciona el marcado y por eso queda acá. **Leer `src/components/structured-data.tsx` completo antes de escribir una línea:** el commit `5387091` le sumó 403 líneas con breadcrumbs, `hasCredential`, `openingHoursSpecification` y reseñas. Se extiende, no se duplica.

- Las páginas de servicio emiten `MedicalWebPage` con `about` de tipo `MedicalCondition`. Son condiciones, no procedimientos, aunque el criterio del ROADMAP diga `MedicalProcedure` por inercia.
- `MedicalProcedure` se referencia solo desde la sección de tratamiento, y reusando los `@id` que ya genera `ID.procedure(slug)`. No se declara un procedimiento nuevo.
- `author` y `publisher` apuntan a `{ "@id": ID.physician }`, coherente con la firma visible.
- `datePublished` y `dateModified` salen de los mismos campos que muestra `AuthorByline`. Lo que dice el schema y lo que ve el paciente no pueden divergir.
- `BlogPostingJsonLd` hoy emite `dateModified: post.date`. Pasa a leer `updatedAt`.
- Las preguntas frecuentes de cada página de servicio reusan el `FaqJsonLd` que ya está exportado.
- `BreadcrumbJsonLd` se invoca con la ruta anidada. Los breadcrumbs **visibles** siguen siendo de la fase 10.
- `src/app/sitemap.ts` pasa de 12 a 16 URLs.

---

## Seguridad de registros

| Registro | Bloques usados | Puerta de seguridad |
|----------|----------------|---------------------|
| shadcn oficial | ninguno | no aplica, shadcn no está inicializado |
| Terceros | ninguno | no aplica, no se declararon registros de terceros |

La fase no incorpora código de interfaz de terceros. Las únicas dependencias visuales son `lucide-react` y `next/font`, ambas ya en el proyecto desde v1.0.

---

## Fuera de alcance de este contrato

- Breadcrumbs visibles, títulos de 60 caracteres o menos, imágenes OG propias y `llms.txt`: fase 10.
- Páginas por sede: fase 9.
- Posts nuevos para escoliosis y ortopedia infantil.
- Corregir el `text-primary` en texto pequeño de las superficies de v1.0. Registrado arriba como deuda.
- Rediseñar `/servicios` desde cero. Se le suma una sección y nada más.
- Publicar precio de consulta.

---

## Firma del verificador

- [ ] Dimensión 1 Copy: PASS
- [ ] Dimensión 2 Visual: PASS
- [ ] Dimensión 3 Color: PASS
- [ ] Dimensión 4 Tipografía: PASS
- [ ] Dimensión 5 Espaciado: PASS
- [ ] Dimensión 6 Seguridad de registros: PASS

**Aprobación:** pendiente
