import Link from "next/link";
import { GALLERY_SLUGS, GALLERY_ACCENTS, GALLERY_COPY, type GallerySlug } from "./subject-gallery-data";

/* ════════════════════════════════════════════════════════════════════
   SUBJECT GALLERY — SERVER CARD LAYER (DEC-047)

   HTML-first: every title, description and link is real server-rendered
   markup. Each card carries a static SVG motif (data-gallery-fallback)
   that holds the composition until the shared-canvas layer fades in over
   it — no layout shift, no blank cards, crisp text at all times.
   ════════════════════════════════════════════════════════════════════ */

const IVORY = "#FAF7F2";
const MUTED = "#B9B4A9";
const GOLD = "#DFB15B";
const SERIF = { fontFamily: "var(--ta-font-display)" } as const;

/* Compact line-art motifs, one per subject — the pre-GL fallback. */
function FallbackMotif({ slug, accent }: { slug: GallerySlug; accent: string }) {
  const common = { fill: "none", stroke: accent, strokeWidth: 1.4 } as const;
  return (
    <svg
      data-gallery-fallback
      viewBox="0 0 120 90"
      className="absolute inset-0 h-full w-full transition-opacity duration-700"
      style={{ opacity: 0.55 }}
      aria-hidden="true"
    >
      {slug === "mathematics" && (
        <g {...common}>
          <path d="M60 12 L96 34 L96 62 L60 84 L24 62 L24 34 Z" />
          <path d="M60 12 L60 84 M24 34 L96 62 M96 34 L24 62" opacity="0.6" />
          <circle cx="60" cy="12" r="2.4" fill={accent} stroke="none" />
          <circle cx="96" cy="34" r="2.4" fill={accent} stroke="none" />
          <circle cx="24" cy="62" r="2.4" fill={accent} stroke="none" />
        </g>
      )}
      {slug === "physics" && (
        <g {...common}>
          <circle cx="60" cy="45" r="7" fill={accent} stroke="none" opacity="0.9" />
          <ellipse cx="60" cy="45" rx="38" ry="14" />
          <ellipse cx="60" cy="45" rx="38" ry="14" transform="rotate(58 60 45)" opacity="0.7" />
          <circle cx="98" cy="45" r="3" fill={accent} stroke="none" />
        </g>
      )}
      {slug === "chemistry" && (
        <g {...common}>
          <path d="M60 18 L84 31 L84 57 L60 70 L36 57 L36 31 Z" />
          <circle cx="60" cy="18" r="3.4" fill={accent} stroke="none" />
          <circle cx="84" cy="57" r="3.4" fill={accent} stroke="none" />
          <circle cx="36" cy="57" r="3.4" fill={accent} stroke="none" />
          <circle cx="60" cy="44" r="14" opacity="0.35" />
        </g>
      )}
      {slug === "biology" && (
        <g {...common}>
          <path d="M42 8 C74 24 46 40 78 56 C50 70 74 82 60 88" />
          <path d="M78 8 C46 24 74 40 42 56 C70 70 46 82 60 88" opacity="0.8" />
          <path d="M48 20 L72 20 M48 44 L72 44 M50 68 L70 68" opacity="0.5" />
        </g>
      )}
      {slug === "english" && (
        <g {...common}>
          <path d="M60 26 C48 18 34 18 26 22 L26 66 C34 62 48 62 60 70 C72 62 86 62 94 66 L94 22 C86 18 72 18 60 26 Z" />
          <path d="M60 26 L60 70" opacity="0.6" />
          <path d="M34 32 C42 30 50 30 54 33 M34 42 C42 40 50 40 54 43 M66 33 C70 30 78 30 86 32" opacity="0.5" />
        </g>
      )}
      {slug === "history" && (
        <g {...common}>
          <circle cx="60" cy="45" r="26" />
          <ellipse cx="60" cy="45" rx="26" ry="9" opacity="0.7" />
          <ellipse cx="60" cy="45" rx="9" ry="26" opacity="0.7" />
          <ellipse cx="60" cy="45" rx="38" ry="12" transform="rotate(-18 60 45)" stroke="#DFB15B" />
        </g>
      )}
      {slug === "computer-science" && (
        <g {...common}>
          <rect x="42" y="27" width="36" height="36" rx="3" />
          <rect x="52" y="37" width="16" height="16" fill={accent} stroke="none" opacity="0.85" />
          <path d="M42 35 L28 35 M42 45 L24 45 M42 55 L28 55 M78 35 L92 35 M78 45 L96 45 M78 55 L92 55 M50 27 L50 14 M60 27 L60 10 M70 27 L70 14 M50 63 L50 78 M70 63 L70 78" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

function CardFrame({ slug, children, className = "" }: { slug: GallerySlug; children: React.ReactNode; className?: string }) {
  const accent = GALLERY_ACCENTS[slug];
  return (
    <Link
      id={`ta-card-${slug}`}
      href={`/subjects/${slug}`}
      className={`g-card group relative block overflow-hidden rounded-2xl border backdrop-blur-md transition-transform duration-200 will-change-transform ${className}`}
      style={{ borderColor: "rgba(223,177,91,0.15)", background: "rgba(7,15,43,0.85)", ["--acc" as string]: accent }}
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
        style={{ background: `radial-gradient(ellipse at 50% 55%, ${accent}2e, transparent 68%)` }}
        aria-hidden="true"
      />
      <FallbackMotif slug={slug} accent={accent} />
    </div>
  );
}

function CardText({ slug, className = "" }: { slug: GallerySlug; className?: string }) {
  const c = GALLERY_COPY[slug];
  const accent = GALLERY_ACCENTS[slug];
  return (
    <div className={`relative z-10 p-6 sm:p-7 ${className}`}>
      <h3 className="text-2xl" style={{ ...SERIF, color: IVORY, fontWeight: 500 }}>
        {c.title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed" style={{ color: MUTED }}>
        {c.description}
      </p>
      <span className="g-link mt-5 inline-flex items-center gap-1 text-sm font-medium transition-transform duration-200" style={{ color: accent }}>
        {c.linkLabel}
      </span>
    </div>
  );
}

export default function SubjectGalleryCards() {
  const six = GALLERY_SLUGS.filter((s) => s !== "computer-science");
  return (
    <section id="disciplines" className="relative mx-auto max-w-[96rem] px-4 pt-24 pb-12 sm:px-6 lg:px-8" aria-labelledby="disciplines-h">
      {/* starfield carry-down from the hero meadow */}
      <div className="ta-stars pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(#030712, transparent)" }} aria-hidden="true" />

      <div className="relative">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>
          Explore your potential
        </p>
        <h2 id="disciplines-h" className="mt-4 max-w-3xl text-4xl sm:text-5xl" style={{ ...SERIF, color: IVORY, fontWeight: 500 }}>
          Seven subjects.{" "}
          <span
            style={{
              background: "linear-gradient(100deg, #F2D492, #DFB15B 45%, #9A7424)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Infinite possibilities.
          </span>
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: MUTED }}>
          Discover a world of understanding in every subject.
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
        .g-card:hover, .g-card:focus-visible {
          border-color: var(--acc) !important;
          box-shadow: 0 0 42px -10px var(--acc), inset 0 0 24px -18px var(--acc);
        }
        .g-glow { opacity: .6; transition: opacity .3s; }
        .g-card:hover .g-glow, .g-card:focus-visible .g-glow { opacity: 1; }
        .g-card:hover .g-link, .g-card:focus-visible .g-link { transform: translateX(5px); }
        .ta-stars {
          background-image:
            radial-gradient(1px 1px at 12% 22%, rgba(250,247,242,.5) 50%, transparent 51%),
            radial-gradient(1px 1px at 34% 64%, rgba(250,247,242,.34) 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 58% 18%, rgba(223,177,91,.4) 50%, transparent 51%),
            radial-gradient(1px 1px at 76% 46%, rgba(250,247,242,.4) 50%, transparent 51%),
            radial-gradient(1px 1px at 90% 78%, rgba(250,247,242,.3) 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 22% 86%, rgba(223,177,91,.3) 50%, transparent 51%);
          background-size: 340px 340px;
          opacity: .5;
          animation: ta-stars-drift 90s linear infinite;
        }
        @keyframes ta-stars-drift { from { background-position: 0 0; } to { background-position: -340px 340px; } }
        @media (prefers-reduced-motion: reduce) { .ta-stars { animation: none; } }
      `}</style>
    </section>
  );
}
