/**
 * La corrida de captura de SERP de la fase 13, con su techo ACUMULADO.
 *
 * ================================================================================
 * POR QUE ESTE ARCHIVO EXISTE, SI EL SEAM DE CACHE Y EL LIBRO DE CUOTA YA ESTABAN
 * ================================================================================
 *
 * Por una sola razon, y no es evidente leyendo `quota.ts`, asi que queda escrita aca:
 *
 *   `QuotaBook.ensureCapacity` topea `maxPerRun` contra `runCalls`, que es un contador
 *   DE LA CORRIDA. `total()` es el acumulado entre corridas, y `ensureCapacity` no lo mira.
 *
 * Consecuencia directa: `--max-searches 90` invocado dos veces gasta 180. El presupuesto de
 * la fase (D-01) no es "90 por corrida", es "90 en total hasta el 2026-08-21", y la reserva
 * de 24 busquedas solo es real si algo la hace cumplir entre corridas. Ese algo es esto.
 *
 * El calculo, entero:
 *
 *   techoAcumulado  = 102            las 12 que ya estaban en el libro + las 90 de la fase
 *   disponibles     = techo - quota.total("serpapi")
 *   si disponibles <= 0              aborta con codigo 4 SIN EMITIR NADA
 *   maxPerRun       = min(--max-searches, disponibles)
 *
 * O sea: aunque alguien corra el comando cinco veces, el gasto total de la fase no puede
 * pasar de 90. El recorte cae por el extremo de MENOR valor de negocio porque la lista de
 * candidatas llega ordenada por valor descendente y esta corrida respeta ese orden.
 *
 * ================================================================================
 * LO QUE ESTE MODULO NO HACE
 * ================================================================================
 *
 * No reintenta. Una consulta que la fuente devuelve vacia SE CACHEA IGUAL —asi lo decide el
 * seam— y no se vuelve a preguntar nunca: volver a pedirla costaria una busqueda de una cuota
 * que no se repone. Una cabeza cuya SERP vuelve vacia deja de ser cabeza, y eso se REGISTRA
 * en el balance en vez de reintentarse.
 *
 * Tampoco decide QUE capturar. Eso lo decidio la tarea 1 y lo aprobo Juan en la tarea 2; aca
 * la lista se consume tal como llega.
 */

import { QuotaExceededError, type QuotaBook } from "../quota.js";
import { leerSerp, type SerpCompleta } from "./serp.js";
import type { OpcionesSerp } from "./serp.js";
import { SERPAPI_FUENTE } from "../sources/serpapi.js";

/**
 * Techo acumulado por defecto: las 12 que ya estaban en el libro cuando arranco la fase mas
 * las 90 del presupuesto aprobado (D-01). No es el tope del proveedor, es el de la fase.
 */
export const TECHO_ACUMULADO_POR_DEFECTO = 102;

/**
 * Lo que el libro de cuota marcaba al abrirse la fase. Solo se usa para reportar cuanto gasto
 * ESTA fase, que es distinto del acumulado historico de la cuenta.
 */
export const ACUMULADO_AL_ABRIR_LA_FASE = 12;

/** Busquedas que el proveedor tenia disponibles al abrirse la fase, verificado el 2026-08-10. */
export const DISPONIBLES_DEL_PROVEEDOR = 114;

/** Una cabeza de la lista aprobada. Es el subconjunto de `Candidata` que la captura necesita. */
export interface CabezaACapturar {
  readonly keyword: string;
  readonly keywordKey: string;
  /** Verdadero si su SERP ya esta en disco: se resuelve por cache y no consume cuota (D-06). */
  readonly enCache: boolean;
}

export interface OpcionesDePlan {
  /** Acumulado leido del libro, es decir `quota.total("serpapi")`. */
  readonly acumulado: number;
  /** Techo acumulado de la fase. Por defecto 102. */
  readonly techo?: number | undefined;
  /** Tope adicional de la corrida, el valor de `--max-searches`. Nunca puede ampliar el techo. */
  readonly maxSearches?: number | undefined;
}

