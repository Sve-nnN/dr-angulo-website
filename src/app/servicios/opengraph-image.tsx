import { metadata } from "./page";
import { metadataTitle, ogAlt, renderOgCard, size, contentType } from "@/lib/og-card";

const title = metadataTitle(metadata, "Especialidades");

export const alt = ogAlt(title);
export { size, contentType };

export default function Image() {
  return renderOgCard({ eyebrow: "Especialidades", title });
}
