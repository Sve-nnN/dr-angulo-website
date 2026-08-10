import { Info } from "lucide-react";

/**
 * Aviso de contenido educativo. Aparece una sola vez, al cierre de la
 * página, después de la firma del doctor (SAFE-02, revisado 2026-08-10 por
 * decisión de Juan; ver 08-UI-SPEC.md).
 *
 * Es una superficie visible, no un pie de página gris: el texto va a 16px con
 * contraste pleno y nunca se colapsa dentro de un desplegable (SAFE-03).
 */
export function MedicalDisclaimer() {
  return (
    <aside
      data-medical-disclaimer=""
      className="rounded-2xl border border-border bg-muted p-6"
    >
      <p className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
        <Info className="size-5 shrink-0 text-primary" aria-hidden="true" />
        Información educativa
      </p>
      <p className="mt-3 text-base text-foreground/80">
        Este contenido explica de forma general cómo se aborda esta condición y
        no reemplaza una consulta médica. Cada caso necesita una evaluación con
        estudios propios antes de indicar cualquier tratamiento. Si tienes
        síntomas, agenda una cita.
      </p>
    </aside>
  );
}
