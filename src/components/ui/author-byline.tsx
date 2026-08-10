import Link from "next/link";
import { credentialsInfo } from "@/content/cv";
import { siteConfig } from "@/lib/site-config";

/**
 * Firma del doctor en el contenido clínico.
 *
 * El componente no acepta texto libre ni datos de acreditación por props: la
 * colegiatura y el registro de especialista se leen del CV verificado y nada
 * más. Si el hueco para una afirmación suelta no existe, no se llena por
 * descuido (SAFE-04, SAFE-06).
 */

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

type AuthorBylineProps = {
  publishedAt: string;
  updatedAt: string;
};

export function AuthorByline({ publishedAt, updatedAt }: AuthorBylineProps) {
  return (
    <div
      data-author-byline=""
      className="mt-8 border-y border-border py-6"
    >
      <p className="font-heading text-base font-bold text-foreground">
        {siteConfig.name}
      </p>
      <p className="mt-1 text-sm text-foreground/70">
        {siteConfig.specialties.join(" · ")}
      </p>
      <p className="mt-1 text-sm text-foreground/70">
        {`CMP ${credentialsInfo.cmp} · RNE ${credentialsInfo.rne}`}
      </p>
      <p className="mt-2 text-sm text-foreground/70">
        {"Publicado el "}
        <time dateTime={publishedAt}>
          {dateFormatter.format(new Date(publishedAt))}
        </time>
        {" · Actualizado el "}
        <time dateTime={updatedAt}>
          {dateFormatter.format(new Date(updatedAt))}
        </time>
      </p>
      <Link
        href="/sobre-el-doctor"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary-dark hover:underline"
      >
        Ver trayectoria completa
      </Link>
    </div>
  );
}
