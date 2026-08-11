#!/usr/bin/env tsx
/**
 * Punto de entrada: mete en la cache un cuerpo de Ahrefs ya capturado, y cuenta la consulta.
 *
 * Es la mitad de abajo del traspaso que abre `ahrefs-plan.ts`. La clave NO se pasa por
 * bandera: se recalcula aca a partir de los mismos `--endpoint` y `--params` que imprimio el
 * plan. Asi el que captura no tiene que copiar un hash de 64 caracteres y no hay forma de
 * guardar un dato bajo una clave equivocada.
 *
 * Un solo comando: computa la clave, valida el cuerpo, persiste el envelope y registra la
 * consulta tanto en `.cache/_quota.json` como en `data/ahrefs-usage.json`.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/ahrefs-ingest.ts \
 *       --endpoint site-explorer/domain-rating \
 *       --params '{"target":"drcarranzacolumna.com","mode":"domain","protocol":"both","date":"2026-08-11"}' \
 *       --file /tmp/dr-carranza.json --plan 13-03
 *
 *   # y, para las dos primeras capturas, dejarlas ademas como fixture commiteada:
 *   ... --fixture data/fixtures/ahrefs-domain-overview.json
 */

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { CACHE_DIR, CliError, resolveFromRepoRoot } from "../config.js";
import { buscarCredenciales, descriptor, ingerirCuerpo } from "./ahrefs.js";
import { ejecutar, parseBanderas, texto, textoObligatorio } from "./args.js";

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const etiqueta = textoObligatorio(banderas, "endpoint");
  const crudoParams = textoObligatorio(banderas, "params");
  const archivo = textoObligatorio(banderas, "file");
  const plan = texto(banderas, "plan") ?? "13-03";
  const cacheDir = texto(banderas, "cache-dir") ?? CACHE_DIR;
  const fixture = texto(banderas, "fixture");

  const d = descriptor(etiqueta);

  let params: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(crudoParams);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("no es un objeto");
    }
    params = parsed as Record<string, unknown>;
  } catch (error) {
    throw new CliError(
      `La bandera --params tiene que traer el JSON de parametros TAL CUAL lo imprimio ahrefs-plan.\n` +
        `  Recibido: ${crudoParams}\n` +
        `  Detalle: ${error instanceof Error ? error.message : String(error)}\n` +
        `  Cualquier diferencia, aunque sea el orden de las claves, no importa: la clave se\n` +
        `  calcula sobre los parametros canonizados. Lo que si importa es que los VALORES sean\n` +
        `  los mismos, o el dato queda guardado bajo otra clave.`,
    );
  }

  const rutaCuerpo = resolveFromRepoRoot(archivo);
  let cuerpoCrudo: string;
  try {
    cuerpoCrudo = await readFile(rutaCuerpo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer el cuerpo capturado.\n  Ruta: ${rutaCuerpo}\n` +
        `  Accion: guardar la respuesta del MCP como JSON crudo y volver a apuntar --file ahi.`,
    );
  }

  const resultado = await ingerirCuerpo({ etiqueta, params, cuerpoCrudo, cacheDir, plan });

  process.stdout.write(
    `Endpoint : ${d.etiqueta}  (${d.rutaApi})\n` +
      `Clave    : ${resultado.clave}\n` +
      `Archivo  : ${resultado.archivo}\n` +
      `Resultado: ${resultado.outcome}\n` +
      `Cuota    : ${
        resultado.cuotaRegistrada
          ? "contada (una consulta nueva de ahrefs)"
          : "NO contada, el mismo cuerpo ya estaba en cache"
      }\n` +
      `${resultado.reemplazo ? "AVISO   : habia un cuerpo DISTINTO bajo esta misma clave y se reemplazo.\n" : ""}` +
      `Campos   : ${resultado.campos.join(", ") || "(ninguno: el cuerpo no trae objetos)"}\n` +
      `Parseado : ${JSON.stringify(resultado.parseado)}\n`,
  );

  // Si el parser no saco nada util, el contrato cambio. Se dice en voz alta aca y no se
  // descubre tres pasos mas adelante con un perfil lleno de nulos.
  const vacio =
    resultado.parseado === null ||
    (Array.isArray(resultado.parseado) && resultado.parseado.length === 0) ||
    (typeof resultado.parseado === "object" &&
      resultado.parseado !== null &&
      !Array.isArray(resultado.parseado) &&
      Object.values(resultado.parseado as Record<string, unknown>).every((v) => v === null));

  if (vacio && resultado.outcome === "ok") {
    process.stdout.write(
      `\nAVISO: la respuesta no esta vacia pero el parser no saco ni un campo.\n` +
        `  Campos esperados por nombre: ${d.select.join(", ")}\n` +
        `  Campos que llegaron: ${resultado.campos.join(", ")}\n` +
        `  Es una deriva de contrato: hay que corregir el parser en src/phase13/ahrefs.ts\n` +
        `  contra estos nombres. El cuerpo ya quedo en cache, asi que corregirlo no cuesta unidades.\n`,
    );
  }

  if (fixture !== undefined) {
    const sospechas = buscarCredenciales(cuerpoCrudo);
    if (sospechas.length > 0) {
      throw new CliError(
        `La fixture NO se escribio: el cuerpo trae algo con forma de credencial.\n` +
          `  Patrones: ${sospechas.join(", ")}`,
      );
    }
    const destino = resolveFromRepoRoot(fixture);
    await mkdir(path.dirname(destino), { recursive: true });
    // Se reserializa con sangria para que la fixture sea legible en una revision de diff.
    await writeFile(destino, `${JSON.stringify(JSON.parse(cuerpoCrudo), null, 2)}\n`, "utf8");
    process.stdout.write(`Fixture  : ${destino}\n`);
  }

  return 0;
}

ejecutar(main);
