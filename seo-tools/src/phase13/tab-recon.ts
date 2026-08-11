#!/usr/bin/env tsx
/**
 * Punto de entrada de SOLO LECTURA: mide la forma real del tab transpuesto
 * `Competitor Analysis` y vuelca el resultado en un archivo legible.
 *
 * POR QUE MEDIR ANTES DE ESCRIBIR. Es el mismo patron que salvo a la fase 12: se sondea, se
 * graba la respuesta real y recien despues se parsea. `Competitor Analysis` no tiene fila de
 * encabezados, los competidores corren a lo ancho y las metricas a lo alto, y el escritor
 * orientado a filas se niega a tocarlo justamente porque escribir filas ahi lo corromperia
 * sin lanzar ninguna excepcion. Adivinar las etiquetas costaria una restauracion manual
 * sobre el documento del cliente.
 *
 * ESTE MODULO NO ESCRIBE NADA EN EL DOCUMENTO. Emite una unica peticion, `values.get` sobre
 * un rectangulo fijo. El escritor orientado a columnas lo construye el plan 13-03.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/tab-recon.ts
 *   ./node_modules/.bin/tsx --env-file=../.secrets/.env src/phase13/tab-recon.ts --out /tmp/x.md
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PLANNING_DATA_DIR } from "../config.js";
import { getSheetsSession, quoteTab } from "../sheets/client.js";
import { columnLetterFromIndex } from "../sheets/schema.js";
import { ejecutar, parseBanderas, texto } from "./args.js";

const TAB = "Competitor Analysis";
/** La grilla mide 36 x 21, medido el 2026-08-10 y registrado en sheet-headers.json. */
const RANGO = "A1:U36";
const SALIDA_POR_DEFECTO = path.join(PLANNING_DATA_DIR, "competitor-tab-recon-2026-08-11.md");

/** Marca de residuo de plantilla que Juan ya identifico en el reconocimiento del 2026-08-10. */
const RESIDUO = /pera/i;

function celda(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return typeof valor === "string" ? valor : String(valor);
}

/** Escapa una barra vertical para que una celda no parta la tabla de Markdown. */
function enTabla(texto: string): string {
  return texto.replace(/\|/g, "\\|");
}

