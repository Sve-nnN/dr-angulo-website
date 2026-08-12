#!/usr/bin/env tsx
/**
 * Comprobacion de SOLO LECTURA de las tres columnas de Ahrefs en `Content Model`.
 *
 * Lee el documento vivo y contrasta celda por celda contra lo que `metricas.ts` resolvio: donde
 * hay dato de Ahrefs la celda tiene que traerlo, y donde la fuente era `ahrefs_sin_dato` o
 * `no_consultado` la celda tiene que estar VACIA. Escribir un numero ahi seria etiquetarlo con
 * una herramienta que no lo produjo, que es lo que J-1 prohibe.
 *
 * No escribe nada.
 */
import { CliError } from "../config.js";
import { ejecutar } from "../phase13/args.js";
import { getSheetsSession, quoteTab } from "../sheets/client.js";
import { loadSheetModel } from "../sheets/schema.js";
import { leerMapa, claveDeUrl, leerIndiceDeAhrefs } from "./cm-push.js";
import { metricasDe } from "./metricas.js";

async function main(): Promise<number> {
  const out = process.stdout;
  const tab = (await loadSheetModel()).tabs["Content Model"];
  if (tab === undefined) throw new CliError("Falta el tab en el modelo.");

  const asignaciones = await leerMapa("data/url-map.jsonl");
  const indice = await leerIndiceDeAhrefs();

  const session = await getSheetsSession();
  const res = await session.sheets.spreadsheets.values.get({
    spreadsheetId: session.config.spreadsheetId,
    range: quoteTab(tab.sheetTitle),
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const grid = (res.data.values ?? []) as unknown[][];
  const headerRow = tab.headerRow ?? 1;
  const keyIdx = tab.columns.findIndex((c) => c.field === tab.keyField);

  const vivas = new Map<string, unknown[]>();
  for (let r = headerRow; r < grid.length; r += 1) {
    const fila = grid[r] ?? [];
    const clave = String(fila[keyIdx] ?? "").trim();
    if (clave !== "") vivas.set(clave, fila);
  }

  const col = (f: string): number => tab.columns.findIndex((c) => c.field === f);
  const campos = ["volumenAhrefs", "kdAhrefs", "trafficPotentialAhrefs"] as const;

  let escritas = 0, vacias = 0, fallas = 0;
  for (const a of asignaciones) {
    const fila = vivas.get(claveDeUrl(a));
    if (fila === undefined) { out.write(`AUSENTE ${a.url}\n`); fallas += 1; continue; }
    const esperado = metricasDe(a.keywordPrimaria, indice) as Record<string, number | undefined>;
    for (const campo of campos) {
      const leido = String(fila[col(campo)] ?? "").trim();
      const esp = esperado[campo];
      if (esp === undefined) {
        if (leido !== "") { out.write(`MAL ${a.url} ${campo}: esperaba vacio, leyo ${JSON.stringify(leido)}\n`); fallas += 1; }
        else vacias += 1;
      } else {
        if (Number(leido) !== esp) { out.write(`MAL ${a.url} ${campo}: esperaba ${esp}, leyo ${JSON.stringify(leido)}\n`); fallas += 1; }
        else escritas += 1;
      }
    }
  }

  out.write(`celdas con dato de Ahrefs y coincidentes: ${escritas}\n`);
  out.write(`celdas correctamente vacias: ${vacias}\n`);
  if (fallas > 0) throw new CliError(`${fallas} celdas no coinciden.`);
  out.write(`Las tres columnas de Ahrefs coinciden con el dataset. Sin escrituras.\n`);
  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("metricas-verify.ts")) ejecutar(main);
