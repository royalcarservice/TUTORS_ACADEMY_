"use client";

import { useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════════════
   THE MEADOW OF MINDS — hero canvas (Cinematic Redesign, DEC-046)

   A custom canvas stage layered beneath the DOM overlay: three particle
   depth planes (distant twinkling stars, warm embers rising off the
   monitor glows, foreground petal drift) over a procedural meadow of
   illuminated study desks, book stacks and marigold flora.

   · Pointer parallax: the virtual camera eases toward the pointer, max
     ±3.5° of tilt expressed as per-plane translation.
   · Scroll camera: descending, the camera pushes forward (scale) and the
     planes separate; the headline drifts via HeroDrift.
   · prefers-reduced-motion: ONE static frame — stars lit, desks glowing,
     no loop, no parallax.
   · <768px: particle budget dials 1500 → 400; the meadow compacts.
   · Hidden tab: the loop pauses (battery respect, nothing recorded).
   · No WebGL required; the page behind this canvas is a rich gradient,
     so a failed canvas never shows a blank screen.
   ════════════════════════════════════════════════════════════════════════ */

type Star = { x: number; y: number; r: number; phase: number; speed: number };
type Ember = { x: number; y: number; r: number; vy: number; sway: number; phase: number; home: number };
type Petal = { x: number; y: number; r: number; vx: number; sway: number; phase: number; hue: number };

function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let px = 0; // eased pointer -1..1
    let py = 0;
    let tx = 0;
    let ty = 0;
    let scrollP = 0;

    const small = () => window.innerWidth < 768;
    const COUNT = () => (small() ? 400 : 1500);

    let stars: Star[] = [];
    let embers: Ember[] = [];
    let petals: Petal[] = [];

    const rand = mulberry(20261008);

    function deskStations() {
      // three study stations: [xFrac, scale]
      return small()
        ? [[0.5, 1] as const, [0.18, 0.62] as const, [0.84, 0.62] as const]
        : [[0.5, 1.15] as const, [0.2, 0.8] as const, [0.8, 0.8] as const];
    }

    function seed() {
      const n = COUNT();
      stars = Array.from({ length: Math.floor(n * 0.72) }, () => ({
        x: rand(), y: rand() * 0.62, r: 0.4 + rand() * 1.3, phase: rand() * Math.PI * 2, speed: 0.4 + rand() * 1.1,
      }));
      embers = Array.from({ length: Math.floor(n * 0.18) }, () => ({
        x: rand(), y: 0.55 + rand() * 0.4, r: 0.6 + rand() * 1.4, vy: 0.008 + rand() * 0.02, sway: 0.4 + rand(), phase: rand() * 6, home: Math.floor(rand() * 3),
      }));
      petals = Array.from({ length: Math.floor(n * 0.1) }, () => ({
        x: rand(), y: 0.72 + rand() * 0.26, r: 1.2 + rand() * 2.2, vx: 0.01 + rand() * 0.03, sway: 0.5 + rand(), phase: rand() * 6, hue: rand(),
      }));
    }

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) frame(0); // static, lit, calm
    }

    function station(i: number, scale: number, t: number, ox: number, oy: number) {
      const st = deskStations();
      const [fx, s] = st[i % st.length];
      const cx = fx * w + ox;
      const base = h * 0.86 + oy;
      const S = s * scale * (small() ? 0.8 : 1);

      // monitor glow first (light source)
      const gx = cx;
      const gy = base - 74 * S;
      const glow = ctx!.createRadialGradient(gx, gy, 4, gx, gy, 150 * S);
      glow.addColorStop(0, "rgba(255,196,110,0.5)");
      glow.addColorStop(0.4, "rgba(255,178,84,0.16)");
      glow.addColorStop(1, "rgba(255,178,84,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(gx - 160 * S, gy - 160 * S, 320 * S, 320 * S);

      // student silhouette, rim-lit
      ctx!.fillStyle = "#050a18";
      ctx!.beginPath();
      ctx!.arc(cx, base - 96 * S, 13 * S, 0, Math.PI * 2); // head
      ctx!.fill();
      ctx!.beginPath();
      ctx!.ellipse(cx, base - 62 * S, 26 * S, 24 * S, 0, Math.PI, 0); // shoulders
      ctx!.fill();
      ctx!.strokeStyle = "rgba(229,224,216,0.5)"; // moonlight rim
      ctx!.lineWidth = 1.1;
      ctx!.beginPath();
      ctx!.arc(cx, base - 96 * S, 13 * S, Math.PI * 1.1, Math.PI * 1.9);
      ctx!.stroke();

      // monitor
      ctx!.fillStyle = "#0a1226";
      ctx!.strokeStyle = "rgba(197,154,63,0.5)";
      ctx!.lineWidth = 1;
      const mw = 64 * S, mh = 40 * S;
      ctx!.beginPath();
      ctx!.roundRect(cx - mw / 2, base - 96 * S, mw, mh, 3);
      ctx!.fill();
      ctx!.stroke();
      const screen = ctx!.createLinearGradient(cx, base - 96 * S, cx, base - 56 * S);
      screen.addColorStop(0, "rgba(255,214,150,0.9)");
      screen.addColorStop(1, "rgba(255,186,100,0.55)");
      ctx!.fillStyle = screen;
      ctx!.fillRect(cx - mw / 2 + 3, base - 93 * S, mw - 6, mh - 8);

      // desk
      ctx!.fillStyle = "#071021";
      ctx!.fillRect(cx - 62 * S, base - 52 * S, 124 * S, 8 * S);
      ctx!.fillStyle = "#050b18";
      ctx!.fillRect(cx - 56 * S, base - 44 * S, 8 * S, 44 * S);
      ctx!.fillRect(cx + 48 * S, base - 44 * S, 8 * S, 44 * S);
      ctx!.strokeStyle = "rgba(229,224,216,0.28)";
      ctx!.beginPath();
      ctx!.moveTo(cx - 62 * S, base - 52 * S);
      ctx!.lineTo(cx + 62 * S, base - 52 * S);
      ctx!.stroke();

      // book stacks
      const stack = (bx: number, n: number) => {
        for (let k = 0; k < n; k++) {
          ctx!.fillStyle = k % 2 ? "#101c36" : "#0d1730";
          ctx!.strokeStyle = "rgba(197,154,63,0.35)";
          ctx!.fillRect(bx - 16 * S, base - 52 * S - 6 * (k + 1) * S, 32 * S, 5 * S);
          ctx!.strokeRect(bx - 16 * S, base - 52 * S - 6 * (k + 1) * S, 32 * S, 5 * S);
        }
      };
      stack(cx - 84 * S, 3 + (i % 2));
      stack(cx + 86 * S, 4 - (i % 2));
      void t;
    }

    function flora(ox: number, oy: number, t: number) {
      const n = small() ? 70 : 160;
      for (let i = 0; i < n; i++) {
        const r = mulberry(i * 7919 + 13);
        const fx = r() * w + ox * 1.4;
        const fy = h * (0.88 + r() * 0.11) + oy;
        const sway = reduced ? 0 : Math.sin(t * 0.0006 + i) * 2;
        const stem = 8 + r() * 18;
        ctx!.strokeStyle = "rgba(74,94,60,0.8)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(fx, fy);
        ctx!.lineTo(fx + sway, fy - stem);
        ctx!.stroke();
        const warm = r();
        ctx!.fillStyle = warm > 0.5 ? "rgba(224,146,66,0.9)" : warm > 0.25 ? "rgba(223,177,91,0.85)" : "rgba(229,224,216,0.7)";
        ctx!.beginPath();
        ctx!.arc(fx + sway, fy - stem, 1.6 + r() * 2.4, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame(t: number) {
      ctx!.clearRect(0, 0, w, h);

      // sky
      const sky = ctx!.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#030712");
      sky.addColorStop(0.55, "#070F2B");
      sky.addColorStop(1, "#0B192C");
      ctx!.fillStyle = sky;
      ctx!.fillRect(0, 0, w, h);

      // nebulae
      for (const [nx, ny, nr, na] of [[0.22, 0.2, 240, 0.05], [0.78, 0.14, 300, 0.04]] as const) {
        const neb = ctx!.createRadialGradient(nx * w, ny * h, 10, nx * w, ny * h, nr);
        neb.addColorStop(0, `rgba(96,118,192,${na})`);
        neb.addColorStop(1, "rgba(96,118,192,0)");
        ctx!.fillStyle = neb;
        ctx!.fillRect(0, 0, w, h);
      }

      const push = scrollP; // 0..1
      const zoom = 1 + push * 0.12;
      ctx!.save();
      ctx!.translate(w / 2, h * 0.6);
      ctx!.scale(zoom, zoom);
      ctx!.translate(-w / 2, -h * 0.6);

      // plane 1 — stars (far): parallax ±3.5° ≈ small translation
      const ox1 = px * 6, oy1 = py * 4 + push * 40;
      for (const s of stars) {
        const tw = reduced ? 0.65 : 0.55 + 0.35 * Math.sin(t * 0.001 * s.speed + s.phase); // 0.2..0.9
        ctx!.globalAlpha = Math.min(0.9, Math.max(0.2, tw));
        ctx!.fillStyle = "#E5E0D8";
        ctx!.beginPath();
        ctx!.arc(s.x * w + ox1, s.y * h + oy1, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // ground band
      const ground = ctx!.createLinearGradient(0, h * 0.72, 0, h);
      ground.addColorStop(0, "rgba(7,15,43,0)");
      ground.addColorStop(1, "#050b18");
      ctx!.fillStyle = ground;
      ctx!.fillRect(0, h * 0.7, w, h * 0.3);

      // plane 2 — meadow stations (mid)
      const ox2 = px * 12, oy2 = py * 7 + push * 90;
      flora(ox2, oy2, t);
      for (const [i, sc] of [[0, 1], [1, 0.85], [2, 0.85]] as const) station(i, sc, t, ox2, oy2);

      // embers rising off the glows
      for (const e of embers) {
        const st = deskStations();
        const home = st[e.home % st.length];
        const ex = home[0] * w + Math.sin(t * 0.001 * e.sway + e.phase) * 14 + ox2;
        const ey = ((e.y - (reduced ? 0 : (t * 0.00002 * e.vy * 1000) % 0.5)) % 0.5) + 0.45;
        ctx!.globalAlpha = 0.5 + 0.4 * Math.sin(t * 0.002 + e.phase);
        ctx!.fillStyle = "rgba(223,177,91,0.8)";
        ctx!.beginPath();
        ctx!.arc(ex, ey * h + oy2, e.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // plane 3 — petal drift (near)
      const ox3 = px * 20, oy3 = py * 10 + push * 150;
      for (const p of petals) {
        const drift = reduced ? 0 : ((t * 0.00003 * p.vx * 1000) % 1.2);
        const x = ((p.x + drift) % 1.2) * w - 0.1 * w + ox3;
        const y = p.y * h + Math.sin(t * 0.001 * p.sway + p.phase) * 6 + oy3;
        ctx!.globalAlpha = 0.5;
        ctx!.fillStyle = p.hue > 0.5 ? "rgba(224,146,66,0.7)" : "rgba(229,224,216,0.5)";
        ctx!.beginPath();
        ctx!.ellipse(x, y, p.r, p.r * 0.6, p.phase, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      ctx!.restore();
    }

    function loop(t: number) {
      if (!running) return;
      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      frame(t);
      raf = requestAnimationFrame(loop);
    }

    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      scrollP = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 0.9));
      if (reduced) frame(0);
    };
    const onVisibility = () => {
      // lifecycle pause only — nothing is recorded, sent or stored
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(loop);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  );
}

/** Headline drift: fades and rises with the scroll camera. Server-rendered
    children stay fully visible without JS. */
export function HeroDrift({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScroll = () => {
      const p = Math.min(1, window.scrollY / (window.innerHeight * 0.7));
      const el = ref.current;
      if (el) {
        el.style.opacity = String(1 - p * 0.9);
        el.style.transform = `translateY(${-p * 60}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div ref={ref} style={{ zIndex: 10, willChange: "opacity, transform" }}>
      {children}
    </div>
  );
}
