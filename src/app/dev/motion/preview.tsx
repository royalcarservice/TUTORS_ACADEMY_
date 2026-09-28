"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  MOTION_BUDGET,
  MOTION_PRESETS,
  initAmbient,
  initReveals,
} from "@/lib/motion";

/* Client-only MOTION SPECIMEN. Demos are button-triggered (not looping). */

const cell: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "0.6875rem" };

const DURATIONS: Array<[label: string, tok: string, note: string]> = [
  ["instant", "--ta-dur-instant", "hover / input"],
  ["fast", "--ta-dur-fast", "exits / tooltip"],
  ["base", "--ta-dur-base", "default entry"],
  ["slow", "--ta-dur-slow", "panels / reveal"],
  ["slower", "--ta-dur-slower", "scene"],
  ["cinematic", "--ta-dur-cinematic", "hero only"],
];

const EASINGS: Array<[label: string, tok: string]> = [
  ["enter", "--ta-ease-enter"],
  ["exit", "--ta-ease-exit"],
  ["in-out", "--ta-ease-in-out"],
  ["cinematic", "--ta-ease-cinematic"],
  ["linear", "--ta-ease-linear"],
];

function bez(tok: string): [number, number, number, number] {
  if (typeof window === "undefined") return [0, 0, 1, 1];
  const v = getComputedStyle(document.documentElement).getPropertyValue(tok).trim();
  const m = v.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return [0, 0, 1, 1]; // linear
  const [a, b, c, d] = m[1].split(",").map((n) => parseFloat(n));
  return [a, b, c, d];
}

function EasingCard({ label, tok }: { label: string; tok: string }) {
  const [run, setRun] = useState(false);
  const [p1, p2, p3, p4] = bez(tok);
  const W = 120;
  const H = 80;
  const path = `M0,${H} C ${p1 * W},${H - p2 * H} ${p3 * W},${H - p4 * H} ${W},0`;
  return (
    <div style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: 12, padding: 12, width: 168 }}>
      <p style={{ ...cell, margin: "0 0 6px" }}>{label} · {tok}</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
        <path d={path} fill="none" stroke="var(--ta-signal)" strokeWidth="2" />
      </svg>
      <button
        onClick={() => setRun((r) => !r)}
        style={{ ...cell, marginTop: 8, padding: "4px 10px", border: "1px solid var(--ta-border-strong)", borderRadius: 999, background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer" }}
      >
        run
      </button>
      <div style={{ marginTop: 8, height: 12, background: "var(--ta-surface-sunken)", borderRadius: 6, position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", top: 1, left: 0, width: 10, height: 10, borderRadius: 5,
            background: "var(--ta-brand)",
            transform: run ? `translateX(${W - 12}px)` : "translateX(0)",
            transition: `transform 700ms var(${tok})`,
          }}
        />
      </div>
    </div>
  );
}

