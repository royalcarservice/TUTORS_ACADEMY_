import { toggleSocraticPin } from "@/lib/socratic/actions";
import { fetchTutorSocraticOverview, type TutorSocraticOverview } from "@/lib/socratic/data";
import { timeWordOf } from "@/lib/socratic/oversight";
import { isolateAsync } from "@/lib/state/isolate";
import type { RelationshipView } from "@/lib/tutor/relationship";

import { MONO } from "./tutor-shell";

/* ════════════════════════════════════════════════════════════════════════
   THE DIAGNOSTIC MIRROR (Phase 9 · Step 3, DEC-035)

   The tutor's oversight of the student's Socratic inquiries, rendered in
   the relationship surface beneath the record region: what the student
   asked the lens, at which milestone, when — so the tutor can prepare the
   next live dialogue. It is a MIRROR, not a wiretap:

     · inquiries stand exactly as asked — never paraphrased, never trimmed
       into a verdict;
     · ZERO evaluative indicators — no comprehension rating, no difficulty
       flag, no "struggled", no count of questions, no recency ranking
       beyond the read's own order; the panel carries no figure at all;
     · the one act offered is preparation: "Mark for Next Live Session" —
       the tutor's own note (0010), binary, withdrawable, carrying no
       judgment of the student;
     · subject isolation rides the boundary: the reads re-decide under 0009
       and 0010's RLS for the relationship's subject alone.

   LOADER PATTERN (the record.ts precedent): `loadOversight` is injectable
   ONLY so a dev page can show the failure behaviour; the route passes
   nothing and gets the production loader. Empty means ABSENT — null
   renders no DOM (the slot contract's rule, carried). A failed read is
   silence + one log line, never a sentence about the student (5.7).
   ════════════════════════════════════════════════════════════════════════ */

/** All authored copy, as data, so the harness and the suite read the same
 *  bytes the surface renders. */
export const OVERSIGHT_COPY = {
  /** The panel's heading — the brief's verbatim pin. */
  headingOf: (subjectName: string) => `Conceptual Explorations · ${subjectName}`,
  /** The list's accessible name — the brief's framing word. */
  listLabel: "Conceptual inquiries",
  /** What this panel is, stated once. Subject: the inquiries. */
  purpose:
    "The student's inquiries to the study lens, preserved as asked. They stand here to prepare the next dialogue — nothing on this panel scores, rates or flags them.",
  mark: "Mark for Next Live Session",
  marked: "Marked for Next Live Session",
} as const;

export type OversightLoader = (view: RelationshipView) => Promise<TutorSocraticOverview | null>;

export const loadOversight: OversightLoader = async (view) => {
  return fetchTutorSocraticOverview(view.subjectId, view.studentId);
};

/** Resolve the oversight through its isolate — the record region's shape. */
export async function resolveOversight(
  view: RelationshipView,
  load: OversightLoader = loadOversight,
): Promise<React.ReactNode | null> {
  const r = await isolateAsync("region:relationship-oversight", () => load(view), { subject: view.subjectId });
  if (!r.ok) return null;
  const overview = r.value;
  if (!overview || overview.groups.length === 0) return null; // the honest absence — nothing renders
  return <SocraticReflections subjectId={view.subjectId} studentId={view.studentId} overview={overview} />;
}

export interface SocraticReflectionsProps {
  subjectId: string;
  /** The relationship's join key — carried for the mark's write, never displayed (P6-R2). */
  studentId: string;
  overview: TutorSocraticOverview;
  /** The subject's display name arrives from the route (the 3.1 guard). */
  subjectName?: string;
}

export function SocraticReflections({ subjectId, studentId, overview, subjectName = subjectId }: SocraticReflectionsProps) {
  return (
    <section aria-labelledby="relationship-oversight-heading" data-socratic-oversight style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-4)" }}>
      <h2 id="relationship-oversight-heading" style={{ ...MONO, marginBottom: 0 }}>{OVERSIGHT_COPY.headingOf(subjectName)}</h2>
      <p style={{ margin: 0, fontSize: "var(--ta-text-sm)", lineHeight: 1.5, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>
        {OVERSIGHT_COPY.purpose}
      </p>
      <ol aria-label={OVERSIGHT_COPY.listLabel} style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--ta-space-5)" }}>
        {overview.groups.map((group) => (
          <li key={group.milestoneKey} style={{ borderTop: "1px solid var(--ta-border-subtle)", paddingTop: "var(--ta-space-4)", display: "flex", flexDirection: "column", gap: "var(--ta-space-3)" }}>
            {/* The milestone context — the concept's path, exactly as the scaffold names it. */}
            <p style={{ ...MONO, color: "var(--ta-text-secondary)" }}>{group.path}</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--ta-space-4)" }}>
              {group.inquiries.map((q) => (
                <li key={q.id} data-socratic-inquiry={q.id} style={{ display: "flex", flexDirection: "column", gap: "var(--ta-space-2)" }}>
                  <p style={{ margin: 0, fontSize: "var(--ta-text-md)", lineHeight: 1.6, color: "var(--ta-text-primary)", maxWidth: "var(--ta-measure)" }}>
                    {q.queryText}
                  </p>
                  <p style={{ ...MONO }}>{timeWordOf(q.createdAt)}</p>
                  {/* THE ONE ACT — the tutor's own preparation mark (0010). A plain
                      form: the toggle is idempotent, and the panel re-renders from
                      the read — the state shown is the truth, with no theatre. */}
                  <form action={toggleSocraticPin.bind(null, { studentId, subjectId, exchangeId: q.id })}>
                    <button
                      type="submit"
                      className="ta-btn"
                      data-variant="secondary"
                      data-size="sm"
                      aria-pressed={q.pinned || undefined}
                    >
                      {q.pinned ? OVERSIGHT_COPY.marked : OVERSIGHT_COPY.mark}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
