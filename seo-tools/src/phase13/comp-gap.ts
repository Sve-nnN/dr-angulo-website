#!/usr/bin/env tsx
/**
 * Punto de entrada del gap de keywords (COMP-02) y de los destacados (COMP-04, segunda mitad).
 *
 * COSTE ADICIONAL CERO. Todo sale de las 96 capturas de SerpApi que ya estan pagadas: la
 * lectura va en modo OFFLINE, que convierte un fallo de cache en error duro en vez de en un
 * gasto silencioso. El contador de SerpApi no se mueve, y hay un criterio del plan que lo
 * compara antes y despues.
 *
 * Ademas del informe, este comando ENRIQUECE `data/competitors.json` con lo que el tab
 * `Competitor Analysis` declara y hasta ahora no tenia dato: las cinco keywords de gap, el
 * conteo de destacados, las paginas principales y las mas enlazadas.
 *
 * ORDEN QUE IMPORTA: correr `comp-profile.ts` ANTES. Aquel reconstruye el perfil desde la cache
 * de Ahrefs y reescribe el archivo entero; este agrega encima. Al reves, el enriquecimiento se
 * pierde sin que nada falle.
 *
 * Uso:
 *   cd seo-tools
 *   ./node_modules/.bin/tsx src/phase13/comp-gap.ts
 *   ./node_modules/.bin/tsx src/phase13/comp-gap.ts --out /tmp/gap1.json
 *   ./node_modules/.bin/tsx src/phase13/comp-gap.ts --dry-run
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CliError, SEO_TOOLS_ROOT, resolveFromRepoRoot } from "../config.js";
import { booleana, ejecutar, parseBanderas, texto } from "./args.js";
import {
  calcularGap,
  marcaAjenaComoInteligencia,
  serializarGap,
  type CapturaDeSerp,
  type Competidor,
  type InformeDeGap,
} from "./gap.js";
import { leerSerp } from "./serp.js";

const RUTA_KEYWORDS = path.join(SEO_TOOLS_ROOT, "data", "keywords.jsonl");
const RUTA_CLUSTERS = path.join(SEO_TOOLS_ROOT, "data", "keyword-clusters.jsonl");
const RUTA_CANDIDATAS = path.join(SEO_TOOLS_ROOT, "data", "serp-candidates.json");
const RUTA_FIJOS = path.join(SEO_TOOLS_ROOT, "data", "competitors-fijos.json");
const RUTA_PERFIL = path.join(SEO_TOOLS_ROOT, "data", "competitors.json");
const RUTA_GAP = path.join(SEO_TOOLS_ROOT, "data", "keyword-gap.json");

/** Cuantas keywords de marca ajena entran al informe. Las dos primeras son las que nombra D-14. */
const MARCAS_EN_EL_INFORME = 15;

/** Ranuras de keyword que declara el tab: filas 18 a 22. */
const KEYWORDS_EN_EL_TAB = 5;
/** Ranuras de pagina que declara el tab: filas 26 a 30 y 32 a 36. */
const PAGINAS_EN_EL_TAB = 5;

interface RegistroDeUniverso {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly alcance: string;
  readonly motivoAlcance: string | null;
  readonly metricas?: { readonly searchVolume?: number | null; readonly searchVolumeFuente?: string };
}

function leerJsonl<T>(ruta: string): T[] {
  const crudo = readFileSync(ruta, "utf8");
  const salida: T[] = [];
  for (const linea of crudo.split("\n")) {
    const t = linea.trim();
    if (t !== "") salida.push(JSON.parse(t) as T);
  }
  return salida;
}

interface PaginaDeCompetidor {
  readonly url: string;
  readonly titulo: string | null;
  readonly referringDomains: number | null;
  readonly traficoEstimado: number | null;
  readonly keywords: number | null;
}

/** Texto legible de una pagina para una celda del tab. Sin dato, cadena vacia y nunca un cero. */
function celdaDePagina(pagina: PaginaDeCompetidor | undefined, metrica: "trafico" | "enlaces"): string {
  if (pagina === undefined) return "";
  const valor = metrica === "trafico" ? pagina.traficoEstimado : pagina.referringDomains;
  const sufijo = metrica === "trafico" ? "de trafico" : "dominios de referencia";
  return valor === null ? pagina.url : `${pagina.url} (${valor} ${sufijo})`;
}

