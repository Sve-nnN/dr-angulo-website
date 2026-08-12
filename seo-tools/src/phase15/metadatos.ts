/**
 * Title, meta y H1 de una URL, con el contrato que v1.1 ya verifica del otro lado (D-13).
 *
 * POR QUE ESTO VALIDA Y NO GENERA. Un title lo escribe alguien: es la unica linea del paquete
 * que el paciente lee antes de entrar y decide si entra. Generarlo por plantilla daria
 * dieciseis variantes de la misma frase, que es justo lo que la auditoria de duplicados del
 * plan 15-07 va a marcar. Lo que si tiene que ser mecanico es el limite: 60 y 155 no son gusto
 * sino el rango que la fase 10 de v1.1 comprueba, y entregar fuera de rango obliga a
 * reescribirlo alla, que es el trabajo duplicado que esta fase existe para evitar.
 *
 * LA COMPROBACION DE "AL FRENTE" ES POR TOKENS Y SIN TILDES. En espanol la keyword se parte
 * con preposiciones al escribirla natural: "cirugia de columna" cabe en un title como "cirugia
 * minimamente invasiva de columna" y sigue sirviendo la misma keyword. Exigir la cadena literal
 * obligaria a escribir titles que suenan a keyword y no a frase.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { REPO_ROOT, SEO_TOOLS_ROOT } from "../config.js";
import { ejecutar, parseBanderas, textoObligatorio } from "../phase13/args.js";
import { normalizar, tokenizar } from "./entidades.js";
import { PaqueteInvalido } from "./model.js";
import { filasDelMapa } from "./serp-onpage.js";

/** Contrato con la fase 10 de v1.1. Google corta mas alla y el snippet sale mutilado. */
export const LARGO_DE_TITLE = 60;
export const LARGO_DE_META = 155;

/**
 * Cuantos caracteres puede haber antes de la primera palabra de la primaria.
 *
 * Doce da para un prefijo corto de marca o de lugar y no para una frase entera delante. Mas
 * que eso empuja la keyword fuera de lo que el ojo lee primero en un resultado.
 */
export const FRENTE_DE_TITLE = 12;

export interface EntradaDeMetadatos {
  readonly url: string;
  readonly keywordPrimaria: string;
  readonly title: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly h1Origen: string;
}

export interface Metadatos {
  readonly title: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly h1Origen: string;
  readonly largoDeTitle: number;
  readonly largoDeMeta: number;
  readonly tokensDeLaPrimaria: readonly string[];
  /** Caracter donde arranca la primera palabra de la primaria dentro del title. */
  readonly primeraTokenEn: number;
}

/** Posicion de una palabra completa dentro de un texto ya normalizado. -1 si no esta. */
function posicionDePalabra(textoNormal: string, palabra: string): number {
  const encontrado = new RegExp(`(?:^|[^a-z0-9])(${palabra})(?![a-z0-9])`).exec(textoNormal);
  return encontrado === null ? -1 : encontrado.index + encontrado[0].length - palabra.length;
}

/**
 * Devuelve el title, la meta y el H1 de una URL, o falla nombrando que se rompio.
 *
 * Falla ruidoso a proposito: un title de 74 caracteres se publica igual y Google lo corta, asi
 * que nadie se entera hasta que el snippet ya salio mal en la SERP.
 */
