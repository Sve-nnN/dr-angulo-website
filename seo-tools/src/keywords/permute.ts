/**
 * Permutacion semilla x modificador.
 *
 * Funcion pura: recibe semillas y modificadores, devuelve candidatos. Sin efectos y sin red.
 * Es la unica capa de expansion con costo cero y reproducibilidad total, asi que es la que
 * sostiene el umbral de KWR-01 aunque todas las fuentes externas fallen.
 *
 * Tras la enmienda del 2026-08-10 esta capa dejo de cargar con el volumen (DinoRank devuelve
 * cientos de relacionadas por llamada) y paso a ser control de cobertura: detecta los huecos
 * entre condicion, procedimiento y sede que ninguna fuente externa devolvio. Sigue siendo la
 * que tiene que superar las 400 por si sola.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import type { Semilla, TipoSemilla } from "./seeds.js";

export type Posicion = "prefijo" | "sufijo";

export interface Modificador {
  texto: string;
  posicion: Posicion;
}

export interface Familia {
  descripcion: string;
  aplicaA: TipoSemilla[];
  modificadores: Modificador[];
}

export interface Modificadores {
  schema: 1;
  familias: Record<string, Familia>;
}

export interface CandidatoBruto {
  /** Texto visible del candidato. */
  keyword: string;
  /** Texto visible de la semilla de la que nacio. */
  semilla: string;
  /** Familia que lo produjo, o "semilla" cuando es la semilla desnuda. */
  familia: string;
}

export const RUTA_MODIFICADORES = path.join(SEO_TOOLS_ROOT, "data", "modifiers.json");

/**
 * Las keywords se escriben en minusculas, que es como se escriben las busquedas y como se
 * entregan los universos de keyword research. Las tildes y la enie SI se conservan: quitarlas
 * es cosa de la clave normalizada, nunca del texto que se le muestra al cliente.
 */
const aTextoDeBusqueda = (texto: string): string => texto.toLocaleLowerCase("es").replace(/\s+/g, " ").trim();

/** Une modificador y semilla respetando el orden natural del espanol. */
export function combinar(semilla: string, modificador: Modificador): string {
  const base = aTextoDeBusqueda(semilla);
  const mod = aTextoDeBusqueda(modificador.texto);
  return modificador.posicion === "prefijo" ? `${mod} ${base}` : `${base} ${mod}`;
}

/**
 * Recorre semilla por semilla en el orden del snapshot (que es el orden de gasto) y familia
 * por familia en el orden declarado en el archivo de datos. Ese doble orden es lo que hace
 * que dos corridas produzcan el mismo archivo byte por byte.
 */
export function permutar(
  semillas: readonly Semilla[],
  modificadores: Modificadores,
): CandidatoBruto[] {
  const salida: CandidatoBruto[] = [];
  const familias = Object.entries(modificadores.familias);

  for (const semilla of semillas) {
    // La semilla desnuda tambien es una keyword: "hernia discal" se busca tal cual.
    salida.push({ keyword: aTextoDeBusqueda(semilla.keyword), semilla: semilla.keyword, familia: "semilla" });

    for (const [nombre, familia] of familias) {
      if (!familia.aplicaA.includes(semilla.tipo)) continue;

      for (const modificador of familia.modificadores) {
        salida.push({
          keyword: combinar(semilla.keyword, modificador),
          semilla: semilla.keyword,
          familia: nombre,
        });
      }
    }
  }

  return salida;
}

function validar(datos: unknown, ruta: string): Modificadores {
  const familias = (datos as Partial<Modificadores>)?.familias;

  if (familias === undefined || typeof familias !== "object") {
    throw new CliError(`El archivo ${ruta} no declara el objeto "familias".`);
  }

  for (const [nombre, familia] of Object.entries(familias)) {
    if (!Array.isArray(familia?.aplicaA) || !Array.isArray(familia?.modificadores)) {
      throw new CliError(
        `La familia "${nombre}" de ${ruta} tiene que declarar "aplicaA" y "modificadores" como arreglos.`,
      );
    }
    for (const modificador of familia.modificadores) {
      if (typeof modificador?.texto !== "string" || (modificador.posicion !== "prefijo" && modificador.posicion !== "sufijo")) {
        throw new CliError(
          `Un modificador de la familia "${nombre}" de ${ruta} no declara texto y posicion ("prefijo" o "sufijo").`,
        );
      }
    }
  }

  return { schema: 1, familias: familias as Record<string, Familia> };
}

export async function cargarModificadores(ruta: string = RUTA_MODIFICADORES): Promise<Modificadores> {
  let crudo: string;
  try {
    crudo = await readFile(ruta, "utf8");
  } catch {
    throw new CliError(
      `No existe el archivo de modificadores en ${ruta}.\n` +
        `  Es un artefacto commiteado del plan 12-03: si falta, el universo pierde la capa de ` +
        `permutacion entera, que es la unica que no depende de la red.`,
    );
  }

  let datos: unknown;
  try {
    datos = JSON.parse(crudo);
  } catch (error) {
    throw new CliError(
      `El archivo ${ruta} no es JSON valido.\n` +
        `  Detalle: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return validar(datos, ruta);
}
