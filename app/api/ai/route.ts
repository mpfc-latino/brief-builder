import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type DraftSection =
  | "objective"
  | "concept"
  | "notes"
  | "direction"
  | "insight"
  | "mood"
  | "scope"
  | "principle"
  | "placement"
  | "maintenance"
  | "metaDescriptions"
  | "searchObjective"
  | "singleMindedMessage";

interface DraftRequest {
  action: "draft";
  section: DraftSection;
  brief: Record<string, unknown>;
  clientName: string;
  creativeTypeName: string;
  brandContext: string; // pre-formatted brand rules
  notes: string; // the user's raw bullet answers for this section
}

const SECTION_GUIDE: Record<DraftSection, string> = {
  objective:
    "Write the OBJECTIVE section: 1–2 short paragraphs stating what this piece is for, where it will run, and how it must align with the brand while standing apart from sibling pieces. Concrete and directive.",
  concept:
    "Write the KEY VISUAL CONCEPT: one evocative paragraph describing the core visual idea — what we see, the mood, and why it fits. Cinematic and specific, never generic.",
  notes:
    "Write the NOTES FOR DESIGNER: tight, actionable guidance. Return each directive on its own line starting with • (e.g. '• Emphasize warmth over drama.'). One directive per line, no paragraph prose. Focus on what will make or break execution.",
  direction:
    "Write the CONTENT DIRECTION for a social content series: 1–2 short paragraphs setting the theme and how it positions the brand. State what the series IS and what it is NOT. Specific and editorial, never generic luxury filler.",
  insight:
    "Write the STRATEGIC INSIGHT: 1–2 tight paragraphs on why this approach, what it competes against, and what past performance implies. Lead with the insight, not throat-clearing. Concrete and directive.",
  mood:
    "Write the MOOD: 3–5 short bullet-point sentences describing the feeling the piece should evoke — tone, style elements, and brand elements to reinforce. Return each on its own line starting with • (e.g. '• Tone: Premium, confident, and inviting — let the photography and typography do the selling.'). One full sentence per line, not single words.",
  scope:
    "Write the SCOPE: state what's in scope for this build in concrete numbers (pages, sections, items covered), then what's explicitly out of scope for this phase and why, then one line noting what's planned for a future phase if relevant. Short paragraphs or tight bullet lines — never vague.",
  principle:
    "Write the GOVERNING PRINCIPLE: one or two sentences stating the single idea the page's content-ownership split rests on (what we state directly vs. what we summarize and link to its authoritative source), then one line of rationale for why copying that detail in creates a maintenance risk we'd own. Direct, no throat-clearing.",
  placement:
    "Write the PLACEMENT & NAVIGATION section: where this page lives (URL), where it sits in primary navigation and any secondary entry points, the page type (single page vs. hub, anchored sections, accordion, etc.), and one line of rationale for that structure. Concrete and buildable, not aspirational.",
  maintenance:
    "Write the OWNERSHIP, INTAKE & MAINTENANCE section: who owns build vs. who owns it after handover, what structured information still needs to come from the client before this can be built (name each request and what it should contain), and the review cadence that keeps the content from going stale. Concrete and actionable.",
  metaDescriptions:
    "Write 3 Meta-style post descriptions (longer than a 90-character ad description — full post copy). Each follows: emotional hook, what the event/piece is, why it's special, artist/repertoire/venue detail, date + location, then a CTA line. Use tasteful emojis sparingly (🎶🎭🥂💕📍🗓️🎟️) only if the tone supports it — never force them. Return the 3 versions separated by a blank line, each its own short paragraph followed by the date/location and CTA on their own lines. Do not imply an artist will perform a specific piece heard only in archival footage unless confirmed in the notes.",
  searchObjective:
    "Write the GOOGLE SEARCH OBJECTIVE: 1–2 sentences on driving ticket sales/conversions from high-intent searches, naming the event-specific, venue-specific, or local searches this campaign should capture. Specific to this event, not generic.",
  singleMindedMessage:
    "Write the SINGLE-MINDED MESSAGE: one simple, complete sentence that defines exactly what the search campaign should communicate — the one thing a searcher needs to know. No fluff, no subordinate clauses stacked on top of each other.",
};

const SYSTEM_PROMPT =
  "You are a senior creative strategist at Latinovation, a marketing agency. " +
  "You write crisp, on-brand sections of a creative brief that a designer or copywriter will execute from. " +
  "Match the client's brand voice exactly. Be concrete and directive. " +
  "Stay consistent with the rest of the brief provided. " +
  "Never use em dashes. Do not invent facts not implied by the inputs. " +
  "Return only the section prose — no headings, no preamble.";

