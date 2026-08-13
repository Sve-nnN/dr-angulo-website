/**
 * Jerarquia H2/H3 y entidades obligatorias de las 16 URLs, desde las capturas ya pagadas
 * (ONPAGE-02 y ONPAGE-03).
 *
 * COSTE DE CUOTA: CERO (D-01). Todo sale de `.cache/serpapi/` leido con `offline: true`, que
 * convierte un fallo de cache en error duro en vez de en un gasto silencioso. Quedan 6
 * busquedas hasta el reset del 2026-08-21 y no son de esta fase.
 *
 * LA DECISION DE FORMA QUE GOBIERNA TODO EL MODULO: el indice de una pagina lo manda el
 * esqueleto y no la lista de keywords. Las preguntas de la SERP entran como H3 debajo de la
 * seccion que las responde, no como H2 sueltos. La diferencia se ve al abrir el documento:
 * con preguntas al nivel de las secciones, el indice de una guia clinica queda como una
 * columna de interrogantes en la que nadie encuentra el orden del recorrido del paciente; con
 * las preguntas debajo de su seccion, se lee el recorrido y ademas se ve, literal, el lenguaje
 * con el que la gente pregunta. El plan pedia nivel 2 para las preguntas; se ejecuta con
 * nivel 3 y queda anotado como desvio para que Juan lo juzgue sobre el documento real.
 *
 * De las ocho busquedas relacionadas de cada captura, la mayoria es la primaria mas una
 * palabra, o sea la seccion que el esqueleto ya trae. Emitirlas igual convertiria el indice en
 * la lista de keywords pegadas que el checkpoint viene justamente a rechazar. Se miran una por
 * una y el resultado queda en `coberturaDeRelacionadas`: la que ya estaba cubierta dice quien
 * la cubre, y la que aporta un subtema nuevo si sale como H3.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT, destinoPermitido } from "../config.js";
import { ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { leerSerp } from "../phase13/serp.js";
import {
  MAXIMO_DE_TERMINOS,
  MINIMO_DE_TERMINOS,
  UMBRAL_MINIMO,
  UMBRAL_POR_DEFECTO,
  entidadesDelTop10,
  normalizar,
  tokenizar,
} from "./entidades.js";
import type {
  CoberturaDeRelacionada,
  CoberturaDeSecundaria,
  EntidadObligatoria,
  FormatoDePagina,
  JerarquiaDeUrl,
  PreguntaSinUsar,
} from "./model.js";

const RUTA_MAPA = path.join(SEO_TOOLS_ROOT, "data", "url-map.jsonl");

/** Un hueco del esqueleto: el H2 y el vocabulario que lo hace duenio de un subtema. */
interface HuecoDeEsqueleto {
  readonly clave: string;
  /** `{tema}` se reemplaza por la primaria con su articulo. Los demas no llevan plantilla. */
  readonly titulo: string;
  readonly conceptos: readonly string[];
}

/**
 * Guia clinica: el recorrido que hace un paciente, en ese orden y no en otro.
 *
 * Primero entiende que le pasa, despues reconoce lo que siente, despues quiere saber por que,
 * y recien ahi le interesa como se confirma y que se puede hacer. Poner la cirugia antes que
 * el manejo conservador invertiria el orden real del tratamiento y le daria a la pagina un
 * sesgo quirurgico que el contenido no tiene.
 */
