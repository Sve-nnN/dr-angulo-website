/**
 * Clasificador de tipo de pagina sobre una SERP capturada (COMP-03).
 *
 * TRES COSAS QUE ESTE MODULO NO HACE, IGUAL QUE EL MOTOR DE INTENCION DE LA FASE 12:
 *
 *   1. No consulta a nadie. Ni una peticion, ni un cliente, ni un modelo. El nombre de
 *      ninguna de esas cosas aparece escrito en este archivo, ni siquiera en un comentario:
 *      el criterio de aceptacion del plan 13-01 cuenta apariciones sobre el texto del modulo
 *      y no distingue codigo de prosa.
 *   2. No guarda estado entre llamadas mas alla del archivo de reglas, que se lee una vez y
 *      queda inmutable. Dos corridas sobre la misma SERP dan el mismo resultado byte a byte.
 *   3. No inventa patrones. Todos viven en data/serp-page-types.json.
 *
 * PARA QUE SIRVE, aparte de COMP-03. El reparto de tipos del top 10 es la mitad de la
 * evidencia del punto dulce de KWR-05 (D-09): saber que la posicion 3 la ocupa una clinica
 * con marca fuerte es exactamente lo que un promedio de mercado de dificultad no sabe.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import type { ResultadoOrganico, SerpCompleta } from "./serp.js";

// ---------------------------------------------------------------------------
// Forma del archivo de reglas
// ---------------------------------------------------------------------------

export interface ReglaDeTipo {
  readonly tipo: string;
  readonly etiqueta: string;
  /** Coincidencia exacta o por sufijo de dominio: `quironsalud.com` cubre `teknon.quironsalud.com`. */
  readonly dominios: readonly string[];
  /** Subcadena dentro del dominio. Mas laxa que la anterior, se usa para familias de marca. */
  readonly dominioContiene: readonly string[];
  /** Subcadena dentro de la ruta mas la query, ya en minusculas. */
  readonly rutaContiene: readonly string[];
  /** Verdadero solo en contenido internacional: dominio con TLD extranjero y no local. */
  readonly tldExtranjero: boolean;
}

export interface ReglasDeTipo {
  readonly schema: number;
  readonly porDefecto: string;
  readonly tldsLocales: readonly string[];
  readonly tldsExtranjeros: readonly string[];
  readonly tipos: readonly ReglaDeTipo[];
  /** El orden de evaluacion, explicito. Nunca el orden de iteracion de un objeto. */
  readonly precedencia: readonly string[];
}

const RUTA_REGLAS = path.join(SEO_TOOLS_ROOT, "data", "serp-page-types.json");

function malArchivo(detalle: string): never {
  throw new CliError(
    `El archivo de tipos de pagina es invalido.\n  ${detalle}\n  Archivo: ${RUTA_REGLAS}`,
  );
}

function listaDeTextos(valor: unknown): string[] {
  if (valor === undefined) return [];
  if (!Array.isArray(valor)) malArchivo("se esperaba un arreglo de textos.");
  return valor.filter((v): v is string => typeof v === "string").map((v) => v.toLowerCase());
}

let cache: ReglasDeTipo | null = null;

