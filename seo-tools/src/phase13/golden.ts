/**
 * Las 10 de Oro (KWR-06, D-10).
 *
 * ================================================================================
 * EL ORDEN DE LOS DOS EJES NO ES UN DETALLE: ES LA DECISION
 * ================================================================================
 *
 * D-10 dice "valor de negocio primero y alcanzabilidad despues", y este modulo lo implementa
 * literalmente: la alcanzabilidad NO puntua. Solo desempata dentro del mismo valor de negocio.
 * Invertirlo daria una lista distinta y peor: las cabezas de 9 disputables sobre 9 son todas
 * modificadores de distrito del mismo cluster, o sea una sola pagina repetida diez veces.
 *
 * ================================================================================
 * POR QUE NO ALCANZA CON ORDENAR POR VOLUMEN, QUE ES LA PREGUNTA QUE JUAN VA A HACER
 * ================================================================================
 *
 * Las dos keywords de mayor volumen de todo el universo son marca de competidores. Las dos que
 * siguen son codigos CIE-10, que busca personal administrativo y no pacientes. Y el potencial
 * de trafico SUPERA al volumen propio en varias: `traumatologia` tiene 1.300 de volumen y 2.200
 * de potencial; `traumatologia y ortopedia`, 90 y 1.600. La pagina que gana esas keywords
 * captura mucho mas que el termino en si. Un orden por volumen se pierde las tres cosas.
 *
 * ================================================================================
 * LAS TRES PUERTAS, Y LAS TRES SON DE EVIDENCIA
 * ================================================================================
 *
 *   1. ALCANCE. Solo `objetivo`. La marca ajena, la codificacion clinica y el retail ortopedico
 *      ya vienen marcados desde la fase 12 con su motivo escrito.
 *   2. SERVICIO PROPIO. La cabeza tiene que nombrar algo que el consultorio DECLARA que hace.
 *      El universo se sembro desde dos lugares: el codigo del sitio y el perfil de los
 *      competidores. Perseguir `neurocirujano` —semilla de COMPETITORS.md— seria reclamar una
 *      credencial que el doctor no tiene, y PROJECT.md lo prohibe explicitamente.
 *   3. PISO DE EVIDENCIA. Al menos una posicion disputable en el top 10 medido. `hernia discal`
 *      tiene 6.000 de volumen, KD 5 y 1.500 de potencial, y sus siete posiciones medidas son
 *      Mayo Clinic, MedlinePlus, Quironsalud, Auna, Clinic Barcelona, Elsevier y neurorgs.net.
 *      Prometerla seria prometer algo que la medicion dice que no pasa. Su forma ganable,
 *      `hernia discal lumbar y cervical en lima` con 7 de 8, si entra.
 *
 * Todos los umbrales, terminos y vetos viven en `data/golden-criterio.json`, con su motivo y su
 * fecha. Aca no hay ni un numero discutible escrito a mano.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";

const RUTA_CRITERIO = path.join(SEO_TOOLS_ROOT, "data", "golden-criterio.json");

// ---------------------------------------------------------------------------
// El criterio
// ---------------------------------------------------------------------------

export interface CorteDeDemanda {
  readonly desde: number;
  readonly puntos: number;
}

export interface NivelDeLocalidad {
  readonly nivel: string;
  readonly puntos: number;
  readonly terminos: readonly string[];
}

export interface CategoriaDeServicio {
  readonly id: string;
  readonly nombre: string;
  readonly terminos: readonly string[];
  readonly esPorDefecto?: boolean;
}

export interface Veto {
  readonly keywordKey: string;
  readonly motivo: string;
}

export interface UrlCandidata {
  readonly url: string;
  readonly estado: string;
  readonly accion: string;
}

export interface ExcepcionConfirmada {
  readonly keywordKey: string;
  readonly confirmadaPor: string;
  readonly fecha: string;
  readonly motivo: string;
  readonly paginaQueLaSirve?: string;
}

export interface Criterio {
  readonly fuentesPropias: readonly string[];
  readonly tiposDeServicio: readonly string[];
  readonly excepcionesConfirmadas: readonly ExcepcionConfirmada[];
  readonly minimoDisputables: number;
  readonly minimoDisputablesMotivo: string;
  readonly cortesDeDemanda: readonly CorteDeDemanda[];
  readonly demandaSinDatos: number;
  readonly demandaSinDatosMotivo: string;
  readonly localidad: readonly NivelDeLocalidad[];
  readonly diferenciacion: readonly { readonly categoria: string; readonly puntos: number; readonly motivo: string }[];
  readonly paginasPublicadasPuntos: number;
  readonly paginasPublicadasTerminos: readonly string[];
  readonly paginasPublicadasMotivo: string;
  readonly rangoFactor: number;
  readonly rangoBase: number;
  readonly categorias: readonly CategoriaDeServicio[];
  readonly porClusterPorDefecto: number;
  readonly exigeCategoriaDistinta: boolean;
  readonly solapeMaximoDeUrls: number;
  readonly vetos: readonly Veto[];
  readonly urlsPorCategoria: Readonly<Record<string, UrlCandidata>>;
  readonly urlsPorKeyword: Readonly<Record<string, UrlCandidata>>;
  readonly advertencias: readonly string[];
}

export function cargarCriterio(ruta: string = RUTA_CRITERIO): Criterio {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer el criterio de las 10 de Oro.\n  Ruta: ${ruta}\n` +
        `  Sin el, la lista saldria de umbrales escritos dentro del codigo, que es justo lo que\n` +
        `  este proyecto no hace: el criterio discutible vive en un archivo de datos, con su\n` +
        `  motivo y su fecha, para que un cambio futuro quede en el historial.`,
    );
  }
  const o = JSON.parse(crudo) as Record<string, never>;
  const puerta = (o["puertaDeServicioPropio"] ?? {}) as Record<string, never>;
  const minimo = (o["minimoDisputables"] ?? {}) as Record<string, never>;
  const demanda = (o["demanda"] ?? {}) as Record<string, never>;
  const sinDatos = (demanda["sinDatos"] ?? {}) as unknown as { puntos?: number; motivo?: string };
  const localidad = (o["localidad"] ?? {}) as Record<string, never>;
  const dif = (o["diferenciacion"] ?? {}) as Record<string, never>;
  const publicadas = (o["paginasPublicadas"] ?? {}) as unknown as {
    puntos?: number;
    terminos?: string[];
    nota?: string;
  };
  const rango = (o["pesoDeRango"] ?? {}) as unknown as { factor?: number; base?: number };
  const cats = (o["categoriasDeServicio"] ?? {}) as Record<string, never>;
  const cluster = (o["reglaDeCluster"] ?? {}) as Record<string, never>;
  const escape = (cluster["escape"] ?? {}) as unknown as {
    exigeCategoriaDistinta?: boolean;
    solapeMaximoDeUrls?: number;
  };
  const urls = (o["urls"] ?? {}) as Record<string, never>;

  return {
    fuentesPropias: (puerta["fuentesPropias"] as unknown as string[]) ?? [],
    tiposDeServicio: (puerta["tiposDeServicio"] as unknown as string[]) ?? [],
    excepcionesConfirmadas:
      ((puerta["excepcionesConfirmadas"] as unknown as { keywords?: ExcepcionConfirmada[] } | undefined)
        ?.keywords) ?? [],
    minimoDisputables: (minimo["valor"] as unknown as number) ?? 1,
    minimoDisputablesMotivo: (minimo["motivo"] as unknown as string) ?? "",
    cortesDeDemanda: (demanda["cortes"] as unknown as CorteDeDemanda[]) ?? [],
    demandaSinDatos: sinDatos.puntos ?? 15,
    demandaSinDatosMotivo: sinDatos.motivo ?? "",
    localidad: (localidad["niveles"] as unknown as NivelDeLocalidad[]) ?? [],
    diferenciacion:
      (dif["porCategoria"] as unknown as { categoria: string; puntos: number; motivo: string }[]) ?? [],
    paginasPublicadasPuntos: publicadas.puntos ?? 0,
    paginasPublicadasTerminos: publicadas.terminos ?? [],
    paginasPublicadasMotivo: publicadas.nota ?? "",
    rangoFactor: rango.factor ?? 4,
    rangoBase: rango.base ?? 5,
    categorias: (cats["orden"] as unknown as CategoriaDeServicio[]) ?? [],
    porClusterPorDefecto: (cluster["porClusterPorDefecto"] as unknown as number) ?? 1,
    exigeCategoriaDistinta: escape.exigeCategoriaDistinta ?? true,
    solapeMaximoDeUrls: escape.solapeMaximoDeUrls ?? 0,
    vetos: (o["vetos"] as unknown as Veto[]) ?? [],
    urlsPorCategoria: (urls["porCategoria"] as unknown as Record<string, UrlCandidata>) ?? {},
    urlsPorKeyword: (urls["porKeyword"] as unknown as Record<string, UrlCandidata>) ?? {},
    advertencias: (o["advertencias"] as unknown as string[]) ?? [],
  };
}

// ---------------------------------------------------------------------------
// Entradas
// ---------------------------------------------------------------------------

export interface Semilla {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly tipo: string;
  readonly procedencia: string;
  readonly rango: number;
}

export interface PosicionDelTop {
  readonly posicion: number;
  readonly dominio: string;
  readonly url: string;
  readonly tipo: string;
  readonly veredicto: string;
  readonly motivo: string;
}

/** Una cabeza con TODO lo que las fases anteriores midieron sobre ella, ya unido. */
export interface CabezaEntrada {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly tipoDePagina: string | null;
  readonly rango: number;
  readonly familia: string;
  readonly intent: string;
  readonly stage: string;
  readonly alcance: string;
  readonly motivoAlcance: string | null;
  readonly semilla: string | null;
  readonly volumenDinorank: number | null;
  readonly volumenAhrefs: number | null;
  readonly volumenFuente: string;
  readonly keywordDifficulty: number | null;
  readonly keywordDifficultyFuente: string;
  readonly trafficPotential: number | null;
  readonly trafficPotentialFuente: string;
  readonly nivel: "alto" | "medio" | "bajo";
  readonly disputables: number;
  readonly barreras: number;
  readonly posicionesMedidas: number;
  readonly primeraDisputable: number | null;
  readonly posiciones: readonly PosicionDelTop[];
  readonly competidoresEnTop: readonly { readonly domain: string; readonly domainRating: number | null }[];
  readonly razones: readonly string[];
}

