/**
 * Motor determinista de clasificacion por intencion y etapa del paciente (KWR-03).
 *
 * TRES COSAS QUE ESTE MODULO NO HACE, Y NO ES CASUALIDAD:
 *
 *   1. No sale a la red. Ni una peticion, ni un cliente, ni un modelo de lenguaje. Y el nombre
 *      de ninguna de esas tres cosas aparece escrito en este archivo, ni siquiera en un
 *      comentario: el criterio de aceptacion del plan 12-04 cuenta apariciones sobre el texto
 *      del modulo y no distingue codigo de prosa. La restriccion dura
 *      del research: si un modelo corriera en cada ejecucion, dos cargas seguidas podrian
 *      producir clasificaciones distintas y SHEET-06 dejaria de cumplirse por una razon que
 *      nada tiene que ver con el escritor. El residuo ambiguo se resuelve UNA vez, fuera de
 *      linea, y queda congelado en data/intent-overrides.json.
 *   2. No guarda estado entre llamadas. `clasificar` es una funcion pura de tres argumentos.
 *   3. No inventa patrones. Todos viven en data/intent-rules.json para que la fase 13 los
 *      afine sin tocar esta logica ni sus pruebas.
 *
 * ORDEN DE RESOLUCION, que es lo que mantiene estable la reejecucion:
 *
 *      anulacion  ->  reglas de intencion por precedencia  ->  reglas de etapa
 *
 * Si la keyword figura en el archivo de anulaciones se devuelve esa clasificacion sin evaluar
 * ni un patron, y el origen se declara como de modelo. Ese orden no es negociable.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { SEO_TOOLS_ROOT } from "../config.js";

// ---------------------------------------------------------------------------
// Dominio
// ---------------------------------------------------------------------------

export const INTENCIONES = [
  "informacional",
  "comercial",
  "transaccional",
  "navegacional",
] as const;
export type Intencion = (typeof INTENCIONES)[number];

export const ETAPAS = ["sintoma", "diagnostico", "decision"] as const;
export type Etapa = (typeof ETAPAS)[number];

/**
 * Los DOS unicos valores que admite la columna de origen de la intencion.
 *
 * Hubo un tercero, `ahrefs`, mientras esa fuente estuvo en el alcance. Juan la difirio el
 * 2026-08-10 y con ella se fue el tercer valor: la clasificacion pasa a ser cien por ciento
 * reglas mas residuo congelado. Una correccion a mano tambien se declara `llm`, porque el
 * Sheet solo acepta dos valores y lo que importa aguas abajo es "no lo decidieron las reglas".
 */
export const ORIGENES_DE_INTENCION = ["reglas", "llm"] as const;
export type OrigenDeIntencion = (typeof ORIGENES_DE_INTENCION)[number];

/** Distincion interna del archivo de anulaciones. No viaja al Sheet. */
export type OrigenDeAnulacion = "llm" | "manual";

export type Alcance = "objetivo" | "fuera_de_alcance";

export interface Anulacion {
  readonly intent: Intencion;
  readonly stage: Etapa;
  readonly origen: OrigenDeAnulacion;
  readonly nota?: string;
}

/** Clave normalizada hacia su clasificacion congelada. */
export type Anulaciones = Readonly<Record<string, Anulacion>>;

export interface Clasificacion {
  readonly intent: Intencion;
  readonly stage: Etapa;
  readonly intentSource: OrigenDeIntencion;
  /** Grupo y patron que gano, `defecto` si cayo al nivel por defecto, `anulacion` si vino del archivo. */
  readonly intentRegla: string;
  readonly stageRegla: string;
  /** Eje ortogonal: la keyword es del negocio o es deriva de la expansion. */
  readonly alcance: Alcance;
  readonly motivoAlcance: string | null;
  /** Verdadero cuando la keyword entra al residuo que resuelve la tarea 2 del plan 12-04. */
  readonly ambiguo: boolean;
  readonly motivoAmbiguo: string | null;
}

// ---------------------------------------------------------------------------
// Forma del archivo de reglas
// ---------------------------------------------------------------------------

export interface NivelDeIntencion {
  readonly nivel: Intencion;
  readonly orden: number;
  readonly porDefecto?: boolean;
  readonly requiereAusenciaDe?: readonly string[];
  readonly gruposExentosDeAusencia?: readonly string[];
  readonly grupos: Readonly<Record<string, readonly string[]>>;
  readonly combinaciones?: readonly {
    readonly nombre: string;
    readonly requiereTodas: readonly string[];
  }[];
}