const GUIA_CLINICA: readonly HuecoDeEsqueleto[] = [
  {
    clave: "que-es",
    // El vocabulario anatomico NO esta en la lista a proposito, aunque este hueco sea el que
    // lo explica. "Cuales son los sintomas de una hernia de DISCO" nombra el disco y no
    // pregunta por el: si `disco` puntuara aca, la pregunta de sintomas caeria en la seccion
    // que define. Lo anatomico llega igual, por el desvio por defecto, que apunta aca.
    titulo: "Qué es {tema}",
    conceptos: [
      "significa", "definicion", "definir", "tipo", "tipos", "grado", "grados", "clasificacion",
      "pasa", "consiste", "anatomia", "gravedad", "peligrosa", "peligroso",
    ],
  },
  {
    clave: "sintomas",
    titulo: "Qué síntomas produce",
    conceptos: [
      "sintoma", "sintomas", "duele", "dolor", "molestia", "molestias", "hormigueo",
      "adormecimiento", "debilidad", "senales", "siente", "reconocer", "distinguir",
      "diferenciar", "grave", "graves", "ciatica", "lumbalgia", "irradiado", "pierna", "brazo",
      "falsa", "espina",
    ],
  },
  {
    clave: "causas",
    titulo: "Por qué aparece",
    conceptos: [
      "causa", "causas", "origen", "provoca", "produce", "aparece", "factores", "riesgo",
      "evitar", "prevenir", "desgaste", "edad", "postura", "peso", "esfuerzo", "frenar",
      "empeora", "avanza",
    ],
  },
  {
    clave: "diagnostico",
    titulo: "Cómo se confirma el diagnóstico",
    conceptos: [
      "diagnostico", "diagnostica", "resonancia", "tomografia", "radiografia", "estudio",
      "estudios", "imagen", "imagenes", "confirma", "detecta", "examen", "prueba", "pruebas",
      "electromiografia", "placa",
    ],
  },
  {
    clave: "sin-operar",
    titulo: "Qué se puede hacer sin operar",
    conceptos: [
      "tratamiento", "tratamientos", "cura", "curar", "desinflamar", "alivio", "aliviar",
      "medicamento", "medicamentos", "pastillas", "antiinflamatorio", "esteroideo", "terapia",
      "fisioterapia", "rehabilitacion", "ejercicio", "ejercicios", "conservador", "reposo",
      "remedio", "remedios", "cuidado", "cuidados", "infiltracion", "personal",
    ],
  },
  {
    clave: "cirugia",
    titulo: "Cuándo hace falta operar",
    conceptos: [
      "cirugia", "operar", "operarse", "operacion", "opera", "quirurgico", "quirurgica",
      "endoscopica", "endoscopia", "invasiva", "quirofano", "discectomia", "artrodesis",
      "laminectomia", "protesis", "dormir", "recuperacion", "postoperatorio", "riesgos",
    ],
  },
  { clave: "preguntas-frecuentes", titulo: "Preguntas frecuentes", conceptos: [] },
  {
    clave: "cuando-consultar",
    titulo: "Cuándo consultar",
    conceptos: [
      "consultar", "especialista", "traumatologo", "reumatologo", "neurocirujano", "medico",
      "acudir", "urgencia", "emergencia", "evaluacion", "opinion", "consulta",
    ],
  },
];

const PAGINA_DE_SERVICIO: readonly HuecoDeEsqueleto[] = [
  {
    clave: "que-se-atiende",
    titulo: "Qué se atiende",
    conceptos: [
      "atiende", "atencion", "servicio", "servicios", "especialidad", "especialidades",
      "especialista", "especialistas", "traumatologia", "ortopedia", "ortopedista",
      "ortopedistas", "cirujano", "cirujanos", "traumatologo", "traumatologos", "neurocirujano",
      "neurocirujanos", "invasiva", "minima", "endoscopica", "espinal", "opera",
      "operan", "llama", "nombre", "hace", "staff", "equipo", "medicos", "profesional",
    ],
  },
  {
    clave: "como-es-la-consulta",
    titulo: "Cómo es la consulta",
    conceptos: [
      "consulta", "evaluacion", "examen", "cita", "estudios", "resonancia", "diagnostico",
      "dura", "acompanante", "informe", "ventajas", "desventajas", "riesgos", "beneficios",
      "recuperacion", "postoperatorio", "anestesia",
    ],
  },
  {
    clave: "condiciones",
    titulo: "Qué condiciones se tratan",
    conceptos: [
      "hernia", "escoliosis", "estenosis", "artrosis", "lumbalgia", "ciatica", "fractura",
      "deformidad", "deformidades", "condicion", "condiciones", "patologia", "patologias",
      "enfermedad", "enfermedades", "infantil", "nino", "ninos", "pediatria", "cadera", "pie",
      "rodilla", "hombro", "mano", "tobillo", "codo", "pies", "displasia",
    ],
  },
  {
    clave: "donde-se-atiende",
    titulo: "Dónde se atiende",
    conceptos: [
      "sede", "sedes", "clinica", "direccion", "surco", "molina", "isidro", "borja", "peru",
      "ubicacion", "consultorio", "tezza", "sanna", "palma", "distrito",
    ],
  },
  {
    clave: "como-agendar",
    titulo: "Cómo agendar una cita",
    conceptos: [
      "agendar", "citas", "reservar", "programar", "sacar", "pedir", "solicitar", "whatsapp",
      "horario", "horarios", "precio", "precios", "costo", "costos", "cuesta", "cuestan",
      "cobran", "vale", "valer", "cuanto", "tarifa", "seguro", "seguros", "planes", "pago",
    ],
  },
];

