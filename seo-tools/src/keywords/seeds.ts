/**
 * Extraccion de semillas del negocio a un snapshot commiteado.
 *
 * ESTE ES EL UNICO ARCHIVO DEL TOOLING QUE MIRA LA APLICACION, y lo hace una sola vez, por
 * texto plano. Los demas subcomandos leen `data/seeds.json` y no vuelven a mirar el
 * repositorio de la aplicacion nunca mas.
 *
 * Por que se lee como TEXTO y no se importa el modulo. Dos razones, las dos medidas:
 *
 *   1. Los archivos de contenido usan el alias `@/content/...`, que solo resuelve dentro del
 *      build de la aplicacion. Un import desde este paquete moriria en el resolver.
 *   2. El workstream milestone edita esos archivos en paralelo. Si manana alguno importa un
 *      componente de framework, el tooling de v1.2 dejaria de arrancar en medio de la fase 14
 *      por un cambio que nada tiene que ver con el. Leer texto no puede romperse asi.
 *
 * Regenerar el snapshot es una decision explicita (`kw:seeds`), nunca un efecto colateral de
 * otra corrida.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CliError, REPO_ROOT, SEO_TOOLS_ROOT } from "../config.js";
import { normalizeKeyword } from "./normalize.js";

// --- Contrato del snapshot ---

export type TipoSemilla =
  | "condicion"
  | "procedimiento"
  | "especialidad"
  | "sede"
  | "sintoma"
  | "pregunta";

/** Rango de valor de negocio. Es el orden de gasto: si el tope corta, corta por el 4. */
export type RangoSemilla = 1 | 2 | 3 | 4;

export interface Semilla {
  /** Texto visible, con sus tildes. Es lo que se consulta y lo que se escribe en el Sheet. */
  keyword: string;
  /** Forma normalizada. Solo para deduplicar y como clave de idempotencia. */
  keywordKey: string;
  tipo: TipoSemilla;
  /** De donde salio: archivo y campo. La fase 13 lo necesita para saber si un cluster nace
   *  del contenido propio o del hueco de la competencia. */
  procedencia: string;
  rango: RangoSemilla;
}

export interface SnapshotSemillas {
  schema: 1;
  /** La propiedad se llama `seeds` en ingles a proposito: es la que leen los criterios de
   *  aceptacion del plan y los subcomandos de los planes 04 y 05. */
  seeds: Semilla[];
}

/** Los siete textos crudos que alimentan la extraccion. */
export interface ContenidoCrudo {
  services: string;
  servicePages: string;
  locations: string;
  blog: string;
  faq: string;
  cv: string;
  competencia: string;
}

export const RUTA_SNAPSHOT = path.join(SEO_TOOLS_ROOT, "data", "seeds.json");

/**
 * Rutas de la aplicacion, escritas con la barra literal a proposito: el criterio de
 * aceptacion del plan cuenta cuantos archivos del tooling nombran "src/content" y exige
 * exactamente uno. Construirlas con path.join por segmentos escondería la dependencia.
 */
const ARCHIVOS_CONTENIDO: Record<keyof Omit<ContenidoCrudo, "competencia">, string> = {
  services: "src/content/services.ts",
  servicePages: "src/content/service-pages.ts",
  locations: "src/content/locations.ts",
  blog: "src/content/blog.ts",
  faq: "src/content/faq.ts",
  cv: "src/content/cv.ts",
};

const ARCHIVO_COMPETENCIA = ".planning/research/COMPETITORS.md";

// --- Vocabulario del dominio ---

/**
 * Raices del dominio medico y de especialidad, ya sin tildes porque se comparan contra texto
 * normalizado. Se usan en dos lugares: para decidir si un nucleo extraido de una pregunta
 * vale la pena, y como filtro de relevancia del universo candidato (modulo expand).
 */
