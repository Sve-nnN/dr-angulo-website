export const dynamic = "force-dynamic";

/**
 * Receptor de los reportes de la Content-Security-Policy en modo report-only.
 *
 * El razonamiento completo, el inventario de orígenes y el procedimiento para
 * pasar a enforce están en `docs/content-security-policy.md`.
 *
 * El endpoint es público y sin autenticación, porque el navegador que reporta
 * no puede autenticarse. De ahí los tres cuidados: tope de tamaño del cuerpo,
 * respuesta 204 idéntica en todos los caminos —también ante un JSON inválido,
 * para no darle a nadie una señal de sondeo— y nada persistido en disco. Los
 * reportes salen por `console.warn` con un prefijo estable, que se puede
 * filtrar o silenciar desde los logs sin desplegar.
 */

const LOG_PREFIX = "csp-report";

/** 64 KB. Un reporte real ronda el kilobyte; lo que pase de acá no es un reporte. */
const MAX_BODY_BYTES = 64 * 1024;

const NO_CONTENT = new Response(null, { status: 204 });

type ReportFields = {
  directive?: unknown;
  blocked?: unknown;
  document?: unknown;
};

/**
 * Normaliza los dos formatos que mandan los navegadores a los tres campos que
 * sirven para calibrar la política: qué directiva se violó, qué recurso se
 * bloqueó y en qué documento pasó.
 *
 *  - `application/csp-report`: `{ "csp-report": { "violated-directive": ... } }`
 *  - `application/reports+json`: `[{ "type": "csp-violation", "body": { ... } }]`
 */
function extractReports(payload: unknown): ReportFields[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((entry) => extractReports(entry));
  }

  if (typeof payload !== "object" || payload === null) return [];

  const record = payload as Record<string, unknown>;

  // Mecanismo antiguo.
  const legacy = record["csp-report"];
  if (typeof legacy === "object" && legacy !== null) {
    const body = legacy as Record<string, unknown>;
    return [
      {
        directive: body["effective-directive"] ?? body["violated-directive"],
        blocked: body["blocked-uri"],
        document: body["document-uri"],
      },
    ];
  }

  // Reporting API. Solo interesan los reportes de CSP; el mismo endpoint puede
  // recibir otros tipos si algún día se le apunta más de un grupo.
  const body = record.body;
  if (typeof body === "object" && body !== null) {
    if (record.type !== undefined && record.type !== "csp-violation") return [];
    const fields = body as Record<string, unknown>;
    return [
      {
        directive: fields.effectiveDirective ?? fields.violatedDirective,
        blocked: fields.blockedURL ?? fields.blockedURI,
        document: fields.documentURL ?? fields.documentURI ?? record.url,
      },
    ];
  }

  return [];
}

export async function POST(request: Request) {
  try {
    const declared = Number(request.headers.get("content-length") ?? "");
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return NO_CONTENT;
    }

    const raw = await request.text();

    // El `content-length` puede faltar o mentir: el tope se aplica igual sobre
    // lo que llegó de verdad.
    if (raw.length > MAX_BODY_BYTES) {
      return NO_CONTENT;
    }

    for (const report of extractReports(JSON.parse(raw))) {
      console.warn(LOG_PREFIX, {
        directive: report.directive ?? null,
        blocked: report.blocked ?? null,
        document: report.document ?? null,
      });
    }
  } catch {
    // JSON inválido, cuerpo cortado, cualquier otra cosa: se descarta en
    // silencio. La respuesta no cambia.
  }

  return NO_CONTENT;
}

export async function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
