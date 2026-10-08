import Link from "next/link";

import { SubjectMark } from "@/components/brand/subject-mark";
import { Room } from "@/components/motif/stage";
import { ArcRegion } from "@/components/student/arc-region";
import type { ShellSubjectInfo } from "@/components/student/student-shell";
import { ROUTES } from "@/config/routes";
import type { RelationshipView } from "@/lib/tutor/relationship";

import { MONO } from "./tutor-shell";

/* ════════════════════════════════════════════════════════════════════════
   THE RELATIONSHIP'S SURFACE (Phase 6 · Step 3). One relationship; one
   addressable page. Pure render from the relationship reader's view.

   READING ORDER (the brief's, as built; DEC-035 amends it by adding ONE
   declared fill point — the oversight):
     1 WHO    — the display name (the one h1). Nothing else about the account.
     2 WHICH  — the subject's environment identity: mark · name · environment
                name · "Environment in draft" when the config says so (3.1).
     3 WHERE  — the arc: ARC_STEPS via arcPosition, the same definition as
                Scene 7 and the student's region (third consumer). No CTA, no
                interaction. Its heading says whose by saying WHAT: "Where
                the learning is" — the h1 already names the student, and
                position is a state of the learning, not of the person.
     4 RECORD — the region where learning events live (filled by the
                milestone synthesis, DEC-032). Renders NOTHING while absent.
     4b EXPLORATIONS — the diagnostic mirror (DEC-035): the student's
                inquiries to the study lens, grouped by milestone, each with
                the tutor's preparation mark. A DECLARED fill point — it
                renders ONLY when inquiries exist for this relationship;
                absent = no DOM (the slot contract's rule, carried).
     5 STATEMENTS — (a) the empty-record boundary — ARC_COPY.boundary,
                rendered by ArcRegion itself: ONE constant, so the sentence
                cannot vary by anything a student did; (b) what a tutor does
                here — a constant too.
     6 BACK   — one link to the shell.

   NOTHING ELSE. No avatar, card, chip, count, tab, export, comparison,
   other student, beacon. The two declared fill points (record,
   explorations) are the ONLY regions that may render data; the harness
   sweeps for the rest. (DEC-035 declared: the 6.3 pin set predates the
   fill points; the re-pin stands owed with the DEC-030 baseline debt.)
   ════════════════════════════════════════════════════════════════════════ */

const DRAFT_LABEL = "Environment in draft";

/** All authored copy, as data, so the dev page and the harness read the same bytes the surface renders. */
export const RELATIONSHIP_COPY = {
  /** h2 over the arc. Subject of the phrase: the learning. */
  arcHeading: "Where the learning is",
  /** aria-label of the list (the student's default says "Where you are in …"). */
  arcLabel: (subjectName: string) => `Where the learning is in ${subjectName}`,
  /** What a tutor does here, today — a fact, not an apology (P6-R4). Subject: this page.
   *  DEC-035 declared evolution: the oversight's preparation mark is the one
   *  thing a tutor may write here, so the sentence names the page's posture
   *  (reading + preparation) instead of claiming nothing is written. */
  tutorStatement: "This page reads the record and prepares the next dialogue. Nothing else is done here by a tutor yet: teaching surfaces are not built.",
  /** The way back. Subject: the list. */
  back: "Back to the students placed with you",
} as const;

export function RelationshipSurface({ view, subject, record, oversight }: { view: RelationshipView; subject: ShellSubjectInfo; record: React.ReactNode | null; oversight?: React.ReactNode | null }) {
  const name = view.displayName.trim();
  return (
    <article data-relationship-surface data-subject={view.subjectId} data-density="compact" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-8)" }}>
      {/* 1 WHO · 2 WHICH — inside the subject's Room so the tutor sees the environment the student is in. */}
      <Room subject={view.subjectId} motif={subject.motif} density={subject.density} role="edge" purpose="student-primary" style={{ padding: "clamp(1.25rem, 1rem + 2vw, 2.5rem)" }}>
        <header>
          <h1 style={{ margin: 0, fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.01em", color: "var(--ta-text-primary)", textWrap: "balance" }}>
            {name}
          </h1>
          <p data-subject-identity style={{ margin: "var(--ta-space-4) 0 0", display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "var(--ta-space-3)", rowGap: "var(--ta-space-1)" }}>
            <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }} aria-hidden><SubjectMark subject={view.subjectId} size={24} /></span>
            <span style={{ fontSize: "var(--ta-text-md)", fontWeight: 500, color: "var(--ta-text-primary)" }}>{subject.name}</span>
            <span style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>{subject.environmentName}</span>
            {subject.status === "draft" && <span style={{ ...MONO, flexBasis: "100%" }}>{DRAFT_LABEL}</span>}
          </p>
        </header>
      </Room>

      {/* 3 WHERE — the arc, third consumer of src/config/arc.ts. 5 (a) the boundary sentence is rendered by ArcRegion: one constant. */}
      <section aria-labelledby="relationship-arc-heading" data-arc-region>
        <h2 id="relationship-arc-heading" style={{ ...MONO, marginBottom: "var(--ta-space-2)" }}>{RELATIONSHIP_COPY.arcHeading}</h2>
        <ArcRegion position={view.position} subjectName={subject.name} label={RELATIONSHIP_COPY.arcLabel(subject.name)} />
      </section>

      {/* 4 RECORD — nothing renders until a learning event exists for this relationship (Phase 7). No container when empty. */}
      {record}

      {/* 4b EXPLORATIONS — the diagnostic mirror (DEC-035): the student's inquiries to the study lens,
          grouped by milestone, with the tutor's preparation mark. No container when absent. */}
      {oversight}

      {/* 5 (b) what a tutor does here. */}
      <p data-tutor-statement style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.5, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
        {RELATIONSHIP_COPY.tutorStatement}
      </p>

      {/* 6 BACK — the one link. ≥44px via padding; set in the running type, not as a button: it is a way back, not an act. */}
      <p style={{ margin: 0 }}>
        <Link href={ROUTES.tutor} data-back style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-2) 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-primary)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>
          {RELATIONSHIP_COPY.back}
        </Link>
      </p>
    </article>
  );
}
