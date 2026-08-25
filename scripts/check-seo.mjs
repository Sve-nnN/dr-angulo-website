#!/usr/bin/env node
/**
 * Puerta ejecutable de la capa de lectura automatizada (fase 10).
 *
 *   node scripts/check-seo.mjs
 *
 * Lee el HTML y los artefactos que `npm run build` deja en `.next/server/app/`.
 * Si falta el build, falla: igual que las otras tres puertas, aprobar por
 * ausencia de evidencia es peor que no tener puerta.
 *
 * Verifica siete familias:
 *
 *   1. SEO-05  Toda ruta anidada emite `BreadcrumbList` y la portada no.
 *   2. SEO-06  El grafo raíz declara CMP, RNE y el horario de las cuatro sedes.
 *   3. AUD-01  Ninguna ruta emite nodos de reseña ni calificación agregada.
 *   3 bis.     AUD-02 a AUD-06: logo con dimensiones, `sameAs` con los cuatro
 *              perfiles, tipo único de sede, `hasMap` por CID del consultorio y
 *              especialidades en forma canónica de URL.
 *   4. SEO-08  Cada ruta declara su propia imagen de Open Graph y esa imagen
 *              existe en el build.
 *   5. SEO-08  Ningún `title` pasa de `TITLE_MAX` ni ninguna `description` de
 *              `DESCRIPTION_MAX`, medidos sobre el HTML servido.
 *   6. SEO-10  `/llms.txt` se prerenderiza con contenido real.
 *   7. SEO-11  `dr-angulo-portrait.png` no está ni en el repo ni en el build.
 *              Más la hoja de estilo del sitemap, pedido de Juan del 2026-08-10.
 *
 * Los textos que se miden salen del paquete on-page de v1.2, que los planes
 * 10-01 y 10-02 aplicaron ruta por ruta; los dos límites viven en las
 * constantes `TITLE_MAX` y `DESCRIPTION_MAX`, acá abajo.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const APP_DIR = ".next/server/app";
const SITEMAP = `${APP_DIR}/sitemap.xml.body`;
const LLMS = `${APP_DIR}/llms.txt.body`;
const STYLESHEET = "public/sitemap.xsl";
/** Las 21 con las que cerró la fase 9 más la página de cirugía mínimamente
 *  invasiva del plan 08-16 y los dos posts nuevos, artrosis del plan 08-12 y
 *  lumbalgia del 08-13, menos los dos posts que el plan 08-14 apagó con 301
 *  hacia la guía que los absorbió. 21 + 1 + 2 − 2 = 22, y es el número con el
 *  que cierra la fase 8.
 *
 *  La fase 16 de v1.3 suma /blog/reumatologo-o-traumatologo, salida de separar
 *  /preguntas-frecuentes en dos páginas. Los dos renombres de slug de esa fase
 *  cambian una URL por otra y no mueven el total. 22 + 1 = 23. */
const SITEMAP_TOTAL = 23;

/** Límites de SEO-08, en caracteres del texto ya desescapado. */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

/**
 * Rutas que declaran `noindex` y por eso quedan fuera del sitemap.
 *
 * Entran igual a la revisión de imagen de Open Graph, porque un enlace se
 * comparte por WhatsApp esté indexado o no, y quedan fuera de la de migas de
 * pan: el criterio de SEO-05 es que Google muestre la miga en el resultado, y
 * una página que uno mismo le pide no indexar nunca tiene resultado. La puerta
 * comprueba que sigan siendo `noindex` en vez de creerle a esta lista.
 */
const NOINDEX_ROUTES = ["/privacidad"];

/** El retrato antiguo que sacó SEO-11. No puede volver por descuido. */
const DELETED_ASSET = "dr-angulo-portrait.png";

/** Secciones que `/llms.txt` tiene que traer sí o sí. */
const LLMS_SECTIONS = [
  "## Quién es",
  "## Qué trata",
  "## Guías clínicas por condición",
  "## Dónde atiende",
  "## Cómo agendar una cita",
];

