"use client";

import React, { useState, useEffect } from "react";
import { CLIENTS } from "@/lib/clients";
import { CREATIVE_TYPES, ARCHETYPE_LABELS, LIVE_ARCHETYPES } from "@/lib/creativeTypes";
import type { Archetype, BriefData, ClientProfile } from "@/lib/types";
import { Logo } from "./ui";
import Wizard from "./Wizard";
import { loadHistory, deleteFromHistory, formatSavedAt, type HistoryEntry } from "@/lib/brief-history";
import { loadDrafts, deleteDraft, newDraftId, formatUpdatedAt, type DraftEntry } from "@/lib/brief-drafts";

const GROUP_COLOR: Record<string, string> = {
  "D&CP": "#30a46c",
  DM: "#0091ff",
  WD: "#ffc53d",
};

const ARCHETYPE_ORDER: Archetype[] = ["key-visual", "collateral", "ad", "social", "strategy", "webpage"];

const ARCHETYPE_SUB: Record<Archetype, string> = {
  "key-visual": "Season or event look",
  collateral: "Print, invites, programs",
  ad: "Digital, print, radio, TV",
  social: "Carousels, reels, stories",
  strategy: "Campaigns, email, DM",
  webpage: "Pages and landing pages",
};

// Line icons for the category tiles (24×24, stroke = currentColor).
const ARCHETYPE_ICON: Record<Archetype, React.ReactNode> = {
  "key-visual": (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </>
  ),
  collateral: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  ad: (
    <>
      <path d="M3 10v4h3l7 4V6L6 10z" />
      <path d="M17 9a4 4 0 0 1 0 6" />
    </>
  ),
  social: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M12 15.5s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z" />
    </>
  ),
  strategy: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  webpage: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </>
  ),
};

function clientDot(c: ClientProfile) {
  const hexes = c.brand.colors.map((x) => x.hex).filter(Boolean) as string[];
  return `linear-gradient(135deg, ${hexes[0] ?? "#302569"}, ${hexes[1] ?? hexes[0] ?? "#e87722"})`;
}
function clientShort(id: string, name: string) {
  const m = name.match(/\(([^)]+)\)/);
  if (m) return m[1];
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase() || id.slice(0, 2).toUpperCase();
}
function clientColor(id: string) {
  return CLIENTS.find((c) => c.id === id)?.brand.colors[0]?.hex ?? "#302569";
}

