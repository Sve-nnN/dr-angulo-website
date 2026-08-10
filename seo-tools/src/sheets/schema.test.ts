/**
 * Pruebas del modelo del Sheet.
 *
 * Ni una sola toca la red ni necesita credenciales: todo corre contra una doble del cliente
 * y contra arreglos de encabezados en memoria. Los encabezados literales que aparecen aca
 * salen del reconocimiento del 2026-08-10, espacios finales incluidos, porque el valor de la
 * prueba esta justamente en que sin recorte falla.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  assertRowOriented,
  columnLetterFromIndex,
  diffHeaders,
  findAmbiguousHeaders,
  loadSheetModel,
  loadTabSchema,
  planHeaderExtension,
  scanColumnReferences,
  type ColumnModel,
  type ConditionalFormatEntry,
  type SpreadsheetGateway,
  type TabMetadata,
  type TabModel,
} from "./schema.js";

// ---------------------------------------------------------------------------
// Doble del cliente
// ---------------------------------------------------------------------------

interface FakeTab {
  title: string;
  sheetId: number;
  /** Filas en numeracion de Sheet: rows[0] es la fila 1, o sea el banner. */
  rows: string[][];
  /** Contenido con formulas sin evaluar, misma numeracion. */
  formulas?: string[][];
}

interface FakeDoc {
  tabs: FakeTab[];
  conditionalFormats?: ConditionalFormatEntry[];
}

function fakeGateway(doc: FakeDoc): SpreadsheetGateway & { readonly calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async fetchTabs(): Promise<TabMetadata[]> {
      calls.push("fetchTabs");
      return doc.tabs.map((t, i) => ({
        sheetId: t.sheetId,
        title: t.title,
        index: i,
        rowCount: Math.max(t.rows.length, 100),
        columnCount: 30,
      }));
    },
    async readRow(title: string, row: number): Promise<string[]> {
      calls.push(`readRow ${title} ${row}`);
      const tab = doc.tabs.find((t) => t.title === title);
      return [...(tab?.rows[row - 1] ?? [])];
    },
    async readFormulas(titles: readonly string[]): Promise<Map<string, string[][]>> {
      calls.push(`readFormulas ${titles.join(",")}`);
      const out = new Map<string, string[][]>();
      for (const title of titles) {
        out.set(title, doc.tabs.find((t) => t.title === title)?.formulas ?? []);
      }
      return out;
    },
    async readConditionalFormats(): Promise<ConditionalFormatEntry[]> {
      calls.push("readConditionalFormats");
      return doc.conditionalFormats ?? [];
    },
  };
}

// ---------------------------------------------------------------------------
// Datos del reconocimiento del 2026-08-10, literales
// ---------------------------------------------------------------------------

/** Los 18 encabezados reales de `Keyword Research`, con los espacios finales que llevan. */
const KEYWORD_RESEARCH_HEADERS: readonly string[] = [
  "Suggested Keyword",
  "Cluster",
  "URL",
  "Search Volume",
  "Traffic Potential",
  "Search Intent ",
  "CVR",
  "Highest Achievable Position",
  "CTR",
  "Real Traffic Potential",
  "Lead or Conversion Potential ",
  "Keyword Difficulty",
  "Referring Domains Needed ",
  "Suggested H1",
  "Top Result",
  "Internal Approval ",
  "Client Approval ",
  "Notes",
];

const BANNER_ROW: readonly string[] = ["", " Keyword Research "];

function col(header: string, field: string | null, status: ColumnModel["status"]): ColumnModel {
  return { header, field, status };
}

/** Modelo minimo de `Keyword Research` para las pruebas que no cargan el archivo real. */
function keywordResearchModel(overrides: Partial<TabModel> = {}): TabModel {
  return {
    sheetTitle: "Keyword Research",
    headerRow: 3,
    orientation: "filas",
    mapBy: "nombre",
    keyField: "keyword",
    keyHeader: "Suggested Keyword",
    columns: [
      col("Suggested Keyword", "keyword", "fase-12"),
      col("Search Volume", "volume", "fase-12"),
      col("Search Intent ", "intent", "fase-12"),
      col("Referring Domains Needed ", null, "no-consultado"),
      col("Internal Approval ", null, "sin-uso"),
      col("Client Approval ", null, "sin-uso"),
      col("Lead or Conversion Potential ", null, "eliminar"),
    ],
    ...overrides,
  };
}

