import { forwardRef } from "react";

/* RULE (P5-R6, docs/PROGRESS_LANGUAGE.md): permitted ONLY where the denominator is real and simultaneous — an operation in flight (a transfer). FORBIDDEN for a person's learning over time, in any form, at any phase.
   --------------------------------------------------------------------------
   Progress — the product's linear progress language (student · tutor · admin).
   Determinate and indeterminate only; ring/dial deferred.

   · role="progressbar" + aria-valuemin/max (+ aria-valuenow when determinate)
   · indeterminate OMITS aria-valuenow (correctly)
   · numeric labels use TABULAR NUMERALS (no jitter)
   · track/fill from tokens; fill uses BRAND. Signal is reserved for live
     states and is NOT used here.
   · indeterminate is compositor-only (transform) and renders STATIC under
     reduced motion (never a stall).
   ------------------------------------------------------------------------ */

export interface ProgressProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** 0–100. Omit (or pass undefined) for indeterminate. */
  value?: number;
  /** accessible label, e.g. "Course completion" */
  label: string;
  /** show a tabular numeric read-out */
  showValue?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, label, showValue, ...props }, ref) => {
    const indeterminate = value == null;
    const clamped = Math.max(0, Math.min(100, value ?? 0));
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-3)" }}>
        <div
          ref={ref}
          className="ta-progress"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={indeterminate ? undefined : clamped}
          data-indeterminate={indeterminate || undefined}
          style={{ flex: 1 }}
          {...props}
        >
          <span
            className="ta-progress__fill"
            style={indeterminate ? undefined : { width: "100%", transform: `scaleX(${clamped / 100})`, transformOrigin: "left" }}
          />
        </div>
        {showValue && !indeterminate && (
          <span className="ta-progress__label" style={{ fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-sm)", color: "var(--ta-text-muted)" }}>
            {clamped}%
          </span>
        )}
      </div>
    );
  },
);
Progress.displayName = "Progress";