export interface TerminoPropio {
  readonly termino: string;
  readonly keywordKey: string;
  readonly procedencia: string;
  readonly tipo: string;
}

// ---------------------------------------------------------------------------
// Normalizacion
// ---------------------------------------------------------------------------

/** Sin tildes y en minuscula. Las claves del universo ya vienen asi, las semillas no siempre. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function fuenteDe(procedencia: string): string {
  return procedencia.split(":")[0] ?? procedencia;
}

// ---------------------------------------------------------------------------
// Puerta 2: servicio propio
// ---------------------------------------------------------------------------

/**
 * Los terminos que el propio sitio declara como servicio.
 *
 * Las semillas de tipo `sede` quedan FUERA a proposito: `lima`, `san isidro`, `la molina` y
 * `santiago de surco` salieron de `locations.ts` y son geografia, no servicio. Si contaran,
 * cualquier keyword con un distrito pegado pasaria la puerta sin nombrar nada que el doctor
 * haga, y `neurocirujano san isidro` entraria por la puerta de atras.
 */
export function terminosDeServicioPropio(
  semillas: readonly Semilla[],
  criterio: Criterio,
): TerminoPropio[] {
  return semillas
    .filter(
      (s) => criterio.fuentesPropias.includes(fuenteDe(s.procedencia)) && criterio.tiposDeServicio.includes(s.tipo),
    )
    .map((s) => ({
      termino: normalizar(s.keywordKey),
      keywordKey: s.keywordKey,
      procedencia: s.procedencia,
      tipo: s.tipo,
    }))
    .sort((a, b) => b.termino.length - a.termino.length || (a.termino < b.termino ? -1 : 1));
}

export interface Procedencia {
  readonly como: "semilla" | "texto" | "confirmacion";
  readonly termino: string;
  readonly procedencia: string;
}

/**
 * Nombra esta cabeza algo que el consultorio declara que hace.
 *
 * Dos caminos, y el segundo hace falta de verdad: la cabeza `escoliosis` se sembro desde
 * COMPETITORS.md, pero el sitio publica una pagina cuyo H1 es "Escoliosis y deformidades de
 * columna". El servicio es del doctor aunque la semilla venga del vecino, y el texto lo
 * demuestra. Por eso la contencion es en los dos sentidos.
 */
