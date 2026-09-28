import Link from "next/link";

import { SubjectMark } from "@/components/brand/subject-mark";
import { Motif } from "@/components/motif/motif";
import { buttonClass } from "@/components/ui/button";
import type { Density, MotifKind } from "@/lib/motif/types";

/* ════════════════════════════════════════════════════════════════════════
   SCENE 3 — THE CHOICE (Phase 4 · Step 4), authored. THE THRESHOLD.

   Six environments as six doors — a colonnade of full-width thresholds, not
   a card grid and not a second specimen sheet. Each door carries its own
   identity (mark, accent, motif fragment, name, environment name, config
   tagline); what stays constant is the row geometry, the type treatment,
   the rhythm and the one action.

   LOCKED, AS BUILT:
   1. THRESHOLD, NOT PREVIEW — nothing on the page changes on hover/focus;
      the item alone lifts 2px and its accent rule intensifies (local, no
      layout shift: the rule is an inset box-shadow, the lift a transform).
   2. REAL LINKS — an enterable door is one <a href="/subjects/[id]"> whose
      accessible name is "Subject — Environment"; works with JS off.
      AVAILABILITY IS CONFIG-DRIVEN (4.4 amendment): `status !== "draft"`
      makes a door; a draft renders at the same size and identity but INERT
      — not a link, not focusable, no action label, "in foundation" as text.
      Flip one status to ready and it becomes a door with zero code change.
   3. ONE ACTION PER DOOR — no confirmations, no modals, no hover-only UI.
   4. EQUAL WEIGHT, EXPLICIT ORDER — identical rows; order = the 3.1 config
      order (the one order used by /subjects, the subject nav and Scene 2).
   5. ENTRY, NOT OUTCOMES — the action word is "Enter". The offer is the
      environment, already built. No feature promised; no apology made.

   The availability line is DERIVED from the entries' statuses, never
   authored, so it self-corrects as subjects go ready.

   Handoff to Scene 4 — CONTRACT ONLY (not implemented here): see
   CHOICE_HANDOFF below.
   ════════════════════════════════════════════════════════════════════════ */

export interface DoorEntry {
  id: string;
  name: string;
  href: string;
  motif?: string;
  density?: string;
  status?: string;
  tagline?: string;
}

/* ALL AUTHORED COPY, exported for the dev specimen. */
export const CHOICE_COPY = {
  eyebrow: "The choice",
  heading: "Six environments. This is the threshold.",
  /* Candidate A — SHIPPED (recommended). */
  lead: "Each door below is a subject built as a place. Behind it is the environment itself, as it stands today.",
  /* Candidate B — second choice, not shipped. */
  leadCandidateB: "You have seen the system. This is where you stop reading. Pick the subject you are here for and go in.",
  /* Per-door action — Candidate 1 SHIPPED; 2 and 3 in the report. */
  action: "Enter",
  actionCandidate2: "Enter the environment",
  actionCandidate3: "Go in",
  inFoundation: "In foundation",
  next: "The door opens onto the environment, and the environment becomes the page.",
} as const;

/** HANDOFF CONTRACT (documented; Scene 4 implements its side in Step 4.5). */
export const CHOICE_HANDOFF = {
  what: "Which environment the visitor was drawn to (last focused/hovered door), so Scene 4 can hold that subject active before the crossing.",
  how: "Spine state, not URL state: each door carries data-door=<id>. Scene 4 may read the last door that received focus or pointerenter by listening for a document CustomEvent 'ta:door' {detail:{id}} that Scene 3 will dispatch ONLY once Scene 4 exists (no listener today → no dispatch today). Default when nothing was drawn to: the first ready subject in config order.",
  notShared: "Nothing persisted: no localStorage, no cookie, no query string. Clicking a door navigates to the real route; Scene 4 never intercepts the click.",
} as const;

/** Environment name = the tagline's leading noun phrase ("The Lattice — …"). From config, never authored. */
export function environmentName(tagline?: string) {
  if (!tagline) return "";
  return tagline.split(" — ")[0].trim();
}
/** The tagline's remainder after the environment name — shown beneath it so the config text is not printed twice. */
export function taglineRest(tagline?: string) {
  if (!tagline) return "";
  const i = tagline.indexOf(" — ");
  return i === -1 ? tagline : tagline.slice(i + 3).trim();
}

