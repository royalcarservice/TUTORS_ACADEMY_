import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/* --------------------------------------------------------------------------
   Input — the text field control. Skin is token-only in globals.css
   (`.ta-input`). Always pair with <Field> so the label/hint/error wiring is
   exact; a placeholder is never a label.

   States: default · hover · focus · filled · disabled · read-only · error
   (aria-invalid) · success (data-state) · loading/validating (spinner).
   ------------------------------------------------------------------------ */

export interface InputProps extends React.ComponentProps<"input"> {
  /** show a validating spinner and mark busy */
  validating?: boolean;
  /** success affordance (border + announced via Field success text) */
  state?: "success" | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, validating, state, style, ...props }, ref) => (
    <span style={{ position: "relative", display: "block" }}>
      <input
        ref={ref}
        className={cn("ta-input", className)}
        data-state={state}
        aria-busy={validating || undefined}
        style={{ paddingInlineEnd: validating ? "2.5rem" : undefined, ...style }}
        {...props}
      />
      {validating && (
        <span aria-hidden style={{ position: "absolute", top: "50%", right: "0.75rem", translate: "0 -50%", display: "inline-flex" }}>
          <span className="ta-btn__spinner" style={{ color: "var(--ta-text-muted)" }} />
        </span>
      )}
    </span>
  ),
);
Input.displayName = "Input";

/* Textarea shares the same skin + Field at no extra cost. */
export const Textarea = forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, style, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn("ta-input", className)}
      style={{ minHeight: "5rem", paddingBlock: "var(--ta-space-2)", ...style }}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
