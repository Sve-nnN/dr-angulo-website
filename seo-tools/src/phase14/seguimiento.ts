/**
 * Columnas de SEGUIMIENTO: las que el cargador siembra una vez y despues no vuelve a tocar.
 *
 * POR QUE EXISTE ESTE MODULO.
 *
 * Los dos tabs que escribe el plan 14-04 traen columnas que NO son dato del repositorio sino
 * respuesta del cliente: `Approved?` e `Implemented?` en `Canonical Audit`, `Done` en
 * `Internal Linking Audit`. El cargador tiene que poner el valor inicial —una celda vacia se
 * lee como olvido y no como "todavia no"— y no puede volver a ponerlo nunca mas: la segunda
 * corrida se lleva por delante la respuesta que Juan escribio en el medio, sin lanzar ninguna
 * excepcion y con un resumen que dice que todo salio bien.
 *
 * Es la misma clase de dano que `omitirCamposAusentes` ataja para las columnas de otras fases,
 * cometido sobre las columnas del cliente dentro de la propia fase. Y se resuelve con el mismo
 * mecanismo, que es lo que lo hace barato: el campo se QUITA del registro y el escritor deja
 * esa celda literalmente fuera de la peticion.
 *
 * Todo lo que hace es de solo lectura.
 */

import { CliError } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { columnLetterFromIndex, type TabSchema } from "../sheets/schema.js";
import type { WriteGateway } from "../sheets/upsert.js";

/**
 * Claves de fila que ya tienen escrito cada campo de seguimiento.
 *
 * `Map<campo, Set<clave normalizada>>`. Una clave dentro del conjunto significa que esa celda
 * trae contenido HOY en el documento, venga de una siembra anterior o de la mano de Juan: en
 * los dos casos la respuesta es la misma, no se pisa.
 */
export type YaSembrado = ReadonlyMap<string, ReadonlySet<string>>;

/**
 * Lee del documento que celdas de seguimiento ya tienen algo escrito.
 *
 * Una sola llamada de red: el bloque de datos entero desde la primera fila util. Se apoya en
 * `schema.byField`, asi que funciona igual en un tab mapeado por nombre y en uno mapeado por
 * posicion.
 */
export async function leerYaSembrado(
  gateway: WriteGateway,
  schema: TabSchema,
  campos: readonly string[],
): Promise<YaSembrado> {
  const salida = new Map<string, Set<string>>();
  for (const campo of campos) salida.set(campo, new Set<string>());
  if (campos.length === 0) return salida;

  const claveHeader = schema.tab.keyHeader;
  if (claveHeader === null) {
    throw new CliError(
      `El tab "${schema.tab.sheetTitle}" no declara columna clave: no se puede saber a que fila ` +
        `pertenece cada celda de seguimiento.`,
    );
  }
  const columnaClave = [...schema.byHeader.values()].find(
    (c) => c.header.trim() === claveHeader.trim(),
  );
  if (columnaClave === undefined) {
    throw new CliError(`No se encontro la columna clave en "${schema.tab.sheetTitle}".`);
  }

  const indices = new Map<string, number>();
  let ultima = columnaClave.index;
  for (const campo of campos) {
    const columna = schema.byField.get(campo);
    if (columna === undefined) {
      throw new CliError(
        `El campo de seguimiento "${campo}" no tiene columna en "${schema.tab.sheetTitle}".\n` +
          `  La carga se detiene: sin columna, la siembra no se puede saltear y la respuesta del\n` +
          `  cliente se sobreescribiria en cada corrida.`,
      );
    }
    indices.set(campo, columna.index);
    ultima = Math.max(ultima, columna.index);
  }

  const region = await gateway.readRegion(
    schema.tab.sheetTitle,
    schema.firstDataRow,
    columnLetterFromIndex(ultima),
  );

  for (const fila of region) {
    const clave = normalizeKeyword(fila[columnaClave.index] ?? "");
    if (clave === "") continue;
    for (const [campo, indice] of indices) {
      if ((fila[indice] ?? "").trim() === "") continue;
      (salida.get(campo) as Set<string>).add(clave);
    }
  }

  return salida;
}

/**
 * Quita del registro los campos de seguimiento que esa fila ya tiene escritos.
 *
 * El campo AUSENTE es la senal: con `omitirCamposAusentes` activo, el escritor parte el rango
 * y la celda queda fuera de la peticion. Devolver el valor vacio en su lugar la BORRARIA, que
 * es justo el accidente que este modulo evita.
 */
export function sembrarSoloUnaVez(
  fila: Record<string, unknown>,
  clave: string,
  yaSembrado: YaSembrado,
): Record<string, unknown> {
  const salida: Record<string, unknown> = { ...fila };
  for (const [campo, claves] of yaSembrado) {
    if (claves.has(clave)) delete salida[campo];
  }
  return salida;
}

/** Cuantas celdas de seguimiento se van a sembrar de verdad en esta corrida. */
export function porSembrar(
  filas: readonly Record<string, unknown>[],
  campos: readonly string[],
): number {
  return filas.reduce(
    (total, fila) => total + campos.filter((campo) => campo in fila).length,
    0,
  );
}
