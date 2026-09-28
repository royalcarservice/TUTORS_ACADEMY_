"use client";

import { useEffect, useRef, useState } from "react";

import { BrandLockup } from "@/components/brand/brand";
import { SubjectSwitchSurface, type SwitchApi, type SwitchSubject, type SwitchTelemetry } from "@/components/switch/subject-switch";
import { TIERS, type Tier } from "@/lib/switch/machine";
import { THRESHOLDS } from "@/lib/switch/tier";

const TAG: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-muted)", letterSpacing: "var(--ta-tracking-caps)", textTransform: "uppercase" };
const H1: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-md)", fontWeight: 500, margin: "var(--ta-space-2) 0 0" };
const H2: React.CSSProperties = { fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-display-sm)", fontWeight: 500, margin: "var(--ta-space-section) 0 var(--ta-space-3)" };
const NOTE: React.CSSProperties = { color: "var(--ta-text-muted)", fontSize: "var(--ta-text-sm)", maxWidth: "var(--ta-measure)", margin: "0 0 var(--ta-space-4)", lineHeight: 1.6 };
const BTN: React.CSSProperties = { minHeight: "var(--ta-target-min)", padding: "0 14px", borderRadius: "var(--ta-radius-2)", border: "1px solid var(--ta-border-strong)", background: "var(--ta-surface-raised)", color: "var(--ta-text-primary)", cursor: "pointer", fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-xs)" };
const MONO: React.CSSProperties = { fontFamily: "var(--ta-font-mono)", fontSize: "var(--ta-text-2xs)", color: "var(--ta-text-secondary)" };

type Prep = "ok" | "slow" | "fail";

