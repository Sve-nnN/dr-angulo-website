/**
 * dino:probe — Sondea DinoRank y graba la primera respuesta real como fixture.
 *
 * STUB. La firma de abajo es el contrato definitivo y ya no cambia: el plan 12-05 rellena el
 * cuerpo de esta funcion y NO vuelve a tocar src/cli.ts. Eso es lo que permite que los planes
 * de la fase corran en paralelo sin pelearse el archivo de despacho.
 *
 * Se sondea con country=pe y nunca con es: Peru resuelve por otro backend y una fixture
 * espanola daria un parser que falla en produccion.
 * Al 2026-08-10 la clave devuelve HTTP 401 en todos los endpoints. El seam de cache no
 * persiste rechazos de credencial, asi que regenerarla arregla el problema sin borrar nada.
 */

import type { Flags } from "../cli.js";

export async function run(_flags: Flags): Promise<number> {
  process.stderr.write(
    "El subcomando dino:probe todavia no esta implementado.\n" +
      "  Se implementa en el plan 12-05 de la fase 12.\n" +
      "  Sondea DinoRank y graba la primera respuesta real como fixture.\n",
  );
  return 3;
}
