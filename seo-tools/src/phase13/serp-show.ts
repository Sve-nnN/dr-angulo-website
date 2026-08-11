#!/usr/bin/env tsx
/**
 * Punto de entrada: imprime en JSON el registro de SERP de una keyword.
 *
 * Es el tracer de la fase 13. Con `--offline` recorre el camino completo (cache, parser,
 * registro tipado, salida legible) sin emitir ni una busqueda, que es la unica forma
 * aceptable de probar el camino cuando la cuota no se repone hasta el 2026-08-21.
 *
 * No importa `src/cli.ts`: ese modulo ejecuta su despachador al cargarse. Ver `args.ts`.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/serp-show.ts --keyword "hernia discal" --offline
 *   ./node_modules/.bin/tsx src/phase13/serp-show.ts --keyword "hernia discal" --offline --with-types
 */

import { booleana, ejecutar, parseBanderas, texto, textoObligatorio } from "./args.js";
import { clasificarSerp } from "./pagetype.js";
import { leerSerp } from "./serp.js";

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const keyword = textoObligatorio(banderas, "keyword");
  const cacheDir = texto(banderas, "cache-dir");

  const serp = await leerSerp(keyword, {
    offline: booleana(banderas, "offline"),
    refresh: booleana(banderas, "refresh"),
    ...(cacheDir === undefined ? {} : { cacheDir }),
  });

  if (!booleana(banderas, "with-types")) {
    process.stdout.write(`${JSON.stringify(serp, null, 2)}\n`);
    return 0;
  }

  // La salida con tipos reemplaza `organicos` por su version tipificada y suma el reparto del
  // top 10, que es lo que COMP-03 registra por cluster.
  const clasificada = clasificarSerp(serp);
  const salida = {
    ...serp,
    organicos: clasificada.resultados,
    tipoDominante: clasificada.tipoDominante,
    reparto: clasificada.reparto,
  };

  process.stdout.write(`${JSON.stringify(salida, null, 2)}\n`);
  return 0;
}

ejecutar(main);
