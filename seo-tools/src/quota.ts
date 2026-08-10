/**
 * Libro persistido de cuota consumida por fuente.
 *
 * Por que se persiste, si los aciertos y fallos de cache no. Son dos contadores con vidas
 * distintas: los aciertos y fallos describen la ejecucion en curso y mueren con ella, pero
 * el PRESUPUESTO cruza ejecuciones, porque el techo de busquedas no se reinicia cuando
 * termina el proceso. La cuenta de SerpApi esta en plan gratuito con 250 busquedas al mes,
 * ya lleva 123 consumidas y quedan 127 hasta el 21 de agosto de 2026. Con la fuente de
 * dificultad diferida, SerpApi es la fuente principal de expansion del universo, asi que
 * cada busqueda es una de 127.
 *
 * Solo se registra lo que sale a la red de verdad: un acierto de cache no consume cuota.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { CliError } from "./config.js";

export interface QuotaSourceRecord {
  calls: number;
  firstCallAt: string | null;
  lastCallAt: string | null;
}

export interface QuotaFile {
  schema: 1;
  sources: Record<string, QuotaSourceRecord>;
}

/** Se alcanzo el tope de la corrida. Aborta: un tope que solo avisa no es un tope. */
export class QuotaExceededError extends CliError {
  constructor(message: string) {
    super(message, 4);
    this.name = "QuotaExceededError";
  }
}

const QUOTA_FILE = "_quota.json";

function emptyFile(): QuotaFile {
  return { schema: 1, sources: {} };
}

export class QuotaBook {
  readonly filePath: string;

  #data: QuotaFile;

  /** Llamadas emitidas en ESTA corrida. Es lo que topea --max-searches. */
  #runCalls = new Map<string, number>();

  /** Ultima consulta que si se emitio, por fuente, para que la corrida siguiente retome. */
  #lastEmitted = new Map<string, string>();

  private constructor(filePath: string, data: QuotaFile) {
    this.filePath = filePath;
    this.#data = data;
  }

  static async open(cacheDir: string): Promise<QuotaBook> {
    const filePath = path.join(cacheDir, QUOTA_FILE);
    let data = emptyFile();

    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<QuotaFile>;
      if (parsed !== null && typeof parsed === "object" && typeof parsed.sources === "object") {
        data = { schema: 1, sources: parsed.sources as Record<string, QuotaSourceRecord> };
      }
    } catch {
      // Libro inexistente o ilegible: se arranca de cero. No es motivo para abortar una corrida.
    }

    return new QuotaBook(filePath, data);
  }

  /** Consumo acumulado entre corridas, leido de disco. */
  total(source: string): number {
    return this.#data.sources[source]?.calls ?? 0;
  }

  /** Llamadas emitidas en esta corrida. */
  runCalls(source: string): number {
    return this.#runCalls.get(source) ?? 0;
  }

  lastEmitted(source: string): string | null {
    return this.#lastEmitted.get(source) ?? null;
  }

  snapshot(): QuotaFile {
    return { schema: 1, sources: { ...this.#data.sources } };
  }

  /**
   * Comprueba que quede margen ANTES de emitir la llamada. Si no queda, lanza y la llamada
   * no llega a salir: ese es el punto de tener un tope.
   */
  ensureCapacity(opts: {
    source: string;
    maxPerRun?: number | undefined;
    pending?: number | undefined;
    label?: string | undefined;
  }): void {
    const { source, maxPerRun } = opts;
    if (maxPerRun === undefined) return;

    const emitidas = this.runCalls(source);
    if (emitidas < maxPerRun) return;

    const pendientes = opts.pending ?? 0;
    const ultima = this.lastEmitted(source);

    throw new QuotaExceededError(
      `Se alcanzo el tope de ${maxPerRun} llamadas de esta corrida sobre ${source}.\n` +
        `  Quedaron ${pendientes} consultas sin procesar.\n` +
        `  Ultima consulta que si se emitio: ${ultima ?? "ninguna"}.\n` +
        `  Consumo acumulado de ${source} entre corridas: ${this.total(source)}.\n` +
        `  Accion: volver a correr con --max-searches mayor para retomar desde ahi, ` +
        `o revisar el consumo con: npm run cli -- cache:stats`,
    );
  }

  /**
   * Registra una llamada que salio a la red y PERSISTE antes de devolver, para que una
   * interrupcion no pierda la cuenta y el presupuesto se subestime.
   */
  async record(source: string, label?: string): Promise<void> {
    const now = new Date().toISOString();
    const current = this.#data.sources[source] ?? { calls: 0, firstCallAt: null, lastCallAt: null };

    this.#data.sources[source] = {
      calls: current.calls + 1,
      firstCallAt: current.firstCallAt ?? now,
      lastCallAt: now,
    };

    this.#runCalls.set(source, this.runCalls(source) + 1);
    if (label !== undefined) this.#lastEmitted.set(source, label);

    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(this.#data, null, 2)}\n`, "utf8");
  }
}
