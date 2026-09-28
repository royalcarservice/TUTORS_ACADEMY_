/* ════════════════════════════════════════════════════════════════════════
   SCENE 6 — THE PRACTICE (Phase 4 · Step 6), authored. ONE SESSION'S ARC.

   Four beats, one thread: you attend (LIVE) → you revisit (RECORDED) →
   you work with resources and help (ASSISTED) → you see yourself move
   (PROGRESS). Not four features, not cards, not a grid: a single vertical
   thread with the beats hung off it at alternating offsets, so the eye
   walks a path rather than scanning a table.

   The `sequence` scroll behaviour's ONE legitimate use: beats are ordered
   in time, so revealing them one after another as they enter view is the
   content's own structure, not decoration. Implemented with the existing
   one-shot Reveal only — nothing sticks, nothing traps, no scroll is
   required for completeness (no-JS and reduced motion render the whole
   story static and complete; the reveal class is added after hydration).

   Nothing here is an interface. No player, list, chat, browser, chart,
   ring, streak, calendar, card, meeting or notification UI. Typography,
   a hairline thread, copy — and the honesty treatment: every beat carries
   its DERIVED state, and the scene ends with ONE consolidated statement of
   what exists today and what is next, in order. No dates. No CTA.
   ════════════════════════════════════════════════════════════════════════ */

import { PLATFORM_MODULES } from "@/config/modules";

import { Reveal } from "../reveal";
import { STATUS_LABEL, statusFor, type ModuleEntry, type StatusState } from "./status";

export interface Beat {
  id: "live" | "recorded" | "assisted" | "progress";
  label: string;
  /** SHIPPED phrasing (≤2 sentences). */
  text: string;
  /** Alternate phrasing — not shipped; kept for the report. */
  alt: string;
  /** Registry modules this beat depends on (state derived from them). */
  modules: readonly string[];
}

export const BEATS: readonly Beat[] = [
  {
    id: "live",
    label: "You attend",
    text: "The class happens live, in the same room you entered from this page, with the tutor and whoever else is in it.",
    alt: "Classes happen live, in a shared room inside the environment.",
    modules: ["live-classroom"],
  },
  {
    id: "recorded",
    label: "You revisit",
    text: "Afterwards the class is still there, as a recording, with the notes beside it. Miss one and it waits for you.",
    alt: "Every session is recorded and kept, so you can go back to it.",
    modules: ["recorded-classes"],
  },
  {
    id: "assisted",
    label: "You work",
    text: "You do the work in the same place: the assignments, the notes from class, and help when you are stuck — from the tutor, or from the assistant.",
    alt: "Assignments, notes and an assistant, all in one place.",
    modules: ["assignments", "ai-assistant"],
  },
  {
    id: "progress",
    label: "You see yourself move",
    text: "Your work leaves a record. You and your tutor read the same one, so you can both see where you have moved.",
    alt: "Your progress is kept over time, visible to you and your tutor.",
    modules: ["student-portal"],
  },
] as const;

export const PRACTICE_COPY = {
  eyebrow: "The practice",
  heading: "One session, start to finish.",
  /* Lead A — SHIPPED. */
  lead: "Everything below happens inside an environment you have already seen.",
  /* Lead B — not shipped. */
  leadCandidateB: "A session here is not a video call with homework attached. It is one thread: you attend, you revisit, you work, you see yourself move.",
  /* Consolidated statement A — SHIPPED (the module list is derived). */
  consolidatedLive: "Live today: six environments and the switch between them.",
  consolidatedNextPrefix: "Next, in this order:",
  /* Consolidated statement B — not shipped. */
  consolidatedCandidateB:
    "What exists is the ground: six environments, built, open one at a time. What comes next is built on it, in order — the live class first, then its recording, then the work and the help, then the record.",
  /* Narrative line into Scene 7 (not a CTA, not a link). */
  outro: "What we will hold ourselves to comes next.",
} as const;

/** Human names for the consolidated list, in ARC order (derived from the beats, not hand-ordered). */
const BEAT_PHRASE: Record<Beat["id"], string> = {
  live: "live classes",
  recorded: "recordings and notes",
  assisted: "assignments, tests and the assistant",
  progress: "your record of progress",
};

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

export function nextInOrder(modules: ModuleEntry[]): string[] {
  return BEATS.filter((b) => statusFor(modules, b.modules) !== "live").map((b) => BEAT_PHRASE[b.id]);
}

