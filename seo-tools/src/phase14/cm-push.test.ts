/**
 * Pruebas del cargador de `Content Model`.
 *
 * POR QUE LA IDEMPOTENCIA SE PRUEBA ACA Y NO CONTRA EL DOCUMENTO DEL CLIENTE.
 *
 * El plan 14-02 le promete a Juan que aprueba el mapa ANTES de que nada se escriba en su
 * documento, asi que el tracer del 14-01 corre en ensayo y no escribe. Un ensayo no puede
 * demostrar idempotencia: sin primera escritura no hay fila que actualizar, y las dos corridas
 * reportan lo mismo por la razon equivocada. La demostracion de verdad va contra una grilla en
 * memoria que acepta escrituras, las guarda y las devuelve al leer, que es lo que permite
 * cargar dos veces y comprobar que la segunda ACTUALIZA en vez de duplicar (SHEET-06).
 *
 * La doble usa los encabezados REALES del tab, leidos del documento el 2026-08-11. Con
 * encabezados inventados la prueba pasaria y no diria nada del documento que se va a escribir.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import type {
  ColumnModel,
  ConditionalFormatEntry,
  TabMetadata,
  TabModel,
} from "../sheets/schema.js";
import { loadSheetModel } from "../sheets/schema.js";
import { upsertRows, type CellValue, type ValueUpdate, type WriteGateway } from "../sheets/upsert.js";
import { columnasPropiasAusentes, filaDeContentModel } from "./cm-push.js";
import { validarAsignacion, type AsignacionDeUrl } from "./model.js";

const TAB = "Content Model";

/**
 * Fila de encabezados real del tab, tal como estaba el 2026-08-11.
 *
 * Son 17 y no las 19 que el modelo declara: las dos columnas de la plantilla SaaS ya se
 * borraron (J-4). Que el modelo declare mas de las que hay es correcto y esta cubierto: una
 * columna con estado `eliminar` no es requerida y no se vuelve a crear.
 */
const ENCABEZADOS_REALES = [
  "URL",
  "SEO Page?",
  "Keyword",
  "Intent",
  "Type",
  "New/Existing",
  "Cluster",
  "Organic Clicks (GSC)",
  "Organic Impressions (GSC)",
  "Volume (Ahrefs)",
  "Traffic Potential (Ahrefs)",
  "KD Difficulty (Ahrefs)",
  "Position",
  "Action",
  "Notes/Ideas",
  "Leave, Update, or Bin?",
  "Client's Feedback/Notes",
];

// ---------------------------------------------------------------------------
// Doble del cliente: una grilla en memoria de verdad
// ---------------------------------------------------------------------------

