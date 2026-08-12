#!/usr/bin/env tsx
/**
 * Punto de entrada: carga el mapa keyword -> URL en el tab `Content Model` (SHEET-02).
 *
 * Envuelve al escritor idempotente del plan 12-02 sin tocarlo. Existe como punto de entrada
 * propio porque la tabla de subcomandos de `src/cli.ts` quedo CERRADA al terminar la fase 12.
 *
 * CUATRO DEFENSAS, Y NINGUNA ES DECORATIVA. El tab que se escribe aca es un documento vivo que
 * el cliente lee, asi que un borrado silencioso es dano real (T-14-01).
 *
 *   1. El permiso de escritura se declara en `estadosPropios` y vale para las columnas de la
 *      fase 14 y nada mas. Las tres de Ahrefs, las dos de GSC y las demas de la plantilla no
 *      son destino de escritura: quedan fuera de todo rango que salga de aca (J-1, D-13).
 *   2. El upsert corre con `omitirCamposAusentes`, asi que una columna cuyo campo no venga en
 *      el registro queda INTACTA en vez de vaciarse.
 *   3. No se agrega ni una columna al tab: `addMissingColumns` va en falso y ademas se
 *      comprueba que el resumen reporte cero agregadas. La forma del documento del cliente no
 *      la cambia una carga de datos.
 *   4. Cada columna que la fase declara como suya tiene que existir de verdad en la fila de
 *      encabezados. Una columna declarada que no se encuentra se saltaria en silencio y el
 *      resumen diria "actualizadas: 9" sin que el dato hubiera llegado a ninguna celda.
 *
 * ENSAYO POR DEFECTO. Hay que pedir la escritura con `--yes`.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase14/cm-push.ts --data data/url-map.jsonl --dry-run
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase14/cm-push.ts --data data/url-map.jsonl --yes
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT, resolveFromRepoRoot } from "../config.js";
import { booleana, ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { getSheetsSession } from "../sheets/client.js";
import { loadSheetModel, loadTabSchema, trimHeader, type TabModel } from "../sheets/schema.js";
import { createGoogleWriteGateway, upsertRows, type WriteGateway } from "../sheets/upsert.js";
import { validarAsignacion, type AsignacionDeUrl } from "./model.js";

const TAB = "Content Model";
const POR_DEFECTO = "data/url-map.jsonl";

/** Estado de columna que esta carga tiene permitido escribir. Uno solo, y a proposito. */
const ESTADO_PROPIO = "fase-14" as const;

/** Lo que se escribe en la columna `Keyword` de una URL que declara que no compite. */
export const SIN_PRIMARIA = "Sin keyword primaria (decisión)";

/**
 * Proyeccion del mapa a la fila que el tab espera.
 *
 * Existe porque el modelo interno y el documento del cliente NO hablan el mismo idioma y
 * fingir que si lo hacen se paga en la lectura del cliente. `estado` vale `viva` o
 * `planificada`, que es lo correcto para un inventario medido del codigo; la columna del
 * documento pregunta si la pagina es nueva o existente, que es la misma informacion contada
 * desde donde la va a leer Juan. Lo mismo con el booleano: una celda que dice TRUE no es una
 * respuesta a la pregunta que el encabezado hace.
 *
 * Los campos que NO estan en esta proyeccion son tan importantes como los que estan: sin campo
 * en el registro, `omitirCamposAusentes` deja esa celda literalmente fuera de la peticion.
 */
export function filaDeContentModel(a: AsignacionDeUrl): Record<string, unknown> {
  const capitalizar = (valor: string): string => valor.charAt(0).toUpperCase() + valor.slice(1);
  return {
    url: a.url,
    esPaginaSeo: a.esPaginaSeo ? "Sí" : "No",
    // Una URL sin primaria escribe la DECISION en la celda y no la deja en blanco. En el
    // documento del cliente una celda vacia se lee como un olvido —y `/sedes` es justamente lo
    // contrario: es la decision de Juan del 2026-08-11 de que ese hub deje de canibalizar a las
    // cuatro sedes. El texto dice que no compite; el blanco no dice nada.
    keywordPrimaria: a.keywordPrimaria ?? SIN_PRIMARIA,
    intent: capitalizar(a.intent),
    tipoDePagina: a.tipoDePagina,
    nuevaOExistente: a.estado === "planificada" ? "Nueva" : "Existente",
    cluster: a.cluster ?? "",
    accion: capitalizar(a.accion),
    dejarActualizarEliminar: capitalizar(a.dejarActualizarEliminar),
  };
}

/** Lee el mapa y valida cada linea contra el contrato de `model.ts`. */
export async function leerMapa(ruta: string): Promise<AsignacionDeUrl[]> {
  const candidatas = [resolveFromRepoRoot(ruta), path.resolve(SEO_TOOLS_ROOT, ruta)];
  let crudo: string | undefined;
  let usada = candidatas[0] as string;

  for (const candidata of candidatas) {
    try {
      crudo = await readFile(candidata, "utf8");
      usada = candidata;
      break;
    } catch {
      // Se prueba la siguiente.
    }
  }
  if (crudo === undefined) {
    throw new CliError(
      `No se pudo leer el mapa.\n  Rutas probadas:\n${[...new Set(candidatas)]
        .map((c) => `    - ${c}`)
        .join("\n")}`,
    );
  }

  const asignaciones: AsignacionDeUrl[] = [];
  crudo.split("\n").forEach((linea, i) => {
    const t = linea.trim();
    if (t === "") return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(t);
    } catch {
      throw new CliError(`${usada} tiene una linea que no es JSON valido: linea ${i + 1}.`);
    }
    try {
      asignaciones.push(validarAsignacion(parsed, `${usada}, linea ${i + 1}`));
    } catch (error) {
      throw new CliError(
        `${String(error instanceof Error ? error.message : error)}\n` +
          `  La carga se detiene sin escribir nada: un registro incompleto escribiria celdas\n` +
          `  vacias sobre el documento del cliente sin lanzar ninguna excepcion.`,
      );
    }
  });

  return asignaciones;
}

