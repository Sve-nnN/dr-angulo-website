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
import { booleana, ejecutar, parseBanderas, texto, textoObligatorio } from "../phase13/args.js";
import { normalizar } from "./entidades.js";
import type { FilaDeOnPage } from "./metadatos.js";
import { construirOnPage, tituloYMeta } from "./metadatos.js";
import type {
  DatoOperativo,
  EnlacePropuesto,
  JerarquiaDeUrl,
  MapeoDePost,
  PaqueteDeUrl,
  SeccionDeCopy,
  TipoDeDocumento,
} from "./model.js";
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

const NOMBRE_DE_FORMATO: Readonly<Record<TipoDeDocumento, string>> = {
  "guia-clinica": "guía clínica",
  "pagina-de-servicio": "página de servicio",
  "ficha-de-sede": "ficha de sede",
  "documento-corto": "documento corto",
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
 * La cabecera que comparten los cuatro tipos de documento.
 *
 * Va igual en los cuatro a proposito. Quien implementa abre el archivo de su URL sin saber que
 * clase de documento le toco, y lo primero que lee tiene que decirselo. Cuatro cabeceras
 * distintas obligarian a aprender cuatro documentos donde hay uno.
 */
function cabecera(
  url: string,
  fuente: string,
  filas: readonly (readonly string[])[],
): string[] {
  return [
    `# Paquete on-page: ${url}`,
    "",
    `<!-- Generado por seo-tools/src/phase15/paquete.ts desde ${fuente}.`,
    "     No se edita a mano: se regenera. -->",
    "",
    "## Qué hay que hacer con esta URL",
    "",
    ...tabla(["Campo", "Valor"], filas),
    "",
  ];
}

/**
 * El enlazado saliente que la matriz de la fase 14 propuso para esta URL.
 *
 * Va FUERA de la region de copy porque es tabla generada y no prosa nuestra, y va con el
 * rotulo de propuesta con todas las letras: los enlaces los escribe v1.1 en el codigo del
 * sitio. Sin este bloque, quien abre el paquete de una URL tiene que ir a buscar
 * `14-ENLAZADO.md` para saber que enlaces le tocan, que es justo lo que D-14 pide evitar.
 */
function bloqueDeEnlaces(enlaces: readonly EnlacePropuesto[]): string[] {
  if (enlaces.length === 0) return [];
  return [
    "## Enlaces internos propuestos",
    "",
    "Salen de la matriz de la fase 14 y acá **se proponen**: los implementa v1.1 en el código del",
    "sitio, porque este workstream no toca `src/`. El copy de arriba ya deja el lugar de cada uno.",
    "",
    ...tabla(
      ["#", "Destino", "Anchor", "Regla"],
      enlaces.map((e, i) => [String(i + 1), `\`${e.destino}\``, e.anchor, e.regla]),
    ),
    "",
  ];
}

/**
 * Cómo entra el copy en la estructura de post que la aplicacion ya usa.
 *
 * Va FUERA de la region de copy porque es tabla generada. Lo llevan solo los posts del blog:
 * son los unicos cuyo destino es una entrada de `blogPosts` con campos fijos, y sin este mapeo
 * quien implementa tiene que decidir de nuevo que parte del copy es `intro` y cual una
 * `subsection`. Esa decision ya se tomo al redactar, y volver a tomarla del otro lado es
 * exactamente el trabajo duplicado que esta fase existe para evitar.
 */
function bloqueDeMapeoDePost(mapeo: readonly MapeoDePost[]): string[] {
  if (mapeo.length === 0) return [];
  return [
    "## Cómo entra este copy en la estructura de post",
    "",
    "La aplicación ya tiene el tipo del post. Implementar esta URL es transcribir el copy de",
    "arriba a esos campos, y no rediseñar la página.",
    "",
    ...tabla(
      ["Campo del post", "De dónde sale"],
      mapeo.map((m) => [`\`${m.campo}\``, m.deDonde]),
    ),
    "",
  ];
}

/**
 * Los datos operativos de una sede, en dos tablas y no en una.
 *
 * Va FUERA de la region de copy porque es tabla generada. La separacion entre respaldado y
 * pendiente es lo que hace este bloque: mezclados, v1.1 publicaria un horario que nadie confirmo
 * sin darse cuenta, y una direccion o un horario equivocado manda a un paciente a otro lado. Ese
 * es el dano mas concreto de esta fase, mas concreto todavia que una afirmacion medica inflada.
 */
function bloqueDeDatosOperativos(datos: readonly DatoOperativo[]): string[] {
  if (datos.length === 0) return [];
  const respaldados = datos.filter((d) => d.estado === "respaldado");
  const pendientes = datos.filter((d) => d.estado === "pendiente");
  const lineas: string[] = ["## Datos operativos de la sede", ""];

  if (respaldados.length > 0) {
    lineas.push(
      "Cada uno sale del contenido publicado del sitio y declara de dónde. Ninguno se compone.",
      "",
      ...tabla(
        ["Dato", "Valor", "Fuente"],
        respaldados.map((d) => [d.dato, d.valor, d.fuente]),
      ),
      "",
    );
  }

  if (pendientes.length > 0) {
    lineas.push(
      "### Pendientes de confirmación antes de publicar",
      "",
      "Esto es lo que v1.1 tiene que resolver antes de que la página salga. No se completó acá",
      "porque no está publicado en ninguna fuente del sitio, y componer un dato operativo manda a",
      "un paciente a un lugar equivocado. Va en tabla aparte para que publicarlo sin confirmarlo",
      "requiera saltearse un encabezado que dice que falta.",
      "",
      ...tabla(
        ["Dato", "Estado", "Quién lo confirma"],
        pendientes.map((d) => [d.dato, d.valor, d.fuente]),
      ),
      "",
    );
  }

  return lineas;
}

/**
 * El paquete completo en Markdown.
 *
 * Determinista por construccion: no lee el reloj, no recorre ningun Set para decidir orden y
 * la fecha que imprime es la del envelope de la captura. Dos corridas dan el mismo archivo.
 */
export function renderPaquete(
  paquete: PaqueteDeUrl,
  rutaDelCopy: string = "data/copy-guias.json",
): string {
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

  lineas.push(
    ...cabecera(
      paquete.fila.url,
      `${rutaDelCopy} y las capturas de .cache/serpapi/`,
      [
        ["URL", `\`${paquete.fila.url}\``],
        ["Acción", paquete.fila.accion],
        ["Formato", NOMBRE_DE_FORMATO[paquete.formato]],
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

  if (paquete.notaDeFormato != null && paquete.notaDeFormato !== "") {
    lineas.push("### Con qué criterio se eligió el formato");
    lineas.push("");
    lineas.push(paquete.notaDeFormato);
    lineas.push("");
  }

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
      "> Esta SERP no dio ocho términos clínicos, anatómicos o de procedimiento ni al umbral",
      "> mínimo. Los términos genéricos que sí trae quedan listados arriba y no cuentan para el",
      "> mínimo: exigir que la página nombre `especialidad` no le pide nada a quien la escribe.",
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
    for (const encabezado of sinCopy) lineas.push(`- ${encabezado}`);
    lineas.push("");
  }

  lineas.push(...bloqueDeMapeoDePost(paquete.mapeoDePost ?? []));
  lineas.push(...bloqueDeDatosOperativos(paquete.datosOperativos ?? []));
  lineas.push(...bloqueDeEnlaces(paquete.enlacesPropuestos ?? []));

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
// El cuarto tipo: el documento corto
// ---------------------------------------------------------------------------

/**
 * El documento de una URL que no lleva copy.
 *
 * Son las 6 que declararon no competir y solo reciben title y meta (D-06), y las 2 que se apagan
 * con un 301 (D-07). Existe porque quien abra esa URL tiene que encontrar la instruccion y no un
 * hueco (D-14): un archivo ausente se lee como olvido y el que lo busca termina decidiendo solo.
 */
/** Un bloque del post que se apaga y la seccion de la guia que lo recibio. */
export interface BloqueAbsorbido {
  readonly origen: string;
  readonly destino: string;
}

/**
 * Un anchor con el que el resto del sitio enlaza a esta URL, y desde donde.
 *
 * Solo lo llevan los documentos cortos y no es adorno: la fase 14 decidio que estas seis URLs se
 * enlazan con anchor de NAVEGACION y no de keyword, porque si pelearan un termino se lo quitarian
 * a la home. Enlazarlas con anchor de keyword desharia esa decision desde el codigo, sin que
 * ninguna revision lo note. Va escrito dentro del documento de cada una para que quien la
 * implemente lo lea donde va a actuar.
 */
export interface AnchorDeEntrada {
  readonly anchor: string;
  readonly regla: string;
  /** URLs que enlazan con ese anchor, en el orden de la matriz. */
  readonly desde: readonly string[];
}

export interface PaqueteCorto {
  readonly fila: FilaDeOnPage;
  /**
   * Por que la URL no compite, tal como lo escribio la fase 14.
   *
   * Prosa heredada, con las rayas largas de entonces. Va FUERA de la region de copy: acotar la
   * region es lo que permite prohibir la raya larga en lo que escribimos sin que la regla se
   * caiga por texto que esta fase no puso ni va a tocar.
   */
  readonly motivoSinPrimaria: string | null;
  /** Las dos lineas que dicen que hacer con esta URL. Es lo unico que esta fase redacta aca. */
  readonly queHacer: readonly string[];
  /**
   * Los bloques del post que la guia de destino ya absorbio, con su destino nombrado.
   *
   * Sin esta lista, quien pone el 301 no tiene como comprobar que el contenido sobrevivio, y
   * redirigir sin fundir tira el contenido a la basura sin dejar rastro de lo que habia.
   */
  readonly absorcion?: readonly BloqueAbsorbido[];
  /** Con que anchor la enlaza el resto del sitio. Vacio si nadie le apunta en la matriz. */
  readonly anchorsDeEntrada?: readonly AnchorDeEntrada[];
}

interface FilaDeLaMatriz {
  readonly url: string;
  readonly enlaces?: readonly { readonly link: string; readonly anchor: string; readonly regla: string }[];
}

/**
 * Los anchors con los que la matriz de la fase 14 enlaza a una URL, leidos del dataset.
 *
 * Se recorre en el orden del archivo y se agrupa por anchor: dos corridas dan la misma lista.
 */
export function anchorsQueApuntanA(
  url: string,
  rutaArchivo: string = path.join(SEO_TOOLS_ROOT, "data", "internal-links.json"),
): AnchorDeEntrada[] {
  let crudo: string;
  try {
    crudo = readFileSync(rutaArchivo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${rutaArchivo}.\n` +
        `  Accion: es la matriz de enlazado de la fase 14. Sin ella no se sabe con que anchor se ` +
        `enlaza a esta URL.`,
    );
  }
  const archivo = JSON.parse(crudo) as { readonly filas?: readonly FilaDeLaMatriz[] };
  const porAnchor = new Map<string, { anchor: string; regla: string; desde: string[] }>();

  for (const fila of archivo.filas ?? []) {
    for (const enlace of fila.enlaces ?? []) {
      if (enlace.link !== url) continue;
      const clave = `${enlace.anchor} ${enlace.regla}`;
      const ya = porAnchor.get(clave);
      if (ya === undefined) {
        porAnchor.set(clave, { anchor: enlace.anchor, regla: enlace.regla, desde: [fila.url] });
      } else {
        ya.desde.push(fila.url);
      }
    }
  }

  return [...porAnchor.values()];
}

/**
 * Las dos lineas que contestan "y con esta URL, que hago".
 *
 * Generadas y no escritas a mano: son ocho URLs con dos respuestas posibles, y escribir la misma
 * frase ocho veces es como una queda distinta sin que nadie lo note.
 */
export function queHacerCon(fila: FilaDeOnPage): readonly string[] {
  if (fila.accion === "redirigir") {
    const destino = fila.redirigeA ?? "su destino";
    return [
      `Esta URL se apaga con una redirección 301 permanente hacia \`${destino}\`.`,
      `No recibe title, meta ni H1 propios. El paquete que hay que implementar es el de ` +
        `\`${destino}\`.`,
    ];
  }
  return [
    "Esta URL se queda publicada y de ella solo cambian el title y la meta description, que " +
      "están en la tabla de abajo.",
    fila.h1 === null
      ? "El H1 no se propone porque la URL declaró no competir, y el sitio publicado no tiene " +
        "uno de texto plano que transcribir. Lo decide quien publique."
      : "El H1 no se toca. El que ya está en el sitio se transcribió acá para que se vea cuál " +
        "es y no haya que ir a buscarlo.",
  ];
}

/**
 * El documento corto en Markdown.
 *
 * Comparte cabecera con los otros tres tipos y lleva las dos marcas de copy aunque casi no
 * tenga copy: asi la compuerta de `ymyl.ts` corre sobre cualquiera de los cuatro documentos sin
 * un caso especial, y un caso especial es donde una regla se pierde.
 */
export function renderPaqueteCorto(corto: PaqueteCorto): string {
  const { fila } = corto;
  const lineas: string[] = [];

  lineas.push(
    ...cabecera(fila.url, "data/onpage.json y data/url-map.jsonl", [
      ["URL", `\`${fila.url}\``],
      ["Acción", fila.accion],
      ["Formato", NOMBRE_DE_FORMATO["documento-corto"]],
      ["Keyword primaria", "sin primaria, y es una decisión medida de la fase 14"],
      ["Redirige a", fila.redirigeA === null ? "no aplica" : `\`${fila.redirigeA}\``],
    ]),
  );

  lineas.push(COPY_INICIO);
  lineas.push("");
  for (const linea of corto.queHacer) {
    lineas.push(linea);
    lineas.push("");
  }
  lineas.push(COPY_FIN);
  lineas.push("");

  if (fila.title !== null && fila.metaDescription !== null) {
    lineas.push("## Title, meta y H1");
    lineas.push("");
    lineas.push(
      ...tabla(
        ["Campo", "Texto", "Caracteres"],
        [
          ["Title", fila.title, `${fila.titleLargo ?? fila.title.length} / 60`],
          [
            "Meta description",
            fila.metaDescription,
            `${fila.metaLargo ?? fila.metaDescription.length} / 155`,
          ],
          ["H1", fila.h1 ?? "sin H1 en el sitio", fila.h1Origen ?? "sin origen"],
        ],
      ),
    );
    lineas.push("");
    if (fila.origenDelH1 !== null) {
      lineas.push(`Por qué ese H1: ${fila.origenDelH1}`);
      lineas.push("");
    }
  }

  if (fila.accion === "redirigir") {
    lineas.push("## La redirección");
    lineas.push("");
    lineas.push(
      ...tabla(
        ["Campo", "Valor"],
        [
          ["Origen", `\`${fila.url}\``],
          ["Destino", `\`${fila.redirigeA ?? "sin destino en el mapa"}\``],
          ["Tipo", "301 permanente"],
        ],
      ),
    );
    lineas.push("");
    if (fila.origenDelH1 !== null) {
      lineas.push(fila.origenDelH1);
      lineas.push("");
    }
    lineas.push(
      "El orden no es indistinto: primero se publica la guía de destino con el contenido ya",
      "fundido y después se pone la redirección. Al revés, el 301 entierra material que todavía",
      "no vive en ningún otro lado.",
    );
    lineas.push("");

    const absorcion = corto.absorcion ?? [];
    if (absorcion.length > 0) {
      lineas.push("### Qué se absorbió y dónde quedó");
      lineas.push("");
      lineas.push(
        "Bloque por bloque, para poder comprobar que no se perdió nada sin volver a abrir el post.",
      );
      lineas.push("");
      lineas.push(
        ...tabla(
          ["Bloque del post que se apaga", "Dónde quedó en la guía"],
          absorcion.map((b) => [b.origen, b.destino]),
        ),
      );
      lineas.push("");
    }
  }

  const anchors = corto.anchorsDeEntrada ?? [];
  if (anchors.length > 0) {
    lineas.push("## Con qué anchor se enlaza a esta URL");
    lineas.push("");
    lineas.push(
      "Con anchor de **navegación**, nunca de keyword. La fase 14 midió que estas URLs no pelean",
      "ningún término, y en varios casos porque si lo pelearan le quitarían la SERP a la home.",
      "Enlazarlas desde el código con un anchor de keyword desharía esa decisión sin que ninguna",
      "revisión lo note.",
    );
    lineas.push("");
    lineas.push(
      ...tabla(
        ["Anchor", "Regla", "Desde"],
        anchors.map((a) => [
          a.anchor,
          a.regla,
          a.desde.map((d) => `\`${d}\``).join(", "),
        ]),
      ),
    );
    lineas.push("");
  }

  if (corto.motivoSinPrimaria !== null) {
    lineas.push("## Por qué esta URL no compite");
    lineas.push("");
    lineas.push(
      "Escrito en la fase 14 y transcrito acá sin tocarlo. No es una omisión: es una decisión",
      "medida, y quien implemente esta URL merece leer el motivo sin abrir otro archivo (D-14).",
    );
    lineas.push("");
    lineas.push(corto.motivoSinPrimaria);
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
  readonly absorbe?: readonly BloqueAbsorbido[];
  readonly enlacesPropuestos?: readonly EnlacePropuesto[];
  readonly datosOperativos?: readonly DatoOperativo[];
  readonly mapeoDePost?: readonly MapeoDePost[];
  readonly notaDeFormato?: string;
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
 * Arma el documento corto de una URL sin copy, desde el mapa de metadatos y el de la fase 14.
 *
 * `construirOnPage()` en vez de leer `data/onpage.json`: el dataset es la fuente de verdad y el
 * archivo su copia en disco. Regenerarlo cuesta cero y no puede quedar desincronizado.
 */
export function construirPaqueteCorto(url: string, rutaCopy: string = RUTA_COPY): PaqueteCorto {
  const fila = construirOnPage().filas.find((f) => f.url === url);
  if (fila === undefined) {
    throw new CliError(
      `La URL ${url} no esta en el mapa de metadatos.\n` +
        `  Accion: las 24 filas salen de data/url-map.jsonl; revisa la ruta que pasaste.`,
    );
  }
  if (fila.keywordPrimaria !== null && fila.keywordPrimaria !== "") {
    throw new CliError(
      `La URL ${url} tiene keyword primaria y recibe pagina completa, no documento corto.\n` +
        `  Accion: el documento corto es para las 6 que declararon no competir y las 2 que se ` +
        `apagan con un 301.`,
    );
  }

  return {
    fila,
    motivoSinPrimaria: filasDelMapa().find((f) => f.url === url)?.motivoSinPrimaria ?? null,
    queHacer: queHacerCon(fila),
    absorcion:
      fila.redirigeA === null
        ? []
        : (paginasDeCopy(rutaCopy).find((p) => p.url === fila.redirigeA)?.absorbe ?? []),
    anchorsDeEntrada: anchorsQueApuntanA(url),
  };
}

/**
 * Arma el paquete de una URL cruzando el mapa de la fase 14, su SERP cacheada y el copy.
 *
 * La SERP se lee offline: una captura ausente falla nombrando la keyword y jamas sale a la red.
 */
export async function construirPaquete(
  url: string,
  rutaCopy: string = RUTA_COPY,
): Promise<PaqueteDeUrl> {
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
  const copy = paginasDeCopy(rutaCopy).find((p) => p.url === url);
  if (copy === undefined) {
    throw new CliError(
      `No hay copy redactado para ${url} en ${rutaCopy}.\n` +
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
    enlacesPropuestos: copy.enlacesPropuestos ?? [],
    datosOperativos: copy.datosOperativos ?? [],
    mapeoDePost: copy.mapeoDePost ?? [],
    notaDeFormato: copy.notaDeFormato ?? null,
    fuente: medida.fuente,
  };
}

// ---------------------------------------------------------------------------
// El paquete entero y su indice
// ---------------------------------------------------------------------------

/**
 * Los cuatro datasets de copy, en el orden en que los escribieron sus planes.
 *
 * Son cuatro y no uno porque los planes 15-03 a 15-06 corrieron en paralelo y dos planes sobre
 * un mismo JSON se pisan. Para generar el paquete entero hay que volver a unirlos, y la union se
 * hace por URL: cada una vive en un solo archivo y el primero que la trae gana.
 */
export const DATASETS_DE_COPY = [
  "data/copy-guias.json",
  "data/copy-servicios.json",
  "data/copy-sedes.json",
  "data/copy-blog.json",
] as const;

/** En cual de los cuatro datasets vive el copy de una URL. `null` si en ninguno. */
export function rutaDelCopyDe(url: string): string | null {
  for (const relativa of DATASETS_DE_COPY) {
    const ruta = path.join(SEO_TOOLS_ROOT, relativa);
    if (paginasDeCopy(ruta).some((p) => p.url === url)) return ruta;
  }
  return null;
}

/** Una fila del indice: lo que hace falta para saber que archivo abrir y que esperar dentro. */
export interface EntradaDelIndice {
  readonly url: string;
  readonly accion: string;
  readonly formato: TipoDeDocumento;
  readonly archivo: string;
  /** Palabras de prosa redactadas. `null` en los documentos que no llevan cuerpo. */
  readonly palabras: number | null;
  readonly minimoDePalabras: number | null;
  readonly redirigeA: string | null;
}

/**
 * Regenera los 24 documentos de una sola pasada y devuelve con que quedo cada uno.
 *
 * Regenerarlos todos y no solo los que faltan es lo que prueba que el paquete entero sale de los
 * datasets (D-12). Un documento que solo se puede reproducir corriendo el plan que lo escribio no
 * es un entregable reproducible: es un archivo que quedo.
 */
export async function generarTodos(): Promise<EntradaDelIndice[]> {
  const entradas: EntradaDelIndice[] = [];

  for (const fila of filasDelMapa()) {
    const { url } = fila;
    const conPrimaria = fila.keywordPrimaria !== null && fila.keywordPrimaria !== "";

    if (!conPrimaria) {
      // Las dos que se apagan necesitan el copy de su DESTINO para poder listar que se absorbio.
      const rutaDelDestino =
        fila.redirigeA === null ? null : rutaDelCopyDe(fila.redirigeA);
      const corto = construirPaqueteCorto(
        url,
        rutaDelDestino ?? path.join(SEO_TOOLS_ROOT, DATASETS_DE_COPY[0]),
      );
      escribir(url, renderPaqueteCorto(corto));
      entradas.push({
        url,
        accion: corto.fila.accion,
        formato: "documento-corto",
        archivo: archivoDePaquete(url),
        palabras: null,
        minimoDePalabras: null,
        redirigeA: corto.fila.redirigeA,
      });
      continue;
    }

    const rutaCopy = rutaDelCopyDe(url);
    if (rutaCopy === null) {
      throw new CliError(
        `No hay copy redactado para ${url} en ninguno de los cuatro datasets de la fase.\n` +
          `  Buscado en: ${DATASETS_DE_COPY.join(", ")}.\n` +
          `  Accion: la URL tiene keyword primaria, asi que recibe pagina completa (D-06).`,
      );
    }
    const paquete = await construirPaquete(url, rutaCopy);
    escribir(url, renderPaquete(paquete, path.relative(SEO_TOOLS_ROOT, rutaCopy)));
    entradas.push({
      url,
      accion: paquete.fila.accion,
      formato: paquete.formato,
      archivo: archivoDePaquete(url),
      palabras: palabrasDeCopy(paquete.secciones),
      minimoDePalabras: paquete.minimoDePalabras,
      redirigeA: paquete.fila.redirigeA,
    });
  }

  return entradas;
}

/**
 * El indice del paquete: la puerta de entrada del entregable.
 *
 * Se genera y no se transcribe. Veinticuatro filas escritas a mano se desincronizan en la primera
 * correccion, y a partir de ahi el indice dice una cosa y los datasets otra, sin que nada avise.
 */
export function renderIndice(entradas: readonly EntradaDelIndice[]): string {
  const completas = entradas.filter((e) => e.formato !== "documento-corto");
  const soloMetadata = entradas.filter(
    (e) => e.formato === "documento-corto" && e.accion === "dejar",
  );
  const redirecciones = entradas.filter((e) => e.accion === "redirigir");

  const lineas: string[] = [
    "# Paquete on-page: índice de las 24 URLs",
    "",
    "<!-- Generado por seo-tools/src/phase15/paquete.ts --todos --indice, desde data/url-map.jsonl",
    "     y los cuatro datasets de copy. No se edita a mano: se regenera. -->",
    "",
    "**Fase:** 15, paquete on-page por URL. Última de v1.2.",
    "**Para:** las fases 8 y 10 del workstream `milestone` (v1.1).",
    "**Handoff que lo acompaña:** `15-HANDOFF-V11-ONPAGE.md`.",
    "**Revisión clínica pendiente:** `15-REVISION-DOCTOR.md`, bloqueante para publicar.",
    "",
    "## Las 24 URLs",
    "",
    ...tabla(
      ["URL", "Acción", "Formato", "Archivo", "Palabras"],
      entradas.map((e) => [
        `\`${e.url}\``,
        e.accion,
        NOMBRE_DE_FORMATO[e.formato],
        `[\`paquetes/${e.archivo}\`](paquetes/${e.archivo})`,
        e.palabras === null
          ? "sin cuerpo"
          : `${e.palabras} / mínimo ${e.minimoDePalabras ?? 0}`,
      ]),
    ),
    "",
    "## Qué recibe cada grupo",
    "",
    ...tabla(
      ["Grupo", "Cuántas", "Qué recibe"],
      [
        [
          "Con keyword primaria",
          String(completas.length),
          "Página completa: title, meta, H1, jerarquía, entidades obligatorias y copy redactado " +
            "para pegar.",
        ],
        [
          "Declararon no competir",
          String(soloMetadata.length),
          "Title y meta nuevos, el H1 publicado sin tocar, y el motivo escrito de por qué no " +
            "pelean ninguna keyword (D-06).",
        ],
        [
          "Se apagan con un 301",
          String(redirecciones.length),
          "La instrucción de redirección y la lista de qué bloque suyo quedó en qué sección de " +
            "la guía de destino (D-07).",
        ],
      ],
    ),
    "",
    "## Cómo se usa",
    "",
    "Cada archivo se abre solo. Quien implementa una URL no tiene que leer las otras veintitrés:",
    "el documento de su URL trae el title, la meta, el H1, la jerarquía de encabezados con su",
    "procedencia, las entidades que la página tiene que nombrar, el copy redactado y los enlaces",
    "internos que le tocan (D-14). Ese es el criterio de terminado de esta fase: implementar una",
    "URL no obliga a volver a preguntar nada.",
    "",
    "Los documentos se **regeneran**, no se editan:",
    "",
    "```bash",
    "cd seo-tools",
    "./node_modules/.bin/tsx src/phase15/paquete.ts --todos --indice",
    "```",
    "",
    "Una corrección hecha a mano sobre el Markdown sobrevive hasta la siguiente corrida y después",
    "desaparece sin dejar rastro. La fuente de verdad son `data/url-map.jsonl`, `data/onpage.json`",
    "y los cuatro datasets de copy.",
    "",
    "## Lo que este paquete NO libera",
    "",
    "Ningún bloque clínico sale de acá aprobado. Cada uno va sellado como pendiente del doctor",
    "(D-08) y la ronda completa está armada en `15-REVISION-DOCTOR.md`. v1.1 no publica texto",
    "clínico sin ese visto bueno por escrito.",
    "",
  ];

  return `${lineas.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

/**
 * El handoff hacia las fases 8 y 10 de v1.1, generado desde los datasets.
 *
 * AUTOCONTENIDO A PROPOSITO. Quien lo lea del otro lado no tiene por que abrir un solo archivo de
 * este workstream para actuar. Un handoff que obliga a interpretar hace que el trabajo se decida
 * dos veces, y esta fase existe exactamente para que se decida una.
 *
 * La prosa vive en el codigo, igual que en el indice, y por el mismo motivo: las tablas salen de
 * `onpage.json` y del mapa, asi que documento y datasets no se pueden desincronizar.
 */
export function renderHandoff(
  filas: readonly FilaDeOnPage[],
  pendientes: readonly { readonly url: string; readonly dato: string }[],
): string {
  const conMetadata = filas.filter((f) => f.accion !== "redirigir");
  const completas = filas.filter(
    (f) => f.keywordPrimaria !== null && f.keywordPrimaria !== "",
  );
  const soloMetadata = filas.filter((f) => f.accion === "dejar");
  const porCrear = filas.filter((f) => f.accion === "crear");
  const redirecciones = filas.filter((f) => f.accion === "redirigir");

  const lineas: string[] = [
    "# Handoff a v1.1: el paquete on-page de las 24 URLs",
    "",
    "<!-- Generado por seo-tools/src/phase15/paquete.ts --todos --handoff, desde data/onpage.json,",
    "     data/url-map.jsonl y los cuatro datasets de copy. No se edita a mano: se regenera. -->",
    "",
    "**De:** workstream `seo-keywords` (v1.2), fase 15, plan 15-07",
    "**Para:** workstream `milestone` (v1.1), fases 8 y 10",
    "**Continúa:** `phases/14-mapa-keyword-url-y-matriz-de-enlazado/14-HANDOFF-V11.md`. La fase 14",
    "dijo por qué keyword pelea cada URL; esta dice con qué texto la gana.",
    "",
    "Este documento se lee solo. No hace falta abrir ningún otro archivo del workstream",
    "`seo-keywords` para actuar sobre lo que dice acá.",
    "",
    "---",
    "",
    "## 1. Qué se entrega y dónde",
    "",
    `**${filas.length} documentos, uno por URL**, en`,
    "`.planning/workstreams/seo-keywords/phases/15-paquete-on-page-por-url/paquetes/`.",
    "El índice que los ordena es `15-PAQUETE.md`, en esa misma carpeta.",
    "",
    "Para implementar una URL se abre su archivo y se sigue de corrido. Adentro está el title, la",
    "meta, el H1, la jerarquía de encabezados con la procedencia de cada uno, las entidades que la",
    "página tiene que nombrar, el copy redactado para pegar y los enlaces internos que le tocan. No",
    "hay que leer los otros veintitrés.",
    "",
    "Los documentos se **regeneran** desde los datasets del repositorio. Una corrección hecha a mano",
    "sobre el Markdown se pierde en la siguiente corrida:",
    "",
    "```bash",
    "cd seo-tools",
    "./node_modules/.bin/tsx src/phase15/paquete.ts --todos --indice --handoff",
    "```",
    "",
    "---",
    "",
    `## 2. Para la fase 10: title y meta de las ${conMetadata.length} URLs con metadata`,
    "",
    "Los límites son 60 y 155 caracteres, que es lo que esa fase ya verifica del otro lado. Las",
    `${conMetadata.length} entran dentro del contrato y ninguna queda pegada al borde: el title más largo mide ` +
      `${Math.max(...conMetadata.map((f) => f.titleLargo ?? 0))} y la meta más larga mide ` +
      `${Math.max(...conMetadata.map((f) => f.metaLargo ?? 0))}.`,
    "",
    ...tabla(
      ["URL", "Title", "Car.", "Meta description", "Car."],
      conMetadata.map((f) => [
        `\`${f.url}\``,
        f.title ?? "sin title",
        `${f.titleLargo ?? 0}/60`,
        f.metaDescription ?? "sin meta",
        `${f.metaLargo ?? 0}/155`,
      ]),
    ),
    "",
    `Las ${redirecciones.length} URLs que faltan en esta tabla son las que se apagan con un 301: no reciben`,
    "title, meta ni H1 propios porque dejan de existir.",
    "",
    "---",
    "",
    "## 3. Para la fase 8: qué recibe cada página",
    "",
    `**${completas.length} reciben copy completo.** Página redactada de punta a punta, lista para`,
    "pegar, con su jerarquía de encabezados y sus entidades obligatorias.",
    "",
    ...tabla(
      ["URL", "Keyword primaria", "Formato", "Acción"],
      completas.map((f) => [
        `\`${f.url}\``,
        `\`${f.keywordPrimaria ?? ""}\``,
        f.formato ?? "sin formato",
        f.accion,
      ]),
    ),
    "",
    `**${soloMetadata.length} reciben solo title y meta.** Declararon no competir por ninguna`,
    "keyword y eso fue una decisión medida en la fase 14, no un hueco. No se les propone cuerpo de",
    "texto: inventarles uno les inventaría una intención que el mapa decidió que no tienen. Se",
    "enlazan con anchor de navegación y nunca de keyword; el anchor exacto está en el documento de",
    "cada una.",
    "",
    ...tabla(
      ["URL", "H1 publicado", "Qué hacer"],
      soloMetadata.map((f) => [
        `\`${f.url}\``,
        f.h1 ?? "sin H1 de texto plano",
        "Cambiar title y meta. El H1 no se toca.",
      ]),
    ),
    "",
    `**${porCrear.length} URLs por crear.** No existen todavía: la ruta, el layout y el sitemap son`,
    "trabajo de v1.1; el copy está entregado.",
    "",
    ...tabla(
      ["URL por crear", "Keyword primaria", "Formato"],
      porCrear.map((f) => [`\`${f.url}\``, `\`${f.keywordPrimaria ?? ""}\``, f.formato ?? "sin formato"]),
    ),
    "",
    // La frase y la tabla salen de la misma lista: si el mapa de la fase 14 gana o pierde una
    // redireccion, las dos cambian juntas. El documento declara en su cabecera que se genera
    // desde los datasets justamente para no desincronizarse.
    ...((): readonly string[] => {
      const deLaFase14 = [
        [
          "`/servicios/escoliosis`",
          "`/servicios/escoliosis-y-deformidades`",
          "Renombre de slug decidido en la fase 14. Arrastra el 301, el sitemap y los enlaces " +
            "internos ya escritos que apunten al slug viejo.",
        ],
      ];
      const deEstePaquete = redirecciones.map((f) => [
        `\`${f.url}\``,
        `\`${f.redirigeA ?? "sin destino"}\``,
        "El post se funde con la guía de destino: su contenido ya vive adentro, bloque por " +
          "bloque, y la lista está en el documento del post.",
      ]);
      const filas = [...deLaFase14, ...deEstePaquete];
      const enPalabras = ["Cero", "Una", "Dos", "Tres", "Cuatro", "Cinco", "Seis"];
      const cuantas = enPalabras[deEstePaquete.length] ?? String(deEstePaquete.length);
      return [
        `**${filas.length} redirecciones 301.** ${cuantas} ` +
          `${deEstePaquete.length === 1 ? "sale" : "salen"} de este paquete y ` +
          `${deLaFase14.length === 1 ? "la restante venía avisada" : "las restantes venían avisadas"} ` +
          "de la fase 14.",
        "",
        ...tabla(["Desde", "Hacia", "Por qué"], filas),
      ];
    })(),
    "",
    "---",
    "",
    "## 4. El orden que no se puede invertir",
    "",
    "Las dos guías de destino **absorben** el contenido de los posts que se apagan. Por eso:",
    "",
    "1. Primero se publica la guía de destino con el contenido ya fundido.",
    "2. Recién entonces se pone el 301 y se saca el post del sitemap.",
    "",
    "Al revés, el 301 entierra material que todavía no vive en ningún otro lado. El documento de",
    "cada post que se apaga trae la tabla de qué bloque suyo quedó en qué sección de la guía, así",
    "que se puede comprobar que no se perdió nada antes de redirigir.",
    "",
    "---",
    "",
    "## 5. La restricción que sigue viva, y es bloqueante",
    "",
    "**Ninguna línea de texto clínico se publica sin la aprobación del doctor por escrito.** Cada",
    "bloque médico sale de esta fase sellado como pendiente, y ese sello no lo levanta este",
    "workstream.",
    "",
    "La ronda completa está armada en `15-REVISION-DOCTOR.md`, ordenada por riesgo clínico y no por",
    "URL, con una casilla por bloque. **Es bloqueante para la fase 8:** si v1.1 encuentra un bloque",
    "sin sello levantado, el paquete no está listo para esa URL.",
    "",
    "Vale también la regla de la que salen todos los textos: nada de credenciales, número de",
    "cirugías, tasas de éxito ni resultados. Solo lo verificable. Si al implementar aparece la",
    "tentación de una frase con más fuerza comercial, va la verificable.",
    "",
    "---",
    "",
    "## 6. Lo que este handoff NO resuelve",
    "",
    `**${pendientes.length} datos operativos de sede siguen sin confirmar.** No se compusieron a`,
    "propósito: una dirección, un piso o un horario inventado manda a un paciente a un lugar",
    "equivocado. Van listados en la página de su sede, en tabla aparte, y también al final de la",
    "ronda del doctor. v1.1 no publica esa sede hasta resolverlos, sea confirmándolos o sacando la",
    "afirmación.",
    "",
    ...tabla(
      ["Sede", "Dato pendiente"],
      pendientes.map((p) => [`\`${p.url}\``, p.dato]),
    ),
    "",
    "**Los enlaces internos se proponen, no se implementan.** La matriz salió de la fase 14 y cada",
    "documento trae los enlaces que le tocan, con su anchor y la regla que lo justifica. Escribirlos",
    "en el código del sitio es trabajo de v1.1: este workstream no toca `src/`.",
    "",
    "**El Sheet del cliente es la fuente viva.** El tab `Keyword Research` tiene las columnas",
    "`Suggested H1` y `URL` llenas para las 16 keywords primarias. Si este documento y el Sheet",
    "difieren, gana el Sheet.",
    "",
  ];

  return `${lineas.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase15/paquete.ts --url /servicios/hernia-discal
//   ./node_modules/.bin/tsx src/phase15/paquete.ts --todos --indice --handoff
//
// COSTE DE CUOTA: CERO. La SERP sale de `.cache/serpapi/` en modo offline.

function escribir(url: string, documento: string): string {
  mkdirSync(DIRECTORIO_DE_PAQUETES, { recursive: true });
  const destino = path.join(DIRECTORIO_DE_PAQUETES, archivoDePaquete(url));
  writeFileSync(destino, documento, "utf8");
  return destino;
}

/**
 * Que tipo de documento le toca a la URL lo decide el mapa, no la bandera.
 *
 * Una URL sin keyword primaria no puede recibir pagina completa aunque quien corra el comando lo
 * pida: no tiene SERP medida de la cual sacar jerarquia ni entidades, y el mapa ya escribio por
 * que no compite.
 */
/** Regenera los 24 y, si se pide, el indice. Devuelve 1 si alguna pagina quedo bajo su minimo. */
/** Un entregable de la fase, por nombre de archivo. Los tres viven en la carpeta de la fase 15. */
function rutaDeLaFase(archivo: string): string {
  return path.join(
    REPO_ROOT,
    ".planning",
    "workstreams",
    "seo-keywords",
    "phases",
    "15-paquete-on-page-por-url",
    archivo,
  );
}

/**
 * Los datos de sede que quedaron sin confirmar, de las cuatro fichas.
 *
 * Salen del dataset y no de una lista escrita a mano: si una sede confirma su piso y alguien
 * actualiza `copy-sedes.json`, el handoff deja de reclamarlo en la siguiente corrida.
 */
function pendientesDeSede(): { readonly url: string; readonly dato: string }[] {
  const ruta = path.join(SEO_TOOLS_ROOT, "data", "copy-sedes.json");
  return paginasDeCopy(ruta).flatMap((p) =>
    (p.datosOperativos ?? [])
      .filter((d) => d.estado === "pendiente")
      .map((d) => ({ url: p.url, dato: d.dato })),
  );
}

async function generarPaqueteCompleto(conIndice: boolean, conHandoff: boolean): Promise<number> {
  const out = process.stdout;
  const entradas = await generarTodos();

  let cortas = 0;
  for (const e of entradas) {
    const cuerpo =
      e.palabras === null
        ? "sin cuerpo"
        : `${e.palabras} palabras (minimo ${e.minimoDePalabras ?? 0})`;
    if (e.palabras !== null && e.palabras < (e.minimoDePalabras ?? 0)) cortas += 1;
    out.write(`  ${e.archivo.padEnd(56)} ${e.formato.padEnd(20)} ${cuerpo}\n`);
  }

  out.write(`\n${entradas.length} documento(s) escritos en ${DIRECTORIO_DE_PAQUETES}\n`);

  if (conIndice) {
    const destino = rutaDeLaFase("15-PAQUETE.md");
    writeFileSync(destino, renderIndice(entradas), "utf8");
    out.write(`Indice: ${destino}\n`);
  }

  if (conHandoff) {
    const destino = rutaDeLaFase("15-HANDOFF-V11-ONPAGE.md");
    writeFileSync(destino, renderHandoff(construirOnPage().filas, pendientesDeSede()), "utf8");
    out.write(`Handoff: ${destino}\n`);
  }

  if (cortas > 0) out.write(`\n${cortas} pagina(s) por debajo de su minimo de palabras.\n`);
  return cortas === 0 ? 0 : 1;
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));

  if (booleana(banderas, "todos")) {
    return generarPaqueteCompleto(booleana(banderas, "indice"), booleana(banderas, "handoff"));
  }

  const url = textoObligatorio(banderas, "url");
  // El dataset por defecto es el de las guias. Las familias posteriores escriben en archivos
  // propios y lo pasan con --data: dos planes en paralelo sobre un mismo JSON se pisan.
  const origen = texto(banderas, "data") ?? "data/copy-guias.json";
  const rutaCopy = path.isAbsolute(origen) ? origen : path.join(SEO_TOOLS_ROOT, origen);
  const out = process.stdout;

  const enElMapa = filasDelMapa().find((f) => f.url === url);
  if (enElMapa === undefined) {
    throw new CliError(
      `La URL ${url} no esta en data/url-map.jsonl.\n` +
        `  Accion: el mapa de la fase 14 es de solo lectura; revisa la ruta que pasaste.`,
    );
  }

  if (enElMapa.keywordPrimaria === null || enElMapa.keywordPrimaria === "") {
    const corto = construirPaqueteCorto(url, rutaCopy);
    const destino = escribir(url, renderPaqueteCorto(corto));
    out.write(`Paquete de ${url}\n`);
    out.write(`  tipo:               documento corto\n`);
    out.write(`  accion:             ${corto.fila.accion}\n`);
    out.write(`  redirige a:         ${corto.fila.redirigeA ?? "no aplica"}\n`);
    out.write(`\nEscrito: ${destino}\n`);
    return 0;
  }

  const paquete = await construirPaquete(url, rutaCopy);
  const destino = escribir(url, renderPaquete(paquete, path.relative(SEO_TOOLS_ROOT, rutaCopy)));

  const escritas = palabrasDeCopy(paquete.secciones);
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
