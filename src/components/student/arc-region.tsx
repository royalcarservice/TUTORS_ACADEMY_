import { arcPosition, type ArcPosition } from "@/lib/progress";
import type { EnvironmentFacts, ProgressEvent } from "@/lib/progress";

/* THE ARC REGION (Phase 5 · Step 6 · Part 5) — the one visible thing.
 *
 * The same seven steps as the homepage's promise map (src/config/arc.ts),
 * one step further along, for THIS student in THIS environment. It is a Room
 * element (2.4): compact, no substrate, no canvas, no animation, no mark set —
 * a list of seven labels, each followed by its state IN WORDS. It is not a
 * stepper: no segments, no filled/empty affordance, no "n of 7". Later steps
 * are not locked or incomplete; they are AHEAD.
 *
 * NO CTA, NO LINK, NOT INTERACTIVE. The engine (5.4) instructs; this orients.
 * Rendered only for a signed-in, enrolled student — a visitor's HTML never
 * carries [data-arc]. Nothing here is emphasised because it is first, tenth
 * or recent: every row is set in the same type.
 *
 * COPY — candidates considered (report §6):
 *   A  list of the seven labels + "done"/"ahead", boundary sentence below   ← SHIPPED
 *   B  same list with "behind you"/"ahead"                                    — "behind" is judgment vocabulary; rejected
 *   C  one prose paragraph, no list                                           — harder to hold identical to 4.7; reads as narrative; rejected
 */

export const ARC_STATE_TEXT = { done: "done", ahead: "ahead" } as const;

export const ARC_COPY = {
  /** Accessible name of the list; the visible heading ("Your record") is supplied by the region contract. */
  eyebrow: "Where you are",
  /* THE HONEST BOUNDARY for an empty record. It says the record is empty
     without saying the student has done nothing: the subject of every
     clause is the environment and the product, not the student. */
  boundary: "Nothing is recorded here yet. Nothing in this environment records anything so far — classes, recordings and work arrive in later phases, and the record starts when they exist.",
  boundaryCandidateB: "There is nothing recorded here yet: this environment does not record anything until classes, recordings and work exist in it.",
} as const;

const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ta-text-muted)", margin: 0 };

export function ArcRegion({ position, subjectName }: { position: ArcPosition; subjectName: string }) {
  return (
    <div data-arc data-subject-arc={position.subjectId}>
      {/* The region contract supplies the heading ("Your record"); the environment's h1 already names the
          subject. No second eyebrow — two stacked mono lines read as a dashboard header. `subjectName`
          is kept in the aria-label so a reader landing on the list mid-page knows which environment. */}
      <ul data-arc-steps aria-label={`${ARC_COPY.eyebrow} in ${subjectName}`} style={{ listStyle: "none", margin: "var(--ta-space-2) 0 0", padding: 0, display: "grid", gap: "var(--ta-space-2)", maxWidth: "var(--ta-measure)" }}>
        {position.steps.map((s) => (
          <li key={s.id} data-arc-step={s.id} data-state={s.state} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--ta-space-4)", borderBottom: "1px solid var(--ta-border-subtle)", paddingBottom: "var(--ta-space-2)" }}>
            <span data-arc-label style={{ fontSize: "var(--ta-text-md)", color: "var(--ta-text-primary)" }}>{s.label}</span>
            {/* Read as "See the system — done": the separator is for the reading order, not the eye. */}
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}> — </span>
            <span data-arc-state style={{ ...MONO, color: "var(--ta-text-secondary)", whiteSpace: "nowrap" }}>{ARC_STATE_TEXT[s.state]}</span>
          </li>
        ))}
      </ul>
      {position.recordEmpty ? (
        <p data-arc-boundary style={{ margin: "var(--ta-space-4) 0 0", fontSize: "var(--ta-text-sm)", lineHeight: 1.5, color: "var(--ta-text-secondary)", maxWidth: "var(--ta-measure)" }}>{ARC_COPY.boundary}</p>
      ) : null}
    </div>
  );
}

/** Resolver for the environment slot map: facts + events → the region, or null when there is nothing to stand on. */
export function resolveArc(facts: EnvironmentFacts, events: readonly ProgressEvent[], liveModules: readonly string[], subjectName: string): React.ReactNode | null {
  if (!facts.enrolled) return null;
  const position = arcPosition(facts, events, liveModules);
  return <ArcRegion position={position} subjectName={subjectName} />;
}
