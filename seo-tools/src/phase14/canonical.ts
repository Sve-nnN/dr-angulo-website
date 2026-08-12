#!/usr/bin/env tsx
/**
 * Canonical propuesto por URL. Funcion pura sobre `url-map.jsonl` (SHEET-04).
 *
 * QUE ES UN CANONICAL PROPUESTO Y QUE NO ES. Este archivo NO implementa nada: emite lo que
 * v1.1 tiene que escribir en el `<head>` de cada pagina cuando la toque. Por eso una URL
 * `planificada` recibe canonical igual que una viva —el canonical es parte de la pagina que
 * todavia no existe— y por eso las dos columnas de seguimiento salen en el valor inicial de
 * algo propuesto y no implementado.
 *
 * TRES REGLAS QUE PARECEN DETALLE Y NO LO SON:
 *
 *   1. El canonical es ABSOLUTO y con el mismo origen que el sitemap. Un canonical relativo o
 *      con otro origen no consolida nada: le dice a Google que la pagina buena es otra.
 *   2. Sin barra final, salvo en la raiz. `https://sitio.com/servicios` y
 *      `https://sitio.com/servicios/` son dos URLs para Google, y declarar una canonical con la
 *      barra que la pagina no sirve monta una redireccion contra si misma.
 *   3. Ningun canonical se repite. Dos URLs con el mismo canonical es una diciendo que la otra
 *      la reemplaza, que es una fusion disfrazada de detalle tecnico.
 *
 * EL CANONICAL DE UNA URL QUE VA A REDIRIGIR ES EL SUYO PROPIO, no el destino del 301. Las dos
 * cosas se implementan distinto y decir "canonical al destino" le pediria a v1.1 una etiqueta
 * en el `<head>` de una pagina que en la misma fase se apaga con un 301. Mientras la pagina
 * siga viva, su canonical correcto es ella misma; el destino de la fusion viaja en `redirigeA`
 * dentro del mapa y en la columna `Action` del `Content Model`, que es donde se lee como orden.
 *
 * COSTE DE CUOTA: CERO. No consulta ninguna fuente externa.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase14/canonical.ts --map data/url-map.jsonl \
 *     --out data/canonicals.json
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { booleana, ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { validarAsignacion, type AsignacionDeUrl } from "./model.js";

/**
 * Origen del sitio, el mismo que sirve el sitemap.
 *
 * Medido en `src/lib/site-config.ts:7`, que es de donde `src/app/sitemap.xml/route.ts` arma
 * cada entrada. Se copia aca como literal a proposito: `seo-tools/` es un paquete aislado y
 * no importa nada de la aplicacion. Si el sitio cambiara de dominio, este literal y el del
 * mapa tienen que moverse juntos, y la comprobacion de abajo lo detecta antes de escribir.
 */
export const ORIGEN_DEL_SITIO = "https://drangulocolumna.com";

/** Lo que se escribe en `Keyword` cuando la URL declaro que no compite. */
export const SIN_PRIMARIA_EN_EL_DOCUMENTO = "Sin keyword primaria (decisión)";

/** Valor inicial de las dos columnas de seguimiento: propuesto y todavia sin implementar. */
export const NO_TODAVIA = "No";

export interface FilaDeCanonical {
  readonly url: string;
  /** Primaria con tildes. `null` cuando la URL declaro que no compite (14-03). */
  readonly keyword: string | null;
  /** Tema del sitio al que pertenece la URL. Sale del mapa. */
  readonly topic: string;
  readonly canonical: string;
  /** Seguimiento del cliente. Se siembra una vez y despues lo controla Juan. */
  readonly aprobado: string;
  readonly implementado: string;
  /** Viaja para que un criterio pueda exigir keyword SOLO donde la URL compite. */
  readonly esPaginaSeo: boolean;
  /** Por que esta URL no pelea ninguna keyword. Solo en las que no compiten. */
  readonly motivoSinPrimaria: string | null;
}

export interface ArchivoDeCanonicals {
  readonly schema: 1;
  readonly generadoPor: "src/phase14/canonical.ts";
  readonly requisito: "SHEET-04";
  readonly origen: string;
  readonly filas: readonly FilaDeCanonical[];
  readonly resumen: {
    readonly urls: number;
    readonly conKeyword: number;
    readonly sinKeyword: number;
    readonly canonicalesUnicos: number;
  };
}

