#!/usr/bin/env tsx
/**
 * El punto dulce (KWR-05, D-09): que cabezas estan al alcance de un dominio de agosto de 2026
 * con historial casi nulo, y POR QUE.
 *
 * ================================================================================
 * LA DEFINICION DEL ROADMAP QUEDO INVALIDADA POR LA MEDICION, Y ESTE ES EL CAMBIO
 * ================================================================================
 *
 * KWR-05 define el punto dulce como "las keywords cuyo KD es alcanzable con el perfil de
 * enlaces real del dominio". La medicion del 2026-08-11 contra Ahrefs dice otra cosa:
 *
 *   - En los CINCO competidores la home concentra todos los dominios de referencia y las
 *     paginas interiores tienen CERO. `clinicarthromeds.pe` tiene 371 en la home y 0 en cada
 *     una de las nueve que le traen el trafico, que son 98, 71, 65, 16...
 *   - Tres de los cinco tienen CERO trafico organico, incluido `doctormunguia.com`, que lidera
 *     el pack local con 4,8 y 24 resenas. Su visibilidad es Maps, no Search.
 *   - La linea de base propia es cero absoluto: DR 0, rank null, 0 backlinks, 0 keywords.
 *
 * Las paginas que rankean en este nicho lo hacen POR CONTENIDO, NO POR ENLACES. Un dominio con
 * 0 backlinks puede disputar esas SERP sin campana de linkbuilding. Asi que el punto dulce se
 * calcula contra la CALIDAD DEL CONTENIDO que ocupa el top 10, y no contra el perfil de
 * enlaces. La consecuencia para 13-05 es directa: las 10 de Oro pueden ser mas ambiciosas de
 * lo que el roadmap suponia.
 *
 * ================================================================================
 * LAS DOS MITADES, Y NINGUNA ALCANZA SOLA
 * ================================================================================
 *
 * El KD es un promedio de mercado: no sabe que la posicion 3 la ocupa una clinica con marca.
 * La SERP sola no dice cuanto esfuerzo hace falta. Por eso cada veredicto cruza las dos:
 *
 *   - una cabeza con KD BAJO cuyo top 10 esta copado por clinicas con marca y directorios
 *     internacionales NO es punto dulce;
 *   - una cabeza con KD MEDIO cuyo top 10 son medicos individuales SI puede serlo.
 *
 * Una cabeza sin KD conocido no se descarta: se marca como no medida y se resuelve por la
 * SERP, que es la mitad que si existe. Cada fila declara con cuantas mitades se resolvio.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import { ejecutar } from "./args.js";
import { clasificarSerp, cargarReglasDeTipo, type ReglasDeTipo } from "./pagetype.js";
import { dominioDe, esDelDominio } from "./gap.js";
import { leerSerp } from "./serp.js";
import type { SerpCompleta } from "./serp.js";

const RUTA_REGLAS = path.join(SEO_TOOLS_ROOT, "data", "serp-alcanzabilidad.json");
const RUTA_CANDIDATAS = path.join(SEO_TOOLS_ROOT, "data", "serp-candidates.json");
const RUTA_METRICAS = path.join(SEO_TOOLS_ROOT, "data", "ahrefs-keywords.jsonl");
const RUTA_CLUSTERS = path.join(SEO_TOOLS_ROOT, "data", "keyword-clusters.jsonl");
const RUTA_COMPETIDORES = path.join(SEO_TOOLS_ROOT, "data", "competitors.json");
const RUTA_SALIDA = path.join(SEO_TOOLS_ROOT, "data", "sweet-spot.jsonl");
const RUTA_DOC = path.join(
  SEO_TOOLS_ROOT,
  "..",
  ".planning",
  "workstreams",
  "seo-keywords",
  "phases",
  "13-clusters-competencia-y-las-10-de-oro",
  "13-PUNTO-DULCE.md",
);

// ---------------------------------------------------------------------------
// Reglas
// ---------------------------------------------------------------------------

export interface ReglasDeAlcance {
  readonly marcaFuerte: readonly string[];
  readonly tiposNoDisputables: readonly string[];
  readonly tiposDeContenidoDebil: readonly string[];
  readonly alto: number;
  readonly medio: number;
  readonly disputablesEnElTop3: number;
  readonly kdFacil: number;
  readonly kdDuro: number;
}

export function cargarReglasDeAlcance(ruta: string = RUTA_REGLAS): ReglasDeAlcance {
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer las reglas de alcanzabilidad.\n  Ruta: ${ruta}\n` +
        `  Sin ellas el punto dulce saldria de un umbral escrito en el codigo, que es justo lo\n` +
        `  que este proyecto no hace: los criterios discutibles viven en archivos de datos.`,
    );
  }
  const o = JSON.parse(crudo) as Record<string, unknown>;
  const marcas = (o["marcaFuerte"] as { dominio: string }[] | undefined) ?? [];
  const u = (o["umbrales"] as Record<string, number> | undefined) ?? {};
  return {
    marcaFuerte: marcas.map((m) => m.dominio.toLowerCase()),
    tiposNoDisputables: (o["tiposNoDisputables"] as string[] | undefined) ?? [],
    tiposDeContenidoDebil: (o["tiposDeContenidoDebil"] as string[] | undefined) ?? [],
    alto: u["alto"] ?? 6,
    medio: u["medio"] ?? 4,
    disputablesEnElTop3: u["disputablesEnElTop3"] ?? 1,
    kdFacil: u["kdFacil"] ?? 20,
    kdDuro: u["kdDuro"] ?? 40,
  };
}

// ---------------------------------------------------------------------------
// Clasificacion de una posicion del top 10
// ---------------------------------------------------------------------------

export type Veredicto = "disputable" | "barrera";

export interface PosicionEvaluada {
  readonly posicion: number;
  readonly dominio: string;
  readonly url: string;
  readonly tipo: string;
  readonly veredicto: Veredicto;
  /** Por que, en una etiqueta corta y estable. */
  readonly motivo: string;
}