export default function SwitchSpecimen({ subjects, initialId }: { subjects: SwitchSubject[]; initialId: string }) {
  const api = useRef<SwitchApi | null>(null);
  const [forced, setForced] = useState<Tier | null>(null);
  const [prep, setPrep] = useState<Prep>("ok");
  const [focusMode, setFocusMode] = useState<"inline" | "navigation">("inline");
  const [reduced, setReduced] = useState(false);
  const [telemetry, setTelemetry] = useState<SwitchTelemetry | null>(null);
  const [livePhase, setLivePhase] = useState("IDLE");
  const [log, setLog] = useState<string[]>([]);

  const push = (m: string) => setLog((l) => [...l.slice(-11), m]);

  /* live phase indicator — poll the surface's phase badge. */
  useEffect(() => {
    const t = setInterval(() => {
      const el = document.querySelector("[data-switch-phase]");
      if (el) setLivePhase(el.textContent || "IDLE");
    }, 80);
    return () => clearInterval(t);
  }, []);

  /* reduced-motion dev override */
  useEffect(() => {
    if (reduced) document.documentElement.setAttribute("data-reduced-motion", "on");
    else document.documentElement.removeAttribute("data-reduced-motion");
    return () => document.documentElement.removeAttribute("data-reduced-motion");
  }, [reduced]);

  const trigger = (id: string) => api.current?.trigger(id);

  const interruptMidFlight = () => {
    const a = subjects[0].id;
    const b = subjects[2].id;
    const c = subjects[4].id;
    trigger(a);
    setTimeout(() => trigger(b), 120);
    setTimeout(() => trigger(c), 240);
    push("mid-flight retarget x2 (last wins)");
  };
  const rapid5 = () => {
    subjects.slice(0, 5).forEach((s, i) => setTimeout(() => trigger(s.id), i * 60));
    push("5 rapid triggers (60ms apart)");
  };
  const backgroundTab = () => {
    trigger(subjects[1].id);
    setTimeout(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
      Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
      push("tab backgrounded mid-flight → completed instantly");
    }, 100);
  };

  return (
    <div style={{ background: "var(--ta-surface-base)", color: "var(--ta-text-primary)", minHeight: "100svh", overflowX: "clip" }}>
      <main id="main" className="ta-container ta-container--wide" style={{ paddingBlock: "var(--ta-space-block) var(--ta-space-section)" }}>
        <p style={{ ...TAG, color: "var(--ta-signal)" }}>Phase 3 · Step 4 — THE SUBJECT SWITCH (dev-only)</p>
        <h1 style={H1}>The environment becomes the subject</h1>
        <p style={NOTE}>
          A state machine, not concurrent tweens: IDLE → PREPARE → QUIESCE → TRANSFER → ARRIVE → SETTLE. Total budget
          ≤700ms; content interactive by ARRIVE. No routing — this operates on subject state; route wiring is 3.5.
        </p>

        {/* brand frame — must stay static */}
        <div data-brand-frame style={{ display: "flex", alignItems: "center", gap: "var(--ta-space-4)", padding: "var(--ta-space-3)", border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", marginBottom: "var(--ta-space-4)" }}>
          <BrandLockup markSize={28} />
          <span data-brand-type style={{ fontFamily: "var(--ta-font-display)", fontSize: "var(--ta-text-lg)" }}>Aa Bb 0123</span>
          <button type="button" data-brand-button style={BTN}>
            Sample action
          </button>
        </div>

        {/* controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-2)", alignItems: "center", marginBottom: "var(--ta-space-3)" }}>
          <span style={TAG}>Switch to</span>
          {subjects.map((s) => (
            <button key={s.id} type="button" data-subject={s.id} data-switch-trigger={s.id} onClick={() => trigger(s.id)} style={BTN}>
              {s.name}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-2)", alignItems: "center", marginBottom: "var(--ta-space-3)" }}>
          <span style={TAG}>Tier</span>
          <button type="button" onClick={() => setForced(null)} style={{ ...BTN, color: forced === null ? "var(--ta-accent-1)" : undefined }}>auto</button>
          {TIERS.map((t) => (
            <button key={t} type="button" onClick={() => setForced(t)} style={{ ...BTN, color: forced === t ? "var(--ta-accent-1)" : undefined }}>
              {t}
            </button>
          ))}
          <span style={TAG}>Prep</span>
          {(["ok", "slow", "fail"] as Prep[]).map((p) => (
            <button key={p} type="button" onClick={() => setPrep(p)} style={{ ...BTN, color: prep === p ? "var(--ta-accent-1)" : undefined }}>
              {p}
            </button>
          ))}
          <span style={TAG}>Focus</span>
          <button type="button" onClick={() => setFocusMode(focusMode === "inline" ? "navigation" : "inline")} style={BTN}>
            {focusMode}
          </button>
          <button type="button" onClick={() => setReduced(!reduced)} style={{ ...BTN, color: reduced ? "var(--ta-accent-1)" : undefined }} aria-pressed={reduced}>
            reduced motion: {reduced ? "on" : "off"}
          </button>
        </div>

        {/* THE SURFACE */}
        <div style={{ border: "1px solid var(--ta-border-subtle)", borderRadius: "var(--ta-radius-2)", overflow: "clip" }}>
          <SubjectSwitchSurface subjects={subjects} initialId={initialId} focusMode={focusMode} devForceTier={forced} devPrep={prep} onTelemetry={setTelemetry} apiRef={api} />
        </div>

        {/* phase + telemetry */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--ta-space-4)", marginTop: "var(--ta-space-4)" }}>
          <div>
            <p style={TAG}>Live phase</p>
            <p data-switch-livephase style={{ ...MONO, fontSize: "var(--ta-text-lg)", color: "var(--ta-accent-1)" }}>{livePhase}</p>
            <p style={TAG}>Announcement transcript</p>
            <ul data-switch-transcript style={{ ...MONO, paddingLeft: 16, margin: 0 }}>
              {(telemetry?.transcript ?? []).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <p style={TAG}>Last transition</p>
            <pre data-switch-telemetry style={{ ...MONO, margin: 0, whiteSpace: "pre-wrap" }}>
              {telemetry
                ? `tier: ${telemetry.tier}\nceremony: ${telemetry.ceremony}\napproach: ${telemetry.approach}\nprep: ${telemetry.prepMs}ms\nworst frame: ${telemetry.worstFrameMs}ms\nlong tasks >50ms: ${telemetry.longTasks}\ntrigger→interactive: ${telemetry.triggerToInteractiveMs}ms\ntrigger→settle: ${telemetry.triggerToSettleMs}ms\nwhy: ${telemetry.reasons.join("; ")}`
                : "—"}
            </pre>
          </div>
        </div>

        {/* interruption panel */}
        <h2 style={H2}>Interruption</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ta-space-2)" }}>
          <button type="button" onClick={interruptMidFlight} style={BTN}>switch again mid-flight</button>
          <button type="button" onClick={rapid5} style={BTN}>switch 5x rapidly</button>
          <button type="button" onClick={() => { api.current?.abort(); push("abort → resolved to stable state"); }} style={BTN}>abort</button>
          <button type="button" onClick={backgroundTab} style={BTN}>background the tab</button>
        </div>
        <pre data-switch-log style={{ ...MONO, marginTop: "var(--ta-space-2)", whiteSpace: "pre-wrap" }}>{log.join("\n")}</pre>

        <h2 style={H2}>Degradation ladder — selection logic</h2>
        <p style={NOTE}>
          Thresholds: desktop = hardwareConcurrency &gt; {THRESHOLDS.desktopMinCores} AND width ≥ {THRESHOLDS.desktopMinWidth} AND fine
          pointer; avg frame &gt; {THRESHOLDS.frameOkMs}ms downgrades one step; &gt; {THRESHOLDS.frameBadMs}ms → instant. prefers-reduced-motion,
          failing prep, or rapid repeat → instant. Ceremony: first entry full, subsequent shortened (0.6x), rapid shortest (instant). The tier
          control above forces a tier for verification without changing OS/hardware.
        </p>

        <h2 style={H2}>Real vs deferred</h2>
        <ul style={{ ...NOTE, paddingLeft: 20 }}>
          <li>REAL: the state machine, ceremony rationing, degradation ladder, layered crossfade + small-element accent interpolation, announcement, focus management, interruption behaviour, budgets and frame readout.</li>
          <li>DEFERRED: route integration (3.5), ambience and 3D (3.5 / Phase 4). The switch drives the 3.3 motif layers that already exist; nothing here is stubbed.</li>
        </ul>
      </main>
    </div>
  );
}