const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function htmlFor(route) {
  return route === "/" ? `${APP_DIR}/index.html` : `${APP_DIR}${route}.html`;
}

function read(path) {
  return readFileSync(resolve(path), "utf8");
}

// --------------------------------------------------------------------------
// Rutas: se derivan del sitemap para que sumar una página no obligue a
// mantener una segunda lista acá.
// --------------------------------------------------------------------------

function routesFromSitemap(sitemap) {
  const origin = /<loc>(https?:\/\/[^/<]+)/.exec(sitemap)?.[1];
  if (!origin) {
    fail("no se pudo leer el origen del sitemap");
    return [];
  }

  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    const path = match[1].slice(origin.length);
    return path === "" ? "/" : path;
  });
}

// --------------------------------------------------------------------------
// 1. SEO-05, migas de pan
// --------------------------------------------------------------------------

function checkBreadcrumbs(routes) {
  for (const route of routes) {
    const file = htmlFor(route);
    if (!existsSync(resolve(file))) continue;

    const html = read(file);

    if (NOINDEX_ROUTES.includes(route)) {
      if (!/<meta name="robots" content="[^"]*noindex/.test(html)) {
        fail(`${route} está exenta de migas de pan por noindex y ya no declara noindex`);
      }
      continue;
    }

    const nested = route !== "/";
    const has = html.includes('"@type":"BreadcrumbList"');

    if (nested && !has) fail(`${route} no emite BreadcrumbList`);
    if (!nested && has) {
      fail("la portada emite BreadcrumbList y no debería: es el primer nivel");
    }
    if (nested && has) {
      // La miga siempre arranca en Inicio: sin ese primer eslabón, Google no
      // sabe dónde empieza la ruta.
      if (!html.includes('"position":1,"name":"Inicio"')) {
        fail(`${route} tiene BreadcrumbList pero no arranca en Inicio`);
      }
    }
  }
}

// --------------------------------------------------------------------------
// 2. SEO-06, credenciales y horarios en el grafo raíz
// --------------------------------------------------------------------------

function siteGraph(html) {
  const anchor = html.indexOf('"site-jsonld"');
  if (anchor === -1) return null;

  const start = html.indexOf('{"@context"', anchor);
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < html.length; i += 1) {
    if (html[i] === "{") depth += 1;
    else if (html[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1).replace(/\\u003c/g, "<"));
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

function checkCredentialsAndHours() {
  const graph = siteGraph(read(htmlFor("/")));
  if (!graph) {
    fail("no se pudo leer el grafo JSON-LD de la portada");
    return;
  }

  const nodes = graph["@graph"] ?? [];
  const physician = nodes.find((node) => node["@type"] === "Physician");

  if (!physician) {
    fail("el grafo raíz no declara el nodo Physician");
    return;
  }

  const credentials = JSON.stringify(physician.hasCredential ?? []);
  if (!/CMP\s*\d{4,}/.test(credentials)) {
    fail("hasCredential no declara la colegiatura CMP");
  }
  if (!/RNE\s*\d{4,}/.test(credentials)) {
    fail("hasCredential no declara el registro de especialista RNE");
  }

  const locationNodes = nodes.filter((node) => String(node["@id"] ?? "").includes("#sede-"));
  if (locationNodes.length === 0) fail("el grafo raíz no declara ninguna sede");

  for (const node of locationNodes) {
    const blocks = node.openingHoursSpecification ?? [];
    if (blocks.length === 0) {
      fail(`la sede ${node.name} no declara openingHoursSpecification`);
      continue;
    }
    for (const block of blocks) {
      if (!Array.isArray(block.dayOfWeek) || block.dayOfWeek.length === 0) {
        fail(`la sede ${node.name} tiene un bloque de horario sin días`);
      }
      // `opens`/`closes` pueden faltar si el horario se coordina caso por caso,
      // pero si está uno tiene que estar el otro.
      if (Boolean(block.opens) !== Boolean(block.closes)) {
        fail(`la sede ${node.name} declara media hora de atención`);
      }
    }
  }

  if (!physician.openingHoursSpecification?.length) {
    fail("el nodo Physician no declara openingHoursSpecification");
  }
}

// --------------------------------------------------------------------------
// 3. AUD-01, ninguna reseña ni calificación en el marcado
//
// El sitio dejó de declarar como propias las reseñas que los pacientes
// publicaron en la ficha de Google: las directrices de Google prohíben marcar
// en el sitio propio reseñas de plataformas de terceros. La sección visible se
// quedó como estaba, con atribución, que sí está permitido.
//
// La comprobación corre sobre el HTML prerenderizado y no sobre `src/`, porque
// lo que importa es lo que el rastreador lee. Un nodo `Review` que entre por
// cualquier camino nuevo, aunque no sea el que se retiró, falla igual.
// --------------------------------------------------------------------------

/** Todos los bloques `application/ld+json` de un documento, ya desescapados. */
function jsonLdBlocks(html) {
  return [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
    ),
  ].map((match) => match[1].replace(/\\u003c/g, "<"));
}