/**
 * Puede un medico individual con contenido propio disputar ESTA posicion.
 *
 * Tres reglas, en este orden y sin excepciones:
 *
 *   1. Grupo clinico con marca -> barrera. No se le gana con contenido en el horizonte de este
 *      proyecto, y afirmar lo contrario seria vender humo.
 *   2. Contenido internacional -> barrera. Son 46 de los 95 organicos que tipifico el plan
 *      13-01: dominios con autoridad de decadas respondiendo la pregunta clinica generica.
 *      Lima no disputa esas posiciones, y su presencia dice ademas que esa SERP no es local.
 *   3. Todo lo demas -> disputable. Un directorio y una red social se ganan con una pagina
 *      clinica de verdad; otro medico individual es un par, y esta MEDIDO que rankea sin un
 *      solo enlace a su pagina interior.
 */
export function evaluarPosicion(
  resultado: { readonly posicion: number; readonly dominio: string; readonly url: string; readonly tipo: string },
  reglas: ReglasDeAlcance,
): PosicionEvaluada {
  const dominio = dominioDe(resultado.dominio);

  const marca = reglas.marcaFuerte.find((m) => esDelDominio(dominio, m));
  if (marca !== undefined) {
    return { ...resultado, dominio, veredicto: "barrera", motivo: `clinica con marca: ${marca}` };
  }
  if (reglas.tiposNoDisputables.includes(resultado.tipo)) {
    return { ...resultado, dominio, veredicto: "barrera", motivo: "contenido internacional" };
  }
  if (reglas.tiposDeContenidoDebil.includes(resultado.tipo)) {
    return { ...resultado, dominio, veredicto: "disputable", motivo: `contenido debil: ${resultado.tipo}` };
  }
  return { ...resultado, dominio, veredicto: "disputable", motivo: "medico o clinica pequena, sin marca" };
}

// ---------------------------------------------------------------------------
// El veredicto por cabeza
// ---------------------------------------------------------------------------

export type Nivel = "alto" | "medio" | "bajo";

