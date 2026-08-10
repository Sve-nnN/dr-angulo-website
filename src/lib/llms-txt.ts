/**
 * Resumen del sitio en el formato llms.txt (SEO-10).
 *
 * Lo leen los motores generativos que no ejecutan JavaScript ni recorren el
 * sitio entero: en un solo archivo de texto encuentran quién es el doctor, qué
 * acredita, qué condiciones cubre, dónde atiende y cómo se agenda, con el
 * enlace canónico de cada tema.
 *
 * Regla de construcción: **nada se escribe a mano acá**. Cada línea sale de las
 * mismas fuentes que alimentan las páginas y el JSON-LD (`cv.ts`, `locations.ts`,
 * `services.ts`, `service-pages.ts`, `location-pages.ts`, `blog.ts`, `faq.ts`).
 * Si el doctor suma una sede o una guía, este archivo se actualiza solo y no
 * puede desincronizarse del sitio.
 *
 * Convención del formato (llmstxt.org): un `h1` con el nombre, una cita de
 * resumen, secciones `h2` y listas de enlaces `- [texto](url): descripción`.
 */

import { siteConfig } from "@/lib/site-config";
import { credentialsInfo, education } from "@/content/cv";
import { locations, primaryLocation } from "@/content/locations";
import { serviceCategories, procedureApproaches } from "@/content/services";
import { servicePages } from "@/content/service-pages";
import { locationPages } from "@/content/location-pages";
import { blogPosts } from "@/content/blog";
import { faqItems } from "@/content/faq";

function abs(path: string) {
  return `${siteConfig.url}${path}`;
}

/** `- [texto](url): descripción` con la descripción en una sola línea. */
function link(text: string, path: string, description?: string) {
  const entry = `- [${text}](${abs(path)})`;
  return description ? `${entry}: ${description.replace(/\s+/g, " ").trim()}` : entry;
}

function scheduleLine(slug: string) {
  const location = locations.find((item) => item.slug === slug);
  if (!location) return "";
  return location.schedule.map((block) => `${block.days}, ${block.hours}`).join("; ");
}

