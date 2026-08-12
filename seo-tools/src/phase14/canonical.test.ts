/**
 * Pruebas del canonical propuesto y del cargador del tab `Canonical Audit`.
 *
 * Las seis conductas que el plan declara tienen una prueba cada una, y ademas se prueba lo que
 * el cargador NO puede hacerle al documento del cliente: duplicar filas, agregar columnas y
 * —lo mas facil de romper sin que se note— pisar las dos celdas donde Juan responde.
 *
 * La doble del documento usa los encabezados REALES del tab, medidos el 2026-08-10.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { CliError } from "../config.js";
import type { ConditionalFormatEntry, TabMetadata, TabModel } from "../sheets/schema.js";
import { loadSheetModel } from "../sheets/schema.js";
import { upsertRows, type CellValue, type ValueUpdate, type WriteGateway } from "../sheets/upsert.js";
import {
  absoluta,
  canonicalesRepetidos,
  construirCanonicals,
  divergenciasConElMapa,
  filaDeCanonical,
  leerMapaSincrono,
  ORIGEN_DEL_SITIO,
  resueltosConCanonicalCompartido,
  SIN_PRIMARIA_EN_EL_DOCUMENTO,
} from "./canonical.js";
import { CAMPOS_DE_SEGUIMIENTO, filaDeCanonicalAudit } from "./ca-push.js";
import { leerYaSembrado, sembrarSoloUnaVez } from "./seguimiento.js";
import { validarAsignacion, type AsignacionDeUrl } from "./model.js";

const TAB = "Canonical Audit";

/** Fila de encabezados real del tab, medida el 2026-08-10. La 1 es el banner decorativo. */
const ENCABEZADOS_REALES = ["URL", "Keyword", "Topic", "Canonical", "Approved?", "Implemented?"];

// ---------------------------------------------------------------------------
// Material de prueba
// ---------------------------------------------------------------------------

function asignacion(sobrescritos: Record<string, unknown> = {}): AsignacionDeUrl {
  const base: Record<string, unknown> = {
    url: "/servicios/hernia-discal",
    titulo: "Hernia discal: síntomas, diagnóstico y tratamiento",
    estado: "viva",
    origen: "src/content/service-pages.ts:87",
    esPaginaSeo: true,
    keywordPrimaria: "hernia discal",
    keywordPrimariaKey: "hernia discal",
    secundarias: ["hernia discal lumbar y cervical", "ciatica o hernia discal", "hernia discal tomografía"],
    intent: "informacional",
    tipoDePagina: "pagina-de-servicio",
    tipoExigidoPorSerp: "contenido-internacional",
    cluster: "hernia-discal",
    clusterFuente: "serp",
    accion: "reescribir",
    motivoDeAccion:
      "La pagina ya sirve la keyword asignada pero la SERP premia otro formato y hay que reescribirla.",
    motivoSinPrimaria: null,
    redirigeA: null,
    dejarActualizarEliminar: "actualizar",
    canonical: "https://drangulocolumna.com/servicios/hernia-discal",
    topic: "hernia-discal",
    justificacion: "La cabeza generica se queda de primaria y no se muda a la variante con Lima.",
    ...sobrescritos,
  };
  // El canonical del mapa acompana a la URL: el productor los mantiene juntos y la prueba
  // tiene que hacer lo mismo, o estaria comprobando una divergencia que ella misma fabrico.
  if (sobrescritos["url"] !== undefined && sobrescritos["canonical"] === undefined) {
    base["canonical"] = absoluta(String(sobrescritos["url"]));
  }
  return validarAsignacion(base, "prueba");
}

const MAPA_REAL = leerMapaSincrono("data/url-map.jsonl");

// ---------------------------------------------------------------------------
// Las seis conductas declaradas
// ---------------------------------------------------------------------------

test("canonical: una URL sin variantes recibe como canonical su propia URL absoluta", () => {
  const fila = filaDeCanonical(asignacion());

  assert.equal(fila.canonical, "https://drangulocolumna.com/servicios/hernia-discal");
  assert.equal(fila.canonical, absoluta(fila.url));
});

test("canonical: dos URLs de un conflicto RESUELTO no pueden compartir canonical", () => {
  const distintas = [
    filaDeCanonical(asignacion({ url: "/servicios/hernia-discal" })),
    filaDeCanonical(asignacion({ url: "/blog/lumbalgia" })),
  ];
  const par = [{ urls: ["/servicios/hernia-discal", "/blog/lumbalgia"] as const }];

  // Resuelto y con canonicals distintos: es exactamente lo que tiene que pasar.
  assert.deepEqual(resueltosConCanonicalCompartido(distintas, par), []);

  // Y si alguien les diera el mismo canonical, la comprobacion lo nombra en vez de dejarlo
  // pasar: resolver el conflicto separo los temas y el canonical compartido los vuelve a unir.
  const iguales = [
    { ...(distintas[0] as ReturnType<typeof filaDeCanonical>) },
    { ...(distintas[1] as ReturnType<typeof filaDeCanonical>), canonical: distintas[0]?.canonical as string },
  ];
  assert.equal(resueltosConCanonicalCompartido(iguales, par).length, 1);
});

