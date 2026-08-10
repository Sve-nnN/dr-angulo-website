/**
 * kw:classify — Clasifica intencion y etapa con un motor de reglas determinista.
 *
 * STUB. La firma de abajo es el contrato definitivo y ya no cambia: el plan 12-04 rellena el
 * cuerpo de esta funcion y NO vuelve a tocar src/cli.ts. Eso es lo que permite que los planes
 * de la fase corran en paralelo sin pelearse el archivo de despacho.
 *
 * Determinista a proposito: la misma entrada da la misma salida y el resultado es auditable.
 * El residuo ambiguo se resuelve aparte y se registra, no se adivina en silencio.
 */

import type { Flags } from "../cli.js";

export async function run(_flags: Flags): Promise<number> {
  process.stderr.write(
    "El subcomando kw:classify todavia no esta implementado.\n" +
      "  Se implementa en el plan 12-04 de la fase 12.\n" +
      "  Clasifica intencion y etapa con un motor de reglas determinista.\n",
  );
  return 3;
}
