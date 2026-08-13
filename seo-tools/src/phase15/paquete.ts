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
import { ejecutar, parseBanderas, texto, textoObligatorio } from "../phase13/args.js";
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
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase15/paquete.ts --url /servicios/hernia-discal
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
async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
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
