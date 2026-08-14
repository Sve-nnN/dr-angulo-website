import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { primaryLocation } from "@/content/locations";
import { siteConfig } from "@/lib/site-config";
import { BreadcrumbJsonLd, ContactPageJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: { absolute: "Contacto con el consultorio del Dr. Angulo" },
  description:
    "Cuéntale tu caso al doctor por el formulario o escribe por WhatsApp. Datos de contacto del consultorio en Lima.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto con el consultorio del Dr. Angulo",
    description:
      "Cuéntale tu caso al doctor por el formulario o escribe por WhatsApp. Datos de contacto del consultorio en Lima.",
    url: "/contacto",
  },
};

export default function ContactoPage() {
  const mapQuery = encodeURIComponent(
    `Lima Central Tower, ${siteConfig.office.streetAddress}, ${siteConfig.office.addressLocality}, Lima, Perú`
  );

  return (
    <>
      <ContactPageJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Contacto", path: "/contacto" }]} />
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Contacto
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-foreground/70">
        Cuéntale tu caso al doctor por el formulario, o escribe por WhatsApp
        para agendar en su consultorio privado.
      </p>
      <p className="mt-4 max-w-2xl text-foreground/70">
        Si quieres atenderte en Ricardo Palma, Sanna o Tezza, la cita se saca
        con cada clínica.{" "}
        <Link
          href="/agendar"
          className="font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
        >
          Ver las cuatro sedes y sus horarios
        </Link>
        .
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="lg:order-2">
          <h2 className="font-heading text-xl font-bold text-primary">
            Dónde y cómo
          </h2>

          <dl className="mt-5 divide-y divide-border border-y border-border">
            <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-foreground/70">
                Consultorio
              </dt>
              <dd>
                <p className="font-semibold text-foreground">
                  {siteConfig.office.name}
                </p>
                <p className="mt-0.5 text-sm text-foreground/70">
                  {siteConfig.office.streetAddress},{" "}
                  {siteConfig.office.addressLocality},{" "}
                  {siteConfig.office.addressRegion}
                  <br />
                  {siteConfig.office.building}
                </p>
                <a
                  href={siteConfig.office.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block text-sm font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
                >
                  Cómo llegar
                  <span className="sr-only"> (abre Google Maps en una pestaña nueva)</span>
                </a>
              </dd>
            </div>

            <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-foreground/70">
                WhatsApp
              </dt>
              <dd>
                <a
                  href={`tel:+${siteConfig.whatsapp.number}`}
                  className="font-semibold text-foreground transition-colors duration-150 hover:text-primary hover:underline"
                >
                  {siteConfig.whatsapp.displayNumber}
                </a>
              </dd>
            </div>

            <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-4">
              <dt className="text-sm font-semibold text-foreground/70">
                Horarios
              </dt>
              <dd>
                <p className="font-semibold text-foreground">
                  {primaryLocation.schedule[0].days}
                </p>
                <p className="mt-0.5 text-sm text-foreground/70">
                  El horario exacto se coordina por WhatsApp. Los otros días
                  atiende en clínicas, con la agenda de cada una.
                </p>
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <WhatsAppCta location="contact_page" variant="accent" className="w-full sm:w-auto">
              Escribir por WhatsApp
            </WhatsAppCta>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <iframe
              title={`Mapa de ${siteConfig.office.name}`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="280"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="lg:order-1">
          <h2 className="font-heading text-xl font-bold text-primary">
            Escribe tu caso
          </h2>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>

      <section className="mt-14 border-t border-border pt-10">
        <p className="font-heading text-lg font-bold text-foreground">
          Sigue leyendo
        </p>
        <ul className="mt-3">
          <li>
            <Link
              href="/sedes"
              className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
            >
              Sedes donde atiende el Dr. Juan Carlos Angulo en Lima
            </Link>
          </li>
          <li>
            <Link
              href="/servicios"
              className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
            >
              traumatólogo de columna
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
            >
              traumatología especialista en columna
            </Link>
          </li>
        </ul>
      </section>
    </div>
    </>
  );
}
