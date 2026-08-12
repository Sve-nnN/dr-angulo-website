/**
 * Entidades obligatorias derivadas del top 10 ya capturado (ONPAGE-03, D-02).
 *
 * POR QUE ESTE MODULO EXISTE Y NO SE USA EL TF-IDF DE DINORANK.
 *
 * ONPAGE-03 pide los terminos que exigen las paginas que YA posicionan. `/tfidf` de DinoRank
 * si lee nuestra URL, pero su corpus de comparacion vino vacio el 2026-08-12: `totalUrls: 0`,
 * `wdfdf.media: []` y `df: null`. O sea que analiza nuestra pagina aislada, que es justo lo
 * contrario de lo que el requisito pide. Las paginas que ya posicionan si estan medidas: son
 * los `organic_results` de las 96 capturas pagadas.
 *
 * LO QUE ESTE CORPUS ES, DICHO SIN ADORNOS. La captura NO trae el cuerpo de las paginas que
 * rankean: trae el `title` y el `snippet` de cada organico. O sea texto de presentacion, no
 * texto completo. Llamar TF-IDF a esto seria vender una medicion que no se hizo. Lo que se
 * mide es frecuencia documental sobre titulos y fragmentos, y cada entidad viaja con su
 * numerador y su denominador para que cualquiera pueda pesar la evidencia.
 *
 * EL CRITERIO ES DISCRECIONAL Y POR ESO SE DECLARA ACA, no en un comentario suelto:
 *
 *   1. N-gramas de una a tres palabras de contenido. Las vacias no cuentan como palabra pero
 *      si se conservan adentro del termino, porque en espanol el nombre de una cosa las lleva:
 *      "hernia de disco" y "salida del nucleo pulposo" se rompen si se las quita.
 *   2. Fuera el dominio y la marca de cada resultado, la marca propia y el vocabulario de
 *      navegacion. El corpus es texto de presentacion, asi que ahi conviven el vocabulario
 *      clinico y el nombre del sitio que lo publica. Confundirlos le pediria a la pagina del
 *      doctor que nombre a un competidor para posicionar.
 *   3. Entra el termino que aparece en el 40 % o mas de los organicos medidos.
 *   4. Si con ese umbral quedan menos de 8, baja de a 0,1 hasta 0,2 y el umbral aplicado se
 *      registra en la fila. Si ni al minimo llega a 8, la fila declara `entidadesInsuficientes`
 *      en vez de inventar terminos.
 *   5. Corte en 20, ordenados por frecuencia documental y, a igualdad, por la posicion mas
 *      alta en la que aparecieron.
 */

import type { SerpCompleta } from "../phase13/serp.js";
import type { ClaseDeEntidad, EntidadObligatoria } from "./model.js";

export const UMBRAL_POR_DEFECTO = 0.4;
export const UMBRAL_MINIMO = 0.2;
export const MINIMO_DE_TERMINOS = 8;
export const MAXIMO_DE_TERMINOS = 20;

/** Un termino de una sola letra o dos no distingue nada y ensucia el corte de 20. */
const LARGO_MINIMO_DE_PALABRA = 3;
const MAXIMO_DE_PALABRAS = 3;

/**
 * Vacias del espanol.
 *
 * No incluye ni una palabra clinica a proposito: la lista se revisa contra los terminos que
 * la fase quiere conservar, no contra una lista generica de internet. `dolor`, `baja` y
 * `pierna` parecen genericas y son exactamente la senal que ONPAGE-03 busca.
 */
const VACIAS = new Set([
  "a", "al", "ante", "antes", "aquel", "aquella", "aquello", "asi", "aun", "aunque", "bajo",
  "bien", "cada", "casi", "como", "con", "contra", "cual", "cuales", "cuando", "cuanto", "cuya",
  "cuyo", "de", "del", "desde", "donde", "dos", "durante", "e", "el", "ella", "ellas", "ellos",
  "en", "entre", "era", "eran", "es", "esa", "esas", "ese", "eso", "esos", "esta", "estan",
  "estar", "estas", "este", "esto", "estos", "fue", "fueron", "ha", "han", "hasta", "hay", "he",
  "la", "las", "le", "les", "lo", "los", "mas", "me", "mi", "mis", "mucho", "muy", "ni", "no",
  "nos", "o", "otra", "otras", "otro", "otros", "para", "pero", "poco", "por", "porque",
  "puede", "pueden", "que", "quien", "se", "segun", "ser", "si", "sin", "sobre", "solo", "son",
  "su", "sus", "tal", "tan", "tanto", "te", "tiene", "tienen", "toda", "todas", "todo", "todos",
  "tras", "tu", "tus", "u", "un", "una", "unas", "uno", "unos", "y", "ya",
  "hacia", "traves", "dentro", "fuera", "encima", "debajo", "arriba", "abajo", "cerca", "lejos",
  "incluso", "mientras", "cualquier", "cualquiera", "varios", "varias", "algunos", "algunas",
  "algun", "alguna", "ningun", "ninguna", "ninguno", "ambos", "ambas", "tres", "cuatro", "cinco",
  "primer", "primero", "primera", "segundo", "segunda", "ultimo", "ultima",
]);