export interface NivelDeEtapa {
  readonly nivel: Etapa;
  readonly orden: number;
  readonly arrastraDe?: Intencion;
  readonly patrones: readonly string[];
}

export interface MotivoDeAlcance {
  readonly motivo: string;
  readonly patrones: readonly string[];
  readonly salvoSi?: readonly string[];
}

export interface Reglas {
  readonly schema: number;
  readonly listas: Readonly<Record<string, readonly string[]>>;
  readonly intencion: readonly NivelDeIntencion[];
  readonly etapa: {
    readonly porDefecto: Etapa;
    readonly niveles: readonly NivelDeEtapa[];
  };
  readonly alcance: { readonly motivos: readonly MotivoDeAlcance[] };
  readonly residuo: {
    readonly minimoDePalabrasSinSenal: number;
    readonly empatesVigilados: readonly (readonly [Intencion, Intencion])[];
  };
}

// ---------------------------------------------------------------------------
// Carga de los archivos de datos
// ---------------------------------------------------------------------------

const RUTA_REGLAS = path.join(SEO_TOOLS_ROOT, "data", "intent-rules.json");
const RUTA_ANULACIONES = path.join(SEO_TOOLS_ROOT, "data", "intent-overrides.json");

/**
 * Expande las referencias con arroba contra `listas`, de forma recursiva.
 *
 * Sin esto, la lista de terminos de condicion y la de especialidades estarian escritas dos
 * veces cada una y se desincronizarian al primer cambio.
 */
function expandir(
  patrones: readonly string[],
  listas: Readonly<Record<string, readonly string[]>>,
  vistas: ReadonlySet<string> = new Set(),
): string[] {
  const salida: string[] = [];
  for (const entrada of patrones) {
    if (!entrada.startsWith("@")) {
      salida.push(entrada);
      continue;
    }
    const nombre = entrada.slice(1);
    if (vistas.has(nombre)) continue; // Corta cualquier ciclo sin explotar.
    const lista = listas[nombre];
    if (lista === undefined) {
      throw new Error(`data/intent-rules.json referencia la lista inexistente "${nombre}".`);
    }
    salida.push(...expandir(lista, listas, new Set([...vistas, nombre])));
  }
  return salida;
}

/** Lee y valida el archivo de reglas. Sincrono a proposito: es un archivo de datos del repo. */
export function cargarReglas(ruta: string = RUTA_REGLAS): Reglas {
  const crudo = JSON.parse(readFileSync(ruta, "utf8")) as Reglas;

  const niveles = crudo.intencion.map((n) => n.nivel);
  const esperados: Intencion[] = ["navegacional", "transaccional", "comercial", "informacional"];
  if (JSON.stringify(niveles) !== JSON.stringify(esperados)) {
    throw new Error(
      `El orden de precedencia de la intencion no es el declarado.\n` +
        `  Esperado: ${esperados.join(" > ")}\n  Encontrado: ${niveles.join(" > ")}`,
    );
  }
  const etapas = crudo.etapa.niveles.map((n) => n.nivel);
  for (const etapa of ETAPAS) {
    if (!etapas.includes(etapa)) throw new Error(`Falta la etapa "${etapa}" en las reglas.`);
  }
  return crudo;
}

/**
 * Lee el archivo de anulaciones. Si todavia no existe devuelve el conjunto vacio: en la tarea 1
 * del plan 12-04 el archivo aun no esta escrito y el motor tiene que funcionar igual.
 */
export function cargarAnulaciones(ruta: string = RUTA_ANULACIONES): Anulaciones {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    return {};
  }

  const parsed = JSON.parse(crudo) as Record<string, unknown>;
  const salida: Record<string, Anulacion> = {};

  for (const [clave, valor] of Object.entries(parsed)) {
    if (clave.startsWith("//") || clave === "schema") continue;
    if (typeof valor !== "object" || valor === null) {
      throw new Error(`La anulacion de "${clave}" no es un objeto.`);
    }
    const v = valor as Record<string, unknown>;
    if (!INTENCIONES.includes(v["intent"] as Intencion)) {
      throw new Error(`Intencion invalida en la anulacion de "${clave}": ${String(v["intent"])}`);
    }
    if (!ETAPAS.includes(v["stage"] as Etapa)) {
      throw new Error(`Etapa invalida en la anulacion de "${clave}": ${String(v["stage"])}`);
    }
    const origen = v["origen"];
    if (origen !== "llm" && origen !== "manual") {
      throw new Error(`Origen invalido en la anulacion de "${clave}": ${String(origen)}`);
    }
    salida[clave] = {
      intent: v["intent"] as Intencion,
      stage: v["stage"] as Etapa,
      origen,
      ...(typeof v["nota"] === "string" ? { nota: v["nota"] } : {}),
    };
  }
  return salida;
}

