import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServicePage } from "@/content/service-pages";

type ServiceCardProps = {
  page: Pick<ServicePage, "slug" | "navLabel" | "cardSummary">;
};

/**
 * Tarjeta del hub hacia una guía hija.
 *
 * Un solo elemento interactivo por tarjeta: el enlace del título se extiende
 * sobre toda la superficie con `after:absolute`. Meter un segundo enlace o
 * botón dentro quedaría tapado por esa capa y sería inalcanzable con el mouse
 * (A11Y-21). El pie "Leer la guía" es texto, no un control.
 *
 * El foco visible se dibuja sobre la tarjeta entera y no sobre el texto del
 * título: por eso el anillo se traslada al contenedor (A11Y-23).
 */
export function ServiceCard({ page }: ServiceCardProps) {
  return (
    <article className="relative rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-ring">
      <h3 className="font-heading text-lg font-bold text-primary">
        <Link
          href={`/servicios/${page.slug}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {page.navLabel}
        </Link>
      </h3>
      <p className="mt-2 text-foreground/80">{page.cardSummary}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark">
        Leer la guía
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </p>
    </article>
  );
}
