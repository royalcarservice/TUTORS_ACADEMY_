/* Small math helpers shared by the 3D rig and the scroll choreography. */

export const clamp = (v: number, lo = 0, hi = 1) =>
  v < lo ? lo : v > hi ? hi : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent smoothing. `lambda` ≈ 1/seconds to settle. */
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6));
  return t * t * (3 - 2 * t);
};

export interface TrackStop {
  t: number;
  v: number;
}

/**
 * Piecewise-linear track sampler with smoothstep easing inside each segment.
 * Stops must be sorted by `t`.
 */
export function sampleTrack(stops: ReadonlyArray<TrackStop>, t: number): number {
  const n = stops.length;
  if (n === 0) return 0;
  if (t <= stops[0]!.t) return stops[0]!.v;
  if (t >= stops[n - 1]!.t) return stops[n - 1]!.v;
  for (let i = 0; i < n - 1; i += 1) {
    const a = stops[i]!;
    const b = stops[i + 1]!;
    if (t >= a.t && t <= b.t) {
      const k = smoothstep(a.t, b.t, t);
      return lerp(a.v, b.v, k);
    }
  }
  return stops[n - 1]!.v;
}

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export function hash01(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