/**
 * Navegacion y marca institucional generica.
 *
 * `clinica`, `hospital` y `centro` estan aca y no entre las anatomicas por una razon medida:
 * en un top 10 de salud aparecen en la mitad de los titulos como parte del nombre del sitio,
 * no como vocabulario del tema. Un termino obligatorio que diga "clinica" no le pide nada a
 * quien escribe la pagina.
 */
const RUIDO = new Set([
  "inicio", "contacto", "contactanos", "contactar", "leer", "ver", "menu", "buscar", "busqueda",
  "home", "pagina", "paginas", "sitio", "web", "blog", "articulo", "articulos", "noticia",
  "noticias", "video", "videos", "foto", "fotos", "cookies", "privacidad", "aviso", "legal",
  "mapa", "suscribete", "suscribirse", "compartir", "imprimir", "siguiente", "anterior",
  "descargar", "pdf", "telefono", "whatsapp", "correo", "email", "cita", "citas", "reservar",
  "informacion", "info", "clinic", "clinica", "clinicas", "hospital", "hospitales", "centro",
  "centros", "instituto", "institucion", "grupo", "fundacion", "salud", "sanitario", "online",
]);

/**
 * Vocabulario de relleno que sobrevive a la frecuencia documental sin decir nada.
 *
 * Medido sobre las 16 capturas: `ocurre`, `parte` y `caso` entran en el top 10 de mas de una
 * keyword porque todo articulo de salud los usa. Como exigencia son inutiles. "La pagina tiene
 * que nombrar `ocurre`" no le pide nada a quien escribe, y cada uno de estos empuja fuera del
 * corte de 20 a un termino que si pedia algo.
 *
 * No entra aca ni una palabra con carga clinica. `desplaza` describe lo que hace un disco y
 * `grave` es un calificativo de sintoma: los dos se quedan.
 */
const RELLENO = new Set([
  "ocurre", "ocurren", "ocurrir", "sucede", "suceden", "existe", "existen", "encuentra",
  "encuentran", "presenta", "presentan", "incluye", "incluyen", "consiste", "trata", "tratan",
  "parte", "partes", "caso", "casos", "forma", "formas", "manera", "vez", "veces", "momento",
  "tiempo", "dia", "dias", "ano", "anos", "persona", "personas", "gente", "vida", "mundo",
  "cosa", "cosas", "algo", "alguien", "saber", "conocer", "hacer", "hace", "hacen", "haber",
  "tener", "debe", "deben", "suele", "suelen", "mismo", "misma", "mismos", "mismas", "nuevo",
  "nueva", "nuevos", "nuevas", "gran", "grande", "grandes", "mayor", "mayores", "menor",
  "menores", "mejor", "mejores", "peor", "buena", "bueno", "buenos", "buenas", "principal",
  "principales", "comun", "comunes", "general", "generales", "generalmente", "ademas",
  "tambien", "siempre", "nunca", "ahora", "despues", "antes",
]);

/** La marca propia. Una pagina no se posiciona nombrandose a si misma en la lista de exigencias. */
const MARCA_PROPIA = new Set(["angulo", "drangulocolumna", "drangulo"]);

/** Dominios de primer nivel y comerciales que no son marca de nadie. */
const TLD = new Set([
  "com", "org", "net", "gov", "gob", "edu", "int", "mil", "info", "es", "pe", "mx", "ar", "cl",
  "co", "us", "uk", "io", "me", "tv", "app", "health", "care", "clinic",
]);

const CLINICAS = new Set([
  "hernia", "hernias", "herniado", "herniada", "discal", "estenosis", "escoliosis", "cifosis",
  "artrosis", "artritis", "lumbalgia", "lumbago", "ciatica", "ciatico", "espondilolistesis",
  "espondilosis", "osteoporosis", "tendinitis", "dolor", "dolores", "sintoma", "sintomas",
  "signo", "signos", "hormigueo", "adormecimiento", "entumecimiento", "debilidad", "molestia",
  "molestias", "inflamacion", "inflamado", "compresion", "comprimida", "degenerativa",
  "degeneracion", "desgaste", "protrusion", "pinzamiento", "contractura", "rigidez", "fractura",
  "tumor", "infeccion", "calambre", "calambres", "parestesia", "radiculopatia", "cervicalgia",
  "dorsalgia", "claudicacion", "lumbociatalgia", "deformidad", "deformidades",
]);

