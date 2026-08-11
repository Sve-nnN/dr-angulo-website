/**
 * Inventario de URLs del sitio, MEDIDO DEL CODIGO.
 *
 * REGLA QUE GOBIERNA TODO ESTE ARCHIVO: `src/` de la aplicacion se abre en modo LECTURA y
 * nada mas. El workstream `milestone` despliega produccion desde ahi y esta corriendo en
 * paralelo; una sola escritura rompe el deploy ajeno. En este modulo no hay ni un
 * `writeFileSync` que apunte a `src/`, y el unico archivo que se escribe es
 * `data/url-inventory.json`, que vive dentro de `seo-tools/`.
 *
 * POR QUE SE PARSEA EL TEXTO Y NO SE IMPORTAN LOS MODULOS.
 *
 * Importar `src/content/location-pages.ts` daria los datos ya tipados y sin regex. No se
 * puede: esos modulos resuelven con el alias `@/` de Next.js, arrastran `next` y React, y
 * `seo-tools` es un paquete Node aislado que a proposito no los instala. Levantar ese arbol
 * de dependencias dentro del tooling ataria la medicion al build de la aplicacion, que es
 * justo de lo que este paquete se separo. Ademas el parseo por texto da algo que la
 * importacion no da: el NUMERO DE LINEA, que es la procedencia que T-14-05 exige para que
 * cada URL del inventario se pueda auditar hasta su origen.
 *
 * Por eso los formatos que se reconocen son deliberadamente estrechos y fallan ruidoso: una
 * `slug` que deje de estar en su propia linea con comillas dobles se nombra en el error en
 * vez de desaparecer del inventario en silencio.
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, REPO_ROOT, SEO_TOOLS_ROOT } from "../config.js";
import { ejecutar, parseBanderas, texto } from "../phase13/args.js";

/** Raiz de la aplicacion. SOLO LECTURA. */
export const APP_SRC = path.join(REPO_ROOT, "src");

/** Familias del sitio. Ordenan el mapa y alimentan la matriz de enlazado del plan 14-04. */
export type FamiliaDeUrl =
  | "home"
  | "hub"
  | "servicio"
  | "sede"
  | "blog"
  | "institucional"
  | "conversion"
  | "legal";

export interface EntradaDeInventario {
  /** Ruta del sitio, empezando por barra. */
  readonly url: string;
  readonly titulo: string;
  readonly estado: "viva" | "planificada";
  /** Si la URL entra al mapa keyword -> URL. */
  readonly mapeable: boolean;
  /** Obligatorio cuando `mapeable` es falso: una exclusion sin motivo no es auditable. */
  readonly motivoNoMapeable?: string;
  /** Archivo y linea de donde salio la URL, relativo a la raiz del repositorio. */
  readonly origen: string;
  readonly familia: FamiliaDeUrl;
}

/** Una entrada de un modulo de contenido, con la linea en la que se declaro. */
export interface RegistroDeContenido {
  readonly slug: string;
  readonly titulo: string;
  /** Linea, base 1, de la declaracion de `slug`. */
  readonly linea: number;
  /** Ruta del archivo relativa a la raiz del repositorio. */
  readonly archivo: string;
}

