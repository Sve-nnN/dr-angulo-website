import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { BookingCta } from "@/components/ui/booking-cta";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

const SHORTCUTS = [
  { href: "/servicios", label: "Especialidades y condiciones que trato" },
  { href: "/agendar", label: "Sedes, horarios y cómo agendar en cada una" },
  { href: "/sobre-el-doctor", label: "Trayectoria del Dr. Angulo" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Esta página no existe
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-foreground/70">
        Puede que el enlace esté mal escrito o que la página haya cambiado de
        dirección. Desde aquí llegas a lo que suele buscarse.
      </p>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {SHORTCUTS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center justify-between gap-4 py-4 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
            >
              {item.label}
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <BookingCta>Ver sedes y agendar</BookingCta>
      </div>
    </div>
  );
}
