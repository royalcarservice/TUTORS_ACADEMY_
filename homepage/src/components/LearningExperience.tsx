import { forwardRef, useId, useRef } from "react";
import { LEARNING_STAGES, SAMPLE_QUESTION } from "../data/copy";
import type { NumericInteraction } from "../data/subjects";
import { Eyebrow } from "./Primitives";
import { Practice } from "./Practice";
import { useSculptureMode } from "../lib/sculpture-context";
import { StaticSculpture } from "../three/StaticSculpture";
import { cn } from "../lib/cn";

/* ════════════════════════════════════════════════════════════════════════
   LEARNING EXPERIENCE

   Halo's split use-case section: a plain-language column on the left, one
   large rounded composition on the right. The right side is briefly pinned
   (see useScrollChoreography) so the three stages can be compared without
   the page running away.

   The middle block of that composition is a transparent window — every
   ancestor up to the root is transparent too, so the fixed canvas genuinely
   shows through it and the unified structure re-forms as the stage changes.
   The surrounding blocks are opaque, which is what keeps the text readable.

   The sample question is real: it checks the answer and shows the working.
   ════════════════════════════════════════════════════════════════════════ */

const SAMPLE: NumericInteraction = {
  kind: "numeric",
  prompt: SAMPLE_QUESTION.eyebrow,
  label: `${SAMPLE_QUESTION.prompt} ${SAMPLE_QUESTION.question}`,
  answer: SAMPLE_QUESTION.answer,
  tolerance: SAMPLE_QUESTION.tolerance,
  unit: "km/h",
  work: SAMPLE_QUESTION.work,
};

export interface LearningExperienceProps {
  stage: number;
  onStageChange: (index: number) => void;
}

export const LearningExperience = forwardRef<
  HTMLDivElement,
  LearningExperienceProps
>(function LearningExperience({ stage: active, onStageChange }, panelRef) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabsId = useId();
  const stage = LEARNING_STAGES[active]!;
  const { live } = useSculptureMode();

  const select = (i: number) => {
    onStageChange(i);
    tabRefs.current[i]?.focus();
  };

  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const last = LEARNING_STAGES.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    select(next);
  };

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="scroll-mt-24 px-3 py-20 sm:px-6 lg:px-10 lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-[1440px] items-start gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        {/* ── left column ─────────────────────────────────────────────── */}
        <div data-reveal className="lg:sticky lg:top-28">
          <Eyebrow>Learning experience</Eyebrow>
          <h2
            id="experience-heading"
            className="display mt-5 text-[2.125rem] text-ink sm:text-5xl lg:text-[3.25rem]"
          >
            From curiosity to understanding.
          </h2>
          <p className="mt-6 max-w-[30rem] text-[1.0625rem] leading-[1.65] text-ink-soft">
            Three moves, in this order, for almost anything you meet here. The
            structure on the right is the same one from the top of the page —
            it has reconnected, and it re-forms as you move between the
            stages.
          </p>

          <ol className="mt-8 grid gap-3">
            {LEARNING_STAGES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onStageChange(i)}
                  aria-current={active === i ? "step" : undefined}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors",
                    active === i
                      ? "border-ink bg-paper"
                      : "border-line bg-paper/70 hover:border-line-2 hover:bg-paper",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold",
                      active === i ? "bg-ink text-white" : "bg-ground text-ink-muted",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[0.9375rem] font-medium text-ink">
                      {s.label}
                    </span>
                    <span className="mt-1 block text-[0.875rem] leading-relaxed text-ink-soft">
                      {s.heading}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* ── pinned composition ──────────────────────────────────────── */}
        <div ref={panelRef}>
          {/* Transparent frame — the window inside must reach the canvas. */}
          <div className="rounded-card border border-line p-2.5 sm:p-3.5">
            <div className="rounded-[1.15rem] border border-line bg-paper">
              <div
                role="tablist"
                aria-label="Learning stages"
                className="flex gap-1 border-b border-line p-2"
              >
                {LEARNING_STAGES.map((s, i) => (
                  <button
                    key={s.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    role="tab"
                    id={`${tabsId}-tab-${s.id}`}
                    aria-selected={active === i}
                    aria-controls={`${tabsId}-panel`}
                    tabIndex={active === i ? 0 : -1}
                    onKeyDown={(e) => onTabKey(e, i)}
                    onClick={() => onStageChange(i)}
                    className={cn(
                      "min-h-11 flex-1 rounded-full px-4 text-[0.875rem] font-medium transition-colors",
                      active === i
                        ? "bg-ink text-white"
                        : "text-ink-soft hover:bg-ground hover:text-ink",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div
                role="tabpanel"
                id={`${tabsId}-panel`}
                aria-labelledby={`${tabsId}-tab-${stage.id}`}
                className="p-5 sm:p-7"
              >
                <h3 className="display text-[1.375rem] text-ink sm:text-[1.75rem]">
                  {stage.heading}
                </h3>
                <p className="mt-3 max-w-[36rem] text-[0.9375rem] leading-[1.7] text-ink-soft">
                  {stage.body}
                </p>
                <ul className="mt-5 grid gap-2">
                  {stage.detail.map((d) => (
                    <li
                      key={d}
                      className="flex gap-3 text-[0.875rem] leading-relaxed text-ink-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass"
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* The 3D window. */}
            <div
              data-sculpture-window
              className="relative mt-2.5 h-[30vh] min-h-[200px] overflow-hidden rounded-[1.15rem] border border-line sm:h-[34vh]"
            >
              {!live && (
                <StaticSculpture
                  variant="unified"
                  className="absolute inset-0 h-full w-full p-4 opacity-90"
                />
              )}
              <span className="eyebrow absolute top-3.5 left-4 text-ink-muted">
                {stage.label} composition
              </span>
            </div>

            <div className="mt-2.5 rounded-[1.15rem] border border-line bg-paper p-5 sm:p-7">
              <h3 className="eyebrow text-ink-muted">Try it now</h3>
              <div className="mt-4">
                <Practice interaction={SAMPLE} />
              </div>
              <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-muted">
                One sample question, answered locally in your browser. No
                account, no saved progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