/** Recorre el JSON-LD ya parseado y llama a `visit` en cada objeto. */
function walkJson(node, visit) {
  if (Array.isArray(node)) {
    for (const item of node) walkJson(item, visit);
    return;
  }
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const value of Object.values(node)) walkJson(value, visit);
}

/** Los nodos de todos los bloques JSON-LD de una ruta, ya parseados. */
function parsedJsonLd(route, html) {
  const parsed = [];
  for (const block of jsonLdBlocks(html)) {
    try {
      parsed.push(JSON.parse(block));
    } catch {
      fail(`${route} tiene un bloque application/ld+json que no parsea`);
    }
  }
  return parsed;
}

/** Tipos de schema.org que declaran una reseña o una calificación. */
const RATING_TYPES = new Set([
  "Review",
  "UserReview",
  "CriticReview",
  "Rating",
  "AggregateRating",
]);

/** Propiedades que declaran una reseña o una calificación desde el nodo padre. */
const RATING_PROPERTIES = [
  "review",
  "reviews",
  "aggregateRating",
  "reviewRating",
  "ratingValue",
  "reviewCount",
  "ratingCount",
];

function checkNoReviewMarkup(routes) {
  let scanned = 0;

  for (const route of routes) {
    const file = htmlFor(route);
    if (!existsSync(resolve(file))) continue;

    const html = read(file);
    scanned += 1;

    for (const data of parsedJsonLd(route, html)) {
      walkJson(data, (node) => {
        const type = node["@type"];
        const types = Array.isArray(type) ? type : [type];
        for (const candidate of types) {
          if (RATING_TYPES.has(candidate)) {
            fail(`${route} emite un nodo JSON-LD de tipo ${candidate}`);
          }
        }
        for (const property of RATING_PROPERTIES) {
          if (property in node) {
            fail(`${route} emite la propiedad JSON-LD "${property}"`);
          }
        }
      });
    }
  }

  // La fuente tampoco puede volver a construirlos: el marcado que se retiró
  // salía de un cliente de la API de Google, y sin importador no hay camino.
  const source = read("src/components/structured-data.tsx");
  if (source.includes("@/lib/google-reviews")) {
    fail("structured-data.tsx volvió a importar el cliente de reseñas de Google");
  }
  for (const property of RATING_PROPERTIES) {
    if (new RegExp(`\\b${property}\\s*:`).test(source)) {
      fail(`structured-data.tsx declara la propiedad de marcado "${property}"`);
    }
  }

  const testimonials = read("src/content/testimonials.ts");
  for (const field of ["rating", "ratingValue", "reviewCount", "estrellas", "calificacion"]) {
    if (new RegExp(`\\b${field}\\s*[?:]`).test(testimonials)) {
      fail(`testimonials.ts declara el campo "${field}": los testimonios no se califican`);
    }
  }

  notes.push(`${scanned} rutas revisadas sin marcado de reseña ni calificación`);
}