// ---------------------------------------------------------------------------
// Coincidencia por palabra completa
// ---------------------------------------------------------------------------

/**
 * Verdadero cuando el patron aparece como secuencia completa de palabras.
 *
 * Por subcadena, `ica` calzaria dentro de `ciatica` y el filtro tiraria la condicion en
 * silencio. El plan 12-03 ya se llevo ese susto con el filtro de geografia; aca se evita
 * desde el principio rodeando ambos lados con espacios.
 */
export function contienePatron(textoConBordes: string, patron: string): boolean {
  return textoConBordes.includes(` ${patron} `);
}

/** Especificidad de un patron: cuantas palabras exige. Mas palabras, mas especifico. */
const especificidad = (patron: string): number => patron.trim().split(/\s+/).length;

interface Coincidencia {
  readonly patron: string;
  readonly grupo: string;
  readonly especificidad: number;
}

/** Devuelve la coincidencia mas especifica de una lista de patrones, o null. */
function mejorCoincidencia(
  bordes: string,
  patrones: readonly string[],
  grupo: string,
): Coincidencia | null {
  let mejor: Coincidencia | null = null;
  for (const patron of patrones) {
    if (!contienePatron(bordes, patron)) continue;
    const peso = especificidad(patron);
    if (mejor === null || peso > mejor.especificidad) {
      mejor = { patron, grupo, especificidad: peso };
    }
  }
  return mejor;
}

// ---------------------------------------------------------------------------
// Eje de intencion
// ---------------------------------------------------------------------------

interface ResultadoDeNivel {
  readonly nivel: Intencion;
  readonly coincidencia: Coincidencia | null;
}

function evaluarNivel(bordes: string, nivel: NivelDeIntencion, listas: Reglas["listas"]): ResultadoDeNivel {
  const exentos = new Set(nivel.gruposExentosDeAusencia ?? []);

  // La guarda de ausencia: si la frase nombra una condicion o una especialidad, deja de ser
  // una busqueda de ficha y pasa a ser una busqueda de atencion. Los grupos exentos la saltean
  // porque su propio nombre comercial contiene el termino que la guarda vigila.
  let bloqueado = false;
  if (nivel.requiereAusenciaDe !== undefined) {
    const prohibidos = expandir(nivel.requiereAusenciaDe, listas);
    bloqueado = prohibidos.some((p) => contienePatron(bordes, p));
  }

  let mejor: Coincidencia | null = null;
  for (const [grupo, patrones] of Object.entries(nivel.grupos)) {
    if (bloqueado && !exentos.has(grupo)) continue;
    const encontrada = mejorCoincidencia(bordes, expandir(patrones, listas), grupo);
    if (encontrada === null) continue;
    if (mejor === null || encontrada.especificidad > mejor.especificidad) mejor = encontrada;
  }

  // Las combinaciones exigen al menos un termino de CADA lista en la misma frase.
  for (const combinacion of nivel.combinaciones ?? []) {
    const partes = combinacion.requiereTodas.map((lista) =>
      mejorCoincidencia(bordes, expandir([lista], listas), combinacion.nombre),
    );
    if (partes.some((p) => p === null)) continue;
    const peso = partes.reduce((suma, p) => suma + (p as Coincidencia).especificidad, 0);
    if (mejor === null || peso > mejor.especificidad) {
      mejor = {
        patron: partes.map((p) => (p as Coincidencia).patron).join(" + "),
        grupo: combinacion.nombre,
        especificidad: peso,
      };
    }
  }

  return { nivel: nivel.nivel, coincidencia: mejor };
}

// ---------------------------------------------------------------------------
// Eje de alcance
// ---------------------------------------------------------------------------