export function servicioPropio(
  cabeza: CabezaEntrada,
  terminos: readonly TerminoPropio[],
  criterio: Criterio,
  semillas?: readonly Semilla[],
): Procedencia | null {
  // Excepcion confirmada por el cliente. Va PRIMERO porque su razon de ser es justamente que la
  // puerta automatica —que solo sabe leer el codigo del sitio— la habia dejado fuera. No es una
  // inferencia por parecido clinico: es alguien que sabe, diciendo que el doctor lo hace.
  const excepcion = criterio.excepcionesConfirmadas.find(
    (e) => normalizar(e.keywordKey) === normalizar(cabeza.keywordKey),
  );
  if (excepcion !== undefined) {
    return {
      como: "confirmacion",
      termino: excepcion.keywordKey,
      procedencia: `confirmado por ${excepcion.confirmadaPor} el ${excepcion.fecha}`,
    };
  }

  if (semillas !== undefined && cabeza.semilla !== null) {
    const s = semillas.find((x) => x.keyword === cabeza.semilla);
    if (s !== undefined && criterio.fuentesPropias.includes(fuenteDe(s.procedencia)) && criterio.tiposDeServicio.includes(s.tipo)) {
      return { como: "semilla", termino: s.keywordKey, procedencia: s.procedencia };
    }
  }

  const h = normalizar(cabeza.keywordKey);
  for (const t of terminos) {
    if (h.includes(t.termino) || t.termino.includes(h)) {
      return { como: "texto", termino: t.keywordKey, procedencia: t.procedencia };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Categoria de servicio
// ---------------------------------------------------------------------------

/**
 * A cual de las tres categorias de `services.ts` pertenece esta cabeza.
 *
 * Sirve para partir el cluster de 41 cabezas sin inventar nada: es la taxonomia que el propio
 * sitio declara y la que la fase 14 va a usar para repartir URLs.
 */
export function categoriaDe(keywordKey: string, criterio: Criterio): string {
  const h = normalizar(keywordKey);
  for (const c of criterio.categorias) {
    if (c.esPorDefecto === true) continue;
    if (c.terminos.some((t) => h.includes(normalizar(t)))) return c.id;
  }
  const porDefecto = criterio.categorias.find((c) => c.esPorDefecto === true);
  return porDefecto?.id ?? "sin-categoria";
}

// ---------------------------------------------------------------------------
// El valor de negocio
// ---------------------------------------------------------------------------

export interface Componente {
  readonly nombre: string;
  readonly puntos: number;
  readonly detalle: string;
}

export interface Valor {
  readonly puntos: number;
  readonly componentes: readonly Componente[];
  readonly razones: readonly string[];
  readonly demanda: { readonly cifra: number | null; readonly fuente: string };
  readonly localidad: string | null;
}

function puntosDeDemanda(cifra: number, criterio: Criterio): number {
  for (const c of criterio.cortesDeDemanda) if (cifra >= c.desde) return c.puntos;
  return 0;
}

export function valorDeNegocio(cabeza: CabezaEntrada, criterio: Criterio, propio: Procedencia): Valor {
  const componentes: Componente[] = [];
  const razones: string[] = [];

  // --- Demanda: potencial de trafico primero, volumen despues ---
  let cifra: number | null = null;
  let fuente = "sin_datos";
  let puntos: number;

  if (cabeza.trafficPotential !== null && cabeza.trafficPotential > 0) {
    cifra = cabeza.trafficPotential;
    fuente = "ahrefs:traffic_potential";
    puntos = puntosDeDemanda(cifra, criterio);
    razones.push(
      `Demanda por POTENCIAL DE TRAFICO: ${cifra}. Se mide asi y no por volumen propio porque la ` +
        `pagina que gana la keyword captura tambien su cola; en varias cabezas el potencial supera ` +
        `al volumen del termino.`,
    );
  } else {
    const vols: { v: number; f: string }[] = [];
    if (cabeza.volumenDinorank !== null && cabeza.volumenDinorank > 0)
      vols.push({ v: cabeza.volumenDinorank, f: "dinorank" });
    if (cabeza.volumenAhrefs !== null && cabeza.volumenAhrefs > 0) vols.push({ v: cabeza.volumenAhrefs, f: "ahrefs" });
    vols.sort((a, b) => b.v - a.v || (a.f < b.f ? -1 : 1));

    if (vols.length > 0) {
      cifra = (vols[0] as { v: number; f: string }).v;
      fuente = (vols[0] as { v: number; f: string }).f;
      puntos = puntosDeDemanda(cifra, criterio);
      razones.push(`Demanda por volumen: ${cifra} (${fuente}). Sin potencial de trafico devuelto por Ahrefs.`);
    } else if (cabeza.volumenFuente === "sin_datos" || cabeza.volumenFuente === "no_consultado") {
      puntos = criterio.demandaSinDatos;
      razones.push(
        `Demanda SIN DATO, que no es cero: ${criterio.demandaSinDatosMotivo.slice(0, 220)}`,
      );
    } else {
      cifra = 0;
      fuente = cabeza.volumenFuente;
      puntos = 0;
      razones.push(`Volumen CERO medido por ${fuente}. Es un cero real, distinto de un hueco de la fuente.`);
    }
  }
  componentes.push({ nombre: "demanda", puntos, detalle: cifra === null ? `sin dato (${fuente})` : `${cifra} (${fuente})` });

  // --- Localidad ---
  const h = normalizar(cabeza.keywordKey);
  let nivelLocal: NivelDeLocalidad | null = null;
  for (const n of criterio.localidad) {
    if (n.terminos.some((t) => h.includes(normalizar(t)))) {
      nivelLocal = n;
      break;
    }
  }
  componentes.push({
    nombre: "localidad",
    puntos: nivelLocal?.puntos ?? 0,
    detalle: nivelLocal?.nivel ?? "sin marca geografica",
  });
  if (nivelLocal !== null) {
    razones.push(
      nivelLocal.nivel === "distrito"
        ? `Marca geografica de DISTRITO. Pesa menos que Lima a proposito: esta medido que trece ` +
          `modificadores de distrito caen en un solo cluster, o sea una pagina y no trece.`
        : `Marca geografica de nivel ${nivelLocal.nivel}: el que busca puede venir a la consulta.`,
    );
  }

  /*
   * Los dos bonos de abajo son propiedades de la PAGINA DE SERVICIO, no de cada variante geo de
   * la keyword. Si se pagaran en todas, `ortopedia infantil surco`, `... la molina`,
   * `... clinica tezza`, `... clinica sanna` y `... clinica ricardo palma` cobrarian los mismos
   * 22 puntos cada una y coparian la lista con cinco formas del mismo servicio. Se pagan solo en
   * la cabeza canonica —sin marca geografica o a nivel Lima—, porque la pagina de servicio es UNA
   * para toda Lima. Las variantes de distrito y de clinica las sirve una pagina de sede, que es
   * otro compromiso y se evalua por su cuenta.
   */
  const esCanonica = nivelLocal === null || nivelLocal.nivel === "lima";

  // --- Diferenciacion: valor que ninguna metrica de volumen ve ---
  const categoria = categoriaDe(cabeza.keywordKey, criterio);
  const dif = esCanonica ? criterio.diferenciacion.find((d) => d.categoria === categoria) : undefined;
  componentes.push({
    nombre: "diferenciacion",
    puntos: dif?.puntos ?? 0,
    detalle:
      dif !== undefined
        ? `sin competencia directa en ${categoria}`
        : esCanonica
          ? "categoria con competencia directa perfilada"
          : "variante geo: el bono es de la pagina de servicio y ya lo cobra su cabeza canonica",
  });
  if (dif !== undefined) razones.push(`Categoria sin competencia directa: ${dif.motivo}`);

  // --- Pagina publicada: el trabajo de contenido ya esta presupuestado en v1.1 ---
  const excepcionConPagina = criterio.excepcionesConfirmadas.find(
    (e) => normalizar(e.keywordKey) === h && e.paginaQueLaSirve !== undefined,
  );
  const publicada = !esCanonica
    ? undefined
    : (criterio.paginasPublicadasTerminos.find((t) => h.includes(normalizar(t))) ??
      (excepcionConPagina === undefined ? undefined : excepcionConPagina.keywordKey));
  componentes.push({
    nombre: "pagina publicada",
    puntos: publicada === undefined ? 0 : criterio.paginasPublicadasPuntos,
    detalle: publicada ?? "no cae sobre una pagina de servicio comprometida a nivel Lima",
  });
  if (publicada !== undefined) {
    razones.push(
      `Cae sobre una de las cuatro paginas de servicio que v1.1 ya tiene como requisito activo ` +
        `("${publicada}"): convierte antes y cuesta menos que una keyword que exige inventar una URL.`,
    );
  }

  // --- Rango: el valor de negocio que la fase 12 ya asigno ---
  const pr = (criterio.rangoBase - cabeza.rango) * criterio.rangoFactor;
  componentes.push({ nombre: "rango", puntos: pr, detalle: `rango ${cabeza.rango} de la lista de candidatas` });

  razones.push(
    `Servicio propio confirmado por ${propio.como === "semilla" ? "su semilla" : "coincidencia de texto con"} ` +
      `"${propio.termino}" (${propio.procedencia}).`,
  );

  return {
    puntos: componentes.reduce((a, c) => a + c.puntos, 0),
    componentes,
    razones,
    demanda: { cifra, fuente },
    localidad: nivelLocal?.nivel ?? null,
  };
}

// ---------------------------------------------------------------------------
// Candidatas y rechazos
// ---------------------------------------------------------------------------

export interface Candidata {
  readonly cabeza: CabezaEntrada;
  readonly valor: Valor;
  readonly categoria: string;
  readonly propio: Procedencia;
}

export interface Rechazada {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly motivo: string;
  readonly puerta: string;
}

const PESO_NIVEL: Record<string, number> = { alto: 0, medio: 1, bajo: 2 };

/** Orden estable y total: valor, alcanzabilidad, disputables, rango, clave. */
export function ordenarCandidatas(candidatas: readonly Candidata[]): Candidata[] {
  return [...candidatas].sort(
    (a, b) =>
      b.valor.puntos - a.valor.puntos ||
      (PESO_NIVEL[a.cabeza.nivel] ?? 9) - (PESO_NIVEL[b.cabeza.nivel] ?? 9) ||
      b.cabeza.disputables - a.cabeza.disputables ||
      a.cabeza.rango - b.cabeza.rango ||
      (a.cabeza.keywordKey < b.cabeza.keywordKey ? -1 : 1),
  );
}

export function evaluarCandidatas(
  cabezas: readonly CabezaEntrada[],
  semillas: readonly Semilla[],
  criterio: Criterio,
): { candidatas: Candidata[]; rechazadas: Rechazada[] } {
  const terminos = terminosDeServicioPropio(semillas, criterio);
  const vetos = new Map(criterio.vetos.map((v) => [normalizar(v.keywordKey), v.motivo]));

  const candidatas: Candidata[] = [];
  const rechazadas: Rechazada[] = [];

  for (const c of cabezas) {
    const base = { keyword: c.keyword, keywordKey: c.keywordKey };

    if (c.alcance !== "objetivo") {
      rechazadas.push({
        ...base,
        puerta: "alcance",
        motivo: `Alcance ${c.alcance}${c.motivoAlcance === null ? "" : ` (${c.motivoAlcance})`}: la fase 12 ya la dejo fuera del universo objetivo, con su motivo escrito.`,
      });
      continue;
    }

    const veto = vetos.get(normalizar(c.keywordKey));
    if (veto !== undefined) {
      rechazadas.push({ ...base, puerta: "veto", motivo: `Veto declarado en golden-criterio.json: ${veto}` });
      continue;
    }

    const propio = servicioPropio(c, terminos, criterio, semillas);
    if (propio === null) {
      rechazadas.push({
        ...base,
        puerta: "servicio propio",
        motivo:
          `No nombra ningun servicio que el consultorio declare. Su semilla salio del perfil de un ` +
          `competidor (COMPETITORS.md) y no del codigo del sitio, asi que perseguirla seria reclamar ` +
          `algo que el doctor no publica que haga.`,
      });
      continue;
    }

    if (c.disputables < criterio.minimoDisputables) {
      rechazadas.push({
        ...base,
        puerta: "piso de evidencia",
        motivo:
          `${c.disputables} posiciones disputables sobre ${c.posicionesMedidas} medidas: no hay sitio ` +
          `donde entrar. ${criterio.minimoDisputablesMotivo.slice(0, 200)}`,
      });
      continue;
    }

    candidatas.push({
      cabeza: c,
      valor: valorDeNegocio(c, criterio, propio),
      categoria: categoriaDe(c.keywordKey, criterio),
      propio,
    });
  }

  return { candidatas: ordenarCandidatas(candidatas), rechazadas };
}

// ---------------------------------------------------------------------------
// La eleccion, con la regla de cluster
// ---------------------------------------------------------------------------

export interface Elegida extends Candidata {
  readonly puesto: number;
  readonly motivoDeCluster: string;
  readonly urlCandidata: UrlCandidata;
}

export interface Desplazada {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly motivo: string;
}

function urlsDe(cabeza: CabezaEntrada): Set<string> {
  return new Set(
    cabeza.posiciones.map((p) =>
      p.url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/+$/, "")
        .toLowerCase(),
    ),
  );
}

function solape(a: CabezaEntrada, b: CabezaEntrada): number {
  const A = urlsDe(a);
  const B = urlsDe(b);
  let n = 0;
  for (const u of A) if (B.has(u)) n += 1;
  return n;
}

function urlPara(c: Candidata, criterio: Criterio): UrlCandidata {
  return (
    criterio.urlsPorKeyword[normalizar(c.cabeza.keywordKey)] ??
    criterio.urlsPorCategoria[c.categoria] ?? { url: "por definir", estado: "por definir", accion: "decide MAP-04" }
  );
}

/**
 * Camina la lista ya ordenada y aplica la regla de cluster.
 *
 * Una cabeza de un cluster ya representado entra SOLO si cumple las dos condiciones: otra
 * categoria de servicio —o sea, otra URL en la fase 14— y solape MEDIDO de urls por debajo del
 * umbral contra cada cabeza ya elegida de ese cluster. La segunda condicion no se supone: el
 * cluster de 41 se formo por transitividad, y medido de a pares hay cabezas suyas que comparten
 * cero urls. No son la misma SERP; quedaron encadenadas a traves de terceras.
 */
export function elegir(
  candidatas: readonly Candidata[],
  criterio: Criterio,
  cuantas = 10,
): { elegidas: Elegida[]; desplazadas: Desplazada[] } {
  const ordenadas = ordenarCandidatas(candidatas);
  const elegidas: Elegida[] = [];
  const desplazadas: Desplazada[] = [];
  const porCluster = new Map<string, Candidata[]>();

  for (const c of ordenadas) {
    if (elegidas.length >= cuantas) {
      desplazadas.push({
        keyword: c.cabeza.keyword,
        keywordKey: c.cabeza.keywordKey,
        cluster: c.cabeza.cluster,
        motivo: `Quedo fuera del corte de ${cuantas} con ${c.valor.puntos} puntos de valor de negocio.`,
      });
      continue;
    }

    const clave = c.cabeza.cluster ?? "sin-cluster";
    const ya = porCluster.get(clave) ?? [];
    let motivoDeCluster = "primera cabeza de su cluster";

    if (ya.length >= criterio.porClusterPorDefecto) {
      const mismaCategoria = ya.find((y) => y.categoria === c.categoria);
      if (criterio.exigeCategoriaDistinta && mismaCategoria !== undefined) {
        desplazadas.push({
          keyword: c.cabeza.keyword,
          keywordKey: c.cabeza.keywordKey,
          cluster: c.cabeza.cluster,
          motivo:
            `Mismo cluster (${clave}) y misma categoria de servicio (${c.categoria}) que ` +
            `"${mismaCategoria.cabeza.keyword}", que ya entro con mas valor de negocio. Serian la misma pagina.`,
        });
        continue;
      }
      const maximo = Math.max(...ya.map((y) => solape(y.cabeza, c.cabeza)));
      if (maximo > criterio.solapeMaximoDeUrls) {
        desplazadas.push({
          keyword: c.cabeza.keyword,
          keywordKey: c.cabeza.keywordKey,
          cluster: c.cabeza.cluster,
          motivo:
            `Mismo cluster (${clave}) y su top 10 comparte ${maximo} url${maximo === 1 ? "" : "s"} con una ` +
            `cabeza ya elegida: es la misma SERP y le tocaria la misma pagina.`,
        });
        continue;
      }
      motivoDeCluster =
        `Comparte cluster (${clave}) con una cabeza ya elegida, pero entra igual por dos hechos ` +
        `medidos: es de otra categoria de servicio (${c.categoria}), asi que la fase 14 le va a dar ` +
        `otra URL, y su top 10 comparte solape medido ${maximo} con ella. El cluster se formo por ` +
        `transitividad, no porque estas dos sean la misma SERP.`;
    }

    elegidas.push({ ...c, puesto: elegidas.length + 1, motivoDeCluster, urlCandidata: urlPara(c, criterio) });
    porCluster.set(clave, [...ya, c]);
  }

  return { elegidas, desplazadas };
}

// ---------------------------------------------------------------------------
// La justificacion en prosa
// ---------------------------------------------------------------------------

function ocupantes(cabeza: CabezaEntrada): string {
  const barreras = cabeza.posiciones.filter((p) => p.veredicto === "barrera");
  const dominios = [...new Set(cabeza.posiciones.slice(0, 5).map((p) => p.dominio))].slice(0, 3);
  const cola = barreras.length === 0 ? "sin una sola barrera medida" : `${barreras.length} barrera${barreras.length === 1 ? "" : "s"}`;
  return `${dominios.join(", ")} (${cola})`;
}

/**
 * Por que ESTA, con el dato que la sostiene.
 *
 * No dice "alto valor comercial": dice que se opera, quien esta adelante y por que se le puede
 * ganar. Si la frase se puede escribir sin mirar los datos, no sirve.
 */
export function justificacion(elegida: Elegida, criterio: Criterio): string {
  const c = elegida.cabeza;
  const partes: string[] = [];

  const cat = criterio.categorias.find((x) => x.id === elegida.categoria);
  if (elegida.propio.como === "confirmacion") {
    partes.push(
      `El doctor la opera y lo confirmo el cliente: "${elegida.propio.termino}" entra por ` +
        `${elegida.propio.procedencia}, no por lo que el codigo del sitio publica hoy. Cae dentro de ` +
        `${cat?.nombre ?? elegida.categoria}.`,
    );
  } else {
    partes.push(
      `Es ${elegida.propio.como === "semilla" ? "un servicio declarado" : "materia"} del consultorio: ` +
        `"${elegida.propio.termino}" sale de ${elegida.propio.procedencia}, dentro de ${cat?.nombre ?? elegida.categoria}.`,
    );
  }

  const d = elegida.valor.demanda;
  if (d.fuente === "ahrefs:traffic_potential" && d.cifra !== null) {
    // El texto no puede afirmar lo que los numeros contradicen: el potencial supera al volumen
    // propio en unas cabezas y en otras no, y las dos situaciones se leen distinto.
    const propio =
      c.volumenAhrefs !== null && c.volumenAhrefs > 0
        ? { cifra: c.volumenAhrefs, fuente: "ahrefs" }
        : c.volumenDinorank !== null && c.volumenDinorank > 0
          ? { cifra: c.volumenDinorank, fuente: "dinorank" }
          : null;

    if (propio === null) {
      partes.push(
        `Potencial de trafico ${d.cifra} sin volumen propio medido: toda la demanda que se ve viene ` +
          `de la cola que esa pagina capturaria.`,
      );
    } else if (d.cifra > propio.cifra) {
      partes.push(
        `Potencial de trafico ${d.cifra} contra un volumen propio de ${propio.cifra} (${propio.fuente}): ` +
          `la pagina que la gane captura mas que el termino en si, y por eso ordenar por volumen la ` +
          `dejaria abajo.`,
      );
    } else {
      partes.push(
        `Volumen ${propio.cifra} (${propio.fuente}) con potencial de trafico ${d.cifra}: la demanda esta ` +
          `en el termino, y Ahrefs estima que la pagina ganadora se lleva una parte y no el total.`,
      );
    }
  } else if (d.cifra !== null && d.cifra > 0) {
    partes.push(`Volumen ${d.cifra} segun ${d.fuente}.`);
  } else {
    partes.push(
      `Sin volumen medido, que no es sin mercado: DinoRank trunca las relacionadas en 900 y no ` +
        `devuelve la keyword consultada. El hueco es de la fuente y esta documentado.`,
    );
  }

  partes.push(
    `Su cluster es ${c.cluster ?? "ninguno"} y la SERP premia ahi ${c.tipoDePagina ?? "un tipo sin clasificar"}.`,
  );

  partes.push(
    `Hoy su top 10 lo encabezan ${ocupantes(c)}: ${c.disputables} de ${c.posicionesMedidas} posiciones ` +
      `medidas son disputables y la primera libre es la ${c.primeraDisputable ?? "ninguna"}.`,
  );

  if (c.keywordDifficulty !== null && c.keywordDifficultyFuente === "ahrefs") {
    partes.push(`KD ${c.keywordDifficulty} declarado por Ahrefs.`);
  } else {
    partes.push(`Sin KD: Ahrefs no devolvio dificultad para esta cabeza (${c.keywordDifficultyFuente}), y no se inventa.`);
  }

  if (c.competidoresEnTop.length > 0) {
    partes.push(
      `Competidores perfilados presentes: ` +
        c.competidoresEnTop.map((x) => `${x.domain} (DR ${x.domainRating ?? "?"})`).join(", ") +
        `. La linea de base propia es DR 0 y en este nicho eso no es la barrera: sus paginas interiores rankean con cero dominios de referencia.`,
    );
  } else {
    partes.push(`Ningun competidor perfilado aparece en este top 10.`);
  }

  partes.push(`Candidata a ganarla: ${elegida.urlCandidata.url} (${elegida.urlCandidata.estado}, ${elegida.urlCandidata.accion}).`);

  return partes.join(" ");
}

// ---------------------------------------------------------------------------
// Las descartadas de mayor volumen
// ---------------------------------------------------------------------------

export interface FilaDelUniverso {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly volumen: number | null;
  readonly volumenFuente: string;
  readonly alcance: string;
  readonly motivoAlcance: string | null;
  readonly intent: string;
}

export interface Descartada {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly volumen: number | null;
  readonly volumenFuente: string;
  readonly motivo: string;
}

const MOTIVOS_DE_ALCANCE: Record<string, string> = {
  marca_ajena:
    "Es MARCA DE UN COMPETIDOR. Se lee como inteligencia y no se persigue nunca: quien la busca ya eligio otra clinica, y posicionar sobre la marca ajena no trae ese paciente.",
  codificacion_clinica:
    "Es un CODIGO CIE-10. Lo busca personal administrativo facturando, no un paciente con dolor. Encabeza cualquier orden por volumen y por eso queda escrito aca.",
  retail_ortopedico: "Es RETAIL ortopedico: quien busca quiere comprar un producto, no consultar a un traumatologo.",
  marca_propia: "Es marca propia: ya se gana sin trabajo de posicionamiento.",
};

/**
 * Las de mayor volumen del universo que NO entraron, con la razon de cada una.
 *
 * Va ordenado por volumen a proposito: es el orden en el que alguien va a abrir el Sheet y
 * preguntar por que no estan. Sin esta seccion la lista no se puede discutir.
 */
export function descartadasDeMayorVolumen(
  universo: readonly FilaDelUniverso[],
  elegidas: ReadonlySet<string>,
  rechazos: ReadonlyMap<string, string>,
  criterio: Criterio,
  cuantas = 20,
): Descartada[] {
  const vetos = new Map(criterio.vetos.map((v) => [normalizar(v.keywordKey), v.motivo]));

  const ordenado = [...universo]
    .filter((k) => typeof k.volumen === "number" && (k.volumen ?? 0) > 0)
    .filter((k) => !elegidas.has(k.keywordKey))
    .sort((a, b) => (b.volumen ?? 0) - (a.volumen ?? 0) || (a.keywordKey < b.keywordKey ? -1 : 1));

  const salida: Descartada[] = [];
  for (const k of ordenado) {
    if (salida.length >= cuantas) break;
    let motivo: string;

    if (k.alcance !== "objetivo") {
      motivo =
        MOTIVOS_DE_ALCANCE[k.motivoAlcance ?? ""] ??
        `Fuera del universo objetivo desde la fase 12 (${k.motivoAlcance ?? k.alcance}).`;
    } else {
      const veto = vetos.get(normalizar(k.keywordKey));
      const rechazo = rechazos.get(k.keywordKey);
      if (veto !== undefined) motivo = `Veto declarado: ${veto}`;
      else if (rechazo !== undefined) motivo = rechazo;
      else
        motivo =
          `Es de alcance objetivo pero NUNCA se le midio la SERP: no fue una de las 91 cabezas ` +
          `capturadas con SerpApi, asi que no hay evidencia de si se puede ganar. Quedo fuera por ` +
          `limite de presupuesto de medicion, no por un juicio de negocio.`;
    }

    salida.push({ keyword: k.keyword, keywordKey: k.keywordKey, volumen: k.volumen, volumenFuente: k.volumenFuente, motivo });
  }
  return salida;
}

// ---------------------------------------------------------------------------
// Las sedes: por que ninguna keyword de sede llego a la lista
// ---------------------------------------------------------------------------

export interface MejorPorSede {
  readonly sede: string;
  readonly keyword: string | null;
  readonly keywordKey: string | null;
  readonly valor: number | null;
  readonly nivelDeAlcance: string | null;
  readonly disputables: number | null;
  readonly posicionesMedidas: number | null;
  readonly primeraDisputable: number | null;
  readonly motivo: string;
}

/**
 * La mejor candidata de cada sede viva, entrara o no en las diez.
 *
 * Existe porque la pregunta la va a hacer Juan y el documento tiene que contestarla sin que
 * nadie abra un json: `PROJECT.md` declara la sede de Ricardo Palma como prioritaria y v1.1
 * planifica una pagina por cada una de las cuatro. Si ninguna keyword de sede entro, hay que
 * poder leer con que numeros se quedaron fuera.
 */
export function mejoresPorSede(
  candidatas: readonly Candidata[],
  elegidas: ReadonlySet<string>,
  criterio: Criterio,
): MejorPorSede[] {
  const nivelesDeSede = criterio.localidad.filter((n) => n.nivel === "clinica" || n.nivel === "distrito");
  const terminos = [...new Set(nivelesDeSede.flatMap((n) => n.terminos.map((t) => normalizar(t))))].filter(
    (t) => t !== "cerca de mi",
  );

  return terminos
    .map((sede) => {
      const suyas = ordenarCandidatas(candidatas.filter((c) => normalizar(c.cabeza.keywordKey).includes(sede)));
      const mejor = suyas[0];
      if (mejor === undefined) {
        return {
          sede,
          keyword: null,
          keywordKey: null,
          valor: null,
          nivelDeAlcance: null,
          disputables: null,
          posicionesMedidas: null,
          primeraDisputable: null,
          motivo: "Ninguna cabeza con SERP medida nombra esta sede.",
        };
      }
      const dentro = elegidas.has(mejor.cabeza.keywordKey);
      return {
        sede,
        keyword: mejor.cabeza.keyword,
        keywordKey: mejor.cabeza.keywordKey,
        valor: mejor.valor.puntos,
        nivelDeAlcance: mejor.cabeza.nivel,
        disputables: mejor.cabeza.disputables,
        posicionesMedidas: mejor.cabeza.posicionesMedidas,
        primeraDisputable: mejor.cabeza.primeraDisputable,
        motivo: dentro
          ? "Entro en las diez."
          : `Se quedo fuera con ${mejor.valor.puntos} puntos de valor de negocio: ninguna de sus cabezas ` +
            `tiene volumen medido y su top 10 deja ${mejor.cabeza.disputables} de ${mejor.cabeza.posicionesMedidas} ` +
            `posiciones disputables, con la primera libre en la ${mejor.cabeza.primeraDisputable ?? "ninguna"}.`,
      };
    })
    .sort((a, b) => (b.valor ?? -1) - (a.valor ?? -1) || (a.sede < b.sede ? -1 : 1));
}

// ---------------------------------------------------------------------------
// El artefacto estructurado
// ---------------------------------------------------------------------------

export interface KeywordDeOro {
  readonly puesto: number;
  readonly keyword: string;
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly tipoDePagina: string | null;
  readonly categoria: string;
  readonly intent: string;
  readonly stage: string;
  readonly volumenDinorank: number | null;
  readonly volumenAhrefs: number | null;
  readonly keywordDifficulty: number | null;
  readonly keywordDifficultyFuente: string;
  readonly trafficPotential: number | null;
  readonly trafficPotentialFuente: string;
  readonly nivelDeAlcance: string;
  readonly disputables: number;
  readonly posicionesMedidas: number;
  readonly primeraDisputable: number | null;
  readonly ocupanTop10: readonly string[];
  readonly competidoresEnTop: readonly { readonly domain: string; readonly domainRating: number | null }[];
  readonly valorDeNegocio: number;
  readonly componentesDeValor: readonly Componente[];
  readonly justificacion: string;
  readonly motivoDeCluster: string;
  readonly urlCandidata: UrlCandidata;
}

export interface Golden {
  readonly schema: number;
  readonly generadoPor: string;
  readonly requisito: string;
  readonly keywords: readonly KeywordDeOro[];
  readonly descartadasDeMayorVolumen: readonly Descartada[];
  readonly casiElegidas: readonly Desplazada[];
  readonly sedes: readonly MejorPorSede[];
  readonly advertencias: readonly string[];
}

export function construir(
  seleccion: { elegidas: readonly Elegida[]; desplazadas: readonly Desplazada[] },
  descartadas: readonly Descartada[],
  criterio: Criterio,
  candidatas: readonly Candidata[] = [],
): Golden {
  return {
    schema: 1,
    generadoPor: "plan 13-05, seo-tools/src/phase13/golden-run.ts",
    requisito: "KWR-06",
    keywords: seleccion.elegidas.map((e) => ({
      puesto: e.puesto,
      keyword: e.cabeza.keyword,
      keywordKey: e.cabeza.keywordKey,
      cluster: e.cabeza.cluster,
      tipoDePagina: e.cabeza.tipoDePagina,
      categoria: e.categoria,
      intent: e.cabeza.intent,
      stage: e.cabeza.stage,
      volumenDinorank: e.cabeza.volumenDinorank,
      volumenAhrefs: e.cabeza.volumenAhrefs,
      keywordDifficulty: e.cabeza.keywordDifficulty,
      keywordDifficultyFuente: e.cabeza.keywordDifficultyFuente,
      trafficPotential: e.cabeza.trafficPotential,
      trafficPotentialFuente: e.cabeza.trafficPotentialFuente,
      nivelDeAlcance: e.cabeza.nivel,
      disputables: e.cabeza.disputables,
      posicionesMedidas: e.cabeza.posicionesMedidas,
      primeraDisputable: e.cabeza.primeraDisputable,
      ocupanTop10: e.cabeza.posiciones.map((p) => p.dominio),
      competidoresEnTop: e.cabeza.competidoresEnTop,
      valorDeNegocio: e.valor.puntos,
      componentesDeValor: e.valor.componentes,
      justificacion: justificacion(e, criterio),
      motivoDeCluster: e.motivoDeCluster,
      urlCandidata: e.urlCandidata,
    })),
    descartadasDeMayorVolumen: descartadas,
    casiElegidas: seleccion.desplazadas.slice(0, 12),
    sedes: mejoresPorSede(candidatas, new Set(seleccion.elegidas.map((e) => e.cabeza.keywordKey)), criterio),
    advertencias: criterio.advertencias,
  };
}

export function serializar(golden: Golden): string {
  return `${JSON.stringify(golden, null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// El entregable legible
// ---------------------------------------------------------------------------

function fmt(v: number | null): string {
  return v === null ? "sin datos" : String(v);
}

export function documento(golden: Golden, criterio: Criterio): string {
  const l: string[] = [];

  l.push(`# Las 10 de Oro — fase 13 (KWR-06)`);
  l.push("");
  l.push(
    `Diez keywords por las que vale la pena pelear primero, elegidas **por valor de negocio y`,
    `despues por alcanzabilidad**, que es el orden que fija D-10 y no al reves. Salen de las 91`,
    `cabezas con SERP de Lima medida, sobre un universo objetivo de 4.766.`,
  );
  l.push("");
  l.push(
    `> **La pregunta que este documento tiene que contestar es por que estas diez y no las diez de`,
    `> mayor volumen.** La respuesta corta: las dos de mayor volumen del universo son marca de`,
    `> competidores, las dos siguientes son codigos CIE-10 que busca personal administrativo, y el`,
    `> potencial de trafico supera al volumen propio en varias de las que si entraron. Un orden por`,
    `> volumen se pierde las tres cosas. La respuesta larga esta en la seccion de las que no entraron.`,
  );
  l.push("");

  // --- 1. Las diez ---
  l.push(`## Las diez`);
  l.push("");
  l.push(`| # | Keyword | Cluster | Tipo de pagina | Intencion | Vol. Ahrefs | Vol. DinoRank | KD | Potencial | Alcance | Disputables |`);
  l.push(`|---:|---|---|---|---|---:|---:|---:|---:|---|---:|`);
  for (const k of golden.keywords) {
    l.push(
      `| ${k.puesto} | **${k.keyword}** | ${k.cluster ?? "sin datos"} | ${k.tipoDePagina ?? "sin datos"} | ` +
        `${k.intent} | ${fmt(k.volumenAhrefs)} | ${fmt(k.volumenDinorank)} | ${fmt(k.keywordDifficulty)} | ` +
        `${fmt(k.trafficPotential)} | ${k.nivelDeAlcance} | ${k.disputables}/${k.posicionesMedidas} |`,
    );
  }
  l.push("");
  l.push(`Donde dice \`sin datos\` es que la fuente no lo devolvio. **No es cero**, y la distincion`);
  l.push(`importa: DinoRank trunca las relacionadas en 900 y nunca devuelve la keyword consultada, asi`);
  l.push(`que varias condiciones centrales del negocio no tienen volumen propio por un limite de la`);
  l.push(`herramienta y no del mercado.`);
  l.push("");

  l.push(`### En cuantas paginas caen`);
  l.push("");
  const porCluster = new Map<string, KeywordDeOro[]>();
  for (const k of golden.keywords) {
    const c = k.cluster ?? "sin-cluster";
    porCluster.set(c, [...(porCluster.get(c) ?? []), k]);
  }
  l.push(`Las diez se reparten en **${porCluster.size} clusters**, que es lo que evita que sean una`);
  l.push(`sola pagina disfrazada de diez.`);
  l.push("");
  l.push(`| Cluster | Keywords de oro | Tipo de pagina que premia la SERP |`);
  l.push(`|---|---|---|`);
  for (const [c, ks] of [...porCluster.entries()].sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1))) {
    l.push(`| ${c} | ${ks.map((k) => k.keyword).join(", ")} | ${ks[0]?.tipoDePagina ?? "sin datos"} |`);
  }
  l.push("");
  const compartidos = [...porCluster.entries()].filter(([, ks]) => ks.length > 1);
  if (compartidos.length > 0) {
    l.push(`**Los clusters con mas de una, y por que entraron las dos:**`);
    l.push("");
    for (const [, ks] of compartidos) {
      for (const k of ks.slice(1)) l.push(`- **${k.keyword}** — ${k.motivoDeCluster}`);
    }
    l.push("");
  }

  // --- 2. La justificacion de cada una ---
  l.push(`## Por que cada una`);
  l.push("");
  for (const k of golden.keywords) {
    l.push(`### ${k.puesto}. ${k.keyword}`);
    l.push("");
    l.push(k.justificacion);
    l.push("");
    l.push(
      `| Cluster | Tipo de pagina | Intencion y etapa | Ahrefs | DinoRank | KD | Potencial | Disputables | Primera libre |`,
    );
    l.push(`|---|---|---|---:|---:|---:|---:|---:|---:|`);
    l.push(
      `| ${k.cluster ?? "sin datos"} | ${k.tipoDePagina ?? "sin datos"} | ${k.intent} / ${k.stage} | ` +
        `${fmt(k.volumenAhrefs)} | ${fmt(k.volumenDinorank)} | ${fmt(k.keywordDifficulty)} | ${fmt(k.trafficPotential)} | ` +
        `${k.disputables}/${k.posicionesMedidas} | ${fmt(k.primeraDisputable)} |`,
    );
    l.push("");
    l.push(`**Quien ocupa hoy su top 10:** ${k.ocupanTop10.join(", ") || "sin captura"}.`);
    l.push("");
    l.push(
      `**URL candidata:** \`${k.urlCandidata.url}\` — ${k.urlCandidata.estado}, hay que **${k.urlCandidata.accion}**.`,
    );
    l.push("");
  }

  // --- 3. Las que no entraron ---
  l.push(`## Las que no entraron, y por que`);
  l.push("");
  l.push(
    `Ordenadas por volumen, que es el orden en el que alguien va a abrir el Sheet y preguntar por`,
    `ellas. Sin esta seccion la lista no se puede discutir.`,
  );
  l.push("");
  l.push(`| Volumen | Keyword | Por que no |`);
  l.push(`|---:|---|---|`);
  for (const d of golden.descartadasDeMayorVolumen) {
    l.push(`| ${fmt(d.volumen)} | ${d.keyword} | ${d.motivo} |`);
  }
  l.push("");

  if (golden.casiElegidas.length > 0) {
    l.push(`### Las que se quedaron cerca`);
    l.push("");
    l.push(`Pasaron las tres puertas y quedaron fuera del corte. Es donde Juan puede decir "esta si".`);
    l.push("");
    l.push(`| Keyword | Cluster | Por que quedo fuera |`);
    l.push(`|---|---|---|`);
    for (const d of golden.casiElegidas) l.push(`| ${d.keyword} | ${d.cluster ?? "sin datos"} | ${d.motivo} |`);
    l.push("");
  }

  const sedesMedidas = golden.sedes.filter((s) => s.keyword !== null);
  if (sedesMedidas.length > 0) {
    l.push(`### Las sedes y los distritos, y con que numeros quedaron`);
    l.push("");
    l.push(
      `Pregunta obligada, porque \`PROJECT.md\` declara la sede de Ricardo Palma como prioritaria y v1.1`,
      `planifica una pagina por cada una de las cuatro. **Ninguna keyword de sede o de distrito entro en`,
      `las diez, y el motivo NO es que sean dificiles:** varias son de las mas ganables de todo el`,
      `universo medido. El motivo es de demanda. Ninguna tiene volumen medido, y su marca geografica`,
      `pesa menos que la de nivel Lima porque una pagina de sede sirve a un distrito mientras que la`,
      `de servicio sirve a toda la ciudad. Se quedaron todas en el mismo puntaje.`,
    );
    l.push("");
    l.push(`| Sede o distrito | Mejor cabeza medida | Valor | Alcance | Disputables | Primera libre |`);
    l.push(`|---|---|---:|---|---:|---:|`);
    for (const s of sedesMedidas) {
      l.push(
        `| ${s.sede} | ${s.keyword ?? ""} | ${fmt(s.valor)} | ${s.nivelDeAlcance ?? "sin datos"} | ` +
          `${s.disputables === null ? "sin datos" : `${s.disputables}/${s.posicionesMedidas}`} | ${fmt(s.primeraDisputable)} |`,
      );
    }
    l.push("");
    l.push(
      `La excepcion que si es de dificultad es **Ricardo Palma**: es la unica de alcance bajo, con 3 de`,
      `8 disputables y la primera posicion libre en la 4, porque \`crp.com.pe\` e \`ipot-crp.pe\` ocupan`,
      `su propio top 3. En la SERP de marca de una clinica, la clinica gana. Su pagina de sede hay que`,
      `escribirla igual —la related search "traumatologo especialista en columna clinica ricardo palma"`,
      `esta verificada y hoy no la responde ninguna URL del sitio—, pero el techo realista es la`,
      `posicion 4 y no la 1.`,
    );
    l.push("");
  }

  const dentro = new Set(golden.keywords.map((k) => normalizar(k.keywordKey)));
  const confirmadasAfuera = criterio.excepcionesConfirmadas.filter((e) => !dentro.has(normalizar(e.keywordKey)));
  if (confirmadasAfuera.length > 0) {
    l.push(`### Confirmadas por el cliente que el criterio igual dejo fuera`);
    l.push("");
    l.push(
      `Esto se escribe aparte porque es lo unico que el criterio decidio EN CONTRA de una indicacion`,
      `explicita. La puerta de servicio propio se levanto —el dato estaba mal y quedo corregido—, pero`,
      `el puntaje se calculo igual que para todas las demas y no alcanzo. Editarlo a mano en el ultimo`,
      `paso habria dado una lista que no sobrevive a su propio criterio.`,
    );
    l.push("");
    for (const e of confirmadasAfuera) {
      const c = golden.casiElegidas.find((x) => normalizar(x.keywordKey) === normalizar(e.keywordKey));
      l.push(`- **${e.keywordKey}** — confirmada por ${e.confirmadaPor} el ${e.fecha}. ${c?.motivo ?? "Fuera del corte."}`);
    }
    l.push("");
  }

  if (criterio.vetos.length > 0) {
    l.push(`### Vetadas a mano, con su motivo`);
    l.push("");
    l.push(`Estas no las saco un umbral: estan escritas en \`data/golden-criterio.json\` con su razon.`);
    l.push("");
    for (const v of criterio.vetos) l.push(`- **${v.keywordKey}** — ${v.motivo}`);
    l.push("");
  }

  // --- 4. Las advertencias ---
  l.push(`## Lo que esta lista arrastra`);
  l.push("");
  for (const a of golden.advertencias) {
    l.push(`- ${a}`);
    l.push("");
  }

  l.push(`## Como se eligieron`);
  l.push("");
  l.push(`Tres puertas y despues un orden, todo en \`data/golden-criterio.json\`:`);
  l.push("");
  l.push(`1. **Alcance objetivo.** La marca ajena, los codigos CIE-10 y el retail ortopedico ya venian marcados desde la fase 12.`);
  l.push(`2. **Servicio propio.** La keyword tiene que nombrar algo que el sitio declara que el doctor hace. Lo que salio del perfil de un competidor describe lo que hace otro.`);
  l.push(`3. **Piso de evidencia.** Al menos ${criterio.minimoDisputables} posicion disputable en el top 10 medido. Sin sitio donde entrar no hay objetivo, por mucho volumen que tenga.`);
  l.push("");
  l.push(`Despues, el orden: **valor de negocio primero** —potencial de trafico, marca geografica y`);
  l.push(`rango de negocio— y **alcanzabilidad despues**, solo como desempate. Y una regla final para`);
  l.push(`que las diez no sean la misma pagina: una por cluster, salvo que la segunda sea de otra`);
  l.push(`categoria de servicio **y** su top 10 no comparta ni una url con la ya elegida.`);
  l.push("");

  return `${l.join("\n")}\n`;
}
