/* ════════════════════════════════════════════════════════════════════════
   SCENE 5 — THE PEOPLE (Phase 4 · Step 6), authored. THE RELATIONSHIP.

   There are no tutors. So the scene presents nothing that looks like one:
   no names, photographs, avatars, bios, credentials, subject lists,
   availability, no roster, no grid, no cards. It presents the relationship
   the product is designed around, anchored to what is real (the five
   levers of an environment, 3.1) and honest about the distance (the
   tutor's side is not built — status DERIVED from the module registry via
   route props, never authored).

   Register: restrained and human — tone, pacing and type, not pictures.
   One structural element: a single hairline rule. No subject accent
   (subjectMode neutral); the status label uses the shared treatment.
   No CTA, no link, nothing converted.
   ════════════════════════════════════════════════════════════════════════ */

import { PLATFORM_MODULES } from "@/config/modules";

import { STATUS_LABEL, statusFor, type ModuleEntry } from "./status";

/* ALL AUTHORED COPY, exported for the dev specimen and the report. */
export const PEOPLE_COPY = {
  eyebrow: "The people",
  heading: "A tutor here has a place, not a profile.",
  /* Lead A — SHIPPED. */
  lead: "There is no roster on this page. A tutor does not get a profile page and a video call; a tutor gets an environment, and shapes it.",
  /* Lead B — not shipped. */
  leadCandidateB: "You will not find a list of tutors here, because none has been invented for you. When tutors arrive, each will own an environment and shape it.",
  /* ≤3 supporting lines. */
  lines: [
    "Five things are theirs to set: accent, atmosphere, motif, motion character, density.",
    "The environment is the workspace. You meet your tutor inside it.",
  ],
  statusSubject: "The tutor's side of the environment",
} as const;

/** The five levers, as named in the subject schema (3.1). Rendered as text, never as a list of tutors. */
export const LEVERS = ["accent", "atmosphere", "motif", "motion character", "density"] as const;

/* The module registry is the documented roadmap-as-data (it already feeds
   navigation and the portal shells). States are DERIVED from it; the prop
   exists only so the dev specimen can render the full state matrix. */
const REGISTRY: ModuleEntry[] = PLATFORM_MODULES.map((m) => ({ id: m.id, name: m.name, status: m.status }));

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export function PeopleScene({ modules = REGISTRY }: { entries?: unknown; modules?: ModuleEntry[] }) {
  const status = statusFor(modules, ["tutor-portal"]);
  return (
    <div data-people>
      <style>{`
        [data-people-lead] { margin: var(--ta-space-4) 0 0; font-family: var(--ta-font-display); font-weight: 400; font-size: var(--ta-text-2xl); line-height: 1.35; color: var(--ta-text-primary); max-width: 30ch; }
        [data-people-lines] { margin: var(--ta-space-6) 0 0; padding: var(--ta-space-6) 0 0; border-top: 1px solid var(--ta-border-subtle); max-width: var(--ta-measure); display: grid; gap: var(--ta-space-3); }
        [data-people-lines] p { margin: 0; font-size: var(--ta-text-lg); line-height: 1.5; color: var(--ta-text-secondary); }
        [data-people-lines] em { font-style: normal; color: var(--ta-text-primary); }
        [data-status] { display: inline-flex; align-items: baseline; gap: var(--ta-space-2); font-family: var(--ta-font-mono); font-size: var(--ta-text-sm); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-text-secondary); box-shadow: inset 0 -1px 0 var(--ta-border-strong); padding-bottom: 2px; }
        [data-status][data-state="live"] { color: var(--ta-text-primary); box-shadow: inset 0 -1px 0 var(--ta-text-primary); }
        [data-people-status] { margin: var(--ta-space-6) 0 0; font-size: var(--ta-text-md); color: var(--ta-text-secondary); }
        @media (max-width: 30rem) { [data-people-lead] { font-size: var(--ta-text-xl); } [data-people-lines] p { font-size: var(--ta-text-md); } }
      `}</style>

      <p style={MONO}>{PEOPLE_COPY.eyebrow}</p>
      <h2
        id="scene-people"
        style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, color: "var(--ta-text-primary)" }}
      >
        {PEOPLE_COPY.heading}
      </h2>
      <p data-people-lead>{PEOPLE_COPY.lead}</p>

      <div data-people-lines>
        <p>
          Five things are theirs to set: <em>{LEVERS.join(", ")}</em>.
        </p>
        <p>{PEOPLE_COPY.lines[1]}</p>
      </div>

      <p data-people-status>
        <span data-status data-state={status}>
          {STATUS_LABEL[status]}
        </span>{" "}
        <span>— {PEOPLE_COPY.statusSubject.toLowerCase()}.</span>
      </p>
    </div>
  );
}
