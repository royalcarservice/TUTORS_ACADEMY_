/**
 * PARTICIPANT MEDIA STATE — Phase 7 · Step 3 (pure).
 *
 * The state machine behind the live chamber's participant interface, kept
 * pure so its honesty can be tested: NOTHING is captured on load (every flag
 * starts off — privacy is the initial state, not a setting), a denial is a
 * STATE with a calm sentence (STATE_LANGUAGE's subject rule: the browser is
 * the agent, never the person), and leaving the chamber turns everything off.
 *
 * Zero surveillance by construction: nothing here measures time present,
 * counts anything, or persists anything. The speaking level is transient UI
 * state on the participant's OWN, opted-in microphone — never recorded,
 * never transmitted, dead when the tab closes (DEC-024).
 */

export interface MediaFlags {
  mic: boolean;
  camera: boolean;
  share: boolean;
}

/** The initial state is privacy: every device off, nothing requested yet. */
export function initialMediaFlags(): MediaFlags {
  return { mic: false, camera: false, share: false };
}

export type MediaAction =
  | { type: "mic"; on: boolean }
  | { type: "camera"; on: boolean }
  | { type: "share"; on: boolean }
  | { type: "leave" };

/** Pure transition: one action, the next flags. Leaving silences everything. */
export function nextMediaFlags(flags: MediaFlags, action: MediaAction): MediaFlags {
  switch (action.type) {
    case "mic": return { ...flags, mic: action.on };
    case "camera": return { ...flags, camera: action.on };
    case "share": return { ...flags, share: action.on };
    case "leave": return initialMediaFlags();
  }
}

/** What the browser was asked for, derived from the flags (never the reverse). */
export function constraintsFor(flags: MediaFlags): { audio: boolean; video: boolean } | null {
  if (!flags.mic && !flags.camera) return null;   // nothing requested — no capture call at all
  return { audio: flags.mic, video: flags.camera };
}

/** Why the devices could not be reached — two different truths, two sentences. */
export type MediaBlock =
  | { kind: "denied" }      // the browser (or the person, through it) did not grant access
  | { kind: "unavailable" } // no such device exists on this machine
  | null;

/** Map the browser's error NAMES to our two truths. Classes, never messages.
 *  Always answers with a block — `null` belongs to the STATE (no block), and
 *  this function is only ever asked after an error actually happened. */
export function blockForError(name: string): Exclude<MediaBlock, null> {
  if (name === "NotAllowedError" || name === "SecurityError") return { kind: "denied" };
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "NotReadableError") return { kind: "unavailable" };
  return { kind: "denied" }; // unknown cause → the calmer of the two frames; the class goes to the log, not the screen
}

/**
 * THE STATE SENTENCES (STATE_LANGUAGE register — a state, not a verdict; the
 * product or the browser is the subject; no exclamation marks, no red, no
 * banner). The denied sentence is the Phase 7 · Step 3 brief's, verbatim.
 */
export const MEDIA_STATE_SENTENCE = {
  denied:
    "Media access was not granted by your browser. You can still listen and participate via text or enable permissions in your browser settings.",
  unavailable:
    "No camera or microphone was found on this device. The session can still be joined with what is available.",
} as const;

/** The academic display label: the name as given; tutors are named as tutors. */
export function participantLabel(displayName: string, role: "student" | "tutor"): string {
  const name = displayName.trim();
  if (!name) return role === "tutor" ? "Tutor" : "Participant";
  return role === "tutor" ? `${name} (Tutor)` : name;
}

/**
 * The dignified monogram for a camera-off tile: the first letters of the
 * first two words, uppercased. An empty name has no monogram — the tile
 * shows the subject's mark instead (handled by the tile, not invented here).
 */
export function monogramFor(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const second = words.length > 1 ? words[1][0] ?? "" : "";
  return (first + second).toUpperCase();
}

/** Speaking detection with hysteresis — a pure decision over one RMS sample. */
export function speakingNext(rms: number, current: boolean): boolean {
  if (rms > 0.07) return true;
  if (rms < 0.035) return false;
  return current; // inside the band: hold — no flicker
}
