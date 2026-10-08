import * as THREE from "three";
import { sampleTrack, type TrackStop } from "../lib/math";

/* ════════════════════════════════════════════════════════════════════════
   SCROLL CHOREOGRAPHY FOR THE SCULPTURE

   A single monotonic `phase` (0 → 4) is sampled from the scrubbed document
   progress. Because phase is a real number, the sculpture interpolates
   between two adjacent states at all times — the scroll literally drives
   rotation, position and transformation rather than firing entrance fades.

     phase 0  ASSEMBLED  hero, interlocking frames
     phase 1  OPEN       six distinct elements, camera has moved in
     phase 2  MOTIF      six subject motifs
     phase 3  UNIFIED    elements reconnect into one structure
     phase 4  EMBLEM     compact academy emblem
   ════════════════════════════════════════════════════════════════════════ */

const PHASE: TrackStop[] = [
  { t: 0.0, v: 0 },
  { t: 0.07, v: 0 }, // hero holds the assembled form
  { t: 0.22, v: 1 }, // opens as the camera closes in
  { t: 0.3, v: 1 },
  { t: 0.44, v: 2 }, // subject showcase
  { t: 0.6, v: 2 },
  { t: 0.72, v: 3 }, // learning experience
  { t: 0.88, v: 3 },
  { t: 0.98, v: 4 }, // final call to action
  { t: 1.0, v: 4 },
];

const CAM_Z: TrackStop[] = [
  { t: 0, v: 7.9 },
  { t: 0.1, v: 7.1 },
  { t: 0.22, v: 5.7 },
  { t: 0.34, v: 6.5 },
  { t: 0.46, v: 6.8 },
  { t: 0.6, v: 7.0 },
  { t: 0.75, v: 7.3 },
  { t: 0.9, v: 6.7 },
  { t: 1, v: 6.1 },
];

const ROT_Y: TrackStop[] = [
  { t: 0, v: -0.3 },
  { t: 0.22, v: 0.35 },
  { t: 0.46, v: 0.95 },
  { t: 0.72, v: 1.55 },
  { t: 0.88, v: 1.15 },
  { t: 1, v: 0.05 }, // the emblem faces the visitor square-on
];

const ROT_X: TrackStop[] = [
  { t: 0, v: 0.2 },
  { t: 0.22, v: 0.06 },
  { t: 0.46, v: -0.05 },
  { t: 0.72, v: 0.14 },
  { t: 1, v: 0.0 },
];

/** Hero offset in world units: the sculpture sits clear of the copy. */
const RIG_X: TrackStop[] = [
  { t: 0, v: 2 },
  { t: 0.09, v: 1.2 },
  { t: 0.2, v: 0 },
  { t: 1, v: 0 },
];

/** The assembled armature is drawn slightly smaller so its widest ring never
 *  reaches the copy column, then settles to full size once it opens. */
const RIG_SCALE: TrackStop[] = [
  { t: 0, v: 0.8 },
  { t: 0.1, v: 0.86 },
  { t: 0.2, v: 1 },
  { t: 1, v: 1 },
];

const RIG_Y: TrackStop[] = [
  { t: 0, v: -0.05 },
  { t: 0.22, v: 0 },
  { t: 0.72, v: 0.1 },
  { t: 1, v: 0 },
];

const SHADOW: TrackStop[] = [
  { t: 0, v: 0.5 },
  { t: 0.2, v: 0.34 },
  { t: 0.5, v: 0.14 },
  { t: 0.8, v: 0.2 },
  { t: 1, v: 0.3 },
];

/** Learning-experience stage modulation of the unified structure. */
const STAGE_RING = [1.08, 0.95, 1.0];
const STAGE_BAR = [0.88, 1.18, 0.84];
const STAGE_NODE = [1.08, 0.98, 0.82];
const STAGE_SPIN = [1.0, 1.35, 0.45];

export interface Rig {
  phase: number;
  w: [number, number, number, number, number];
  /** weight of the OPEN + MOTIF states — how far the elements sit apart */
  openMix: number;
  /** weight of UNIFIED — how strongly the stage scalars apply */
  unifyMix: number;
  camZ: number;
  rotY: number;
  rotX: number;
  rigX: number;
  rigY: number;
  rigScale: number;
  shadow: number;
  /** eased stage index, 0..2 */
  stage: number;
}

