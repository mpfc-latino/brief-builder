import type { Archetype, CreativeType, SizeOption, SizeVariant } from "./types";

// Master catalog of deliverable sizes. Resolved per brief in this precedence:
//   1. TYPE_SIZES[creativeType.id]              — type-specific (e.g. Flyer ≠ Poster)
//   2. CLIENT_ARCHETYPE_SIZES[client][archetype]— client-specific (e.g. GO Key Visual)
//   3. ARCHETYPE_SIZES[archetype]               — Latinovation-standard for the archetype
//   4. DEFAULT_SIZES                            — generic fallback
//
// Sources: GO event KV briefs (client KV sets) + "Latinovation Services.xlsx"
// (Asset Size Guide / Printed Deliverables / Social Media Standards) for the
// agency-standard sets. Each size can carry optional, individually-ticked
// save-variants and a `saveName` stem for exact file naming in the brief.

// ── Reusable save-variants (used by the GO Key Visual set) ──────────────────
const V: Record<string, SizeVariant> = {
  nologo: { id: "nologo", suffix: "-nologo", label: "No logo" },
  dates: { id: "dates", suffix: "-dates", label: "With dates" },
  backgroundonly: { id: "backgroundonly", suffix: "-backgroundonly", label: "Background only" },
  imageonly: { id: "imageonly", suffix: "-imageonly", label: "Image only (no texts)" },
  info: { id: "info", suffix: "-info", label: "Info version" },
  nologoBlue: { id: "nologo-blue", suffix: "-nologo-blue", label: "No logo · Blue" },
  nologoGreen: { id: "nologo-green", suffix: "-nologo-green", label: "No logo · Green" },
  nologoPurple: { id: "nologo-purple", suffix: "-nologo-purple", label: "No logo · Purple" },
};

// ── Gulfshore Opera — Key Visual ────────────────────────────────────────────
const GO_KEY_VISUAL_SIZES: SizeOption[] = [
  { id: "go-kv-original-1080x1350", label: "Original — 1080×1350", dimensions: "1080x1350", category: "Social & Primary", saveName: "Original-1080x1350", note: "Approval starts here", variants: [V.nologo, V.dates, V.backgroundonly, V.imageonly] },
  { id: "go-kv-story-1080x1920", label: "Social Media Story — 1080×1920", dimensions: "1080x1920", category: "Social & Primary", saveName: "Social Media Story-1080x1920", variants: [V.nologo, V.dates, V.backgroundonly, V.imageonly] },
  { id: "go-kv-banner-600x200", label: "Banner — 600×200", dimensions: "600x200", category: "Web & Digital", saveName: "Banner-600x200", variants: [V.nologo] },
  { id: "go-kv-homepage-1920x900", label: "Website Homepage — 1920×900", dimensions: "1920x900", category: "Web & Digital", saveName: "Website Homepage-1920x900", variants: [V.dates, V.nologo, V.imageonly] },
  { id: "go-kv-homepage-mobile-2560x2371", label: "Website Homepage, mobile — 2560×2371", dimensions: "2560x2371", category: "Web & Digital", saveName: "Website Homepage-2560x2371 mobile", variants: [V.dates] },
  { id: "go-kv-squared-500x500", label: "Website Squared — 500×500", dimensions: "500x500", category: "Web & Digital", saveName: "Website Squared-500x500", variants: [V.nologo, V.nologoBlue, V.nologoGreen, V.nologoPurple] },
  { id: "go-kv-ovation-420x315", label: "Ovation — 420×315", dimensions: "420x315", category: "Web & Digital", saveName: "Ovation-420x315", note: "Ovation digital placement" },
  { id: "go-kv-lee-337x225", label: "Lee — 337×225", dimensions: "337x225", category: "Print & Publication", saveName: "Lee-337x225" },
  { id: "go-kv-lee-845x475", label: "Lee — 845×475", dimensions: "845x475", category: "Print & Publication", saveName: "Lee-845x475", variants: [V.info] },
  { id: "go-kv-lee-1200x225", label: "Lee — 1200×225", dimensions: "1200x225", category: "Print & Publication", saveName: "Lee-1200x225" },
];

