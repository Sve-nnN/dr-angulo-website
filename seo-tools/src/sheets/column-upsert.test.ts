/**
 * Pruebas del escritor orientado a columnas.
 *
 * Sin credenciales y sin red: la doble es una grilla en memoria de verdad que acepta
 * escrituras, las guarda y las devuelve al leer. Sin eso, la prueba de idempotencia —que es la
 * mas importante de la tarea— no probaria nada.
 *
 * La grilla de partida REPRODUCE la forma medida del documento real el 2026-08-11, incluido el
 * residuo de plantilla `pera` y los 108 espacios finales de la etiqueta de la fila 25. Las
 * etiquetas salen del modelo commiteado, asi que si alguien lo edita sin volver a medir el
 * documento, estas pruebas cambian con el y el fallo aparece aca y no sobre el Sheet del
 * cliente.
 *
 * Hay una prueba nombrada por cada punto del bloque <behavior> de la tarea 3 del plan 13-03.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { CliError } from "../config.js";
import {
  cargarModeloTranspuesto,
  claveDeDominio,
  describirResumen,
  tramosDeFilas,
  upsertColumns,
  validarForma,
  type ModeloTranspuesto,
} from "./column-upsert.js";
import { columnIndexFromLetter } from "./schema.js";
import type { CellValue, DeleteBlock, ValueUpdate, WriteGateway } from "./upsert.js";

const TAB = "Competitor Analysis";
const modelo = await cargarModeloTranspuesto(TAB);

/** La etiqueta de la fila 25 mide 139 caracteres y 31 al recortar: 108 espacios finales. */
const ETIQUETA_FILA_25 = `Páginas principales+ Primary KW${" ".repeat(108)}`;

// ---------------------------------------------------------------------------
// La grilla medida
// ---------------------------------------------------------------------------

function grillaMedida(): string[][] {
  const filas = 36;
  const columnas = 18;
  const grilla: string[][] = Array.from({ length: filas }, () => Array.from({ length: columnas }, () => ""));
  const poner = (fila: number, columna: number, valor: string): void => {
    (grilla[fila - 1] as string[])[columna] = valor;
  };

  // Columna A: las etiquetas de metrica, tal como las declara el modelo ya validado.
  for (const c of modelo.tab.columns) poner(c.row as number, 0, c.header);
  poner(25, 0, ETIQUETA_FILA_25);

  // Columna B: primera ranura de competidor Y titulos de seccion encima de sus valores.
  for (const t of modelo.filasDeTitulo) poner(t.row, 1, t.titulo);
  poner(2, 1, "pera");
  poner(3, 1, "pera.com");
  poner(5, 1, "20");
  poner(6, 1, "13");
  poner(12, 1, "United States");
  poner(24, 1, "6");
  poner(12, 3, "20%");

  // Las otras cuatro ranuras traen solo el nombre de plantilla en la fila 2.
  ["F", "J", "N", "R"].forEach((letra, i) => {
    poner(2, columnIndexFromLetter(letra), `Competitor ${i + 1}`);
  });

  return grilla;
}

// ---------------------------------------------------------------------------
// Doble del cliente
// ---------------------------------------------------------------------------

interface Doble extends WriteGateway {
  readonly grilla: string[][];
  readonly escrituras: ValueUpdate[][];
  readonly modos: string[];
  celda(a1: string): string;
}

function parseRango(rango: string): { columna: number; fila: number } {
  const bang = rango.lastIndexOf("!");
  const inicio = (rango.slice(bang + 1).split(":")[0] ?? "") as string;
  const m = /^([A-Z]+)(\d+)$/.exec(inicio);
  if (m === null) throw new Error(`rango no reconocido: ${rango}`);
  return { columna: columnIndexFromLetter(m[1] as string), fila: Number(m[2]) - 1 };
}

/** Sheets devuelve el texto SIN el apostrofo inicial: ese apostrofo es formato, no contenido. */
function comoSeLee(valor: CellValue): string {
  if (valor === null || valor === undefined) return "";
  const texto = typeof valor === "string" ? valor : String(valor);
  return texto.startsWith("'") ? texto.slice(1) : texto;
}