/** Lee un archivo de la aplicacion. Falla nombrando la ruta, no la excepcion cruda. */
export function leerFuente(rutaRelativa: string): string {
  const absoluta = path.join(REPO_ROOT, rutaRelativa);
  try {
    return readFileSync(absoluta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${rutaRelativa}.\n` +
        `  Resuelto contra la raiz del repositorio: ${absoluta}\n` +
        `  Accion: verificar que el archivo siga existiendo. El inventario se mide del codigo,\n` +
        `  asi que un modulo de contenido que desaparece tiene que detener la medicion y no\n` +
        `  producir un inventario mas corto en silencio.`,
    );
  }
}

/**
 * Extrae las entradas de un modulo de contenido: cada `slug` con el primer `title` que le
 * sigue dentro del mismo objeto.
 *
 * El corte entre objetos es el siguiente `slug`, que es lo unico estable: los modulos declaran
 * `slug` como primer campo de cada entrada. Un `title` que aparezca ANTES del primer `slug`
 * (por ejemplo dentro de un tipo o de un comentario de cabecera) queda fuera por construccion.
 */
export function registrosDeModulo(rutaRelativa: string): RegistroDeContenido[] {
  const lineas = leerFuente(rutaRelativa).split("\n");

  const crudos: { slug: string; linea: number }[] = [];
  lineas.forEach((linea, i) => {
    const m = /^\s*slug:\s*"([^"]+)"\s*,\s*$/.exec(linea);
    if (m !== null) crudos.push({ slug: m[1] as string, linea: i + 1 });
  });

  if (crudos.length === 0) {
    throw new CliError(
      `${rutaRelativa} no declara ni un "slug" en el formato esperado.\n` +
        `  Se busca una linea con exactamente: slug: "valor",\n` +
        `  Accion: si el modulo cambio de forma, actualizar este parseo. Devolver cero URLs\n` +
        `  seria reportar un sitio mas chico del que existe.`,
    );
  }

  return crudos.map((crudo, i) => {
    const hasta = i + 1 < crudos.length ? (crudos[i + 1] as { linea: number }).linea - 1 : lineas.length;
    let titulo: string | null = null;
    for (let n = crudo.linea; n < hasta; n += 1) {
      const m = /^\s*title:\s*"((?:[^"\\]|\\.)*)"\s*,\s*$/.exec(lineas[n] as string);
      if (m !== null) {
        titulo = (m[1] as string).replace(/\\"/g, '"');
        break;
      }
    }
    if (titulo === null) {
      throw new CliError(
        `${rutaRelativa}:${crudo.linea} declara slug "${crudo.slug}" sin un "title" despues.\n` +
          `  Accion: cada entrada de contenido tiene que traer su title, que es lo que el mapa\n` +
          `  publica como titulo de la URL.`,
      );
    }
    return { slug: crudo.slug, titulo, linea: crudo.linea, archivo: rutaRelativa };
  });
}

/** Modulos de contenido que alimentan las rutas dinamicas. */
export const MODULO_SEDES = "src/content/location-pages.ts";
export const MODULO_SERVICIOS = "src/content/service-pages.ts";
export const MODULO_BLOG = "src/content/blog.ts";

/**
 * Las paginas de sede, expandidas a una URL por slug declarado.
 *
 * Sale de `location-pages.ts` y no de `locations.ts` a proposito, que es la misma regla que
 * aplica `generateStaticParams` en `src/app/sedes/[slug]/page.tsx`: una sede sin entrada
 * editorial no genera ruta. Es lo que hace que Montefiori, que ya no se declara, no pueda
 * aparecer en el inventario ni por descuido (D-08).
 */
export function entradasDeSede(): EntradaDeInventario[] {
  return registrosDeModulo(MODULO_SEDES).map((registro) => ({
    url: `/sedes/${registro.slug}`,
    titulo: registro.titulo,
    estado: "viva" as const,
    mapeable: true,
    origen: `${registro.archivo}:${registro.linea}`,
    familia: "sede" as const,
  }));
}

/** Busca una sede por slug. Falla nombrando las que si existen. */
export function entradaDeSede(slug: string): EntradaDeInventario {
  const entradas = entradasDeSede();
  const hit = entradas.find((e) => e.url === `/sedes/${slug}`);
  if (hit === undefined) {
    throw new CliError(
      `La sede "${slug}" no esta declarada en ${MODULO_SEDES}.\n` +
        `  Sedes declaradas: ${entradas.map((e) => JSON.stringify(e.url)).join(", ")}`,
    );
  }
  return hit;
}

// ---------------------------------------------------------------------------
// Recorrido de src/app
// ---------------------------------------------------------------------------

/**
 * Solo `page.tsx` produce URL de inventario.
 *
 * De ahi sale, sin ninguna lista de exclusiones que mantener, que `/api/...`, `/llms.txt` y
 * `/sitemap.xml` queden fuera: los tres son `route.ts`, es decir manejadores, no paginas. Una
 * lista negra habria que ampliarla con cada archivo generado nuevo y fallaria en silencio la
 * primera vez que alguien olvidara hacerlo.
 */
const ARCHIVO_DE_PAGINA = "page.tsx";

/** Directorios de `src/app` que no son segmentos de ruta. */
const NO_SON_RUTA = new Set(["api"]);

interface RutaDeApp {
  /** Ruta del sitio con el segmento dinamico todavia sin expandir. */
  readonly patron: string;
  /** Ruta del `page.tsx`, relativa a la raiz del repositorio. */
  readonly archivo: string;
  readonly dinamica: boolean;
}

/** Recorre `src/app` y devuelve un patron de ruta por cada `page.tsx`. Orden alfabetico. */
export function rutasDeApp(): RutaDeApp[] {
  const salida: RutaDeApp[] = [];

  const recorrer = (dirAbsoluto: string, segmentos: readonly string[]): void => {
    const entradas = readdirSync(dirAbsoluto, { withFileTypes: true })
      .slice()
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    if (entradas.some((e) => e.isFile() && e.name === ARCHIVO_DE_PAGINA)) {
      const patron = segmentos.length === 0 ? "/" : `/${segmentos.join("/")}`;
      salida.push({
        patron,
        archivo: path.posix.join("src/app", ...segmentos, ARCHIVO_DE_PAGINA),
        dinamica: segmentos.some((s) => s.startsWith("[")),
      });
    }

    for (const entrada of entradas) {
      if (!entrada.isDirectory()) continue;
      if (NO_SON_RUTA.has(entrada.name)) continue;
      // Los grupos de ruta `(nombre)` no aportan segmento. Hoy no hay ninguno; la regla queda
      // escrita porque el dia que aparezca uno, ignorarla produciria una URL que no existe.
      const aporta = !(entrada.name.startsWith("(") && entrada.name.endsWith(")"));
      recorrer(path.join(dirAbsoluto, entrada.name), aporta ? [...segmentos, entrada.name] : segmentos);
    }
  };

  recorrer(path.join(APP_SRC, "app"), []);
  return salida.sort((a, b) => (a.patron < b.patron ? -1 : a.patron > b.patron ? 1 : 0));
}

/**
 * Modulo de contenido que alimenta una ruta dinamica, leido de su propio `generateStaticParams`.
 *
 * No es una tabla escrita a mano a proposito. `generateStaticParams` declara que coleccion
 * expande la ruta, y esa coleccion se importa de un modulo concreto; seguir esa cadena
 * significa que una ruta dinamica nueva se incorpora sola y que un cambio de modulo no deja el
 * inventario apuntando al archivo viejo. Una tabla fija se desincronizaria en silencio, que es
 * la clase de error que este inventario existe para no cometer.
 */
export function moduloDeRutaDinamica(archivoDePagina: string): string {
  const fuente = leerFuente(archivoDePagina);

  const params = /export\s+(?:async\s+)?function\s+generateStaticParams\s*\([^)]*\)\s*{([\s\S]*?)\n}/.exec(
    fuente,
  );
  if (params === null) {
    throw new CliError(
      `${archivoDePagina} es una ruta dinamica y no declara generateStaticParams.\n` +
        `  Sin esa funcion no hay forma de saber a que URLs se expande.`,
    );
  }

  const coleccion = /([A-Za-z_$][\w$]*)\s*\.\s*map\s*\(/.exec(params[1] as string);
  if (coleccion === null) {
    throw new CliError(
      `${archivoDePagina}: generateStaticParams no expande una coleccion reconocible.\n` +
        `  Se espera la forma: return <coleccion>.map((x) => ({ slug: x.slug }));`,
    );
  }
  const nombre = coleccion[1] as string;

  const importa = new RegExp(
    `import\\s*{[^}]*\\b${nombre}\\b[^}]*}\\s*from\\s*"@/content/([\\w-]+)"`,
    "s",
  ).exec(fuente);
  if (importa === null) {
    throw new CliError(
      `${archivoDePagina}: "${nombre}" no se importa de ningun modulo de @/content.\n` +
        `  El inventario deduce el modulo de contenido de ese import y no de una tabla fija.`,
    );
  }
  return `src/content/${importa[1] as string}.ts`;
}

// ---------------------------------------------------------------------------
// Titulos de las rutas estaticas
// ---------------------------------------------------------------------------

/** Valores de texto de primer nivel de `siteConfig`, para resolver los titulos con plantilla. */
function valoresDeSiteConfig(): Record<string, string> {
  const fuente = leerFuente("src/lib/site-config.ts");
  const salida: Record<string, string> = {};
  // Solo el primer nivel: la sangria de dos espacios exactos es lo que distingue una clave de
  // `siteConfig` de una clave anidada dentro de `office` o de `whatsapp`.
  for (const m of fuente.matchAll(/^ {2}(\w+):\s*"([^"]*)",$/gm)) {
    salida[m[1] as string] = m[2] as string;
  }
  return salida;
}

/**
 * Titulo declarado en el bloque `metadata` de una pagina estatica, con su linea.
 *
 * Resuelve las plantillas que interpolan `siteConfig`, que es como la home declara el suyo.
 * Dejarlo sin resolver publicaria en el documento del cliente un titulo con `${...}` adentro.
 */
export function tituloDePaginaEstatica(archivo: string): { titulo: string; linea: number } {
  const lineas = leerFuente(archivo).split("\n");
  const config = valoresDeSiteConfig();

  for (let i = 0; i < lineas.length; i += 1) {
    const linea = lineas[i] as string;
    const literal = /^\s*title:\s*"((?:[^"\\]|\\.)*)"\s*,\s*$/.exec(linea);
    if (literal !== null) {
      return { titulo: (literal[1] as string).replace(/\\"/g, '"'), linea: i + 1 };
    }
    const plantilla = /^\s*title:\s*`([^`]*)`\s*,\s*$/.exec(linea);
    if (plantilla !== null) {
      const resuelto = (plantilla[1] as string).replace(
        /\$\{siteConfig\.(\w+)\}/g,
        (crudo, clave: string) => config[clave] ?? crudo,
      );
      if (resuelto.includes("${")) {
        throw new CliError(
          `${archivo}:${i + 1} declara un title con una interpolacion que no se pudo resolver.\n` +
            `  Sin resolver: ${JSON.stringify(resuelto)}\n` +
            `  Accion: si la plantilla ahora lee otra fuente, ensenarle a este modulo a leerla.`,
        );
      }
      return { titulo: resuelto, linea: i + 1 };
    }
  }

  throw new CliError(
    `${archivo} no declara un title en su bloque metadata.\n` +
      `  El inventario publica ese titulo como nombre de la URL y no lo inventa.`,
  );
}

// ---------------------------------------------------------------------------
// Familias y exclusiones
// ---------------------------------------------------------------------------

/** Rutas que existen para convertir y no para posicionar por si mismas. */
const CONVERSION = new Set(["/agendar", "/contacto"]);
/** Paginas de institucion: hablan del doctor y de su respaldo, no de una condicion. */
const INSTITUCIONAL = new Set(["/sobre-el-doctor", "/testimonios", "/preguntas-frecuentes"]);
/** Hubs: indices de un silo. */
const HUBS = new Set(["/servicios", "/sedes", "/blog"]);

export function familiaDeUrl(url: string): FamiliaDeUrl {
  if (url === "/") return "home";
  if (url === "/privacidad") return "legal";
  if (HUBS.has(url)) return "hub";
  if (CONVERSION.has(url)) return "conversion";
  if (INSTITUCIONAL.has(url)) return "institucional";
  if (url.startsWith("/servicios/")) return "servicio";
  if (url.startsWith("/sedes/")) return "sede";
  if (url.startsWith("/blog/")) return "blog";
  return "institucional";
}

/**
 * URLs que quedan fuera del MAPA, con su motivo.
 *
 * Fuera del mapa no es fuera del inventario: la URL existe, se cuenta y se declara. Borrarla
 * del inventario haria que el total no cuadrara con el sitio y que nadie pudiera auditar por
 * que falta.
 */
const NO_MAPEABLES: Record<string, string> = {
  "/privacidad":
    "D-11: es una pagina legal y ya declara noindex desde v1.0, asi que esta fuera del sitemap. " +
    "Asignarle una keyword seria pedirle a Google que posicione una URL que el propio sitio le " +
    "pide no indexar.",
};

// ---------------------------------------------------------------------------
// Inventario completo
// ---------------------------------------------------------------------------

/** Lo que el roadmap esperaba antes de que v1.1 publicara. Se compara, no se impone. */
export const ESPERADO_ROADMAP = 19;
export const ESPERADO_MAPEABLE_ROADMAP = 18;

/**
 * Las URLs que el roadmap nombra una por una, en `REQUIREMENTS.md`, seccion
 * "Inventario de URLs a cubrir (19)".
 *
 * Se copian literales, con sus defectos incluidos: `/blog/[slug]` esta sin expandir y
 * `/servicios` aparece dos veces, una como existente y otra como hub reformulado. Corregirlas
 * al copiarlas destruiria justamente la diferencia que hay que reportar.
 */
const NOMINAL_ROADMAP: readonly string[] = [
  "/",
  "/servicios",
  "/sobre-el-doctor",
  "/testimonios",
  "/preguntas-frecuentes",
  "/contacto",
  "/agendar",
  "/blog",
  "/blog/[slug]",
  "/privacidad",
  "/servicios/hernia-discal",
  "/servicios/estenosis-espinal",
  "/servicios/escoliosis-y-deformidades",
  "/servicios/ortopedia-infantil",
  "/sedes/consultorio-privado",
  "/sedes/clinica-ricardo-palma",
  "/sedes/sanna-la-molina",
  "/sedes/clinica-tezza",
  "/servicios",
];

export interface Reconciliacion {
  readonly esperadoRoadmap: number;
  readonly esperadoMapeableRoadmap: number;
  readonly medido: number;
  readonly medidoMapeable: number;
  readonly diferencia: number;
  readonly diferenciaMapeable: number;
  /** URLs medidas que la lista del roadmap no nombra. */
  readonly sobran: readonly string[];
  /** URLs que el roadmap nombra y que no existen con ese nombre en el codigo. */
  readonly faltan: readonly string[];
  readonly nota: string;
}

export interface Inventario {
  readonly schema: 1;
  readonly generadoPor: string;
  readonly requisito: string;
  readonly urls: readonly EntradaDeInventario[];
  readonly resumen: {
    readonly total: number;
    readonly mapeables: number;
    readonly porFamilia: Record<string, number>;
  };
  readonly reconciliacion: Reconciliacion;
}

/** Orden de familias en el reparto. Fijo, para que dos corridas serialicen igual. */
const ORDEN_DE_FAMILIA: readonly FamiliaDeUrl[] = [
  "home",
  "hub",
  "servicio",
  "sede",
  "blog",
  "institucional",
  "conversion",
  "legal",
];

/** Construye el inventario completo del sitio leyendo el codigo. Determinista. */
export function construirInventario(): Inventario {
  const urls: EntradaDeInventario[] = [];

  for (const ruta of rutasDeApp()) {
    if (!ruta.dinamica) {
      const { titulo, linea } = tituloDePaginaEstatica(ruta.archivo);
      const motivo = NO_MAPEABLES[ruta.patron];
      urls.push({
        url: ruta.patron,
        titulo,
        estado: "viva",
        mapeable: motivo === undefined,
        ...(motivo === undefined ? {} : { motivoNoMapeable: motivo }),
        origen: `${ruta.archivo}:${linea}`,
        familia: familiaDeUrl(ruta.patron),
      });
      continue;
    }

    const modulo = moduloDeRutaDinamica(ruta.archivo);
    const prefijo = ruta.patron.replace(/\/\[[^\]]+\]$/, "");
    for (const registro of registrosDeModulo(modulo)) {
      const url = `${prefijo}/${registro.slug}`;
      const motivo = NO_MAPEABLES[url];
      urls.push({
        url,
        titulo: registro.titulo,
        estado: "viva",
        mapeable: motivo === undefined,
        ...(motivo === undefined ? {} : { motivoNoMapeable: motivo }),
        origen: `${registro.archivo}:${registro.linea}`,
        familia: familiaDeUrl(url),
      });
    }
  }

  urls.sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));

  const porFamilia: Record<string, number> = {};
  for (const familia of ORDEN_DE_FAMILIA) {
    const n = urls.filter((u) => u.familia === familia).length;
    if (n > 0) porFamilia[familia] = n;
  }

  const medidas = new Set(urls.map((u) => u.url));
  const nominal = new Set(NOMINAL_ROADMAP);
  const sobran = [...medidas].filter((u) => !nominal.has(u)).sort();
  const faltan = [...nominal].filter((u) => !medidas.has(u)).sort();
  const mapeables = urls.filter((u) => u.mapeable).length;

  return {
    schema: 1,
    generadoPor: "src/phase14/inventory.ts",
    requisito: "MAP-01",
    urls,
    resumen: { total: urls.length, mapeables, porFamilia },
    reconciliacion: {
      esperadoRoadmap: ESPERADO_ROADMAP,
      esperadoMapeableRoadmap: ESPERADO_MAPEABLE_ROADMAP,
      medido: urls.length,
      medidoMapeable: mapeables,
      diferencia: urls.length - ESPERADO_ROADMAP,
      diferenciaMapeable: mapeables - ESPERADO_MAPEABLE_ROADMAP,
      sobran,
      faltan,
      nota:
        "El inventario reporta lo que mide. La cifra de 19 y 18 de REQUIREMENTS.md se escribio " +
        "antes de que v1.1 publicara, y ademas cuenta `/blog/[slug]` como una sola URL sin " +
        "expandir, repite `/servicios` (una vez como existente y otra como hub reformulado) y " +
        "no nombra el hub `/sedes`. Ajustar la medicion para que diera 19 seria falsearla. Las " +
        "listas `sobran` y `faltan` son la diferencia nominal y entran como primer punto de " +
        "decision al checkpoint del plan 14-02.",
    },
  };
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase14/inventory.ts --out data/url-inventory.json
//
// COSTE DE CUOTA: CERO. No sale a la red ni lee ninguna cache de API: el inventario se mide
// del codigo del sitio y de nada mas.

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const destino = texto(banderas, "out") ?? "data/url-inventory.json";
  const absoluto = path.isAbsolute(destino) ? destino : path.resolve(SEO_TOOLS_ROOT, destino);

  const inventario = construirInventario();

  // Sin marcas de tiempo adentro: dos corridas tienen que dar el mismo SHA-256.
  writeFileSync(absoluto, `${JSON.stringify(inventario, null, 2)}\n`, "utf8");

  const out = process.stdout;
  out.write(`URLs medidas del codigo: ${inventario.resumen.total}\n`);
  out.write(`  mapeables:             ${inventario.resumen.mapeables}\n`);
  for (const [familia, n] of Object.entries(inventario.resumen.porFamilia)) {
    out.write(`  ${familia.padEnd(22)} ${String(n).padStart(3)}\n`);
  }

  const r = inventario.reconciliacion;
  out.write(`\nReconciliacion contra la cifra del roadmap (${r.esperadoRoadmap} / ${r.esperadoMapeableRoadmap} mapeables):\n`);
  out.write(`  diferencia total:      ${r.diferencia >= 0 ? "+" : ""}${r.diferencia}\n`);
  out.write(`  diferencia mapeables:  ${r.diferenciaMapeable >= 0 ? "+" : ""}${r.diferenciaMapeable}\n`);
  if (r.sobran.length > 0) {
    out.write(`  medidas que el roadmap no nombra (${r.sobran.length}):\n`);
    for (const u of r.sobran) out.write(`    + ${u}\n`);
  }
  if (r.faltan.length > 0) {
    out.write(`  nombradas por el roadmap que no existen asi (${r.faltan.length}):\n`);
    for (const u of r.faltan) out.write(`    - ${u}\n`);
  }

  out.write(`\nEscrito: ${absoluto}\n`);
  return 0;
}

// Solo corre como ejecutable. Importarlo desde una prueba no escribe nada.
if (process.argv[1] !== undefined && process.argv[1].endsWith("inventory.ts")) {
  ejecutar(main);
}