export function tituloYMeta(entrada: EntradaDeMetadatos): Metadatos {
  const title = entrada.title.trim();
  const metaDescription = entrada.metaDescription.trim();
  const h1 = entrada.h1.trim();

  if (title === "" || metaDescription === "" || h1 === "") {
    throw new PaqueteInvalido(
      `${entrada.url}: title, metaDescription y h1 son obligatorios y alguno vino vacio.\n` +
        `  Accion: escribirlos en data/copy-guias.json. Un blanco se lee como olvido.`,
    );
  }

  if (title.length > LARGO_DE_TITLE) {
    throw new PaqueteInvalido(
      `${entrada.url}: el title mide ${title.length} caracteres y el limite es ` +
        `${LARGO_DE_TITLE} (D-13). Sobran ${title.length - LARGO_DE_TITLE}.\n` +
        `  Title: "${title}"`,
    );
  }

  if (metaDescription.length > LARGO_DE_META) {
    throw new PaqueteInvalido(
      `${entrada.url}: la meta description mide ${metaDescription.length} caracteres y el ` +
        `limite es ${LARGO_DE_META} (D-13). Sobran ${metaDescription.length - LARGO_DE_META}.`,
    );
  }

  const tokensDeLaPrimaria = tokenizar(entrada.keywordPrimaria);
  const titleNormal = normalizar(title);

  const ausentes = tokensDeLaPrimaria.filter((t) => posicionDePalabra(titleNormal, t) === -1);
  if (ausentes.length > 0) {
    throw new PaqueteInvalido(
      `${entrada.url}: el title no nombra ${ausentes.map((a) => `"${a}"`).join(", ")}, que es ` +
        `parte de la keyword primaria "${entrada.keywordPrimaria}".\n` +
        `  Title: "${title}"`,
    );
  }

  const primeraTokenEn = posicionDePalabra(titleNormal, tokensDeLaPrimaria[0] as string);
  if (primeraTokenEn > FRENTE_DE_TITLE) {
    throw new PaqueteInvalido(
      `${entrada.url}: la keyword primaria arranca en el caracter ${primeraTokenEn} del title ` +
        `y el maximo es ${FRENTE_DE_TITLE}. Delante hay una frase entera.\n` +
        `  Title: "${title}"`,
    );
  }

  return {
    title,
    metaDescription,
    h1,
    h1Origen: entrada.h1Origen.trim(),
    largoDeTitle: title.length,
    largoDeMeta: metaDescription.length,
    tokensDeLaPrimaria,
    primeraTokenEn,
  };
}

// ---------------------------------------------------------------------------
// El mapa de title, meta y H1 de las 24 filas
// ---------------------------------------------------------------------------
//
// TRES GRUPOS Y TRES TRATOS DISTINTOS.
//
//   Las 16 que compiten llevan la keyword primaria al frente del title y un H1 propuesto.
//   Las 6 que declararon no competir llevan title y meta descriptivos, sin keyword de
//   posicionamiento, y su H1 se LEE del sitio publicado: proponerles uno nuevo reabriria una
//   decision de la fase 14 sin dato nuevo, y encima por la puerta de atras.
//   Las 2 que se apagan con un 301 no llevan title ni meta, y existen igual como fila para que
//   quien abra esa URL encuentre la instruccion y no un hueco (D-07).
//
// POR QUE LOS TEXTOS ESTAN ESCRITOS Y NO GENERADOS. Un title es la unica linea del paquete que
// el paciente lee antes de decidir si entra. Una plantilla daria dieciseis variantes de la
// misma frase, que es exactamente lo que la auditoria de duplicados del plan 15-07 marca. Lo
// mecanico es la comprobacion, no la escritura.

export type OrigenDeH1 = "propuesto" | "publicado" | "ausente-en-el-sitio";

/** Una fila de `data/onpage.json`: lo que v1.1 pega tal cual, o la orden de apagar la URL. */
export interface FilaDeOnPage {
  readonly url: string;
  readonly accion: string;
  readonly keywordPrimaria: string | null;
  readonly title: string | null;
  readonly titleLargo: number | null;
  readonly metaDescription: string | null;
  readonly metaLargo: number | null;
  readonly h1: string | null;
  readonly h1Origen: OrigenDeH1 | null;
  /** Prosa: por que ese H1. Cuando se transcribio, termina en `archivo:linea`. */
  readonly origenDelH1: string | null;
  /** Caracter del title donde arranca la primera palabra de la primaria. */
  readonly keywordAlFrente: number | null;
  readonly redirigeA: string | null;
  readonly formato: string | null;
}

