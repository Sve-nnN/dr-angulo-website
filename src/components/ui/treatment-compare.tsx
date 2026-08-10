import type { ServiceSubsection } from "@/content/service-pages";

type TreatmentCompareProps = {
  subsections: ServiceSubsection[];
};

/**
 * Comparación lado a lado de las opciones de tratamiento. Es la decisión
 * que el paciente realmente vino a buscar, así que se separa del resto del
 * cuerpo con dos columnas en vez de encabezados apilados.
 *
 * Con dos subsecciones se arma como comparación de dos columnas; con
 * cualquier otro número (por ejemplo, ortopedia infantil sin cirugía) cae a
 * una sola columna sin perder la estructura de tarjetas.
 */
export function TreatmentCompare({ subsections }: TreatmentCompareProps) {
  const twoColumns = subsections.length === 2;

  return (
    <div
      className={
        twoColumns
          ? "mt-6 grid gap-5 md:grid-cols-2"
          : "mt-6 space-y-5"
      }
    >
      {subsections.map((subsection) => (
        <div
          key={subsection.heading}
          className="rounded-2xl border border-border bg-background p-6"
        >
          <p className="font-heading text-lg font-bold text-primary-dark">
            {subsection.heading}
          </p>
          <div className="mt-3 space-y-3">
            {subsection.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base text-foreground/80">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
