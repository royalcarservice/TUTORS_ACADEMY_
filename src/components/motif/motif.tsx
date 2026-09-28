import { ROLE_BOX, ROLE_RULES } from "@/lib/motif/budgets";
import { generateMotif } from "@/lib/motif/grammar";
import { groupElements } from "@/lib/motif/path";
import type { Density, MotifKind, MotifLayer, MotifRole } from "@/lib/motif/types";

/* ════════════════════════════════════════════════════════════════════════
   PART 5 — THE RENDERER (Phase 3 · Step 3)

   · SERVER-RENDERED. Generation is pure and synchronous; the geometry is in
     the HTML on first paint. No client layout pass, no flash of empty
     structure, and no client JS at all (this file has no "use client").
   · aria-hidden THROUGHOUT. A motif is decoration: it never enters the
     accessibility tree or the reading order.
   · ACCENT-AWARE VIA TOKENS ONLY. Colour is `var(--ta-accent-*)`; no hex is
     hardcoded here and no subject config is imported (3.1 guard).
   · THEME-AWARE WITH NO CONDITIONAL JS — the tokens swap under
     [data-theme="light"], so the same markup serves both themes.
   · EXPLICIT DIMENSIONS — the SVG fills a wrapper whose size is fixed by
     inset (absolute roles) or aspect-ratio (flow roles), so motifs cause no
     layout shift.
   · NO FILTERS, BLUR, DROP-SHADOW OR BLEND MODES. Softness = opacity layering
     (quiet 0.55 / base 0.8 / mid+emphasis 1.0 of ONE role ceiling) plus
     gradient masks. Cheap, vector, theme-aware.

   A FUTURE WebGL RENDERER consumes `generateMotif(...)` directly — the same
   `MotifElement.points` and `.params` — and never touches this file.
   ════════════════════════════════════════════════════════════════════════ */

/** A content region to keep clear, in fractions (0..1) of the composition box. */
export interface ExcludeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Where the motif is being rendered. Rooms may not hold a substrate. */
export type MotifScope = "stage" | "room";

/**
 * THE ENFORCEMENT POINT for the roomMood rule.
 * A Room may only hold edge, divider and focus. `substrate` and `transition`
 * are refused HERE — in code, not convention — and the Room component's own
 * prop type excludes them, so it will not even typecheck.
 */
export function isRoleAllowed(scope: MotifScope, role: MotifRole): boolean {
  if (scope === "stage") return true;
  return ROLE_RULES[role].roomAllowed;
}

/** Layer -> accent token. Identity comes from the [data-subject] scope. */
const LAYER_COLOR: Record<MotifLayer, string> = {
  quiet: "var(--ta-accent-3)",
  base: "var(--ta-accent-2)",
  mid: "var(--ta-accent-1)",
  emphasis: "var(--ta-accent-1)",
};

/** Opacity LAYERING — the only softness technique in the system. */
const LAYER_OPACITY: Record<MotifLayer, number> = { quiet: 0.8, base: 0.9, mid: 1, emphasis: 1 };
/** Filled primitives (nodes, bands) sit quieter than strokes. */
const FILL_QUIET = 0.6;

export interface MotifProps {
  /** Subject id — drives the accent token scope, never a config import. */
  subject: string;
  kind: MotifKind;
  role: MotifRole;
  density: Density;
  /** "stage" (default) or "room" — rooms refuse substrate/transition. */
  scope?: MotifScope;
  /** Part of the seed, so two placements of the same motif differ. */
  purpose?: string;
  index?: number;
  /** Content regions masked out of the motif. Legibility is non-negotiable. */
  exclude?: ExcludeRect[];
  /** For the edge role: which edge the structure bleeds from. */
  edgeSide?: "left" | "right";
  className?: string;
  style?: React.CSSProperties;
}

const ABSOLUTE_ROLES: MotifRole[] = ["substrate", "edge", "transition"];

export function Motif({
  subject,
  kind,
  role,
  density,
  scope = "stage",
  purpose,
  index = 0,
  exclude = [],
  edgeSide = "right",
  className,
  style,
}: MotifProps) {
  /* Enforcement: a Room cannot hold this role. Nothing is rendered at all. */
  if (!isRoleAllowed(scope, role)) return null;

  const data = generateMotif({ subject, kind, role, density, purpose, index });
  const geo = groupElements(data.elements, data.stroke);
  const rule = ROLE_RULES[role];
  const box = ROLE_BOX[role];
  const uid = `ta-motif-${data.hash}`; // derived from geometry: stable across SSR/CSR
  const needsFade = role === "edge";
  const needsMask = needsFade || exclude.length > 0;
  const absolute = ABSOLUTE_ROLES.includes(role);

  return (
    <div
      data-motif={kind}
      data-motif-role={role}
      data-motif-density={density}
      aria-hidden="true"
      className={className}
      style={{
        position: absolute ? "absolute" : "relative",
        inset: absolute ? 0 : undefined,
        width: absolute ? undefined : "100%",
        aspectRatio: absolute ? undefined : `${box.w} / ${box.h}`,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${box.w} ${box.h}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
        style={{ display: "block" }}
      >
        {needsMask && (
          <defs>
            {needsFade && (
              <linearGradient
                id={`${uid}-fade`}
                x1={edgeSide === "right" ? "0" : "1"}
                y1="0"
                x2={edgeSide === "right" ? "1" : "0"}
                y2="0"
              >
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.55" stopColor="#fff" stopOpacity="0.7" />
                <stop offset="1" stopColor="#fff" stopOpacity="1" />
              </linearGradient>
            )}
            <mask id={uid} maskUnits="userSpaceOnUse" x="0" y="0" width={box.w} height={box.h}>
              <rect x="0" y="0" width={box.w} height={box.h} fill={needsFade ? `url(#${uid}-fade)` : "#fff"} />
              {exclude.map((r, i) => (
                <rect
                  key={`x${i}`}
                  x={Math.round(r.x * box.w * 100) / 100}
                  y={Math.round(r.y * box.h * 100) / 100}
                  width={Math.round(r.w * box.w * 100) / 100}
                  height={Math.round(r.h * box.h * 100) / 100}
                  fill="#000"
                />
              ))}
            </mask>
          </defs>
        )}
        <g opacity={rule.opacity} mask={needsMask ? `url(#${uid})` : undefined}>
          {geo.fragments.map((f) =>
            f.paint === "stroke" ? (
              <path
                key={`${f.layer}-${f.width}-s`}
                d={f.d}
                fill="none"
                stroke={LAYER_COLOR[f.layer]}
                strokeWidth={f.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={LAYER_OPACITY[f.layer]}
              />
            ) : (
              <path
                key={`${f.layer}-${f.width}-f`}
                d={f.d}
                fill={LAYER_COLOR[f.layer]}
                stroke="none"
                opacity={Math.round(LAYER_OPACITY[f.layer] * FILL_QUIET * 1000) / 1000}
              />
            ),
          )}
        </g>
      </svg>
    </div>
  );
}

/** Budget readout helper for specimens/CI — same numbers the renderer emits. */
export function motifBudget(data: ReturnType<typeof generateMotif>) {
  const geo = groupElements(data.elements, data.stroke);
  return {
    elements: data.elements.length,
    domNodes: geo.domNodes + (data.role === "edge" ? 3 : 1), // + defs/mask when masked
    commands: geo.commands,
  };
}
