#!/usr/bin/env tsx
/**
 * Punto de entrada: llena `Suggested H1` y `URL` en el tab `Keyword Research` (ONPAGE-02).
 *
 * ESCRIBE SOBRE UN TAB DE 5716 FILAS QUE YA ESCRIBIERON TRES FASES. Esa es la unica caracteristica
 * relevante de esta carga y de ella salen todas sus defensas:
 *
 *   1. `estadosPropios: ["fase-14", "fase-15"]`. El valor por defecto de `upsertRows` habilita
 *      fase 12, fase 13, `nueva` y `no-consultado`, y este tab tiene columnas de las tres primeras
 *      llenas en las 5716 filas. Como el escritor coalesce columnas contiguas en un solo rango,
 *      bastaria con que una columna ajena quedara en medio de dos propias para sobreescribirla sin
 *      lanzar nada. Con el permiso acotado a estos dos estados, esta carga no puede tocar nada que
 *      no sea suyo.
 *   2. `omitirCamposAusentes: true`. Los 16 registros traen dos campos; las 5700 filas restantes
 *      del tab no entran en la peticion y su celda queda literalmente fuera del rango.
 *   3. `addMissingColumns: false`. Esta fase no cambia la forma del documento del cliente (D-13).
 *   4. Una keyword que no esta en el tab se REPORTA y detiene la carga. Por defecto se insertaria
 *      como fila nueva al final de 5716, sin que nada avise.
 *   5. El modelo tiene que declarar campo para las dos columnas y esos dos estados no pueden
 *      habilitar una tercera. Si alguien agrega una columna con `status: "fase-15"`, la carga se
 *      detiene antes de escribirla sin querer.
 *
 * POR QUE TAMBIEN ESCRIBE `URL`, QUE NO ES DE ESTA FASE. La columna quedo declarada `fase-14` con
 * `field: null`: la fase 14 la reservo, produjo el dato que la llena y cerro sin escribirla.
 * Ningun requisito ONPAGE la nombra. Se cierra acá por oportunidad, no por alcance: este es el
 * unico cargador que vuelve a tocar este tab y el dato ya existe en `url-map.jsonl`. Dejar vacia
 * una columna del entregable del cliente teniendo el dato a mano es el mismo hueco que la
 * verificacion de la fase 14 encontro en las columnas de Ahrefs.
 *
 * ENSAYO POR DEFECTO. Hay que pedir la escritura con `--yes`.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase15/kr-h1-push.ts --data data/onpage.json --dry-run
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase15/kr-h1-push.ts --data data/onpage.json --yes
 *
 * COSTE DE CUOTA: CERO. No consulta ninguna fuente externa de datos de SEO.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { booleana, ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { getSheetsSession } from "../sheets/client.js";
import { loadSheetModel, loadTabSchema, type ColumnStatus, type TabModel } from "../sheets/schema.js";
import { createGoogleWriteGateway, upsertRows, type UpsertSummary, type WriteGateway } from "../sheets/upsert.js";

export const TAB = "Keyword Research";
const POR_DEFECTO = "data/onpage.json";
const RUTA_MAPA = path.join(SEO_TOOLS_ROOT, "data", "url-map.jsonl");

/**
 * Los dos estados que esta carga tiene permitido escribir, y son exactamente dos columnas.
 *
 * `fase-14` esta por la columna `URL`, cuyo dato viene de esa fase y conserva su estado de origen.
 * `fase-15` por `Suggested H1`. Ninguno de los dos esta en el permiso por defecto, que es lo que
 * hace que ampliar el permiso acá no afloje las cargas de las fases 12 y 13.
 */
export const ESTADOS_PROPIOS: readonly ColumnStatus[] = ["fase-14", "fase-15"];

/** Las dos columnas que este cargador escribe, con el campo que las alimenta. */
const COLUMNAS_PROPIAS: readonly { header: string; field: string }[] = [
  { header: "URL", field: "url" },
  { header: "Suggested H1", field: "suggestedH1" },
];

export interface FilaConH1 {
  readonly url: string;
  readonly keywordPrimaria: string | null;
  readonly h1: string | null;
}

export interface FilaDelMapa {
  readonly url: string;
  readonly keywordPrimaria?: string | null;
}

/**
 * Los registros de las keywords primarias: clave, H1 propuesto y URL que la sirve.
 *
 * Se recorre el MAPA y no el paquete: la URL que se escribe es la que la fase 14 asigno, leida de
 * `url-map.jsonl`. Derivarla de la keyword produciria una ruta plausible y equivocada, y desharia
 * una asignacion medida sin que nadie lo note.
 */