export const TERMINOS_DOMINIO: readonly string[] = [
  // columna y estructuras
  "columna", "vertebral", "vertebra", "espalda", "lumbar", "lumbalgia", "cervical",
  "cervicalgia", "dorsal", "sacro", "coxis", "medula", "nervio", "canal", "disco", "discal",
  "discopatia", "hernia", "estenosis", "espinal", "escoliosis", "cifosis", "lordosis",
  "deformidad", "deformidades", "ciatica", "ciatico", "espondil",
  // huesos y articulaciones
  "artrodesis", "artrosis", "artritis", "osteoporosis", "osteo", "fractura", "fracturas",
  "rodilla", "cadera", "hombro", "codo", "muneca", "tobillo", "menisco", "ligamento",
  "tendinitis", "tendon", "desgarro", "muscular", "displasia", "luxacion", "esguince",
  // especialidad y procedimiento
  "traumatolog", "ortoped", "neurociruj", "neurocirug", "cirug", "cirujano", "operacion",
  "operar", "operarse", "operarme", "operarte", "postoperatorio", "protesis", "percutan",
  "endoscop", "invasiv", "artroscop", "monitorizacion", "neurofisiolog", "fijacion",
  "descompresion", "laminectomia", "discectomia", "infiltracion", "tumor", "tumores",
  // sintomas y estudios
  "dolor", "sintoma", "hormigueo", "adormecimiento", "rigidez", "contractura", "molestia",
  "marcha", "postura", "recuperacion", "rehabilitacion", "fisioterapia", "terapia",
  "radiografia", "resonancia", "tomografia", "densitometria",
  // publico
  "infantil", "pediatric", "nino", "adolescente",
];

/** Las raices que marcan que una semilla habla de lo que el paciente SIENTE, no de un nombre
 *  de diagnostico. Sirve para separar el tipo `sintoma` del tipo `pregunta`. */
const RAICES_SINTOMA: readonly string[] = [
  "dolor", "sintoma", "hormigueo", "adormecimiento", "rigidez", "contractura", "molestia",
  "marcha", "postura",
];

/** Raices que marcan que una semilla nombra a QUIEN atiende y no a QUE se atiende. */
const RAICES_ESPECIALIDAD: readonly string[] = [
  "traumatolog", "ortoped", "neurociruj", "neurocirug", "cirujano", "especialista", "medico",
  "doctor",
];

/** Raices que marcan que una semilla habla de un procedimiento y no de una condicion. */
const RAICES_PROCEDIMIENTO: readonly string[] = [
  "cirug", "operacion", "artrodesis", "fijacion", "percutan", "endoscop", "invasiv",
  "artroscop", "monitorizacion", "protesis", "descompresion", "laminectomia", "discectomia",
  "infiltracion", "procedimiento", "abordaje", "correccion", "reconstruccion", "revision",
];

export const contieneTerminoDominio = (clave: string): boolean =>
  TERMINOS_DOMINIO.some((raiz) => clave.includes(raiz));

const contieneAlguna = (clave: string, raices: readonly string[]): boolean =>
  raices.some((raiz) => clave.includes(raiz));

// --- Lectura de los archivos fuente ---

async function leerArchivo(relativo: string): Promise<string> {
  try {
    return await readFile(path.join(REPO_ROOT, relativo), "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${relativo} desde la raiz del repositorio (${REPO_ROOT}).\n` +
        `  La extraccion de semillas es lectura pura: no crea ni modifica nada bajo src/.\n` +
        `  Accion: verificar que el archivo siga existiendo con ese nombre. Si el workstream ` +
        `milestone lo renombro, actualizar la tabla de rutas de src/keywords/seeds.ts.`,
    );
  }
}

/** Lee de una sola vez los siete textos que alimentan la extraccion. */
export async function leerContenido(): Promise<ContenidoCrudo> {
  const [services, servicePages, locations, blog, faq, cv, competencia] = await Promise.all([
    leerArchivo(ARCHIVOS_CONTENIDO.services),
    leerArchivo(ARCHIVOS_CONTENIDO.servicePages),
    leerArchivo(ARCHIVOS_CONTENIDO.locations),
    leerArchivo(ARCHIVOS_CONTENIDO.blog),
    leerArchivo(ARCHIVOS_CONTENIDO.faq),
    leerArchivo(ARCHIVOS_CONTENIDO.cv),
    leerArchivo(ARCHIVO_COMPETENCIA),
  ]);

  return { services, servicePages, locations, blog, faq, cv, competencia };
}

// --- Extraccion de cadenas del texto fuente ---

