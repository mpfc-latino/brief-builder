import type { CreativeType } from "./types";

export type SectionId =
  | "basics"
  | "objective"
  | "audience"
  | "concept"
  | "style"
  | "details"
  | "specs"
  | "keyMessages"
  | "smp"
  | "toneDirection"
  | "direction"
  | "slides"
  | "distribution"
  | "insight"
  | "channelsMessaging"
  | "cadenceKpis"
  | "notes"
  | "review";

export interface WizardStep {
  id: SectionId;
  label: string;
}

export interface WizardConfig {
  steps: WizardStep[];

  // Concept panel (visual)
  conceptLabel: string;
  conceptHint: string;

  // Style panel sub-fields (visual)
  palette: boolean;
  typography: boolean;
  sourceAssets: boolean;
  moodboard: boolean;

  // Details panel (visual)
  mood: boolean;
  moodLabel: string;
  inImageContent: boolean;
  inImageContentLabel: string;
  designerNotes: boolean;
  designerNotesLabel: string;

  // Specs panel
  sizes: boolean;
  duration: boolean;

  // Key Messages panel
  keyMessagesLabel: string;
  keyMessagesHint: string;

  // Social
  slideUnit: string;
  showSlideExtras: boolean;
  maxSlides?: number;

  // Strategy
  budget: boolean;
  notesLabel: string;
}

const SPINE: WizardStep[] = [
  { id: "basics", label: "Project basics" },
  { id: "objective", label: "Objective" },
  { id: "audience", label: "Audience" },
];

const REVIEW: WizardStep = { id: "review", label: "Review & export" };

const BASE: Omit<WizardConfig, "steps"> = {
  conceptLabel: "Creative concept",
  conceptHint: "The core idea — what we see and the mood.",
  palette: false,
  typography: false,
  sourceAssets: false,
  moodboard: false,
  mood: false,
  moodLabel: "Mood",
  inImageContent: false,
  inImageContentLabel: "Content (in image)",
  designerNotes: false,
  designerNotesLabel: "Notes for designer",
  sizes: false,
  duration: false,
  keyMessagesLabel: "Key messages",
  keyMessagesHint: "The headlines and key messages this piece must communicate.",
  slideUnit: "Slide",
  showSlideExtras: true,
  budget: false,
  notesLabel: "Notes",
};

// ClickUp type IDs
const BUSINESS_CARD = "c86a8bc4-d5d1-4518-b503-1bb868b7599d";
const TV            = "d2a4995b-a563-4592-9021-71fb1a483d1c";
const DIGITAL_AD    = "e25c733d-473a-46b5-8275-fb60596ea9f2";
const PRINT_AD      = "4480c9ef-aad7-41af-9acb-b955fb662254";
const REEL          = "51c6beb6-8447-4b10-8d89-e16ad3cf1a03";
const STORY         = "31def0f5-dbb7-4882-94f9-7a0555326831";
const POST          = "6f38fbdd-bf73-4dd4-bfb1-c092759c855a";
const EBLAST        = "d1796326-24ad-4d01-8960-ab4cb43dd014";
const EVITE         = "c3b43e9f-6a6b-44de-ab11-a73aff9e0c83";
const INFLUENCER    = "bcc45c05-56e7-4950-b0cc-b0c1a48b5a5b";

