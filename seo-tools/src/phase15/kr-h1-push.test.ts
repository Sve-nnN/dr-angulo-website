/**
 * Pruebas del cargador de `Suggested H1` y `URL` en el tab `Keyword Research`.
 *
 * LA PRUEBA QUE JUSTIFICA EL ARCHIVO ENTERO es la del permiso acotado. Este tab tiene 5716 filas
 * de datos escritos por las fases 12 y 13, y el escritor coalesce columnas contiguas en un solo
 * rango: basta con que una columna ajena quede en medio de dos propias para que se sobreescriba
 * sin lanzar nada. La doble de abajo usa los encabezados reales del documento, con `URL` metida
 * entre `Cluster` y `Search Volume`, que es donde de verdad esta.
 *
 * La segunda prueba que importa es la de la keyword ausente. Una keyword que no esta en el tab se
 * INSERTA como fila nueva por defecto, al final de 5716 filas y sin que nada avise. En un
 * documento que el cliente lee todos los dias, dos filas huerfanas al final valen menos que el
 * rato que lleva entender de donde salieron.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { CliError } from "../config.js";
import type { ConditionalFormatEntry, TabMetadata, TabModel } from "../sheets/schema.js";
import { loadSheetModel, loadTabSchema } from "../sheets/schema.js";
import { ESTADOS_PROPIOS_POR_DEFECTO } from "../sheets/upsert.js";
import type { CellValue, ValueUpdate, WriteGateway } from "../sheets/upsert.js";
import {
  ESTADOS_PROPIOS,
  TAB,
  cargar,
  registrosDeH1,
  verificarModelo,
} from "./kr-h1-push.js";

// ---------------------------------------------------------------------------
// Datos de prueba
// ---------------------------------------------------------------------------

const ONPAGE = [
  { url: "/servicios/hernia-discal", keywordPrimaria: "hernia discal", h1: "Hernia discal" },
  { url: "/servicios/estenosis-espinal", keywordPrimaria: "estenosis espinal", h1: "Estenosis espinal" },
  { url: "/", keywordPrimaria: "traumatología lima", h1: "Traumatólogo de columna en Lima" },
];

const MAPA = [
  { url: "/servicios/hernia-discal", keywordPrimaria: "hernia discal" },
  { url: "/servicios/estenosis-espinal", keywordPrimaria: "estenosis espinal" },
  { url: "/", keywordPrimaria: "traumatología lima" },
  { url: "/agendar", keywordPrimaria: null },
];

// ---------------------------------------------------------------------------
// Doble del documento
// ---------------------------------------------------------------------------

interface Grilla extends WriteGateway {
  readonly filas: CellValue[][];
  celda(fila: number, columna: number): CellValue;
}

function indiceDeLetra(letra: string): number {
  let n = 0;
  for (const ch of letra) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function origenDeRango(rango: string): { col: number; fila: number } {
  const bang = rango.lastIndexOf("!");
  const inicio = (rango.slice(bang + 1).split(":")[0] ?? "") as string;
  const m = /^([A-Z]+)(\d+)$/.exec(inicio);
  if (m === null) throw new Error(`rango no reconocido: ${rango}`);
  return { col: indiceDeLetra(m[1] as string), fila: Number(m[2]) - 1 };
}

function comoSeLee(valor: CellValue): string {
  if (valor === null || valor === undefined) return "";
  const t = typeof valor === "string" ? valor : String(valor);
  return t.startsWith("'") ? t.slice(1) : t;
}

/** El tab con sus encabezados reales en la fila 3 y las keywords que se le pasen desde la 4. */
function grilla(tab: TabModel, keywords: readonly string[]): Grilla {
  const encabezados = tab.columns.map((c) => c.header);
  const filas: CellValue[][] = [["Keyword Research"], [], [...encabezados]];
  for (const keyword of keywords) filas.push([keyword]);
  let rowCount = 200;

  const asegurar = (fila: number): CellValue[] => {
    while (filas.length <= fila) filas.push([]);
    return filas[fila] as CellValue[];
  };

  return {
    filas,
    celda(fila, columna) {
      return (filas[fila - 1] ?? [])[columna] ?? null;
    },
    async fetchTabs(): Promise<TabMetadata[]> {
      return [{ sheetId: 407303476, title: TAB, index: 0, rowCount, columnCount: 40 }];
    },
    async readRow(_titulo, fila) {
      return (filas[fila - 1] ?? []).map(comoSeLee);
    },
    async readFormulas(): Promise<Map<string, string[][]>> {
      return new Map();
    },
    async readConditionalFormats(): Promise<ConditionalFormatEntry[]> {
      return [];
    },
    async readColumn(_titulo, letra, desde) {
      const col = indiceDeLetra(letra);
      const salida: string[] = [];
      for (let r = desde - 1; r < rowCount; r += 1) salida.push(comoSeLee((filas[r] ?? [])[col] ?? null));
      return salida;
    },
    async readRegion(_titulo, desde, ultima) {
      const ancho = indiceDeLetra(ultima) + 1;
      const salida: string[][] = [];
      for (let r = desde - 1; r < rowCount; r += 1) {
        const fila = filas[r] ?? [];
        salida.push(Array.from({ length: ancho }, (_, c) => comoSeLee(fila[c] ?? null)));
      }
      return salida;
    },
    async growGrid(_id, extra) {
      rowCount += extra;
    },
    async writeValues(updates: readonly ValueUpdate[]) {
      for (const update of updates) {
        const { col, fila } = origenDeRango(update.range);
        update.values.forEach((valores, dr) => {
          const destino = asegurar(fila + dr);
          valores.forEach((valor, dc) => {
            destino[col + dc] = valor;
          });
        });
      }
      rowCount = Math.max(rowCount, filas.length);
    },
    async deleteRows() {
      throw new Error("esta carga no borra filas");
    },
    async deleteColumns() {
      throw new Error("esta carga no borra columnas");
    },
  };
}