function doble(grilla: string[][] = grillaMedida()): Doble {
  const escrituras: ValueUpdate[][] = [];
  const modos: string[] = [];
  const noUsado = (nombre: string) => (): never => {
    throw new Error(`la doble no espera que el escritor por columnas llame a ${nombre}`);
  };

  return {
    grilla,
    escrituras,
    modos,

    celda(a1) {
      const { columna, fila } = parseRango(`x!${a1}`);
      return (grilla[fila] ?? [])[columna] ?? "";
    },

    async fetchTabs() {
      return [{ sheetId: 333897514, title: TAB, index: 0, rowCount: grilla.length, columnCount: 21 }];
    },

    async readRow(_titulo, fila) {
      return [...(grilla[fila - 1] ?? [])];
    },

    async readRegion(_titulo, desdeFila, _ultimaColumna) {
      return grilla.slice(desdeFila - 1).map((f) => [...f]);
    },

    async readColumn(_titulo, letra, desdeFila) {
      const columna = columnIndexFromLetter(letra);
      return grilla.slice(desdeFila - 1).map((f) => f[columna] ?? "");
    },

    async writeValues(updates, modo) {
      escrituras.push([...updates]);
      modos.push(modo);
      for (const update of updates) {
        const { columna, fila } = parseRango(update.range);
        update.values.forEach((valores, df) => {
          valores.forEach((valor, dc) => {
            while (grilla.length <= fila + df) grilla.push([]);
            const destino = grilla[fila + df] as string[];
            while (destino.length <= columna + dc) destino.push("");
            destino[columna + dc] = comoSeLee(valor);
          });
        });
      }
    },

    readFormulas: noUsado("readFormulas") as never,
    readConditionalFormats: noUsado("readConditionalFormats") as never,
    growGrid: noUsado("growGrid") as never,
    deleteRows: noUsado("deleteRows") as never as (sheetId: number, blocks: readonly DeleteBlock[]) => Promise<void>,
    deleteColumns: noUsado("deleteColumns") as never as (sheetId: number, blocks: readonly DeleteBlock[]) => Promise<void>,
  };
}

const CINCO = [
  { domain: "drcarranzacolumna.com", name: "Dr. Paul Carranza", domainRating: 18, ahrefsRank: 4820371, referringDomains: 43 },
  { domain: "drciezatraumatologia.com", name: "Dr. Ramiro Cieza", domainRating: 12, ahrefsRank: 6000000, referringDomains: 21 },
  { domain: "cirujanocolumna-elaos.com", name: "Dr. Eduardo Laos", domainRating: 9, ahrefsRank: null, referringDomains: 14 },
  { domain: "doctormunguia.com", name: "Dr. Gunter Munguia", domainRating: 7, ahrefsRank: null, referringDomains: 8 },
  { domain: "clinicarthromeds.pe", name: "Clinica Arthromeds", domainRating: 21, ahrefsRank: null, referringDomains: 60 },
];

// ---------------------------------------------------------------------------
// El modelo declarado sigue describiendo un tab transpuesto
// ---------------------------------------------------------------------------

test("el modelo declara Competitor Analysis como transpuesto, con cinco ranuras de paso 4 desde la B", () => {
  assert.equal(modelo.tab.orientation, "columnas");
  assert.equal(modelo.tab.headerRow, null, "no tiene fila de encabezados y eso es un hecho medido");
  assert.equal(modelo.tab.keyField, "domain");
  assert.equal(modelo.filaDeClave, 3);
  assert.deepEqual(modelo.ranuras.letras, ["B", "F", "J", "N", "R"]);
  assert.equal(modelo.ranuras.paso, 4);
  assert.equal(modelo.tab.columns.length, 29);
});

test("ninguna fila declarada como metrica cae sobre una fila de titulo de seccion", () => {
  const titulos = new Set(modelo.filasDeTitulo.map((t) => t.row));
  assert.deepEqual(
    modelo.filasDeclaradas.filter((f) => titulos.has(f)),
    [],
    "escribir una metrica sobre un titulo lo borraria sin lanzar ninguna excepcion",
  );
  assert.deepEqual([...titulos].sort((a, b) => a - b), [1, 4, 11, 17, 23, 25, 31]);
});