// ── MY Shower Door — Key Visual (PROVISIONAL — confirm vs a real MSD KV brief) ─
const MSD_KEY_VISUAL_SIZES: SizeOption[] = [
  { id: "msd-kv-original-1080x1350", label: "Original — 1080×1350", dimensions: "1080x1350", category: "Social & Primary", saveName: "Original-1080x1350", note: "Approval starts here", variants: [V.nologo, V.imageonly] },
  { id: "msd-kv-story-1080x1920", label: "Story — 1080×1920", dimensions: "1080x1920", category: "Social & Primary", saveName: "Story-1080x1920", variants: [V.nologo, V.imageonly] },
  { id: "msd-kv-square-1080x1080", label: "Square — 1080×1080", dimensions: "1080x1080", category: "Social & Primary", saveName: "Square-1080x1080", variants: [V.nologo, V.imageonly] },
  { id: "msd-kv-banner-600x200", label: "Web Banner — 600×200", dimensions: "600x200", category: "Web & Digital", saveName: "Banner-600x200", variants: [V.nologo] },
  { id: "msd-kv-homepage-1920x900", label: "Website Homepage — 1920×900", dimensions: "1920x900", category: "Web & Digital", saveName: "Website Homepage-1920x900", variants: [V.nologo] },
  { id: "msd-kv-squared-500x500", label: "Website Squared — 500×500", dimensions: "500x500", category: "Web & Digital", saveName: "Website Squared-500x500", variants: [V.nologo] },
];

// ── Collateral & Print — Latinovation standard, per creative type ────────────
// Source: Latinovation Services.xlsx → Asset Size Guide + Printed Deliverables.
// Print = PDF · 300 dpi · CMYK unless noted. Keyed by ClickUp creative-type id.
const PRINT = "PDF · 300 dpi · CMYK";

