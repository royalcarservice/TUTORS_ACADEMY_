"use client";

/* ════════════════════════════════════════════════════════════════════
   HERO CANVAS — THE MORNING STUDY SANCTUARY (DEC-048, pivot 2026-10-09)

   The night meadow is overridden by owner mandate: a luminous morning —
   dawn-peach horizon into crystal sky-blue, directional sunlight from the
   top right with volumetric shafts, sunlit dust motes / golden pollen /
   ivory sparkles drifting UPWARD, and students at light-oak & ivory desks
   among daisies, marigolds and clothbound books.

   Contracts carried over from the night build:
     · 1500 particles desktop / 400 under 768px, in three parallax planes
     · pointer parallax capped at ±3.5°, multi-plane separation
     · scroll camera push; headline drift via HeroDrift
     · prefers-reduced-motion → one static lit frame, no loop/parallax
     · visibilitychange pauses the loop (battery respect)
     · HTML-first: this canvas is enhancement; copy lives in markup
   ════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from "react";

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SKY_TOP = "#E8F1F5";
const SKY_MID = "#FDFBF7";
const HORIZON = "#FFF1E6";
const SUN_X = 0.78;
const SUN_Y = 0.16;

export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = () => window.innerWidth < 768;
    const COUNT = () => (small() ? 400 : 1500);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let px = 0; // pointer parallax -1..1
    let py = 0;
    let push = 0; // scroll camera push 0..1
    const rnd = mulberry(20261009);

    type Mote = { x: number; y: number; z: number; r: number; s: number; ph: number; tw: number };
    let motes: Mote[] = [];

    function seed() {
      const R = mulberry(7);
      motes = Array.from({ length: COUNT() }, () => ({
        x: R(),
        y: R(),
        z: R() < 0.5 ? 0 : R() < 0.75 ? 1 : 2,
        r: 0.5 + R() * 1.6,
        s: 0.008 + R() * 0.02, // upward drift, fraction of height per second
        ph: R() * Math.PI * 2,
        tw: 0.4 + R() * 0.6,
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) frame(0);
    }

    /* ── scenery ─────────────────────────────────────────────────────── */
    function sky() {
      const g = ctx!.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, SKY_TOP);
      g.addColorStop(0.52, SKY_MID);
      g.addColorStop(0.86, HORIZON);
      g.addColorStop(1, "#FFF8ED");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);
    }

    function sun(t: number) {
      const sx = w * SUN_X;
      const sy = h * SUN_Y;
      // volumetric shafts
      ctx!.save();
      ctx!.globalCompositeOperation = "lighter";
      ctx!.translate(sx, sy);
      ctx!.rotate(reduced ? 0.5 : t * 0.008);
      for (let i = 0; i < 5; i++) {
        ctx!.rotate((Math.PI * 2) / 5);
        const sh = ctx!.createLinearGradient(0, 0, w * 0.9, 0);
        sh.addColorStop(0, "rgba(245,230,200,0.10)");
        sh.addColorStop(1, "rgba(245,230,200,0)");
        ctx!.fillStyle = sh;
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(w * 0.9, -h * 0.05);
        ctx!.lineTo(w * 0.9, h * 0.07);
        ctx!.closePath();
        ctx!.fill();
      }
      ctx!.restore();
      // bloom layers
      const layers: [number, string][] = [
        [h * 0.5, "rgba(245,230,200,0.20)"],
        [h * 0.26, "rgba(248,236,208,0.38)"],
        [h * 0.11, "rgba(255,246,220,0.85)"],
      ];
      for (const [r, c] of layers) {
        const g = ctx!.createRadialGradient(sx, sy, 0, sx, sy, r);
        g.addColorStop(0, c);
        g.addColorStop(1, "rgba(245,230,200,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(sx - r, sy - r, r * 2, r * 2);
      }
    }

    function ground() {
      const gy = h * 0.62;
      const g = ctx!.createLinearGradient(0, gy, 0, h);
      g.addColorStop(0, "#F3EDDF");
      g.addColorStop(0.5, "#EDE5D2");
      g.addColorStop(1, "#E5DCC5");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.moveTo(0, gy + h * 0.03);
      ctx!.quadraticCurveTo(w * 0.5, gy - h * 0.035, w, gy + h * 0.03);
      ctx!.lineTo(w, h);
      ctx!.lineTo(0, h);
      ctx!.closePath();
      ctx!.fill();

      // fresh greenery: soft grass strokes
      const R = mulberry(41);
      ctx!.lineCap = "round";
      const blades = small() ? 90 : 220;
      for (let i = 0; i < blades; i++) {
        const x = R() * w;
        const y = gy + h * 0.05 + R() * (h - gy) * 0.9;
        const len = 4 + R() * 9;
        ctx!.strokeStyle = R() < 0.5 ? "rgba(164,190,140,0.35)" : "rgba(196,214,170,0.4)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(x, y);
        ctx!.quadraticCurveTo(x + 2, y - len * 0.6, x + (R() - 0.5) * 6, y - len);
        ctx!.stroke();
      }
    }

    function flower(x: number, y: number, s: number, kind: number) {
      if (kind === 0) {
        // daisy: ivory petals, gold centre
        ctx!.fillStyle = "rgba(255,255,255,0.95)";
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx!.beginPath();
          ctx!.ellipse(x + Math.cos(a) * s * 1.6, y + Math.sin(a) * s * 1.6, s, s * 0.62, a, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.fillStyle = "#E7C878";
        ctx!.beginPath();
        ctx!.arc(x, y, s * 0.8, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        // marigold: layered warm dots
        ctx!.fillStyle = "#E9A13B";
        ctx!.beginPath();
        ctx!.arc(x, y, s * 1.4, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = "#D97706";
        ctx!.beginPath();
        ctx!.arc(x, y, s * 0.85, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = "#F6C15C";
        ctx!.beginPath();
        ctx!.arc(x - s * 0.25, y - s * 0.3, s * 0.4, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function flora(ox: number, oy: number, t: number) {
      const R = mulberry(97);
      const n = small() ? 10 : 26;
      for (let i = 0; i < n; i++) {
        const x = R() * w + ox * 0.4;
        const y = h * 0.68 + R() * h * 0.28 + oy * 0.3;
        const s = 2 + R() * 2.6;
        const kind = R() < 0.55 ? 0 : 1;
        // stem
        ctx!.strokeStyle = "rgba(140,170,120,0.5)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(x, y + s * 2.4);
        ctx!.quadraticCurveTo(x + 1, y + s, x, y);
        ctx!.stroke();
        const sway = reduced ? 0 : Math.sin(t * 0.6 + i) * 0.8;
        flower(x + sway, y, s, kind);
      }
    }

    function desk(cx: number, cy: number, u: number) {
      // u = unit scale
      // soft physical shadow beneath
      ctx!.fillStyle = "rgba(15,23,42,0.08)";
      ctx!.beginPath();
      ctx!.ellipse(cx, cy + u * 0.62, u * 1.35, u * 0.16, 0, 0, Math.PI * 2);
      ctx!.fill();

      // legs (light oak)
      ctx!.fillStyle = "#C6A272";
      ctx!.fillRect(cx - u * 1.05, cy, u * 0.1, u * 0.6);
      ctx!.fillRect(cx + u * 0.95, cy, u * 0.1, u * 0.6);
      // ivory front panel
      ctx!.fillStyle = "#EFE6D2";
      ctx!.fillRect(cx - u * 1.0, cy - u * 0.02, u * 2.0, u * 0.34);
      // oak top with warm rim light
      ctx!.fillStyle = "#D9B98C";
      ctx!.fillRect(cx - u * 1.18, cy - u * 0.14, u * 2.36, u * 0.14);
      ctx!.fillStyle = "rgba(212,175,55,0.4)";
      ctx!.fillRect(cx - u * 1.18, cy - u * 0.15, u * 2.36, u * 0.02);

      // monitor: soft warm-white daylight
      const mx = cx + u * 0.42;
      const my = cy - u * 0.62;
      const glow = ctx!.createRadialGradient(mx, my, 0, mx, my, u * 1.1);
      glow.addColorStop(0, "rgba(255,246,224,0.5)");
      glow.addColorStop(1, "rgba(255,246,224,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(mx - u * 1.1, my - u * 1.1, u * 2.2, u * 2.2);
      ctx!.fillStyle = "#F5F1E6";
      ctx!.fillRect(mx - u * 0.42, my - u * 0.34, u * 0.84, u * 0.56);
      ctx!.fillStyle = "#FFF6E0";
      ctx!.fillRect(mx - u * 0.36, my - u * 0.28, u * 0.72, u * 0.44);
      ctx!.fillStyle = "#C6A272";
      ctx!.fillRect(mx - u * 0.05, my + u * 0.22, u * 0.1, u * 0.26);

      // clothbound book stack
      const bx = cx - u * 0.72;
      const cols = ["#7C9A83", "#B76E79", "#24406B", "#C5A059"];
      for (let i = 0; i < 3; i++) {
        ctx!.fillStyle = cols[i];
        ctx!.fillRect(bx - u * 0.26, cy - u * 0.2 - i * u * 0.09, u * 0.52, u * 0.08);
      }

      // student: calm slate silhouette, warm rim
      ctx!.fillStyle = "rgba(51,65,85,0.85)";
      ctx!.beginPath();
      ctx!.arc(cx - u * 0.1, cy - u * 0.62, u * 0.17, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(cx - u * 0.42, cy - u * 0.12);
      ctx!.quadraticCurveTo(cx - u * 0.1, cy - u * 0.52, cx + u * 0.22, cy - u * 0.12);
      ctx!.closePath();
      ctx!.fill();
      ctx!.strokeStyle = "rgba(212,175,55,0.45)";
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      ctx!.arc(cx - u * 0.1, cy - u * 0.62, u * 0.17, -2.4, 0.4);
      ctx!.stroke();
    }

    function stations(ox: number, oy: number) {
      const layout: [number, number, number][] = small()
        ? [
            [0.32, 0.8, 0.75],
            [0.72, 0.86, 0.9],
          ]
        : [
            [0.18, 0.74, 0.7],
            [0.44, 0.8, 0.85],
            [0.7, 0.75, 0.75],
            [0.88, 0.84, 0.95],
          ];
      for (const [fx, fy, u] of layout) {
        desk(w * fx + ox, h * fy + oy, u * (small() ? 42 : 56));
      }
    }

    function particles(t: number) {
      const planes = [
        { p: 0.25, col: "255,255,255", boost: 0 }, // ivory sparkles (far)
        { p: 0.55, col: "231,200,120", boost: 0.1 }, // golden pollen (mid)
        { p: 1.0, col: "214,190,140", boost: 0.25 }, // sunlit dust (near)
      ];
      for (const m of motes) {
        const pl = planes[m.z];
        const y = (((m.y - (reduced ? 0 : t * m.s)) % 1) + 1) % 1;
        const sway = reduced ? 0 : Math.sin(t * 0.5 + m.ph) * 0.012 * (m.z + 1);
        const x = m.x + sway + px * 0.02 * pl.p;
        const yy = y * h + py * 14 * pl.p + push * 30 * pl.p;
        const tw = reduced ? 0.6 : 0.35 + 0.55 * Math.abs(Math.sin(t * m.tw + m.ph));
        ctx!.fillStyle = `rgba(${pl.col},${(0.25 + tw * 0.5 + pl.boost * 0.2).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(x * w, yy, m.r * (0.7 + pl.p * 0.6), 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function frame(t: number) {
      ctx!.clearRect(0, 0, w, h);
      // camera push: gentle scale from scroll
      const scale = 1 + push * 0.05;
      ctx!.save();
      ctx!.translate(w / 2, h / 2);
      ctx!.scale(scale, scale);
      ctx!.translate(-w / 2 + px * -6, -h / 2 + push * 24);
      sky();
      sun(t);
      particles(t);
      ground();
      stations(px * -14, py * 8 + push * 18);
      flora(px * -10, py * 6 + push * 14, t);
      ctx!.restore();
    }

    function loop(tms: number) {
      if (!running) return;
      frame(tms / 1000);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (reduced || running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const onPointer = (e: PointerEvent) => {
      // capped ±3.5° equivalent shift
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
      if (reduced) return;
    };
    const onScroll = () => {
      const r = canvas.getBoundingClientRect();
      push = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height * 0.8)));
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      onScroll();
      start();
    }
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />;
}

/* Headline drift + fade on scroll; inert under reduced motion. */
export function HeroDrift({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      const f = Math.min(1, y / (window.innerHeight * 0.9));
      el.style.transform = `translateY(${(y * 0.16).toFixed(1)}px)`;
      el.style.opacity = String(1 - f * 0.85);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} className="transition-transform duration-75 will-change-transform">
      {children}
    </div>
  );
}
