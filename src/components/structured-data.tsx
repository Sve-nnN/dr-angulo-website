import { siteConfig } from "@/lib/site-config";

function JsonLdScript({ data, id }: { data: unknown; id: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** JSON-LD principal (Physician) — se renderiza una vez en el layout raíz. */
export function PhysicianJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${siteConfig.url}/#physician`,
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: `+${siteConfig.whatsapp.number}`,
    medicalSpecialty: ["Musculoskeletal", "Surgical"],
    knowsAbout: [
      "Traumatología",
      "Ortopedia infantil",
      "Cirugía de columna",
      "Hernia discal",
      "Escoliosis",
      "Estenosis espinal",
      "Lumbalgia",
      "Cervicalgia",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.clinic.streetAddress,
      addressLocality: siteConfig.clinic.addressLocality,
      addressRegion: siteConfig.clinic.addressRegion,
      postalCode: siteConfig.clinic.postalCode,
      addressCountry: siteConfig.clinic.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.clinic.geo.latitude,
      longitude: siteConfig.clinic.geo.longitude,
    },
    hospitalAffiliation: {
      "@type": "MedicalOrganization",
      name: siteConfig.clinic.name,
    },
    areaServed: { "@type": "City", name: "Lima" },
    sameAs: [siteConfig.social.instagram, siteConfig.social.doctoralia],
  };

  return <JsonLdScript id="physician-jsonld" data={data} />;
}

export type FaqJsonLdItem = { question: string; answer: string };

/** JSON-LD FAQPage — usar en páginas que muestren preguntas frecuentes reales. */
export function FaqJsonLd({ items }: { items: FaqJsonLdItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteConfig.url}/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLdScript id="faq-jsonld" data={data} />;
}
