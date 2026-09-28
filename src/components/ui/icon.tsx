import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

/* --------------------------------------------------------------------------
   Icons — LUCIDE (already a dependency; the one permitted icon set).
   ONE stroke weight (1.5). FIXED size grid: 16 · 20 · 24 only.
   Icons are NEVER the only carrier of meaning: icon-only controls get an
   accessible name (IconButton does this); icons beside text are aria-hidden.
   Icons DO NOT animate (the only animated icon is the button loading spinner).
   ------------------------------------------------------------------------ */

export type IconSize = 16 | 20 | 24;

export function Icon({
  glyph: Glyph,
  size = 20,
  className,
}: {
  glyph: LucideIcon;
  size?: IconSize;
  className?: string;
}) {
  return <Glyph aria-hidden size={size} strokeWidth={1.5} className={className} />;
}

export interface IconButtonProps extends React.ComponentProps<"button"> {
  glyph: LucideIcon;
  /** REQUIRED accessible name for the icon-only control. */
  label: string;
  size?: IconSize;
}

/** Pairs an icon with a guaranteed accessible name + a ≥44px target. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ glyph, label, size = 20, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={className}
      style={{
        minHeight: "var(--ta-target-min)",
        minWidth: "var(--ta-target-min)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--ta-radius-2)",
        border: "1px solid var(--ta-border-subtle)",
        background: "var(--ta-surface-raised)",
        color: "var(--ta-text-primary)",
        cursor: "pointer",
        ...props.style,
      }}
      {...props}
    >
      <Icon glyph={glyph} size={size} />
    </button>
  ),
);
IconButton.displayName = "IconButton";
