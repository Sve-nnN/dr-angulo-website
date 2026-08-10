import { BookingCta } from "@/components/ui/booking-cta";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import type { CtaLocation } from "@/lib/site-config";

type MidContentCtaProps = {
  heading: string;
  body: string;
  location: Extract<CtaLocation, "service_page" | "blog_post">;
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
export function MidContentCta({ heading, body, location }: MidContentCtaProps) {
  return (
    <aside
      data-mid-cta=""
      className="mt-12 rounded-2xl border border-border border-l-4 border-l-accent bg-muted p-6 sm:p-8"
    >
      <p className="font-heading text-lg font-bold text-foreground">{heading}</p>
      <p className="mt-2 text-foreground/80">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <BookingCta>Agendar consulta</BookingCta>
        <WhatsAppCta variant="outline" location={location}>
          Escribir por WhatsApp
        </WhatsAppCta>
      </div>
    </aside>
  );
}
