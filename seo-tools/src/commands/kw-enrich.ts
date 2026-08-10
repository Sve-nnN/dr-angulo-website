/**
 * kw:enrich — Enriquece el universo con las metricas de las fuentes externas.
 *
 * STUB. La firma de abajo es el contrato definitivo y ya no cambia: el plan 12-05 rellena el
 * cuerpo de esta funcion y NO vuelve a tocar src/cli.ts. Eso es lo que permite que los planes
 * de la fase corran en paralelo sin pelearse el archivo de despacho.
 *
 * Tres columnas quedan en el valor literal no_consultado por decision de Juan del 2026-08-10:
 * Traffic Potential, Keyword Difficulty y Referring Domains Needed. No se borran, para que el
 * enriquecimiento se pueda retomar sin migrar el esquema.
 * Bandera --plan-only: emite las claves de cache a rellenar sin gastar una sola consulta.
 */

import type { Flags } from "../cli.js";

export async function run(_flags: Flags): Promise<number> {
  process.stderr.write(
    "El subcomando kw:enrich todavia no esta implementado.\n" +
      "  Se implementa en el plan 12-05 de la fase 12.\n" +
      "  Enriquece el universo con las metricas de las fuentes externas.\n",
  );
  return 3;
}