/** Availability, derived from config statuses — self-correcting. */
export function availabilityLine(entries: DoorEntry[]) {
  const open = entries.filter((e) => e.status && e.status !== "draft");
  const n = open.length;
  const all = entries.length;
  if (n === 0) return "No environment is open yet.";
  if (n === all) return `All ${numberWord(all)} environments are open.`;
  const names = open.map((e) => e.name);
  const list = names.length === 1 ? names[0] : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  return `${numberWord(n)[0].toUpperCase()}${numberWord(n).slice(1)} of the ${numberWord(all)} ${n === 1 ? "is" : "are"} open today: ${list}. The rest are in foundation.`;
}
const numberWord = (n: number) => ["zero", "one", "two", "three", "four", "five", "six"][n] ?? String(n);

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

function DoorBody({ e }: { e: DoorEntry }) {
  const env = environmentName(e.tagline);
  const open = !!e.status && e.status !== "draft";
  return (
    <>
      <Motif
        subject={e.id}
        kind={(e.motif ?? "lattice") as MotifKind}
        role="edge"
        density={(e.density ?? "balanced") as Density}
        scope="room"
        purpose="door"
        index={1}
        edgeSide="right"
        exclude={[{ x: 0, y: 0, w: 0.62, h: 1 }]}
      />
      <span data-door-mark aria-hidden="true">
        <SubjectMark subject={e.id} size={32} />
      </span>
      <span data-door-text>
        <span data-door-name id={`door-${e.id}-name`}>
          {e.name}
        </span>
        <span data-door-env id={`door-${e.id}-env`}>
          {env}
        </span>
        <span data-door-tagline id={`door-${e.id}-tagline`}>
          {taglineRest(e.tagline)}
        </span>
      </span>
      <span data-door-action>
        {open ? (
          <span className={buttonClass("outline", "md")} aria-hidden="true" data-door-cta>
            {CHOICE_COPY.action} <span aria-hidden="true">→</span>
          </span>
        ) : (
          <span data-door-status>{CHOICE_COPY.inFoundation}</span>
        )}
      </span>
    </>
  );
}