export interface PlanDeCaptura {
  /** Las que hay que pedirle a la fuente, en el orden de valor de negocio de la lista. */
  readonly aEmitir: readonly CabezaACapturar[];
  /** Las que ya estan capturadas. Se leen igual, gratis, para que el balance sea completo. */
  readonly yaEnCache: readonly CabezaACapturar[];
  readonly techo: number;
  readonly acumulado: number;
  /** Cuanto margen queda bajo el techo acumulado. */
  readonly disponibles: number;
  /** Lo que se le pasa al seam. Es `min(maxSearches, disponibles)`, nunca el valor de la bandera solo. */
  readonly maxPerRun: number;
  /** Cuantas de las que habria que emitir NO caben bajo el techo de esta corrida. */
  readonly sinCupo: number;
}

/**
 * Calcula el plan ANTES de emitir la primera consulta.
 *
 * Aborta con `QuotaExceededError` —codigo de salida 4— si el techo ya esta alcanzado. Abortar
 * aca, y no dentro del bucle, es lo que garantiza que en ese caso no salga ni una consulta.
 */
export function planificarCaptura(
  cabezas: readonly CabezaACapturar[],
  opciones: OpcionesDePlan,
): PlanDeCaptura {
  const techo = opciones.techo ?? TECHO_ACUMULADO_POR_DEFECTO;
  const acumulado = opciones.acumulado;
  const disponibles = techo - acumulado;

  const aEmitir = cabezas.filter((c) => !c.enCache);
  const yaEnCache = cabezas.filter((c) => c.enCache);

  if (disponibles <= 0) {
    throw new QuotaExceededError(
      `El techo acumulado de la fase ya esta alcanzado: NO se emitio ninguna consulta.\n` +
        `  Techo acumulado de la fase: ${techo}\n` +
        `  Consumo acumulado de ${SERPAPI_FUENTE} en el libro: ${acumulado}\n` +
        `  Margen disponible: ${disponibles}\n` +
        `  Cabezas que quedaron sin capturar: ${aEmitir.length}\n` +
        `  Por que aborta en vez de avisar: --max-searches topea POR CORRIDA y no entre\n` +
        `  corridas, asi que sin este techo el presupuesto de 90 de la fase se pasaria en\n` +
        `  silencio con solo volver a correr el comando.\n` +
        `  Accion: la cuota de SerpApi se repone el 2026-08-21. Si hace falta capturar antes,\n` +
        `  subir el techo con --ceiling es una decision de presupuesto y la toma Juan, no el\n` +
        `  comando.`,
    );
  }

  const porBandera = opciones.maxSearches;
  const maxPerRun =
    porBandera === undefined ? disponibles : Math.max(0, Math.min(porBandera, disponibles));

  return {
    aEmitir,
    yaEnCache,
    techo,
    acumulado,
    disponibles,
    maxPerRun,
    sinCupo: Math.max(0, aEmitir.length - maxPerRun),
  };
}

/** Como termino una cabeza dentro de la corrida. */
export type DesenlaceDeCabeza = "capturada" | "acierto" | "vacia" | "sin-cupo";

export interface CabezaResuelta {
  readonly keyword: string;
  readonly keywordKey: string;
  readonly desenlace: DesenlaceDeCabeza;
  /** Cuantos organicos trajo. Cero es lo que convierte una cabeza en `vacia`. */
  readonly organicos: number;
}

export interface BalanceDeCaptura {
  /** Consultas que salieron de verdad a la fuente en ESTA corrida. */
  readonly emitidas: number;
  /** Consultas que resolvio la cache. Cuesta cero. */
  readonly aciertos: number;
  /** Cabezas cuya SERP vino sin un solo organico. No se reintentan: quedan registradas. */
  readonly vacias: readonly string[];
  /** Cabezas que no se llegaron a pedir porque el techo se agoto antes. */
  readonly sinCupo: readonly string[];
  readonly topeAlcanzado: boolean;
  readonly acumuladoAntes: number;
  readonly acumuladoDespues: number;
  readonly techo: number;
  /** Gasto imputable a esta fase: acumulado menos lo que el libro traia al abrirla. */
  readonly gastoDeLaFase: number;
  /** Lo que le queda al proveedor hasta el reset del 2026-08-21. */
  readonly reservaRestante: number;
  readonly detalle: readonly CabezaResuelta[];
}

