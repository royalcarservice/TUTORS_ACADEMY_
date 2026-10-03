import Link from "next/link";

import { SubjectMark } from "@/components/brand/subject-mark";
import { Room } from "@/components/motif/stage";
import type { ShellSubjectInfo } from "@/components/student/student-shell";
import { Field } from "@/components/ui/field";
import { ROUTES } from "@/config/routes";
import { LEVER_IDS, LEVER_LABELS, LEVER_NAMES, LEVER_OPTIONS, type EnvironmentLevers, type LeverId } from "@/lib/environment/levers";
import type { EnvironmentSettingsView } from "@/lib/environment/settings";

import { MONO } from "./tutor-shell";

/* ════════════════════════════════════════════════════════════════════════
   THE SHAPING SURFACE (Phase 6 · Step 4 · Part 4). A tutor shapes ONE
   subject's environment — for everyone in it (P6-R10/R12).

   READING ORDER at 390 (top → bottom), nothing else on the page:
     1 WHICH   — the subject's identity in its Room (mark · name · environment
                 name) and the one h1: "The {Subject} environment".
     2 STATE   — one sentence: as authored, or last shaped by you / by another
                 tutor. (The tutor's own record of an action on design config.)
     3 THE FORM (the dominant element) — one native <select> per ADJUSTABLE
                 lever (density · motion character), each a closed authored set
                 (P6-R11); then THE BLAST-RADIUS SENTENCE, in the reading order
                 BEFORE the save control, as running text beside it — not a
                 footnote, not a tooltip, not a checkbox; then Save (the one
                 primary). Works with JS off: a form POST that 303s.
     4 REVERT  — a second form, one secondary button, rendered when a row
                 exists (when the room is as authored there is nothing to put
                 back, and a control that changes nothing is a false
                 affordance, P6-R4). Deleting the row = the authored default.
     5 THE ROOM — a link to the environment itself: THE ENVIRONMENT IS THE
                 ONLY RENDERER (no preview here; two renderers drift).
     6 BACK    — one link to the shell.

   NOT HERE: accent, mark, type, motion grammar, frame, atmosphere (inert),
   motif (identity); any student; any date about a student; a preview;
   a colour input, a text input, a number, an upload.
   ════════════════════════════════════════════════════════════════════════ */

export const LEVERS_COPY = {
  eyebrow: "Shape the environment",
  heading: (subject: string) => `The ${subject} environment`,
  asAuthored: "This environment is as authored.",
  shapedByYou: "Last shaped by you.",
  /* Item 5 (P6-R12 follow-up): a fact the row itself carries (shaped_by ≠ viewer) — not a claim that a co-tutor currently exists or is placed. */
  shapedByOther: "Last shaped by another tutor.",
  /* P6-R12 · THE BLAST RADIUS, in plain words, immediately before Save. */
  blastRadius: (subject: string) => `Saving changes the ${subject} environment for everyone in ${subject} — every student, including students you do not teach, and any other tutor placed in ${subject}. There is one ${subject} room.`,
  /* The silence is a decision: nobody is told the room was rearranged (P6-R10). Stated here so the surface says what it does not do. */
  noNotice: "Nothing announces the change. Students are not told their room was rearranged; the subject simply looks as you set it.",
  save: "Save for everyone in this subject",
  revertLead: "Put the environment back as authored. Safe by construction: the default is authored and validated.",
  revert: "Revert to the authored environment",
  failed: "That did not save. The environment is unchanged — the values shown are the ones in force.",
  seeRoom: (subject: string) => `Open the ${subject} room`,
  back: "Back to the students placed with you",
  inert: "Accent, mark, type, motion grammar and the brand frame are the subject's identity and are not adjustable. Atmosphere and motif have one authored value each and are not presented as controls.",
} as const;

function LeverSelect({ lever, current, authored }: { lever: LeverId; current: EnvironmentLevers[LeverId]; authored: EnvironmentLevers[LeverId] }) {
  const options = LEVER_OPTIONS[lever] as readonly string[];
  const labels = LEVER_LABELS[lever] as Readonly<Record<string, string>>;
  return (
    <Field id={`lever-${lever}`} label={LEVER_NAMES[lever]} hint={`Authored: ${labels[authored]}.`}>
      <select name={lever} className="ta-input" defaultValue={current} data-lever={lever} style={{ appearance: "auto" }}>
        {options.map((o) => (
          <option key={o} value={o}>{labels[o]}</option>
        ))}
      </select>
    </Field>
  );
}

