#!/usr/bin/env tsx
/**
 * Punto de entrada: emite el PLAN DE CONSULTAS de Ahrefs, con su clave de cache ya calculada.
 *
 * Es la mitad de arriba del traspaso. Ahrefs no tiene credencial en `.secrets/.env` y su unico
 * camino de acceso es el servidor MCP, que vive en la sesion del agente y no en este proceso.
 * Asi que este comando NO consulta nada: dice exactamente que hay que pedir, con que
 * parametros, y bajo que clave va a quedar guardada la respuesta. La otra mitad la hace
 * `ahrefs-ingest.ts`.
 *
 * La clave NUNCA se inventa: sale de `claveDeConsulta`, que es la misma funcion que va a usar
 * la ingesta. Que las dos partes del traspaso lleguen al mismo hash sin que nadie lo escriba a
 * mano es lo que evita que un dato quede guardado donde despues nadie lo encuentra.
 *
 * De SOLO LECTURA sobre la cache. No gasta ni una unidad.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts --domains drcarranzacolumna.com
 *   ./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts --domains a.com,b.com --json
 *   ./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts --keywords "hernia discal,escoliosis"
 *   ./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts --domains a.com --pendientes
 *   ./node_modules/.bin/tsx src/phase13/ahrefs-plan.ts --domains a.com --registrar 13-03
 */

import { CliError } from "../config.js";
import {
  contarPorEndpoint,
  planDeDominios,
  planDeKeywords,
  registrarCorrida,
  type ConsultaPlanificada,
  type OpcionesPlan,
} from "./ahrefs.js";
import { booleana, ejecutar, parseBanderas, texto } from "./args.js";

function lista(raw: string | undefined): string[] {
  if (raw === undefined) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x !== "");
}

function imprimirLegible(consultas: readonly ConsultaPlanificada[]): void {
  const pendientes = consultas.filter((c) => !c.yaEnCache);
  const unidades = pendientes.reduce((n, c) => n + c.unidadesEstimadas, 0);

  process.stdout.write(
    `Plan de consultas de Ahrefs: ${consultas.length} en total, ${pendientes.length} pendientes.\n` +
      `Unidades estimadas de lo pendiente: ${unidades}.\n\n` +
      `Este comando NO consulta nada. Cada respuesta se obtiene por el servidor MCP de Ahrefs y\n` +
      `entra al repositorio con:\n` +
      `  ./node_modules/.bin/tsx src/phase13/ahrefs-ingest.ts \\\n` +
      `      --endpoint <etiqueta> --params '<json de params, tal cual el de abajo>' \\\n` +
      `      --file <cuerpo-crudo.json> --plan 13-03\n\n`,
  );

  for (const c of consultas) {
    process.stdout.write(
      `${c.yaEnCache ? "[en cache]  " : "[pendiente] "}${c.etiqueta}  ->  ${c.objetivo}\n` +
        `  ruta API : ${c.rutaApi}\n` +
        `  params   : ${JSON.stringify(c.params)}\n` +
        `  clave    : ${c.clave}\n` +
        `  unidades : ${c.unidadesEstimadas} (estimadas)\n\n`,
    );
  }
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const dominios = lista(texto(banderas, "domains"));
  const keywords = lista(texto(banderas, "keywords"));
  const cacheDir = texto(banderas, "cache-dir");

  if (dominios.length === 0 && keywords.length === 0) {
    throw new CliError(
      "ahrefs-plan necesita --domains o --keywords.\n" +
        "  Ejemplo: --domains drcarranzacolumna.com,doctormunguia.com\n" +
        '  Ejemplo: --keywords "hernia discal,escoliosis"',
    );
  }

  const opciones: OpcionesPlan = { ...(cacheDir === undefined ? {} : { cacheDir }) };
  const consultas = [
    ...(await planDeDominios(dominios, opciones)),
    ...(await planDeKeywords(keywords, opciones)),
  ];

  const visibles = booleana(banderas, "pendientes")
    ? consultas.filter((c) => !c.yaEnCache)
    : consultas;

  if (booleana(banderas, "json")) {
    process.stdout.write(`${JSON.stringify(visibles, null, 2)}\n`);
  } else {
    imprimirLegible(visibles);
  }

  // Registrar lo PLANIFICADO deja el consumo previsto escrito antes de gastarlo, que es lo
  // unico que permite comparar despues lo previsto con lo ingerido. La entrada pasa a
  // `ingerido` cuando las respuestas llegan por ahrefs-ingest.ts.
  const plan = texto(banderas, "registrar");
  if (plan !== undefined) {
    const libro = await registrarCorrida({
      plan,
      estado: "planificado",
      fecha: new Date().toISOString().slice(0, 10),
      consultasPorEndpoint: contarPorEndpoint(consultas.filter((c) => !c.yaEnCache)),
      nota:
        "Consultas previstas y todavia no obtenidas. Ahrefs no tiene credencial en el entorno: " +
        "el cuerpo se captura por el servidor MCP y entra por ahrefs-ingest.ts.",
    });
    process.stdout.write(
      `Libro de unidades actualizado: ${libro.corridas.length} corridas, ` +
        `${libro.unidadesEstimadas} unidades estimadas acumuladas.\n`,
    );
  }

  return 0;
}

ejecutar(main);
