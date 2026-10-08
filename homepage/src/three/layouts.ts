import * as THREE from "three";
import { hash01 } from "../lib/math";

/* ════════════════════════════════════════════════════════════════════════
   SCULPTURE LAYOUTS

   The sculpture is six elements. Every element carries the same four pools
   of meshes — beads (nodes), struts (bars), frames (rings) and leaves
   (plates) — and each scroll state assigns those meshes a position,
   orientation, scale and opacity.

   Because the pools are fixed, the sculpture *morphs*: the same geometry is
   re-arranged from an interlocking armature into six subject motifs, back
   into one structure, and finally into a compact emblem. Nothing is swapped
   in and out, so the transition is continuous.

   All layouts are pure and precomputed at module load.
   ════════════════════════════════════════════════════════════════════════ */

export const STATES = {
  ASSEMBLED: 0,
  OPEN: 1,
  MOTIF: 2,
  UNIFIED: 3,
  EMBLEM: 4,
} as const;

export const STATE_COUNT = 5;

export interface PoolSizes {
  nodes: number;
  bars: number;
  rings: number;
  plates: number;
}

export const POOLS_FULL: PoolSizes = { nodes: 7, bars: 8, rings: 3, plates: 3 };
export const POOLS_COMPACT: PoolSizes = { nodes: 5, bars: 6, rings: 2, plates: 2 };

export interface ChildLayout {
  p: [number, number, number];
  /** quaternion xyzw */
  q: [number, number, number, number];
  s: [number, number, number];
  /** opacity 0..1 */
  o: number;
}

export interface ElementLayout {
  /** uniform group scale for this state */
  scale: number;
  /** how strongly the subject accent colours this element in this state */
  accentMix: number;
  nodes: ChildLayout[];
  bars: ChildLayout[];
  rings: ChildLayout[];
  plates: ChildLayout[];
}

/* ── quaternion helpers ─────────────────────────────────────────────────── */

const UP_Z = new THREE.Vector3(0, 0, 1);
const UP_Y = new THREE.Vector3(0, 1, 0);
const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();
const tmpE = new THREE.Euler();

/** Quaternion rotating +Z onto `n` (used for torus frames). */
function qFromNormal(n: THREE.Vector3): THREE.Quaternion {
  return tmpQ.setFromUnitVectors(UP_Z, n.clone().normalize()).clone();
}

/** Quaternion rotating +Y onto `d` (used for capsule struts). */
function qFromY(d: THREE.Vector3): THREE.Quaternion {
  return tmpQ.setFromUnitVectors(UP_Y, d.clone().normalize()).clone();
}

function qFromEuler(x: number, y: number, z: number): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(tmpE.set(x, y, z, "XYZ"));
}

const IQ: [number, number, number, number] = [0, 0, 0, 1];

function qArr(q: THREE.Quaternion): [number, number, number, number] {
  return [q.x, q.y, q.z, q.w];
}

function child(
  p: [number, number, number],
  q: THREE.Quaternion | null,
  s: [number, number, number],
  o: number,
): ChildLayout {
  return { p, q: q ? qArr(q) : IQ, s, o };
}

/** A strut of the given length pointing along `dir`, centred on `centre`. */
function strut(
  centre: THREE.Vector3,
  dir: THREE.Vector3,
  length: number,
  thickness: number,
  opacity: number,
): ChildLayout {
  const n = dir.clone().normalize();
  return child(
    [centre.x, centre.y, centre.z],
    qFromY(n),
    [thickness, Math.max(0.02, length), thickness],
    opacity,
  );
}

/* ── element identity ───────────────────────────────────────────────────── */

/** The six frame normals of the assembled armature. */
const NORMALS: THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 1, 0).normalize(),
  new THREE.Vector3(0, 1, 1).normalize(),
  new THREE.Vector3(1, 0, 1).normalize(),
];

