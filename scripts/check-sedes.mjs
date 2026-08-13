#!/usr/bin/env node
/**
 * Puerta ejecutable de las páginas de sede.
 *
 *   node scripts/check-sedes.mjs                       (manifiesto completo)
 *   node scripts/check-sedes.mjs clinica-ricardo-palma (solo esa sede)
 *
 * Lee el HTML que `npm run build` deja prerenderizado en `.next/server/app/`.
 * Si el archivo esperado no existe, falla: una puerta que aprueba por ausencia
 * de evidencia es peor que no tener puerta.
 *
 * La comprobación central es la regla de negocio que documenta
 * `src/content/locations.ts`: el chat del doctor agenda SOLO el consultorio
 * privado. Las citas de Ricardo Palma, Sanna y Tezza las maneja cada clínica.
 * Ofrecer ese canal en una página de clínica manda al paciente a reservar
 * donde no se puede reservar.
 *
 * Es un archivo aparte de `scripts/check-content.mjs` a propósito: mide
 * criterios distintos y las dos puertas tienen que poder correr sueltas. Las
 * utilidades de HTML se copian tal cual en vez de extraerse a un módulo
 * compartido, porque acoplar el gate de la fase 8 al de la fase 9 no compra
 * nada.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const APP_DIR = ".next/server/app";
const SITEMAP = `${APP_DIR}/sitemap.xml.body`;
const HUB = `${APP_DIR}/sedes.html`;
const AGENDAR = `${APP_DIR}/agendar.html`;
const GLOBALS_CSS = "src/app/globals.css";
const LOCATIONS = "src/content/locations.ts";
const LOCATION_PAGES = "src/content/location-pages";

/**
 * Marcador de la región del cuerpo de la sede, con el `=""` pegado.
 *
 * El `=""` importa: el HTML de Next también trae el árbol serializado del
 * payload RSC, donde el mismo nombre de atributo aparece con comillas
 * escapadas. Sin el `=""` la puerta mediría la región equivocada.
 */
const SEDE_BODY = 'data-sede-body=""';

/** Literal del chat del doctor. Lo emite el footer y el botón flotante en
 *  todas las páginas del sitio, por eso solo se cuenta dentro de la región. */
const DOCTOR_CHAT = "wa.me";

/** Sufijo que la plantilla del layout raíz agrega a todo `<title>`. */
const TITLE_SUFFIX = " | Dr. Juan Angulo";

/** Las cuatro guías del silo clínico de la fase 8. */
const SERVICE_SLUGS = [
  "hernia-discal",
  "estenosis-espinal",
  "escoliosis-y-deformidades",
  "ortopedia-infantil",
];

/** URLs totales del sitemap, y el número con el que cierra la fase 8: las 21
 *  con las que cerró la fase 9, o sea las 16 de v1.0 más el hub de sedes y las
 *  cuatro páginas de sede, más la página de cirugía mínimamente invasiva del
 *  plan 08-16 y los dos posts nuevos, artrosis del plan 08-12 y lumbalgia del
 *  08-13, menos los dos posts que el plan 08-14 apagó con 301 hacia la guía
 *  que los absorbió. 21 + 1 + 2 − 2 = 22. */
const SITEMAP_TOTAL = 22;

/**
 * Expectativas por sede, hardcodeadas a propósito. Una puerta que deriva sus
 * expectativas del mismo archivo que verifica no verifica nada. El orden es el
 * mismo de `locationPages` y el de `locations`.
 */
