/* ════════════════════════════════════════════════════════════════════════
   PART 1 — THE PRIMITIVE VOCABULARY (Phase 3 · Step 3)

   PURE GEOMETRY PRODUCERS. Each takes parameters and returns DATA — never
   markup, never a DOM node, never a colour. Every producer attaches the
   parameters that Step 3.5 will animate, so motion never re-generates
   structure.

   ANTI-ALIGNMENT RULE: no primitive may read the viewport. Alignment derives
   ONLY from the composition `Box` it is handed (see ROLE_BOX in budgets.ts).
   A primitive that needed `window` would break SSR determinism, so none does.

   FAMILY LINK TO THE MARKS (3.2): motif strokes keep the mark family's
   terminals (round caps), joins (round), and curve character (shallow arcs,
   control points near the chord). Weight is DERIVED, not copied: the marks
   use 2.5/32 = 0.078 of their canvas; a structural field at composition scale
   uses 0.0055 of the box minor axis (see STROKE_RATIO) so motif lines read as
   STRUCTURE and marks read as MARKS. Same hand, different job.
   ════════════════════════════════════════════════════════════════════════ */

import type { Box, MotifElement, MotifLayer, MotifWeight, Vec } from "./types";

/* ── tiny vector maths (pure, allocation-light) ─────────────────────────── */

export const pt = (x: number, y: number): Vec => ({ x, y });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const scale = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
export const lerp = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
export const dist = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.y - a.y);
export const angleOf = (a: Vec, b: Vec) => Math.atan2(b.y - a.y, b.x - a.x);
/** Step from `a` along `angleDeg` by `len`. */
export const step = (a: Vec, angleDeg: number, len: number): Vec => {
  const r = (angleDeg * Math.PI) / 180;
  return { x: a.x + Math.cos(r) * len, y: a.y + Math.sin(r) * len };
};
/** Snap an angle to the nearest member of a constrained set (degrees). */
export function snapAngle(deg: number, allowed: readonly number[]): number {
  let best = allowed[0];
  let bestD = Infinity;
  for (let i = 0; i < allowed.length; i++) {
    const d = Math.abs(((deg - allowed[i] + 540) % 360) - 180);
    if (d < bestD) {
      bestD = d;
      best = allowed[i];
    }
  }
  return best;
}

/* ── weight classes ─────────────────────────────────────────────────────── */

/** Hairline stroke as a ratio of the box MINOR axis. See the header note. */
export const STROKE_RATIO = 0.007;
export const strokeFor = (box: Box) => Math.max(1, Math.min(box.w, box.h) * STROKE_RATIO);

/** Multipliers applied to the hairline weight. One emphasis moment per motif. */
export const WEIGHT_SCALE: Record<MotifWeight, number> = {
  hairline: 1,
  line: 1.5,
  emphasis: 2.25,
};

/* ── the six producers ──────────────────────────────────────────────────── */

interface Common {
  layer?: MotifLayer;
  weight?: MotifWeight;
}

/**
 * LINE — one segment. Termination rule: round caps, always (family cue);
 * a line never terminates on a node centre without the caller passing the node
 * radius, so `trim` shortens it to the node edge.
 * Animatable: length, angle.
 */
export function LINE(from: Vec, to: Vec, opts: Common & { trim?: number } = {}): MotifElement {
  const trim = opts.trim ?? 0;
  const d = dist(from, to) || 1;
  const a = angleOf(from, to);
  const p0 = trim ? step(from, (a * 180) / Math.PI, trim) : from;
  const p1 = trim ? step(to, (a * 180) / Math.PI + 180, trim) : to;
  return {
    primitive: "line",
    points: [p0, p1],
    layer: opts.layer ?? "base",
    weight: opts.weight ?? "line",
    params: {
      length: Math.round(d * 100) / 100,
      angle: Math.round(((a * 180) / Math.PI + 360) % 360 * 100) / 100,
      reveal: 1, // 3.5: 0 -> 1 draws the line
    },
  };
}

/**
 * POLYLINE — an ordered walk. Angles are the caller's responsibility: rule
 * sets pass CONSTRAINED angle sets (lattice 0/45/90, bonds 60-degree set).
 * Animatable: reveal, phase.
 */
export function POLYLINE(points: Vec[], opts: Common & { closed?: boolean } = {}): MotifElement {
  return {
    primitive: "polyline",
    points,
    closed: opts.closed,
    layer: opts.layer ?? "base",
    weight: opts.weight ?? "line",
    params: {
      segments: points.length - 1,
      reveal: 1,
      phase: 0, // 3.5: stagger offset
    },
  };
}

/**
 * CURVE — a control polygon rendered as a Catmull-Rom cubic spline.
 * Curve character follows the marks: `tension` stays low (0.5 default) so arcs
 * are shallow and confident, never spiralled.
 * Animatable: tension, curvature, phase.
 */
