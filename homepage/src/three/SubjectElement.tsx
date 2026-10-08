import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  getElementLayout,
  POOLS_COMPACT,
  POOLS_FULL,
  type ChildLayout,
  type PoolSizes,
} from "./layouts";
import {
  ACCENT_MIX,
  BASE_COLOR,
  BASE_OPACITY,
  createMaterial,
  type PoolName,
  type SharedGeometry,
} from "./assets";
import {
  getRig,
  stageBarScale,
  stageNodeScale,
  stageRingScale,
} from "./choreography";
import { scrollState } from "../lib/scroll";
import { hash01 } from "../lib/math";
import type { Subject } from "../data/subjects";

/* ════════════════════════════════════════════════════════════════════════
   ONE SUBJECT ELEMENT

   Owns its four mesh pools and rewrites every child's transform, opacity and
   colour once per frame by blending the two layouts the scrubbed `phase`
   currently sits between. This is where the scroll position becomes the
   sculpture's shape.
   ════════════════════════════════════════════════════════════════════════ */

const POOL_ORDER: PoolName[] = ["nodes", "bars", "rings", "plates"];

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const scratchQ = new THREE.Quaternion();
const scratchQ2 = new THREE.Quaternion();
const scratchColor = new THREE.Color();
const FALLBACK: ChildLayout = { p: [0, 0, 0], q: [0, 0, 0, 1], s: [0.001, 0.001, 0.001], o: 0 };

export interface SubjectElementProps {
  index: number;
  subject: Subject;
  geometry: SharedGeometry;
  compact: boolean;
}

