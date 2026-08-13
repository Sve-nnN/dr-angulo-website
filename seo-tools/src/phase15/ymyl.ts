/**
 * La compuerta unica que los cuatro planes de copy de la wave 3 tienen que pasar.
 *
 * POR QUE DEVUELVE EVIDENCIA Y NO UN BOOLEANO. Quien tiene que corregir necesita saber donde.
 * Una compuerta que dice "no pasa" obliga a releer dos mil palabras buscando el problema, y a
 * la tercera vez que pasa eso alguien la desactiva. Cada hallazgo trae la URL, la seccion, la
 * regla y el texto exacto que fallo.
 *
 * POR QUE EXISTE. Sin ella, los planes 15-03 a 15-06 corren en paralelo y cada uno inventa su
 * propio criterio de que cuenta como texto humanizado y que cuenta como afirmacion medica
 * sellada. Cuatro criterios distintos sobre dieciseis paginas de una web medica es exactamente
 * el resultado que la fase entera existe para evitar.
 *
 * LAS REGLAS SE AGRUPAN EN DOS FAMILIAS.
 *
 *   YMYL (D-08, D-10, D-11): toda seccion clinica sellada como pendiente del doctor, toda cifra
 *   con su fuente, prohibicion dura de cifras sobre el propio doctor porque ninguna esta
 *   verificada, y solo las cuatro sedes vigentes.
 *
 *   Humanizacion: salen del skill del humanizador y se aplican SOLO dentro de la region de copy,
 *   la que va entre `<!-- copy:inicio -->` y `<!-- copy:fin -->`. Acotarla no es una concesion:
 *   `url-map.jsonl` trae doce rayas largas en campos de prosa que esta fase no escribio, y una
 *   regla global fallaria por texto heredado. La presion entonces seria aflojar la regla, que es
 *   como se pierden las reglas.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { booleana, ejecutar, parseBanderas, textoObligatorio } from "../phase13/args.js";
import { normalizar } from "./entidades.js";
import type { SeccionDeCopy } from "./model.js";

/**
 * Las marcas que delimitan lo que escribimos nosotros dentro de un paquete.
 *
 * Van escritas literales y no importadas de `paquete.ts` para que este archivo se lea solo: la
 * compuerta declara sobre que region opera sin que haya que abrir el generador. Una prueba ata
 * las dos copias, asi que no pueden divergir en silencio.
 */
export const MARCAS_COPY = {
  inicio: "<!-- copy:inicio -->",
  fin: "<!-- copy:fin -->",
} as const;

/** Desviacion estandar minima del largo de las oraciones, en palabras. */
export const RITMO_MINIMO = 6;

/** Oraciones que hacen falta para que medir el ritmo signifique algo. */
const ORACIONES_PARA_MEDIR_RITMO = 4;

/** Las cuatro sedes vigentes. Montefiori no esta y no vuelve: el doctor ya no atiende ahi. */
export const SEDES_VIGENTES = [
  "consultorio de Surco",
  "Clínica Ricardo Palma",
  "Clínica Sanna La Molina",
  "Clínica Padre Luis Tezza",
] as const;

/** Sedes que aparecen en material viejo y que publicar mandaria pacientes a una puerta cerrada. */
const SEDES_QUE_NO_EXISTEN = ["montefiori"];

const RUTA_TELLS = path.join(SEO_TOOLS_ROOT, "data", "tells-ia.json");
const RUTA_ONPAGE_SERP = path.join(SEO_TOOLS_ROOT, "data", "onpage-serp.json");
const RUTA_COPY = path.join(SEO_TOOLS_ROOT, "data", "copy-guias.json");

export interface Hallazgo {
  readonly url: string;
  /** Clave de la seccion, o `documento` cuando la regla mira la pagina entera. */
  readonly seccion: string;
  readonly regla: string;
  /** El texto exacto que fallo. Sin esto, corregir es buscar a ciegas. */
  readonly texto: string;
  readonly explicacion: string;
}

export interface PaginaParaRevisar {
  readonly url: string;
  readonly minimoDePalabras: number;
  readonly secciones: readonly SeccionDeCopy[];
}