async function tabDelModelo(): Promise<TabModel> {
  const modelo = await loadSheetModel();
  const tab = modelo.tabs[TAB];
  assert.ok(tab, `el modelo tiene que declarar el tab ${TAB}`);
  return tab;
}

function indiceDe(tab: TabModel, header: string): number {
  const i = tab.columns.findIndex((c) => c.header === header);
  assert.ok(i >= 0, `el modelo tiene que declarar la columna ${header}`);
  return i;
}

// ---------------------------------------------------------------------------
// Pruebas
// ---------------------------------------------------------------------------

test("kr-h1: el registro trae la clave, el H1 y la URL, y ninguna otra columna viaja", () => {
  const registros = registrosDeH1(ONPAGE, MAPA);

  assert.equal(registros.length, 3);
  for (const registro of registros) {
    assert.deepEqual(Object.keys(registro).sort(), ["keyword", "suggestedH1", "url"]);
  }
  assert.deepEqual(registros[0], {
    keyword: "hernia discal",
    suggestedH1: "Hernia discal",
    url: "/servicios/hernia-discal",
  });
});

test("kr-h1: la URL sale del mapa de la fase 14 y no se deriva de la keyword", () => {
  // Una keyword cuyo slug obvio no coincide con la URL que el mapa le asigno. Un cargador que
  // derivara la ruta escribiria /hernia-discal y desharia una decision medida.
  const registros = registrosDeH1(
    [{ url: "/servicios/hernia-discal", keywordPrimaria: "hernia discal", h1: "Hernia discal" }],
    [{ url: "/servicios/hernia-discal", keywordPrimaria: "hernia discal" }],
  );
  assert.equal(registros[0]?.["url"], "/servicios/hernia-discal");
});

test("kr-h1: las URLs que no compiten no producen registro", () => {
  const registros = registrosDeH1(ONPAGE, MAPA);
  assert.equal(registros.some((r) => r["url"] === "/agendar"), false);
});

test("kr-h1: una fila del mapa sin H1 en el paquete detiene la carga y no escribe vacio", () => {
  assert.throws(
    () => registrosDeH1([], MAPA),
    (error: unknown) => error instanceof CliError,
  );
});

test("kr-h1: el permiso son dos estados y ninguno de los que ya tienen 5716 filas escritas", () => {
  assert.deepEqual([...ESTADOS_PROPIOS], ["fase-14", "fase-15"]);
  for (const estado of ESTADOS_PROPIOS) {
    assert.equal(
      ESTADOS_PROPIOS_POR_DEFECTO.includes(estado),
      false,
      `${estado} no puede estar en el permiso por defecto`,
    );
  }
});

test("kr-h1: el modelo declara campo para las dos columnas, y esos dos estados habilitan dos y no mas", async () => {
  const tab = await tabDelModelo();
  verificarModelo(tab);

  const propias = tab.columns.filter((c) => ESTADOS_PROPIOS.includes(c.status));
  assert.equal(propias.length, 2);
  assert.deepEqual(
    propias.map((c) => `${c.header}:${String(c.field)}`).sort(),
    ["Suggested H1:suggestedH1", "URL:url"],
  );
});

