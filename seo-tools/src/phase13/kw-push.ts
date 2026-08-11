#!/usr/bin/env tsx
/**
 * Punto de entrada: carga la vista de la fase 13 en el tab `Keyword Research` (SHEET-01).
 *
 * Envuelve al escritor de filas del plan 12-02 sin tocarlo. Existe como punto de entrada propio
 * porque la tabla de subcomandos de `src/cli.ts` quedo CERRADA al terminar la fase 12.
 *
 * DOS DEFENSAS QUE NO SE PUEDEN QUITAR, Y LAS DOS APUNTAN AL MISMO ACCIDENTE:
 *
 *   1. Se rechaza cualquier dataset cuyas filas no traigan `cluster`. `data/keywords.jsonl` no
 *      tiene ese campo, asi que cargarlo por aca escribiria cadena vacia en `Cluster` y
 *      `Top Result` y borraria lo recien escrito SIN LANZAR NADA. El dataset correcto es la
 *      vista, `data/keywords-13.jsonl`, que sale de `build-dataset.ts`.
 *   2. El upsert corre con `omitirCamposAusentes`, asi que aunque la primera defensa se saltara
 *      alguna vez, una columna sin campo en el registro quedaria INTACTA en vez de borrarse.
 *
 * ENSAYO POR DEFECTO. Hay que pedir la escritura con `--yes`.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/kw-push.ts --data data/keywords-13.jsonl --dry-run
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/kw-push.ts --data data/keywords-13.jsonl --yes
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT, resolveFromRepoRoot } from "../config.js";
import { getSheetsSession } from "../sheets/client.js";
import { loadSheetModel } from "../sheets/schema.js";
import { createGoogleWriteGateway, upsertRows } from "../sheets/upsert.js";
import { booleana, ejecutar, parseBanderas, texto } from "./args.js";

const TAB = "Keyword Research";
const POR_DEFECTO = "data/keywords-13.jsonl";

/** Campos que la vista de esta fase tiene que traer, o la carga borraria columnas. */
const CAMPOS_EXIGIDOS = ["cluster", "topResult", "keywordDifficulty", "trafficPotential"] as const;

async function leerJsonl(ruta: string): Promise<Record<string, unknown>[]> {
  const candidatas = [resolveFromRepoRoot(ruta), path.resolve(SEO_TOOLS_ROOT, ruta)];
  let crudo: string | undefined;
  let usada = candidatas[0] as string;

  for (const candidata of candidatas) {
    try {
      crudo = await readFile(candidata, "utf8");
      usada = candidata;
      break;
    } catch {
      // Se prueba la siguiente.
    }
  }
  if (crudo === undefined) {
    throw new CliError(
      `No se pudo leer el dataset.\n  Rutas probadas:\n${[...new Set(candidatas)]
        .map((c) => `    - ${c}`)
        .join("\n")}\n` + `  Accion: generarlo con ./node_modules/.bin/tsx src/phase13/build-dataset.ts`,
    );
  }

  const registros: Record<string, unknown>[] = [];
  crudo.split("\n").forEach((linea, i) => {
    const t = linea.trim();
    if (t === "") return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(t);
    } catch {
      throw new CliError(`${usada} tiene una linea que no es JSON valido: linea ${i + 1}.`);
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new CliError(`La linea ${i + 1} de ${usada} no es un objeto.`);
    }
    registros.push(parsed as Record<string, unknown>);
  });
  return registros;
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const data = texto(banderas, "data") ?? POR_DEFECTO;
  const ensayo = !booleana(banderas, "yes") || booleana(banderas, "dry-run");

  if (booleana(banderas, "yes") && booleana(banderas, "dry-run")) {
    throw new CliError("--yes y --dry-run se contradicen. Elegir uno.");
  }

  const registros = await leerJsonl(data);
  if (registros.length === 0) throw new CliError(`${data} no trae ni un registro.`);

  // La defensa 1. Se mide sobre el dataset entero y no sobre una muestra: la trampa es
  // justamente que la mayoria de las filas esten bien y unas pocas no.
  const faltantes = CAMPOS_EXIGIDOS.filter((campo) => !registros.every((r) => campo in r));
  if (faltantes.length > 0) {
    throw new CliError(
      `El dataset NO trae ${faltantes.map((f) => JSON.stringify(f)).join(", ")} en todas sus filas ` +
        `y la carga se detiene sin escribir nada.\n` +
        `  Archivo: ${data}\n` +
        `  El tab declara esas columnas como de fase 13. Cargar un dataset que no las trae\n` +
        `  escribiria celda VACIA sobre lo que ya esta escrito, en las ${registros.length} filas y\n` +
        `  sin lanzar ninguna excepcion.\n` +
        `  Accion: usar la vista de la fase, que une las tres fuentes:\n` +
        `    ./node_modules/.bin/tsx src/phase13/build-dataset.ts\n` +
        `    ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/kw-push.ts --data ${POR_DEFECTO} --yes`,
    );
  }

  const modelo = await loadSheetModel();
  const tab = modelo.tabs[TAB];
  if (tab === undefined) throw new CliError(`El tab "${TAB}" no esta en el modelo de columnas.`);

  const session = await getSheetsSession();
  const gateway = createGoogleWriteGateway(session);

  const out = process.stdout;
  out.write(`Documento: ${session.config.spreadsheetId}\n`);
  out.write(`Tab: ${tab.sheetTitle} (fila de encabezados ${tab.headerRow ?? "ninguna"})\n`);
  out.write(`Dataset: ${data} (${registros.length} registros)\n`);
  out.write(ensayo ? "Modo: ENSAYO. No se escribe nada.\n\n" : "Modo: CARGA REAL.\n\n");

  const resumen = await upsertRows(gateway, tab, registros, {
    dryRun: ensayo,
    omitirCamposAusentes: true,
  });

  if (resumen.duplicadosEnDataset.length > 0) {
    out.write(`Claves repetidas dentro del dataset: ${resumen.duplicadosEnDataset.length}. Gana la ultima.\n\n`);
  }

  // Este bloque es CONTRATO con el verify del plan, que captura la salida de la segunda carga y
  // comprueba `insertadas: 0`. Cambiar el formato obliga a actualizar ese criterio en el mismo
  // commit.
  out.write(`actualizadas: ${resumen.actualizadas}\n`);
  out.write(`insertadas: ${resumen.insertadas}\n`);
  out.write(`columnas agregadas: ${resumen.columnasAgregadas}\n`);
  out.write(`llamadas de red: ${resumen.llamadasDeRed}\n`);

  if (ensayo) out.write(`\nEsto fue un ENSAYO. Para cargar de verdad, repetir con --yes.\n`);
  return 0;
}

ejecutar(main);