/**
 * Las dos formas que admite el archivo de muletillas: la lista pelada, o el objeto con `tells`.
 *
 * Se narrowea a mano sobre `unknown` en vez de castear la union: `Array.isArray` no descarta un
 * `readonly string[]` de una union, asi que la rama del objeto seguiria viendo tambien el
 * arreglo. Y de paso queda validado el contenido, que es lo que de verdad importa: una entrada
 * que no fuera cadena se caeria en silencio, y un diccionario mas corto es una compuerta que
 * deja pasar lo que tenia que frenar.
 */
function muletillasDelArchivo(archivo: unknown, rutaArchivo: string): readonly string[] {
  const lista: readonly unknown[] = Array.isArray(archivo)
    ? archivo
    : typeof archivo === "object" &&
        archivo !== null &&
        "tells" in archivo &&
        Array.isArray(archivo.tells)
      ? archivo.tells
      : [];

  const cadenas = lista.filter((t): t is string => typeof t === "string");
  if (cadenas.length !== lista.length) {
    throw new CliError(
      `${rutaArchivo} trae ${lista.length - cadenas.length} entrada(s) que no son texto.\n` +
        `  Accion: el diccionario es una lista plana de muletillas escritas sin tildes. Una ` +
        `entrada de otra forma se descartaria sin avisar y la compuerta revisaria de menos.`,
    );
  }
  return cadenas;
}

