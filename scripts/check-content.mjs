#!/usr/bin/env node
/**
 * Puerta ejecutable del contenido del silo clínico.
 *
 *   node scripts/check-content.mjs                        (manifiesto completo)
 *   node scripts/check-content.mjs /servicios/hernia-discal   (solo esa ruta)
 *
 * Lee el HTML que `npm run build` deja prerenderizado en `.next/server/app/`.
 * Si el archivo esperado no existe, falla: una puerta que aprueba por ausencia
 * de evidencia es peor que no tener puerta.
 *
 * Verifica ocho familias de criterios sobre cada ruta: extensión del cuerpo,
 * jerarquía de encabezados, tabla de contenidos y anclas, posición del banner
 * de conversión, firma y avisos, enlazado interno, salvaguardas de contenido
 * firmado y coherencia del sitemap y del hub.
 *
 * Además, y siempre: ningún borrador clínico de `src/content/drafts/` llega a
 * producción mientras no tenga aprobación del doctor (AUD-11).
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const APP_DIR = ".next/server/app";
const SITEMAP = `${APP_DIR}/sitemap.xml.body`;
const HUB = `${APP_DIR}/servicios.html`;
const MIN_WORDS = 900;

/** Anclas de sección del hub heredadas de v1.0. La home enlaza a las cuatro. */
const HUB_ANCHORS = ["columna", "traumatologia", "ortopedia-infantil", "procedimientos"];

/**
 * URLs totales del sitemap, y el número con el que cierra la fase 8: las 21
 * con las que cerró la fase 9, o sea las 16 de v1.0 más el hub de sedes y las
 * cuatro páginas de sede, más la página de cirugía mínimamente invasiva del
 * plan 08-16 y los dos posts nuevos, artrosis del plan 08-12 y lumbalgia del
 * 08-13, menos los dos posts que el plan 08-14 apagó con 301 hacia la guía que
 * los absorbió. 21 + 1 + 2 − 2 = 22. Las cuatro rutas de sede ya existían y ya
 * estaban en el sitemap: publicar su cuerpo no mueve este número.
 *
 * La fase 16 de v1.3 suma una URL: /blog/reumatologo-o-traumatologo, que nace
 * de separar /preguntas-frecuentes en sus dos intenciones de búsqueda. Los dos
 * renombres de slug de esa misma fase no mueven el total, porque cambian una
 * URL por otra. 22 + 1 = 23.
 */
const SITEMAP_TOTAL = 23;

/** Banner del primer tercio: palabras previas sobre el total del cuerpo. */
const BANNER_MIN_RATIO = 0.15;
const BANNER_MAX_RATIO = 0.35;

/**
 * Construcciones en primera persona sobre casos concretos (SAFE-05). El
 * contenido se publica firmado por el doctor sin que él lo haya escrito, así
 * que no puede atribuirle vivencias clínicas.
 */
const FIRST_PERSON_CLAIMS = [
  "en mi experiencia",
  "mi experiencia",
  "he operado",
  "he tratado",
  "he visto",
  "mis pacientes",
  "en los casos que atiendo",
  "en mi consulta",
  "en mi practica",
  "yo opero",
  "suelo operar",
];

/**
 * Nombres de campo que el modelo de datos no puede exponer (SAFE-04, SAFE-08).
 * Si el tipo no habilita el hueco, el hueco no se llena por descuido.
 */
const FORBIDDEN_FIELDS = [
  "experiencia",
  "miExperiencia",
  "casos",
  "testimonio",
  "testimonios",
  "garantia",
  "sello",
  "stats",
  "estadisticas",
  "contador",
  "cirugiasRealizadas",
  "tasaExito",
  "successRate",
  "porcentaje",
  "rating",
  "calificacion",
  "precio",
  "price",
  "tarifa",
];

/**
 * Orden canónico de los esqueletos del paquete on-page de v1.2. Las claves son
 * las de `seo-tools/src/phase15/serp-onpage.ts`, copiadas literales. Una ruta
 * que declara formato tiene que emitir esas secciones de nivel 2 con ancla, en
 * ese orden y sin ninguna de más: es lo que impide que un plan de contenido
 * publique el esqueleto de otra página.
 */
