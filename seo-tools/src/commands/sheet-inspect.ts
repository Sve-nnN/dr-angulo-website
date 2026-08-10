/**
 * sheet:inspect — verifica el acceso al Sheet del cliente y vuelca su estructura real.
 *
 * Ya no descubre, VERIFICA. El reconocimiento del 2026-08-10 se hizo en vivo y esta en
 * .planning/workstreams/seo-keywords/data/sheet-recon-2026-08-10.md. El valor de este
 * comando es doble: cerrar la mitad de escritura de INFRA-01, que el reconocimiento no
 * cubrio porque se levanto con scope de solo lectura, y detectar si alguien movio el
 * documento entre aquel dia y hoy.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Flags } from "../cli.js";
import { CliError, PLANNING_DATA_DIR } from "../config.js";
import {
  columnLetter,
  describeSheetsError,
  getSheetsSession,
  quoteTab,
  type SheetsSession,
} from "../sheets/client.js";

/** Cuantas filas del principio de cada tab se leen para buscar la fila de encabezados. */
const HEADER_BLOCK_ROWS = 5;

/** Minimo de celdas ocupadas para que una fila pueda ser encabezado. */
const MIN_HEADER_CELLS = 3;

/**
 * Densidad minima entre la primera y la ultima celda ocupada de la fila.
 *
 * Es lo que separa un encabezado real de la fila 2 de `Competitor Analysis`, que tiene cinco
 * celdas ocupadas repartidas a lo ancho de diecisiete columnas (densidad 0.29) porque ahi los
 * competidores van a lo ancho. Un encabezado de verdad es un bloque contiguo: los cuatro tabs
 * en alcance dan densidad 1.0. El umbral deja margen para un hueco ocasional.
 */
const MIN_HEADER_DENSITY = 0.6;

/** Filas de la columna A que se leen para decidir si un tab sin encabezados esta transpuesto. */
const ORIENTATION_PROBE_ROWS = 12;

/**
 * Reconocimiento del 2026-08-10. No es configuracion: es la referencia contra la que se
 * reporta deriva. Si esto deja de coincidir, alguien movio el documento y el mapeo del
 * plan 12-02 hay que revisarlo con Juan antes de escribir una sola celda.
 */
const RECON = {
  filas: {
    "Keyword Research": { headerRow: 3, columns: 18 },
    "Content Model": { headerRow: 3, columns: 19 },
    "Canonical Audit": { headerRow: 2, columns: 6 },
    "Internal Linking Audit": { headerRow: 2, columns: 31 },
  } as Record<string, { headerRow: number; columns: number }>,
  transpuestos: ["Competitor Analysis"],
} as const;

type Orientation = "filas" | "columnas" | "indeterminada";

interface TabReport {
  sheetId: number | null;
  title: string;
  index: number | null;
  rowCount: number | null;
  columnCount: number | null;
  /** Fila de encabezados en numeracion de Sheet, base 1. null si el tab no tiene. */
  headerRow: number | null;
  /** Celdas ocupadas en esa fila. Hace auditable la eleccion en vez de magia. */
  headerCellCount: number;
  orientation: Orientation;
  /** Encabezados TAL CUAL, con espacios finales incluidos. Normalizar es tarea del plan 02. */
  headers: string[];
}

interface WriteProbeReport {
  ok: boolean;
  range: string | null;
  error: string | null;
}

interface InspectionReport {
  spreadsheetId: string;
  title: string;
  inspectedAt: string;
  writeProbe: WriteProbeReport;
  tabs: TabReport[];
}

interface HeaderPick {
  headerRow: number | null;
  headerCellCount: number;
  headers: string[];
}

function asText(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  return typeof cell === "string" ? cell : String(cell);
}

/**
 * Elige la fila de encabezados dentro del bloque leido.
 *
 * La fila 1 de cada tab es un banner decorativo con el nombre del tab en la columna B, asi
 * que un lector que asuma la fila 1 no encuentra ni una columna en ningun tab. La fila real
 * es la 3 en dos tabs y la 2 en otros dos.
 */
function pickHeaderRow(block: unknown[][]): HeaderPick {
  const limit = Math.min(HEADER_BLOCK_ROWS, block.length);

  for (let i = 0; i < limit; i += 1) {
    const row = (block[i] ?? []).map(asText);

    const occupied: number[] = [];
    row.forEach((cell, idx) => {
      if (cell.trim() !== "") occupied.push(idx);
    });

    if (occupied.length < MIN_HEADER_CELLS) continue;

    const first = occupied[0] as number;
    const last = occupied[occupied.length - 1] as number;
    const span = last - first + 1;
    if (occupied.length / span < MIN_HEADER_DENSITY) continue;

    return {
      headerRow: i + 1,
      headerCellCount: occupied.length,
      // Hasta la ultima celda ocupada, sin recortar: los espacios finales son dato real.
      headers: row.slice(0, last + 1),
    };
  }

  return { headerRow: null, headerCellCount: 0, headers: [] };
}

