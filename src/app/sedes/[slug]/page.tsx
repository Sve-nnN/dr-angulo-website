import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { AuthorByline } from "@/components/ui/author-byline";
import { MedicalDisclaimer } from "@/components/ui/medical-disclaimer";
import { MidContentCta } from "@/components/ui/mid-content-cta";
import { TableOfContents } from "@/components/ui/table-of-contents";
import {
  ContentBody,
  ContentBodyBoundary,
  groupSections,
} from "@/components/content/content-body";
import { BreadcrumbJsonLd, SedeJsonLd } from "@/components/structured-data";
import { getLocationPage, locationPages } from "@/content/location-pages";
import { servicePages } from "@/content/service-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Se recorre `locationPages` y no `locations`: una sede sin entrada editorial
 * no genera ruta. Es lo que permite publicar sedes de a una sin dejar rutas a
 * medio construir.
 */
export function generateStaticParams() {
  return locationPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getLocationPage(slug);
  if (!entry) return {};

  return {
    title: { absolute: entry.page.title },
    description: entry.page.description,
    alternates: { canonical: `/sedes/${entry.page.slug}` },
    openGraph: {
      title: entry.page.title,
      description: entry.page.description,
      url: `/sedes/${entry.page.slug}`,
    },
  };
}

export default async function SedePage({ params }: Props) {
  const { slug } = await params;
  const entry = getLocationPage(slug);
  if (!entry) notFound();

  const { page, location } = entry;
  const isOwnOffice = location.kind === "consultorio";

  // Una sede con cuerpo largo publica el copy del paquete on-page y la página
  // cambia de forma: índice, banner, firma y aviso de cierre, y los bloques
  // heredados se repliegan a los datos que salen de `locations.ts`. Una sede
  // sin cuerpo renderiza exactamente lo mismo que antes del plan 08-17.
  const hasBody = page.sections.length > 0;
  const tocEntries = groupSections(page.sections).map(({ section }) => ({
    id: section.id,
    label: section.heading,
  }));
  const midContentCta = page.ctaBanner ? (
    <MidContentCta
      heading={page.ctaBanner.heading}
      body={page.ctaBanner.body}
      location="booking_page"
      withWhatsApp={isOwnOffice}
    />
  ) : undefined;

  return (
    <>
      <SedeJsonLd page={page} location={location} />
      <BreadcrumbJsonLd
        items={[
          { name: "Sedes", path: "/sedes" },
          { name: page.navLabel, path: `/sedes/${page.slug}` },
        ]}
      />

      {/*
        `data-sede-body` envuelve la banda de cabecera y el artículo como una
        sola unidad. Es el límite que recorta `scripts/check-sedes.mjs` para
        contar los canales de agenda: el pie de página y el botón flotante del
        layout emiten el chat del doctor en todas las páginas del sitio, así
        que una cuenta a documento completo no significaría nada. Si el límite
        envolviera solo al artículo, el h1 de la banda quedaría fuera de lo
        medido, que es el error que la fase 8 ya cometió una vez.
      */}
      <div data-sede-body="">
        {/*
          `data-content-body` es el límite que mide la puerta de contenido y
          envuelve la banda de cabecera junto con el artículo: el h1 vive
          arriba y quedaría fuera de lo medido si el límite abrazara solo al
          artículo.
        */}
        <ContentBodyBoundary>
        <div className="border-b border-border bg-muted">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <Link
              href="/sedes"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-dark hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Sedes
            </Link>
            <h1 className="mt-4 text-pretty font-heading text-3xl font-extrabold text-primary sm:text-4xl">
              {page.h1}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-foreground/80">
              {page.heroLead}
            </p>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          {hasBody ? (
            <>
              <div className="mb-12">
                <TableOfContents title="En esta página" entries={tocEntries} />
              </div>
              <ContentBody
                sections={page.sections}
                flushFirstSection
                banner={midContentCta}
                bannerAfterSectionId={page.bannerAfterSectionId}
                bannerAfterIndex={1}
              />
            </>
          ) : null}

          <section className={hasBody ? "mt-14" : undefined}>
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              {hasBody ? "Dirección y mapa" : "Dónde queda y cómo llegar"}
            </h2>
            <div className="mt-6 flex gap-3">
              <MapPin
                className="mt-1 size-5 shrink-0 text-primary-dark"
                aria-hidden="true"
              />
              <address className="not-italic text-lg text-foreground/80">
                {location.streetAddress}
                {location.building ? (
                  <>
                    <br />
                    {location.building}
                  </>
                ) : null}
                <br />
                {location.addressLocality}, {location.addressRegion}
                {location.reference ? (
                  <>
                    <br />
                    <span className="text-base text-foreground/70">
                      Referencia: {location.reference}
                    </span>
                  </>
                ) : null}
                <br />
                <a
                  href={location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center gap-1 text-base font-semibold text-primary-dark hover:underline"
                >
                  Ver la ubicación en el mapa
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">
                    (abre Google Maps en una pestaña nueva)
                  </span>
                </a>
              </address>
            </div>
            {/* El bloque heredado de la fase 9 se calla en cuanto la sede
                publica su sección `como-llegar` del paquete: la página no
                puede explicar dos veces cómo llegar con palabras distintas. */}
            {hasBody
              ? null
              : page.gettingThere.map((paragraph, index) => (
                  <p key={index} className="mt-5 text-lg text-foreground/80">
                    {paragraph}
                  </p>
                ))}
          </section>

          <section className="mt-14">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              {hasBody ? "Horario vigente" : "Días y horarios"}
            </h2>
            <div className="mt-6 flex gap-3">
              <Clock
                className="mt-1 size-5 shrink-0 text-primary-dark"
                aria-hidden="true"
              />
              <dl className="text-lg text-foreground/80">
                {location.schedule.map((block) => (
                  <div key={block.days} className="mt-2 first:mt-0">
                    <dt className="font-semibold text-foreground">
                      {block.days}
                    </dt>
                    <dd>{block.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              {hasBody ? "Canales de cita de la sede" : "Cómo se agenda en esta sede"}
            </h2>
            <p className="mt-5 text-lg text-foreground/80">
              {location.bookingSummary}
            </p>

            {isOwnOffice ? (
              <>
                {/* Única sede donde el doctor maneja la agenda, así que es la
                    única donde su chat es el canal correcto. */}
                <div className="mt-6">
                  <WhatsAppCta location="booking_page" variant="accent">
                    Escribir por WhatsApp
                  </WhatsAppCta>
                </div>
                <div className="mt-6 rounded-2xl border border-border bg-muted px-6 py-5">
                  <p className="text-foreground/80">
                    Este es el único consultorio cuya agenda maneja el doctor,
                    así que acá él reserva tu cita directamente. En las clínicas
                    donde también atiende, la cita la saca cada institución con
                    su propio sistema.
                  </p>
                </div>
              </>
            ) : (
              <>
                <ul className="mt-6 space-y-3">
                  {location.channels.map((channel) => (
                    <li key={channel.label}>
                      {channel.href ? (
                        <a
                          href={channel.href}
                          {...(channel.href.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="inline-flex min-h-11 items-center gap-1.5 text-base font-semibold text-primary-dark hover:underline"
                        >
                          {channel.label}
                          {channel.href.startsWith("http") ? (
                            <>
                              <ArrowUpRight
                                className="size-4"
                                aria-hidden="true"
                              />
                              <span className="sr-only">
                                (se abre en una pestaña nueva)
                              </span>
                            </>
                          ) : null}
                        </a>
                      ) : (
                        <span className="text-base font-semibold text-foreground">
                          {channel.label}
                        </span>
                      )}
                      {channel.detail ? (
                        <span className="block text-base text-foreground/70">
                          {channel.detail}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {/* Aviso obligatorio en toda sede de clínica: el doctor no
                    maneja esta agenda y no puede reservar por el paciente.
                    Es la confusión más frecuente según `locations.ts`, y por
                    eso esta sección no ofrece ningún camino hacia su chat. */}
                <div className="mt-6 rounded-2xl border border-border bg-muted px-6 py-5">
                  <p className="font-heading text-lg font-bold text-foreground">
                    La cita en esta sede la gestiona {location.name}.
                  </p>
                  <p className="mt-2 text-foreground/80">
                    La clínica maneja su propia agenda con su propio sistema,
                    así que el doctor no puede reservarla por ti. Usa el canal
                    de arriba y pide una cita con el Dr. Juan Carlos Angulo
                    Totesaut en Traumatología.
                  </p>
                </div>
              </>
            )}
          </section>

          <section className="mt-14">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              {hasBody
                ? "Guías de las condiciones que atiende"
                : "Qué se atiende en esta sede"}
            </h2>
            {/* Igual que `gettingThere`: la sección `que-se-atiende` del
                paquete ya explica el alcance de la consulta y este párrafo
                heredado repetiría el mismo contenido con otras palabras. */}
            {hasBody ? null : (
              <p className="mt-5 text-lg text-foreground/80">
                {page.conditionsLead}
              </p>
            )}
            <ul className="mt-4">
              {servicePages.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/servicios/${service.slug}`}
                    className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
                  >
                    {service.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 border-t border-border pt-12">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              Agenda en esta sede
            </h2>
            <p className="mt-4 text-lg text-foreground/80">
              {isOwnOffice
                ? "Puedes comparar los días de todas las sedes antes de decidir. En la página de agenda encuentras la semana completa de atención."
                : `Puedes comparar los días de todas las sedes antes de decidir. Recuerda que la cita en ${location.name} se saca con la clínica.`}
            </p>
            {!isOwnOffice ? (
              <ul className="mt-4 space-y-2">
                {location.channels
                  .filter((channel) => channel.href)
                  .map((channel) => (
                    <li key={channel.label}>
                      <a
                        href={channel.href}
                        {...(channel.href?.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="inline-flex min-h-11 items-center gap-1.5 text-base font-semibold text-primary-dark hover:underline"
                      >
                        {channel.label}
                        {channel.href?.startsWith("http") ? (
                          <>
                            <ArrowUpRight
                              className="size-4"
                              aria-hidden="true"
                            />
                            <span className="sr-only">
                              (se abre en una pestaña nueva)
                            </span>
                          </>
                        ) : null}
                      </a>
                    </li>
                  ))}
              </ul>
            ) : null}
            <Link
              href={`/agendar#${page.slug}`}
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-primary-dark hover:underline"
            >
              Ver todas las sedes y horarios
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>

          {hasBody && page.outboundLinks && page.outboundLinks.length > 0 && (
            <section className="mt-14 border-t border-border pt-10">
              <p className="font-heading text-lg font-bold text-foreground">
                Sigue leyendo
              </p>
              <ul className="mt-3">
                {page.outboundLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block min-h-11 py-2.5 text-base font-semibold text-primary-dark hover:underline"
                    >
                      {link.anchor}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasBody && page.publishedAt && page.updatedAt ? (
            <>
              <div className="mt-14">
                <AuthorByline
                  publishedAt={page.publishedAt}
                  updatedAt={page.updatedAt}
                />
              </div>
              <div className="mt-8">
                <MedicalDisclaimer />
              </div>
            </>
          ) : null}
        </article>
        </ContentBodyBoundary>
      </div>
    </>
  );
}
