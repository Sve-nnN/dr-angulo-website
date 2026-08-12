/**
 * El paquete Markdown de una URL: todo lo que v1.1 necesita sin abrir otro archivo (D-12, D-14).
 *
 * EL DOCUMENTO SE REGENERA, NO SE EDITA. La fuente de verdad son `data/copy-guias.json` y las
 * capturas de `.cache/serpapi/`. Una correccion hecha a mano sobre el Markdown sobrevive hasta
 * la siguiente corrida y despues desaparece sin dejar rastro, que es peor que no haberla hecho.
 *
 * POR QUE LA REGION DE COPY VA DELIMITADA POR DOS COMENTARIOS HTML. Las reglas de humanizacion
 * se aplican a lo que escribimos y no a la prosa heredada: `url-map.jsonl` trae doce rayas
 * largas dentro de sus campos de justificacion, escritas en la fase 14, y esa prosa entra al
 * paquete como procedencia. Una regla que prohibiera la raya larga en el documento entero
 * fallaria por texto que este plan no escribio ni va a tocar.
 *
 * EL SELLO NO ES DECORACION. Toda seccion de tipo clinico sale marcada como pendiente de
 * aprobacion del doctor (D-08). Lo operativo, que es una direccion o un horario, no lo lleva:
 * sellar todo diluye el sello hasta volverlo invisible, y entonces la unica proteccion que
 * tiene el contenido YMYL de este sitio deja de proteger nada.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, REPO_ROOT, SEO_TOOLS_ROOT } from "../config.js";
import { ejecutar, parseBanderas, textoObligatorio } from "../phase13/args.js";
import { normalizar } from "./entidades.js";
import { tituloYMeta } from "./metadatos.js";
import type { JerarquiaDeUrl, PaqueteDeUrl, SeccionDeCopy } from "./model.js";
import { PaqueteInvalido } from "./model.js";
import { filaOnPageDe, filasDelMapa } from "./serp-onpage.js";

/** Marcas que abren y cierran lo que escribimos nosotros. Las lee la compuerta del plan 15-02. */
export const COPY_INICIO = "<!-- copy:inicio -->";
export const COPY_FIN = "<!-- copy:fin -->";

/** El sello de D-08, literal. Si esta cadena cambia, cambia el contrato con v1.1. */
export const SELLO_PENDIENTE =
  "> **Pendiente de aprobación del doctor.** Bloque clínico: no se publica sin su visto bueno por escrito.";

const RUTA_COPY = path.join(SEO_TOOLS_ROOT, "data", "copy-guias.json");
// No cuelga de PLANNING_DATA_DIR: ese apunta a `.../seo-keywords/data`, que es donde viven
// los datasets del workstream. Los paquetes son entregables de la fase y van con su fase.
const DIRECTORIO_DE_PAQUETES = path.join(
  REPO_ROOT,
  ".planning",
  "workstreams",
  "seo-keywords",
  "phases",
  "15-paquete-on-page-por-url",
  "paquetes",
);

const NOMBRE_DE_FORMATO: Readonly<Record<string, string>> = {
  "guia-clinica": "guía clínica",
  "pagina-de-servicio": "página de servicio",
  "ficha-de-sede": "ficha de sede",
};

/**
 * Clave estable de un encabezado, para cruzarlo contra su seccion de copy.
 *
 * Un H2 se identifica por su hueco del esqueleto, que no cambia aunque se reescriba el titulo.
 * Un H3 no tiene hueco propio, asi que se identifica por su texto convertido a slug: si alguien
 * reescribe el encabezado, el copy queda huerfano y el documento lo dice en vez de perderlo.
 */
