import { siteConfig } from "@/lib/site-config";
import { locations, primaryLocation, clinicLocations, type Location } from "@/content/locations";
import { serviceCategories, procedureApproaches } from "@/content/services";
import { education, credentialsInfo } from "@/content/cv";
import { getGoogleReviews, type GoogleReviewsData } from "@/lib/google-reviews";

/**
 * Todo el JSON-LD del sitio.
 *
 * El layout raíz emite un `@graph` con los nodos estables (sitio, doctor y las
 * cuatro sedes) y cada página añade los suyos referenciando esos `@id` en vez
 * de repetir los datos. Así el doctor es una sola entidad para el buscador,
 * no una copia distinta por página.
 *
 * Decisión consciente: no se emite `Review` ni `AggregateRating`. Las reseñas
 * son de Doctoralia y marcarlas desde el propio sitio del doctor entra en la
 * categoría de reseñas autopublicadas, que Google ignora o penaliza.
 */

const ID = {
  website: `${siteConfig.url}/#website`,
  physician: `${siteConfig.url}/#physician`,
  location: (slug: string) => `${siteConfig.url}/#sede-${slug}`,
  procedure: (slug: string) => `${siteConfig.url}/#procedimiento-${slug}`,
};

function abs(path: string) {
  return path.startsWith("http") ? path : `${siteConfig.url}${path}`;
}

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

function postalAddress(location: Location) {
  return {
    "@type": "PostalAddress",
    streetAddress: location.streetAddress,
    addressLocality: location.addressLocality,
    addressRegion: location.addressRegion,
    postalCode: location.postalCode,
    addressCountry: location.addressCountry,
  };
}

function openingHours(location: Location) {
  return location.openingHours.map((block) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: block.days.map((day) => `https://schema.org/${day}`),
    ...(block.opens ? { opens: block.opens } : {}),
    ...(block.closes ? { closes: block.closes } : {}),
  }));
}

/** Cada sede como lugar de atención propio. */
function locationNode(location: Location) {
  const isOwnOffice = location.kind === "consultorio";

  return {
    "@type": isOwnOffice ? "MedicalClinic" : "Hospital",
    "@id": ID.location(location.slug),
    name: location.name,
    address: postalAddress(location),
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.geo.latitude,
      longitude: location.geo.longitude,
    },
    telephone: location.telephone,
    hasMap: location.mapsUrl,
    ...(location.website ? { url: location.website } : { url: abs("/agendar") }),
    openingHoursSpecification: openingHours(location),
    medicalSpecialty: ["Musculoskeletal", "Surgical"],
    ...(isOwnOffice ? { branchOf: { "@id": ID.physician } } : {}),
  };
}

/** Los dos abordajes quirúrgicos como procedimientos médicos. */
function procedureNodes() {
  return procedureApproaches.map((approach) => ({
    "@type": "MedicalProcedure",
    "@id": ID.procedure(approach.slug),
    name: approach.name,
    description: approach.description,
    procedureType: "https://schema.org/SurgicalProcedure",
    bodyLocation: "Columna vertebral",
    howPerformed: approach.examples.join(", "),
  }));
}

/** Las condiciones que trata, agrupadas por especialidad. */
function conditionNodes() {
  return serviceCategories.flatMap((category) =>
    category.conditions.map((condition) => ({
      "@type": "MedicalCondition",
      name: condition,
      possibleTreatment: { "@id": ID.procedure("minimamente-invasiva") },
    }))
  );
}

/**
 * Calificación y reseñas de Google dentro del nodo del doctor.
 *
 * ADVERTENCIA DE POLÍTICA: Google clasifica como "reseñas autopublicadas" las
 * que un negocio marca en su propio sitio sobre sí mismo, y no genera rich
 * snippet con ellas para LocalBusiness ni Organization. El marcado se emite
 * porque el cliente lo pidió y porque los datos son reales y verificables en la
 * ficha, pero no hay que esperar estrellas en los resultados de Google.
 * Para apagarlo: `REVIEWS_SCHEMA_ENABLED=false`.
 */
function ratingNodes(data: GoogleReviewsData | null) {
  if (!data || process.env.REVIEWS_SCHEMA_ENABLED === "false") return {};

  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: data.rating,
      reviewCount: data.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: data.reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.author },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.text,
      ...(review.publishedAt ? { datePublished: review.publishedAt } : {}),
      publisher: { "@type": "Organization", name: "Google" },
      ...(review.reviewUrl ? { url: review.reviewUrl } : {}),
    })),
  };
}