export default function MotionSpecimen() {
  const [runDur, setRunDur] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [fps, setFps] = useState(0);
  const [demo, setDemo] = useState<null | "confirm" | "attention" | "enter" | "exit" | "orient">(null);
  const fpsOn = useRef(true);
  const boxRef = useRef<HTMLDivElement>(null);

  // FPS readout — rAF, auto-stops when hidden (browser throttles rAF in bg).
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      if (!fpsOn.current) return;
      frames++;
      if (t - last >= 500) {
        setFps(Math.round((frames * 1000) / (t - last)));
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onVis = () => {
      fpsOn.current = !document.hidden;
      if (fpsOn.current) {
        last = performance.now();
        frames = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Reveals + ambient lifecycle
  useEffect(() => {
    const offReveal = initReveals();
    const offAmbient = initAmbient();
    return () => {
      offReveal();
      offAmbient();
    };
  }, []);

  const toggleReduced = useCallback((on: boolean) => {
    setReduced(on);
    if (on) document.documentElement.setAttribute("data-reduced-motion", "on");
    else document.documentElement.removeAttribute("data-reduced-motion");
  }, []);

  const fire = (kind: NonNullable<typeof demo>) => {
    setDemo(null);
    requestAnimationFrame(() => setDemo(kind));
  };

  const targetClass =
    demo === "confirm" ? "ta-confirm" :
    demo === "attention" ? "ta-attention" :
    demo === "enter" ? "ta-enter" :
    demo === "exit" ? "ta-exit" :
    demo === "orient" ? "ta-orient is-in" : "";

  return (
    <main style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100vh", padding: "32px 24px 120px" }}>
      <h1 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-lg)", lineHeight: "var(--ta-leading-display)", letterSpacing: "var(--ta-tracking-display-xl)", fontWeight: 600, margin: 0 }}>
        Motion grammar — TRANSITION · ORIENT · CONFIRM · REVEAL
      </h1>
      <p style={{ ...cell, color: "var(--ta-text-muted)", margin: "8px 0 4px" }}>
        If an animation does none of the four, it is deleted. · budget {MOTION_BUDGET}/section · dev-only
      </p>
      <p style={{ ...cell, color: "var(--ta-state-warning)", margin: "0 0 24px" }}>
        Motion is never the only carrier of information.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
        <span style={{ ...cell, padding: "6px 10px", border: "1px solid var(--ta-border-strong)", borderRadius: 999 }}>FPS {fps}</span>
        <button
          onClick={() => toggleReduced(!reduced)}
          style={{ ...cell, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--ta-border-strong)", background: reduced ? "var(--ta-signal)" : "var(--ta-surface-raised)", color: reduced ? "var(--ta-text-on-brand)" : "var(--ta-text-primary)", cursor: "pointer" }}
        >
          reduced-motion: {reduced ? "ON" : "off"}
        </button>
        <span style={{ ...cell, color: "var(--ta-text-muted)" }}>OS setting: {typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference"}</span>
      </div>

      {/* Durations side by side */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "16px 0 12px" }}>Durations (same distance, felt side by side)</h2>
      <button onClick={() => setRunDur((r) => !r)} style={{ ...cell, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", marginBottom: 12 }}>
        {runDur ? "reset" : "play"}
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DURATIONS.map(([label, tok, note]) => (
          <div key={tok} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ ...cell, width: 92 }}>{label}</span>
            <div style={{ flex: 1, maxWidth: 420, height: 14, background: "var(--ta-surface-sunken)", borderRadius: 7, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 2, left: 0, width: 10, height: 10, borderRadius: 5, background: "var(--ta-signal)", transform: runDur ? "translateX(380px)" : "translateX(0)", transition: `transform var(${tok}) var(--ta-ease-in-out)` }} />
            </div>
            <span style={{ ...cell, color: "var(--ta-text-muted)" }}>{note}</span>
          </div>
        ))}
      </div>

      {/* Easings */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "32px 0 12px" }}>Easings (actual path, animating)</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {EASINGS.map(([label, tok]) => (
          <EasingCard key={tok} label={label} tok={tok} />
        ))}
      </div>

      {/* Primitives on demand */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "32px 0 12px" }}>Choreography primitives (button-triggered)</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["confirm", "attention", "enter", "exit", "orient"] as const).map((k) => (
          <button key={k} onClick={() => fire(k)} style={{ ...cell, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer" }}>
            {k}
          </button>
        ))}
      </div>
      <div ref={boxRef} className={targetClass} data-from="left" style={{ width: 120, height: 72, borderRadius: 12, background: "var(--ta-brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ta-text-on-brand)", fontFamily: "var(--ta-font-text)", fontWeight: 600 }}>
        target
      </div>

      {/* Preset reference */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "32px 0 12px" }}>Preset reference</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", ...cell }}>
          <thead>
            <tr>{["preset", "verb", "use", "NOT"].map((h) => (<th key={h} style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--ta-border-strong)" }}>{h}</th>))}</tr>
          </thead>
          <tbody>
            {MOTION_PRESETS.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>{p.id} <span style={{ color: "var(--ta-text-muted)" }}>.{p.css}</span></td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)", color: "var(--ta-signal)" }}>{p.verb}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)" }}>{p.use}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--ta-border-subtle)", color: "var(--ta-text-muted)" }}>{p.notUse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reveal / stagger on scroll (one-shot) */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "40px 0 12px" }}>Reveal & stagger (scroll — one-shot, unobserves)</h2>
      <div className="ta-stagger" data-reveal="stagger" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", maxWidth: 720 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={
              {
                "--i": i,
                height: 72,
                borderRadius: 12,
                background: "var(--ta-surface-raised)",
                border: "1px solid var(--ta-border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...cell,
              } as React.CSSProperties
            }
          >
            item {i + 1}
          </div>
        ))}
      </div>
      <div data-reveal style={{ marginTop: 24, maxWidth: 720, padding: 20, borderRadius: 12, background: "var(--ta-surface-raised)", border: "1px solid var(--ta-border-subtle)" }}>
        <p style={{ margin: 0, fontFamily: "var(--ta-font-text)", fontSize: "var(--ta-text-base)", lineHeight: "var(--ta-leading-body)", color: "var(--ta-text-secondary)" }}>
          This panel reveals once on first sight and never re-animates on scroll back. Under
          reduced motion it is simply present — never invisible.
        </p>
      </div>

      {/* Ambient (desktop, on-demand) */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "40px 0 12px" }}>Ambient (desktop-only, pauses off-screen / on blur)</h2>
      <div className="ta-ambient" style={{ width: 120, height: 72, borderRadius: 12, background: "var(--ta-accent-2)", opacity: 0.8 }} />
      <p style={{ ...cell, color: "var(--ta-text-muted)", marginTop: 8 }}>
        Off by default; enabled only ≥64rem + no reduced-motion; pauses on tab blur and stops under reduced motion.
      </p>

      {/* Reduced-motion side-by-side */}
      <h2 style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "40px 0 12px" }}>Reduced motion — both modes</h2>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
        <div style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: 12, padding: 16 }}>
          <p style={{ ...cell, margin: "0 0 8px" }}>normal</p>
          <div className="ta-enter" style={{ height: 56, borderRadius: 10, background: "var(--ta-signal)" }} />
        </div>
        <div data-reduced-motion="on" style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: 12, padding: 16 }}>
          <p style={{ ...cell, margin: "0 0 8px" }}>reduced (attribute-scoped)</p>
          <div className="ta-enter" style={{ height: 56, borderRadius: 10, background: "var(--ta-signal)" }} />
        </div>
      </div>
    </main>
  );
}
