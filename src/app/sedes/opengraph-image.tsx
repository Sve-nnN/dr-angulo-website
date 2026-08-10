import { metadata } from "./page";
import { metadataTitle, ogAlt, renderOgCard, size, contentType } from "@/lib/og-card";

const title = metadataTitle(metadata, "Sedes en Lima");

export const alt = ogAlt(title);
export { size, contentType };

export default function Image() {
  return renderOgCard({ eyebrow: "Sedes en Lima", title });
}
