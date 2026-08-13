import type { Metadata } from "next";
import { BookingCta } from "@/components/ui/booking-cta";
import { SedeCard } from "@/components/locations/sede-card";
import { getLocationPage, locationPages } from "@/content/location-pages";
import { BreadcrumbJsonLd } from "@/components/structured-data";

export const metadata: Metadata = {
  title: { absolute: "Dónde atiende el Dr. Juan Carlos Angulo en Lima" },
  description:
    "Las cuatro sedes donde atiende el Dr. Juan Carlos Angulo: consultorio de Surco, Ricardo Palma, Sanna La Molina y Padre Luis Tezza.",
  alternates: { canonical: "/sedes" },
};

export default function SedesPage() {
  // El join vive en `getLocationPage`; la tarjeta no lo repite.
  const entries = locationPages
    .map((page) => getLocationPage(page.slug))
    .filter((entry) => entry !== undefined);

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Sedes", path: "/sedes" }]} />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
          Sedes donde atiende el Dr. Angulo en Lima
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-foreground/70">
          Cada sede tiene sus propios días, su propio horario y su propia forma
          de sacar cita. Entra a la que te quede mejor para ver la dirección,
          cómo llegar y con quién se agenda.
        </p>

        <div className="mt-10 grid items-stretch gap-6 sm:grid-cols-2">
          {entries.map(({ page, location }) => (
            <SedeCard key={page.slug} page={page} location={location} />
          ))}
        </div>

        {/* El hub es el mapa de sedes; la agenda vive en /agendar. Acá no se
            repiten los canales: eso lo resuelve la página de cada sede. */}
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            ¿Prefieres comparar los días antes de elegir?
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-foreground/70">
            La página de agenda reúne la semana completa de atención de todas
            las sedes y el canal que corresponde a cada una.
          </p>
          <div className="mt-6">
            <BookingCta>Ver agenda y horarios</BookingCta>
          </div>
        </section>
      </div>
    </>
  );
}
