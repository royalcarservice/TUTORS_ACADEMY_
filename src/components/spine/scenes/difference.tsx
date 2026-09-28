import { BrandMark } from "@/components/brand/brand";
import { SubjectMark } from "@/components/brand/subject-mark";
import { Motif } from "@/components/motif/motif";
import type { Density, MotifKind } from "@/lib/motif/types";

import { Reveal } from "../reveal";
import { DifferenceStagger } from "./difference-stagger";

/* ════════════════════════════════════════════════════════════════════════
   SCENE 2 — THE DIFFERENCE (Phase 4 · Step 3), authored. A SPECIMEN SHEET.

   THE CLAIM: one brand holds many environments. DEMONSTRATED, NOT CLAIMED —
   six specimens of the ACTUAL system, each a real [data-subject] scope
   resolving real tokens, a real motif fragment from the 3.3 grammar (edge
   role, room scope: low coverage, never substrate), the real subject mark,
   the real card geometry. Nothing here is a mockup, a screenshot, or data.

   THE CENTRAL VISUAL IDEA — WHAT STAYS IS DRAWN FIRST:
     Every plate is the same object: same outline (.ta-card, flat), same
     brass brand mark in the same corner, same type at the same size in the
     same place, same rule, same padding. The eye is given six identical
     frames and reads the ONE thing that differs inside each: accent + motif.
     Brass is never re-coloured by the scope — it is the constant made visible.

   THE BOUNDARY — this is not Scene 3:
     · no button, no link, no per-subject action, no hover state, no focus:
       specimens are display-only <figure>s, not tabbable, not interactive
     · no "choose / start / enter / begin / select" language anywhere here
     · no names, courses, progress, numbers, dates, schedules, statistics
     · the closing line is a sentence, not a control

   THE NON-VISUAL PATH IS DESIGNED: the constancy claim is stated in text; the
   comparison is a labelled list of six figures, each captioned with its
   subject name and motif as real text; the fragments are aria-hidden.
   ════════════════════════════════════════════════════════════════════════ */

export interface SpecimenEntry {
  id: string;
  name: string;
  motif?: string;
  density?: string;
}

/* ALL AUTHORED COPY, exported so the dev specimen shows it verbatim. */
export const DIFFERENCE_COPY = {
  eyebrow: "The difference",
  heading: "One brand. Six environments.",
  lead: "From one subject to the next, two things change: the accent and the motif. Everything else holds. The mark, the type and its scale, the spacing, the shape of each component, the way things move.",
  groupLabel: "Six environments, side by side",
  constancy: "The same components, the same type, the same rhythm. Only the environment changes.",
  next: "One of these six is the subject you are here for. It is next.",
  captionSuffix: " motif",
} as const;

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

function Specimen({ entry, index }: { entry: SpecimenEntry; index: number }) {
  const kind = (entry.motif ?? "lattice") as MotifKind;
  const density = (entry.density ?? "balanced") as Density;
  return (
    <li style={{ ["--i" as string]: index }}>
      <figure
        data-subject={entry.id}
        data-specimen
        data-spatial="room"
        className="ta-card"
        data-variant="flat"
      >
        {/* motif fragment — edge role, room scope (substrate impossible), aria-hidden by the renderer */}
        <Motif
          subject={entry.id}
          kind={kind}
          role="edge"
          density={density}
          scope="room"
          purpose="specimen"
          edgeSide="right"
          exclude={[{ x: 0, y: 0.58, w: 0.72, h: 0.42 }]}
        />
        <div data-specimen-face>
          <div data-specimen-top>
            {/* THE CONSTANT — brand brass, identical in all six, never scoped */}
            <BrandMark size={16} variant="brass" />
            {/* THE VARIABLE — the subject's own mark, in the scope's accent */}
            <span aria-hidden="true" style={{ color: "var(--ta-accent-1)" }}>
              <SubjectMark subject={entry.id} size={24} />
            </span>
          </div>
          <figcaption data-specimen-caption>
            <span aria-hidden="true" data-specimen-rule />
            <span data-specimen-name>{entry.name}</span>
            <span data-specimen-motif>{kind}{DIFFERENCE_COPY.captionSuffix}</span>
          </figcaption>
        </div>
      </figure>
    </li>
  );
}