export default function BriefApp() {
  const [clientId, setClientId] = useState(CLIENTS[0]?.id ?? "");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<Archetype>("key-visual");
  const [initialBrief, setInitialBrief] = useState<BriefData | undefined>(undefined);
  const [initialStep, setInitialStep] = useState(0);
  const [draftId, setDraftId] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    setDrafts(loadDrafts());
  }, []);

  const client = CLIENTS.find((c) => c.id === clientId);
  const creativeType = CREATIVE_TYPES.find((t) => t.id === typeId);

  function openType(id: string) {
    setDraftId(newDraftId());
    setInitialStep(0);
    setInitialBrief(undefined);
    setTypeId(id);
  }

  function loadEntry(entry: HistoryEntry) {
    setClientId(entry.clientId);
    setDraftId(newDraftId());
    setInitialStep(0);
    setInitialBrief(entry.brief);
    setTypeId(entry.creativeTypeId);
  }

  function removeEntry(id: string) {
    deleteFromHistory(id);
    setHistory(loadHistory());
  }

  function resumeDraft(d: DraftEntry) {
    setClientId(d.clientId);
    setDraftId(d.id);
    setInitialStep(d.step);
    setInitialBrief(d.brief);
    setTypeId(d.creativeTypeId);
  }

  function removeDraft(id: string) {
    if (!window.confirm("Discard this draft? This can't be undone.")) return;
    deleteDraft(id);
    setDrafts(loadDrafts());
  }

  if (client && creativeType) {
    return (
      <Wizard
        key={draftId}
        draftId={draftId}
        initialStep={initialStep}
        client={client}
        creativeType={creativeType}
        onBack={() => {
          setTypeId(null);
          setInitialBrief(undefined);
          setHistory(loadHistory());
          setDrafts(loadDrafts());
        }}
        initialBrief={initialBrief}
      />
    );
  }

  const latest = drafts[0];
  const moreDrafts = drafts.slice(1);
  const archTypes = CREATIVE_TYPES.filter((t) => t.archetype === archetype);
  const archLive = LIVE_ARCHETYPES.has(archetype);

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-6 sm:py-10">
      <div className="glass-frame rounded-[32px] sm:rounded-[40px] p-5 sm:p-9 space-y-9">
        {/* top bar */}
        <div className="flex items-center justify-between gap-4">
          <Logo />
        </div>

        {/* hero: title + client chips | resume card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch">
          <div className="py-1">
            <p className="eyebrow">Creative Briefs</p>
            <h1 className="font-serif text-[clamp(40px,5.6vw,64px)] font-extrabold leading-[1.02] tracking-[-0.01em] text-[var(--indigo)] mt-2">
              Brief <em className="italic font-normal text-gradient-orange">Builder</em>
            </h1>
            <p className="text-[var(--muted)] text-base leading-relaxed max-w-[46ch] mt-4">
              Build a clear, on-brand creative brief in minutes. Pick the client and what you&apos;re briefing.
            </p>
            <div className="mt-6">
              <p className="text-xs text-[var(--muted)] mb-2">Brand rules and segments load from this client.</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Client">
                {CLIENTS.map((c) => {
                  const on = c.id === clientId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setClientId(c.id)}
                      aria-pressed={on}
                      className={
                        "inline-flex items-center gap-2 rounded-full border py-2 pl-2 pr-4 text-[13px] font-semibold transition " +
                        (on
                          ? "bg-[var(--indigo)] text-white border-[var(--indigo)]"
                          : "bg-[var(--glass-strong)] text-[var(--foreground)] border-[var(--border)] hover:bg-white")
                      }
                    >
                      <span className="w-[22px] h-[22px] rounded-full" style={{ background: clientDot(c) }} />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {latest ? (
            <div
              className="relative overflow-hidden rounded-[32px] p-6 text-white grid gap-5 content-between min-h-[250px] shadow-[0_24px_50px_-24px_rgba(48,37,105,0.6)]"
              style={{
                background:
                  "radial-gradient(120% 90% at 0% 0%, #f39a52 0%, transparent 55%), radial-gradient(120% 120% at 100% 100%, #5a4aa8 0%, transparent 60%), linear-gradient(135deg, #e87722, #302569)",
              }}
            >
              <div>
                <p className="eyebrow !text-white/85">Continue where you left off</p>
                <h3 className="font-serif text-[26px] font-bold leading-tight mt-1.5 mb-1 break-words">
                  {latest.projectName || "(untitled)"}
                </h3>
                <p className="text-[13px] text-white/85">
                  {latest.clientName} · {latest.creativeTypeShort} · Saved {formatUpdatedAt(latest.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full grid place-items-center shrink-0"
                  style={{
                    background: `conic-gradient(#fff ${Math.round(((latest.step + 1) / latest.stepCount) * 100)}%, rgba(255,255,255,0.22) 0)`,
                  }}
                >
                  <span className="w-[50px] h-[50px] rounded-full bg-[rgba(48,37,105,0.55)] grid place-items-center font-serif font-bold text-sm tabular-nums">
                    {latest.step + 1}/{latest.stepCount}
                  </span>
                </div>
                <div>
                  <p className="text-[13px] text-white/85">Next up</p>
                  <p className="font-bold">{latest.stepLabel}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resumeDraft(latest)}
                    className="inline-flex items-center gap-2 rounded-full bg-white/95 text-[var(--indigo)] px-5 py-2.5 text-sm font-bold hover:bg-white"
                  >
                    Resume brief
                    <span className="w-[22px] h-[22px] rounded-full bg-[var(--indigo)] text-white grid place-items-center">→</span>
                  </button>
                  <button
                    onClick={() => removeDraft(latest.id)}
                    className="rounded-full px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/15"
                    title="Discard this draft"
                  >
                    Discard
                  </button>
                </div>
                {moreDrafts.length > 0 && (
                  <span className="text-xs text-white/85">
                    + {moreDrafts.length} more draft{moreDrafts.length > 1 ? "s" : ""} below
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[32px] p-6 grid content-center gap-2 min-h-[220px] bg-gradient-to-br from-white/70 to-[rgba(251,227,207,0.7)] border border-white/80">
              <p className="eyebrow">No drafts in progress</p>
              <h3 className="font-serif text-[26px] font-bold text-[var(--indigo)] leading-tight">Start a new brief</h3>
              <p className="text-[13px] text-[var(--muted)]">
                Pick a type below. Your progress saves automatically in this browser as you go.
              </p>
            </div>
          )}
        </div>

        {/* other drafts */}
        {moreDrafts.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h2 className="font-serif text-[22px] font-bold text-[var(--indigo)]">Other drafts in progress</h2>
              <small className="text-xs text-[var(--muted)]">Saved in this browser</small>
            </div>
            <div className="grid gap-2">
              {moreDrafts.map((d) => (
                <div key={d.id} className="flex items-center gap-3.5 rounded-[18px] bg-[var(--glass)] border border-white/80 px-3.5 py-3">
                  <span
                    className="w-[38px] h-[38px] rounded-xl grid place-items-center text-[13px] font-extrabold text-white shrink-0"
                    style={{ background: clientColor(d.clientId) }}
                  >
                    {clientShort(d.clientId, d.clientName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif font-bold text-[15px] text-[var(--indigo)] truncate">{d.projectName || "(untitled)"}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {d.creativeTypeShort} · Step {d.step + 1} of {d.stepCount}: {d.stepLabel} · Saved {formatUpdatedAt(d.updatedAt)}
                    </p>
                  </div>
                  <button onClick={() => resumeDraft(d)} className="text-[13px] font-bold text-[var(--indigo)] hover:text-[var(--brand-strong)] shrink-0">
                    Resume
                  </button>
                  <button
                    onClick={() => removeDraft(d.id)}
                    className="text-[var(--muted)] hover:text-red-500 text-xl leading-none shrink-0 px-1"
                    title="Discard this draft"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* what are you briefing */}
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
            <h2 className="font-serif text-[22px] font-bold text-[var(--indigo)]">What are you briefing?</h2>
            <small className="text-xs text-[var(--muted)]">Pick a category, then a type. Each opens only the sections it needs.</small>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ARCHETYPE_ORDER.map((arch, i) => {
              const on = arch === archetype;
              return (
                <button
                  key={arch}
                  onClick={() => setArchetype(arch)}
                  aria-pressed={on}
                  className={
                    "glass rounded-3xl px-3.5 py-4 grid gap-3 justify-items-start text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-16px_rgba(48,37,105,0.35)] " +
                    (on ? "outline outline-2 -outline-offset-2 outline-[var(--brand)]" : "")
                  }
                >
                  <span
                    className={
                      "w-11 h-11 rounded-[14px] grid place-items-center shadow-[inset_0_1px_0_#fff,0_6px_14px_-8px_rgba(232,119,34,0.6)] " +
                      (i % 2 === 0
                        ? "bg-gradient-to-br from-white to-[var(--brand-soft)] text-[var(--brand-strong)]"
                        : "bg-gradient-to-br from-white to-[var(--lilac)] text-[var(--indigo)]")
                    }
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {ARCHETYPE_ICON[arch]}
                    </svg>
                  </span>
                  <span className="font-serif font-bold text-base text-[var(--indigo)] leading-tight">{ARCHETYPE_LABELS[arch]}</span>
                  <span className="text-xs text-[var(--muted)] leading-snug -mt-1.5">{ARCHETYPE_SUB[arch]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4" aria-label={`${ARCHETYPE_LABELS[archetype]} types`}>
            {!archLive && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                Coming soon
              </span>
            )}
            {archTypes.map((t) => (
              <button
                key={t.id}
                disabled={!archLive}
                onClick={() => archLive && openType(t.id)}
                className={
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition " +
                  (archLive
                    ? "bg-[var(--glass-strong)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--brand)] hover:bg-white"
                    : "border-dashed border-[var(--border)] bg-white/40 text-gray-400 cursor-not-allowed")
                }
              >
                <span className="inline-block w-[7px] h-[7px] rounded-full" style={{ background: GROUP_COLOR[t.group] }} />
                {t.short}
              </button>
            ))}
          </div>
        </div>

        {/* recent briefs */}
        {history.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h2 className="font-serif text-[22px] font-bold text-[var(--indigo)]">Recent briefs</h2>
              <small className="text-xs text-[var(--muted)]">Generated or saved to Drive</small>
            </div>
            <div className="grid gap-2">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3.5 rounded-[18px] bg-[var(--glass)] border border-white/80 px-3.5 py-3">
                  <span
                    className="w-[38px] h-[38px] rounded-xl grid place-items-center text-[13px] font-extrabold text-white shrink-0"
                    style={{ background: clientColor(entry.clientId) }}
                  >
                    {clientShort(entry.clientId, entry.clientName)}
                  </span>
                  <button onClick={() => loadEntry(entry)} className="min-w-0 flex-1 text-left group">
                    <p className="font-serif font-bold text-[15px] text-[var(--indigo)] truncate group-hover:text-[var(--brand-strong)] transition-colors">
                      {entry.projectName || "(untitled)"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {entry.clientName} · {entry.creativeTypeShort} · {formatSavedAt(entry.savedAt)}
                    </p>
                  </button>
                  <button onClick={() => loadEntry(entry)} className="text-[13px] font-bold text-[var(--indigo)] hover:text-[var(--brand-strong)] shrink-0">
                    Open
                  </button>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-[var(--muted)] hover:text-red-500 text-xl leading-none shrink-0 px-1"
                    title="Remove from history"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