/** A stable in-plane axis for fanning each element's frames. */
function perpendicular(n: THREE.Vector3): THREE.Vector3 {
  return tmpV
    .set(Math.abs(n.x) > 0.5 ? 0 : 1, Math.abs(n.y) > 0.5 ? 0 : 1, 0)
    .cross(n)
    .normalize()
    .clone();
}

/* ════════════════════════════════════════════════════════════════════════
   STATE 0 — ASSEMBLED
   Interlocking rounded frames with beads and short struts orbiting them.
   All six elements share the origin, so their frames interlock into one
   armillary structure.
   ════════════════════════════════════════════════════════════════════════ */

function assembled(e: number, P: PoolSizes): ElementLayout {
  const n = NORMALS[e]!;
  const perp = perpendicular(n);
  const rings: ChildLayout[] = [];
  for (let j = 0; j < P.rings; j += 1) {
    const fan = (j - (P.rings - 1) / 2) * 0.16;
    const normal = n.clone().addScaledVector(perp, fan).normalize();
    const radius = 1.3 + j * 0.1;
    const q = qFromNormal(normal);
    rings.push(child([0, 0, 0], q, [radius, radius, radius * 1.1], 0.92));
  }

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    const a = (i / P.nodes) * Math.PI * 2 + e * 0.61;
    const r = 1.6 + hash01(e * 31 + i) * 0.1;
    const pos = n
      .clone()
      .cross(perp)
      .multiplyScalar(Math.cos(a) * r)
      .addScaledVector(perp, Math.sin(a) * r);
    const s = 0.62 + hash01(e * 17 + i * 3) * 0.5;
    nodes.push(child([pos.x, pos.y, pos.z], qFromEuler(a, a * 0.5, 0), [s, s, s], 1));
  }

  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    const a = (i / P.bars) * Math.PI * 2 + e * 0.35 + 0.4;
    const r = 1.76;
    const radial = n
      .clone()
      .cross(perp)
      .multiplyScalar(Math.cos(a))
      .addScaledVector(perp, Math.sin(a))
      .normalize();
    const pos = radial.clone().multiplyScalar(r);
    // Tangential strut: reads as a short orbiting segment.
    const tangent = n.clone().cross(radial).normalize();
    bars.push(strut(pos, tangent, 0.3, 0.7, 0.42));
  }

  return { scale: 1, accentMix: 0, nodes, bars, rings, plates: hidden(P.plates) };
}

/* ════════════════════════════════════════════════════════════════════════
   STATE 1 — OPEN
   Six distinct elements. Each keeps a frame identity — one large ring, one
   perpendicular ring, a small core ring, beads on the rim, radial struts.
   ════════════════════════════════════════════════════════════════════════ */

function opened(e: number, P: PoolSizes): ElementLayout {
  const n = NORMALS[e]!;
  const perp = perpendicular(n);
  const rings: ChildLayout[] = [];
  const radii = [1.0, 0.72, 0.42];
  for (let j = 0; j < P.rings; j += 1) {
    const r = radii[j] ?? 0.4;
    // Middle frame sits perpendicular to the element's normal.
    const normal = j === 1 ? perp.clone() : n.clone();
    rings.push(child([0, 0, 0], qFromNormal(normal), [r, r, r * 1.15], 0.95));
  }

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    const a = (i / P.nodes) * Math.PI * 2 + e;
    const axis = n.clone().cross(perp).normalize();
    const pos = axis
      .multiplyScalar(Math.cos(a))
      .addScaledVector(perp, Math.sin(a))
      .multiplyScalar(1.0);
    const s = 0.8;
    nodes.push(child([pos.x, pos.y, pos.z], qFromEuler(a, 0, a * 0.5), [s, s, s], 1));
  }

  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    const a = (i / P.bars) * Math.PI * 2 + e * 0.5;
    const axis = n.clone().cross(perp).normalize();
    const dir = axis
      .multiplyScalar(Math.cos(a))
      .addScaledVector(perp, Math.sin(a))
      .normalize();
    const pos = dir.clone().multiplyScalar(0.5);
    bars.push(strut(pos, dir, 0.62, 0.85, 0.8));
  }

  return { scale: 0.62, accentMix: 0.3, nodes, bars, rings, plates: hidden(P.plates) };
}