export interface EntradaDeCabeza {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly rango: number;
  readonly familia: string;
  readonly intent: string;
  readonly volumen: number | null;
  readonly volumenFuente: string;
  readonly cluster: string | null;
  readonly keywordDifficulty: number | null;
  readonly keywordDifficultyFuente: string;
  readonly trafficPotential: number | null;
  readonly trafficPotentialFuente: string;
  readonly serp: SerpCompleta;
  /** Competidores perfilados que aparecen en este top 10, con su DR medido. */
  readonly competidoresEnTop?: readonly { readonly domain: string; readonly domainRating: number | null }[];
}

export interface CabezaEvaluada {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly cluster: string | null;
  readonly rango: number;
  readonly familia: string;
  readonly intent: string;
  readonly volumen: number | null;
  readonly volumenFuente: string;
  readonly keywordDifficulty: number | null;
  readonly keywordDifficultyFuente: string;
  readonly trafficPotential: number | null;
  readonly trafficPotentialFuente: string;
  readonly nivel: Nivel;
  readonly alcanzable: boolean;
  readonly disputables: number;
  readonly barreras: number;
  readonly posicionesMedidas: number;
  /**
   * Disputables sobre posiciones medidas. Se publica ademas del recuento porque el denominador
   * VARIA: una SERP con pack local trae siete u ocho organicos en vez de diez, y esas son
   * justo las de intencion local. El veredicto usa el recuento absoluto —lo que importa es
   * cuantas posiciones se pueden tomar de verdad— pero 13-05 puede reordenar por proporcion.
   */
  readonly proporcionDisputable: number;
  readonly disputablesEnTop3: number;
  readonly primeraDisputable: number | null;
  /** Reparto de tipos de pagina del top 10, del clasificador del plan 13-01. */
  readonly repartoTop10: Record<string, number>;
  readonly posiciones: PosicionEvaluada[];
  readonly competidoresEnTop: { readonly domain: string; readonly domainRating: number | null }[];
  /** Con cuantas mitades se resolvio: `serp` sola, o `serp+kd`. */
  readonly resueltaCon: "serp" | "serp+kd";
  /** Las razones EN TEXTO. KWR-06 se apoya en ellas y Juan tiene que poder leerlas. */
  readonly razones: string[];
}

