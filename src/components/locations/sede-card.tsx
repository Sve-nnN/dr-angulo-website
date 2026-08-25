import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LocationPage } from "@/content/location-pages";
import type { Location } from "@/content/locations";

type SedeCardProps = {
  page: Pick<LocationPage, "slug" | "navLabel" | "cardSummary">;
  location: Pick<Location, "addressLocality" | "schedule">;
};

/**
 * Tarjeta del hub hacia una página de sede.
 *
 * No comparte componente con `LocationCard`: esa es una fila de agenda con los
 * canales de cada sede, esta es una tarjeta navegacional con enlace extendido.
 * Unificarlas produciría un componente con props condicionales para dos usos
 * que solo comparten el nombre de la sede.
 *
 * Un solo elemento interactivo por tarjeta: el enlace del título se extiende
 * sobre toda la superficie con `after:absolute`. Un segundo enlace quedaría
 * tapado por esa capa y sería inalcanzable con el mouse (A11Y-21). El distrito,
 * los días y el pie "Ver la sede" son texto, no controles.
 *
 * El foco visible se dibuja sobre la tarjeta entera y no sobre el texto del
 * título: por eso el anillo se traslada al contenedor (A11Y-23).
 */
export function SedeCard({ page, location }: SedeCardProps) {
  return (
    <article className="relative rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-ring">
      <h2 className="font-heading text-lg font-bold text-primary">
        <Link
          href={`/sedes/${page.slug}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {page.navLabel}
        </Link>
      </h2>
      <p className="mt-1 text-sm font-semibold text-accent-strong">
        {location.addressLocality}
      </p>
      <p className="mt-3 text-foreground/80">{page.cardSummary}</p>
      <dl className="mt-4 space-y-1 text-sm text-foreground/70">
        {location.schedule.map((block) => (
          <div key={block.days}>
            <dt className="inline font-semibold text-foreground">
              {block.days}:
            </dt>{" "}
            <dd className="inline">{block.hours}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark">
        Ver la sede
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </p>
    </article>
  );
}