test("las filas declaradas se agrupan en tramos que saltan las filas de titulo", () => {
  assert.deepEqual(tramosDeFilas(modelo.filasDeclaradas), [
    { desde: 2, hasta: 3 },
    { desde: 5, hasta: 10 },
    { desde: 12, hasta: 16 },
    { desde: 18, hasta: 22 },
    { desde: 24, hasta: 24 },
    { desde: 26, hasta: 30 },
    { desde: 32, hasta: 36 },
  ]);
});

// ---------------------------------------------------------------------------
// comportamiento 1: la clave es el dominio y recargar no agrega columnas
// ---------------------------------------------------------------------------

test("comportamiento 1: cargar dos veces los mismos cinco competidores NO agrega ni una columna", async () => {
  const g = doble();

  const primera = await upsertColumns(g, modelo, CINCO, { dryRun: false });
  assert.equal(primera.columnasNuevas, 5, "la primera carga ocupa las cinco ranuras");
  assert.equal(primera.actualizadas, 0);

  const segunda = await upsertColumns(g, modelo, CINCO, { dryRun: false });
  assert.equal(segunda.columnasNuevas, 0, "SHEET-06 aplicado al segundo modo de escritura");
  assert.equal(segunda.actualizadas, 5);
  assert.deepEqual(segunda.sinRanura, []);
});

test("comportamiento 1: la clave tolera protocolo, www y barra final, que es como llegan los dominios", () => {
  assert.equal(claveDeDominio("https://www.Ejemplo.COM/"), "ejemplo.com");
  assert.equal(claveDeDominio("  ejemplo.com "), "ejemplo.com");
});

test("comportamiento 1: un dominio escrito con www en el documento reencuentra su misma ranura", async () => {
  const grilla = grillaMedida();
  (grilla[2] as string[])[columnIndexFromLetter("F")] = "https://www.doctormunguia.com/";
  const g = doble(grilla);

  const resumen = await upsertColumns(g, modelo, [CINCO[3] as Record<string, unknown>], { dryRun: false });
  assert.equal(resumen.actualizadas, 1);
  assert.equal(resumen.columnasNuevas, 0);
  assert.equal(resumen.asignaciones[0]?.letra, "F");
});

// ---------------------------------------------------------------------------
// comportamiento 2: el que ya esta se actualiza en su columna, el nuevo ocupa la siguiente libre
// ---------------------------------------------------------------------------

test("comportamiento 2: un competidor que ya esta se actualiza EN SU COLUMNA y no se mueve", async () => {
  const grilla = grillaMedida();
  (grilla[2] as string[])[columnIndexFromLetter("N")] = "clinicarthromeds.pe";
  const g = doble(grilla);

  const resumen = await upsertColumns(g, modelo, CINCO, { dryRun: false });
  const arthro = resumen.asignaciones.find((a) => a.domain === "clinicarthromeds.pe");
  assert.equal(arthro?.letra, "N", "estaba en la N y ahi se queda, aunque sea el ultimo de la lista");
  assert.equal(arthro?.accion, "actualiza");
  assert.equal(g.celda("N3"), "clinicarthromeds.pe");
  assert.equal(g.celda("N5"), "21");
});

test("comportamiento 2: un competidor nuevo ocupa la siguiente ranura libre, sin desplazar a nadie", async () => {
  const grilla = grillaMedida();
  (grilla[2] as string[])[columnIndexFromLetter("J")] = "drciezatraumatologia.com";
  const g = doble(grilla);

  const resumen = await upsertColumns(g, modelo, CINCO, { dryRun: false });
  assert.equal(resumen.asignaciones.find((a) => a.domain === "drciezatraumatologia.com")?.letra, "J");
  const letras = resumen.asignaciones.map((a) => a.letra).sort();
  assert.deepEqual(letras, ["B", "F", "J", "N", "R"], "las cinco ranuras, sin repetir ninguna");
});

test("comportamiento 2: un sexto competidor no entra y se reporta, en vez de pisar a otro", async () => {
  const g = doble();
  const seis = [...CINCO, { domain: "uno-de-mas.com", name: "El sexto" }];
  const resumen = await upsertColumns(g, modelo, seis, { dryRun: false });

  assert.equal(resumen.asignaciones.length, 5);
  assert.deepEqual(resumen.sinRanura, ["uno-de-mas.com"]);
  assert.match(describirResumen(resumen, TAB), /SIN RANURA \(1\)/);
});