async function readHeaderBlocks(
  session: SheetsSession,
  titles: string[],
): Promise<Map<string, unknown[][]>> {
  const ranges = titles.map((t) => `${quoteTab(t)}!1:${HEADER_BLOCK_ROWS}`);
  const res = await session.sheets.spreadsheets.values.batchGet({
    spreadsheetId: session.config.spreadsheetId,
    ranges,
    majorDimension: "ROWS",
  });

  const out = new Map<string, unknown[][]>();
  const valueRanges = res.data.valueRanges ?? [];
  titles.forEach((title, i) => {
    out.set(title, (valueRanges[i]?.values ?? []) as unknown[][]);
  });
  return out;
}

/**
 * Decide la orientacion de los tabs sin fila de encabezados.
 *
 * `Competitor Analysis` esta transpuesto: los competidores van a lo ancho y las metricas a
 * lo alto, con las etiquetas corriendo por la columna A. Un tab vacio, en cambio, no tiene
 * etiquetas en ningun lado y queda como indeterminado en vez de fingir una orientacion.
 */
async function probeOrientation(
  session: SheetsSession,
  titles: string[],
): Promise<Map<string, Orientation>> {
  const out = new Map<string, Orientation>();
  if (titles.length === 0) return out;

  const ranges = titles.map((t) => `${quoteTab(t)}!A1:A${ORIENTATION_PROBE_ROWS}`);
  const res = await session.sheets.spreadsheets.values.batchGet({
    spreadsheetId: session.config.spreadsheetId,
    ranges,
    majorDimension: "COLUMNS",
  });

  const valueRanges = res.data.valueRanges ?? [];
  titles.forEach((title, i) => {
    const column = ((valueRanges[i]?.values ?? [])[0] ?? []) as unknown[];
    const labels = column.map(asText).filter((c) => c.trim() !== "").length;
    out.set(title, labels >= 2 ? "columnas" : "indeterminada");
  });
  return out;
}

/**
 * Round trip de escritura sobre una celda de descarte. Es la mitad de INFRA-01 que el
 * reconocimiento del 2026-08-10 dejo sin verificar a proposito.
 *
 * Se elige la esquina inferior derecha de la grilla del primer tab y se comprueba que este
 * vacia antes de tocarla: escribir sobre un dato del cliente, aunque se limpie despues, no
 * es aceptable. Se escribe una marca de tiempo y se limpia el mismo rango de inmediato.
 */
async function writeProbe(session: SheetsSession, first: TabReport): Promise<WriteProbeReport> {
  const { spreadsheetId } = session.config;

  if (first.rowCount === null || first.columnCount === null) {
    return { ok: false, range: null, error: "El primer tab no reporto dimensiones de grilla." };
  }

  const candidates = [
    { row: first.rowCount, col: first.columnCount },
    { row: first.rowCount - 1, col: first.columnCount },
    { row: first.rowCount, col: first.columnCount - 1 },
  ].filter((c) => c.row >= 1 && c.col >= 1);

  const tab = quoteTab(first.title);

  for (const candidate of candidates) {
    const cell = `${columnLetter(candidate.col)}${candidate.row}`;
    const range = `${tab}!${cell}`;

    try {
      const current = await session.sheets.spreadsheets.values.get({ spreadsheetId, range });
      const occupied = asText((current.data.values ?? [])[0]?.[0]).trim() !== "";
      if (occupied) continue;

      await session.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: { values: [[`seo-tools write probe ${new Date().toISOString()}`]] },
      });

      await session.sheets.spreadsheets.values.clear({ spreadsheetId, range, requestBody: {} });

      return { ok: true, range, error: null };
    } catch (error) {
      const described = describeSheetsError(error, spreadsheetId);
      const isForbidden = described.includes("403");
      return {
        ok: false,
        range,
        error: isForbidden
          ? "La service account puede leer pero no escribir: esta compartida como Lectora y INFRA-01 " +
            "necesita rol Editor.\n" +
            described
          : described,
      };
    }
  }

  return {
    ok: false,
    range: null,
    error: "No se encontro ninguna celda de descarte vacia en la esquina del primer tab.",
  };
}

