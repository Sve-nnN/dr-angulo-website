<?xml version="1.0" encoding="UTF-8"?>
<!--
  Hoja de estilo del sitemap.

  La referencia a este archivo la emite `src/app/sitemap.xml/route.ts` con una
  instrucción `<?xml-stylesheet ?>`. El navegador la aplica y muestra la tabla
  de abajo; Google y el resto de rastreadores leen el XML tal cual y no la
  procesan. Impacto en SEO: ninguno.

  Paleta y tipografía salen de `src/app/globals.css`. Regla COLOR-01 vigente:
  el texto de marca por debajo de 24px usa el teal oscuro (#0a6265) y no el
  teal base (#0e7c7e), para no quedarse corto de contraste.

  Ojo al editar: un comentario XML no admite dos guiones seguidos, así que acá
  los nombres de las variables CSS se escriben sin sus guiones iniciales.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, follow" />
        <title>Mapa del sitio | Dr. Juan Angulo</title>
        <link rel="icon" href="/icon.png" />
        <style>
          /* Autoalojadas en `public/fonts/`, no traídas de Google: el sitio no
             hace peticiones a terceros y esta página tampoco debe hacerlas.
             `next/font` no sirve acá porque emite rutas con hash por build. */
          @font-face {
            font-family: "Poppins";
            src: url("/fonts/Poppins-Bold.woff") format("woff");
            font-weight: 700;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: "Inter";
            src: url("/fonts/Inter-Regular.woff") format("woff");
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          :root {
            --background: #fafaf9;
            --foreground: #1f2937;
            --primary: #0e7c7e;
            --primary-dark: #0a6265;
            --accent: #e8971f;
            --accent-strong: #9a5c00;
            --muted: #ecfafa;
            --border: #d7efef;
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            padding: 0 1rem 4rem;
            background: var(--background);
            color: var(--foreground);
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }

          .wrap { max-width: 62rem; margin: 0 auto; }

          header { padding: 2.5rem 0 1.75rem; border-bottom: 4px solid var(--accent); }

          /* El archivo del logo incluye el wordmark debajo del monograma, así
             que se dimensiona por ancho: limitarlo por alto deja "DR. JUAN
             ANGULO TOTESAUT" ilegible. */
          .logo { display: block; width: 13rem; height: auto; margin-bottom: 1.5rem; }

          h1 {
            margin: 0;
            font-family: Poppins, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            font-size: 2rem;
            font-weight: 700;
            line-height: 1.2;
            color: var(--primary-dark);
          }

          .lead { margin: 0.75rem 0 0; max-width: 46rem; color: #4b5563; }

          .count {
            display: inline-block;
            margin-top: 1.25rem;
            padding: 0.35rem 0.85rem;
            border-radius: 999px;
            background: var(--muted);
            border: 1px solid var(--border);
            font-family: Poppins, ui-sans-serif, system-ui, sans-serif;
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--primary-dark);
          }

          .table-scroll { overflow-x: auto; margin-top: 2rem; }

          table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }

          caption {
            caption-side: top;
            text-align: left;
            padding-bottom: 0.75rem;
            font-size: 0.875rem;
            color: #4b5563;
          }

          th, td { padding: 0.75rem 1rem; text-align: left; vertical-align: top; }

          thead th {
            background: var(--primary-dark);
            color: #ffffff;
            font-family: Poppins, ui-sans-serif, system-ui, sans-serif;
            font-weight: 700;
            font-size: 0.8125rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            white-space: nowrap;
          }

          thead th:first-child { border-radius: 8px 0 0 0; }
          thead th:last-child { border-radius: 0 8px 0 0; }

          tbody tr { border-bottom: 1px solid var(--border); }
          tbody tr:nth-child(even) { background: #ffffff; }

          td.url { word-break: break-word; }

          .num { color: #6b7280; font-variant-numeric: tabular-nums; white-space: nowrap; }

          .meta { color: #4b5563; white-space: nowrap; }

          a { color: var(--primary-dark); text-decoration: underline; text-underline-offset: 2px; }
          a:hover { color: var(--accent-strong); }

          a:focus-visible, :focus-visible {
            outline: 3px solid var(--primary);
            outline-offset: 2px;
            border-radius: 4px;
          }

          footer {
            margin-top: 2.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border);
            font-size: 0.875rem;
            color: #4b5563;
          }

          @media (max-width: 40rem) {
            h1 { font-size: 1.5rem; }
            th, td { padding: 0.6rem 0.65rem; }
            table { font-size: 0.875rem; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header>
            <img class="logo" src="/logo-dr-angulo.png" alt="Dr. Juan Carlos Angulo Totesaut, cirujano de columna" />
            <h1>Mapa del sitio</h1>
            <p class="lead">
              Esta es la lista de páginas que el sitio le propone a los buscadores.
              El archivo es XML: los rastreadores lo leen tal cual y esta tabla existe
              solo para que una persona pueda revisarlo sin leer el código.
            </p>
            <p class="count">
              <xsl:value-of select="count(s:urlset/s:url)" /> páginas
            </p>
          </header>

          <div class="table-scroll">
            <table>
              <caption>Páginas declaradas en el sitemap, en el orden en que se publican.</caption>
              <thead>
                <tr>
                  <th scope="col">N.º</th>
                  <th scope="col">Dirección</th>
                  <th scope="col">Última modificación</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td class="num"><xsl:value-of select="position()" /></td>
                    <td class="url">
                      <a href="{s:loc}"><xsl:value-of select="s:loc" /></a>
                    </td>
                    <td class="meta">
                      <xsl:choose>
                        <xsl:when test="s:lastmod"><xsl:value-of select="s:lastmod" /></xsl:when>
                        <xsl:otherwise>sin dato</xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <footer>
            <p>
              Generado por el sitio del <a href="/">Dr. Juan Carlos Angulo Totesaut</a>,
              traumatólogo y cirujano de columna en Lima.
            </p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