const MANIFEST = [
  {
    slug: "consultorio-privado",
    kind: "consultorio",
    h1: "Consultorio de Surco: la consulta sin intermediarios",
    title: "Consultorio de traumatología y columna en Surco, Lima",
    streetAddress: "Av. El Derby 254, piso 24, oficina 2403",
    schemaType: "MedicalBusiness",
    latitude: -12.0977043,
    longitude: -76.9729404,
    channels: ["wa.me/51964305682"],
  },
  {
    slug: "clinica-ricardo-palma",
    kind: "clinica",
    h1: "Atención de columna en la Clínica Ricardo Palma",
    title: "Traumatólogo y cirujano de columna en Clínica Ricardo Palma",
    streetAddress: "Av. Javier Prado Este 1066",
    schemaType: "MedicalClinic",
    latitude: -12.090602,
    longitude: -77.018276,
    channels: ["tel:+5112242224", "https://www.crp.com.pe/agenda-tu-cita/"],
  },
  {
    slug: "sanna-la-molina",
    kind: "clinica",
    h1: "Traumatólogo y cirujano de columna en Clínica Sanna, sede La Molina",
    title: "Traumatólogo y cirujano de columna en Clínica Sanna, sede La Molina",
    streetAddress: "Av. Raúl Ferrero 1256",
    schemaType: "MedicalClinic",
    latitude: -12.0902268,
    longitude: -76.9505892,
    channels: ["tel:+5116355000", "https://agendamiento.sanna.pe/"],
  },
  {
    slug: "clinica-tezza",
    kind: "clinica",
    h1: "Ortopedia infantil en la Clínica Padre Luis Tezza",
    title: "Traumatólogo y cirujano de columna en Clínica Padre Luis Tezza",
    streetAddress: "Av. El Polo 570",
    schemaType: "MedicalClinic",
    latitude: -12.1032942,
    longitude: -76.9718807,
    channels: ["tel:+5116105050", "https://clinicatezza.com.pe/"],
  },
];

// --------------------------------------------------------------------------
// Utilidades de HTML, copiadas de `scripts/check-content.mjs` sin cambios.
// --------------------------------------------------------------------------

/**
 * Rango del elemento cuya etiqueta de apertura contiene el índice dado.
 * Cuenta anidamiento de la misma etiqueta, así un `div` dentro de otro no
 * corta el recorte antes de tiempo.
 */
function elementRange(html, attrIndex) {
  const open = html.lastIndexOf("<", attrIndex);
  if (open === -1) return null;
  const tag = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(open, open + 40));
  if (!tag) return null;
  const openTagEnd = html.indexOf(">", attrIndex);
  if (openTagEnd === -1) return null;
  if (html[openTagEnd - 1] === "/") return [open, openTagEnd + 1];

  const re = new RegExp(`<(/?)${tag[1]}\\b`, "g");
  re.lastIndex = openTagEnd + 1;
  let depth = 1;
  let match;
  while ((match = re.exec(html))) {
    if (match[1] === "/") {
      depth -= 1;
      if (depth === 0) return [open, html.indexOf(">", match.index) + 1];
    } else {
      depth += 1;
    }
  }
  return null;
}

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&middot;": "·",
};

function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, (entity) => ENTITIES[entity] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headings(html) {
  return [...html.matchAll(/<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>/g)].map((m) => ({
    level: Number(m[1][1]),
    attrs: m[2],
    text: toText(m[3]),
    index: m.index,
  }));
}

function occurrences(haystack, needle) {
  let count = 0;
  let at = -1;
  while ((at = haystack.indexOf(needle, at + 1)) !== -1) count += 1;
  return count;
}

// --------------------------------------------------------------------------
// Comprobaciones por sede
// --------------------------------------------------------------------------

