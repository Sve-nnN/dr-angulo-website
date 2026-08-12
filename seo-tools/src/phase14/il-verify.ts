#!/usr/bin/env tsx
/**
 * Verificacion de SOLO LECTURA del mapeo posicional en `Internal Linking Audit` (T-14-14).
 *
 * POR QUE EXISTE UN VERIFICADOR APARTE Y NO ALCANZA CON EL RESUMEN DEL CARGADOR.
 *
 * El modo de falla que importa no lanza excepcion ni desbalancea ningun contador: si las
 * columnas se resolvieran por nombre, el encabezado repetido `Title with Link` haria caer los
 * ocho bloques en la misma columna y el cargador igual reportaria `actualizadas: 22`. La unica
 * evidencia que distingue un mapeo bueno de uno roto es leer el documento vivo y comprobar que
 * el primer bloque y el octavo traen valores DISTINTOS y que ambos coinciden con el dataset.
 *
 * No escribe nada. Abre la sesion con el mismo alcance que los cargadores y solo lee.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase14/il-verify.ts
 */

import { CliError } from "../config.js";
import { ejecutar } from "../phase13/args.js";
import { getSheetsSession, quoteTab } from "../sheets/client.js";
import { loadSheetModel } from "../sheets/schema.js";
import { leerEnlaces, claveDeEnlazado, filaDeEnlazado } from "./il-push.js";

const TAB = "Internal Linking Audit";

async function main(): Promise<number> {
  const out = process.stdout;

  const filas = leerEnlaces("data/internal-links.json");
  const modelo = await loadSheetModel();
  const tab = modelo.tabs[TAB];
  if (tab === undefined) throw new CliError(`El tab "${TAB}" no esta en el modelo de columnas.`);
  if (tab.mapBy !== "posicion") throw new CliError(`El tab "${TAB}" no declara mapeo posicional.`);

  const session = await getSheetsSession();
  const res = await session.sheets.spreadsheets.values.get({
    spreadsheetId: session.config.spreadsheetId,
    range: quoteTab(tab.sheetTitle),
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const grid = (res.data.values ?? []) as unknown[][];

  const headerRow = tab.headerRow ?? 1;
  const headers = (grid[headerRow - 1] ?? []).map((h) => String(h ?? ""));
  out.write(`Encabezados leidos: ${headers.length}\n`);

  // Indice por clave normalizada, tal cual la escribe el cargador.
  const keyIdx = tab.columns.findIndex((c) => c.field === tab.keyField);
  if (keyIdx < 0) throw new CliError(`No se ubico la columna clave "${tab.keyField}".`);

  const vivas = new Map<string, unknown[]>();
  for (let r = headerRow; r < grid.length; r += 1) {
    const fila = grid[r] ?? [];
    const clave = String(fila[keyIdx] ?? "").trim();
    if (clave !== "") vivas.set(clave, fila);
  }
  out.write(`Filas de datos en el documento: ${vivas.size}\n\n`);

  // Se elige una URL de servicio que USE las ocho ranuras: es la unica que puede distinguir
  // un mapeo posicional de uno nominal en la ranura 8.
  const candidata = filas.find((f) => f.url.startsWith("/servicios/") && f.enlaces.length === 8)
    ?? filas.find((f) => f.enlaces.length === 8);
  if (candidata === undefined) throw new CliError("Ninguna fila usa las ocho ranuras; el criterio no es comprobable.");

  const clave = claveDeEnlazado(candidata.url);
  const viva = vivas.get(clave);
  if (viva === undefined) throw new CliError(`La URL ${clave} no esta en el documento.`);

  const esperada = filaDeEnlazado(candidata);
  const col = (field: string): number => tab.columns.findIndex((c) => c.field === field);

  let fallas = 0;
  const comparar = (field: string): { leido: string; esperado: string; ok: boolean } => {
    const i = col(field);
    const leido = String(viva[i] ?? "").trim();
    const esperado = String(esperada[field] ?? "").trim();
    const ok = leido === esperado;
    if (!ok) fallas += 1;
    return { leido, esperado, ok };
  };

  out.write(`URL verificada: ${candidata.url}\n\n`);
  const bloques: string[] = [];
  for (const n of [1, 8]) {
    for (const campo of [`link${n}`, `anchor${n}`, `titleWithLink${n}`]) {
      const { leido, esperado, ok } = comparar(campo);
      out.write(`  ${ok ? "OK  " : "MAL "} ${campo.padEnd(16)} leido=${JSON.stringify(leido)}\n`);
      if (!ok) out.write(`       ${"".padEnd(16)} esper=${JSON.stringify(esperado)}\n`);
      bloques.push(leido);
    }
  }

  // El corazon del criterio: bloque 1 distinto de bloque 8. Si el mapeo fuera por nombre,
  // `titleWithLink1` y `titleWithLink8` habrian caido en la MISMA columna y serian iguales.
  const b1 = bloques.slice(0, 3).join("|");
  const b8 = bloques.slice(3, 6).join("|");
  const distintos = b1 !== b8;
  out.write(`\n  ${distintos ? "OK  " : "MAL "} bloque 1 != bloque 8\n`);
  if (!distintos) fallas += 1;

  if (fallas > 0) throw new CliError(`${fallas} comprobaciones fallaron: el mapeo NO es posicional en el documento vivo.`);
  out.write(`\nMapeo posicional confirmado contra el documento vivo. Sin escrituras.\n`);
  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("il-verify.ts")) {
  ejecutar(main);
}
