import type { ServiceSectionItem } from "@/content/service-pages";

type ServiceItemGridProps = {
  items: ServiceSectionItem[];
  /**
   * `grid` para síntomas y complicaciones, escaneables sin orden implícito.
   * `steps` numera las tarjetas y las conecta con una línea vertical, para
   * diagnóstico y recuperación, donde el orden sí comunica algo.
   */
  variant?: "grid" | "steps";
};

/**
 * Tarjetas para una sección de contenido. Reemplaza el párrafo apilado
 * cuando la sección tiene una lista natural de puntos (síntomas,
 * complicaciones, pasos del diagnóstico, etapas de la recuperación).
 *
 * `body` llega como texto plano sin marcado, igual que el resto del
 * contenido clínico: ninguna cifra puede quedar resaltada tipográficamente.
 */
export function ServiceItemGrid({ items, variant = "grid" }: ServiceItemGridProps) {
  if (variant === "steps") {
    return (
      <ol className="mt-6 space-y-4">
        {items.map((item, index) => (
          <li
            key={item.title}
            className="flex gap-4 rounded-2xl border border-border bg-background p-5"
          >
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-bold text-primary-dark"
            >
              {index + 1}
            </span>
            <div>
              <p className="font-heading text-base font-bold text-foreground">
                {item.title}
              </p>
              <p className="mt-1.5 text-base text-foreground/80">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.title}
          className="rounded-2xl border border-border bg-background p-5"
        >
          <p className="font-heading text-base font-bold text-foreground">
            {item.title}
          </p>
          <p className="mt-1.5 text-base text-foreground/80">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