export function DifferenceScene({ entries = [] }: { entries?: SpecimenEntry[] }) {
  return (
    <div data-difference>
      <style>{`
        [data-difference] { padding-block: var(--ta-space-block); }
        [data-difference-lead] { margin: var(--ta-space-4) 0 0; max-width: var(--ta-measure); font-size: var(--ta-text-lg); line-height: 1.55; color: var(--ta-text-secondary); text-wrap: pretty; }
        [data-specimen-row] { list-style: none; margin: var(--ta-space-3) 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--ta-space-3); }
        [data-specimen-row] > li { margin: 0; padding: 0; min-width: 0; }
        [data-specimen] { position: relative; isolation: isolate; margin: 0; aspect-ratio: 4 / 3; padding: var(--ta-pad-card); }
        [data-specimen-face] { position: relative; z-index: 1; display: flex; flex-direction: column; height: auto; min-height: 100%; }
        [data-specimen-top] { display: flex; align-items: center; justify-content: space-between; }
        [data-specimen-caption] { margin-top: auto; display: flex; flex-direction: column; gap: var(--ta-space-1); }
        [data-specimen-rule] { display: block; width: 2rem; height: 2px; border-radius: 1px; background: var(--ta-accent-1); margin-bottom: var(--ta-space-1); }
        [data-specimen-name] { font-family: var(--ta-font-display); font-weight: 500; font-size: var(--ta-text-xl); line-height: 1.1; color: var(--ta-text-primary); overflow-wrap: anywhere; }
        [data-specimen-motif] { font-family: var(--ta-font-mono); font-size: var(--ta-text-2xs); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ta-text-muted); }
        [data-difference-constancy] { margin: var(--ta-space-block) 0 0; max-width: var(--ta-measure); font-size: var(--ta-text-lg); line-height: 1.55; color: var(--ta-text-primary); }
        [data-difference-next] { margin: var(--ta-space-3) 0 0; max-width: var(--ta-measure); font-size: var(--ta-text-md); line-height: 1.6; color: var(--ta-text-secondary); }
        @media (max-width: 48rem) {
          [data-specimen-row] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 30rem) {
          [data-specimen-row] { gap: var(--ta-space-2); }
          [data-specimen] { aspect-ratio: 1 / 1; padding: var(--ta-space-3); }
          [data-specimen-name] { font-size: var(--ta-text-sm); }
          [data-difference] { padding-block: var(--ta-space-6); }
          [data-difference-lead], [data-difference-constancy] { font-size: var(--ta-text-md); }
        }
      `}</style>

      <Reveal>
        <p style={MONO}>{DIFFERENCE_COPY.eyebrow}</p>
        <h2
          id="scene-difference"
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
          {DIFFERENCE_COPY.heading}
        </h2>
        {/* WHAT CHANGES / WHAT DOES NOT — stated before it is shown */}
        <p data-difference-lead>{DIFFERENCE_COPY.lead}</p>
        <h3 id="scene-difference-specimens" style={{ ...MONO, marginTop: "var(--ta-space-block)" }}>
          {DIFFERENCE_COPY.groupLabel}
        </h3>
      </Reveal>

      <DifferenceStagger>
        {entries.map((e, i) => (
          <Specimen key={e.id} entry={e} index={i} />
        ))}
      </DifferenceStagger>

      {/* THE CONSTANCY, IN WORDS — the claim a screen-reader user hears */}
      <p data-difference-constancy>{DIFFERENCE_COPY.constancy}</p>
      {/* NARRATIVE LINE into Scene 3 — a sentence, not a control */}
      <p data-difference-next>{DIFFERENCE_COPY.next}</p>
    </div>
  );
}