const FICHA_DE_SEDE: readonly HuecoDeEsqueleto[] = [
  {
    clave: "donde-queda",
    titulo: "Dónde queda",
    conceptos: [
      "direccion", "ubicacion", "queda", "surco", "molina", "isidro", "borja", "avenida",
      "calle", "piso", "consultorio", "sede", "distrito", "referencia",
    ],
  },
  {
    clave: "como-llegar",
    titulo: "Cómo llegar",
    conceptos: ["llegar", "estacionamiento", "transporte", "mapa", "ruta", "cerca", "movilidad"],
  },
  {
    clave: "que-se-atiende",
    titulo: "Qué se atiende ahí",
    conceptos: [
      "atiende", "servicio", "servicios", "cirujano", "cirujanos", "traumatologo",
      "traumatologos", "neurocirujano", "neurocirujanos", "ortopedia", "ortopedista",
      "ortopedistas", "hernia", "escoliosis", "estenosis", "especialista",
      "especialistas", "especialidad", "especialidades", "traumatologia", "opera", "operan",
      "operacion", "llama", "nombre", "staff", "equipo", "medicos", "ofrece", "ofrecen",
    ],
  },
  {
    clave: "horarios",
    titulo: "Horarios de atención",
    conceptos: ["horario", "horarios", "atencion", "hora", "horas", "sabado", "domingo", "turno"],
  },
  {
    clave: "como-agendar",
    titulo: "Cómo agendar una cita",
    conceptos: [
      "agendar", "cita", "citas", "reservar", "programar", "sacar", "pedir", "solicitar",
      "whatsapp", "precio", "precios", "costo", "costos", "cuesta", "cuestan", "cobran", "vale",
      "valer", "cuanto", "seguro", "seguros", "planes", "pago", "tarifa",
    ],
  },
];

const ESQUELETOS: Readonly<Record<FormatoDePagina, readonly HuecoDeEsqueleto[]>> = {
  "guia-clinica": GUIA_CLINICA,
  "pagina-de-servicio": PAGINA_DE_SERVICIO,
  "ficha-de-sede": FICHA_DE_SEDE,
};

/**
 * Donde cae lo que no comparte vocabulario con ningun hueco.
 *
 * No es el primer hueco de la lista: en una ficha de sede el primero es la direccion, y mandar
 * ahi una keyword sin clasificar la pondria a hablar de calles. El desvio va a la seccion que
 * describe, que es la que puede absorber cualquier cosa sin mentir.
 */
const DESVIO_POR_DEFECTO: Readonly<Record<FormatoDePagina, string>> = {
  "guia-clinica": "que-es",
  "pagina-de-servicio": "que-se-atiende",
  "ficha-de-sede": "que-se-atiende",
};

/**
 * Minimo de palabras por URL. Es contrato de D-05 contra la tentacion de entregar esquema.
 *
 * Las dos guias que absorben un post del blog llevan 1400 y no 1200 porque el material fundido
 * tiene que caber adentro: primero se funde y despues se redirige, o el contenido se tira.
 */
const MINIMO_DE_PALABRAS: Readonly<Record<string, number>> = {
  "/servicios/hernia-discal": 1400,
  "/servicios/estenosis-espinal": 1400,
  "/servicios/escoliosis-y-deformidades": 1200,
  "/preguntas-frecuentes": 800,
  "/": 600,
  "/servicios": 700,
  "/servicios/ortopedia-infantil": 700,
  "/servicios/cirugia-minimamente-invasiva": 700,
  "/sedes/clinica-ricardo-palma": 500,
  "/sedes/clinica-tezza": 500,
  "/sedes/consultorio-privado": 500,
  "/sedes/sanna-la-molina": 500,
  "/blog/artrosis": 900,
  "/blog/lumbalgia": 900,
  "/blog/5-sintomas-de-columna-que-no-debes-ignorar": 900,
  "/blog/miedo-a-operarte-de-la-columna-5-cosas-que-debes-saber": 900,
};

/** Tipos de la fase 13 cuyo top 10 es contenido informativo y por eso exigen guia. */
const TIPOS_DE_GUIA = new Set(["guia", "contenido-internacional"]);

/**
 * Formato del molde con el que se escribe la pagina.
 *
 * Lo decide la SERP y no la carpeta: `/servicios/estenosis-espinal` vive en `/servicios/` y su
 * top 10 es 8 de 8 contenido informativo, asi que se escribe como guia clinica. El prefijo de
 * sede es lo unico que la SERP no puede decidir, porque el top 10 de "cirujano de columna
 * clinica ricardo palma" no distingue una ficha de sede de una pagina de servicio: los dos
 * moldes rankean igual ahi. Ese reparto lo hace la URL y esta escrito para que se vea.
 */
