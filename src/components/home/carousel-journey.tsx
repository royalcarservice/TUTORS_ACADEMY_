"use client";

/* ════════════════════════════════════════════════════════════════════
   CAROUSEL JOURNEY — pinned scroll-driven horizontal 3D carousel
   (DEC-052, owner brief)

   The 560vh scene stays pinned with a sticky viewport. ScrollTrigger's
   0→1 progress maps directly to the controlled card position 0→6, so
   the seven subjects glide right-to-left in order. The forward card
   faces the viewer; side cards rotate, recede and scale per the
   supplied component settings. Scroll-up naturally reverses the same
   mapping; at Computer Science, the pin releases into the next section.

   Arrow keys and focusing a card scroll to the matching progress point.
   Pointer/touch dragging also moves page scroll itself. There are no
   competing wheel handlers or inertia. Reduced motion removes the tall
   pin and renders a simple horizontal snap gallery.
   ════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SubjectCarousel, type SubjectCarouselHandle } from "./subject-carousel";

const NAVY = "#0A192F";
const SLATE = "#475569";
const GOLD = "#C5A059";
const SUBJECT_COUNT = 7;

export function CarouselJourney() {
  const outerRef = useRef<HTMLElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<SubjectCarouselHandle | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const focusCard = useCallback((index: number) => {
    if (reduced) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const y = trigger.start + (index / (SUBJECT_COUNT - 1)) * (trigger.end - trigger.start);
    gsap.to(window, {
      scrollTo: { y, autoKill: false },
      duration: 0.55,
      ease: "power2.inOut",
      overwrite: "auto",
    });
  }, [reduced]);

  useEffect(() => {
    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const outer = outerRef.current;
    const stage = stageRef.current;
    const heading = headRef.current;
    if (!outer || !stage) return;

    const trigger = ScrollTrigger.create({
      id: "subject-carousel-progress",
      trigger: outer,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        carouselRef.current?.setPosition(self.progress * (SUBJECT_COUNT - 1));
      },
      onRefresh: (self) => {
        carouselRef.current?.setPosition(self.progress * (SUBJECT_COUNT - 1));
      },
    });
    triggerRef.current = trigger;
    carouselRef.current?.setPosition(0);

    if (heading) {
      gsap.fromTo(
        heading,
        { y: 38, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            id: "subject-carousel-heading",
            trigger: outer,
            start: "top 85%",
            once: true,
          },
        }
      );
    }

    /* Keyboard navigation is scoped to the carousel, not the whole page. */
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const currentTrigger = triggerRef.current;
      if (!currentTrigger) return;
      const currentIndex = Math.round(currentTrigger.progress * (SUBJECT_COUNT - 1));
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = Math.max(0, Math.min(SUBJECT_COUNT - 1, currentIndex + delta));
      event.preventDefault();

      /* Keep the keyboard focus on the carousel region during the glide. */
      stage.focus({ preventScroll: true });
      const y = currentTrigger.start + (nextIndex / (SUBJECT_COUNT - 1)) * (currentTrigger.end - currentTrigger.start);
      gsap.to(window, {
        scrollTo: { y, autoKill: false },
        duration: 0.65,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };
    stage.addEventListener("keydown", onKeyDown);

    /* Drag/swipe changes document scroll, keeping GSAP as sole position source. */
    let dragging = false;
    let dragged = false;
    let activePointer = -1;
    let startX = 0;
    let lastX = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      dragged = false;
      activePointer = event.pointerId;
      startX = lastX = event.clientX;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== activePointer) return;
      const delta = event.clientX - lastX;
      lastX = event.clientX;
      if (Math.abs(event.clientX - startX) > 6) dragged = true;
      if (dragged) window.scrollBy(0, -delta * 2.8);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      dragging = false;
      activePointer = -1;
      if (dragged) window.setTimeout(() => { dragged = false; }, 450);
    };
    const onClickCapture = (event: MouseEvent) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    stage.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("click", onClickCapture, true);

    return () => {
      trigger.kill();
      gsap.killTweensOf(window);
      triggerRef.current = null;
      ScrollTrigger.getById("subject-carousel-heading")?.kill();
      gsap.killTweensOf(heading);
      stage.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      stage.removeEventListener("click", onClickCapture, true);
    };
  }, [reduced]);

  return (
    <section
      id="disciplines"
      ref={outerRef}
      className="cj-outer relative h-[560vh]"
      aria-label="Seven subjects"
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .cj-outer { height: auto !important; }
          .cj-sticky { position: relative !important; height: auto !important; min-height: 100svh; overflow: visible !important; }
        }
      `}</style>
      <div
        className="cj-sticky sticky top-0 flex h-screen h-[100svh] flex-col overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FDFBF7 0%, #F9F6F0 100%)", height: "100svh" }}
      >
        <div ref={headRef} className="relative z-10 mx-auto w-full max-w-4xl px-4 pt-16 text-center sm:pt-20">
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

        <div
          ref={stageRef}
          className="relative z-0 mt-2 min-h-0 flex-1 cursor-grab active:cursor-grabbing"
          tabIndex={-1}
          style={{ touchAction: reduced ? "auto" : "pan-y" }}
        >
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
            onCardFocus={focusCard}
          />
        </div>
      </div>
    </section>
  );
}
