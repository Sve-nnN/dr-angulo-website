#!/usr/bin/env tsx
/**
 * Punto de entrada: carga la matriz de enlazado en el tab `Internal Linking Audit` (SHEET-05).
 *
 * LO QUE DECIDE SI ESTE CARGADOR ESTA BIEN O MAL ES UNA SOLA COSA: EL MAPEO ES POSICIONAL.
 *
 * El tab trae ocho bloques de tres columnas —`Link N`, `Anchor N` y el titulo de la pagina
 * enlazada— y el encabezado del tercero se repite LAS OCHO VECES, literal, con el mismo texto.
 * Resolver columnas por nombre encuentra la primera y le asigna los ocho destinos: siete de
 * cada ocho enlaces se escribirian en la columna equivocada, o mas bien todos en la misma, y
 * nada de eso lanza una excepcion. El resumen diria "actualizadas: 22" y la matriz estaria
 * destruida (T-14-14). Por eso el modelo declara `mapBy: "posicion"` y por eso este archivo
 * no busca ni una columna por nombre.
 *
 * `Anchor 8` lleva un espacio final en el documento y los otros siete no. El modelo guarda el
 * literal con su espacio; el recorte se hace SOLO al comparar. Editar el modelo para que quede
 * "prolijo" rompe el mapeo posicional en la columna 27.
 *
 * Las ranuras de enlace que una URL no usa se escriben VACIAS a proposito, y no se omiten: las
 * 24 columnas de enlace son de esta fase entera y de nadie mas, asi que dejar el valor viejo de
 * una carga anterior mostraria enlaces que la matriz ya no propone. `omitirCamposAusentes`
 * sigue activo para lo que no es de esta fase, que es donde el borrado silencioso hace dano.
 *
 * La columna `Done` es de SEGUIMIENTO: se siembra una vez y no se vuelve a pisar. Ver
 * `seguimiento.ts`.
 *
 * ENSAYO POR DEFECTO. Hay que pedir la escritura con `--yes`.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase14/il-push.ts --data data/internal-links.json --dry-run
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase14/il-push.ts --data data/internal-links.json --yes
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { booleana, ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { getSheetsSession } from "../sheets/client.js";
import { loadSheetModel, loadTabSchema, type TabModel } from "../sheets/schema.js";
import { createGoogleWriteGateway, upsertRows, type WriteGateway } from "../sheets/upsert.js";
import { MAX_ENLACES, type ArchivoDeEnlaces, type FilaDeEnlazado } from "./links.js";
import { columnasPropiasAusentes } from "./cm-push.js";
import { leerYaSembrado, porSembrar, sembrarSoloUnaVez } from "./seguimiento.js";

const TAB = "Internal Linking Audit";
const POR_DEFECTO = "data/internal-links.json";

/** Estado de columna que esta carga tiene permitido escribir. Uno solo, y a proposito. */
const ESTADO_PROPIO = "fase-14" as const;

/** La columna que responde el cliente y que el cargador no pisa nunca. */
export const CAMPOS_DE_SEGUIMIENTO = ["done"] as const;

/** Valor inicial de `Done`: la matriz se propone y todavia nadie la implemento. */
export const NO_TODAVIA = "No";

/** Dominio canonico del sitio. Solo lo usa la home, por el mismo motivo que en `cm-push.ts`. */
const SITIO = "https://drangulocolumna.com";

/** Misma forma de clave que los otros dos tabs, para que los tres se crucen a ojo. */
export function claveDeEnlazado(url: string): string {
  return url === "/" ? `${SITIO}/` : url;
}

/**
 * Proyeccion de una fila de la matriz a la fila que el tab espera.
 *
 * Los ocho bloques se emiten SIEMPRE completos, con cadena vacia en las ranuras sin enlace.
 * Es la unica forma de que una segunda carga con menos enlaces no deje colgando los del
 * dataset anterior.
 */
export function filaDeEnlazado(f: FilaDeEnlazado): Record<string, unknown> {
  const fila: Record<string, unknown> = {
    url: claveDeEnlazado(f.url),
    title: f.title,
    code: f.code,
    action: f.action,
    cluster: f.cluster,
    done: NO_TODAVIA,
  };

  for (let i = 1; i <= MAX_ENLACES; i += 1) {
    const enlace = f.enlaces[i - 1];
    fila[`link${i}`] = enlace === undefined ? "" : enlace.link;
    fila[`anchor${i}`] = enlace === undefined ? "" : enlace.anchor;
    fila[`titleWithLink${i}`] = enlace === undefined ? "" : enlace.titleWithLink;
  }

  return fila;
}