const SKELETONS = {
  "guia-clinica": [
    "que-es",
    "sintomas",
    "causas",
    "diagnostico",
    "sin-operar",
    "cirugia",
    "preguntas-frecuentes",
    "cuando-consultar",
  ],
  "ficha-de-sede": [
    "donde-queda",
    "como-llegar",
    "que-se-atiende",
    "horarios",
    "como-agendar",
  ],
};

/** Mapa de enlazado de CTX-12: cada post empuja a su página de servicio. */
const MANIFEST = [
  { route: "/servicios/hernia-discal", type: "service" },
  { route: "/servicios/estenosis-espinal", type: "service" },
  { route: "/servicios/escoliosis-y-deformidades", type: "service" },
  { route: "/servicios/ortopedia-infantil", type: "service" },
  { route: "/servicios/cirugia-minimamente-invasiva", type: "service" },
  {
    route: "/blog/ciatica",
    type: "post",
    linksTo: "/servicios/hernia-discal",
  },
  {
    route: "/blog/cirugia-de-columna",
    type: "post",
    linksTo: "/servicios/hernia-discal",
  },
  // Sin `linksTo`: la matriz de enlazado de v1.2 no le asigna a esta URL una
  // mención inversa hacia una guía, y su salida al silo es el hub /servicios.
  { route: "/blog/artrosis", type: "post" },
  {
    route: "/blog/lumbalgia",
    type: "post",
    linksTo: "/servicios/hernia-discal",
  },
  // Las cuatro sedes, todas con el cuerpo del paquete publicado desde el plan
  // 08-18. El orden es el de `locationPages`.
  {
    route: "/sedes/consultorio-privado",
    type: "sede",
    format: "ficha-de-sede",
  },
  {
    route: "/sedes/clinica-ricardo-palma",
    type: "sede",
    format: "ficha-de-sede",
  },
  { route: "/sedes/sanna-la-molina", type: "sede", format: "ficha-de-sede" },
  { route: "/sedes/clinica-tezza", type: "sede", format: "ficha-de-sede" },
  // Sin `linksTo`: no es un post y la matriz de enlazado de v1.2 no le asigna
  // fila propia, así que no se le inventan salidas. `SITEMAP_TOTAL` no cambia
  // porque la URL ya existía desde v1.0.
  {
    route: "/preguntas-frecuentes",
    type: "guia",
  },
];

// --------------------------------------------------------------------------
// Utilidades de HTML. Sin dependencias: el objetivo es que la puerta corra en
// cualquier máquina con Node y sin instalar nada.
// --------------------------------------------------------------------------

