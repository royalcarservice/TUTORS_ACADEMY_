/* ════════════════════════════════════════════════════════════════════════
   MILESTONE SYNTHESIS — the pure composition (Phase 8 · Step 4, DEC-032)

   The chronology that joins WHAT HAPPENED to WHAT IT LEFT BEHIND:
   a progress fact (a session attended) evidences a step of the arc, and
   the artifacts preserved from that very session substantiate the entry —
   the board as it stood, the tutor's notation, the chamber's audio.

   The record-not-score model governs completely (P5-R6, PROGRESS_LANGUAGE):
   an entry is a dated fact pointing at real rows — never a number, a
   ratio, a badge or a rank. Every entry carries `sources` (the event ids
   behind it); nothing here can emit a figure that cannot name its rows.

   THE MILESTONE WORD, scoped by ruling (DEC-032): the owner's Step 4 brief
   admits "milestone" in the CHRONOLOGICAL sense only — a named stage of
   the arc, evidenced by admissible events, substantiated by artifacts.
   The reward register stays banned everywhere: no badge, no XP, no level,
   no unlock, no congratulations. The sweeps pin both halves.

   PURE: no clock reads, no database, no react. The server fetcher in
   src/lib/progress/data.ts supplies the rows; this module composes them,
   exactly as derive.ts composes the arc. Not exported from the module
   barrel, by design (the record.ts precedent): test-progress pins the 5.6
   export surface, and this file must not widen it. Import as
   `@/lib/progress/synthesis`.
   ════════════════════════════════════════════════════════════════════════ */

import { ARTIFACT_WORD, isArtifactType, type ArtifactType } from "@/lib/archive/artifact";
import { ARC_STEPS, type ArcStepId } from "@/config/arc";
import type { SubjectId } from "@/lib/student/contract";

import { admissibleKinds, STEP_EVIDENCE, validateEvents } from "./derive";
import type { ProgressEvent, ProgressEventKind } from "./events";

/** One artifact fact as the synthesis reads it. */
export interface ArtifactFact {
  id: string;
  type: string;
  /** Machine facts only — the notation's text lives in `summary`. */
  metadata: Readonly<Record<string, unknown>>;
  createdAt: string;
}

/** One session's preserved facts, as the fetcher hands them over. */
export interface SessionFact {
  sessionId: string;
  /** The session's own title — null when the boundary withholds it. */
  title: string | null;
  artifacts: readonly ArtifactFact[];
}

/** One artifact standing in the chronology. */
export interface SynthesizedArtifact {
  id: string;
  type: ArtifactType;
  /** The archive's own word for the kind. */
  word: string;
  createdAt: string;
}

/** ONE milestone entry — a dated fact, substantiated, traceable. */
export interface MilestoneEntry {
  /** The arc step this fact evidences — validated against STEP_EVIDENCE. */
  milestoneKey: ArcStepId;
  /** The arc step's own label — the visitor language of src/config/arc. */
  stepLabel: string;
  /** The fact's own timestamp — when it really happened. */
  achievedAt: string;
  /** The session's title, when the boundary allows it. */
  sessionTitle: string | null;
  /** The tutor's pedagogical notation for the session, when preserved. */
  notes: string | null;
  /** The session's artifacts that substantiate the entry. */
  artifacts: SynthesizedArtifact[];
  /** The event ids behind the entry — count === sources.length, always. */
  sources: string[];
}

/**
 * The arc step a kind evidences — the FIRST step whose evidence rule names
 * it, in the arc's own order (STEP_EVIDENCE's words, never a second rule).
 * Kinds no rule names return null: they stand in the record, but no stage
 * of the arc claims them yet.
 */
export function milestoneKeyOf(kind: ProgressEventKind): { key: ArcStepId; label: string } | null {
  for (const step of ARC_STEPS) {
    const kinds = STEP_EVIDENCE[step.id];
    if (kinds && kinds.includes(kind)) return { key: step.id, label: step.label };
  }
  return null;
}

/** The notation's text, when the metadata carries a readable one. */
function notesOf(artifacts: readonly ArtifactFact[]): string | null {
  for (const a of artifacts) {
    if (a.type !== "pedagogical_notes") continue;
    const v = a.metadata["summary"];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return null;
}

/** One session's artifacts, classified — unknown kinds are dropped, never guessed. */
function artifactsOf(fact: SessionFact): SynthesizedArtifact[] {
  return fact.artifacts
    .filter((a) => isArtifactType(a.type))
    .map((a) => ({ id: a.id, type: a.type as ArtifactType, word: ARTIFACT_WORD[a.type as ArtifactType], createdAt: a.createdAt }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

/**
 * THE COMPOSITION — events + preserved session facts → the chronology.
 * Rules, all declared:
 *   · malformed events are defects, excluded, never repaired (5.6);
 *   · only ADMISSIBLE kinds enter — the registry gate, exactly as the arc's
 *     (a kind may be spoken of only while the module owning its referent is
 *     live);
 *   · one entry per FACT, oldest first — the record reads as it happened,
 *     ties settled by id, deterministically;
 *   · a fact whose session the boundary withholds still stands: title null,
 *     artifacts absent — the event is real even when its room is not
 *     readable;
 *   · nothing is counted, combined, rated or forecast. The chronology IS
 *     the answer.
 */
export function composeMilestoneRecord(
  events: readonly ProgressEvent[],
  subjectId: SubjectId,
  liveModules: readonly string[],
  sessions: readonly SessionFact[],
): MilestoneEntry[] {
  const ok = new Set(admissibleKinds(liveModules));
  const bySession = new Map(sessions.map((s) => [s.sessionId, s]));
  const mine = validateEvents(events).valid.filter((e) => e.subjectId === subjectId && ok.has(e.kind));
  const ordered = mine.slice().sort((a, b) => Date.parse(a.at) - Date.parse(b.at) || a.id.localeCompare(b.id));

  const entries: MilestoneEntry[] = [];
  for (const e of ordered) {
    const evidenced = milestoneKeyOf(e.kind);
    if (!evidenced) continue; // a kind no arc rule claims is a fact, not a stage
    const fact = bySession.get(e.refId);
    entries.push({
      milestoneKey: evidenced.key,
      stepLabel: evidenced.label,
      achievedAt: e.at,
      sessionTitle: fact ? fact.title : null,
      notes: fact ? notesOf(fact.artifacts) : null,
      artifacts: fact ? artifactsOf(fact) : [],
      sources: [e.id],
    });
  }
  return entries;
}
