"use client";

/* ════════════════════════════════════════════════════════════════════
   SUBJECT CAROUSEL — controlled 3D carousel (DEC-052, owner brief)

   Presentational + controlled: the pinned section drives `position`
   (a float card index) from page-scroll progress via the forwarded
   handle. No wheel handlers, no inertia — nothing fights GSAP.

   3D behaviour per the supplied spec: the centred card faces forward
   and sits closest; neighbours rotate (maxRotationDegrees), recede
   (maxDepthPx) and shrink (minScale), spaced by cardGap. The active
   image's colours are extracted and blended pale+warm into the section
   background (gradientSize / gradientIntensity, blurred by
   backgroundBlur). enableKeyboard is honoured by the section wrapper
   (arrow keys step the scroll, staying synchronised). Under reduced
   motion the component renders a simple accessible horizontal
   scroll-snap gallery instead.
   ════════════════════════════════════════════════════════════════════ */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { SUBJECT_CARD_DATA } from "./subject-carousel-data";

export interface SubjectCarouselProps {
  maxRotationDegrees?: number;
  maxDepthPx?: number;
  minScale?: number;
  cardGap?: number;
  backgroundBlur?: number;
  gradientSize?: number;
  gradientIntensity?: number;
  enableKeyboard?: boolean;
  cardAspectRatio?: number;
  initialIndex?: number;
  reduced?: boolean;
}

export interface SubjectCarouselHandle {
  setPosition: (p: number) => void;
}

const IVORY = "#FDFBF7";

