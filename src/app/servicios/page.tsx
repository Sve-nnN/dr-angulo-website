import type { Metadata } from "next";
import { Baby, Bone, Check, Sparkles } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { serviceCategories } from "@/content/services";

export const metadata: Metadata = {
  title: "Traumatólogo Especialista en Columna en Lima — Servicios",
  description:
    "Traumatología general, cirugía de columna y ortopedia infantil en Lima. Conoce las condiciones que trata el Dr. Juan Carlos Angulo.",
  alternates: { canonical: "/servicios" },
};

const icons = { columna: Sparkles, traumatologia: Bone, "ortopedia-infantil": Baby };

export default function ServiciosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Servicios
      </p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Especialidades y condiciones que trato
      </h1>
      <p className="mt-4 max-w-2xl text-foreground/70">
        Cada consulta empieza con una evaluación a fondo. El tratamiento se
        decide según tu caso específico — no todas las condiciones necesitan
        cirugía.
      </p>

      <div className="mt-12 space-y-12">
        {serviceCategories.map((cat) => {
          const Icon = icons[cat.slug as keyof typeof icons];
          return (
            <section
              key={cat.slug}
              id={cat.slug}
              className="scroll-mt-24 rounded-xl border border-border bg-white p-7 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-lg bg-muted text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h2 className="font-heading text-xl font-bold text-primary">
                  {cat.name}
                </h2>
              </div>
              <p className="mt-3 text-foreground/70">{cat.description}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {cat.conditions.map((c) => (
                  <li key={c} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check className="size-4 shrink-0 text-primary-light" aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-14 rounded-xl bg-primary p-8 text-center">
        <h2 className="font-heading text-xl font-bold text-white">
          ¿No estás seguro de qué necesitas?
        </h2>
        <p className="mt-2 text-white/85">
          Cuéntame tu caso por WhatsApp y te indico los siguientes pasos.
        </p>
        <div className="mt-5 flex justify-center">
          <WhatsAppCta location="services" variant="accent">
            Escribir por WhatsApp
          </WhatsAppCta>
        </div>
      </div>
    </div>
  );
}
