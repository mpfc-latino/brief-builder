import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type DraftSection = "objective" | "concept" | "notes" | "direction" | "insight" | "mood";

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
    "Write the MOOD: a short, comma-separated list of 5–8 evocative single words or two-word phrases that capture the feeling of the piece (e.g. Romantic, Warm, Golden, Timeless). No sentences, no explanation — just the descriptors.",
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
              : `For the team:`;
  const listSections = req.section === "notes" || req.section === "direction" || req.section === "insight";
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
    "gemini-1.5-flash",
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
