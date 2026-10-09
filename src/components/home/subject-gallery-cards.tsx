"use client";

import Link from "next/link";
import { GALLERY_SLUGS, GALLERY_ACCENTS, GALLERY_INK, GALLERY_COPY, type GallerySlug } from "./subject-gallery-data";

/* ════════════════════════════════════════════════════════════════════
   SUBJECT GALLERY — SERVER CARD LAYER (DEC-047, restyled DEC-048)

   Morning-light materiality: translucent warm-ivory glassmorphism,
   ultra-thin champagne borders, layered soft shadows, sunlit radial
   glow behind each 3D slot. HTML-first as before: real markup, static
   SVG motifs until the shared canvas fades in. No layout shift.
   ════════════════════════════════════════════════════════════════════ */

const IVORY = "#FDFBF7";
const NAVY = "#0A192F";
const NAVY_SOFT = "#0F172A";
const SLATE = "#475569";
const GOLD = "#C5A059";
const GOLD_BRIGHT = "#D4AF37";

const CARD_SHADOW =
  "0 12px 36px -8px rgba(15,23,42,0.06), 0 4px 12px -2px rgba(212,175,55,0.08)";
const CARD_SHADOW_HOVER =
  "0 22px 48px -12px rgba(15,23,42,0.12), 0 8px 20px -4px rgba(212,175,55,0.18)";

const SERIF = { fontFamily: "var(--ta-font-display)" } as const;

/* Compact line-art motifs in the subject's ink — the pre-GL fallback. */
function FallbackMotif({ slug, ink }: { slug: GallerySlug; ink: string }) {
  const common = { fill: "none", stroke: ink, strokeWidth: 1.4 } as const;
  return (
    <svg
      data-gallery-fallback
      viewBox="0 0 120 90"
      className="absolute inset-0 h-full w-full transition-opacity duration-700"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    >
      {slug === "mathematics" && (
        <g {...common}>
          <path d="M60 12 L96 34 L96 62 L60 84 L24 62 L24 34 Z" />
          <path d="M60 12 L60 84 M24 34 L96 62 M96 34 L24 62" opacity="0.6" />
          <circle cx="60" cy="12" r="2.4" fill={GOLD_BRIGHT} stroke="none" />
          <circle cx="96" cy="34" r="2.4" fill={GOLD_BRIGHT} stroke="none" />
          <circle cx="24" cy="62" r="2.4" fill={GOLD_BRIGHT} stroke="none" />
        </g>
      )}
      {slug === "physics" && (
        <g {...common}>
          <circle cx="60" cy="45" r="7" fill="#F59E0B" stroke="none" opacity="0.9" />
          <ellipse cx="60" cy="45" rx="38" ry="14" stroke={GOLD} />
          <ellipse cx="60" cy="45" rx="38" ry="14" transform="rotate(58 60 45)" stroke={GOLD} opacity="0.7" />
          <circle cx="98" cy="45" r="3" fill="#F59E0B" stroke="none" />
        </g>
      )}
      {slug === "chemistry" && (
        <g {...common}>
          <path d="M60 18 L84 31 L84 57 L60 70 L36 57 L36 31 Z" />
          <circle cx="60" cy="18" r="3.4" fill={ink} stroke="none" />
          <circle cx="84" cy="57" r="3.4" fill={ink} stroke="none" />
          <circle cx="36" cy="57" r="3.4" fill={ink} stroke="none" />
          <circle cx="60" cy="44" r="14" stroke={GOLD} opacity="0.5" />
        </g>
      )}
      {slug === "biology" && (
        <g {...common}>
          <path d="M42 8 C74 24 46 40 78 56 C50 70 74 82 60 88" />
          <path d="M78 8 C46 24 74 40 42 56 C70 70 46 82 60 88" opacity="0.8" />
          <path d="M48 20 L72 20 M48 44 L72 44 M50 68 L70 68" stroke={GOLD} opacity="0.6" />
        </g>
      )}
      {slug === "english" && (
        <g {...common}>
          <path d="M60 26 C48 18 34 18 26 22 L26 66 C34 62 48 62 60 70 C72 62 86 62 94 66 L94 22 C86 18 72 18 60 26 Z" />
          <path d="M60 26 L60 70" opacity="0.6" />
          <path d="M34 32 C42 30 50 30 54 33 M34 42 C42 40 50 40 54 43 M66 33 C70 30 78 30 86 32" stroke={GOLD} opacity="0.7" />
        </g>
      )}
      {slug === "history" && (
        <g {...common}>
          <circle cx="60" cy="45" r="26" />
          <ellipse cx="60" cy="45" rx="26" ry="9" opacity="0.7" />
          <ellipse cx="60" cy="45" rx="9" ry="26" opacity="0.7" />
          <ellipse cx="60" cy="45" rx="38" ry="12" transform="rotate(-18 60 45)" stroke={GOLD_BRIGHT} />
        </g>
      )}
      {slug === "computer-science" && (
        <g {...common}>
          <rect x="42" y="27" width="36" height="36" rx="3" />
          <rect x="52" y="37" width="16" height="16" fill={ink} stroke="none" opacity="0.85" />
          <path d="M42 35 L28 35 M42 45 L24 45 M42 55 L28 55 M78 35 L92 35 M78 45 L96 45 M78 55 L92 55 M50 27 L50 14 M60 27 L60 10 M70 27 L70 14 M50 63 L50 78 M70 63 L70 78" stroke={GOLD} opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

function CardFrame({ slug, children, className = "" }: { slug: GallerySlug; children: React.ReactNode; className?: string }) {
  return (
    <Link
      id={`ta-card-${slug}`}
      href={`/subjects/${slug}`}
      className={`g-card group relative block overflow-hidden rounded-2xl border backdrop-blur-md will-change-transform ${className}`}
      style={{
        borderColor: "rgba(212,175,55,0.22)",
        background: "rgba(255,255,255,0.75)",
        boxShadow: CARD_SHADOW,
      }}
    >
      {children}
    </Link>
  );
}

function Slot({ slug, tall = false }: { slug: GallerySlug; tall?: boolean }) {
  const accent = GALLERY_ACCENTS[slug];
  return (
    <div id={`ta-view-${slug}`} className={`relative ${tall ? "h-64 sm:h-72 lg:h-full lg:min-h-[22rem]" : "h-52 sm:h-60"}`}>
      <div
        className="g-glow pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 55%, rgba(255,248,230,0.7), transparent 70%), radial-gradient(ellipse at 50% 60%, ${accent}24, transparent 62%)`,
        }}
        aria-hidden="true"
      />
      <FallbackMotif slug={slug} ink={GALLERY_INK[slug]} />
      <img
        src={`/gallery/${slug}.jpg`}
        alt=""
        aria-hidden="true"
        onLoad={(e) => {
          const m = e.currentTarget.previousElementSibling as HTMLElement | null;
          if (m) m.style.opacity = "0";
        }}
        className="g-img absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: 0.5,
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.45) 68%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.45) 68%, transparent)",
        }}
      />
    </div>
  );
}

