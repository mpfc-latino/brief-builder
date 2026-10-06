import type { BriefData } from "./types";

// Autosaved, unfinished briefs. Every edit in the wizard writes here (browser
// localStorage), so closing the tab or shutting down the computer loses nothing.
// A draft is removed once the brief is generated/saved — it then lives in
// "Recent Briefs" (lib/brief-history.ts). Per-browser only: not synced across devices.

const KEY = "bb:drafts";
const MAX = 15;

export interface DraftEntry {
  id: string;
  updatedAt: string;
  clientId: string;
  clientName: string;
  creativeTypeId: string;
  creativeTypeShort: string;
  projectName: string;
  step: number;
  stepCount: number;
  stepLabel: string;
  brief: BriefData;
}

export function newDraftId(): string {
  return `d${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

export function loadDrafts(): DraftEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]") as DraftEntry[];
    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

/** Insert or update a draft. Returns false if the browser refused the write. */
export function upsertDraft(entry: Omit<DraftEntry, "updatedAt">): boolean {
  if (typeof window === "undefined") return false;
  try {
    const next: DraftEntry = { ...entry, updatedAt: new Date().toISOString() };
    const rest = loadDrafts().filter((d) => d.id !== entry.id);
    localStorage.setItem(KEY, JSON.stringify([next, ...rest].slice(0, MAX)));
    return true;
  } catch {
    return false;
  }
}

export function deleteDraft(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(loadDrafts().filter((d) => d.id !== id)));
  } catch {
    /* storage unavailable — nothing to delete */
  }
}

export function formatUpdatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (sameDay) return `Today, ${time}`;
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
  } catch {
    return iso;
  }
}
