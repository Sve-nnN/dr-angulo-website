/**
 * dino:probe — Sondea DinoRank y graba la respuesta real como fixture commiteable.
 *
 * Por que existe este subcomando y por que corre ANTES de escribir un parser: la doc del
 * proveedor lista los parametros de los cuatro endpoints pero no publica ni un solo ejemplo de
 * respuesta, no expone OpenAPI en ninguna de las rutas habituales, y describe el bloque de
 * datos solo como "el analisis". Un parser escrito contra esa descripcion seria una suposicion.
 *
 * Se sondea con country=pe y NUNCA con otro pais. La doc dice que Espana y Mexico se resuelven
 * con el servidor de visibilidad propio de DinoRank y que el resto de los paises pasa por
 * DataForSEO: una fixture de otro pais produce un parser que falla en produccion. Por eso el
 * comando aborta si le piden otro pais en vez de limitarse a avisar.
 *
 * Nada de lo que se graba puede contener la credencial. La respuesta pasa por un saneado que
 * borra las claves de aspecto credencial y tacha cualquier eco del valor de la clave antes de
 * tocar el disco, porque estas fixtures se commitean y quedan a la vista del repositorio.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { flagBool, flagNumber, flagString, type Flags } from "../cli.js";
import { CACHE_DIR, CliError, SEO_TOOLS_ROOT, describeSecret } from "../config.js";
import { QuotaBook } from "../quota.js";
import {
  consultarDinorank,
  ENDPOINTS_DINORANK,
  parseKeywordResearch,
  urlEndpoint,
  type EndpointDinorank,
} from "../sources/dinorank.js";

const DIR_FIXTURES = path.join(SEO_TOOLS_ROOT, "data", "fixtures");

/** Dominio del proyecto. Los dos endpoints de proyecto lo necesitan para resolver a que sitio
 *  se refieren; ninguno de los dos consume cuota, segun la doc del proveedor. */
const DOMINIO_POR_DEFECTO = "drangulocolumna.com";

/** Semilla de sondeo: cabecera real del negocio y de dos palabras. La fuente resuelve terminos
 *  cabecera y no frases, medido en el plan 03: una semilla de cuatro palabras devuelve cero. */
const KEYWORD_POR_DEFECTO = "hernia discal";

const PAIS_OBLIGATORIO = "pe";

/** Claves que jamas se graban, aunque el proveedor las devuelva en el cuerpo. */
const CLAVES_PROHIBIDAS = new Set([
  "api_key",
  "apikey",
  "apiKey",
  "x-api-key",
  "X-API-Key",
  "token",
  "access_token",
  "refresh_token",
  "session",
  "session_id",
  "authorization",
  "Authorization",
  "password",
  "secret",
]);

const REDACTADO = "[[redactado por dino:probe]]";

interface Recorte {
  ruta: string;
  original: number;
  conservados: number;
}

/**
 * Seudonimizacion de datos de terceros.
 *
 * Los endpoints de auditoria y de canibalizaciones NO aceptan un dominio suelto: resuelven
 * contra un proyecto ya dado de alta en la cuenta de DinoRank. El unico proyecto que la cuenta
 * tiene cargado es de OTRO cliente, asi que la unica forma de conocer el contrato de esos dos
 * endpoints es sondear ese proyecto. Lo que importa de la fixture es la FORMA -- nombres de
 * campo, anidamiento, tipos --, no el contenido, y el contenido no puede quedar commiteado en
 * el repositorio de este cliente.
 *
 * El reemplazo es ESTABLE: el mismo valor de entrada produce siempre el mismo seudonimo. Sin
 * eso se perderia la relacion de duplicidad, que es justamente lo que una auditoria de titles
 * y H1 duplicados tiene que poder detectar, y la fixture no serviria para probar el parser.
 */
const CAMPOS_DOMINIO = new Set(["domain", "dominio"]);
const CAMPOS_URL = new Set(["url", "relative_url", "urlCompara", "link", "enlace"]);
const CAMPOS_ID = new Set(["id", "site_id", "project_id", "siteId"]);

/**
 * Lista de EXCLUSION, no de inclusion. Es la diferencia entre un control de fuga que funciona
 * y uno que aparenta funcionar: con una lista de campos a seudonimizar, cualquier campo que el
 * proveedor no haya devuelto durante el sondeo pasa intacto. Ya paso una vez, con
 * `metadescription`, que no estaba en la lista y filtro la descripcion entera del otro cliente.
 *
 * Aca solo sobreviven los campos que son enumerados o estructurales, y todo lo demas que sea
 * texto libre se reemplaza. Un campo nuevo del proveedor entra seudonimizado por defecto.
 */