test("canonical: una URL marcada para crear recibe canonical propuesto igual que una viva", () => {
  const planificada = filaDeCanonical(
    asignacion({ url: "/blog/artrosis", estado: "planificada", accion: "crear", motivoDeAccion: "No existe todavia." }),
  );

  assert.equal(planificada.canonical, "https://drangulocolumna.com/blog/artrosis");
  // El canonical es parte de la pagina que v1.1 todavia no escribio, asi que se propone igual.
  assert.equal(planificada.canonical, absoluta("/blog/artrosis"));
});

test("canonical: el topic es el tema de la URL en el sitio y nunca su keyword", () => {
  const archivo = construirCanonicals(MAPA_REAL);
  const porUrl = new Map(archivo.filas.map((f) => [f.url, f]));

  const home = porUrl.get("/");
  assert.ok(home);
  assert.equal(home.topic, "home");
  assert.notEqual(home.topic, home.keyword);

  // Y NO es el nombre del cluster. La home, `/servicios`, `/servicios/ortopedia-infantil` y
  // `/sedes/consultorio-privado` comparten el cluster de 41 cabezas formado por transitividad y
  // CERO URLs del top 10 medido (D-05). Publicar ese nombre como Topic en una auditoria de
  // canonicals diria que las cuatro son la misma pagina, que es justo lo que la medicion nego.
  const transitivas = ["/", "/servicios", "/servicios/ortopedia-infantil", "/sedes/consultorio-privado"];
  const topics = transitivas.map((u) => porUrl.get(u)?.topic);
  assert.equal(new Set(topics).size, 4, "las cuatro del cluster transitivo tienen topics distintos");
  assert.ok(!topics.includes("especialista-en-columna-y-trauma-en-lima"));

  // Ninguna fila deja el topic vacio, compita o no compita.
  assert.ok(archivo.filas.every((f) => f.topic.trim() !== ""));
});

test("canonical: /privacidad no aparece en la salida (D-11)", () => {
  const archivo = construirCanonicals(MAPA_REAL);

  assert.ok(!archivo.filas.some((f) => f.url === "/privacidad"));
  assert.ok(!archivo.filas.some((f) => f.canonical.endsWith("/privacidad")));
});

test("canonical: siempre absoluto, con el origen del sitemap y sin barra final salvo en la raiz", () => {
  const archivo = construirCanonicals(MAPA_REAL);

  for (const fila of archivo.filas) {
    assert.ok(fila.canonical.startsWith(`${ORIGEN_DEL_SITIO}/`), `${fila.url} no sale del origen del sitio`);
    if (fila.url === "/") {
      assert.equal(fila.canonical, `${ORIGEN_DEL_SITIO}/`);
      continue;
    }
    assert.ok(!fila.canonical.endsWith("/"), `${fila.url} lleva barra final y no es la raiz`);
  }

  // Una ruta que llega con barra final la pierde igual: la regla vive en un solo lugar.
  assert.equal(absoluta("/servicios/"), `${ORIGEN_DEL_SITIO}/servicios`);
  assert.throws(() => absoluta("servicios"), CliError);
});

// ---------------------------------------------------------------------------
// Las tres reglas duras sobre el conjunto
// ---------------------------------------------------------------------------

test("canonical: el calculado y el que ya trae el mapa dicen lo mismo en las 24 filas", () => {
  assert.deepEqual(divergenciasConElMapa(MAPA_REAL), []);
});

test("canonical: ningun canonical se repite entre dos URLs del mapa real", () => {
  const archivo = construirCanonicals(MAPA_REAL);

  assert.deepEqual(canonicalesRepetidos(archivo.filas), []);
  assert.equal(archivo.resumen.canonicalesUnicos, archivo.filas.length);
  assert.equal(archivo.filas.length, MAPA_REAL.length);
});

test("canonical: las URLs que redirigen conservan su propio canonical y no el destino del 301", () => {
  const archivo = construirCanonicals(MAPA_REAL);
  const porUrl = new Map(archivo.filas.map((f) => [f.url, f]));

  const post = porUrl.get("/blog/estenosis-espinal-que-es");
  const guia = porUrl.get("/servicios/estenosis-espinal");
  assert.ok(post && guia);
  assert.equal(post.canonical, `${ORIGEN_DEL_SITIO}/blog/estenosis-espinal-que-es`);
  assert.notEqual(post.canonical, guia.canonical);
});

test("canonical: una fila sin primaria conserva su motivo escrito en vez de una keyword inventada", () => {
  const archivo = construirCanonicals(MAPA_REAL);
  const sinPrimaria = archivo.filas.filter((f) => f.keyword === null);

  assert.equal(sinPrimaria.length, 8);
  for (const fila of sinPrimaria) {
    assert.equal(fila.esPaginaSeo, false);
    assert.ok((fila.motivoSinPrimaria ?? "").length >= 30, `${fila.url} no declara por que no compite`);
  }
  // Y las que si compiten traen su keyword, todas.
  assert.ok(archivo.filas.filter((f) => f.esPaginaSeo).every((f) => (f.keyword ?? "").trim() !== ""));
});

