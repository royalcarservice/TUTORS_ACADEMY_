import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/* Shared Halo-derived primitives: pill buttons, rounded panels, eyebrows. */

export function Pill({
  children,
  className,
  icon,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full",
        "bg-ink px-6 py-3 text-[0.9375rem] font-medium text-white",
        "transition-[transform,background-color,box-shadow] duration-200",
        "hover:bg-ink-2 hover:shadow-[0_10px_28px_-14px_rgba(11,11,12,0.75)]",
        "active:translate-y-px disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
      {icon}
    </button>
  );
}

export function PillGhost({
  children,
  className,
  icon,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full",
        "border border-line-2 bg-white/80 px-6 py-3 text-[0.9375rem] font-medium text-ink",
        "transition-[background-color,border-color] duration-200",
        "hover:border-ink/35 hover:bg-white",
        "active:translate-y-px",
        className,
      )}
      {...rest}
    >
      {children}
      {icon}
    </button>
  );
}

export function Eyebrow({
  children,
  className,
  tone = "ink",
}: {
  children: ReactNode;
  className?: string;
  tone?: "ink" | "light";
}) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center gap-2",
        tone === "ink" ? "text-ink-muted" : "text-white/60",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "ink" ? "bg-brass" : "bg-brass-soft",
        )}
      />
      {children}
    </span>
  );
}