/* ════════════════════════════════════════════════════════════════════════
   STATE 2 — MOTIF
   Six subject motifs. Each is built from the same four pools.
   ════════════════════════════════════════════════════════════════════════ */

/* Mathematics — a structured lattice: cube corners, nodes and edges. */
function motifLattice(P: PoolSizes): ElementLayout {
  const c = 0.66;
  const corners: THREE.Vector3[] = [];
  for (const x of [-c, c])
    for (const y of [-c, c])
      for (const z of [-c, c]) corners.push(new THREE.Vector3(x, y, z));

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    const pos = i < P.nodes - 1 ? corners[i % corners.length]! : new THREE.Vector3(0, 0, 0);
    const s = i === P.nodes - 1 ? 1.15 : 0.85;
    nodes.push(child([pos.x, pos.y, pos.z], qFromEuler(i, i * 0.7, 0), [s, s, s], 1));
  }

  // Edges: bottom face, then the four verticals — reads unambiguously as a
  // lattice even with fewer struts than a full cube.
  const edges: Array<[THREE.Vector3, THREE.Vector3]> = [
    [corners[0]!, corners[1]!],
    [corners[1]!, corners[3]!],
    [corners[3]!, corners[2]!],
    [corners[2]!, corners[0]!],
    [corners[0]!, corners[4]!],
    [corners[1]!, corners[5]!],
    [corners[2]!, corners[6]!],
    [corners[3]!, corners[7]!],
    [corners[4]!, corners[5]!],
    [corners[6]!, corners[7]!],
  ];
  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    const [a, b] = edges[i % edges.length]!;
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);
    bars.push(strut(mid, dir, dir.length(), 0.8, 0.9));
  }

  const rings: ChildLayout[] = [];
  for (let j = 0; j < P.rings; j += 1) {
    const normal =
      j === 0 ? UP_Z.clone() : j === 1 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    rings.push(child([0, 0, 0], qFromNormal(normal), [0.95, 0.95, 0.55], 0.22));
  }

  return { scale: 0.62, accentMix: 1, nodes, bars, rings, plates: hidden(P.plates) };
}

/* Physics — flowing field lines: struts tangent to a swirl, beads marking
   direction, frames as equipotential contours. */
function motifField(P: PoolSizes): ElementLayout {
  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    const u = i / Math.max(1, P.bars - 1); // 0..1 along the flow
    const angle = -1.1 + u * 2.4;
    const radius = 0.35 + Math.sin(u * Math.PI) * 0.75;
    const pos = new THREE.Vector3(
      Math.cos(angle) * radius,
      (u - 0.5) * 1.9,
      Math.sin(angle) * radius * 0.5,
    );
    // Tangent of the curve: derivative of position w.r.t. u.
    const dAngle = 2.4;
    const dRadius = Math.cos(u * Math.PI) * Math.PI * 0.75;
    const dir = new THREE.Vector3(
      -Math.sin(angle) * radius * dAngle + Math.cos(angle) * dRadius,
      1.9,
      Math.cos(angle) * radius * 0.5 * dAngle + Math.sin(angle) * dRadius * 0.5,
    ).normalize();
    bars.push(strut(pos, dir, 0.52, 0.95, 0.92));
  }

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    const u = i / Math.max(1, P.nodes - 1);
    const angle = -1.1 + u * 2.4;
    const radius = 0.35 + Math.sin(u * Math.PI) * 0.75;
    const pos = new THREE.Vector3(
      Math.cos(angle) * radius,
      (u - 0.5) * 1.9,
      Math.sin(angle) * radius * 0.5,
    );
    const s = 0.6 + Math.sin(u * Math.PI) * 0.5;
    nodes.push(child([pos.x, pos.y, pos.z], qFromEuler(angle, u * 3, 0), [s, s, s], 1));
  }

  const rings: ChildLayout[] = [];
  for (let j = 0; j < P.rings; j += 1) {
    const y = (j - (P.rings - 1) / 2) * 0.72;
    const r = 0.9 - Math.abs(y) * 0.28;
    rings.push(child([0, y, 0], qFromNormal(UP_Y.clone()), [r, r, r * 0.7], 0.5));
  }

  return { scale: 0.62, accentMix: 1, nodes, bars, rings, plates: hidden(P.plates) };
}