export function evaluarCabeza(entrada: EntradaDeCabeza, reglas: ReglasDeAlcance): CabezaEvaluada {
  const clasificada = clasificarSerp(entrada.serp);
  const top = clasificada.resultados.filter((r) => r.posicion <= 10);
  const posiciones = top.map((r) =>
    evaluarPosicion({ posicion: r.posicion, dominio: r.dominio, url: r.url, tipo: r.tipo }, reglas),
  );

  const disputables = posiciones.filter((p) => p.veredicto === "disputable");
  const disputablesEnTop3 = disputables.filter((p) => p.posicion <= 3).length;
  const primeraDisputable = disputables.length === 0 ? null : (disputables[0] as PosicionEvaluada).posicion;

  // --- Mitad 1: la SERP ---
  let nivel: Nivel =
    disputables.length >= reglas.alto ? "alto" : disputables.length >= reglas.medio ? "medio" : "bajo";

  const razones: string[] = [];
  razones.push(
    `${disputables.length} de las ${posiciones.length} posiciones medidas del top 10 las ocupa ` +
      `contenido que un medico individual puede disputar.`,
  );

  const porMotivo = new Map<string, number>();
  for (const p of posiciones) porMotivo.set(p.motivo, (porMotivo.get(p.motivo) ?? 0) + 1);

  const marcas = posiciones.filter((p) => p.motivo.startsWith("clinica con marca"));
  if (marcas.length > 0) {
    razones.push(
      `BAJA: ${marcas.length} posicion${marcas.length === 1 ? "" : "es"} de grupo clinico con marca ` +
        `(${[...new Set(marcas.map((m) => m.dominio))].join(", ")}), que no se ganan con contenido.`,
    );
  }
  const internacional = posiciones.filter((p) => p.motivo === "contenido internacional");
  if (internacional.length > 0) {
    razones.push(
      `BAJA: ${internacional.length} de contenido internacional (${[...new Set(internacional.map((m) => m.dominio))]
        .slice(0, 4)
        .join(", ")}), que Lima no disputa. Ademas indica que esta SERP no es de intencion local.`,
    );
  }
  const debil = posiciones.filter((p) => p.motivo.startsWith("contenido debil"));
  if (debil.length > 0) {
    razones.push(
      `SUBE: ${debil.length} posicion${debil.length === 1 ? "" : "es"} de directorio o red social ` +
        `(${[...new Set(debil.map((m) => m.dominio))].slice(0, 4).join(", ")}): eso no es contenido y se gana con una pagina clinica de verdad.`,
    );
  }
  const pares = posiciones.filter((p) => p.motivo === "medico o clinica pequena, sin marca");
  if (pares.length > 0) {
    razones.push(
      `SUBE: ${pares.length} posicion${pares.length === 1 ? "" : "es"} de medico o clinica pequena sin marca. ` +
        `Esta medido que en este nicho rankean con CERO dominios de referencia en la pagina interior.`,
    );
  }

  if (disputablesEnTop3 < reglas.disputablesEnElTop3 && nivel !== "bajo") {
    nivel = nivel === "alto" ? "medio" : "bajo";
    razones.push(
      `BAJA: las tres primeras posiciones son todas barrera, asi que el techo realista es la ` +
        `posicion ${primeraDisputable ?? 4} y no la 1.`,
    );
  }

  // --- Mitad 2: el KD declarado ---
  const kd = entrada.keywordDifficulty;
  const resueltaCon: "serp" | "serp+kd" =
    kd !== null && entrada.keywordDifficultyFuente === "ahrefs" ? "serp+kd" : "serp";

  if (resueltaCon === "serp+kd") {
    if ((kd as number) <= reglas.kdFacil) {
      // El KD facil sube UN nivel, pero solo si la SERP dejo sitio. Sin una sola posicion
      // disputable no hay KD que rescate a una cabeza: el promedio de mercado no sabe que las
      // diez posiciones las tienen grupos clinicos con marca, y creerle ahi seria exactamente
      // el error que D-09 existe para evitar.
      if (disputables.length >= reglas.medio) {
        razones.push(`SUBE: KD ${kd} declarado por Ahrefs, por debajo de ${reglas.kdFacil}.`);
        nivel = nivel === "bajo" ? "medio" : "alto";
      } else {
        razones.push(
          `KD ${kd} es bajo, pero NO sube el veredicto: con ${disputables.length} posiciones ` +
            `disputables no hay sitio donde entrar. El KD es un promedio de mercado y no sabe ` +
            `quien ocupa esta SERP.`,
        );
      }
    } else if ((kd as number) >= reglas.kdDuro) {
      razones.push(`BAJA: KD ${kd} declarado por Ahrefs, en o por encima de ${reglas.kdDuro}.`);
      if (nivel === "alto") nivel = "medio";
      else if (nivel === "medio") nivel = "bajo";
    } else {
      razones.push(`KD ${kd}: intermedio. No mueve el veredicto en ninguna direccion.`);
    }
  } else {
    razones.push(
      `KD NO MEDIDO (${entrada.keywordDifficultyFuente}). La cabeza no se descarta por eso: se ` +
        `resuelve por la SERP, que es la mitad que si existe. El veredicto se revisa cuando ` +
        `Ahrefs devuelva el dato.`,
    );
  }

  // --- Los competidores presentes, con su DR medido contra la linea de base ---
  const competidoresEnTop = [...(entrada.competidoresEnTop ?? [])];
  if (competidoresEnTop.length > 0) {
    razones.push(
      `Competidores perfilados en este top 10: ` +
        competidoresEnTop.map((c) => `${c.domain} (DR ${c.domainRating ?? "?"})`).join(", ") +
        `. La linea de base propia es DR 0, y en este nicho eso NO es la barrera: sus paginas ` +
        `interiores rankean con cero dominios de referencia.`,
    );
  }

  return {
    keyword: entrada.keyword,
    keywordKey: entrada.keywordKey,
    cluster: entrada.cluster,
    rango: entrada.rango,
    familia: entrada.familia,
    intent: entrada.intent,
    volumen: entrada.volumen,
    volumenFuente: entrada.volumenFuente,
    keywordDifficulty: entrada.keywordDifficulty,
    keywordDifficultyFuente: entrada.keywordDifficultyFuente,
    trafficPotential: entrada.trafficPotential,
    trafficPotentialFuente: entrada.trafficPotentialFuente,
    nivel,
    alcanzable: nivel !== "bajo",
    disputables: disputables.length,
    barreras: posiciones.length - disputables.length,
    posicionesMedidas: posiciones.length,
    proporcionDisputable:
      posiciones.length === 0 ? 0 : Number((disputables.length / posiciones.length).toFixed(3)),
    disputablesEnTop3,
    primeraDisputable,
    repartoTop10: clasificada.reparto,
    posiciones,
    competidoresEnTop,
    resueltaCon,
    razones,
  };
}