export function claveDeEncabezado(encabezado: JerarquiaDeUrl): string {
  if (encabezado.nivel === 2) return encabezado.seccion;
  const slug = normalizar(encabezado.texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${encabezado.seccion}--${slug}`;
}

/** Archivo del paquete de una URL: la ruta con las barras vueltas guion. */
export function archivoDePaquete(url: string): string {
  const cuerpo = url.replace(/^\/+|\/+$/g, "").replace(/\//g, "-");
  return `${cuerpo === "" ? "home" : cuerpo}.md`;
}

function palabras(texto: string): number {
  return texto
    .trim()
    .split(/\s+/)
    .filter((p) => p !== "").length;
}

function tabla(encabezados: readonly string[], filas: readonly (readonly string[])[]): string[] {
  return [
    `| ${encabezados.join(" | ")} |`,
    `| ${encabezados.map(() => "---").join(" | ")} |`,
    ...filas.map((f) => `| ${f.join(" | ")} |`),
  ];
}

/** Las palabras de prosa del copy, sin encabezados ni sellos. Es lo que mide D-05. */
export function palabrasDeCopy(secciones: readonly SeccionDeCopy[]): number {
  return secciones.reduce((total, s) => total + palabras(s.parrafos.join(" ")), 0);
}

/**
 * El paquete completo en Markdown.
 *
 * Determinista por construccion: no lee el reloj, no recorre ningun Set para decidir orden y
 * la fecha que imprime es la del envelope de la captura. Dos corridas dan el mismo archivo.
 */
export function renderPaquete(paquete: PaqueteDeUrl): string {
  const meta = tituloYMeta({
    url: paquete.fila.url,
    keywordPrimaria: paquete.fila.keywordPrimaria ?? "",
    title: paquete.fila.title,
    metaDescription: paquete.fila.metaDescription,
    h1: paquete.fila.h1,
    h1Origen: paquete.fila.h1Origen,
  });

  const porClave = new Map(paquete.secciones.map((s) => [s.clave, s]));
  const escritas = palabrasDeCopy(paquete.secciones);
  const lineas: string[] = [];

  lineas.push(`# Paquete on-page: ${paquete.fila.url}`);
  lineas.push("");
  lineas.push(
    "<!-- Generado por seo-tools/src/phase15/paquete.ts desde data/copy-guias.json y las",
    "     capturas de .cache/serpapi/. No se edita a mano: se regenera. -->",
  );
  lineas.push("");

  lineas.push("## Qué hay que hacer con esta URL");
  lineas.push("");
  lineas.push(
    ...tabla(
      ["Campo", "Valor"],
      [
        ["URL", `\`${paquete.fila.url}\``],
        ["Acción", paquete.fila.accion],
        ["Formato", NOMBRE_DE_FORMATO[paquete.formato] ?? paquete.formato],
        ["Keyword primaria", `\`${paquete.fila.keywordPrimaria ?? "sin primaria"}\``],
        ["Mínimo de palabras", String(paquete.minimoDePalabras)],
        ["Palabras redactadas", `${escritas} (mínimo ${paquete.minimoDePalabras})`],
        ["Redirige a", paquete.fila.redirigeA ?? "no aplica"],
        [
          "SERP medida",
          `${paquete.fuente.organicos} orgánicos, ${paquete.fuente.preguntas} preguntas, ` +
            `${paquete.fuente.relacionadas} relacionadas, capturada el ` +
            `${(paquete.fuente.capturadaEn ?? "sin fecha").slice(0, 10)}`,
        ],
      ],
    ),
  );
  lineas.push("");

  lineas.push("## Title, meta y H1");
  lineas.push("");
  lineas.push(
    ...tabla(
      ["Campo", "Texto", "Caracteres"],
      [
        ["Title", meta.title, `${meta.largoDeTitle} / 60`],
        ["Meta description", meta.metaDescription, `${meta.largoDeMeta} / 155`],
        ["H1", meta.h1, "sin límite"],
      ],
    ),
  );
  lineas.push("");
  lineas.push(`Por qué ese H1: ${meta.h1Origen}`);
  lineas.push("");

  lineas.push("## Jerarquía de encabezados");
  lineas.push("");
  lineas.push(
    ...tabla(
      ["Nivel", "Encabezado", "De dónde sale"],
      paquete.jerarquia.map((h) => {
        // El indice muestra el encabezado ya redactado cuando existe, no el crudo del que
        // salio. La keyword del mapa dice `ciatica o hernia discal`, sin tilde, y publicar eso
        // como H3 seria una falta de ortografia en una pagina medica. El crudo no se pierde:
        // vive en la columna de procedencia.
        const escrito = porClave.get(claveDeEncabezado(h))?.titulo ?? h.texto;
        return [
          `H${h.nivel}`,
          h.nivel === 3 ? `&nbsp;&nbsp;${escrito}` : `**${escrito}**`,
          h.literal === null ? h.origen : `${h.origen}: \`${h.literal}\``,
        ];
      }),
    ),
  );
  lineas.push("");

  lineas.push("### Cobertura de las keywords secundarias");
  lineas.push("");
  lineas.push(
    "Los anchors de la matriz de enlazado salen de estas secundarias (D-15). Una sin encabezado",
    "deja sin respaldo al enlace que apunta acá.",
  );
  lineas.push("");
  lineas.push(
    ...tabla(
      ["Secundaria", "Encabezado que la cubre"],
      paquete.coberturaDeSecundarias.map((c) => [
        `\`${c.keyword}\``,
        c.cubiertaPor ?? "**SIN CUBRIR**",
      ]),
    ),
  );
  lineas.push("");

  lineas.push("### Cobertura de las búsquedas relacionadas");
  lineas.push("");
  lineas.push(
    ...tabla(
      ["Búsqueda relacionada", "Encabezado que la cubre"],
      paquete.coberturaDeRelacionadas.map((c) => [`\`${c.busqueda}\``, c.cubiertaPor]),
    ),
  );
  lineas.push("");

  if (paquete.preguntasSinUsar.length > 0) {
    lineas.push("### Preguntas de la SERP que no entraron");
    lineas.push("");
    for (const p of paquete.preguntasSinUsar) {
      lineas.push(`- **${p.pregunta}** ${p.motivo}`);
    }
    lineas.push("");
  }

  lineas.push("## Entidades obligatorias");
  lineas.push("");
  lineas.push(
    `Derivadas de los títulos y fragmentos de los ${paquete.fuente.organicos} orgánicos que ya`,
    `posicionan para \`${paquete.fuente.keyword}\`, con umbral de frecuencia documental`,
    `${paquete.umbralAplicado}. La captura no trae el cuerpo de esas páginas: el corpus es texto`,
    "de presentación y así hay que leerlo.",
  );
  lineas.push("");
  lineas.push(
    ...tabla(
      ["Término", "Documentos", "Posiciones", "Clase"],
      paquete.entidades.map((e) => [
        `\`${e.termino}\``,
        `${e.documentos} de ${e.de}`,
        e.posiciones.join(", "),
        e.clase,
      ]),
    ),
  );
  if (paquete.entidadesInsuficientes) {
    lineas.push("");
    lineas.push(
      "> Esta SERP no dio ocho términos ni al umbral mínimo. La lista queda corta a propósito:",
      "> inventar términos sería peor que entregar pocos.",
    );
  }
  lineas.push("");

  lineas.push("## Copy propuesto");
  lineas.push("");
  lineas.push(
    `Redactado para pegar. ${escritas} palabras de prosa contra un mínimo de`,
    `${paquete.minimoDePalabras}. Todo bloque clínico va sellado y ninguno se publica sin la`,
    "aprobación del doctor.",
  );
  lineas.push("");
  lineas.push(COPY_INICIO);
  lineas.push("");

  const sinCopy: string[] = [];
  for (const encabezado of paquete.jerarquia) {
    const seccion = porClave.get(claveDeEncabezado(encabezado));
    if (seccion === undefined) {
      sinCopy.push(encabezado.texto);
      continue;
    }
    lineas.push(`${"#".repeat(seccion.nivel)} ${seccion.titulo}`);
    lineas.push("");
    if (seccion.tipo === "clinico") {
      lineas.push(SELLO_PENDIENTE);
      lineas.push("");
    }
    for (const parrafo of seccion.parrafos) {
      lineas.push(parrafo);
      lineas.push("");
    }
  }

  lineas.push(COPY_FIN);
  lineas.push("");

  if (sinCopy.length > 0) {
    lineas.push("### Encabezados todavía sin copy");
    lineas.push("");
    for (const texto of sinCopy) lineas.push(`- ${texto}`);
    lineas.push("");
  }

  lineas.push("## Qué queda pendiente del doctor");
  lineas.push("");
  lineas.push(paquete.guiaParaElDoctor);
  lineas.push("");

  const clinicas = paquete.secciones.filter((s) => s.tipo === "clinico");
  lineas.push(
    `Son ${clinicas.length} bloques clínicos sobre ${paquete.secciones.length} secciones. Toda`,
    "la revisión de esta URL se hace en una sola pasada (D-09).",
  );
  lineas.push("");
  lineas.push(
    ...tabla(
      ["Sección", "Tipo", "Aprobación", "Afirmaciones con cifra"],
      paquete.secciones.map((s) => [
        s.titulo,
        s.tipo,
        s.aprobacion,
        String(s.afirmaciones.filter((a) => /\d/.test(a.texto)).length),
      ]),
    ),
  );
  lineas.push("");

  const conCifra = paquete.secciones.flatMap((s) => s.afirmaciones.filter((a) => /\d/.test(a.texto)));
  if (conCifra.length > 0) {
    lineas.push("### Afirmaciones con cifra y su fuente");
    lineas.push("");
    lineas.push(
      "Nada de credenciales, número de cirugías, tasas de éxito ni resultados (D-10). Cada cifra",
      "que quedó en el texto declara de dónde salió.",
    );
    lineas.push("");
    lineas.push(
      ...tabla(
        ["Afirmación", "Fuente"],
        conCifra.map((a) => [a.texto, a.fuente]),
      ),
    );
    lineas.push("");
  }

  return `${lineas.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

// ---------------------------------------------------------------------------
// Construccion desde los datasets
// ---------------------------------------------------------------------------

interface PaginaDeCopy {
  readonly url: string;
  readonly title: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly h1Origen: string;
  readonly guiaParaElDoctor: string;
  readonly secciones: readonly SeccionDeCopy[];
}

interface ArchivoDeCopy {
  readonly paginas?: readonly PaginaDeCopy[];
}

export function paginasDeCopy(rutaArchivo: string = RUTA_COPY): readonly PaginaDeCopy[] {
  let crudo: string;
  try {
    crudo = readFileSync(rutaArchivo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${rutaArchivo}.\n` +
        `  Accion: es el copy redactado de la fase. Sin el no hay paquete que generar.`,
    );
  }
  const archivo = JSON.parse(crudo) as ArchivoDeCopy | readonly PaginaDeCopy[];
  return Array.isArray(archivo) ? archivo : ((archivo as ArchivoDeCopy).paginas ?? []);
}

