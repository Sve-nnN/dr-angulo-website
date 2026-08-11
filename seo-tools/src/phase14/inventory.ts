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

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, REPO_ROOT } from "../config.js";

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