export function EnvironmentLeversSurface({ view, subject, viewerId, failed }: { view: EnvironmentSettingsView; subject: ShellSubjectInfo; viewerId: string; failed: boolean }) {
  const action = `/tutor/${view.subjectId}/environment/shape`;
  const state = !view.shaped ? LEVERS_COPY.asAuthored : view.shapedBy === viewerId ? LEVERS_COPY.shapedByYou : LEVERS_COPY.shapedByOther;
  return (
    <article data-environment-levers data-subject={view.subjectId} data-density="compact" data-shaped={view.shaped ? "row" : "authored"} style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-8)" }}>
      {/* 1 WHICH */}
      <Room subject={view.subjectId} motif={subject.motif} density={subject.density} role="edge" purpose="student-primary" style={{ padding: "clamp(1.25rem, 1rem + 2vw, 2.5rem)" }}>
        <header>
          <p style={{ ...MONO, margin: 0 }}>{LEVERS_COPY.eyebrow}</p>
          <h1 style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.01em", color: "var(--ta-text-primary)", textWrap: "balance" }}>
            {LEVERS_COPY.heading(subject.name)}
          </h1>
          <p data-subject-identity style={{ margin: "var(--ta-space-4) 0 0", display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "var(--ta-space-3)", rowGap: "var(--ta-space-1)" }}>
            <span style={{ color: "var(--ta-accent-1)", display: "inline-flex" }} aria-hidden><SubjectMark subject={view.subjectId} size={24} /></span>
            <span style={{ fontSize: "var(--ta-text-md)", fontWeight: 500, color: "var(--ta-text-primary)" }}>{subject.name}</span>
            <span style={{ fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>{subject.environmentName}</span>
          </p>
          {/* 2 STATE */}
          <p data-shaped-state style={{ margin: "var(--ta-space-4) 0 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)" }}>{state}</p>
        </header>
      </Room>

      {/* 3 THE FORM — the dominant element; one primary. */}
      <form method="post" action={action} data-shape-form aria-labelledby="levers-heading" style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-6)" }}>
        <h2 id="levers-heading" style={{ ...MONO, margin: 0 }}>The two levers</h2>
        <input type="hidden" name="intent" value="save" />
        {LEVER_IDS.map((l) => <LeverSelect key={l} lever={l} current={view.levers[l]} authored={view.authored[l]} />)}
        <p data-inert-note style={{ margin: 0, fontSize: "var(--ta-text-xs)", lineHeight: 1.5, color: "var(--ta-text-muted)", maxWidth: "var(--ta-measure)" }}>{LEVERS_COPY.inert}</p>
        <p data-blast-radius id="blast-radius" style={{ margin: 0, fontSize: "var(--ta-text-base)", lineHeight: 1.5, color: "var(--ta-text-primary)", maxWidth: "var(--ta-measure)" }}>
          {LEVERS_COPY.blastRadius(subject.name)}
        </p>
        <p data-no-notice style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.5, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>{LEVERS_COPY.noNotice}</p>
        {failed && (
          <p data-shape-failed id="shape-failed" role="status" style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.5, color: "var(--ta-text-primary)", maxWidth: "var(--ta-measure)" }}>{LEVERS_COPY.failed}</p>
        )}
        <div>
          <button type="submit" className="ta-btn" data-variant="primary" data-size="lg" data-primary-action aria-describedby={failed ? "blast-radius shape-failed" : "blast-radius"} style={{ minWidth: "12rem" }}>
            {LEVERS_COPY.save}
          </button>
        </div>
      </form>

      {/* 4 REVERT — a real action, shown when there is something to put back. */}
      {view.shaped && (
        <form method="post" action={action} data-revert-form style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
          <input type="hidden" name="intent" value="revert" />
          <p id="revert-lead" style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.5, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>{LEVERS_COPY.revertLead}</p>
          <div>
            <button type="submit" className="ta-btn" data-variant="secondary" data-size="md" aria-describedby="revert-lead">{LEVERS_COPY.revert}</button>
          </div>
        </form>
      )}

      {/* 5 THE ROOM — the only renderer. 6 BACK. */}
      <p style={{ margin: 0, display: "flex", flexWrap: "wrap", columnGap: "var(--ta-space-6)" }}>
        <Link href={`/subjects/${view.subjectId}`} data-see-room style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-2) 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-primary)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>
          {LEVERS_COPY.seeRoom(subject.name)}
        </Link>
        <Link href={ROUTES.tutor} data-back style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--ta-target-primary)", padding: "var(--ta-space-2) 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-primary)", textDecoration: "underline", textUnderlineOffset: "0.2em" }}>
          {LEVERS_COPY.back}
        </Link>
      </p>
    </article>
  );
}