export function formatoDe(url: string, tipoExigidoPorSerp: string): FormatoDePagina {
  if (TIPOS_DE_GUIA.has(tipoExigidoPorSerp)) return "guia-clinica";
  if (url.startsWith("/sedes/")) return "ficha-de-sede";
  return "pagina-de-servicio";
}

const MINIMO_POR_FORMATO: Readonly<Record<FormatoDePagina, number>> = {
  "guia-clinica": 900,
  "pagina-de-servicio": 600,
  "ficha-de-sede": 500,
};

export function minimoDePalabrasDe(url: string, formato: FormatoDePagina): number {
  return MINIMO_DE_PALABRAS[url] ?? MINIMO_POR_FORMATO[formato];
}

/**
 * Articulo de una frase, por la terminacion de su primera palabra.
 *
 * Sirve para escribir "Que es la hernia discal" y no "Que es hernia discal". Acierta en las
 * ocho guias de la fase porque sus primarias son femeninas en siete casos y masculina en uno,
 * y las tres terminaciones que decide eso en espanol clinico son -a, -sis y -cion.
 */
export function articuloDe(frase: string): string {
  const primera = tokenizar(frase)[0] ?? "";
  if (primera.endsWith("as")) return "las";
  if (primera.endsWith("os")) return "los";
  if (
    primera.endsWith("a") ||
    primera.endsWith("sis") ||
    primera.endsWith("cion") ||
    primera.endsWith("sion") ||
    primera.endsWith("dad") ||
    primera.endsWith("tis")
  ) {
    return "la";
  }
  return "el";
}

function mayuscula(frase: string): string {
  return frase.length === 0 ? frase : frase[0]!.toUpperCase() + frase.slice(1);
}

/**
 * Baja la inicial de una frase que pasa a ir en medio de un encabezado.
 *
 * Las busquedas relacionadas llegan con la inicial en mayuscula porque asi las escribe Google.
 * Sin esto sale "Sintomas de la Hernia discal lumbar", con una mayuscula en el medio que se
 * lee como error de tipeo. Solo toca el primer caracter: un nombre propio de mas adentro,
 * como Ricardo Palma, se conserva.
 */
function minuscula(frase: string): string {
  return frase.length === 0 ? frase : frase[0]!.toLowerCase() + frase.slice(1);
}

/**
 * Verbos que pueden abrir la cola de una keyword.
 *
 * Sin esta lista sale "Medicamento para el desinflamar hernia discal": el articulo se cuela
 * delante de un infinitivo. Es una lista corta y explicita a proposito, porque la regla
 * morfologica de terminar en -ar tambien caza `lumbar`.
 */
const INFINITIVOS = new Set([
  "desinflamar", "aliviar", "curar", "prevenir", "tratar", "operar", "dormir", "evitar",
  "frenar", "mejorar", "fortalecer", "estirar", "caminar", "levantar", "detectar", "quitar",
]);

const ARTICULOS = new Set(["el", "la", "los", "las", "un", "una", "unos", "unas"]);

/**
 * Formato de archivo pedido en la busqueda, que no es un subtema de la pagina.
 *
 * "artrosis pdf" no pide que la pagina hable de otra cosa: pide un archivo. Sin este filtro
 * sale un encabezado que dice "Artrosis PDF" en una guia clinica publicada.
 */
const RUIDO_DE_FORMATO = new Set([
  "pdf", "ppt", "doc", "docx", "descargar", "video", "videos", "foto", "fotos", "imagenes",
  "gratis", "online", "wikipedia", "slideshare", "scielo", "pubmed",
]);

/** El articulo que le falta a una cola, o nada si ya lo trae o si abre con un infinitivo. */
function articuloPara(cola: string, primerToken: string): string {
  if (ARTICULOS.has(primerToken) || INFINITIVOS.has(primerToken)) return "";
  return `${articuloDe(cola)} `;
}

/** Palabras que, al frente o al final de una keyword, dicen que clase de seccion pide. */
const MODIFICADORES_DE = new Set([
  "tratamiento", "tratamientos", "sintomas", "causas", "cirugia", "diagnostico", "riesgos",
]);
const MODIFICADORES_PARA = new Set([
  "medicamento", "medicamentos", "pastillas", "ejercicios", "remedios",
]);
const ESTUDIOS = new Set(["tomografia", "resonancia", "radiografia", "electromiografia"]);

