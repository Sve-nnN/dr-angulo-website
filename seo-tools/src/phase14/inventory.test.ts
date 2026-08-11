/**
 * Pruebas del inventario de URLs.
 *
 * Corren contra el REPOSITORIO REAL y no contra fixtures, a proposito. Lo que este modulo
 * promete es que el inventario sale del codigo publicado hoy; una fixture probaria el parseo y
 * dejaria sin probar justamente eso. El costo es que las pruebas cambian cuando el sitio
 * cambia, y eso tambien es lo que se quiere: si el workstream paralelo publica una sede nueva,
 * la prueba de expansion lo nota sola.
 *
 * Ninguna prueba de aca escribe en `src/` de la aplicacion.
 *
 * El prefijo `inventory:` de cada nombre no es decorativo: es lo que hace que
 * `npm test -- --test-name-pattern=inventory` seleccione este archivo y solo este.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MODULO_BLOG,
  MODULO_SEDES,
  MODULO_SERVICIOS,
  construirInventario,
  registrosDeModulo,
} from "./inventory.js";

test("inventory: una ruta estatica de src/app con page.tsx entra como viva", () => {
  const inventario = construirInventario();
  const sobre = inventario.urls.find((u) => u.url === "/sobre-el-doctor");

  assert.ok(sobre, "/sobre-el-doctor tiene page.tsx y tiene que estar en el inventario");
  assert.equal(sobre.estado, "viva");
  assert.equal(sobre.familia, "institucional");
  assert.match(sobre.origen, /^src\/app\/sobre-el-doctor\/page\.tsx:\d+$/);
  assert.notEqual(sobre.titulo.trim(), "");
});

test("inventory: la home entra con su titulo resuelto y no con el literal de la plantilla", () => {
  const home = construirInventario().urls.find((u) => u.url === "/");

  assert.ok(home);
  assert.equal(home.familia, "home");
  assert.ok(
    !home.titulo.includes("${"),
    `el titulo de la home quedo sin resolver: ${JSON.stringify(home.titulo)}`,
  );
});

test("inventory: una ruta dinamica se expande a una URL por slug de su modulo de contenido", () => {
  const inventario = construirInventario();

  const casos = [
    { prefijo: "/sedes/", modulo: MODULO_SEDES, familia: "sede" },
    { prefijo: "/servicios/", modulo: MODULO_SERVICIOS, familia: "servicio" },
    { prefijo: "/blog/", modulo: MODULO_BLOG, familia: "blog" },
  ] as const;

  for (const caso of casos) {
    const registros = registrosDeModulo(caso.modulo);
    const urls = inventario.urls.filter((u) => u.url.startsWith(caso.prefijo));

    assert.deepEqual(
      urls.map((u) => u.url).sort(),
      registros.map((r) => `${caso.prefijo}${r.slug}`).sort(),
      `${caso.prefijo} tiene que expandirse exactamente a los slugs de ${caso.modulo}`,
    );
    for (const url of urls) {
      assert.equal(url.familia, caso.familia);
      assert.ok(url.origen.startsWith(caso.modulo), `${url.url} tiene que citar ${caso.modulo}`);
    }
  }
});

test("inventory: /privacidad entra al inventario pero queda fuera del mapa, con el motivo escrito", () => {
  const privacidad = construirInventario().urls.find((u) => u.url === "/privacidad");

  assert.ok(privacidad, "D-11 la deja fuera del MAPA, no del inventario");
  assert.equal(privacidad.mapeable, false);
  assert.equal(privacidad.familia, "legal");
  assert.ok(
    (privacidad.motivoNoMapeable ?? "").trim().length > 20,
    "una exclusion sin motivo escrito no es auditable",
  );
});

test("inventory: las rutas de API y los archivos generados no entran", () => {
  const urls = construirInventario().urls.map((u) => u.url);

  for (const fuera of ["/api", "/llms.txt", "/sitemap.xml", "/robots.txt"]) {
    assert.ok(
      !urls.some((u) => u === fuera || u.startsWith(`${fuera}/`)),
      `${fuera} no es una pagina y no puede estar en el inventario`,
    );
  }
});

test("inventory: una sede que el contenido ya no declara no aparece, y Montefiori no aparece", () => {
  const inventario = construirInventario();

  const montefiori = inventario.urls.filter(
    (u) => /montefiori/i.test(u.url) || /montefiori/i.test(u.titulo),
  );
  assert.deepEqual(montefiori, [], "D-08: el doctor ya no atiende ahi");

  // La regla de fondo, que es la que impide que vuelva: las URLs de sede salen del modulo
  // editorial, igual que generateStaticParams. Una sede sin entrada editorial no tiene ruta.
  const declaradas = new Set(registrosDeModulo(MODULO_SEDES).map((r) => `/sedes/${r.slug}`));
  for (const url of inventario.urls.filter((u) => u.url.startsWith("/sedes/"))) {
    assert.ok(declaradas.has(url.url), `${url.url} no esta declarada en ${MODULO_SEDES}`);
  }
});

test("inventory: cada URL trae procedencia, familia y veredicto de mapeable", () => {
  const inventario = construirInventario();

  assert.ok(inventario.urls.length > 0);
  for (const url of inventario.urls) {
    assert.ok(url.url.startsWith("/"), `${url.url} tiene que ser una ruta del sitio`);
    assert.match(url.origen, /^src\/.+:\d+$/, `${url.url} sin procedencia con linea`);
    assert.equal(typeof url.mapeable, "boolean");
    assert.notEqual(url.titulo.trim(), "");
    if (!url.mapeable) assert.ok((url.motivoNoMapeable ?? "").trim() !== "");
  }

  // Sin duplicados: dos entradas para la misma URL romperian el cruce de canibalizacion.
  const vistas = new Set(inventario.urls.map((u) => u.url));
  assert.equal(vistas.size, inventario.urls.length);
});

test("inventory: el resumen cuadra con la lista y el reparto por familia suma el total", () => {
  const inventario = construirInventario();

  assert.equal(inventario.resumen.total, inventario.urls.length);
  assert.equal(
    inventario.resumen.mapeables,
    inventario.urls.filter((u) => u.mapeable).length,
  );
  const suma = Object.values(inventario.resumen.porFamilia).reduce((a, b) => a + b, 0);
  assert.equal(suma, inventario.urls.length);
});

test("inventory: la reconciliacion contra la cifra del roadmap se registra en vez de disimularse", () => {
  const { reconciliacion, resumen } = construirInventario();

  assert.ok(reconciliacion !== undefined, "el bloque de reconciliacion es obligatorio");
  assert.equal(reconciliacion.esperadoRoadmap, 19);
  assert.equal(reconciliacion.esperadoMapeableRoadmap, 18);
  assert.equal(reconciliacion.medido, resumen.total);
  assert.equal(reconciliacion.medidoMapeable, resumen.mapeables);
  assert.equal(reconciliacion.diferencia, resumen.total - 19);

  if (reconciliacion.diferencia !== 0) {
    assert.ok(
      reconciliacion.sobran.length > 0 || reconciliacion.faltan.length > 0,
      "una diferencia sin lista nominal no le sirve a nadie en el checkpoint del 14-02",
    );
    assert.ok(reconciliacion.nota.trim().length > 40);
  }
});

test("inventory: dos construcciones seguidas dan exactamente el mismo resultado", () => {
  assert.equal(
    JSON.stringify(construirInventario()),
    JSON.stringify(construirInventario()),
  );
});
