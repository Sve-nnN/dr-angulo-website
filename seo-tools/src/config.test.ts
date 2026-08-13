import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { CliError, REPO_ROOT, SEO_TOOLS_ROOT, destinoPermitido } from "./config.js";

test("destinoPermitido: un relativo se resuelve contra la primera raiz", () => {
  assert.equal(
    destinoPermitido("data/onpage.json", SEO_TOOLS_ROOT),
    path.join(SEO_TOOLS_ROOT, "data", "onpage.json"),
  );
});

test("destinoPermitido: el arbol de la aplicacion no es un destino escribible", () => {
  // Es la unica cosa que este workstream tiene prohibido tocar, y hasta ahora la sostenia
  // solamente la disciplina de quien tipea el comando.
  assert.throws(
    () => destinoPermitido(path.join(REPO_ROOT, "src", "app", "page.tsx"), SEO_TOOLS_ROOT),
    CliError,
  );
});

test("destinoPermitido: un relativo con .. que sale del repositorio se rechaza", () => {
  assert.throws(() => destinoPermitido("../../algo.json", SEO_TOOLS_ROOT), CliError);
});

test("destinoPermitido: la raiz misma no es un archivo", () => {
  assert.throws(() => destinoPermitido(SEO_TOOLS_ROOT, SEO_TOOLS_ROOT), CliError);
});

test("destinoPermitido: alcanza con caer dentro de una de las raices declaradas", () => {
  const carpetaDeLaFase = path.join(REPO_ROOT, ".planning", "workstreams", "seo-keywords");
  const destino = path.join(carpetaDeLaFase, "15-REVISION-DOCTOR.md");

  assert.equal(destinoPermitido(destino, carpetaDeLaFase, SEO_TOOLS_ROOT), destino);
  assert.throws(() => destinoPermitido(destino, SEO_TOOLS_ROOT), CliError);
});