function buildUserMessage(body: DraftRequest): string {
  // The rest of the brief filled so far — keeps the draft coherent + on-brief.
  const briefSoFar = Object.entries(body.brief || {})
    .filter(([, v]) => typeof v === "string" && v.trim().length > 0)
    .map(([k, v]) => `- ${k}: ${(v as string).trim()}`)
    .join("\n");

  return [
    `CLIENT: ${body.clientName}`,
    `CREATIVE TYPE: ${body.creativeTypeName}`,
    ``,
    `BRAND CONTEXT:`,
    body.brandContext,
    ``,
    ...(briefSoFar ? [`THE BRIEF SO FAR (stay consistent with this):`, briefSoFar, ``] : []),
    `TASK: ${SECTION_GUIDE[body.section]}`,
    ``,
    `THE TEAM MEMBER'S NOTES / ANSWERS FOR THIS SECTION:`,
    body.notes || "(none provided — draft a strong starting point from the brand context, brief, and creative type)",
  ].join("\n");
}

function fallbackDraft(req: DraftRequest): string {
  // Used when no AI provider key is configured (or a provider call fails).
  const bullets = req.notes
    .split(/\n|•|;/)
    .map((s) => s.trim())
    .filter(Boolean);
  const lead =
    req.section === "objective"
      ? `To create a ${req.creativeTypeName} for ${req.clientName} that`
      : req.section === "concept"
        ? `The visual concept centers on`
        : req.section === "direction"
          ? `This content series positions ${req.clientName} as`
          : req.section === "insight"
            ? `The strategic insight:`
            : req.section === "mood"
              ? ``
              : req.section === "scope"
                ? `In scope for this phase:`
                : req.section === "principle"
                  ? `The governing principle:`
                  : req.section === "placement"
                    ? `This page lives at:`
                    : req.section === "maintenance"
                      ? `Ownership and next inputs needed:`
                      : req.section === "metaDescriptions"
                        ? `Description draft:`
                        : req.section === "searchObjective"
                          ? `Drive ticket sales from high-intent searches for`
                          : req.section === "singleMindedMessage"
                            ? `The single-minded message:`
                            : `For the team:`;
  const listSections =
    req.section === "notes" ||
    req.section === "direction" ||
    req.section === "insight" ||
    req.section === "mood" ||
    req.section === "scope" ||
    req.section === "maintenance";
  const body = bullets.length
    ? bullets.join(listSections ? "\n• " : ", ")
    : "(add your notes and regenerate)";
  return `${lead} ${body}.\n\n[Draft assembled from your notes. Add a Gemini or Anthropic API key to enable full AI writing.]`;
}

// ── Providers ───────────────────────────────────────────────────────────────
async function draftWithGemini(userMsg: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  // Models are overloaded (503/UNAVAILABLE) during demand spikes. Retry the same
  // model a couple times with short backoff, then fall back to lighter models that
  // are usually less congested. The first one to answer wins.
  const models = [
    process.env.GEMINI_MODEL || "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
  ];
  let lastErr: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const resp = await ai.models.generateContent({
          model,
          contents: userMsg,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
            maxOutputTokens: 1024,
            // 2.5 models "think" by default, which eats the output budget and truncates
            // the draft. We don't need reasoning for short brief sections — disable it.
            thinkingConfig: { thinkingBudget: 0 },
          },
        });
        const text = (resp.text ?? "").trim();
        if (text) return text;
        lastErr = new Error("Empty response from model");
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        // Only retry transient overload; for anything else, move to the next model.
        if (!/503|UNAVAILABLE|overload|high demand/i.test(msg)) break;
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Gemini request failed");
}

async function draftWithAnthropic(userMsg: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const resp = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userMsg }],
  });
  return resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("\n")
    .trim();
}

export async function POST(request: NextRequest) {
  let body: DraftRequest;
  try {
    body = (await request.json()) as DraftRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Provider preference: Gemini (free tier) → Anthropic → notes-assembly fallback.
  const provider = process.env.GEMINI_API_KEY ? "gemini" : process.env.ANTHROPIC_API_KEY ? "anthropic" : null;
  if (!provider) {
    return NextResponse.json({ text: fallbackDraft(body), source: "fallback" });
  }

  try {
    const userMsg = buildUserMessage(body);
    const text = provider === "gemini" ? await draftWithGemini(userMsg) : await draftWithAnthropic(userMsg);
    if (!text) throw new Error("Empty response from model");
    return NextResponse.json({ text, source: "ai", provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    // Degrade gracefully so the wizard never blocks.
    return NextResponse.json({ text: fallbackDraft(body), source: "fallback", warning: message });
  }
}
