import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Stethoscope } from "lucide-react";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon-square.avif"
              alt=""
              width={44}
              height={44}
              className="shrink-0 rounded-full"
            />
            <div>
              <p className="font-heading text-lg font-bold text-primary">
                {siteConfig.shortName}
              </p>
              <p className="text-sm text-foreground/70">Cirujano de columna</p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-foreground/70">
            <Stethoscope className="size-4 shrink-0" aria-hidden="true" />
            {siteConfig.specialties.join(" · ")}
          </p>
          <p className="mt-2 text-xs text-foreground/70">
            CMP {siteConfig.credentials.cmp} · RNE {siteConfig.credentials.rne}
          </p>
        </div>

        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
            Consultorio privado
          </h2>
          <p className="mt-3 flex items-start gap-2 text-sm text-foreground/70">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <a
              href={siteConfig.office.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-150 hover:text-primary hover:underline"
            >
              {siteConfig.office.streetAddress}, {siteConfig.office.addressLocality},{" "}
              {siteConfig.office.addressRegion} ({siteConfig.office.building})
              <span className="sr-only"> (abre Google Maps en una pestaña nueva)</span>
            </a>
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-foreground/70">
            <Phone className="size-4 shrink-0" aria-hidden="true" />
            <a
              href={`tel:+${siteConfig.whatsapp.number}`}
              className="transition-colors duration-150 hover:text-primary hover:underline"
            >
              {siteConfig.whatsapp.displayNumber}
            </a>
          </p>
          <p className="mt-3 text-xs text-foreground/70">
            También atiende en Clínica Ricardo Palma, Sanna La Molina y Clínica
            Tezza, con la agenda de cada clínica.
          </p>
          <Link
            href="/agendar"
            className="mt-2 inline-block text-sm font-semibold text-primary transition-colors duration-150 hover:text-primary-dark hover:underline"
          >
            Ver sedes y horarios
          </Link>
        </div>

        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-primary">
            Contacto rápido
          </h2>
          <div className="mt-3">
            <WhatsAppCta location="footer" variant="outline">
              Escribir por WhatsApp
            </WhatsAppCta>
          </div>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-foreground/70 transition-colors duration-150 hover:text-primary"
          >
            <InstagramIcon className="size-4 shrink-0" />
            @dr.juancarlosangulo
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-foreground/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <Link href="/privacidad" className="hover:text-primary hover:underline">
            Política de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
