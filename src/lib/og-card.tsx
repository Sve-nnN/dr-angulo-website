/* eslint-disable @next/next/no-img-element --
   `next/image` no existe dentro de `ImageResponse`: el árbol lo renderiza
   Satori, que solo entiende un subconjunto de HTML y CSS y espera un `img`
   plano con `src`, `width` y `height`. La regla apunta al LCP de una página,
   y esto no es una página: es un PNG que se genera en el build. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { credentialsInfo } from "@/content/cv";

/**
 * Plantilla única de las imágenes de Open Graph.
 *
 * Antes las 14 rutas compartían `/og-dr-angulo.jpg`, y las de servicio y blog
 * ni siquiera declaraban imagen: al fijar su propio objeto `openGraph` sin
 * `images`, reemplazaban el del layout en vez de heredarlo, así que
 * compartirlas en WhatsApp no mostraba nada. Cada segmento tiene ahora su
 * `opengraph-image.tsx`, que llama a `renderOgCard` con el título de su propia
 * metadata.
 *
 * Por qué dinámicas y no 21 JPG a mano: el título sale de la misma fuente que
 * usa `generateMetadata`, así que cuando Juan reescriba los titles las imágenes
 * se regeneran solas en el build siguiente, sin tocar nada acá.
 *
 * `ImageResponse` (Satori) solo admite flexbox y un subconjunto de CSS. Todo
 * `div` con más de un hijo lleva `display: flex` explícito; sin eso Satori
 * lanza en tiempo de build.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PUBLIC_DIR = join(process.cwd(), "public");

/**
 * Los assets se leen una vez por proceso: el build genera 21 imágenes y no
 * tiene sentido volver a leer los mismos cuatro archivos en cada una.
 */
const assets = {
  photo: null as Promise<string> | null,
  logo: null as Promise<string> | null,
  poppins: null as Promise<Buffer> | null,
  inter: null as Promise<Buffer> | null,
};

async function dataUri(relativePath: string, mime: string) {
  const bytes = await readFile(join(PUBLIC_DIR, relativePath));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function loadAssets() {
  assets.photo ??= dataUri("og-dr-angulo.jpg", "image/jpeg");
  assets.logo ??= dataUri("logo-icon-square.png", "image/png");
  assets.poppins ??= readFile(join(PUBLIC_DIR, "fonts", "Poppins-Bold.woff"));
  assets.inter ??= readFile(join(PUBLIC_DIR, "fonts", "Inter-Regular.woff"));

  return Promise.all([assets.photo, assets.logo, assets.poppins, assets.inter]);
}

/**
 * El título tal cual lo declara la metadata de la ruta.
 *
 * Acepta las tres formas del campo `title` de Next.js (cadena, `absolute` y
 * `default`) para que un cambio de forma en una página no rompa el build de su
 * imagen. `fallback` cubre el caso de que la página deje de declarar título.
 */
export function metadataTitle(metadata: Metadata, fallback: string): string {
  const title = metadata.title;

  if (typeof title === "string") return title;
  if (title && typeof title === "object") {
    if ("absolute" in title && typeof title.absolute === "string") return title.absolute;
    if ("default" in title && typeof title.default === "string") return title.default;
  }

  return fallback;
}

/**
 * Texto alternativo, con el mismo formato en todas las rutas.
 *
 * Describe la tarjeta y nombra la marca una sola vez: repetir el nombre del
 * doctor cuando el propio título ya lo contiene, como pasa en la portada,
 * produce un alt redundante para quien lo escucha con lector de pantalla.
 */
export function ogAlt(title: string) {
  return `Tarjeta del sitio de ${siteConfig.shortName}: ${title}`;
}

/**
 * Escalón tipográfico según el largo del título. Los titles del sitio van de 20
 * a 85 caracteres y con un solo tamaño los largos se desbordaban de la tarjeta.
 */
function titleFontSize(title: string) {
  if (title.length <= 34) return 64;
  if (title.length <= 52) return 56;
  if (title.length <= 72) return 48;
  return 42;
}

export type OgCardInput = {
  /** Rótulo corto de sección. No es un title: no lo toca la pasada de Juan. */
  eyebrow: string;
  title: string;
};

export async function renderOgCard({ eyebrow, title }: OgCardInput) {
  const [photo, logo, poppins, inter] = await loadAssets();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0a6265",
          fontFamily: "Inter",
        }}
      >
        {/* Foto real del doctor: el sitio no usa stock y la tarjeta tampoco. */}
        <img
          src={photo}
          width={size.width}
          height={size.height}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        {/* Velo teal: deja legible el texto de la izquierda y el rostro a la
            derecha. Satori no soporta filtros, así que el degradado hace todo. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            display: "flex",
            backgroundImage:
              "linear-gradient(90deg, rgba(10,98,101,0.97) 0%, rgba(10,98,101,0.95) 46%, rgba(10,98,101,0.62) 70%, rgba(10,98,101,0.18) 100%)",
          }}
        />

        {/* Franja dorada inferior, el mismo remate de marca de la hoja del
            sitemap. Se posiciona por `top` calculado y no por `bottom`: Satori
            no resuelve `bottom` en un contenedor de alto fijo y la franja
            quedaba fuera del lienzo. */}
        <div
          style={{
            position: "absolute",
            top: size.height - 12,
            left: 0,
            width: size.width,
            height: 12,
            display: "flex",
            backgroundColor: "#e8971f",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 760,
            height: "100%",
            padding: "64px 56px 72px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                width: 92,
                height: 92,
                borderRadius: 20,
                backgroundColor: "#ffffff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src={logo} width={70} height={70} alt="" />
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 34,
                fontFamily: "Poppins",
                fontSize: 22,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#f5b64a",
              }}
            >
              {eyebrow}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontFamily: "Poppins",
                fontSize: titleFontSize(title),
                lineHeight: 1.15,
                color: "#ffffff",
              }}
            >
              {title}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", width: 96, height: 6, backgroundColor: "#e8971f" }} />
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 26,
                color: "#ffffff",
              }}
            >
              {siteConfig.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 8,
                fontSize: 22,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {`CMP ${credentialsInfo.cmp} · RNE ${credentialsInfo.rne} · drangulocolumna.com`}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: poppins, style: "normal", weight: 700 },
        { name: "Inter", data: inter, style: "normal", weight: 400 },
      ],
    }
  );
}