/**
 * Defensa 4: toda columna propia declarada tiene que existir en la fila de encabezados real.
 *
 * Se comprueba contra el documento y no contra el modelo: el modelo declara la forma esperada
 * y el punto de esta comprobacion es detectar que el documento ya no la tiene.
 */
export function columnasPropiasAusentes(
  tab: TabModel,
  encabezadosReales: readonly string[],
): string[] {
  const presentes = new Set(encabezadosReales.map(trimHeader));
  return tab.columns
    .filter((c) => c.status === ESTADO_PROPIO)
    .map((c) => c.header)
    .filter((h) => !presentes.has(trimHeader(h)));
}

async function cargar(
  gateway: WriteGateway,
  tab: TabModel,
  asignaciones: readonly AsignacionDeUrl[],
  ensayo: boolean,
): Promise<void> {
  const out = process.stdout;

  const schema = await loadTabSchema(gateway, tab, { addMissingColumns: false });
  const ausentes = columnasPropiasAusentes(tab, schema.headers);
  if (ausentes.length > 0) {
    throw new CliError(
      `El tab "${tab.sheetTitle}" ya no trae ${ausentes.map((h) => JSON.stringify(h)).join(", ")}.\n` +
        `  La carga se detiene sin escribir nada.\n` +
        `  Una columna declarada que no se encuentra se salta en silencio, y el resumen\n` +
        `  reportaria filas actualizadas sin que el dato haya llegado a ninguna celda.\n` +
        `  Accion: correr sheet:inspect y reconciliar seo-tools/data/sheet-columns.json con Juan\n` +
        `  antes de volver a cargar.`,
    );
  }

  const resumen = await upsertRows(gateway, tab, asignaciones.map(filaDeContentModel), {
    dryRun: ensayo,
    addMissingColumns: false,
    omitirCamposAusentes: true,
    estadosPropios: [ESTADO_PROPIO],
  });

  if (resumen.columnasAgregadas !== 0) {
    throw new CliError(
      `La carga reporto ${resumen.columnasAgregadas} columnas agregadas y tenian que ser cero.\n` +
        `  Esta fase no cambia la forma del documento del cliente (D-13).`,
    );
  }

  if (resumen.duplicadosPreexistentes.length > 0) {
    out.write(
      `Claves repetidas que YA estaban en el tab: ${resumen.duplicadosPreexistentes.length}. ` +
        `Se actualiza la primera aparicion de cada una.\n`,
    );
    for (const d of resumen.duplicadosPreexistentes) {
      out.write(`  ${d.clave}: filas ${d.filas.join(", ")}\n`);
    }
    out.write(`\n`);
  }
  if (resumen.duplicadosEnDataset.length > 0) {
    out.write(`Claves repetidas dentro del mapa: ${resumen.duplicadosEnDataset.length}. Gana la ultima.\n\n`);
  }

  // Bloque de CONTRATO con el verify del plan. Cambiar el formato obliga a actualizar los
  // criterios de aceptacion en el mismo commit.
  out.write(`actualizadas: ${resumen.actualizadas}\n`);
  out.write(`insertadas: ${resumen.insertadas}\n`);
  out.write(`columnasAgregadas: ${resumen.columnasAgregadas}\n`);
  out.write(`llamadas de red: ${resumen.llamadasDeRed}\n`);
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const data = texto(banderas, "data") ?? POR_DEFECTO;

  if (booleana(banderas, "yes") && booleana(banderas, "dry-run")) {
    throw new CliError("--yes y --dry-run se contradicen. Elegir uno.");
  }
  const ensayo = !booleana(banderas, "yes");

  const asignaciones = await leerMapa(data);
  if (asignaciones.length === 0) throw new CliError(`${data} no trae ni un registro.`);

  const modelo = await loadSheetModel();
  const tab = modelo.tabs[TAB];
  if (tab === undefined) throw new CliError(`El tab "${TAB}" no esta en el modelo de columnas.`);

  const session = await getSheetsSession();
  const gateway = createGoogleWriteGateway(session);

  const out = process.stdout;
  out.write(`Documento: ${session.config.spreadsheetId}\n`);
  out.write(`Tab: ${tab.sheetTitle} (fila de encabezados ${tab.headerRow ?? "ninguna"})\n`);
  out.write(`Mapa: ${data} (${asignaciones.length} URLs)\n`);
  out.write(ensayo ? "Modo: ENSAYO. No se escribe nada.\n\n" : "Modo: CARGA REAL.\n\n");

  await cargar(gateway, tab, asignaciones, ensayo);

  if (ensayo) out.write(`\nEsto fue un ENSAYO. Para cargar de verdad, repetir con --yes.\n`);
  return 0;
}

// Solo corre como ejecutable. Importarlo desde una prueba no dispara la carga.
if (process.argv[1] !== undefined && process.argv[1].endsWith("cm-push.ts")) {
  ejecutar(main);
}
