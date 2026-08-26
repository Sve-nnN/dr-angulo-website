#!/usr/bin/env node
/**
 * Puerta de la caché de borde de Cloudflare (CWV-01, issue #7).
 *
 *   npm run cache:check            # informa y no falla
 *   npm run cache:check -- --gate  # falla si el borde no cachea o si algo se rompió
 *   npm run cache:check -- --base https://otro-dominio
 *
 * Ejecuta el protocolo de medición que el plan 18-02 escribió a mano, para que
 * comprobar la regla no dependa de acordarse de cinco comandos de `curl` ni de
 * leerlos bien. El diagnóstico, las seis invariantes y la regla exacta a crear
 * en el panel están en
 * `.planning/workstreams/seo-fixes/phases/18-rendimiento-y-accesibilidad/18-CLOUDFLARE-CACHE.md`.
 * Este archivo no repite nada de eso: lo mide.
 *
 * Mide contra producción y no contra el build, porque lo que decide si el
 * paciente espera 630 ms o 30 ms es lo que responde el borde, y eso no se lee
 * desde el repositorio.
 *
 * Las cinco comprobaciones de no regresión son tan importantes como el `HIT`.
 * Una regla de caché mal puesta no falla ruidosamente: sirve el payload de
 * React Server Components como si fuera la página, o deja de redirigir `www`
 * al apex, o se traga las cabeceras de seguridad. Ninguna de las cuatro
 * compuertas del proyecto mira producción, así que si no se comprueba acá no
 * se comprueba en ningún lado.
 */

const args = process.argv.slice(2);
const GATE = args.includes("--gate");
const BASE = (() => {
  const index = args.indexOf("--base");
  return index === -1 ? "https://drangulocolumna.com" : args[index + 1];
})();

const HOST = new URL(BASE).host;
const WWW = `${new URL(BASE).protocol}//www.${HOST}`;

/** El techo de CWV-01 para la portada. */
const TTFB_MAX_MS = 300;

/** Corridas por ruta para el TTFB. Se reporta la mediana, como el plan 18-02. */
const RUNS = 3;

