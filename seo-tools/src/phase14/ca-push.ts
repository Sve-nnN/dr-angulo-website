#!/usr/bin/env tsx
/**
 * Punto de entrada: carga los canonicals propuestos en el tab `Canonical Audit` (SHEET-04).
 *
 * Misma disciplina que `cm-push.ts`, con las mismas cinco defensas, y una sexta que este tab
 * necesita y el otro no:
 *
 *   6. Las columnas de SEGUIMIENTO se siembran una sola vez. `Approved?` e `Implemented?` no
 *      son dato del repositorio: son las dos celdas donde Juan responde. El cargador escribe el
 *      valor inicial cuando la celda esta vacia y a partir de ahi la deja fuera de toda
 *      peticion. Sin esta defensa, la segunda corrida devolveria las 24 filas a "No" y borraria
 *      lo que el cliente hubiera aprobado en el medio, con un resumen diciendo que todo salio
 *      bien. Ver `seguimiento.ts`.
 *
 * ENSAYO POR DEFECTO. Hay que pedir la escritura con `--yes`.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase14/ca-push.ts --data data/canonicals.json --dry-run
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase14/ca-push.ts --data data/canonicals.json --yes
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { booleana, ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { getSheetsSession } from "../sheets/client.js";
import { loadSheetModel, loadTabSchema, type TabModel } from "../sheets/schema.js";
import { createGoogleWriteGateway, upsertRows, type WriteGateway } from "../sheets/upsert.js";
import { SIN_PRIMARIA_EN_EL_DOCUMENTO, type ArchivoDeCanonicals, type FilaDeCanonical } from "./canonical.js";
import { columnasPropiasAusentes } from "./cm-push.js";
import { leerYaSembrado, porSembrar, sembrarSoloUnaVez } from "./seguimiento.js";

const TAB = "Canonical Audit";
const POR_DEFECTO = "data/canonicals.json";

/** Estado de columna que esta carga tiene permitido escribir. Uno solo, y a proposito. */
const ESTADO_PROPIO = "fase-14" as const;

/** Las dos columnas que responde el cliente y que el cargador no pisa nunca. */
export const CAMPOS_DE_SEGUIMIENTO = ["aprobado", "implementado"] as const;

/** Dominio canonico del sitio. Solo lo usa la home, por el mismo motivo que en `cm-push.ts`. */
const SITIO = "https://drangulocolumna.com";

/**
 * Lo que va en la columna `URL`, que ademas es la CLAVE del upsert.
 *
 * Se repite la forma exacta de `cm-push.ts` y no es duplicacion perezosa: los dos tabs los lee
 * la misma persona uno al lado del otro, y si `Content Model` dijera `/servicios` y
 * `Canonical Audit` dijera `https://drangulocolumna.com/servicios`, cruzarlos a ojo dejaria de
 * ser posible. La home viaja absoluta porque su ruta normaliza a cadena vacia y el upsert
 * saltea las claves vacias (bug del plan 14-03, defensa 5).
 */
export function claveDeCanonical(f: FilaDeCanonical): string {
  return f.url === "/" ? `${SITIO}/` : f.url;
}

/**
 * Proyeccion de una fila del dataset a la fila que el tab espera.
 *
 * `keyword` es el unico campo que se traduce: en el dataset una URL que no compite trae `null`,
 * que es la verdad; en el documento del cliente un blanco se lee como olvido, asi que la celda
 * escribe la decision con todas las letras. Es la misma regla que el plan 14-03 fijo para
 * `Content Model`, y por eso las dos celdas dicen exactamente lo mismo.
 */
export function filaDeCanonicalAudit(f: FilaDeCanonical): Record<string, unknown> {
  return {
    url: claveDeCanonical(f),
    keyword: f.keyword ?? SIN_PRIMARIA_EN_EL_DOCUMENTO,
    topic: f.topic,
    canonical: f.canonical,
    aprobado: f.aprobado,
    implementado: f.implementado,
  };
}

