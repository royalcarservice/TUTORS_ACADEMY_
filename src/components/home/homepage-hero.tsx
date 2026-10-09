"use client";

/* ════════════════════════════════════════════════════════════════════
   HOMEPAGE HERO — static cinematic video hero (DEC-053)

   The previous pinned landscape transition is intentionally gone.
   This remains the regular, full-screen Tutors Academy hero: the
   existing cinematic video, original headline/support copy, logo/nav
   layering, and exactly the two existing journey links. No valley
   illustration, pin, scroll-triggered camera move, veil, or handoff.
   The carousel below now follows through normal document scrolling.
   ════════════════════════════════════════════════════════════════════ */

import Link from "next/link";
import { HeroVideo } from "./hero-video";
import { HeroEnter } from "./hero-enter";
import { ROUTES } from "@/config/routes";

export function HomepageHero() {
  return (
    <section
      className="relative isolate h-screen min-h-[620px] h-[100svh] overflow-hidden"
      aria-label="Tutors Academy"
    >
      <HeroVideo />
      <HeroEnter />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 text-center" style={{ paddingTop: "clamp(96px, 12vh, 120px)" }}>
        <h1
          data-hero-enter
          className="ta-font-inter mx-auto"
          style={{
            fontSize: "clamp(40px, 5.4vw, 72px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontWeight: 400,
            color: "#FFFFFF",
            textShadow: "0 2px 28px rgba(8,22,40,0.38)",
          }}
        >
          Learn without limits.
          <br />
          <span style={{ color: "rgba(255,255,255,0.88)" }}>Grow beyond expectations.</span>
        </h1>
      </div>

      <div className="absolute inset-x-0 bottom-14 z-10 flex flex-col items-center px-4 text-center">
        <div data-hero-enter className="flex flex-col items-center gap-5">
          <div className="ta-font-barlow mx-auto max-w-xl space-y-1.5">
            <p className="text-base" style={{ color: "rgba(255,255,255,0.96)", textShadow: "0 1px 14px rgba(8,22,40,0.45)" }}>
              Personalised tutoring shaped around your pace, your goals, and your potential.
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.88)", textShadow: "0 1px 14px rgba(8,22,40,0.45)" }}>
              Build understanding, grow in confidence, and take your next step with Tutors Academy.
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col items-stretch justify-center gap-4 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
            <Link
              href={ROUTES.register}
              className="ta-btn ta-btn-solid inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold"
            >
              Apply as Student
            </Link>
            <Link
              href={ROUTES.tutorApply}
              className="ta-btn ta-btn-glass liquid-glass inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold"
              style={{ border: "1px solid rgba(255,255,255,0.55)" }}
            >
              Become a Tutor
            </Link>
          </div>
          <p className="text-[0.68rem] font-semibold tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 12px rgba(8,22,40,0.5)" }}>
            LEARN • GROW • SUCCEED
          </p>
        </div>
      </div>
    </section>
  );
}