const desescapar = (crudo: string): string => crudo.replace(/\\(["'\\])/g, "$1");

/**
 * Todas las cadenas entrecomilladas que viven dentro de los arreglos declarados como
 * `clave: [ ... ]`. Se recorre contando corchetes en vez de usar una expresion regular
 * glotona, que se comeria hasta el ultimo `]` del archivo.
 */
export function extraerArreglos(fuente: string, clave: string): string[] {
  const salida: string[] = [];
  const apertura = new RegExp(`\\b${clave}\\s*:\\s*\\[`, "g");

  let match: RegExpExecArray | null;
  while ((match = apertura.exec(fuente)) !== null) {
    let profundidad = 1;
    let i = match.index + match[0].length;

    while (i < fuente.length && profundidad > 0) {
      const c = fuente[i] as string;

      if (c === "[") profundidad += 1;
      else if (c === "]") profundidad -= 1;
      else if (c === '"' || c === "'") {
        const comilla = c;
        let j = i + 1;
        let texto = "";
        while (j < fuente.length && fuente[j] !== comilla) {
          if (fuente[j] === "\\") {
            texto += fuente[j];
            j += 1;
          }
          texto += fuente[j];
          j += 1;
        }
        salida.push(desescapar(texto));
        i = j;
      }

      i += 1;
    }
  }

  return salida;
}

/**
 * Valores de `clave: "..."` con una sangria EXACTA. La sangria es lo que distingue el campo
 * de nivel superior del mismo nombre anidado mas adentro: en locations.ts hay `name` de sede
 * con cuatro espacios y `label` de canal con seis.
 */
export function extraerCampo(fuente: string, clave: string, sangria = 4): string[] {
  const patron = new RegExp(`^ {${sangria}}${clave}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "gm");
  const salida: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = patron.exec(fuente)) !== null) {
    salida.push(desescapar(match[1] as string));
  }

  return salida;
}

// --- Reduccion de titulares y preguntas a su termino nuclear ---

/**
 * Palabras que unen un termino compuesto pero no lo encabezan: se recortan en los bordes y se
 * conservan en el medio. "por un dolor de espalda" cae en "dolor de espalda".
 */
const CONECTORES = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas", "al", "a", "en", "con",
  "para", "por", "mi", "tu", "su", "lo", "le", "se",
]);

/**
 * Palabras funcionales que CORTAN la corrida. Estan explicitas y no derivadas de una
 * heuristica de longitud porque "significa", "necesito" o "siempre" son largas y aun asi no
 * forman parte de ningun termino de busqueda.
 */
const CORTES = new Set([
  "que", "cuando", "como", "cual", "cuales", "cuanto", "cuanta", "cuantos", "cuantas", "donde",
  "quien", "quienes", "porque", "y", "o", "u", "si", "no", "es", "son", "ser", "esta", "estan",
  "estar", "fue", "sera", "hay", "hace", "hacer", "debo", "debe", "deben", "debes", "tengo",
  "tienes", "tiene", "tienen", "puedo", "puede", "pueden", "siempre", "nunca", "tan", "muy",
  "mas", "menos", "mismo", "misma", "primera", "primer", "despues", "antes", "ya", "todavia",
  "tambien", "solo", "sobre", "entre", "desde", "hasta", "durante", "significa", "necesito",
  "necesita", "saber", "ignorar", "cosas", "cosa", "diferencio", "diferenciar",
  "diferenciarlos", "atienden", "atiende", "agendo", "agendar", "llevar", "preocuparme",
  "parece", "volver", "trabajar", "tardar", "tiempo", "consulta", "cita", "citas", "aparece",
  "edad", "vez", "veces", "caso", "casos", "forma", "manera", "todo", "toda", "todos", "todas",
  "otro", "otra", "otros", "otras", "este", "esta", "esto", "eso", "ese", "esa",
]);

interface Token {
  visible: string;
  clave: string;
}

type ClaseToken = "contenido" | "conector" | "corte";

function clasificar(token: Token): ClaseToken {
  if (token.clave === "" || /^\d+$/.test(token.clave)) return "corte";
  if (CONECTORES.has(token.clave)) return "conector";
  if (CORTES.has(token.clave)) return "corte";
  return "contenido";
}

/** Numero maximo de palabras de un nucleo. Mas largo que esto ya no es un termino de
 *  busqueda, es una frase, y solo ensucia la permutacion. */
const MAX_PALABRAS_NUCLEO = 6;

/**
 * Minimo de palabras de un nucleo. Un titular o una pregunta que solo aporta una palabra
 * suelta ("¿Atienden a niños?" deja "niños") no aporta una semilla: o el termino ya existe
 * como semilla estructurada del catalogo, o es demasiado generico para el negocio. Las
 * semillas de una sola palabra que si valen (escoliosis, cifosis, artrosis) salen de las
 * fuentes estructuradas, que no pasan por esta reduccion.
 */
const MIN_PALABRAS_NUCLEO = 2;

/**
 * Reduce un titular de blog o una pregunta frecuente a su termino nuclear.
 *
 * Estrategia, en tres pasos: cortar por los dos puntos y por el cierre de interrogacion,
 * porque en espanol el titular pone el termino delante; trocear por puntuacion dura; y dentro
 * de cada trozo quedarse con la corrida de palabras de contenido que mas terminos del dominio
 * concentre. Devuelve null cuando no hay ningun termino del dominio: una pregunta de logistica
 * como "¿Como agendo una cita?" no aporta semilla.
 */
export function reducirANucleo(texto: string): string | null {
  let base = texto;

  const dosPuntos = base.indexOf(":");
  if (dosPuntos > 0) base = base.slice(0, dosPuntos);

  const cierre = base.indexOf("?");
  if (cierre > 0) base = base.slice(0, cierre);

  const segmentos = base.split(/[¿?¡!,;.—–()]+/);

  let mejor: { texto: string; puntaje: number } | null = null;

  for (const segmento of segmentos) {
    const tokens: Token[] = segmento
      .split(/\s+/)
      .map((v) => ({ visible: v.trim(), clave: normalizeKeyword(v) }))
      .filter((t) => t.visible !== "");

    let corrida: Token[] = [];

    const cerrar = (): void => {
      // Los conectores no encabezan ni cierran un termino.
      while (corrida.length > 0 && clasificar(corrida[0] as Token) === "conector") corrida.shift();
      while (corrida.length > 0 && clasificar(corrida[corrida.length - 1] as Token) === "conector") {
        corrida.pop();
      }

      if (corrida.length >= MIN_PALABRAS_NUCLEO && corrida.length <= MAX_PALABRAS_NUCLEO) {
        const conDominio = corrida.filter((t) => contieneTerminoDominio(t.clave)).length;
        if (conDominio > 0) {
          const puntaje = conDominio * 10 + corrida.length;
          if (mejor === null || puntaje > mejor.puntaje) {
            mejor = { texto: corrida.map((t) => t.visible).join(" "), puntaje };
          }
        }
      }

      corrida = [];
    };

    for (const token of tokens) {
      if (clasificar(token) === "corte") cerrar();
      else corrida.push(token);
    }
    cerrar();
  }

  return mejor === null ? null : (mejor as { texto: string }).texto;
}

// --- Limpieza y construccion del snapshot ---

/** Quita parentesis explicativos, comillas sueltas y puntuacion de borde. Conserva tildes. */
export function limpiarSemilla(texto: string): string {
  return texto
    .replace(/\([^)]*\)/g, " ")
    .replace(/["“”«»]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:.-]+|[\s,;:.-]+$/g, "")
    .trim();
}

const PREFIJOS_CARGO: readonly string[] = [
  "especializacion en",
  "residencia de postgrado en",
  "residencia en",
  "diplomado en",
  "jefe de medicos residentes de",
  "medico residente asistencial de",
  "medico residente de",
];

/** Recorta el cargo administrativo y deja la especialidad: "Especialización en Cirugía de
 *  Columna" queda en "Cirugía de Columna". Se corta por conteo de palabras para no perder las
 *  tildes del texto visible. */
function quitarPrefijoCargo(texto: string): string {
  const clave = normalizeKeyword(texto);
  for (const prefijo of PREFIJOS_CARGO) {
    if (clave.startsWith(`${prefijo} `)) {
      return texto.trim().split(/\s+/).slice(prefijo.split(" ").length).join(" ");
    }
  }
  return texto;
}

interface Bruta {
  keyword: string;
  tipo: TipoSemilla;
  procedencia: string;
}

/** Los terminos de servicio y tecnica que la competencia declara en su ficha. */
function semillasDeCompetencia(markdown: string): Bruta[] {
  const salida: Bruta[] = [];

  const agregar = (crudo: string, procedencia: string): void => {
    let item = limpiarSemilla(crudo.replace(/^t[eé]cnicas:\s*/i, ""));
    if (item === "") return;

    const palabras = item.split(/\s+/);
    if (item.includes("/")) {
      // "escoliosis/cifosis" son dos terminos; "abordaje anterior/lateral mínimamente
      // invasivo" es una frase comprimida que no se puede partir sin inventar. Se descarta.
      if (palabras.length > 1) return;
      for (const parte of item.split("/")) agregar(parte, procedencia);
      return;
    }

    if (palabras.length > 4) return;
    if (!contieneTerminoDominio(normalizeKeyword(item))) return;

    const clave = normalizeKeyword(item);
    const tipo: TipoSemilla = contieneAlguna(clave, RAICES_ESPECIALIDAD)
      ? "especialidad"
      : contieneAlguna(clave, RAICES_PROCEDIMIENTO)
        ? "procedimiento"
        : "condicion";
    salida.push({ keyword: item, tipo, procedencia });
    item = "";
  };

  for (const linea of markdown.split("\n")) {
    const servicios = /^-\s*Servicios:\s*(.+)$/.exec(linea);
    if (servicios !== null) {
      for (const trozo of (servicios[1] as string).split(/[;,]/)) {
        agregar(trozo, "COMPETITORS.md:Servicios");
      }
      continue;
    }

    const encabezado = /^##\s+.*\(([^)]+)\)/.exec(linea);
    if (encabezado !== null) {
      for (const trozo of (encabezado[1] as string).split(",")) {
        agregar(trozo, "COMPETITORS.md:perfil");
      }
    }
  }

  return salida;
}

/**
 * Construye el snapshot completo. Funcion pura: recibe los textos y devuelve las semillas.
 * Es lo que permite probarla sobre fragmentos en memoria mientras el otro workstream edita
 * los archivos de verdad.
 */
export function construirSemillas(contenido: ContenidoCrudo): SnapshotSemillas {
  const brutas: Bruta[] = [];

  // 1. Servicios: las categorias son especialidad, sus condiciones son condicion.
  const corte = contenido.services.indexOf("procedureApproaches");
  const bloqueCategorias = corte === -1 ? contenido.services : contenido.services.slice(0, corte);
  const bloqueAbordajes = corte === -1 ? "" : contenido.services.slice(corte);

  for (const nombre of extraerCampo(bloqueCategorias, "name")) {
    brutas.push({ keyword: nombre, tipo: "especialidad", procedencia: "services.ts:serviceCategories[].name" });
  }
  for (const condicion of extraerArreglos(contenido.services, "conditions")) {
    brutas.push({ keyword: condicion, tipo: "condicion", procedencia: "services.ts:serviceCategories[].conditions" });
  }
  for (const nombre of extraerCampo(bloqueAbordajes, "name")) {
    brutas.push({ keyword: nombre, tipo: "procedimiento", procedencia: "services.ts:procedureApproaches[].name" });
  }
  for (const ejemplo of extraerArreglos(contenido.services, "examples")) {
    brutas.push({ keyword: ejemplo, tipo: "procedimiento", procedencia: "services.ts:procedureApproaches[].examples" });
  }

  // 2. Paginas de servicio: los cuatro H1 son las condiciones que v1.1 publica. De aca sale
  //    el rango 1, leido del contenido y no escrito a mano en este archivo.
  const publicadas = extraerCampo(contenido.servicePages, "h1").map((h) => limpiarSemilla(h));
  for (const h1 of publicadas) {
    brutas.push({ keyword: h1, tipo: "condicion", procedencia: "service-pages.ts:h1" });
  }

  // 3. Sedes: los cuatro nombres son el rango 2; distrito y region son cola larga geografica.
  const sedes = extraerCampo(contenido.locations, "name").map((n) => limpiarSemilla(n.replace(", sede ", " ")));
  for (const sede of sedes) {
    brutas.push({ keyword: sede, tipo: "sede", procedencia: "locations.ts:name" });
  }
  for (const distrito of extraerCampo(contenido.locations, "addressLocality")) {
    brutas.push({ keyword: distrito, tipo: "sede", procedencia: "locations.ts:addressLocality" });
  }
  for (const region of extraerCampo(contenido.locations, "addressRegion")) {
    brutas.push({ keyword: region, tipo: "sede", procedencia: "locations.ts:addressRegion" });
  }

  // 4. CV: formacion y experiencia. Los cursos y congresos quedan fuera a proposito, son
  //    nombres de marca de fabricante y no terminos que busque un paciente.
  const finFormacion = contenido.cv.indexOf("export const training");
  const bloqueCv = finFormacion === -1 ? contenido.cv : contenido.cv.slice(0, finFormacion);
  for (const titulo of extraerCampo(bloqueCv, "title")) {
    for (const parte of titulo.split(/\s+y\s+/)) {
      const especialidad = limpiarSemilla(quitarPrefijoCargo(parte));
      if (especialidad === "") continue;
      if (!contieneTerminoDominio(normalizeKeyword(especialidad))) continue;
      brutas.push({ keyword: especialidad, tipo: "especialidad", procedencia: "cv.ts:education/experience" });
    }
  }

  // 5. Blog y preguntas frecuentes, reducidos a su termino nuclear.
  const desdeTexto = (textos: string[], procedencia: string): void => {
    for (const texto of textos) {
      const nucleo = reducirANucleo(texto);
      if (nucleo === null) continue;
      const limpio = limpiarSemilla(nucleo);
      if (limpio === "") continue;
      const tipo: TipoSemilla = contieneAlguna(normalizeKeyword(limpio), RAICES_SINTOMA)
        ? "sintoma"
        : "pregunta";
      brutas.push({ keyword: limpio, tipo, procedencia });
    }
  };

  desdeTexto(extraerCampo(contenido.blog, "title"), "blog.ts:title");
  desdeTexto(extraerCampo(contenido.faq, "question"), "faq.ts:question");

  // 6. Competencia.
  brutas.push(...semillasDeCompetencia(contenido.competencia));

  // --- Deduplicacion por clave normalizada: gana la primera aparicion ---

  const clavesRango1 = new Set(publicadas.map((h) => normalizeKeyword(h)));
  const clavesRango2 = new Set(sedes.map((s) => normalizeKeyword(s)));

  const porClave = new Map<string, Semilla>();

  for (const bruta of brutas) {
    const visible = limpiarSemilla(bruta.keyword);
    if (visible === "") continue;

    const clave = normalizeKeyword(visible);
    if (clave === "") continue;
    if (porClave.has(clave)) continue;

    const rango: RangoSemilla = clavesRango1.has(clave)
      ? 1
      : clavesRango2.has(clave)
        ? 2
        : bruta.tipo === "especialidad" || bruta.tipo === "procedimiento"
          ? 3
          : 4;

    porClave.set(clave, {
      keyword: visible,
      keywordKey: clave,
      tipo: bruta.tipo,
      procedencia: bruta.procedencia,
      rango,
    });
  }

  // --- Orden de salida = orden de gasto: rango ascendente, y dentro del rango alfabetico ---

  const seeds = [...porClave.values()].sort((a, b) =>
    a.rango !== b.rango ? a.rango - b.rango : a.keywordKey < b.keywordKey ? -1 : a.keywordKey > b.keywordKey ? 1 : 0,
  );

  return { schema: 1, seeds };
}

// --- Persistencia ---

/** Serializacion estable: sin marca de tiempo, con salto final, para que el diff de git
 *  solo muestre lo que cambio de verdad. */
export const serializarSnapshot = (snapshot: SnapshotSemillas): string =>
  `${JSON.stringify(snapshot, null, 2)}\n`;

/**
 * Lee el snapshot commiteado. Es la unica puerta que usan los demas subcomandos: ninguno
 * vuelve a mirar la aplicacion.
 */
export async function cargarSnapshot(ruta: string = RUTA_SNAPSHOT): Promise<SnapshotSemillas> {
  let crudo: string;
  try {
    crudo = await readFile(ruta, "utf8");
  } catch {
    throw new CliError(
      `No existe el snapshot de semillas en ${ruta}.\n` +
        `  Accion: generarlo con: npm run cli -- kw:seeds`,
    );
  }

  let datos: unknown;
  try {
    datos = JSON.parse(crudo);
  } catch (error) {
    throw new CliError(
      `El snapshot ${ruta} no es JSON valido.\n` +
        `  Detalle: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const seeds = (datos as Partial<SnapshotSemillas>)?.seeds;
  if (!Array.isArray(seeds) || seeds.length === 0) {
    throw new CliError(
      `El snapshot ${ruta} no declara un arreglo "seeds" con contenido.\n` +
        `  Accion: regenerarlo con: npm run cli -- kw:seeds`,
    );
  }

  return { schema: 1, seeds: seeds as Semilla[] };
}
