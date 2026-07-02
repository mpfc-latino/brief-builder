"use client";

import React, { useMemo, useState } from "react";
import type { BriefData, ClientProfile, CreativeType, SourceAsset, SlideUnit } from "@/lib/types";
import { brandContextString } from "@/lib/format";
import { getSizesFor, categoriesOf, getSize } from "@/lib/sizes";
import { getWizardConfig, wizardConfigHasStep, type WizardConfig } from "@/lib/sections";
import dynamic from "next/dynamic";
import { Label, TextInput, TextArea, Select, Button, Card, BrandPanel, Logo } from "./ui";
import AiField from "./AiField";
import { saveToHistory } from "@/lib/brief-history";

// Lazy-load the rich-text editor (Tiptap/ProseMirror is ~140kB) — it only appears
// on the Mood/content/notes step, so keep it out of the initial bundle.
const RichText = dynamic(() => import("./RichText"), {
  ssr: false,
  loading: () => <div className="rounded-lg border border-[var(--border)] bg-white h-32" />,
});

const DEFAULT_STORY_FLOW =
  "Context / Introduction → Detail Discovery → Technical Explanation → Proof / Process → Result / Outcome";

const emptySlide = (): SlideUnit => ({ title: "", visual: "", onImageText: "", proof: "", purpose: "" });

type SaveResult =
  | { ok: true; link: string; name: string }
  | { ok: false; reason?: string; message?: string };

// Client-side check: does this look like a Drive folder link/id? (Server re-parses.)
const looksLikeDriveFolder = (s: string) => {
  const v = (s || "").trim();
  if (!v) return false;
  return /\/folders\/[A-Za-z0-9_-]+/.test(v) || /[?&]id=[A-Za-z0-9_-]+/.test(v) || /^[A-Za-z0-9_-]{10,}$/.test(v);
};

// Strip rich-text HTML down to plain text for the Review preview.
const htmlToPlain = (html: string) =>
  html
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{2,}/g, "\n")
    .trim();