const TYPE_SIZES: Record<string, SizeOption[]> = {
  // Flyer / Handout
  "c2aa403d-ef10-4bfe-9340-dc56f773f896": [
    { id: "flyer-letter", label: "Letter — 8.5×11\"", dimensions: "8.5x11in", category: "Flyer", note: `Standard promo · ${PRINT}` },
    { id: "flyer-halfpage", label: "Half-page — 8.5×5.5\"", dimensions: "8.5x5.5in", category: "Flyer", note: "Newsletter inserts & handouts" },
    { id: "flyer-5x8v", label: "5×8\" (vertical)", dimensions: "5x8in", category: "Flyer", note: "Smaller promo" },
    { id: "flyer-8x5h", label: "8×5\" (horizontal)", dimensions: "8x5in", category: "Flyer", note: "Horizontal format" },
    { id: "flyer-4x6", label: "4×6\"", dimensions: "4x6in", category: "Flyer", note: "Handbills" },
  ],
  // Poster / Banner
  "56479d2e-feb4-40d9-8699-cdc5d45bbd7a": [
    { id: "poster-18x24", label: "Poster — 18×24\"", dimensions: "18x24in", category: "Poster", note: `Standard poster · ${PRINT}` },
    { id: "poster-24x36", label: "Poster — 24×36\"", dimensions: "24x36in", category: "Poster", note: "Large-format" },
    { id: "banner-rollup-33x80", label: "Roll-up banner — 33×80\"", dimensions: "33x80in", category: "Large Format", note: "Roll-up / retractable" },
    { id: "banner-48x72", label: "Banner — 48×72\"", dimensions: "48x72in", category: "Large Format", note: "Trade-show backdrop · consider readability distance" },
  ],
  // Program / Insert
  "8247fb06-9c1e-4250-a4de-2fe14fb8eb61": [
    { id: "program-5.5x8.5", label: "Program insert — 5.5×8.5\"", dimensions: "5.5x8.5in", category: "Program / Insert", note: `Standard insert · ${PRINT}` },
    { id: "program-8.5x11", label: "Full-page insert — 8.5×11\"", dimensions: "8.5x11in", category: "Program / Insert", note: "Larger / full-page" },
  ],
  // Rack Card
  "9106a5a0-aa20-4231-85df-82d7dbad52b7": [
    { id: "rack-3.5x8.5", label: "Rack card — 3.5×8.5\"", dimensions: "3.5x8.5in", category: "Rack Card", note: `Narrow · ${PRINT}` },
    { id: "rack-4x9", label: "Rack card — 4×9\"", dimensions: "4x9in", category: "Rack Card", note: "Standard" },
    { id: "rack-5x7", label: "Rack card — 5×7\"", dimensions: "5x7in", category: "Rack Card", note: "Compact promo" },
  ],
  // Postcard
  "7c70b65a-e1c2-41aa-b38a-8f31dff43053": [
    { id: "postcard-4x6", label: "Postcard — 4×6\"", dimensions: "4x6in", category: "Postcard", note: `Standard · double-sided · ${PRINT}` },
    { id: "postcard-5x7", label: "Postcard — 5×7\"", dimensions: "5x7in", category: "Postcard", note: "Premium / announcement" },
    { id: "postcard-6x9", label: "Postcard — 6×9\" mailer", dimensions: "6x9in", category: "Postcard", note: "Large mailer · Trim 9×6, Bleed 9.25×6.25, Safe 8.5×5.5" },
  ],
  // Note Card / Thank-you
  "484665a8-1d28-49bf-ac57-b2cd1d793318": [
    { id: "notecard-a6", label: "Note card — A6 folded 5.85×4.125\"", dimensions: "5.85x4.125in", category: "Note Card", note: `Stationery / correspondence · ${PRINT}` },
    { id: "notecard-a7", label: "Note card — 5×7\" folded (A7)", dimensions: "5x7in", category: "Note Card", note: "Option for envelope design" },
  ],
  // Invitation / Event Invite Suite
  "cf3452a8-dc1e-4e45-a34a-ef101d221973": [
    { id: "invite-closed", label: "Invite, closed — 8.75×5.75\"", dimensions: "8.75x5.75in", category: "Invite Suite", note: PRINT },
    { id: "invite-flat", label: "Invite, flat / open — 11.5×8.75\"", dimensions: "11.5x8.75in", category: "Invite Suite", note: PRINT },
    { id: "invite-insert", label: "Insert — 8.75×5.75\"", dimensions: "8.75x5.75in", category: "Invite Suite" },
    { id: "invite-env-a10", label: "Outer envelope (A10) — 9.5×6\"", dimensions: "9.5x6in", category: "Invite Suite" },
    { id: "invite-rsvp", label: "RSVP card — 5.625×4.25\"", dimensions: "5.625x4.25in", category: "Invite Suite" },
    { id: "invite-rsvp-env-a2", label: "RSVP envelope (A2) — 5.75×4.375\"", dimensions: "5.75x4.375in", category: "Invite Suite" },
  ],
  // Presentation / Deck
  "891e66f1-4f0c-4ee6-b97a-04f348071230": [
    { id: "deck-1920x1080", label: "Slides — 1920×1080 px (16:9)", dimensions: "1920x1080", category: "Presentation", note: "PPTX · Keynote · PDF" },
  ],
  // Playbill / Booklet
  "f2c7a9d8-5239-437f-a8f6-08dadd4dbff0": [
    { id: "playbill-5.5x8.5", label: "Booklet — 5.5×8.5\"", dimensions: "5.5x8.5in", category: "Booklet", note: `Saddle-stitched · ${PRINT}` },
  ],
  // Brochure / Catalog
  "27371264-250f-4d2f-8c92-257db1bf5096": [
    { id: "brochure-a4", label: "Printed — A4 (210×297 mm)", dimensions: "210x297mm", category: "Print", note: `Folded or bound · ${PRINT}` },
    { id: "brochure-trifold", label: "Printed — Tri-fold Letter 8.5×11\"", dimensions: "8.5x11in", category: "Print", note: PRINT },
    { id: "brochure-digital-1920x1080", label: "Digital / interactive — 1920×1080 px", dimensions: "1920x1080", category: "Digital", note: "Scroll-based / downloadable · Interactive PDF or Web" },
  ],
  // Business Card
  "c86a8bc4-d5d1-4518-b503-1bb868b7599d": [
    { id: "bizcard-3.5x2", label: "Business card — 3.5×2\" (88.9×50.8 mm)", dimensions: "3.5x2in", category: "Business Card", note: `${PRINT} · include 3 mm bleed + safe area` },
  ],

  // ── Advertising ──────────────────────────────────────────────────────────
  // Digital Ad — source: Products Guide → Digital Ad (Display) + standard IAB banners.
  "e25c733d-473a-46b5-8275-fb60596ea9f2": [
    { id: "ad-square-1080x1080", label: "Square — 1080×1080", dimensions: "1080x1080", category: "Social Placements", note: "Meta / feed · JPG · PNG · 300 dpi" },
    { id: "ad-portrait-1080x1350", label: "Portrait — 1080×1350", dimensions: "1080x1350", category: "Social Placements" },
    { id: "ad-landscape-1920x1080", label: "Landscape — 1920×1080", dimensions: "1920x1080", category: "Social Placements" },
    { id: "ad-leaderboard-728x90", label: "Leaderboard — 728×90", dimensions: "728x90", category: "Display Network", note: "IAB standard" },
    { id: "ad-medrect-300x250", label: "Medium Rectangle — 300×250", dimensions: "300x250", category: "Display Network", note: "IAB standard" },
    { id: "ad-halfpage-300x600", label: "Half Page — 300×600", dimensions: "300x600", category: "Display Network", note: "IAB standard" },
    { id: "ad-skyscraper-160x600", label: "Wide Skyscraper — 160×600", dimensions: "160x600", category: "Display Network", note: "IAB standard" },
    { id: "ad-mobile-320x50", label: "Mobile Leaderboard — 320×50", dimensions: "320x50", category: "Display Network", note: "IAB standard" },
  ],
  // Print Ad — publication-dependent; standard fractions (confirm trim/bleed with the publication),
  // plus real specs for publications we've confirmed.
  "4480c9ef-aad7-41af-9acb-b955fb662254": [
    { id: "printad-full", label: "Full page — 8.5×11\"", dimensions: "8.5x11in", category: "Print Ad", note: `${PRINT} · confirm trim/bleed with publication` },
    { id: "printad-half-h", label: "Half page, horizontal — 8.5×5.5\"", dimensions: "8.5x5.5in", category: "Print Ad", note: "Confirm with publication" },
    { id: "printad-half-v", label: "Half page, vertical — 4.25×11\"", dimensions: "4.25x11in", category: "Print Ad", note: "Confirm with publication" },
    { id: "printad-quarter", label: "Quarter page — 4.25×5.5\"", dimensions: "4.25x5.5in", category: "Print Ad", note: "Confirm with publication" },
    { id: "printad-4.75x3.75", label: "4.75×3.75\"", dimensions: "4.75x3.75in", category: "Print Ad", note: "Confirm with publication" },
    {
      id: "printad-floridahome-full",
      label: "Full Page — 8×10.75\" trim",
      dimensions: "8x10.75in",
      category: "Print Ad",
      note: `${PRINT} · Bleed 8.25×11" · Trim 8×10.75" · Live area 7.5×10.25"`,
    },
    {
      id: "printad-floridahome-spread",
      label: "2-Page Spread (Double Truck) — 16×10.75\" trim",
      dimensions: "16x10.75in",
      category: "Print Ad",
      note: `${PRINT} · Bleed 16.25×11" · Trim 16×10.75" · Live area 15.5×10.25"`,
    },
  ],

  // ── Social Content ───────────────────────────────────────────────────────
  // Carousel
  "3234abb3-5535-4b10-a3b0-f29d776eb7e0": [
    { id: "carousel-ig-square-1080x1080", label: "Instagram / Facebook — Square 1080×1080", dimensions: "1080x1080", category: "Carousel", note: "PNG · PSD" },
    { id: "carousel-ig-portrait-1080x1350", label: "Instagram / Facebook — Portrait 1080×1350", dimensions: "1080x1350", category: "Carousel" },
    { id: "carousel-linkedin-1080x1080", label: "LinkedIn — 1080×1080", dimensions: "1080x1080", category: "Carousel" },
  ],
  // Reel
  "51c6beb6-8447-4b10-8d89-e16ad3cf1a03": [
    { id: "reel-1080x1920", label: "Vertical — 1080×1920 (9:16)", dimensions: "1080x1920", category: "Reel", note: "MP4 · 1080p · 30 fps" },
  ],
  // Story
  "31def0f5-dbb7-4882-94f9-7a0555326831": [
    { id: "story-1080x1920", label: "Story — 1080×1920 (9:16)", dimensions: "1080x1920", category: "Story", note: "PNG · JPG · MP4" },
  ],
  // Text / Image Post
  "6f38fbdd-bf73-4dd4-bfb1-c092759c855a": [
    { id: "post-square-1080x1080", label: "Square — 1080×1080", dimensions: "1080x1080", category: "Feed Post", note: "Instagram / LinkedIn / Facebook" },
    { id: "post-portrait-1080x1350", label: "Portrait — 1080×1350", dimensions: "1080x1350", category: "Feed Post" },
    { id: "post-landscape-1200x630", label: "Landscape — 1200×630", dimensions: "1200x630", category: "Feed Post", note: "Facebook / link share" },
  ],

  // ── Video & Motion ───────────────────────────────────────────────────────
  // Video
  "e721cafc-ed54-4fd8-b1af-fb92e8e573c8": [
    { id: "video-landscape-1920x1080", label: "Landscape — 1920×1080 (16:9)", dimensions: "1920x1080", category: "Video", note: "MP4 · H.264 · 30 fps" },
    { id: "video-vertical-1080x1920", label: "Vertical — 1080×1920 (9:16)", dimensions: "1080x1920", category: "Video" },
    { id: "video-square-1080x1080", label: "Square — 1080×1080 (1:1)", dimensions: "1080x1080", category: "Video" },
    { id: "video-4k-3840x2160", label: "4K UHD — 3840×2160", dimensions: "3840x2160", category: "Video", note: "High-end / commercial" },
    { id: "video-thumb-1280x720", label: "Thumbnail / cover — 1280×720", dimensions: "1280x720", category: "Cover", note: "YouTube / Vimeo · JPG · PNG" },
  ],

  // ── Email (under Strategy archetype, but design deliverables) ─────────────
  // E-blast
  "d1796326-24ad-4d01-8960-ab4cb43dd014": [
    { id: "eblast-600x800", label: "Email — 600×800 (max width 600)", dimensions: "600x800", category: "Email", note: "JPG · PNG · HTML (Mailchimp compatible)" },
    { id: "eblast-header-600x300", label: "Email header — 600×300", dimensions: "600x300", category: "Email" },
  ],
  // E-vite
  "c3b43e9f-6a6b-44de-ab11-a73aff9e0c83": [
    { id: "evite-600x800", label: "E-vite — 600×800 (max width 600)", dimensions: "600x800", category: "Email", note: "JPG · PNG · HTML" },
    { id: "evite-mobile-1080x1920", label: "Mobile / story — 1080×1920", dimensions: "1080x1920", category: "Email", note: "Shareable version" },
  ],
};

