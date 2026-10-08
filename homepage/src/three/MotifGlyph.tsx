import type { MotifId } from "../data/subjects";

/* Small mark for each subject, echoing the 3D motif so the cards, the panels
   and the sculpture all speak the same visual language. Drawn on
   `currentColor` so a caller can set the accent for its surface. */

const GLYPHS: Record<MotifId, React.ReactNode> = {
  lattice: (
    <>
      <path
        d="M6 6h12M6 12h12M6 18h12M6 6v12M12 6v12M18 6v12"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.45"
        fill="none"
      />
      {[6, 12, 18].flatMap((y) =>
        [6, 12, 18].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" fill="currentColor" />
        )),
      )}
    </>
  ),
  field: (
    <>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M4 ${7 + i * 5}c4-4 8 4 12 0s4-2 4-2`}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity={1 - i * 0.22}
        />
      ))}
      <circle cx="20" cy="7" r="1.5" fill="currentColor" />
      <circle cx="20" cy="12" r="1.5" fill="currentColor" opacity="0.8" />
    </>
  ),
  bonds: (
    <>
      <path
        d="M12 12 5 7m7 5 7-4m-7 4-4 6m4-6 5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.8" fill="currentColor" />
      <circle cx="5" cy="7" r="2" fill="currentColor" opacity="0.75" />
      <circle cx="19" cy="8" r="2" fill="currentColor" opacity="0.75" />
      <circle cx="8" cy="18" r="2" fill="currentColor" opacity="0.75" />
      <circle cx="17" cy="17" r="2" fill="currentColor" opacity="0.75" />
    </>
  ),
  branching: (
    <>
      <path
        d="M12 21v-8m0 0-5-5m5 5 5-5m-9 1-2-3m11 2 2-3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="7" cy="8" r="1.8" fill="currentColor" />
      <circle cx="17" cy="8" r="1.8" fill="currentColor" />
      <circle cx="5" cy="5" r="1.4" fill="currentColor" opacity="0.7" />
      <circle cx="19" cy="5" r="1.4" fill="currentColor" opacity="0.7" />
    </>
  ),
  pages: (
    <>
      <rect
        x="4"
        y="5"
        width="12"
        height="15"
        rx="1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.45"
      />
      <rect
        x="7"
        y="3.5"
        width="12"
        height="15"
        rx="1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <rect
        x="10"
        y="2"
        width="12"
        height="15"
        rx="1.6"
        fill="#fbfaf7"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M13 6.5h6M13 9.5h6M13 12.5h4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.8"
      />
    </>
  ),
  strata: (
    <>
      {[0, 1, 2].map((i) => (
        <ellipse
          key={i}
          cx="12"
          cy={7 + i * 5}
          rx={9 - i * 1.6}
          ry={3 - i * 0.4}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity={1 - i * 0.2}
        />
      ))}
      <circle cx="19" cy="7" r="1.6" fill="currentColor" />
      <circle cx="6" cy="12" r="1.6" fill="currentColor" />
      <circle cx="16" cy="17" r="1.6" fill="currentColor" />
    </>
  ),
};

export function MotifGlyph({
  motif,
  className,
  style,
}: {
  motif: MotifId;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[motif]}
    </svg>
  );
}
