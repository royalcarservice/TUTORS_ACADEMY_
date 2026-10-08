/* ════════════════════════════════════════════════════════════════════════
   THE RATE LIMITER — in-memory sliding window, zero dependencies
   (Phase 10 · Step 3, DEC-039)

   The sensitive routes (/login, /register, /auth/verify-guardian) are
   limited by a sliding window keyed on a ONE-WAY SHA-256 hash of the
   connecting address — the raw address never becomes a map key, the same
   posture as the consent audit. The window slides: an attempt expires
   exactly windowMs after it was made; the (limit+1)th attempt inside the
   window is refused with one calm sentence and a Retry-After.

   DECLARED PROPERTIES (DEC-039):
   · In-memory, per process — a restart resets the windows, and a
     multi-instance deployment limits per instance. The brief asks for
     exactly this shape (lightweight, zero-dependency); a shared store is
     the owed upgrade if the deployment grows.
   · The key hashes `${bucket}:${addressSource}` — hashes do not cross
     buckets, and the bucket prefix means one address's login attempts
     never spend its register budget.
   · The store is capped: beyond MAX_KEYS the whole map is dropped. A
     blunt eviction, honestly declared — losing window state under key
     flood is the lesser harm against an unbounded map.
   · WHICH ATTEMPTS COUNT: writes only, where counting matters — POSTs to
     /login and /register (server-action submissions), and GETs to
     /auth/verify-guardian (each one redeems a token). Page reads are
     never limited.
   ════════════════════════════════════════════════════════════════════════ */

import { createHash } from "node:crypto";

import { NO_ADDRESS_SOURCE } from "@/lib/legal/consent";

/** The closed sentence a limited route speaks (STATE_LANGUAGE 10.3 pins
 *  it verbatim). Calm, non-punitive — no accusation, no count disclosed. */
export const SECURITY_COPY = {
  rateLimited:
    "Too many attempts have been made recently. Please wait a few moments before trying again.",
} as const;

export interface RateLimitRule {
  /** Attempts admitted inside one sliding window. */
  limit: number;
  windowMs: number;
}

/** The brief's thresholds, pinned by test. */
export const RATE_LIMIT_RULES = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 },
  register: { limit: 3, windowMs: 60 * 60 * 1000 },
  verifyGuardian: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitBucket = keyof typeof RATE_LIMIT_RULES;

/** Which bucket a request counts against — or null (never limited). */
export function bucketFor(method: string, pathname: string): RateLimitBucket | null {
  if (method === "POST") {
    if (pathname === "/login") return "login";
    if (pathname === "/register") return "register";
  }
  if (method === "GET" && pathname === "/auth/verify-guardian") return "verifyGuardian";
  return null;
}

/** One-way key: the address never becomes a map key. */
export function rateLimitKeyFor(bucket: RateLimitBucket, addressSource: string): string {
  return createHash("sha256").update(`${bucket}:${addressSource}`, "utf8").digest("hex");
}

/** The pure sliding-window judgement: `entries` are the attempt instants
 *  still inside the window (caller passes them in any order). Returns
 *  whether one more attempt is admitted, and how long to wait if not. */
export function slidingWindowCheck(
  entries: readonly number[],
  now: number,
  rule: RateLimitRule,
): { allowed: boolean; retryAfterMs: number } {
  const windowStart = now - rule.windowMs;
  const live = entries.filter((t) => t > windowStart);
  if (live.length >= rule.limit) {
    // The oldest live attempt expires first — wait exactly that long.
    const oldest = Math.min(...live);
    return { allowed: false, retryAfterMs: oldest + rule.windowMs - now };
  }
  return { allowed: true, retryAfterMs: 0 };
}

/* ── the store ───────────────────────────────────────────────────────────── */

const MAX_KEYS = 20_000;
const store = new Map<string, number[]>();

/** The store-backed attempt. Mutates the window only when the attempt is
 *  admitted — a refused attempt does not extend the refusal. */
export function attemptRateLimited(
  bucket: RateLimitBucket,
  addressSource: string,
  now: number = Date.now(),
): { allowed: boolean; retryAfterMs: number } {
  const rule = RATE_LIMIT_RULES[bucket];
  const key = rateLimitKeyFor(bucket, addressSource);
  const windowStart = now - rule.windowMs;
  const entries = (store.get(key) ?? []).filter((t) => t > windowStart);

  const judgement = slidingWindowCheck(entries, now, rule);
  if (!judgement.allowed) return judgement;

  entries.push(now);
  if (store.size >= MAX_KEYS && !store.has(key)) store.clear(); // blunt cap, declared
  store.set(key, entries);
  return judgement;
}

/** Test-only: empty every window. Never called from the app. */
export function resetRateLimitStore(): void {
  store.clear();
}

/** The address source for a request's headers — the consent audit's own
 *  helper, so the two mechanisms never disagree about what an address is. */
export function addressSourceOf(headers: Headers): string {
  const first = (headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim();
  if (first) return first;
  const real = (headers.get("x-real-ip") ?? "").trim();
  if (real) return real;
  return NO_ADDRESS_SOURCE;
}
