"use client";

import React, { useState, useEffect } from "react";
import { CLIENTS } from "@/lib/clients";
import { CREATIVE_TYPES, ARCHETYPE_LABELS, LIVE_ARCHETYPES } from "@/lib/creativeTypes";
import type { Archetype, BriefData } from "@/lib/types";
import { Card, Select, Label, Logo } from "./ui";
import Wizard from "./Wizard";
import { loadHistory, deleteFromHistory, formatSavedAt, type HistoryEntry } from "@/lib/brief-history";

const GROUP_COLOR: Record<string, string> = {
  "D&CP": "#30a46c",
  DM: "#0091ff",
};

const ARCHETYPE_ORDER: Archetype[] = ["key-visual", "collateral", "ad", "social", "strategy"];

export default function BriefApp() {
  const [clientId, setClientId] = useState(CLIENTS[0]?.id ?? "");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [initialBrief, setInitialBrief] = useState<BriefData | undefined>(undefined);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const client = CLIENTS.find((c) => c.id === clientId);
  const creativeType = CREATIVE_TYPES.find((t) => t.id === typeId);

  function loadEntry(entry: HistoryEntry) {
    setClientId(entry.clientId);
    setTypeId(entry.creativeTypeId);
    setInitialBrief(entry.brief);
  }

  function removeEntry(id: string) {
    deleteFromHistory(id);
    setHistory(loadHistory());
  }

  if (client && creativeType) {
    return (
      <Wizard
        client={client}
        creativeType={creativeType}
        onBack={() => {
          setTypeId(null);
          setInitialBrief(undefined);
          setHistory(loadHistory());
        }}
        initialBrief={initialBrief}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-text mb-2">
            Latinovation · Creative Briefs
          </p>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-brand leading-tight">Brief Builder</h1>
          <div className="w-12 h-[3px] bg-accent mt-3" />
          <p className="text-gray-500 mt-3 max-w-xl">
            Build a clear, on-brand creative brief in minutes. Pick the client and what you&apos;re briefing.
          </p>
        </div>
        <Logo className="mt-1 shrink-0" />
      </header>

      <Card className="p-6 mb-8 max-w-sm">
        <Label hint="Brand rules and campaigns load from this client.">Client</Label>
        <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {CLIENTS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Card>

      <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-text mb-3">What are you briefing?</h2>

      <div className="space-y-6">
        {ARCHETYPE_ORDER.map((arch) => {
          const types = CREATIVE_TYPES.filter((t) => t.archetype === arch);
          if (!types.length) return null;
          const live = LIVE_ARCHETYPES.has(arch);
          return (
            <div key={arch}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-[#1a1d26]">{ARCHETYPE_LABELS[arch]}</h3>
                {!live && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    Coming soon
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {types.map((t) => (
                  <button
                    key={t.id}
                    disabled={!live}
                    onClick={() => live && setTypeId(t.id)}
                    className={
                      "text-left rounded-lg border px-3 py-2.5 text-sm transition " +
                      (live
                        ? "border-[var(--border)] bg-white hover:border-[var(--brand)] hover:shadow-sm cursor-pointer"
                        : "border-dashed border-[var(--border)] bg-gray-50 text-gray-400 cursor-not-allowed")
                    }
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: GROUP_COLOR[t.group] }} />
                      {t.short}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-text mb-3">Recent Briefs</h2>
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-white px-4 py-3 gap-4"
              >
                <button
                  onClick={() => loadEntry(entry)}
                  className="flex-1 text-left group"
                >
                  <p className="text-sm font-semibold text-[#1a1d26] group-hover:text-[var(--brand)] transition-colors">
                    {entry.projectName || "(untitled)"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {entry.clientName} · {entry.creativeTypeShort} · {formatSavedAt(entry.savedAt)}
                  </p>
                </button>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                  title="Remove from history"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-10">
        Every type opens with only the sections it needs. Key Visual is the most polished; the rest refine as we go.
      </p>
    </div>
  );
}
