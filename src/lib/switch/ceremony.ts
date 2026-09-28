/* ════════════════════════════════════════════════════════════════════════
   CEREMONY RATIONING — across the session, not just per view (Step 4, #4)

   · FIRST ENTRY into a subject this session  → the FULL arrival.
   · SUBSEQUENT SWITCHES                      → a SHORTENED variant.
   · RAPID REPEAT SWITCHING                   → the SHORTEST form.

   A student comparing subjects must never sit through the ceremony repeatedly.
   Tracked per session; the rule lives HERE, in code, and is documented below.
   ════════════════════════════════════════════════════════════════════════ */

export type Ceremony = "full" | "shortened" | "shortest";

/** Window in which ≥2 switches counts as "rapid repeat". */
export const RAPID_WINDOW_MS = 1500;

export interface CeremonySession {
  /** subject ids entered at least once this session */
  entered: Set<string>;
  /** timestamps of recent triggers (ms epoch), pruned */
  recent: number[];
}

export const createSession = (): CeremonySession => ({ entered: new Set(), recent: [] });

/**
 * THE RULE (implemented):
 *  1. rapid  — ≥2 triggers inside RAPID_WINDOW_MS  → "shortest"
 *  2. first  — subject never entered this session  → "full"
 *  3. else   — re-entry / subsequent switch        → "shortened"
 * The tier (device/degradation) then caps the ceremony: a "full" ceremony on a
 * reduced device is still rendered at that device's tier (see tier.ts).
 */
export function ceremonyFor(session: CeremonySession, subjectId: string, now: number): Ceremony {
  session.recent = session.recent.filter((t) => now - t < RAPID_WINDOW_MS);
  const rapid = session.recent.length >= 2; // two prior triggers inside the window
  const first = !session.entered.has(subjectId);
  session.recent.push(now);
  session.entered.add(subjectId);
  if (rapid) return "shortest";
  if (first) return "full";
  return "shortened";
}

/** Fraction of the tier plan each ceremony uses (shortened < full). */
export const CEREMONY_SCALE: Record<Ceremony, number> = {
  full: 1,
  shortened: 0.6,
  shortest: 0, // shortest collapses to INSTANT regardless of tier
};