/**
 * Ruta del sitio a URL absoluta.
 *
 * La raiz conserva su barra y ninguna otra la lleva. Es la unica excepcion y esta escrita
 * aca, no repartida por el codigo.
 */
export function absoluta(ruta: string, origen: string = ORIGEN_DEL_SITIO): string {
  if (!ruta.startsWith("/")) {
    throw new CliError(
      `"${ruta}" no es una ruta del sitio: tiene que empezar con barra.\n` +
        `  Un canonical armado sobre algo que no es una ruta apunta a cualquier lado.`,
    );
  }
  if (ruta === "/") return `${origen}/`;
  return `${origen}${ruta.replace(/\/+$/, "")}`;
}

/** Una fila del dataset, con el canonical calculado y no copiado. */
export function filaDeCanonical(a: AsignacionDeUrl): FilaDeCanonical {
  return {
    url: a.url,
    keyword: a.keywordPrimaria,
    topic: a.topic,
    canonical: absoluta(a.url),
    aprobado: NO_TODAVIA,
    implementado: NO_TODAVIA,
    esPaginaSeo: a.esPaginaSeo,
    motivoSinPrimaria: a.motivoSinPrimaria,
  };
}

/**
 * Comprueba que el canonical calculado y el que el mapa ya trae digan lo mismo.
 *
 * El plan 14-03 escribio `canonical` en las 24 filas del mapa. Recalcularlo aca y no leerlo
 * deja una sola definicion de la regla —esta— y convierte cualquier divergencia futura en un
 * error ruidoso en vez de en dos respuestas distintas a la misma pregunta conviviendo en el
 * repositorio.
 */
export function divergenciasConElMapa(
  mapa: readonly AsignacionDeUrl[],
): { readonly url: string; readonly enElMapa: string; readonly calculado: string }[] {
  return mapa
    .map((a) => ({ url: a.url, enElMapa: a.canonical, calculado: absoluta(a.url) }))
    .filter((x) => x.enElMapa !== x.calculado);
}

/** Canonicals que dos o mas URLs se reparten. Vacio es la unica salida aceptable. */
export function canonicalesRepetidos(
  filas: readonly FilaDeCanonical[],
): { readonly canonical: string; readonly urls: string[] }[] {
  const porCanonical = new Map<string, string[]>();
  for (const f of filas) porCanonical.set(f.canonical, [...(porCanonical.get(f.canonical) ?? []), f.url]);
  return [...porCanonical.entries()]
    .filter(([, urls]) => urls.length > 1)
    .map(([canonical, urls]) => ({ canonical, urls }));
}

export interface ParDeConflicto {
  readonly urls: readonly [string, string];
}

/**
 * Los pares que la canibalizacion dio por RESUELTOS no pueden compartir canonical.
 *
 * Resolver un conflicto separo los temas: una se quedo con la keyword y la otra tomo otra
 * cosa. Darles el mismo canonical despues seria deshacer esa resolucion por la puerta de
 * atras, y encima en silencio: la unica senal visible seria que una de las dos deja de
 * aparecer en Google semanas mas tarde.
 */
export function resueltosConCanonicalCompartido(
  filas: readonly FilaDeCanonical[],
  resueltos: readonly ParDeConflicto[],
): { readonly urls: readonly [string, string]; readonly canonical: string }[] {
  const porUrl = new Map(filas.map((f) => [f.url, f.canonical]));
  const malos: { urls: readonly [string, string]; canonical: string }[] = [];

  for (const par of resueltos) {
    const a = porUrl.get(par.urls[0]);
    const b = porUrl.get(par.urls[1]);
    if (a === undefined || b === undefined || a !== b) continue;
    malos.push({ urls: par.urls, canonical: a });
  }
  return malos;
}