export function registrosDeH1(
  filas: readonly FilaConH1[],
  mapa: readonly FilaDelMapa[],
): Record<string, unknown>[] {
  const porUrl = new Map(filas.map((f) => [f.url, f]));
  const registros: Record<string, unknown>[] = [];
  const sinH1: string[] = [];

  for (const fila of mapa) {
    const keyword = fila.keywordPrimaria;
    if (keyword === null || keyword === undefined || keyword === "") continue;

    const enElPaquete = porUrl.get(fila.url);
    if (enElPaquete?.h1 === undefined || enElPaquete.h1 === null || enElPaquete.h1 === "") {
      sinH1.push(`${fila.url} (${keyword})`);
      continue;
    }
    registros.push({ keyword, suggestedH1: enElPaquete.h1, url: fila.url });
  }

  if (sinH1.length > 0) {
    throw new CliError(
      `${sinH1.length} URL(s) con keyword primaria no traen H1 en el paquete: ${sinH1.join(", ")}.\n` +
        `  La carga se detiene sin escribir nada: un H1 vacio borraria la celda que ya estaba.\n` +
        `  Accion: regenerar el mapa de metadatos con src/phase15/metadatos.ts --out data/onpage.json`,
    );
  }
  return registros;
}

/**
 * Comprueba que el modelo habilite exactamente las dos columnas de esta carga y ninguna mas.
 *
 * Los dos criterios son distintos y los dos hacen falta. Sin campo, la columna se saltearia en
 * silencio y el resumen reportaria filas actualizadas sin que el dato llegara a ninguna celda. Con
 * una tercera columna de esos estados, el permiso ampliado escribiria una celda que nadie penso.
 */
export function verificarModelo(tab: TabModel): void {
  const propias = tab.columns.filter((c) => ESTADOS_PROPIOS.includes(c.status));

  if (propias.length !== COLUMNAS_PROPIAS.length) {
    throw new CliError(
      `Los estados ${ESTADOS_PROPIOS.join(", ")} habilitan ${propias.length} columna(s) del tab ` +
        `"${TAB}" y tenian que habilitar ${COLUMNAS_PROPIAS.length}: ` +
        `${propias.map((c) => JSON.stringify(c.header)).join(", ")}.\n` +
        `  La carga se detiene sin escribir nada.\n` +
        `  El permiso de esta carga es de dos columnas. Una tercera con uno de esos estados se ` +
        `escribiria sin que nadie lo hubiera pedido.\n` +
        `  Accion: revisar seo-tools/data/sheet-columns.json con Juan.`,
    );
  }

  for (const esperada of COLUMNAS_PROPIAS) {
    const columna = propias.find((c) => c.header === esperada.header);
    if (columna === undefined) {
      throw new CliError(
        `El tab "${TAB}" ya no declara la columna ${JSON.stringify(esperada.header)} con un ` +
          `estado propio de esta carga.\n  La carga se detiene sin escribir nada.`,
      );
    }
    if (columna.field !== esperada.field) {
      throw new CliError(
        `La columna ${JSON.stringify(esperada.header)} declara field ` +
          `${JSON.stringify(columna.field)} y esta carga espera ${JSON.stringify(esperada.field)}.\n` +
          `  La carga se detiene sin escribir nada: una columna sin campo se saltea en silencio y ` +
          `el resumen reportaria filas actualizadas sin que el dato llegara a ninguna celda.\n` +
          `  Accion: habilitar la columna en seo-tools/data/sheet-columns.json.`,
      );
    }
  }
}

/**
 * Escribe los registros en el tab. Detiene la carga si alguna clave no esta ya en el documento.
 *
 * La comprobacion de claves ausentes se hace ANTES de escribir y no leyendo el resumen despues:
 * con `dryRun` en falso, para cuando el resumen dice `insertadas: 1` la fila ya se inserto.
 */
