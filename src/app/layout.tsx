import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatButton } from "@/components/layout/whatsapp-float-button";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";
import { PhysicianJsonLd } from "@/components/structured-data";
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
    default: `${siteConfig.name} — ${siteConfig.title}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.description,
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
        <PhysicianJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloatButton />
        <CookieConsentBanner />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
