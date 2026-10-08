import * as THREE from "three";
import {
  getElementLayout,
  POOLS_COMPACT,
  POOLS_FULL,
  STATE_COUNT,
  STATES,
  type ChildLayout,
  type PoolSizes,
} from "../src/three/layouts";
import {
  advanceStage,
  getRig,
  getSlots,
  stageBarScale,
  stageNodeScale,
  stageRingScale,
} from "../src/three/choreography";
import { clamp, sampleTrack, smoothstep } from "../src/lib/math";

type Check = (name: string, ok: boolean, detail?: string) => void;

export function run(check: Check): void {
  const tiers: Array<["full", PoolSizes] | ["compact", PoolSizes]> = [
    ["full", POOLS_FULL],
    ["compact", POOLS_COMPACT],
  ];

  /* ── 1. every state of every element is well-formed ─────────────────── */
  for (const [tier, P] of tiers) {
    const compact = tier === "compact";
    let meshCount = 0;
    let badQuat = 0;
    let badScale = 0;
    let badOpacity = 0;
    let badNumber = 0;

    for (let e = 0; e < 6; e += 1) {
      for (let s = 0; s < STATE_COUNT; s += 1) {
        const L = getElementLayout(e, s, compact);
        const pools: ReadonlyArray<
          readonly [string, readonly [readonly ChildLayout[], number]]
        > = [
          ["nodes", [L.nodes, P.nodes]],
          ["bars", [L.bars, P.bars]],
          ["rings", [L.rings, P.rings]],
          ["plates", [L.plates, P.plates]],
        ];

        for (const [name, [arr, expected]] of pools) {
          if (arr.length !== expected) {
            badNumber += 1;
            console.log(
              `       ${tier} e${e} s${s} ${name}: ${arr.length} children, expected ${expected}`,
            );
          }
          meshCount += arr.length;
          for (const c of arr) {
            const q = new THREE.Quaternion(c.q[0], c.q[1], c.q[2], c.q[3]);
            if (Math.abs(q.length() - 1) > 1e-4) badQuat += 1;
            if (
              !Number.isFinite(c.s[0]) ||
              !Number.isFinite(c.s[1]) ||
              !Number.isFinite(c.s[2]) ||
              c.s[0] <= 0 ||
              c.s[1] <= 0 ||
              c.s[2] <= 0
            )
              badScale += 1;
            if (c.o < 0 || c.o > 1) badOpacity += 1;
            if (
              !Number.isFinite(c.p[0]) ||
              !Number.isFinite(c.p[1]) ||
              !Number.isFinite(c.p[2])
            )
              badNumber += 1;
          }
        }
        if (!(L.scale > 0)) badScale += 1;
        if (L.accentMix < 0 || L.accentMix > 1) badOpacity += 1;
      }
    }

    check(`${tier}: pool counts match the tier budget`, badNumber === 0);
    check(`${tier}: all quaternions normalised`, badQuat === 0, `${badQuat} bad`);
    check(`${tier}: all scales positive and finite`, badScale === 0, `${badScale} bad`);
    check(`${tier}: opacities within 0..1`, badOpacity === 0, `${badOpacity} bad`);
    console.log(
      `       ${tier} tier: ${meshCount / STATE_COUNT} meshes on screen ` +
        `(${meshCount} layout slots across ${STATE_COUNT} states)`,
    );
  }

  /* ── 2. motifs are distinguishable from each other ──────────────────── */
  const signatures: string[] = [];
  for (let e = 0; e < 6; e += 1) {
    const L = getElementLayout(e, STATES.MOTIF, false);
    const sig = [...L.nodes, ...L.bars, ...L.rings, ...L.plates]
      .map((c) => `${c.p.map((v) => v.toFixed(2)).join(",")}`)
      .join("|");
    signatures.push(sig);
  }
  check(
    "motif state: all six subject motifs are geometrically distinct",
    new Set(signatures).size === 6,
    `${new Set(signatures).size}/6 unique`,
  );

  /* ── 3. the motif state really uses the subject's own pools ─────────── */
  const motif = getElementLayout(4, STATES.MOTIF, false); // English
  check(
    "English motif raises the page planes (others keep them hidden)",
    motif.plates.some((p) => p.o > 0.5),
  );
  const lattice = getElementLayout(0, STATES.MOTIF, false); // Mathematics
  check(
    "Mathematics motif keeps the planes hidden",
    lattice.plates.every((p) => p.o === 0),
  );
  const strata = getElementLayout(5, STATES.MOTIF, false); // History
  check(
    "History motif stacks its frames at different heights",
    new Set(strata.rings.map((r) => r.p[1].toFixed(2))).size === strata.rings.length,
  );

  /* ── 4. memoisation is stable (same object, no drift) ───────────────── */
  check(
    "layouts are memoised (identical reference on re-read)",
    getElementLayout(2, STATES.OPEN, false) === getElementLayout(2, STATES.OPEN, false),
  );

  /* ── 5. the scroll → state blend always sums to 1 ───────────────────── */
  let worst = 0;
  let outOfRange = 0;
  let phaseMonotonic = true;
  let prevPhase = -1;
  for (let i = 0; i <= 1000; i += 1) {
    const p = i / 1000;
    const rig = getRig(p);
    const sum = rig.w.reduce((a, b) => a + b, 0);
    worst = Math.max(worst, Math.abs(sum - 1));
    const nonZero = rig.w.filter((v) => v > 1e-9).length;
    if (nonZero > 2) outOfRange += 1;
    if (rig.phase < prevPhase - 1e-9) phaseMonotonic = false;
    prevPhase = rig.phase;
    if (rig.phase < 0 || rig.phase > 4) outOfRange += 1;
    if (rig.camZ < 3 || rig.camZ > 12) outOfRange += 1;
  }
  check("state weights always sum to 1", worst < 1e-9, `worst drift ${worst}`);
  check("at most two states blend at once", outOfRange === 0, `${outOfRange} bad samples`);
  check("phase advances monotonically with scroll", phaseMonotonic);

  /* ── 6. the five choreographed beats are actually reached ───────────── */
  const at = (p: number) => getRig(p);
  check("hero holds the assembled form (phase 0)", at(0).phase === 0);
  check("scrolling opens the sculpture (phase → 1)", Math.round(at(0.25).phase) === 1);
  check("the showcase reaches the motifs (phase → 2)", Math.round(at(0.5).phase) === 2);
  check("the experience reconnects (phase → 3)", Math.round(at(0.8).phase) === 3);
  check("the closing settles into the emblem (phase → 4)", at(1).phase === 4);
  check("the camera moves in during the hero", at(0.22).camZ < at(0).camZ);
  check("the emblem faces the visitor (rotation unwound)", Math.abs(at(1).rotY) < 0.2);
  check("the hero offsets the rig clear of the copy", at(0).rigX > 1.5);
  check(
    "the hero armature is drawn down so it cannot reach the copy column",
    at(0).rigScale < 1 && at(0.5).rigScale === 1,
    `rigScale ${at(0).rigScale} → ${at(0.5).rigScale}`,
  );

  /* ── 7. element slots fill the frame and stay inside it ─────────────── */
  for (const compact of [false, true]) {
    const slots = getSlots(compact ? 4.2 : 9, compact ? 7 : 5.4, compact);
    const inside = slots.every(
      (s) => Math.abs(s.x) < 5 && Math.abs(s.y) < 4.5 && Number.isFinite(s.z),
    );
    const distinct = new Set(slots.map((s) => `${s.x.toFixed(2)},${s.y.toFixed(2)}`)).size;
    check(`${compact ? "compact" : "wide"}: six distinct slots inside the frame`, inside && distinct === 6, `${distinct}/6 distinct`);
  }

  /* ── 7b. the stage index is eased, not snapped, and converges ──────── */
  let s0 = advanceStage(2, 1 / 60);
  check("stage easing starts from rest and moves towards the target", s0 > 0 && s0 < 2);
  for (let i = 0; i < 240; i += 1) s0 = advanceStage(2, 1 / 60);
  check("stage easing converges on the target", Math.abs(s0 - 2) < 0.01, `${s0}`);
  check("the rig reports the eased stage", Math.abs(getRig(0.8).stage - s0) < 1e-9);

  /* ── 8. stage modulation actually changes the unified structure ─────── */
  check(
    "Practise lengthens the struts vs Explore",
    stageBarScale(1) > stageBarScale(0),
  );
  check(
    "Reflect pulls the beads inward vs Explore",
    stageNodeScale(2) < stageNodeScale(0),
  );
  check(
    "Explore opens the frames vs Practise",
    stageRingScale(0) > stageRingScale(1),
  );
  check(
    "stage scalars interpolate between stops",
    Math.abs(stageBarScale(0.5) - (stageBarScale(0) + stageBarScale(1)) / 2) < 1e-6,
  );

  /* ── 9. track sampler maths ─────────────────────────────────────────── */
  const track = [
    { t: 0, v: 0 },
    { t: 1, v: 10 },
  ];
  check("sampleTrack clamps below the first stop", sampleTrack(track, -1) === 0);
  check("sampleTrack clamps above the last stop", sampleTrack(track, 2) === 10);
  check("sampleTrack is smoothstepped at the midpoint", sampleTrack(track, 0.5) === 5);
  check("smoothstep endpoints", smoothstep(0, 1, 0) === 0 && smoothstep(0, 1, 1) === 1);
  check("clamp bounds", clamp(5, 0, 1) === 1 && clamp(-5, 0, 1) === 0);
}