/** Lee el archivo de reglas una sola vez por proceso y lo valida. */
export function cargarReglasDeTipo(rutaArchivo: string = RUTA_REGLAS): ReglasDeTipo {
  if (cache !== null && rutaArchivo === RUTA_REGLAS) return cache;

  let crudo: string;
  try {
    crudo = readFileSync(rutaArchivo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer los tipos de pagina.\n  Ruta: ${rutaArchivo}\n` +
        `  Accion: verificar que seo-tools/data/serp-page-types.json exista y este commiteado.`,
    );
  }

  let parseado: unknown;
  try {
    parseado = JSON.parse(crudo);
  } catch (error) {
    malArchivo(`no es JSON valido: ${String(error)}`);
  }
  if (parseado === null || typeof parseado !== "object") malArchivo("la raiz no es un objeto.");
  const raiz = parseado as Record<string, unknown>;

  const porDefecto = raiz["porDefecto"];
  if (typeof porDefecto !== "string") malArchivo("falta `porDefecto`.");

  const crudos = raiz["tipos"];
  if (!Array.isArray(crudos) || crudos.length === 0) malArchivo("falta el arreglo `tipos`.");

  const tipos: ReglaDeTipo[] = crudos.map((entrada, i) => {
    if (entrada === null || typeof entrada !== "object") malArchivo(`el tipo ${i} no es un objeto.`);
    const t = entrada as Record<string, unknown>;
    if (typeof t["tipo"] !== "string") malArchivo(`el tipo ${i} no declara nombre.`);
    return {
      tipo: t["tipo"],
      etiqueta: typeof t["etiqueta"] === "string" ? t["etiqueta"] : t["tipo"],
      dominios: listaDeTextos(t["dominios"]),
      dominioContiene: listaDeTextos(t["dominioContiene"]),
      rutaContiene: listaDeTextos(t["rutaContiene"]),
      tldExtranjero: t["tldExtranjero"] === true,
    };
  });

  const precedencia = listaDeTextos(raiz["precedencia"]);
  const declarados = tipos.map((t) => t.tipo);
  if (precedencia.join("|") !== declarados.join("|")) {
    malArchivo(
      `\`precedencia\` no coincide con el orden de \`tipos\`.\n` +
        `  precedencia: ${precedencia.join(", ")}\n  tipos:       ${declarados.join(", ")}`,
    );
  }
  if (!declarados.includes(porDefecto)) {
    malArchivo(`\`porDefecto\` es "${porDefecto}" y ningun tipo lo declara.`);
  }
  if (declarados[declarados.length - 1] !== porDefecto) {
    malArchivo(
      `el tipo por defecto tiene que ir ULTIMO en la precedencia, o ningun otro se alcanzaria.`,
    );
  }

  const reglas: ReglasDeTipo = {
    schema: typeof raiz["schema"] === "number" ? raiz["schema"] : 0,
    porDefecto,
    tldsLocales: listaDeTextos(raiz["tldsLocales"]),
    tldsExtranjeros: listaDeTextos(raiz["tldsExtranjeros"]),
    tipos,
    precedencia,
  };

  if (rutaArchivo === RUTA_REGLAS) cache = reglas;
  return reglas;
}

// ---------------------------------------------------------------------------
// Clasificacion
// ---------------------------------------------------------------------------

export interface ResultadoTipificado extends ResultadoOrganico {
  readonly tipo: string;
  /** Que regla gano, para poder auditar una clasificacion sin releer el archivo. */
  readonly regla: string;
}

export interface SerpClasificada {
  readonly keyword: string;
  readonly resultados: ResultadoTipificado[];
  /** Tipo con mas presencia en el top 10. null solo si no hay ni un organico. */
  readonly tipoDominante: string | null;
  /** Conteo por tipo, emitido en el orden declarado de precedencia. */
  readonly reparto: Record<string, number>;
}

