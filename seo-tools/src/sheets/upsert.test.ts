/**
 * Pruebas del escritor idempotente.
 *
 * La doble del cliente es una grilla en memoria de verdad: acepta escrituras, las guarda y las
 * devuelve al leer. Sin eso la prueba de idempotencia, que es la mas importante del plan, no
 * probaria nada. Ni credenciales ni red.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import type {
  ColumnModel,
  ConditionalFormatEntry,
  TabMetadata,
  TabModel,
} from "./schema.js";
import {
  columnRuns,
  contiguousBlocks,
  deleteDeadColumns,
  deleteResidualRows,
  readFieldPath,
  sanitizeCell,
  upsertRows,
  type CellValue,
  type DeleteBlock,
  type ValueUpdate,
  type WriteGateway,
} from "./upsert.js";

// ---------------------------------------------------------------------------
// Doble del cliente: una grilla en memoria
// ---------------------------------------------------------------------------

interface FakeSheet {
  title: string;
  sheetId: number;
  /** rows[0] es la fila 1 del documento. */
  rows: CellValue[][];
  rowCount: number;
  columnCount: number;
  formulas?: string[][];
}

interface FakeCalls {
  fetchTabs: number;
  readRow: number;
  readColumn: number;
  readRegion: number;
  writeValues: number;
  growGrid: number;
  deleteRows: number;
  deleteColumns: number;
  readFormulas: number;
  readConditionalFormats: number;
}

interface Fake extends WriteGateway {
  readonly sheets: FakeSheet[];
  readonly calls: FakeCalls;
  readonly deleteRowBlocks: DeleteBlock[][];
  readonly deleteColumnBlocks: DeleteBlock[][];
  readonly valueInputOptions: string[];
  readonly writtenUpdates: ValueUpdate[][];
  cell(title: string, a1: string): CellValue;
  occupiedRows(title: string): number;
}

function letterToIndex(letter: string): number {
  let n = 0;
  for (const ch of letter) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Parsea `'Tab'!D4:F503` y devuelve el origen en indices base cero. */
function parseRange(range: string): { title: string; col: number; row: number } {
  const bang = range.lastIndexOf("!");
  const rawTitle = range.slice(0, bang);
  const title = rawTitle.startsWith("'")
    ? rawTitle.slice(1, -1).replace(/''/g, "'")
    : rawTitle;
  const start = (range.slice(bang + 1).split(":")[0] ?? "") as string;
  const m = /^([A-Z]+)(\d+)$/.exec(start);
  if (m === null) throw new Error(`rango no reconocido: ${range}`);
  return { title, col: letterToIndex(m[1] as string), row: Number(m[2]) - 1 };
}

/** Sheets devuelve el texto SIN el apostrofo inicial: ese apostrofo es formato, no contenido. */
function asRead(value: CellValue): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "string" ? value : String(value);
  return text.startsWith("'") ? text.slice(1) : text;
}