/** Lee la matriz y valida lo minimo antes de tocar el documento del cliente. */
export function leerEnlaces(destino: string): FilaDeEnlazado[] {
  const ruta = path.isAbsolute(destino) ? destino : path.join(SEO_TOOLS_ROOT, destino);
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${ruta}.\n  Accion: correr antes src/phase14/links.ts para generarlo.`,
    );
  }

  const archivo = JSON.parse(crudo) as ArchivoDeEnlaces;
  const filas = archivo.filas ?? [];
  filas.forEach((f, i) => {
    for (const campo of ["url", "title", "code", "action", "cluster"] as const) {
      if (typeof f[campo] !== "string" || f[campo].trim() === "") {
        throw new CliError(
          `${destino}, fila ${i + 1} (${String(f.url)}): "${campo}" vino vacio.\n` +
            `  La carga se detiene sin escribir nada.`,
        );
      }
    }
    if (f.enlaces.length > MAX_ENLACES) {
      throw new CliError(
        `${destino}, fila ${i + 1} (${f.url}): trae ${f.enlaces.length} enlaces y el tab acepta ` +
          `${MAX_ENLACES}. Los de mas no entrarian en ninguna columna y desapareceran en silencio.`,
      );
    }
    f.enlaces.forEach((e, j) => {
      if (e.link.trim() === "" || e.anchor.trim() === "") {
        throw new CliError(`${destino}, fila ${i + 1} (${f.url}): el enlace ${j + 1} viene incompleto.`);
      }
    });
  });
  return [...filas];
}

async function cargar(
  gateway: WriteGateway,
  tab: TabModel,
  filas: readonly FilaDeEnlazado[],
  ensayo: boolean,
): Promise<void> {
  const out = process.stdout;

  if (tab.mapBy !== "posicion") {
    throw new CliError(
      `El tab "${tab.sheetTitle}" no esta declarado con mapeo por posicion y este cargador se ` +
        `niega a escribirlo.\n` +
        `  El encabezado "Title with Link" se repite ocho veces: por nombre, los ocho bloques\n` +
        `  caerian en la misma columna y la matriz quedaria destruida sin lanzar nada.`,
    );
  }

  // `loadTabSchema` con mapeo posicional ya comprueba columna por columna que el documento
  // tenga la forma declarada, y se detiene nombrando la primera que no calza.
  const schema = await loadTabSchema(gateway, tab, { addMissingColumns: false });
  const ausentes = columnasPropiasAusentes(tab, schema.headers);
  if (ausentes.length > 0) {
    throw new CliError(
      `El tab "${tab.sheetTitle}" ya no trae ${ausentes.map((h) => JSON.stringify(h)).join(", ")}.\n` +
        `  La carga se detiene sin escribir nada.`,
    );
  }

  const proyectadas = filas.map(filaDeEnlazado);

  const sinClave = proyectadas
    .map((f, i) => ({ url: filas[i]?.url ?? "?", clave: normalizeKeyword(String(f["url"] ?? "")) }))
    .filter((x) => x.clave === "");
  if (sinClave.length > 0) {
    throw new CliError(
      `Estas URLs quedan con clave vacia al normalizar y el upsert las saltearia en silencio: ` +
        `${sinClave.map((x) => JSON.stringify(x.url)).join(", ")}.`,
    );
  }

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
    for (const d of resumen.duplicadosPreexistentes) out.write(`  ${d.clave}: filas ${d.filas.join(", ")}\n`);
    out.write(`\n`);
  }

  out.write(`mapeo: ${tab.mapBy} (${schema.columns.length} columnas resueltas)\n`);
  out.write(
    `celdas de seguimiento por sembrar: ${siembras} de ${registros.length * CAMPOS_DE_SEGUIMIENTO.length}\n`,
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

  const filas = leerEnlaces(data);
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

if (process.argv[1] !== undefined && process.argv[1].endsWith("il-push.ts")) {
  ejecutar(main);
}
