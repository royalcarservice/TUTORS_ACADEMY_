import { ArrowRight } from "lucide-react";
import { FINAL } from "../data/copy";
import { Pill } from "./Primitives";
import { scrollToSection } from "../lib/scroll";
import { useSculptureMode } from "../lib/sculpture-context";
import { StaticSculpture } from "../three/StaticSculpture";

/* ════════════════════════════════════════════════════════════════════════
   FINAL CALL TO ACTION

   The last stretch of the scroll track is where the sculpture settles into
   the compact academy emblem. The dark block holds the copy; the window
   beside it is transparent all the way down to the root, so the emblem is
   genuinely visible rather than implied. The button returns the visitor to
   the subject explorer.
   ════════════════════════════════════════════════════════════════════════ */

export function FinalCta() {
  const { live } = useSculptureMode();

  return (
    <section
      aria-labelledby="final-heading"
      className="px-3 pt-10 pb-8 sm:px-6 lg:px-10 lg:pt-16"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div
          data-reveal
          className="grid gap-4 rounded-[2.25rem] border border-line p-3 sm:p-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        >
          <div className="rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 lg:px-14 lg:py-16">
            <h2
              id="final-heading"
              className="display text-[2.25rem] text-white sm:text-5xl lg:text-[3.5rem]"
            >
              {FINAL.heading}
            </h2>
            <p className="mt-6 max-w-[30rem] text-[1.0625rem] leading-[1.65] text-white/65">
              {FINAL.body}
            </p>
            <div className="mt-9">
              <Pill
                onClick={() => scrollToSection("subjects")}
                className="bg-white text-ink hover:bg-white/90 hover:shadow-[0_14px_34px_-18px_rgba(255,255,255,0.6)]"
                icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                {FINAL.cta}
              </Pill>
            </div>
          </div>

          <div
            data-sculpture-window
            className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-line lg:min-h-[420px]"
          >
            {!live && (
              <StaticSculpture
                variant="emblem"
                className="absolute inset-0 h-full w-full p-8"
              />
            )}
            <span className="eyebrow absolute bottom-5 left-6 text-ink-muted">
              Academy emblem
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