export interface OpcionesDeCaptura {
  readonly quota: QuotaBook;
  readonly cacheDir?: string | undefined;
  /** Sustituto de la llamada de red. Solo lo usan las pruebas. */
  readonly llamada?: OpcionesSerp["llamada"];
  /** Se invoca por cabeza resuelta, para que el punto de entrada informe mientras avanza. */
  readonly alResolver?: ((cabeza: CabezaResuelta, indice: number, total: number) => void) | undefined;
}

/**
 * Emite las consultas del plan, en orden, hasta que se acaben o hasta que el seam corte.
 *
 * El corte por techo NO tumba la corrida: se registra la cabeza como `sin-cupo` y se sigue,
 * porque las que quedan pueden estar en cache y esas son gratis. Perder un acierto de cache
 * por abortar temprano seria pagar dos veces la misma prudencia.
 */
export async function ejecutarCaptura(
  plan: PlanDeCaptura,
  cabezas: readonly CabezaACapturar[],
  opciones: OpcionesDeCaptura,
): Promise<BalanceDeCaptura> {
  const { quota } = opciones;
  const acumuladoAntes = quota.total(SERPAPI_FUENTE);
  const stats = { hits: 0, misses: 0 };

  const detalle: CabezaResuelta[] = [];
  const vacias: string[] = [];
  const sinCupo: string[] = [];
  let topeAlcanzado = false;
  let emitidas = 0;
  let aciertos = 0;

  for (const [indice, cabeza] of cabezas.entries()) {
    const pendientes = cabezas.length - indice - 1;
    const antesDelPaso = quota.runCalls(SERPAPI_FUENTE);

    let serp: SerpCompleta;
    try {
      serp = await leerSerp(cabeza.keyword, {
        cacheDir: opciones.cacheDir,
        quota,
        maxPerRun: plan.maxPerRun,
        pending: pendientes,
        stats,
        llamada: opciones.llamada,
      });
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        topeAlcanzado = true;
        sinCupo.push(cabeza.keyword);
        const resuelta: CabezaResuelta = { ...cabeza, desenlace: "sin-cupo", organicos: 0 };
        detalle.push(resuelta);
        opciones.alResolver?.(resuelta, indice, cabezas.length);
        continue;
      }
      // Credencial rechazada, red caida o error congelado en disco: se propaga tal cual.
      // La precondicion de la tarea 3 es explicita: ante 401 o 403 hay que detener el plan
      // y avisar, no reintentar.
      throw error;
    }

    const salioALaRed = quota.runCalls(SERPAPI_FUENTE) > antesDelPaso;
    if (salioALaRed) emitidas += 1;
    else aciertos += 1;

    const desenlace: DesenlaceDeCabeza =
      serp.organicos.length === 0 ? "vacia" : salioALaRed ? "capturada" : "acierto";
    if (serp.organicos.length === 0) vacias.push(cabeza.keyword);

    const resuelta: CabezaResuelta = { ...cabeza, desenlace, organicos: serp.organicos.length };
    detalle.push(resuelta);
    opciones.alResolver?.(resuelta, indice, cabezas.length);
  }

  const acumuladoDespues = quota.total(SERPAPI_FUENTE);

  return {
    emitidas,
    aciertos,
    vacias,
    sinCupo,
    topeAlcanzado,
    acumuladoAntes,
    acumuladoDespues,
    techo: plan.techo,
    gastoDeLaFase: acumuladoDespues - ACUMULADO_AL_ABRIR_LA_FASE,
    reservaRestante: DISPONIBLES_DEL_PROVEEDOR - (acumuladoDespues - ACUMULADO_AL_ABRIR_LA_FASE),
    detalle,
  };
}
