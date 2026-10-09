"use client";

/* ════════════════════════════════════════════════════════════════════
   SUBJECT GALLERY — SHARED-CANVAS 3D LAYER (DEC-047, owner brief 2026-10-09)

   ONE WebGL context for all seven centerpieces: a single fixed <Canvas>
   whose scissored <View> portals (drei) render into the tracked DOM slots
   authored by subject-gallery-cards.tsx. No seven uncoordinated contexts.

   · Culling     — IntersectionObserver flips frameloop to "never" when the
                   section leaves the viewport; the GPU goes idle.
   · Reduced     — prefers-reduced-motion: frameloop "demand", every useFrame
                   no-ops, models hold a lit hero angle; card tilt disabled.
   · Device      — sub-768px steps geometry subdivision / particle counts down.
   · Fallback    — the DOM cards ship static SVG motifs (server HTML); this
                   layer fades in over them only after the first GL frame.
   · Glyphs      — π ∑ ∞ / A & Q Ω / { } 01 => are drawn to 2D canvases and
                   uploaded as CanvasTextures: zero network font fetches, so
                   the CSP connect-src posture stands untouched.
   ════════════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";

import { GALLERY_SLUGS, GALLERY_ACCENTS, type GallerySlug } from "./subject-gallery-data";

export { GALLERY_SLUGS, GALLERY_ACCENTS };
export type { GallerySlug };

/* ── glyph texture (2D canvas → CanvasTexture; CSP-clean) ──────────────── */
function Glyph({ text, color, scale = 0.42, orbit = 0, radius = 1.5, speed = 0.25, phase = 0, reduced }: {
  text: string; color: string; scale?: number; orbit?: number; radius?: number; speed?: number; phase?: number; reduced: boolean;
}) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.font = "700 68px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
    ctx.fillStyle = color;
    ctx.fillText(text, 64, 66);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }, [text, color]);
  useEffect(() => () => tex.dispose(), [tex]);
  const ref = useRef<THREE.Sprite>(null);
  useFrame(({ clock }) => {
    if (reduced || !ref.current || orbit === 0) return;
    const a = phase + clock.elapsedTime * speed;
    ref.current.position.set(Math.cos(a) * radius, orbit * Math.sin(a * 0.9), Math.sin(a) * radius);
  });
  return (
    <sprite ref={ref} scale={scale} position={orbit === 0 ? [0, 0, 0] : [radius, 0, 0]}>
      <spriteMaterial map={tex} transparent depthWrite={false} opacity={0.85} />
    </sprite>
  );
}

/* ── shared helpers ────────────────────────────────────────────────────── */
const Spin = ({ children, speed = 0.22, reduced, axis = "y" }: { children: React.ReactNode; speed?: number; reduced: boolean; axis?: "y" | "xy" }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (reduced || !ref.current) return;
    ref.current.rotation.y += dt * speed;
    if (axis === "xy") ref.current.rotation.x += dt * speed * 0.35;
  });
  return <group ref={ref}>{children}</group>;
};

const glowMat = (color: string, opacity = 1) => (
  <meshBasicMaterial color={color} transparent opacity={opacity} />
);

/* ── 1 · Mathematics — stellated icosahedron, lit vertices, orbiting π ∑ ∞ */
function MathScene({ accent, reduced, lite }: SceneProps) {
  const verts = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, lite ? 0 : 1);
    return g;
  }, [lite]);
  useEffect(() => () => verts.dispose(), [verts]);
  return (
    <Spin reduced={reduced} speed={0.18}>
      <mesh geometry={verts}>
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.55} />
      </mesh>
      <points geometry={verts}>
        <pointsMaterial color="#dbeafe" size={0.055} transparent opacity={0.95} sizeAttenuation />
      </points>
      <mesh>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.3} />
      </mesh>
      <Glyph text="π" color={accent} reduced={reduced} orbit={0.5} radius={1.55} speed={0.3} phase={0} />
      <Glyph text="∑" color={accent} reduced={reduced} orbit={-0.4} radius={1.7} speed={0.24} phase={2.1} />
      <Glyph text="∞" color={accent} reduced={reduced} orbit={0.3} radius={1.6} speed={0.27} phase={4.2} />
    </Spin>
  );
}