function fakeGateway(sheets: FakeSheet[]): Fake {
  const calls: FakeCalls = {
    fetchTabs: 0,
    readRow: 0,
    readColumn: 0,
    readRegion: 0,
    writeValues: 0,
    growGrid: 0,
    deleteRows: 0,
    deleteColumns: 0,
    readFormulas: 0,
    readConditionalFormats: 0,
  };
  const deleteRowBlocks: DeleteBlock[][] = [];
  const deleteColumnBlocks: DeleteBlock[][] = [];
  const valueInputOptions: string[] = [];
  const writtenUpdates: ValueUpdate[][] = [];

  const find = (title: string): FakeSheet => {
    const sheet = sheets.find((s) => s.title === title);
    if (sheet === undefined) throw new Error(`la doble no tiene el tab ${title}`);
    return sheet;
  };
  const byId = (sheetId: number): FakeSheet => {
    const sheet = sheets.find((s) => s.sheetId === sheetId);
    if (sheet === undefined) throw new Error(`la doble no tiene el sheetId ${sheetId}`);
    return sheet;
  };
  const ensureRow = (sheet: FakeSheet, row: number): CellValue[] => {
    while (sheet.rows.length <= row) sheet.rows.push([]);
    return sheet.rows[row] as CellValue[];
  };

  return {
    sheets,
    calls,
    deleteRowBlocks,
    deleteColumnBlocks,
    valueInputOptions,
    writtenUpdates,

    cell(title, a1) {
      const { col, row } = parseRange(`'${title}'!${a1}`);
      return (find(title).rows[row] ?? [])[col] ?? null;
    },
    occupiedRows(title) {
      return find(title).rows.filter((r) => (r ?? []).some((c) => asRead(c ?? null).trim() !== ""))
        .length;
    },

    async fetchTabs(): Promise<TabMetadata[]> {
      calls.fetchTabs += 1;
      return sheets.map((s, i) => ({
        sheetId: s.sheetId,
        title: s.title,
        index: i,
        rowCount: s.rowCount,
        columnCount: s.columnCount,
      }));
    },

    async readRow(title, row) {
      calls.readRow += 1;
      return (find(title).rows[row - 1] ?? []).map(asRead);
    },

    async readFormulas(titles) {
      calls.readFormulas += 1;
      const out = new Map<string, string[][]>();
      for (const t of titles) out.set(t, find(t).formulas ?? []);
      return out;
    },

    async readConditionalFormats(): Promise<ConditionalFormatEntry[]> {
      calls.readConditionalFormats += 1;
      return [];
    },

    async readColumn(title, letter, fromRow) {
      calls.readColumn += 1;
      const sheet = find(title);
      const col = letterToIndex(letter);
      const out: string[] = [];
      for (let r = fromRow - 1; r < sheet.rowCount; r += 1) {
        out.push(asRead((sheet.rows[r] ?? [])[col] ?? null));
      }
      return out;
    },

    async readRegion(title, fromRow, lastColumn) {
      calls.readRegion += 1;
      const sheet = find(title);
      const width = letterToIndex(lastColumn) + 1;
      const out: string[][] = [];
      for (let r = fromRow - 1; r < sheet.rowCount; r += 1) {
        const row = sheet.rows[r] ?? [];
        out.push(Array.from({ length: width }, (_, c) => asRead(row[c] ?? null)));
      }
      return out;
    },

    async growGrid(sheetId, extraRows) {
      calls.growGrid += 1;
      byId(sheetId).rowCount += extraRows;
    },

    async writeValues(updates, valueInputOption) {
      calls.writeValues += 1;
      valueInputOptions.push(valueInputOption);
      writtenUpdates.push([...updates]);
      for (const update of updates) {
        const { title, col, row } = parseRange(update.range);
        const sheet = find(title);
        update.values.forEach((values, dr) => {
          const target = ensureRow(sheet, row + dr);
          values.forEach((value, dc) => {
            target[col + dc] = value;
          });
        });
        sheet.rowCount = Math.max(sheet.rowCount, sheet.rows.length);
      }
    },

    async deleteRows(sheetId, blocks) {
      calls.deleteRows += 1;
      deleteRowBlocks.push([...blocks]);
      const sheet = byId(sheetId);
      for (const block of blocks) {
        sheet.rows.splice(block.startIndex, block.endIndex - block.startIndex);
        sheet.rowCount -= block.endIndex - block.startIndex;
      }
    },

    async deleteColumns(sheetId, blocks) {
      calls.deleteColumns += 1;
      deleteColumnBlocks.push([...blocks]);
      const sheet = byId(sheetId);
      for (const block of blocks) {
        for (const row of sheet.rows) row.splice(block.startIndex, block.endIndex - block.startIndex);
        sheet.columnCount -= block.endIndex - block.startIndex;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Modelo de prueba
// ---------------------------------------------------------------------------

function col(
  header: string,
  field: string | null,
  status: ColumnModel["status"],
  extra: Partial<ColumnModel> = {},
): ColumnModel {
  return { header, field, status, ...extra };
}

/**
 * Siete encabezados reales, A a G, mas una columna nueva que cae en H.
 * Las columnas propias quedan salteadas a proposito: A, C, D, E y H. Lo que hay en el medio,
 * `Cluster` y `Notes`, es de otras fases y no se puede pisar.
 */
function tabModel(): TabModel {
  return {
    sheetTitle: "Keyword Research",
    sheetId: 407,
    headerRow: 3,
    orientation: "filas",
    mapBy: "nombre",
    keyField: "keyword",
    keyHeader: "Suggested Keyword",
    columns: [
      col("Suggested Keyword", "keyword", "fase-12", { source: "keyword" }),
      col("Cluster", null, "fase-13"),
      col("Search Volume", "volume", "fase-12", { source: "metricas.searchVolume" }),
      col("Traffic Potential", null, "no-consultado", { literal: "no_consultado" }),
      col("Search Intent ", "intent", "fase-12", { source: "intent" }),
      col("CVR", null, "eliminar"),
      col("Notes", null, "sin-uso"),
      col("CPC", "cpc", "nueva", { source: "metricas.cpc" }),
    ],
  };
}

const HEADERS: CellValue[] = [
  "Suggested Keyword",
  "Cluster",
  "Search Volume",
  "Traffic Potential",
  "Search Intent ",
  "CVR",
  "Notes",
];

function fakeDoc(extraRows: CellValue[][] = []): Fake {
  return fakeGateway([
    {
      title: "Keyword Research",
      sheetId: 407,
      rows: [["", " Keyword Research "], [], [...HEADERS], ...extraRows],
      rowCount: Math.max(20, 3 + extraRows.length),
      columnCount: 30,
    },
  ]);
}

interface Record_ {
  keyword: string;
  intent?: string;
  metricas?: { searchVolume?: number; cpc?: number };
}

function rec(keyword: string, volume: number, intent: string, cpc = 0.5): Record_ {
  return { keyword, intent, metricas: { searchVolume: volume, cpc } };
}

const OPTS = { addMissingColumns: true } as const;

// ---------------------------------------------------------------------------
// Comportamiento 1: las filas nuevas van despues de la ultima ocupada
// ---------------------------------------------------------------------------

test("comportamiento 1: se inserta desde la fila siguiente a la de encabezados, no desde la 1", async () => {
  const gw = fakeDoc();
  const summary = await upsertRows(gw, tabModel(), [rec("hernia discal", 320, "informacional")], OPTS);

  assert.equal(summary.insertadas, 1);
  assert.equal(summary.actualizadas, 0);
  // Encabezados en la fila 3, asi que la primera fila de datos es la 4.
  assert.equal(gw.cell("Keyword Research", "A4"), "hernia discal");
  // Y ni el banner ni los encabezados se tocaron.
  assert.equal(gw.cell("Keyword Research", "B1"), " Keyword Research ");
  assert.equal(gw.cell("Keyword Research", "A3"), "Suggested Keyword");
});

test("acceptance: con fila de encabezados 3 la primera fila de datos es la 4, indice base cero 3", async () => {
  const gw = fakeDoc();
  const summary = await upsertRows(gw, tabModel(), [rec("lumbalgia", 90, "informacional")], OPTS);
  assert.equal(summary.primeraFilaDeDatos, 4);
  assert.equal(summary.primeraFilaDeDatosIndice, 3);
});

test("comportamiento 1 bis: con filas ya cargadas se inserta despues de la ultima ocupada", async () => {
  const gw = fakeDoc([["ya estaba", "", 10, "no_consultado", "informacional", "", ""]]);
  await upsertRows(gw, tabModel(), [rec("nueva keyword", 5, "comercial")], OPTS);

  assert.equal(gw.cell("Keyword Research", "A4"), "ya estaba");
  assert.equal(gw.cell("Keyword Research", "A5"), "nueva keyword");
});

// ---------------------------------------------------------------------------
// Comportamiento 2: idempotencia. La prueba estrella de SHEET-06
// ---------------------------------------------------------------------------

test("comportamiento 2: la segunda carga del mismo conjunto no inserta ni una fila", async () => {
  const gw = fakeDoc();
  const datos = [
    rec("hernia discal lima", 320, "comercial"),
    rec("escoliosis en niños", 140, "informacional"),
    rec("cirugía de columna", 50, "transaccional"),
  ];

  const primera = await upsertRows(gw, tabModel(), datos, OPTS);
  assert.equal(primera.insertadas, 3);
  const filasTrasPrimera = gw.occupiedRows("Keyword Research");

  const segunda = await upsertRows(gw, tabModel(), datos, OPTS);

  // El criterio de SHEET-06, literal.
  assert.equal(segunda.insertadas, 0);
  assert.equal(segunda.actualizadas, 3);
  assert.equal(gw.occupiedRows("Keyword Research"), filasTrasPrimera);
  assert.equal(gw.cell("Keyword Research", "A4"), "hernia discal lima");
  assert.equal(gw.cell("Keyword Research", "A6"), "cirugía de columna");
  assert.equal(gw.cell("Keyword Research", "A7"), null);
});

// ---------------------------------------------------------------------------
// Comportamiento 3: una clave existente se actualiza en su posicion
// ---------------------------------------------------------------------------

test("comportamiento 3: una clave existente con valores distintos se actualiza donde esta", async () => {
  const gw = fakeDoc();
  await upsertRows(gw, tabModel(), [rec("hernia discal", 100, "informacional")], OPTS);
  const summary = await upsertRows(gw, tabModel(), [rec("hernia discal", 999, "comercial")], OPTS);

  assert.equal(summary.actualizadas, 1);
  assert.equal(summary.insertadas, 0);
  assert.equal(gw.cell("Keyword Research", "A4"), "hernia discal");
  assert.equal(gw.cell("Keyword Research", "C4"), 999);
  assert.equal(gw.cell("Keyword Research", "E4"), "comercial");
});

// ---------------------------------------------------------------------------
// Comportamiento 4 y 5: la clave normaliza, el valor visible no
// ---------------------------------------------------------------------------

test("comportamiento 4: la misma keyword con y sin tildes resuelve a la misma fila", async () => {
  const gw = fakeDoc();
  const summary = await upsertRows(
    gw,
    tabModel(),
    [rec("cirugía de columna", 50, "comercial"), rec("cirugia de columna", 70, "comercial")],
    OPTS,
  );

  assert.equal(summary.insertadas, 1);
  assert.equal(summary.duplicadosEnDataset.length, 1);
  assert.equal(gw.cell("Keyword Research", "A5"), null);
  // Gana la ultima, y su volumen es el que queda.
  assert.equal(gw.cell("Keyword Research", "C4"), 70);
});

test("comportamiento 5: el texto escrito conserva tildes y enie", async () => {
  const gw = fakeDoc();
  await upsertRows(gw, tabModel(), [rec("escoliosis en niños", 140, "informacional")], OPTS);

  // La normalizacion produce la clave, nunca el valor visible.
  assert.equal(gw.cell("Keyword Research", "A4"), "escoliosis en niños");
  assert.notEqual(gw.cell("Keyword Research", "A4"), "escoliosis en ninos");
});

// ---------------------------------------------------------------------------
// Comportamiento 6: nada se ejecuta como formula al abrir el documento
// ---------------------------------------------------------------------------

test("comportamiento 6: un valor que empieza con caracter de formula se escribe como texto", () => {
  assert.equal(sanitizeCell("=SUM(A1:A9)"), "'=SUM(A1:A9)");
  assert.equal(sanitizeCell("+lumbalgia"), "'+lumbalgia");
  assert.equal(sanitizeCell("-ciatica"), "'-ciatica");
  assert.equal(sanitizeCell("@doctor"), "'@doctor");
  // Lo que no empieza con esos cuatro no se toca.
  assert.equal(sanitizeCell("hernia discal"), "hernia discal");
  assert.equal(sanitizeCell("escoliosis en niños"), "escoliosis en niños");
});

test("comportamiento 6 bis: la defensa llega hasta la celda escrita", async () => {
  const gw = fakeDoc();
  await upsertRows(gw, tabModel(), [rec("=2+2 hernia", 10, "informacional")], OPTS);
  assert.equal(gw.cell("Keyword Research", "A4"), "'=2+2 hernia");
});

// ---------------------------------------------------------------------------
// Comportamiento 7: numeros como numeros y modo de entrada literal
// ---------------------------------------------------------------------------

test("comportamiento 7: los numeros viajan como numeros y el modo de entrada es literal", async () => {
  const gw = fakeDoc();
  await upsertRows(gw, tabModel(), [rec("cpc decimal", 1200, "comercial", 0.35)], OPTS);

  assert.equal(typeof gw.cell("Keyword Research", "C4"), "number");
  assert.equal(gw.cell("Keyword Research", "C4"), 1200);
  assert.equal(typeof gw.cell("Keyword Research", "H4"), "number");
  assert.equal(gw.cell("Keyword Research", "H4"), 0.35);

  // RAW y nunca el modo que simula tecleo humano: ese convierte 0.35 en fecha segun el locale.
  assert.ok(gw.valueInputOptions.length > 0);
  assert.deepEqual([...new Set(gw.valueInputOptions)], ["RAW"]);
});

test("sanitizeCell deja pasar numeros y convierte el resto a texto", () => {
  assert.equal(sanitizeCell(1200), 1200);
  assert.equal(sanitizeCell(0.35), 0.35);
  assert.equal(sanitizeCell(null), "");
  assert.equal(sanitizeCell(undefined), "");
  assert.equal(sanitizeCell(Number.NaN), "");
});

// ---------------------------------------------------------------------------
// Las columnas de otras fases no se pisan
// ---------------------------------------------------------------------------

test("las columnas de otras fases quedan intactas: solo se escriben las propias", async () => {
  const gw = fakeDoc([["hernia discal", "cluster-columna", 1, "x", "y", "z", "nota del cliente"]]);
  await upsertRows(gw, tabModel(), [rec("hernia discal", 500, "comercial")], OPTS);

  assert.equal(gw.cell("Keyword Research", "C4"), 500);
  // B es Cluster, de la fase 13. G es Notes, sin uso. F es CVR, a eliminar.
  assert.equal(gw.cell("Keyword Research", "B4"), "cluster-columna");
  assert.equal(gw.cell("Keyword Research", "G4"), "nota del cliente");
  assert.equal(gw.cell("Keyword Research", "F4"), "z");
});

test("el valor literal de no consultado se escribe donde corresponde", async () => {
  const gw = fakeDoc();
  await upsertRows(gw, tabModel(), [rec("hernia discal", 10, "informacional")], OPTS);
  assert.equal(gw.cell("Keyword Research", "D4"), "no_consultado");
});

// ---------------------------------------------------------------------------
// Comportamiento 12: duplicados preexistentes en el propio tab
// ---------------------------------------------------------------------------

test("comportamiento 12: dos filas con la misma clave ya en el tab se reportan", async () => {
  const gw = fakeDoc([
    ["hernia discal", "", 1, "", "", "", ""],
    ["Hernia  Discal", "", 2, "", "", "", ""],
  ]);
  const summary = await upsertRows(gw, tabModel(), [rec("hernia discal", 7, "comercial")], OPTS);

  assert.deepEqual(summary.duplicadosPreexistentes, [{ clave: "hernia discal", filas: [4, 5] }]);
  // Gana la primera aparicion y la segunda no se toca.
  assert.equal(gw.cell("Keyword Research", "C4"), 7);
  assert.equal(gw.cell("Keyword Research", "C5"), 2);
});

// ---------------------------------------------------------------------------
// Comportamientos 8 y 9: borrado de filas
// ---------------------------------------------------------------------------

function docConResiduos(): Fake {
  return fakeDoc([
    [], // fila 4 vacia
    ["", "", "", "", "Low", "", ""], // fila 5: intencion suelta, sin keyword
    ["", "", "", "", "", "", ""], // fila 6 vacia
    ["", "", "", "", "", "", "FALSE"], // fila 7: solo casilla
    ["", "", "", "", "", "", "FALSE"], // fila 8: solo casilla
    ["keyword vieja", "", 3, "", "", "", ""], // fila 9: clave que ya no esta en el conjunto
  ]);
}

test("comportamiento 8: en modo ensayo se listan los residuos y no se borra nada", async () => {
  const gw = docConResiduos();
  const report = await deleteResidualRows(gw, tabModel(), ["hernia discal"], { dryRun: true });

  assert.deepEqual(
    report.filas.map((f) => f.fila),
    [5, 7, 8, 9],
  );
  assert.equal(report.eliminadas, 0);
  assert.equal(gw.calls.deleteRows, 0);
  // Y el detalle dice por que cae cada una.
  assert.equal(report.filas.find((f) => f.fila === 9)?.clave, "keyword vieja");
  assert.equal(report.filas.find((f) => f.fila === 5)?.clave, "");
});

test("comportamiento 9: confirmado, se borra en bloques contiguos de mayor a menor", async () => {
  const gw = docConResiduos();
  const report = await deleteResidualRows(gw, tabModel(), ["hernia discal"], { dryRun: false });

  assert.equal(report.eliminadas, 4);
  assert.equal(gw.calls.deleteRows, 1);

  const bloques = gw.deleteRowBlocks[0] as DeleteBlock[];
  // Filas 5, 7, 8 y 9 son los indices base cero 4, 6, 7 y 8: dos bloques.
  assert.deepEqual(bloques, [
    { startIndex: 6, endIndex: 9 },
    { startIndex: 4, endIndex: 5 },
  ]);
});

test("acceptance: los bloques de borrado llegan ordenados de mayor a menor indice de inicio", () => {
  // Entrada desordenada a proposito.
  const bloques = contiguousBlocks([8, 4, 6, 7, 20, 21]);
  assert.deepEqual(bloques, [
    { startIndex: 20, endIndex: 22 },
    { startIndex: 6, endIndex: 9 },
    { startIndex: 4, endIndex: 5 },
  ]);

  const inicios = bloques.map((b) => b.startIndex);
  assert.deepEqual(inicios, [...inicios].sort((a, b) => b - a));
  assert.deepEqual(contiguousBlocks([]), []);
});

// ---------------------------------------------------------------------------
// Comportamientos 10 y 11: borrado guardado de columnas
// ---------------------------------------------------------------------------

function docParaColumnas(formulas?: string[][]): Fake {
  const gw = fakeDoc([["hernia discal", "", 1, "", "", "cvr viejo", "nota"]]);
  const sheet = gw.sheets[0] as FakeSheet;
  if (formulas !== undefined) sheet.formulas = formulas;
  return gw;
}

test("comportamiento 10: una sola referencia aborta el borrado y no se emite ninguna peticion", async () => {
  // Una formula del propio tab menciona la columna F, que es `CVR`.
  const gw = docParaColumnas([[], [], [], ["", "", "", "", "", "", "=F4*2"]]);

  const report = await deleteDeadColumns(gw, tabModel(), { dryRun: false });

  assert.equal(report.abortado, true);
  assert.equal(report.exitCode, 1);
  assert.equal(report.eliminadas.length, 0);
  assert.equal(gw.calls.deleteColumns, 0, "no se emitio ninguna peticion de eliminacion");

  const bloqueada = report.escaneo.find((r) => r.target.header === "CVR");
  assert.equal(bloqueada?.safeToDelete, false);
  assert.match(bloqueada?.references[0]?.text ?? "", /=F4\*2/);

  // Y la columna sigue ahi.
  assert.equal(gw.cell("Keyword Research", "F4"), "cvr viejo");
});

test("comportamiento 11: con el escaneo limpio se elimina de mayor a menor indice y se reporta", async () => {
  const modelo: TabModel = {
    ...tabModel(),
    columns: [
      col("Suggested Keyword", "keyword", "fase-12", { source: "keyword" }),
      col("Cluster", null, "eliminar"),
      col("Search Volume", "volume", "fase-12", { source: "metricas.searchVolume" }),
      col("Traffic Potential", null, "no-consultado", { literal: "no_consultado" }),
      col("Search Intent ", "intent", "fase-12", { source: "intent" }),
      col("CVR", null, "eliminar"),
      col("Notes", null, "sin-uso"),
    ],
  };
  const gw = docParaColumnas();

  const report = await deleteDeadColumns(gw, modelo, { dryRun: false });

  assert.equal(report.abortado, false);
  assert.equal(report.exitCode, 0);
  assert.deepEqual(report.eliminadas, ["CVR", "Cluster"]);
  assert.equal(gw.calls.deleteColumns, 1);

  // F es el indice 5 y B el 1: primero el mas alto, porque borrar corre lo que esta a la derecha.
  assert.deepEqual(gw.deleteColumnBlocks[0], [
    { startIndex: 5, endIndex: 6 },
    { startIndex: 1, endIndex: 2 },
  ]);
});

test("comportamiento 11 bis: en modo ensayo el borrado de columnas tampoco toca nada", async () => {
  const gw = docParaColumnas();
  const report = await deleteDeadColumns(gw, tabModel(), { dryRun: true });

  assert.equal(report.abortado, false);
  assert.deepEqual(report.eliminadas, []);
  assert.deepEqual(report.planeadas, ["CVR"]);
  assert.equal(gw.calls.deleteColumns, 0);
});

test("no hay bandera de fuerza: el escaneo es la unica puerta", async () => {
  const gw = docParaColumnas([[], [], [], ["", "", "", "", "", "", "=F4*2"]]);
  // Se pasa toda bandera imaginable y el resultado no cambia.
  const report = await deleteDeadColumns(gw, tabModel(), {
    dryRun: false,
    ...({ force: true, yes: true, skipScan: true } as Record<string, boolean>),
  });
  assert.equal(report.abortado, true);
  assert.equal(gw.calls.deleteColumns, 0);
});

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

test("columnRuns agrupa indices contiguos y corta en los huecos", () => {
  assert.deepEqual(columnRuns([0, 2, 3, 4, 7]), [
    { start: 0, end: 0 },
    { start: 2, end: 4 },
    { start: 7, end: 7 },
  ]);
  assert.deepEqual(columnRuns([]), []);
  // Desordenado tambien.
  assert.deepEqual(columnRuns([4, 2, 3]), [{ start: 2, end: 4 }]);
});

test("readFieldPath resuelve rutas con puntos y tolera lo que falta", () => {
  const registro = { keyword: "x", metricas: { searchVolume: 40, cpc: 0 } };
  assert.equal(readFieldPath(registro, "keyword"), "x");
  assert.equal(readFieldPath(registro, "metricas.searchVolume"), 40);
  assert.equal(readFieldPath(registro, "metricas.cpc"), 0);
  assert.equal(readFieldPath(registro, "metricas.noExiste"), undefined);
  assert.equal(readFieldPath(registro, "nada.de.nada"), undefined);
});

// ---------------------------------------------------------------------------
// Volumen: el universo real son miles de filas, no cientos
// ---------------------------------------------------------------------------

test("acceptance: 500 filas se cargan en seis llamadas de red o menos", async () => {
  const gw = fakeDoc();
  const datos = Array.from({ length: 500 }, (_, i) => rec(`keyword numero ${i}`, i, "informacional"));
  const summary = await upsertRows(gw, tabModel(), datos, OPTS);

  assert.equal(summary.insertadas, 500);
  assert.ok(
    summary.llamadasDeRed <= 6,
    `fueron ${summary.llamadasDeRed} llamadas y el tope son 6`,
  );
});

test("el universo real de 5716 filas no dispara una llamada por fila", async () => {
  const gw = fakeDoc();
  const datos = Array.from({ length: 5716 }, (_, i) => rec(`keyword ${i}`, i, "informacional"));
  const summary = await upsertRows(gw, tabModel(), datos, OPTS);

  assert.equal(summary.insertadas, 5716);
  // El tope absoluto se recalcula con el volumen real; lo que no puede pasar es que crezca
  // con la cantidad de filas.
  assert.ok(summary.llamadasDeRed <= 15, `fueron ${summary.llamadasDeRed} llamadas`);
  assert.equal(gw.cell("Keyword Research", "A4"), "keyword 0");
  assert.equal(gw.cell("Keyword Research", "A5719"), "keyword 5715");
});

test("comportamiento 5 bis: si las inserciones superan la grilla, se crece antes de escribir", async () => {
  const gw = fakeDoc();
  const sheet = gw.sheets[0] as FakeSheet;
  sheet.rowCount = 20;

  await upsertRows(gw, tabModel(), Array.from({ length: 100 }, (_, i) => rec(`k${i}`, i, "x")), OPTS);

  assert.equal(gw.calls.growGrid, 1, "la grilla se crece de forma explicita, no por append");
  assert.ok(sheet.rowCount >= 103);
});

test("la grilla no se crece cuando ya alcanza", async () => {
  const gw = fakeDoc();
  await upsertRows(gw, tabModel(), [rec("una sola", 1, "x")], OPTS);
  assert.equal(gw.calls.growGrid, 0);
});