// --------------------------------------------------------------------------
// 3 bis. AUD-02 a AUD-06, salud de los nodos del grafo
//
// Las cinco reglas que la auditoría encontró rotas. Se miden sobre el JSON-LD
// del HTML prerenderizado, que es lo que lee el rastreador.
// --------------------------------------------------------------------------

/** Ficha de Google del consultorio, por CID. Identifica el negocio real. */
const OFFICE_MAPS_URL = "https://maps.google.com/?cid=10881730410836747834";

/** Los cuatro perfiles verificados que tiene que declarar `sameAs`. */
const EXPECTED_SAME_AS = [
  "instagram.com",
  "doctoralia.pe",
  "maps.google.com/?cid=",
  "facebook.com",
];

/** Propiedades que declaran especialidad médica en cualquier nodo. */
const SPECIALTY_PROPERTIES = ["medicalSpecialty", "specialty"];

function checkGraphNodes(routes) {
  const graph = siteGraph(read(htmlFor("/")));
  if (!graph) {
    fail("no se pudo leer el grafo JSON-LD de la portada");
    return;
  }

  const nodes = graph["@graph"] ?? [];
  const physician = nodes.find((node) => node["@type"] === "Physician");

  if (!physician) {
    fail("el grafo raíz no declara el nodo Physician");
    return;
  }

  // --- AUD-02, logo como ImageObject con dimensiones ----------------------
  const logo = physician.logo;
  if (!logo || typeof logo !== "object") {
    fail("el logo del Physician es una cadena plana: Google pide un ImageObject con dimensiones");
  } else {
    if (logo["@type"] !== "ImageObject") {
      fail(`el logo del Physician declara @type ${logo["@type"]}, debe ser ImageObject`);
    }
    if (typeof logo.url !== "string" || !logo.url.startsWith("http")) {
      fail("el logo del Physician no declara una URL absoluta");
    }
    for (const dimension of ["width", "height"]) {
      if (typeof logo[dimension] !== "number" || logo[dimension] <= 0) {
        fail(`el logo del Physician no declara ${dimension} como número`);
      }
    }
  }

  // --- AUD-03, sameAs con los cuatro perfiles -----------------------------
  const sameAs = Array.isArray(physician.sameAs) ? physician.sameAs : [];
  for (const profile of EXPECTED_SAME_AS) {
    if (!sameAs.some((url) => String(url).includes(profile))) {
      fail(`sameAs del Physician no declara el perfil de ${profile}`);
    }
  }

  // --- AUD-04 y AUD-05, sedes ---------------------------------------------
  const locationNodes = nodes.filter((node) => String(node["@id"] ?? "").includes("#sede-"));
  const types = new Set(locationNodes.map((node) => node["@type"]));
  if (types.size !== 1) {
    fail(`las sedes emiten ${types.size} tipos distintos: ${[...types].join(", ")}`);
  }

  const office = locationNodes.find((node) =>
    String(node["@id"] ?? "").endsWith("#sede-consultorio-privado")
  );
  if (!office) {
    fail("el grafo raíz no declara la sede del consultorio privado");
  } else if (office.hasMap !== OFFICE_MAPS_URL) {
    fail(
      `el hasMap del consultorio es ${office.hasMap}, debe ser la URL CID de su ficha de Google`
    );
  }

  // --- AUD-06, especialidades en forma canónica ---------------------------
  // Recorre todas las rutas: `specialty` también sale en /servicios y en las
  // cinco guías de servicio, no solo en el grafo raíz.
  let specialtyNodes = 0;

  for (const route of routes) {
    const file = htmlFor(route);
    if (!existsSync(resolve(file))) continue;

    for (const data of parsedJsonLd(route, read(file))) {
      walkJson(data, (node) => {
        for (const property of SPECIALTY_PROPERTIES) {
          if (!(property in node)) continue;
          const values = Array.isArray(node[property]) ? node[property] : [node[property]];
          specialtyNodes += 1;
          for (const value of values) {
            if (!String(value).startsWith("https://schema.org/")) {
              fail(
                `${route} declara ${property} en forma plana: "${value}". Va la URL de schema.org`
              );
            }
          }
        }
      });
    }
  }

  notes.push(
    `logo ${logo?.width}x${logo?.height}, ${sameAs.length} perfiles en sameAs, ${locationNodes.length} sedes de tipo ${[...types].join("/")}, ${specialtyNodes} nodos con especialidad canónica`
  );
}

