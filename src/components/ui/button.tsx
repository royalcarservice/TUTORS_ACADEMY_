import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/* --------------------------------------------------------------------------
   Button — behavior + skin as separate layers (Phase 2 · Step 5).

   Skin lives in globals.css `.ta-btn` and is driven ONLY by semantic tokens,
   so Phase 3 subjects re-theme it by overriding tokens, never this file.
   ONE skin is shared by <button> and <a> via `taButtonSkin()`.

   ROLES (exactly four — a fifth "colour variant" is forbidden):
     primary   · the ONE main action in a view (EMPHASIS RULE)
     secondary · supporting action
     ghost     · tertiary / low emphasis
     danger    · destructive — a ROLE, not a colour variant

   Disabled: prefer `disabled`. Use `ariaDisabled` where the user must still
   focus the control to learn WHY it is unavailable (it stays announced).
   ------------------------------------------------------------------------ */

export type ButtonRole = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

/** Shared skin for <button> and <a>. Never duplicated. */
export function taButtonSkin(
  variant: ButtonRole = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  void variant; // role/skin carried by data-* attrs set at the call site
  void size;
  return cn("ta-btn", className);
}

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonRole;
  size?: ButtonSize;
  /** Real async only. Shows spinner + aria-busy, preserves width, blocks input. */
  loading?: boolean;
  /** Render as an anchor (navigation) sharing the same skin. */
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, href, className, children, disabled, ...props }, ref) => {
    const skin = cn(taButtonSkin(variant, size, className));
    const dataAttrs = { "data-variant": variant, "data-size": size } as const;

    const inner = (
      <>
        {loading && (
          <span aria-hidden style={{ position: "absolute", inset: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <span className="ta-btn__spinner" />
          </span>
        )}
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--ta-space-2)", visibility: loading ? "hidden" : undefined }} aria-hidden={loading || undefined}>
          {children}
        </span>
        {loading && <span className="sr-only">{children}</span>}
      </>
    );

    if (href) {
      return (
        <a ref={ref as never} href={href} className={skin} {...dataAttrs} aria-busy={loading || undefined} {...(props as object)}>
          {inner}
        </a>
      );
    }
    return (
      <button
        ref={ref}
        type="button"
        className={skin}
        disabled={disabled}
        aria-busy={loading || undefined}
        {...dataAttrs}
        {...props}
      >
        {inner}
      </button>
    );
  },
);
Button.displayName = "Button";

/* ── LEGACY SKIN (pre-Step-5) — consumed by existing pages via buttonClass().
   Left byte-for-byte identical so no existing page is restyled. A later phase
   migrates these call sites onto .ta-btn and deletes this block.          */
const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 " +
  "disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";

export const buttonVariants = {
  primary: "bg-surface-brand text-text-on-brand shadow-brand hover:bg-brand-700 focus-visible:outline-brand-600",
  secondary: "bg-ink-900 text-white hover:bg-ink-800 focus-visible:outline-ink-900",
  outline: "border border-border-strong bg-surface text-foreground hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
  ghost: "text-foreground-muted hover:bg-ink-100 hover:text-foreground",
  accent: "bg-accent-500 text-white hover:bg-accent-600",
  danger: "bg-danger-500 text-white hover:bg-danger-700",
} as const;

export const buttonSizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-10",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type LegacyButtonSize = keyof typeof buttonSizes;

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: LegacyButtonSize = "md",
  className?: string,
) {
  return cn(base, buttonVariants[variant], buttonSizes[size], className);
}