export async function cargar(
  gateway: WriteGateway,
  tab: TabModel,
  registros: readonly Record<string, unknown>[],
  ensayo: boolean,
): Promise<UpsertSummary> {
  verificarModelo(tab);

  const schema = await loadTabSchema(gateway, tab, { addMissingColumns: false });
  const columnaClave = schema.byHeader.get((tab.keyHeader ?? "").trim());
  if (columnaClave === undefined) {
    throw new CliError(
      `No se encontro la columna clave ${JSON.stringify(tab.keyHeader)} en "${TAB}".\n` +
        `  La carga se detiene sin escribir nada.`,
    );
  }

  const enElTab = new Set(
    (await gateway.readColumn(TAB, columnaClave.letter, schema.firstDataRow))
      .map((valor) => normalizeKeyword(valor))
      .filter((clave) => clave !== ""),
  );

  const ausentes = registros
    .map((r) => String(r["keyword"] ?? ""))
    .filter((keyword) => !enElTab.has(normalizeKeyword(keyword)));

  if (ausentes.length > 0) {
    throw new CliError(
      `${ausentes.length} keyword(s) del mapa no estan en el tab "${TAB}": ` +
        `${ausentes.map((k) => JSON.stringify(k)).join(", ")}.\n` +
        `  La carga se detiene sin escribir nada.\n` +
        `  No se insertan como filas nuevas: quedarian al final de las 5716 que ya estan, en un ` +
        `documento que el cliente lee todos los dias, y sin ninguna de las metricas que tienen sus ` +
        `vecinas.\n` +
        `  Accion: comprobar que la keyword este escrita igual que en data/keywords-13.jsonl.`,
    );
  }

  const resumen = await upsertRows(gateway, tab, registros, {
    dryRun: ensayo,
    addMissingColumns: false,
    omitirCamposAusentes: true,
    estadosPropios: ESTADOS_PROPIOS,
  });

  if (resumen.columnasAgregadas !== 0) {
    throw new CliError(
      `La carga reporto ${resumen.columnasAgregadas} columnas agregadas y tenian que ser cero.\n` +
        `  Esta fase no cambia la forma del documento del cliente (D-13).`,
    );
  }
  return resumen;
}

// ---------------------------------------------------------------------------
// Lectura de los datasets
// ---------------------------------------------------------------------------

export function leerOnPage(destino: string): FilaConH1[] {
  const ruta = path.isAbsolute(destino) ? destino : path.join(SEO_TOOLS_ROOT, destino);
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${ruta}.\n` +
        `  Accion: generarlo con ./node_modules/.bin/tsx src/phase15/metadatos.ts --out ${POR_DEFECTO}`,
    );
  }
  const archivo = JSON.parse(crudo) as { readonly filas?: readonly FilaConH1[] };
  return [...(archivo.filas ?? [])];
}

export function leerMapa(rutaArchivo: string = RUTA_MAPA): FilaDelMapa[] {
  let crudo: string;
  try {
    crudo = readFileSync(rutaArchivo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${rutaArchivo}.\n` +
        `  Accion: es el mapa de la fase 14, de solo lectura. Sin el no hay URL que escribir.`,
    );
  }
  return crudo
    .split("\n")
    .filter((linea) => linea.trim() !== "")
    .map((linea) => JSON.parse(linea) as FilaDelMapa);
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const data = texto(banderas, "data") ?? POR_DEFECTO;

  if (booleana(banderas, "yes") && booleana(banderas, "dry-run")) {
    throw new CliError("--yes y --dry-run se contradicen. Elegir uno.");
  }
  const ensayo = !booleana(banderas, "yes");

  const registros = registrosDeH1(leerOnPage(data), leerMapa());
  if (registros.length === 0) throw new CliError(`${data} no produjo ni un registro que cargar.`);

  const modelo = await loadSheetModel();
  const tab = modelo.tabs[TAB];
  if (tab === undefined) throw new CliError(`El tab "${TAB}" no esta en el modelo de columnas.`);
  verificarModelo(tab);

  const session = await getSheetsSession();
  const gateway = createGoogleWriteGateway(session);

  const out = process.stdout;
  out.write(`Documento: ${session.config.spreadsheetId}\n`);
  out.write(`Tab: ${tab.sheetTitle} (fila de encabezados ${tab.headerRow ?? "ninguna"})\n`);
  out.write(`Datos: ${data} (${registros.length} keywords primarias)\n`);
  out.write(`Columnas: ${COLUMNAS_PROPIAS.map((c) => c.header).join(", ")}\n`);
  out.write(ensayo ? "Modo: ENSAYO. No se escribe nada.\n\n" : "Modo: CARGA REAL.\n\n");

  const resumen = await cargar(gateway, tab, registros, ensayo);

  if (resumen.duplicadosPreexistentes.length > 0) {
    out.write(`Claves repetidas que YA estaban en el tab: ${resumen.duplicadosPreexistentes.length}.\n`);
    for (const d of resumen.duplicadosPreexistentes) {
      out.write(`  ${d.clave}: filas ${d.filas.join(", ")}\n`);
    }
    out.write(`\n`);
  }

  // Bloque de CONTRATO con el verify del plan.
  out.write(`actualizadas: ${resumen.actualizadas}\n`);
  out.write(`insertadas: ${resumen.insertadas}\n`);
  out.write(`columnasAgregadas: ${resumen.columnasAgregadas}\n`);
  out.write(`llamadas de red: ${resumen.llamadasDeRed}\n`);

  if (ensayo) out.write(`\nEsto fue un ENSAYO. Para cargar de verdad, repetir con --yes.\n`);
  return 0;
}

// Solo corre como ejecutable. Importarlo desde una prueba no dispara la carga.
if (process.argv[1] !== undefined && process.argv[1].endsWith("kr-h1-push.ts")) {
  ejecutar(main);
}