// ---------------------------------------------------------------------------
// comportamiento 3: solo se tocan las filas declaradas
// ---------------------------------------------------------------------------

test("comportamiento 3: una fila que el modelo NO declara queda intacta despues de una actualizacion", async () => {
  const g = doble();
  // Una fila vacia que el modelo no declara. Sigue sin declararse: tiene que quedarse vacia.
  const antesFila11 = [...(g.grilla[10] as string[])];

  await upsertColumns(g, modelo, CINCO, { dryRun: false });
  await upsertColumns(g, modelo, CINCO, { dryRun: false });

  assert.deepEqual(g.grilla[10], antesFila11, "la fila 11 no esta declarada: nadie la escribe");
});

test("comportamiento 3: los titulos de seccion de la columna B sobreviven a la carga", async () => {
  const g = doble();
  await upsertColumns(g, modelo, CINCO, { dryRun: false });

  assert.equal(g.celda("B1"), "Competitor Analysis ");
  assert.equal(g.celda("B4"), "Key Stats ");
  assert.equal(g.celda("B11"), "Traffic Breakdown by Country ");
  assert.equal(g.celda("B17"), "Keywords");
  assert.equal(g.celda("B23"), "Featured Snippets ");
  assert.equal(g.celda("B25"), "Páginas principales (#10)");
  assert.equal(g.celda("B31"), "Most Linked Content (#11)");
});

test("comportamiento 3: la etiqueta de la fila 25 y sus 108 espacios finales quedan intactas", async () => {
  const g = doble();
  await upsertColumns(g, modelo, CINCO, { dryRun: false });

  const etiqueta = g.celda("A25");
  assert.equal(etiqueta, ETIQUETA_FILA_25);
  assert.equal(etiqueta.length, 139);
  assert.equal(etiqueta.trimEnd().length, 31);
});

test("comportamiento 3: ningun rango escrito alcanza una fila de titulo", async () => {
  const g = doble();
  const resumen = await upsertColumns(g, modelo, CINCO, { dryRun: true });
  const titulos = new Set(modelo.filasDeTitulo.map((t) => t.row));

  for (const update of resumen.updates) {
    const m = /!([A-Z]+)(\d+):[A-Z]+(\d+)$/.exec(update.range);
    assert.ok(m !== null, `rango con forma inesperada: ${update.range}`);
    for (let fila = Number(m[2]); fila <= Number(m[3]); fila += 1) {
      assert.ok(!titulos.has(fila), `el rango ${update.range} alcanza la fila de titulo ${fila}`);
    }
  }
});

test("comportamiento 3: la columna A, que lleva las etiquetas, nunca aparece en un rango escrito", async () => {
  const g = doble();
  const resumen = await upsertColumns(g, modelo, CINCO, { dryRun: true });
  for (const update of resumen.updates) {
    assert.doesNotMatch(update.range, /!A\d+:/, `el rango ${update.range} escribiria sobre las etiquetas`);
  }
});

// ---------------------------------------------------------------------------
// comportamiento 4: la columna de la plantilla se reutiliza, no se borra aparte
// ---------------------------------------------------------------------------

test("comportamiento 4: la ranura del competidor de ejemplo se REUTILIZA y `pera` queda sobrescrito", async () => {
  const g = doble();
  assert.equal(g.celda("B2"), "pera");
  assert.equal(g.celda("B3"), "pera.com");

  const resumen = await upsertColumns(g, modelo, CINCO, { dryRun: false });

  const primera = resumen.asignaciones.find((a) => a.letra === "B");
  assert.equal(primera?.accion, "ocupa");
  assert.equal(primera?.dominioAnterior, "pera.com");
  assert.equal(g.celda("B2"), "Dr. Paul Carranza");
  assert.equal(g.celda("B3"), "drcarranzacolumna.com");
  assert.equal(g.celda("B5"), "18", "el DR 20 del residuo queda reemplazado por el real");
  assert.equal(g.celda("B6"), "4820371", "y el AR 13 tambien");
});