interface TextoEscrito {
  readonly title: string;
  readonly metaDescription: string;
  readonly h1?: string;
  readonly porQueElH1?: string;
}

/**
 * Title y meta de las 16 que compiten, con su H1 propuesto.
 *
 * El H1 no repite el title palabra por palabra a proposito: el title compite en la SERP contra
 * otros nueve resultados y el H1 recibe a alguien que ya entro. Son dos trabajos distintos y
 * escribir el mismo texto dos veces desperdicia el segundo.
 */
const ESCRITOS_CON_PRIMARIA: Readonly<Record<string, TextoEscrito>> = {
  "/": {
    title: "Traumatología en Lima: Dr. Juan Carlos Angulo",
    metaDescription:
      "Traumatólogo y cirujano de columna en Lima. Atiende en su consultorio de Surco, Ricardo Palma, Sanna La Molina y Clínica Tezza.",
    h1: "Traumatólogo y cirujano de columna en Lima",
    porQueElH1:
      "El title vende la especialidad y el H1 dice quién la ejerce, que es lo que alguien que ya entró quiere confirmar en el primer segundo.",
  },
  "/blog/5-sintomas-de-columna-que-no-debes-ignorar": {
    title: "Ciática: por qué duele la pierna y qué hacer",
    metaDescription:
      "Qué es la ciática, cómo se distingue de una lumbalgia, qué la produce y cuándo el dolor de pierna necesita evaluación médica.",
    h1: "Ciática: el dolor que baja por la pierna",
    porQueElH1:
      "Nombra el síntoma con las palabras del paciente, que es como llega buscando: le duele la pierna y todavía no sabe que eso se llama ciática.",
  },
  "/blog/artrosis": {
    title: "Artrosis: qué es, cómo se trata y cuándo consultar",
    metaDescription:
      "Qué es la artrosis, en qué articulaciones aparece, qué frena su avance y cuándo conviene consultar con un traumatólogo en Lima.",
    h1: "Artrosis: el desgaste de la articulación",
    porQueElH1:
      "El title enumera lo que la página cubre y el H1 define la condición en cinco palabras, que es lo que hace falta antes de leer el resto.",
  },
  "/blog/lumbalgia": {
    title: "Lumbalgia: por qué duele la zona lumbar",
    metaDescription:
      "Qué causa la lumbalgia, qué tipos hay, qué ejercicios ayudan y cuándo el dolor de la zona baja de la espalda necesita evaluación.",
    h1: "Lumbalgia: el dolor de la parte baja de la espalda",
    porQueElH1:
      "Traduce el término clínico al lenguaje corriente en el mismo encabezado, porque quien busca lumbalgia suele estar comprobando si es lo que tiene.",
  },
  "/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber": {
    title: "Cirugía de columna: cuándo se plantea y cómo es",
    metaDescription:
      "Cuándo se plantea operar la columna, qué técnicas existen, cómo es la recuperación y qué conviene preguntar en la consulta.",
    h1: "Operarse de la columna: lo que conviene saber antes",
    porQueElH1:
      "La página responde al miedo y no al procedimiento, así que el H1 habla desde el lado del paciente mientras el title sirve la búsqueda.",
  },
  "/preguntas-frecuentes": {
    title: "Reumatólogo o traumatólogo: a cuál te toca ir",
    metaDescription:
      "Cuándo corresponde un reumatólogo y cuándo un traumatólogo, qué pasa en la primera cita y en qué casos se plantea operar.",
    h1: "Dudas frecuentes antes de la consulta",
    porQueElH1:
      "El title sirve la búsqueda concreta que trae a la gente y el H1 abre el listado entero, que es lo que la página realmente es.",
  },
  "/sedes/clinica-ricardo-palma": {
    title: "Cirujano de columna en Clínica Ricardo Palma",
    metaDescription:
      "El Dr. Juan Carlos Angulo atiende columna en la Clínica Ricardo Palma, San Isidro. Días de consulta y cómo pedir cita.",
    h1: "Atención de columna en la Clínica Ricardo Palma",
    porQueElH1:
      "Cambia el sujeto: el title nombra al especialista, que es lo que se busca, y el H1 nombra el servicio en esa sede, que es lo que se resuelve ahí.",
  },
  "/sedes/clinica-tezza": {
    title: "Ortopedia infantil en la Clínica Tezza, Lima",
    metaDescription:
      "Consulta de ortopedia infantil con el Dr. Juan Carlos Angulo en la Clínica Padre Luis Tezza, Surco. Horarios y cómo agendar.",
    h1: "Ortopedia infantil en la Clínica Padre Luis Tezza",
    porQueElH1:
      "El title usa el nombre corto que la gente escribe y el H1 usa el nombre completo de la clínica, que es el que aparece en la puerta.",
  },
  "/sedes/consultorio-privado": {
    title: "Cirugía de columna en Surco: consultorio privado",
    metaDescription:
      "Consultorio privado del Dr. Juan Carlos Angulo en Surco para consultas de columna. Dónde queda y cómo pedir cita por WhatsApp.",
    h1: "Consultorio de Surco: la consulta sin intermediarios",
    porQueElH1:
      "El title sirve la búsqueda por procedimiento y zona, y el H1 destaca lo que diferencia a esta sede de las tres clínicas: se agenda directo.",
  },
  "/sedes/sanna-la-molina": {
    title: "Cirujano de columna en Clínica Sanna La Molina",
    metaDescription:
      "El Dr. Juan Carlos Angulo atiende columna en la Clínica Sanna de La Molina. Días de consulta y cómo llegar a la sede.",
    h1: "Atención de columna en Sanna La Molina",
    porQueElH1:
      "Misma lógica que las otras fichas de sede: el title nombra al especialista y el H1 nombra el servicio, para que las cuatro se lean igual.",
  },
  "/servicios": {
    title: "Cirujano de columna en Lima: qué trata el doctor",
    metaDescription:
      "Hernia discal, estenosis, escoliosis y ortopedia infantil. Qué atiende el Dr. Juan Carlos Angulo y en qué sede de Lima.",
    h1: "Cirujano de columna en Lima",
    porQueElH1:
      "El hub repite la primaria limpia porque es la página que la pelea de frente, y el title agrega la promesa de contenido que el H1 no necesita.",
  },
  "/servicios/cirugia-minimamente-invasiva": {
    title: "Cirugía mínimamente invasiva de columna en Lima",
    metaDescription:
      "Qué es la cirugía mínimamente invasiva de columna, en qué casos se indica y cómo es la recuperación. Consulta en Lima.",
    h1: "Cirugía de columna mínimamente invasiva",
    porQueElH1:
      "Reordena las mismas palabras para poner columna delante, porque quien ya entró busca confirmar la parte del cuerpo antes que la técnica.",
  },
  "/servicios/escoliosis-y-deformidades": {
    title: "Escoliosis: cómo se evalúa y cómo se trata",
    metaDescription:
      "Qué es la escoliosis, cómo se mide la curva, qué opciones hay según la edad y en qué casos se plantea la cirugía. Consulta en Lima.",
    h1: "Escoliosis y deformidades de la columna",
    porQueElH1:
      "El H1 abarca lo que la URL cubre después del renombrado, y el title se queda con la búsqueda que la trae, que es la escoliosis sola.",
  },
  "/servicios/estenosis-espinal": {
    title: "Estenosis espinal: síntomas y tratamiento",
    metaDescription:
      "Qué es la estenosis espinal, por qué aparece con los años, qué alivia el dolor al caminar y en qué casos se opera. Consulta en Lima.",
    h1: "Estenosis espinal: el canal que se estrecha",
    porQueElH1:
      "Explica el nombre en el propio encabezado, porque estenosis es una palabra que casi nadie llega sabiendo lo que significa.",
  },
  "/servicios/hernia-discal": {
    title: "Hernia discal: síntomas, diagnóstico y tratamiento",
    metaDescription:
      "Qué es una hernia discal, qué síntomas produce, cómo se confirma con resonancia y en qué casos se plantea la cirugía. Guía de columna en Lima.",
    h1: "Hernia discal",
    porQueElH1:
      "La keyword primaria va literal y sola. La SERP de Lima premia contenido informativo para esta búsqueda, y el título que mejor responde a alguien que escribe hernia discal es el nombre de lo que le pasa, sin adorno comercial delante.",
  },
  "/servicios/ortopedia-infantil": {
    title: "Ortopedia infantil en Lima: cuándo consultar",
    metaDescription:
      "Pie plano, displasia de cadera, desviaciones de la columna del niño y fracturas. Consulta de ortopedia infantil en Lima.",
    h1: "Ortopedia infantil: la consulta del niño",
    porQueElH1:
      "El title responde a la duda que trae al padre y el H1 aclara de quién es la consulta, que es la confusión más común de esta página.",
  },
};