function limpiar(palabra: string): string {
  return palabra.replace(/^[\s:,;.]+|[\s:,;.]+$/g, "");
}

/**
 * Escribe una keyword como encabezado de pagina.
 *
 * Sin esto el indice queda como "Hernia discal lumbosacra tratamiento", que es la keyword
 * cruda y se lee como tal. El checkpoint de este plan pregunta exactamente eso: si la
 * jerarquia se lee como el indice de una pagina real o como una lista de keywords pegadas.
 */
export function encabezadoDesdeKeyword(keyword: string): string {
  const crudas = keyword.split(/\s+/).map(limpiar).filter((p) => p !== "");
  const normales = crudas.map((p) => normalizar(p));

  const donde = normales.indexOf("o");
  if (donde > 0 && donde < normales.length - 1) {
    const izquierda = crudas.slice(0, donde).join(" ");
    const derecha = crudas.slice(donde + 1).join(" ");
    return `Diferencia entre ${izquierda} y ${derecha}`;
  }

  const ultima = normales[normales.length - 1] as string;
  const cabeza = mayuscula(crudas[crudas.length - 1] as string);
  const resto = minuscula(crudas.slice(0, -1).join(" "));
  if (resto !== "" && ESTUDIOS.has(ultima)) {
    return `${mayuscula(resto)} en la ${minuscula(crudas[crudas.length - 1] as string)}`;
  }
  if (resto !== "" && MODIFICADORES_DE.has(ultima)) {
    return `${cabeza} de ${articuloPara(resto, normales[0] as string)}${resto}`;
  }
  if (resto !== "" && MODIFICADORES_PARA.has(ultima)) {
    return `${cabeza} para ${articuloPara(resto, normales[0] as string)}${resto}`;
  }

  const primera = normales[0] as string;
  const enlace = normales[1];
  if (
    crudas.length >= 3 &&
    (enlace === "de" || enlace === "para") &&
    (MODIFICADORES_DE.has(primera) || MODIFICADORES_PARA.has(primera))
  ) {
    const cola = minuscula(crudas.slice(2).join(" "));
    const articulo = articuloPara(cola, normales[2] as string);
    return `${mayuscula(crudas[0] as string)} ${enlace} ${articulo}${cola}`;
  }

  return mayuscula(crudas.join(" "));
}

/** Palabras de una frase que aportan tema, sin las de la primaria ni el formato pedido. */
function residuo(frase: string, primaria: ReadonlySet<string>): string[] {
  const fuera = new Set<string>();
  return tokenizar(frase).filter((t) => {
    if (primaria.has(t) || fuera.has(t) || t.length < 3) return false;
    if (RUIDO_DE_FORMATO.has(t)) return false;
    fuera.add(t);
    return true;
  });
}

function puntaje(tokens: readonly string[], hueco: HuecoDeEsqueleto): number {
  const conceptos = new Set(hueco.conceptos);
  return tokens.filter((t) => conceptos.has(t)).length;
}

/** El hueco que mas conceptos comparte. `null` cuando no comparte ninguno. */
function mejorHueco(
  tokens: readonly string[],
  esqueleto: readonly HuecoDeEsqueleto[],
): HuecoDeEsqueleto | null {
  let mejor: HuecoDeEsqueleto | null = null;
  let mejorPuntaje = 0;
  for (const hueco of esqueleto) {
    const p = puntaje(tokens, hueco);
    if (p > mejorPuntaje) {
      mejor = hueco;
      mejorPuntaje = p;
    }
  }
  return mejor;
}

export interface EntradaDeJerarquia {
  readonly keywordPrimaria: string;
  readonly formato: FormatoDePagina;
  readonly secundarias: readonly string[];
  readonly preguntas: readonly string[];
  readonly relacionadas: readonly string[];
}

export interface ResultadoDeJerarquia {
  readonly jerarquia: readonly JerarquiaDeUrl[];
  readonly preguntasSinUsar: readonly PreguntaSinUsar[];
  readonly coberturaDeSecundarias: readonly CoberturaDeSecundaria[];
  readonly coberturaDeRelacionadas: readonly CoberturaDeRelacionada[];
}

interface Emitido {
  readonly encabezado: JerarquiaDeUrl;
  readonly tokens: ReadonlySet<string>;
}

/**
 * Jerarquia H2/H3 de una URL, cruzando el esqueleto de su formato con lo que dice su SERP.
 *
 * Determinista: el orden es esqueleto, despues preguntas, despues secundarias, despues
 * relacionadas, y dentro de cada grupo el orden de entrada. No hay ningun Set recorrido para
 * decidir posiciones ni ninguna marca de tiempo.
 */
