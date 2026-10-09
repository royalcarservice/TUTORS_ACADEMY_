"use client";

/* ════════════════════════════════════════════════════════════════════
   CAROUSEL JOURNEY — pinned scroll-driven horizontal 3D carousel
   (DEC-052, owner brief)

   Vertical scroll progress maps 1:1 onto the carousel's horizontal
   position (0→6) via a scrubbed ScrollTrigger on a sticky 560vh scene:
   cards glide right→left in order, the centred card faces forward,
   neighbours rotate/recede/scale per the carousel spec. Scrolling up
   reverses smoothly; after Computer Science centres, the pin releases
   into the next section. No trapped scroll, no second scrollbar.

   Keyboard ← → and touch/drag translate into the SAME scroll position
   (ScrollToPlugin / scrollBy), so every input stays synchronised with
   GSAP — no competing wheel or inertia systems.

   Reduced motion: the pin collapses (CSS) and the carousel renders a
   simple accessible horizontal snap gallery.
   ════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SubjectCarousel, type SubjectCarouselHandle } from "./subject-carousel";

const NAVY = "#0A192F";
const SLATE = "#475569";
const GOLD = "#C5A059";

export function CarouselJourney() {
  const outerRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<SubjectCarouselHandle | null>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const outer = outerRef.current;
    if (!outer) return;

    let self: ScrollTrigger | null = null;
    const st = ScrollTrigger.create({
      trigger: outer,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        self = s as ScrollTrigger;
        carouselRef.current?.setPosition(s.progress * 6);
      },
    });

    if (headRef.current) {
      gsap.from(headRef.current, {
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: outer, start: "top 85%" },
      });
    }

    /* keyboard ← → steps the scroll position (stays synchronised) */
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const s = self;
      if (!s || s.progress <= 0 || s.progress >= 1) return; // outside the pin: default behaviour
      const target = (ev: KeyboardEvent) => document.activeElement === ev.target;
      if (!target(e) && (document.activeElement as HTMLElement | null)?.closest("input,textarea,select,[contenteditable]")) return;
      e.preventDefault();
      const idx = Math.round(s.progress * 6);
      const next = Math.max(0, Math.min(6, idx + (e.key === "ArrowRight" ? 1 : -1)));
      gsap.to(window, {
        scrollTo: { y: s.start + (next / 6) * (s.end - s.start), autoKill: false },
        duration: 0.7,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };
    window.addEventListener("keydown", onKey);

    /* drag / touch swipe → the same vertical scroll */
    const stage = stageRef.current;
    let dragging = false;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      window.scrollBy(0, -dx * 3);
    };
    const up = () => {
      dragging = false;
    };
    if (stage) {
      stage.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    }

    return () => {
      st.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("keydown", onKey);
      if (stage) {
        stage.removeEventListener("pointerdown", down);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
      }
    };
  }, [reduced]);

  return (
    <section id="disciplines" ref={outerRef} className="cj-outer relative h-[560vh]" aria-label="Seven subjects">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cj-outer { height: auto; }
          .cj-sticky { position: relative; }
        }
      `}</style>
      <div className="cj-sticky sticky top-0 flex h-screen h-[100svh] flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #FDFBF7 0%, #F9F6F0 100%)" }}>
        <div ref={headRef} className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-20 text-center sm:pt-24">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>
            Explore your potential
          </p>
          <h2 className="mt-3 text-4xl sm:text-5xl" style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500, color: NAVY }}>
            Seven subjects.{" "}
            <span style={{ background: "linear-gradient(100deg, #E4C568, #C5A059 45%, #A07C2C)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Infinite possibilities.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base" style={{ color: SLATE }}>
            Explore your interests. Build your understanding. Shape your future.
          </p>
        </div>

        <div ref={stageRef} className="relative z-0 mt-2 flex-1 cursor-grab active:cursor-grabbing">
          <SubjectCarousel
            ref={carouselRef}
            reduced={reduced}
            maxRotationDegrees={28}
            maxDepthPx={140}
            minScale={0.92}
            cardGap={28}
            backgroundBlur={24}
            gradientSize={0.65}
            gradientIntensity={0.35}
            enableKeyboard={true}
            cardAspectRatio={0.8}
            initialIndex={0}
          />
        </div>
      </div>
    </section>
  );
}