// Client + archetype catalogs (e.g. Key Visual, which differs per client).
const CLIENT_ARCHETYPE_SIZES: Record<string, Partial<Record<Archetype, SizeOption[]>>> = {
  "gulfshore-opera": { "key-visual": GO_KEY_VISUAL_SIZES },
  "my-shower-door": { "key-visual": MSD_KEY_VISUAL_SIZES },
};

// Latinovation-standard per archetype (used when no type/client set applies).
const ARCHETYPE_SIZES: Partial<Record<Archetype, SizeOption[]>> = {};

// ── Fallback (not-yet-curated combos) ───────────────────────────────────────
export const DEFAULT_SIZES: SizeOption[] = [
  { id: "ig-portrait", label: "Instagram Portrait — 1080x1350", dimensions: "1080x1350", category: "Social" },
  { id: "ig-square", label: "Instagram Square — 1080x1080", dimensions: "1080x1080", category: "Social" },
  { id: "ig-story", label: "Instagram / FB Story — 1080x1920", dimensions: "1080x1920", category: "Social" },
  { id: "fb-feed", label: "Facebook Feed — 1200x630", dimensions: "1200x630", category: "Social" },
  { id: "reel-cover", label: "Reel / TikTok — 1080x1920", dimensions: "1080x1920", category: "Social" },
  { id: "web-square", label: "Website Squared — 500x500", dimensions: "500x500", category: "Web & Digital" },
  { id: "web-banner", label: "Web Banner — 600x200", dimensions: "600x200", category: "Web & Digital" },
  { id: "leaderboard", label: "Leaderboard Ad — 728x90", dimensions: "728x90", category: "Web & Digital" },
  { id: "med-rectangle", label: "Medium Rectangle Ad — 300x250", dimensions: "300x250", category: "Web & Digital" },
  { id: "eblast-header", label: "E-blast Header — 600x300", dimensions: "600x300", category: "Web & Digital" },
];