/** Las muletillas del diccionario, ya normalizadas. Viven en datos para que ampliarlas sea barato. */
export function tellsDeIa(rutaArchivo: string = RUTA_TELLS): string[] {
  let crudo: string;
  try {
    crudo = readFileSync(rutaArchivo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${rutaArchivo}.\n` +
        `  Accion: es el diccionario de muletillas que la compuerta busca. Sin el no revisa nada.`,
    );
  }
  return muletillasDelArchivo(JSON.parse(crudo), rutaArchivo).map((t) => normalizar(t));
}

/**
 * El texto que va entre las dos marcas de copy. `null` si el documento no las trae.
 *
 * Lo de afuera no se mira: es procedencia, justificaciones de la fase 14 y tablas que genera el
 * propio paquete.
 */
export function regionDeCopy(documento: string): string | null {
  const desde = documento.indexOf(MARCAS_COPY.inicio);
  const hasta = documento.indexOf(MARCAS_COPY.fin);
  if (desde === -1 || hasta === -1 || hasta < desde) return null;
  return documento.slice(desde + MARCAS_COPY.inicio.length, hasta);
}

function palabras(texto: string): number {
  return texto
    .trim()
    .split(/\s+/)
    .filter((p) => p !== "").length;
}

function oraciones(texto: string): string[] {
  return texto
    .split(/(?<=[.!?])\s+/)
    .map((o) => o.trim())
    .filter((o) => o !== "");
}

// ---------------------------------------------------------------------------
// Reglas de humanizacion, sobre texto suelto
// ---------------------------------------------------------------------------

const RAYAS_Y_COMILLAS = /[—–“”‘’]/gu;
const EMOJI = /\p{Extended_Pictographic}/gu;

function hallazgosDeEscritura(url: string, seccion: string, texto: string): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];

  for (const encontrado of texto.matchAll(RAYAS_Y_COMILLAS)) {
    hallazgos.push({
      url,
      seccion,
      regla: "raya-o-comilla",
      texto: recorte(texto, encontrado.index),
      explicacion:
        `El caracter "${encontrado[0]}" no se usa en el copy de esta fase. Va coma, punto o ` +
        `comilla recta. Es la marca de puntuacion que mas delata un texto generado.`,
    });
  }

  for (const encontrado of texto.matchAll(EMOJI)) {
    hallazgos.push({
      url,
      seccion,
      regla: "emoji",
      texto: recorte(texto, encontrado.index),
      explicacion: "El copy de una pagina medica no lleva emojis.",
    });
  }

  const normal = normalizar(texto);
  for (const tell of tellsCache()) {
    const posicion = normal.indexOf(tell);
    if (posicion === -1) continue;
    hallazgos.push({
      url,
      seccion,
      regla: "muletilla",
      texto: `${tell}: ${recorte(texto, posicion)}`,
      explicacion:
        `"${tell}" es una muletilla del diccionario de tells. Se reescribe la frase diciendo ` +
        `directamente lo que la muletilla anuncia.`,
    });
  }

  return hallazgos;
}

let cacheDeTells: string[] | null = null;
function tellsCache(): string[] {
  cacheDeTells ??= tellsDeIa();
  return cacheDeTells;
}

/** Un pedazo del texto alrededor de la posicion que fallo, para que se vea el contexto. */
function recorte(texto: string, posicion: number): string {
  const desde = Math.max(0, posicion - 40);
  return texto.slice(desde, Math.min(texto.length, posicion + 40)).replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Reglas de YMYL
// ---------------------------------------------------------------------------

/** Cantidades escritas con digitos o con palabras. El copy de esta fase usa palabras (D-11). */
const CANTIDAD =
  "(?:\\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|treinta|cuarenta|cincuenta|cien|ciento|cientos|mil|miles|decenas|centenares|numerosos|numerosas|multiples|innumerables)";

/**
 * Cifras sobre el propio doctor. Ninguna esta verificada y ninguna se publica.
 *
 * Cada patron pide la cantidad Y el sustantivo, no uno de los dos: "un paciente con hernia
 * discal" es una frase normal de copy clinico y no una credencial. Lo que no se publica es
 * "dos mil cirugias" o "veinte anos de experiencia".
 */
const CIFRAS_DEL_DOCTOR: readonly { readonly patron: RegExp; readonly que: string }[] = [
  {
    patron: new RegExp(
      `\\b(?:mas de |cerca de |alrededor de )?${CANTIDAD}\\b[^.]{0,30}\\b(?:cirugias|operaciones|intervenciones|procedimientos)\\b`,
      "u",
    ),
    que: "una cantidad de cirugias, operaciones o intervenciones",
  },
  {
    patron: new RegExp(`\\b${CANTIDAD}\\b[^.]{0,20}\\banos\\b[^.]{0,20}\\b(?:experiencia|ejercicio|trayectoria|ejerciendo|carrera)\\b`, "u"),
    que: "los anos de experiencia del doctor",
  },
  { patron: /\banos de experiencia\b/u, que: "los anos de experiencia del doctor" },
  {
    patron: /\b(?:tasa|porcentaje|indice|nivel|grado)\s+de\s+exito\b/u,
    que: "una tasa de exito",
  },
  { patron: /\bexito del\s+\d/u, que: "un porcentaje de exito" },
  {
    patron: new RegExp(`\\b${CANTIDAD}\\b[^.]{0,25}\\bpacientes\\b`, "u"),
    que: "una cantidad de pacientes",
  },
  {
    patron: /\bpacientes\s+(?:atendidos|operados|tratados|satisfechos)\b/u,
    que: "una cantidad de pacientes atendidos",
  },
];

function hallazgosDeCifrasDelDoctor(url: string, seccion: string, texto: string): Hallazgo[] {
  const normal = normalizar(texto);
  const hallazgos: Hallazgo[] = [];
  for (const regla of CIFRAS_DEL_DOCTOR) {
    const encontrado = regla.patron.exec(normal);
    if (encontrado === null) continue;
    hallazgos.push({
      url,
      seccion,
      regla: "cifra-del-doctor",
      texto: encontrado[0],
      explicacion:
        `El texto declara ${regla.que}, y ninguna de esas cifras esta verificada. La fuente no ` +
        `levanta esta regla: la levanta el doctor confirmando el dato por escrito (D-10). Ante ` +
        `la duda entre una frase con mas fuerza comercial y una verificable, va la verificable.`,
    });
  }
  return hallazgos;
}

function hallazgosDeSedes(url: string, seccion: string, texto: string): Hallazgo[] {
  const normal = normalizar(texto);
  return SEDES_QUE_NO_EXISTEN.filter((sede) => normal.includes(sede)).map((sede) => ({
    url,
    seccion,
    regla: "sede-que-no-existe",
    texto: recorte(texto, normal.indexOf(sede)),
    explicacion:
      `El doctor ya no atiende en ${sede}. Las sedes vigentes son ${SEDES_VIGENTES.join(", ")}. ` +
      `Publicar una sede cerrada manda a un paciente a una puerta que no abre.`,
  }));
}

// ---------------------------------------------------------------------------
// La compuerta
// ---------------------------------------------------------------------------

/** Un encabezado de cuatro palabras o mas con todas las palabras largas en mayuscula inicial. */
function esMayusculaDeTitulo(titulo: string): boolean {
  const limpio = titulo.replace(/[¿?¡!:,.]/g, " ").trim();
  const partes = limpio.split(/\s+/).filter((p) => p !== "");
  if (partes.length < 4) return false;
  const largas = partes.filter((p) => p.length >= 4);
  if (largas.length < 2) return false;
  return largas.every((p) => p[0] === (p[0] as string).toUpperCase());
}

/**
 * Corre las dos familias de reglas sobre una pagina de copy y devuelve los hallazgos.
 *
 * Corre TODAS las reglas siempre y no corta en la primera: quien corrige prefiere una lista
 * completa a seis vueltas de una en una.
 */
export function revisar(pagina: PaginaParaRevisar): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];

  for (const seccion of pagina.secciones) {
    if (seccion.tipo === "clinico" && seccion.aprobacion !== "pendiente-doctor") {
      hallazgos.push({
        url: pagina.url,
        seccion: seccion.clave,
        regla: "sello-clinico",
        texto: `${seccion.titulo} (aprobacion: ${seccion.aprobacion})`,
        explicacion:
          "Toda seccion clinica sale de esta fase sellada como pendiente-doctor (D-08). Ese " +
          "sello no lo levanta este workstream: lo levanta el doctor por escrito.",
      });
    }

    for (const afirmacion of seccion.afirmaciones) {
      if (/\d/.test(afirmacion.texto) && afirmacion.fuente.trim() === "") {
        hallazgos.push({
          url: pagina.url,
          seccion: seccion.clave,
          regla: "cifra-sin-fuente",
          texto: afirmacion.texto,
          explicacion:
            "Una afirmacion con cifra declara de donde salio (D-10). Una cifra sin fuente es " +
            "exactamente el dato que despues nadie puede desmentir.",
        });
      }
      hallazgos.push(...hallazgosDeCifrasDelDoctor(pagina.url, seccion.clave, afirmacion.texto));
    }

    if (esMayusculaDeTitulo(seccion.titulo)) {
      hallazgos.push({
        url: pagina.url,
        seccion: seccion.clave,
        regla: "titulo-en-mayusculas",
        texto: seccion.titulo,
        explicacion:
          "En espanol un encabezado lleva mayuscula solo en la primera palabra y en los nombres " +
          "propios. Capitalizar todas es una costumbre del ingles y una firma de texto generado.",
      });
    }

    const textos = [seccion.titulo, ...seccion.parrafos];
    for (const texto of textos) {
      hallazgos.push(...hallazgosDeEscritura(pagina.url, seccion.clave, texto));
      hallazgos.push(...hallazgosDeSedes(pagina.url, seccion.clave, texto));
      hallazgos.push(...hallazgosDeCifrasDelDoctor(pagina.url, seccion.clave, texto));
    }
  }

  const cuerpo = pagina.secciones.flatMap((s) => s.parrafos).join(" ");
  const escritas = palabras(cuerpo);
  if (escritas < pagina.minimoDePalabras) {
    hallazgos.push({
      url: pagina.url,
      seccion: "documento",
      regla: "extension",
      texto: `${escritas} palabras contra un minimo de ${pagina.minimoDePalabras}`,
      explicacion:
        "El minimo sale de la mediana del top 10 que ya posiciona para esa keyword. Entregar " +
        "por debajo es entregar una pagina que no compite con las que ya estan.",
    });
  }

  const largos = oraciones(cuerpo).map((o) => palabras(o));
  if (largos.length >= ORACIONES_PARA_MEDIR_RITMO) {
    const media = largos.reduce((a, b) => a + b, 0) / largos.length;
    const desviacion = Math.sqrt(
      largos.reduce((a, b) => a + (b - media) ** 2, 0) / largos.length,
    );
    if (desviacion < RITMO_MINIMO) {
      hallazgos.push({
        url: pagina.url,
        seccion: "documento",
        regla: "ritmo",
        texto: `desviacion de ${desviacion.toFixed(2)} palabras sobre ${largos.length} oraciones`,
        explicacion:
          `Todas las oraciones del mismo largo es la firma mas visible de un texto generado, y ` +
          `la que ningun diccionario de muletillas caza. Se pide al menos ${RITMO_MINIMO} de ` +
          `desviacion: frases cortas mezcladas con frases que se toman su tiempo.`,
      });
    }
  }

  return hallazgos;
}

/** Las reglas de escritura sobre la region de copy de un paquete ya renderizado. */
export function revisarDocumento(url: string, documento: string): Hallazgo[] {
  const region = regionDeCopy(documento);
  if (region === null) {
    return [
      {
        url,
        seccion: "documento",
        regla: "region-ausente",
        texto: `faltan ${MARCAS_COPY.inicio} o ${MARCAS_COPY.fin}`,
        explicacion:
          "Sin las dos marcas no hay forma de saber que parte del documento escribimos nosotros " +
          "y que parte es prosa heredada, asi que la compuerta no puede revisar nada.",
      },
    ];
  }
  return [
    ...hallazgosDeEscritura(url, "region-de-copy", region),
    ...hallazgosDeSedes(url, "region-de-copy", region),
    ...hallazgosDeCifrasDelDoctor(url, "region-de-copy", region),
  ];
}

interface PaginaDeCopy {
  readonly url: string;
  readonly secciones: readonly SeccionDeCopy[];
}

/** Las paginas de `data/copy-guias.json` con el minimo de palabras que le toca a cada URL. */
export function paginasParaRevisar(rutaArchivo: string = RUTA_COPY): PaginaParaRevisar[] {
  const crudo = JSON.parse(readFileSync(rutaArchivo, "utf8")) as {
    readonly paginas?: readonly PaginaDeCopy[];
  };
  const paginas: readonly PaginaDeCopy[] = Array.isArray(crudo) ? crudo : (crudo.paginas ?? []);

  const serp = JSON.parse(readFileSync(RUTA_ONPAGE_SERP, "utf8")) as {
    readonly urls: readonly { readonly url: string; readonly minimoDePalabras: number }[];
  };
  const minimos = new Map(serp.urls.map((u) => [u.url, u.minimoDePalabras]));

  return paginas.map((p) => ({
    url: p.url,
    minimoDePalabras: minimos.get(p.url) ?? 0,
    secciones: p.secciones,
  }));
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase15/ymyl.ts --data data/copy-guias.json
//
// Sale con codigo distinto de cero si hay un solo hallazgo. COSTE DE CUOTA: CERO.

/**
 * Los cuatro datasets de copy de la fase.
 *
 * Van escritos aca y no importados de `paquete.ts` por el mismo motivo que las marcas de copy:
 * la compuerta declara sobre que corre sin que haya que abrir el generador. Una prueba ata las
 * dos listas para que no puedan divergir en silencio.
 */
const TODOS_LOS_DATASETS = [
  "data/copy-guias.json",
  "data/copy-servicios.json",
  "data/copy-sedes.json",
  "data/copy-blog.json",
] as const;

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  // `--todos` corre la compuerta sobre las 16 paginas a la vez, que es como se comprueba al
  // cerrar la fase. Con un dataset por corrida, una regla que solo falla al cruzar dos familias
  // no se vería nunca.
  const rutas = booleana(banderas, "todos")
    ? TODOS_LOS_DATASETS.map((r) => path.join(SEO_TOOLS_ROOT, r))
    : [
        (() => {
          const origen = textoObligatorio(banderas, "data");
          return path.isAbsolute(origen) ? origen : path.join(SEO_TOOLS_ROOT, origen);
        })(),
      ];

  const paginas = rutas.flatMap((ruta) => paginasParaRevisar(ruta));
  const out = process.stdout;
  let total = 0;

  for (const pagina of paginas) {
    const hallazgos = revisar(pagina);
    total += hallazgos.length;
    out.write(`${pagina.url}: ${hallazgos.length} hallazgo(s)\n`);
    for (const hallazgo of hallazgos) {
      out.write(`  [${hallazgo.regla}] ${hallazgo.seccion}\n`);
      out.write(`    ${hallazgo.texto}\n`);
      out.write(`    ${hallazgo.explicacion}\n`);
    }
  }

  out.write(`\n${paginas.length} pagina(s) revisada(s), ${total} hallazgo(s)\n`);
  return total === 0 ? 0 : 1;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("ymyl.ts")) {
  ejecutar(main);
}
