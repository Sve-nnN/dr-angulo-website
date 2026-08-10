import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LocationCard } from "@/components/locations/location-card";
import { primaryLocation, clinicLocations, weeklySchedule } from "@/content/locations";
import { getLocationPage } from "@/content/location-pages";
import { siteConfig } from "@/lib/site-config";
import { BreadcrumbJsonLd, BookingPageJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: "Agendar cita — Consultorios y horarios en Lima",
  description:
    "Dónde atiende el Dr. Juan Carlos Angulo y cómo agendar en cada sede: consultorio privado en Surco por WhatsApp, y Clínica Ricardo Palma, Sanna La Molina y Clínica Tezza con sus propias centrales de citas.",
  alternates: { canonical: "/agendar" },
};

/**
 * Ruta de la página de una sede, solo si esa sede ya tiene entrada editorial.
 * Mientras no la tenga, la tarjeta no muestra el enlace y no queda ningún
 * `href` apuntando a una ruta inexistente.
 */
function sedeHref(slug: string) {
  return getLocationPage(slug) ? `/sedes/${slug}` : undefined;
}

export default function AgendarPage() {
  return (
    <>
      <BookingPageJsonLd />
      <BreadcrumbJsonLd items={[{ name: "Agendar cita", path: "/agendar" }]} />
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
        Agendar cita
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-foreground/70">
        El Dr. Angulo atiende en cuatro sedes y cada una tiene su propia agenda.
        Elige dónde te queda mejor y agenda por el canal de esa sede.
      </p>
      <Link
        href="/sedes"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-primary-dark hover:underline"
      >
        Ver la página de cada sede
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>

      <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-muted px-6 py-5">
        <p className="font-heading text-lg font-bold text-foreground">
          El WhatsApp del doctor agenda solo el consultorio privado.
        </p>
        <p className="mt-2 text-foreground/80">
          Las citas en Ricardo Palma, Sanna y Tezza las maneja cada clínica con
          su propio sistema, así que el doctor no puede reservarlas por ti.
        </p>
      </div>

      <h2 className="mt-14 font-heading text-2xl font-bold text-primary">
        Consultorio privado
      </h2>
      <div className="divide-y divide-border border-y border-border">
        <LocationCard
          location={primaryLocation}
          pageHref={sedeHref(primaryLocation.slug)}
        />
      </div>

      <h2 className="mt-14 font-heading text-2xl font-bold text-primary">
        Clínicas donde atiende
      </h2>
      <p className="mt-3 max-w-2xl text-foreground/70">
        En estas sedes la cita se saca con la clínica. Al buscar, pide o
        selecciona a <strong>{siteConfig.name}</strong> en Traumatología.
      </p>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {clinicLocations.map((location) => (
          <LocationCard
            key={location.slug}
            location={location}
            pageHref={sedeHref(location.slug)}
          />
        ))}
      </div>

      <section className="mt-16 border-t border-border pt-12">
        <h2 className="font-heading text-2xl font-bold text-primary">
          Semana de atención
        </h2>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Un resumen rápido por si te sirve para elegir el día.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">
              Días y horarios de atención del Dr. Angulo por sede
            </caption>
            <thead>
              <tr className="border-b-2 border-border">
                <th scope="col" className="py-3 pr-4 font-heading text-sm font-bold text-primary">
                  Día
                </th>
                <th scope="col" className="py-3 pr-4 font-heading text-sm font-bold text-primary">
                  Sede
                </th>
                <th scope="col" className="py-3 font-heading text-sm font-bold text-primary">
                  Horario
                </th>
              </tr>
            </thead>
            <tbody>
              {weeklySchedule.map((block) => (
                <tr
                  key={`${block.locationSlug}-${block.days}`}
                  className="border-b border-border"
                >
                  <th scope="row" className="py-3 pr-4 font-semibold text-foreground">
                    {block.days}
                  </th>
                  <td className="py-3 pr-4 text-foreground/80">{block.locationName}</td>
                  <td className="py-3 text-foreground/80">{block.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-14 border-t border-border pt-12">
        <h2 className="font-heading text-xl font-bold text-primary">
          ¿No sabes cuál te conviene?
        </h2>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Cuéntale tu caso al doctor por el formulario de contacto y él te
          orienta sobre qué sede y qué tipo de evaluación necesitas.
        </p>
        <Link
          href="/contacto"
          className="mt-4 inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
        >
          Escribir mi caso
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
    </>
  );
}