/* ── 2 · Physics — luminous core, orbiting spheres, pulsing field arcs ─── */
function PhysicsScene({ accent, reduced, lite }: SceneProps) {
  const orbiters = useRef<THREE.Group>(null);
  const arcs = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (reduced) return;
    if (orbiters.current) orbiters.current.rotation.y += 0.0045;
    if (arcs.current) {
      const p = 0.5 + 0.28 * Math.sin(clock.elapsedTime * 1.4);
      arcs.current.children.forEach((m) => {
        const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat && "opacity" in mat) mat.opacity = p;
      });
    }
  });
  const arcGeom = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1.45, 0.6, 0, Math.PI * 2);
    const pts = curve.getPoints(lite ? 40 : 72).map((p) => new THREE.Vector3(p.x, p.y, 0));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [lite]);
  useEffect(() => () => arcGeom.dispose(), [arcGeom]);
  const rings = [0, 1, 2];
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.34, lite ? 16 : 28, lite ? 16 : 28]} />
        {glowMat("#fff7e6")}
      </mesh>
      <mesh scale={1.35}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshBasicMaterial color={accent} transparent opacity={0.28} />
      </mesh>
      <group ref={orbiters}>
        {rings.map((r) => (
          <group key={r} rotation={[Math.PI / 2.6 + r * 0.55, r * 1.1, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.85 + r * 0.32, 0.006, 6, lite ? 48 : 80]} />
              <meshBasicMaterial color={accent} transparent opacity={0.4} />
            </mesh>
            <mesh position={[0.85 + r * 0.32, 0, 0]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              {glowMat("#ffe9c2")}
            </mesh>
          </group>
        ))}
      </group>
      <group ref={arcs}>
        <primitive object={new THREE.Line(arcGeom, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.5 }))} rotation={[1.1, 0.4, 0]} />
        <primitive object={new THREE.Line(arcGeom, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.35 }))} rotation={[-0.9, -0.5, 0.4]} />
      </group>
    </group>
  );
}

/* ── 3 · Chemistry — hexagonal bond lattice, electron clouds, micro-points */
function ChemistryScene({ accent, reduced, lite }: SceneProps) {
  const atoms = useMemo(() => {
    const a: [number, number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const t = (i / 6) * Math.PI * 2;
      a.push([Math.cos(t) * 0.9, Math.sin(t) * 0.9, 0]);
    }
    return a;
  }, []);
  const sticks = useMemo(() => atoms.map((p, i) => {
    const q = atoms[(i + 1) % 6];
    const mid: [number, number, number] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0];
    const ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
    return { mid, ang };
  }), [atoms]);
  const cloud = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (reduced || !cloud.current) return;
    cloud.current.rotation.z = clock.elapsedTime * 0.2;
  });
  const moteCount = lite ? 24 : 60;
  const motes = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      const r = 1.2 + Math.random() * 0.7;
      const t = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(t) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = Math.sin(t) * r * 0.6;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [moteCount]);
  useEffect(() => () => motes.dispose(), [motes]);
  return (
    <Spin reduced={reduced} speed={0.2} axis="xy">
      {atoms.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.16, lite ? 12 : 20, lite ? 12 : 20]} />
          <meshStandardMaterial color={i % 2 ? "#ede9fe" : accent} roughness={0.18} metalness={0.1} />
        </mesh>
      ))}
      {sticks.map((s, i) => (
        <mesh key={i} position={s.mid} rotation={[0, 0, s.ang]}>
          <boxGeometry args={[0.9, 0.035, 0.035]} />
          <meshBasicMaterial color={accent} transparent opacity={0.65} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.02]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        {glowMat(accent)}
      </mesh>
      <group ref={cloud}>
        <mesh>
          <sphereGeometry args={[1.05, lite ? 12 : 20, lite ? 12 : 20]} />
          <meshBasicMaterial color={accent} transparent opacity={0.07} />
        </mesh>
      </group>
      <points geometry={motes}>
        <pointsMaterial color={accent} size={0.03} transparent opacity={0.7} sizeAttenuation />
      </points>
    </Spin>
  );
}

