import { Canvas } from "@react-three/fiber";
import { Sculpture } from "./Sculpture";

/* ════════════════════════════════════════════════════════════════════════
   THE CANVAS SHELL

   Fixed and full-bleed behind the page, transparent so the #F5F5F5 ground
   shows through. Pixel density and shadow quality drop on small devices, and
   the frameloop stops entirely when `active` is false.
   ════════════════════════════════════════════════════════════════════════ */

/* Only mounted when the visitor has not asked for reduced motion — see
   SculptureContext — so nothing here needs a motion-off branch of its own. */
export function SceneCanvas({
  compact,
  active,
}: {
  compact: boolean;
  active: boolean;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, compact ? 1.4 : 2]}
      shadows={compact ? "basic" : "soft"}
      camera={{ position: [0, 0, 7.9], fov: 38, near: 0.1, far: 60 }}
      gl={{
        antialias: !compact,
        alpha: true,
        stencil: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      aria-hidden="true"
    >
      <Sculpture compact={compact} />
    </Canvas>
  );
}