// ---------------------------------------------------------------------------
// Doble del documento del cliente
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

/** Grilla con el banner en la fila 1 y los encabezados en la 2. */
function grilla(): Grilla {
  const filas: CellValue[][] = [["Canonicalization Audit"], [...ENCABEZADOS_REALES]];
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
      return [{ sheetId: 1259097992, title: TAB, index: 0, rowCount, columnCount: 26 }];
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
      throw new Error("la carga de Canonical Audit no borra filas");
    },
    async deleteColumns() {
      throw new Error("la carga de Canonical Audit no borra columnas");
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

async function cargarConSiembra(
  gw: Grilla,
  tab: TabModel,
  registros: readonly Record<string, unknown>[],
): Promise<{ actualizadas: number; insertadas: number; columnasAgregadas: number }> {
  const { loadTabSchema } = await import("../sheets/schema.js");
  const { normalizeKeyword } = await import("../keywords/normalize.js");
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
// Pruebas del cargador
// ---------------------------------------------------------------------------

test("canonical: la proyeccion alimenta las seis columnas del tab y ninguna mas", async () => {
  const tab = await tabDelModelo();
  const fila = filaDeCanonicalAudit(filaDeCanonical(asignacion()));

  for (const columna of tab.columns.filter((c) => c.status === "fase-14")) {
    assert.ok(columna.field !== null, `${columna.header} tiene que declarar campo`);
    assert.ok((columna.field as string) in fila, `la proyeccion tiene que alimentar ${columna.header}`);
  }
  assert.equal(Object.keys(fila).length, tab.columns.length);
});

test("canonical: la home viaja como URL absoluta porque su ruta normaliza a clave vacia", () => {
  const fila = filaDeCanonicalAudit(filaDeCanonical(asignacion({ url: "/", tipoDePagina: "home" })));

  assert.equal(fila["url"], "https://drangulocolumna.com/");
});

test("canonical: una URL que no compite escribe la decision en la celda y no un blanco", () => {
  const sinPrimaria = filaDeCanonical(
    asignacion({
      url: "/sedes",
      esPaginaSeo: false,
      keywordPrimaria: null,
      keywordPrimariaKey: null,
      secundarias: [],
      accion: "dejar",
      motivoDeAccion: "La URL existe y por decision declarada no es objetivo de posicionamiento.",
      motivoSinPrimaria:
        "Decision de Juan del 2026-08-11: queda como hub de navegacion hacia las cuatro sedes.",
      topic: "sedes",
    }),
  );

  assert.equal(sinPrimaria.keyword, null);
  assert.equal(filaDeCanonicalAudit(sinPrimaria)["keyword"], SIN_PRIMARIA_EN_EL_DOCUMENTO);
});

test("canonical: cargar dos veces actualiza las filas en vez de duplicarlas", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();
  const registros = construirCanonicals(MAPA_REAL).filas.map(filaDeCanonicalAudit);

  const primera = await cargarConSiembra(gw, tab, registros);
  assert.deepEqual(primera, { actualizadas: 0, insertadas: 24, columnasAgregadas: 0 });

  const segunda = await cargarConSiembra(gw, tab, registros);
  assert.deepEqual(segunda, { actualizadas: 24, insertadas: 0, columnasAgregadas: 0 });

  // Banner, encabezados y 24 filas de datos.
  assert.equal(gw.filasOcupadas(), 26);
  assert.deepEqual(await gw.readRow(TAB, 2), ENCABEZADOS_REALES);
});

test("canonical: la segunda carga NO pisa la respuesta que el cliente escribio en Approved?", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();
  const registros = construirCanonicals(MAPA_REAL).filas.map(filaDeCanonicalAudit);

  await cargarConSiembra(gw, tab, registros);
  // Juan responde en la primera fila de datos: aprueba y marca implementado.
  const filaDeJuan = 3;
  (gw.filas[filaDeJuan - 1] as CellValue[])[4] = "Sí";
  (gw.filas[filaDeJuan - 1] as CellValue[])[5] = "Sí, lo hizo v1.1";

  await cargarConSiembra(gw, tab, registros);

  assert.equal(gw.celda(filaDeJuan, 4), "Sí");
  assert.equal(gw.celda(filaDeJuan, 5), "Sí, lo hizo v1.1");
  // Y las demas filas siguen con su valor inicial: la defensa no apaga la siembra.
  assert.equal(gw.celda(filaDeJuan + 1, 4), "No");
});

test("canonical: la carga no agrega ni una columna al documento del cliente", async () => {
  const gw = grilla();
  const tab = await tabDelModelo();
  const registros = construirCanonicals(MAPA_REAL).filas.map(filaDeCanonicalAudit);

  const resumen = await cargarConSiembra(gw, tab, registros);

  assert.equal(resumen.columnasAgregadas, 0);
  assert.deepEqual(await gw.readRow(TAB, 2), ENCABEZADOS_REALES);
});
