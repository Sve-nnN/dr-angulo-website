/**
 * cache:stats — estado de la cache y, sobre todo, cuota consumida por fuente.
 *
 * El reporte de cuota es el instrumento que hace visible el gasto acumulado entre corridas y
 * permite decidir cuanto margen queda para la fase 13. Los aciertos y fallos de la corrida en
 * curso son otra cosa y viven y mueren con el proceso.
 */

import type { Flags } from "../cli.js";
import { collectCacheStats, type SourceStats } from "../cache.js";
import { CACHE_DIR } from "../config.js";
import { QuotaBook } from "../quota.js";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null): string {
  return value ?? "-";
}

export async function run(_flags: Flags): Promise<number> {
  const stats = await collectCacheStats(CACHE_DIR);
  const quota = await QuotaBook.open(CACHE_DIR);
  const consumo = quota.snapshot().sources;

  console.log(`Cache: ${CACHE_DIR}`);
  console.log("");

  const fuentes = [...new Set([...Object.keys(stats), ...Object.keys(consumo)])].sort();

  console.log("Entradas en cache por fuente y tipo de resultado");
  if (fuentes.length === 0) {
    console.log("  (cache vacia: ninguna fuente consultada todavia)");
  } else {
    for (const fuente of fuentes) {
      const s: SourceStats = stats[fuente] ?? {
        entries: 0,
        byOutcome: { ok: 0, empty: 0, error: 0 },
        bytes: 0,
        oldest: null,
        newest: null,
      };
      console.log(
        `  ${fuente}: ${s.entries} entradas ` +
          `(ok ${s.byOutcome.ok}, empty ${s.byOutcome.empty}, error ${s.byOutcome.error}), ` +
          `${formatBytes(s.bytes)}`,
      );
      console.log(`    mas antigua: ${formatDate(s.oldest)}   mas nueva: ${formatDate(s.newest)}`);
    }
  }

  console.log("");
  console.log("Cuota consumida por fuente (acumulada entre corridas, leida del libro persistido)");
  if (Object.keys(consumo).length === 0) {
    console.log("  (ninguna llamada salio a la red todavia)");
  } else {
    for (const fuente of Object.keys(consumo).sort()) {
      const registro = consumo[fuente];
      if (registro === undefined) continue;
      console.log(
        `  ${fuente}: ${registro.calls} llamadas a la red ` +
          `(primera ${formatDate(registro.firstCallAt)}, ultima ${formatDate(registro.lastCallAt)})`,
      );
    }
  }
  console.log(`  Libro: ${quota.filePath}`);
  console.log("");
  console.log(
    "Recordatorio de presupuesto: SerpApi esta en plan gratuito, 250 busquedas al mes, " +
      "con 127 disponibles hasta el 21 de agosto de 2026.",
  );

  return 0;
}