/* Chemistry — molecular connections: a centre with ligands and bonds. */
function motifBonds(P: PoolSizes): ElementLayout {
  // Six ligand directions (octahedral), so the motif reads at any angle.
  const dirs = [
    new THREE.Vector3(1, 0.35, 0.2),
    new THREE.Vector3(-1, 0.2, -0.3),
    new THREE.Vector3(0.25, 1, -0.2),
    new THREE.Vector3(-0.3, -1, 0.15),
    new THREE.Vector3(0.15, 0.1, 1),
    new THREE.Vector3(-0.1, -0.25, -1),
  ].map((d) => d.normalize());

  const nodes: ChildLayout[] = [];
  nodes.push(child([0, 0, 0], qFromEuler(0.4, 0.2, 0), [1.35, 1.35, 1.35], 1));
  for (let i = 1; i < P.nodes; i += 1) {
    const d = dirs[(i - 1) % dirs.length]!;
    const r = 0.82 + hash01(i * 7) * 0.2;
    const s = 0.72 + hash01(i * 11) * 0.3;
    nodes.push(
      child([d.x * r, d.y * r, d.z * r], qFromEuler(i, i * 0.5, i * 0.2), [s, s, s], 1),
    );
  }

  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    const d = dirs[i % dirs.length]!;
    const r = 0.86 + hash01((i + 3) * 7) * 0.2;
    const end = d.clone().multiplyScalar(r);
    const mid = end.clone().multiplyScalar(0.5);
    // Every few struts bridge two ligands instead of the centre.
    if (i % 4 === 3) {
      const a = dirs[i % dirs.length]!.clone().multiplyScalar(0.9);
      const b = dirs[(i + 1) % dirs.length]!.clone().multiplyScalar(0.9);
      const mid2 = a.clone().add(b).multiplyScalar(0.5);
      const dir2 = b.clone().sub(a);
      bars.push(strut(mid2, dir2, dir2.length() * 0.94, 0.72, 0.85));
    } else {
      bars.push(strut(mid, d, r * 0.96, 0.8, 0.9));
    }
  }

  const rings: ChildLayout[] = [];
  for (let j = 0; j < P.rings; j += 1) {
    const normal = new THREE.Vector3(0.3 + j * 0.4, 1, j * 0.25).normalize();
    const r = 1.12 - j * 0.18;
    rings.push(child([0, 0, 0], qFromNormal(normal), [r, r, r * 0.5], 0.34));
  }

  return { scale: 0.62, accentMix: 1, nodes, bars, rings, plates: hidden(P.plates) };
}

