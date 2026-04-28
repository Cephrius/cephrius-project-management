"use client";

/**
 * Persistent dismissal of combobox suggestions (job titles, prices, superintendents)
 * scoped per company. Suggestions are derived from existing job rows in Supabase, so
 * "deleting" one only makes sense as a per-user hide. We store the dismissed ids in
 * localStorage keyed by company + field so the user's choice survives across projects,
 * dialogs, and reloads on the same device.
 */

const STORAGE_PREFIX = "jobsyte:dismissed-suggestions";

export type DismissField = "job-title" | "job-price" | "job-superintendent";

function storageKey(companyId: string, field: DismissField) {
  return `${STORAGE_PREFIX}:${companyId}:${field}`;
}

function safeRead(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function safeWrite(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // ignore quota / privacy mode failures
  }
}

export function getDismissedIds(
  companyId: string | null,
  field: DismissField,
): Set<string> {
  if (!companyId) return new Set();
  return new Set(safeRead(storageKey(companyId, field)));
}

export function addDismissedId(
  companyId: string | null,
  field: DismissField,
  id: string,
) {
  if (!companyId) return;
  const key = storageKey(companyId, field);
  const next = safeRead(key);
  if (!next.includes(id)) next.push(id);
  safeWrite(key, next);
}

export function removeDismissedId(
  companyId: string | null,
  field: DismissField,
  id: string,
) {
  if (!companyId) return;
  const key = storageKey(companyId, field);
  const next = safeRead(key).filter((entry) => entry !== id);
  safeWrite(key, next);
}