function checkSede(entry) {
  const route = `/sedes/${entry.slug}`;
  const file = resolve(`${APP_DIR}${route}.html`);
  const failures = [];
  const fail = (message) => failures.push(message);

  // 1. el archivo existe
  if (!existsSync(file)) {
    return {
      route,
      failures: [
        `no existe ${APP_DIR}${route}.html. Corre \`npm run build\` antes de la puerta.`,
      ],
    };
  }

  const html = readFileSync(file, "utf8");

  // 2. recorte de la región del cuerpo de la sede
  const marker = html.indexOf(SEDE_BODY);
  if (marker === -1) {
    return {
      route,
      failures: [`falta el atributo \`${SEDE_BODY}\` que delimita el cuerpo`],
    };
  }
  const range = elementRange(html, marker);
  if (!range) {
    return {
      route,
      failures: [`el elemento con \`${SEDE_BODY}\` no cierra`],
    };
  }
  const body = html.slice(range[0], range[1]);

  // 3. regla de negocio: quién agenda en esta sede
  const chatLinks = occurrences(body, DOCTOR_CHAT);
  if (entry.kind === "clinica" && chatLinks !== 0) {
    fail(
      `el cuerpo de ${entry.slug} ofrece ${chatLinks} enlace(s) al chat del doctor. ` +
        `La cita en esa sede la gestiona la clínica: ese canal manda al paciente ` +
        `a reservar donde no se puede reservar.`
    );
  }
  if (entry.kind === "consultorio" && chatLinks < 1) {
    fail(
      `el cuerpo de ${entry.slug} no ofrece el chat del doctor. Es la única sede ` +
        `cuya agenda maneja él, y sin ese canal el paciente se queda sin la vía ` +
        `por la que sí puede reservar.`
    );
  }

  // 4. los canales oficiales de la sede están presentes
  for (const channel of entry.channels) {
    if (!body.includes(channel)) {
      fail(`el cuerpo no muestra el canal oficial \`${channel}\``);
    }
  }

  // 5. exactamente un h1, con el texto esperado
  const bodyHeadings = headings(body);
  const h1s = bodyHeadings.filter((h) => h.level === 1);
  if (h1s.length !== 1) {
    fail(`hay ${h1s.length} elementos h1, debe haber exactamente uno`);
  } else if (h1s[0].text !== entry.h1) {
    fail(`el h1 dice "${h1s[0].text}" y debería decir "${entry.h1}"`);
  }

  // 6. la secuencia de encabezados no salta niveles ni empieza por h2
  let previous = 0;
  for (const heading of bodyHeadings) {
    if (previous === 0 && heading.level !== 1) {
      fail(`el primer encabezado es un h${heading.level}, debe ser el h1`);
      break;
    }
    if (previous !== 0 && heading.level > previous + 1) {
      fail(
        `salto de h${previous} a h${heading.level} en "${heading.text}": la jerarquía no puede saltar niveles`
      );
      break;
    }
    previous = heading.level;
  }

  // 7. el título del documento
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  if (!titleMatch) {
    fail("el documento no declara <title>");
  } else {
    const expected = `${entry.title}${TITLE_SUFFIX}`;
    if (toText(titleMatch[1]) !== expected) {
      fail(`el title dice "${toText(titleMatch[1])}" y debería decir "${expected}"`);
    }
  }

  // 8. canonical hacia la propia ruta
  const canonical = `rel="canonical" href="https://drangulocolumna.com${route}"`;
  if (!html.includes(canonical)) {
    fail(`falta el canonical hacia ${route}`);
  }

  // 9. la dirección esperada está en el cuerpo
  if (!body.includes(entry.streetAddress)) {
    fail(`el cuerpo no muestra la dirección \`${entry.streetAddress}\``);
  }

  // 10. JSON-LD propio de la sede
  const script = html.match(
    /<script id="sede-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/
  );
  if (!script) {
    fail("no se emitió el script `sede-jsonld`");
  } else {
    let graph = null;
    try {
      graph = JSON.parse(script[1].replace(/\\u003c/g, "<"))["@graph"];
    } catch (error) {
      fail(`el JSON-LD de la sede no parsea: ${error.message}`);
    }
    if (Array.isArray(graph)) {
      const node = graph.find((item) => item["@type"] === entry.schemaType);
      if (!node) {
        fail(`el grafo de la sede no trae ningún nodo \`${entry.schemaType}\``);
      } else {
        if (node.address?.streetAddress !== entry.streetAddress) {
          fail(
            `el nodo declara la dirección "${node.address?.streetAddress}" y debería declarar "${entry.streetAddress}"`
          );
        }
        if (node.geo?.latitude !== entry.latitude) {
          fail(`el nodo declara la latitud ${node.geo?.latitude}, se esperaba ${entry.latitude}`);
        }
        if (node.geo?.longitude !== entry.longitude) {
          fail(`el nodo declara la longitud ${node.geo?.longitude}, se esperaba ${entry.longitude}`);
        }
        if (!Array.isArray(node.openingHoursSpecification) || node.openingHoursSpecification.length === 0) {
          fail("el nodo de la sede no declara `openingHoursSpecification`");
        }
      }
    }
  }

  // 11. vuelta a /agendar con su ancla
  if (!body.includes(`href="/agendar#${entry.slug}"`)) {
    fail(`el cuerpo no vuelve a /agendar#${entry.slug}`);
  }

  // 12. enlace a las cuatro guías de servicio
  for (const service of SERVICE_SLUGS) {
    if (!body.includes(`href="/servicios/${service}"`)) {
      fail(`el cuerpo no enlaza a la guía /servicios/${service}`);
    }
  }

  return { route, failures };
}

