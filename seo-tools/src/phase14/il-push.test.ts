/**
 * Pruebas del cargador de `Internal Linking Audit`.
 *
 * LA PRUEBA QUE JUSTIFICA EL ARCHIVO ENTERO es la del mapeo posicional. El encabezado
 * `Title with Link` se repite ocho veces en el documento real, asi que un escritor que resuelva
 * columnas por nombre escribe los ocho bloques de enlace en la MISMA columna y no lanza nada.
 * La doble de abajo usa los 31 encabezados reales, con la repeticion incluida y con el espacio
 * final de `Anchor 8 `, porque con encabezados inventados la prueba pasaria sin decir nada del
 * documento que se va a escribir.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import type { ConditionalFormatEntry, TabMetadata, TabModel } from "../sheets/schema.js";
import { loadSheetModel, loadTabSchema } from "../sheets/schema.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { upsertRows, type CellValue, type ValueUpdate, type WriteGateway } from "../sheets/upsert.js";
import { filaDeEnlazado } from "./il-push.js";
import { CAMPOS_DE_SEGUIMIENTO } from "./il-push.js";
import { leerYaSembrado, sembrarSoloUnaVez } from "./seguimiento.js";
import type { FilaDeEnlazado } from "./links.js";

const TAB = "Internal Linking Audit";

/**
 * Los 31 encabezados reales, medidos el 2026-08-10.
 *
 * `Title with Link` aparece ocho veces con el mismo texto y `Anchor 8 ` lleva espacio final.
 * Las dos cosas son literales del documento y no se corrigen aca.
 */
const ENCABEZADOS_REALES = [
  "URL",
  "Title",
  "Code",
  "Action",
  "Cluster",
  "Link 1",
  "Anchor 1",
  "Title with Link",
  "Link 2",
  "Anchor 2",
  "Title with Link",
  "Link 3",
  "Anchor 3",
  "Title with Link",
  "Link 4",
  "Anchor 4",
  "Title with Link",
  "Link 5",
  "Anchor 5",
  "Title with Link",
  "Link 6",
  "Anchor 6",
  "Title with Link",
  "Link 7",
  "Anchor 7",
  "Title with Link",
  "Link 8",
  "Anchor 8 ",
  "Title with Link",
  "Done",
  "Notas",
];

const INDICE_DE_NOTAS = 30;

function enlazado(sobrescritos: Partial<FilaDeEnlazado> = {}): FilaDeEnlazado {
  return {
    url: "/servicios/hernia-discal",
    title: "Hernia discal: síntomas, diagnóstico y tratamiento",
    code: "200",
    action: "Reescribir",
    cluster: "hernia discal",
    enlaces: Array.from({ length: 8 }, (_, i) => ({
      link: `/destino-${i + 1}`,
      anchor: `anchor ${i + 1}`,
      titleWithLink: `Titulo ${i + 1}`,
      regla: "vecindad-tematica" as const,
      motivo: `Motivo suficientemente largo del enlace numero ${i + 1} de esta fila.`,
    })),
    ...sobrescritos,
  };
}

// ---------------------------------------------------------------------------
// Doble del documento
// ---------------------------------------------------------------------------

interface Grilla extends WriteGateway {
  readonly filas: CellValue[][];
  celda(fila: number, columna: number): CellValue;
  filasOcupadas(): number;
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

function grilla(): Grilla {
  const filas: CellValue[][] = [["Internal Linking Audit"], [...ENCABEZADOS_REALES]];
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
    filasOcupadas() {
      return filas.filter((f) => (f ?? []).some((c) => comoSeLee(c ?? null).trim() !== "")).length;
    },

    async fetchTabs(): Promise<TabMetadata[]> {
      return [{ sheetId: 1398984258, title: TAB, index: 0, rowCount, columnCount: 40 }];
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
      throw new Error("la carga de Internal Linking Audit no borra filas");
    },
    async deleteColumns() {
      throw new Error("la carga de Internal Linking Audit no borra columnas");
    },
  };
}

async function tabDelModelo(): Promise<TabModel> {
  const modelo = await loadSheetModel();
  const tab = modelo.tabs[TAB];
  assert.ok(tab, `el modelo tiene que declarar el tab ${TAB}`);
  return tab;
}

const OPCIONES = {
  addMissingColumns: false,
  omitirCamposAusentes: true,
  estadosPropios: ["fase-14"],
} as const;

async function cargar(
  gw: Grilla,
  tab: TabModel,
  registros: readonly Record<string, unknown>[],
): Promise<{ actualizadas: number; insertadas: number; columnasAgregadas: number }> {
  const schema = await loadTabSchema(gw, tab, { addMissingColumns: false });
  const yaSembrado = await leerYaSembrado(gw, schema, CAMPOS_DE_SEGUIMIENTO);
  const conSiembra = registros.map((r) =>
    sembrarSoloUnaVez(r, normalizeKeyword(String(r["url"] ?? "")), yaSembrado),
  );
  const resumen = await upsertRows(gw, tab, conSiembra, OPCIONES);
  return {
    actualizadas: resumen.actualizadas,
    insertadas: resumen.insertadas,
    columnasAgregadas: resumen.columnasAgregadas,
  };
}

// ---------------------------------------------------------------------------
// Pruebas
// ---------------------------------------------------------------------------