export function jerarquiaDe(entrada: EntradaDeJerarquia): ResultadoDeJerarquia {
  const esqueleto = ESQUELETOS[entrada.formato];
  const desvio =
    esqueleto.find((h) => h.clave === DESVIO_POR_DEFECTO[entrada.formato]) ??
    (esqueleto[0] as HuecoDeEsqueleto);
  const primaria = new Set(tokenizar(entrada.keywordPrimaria));
  const tema = `${articuloDe(entrada.keywordPrimaria)} ${entrada.keywordPrimaria}`;

  const porHueco = new Map<string, Emitido[]>();
  const cabeceras = new Map<string, JerarquiaDeUrl>();

  for (const hueco of esqueleto) {
    const encabezado: JerarquiaDeUrl = {
      nivel: 2,
      texto: hueco.titulo.replace("{tema}", tema),
      origen: "esqueleto",
      literal: null,
      seccion: hueco.clave,
    };
    cabeceras.set(hueco.clave, encabezado);
    porHueco.set(hueco.clave, []);
  }

  const agregar = (hueco: HuecoDeEsqueleto, encabezado: JerarquiaDeUrl): void => {
    porHueco.get(hueco.clave)?.push({ encabezado, tokens: new Set(tokenizar(encabezado.texto)) });
  };

  /** Encabezado ya emitido que contiene todas las palabras de tema de una frase. */
  const yaCubierta = (tokens: readonly string[]): JerarquiaDeUrl | null => {
    if (tokens.length === 0) return cabeceras.get(desvio.clave) ?? null;
    for (const hueco of esqueleto) {
      const cabecera = cabeceras.get(hueco.clave) as JerarquiaDeUrl;
      const candidatos: Emitido[] = [
        { encabezado: cabecera, tokens: new Set(tokenizar(cabecera.texto)) },
        ...(porHueco.get(hueco.clave) ?? []),
      ];
      for (const c of candidatos) {
        if (tokens.every((t) => c.tokens.has(t))) return c.encabezado;
      }
    }
    return null;
  };

  const preguntasSinUsar: PreguntaSinUsar[] = [];
  for (const pregunta of entrada.preguntas) {
    const tokens = residuo(pregunta, primaria);
    // Una pregunta cuyo residuo queda vacio es la keyword primaria vuelta a preguntar, asi
    // que la responde la pagina entera. Va al desvio, que es la seccion que describe.
    const hueco = tokens.length === 0 ? desvio : mejorHueco(tokens, esqueleto);
    const faq = esqueleto.find((h) => h.clave === "preguntas-frecuentes");
    const destino = hueco ?? faq ?? null;
    if (destino === null) {
      preguntasSinUsar.push({
        pregunta,
        motivo:
          `Pregunta por ${tokens.join(", ")}, que no es tema de ninguna seccion del molde de ` +
          `${entrada.formato}, y este molde no abre bloque de preguntas frecuentes. Forzarla ` +
          `inventaria una seccion que la SERP no pidio.`,
      });
      continue;
    }
    agregar(destino, {
      nivel: 3,
      texto: pregunta,
      origen: "pregunta-serp",
      literal: pregunta,
      seccion: destino.clave,
    });
  }

  const coberturaDeSecundarias: CoberturaDeSecundaria[] = [];
  for (const secundaria of entrada.secundarias) {
    const tokens = residuo(secundaria, primaria);
    const cubierta = yaCubierta(tokens);
    if (cubierta !== null) {
      coberturaDeSecundarias.push({ keyword: secundaria, cubiertaPor: cubierta.texto });
      continue;
    }
    const destino = mejorHueco(tokens, esqueleto) ?? desvio;
    const encabezado: JerarquiaDeUrl = {
      nivel: 3,
      texto: encabezadoDesdeKeyword(secundaria),
      origen: "secundaria-del-mapa",
      literal: secundaria,
      seccion: destino.clave,
    };
    agregar(destino, encabezado);
    coberturaDeSecundarias.push({ keyword: secundaria, cubiertaPor: encabezado.texto });
  }

  const coberturaDeRelacionadas: CoberturaDeRelacionada[] = [];
  for (const relacionada of entrada.relacionadas) {
    const tokens = residuo(relacionada, primaria);
    const cubierta = yaCubierta(tokens);
    if (cubierta !== null) {
      coberturaDeRelacionadas.push({ busqueda: relacionada, cubiertaPor: cubierta.texto });
      continue;
    }
    const destino = mejorHueco(tokens, esqueleto);
    if (destino !== null && tokens.every((t) => destino.conceptos.includes(t))) {
      coberturaDeRelacionadas.push({
        busqueda: relacionada,
        cubiertaPor: (cabeceras.get(destino.clave) as JerarquiaDeUrl).texto,
      });
      continue;
    }
    const hueco = destino ?? desvio;
    const encabezado: JerarquiaDeUrl = {
      nivel: 3,
      texto: encabezadoDesdeKeyword(relacionada),
      origen: "busqueda-relacionada",
      literal: relacionada,
      seccion: hueco.clave,
    };
    agregar(hueco, encabezado);
    coberturaDeRelacionadas.push({ busqueda: relacionada, cubiertaPor: encabezado.texto });
  }

  const jerarquia: JerarquiaDeUrl[] = [];
  for (const hueco of esqueleto) {
    jerarquia.push(cabeceras.get(hueco.clave) as JerarquiaDeUrl);
    for (const emitido of porHueco.get(hueco.clave) ?? []) jerarquia.push(emitido.encabezado);
  }

  return { jerarquia, preguntasSinUsar, coberturaDeSecundarias, coberturaDeRelacionadas };
}