/**
 * Rango del elemento cuya etiqueta de apertura contiene el índice dado.
 * Cuenta anidamiento de la misma etiqueta, así un `article` dentro de otro no
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

/** Elimina del HTML todos los elementos que llevan el atributo indicado. */
function stripElementsWith(html, attribute) {
  let out = html;
  for (;;) {
    const at = out.indexOf(attribute);
    if (at === -1) return out;
    const range = elementRange(out, at);
    if (!range) return out;
    out = out.slice(0, range[0]) + out.slice(range[1]);
  }
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

function countWords(text) {
  return text.split(" ").filter(Boolean).length;
}

/** Minúsculas y sin tildes, para que la búsqueda de salvaguardas no se escape. */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
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
// Comprobaciones por ruta
// --------------------------------------------------------------------------

function checkRoute(entry) {
  const file = resolve(`${APP_DIR}${entry.route}.html`);
  const failures = [];

  if (!existsSync(file)) {
    return {
      route: entry.route,
      words: null,
      failures: [
        `no existe ${APP_DIR}${entry.route}.html. Corre \`npm run build\` antes de la puerta.`,
      ],
    };
  }

  const html = readFileSync(file, "utf8");
  const fail = (message) => failures.push(message);

  // --- recorte del artículo -------------------------------------------------
  const marker = html.indexOf("data-content-body");
  if (marker === -1) {
    return {
      route: entry.route,
      words: 0,
      failures: ["falta el atributo `data-content-body` que delimita el cuerpo"],
    };
  }
  const range = elementRange(html, marker);
  if (!range) {
    return {
      route: entry.route,
      words: 0,
      failures: ["el elemento con `data-content-body` no cierra"],
    };
  }
  const article = html.slice(range[0], range[1]);

  // --- cuerpo: se descuenta el mobiliario del documento ---------------------
  let body = article;
  for (const attribute of [
    "data-author-byline",
    "data-medical-disclaimer",
    "data-toc",
  ]) {
    body = stripElementsWith(body, attribute);
  }
  const bodyText = toText(body);
  const words = countWords(bodyText);

  if (words < MIN_WORDS) {
    fail(`cuerpo de ${words} palabras, el mínimo es ${MIN_WORDS}`);
  }

  // --- jerarquía de encabezados --------------------------------------------
  const articleHeadings = headings(article);
  const h1Count = articleHeadings.filter((h) => h.level === 1).length;
  if (h1Count !== 1) fail(`hay ${h1Count} elementos h1, debe haber exactamente uno`);
  if (articleHeadings.some((h) => h.level > 3)) {
    fail("hay encabezados por debajo de h3, la jerarquía solo admite h1, h2 y h3");
  }
  let seenH2 = false;
  for (const heading of articleHeadings) {
    if (heading.level === 2) seenH2 = true;
    if (heading.level === 3 && !seenH2) {
      fail(`el h3 "${heading.text}" aparece sin un h2 previo`);
      break;
    }
  }

  // --- tabla de contenidos y anclas ----------------------------------------
  const anchorH2 = articleHeadings.filter(
    (h) => h.level === 2 && /id="/.test(h.attrs) && /tabindex="-1"/.test(h.attrs)
  );

  // --- esqueleto del paquete on-page ---------------------------------------
  if (entry.format) {
    const expected = SKELETONS[entry.format];
    if (!expected) {
      fail(`el formato "${entry.format}" no tiene esqueleto declarado`);
    } else {
      const published = anchorH2.map(
        (h) => /id="([^"]+)"/.exec(h.attrs)?.[1] ?? ""
      );
      if (published.join("|") !== expected.join("|")) {
        fail(
          `el esqueleto de ${entry.format} pide [${expected.join(", ")}] y la página publica [${published.join(", ")}]`
        );
      }
    }
  }
  if (anchorH2.length >= 3) {
    const tocAt = article.indexOf("data-toc");
    const tocRange = tocAt === -1 ? null : elementRange(article, tocAt);
    if (!tocRange) {
      fail("hay tres o más secciones con ancla pero no existe la tabla de contenidos");
    } else {
      const toc = article.slice(tocRange[0], tocRange[1]);
      if (!toc.includes('aria-labelledby="toc-title"')) {
        fail("el nav de la tabla de contenidos no tiene nombre accesible");
      }
      const links = [...toc.matchAll(/<a href="#([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
      if (links.length !== anchorH2.length) {
        fail(
          `la tabla lista ${links.length} entradas y hay ${anchorH2.length} secciones con ancla`
        );
      }
      for (const link of links) {
        const target = anchorH2.find((h) => h.attrs.includes(`id="${link[1]}"`));
        if (!target) {
          fail(`la entrada "#${link[1]}" no tiene destino con id y tabindex="-1"`);
          continue;
        }
        if (toText(link[2]) !== target.text) {
          fail(
            `la entrada "${toText(link[2])}" no coincide con su h2 "${target.text}"`
          );
        }
      }
    }
  }

  // --- banner del primer tercio --------------------------------------------
  const banners = occurrences(body, "data-mid-cta");
  if (banners !== 1) {
    fail(`hay ${banners} banners de conversión, debe haber exactamente uno`);
  } else {
    const bannerAt = body.indexOf("data-mid-cta");
    const bannerRange = elementRange(body, bannerAt);
    const before = countWords(toText(body.slice(0, bannerRange[0])));
    const ratio = words === 0 ? 0 : before / words;
    if (ratio < BANNER_MIN_RATIO || ratio > BANNER_MAX_RATIO) {
      fail(
        `el banner cae en el ${(ratio * 100).toFixed(1)} por ciento del cuerpo, fuera del rango de 15 a 35`
      );
    }
  }

  // --- firma y avisos ---------------------------------------------------
  // SAFE-01 se revirtió el 2026-08-10 por decisión de Juan: el aviso ya no
  // va pegado a la firma arriba del pliegue, va una sola vez al cierre
  // (SAFE-02, ver 08-UI-SPEC.md). La puerta se actualizó junto con el
  // cambio en vez de quedar verificando un requisito superado.
  const disclaimers = [...article.matchAll(/data-medical-disclaimer/g)].map((m) => m.index);
  if (disclaimers.length !== 1) {
    fail(`hay ${disclaimers.length} avisos educativos, debe haber exactamente uno`);
  }
  const bylineAt = article.indexOf("data-author-byline");
  const bylineCount = occurrences(article, "data-author-byline");
  if (bylineCount !== 1) {
    fail(`hay ${bylineCount} firmas de autor, debe haber exactamente una`);
  }
  if (disclaimers.length > 0) {
    const lastAnchor = anchorH2[anchorH2.length - 1];
    if (lastAnchor && disclaimers[0] < lastAnchor.index) {
      fail("el aviso educativo aparece antes de la última sección, debe ir al cierre");
    }
    if (bylineAt !== -1 && bylineAt > disclaimers[0]) {
      fail("la firma va después del aviso educativo, deben leerse en ese orden");
    }
  }
  if (bylineAt !== -1) {
    const bylineRange = elementRange(article, bylineAt);
    const byline = article.slice(bylineRange[0], bylineRange[1]);
    if (!/CMP\s*\d/.test(toText(byline))) fail("la firma no muestra la colegiatura");
    if (!/RNE\s*\d/.test(toText(byline))) fail("la firma no muestra el registro de especialista");
    const times = [...byline.matchAll(/<time\b[^>]*datetime="[^"]+"/gi)];
    if (times.length !== 2) {
      fail(`la firma tiene ${times.length} fechas con atributo, deben ser dos`);
    }
  }

  // --- enlazado interno -----------------------------------------------------
  const bookingLinks = occurrences(article, 'href="/agendar"');
  if (bookingLinks < 2) {
    fail(`hay ${bookingLinks} enlaces a /agendar, deben ser dos o más`);
  }
  if (entry.type === "service" && !article.includes('href="/servicios"')) {
    fail("falta el enlace de vuelta al hub /servicios");
  }
  // Un post con destino asignado por el mapa de enlazado sigue obligado a ese
  // enlace exacto. Un post sin destino asignado no queda libre: debe salir
  // igual hacia alguna ruta del silo. La puerta no se afloja, se generaliza.
  if (entry.type === "post") {
    if (entry.linksTo) {
      if (!article.includes(`href="${entry.linksTo}"`)) {
        fail(`falta el enlace hacia ${entry.linksTo} que le asigna el mapa de enlazado`);
      }
    } else if (!/href="\/servicios(\/|")/.test(article)) {
      fail("no hay ningún enlace de salida hacia el silo /servicios");
    }
  }

  // --- salvaguardas de contenido firmado ------------------------------------
  if (/\d\s?%/.test(bodyText)) {
    fail("el cuerpo muestra un porcentaje: no se publican tasas de éxito");
  }
  if (/S\/\s?\d/.test(bodyText)) {
    fail("el cuerpo muestra una cifra en soles: no se publica precio de consulta");
  }
  const normalizedBody = normalize(bodyText);
  for (const claim of FIRST_PERSON_CLAIMS) {
    if (normalizedBody.includes(claim)) {
      fail(`el cuerpo usa la construcción en primera persona "${claim}"`);
    }
  }
  if (entry.type === "service") {
    for (const heading of headings(body)) {
      if (heading.level >= 2 && /\d/.test(heading.text)) {
        fail(`el encabezado "${heading.text}" lleva una cifra destacada`);
      }
    }
    if (/<(strong|b)\b/i.test(body)) {
      fail("el cuerpo usa énfasis fuerte: ninguna cifra puede quedar resaltada");
    }
  }

  return { route: entry.route, words, failures };
}

// --------------------------------------------------------------------------
// Comprobaciones sobre el código fuente. Corren siempre.
// --------------------------------------------------------------------------

/** Nombres de propiedad declarados dentro de los bloques `type X = { ... }`. */
function declaredFieldNames(source) {
  const names = new Set();
  for (const block of source.matchAll(/type\s+\w+\s*=\s*\{([\s\S]*?)\n\};/g)) {
    for (const field of block[1].matchAll(/(?:^|\n)\s*(\w+)\??\s*:/g)) {
      names.add(field[1]);
    }
  }
  return names;
}

/**
 * Todos los módulos de contenido del silo. Se enumeran los directorios en vez
 * de listar archivos: el contenido crece de un módulo por página, y una lista
 * fija dejaría de cubrir lo nuevo sin avisar.
 */
function contentSourceFiles() {
  const dirs = [
    "src/content/service-pages",
    "src/content/blog",
    "src/content/location-pages",
  ];
  const files = [];
  for (const dir of dirs) {
    if (!existsSync(resolve(dir))) {
      files.push(dir);
      continue;
    }
    for (const name of readdirSync(resolve(dir))) {
      if (name.endsWith(".ts")) files.push(`${dir}/${name}`);
    }
  }
  return files;
}

function checkSources() {
  const failures = [];
  const files = contentSourceFiles();

  for (const file of files) {
    if (!existsSync(resolve(file))) {
      failures.push(`${file}: no existe, la puerta no puede revisar el contenido`);
      continue;
    }
    const source = readFileSync(resolve(file), "utf8");

    const normalized = normalize(source);
    for (const claim of FIRST_PERSON_CLAIMS) {
      if (normalized.includes(claim)) {
        failures.push(`${file}: usa la construcción en primera persona "${claim}"`);
      }
    }

    for (const name of declaredFieldNames(source)) {
      if (FORBIDDEN_FIELDS.includes(name)) {
        failures.push(`${file}: declara el campo prohibido "${name}"`);
      }
    }
  }

  return failures;
}

// --------------------------------------------------------------------------
// Borradores clínicos sin aprobación médica (AUD-11)
//
// `src/content/drafts/` guarda texto clínico redactado y todavía no aprobado
// por el doctor. Mientras su campo de aprobación siga en `false`, no puede
// llegar a producción por ninguno de los dos caminos posibles: que una ruta lo
// importe, o que alguien copie el texto a un módulo de contenido.
//
// Las frases que se buscan salen del propio borrador en tiempo de ejecución y
// no están escritas acá: una copia a mano se desincroniza el día que alguien
// edite el texto, y la puerta pasaría a proteger un párrafo que ya no existe.
// --------------------------------------------------------------------------

const DRAFTS_DIR = "src/content/drafts";

/** Superficies que renderizan: ninguna puede importar un borrador. */
const RENDERING_DIRS = ["src/app", "src/components"];

/** Todos los archivos de un directorio, recursivo, con la extensión pedida. */
function filesUnder(dir, extensions) {
  const root = resolve(dir);
  if (!existsSync(root)) return [];

  const found = [];
  const pending = [dir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const item of readdirSync(resolve(current), { withFileTypes: true })) {
      const path = `${current}/${item.name}`;
      if (item.isDirectory()) pending.push(path);
      else if (extensions.some((ext) => item.name.endsWith(ext))) found.push(path);
    }
  }
  return found;
}