test("comportamiento 4: el residuo no se borra con una operacion aparte: no hay ninguna", async () => {
  const g = doble();
  await upsertColumns(g, modelo, CINCO, { dryRun: false });
  // La doble lanza si el escritor llamara a deleteRows o deleteColumns. Llegar hasta aca ya lo
  // prueba; la afirmacion deja escrito el motivo.
  assert.equal(g.escrituras.length, 1, "una sola peticion por lotes, y ninguna de borrado");
});

test("comportamiento 4: el ensayo muestra el residuo que se va a sobrescribir, celda por celda", async () => {
  const g = doble();
  const resumen = await upsertColumns(g, modelo, CINCO);
  const texto = describirResumen(resumen, TAB);

  assert.match(texto, /sobrescribe B2 = "pera"/);
  assert.match(texto, /sobrescribe B3 = "pera\.com"/);
  assert.match(texto, /sobrescribe B5 = "20"/);
  assert.match(texto, /sobrescribe B24 = "6"/);
});

// ---------------------------------------------------------------------------
// comportamiento 5: nada se escribe de forma que el documento lo evalue como formula
// ---------------------------------------------------------------------------

test("comportamiento 5: un valor que empieza por signo igual se escribe como texto y no como formula", async () => {
  const g = doble();
  await upsertColumns(
    g,
    modelo,
    [{ domain: "hostil.test", name: "=IMPORTXML(\"http://x\",\"//a\")", keyword1: "+1234", keyword2: "-uno", keyword3: "@arroba" }],
    { dryRun: false },
  );

  const enviadas = g.escrituras
    .flat()
    .flatMap((u) => u.values.flat())
    .filter((c): c is string => typeof c === "string" && c !== "");

  // Primero, que los cuatro valores hostiles hayan llegado de verdad al lote: si no, el bucle
  // de abajo pasaria sin comprobar nada.
  const hostiles = enviadas.filter((c) => c.startsWith("'"));
  assert.equal(hostiles.length, 4, "los cuatro valores hostiles tienen que estar en el lote");
  assert.ok(hostiles.some((c) => c.startsWith("'=IMPORTXML")));

  for (const celda of enviadas) {
    assert.ok(
      !["=", "+", "-", "@"].includes(celda.charAt(0)),
      `la celda ${JSON.stringify(celda)} llegaria al documento como formula`,
    );
  }

  // Y el documento lo lee como texto plano, sin el apostrofo, que es formato y no contenido.
  assert.equal(g.celda("B2"), '=IMPORTXML("http://x","//a")');
  assert.equal(g.celda("B18"), "+1234");
});

test("comportamiento 5: el modo de entrada es siempre literal", async () => {
  const g = doble();
  await upsertColumns(g, modelo, CINCO, { dryRun: false });
  assert.deepEqual(g.modos, ["RAW"]);
});

test("comportamiento 5: un campo ausente deja la celda VACIA y nunca un cero", async () => {
  const g = doble();
  await upsertColumns(g, modelo, [{ domain: "sin-datos.test", name: "Sin datos" }], { dryRun: false });

  assert.equal(g.celda("B3"), "sin-datos.test");
  assert.equal(g.celda("B5"), "", "no_consultado y 0 son cosas distintas");
  assert.equal(g.celda("B7"), "");
});

test("comportamiento 5: las filas declaradas como no consultadas escriben su literal", async () => {
  const g = doble();
  await upsertColumns(g, modelo, CINCO, { dryRun: false });
  // La fila 12, `Country 1`, esta declarada `no-consultado` con literal `no_consultado`.
  //
  // Esta prueba miraba la fila 8 hasta el plan 13-04. Dejo de servir ahi porque esa fila SI se
  // consulto: `site-explorer/metrics` trajo el trafico organico en la misma llamada que las
  // keywords, y mantener el literal habria declarado como no consultado un dato que ya estaba
  // en la cache. El reparto de trafico por pais, en cambio, sigue sin pedirse.
  assert.equal(g.celda("B12"), "no_consultado");
  assert.equal(g.celda("F12"), "no_consultado");
});

// ---------------------------------------------------------------------------
// comportamiento 6: el ensayo no escribe, y es el modo por defecto
// ---------------------------------------------------------------------------

test("comportamiento 6: en modo ensayo no se emite NINGUNA peticion de escritura", async () => {
  const g = doble();
  const resumen = await upsertColumns(g, modelo, CINCO, { dryRun: true });

  assert.equal(resumen.ensayo, true);
  assert.equal(g.escrituras.length, 0);
  assert.equal(g.celda("B3"), "pera.com", "el documento no se movio");
  assert.ok(resumen.updates.length > 0, "pero si calculo lo que escribiria");
});