/** Arma el archivo completo y se detiene ante cualquiera de las tres reglas rotas. */
export function construirCanonicals(
  mapa: readonly AsignacionDeUrl[],
  resueltos: readonly ParDeConflicto[] = [],
): ArchivoDeCanonicals {
  const divergentes = divergenciasConElMapa(mapa);
  if (divergentes.length > 0) {
    throw new CliError(
      `El canonical calculado no coincide con el que trae el mapa en ${divergentes.length} URLs:\n` +
        divergentes
          .map((d) => `    ${d.url}\n      mapa:     ${d.enElMapa}\n      calculado: ${d.calculado}`)
          .join("\n") +
        `\n  La corrida se detiene sin escribir nada. Dos respuestas distintas a la misma\n` +
        `  pregunta conviviendo en el repositorio es peor que ninguna: hay que arreglar el\n` +
        `  productor del mapa o esta regla, y decir cual.`,
    );
  }

  const filas = mapa
    .map(filaDeCanonical)
    .sort((a, b) => a.url.localeCompare(b.url, "es"));

  const repetidos = canonicalesRepetidos(filas);
  if (repetidos.length > 0) {
    throw new CliError(
      `Hay canonicals repetidos entre URLs distintas:\n` +
        repetidos.map((r) => `    ${r.canonical}: ${r.urls.join(", ")}`).join("\n") +
        `\n  Dos URLs con el mismo canonical es una declarando que la otra la reemplaza.`,
    );
  }

  const chocados = resueltosConCanonicalCompartido(filas, resueltos);
  if (chocados.length > 0) {
    throw new CliError(
      `Estos pares resolvieron su canibalizacion y comparten canonical:\n` +
        chocados.map((c) => `    ${c.urls.join(" y ")} -> ${c.canonical}`).join("\n") +
        `\n  Resolver el conflicto separo los temas; el canonical compartido los vuelve a unir.`,
    );
  }

  const conKeyword = filas.filter((f) => f.keyword !== null).length;

  return {
    schema: 1,
    generadoPor: "src/phase14/canonical.ts",
    requisito: "SHEET-04",
    origen: ORIGEN_DEL_SITIO,
    filas,
    resumen: {
      urls: filas.length,
      conKeyword,
      sinKeyword: filas.length - conKeyword,
      canonicalesUnicos: new Set(filas.map((f) => f.canonical)).size,
    },
  };
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------

function ruta(destino: string): string {
  return path.isAbsolute(destino) ? destino : path.join(SEO_TOOLS_ROOT, destino);
}

export function leerMapaSincrono(destino: string): AsignacionDeUrl[] {
  return readFileSync(ruta(destino), "utf8")
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l, i) => validarAsignacion(JSON.parse(l), `${destino}:${i + 1}`));
}

interface ReporteLeido {
  readonly resueltos?: readonly { readonly urls: readonly string[] }[];
}

function resueltosDelReporte(destino: string): ParDeConflicto[] {
  let crudo: string;
  try {
    crudo = readFileSync(ruta(destino), "utf8");
  } catch {
    return [];
  }
  const reporte = JSON.parse(crudo) as ReporteLeido;
  return (reporte.resueltos ?? [])
    .filter((c) => c.urls.length === 2)
    .map((c) => ({ urls: [c.urls[0] as string, c.urls[1] as string] as const }));
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const destinoMapa = texto(banderas, "map") ?? "data/url-map.jsonl";
  const destinoSalida = texto(banderas, "out") ?? "data/canonicals.json";
  const destinoCanibal = texto(banderas, "cannibalization") ?? "data/cannibalization.json";

  const mapa = leerMapaSincrono(destinoMapa);
  if (mapa.length === 0) throw new CliError(`${destinoMapa} no trae ni un registro.`);

  const archivo = construirCanonicals(mapa, resueltosDelReporte(destinoCanibal));

  if (!booleana(banderas, "dry-run")) {
    writeFileSync(ruta(destinoSalida), `${JSON.stringify(archivo, null, 2)}\n`, "utf8");
  }

  const out = process.stdout;
  out.write(`Mapa: ${destinoMapa} (${archivo.resumen.urls} URLs)\n`);
  out.write(`Salida: ${destinoSalida}\n`);
  out.write(`Origen: ${archivo.origen}\n\n`);
  out.write(`urls: ${archivo.resumen.urls}\n`);
  out.write(`con keyword: ${archivo.resumen.conKeyword}\n`);
  out.write(`sin keyword (declaran que no compiten): ${archivo.resumen.sinKeyword}\n`);
  out.write(`canonicales unicos: ${archivo.resumen.canonicalesUnicos}\n`);
  return 0;
}

// Solo corre como ejecutable. Importarlo desde una prueba no escribe nada.
if (process.argv[1] !== undefined && process.argv[1].endsWith("canonical.ts")) {
  ejecutar(main);
}
