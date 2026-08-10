/**
 * sheet:push — Upsert idempotente del dataset sobre un tab del Sheet del cliente.
 *
 * STUB. La firma de abajo es el contrato definitivo y ya no cambia: el plan 12-02 rellena el
 * cuerpo de esta funcion y NO vuelve a tocar src/cli.ts. Eso es lo que permite que los planes
 * de la fase corran en paralelo sin pelearse el archivo de despacho.
 *
 * Lee la fila de encabezados real desde el volcado de sheet:inspect, nunca asume la fila 1.
 * Algoritmo read-then-diff-then-write: append duplica y SHEET-06 lo prohibe.
 * Escribe con valores crudos, no interpretados: un CPC puede volverse fecha segun el locale.
 * Banderas previstas: --tab, --dry-run, --prune, --add-missing-columns, --yes.
 */

import type { Flags } from "../cli.js";

export async function run(_flags: Flags): Promise<number> {
  process.stderr.write(
    "El subcomando sheet:push todavia no esta implementado.\n" +
      "  Se implementa en el plan 12-02 de la fase 12.\n" +
      "  Upsert idempotente del dataset sobre un tab del Sheet del cliente.\n",
  );
  return 3;
}
