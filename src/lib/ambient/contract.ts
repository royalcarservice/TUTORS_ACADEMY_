/* ════════════════════════════════════════════════════════════════════════
   AMBIENT LAYER — RENDERER CONTRACT (Phase 3 · Step 5)

   3D IS A LENS, NOT A SCENE. The ambient layer is a SECOND RENDERER of the
   3.3 grammar: it consumes the SAME deterministic data (same seed, same
   primitives, same budgets) and expresses it spatially. It INVENTS NO CONTENT:
   if a vertex cannot be derived from `MotifData`, it does not exist here.

   THE BOUNDARY IS DATA, NOT SHARED CODE:
     · the grammar (3.3) emits `MotifData` (points + params, no markup);
     · `toSpatial()` is a PURE function mapping that data to 3D segments;
     · the WebGL renderer (webgl-lattice.ts) only draws those segments.
   The renderer NEVER re-implements motif logic and NEVER imports a subject
   config (3.1 guard applies) — accents arrive as resolved RGB passed in.

   DETERMINISM CARRIES OVER: the spatial interpretation of a seed is identical
   on every load. No randomness anywhere, including shaders.

   ONE RENDERER, SIX CHARACTERS: `MOTION_CHAR_PARAMS` maps each 3.1 motionChar
   to movement PARAMETERS (speed, drift, parallax). Character is data, not a
   different code path. Only Mathematics is BUILT this step; the map exists so
   the contract is honest about the other five.
   ════════════════════════════════════════════════════════════════════════ */

import type { MotifData, MotifElement } from "@/lib/motif/types";

/** Resolved accent RGB in 0..1 (passed in; never derived from config here). */
export interface AmbientColor {
  r: number;
  g: number;
  b: number;
}

/** Movement character as PARAMETERS (one renderer, six characters). */
export interface MotionCharParams {
  /** seconds per full drift cycle — tens of seconds, never seconds. */
  cycleSeconds: number;
  /** max camera translation in world units (motion-safety cap). */
  maxCameraMove: number;
  /** max parallax magnitude in world units (motion-safety cap). */
  maxParallax: number;
  /** angular wobble — 0 for precise characters. */
  wobble: number;
}

export const MOTION_CHAR_PARAMS: Record<string, MotionCharParams> = {
  precise: { cycleSeconds: 48, maxCameraMove: 0.35, maxParallax: 0.22, wobble: 0 },
  energetic: { cycleSeconds: 30, maxCameraMove: 0.5, maxParallax: 0.3, wobble: 0.05 },
  reactive: { cycleSeconds: 36, maxCameraMove: 0.42, maxParallax: 0.26, wobble: 0.03 },
  growing: { cycleSeconds: 40, maxCameraMove: 0.4, maxParallax: 0.25, wobble: 0.04 },
  editorial: { cycleSeconds: 52, maxCameraMove: 0.3, maxParallax: 0.18, wobble: 0 },
  sequential: { cycleSeconds: 46, maxCameraMove: 0.34, maxParallax: 0.2, wobble: 0 },
};

/** Layer → depth. Deeper = quieter; the emphasised path sits nearest. */
const LAYER_Z: Record<string, number> = { quiet: -1.6, base: -0.9, mid: -0.2, emphasis: 0.6 };

/** What the renderer receives per mount. Pure data. */
export interface AmbientInput {
  /** interleaved xyz line segments for the structural field (quiet..mid). */
  field: Float32Array;
  /** interleaved xyz line segments for the ONE emphasised path. */
  emphasis: Float32Array;
  fieldVertices: number;
  emphasisVertices: number;
  /** motion-safety numbers actually used (reported). */
  maxCameraMove: number;
  maxParallax: number;
  hash: string;
}

/** Deterministic spatial interpretation of grammar output. No randomness. */
export function toSpatial(data: MotifData, char: MotionCharParams): AmbientInput {
  const field: number[] = [];
  const emphasis: number[] = [];
  const W = data.box.w;
  const H = data.box.h;
  // map box -> world: X in [-a,a], Y in [-1,1], Z from layer depth.
  const aspect = W / H;
  const sx = (x: number) => (x / W - 0.5) * 2 * aspect * 0.6;
  const sy = (y: number) => -(y / H - 0.5) * 2 * 0.6;

  const pushSeg = (out: number[], el: MotifElement) => {
    const z = LAYER_Z[el.layer] ?? -0.9;
    for (let i = 1; i < el.points.length; i++) {
      out.push(sx(el.points[i - 1].x), sy(el.points[i - 1].y), z);
      out.push(sx(el.points[i].x), sy(el.points[i].y), z);
    }
  };

  for (const el of data.elements) {
    if (el.primitive === "node") {
      // a node becomes a tiny cross tick at its depth — derived, not invented.
      const c = el.points[0];
      const z = LAYER_Z[el.layer] ?? -0.2;
      const r = 0.02;
      field.push(sx(c.x) - r, sy(c.y), z, sx(c.x) + r, sy(c.y), z);
      field.push(sx(c.x), sy(c.y) - r, z, sx(c.x), sy(c.y) + r, z);
      continue;
    }
    if (el.weight === "emphasis") pushSeg(emphasis, el);
    else pushSeg(field, el);
  }

  return {
    field: new Float32Array(field),
    emphasis: new Float32Array(emphasis),
    fieldVertices: field.length / 3,
    emphasisVertices: emphasis.length / 3,
    maxCameraMove: char.maxCameraMove,
    maxParallax: char.maxParallax,
    hash: data.hash,
  };
}
