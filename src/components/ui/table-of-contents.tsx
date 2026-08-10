type TableOfContentsEntry = {
  id: string;
  label: string;
};

type TableOfContentsProps = {
  title: string;
  entries: TableOfContentsEntry[];
};

/**
 * Índice de secciones de un documento largo.
 *
 * El título es un párrafo, no un encabezado: la tabla es navegación, no una
 * sección de contenido, y dejarla fuera del esquema hace que ese esquema
 * coincida uno a uno con las entradas (A11Y-05).
 *
 * Con menos de tres secciones no se renderiza: una lista de dos entradas
 * desorienta más de lo que orienta (A11Y-09).
 */
export function TableOfContents({ title, entries }: TableOfContentsProps) {
  if (entries.length < 3) return null;

  return (
    <nav
      data-toc=""
      aria-labelledby="toc-title"
      className="rounded-2xl border border-border p-6"
    >
      <p
        id="toc-title"
        className="font-heading text-sm font-bold uppercase tracking-wide text-foreground/70"
      >
        {title}
      </p>
      <ol className="mt-3 space-y-1">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
