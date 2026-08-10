import { AlertTriangle } from "lucide-react";

type ConsultAlertProps = {
  paragraphs: string[];
};

/**
 * Bloque de "cuándo consultar". Necesita leerse como una señal de atención
 * sin caer en alarmismo: usa `--destructive` solo en el ícono y en el borde
 * izquierdo, nunca en texto, para no bajar el contraste del cuerpo por
 * debajo de lo que exige COLOR-01.
 */
export function ConsultAlert({ paragraphs }: ConsultAlertProps) {
  return (
    <div
      data-consult-alert=""
      className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-7"
    >
      <p className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
        <AlertTriangle
          className="size-5 shrink-0 text-destructive"
          aria-hidden="true"
        />
        Presta atención a estas señales
      </p>
      <div className="mt-3 space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-base text-foreground/80">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
