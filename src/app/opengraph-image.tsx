import { metadata } from "./page";
import { metadataTitle, ogAlt, renderOgCard, size, contentType } from "@/lib/og-card";
import { siteConfig } from "@/lib/site-config";

const title = metadataTitle(metadata, `${siteConfig.name} — ${siteConfig.title}`);

export const alt = ogAlt(title);
export { size, contentType };

export default function Image() {
  return renderOgCard({ eyebrow: "Columna y traumatología", title });
}