const CAMPOS_ESTRUCTURALES = new Set([
  "country",
  "language",
  "pais",
  "idioma",
  "source",
  "tipo",
  "subtipo",
  "mode",
  "payload_mode",
  "estado",
  "status",
  "segundos",
  "schema",
]);

/** Un token corto y sin espacios es casi siempre un valor de enumeracion, no contenido. */
const LARGO_TOKEN = 24;

function pareceContenido(valor: string): boolean {
  return valor.length > LARGO_TOKEN || valor.includes(" ");
}

class Seudonimos {
  readonly #urls = new Map<string, string>();
  readonly #textos = new Map<string, string>();
  readonly #ids = new Map<string, string>();

  dominio(): string {
    return "ejemplo-de-proyecto.com";
  }

  url(valor: string): string {
    const previo = this.#urls.get(valor);
    if (previo !== undefined) return previo;
    const esquema = valor.startsWith("http://") ? "http" : "https";
    const nuevo = `${esquema}://${this.dominio()}/pagina-${this.#urls.size + 1}`;
    this.#urls.set(valor, nuevo);
    return nuevo;
  }

  texto(valor: string): string {
    const previo = this.#textos.get(valor);
    if (previo !== undefined) return previo;
    const nuevo = `Texto de ejemplo ${this.#textos.size + 1}`;
    this.#textos.set(valor, nuevo);
    return nuevo;
  }

