// Core domain types for Brief Builder.

export type Archetype =
  | "key-visual"
  | "collateral"
  | "ad"
  | "social"
  | "strategy"
  | "webpage";

export type ServiceGroup = "D&CP" | "DM" | "WD";

/** One option in the ClickUp "Type of Project" field that gets a brief. */
export interface CreativeType {
  id: string; // ClickUp option id
  name: string; // exact ClickUp label
  short: string; // friendly label shown in the picker
  group: ServiceGroup;
  archetype: Archetype;
}

export interface Campaign {
  id: string;
  name: string;
  audience: string; // pre-fills the Audience step when selected
}

export interface ClientProfile {
  id: string;
  name: string;
  /** Brand rules surfaced as alignment context throughout the wizard. */
  brand: {
    colors: { label: string; hex?: string; note?: string }[];
    typography: string;
    voice: string;
    notes?: string[]; // do/don't reminders
    /** Fonts + accent used to style the generated .docx for this client. */
    fonts?: { heading: string; body: string };
  };
  /** Default audience suggestions when no campaign is attached. */
  defaultAudience: string;
  campaigns: Campaign[];
  /** Target Shared Drive folder convention (used in Phase 2 auto-save). */
  driveFolderHint?: string;
}

/** An optional save-variant of a size (e.g. "-nologo", "-dates", "-purple"). */
export interface SizeVariant {
  id: string; // e.g. "nologo"
  suffix: string; // appended to the file name, e.g. "-nologo"
  label: string; // shown in the picker, e.g. "No logo"
}

export interface SizeOption {
  id: string;
  label: string; // e.g. "Instagram Story — 1080x1920"
  dimensions: string; // "1080x1920"
  category: string; // grouping in the dropdown
  note?: string; // production note shown beside the size
  saveName?: string; // file-name stem for the brief, e.g. "Original-1080x1350"
  variants?: SizeVariant[]; // optional save-variants the user can tick per size
}

/** A single sourced image/asset row in the KV style guide. */
export interface SourceAsset {
  file: string;
  link: string; // link to the asset (Drive, stock, etc.)
  edits: string;
}

/** One slide (carousel) or frame (reel) in a social content piece. */
export interface SlideUnit {
  title: string; // e.g. "Slide 2 — Ultra-Clear Glass"
  visual: string; // what we see
  onImageText: string; // text that appears on the slide/frame
  proof: string; // micro-proof / supporting line
  purpose: string; // storytelling purpose of this slide
}

/** One row of the content-ownership map (Webpage): what we state vs. what we
 *  summarize-and-link to the authoritative source (venue, partner, vendor). */
export interface OwnershipRow {
  weOwn: string; // we own and state this directly
  theyOwn: string; // owned elsewhere — we summarize + link
}

/** One content module / page section in the Webpage build spec. */
export interface PageModule {
  name: string; // module number + name
  purpose: string; // one sentence
  audience: string; // primary audience for this module
  contentElements: string; // bulleted list of what appears
  owner: string; // owner of truth — us, partner, split
  interactionPattern: string; // static, accordion, tabbed, table…
  copyNotes: string; // tone, length, brand rules
  dataStatus: string; // confirmed or placeholder
}

/** One user flow (Webpage): input → process → output, with a success metric. */
export interface UserFlow {
  input: string;
  process: string;
  output: string;
  metric: string;
}

/** Everything captured for a brief. Optional fields appear per archetype. */
export interface BriefData {
  // Step 1 — identity
  clientId: string;
  creativeTypeId: string;

  // Step 2 — project basics
  projectName: string;
  hasEvent: boolean;
  eventDate?: string;
  venue?: string;
  reviewMeeting?: string;
  campaignId?: string;
  secondaryCampaignId?: string;

  // Step 3/4 — narrative
  objective: string;
  audience: string;
  secondaryAudience?: string;

  // Step 5 — concept (KV)
  concept?: string;

  // Step 6 — style guide
  palette?: string;
  typography?: string;
  sourceAssets?: SourceAsset[];
  moodboardLink?: string; // conditional

  // Step 7 — mood / content / notes
  mood?: string; // newline or comma separated
  inImageContent?: string;
  designerNotes?: string;

  // Step 8 — specs
  sizeIds: string[];
  sizeVariants?: Record<string, string[]>; // sizeId -> selected variant ids
  duration?: string; // time-based deliverables (radio/TV/video) — e.g. ":30" or "60 sec"
  saveLocation?: string; // Drive folder link to auto-save into
  saveAs?: string; // base file name the designer should save deliverables as
  docName?: string; // custom name for the generated .docx (without extension)

  // ── Social Content shape (carousel / reel / story / post) ──
  contentDirection?: string; // series theme + positioning
  contentFeel?: string; // tone descriptors (Architectural, Premium, Calm…)
  storyFlow?: string; // the mandatory narrative flow across slides
  slides?: SlideUnit[]; // per-slide / per-frame builder
  hook?: string; // scroll-stopping opening line
  caption?: string;
  hashtags?: string;
  cta?: string;
  postingDate?: string;
  platform?: string; // Instagram, LinkedIn, Facebook…

  // ── Strategy & Digital Marketing shape ──
  strategicInsight?: string; // the "why now", what it competes against
  channels?: string; // channel mix + role of each
  pillars?: string; // messaging / content pillars / themes
  cadence?: string; // frequency, timeline, milestones
  kpis?: string; // targets + what we track
  budget?: string; // optional allocation

  // ── Advertising (TV Commercial) ──
  keyMessages?: string;
  smp?: string;
  toneDirection?: string;

  // ── Webpage ──
  scopeIncluded?: string; // in scope — what's built now, in numbers
  scopeExcluded?: string; // out of scope / future phases, with why
  governingPrinciple?: string; // the one idea the ownership split rests on
  ownershipMap?: OwnershipRow[]; // we-state vs. we-summarize-and-link, per topic
  placementNotes?: string; // URL, nav placement, entry points, page type
  pageModules?: PageModule[]; // the module-by-module build spec
  userFlows?: UserFlow[]; // input → process → output, per persona
  ownershipIntake?: string; // who owns build/maintenance, intake requests, review cadence

  status: string;
}