const PROCEDIMIENTOS = new Set([
  "cirugia", "cirugias", "operacion", "operaciones", "operar", "operarse", "quirurgico",
  "quirurgica", "discectomia", "microdiscectomia", "laminectomia", "artrodesis", "fusion",
  "endoscopia", "endoscopica", "percutanea", "invasiva", "infiltracion", "infiltraciones",
  "bloqueo", "resonancia", "tomografia", "radiografia", "electromiografia", "diagnostico",
  "diagnostica", "tratamiento", "tratamientos", "terapia", "fisioterapia", "rehabilitacion",
  "ejercicio", "ejercicios", "medicamento", "medicamentos", "pastillas", "analgesico",
  "antiinflamatorio", "antiinflamatorios", "corticoide", "reposo", "prevencion", "curar",
  "cura", "desinflamar", "aliviar", "alivio", "remedio", "remedios", "consulta", "evaluacion",
  "examen", "estudio", "estudios",
]);

const ANATOMICAS = new Set([
  "disco", "discos", "intervertebral", "intervertebrales", "vertebra", "vertebras", "vertebral",
  "columna", "lumbar", "lumbares", "lumbosacra", "lumbosacro", "cervical", "cervicales",
  "dorsal", "toracica", "sacro", "coxis", "nervio", "nervios", "nerviosa", "nervioso", "raiz",
  "raices", "nucleo", "pulposo", "anillo", "fibroso", "canal", "raquideo", "medula", "espinal",
  "ligamento", "ligamentos", "musculo", "musculos", "muscular", "hueso", "huesos", "oseo",
  "articulacion", "articulaciones", "cadera", "rodilla", "pierna", "piernas", "brazo", "brazos",
  "cuello", "espalda", "cintura", "gluteo", "muslo", "pie", "pies", "mano", "manos", "faceta",
  "apofisis", "cauda", "equina", "cuerpo",
]);

/** Minusculas y sin tildes. La n con virgulilla cae en n, que es lo que hace comparable el corpus. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Parte en palabras de letras y digitos. Todo lo demas es separador. */
export function tokenizar(texto: string): string[] {
  return normalizar(texto)
    .split(/[^a-z0-9]+/)
    .filter((t) => t !== "");
}

/**
 * Etiquetas de marca que aparecen en los dominios de una captura.
 *
 * Solo la etiqueta principal del host, nunca sus partes: un competidor con dominio
 * `hernia-discal.es` dejaria sin entidad clinica a la fase entera si se partiera por guion.
 */
function marcasDeLaSerp(serp: SerpCompleta): Set<string> {
  const marcas = new Set<string>();
  for (const organico of serp.organicos) {
    const partes = normalizar(organico.dominio)
      .split(".")
      .filter((p) => p !== "");
    if (partes.length < 2) continue;
    let etiqueta = partes[partes.length - 2] as string;
    if (partes.length >= 3 && TLD.has(etiqueta)) etiqueta = partes[partes.length - 3] as string;
    if (etiqueta.length >= LARGO_MINIMO_DE_PALABRA && !TLD.has(etiqueta)) marcas.add(etiqueta);
  }
  return marcas;
}

function admisible(trozo: readonly string[], marcas: ReadonlySet<string>): boolean {
  for (const token of trozo) {
    if (RUIDO.has(token) || RELLENO.has(token) || MARCA_PROPIA.has(token)) return false;
    if (marcas.has(token)) return false;
    if (VACIAS.has(token)) continue;
    if (token.length < LARGO_MINIMO_DE_PALABRA) return false;
    if (/^\d+$/.test(token)) return false;
  }
  // "mayo clinic" pegado es "mayoclinic", que es el dominio del primer resultado. El nombre de
  // marca escrito con espacio no lo caza ninguna comparacion token a token.
  return !marcas.has(trozo.join(""));
}

/** N-gramas de un segmento: n palabras de contenido consecutivas, con sus vacias adentro. */
function ngramasDe(tokens: readonly string[], marcas: ReadonlySet<string>): string[] {
  const contenido: number[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (!VACIAS.has(tokens[i] as string)) contenido.push(i);
  }

  const salida: string[] = [];
  for (let n = 1; n <= MAXIMO_DE_PALABRAS; n += 1) {
    for (let i = 0; i + n <= contenido.length; i += 1) {
      const trozo = tokens.slice(contenido[i] as number, (contenido[i + n - 1] as number) + 1);
      if (admisible(trozo, marcas)) salida.push(trozo.join(" "));
    }
  }
  return salida;
}

