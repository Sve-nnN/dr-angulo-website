import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contacto y Citas en La Molina, Lima",
  description:
    "Agenda tu cita con el Dr. Juan Carlos Angulo en Clínica Montefiori, La Molina, Lima. Escribe por WhatsApp o completa el formulario.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  const mapQuery = encodeURIComponent(
    `${siteConfig.clinic.name}, ${siteConfig.clinic.streetAddress}, ${siteConfig.clinic.addressLocality}, Lima, Perú`
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Contacto
      </p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Agenda tu cita
      </h1>
      <p className="mt-4 max-w-2xl text-foreground/70">
        El canal más rápido es WhatsApp. Si prefieres, completa el formulario y
        te contactamos a la brevedad.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <ContactForm />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">{siteConfig.clinic.name}</p>
                <p className="text-sm text-foreground/70">
                  {siteConfig.clinic.streetAddress}, {siteConfig.clinic.addressLocality},{" "}
                  {siteConfig.clinic.addressRegion}
                </p>
                <a
                  href={siteConfig.clinic.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  Cómo llegar →
                </a>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <Phone className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">
                  {siteConfig.whatsapp.displayNumber}
                </p>
                <p className="text-sm text-foreground/70">WhatsApp preferido</p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <Clock className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Atención con cita previa</p>
                <p className="text-sm text-foreground/70">
                  Coordina el horario disponible por WhatsApp
                </p>
              </div>
            </div>

            <div className="mt-5">
              <WhatsAppCta location="contact_page" variant="whatsapp" className="w-full">
                Escribir por WhatsApp
              </WhatsAppCta>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <iframe
              title={`Mapa de ${siteConfig.clinic.name}`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