export function buildLlmsTxt(): string {
  const blocks: string[] = [];

  blocks.push(`# ${siteConfig.name}`);

  // `siteConfig.title` ya nombra la ciudad y va en capitalización de título:
  // se interpola tal cual y nunca en minúsculas, porque contiene el topónimo
  // "Lima" y bajarlo produciría "en lima".
  blocks.push(
    `> ${siteConfig.title}, Perú. Colegiatura CMP ${credentialsInfo.cmp} y Registro Nacional de Especialista RNE ${credentialsInfo.rne}. Atiende columna vertebral, traumatología y ortopedia infantil en ${locations.length} sedes de Lima.`
  );

  blocks.push(
    [
      `Este archivo resume ${siteConfig.url} para sistemas que leen el sitio de forma automatizada.`,
      "Todo el contenido está en español y el sitio no tiene versiones en otros idiomas.",
      "El contenido clínico es educativo y no reemplaza una consulta médica presencial.",
    ].join(" ")
  );

  // --- quién es -------------------------------------------------------------
  blocks.push(
    [
      "## Quién es",
      "",
      `Nombre completo: ${siteConfig.name}. Nombre corto: ${siteConfig.shortName}.`,
      `Especialidad: ${siteConfig.title}.`,
      `Ejerce hace ${credentialsInfo.yearsOfExperience} años y suma ${credentialsInfo.internationalTrainings} entrenamientos fuera del país.`,
      "",
      "Formación:",
      ...education.map((item) =>
        `- ${item.title}, ${item.place}${item.period ? ` (${item.period})` : ""}`
      ),
      "",
      "Credenciales verificables:",
      `- Colegio Médico del Perú, CMP ${credentialsInfo.cmp}`,
      `- Registro Nacional de Especialista, RNE ${credentialsInfo.rne}`,
      "",
      link("Trayectoria completa", "/sobre-el-doctor", "formación, experiencia y cursos, según su CV"),
    ].join("\n")
  );

  // --- qué trata ------------------------------------------------------------
  blocks.push(
    [
      "## Qué trata",
      "",
      ...serviceCategories.flatMap((category) => [
        `### ${category.name}`,
        "",
        category.description,
        "",
        ...category.conditions.map((condition) => `- ${condition}`),
        "",
      ]),
      link("Índice de especialidades y condiciones", "/servicios"),
    ].join("\n")
  );

  // --- guías clínicas -------------------------------------------------------
  blocks.push(
    [
      "## Guías clínicas por condición",
      "",
      "Cada guía explica qué es la condición, qué síntomas produce, cómo se diagnostica, qué opciones de tratamiento existen y cómo es la recuperación.",
      "",
      ...servicePages.map((page) =>
        link(page.title, `/servicios/${page.slug}`, page.description)
      ),
    ].join("\n")
  );

  // --- procedimientos -------------------------------------------------------
  blocks.push(
    [
      "## Abordajes quirúrgicos",
      "",
      ...procedureApproaches.flatMap((approach) => [
        `### ${approach.name}`,
        "",
        approach.description,
        "",
        `Se aplica en: ${approach.examples.join(", ").toLowerCase()}.`,
        "",
      ]),
    ]
      .join("\n")
      .trimEnd()
  );

  // --- dónde atiende --------------------------------------------------------
  blocks.push(
    [
      "## Dónde atiende",
      "",
      ...locationPages.flatMap((page) => {
        const location = locations.find((item) => item.slug === page.slug);
        if (!location) return [];
        return [
          `### ${location.name}`,
          "",
          `- Dirección: ${location.streetAddress}${location.building ? `, ${location.building}` : ""}, ${location.addressLocality}, ${location.addressRegion}, Perú`,
          `- Horario de atención: ${scheduleLine(page.slug)}`,
          `- Teléfono: ${location.telephone}`,
          `- Cómo se agenda: ${page.cardSummary}`,
          `- Página de la sede: ${abs(`/sedes/${page.slug}`)}`,
          "",
        ];
      }),
      link("Índice de sedes", "/sedes"),
    ].join("\n")
  );

  // --- cómo se agenda -------------------------------------------------------
  blocks.push(
    [
      "## Cómo agendar una cita",
      "",
      `El WhatsApp del doctor (${siteConfig.whatsapp.displayNumber}) agenda únicamente el consultorio privado de ${primaryLocation.addressLocality}.`,
      "Las citas en Clínica Ricardo Palma, Clínica Sanna La Molina y Clínica Padre Luis Tezza se sacan con la central de cada clínica, porque el doctor no maneja esas agendas.",
      "",
      link("Sedes, horarios y canal de cita de cada una", "/agendar"),
      link("Formulario de contacto", "/contacto"),
    ].join("\n")
  );

  // --- artículos ------------------------------------------------------------
  blocks.push(
    [
      "## Artículos del blog",
      "",
      ...blogPosts.map((post) => link(post.title, `/blog/${post.slug}`, post.description)),
      "",
      link("Índice del blog", "/blog"),
    ].join("\n")
  );

  // --- preguntas frecuentes -------------------------------------------------
  blocks.push(
    [
      "## Preguntas frecuentes",
      "",
      ...faqItems.map((item) => `- ${item.question} ${item.answer}`),
      "",
      link("Todas las preguntas frecuentes", "/preguntas-frecuentes"),
    ].join("\n")
  );

  // --- resto ----------------------------------------------------------------
  blocks.push(
    [
      "## Otras páginas",
      "",
      link("Testimonios y reseñas de pacientes", "/testimonios"),
      link("Política de privacidad", "/privacidad"),
      link("Sitemap XML", "/sitemap.xml"),
    ].join("\n")
  );

  return `${blocks.join("\n\n")}\n`;
}
