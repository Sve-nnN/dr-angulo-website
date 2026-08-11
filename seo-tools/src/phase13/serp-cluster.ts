/**
 * Punto de entrada: convertir las capturas de SERP en clusters, y marcar la procedencia.
 *
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/serp-cluster.ts --offline
 *
 * COSTE DE CUOTA: CERO. Corre en modo offline por defecto, que convierte un fallo de cache en
 * error duro en vez de en un gasto silencioso. Una cabeza sin captura se nombra y se salta; no
 * se sale a buscarla, porque las busquedas de SerpApi no se reponen hasta el 2026-08-21.
 *
 * `data/keywords.jsonl` es de SOLO LECTURA en esta fase. Los clusters salen a
 * `data/keyword-clusters.jsonl`, que es un archivo nuevo, y el join lo hace el plan 13-04.
 *
 * Banderas:
 *   --candidates RUTA  Lista de cabezas. Por defecto data/serp-candidates.json.
 *   --umbral N         Jaccard minimo para la cola. Por defecto 0.5.
 *   --solape N         URLs compartidas que unen dos cabezas. Por defecto 3 (D-05).
 *   --dry-run          No escribe: solo imprime el reparto.
 *   --online           Permite salir a la red. NO usar: existe solo para que el modo offline
 *                      sea una decision explicita y no un efecto de que nadie lo penso.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { booleana, ejecutar, numero, parseBanderas, texto } from "./args.js";
import { CliError, REPO_ROOT, SEO_TOOLS_ROOT } from "../config.js";
import { cargarReglasDeTipo } from "./pagetype.js";
import { leerSerp } from "./serp.js";
import {
  UMBRAL_SIMILITUD,
  UMBRAL_SOLAPE,
  agruparCabezas,
  asignarCola,
  cargarNombresDeCluster,
  contarPorCluster,
  type CabezaConSerp,
  type Cluster,
  type FilaDeCluster,
} from "./cluster.js";

const RUTA_KEYWORDS = path.join(SEO_TOOLS_ROOT, "data", "keywords.jsonl");
const RUTA_CANDIDATAS = path.join(SEO_TOOLS_ROOT, "data", "serp-candidates.json");
const RUTA_CLUSTERS = path.join(SEO_TOOLS_ROOT, "data", "clusters.json");
const RUTA_FILAS = path.join(SEO_TOOLS_ROOT, "data", "keyword-clusters.jsonl");
const RUTA_DOC = path.join(
  REPO_ROOT,
  ".planning",
  "workstreams",
  "seo-keywords",
  "phases",
  "13-clusters-competencia-y-las-10-de-oro",
  "13-CLUSTERS.md",
);

interface RegistroDeKeyword {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly alcance: string;
}

interface Candidata {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly rango: number;
  readonly familia: string;
}

function leerJsonl<T>(ruta: string): T[] {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(`No se pudo leer ${ruta}.`);
  }
  return crudo
    .trim()
    .split("\n")
    .map((linea, i) => {
      try {
        return JSON.parse(linea) as T;
      } catch (error) {
        throw new CliError(`La linea ${i + 1} de ${ruta} no es JSON valido: ${String(error)}`);
      }
    });
}

function escapeMd(texto: string): string {
  return texto.replace(/\|/g, "\\|");
}

const ETIQUETAS: Record<string, string> = {
  "contenido-internacional": "contenido internacional",
  "pagina-de-servicio": "pagina de servicio",
  "ficha-de-clinica": "ficha de clinica",
  directorio: "directorio",
  "red-social": "red social",
  guia: "guia",
  otro: "otro",
};

function documento(
  clusters: readonly Cluster[],
  filas: readonly FilaDeCluster[],
  meta: {
    readonly universo: number;
    readonly porSerp: number;
    readonly porTexto: number;
    readonly sinCluster: number;
    readonly similitudMedia: number;
    readonly umbral: number;
    readonly solape: number;
  },
): string {
  const porTipo = new Map<string, number>();
  for (const c of clusters) porTipo.set(c.tipoDePagina, (porTipo.get(c.tipoDePagina) ?? 0) + 1);

  const lineas: string[] = [];
  lineas.push(`# Fase 13: los clusters del universo objetivo`);
  lineas.push(``);
  lineas.push(`**Generado:** por \`src/phase13/serp-cluster.ts\`, sin gastar cuota.`);
  lineas.push(`**Requisito:** KWR-04 y COMP-03.`);
  lineas.push(``);
  lineas.push(`> **El universo de 5.716 keywords es una muestra truncada, no un censo.** Sale de`);
  lineas.push(`> DinoRank, que corta las relacionadas en 900 por consulta y nunca devuelve la`);
  lineas.push(`> keyword consultada dentro de su propio arreglo. Leerlo como "todo lo que se busca`);
  lineas.push(`> en Lima" seria equivocarse: es todo lo que esta fuente alcanzo a ver.`);
  lineas.push(``);
  lineas.push(`## Lo primero que hay que saber para leer la tabla`);
  lineas.push(``);
  lineas.push(
    `Las ${meta.porSerp} cabezas tienen SERP propia capturada en Lima y su cluster lo valido`,
  );
  lineas.push(
    `Google: dos cabezas quedaron juntas cuando compartian ${meta.solape} URLs o mas en el top 10.`,
  );
  lineas.push(
    `Las otras ${meta.porTexto} filas heredaron el cluster por parecido de texto contra una de esas`,
  );
  lineas.push(
    `cabezas, y quedan marcadas \`cluster_por_texto\`. No es lo mismo y por eso el dato lo dice:`,
  );
  lineas.push(`una es evidencia, la otra es inferencia.`);
  lineas.push(``);
  lineas.push(`| Reparto del universo objetivo | Filas |`);
  lineas.push(`|---|---|`);
  lineas.push(`| Validadas contra Google (SERP propia) | ${meta.porSerp} |`);
  lineas.push(`| Inferidas por parecido de texto | ${meta.porTexto} |`);
  lineas.push(`| Sin cluster | ${meta.sinCluster} |`);
  lineas.push(`| **Total** | **${meta.universo}** |`);
  lineas.push(``);
  lineas.push(
    `Que ${meta.sinCluster} filas queden sin cluster es informacion, no un fallo. Forzar una`,
  );
  lineas.push(
    `asignacion dudosa ensuciaria el dataset justo donde la fase 14 va a apoyarse para decidir`,
  );
  lineas.push(`que URL responde a que.`);
  lineas.push(``);
  lineas.push(`## Que tipo de pagina premia Google en cada cluster`);
  lineas.push(``);
  lineas.push(`| Tipo de pagina dominante | Clusters |`);
  lineas.push(`|---|---|`);
  for (const [tipo, n] of [...porTipo.entries()].sort((a, b) => b[1] - a[1])) {
    lineas.push(`| ${ETIQUETAS[tipo] ?? tipo} | ${n} |`);
  }
  lineas.push(``);
  lineas.push(`## Los clusters`);
  lineas.push(``);
  lineas.push(`| Cluster | Tipo de pagina | Cabeza | Cabezas | Keywords | Validadas |`);
  lineas.push(`|---|---|---|---|---|---|`);
  for (const c of clusters) {
    lineas.push(
      `| ${escapeMd(c.nombre)} | ${ETIQUETAS[c.tipoDePagina] ?? c.tipoDePagina} | ` +
        `${escapeMd(c.cabezas[0] ?? "")} | ${c.cabezas.length} | ${c.keywords} | ${c.validadasPorSerp} |`,
    );
  }
  lineas.push(``);
  lineas.push(`## Como se asigno la cola`);
  lineas.push(``);
  lineas.push(
    `Indice de Jaccard sobre los tokens normalizados, sin palabras vacias y sin modificadores`,
  );
  lineas.push(
    `geograficos, con umbral ${meta.umbral}, mas la condicion de compartir al menos un termino`,
  );
  lineas.push(`clinico de cuatro letras o mas. Hacen falta las dos condiciones.`);
  lineas.push(``);
  lineas.push(
    `El geo se quita antes de medir a proposito: si se dejara, \`traumatologo lima\` y`,
  );
  lineas.push(
    `\`escoliosis lima\` compartirian \`lima\` y puntuarian como si hablaran de lo mismo. El geo es`,
  );
  lineas.push(`terreno, no tema.`);
  lineas.push(``);
  lineas.push(
    `El termino clinico compartido es lo que impide que \`hernia discal lima\` y`,
  );
  lineas.push(
    `\`hernia inguinal lima\` se peguen por los tokens equivocados: puntuan 1/3, debajo del umbral,`,
  );
  lineas.push(`y una hernia inguinal no es de columna.`);
  lineas.push(``);
  lineas.push(
    `Similitud media de las ${meta.porTexto} filas asignadas por texto: ${meta.similitudMedia.toFixed(3)}.`,
  );
  lineas.push(``);
  void filas;
  return `${lineas.join("\n")}\n`;
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const offline = !booleana(banderas, "online");
  const umbral = numero(banderas, "umbral") ?? UMBRAL_SIMILITUD;
  const solape = numero(banderas, "solape") ?? UMBRAL_SOLAPE;

  const universo = leerJsonl<RegistroDeKeyword>(RUTA_KEYWORDS).filter(
    (k) => k.alcance === "objetivo",
  );

  const rutaCandidatas = texto(banderas, "candidates") ?? RUTA_CANDIDATAS;
  const archivo = JSON.parse(readFileSync(rutaCandidatas, "utf8")) as {
    readonly candidatas: readonly Candidata[];
  };

  const reglas = cargarReglasDeTipo();
  const out = process.stdout;

  const cabezas: CabezaConSerp[] = [];
  const sinCaptura: string[] = [];
  for (const candidata of archivo.candidatas) {
    let serp;
    try {
      serp = await leerSerp(candidata.keyword, { offline });
    } catch {
      // Una cabeza sin captura se nombra y se salta. No se sale a buscarla.
      sinCaptura.push(candidata.keyword);
      continue;
    }
    if (serp.organicos.length === 0) {
      // Una cabeza cuya SERP vino vacia deja de ser cabeza (registrado en la tarea 3).
      sinCaptura.push(`${candidata.keyword} (SERP vacia)`);
      continue;
    }
    cabezas.push({
      keyword: candidata.keyword,
      keywordKey: candidata.keywordKey,
      rango: candidata.rango,
      familia: candidata.familia,
      serp,
    });
  }

  if (sinCaptura.length > 0) {
    out.write(`\nCabezas sin captura utilizable, saltadas: ${sinCaptura.length}\n`);
    for (const k of sinCaptura) out.write(`  - ${k}\n`);
  }

  // Los renombres declarados viven en data/cluster-nombres.json. La regla de nombrado no
  // cambia: esto solo sustituye el nombre del resultado, y cada excepcion trae su motivo.
  const nombres = cargarNombresDeCluster();
  const crudos = agruparCabezas(cabezas, { umbral: solape, reglas, nombres });
  const asignacion = asignarCola(universo, cabezas, crudos, { umbral });
  const clusters = contarPorCluster(crudos, asignacion.filas);

  const porSerp = asignacion.filas.filter((f) => f.clusterFuente === "serp").length;

  out.write(`\nClusters: ${clusters.length}\n`);
  out.write(`  cabezas con SERP propia:    ${cabezas.length}\n`);
  out.write(`  filas del universo:         ${asignacion.filas.length} de ${universo.length}\n`);
  out.write(`  validadas por SERP:         ${porSerp}\n`);
  out.write(`  inferidas por texto:        ${asignacion.porTexto}\n`);
  out.write(`  sin cluster:                ${asignacion.sinCluster}\n`);
  out.write(`  similitud media de la cola: ${asignacion.similitudMedia.toFixed(3)}\n`);

  const porTipo = new Map<string, number>();
  for (const c of clusters) porTipo.set(c.tipoDePagina, (porTipo.get(c.tipoDePagina) ?? 0) + 1);
  out.write(`\nClusters por tipo de pagina dominante:\n`);
  for (const [tipo, n] of [...porTipo.entries()].sort((a, b) => b[1] - a[1])) {
    out.write(`  ${tipo.padEnd(26)} ${String(n).padStart(3)}\n`);
  }

  if (booleana(banderas, "dry-run")) {
    out.write(`\nEnsayo: no se escribio nada.\n`);
    return 0;
  }

  // Nada de marcas de tiempo aca dentro: dos corridas tienen que dar el mismo SHA-256.
  const salida = {
    schema: 1,
    generadoPor: "src/phase13/serp-cluster.ts",
    umbralDeSolape: solape,
    umbralDeSimilitud: umbral,
    resumen: {
      clusters: clusters.length,
      cabezas: cabezas.length,
      universo: asignacion.filas.length,
      validadasPorSerp: porSerp,
      inferidasPorTexto: asignacion.porTexto,
      sinCluster: asignacion.sinCluster,
      similitudMedia: Number(asignacion.similitudMedia.toFixed(6)),
      porTipoDePagina: Object.fromEntries([...porTipo.entries()].sort()),
    },
    clusters,
  };
  writeFileSync(RUTA_CLUSTERS, `${JSON.stringify(salida, null, 2)}\n`, "utf8");

  const jsonl = asignacion.filas.map((f) => JSON.stringify(f)).join("\n");
  writeFileSync(RUTA_FILAS, `${jsonl}\n`, "utf8");

  writeFileSync(
    RUTA_DOC,
    documento(clusters, asignacion.filas, {
      universo: asignacion.filas.length,
      porSerp,
      porTexto: asignacion.porTexto,
      sinCluster: asignacion.sinCluster,
      similitudMedia: asignacion.similitudMedia,
      umbral,
      solape,
    }),
    "utf8",
  );

  out.write(`\nEscrito: ${RUTA_CLUSTERS}\n`);
  out.write(`Escrito: ${RUTA_FILAS}\n`);
  out.write(`Escrito: ${RUTA_DOC}\n`);
  return 0;
}

ejecutar(main);
