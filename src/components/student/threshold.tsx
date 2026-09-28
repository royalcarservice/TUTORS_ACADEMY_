import { entryAction } from "@/lib/student/enrol";

/* THE THRESHOLD CONTROL (Phase 5 · Step 5 · Part 3)
 *
 * Rendered on the environment page for exactly ONE state: a signed-in
 * student who is NOT yet enrolled in an ENTERABLE subject (the page decides
 * with `mayEnrol`; this component decides nothing). A plain form POST — it
 * works without JavaScript and cannot fire from a page view or a prefetch.
 * Composed from the existing button primitive; it is the view's one primary.
 *
 * Copy: "Begin {Subject}" — verb + subject, the same shape as the shell's
 * "Open {Subject}", so the accessible name says what and where on its own.
 */
export function Threshold({ subjectId, subjectName }: { subjectId: string; subjectName: string }) {
  return (
    <form method="post" action={entryAction(subjectId)} data-threshold style={{ marginTop: "var(--ta-space-6)" }}>
      <button type="submit" className="ta-btn" data-variant="primary" data-size="lg" data-primary-action style={{ minWidth: "12rem" }}>
        Begin {subjectName}
      </button>
    </form>
  );
}
