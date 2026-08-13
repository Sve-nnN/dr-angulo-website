/**
 * La auditoria de duplicados, sobre el paquete PROPUESTO y antes de que se publique (ONPAGE-05).
 *
 * POR QUE ES LOCAL Y NO SALE DEL PROVEEDOR. Dos motivos, y el segundo es el grave.
 *
 * El primero es de momento: `/auditoria` de DinoRank audita un sitio ya publicado, y aca se
 * esta auditando un paquete que todavia no se publico. Encontrar un title duplicado despues de
 * publicarlo cuesta una correccion; encontrarlo antes cuesta editar una linea de un JSON.
 *
 * El segundo es de confianza. Pidiendole `drangulocolumna.com`, ese endpoint responde HTTP 200
 * con `site.domain: soumahotel.com`, el proyecto de otro cliente dado de alta en la misma
 * cuenta. No marca error: entrega datos ajenos con cara de datos propios. Un fallo silencioso
 * que devuelve el hotel de otro es peor que un 500, porque el 500 se ve. Queda escrito para que
 * nadie lo reintente creyendo que fue transitorio (D-04).
 *
 * De ahi que este modulo sea una funcion pura sobre un dataset en memoria, sin una sola llamada
 * de red, y que haya una prueba que lo comprueba leyendo este mismo archivo.
 */

import { writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";

import { SEO_TOOLS_ROOT, destinoPermitido } from "../config.js";
import { ejecutar, parseBanderas, textoObligatorio } from "../phase13/args.js";
import { normalizar, tokenizar } from "./entidades.js";
import type { FilaDeOnPage } from "./metadatos.js";
import { FRENTE_DE_TITLE, LARGO_DE_META, LARGO_DE_TITLE } from "./metadatos.js";

/**
 * La forma en que dos textos se comparan para decidir si son el mismo.
 *
 * Sin tildes, en minusculas y con los espacios colapsados. `Hernia discal` y `hernia  discal`
 * son el mismo title para quien lo lee y para quien lo indexa, asi que una comparacion literal
 * daria limpia sobre un duplicado real, que es el unico resultado que esta auditoria no puede
 * permitirse.
 */
export function claveDeComparacion(texto: string): string {
  return normalizar(texto).replace(/\s+/g, " ").trim();
}

export interface Duplicado {
  readonly texto: string;
  readonly urls: readonly string[];
}

export interface Faltante {
  readonly url: string;
  readonly campo: string;
}

export interface FueraDeRango {
  readonly url: string;
  readonly texto: string;
  readonly largo: number;
  readonly limite: number;
}

export interface PrimariaLejos {
  readonly url: string;
  readonly keywordPrimaria: string;
  readonly title: string;
  /** Caracter donde arranca la primera palabra de la primaria. -1 si no aparece. */
  readonly arrancaEn: number;
  readonly limite: number;
}

export interface FueraDeAlcance {
  readonly url: string;
  readonly motivo: string;
}

export interface Auditoria {
  readonly schema: number;
  readonly titlesDuplicados: readonly Duplicado[];
  readonly h1Duplicados: readonly Duplicado[];
  readonly metasFaltantes: readonly Faltante[];
  readonly titlesFueraDeRango: readonly FueraDeRango[];
  readonly metasFueraDeRango: readonly FueraDeRango[];
  readonly keywordNoAlFrente: readonly PrimariaLejos[];
  readonly alcance: {
    readonly auditadas: number;
    readonly fuera: readonly FueraDeAlcance[];
  };
  readonly resumen: {
    readonly hallazgos: number;
    readonly limpia: boolean;
  };
}

/** Agrupa por clave de comparacion y devuelve los grupos de dos o mas, en orden de aparicion. */
function duplicados(
  filas: readonly FilaDeOnPage[],
  campo: (f: FilaDeOnPage) => string | null,
): Duplicado[] {
  const grupos = new Map<string, { texto: string; urls: string[] }>();
  for (const fila of filas) {
    const texto = campo(fila);
    if (texto === null || texto.trim() === "") continue;
    const clave = claveDeComparacion(texto);
    const grupo = grupos.get(clave);
    if (grupo === undefined) grupos.set(clave, { texto: texto.trim(), urls: [fila.url] });
    else grupo.urls.push(fila.url);
  }
  return [...grupos.values()].filter((g) => g.urls.length > 1);
}

/** Posicion de una palabra completa dentro de un texto normalizado. -1 si no esta. */
function posicionDePalabra(textoNormal: string, palabra: string): number {
  const encontrado = new RegExp(`(?:^|[^a-z0-9])(${palabra})(?![a-z0-9])`).exec(textoNormal);
  return encontrado === null ? -1 : encontrado.index + encontrado[0].length - palabra.length;
}

export interface EntradaDeAuditoria {
  readonly filas: readonly FilaDeOnPage[];
}

/**
 * Cruza el mapa propuesto contra si mismo. Funcion pura: mismo dataset, mismo resultado.
 *
 * No se apoya en los campos que el generador ya calculo. Una auditoria que confia en el numero
 * que escribio el generador no audita el paquete: audita la coherencia del generador consigo
 * mismo, que es siempre perfecta y por eso no significa nada.
 */
export function auditar(entrada: EntradaDeAuditoria): Auditoria {
  const fuera: FueraDeAlcance[] = [];
  const auditadas: FilaDeOnPage[] = [];

  for (const fila of entrada.filas) {
    if (fila.accion === "redirigir") {
      fuera.push({
        url: fila.url,
        motivo:
          `Se apaga con un 301 hacia ${fila.redirigeA ?? "su destino"}, asi que no lleva title, ` +
          `meta ni H1 propios y no puede duplicar los de nadie. Queda nombrada y no borrada ` +
          `para que su ausencia del reporte no se lea como un olvido (D-07).`,
      });
      continue;
    }
    auditadas.push(fila);
  }

  const titlesFueraDeRango: FueraDeRango[] = [];
  const metasFueraDeRango: FueraDeRango[] = [];
  const metasFaltantes: Faltante[] = [];
  const keywordNoAlFrente: PrimariaLejos[] = [];

  for (const fila of auditadas) {
    const title = fila.title ?? "";
    const meta = fila.metaDescription ?? "";

    if (title.trim() === "") {
      metasFaltantes.push({ url: fila.url, campo: "title" });
    } else if (title.length > LARGO_DE_TITLE) {
      titlesFueraDeRango.push({
        url: fila.url,
        texto: title,
        largo: title.length,
        limite: LARGO_DE_TITLE,
      });
    }

    if (meta.trim() === "") {
      metasFaltantes.push({ url: fila.url, campo: "metaDescription" });
    } else if (meta.length > LARGO_DE_META) {
      metasFueraDeRango.push({
        url: fila.url,
        texto: meta,
        largo: meta.length,
        limite: LARGO_DE_META,
      });
    }

    if (fila.keywordPrimaria !== null && fila.keywordPrimaria !== "" && title.trim() !== "") {
      const titleNormal = normalizar(title);
      const tokens = tokenizar(fila.keywordPrimaria);
      const ausente = tokens.find((t) => posicionDePalabra(titleNormal, t) === -1);
      const arrancaEn =
        ausente !== undefined ? -1 : posicionDePalabra(titleNormal, tokens[0] as string);
      if (arrancaEn === -1 || arrancaEn > FRENTE_DE_TITLE) {
        keywordNoAlFrente.push({
          url: fila.url,
          keywordPrimaria: fila.keywordPrimaria,
          title,
          arrancaEn,
          limite: FRENTE_DE_TITLE,
        });
      }
    }
  }

  const titlesDuplicados = duplicados(auditadas, (f) => f.title);
  const h1Duplicados = duplicados(auditadas, (f) => f.h1);

  const hallazgos =
    titlesDuplicados.length +
    h1Duplicados.length +
    metasFaltantes.length +
    titlesFueraDeRango.length +
    metasFueraDeRango.length +
    keywordNoAlFrente.length;

  return {
    schema: 1,
    titlesDuplicados,
    h1Duplicados,
    metasFaltantes,
    titlesFueraDeRango,
    metasFueraDeRango,
    keywordNoAlFrente,
    alcance: { auditadas: auditadas.length, fuera },
    resumen: { hallazgos, limpia: hallazgos === 0 },
  };
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase15/auditoria.ts --data data/onpage.json --out data/onpage-audit.json
//
// COSTE DE CUOTA: CERO, y por construccion: este modulo no tiene forma de salir a la red.

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const origen = textoObligatorio(banderas, "data");
  const destino = textoObligatorio(banderas, "out");

  const rutaOrigen = path.isAbsolute(origen) ? origen : path.join(SEO_TOOLS_ROOT, origen);
  const rutaDestino = destinoPermitido(destino, SEO_TOOLS_ROOT);

  const dataset = JSON.parse(readFileSync(rutaOrigen, "utf8")) as EntradaDeAuditoria;
  const resultado = auditar(dataset);
  writeFileSync(rutaDestino, `${JSON.stringify(resultado, null, 2)}\n`, "utf8");

  const out = process.stdout;
  out.write(`Auditoria de ${resultado.alcance.auditadas} URLs\n`);
  out.write(`  titles duplicados:   ${resultado.titlesDuplicados.length}\n`);
  out.write(`  H1 duplicados:       ${resultado.h1Duplicados.length}\n`);
  out.write(`  metas faltantes:     ${resultado.metasFaltantes.length}\n`);
  out.write(`  titles fuera:        ${resultado.titlesFueraDeRango.length}\n`);
  out.write(`  metas fuera:         ${resultado.metasFueraDeRango.length}\n`);
  out.write(`  primaria no al frente: ${resultado.keywordNoAlFrente.length}\n`);
  out.write(`  fuera de alcance:    ${resultado.alcance.fuera.map((f) => f.url).join(", ")}\n`);
  out.write(`\nEscrito: ${rutaDestino}\n`);
  return resultado.resumen.limpia ? 0 : 1;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("auditoria.ts")) {
  ejecutar(main);
}
