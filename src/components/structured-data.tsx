import { siteConfig } from "@/lib/site-config";
import { clinicLocations } from "@/content/locations";

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
    image: `${siteConfig.url}/og-dr-angulo.jpg`,
    medicalSpecialty: ["Musculoskeletal", "Surgical"],
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Universidad de Oriente, Núcleo Bolívar",
      },
      {
        "@type": "MedicalOrganization",
        name: "Instituto de Columna de Caracas, Hospital de Clínicas Caracas",
      },
    ],
    knowsAbout: [
      "Traumatología",
      "Ortopedia infantil",
      "Cirugía de columna",
      "Cirugía de columna mínimamente invasiva",
      "Hernia discal",
      "Escoliosis",
      "Deformidades de columna",
      "Enfermedad degenerativa de columna",
      "Estenosis espinal",
      "Lumbalgia",
      "Cervicalgia",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.office.streetAddress,
      addressLocality: siteConfig.office.addressLocality,
      addressRegion: siteConfig.office.addressRegion,
      postalCode: siteConfig.office.postalCode,
      addressCountry: siteConfig.office.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.office.geo.latitude,
      longitude: siteConfig.office.geo.longitude,
    },
    // Las tres clínicas donde pasa consulta, cada una con su propia agenda.
    hospitalAffiliation: clinicLocations.map((clinic) => ({
      "@type": "MedicalOrganization",
      name: clinic.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.streetAddress,
        addressLocality: clinic.addressLocality,
        addressRegion: clinic.addressRegion,
        postalCode: clinic.postalCode,
        addressCountry: clinic.addressCountry,
      },
    })),
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
