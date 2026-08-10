/**
 * sheet:push — Upsert idempotente del dataset sobre un tab del Sheet del cliente.
 *
 * Lee la fila de encabezados que declara `data/sheet-columns.json` para ese tab, nunca la
 * fila 1: en este documento no hay un solo tab cuyos encabezados esten ahi.
 *
 * Algoritmo de leer, diferenciar y escribir. Agregar al final duplica y SHEET-06 lo prohibe.
 * Escribe con valores literales, no interpretados: un CPC de 0.35 se vuelve fecha segun la
 * configuracion regional del documento.
 *
 * Las dos operaciones destructivas corren en modo ensayo salvo que se confirmen, y el borrado
 * de columnas ademas exige que el escaneo de referencias salga limpio.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { flagBool, flagString, type Flags } from "../cli.js";
import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { getSheetsSession } from "../sheets/client.js";
import { loadSheetModel } from "../sheets/schema.js";
import {
  createGoogleWriteGateway,
  deleteDeadColumns,
  deleteResidualRows,
  readFieldPath,
  upsertRows,
} from "../sheets/upsert.js";

const DEFAULT_TAB = "Keyword Research";

/** Cuantos residuos se listan antes de resumir. Cinco mil lineas no las lee nadie. */
const MUESTRA_RESIDUOS = 20;

function resolveDataPath(candidate: string): string {
  if (path.isAbsolute(candidate)) return candidate;
  return path.resolve(SEO_TOOLS_ROOT, candidate);
}

