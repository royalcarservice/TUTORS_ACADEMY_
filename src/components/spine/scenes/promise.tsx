/* ════════════════════════════════════════════════════════════════════════
   SCENE 7 — THE PROMISE (Phase 4 · Step 7), authored. THE PAGE'S TURN.

   The product stops describing itself and addresses the visitor. Its
   subject is the visitor's own trajectory — and its one visual idea is the
   ONLY honest progress device on the page: a map of THIS PAGE. Of the
   seven steps of the story (discover → choose → enter → learn → interact →
   progress → master), the visitor has, on this page, genuinely done the
   first three (Scenes 1–2, Scene 3, Scene 4). The other four are ahead.

   HOW COMPLETION IS DERIVED — plainly: it is AUTHORED FROM PAGE STRUCTURE,
   not measured. A step is "done" because the scene that performs it sits
   above this one in the document order (`DONE_BY_SCENE` names it). It is
   not derived from scroll or engagement; a visitor arriving via #platform
   has the same page above them, unread. Nothing else is available to
   derive it from today, and inventing a measurement would be worse.

   Not a progress UI: no bar, ring, percentage, fraction, count, streak,
   badge. Not a reward: filled vs hollow marks, state IN WORDS ("done, on
   this page" / "ahead"), no animation on completion. Not a metaphor: an
   abstract marker set on a hairline. Not interactive: no focus, no hover,
   no tooltip. Reflows to a vertical list below 48rem (so also at 400%
   zoom). Register: still. No CTA. The mastery statement is designed
   behaviour and carries the 4.6 status label, derived from the registry.
   ════════════════════════════════════════════════════════════════════════ */

import { ARC_STEPS, type ArcStep } from "@/config/arc";
import { PLATFORM_MODULES } from "@/config/modules";

import { PromiseStagger } from "./promise-stagger";
import { STATUS_LABEL, statusFor, type ModuleEntry, type StatusState } from "./status";

export type Marker = ArcStep;

/* Marker labels — the internal step names are never rendered.
   5.6: the definition lives in src/config/arc.ts (ONE arc for homepage and
   environment); re-exported here unchanged. */
export const MARKERS: readonly Marker[] = ARC_STEPS;

export const STATE_TEXT = { done: "done, on this page", ahead: "ahead" } as const;

export const PROMISE_COPY = {
  eyebrow: "The promise",
  heading: "What happens to you.",
  /* Lead A — SHIPPED. */
  lead: "Six scenes have described a system. This one is about you.",
  /* Lead B — not shipped. */
  leadCandidateB: "You have already done three things on this page: seen the system, met its doors, watched a crossing. The rest happens inside.",
  markersLabel: "Where you are on this page",
  /* Mastery statement — candidate 2, SHIPPED. */
  mastery: "Mastery here is a place that remembers where you were. Your classes, recordings and work are kept against the same environment, and your progress is read there — at the point of work, not on a separate dashboard.",
  masteryCandidate1: "Mastery here is not a certificate. It is what accumulates in an environment that remembers where you were — every class, recording and piece of work kept against the same place, readable where you work.",
  masteryCandidate3: "You will not be given a score. You will be given a room that keeps what you did in it, and shows you where you are while you are working.",
  masterySubject: "the record",
  /* Closing narrative line into Scene 8 — a sentence, not a control. */
  closing: "What is left on this page is the door you already saw.",
} as const;

const REGISTRY: ModuleEntry[] = PLATFORM_MODULES.map((m) => ({ id: m.id, name: m.name, status: m.status }));

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

/** Completion from page structure: a step is done when a scene above performs it. */
export function markerStates(scenesAbove: readonly string[]): Record<Marker["id"], "done" | "ahead"> {
  const out = {} as Record<Marker["id"], "done" | "ahead">;
  for (const m of MARKERS) out[m.id] = m.doneBy.length > 0 && m.doneBy.every((s) => scenesAbove.includes(s)) ? "done" : "ahead";
  return out;
}

/* The scenes that precede Scene 7 in the frozen 4.1 order. Passed as a prop
   only so the dev specimen can render the zero / three / seven matrix. */
export const SCENES_ABOVE_DEFAULT = ["arrival", "premise", "difference", "choice", "enter", "people", "practice"] as const;

