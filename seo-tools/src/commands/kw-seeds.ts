/**
 * kw:seeds — Extrae las semillas del contenido del sitio y las congela en un snapshot commiteado.
 *
 * STUB. La firma de abajo es el contrato definitivo y ya no cambia: el plan 12-03 rellena el
 * cuerpo de esta funcion y NO vuelve a tocar src/cli.ts. Eso es lo que permite que los planes
 * de la fase corran en paralelo sin pelearse el archivo de despacho.
 *
 * Importa los modulos de contenido UNA sola vez y escribe data/seeds.json.
 * Los demas subcomandos leen el snapshot: regenerarlo es una decision explicita (--refresh),
 * no un efecto colateral, para no acoplar el CLI a los cambios en vuelo del workstream milestone.
 */

import type { Flags } from "../cli.js";

export async function run(_flags: Flags): Promise<number> {
  process.stderr.write(
    "El subcomando kw:seeds todavia no esta implementado.\n" +
      "  Se implementa en el plan 12-03 de la fase 12.\n" +
      "  Extrae las semillas del contenido del sitio y las congela en un snapshot commiteado.\n",
  );
  return 3;
}