/* Biology — a branching structure: trunk, two orders of branches, tips. */
function motifBranching(P: PoolSizes): ElementLayout {
  const bars: ChildLayout[] = [];
  const tips: THREE.Vector3[] = [];

  const trunkTop = new THREE.Vector3(0, -0.1, 0);
  bars.push(strut(new THREE.Vector3(0, -0.62, 0), UP_Y.clone(), 1.04, 1.25, 1));

  let index = 1;
  const level1 = [-0.55, 0.55];
  for (const dx of level1) {
    if (index >= P.bars) break;
    const dir = new THREE.Vector3(dx, 0.78, 0.08).normalize();
    const start = trunkTop.clone();
    const end = start.clone().addScaledVector(dir, 0.68);
    bars.push(strut(start.clone().add(end).multiplyScalar(0.5), dir, 0.68, 1.0, 0.95));
    tips.push(end.clone());
    index += 1;

    for (const ddx of [-0.5, 0.5]) {
      if (index >= P.bars) break;
      const dir2 = new THREE.Vector3(dx * 0.5 + ddx, 0.7, 0.32).normalize();
      const end2 = end.clone().addScaledVector(dir2, 0.46);
      bars.push(
        strut(end.clone().add(end2).multiplyScalar(0.5), dir2, 0.46, 0.78, 0.9),
      );
      tips.push(end2.clone());
      index += 1;
    }
  }
  while (bars.length < P.bars) {
    const k = bars.length;
    const dir = new THREE.Vector3(Math.sin(k) * 0.6, 0.8, Math.cos(k) * 0.3).normalize();
    const start = new THREE.Vector3(0, -0.1, 0).addScaledVector(dir, 0.2);
    const end = start.clone().addScaledVector(dir, 0.5);
    bars.push(strut(start.clone().add(end).multiplyScalar(0.5), dir, 0.5, 0.7, 0.85));
    tips.push(end.clone());
  }

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    const pos = tips[i % Math.max(1, tips.length)] ?? new THREE.Vector3(0, 0.4, 0);
    const jitter = hash01(i * 13 + 5);
    const p = pos
      .clone()
      .add(new THREE.Vector3(jitter * 0.1 - 0.05, jitter * 0.08, (jitter - 0.5) * 0.12));
    const s = 0.72 + jitter * 0.5;
    nodes.push(child([p.x, p.y, p.z], qFromEuler(i, i * 0.6, 0), [s, s, s], 1));
  }

  const rings: ChildLayout[] = [];
  for (let j = 0; j < P.rings; j += 1) {
    const r = 0.52 + j * 0.4;
    rings.push(
      child(
        [0, -0.95 - j * 0.05, 0],
        qFromNormal(UP_Y.clone()),
        [r, r, r * 0.42],
        0.3 - j * 0.06,
      ),
    );
  }

  return { scale: 0.62, accentMix: 1, nodes, bars, rings, plates: hidden(P.plates) };
}

/* English — layered page-like planes with text rules and a binding arc. */
function motifPages(P: PoolSizes): ElementLayout {
  const plates: ChildLayout[] = [];
  for (let j = 0; j < P.plates; j += 1) {
    const t = P.plates === 1 ? 0 : j / (P.plates - 1);
    const q = qFromEuler(0.1 - t * 0.2, -0.42 + t * 0.34, 0.05 - t * 0.1);
    plates.push(
      child(
        [-0.1 + t * 0.22, 0.02 * (j - 1), -0.24 + t * 0.24],
        q,
        [1.0, 1.0, 1.0],
        j === P.plates - 1 ? 1 : 0.82,
      ),
    );
  }

  // Text rules lying on the front page.
  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    const y = 0.42 - i * 0.13;
    const len = i === 0 ? 0.5 : 0.62 - (i % 3) * 0.1;
    const q = qFromEuler(0.1 - 0.2, -0.42 + 0.34, Math.PI / 2 + 0.05 - 0.1);
    bars.push({
      p: [-0.06 + 0.22, 0.02 * (P.plates - 2) + y, -0.24 + 0.24],
      q: qArr(q),
      s: [0.55, Math.max(0.08, len), 0.55],
      o: 0.75,
    });
  }

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    // A dropped initial and margin marks.
    const pos =
      i === 0
        ? new THREE.Vector3(0.0, 0.4, 0.06)
        : new THREE.Vector3(0.44, 0.28 - i * 0.16, 0.05);
    const s = i === 0 ? 1.15 : 0.6;
    nodes.push(child([pos.x, pos.y, pos.z], qFromEuler(i, 0, 0), [s, s, s], 0.95));
  }

  const rings: ChildLayout[] = [];
  for (let j = 0; j < P.rings; j += 1) {
    const q = qFromEuler(0, Math.PI / 2 - 0.2, 0);
    rings.push(
      child([-0.36 + j * 0.02, -0.05, -0.06 + j * 0.05], q, [1.02, 1.02, 1.02 * 0.6], 0.42),
    );
  }

  return { scale: 0.62, accentMix: 1, nodes, bars, rings, plates };
}

