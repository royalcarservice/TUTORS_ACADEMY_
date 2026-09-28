import { Reveal } from "../reveal";

/* ════════════════════════════════════════════════════════════════════════
   SCENE 1 — THE PREMISE (Phase 4 · Step 3), authored.

   WHAT IS THIS PLACE? Answered concretely, in a contained Room on the Stage:
   a reading column at the prose container, generous rhythm, no spectacle.

   A BREATH, NOT A BLOW. After the hero's single statement the page goes
   quiet: `--ta-display-sm` (not xl), a lead of two sentences, three beats.
   A fourth beat was not written. subjectMode neutral, accentUse none: the
   only colour here is brand brass, spent on one hairline.

   EVERY CLAIM IS DEMONSTRABLE TODAY (cross-checked in the step report):
     · six subject environments, each with its own structure — /subjects/*
       renders a Stage with the subject's motif, atmosphere and accent (3.3/3.6)
     · inside a Room the environment steps back — Room refuses substrate,
       reduces density, keeps accent (3.3 Part 6, enforced in code)
     · switching subjects changes the environment in place — the 3.4 switch,
       ≤700ms, text never reflows
   No roadmap content. That is Scene 6's job.

   Server component. No client JS; the spine's one-shot Reveal is the only
   enhancement, and without it the prose is simply there.
   ════════════════════════════════════════════════════════════════════════ */

/* ALL AUTHORED COPY, exported so the dev specimen shows it verbatim. */
export const PREMISE_COPY = {
  eyebrow: "The premise",
  heading: "Built as places, not pages.",
  lead: "Tutors Academy is a set of subject environments. Each subject has its own structure, colour and calm, and you work inside it rather than scrolling past it.",
  /* Candidate B — not shipped; kept for the review. */
  leadCandidateB: "A subject here is not a list of videos. It is an environment you work inside, built around the way that subject is learned.",
} as const;

export const BEATS = [
  {
    title: "Six subjects, six environments.",
    body: "Mathematics is a lattice on graphite. English is a page. The structure changes with the subject; the way you read does not.",
  },
  {
    title: "The environment steps back when you work.",
    body: "Inside a room the atmosphere quiets and the reading measure holds. The subject's accent stays; nothing else competes with the text.",
  },
  {
    title: "Moving between subjects is one motion.",
    body: "Switch from one subject to another and the environment changes in place, in under a second, without the text moving.",
  },
] as const;

export function PremiseScene() {
  return (
    <div data-premise data-spatial="room">
      <Reveal>
      <style>{`
        [data-premise] { max-width: var(--ta-container-prose); padding-block: var(--ta-space-block); }
        [data-premise-lead] { margin: var(--ta-space-4) 0 0; font-size: var(--ta-text-xl); line-height: 1.5; color: var(--ta-text-primary); text-wrap: pretty; }
        [data-premise-beats] { list-style: none; margin: var(--ta-space-block) 0 0; padding: var(--ta-space-block) 0 0; border-top: 1px solid var(--ta-brand-quiet); display: grid; gap: var(--ta-space-stack); }
        [data-premise-beats] h3 { margin: 0; font-family: var(--ta-font-display); font-weight: 500; font-size: var(--ta-text-lg); color: var(--ta-text-primary); }
        [data-premise-beats] p { margin: var(--ta-space-1) 0 0; font-size: var(--ta-text-md); line-height: 1.6; color: var(--ta-text-secondary); }
        [data-premise-beats] li { padding-block: var(--ta-space-2); }
        @media (max-width: 30rem) {
          [data-premise-lead] { font-size: var(--ta-text-lg); }
          [data-premise] { padding-block: var(--ta-space-6); }
          [data-premise-beats] { margin-top: var(--ta-space-6); padding-top: var(--ta-space-6); }
          [data-premise-beats] p { font-size: var(--ta-text-sm); }
        }
      `}</style>

      <p
        style={{
          margin: 0,
          fontFamily: "var(--ta-font-mono)",
          fontSize: "var(--ta-text-2xs)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ta-text-muted)",
        }}
      >
        {PREMISE_COPY.eyebrow}
      </p>
      <h2
        id="scene-premise"
        style={{
          margin: "var(--ta-space-2) 0 0",
          fontFamily: "var(--ta-font-display)",
          fontSize: "var(--ta-display-sm)",
          fontWeight: 500,
          lineHeight: 1.15,
          color: "var(--ta-text-primary)",
          textWrap: "balance",
        }}
      >
        {PREMISE_COPY.heading}
      </h2>

      {/* THE LEAD — two sentences. Candidate A (recommended); B is in the report. */}
      <p data-premise-lead>{PREMISE_COPY.lead}</p>

      {/* THREE BEATS. If a fourth appears, cut one. */}
      <ul data-premise-beats>
        {BEATS.map((b) => (
          <li key={b.title}>
            <h3>{b.title}</h3>
            <p>{b.body}</p>
          </li>
        ))}
      </ul>
      </Reveal>
    </div>
  );
}