function evaluarAlcance(bordes: string, reglas: Reglas): { alcance: Alcance; motivo: string | null } {
  for (const motivo of reglas.alcance.motivos) {
    const patrones = expandir(motivo.patrones, reglas.listas);
    if (!patrones.some((p) => contienePatron(bordes, p))) continue;

    if (motivo.salvoSi !== undefined) {
      const excepciones = expandir(motivo.salvoSi, reglas.listas);
      if (excepciones.some((p) => contienePatron(bordes, p))) continue;
    }
    return { alcance: "fuera_de_alcance", motivo: motivo.motivo };
  }
  return { alcance: "objetivo", motivo: null };
}

// ---------------------------------------------------------------------------
// Clasificacion
// ---------------------------------------------------------------------------

/**
 * Clasifica una keyword ya normalizada.
 *
 * `clave` tiene que venir de normalizeKeyword: minusculas, sin tildes y con los espacios
 * colapsados. Los patrones estan escritos contra esa forma.
 */
export function clasificar(clave: string, reglas: Reglas, anulaciones: Anulaciones): Clasificacion {
  // PRIMERO la anulacion, antes de mirar un solo patron. Ese orden es lo que mantiene estable
  // la reejecucion de SHEET-06 y lo que garantiza que ninguna corrida vuelva a llamar a un
  // modelo: la decision ya esta tomada y congelada en el repositorio.
  const anulacion = anulaciones[clave];
  if (anulacion !== undefined) {
    const { alcance, motivo } = evaluarAlcance(` ${clave} `, reglas);
    return {
      intent: anulacion.intent,
      stage: anulacion.stage,
      intentSource: "llm",
      intentRegla: "anulacion",
      stageRegla: "anulacion",
      alcance,
      motivoAlcance: motivo,
      ambiguo: false,
      motivoAmbiguo: null,
    };
  }

  const bordes = ` ${clave} `;
  const evaluados = reglas.intencion.map((nivel) => evaluarNivel(bordes, nivel, reglas.listas));

  const ganador = evaluados.find((e) => e.coincidencia !== null);
  const porDefecto = reglas.intencion.find((n) => n.porDefecto === true)?.nivel ?? "informacional";

  const intent = ganador?.nivel ?? porDefecto;
  const intentRegla =
    ganador === undefined
      ? "defecto"
      : `${ganador.nivel}.${(ganador.coincidencia as Coincidencia).grupo}:${(ganador.coincidencia as Coincidencia).patron}`;

  // --- Etapa. Eje independiente, con su propio mapeo y su propio orden. ---
  let stage: Etapa = reglas.etapa.porDefecto;
  let stageRegla = "defecto";

  for (const nivel of reglas.etapa.niveles) {
    // El arrastre: cualquier disparador transaccional lleva la etapa a decision sin importar
    // que patrones de etapa haya. Alguien que pregunta el precio ya esta eligiendo.
    if (nivel.arrastraDe !== undefined && intent === nivel.arrastraDe) {
      stage = nivel.nivel;
      stageRegla = `arrastre:${nivel.arrastraDe}`;
      break;
    }
    const encontrada = mejorCoincidencia(bordes, expandir(nivel.patrones, reglas.listas), nivel.nivel);
    if (encontrada === null) continue;
    stage = nivel.nivel;
    stageRegla = `${nivel.nivel}:${encontrada.patron}`;
    break;
  }

  // --- Residuo ambiguo. No cambia nada: marca para la revision de la tarea 2. ---
  const palabras = clave === "" ? 0 : clave.split(" ").length;
  let ambiguo = false;
  let motivoAmbiguo: string | null = null;

  if (ganador === undefined && palabras >= reglas.residuo.minimoDePalabrasSinSenal) {
    ambiguo = true;
    motivoAmbiguo = "sin-senal";
  } else {
    for (const [a, b] of reglas.residuo.empatesVigilados) {
      const ca = evaluados.find((e) => e.nivel === a)?.coincidencia;
      const cb = evaluados.find((e) => e.nivel === b)?.coincidencia;
      if (ca == null || cb == null) continue;
      if (ca.especificidad !== cb.especificidad) continue;
      ambiguo = true;
      motivoAmbiguo = `empate-${a}-${b}`;
      break;
    }
  }

  const { alcance, motivo } = evaluarAlcance(bordes, reglas);

  return {
    intent,
    stage,
    intentSource: "reglas",
    intentRegla,
    stageRegla,
    alcance,
    motivoAlcance: motivo,
    ambiguo,
    motivoAmbiguo,
  };
}