function bloque(filas: readonly string[][]): string {
  return JSON.stringify(filas, null, 1);
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const destino = texto(banderas, "out") ?? SALIDA_POR_DEFECTO;

  const session = await getSheetsSession();
  const respuesta = await session.sheets.spreadsheets.values.get({
    spreadsheetId: session.config.spreadsheetId,
    range: `${quoteTab(TAB)}!${RANGO}`,
    majorDimension: "ROWS",
    // El valor tal como lo ve el usuario, no la formula: aca lo que importa son las etiquetas.
    valueRenderOption: "FORMATTED_VALUE",
  });

  const crudo = (respuesta.data.values ?? []) as unknown[][];
  const anchoMaximo = crudo.reduce((max, fila) => Math.max(max, (fila ?? []).length), 0);
  const grilla: string[][] = crudo.map((fila) =>
    Array.from({ length: anchoMaximo }, (_, c) => celda((fila ?? [])[c])),
  );

  // --- Columnas ocupadas, y por quien ---
  const ocupadas: { letra: string; indice: number; celdas: number; primerValor: string }[] = [];
  for (let c = 0; c < anchoMaximo; c += 1) {
    const valores = grilla.map((fila) => (fila[c] ?? "").trim()).filter((v) => v !== "");
    if (valores.length === 0) continue;
    ocupadas.push({
      letra: columnLetterFromIndex(c),
      indice: c,
      celdas: valores.length,
      primerValor: valores[0] as string,
    });
  }

  // --- Residuo de plantilla, con su celda exacta ---
  const residuos: string[] = [];
  grilla.forEach((fila, r) => {
    fila.forEach((valor, c) => {
      if (valor.trim() !== "" && RESIDUO.test(valor)) {
        residuos.push(`\`${columnLetterFromIndex(c)}${r + 1}\` = ${JSON.stringify(valor)}`);
      }
    });
  });

  // --- Bloques: donde empieza y termina cada seccion de metricas ---
  //
  // Las secciones se anuncian con un titulo en la columna B, no en la A. Hay dos formas de
  // titulo, las dos medidas: con la columna A vacia (`Key Stats `, `Keywords`), o con sufijo
  // de numero de bloque (`Páginas principales (#10)`). La fila 1 es el banner del tab y la 2
  // es la fila de nombres de competidor, asi que ninguna de las dos puede ser titulo.
  const esNumero = (v: string): boolean => v.trim() !== "" && Number.isFinite(Number(v.trim()));
  const banners: { fila: number; titulo: string }[] = [];
  grilla.forEach((fila, r) => {
    if (r < 2) return;
    const a = (fila[0] ?? "").trim();
    const b = (fila[1] ?? "").trim();
    if (b === "" || esNumero(b)) return;
    if (a === "" || /\(#\d+\)$/.test(b)) banners.push({ fila: r + 1, titulo: fila[1] as string });
  });

  const lineasBloques: string[] = [];
  banners.forEach((banner, i) => {
    const siguiente = banners[i + 1];
    const desde = banner.fila + 1;
    const hasta = (siguiente === undefined ? grilla.length : siguiente.fila - 1);
    const etiquetas: string[] = [];
    for (let r = desde; r <= hasta; r += 1) {
      const etiqueta = (grilla[r - 1]?.[0] ?? "").trim();
      if (etiqueta !== "") etiquetas.push(etiqueta);
    }
    if (etiquetas.length === 0) return;
    lineasBloques.push(
      `| ${banner.fila} | ${enTabla(JSON.stringify(banner.titulo))} | ${desde}–${hasta} | ${enTabla(
        etiquetas.join(", "),
      )} |`,
    );
  });

  // --- Filas, con su etiqueta literal de la columna A ---
  const lineasFilas: string[] = [];
  grilla.forEach((fila, r) => {
    const etiqueta = fila[0] ?? "";
    const restoOcupado = fila
      .map((v, c) => ({ v: v.trim(), c }))
      .filter((x) => x.c > 0 && x.v !== "")
      .map((x) => columnLetterFromIndex(x.c));
    if (etiqueta.trim() === "" && restoOcupado.length === 0) return;
    lineasFilas.push(
      `| ${r + 1} | ${enTabla(JSON.stringify(etiqueta))} | ${
        restoOcupado.length === 0 ? "(ninguna)" : restoOcupado.join(", ")
      } |`,
    );
  });

  const doc = [
    `# Forma real del tab transpuesto \`Competitor Analysis\` — 2026-08-11`,
    ``,
    `Volcado de SOLO LECTURA producido por \`seo-tools/src/phase13/tab-recon.ts\` (plan 13-01).`,
    `Una sola peticion, \`values.get\` sobre \`${RANGO}\`. **Ninguna escritura contra el documento.**`,
    ``,
    `- Documento: \`${session.config.spreadsheetId}\``,
    `- Tab: \`${TAB}\``,
    `- Rectangulo pedido: \`${RANGO}\``,
    `- Filas con contenido devueltas: ${grilla.length}`,
    `- Ancho maximo con contenido: ${anchoMaximo} columnas`,
    ``,
    `## 1. Etiquetas de fila, literales`,
    ``,
    `El texto va entre comillas a proposito: en este documento los espacios finales son reales`,
    `y el mapeo tiene que recortar los dos lados antes de comparar.`,
    ``,
    `| Fila | Etiqueta literal de la columna A | Otras columnas con contenido |`,
    `|---|---|---|`,
    ...lineasFilas,
    ``,
    `## 2. Columnas ocupadas: un competidor por slot`,
    ``,
    `La fila 2 lleva el NOMBRE de cada competidor y la fila 3 su dominio. Los slots corren a lo`,
    `ancho con paso fijo, asi que la posicion de un competidor es su indice por el paso mas el`,
    `origen. El slot de mas a la izquierda es el que hoy ocupa el residuo de plantilla.`,
    ``,
    `| Columna | Indice base cero | Celdas con contenido | Primer valor |`,
    `|---|---|---|---|`,
    ...ocupadas.map(
      (o) => `| ${o.letra} | ${o.indice} | ${o.celdas} | ${enTabla(JSON.stringify(o.primerValor))} |`,
    ),
    ``,
    `### Nombres declarados en la fila 2`,
    ``,
    `| Columna | Indice base cero | Nombre del slot |`,
    `|---|---|---|`,
    ...(grilla[1] ?? [])
      .map((valor, c) => ({ valor: valor.trim(), c }))
      .filter((x) => x.valor !== "")
      .map((x) => `| ${columnLetterFromIndex(x.c)} | ${x.c} | ${enTabla(JSON.stringify(x.valor))} |`),
    ``,
    `## 2 bis. Bloques de metricas`,
    ``,
    `Cada bloque se anuncia con un titulo en la columna B. El detalle importa: la columna B NO`,
    `es una columna de etiquetas, es el PRIMER SLOT de competidor, y encima de sus valores`,
    `carga tambien los titulos de seccion. Un escritor que vuelque una columna entera sobre el`,
    `slot B borraria esos titulos sin lanzar nada. Por eso el modelo declara fila por fila.`,
    ``,
    `| Fila del titulo | Titulo (columna B) | Filas del bloque | Etiquetas de la columna A |`,
    `|---|---|---|---|`,
    ...lineasBloques,
    ``,
    `## 3. Residuo de plantilla`,
    ``,
    residuos.length === 0
      ? `No se encontro ninguna celda con la marca \`pera\`.`
      : [`Celdas que llevan la marca \`pera\`:`, ``, ...residuos.map((r) => `- ${r}`)].join("\n"),
    ``,
    `## 4. Rectangulo crudo`,
    ``,
    `Tal como lo devolvio la API, sin recortar ni reordenar. Es la fuente contra la que se`,
    `declararon las filas de metrica en \`seo-tools/data/sheet-columns.json\`.`,
    ``,
    "```json",
    bloque(grilla),
    "```",
    ``,
  ].join("\n");

  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, doc, "utf8");

  process.stdout.write(
    `volcado escrito en ${destino}\n` +
      `  filas con contenido: ${grilla.length}\n` +
      `  columnas ocupadas: ${ocupadas.map((o) => o.letra).join(", ")}\n` +
      `  celdas con residuo: ${residuos.length}\n`,
  );
  return 0;
}

ejecutar(main);
