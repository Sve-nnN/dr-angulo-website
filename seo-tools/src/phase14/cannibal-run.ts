/**
 * Punto de entrada del detector de canibalizacion: cruza `url-map.jsonl` contra si mismo,
 * escribe `data/cannibalization.json` y, con `--apply`, aplica las resoluciones sobre el mapa.
 *
 * Uso:
 *   ./node_modules/.bin/tsx src/phase14/cannibal-run.ts --map data/url-map.jsonl \
 *     --out data/cannibalization.json --apply
 *
 * QUE SIGNIFICA `--apply` Y QUE NO. Aplica la resolucion de un conflicto RESUELTO: la perdedora
 * cede lo que estaba peleando. Nunca toca una fila que el plan 14-02 dejo aprobada por Juan
 * (T-14-10): si el detector la senala, el conflicto queda escrito en `sinResolver` y se escala en
 * la verificacion de fase. Un conflicto sin resolucion no se rebaja de severidad para que el
 * criterio pase: se nombra (T-14-13).
 *
 * COSTE DE CUOTA: CERO. Las 96 capturas ya estan pagadas y se leen offline.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { booleana, ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { cargarIndiceDeSerp } from "./overlap.js";
import { validarAsignacion, type AsignacionDeUrl } from "./model.js";
import { cruzarMapa, type ReporteDeCanibalizacion } from "./cannibal.js";

const out = process.stdout;

/** Las nueve URLs que Juan aprobo en el plan 14-02. No se reasignan solas (T-14-10). */
const INTOCABLES: ReadonlySet<string> = new Set([
  "/servicios",
  "/servicios/escoliosis-y-deformidades",
  "/servicios/hernia-discal",
  "/servicios/estenosis-espinal",
  "/servicios/ortopedia-infantil",
  "/sedes/clinica-ricardo-palma",
  "/sedes/sanna-la-molina",
  "/sedes/clinica-tezza",
  "/sedes/consultorio-privado",
]);

interface ArchivoDeOro {
  readonly keywords: readonly {
    readonly puesto: number;
    readonly keyword: string;
    readonly keywordKey: string;
  }[];
}

function ruta(destino: string): string {
  return path.isAbsolute(destino) ? destino : path.join(SEO_TOOLS_ROOT, destino);
}

function leerMapa(destino: string): AsignacionDeUrl[] {
  return readFileSync(ruta(destino), "utf8")
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l, i) => validarAsignacion(JSON.parse(l), `${destino}:${i + 1}`));
}

function escribirMapa(destino: string, filas: readonly AsignacionDeUrl[]): void {
  const ordenadas = [...filas].sort((a, b) => a.url.localeCompare(b.url, "es"));
  writeFileSync(ruta(destino), `${ordenadas.map((f) => JSON.stringify(f)).join("\n")}\n`, "utf8");
}

/**
 * Aplica las resoluciones sobre el mapa: la perdedora suelta lo que perdio.
 *
 * Solo se aplica lo que la resolucion declaro que se cede, y solo sobre URLs que no son
 * intocables. Una secundaria cedida se quita de la lista; una primaria cedida no se reemplaza
 * aca a ciegas, porque elegir la siguiente candidata alcanzable es trabajo del asignador con el
 * cluster entero delante. Cuando eso pasa la corrida lo dice y se detiene en vez de dejar una
 * fila sin primaria y sin motivo escrito.
 */
