#!/usr/bin/env tsx
/**
 * Matriz de enlazado interno entre clusters. Funcion pura sobre `url-map.jsonl` (MAP-05).
 *
 * LO PRIMERO, PORQUE GOBIERNA TODO LO DEMAS: ESTA MATRIZ SE PROPONE Y NO SE IMPLEMENTA. Los
 * enlaces los escribe v1.1 dentro del codigo de la aplicacion. Este workstream entrega el
 * dato —quien enlaza a quien, con que anchor y por que— y no toca `src/`.
 *
 * EL ANCHOR SALE DEL DESTINO Y NUNCA DEL ORIGEN. Un enlace le dice a Google de que trata la
 * pagina a la que apunta, no la pagina desde la que sale. Poner el titulo del origen en el
 * anchor es el error mas comun del enlazado interno y desperdicia la unica senal que un enlace
 * transporta. Por eso el pozo de anchors de cada destino son SUS keywords secundarias.
 *
 * Y UN ANCHOR NO PUEDE APUNTAR A DOS DESTINOS. Dos paginas peleandose el mismo anchor es
 * canibalizacion escrita a mano: Google recibe la misma senal apuntando a dos lados y reparte
 * la fuerza entre las dos. Los pozos se reparten UNA sola vez, en orden estable, y el primero
 * que reclama un anchor se lo queda.
 *
 * EL SOLAPE PAR A PAR MANDA SOBRE LA PERTENENCIA A CLUSTER (D-05). El cluster ordena
 * candidatos; lo que decide es cuantas URLs del top 10 comparten las dos cabezas. Dos paginas
 * que comparten tantas como para fusionarse NO se enlazan entre si: no son dos paginas, son una
 * con dos URLs, y el trabajo ahi es la fusion y no el enlace. La guarda esta puesta aunque hoy
 * ningun par la active, porque el dia que se active es el dia que importa.
 *
 * LAS URLS QUE REDIRIGEN QUEDAN FUERA DE LA MATRIZ. Enlazar hacia una URL que en la fase 15 va
 * a devolver un 301 es mandar a todos los visitantes por un salto de mas, y enlazar DESDE ella
 * es escribir enlaces en una pagina que se apaga. Su ausencia se declara con el motivo, no se
 * omite en silencio.
 *
 * COSTE DE CUOTA: CERO. El solape se lee de las 96 capturas ya pagadas, en modo offline.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase14/links.ts --map data/url-map.jsonl \
 *     --out data/internal-links.json
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, REPO_ROOT, SEO_TOOLS_ROOT } from "../config.js";
import { normalizeKeyword } from "../keywords/normalize.js";
import { booleana, ejecutar, parseBanderas, texto } from "../phase13/args.js";
import { validarAsignacion, type AsignacionDeUrl } from "./model.js";
import { cargarIndiceDeSerp, veredictoDeFusion, UMBRAL_POR_DEFECTO, type IndiceDeSerp } from "./overlap.js";

/** Lo que el tab `Internal Linking Audit` acepta por fila. */
export const MAX_ENLACES = 8;

/** Reglas de construccion, en el orden en el que el plan las declara. */
export type ReglaDeEnlace =
  | "raiz-de-navegacion"
  | "hub-a-hijas"
  | "vecindad-tematica"
  | "mencion-directa"
  | "mencion-inversa"
  | "hacia-las-sedes"
  | "hacia-conversion"
  | "navegacion-de-seccion";

export interface EnlacePropuesto {
  /** Ruta del sitio de la URL destino. */
  readonly link: string;
  readonly anchor: string;
  /** Titulo de la pagina destino, que es lo que el tab pide en su tercera columna. */
  readonly titleWithLink: string;
  readonly regla: ReglaDeEnlace;
  /** Por que este enlace y no otro, en prosa y con la evidencia que lo respalda. */
  readonly motivo: string;
}

export interface FilaDeEnlazado {
  readonly url: string;
  readonly title: string;
  /** Estado de la URL hoy: publicada o todavia sin publicar. */
  readonly code: string;
  readonly action: string;
  readonly cluster: string;
  readonly enlaces: readonly EnlacePropuesto[];
}

export interface ArchivoDeEnlaces {
  readonly schema: 1;
  readonly generadoPor: "src/phase14/links.ts";
  readonly requisito: "MAP-05";
  readonly nota: string;
  readonly umbralDeSolape: number;
  readonly filas: readonly FilaDeEnlazado[];
  readonly fueraDeLaMatriz: readonly { readonly url: string; readonly motivo: string }[];
  readonly descartadosPorSolape: readonly {
    readonly desde: string;
    readonly hacia: string;
    readonly compartidas: number;
    readonly motivo: string;
  }[];
  readonly resumen: {
    readonly filas: number;
    readonly enlaces: number;
    readonly anchorsUnicos: number;
    readonly sinEnlacesEntrantes: number;
    readonly entrantesPorUrl: Readonly<Record<string, number>>;
  };
}

export interface ClusterLegible {
  readonly nombre: string;
  readonly familia: string;
}

export interface EntradaDeMatriz {
  readonly mapa: readonly AsignacionDeUrl[];
  /** id de cluster -> nombre legible y familia. Sale de `clusters.json`. */
  readonly clusters: ReadonlyMap<string, ClusterLegible>;
  /** clave normalizada de una de las 10 de Oro -> su puesto. */
  readonly oroPorClave: ReadonlyMap<string, number>;
  readonly indice: IndiceDeSerp;
  readonly umbral?: number | undefined;
}

// ---------------------------------------------------------------------------
// Utilidades de nodo
// ---------------------------------------------------------------------------

