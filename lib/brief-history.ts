import type { BriefData } from "./types";

const KEY = "bb:history";
const MAX = 20;

export interface HistoryEntry {
  id: string;
  savedAt: string;
  clientId: string;
  clientName: string;
  creativeTypeId: string;
  creativeTypeShort: string;
  projectName: string;
  brief: BriefData;
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, "id" | "savedAt">): void {
  if (typeof window === "undefined") return;
  const id = String(Date.now());
  const next: HistoryEntry = { id, savedAt: new Date().toISOString(), ...entry };
  const existing = loadHistory().filter(
    (e) => !(e.clientId === entry.clientId && e.projectName === entry.projectName && e.creativeTypeId === entry.creativeTypeId)
  );
  localStorage.setItem(KEY, JSON.stringify([next, ...existing].slice(0, MAX)));
}

export function deleteFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(loadHistory().filter((e) => e.id !== id)));
}

export function formatSavedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
