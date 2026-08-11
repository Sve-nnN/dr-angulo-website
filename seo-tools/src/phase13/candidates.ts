/**
 * Eleccion de las cabezas de cluster de la fase 13 (KWR-04, D-03, D-06).
 *
 * QUE DECIDE ESTE MODULO Y POR QUE IMPORTA TANTO. Decide en que se gastan 90 busquedas de
 * SerpApi que no se reponen hasta el 2026-08-21. Una busqueda mal elegida no vuelve. Por eso
 * este archivo hace tres cosas que en otro contexto serian exageradas:
 *
 *   1. No consulta a nadie. Ni la red, ni una credencial, ni un modelo. Recibe las keywords ya
 *      leidas y el conjunto de lo que ya esta capturado, y devuelve una lista.
 *   2. Es determinista hasta el orden de los empates. Dos corridas sobre la misma entrada dan
 *      el mismo JSON byte a byte, incluso si la entrada llega en otro orden.
 *   3. Nada se cae de la lista en silencio. Lo excluido se cuenta por regla, lo absorbido
 *      nombra a quien lo absorbio y lo que huele a ruido entra MARCADO en vez de esconderse.
 *
 * EL ORDEN NO ES POR VOLUMEN, Y ESO ES A PROPOSITO. Las cuatro condiciones que el doctor
 * efectivamente opera tienen el volumen vacio porque DinoRank trunca las relacionadas en 900 y
 * nunca devuelve la keyword consultada en su propio arreglo. Un orden por volumen las mandaria
 * al final de la lista y el presupuesto se gastaria en la cola. El orden es por rango de valor
 * de negocio, y el volumen solo desempata dentro del ultimo rango.
 *
 * Los criterios viven en data/candidate-rules.json, igual que intent-rules.json en la fase 12.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";

// ---------------------------------------------------------------------------
// Forma de la entrada: el subconjunto de keywords.jsonl que este modulo mira
// ---------------------------------------------------------------------------

export interface MetricasDeKeyword {
  readonly searchVolume: number | null;
  readonly searchVolumeFuente: string;
}

export interface RegistroDeKeyword {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly capa: string;
  readonly intent: string;
  readonly stage: string;
  readonly alcance: string;
  readonly motivoAlcance: string | null;
  readonly metricas: MetricasDeKeyword;
}

// ---------------------------------------------------------------------------
// Forma del archivo de reglas
// ---------------------------------------------------------------------------

export interface RangoDeCandidatas {
  readonly rango: number;
  readonly familia: string;
  readonly etiqueta: string;
  readonly motivo: string;
  /** Claves normalizadas exactas. Su ORDEN es el de valor de negocio. */
  readonly claves: readonly string[];
  /** Sufijos geo o de sede que se montan sobre las bases. */
  readonly sufijos: readonly string[];
  /** Bases sobre las que se monta el sufijo. Vacio significa: los rangos 1 y 2 completos. */
  readonly bases: readonly string[];
  /** Solo el rango 5: intenciones admitidas. */
  readonly intenciones: readonly string[];
  /** Solo el rango 5: volumen minimo, exclusivo del cero. */
  readonly volumenMinimo: number;
}

export interface ReglaDeExclusion {
  readonly regla: string;
  readonly motivo: string;
  readonly contiene: readonly string[];
  readonly terminaEn: readonly string[];
}

export interface ReglaDeSospecha {
  readonly regla: string;
  readonly motivo: string;
  readonly contiene: readonly string[];
  /**
   * Calza solo si la clave EMPIEZA con el patron.
   *
   * Existe por un falso positivo medido: `ortopedia surco` como patron de `contiene` marcaba
   * tambien `traumatologia y ortopedia surco`, que no es la tienda sino el par de
   * especialidades. Anclar al principio distingue las dos.
   */
  readonly empiezaCon: readonly string[];
}

export interface ReglasDeCandidatas {
  readonly schema: number;
  readonly presupuesto: number;
  readonly objetivoDeCabezas: number;
  readonly rangos: readonly RangoDeCandidatas[];
  readonly exclusiones: readonly ReglaDeExclusion[];
  readonly sospechas: readonly ReglaDeSospecha[];
}

const RUTA_REGLAS = path.join(SEO_TOOLS_ROOT, "data", "candidate-rules.json");