// --------------------------------------------------------------------------
// 4. SEO-08, imagen de Open Graph propia por ruta
// --------------------------------------------------------------------------

function ogImageArtifact(url) {
  // `/servicios/hernia-discal/opengraph-image?abc` -> el `.body` del build.
  const path = url.split("?")[0].replace(/^https?:\/\/[^/]+/, "");
  return `${APP_DIR}${path}.body`;
}

/** Lo que pide el issue #14 para la vista previa de WhatsApp. */
const OG_MAX_BYTES = 200 * 1024;

function checkOgImages(routes) {
  const seen = new Map();
  let heaviest = 0;

  for (const route of routes) {
    const file = htmlFor(route);
    if (!existsSync(resolve(file))) {
      fail(`no existe ${file}. Corre \`npm run build\` antes de la puerta.`);
      continue;
    }

    const html = read(file);
    const image = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];

    if (!image) {
      fail(`${route} no declara og:image`);
      continue;
    }

    if (image.includes("og-dr-angulo.jpg")) {
      fail(`${route} sigue usando la imagen compartida og-dr-angulo.jpg`);
    }

    const previous = seen.get(image);
    if (previous) {
      fail(`${route} comparte su og:image con ${previous}`);
    } else {
      seen.set(image, route);
    }

    const artifact = ogImageArtifact(image);
    if (!existsSync(resolve(artifact))) {
      fail(`la imagen de ${route} no está prerenderizada: falta ${artifact}`);
    } else {
      /* Peso servido, no peso del JPEG en `public/og/`: lo que mide acá es lo
         que baja el rastreador de WhatsApp. Si alguien vuelve a servir el PNG
         de Satori, este número lo delata. */
      const { size: bytes } = statSync(resolve(artifact));
      heaviest = Math.max(heaviest, bytes);

      if (bytes > OG_MAX_BYTES) {
        fail(
          `la imagen de ${route} pesa ${(bytes / 1024).toFixed(0)} KB y el techo del issue #14 son ${OG_MAX_BYTES / 1024} KB. Corre \`npm run og:build\`.`
        );
      }
    }

    if (!/<meta property="og:image:type" content="image\/jpeg"/.test(html)) {
      fail(`${route} no declara su og:image como image/jpeg`);
    }

    if (!/<meta property="og:image:alt" content="[^"]+"/.test(html)) {
      fail(`${route} declara og:image sin texto alternativo`);
    }
  }

  notes.push(
    `${seen.size} rutas con imagen de Open Graph propia, la más pesada de ${(heaviest / 1024).toFixed(0)} KB`
  );
}

// --------------------------------------------------------------------------
// 5. SEO-08, largo del title y de la description
// --------------------------------------------------------------------------

/** El HTML escapa antes de servir; contar `&amp;` como cinco caracteres infla
 *  el número y no es lo que cuenta Google. */
function unescapeHtml(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .replace(/&amp;/g, "&");
}

function trim(text) {
  return text.length > 70 ? `${text.slice(0, 70)}…` : text;
}