interface Grilla extends WriteGateway {
  readonly filas: CellValue[][];
  readonly rangosEscritos: string[];
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

/** Grilla con el banner de la fila 1, la fila 2 vacia y los encabezados en la 3. */
function grilla(): Grilla {
  const filas: CellValue[][] = [["", TAB], [], [...ENCABEZADOS_REALES]];
  const rangosEscritos: string[] = [];
  let rowCount = 200;

  const asegurar = (fila: number): CellValue[] => {
    while (filas.length <= fila) filas.push([]);
    return filas[fila] as CellValue[];
  };

  return {
    filas,
    rangosEscritos,
    celda(fila, columna) {
      return (filas[fila - 1] ?? [])[columna] ?? null;
    },
    filasOcupadas() {
      return filas.filter((f) => (f ?? []).some((c) => comoSeLee(c ?? null).trim() !== "")).length;
    },

    async fetchTabs(): Promise<TabMetadata[]> {
      return [{ sheetId: 814545527, title: TAB, index: 0, rowCount, columnCount: 26 }];
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
        rangosEscritos.push(update.range);
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
      throw new Error("la carga de Content Model no borra filas");
    },
    async deleteColumns() {
      throw new Error("la carga de Content Model no borra columnas");
    },
  };
}

async function tabDelModelo(): Promise<TabModel> {
  const modelo = await loadSheetModel();
  const tab = modelo.tabs[TAB];
  assert.ok(tab, `el modelo tiene que declarar el tab ${TAB}`);
  return tab;
}

function asignacion(sobrescritos: Record<string, unknown> = {}): AsignacionDeUrl {
  return validarAsignacion(
    {
      url: "/sedes/clinica-ricardo-palma",
      titulo: "Traumatólogo y cirujano de columna en Clínica Ricardo Palma",
      estado: "viva",
      origen: "src/content/location-pages.ts:67",
      esPaginaSeo: true,
      motivoDeAccion:
        "La pagina esta publicada desde v1.1 pero salio antes de que esta fase asignara keywords.",
      keywordPrimaria: "cirujano de columna clínica ricardo palma",
      keywordPrimariaKey: "cirujano de columna clinica ricardo palma",
      secundarias: [
        "traumatólogo clínica ricardo palma",
        "ortopedia infantil clínica ricardo palma",
        "traumatólogo especialista en columna clínica ricardo palma",
      ],
      intent: "transaccional",
      tipoDePagina: "pagina-de-sede",
      tipoExigidoPorSerp: "pagina-de-servicio",
      cluster: "cirujano-de-columna-clinica-ricardo-palma",
      clusterFuente: "serp",
      accion: "reescribir",
      dejarActualizarEliminar: "actualizar",
      canonical: "https://drangulocolumna.com/sedes/clinica-ricardo-palma",
      topic: "sedes",
      justificacion: "Prioridad de datos por D-14.",
      ...sobrescritos,
    },
    "prueba",
  );
}

const OPCIONES = {
  addMissingColumns: false,
  omitirCamposAusentes: true,
  estadosPropios: ["fase-14"],
} as const;

// ---------------------------------------------------------------------------
// Pruebas
// ---------------------------------------------------------------------------

test("la proyeccion traduce el modelo al idioma del documento del cliente", () => {
  const fila = filaDeContentModel(asignacion());

  assert.equal(fila["url"], "/sedes/clinica-ricardo-palma");
  // El booleano no se entrega como TRUE: el encabezado hace una pregunta y la celda responde.
  assert.equal(fila["esPaginaSeo"], "Sí");
  assert.equal(fila["nuevaOExistente"], "Existente");
  assert.equal(fila["accion"], "Reescribir");
  assert.equal(fila["dejarActualizarEliminar"], "Actualizar");
  // La keyword viaja con tildes. La clave normalizada NO se escribe nunca.
  assert.equal(fila["keywordPrimaria"], "cirujano de columna clínica ricardo palma");
  assert.ok(!Object.values(fila).includes("cirujano de columna clinica ricardo palma"));
});

test("una URL planificada se declara como nueva y una viva como existente", () => {
  assert.equal(filaDeContentModel(asignacion({ estado: "planificada" }))["nuevaOExistente"], "Nueva");
  assert.equal(filaDeContentModel(asignacion({ estado: "viva" }))["nuevaOExistente"], "Existente");
});

test("la proyeccion no trae campo para ninguna columna que la fase deja vacia", async () => {
  const tab = await tabDelModelo();
  const fila = filaDeContentModel(asignacion());
  const ajenas = tab.columns.filter((c: ColumnModel) => c.status !== "fase-14");

  for (const columna of ajenas) {
    if (columna.field === null) continue;
    assert.ok(
      !(columna.field in fila),
      `la proyeccion no puede alimentar ${JSON.stringify(columna.header)}`,
    );
  }
  // Y al reves: cada columna de la fase SI tiene su campo, o la celda quedaria intacta y el
  // resumen diria que la fila se actualizo sin que el dato llegara.
  for (const columna of tab.columns.filter((c: ColumnModel) => c.status === "fase-14")) {
    assert.ok(columna.field !== null, `${columna.header} tiene que declarar campo`);
    assert.ok(
      (columna.field as string) in fila,
      `la proyeccion tiene que alimentar ${JSON.stringify(columna.header)}`,
    );
  }
});

test("cargar dos veces actualiza la fila en lugar de duplicarla", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();
  const registros = [filaDeContentModel(asignacion())];

  const primera = await upsertRows(gw, tab, registros, OPCIONES);
  assert.deepEqual(
    { actualizadas: primera.actualizadas, insertadas: primera.insertadas },
    { actualizadas: 0, insertadas: 1 },
  );

  const segunda = await upsertRows(gw, tab, registros, OPCIONES);
  assert.deepEqual(
    { actualizadas: segunda.actualizadas, insertadas: segunda.insertadas },
    { actualizadas: 1, insertadas: 0 },
  );

  // Banner, encabezados y una sola fila de datos. Si duplicara, serian dos.
  assert.equal(gw.filasOcupadas(), 3);
  assert.equal(gw.celda(4, 0), "/sedes/clinica-ricardo-palma");
  assert.equal(gw.celda(5, 0), null);
});