/** Sizes to offer for a client + creative type — most specific match wins. */
export function getSizesFor(clientId: string, ct: CreativeType): SizeOption[] {
  return (
    TYPE_SIZES[ct.id] ??
    CLIENT_ARCHETYPE_SIZES[clientId]?.[ct.archetype] ??
    ARCHETYPE_SIZES[ct.archetype] ??
    DEFAULT_SIZES
  );
}

/** Ordered, de-duplicated category labels for a set of sizes. */
export function categoriesOf(sizes: SizeOption[]): string[] {
  return Array.from(new Set(sizes.map((s) => s.category)));
}

// Flat lookup across every catalog (used by the .docx generator).
const ALL_SIZES: SizeOption[] = [
  ...Object.values(TYPE_SIZES).flat(),
  ...Object.values(CLIENT_ARCHETYPE_SIZES).flatMap((byArch) => Object.values(byArch).flat()),
  ...Object.values(ARCHETYPE_SIZES).flat(),
  ...DEFAULT_SIZES,
];

export function getSize(id: string): SizeOption | undefined {
  return ALL_SIZES.find((s) => s.id === id);
}

/** The exact files to produce for a chosen size, given the variants the user ticked. */
export function filesForSize(size: SizeOption, selectedVariantIds: string[], projectPrefix?: string): string[] {
  const stem = size.saveName ?? size.label;
  const prefix = projectPrefix ? `${projectPrefix} ` : "";
  const files = [`${prefix}${stem}`];
  for (const v of size.variants ?? []) {
    if (selectedVariantIds.includes(v.id)) files.push(`${prefix}${stem}${v.suffix}`);
  }
  return files;
}