function aplicar(
  mapa: readonly AsignacionDeUrl[],
  reporte: ReporteDeCanibalizacion,
): { readonly filas: AsignacionDeUrl[]; readonly cambios: string[] } {
  const porUrl = new Map(mapa.map((a) => [a.url, a]));
  const cambios: string[] = [];

  for (const c of reporte.resueltos) {
    const r = c.resolucion;
    if (r === undefined || r.cedio === null) continue;
    const perdedora = porUrl.get(r.perdedora);
    if (perdedora === undefined) continue;

    if (r.cedio === "secundaria") {
      const [secundaria] = c.keywords;
      const quedan = perdedora.secundarias.filter(
        (s) => s.toLowerCase() !== secundaria.toLowerCase(),
      );
      if (quedan.length === perdedora.secundarias.length) continue;
      if (quedan.length < 3) {
        throw new CliError(
          `${r.perdedora}: al ceder "${secundaria}" quedaria con ${quedan.length} secundarias y ` +
            `MAP-01 exige 3. No se rellena desde aca: hay que declararle un cluster extra en su ` +
            `especificacion y volver a correr el asignador.`,
        );
      }
      porUrl.set(perdedora.url, { ...perdedora, secundarias: quedan });
      cambios.push(`${r.perdedora}: cede la secundaria "${secundaria}" a ${r.ganadora}`);
      continue;
    }

    throw new CliError(
      `${r.perdedora}: tiene que ceder la primaria "${perdedora.keywordPrimaria ?? ""}" a ` +
        `${r.ganadora} y elegir la siguiente candidata alcanzable de su cluster. Eso lo decide el ` +
        `asignador con el cluster entero delante, no este ejecutable: agregar la candidata en la ` +
        `especificacion de la URL y volver a correr assign-run.`,
    );
  }

  return { filas: [...porUrl.values()], cambios };
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const destinoMapa = texto(banderas, "map") ?? "data/url-map.jsonl";
  const destinoReporte = texto(banderas, "out") ?? "data/cannibalization.json";
  const aplicarCambios = booleana(banderas, "apply");

  const mapa = leerMapa(destinoMapa);
  const oro = JSON.parse(
    readFileSync(path.join(SEO_TOOLS_ROOT, "data", "golden-10.json"), "utf8"),
  ) as ArchivoDeOro;
  const oroPorClave = new Map(
    oro.keywords.map((k) => [k.keywordKey, `${k.keyword} (oro numero ${k.puesto})`]),
  );

  // Se indexan solo las primarias del mapa: son las unicas cabezas que este cruce compara.
  const primarias = mapa
    .map((a) => a.keywordPrimaria)
    .filter((k): k is string => k !== null && k !== undefined);
  const indice = await cargarIndiceDeSerp(primarias);

  let reporte = cruzarMapa({ mapa, indice, oroPorClave, intocables: INTOCABLES });

  if (aplicarCambios) {
    const { filas, cambios } = aplicar(mapa, reporte);
    escribirMapa(destinoMapa, filas);
    out.write(`Resoluciones aplicadas: ${cambios.length}\n`);
    for (const c of cambios) out.write(`  ${c}\n`);
    out.write(`\n`);
    // El detector se vuelve a correr DESPUES de aplicar: el reporte que se publica tiene que ser
    // el del mapa final, no el del mapa que ya no existe.
    reporte = cruzarMapa({ mapa: leerMapa(destinoMapa), indice, oroPorClave, intocables: INTOCABLES });
  }

  writeFileSync(ruta(destinoReporte), `${JSON.stringify(reporte, null, 2)}\n`, "utf8");

  out.write(`Mapa: ${destinoMapa} (${reporte.resumen.urlsCruzadas} URLs)\n`);
  out.write(`Reporte: ${destinoReporte}\n`);
  out.write(`Umbral de solape: ${reporte.umbralDeSolape} URLs compartidas del top 10\n\n`);
  out.write(`pares comparados: ${reporte.resumen.paresComparados}\n`);
  out.write(`conflictos: ${reporte.resumen.conflictos}\n`);
  out.write(`  altos: ${reporte.resumen.altos}\n`);
  out.write(`  medios: ${reporte.resumen.medios}\n`);
  out.write(`resueltos: ${reporte.resumen.resueltos}\n`);
  out.write(`sin resolver: ${reporte.resumen.sinResolver}\n`);
  out.write(`altos sin resolucion: ${reporte.resumen.altosSinResolucion}\n`);
  out.write(
    `pares del mismo cluster con solape cero (NO son conflicto): ` +
      `${reporte.paresDelMismoClusterSinSolape.length}\n\n`,
  );

  for (const c of reporte.conflictos) {
    out.write(`[${c.severidad}] ${c.tipo}: ${c.urls[0]} <> ${c.urls[1]}\n`);
    out.write(`  "${c.keywords[0]}" contra "${c.keywords[1]}"\n`);
    out.write(`  compartidas: ${c.urlsCompartidas.length === 0 ? "ninguna" : c.urlsCompartidas.join(", ")}\n`);
    out.write(`  ${c.resolucion === undefined ? "SIN RESOLVER" : c.resolucion.motivo}\n`);
  }

  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("cannibal-run.ts")) {
  ejecutar(main);
}