export function getWizardConfig(ct: CreativeType): WizardConfig {
  switch (ct.archetype) {
    // ── Key Visual ────────────────────────────────────────────────────────────
    case "key-visual":
      return {
        ...BASE,
        steps: [
          ...SPINE,
          { id: "concept", label: "Key visual concept" },
          { id: "style", label: "Style guide" },
          { id: "details", label: "Mood, content & notes" },
          { id: "specs", label: "Sizes & location" },
          REVIEW,
        ],
        conceptLabel: "Key visual concept",
        conceptHint:
          "The core visual idea — what we see and the mood. AI writes the final paragraph from your notes.",
        palette: true,
        typography: true,
        sourceAssets: true,
        moodboard: true,
        mood: true,
        inImageContent: true,
        designerNotes: true,
        sizes: true,
      };

    // ── Collateral ────────────────────────────────────────────────────────────
    case "collateral":
      if (ct.id === BUSINESS_CARD)
        return {
          ...BASE,
          steps: [
            ...SPINE,
            { id: "style", label: "Style guide" },
            { id: "specs", label: "Specs & location" },
            REVIEW,
          ],
          sourceAssets: true,
          designerNotes: true,
        };

      return {
        ...BASE,
        steps: [
          ...SPINE,
          { id: "style", label: "Style guide" },
          { id: "details", label: "Content & notes" },
          { id: "specs", label: "Sizes & location" },
          REVIEW,
        ],
        palette: true,
        typography: true,
        sourceAssets: true,
        mood: true,
        inImageContent: true,
        designerNotes: true,
        sizes: true,
      };

    // ── Advertising ───────────────────────────────────────────────────────────
    case "ad":
      if (ct.id === TV)
        return {
          ...BASE,
          steps: [
            ...SPINE,
            { id: "smp", label: "Single-Minded Proposition" },
            { id: "keyMessages", label: "Key benefits & RTBs" },
            { id: "toneDirection", label: "Tone & direction" },
            { id: "concept", label: "Creative concept" },
            { id: "specs", label: "Specs & location" },
            REVIEW,
          ],
          conceptLabel: "Creative concept / treatment",
          conceptHint:
            "The core idea, visual approach, and emotional arc. Describe the full treatment.",
          keyMessagesLabel: "Key benefits & RTBs",
          keyMessagesHint:
            "What this commercial must communicate: key benefits and reasons to believe.",
          duration: true,
        };

      // Digital Ad & Print Ad
      return {
        ...BASE,
        steps: [
          ...SPINE,
          { id: "keyMessages", label: "Key messages" },
          { id: "style", label: "Style guide" },
          { id: "details", label: "Content & notes" },
          { id: "specs", label: "Sizes & location" },
          REVIEW,
        ],
        keyMessagesLabel: "Key messages",
        keyMessagesHint:
          "The headline(s) and key messages. For brand/product ads: main headline + proof points. For event ads: event listing details per variant.",
        sourceAssets: true,
        inImageContent: true,
        designerNotes: true,
        sizes: true,
      };

    // ── Social Content ────────────────────────────────────────────────────────
    case "social":
      if (ct.id === REEL)
        return {
          ...BASE,
          steps: [
            { id: "basics", label: "Project basics" },
            { id: "objective", label: "Objective" },
            { id: "direction", label: "Creative direction" },
            { id: "slides", label: "Scenes" },
            { id: "specs", label: "Specs & location" },
            REVIEW,
          ],
          slideUnit: "Frame",
          showSlideExtras: false,
          duration: true,
        };

      if (ct.id === POST)
        return {
          ...BASE,
          steps: [
            { id: "basics", label: "Project basics" },
            { id: "objective", label: "Objective" },
            { id: "slides", label: "Post content" },
            { id: "details", label: "Design notes" },
            { id: "specs", label: "Sizes & location" },
            REVIEW,
          ],
          designerNotes: true,
          designerNotesLabel: "Design notes",
          sizes: true,
          maxSlides: 1,
        };

      if (ct.id === STORY)
        return {
          ...BASE,
          steps: [
            { id: "basics", label: "Project basics" },
            { id: "objective", label: "Objective" },
            { id: "slides", label: "Frames" },
            { id: "details", label: "Design notes" },
            { id: "specs", label: "Specs & location" },
            REVIEW,
          ],
          designerNotes: true,
          designerNotesLabel: "Design notes (incl. layout option)",
        };

      // Carousel
      return {
        ...BASE,
        steps: [
          { id: "basics", label: "Project basics" },
          { id: "objective", label: "Objective" },
          { id: "slides", label: "Slides" },
          { id: "details", label: "Design notes" },
          { id: "specs", label: "Sizes & location" },
          REVIEW,
        ],
        designerNotes: true,
        designerNotesLabel: "Design notes (incl. layout option)",
        sizes: true,
      };

    // ── Strategy & Digital Marketing ──────────────────────────────────────────
    case "strategy":
      if (ct.id === EBLAST)
        return {
          ...BASE,
          steps: [
            ...SPINE,
            { id: "keyMessages", label: "Key messages" },
            { id: "concept", label: "Visual direction" },
            { id: "style", label: "Style guide" },
            { id: "details", label: "Email content & checklist" },
            { id: "specs", label: "Specs & location" },
            REVIEW,
          ],
          conceptLabel: "Visual direction",
          conceptHint:
            "The creative approach — proof-led system type, tone, and visual hierarchy for this email.",
          keyMessagesLabel: "Key messages",
          keyMessagesHint:
            "The headline and key messages this email must communicate. Include CTA copy.",
          sourceAssets: true,
          inImageContent: true,
          inImageContentLabel: "Email sections",
          designerNotes: true,
          designerNotesLabel: "Designer checklist",
        };

      if (ct.id === EVITE)
        return {
          ...BASE,
          steps: [
            { id: "basics", label: "Project basics" },
            { id: "concept", label: "Event program" },
            { id: "details", label: "Invitation content" },
            { id: "specs", label: "Specs & location" },
            REVIEW,
          ],
          conceptLabel: "Event program",
          conceptHint:
            "Event name, description, schedule, and all program details. Include all time blocks and what happens at each.",
          inImageContent: true,
          inImageContentLabel: "Invitation copy",
          designerNotes: true,
          designerNotesLabel: "RSVP & sponsors",
        };

      if (ct.id === INFLUENCER)
        return {
          ...BASE,
          steps: [
            ...SPINE,
            { id: "concept", label: "Activation concept" },
            { id: "channelsMessaging", label: "Influencer selection" },
            { id: "notes", label: "Logistics & outcomes" },
            REVIEW,
          ],
          conceptLabel: "Activation concept",
          conceptHint:
            "The campaign concept — what we're sending, the emotional story, box contents, packaging, and core message.",
          notesLabel: "Logistics & expected outcomes",
        };

      // Digital Campaign Strategy (and any other remaining strategy types)
      return {
        ...BASE,
        steps: [
          ...SPINE,
          { id: "insight", label: "Strategic insight" },
          { id: "channelsMessaging", label: "Channels & messaging" },
          { id: "cadenceKpis", label: "Cadence & KPIs" },
          { id: "notes", label: "Notes" },
          REVIEW,
        ],
        budget: true,
        notesLabel: "Notes",
      };
  }
}

export function wizardConfigHasStep(cfg: WizardConfig, id: SectionId): boolean {
  return cfg.steps.some((s) => s.id === id);
}