test("comportamiento 6: el ensayo es el modo POR DEFECTO, sin pasar ninguna bandera", async () => {
  const g = doble();
  const resumen = await upsertColumns(g, modelo, CINCO);

  assert.equal(resumen.ensayo, true);
  assert.equal(g.escrituras.length, 0);
  assert.equal(g.celda("B3"), "pera.com");
});

// ---------------------------------------------------------------------------
// comportamiento 7: si el documento cambio de forma, se aborta con el diff
// ---------------------------------------------------------------------------

test("comportamiento 7: una etiqueta movida de fila aborta con el diff y NO escribe nada", async () => {
  const grilla = grillaMedida();
  // Se corre `Referring Domains` de la fila 7 a la 8. En un tab transpuesto eso escribiria los
  // dominios de referencia encima del trafico estimado sin lanzar nada.
  (grilla[6] as string[])[0] = "";
  (grilla[7] as string[])[0] = "Referring Domains";
  const g = doble(grilla);

  await assert.rejects(
    upsertColumns(g, modelo, CINCO, { dryRun: false }),
    (error: unknown) =>
      error instanceof CliError &&
      /no tiene la forma que declara el modelo/.test((error as Error).message) &&
      /fila 7/.test((error as Error).message),
  );
  assert.equal(g.escrituras.length, 0);
  assert.equal(g.celda("B3"), "pera.com");
});

test("comportamiento 7: un titulo de seccion borrado tambien aborta la escritura", async () => {
  const grilla = grillaMedida();
  (grilla[3] as string[])[1] = "";
  const g = doble(grilla);

  await assert.rejects(
    upsertColumns(g, modelo, CINCO, { dryRun: false }),
    (error: unknown) => error instanceof CliError && /titulo de seccion/.test((error as Error).message),
  );
  assert.equal(g.escrituras.length, 0);
});

test("comportamiento 7: el diff nombra las cuatro listas, que es lo que hace depurable el fallo", () => {
  const grilla = grillaMedida();
  (grilla[4] as string[])[0] = "Domain Rating renombrado a mano";
  const deriva = validarForma(modelo, grilla);

  assert.ok(deriva !== null);
  assert.ok(deriva.esperadas.length > 0);
  assert.ok(deriva.reales.length > 0);
  assert.ok(deriva.faltantes.includes("Domain Rating (DR)"));
  assert.ok(deriva.sobrantes.includes("Domain Rating renombrado a mano"));
});

test("comportamiento 7: la comparacion recorta los dos extremos, o la fila 25 no se encontraria jamas", () => {
  assert.equal(validarForma(modelo, grillaMedida()), null, "la grilla medida calza con el modelo");

  const conEspacios = grillaMedida();
  (conEspacios[6] as string[])[0] = "   Referring Domains   ";
  assert.equal(validarForma(modelo, conEspacios), null, "los espacios sobrantes no son una deriva");
});

test("un tab orientado a filas no se puede cargar por este camino", async () => {
  await assert.rejects(
    cargarModeloTranspuesto("Keyword Research"),
    (error: unknown) => error instanceof CliError && /orientacion filas/.test((error as Error).message),
  );
});

// ---------------------------------------------------------------------------
// Determinismo
// ---------------------------------------------------------------------------

test("dos ensayos sobre el mismo documento producen exactamente el mismo lote de rangos", async () => {
  const uno = await upsertColumns(doble(), modelo, CINCO);
  const dos = await upsertColumns(doble(), modelo, CINCO);
  assert.deepEqual(uno.updates, dos.updates);
});

test("el resumen reporta cero columnas nuevas al recargar, que es lo que mide SHEET-06", async () => {
  const g = doble();
  await upsertColumns(g, modelo, CINCO, { dryRun: false });
  const segunda = await upsertColumns(g, modelo, CINCO, { dryRun: false });
  assert.match(describirResumen(segunda, TAB), /columnas nuevas: 0/);
});

/** Tipos usados solo para que el compilador ate la doble al puerto real. */
export type _Modelo = ModeloTranspuesto;
