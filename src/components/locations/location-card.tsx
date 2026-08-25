import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import type { Location } from "@/content/locations";

type Props = {
  location: Location;
  /** Nivel de encabezado, para no romper la jerarquía de la página que la use. */
  headingLevel?: "h2" | "h3";
  /**
   * Ruta de la página de esa sede, si ya está publicada. Cuando llega, la
   * tarjeta muestra el enlace de ida hacia ella. Se pasa desde afuera para que
   * ninguna tarjeta apunte a una ruta que todavía no existe.
   */
  pageHref?: string;
};

export function LocationCard({
  location,
  headingLevel = "h3",
  pageHref,
}: Props) {
  const Heading = headingLevel;
  const isOwnOffice = location.kind === "consultorio";

  return (
    // `id` es el destino del ancla que devuelve desde la página de sede, y
    // `tabIndex={-1}` hace que el navegador mueva el foco a la tarjeta al
    // llegar por ese ancla en vez de solo desplazar la vista. El resaltado lo
    // dibuja la regla `:target` de `globals.css` sobre `data-location-card`.
    <article
      id={location.slug}
      tabIndex={-1}
      data-location-card=""
      className="grid scroll-mt-28 gap-6 py-10 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-10"
    >
      <div>
        <Heading className="font-heading text-lg font-bold text-primary">
          {location.name}
        </Heading>
        <p className="mt-2 text-sm font-semibold text-accent-strong">
          {isOwnOffice ? "Agenda el doctor" : "Agenda la clínica"}
        </p>
      </div>

      <div>
        <dl className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
            <dt>
              <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="sr-only">Días y horario de atención</span>
            </dt>
            {location.schedule.map((block) => (
              <dd key={block.days} className="col-start-2 text-foreground/80">
                <span className="font-semibold text-foreground">{block.days}:</span>{" "}
                {block.hours}
              </dd>
            ))}
          </div>

          <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
            <dt>
              <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <span className="sr-only">Dirección</span>
            </dt>
            <dd className="col-start-2 text-foreground/80">
              {location.streetAddress}, {location.addressLocality}
              {location.building ? (
                <>
                  <br />
                  {location.building}
                </>
              ) : null}
              {location.reference ? (
                <>
                  <br />
                  <span className="text-sm text-foreground/70">
                    Referencia: {location.reference}
                  </span>
                </>
              ) : null}
              <br />
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
              >
                Cómo llegar
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(abre Google Maps en una pestaña nueva)</span>
              </a>
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-foreground/80">{location.bookingSummary}</p>

        {isOwnOffice ? (
          <div className="mt-4">
            <WhatsAppCta location="booking_page" variant="accent">
              Escribir por WhatsApp
            </WhatsAppCta>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {location.channels.map((channel) => (
              <li key={channel.label}>
                {channel.href ? (
                  <a
                    href={channel.href}
                    {...(channel.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-1.5 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
                  >
                    {channel.label}
                    {channel.href.startsWith("http") ? (
                      <>
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">(se abre en una pestaña nueva)</span>
                      </>
                    ) : null}
                  </a>
                ) : (
                  <span className="font-semibold text-foreground">{channel.label}</span>
                )}
                {channel.detail ? (
                  <span className="block text-sm text-foreground/70">{channel.detail}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {/* Esta tarjeta no usa enlace extendido, así que sumar un enlace
            normal no rompe A11Y-21. */}
        {pageHref ? (
          <Link
            href={pageHref}
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-base font-semibold text-primary-dark hover:underline"
          >
            Ver la sede
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