function checkMetadataLength(routes) {
  let measured = 0;
  let longestTitle = { route: null, length: 0, text: "" };
  let longestDescription = { route: null, length: 0, text: "" };

  for (const route of routes) {
    const file = htmlFor(route);
    if (!existsSync(resolve(file))) continue;

    const html = read(file);
    measured += 1;

    const rawTitle = /<title>([^<]*)<\/title>/.exec(html)?.[1];
    if (rawTitle === undefined) {
      fail(`${route} no declara <title>`);
    } else {
      const title = unescapeHtml(rawTitle).trim();
      if (title === "") {
        fail(`${route} tiene el <title> vacío`);
      } else {
        if (title.length > TITLE_MAX) {
          fail(`${route} tiene un title de ${title.length} caracteres, el límite es ${TITLE_MAX}: ${trim(title)}`);
        }
        if (title.length > longestTitle.length) {
          longestTitle = { route, length: title.length, text: title };
        }
      }
    }

    const rawDescription = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];
    if (rawDescription === undefined) {
      fail(`${route} no declara meta description`);
      continue;
    }

    const description = unescapeHtml(rawDescription).trim();
    if (description === "") {
      fail(`${route} tiene la meta description vacía`);
      continue;
    }
    if (description.length > DESCRIPTION_MAX) {
      fail(
        `${route} tiene una description de ${description.length} caracteres, el límite es ${DESCRIPTION_MAX}: ${trim(description)}`
      );
    }
    if (description.length > longestDescription.length) {
      longestDescription = { route, length: description.length, text: description };
    }
  }

  notes.push(`${measured} rutas con title y description medidos`);
  if (longestTitle.route) {
    notes.push(
      `title más largo: ${longestTitle.length}/${TITLE_MAX} en ${longestTitle.route}, ${trim(longestTitle.text)}`
    );
  }
  if (longestDescription.route) {
    notes.push(
      `description más larga: ${longestDescription.length}/${DESCRIPTION_MAX} en ${longestDescription.route}, ${trim(longestDescription.text)}`
    );
  }
}

// --------------------------------------------------------------------------
// 6. SEO-10, /llms.txt
// --------------------------------------------------------------------------

function checkLlmsTxt() {
  if (!existsSync(resolve(LLMS))) {
    fail(`no existe ${LLMS}. Corre \`npm run build\` antes de la puerta.`);
    return;
  }

  const body = read(LLMS);

  for (const section of LLMS_SECTIONS) {
    if (!body.includes(section)) fail(`/llms.txt no trae la sección "${section}"`);
  }

  for (const marker of ["undefined", "NaN", "[object Object]"]) {
    if (body.includes(marker)) fail(`/llms.txt filtró un "${marker}" desde los datos`);
  }

  if (!/CMP\s*\d{4,}/.test(body) || !/RNE\s*\d{4,}/.test(body)) {
    fail("/llms.txt no declara las credenciales del doctor");
  }

  const meta = read(`${APP_DIR}/llms.txt.meta`);
  if (!meta.includes("text/plain")) {
    fail("/llms.txt no se sirve como text/plain");
  }

  notes.push(`/llms.txt con ${body.split("\n").length} líneas`);
}

// --------------------------------------------------------------------------
// 7. Sitemap con hoja de estilo, y limpieza de SEO-11
// --------------------------------------------------------------------------