/* History — stacked timeline rings: strata with event markers and a spine. */
function motifStrata(P: PoolSizes): ElementLayout {
  const rings: ChildLayout[] = [];
  const layers = Math.max(2, P.rings);
  for (let j = 0; j < layers; j += 1) {
    const t = layers === 1 ? 0.5 : j / (layers - 1);
    const y = (t - 0.5) * 1.3;
    const r = 1.0 - t * 0.34;
    rings.push(child([0, y, 0], qFromNormal(UP_Y.clone()), [r, r, r * 0.5], 0.95));
  }

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    const t = i / Math.max(1, P.nodes - 1);
    const y = (t - 0.5) * 1.3;
    const r = 1.0 - t * 0.34;
    const a = i * 1.9 + 0.4;
    const s = 0.7 + hash01(i * 19) * 0.5;
    nodes.push(
      child(
        [Math.cos(a) * r, y, Math.sin(a) * r],
        qFromEuler(a, i, 0),
        [s, s, s],
        1,
      ),
    );
  }

  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    if (i < 2) {
      // The vertical spine the strata hang from.
      const x = i === 0 ? 0 : 0;
      const z = i === 0 ? 0 : 0;
      bars.push(strut(new THREE.Vector3(x, 0, z), UP_Y.clone(), 1.7, 0.6, 0.55));
    } else {
      // Short radial ticks on alternating layers.
      const t = ((i - 2) % layers) / Math.max(1, layers - 1);
      const y = (t - 0.5) * 1.3;
      const r = 1.0 - t * 0.34;
      const a = (i - 2) * 1.35 + 1.1;
      const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      bars.push(strut(dir.clone().multiplyScalar(r * 0.72).setY(y), dir, r * 0.5, 0.62, 0.7));
    }
  }

  return { scale: 0.62, accentMix: 1, nodes, bars, rings, plates: hidden(P.plates) };
}

/* ════════════════════════════════════════════════════════════════════════
   STATE 3 — UNIFIED
   The six elements return to the centre and weave back into one structure.
   The learning-experience section modulates this state through the three
   stage scalars (see `applyStageModulation` in the rig).
   ════════════════════════════════════════════════════════════════════════ */

function unified(e: number, P: PoolSizes): ElementLayout {
  const n = NORMALS[e]!;
  const perp = perpendicular(n);
  const rings: ChildLayout[] = [];
  for (let j = 0; j < P.rings; j += 1) {
    const fan = (j - (P.rings - 1) / 2) * 0.08;
    const normal = n.clone().addScaledVector(perp, fan).normalize();
    const r = 1.12 - j * 0.14;
    rings.push(child([0, 0, 0], qFromNormal(normal), [r, r, r * 1.2], 0.9));
  }

  // Chords of the sphere — a woven cage rather than an armature.
  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    const a1 = (i / P.bars) * Math.PI * 2 + e * 0.9;
    const a2 = a1 + 1.5 + hash01(i * 23 + e) * 0.7;
    const p1 = new THREE.Vector3(Math.cos(a1), Math.sin(a1 * 0.8) * 0.7, Math.sin(a1) * 0.9);
    const p2 = new THREE.Vector3(Math.cos(a2), Math.sin(a2 * 0.8) * 0.7, Math.sin(a2) * 0.9);
    p1.normalize().multiplyScalar(0.95);
    p2.normalize().multiplyScalar(0.95);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const dir = p2.clone().sub(p1);
    bars.push(strut(mid, dir, dir.length(), 0.72, 0.72));
  }

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    const a = (i / P.nodes) * Math.PI * 2 + e * 1.3;
    const pos = new THREE.Vector3(
      Math.cos(a) * 0.95,
      Math.sin(a * 1.4) * 0.6,
      Math.sin(a) * 0.95,
    );
    const s = 0.7 + hash01(i * 29 + e) * 0.45;
    nodes.push(child([pos.x, pos.y, pos.z], qFromEuler(a, a * 0.4, 0), [s, s, s], 1));
  }

  return { scale: 1, accentMix: 0.35, nodes, bars, rings, plates: hidden(P.plates) };
}

