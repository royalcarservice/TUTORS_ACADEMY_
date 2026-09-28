import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";

/* ════════════════════════════════════════════════════════════════════════
   BRAND MARK — "THE UNBROKEN LINE" (Phase 2 · Step 6 · Part A)

   A monogram drawn as a SINGLE CONTINUOUS STROKE: the pen enters on the
   crossbar, sweeps it, returns to centre, drops the stem, and without lifting
   walks the right leg up to the apex and down the left leg — one path through
   the letterforms. DISCOVER → MASTER is one line, not seven steps.

   BANNED (never drawn): graduation cap · owl · open book · pencil · lightbulb
   · brain · rocket · atom · infinity loop · gradient orb · play-triangle ·
   globe.  (The previous cap logo is retired by this step.)

   BRAND FRAME RULE: identical in every subject environment. Subjects recolour
   the surrounding surface only — the mark never changes shape/spacing/proportion.
   No animation, no gradient/glow/shadow, no --ta-accent-* in the mark. Brass default.
   ════════════════════════════════════════════════════════════════════════ */

/** One unbroken stroke (single subpath). viewBox 0 0 32 32. */
export const MARK_PATH = "M6 9 H26 H16 V15 L24 27 L16 15 L8 27";

export type BrandVariant = "brass" | "ink" | "ivory" | "mono";

export const BRAND = {
  /** Clear space, expressed as a RATIO of the mark's own height (not px). */
  clearSpace: 0.5,
  /** Smallest lockup height at which the wordmark stays set (px). */
  minLockupHeight: 24,
  /** Smallest mark size shipped (favicon). */
  minMark: 16,
} as const;

const VARIANT_COLOR: Record<BrandVariant, string> = {
  brass: "var(--ta-brand)",
  ink: "var(--ta-ink-900)",
  ivory: "var(--ta-ivory-300)",
  mono: "currentColor",
};

export function BrandMark({
  size = 32,
  variant = "brass",
  strokeWidth = 2.5,
  className,
  title,
}: {
  size?: number;
  variant?: BrandVariant;
  /** heavier stroke for tiny (favicon) renders */
  strokeWidth?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
      style={{ color: VARIANT_COLOR[variant] }}
    >
      {title && <title>{title}</title>}
      <path
        d={MARK_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The wordmark is SET in the display family — type is the brand, never drawn. */
export function BrandWordmark({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "inverse" | "mono";
}) {
  const color =
    tone === "mono" ? "currentColor" : tone === "inverse" ? "var(--ta-ivory-300)" : "var(--ta-text-primary)";
  return (
    <span
      className={cn(className)}
      style={{
        fontFamily: "var(--ta-font-display)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        fontSize: "1.0625rem",
        lineHeight: 1,
        color,
        /* optical correction: caps sit a hair tighter at the edges */
        fontFeatureSettings: '"kern" 1',
        whiteSpace: "nowrap",
      }}
    >
      {siteConfig.name}
    </span>
  );
}

/** Mark + wordmark at a defined optical relationship. Clear space = ratio of mark height. */
export function BrandLockup({
  variant = "brass",
  markSize = 32,
  tone = "default",
  className,
}: {
  variant?: BrandVariant;
  markSize?: number;
  tone?: "default" | "inverse" | "mono";
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{ gap: `calc(${markSize}px * ${BRAND.clearSpace})` }}
    >
      <BrandMark size={markSize} variant={variant} title={siteConfig.name} />
      <BrandWordmark tone={tone} />
    </span>
  );
}