/**
 * Arma el paquete de una URL cruzando el mapa de la fase 14, su SERP cacheada y el copy.
 *
 * La SERP se lee offline: una captura ausente falla nombrando la keyword y jamas sale a la red.
 */
export async function construirPaquete(url: string): Promise<PaqueteDeUrl> {
  const fila = filasDelMapa().find((f) => f.url === url);
  if (fila === undefined) {
    throw new CliError(
      `La URL ${url} no esta en data/url-map.jsonl.\n` +
        `  Accion: el mapa de la fase 14 es de solo lectura; revisa la ruta que pasaste.`,
    );
  }
  if (fila.keywordPrimaria === null || fila.keywordPrimaria === "") {
    throw new CliError(
      `La URL ${url} no tiene keyword primaria y por eso no recibe pagina completa (D-06).\n` +
        `  Accion: las URLs de accion "dejar" solo reciben title y meta.`,
    );
  }

  const medida = await filaOnPageDe(fila);
  const copy = paginasDeCopy().find((p) => p.url === url);
  if (copy === undefined) {
    throw new CliError(
      `No hay copy redactado para ${url} en data/copy-guias.json.\n` +
        `  Accion: agregar la entrada con sus secciones antes de generar el paquete.`,
    );
  }

  const clinicasSinSello = copy.secciones.filter(
    (s) => s.tipo === "clinico" && s.aprobacion !== "pendiente-doctor",
  );
  if (clinicasSinSello.length > 0) {
    throw new PaqueteInvalido(
      `${url}: ${clinicasSinSello.length} seccion(es) clinica(s) sin el sello de ` +
        `pendiente-doctor (D-08): ${clinicasSinSello.map((s) => s.clave).join(", ")}.\n` +
        `  Accion: ninguna linea de texto clinico sale de esta fase como lista para publicar.`,
    );
  }

  return {
    fila: {
      url,
      accion: fila.accion as PaqueteDeUrl["fila"]["accion"],
      keywordPrimaria: fila.keywordPrimaria,
      title: copy.title,
      metaDescription: copy.metaDescription,
      h1: copy.h1,
      h1Origen: copy.h1Origen,
      redirigeA: fila.redirigeA,
    },
    formato: medida.formato,
    minimoDePalabras: medida.minimoDePalabras,
    secundarias: fila.secundarias ?? [],
    jerarquia: medida.jerarquia,
    entidades: medida.entidades,
    entidadesInsuficientes: medida.entidadesInsuficientes,
    umbralAplicado: medida.umbralAplicado,
    coberturaDeSecundarias: medida.coberturaDeSecundarias,
    coberturaDeRelacionadas: medida.coberturaDeRelacionadas,
    preguntasSinUsar: medida.preguntasSinUsar,
    secciones: copy.secciones,
    guiaParaElDoctor: copy.guiaParaElDoctor,
    fuente: medida.fuente,
  };
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase15/paquete.ts --url /servicios/hernia-discal
//
// COSTE DE CUOTA: CERO. La SERP sale de `.cache/serpapi/` en modo offline.

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const url = textoObligatorio(banderas, "url");

  const paquete = await construirPaquete(url);
  const documento = renderPaquete(paquete);

  mkdirSync(DIRECTORIO_DE_PAQUETES, { recursive: true });
  const destino = path.join(DIRECTORIO_DE_PAQUETES, archivoDePaquete(url));
  writeFileSync(destino, documento, "utf8");

  const escritas = palabrasDeCopy(paquete.secciones);
  const out = process.stdout;
  out.write(`Paquete de ${url}\n`);
  out.write(`  formato:            ${paquete.formato}\n`);
  out.write(`  palabras de copy:   ${escritas} (minimo ${paquete.minimoDePalabras})\n`);
  out.write(`  encabezados:        ${paquete.jerarquia.length}\n`);
  out.write(`  entidades:          ${paquete.entidades.length}\n`);
  out.write(`  bloques clinicos:   ${paquete.secciones.filter((s) => s.tipo === "clinico").length}\n`);
  out.write(`\nEscrito: ${destino}\n`);
  return escritas >= paquete.minimoDePalabras ? 0 : 1;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("paquete.ts")) {
  ejecutar(main);
}