export function PracticeScene({ modules = REGISTRY }: { entries?: unknown; modules?: ModuleEntry[] }) {
  const states: Record<string, StatusState> = {};
  for (const b of BEATS) states[b.id] = statusFor(modules, b.modules);
  const next = nextInOrder(modules);

  return (
    <div data-practice>
      <style>{`
        [data-practice-lead] { margin: var(--ta-space-3) 0 0; font-size: var(--ta-text-lg); line-height: 1.5; color: var(--ta-text-secondary); max-width: var(--ta-measure); }
        [data-thread] { list-style: none; margin: var(--ta-space-8) 0 0; padding: 0 0 0 var(--ta-space-6); position: relative; max-width: 44rem; }
        [data-thread]::before { content: ""; position: absolute; left: 0; top: 0.6em; bottom: 0.6em; width: 1px; background: var(--ta-border-strong); }
        [data-beat] { position: relative; margin: 0; }
        [data-beat] + [data-beat] { margin-top: var(--ta-space-8); }
        [data-beat]:nth-child(even) { padding-left: clamp(0px, 10vw, 6rem); }
        [data-beat]::before { content: ""; position: absolute; left: calc(-1 * var(--ta-space-6) - 3px); top: 0.55em; width: 7px; height: 7px; border-radius: 50%; background: var(--ta-surface-base); border: 1px solid var(--ta-text-primary); }
        [data-beat-label] { font-family: var(--ta-font-display); font-weight: 500; font-size: var(--ta-text-xl); color: var(--ta-text-primary); margin: 0; }
        [data-beat-text] { margin: var(--ta-space-2) 0 0; font-size: var(--ta-text-lg); line-height: 1.5; color: var(--ta-text-secondary); max-width: 46ch; }
        [data-beat-status] { margin: var(--ta-space-2) 0 0; }
        [data-status] { display: inline-flex; align-items: baseline; gap: var(--ta-space-2); font-family: var(--ta-font-mono); font-size: var(--ta-text-sm); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-text-secondary); box-shadow: inset 0 -1px 0 var(--ta-border-strong); padding-bottom: 2px; }
        [data-status][data-state="live"] { color: var(--ta-text-primary); box-shadow: inset 0 -1px 0 var(--ta-text-primary); }
        [data-consolidated] { margin: var(--ta-space-12) 0 0; padding-top: var(--ta-space-6); border-top: 1px solid var(--ta-border-subtle); max-width: var(--ta-measure); }
        [data-consolidated] p { margin: 0; font-size: var(--ta-text-md); line-height: 1.55; color: var(--ta-text-primary); }
        [data-consolidated] p + p { margin-top: var(--ta-space-2); color: var(--ta-text-secondary); }
        [data-outro] { margin: var(--ta-space-6) 0 0; font-family: var(--ta-font-display); font-size: var(--ta-text-lg); color: var(--ta-text-muted); }
        @media (max-width: 30rem) { [data-beat]:nth-child(even) { padding-left: 0; } [data-beat-text] { font-size: var(--ta-text-md); } }
      `}</style>

      <p style={MONO}>{PRACTICE_COPY.eyebrow}</p>
      <h2
        id="scene-practice"
        style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, color: "var(--ta-text-primary)" }}
      >
        {PRACTICE_COPY.heading}
      </h2>
      <p data-practice-lead>{PRACTICE_COPY.lead}</p>

      <ol data-thread aria-label="One session, in order">
        {BEATS.map((b, i) => (
          <li key={b.id} data-beat={b.id}>
            <Reveal>
              <p style={{ ...MONO, marginBottom: "var(--ta-space-1)" }}>
                {i + 1} of {BEATS.length}
              </p>
              <h3 data-beat-label>{b.label}</h3>
              <p data-beat-text>{b.text}</p>
              <p data-beat-status>
                <span data-status data-state={states[b.id]}>
                  {STATUS_LABEL[states[b.id]]}
                </span>
              </p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div data-consolidated data-testid="consolidated">
        <p>{PRACTICE_COPY.consolidatedLive}</p>
        {next.length > 0 && (
          <p>
            {PRACTICE_COPY.consolidatedNextPrefix} {next.join(", ")}.
          </p>
        )}
      </div>

      <p data-outro>{PRACTICE_COPY.outro}</p>
    </div>
  );
}