/**
 * Title y meta de las 6 que declararon no competir.
 *
 * Sin keyword de posicionamiento, y no por descuido: el mapa midio que `/agendar` comparte 8
 * URLs del top 10 con la primaria de la home y `/contacto` comparte 6, asi que darles una
 * keyword montaria la canibalizacion que la fase 14 existio para cerrar, con la home de
 * victima. El motivo de cada una vive escrito en `motivoSinPrimaria` del mapa.
 */
const ESCRITOS_SIN_PRIMARIA: Readonly<Record<string, TextoEscrito>> = {
  "/agendar": {
    title: "Agendar una cita con el Dr. Angulo",
    metaDescription:
      "Cómo pedir cita en cada sede: WhatsApp para el consultorio de Surco y la central de citas de Ricardo Palma, Sanna y Tezza.",
  },
  "/blog": {
    title: "Blog del Dr. Juan Carlos Angulo",
    metaDescription:
      "Artículos sobre dolor de espalda, salud de la columna y qué esperar de una consulta, escritos por el Dr. Juan Carlos Angulo.",
  },
  "/contacto": {
    title: "Contacto con el consultorio del Dr. Angulo",
    metaDescription:
      "Cuéntale tu caso al doctor por el formulario o escribe por WhatsApp. Datos de contacto del consultorio en Lima.",
  },
  "/sedes": {
    title: "Dónde atiende el Dr. Juan Carlos Angulo en Lima",
    metaDescription:
      "Las cuatro sedes donde atiende el Dr. Juan Carlos Angulo: consultorio de Surco, Ricardo Palma, Sanna La Molina y Padre Luis Tezza.",
  },
  "/sobre-el-doctor": {
    title: "Sobre el Dr. Juan Carlos Angulo Totesaut",
    metaDescription:
      "Formación, forma de trabajo y sedes donde atiende el Dr. Juan Carlos Angulo Totesaut, médico de columna en Lima.",
  },
  "/testimonios": {
    title: "Testimonios de pacientes del Dr. Angulo",
    metaDescription:
      "Lo que cuentan, en sus propias palabras, los pacientes que se atendieron con el Dr. Juan Carlos Angulo en Lima.",
  },
};