// --------------------------------------------------------------------------
// Comprobaciones globales
// --------------------------------------------------------------------------

function checkGlobals(selected, isFullRun) {
  const failures = [];

  // Ninguna sede de `locations.ts` puede quedarse sin página. Si mañana entra
  // una quinta, la puerta falla hasta que alguien le escriba la suya, en vez
  // de aprobar en silencio una sede sin superficie propia.
  if (isFullRun && existsSync(resolve(LOCATIONS))) {
    const source = readFileSync(resolve(LOCATIONS), "utf8");
    const declared = [...source.matchAll(/^\s+slug: "/gm)].length;
    if (declared !== MANIFEST.length) {
      failures.push(
        `${LOCATIONS} declara ${declared} sedes y el manifiesto cubre ${MANIFEST.length}: hay una sede sin página de sede o una entrada del manifiesto de más`
      );
    }
  }

  // /agendar enlaza al hub, a cada sede y trae el destino de cada ancla
  if (!existsSync(resolve(AGENDAR))) {
    failures.push(`no existe ${AGENDAR}. Corre \`npm run build\` antes de la puerta.`);
  } else {
    const agendar = readFileSync(resolve(AGENDAR), "utf8");
    if (!agendar.includes('href="/sedes"')) {
      failures.push("/agendar no enlaza al hub /sedes");
    }
    for (const entry of selected) {
      if (!agendar.includes(`href="/sedes/${entry.slug}"`)) {
        failures.push(`/agendar no enlaza a /sedes/${entry.slug}`);
      }
      if (!agendar.includes(`id="${entry.slug}"`)) {
        failures.push(`/agendar no trae el destino del ancla #${entry.slug}`);
      }
    }
  }

  // el hub existe, tiene un solo h1 y enlaza a cada sede
  if (!existsSync(resolve(HUB))) {
    failures.push(`no existe ${HUB}. Corre \`npm run build\` antes de la puerta.`);
  } else {
    const hub = readFileSync(resolve(HUB), "utf8");
    const h1s = headings(hub).filter((h) => h.level === 1);
    if (h1s.length !== 1) {
      failures.push(`el hub tiene ${h1s.length} elementos h1, debe tener exactamente uno`);
    }
    for (const entry of selected) {
      if (!hub.includes(`href="/sedes/${entry.slug}"`)) {
        failures.push(`el hub no enlaza a /sedes/${entry.slug}`);
      }
    }
  }

  // el resaltado por ancla es CSS plano y no depende de JavaScript
  if (!existsSync(resolve(GLOBALS_CSS))) {
    failures.push(`no existe ${GLOBALS_CSS}`);
  } else {
    const css = readFileSync(resolve(GLOBALS_CSS), "utf8");
    if (!/\[data-location-card\]\s*:target/.test(css)) {
      failures.push(
        `${GLOBALS_CSS} no declara la regla \`:target\` sobre \`data-location-card\`: el resaltado por ancla quedaría sin señal visible`
      );
    }
  }

  // cada slug del manifiesto existe en `locations.ts` y tiene su módulo
  // editorial propio. Desde el plan 08-17 el contenido de las sedes vive en un
  // módulo por sede dentro de `src/content/location-pages/`, así que la puerta
  // busca el archivo del slug en vez de una mención dentro de un archivo único.
  if (!existsSync(resolve(LOCATIONS))) {
    failures.push(`no existe ${LOCATIONS}`);
  } else {
    const source = readFileSync(resolve(LOCATIONS), "utf8");
    for (const entry of selected) {
      if (!source.includes(entry.slug)) {
        failures.push(`${LOCATIONS} no declara la sede \`${entry.slug}\``);
      }
    }
  }
  for (const entry of selected) {
    const pageModule = `${LOCATION_PAGES}/${entry.slug}.ts`;
    if (!existsSync(resolve(pageModule))) {
      failures.push(`no existe ${pageModule}: la sede no tiene módulo editorial`);
      continue;
    }
    if (!readFileSync(resolve(pageModule), "utf8").includes(`slug: "${entry.slug}"`)) {
      failures.push(`${pageModule} no declara la sede \`${entry.slug}\``);
    }
  }
  const registry = `${LOCATION_PAGES}/index.ts`;
  if (!existsSync(resolve(registry))) {
    failures.push(`no existe ${registry}: el registro de sedes desapareció`);
  }

  // el sitemap declara el hub y cada sede
  if (!existsSync(resolve(SITEMAP))) {
    failures.push(`no existe ${SITEMAP}. Corre \`npm run build\` antes de la puerta.`);
  } else {
    const sitemap = readFileSync(resolve(SITEMAP), "utf8");
    if (!sitemap.includes("https://drangulocolumna.com/sedes<")) {
      failures.push("el sitemap no declara el hub /sedes");
    }
    for (const entry of selected) {
      if (!sitemap.includes(`https://drangulocolumna.com/sedes/${entry.slug}<`)) {
        failures.push(`el sitemap no declara /sedes/${entry.slug}`);
      }
    }
    if (isFullRun) {
      const total = occurrences(sitemap, "<loc>");
      if (total !== SITEMAP_TOTAL) {
        failures.push(`el sitemap tiene ${total} URLs, deben ser ${SITEMAP_TOTAL}`);
      }
    }
  }

  return failures;
}

// --------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const isFullRun = args.length === 0;

  if (!existsSync(resolve(APP_DIR))) {
    console.error(
      `check-sedes: no existe ${APP_DIR}. Corre \`npm run build\` antes de la puerta.`
    );
    process.exit(1);
  }

  const selected = isFullRun
    ? MANIFEST
    : args.map((slug) => {
          const entry = MANIFEST.find((e) => e.slug === slug);
          if (!entry) {
            console.error(`check-sedes: la sede ${slug} no está en el manifiesto.`);
            process.exit(1);
          }
          return entry;
        });

  const results = selected.map(checkSede);
  const globalFailures = checkGlobals(selected, isFullRun);

  console.log("");
  console.log("Puerta de las páginas de sede");
  console.log("");
  for (const result of results) {
    const state = result.failures.length === 0 ? "PASA" : "FALLA";
    console.log(`  ${state}  ${result.route}`);
    for (const failure of result.failures) console.log(`          · ${failure}`);
  }

  if (globalFailures.length > 0) {
    console.log("");
    console.log("  Comprobaciones globales");
    for (const failure of globalFailures) console.log(`          · ${failure}`);
  }

  const total =
    results.reduce((sum, r) => sum + r.failures.length, 0) + globalFailures.length;

  console.log("");
  if (total > 0) {
    console.log(`  ${total} fallas.`);
    console.log("");
    process.exit(1);
  }
  console.log(`  Sin fallas en ${results.length} sede(s).`);
  console.log("");
}

main();
