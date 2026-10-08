import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SubjectElement } from "./SubjectElement";
import { createEnvironment, createGeometry } from "./assets";
import { advanceStage, getRig, getSlots, ndcToWorld } from "./choreography";
import { scrollState } from "../lib/scroll";
import { SUBJECTS } from "../data/subjects";
import { damp } from "../lib/math";

/* ════════════════════════════════════════════════════════════════════════
   THE RIG

   Owns the root transform, the six element slots, the camera travel and the
   shadow catcher. Everything it writes is a function of the scrubbed scroll
   position, so scrolling — not a timed animation — is what moves it.
   ════════════════════════════════════════════════════════════════════════ */

const scratchAnchor = new THREE.Vector3();
const scratchPos = new THREE.Vector3();

export function Sculpture({ compact }: { compact: boolean }) {
  const viewport = useThree((s) => s.viewport);
  const camera = useThree((s) => s.camera);

  const rootRef = useRef<THREE.Group>(null);
  const slotRefs = useRef<Array<THREE.Group | null>>([]);
  const shadowRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => createGeometry(compact ? "compact" : "full"),
    [compact],
  );
  /* Dispose the *previous* geometry when the density tier changes, rather than
     on unmount: StrictMode remounts would otherwise free geometry the
     still-mounted tree is using. */
  const prevGeometry = useRef(geometry);
  useEffect(() => {
    if (prevGeometry.current !== geometry) {
      prevGeometry.current.dispose();
      prevGeometry.current = geometry;
    }
  }, [geometry]);

  const smoothed = useRef({ anchor: 0, fit: 1 });

  useFrame((_state, dtRaw) => {
    const root = rootRef.current;
    if (!root) return;
    const dt = Math.min(dtRaw, 1 / 20);
    // Eased here, once per frame, before any reader samples it.
    advanceStage(scrollState.stage, dt);
    const rig = getRig(scrollState.progress);

    /* Pull the sculpture into whichever 3D window is most present, scaling it
       to fit that window so the whole structure stays inside the frame. */
    smoothed.current.anchor = damp(
      smoothed.current.anchor,
      scrollState.anchorActive,
      4,
      dt,
    );
    const anchorMix = smoothed.current.anchor;
    smoothed.current.fit = damp(
      smoothed.current.fit,
      scrollState.anchorFit,
      4,
      dt,
    );

    const camDist = rig.camZ;
    camera.position.set(
      scrollState.pointerX * 0.32,
      -scrollState.pointerY * 0.22,
      camDist,
    );

    ndcToWorld(scrollState.anchorX, scrollState.anchorY, camDist, camera, scratchAnchor);
    scratchPos.set(rig.rigX, rig.rigY, 0);
    scratchPos.lerp(scratchAnchor, anchorMix);

    const fit = 1 + (smoothed.current.fit - 1) * anchorMix;
    root.position.copy(scratchPos);
    root.scale.setScalar(rig.rigScale * fit * (compact ? 0.94 : 1));
    root.rotation.set(
      rig.rotX + scrollState.pointerY * 0.05,
      rig.rotY + scrollState.pointerX * 0.14,
      0,
    );

    camera.lookAt(root.position.x * 0.35, root.position.y * 0.35, 0);

    const slots = getSlots(viewport.width, viewport.height, compact);
    const openMix = rig.openMix;
    for (let i = 0; i < 6; i += 1) {
      const g = slotRefs.current[i];
      if (!g) continue;
      const s = slots[i]!;
      g.position.set(s.x * openMix, s.y * openMix, s.z * openMix);
    }

    const shadow = shadowRef.current;
    if (shadow) {
      const mat = shadow.material as THREE.ShadowMaterial;
      mat.opacity = rig.shadow * (1 - anchorMix * 0.7);
      shadow.position.y = -2.15 - (1 - openMix) * 0.35;
    }
  });

  return (
    <>
      <StudioEnvironment />

      <hemisphereLight args={["#ffffff", "#d9d6cd", 0.7]} />
      <directionalLight
        position={[4.5, 6.5, 5]}
        intensity={2.4}
        color="#fff4e0"
        castShadow
        shadow-mapSize-width={compact ? 512 : 1024}
        shadow-mapSize-height={compact ? 512 : 1024}
        shadow-camera-near={0.5}
        shadow-camera-far={26}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0009}
        shadow-radius={compact ? 2 : 4}
      />
      <directionalLight position={[-5.5, 1.5, -4]} intensity={0.85} color="#8fe0d4" />
      <directionalLight position={[-2, -4, 3]} intensity={0.4} color="#ffffff" />

      <group ref={rootRef}>
        {SUBJECTS.map((subject, i) => (
          <group
            key={subject.id}
            ref={(g) => {
              slotRefs.current[i] = g;
            }}
          >
            <SubjectElement
              index={i}
              subject={subject}
              geometry={geometry}
              compact={compact}
            />
          </group>
        ))}
      </group>

      <mesh
        ref={shadowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.15, 0]}
        receiveShadow
      >
        <planeGeometry args={[26, 26]} />
        <shadowMaterial transparent opacity={0.4} color="#3a3529" />
      </mesh>
    </>
  );
}

/** Procedural studio environment — gives the brass real reflections. */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const env = createEnvironment(gl);
    if (!env) return;
    scene.environment = env.texture;
    scene.environmentIntensity = 0.85;
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);

  return null;
}
