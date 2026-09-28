/* ════════════════════════════════════════════════════════════════════════
   SCENE 8 — THE RETURN (Phase 4 · Step 8), authored. THE DOOR OUT.

   One audience: the visitor who read all of it and never crossed. A recall,
   not a repeat — Scene 0's statement, verbatim, said to someone who now
   knows what a "place" is (an environment with five levers), what "enter"
   is (the crossing they watched), and how many of the six are actually
   open (derived, never authored). Same words, earned meaning.

   ONE primary action, back to THE CHOICE (Scene 3, `#for-students` — the
   hero's own door). No second wall of doors, no featured subject, no
   secondary action (the doubt-answering scenes are all above; the reader
   has read them). Static: no reveal, no stagger — an ending, not a peak.
   Left-set, short measure, one hairline; Scene 7 was a wide still centre.
   ════════════════════════════════════════════════════════════════════════ */

import Link from "next/link";

import { buttonClass } from "@/components/ui/button";

export interface ReturnEntry { id: string; name: string; status?: string }

export const RETURN_COPY = {
  eyebrow: "The return",
  /* Recall A — SHIPPED: Scene 0's h1, verbatim. */
  recall: "Every subject is a place you can enter.",
  /* Recall B — not shipped. */
  recallCandidateB: "A subject is a place. You have seen the one that is open.",
  /* Lead ≤2 sentences. */
  lead: "You have now seen what that means: the system, the doors, the crossing, and what is not built yet. The choice is where it was.",
  /* Action label ≤4 words — A shipped (Scene 0's verb, verbatim). */
  action: "Enter a world",
  actionCandidateB: "Back to the doors",
  actionHref: "#for-students",
  /* Closing line — the page's last authored words before the footer. */
  closing: "The page ends here. The environment does not.",
} as const;

const numberWord = (n: number) => ["No", "One", "Two", "Three", "Four", "Five", "Six"][n] ?? String(n);

/** Derived from config statuses (4.4 model) — never authored. */
export function openLine(entries: ReturnEntry[]): string {
  const n = entries.filter((e) => e.status && e.status !== "draft").length;
  if (entries.length === 0) return "";
  if (n === 0) return "No environment is open yet. The doors are still where the choice is made.";
  if (n === entries.length) return `All ${numberWord(n).toLowerCase()} environments are open.`;
  return `${numberWord(n)} of the ${numberWord(entries.length).toLowerCase()} ${n === 1 ? "is" : "are"} open today.`;
}

const MONO: React.CSSProperties = {
  fontFamily: "var(--ta-font-mono)",
  fontSize: "var(--ta-text-2xs)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ta-text-muted)",
  margin: 0,
};

export function ReturnScene({ entries = [] }: { entries?: ReturnEntry[] }) {
  const line = openLine(entries);
  return (
    <div data-return>
      <style>{`
        [data-return] { padding: var(--ta-space-8) 0; max-width: 40rem; }
        [data-return-lead] { margin: var(--ta-space-4) 0 0; font-size: var(--ta-text-lg); line-height: 1.5; color: var(--ta-text-secondary); }
        [data-return-open] { margin: var(--ta-space-2) 0 0; font-size: var(--ta-text-md); color: var(--ta-text-secondary); }
        [data-return-cta] { margin: var(--ta-space-6) 0 0; display: flex; flex-wrap: wrap; gap: var(--ta-space-3); }
        [data-return-cta] a { min-height: 48px; min-width: 48px; }
        [data-return-closing] { margin: var(--ta-space-8) 0 0; padding-top: var(--ta-space-4); border-top: 1px solid var(--ta-border-subtle); font-family: var(--ta-font-display); font-size: var(--ta-text-lg); color: var(--ta-text-muted); }
        @media (max-width: 30rem) { [data-return-cta] a { width: 100%; justify-content: center; } }
      `}</style>

      <p style={MONO}>{RETURN_COPY.eyebrow}</p>
      <h2
        id="scene-return"
        style={{ margin: "var(--ta-space-2) 0 0", fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, lineHeight: 1.1, color: "var(--ta-text-primary)", textWrap: "balance" }}
      >
        {RETURN_COPY.recall}
      </h2>
      <p data-return-lead>{RETURN_COPY.lead}</p>
      {line && <p data-return-open>{line}</p>}

      <div data-return-cta>
        <Link href={RETURN_COPY.actionHref} className={buttonClass("primary", "lg")} data-return-action>
          {RETURN_COPY.action}
        </Link>
      </div>

      <p data-return-closing>{RETURN_COPY.closing}</p>
    </div>
  );
}
