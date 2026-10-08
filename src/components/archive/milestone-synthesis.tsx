import Link from "next/link";

import { SubjectMark } from "@/components/brand/subject-mark";

import type { MilestoneEntry } from "@/lib/progress/synthesis";

/* ════════════════════════════════════════════════════════════════════════
   THE MILESTONE SYNTHESIS VIEW — Phase 8 · Step 4 (DEC-032)

   The scholarly chronology: what a student reached in one subject, in the
   order it happened, each entry SUBSTANTIATED by what that very session
   left behind — the board as it stood, the tutor's notation, the chamber's
   audio. A record, never a score: no numeral is rendered here that is not
   a date; there is no bar, ring, percentage, badge, rank or count — the
   record-not-score model (P5-R6) shapes the timeline exactly as it shapes
   the table.

   THE REGISTER (the brief's, DEC-032): dignified chronology words —
   "Milestone Reached", "Conceptual Arc", "Substantiated by {Board Record
   | Session Notation | Chamber Audio}". BANNED and swept: the whole reward
   register — "Badge Unlocked", "XP Gained", "Level Up", and every word
   PROGRESS_LANGUAGE refuses beside a score.

   Server component, zero client JavaScript: the chronology is HTML and
   tokens. Each artifact line links to the subject archive, where the
   opener lifts the artifact into the viewer (DEC-031). Privacy rides the
   reads that fed the entries — RLS admitted the facts or there is nothing
   here at all: a student sees their own milestones; a tutor sees the
   milestones of the one relationship they stand in.
   ════════════════════════════════════════════════════════════════════════ */

/** The synthesis's own words — one constant, so the chronology cannot drift. */
export const MILESTONE_COPY = {
  eyebrow: "Conceptual Arc",
  studentHeading: (subjectName: string) => `Your Milestone Record in ${subjectName}`,
  tutorHeading: "Milestones co-certified",
  reached: "Milestone Reached",
  substantiatedBy: (word: string) => `Substantiated by ${word}`,
  notationEyebrow: "Session Notation",
  archiveLabel: (subjectName: string) => `the ${subjectName} archive`,
} as const;

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

/** The entry's own date — UTC, deterministic, the house precedent (when.ts, the shelf). */
function entryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export interface MilestoneSynthesisProps {
  subjectId: string;
  subjectName: string;
  /** The composed chronology — oldest first; the record reads as it happened. */
  entries: readonly MilestoneEntry[];
  viewer: "student" | "tutor";
}

export function MilestoneSynthesis({ subjectId, subjectName, entries, viewer }: MilestoneSynthesisProps) {
  if (entries.length === 0) return null; // the honest absence — no box, no heading, no "0"
  const heading = viewer === "student" ? MILESTONE_COPY.studentHeading(subjectName) : MILESTONE_COPY.tutorHeading;
  return (
    <section data-milestone-synthesis data-viewer={viewer} aria-label={heading} style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-4)" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-1)" }}>
        <p style={MONO}>{MILESTONE_COPY.eyebrow}</p>
        <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "var(--ta-space-3)", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500, lineHeight: 1.2, color: "var(--ta-text-primary)", textWrap: "balance" }}>
          <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }} aria-hidden>
            <SubjectMark subject={subjectId} size={24} />
          </span>
          {heading}
        </h2>
      </header>

      {/* THE CHRONOLOGY — an ordered list with a quiet rail: dated entries,
          oldest first, each substantiated by its session's preserved facts. */}
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 0 }}>
        {entries.map((entry) => (
          <li
            key={entry.sources[0]}
            data-milestone-entry
            data-milestone-key={entry.milestoneKey}
            style={{ borderLeft: "1px solid var(--ta-border-subtle)", marginLeft: "0.5rem", padding: "var(--ta-space-4) 0 var(--ta-space-4) var(--ta-space-5)", position: "relative", display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}
          >
            {/* the rail's node — the subject's mark beside the date */}
            <span aria-hidden style={{ position: "absolute", left: "-0.55rem", top: "var(--ta-space-5)", width: "1rem", height: "1rem", borderRadius: "50%", background: "var(--ta-surface-base)", border: "1px solid var(--ta-accent-1)" }} />
            <p style={{ ...MONO, display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "var(--ta-space-3)", rowGap: "var(--ta-space-1)" }}>
              <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }} aria-hidden>
                <SubjectMark subject={subjectId} size={16} />
              </span>
              {entryDate(entry.achievedAt)} · {entry.stepLabel}
            </p>
            <p style={{ margin: 0, fontSize: "var(--ta-text-md)", lineHeight: 1.5, color: "var(--ta-text-primary)" }}>
              <strong style={{ fontWeight: 500 }}>{MILESTONE_COPY.reached}</strong>
              {entry.sessionTitle ? ` — ${entry.sessionTitle}` : ""}
            </p>
            {entry.notes && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-1)", maxWidth: "var(--ta-measure)" }}>
                <p style={MONO}>{MILESTONE_COPY.notationEyebrow}</p>
                <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.6, color: "var(--ta-text-secondary)" }}>{entry.notes}</p>
              </div>
            )}
            {entry.artifacts.length > 0 && (
              <ul aria-label="Substantiating artifacts" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--ta-space-1)" }}>
                {entry.artifacts.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/subjects/${subjectId}/archive#artifact-${a.id}`}
                      data-milestone-artifact={a.type}
                      style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-primary)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}
                    >
                      {MILESTONE_COPY.substantiatedBy(a.word)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <p style={{ margin: 0 }}>
        <Link
          href={`/subjects/${subjectId}/archive`}
          data-milestone-archive-link
          style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-2) 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-primary)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}
        >
          Read the record in {MILESTONE_COPY.archiveLabel(subjectName)}
        </Link>
      </p>
    </section>
  );
}
