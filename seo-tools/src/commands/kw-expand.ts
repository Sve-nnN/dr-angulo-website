/**
 * kw:expand — Expande el universo cruzando semillas, modificadores y geo, y deduplica por clave normalizada.
 *
 * STUB. La firma de abajo es el contrato definitivo y ya no cambia: el plan 12-03 rellena el
 * cuerpo de esta funcion y NO vuelve a tocar src/cli.ts. Eso es lo que permite que los planes
 * de la fase corran en paralelo sin pelearse el archivo de despacho.
 *
 * La deduplicacion usa la clave normalizada, nunca el texto visible.
 * Todo lo que salga a la red pasa por el seam de cache. Banderas: --limit, --max-searches, --offline.
 */

import type { Flags } from "../cli.js";

export async function run(_flags: Flags): Promise<number> {
  process.stderr.write(
    "El subcomando kw:expand todavia no esta implementado.\n" +
      "  Se implementa en el plan 12-03 de la fase 12.\n" +
      "  Expande el universo cruzando semillas, modificadores y geo, y deduplica por clave normalizada.\n",
  );
  return 3;
}