// ---------------------------------------------------------------------------
// Dataset de las 16
// ---------------------------------------------------------------------------

export interface FilaDelMapa {
  readonly url: string;
  readonly keywordPrimaria: string | null;
  readonly keywordPrimariaKey: string | null;
  readonly secundarias?: readonly string[];
  readonly tipoExigidoPorSerp: string;
  readonly accion: string;
  readonly redirigeA: string | null;
  /** Por que la URL no compite, escrito en la fase 14. Solo lo traen las 8 sin primaria. */
  readonly motivoSinPrimaria?: string | null;
}

/** Las 24 filas del mapa de la fase 14. SOLO LECTURA en toda la fase 15 (D-15). */
export function filasDelMapa(rutaArchivo: string = RUTA_MAPA): FilaDelMapa[] {
  let crudo: string;
  try {
    crudo = readFileSync(rutaArchivo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer ${rutaArchivo}.\n` +
        `  Accion: es el mapa keyword-URL de la fase 14 y esta fase solo lo lee.`,
    );
  }
  return crudo
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l) => JSON.parse(l) as FilaDelMapa);
}

export interface UrlOnPage {
  readonly url: string;
  readonly keywordPrimaria: string;
  readonly keywordPrimariaKey: string;
  readonly formato: FormatoDePagina;
  readonly minimoDePalabras: number;
  readonly posicionesMedidas: number;
  readonly jerarquia: readonly JerarquiaDeUrl[];
  readonly entidades: readonly EntidadObligatoria[];
  readonly entidadesInsuficientes: boolean;
  readonly umbralAplicado: number;
  readonly coberturaDeSecundarias: readonly CoberturaDeSecundaria[];
  readonly coberturaDeRelacionadas: readonly CoberturaDeRelacionada[];
  readonly preguntasSinUsar: readonly PreguntaSinUsar[];
  readonly fuente: {
    readonly keyword: string;
    readonly organicos: number;
    readonly preguntas: number;
    readonly relacionadas: number;
    readonly capturadaEn: string | null;
  };
}

export interface OnPageSerp {
  readonly schema: number;
  readonly umbrales: {
    readonly porDefecto: number;
    readonly minimo: number;
    readonly minimoDeTerminos: number;
    readonly maximoDeTerminos: number;
  };
  readonly urls: readonly UrlOnPage[];
  readonly sinCaptura: readonly string[];
  readonly resumen: {
    readonly urls: number;
    readonly porFormato: Readonly<Record<string, number>>;
    readonly entidadesInsuficientes: number;
    readonly secundariasSinCubrir: number;
    readonly preguntasSinUsar: number;
  };
}

/** Arma la fila completa de una URL. Lee la captura offline: una ausente falla, no gasta. */
export async function filaOnPageDe(fila: FilaDelMapa): Promise<UrlOnPage> {
  const keyword = fila.keywordPrimaria as string;
  const serp = await leerSerp(keyword, { offline: true });
  const formato = formatoDe(fila.url, fila.tipoExigidoPorSerp);
  const entidades = entidadesDelTop10(serp);
  const jerarquia = jerarquiaDe({
    keywordPrimaria: keyword,
    formato,
    secundarias: fila.secundarias ?? [],
    preguntas: serp.preguntas,
    relacionadas: serp.relacionadas,
  });

  return {
    url: fila.url,
    keywordPrimaria: keyword,
    keywordPrimariaKey: fila.keywordPrimariaKey as string,
    formato,
    minimoDePalabras: minimoDePalabrasDe(fila.url, formato),
    posicionesMedidas: serp.organicos.length,
    jerarquia: jerarquia.jerarquia,
    entidades: entidades.entidades,
    entidadesInsuficientes: entidades.entidadesInsuficientes,
    umbralAplicado: entidades.umbralAplicado,
    coberturaDeSecundarias: jerarquia.coberturaDeSecundarias,
    coberturaDeRelacionadas: jerarquia.coberturaDeRelacionadas,
    preguntasSinUsar: jerarquia.preguntasSinUsar,
    fuente: {
      keyword,
      organicos: serp.organicos.length,
      preguntas: serp.preguntas.length,
      relacionadas: serp.relacionadas.length,
      capturadaEn: serp.capturadaEn,
    },
  };
}

export async function construirOnPageSerp(
  filas: readonly FilaDelMapa[] = filasDelMapa(),
): Promise<OnPageSerp> {
  const conPrimaria = filas.filter((f) => f.keywordPrimaria !== null && f.keywordPrimaria !== "");
  const urls: UrlOnPage[] = [];
  const sinCaptura: string[] = [];

  for (const fila of conPrimaria) {
    try {
      urls.push(await filaOnPageDe(fila));
    } catch (error) {
      // El motivo viaja con la URL: "sin captura" a secas rotula igual una consulta ausente en
      // modo offline que un JSON mal formado, y entonces la URL desaparece del dataset con una
      // explicacion que no es la suya.
      const motivo = error instanceof Error ? error.message : String(error);
      sinCaptura.push(`${fila.url} (${fila.keywordPrimaria ?? "sin keyword"}): ${motivo}`);
    }
  }

  const porFormato: Record<string, number> = {};
  for (const formato of ["guia-clinica", "pagina-de-servicio", "ficha-de-sede"] as const) {
    const n = urls.filter((u) => u.formato === formato).length;
    if (n > 0) porFormato[formato] = n;
  }

  return {
    schema: 1,
    umbrales: {
      porDefecto: UMBRAL_POR_DEFECTO,
      minimo: UMBRAL_MINIMO,
      minimoDeTerminos: MINIMO_DE_TERMINOS,
      maximoDeTerminos: MAXIMO_DE_TERMINOS,
    },
    urls,
    sinCaptura,
    resumen: {
      urls: urls.length,
      porFormato,
      entidadesInsuficientes: urls.filter((u) => u.entidadesInsuficientes).length,
      secundariasSinCubrir: urls.flatMap((u) =>
        u.coberturaDeSecundarias.filter((c) => !c.cubiertaPor),
      ).length,
      preguntasSinUsar: urls.flatMap((u) => u.preguntasSinUsar).length,
    },
  };
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------
//
//   cd seo-tools
//   ./node_modules/.bin/tsx src/phase15/serp-onpage.ts --out data/onpage-serp.json
//
// COSTE DE CUOTA: CERO. Todo sale de `.cache/serpapi/` en modo offline.

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const destino = texto(banderas, "out") ?? "data/onpage-serp.json";
  const absoluto = destinoPermitido(destino, SEO_TOOLS_ROOT);

  const dataset = await construirOnPageSerp();
  writeFileSync(absoluto, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");

  const out = process.stdout;
  out.write(`URLs con jerarquia y entidades: ${dataset.resumen.urls}\n`);
  for (const [formato, n] of Object.entries(dataset.resumen.porFormato)) {
    out.write(`  ${formato.padEnd(22)} ${String(n).padStart(3)}\n`);
  }
  out.write(`\nEntidades insuficientes:   ${dataset.resumen.entidadesInsuficientes}\n`);
  out.write(`Secundarias sin cubrir:    ${dataset.resumen.secundariasSinCubrir}\n`);
  out.write(`Preguntas sin usar:        ${dataset.resumen.preguntasSinUsar}\n`);
  if (dataset.sinCaptura.length > 0) {
    out.write(`\nURLs sin captura utilizable (${dataset.sinCaptura.length}):\n`);
    for (const u of dataset.sinCaptura) out.write(`  - ${u}\n`);
  }
  out.write(`\nEscrito: ${absoluto}\n`);
  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("serp-onpage.ts")) {
  ejecutar(main);
}