/** Lee el dataset y valida lo minimo para no escribir celdas vacias sobre el documento. */
export function leerCanonicals(destino: string): FilaDeCanonical[] {
  const ruta = path.isAbsolute(destino) ? destino : path.join(SEO_TOOLS_ROOT, destino);
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${ruta}.\n` +
        `  Accion: correr antes src/phase14/canonical.ts para generarlo.`,
    );
  }

  const archivo = JSON.parse(crudo) as ArchivoDeCanonicals;
  const filas = archivo.filas ?? [];
  filas.forEach((f, i) => {
    for (const campo of ["url", "topic", "canonical", "aprobado", "implementado"] as const) {
      if (typeof f[campo] !== "string" || f[campo].trim() === "") {
        throw new CliError(
          `${destino}, fila ${i + 1} (${String(f.url)}): "${campo}" vino vacio.\n` +
            `  La carga se detiene sin escribir nada: un campo vacio borra la celda que ya estaba.`,
        );
      }
    }
    if (!/^https?:\/\//.test(f.canonical)) {
      throw new CliError(
        `${destino}, fila ${i + 1} (${f.url}): el canonical "${f.canonical}" no es absoluto.\n` +
          `  Un canonical relativo no consolida nada.`,
      );
    }
  });
  return [...filas];
}

async function cargar(
  gateway: WriteGateway,
  tab: TabModel,
  filas: readonly FilaDeCanonical[],
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
        `  Accion: correr sheet:inspect y reconciliar seo-tools/data/sheet-columns.json con Juan.`,
    );
  }

  const proyectadas = filas.map(filaDeCanonicalAudit);

  // Defensa 5, heredada del bug de la home del plan 14-03.
  const sinClave = proyectadas
    .map((f, i) => ({ url: filas[i]?.url ?? "?", clave: normalizeKeyword(String(f["url"] ?? "")) }))
    .filter((x) => x.clave === "");
  if (sinClave.length > 0) {
    throw new CliError(
      `Estas URLs quedan con clave vacia al normalizar y el upsert las saltearia en silencio: ` +
        `${sinClave.map((x) => JSON.stringify(x.url)).join(", ")}.\n` +
        `  La carga se detiene sin escribir nada.`,
    );
  }

  // Defensa 6: las dos columnas del cliente se siembran una sola vez.
  const yaSembrado = await leerYaSembrado(gateway, schema, CAMPOS_DE_SEGUIMIENTO);
  const registros = proyectadas.map((fila) =>
    sembrarSoloUnaVez(fila, normalizeKeyword(String(fila["url"] ?? "")), yaSembrado),
  );
  const siembras = porSembrar(registros, CAMPOS_DE_SEGUIMIENTO);

  const resumen = await upsertRows(gateway, tab, registros, {
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
    out.write(`Claves repetidas que YA estaban en el tab: ${resumen.duplicadosPreexistentes.length}.\n`);
    for (const d of resumen.duplicadosPreexistentes) {
      out.write(`  ${d.clave}: filas ${d.filas.join(", ")}\n`);
    }
    out.write(`\n`);
  }

  out.write(
    `celdas de seguimiento por sembrar: ${siembras} de ${registros.length * CAMPOS_DE_SEGUIMIENTO.length} ` +
      `(el resto ya tiene respuesta del cliente y queda intacto)\n`,
  );

  // Bloque de CONTRATO con el verify del plan.
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

  const filas = leerCanonicals(data);
  if (filas.length === 0) throw new CliError(`${data} no trae ni una fila.`);

  const modelo = await loadSheetModel();
  const tab = modelo.tabs[TAB];
  if (tab === undefined) throw new CliError(`El tab "${TAB}" no esta en el modelo de columnas.`);

  const session = await getSheetsSession();
  const gateway = createGoogleWriteGateway(session);

  const out = process.stdout;
  out.write(`Documento: ${session.config.spreadsheetId}\n`);
  out.write(`Tab: ${tab.sheetTitle} (fila de encabezados ${tab.headerRow ?? "ninguna"})\n`);
  out.write(`Datos: ${data} (${filas.length} URLs)\n`);
  out.write(ensayo ? "Modo: ENSAYO. No se escribe nada.\n\n" : "Modo: CARGA REAL.\n\n");

  await cargar(gateway, tab, filas, ensayo);

  if (ensayo) out.write(`\nEsto fue un ENSAYO. Para cargar de verdad, repetir con --yes.\n`);
  return 0;
}

// Solo corre como ejecutable. Importarlo desde una prueba no dispara la carga.
if (process.argv[1] !== undefined && process.argv[1].endsWith("ca-push.ts")) {
  ejecutar(main);
}