/* ════════════════════════════════════════════════════════════════════════
   STATE 4 — EMBLEM
   A compact academy seal: concentric coplanar frames, radial ticks, and six
   accent beads — one per subject.
   ════════════════════════════════════════════════════════════════════════ */

function emblem(_e: number, P: PoolSizes): ElementLayout {
  const rings: ChildLayout[] = [];
  const radii = [1.22, 1.04, 0.46];
  for (let j = 0; j < P.rings; j += 1) {
    const r = radii[j] ?? 0.6;
    rings.push(child([0, 0, 0], qFromNormal(UP_Z.clone()), [r, r, r * 1.35], 0.95));
  }

  const nodes: ChildLayout[] = [];
  for (let i = 0; i < P.nodes; i += 1) {
    if (i === P.nodes - 1) {
      nodes.push(child([0, 0, 0], qFromEuler(0.3, 0.5, 0), [1.0, 1.0, 1.0], 1));
      continue;
    }
    const a = (i / Math.max(1, P.nodes - 1)) * Math.PI * 2 - Math.PI / 2;
    const r = 1.13;
    const s = 0.82;
    nodes.push(
      child([Math.cos(a) * r, Math.sin(a) * r, 0], qFromEuler(a, 0, 0), [s, s, s], 1),
    );
  }

  const bars: ChildLayout[] = [];
  for (let i = 0; i < P.bars; i += 1) {
    const a = (i / P.bars) * Math.PI * 2 + Math.PI / P.bars;
    const dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    bars.push(strut(dir.clone().multiplyScalar(0.74), dir, 0.3, 0.62, 0.6));
  }

  return { scale: 0.9, accentMix: 0.65, nodes, bars, rings, plates: hidden(P.plates) };
}

function hidden(count: number): ChildLayout[] {
  return Array.from({ length: count }, () => ({
    p: [0, 0, 0] as [number, number, number],
    q: IQ,
    s: [0.001, 0.001, 0.001] as [number, number, number],
    o: 0,
  }));
}

/* ── motif dispatch ─────────────────────────────────────────────────────── */

const MOTIF_BUILDERS = [
  motifLattice,
  motifField,
  motifBonds,
  motifBranching,
  motifPages,
  motifStrata,
] as const;

/* ── memoised access ────────────────────────────────────────────────────── */

const cache = new Map<string, ElementLayout>();

export function getElementLayout(
  element: number,
  state: number,
  compact: boolean,
): ElementLayout {
  const P = compact ? POOLS_COMPACT : POOLS_FULL;
  const key = `${element}:${state}:${compact ? "c" : "f"}`;
  const hit = cache.get(key);
  if (hit) return hit;

  let layout: ElementLayout;
  switch (state) {
    case STATES.ASSEMBLED:
      layout = assembled(element, P);
      break;
    case STATES.OPEN:
      layout = opened(element, P);
      break;
    case STATES.MOTIF:
      layout = MOTIF_BUILDERS[element]!(P);
      break;
    case STATES.UNIFIED:
      layout = unified(element, P);
      break;
    case STATES.EMBLEM:
      layout = emblem(element, P);
      break;
    default:
      layout = assembled(element, P);
  }
  cache.set(key, layout);
  return layout;
}