/* ── 4 · Biology — double helix, base pairs, bioluminescent motes ──────── */
function BiologyScene({ accent, reduced, lite }: SceneProps) {
  const turns = lite ? 2 : 3;
  const per = lite ? 14 : 22;
  const helix = useMemo(() => {
    const a: { p1: [number, number, number]; p2: [number, number, number] }[] = [];
    for (let i = 0; i < per; i++) {
      const t = (i / per) * Math.PI * 2 * turns;
      const y = (i / per) * 2.6 - 1.3;
      a.push({
        p1: [Math.cos(t) * 0.62, y, Math.sin(t) * 0.62],
        p2: [Math.cos(t + Math.PI) * 0.62, y, Math.sin(t + Math.PI) * 0.62],
      });
    }
    return a;
  }, [per, turns]);
  return (
    <Spin reduced={reduced} speed={0.24}>
      {helix.map((h, i) => (
        <group key={i}>
          <mesh position={h.p1}>
            <sphereGeometry args={[0.055, 8, 8]} />
            {glowMat(accent)}
          </mesh>
          <mesh position={h.p2}>
            <sphereGeometry args={[0.055, 8, 8]} />
            {glowMat("#a7f3d0")}
          </mesh>
          {i % 3 === 0 && (
            <mesh position={[(h.p1[0] + h.p2[0]) / 2, h.p1[1], (h.p1[2] + h.p2[2]) / 2]} rotation={[0, -Math.atan2(h.p1[2] - h.p2[2], h.p1[0] - h.p2[0]), Math.PI / 2]}>
              <cylinderGeometry args={[0.016, 0.016, 1.24, 6]} />
              <meshBasicMaterial color={accent} transparent opacity={0.4} />
            </mesh>
          )}
        </group>
      ))}
      <Glyph text="✳" color={accent} scale={0.3} reduced={reduced} orbit={0.6} radius={1.25} speed={0.22} phase={1} />
      <Glyph text="❋" color="#a7f3d0" scale={0.26} reduced={reduced} orbit={-0.5} radius={1.35} speed={0.18} phase={3.6} />
    </Spin>
  );
}

/* ── 5 · English — dimensional open tome, undulating pages, tumbling glyphs */
function EnglishScene({ accent, reduced, lite }: SceneProps) {
  const pages = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (reduced || !pages.current) return;
    pages.current.children.forEach((m, i) => {
      m.rotation.z = (i % 2 ? -1 : 1) * (0.42 + 0.05 * Math.sin(clock.elapsedTime * 1.1 + i));
      m.position.y = 0.02 * Math.sin(clock.elapsedTime * 0.9 + i * 1.7);
    });
  });
  return (
    <group rotation={[0.5, 0, 0]}>
      <Spin reduced={reduced} speed={0.14}>
        <mesh position={[-0.5, -0.03, 0]} rotation={[0, 0, 0.42]}>
          <boxGeometry args={[1.02, 0.045, 0.78]} />
          <meshStandardMaterial color="#8a5a66" roughness={0.55} />
        </mesh>
        <mesh position={[0.5, -0.03, 0]} rotation={[0, 0, -0.42]}>
          <boxGeometry args={[1.02, 0.045, 0.78]} />
          <meshStandardMaterial color="#8a5a66" roughness={0.55} />
        </mesh>
        <group ref={pages}>
          {[-0.46, -0.3, 0.3, 0.46].map((x, i) => (
            <mesh key={i} position={[x, 0.02, 0]} rotation={[0, 0, (i % 2 ? -1 : 1) * 0.42]}>
              <boxGeometry args={[0.86, 0.016, 0.7]} />
              <meshStandardMaterial color={i % 2 ? "#ffe4e6" : "#fff8ee"} roughness={0.5} transparent opacity={0.95} />
            </mesh>
          ))}
        </group>
        <Glyph text="A" color={accent} reduced={reduced} orbit={0.7} radius={1.35} speed={0.2} phase={0.4} />
        <Glyph text="&" color="#fda4af" reduced={reduced} orbit={-0.55} radius={1.5} speed={0.16} phase={2.4} />
        <Glyph text="Q" color={accent} reduced={reduced} orbit={0.45} radius={1.42} speed={0.23} phase={4.4} />
        <Glyph text="Ω" color="#fda4af" scale={0.34} reduced={reduced} orbit={-0.35} radius={1.28} speed={0.19} phase={5.6} />
      </Spin>
    </group>
  );
}

