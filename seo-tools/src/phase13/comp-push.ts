#!/usr/bin/env tsx
/**
 * Punto de entrada: carga los competidores en el tab transpuesto `Competitor Analysis`.
 *
 * ENSAYO POR DEFECTO. Toda operacion que modifica el documento del cliente empieza sin
 * escribir: hay que pedir la escritura con `--yes`, de forma explicita. El ensayo imprime
 * exactamente que celdas se van a tocar y con que contenido previo, incluido el residuo de
 * plantilla `pera` / `pera.com`, que Juan autorizo eliminar el 2026-08-10 y que este escritor
 * REUTILIZA como primera ranura en vez de borrar aparte.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/comp-push.ts --data data/competitors.json --dry-run
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/comp-push.ts --data data/competitors.json --yes
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT, resolveFromRepoRoot } from "../config.js";
import { getSheetsSession } from "../sheets/client.js";
import {
  cargarModeloTranspuesto,
  describirResumen,
  upsertColumns,
} from "../sheets/column-upsert.js";
import { createGoogleWriteGateway } from "../sheets/upsert.js";
import { booleana, ejecutar, parseBanderas, texto } from "./args.js";

const TAB = "Competitor Analysis";

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const data = texto(banderas, "data") ?? "seo-tools/data/competitors.json";
  const escribir = booleana(banderas, "yes");

  if (escribir && booleana(banderas, "dry-run")) {
    throw new CliError("--yes y --dry-run se contradicen. Elegir uno.");
  }

  // Las rutas relativas de este proyecto son relativas a la RAIZ DEL REPOSITORIO, pero el
  // comando se corre desde seo-tools/, asi que `--data data/competitors.json` es lo que
  // cualquiera va a escribir. Se prueban las dos y el error nombra las dos: fallar con "no
  // existe" sobre una sola ruta manda a depurar el lugar equivocado.
  const candidatas = [resolveFromRepoRoot(data), path.resolve(SEO_TOOLS_ROOT, data)];
  let perfilado: { competidores?: unknown } | undefined;
  let ruta = candidatas[0] as string;

  for (const candidata of candidatas) {
    try {
      perfilado = JSON.parse(await readFile(candidata, "utf8")) as { competidores?: unknown };
      ruta = candidata;
      break;
    } catch {
      // Se prueba la siguiente.
    }
  }

  if (perfilado === undefined) {
    throw new CliError(
      `No se pudo leer el perfil de competidores.\n` +
        `  Rutas probadas:\n${[...new Set(candidatas)].map((c) => `    - ${c}`).join("\n")}\n` +
        `  Accion: generarlo con ./node_modules/.bin/tsx src/phase13/comp-profile.ts`,
    );
  }

  const competidores = perfilado.competidores;
  if (!Array.isArray(competidores) || competidores.length === 0) {
    throw new CliError(`${ruta} no trae el arreglo "competidores".`);
  }

  // La linea de base propia NO va al tab del cliente: el tab se llama Competitor Analysis y
  // tiene exactamente cinco ranuras. La comparacion contra el dominio propio vive en
  // 13-COMPETIDORES.md, que es donde sirve.
  const registros = (competidores as Record<string, unknown>[]).filter((c) => c["esLineaDeBase"] !== true);

  const modelo = await cargarModeloTranspuesto(TAB);
  const session = await getSheetsSession();
  const gateway = createGoogleWriteGateway(session);

  const resumen = await upsertColumns(gateway, modelo, registros, { dryRun: !escribir });
  process.stdout.write(describirResumen(resumen, TAB));

  if (resumen.ensayo) {
    process.stdout.write(
      `\nEsto fue un ENSAYO y no se escribio nada. Para cargar de verdad, repetir con --yes.\n`,
    );
  }

  return resumen.sinRanura.length > 0 ? 1 : 0;
}

ejecutar(main);
