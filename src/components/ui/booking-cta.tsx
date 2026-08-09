import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type BookingCtaProps = {
  children: React.ReactNode;
  /** `sm` para barras densas como el header; `md` para el cuerpo de la página. */
  size?: "sm" | "md";
  className?: string;
  /** Para cerrar el menú móvil al navegar. */
  onClick?: () => void;
};

/**
 * CTA principal de agendamiento. Lleva a /agendar, nunca directo a WhatsApp:
 * el doctor atiende en cuatro sedes y solo la suya se agenda por su chat. Las
 * citas de Ricardo Palma, Sanna y Tezza las maneja cada clínica, así que
 * mandar todo al WhatsApp le generaba pedidos que él no puede resolver.
 *
 * Para el consultorio privado, el CTA correcto es `WhatsAppCta`.
 */
export function BookingCta({
  children,
  size = "md",
  className,
  onClick,
}: BookingCtaProps) {
  return (
    <Link
      href="/agendar"
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent font-semibold text-foreground shadow-sm transition-[background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:bg-accent-hover hover:shadow-md motion-reduce:hover:translate-y-0",
        size === "sm" ? "px-5 py-2.5 text-sm" : "px-6 py-3 text-base",
        className
      )}
    >
      <CalendarDays
        className={size === "sm" ? "size-4" : "size-5"}
        aria-hidden="true"
      />
      {children}
    </Link>
  );
}