export default function Wizard({
  client,
  creativeType,
  onBack,
  initialBrief,
}: {
  client: ClientProfile;
  creativeType: CreativeType;
  onBack: () => void;
  initialBrief?: BriefData;
}) {
  const cfg = useMemo(() => getWizardConfig(creativeType), [creativeType]);
  const STEPS = cfg.steps;
  const sizeOptions = useMemo(() => getSizesFor(client.id, creativeType), [client.id, creativeType]);
  const sizeCategories = useMemo(() => categoriesOf(sizeOptions), [sizeOptions]);

  const brandContext = useMemo(() => brandContextString(client), [client]);
  const paletteSeed = client.brand.colors
    .map((c) => `${c.label}${c.hex ? ` (${c.hex})` : ""}${c.note ? ` — ${c.note}` : ""}`)
    .join("\n");

  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<BriefData>(
    initialBrief ?? {
      clientId: client.id,
      creativeTypeId: creativeType.id,
      projectName: "",
      hasEvent: false,
      objective: "",
      audience: client.defaultAudience,
      concept: "",
      palette: paletteSeed,
      typography: client.brand.typography,
      sourceAssets: [{ file: "", link: "", edits: "" }],
      moodboardLink: "",
      mood: "",
      inImageContent: "",
      designerNotes: "",
      sizeIds: [],
      sizeVariants: {},
      duration: "",
      saveLocation: "",
      // social
      contentDirection: "",
      contentFeel: "",
      storyFlow: DEFAULT_STORY_FLOW,
      slides: [emptySlide()],
      hook: "",
      caption: "",
      hashtags: "",
      cta: "",
      postingDate: "",
      platform: "",
      // strategy
      strategicInsight: "",
      channels: "",
      pillars: "",
      cadence: "",
      kpis: "",
      budget: "",
      // advertising
      keyMessages: "",
      smp: "",
      toneDirection: "",
      status: "Draft for review",
    }
  );
  // Instance-level "this deliverable has a moodboard" — only offered when the type supports one.
  const [useMoodboard, setUseMoodboard] = useState(true);

  const current = STEPS[step];
  const has = (id: Parameters<typeof wizardConfigHasStep>[1]) => wizardConfigHasStep(cfg, id);

  function set<K extends keyof BriefData>(key: K, value: BriefData[K]) {
    setBrief((b) => ({ ...b, [key]: value }));
  }

  function selectCampaign(id: string) {
    set("campaignId", id || undefined);
    const c = client.campaigns.find((x) => x.id === id);
    if (c) set("audience", c.audience);
    else set("audience", client.defaultAudience);
  }

  function selectSecondaryCampaign(id: string) {
    set("secondaryCampaignId", id || undefined);
    const c = client.campaigns.find((x) => x.id === id);
    set("secondaryAudience", c ? c.audience : undefined);
  }

  // ---- source assets repeater ----
  function updateAsset(i: number, patch: Partial<SourceAsset>) {
    setBrief((b) => {
      const arr = [...(b.sourceAssets ?? [])];
      arr[i] = { ...arr[i], ...patch };
      return { ...b, sourceAssets: arr };
    });
  }
  function addAsset() {
    setBrief((b) => ({ ...b, sourceAssets: [...(b.sourceAssets ?? []), { file: "", link: "", edits: "" }] }));
  }
  function removeAsset(i: number) {
    setBrief((b) => ({ ...b, sourceAssets: (b.sourceAssets ?? []).filter((_, idx) => idx !== i) }));
  }

  // ---- slides / frames repeater ----
  function updateSlide(i: number, patch: Partial<SlideUnit>) {
    setBrief((b) => {
      const arr = [...(b.slides ?? [])];
      arr[i] = { ...arr[i], ...patch };
      return { ...b, slides: arr };
    });
  }
  function addSlide() {
    setBrief((b) => ({ ...b, slides: [...(b.slides ?? []), emptySlide()] }));
  }
  function removeSlide(i: number) {
    setBrief((b) => ({ ...b, slides: (b.slides ?? []).filter((_, idx) => idx !== i) }));
  }

  function toggleSize(id: string) {
    setBrief((b) => {
      const has = b.sizeIds.includes(id);
      const sizeVariants = { ...(b.sizeVariants ?? {}) };
      if (has) delete sizeVariants[id];
      return { ...b, sizeIds: has ? b.sizeIds.filter((s) => s !== id) : [...b.sizeIds, id], sizeVariants };
    });
  }
  function toggleVariant(sizeId: string, variantId: string) {
    setBrief((b) => {
      const cur = b.sizeVariants?.[sizeId] ?? [];
      const has = cur.includes(variantId);
      return {
        ...b,
        sizeVariants: { ...(b.sizeVariants ?? {}), [sizeId]: has ? cur.filter((v) => v !== variantId) : [...cur, variantId] },
      };
    });
  }
  function setAllSizes(on: boolean) {
    if (!on) {
      setBrief((b) => ({ ...b, sizeIds: [], sizeVariants: {} }));
      return;
    }
    set("sizeIds", sizeOptions.map((s) => s.id));
  }
  function toggleCategorySizes(cat: string) {
    const ids = sizeOptions.filter((s) => s.category === cat).map((s) => s.id);
    setBrief((b) => {
      const allOn = ids.every((id) => b.sizeIds.includes(id));
      const next = new Set(b.sizeIds);
      const sv = { ...(b.sizeVariants ?? {}) };
      ids.forEach((id) => {
        if (allOn) {
          next.delete(id);
          delete sv[id];
        } else next.add(id);
      });
      return { ...b, sizeIds: [...next], sizeVariants: sv };
    });
  }

  const showMoodboard = cfg.moodboard && useMoodboard;
  // Does the save-location field hold a usable Drive folder link/id?
  const hasDriveFolder = looksLikeDriveFolder(brief.saveLocation ?? "");

  // The brief so far — passed to every AI draft so sections stay coherent + on-brief.
  const aiContext: Record<string, string | undefined> = {
    Project: brief.projectName,
    Campaign: [
      client.campaigns.find((c) => c.id === brief.campaignId)?.name,
      client.campaigns.find((c) => c.id === brief.secondaryCampaignId)?.name,
    ].filter(Boolean).join(" + ") || undefined,
    Event: brief.hasEvent ? [brief.eventDate, brief.venue].filter(Boolean).join(" · ") : undefined,
    Objective: brief.objective,
    Audience: [brief.audience, brief.secondaryAudience].filter(Boolean).join("\n\n---\n\n"),
    Concept: brief.concept,
  };

  // Strip anything this brief shape doesn't use, so the output never carries
  // sections from a different deliverable type. Shared by download + Drive save.
  function buildPayload(): BriefData {
    return {
      ...brief,
      concept: has("concept") ? brief.concept : "",
      palette: cfg.palette ? brief.palette : "",
      typography: cfg.typography ? brief.typography : "",
      sourceAssets: cfg.sourceAssets ? (brief.sourceAssets ?? []).filter((a) => a.file.trim()) : [],
      moodboardLink: showMoodboard ? brief.moodboardLink : "",
      mood: cfg.mood ? brief.mood : "",
      inImageContent: cfg.inImageContent ? brief.inImageContent : "",
      designerNotes: cfg.designerNotes || has("notes") ? brief.designerNotes : "",
      sizeIds: cfg.sizes ? brief.sizeIds : [],
      duration: cfg.duration ? brief.duration : "",
      // social
      contentDirection: has("direction") ? brief.contentDirection : "",
      contentFeel: has("direction") ? brief.contentFeel : "",
      storyFlow: has("direction") ? brief.storyFlow : "",
      slides: has("slides")
        ? (brief.slides ?? []).filter((s) => s.title.trim() || s.visual.trim() || s.onImageText.trim())
        : [],
      hook: has("distribution") ? brief.hook : "",
      caption: has("distribution") ? brief.caption : "",
      hashtags: has("distribution") ? brief.hashtags : "",
      cta: has("distribution") ? brief.cta : "",
      postingDate: has("distribution") ? brief.postingDate : "",
      platform: has("distribution") ? brief.platform : "",
      // strategy
      strategicInsight: has("insight") ? brief.strategicInsight : "",
      channels: has("channelsMessaging") ? brief.channels : "",
      pillars: has("channelsMessaging") ? brief.pillars : "",
      cadence: has("cadenceKpis") ? brief.cadence : "",
      kpis: has("cadenceKpis") ? brief.kpis : "",
      budget: has("cadenceKpis") && cfg.budget ? brief.budget : "",
      // advertising
      keyMessages: has("keyMessages") ? brief.keyMessages : "",
      smp: has("smp") ? brief.smp : "",
      toneDirection: has("toneDirection") ? brief.toneDirection : "",
    };
  }

  const [generating, setGenerating] = useState(false);
  async function generate() {
    setGenerating(true);
    saveToHistory({
      clientId: client.id,
      clientName: client.name,
      creativeTypeId: creativeType.id,
      creativeTypeShort: creativeType.short,
      projectName: brief.projectName,
      brief,
    });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dispo = res.headers.get("Content-Disposition") || "";
      const m = dispo.match(/filename="(.+?)"/);
      a.download = m ? m[1] : "brief.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  async function saveToDrive() {
    setSaving(true);
    setSaveResult(null);
    saveToHistory({
      clientId: client.id,
      clientName: client.name,
      creativeTypeId: creativeType.id,
      creativeTypeShort: creativeType.short,
      projectName: brief.projectName,
      brief,
    });
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: buildPayload(), folderUrl: brief.saveLocation ?? "" }),
      });
      const data = await res.json();
      if (data.saved) {
        setSaveResult({ ok: true, link: data.webViewLink, name: data.name });
      } else {
        // Could not save — fall back to a download and explain why.
        setSaveResult({ ok: false, reason: data.reason, message: data.message });
        await generate();
      }
    } catch {
      setSaveResult({ ok: false, reason: "network" });
      await generate();
    } finally {
      setSaving(false);
    }
  }

  const canNext = current.id === "basics" ? brief.projectName.trim().length > 0 : true;
  const isLast = current.id === "review";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <button onClick={onBack} className="text-sm text-[var(--accent-text)] hover:underline mb-1">
            ← Start over
          </button>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-brand">
            {creativeType.short} brief
            <span className="text-base text-gray-400 font-normal"> · {client.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-500">
            Step {step + 1} of {STEPS.length}
          </span>
          <Logo className="shrink-0" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
        {/* sidebar */}
        <div className="space-y-4">
          <Card className="p-2">
            <ol className="space-y-0.5">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => setStep(i)}
                    className={
                      "w-full text-left text-xs rounded-md px-2.5 py-1.5 transition " +
                      (i === step
                        ? "bg-[var(--brand-strong)] text-white font-semibold"
                        : i < step
                          ? "text-[var(--accent-text)] hover:bg-[var(--brand-soft)]"
                          : "text-gray-500 hover:bg-gray-50")
                    }
                  >
                    {i < step ? "✓ " : `${i + 1}. `}
                    {s.label}
                  </button>
                </li>
              ))}
            </ol>
          </Card>
          <BrandPanel
            lines={[
              { label: "Voice", value: client.brand.voice },
              { label: "Type", value: client.brand.typography },
              ...client.brand.colors.map((c) => ({ label: c.label, value: c.note ?? c.hex ?? "" })),
            ]}
          />
        </div>

        {/* content */}
        <Card className="p-6 min-h-[420px]">
          {current.id === "basics" && (
            <div className="space-y-5">
              <div>
                <Label hint="The event or project name this piece supports.">Project name</Label>
                <TextInput
                  value={brief.projectName}
                  onChange={(e) => set("projectName", e.target.value)}
                  placeholder="e.g. Hideaway Taste of Opera"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={brief.hasEvent} onChange={(e) => set("hasEvent", e.target.checked)} />
                This piece is tied to a dated event
              </label>

              {brief.hasEvent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-[var(--brand-soft)]">
                  <div>
                    <Label>Event date</Label>
                    <TextInput value={brief.eventDate ?? ""} onChange={(e) => set("eventDate", e.target.value)} placeholder="January 21, 2027 · 5:30 PM" />
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <TextInput value={brief.venue ?? ""} onChange={(e) => set("venue", e.target.value)} placeholder="Gulfview Room, Hideaway Beach Club" />
                  </div>
                </div>
              )}

              <div>
                <Label hint="Optional. Pick a campaign to auto-fill the audience, or leave blank for a standalone piece.">
                  Primary Campaign
                </Label>
                <Select value={brief.campaignId ?? ""} onChange={(e) => selectCampaign(e.target.value)}>
                  <option value="">— None (standalone) —</option>
                  {client.campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              {client.campaigns.length > 0 && (
                <div>
                  <Label hint="Optional. Add a secondary audience when this deliverable targets two segments.">
                    Secondary Campaign
                  </Label>
                  <Select value={brief.secondaryCampaignId ?? ""} onChange={(e) => selectSecondaryCampaign(e.target.value)}>
                    <option value="">— None —</option>
                    {client.campaigns
                      .filter((c) => c.id !== brief.campaignId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </Select>
                </div>
              )}

              <div>
                <Label>Review meeting (optional)</Label>
                <TextInput value={brief.reviewMeeting ?? ""} onChange={(e) => set("reviewMeeting", e.target.value)} placeholder="June 9, 2026 · 10:00 AM ET" />
              </div>
            </div>
          )}

          {current.id === "objective" && (
            <AiField
              label="Objective"
              hint="What this is for, where it runs, and how it must align + stand apart."
              section="objective"
              value={brief.objective}
              onChange={(v) => set("objective", v)}
              clientName={client.name}
              creativeTypeName={creativeType.short}
              brandContext={brandContext}
              context={aiContext}
              rows={6}
            />
          )}

          {current.id === "audience" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label hint={brief.campaignId ? "Pre-filled from the selected campaign — edit as needed." : "Pre-filled from the client profile — edit as needed."}>
                  {brief.secondaryCampaignId ? "Primary audience" : "Target audience"}
                </Label>
                <TextArea rows={7} value={brief.audience} onChange={(e) => set("audience", e.target.value)} />
              </div>
              {brief.secondaryCampaignId && (
                <div className="space-y-3">
                  <Label hint="Pre-filled from the secondary campaign — edit as needed.">
                    Secondary audience
                  </Label>
                  <TextArea rows={7} value={brief.secondaryAudience ?? ""} onChange={(e) => set("secondaryAudience", e.target.value)} />
                </div>
              )}
            </div>
          )}

          {current.id === "concept" && (
            <AiField
              label={cfg.conceptLabel}
              hint={cfg.conceptHint}
              section="concept"
              value={brief.concept ?? ""}
              onChange={(v) => set("concept", v)}
              clientName={client.name}
              creativeTypeName={creativeType.short}
              brandContext={brandContext}
              context={aiContext}
              rows={6}
              richText
            />
          )}

          {current.id === "style" && (
            <div className="space-y-5">
              {cfg.palette && (
                <div>
                  <Label hint="Pre-seeded from the brand. One per line.">Color palette</Label>
                  <TextArea rows={5} value={brief.palette ?? ""} onChange={(e) => set("palette", e.target.value)} />
                </div>
              )}
              {cfg.typography && (
                <div>
                  <Label>Typography</Label>
                  <TextArea rows={2} value={brief.typography ?? ""} onChange={(e) => set("typography", e.target.value)} />
                </div>
              )}

              {cfg.sourceAssets && (
                <div>
                  <Label hint="Photos / files the designer must use, with the edits needed.">Source assets</Label>
                  <div className="space-y-3">
                    {(brief.sourceAssets ?? []).map((a, i) => (
                      <div key={i} className="rounded-lg border border-[var(--border)] p-3 space-y-2">
                        <div className="flex gap-2">
                          <TextInput placeholder="File name" value={a.file} onChange={(e) => updateAsset(i, { file: e.target.value })} />
                          <TextInput placeholder="Link (Drive, stock, etc.)" value={a.link} onChange={(e) => updateAsset(i, { link: e.target.value })} />
                          <button onClick={() => removeAsset(i)} className="text-gray-400 hover:text-red-500 text-lg px-1" title="Remove">
                            ×
                          </button>
                        </div>
                        <TextArea rows={2} placeholder="Edits / direction for this asset…" value={a.edits} onChange={(e) => updateAsset(i, { edits: e.target.value })} />
                      </div>
                    ))}
                    <Button variant="subtle" type="button" onClick={addAsset}>
                      + Add asset
                    </Button>
                  </div>
                </div>
              )}

              {cfg.moodboard && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <input type="checkbox" checked={useMoodboard} onChange={(e) => setUseMoodboard(e.target.checked)} />
                    This deliverable has a moodboard
                  </label>
                  {useMoodboard && (
                    <TextArea rows={2} placeholder="Moodboard file name + path…" value={brief.moodboardLink ?? ""} onChange={(e) => set("moodboardLink", e.target.value)} />
                  )}
                </div>
              )}
            </div>
          )}

          {current.id === "details" && (
            <div className="space-y-5">
              {cfg.mood && (
                <AiField
                  label={cfg.moodLabel}
                  hint="Comma or line separated — e.g. Romantic, Warm, Golden, Timeless. AI can suggest a set."
                  section="mood"
                  value={brief.mood ?? ""}
                  onChange={(v) => set("mood", v)}
                  clientName={client.name}
                  creativeTypeName={creativeType.short}
                  brandContext={brandContext}
                  context={aiContext}
                  rows={3}
                />
              )}
              {cfg.inImageContent && (
                <div>
                  <Label hint="Text/elements that must appear. Use formatting to show the hierarchy — headline, subhead, body, fine print.">
                    {cfg.inImageContentLabel}
                  </Label>
                  <RichText value={brief.inImageContent ?? ""} onChange={(v) => set("inImageContent", v)} />
                </div>
              )}
              {cfg.designerNotes && (
                <AiField
                  label={cfg.designerNotesLabel}
                  hint="Actionable execution guidance. AI can tighten your notes."
                  section="notes"
                  value={brief.designerNotes ?? ""}
                  onChange={(v) => set("designerNotes", v)}
                  clientName={client.name}
                  creativeTypeName={creativeType.short}
                  brandContext={brandContext}
                  context={aiContext}
                  rows={5}
                />
              )}
            </div>
          )}

          {/* ── Social: content direction ── */}
          {current.id === "direction" && (
            <div className="space-y-5">
              <AiField
                label="Content direction"
                hint="The series theme and how it positions the brand. AI can shape your notes."
                section="direction"
                value={brief.contentDirection ?? ""}
                onChange={(v) => set("contentDirection", v)}
                clientName={client.name}
                creativeTypeName={creativeType.short}
                brandContext={brandContext}
                context={aiContext}
                rows={5}
              />
              <div>
                <Label hint="Tone descriptors — e.g. Architectural, Educational, Premium, Calm, Proof-led.">Feel / tone</Label>
                <TextArea rows={3} value={brief.contentFeel ?? ""} onChange={(e) => set("contentFeel", e.target.value)} />
              </div>
              <div>
                <Label hint="How the piece moves from open to close. Edit the default to fit.">Storytelling flow</Label>
                <TextArea rows={2} value={brief.storyFlow ?? ""} onChange={(e) => set("storyFlow", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Social: slide / frame builder ── */}
          {current.id === "slides" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Build the piece {cfg.slideUnit === "Frame" ? "frame" : "slide"} by {cfg.slideUnit === "Frame" ? "frame" : "slide"}. Each should advance the story.
              </p>
              {(brief.slides ?? []).map((s, i) => (
                <div key={i} className="rounded-lg border border-[var(--border)] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                      {cfg.slideUnit} {i + 1}
                    </span>
                    {(brief.slides?.length ?? 0) > 1 && (
                      <button onClick={() => removeSlide(i)} className="text-gray-400 hover:text-red-500 text-lg px-1" title="Remove">
                        ×
                      </button>
                    )}
                  </div>
                  <TextInput placeholder={`${cfg.slideUnit} title — e.g. "Ultra-Clear Glass"`} value={s.title} onChange={(e) => updateSlide(i, { title: e.target.value })} />
                  <TextArea rows={2} placeholder="Visual — what we see" value={s.visual} onChange={(e) => updateSlide(i, { visual: e.target.value })} />
                  <TextInput placeholder={cfg.slideUnit === "Frame" ? "On-screen text" : "On-image text"} value={s.onImageText} onChange={(e) => updateSlide(i, { onImageText: e.target.value })} />
                  {cfg.showSlideExtras && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <TextInput placeholder="Micro-proof / supporting line" value={s.proof} onChange={(e) => updateSlide(i, { proof: e.target.value })} />
                      <TextInput placeholder="Storytelling purpose" value={s.purpose} onChange={(e) => updateSlide(i, { purpose: e.target.value })} />
                    </div>
                  )}
                </div>
              ))}
              {(!cfg.maxSlides || (brief.slides?.length ?? 0) < cfg.maxSlides) && (
                <Button variant="subtle" type="button" onClick={addSlide}>
                  + Add {cfg.slideUnit.toLowerCase()}
                </Button>
              )}
            </div>
          )}

          {/* ── Social: caption & distribution ── */}
          {current.id === "distribution" && (
            <div className="space-y-5">
              <div>
                <Label hint="The scroll-stopping opening line.">Hook</Label>
                <TextInput value={brief.hook ?? ""} onChange={(e) => set("hook", e.target.value)} placeholder="4 details that define frameless design" />
              </div>
              <div>
                <Label>Caption</Label>
                <TextArea rows={4} value={brief.caption ?? ""} onChange={(e) => set("caption", e.target.value)} />
              </div>
              <div>
                <Label hint="10–15, ordered by relevance.">Hashtags</Label>
                <TextArea rows={2} value={brief.hashtags ?? ""} onChange={(e) => set("hashtags", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>CTA</Label>
                  <TextInput value={brief.cta ?? ""} onChange={(e) => set("cta", e.target.value)} placeholder="Comment your favorite detail" />
                </div>
                <div>
                  <Label>Posting date</Label>
                  <TextInput value={brief.postingDate ?? ""} onChange={(e) => set("postingDate", e.target.value)} placeholder="May 14" />
                </div>
                <div>
                  <Label>Platform(s)</Label>
                  <TextInput value={brief.platform ?? ""} onChange={(e) => set("platform", e.target.value)} placeholder="Instagram + LinkedIn" />
                </div>
              </div>
            </div>
          )}

          {/* ── Strategy: strategic insight ── */}
          {current.id === "insight" && (
            <AiField
              label="Strategic insight"
              hint="The why-now, what it competes against, and what past performance taught us."
              section="insight"
              value={brief.strategicInsight ?? ""}
              onChange={(v) => set("strategicInsight", v)}
              clientName={client.name}
              creativeTypeName={creativeType.short}
              brandContext={brandContext}
              context={aiContext}
              rows={6}
            />
          )}

          {/* ── Strategy: channels & messaging ── */}
          {current.id === "channelsMessaging" && (
            <div className="space-y-5">
              <div>
                <Label hint="Which channels, and the role each plays in the mix.">Channels &amp; mix</Label>
                <TextArea rows={5} value={brief.channels ?? ""} onChange={(e) => set("channels", e.target.value)} />
              </div>
              <div>
                <Label hint="Key messages, content pillars, or recurring themes.">Messaging &amp; content pillars</Label>
                <TextArea rows={5} value={brief.pillars ?? ""} onChange={(e) => set("pillars", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Strategy: cadence & KPIs ── */}
          {current.id === "cadenceKpis" && (
            <div className="space-y-5">
              <div>
                <Label hint="Frequency, milestones, and key dates.">Cadence &amp; timeline</Label>
                <TextArea rows={4} value={brief.cadence ?? ""} onChange={(e) => set("cadence", e.target.value)} />
              </div>
              <div>
                <Label hint="Targets and what we'll track.">KPIs &amp; measurement</Label>
                <TextArea rows={4} value={brief.kpis ?? ""} onChange={(e) => set("kpis", e.target.value)} />
              </div>
              {cfg.budget && (
                <div>
                  <Label hint="Allocation. Optional.">Budget</Label>
                  <TextArea rows={3} value={brief.budget ?? ""} onChange={(e) => set("budget", e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* ── Strategy: notes ── */}
          {current.id === "notes" && (
            <AiField
              label={cfg.notesLabel}
              hint="Anything else the team needs. AI can tighten your notes."
              section="notes"
              value={brief.designerNotes ?? ""}
              onChange={(v) => set("designerNotes", v)}
              clientName={client.name}
              creativeTypeName={creativeType.short}
              brandContext={brandContext}
              context={aiContext}
              rows={5}
            />
          )}

          {/* ── Key Messages ── */}
          {current.id === "keyMessages" && (
            <div className="space-y-3">
              <Label hint={cfg.keyMessagesHint}>{cfg.keyMessagesLabel}</Label>
              <TextArea rows={8} value={brief.keyMessages ?? ""} onChange={(e) => set("keyMessages", e.target.value)} />
            </div>
          )}

          {/* ── TV: Single-Minded Proposition ── */}
          {current.id === "smp" && (
            <div className="space-y-3">
              <Label hint="One sentence that distills exactly what this commercial must make the audience feel or believe.">
                Single-Minded Proposition
              </Label>
              <TextArea rows={4} value={brief.smp ?? ""} onChange={(e) => set("smp", e.target.value)} />
            </div>
          )}

          {/* ── TV: Tone & Direction ── */}
          {current.id === "toneDirection" && (
            <div className="space-y-3">
              <Label hint="Tone & personality, visual codes (lighting, color, movement), music direction, VO direction, mandatory elements (end-card, disclaimers), words to avoid. Be specific.">
                Tone & creative direction
              </Label>
              <TextArea rows={10} value={brief.toneDirection ?? ""} onChange={(e) => set("toneDirection", e.target.value)} />
            </div>
          )}

          {current.id === "specs" && (
            <div className="space-y-5">
              {cfg.sizes && (
                <div>
                  <div className="flex items-end justify-between mb-1.5">
                    <Label hint="Pick every size needed. The note shows how the designer should save each file.">Sizes</Label>
                    <div className="flex items-center gap-2 text-xs">
                      <button type="button" onClick={() => setAllSizes(true)} className="font-semibold text-[var(--brand)] hover:underline">
                        Select all
                      </button>
                      <span className="text-gray-300">·</span>
                      <button type="button" onClick={() => setAllSizes(false)} className="text-gray-500 hover:underline">
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {sizeCategories.map((cat) => {
                      const catIds = sizeOptions.filter((s) => s.category === cat).map((s) => s.id);
                      const allOn = catIds.every((id) => brief.sizeIds.includes(id));
                      return (
                      <div key={cat}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{cat}</p>
                          <button type="button" onClick={() => toggleCategorySizes(cat)} className="text-[11px] text-[var(--brand)] hover:underline">
                            {allOn ? "Clear" : "All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {sizeOptions.filter((s) => s.category === cat).map((s) => {
                            const selected = brief.sizeIds.includes(s.id);
                            return (
                            <div key={s.id} className="rounded-md">
                              <label className="flex items-start gap-2 text-sm px-2 py-1 hover:bg-gray-50 cursor-pointer">
                                <input type="checkbox" className="mt-1" checked={selected} onChange={() => toggleSize(s.id)} />
                                <span>
                                  {s.label}
                                  {s.note && <span className="block text-[11px] text-gray-400 leading-snug">{s.note}</span>}
                                </span>
                              </label>
                              {selected && (s.variants?.length ?? 0) > 0 && (
                                <div className="ml-7 mb-1 flex flex-wrap gap-x-3 gap-y-1">
                                  {s.variants!.map((v) => (
                                    <label key={v.id} className="flex items-center gap-1 text-[11px] text-gray-600 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={(brief.sizeVariants?.[s.id] ?? []).includes(v.id)}
                                        onChange={() => toggleVariant(s.id, v.id)}
                                      />
                                      {v.label}
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {cfg.duration && (
                <div>
                  <Label hint="Read / run length — e.g. :15, :30, :60, or 2 min.">Duration</Label>
                  <TextInput value={brief.duration ?? ""} onChange={(e) => set("duration", e.target.value)} placeholder=":30" />
                </div>
              )}
              <div>
                <Label hint="Base file name the designer should save each deliverable as. Defaults to the project name.">
                  Save deliverables as
                </Label>
                <TextInput
                  value={brief.saveAs ?? ""}
                  onChange={(e) => set("saveAs", e.target.value)}
                  placeholder={brief.projectName || "e.g. MSD North Naples Showroom"}
                />
              </div>
              <div>
                <Label hint="Paste the Google Drive folder link where this brief should be saved. Used to auto-save the .docx into Drive.">
                  Drive folder (save location)
                </Label>
                <TextInput
                  value={brief.saveLocation ?? ""}
                  onChange={(e) => set("saveLocation", e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/…"
                />
                {client.driveFolderHint && (
                  <p className="text-[11px] text-gray-400 mt-1">Expected location: {client.driveFolderHint}</p>
                )}
                {brief.saveLocation && !hasDriveFolder && (
                  <p className="text-[11px] text-amber-600 mt-1">That doesn&apos;t look like a Drive folder link — saving will fall back to a download.</p>
                )}
              </div>
              <div>
                <Label hint="Name for the brief document itself. Leave blank to auto-name it (project + type).">
                  Brief file name (.docx)
                </Label>
                <TextInput
                  value={brief.docName ?? ""}
                  onChange={(e) => set("docName", e.target.value)}
                  placeholder={`${(brief.projectName || "brief").trim()} ${creativeType.short}`}
                />
              </div>
            </div>
          )}

          {current.id === "review" && (
            <Review
              brief={brief}
              client={client}
              creativeType={creativeType}
              cfg={cfg}
              showMoodboard={showMoodboard}
              onGenerate={generate}
              generating={generating}
              onSaveToDrive={saveToDrive}
              saving={saving}
              saveResult={saveResult}
              canSaveToDrive={hasDriveFolder}
            />
          )}

          {/* nav */}
          {!isLast && (
            <div className="flex justify-between mt-8 pt-4 border-t border-[var(--border)]">
              <Button variant="subtle" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                ← Back
              </Button>
              <Button disabled={!canNext} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
                Next →
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ---- Review step ----
function Review({
  brief,
  client,
  creativeType,
  cfg,
  showMoodboard,
  onGenerate,
  generating,
  onSaveToDrive,
  saving,
  saveResult,
  canSaveToDrive,
}: {
  brief: BriefData;
  client: ClientProfile;
  creativeType: CreativeType;
  cfg: WizardConfig;
  showMoodboard: boolean;
  onGenerate: () => void;
  generating: boolean;
  onSaveToDrive: () => void;
  saving: boolean;
  saveResult: SaveResult | null;
  canSaveToDrive: boolean;
}) {
  const has = (id: Parameters<typeof wizardConfigHasStep>[1]) => wizardConfigHasStep(cfg, id);
  const sizeLabels = brief.sizeIds
    .map((id) => {
      const s = getSize(id);
      if (!s) return null;
      const vs = brief.sizeVariants?.[id] ?? [];
      return `${s.label}${vs.length ? ` (+${vs.length} variant${vs.length > 1 ? "s" : ""})` : ""}`;
    })
    .filter(Boolean);
  const slideSummary = (brief.slides ?? [])
    .filter((s) => s.title.trim() || s.onImageText.trim())
    .map((s, i) => `${cfg.slideUnit} ${i + 1}${s.title ? `: ${s.title}` : ""}`)
    .join("\n");
  const row = (label: string, value?: React.ReactNode) =>
    value ? (
      <div className="py-2 border-b border-[var(--border)] last:border-0">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{label}</p>
        <div className="text-sm text-gray-700 whitespace-pre-wrap mt-0.5">{value}</div>
      </div>
    ) : null;

  return (
    <div>
      <h2 className="font-sans text-xl font-extrabold tracking-tight text-brand mb-1">Review &amp; export</h2>
      <p className="text-sm text-gray-500 mb-4">Check everything, then generate the styled Word brief.</p>

      <div className="rounded-lg border border-[var(--border)] p-4 mb-5 max-h-[360px] overflow-auto">
        {row("Project", `${brief.projectName} — ${creativeType.short}`)}
        {row("Client", client.name)}
        {brief.hasEvent && row("Event", [brief.eventDate, brief.venue].filter(Boolean).join(" · "))}
        {row("Objective", brief.objective)}
        {row(brief.secondaryAudience ? "Primary audience" : "Audience", brief.audience)}
        {brief.secondaryAudience && row("Secondary audience", brief.secondaryAudience)}
        {has("insight") && row("Strategic insight", brief.strategicInsight)}
        {has("keyMessages") && row(cfg.keyMessagesLabel, brief.keyMessages)}
        {has("smp") && row("Single-Minded Proposition", brief.smp)}
        {has("toneDirection") && row("Tone & direction", brief.toneDirection)}
        {has("concept") && row(cfg.conceptLabel, brief.concept ? htmlToPlain(brief.concept) : "")}
        {has("direction") && row("Content direction", brief.contentDirection)}
        {has("direction") && row("Feel / tone", brief.contentFeel)}
        {has("slides") && row(cfg.slideUnit === "Frame" ? "Frames" : "Slides", slideSummary)}
        {cfg.palette && row("Palette", brief.palette)}
        {cfg.typography && row("Typography", brief.typography)}
        {cfg.sourceAssets &&
          row(
            "Source assets",
            (brief.sourceAssets ?? []).filter((a) => a.file).map((a) => `${a.file}${a.link ? ` — ${a.link}` : ""}`).join("\n")
          )}
        {showMoodboard && row("Moodboard", brief.moodboardLink)}
        {has("channelsMessaging") && row("Channels & mix", brief.channels)}
        {has("channelsMessaging") && row("Messaging & pillars", brief.pillars)}
        {cfg.mood && row(cfg.moodLabel, brief.mood)}
        {cfg.inImageContent && row("Content (in image)", brief.inImageContent ? htmlToPlain(brief.inImageContent) : "")}
        {has("distribution") && row("Hook", brief.hook)}
        {has("distribution") && row("Caption", brief.caption)}
        {has("distribution") && row("Hashtags", brief.hashtags)}
        {has("distribution") && row("CTA", brief.cta)}
        {has("distribution") && row("Posting", [brief.postingDate, brief.platform].filter(Boolean).join(" · "))}
        {has("cadenceKpis") && row("Cadence & timeline", brief.cadence)}
        {has("cadenceKpis") && row("KPIs & measurement", brief.kpis)}
        {has("cadenceKpis") && cfg.budget && row("Budget", brief.budget)}
        {(cfg.designerNotes || has("notes")) &&
          row(
            cfg.designerNotes ? cfg.designerNotesLabel : cfg.notesLabel,
            brief.designerNotes ? (
              <ul className="list-disc list-inside space-y-0.5">
                {brief.designerNotes
                  .split(/\n|•|\*/)
                  .map((s) => s.replace(/^[•\s]+/, "").trim())
                  .filter(Boolean)
                  .map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            ) : null
          )}
        {cfg.sizes && row("Sizes", sizeLabels.join(", "))}
        {cfg.duration && row("Duration", brief.duration)}
        {row("Save deliverables as", brief.saveAs)}
        {row("Drive folder", brief.saveLocation)}
        {row("Brief file name", brief.docName)}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {canSaveToDrive && (
          <Button onClick={onSaveToDrive} disabled={saving || generating}>
            {saving ? "Saving to Drive…" : "✦ Generate & save to Drive"}
          </Button>
        )}
        <Button variant={canSaveToDrive ? "subtle" : "primary"} onClick={onGenerate} disabled={generating || saving}>
          {generating ? "Generating…" : "⬇ Download .docx"}
        </Button>
        {!canSaveToDrive && (
          <span className="text-xs text-gray-500">
            Add a Drive folder link in the Specs step to save straight into Drive.
          </span>
        )}
      </div>

      {saveResult?.ok && (
        <p className="text-sm text-green-700 mt-3">
          ✓ Saved <strong>{saveResult.name}</strong> to Drive ·{" "}
          <a href={saveResult.link} target="_blank" rel="noopener noreferrer" className="text-[var(--brand)] underline">
            View in Drive
          </a>
        </p>
      )}
      {saveResult && !saveResult.ok && (
        <p className="text-sm text-amber-700 mt-3">
          {saveResult.reason === "not-configured"
            ? "Drive saving isn't configured yet — downloaded the file instead."
            : saveResult.reason === "permission"
              ? "The service account can't write to that folder (check it's a member of the Shared Drive) — downloaded instead."
              : saveResult.reason === "invalid-folder"
                ? "That Drive folder link wasn't valid — downloaded instead."
                : "Couldn't save to Drive — downloaded the file instead."}
        </p>
      )}
    </div>
  );
}
