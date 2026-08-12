/**
 * Punto de entrada del asignador: lee los datos medidos, corre `assign.ts` y funde el resultado
 * dentro de `data/url-map.jsonl` SIN pisar las lineas de las URLs que no estan en el lote.
 *
 * Uso:
 *   ./node_modules/.bin/tsx src/phase14/assign-run.ts --scope handoff --out data/url-map.jsonl
 *
 * `src/cli.ts` sigue cerrado: este es un ejecutable propio de la fase 14, como los del plan 14-01.
 *
 * COSTE DE CUOTA: CERO. Todo lo que toca SERP se lee de las 96 capturas ya pagadas, offline.
 *
 * POR QUE LAS NUEVE ESPECIFICACIONES VIVEN ACA Y NO EN UN JSON.
 * Cada una lleva `porQue` en prosa, que es la mitad de la justificacion que despues se le
 * entrega al cliente. En un JSON esa prosa se convierte en una cadena larga sin formato que
 * nadie revisa; aca queda al lado de la regla que la aplica y se lee en la revision de codigo,
 * que es donde tiene que discutirse antes de llegar al documento del cliente.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { booleana, ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { cargarIndiceDeSerp } from "./overlap.js";
import { validarAsignacion, type AsignacionDeUrl } from "./model.js";
import {
  asignar,
  type EspecificacionDeUrl,
  type KeywordDeOro,
  type RegistroDeKeyword,
  type RegistroDePuntoDulce,
  type SedeDeOro,
  type TipoDeCabeza,
  type UrlDelInventario,
} from "./assign.js";

const out = process.stdout;

function ruta(...partes: string[]): string {
  return path.join(SEO_TOOLS_ROOT, ...partes);
}

function leerJsonl<T>(nombre: string): T[] {
  return readFileSync(ruta("data", nombre), "utf8")
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l) => JSON.parse(l) as T);
}

function leerJson<T>(nombre: string): T {
  return JSON.parse(readFileSync(ruta("data", nombre), "utf8")) as T;
}

/**
 * Las nueve URLs del handoff a v1.1.
 *
 * Las tres decisiones que Juan cerro el 2026-08-11 estan aplicadas aca y cada una deja su marca:
 *   1. Las cuatro de servicio se reescriben como guia clinica, porque su SERP responde con
 *      contenido informativo largo. Eso NO cambia la keyword: cambia el formato, y por eso
 *      `tipoDePagina` sigue diciendo lo que la pagina es y `tipoExigidoPorSerp` lo que Google
 *      premia. La diferencia entre los dos ES el encargo de la fase 15.
 *   2. `/servicios/escoliosis` se renombra a `/servicios/escoliosis-y-deformidades`. El slug
 *      nuevo es el que entra al mapa; la redireccion 301, el sitemap y los enlaces internos son
 *      trabajo de v1.1 y por eso viajan en el handoff.
 *   3. `/sedes` queda de hub sin keyword primaria, a proposito, para no canibalizar a las cuatro
 *      sedes. Por eso NO esta en esta lista: no es un olvido, es la decision, y queda declarada
 *      en `14-MAPA.md`.
 */