export function ChoiceScene({ entries = [] }: { entries?: DoorEntry[] }) {
  const doors = entries; // ORDER: 3.1 config order, as supplied by the route. Never re-sorted here.
  const openCount = doors.filter((e) => e.status && e.status !== "draft").length;
  return (
    <div data-choice data-open-count={openCount}>
      <style>{`
        [data-choice] { padding-block: var(--ta-space-block); }
        [data-choice-lead] { margin: var(--ta-space-4) 0 0; max-width: var(--ta-measure); font-size: var(--ta-text-lg); line-height: 1.55; color: var(--ta-text-secondary); text-wrap: pretty; }
        [data-choice-availability] { margin: var(--ta-space-2) 0 0; max-width: var(--ta-measure); font-size: var(--ta-text-md); line-height: 1.6; color: var(--ta-text-primary); }
        [data-doors] { list-style: none; margin: var(--ta-space-block) 0 0; padding: 0; border-top: 1px solid var(--ta-border-subtle); }
        [data-doors] > li { margin: 0; padding: 0; border-bottom: 1px solid var(--ta-border-subtle); }
        [data-door] { position: relative; isolation: isolate; overflow: clip; display: grid; grid-template-columns: 2rem minmax(0, 1fr) auto; align-items: center; gap: var(--ta-space-4); padding: var(--ta-space-4) var(--ta-space-3); min-height: 6rem; color: inherit; text-decoration: none; box-shadow: inset 2px 0 0 var(--ta-accent-3); transition: transform var(--ta-dur-fast) var(--ta-ease-enter), box-shadow var(--ta-dur-fast) var(--ta-ease-enter); }
        [data-door] > * { position: relative; z-index: 1; }
        [data-door] > [data-motif] { z-index: 0; }
        [data-door-mark] { color: var(--ta-accent-1); display: block; }
        [data-door-text] { display: grid; gap: 2px; min-width: 0; }
        [data-door-name] { font-family: var(--ta-font-display); font-weight: 500; font-size: var(--ta-display-sm); line-height: 1.05; color: var(--ta-text-primary); }
        [data-door-env] { font-family: var(--ta-font-mono); font-size: var(--ta-text-2xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-accent-1); margin-top: var(--ta-space-1); }
        [data-door-tagline] { font-size: var(--ta-text-sm); color: var(--ta-text-secondary); line-height: 1.5; }
        [data-door-action] { display: flex; align-items: center; justify-content: flex-end; min-width: 7rem; min-height: max(2.75rem, var(--ta-control-h)); }
        [data-door-cta] { pointer-events: none; }
        [data-door-status] { font-family: var(--ta-font-mono); font-size: var(--ta-text-2xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-text-muted); white-space: nowrap; }
        a[data-door]:hover, a[data-door]:focus-visible { transform: translateY(-2px); box-shadow: inset 3px 0 0 var(--ta-accent-1); }
        a[data-door]:hover [data-door-cta], a[data-door]:focus-visible [data-door-cta] { border-color: var(--ta-accent-1); color: var(--ta-text-primary); }
        a[data-door]:focus-visible { outline: 2px solid var(--ta-focus-ring); outline-offset: -2px; }
        [data-door-inert] { cursor: default; }
        [data-choice-next] { margin: var(--ta-space-block) 0 0; max-width: var(--ta-measure); font-size: var(--ta-text-md); line-height: 1.6; color: var(--ta-text-secondary); }
        @media (prefers-reduced-motion: reduce) {
          [data-door] { transition: none; }
          a[data-door]:hover, a[data-door]:focus-visible { transform: none; }
        }
        [data-reduced-motion="on"] [data-door] { transition: none; }
        [data-reduced-motion="on"] a[data-door]:hover, [data-reduced-motion="on"] a[data-door]:focus-visible { transform: none; }
        @media (max-width: 48rem) {
          [data-door] { grid-template-columns: 1.5rem minmax(0, 1fr); gap: var(--ta-space-3); padding: var(--ta-space-3) var(--ta-space-2); }
          [data-door-mark] svg { width: 24px; height: 24px; }
          [data-door-action] { grid-column: 2; justify-content: flex-start; min-width: 0; }
          [data-door-name] { font-size: var(--ta-text-xl); }
          /* equal weight: every row reserves two tagline lines so length of copy never changes the door's size */
          [data-door-tagline] { min-height: 3em; }
        }
        @media (max-width: 30rem) {
          [data-choice] { padding-block: var(--ta-space-6); }
          [data-choice-lead] { font-size: var(--ta-text-md); }
          [data-doors] { margin-top: var(--ta-space-6); }
          [data-door-tagline] { font-size: var(--ta-text-xs); }
        }
      `}</style>

      <p style={MONO}>{CHOICE_COPY.eyebrow}</p>
      <h2
        id="scene-choice"
        style={{
          margin: "var(--ta-space-2) 0 0",
          fontFamily: "var(--ta-font-display)",
          fontSize: "var(--ta-display-md)",
          fontWeight: 500,
          lineHeight: 1.1,
          color: "var(--ta-text-primary)",
          textWrap: "balance",
        }}
      >
        {CHOICE_COPY.heading}
      </h2>
      <p data-choice-lead>{CHOICE_COPY.lead}</p>
      <p data-choice-availability>{availabilityLine(doors)}</p>

      <ul data-doors aria-labelledby="scene-choice">
        {doors.map((e) => {
          const open = !!e.status && e.status !== "draft";
          return (
            <li key={e.id}>
              {open ? (
                <Link
                  href={e.href}
                  data-door={e.id}
                  data-subject={e.id}
                  data-spatial="room"
                  /* 4.9: no aria-label — the accessible name is the door's own
                     text, so the name contains the visible label (WCAG 2.5.3). */
                >
                  <DoorBody e={e} />
                </Link>
              ) : (
                <div data-door={e.id} data-subject={e.id} data-spatial="room" data-door-inert>
                  <DoorBody e={e} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* NARRATIVE LINE into Scene 4 — a sentence, not a control */}
      <p data-choice-next>{CHOICE_COPY.next}</p>
    </div>
  );
}
