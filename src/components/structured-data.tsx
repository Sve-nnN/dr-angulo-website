import { siteConfig } from "@/lib/site-config";
import { locations, primaryLocation, clinicLocations, type Location } from "@/content/locations";
import type { LocationPage } from "@/content/location-pages";
import { serviceCategories, procedureApproaches } from "@/content/services";
import { education, credentialsInfo } from "@/content/cv";

/**
 * Todo el JSON-LD del sitio.
 *
 * El layout raíz emite un `@graph` con los nodos estables (sitio, doctor y las
 * cuatro sedes) y cada página añade los suyos referenciando esos `@id` en vez
 * de repetir los datos. Así el doctor es una sola entidad para el buscador,
 * no una copia distinta por página.
 *
 * Sobre reseñas: el sitio NO emite `Review` ni `AggregateRating` en ningún
 * nodo, y no vuelve a emitirlos. Entre agosto de 2026 y la auditoría de
 * AUD-01, el nodo `Physician` declaraba como propias la calificación y las
 * reseñas que los pacientes publicaron en la ficha de Google. Las directrices
 * de Google prohíben marcar en el sitio propio reseñas publicadas en
 * plataformas de terceros, aunque los datos sean reales y verificables: no
 * generan rich result y exponen el dominio a una acción manual. La sección
 * visible de reseñas se quedó exactamente como estaba, porque mostrarlas con
 * atribución sí está permitido; lo que se retiró es el marcado.
 *
 * Si alguien pide "devolver las estrellas", la respuesta es que las estrellas
 * de Google salen de la ficha del negocio, no de este marcado. El camino es
 * conseguir más reseñas en la ficha, no volver a declararlas acá.
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

/**
 * Cada sede como lugar de atención propio.
 *
 * El mapeo de tipos sale de 09-CONTEXT.md (D-07): las tres clínicas son
 * `MedicalClinic` y el consultorio propio es `MedicalBusiness`. Antes emitía
 * `Hospital` para las clínicas, que schema.org reserva para instituciones con
 * internamiento, y `MedicalClinic` para el consultorio, que es un despacho de
 * un solo médico. No devolverlo al mapeo anterior.
 */
function locationNode(location: Location) {
  const isOwnOffice = location.kind === "consultorio";

  return {
    "@type": isOwnOffice ? "MedicalBusiness" : "MedicalClinic",
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
    // La URL canónica de esta ubicación dentro del sitio es su página de sede,
    // no la web de la clínica: es la superficie que este dominio controla y la
    // que se quiere indexar. La web oficial, cuando existe, es la misma entidad
    // en otro dominio, que es lo que significa `sameAs`. Antes de que las
    // páginas de sede existieran, este campo apuntaba a la web de la clínica o,
    // a falta de ella, a `/agendar` como sustituto.
    url: abs(`/sedes/${location.slug}`),
    ...(location.website ? { sameAs: [location.website] } : {}),
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

function physicianNode() {
  return {
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
export function SiteJsonLd() {
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
      physicianNode(),
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

/**
 * Página de una sede, bajo `/sedes/{slug}`.
 *
 * El nodo de la ubicación lo produce la **misma** `locationNode` que usa el
 * grafo raíz, con el mismo `@id`. Un solo camino de código produce marcado de
 * ubicación en todo el sitio, así la página y el grafo raíz no pueden decir
 * cosas distintas de la misma sede (D-08).
 */
export function SedeJsonLd({
  page,
  location,
}: {
  page: LocationPage;
  location: Location;
}) {
  const url = abs(`/sedes/${page.slug}`);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${url}#page`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "es-PE",
        isPartOf: { "@id": ID.website },
        about: { "@id": ID.physician },
        publisher: { "@id": ID.physician },
        mainEntity: { "@id": ID.location(location.slug) },
      },
      locationNode(location),
    ],
  };

  return <JsonLdScript id="sede-jsonld" data={data} />;
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
  /** Slug de la guía de servicio que este post alimenta, si tiene una. */
  relatedService?: string;
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
 * dice al buscador que el post y la guía son el mismo silo. Se omite si el
 * post no declara guía: un `about` que apunta a una URL inexistente vale menos
 * que no emitirlo.
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
    ...(post.relatedService
      ? { about: { "@id": `${abs(`/servicios/${post.relatedService}`)}#page` } }
      : {}),
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