/** Las que declara `next.config.ts` y que Cloudflare podría filtrar. */
const SECURITY_HEADERS = [
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function out(line = "") {
  process.stdout.write(`${line}\n`);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function timed(url, { headers = {}, redirect = "manual" } = {}) {
  const started = performance.now();
  const response = await fetch(url, { headers, redirect, cache: "no-store" });
  const ms = Math.round(performance.now() - started);
  const body = await response.text();

  return { response, ms, body };
}

async function routes() {
  const xml = await fetch(`${BASE}/sitemap.xml`, { cache: "no-store" }).then((r) => r.text());
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname);

  return [...new Set(paths)].sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
}

// --------------------------------------------------------------------------
// 1. Estado del borde y TTFB, ruta por ruta
// --------------------------------------------------------------------------

async function measureRoutes(list) {
  const rows = [];

  for (const route of list) {
    const url = `${BASE}${route}`;

    // La primera petición puede llenar la caché. La que cuenta es la segunda.
    await timed(url);
    const times = [];
    let last;

    for (let run = 0; run < RUNS; run += 1) {
      last = await timed(url);
      times.push(last.ms);
    }

    const status = last.response.headers.get("cf-cache-status") ?? "sin cabecera";
    rows.push({ route, status, ms: median(times), age: last.response.headers.get("age") });

    if (last.response.status !== 200) fail(`${route} respondió ${last.response.status}`);
  }

  const width = Math.max(...rows.map((row) => row.route.length));
  out("\n  Estado del borde y TTFB mediano de tres corridas\n");
  for (const row of rows) {
    out(`    ${row.route.padEnd(width)}  ${String(row.status).padEnd(9)} ${String(row.ms).padStart(5)} ms`);
  }

  return rows;
}

// --------------------------------------------------------------------------
// 2. Invariante 3: el router tiene que seguir recibiendo carga RSC
// --------------------------------------------------------------------------

async function checkRsc() {
  const { response, body } = await timed(`${BASE}/sedes`, { headers: { rsc: "1" } });
  const type = response.headers.get("content-type") ?? "sin content-type";
  const isHtml = /^\s*<!DOCTYPE html/i.test(body);

  if (isHtml || type.includes("text/html")) {
    fail(
      `/sedes con cabecera \`rsc: 1\` devolvió ${type}. La regla de bypass de peticiones RSC no está puesta o quedó por debajo de la de caché, y el borde puede servir el payload como si fuera la página.`
    );
    return;
  }

  out(`    /sedes con \`rsc: 1\` devuelve ${type}`);
}

// --------------------------------------------------------------------------
// 3. Invariante 5: el host no puede salir de la clave de caché
// --------------------------------------------------------------------------

async function checkWwwRedirect() {
  for (const path of ["/", "/sedes"]) {
    const { response } = await timed(`${WWW}${path}`);
    const location = response.headers.get("location") ?? "";

    if (response.status !== 301 || !location.startsWith(BASE)) {
      fail(
        `www${path} respondió ${response.status} hacia "${location || "ningún lado"}" y tiene que ser 301 hacia el apex. Si devuelve 200, el host salió de la clave de caché y el borde sirve el HTML del apex a las peticiones por www.`
      );
      continue;
    }

    out(`    www${path} sigue redirigiendo 301 al apex`);
  }
}

// --------------------------------------------------------------------------
// 4. Invariante 4: las rutas de API nunca se sirven desde caché
// --------------------------------------------------------------------------

async function checkApiBypass() {
  const { response } = await timed(`${BASE}/api/reviews/status`);
  const status = response.headers.get("cf-cache-status") ?? "sin cabecera";

  if (status === "HIT") {
    fail("/api/reviews/status se sirvió desde la caché del borde. Una ruta de API cacheada le entrega a un visitante la respuesta de otro.");
    return;
  }

  out(`    /api/reviews/status responde ${status}, no HIT`);
}

// --------------------------------------------------------------------------
// 5. Invariante 6: el optimizador de imágenes varía según `Accept`
// --------------------------------------------------------------------------

async function checkImageVariant() {
  const url = `${BASE}/_next/image?url=%2Fdr-angulo-implante-disco.avif&w=640&q=75`;
  const { response } = await timed(url, {
    headers: { accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
  });
  const type = response.headers.get("content-type") ?? "sin content-type";

  if (response.status !== 200) {
    warn(`la imagen de prueba respondió ${response.status}; revisá que el asset siga existiendo`);
    return;
  }

  if (type.includes("image/jpeg")) {
    fail(
      "/_next/image devolvió image/jpeg pidiendo webp. El borde cacheó la variante de un cliente sin `Accept` y la está sirviendo a todos: falta incluir esa cabecera en la clave de caché, o excluir /_next/image del cacheo."
    );
    return;
  }

  out(`    /_next/image devuelve ${type} cuando el cliente acepta formatos modernos`);
}

// --------------------------------------------------------------------------
// 6. Las cinco cabeceras de seguridad tienen que llegar al navegador
// --------------------------------------------------------------------------

async function checkSecurityHeaders() {
  const { response } = await timed(`${BASE}/`);
  const missing = SECURITY_HEADERS.filter((header) => !response.headers.get(header));

  if (missing.length > 0) {
    fail(`la portada no está sirviendo estas cabeceras de seguridad: ${missing.join(", ")}`);
    return;
  }

  out(`    las ${SECURITY_HEADERS.length} cabeceras de seguridad siguen llegando`);
}

// --------------------------------------------------------------------------

async function main() {
  out(`\nCaché de borde en ${BASE}`);

  const rows = await measureRoutes(await routes());

  const hits = rows.filter((row) => row.status === "HIT").length;
  const home = rows.find((row) => row.route === "/");
  const slowest = rows.reduce((worst, row) => (row.ms > worst.ms ? row : worst), rows[0]);

  out(
    `\n  ${hits} de ${rows.length} rutas con HIT en el borde. La portada respondió en ${home?.ms} ms; la más lenta, ${slowest.route} en ${slowest.ms} ms.`
  );

  out("\n  No regresión\n");
  await checkRsc();
  await checkWwwRedirect();
  await checkApiBypass();
  await checkImageVariant();
  await checkSecurityHeaders();

  if (GATE) {
    if (hits < rows.length) {
      const missing = rows.filter((row) => row.status !== "HIT").map((row) => row.route);
      fail(`estas rutas no se sirven desde la caché del borde: ${missing.join(", ")}`);
    }
    if (home && home.ms > TTFB_MAX_MS) {
      fail(`la portada respondió en ${home.ms} ms y el techo de CWV-01 son ${TTFB_MAX_MS} ms`);
    }
  }

  if (warnings.length > 0) {
    out(`\n  ${warnings.length} aviso(s):`);
    for (const message of warnings) out(`    - ${message}`);
  }

  if (failures.length > 0) {
    out(`\n  ${failures.length} falla(s):`);
    for (const message of failures) out(`    - ${message}`);
    out("");
    process.exit(1);
  }

  out("\n  Sin fallas.\n");
}

main().catch((error) => {
  process.stderr.write(`\n${error.message}\n`);
  process.exit(1);
});
