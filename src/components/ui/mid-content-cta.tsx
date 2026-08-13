import { BookingCta } from "@/components/ui/booking-cta";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import type { CtaLocation } from "@/lib/site-config";

type MidContentCtaProps = {
  heading: string;
  body: string;
  location: Extract<CtaLocation, "service_page" | "blog_post" | "booking_page">;
  /**
   * El chat del doctor se ofrece solo donde él maneja la agenda. En una sede
   * de clínica el banner se queda con `/agendar`: ofrecer su WhatsApp ahí
   * rompería la regla de negocio que documenta `locations.ts`.
   */
  withWhatsApp?: boolean;
};

/**
 * Banner de conversión del primer tercio del documento.
 *
 * El destino principal es `/agendar`, no el chat directo: tres de las cuatro
 * sedes las agenda la clínica y no el doctor, que es la misma razón ya
 * documentada dentro de `BookingCta`.
 *
 * El título es un párrafo con estilo de encabezado, nunca un `h2`: si fuera
 * encabezado aparecería en la tabla de contenidos y contaminaría el esquema.
 */
export function MidContentCta({
  heading,
  body,
  location,
  withWhatsApp = true,
}: MidContentCtaProps) {
  return (
    <aside
      data-mid-cta=""
      className="mt-12 rounded-2xl border border-border bg-muted p-6 sm:p-8"
    >
      <p className="font-heading text-lg font-bold text-foreground">{heading}</p>
      <p className="mt-2 text-foreground/80">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <BookingCta>Agendar consulta</BookingCta>
        {withWhatsApp ? (
          <WhatsAppCta variant="outline" location={location}>
            Escribir por WhatsApp
          </WhatsAppCta>
        ) : null}
      </div>
    </aside>
  );
}
