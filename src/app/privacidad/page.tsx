import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad y tratamiento de datos personales.",
  alternates: { canonical: "/privacidad" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Política de privacidad",
    description: "Política de privacidad y tratamiento de datos personales.",
    url: "/privacidad",
  },
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-heading text-3xl font-extrabold text-primary">
        Política de privacidad
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Última actualización: julio de 2026
      </p>

      <div className="prose-content mt-8 space-y-6 text-foreground/80">
        <section>
          <h2 className="font-heading text-lg font-bold text-primary">
            1. Datos que recopilamos
          </h2>
          <p className="mt-2">
            Cuando completas el formulario de contacto de este sitio, recopilamos
            tu nombre, teléfono, correo electrónico (si lo proporcionas) y el
            motivo de tu consulta. Estos datos se usan únicamente para
            responder a tu solicitud de información o cita médica.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-primary">
            2. Contacto por WhatsApp
          </h2>
          <p className="mt-2">
            Si nos escribes por WhatsApp, la conversación se rige también por
            las políticas de privacidad de WhatsApp/Meta. No compartimos tu
            número ni el contenido de esa conversación con terceros ajenos a
            la atención de tu consulta.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-primary">
            3. Cookies y analítica
          </h2>
          <p className="mt-2">
            Usamos Google Analytics y Meta Pixel para entender cómo se usa el
            sitio y mejorar la experiencia — por ejemplo, qué páginas se
            visitan más o qué botones generan más contactos. Estas
            herramientas solo se activan si aceptas el aviso de cookies que
            aparece al ingresar al sitio. Puedes rechazarlas sin que eso
            afecte tu posibilidad de navegar el sitio o de contactarnos.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-primary">
            4. Tus derechos
          </h2>
          <p className="mt-2">
            De acuerdo con la Ley de Protección de Datos Personales del Perú
            (Ley N.º 29733), puedes solicitar acceso, rectificación o
            eliminación de tus datos personales escribiéndonos a través de
            WhatsApp al {siteConfig.whatsapp.displayNumber}.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-primary">
            5. Contacto
          </h2>
          <p className="mt-2">
            Para cualquier consulta sobre esta política, escríbenos por
            WhatsApp al {siteConfig.whatsapp.displayNumber}.
          </p>
        </section>
      </div>
    </div>
  );
}
