/**
 * Cliente autenticado de Google Sheets.
 *
 * Un unico scope, el de escritura sobre hojas de calculo. El .readonly no sirve porque
 * INFRA-01 necesita escribir, y pedir scope sobre Drive o sobre la plataforma completa
 * seria elevacion de privilegio innecesaria: el documento se comparte individualmente.
 */

import { auth as googleAuth, sheets as sheetsApi, type sheets_v4 } from "@googleapis/sheets";

import { loadSheetsConfig, type SheetsConfig } from "../config.js";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"] as const;

export interface SheetsSession {
  readonly sheets: sheets_v4.Sheets;
  readonly config: SheetsConfig;
}

export async function getSheetsSession(): Promise<SheetsSession> {
  const config = loadSheetsConfig();

  const gAuth = new googleAuth.GoogleAuth({
    keyFile: config.serviceAccountFile,
    scopes: [...SCOPES],
  });

  const authClient = await gAuth.getClient();
  const sheets = sheetsApi({ version: "v4", auth: authClient as never });

  return { sheets, config };
}

/** Cita un nombre de tab para notacion A1: obligatorio si lleva espacios, y la comilla se duplica. */
export function quoteTab(title: string): string {
  return `'${title.replace(/'/g, "''")}'`;
}

/** Convierte un indice de columna base 1 en su letra de notacion A1: 1 -> A, 26 -> Z, 27 -> AA. */
export function columnLetter(index: number): string {
  let n = index;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

interface GoogleApiErrorShape {
  code?: number;
  message?: string;
  status?: string;
  details?: unknown;
}

function extractApiError(error: unknown): GoogleApiErrorShape | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const response = (error as { response?: { data?: { error?: unknown } } }).response;
  const inner = response?.data?.error;
  if (typeof inner === "object" && inner !== null) return inner as GoogleApiErrorShape;

  const code = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;
  if (typeof code === "number" || typeof message === "string") {
    return {
      code: typeof code === "number" ? code : undefined,
      message: typeof message === "string" ? message : undefined,
    };
  }
  return undefined;
}

/**
 * Traduce un error de la API a un mensaje que manda a depurar el lado correcto.
 *
 * Los dos modos de fallo de 403 se parecen muchisimo y llevan a lugares opuestos:
 * "no compartiste el documento" contra "no habilitaste la API en el proyecto de GCP".
 * Confundirlos cuesta una tarde.
 */
export function describeSheetsError(error: unknown, spreadsheetId: string): string {
  const api = extractApiError(error);
  const code = api?.code;
  const message = api?.message ?? String(error);
  const haystack = `${message} ${JSON.stringify(api?.details ?? "")}`.toLowerCase();

  if (code === 403 && (haystack.includes("service_disabled") || haystack.includes("has not been used in project"))) {
    return (
      "La API de Google Sheets no esta habilitada en el proyecto de GCP de la service account (HTTP 403, SERVICE_DISABLED).\n" +
      "  Esto NO es un problema de permisos sobre el documento.\n" +
      "  Accion: Google Cloud Console, APIs y servicios, Biblioteca, habilitar Google Sheets API.\n" +
      `  Detalle de la API: ${message}`
    );
  }

  if (code === 403) {
    return (
      "La service account no tiene permiso sobre el documento (HTTP 403, PERMISSION_DENIED).\n" +
      "  Esto NO es un problema de habilitacion de la API.\n" +
      `  Accion: abrir el Sheet ${spreadsheetId} en Drive y compartirlo con la service account con rol Editor.\n` +
      `  Detalle de la API: ${message}`
    );
  }

  if (code === 404) {
    return (
      `El documento ${spreadsheetId} no existe o la service account no puede verlo (HTTP 404).\n` +
      "  Accion: verificar el valor de SEO_SHEET_ID contra la URL del documento.\n" +
      `  Detalle de la API: ${message}`
    );
  }

  if (code === 400) {
    return (
      `La API rechazo la peticion (HTTP 400).\n` +
      "  Causa habitual: se pidio un tab por un nombre que no existe. Ojo con los nombres de\n" +
      "  banner: el texto que se ve en la fila 1 no es el nombre del tab.\n" +
      `  Detalle de la API: ${message}`
    );
  }

  return `La API de Google Sheets devolvio un error${code === undefined ? "" : ` (HTTP ${code})`}.\n  Detalle: ${message}`;
}