function mixTowardIvory(hex: string, t: number): string {
  const h2 = (v: string) => parseInt(v, 16);
  const a = [h2(hex.slice(1, 3)), h2(hex.slice(3, 5)), h2(hex.slice(5, 7))];
  const b = [253, 251, 247];
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${m.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export const SubjectCarousel = forwardRef<SubjectCarouselHandle, SubjectCarouselProps>(function SubjectCarousel(
  {
    maxRotationDegrees = 28,
    maxDepthPx = 140,
    minScale = 0.92,
    cardGap = 28,
    backgroundBlur = 24,
    gradientSize = 0.65,
    gradientIntensity = 0.35,
    cardAspectRatio = 0.8,
    initialIndex = 0,
    reduced = false,
  },
  ref
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(initialIndex);
  const sizeRef = useRef({ w: 420, gap: cardGap });
  const [active, setActive] = useState(initialIndex);
  const [grads, setGrads] = useState<[string, string]>(["#F4EFE6", "#FFF1E6"]);

  /* ── imperative position → transforms (no React re-render) ─────────── */
  const apply = (p: number) => {
    posRef.current = p;
    const { w, gap } = sizeRef.current;
    const n = SUBJECT_CARD_DATA.length;
    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const d = i - p;
      const ad = Math.abs(d);
      const x = d * (w + gap);
      const rot = -Math.max(-1, Math.min(1, d)) * maxRotationDegrees * Math.min(1, ad);
      const z = -Math.min(ad, 2) * (maxDepthPx / 2);
      const s = 1 - (1 - minScale) * Math.min(1, ad);
      el.style.transform = `translateX(-50%) translateX(${x.toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      el.style.zIndex = String(100 - Math.round(ad * 10));
      el.style.opacity = ad > 2.6 ? "0" : String(1 - Math.min(1, Math.max(0, ad - 1.6)) * 0.9);
      const img = el.querySelector("img");
      if (img) img.style.filter = `blur(${(Math.min(1, ad) * (backgroundBlur / 8)).toFixed(2)}px) saturate(${1 - Math.min(1, ad) * 0.25})`;
    }
    const idx = Math.max(0, Math.min(n - 1, Math.round(p)));
    setActive((prev) => (prev === idx ? prev : idx));
  };

  useImperativeHandle(ref, () => ({ setPosition: apply }), [maxRotationDegrees, maxDepthPx, minScale, cardGap]);

  /* ── responsive card metrics ────────────────────────────────────────── */
  useEffect(() => {
    if (reduced) return;
    const measure = () => {
      const vw = window.innerWidth;
      sizeRef.current = { w: Math.min(vw * 0.66, 460), gap: cardGap };
      apply(posRef.current);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, cardGap]);

  /* ── extract pale warm colours from the active image ────────────────── */
  useEffect(() => {
    const src = SUBJECT_CARD_DATA[active]?.image;
    if (!src) return;
    let live = true;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (!live) return;
      try {
        const c = document.createElement("canvas");
        c.width = 12;
        c.height = 12;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 12, 12);
        const data = ctx.getImageData(0, 0, 12, 12).data;
        const avg = (x0: number, x1: number) => {
          let r = 0, g = 0, b = 0, n = 0;
          for (let y = 0; y < 12; y++)
            for (let x = x0; x < x1; x++) {
              const i = (y * 12 + x) * 4;
              r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
            }
          return `#${[r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, "0")).join("")}`;
        };
        setGrads([mixTowardIvory(avg(0, 5), 0.72), mixTowardIvory(avg(7, 12), 0.72)]);
      } catch {
        /* keep prior gradient */
      }
    };
    return () => {
      live = false;
    };
  }, [active]);

  const cardW = reduced ? "min(78vw, 340px)" : undefined;

  /* ── reduced motion: simple accessible horizontal gallery ───────────── */
  if (reduced) {
    return (
      <div className="relative w-full">
        <ul className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6" aria-label="Subjects">
          {SUBJECT_CARD_DATA.map((s) => (
            <li key={s.slug} className="w-[min(78vw,340px)] shrink-0 snap-center">
              <CarouselCard slug={s.slug} name={s.name} description={s.description} image={s.image} alt={s.alt} width={cardW} staticCard />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* image-derived pale warm atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(${gradientSize * 100}% 90% at 30% 40%, ${grads[0]} 0%, transparent 70%), radial-gradient(${gradientSize * 100}% 90% at 72% 55%, ${grads[1]} 0%, transparent 72%)`,
          opacity: gradientIntensity * 2.4,
          filter: `blur(${backgroundBlur}px)`,
        }}
      />
      <div
        ref={viewportRef}
        className="relative mx-auto w-full select-none"
        style={{ height: "min(72vw, 575px)", perspective: "1400px", touchAction: "pan-y" }}
      >
        {SUBJECT_CARD_DATA.map((s, i) => (
          <div
            key={s.slug}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-0 will-change-transform"
            style={{ width: "min(66vw, 460px)", height: "min(72vw, 575px)" }}
            data-carousel-card={s.slug}
          >
            <CarouselCard slug={s.slug} name={s.name} description={s.description} image={s.image} alt={s.alt} width="100%" />
          </div>
        ))}
      </div>

      {/* seven-position progress indicator */}
      <div className="mt-6 flex items-center justify-center gap-2.5" role="tablist" aria-label="Subject position">
        {SUBJECT_CARD_DATA.map((s, i) => (
          <span
            key={s.slug}
            role="tab"
            aria-selected={i === active}
            aria-label={s.name}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 22 : 8,
              height: 8,
              background: i === active ? "#C5A059" : "rgba(10,25,47,0.18)",
            }}
          />
        ))}
      </div>
    </div>
  );
});

/* ── one card: image, name, short description, local contrast veil ────── */
function CarouselCard({ slug, name, description, image, alt, width, staticCard = false }: {
  slug: string; name: string; description: string; image: string; alt: string; width?: string; staticCard?: boolean;
}) {
  return (
    <a
      href={`/subjects/${slug}`}
      className="group block h-full w-full overflow-hidden rounded-3xl border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A192F]"
      style={{ width, borderColor: "rgba(212,175,55,0.35)", background: "#FFFFFF", boxShadow: "0 24px 60px -18px rgba(15,23,42,0.18), 0 6px 18px -6px rgba(212,175,55,0.12)" }}
      aria-label={`${name} — ${description}`}
    >
      <div className="relative h-full w-full">
        <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading={staticCard ? "lazy" : "eager"} />
        {/* subtle local overlay where text needs contrast */}
        <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: "linear-gradient(to top, rgba(253,251,247,0.96) 18%, rgba(253,251,247,0.75) 55%, transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <h3 className="text-2xl" style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500, color: "#0A192F" }}>{name}</h3>
          <p className="mt-1.5 text-sm leading-snug" style={{ color: "#334155" }}>{description}</p>
        </div>
      </div>
    </a>
  );
}