export function SubjectElement({
  index,
  subject,
  geometry,
  compact,
}: SubjectElementProps) {
  const innerRef = useRef<THREE.Group>(null);
  const pools: PoolSizes = compact ? POOLS_COMPACT : POOLS_FULL;

  const counts = useMemo(
    () => ({
      nodes: pools.nodes,
      bars: pools.bars,
      rings: pools.rings,
      plates: pools.plates,
    }),
    [pools.nodes, pools.bars, pools.rings, pools.plates],
  );

  const meshRefs = useRef<Record<PoolName, Array<THREE.Mesh | null>>>({
    nodes: [],
    bars: [],
    rings: [],
    plates: [],
  });

  const materials = useMemo(() => {
    const out = {} as Record<PoolName, THREE.Material[]>;
    for (const name of POOL_ORDER) {
      out[name] = Array.from({ length: counts[name] }, () => createMaterial(name));
    }
    return out;
  }, [counts]);

  /* Same rule as the geometry above: only free the set that has actually been
     superseded, never the one the mounted tree is drawing with. */
  const prevMaterials = useRef(materials);
  useEffect(() => {
    const previous = prevMaterials.current;
    if (previous === materials) return;
    for (const name of POOL_ORDER) {
      for (const m of previous[name]) m.dispose();
    }
    prevMaterials.current = materials;
  }, [materials]);

  const accent = useMemo(() => new THREE.Color(subject.accent), [subject.accent]);
  const focus = useRef(0);

  useFrame((state, dtRaw) => {
    const group = innerRef.current;
    if (!group) return;
    const dt = Math.min(dtRaw, 1 / 20);
    const t = state.clock.elapsedTime;

    const rig = getRig(scrollState.progress);
    const i = Math.min(4, Math.floor(rig.phase));
    const f = rig.phase - i;
    const A = getElementLayout(index, i, compact);
    const B = getElementLayout(index, Math.min(4, i + 1), compact);

    /* Selection focus: the chosen element steps forward, the rest recede. */
    const target =
      scrollState.focusSubject === index
        ? 1
        : scrollState.focusSubject === -1
          ? 0
          : -1;
    focus.current += (target - focus.current) * Math.min(1, dt * 6);
    const focusSelf = Math.max(0, focus.current);
    const focusOther = Math.max(0, -focus.current);

    const layoutScale = A.scale + (B.scale - A.scale) * f;
    group.scale.setScalar(layoutScale * (1 + focusSelf * 0.34));
    group.position.z = focusSelf * 1.15;
    group.rotation.y = index * 0.35 + Math.sin(t * 0.22 + index) * 0.13;
    group.rotation.x = Math.cos(t * 0.19 + index * 1.7) * 0.08;

    const accentMix = A.accentMix + (B.accentMix - A.accentMix) * f;
    const unifyMix = rig.unifyMix;
    const sRing = 1 + (stageRingScale(rig.stage) - 1) * unifyMix;
    const sBar = 1 + (stageBarScale(rig.stage) - 1) * unifyMix;
    const sNode = 1 + (stageNodeScale(rig.stage) - 1) * unifyMix;
    const dim = 1 - focusOther * 0.5;

    const geoFor: Record<PoolName, THREE.BufferGeometry> = {
      nodes: geometry.node,
      bars: geometry.bar,
      rings: geometry.ring,
      plates: geometry.plate,
    };

    for (const name of POOL_ORDER) {
      const arrA = A[name];
      const arrB = B[name];
      const meshes = meshRefs.current[name];
      const mats = materials[name];
      const poolAccent = accentMix * ACCENT_MIX[name];

      for (let k = 0; k < counts[name]; k += 1) {
        const mesh = meshes[k];
        const mat = mats[k] as THREE.Material & { opacity: number; color: THREE.Color };
        if (!mesh || !mat) continue;
        if (mesh.geometry !== geoFor[name]) mesh.geometry = geoFor[name];

        const a = arrA[k] ?? FALLBACK;
        const b = arrB[k] ?? FALLBACK;

        mesh.position.set(
          a.p[0] + (b.p[0] - a.p[0]) * f,
          a.p[1] + (b.p[1] - a.p[1]) * f,
          a.p[2] + (b.p[2] - a.p[2]) * f,
        );

        let sx = a.s[0] + (b.s[0] - a.s[0]) * f;
        let sy = a.s[1] + (b.s[1] - a.s[1]) * f;
        let sz = a.s[2] + (b.s[2] - a.s[2]) * f;
        if (name === "rings") {
          sx *= sRing;
          sy *= sRing;
        } else if (name === "bars") {
          sy *= sBar;
        } else if (name === "nodes") {
          sx *= sNode;
          sy *= sNode;
          sz *= sNode;
        }

        scratchQ.set(a.q[0], a.q[1], a.q[2], a.q[3]);
        scratchQ2.set(b.q[0], b.q[1], b.q[2], b.q[3]);
        scratchQ.slerp(scratchQ2, f);

        // Gentle ambient drift — the "orbiting" quality of the armature.
        const ph = hash01(index * 131 + k * 17 + name.length);
        mesh.position.x += Math.sin(t * 0.85 + ph * 6.2831) * 0.014;
        mesh.position.y += Math.cos(t * 0.72 + ph * 6.2831) * 0.012;
        const pulse = 1 + Math.sin(t * 0.95 + ph * 6.2831) * 0.05;
        sx *= pulse;
        if (name !== "bars") sy *= pulse;
        sz *= pulse;
        if (name === "rings") {
          scratchQ2.setFromAxisAngle(Z_AXIS, t * 0.16 + ph * 3.1);
          scratchQ.multiply(scratchQ2);
        }

        mesh.scale.set(
          Math.max(0.001, sx),
          Math.max(0.001, sy),
          Math.max(0.001, sz),
        );
        mesh.quaternion.copy(scratchQ);

        const o = (a.o + (b.o - a.o) * f) * BASE_OPACITY[name] * dim;
        mat.transparent = true;
        mat.opacity = Math.max(0, Math.min(1, o));
        mesh.visible = mat.opacity > 0.012;

        scratchColor.copy(BASE_COLOR[name]).lerp(accent, Math.min(1, poolAccent));
        mat.color.copy(scratchColor);
      }
    }
  });

  return (
    <group ref={innerRef}>
      {POOL_ORDER.map((name) => (
        <group key={name}>
          {Array.from({ length: counts[name] }, (_, k) => (
            <mesh
              key={k}
              ref={(m) => {
                meshRefs.current[name][k] = m;
              }}
              material={materials[name][k]}
              geometry={
                name === "nodes"
                  ? geometry.node
                  : name === "bars"
                    ? geometry.bar
                    : name === "rings"
                      ? geometry.ring
                      : geometry.plate
              }
              castShadow={name === "nodes" || name === "bars"}
              frustumCulled={false}
            />
          ))}
        </group>
      ))}
    </group>
  );
}
