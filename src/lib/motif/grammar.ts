/* ════════════════════════════════════════════════════════════════════════
   PART 2 — THE SIX RULE SETS (Phase 3 · Step 3)

   Each rule set is a PURE FUNCTION: (seed stream, box, density) -> data.
   No colour, no markup, no viewport, no clock. Six is a CLOSED SET inherited
   from the 3.1 schema — there is no seventh motif and no registry to extend.

   EVERY RULE SET DECLARES (see MOTIF_RULES, used by the specimen + docs):
     · dominant angles or curve character
     · what an EMPHASIS moment is, and how rare (always exactly ONE per surface)
     · minimum / maximum feature size
     · what must NEVER appear
     · how density scales it
     · which parameters Step 3.5 will modulate (declared now, applied later)

   THE TEST THIS MUST PASS: recognisable as THIS subject at a glance at low
   contrast. Generically pretty = failed.
   ════════════════════════════════════════════════════════════════════════ */

import { DENSITY_MULTIPLIER, MAX_COMMANDS, ROLE_BOX, ROLE_RULES } from "./budgets";
import { between, fingerprint, intBetween, makeSeed, pick, shuffled, sign, streamFromSeed, type Rand } from "./hash";
import { BAND, CURVE, EDGE, FIELD, LINE, NODE, POLYLINE, pt, step, strokeFor } from "./primitives";
import { renderElement, serialiseGeometry } from "./path";
import type { Box, Density, MotifElement, MotifKind, MotifRole, Vec } from "./types";

/* ── shared feature-size bounds (fractions of the box minor axis) ────────── */

const MIN_FEATURE = 0.045;
const MAX_FEATURE = 0.62;

/* ── rule context handed to every rule set ──────────────────────────────── */

export interface RuleContext {
  rand: Rand;
  box: Box;
  density: Density;
  role: MotifRole;
  featureScale: number;
  stroke: number;
  /** Feature count after density AND role scaling. */
  count: (n: number) => number;
  /** Clamp a length into the motif's feature-size window. */
  clamp: (len: number) => number;
}

const makeContext = (rand: Rand, box: Box, density: Density, role: MotifRole): RuleContext => {
  const minor = Math.min(box.w, box.h);
  const rule = ROLE_RULES[role];
  return {
    rand,
    box,
    density,
    role,
    stroke: strokeFor(box),
    featureScale: rule.featureScale,
    count: (n: number) => Math.max(1, Math.round(n * DENSITY_MULTIPLIER[density] * rule.featureScale)),
    clamp: (len: number) => Math.max(minor * MIN_FEATURE, Math.min(minor * MAX_FEATURE, len)),
  };
};

/* ════════════════════════════════════════════════════════════════════════
   1 · LATTICE — Mathematics. A grid with rational subdivisions and ONE
   emphasised path threading it. Structure discovered, not imposed.
   ════════════════════════════════════════════════════════════════════════ */