/**
 * Seccion del sitio de una URL.
 *
 * `/servicios/hernia-discal` y `/servicios` estan las dos en `/servicios`: el hub pertenece a
 * su propia seccion y no a la raiz. Es lo que hace que un hub cuente como vecindad tematica de
 * sus hijas, que es exactamente lo que es.
 */
export function seccionDe(url: string): string {
  const partes = url.split("/").filter((p) => p !== "");
  return partes.length === 0 ? "/" : `/${partes[0] as string}`;
}

/** Titulo corto, para usar de anchor cuando el destino no pelea ninguna keyword. */
export function tituloCorto(titulo: string): string {
  const corte = titulo.split(/[—–|:]/)[0] as string;
  return corte.trim();
}

/** Quita el modificador geografico para comparar el servicio y no el terreno. */
export function sinGeo(keyword: string): string {
  return normalizeKeyword(keyword)
    .replace(/\b(en\s+)?(lima|peru|surco|san isidro|la molina|monterrico|chacarilla)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface Nodo {
  readonly a: AsignacionDeUrl;
  readonly seccion: string;
  readonly familia: string | null;
  /** Puesto en las 10 de Oro cuando la URL sirve una, por primaria o por secundaria. */
  readonly oro: number | null;
  /** Todo lo que la URL pelea, normalizado. Es con lo que se buscan menciones cruzadas. */
  readonly terminos: readonly string[];
}

function construirNodo(a: AsignacionDeUrl, entrada: EntradaDeMatriz): Nodo {
  const claves = [a.keywordPrimaria, ...a.secundarias]
    .filter((k): k is string => k !== null)
    .map((k) => normalizeKeyword(k));
  const puestos = claves
    .map((k) => entrada.oroPorClave.get(k))
    .filter((p): p is number => p !== undefined);

  return {
    a,
    seccion: seccionDe(a.url),
    familia: a.cluster === null ? null : (entrada.clusters.get(a.cluster)?.familia ?? null),
    oro: puestos.length === 0 ? null : Math.min(...puestos),
    terminos: claves,
  };
}

// ---------------------------------------------------------------------------
// Candidatos
// ---------------------------------------------------------------------------

interface Candidato {
  readonly url: string;
  readonly regla: ReglaDeEnlace;
  readonly motivo: string;
}

/**
 * Vecindad tematica, por escalones y en este orden: mismo cluster, misma familia de clusters,
 * misma seccion del sitio.
 *
 * POR QUE HAY ESCALONES Y NO SOLO "MISMO CLUSTER". Porque el mapa asigna UNA URL por cluster a
 * proposito —eso es lo que MAP-02 existe para garantizar—, asi que casi todos los clusters de
 * condicion tienen exactamente una URL y "otra URL del mismo cluster" no existe en ninguna
 * parte. Exigirlo al pie de la letra obligaria a inventar URLs para que la regla se cumpla, que
 * es la cola moviendo al perro. Los escalones conservan la intencion —la senal viene de una
 * pagina afin y no de cualquiera— con lo que el sitio de verdad tiene.
 */
function vecindad(nodo: Nodo, otros: readonly Nodo[], entrada: EntradaDeMatriz): Candidato[] {
  const escalon = (otro: Nodo): number | null => {
    if (nodo.a.cluster !== null && nodo.a.cluster === otro.a.cluster) return 1;
    if (nodo.familia !== null && nodo.familia === otro.familia) return 2;
    if (nodo.seccion === otro.seccion) return 3;
    return null;
  };
  const nombreDeCluster = (n: Nodo): string =>
    n.a.cluster === null ? "sin cluster" : (entrada.clusters.get(n.a.cluster)?.nombre ?? n.a.cluster);

  return otros
    .map((otro) => ({ otro, nivel: escalon(otro) }))
    .filter((x): x is { otro: Nodo; nivel: number } => x.nivel !== null)
    .sort(
      (x, y) =>
        x.nivel - y.nivel ||
        (x.otro.oro ?? 99) - (y.otro.oro ?? 99) ||
        x.otro.a.url.localeCompare(y.otro.a.url, "es"),
    )
    .map(({ otro, nivel }) => ({
      url: otro.a.url,
      regla: "vecindad-tematica" as const,
      motivo:
        nivel === 1
          ? `Comparte con ${otro.a.url} el cluster "${nombreDeCluster(nodo)}", que la fase 13 formo ` +
            `midiendo solape de SERP: son dos paginas del mismo tema y la senal tiene que circular ` +
            `entre ellas.`
          : nivel === 2
            ? `El cluster "${nombreDeCluster(nodo)}" y el cluster "${nombreDeCluster(otro)}" son de la ` +
              `misma familia "${nodo.familia ?? ""}": el paciente que llega por uno de los dos temas ` +
              `esta a un paso del otro.`
            : `Las dos viven en la seccion "${nodo.seccion}" del sitio y sus clusters no se tocan, asi ` +
              `que el enlace las une por estructura y no por tema: es navegacion dentro del silo.`,
    }));
}

/** Candidatos que el ORIGEN nombra: una keyword suya contiene la primaria del destino. */
function mencionDirecta(nodo: Nodo, otros: readonly Nodo[]): Candidato[] {
  const salida: Candidato[] = [];

  for (const otro of otros) {
    const primaria = otro.a.keywordPrimaria;
    if (primaria === null) continue;
    const aguja = sinGeo(primaria);
    if (aguja.length < 4) continue;

    const donde = nodo.terminos.find((t) => t !== aguja && t.includes(aguja));
    if (donde === undefined) continue;

    salida.push({
      url: otro.a.url,
      regla: "mencion-directa",
      motivo:
        `Esta pagina persigue "${donde}", que contiene la primaria "${primaria}" de ${otro.a.url}. ` +
        `El tema ya aparece en su propio texto: el enlace lo manda a donde se responde entero, en ` +
        `vez de dejar dos paginas peleando la misma consulta.`,
    });
  }
  return salida.sort((x, y) => x.url.localeCompare(y.url, "es"));
}

/** Candidatos que nombran al ORIGEN: una keyword del destino contiene la primaria de origen. */
function mencionInversa(nodo: Nodo, otros: readonly Nodo[]): Candidato[] {
  const primaria = nodo.a.keywordPrimaria;
  if (primaria === null) return [];
  const aguja = sinGeo(primaria);
  if (aguja.length < 4) return [];

  const salida: Candidato[] = [];
  for (const otro of otros) {
    const donde = otro.terminos.find((t) => t !== aguja && t.includes(aguja));
    if (donde === undefined) continue;
    salida.push({
      url: otro.a.url,
      regla: "mencion-inversa",
      motivo:
        `${otro.a.url} ya lleva "${donde}" entre sus keywords, que contiene la primaria "${primaria}" ` +
        `de esta pagina. La captacion alimenta al servicio y no al reves (D-09): el articulo manda ` +
        `al paciente a la guia que resuelve su caso.`,
    });
  }
  return salida.sort((x, y) => x.url.localeCompare(y.url, "es"));
}

/** Palabras que no distinguen ningun tema clinico y por eso no cuentan como evidencia. */
const PALABRAS_VACIAS: ReadonlySet<string> = new Set([
  "para",
  "como",
  "cerca",
  "mejor",
  "sobre",
  "entre",
  "donde",
  "cuando",
]);

/**
 * Ultimo recurso de la regla 3: la guia que comparte un termino clinico con el articulo.
 *
 * Se usa SOLO cuando ninguna guia nombra la primaria del post. `cirugia de columna` y
 * `cirugia minimamente invasiva en lima` no se contienen la una a la otra y aun asi hablan del
 * mismo procedimiento: el articulo explica como se decide operarse y la guia explica con que
 * tecnica. Sin este escalon ese post no tendria a que guia mandar y la regla 3 quedaria escrita
 * pero no aplicada, que es peor que no tenerla.
 */
function terminoClinicoCompartido(nodo: Nodo, otros: readonly Nodo[]): Candidato[] {
  const primaria = nodo.a.keywordPrimaria;
  if (primaria === null) return [];
  const propias = new Set(
    sinGeo(primaria)
      .split(" ")
      .filter((p) => p.length >= 5 && !PALABRAS_VACIAS.has(p)),
  );
  if (propias.size === 0) return [];

  return otros
    .map((otro) => {
      const suya = otro.a.keywordPrimaria === null ? [] : sinGeo(otro.a.keywordPrimaria).split(" ");
      const comunes = [...new Set(suya.filter((p) => propias.has(p)))].sort();
      return { otro, comunes };
    })
    .filter((x) => x.comunes.length > 0)
    .sort(
      (x, y) =>
        y.comunes.length - x.comunes.length ||
        (x.otro.oro ?? 99) - (y.otro.oro ?? 99) ||
        x.otro.a.url.localeCompare(y.otro.a.url, "es"),
    )
    .map(({ otro, comunes }) => ({
      url: otro.a.url,
      regla: "mencion-inversa" as const,
      motivo:
        `La primaria de esta pagina, "${primaria}", y la de ${otro.a.url}, ` +
        `"${otro.a.keywordPrimaria ?? ""}", comparten el termino clinico ${comunes.map((c) => `"${c}"`).join(" y ")}: ` +
        `el articulo explica la decision y la guia explica el procedimiento, asi que la captacion ` +
        `alimenta al servicio y no al reves (D-09).`,
    }));
}

function fijo(url: string, regla: ReglaDeEnlace, motivo: string): Candidato {
  return { url, regla, motivo };
}

// ---------------------------------------------------------------------------
// Recetas por tipo de nodo
// ---------------------------------------------------------------------------

/**
 * Que enlaza cada tipo de pagina, en orden de prioridad.
 *
 * La receta ES el criterio del plan hecho concreto, y esta escrita por tipo de nodo en vez de
 * como una sola cola global porque las cinco reglas del plan no le aplican igual a una guia
 * clinica que a la pagina de contacto. El orden de la lista es el orden de las columnas del
 * tab: `Link 1` es el enlace mas importante de esa pagina.
 */
function receta(nodo: Nodo, nodos: readonly Nodo[], entrada: EntradaDeMatriz): Candidato[] {
  const url = nodo.a.url;
  const otros = nodos.filter((n) => n.a.url !== url);
  const existe = (u: string): boolean => nodos.some((n) => n.a.url === u);
  const enSeccion = (s: string): Nodo[] =>
    otros
      .filter((n) => n.seccion === s && n.a.url !== s)
      .sort((a, b) => (a.oro ?? 99) - (b.oro ?? 99) || a.a.url.localeCompare(b.a.url, "es"));

  const sedes = enSeccion("/sedes").map((n) =>
    fijo(
      n.a.url,
      "hacia-las-sedes",
      `La atencion de este servicio ocurre en ${n.a.url}: la pagina que explica el procedimiento ` +
        `tiene que decir donde se hace, o el paciente se queda sin el paso siguiente (D-08).`,
    ),
  );
  const aAgendar = fijo(
    "/agendar",
    "hacia-conversion",
    `Cierra el recorrido: la pagina explica el servicio y el enlace lleva al unico sitio donde el ` +
      `paciente puede pedir la cita. Sin este enlace la pagina informa y no convierte.`,
  );
  /**
   * Las guias de servicio, SIN el hub.
   *
   * El hub ya tiene su propia ranura en cada receta, y dejarlo entre los candidatos de una
   * mencion le hace ganar la comparacion por orden alfabetico y despues desaparecer al
   * deduplicar: la ranura se gasta sin producir ningun enlace. Se excluye una vez, aca.
   */
  const guiasDeServicio = otros.filter((n) => n.seccion === "/servicios" && n.a.url !== "/servicios");

  const alHub = fijo(
    "/servicios",
    "navegacion-de-seccion",
    `Vuelve al hub de servicios, que es la pagina que pelea "cirujano de columna lima" y la que ` +
      `reparte la senal entre las cinco guias: el enlace de vuelta consolida el silo.`,
  );

  switch (nodo.a.tipoDePagina) {
    case "home":
      return [
        fijo("/servicios", "raiz-de-navegacion", "La home reparte su autoridad hacia el hub de servicios, que es donde vive la oferta clinica entera."),
        fijo("/sedes", "raiz-de-navegacion", "Desde la raiz se llega al hub de sedes, que es la respuesta a la pregunta de donde atiende el doctor."),
        fijo("/blog", "raiz-de-navegacion", "El silo informativo cuelga de la home: es la puerta de la captacion y necesita senal desde la raiz."),
        fijo("/preguntas-frecuentes", "raiz-de-navegacion", "Las dudas previas a la consulta se resuelven antes de agendar, asi que la raiz las pone a un clic."),
        fijo("/sobre-el-doctor", "raiz-de-navegacion", "La pagina de autoridad del sitio sostiene la confianza de todo lo demas bajo la restriccion YMYL."),
        fijo("/testimonios", "raiz-de-navegacion", "La prueba social acompana a la autoridad y la home es la que la pone delante del paciente."),
        fijo("/contacto", "raiz-de-navegacion", "Segunda via de conversion del sitio, con el temario de sedes: la raiz la enlaza junto con agendar."),
        fijo("/agendar", "raiz-de-navegacion", "La home termina en el paso que el proyecto entero persigue: pedir la cita en menos de dos clics."),
      ].filter((c) => existe(c.url));

    case "hub-de-servicios":
      return [
        ...enSeccion("/servicios").map((n) =>
          fijo(
            n.a.url,
            "hub-a-hijas",
            `El hub reparte hacia ${n.a.url}, que es la guia que responde ese tema entero. Un hub que ` +
              `no enlaza a sus hijas retiene una senal que no sabe usar.`,
          ),
        ),
        fijo("/sedes", "navegacion-de-seccion", "El hub de servicios manda al de sedes: quien ya sabe que procedimiento necesita, pregunta donde se hace."),
        fijo("/blog", "navegacion-de-seccion", "Del hub al silo informativo, que es donde estan las respuestas largas que la pagina comercial no da."),
        aAgendar,
      ].filter((c) => existe(c.url));

    case "pagina-de-servicio":
      return [
        ...vecindad(nodo, otros, entrada).slice(0, 2),
        ...sedes,
        aAgendar,
        alHub,
      ].filter((c) => existe(c.url));

    case "hub-de-contenido":
      return [
        ...enSeccion("/blog").map((n) =>
          fijo(
            n.a.url,
            "hub-a-hijas",
            `El indice del blog enlaza a ${n.a.url}, que es uno de los articulos que lista. Es la unica ` +
              `senal que el hub tiene para darle a su propio contenido.`,
          ),
        ),
        alHub,
      ].filter((c) => existe(c.url));

    case "articulo-de-blog":
    case "guia":
      return [
        ...[
          ...mencionInversa(nodo, guiasDeServicio),
          ...terminoClinicoCompartido(nodo, guiasDeServicio),
        ].slice(0, 1),
        ...vecindad(nodo, otros, entrada).slice(0, 3),
        fijo("/blog", "navegacion-de-seccion", "Vuelve al indice del silo informativo, que es la pagina que agrupa a todos los articulos hermanos."),
        alHub,
      ].filter((c) => existe(c.url));

    case "hub-de-sedes":
      return [
        ...enSeccion("/sedes").map((n) =>
          fijo(
            n.a.url,
            "hub-a-hijas",
            `El hub reparte hacia ${n.a.url}. Juan decidio el 2026-08-11 que este hub no pelee ninguna ` +
              `keyword justamente para que la senal se concentre en las cuatro sedes: el enlace es la ` +
              `forma de que llegue.`,
          ),
        ),
        alHub,
        aAgendar,
      ].filter((c) => existe(c.url));

    case "pagina-de-sede":
      return [
        fijo("/sedes", "navegacion-de-seccion", "Vuelve al hub de sedes, que es la pagina que compara las cuatro y deja elegir la mas cercana."),
        alHub,
        ...mencionDirecta(nodo, guiasDeServicio).slice(0, 1),
        aAgendar,
        fijo("/contacto", "hacia-conversion", "La sede ofrece la segunda via de contacto para quien prefiere escribir su caso antes de agendar."),
        fijo("/", "navegacion-de-seccion", "Vuelve a la raiz, que es la pagina que pelea la consulta de especialidad entera y de la que cuelga la red de sedes."),
      ].filter((c) => existe(c.url));

    case "pagina-de-preguntas":
      return [
        ...mencionDirecta(nodo, otros).slice(0, 2),
        alHub,
        fijo("/blog", "navegacion-de-seccion", "Las dudas que no caben en una respuesta corta se desarrollan en el silo informativo."),
        aAgendar,
      ].filter((c) => existe(c.url));

    case "pagina-de-conversion":
      return [
        fijo("/sedes", "navegacion-de-seccion", "Quien esta por agendar necesita ver las cuatro sedes con su direccion y su horario antes de elegir."),
        alHub,
        fijo("/", "navegacion-de-seccion", "Vuelve a la raiz: una pagina de conversion sin salida deja al paciente sin donde seguir si todavia esta decidiendo."),
        ...["/agendar", "/contacto"]
          .filter((u) => u !== url)
          .map((u) =>
            fijo(u, "hacia-conversion", "Las dos vias de conversion del sitio se enlazan entre si: quien no quiere escribir, agenda, y al reves."),
          ),
      ].filter((c) => existe(c.url));

    case "pagina-institucional":
      return [
        fijo("/", "navegacion-de-seccion", "Vuelve a la raiz, que es la pagina que la trayectoria y la prueba social existen para sostener."),
        alHub,
        fijo("/sedes", "navegacion-de-seccion", "Del respaldo a lo concreto: donde atiende el doctor, con direccion y horario de cada sede."),
        ...["/sobre-el-doctor", "/testimonios"]
          .filter((u) => u !== url)
          .map((u) =>
            fijo(u, "navegacion-de-seccion", "Autoridad y prueba social se sostienen mutuamente: quien lee una de las dos esta evaluando lo mismo."),
          ),
        aAgendar,
      ].filter((c) => existe(c.url));

    default:
      return [alHub, aAgendar].filter((c) => existe(c.url));
  }
}

// ---------------------------------------------------------------------------
// Anchors
// ---------------------------------------------------------------------------

/**
 * Reparte los pozos de anchor entre los destinos, una sola vez y en orden estable.
 *
 * Dos destinos pueden traer la misma secundaria —`traumatologia especialista en columna` es de
 * la home y del hub de servicios a la vez— y el mismo anchor apuntando a dos lados reparte la
 * senal en vez de sumarla. Gana el primero por orden de URL, que es un criterio arbitrario pero
 * ESTABLE: lo que no puede pasar es que la asignacion cambie entre dos corridas.
 */
export function repartirAnchors(nodos: readonly Nodo[]): Map<string, string[]> {
  const pozos = new Map<string, string[]>();
  const tomados = new Map<string, string>();

  for (const nodo of [...nodos].sort((a, b) => a.a.url.localeCompare(b.a.url, "es"))) {
    // El titulo entra SOLO como ultimo recurso, cuando la URL no pelea ninguna keyword. Con
    // keywords disponibles, gastarle una ranura al titulo desperdicia la unica senal que el
    // enlace transporta: `/agendar` no tiene otra cosa, `/servicios` si.
    const conKeywords = [
      ...nodo.a.secundarias,
      ...(nodo.a.keywordPrimaria === null ? [] : [nodo.a.keywordPrimaria]),
    ];
    const candidatos = conKeywords.length > 0 ? conKeywords : [tituloCorto(nodo.a.titulo)];
    const propios: string[] = [];

    for (const candidato of candidatos) {
      const clave = candidato.trim().toLowerCase();
      if (clave === "") continue;
      const duena = tomados.get(clave);
      if (duena !== undefined && duena !== nodo.a.url) continue;
      if (propios.some((p) => p.trim().toLowerCase() === clave)) continue;
      tomados.set(clave, nodo.a.url);
      propios.push(candidato.trim());
    }

    if (propios.length === 0) {
      throw new CliError(
        `${nodo.a.url} se quedo sin ni un anchor propio: todas sus keywords y su titulo ya estaban ` +
          `tomados por otra URL. Un enlace sin anchor no transporta ninguna senal.`,
      );
    }
    pozos.set(nodo.a.url, propios);
  }

  return pozos;
}

// ---------------------------------------------------------------------------
// Construccion de la matriz
// ---------------------------------------------------------------------------

function capitalizar(valor: string): string {
  return valor.charAt(0).toUpperCase() + valor.slice(1);
}

export function construirMatriz(entrada: EntradaDeMatriz): ArchivoDeEnlaces {
  const umbral = entrada.umbral ?? UMBRAL_POR_DEFECTO;

  const fueraDeLaMatriz = entrada.mapa
    .filter((a) => a.accion === "redirigir")
    .map((a) => ({
      url: a.url,
      motivo:
        `Redirige 301 hacia ${a.redirigeA ?? "?"} en la fase 15. No entra a la matriz por las dos ` +
        `puntas: enlazar HACIA ella mandaria a cada visitante por un salto de mas, y enlazar DESDE ` +
        `ella seria escribir enlaces en una pagina que se apaga. Lo que hereda su senal es el ` +
        `destino del 301, que si esta en la matriz.`,
    }))
    .sort((a, b) => a.url.localeCompare(b.url, "es"));

  const vivas = entrada.mapa
    .filter((a) => a.accion !== "redirigir")
    .sort((a, b) => a.url.localeCompare(b.url, "es"));
  const nodos = vivas.map((a) => construirNodo(a, entrada));
  const porUrl = new Map(nodos.map((n) => [n.a.url, n]));
  const pozos = repartirAnchors(nodos);

  const descartados: {
    desde: string;
    hacia: string;
    compartidas: number;
    motivo: string;
  }[] = [];
  const usosDeAnchor = new Map<string, number>();

  const filas: FilaDeEnlazado[] = nodos.map((nodo) => {
    const vistos = new Set<string>([nodo.a.url]);
    const enlaces: EnlacePropuesto[] = [];

    for (const candidato of receta(nodo, nodos, entrada)) {
      if (enlaces.length >= MAX_ENLACES) break;
      if (vistos.has(candidato.url)) continue;
      const destino = porUrl.get(candidato.url);
      if (destino === undefined) continue;

      // D-05: el solape par a par manda. Un par fusionable no son dos paginas que se enlazan.
      if (nodo.a.keywordPrimaria !== null && destino.a.keywordPrimaria !== null) {
        const veredicto = veredictoDeFusion(
          nodo.a.keywordPrimaria,
          destino.a.keywordPrimaria,
          entrada.indice,
          { umbral },
        );
        if (veredicto.fusionable) {
          descartados.push({
            desde: nodo.a.url,
            hacia: destino.a.url,
            compartidas: veredicto.cardinalidad,
            motivo:
              `Comparten ${veredicto.cardinalidad} URLs del top 10 medido, con el umbral en ${umbral}: ` +
              `no son dos paginas que conviene enlazar, son una pagina con dos URLs y lo que ` +
              `corresponde es fusionarlas (D-05).`,
          });
          vistos.add(candidato.url);
          continue;
        }
      }

      const pozo = pozos.get(destino.a.url) as string[];
      const usados = usosDeAnchor.get(destino.a.url) ?? 0;
      const anchor = pozo[usados % pozo.length] as string;
      usosDeAnchor.set(destino.a.url, usados + 1);

      vistos.add(candidato.url);
      enlaces.push({
        link: destino.a.url,
        anchor,
        titleWithLink: destino.a.titulo,
        regla: candidato.regla,
        motivo: candidato.motivo,
      });
    }

    return {
      url: nodo.a.url,
      title: nodo.a.titulo,
      code: nodo.a.estado === "viva" ? "200" : "Sin publicar (planificada)",
      action: capitalizar(nodo.a.accion),
      cluster:
        nodo.a.cluster === null
          ? "Sin cluster (declara que no compite)"
          : (entrada.clusters.get(nodo.a.cluster)?.nombre ?? nodo.a.cluster),
      enlaces,
    };
  });

  verificarInvariantes(filas, nodos, entrada);

  const entrantes = contarEntrantes(filas);
  const anchors = new Set(filas.flatMap((f) => f.enlaces.map((e) => e.anchor.trim().toLowerCase())));

  return {
    schema: 1,
    generadoPor: "src/phase14/links.ts",
    requisito: "MAP-05",
    nota:
      "Esta matriz SE PROPONE. Los enlaces los implementa el workstream milestone (v1.1) dentro " +
      "del codigo de la aplicacion; el workstream seo-keywords no escribe en src/.",
    umbralDeSolape: umbral,
    filas,
    fueraDeLaMatriz,
    descartadosPorSolape: descartados.sort(
      (a, b) => a.desde.localeCompare(b.desde, "es") || a.hacia.localeCompare(b.hacia, "es"),
    ),
    resumen: {
      filas: filas.length,
      enlaces: filas.reduce((n, f) => n + f.enlaces.length, 0),
      anchorsUnicos: anchors.size,
      sinEnlacesEntrantes: [...entrantes.values()].filter((n) => n === 0).length,
      entrantesPorUrl: Object.fromEntries([...entrantes.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"))),
    },
  };
}

/** Enlaces entrantes por URL, con todas las filas presentes aunque reciban cero. */
export function contarEntrantes(filas: readonly FilaDeEnlazado[]): Map<string, number> {
  const entrantes = new Map<string, number>();
  for (const f of filas) entrantes.set(f.url, 0);
  for (const f of filas) {
    for (const e of f.enlaces) {
      if (entrantes.has(e.link)) entrantes.set(e.link, (entrantes.get(e.link) as number) + 1);
    }
  }
  return entrantes;
}

/**
 * Las cinco reglas que la matriz no puede romper, comprobadas ANTES de emitir nada.
 *
 * Se comprueban aca y no solo en las pruebas porque una matriz rota no es un archivo con un
 * error: es una propuesta que v1.1 va a implementar tal cual. Fallar ruidoso cuesta una
 * corrida; publicar una URL huerfana cuesta que nadie lo note hasta que no rankea.
 */
function verificarInvariantes(
  filas: readonly FilaDeEnlazado[],
  nodos: readonly Nodo[],
  entrada: EntradaDeMatriz,
): void {
  const fallas: string[] = [];

  for (const fila of filas) {
    if (fila.enlaces.length > MAX_ENLACES) {
      fallas.push(`${fila.url} propone ${fila.enlaces.length} enlaces y el tab acepta ${MAX_ENLACES}.`);
    }
    for (const e of fila.enlaces) {
      if (e.link === fila.url) fallas.push(`${fila.url} se enlaza a si misma.`);
      if (e.anchor.trim() === "") fallas.push(`${fila.url} -> ${e.link} sin anchor.`);
      if (e.motivo.trim().length <= 20) fallas.push(`${fila.url} -> ${e.link} sin motivo escrito.`);
    }
  }

  const destinoDelAnchor = new Map<string, string>();
  for (const fila of filas) {
    for (const e of fila.enlaces) {
      const clave = e.anchor.trim().toLowerCase();
      const previo = destinoDelAnchor.get(clave);
      if (previo !== undefined && previo !== e.link) {
        fallas.push(`el anchor "${e.anchor}" apunta a ${previo} y tambien a ${e.link}.`);
      }
      destinoDelAnchor.set(clave, e.link);
    }
  }

  for (const [url, n] of contarEntrantes(filas)) {
    if (n === 0) fallas.push(`${url} queda huerfana: ninguna URL le enlaza.`);
  }

  // D-06: una URL que sirve una de oro recibe senal de su vecindad, no de cualquier lado.
  const porUrl = new Map(nodos.map((n) => [n.a.url, n]));
  const esVecina = (a: Nodo, b: Nodo): boolean =>
    (a.a.cluster !== null && a.a.cluster === b.a.cluster) ||
    (a.familia !== null && a.familia === b.familia) ||
    a.seccion === b.seccion;

  for (const nodo of nodos) {
    if (nodo.oro === null) continue;
    const desdeVecindad = filas.some((f) => {
      const origen = porUrl.get(f.url);
      return (
        origen !== undefined &&
        origen.a.url !== nodo.a.url &&
        esVecina(origen, nodo) &&
        f.enlaces.some((e) => e.link === nodo.a.url)
      );
    });
    if (!desdeVecindad) {
      fallas.push(
        `${nodo.a.url} sirve la keyword de oro numero ${nodo.oro} y no recibe ni un enlace desde su ` +
          `vecindad tematica (D-06).`,
      );
    }
  }

  if (fallas.length > 0) {
    throw new CliError(
      `La matriz de enlazado rompe ${fallas.length} reglas y no se escribe:\n` +
        fallas.map((f) => `    - ${f}`).join("\n") +
        `\n  Umbral de solape aplicado: ${entrada.umbral ?? UMBRAL_POR_DEFECTO}.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Documento legible
// ---------------------------------------------------------------------------

export function documentoLegible(archivo: ArchivoDeEnlaces): string {
  const lineas: string[] = [];
  const entrantes = archivo.resumen.entrantesPorUrl;

  lineas.push("# Fase 14 — Matriz de enlazado interno");
  lineas.push("");
  lineas.push("> **Esto se propone y NO se implementa acá.** Los enlaces los escribe el workstream");
  lineas.push("> `milestone` (v1.1) dentro del código de la aplicación. Este documento y");
  lineas.push("> `seo-tools/data/internal-links.json` son la especificación: qué URL enlaza a cuál, con");
  lineas.push("> qué anchor y por qué. El workstream `seo-keywords` no escribe en `src/`.");
  lineas.push("");
  lineas.push("Generado por `seo-tools/src/phase14/links.ts`. No editar a mano: se regenera.");
  lineas.push("");
  lineas.push("## Cómo se construyó");
  lineas.push("");
  lineas.push("1. **Dentro del tema primero.** El cluster ordena los candidatos y el solape par a par");
  lineas.push("   decide (D-05). Un par que comparte tantas URLs del top 10 como para fusionarse **no**");
  lineas.push("   se enlaza: no son dos páginas, son una con dos URLs.");
  lineas.push("2. **Hacia las de oro.** Las URLs que sirven una de las 10 de Oro reciben señal de su");
  lineas.push("   vecindad temática, nunca de cualquier página suelta (D-06).");
  lineas.push("3. **De captación a servicio.** El artículo del blog manda a la guía que resuelve el caso,");
  lineas.push("   y no al revés: la captación alimenta, no vende (D-09).");
  lineas.push("4. **Hacia las sedes.** Cada guía dice dónde se atiende ese servicio, en las cuatro sedes");
  lineas.push("   vigentes: consultorio de Surco, Ricardo Palma, Sanna La Molina y Padre Luis Tezza (D-08).");
  lineas.push("5. **Hacia conversión.** Cada página de servicio termina en `/agendar`.");
  lineas.push("");
  lineas.push("**El anchor sale siempre de una keyword del destino, nunca del título del origen.** Un");
  lineas.push("enlace le dice a Google de qué trata la página a la que apunta. Y ningún anchor apunta a");
  lineas.push("dos destinos: eso sería canibalización escrita a mano.");
  lineas.push("");
  lineas.push("## Resumen");
  lineas.push("");
  lineas.push("| Métrica | Valor |");
  lineas.push("|---|---|");
  lineas.push(`| URLs en la matriz | ${archivo.resumen.filas} |`);
  lineas.push(`| Enlaces propuestos | ${archivo.resumen.enlaces} |`);
  lineas.push(`| Anchors distintos | ${archivo.resumen.anchorsUnicos} |`);
  lineas.push(`| URLs sin enlaces entrantes | ${archivo.resumen.sinEnlacesEntrantes} |`);
  lineas.push(`| Pares descartados por solape | ${archivo.descartadosPorSolape.length} |`);
  lineas.push(`| Umbral de solape aplicado | ${archivo.umbralDeSolape} URLs compartidas del top 10 |`);
  lineas.push("");

  if (archivo.fueraDeLaMatriz.length > 0) {
    lineas.push("## URLs que quedan fuera de la matriz");
    lineas.push("");
    for (const f of archivo.fueraDeLaMatriz) {
      lineas.push(`- **\`${f.url}\`** — ${f.motivo}`);
    }
    lineas.push("");
  }

  lineas.push("## Enlaces entrantes por URL");
  lineas.push("");
  lineas.push("Cuántas páginas sostienen a cada una. Ninguna en cero.");
  lineas.push("");
  lineas.push("| URL | Entrantes | Salientes |");
  lineas.push("|---|---|---|");
  for (const fila of [...archivo.filas].sort(
    (a, b) => (entrantes[b.url] ?? 0) - (entrantes[a.url] ?? 0) || a.url.localeCompare(b.url, "es"),
  )) {
    lineas.push(`| \`${fila.url}\` | ${entrantes[fila.url] ?? 0} | ${fila.enlaces.length} |`);
  }
  lineas.push("");

  const porCluster = new Map<string, FilaDeEnlazado[]>();
  for (const fila of archivo.filas) {
    porCluster.set(fila.cluster, [...(porCluster.get(fila.cluster) ?? []), fila]);
  }

  lineas.push("## La matriz, cluster por cluster");
  lineas.push("");
  for (const cluster of [...porCluster.keys()].sort((a, b) => a.localeCompare(b, "es"))) {
    lineas.push(`### ${cluster}`);
    lineas.push("");
    for (const fila of porCluster.get(cluster) as FilaDeEnlazado[]) {
      lineas.push(`#### \`${fila.url}\``);
      lineas.push("");
      lineas.push(`${fila.title} · ${fila.code} · acción: ${fila.action}`);
      lineas.push("");
      lineas.push("| # | Destino | Anchor | Regla | Motivo |");
      lineas.push("|---|---|---|---|---|");
      fila.enlaces.forEach((e, i) => {
        lineas.push(
          `| ${i + 1} | \`${e.link}\` | ${e.anchor} | ${e.regla} | ${e.motivo.replace(/\|/g, "\\|")} |`,
        );
      });
      lineas.push("");
    }
  }

  if (archivo.descartadosPorSolape.length > 0) {
    lineas.push("## Pares descartados por solape de SERP");
    lineas.push("");
    lineas.push("| Desde | Hacia | Compartidas | Motivo |");
    lineas.push("|---|---|---|---|");
    for (const d of archivo.descartadosPorSolape) {
      lineas.push(`| \`${d.desde}\` | \`${d.hacia}\` | ${d.compartidas} | ${d.motivo} |`);
    }
    lineas.push("");
  }

  return `${lineas.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------

function ruta(destino: string): string {
  return path.isAbsolute(destino) ? destino : path.join(SEO_TOOLS_ROOT, destino);
}

const DOC_POR_DEFECTO = path.join(
  REPO_ROOT,
  ".planning",
  "workstreams",
  "seo-keywords",
  "phases",
  "14-mapa-keyword-url-y-matriz-de-enlazado",
  "14-ENLAZADO.md",
);

interface ClusterCrudo {
  readonly id: string;
  readonly nombre: string;
  readonly familia: string;
}

export function leerClusters(destino = "data/clusters.json"): Map<string, ClusterLegible> {
  const crudo = JSON.parse(readFileSync(ruta(destino), "utf8")) as unknown;
  const lista: readonly ClusterCrudo[] = Array.isArray(crudo)
    ? (crudo as ClusterCrudo[])
    : (((crudo as { clusters?: readonly ClusterCrudo[] }).clusters ?? []) as readonly ClusterCrudo[]);
  return new Map(lista.map((c) => [c.id, { nombre: c.nombre, familia: c.familia }]));
}

export function leerOro(destino = "data/golden-10.json"): Map<string, number> {
  const archivo = JSON.parse(readFileSync(ruta(destino), "utf8")) as {
    readonly keywords: readonly { readonly keywordKey: string; readonly puesto: number }[];
  };
  return new Map(archivo.keywords.map((k) => [normalizeKeyword(k.keywordKey), k.puesto]));
}

export function leerMapaSincrono(destino: string): AsignacionDeUrl[] {
  return readFileSync(ruta(destino), "utf8")
    .split("\n")
    .filter((l) => l.trim() !== "")
    .map((l, i) => validarAsignacion(JSON.parse(l), `${destino}:${i + 1}`));
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const destinoMapa = texto(banderas, "map") ?? "data/url-map.jsonl";
  const destinoSalida = texto(banderas, "out") ?? "data/internal-links.json";
  const destinoDoc = texto(banderas, "doc") ?? DOC_POR_DEFECTO;

  const mapa = leerMapaSincrono(destinoMapa);
  if (mapa.length === 0) throw new CliError(`${destinoMapa} no trae ni un registro.`);

  const primarias = mapa
    .map((a) => a.keywordPrimaria)
    .filter((k): k is string => k !== null && k !== undefined);
  const indice = await cargarIndiceDeSerp(primarias);

  const archivo = construirMatriz({
    mapa,
    clusters: leerClusters(),
    oroPorClave: leerOro(),
    indice,
  });

  if (!booleana(banderas, "dry-run")) {
    writeFileSync(ruta(destinoSalida), `${JSON.stringify(archivo, null, 2)}\n`, "utf8");
    writeFileSync(ruta(destinoDoc), documentoLegible(archivo), "utf8");
  }

  const out = process.stdout;
  out.write(`Mapa: ${destinoMapa} (${mapa.length} URLs)\n`);
  out.write(`Salida: ${destinoSalida}\n`);
  out.write(`Documento: ${destinoDoc}\n\n`);
  out.write(`filas en la matriz: ${archivo.resumen.filas}\n`);
  out.write(`fuera de la matriz: ${archivo.fueraDeLaMatriz.length}\n`);
  out.write(`enlaces propuestos: ${archivo.resumen.enlaces}\n`);
  out.write(`anchors distintos: ${archivo.resumen.anchorsUnicos}\n`);
  out.write(`URLs sin enlaces entrantes: ${archivo.resumen.sinEnlacesEntrantes}\n`);
  out.write(`descartados por solape: ${archivo.descartadosPorSolape.length}\n`);
  if (indice.sinCaptura.length > 0) {
    out.write(`\ncabezas sin captura en cache: ${indice.sinCaptura.length}\n`);
    for (const k of indice.sinCaptura) out.write(`  ${k}\n`);
  }
  return 0;
}

if (process.argv[1] !== undefined && process.argv[1].endsWith("links.ts")) {
  ejecutar(main);
}
