import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Respaldo de origen para la canonicalizacion de host.
//
// La redireccion primaria de www hacia el apex vive en una Redirect Rule de
// Cloudflare (D-02), que responde en el borde y nunca llega hasta aca. Este
// archivo existe como defensa en profundidad (D-04): si alguien apaga el proxy
// de Cloudflare, mueve el DNS o el sitio pasa a servirse directo desde el
// origen, el 301 se sigue emitiendo desde la aplicacion.
//
// El apex se deriva del propio host entrante, no de siteConfig ni de
// NEXT_PUBLIC_SITE_URL: asi el archivo no necesita configuracion y funciona
// igual en cualquier entorno. La documentacion de Next.js 16 tambien
// desaconseja depender de modulos compartidos dentro de proxy.

const WWW_PREFIX = "www.";

export function proxy(request: NextRequest) {
  // La cabecera Host cruda es la fuente confiable detras de Cloudflare y
  // Traefik; request.nextUrl.host puede venir ya normalizado por el runtime.
  const rawHost = request.headers.get("host");

  if (!rawHost) {
    return NextResponse.next();
  }

  // Minusculas y sin sufijo de puerto.
  const host = rawHost.toLowerCase().split(":")[0];

  if (!host.startsWith(WWW_PREFIX)) {
    return NextResponse.next();
  }

  const apexHost = host.slice(WWW_PREFIX.length);
  const destination = `https://${apexHost}${request.nextUrl.pathname}${request.nextUrl.search}`;

  // El estado va explicito: NextResponse.redirect sin estado devuelve 307 y
  // eso no cumple DOM-02 (D-01).
  return NextResponse.redirect(destination, 301);
}

export const config = {
  // Se excluyen unicamente los assets estaticos y las imagenes optimizadas.
  // Las rutas de API, robots.txt y sitemap.xml quedan DENTRO a proposito: una
  // peticion a esas rutas por www tambien tiene que canonicalizar.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