export function PromiseScene({
  scenesAbove = SCENES_ABOVE_DEFAULT,
  forceStates,
  modules = REGISTRY,
}: {
  entries?: unknown;
  scenesAbove?: readonly string[];
  forceStates?: Record<Marker["id"], "done" | "ahead">;
  modules?: ModuleEntry[];
}) {
  const states = forceStates ?? markerStates(scenesAbove);
  const status: StatusState = statusFor(modules, ["student-portal"]);

  return (
    <div data-promise>
      <style>{`
        [data-promise-lead] { margin: var(--ta-space-3) 0 0; font-family: var(--ta-font-display); font-weight: 400; font-size: var(--ta-text-2xl); line-height: 1.35; color: var(--ta-text-primary); max-width: 32ch; }
        [data-markers] { list-style: none; margin: var(--ta-space-8) 0 0; padding: 0; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0; position: relative; }
        [data-markers]::before { content: ""; position: absolute; left: 4px; right: 4px; top: 4px; height: 1px; background: var(--ta-border-strong); }
        [data-marker] { position: relative; padding: var(--ta-space-4) var(--ta-space-3) 0 0; min-width: 0; }
        [data-marker]::before { content: ""; position: absolute; left: 0; top: 0; width: 9px; height: 9px; border-radius: 50%; border: 1px solid var(--ta-text-primary); background: var(--ta-surface-base); box-sizing: border-box; }
        [data-marker][data-state="done"]::before { background: var(--ta-text-primary); }
        [data-marker-label] { margin: 0; font-size: var(--ta-text-sm); line-height: 1.35; color: var(--ta-text-primary); font-weight: 500; }
        [data-marker-state] { margin: var(--ta-space-1) 0 0; font-family: var(--ta-font-mono); font-size: var(--ta-text-2xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-text-secondary); }
        [data-marker][data-state="ahead"] [data-marker-label] { font-weight: 400; }
        [data-mastery] { margin: var(--ta-space-8) 0 0; padding-top: var(--ta-space-6); border-top: 1px solid var(--ta-border-subtle); max-width: var(--ta-measure); }
        [data-mastery] p { margin: 0; font-size: var(--ta-text-lg); line-height: 1.5; color: var(--ta-text-primary); }
        [data-mastery-status] { margin: var(--ta-space-3) 0 0 !important; font-size: var(--ta-text-md) !important; color: var(--ta-text-secondary) !important; }
        [data-status] { display: inline-flex; align-items: baseline; font-family: var(--ta-font-mono); font-size: var(--ta-text-sm); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-text-secondary); box-shadow: inset 0 -1px 0 var(--ta-border-strong); padding-bottom: 2px; }
        [data-status][data-state="live"] { color: var(--ta-text-primary); box-shadow: inset 0 -1px 0 var(--ta-text-primary); }
        [data-closing] { margin: var(--ta-space-6) 0 0; font-family: var(--ta-font-display); font-size: var(--ta-text-lg); color: var(--ta-text-muted); }
        /* Reflow: below 48rem (and therefore at 400% zoom on any desktop) the row becomes a vertical sequence on one hairline. */
        @media (max-width: 48rem) {
          [data-markers] { grid-template-columns: 1fr; gap: var(--ta-space-3); padding-left: var(--ta-space-6); }
          [data-markers]::before { left: 4px; right: auto; top: 4px; bottom: 4px; width: 1px; height: auto; }
          [data-marker] { padding: 0; }
          [data-marker]::before { left: calc(-1 * var(--ta-space-6)); top: 0.35em; }
          [data-marker-label] { font-size: var(--ta-text-md); }
          [data-promise-lead] { font-size: var(--ta-text-xl); }
        }
      `}</style>

      <p style={MONO}>{PROMISE_COPY.eyebrow}</p>
      <h2
        id="scene-promise"
        style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, color: "var(--ta-text-primary)" }}
      >
        {PROMISE_COPY.heading}
      </h2>
      <p data-promise-lead>{PROMISE_COPY.lead}</p>

      {/* THE JOURNEY DEVICE — a map of this page. Not interactive. State in words. */}
      <PromiseStagger label={PROMISE_COPY.markersLabel}>
        {MARKERS.map((m, i) => (
          <li key={m.id} data-marker={m.id} data-state={states[m.id]} style={{ ["--i" as string]: i }}>
            <p data-marker-label>{m.label}</p>
            <p data-marker-state>{STATE_TEXT[states[m.id]]}</p>
          </li>
        ))}
      </PromiseStagger>

      <div data-mastery>
        <p>{PROMISE_COPY.mastery}</p>
        <p data-mastery-status>
          <span data-status data-state={status}>
            {STATUS_LABEL[status]}
          </span>{" "}
          <span>— {PROMISE_COPY.masterySubject}.</span>
        </p>
      </div>

      <p data-closing>{PROMISE_COPY.closing}</p>
    </div>
  );
}