const HANDOFF: readonly EspecificacionDeUrl[] = [
  {
    url: "/servicios/escoliosis-y-deformidades",
    titulo: "Escoliosis y deformidades de columna: diagnóstico y tratamiento",
    origen: "src/content/service-pages.ts:463",
    estado: "viva",
    esPaginaSeo: true,
    familia: "servicio",
    tipoDePagina: "pagina-de-servicio",
    topic: "escoliosis",
    candidatas: ["escoliosis"],
    sirveHoy: "escoliosis",
    renombradaDesde: "/servicios/escoliosis",
    filtroDeTema: "escoliosis",
    porQue:
      "Es la keyword de oro numero uno y la de mayor techo de todo el universo medido, asi que " +
      "la pagina que la pelea es la que mas tiene para ganar. El slug se alarga a " +
      "escoliosis-y-deformidades porque la URL pasa a cubrir el paraguas completo de " +
      "deformidades de columna y no solo escoliosis (decision de Juan del 2026-08-11), y el " +
      "solape par a par lo respalda: escoliosis y escoliosis y deformidades de columna " +
      "comparten cuatro URLs del top 10, por encima del umbral de tres, asi que Google ya las " +
      "trata como la misma pagina.",
  },
  {
    url: "/servicios/hernia-discal",
    titulo: "Hernia discal: síntomas, diagnóstico y tratamiento",
    origen: "src/content/service-pages.ts:87",
    estado: "viva",
    esPaginaSeo: true,
    familia: "servicio",
    tipoDePagina: "pagina-de-servicio",
    topic: "hernia-discal",
    candidatas: ["hernia discal"],
    sirveHoy: "hernia discal",
    filtroDeTema: "hernia discal",
    porQue:
      "La cabeza generica se queda de primaria y no se muda a la variante con Lima: Juan " +
      "descarto mover el objetivo a la geo porque baja el techo de trafico, y la respuesta a la " +
      "SERP es el formato y no la keyword. La pagina existe desde el 2026-08-10 y esta bien " +
      "escrita; lo que no coincide es el formato.",
  },
  {
    url: "/servicios/estenosis-espinal",
    titulo: "Estenosis espinal: síntomas, diagnóstico y tratamiento",
    origen: "src/content/service-pages.ts:276",
    estado: "viva",
    esPaginaSeo: true,
    familia: "servicio",
    tipoDePagina: "pagina-de-servicio",
    topic: "estenosis-espinal",
    candidatas: ["estenosis espinal"],
    sirveHoy: "estenosis espinal",
    filtroDeTema: "estenosis",
    porQue:
      "Es el caso mas extremo de los cuatro: su top 10 medido es ocho de ocho contenido " +
      "internacional, sin una sola pagina comercial adentro. Contra esa SERP no compite una " +
      "pagina de servicio, y por eso la decision de Juan de reescribirla como guia clinica es " +
      "la que mas peso tiene aca.",
  },
  {
    url: "/servicios/ortopedia-infantil",
    titulo: "Ortopedia infantil: desarrollo, marcha y columna en crecimiento",
    origen: "src/content/service-pages.ts:639",
    estado: "viva",
    esPaginaSeo: true,
    familia: "servicio",
    tipoDePagina: "pagina-de-servicio",
    topic: "ortopedia-infantil",
    candidatas: ["ortopedia infantil lima"],
    sirveHoy: "ortopedia infantil",
    filtroDeTema: "ortopedia infantil",
    porQue:
      "Es la unica de las cuatro que ya esta en el formato que su SERP premia, y ademas la que " +
      "la fase 13 marco como la mas ganable: seis de nueve posiciones disputables y la primera " +
      "libre en la uno. Toma la variante con Lima porque es la de oro y porque su SERP es local, " +
      "no internacional. La reescritura de esta es la mas barata de las cuatro: es acercar el " +
      "encabezado a la consulta, no cambiar el genero de la pagina.",
  },
  {
    url: "/servicios",
    titulo: "Traumatólogo Especialista en Columna en Lima — Servicios",
    origen: "src/app/servicios/page.tsx:10",
    estado: "viva",
    esPaginaSeo: true,
    familia: "hub",
    tipoDePagina: "hub-de-servicios",
    topic: "servicios",
    candidatas: ["cirujano de columna lima", "cirugia minimamente invasiva en lima"],
    sirveHoy: null,
    filtroDeTema: "columna",
    porQue:
      "El hub reformulado pelea la consulta de especialidad mas directa del universo: el " +
      "paciente que busca un cirujano de columna en Lima esta buscando a quien opera, no una " +
      "condicion. Dos keywords de oro apuntaban a esta misma URL y el desempate quedo escrito. " +
      "Sus secundarias se filtran por el tema de columna a proposito: su cluster es el de 41 " +
      "cabezas que la fase 13 formo por transitividad y adentro conviven ortopedia infantil y " +
      "traumatologia general, que son de otras paginas.",
  },
  {
    url: "/sedes/clinica-ricardo-palma",
    titulo: "Traumatólogo y cirujano de columna en Clínica Ricardo Palma",
    origen: "src/content/location-pages.ts:67",
    estado: "viva",
    esPaginaSeo: true,
    familia: "sede",
    tipoDePagina: "pagina-de-sede",
    topic: "sedes",
    clinica: "clínica ricardo palma",
    distrito: "san isidro",
    candidatas: ["cirujano de columna clinica ricardo palma"],
    sirveHoy: null,
    porQue:
      "La sede la abrio el tracer del plan 14-01 y aca se revalida dentro del conjunto de las " +
      "nueve. De las tres cabezas de su cluster, la que nombra el procedimiento por el que opera " +
      "el doctor es la que va de primaria; las otras quedan de secundarias porque son la misma " +
      "intencion de paciente con otra especialidad al frente. La ultima ranura la ocupa la geo " +
      "de San Isidro, que por D-04 no genera URL propia y necesita destino.",
  },
  {
    url: "/sedes/sanna-la-molina",
    titulo: "Traumatólogo y cirujano de columna en Clínica Sanna, sede La Molina",
    origen: "src/content/location-pages.ts:86",
    estado: "viva",
    esPaginaSeo: true,
    familia: "sede",
    tipoDePagina: "pagina-de-sede",
    topic: "sedes",
    clinica: "clínica sanna",
    distrito: "la molina",
    candidatas: ["cirujano de columna clinica sanna"],
    sirveHoy: null,
    porQue:
      "Es la sede donde el nombre de clinica y el distrito se pisan, y D-04 los separa: el " +
      "nombre de clinica puede ser primaria de una URL de sede y el modificador de distrito no " +
      "genera URL propia. Por eso encabeza la de Sanna y las de La Molina entran de secundarias " +
      "en esta misma pagina, que es la unica del sitio que atiende ese distrito.",
  },
  {
    url: "/sedes/clinica-tezza",
    titulo: "Traumatólogo y cirujano de columna en Clínica Padre Luis Tezza",
    origen: "src/content/location-pages.ts:105",
    estado: "viva",
    esPaginaSeo: true,
    familia: "sede",
    tipoDePagina: "pagina-de-sede",
    topic: "sedes",
    clinica: "clínica tezza",
    candidatas: ["ortopedia infantil clinica tezza"],
    sirveHoy: null,
    porQue:
      "Encabeza con ortopedia infantil y no con columna porque es lo que la fase 13 midio para " +
      "esta sede: seis de nueve posiciones disputables con la primera libre en la tres. No se le " +
      "declara distrito aunque la clinica este en Surco, y eso es deliberado: el consultorio " +
      "privado ya pelea las geo de Surco, y cargarselas tambien a esta sede seria montar la " +
      "canibalizacion que MAP-02 existe para atrapar.",
  },
  {
    url: "/sedes/consultorio-privado",
    titulo: "Consultorio de traumatología y columna en Surco, Lima",
    origen: "src/content/location-pages.ts:45",
    estado: "viva",
    esPaginaSeo: true,
    familia: "sede",
    tipoDePagina: "pagina-de-sede",
    topic: "sedes",
    distrito: "surco",
    candidatas: ["cirugia de columna surco"],
    sirveHoy: null,
    porQue:
      "Es la unica de las cuatro sedes sin nombre de clinica, asi que su identidad es el " +
      "distrito. D-04 dice que una geo de distrito no genera URL propia, y esta no la genera: la " +
      "URL ya existe y es la que atiende Surco, asi que recibe la geo en vez de crear una pagina " +
      "nueva para ella. La fase 13 midio nueve de nueve posiciones disputables en ese top 10, la " +
      "mejor proporcion de todo el lote.",
  },
];