function checkSitemap(sitemap) {
  const total = [...sitemap.matchAll(/<loc>/g)].length;
  if (total !== SITEMAP_TOTAL) {
    fail(`el sitemap tiene ${total} URLs, deben ser ${SITEMAP_TOTAL}`);
  }

  // AUD-10: las 22 URLs declaran fecha de modificación y ninguna declara los
  // dos campos que Google ignora desde 2020.
  const withLastmod = [...sitemap.matchAll(/<lastmod>/g)].length;
  if (withLastmod !== total) {
    const missing = total - withLastmod;
    fail(`${missing} de las ${total} URLs del sitemap no declaran <lastmod>`);
  }
  for (const field of ["changefreq", "priority"]) {
    if (sitemap.includes(`<${field}>`)) {
      fail(`el sitemap declara <${field}>: Google lo ignora desde 2020 y salió en AUD-10`);
    }
  }

  const stylesheet = /<\?xml-stylesheet[^>]*href="([^"]+)"[^>]*\?>/.exec(sitemap);
  if (!stylesheet) {
    fail("el sitemap servido no incluye la instrucción xml-stylesheet");
  } else {
    const href = stylesheet[1].replace(/^\//, "");
    if (!existsSync(resolve("public", href))) {
      fail(`el sitemap apunta a ${stylesheet[1]} y ese archivo no está en public/`);
    }
    // La instrucción va antes del `urlset`: después no la aplica ningún
    // navegador y el XML dejaría de validar.
    if (sitemap.indexOf("<?xml-stylesheet") > sitemap.indexOf("<urlset")) {
      fail("la instrucción xml-stylesheet va después de <urlset>");
    }
  }

  const meta = read(`${APP_DIR}/sitemap.xml.meta`);
  if (!meta.includes("application/xml")) {
    fail("/sitemap.xml dejó de servirse como application/xml");
  }

  if (!existsSync(resolve(STYLESHEET))) {
    fail(`falta ${STYLESHEET}`);
  } else {
    const xsl = read(STYLESHEET);
    if (!xsl.includes("xsl:stylesheet")) fail(`${STYLESHEET} no es una hoja XSL`);
    if (!xsl.includes('scope="col"')) {
      fail(`${STYLESHEET} tiene una tabla sin encabezados de columna asociados`);
    }
    if (!/<caption>/.test(xsl)) fail(`${STYLESHEET} tiene una tabla sin caption`);
    // La hoja es lo que un humano ve. Si conserva columnas de campos que el
    // sitemap ya no emite, la tabla se lee con dos columnas vacías.
    for (const field of ["changefreq", "priority"]) {
      if (xsl.includes(`s:${field}`)) {
        fail(`${STYLESHEET} sigue mostrando la columna de ${field}, que el sitemap ya no emite`);
      }
    }
    // Cabeceras y celdas tienen que seguir contando lo mismo.
    const columns = [...xsl.matchAll(/scope="col"/g)].length;
    const cells = [...xsl.matchAll(/<td\b/g)].length;
    if (columns !== cells) {
      fail(`${STYLESHEET} declara ${columns} columnas y ${cells} celdas por fila`);
    }
  }
}

function checkDeletedAsset() {
  if (existsSync(resolve("public", DELETED_ASSET))) {
    fail(`${DELETED_ASSET} volvió a public/: SEO-11 lo sacó del repo`);
  }

  const staticDir = ".next/static/media";
  if (existsSync(resolve(staticDir))) {
    const leaked = readdirSync(resolve(staticDir)).filter((file) =>
      file.startsWith(DELETED_ASSET.replace(".png", ""))
    );
    if (leaked.length > 0) {
      fail(`${DELETED_ASSET} sigue saliendo en el build: ${leaked.join(", ")}`);
    }
  }
}

// --------------------------------------------------------------------------

function main() {
  if (!existsSync(resolve(APP_DIR))) {
    console.error(`check-seo: no existe ${APP_DIR}. Corre \`npm run build\` antes de la puerta.`);
    process.exit(1);
  }

  if (!existsSync(resolve(SITEMAP))) {
    console.error(`check-seo: no existe ${SITEMAP}. Corre \`npm run build\` antes de la puerta.`);
    process.exit(1);
  }

  const sitemap = read(SITEMAP);
  const routes = [...routesFromSitemap(sitemap), ...NOINDEX_ROUTES];

  checkBreadcrumbs(routes);
  checkCredentialsAndHours();
  checkNoReviewMarkup(routes);
  checkGraphNodes(routes);
  checkOgImages(routes);
  checkMetadataLength(routes);
  checkLlmsTxt();
  checkSitemap(sitemap);
  checkDeletedAsset();

  console.log("");
  console.log("Puerta de schema, metadata y limpieza");
  console.log("");
  console.log(`  ${routes.length} rutas revisadas`);
  for (const note of notes) console.log(`  ${note}`);

  if (failures.length > 0) {
    console.log("");
    for (const failure of failures) console.log(`          · ${failure}`);
    console.log("");
    console.log(`  ${failures.length} fallas.`);
    console.log("");
    process.exit(1);
  }

  console.log("");
  console.log("  Sin fallas.");
  console.log("");
}

main();
