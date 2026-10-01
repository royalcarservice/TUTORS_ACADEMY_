import { STATE_COPY } from "@/components/state/copy";
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
export function Threshold({ subjectId, subjectName, failed = false }: { subjectId: string; subjectName: string; failed?: boolean }) {
  return (
    <form method="post" action={entryAction(subjectId)} data-threshold style={{ marginTop: "var(--ta-space-6)" }}>
      <button type="submit" className="ta-btn" data-variant="primary" data-size="lg" data-primary-action style={{ minWidth: "12rem" }} aria-describedby={failed ? "threshold-outcome" : undefined}>
        Begin {subjectName}
      </button>
      {/* 5.7 · ACTION scope (P5-R8.2/5/7): a KNOWN failure of the last POST, one
          sentence in the running type beside the control, no colour, no icon.
          It says why repeating is safe (nothing was recorded; the write is
          idempotent). Rendered only while the server still says not enrolled. */}
      {failed && (
        <p id="threshold-outcome" data-action-outcome style={{ margin: "var(--ta-space-3) 0 0", fontSize: "var(--ta-text-sm)", lineHeight: 1.55, color: "var(--ta-text-secondary)", maxWidth: "36rem" }}>
          {STATE_COPY.entryFailed}
        </p>
      )}
    </form>
  );
}

/* THE VISITOR'S DOOR (E-23 fix, after 6.1 · before 6.2)
 *
 * Rendered in the SAME header position for exactly ONE other reader class: a
 * signed-out visitor at an open environment. Until now <main> offered nothing;
 * the only way in was header → menu → Sign in (3 taps where the homepage's
 * "Enter Mathematics" promised 1). The action is the existing one — the
 * header's own Sign in link, same destination (`/login?next=<this
 * environment>`), so after signing in the visitor lands back here at the
 * threshold and meets "Begin". No new verb, no "sign in to enter" sentence:
 * the heading and tagline already say where this is; the action says how in.
 * It is the view's one primary; the header's Sign in is chrome, not <main>.
 * A plain <a>, not next/link: the environment route carries no client JS
 * (5.5), and a Link here moved 12 KB of chunks onto /student as well.
 */
export function VisitorDoor({ subjectId }: { subjectId: string }) {
  return (
    <div data-visitor-door style={{ marginTop: "var(--ta-space-6)" }}>
      <a href={`/login?next=${encodeURIComponent(`/subjects/${subjectId}`)}`} className="ta-btn" data-variant="primary" data-size="lg" data-primary-action style={{ minWidth: "12rem" }}>
        Sign in
      </a>
    </div>
  );
}
