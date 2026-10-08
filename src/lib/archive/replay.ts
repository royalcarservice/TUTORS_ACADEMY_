/**
 * ARCHIVE REPLAY — pure playback mathematics (Phase 8 · Step 3, DEC-031).
 *
 * The deterministic heart of the vector replay engine and the media player,
 * written with NO DOM and NO timers so the rules can be proven offline
 * (scripts/test-archive-logic.mjs) and never drift between the two surfaces:
 *
 *   · replayFrame — given the strokes a session left behind and a scrub
 *     position 0..1, exactly which points stand on the board;
 *   · formatTime — the MM:SS clock the scrubber speaks;
 *   · PLAYBACK_SPEEDS — the restrained speed set (1.0 · 1.25 · 1.5), never a
 *     chipmunk pitch;
 *   · clamp01 — the scrubber never runs past either end.
 *
 * The components (canvas-replay.tsx, media-player.tsx) own the clock and the
 * pixels; this file owns the arithmetic.
 */

import type { SurfacePoint } from "@/lib/livekit/surface-sync";

/** The restrained playback speeds — 1.0 · 1.25 · 1.5, nothing higher. */
export const PLAYBACK_SPEEDS = [1, 1.25, 1.5] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/** Clamp a scrub position to [0, 1]. NaN lands on 0 — never a guess. */
export function clamp01(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.min(1, Math.max(0, p));
}

/** Total points across every stroke — the replay's unit of time. */
export function totalPoints(strokes: readonly (readonly SurfacePoint[])[]): number {
  let n = 0;
  for (const s of strokes) n += s.length;
  return n;
}

/**
 * The board at a scrub position. Strokes strictly before the budget stand in
 * full; ONE stroke may be mid-construction (its first k points); strokes after
 * it have not happened yet. progress ≥ 1 stands the whole board; ≤ 0 is blank.
 * Pure: same strokes + same progress, same frame, every time.
 */
export function replayFrame(
  strokes: readonly (readonly SurfacePoint[])[],
  progress: number,
): (readonly SurfacePoint[])[] {
  const p = clamp01(progress);
  const total = totalPoints(strokes);
  if (total === 0) return strokes.map((s) => s);
  if (p >= 1) return strokes.map((s) => s);
  if (p <= 0) return [];
  let budget = Math.floor(p * total);
  const frame: (readonly SurfacePoint[])[] = [];
  for (const s of strokes) {
    if (budget <= 0) break;
    if (s.length <= budget) {
      frame.push(s);
      budget -= s.length;
    } else {
      frame.push(s.slice(0, budget));
      budget = 0;
    }
  }
  return frame;
}

/**
 * MM:SS — the scrubber's clock. Minutes are not capped at 59 (a long session
 * reads 74:03, honestly); seconds are zero-padded; a non-finite input reads
 * 0:00 rather than a wrong number.
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
