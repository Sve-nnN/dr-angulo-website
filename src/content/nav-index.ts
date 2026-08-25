/**
 * Índice de navegación: lo mínimo que el encabezado necesita para dibujar sus
 * menús, sin arrastrar la capa editorial entera al navegador (CWV-04).
 *
 * ## Por qué existe este archivo
 *
 * `header.tsx` y `services-menu.tsx` llevan `"use client"` y el encabezado se
 * monta en las 24 rutas. Cuando esos dos importaban `servicePages` y
 * `locationPages` desde los barriles de `@/content/service-pages` y
 * `@/content/location-pages`, el grafo de cliente se llevaba las cinco guías
 * clínicas y las cuatro fichas de sede completas: **158.571 bytes de prosa en
 * 25 de los 26 documentos del build**, medido el 2026-08-24. De todo eso, los
 * menús usaban tres campos.
 *
 * Un paciente que abría `/privacidad` descargaba, analizaba y compilaba las
 * cinco guías clínicas enteras para que el encabezado pudiera escribir
 * "Hernia discal" en un enlace.
 *
 * ## Por qué los valores están escritos a mano y no derivados
 *
 * Derivarlos de los barriles reintroduce el problema: la importación arrastra
 * el módulo entero aunque solo se lea una propiedad. Y pasarlos como props
 * desde el servidor los mudaría al árbol RSC serializado, o sea al HTML de las
 * 24 rutas, que es peso que hoy no se paga.
 *
 * El archivo sigue el patrón que el propio `header.tsx` ya usaba para
 * `NAV_LINKS`: los rótulos de navegación se escriben donde se usan.
 *
 * ## Qué impide que esto se desincronice
 *
 * `service-pages/index.ts` y `location-pages/index.ts` comprueban en tiempo de
 * módulo que cada `slug` y cada `navLabel` de acá coincidan con los de la
 * página real, y que no falte ni sobre ninguna entrada. Esos dos barriles solo
 * se importan desde el servidor, así que la comprobación corre durante
 * `npm run build`, que es una de las cinco compuertas del proyecto: si alguien
 * renombra una guía y se olvida de este archivo, **el build falla**, no el
 * menú en silencio.
 *
 * El orden de los dos arreglos es el mismo que el de los barriles, porque es el
 * orden en el que se dibujan los menús.
 */

/** Entrada de servicio en el megamenú. `cardSummary` solo la usa el de escritorio. */
export type ServiceNavItem = {
  slug: string;
  navLabel: string;
  cardSummary: string;
};

/** Entrada de sede en el menú móvil y en el desplegable de sedes. */
export type LocationNavItem = {
  slug: string;
  navLabel: string;
};

export const serviceNavItems: ServiceNavItem[] = [
  {
    slug: "hernia-discal",
    navLabel: "Hernia discal",
    cardSummary:
      "Qué es, cómo se diagnostica y en qué casos la cirugía es realmente necesaria.",
  },
  {
    slug: "estenosis-espinal",
    navLabel: "Estenosis espinal",
    cardSummary:
      "Por qué las piernas pesan al caminar, cómo se confirma el canal estrecho y qué opciones hay.",
  },
  {
    slug: "escoliosis-y-deformidades",
    navLabel: "Escoliosis",
    cardSummary:
      "Cómo se detecta una curva a tiempo, qué logra el corsé y cuándo se plantea corregirla.",
  },
  {
    slug: "ortopedia-infantil",
    navLabel: "Ortopedia infantil",
    cardSummary:
      "Qué es parte del desarrollo normal, qué necesita evaluación y cuándo no conviene esperar.",
  },
  {
    slug: "cirugia-minimamente-invasiva",
    navLabel: "Cirugía mínimamente invasiva",
    cardSummary:
      "Incisiones pequeñas y el mismo objetivo dentro del cuerpo: lo que cambia es el camino.",
  },
];

export const locationNavItems: LocationNavItem[] = [
  { slug: "consultorio-privado", navLabel: "Consultorio privado en Surco" },
  { slug: "clinica-ricardo-palma", navLabel: "Clínica Ricardo Palma" },
  { slug: "sanna-la-molina", navLabel: "Clínica Sanna, La Molina" },
  { slug: "clinica-tezza", navLabel: "Clínica Padre Luis Tezza" },
];

/**
 * Comprueba que el índice de navegación siga espejando las páginas reales.
 *
 * La llaman los dos barriles de contenido, que solo se importan desde el
 * servidor, así que esto corre en `npm run build` y nunca en el navegador.
 * Lanza en vez de avisar: un menú que apunta a un slug que ya no existe es un
 * 404 para el paciente, y eso tiene que romper la compuerta, no la visita.
 */
export function assertNavIndexMatches(
  kind: "servicio" | "sede",
  navItems: ReadonlyArray<{ slug: string; navLabel: string }>,
  pages: ReadonlyArray<{ slug: string; navLabel: string }>
): void {
  const problems: string[] = [];

  if (navItems.length !== pages.length) {
    problems.push(
      `el índice tiene ${navItems.length} entradas y hay ${pages.length} páginas de ${kind}`
    );
  }

  for (const page of pages) {
    const item = navItems.find((entry) => entry.slug === page.slug);
    if (!item) {
      problems.push(`falta la entrada de ${kind} "${page.slug}" en el índice`);
      continue;
    }
    if (item.navLabel !== page.navLabel) {
      problems.push(
        `el navLabel de "${page.slug}" dice "${item.navLabel}" en el índice y "${page.navLabel}" en la página`
      );
    }
  }

  for (const item of navItems) {
    if (!pages.some((page) => page.slug === item.slug)) {
      problems.push(
        `el índice trae "${item.slug}", que no corresponde a ninguna página de ${kind}`
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `src/content/nav-index.ts quedó desincronizado:\n  - ${problems.join("\n  - ")}`
    );
  }
}
