import { metadata } from "./page";
import { metadataTitle, ogAlt, renderOgCard, size, contentType } from "@/lib/og-card";

const title = metadataTitle(metadata, "Agendar cita");

export const alt = ogAlt(title);
export { size, contentType };

export default function Image() {
  return renderOgCard({ eyebrow: "Agendar cita", title });
}