function CardText({ slug, className = "" }: { slug: GallerySlug; className?: string }) {
  const c = GALLERY_COPY[slug];
  const ink = GALLERY_INK[slug];
  return (
    <div className={`relative z-10 p-6 sm:p-7 ${className}`}>
      <h3 className="text-2xl" style={{ ...SERIF, color: NAVY_SOFT, fontWeight: 500 }}>
        {c.title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed" style={{ color: SLATE }}>
        {c.description}
      </p>
      <span className="g-link mt-5 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: ink }}>
        {c.linkLabel}
      </span>
    </div>
  );
}

export default function SubjectGalleryCards() {
  const six = GALLERY_SLUGS.filter((s) => s !== "computer-science");
  return (
    <section id="disciplines" className="relative mx-auto max-w-[96rem] px-4 pt-24 pb-12 sm:px-6 lg:px-8" aria-labelledby="disciplines-h">
      {/* soft sunlit motes carrying the hero atmosphere down */}
      <div className="ta-motes pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="g-header relative">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>
          Explore your potential
        </p>
        <h2 id="disciplines-h" className="mt-4 max-w-3xl text-4xl sm:text-5xl" style={{ ...SERIF, color: NAVY, fontWeight: 500 }}>
          Seven subjects.{" "}
          <span
            style={{
              background: "linear-gradient(100deg, #E4C568, #C5A059 45%, #A07C2C)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Infinite possibilities.
          </span>
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: SLATE }}>
          Explore your interests. Build your understanding. Shape your future.
        </p>

        {/* upper block: six tall doors, 3×2 → 2-col tablet → single column */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {six.map((slug) => (
            <CardFrame key={slug} slug={slug}>
              <Slot slug={slug} />
              <CardText slug={slug} />
            </CardFrame>
          ))}
        </div>

        {/* lower feature block: Computer Science, split-pane */}
        <div className="mt-6">
          <CardFrame slug="computer-science">
            <div className="grid lg:grid-cols-5">
              <div className="order-2 lg:order-1 lg:col-span-2 lg:flex lg:flex-col lg:justify-center">
                <CardText slug="computer-science" className="lg:p-10" />
              </div>
              <div className="order-1 lg:order-2 lg:col-span-3">
                <Slot slug="computer-science" tall />
              </div>
            </div>
          </CardFrame>
        </div>
      </div>

      <style>{`
        .g-card { transition: transform .3s cubic-bezier(.22,.9,.34,1), box-shadow .3s ease, border-color .3s ease; }
        .g-card:hover, .g-card:focus-visible {
          border-color: rgba(212,175,55,0.55) !important;
          box-shadow: ${CARD_SHADOW_HOVER};
        }
        .g-card:hover .g-glow, .g-card:focus-visible .g-glow { opacity: 1; }
        .g-card:hover .g-link, .g-card:focus-visible .g-link { transform: translateX(5px); }
        .g-glow { opacity: .75; transition: opacity .3s; }
        .g-img { transition: transform .5s ease; }
        .g-card:hover .g-img, .g-card:focus-visible .g-img { transform: scale(1.06) translateY(-8px); }
        @media (prefers-reduced-motion: reduce) { .g-card:hover .g-img, .g-card:focus-visible .g-img { transform: none; } }
        .g-link { transition: transform .2s ease; }
        .ta-motes {
          background-image:
            radial-gradient(1.5px 1.5px at 12% 22%, rgba(212,175,55,.25) 50%, transparent 51%),
            radial-gradient(1px 1px at 34% 64%, rgba(214,190,140,.3) 50%, transparent 51%),
            radial-gradient(2px 2px at 58% 18%, rgba(245,230,200,.5) 50%, transparent 51%),
            radial-gradient(1px 1px at 76% 46%, rgba(212,175,55,.2) 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 90% 78%, rgba(214,190,140,.25) 50%, transparent 51%),
            radial-gradient(2px 2px at 22% 86%, rgba(245,230,200,.45) 50%, transparent 51%);
          background-size: 340px 340px;
          opacity: .8;
          animation: ta-motes-drift 90s linear infinite;
        }
        @keyframes ta-motes-drift { from { background-position: 0 0; } to { background-position: -340px 340px; } }
        @media (prefers-reduced-motion: reduce) { .ta-motes { animation: none; } }
      `}</style>
    </section>
  );
}