function physicianNode(reviews: GoogleReviewsData | null) {
  return {
    ...ratingNodes(reviews),
    "@type": "Physician",
    "@id": ID.physician,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: `+${siteConfig.whatsapp.number}`,
    image: abs("/og-dr-angulo.jpg"),
    logo: abs("/logo-dr-angulo.avif"),
    medicalSpecialty: ["Musculoskeletal", "Surgical"],
    jobTitle: siteConfig.title,
    address: postalAddress(primaryLocation),
    geo: {
      "@type": "GeoCoordinates",
      latitude: primaryLocation.geo.latitude,
      longitude: primaryLocation.geo.longitude,
    },
    openingHoursSpecification: openingHours(primaryLocation),
    areaServed: { "@type": "City", name: "Lima", addressCountry: "PE" },
    availableLanguage: { "@type": "Language", name: "Spanish", alternateName: "es" },
    alumniOf: education
      .filter((item) => item.place)
      .map((item) => ({
        "@type": "EducationalOrganization",
        name: item.place,
      })),
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Colegiatura",
        name: `Colegio Médico del Perú, CMP ${credentialsInfo.cmp}`,
        recognizedBy: { "@type": "Organization", name: "Colegio Médico del Perú" },
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Registro de especialista",
        name: `Registro Nacional de Especialista, RNE ${credentialsInfo.rne}`,
        recognizedBy: { "@type": "Organization", name: "Colegio Médico del Perú" },
      },
    ],
    // Cada clínica es una entidad del grafo, no una copia de sus datos.
    hospitalAffiliation: clinicLocations.map((clinic) => ({
      "@id": ID.location(clinic.slug),
    })),
    worksFor: locations.map((location) => ({ "@id": ID.location(location.slug) })),
    availableService: procedureApproaches.map((approach) => ({
      "@id": ID.procedure(approach.slug),
    })),
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
    sameAs: [siteConfig.social.instagram, siteConfig.social.doctoralia],
  };
}

/**
 * Grafo raíz: sitio, doctor, sedes y procedimientos. Se renderiza una sola vez
 * en el layout, así el resto de las páginas solo referencia sus `@id`.
 */
export async function SiteJsonLd() {
  const reviews = await getGoogleReviews();

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ID.website,
        url: siteConfig.url,
        name: `${siteConfig.name} — ${siteConfig.title}`,
        inLanguage: "es-PE",
        publisher: { "@id": ID.physician },
      },
      physicianNode(reviews),
      ...locations.map(locationNode),
      ...procedureNodes(),
    ],
  };

  return <JsonLdScript id="site-jsonld" data={data} />;
}

export type BreadcrumbItem = { name: string; path: string };

/** Migas de pan de la página actual. La home no lleva. */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Inicio", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };

  return <JsonLdScript id="breadcrumb-jsonld" data={data} />;
}

export type FaqJsonLdItem = { question: string; answer: string };

/**
 * FAQPage — solo en páginas que muestran las preguntas completas y visibles.
 *
 * `path` existe para que cada página emita su propio `@id` en vez de que todas
 * reclamen el de `/preguntas-frecuentes`. El valor por defecto conserva
 * exactamente el `@id` que esa página emitía antes de la parametrización.
 */
export function FaqJsonLd({
  items,
  path = "/preguntas-frecuentes",
}: {
  items: FaqJsonLdItem[];
  path?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": abs(`${path}#faq`),
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.physician },
    inLanguage: "es-PE",
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

/** Página de servicios: qué trata y con qué procedimientos. */
export function ServicesJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": abs("/servicios#page"),
    url: abs("/servicios"),
    name: "Especialidades y condiciones que trata el Dr. Juan Carlos Angulo",
    inLanguage: "es-PE",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.physician },
    specialty: ["Musculoskeletal", "Surgical"],
    mainContentOfPage: conditionNodes(),
    mentions: procedureApproaches.map((approach) => ({
      "@id": ID.procedure(approach.slug),
    })),
  };

  return <JsonLdScript id="servicios-jsonld" data={data} />;
}

export type MedicalWebPageJsonLdData = {
  slug: string;
  title: string;
  description: string;
  conditionName: string;
  alternateNames?: string[];
  publishedAt: string;
  updatedAt: string;
  describesSurgery: boolean;
};

/**
 * Guía clínica de una condición, bajo `/servicios/{slug}`.
 *
 * Deliberadamente no emite `reviewedBy` ni `lastReviewed`: el contenido se
 * publica antes de que el doctor lo revise, y afirmar una revisión médica que
 * no ocurrió es exactamente el riesgo que las salvaguardas de la fase
 * previenen. Cuando la revisión suceda, ese es el momento de sumarlos.
 *
 * `datePublished` y `dateModified` salen de los mismos campos que muestra
 * `AuthorByline`, así el marcado y lo que ve el paciente no divergen.
 */
