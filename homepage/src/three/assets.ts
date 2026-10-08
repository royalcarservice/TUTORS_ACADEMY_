import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ════════════════════════════════════════════════════════════════════════
   SHARED GEOMETRY + MATERIAL FACTORY

   Geometry is created once per pixel-density tier and shared by all six
   elements. Materials are per mesh (never shared) because each child carries
   its own opacity — that is what lets the page planes and the timeline rings
   fade into and out of a motif instead of snapping.
   ════════════════════════════════════════════════════════════════════════ */

export const PALETTE = {
  brass: new THREE.Color("#c29a45"),
  ivory: new THREE.Color("#faf9f5"),
  teal: new THREE.Color("#35c9b4"),
  paper: new THREE.Color("#fbfaf7"),
  ink: new THREE.Color("#0b0b0c"),
} as const;

export type PoolName = "nodes" | "bars" | "rings" | "plates";

export interface SharedGeometry {
  node: THREE.BufferGeometry;
  bar: THREE.BufferGeometry;
  ring: THREE.BufferGeometry;
  plate: THREE.BufferGeometry;
  dispose: () => void;
}

export function createGeometry(detail: "full" | "compact"): SharedGeometry {
  const hi = detail === "full";
  const node = new THREE.IcosahedronGeometry(0.062, hi ? 2 : 1);
  // Unit capsule along +Y: total height ≈ 1, so scale.y is the strut length.
  const bar = new THREE.CapsuleGeometry(0.03, 0.94, hi ? 6 : 3, hi ? 12 : 6);
  const ring = new THREE.TorusGeometry(1, 0.034, hi ? 12 : 8, hi ? 72 : 40);
  const plate = new RoundedBoxGeometry(0.92, 1.2, 0.035, hi ? 4 : 2, hi ? 8 : 4);
  return {
    node,
    bar,
    ring,
    plate,
    dispose: () => {
      node.dispose();
      bar.dispose();
      ring.dispose();
      plate.dispose();
    },
  };
}

const BASE: Record<PoolName, () => THREE.Material> = {
  // Reflective brass beads.
  nodes: () =>
    new THREE.MeshStandardMaterial({
      color: PALETTE.brass.clone(),
      metalness: 0.92,
      roughness: 0.24,
      envMapIntensity: 1.15,
      transparent: true,
      opacity: 1,
    }),
  // Soft ivory struts — the quiet structural element.
  bars: () =>
    new THREE.MeshStandardMaterial({
      color: PALETTE.ivory.clone(),
      metalness: 0.12,
      roughness: 0.5,
      envMapIntensity: 0.7,
      transparent: true,
      opacity: 1,
    }),
  // Translucent teal frames.
  rings: () =>
    new THREE.MeshPhysicalMaterial({
      color: PALETTE.teal.clone(),
      metalness: 0.0,
      roughness: 0.14,
      transparent: true,
      opacity: 0.55,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      ior: 1.35,
      reflectivity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.4,
    }),
  // Warm paper planes.
  plates: () =>
    new THREE.MeshStandardMaterial({
      color: PALETTE.paper.clone(),
      metalness: 0.0,
      roughness: 0.86,
      envMapIntensity: 0.4,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    }),
};

/** How strongly a pool takes on the subject accent when a motif forms. */
export const ACCENT_MIX: Record<PoolName, number> = {
  nodes: 1.0,
  bars: 0.82,
  rings: 0.9,
  plates: 0.22,
};

/** Base opacity ceiling per pool; layouts scale this down per child. */
export const BASE_OPACITY: Record<PoolName, number> = {
  nodes: 1,
  bars: 1,
  rings: 0.62,
  plates: 1,
};

export const BASE_COLOR: Record<PoolName, THREE.Color> = {
  nodes: PALETTE.brass,
  bars: PALETTE.ivory,
  rings: PALETTE.teal,
  plates: PALETTE.paper,
};

export function createMaterial(pool: PoolName): THREE.Material {
  const m = BASE[pool]();
  m.userData.pool = pool;
  return m;
}

/* ── environment ──────────────────────────────────────────────────────── */

/**
 * A procedural studio environment (three's RoomEnvironment) run through the
 * PMREM generator. This is what makes the brass read as metal rather than as
 * flat yellow, and it costs one small render at mount.
 */
export function createEnvironment(
  renderer: THREE.WebGLRenderer,
): { texture: THREE.Texture; dispose: () => void } | null {
  let proxy: RoomEnvironmentProxy | null = null;
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    proxy = new RoomEnvironmentProxy();
    const rt = pmrem.fromScene(proxy.scene, 0.035);
    const texture = rt.texture;
    const scene = proxy.scene;
    return {
      texture,
      dispose: () => {
        rt.dispose();
        pmrem.dispose();
        texture.dispose();
        scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          mesh.geometry?.dispose?.();
          const m = mesh.material as THREE.Material | undefined;
          m?.dispose?.();
        });
      },
    };
  } catch {
    return null;
  }
}

/* Small wrapper so the examples/jsm import stays in one place. */
class RoomEnvironmentProxy {
  scene: THREE.Scene;
  constructor() {
    // Built inline rather than imported: a gradient sphere + area-ish lights
    // gives the same soft studio reflections with no extra module weight.
    const scene = new THREE.Scene();
    const geo = new THREE.SphereGeometry(8, 24, 16);
    const mat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });

    // Vertical gradient baked into vertex colours: warm above, cool below.
    const colors = new Float32Array(geo.attributes.position!.count * 3);
    const top = new THREE.Color("#fff6e2");
    const mid = new THREE.Color("#e9ecf0");
    const bottom = new THREE.Color("#c9d6d4");
    const pos = geo.attributes.position!;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i += 1) {
      const y = (pos.getY(i) / 8 + 1) / 2;
      c.copy(y > 0.5 ? mid.clone().lerp(top, (y - 0.5) * 2) : bottom.clone().lerp(mid, y * 2));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    mat.vertexColors = true;
    const dome = new THREE.Mesh(geo, mat);
    scene.add(dome);

    // Two bright panels to give the brass something sharp to reflect.
    const panelGeo = new THREE.PlaneGeometry(5, 5);
    const panelMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const p1 = new THREE.Mesh(panelGeo, panelMat);
    p1.position.set(3.4, 3.2, 3.4);
    p1.lookAt(0, 0, 0);
    const p2 = new THREE.Mesh(panelGeo, panelMat.clone());
    (p2.material as THREE.MeshBasicMaterial).color.set("#bff0e8");
    p2.position.set(-4, -1.2, -3);
    p2.lookAt(0, 0, 0);
    scene.add(p1, p2);

    this.scene = scene;
  }
}
