#!/usr/bin/env tsx
/**
 * Punto de entrada: arma `data/competitors.json` y, opcionalmente, el entregable legible.
 *
 * LEE SOLO DE LA CACHE. Cero llamadas de red, cero unidades de Ahrefs, cero credenciales. Dos
 * corridas seguidas producen el mismo archivo byte a byte: ningun valor sale del reloj.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/comp-profile.ts
 *   ./node_modules/.bin/tsx src/phase13/comp-profile.ts --out /tmp/comp1.json
 *   ./node_modules/.bin/tsx src/phase13/comp-profile.ts \
 *       --md ../.planning/workstreams/seo-keywords/phases/13-clusters-competencia-y-las-10-de-oro/13-COMPETIDORES.md
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { CliError, REPO_ROOT, resolveFromRepoRoot } from "../config.js";
import { comoMarkdown, perfilar, RUTA_PERFIL } from "./competitors.js";
import { ejecutar, parseBanderas, texto } from "./args.js";

/** Entregable de COMP-01 y COMP-04, en la carpeta de la fase. */
const MD_POR_DEFECTO =
  ".planning/workstreams/seo-keywords/phases/13-clusters-competencia-y-las-10-de-oro/13-COMPETIDORES.md";

/**
 * Resuelve un destino contra la RAIZ DEL REPOSITORIO y se niega a salir de ella.
 *
 * Las rutas relativas de este proyecto son relativas a la raiz del repositorio y NO al
 * directorio de trabajo, que es el criterio de `config.ts`. La trampa es que los comandos se
 * corren desde `seo-tools/`, asi que escribir `../.planning/...` por costumbre de shell
 * resuelve un nivel MAS ARRIBA de la raiz y deja el archivo fuera del repositorio, sin que
 * nada falle. Aca falla.
 */
function destinoDentroDelRepo(candidato: string, bandera: string): string {
  const resuelto = resolveFromRepoRoot(candidato);
  const relativo = path.relative(REPO_ROOT, resuelto);
  if (relativo.startsWith("..") || path.isAbsolute(relativo)) {
    throw new CliError(
      `--${bandera} apunta fuera del repositorio y la escritura se detiene.\n` +
        `  Valor recibido: ${candidato}\n` +
        `  Resuelto: ${resuelto}\n` +
        `  Raiz del repositorio: ${REPO_ROOT}\n` +
        `  Las rutas relativas se resuelven contra la RAIZ del repositorio, no contra el\n` +
        `  directorio de trabajo. Sobra el "../" del principio: usar\n` +
        `  ".planning/workstreams/..." aunque el comando se corra desde seo-tools/.`,
    );
  }
  return resuelto;
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const salida = texto(banderas, "out");
  const cacheDir = texto(banderas, "cache-dir");
  // `--md` sola vale por la ruta por defecto del entregable; `--md <ruta>` la sobreescribe.
  const rawMd = banderas.values["md"];
  const md = rawMd === undefined ? undefined : typeof rawMd === "string" ? rawMd : MD_POR_DEFECTO;

  const perfilado = await perfilar({ ...(cacheDir === undefined ? {} : { cacheDir }) });

  // --out sale del repositorio a proposito en la verificacion de determinismo, que escribe en
  // /tmp: por eso solo se le exige ser absoluto o relativo a la raiz, sin el guardarrail.
  const destino = salida === undefined ? RUTA_PERFIL : resolveFromRepoRoot(salida);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, `${JSON.stringify(perfilado, null, 2)}\n`, "utf8");

  const conDatos = perfilado.competidores.filter((c) => c.domainRatingFuente === "ahrefs").length;
  process.stdout.write(
    `Perfiles: ${perfilado.competidores.length} (cinco competidores mas la linea de base propia)\n` +
      `Con DR de Ahrefs: ${conDatos}\n` +
      `Consultas pendientes de ingerir: ${perfilado.consultasPendientes.length}\n` +
      `Escrito: ${destino}\n`,
  );

  if (perfilado.consultasPendientes.length > 0) {
    process.stdout.write(
      `\nAVISO: el perfil esta INCOMPLETO y lo declara en cada metrica como "no_consultado",\n` +
        `que es distinto de cero y distinto de "no tiene". Para completarlo:\n` +
        `  ./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts --domains <los seis> --pendientes\n` +
        `y despues una ingesta por consulta con ahrefs-ingest.ts.\n`,
    );
  }

  if (md !== undefined) {
    const destinoMd = destinoDentroDelRepo(md === "" || md === "true" ? MD_POR_DEFECTO : md, "md");
    await mkdir(path.dirname(destinoMd), { recursive: true });
    await writeFile(destinoMd, comoMarkdown(perfilado), "utf8");
    process.stdout.write(`Entregable: ${destinoMd}\n`);
  }

  return 0;
}

ejecutar(main);