export function MedicalWebPageJsonLd({ page }: { page: MedicalWebPageJsonLdData }) {
  const url = abs(`/servicios/${page.slug}`);
  // Se referencian los procedimientos ya declarados en el grafo raíz por su
  // `@id`; no se declara ninguno nuevo.
  const procedureRefs = procedureApproaches.map((approach) => ({
    "@id": ID.procedure(approach.slug),
  }));

  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${url}#page`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: "es-PE",
    isPartOf: { "@id": ID.website },
    author: { "@id": ID.physician },
    publisher: { "@id": ID.physician },
    datePublished: page.publishedAt,
    dateModified: page.updatedAt,
    specialty: ["Musculoskeletal", "Surgical"],
    mainEntityOfPage: url,
    about: {
      "@type": "MedicalCondition",
      name: page.conditionName,
      ...(page.alternateNames?.length
        ? { alternateName: page.alternateNames }
        : {}),
      ...(page.describesSurgery ? { possibleTreatment: procedureRefs } : {}),
    },
    ...(page.describesSurgery ? { mentions: procedureRefs } : {}),
  };

  return <JsonLdScript id="servicio-jsonld" data={data} />;
}

/** Página del doctor: perfil profesional. */
export function ProfilePageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": abs("/sobre-el-doctor#page"),
    url: abs("/sobre-el-doctor"),
    name: `Trayectoria y formación de ${siteConfig.name}`,
    inLanguage: "es-PE",
    isPartOf: { "@id": ID.website },
    mainEntity: { "@id": ID.physician },
  };

  return <JsonLdScript id="perfil-jsonld" data={data} />;
}

/** Página de agenda: las cuatro sedes como lista ordenada. */
export function BookingPageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": abs("/agendar#page"),
    url: abs("/agendar"),
    name: "Agendar cita: consultorios y horarios del Dr. Juan Carlos Angulo",
    inLanguage: "es-PE",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.physician },
    mainEntity: {
      "@type": "ItemList",
      name: "Sedes donde atiende el Dr. Juan Carlos Angulo",
      numberOfItems: locations.length,
      itemListElement: locations.map((location, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: { "@id": ID.location(location.slug) },
      })),
    },
  };

  return <JsonLdScript id="agendar-jsonld" data={data} />;
}

/** Página de contacto. */
export function ContactPageJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": abs("/contacto#page"),
    url: abs("/contacto"),
    name: `Contacto con ${siteConfig.name}`,
    inLanguage: "es-PE",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.physician },
    mainEntity: { "@id": ID.location(primaryLocation.slug) },
  };

  return <JsonLdScript id="contacto-jsonld" data={data} />;
}

export type BlogPostJsonLdItem = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  /** Slug de la guía de servicio que este post alimenta. */
  relatedService: string;
};

/** Listado del blog. */
export function BlogJsonLd({ posts }: { posts: BlogPostJsonLdItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": abs("/blog#blog"),
    url: abs("/blog"),
    name: `Blog de ${siteConfig.name}`,
    inLanguage: "es-PE",
    isPartOf: { "@id": ID.website },
    publisher: { "@id": ID.physician },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": abs(`/blog/${post.slug}#post`),
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      url: abs(`/blog/${post.slug}`),
    })),
  };

  return <JsonLdScript id="blog-jsonld" data={data} />;
}

/**
 * Artículo individual, escrito y publicado por el doctor.
 *
 * `datePublished` y `dateModified` salen de los mismos dos campos que muestra
 * `AuthorByline`, así el marcado y lo que ve el paciente no divergen. Como en
 * las guías de servicio, no se emite `reviewedBy` ni `lastReviewed`: el texto
 * se publica antes de que el doctor lo revise.
 *
 * `about` apunta al `@id` de la guía de servicio del tema, que es lo que le
 * dice al buscador que el post y la guía son el mismo silo.
 */
export function BlogPostingJsonLd({ post }: { post: BlogPostJsonLdItem }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": abs(`/blog/${post.slug}#post`),
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    about: { "@id": `${abs(`/servicios/${post.relatedService}`)}#page` },
    url: abs(`/blog/${post.slug}`),
    inLanguage: "es-PE",
    image: abs("/og-dr-angulo.jpg"),
    author: { "@id": ID.physician },
    publisher: { "@id": ID.physician },
    // El nodo Blog vive en /blog; acá se declara con tipo para que el artículo
    // sea autocontenido si Google lo rastrea suelto.
    isPartOf: {
      "@type": "Blog",
      "@id": abs("/blog#blog"),
      name: `Blog de ${siteConfig.name}`,
      url: abs("/blog"),
    },
    mainEntityOfPage: abs(`/blog/${post.slug}`),
  };

  return <JsonLdScript id="post-jsonld" data={data} />;
}
