import { cloneElement, isValidElement } from "react";

/* --------------------------------------------------------------------------
   Field — the shared wrapper for EVERY input (current + deferred).
   Renders Label · Hint · Error · Success · required/optional indicator and
   wires accessibility exactly:

   · label ALWAYS bound via htmlFor/id — a placeholder is never a label
   · aria-describedby links hint AND error/success text
   · aria-invalid on error; error announced politely (live region)
   · required conveyed IN TEXT, never a bare asterisk
   · a Field never renders without a label
   ------------------------------------------------------------------------ */

export interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
  /** show an explicit "(optional)" marker when not required */
  showOptional?: boolean;
  children: React.ReactElement;
}

export function Field({ id, label, hint, error, success, required, showOptional, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const successId = success ? `${id}-success` : undefined;
  const describedBy = [hintId, errorId, successId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required: required || undefined,
      })
    : children;

  return (
    <div>
      <label className="ta-label" htmlFor={id}>
        {label}{" "}
        {required ? (
          <span style={{ color: "var(--ta-text-muted)" }}>(required)</span>
        ) : showOptional ? (
          <span style={{ color: "var(--ta-text-muted)" }}>(optional)</span>
        ) : null}
      </label>

      {control}

      {hint && <p className="ta-hint" id={hintId}>{hint}</p>}
      {error && (
        <p className="ta-error" id={errorId} aria-live="polite">
          <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" style={{ flex: "none" }}>
            <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 3.2v3.4M6 8.6h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
      {success && (
        <p className="ta-success" id={successId} aria-live="polite">
          <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" style={{ flex: "none" }}>
            <path d="M2.5 6.5l2.2 2.2L9.5 3.9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
}
