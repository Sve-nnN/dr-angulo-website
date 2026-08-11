/**
 * Perfil de los cinco competidores de Lima mas la linea de base del propio dominio.
 *
 * LEE SOLO DE LA CACHE. Reconstruir el perfil cuesta cero unidades y cero llamadas de red, que
 * es lo que permite corregir un parser o cambiar el criterio de blog sin volver a pagarle a la
 * fuente. Si una consulta no esta en cache, la metrica queda declarada como no consultada; el
 * modulo no sale a buscarla.
 *
 * DOS REGLAS QUE GOBIERNAN TODO EL ARCHIVO:
 *
 *   1. Una metrica que la fuente no devolvio queda en `null`, NUNCA en cero, y ademas lleva su
 *      campo de procedencia al lado. Un cero afirma algo que nadie midio, y en este proyecto
 *      eso mandaria las cuatro condiciones nucleo del negocio al final de cualquier orden.
 *   2. La lista de dominios es una decision cerrada (D-11) y vive en `data/competitors-fijos.json`.
 *      Este modulo no acepta otros: no es un parametro de la corrida.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT } from "../config.js";
import {
  DATA_DIR,
  ENDPOINTS,
  ENDPOINTS_DE_DOMINIO,
  claveDeConsulta,
  leerConsulta,
  normalizarDominio,
  paramsDeDominio,
  parsearBacklinksStats,
  parsearDomainRating,
  parsearMetrics,
  parsearTopPages,
  type EtiquetaEndpoint,
  type PaginaDeCompetidor,
} from "./ahrefs.js";

const RUTA_FIJOS = path.join(DATA_DIR, "competitors-fijos.json");

// ---------------------------------------------------------------------------
// La decision cerrada
// ---------------------------------------------------------------------------

export interface CompetidorFijo {
  readonly domain: string;
  readonly name: string;
  readonly quien: string;
  readonly origen: string;
}

export interface ResenaDelPack {
  readonly nombre: string;
  readonly calificacion: number;
  readonly resenas: number;
}

export interface ListaFija {
  readonly decision: string;
  readonly fijadoEl: string;
  readonly lineaDeBase: CompetidorFijo;
  readonly competidores: readonly CompetidorFijo[];
  readonly resenasDelPackLocal: readonly ResenaDelPack[];
  readonly rutasDeBlog: readonly string[];
}

function comoCompetidor(raw: unknown, donde: string): CompetidorFijo {
  if (raw === null || typeof raw !== "object") {
    throw new CliError(`${RUTA_FIJOS}: ${donde} no es un objeto.`);
  }
  const o = raw as Record<string, unknown>;
  for (const campo of ["domain", "name", "quien", "origen"]) {
    if (typeof o[campo] !== "string" || (o[campo] as string).trim() === "") {
      throw new CliError(`${RUTA_FIJOS}: ${donde} no declara "${campo}".`);
    }
  }
  return {
    domain: normalizarDominio(o["domain"] as string),
    name: o["name"] as string,
    quien: o["quien"] as string,
    origen: o["origen"] as string,
  };
}

/** Carga la decision cerrada. Falla ruidosa si el archivo no la declara entera. */
export async function cargarListaFija(ruta: string = RUTA_FIJOS): Promise<ListaFija> {
  let crudo: string;
  try {
    crudo = await readFile(ruta, "utf8");
  } catch {
    throw new CliError(
      `No se pudo leer la lista fija de competidores.\n  Ruta: ${ruta}\n` +
        `  Accion: verificar que seo-tools/data/competitors-fijos.json este commiteado.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(crudo);
  } catch (error) {
    throw new CliError(`La lista fija de competidores no es JSON valido.\n  Detalle: ${String(error)}`);
  }
  if (parsed === null || typeof parsed !== "object") {
    throw new CliError(`${ruta}: la raiz no es un objeto.`);
  }
  const o = parsed as Record<string, unknown>;

  const competidores = o["competidores"];
  if (!Array.isArray(competidores) || competidores.length === 0) {
    throw new CliError(`${ruta}: falta el arreglo "competidores".`);
  }

  const lista: ListaFija = {
    decision: typeof o["decision"] === "string" ? o["decision"] : "D-11",
    fijadoEl: typeof o["fijadoEl"] === "string" ? o["fijadoEl"] : "",
    lineaDeBase: comoCompetidor(o["lineaDeBase"], "lineaDeBase"),
    competidores: competidores.map((c, i) => comoCompetidor(c, `competidores[${i}]`)),
    resenasDelPackLocal: Array.isArray(o["resenasDelPackLocal"])
      ? (o["resenasDelPackLocal"] as ResenaDelPack[])
      : [],
    rutasDeBlog: Array.isArray(o["rutasDeBlog"])
      ? (o["rutasDeBlog"] as string[]).map((r) => r.toLowerCase())
      : [],
  };

  const vistos = new Set<string>();
  for (const c of [...lista.competidores, lista.lineaDeBase]) {
    if (vistos.has(c.domain)) {
      throw new CliError(`${ruta}: el dominio ${c.domain} esta declarado dos veces.`);
    }
    vistos.add(c.domain);
  }

  return lista;
}

// ---------------------------------------------------------------------------
// Procedencia: la mitad del dato que hace que el dato sirva
// ---------------------------------------------------------------------------

/**
 * De donde sale cada metrica.
 *
 *   ahrefs           la fuente devolvio el valor. Un cero con esta procedencia es un cero real.
 *   ahrefs_sin_dato  la consulta esta en cache pero la fuente no trajo ese campo.
 *   no_consultado    la consulta todavia no se ingirio. No es lo mismo que no tener el dato.
 *   sin_evidencia    hubo datos y no alcanzaron para afirmar. Solo lo usa la presencia de blog.
 */
export type Procedencia = "ahrefs" | "ahrefs_sin_dato" | "no_consultado" | "sin_evidencia";

export type EstadoDeConsulta = "en-cache" | "no-consultado";

export interface ProcedenciaDeConsulta {
  readonly clave: string;
  readonly estado: EstadoDeConsulta;
  /** `fetchedAt` del envelope, no del reloj: dos corridas leen el mismo archivo y dan lo mismo. */
  readonly capturadaEn: string | null;
  readonly resultado: string | null;
}

export interface PerfilCompetidor {
  readonly domain: string;
  readonly name: string;
  readonly quien: string;
  readonly origen: string;
  /** true solo para el dominio propio. Es la referencia, no un competidor. */
  readonly esLineaDeBase: boolean;

  readonly domainRating: number | null;
  readonly domainRatingFuente: Procedencia;
  readonly ahrefsRank: number | null;
  readonly ahrefsRankFuente: Procedencia;
  readonly referringDomains: number | null;
  readonly referringDomainsFuente: Procedencia;
  readonly organicTraffic: number | null;
  readonly organicTrafficFuente: Procedencia;
  readonly organicKeywords: number | null;
  readonly organicKeywordsFuente: Procedencia;

  readonly blog: boolean | null;
  readonly blogFuente: Procedencia;
  /** URL concreta que sostiene el `true`. null cuando no se pudo afirmar. */
  readonly blogEvidencia: string | null;

  readonly paginasMasEnlazadas: readonly PaginaDeCompetidor[];
  readonly procedencia: Readonly<Record<string, ProcedenciaDeConsulta>>;
}

export interface Perfilado {
  readonly decision: string;
  readonly fijadoEl: string;
  readonly fuenteDeLasMetricas: string;
  readonly resenasDelPackLocal: readonly ResenaDelPack[];
  readonly competidores: readonly PerfilCompetidor[];
  /** Consultas que todavia faltan para cerrar COMP-01 y COMP-04. Vacio significa completo. */
  readonly consultasPendientes: readonly { readonly domain: string; readonly endpoint: string; readonly clave: string }[];
}

// ---------------------------------------------------------------------------
// Perfilado
// ---------------------------------------------------------------------------

function marcar<T>(valor: T | null, enCache: boolean): { valor: T | null; fuente: Procedencia } {
  if (!enCache) return { valor: null, fuente: "no_consultado" };
  return valor === null ? { valor: null, fuente: "ahrefs_sin_dato" } : { valor, fuente: "ahrefs" };
}

/**
 * Deduce la presencia de blog a partir de las paginas mas enlazadas.
 *
 * Encontrar una ruta de blog AFIRMA que lo tiene. No encontrar ninguna NO afirma lo contrario:
 * el top por enlaces es una muestra de diez paginas, no un mapa del sitio. Devolver `false` ahi
 * seria exactamente el mismo error que devolver cero para una metrica ausente.
 */
export function deducirBlog(
  paginas: readonly PaginaDeCompetidor[],
  rutasDeBlog: readonly string[],
  enCache: boolean,
): { blog: boolean | null; fuente: Procedencia; evidencia: string | null } {
  if (!enCache) return { blog: null, fuente: "no_consultado", evidencia: null };

  for (const pagina of paginas) {
    let ruta: string;
    try {
      ruta = new URL(pagina.url).pathname.toLowerCase();
    } catch {
      ruta = pagina.url.toLowerCase();
    }
    if (rutasDeBlog.some((fragmento) => ruta.startsWith(fragmento) || ruta.includes(`${fragmento}/`))) {
      return { blog: true, fuente: "ahrefs", evidencia: pagina.url };
    }
  }

  return { blog: null, fuente: "sin_evidencia", evidencia: null };
}

export interface OpcionesPerfil {
  readonly cacheDir?: string | undefined;
  readonly rutaFijos?: string | undefined;
}

async function perfilarUno(
  fijo: CompetidorFijo,
  esLineaDeBase: boolean,
  rutasDeBlog: readonly string[],
  opciones: OpcionesPerfil,
): Promise<{ perfil: PerfilCompetidor; pendientes: EtiquetaEndpoint[] }> {
  const procedencia: Record<string, ProcedenciaDeConsulta> = {};
  const pendientes: EtiquetaEndpoint[] = [];
  const cuerpos = new Map<EtiquetaEndpoint, unknown>();

  for (const etiqueta of ENDPOINTS_DE_DOMINIO) {
    const params = paramsDeDominio(etiqueta, fijo.domain);
    const clave = claveDeConsulta(etiqueta, params);
    const envelope = await leerConsulta(etiqueta, params, {
      ...(opciones.cacheDir === undefined ? {} : { cacheDir: opciones.cacheDir }),
    });

    procedencia[etiqueta] = {
      clave,
      estado: envelope === null ? "no-consultado" : "en-cache",
      capturadaEn: envelope?.fetchedAt ?? null,
      resultado: envelope?.outcome ?? null,
    };
    if (envelope === null) pendientes.push(etiqueta);
    else cuerpos.set(etiqueta, envelope.response);
  }

  const tiene = (etiqueta: EtiquetaEndpoint): boolean => cuerpos.has(etiqueta);

  const dr = parsearDomainRating(cuerpos.get(ENDPOINTS.domainRating) ?? null);
  const bl = parsearBacklinksStats(cuerpos.get(ENDPOINTS.backlinksStats) ?? null);
  const me = parsearMetrics(cuerpos.get(ENDPOINTS.metrics) ?? null);
  const paginas = parsearTopPages(cuerpos.get(ENDPOINTS.topPages) ?? null);

  const mDr = marcar(dr.domainRating, tiene(ENDPOINTS.domainRating));
  const mAr = marcar(dr.ahrefsRank, tiene(ENDPOINTS.domainRating));
  const mRd = marcar(bl.referringDomains, tiene(ENDPOINTS.backlinksStats));
  const mTr = marcar(me.organicTraffic, tiene(ENDPOINTS.metrics));
  const mKw = marcar(me.organicKeywords, tiene(ENDPOINTS.metrics));
  const blog = deducirBlog(paginas, rutasDeBlog, tiene(ENDPOINTS.topPages));

  return {
    perfil: {
      domain: fijo.domain,
      name: fijo.name,
      quien: fijo.quien,
      origen: fijo.origen,
      esLineaDeBase,
      domainRating: mDr.valor,
      domainRatingFuente: mDr.fuente,
      ahrefsRank: mAr.valor,
      ahrefsRankFuente: mAr.fuente,
      referringDomains: mRd.valor,
      referringDomainsFuente: mRd.fuente,
      organicTraffic: mTr.valor,
      organicTrafficFuente: mTr.fuente,
      organicKeywords: mKw.valor,
      organicKeywordsFuente: mKw.fuente,
      blog: blog.blog,
      blogFuente: blog.fuente,
      blogEvidencia: blog.evidencia,
      paginasMasEnlazadas: paginas,
      procedencia,
    },
    pendientes,
  };
}

/**
 * Arma el perfil de los cinco competidores mas la linea de base, leyendo SOLO de la cache.
 *
 * No recibe la lista de dominios: es una decision cerrada y sale del archivo de datos. Dos
 * ejecuciones sobre la misma cache producen el mismo objeto, porque ningun valor sale del
 * reloj ni del orden en que la fuente devolvio las filas.
 */
export async function perfilar(opciones: OpcionesPerfil = {}): Promise<Perfilado> {
  const lista = await cargarListaFija(opciones.rutaFijos ?? RUTA_FIJOS);

  const competidores: PerfilCompetidor[] = [];
  const consultasPendientes: { domain: string; endpoint: string; clave: string }[] = [];

  const todos: { fijo: CompetidorFijo; base: boolean }[] = [
    ...lista.competidores.map((fijo) => ({ fijo, base: false })),
    { fijo: lista.lineaDeBase, base: true },
  ];

  for (const { fijo, base } of todos) {
    const { perfil, pendientes } = await perfilarUno(fijo, base, lista.rutasDeBlog, opciones);
    competidores.push(perfil);
    for (const etiqueta of pendientes) {
      consultasPendientes.push({
        domain: fijo.domain,
        endpoint: etiqueta,
        clave: perfil.procedencia[etiqueta]?.clave ?? "",
      });
    }
  }

  return {
    decision: lista.decision,
    fijadoEl: lista.fijadoEl,
    fuenteDeLasMetricas:
      "Ahrefs API v3 via servidor MCP, ingerido con src/phase13/ahrefs-ingest.ts. " +
      "Este modulo lee SOLO de la cache y no consulta nada.",
    resenasDelPackLocal: lista.resenasDelPackLocal,
    competidores,
    consultasPendientes,
  };
}

// ---------------------------------------------------------------------------
// Entregable legible
// ---------------------------------------------------------------------------

function celda(valor: number | null, fuente: Procedencia): string {
  if (valor === null) return `_${fuente}_`;
  return String(valor);
}

function celdaBlog(perfil: PerfilCompetidor): string {
  if (perfil.blog === true) return `si (\`${perfil.blogEvidencia ?? ""}\`)`;
  return `_${perfil.blogFuente}_`;
}

/** Genera el entregable de COMP-01 y COMP-04 a partir del perfil. Sin reloj: es determinista. */
export function comoMarkdown(perfilado: Perfilado): string {
  const partes: string[] = [];

  partes.push(
    `# Competencia de Lima: los cinco mas la linea de base propia\n`,
    `Entregable de COMP-01 y COMP-04, fase 13, plan 13-03. Generado por\n` +
      `\`seo-tools/src/phase13/comp-profile.ts\` a partir de \`seo-tools/data/competitors.json\`.\n` +
      `**No se edita a mano:** se regenera corriendo el comando, que lee solo de la cache y no\n` +
      `gasta unidades.\n`,
    `- Los cinco dominios son la decision **${perfilado.decision}**, cerrada el ${perfilado.fijadoEl}.\n` +
      `- Procedencia de las metricas: ${perfilado.fuenteDeLasMetricas}\n` +
      `- Una metrica que la fuente no devolvio aparece en cursiva con su motivo, **nunca como cero**.\n` +
      `  \`no_consultado\` significa que la consulta todavia no entro a la cache; \`ahrefs_sin_dato\`\n` +
      `  que la consulta esta pero la fuente no trajo ese campo; \`sin_evidencia\` que hubo datos y\n` +
      `  no alcanzaron para afirmar.\n`,
  );

  if (perfilado.consultasPendientes.length > 0) {
    partes.push(
      `> **Estado: incompleto.** Faltan ${perfilado.consultasPendientes.length} consultas de Ahrefs\n` +
        `> por ingerir. Ahrefs no tiene credencial en \`.secrets/.env\` y su unico camino de acceso\n` +
        `> es el servidor MCP. Hasta que entren, las metricas de COMP-01 quedan declaradas como\n` +
        `> \`no_consultado\`, que es distinto de cero y distinto de "no tiene".\n`,
    );
  }

  partes.push(`## Tabla comparativa\n`);
  partes.push(
    `| Dominio | Quien | DR | Ahrefs Rank | Referring domains | Trafico organico | Keywords top 100 | Blog |\n` +
      `|---|---|---|---|---|---|---|---|`,
  );
  for (const c of perfilado.competidores) {
    const nombre = c.esLineaDeBase ? `**${c.domain}** (linea de base)` : `\`${c.domain}\``;
    partes.push(
      `| ${nombre} | ${c.name} | ${celda(c.domainRating, c.domainRatingFuente)} | ` +
        `${celda(c.ahrefsRank, c.ahrefsRankFuente)} | ${celda(c.referringDomains, c.referringDomainsFuente)} | ` +
        `${celda(c.organicTraffic, c.organicTrafficFuente)} | ${celda(c.organicKeywords, c.organicKeywordsFuente)} | ` +
        `${celdaBlog(c)} |`,
    );
  }
  partes.push("");

  partes.push(`## Paginas mas enlazadas, por competidor\n`);
  partes.push(
    `De mayor a menor por cantidad de dominios de referencia. Es la primera mitad de COMP-04; la\n` +
      `otra mitad, los featured snippets, se mide sobre las SERP ya capturadas y la cierra el plan\n` +
      `13-04 sin pedirle nada a Ahrefs.\n`,
  );
  for (const c of perfilado.competidores) {
    partes.push(`### ${c.name} — \`${c.domain}\`\n`);
    partes.push(`${c.quien}\n`);
    partes.push(`Origen del dominio en el analisis: ${c.origen}.\n`);
    if (c.paginasMasEnlazadas.length === 0) {
      const estado = c.procedencia["site-explorer/top-pages"]?.estado ?? "no-consultado";
      partes.push(
        estado === "en-cache"
          ? `La fuente respondio y no devolvio ninguna pagina. No es lo mismo que no tenerlas.\n`
          : `_Sin datos todavia: la consulta \`site-explorer/top-pages\` no se ha ingerido._\n`,
      );
      continue;
    }
    partes.push(`| # | URL | Dominios de referencia | Keyword principal | Trafico estimado |\n|---|---|---|---|---|`);
    c.paginasMasEnlazadas.forEach((p, i) => {
      partes.push(
        `| ${i + 1} | \`${p.url}\` | ${p.referringDomains ?? "_sin dato_"} | ` +
          `${p.titulo ?? "_sin dato_"} | ${p.traficoEstimado ?? "_sin dato_"} |`,
      );
    });
    partes.push("");
  }

  if (perfilado.resenasDelPackLocal.length > 0) {
    partes.push(`## Resenas del pack local\n`);
    partes.push(
      `Medido en la captura de SerpApi del 2026-08-10. **Insumo para GBP-03 del workstream\n` +
        `\`milestone\`, no de esta fase.**\n`,
    );
    partes.push(`| Ficha | Calificacion | Resenas |\n|---|---|---|`);
    for (const r of perfilado.resenasDelPackLocal) {
      partes.push(`| ${r.nombre} | ${r.calificacion} | ${r.resenas} |`);
    }
    partes.push("");
  }

  if (perfilado.consultasPendientes.length > 0) {
    partes.push(`## Consultas pendientes de ingerir\n`);
    partes.push(`| Dominio | Endpoint | Clave de cache |\n|---|---|---|`);
    for (const p of perfilado.consultasPendientes) {
      partes.push(`| \`${p.domain}\` | \`${p.endpoint}\` | \`${p.clave}\` |`);
    }
    partes.push("");
  }

  return `${partes.join("\n")}\n`;
}

/** Ruta por defecto del archivo de perfil. */
export const RUTA_PERFIL = path.join(SEO_TOOLS_ROOT, "data", "competitors.json");