/* ── 6 · History — latitudinal globe, armillary band, parchment layers ─── */
function HistoryScene({ accent, reduced, lite }: SceneProps) {
  const arm = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (reduced || !arm.current) return;
    arm.current.rotation.z += dt * 0.3;
  });
  return (
    <Spin reduced={reduced} speed={0.16}>
      <mesh>
        <sphereGeometry args={[0.85, lite ? 12 : 20, lite ? 12 : 20]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.5} />
      </mesh>
      {[-0.4, 0, 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.sqrt(Math.max(0.05, 0.85 * 0.85 - y * y)), 0.008, 6, lite ? 40 : 64]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.55} />
        </mesh>
      ))}
      <mesh ref={arm} rotation={[0.6, 0.2, 0]}>
        <torusGeometry args={[1.25, 0.02, 8, lite ? 48 : 80]} />
        <meshBasicMaterial color="#DFB15B" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, 0, -0.9]} rotation={[0, 0, 0.1]}>
        <planeGeometry args={[1.5, 1.05]} />
        <meshBasicMaterial color="#a16207" transparent opacity={0.16} />
      </mesh>
      <mesh position={[0.2, 0.1, -1.05]} rotation={[0, 0, -0.14]}>
        <planeGeometry args={[1.3, 0.9]} />
        <meshBasicMaterial color="#713f12" transparent opacity={0.12} />
      </mesh>
    </Spin>
  );
}

/* ── 7 · Computer Science — processor die, radiating traces, glyph panels ─ */
function ComputerScienceScene({ accent, reduced, lite }: SceneProps) {
  const packets = useRef<THREE.Group>(null);
  const traces = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts: number[] = [];
    const n = lite ? 8 : 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r0 = 0.55;
      const r1 = 1.35 + (i % 3) * 0.22;
      const bend = (i % 2 ? 1 : -1) * 0.35;
      pts.push(Math.cos(a) * r0, Math.sin(a) * r0 * 0.7, 0);
      pts.push(Math.cos(a) * r1, Math.sin(a) * r1 * 0.7 + bend, 0);
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, [lite]);
  useEffect(() => () => traces.dispose(), [traces]);
  useFrame(({ clock }) => {
    if (reduced || !packets.current) return;
    packets.current.children.forEach((m, i) => {
      const t = (clock.elapsedTime * 0.35 + i * 0.17) % 1;
      const a = (i / 8) * Math.PI * 2;
      const r = 0.55 + t * 1.1;
      m.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.7, 0.02);
      const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.9 * (1 - t);
    });
  });
  return (
    <group rotation={[0.5, 0, 0]}>
      <Spin reduced={reduced} speed={0.12}>
        <mesh>
          <boxGeometry args={[0.82, 0.82, 0.1]} />
          <meshStandardMaterial color="#12283d" roughness={0.3} metalness={0.45} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.12]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} roughness={0.2} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.82, 0.82, 0.1)]} />
          <lineBasicMaterial color={accent} transparent opacity={0.9} />
        </lineSegments>
        <lineSegments geometry={traces as THREE.BufferGeometry}>
          <lineBasicMaterial color={accent} transparent opacity={0.5} />
        </lineSegments>
        <group ref={packets}>
          {Array.from({ length: lite ? 4 : 8 }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#DFB15B" transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
        <Glyph text="{ }" color="#67e8f9" scale={0.4} reduced={reduced} orbit={0.5} radius={1.5} speed={0.16} phase={0.8} />
        <Glyph text="01" color="#DFB15B" scale={0.34} reduced={reduced} orbit={-0.4} radius={1.6} speed={0.14} phase={2.9} />
        <Glyph text="=>" color="#67e8f9" scale={0.36} reduced={reduced} orbit={0.35} radius={1.45} speed={0.18} phase={5.1} />
      </Spin>
    </group>
  );
}

type SceneProps = { accent: string; reduced: boolean; lite: boolean };

/* Independent 3D response while a card is hovered/focused — layered
   parallax against the CSS image shift and card tilt (DEC-051). */
