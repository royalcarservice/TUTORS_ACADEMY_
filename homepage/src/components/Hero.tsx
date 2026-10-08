import { ArrowDown, ArrowRight } from "lucide-react";
import { HERO } from "../data/copy";
import { SUBJECTS } from "../data/subjects";
import { Pill, PillGhost, Eyebrow } from "./Primitives";
import { scrollToSection } from "../lib/scroll";
import { cn } from "../lib/cn";
import { useSculptureMode } from "../lib/sculpture-context";
import { StaticSculpture } from "../three/StaticSculpture";

/* ════════════════════════════════════════════════════════════════════════
   HERO

   A single large rounded container (Halo's device). The copy column is
   frosted so it stays readable; the sculpture column is left clear so the
   live 3D sits in the composition rather than behind a wall of white.

   On small screens the sculpture gets its own bordered window below the copy
   — that window is also the anchor the rig is pulled into, so the 3D is never
   buried under the text and the primary action stays above the fold.
   ════════════════════════════════════════════════════════════════════════ */

export function Hero() {
  const { live } = useSculptureMode();

  return (
    <section
      aria-labelledby="hero-heading"
      className="px-3 pt-24 sm:px-6 sm:pt-28 lg:px-10 lg:pt-32"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="overflow-hidden rounded-[2.25rem] border border-line">
          <div className="grid lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
            {/* ── copy column ─────────────────────────────────────────── */}
            <div
              className={cn(
                "bg-paper/88 px-6 py-10 backdrop-blur-[2px] sm:px-10 sm:py-14",
                "lg:px-14 lg:py-16",
                "rounded-tl-[2.2rem] rounded-tr-[2.2rem] lg:rounded-tr-none lg:rounded-bl-[2.2rem]",
              )}
            >
              <Eyebrow>Tutors Academy</Eyebrow>

              <h1
                id="hero-heading"
                className="display mt-6 text-[2.75rem] text-ink sm:text-6xl lg:text-[4.25rem]"
              >
                {HERO.headline}
              </h1>

              <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.6] text-ink-soft sm:text-lg">
                {HERO.body}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Pill
                  onClick={() => scrollToSection("subjects")}
                  icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  {HERO.primary}
                </Pill>
                <PillGhost
                  onClick={() => scrollToSection("experience")}
                  icon={<ArrowDown className="h-4 w-4" aria-hidden="true" />}
                >
                  {HERO.secondary}
                </PillGhost>
              </div>

              <SubjectStrip />
            </div>

            {/* ── sculpture column ────────────────────────────────────── */}
            <div
              className="relative hidden lg:block lg:min-h-[600px]"
              aria-hidden="true"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_62%_45%,rgba(255,255,255,0.55),rgba(255,255,255,0)_62%)]" />
              {!live && (
                <StaticSculpture
                  variant="armature"
                  className="absolute inset-0 h-full w-full p-8 lg:p-14"
                />
              )}
              <span className="absolute right-6 bottom-6 max-w-[13rem] text-right text-[0.75rem] leading-relaxed text-ink-muted">
                {HERO.sculptureCaption}
              </span>
            </div>
          </div>

          {/* ── compact sculpture window (anchor target) ─────────────── */}
          <div className="border-t border-line lg:hidden">
            <div
              data-sculpture-window
              aria-hidden="true"
              className="relative mx-3 my-3 h-[38vh] min-h-[240px] overflow-hidden rounded-3xl border border-line bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.5),rgba(255,255,255,0)_70%)]"
            >
              {!live && (
                <StaticSculpture
                  variant="armature"
                  className="absolute inset-0 h-full w-full p-4"
                />
              )}
              <span className="absolute bottom-3 left-4 text-[0.6875rem] tracking-[0.12em] text-ink-muted uppercase">
                {HERO.sculptureCaption}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Subtle looping strip of the six subject names. Decorative — the subjects
 *  are listed properly, and operably, in the explorer below. */
function SubjectStrip() {
  const names = SUBJECTS.map((s) => s.name);
  return (
    <div className="mt-12 border-t border-line pt-6" aria-hidden="true">
      <p className="eyebrow mb-4 text-ink-muted">Six subject spaces</p>
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <ul key={dup} className="flex shrink-0 items-center">
              {names.map((name) => (
                <li key={name} className="flex items-center">
                  <span className="px-5 text-[1.0625rem] whitespace-nowrap text-ink-2">
                    {name}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-brass" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