function keywordResearchDoc(headers: readonly string[] = KEYWORD_RESEARCH_HEADERS): FakeDoc {
  return {
    tabs: [
      {
        title: "Keyword Research",
        sheetId: 407303476,
        rows: [[...BANNER_ROW], [], [...headers]],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Comportamiento 1: la fila de encabezados sale de la configuracion
// ---------------------------------------------------------------------------

test("comportamiento 1: con fila de encabezados 3 se lee la fila 3 y no el banner de la fila 1", async () => {
  const gateway = fakeGateway(keywordResearchDoc());
  const schema = await loadTabSchema(gateway, keywordResearchModel());

  assert.equal(schema.headers[0], "Suggested Keyword");
  assert.equal(schema.headers.length, 18);
  assert.ok(!schema.headers.includes(" Keyword Research "), "se colo el banner de la fila 1");
  assert.ok(gateway.calls.includes("readRow Keyword Research 3"), "no se leyo la fila configurada");
  assert.ok(!gateway.calls.includes("readRow Keyword Research 1"), "se leyo la fila 1");
});

test("comportamiento 1 bis: la primera fila de datos es la siguiente a la de encabezados", async () => {
  const gateway = fakeGateway(keywordResearchDoc());
  const schema = await loadTabSchema(gateway, keywordResearchModel());

  // Con encabezados en la fila 3, los datos empiezan en la 4 del documento, indice 3.
  assert.equal(schema.firstDataRow, 4);
  assert.equal(schema.firstDataRowIndex, 3);
});

// ---------------------------------------------------------------------------
// Comportamiento 2: recorte de extremos en los dos lados
// ---------------------------------------------------------------------------

test("comportamiento 2: un encabezado con espacio final se resuelve igual", async () => {
  const gateway = fakeGateway(keywordResearchDoc());
  const schema = await loadTabSchema(gateway, keywordResearchModel());

  const intent = schema.byField.get("intent");
  assert.ok(intent !== undefined, "no se resolvio el campo de intencion");
  assert.equal(intent.index, 5);
  assert.equal(intent.letter, "F");
  // El encabezado real conserva su espacio final: el modelo no reescribe el documento.
  assert.equal(intent.header, "Search Intent ");
});

test("acceptance: los cinco encabezados reales con espacio final se resuelven todos", async () => {
  const conEspacios = [
    "Search Intent ",
    "Referring Domains Needed ",
    "Internal Approval ",
    "Client Approval ",
    "Lead or Conversion Potential ",
  ];
  // Que la lista siga siendo literal del reconocimiento y no se haya "limpiado" sin querer.
  for (const header of conEspacios) {
    assert.ok(header.endsWith(" "), `${JSON.stringify(header)} perdio su espacio final`);
    assert.ok(KEYWORD_RESEARCH_HEADERS.includes(header), `${header} no esta en el volcado real`);
  }

  const gateway = fakeGateway(keywordResearchDoc());
  const schema = await loadTabSchema(gateway, keywordResearchModel());

  for (const header of conEspacios) {
    const resolved = schema.byHeader.get(header.trim());
    assert.ok(resolved !== undefined, `sin recorte no se encuentra ${JSON.stringify(header)}`);
    assert.equal(resolved.header, header);
  }
});

// ---------------------------------------------------------------------------
// Comportamiento 3: recorta espacios, pero no mayusculas ni tildes
// ---------------------------------------------------------------------------

test("comportamiento 3: la comparacion no ignora mayusculas ni tildes", async () => {
  const torcidos = [...KEYWORD_RESEARCH_HEADERS];
  torcidos[3] = "search volume";
  const gateway = fakeGateway(keywordResearchDoc(torcidos));

  await assert.rejects(
    () => loadTabSchema(gateway, keywordResearchModel()),
    (error: Error) => {
      assert.match(error.message, /Search Volume/);
      return true;
    },
  );

  const conTilde = [...KEYWORD_RESEARCH_HEADERS];
  conTilde[3] = "Search Volumé";
  await assert.rejects(
    () => loadTabSchema(fakeGateway(keywordResearchDoc(conTilde)), keywordResearchModel()),
    /Search Volume/,
  );

  // Y el recorte si aplica: el mismo encabezado con espacios en los dos lados entra.
  const conEspacios = [...KEYWORD_RESEARCH_HEADERS];
  conEspacios[3] = "  Search Volume  ";
  const ok = await loadTabSchema(
    fakeGateway(keywordResearchDoc(conEspacios)),
    keywordResearchModel(),
  );
  assert.equal(ok.byField.get("volume")?.index, 3);
});

// ---------------------------------------------------------------------------
// Comportamiento 4: tab inexistente
// ---------------------------------------------------------------------------

test("comportamiento 4: un tab que no existe falla nombrandolo y listando los que si existen", async () => {
  const gateway = fakeGateway({
    tabs: [
      { title: "Keyword Research", sheetId: 1, rows: [] },
      { title: "Canonical Audit", sheetId: 2, rows: [] },
    ],
  });

  const model = keywordResearchModel({ sheetTitle: "Canonicalization Audit" });

  await assert.rejects(
    () => loadTabSchema(gateway, model),
    (error: Error) => {
      assert.match(error.message, /Canonicalization Audit/);
      assert.match(error.message, /Keyword Research/);
      assert.match(error.message, /Canonical Audit/);
      return true;
    },
  );
});

// ---------------------------------------------------------------------------
// Comportamiento 5: tab completo devuelve indices
// ---------------------------------------------------------------------------

test("comportamiento 5: con todos los campos presentes se devuelve el indice de cada uno", async () => {
  const gateway = fakeGateway(keywordResearchDoc());
  const schema = await loadTabSchema(gateway, keywordResearchModel());

  assert.deepEqual(
    [...schema.byField.entries()].map(([field, c]) => [field, c.index, c.letter]),
    [
      ["keyword", 0, "A"],
      ["volume", 3, "D"],
      ["intent", 5, "F"],
    ],
  );
  assert.equal(schema.missing.length, 0);
  assert.equal(schema.added.length, 0);
  assert.equal(schema.metadata.sheetId, 407303476);
});

// ---------------------------------------------------------------------------
// Comportamiento 6: faltan campos, sin bandera de extension
// ---------------------------------------------------------------------------

test("comportamiento 6: sin bandera de extension, faltar campos falla con las cuatro listas", async () => {
  const model = keywordResearchModel({
    columns: [
      col("Suggested Keyword", "keyword", "fase-12"),
      col("Search Volume", "volume", "fase-12"),
      col("CPC", "cpc", "nueva"),
      col("Competition", "competition", "nueva"),
    ],
  });

  await assert.rejects(
    () => loadTabSchema(fakeGateway(keywordResearchDoc()), model),
    (error: Error) => {
      assert.match(error.message, /Esperadas/i);
      assert.match(error.message, /Reales/i);
      assert.match(error.message, /Faltantes/i);
      assert.match(error.message, /Sobrantes/i);
      assert.match(error.message, /CPC/);
      assert.match(error.message, /Competition/);
      // Las columnas reales que el modelo no declara salen como sobrantes.
      assert.match(error.message, /Highest Achievable Position/);
      return true;
    },
  );
});

// ---------------------------------------------------------------------------
// Comportamiento 7: extension a la derecha del ultimo ocupado
// ---------------------------------------------------------------------------

test("comportamiento 7: con la bandera de extension, lo que falta se calcula a la derecha", async () => {
  const model = keywordResearchModel({
    columns: [
      col("Suggested Keyword", "keyword", "fase-12"),
      col("Search Volume", "volume", "fase-12"),
      col("CPC", "cpc", "nueva"),
      col("Competition", "competition", "nueva"),
    ],
  });

  const schema = await loadTabSchema(fakeGateway(keywordResearchDoc()), model, {
    addMissingColumns: true,
  });

  // El ultimo encabezado ocupado es `Notes`, indice 17, columna R. Lo nuevo va a S y T,
  // en el orden en que lo declara el modelo.
  assert.deepEqual(
    schema.added.map((a) => [a.header, a.index, a.letter]),
    [
      ["CPC", 18, "S"],
      ["Competition", 19, "T"],
    ],
  );
  assert.equal(schema.byField.get("cpc")?.index, 18);
  assert.equal(schema.byField.get("competition")?.letter, "T");

  // Y ningun encabezado existente cambio de nombre ni de posicion.
  assert.deepEqual(schema.headers.slice(0, 18), KEYWORD_RESEARCH_HEADERS);
});

test("comportamiento 7 bis: la extension arranca despues del ultimo ocupado, no del largo del arreglo", () => {
  const actual = ["Suggested Keyword", "Notes", "", "   "];
  const plan = planHeaderExtension(actual, ["CPC", "Competition"]);

  assert.deepEqual(
    plan.map((p) => [p.header, p.index, p.letter]),
    [
      ["CPC", 2, "C"],
      ["Competition", 3, "D"],
    ],
  );
  // La entrada no se muta.
  assert.deepEqual(actual, ["Suggested Keyword", "Notes", "", "   "]);
});

// ---------------------------------------------------------------------------
// Comportamiento 8: encabezado repetido es ambiguo
// ---------------------------------------------------------------------------

test("comportamiento 8: un encabezado repetido se reporta ambiguo y obliga a mapear por posicion", async () => {
  const headers = [
    "URL",
    "Link 1",
    "Anchor 1",
    "Title with Link",
    "Link 2",
    "Anchor 2",
    "Title with Link",
  ];

  assert.deepEqual(findAmbiguousHeaders(headers), ["Title with Link"]);

  const porNombre: TabModel = {
    sheetTitle: "Internal Linking Audit",
    headerRow: 2,
    orientation: "filas",
    mapBy: "nombre",
    keyField: "url",
    keyHeader: "URL",
    columns: [
      col("URL", "url", "fase-15"),
      col("Link 1", "link1", "fase-15"),
      col("Anchor 1", "anchor1", "fase-15"),
      col("Title with Link", "titleWithLink1", "fase-15"),
      col("Link 2", "link2", "fase-15"),
      col("Anchor 2", "anchor2", "fase-15"),
      col("Title with Link", "titleWithLink2", "fase-15"),
    ],
  };

  const doc: FakeDoc = {
    tabs: [{ title: "Internal Linking Audit", sheetId: 9, rows: [["banner"], [...headers]] }],
  };

  await assert.rejects(
    () => loadTabSchema(fakeGateway(doc), porNombre),
    (error: Error) => {
      assert.match(error.message, /ambigu/i);
      assert.match(error.message, /Title with Link/);
      assert.match(error.message, /posicion/i);
      return true;
    },
  );

  // Declarado por posicion si resuelve, y cada bloque cae en su columna.
  const schema = await loadTabSchema(fakeGateway(doc), { ...porNombre, mapBy: "posicion" });
  assert.equal(schema.byField.get("titleWithLink1")?.index, 3);
  assert.equal(schema.byField.get("titleWithLink2")?.index, 6);
  assert.deepEqual(schema.ambiguous, ["Title with Link"]);
});

// ---------------------------------------------------------------------------
// Comportamiento 9: un tab transpuesto rechaza la escritura de filas
// ---------------------------------------------------------------------------

test("comportamiento 9: un tab orientado a columnas rechaza la escritura orientada a filas", () => {
  const competidores: TabModel = {
    sheetTitle: "Competitor Analysis",
    headerRow: null,
    orientation: "columnas",
    mapBy: "posicion",
    keyField: "domain",
    keyHeader: null,
    columns: [],
  };

  assert.throws(
    () => assertRowOriented(competidores),
    (error: Error) => {
      assert.match(error.message, /Competitor Analysis/);
      assert.match(error.message, /columnas/);
      assert.match(error.message, /13/);
      return true;
    },
  );

  // Y el mismo control deja pasar un tab orientado a filas.
  assert.doesNotThrow(() => assertRowOriented(keywordResearchModel()));
});

test("comportamiento 9 bis: cargar el esquema de un tab transpuesto tambien se rechaza", async () => {
  const doc: FakeDoc = { tabs: [{ title: "Competitor Analysis", sheetId: 3, rows: [[], []] }] };
  const competidores: TabModel = {
    sheetTitle: "Competitor Analysis",
    headerRow: null,
    orientation: "columnas",
    mapBy: "posicion",
    keyField: "domain",
    keyHeader: null,
    columns: [],
  };

  await assert.rejects(() => loadTabSchema(fakeGateway(doc), competidores), /columnas/);
});

// ---------------------------------------------------------------------------
// Comportamiento 10: escaneo de referencias
// ---------------------------------------------------------------------------

function docConReferencias(): FakeDoc {
  return {
    tabs: [
      {
        title: "Keyword Research",
        sheetId: 407303476,
        rows: [[...BANNER_ROW], [], [...KEYWORD_RESEARCH_HEADERS]],
        formulas: [[], [], [], ["", "", "", "", "", "", "", "=D4*0.02"]],
      },
      {
        title: "Content Strategy",
        sheetId: 2138892540,
        rows: [],
        formulas: [[], [], [], ["", "", "", "=SUM('Keyword Research'!G4:G100)"]],
      },
    ],
    conditionalFormats: [
      {
        sheetTitle: "Keyword Research",
        description: "regla booleana con formula propia",
        formulas: ["=$K4>0.5"],
        ranges: [{ startColumnIndex: 0, endColumnIndex: 18 }],
      },
    ],
  };
}

test("comportamiento 10: el escaneo devuelve donde aparece cada mencion, y vacio es seguro de eliminar", async () => {
  const gateway = fakeGateway(docConReferencias());

  const [cvr, lead, limpia] = await scanColumnReferences(gateway, [
    { tabTitle: "Keyword Research", header: "CVR", letter: "G" },
    { tabTitle: "Keyword Research", header: "Lead or Conversion Potential ", letter: "K" },
    { tabTitle: "Keyword Research", header: "Notes", letter: "R" },
  ]);

  // Una formula de otro tab menciona la columna G con el nombre del tab por delante.
  assert.ok(cvr !== undefined);
  assert.equal(cvr.references.length, 1);
  assert.equal(cvr.references[0]?.kind, "formula");
  assert.match(cvr.references[0]?.where ?? "", /Content Strategy!D4/);
  assert.match(cvr.references[0]?.text ?? "", /Keyword Research'!G4:G100/);

  // Un formato condicional del mismo tab menciona la columna K por letra sola.
  assert.ok(lead !== undefined);
  assert.equal(lead.references.length, 1);
  assert.equal(lead.references[0]?.kind, "formato-condicional");
  assert.match(lead.references[0]?.text ?? "", /\$K4/);

  // Una columna sin menciones: lista vacia, o sea segura de eliminar.
  assert.ok(limpia !== undefined);
  assert.deepEqual(limpia.references, []);
  assert.equal(limpia.safeToDelete, true);
  assert.equal(cvr.safeToDelete, false);
  assert.equal(lead.safeToDelete, false);
});

test("comportamiento 10 bis: el escaneo es de solo lectura y no confunde AB con B", async () => {
  const gateway = fakeGateway({
    tabs: [
      {
        title: "Keyword Research",
        sheetId: 1,
        rows: [[], [], [...KEYWORD_RESEARCH_HEADERS]],
        formulas: [[], [], [], ["=AB4+1", "=$B$9", "=SUM(BB1:BB9)"]],
      },
    ],
  });

  const [b, ab] = await scanColumnReferences(gateway, [
    { tabTitle: "Keyword Research", header: "Cluster", letter: "B" },
    { tabTitle: "Keyword Research", header: "columna larga", letter: "AB" },
  ]);

  // `=$B$9` cuenta; `=AB4+1` y `BB1:BB9` no son la columna B.
  assert.equal(b?.references.length, 1);
  assert.match(b?.references[0]?.text ?? "", /\$B\$9/);
  assert.equal(ab?.references.length, 1);
  assert.match(ab?.references[0]?.text ?? "", /AB4/);

  // Ni una sola llamada de escritura: la doble solo registro lecturas.
  assert.deepEqual(
    gateway.calls.filter((c) => !/^(fetchTabs|readRow|readFormulas|readConditionalFormats)/.test(c)),
    [],
  );
});

// ---------------------------------------------------------------------------
// Utilidades y modelo declarativo
// ---------------------------------------------------------------------------

test("acceptance: la columna en posicion 27 se convierte en la letra AB", () => {
  // Indice base cero, que es el que usa la fila de encabezados leida de la API.
  assert.equal(columnLetterFromIndex(0), "A");
  assert.equal(columnLetterFromIndex(25), "Z");
  assert.equal(columnLetterFromIndex(26), "AA");
  assert.equal(columnLetterFromIndex(27), "AB");
  assert.equal(columnLetterFromIndex(51), "AZ");
  assert.equal(columnLetterFromIndex(52), "BA");
});

test("el diff de encabezados devuelve las cuatro listas", () => {
  const diff = diffHeaders(["A", "B", "C"], ["A", "C ", "D"]);
  assert.deepEqual(diff.esperadas, ["A", "B", "C"]);
  assert.deepEqual(diff.reales, ["A", "C ", "D"]);
  assert.deepEqual(diff.faltantes, ["B"]);
  assert.deepEqual(diff.sobrantes, ["D"]);
});

test("el modelo declarativo cubre los cinco tabs del alcance con su forma real", async () => {
  const model = await loadSheetModel();

  const esperado: Record<string, number> = {
    "Keyword Research": 3,
    "Content Model": 3,
    "Canonical Audit": 2,
    "Internal Linking Audit": 2,
  };

  for (const [title, headerRow] of Object.entries(esperado)) {
    const tab = model.tabs[title];
    assert.ok(tab !== undefined, `falta el tab ${title} en el modelo`);
    assert.equal(tab.headerRow, headerRow, `${title}: fila de encabezados equivocada`);
    assert.equal(tab.orientation, "filas");
    assert.equal(tab.sheetTitle, title);
  }

  const competidores = model.tabs["Competitor Analysis"];
  assert.ok(competidores !== undefined);
  assert.equal(competidores.orientation, "columnas");
  assert.equal(competidores.headerRow, null);

  // El nombre largo es el banner de la fila 1 y pedirlo a la API devuelve 400.
  assert.equal(model.tabs["Canonicalization Audit"], undefined);
});

test("el modelo de Keyword Research declara los 18 encabezados reales, literales", async () => {
  const model = await loadSheetModel();
  const tab = model.tabs["Keyword Research"];
  assert.ok(tab !== undefined);

  const declarados = tab.columns.filter((c) => c.status !== "nueva").map((c) => c.header);
  assert.deepEqual(declarados, KEYWORD_RESEARCH_HEADERS);

  const nuevas = tab.columns.filter((c) => c.status === "nueva").map((c) => c.header);
  assert.equal(nuevas.length, 2, "J-2 agrega exactamente dos columnas");

  const aEliminar = tab.columns.filter((c) => c.status === "eliminar").map((c) => c.header);
  assert.deepEqual(aEliminar, ["CVR", "Lead or Conversion Potential "]);

  assert.equal(tab.keyHeader, "Suggested Keyword");
});

test("el mapeo de Keyword Research no declara ninguna columna derogada por J-3", async () => {
  const model = await loadSheetModel();
  const serializado = JSON.stringify(model.tabs["Keyword Research"]);

  for (const prohibida of ["Source", "Stage", "Etapa"]) {
    assert.ok(
      !serializado.includes(prohibida),
      `el modelo incluye una columna derogada por J-3: ${prohibida}`,
    );
  }
});

test("el modelo real resuelve contra los encabezados reales sin ninguna falla", async () => {
  const model = await loadSheetModel();
  const tab = model.tabs["Keyword Research"];
  assert.ok(tab !== undefined);

  const schema = await loadTabSchema(fakeGateway(keywordResearchDoc()), tab, {
    addMissingColumns: true,
  });

  assert.equal(schema.byField.get("keyword")?.letter, "A");
  assert.equal(schema.byField.get("volume")?.letter, "D");
  assert.equal(schema.byField.get("intent")?.letter, "F");
  // Las dos nuevas caen a la derecha de `Notes`, que es la R.
  assert.deepEqual(
    schema.added.map((a) => a.letter),
    ["S", "T"],
  );
});