/** Fuera comentarios: el docblock de un borrador cita su propio contenido. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Frases largas del borrador, recortadas a un fragmento buscable. Se toman de
 * los literales de cadena del módulo, así cubren el encabezado, la entrada,
 * cada signo y el cierre sin enumerarlos acá uno por uno.
 */
function draftPhrases(source) {
  return [...stripComments(source).matchAll(/"((?:[^"\\\n]|\\.){40,})"/g)].map((match) =>
    match[1].slice(0, 60)
  );
}

function checkDrafts() {
  const failures = [];
  const drafts = filesUnder(DRAFTS_DIR, [".ts"]);
  if (drafts.length === 0) return failures;

  // --- nadie los importa ---------------------------------------------------
  for (const dir of RENDERING_DIRS) {
    for (const file of filesUnder(dir, [".ts", ".tsx"])) {
      const source = readFileSync(resolve(file), "utf8");
      if (/content\/drafts/.test(source)) {
        failures.push(
          `${file}: referencia a ${DRAFTS_DIR}. El texto clínico sin aprobación del doctor no puede llegar a una ruta`
        );
      }
    }
  }

  // --- ni su texto aparece copiado en el HTML ------------------------------
  const pages = filesUnder(APP_DIR, [".html"]);

  for (const draft of drafts) {
    const source = readFileSync(resolve(draft), "utf8");

    if (/approvedByPhysician:\s*true/.test(source)) continue;
    if (!/approvedByPhysician:\s*false/.test(source)) {
      failures.push(`${draft}: no declara \`approvedByPhysician\`, la puerta no sabe si está aprobado`);
      continue;
    }

    const phrases = draftPhrases(source);
    if (phrases.length === 0) {
      failures.push(`${draft}: no se pudo extraer ninguna frase distintiva para verificar`);
      continue;
    }

    for (const page of pages) {
      const html = readFileSync(resolve(page), "utf8");
      for (const phrase of phrases) {
        if (html.includes(phrase)) {
          failures.push(
            `${page}: publica texto de ${draft}, que no tiene aprobación médica: "${phrase}…"`
          );
        }
      }
    }
  }

  return failures;
}

