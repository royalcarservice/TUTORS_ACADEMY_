"use client";

/* ════════════════════════════════════════════════════════════════════
   SUBJECT CAROUSEL — controlled 3D carousel (DEC-052, owner brief)

   Presentational + controlled: the pinned page section drives the
   float card position from vertical scroll progress. No wheel handler
   or inertia here, so page scroll remains the single source of truth.

   The centre card faces forward and sits closest; neighbours rotate,
   recede and scale according to the owner's prop API. Active-image
   colours are sampled, mixed toward warm ivory, and used as a softly
   blurred background. Under reduced motion this becomes a normal,
   keyboard- and touch-reachable horizontal scroll-snap gallery.
   ════════════════════════════════════════════════════════════════════ */

import NextImage from "next/image";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
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
  onCardFocus?: (index: number) => void;
}

export interface SubjectCarouselHandle {
  setPosition: (position: number) => void;
}

function mixTowardIvory(hex: string, amount: number): string {
  const channel = (from: number, to: number) => Math.round(from + (to - from) * amount);
  const rgb = [1, 3, 5].map((start, index) => {
    const from = parseInt(hex.slice(start, start + 2), 16);
    const to = [253, 251, 247][index];
    return channel(from, to).toString(16).padStart(2, "0");
  });
  return `#${rgb.join("")}`;
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
    enableKeyboard = true,
    cardAspectRatio = 0.8,
    initialIndex = 0,
    reduced = false,
    onCardFocus,
  },
  ref
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const positionRef = useRef(initialIndex);
  const sizeRef = useRef({ width: 420, gap: cardGap });
  const [active, setActive] = useState(initialIndex);
  const [dimensions, setDimensions] = useState({ width: 420, height: 525 });
  const [gradients, setGradients] = useState<[string, string]>(["#F4EFE6", "#FFF1E6"]);

  /* ── scroll progress → 3D transforms (no React render per frame) ───── */
  const applyPosition = useCallback((position: number) => {
    const lastIndex = SUBJECT_CARD_DATA.length - 1;
    const p = Math.max(0, Math.min(lastIndex, position));
    positionRef.current = p;

    const { width, gap } = sizeRef.current;
    SUBJECT_CARD_DATA.forEach((_, index) => {
      const card = cardRefs.current[index];
      if (!card) return;

      const distance = index - p;
      const absoluteDistance = Math.abs(distance);
      const x = distance * (width + gap);
      const side = Math.max(-1, Math.min(1, distance));
      const rotation = -side * maxRotationDegrees * Math.min(1, absoluteDistance);
      const depth = -Math.min(1, absoluteDistance) * maxDepthPx;
      const scale = 1 - (1 - minScale) * Math.min(1, absoluteDistance);

      card.style.transform = `translate(-50%, -50%) translateX(${x.toFixed(1)}px) translateZ(${depth.toFixed(1)}px) rotateY(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.style.zIndex = String(100 - Math.round(absoluteDistance * 10));
      card.style.opacity = absoluteDistance > 2.6
        ? "0"
        : String(1 - Math.min(1, Math.max(0, absoluteDistance - 1.6)) * 0.9);
      card.style.pointerEvents = absoluteDistance > 2.6 ? "none" : "auto";
    });

    const nextActive = Math.max(0, Math.min(lastIndex, Math.round(p)));
    setActive((current) => current === nextActive ? current : nextActive);
  }, [maxRotationDegrees, maxDepthPx, minScale]);

  useImperativeHandle(ref, () => ({ setPosition: applyPosition }), [applyPosition]);

  /* ── responsive card size; keep the supplied 0.8 aspect ratio ──────── */
  const measure = useCallback(() => {
    if (!viewportRef.current) return;
    const viewportWidth = viewportRef.current.clientWidth || window.innerWidth;
    const availableHeight = Math.max(190, window.innerHeight - 300);
    const heightLimit = Math.min(575, availableHeight);
    const width = Math.min(viewportWidth * 0.66, 460, heightLimit * cardAspectRatio);
    const height = width / cardAspectRatio;

    sizeRef.current = { width, gap: cardGap };
    setDimensions((current) => current.width === width && current.height === height
      ? current
      : { width, height });
    applyPosition(positionRef.current);
  }, [applyPosition, cardAspectRatio, cardGap]);

  useEffect(() => {
    if (reduced) return;
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [measure, reduced]);

  /* ── extract softly blended pale colours from the active image ─────── */
  useEffect(() => {
    const source = SUBJECT_CARD_DATA[active]?.image;
    if (!source) return;

    let live = true;
    const image = new Image();
    image.src = source;
    image.onload = () => {
      if (!live) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 12;
        canvas.height = 12;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.drawImage(image, 0, 0, 12, 12);
        const pixels = context.getImageData(0, 0, 12, 12).data;

        const average = (startX: number, endX: number) => {
          let red = 0;
          let green = 0;
          let blue = 0;
          let count = 0;
          for (let y = 0; y < 12; y++) {
            for (let x = startX; x < endX; x++) {
              const offset = (y * 12 + x) * 4;
              red += pixels[offset];
              green += pixels[offset + 1];
              blue += pixels[offset + 2];
              count++;
            }
          }
          return `#${[red, green, blue].map((value) => Math.round(value / count).toString(16).padStart(2, "0")).join("")}`;
        };

        setGradients([
          mixTowardIvory(average(0, 5), 0.72),
          mixTowardIvory(average(7, 12), 0.72),
        ]);
      } catch {
        /* If canvas sampling is unavailable, retain the warm defaults. */
      }
    };
    return () => {
      live = false;
    };
  }, [active]);

  /* ── reduced motion: static, horizontal scroll-snap gallery ────────── */
  if (reduced) {
    return (
      <div className="relative w-full" role="region" aria-roledescription="carousel" aria-label="Seven subjects">
        <ul
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6"
          aria-label="Subjects"
          tabIndex={enableKeyboard ? 0 : undefined}
          style={{ scrollPaddingInline: "1.5rem", WebkitOverflowScrolling: "touch" }}
        >
          {SUBJECT_CARD_DATA.map((subject) => (
            <li key={subject.slug} className="w-[min(78vw,340px)] shrink-0 snap-center" style={{ aspectRatio: cardAspectRatio }}>
              <CarouselCard
                slug={subject.slug}
                name={subject.name}
                description={subject.description}
                image={subject.image}
                alt={subject.alt}
                focalPoint={subject.focalPoint}
                width="100%"
                staticCard
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col justify-center"
      role="region"
      aria-roledescription="carousel"
      aria-label="Seven subjects"
      tabIndex={enableKeyboard ? 0 : undefined}
      style={{ outlineOffset: "-4px" }}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {SUBJECT_CARD_DATA[active]?.name}, subject {active + 1} of {SUBJECT_CARD_DATA.length}
      </p>

      {/* image-derived, pale warm atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(${gradientSize * 100}% 90% at 30% 40%, ${gradients[0]} 0%, transparent 70%), radial-gradient(${gradientSize * 100}% 90% at 72% 55%, ${gradients[1]} 0%, transparent 72%)`,
          opacity: gradientIntensity * 2.4,
          filter: `blur(${backgroundBlur}px)`,
        }}
      />

      <div
        ref={viewportRef}
        className="relative mx-auto w-full select-none"
        style={{
          height: `${dimensions.height}px`,
          maxWidth: "920px",
          perspective: "1400px",
          transformStyle: "preserve-3d",
          touchAction: "pan-y",
          overflow: "hidden",
        }}
      >
        {SUBJECT_CARD_DATA.map((subject, index) => (
          <div
            key={subject.slug}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            className="absolute left-1/2 top-1/2 will-change-transform"
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transform: `translate(-50%, -50%) translateX(${(index - initialIndex) * (dimensions.width + cardGap)}px)`,
              zIndex: 100 - Math.abs(index - active) * 10,
            }}
            data-carousel-card={subject.slug}
            data-carousel-index={index}
          >
            <CarouselCard
              slug={subject.slug}
              name={subject.name}
              description={subject.description}
              image={subject.image}
              alt={subject.alt}
              focalPoint={subject.focalPoint}
              width="100%"
              onFocus={() => onCardFocus?.(index)}
            />
          </div>
        ))}
      </div>

      {/* seven-position progress indicator (not an interactive tablist) */}
      <div className="mt-5 flex items-center justify-center gap-2.5" role="group" aria-label="Carousel position">
        {SUBJECT_CARD_DATA.map((subject, index) => (
          <span
            key={subject.slug}
            aria-hidden="true"
            className="rounded-full transition-all duration-300"
            style={{
              width: index === active ? 22 : 8,
              height: 8,
              background: index === active ? "#C5A059" : "rgba(10,25,47,0.18)",
            }}
          />
        ))}
      </div>
    </div>
  );
});

/* ── dark card only: art, title, concise copy, local legibility veil ── */
function CarouselCard({
  slug,
  name,
  description,
  image,
  alt,
  focalPoint,
  width,
  staticCard = false,
  onFocus,
}: {
  slug: string;
  name: string;
  description: string;
  image: string;
  alt: string;
  focalPoint?: string;
  width?: string;
  staticCard?: boolean;
  onFocus?: () => void;
}) {
  return (
    <a
      href={`/subjects/${slug}`}
      onFocus={onFocus}
      className="group block h-full w-full overflow-hidden rounded-3xl border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A192F]"
      style={{
        width,
        borderColor: "rgba(212,175,55,0.5)",
        background: "#17283B",
        boxShadow: "0 28px 64px -20px rgba(6,16,30,0.42), 0 8px 24px -8px rgba(197,160,89,0.18)",
      }}
      aria-label={`${name} — ${description}`}
    >
      <div className="relative h-full w-full">
        <NextImage
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 640px) 78vw, 460px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ objectPosition: focalPoint ?? "center" }}
          loading={staticCard ? "lazy" : "eager"}
        />
        {/* a cool, translucent tint gives every image a dark-card finish */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "rgba(12,27,43,0.22)" }}
        />
        {/* opaque lower navy-slate gradient keeps the white copy legible */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5"
          style={{ background: "linear-gradient(to top, rgba(13,27,43,0.98) 0%, rgba(13,27,43,0.94) 54%, rgba(13,27,43,0.58) 82%, transparent 100%)" }}
        />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <h3 className="text-2xl" style={{ fontFamily: "var(--ta-font-display)", fontWeight: 500, color: "#FFF9F0" }}>{name}</h3>
          <p className="mt-1.5 text-sm leading-snug" style={{ color: "#E5EAF0" }}>{description}</p>
        </div>
      </div>
    </a>
  );
}
