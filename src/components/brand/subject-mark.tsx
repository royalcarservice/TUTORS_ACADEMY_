import { MARK_STROKE, SUBJECT_MARKS } from "./subject-marks";

/* --------------------------------------------------------------------------
   SubjectMark — the six subject figures, drawn in the brand's stroke language.

   · Consumes GEOMETRY ONLY (subject-marks.ts) — never a subject config, so the
     3.1 import guard stays green. Colour arrives via currentColor from the
     `[data-subject]` accent tokens; this component hard-codes no colour.
   · aria-hidden by default (a subject name is always announced beside it).
     Pass `label` for the rare case the mark is the sole identifier.
   · An object, not a control: NO animation, hover or transition.
   · Sizes follow the 2.6 grid (16·20·24·32·48) plus a display size.
   ------------------------------------------------------------------------ */

export type SubjectMarkSize = 16 | 20 | 24 | 32 | 48 | "display";

const DISPLAY = 200;

export function SubjectMark({
  subject,
  size = 24,
  label,
  className,
}: {
  subject: string;
  size?: SubjectMarkSize;
  label?: string;
  className?: string;
}) {
  const def = SUBJECT_MARKS[subject];
  if (!def) return null;
  const px = size === "display" ? DISPLAY : size;

  return (
    <svg
      viewBox="0 0 32 32"
      width={px}
      height={px}
      role={label ? "img" : undefined}
      aria-hidden={label ? undefined : true}
      className={className}
      style={{ display: "block", color: "currentColor" }}
    >
      {label && <title>{label}</title>}
      <path
        d={def.d}
        fill="none"
        stroke="currentColor"
        strokeWidth={MARK_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
