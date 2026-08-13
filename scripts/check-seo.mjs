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
 * Verifica seis familias:
 *
 *   1. SEO-05  Toda ruta anidada emite `BreadcrumbList` y la portada no.
 *   2. SEO-06  El grafo raíz declara CMP, RNE y el horario de las cuatro sedes.
 *   3. SEO-07  Ninguna calificación escrita a mano en el código fuente.
 *   4. SEO-08  Cada ruta declara su propia imagen de Open Graph y esa imagen
 *              existe en el build.
 *   5. SEO-10  `/llms.txt` se prerenderiza con contenido real.
 *   6. SEO-11  `dr-angulo-portrait.png` no está ni en el repo ni en el build.
 *              Más la hoja de estilo del sitemap, pedido de Juan del 2026-08-10.
 *
 * Lo que esta puerta NO mira, a propósito: el largo de los `title` y de las
 * `description`. Juan reescribe esos textos él mismo (decisión del 2026-08-10)
 * y una puerta que naciera roja en 17 rutas sería ruido, no una puerta. Cuando
 * termine su pasada, ese control se suma en otra fase.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const APP_DIR = ".next/server/app";
const SITEMAP = `${APP_DIR}/sitemap.xml.body`;
const LLMS = `${APP_DIR}/llms.txt.body`;
const STYLESHEET = "public/sitemap.xsl";
/** Las 21 con las que cerró la fase 9 más la página de cirugía mínimamente
 *  invasiva del plan 08-16 y el post de artrosis del plan 08-12. */
const SITEMAP_TOTAL = 23;

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
// 3. SEO-07, ninguna calificación escrita a mano
//
// La regla del criterio: nada que no sea verificable aparece marcado. El
// `AggregateRating` sale de la ficha de Google en vivo o no sale. Esta puerta
// no exige que esté presente en el build (sin `GOOGLE_PLACES_API_KEY`, o con
// la clave restringida por IP, la API responde 403 y el marcado no se emite,
// que es justo el comportamiento correcto): exige que el código no pueda
// producirlo desde una cifra escrita a mano.
// --------------------------------------------------------------------------

function checkNoHandwrittenRatings() {
  const source = read("src/components/structured-data.tsx");

  for (const match of source.matchAll(/ratingValue:\s*([^,\n]+)/g)) {
    const value = match[1].trim();
    if (/^\d/.test(value)) {
      fail(`structured-data.tsx escribe una calificación a mano: ratingValue ${value}`);
    }
  }

  for (const match of source.matchAll(/reviewCount:\s*([^,\n]+)/g)) {
    const value = match[1].trim();
    if (/^\d/.test(value)) {
      fail(`structured-data.tsx escribe un conteo de reseñas a mano: reviewCount ${value}`);
    }
  }

  if (!source.includes("GoogleReviewsData")) {
    fail("structured-data.tsx ya no tipa las reseñas contra la ficha de Google");
  }

  const testimonials = read("src/content/testimonials.ts");
  for (const field of ["rating", "ratingValue", "reviewCount", "estrellas", "calificacion"]) {
    if (new RegExp(`\\b${field}\\s*[?:]`).test(testimonials)) {
      fail(`testimonials.ts declara el campo "${field}": los testimonios no se califican`);
    }
  }
}

// --------------------------------------------------------------------------
// 4. SEO-08, imagen de Open Graph propia por ruta
// --------------------------------------------------------------------------

function ogImageArtifact(url) {
  // `/servicios/hernia-discal/opengraph-image?abc` -> el `.body` del build.
  const path = url.split("?")[0].replace(/^https?:\/\/[^/]+/, "");
  return `${APP_DIR}${path}.body`;
}

function checkOgImages(routes) {
  const seen = new Map();

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
    }

    if (!/<meta property="og:image:alt" content="[^"]+"/.test(html)) {
      fail(`${route} declara og:image sin texto alternativo`);
    }
  }

  notes.push(`${seen.size} rutas con imagen de Open Graph propia`);
}

// --------------------------------------------------------------------------
// 5. SEO-10, /llms.txt
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
// 6. Sitemap con hoja de estilo, y limpieza de SEO-11
// --------------------------------------------------------------------------

function checkSitemap(sitemap) {
  const total = [...sitemap.matchAll(/<loc>/g)].length;
  if (total !== SITEMAP_TOTAL) {
    fail(`el sitemap tiene ${total} URLs, deben ser ${SITEMAP_TOTAL}`);
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
  checkNoHandwrittenRatings();
  checkOgImages(routes);
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
