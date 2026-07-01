import type { CreativeType } from "./types";

// Mirrors the briefable options in the ClickUp "Type of Project" custom field
// (list 901707171501, field da5ec3b4-92fa-4fdc-983c-434bf1eea8f6).
// Only DM (blue) and D&CP (green) options are included — these are the ones
// that get a brief. B&S, WD, and Admin options are intentionally excluded.

export const CREATIVE_TYPES: CreativeType[] = [
  // --- D&CP — Design & Creative Production (green) ---
  { id: "1750f268-0511-42d8-bb57-7731a08ff2dd", name: "D&CP Key Visual", short: "Key Visual", group: "D&CP", archetype: "key-visual" },

  { id: "c2aa403d-ef10-4bfe-9340-dc56f773f896", name: "D&CP Print/Digital Flyer", short: "Flyer", group: "D&CP", archetype: "collateral" },
  { id: "56479d2e-feb4-40d9-8699-cdc5d45bbd7a", name: "D&CP Print/Digital Poster", short: "Poster", group: "D&CP", archetype: "collateral" },
  { id: "8247fb06-9c1e-4250-a4de-2fe14fb8eb61", name: "D&CP Print/Digital Program/Insert", short: "Program / Insert", group: "D&CP", archetype: "collateral" },
  { id: "9106a5a0-aa20-4231-85df-82d7dbad52b7", name: "D&CP Print/Digital Rack Card", short: "Rack Card", group: "D&CP", archetype: "collateral" },
  { id: "7c70b65a-e1c2-41aa-b38a-8f31dff43053", name: "D&CP Print/Digital Postcard", short: "Postcard", group: "D&CP", archetype: "collateral" },
  { id: "484665a8-1d28-49bf-ac57-b2cd1d793318", name: "D&CP Print Notecard", short: "Notecard", group: "D&CP", archetype: "collateral" },
  { id: "cf3452a8-dc1e-4e45-a34a-ef101d221973", name: "D&CP Print Invitation", short: "Invitation", group: "D&CP", archetype: "collateral" },
  { id: "f2c7a9d8-5239-437f-a8f6-08dadd4dbff0", name: "D&CP Print/Digital Playbill/Booklet", short: "Playbill / Booklet", group: "D&CP", archetype: "collateral" },
  { id: "27371264-250f-4d2f-8c92-257db1bf5096", name: "D&CP Print/Digital Brochure/Catalog", short: "Brochure / Catalog", group: "D&CP", archetype: "collateral" },
  { id: "c86a8bc4-d5d1-4518-b503-1bb868b7599d", name: "D&CP Print/Digital Business Card", short: "Business Card", group: "D&CP", archetype: "collateral" },

  { id: "e25c733d-473a-46b5-8275-fb60596ea9f2", name: "D&CP Digital Ad", short: "Digital Ad", group: "D&CP", archetype: "ad" },
  { id: "4480c9ef-aad7-41af-9acb-b955fb662254", name: "D&CP Print Ad", short: "Print Ad", group: "D&CP", archetype: "ad" },
{ id: "d2a4995b-a563-4592-9021-71fb1a483d1c", name: "D&CP TV Commercial", short: "TV Commercial", group: "D&CP", archetype: "ad" },

  { id: "3234abb3-5535-4b10-a3b0-f29d776eb7e0", name: "D&CP Social Media Carousel", short: "Social Carousel", group: "D&CP", archetype: "social" },
  { id: "51c6beb6-8447-4b10-8d89-e16ad3cf1a03", name: "D&CP Social Media Reel", short: "Social Reel", group: "D&CP", archetype: "social" },
  { id: "31def0f5-dbb7-4882-94f9-7a0555326831", name: "D&CP Social Media Story", short: "Social Story", group: "D&CP", archetype: "social" },
  { id: "6f38fbdd-bf73-4dd4-bfb1-c092759c855a", name: "D&CP Social Media Text/Image Post", short: "Social Post", group: "D&CP", archetype: "social" },

  // --- DM — Digital Marketing (blue) ---
  { id: "bcc45c05-56e7-4950-b0cc-b0c1a48b5a5b", name: "DM Social Media Influencer campaign", short: "Influencer Campaign", group: "DM", archetype: "strategy" },
  { id: "00f85baa-f136-4ee4-91fa-ad3898907c30", name: "DM Digital Campaign Strategy", short: "Digital Campaign Strategy", group: "DM", archetype: "strategy" },
  { id: "d1796326-24ad-4d01-8960-ab4cb43dd014", name: "DM Email Mkting E-blast", short: "E-blast", group: "DM", archetype: "strategy" },
  { id: "c3b43e9f-6a6b-44de-ab11-a73aff9e0c83", name: "DM Email Mkting E-vite", short: "E-vite", group: "DM", archetype: "strategy" },
];

export const ARCHETYPE_LABELS: Record<string, string> = {
  "key-visual": "Key Visual",
  collateral: "Collateral & Print",
  ad: "Advertising",
  social: "Social Content",
  strategy: "Strategy & Digital Marketing",
};

export function getCreativeType(id: string): CreativeType | undefined {
  return CREATIVE_TYPES.find((t) => t.id === id);
}

/** Archetypes openable in the wizard. All run through the section-config engine
 *  (lib/sections.ts), which filters steps/fields per type. Key Visual is the most
 *  polished; the others open with type-appropriate sections and refine over time. */
export const LIVE_ARCHETYPES = new Set([
  "key-visual",
  "collateral",
  "ad",
  "social",
  "strategy",
]);