/** Orden del entregable: alcanzabilidad, despues valor de negocio, despues volumen. */
export function ordenar(cabezas: readonly CabezaEvaluada[]): CabezaEvaluada[] {
  const peso: Record<Nivel, number> = { alto: 0, medio: 1, bajo: 2 };
  return [...cabezas].sort(
    (a, b) =>
      peso[a.nivel] - peso[b.nivel] ||
      b.disputables - a.disputables ||
      a.rango - b.rango ||
      (b.volumen ?? -1) - (a.volumen ?? -1) ||
      (a.keywordKey < b.keywordKey ? -1 : 1),
  );
}

export function serializar(cabezas: readonly CabezaEvaluada[]): string {
  return `${cabezas.map((c) => JSON.stringify(c)).join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// El entregable legible
// ---------------------------------------------------------------------------

function fmt(v: number | null): string {
  return v === null ? "—" : String(v);
}

export function documento(cabezas: readonly CabezaEvaluada[], reglas: ReglasDeAlcance): string {
  const l: string[] = [];
  const alto = cabezas.filter((c) => c.nivel === "alto");
  const medio = cabezas.filter((c) => c.nivel === "medio");
  const bajo = cabezas.filter((c) => c.nivel === "bajo");
  const conKD = cabezas.filter((c) => c.resueltaCon === "serp+kd").length;

  l.push(`# Punto dulce — fase 13 (KWR-05)`);
  l.push("");
  l.push(
    `> **El encuadre cambio y esto no es un detalle.** KWR-05 definia el punto dulce como las`,
    `> keywords cuyo KD es alcanzable con el perfil de enlaces del dominio. La medicion del`,
    `> 2026-08-11 contra Ahrefs lo invalida: en los cinco competidores la home concentra todos`,
    `> los dominios de referencia y las paginas interiores tienen **cero**, y son justo esas las`,
    `> que traen el trafico. Tres de los cinco tienen cero trafico organico. **Los enlaces no son`,
    `> el factor limitante en este nicho; el contenido si.** Asi que la alcanzabilidad de abajo`,
    `> se mide contra la calidad del contenido que ocupa el top 10, no contra los enlaces.`,
  );
  l.push("");
  l.push(`**Cabezas evaluadas:** ${cabezas.length} · **alcanzables:** ${alto.length + medio.length}`);
  l.push(
    `(${alto.length} de alcance alto, ${medio.length} medio, ${bajo.length} bajo) · ` +
      `resueltas con las dos mitades: **${conKD} de ${cabezas.length}**`,
  );
  l.push("");
  if (conKD < cabezas.length) {
    l.push(
      `> **Falta la mitad declarada.** ${cabezas.length - conKD} cabezas se resolvieron solo por la`,
      `> SERP porque el KD de Ahrefs todavia no esta ingerido. Ninguna se descarto por eso: la`,
      `> SERP es la mitad que si existe. Al llegar el KD hay que volver a correr este comando,`,
      `> que no cuesta ninguna busqueda.`,
    );
    l.push("");
  }

  l.push(`## Como se lee la alcanzabilidad`);
  l.push("");
  l.push(`Cada posicion del top 10 se clasifica en dos veredictos:`);
  l.push("");
  l.push(`| Veredicto | Quien la ocupa | Por que |`);
  l.push(`|---|---|---|`);
  l.push(
    `| **barrera** | grupo clinico con marca | Presupuesto de contenido y trafico de navegacion propio. No se le gana en el horizonte de este proyecto |`,
  );
  l.push(
    `| **barrera** | contenido internacional | Autoridad de decadas sobre la pregunta clinica generica. Lima no disputa esas posiciones |`,
  );
  l.push(
    `| **disputable** | directorio o red social | Una ficha de Doctoralia y un post de Facebook no son contenido |`,
  );
  l.push(
    `| **disputable** | medico o clinica pequena | Es un par, y esta medido que rankea con **cero** dominios de referencia en su pagina interior |`,
  );
  l.push("");
  l.push(
    `Cortes: **alto** con ${reglas.alto} disputables o mas, **medio** con ${reglas.medio} o mas, ` +
      `y baja un nivel si las tres primeras posiciones son todas barrera.`,
  );
  l.push("");

  const tabla = (titulo: string, filas: readonly CabezaEvaluada[]): void => {
    l.push(`## ${titulo}`);
    l.push("");
    if (filas.length === 0) {
      l.push(`Ninguna.`);
      l.push("");
      return;
    }
    l.push(`| Cabeza | Cluster | Vol. | KD | TP | Disputables | Primera libre | Intencion |`);
    l.push(`|---|---|---:|---:|---:|---:|---:|---|`);
    for (const c of filas) {
      l.push(
        `| ${c.keyword} | ${c.cluster ?? "—"} | ${fmt(c.volumen)} | ${fmt(c.keywordDifficulty)} | ` +
          `${fmt(c.trafficPotential)} | ${c.disputables}/${c.posicionesMedidas} | ${fmt(c.primeraDisputable)} | ${c.intent} |`,
      );
    }
    l.push("");
  };

  tabla("Alcance alto", alto);
  tabla("Alcance medio", medio);

  // La mitad del entregable que se suele omitir.
  l.push(`## Volumen alto que quedo FUERA de alcance`);
  l.push("");
  l.push(
    `Esta seccion existe porque es la que se suele omitir. Son las cabezas de mayor volumen que`,
    `NO son punto dulce, con la razon concreta al lado: sin ella, cualquiera que ordene el Sheet`,
    `por volumen va a preguntar por que no estan en la lista de objetivos.`,
  );
  l.push("");
  const fuera = [...bajo].sort((a, b) => (b.volumen ?? -1) - (a.volumen ?? -1)).slice(0, 20);
  if (fuera.length === 0) {
    l.push(`Ninguna cabeza quedo fuera de alcance.`);
    l.push("");
  } else {
    for (const c of fuera) {
      l.push(`### ${c.keyword} · volumen ${fmt(c.volumen)} · ${c.disputables}/${c.posicionesMedidas} disputables`);
      l.push("");
      for (const r of c.razones) l.push(`- ${r}`);
      l.push("");
    }
  }

  l.push(`## Todas las cabezas, con sus razones`);
  l.push("");
  for (const c of cabezas) {
    l.push(
      `### ${c.keyword} — **${c.nivel}** · ${c.disputables}/${c.posicionesMedidas} disputables · ` +
        `volumen ${fmt(c.volumen)} · KD ${fmt(c.keywordDifficulty)}`,
    );
    l.push("");
    for (const r of c.razones) l.push(`- ${r}`);
    l.push("");
    l.push(`| Pos. | Dominio | Veredicto | Motivo |`);
    l.push(`|---:|---|---|---|`);
    for (const p of c.posiciones) {
      l.push(`| ${p.posicion} | ${p.dominio} | ${p.veredicto} | ${p.motivo} |`);
    }
    l.push("");
  }

  return `${l.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// Punto de entrada
// ---------------------------------------------------------------------------

interface Candidata {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly rango: number;
  readonly familia: string;
  readonly intent: string;
  readonly volumen: number | null;
  readonly volumenFuente: string;
}

function leerJsonl<T>(ruta: string): T[] {
  const salida: T[] = [];
  for (const linea of readFileSync(ruta, "utf8").split("\n")) {
    const t = linea.trim();
    if (t !== "") salida.push(JSON.parse(t) as T);
  }
  return salida;
}

async function main(): Promise<number> {
  const out = process.stdout;
  const reglas = cargarReglasDeAlcance();
  const reglasDeTipo: ReglasDeTipo = cargarReglasDeTipo();
  void reglasDeTipo;

  const candidatas = (
    JSON.parse(readFileSync(RUTA_CANDIDATAS, "utf8")) as { candidatas: Candidata[] }
  ).candidatas;

  const metricas = new Map(
    leerJsonl<{
      keywordKey: string;
      keywordDifficulty: number | null;
      keywordDifficultyFuente: string;
      trafficPotential: number | null;
      trafficPotentialFuente: string;
    }>(RUTA_METRICAS).map((m) => [m.keywordKey, m]),
  );

  const clusters = new Map(
    leerJsonl<{ keywordKey: string; cluster: string | null }>(RUTA_CLUSTERS).map((c) => [c.keywordKey, c.cluster]),
  );

  const perfil = JSON.parse(readFileSync(RUTA_COMPETIDORES, "utf8")) as {
    competidores: { domain: string; domainRating: number | null; esLineaDeBase?: boolean }[];
  };
  const competidores = perfil.competidores.filter((c) => c.esLineaDeBase !== true);

  const evaluadas: CabezaEvaluada[] = [];
  const sinCaptura: string[] = [];

  for (const c of candidatas) {
    let serp: SerpCompleta;
    try {
      serp = await leerSerp(c.keyword, { offline: true });
    } catch {
      sinCaptura.push(c.keyword);
      continue;
    }

    const enTop = competidores
      .filter((x) => serp.organicos.some((o) => o.posicion <= 10 && esDelDominio(dominioDe(o.dominio), dominioDe(x.domain))))
      .map((x) => ({ domain: x.domain, domainRating: x.domainRating }));

    const m = metricas.get(c.keywordKey);
    evaluadas.push(
      evaluarCabeza(
        {
          keyword: c.keyword,
          keywordKey: c.keywordKey,
          rango: c.rango,
          familia: c.familia,
          intent: c.intent,
          volumen: c.volumen,
          volumenFuente: c.volumenFuente,
          cluster: clusters.get(c.keywordKey) ?? null,
          keywordDifficulty: m?.keywordDifficulty ?? null,
          keywordDifficultyFuente: m?.keywordDifficultyFuente ?? "no_consultado",
          trafficPotential: m?.trafficPotential ?? null,
          trafficPotentialFuente: m?.trafficPotentialFuente ?? "no_consultado",
          serp,
          competidoresEnTop: enTop,
        },
        reglas,
      ),
    );
  }

  const ordenadas = ordenar(evaluadas);

  if (sinCaptura.length > 0) {
    out.write(`Cabezas sin captura, saltadas: ${sinCaptura.length}\n`);
    for (const k of sinCaptura) out.write(`  - ${k}\n`);
  }

  const cuenta = (n: Nivel): number => ordenadas.filter((c) => c.nivel === n).length;
  out.write(`Cabezas evaluadas: ${ordenadas.length}\n`);
  out.write(`  alcance alto:  ${cuenta("alto")}\n`);
  out.write(`  alcance medio: ${cuenta("medio")}\n`);
  out.write(`  alcance bajo:  ${cuenta("bajo")}\n`);
  out.write(`  alcanzables:   ${ordenadas.filter((c) => c.alcanzable).length}\n`);
  out.write(
    `  resueltas con las dos mitades: ${ordenadas.filter((c) => c.resueltaCon === "serp+kd").length} de ${ordenadas.length}\n`,
  );

  writeFileSync(RUTA_SALIDA, serializar(ordenadas), "utf8");
  writeFileSync(RUTA_DOC, documento(ordenadas, reglas), "utf8");
  out.write(`\nEscrito: ${RUTA_SALIDA}\nEscrito: ${RUTA_DOC}\n`);
  return 0;
}

// Solo se ejecuta cuando ESTE archivo es el que se invoco. Sin la guarda, importarlo desde la
// prueba correria `main` con los argumentos del corredor de pruebas, que es la trampa que
// `args.ts` documenta desde el plan 13-01.
if (process.argv[1] !== undefined && process.argv[1].endsWith("sweet-spot.ts")) {
  ejecutar(main);
}