function malArchivo(detalle: string): never {
  throw new CliError(
    `El archivo de reglas de candidatas es invalido.\n  ${detalle}\n  Archivo: ${RUTA_REGLAS}`,
  );
}

function listaDeTextos(valor: unknown): string[] {
  if (valor === undefined) return [];
  if (!Array.isArray(valor)) malArchivo("se esperaba un arreglo de textos.");
  return valor.filter((v): v is string => typeof v === "string");
}

let cache: ReglasDeCandidatas | null = null;

/** Lee el archivo de reglas una sola vez por proceso y lo valida. */
export function cargarReglasDeCandidatas(
  rutaArchivo: string = RUTA_REGLAS,
): ReglasDeCandidatas {
  if (cache !== null && rutaArchivo === RUTA_REGLAS) return cache;

  let crudo: string;
  try {
    crudo = readFileSync(rutaArchivo, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer las reglas de candidatas.\n  Ruta: ${rutaArchivo}\n` +
        `  Accion: verificar que seo-tools/data/candidate-rules.json exista y este commiteado.`,
    );
  }

  let parseado: unknown;
  try {
    parseado = JSON.parse(crudo);
  } catch (error) {
    malArchivo(`no es JSON valido: ${String(error)}`);
  }
  if (parseado === null || typeof parseado !== "object") malArchivo("la raiz no es un objeto.");
  const raiz = parseado as Record<string, unknown>;

  const crudos = raiz["rangos"];
  if (!Array.isArray(crudos) || crudos.length === 0) malArchivo("falta el arreglo `rangos`.");

  const rangos: RangoDeCandidatas[] = crudos.map((entrada, i) => {
    if (entrada === null || typeof entrada !== "object") malArchivo(`el rango ${i} no es objeto.`);
    const r = entrada as Record<string, unknown>;
    if (typeof r["rango"] !== "number") malArchivo(`el rango ${i} no declara su numero.`);
    if (typeof r["familia"] !== "string") malArchivo(`el rango ${i} no declara familia.`);
    if (typeof r["motivo"] !== "string") malArchivo(`el rango ${i} no declara motivo.`);
    return {
      rango: r["rango"],
      familia: r["familia"],
      etiqueta: typeof r["etiqueta"] === "string" ? r["etiqueta"] : r["familia"],
      motivo: r["motivo"],
      claves: listaDeTextos(r["claves"]),
      sufijos: listaDeTextos(r["sufijos"]),
      bases: listaDeTextos(r["bases"]),
      intenciones: listaDeTextos(r["intenciones"]),
      volumenMinimo: typeof r["volumenMinimo"] === "number" ? r["volumenMinimo"] : 1,
    };
  });

  // Los numeros de rango tienen que ser unicos y venir en orden: el orden del arreglo ES la
  // precedencia, y una reordenacion accidental cambiaria el corte en silencio.
  for (let i = 1; i < rangos.length; i += 1) {
    const previo = rangos[i - 1] as RangoDeCandidatas;
    const actual = rangos[i] as RangoDeCandidatas;
    if (actual.rango <= previo.rango) {
      malArchivo(
        `los rangos tienen que venir en orden ascendente y sin repetir: ` +
          `${previo.rango} viene antes que ${actual.rango}.`,
      );
    }
  }

  const exclusiones: ReglaDeExclusion[] = listaDeObjetos(raiz["exclusiones"], "exclusiones").map(
    (e) => {
      if (typeof e["regla"] !== "string") malArchivo("una exclusion no declara `regla`.");
      if (typeof e["motivo"] !== "string") malArchivo(`la exclusion ${e["regla"]} no da motivo.`);
      return {
        regla: e["regla"],
        motivo: e["motivo"],
        contiene: listaDeTextos(e["contiene"]),
        terminaEn: listaDeTextos(e["terminaEn"]),
      };
    },
  );

  const sospechas: ReglaDeSospecha[] = listaDeObjetos(raiz["sospechas"], "sospechas").map((s) => {
    if (typeof s["regla"] !== "string") malArchivo("una sospecha no declara `regla`.");
    if (typeof s["motivo"] !== "string") malArchivo(`la sospecha ${s["regla"]} no da motivo.`);
    return {
      regla: s["regla"],
      motivo: s["motivo"],
      contiene: listaDeTextos(s["contiene"]),
      empiezaCon: listaDeTextos(s["empiezaCon"]),
    };
  });

  const reglas: ReglasDeCandidatas = {
    schema: typeof raiz["schema"] === "number" ? raiz["schema"] : 0,
    presupuesto: typeof raiz["presupuesto"] === "number" ? raiz["presupuesto"] : 90,
    objetivoDeCabezas:
      typeof raiz["objetivoDeCabezas"] === "number" ? raiz["objetivoDeCabezas"] : 95,
    rangos,
    exclusiones,
    sospechas,
  };

  if (rutaArchivo === RUTA_REGLAS) cache = reglas;
  return reglas;
}

function listaDeObjetos(valor: unknown, nombre: string): Record<string, unknown>[] {
  if (valor === undefined) return [];
  if (!Array.isArray(valor)) malArchivo(`\`${nombre}\` tiene que ser un arreglo.`);
  return valor.map((v, i) => {
    if (v === null || typeof v !== "object") malArchivo(`${nombre}[${i}] no es un objeto.`);
    return v as Record<string, unknown>;
  });
}

// ---------------------------------------------------------------------------
// Forma de la salida
// ---------------------------------------------------------------------------

export interface Candidata {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly rango: number;
  readonly familia: string;
  readonly etiqueta: string;
  readonly motivo: string;
  readonly volumen: number | null;
  readonly volumenFuente: string;
  readonly intent: string;
  readonly alcance: string;
  /** Verdadero si su SERP ya esta capturada: entra con coste cero (D-06). */
  readonly enCache: boolean;
  /** El nombre de la regla de sospecha que calzo, o null. Marca, no excluye. */
  readonly posibleRuido: string | null;
  readonly motivoRuido: string | null;
}

export interface Excluida {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly regla: string;
  readonly motivo: string;
  readonly volumen: number | null;
}

export interface Absorbida {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly absorbidaPor: string;
  readonly motivo: string;
}

export interface ResumenDeSeleccion {
  readonly cabezas: number;
  readonly porRango: Readonly<Record<string, number>>;
  readonly enCache: number;
  readonly busquedasNuevas: number;
  readonly presupuesto: number;
  readonly holgura: number;
  readonly posiblesRuido: number;
  readonly duplicadosProbables: number;
  readonly cercaDelCorte: number;
  readonly excluidas: number;
  readonly absorbidas: number;
  readonly evaluadas: number;
}

/**
 * Dos cabezas ACEPTADAS que casi con certeza comparten SERP.
 *
 * No es ruido y por eso no va en `posiblesRuido`: las dos son keywords legitimas del universo.
 * Es otra cosa, y para la revision es igual de importante: `desgarro muscular tratamiento` y
 * `desgarro muscular tratamientos` son dos busquedas irrecuperables para un solo cluster.
 * Se declaran para que la revision pueda quitar una y recuperar la busqueda; no se colapsan
 * solas porque el singular y el plural SI pueden tener SERP distinta y nadie lo ha medido.
 */
export interface DuplicadoProbable {
  readonly keywordKey: string;
  readonly duplicaA: string;
  readonly motivo: string;
}

export interface SeleccionDeCandidatas {
  readonly schema: 1;
  readonly generadoPor: string;
  readonly presupuesto: number;
  readonly objetivoDeCabezas: number;
  readonly candidatas: readonly Candidata[];
  readonly cercaDelCorte: readonly Candidata[];
  readonly posiblesRuido: readonly Candidata[];
  readonly duplicadosProbables: readonly DuplicadoProbable[];
  readonly absorbidas: readonly Absorbida[];
  readonly excluidas: readonly Excluida[];
  readonly resumen: ResumenDeSeleccion;
}

export interface OpcionesDeSeleccion {
  readonly reglas: ReglasDeCandidatas;
  readonly presupuesto?: number | undefined;
  readonly objetivoDeCabezas?: number | undefined;
  /** Claves normalizadas cuya SERP ya esta en disco. No se consulta nada para armarlo. */
  readonly enCache?: ReadonlySet<string> | undefined;
  /** Lo que el checkpoint de la tarea 2 saque de la lista. Se normaliza antes de comparar. */
  readonly excluir?: readonly string[] | undefined;
  /** Lo que el checkpoint de la tarea 2 rescate de las cercanas al corte. */
  readonly incluir?: readonly string[] | undefined;
}

// ---------------------------------------------------------------------------
// Rankeo
// ---------------------------------------------------------------------------

const ALCANCE_ADMITIDO = "objetivo";
const CERCANAS_QUE_SE_RETIENEN = 10;

/** Un rango asignado, con su posicion dentro del rango para que el orden sea total. */
interface Asignacion {
  readonly rango: RangoDeCandidatas;
  readonly orden: number;
  readonly detalle: string;
}

function contiene(clave: string, patron: string): boolean {
  // Comparacion por palabra completa: "lince" no calza dentro de "lincentro". Es el mismo
  // criterio que usa el motor de intencion de la fase 12.
  const c = ` ${clave} `;
  return c.includes(` ${patron} `) || clave === patron;
}

function calzaExclusion(clave: string, regla: ReglaDeExclusion): boolean {
  for (const p of regla.contiene) if (contiene(clave, p)) return true;
  for (const p of regla.terminaEn) if (clave === p || clave.endsWith(` ${p}`)) return true;
  return false;
}

/**
 * Asigna rango. Devuelve null si la keyword no es candidata a cabeza por ningun criterio,
 * que es el caso de la enorme mayoria del universo: 4.766 objetivo, unas 95 cabezas.
 */
function asignarRango(
  registro: RegistroDeKeyword,
  reglas: ReglasDeCandidatas,
  basesPorDefecto: readonly string[],
): Asignacion | null {
  const clave = registro.keywordKey;

  for (const rango of reglas.rangos) {
    // Rangos 1 y 2: lista exacta, y el orden de la lista es el de valor de negocio.
    if (rango.sufijos.length === 0 && rango.claves.length > 0) {
      const i = rango.claves.indexOf(clave);
      if (i !== -1) return { rango, orden: i, detalle: "" };
      continue;
    }

    // Rangos 3 y 4: el sufijo se monta sobre una base de los rangos 1 y 2.
    if (rango.sufijos.length > 0) {
      const bases = rango.bases.length > 0 ? rango.bases : basesPorDefecto;
      for (let b = 0; b < bases.length; b += 1) {
        const base = bases[b] as string;
        if (!clave.startsWith(`${base} `)) continue;
        const cola = clave.slice(base.length + 1);
        for (let s = 0; s < rango.sufijos.length; s += 1) {
          const sufijo = rango.sufijos[s] as string;
          if (cola === sufijo || cola === `en ${sufijo}`) {
            return {
              rango,
              orden: b * rango.sufijos.length + s,
              detalle: `sobre "${base}"`,
            };
          }
        }
      }
      continue;
    }

    // Rango 5: el criterio literal de D-03, por metrica.
    if (rango.intenciones.length > 0) {
      const volumen = registro.metricas.searchVolume;
      if (!rango.intenciones.includes(registro.intent)) continue;
      if (typeof volumen !== "number" || volumen < rango.volumenMinimo) continue;
      return { rango, orden: 0, detalle: `volumen ${volumen}` };
    }
  }

  return null;
}

function detectarSospecha(
  clave: string,
  reglas: ReglasDeCandidatas,
): ReglaDeSospecha | null {
  for (const s of reglas.sospechas) {
    for (const p of s.contiene) if (contiene(clave, p)) return s;
    for (const p of s.empiezaCon) if (clave === p || clave.startsWith(`${p} `)) return s;
  }
  return null;
}

/** Compara dos candidatas por el orden de valor de negocio. Es un orden TOTAL: sin empates. */
function compararCandidatas(a: Ordenable, b: Ordenable): number {
  if (a.candidata.rango !== b.candidata.rango) return a.candidata.rango - b.candidata.rango;
  if (a.orden !== b.orden) return a.orden - b.orden;
  const va = a.candidata.volumen ?? -1;
  const vb = b.candidata.volumen ?? -1;
  if (va !== vb) return vb - va;
  // Ultimo desempate, para que dos corridas no puedan diferir jamas.
  return a.candidata.keywordKey < b.candidata.keywordKey ? -1 : 1;
}

interface Ordenable {
  readonly candidata: Candidata;
  readonly orden: number;
}

/**
 * Elige las cabezas de cluster.
 *
 * No consulta nada y no escribe nada: recibe las keywords, devuelve la seleccion.
 */
export function seleccionarCandidatas(
  keywords: readonly RegistroDeKeyword[],
  opciones: OpcionesDeSeleccion,
): SeleccionDeCandidatas {
  const { reglas } = opciones;
  const presupuesto = opciones.presupuesto ?? reglas.presupuesto;
  const objetivoDeCabezas = opciones.objetivoDeCabezas ?? reglas.objetivoDeCabezas;
  const enCache = opciones.enCache ?? new Set<string>();
  const excluir = new Set((opciones.excluir ?? []).map(normalizeKeyword).filter((k) => k !== ""));
  const incluir = new Set((opciones.incluir ?? []).map(normalizeKeyword).filter((k) => k !== ""));

  // Las bases por defecto de los rangos 3 y 4 son los rangos 1 y 2 completos, en su orden.
  const basesPorDefecto: string[] = [];
  for (const r of reglas.rangos) {
    if (r.sufijos.length === 0 && r.claves.length > 0) basesPorDefecto.push(...r.claves);
  }

  // Paso 1: deduplicar por clave normalizada. Se queda la primera ocurrencia en orden de
  // clave, no en orden de archivo, para que reordenar la entrada no cambie la salida.
  const porClave = new Map<string, RegistroDeKeyword>();
  for (const registro of [...keywords].sort((a, b) =>
    a.keywordKey < b.keywordKey ? -1 : a.keywordKey > b.keywordKey ? 1 : 0,
  )) {
    if (registro.keywordKey === "") continue;
    if (!porClave.has(registro.keywordKey)) porClave.set(registro.keywordKey, registro);
  }

  const excluidas: Excluida[] = [];
  const rankeadas: Ordenable[] = [];
  let evaluadas = 0;

  for (const registro of porClave.values()) {
    // El filtro de alcance manda sobre todo, incluido --include: una marca ajena no se
    // persigue jamas (D-14).
    if (registro.alcance !== ALCANCE_ADMITIDO) continue;
    evaluadas += 1;

    const clave = registro.keywordKey;

    if (excluir.has(clave)) {
      excluidas.push({
        keyword: registro.keyword,
        keywordKey: clave,
        regla: "quitada-en-la-revision",
        motivo: "Juan la saco de la lista en el checkpoint de aprobacion.",
        volumen: registro.metricas.searchVolume,
      });
      continue;
    }

    const exclusion = reglas.exclusiones.find((e) => calzaExclusion(clave, e));
    if (exclusion !== undefined && !incluir.has(clave)) {
      excluidas.push({
        keyword: registro.keyword,
        keywordKey: clave,
        regla: exclusion.regla,
        motivo: exclusion.motivo,
        volumen: registro.metricas.searchVolume,
      });
      continue;
    }

    const forzada = incluir.has(clave);
    const asignacion = asignarRango(registro, reglas, basesPorDefecto);
    if (asignacion === null && !forzada) continue;

    const sospecha = detectarSospecha(clave, reglas);
    const rangoBase = asignacion?.rango;

    const candidata: Candidata = {
      keyword: registro.keyword,
      keywordKey: clave,
      rango: forzada ? 0 : (rangoBase?.rango ?? 0),
      familia: forzada ? "agregadas-en-la-revision" : (rangoBase?.familia ?? ""),
      etiqueta: forzada
        ? "Agregadas en la revision de Juan"
        : (rangoBase?.etiqueta ?? ""),
      motivo: forzada
        ? "Juan la agrego en la revision del checkpoint, por encima del criterio automatico." +
          (rangoBase === undefined ? "" : ` Su rango automatico era ${rangoBase.rango}.`)
        : `${rangoBase?.motivo ?? ""}${asignacion?.detalle === "" ? "" : ` (${asignacion?.detalle})`}`,
      volumen: registro.metricas.searchVolume,
      volumenFuente: registro.metricas.searchVolumeFuente,
      intent: registro.intent,
      alcance: registro.alcance,
      enCache: enCache.has(clave),
      posibleRuido: sospecha?.regla ?? null,
      motivoRuido: sospecha?.motivo ?? null,
    };

    rankeadas.push({ candidata, orden: forzada ? 0 : (asignacion?.orden ?? 0) });
  }

  rankeadas.sort(compararCandidatas);

  // Paso 2: colapsar la forma con `en` contra la forma sin `en`. Son dos keywords distintas
  // del universo, pero comparten SERP casi con certeza: capturar las dos gastaria dos
  // busquedas irrecuperables para el mismo cluster. La absorbida no desaparece, queda
  // nombrando a quien la absorbio, y la fase 4 la asigna por texto.
  const clavesRankeadas = new Set(rankeadas.map((r) => r.candidata.keywordKey));
  const absorbidas: Absorbida[] = [];
  const sobrevivientes: Ordenable[] = [];

  for (const r of rankeadas) {
    const clave = r.candidata.keywordKey;
    const plano = clave.replace(/ en /g, " ");
    if (plano !== clave && clavesRankeadas.has(plano)) {
      absorbidas.push({
        keyword: r.candidata.keyword,
        keywordKey: clave,
        absorbidaPor: plano,
        motivo:
          "Misma consulta con y sin la preposicion: comparten SERP y capturar las dos gastaria " +
          "dos busquedas para un solo cluster. Se asigna por texto en la tarea 4.",
      });
      continue;
    }
    sobrevivientes.push(r);
  }

  // Paso 3: el corte. Lo cacheado NO consume presupuesto (D-06).
  const candidatas: Candidata[] = [];
  const cercaDelCorte: Candidata[] = [];
  let busquedasNuevas = 0;

  for (const r of sobrevivientes) {
    const c = r.candidata;
    const costaria = c.enCache ? 0 : 1;
    const cabe = busquedasNuevas + costaria <= presupuesto && candidatas.length < objetivoDeCabezas;

    if (cabe) {
      candidatas.push(c);
      busquedasNuevas += costaria;
      continue;
    }
    if (cercaDelCorte.length < CERCANAS_QUE_SE_RETIENEN) cercaDelCorte.push(c);
    if (cercaDelCorte.length >= CERCANAS_QUE_SE_RETIENEN) break;
  }

  const posiblesRuido = candidatas.filter((c) => c.posibleRuido !== null);

  // Paso 4: senalar las cabezas aceptadas que se diferencian solo en un plural. Se declaran,
  // no se colapsan: quitar una es decision de la revision y no de una heuristica.
  const duplicadosProbables: DuplicadoProbable[] = [];
  const porRaiz = new Map<string, string>();
  for (const c of candidatas) {
    const raiz = c.keywordKey
      .split(" ")
      .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t))
      .join(" ");
    const previa = porRaiz.get(raiz);
    if (previa !== undefined && previa !== c.keywordKey) {
      duplicadosProbables.push({
        keywordKey: c.keywordKey,
        duplicaA: previa,
        motivo:
          "Se diferencia de otra cabeza aceptada solo en un plural. Casi con certeza comparten " +
          "SERP: capturar las dos gasta dos busquedas irrecuperables para un solo cluster.",
      });
      continue;
    }
    porRaiz.set(raiz, c.keywordKey);
  }

  const porRango: Record<string, number> = {};
  for (const c of candidatas) {
    const nombre = c.familia === "" ? `rango-${c.rango}` : c.familia;
    porRango[nombre] = (porRango[nombre] ?? 0) + 1;
  }

  return {
    schema: 1,
    generadoPor: "seo-tools/src/phase13/serp-candidates.ts",
    presupuesto,
    objetivoDeCabezas,
    candidatas,
    cercaDelCorte,
    posiblesRuido,
    duplicadosProbables,
    absorbidas,
    excluidas,
    resumen: {
      cabezas: candidatas.length,
      porRango,
      enCache: candidatas.filter((c) => c.enCache).length,
      busquedasNuevas,
      presupuesto,
      holgura: presupuesto - busquedasNuevas,
      posiblesRuido: posiblesRuido.length,
      duplicadosProbables: duplicadosProbables.length,
      cercaDelCorte: cercaDelCorte.length,
      excluidas: excluidas.length,
      absorbidas: absorbidas.length,
      evaluadas,
    },
  };
}