function HoverDrift({ slug, hoverRef, children }: {
  slug: GallerySlug;
  hoverRef: { current: Record<string, boolean> };
  children: React.ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const cur = useRef(0);
  useFrame((st, dt) => {
    const target = hoverRef.current[slug] ? 1 : 0;
    cur.current += (target - cur.current) * Math.min(1, dt * 6);
    if (!g.current) return;
    g.current.rotation.y += dt * 0.35 * cur.current;
    g.current.position.z = 0.18 * cur.current;
    g.current.position.y = 0.05 * cur.current * Math.sin(st.clock.elapsedTime * 2.2);
  });
  return <group ref={g}>{children}</group>;
}

const SCENES: Record<GallerySlug, (p: SceneProps) => React.ReactNode> = {
  mathematics: (p) => <MathScene {...p} />,
  physics: (p) => <PhysicsScene {...p} />,
  chemistry: (p) => <ChemistryScene {...p} />,
  biology: (p) => <BiologyScene {...p} />,
  english: (p) => <EnglishScene {...p} />,
  history: (p) => <HistoryScene {...p} />,
  "computer-science": (p) => <ComputerScienceScene {...p} />,
};

/* ── the shared canvas layer ───────────────────────────────────────────── */
export default function SubjectGalleryCanvas() {
  const [els, setEls] = useState<Record<string, { current: HTMLElement }> | null>(null);
  const [ready, setReady] = useState(false);
  const hoverRef = useRef<Record<string, boolean>>({});
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(true);
  const reduced = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const lite = useMemo(() => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches, []);

  useEffect(() => {
    const map: Record<string, { current: HTMLElement }> = {};
    for (const s of GALLERY_SLUGS) {
      const el = document.getElementById(`ta-view-${s}`);
      if (el) map[s] = { current: el };
    }
    setEls(map);
    sectionRef.current = document.getElementById("disciplines");

    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "120px" });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  /* pointer tilt (±3°, spring-damped) + hover lift; skipped when reduced */
  useEffect(() => {
    if (reduced) return;
    const pairs = GALLERY_SLUGS.map((slug) => [slug, document.getElementById(`ta-card-${slug}`)] as const).filter(([, el]) => el) as [GallerySlug, HTMLElement][];
    const cleanups = pairs.map(([slug, card]) => {
      let raf = 0;
      const st = { rx: 0, ry: 0, lift: 0, trx: 0, try_: 0, tl: 0 };
      const tick = () => {
        st.rx += (st.trx - st.rx) * 0.14;
        st.ry += (st.try_ - st.ry) * 0.14;
        st.lift += (st.tl - st.lift) * 0.16;
        card.style.transform = `perspective(900px) rotateX(${st.rx.toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg) translateY(${st.lift.toFixed(1)}px)`;
        if (Math.abs(st.trx - st.rx) > 0.01 || Math.abs(st.try_ - st.ry) > 0.01 || Math.abs(st.tl - st.lift) > 0.05) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
        }
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
      const move = (ev: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const dx = (ev.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (ev.clientY - (r.top + r.height / 2)) / r.height;
        st.try_ = dx * 3;
        st.trx = -dy * 3;
        kick();
      };
      const enter = () => { st.tl = -4; hoverRef.current[slug] = true; kick(); };
      const leave = () => { st.trx = 0; st.try_ = 0; st.tl = 0; hoverRef.current[slug] = false; kick(); };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerenter", enter);
      card.addEventListener("pointerleave", leave);
      return () => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerenter", enter);
        card.removeEventListener("pointerleave", leave);
        cancelAnimationFrame(raf);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, [reduced, els]);

  /* fade the SVG fallbacks out once GL has drawn its first frame */
  useEffect(() => {
    if (!ready) return;
    document.querySelectorAll("[data-gallery-fallback]").forEach((n) => {
      (n as HTMLElement).style.opacity = "0";
    });
  }, [ready]);

  if (!els) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]" aria-hidden="true">
      <Canvas
        dpr={lite ? 1 : [1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : inView ? "always" : "never"}
        onCreated={() => setReady(true)}
        style={{ background: "transparent" }}
      >
        {GALLERY_SLUGS.map((slug) =>
          els[slug] ? (
            <View key={slug} track={els[slug]}>
              <ambientLight intensity={0.8} color="#FFF8ED" />
              <directionalLight position={[2.6, 3.2, 2.2]} intensity={1.2} color="#FFF3DC" />
              <pointLight position={[-2, 1, 2.4]} intensity={6} color={GALLERY_ACCENTS[slug]} />
              <HoverDrift slug={slug} hoverRef={hoverRef}>
                {SCENES[slug]({ accent: GALLERY_ACCENTS[slug], reduced, lite })}
              </HoverDrift>
            </View>
          ) : null
        )}
      </Canvas>
    </div>
  );
}
