import { ArrowUpRight } from "lucide-react";
import type { ServiceCitation } from "@/content/service-pages";

/**
 * Fuentes externas al pie de una página de condición o de un post (TRUST-02).
 *
 * Server component a propósito: sin estado, sin efectos y sin fetch. Lo que se
 * renderiza sale entero de los datos, y por eso esta sección no puede mover el
 * layout después de la primera pintura. Es lo que sostiene el CLS 0 de las
 * rutas donde se monta.
 *
 * Sin tarjeta propia y sin fondo: `MedicalDisclaimer` ya ocupa una tarjeta al
 * cierre de estas mismas páginas, y dos tarjetas apiladas se leen como un solo
 * bloque de letra chica. La regla izquierda alcanza para separar cada fuente.
 *
 * Sin imágenes de ninguna clase, ni logos de sociedades ni favicons: una
 * imagen remota acá sería una petición de red por cita y una fuente de
 * desplazamiento. Ningún texto baja de 16px.
 */
export function CitationList({ citations }: { citations: ServiceCitation[] }) {
  return (
    <ul data-citations="" className="mt-6 space-y-6">
      {citations.map((citation) => (
        <li key={citation.href} className="border-l-2 border-border pl-4">
          <a
            href={citation.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 font-heading text-base font-bold text-primary-dark transition-colors duration-150 hover:underline"
          >
            {citation.source}
            {/* El ícono no envuelve con el texto: `shrink-0` lo deja entero
                cuando el nombre de la fuente pasa a dos líneas a 375px. */}
            <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          <p className="mt-3 text-base text-foreground/80">
            {citation.supports}
          </p>
        </li>
      ))}
    </ul>
  );
}