const rig: Rig = {
  phase: 0,
  w: [1, 0, 0, 0, 0],
  openMix: 0,
  unifyMix: 0,
  camZ: 7.9,
  rotY: -0.3,
  rotX: 0.2,
  rigX: 2,
  rigY: -0.05,
  rigScale: 0.8,
  shadow: 0.5,
  stage: 0,
};

let cachedProgress = Number.NaN;
let easedStage = 0;

/**
 * Eases the learning-stage index once per frame. Called by the rig alone:
 * `getRig` is read by all seven frame loops, so easing inside it would advance
 * the transition seven times per frame.
 */
export function advanceStage(target: number, dt: number): number {
  easedStage += (target - easedStage) * Math.min(1, dt * 4.5);
  return easedStage;
}

/**
 * Memoised per scroll position, so every component reads one identical rig in
 * a given frame.
 */
export function getRig(progress: number): Rig {
  if (progress !== cachedProgress) {
    const phase = sampleTrack(PHASE, progress);
    const i = Math.min(4, Math.floor(phase));
    const f = phase - i;
    rig.phase = phase;
    for (let k = 0; k < 5; k += 1) rig.w[k] = 0;
    rig.w[i] = 1 - f;
    if (i < 4) rig.w[i + 1] = f;
    rig.openMix = rig.w[1] + rig.w[2];
    rig.unifyMix = rig.w[3];
    rig.camZ = sampleTrack(CAM_Z, progress);
    rig.rotY = sampleTrack(ROT_Y, progress);
    rig.rotX = sampleTrack(ROT_X, progress);
    rig.rigX = sampleTrack(RIG_X, progress);
    rig.rigY = sampleTrack(RIG_Y, progress);
    rig.rigScale = sampleTrack(RIG_SCALE, progress);
    rig.shadow = sampleTrack(SHADOW, progress);
    cachedProgress = progress;
  }

  rig.stage = easedStage;
  return rig;
}

/* ── stage scalars, interpolated across the eased stage index ───────────── */

function stageSample(table: readonly number[], stage: number): number {
  const t = Math.max(0, Math.min(table.length - 1, stage));
  const i = Math.floor(t);
  const j = Math.min(table.length - 1, i + 1);
  const f = t - i;
  return table[i]! + (table[j]! - table[i]!) * f;
}

export const stageRingScale = (s: number) => stageSample(STAGE_RING, s);
export const stageBarScale = (s: number) => stageSample(STAGE_BAR, s);
export const stageNodeScale = (s: number) => stageSample(STAGE_NODE, s);
export const stageSpinScale = (s: number) => stageSample(STAGE_SPIN, s);

/* ── element slot grid ─────────────────────────────────────────────────── */

const slots: THREE.Vector3[] = Array.from({ length: 6 }, () => new THREE.Vector3());
let slotKey = "";

/**
 * Where the six elements sit while open. Derived from the live viewport so
 * the arrangement always fits the frame — 3 × 2 on wide screens, 2 × 3 on
 * narrow ones, which also keeps them clear of the readable columns.
 */
export function getSlots(
  viewW: number,
  viewH: number,
  compact: boolean,
): THREE.Vector3[] {
  const cols = compact ? 2 : 3;
  const rows = compact ? 3 : 2;
  const key = `${cols}:${viewW.toFixed(2)}:${viewH.toFixed(2)}`;
  if (key === slotKey) return slots;
  slotKey = key;

  const spreadX = viewW * (compact ? 0.62 : 0.76);
  const spreadY = viewH * (compact ? 0.66 : 0.7);
  const dx = cols > 1 ? spreadX / (cols - 1) : 0;
  const dy = rows > 1 ? spreadY / (rows - 1) : 0;

  for (let i = 0; i < 6; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    slots[i]!.set(
      (col - (cols - 1) / 2) * dx,
      ((rows - 1) / 2 - row) * dy,
      (i % 2 === 0 ? 1 : -1) * 0.35,
    );
  }
  return slots;
}

/** Screen-space (NDC) point projected to a world position at `depth`. */
export function ndcToWorld(
  ndcX: number,
  ndcY: number,
  depth: number,
  camera: THREE.Camera,
  out: THREE.Vector3,
): THREE.Vector3 {
  out.set(ndcX, ndcY, 0.5).unproject(camera);
  out.sub(camera.position).normalize();
  return out.multiplyScalar(depth).add(camera.position);
}
