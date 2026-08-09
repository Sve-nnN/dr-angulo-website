import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import type { Location } from "@/content/locations";

type Props = {
  location: Location;
  /** Nivel de encabezado, para no romper la jerarquía de la página que la use. */
  headingLevel?: "h2" | "h3";
};

export function LocationCard({ location, headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  const isOwnOffice = location.kind === "consultorio";

  return (
    <article className="grid gap-6 py-10 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-10">
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
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <dt className="sr-only">Días y horario de atención</dt>
              {location.schedule.map((block) => (
                <dd key={block.days} className="text-foreground/80">
                  <span className="font-semibold text-foreground">{block.days}:</span>{" "}
                  {block.hours}
                </dd>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <dt className="sr-only">Dirección</dt>
              <dd className="text-foreground/80">
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
      </div>
    </article>
  );
}