async function readJsonl(filePath: string): Promise<Record<string, unknown>[]> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer el archivo de datos.\n  Ruta: ${filePath}\n` +
        `  Accion: verificar la bandera --data. Las rutas relativas se resuelven contra seo-tools/.`,
    );
  }

  const records: Record<string, unknown>[] = [];
  raw.split("\n").forEach((line, i) => {
    const text = line.trim();
    if (text === "") return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new CliError(`El archivo de datos tiene una linea que no es JSON valido.\n  Linea ${i + 1}: ${filePath}`);
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new CliError(`La linea ${i + 1} de ${filePath} no es un objeto.`);
    }
    records.push(parsed as Record<string, unknown>);
  });

  return records;
}

function usage(): string {
  return [
    "Uso: npm run cli -- sheet:push --data <archivo.jsonl> [banderas]",
    "",
    "  --tab <nombre>            Tab de destino. Por defecto, Keyword Research.",
    "  --data <ruta>             Archivo JSONL con el dataset. Relativo a seo-tools/.",
    "  --add-missing-columns     Agrega a la derecha los encabezados declarados que falten.",
    "  --dry-run                 Calcula y reporta, sin escribir nada.",
    "  --prune                   Elimina las filas residuales del tab.",
    "  --prune-columns           Elimina las columnas muertas de la plantilla.",
    "  --yes                     Confirma las dos operaciones destructivas de arriba.",
    "",
    "Sin --yes, --prune y --prune-columns corren en modo ensayo: listan y no borran.",
    "El borrado de columnas ademas aborta si alguna esta referenciada por una formula o un",
    "formato condicional. Esa puerta no tiene bandera que la saltee.",
    "",
  ].join("\n");
}

export async function run(flags: Flags): Promise<number> {
  if (flagBool(flags, "help")) {
    process.stdout.write(usage());
    return 0;
  }

  const tabTitle = flagString(flags, "tab") ?? DEFAULT_TAB;
  const dataFlag = flagString(flags, "data") ?? flags.positionals[0];
  if (dataFlag === undefined) {
    process.stderr.write(`Falta el archivo de datos.\n\n${usage()}`);
    return 2;
  }

  const dryRun = flagBool(flags, "dry-run");
  const confirmado = flagBool(flags, "yes") && !dryRun;
  const podarFilas = flagBool(flags, "prune");
  const podarColumnas = flagBool(flags, "prune-columns");

  const model = await loadSheetModel();
  const tab = model.tabs[tabTitle];
  if (tab === undefined) {
    throw new CliError(
      `El tab "${tabTitle}" no esta en el modelo de columnas.\n` +
        `  Declarados: ${Object.keys(model.tabs).map((t) => JSON.stringify(t)).join(", ")}\n` +
        `  Ojo: el nombre del tab no es el texto del banner de la fila 1.`,
    );
  }

  const dataPath = resolveDataPath(dataFlag);
  const records = await readJsonl(dataPath);

  const session = await getSheetsSession();
  const gateway = createGoogleWriteGateway(session);

  console.log(`Documento: ${session.config.spreadsheetId}`);
  console.log(`Tab: ${tab.sheetTitle} (fila de encabezados ${tab.headerRow ?? "ninguna"})`);
  console.log(`Dataset: ${dataPath} (${records.length} registros)`);
  if (dryRun) console.log("Modo ensayo: no se escribe nada.");
  console.log("");

  let llamadas = 0;
  let columnasEliminadas = 0;
  let residualesDetectadas = 0;
  let filasEliminadas = 0;

  // 1. Columnas muertas primero: borrarlas corre los indices, asi que conviene dejar la tabla
  // en su forma final antes de resolver el mapeo para escribir.
  if (podarColumnas) {
    const report = await deleteDeadColumns(gateway, tab, { dryRun: !confirmado });
    llamadas += report.llamadasDeRed;

    if (report.abortado) {
      console.log("=".repeat(72));
      console.log("BORRADO DE COLUMNAS ABORTADO: hay referencias.");
      console.log("=".repeat(72));
      for (const resultado of report.escaneo) {
        if (resultado.safeToDelete) continue;
        console.log(`  ${JSON.stringify(resultado.target.header)} (columna ${resultado.target.letter}):`);
        for (const ref of resultado.references) {
          console.log(`    [${ref.kind}] ${ref.where} :: ${ref.text}`);
        }
      }
      console.log("");
      console.log("No se elimino ninguna columna y no hay bandera que permita forzarlo.");
      return 1;
    }

    if (confirmado) {
      columnasEliminadas = report.eliminadas.length;
      console.log(`Columnas eliminadas: ${report.eliminadas.join(", ") || "(ninguna)"}`);
    } else if (report.planeadas.length > 0) {
      console.log(`Ensayo. Columnas que se eliminarian: ${report.planeadas.join(", ")}`);
      console.log("  Escaneo de referencias limpio. Volver a correr con --yes para ejecutarlo.");
    }
    console.log("");
  }

  // 2. Filas residuales, tambien antes del upsert: asi las inserciones caen en posiciones
  // deterministas en lugar de mezclarse con relleno de plantilla.
  if (podarFilas) {
    const deseadas = records
      .map((r) => readFieldPath(r, tab.keyField ?? "keyword"))
      .map((v) => (typeof v === "string" ? v : String(v ?? "")));

    const report = await deleteResidualRows(gateway, tab, deseadas, { dryRun: !confirmado });
    llamadas += report.llamadasDeRed;
    residualesDetectadas = report.filas.length;
    filasEliminadas = report.eliminadas;

    if (report.filas.length > 0) {
      console.log(`${confirmado ? "Filas eliminadas" : "Ensayo. Filas que se eliminarian"}: ${report.filas.length}`);
      for (const fila of report.filas.slice(0, MUESTRA_RESIDUOS)) {
        const motivo = fila.clave === "" ? "sin clave" : `clave "${fila.clave}" fuera del conjunto`;
        console.log(`  fila ${fila.fila} (${motivo}): ${fila.muestra || "(solo formato)"}`);
      }
      if (report.filas.length > MUESTRA_RESIDUOS) {
        console.log(`  ... y ${report.filas.length - MUESTRA_RESIDUOS} mas`);
      }
      if (!confirmado) console.log("  Volver a correr con --yes para ejecutarlo.");
    } else {
      console.log("Sin filas residuales.");
    }
    console.log("");
  }

  // 3. El upsert.
  const summary = await upsertRows(gateway, tab, records, {
    addMissingColumns: flagBool(flags, "add-missing-columns"),
    dryRun,
  });
  llamadas += summary.llamadasDeRed;

  if (summary.duplicadosPreexistentes.length > 0) {
    console.log(`Duplicados preexistentes en el tab: ${summary.duplicadosPreexistentes.length}`);
    for (const dup of summary.duplicadosPreexistentes.slice(0, MUESTRA_RESIDUOS)) {
      console.log(`  "${dup.clave}" en las filas ${dup.filas.join(", ")}`);
    }
    console.log("");
  }
  if (summary.duplicadosEnDataset.length > 0) {
    console.log(
      `Claves repetidas dentro del dataset: ${summary.duplicadosEnDataset.length}. Gana la ultima.`,
    );
    console.log("");
  }

  // El formato de este bloque es CONTRATO, no cosmetica: el plan 04 verifica la idempotencia
  // de SHEET-06 capturando esta salida y comprobando `insertadas: 0` en la segunda carga.
  // Cualquier cambio obliga a actualizar ese criterio en el mismo commit.
  console.log(`actualizadas: ${summary.actualizadas}`);
  console.log(`insertadas: ${summary.insertadas}`);
  console.log(`residuales: ${residualesDetectadas}`);
  console.log(`filas eliminadas: ${filasEliminadas}`);
  console.log(`columnas agregadas: ${summary.columnasAgregadas}`);
  console.log(`columnas eliminadas: ${columnasEliminadas}`);
  console.log(`llamadas de red: ${llamadas}`);

  return 0;
}