/** Ruta mas query en minusculas: es donde vive la senal de "URL construida sobre la keyword". */
function rutaDe(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`.toLowerCase();
  } catch {
    return "";
  }
}

function terminaEn(dominio: string, sufijos: readonly string[]): boolean {
  return sufijos.some((s) => dominio.endsWith(s));
}

/** Coincidencia por dominio exacto o por sufijo de punto, nunca por subcadena suelta. */
function calzaDominio(dominio: string, candidatos: readonly string[]): string | null {
  for (const candidato of candidatos) {
    if (dominio === candidato || dominio.endsWith(`.${candidato}`)) return candidato;
  }
  return null;
}

function calzaSubcadena(texto: string, candidatos: readonly string[]): string | null {
  for (const candidato of candidatos) {
    if (candidato !== "" && texto.includes(candidato)) return candidato;
  }
  return null;
}

/**
 * Tipo de un solo resultado organico. Gana el PRIMER tipo de la precedencia que calza.
 *
 * Orden de senales dentro de un tipo: dominio exacto, familia de dominio, ruta, TLD. De la
 * mas especifica a la mas general, para que la razon que se reporta sea la mas informativa.
 */
export function clasificarResultado(
  resultado: ResultadoOrganico,
  reglas: ReglasDeTipo = cargarReglasDeTipo(),
): ResultadoTipificado {
  const dominio = resultado.dominio.toLowerCase();
  const ruta = rutaDe(resultado.url);
  const local = terminaEn(dominio, reglas.tldsLocales);

  for (const regla of reglas.tipos) {
    if (regla.tipo === reglas.porDefecto) break;

    const porDominio = calzaDominio(dominio, regla.dominios);
    if (porDominio !== null) return { ...resultado, tipo: regla.tipo, regla: `dominio:${porDominio}` };

    const porFamilia = calzaSubcadena(dominio, regla.dominioContiene);
    if (porFamilia !== null) return { ...resultado, tipo: regla.tipo, regla: `familia:${porFamilia}` };

    const porRuta = calzaSubcadena(ruta, regla.rutaContiene);
    if (porRuta !== null) return { ...resultado, tipo: regla.tipo, regla: `ruta:${porRuta}` };

    if (regla.tldExtranjero && !local && terminaEn(dominio, reglas.tldsExtranjeros)) {
      return { ...resultado, tipo: regla.tipo, regla: "tld:extranjero" };
    }
  }

  return { ...resultado, tipo: reglas.porDefecto, regla: "defecto" };
}

/**
 * Clasifica la SERP entera y calcula el tipo dominante del top 10.
 *
 * DESEMPATE, declarado aca porque de otro modo dos corridas podrian diferir: gana el tipo con
 * mas apariciones; con la misma cantidad, gana el que ocupa la MEJOR posicion; si aun asi
 * empatan, gana el que va primero en la precedencia del archivo. Los tres criterios son
 * funciones de los datos, asi que el resultado es reproducible.
 */
export function clasificarSerp(
  serp: SerpCompleta,
  reglas: ReglasDeTipo = cargarReglasDeTipo(),
): SerpClasificada {
  const resultados = serp.organicos.map((o) => clasificarResultado(o, reglas));

  const conteo = new Map<string, number>();
  const mejorPosicion = new Map<string, number>();
  for (const resultado of resultados) {
    conteo.set(resultado.tipo, (conteo.get(resultado.tipo) ?? 0) + 1);
    const previa = mejorPosicion.get(resultado.tipo);
    if (previa === undefined || resultado.posicion < previa) {
      mejorPosicion.set(resultado.tipo, resultado.posicion);
    }
  }

  // El reparto se emite en el orden de la precedencia, no en el de aparicion: asi dos SERP
  // con los mismos tipos serializan igual y el criterio de SHA-256 significa algo.
  const reparto: Record<string, number> = {};
  for (const tipo of reglas.precedencia) {
    const n = conteo.get(tipo);
    if (n !== undefined) reparto[tipo] = n;
  }

  let tipoDominante: string | null = null;
  for (const tipo of reglas.precedencia) {
    const n = conteo.get(tipo);
    if (n === undefined) continue;
    if (tipoDominante === null) {
      tipoDominante = tipo;
      continue;
    }
    const actual = conteo.get(tipoDominante) as number;
    if (n > actual) {
      tipoDominante = tipo;
      continue;
    }
    if (n === actual) {
      const posNueva = mejorPosicion.get(tipo) as number;
      const posActual = mejorPosicion.get(tipoDominante) as number;
      // Con igual cantidad e igual mejor posicion no hay cambio: gana la precedencia, que es
      // quien ya esta en `tipoDominante` por venir antes en el recorrido.
      if (posNueva < posActual) tipoDominante = tipo;
    }
  }

  return { keyword: serp.keyword, resultados, tipoDominante, reparto };
}