test("kr-h1: el cargador se niega a correr si el modelo dejo Suggested H1 sin campo", async () => {
  const tab = await tabDelModelo();
  const sinCampo: TabModel = {
    ...tab,
    columns: tab.columns.map((c) => (c.header === "Suggested H1" ? { ...c, field: null } : c)),
  };
  assert.throws(
    () => verificarModelo(sinCampo),
    (error: unknown) => error instanceof CliError,
  );
});

test("kr-h1: el cargador se niega si un tercer encabezado reclama uno de los dos estados", async () => {
  const tab = await tabDelModelo();
  const conIntruso: TabModel = {
    ...tab,
    columns: tab.columns.map((c) => (c.header === "Notes" ? { ...c, status: "fase-15" as const } : c)),
  };
  assert.throws(
    () => verificarModelo(conIntruso),
    (error: unknown) => error instanceof CliError,
  );
});

test("kr-h1: el ensayo no escribe ni una celda", async () => {
  const tab = await tabDelModelo();
  const gw = grilla(tab, ["hernia discal", "estenosis espinal", "traumatología lima"]);
  const antes = JSON.stringify(gw.filas);

  const resumen = await cargar(gw, tab, registrosDeH1(ONPAGE, MAPA), true);

  assert.equal(JSON.stringify(gw.filas), antes);
  assert.equal(resumen.actualizadas, 3);
  assert.equal(resumen.insertadas, 0);
});

test("kr-h1: la carga escribe las dos columnas y deja intactas las de las fases 12 y 13", async () => {
  const tab = await tabDelModelo();
  const gw = grilla(tab, ["hernia discal", "estenosis espinal", "traumatología lima"]);

  const volumen = indiceDe(tab, "Search Volume");
  const cluster = indiceDe(tab, "Cluster");
  const h1 = indiceDe(tab, "Suggested H1");
  const url = indiceDe(tab, "URL");
  (gw.filas[3] as CellValue[])[volumen] = "4400";
  (gw.filas[3] as CellValue[])[cluster] = "hernia discal";

  await cargar(gw, tab, registrosDeH1(ONPAGE, MAPA), false);

  assert.equal(gw.celda(4, h1), "Hernia discal");
  assert.equal(gw.celda(4, url), "/servicios/hernia-discal");
  // Las vecinas de las fases anteriores no se tocan ni con un valor vacio.
  assert.equal(gw.celda(4, volumen), "4400");
  assert.equal(gw.celda(4, cluster), "hernia discal");
});

test("kr-h1: la segunda carga actualiza las mismas filas y no inserta ni agrega columnas", async () => {
  const tab = await tabDelModelo();
  const gw = grilla(tab, ["hernia discal", "estenosis espinal", "traumatología lima"]);
  const registros = registrosDeH1(ONPAGE, MAPA);

  const primera = await cargar(gw, tab, registros, false);
  const segunda = await cargar(gw, tab, registros, false);

  for (const resumen of [primera, segunda]) {
    assert.equal(resumen.actualizadas, 3);
    assert.equal(resumen.insertadas, 0);
    assert.equal(resumen.columnasAgregadas, 0);
  }
  assert.equal(gw.filas.length, 6);
});

test("kr-h1: una keyword que no esta en el tab se reporta por nombre y no se inserta", async () => {
  const tab = await tabDelModelo();
  // El tab solo trae dos de las tres. La tercera no puede terminar como fila nueva al final.
  const gw = grilla(tab, ["hernia discal", "estenosis espinal"]);
  const antes = JSON.stringify(gw.filas);

  await assert.rejects(
    () => cargar(gw, tab, registrosDeH1(ONPAGE, MAPA), false),
    (error: unknown) => error instanceof CliError && /traumatología lima/.test(error.message),
  );
  assert.equal(JSON.stringify(gw.filas), antes);
});

test("kr-h1: un encabezado renombrado en el documento vivo detiene la carga", async () => {
  // verificarModelo comprueba data/sheet-columns.json, no el documento. Los estados de esta
  // carga no estan en REQUIRED_STATUSES, asi que un encabezado renombrado no se contaba como
  // faltante: la carga escribia una columna en vez de dos y el resumen reportaba las tres filas.
  const tab = await tabDelModelo();
  const gw = grilla(tab, ["hernia discal", "estenosis espinal", "traumatología lima"]);

  const h1 = indiceDe(tab, "Suggested H1");
  (gw.filas[2] as CellValue[])[h1] = "H1 sugerido";
  const antes = JSON.stringify(gw.filas);

  await assert.rejects(
    () => cargar(gw, tab, registrosDeH1(ONPAGE, MAPA), false),
    (error: unknown) => error instanceof CliError && /Suggested H1/.test(error.message),
  );
  assert.equal(JSON.stringify(gw.filas), antes, "no se escribio ni una celda");
});
