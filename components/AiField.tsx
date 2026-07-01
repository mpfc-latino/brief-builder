"use client";

import React, { useState } from "react";
import { Label, TextArea, Button } from "./ui";

interface AiFieldProps {
  label: string;
  hint?: string;
  section: "objective" | "concept" | "notes" | "direction" | "insight" | "mood";
  value: string;
  onChange: (v: string) => void;
  // context for the AI draft
  clientName: string;
  creativeTypeName: string;
  brandContext: string;
  /** The rest of the brief filled so far, so drafts stay coherent + on-brief. */
  context?: Record<string, string | undefined>;
  rows?: number;
}

export default function AiField({
  label,
  hint,
  section,
  value,
  onChange,
  clientName,
  creativeTypeName,
  brandContext,
  context,
  rows = 5,
}: AiFieldProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  async function draft() {
    setLoading(true);
    setWarning(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "draft",
          section,
          clientName,
          creativeTypeName,
          brandContext,
          notes: notes || value,
          brief: context ?? {},
        }),
      });
      const data = await res.json();
      if (data.text) onChange(data.text);
      if (data.source === "fallback") {
        setWarning(
          data.warning
            ? `AI unavailable (${data.warning}). Assembled a draft from your notes.`
            : "No API key set yet — assembled a draft from your notes. Live AI writing turns on once the key is added."
        );
      }
    } catch {
      setWarning("Could not reach the AI service. You can still write this section manually.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Label hint={hint}>{label}</Label>

      <div className="rounded-lg border border-dashed border-[var(--border)] bg-gray-50 p-3 mb-2">
        <p className="text-xs font-semibold text-gray-600 mb-1.5">
          Jot a few notes / bullets, then let AI write the section:
        </p>
        <TextArea
          rows={3}
          placeholder="e.g. cornerstone visual for June eBlasts + website; must feel Italian and romantic; distinct from Viva Italia…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-2">
          <Button type="button" onClick={draft} disabled={loading}>
            {loading ? "Writing…" : "✦ Draft with AI"}
          </Button>
          <span className="text-xs text-gray-500">Edit the result below — it&apos;s yours to refine.</span>
        </div>
      </div>

      <TextArea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={`${label} text…`} />
      {warning && <p className="text-xs text-amber-600 mt-1">{warning}</p>}
    </div>
  );
}
