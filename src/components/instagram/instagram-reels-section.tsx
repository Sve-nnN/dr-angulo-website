import { ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { getInstagramReels } from "@/lib/instagram";
import { siteConfig } from "@/lib/site-config";
import { ReelsCarouselLazy } from "./reels-carousel-lazy";

type Props = {
  /** Máximo de reels a mostrar. */
  limit?: number;
  title?: string;
  intro?: string;
  className?: string;
};

/**
 * Carrusel con los últimos reels del Instagram del doctor. Se alimenta solo
 * desde la API de Instagram (revalida cada hora). Si no hay token configurado
 * o la API falla, cae en una tarjeta que lleva al perfil.
 */
export async function InstagramReelsSection({
  limit = 12,
  title = "Últimos videos del consultorio",
  intro = "Casos, dudas frecuentes y consejos de recuperación, explicados en video por el Dr. Angulo.",
  className = "",
}: Props) {
  const reels = await getInstagramReels(limit);
  const headingId = "instagram-reels-heading";

  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id={headingId}
            className="font-heading text-2xl font-bold text-primary sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-foreground/70">{intro}</p>
        </div>

        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
        >
          Ver el perfil completo
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      </div>

      <div className="mt-8">
        {reels.length > 0 ? (
          <ReelsCarouselLazy reels={reels} labelledBy={headingId} />
        ) : (
          <p className="border-y border-border py-8 text-lg text-foreground/80">
            Los videos están publicados en{" "}
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
            >
              <InstagramIcon className="size-4 shrink-0" />
              @dr.juancarlosangulo
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            .
          </p>
        )}
      </div>
    </section>
  );
}
