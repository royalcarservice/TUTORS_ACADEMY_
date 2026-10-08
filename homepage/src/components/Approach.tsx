import { Check } from "lucide-react";
import { APPROACH, FEATURE_CARDS } from "../data/copy";
import { SUBJECTS } from "../data/subjects";
import { Eyebrow } from "./Primitives";
import { MotifGlyph } from "../three/MotifGlyph";
import { cn } from "../lib/cn";
import { useSculptureMode } from "../lib/sculpture-context";
import { StaticSculpture } from "../three/StaticSculpture";

/* ════════════════════════════════════════════════════════════════════════
   OUR APPROACH

   Halo's two-column introduction, then an asymmetric card grid: one large
   light card carrying a live 3D window, two dark cards beside it.

   The large card is deliberately not a solid block. Its middle region is a
   transparent window — the fixed canvas shows through it, and the rig is
   pulled to exactly that rectangle by the anchor reader in lib/scroll.ts.
   ════════════════════════════════════════════════════════════════════════ */

export function Approach() {
  const { live } = useSculptureMode();

  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className="scroll-mt-24 px-3 py-20 sm:px-6 lg:px-10 lg:py-28"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        {/* ── two-column introduction ─────────────────────────────────── */}
        <div
          data-reveal
          className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-20"
        >
          <h2
            id="approach-heading"
            className="display text-[2.125rem] text-ink sm:text-5xl lg:text-[3.5rem]"
          >
            {APPROACH.heading}
          </h2>
          <div className="lg:pt-3">
            <p className="max-w-[38rem] text-[1.0625rem] leading-[1.65] text-ink-soft">
              {APPROACH.body}
            </p>
            <p className="mt-6 max-w-[34rem] border-l-2 border-brass pl-5 text-[0.9375rem] leading-relaxed text-ink-2">
              {APPROACH.aside}
            </p>
          </div>
        </div>

        {/* ── asymmetric card grid ────────────────────────────────────── */}
        <div
          data-reveal
          className="mt-14 grid gap-4 sm:gap-5 lg:mt-20 lg:grid-cols-12"
        >
          {/* Large light card with the live sculpture window. */}
          <article
            aria-labelledby="card-explore"
            className="rounded-card border border-line p-2.5 sm:p-3.5 lg:col-span-7"
          >
            <div className="rounded-[1.15rem] bg-paper p-6 sm:p-9">
              <Eyebrow>{FEATURE_CARDS[0]!.eyebrow}</Eyebrow>
              <h3
                id="card-explore"
                className="display mt-5 text-[1.75rem] text-ink sm:text-[2.125rem]"
              >
                {FEATURE_CARDS[0]!.title}
              </h3>
              <p className="mt-5 max-w-[34rem] text-[1rem] leading-[1.65] text-ink-soft">
                {FEATURE_CARDS[0]!.body}
              </p>
            </div>

            <div
              data-sculpture-window
              aria-hidden="true"
              className="relative mt-2.5 h-[38vh] min-h-[260px] overflow-hidden rounded-[1.15rem] border border-line bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.5),rgba(255,255,255,0)_72%)] sm:h-[44vh]"
            >
              {!live && (
                <StaticSculpture
                  variant="motifs"
                  className="absolute inset-0 h-full w-full p-6"
                />
              )}
              <span className="eyebrow absolute top-4 left-5 text-ink-muted">
                {live ? "Live sculpture" : "The six subject motifs"}
              </span>
              <span className="absolute right-5 bottom-4 max-w-[15rem] text-right text-[0.75rem] leading-relaxed text-ink-muted">
                Scroll: the structure opens into six subject elements, then
                into each subject's own motif.
              </span>
            </div>

            <ul className="mt-2.5 grid gap-2 rounded-[1.15rem] bg-paper p-6 sm:grid-cols-3 sm:p-7">
              {FEATURE_CARDS[0]!.bullets!.map((b) => (
                <li
                  key={b}
                  className="flex gap-2.5 text-[0.875rem] leading-relaxed text-ink-soft"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-deep" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Two dark cards. */}
          <DarkCard
            card={FEATURE_CARDS[1]!}
            className="lg:col-span-5"
            extra={<MotifRow />}
          />
          <DarkCard
            card={FEATURE_CARDS[2]!}
            className="lg:col-span-5"
            extra={<PracticePreview />}
          />
        </div>
      </div>
    </section>
  );
}

function DarkCard({
  card,
  className,
  extra,
}: {
  card: (typeof FEATURE_CARDS)[number];
  className?: string;
  extra: React.ReactNode;
}) {
  return (
    <article
      aria-labelledby={`card-${card.id}`}
      className={cn(
        "flex flex-col rounded-card bg-ink p-6 text-white sm:p-9",
        "shadow-[0_24px_60px_-40px_rgba(11,11,12,0.9)]",
        className,
      )}
    >
      <Eyebrow tone="light">{card.eyebrow}</Eyebrow>
      <h3
        id={`card-${card.id}`}
        className="display mt-5 text-[1.5rem] text-white sm:text-[1.875rem]"
      >
        {card.title}
      </h3>
      <p className="mt-4 max-w-[32rem] text-[0.9375rem] leading-[1.7] text-white/65">
        {card.body}
      </p>

      <div className="mt-7">{extra}</div>

      <ul className="mt-7 grid gap-2.5 border-t border-white/10 pt-6">
        {card.bullets!.map((b) => (
          <li key={b} className="flex gap-2.5 text-[0.875rem] leading-relaxed text-white/70">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brass-soft" aria-hidden="true" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** The six motifs, in their own accents — what "a space per subject" means. */
function MotifRow() {
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 lg:grid-cols-3">
      {SUBJECTS.map((s) => (
        <li
          key={s.id}
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3"
        >
          <MotifGlyph
            motif={s.motif}
            className="h-6 w-6"
            // accentOnDark is the brightened variant, so the mark stays
            // legible against the ink surface.
            style={{ color: s.accentOnDark }}
          />
          <span className="text-[0.6875rem] leading-tight text-white/70">
            {s.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PracticePreview() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="eyebrow text-white/60">Sample</p>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/85">
        Solve for x:&nbsp;
        <span className="font-medium text-white">5(x − 2) = 3x + 8</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[0.8125rem] text-white/85">
          x = 9
        </span>
        <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-teal-soft">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Working shown
        </span>
      </div>
    </div>
  );
}
