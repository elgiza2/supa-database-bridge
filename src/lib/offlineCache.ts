/** @doc Per-account localStorage cache for instant app open (stale-while-revalidate).
 *  Keys use the `megsy_cache_` prefix so App's clearUserCaches wipes them on sign-out
 *  or account switch. Entries are owner-bound, versioned and size-capped. */
const PREFIX = "megsy_cache_v1:";
const MAX_BYTES = 400 * 1024;

export function cachedOwner(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem("megsy_last_user_id"); } catch { return null; }
}

export function readCache<T>(key: string, owner = cachedOwner()): T | null {
  if (!owner || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + owner + ":" + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { o: string; v: T };
    return parsed && parsed.o === owner ? parsed.v : null;
  } catch { return null; }
}

export function writeCache(key: string, value: unknown, owner = cachedOwner()): void {
  if (!owner || typeof window === "undefined") return;
  try {
    const raw = JSON.stringify({ o: owner, v: value });
    if (raw.length > MAX_BYTES) return;
    localStorage.setItem(PREFIX + owner + ":" + key, raw);
  } catch {
    /* quota full: caching is best-effort */
  }
}
