"use client";

/* ════════════════════════════════════════════════════════════════════
   VALLEY JOURNEY — scroll-driven hero → gallery transition (DEC-051)

   A pinned (sticky) 380vh scene scrubbed by GSAP ScrollTrigger. The
   cinematic video is blended into a depth-separated valley: sky-matched
   video on top, far hills, mid meadow and foreground grass layered
   beneath it. As scroll progress advances the camera appears to travel
   FORWARD — the video dollies in (scale 1→1.32), foreground grass sweeps
   outward past the frame edges, mid/far layers part at different rates,
   the headline + buttons gently fade, and an ivory veil with golden
   motes rises to hand off to the warm learning gallery. Scrubbing is
   reversible: scrolling up rewinds every layer. No cuts, no blanks —
   the veil's ivory is the gallery's canvas colour.

   The video alone cannot carry a controllable camera; the layered
   valley supplies the parallax depth. Under prefers-reduced-motion the
   pin collapses (CSS) to a gentle static hero → gallery flow and no
   timeline is built.
   ════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroVideo } from "./hero-video";
import { HeroEnter } from "./hero-enter";
import { ROUTES } from "@/config/routes";

export function ValleyJourney() {
  const outerRef = useRef<HTMLElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const dollyRef = useRef<HTMLDivElement | null>(null);
  const farRef = useRef<HTMLDivElement | null>(null);
  const midRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const motesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const outer = outerRef.current;
    if (!outer) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outer,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
      },
      defaults: { ease: "none" },
    });

    tl.to([topRef.current, bottomRef.current], { y: -70, opacity: 0, duration: 0.28, ease: "power1.out" }, 0)
      // camera dolly forward through the valley
      .to(dollyRef.current, { scale: 1.32, yPercent: -7, duration: 0.75 }, 0)
      // depth layers part at different rates
      .to(farRef.current, { yPercent: 16, scale: 1.1, duration: 0.7 }, 0.02)
      .to(midRef.current, { yPercent: 34, scale: 1.22, duration: 0.66 }, 0.05)
      // foreground grass sweeps past the frame edges
      .to(fgRef.current, { scale: 2.3, opacity: 0, duration: 0.45, ease: "power1.in" }, 0.1)
      // the landscape opens into warm ivory + sunlight motes
      .to(veilRef.current, { opacity: 1, duration: 0.34, ease: "power1.inOut" }, 0.56)
      .to(motesRef.current, { opacity: 1, duration: 0.28 }, 0.64);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={outerRef} className="vj-outer relative h-[380vh]" aria-label="Tutors Academy">
      <style>{`
        .vj-layer { transform-origin: 50% 100%; }
        @media (prefers-reduced-motion: reduce) {
          .vj-outer { height: auto; }
          .vj-sticky { position: relative; }
          .vj-fg, .vj-motes, .vj-veil { display: none; }
        }
      `}</style>

      <div className="vj-sticky sticky top-0 h-screen h-[100svh] overflow-hidden">
        {/* dolly wrapper around the cinematic video */}
        <div ref={dollyRef} className="absolute inset-0 will-change-transform">
          <HeroVideo />
        </div>

        {/* depth-separated valley, sky-matched to the video */}
        <div ref={farRef} className="vj-layer pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
          <svg viewBox="0 0 1440 260" className="block w-full" preserveAspectRatio="none" style={{ height: "34vh" }}>
            <path d="M0 150 C240 90 420 120 720 96 C1020 72 1240 110 1440 84 L1440 260 L0 260 Z" fill="#BFDCCF" opacity="0.85" />
          </svg>
        </div>
        <div ref={midRef} className="vj-layer pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
          <svg viewBox="0 0 1440 220" className="block w-full" preserveAspectRatio="none" style={{ height: "26vh" }}>
            <path d="M0 120 C260 70 520 108 780 84 C1040 60 1260 96 1440 76 L1440 220 L0 220 Z" fill="#CFE0B4" opacity="0.95" />
            <path d="M0 150 C300 110 620 140 900 118 C1160 98 1320 128 1440 112 L1440 220 L0 220 Z" fill="#C3D6A4" opacity="0.9" />
          </svg>
        </div>
        <div ref={fgRef} className="vj-layer vj-fg pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
          <svg viewBox="0 0 1440 160" className="block w-full" preserveAspectRatio="none" style={{ height: "18vh" }}>
            <path d="M0 90 C180 60 360 84 540 66 C760 44 980 78 1200 58 C1320 48 1400 62 1440 56 L1440 160 L0 160 Z" fill="#9DBB8A" />
            {Array.from({ length: 48 }).map((_, i) => {
              const x = 15 + i * 30;
              const hgt = 26 + ((i * 13) % 22);
              return <path key={i} d={`M${x} 160 C${x + 2} ${160 - hgt * 0.6} ${x - 3} ${160 - hgt * 0.8} ${x + ((i % 3) - 1) * 6} ${160 - hgt}`} stroke="#8FAF7C" strokeWidth="3" fill="none" strokeLinecap="round" />;
            })}
            {Array.from({ length: 10 }).map((_, i) => {
              const x = 60 + i * 150;
              return (
                <g key={`f${i}`}>
                  <circle cx={x} cy={118 - (i % 3) * 10} r="5" fill="#FFFFFF" opacity="0.9" />
                  <circle cx={x} cy={118 - (i % 3) * 10} r="2.2" fill="#E7C878" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ivory veil + golden motes: the valley opens into the gallery light */}
        <div ref={veilRef} className="vj-veil pointer-events-none absolute inset-0 opacity-0" style={{ background: "linear-gradient(180deg, #FFF8ED 0%, #FDFBF7 55%, #FDFBF7 100%)" }} aria-hidden="true" />
        <div
          ref={motesRef}
          className="vj-motes pointer-events-none absolute inset-0 opacity-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 18% 30%, rgba(212,175,55,0.5) 50%, transparent 51%)," +
              "radial-gradient(1px 1px at 42% 62%, rgba(214,190,140,0.45) 50%, transparent 51%)," +
              "radial-gradient(2px 2px at 66% 24%, rgba(245,230,200,0.7) 50%, transparent 51%)," +
              "radial-gradient(1.5px 1.5px at 82% 52%, rgba(212,175,55,0.4) 50%, transparent 51%)," +
              "radial-gradient(1px 1px at 30% 80%, rgba(214,190,140,0.4) 50%, transparent 51%)," +
              "radial-gradient(2px 2px at 58% 74%, rgba(245,230,200,0.6) 50%, transparent 51%)",
            backgroundSize: "420px 420px",
          }}
        />

        {/* hero copy — fades as the journey begins */}
        <HeroEnter />
        <div ref={topRef} className="relative z-10 mx-auto w-full max-w-5xl px-4 text-center" style={{ paddingTop: "clamp(96px, 12vh, 120px)" }}>
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
        <div ref={bottomRef} className="absolute inset-x-0 z-10 flex flex-col items-center px-4 text-center" style={{ bottom: 56 }}>
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
      </div>
    </section>
  );
}