test("una segunda carga con otro contenido pisa la misma fila y no agrega una nueva", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();

  await upsertRows(gw, tab, [filaDeContentModel(asignacion())], OPCIONES);
  await upsertRows(
    gw,
    tab,
    [filaDeContentModel(asignacion({ accion: "dejar", dejarActualizarEliminar: "dejar" }))],
    OPCIONES,
  );

  assert.equal(gw.filasOcupadas(), 3);
  assert.equal(gw.celda(4, 13), "Dejar");
});

test("la carga no escribe ni una celda de las columnas que quedan vacias por J-1 y D-13", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();

  // Se siembran las columnas ajenas con contenido del cliente para que un borrado se vea.
  const ajenasSembradas = [7, 8, 9, 10, 11, 12, 14, 16];
  const fila4: CellValue[] = [];
  for (const i of ajenasSembradas) fila4[i] = `dato del cliente ${i}`;
  gw.filas[3] = fila4;

  await upsertRows(gw, tab, [filaDeContentModel(asignacion())], OPCIONES);
  await upsertRows(gw, tab, [filaDeContentModel(asignacion())], OPCIONES);

  for (const i of ajenasSembradas) {
    assert.equal(gw.celda(4, i), `dato del cliente ${i}`, `se piso la columna ${i}`);
  }

  // Ademas, ningun rango escrito puede abarcar una columna ajena: las de la fase no son
  // contiguas y el escritor tiene que partir el rango en tramos.
  const letras = gw.rangosEscritos.map((r) => r.slice(r.lastIndexOf("!") + 1));
  assert.ok(letras.length > 0);
  for (const rango of letras) {
    const [desde, hasta] = rango.split(":") as [string, string];
    const a = indiceDeLetra(/^([A-Z]+)/.exec(desde)?.[1] as string);
    const b = indiceDeLetra(/^([A-Z]+)/.exec(hasta)?.[1] as string);
    for (const ajena of ajenasSembradas) {
      assert.ok(ajena < a || ajena > b, `el rango ${rango} abarca la columna ajena ${ajena}`);
    }
  }
});

test("la carga no agrega ni una columna al documento del cliente", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();

  const resumen = await upsertRows(gw, tab, [filaDeContentModel(asignacion())], OPCIONES);

  assert.equal(resumen.columnasAgregadas, 0);
  assert.deepEqual(await gw.readRow(TAB, 3), ENCABEZADOS_REALES);
});

test("faltando una columna de la fase, la carga se detiene en vez de escribir en el vacio", async () => {
  const tab = await tabDelModelo();

  assert.deepEqual(columnasPropiasAusentes(tab, ENCABEZADOS_REALES), []);
  assert.deepEqual(
    columnasPropiasAusentes(
      tab,
      ENCABEZADOS_REALES.filter((h) => h !== "Cluster"),
    ),
    ["Cluster"],
  );
});

test("un permiso de escritura que no incluye la fase no toca ni una celda propia", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();

  // Es el comportamiento heredado: `kw-push` sigue sin poder escribir columnas de fase 14
  // aunque la fase 14 ya haya corrido.
  const resumen = await upsertRows(gw, tab, [filaDeContentModel(asignacion())], {
    omitirCamposAusentes: true,
    estadosPropios: ["fase-13"],
  });

  assert.equal(resumen.insertadas, 1);
  assert.equal(gw.celda(4, 0), null);
});