function reportDrift(tabs: TabReport[]): string[] {
  const byTitle = new Map(tabs.map((t) => [t.title, t]));
  const drift: string[] = [];

  for (const [title, expected] of Object.entries(RECON.filas)) {
    const tab = byTitle.get(title);
    if (tab === undefined) {
      drift.push(`${title}: el tab ya no existe en el documento`);
      continue;
    }
    if (tab.headerRow !== expected.headerRow) {
      drift.push(`${title}: fila de encabezados ${tab.headerRow ?? "ninguna"}, esperada ${expected.headerRow}`);
    }
    if (tab.headers.length !== expected.columns) {
      drift.push(`${title}: ${tab.headers.length} columnas, esperadas ${expected.columns}`);
    }
  }

  for (const title of RECON.transpuestos) {
    const tab = byTitle.get(title);
    if (tab === undefined) {
      drift.push(`${title}: el tab ya no existe en el documento`);
      continue;
    }
    if (tab.orientation !== "columnas") {
      drift.push(`${title}: orientacion ${tab.orientation}, esperada columnas`);
    }
  }

  return drift;
}

export async function run(_flags: Flags): Promise<number> {
  const session = await getSheetsSession();
  const { spreadsheetId } = session.config;

  let meta;
  try {
    meta = await session.sheets.spreadsheets.get({
      spreadsheetId,
      fields:
        "spreadsheetId,properties.title," +
        "sheets.properties(sheetId,title,index,gridProperties(rowCount,columnCount))",
    });
  } catch (error) {
    throw new CliError(describeSheetsError(error, spreadsheetId));
  }

  const title = meta.data.properties?.title ?? "(sin titulo)";
  const rawTabs = (meta.data.sheets ?? []).map((s) => s.properties ?? {});
  const titles = rawTabs.map((p) => p.title ?? "").filter((t) => t !== "");

  console.log(`Documento: ${title}`);
  console.log(`Identificador: ${spreadsheetId}`);
  console.log(`Tabs: ${titles.length}`);
  console.log("");

  const blocks = await readHeaderBlocks(session, titles);

  const tabs: TabReport[] = rawTabs.map((props) => {
    const tabTitle = props.title ?? "";
    const pick = pickHeaderRow(blocks.get(tabTitle) ?? []);
    return {
      sheetId: props.sheetId ?? null,
      title: tabTitle,
      index: props.index ?? null,
      rowCount: props.gridProperties?.rowCount ?? null,
      columnCount: props.gridProperties?.columnCount ?? null,
      headerRow: pick.headerRow,
      headerCellCount: pick.headerCellCount,
      orientation: pick.headerRow === null ? "indeterminada" : "filas",
      headers: pick.headers,
    };
  });

  const sinEncabezados = tabs.filter((t) => t.headerRow === null).map((t) => t.title);
  const orientations = await probeOrientation(session, sinEncabezados);
  for (const tab of tabs) {
    if (tab.headerRow === null) {
      tab.orientation = orientations.get(tab.title) ?? "indeterminada";
    }
  }

  for (const tab of tabs) {
    const where =
      tab.headerRow === null
        ? `sin fila de encabezados, orientacion ${tab.orientation}`
        : `fila ${tab.headerRow}, ${tab.headerCellCount} celdas ocupadas`;
    console.log(`${tab.title} (sheetId=${tab.sheetId}, ${tab.rowCount}x${tab.columnCount}) -> ${where}`);
    if (tab.headers.length > 0) {
      console.log(tab.headers.map((h, i) => `  [${i}] ${JSON.stringify(h)}`).join("\n"));
    }
  }

  const firstTab = tabs[0];
  if (firstTab === undefined) {
    throw new CliError("El documento no reporto ningun tab.");
  }

  console.log("");
  const probe = await writeProbe(session, firstTab);
  if (probe.ok) {
    console.log(`Prueba de escritura: OK sobre ${probe.range} (escrita y limpiada).`);
  } else {
    console.log(`Prueba de escritura: FALLO. ${probe.error ?? ""}`);
  }

  const report: InspectionReport = {
    spreadsheetId,
    title,
    inspectedAt: new Date().toISOString(),
    writeProbe: probe,
    tabs,
  };

  const outPath = path.join(PLANNING_DATA_DIR, "sheet-headers.json");
  await mkdir(PLANNING_DATA_DIR, { recursive: true });
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Volcado escrito en ${outPath}`);

  const drift = reportDrift(tabs);
  console.log("");
  if (drift.length > 0) {
    console.log("=".repeat(72));
    console.log("DIFF contra el reconocimiento del 2026-08-10");
    console.log("Alguien movio el documento. Revisar el mapeo del plan 12-02 con Juan ANTES de escribir.");
    console.log("=".repeat(72));
    for (const line of drift) console.log(`  - ${line}`);
  } else {
    console.log("Sin deriva contra el reconocimiento del 2026-08-10: el alcance esta intacto.");
  }

  // La deriva se reporta, no bloquea. El unico fallo duro de este comando es no poder escribir.
  return probe.ok ? 0 : 1;
}