const RUTA_ONPAGE_SERP = path.join(SEO_TOOLS_ROOT, "data", "onpage-serp.json");
const RUTA_COPY = path.join(SEO_TOOLS_ROOT, "data", "copy-guias.json");
const RUTA_SITE_CONFIG = path.join(REPO_ROOT, "src", "lib", "site-config.ts");

/** El H1 publicado de una URL, tal como esta en el arbol de la app. */
export interface H1Publicado {
  readonly texto: string;
  /** `archivo:linea` relativo a la raiz del repositorio. */
  readonly referencia: string;
}

/**
 * El texto de un H1 dentro de un archivo de la app, con la linea donde vive.
 *
 * Devuelve `null` cuando no hay `<h1>` o cuando lo que hay dentro no es texto plano. Una
 * expresion de JSX no se evalua aca a ciegas: adivinar el valor de `{titulo}` es fabricar un
 * dato, y una fila que dice "no lo pude leer" vale mas que una que miente con confianza.
 */
export function extraerH1(contenido: string): { texto: string; linea: number } | null {
  const encontrado = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(contenido);
  if (encontrado === null) return null;

  const crudo = (encontrado[1] as string).trim();
  if (crudo === "" || /[<{]/.test(crudo)) return null;

  const texto = crudo.replace(/\s+/g, " ");
  const desplazamiento = (encontrado[0] as string).indexOf(crudo);
  const linea = contenido.slice(0, encontrado.index + desplazamiento).split("\n").length;
  return { texto, linea };
}

/**
 * El valor de una clave de primer nivel de `src/lib/site-config.ts`.
 *
 * Solo la sangria de dos espacios, o sea el nivel de arriba: `name` aparece dos veces en ese
 * archivo y la segunda es el nombre de una sede. Cazar la primera coincidencia sin mirar la
 * sangria le pondria a `/sobre-el-doctor` el H1 equivocado la primera vez que alguien reordene
 * el objeto.
 */
export function claveDeSiteConfig(
  contenido: string,
  clave: string,
): { texto: string; linea: number } | null {
  const lineas = contenido.split("\n");
  for (let i = 0; i < lineas.length; i += 1) {
    const encontrado = new RegExp(`^ {2}${clave}: "(.+)",?$`).exec(lineas[i] as string);
    if (encontrado !== null) return { texto: encontrado[1] as string, linea: i + 1 };
  }
  return null;
}

/** Ruta del archivo de la app que renderiza una URL. Estatica, como el arbol de `src/app/`. */
export function archivoDeLaPagina(url: string): string {
  const cuerpo = url.replace(/^\/+|\/+$/g, "");
  return cuerpo === "" ? "src/app/page.tsx" : `src/app/${cuerpo}/page.tsx`;
}

/**
 * El H1 que la URL ya publica. SOLO LECTURA sobre `src/`: esta fase no escribe ahi ni una linea.
 *
 * Resuelve una referencia directa a `siteConfig.<clave>` porque `/sobre-el-doctor` publica su
 * H1 asi, y el texto existe y es conocido. Cualquier otra expresion se declara ausente.
 */
export function h1PublicadoDe(url: string): H1Publicado | null {
  const relativo = archivoDeLaPagina(url);
  let contenido: string;
  try {
    contenido = readFileSync(path.join(REPO_ROOT, relativo), "utf8");
  } catch {
    return null;
  }

  const encontrado = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(contenido);
  if (encontrado === null) return null;

  const plano = extraerH1(contenido);
  if (plano !== null) return { texto: plano.texto, referencia: `${relativo}:${plano.linea}` };

  const referencia = /^\{siteConfig\.(\w+)\}$/.exec((encontrado[1] as string).trim());
  if (referencia === null) return null;

  const valor = claveDeSiteConfig(readFileSync(RUTA_SITE_CONFIG, "utf8"), referencia[1] as string);
  if (valor === null) return null;
  return { texto: valor.texto, referencia: `src/lib/site-config.ts:${valor.linea}` };
}

export interface EntradaDeFila {
  readonly url: string;
  readonly accion: string;
  readonly keywordPrimaria: string | null;
  readonly redirigeA: string | null;
  readonly formato: string | null;
  readonly escrito: TextoEscrito | null;
  readonly h1Publicado: H1Publicado | null;
}

/** Falla si el title de una URL sin primaria se lleva la keyword primaria de otra. */
export function verificarQueNoRobaPrimaria(
  url: string,
  title: string,
  primarias: readonly string[],
): void {
  const titleNormal = normalizar(title);
  const robada = primarias.find((p) => titleNormal.includes(normalizar(p)));
  if (robada !== undefined) {
    throw new PaqueteInvalido(
      `${url}: el title contiene la keyword primaria "${robada}", que pertenece a otra URL.\n` +
        `  Esta URL declaro no competir en el mapa de la fase 14 y llevarse la primaria de otra\n` +
        `  por el title reintroduce la canibalizacion que ese mapa cerro.\n` +
        `  Title: "${title}"`,
    );
  }
}

/** Las 16 keywords primarias del mapa, en el orden del mapa. */
export function primariasDelMapa(): string[] {
  return filasDelMapa()
    .map((f) => f.keywordPrimaria)
    .filter((k): k is string => k !== null && k !== "");
}

/** Arma la fila de una URL segun cual de los tres grupos le toca. */
export function filaDeOnPage(entrada: EntradaDeFila, primarias: readonly string[] = []): FilaDeOnPage {
  const base = {
    url: entrada.url,
    accion: entrada.accion,
    keywordPrimaria: entrada.keywordPrimaria,
    redirigeA: entrada.redirigeA,
    formato: entrada.formato,
  };

  if (entrada.accion === "redirigir") {
    return {
      ...base,
      title: null,
      titleLargo: null,
      metaDescription: null,
      metaLargo: null,
      h1: null,
      h1Origen: null,
      origenDelH1:
        `La URL se apaga con un 301 hacia ${entrada.redirigeA ?? "su destino"} y no recibe ` +
        `title, meta ni H1 propios (D-07). El paquete que hay que implementar es el del destino.`,
      keywordAlFrente: null,
    };
  }

  if (entrada.escrito === null) {
    throw new PaqueteInvalido(
      `${entrada.url}: no hay title ni meta escritos para esta URL.\n` +
        `  Accion: agregarlos al mapa de metadatos.ts. Un blanco se lee como olvido.`,
    );
  }

  const escrito = entrada.escrito;

  if (entrada.keywordPrimaria !== null && entrada.keywordPrimaria !== "") {
    const medido = tituloYMeta({
      url: entrada.url,
      keywordPrimaria: entrada.keywordPrimaria,
      title: escrito.title,
      metaDescription: escrito.metaDescription,
      h1: escrito.h1 ?? "",
      h1Origen: escrito.porQueElH1 ?? "",
    });
    return {
      ...base,
      title: medido.title,
      titleLargo: medido.largoDeTitle,
      metaDescription: medido.metaDescription,
      metaLargo: medido.largoDeMeta,
      h1: medido.h1,
      h1Origen: "propuesto",
      origenDelH1: medido.h1Origen,
      keywordAlFrente: medido.primeraTokenEn,
    };
  }

  const title = escrito.title.trim();
  const metaDescription = escrito.metaDescription.trim();
  if (title.length > LARGO_DE_TITLE || metaDescription.length > LARGO_DE_META) {
    throw new PaqueteInvalido(
      `${entrada.url}: title de ${title.length} y meta de ${metaDescription.length}, contra el ` +
        `contrato de ${LARGO_DE_TITLE} y ${LARGO_DE_META} de la fase 10 de v1.1 (D-13).`,
    );
  }
  verificarQueNoRobaPrimaria(entrada.url, title, primarias);

  const publicado = entrada.h1Publicado;
  return {
    ...base,
    title,
    titleLargo: title.length,
    metaDescription,
    metaLargo: metaDescription.length,
    h1: publicado === null ? null : publicado.texto,
    h1Origen: publicado === null ? "ausente-en-el-sitio" : "publicado",
    origenDelH1:
      publicado === null
        ? `No hay un H1 de texto plano en ${archivoDeLaPagina(entrada.url)}. Esta URL declaro ` +
          `no competir, asi que no se le propone uno: se deja constancia de que falta y lo ` +
          `decide quien publique.`
        : `Transcrito del sitio publicado, sin cambiarlo: la URL declaro no competir en la ` +
          `fase 14 y proponerle un H1 nuevo reabriria esa decision sin dato nuevo. ` +
          `${publicado.referencia}`,
    keywordAlFrente: null,
  };
}

interface PaginaRedactada {
  readonly url: string;
  readonly title: string;
  readonly metaDescription: string;
  readonly h1: string;
}

export function copyRedactado(): readonly PaginaRedactada[] {
  const crudo = JSON.parse(readFileSync(RUTA_COPY, "utf8")) as {
    readonly paginas?: readonly PaginaRedactada[];
  };
  const paginas: readonly PaginaRedactada[] = Array.isArray(crudo) ? crudo : (crudo.paginas ?? []);
  return paginas.map((p) => ({
    url: p.url,
    title: p.title,
    metaDescription: p.metaDescription,
    h1: p.h1,
  }));
}

function formatosPorUrl(): Map<string, string> {
  const crudo = JSON.parse(readFileSync(RUTA_ONPAGE_SERP, "utf8")) as {
    readonly urls: readonly { readonly url: string; readonly formato: string }[];
  };
  return new Map(crudo.urls.map((u) => [u.url, u.formato]));
}

export interface OnPage {
  readonly schema: number;
  readonly generadoDesde: readonly string[];
  readonly resumen: Readonly<Record<string, number>>;
  readonly filas: readonly FilaDeOnPage[];
}

/**
 * El mapa de title, meta y H1 de las 24 filas.
 *
 * Determinista: recorre el mapa en el orden del archivo, no lee el reloj y no consulta la red.
 * Coste de cuota: cero.
 */
export function construirOnPage(): OnPage {
  const mapa = filasDelMapa();
  const formatos = formatosPorUrl();
  const primarias = mapa
    .map((f) => f.keywordPrimaria)
    .filter((k): k is string => k !== null && k !== "");

  const filas = mapa.map((fila) =>
    filaDeOnPage(
      {
        url: fila.url,
        accion: fila.accion,
        keywordPrimaria: fila.keywordPrimaria,
        redirigeA: fila.redirigeA,
        formato: formatos.get(fila.url) ?? null,
        escrito: ESCRITOS_CON_PRIMARIA[fila.url] ?? ESCRITOS_SIN_PRIMARIA[fila.url] ?? null,
        h1Publicado:
          fila.keywordPrimaria === null && fila.accion !== "redirigir"
            ? h1PublicadoDe(fila.url)
            : null,
      },
      primarias,
    ),
  );

  const resumen: Record<string, number> = {};
  for (const fila of filas) resumen[fila.accion] = (resumen[fila.accion] ?? 0) + 1;

  return {
    schema: 1,
    generadoDesde: [
      "seo-tools/data/url-map.jsonl (fase 14, solo lectura)",
      "seo-tools/data/onpage-serp.json (plan 15-01)",
      "src/ del sitio publicado, solo lectura, para los H1 de las 6 que no compiten",
    ],
    resumen: {
      filas: filas.length,
      conPrimaria: filas.filter((f) => f.keywordPrimaria !== null).length,
      ...resumen,
    },
    filas,
  };
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase15/metadatos.ts --out data/onpage.json
//
// COSTE DE CUOTA: CERO. No sale a la red por ningun camino.

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const destino = textoObligatorio(banderas, "out");

  const onpage = construirOnPage();
  const ruta = path.isAbsolute(destino) ? destino : path.join(SEO_TOOLS_ROOT, destino);
  writeFileSync(ruta, `${JSON.stringify(onpage, null, 2)}\n`, "utf8");

  const out = process.stdout;
  out.write(`Metadata de ${onpage.filas.length} URLs\n`);
  for (const [clave, valor] of Object.entries(onpage.resumen)) {
    out.write(`  ${clave.padEnd(18)}${valor}\n`);
  }
  out.write(`\nEscrito: ${ruta}\n`);
  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("metadatos.ts")) {
  ejecutar(main);
}