interface ArchivoDeOro {
  readonly keywords: readonly KeywordDeOro[];
  readonly sedes: readonly SedeDeOro[];
}

interface ArchivoDeTipos {
  readonly cabezas: readonly TipoDeCabeza[];
}

interface ArchivoDeInventario {
  readonly urls: readonly UrlDelInventario[];
}

/** Funde las filas nuevas dentro del archivo existente sin tocar las URLs que no vienen en el lote. */
function fundir(existentes: readonly AsignacionDeUrl[], nuevas: readonly AsignacionDeUrl[]): AsignacionDeUrl[] {
  const porUrl = new Map<string, AsignacionDeUrl>();
  for (const a of existentes) porUrl.set(a.url, a);
  for (const a of nuevas) porUrl.set(a.url, a);
  return [...porUrl.values()].sort((a, b) => a.url.localeCompare(b.url, "es"));
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const scope = texto(banderas, "scope") ?? "handoff";
  const destino = texto(banderas, "out") ?? "data/url-map.jsonl";
  if (scope !== "handoff") {
    throw new CliError(`--scope solo admite "handoff" en el plan 14-02, y llego "${scope}".`);
  }

  const universo = leerJsonl<RegistroDeKeyword>("keywords-13.jsonl");
  const puntoDulce = leerJsonl<RegistroDePuntoDulce>("sweet-spot.jsonl");
  const oro = leerJson<ArchivoDeOro>("golden-10.json");
  const tipos = leerJson<ArchivoDeTipos>("page-type-map.json");
  const inventario = leerJson<ArchivoDeInventario>("url-inventory.json");

  // Solo se indexan las cabezas que participan del veredicto: las primarias del lote. Cargar
  // las 91 seria pagar lecturas de cache que ningun par de este plan va a comparar.
  const primarias = HANDOFF.flatMap((s) => s.candidatas);
  const indice = await cargarIndiceDeSerp(
    primarias.map((clave) => universo.find((k) => k.keywordKey === clave)?.keyword ?? clave),
  );

  const resultado = asignar({
    especificaciones: HANDOFF,
    universo,
    oro: oro.keywords,
    sedesDeOro: oro.sedes,
    puntoDulce,
    tiposDePagina: tipos.cabezas,
    inventario: inventario.urls,
    indice,
  });

  const rutaDestino = path.isAbsolute(destino) ? destino : ruta(destino);
  let existentes: AsignacionDeUrl[] = [];
  try {
    existentes = readFileSync(rutaDestino, "utf8")
      .split("\n")
      .filter((l) => l.trim() !== "")
      .map((l, i) => validarAsignacion(JSON.parse(l), `${destino}:${i + 1}`));
  } catch {
    existentes = [];
  }

  const fundidas = fundir(existentes, resultado.asignaciones);
  for (const [i, fila] of fundidas.entries()) validarAsignacion(fila, `salida:${i + 1}`);

  writeFileSync(rutaDestino, `${fundidas.map((f) => JSON.stringify(f)).join("\n")}\n`, "utf8");

  out.write(`Lote: ${scope} (${resultado.asignaciones.length} URLs)\n`);
  out.write(`Archivo: ${destino} (${fundidas.length} lineas)\n\n`);
  for (const a of resultado.asignaciones) {
    out.write(`${a.url}\n`);
    out.write(`  primaria: ${a.keywordPrimaria} [${a.intent}]\n`);
    out.write(`  secundarias: ${a.secundarias.join(" | ")}\n`);
    out.write(`  tipo: ${a.tipoDePagina} -> SERP exige ${a.tipoExigidoPorSerp ?? "sin medir"}\n`);
    out.write(`  accion: ${a.accion} / ${a.dejarActualizarEliminar}\n`);
  }

  out.write(`\nConflictos desempatados: ${resultado.conflictos.length}\n`);
  for (const c of resultado.conflictos) {
    out.write(`  "${c.keyword}": gana ${c.ganadora} sobre ${c.perdedora} -> ${c.destinoDeLaPerdedora}\n`);
    out.write(`    ${c.motivo}\n`);
  }

  out.write(`\nVeredictos de solape consultados: ${resultado.veredictos.length}\n`);
  for (const v of resultado.veredictos) {
    if (v.fusionable || v.cardinalidad > 0) {
      out.write(`  ${v.a} <> ${v.b}: ${v.cardinalidad} compartidas, fusionable=${v.fusionable}\n`);
    }
  }
  const fusionables = resultado.veredictos.filter((v) => v.fusionable).length;
  out.write(`  fusionables: ${fusionables} de ${resultado.veredictos.length}\n`);

  out.write(`\nKeywords de oro sin URL en este lote: ${resultado.oroSinUrl.length}\n`);
  for (const k of resultado.oroSinUrl) out.write(`  ${k}\n`);

  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("assign-run.ts")) {
  ejecutar(main);
}