// --------------------------------------------------------------------------
// Comprobaciones globales: sitemap y hub
// --------------------------------------------------------------------------

function checkGlobals(routes, isFullRun) {
  const failures = [];

  if (!existsSync(resolve(SITEMAP))) {
    failures.push(`no existe ${SITEMAP}. Corre \`npm run build\` antes de la puerta.`);
  } else {
    const sitemap = readFileSync(resolve(SITEMAP), "utf8");
    for (const route of routes) {
      if (!sitemap.includes(`${route}<`)) {
        failures.push(`el sitemap no declara ${route}`);
      }
    }
    if (isFullRun) {
      const total = occurrences(sitemap, "<loc>");
      if (total !== SITEMAP_TOTAL) {
        failures.push(`el sitemap tiene ${total} URLs, deben ser ${SITEMAP_TOTAL}`);
      }
    }
  }

  if (!existsSync(resolve(HUB))) {
    failures.push(`no existe ${HUB}. Corre \`npm run build\` antes de la puerta.`);
  } else {
    const hub = readFileSync(resolve(HUB), "utf8");
    for (const anchor of HUB_ANCHORS) {
      if (!hub.includes(`id="${anchor}"`)) {
        failures.push(`el hub perdió el ancla #${anchor}, la home enlaza a ella`);
      }
    }
    const serviceRoutes = isFullRun
      ? MANIFEST.filter((e) => e.type === "service").map((e) => e.route)
      : routes.filter((route) => route.startsWith("/servicios/"));
    for (const route of serviceRoutes) {
      if (!hub.includes(`href="${route}"`)) {
        failures.push(`el hub no enlaza a ${route}`);
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
      `check-content: no existe ${APP_DIR}. Corre \`npm run build\` antes de la puerta.`
    );
    process.exit(1);
  }

  const selected = isFullRun
    ? MANIFEST
    : args.map((route) => {
        const entry = MANIFEST.find((e) => e.route === route);
        if (!entry) {
          console.error(`check-content: la ruta ${route} no está en el manifiesto.`);
          process.exit(1);
        }
        return entry;
      });

  const results = selected.map(checkRoute);
  const sourceFailures = [...checkSources(), ...checkDrafts()];
  const globalFailures = checkGlobals(
    selected.map((e) => e.route),
    isFullRun
  );

  console.log("");
  console.log("Puerta de contenido");
  console.log("");
  for (const result of results) {
    const state = result.failures.length === 0 ? "PASA" : "FALLA";
    const words = result.words === null ? "sin build" : `${result.words} palabras`;
    console.log(`  ${state}  ${result.route}  (${words})`);
    for (const failure of result.failures) console.log(`          · ${failure}`);
  }

  if (sourceFailures.length > 0 || globalFailures.length > 0) {
    console.log("");
    console.log("  Código fuente y comprobaciones globales");
    for (const failure of [...sourceFailures, ...globalFailures]) {
      console.log(`          · ${failure}`);
    }
  }

  const total =
    results.reduce((sum, r) => sum + r.failures.length, 0) +
    sourceFailures.length +
    globalFailures.length;

  console.log("");
  if (total > 0) {
    console.log(`  ${total} fallas.`);
    console.log("");
    process.exit(1);
  }
  console.log(`  Sin fallas en ${results.length} ruta(s).`);
  console.log("");
}

main();