function lattice(c: RuleContext): MotifElement[] {
  const { box, rand } = c;
  const pad = Math.min(box.w, box.h) * 0.09;
  const cols = Math.max(3, c.count(8));
  const rows = Math.max(2, c.count(5));
  const cw = (box.w - pad * 2) / cols;
  const ch = (box.h - pad * 2) / rows;
  const out: MotifElement[] = [];

  // Grid — orthogonal only (0/90). Hairline: it is the substrate of the idea.
  for (let i = 0; i <= cols; i++) {
    const x = pad + i * cw;
    out.push(LINE(pt(x, pad), pt(x, box.h - pad), { layer: "quiet", weight: "hairline" }));
  }
  for (let j = 0; j <= rows; j++) {
    const y = pad + j * ch;
    out.push(LINE(pt(pad, y), pt(box.w - pad, y), { layer: "quiet", weight: "hairline" }));
  }

  // Rational subdivisions — a mid-line inside a minority of cells.
  const subs = Math.round(cols * rows * 0.22);
  for (let s = 0; s < subs; s++) {
    const i = intBetween(rand, 0, cols - 1);
    const j = intBetween(rand, 0, rows - 1);
    const x = pad + i * cw;
    const y = pad + j * ch;
    if (rand() < 0.5) out.push(LINE(pt(x + cw / 2, y), pt(x + cw / 2, y + ch), { layer: "quiet", weight: "hairline" }));
    else out.push(LINE(pt(x, y + ch / 2), pt(x + cw, y + ch / 2), { layer: "quiet", weight: "hairline" }));
  }

  // Nodes — a minority of intersections; never all of them.
  const nodeCount = Math.max(2, Math.round((cols + rows) / 2));
  for (let k = 0; k < nodeCount; k++) {
    const i = intBetween(rand, 0, cols);
    const j = intBetween(rand, 0, rows);
    out.push(NODE(pt(pad + i * cw, pad + j * ch), { layer: "mid", weight: "line", r: 1.3 }));
  }

  // THE emphasis moment: exactly one path threading the lattice.
  let i = intBetween(rand, 0, Math.max(0, cols - 3));
  let j = rows - 1;
  const walk: Vec[] = [pt(pad + i * cw, pad + j * ch)];
  const hops = Math.min(cols - i, Math.max(3, c.count(5)));
  for (let s = 0; s < hops; s++) {
    // Orthogonal staircase only. A "cell diagonal" on a non-square cell is
    // neither 45 nor 90 degrees, so it does not exist in this motif.
    if (s % 2 === 0) i += 1;
    else if (j > 0) j -= 1;
    else i += 1;
    i = Math.min(cols, i);
    walk.push(pt(pad + i * cw, pad + j * ch));
  }
  out.push(POLYLINE(walk, { layer: "emphasis", weight: "emphasis" }));
  out.push(NODE(walk[walk.length - 1], { layer: "emphasis", weight: "emphasis", r: 2.4 }));
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
   2 · FIELD — Physics. Streamlines sharing a directional tendency, spaced by
   field strength. LINES NEVER CROSS: every line is a vertical offset of one
   shared displacement function, so ordering holds for all x (by construction,
   not by checking).
   ════════════════════════════════════════════════════════════════════════ */

function field(c: RuleContext): MotifElement[] {
  const { box, rand } = c;
  const count = Math.max(3, c.count(7));
  const strength = between(rand, 0.12, 0.2);
  const centre = between(rand, 0.34, 0.56);
  const direction = between(rand, -6, 6);
  const out: MotifElement[] = [];

  const f = FIELD(box, { count, strength, centre, direction, span: 0.86 });
  // One line resists the field and leaves straight — the emphasis moment.
  const straight = Math.floor(count / 2);

  for (let i = 0; i < f.polylines.length; i++) {
    const isEmphasis = i === straight;
    const pts = isEmphasis
      ? f.polylines[i].map((p, k) => {
          // Pull the emphasised line back toward its own baseline: force
          // changes a path, and this one answers it.
          const base = f.polylines[i][0].y;
          const t = k / (f.polylines[i].length - 1);
          return pt(p.x, p.y + (base - p.y) * (0.55 + 0.35 * t));
        })
      : f.polylines[i];
    out.push(
      CURVE(pts, {
        layer: isEmphasis ? "emphasis" : i % 3 === 0 ? "mid" : "base",
        weight: isEmphasis ? "emphasis" : i % 3 === 0 ? "line" : "hairline",
        tension: 0.45,
      }),
    );
  }

  // The influence origin — the morph anchor named in the 3.1 motionCharter.
  const origin = pt(box.w * 0.08, box.h * (0.5 + (rand() - 0.5) * 0.1));
  out.push(NODE(origin, { layer: "mid", weight: "line", r: 2.1 }));
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
   3 · BONDS — Chemistry. Nodes with VALENCE LIMITS, edges only at discrete
   angles, and OPEN REACTION SITES — available bonds deliberately unfilled.
   ════════════════════════════════════════════════════════════════════════ */

const BOND_ANGLES = [0, 60, 120, 180, 240, 300];
const VALENCE_MAX = 4; // chemical ceiling
const GROWTH_DEGREE = 3; // growth stops below the ceiling => free valence exists

function bonds(c: RuleContext): MotifElement[] {
  const { box, rand } = c;
  const pad = Math.min(box.w, box.h) * 0.14;
  const bond = c.clamp(Math.min(box.w, box.h) * 0.19);
  const maxNodes = Math.max(4, c.count(9));
  const minDist = bond * 0.92;
  const out: MotifElement[] = [];

  const nodes: Vec[] = [pt(box.w * 0.5 + between(rand, -1, 1) * box.w * 0.04, box.h * 0.5 + between(rand, -1, 1) * box.h * 0.05)];
  const degree: number[] = [0];
  const edges: [number, number][] = [];

  const inside = (p: Vec) => p.x > pad && p.x < box.w - pad && p.y > pad && p.y < box.h - pad;
  let guard = 0;
  while (nodes.length < maxNodes && guard < maxNodes * 12) {
    guard++;
    const from = intBetween(rand, 0, nodes.length - 1);
    if (degree[from] >= GROWTH_DEGREE) continue;
    const order = shuffled(rand, BOND_ANGLES);
    for (let a = 0; a < order.length; a++) {
      const cand = step(nodes[from], order[a], bond * between(rand, 0.92, 1.12));
      if (!inside(cand)) continue;
      let clash = false;
      for (let k = 0; k < nodes.length; k++) {
        if (Math.hypot(nodes[k].x - cand.x, nodes[k].y - cand.y) < minDist) {
          clash = true;
          break;
        }
      }
      if (clash) continue;
      nodes.push(cand);
      degree.push(0);
      edges.push([from, nodes.length - 1]);
      degree[from]++;
      break;
    }
  }

  for (let e = 0; e < edges.length; e++) {
    const [a, b] = edges[e];
    out.push(EDGE(nodes[a], nodes[b], BOND_ANGLES, { layer: "base", weight: "line", trim: c.stroke * 1.4 }));
  }
  for (let i = 0; i < nodes.length; i++) {
    out.push(NODE(nodes[i], { layer: "mid", weight: "line", r: 1.8 }));
  }

  // Emphasis: exactly ONE double bond (a parallel pair), chemistry's accent.
  if (edges.length) {
    const [a, b] = edges[intBetween(rand, 0, edges.length - 1)];
    const dx = nodes[b].x - nodes[a].x;
    const dy = nodes[b].y - nodes[a].y;
    const len = Math.hypot(dx, dy) || 1;
    const off = c.stroke * 1.7;
    const nx = (-dy / len) * off;
    const ny = (dx / len) * off;
    out.push(
      LINE(pt(nodes[a].x + nx, nodes[a].y + ny), pt(nodes[b].x + nx, nodes[b].y + ny), {
        layer: "emphasis",
        weight: "emphasis",
        trim: c.stroke * 1.4,
      }),
    );
  }

  // Open reaction sites: up to two free valences marked, deliberately unfilled.
  const free: number[] = [];
  for (let i = 0; i < nodes.length; i++) if (degree[i] < VALENCE_MAX) free.push(i);
  const sites = shuffled(rand, free).slice(0, 2);
  for (let s = 0; s < sites.length; s++) {
    const from = sites[s];
    const used: number[] = [];
    for (let e = 0; e < edges.length; e++) {
      if (edges[e][0] === from) used.push(Math.round(((Math.atan2(nodes[edges[e][1]].y - nodes[from].y, nodes[edges[e][1]].x - nodes[from].x) * 180) / Math.PI + 360) % 360));
      if (edges[e][1] === from) used.push(Math.round(((Math.atan2(nodes[from].y - nodes[edges[e][0]].y, nodes[from].x - nodes[edges[e][0]].x) * 180) / Math.PI + 360) % 360));
    }
    const open = BOND_ANGLES.filter((a) => !used.includes(a));
    if (!open.length) continue;
    const ang = pick(rand, open);
    out.push(
      LINE(nodes[from], step(nodes[from], ang, bond * 0.34), { layer: "quiet", weight: "hairline", trim: c.stroke * 1.6 }),
    );
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
   4 · LIVING — Biology. Branching growth at DECREASING SCALE, soft membrane
   curves, no sharp corners, asymmetry preferred.
   ════════════════════════════════════════════════════════════════════════ */

const MAX_BRANCH_DEPTH = 3;
const GROWTH_SCALE = 0.62;

function living(c: RuleContext): MotifElement[] {
  const { box, rand } = c;
  const out: MotifElement[] = [];
  const branchBudget = Math.max(4, c.count(10));
  const root = pt(box.w * (0.42 + between(rand, -0.08, 0.08)), box.h * 0.9);
  const trunkLen = c.clamp(box.h * 0.4);

  interface Task {
    from: Vec;
    angle: number;
    len: number;
    depth: number;
  }
  const tasks: Task[] = [{ from: root, angle: -90 + between(rand, -6, 6), len: trunkLen, depth: 0 }];
  const tips: Vec[] = [];
  let made = 0;

  while (tasks.length && made < branchBudget) {
    const t = tasks.shift() as Task;
    const end = step(t.from, t.angle, t.len);
    // Soft membrane curve: a lateral control point, so there are no corners.
    const mid = step(t.from, t.angle, t.len * 0.55);
    const sway = t.len * 0.22 * sign(rand);
    const ctrl = pt(mid.x + Math.cos(((t.angle + 90) * Math.PI) / 180) * sway, mid.y + Math.sin(((t.angle + 90) * Math.PI) / 180) * sway);
    out.push(
      CURVE([t.from, ctrl, end], {
        layer: t.depth === 0 ? "mid" : t.depth === 1 ? "base" : "quiet",
        weight: t.depth === 0 ? "line" : "hairline",
        tension: 0.5,
      }),
    );
    made++;
    tips.push(end);

    if (t.depth >= MAX_BRANCH_DEPTH || made >= branchBudget) continue;
    // Asymmetric bifurcation: the two children are never equal.
    const left = t.angle - (20 + rand() * 14);
    const right = t.angle + (26 + rand() * 18);
    tasks.push({ from: end, angle: left, len: t.len * GROWTH_SCALE, depth: t.depth + 1 });
    tasks.push({ from: end, angle: right, len: t.len * GROWTH_SCALE * between(rand, 0.8, 1), depth: t.depth + 1 });
  }

  // Membranes — two open enclosing curves, never closed polygons.
  const membranes = Math.max(1, Math.round(c.count(2)));
  for (let m = 0; m < membranes; m++) {
    const inset = box.h * (0.1 + m * 0.12);
    const arc: Vec[] = [
      pt(box.w * 0.16, box.h - inset * 0.4),
      pt(box.w * 0.3, inset * 1.5),
      pt(box.w * 0.62, inset * 1.1),
      pt(box.w * 0.86, box.h - inset * 0.5),
    ];
    out.push(CURVE(arc, { layer: "quiet", weight: "hairline", tension: 0.55 }));
  }

  // Emphasis: ONE growth tip — the living edge.
  if (tips.length) {
    out.push(NODE(tips[tips.length - 1], { layer: "emphasis", weight: "emphasis", r: 2.5 }));
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
   5 · TYPOGRAPHIC — English. The page itself: baseline bands from the 2.2
   type proportions, vertical measures, a small number of rules, word-space
   rhythm. No glyphs — the STRUCTURE of reading, not letters.
   ════════════════════════════════════════════════════════════════════════ */

/* 2.2 proportions, expressed as ratios so they hold at any box size:
   body leading 1.6, UI leading 1.4, display leading 1.04, measure 68ch.     */
const BASELINE_RATIO = 1.6;
const MEASURE_RATIO = 0.62;

function typographic(c: RuleContext): MotifElement[] {
  const { box, rand } = c;
  const out: MotifElement[] = [];
  const margin = box.w * 0.14;
  const measure = box.w * MEASURE_RATIO;
  const baseline = (box.h * 0.86) / (c.count(11) * BASELINE_RATIO);
  const rules = Math.min(7, Math.max(3, c.count(6)));

  // Baseline rules — the reading rhythm.
  for (let r = 0; r < rules; r++) {
    const y = box.h * 0.86 - r * baseline * BASELINE_RATIO;
    if (y < box.h * 0.08) break;
    out.push(LINE(pt(margin, y), pt(margin + measure, y), { layer: "quiet", weight: "hairline" }));
  }

  // Word-space rhythm: variable word lengths, CONSTANT word space.
  const wordSpace = baseline * 0.55;
  const rows = Math.max(2, c.count(3));
  const words = Math.max(4, c.count(9));
  for (let r = 0; r < rows; r++) {
    const y = box.h * (0.3 + r * 0.14) + between(rand, -1, 1) * baseline * 0.2;
    let x = margin;
    for (let w = 0; w < words; w++) {
      const len = c.clamp(baseline * between(rand, 0.9, 2.6));
      if (x + len > margin + measure) break;
      out.push(LINE(pt(x, y), pt(x + len, y), { layer: "base", weight: "hairline" }));
      x += len + wordSpace;
    }
  }

  // Vertical measures — small ticks at the end of the measure.
  const ticks = Math.max(2, c.count(4));
  for (let t = 0; t < ticks; t++) {
    const y = box.h * (0.2 + (t * 0.6) / Math.max(1, ticks - 1));
    out.push(LINE(pt(margin + measure, y), pt(margin + measure + baseline * 0.5, y), { layer: "quiet", weight: "hairline" }));
  }

  // Emphasis: ONE margin rule. The accent marks the margin, never the text.
  out.push(LINE(pt(margin, box.h * 0.14), pt(margin, box.h * 0.86), { layer: "emphasis", weight: "emphasis" }));
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
   6 · STRATA — History. Stacked bands of varying thickness with DELIBERATE
   DISCONTINUITIES, plus occasional vertical core samples. Time reads top to
   bottom; the record has gaps.
   ════════════════════════════════════════════════════════════════════════ */

function strata(c: RuleContext): MotifElement[] {
  const { box, rand } = c;
  const out: MotifElement[] = [];
  const pad = box.h * 0.1;
  const bands = Math.max(3, c.count(7));
  const usable = box.h - pad * 2;

  // Varying thickness, normalised so the stack always fills the box.
  const weights: number[] = [];
  let total = 0;
  for (let i = 0; i < bands; i++) {
    const w = between(rand, 0.55, 2.1);
    weights.push(w);
    total += w;
  }

  let y = pad;
  let emphasised = intBetween(rand, 0, bands - 1);
  if (emphasised < 0) emphasised = 0;

  for (let b = 0; b < bands; b++) {
    const thickness = Math.max(2, (usable * weights[b]) / total);
    const mid = y + thickness / 2;
    // Deliberate discontinuity: every band breaks at least once.
    const segments = intBetween(rand, 2, 4);
    let x = box.w * 0.06;
    const span = box.w * 0.88;
    for (let s = 0; s < segments; s++) {
      const segLen = (span / segments) * between(rand, 0.55, 0.92);
      if (x + segLen * 0.4 > box.w * 0.94) break;
      out.push(
        BAND(pt(x, mid), pt(x + segLen, mid), thickness, intBetween(rand, 0, 2), {
          layer: b === emphasised ? "mid" : "quiet",
          weight: "hairline",
        }),
      );
      x += segLen + span * between(rand, 0.03, 0.1);
    }
    // The index stratum: one emphasised edge. Exactly one per surface.
    if (b === emphasised) {
      out.push(LINE(pt(box.w * 0.06, y), pt(box.w * 0.62, y), { layer: "emphasis", weight: "emphasis" }));
    }
    y += thickness;
  }

  // Core samples — vertical probes crossing the stack.
  const cores = Math.max(1, c.count(2));
  for (let k = 0; k < cores; k++) {
    const x = box.w * (0.24 + (k * 0.4) / Math.max(1, cores - 1) + between(rand, -0.04, 0.04));
    out.push(LINE(pt(x, pad * 0.6), pt(x, box.h - pad * 0.6), { layer: "base", weight: "hairline" }));
    out.push(NODE(pt(x, pad + (usable * weights.slice(0, emphasised).reduce((a, v) => a + v, 0)) / total), { layer: "mid", weight: "line", r: 1.6 }));
  }
  return out;
}

/* ── the closed registry: motif kind -> rule set ────────────────────────── */

const RULE_SETS: Record<MotifKind, (c: RuleContext) => MotifElement[]> = {
  lattice,
  field,
  bonds,
  living,
  typographic,
  strata,
};

/* ── declared rules, as data (specimen + docs read this, never prose alone) ─ */

export interface MotifRuleSpec {
  idea: string;
  angles: string;
  emphasis: string;
  emphasisRarity: string;
  featureSize: string;
  never: string[];
  densityScaling: string;
}

export const MOTIF_RULES: Record<MotifKind, MotifRuleSpec> = {
  lattice: {
    idea: "A rational grid with one path threading it — structure discovered, not imposed.",
    angles: "0 / 90 only. No other angle exists in this motif.",
    emphasis: "ONE polyline walk through the lattice, ending on a node.",
    emphasisRarity: "Exactly 1 per surface.",
    featureSize: `${MIN_FEATURE}–${MAX_FEATURE} of the box minor axis (cell size sets it).`,
    never: ["curves", "filled cells", "a second emphasised path", "angles outside 0/90", "a node on every intersection"],
    densityScaling: "Columns/rows and subdivision count scale; grid weight never changes.",
  },
  field: {
    idea: "Streamlines sharing one directional tendency — force changes a path.",
    angles: "No fixed angle set; curvature is shallow (tension 0.45) and every line shares one displacement function.",
    emphasis: "ONE streamline that resists the field and leaves straight, plus the origin node.",
    emphasisRarity: "Exactly 1 emphasised line per surface.",
    featureSize: `${MIN_FEATURE}–${MAX_FEATURE} of the box minor axis (line spacing).`,
    never: ["crossing lines", "radial bursts", "arrowheads", "closed loops", "orthogonal grids"],
    densityScaling: "Streamline count scales; bend strength and spacing character stay fixed.",
  },
  bonds: {
    idea: "Nodes under valence limits with open reaction sites — a vessel before reaction.",
    angles: "60-degree set only: 0 / 60 / 120 / 180 / 240 / 300, snapped.",
    emphasis: "ONE double bond (a parallel pair).",
    emphasisRarity: "Exactly 1 per surface.",
    featureSize: `${MIN_FEATURE}–${MAX_FEATURE} of the box minor axis (bond length).`,
    never: ["5-fold coordination", "curved bonds", "filled atoms", "letters or labels", "angles off the 60-degree set"],
    densityScaling: "Node count scales; valence ceiling (4) and bond angles never change.",
  },
  living: {
    idea: "Branching growth at decreasing scale — one origin, many lives.",
    angles: "No straight segments at all; every branch is a shallow curve, bifurcation 20-44 degrees and deliberately unequal.",
    emphasis: "ONE growth tip node — the living edge.",
    emphasisRarity: "Exactly 1 per surface.",
    featureSize: `${MIN_FEATURE}–${MAX_FEATURE} of the box minor axis (branch length, x0.62 per level).`,
    never: ["straight lines", "right angles", "symmetric trees", "more than 3 branch levels", "closed polygons"],
    densityScaling: "Branch budget scales; the 0.62 scale factor and 3-level depth never change.",
  },
  typographic: {
    idea: "The page itself — baseline bands, a measure, word-space rhythm. Reading first.",
    angles: "0 / 90 only. Everything is a rule or a tick.",
    emphasis: "ONE vertical margin rule — the accent marks the margin, never the text.",
    emphasisRarity: "Exactly 1 per surface.",
    featureSize: `${MIN_FEATURE}–${MAX_FEATURE} of the box minor axis (baseline step from the 2.2 leading ratio 1.6).`,
    never: ["glyphs or letterforms", "curves", "diagonals", "frames or boxes", "more than 7 rules"],
    densityScaling: "Rule count and word rows scale; baseline rhythm and measure width never change.",
  },
  strata: {
    idea: "Stacked bands with deliberate discontinuities — an archive with missing years.",
    angles: "0 / 90 only; bands are horizontal, core samples vertical.",
    emphasis: "ONE stratum edge (the index stratum).",
    emphasisRarity: "Exactly 1 per surface.",
    featureSize: `${MIN_FEATURE}–${MAX_FEATURE} of the box minor axis (band thickness).`,
    never: ["a band continuous across the full width", "curves", "grids", "diagonals", "axis marks"],
    densityScaling: "Band count scales; every band keeps at least one break.",
  },
};

/** Parameters Step 3.5 will modulate. Declared now, applied later. */
export const MOTION_HOOKS: Record<MotifKind, { motionChar: string; hooks: string[]; note: string }> = {
  lattice: {
    motionChar: "precise",
    hooks: ["polyline.reveal", "node.pulse"],
    note: "The emphasised walk draws itself segment by segment; nodes confirm on arrival. No drift.",
  },
  field: {
    motionChar: "energetic",
    hooks: ["curve.phase", "field.strength", "node.pulse"],
    note: "Phase travels along the streamlines; strength breathes within its declared range.",
  },
  bonds: {
    motionChar: "reactive",
    hooks: ["line.reveal", "node.pulse"],
    note: "Bonds form in sequence; an open site pulses until something fills it.",
  },
  living: {
    motionChar: "growing",
    hooks: ["curve.reveal", "curve.curvature", "node.pulse"],
    note: "Growth reveals outward by depth level; curvature eases as branches extend.",
  },
  typographic: {
    motionChar: "editorial",
    hooks: ["line.reveal", "band.offset"],
    note: "Rules settle top to bottom; word rows offset by one word-space. Nothing bounces.",
  },
  strata: {
    motionChar: "sequential",
    hooks: ["band.offset", "band.reveal", "node.pulse"],
    note: "Strata land in reading order (top to bottom); core samples drop last.",
  },
};

/* ── caps: enforced here, not by convention ─────────────────────────────── */

const LAYER_COST = { quiet: 0, base: 1, mid: 2, emphasis: 3 } as const;

function enforceCaps(elements: MotifElement[], stroke: number): MotifElement[] {
  let out = elements;
  const commands = (list: MotifElement[]) => {
    let total = 0;
    for (const e of list) total += renderElement(e, stroke).commands;
    return total;
  };
  if (commands(out) <= MAX_COMMANDS) return out;
  // Drop the quietest features first; the emphasis moment always survives.
  const order = out
    .map((e, i) => ({ e, i, cost: LAYER_COST[e.layer] }))
    .sort((a, b) => a.cost - b.cost || a.i - b.i);
  const drop = new Set<number>();
  let total = commands(out);
  for (let k = 0; k < order.length && total > MAX_COMMANDS; k++) {
    if (order[k].cost >= 3) break; // never drop emphasis
    drop.add(order[k].i);
    total -= renderElement(order[k].e, stroke).commands;
  }
  out = out.filter((_, i) => !drop.has(i));
  return out;
}

/* ── the one entry point ────────────────────────────────────────────────── */

export interface GenerateOptions {
  subject: string;
  kind: MotifKind;
  role: MotifRole;
  density: Density;
  /** What the motif is doing here — part of the seed, so placements differ. */
  purpose?: string;
  /** Composition index — part of the seed. */
  index?: number;
}

/**
 * PURE + SYNCHRONOUS. No layout reads, no clock, no randomness.
 * Same arguments in, byte-identical `MotifData` out — on the server, on the
 * client, in any order.
 */
export function generateMotif(o: GenerateOptions): import("./types").MotifData {
  const box = ROLE_BOX[o.role];
  const purpose = o.purpose ?? o.role;
  const index = o.index ?? 0;
  const seed = makeSeed(o.subject, purpose, index);
  const rand = streamFromSeed(seed);
  const c = makeContext(rand, box, o.density, o.role);
  const elements = enforceCaps(RULE_SETS[o.kind](c), c.stroke);
  return {
    kind: o.kind,
    subject: o.subject,
    role: o.role,
    seed,
    hash: fingerprint(`${o.kind}|${o.role}|${o.density}|${serialiseGeometry(elements)}`),
    box,
    stroke: c.stroke,
    elements,
    features: elements.length,
  };
}