  id(valor: string): string {
    const previo = this.#ids.get(valor);
    if (previo !== undefined) return previo;
    const nuevo = String(900000000 + this.#ids.size + 1);
    this.#ids.set(valor, nuevo);
    return nuevo;
  }

  /** Para las claves de los mapas de duplicados, que son el propio texto duplicado. */
  clave(valor: string): string {
    if (/^https?:\/\//.test(valor)) return this.url(valor);
    if (pareceContenido(valor)) return this.texto(valor);
    return valor;
  }

  total(): number {
    return this.#urls.size + this.#textos.size + this.#ids.size;
  }
}

function seudonimizar(valor: unknown, clave: string | undefined, s: Seudonimos): unknown {
  if (Array.isArray(valor)) return valor.map((item) => seudonimizar(item, clave, s));

  if (valor !== null && typeof valor === "object") {
    const salida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      // Las claves posicionales "0", "1", "2" son el artefacto de un fetch_array del proveedor:
      // repiten el valor de un campo nombrado. La CLAVE es parte del contrato y se conserva
      // tal cual; lo que se seudonimiza es su valor, infiriendo el tipo por la forma.
      const posicional = /^\d+$/.test(k);
      salida[posicional ? k : s.clave(k)] = seudonimizar(v, posicional ? undefined : k, s);
    }
    return salida;
  }

  if (typeof valor === "number" && clave !== undefined && CAMPOS_ID.has(clave)) {
    return Number(s.id(String(valor)));
  }

  if (typeof valor !== "string" || valor === "") return valor;

  if (clave !== undefined) {
    if (CAMPOS_ESTRUCTURALES.has(clave)) return valor;
    if (CAMPOS_DOMINIO.has(clave)) return s.dominio();
    if (CAMPOS_URL.has(clave)) return s.url(valor);
    if (CAMPOS_ID.has(clave)) return s.id(valor);
  }

  if (/^https?:\/\//.test(valor)) return s.url(valor);
  if (/^\d+$/.test(valor)) return s.id(valor);
  return pareceContenido(valor) ? s.texto(valor) : valor;
}

/**
 * Saneado y recorte en una sola pasada.
 *
 * El recorte existe porque una sola respuesta de keyword research pesa cerca de 900 KB y esa
 * fixture se commitea: lo que hace falta para escribir y probar un parser son las primeras
 * entradas y la forma, no las 899. La respuesta completa queda igual en la cache, que es
 * gitignoreada.
 */
function sanear(
  valor: unknown,
  clave: string | undefined,
  ruta: string,
  maxItems: number | undefined,
  recortes: Recorte[],
): unknown {
  if (clave !== undefined && CLAVES_PROHIBIDAS.has(clave)) return REDACTADO;

  if (Array.isArray(valor)) {
    const conservados =
      maxItems !== undefined && valor.length > maxItems ? valor.slice(0, maxItems) : valor;
    if (conservados.length !== valor.length) {
      recortes.push({ ruta, original: valor.length, conservados: conservados.length });
    }
    return conservados.map((item, i) => sanear(item, undefined, `${ruta}[${i}]`, maxItems, recortes));
  }

  if (valor !== null && typeof valor === "object") {
    const salida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      salida[k] = sanear(v, k, ruta === "" ? k : `${ruta}.${k}`, maxItems, recortes);
    }
    return salida;
  }

  return valor;
}

/**
 * Ultima barrera antes del disco: si el valor literal de la credencial aparece en cualquier
 * lugar del texto serializado, el comando aborta en vez de grabar. No intenta arreglarlo:
 * que el proveedor devuelva la clave en el cuerpo es un hallazgo que hay que ver, no tapar.
 */
function abortarSiFiltraCredencial(texto: string): void {
  const clave = process.env["DINORANK_API_KEY"];
  if (clave === undefined || clave.trim() === "") return;
  if (!texto.includes(clave.trim())) return;

  throw new CliError(
    `La respuesta del proveedor contiene el valor de la credencial y la fixture NO se grabo.\n` +
      `  Estado de la credencial: ${describeSecret(clave)}\n` +
      `  Accion: revisar que campo la devuelve y agregarlo a CLAVES_PROHIBIDAS en dino-probe.ts ` +
      `antes de volver a sondear.`,
  );
}

function tipoDe(valor: unknown): string {
  if (valor === null) return "null";
  if (Array.isArray(valor)) return `array(${valor.length})`;
  return typeof valor;
}

function muestraDe(valor: unknown): string {
  if (valor === null || valor === undefined) return String(valor);
  if (Array.isArray(valor)) {
    const primero = valor[0];
    if (primero === undefined) return "[]";
    if (primero !== null && typeof primero === "object") {
      return `[ { ${Object.keys(primero as object).join(", ")} }, ... ]`;
    }
    return `[ ${JSON.stringify(primero)}, ... ]`;
  }
  if (typeof valor === "object") return `{ ${Object.keys(valor as object).join(", ")} }`;
  const texto = JSON.stringify(valor) ?? "";
  return texto.length > 80 ? `${texto.slice(0, 77)}...` : texto;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return valor !== null && typeof valor === "object" && !Array.isArray(valor);
}

/** Inventario de la respuesta: es lo que permite escribir el parser mirando lo que hay. */
function inventariar(cuerpo: unknown): void {
  console.log("Inventario de la respuesta");
  console.log("-".repeat(72));

  if (!esObjeto(cuerpo)) {
    console.log(`  la respuesta no es un objeto: ${tipoDe(cuerpo)}`);
    console.log(`  valor: ${muestraDe(cuerpo)}`);
    return;
  }

  console.log("  primer nivel:");
  for (const [k, v] of Object.entries(cuerpo)) {
    console.log(`    ${k.padEnd(18)} ${tipoDe(v).padEnd(14)} ${muestraDe(v)}`);
  }

  // El bloque de datos: la doc lo describe entero como "el analisis" y no enumera un solo campo.
  // Se desciende a ciegas y no por nombre porque cada endpoint lo llama distinto: keyword
  // research y auditoria lo anidan en data.data, tfidf en data.analysis, canibalizaciones lo
  // reparte en varias claves hermanas.
  const nivel1 = cuerpo["data"];
  if (!esObjeto(nivel1)) return;

  console.log("");
  console.log("  data:");
  for (const [k, v] of Object.entries(nivel1)) {
    console.log(`    ${k.padEnd(24)} ${tipoDe(v).padEnd(14)} ${muestraDe(v)}`);
  }

  for (const [nombre, bloque] of Object.entries(nivel1)) {
    if (!esObjeto(bloque)) continue;
    console.log("");
    console.log(`  data.${nombre}:`);
    for (const [k, v] of Object.entries(bloque)) {
      console.log(`    ${k.padEnd(24)} ${tipoDe(v).padEnd(14)} ${muestraDe(v)}`);
    }

    for (const [k, v] of Object.entries(bloque)) {
      const primero = Array.isArray(v) ? v[0] : undefined;
      if (!esObjeto(primero)) continue;
      console.log("");
      console.log(`  data.${nombre}.${k}[0]:`);
      for (const [k2, v2] of Object.entries(primero)) {
        console.log(`    ${k2.padEnd(24)} ${tipoDe(v2).padEnd(14)} ${muestraDe(v2)}`);
      }
    }
  }
}

/**
 * Mapeo explicito de las tres metricas que KWR-02 necesita. Se imprime como parte del sondeo
 * porque el criterio de aceptacion pide que el inventario diga cual campo es cual, y si alguno
 * no existe eso es un hallazgo que hay que registrar, no un detalle.
 */
function reportarMetricas(cuerpo: unknown): void {
  const keywords = parseKeywordResearch(cuerpo);
  console.log("");
  console.log("Mapeo de las tres metricas de KWR-02");
  console.log("-".repeat(72));

  if (keywords.length === 0) {
    console.log("  la respuesta no trae relacionadas: no hay de donde leer las metricas.");
    return;
  }

  const conVolumen = keywords.filter((k) => k.searchVolume > 0).length;
  console.log(`  volumen      <- data.data.keywords[].search_volume   (number)`);
  console.log(`  cpc          <- data.data.keywords[].cpc             (number)`);
  console.log(`  competencia  <- data.data.keywords[].competition     (number)`);
  console.log("");
  console.log(`  relacionadas: ${keywords.length}`);
  console.log(`  con volumen medible: ${conVolumen} (${((conVolumen / keywords.length) * 100).toFixed(1)}%)`);
  console.log("");
  console.log("  TRAMPA: la keyword consultada vuelve SIEMPRE con data.data.datos.search_volume");
  console.log("  en cero. Leer el volumen de ahi saca el universo entero en cero y el fallo es");
  console.log("  silencioso, porque cero es un valor valido. Se lee de keywords[].");
}

function construirParametros(endpoint: EndpointDinorank, flags: Flags): Record<string, unknown> {
  const pais = flagString(flags, "country") ?? PAIS_OBLIGATORIO;
  if (pais.toLowerCase() !== PAIS_OBLIGATORIO) {
    throw new CliError(
      `El sondeo se hace con country=${PAIS_OBLIGATORIO} y se pidio "${pais}".\n` +
        `  Espana y Mexico los resuelve el servidor de visibilidad propio de DinoRank y el resto\n` +
        `  de los paises pasa por DataForSEO, asi que la forma de la respuesta puede diferir.\n` +
        `  Una fixture del pais equivocado produce un parser que falla en produccion.`,
    );
  }

  const idioma = flagString(flags, "language") ?? "es";
  const base = { country: pais.toLowerCase(), language: idioma };

  switch (endpoint) {
    case "keyword-research":
      return { keyword: flagString(flags, "keyword") ?? KEYWORD_POR_DEFECTO, ...base };

    case "tfidf": {
      const url = flagString(flags, "url");
      return {
        keyword: flagString(flags, "keyword") ?? KEYWORD_POR_DEFECTO,
        ...base,
        ...(url !== undefined ? { url } : {}),
      };
    }

    case "auditoria": {
      const projectId = flagString(flags, "project-id");
      const url = flagString(flags, "url");
      return {
        domain: flagString(flags, "domain") ?? DOMINIO_POR_DEFECTO,
        ...base,
        tipo: flagString(flags, "tipo") ?? "summary",
        ...(flagString(flags, "subtipo") !== undefined ? { subtipo: flagString(flags, "subtipo") } : {}),
        ...(projectId !== undefined ? { project_id: projectId } : {}),
        ...(url !== undefined ? { url } : {}),
      };
    }

    case "canibalizaciones": {
      const projectId = flagString(flags, "project-id");
      return {
        domain: flagString(flags, "domain") ?? DOMINIO_POR_DEFECTO,
        ...base,
        consejos: flagBool(flags, "consejos"),
        ...(projectId !== undefined ? { project_id: projectId } : {}),
      };
    }
  }
}

function usage(): string {
  return [
    "Uso: npm run cli -- dino:probe --endpoint <endpoint> [banderas]",
    "",
    `  --endpoint <nombre>   Uno de: ${ENDPOINTS_DINORANK.join(", ")}.`,
    "  --country <pais>      Solo se acepta pe. Cualquier otro aborta y explica por que.",
    "  --language <idioma>   Por defecto, es.",
    "  --keyword <texto>     Semilla para keyword-research y tfidf.",
    "  --url <url>           Opcional para tfidf y auditoria.",
    "  --domain <dominio>    Para auditoria y canibalizaciones.",
    "  --project-id <id>     Identificador del proyecto en DinoRank, si existe.",
    "  --tipo <tipo>         Para auditoria. Por defecto, summary.",
    "  --subtipo <subtipo>   Para auditoria.",
    "  --consejos            Para canibalizaciones.",
    "  --out <ruta>          Destino de la fixture. Por defecto, data/fixtures/.",
    "  --max-items <n>       Recorta a n los arreglos de la fixture. La cache guarda todo igual.",
    "  --anonymize           Reemplaza dominios, URLs, titulos e identificadores por seudonimos",
    "                        estables. Obligatorio cuando el proyecto sondeado es de otro",
    "                        cliente: la fixture se commitea y la forma es lo unico que importa.",
    "  --refresh             Ignora el acierto de cache y vuelve a sondear.",
    "  --offline             Prohibe salir a la red: solo graba lo que ya este en cache.",
    "",
    "Ninguna fixture grabada puede contener la credencial: el comando aborta si la detecta.",
    "",
  ].join("\n");
}

export async function run(flags: Flags): Promise<number> {
  if (flagBool(flags, "help")) {
    process.stdout.write(usage());
    return 0;
  }

  const nombre = flagString(flags, "endpoint");
  if (nombre === undefined) {
    process.stderr.write(`Falta --endpoint.\n\n${usage()}`);
    return 2;
  }
  if (!(ENDPOINTS_DINORANK as readonly string[]).includes(nombre)) {
    throw new CliError(
      `Endpoint desconocido: "${nombre}".\n` +
        `  Los cuatro que exige INFRA-02: ${ENDPOINTS_DINORANK.join(", ")}`,
    );
  }
  const endpoint = nombre as EndpointDinorank;

  const parametros = construirParametros(endpoint, flags);
  const pais = String(parametros["country"]);
  const quota = await QuotaBook.open(CACHE_DIR);

  console.log(`Endpoint: ${urlEndpoint(endpoint)}`);
  console.log(`Parametros: ${JSON.stringify(parametros)}`);
  console.log(`Credencial: ${describeSecret(process.env["DINORANK_API_KEY"])}`);
  console.log("");

  const envelope = await consultarDinorank(endpoint, parametros, {
    cacheDir: CACHE_DIR,
    offline: flagBool(flags, "offline"),
    refresh: flagBool(flags, "refresh"),
    quota,
    etiqueta: `dinorank:probe:${endpoint}`,
  });

  console.log(`HTTP ${envelope.httpStatus ?? "?"} — resultado de cache: ${envelope.outcome}`);
  console.log("");

  inventariar(envelope.response);
  if (endpoint === "keyword-research") reportarMetricas(envelope.response);

  const maxItems = flagNumber(flags, "max-items");
  const recortes: Recorte[] = [];
  const saneada = sanear(envelope.response, undefined, "", maxItems, recortes);

  const anonimizar = flagBool(flags, "anonymize");
  const seudonimos = new Seudonimos();
  const respuesta = anonimizar ? seudonimizar(saneada, undefined, seudonimos) : saneada;

  const fixture = {
    _probe: {
      endpoint,
      url: urlEndpoint(endpoint),
      request: parametros,
      fetchedAt: envelope.fetchedAt,
      httpStatus: envelope.httpStatus,
      outcome: envelope.outcome,
      arreglosRecortados: recortes,
      seudonimizada: anonimizar,
      nota:
        "Respuesta real grabada por dino:probe. Las claves de aspecto credencial se reemplazan " +
        "por un marcador y el comando aborta si el valor de la clave aparece en el cuerpo." +
        (anonimizar
          ? " Los dominios, URLs, textos e identificadores estan seudonimizados de forma estable: " +
            "el proyecto sondeado pertenece a otro cliente y de esta respuesta solo se conserva la forma."
          : ""),
    },
    response: respuesta,
  };

  const texto = `${JSON.stringify(fixture, null, 2)}\n`;
  abortarSiFiltraCredencial(texto);

  const destino =
    flagString(flags, "out") ?? path.join(DIR_FIXTURES, `dinorank-${endpoint}-${pais}.json`);
  const rutaFinal = path.isAbsolute(destino) ? destino : path.resolve(SEO_TOOLS_ROOT, destino);

  await mkdir(path.dirname(rutaFinal), { recursive: true });
  await writeFile(rutaFinal, texto, "utf8");

  console.log("");
  console.log(`fixture: ${path.relative(SEO_TOOLS_ROOT, rutaFinal)} (${texto.length} bytes)`);
  for (const recorte of recortes) {
    console.log(`  recortado ${recorte.ruta}: ${recorte.original} -> ${recorte.conservados}`);
  }
  if (anonimizar) console.log(`  seudonimizados ${seudonimos.total()} valores distintos`);
  console.log(`llamadas a DinoRank en esta corrida: ${quota.runCalls("dinorank")}`);
  console.log(`consumo acumulado de DinoRank: ${quota.total("dinorank")}`);

  return 0;
}