export function CURVE(points: Vec[], opts: Common & { tension?: number; closed?: boolean } = {}): MotifElement {
  const tension = opts.tension ?? 0.5;
  return {
    primitive: "curve",
    points,
    closed: opts.closed,
    layer: opts.layer ?? "base",
    weight: opts.weight ?? "line",
    params: {
      controlPoints: points.length,
      tension: Math.round(tension * 1000) / 1000,
      curvature: 1, // 3.5: amplitude multiplier
      phase: 0,
      reveal: 1,
    },
  };
}

/**
 * NODE — a position with optional emphasis weight. The ONLY filled primitive
 * (a filled dot reads as a node at low contrast; a ring does not).
 * Animatable: r, pulse.
 */
export function NODE(at: Vec, opts: Common & { r?: number } = {}): MotifElement {
  const emphasis = opts.weight === "emphasis";
  return {
    primitive: "node",
    points: [at],
    layer: opts.layer ?? (emphasis ? "emphasis" : "mid"),
    weight: opts.weight ?? "line",
    params: {
      r: Math.round((opts.r ?? (emphasis ? 2.6 : 1.5)) * 100) / 100,
      pulse: 1, // 3.5: scale multiplier
    },
  };
}

/**
 * EDGE — connects two nodes, angle drawn from a CONSTRAINED set. Enforces the
 * caller's angle vocabulary by snapping, so a rule set cannot drift into
 * arbitrary geometry.
 * Animatable: length, reveal.
 */
export function EDGE(a: Vec, b: Vec, allowedAngles: readonly number[], opts: Common & { offset?: number; trim?: number } = {}): MotifElement {
  const snapped = snapAngle((angleOf(a, b) * 180) / Math.PI, allowedAngles);
  const len = dist(a, b);
  const to = step(a, snapped, len);
  const el = LINE(a, to, opts);
  el.params.angle = Math.round(((snapped + 360) % 360) * 100) / 100;
  return el;
}

/**
 * BAND — a horizontal or vertical region with thickness and internal
 * subdivision. Emitted as DATA (origin, end, thickness, subdivisions); the
 * renderer decides how to paint it (soft fill + hairline edge). Bands are how
 * `typographic` and `strata` get presence without becoming flat colour blocks.
 * Animatable: thickness, offset, subdivisionPhase.
 */
export function BAND(
  origin: Vec,
  end: Vec,
  thickness: number,
  subdivisions: number,
  opts: Common & { axis?: "horizontal" | "vertical" } = {},
): MotifElement {
  return {
    primitive: "band",
    points: [origin, end],
    layer: opts.layer ?? "quiet",
    weight: opts.weight ?? "hairline",
    params: {
      axis: opts.axis === "vertical" ? 1 : 0,
      thickness: Math.round(thickness * 100) / 100,
      subdivisions: Math.max(0, Math.round(subdivisions)),
      offset: 0, // 3.5: slide along the axis
      reveal: 1,
    },
  };
}

/**
 * FIELD — a distribution of streamlines over an area. Returns control polygons
 * (one per streamline) sharing ONE displacement function, so the lines keep a
 * common directional tendency AND CANNOT CROSS: every line is a vertical
 * offset of the same shape, so their order is preserved for all x.
 * `density` = number of lines; `strength` = how hard the field bends them.
 * Animatable: direction, strength, phase.
 */
export function FIELD(
  box: Box,
  opts: {
    count: number;
    direction?: number; // degrees of overall drift
    strength?: number; // 0..1 bend amplitude as a fraction of box height
    centre?: number; // 0..1 horizontal position of the influence
    span?: number; // 0..1 fraction of the box the field occupies
  },
): { polylines: Vec[][]; params: Record<string, number> } {
  const count = Math.max(2, Math.round(opts.count));
  const strength = Math.min(0.5, Math.max(0, opts.strength ?? 0.18));
  const centre = opts.centre ?? 0.42;
  const direction = opts.direction ?? 0;
  const span = Math.min(1, Math.max(0.2, opts.span ?? 1));
  const h = box.h * span;
  const top = (box.h - h) / 2;
  const gap = h / count;
  const drift = Math.tan((direction * Math.PI) / 180) * box.w;
  const amp = box.h * strength;

  const polylines: Vec[][] = [];
  for (let i = 0; i < count; i++) {
    // Offset from the field centre; identical shape for every line.
    const base = top + gap * (i + 0.5);
    const pts: Vec[] = [];
    // 5 samples -> 2 cubic segments after Catmull-Rom: shallow, per the family.
    for (let s = 0; s <= 4; s++) {
      const t = s / 4;
      const x = box.w * t;
      // Shared displacement: a single smooth lobe around `centre`.
      const d = t - centre;
      const bend = amp * Math.exp(-(d * d) * 7) * (d < 0 ? 1 : 0.55);
      pts.push(pt(x, base + bend + drift * (t - 0.5)));
    }
    polylines.push(pts);
  }
  return {
    polylines,
    params: {
      count,
      direction: Math.round(direction * 100) / 100,
      strength: Math.round(strength * 1000) / 1000,
      centre: Math.round(centre * 1000) / 1000,
      phase: 0, // 3.5: flow along the lines
    },
  };
}
