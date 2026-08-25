#!/usr/bin/env node
/**
 * Generador de las tarjetas de Open Graph (issue #14).
 *
 *   npm run og:build
 *
 * El lienzo de la tarjeta lo sigue dibujando `src/lib/og-card.tsx` con Satori,
 * y el título lo sigue leyendo de la misma fuente que `generateMetadata`: no
 * hay una segunda copia del texto en ningún lado. Lo que cambia es que el PNG
 * de Satori deja de ser lo que se sirve. Este script levanta el servidor de
 * desarrollo con `OG_GENERATE=1`, le pide cada tarjeta, la convierte a JPEG y
 * la deja en `public/og/`. En producción la ruta devuelve ese archivo.
 *
 * El PNG de la portada pesaba 551 KB. El objetivo del issue es menos de 200 KB,
 * y por eso el JPEG sale con mozjpeg y calidad 82: en una foto con velo de
 * color, el escalón entre 82 y 90 no se ve y sí se paga.
 *
 * Por qué el servidor y no una llamada directa a `renderOgCard`: la función es
 * un módulo TSX con alias de importación de Next. Levantarlo cuesta unos
 * segundos y evita montar un segundo pipeline de compilación que se
 * desincronice del de la aplicación.
 *
 * La lista de tarjetas no vive acá. Sale del sitemap del propio sitio más las
 * rutas `noindex`, y cada tarjeta declara su llave y su texto en las cabeceras
 * `x-og-*` que pone `og-card.tsx`. Agregar una página no obliga a tocar este
 * archivo.
 *
 * Salidas:
 *   public/og/<llave>.jpg
 *   public/og/manifest.json  — llave, title, eyebrow y peso, que `og-card.tsx`
 *                              compara en cada build para detectar tarjetas
 *                              viejas, y `check-seo.mjs` usa como puerta.
 */

import { spawn } from "node:child_process";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const PORT = Number(process.env.OG_PORT ?? 4021);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const OUT_DIR = join(process.cwd(), "public", "og");

/** Fuera del sitemap por `noindex`, pero se comparten por WhatsApp igual. */
const EXTRA_ROUTES = ["/privacidad"];

/** Lo que pide el issue #14. */
const MAX_BYTES = 200 * 1024;

const JPEG = { quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: "4:2:0" };

function log(message) {
  process.stdout.write(`${message}\n`);
}

function startServer() {
  const child = spawn("npx", ["next", "dev", "--port", String(PORT)], {
    env: { ...process.env, OG_GENERATE: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", () => {});
  child.stderr.on("data", (chunk) => {
    const text = String(chunk);
    if (/error/i.test(text)) process.stderr.write(text);
  });

  return child;
}

async function waitForServer(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${ORIGIN}/opengraph-image`, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // El servidor todavía no escucha.
    }
    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  throw new Error(`El servidor de desarrollo no respondió en ${ORIGIN} a tiempo.`);
}

/**
 * Rutas candidatas: las del sitemap más las `noindex`.
 *
 * Una ruta sin `opengraph-image.tsx` propio hereda la tarjeta de su segmento
 * padre, así que su URL responde 404 acá y se descarta sin ruido.
 */
async function candidateRoutes() {
  const xml = await fetch(`${ORIGIN}/sitemap.xml`, { cache: "no-store" }).then((r) => r.text());
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) =>
    new URL(url).pathname.replace(/\/$/, "")
  );

  return [...new Set([...routes, ...EXTRA_ROUTES])].sort();
}

async function fetchCard(route) {
  const url = `${ORIGIN}${route}/opengraph-image`;
  const response = await fetch(url, { cache: "no-store" });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${url} respondió ${response.status}`);

  const key = response.headers.get("x-og-key");
  if (!key) {
    throw new Error(
      `${url} no declaró x-og-key. ¿El servidor arrancó sin OG_GENERATE=1, o la ruta no usa renderOgCard?`
    );
  }

  return {
    key,
    route: route || "/",
    eyebrow: decodeURIComponent(response.headers.get("x-og-eyebrow") ?? ""),
    title: decodeURIComponent(response.headers.get("x-og-title") ?? ""),
    png: Buffer.from(await response.arrayBuffer()),
  };
}

async function main() {
  const server = startServer();
  const stop = () => {
    if (!server.killed) server.kill("SIGTERM");
  };
  process.on("exit", stop);
  process.on("SIGINT", () => {
    stop();
    process.exit(130);
  });

  try {
    log(`Levantando next dev en ${ORIGIN} con OG_GENERATE=1…`);
    await waitForServer();

    const routes = await candidateRoutes();
    log(`${routes.length} rutas candidatas. Generando tarjetas…\n`);

    await mkdir(OUT_DIR, { recursive: true });

    const manifest = {};
    const rows = [];
    const oversized = [];
    const seenKeys = new Map();

    for (const route of routes) {
      const card = await fetchCard(route);
      if (!card) continue;

      const previous = seenKeys.get(card.key);
      if (previous) {
        throw new Error(
          `${card.route} y ${previous} declaran la misma llave "${card.key}". Cada ruta necesita la suya.`
        );
      }
      seenKeys.set(card.key, card.route);

      const jpeg = await sharp(card.png).jpeg(JPEG).toBuffer();
      await writeFile(join(OUT_DIR, `${card.key}.jpg`), jpeg);

      manifest[card.key] = {
        route: card.route,
        eyebrow: card.eyebrow,
        title: card.title,
        bytes: jpeg.length,
      };

      rows.push({ key: card.key, png: card.png.length, jpg: jpeg.length });
      if (jpeg.length > MAX_BYTES) oversized.push(card.key);
    }

    if (rows.length === 0) throw new Error("No se generó ninguna tarjeta.");

    // Tarjetas de rutas que ya no existen: si quedaran, el manifiesto no las
    // nombra y nadie las sirve, pero seguirían pesando en el repositorio.
    for (const file of await readdir(OUT_DIR)) {
      if (!file.endsWith(".jpg")) continue;
      const key = file.slice(0, -4);
      if (!manifest[key]) {
        await rm(join(OUT_DIR, file));
        log(`  borrada ${file}, ya no hay ruta que la use`);
      }
    }

    await writeFile(join(OUT_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

    const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
    const width = Math.max(...rows.map((row) => row.key.length));
    for (const row of rows.sort((a, b) => b.jpg - a.jpg)) {
      log(`  ${row.key.padEnd(width)}  ${kb(row.png).padStart(7)} → ${kb(row.jpg).padStart(7)}`);
    }

    const totalPng = rows.reduce((sum, row) => sum + row.png, 0);
    const totalJpg = rows.reduce((sum, row) => sum + row.jpg, 0);
    log(
      `\n${rows.length} tarjetas: ${kb(totalPng)} en PNG → ${kb(totalJpg)} en JPEG. La más pesada, ${kb(Math.max(...rows.map((row) => row.jpg)))}.`
    );

    if (oversized.length > 0) {
      throw new Error(
        `Estas tarjetas pasan los ${kb(MAX_BYTES)} del issue #14: ${oversized.join(", ")}. Bajá la calidad en JPEG o simplificá el lienzo.`
      );
    }
  } finally {
    stop();
  }
}

main().catch((error) => {
  process.stderr.write(`\n${error.message}\n`);
  process.exit(1);
});