test("il-push: el tab se declara con mapeo por posicion, que es lo unico que lo salva", async () => {
  const tab = await tabDelModelo();

  assert.equal(tab.mapBy, "posicion");
  assert.equal(tab.columns.length, ENCABEZADOS_REALES.length);
  // El encabezado repetido esta en el modelo tal como esta en el documento, ocho veces.
  assert.equal(tab.columns.filter((c) => c.header === "Title with Link").length, 8);
  // Y el espacio final de la octava columna de anchor se conserva literal.
  assert.equal(tab.columns[27]?.header, "Anchor 8 ");
});

test("il-push: el schema resuelve las 31 columnas sin colapsar los encabezados repetidos", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();
  const schema = await loadTabSchema(gw, tab, { addMissingColumns: false });

  // La lista completa trae las 31. El indice por nombre colapsa las ocho repetidas en una:
  // recorrerlo para saber que escribir dejaria siete columnas fuera de toda peticion.
  assert.equal(schema.columns.length, 31);
  assert.equal(schema.byHeader.size, 24);
  assert.equal(schema.ambiguous.includes("Title with Link"), true);
});

test("il-push: el primer bloque de enlace y el octavo caen en columnas distintas", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();

  await cargar(gw, tab, [filaDeEnlazado(enlazado())]);

  const fila = 3;
  // Bloque 1: columnas 5, 6, 7.
  assert.equal(gw.celda(fila, 5), "/destino-1");
  assert.equal(gw.celda(fila, 6), "anchor 1");
  assert.equal(gw.celda(fila, 7), "Titulo 1");
  // Bloque 8: columnas 26, 27, 28. Con mapeo por nombre las tres traerian lo mismo que arriba.
  assert.equal(gw.celda(fila, 26), "/destino-8");
  assert.equal(gw.celda(fila, 27), "anchor 8");
  assert.equal(gw.celda(fila, 28), "Titulo 8");

  // Y los ocho titulos de destino son ocho valores distintos, no el mismo repetido.
  const titulos = [7, 10, 13, 16, 19, 22, 25, 28].map((c) => gw.celda(fila, c));
  assert.equal(new Set(titulos).size, 8);
});

test("il-push: las ranuras sin enlace se escriben vacias y no dejan el enlace anterior colgando", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();

  await cargar(gw, tab, [filaDeEnlazado(enlazado())]);
  const conTres = enlazado({ enlaces: enlazado().enlaces.slice(0, 3) });
  await cargar(gw, tab, [filaDeEnlazado(conTres)]);

  const fila = 3;
  assert.equal(gw.celda(fila, 5), "/destino-1");
  assert.equal(gw.celda(fila, 11), "/destino-3");
  // El cuarto bloque en adelante queda limpio: la matriz nueva ya no propone esos enlaces.
  for (const c of [14, 15, 16, 26, 27, 28]) {
    assert.equal(comoSeLee(gw.celda(fila, c)), "", `la columna ${c} quedo con un enlace viejo`);
  }
});

test("il-push: cargar dos veces actualiza la fila en lugar de duplicarla", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();
  const registros = [filaDeEnlazado(enlazado()), filaDeEnlazado(enlazado({ url: "/servicios" }))];

  assert.deepEqual(await cargar(gw, tab, registros), {
    actualizadas: 0,
    insertadas: 2,
    columnasAgregadas: 0,
  });
  assert.deepEqual(await cargar(gw, tab, registros), {
    actualizadas: 2,
    insertadas: 0,
    columnasAgregadas: 0,
  });

  assert.equal(gw.filasOcupadas(), 4);
  assert.deepEqual(await gw.readRow(TAB, 2), ENCABEZADOS_REALES);
});

test("il-push: la columna Notas no es de la fase y no se toca ni con un valor vacio", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();
  (gw.filas[2] as CellValue[]) = [];
  ((gw.filas[2] as CellValue[])[INDICE_DE_NOTAS] as unknown) = "nota del cliente";

  await cargar(gw, tab, [filaDeEnlazado(enlazado())]);
  await cargar(gw, tab, [filaDeEnlazado(enlazado())]);

  assert.equal(gw.celda(3, INDICE_DE_NOTAS), "nota del cliente");
});

test("il-push: la segunda carga NO pisa el Done que marco el cliente", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();
  const registros = [filaDeEnlazado(enlazado())];

  await cargar(gw, tab, registros);
  assert.equal(gw.celda(3, 29), "No");

  (gw.filas[2] as CellValue[])[29] = "Sí, implementado por v1.1";
  await cargar(gw, tab, registros);

  assert.equal(gw.celda(3, 29), "Sí, implementado por v1.1");
});

test("il-push: la proyeccion alimenta las 30 columnas de la fase y ninguna mas", async () => {
  const tab = await tabDelModelo();
  const fila = filaDeEnlazado(enlazado());

  const propias = tab.columns.filter((c) => c.status === "fase-14");
  assert.equal(propias.length, 30);
  for (const columna of propias) {
    assert.ok(columna.field !== null, `${columna.header} tiene que declarar campo`);
    assert.ok((columna.field as string) in fila, `la proyeccion tiene que alimentar ${columna.field}`);
  }
  assert.equal(Object.keys(fila).length, propias.length);
  // `Notas` es la unica sin campo y sigue fuera de la proyeccion.
  assert.equal(tab.columns.filter((c) => c.status !== "fase-14").length, 1);
});
