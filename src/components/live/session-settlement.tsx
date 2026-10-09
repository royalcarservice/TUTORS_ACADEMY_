import { Button } from "@/components/ui";
import { ROUTES } from "@/config/routes";

/* ════════════════════════════════════════════════════════════════════════
   SESSION SETTLEMENT — Phase 7 · Step 5 (DEC-027)

   The dignified post-session surface: what the chamber shows once the
   session is CONCLUDED (or settling towards it). A SERVER component — no
   client JavaScript, no timers, no rating stars, no satisfaction survey,
   no feedback modal. The session ends the way it lived: calmly, in
   complete sentences.

   FOUR VARIANTS, decided by the page from real facts:

   · STUDENT, RECORD WRITTEN — the brief's sentence, verbatim: the session
     has concluded and the record says so. One action: back to the
     student workspace.
   · STUDENT, NO RECORD YET — the session has concluded; nothing is
     claimed about the record, because nothing is written yet (the tutor
     has not confirmed). The same one action stands.
   · TUTOR, NOTHING RECORDED YET — the academic record form: the session's
     facts, the settle write, one confirm action. Two honest sentences
     stand where an evaluative apparatus would: the fact evidences the
     arc's Learn and Progress steps by the engine's own mapping (a fact,
     not a field), and notes about the student are NOT kept — the record
     holds facts, never summaries (P5-R6; DEC-022 refused metadata). No
     drop-down names a student attentive or distracted: the boundary the
     brief keeps — tutors record academic milestones, never behavioural
     marks.
   · TUTOR, RECORDED — the confirmation: attendance stands for the
     enrolled students. One action: back to the placements.

   THE WRITE settles by the P6-R15 rule: the form POSTs to the settle
   route, which answers 303 to THIS surface — the GET re-reads the truth
   and shows the confirmation. Nothing redirects away from an unsettled
   write.
   ════════════════════════════════════════════════════════════════════════ */

const MONO_LABEL: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export function SessionSettlement({
  subject,
  sessionTitle,
  sessionId,
  viewer,
  recorded,
}: {
  /** The subject the session belonged to. */
  subject: { id: string; name: string };
  /** The concluded session's title — rendered only as-is. */
  sessionTitle: string;
  /** The session row the settle write names. */
  sessionId: string;
  viewer: "student" | "tutor";
  /** Whether attendance facts already stand for this session. */
  recorded: boolean;
}) {
  return (
    <section
      data-session-settlement
      data-viewer={viewer}
      data-recorded={recorded ? "true" : "false"}
      aria-label="Session settlement"
      style={{
        border: "1px solid color-mix(in srgb, var(--ta-accent-1) 45%, transparent)",
        borderRadius: "var(--ta-radius-2)",
        background: "var(--ta-surface-raised)",
        padding: "var(--ta-space-6)",
        maxWidth: "44rem",
      }}
    >
      <p style={MONO_LABEL}>Session concluded</p>
      <p style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-xl)", fontWeight: 500 }}>
        {sessionTitle}
      </p>

      {viewer === "student" ? (
        <>
          <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-lg)", color: "var(--ta-text-primary)", maxWidth: "36em" }}>
            {recorded
              ? `The session in ${subject.name} has concluded. Your record in ${subject.name} has been updated.`
              : `The session in ${subject.name} has concluded.`}
          </p>
          <p style={{ marginTop: "var(--ta-space-6)" }}>
            <Button href={ROUTES.student} variant="primary">
              Return to Student Workspace
            </Button>
          </p>
        </>
      ) : recorded ? (
        <>
          <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-lg)", color: "var(--ta-text-primary)", maxWidth: "36em" }}>
            Attendance is recorded for the students enrolled in {subject.name}.
          </p>
          <p style={{ marginTop: "var(--ta-space-6)" }}>
            <Button href={ROUTES.tutor} variant="primary">
              Confirm &amp; Return to Placements
            </Button>
          </p>
        </>
      ) : (
        <>
          {/* THE ACADEMIC RECORD FORM — one fact, one action. The milestone
              is the attendance fact itself: the arc's STEP_EVIDENCE mapping
              says which steps it evidences, and the engine derives the
              position from facts at read time — so the mapping stands here
              as a sentence, not a selector (DEC-027). */}
          <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-lg)", color: "var(--ta-text-primary)", maxWidth: "36em" }}>
            The session in {subject.name} has concluded. Confirm to record attendance for the enrolled students.
          </p>
          <p style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "36em" }}>
            The record holds one fact — attendance — and evidences the Learn and Progress steps of the arc, in the arc&apos;s own vocabulary.
          </p>
          <p style={{ margin: "var(--ta-space-2) 0 0", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-secondary)", maxWidth: "36em" }}>
            Notes about the student are not kept: the record holds facts, never summaries.
          </p>
          <form action={`/subjects/${subject.id}/live/settle`} method="post" style={{ marginTop: "var(--ta-space-6)" }}>
            <input type="hidden" name="sessionId" value={sessionId} />
            <Button type="submit" variant="primary">
              Confirm &amp; Return to Placements
            </Button>
          </form>
        </>
      )}
    </section>
  );
}
