import type { ClientProfile } from "./types";

/** Compact brand-rules string passed to the AI and shown in the sidebar. */
export function brandContextString(client: ClientProfile): string {
  const colors = client.brand.colors
    .map((c) => `${c.label}${c.hex ? ` (${c.hex})` : ""}${c.note ? ` — ${c.note}` : ""}`)
    .join("; ");
  const lines = [
    `Brand voice: ${client.brand.voice}`,
    `Colors: ${colors}`,
    `Typography: ${client.brand.typography}`,
  ];
  if (client.brand.notes?.length) lines.push(`Watch-outs: ${client.brand.notes.join(" ")}`);
  return lines.join("\n");
}
