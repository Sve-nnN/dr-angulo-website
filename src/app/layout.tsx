import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatButton } from "@/components/layout/whatsapp-float-button";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { SiteJsonLd } from "@/components/structured-data";
import { siteConfig } from "@/lib/site-config";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: `%s | ${siteConfig.shortName}`,
    default: "Traumatología en Lima: Dr. Juan Carlos Angulo",
  },
  description:
    "Traumatólogo y cirujano de columna en Lima. Atiende en su consultorio de Surco, Ricardo Palma, Sanna La Molina y Clínica Tezza.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: siteConfig.name,
    title: "Traumatología en Lima: Dr. Juan Carlos Angulo",
    description:
      "Traumatólogo y cirujano de columna en Lima. Atiende en su consultorio de Surco, Ricardo Palma, Sanna La Molina y Clínica Tezza.",
    url: siteConfig.url,
    images: [
      {
        url: "/og-dr-angulo.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}, traumatólogo y cirujano de columna en Lima`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // Sin `title`, `description` ni `images` a propósito. X solo cae a `og:*`
    // cuando la etiqueta `twitter:*` está ausente, nunca cuando está presente
    // pero genérica. Declarar acá un title/description fijo del layout se
    // heredaría literal en las 23 rutas y pisaría el `og:title`/`og:description`
    // propio de cada una (CR-02, 10-REVIEW.md). Mismo razonamiento que ya regía
    // `images`: cada ruta expone su propio og:title/og:description/og:image y
    // X los toma directo.
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <SiteJsonLd />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-base focus:font-semibold focus:text-on-primary"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFloatButton />
        <CookieConsentBanner />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
