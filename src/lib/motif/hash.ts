/* ════════════════════════════════════════════════════════════════════════
   DETERMINISM — seed, hash, PRNG (Phase 3 · Step 3)

   SEED RULE (stated, not implied):
     seed string = `<subject.id>:<purpose>:<compositionIndex>`
     hash        = FNV-1a, 32-bit, over the UTF-16 code units of that string
     stream      = mulberry32 seeded with that hash
   Rebuilds are therefore byte-identical on server and client, in any order,
   in any environment.

   FORBIDDEN, and grepped in CI-style checks for this step:
     Math.random · Date.* · performance.now · process.hrtime · any unordered
     iteration (Object.keys / for..in / Set / Map) inside generation.
   This file is the ONLY source of "randomness", and it is not random.
   ════════════════════════════════════════════════════════════════════════ */

/** FNV-1a, 32-bit. Chosen: no dependencies, no floats, identical everywhere. */
export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** mulberry32 — tiny, fast, uniform enough for structure, fully seeded. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rand = () => number;

/** THE seed rule, in one place. */
export function makeSeed(subject: string, purpose: string, index: number): string {
  return `${subject}:${purpose}:${index}`;
}

/** Deterministic stream for a seed string. */
export function streamFromSeed(seed: string): Rand {
  return mulberry32(fnv1a32(seed));
}

/** 8-char hex fingerprint — used as the visible determinism proof. */
export function fingerprint(seed: string): string {
  return fnv1a32(seed).toString(16).padStart(8, "0");
}

/* ── bounded draws (all deterministic, all inclusive/exclusive as noted) ── */

/** Uniform in [a, b). */
export const between = (r: Rand, a: number, b: number) => a + (b - a) * r();
/** Uniform integer in [a, b] (inclusive). */
export const intBetween = (r: Rand, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
/** Pick by index — never `Math.random`, never object ordering. */
export function pick<T>(r: Rand, items: readonly T[]): T {
  return items[Math.min(items.length - 1, Math.floor(r() * items.length))];
}
/** Fisher-Yates over an explicit array (deterministic; arrays only). */
export function shuffled<T>(r: Rand, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
/** Signed coin: -1 or +1. */
export const sign = (r: Rand) => (r() < 0.5 ? -1 : 1);
