/* ════════════════════════════════════════════════════════════════════════
   RENDERER-AGNOSTIC PATH LAYER (Phase 3 · Step 3)

   Turns primitive DATA into SVG `d` strings, counts commands, and groups by
   layer so the SVG renderer emits a FEW <path> elements with many subpaths
   instead of hundreds of <line> nodes.

   This module is the ONLY place that knows about SVG. A future WebGL renderer
   would skip it entirely and consume `MotifElement.points` / `.params`
   directly — which is why geometry never leaks into markup upstream.

   SOFTNESS WITHOUT EXPENSIVE EFFECTS: there are no filters, blurs, drop
   shadows or blend modes anywhere in the motif system. Softness is achieved
   with (a) opacity LAYERING — quiet/base/mid/emphasis at fractions of one
   role ceiling — and (b) linear-gradient MASKS for edge fade and content
   exclusion. Both are cheap, both stay vector, both stay theme-aware.
   ════════════════════════════════════════════════════════════════════════ */

import { WEIGHT_SCALE } from "./primitives";
import type { MotifElement, MotifLayer, Vec } from "./types";

/** Stable 2-decimal formatting: identical strings on every platform. */
const n = (v: number) => {
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
};

const seg = (p: Vec) => `L${n(p.x)} ${n(p.y)}`;

/** Catmull-Rom control polygon -> cubic Bezier commands (shallow arcs). */
function catmullRom(points: Vec[], tension: number): string {
  if (points.length < 2) return "";
  const get = (i: number) => points[Math.max(0, Math.min(points.length - 1, i))];
  let d = `M${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1 = { x: p1.x + ((p2.x - p0.x) * tension) / 3, y: p1.y + ((p2.y - p0.y) * tension) / 3 };
    const c2 = { x: p2.x - ((p3.x - p1.x) * tension) / 3, y: p2.y - ((p3.y - p1.y) * tension) / 3 };
    d += ` C${n(c1.x)} ${n(c1.y)} ${n(c2.x)} ${n(c2.y)} ${n(p2.x)} ${n(p2.y)}`;
  }
  return d;
}

export interface RenderedElement {
  d: string;
  commands: number;
  /** Nodes and bands paint; everything else strokes. */
  paint: "stroke" | "fill";
  strokeWidth: number;
}

/** One element -> one path fragment. Pure. */
export function renderElement(el: MotifElement, stroke: number): RenderedElement {
  const w = stroke * WEIGHT_SCALE[el.weight];
  const pts = el.points;

  if (el.primitive === "node") {
    const r = Math.max(0.5, (el.params.r ?? 1.5) * stroke);
    const c = pts[0];
    return {
      d: `M${n(c.x - r)} ${n(c.y)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0Z`,
      commands: 4,
      paint: "fill",
      strokeWidth: w,
    };
  }

  if (el.primitive === "band") {
    const [a, b] = pts;
    const t = Math.max(1, el.params.thickness ?? 4);
    const vertical = el.params.axis === 1;
    const half = t / 2;
    const p0 = vertical ? { x: a.x - half, y: a.y } : { x: a.x, y: a.y - half };
    const p1 = vertical ? { x: b.x - half, y: b.y } : { x: b.x, y: b.y - half };
    const p2 = vertical ? { x: b.x + half, y: b.y } : { x: b.x, y: b.y + half };
    const p3 = vertical ? { x: a.x + half, y: a.y } : { x: a.x, y: a.y + half };
    let d = `M${n(p0.x)} ${n(p0.y)}${seg(p1)}${seg(p2)}${seg(p3)}Z`;
    let commands = 5;
    const sub = Math.max(0, Math.round(el.params.subdivisions ?? 0));
    for (let i = 1; i <= sub; i++) {
      const f = i / (sub + 1);
      const s = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      d += vertical
        ? `M${n(s.x - half)} ${n(s.y)}${seg({ x: s.x + half, y: s.y })}`
        : `M${n(s.x)} ${n(s.y - half)}${seg({ x: s.x, y: s.y + half })}`;
      commands += 2;
    }
    return { d, commands, paint: "fill", strokeWidth: w };
  }

  if (el.primitive === "curve") {
    const tension = el.params.tension ?? 0.5;
    const d = catmullRom(pts, tension) + (el.closed ? "Z" : "");
    return { d, commands: 1 + (pts.length - 1) + (el.closed ? 1 : 0), paint: "stroke", strokeWidth: w };
  }

  // line + polyline
  if (pts.length < 2) return { d: "", commands: 0, paint: "stroke", strokeWidth: w };
  let d = `M${n(pts[0].x)} ${n(pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) d += seg(pts[i]);
  if (el.closed) d += "Z";
  return { d, commands: 1 + (pts.length - 1) + (el.closed ? 1 : 0), paint: "stroke", strokeWidth: w };
}

/**
 * One renderable fragment = one <path>. Keyed by layer x width x paint so each
 * fragment carries exactly one stroke-width and one colour token.
 */
export interface PathFragment {
  layer: MotifLayer;
  width: number;
  paint: "stroke" | "fill";
  d: string;
  commands: number;
  subpaths: number;
}

export interface GroupedGeometry {
  fragments: PathFragment[];
  commands: number;
  /** SVG child elements the renderer emits (fragments + defs + mask). */
  domNodes: number;
}

/**
 * Group elements into the FEWEST possible <path> nodes — one per
 * layer x width x paint, each carrying many subpaths. This is why a dense
 * motif costs single-digit DOM nodes instead of hundreds of <line> elements.
 */
export function groupElements(elements: MotifElement[], stroke: number): GroupedGeometry {
  const order: MotifLayer[] = ["quiet", "base", "mid", "emphasis"];
  const buckets: PathFragment[] = [];
  let commands = 0;

  for (let li = 0; li < order.length; li++) {
    const layer = order[li];
    for (const e of elements) {
      if (e.layer !== layer) continue;
      const r = renderElement(e, stroke);
      if (!r.d) continue;
      const width = Math.round(r.strokeWidth * 100) / 100;
      commands += r.commands;
      let frag: PathFragment | undefined;
      for (const b of buckets) {
        if (b.layer === layer && b.paint === r.paint && b.width === width) {
          frag = b;
          break;
        }
      }
      if (!frag) {
        frag = { layer, width, paint: r.paint, d: "", commands: 0, subpaths: 0 };
        buckets.push(frag);
      }
      frag.d += r.d;
      frag.commands += r.commands;
      frag.subpaths += 1;
    }
  }

  // Stable ordering (layer, then paint, then width) — no unordered iteration.
  const rank = (f: PathFragment) => order.indexOf(f.layer) * 1000 + (f.paint === "stroke" ? 0 : 500) + Math.round(f.width * 10);
  buckets.sort((a, b) => rank(a) - rank(b));
  return { fragments: buckets, commands, domNodes: buckets.length };
}

/** Serialise geometry only — the input to the determinism fingerprint. */
export function serialiseGeometry(elements: MotifElement[]): string {
  let out = "";
  for (const e of elements) {
    out += `${e.primitive}|${e.layer}|${e.weight}|`;
    for (const p of e.points) out += `${n(p.x)},${n(p.y)};`;
    const keys = Object.keys(e.params).sort(); // sorted: never unordered
    for (const k of keys) out += `${k}=${e.params[k]},`;
    out += "\n";
  }
  return out;
}