async function main(): Promise<number> {
  const banderas = parseBanderas(process.argv.slice(2));
  const out = process.stdout;
  const ensayo = booleana(banderas, "dry-run");

  // --- Entradas, todas de disco ---

  const universo = leerJsonl<RegistroDeUniverso>(RUTA_KEYWORDS);
  const objetivo = universo.filter((o) => o.alcance === "objetivo");

  const volumenPorClave = new Map<string, { volumen: number | null; fuente: string }>();
  for (const o of universo) {
    volumenPorClave.set(o.keywordKey, {
      volumen: o.metricas?.searchVolume ?? null,
      fuente: o.metricas?.searchVolumeFuente ?? "sin_datos",
    });
  }

  const clusterPorClave = new Map<string, string | null>();
  for (const fila of leerJsonl<{ keywordKey: string; cluster: string | null }>(RUTA_CLUSTERS)) {
    clusterPorClave.set(fila.keywordKey, fila.cluster);
  }

  const candidatas = (
    JSON.parse(readFileSync(RUTA_CANDIDATAS, "utf8")) as {
      candidatas?: { keyword: string; keywordKey: string }[];
    }
  ).candidatas;
  if (!Array.isArray(candidatas)) throw new CliError(`${RUTA_CANDIDATAS} no trae el arreglo "candidatas".`);

  const fijos = JSON.parse(readFileSync(RUTA_FIJOS, "utf8")) as {
    competidores: Competidor[];
    lineaDeBase: { domain: string };
  };

  // --- Las capturas, en modo offline: cero busquedas nuevas ---

  const capturas: CapturaDeSerp[] = [];
  const sinCaptura: string[] = [];
  for (const c of candidatas) {
    let serp;
    try {
      serp = await leerSerp(c.keyword, { offline: true });
    } catch {
      sinCaptura.push(c.keyword);
      continue;
    }
    const v = volumenPorClave.get(c.keywordKey);
    capturas.push({
      keyword: c.keyword,
      keywordKey: c.keywordKey,
      cluster: clusterPorClave.get(c.keywordKey) ?? null,
      volumen: v?.volumen ?? null,
      volumenFuente: v?.fuente ?? "sin_datos",
      serp,
    });
  }

  const informe: InformeDeGap = calcularGap(capturas, fijos.competidores, {
    dominioPropio: fijos.lineaDeBase.domain,
    universo: objetivo.length,
    cabezas: candidatas.length,
    marcaAjena: marcaAjenaComoInteligencia(universo, MARCAS_EN_EL_INFORME),
  });

  // --- Reporte ---

  out.write(`Capturas leidas de la cache: ${capturas.length} (offline, cero busquedas nuevas)\n`);
  if (sinCaptura.length > 0) {
    out.write(`Cabezas sin captura, saltadas: ${sinCaptura.length}\n`);
    for (const k of sinCaptura) out.write(`  - ${k}\n`);
  }
  out.write(
    `\nCobertura: ${informe.cobertura.serpMedidas} SERP medidas · ` +
      `${informe.cobertura.serpSinMedir} sin medir · universo ${informe.cobertura.universo}\n`,
  );
  out.write(
    `Destacados: ${informe.destacadosMedidos} medidos sobre ${informe.destacadosSobre} capturas\n\n`,
  );
  for (const c of informe.porCompetidor) {
    out.write(
      `  ${c.domain.padEnd(28)} gap ${String(c.keywords.length).padStart(3)}  ·  ` +
        `top10 ${String(c.aparicionesEnTop).padStart(3)}  ·  pack ${String(c.aparicionesEnPackLocal).padStart(2)}  ·  ` +
        `destacados ${c.featuredSnippets}  ·  mejor posicion ${c.mejorPosicion ?? "-"}\n`,
    );
  }
  out.write(`\nCompetencia directa (aparecen los dos): ${informe.competenciaDirecta.length}\n`);
  for (const d of informe.competenciaDirecta) {
    out.write(
      `  ${d.keywordKey.padEnd(44)} doctor en ${d.posicionDelDoctor}  vs  ` +
        `${d.competidores.map((x) => `${x.domain} en ${x.posicion}`).join(", ")}\n`,
    );
  }
  out.write(`\nMarca ajena como inteligencia (NO objetivo): ${informe.marcaAjenaComoInteligencia.length}\n`);
  for (const m of informe.marcaAjenaComoInteligencia.slice(0, 5)) {
    out.write(`  ${String(m.volumen).padStart(6)}  ${m.keyword}\n`);
  }

  if (ensayo) {
    out.write(`\nEnsayo: no se escribio nada.\n`);
    return 0;
  }

  // --- Salidas ---

  writeFileSync(RUTA_GAP, serializarGap(informe), "utf8");
  out.write(`\nEscrito: ${RUTA_GAP}\n`);

  const destino = texto(banderas, "out");
  if (destino !== undefined) {
    const ruta = path.isAbsolute(destino) ? destino : resolveFromRepoRoot(destino);
    writeFileSync(ruta, serializarGap(informe), "utf8");
    out.write(`Escrito: ${ruta}\n`);
  }

  // --- Enriquecimiento del perfil, para el tab del cliente ---

  const perfil = JSON.parse(readFileSync(RUTA_PERFIL, "utf8")) as {
    competidores: Record<string, unknown>[];
  };

  for (const registro of perfil.competidores) {
    const domain = String(registro["domain"] ?? "");
    const bloque = informe.porCompetidor.find((c) => c.domain === domain);
    const paginas = (registro["paginasMasEnlazadas"] as PaginaDeCompetidor[] | undefined) ?? [];

    // Las cinco de gap, por volumen. Una ranura sin keyword queda VACIA, no en cero.
    for (let i = 0; i < KEYWORDS_EN_EL_TAB; i += 1) {
      const k = bloque?.keywords[i];
      registro[`keyword${i + 1}`] = k === undefined ? "" : `${k.keyword} (pos. ${k.posicion})`;
    }
    registro["featuredSnippets"] = bloque?.featuredSnippets ?? 0;
    registro["gapKeywords"] = bloque?.keywords.length ?? 0;
    registro["aparicionesEnTop10"] = bloque?.aparicionesEnTop ?? 0;
    registro["aparicionesEnPackLocal"] = bloque?.aparicionesEnPackLocal ?? 0;

    // Las paginas del tab. `Top page N` va por trafico y `Most linked content N` por dominios
    // de referencia: son dos preguntas distintas y en este nicho dan respuestas OPUESTAS, que
    // es justo el hallazgo del 2026-08-11 (la home concentra los enlaces y las interiores
    // traen el trafico).
    const porTrafico = [...paginas].sort(
      (a, b) => (b.traficoEstimado ?? -1) - (a.traficoEstimado ?? -1) || a.url.localeCompare(b.url),
    );
    for (let i = 0; i < PAGINAS_EN_EL_TAB; i += 1) {
      registro[`topPage${i + 1}`] = celdaDePagina(porTrafico[i], "trafico");
      registro[`mostLinked${i + 1}`] = celdaDePagina(paginas[i], "enlaces");
    }

    // La presencia de blog: `null` con `sin_evidencia` NO es "no tiene". Se transcribe el
    // estado en vez de convertirlo en un si o un no que la fuente no dijo.
    const blog = registro["blog"];
    const blogFuente = String(registro["blogFuente"] ?? "no_consultado");
    registro["blogTexto"] =
      blog === true
        ? `si (${String(registro["blogEvidencia"] ?? "evidencia en el top por enlaces")})`
        : blogFuente === "sin_evidencia"
          ? "sin evidencia en el top por enlaces"
          : "no_consultado";
  }

  writeFileSync(RUTA_PERFIL, `${JSON.stringify(perfil, null, 2)}\n`, "utf8");
  out.write(`Escrito: ${RUTA_PERFIL} (enriquecido con el gap, los destacados y las paginas)\n`);
  return 0;
}

ejecutar(main);