/**
 * Clase del termino, por la primera categoria que reconozca una de sus palabras.
 *
 * La precedencia empieza por lo clinico porque "hernia discal lumbar" es una condicion y no
 * una region del cuerpo, aunque nombre una. Perder eso convertiria la lista en un glosario de
 * anatomia donde las condiciones desaparecen.
 */
export function claseDe(termino: string): ClaseDeEntidad {
  const palabras = termino.split(" ");
  if (palabras.some((p) => CLINICAS.has(p))) return "clinica";
  if (palabras.some((p) => PROCEDIMIENTOS.has(p))) return "procedimiento";
  if (palabras.some((p) => ANATOMICAS.has(p))) return "anatomica";
  return "generica";
}

export interface ResultadoDeEntidades {
  readonly entidades: readonly EntidadObligatoria[];
  /** Frecuencia documental minima que se termino exigiendo. Se registra siempre, no solo al bajarla. */
  readonly umbralAplicado: number;
  /** true cuando ni al umbral minimo hubo 8 terminos. La fila lo declara en vez de inventarlos. */
  readonly entidadesInsuficientes: boolean;
  /** Organicos medidos. Es el denominador de toda la tabla. */
  readonly de: number;
}

export interface OpcionesDeEntidades {
  readonly umbral?: number;
  readonly minimo?: number;
  readonly maximo?: number;
}

/**
 * Terminos que el top 10 repite y que la pagina tiene que nombrar.
 *
 * Determinista: el orden final se decide por frecuencia documental, despues por la posicion
 * mas alta y despues alfabeticamente, asi que dos corridas sobre la misma captura dan la
 * misma tabla byte a byte.
 */
export function entidadesDelTop10(
  serp: SerpCompleta,
  opciones: OpcionesDeEntidades = {},
): ResultadoDeEntidades {
  const de = serp.organicos.length;
  const minimo = opciones.minimo ?? MINIMO_DE_TERMINOS;
  const maximo = opciones.maximo ?? MAXIMO_DE_TERMINOS;

  if (de === 0) {
    return {
      entidades: [],
      umbralAplicado: opciones.umbral ?? UMBRAL_POR_DEFECTO,
      entidadesInsuficientes: true,
      de: 0,
    };
  }

  const marcas = marcasDeLaSerp(serp);
  const posicionesPorTermino = new Map<string, number[]>();

  for (const organico of serp.organicos) {
    const vistos = new Set<string>();
    // Titulo y fragmento se recorren por separado para que ningun n-grama cruce el limite
    // entre los dos: "hernia discal" pegado a "Ocurre cuando" no es una frase de nadie.
    for (const segmento of [organico.titulo ?? "", organico.fragmento ?? ""]) {
      for (const termino of ngramasDe(tokenizar(segmento), marcas)) vistos.add(termino);
    }
    for (const termino of vistos) {
      const posiciones = posicionesPorTermino.get(termino);
      if (posiciones === undefined) posicionesPorTermino.set(termino, [organico.posicion]);
      else posiciones.push(organico.posicion);
    }
  }

  const candidatos = [...posicionesPorTermino.entries()]
    .map(([termino, posiciones]) => ({ termino, posiciones: [...posiciones].sort((a, b) => a - b) }))
    .sort((a, b) => {
      if (b.posiciones.length !== a.posiciones.length) {
        return b.posiciones.length - a.posiciones.length;
      }
      const mejorA = a.posiciones[0] as number;
      const mejorB = b.posiciones[0] as number;
      if (mejorA !== mejorB) return mejorA - mejorB;
      return a.termino.localeCompare(b.termino, "es");
    });

  // Decimas enteras y no sumas de 0,1: 0,4 menos 0,1 en coma flotante da 0,30000000000000004,
  // que despues se serializa asi en el dataset y arruina la comparacion byte a byte.
  const primeraDecima = Math.round((opciones.umbral ?? UMBRAL_POR_DEFECTO) * 10);
  const ultimaDecima = Math.round(UMBRAL_MINIMO * 10);

  let umbralAplicado = primeraDecima / 10;
  let seleccion = candidatos;

  for (let decima = primeraDecima; decima >= ultimaDecima; decima -= 1) {
    umbralAplicado = decima / 10;
    seleccion = candidatos.filter((c) => c.posiciones.length / de >= umbralAplicado - 1e-9);
    if (seleccion.length >= minimo) break;
  }

  const entidades = seleccion.slice(0, maximo).map((c) => ({
    termino: c.termino,
    documentos: c.posiciones.length,
    de,
    posiciones: c.posiciones,
    clase: claseDe(c.termino),
  }));

  return {
    entidades,
    umbralAplicado,
    entidadesInsuficientes: entidades.length < minimo,
    de,
  };
}
